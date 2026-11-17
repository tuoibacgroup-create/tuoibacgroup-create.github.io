window.TuoiBacRealtime = (function () {
  const CLIENT_KEY = "tuoi_bac_client_id";
  const SUPABASE_CFG_KEY = "tuoi_bac_supabase_cfg";
  const TOPIC_ROOT = "tuoibac/prod/v1";
  const WSS_BROKERS = [
    "wss://broker.emqx.io:8084/mqtt",
    "wss://broker.hivemq.com:8884/mqtt"
  ];
  const PRESENCE_TTL_MS = 85000;
  const HEARTBEAT_MS = 22000;

  let clientId = initClientId();
  let mqttClient = null;
  let brokerIdx = 0;
  let sbClient = null;
  let sbChannel = null;
  let bc = null;

  let connected = false;
  let providerName = "Đang kết nối...";
  let activeTableKey = null;
  let myPresencePayload = null;
  let myGlobalOnlinePayload = null;
  let myMemberCode = "";
  let heartbeatTimer = null;
  let subscribedMatchIds = new Set();
  const accountLookupWaiters = {}; // { [accountHash]: [cb, ...] }

  // Live synced stores
  const presenceByTable = {}; // { [tableKey]: { [clientId]: peerObj } }
  const onlinePeers = {};     // { [peerKey]: { clientId, memberCode, name, age, province, where, roomId, tableIdx, ts } }
  const sharedGroups = {};    // { [groupId]: groupObj }
  const directoryByCode = {}; // { [memberCode]: summaryObj }
  const accountsCache = {};   // { [accountHash]: accountSnapshotObj }
  const checkinsToday = {};   // { [clientId]: { clientId, name, age, provinceId, provinceShort, mood, ts } }
  const matchesById = {};     // { [matchId]: matchObj }
  const sharedPoems = {};     // { [poemId]: poemObj }
  const memberLogsById = {};  // { [logId]: logEntry }
  const customTablesByKey = {}; // { [tableKey]: customMetaObj }
  const templePrayersById = {}; // { [id]: prayerObj }
  const seenMsgIds = new Set();

  const listeners = {
    status: [],
    presence: [],
    online: [],
    groups: [],
    friends: [],
    memberLogs: [],
    telemetry: [],
    tableMeta: [],
    temple: [],
    chat: [],
    tableLog: [],
    checkins: [],
    match: [],
    poems: []
  };

  function initClientId() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const devSlot = params.get("may");
      if (devSlot) {
        const slotKey = `${CLIENT_KEY}_${devSlot}`;
        let sid = sessionStorage.getItem(slotKey);
        if (!sid) {
          sid = "tb_" + devSlot + "_" + Math.random().toString(36).slice(2, 8);
          sessionStorage.setItem(slotKey, sid);
        }
        return sid;
      }
      let saved = localStorage.getItem(CLIENT_KEY);
      if (!saved) {
        saved = "tb_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        localStorage.setItem(CLIENT_KEY, saved);
      }
      return saved;
    } catch (e) {
      return "tb_" + Math.random().toString(36).slice(2, 10);
    }
  }

  function getTodayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function on(event, fn) {
    if (listeners[event]) listeners[event].push(fn);
  }

  function emit(event, payload) {
    (listeners[event] || []).forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        // Ignore listener error
      }
    });
  }

  function getSupabaseConfig() {
    try {
      if (window.TUOIBAC_SUPABASE_CONFIG && window.TUOIBAC_SUPABASE_CONFIG.url && window.TUOIBAC_SUPABASE_CONFIG.anonKey) {
        return window.TUOIBAC_SUPABASE_CONFIG;
      }
      const raw = localStorage.getItem(SUPABASE_CFG_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.url && parsed.anonKey) return parsed;
    } catch (e) {}
    return null;
  }

  function saveSupabaseConfig(url, anonKey) {
    try {
      if (!url || !anonKey) {
        localStorage.removeItem(SUPABASE_CFG_KEY);
      } else {
        localStorage.setItem(SUPABASE_CFG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
      }
    } catch (e) {}
    reconnect();
  }

  function prunePresence() {
    const now = Date.now();
    let changed = false;
    Object.keys(presenceByTable).forEach((tKey) => {
      const map = presenceByTable[tKey];
      Object.keys(map).forEach((cid) => {
        if (now - (map[cid].ts || 0) > PRESENCE_TTL_MS) {
          delete map[cid];
          changed = true;
        }
      });
    });
    if (changed) emit("presence", getPresenceSnapshot());

    let onlineChanged = false;
    Object.keys(onlinePeers).forEach((pkey) => {
      if (now - (onlinePeers[pkey].ts || 0) > PRESENCE_TTL_MS) {
        delete onlinePeers[pkey];
        onlineChanged = true;
      }
    });
    if (onlineChanged) emit("online", getOnlinePeers());
  }

  function handleIncomingPacket(kind, payload) {
    if (!payload) return;
    if (kind === "presence") {
      const { tableKey, peer, removed } = payload;
      if (!tableKey || !peer || !peer.clientId) return;
      if (!presenceByTable[tableKey]) presenceByTable[tableKey] = {};
      if (removed) {
        delete presenceByTable[tableKey][peer.clientId];
      } else if (Date.now() - (peer.ts || Date.now()) <= PRESENCE_TTL_MS) {
        presenceByTable[tableKey][peer.clientId] = peer;
      }
      emit("presence", getPresenceSnapshot());
    } else if (kind === "chat") {
      if (!payload.msgId || seenMsgIds.has(payload.msgId)) return;
      if (seenMsgIds.size > 800) seenMsgIds.clear();
      seenMsgIds.add(payload.msgId);
      if (payload.clientId === clientId) return;
      emit("chat", payload);
    } else if (kind === "tableLog") {
      if (!payload.tableKey || !Array.isArray(payload.lines)) return;
      emit("tableLog", payload);
    } else if (kind === "checkin") {
      if (!payload.clientId || !payload.provinceId) return;
      checkinsToday[payload.clientId] = payload;
      emit("checkins", getCheckinsSummary());
    } else if (kind === "match") {
      if (!payload.matchId) return;
      const prev = matchesById[payload.matchId];
      if (!prev || (payload.updatedAt || 0) >= (prev.updatedAt || 0)) {
        matchesById[payload.matchId] = payload;
        emit("match", payload);
      }
    } else if (kind === "poem") {
      if (!payload.id) return;
      sharedPoems[payload.id] = payload;
      emit("poems", getSharedPoems());
    } else if (kind === "online") {
      if (!payload.peerKey) return;
      if (payload.removed) {
        delete onlinePeers[payload.peerKey];
      } else if (Date.now() - (payload.ts || Date.now()) <= PRESENCE_TTL_MS) {
        onlinePeers[payload.peerKey] = payload;
        if (payload.memberCode) {
          directoryByCode[payload.memberCode] = Object.assign({}, directoryByCode[payload.memberCode] || {}, payload);
        }
      }
      emit("online", getOnlinePeers());
    } else if (kind === "group") {
      if (!payload.id) return;
      const prev = sharedGroups[payload.id];
      if (!prev || (payload.updatedAt || 0) >= (prev.updatedAt || 0)) {
        sharedGroups[payload.id] = payload;
        emit("groups", getSharedGroups());
      }
    } else if (kind === "directory") {
      if (!payload.memberCode) return;
      directoryByCode[payload.memberCode] = payload;
    } else if (kind === "friend") {
      if (!payload.toCode || !payload.fromCode) return;
      emit("friends", payload);
    } else if (kind === "account") {
      if (!payload.accountHash) return;
      accountsCache[payload.accountHash] = payload;
      const waiters = accountLookupWaiters[payload.accountHash];
      if (Array.isArray(waiters) && waiters.length > 0) {
        delete accountLookupWaiters[payload.accountHash];
        waiters.forEach((fn) => {
          try {
            fn(payload);
          } catch (e) {}
        });
      }
    } else if (kind === "memberLog") {
      if (!payload.id) return;
      memberLogsById[payload.id] = payload;
      emit("memberLogs", getMemberLogs());
    } else if (kind === "telemetry") {
      if (!payload.id) return;
      if (payload.clientId === clientId) return;
      if (window.TuoiBacTelemetry && typeof window.TuoiBacTelemetry.ingestRemoteEvent === "function") {
        window.TuoiBacTelemetry.ingestRemoteEvent(payload);
      }
      emit("telemetry", payload);
    } else if (kind === "tableMeta") {
      if (!payload.tableKey) return;
      customTablesByKey[payload.tableKey] = payload;
      emit("tableMeta", customTablesByKey);
    } else if (kind === "temple") {
      if (!payload.id) return;
      if (payload.prayerText) {
        templePrayersById[payload.id] = payload;
      }
      emit("temple", payload);
    }
  }

  function setupBroadcastChannel() {
    if (typeof BroadcastChannel === "undefined") return;
    try {
      bc = new BroadcastChannel("tuoibac_realtime_v1");
      bc.onmessage = (ev) => {
        if (ev && ev.data && ev.data.kind) {
          handleIncomingPacket(ev.data.kind, ev.data.payload);
        }
      };
    } catch (e) {}
  }

  function postLocalBroadcast(kind, payload) {
    if (!bc) return;
    try {
      bc.postMessage({ kind, payload });
    } catch (e) {}
  }

  function connectSupabase(cfg) {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      connectWssRelay();
      return;
    }
    try {
      sbClient = window.supabase.createClient(cfg.url, cfg.anonKey);
      providerName = "Supabase Realtime";
      sbChannel = sbClient.channel("tuoibac-main", {
        config: { presence: { key: clientId } }
      });

      sbChannel
        .on("broadcast", { event: "tb_event" }, ({ payload }) => {
          if (payload && payload.kind) {
            handleIncomingPacket(payload.kind, payload.data);
          }
        })
        .on("presence", { event: "sync" }, () => {
          const state = sbChannel.presenceState();
          Object.keys(presenceByTable).forEach((k) => delete presenceByTable[k]);
          Object.keys(state).forEach((cid) => {
            const list = state[cid] || [];
            const latest = list[list.length - 1];
            if (latest && latest.tableKey) {
              if (!presenceByTable[latest.tableKey]) presenceByTable[latest.tableKey] = {};
              presenceByTable[latest.tableKey][cid] = latest;
            }
          });
          emit("presence", getPresenceSnapshot());
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            connected = true;
            emit("status", getStatus());
            if (myPresencePayload && activeTableKey) {
              await sbChannel.track(Object.assign({}, myPresencePayload, { tableKey: activeTableKey }));
            }
            // Pull today's checkins & poems from Postgres if tables exist
            const dayKey = getTodayKey();
            sbClient
              .from("morning_checkins")
              .select("*")
              .eq("day_key", dayKey)
              .then(({ data }) => {
                if (Array.isArray(data)) {
                  data.forEach((row) => {
                    checkinsToday[row.client_id] = {
                      clientId: row.client_id,
                      name: row.user_name,
                      age: row.age,
                      provinceId: row.province_id,
                      provinceShort: row.province_short,
                      mood: row.mood,
                      ts: new Date(row.updated_at).getTime()
                    };
                  });
                  emit("checkins", getCheckinsSummary());
                }
              })
              .catch(() => {});
          }
        });
    } catch (e) {
      sbClient = null;
      connectWssRelay();
    }
  }

  function connectWssRelay() {
    if (typeof window.mqtt === "undefined") {
      providerName = "Cục bộ (Đang tải thư viện mạng)";
      emit("status", getStatus());
      return;
    }
    const brokerUrl = WSS_BROKERS[brokerIdx % WSS_BROKERS.length];
    const willTopic = activeTableKey
      ? `${TOPIC_ROOT}/presence/${activeTableKey}/${clientId}`
      : `${TOPIC_ROOT}/status/${clientId}`;

    try {
      mqttClient = window.mqtt.connect(brokerUrl, {
        clientId: `${clientId}_${Math.random().toString(36).slice(2, 6)}`,
        clean: true,
        connectTimeout: 6500,
        reconnectPeriod: 4000,
        will: {
          topic: willTopic,
          payload: "",
          qos: 0,
          retain: Boolean(activeTableKey)
        }
      });
    } catch (err) {
      providerName = "Ngoại tuyến tạm thời";
      emit("status", getStatus());
      return;
    }

    mqttClient.on("connect", () => {
      connected = true;
      providerName = brokerUrl.includes("emqx") ? "Phòng Chung Trực Tuyến (WSS)" : "Phòng Chung Dự Phòng (WSS)";
      emit("status", getStatus());

      const dayKey = getTodayKey();
      mqttClient.subscribe(`${TOPIC_ROOT}/presence/+/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/online/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/groups/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/directory/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/checkins/${dayKey}/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/poems/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/tablemeta/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/temple/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/memberlogs/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/telemetry/+`, { qos: 0 });
      if (myMemberCode) {
        mqttClient.subscribe(`${TOPIC_ROOT}/friends/${myMemberCode}/+`, { qos: 1 });
      }
      Object.keys(accountLookupWaiters).forEach((ah) => {
        mqttClient.subscribe(`${TOPIC_ROOT}/accounts/${ah}`, { qos: 1 });
      });

      if (myGlobalOnlinePayload) {
        publishGlobalOnlineNow();
      }
      if (activeTableKey) {
        mqttClient.subscribe(`${TOPIC_ROOT}/chat/${activeTableKey}`, { qos: 0 });
        mqttClient.subscribe(`${TOPIC_ROOT}/log/${activeTableKey}`, { qos: 0 });
        publishPresenceNow();
      }
      subscribedMatchIds.forEach((mid) => {
        mqttClient.subscribe(`${TOPIC_ROOT}/matches/${mid}`, { qos: 1 });
      });
    });

    mqttClient.on("error", () => {
      if (!connected) {
        brokerIdx = (brokerIdx + 1) % WSS_BROKERS.length;
      }
    });

    mqttClient.on("close", () => {
      connected = false;
      emit("status", getStatus());
    });

    mqttClient.on("message", (topic, rawBuf) => {
      const str = rawBuf ? rawBuf.toString() : "";
      const rel = topic.slice(TOPIC_ROOT.length + 1);
      const parts = rel.split("/");

      if (parts[0] === "presence" && parts.length >= 3) {
        const tableKey = parts[1];
        const cid = parts[2];
        if (!str) {
          handleIncomingPacket("presence", { tableKey, peer: { clientId: cid }, removed: true });
          return;
        }
        try {
          const peer = JSON.parse(str);
          handleIncomingPacket("presence", { tableKey, peer, removed: false });
        } catch (e) {}
      } else if (parts[0] === "online" && parts[1]) {
        const pkey = parts[1];
        if (!str) {
          handleIncomingPacket("online", { peerKey: pkey, removed: true });
          return;
        }
        try {
          handleIncomingPacket("online", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "groups" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("group", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "directory" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("directory", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "friends" && parts.length >= 3) {
        if (!str) return;
        try {
          handleIncomingPacket("friend", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "accounts" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("account", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "chat" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("chat", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "log" && parts[1]) {
        if (!str) return;
        try {
          const lines = JSON.parse(str);
          handleIncomingPacket("tableLog", { tableKey: parts[1], lines });
        } catch (e) {}
      } else if (parts[0] === "checkins" && parts.length >= 3) {
        if (!str) return;
        try {
          handleIncomingPacket("checkin", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "matches" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("match", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "poems" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("poem", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "tablemeta" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("tableMeta", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "temple" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("temple", JSON.parse(str));
        } catch (e) {}
      } else if (parts[0] === "memberlogs" && parts[1]) {
        if (!str) return;
        try {
          const arr = JSON.parse(str);
          if (Array.isArray(arr)) {
            arr.forEach((entry) => handleIncomingPacket("memberLog", entry));
          } else {
            handleIncomingPacket("memberLog", arr);
          }
        } catch (e) {}
      } else if (parts[0] === "telemetry" && parts[1]) {
        if (!str) return;
        try {
          handleIncomingPacket("telemetry", JSON.parse(str));
        } catch (e) {}
      }
    });
  }

  function start() {
    setupBroadcastChannel();
    const cfg = getSupabaseConfig();
    if (cfg) {
      connectSupabase(cfg);
    } else {
      connectWssRelay();
    }
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      prunePresence();
      if (activeTableKey && myPresencePayload) {
        publishPresenceNow();
      }
      if (myGlobalOnlinePayload) {
        publishGlobalOnlineNow();
      }
    }, HEARTBEAT_MS);

    window.addEventListener("beforeunload", () => {
      clearMyPresence();
      clearGlobalOnline();
    });
  }

  function reconnect() {
    try {
      if (mqttClient) mqttClient.end(true);
    } catch (e) {}
    try {
      if (sbClient && sbChannel) sbClient.removeChannel(sbChannel);
    } catch (e) {}
    mqttClient = null;
    sbClient = null;
    sbChannel = null;
    connected = false;
    const cfg = getSupabaseConfig();
    if (cfg) connectSupabase(cfg);
    else connectWssRelay();
  }

  function clearMyPresence() {
    if (!activeTableKey) return;
    const oldTable = activeTableKey;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/presence/${oldTable}/${clientId}`, "", { qos: 0, retain: true });
    }
    if (sbChannel) {
      sbChannel.untrack().catch(() => {});
    }
    postLocalBroadcast("presence", { tableKey: oldTable, peer: { clientId }, removed: true });
    if (presenceByTable[oldTable]) {
      delete presenceByTable[oldTable][clientId];
    }
  }

  function publishPresenceNow() {
    if (!activeTableKey || !myPresencePayload) return;
    const pkt = Object.assign({}, myPresencePayload, {
      clientId,
      ts: Date.now()
    });
    if (!presenceByTable[activeTableKey]) presenceByTable[activeTableKey] = {};
    presenceByTable[activeTableKey][clientId] = pkt;

    if (mqttClient && connected) {
      mqttClient.publish(
        `${TOPIC_ROOT}/presence/${activeTableKey}/${clientId}`,
        JSON.stringify(pkt),
        { qos: 0, retain: true }
      );
    }
    if (sbChannel && connected) {
      sbChannel.track(Object.assign({}, pkt, { tableKey: activeTableKey })).catch(() => {});
    }
    postLocalBroadcast("presence", { tableKey: activeTableKey, peer: pkt, removed: false });
  }

  function joinTableChannel(tableKey, userPeerInfo, enabled) {
    if (enabled === false) {
      clearMyPresence();
      activeTableKey = null;
      return;
    }
    const cleanKey = String(tableKey || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    if (activeTableKey && activeTableKey !== cleanKey) {
      if (mqttClient && connected) {
        mqttClient.unsubscribe(`${TOPIC_ROOT}/chat/${activeTableKey}`);
        mqttClient.unsubscribe(`${TOPIC_ROOT}/log/${activeTableKey}`);
      }
      clearMyPresence();
    }
    activeTableKey = cleanKey;
    myPresencePayload = Object.assign({}, userPeerInfo, { clientId, isRealPeer: true });

    if (mqttClient && connected && activeTableKey) {
      mqttClient.subscribe(`${TOPIC_ROOT}/chat/${activeTableKey}`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/log/${activeTableKey}`, { qos: 0 });
    }
    publishPresenceNow();
    emit("presence", getPresenceSnapshot());
  }

  function leaveTableChannel() {
    if (activeTableKey && mqttClient && connected) {
      mqttClient.unsubscribe(`${TOPIC_ROOT}/chat/${activeTableKey}`);
      mqttClient.unsubscribe(`${TOPIC_ROOT}/log/${activeTableKey}`);
    }
    clearMyPresence();
    activeTableKey = null;
    emit("presence", getPresenceSnapshot());
  }

  function sendTableMessage(tableKey, speaker, text, ritual, recentLogSlice, extraMeta) {
    const cleanKey = String(tableKey || activeTableKey || "phong-tra-ban-1").replace(/[^a-zA-Z0-9_-]/g, "_");
    const msg = {
      msgId: `${clientId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tableKey: cleanKey,
      clientId,
      speaker,
      text,
      ritual: ritual || null,
      stickerId: (extraMeta && extraMeta.stickerId) || null,
      stickerLabel: (extraMeta && extraMeta.stickerLabel) || null,
      ts: Date.now()
    };
    seenMsgIds.add(msg.msgId);

    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/chat/${cleanKey}`, JSON.stringify(msg), { qos: 0, retain: false });
      if (Array.isArray(recentLogSlice)) {
        mqttClient.publish(
          `${TOPIC_ROOT}/log/${cleanKey}`,
          JSON.stringify(recentLogSlice.slice(-8)),
          { qos: 0, retain: true }
        );
      }
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "chat", data: msg } });
      if (sbClient) {
        sbClient
          .from("tea_messages")
          .insert({
            id: msg.msgId,
            table_key: cleanKey,
            client_id: clientId,
            speaker,
            body: text,
            ritual: ritual || null
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("chat", msg);
  }

  function publishMorningCheckin(info) {
    const dayKey = getTodayKey();
    const record = {
      clientId,
      name: info.name,
      age: info.age,
      provinceId: info.provinceId,
      provinceShort: info.provinceShort,
      mood: info.mood,
      ts: Date.now()
    };
    checkinsToday[clientId] = record;
    emit("checkins", getCheckinsSummary());

    if (mqttClient && connected) {
      mqttClient.publish(
        `${TOPIC_ROOT}/checkins/${dayKey}/${clientId}`,
        JSON.stringify(record),
        { qos: 0, retain: true }
      );
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "checkin", data: record } });
      if (sbClient) {
        sbClient
          .from("morning_checkins")
          .upsert({
            day_key: dayKey,
            client_id: clientId,
            user_name: record.name,
            age: record.age,
            province_id: record.provinceId,
            province_short: record.provinceShort,
            mood: record.mood
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("checkin", record);
  }

  function subscribeMatch(matchId) {
    if (!matchId) return;
    const cleanId = String(matchId).replace(/[^a-zA-Z0-9_-]/g, "");
    subscribedMatchIds.add(cleanId);
    if (mqttClient && connected) {
      mqttClient.subscribe(`${TOPIC_ROOT}/matches/${cleanId}`, { qos: 1 });
    }
    if (sbClient) {
      sbClient
        .from("async_matches")
        .select("*")
        .eq("match_id", cleanId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            handleIncomingPacket("match", {
              matchId: data.match_id,
              kind: data.kind,
              hostId: data.host_id,
              hostName: data.host_name,
              guestId: data.guest_id,
              guestName: data.guest_name,
              turn: data.turn,
              statusText: data.status_text,
              payload: data.payload,
              moveCount: data.move_count,
              updatedAt: new Date(data.updated_at).getTime()
            });
          }
        })
        .catch(() => {});
    }
  }

  function publishMatchState(matchObj) {
    if (!matchObj || !matchObj.matchId) return;
    const cleanId = String(matchObj.matchId).replace(/[^a-zA-Z0-9_-]/g, "");
    const pkt = Object.assign({}, matchObj, {
      matchId: cleanId,
      updatedAt: Date.now()
    });
    matchesById[cleanId] = pkt;
    subscribedMatchIds.add(cleanId);

    if (mqttClient && connected) {
      mqttClient.subscribe(`${TOPIC_ROOT}/matches/${cleanId}`, { qos: 1 });
      mqttClient.publish(`${TOPIC_ROOT}/matches/${cleanId}`, JSON.stringify(pkt), { qos: 1, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "match", data: pkt } });
      if (sbClient) {
        sbClient
          .from("async_matches")
          .upsert({
            match_id: cleanId,
            kind: pkt.kind,
            host_id: pkt.hostId,
            host_name: pkt.hostName,
            guest_id: pkt.guestId || null,
            guest_name: pkt.guestName || null,
            turn: pkt.turn,
            status_text: pkt.statusText || "",
            payload: pkt.payload || {},
            move_count: pkt.moveCount || 0
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("match", pkt);
  }

  function publishPoem(poemObj) {
    if (!poemObj || !poemObj.id) return;
    const pkt = Object.assign({}, poemObj, { clientId, ts: Date.now() });
    sharedPoems[pkt.id] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/poems/${pkt.id}`, JSON.stringify(pkt), { qos: 0, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "poem", data: pkt } });
      if (sbClient) {
        sbClient
          .from("poems")
          .upsert({
            id: pkt.id,
            client_id: clientId,
            title: pkt.title,
            author: pkt.author,
            reciter: pkt.reciter,
            lines: pkt.lines,
            flowers: pkt.flowers || 1
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("poem", pkt);
  }

  function wipeMyCloudData() {
    clearMyPresence();
    clearGlobalOnline();
    const dayKey = getTodayKey();
    delete checkinsToday[clientId];
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/checkins/${dayKey}/${clientId}`, "", { qos: 0, retain: true });
    }
    if (sbClient) {
      sbClient.from("morning_checkins").delete().eq("client_id", clientId).then(() => {}).catch(() => {});
    }
  }

  function getPeersAtTable(tableKey) {
    prunePresence();
    const cleanKey = String(tableKey || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const map = presenceByTable[cleanKey] || {};
    return Object.keys(map)
      .filter((cid) => cid !== clientId)
      .map((cid) => map[cid]);
  }

  function publishGlobalOnlineNow() {
    if (!myGlobalOnlinePayload) return;
    const peerKey = String(myGlobalOnlinePayload.memberCode || clientId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const pkt = Object.assign({}, myGlobalOnlinePayload, {
      peerKey,
      clientId,
      ts: Date.now()
    });
    onlinePeers[peerKey] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/online/${peerKey}`, JSON.stringify(pkt), { qos: 0, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "online", data: pkt } });
    }
    postLocalBroadcast("online", pkt);
  }

  function publishGlobalOnline(peerMeta) {
    if (!peerMeta) return;
    // If memberCode changed from guest clientId to TB-xxxx, remove stale guest key
    if (myGlobalOnlinePayload && myGlobalOnlinePayload.memberCode !== peerMeta.memberCode) {
      clearGlobalOnline();
    }
    myGlobalOnlinePayload = Object.assign({}, peerMeta);
    publishGlobalOnlineNow();
  }

  function clearGlobalOnline() {
    if (!myGlobalOnlinePayload) return;
    const peerKey = String(myGlobalOnlinePayload.memberCode || clientId).replace(/[^a-zA-Z0-9_-]/g, "_");
    myGlobalOnlinePayload = null;
    delete onlinePeers[peerKey];
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/online/${peerKey}`, "", { qos: 0, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "online", data: { peerKey, removed: true } } });
    }
    postLocalBroadcast("online", { peerKey, removed: true });
  }

  function getOnlinePeers() {
    prunePresence();
    return Object.values(onlinePeers)
      .filter((p) => p && p.clientId !== clientId && (!myMemberCode || p.memberCode !== myMemberCode))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  function setMyMemberCode(code) {
    const clean = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!clean || clean === myMemberCode) return;
    myMemberCode = clean;
    if (mqttClient && connected) {
      mqttClient.subscribe(`${TOPIC_ROOT}/friends/${myMemberCode}/+`, { qos: 1 });
    }
  }

  function publishMemberDirectory(entry) {
    if (!entry || !entry.memberCode) return;
    const cleanCode = String(entry.memberCode).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const pkt = Object.assign({}, entry, { memberCode: cleanCode, clientId, ts: Date.now() });
    directoryByCode[cleanCode] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/directory/${cleanCode}`, JSON.stringify(pkt), { qos: 0, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "directory", data: pkt } });
    }
    postLocalBroadcast("directory", pkt);
  }

  function getMemberByCode(code) {
    const cleanCode = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    return directoryByCode[cleanCode] || null;
  }

  function publishGroup(groupObj) {
    if (!groupObj || !groupObj.id) return;
    const cleanId = String(groupObj.id).replace(/[^a-zA-Z0-9_-]/g, "-");
    const pkt = Object.assign({}, groupObj, {
      id: cleanId,
      updatedAt: Date.now()
    });
    sharedGroups[cleanId] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/groups/${cleanId}`, JSON.stringify(pkt), { qos: 1, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "group", data: pkt } });
      if (sbClient) {
        sbClient
          .from("community_groups")
          .upsert({
            id: cleanId,
            name: pkt.name,
            short_name: pkt.shortName || pkt.name,
            category: pkt.category || "veteran",
            subtitle: pkt.subtitle || "",
            motto: pkt.motto || "",
            leader_name: pkt.leaderName || "",
            join_pin: pkt.joinPin || "",
            unit_spec: pkt.unitSpec || {},
            payload_json: pkt
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("group", pkt);
  }

  function getSharedGroups() {
    return Object.values(sharedGroups).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function publishFriendSignal(targetCode, signalObj) {
    const toCode = String(targetCode || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const fromCode = String((signalObj && signalObj.fromCode) || myMemberCode || clientId)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");
    if (!toCode || !fromCode) return;
    const pkt = Object.assign({}, signalObj, {
      toCode,
      fromCode,
      ts: Date.now()
    });
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/friends/${toCode}/${fromCode}`, JSON.stringify(pkt), { qos: 1, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "friend", data: pkt } });
      if (sbClient) {
        const pairKey = [fromCode, toCode].sort().join("__");
        sbClient
          .from("friend_links")
          .upsert({
            pair_key: pairKey,
            from_code: fromCode,
            to_code: toCode,
            payload_json: pkt
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("friend", pkt);
  }

  function publishAccountBackup(accountHash, snapshotObj) {
    const cleanHash = String(accountHash || "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanHash || !snapshotObj) return;
    const pkt = Object.assign({}, snapshotObj, {
      accountHash: cleanHash,
      updatedAt: Date.now()
    });
    accountsCache[cleanHash] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/accounts/${cleanHash}`, JSON.stringify(pkt), { qos: 1, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "account", data: pkt } });
    }
    if (sbClient) {
      sbClient
        .from("member_accounts")
        .upsert({
          account_hash: cleanHash,
          member_code: pkt.memberCode || "",
          phone_masked: pkt.phoneMasked || "",
          honorific: pkt.honorific || "Anh",
          base_name: pkt.baseName || "",
          age: pkt.age || 65,
          province_id: pkt.provinceId || "ha-noi",
          snapshot_json: pkt
        })
        .then(() => {})
        .catch(() => {});
    }
    postLocalBroadcast("account", pkt);
  }

  function fetchAccountBackup(accountHash, callback) {
    const cleanHash = String(accountHash || "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanHash) {
      callback(null);
      return;
    }
    if (accountsCache[cleanHash]) {
      callback(accountsCache[cleanHash]);
      return;
    }

    let resolved = false;
    const finish = (res) => {
      if (resolved) return;
      resolved = true;
      callback(res || null);
    };

    if (!accountLookupWaiters[cleanHash]) accountLookupWaiters[cleanHash] = [];
    accountLookupWaiters[cleanHash].push(finish);

    if (mqttClient && connected) {
      mqttClient.subscribe(`${TOPIC_ROOT}/accounts/${cleanHash}`, { qos: 1 });
    }
    if (sbClient) {
      sbClient
        .from("member_accounts")
        .select("*")
        .eq("account_hash", cleanHash)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.snapshot_json) {
            accountsCache[cleanHash] = data.snapshot_json;
            finish(data.snapshot_json);
          }
        })
        .catch(() => {});
    }

    setTimeout(() => {
      if (accountLookupWaiters[cleanHash]) {
        accountLookupWaiters[cleanHash] = accountLookupWaiters[cleanHash].filter((fn) => fn !== finish);
      }
      finish(accountsCache[cleanHash] || null);
    }, 1350);
  }

  function getPresenceSnapshot() {
    prunePresence();
    const seenCids = new Set();
    const byTableCounts = {};
    Object.keys(presenceByTable).forEach((tKey) => {
      const others = Object.keys(presenceByTable[tKey]).filter((cid) => cid !== clientId);
      byTableCounts[tKey] = others.length;
      others.forEach((cid) => seenCids.add(cid));
    });
    Object.values(onlinePeers).forEach((p) => {
      if (p && p.clientId && p.clientId !== clientId) {
        seenCids.add(p.clientId);
      }
    });
    return { totalOtherPeers: seenCids.size, byTableCounts };
  }

  function getCheckinsSummary() {
    const countsByProvince = {};
    const recentList = Object.values(checkinsToday).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    recentList.forEach((item) => {
      countsByProvince[item.provinceId] = (countsByProvince[item.provinceId] || 0) + 1;
    });
    return {
      totalRealCheckins: recentList.length,
      countsByProvince,
      recentList: recentList.slice(0, 8)
    };
  }

  function getMatch(matchId) {
    return matchesById[matchId] || null;
  }

  function publishMemberLog(entry, recentMemberSlice) {
    if (!entry || !entry.id) return;
    const pkt = Object.assign({}, entry, {
      clientId,
      ts: entry.ts || Date.now()
    });
    memberLogsById[pkt.id] = pkt;
    const ownerKey = String(pkt.memberCode || clientId).replace(/[^a-zA-Z0-9_-]/g, "_");
    if (mqttClient && connected) {
      const slicePayload = Array.isArray(recentMemberSlice) ? recentMemberSlice.slice(0, 12) : [pkt];
      mqttClient.publish(`${TOPIC_ROOT}/memberlogs/${ownerKey}`, JSON.stringify(slicePayload), { qos: 0, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "memberLog", data: pkt } });
      if (sbClient) {
        sbClient
          .from("member_activity_logs")
          .insert({
            id: pkt.id,
            member_code: pkt.memberCode || clientId,
            client_id: clientId,
            user_name: pkt.userName || "",
            age: pkt.age || 65,
            province: pkt.province || "",
            seniority_tier: pkt.seniorityTier || "",
            action: pkt.action || "view",
            category: pkt.category || "",
            detail: pkt.detail || "",
            hour_of_day: typeof pkt.hour === "number" ? pkt.hour : new Date().getHours()
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("memberLog", pkt);
  }

  function getMemberLogs() {
    return Object.values(memberLogsById).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  function publishTableCustomMeta(tableKey, metaObj) {
    const cleanKey = String(tableKey || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!cleanKey || !metaObj) return;
    const pkt = Object.assign({}, metaObj, {
      tableKey: cleanKey,
      updatedAt: Date.now()
    });
    customTablesByKey[cleanKey] = pkt;
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/tablemeta/${cleanKey}`, JSON.stringify(pkt), { qos: 1, retain: true });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "tableMeta", data: pkt } });
      if (sbClient) {
        sbClient
          .from("custom_tea_tables")
          .upsert({
            table_key: cleanKey,
            room_id: pkt.roomId || "phong-tra",
            table_idx: pkt.tableIdx || 0,
            custom_name: pkt.customName || "",
            custom_topic: pkt.customTopic || "",
            host_name: pkt.hostName || "",
            host_code: pkt.hostCode || ""
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("tableMeta", pkt);
  }

  function getAllTableCustomMeta() {
    return Object.assign({}, customTablesByKey);
  }

  function publishTempleRitual(ritualObj) {
    if (!ritualObj) return;
    const id = ritualObj.id || `tmp_${clientId}_${Date.now()}`;
    const pkt = Object.assign({}, ritualObj, { id, clientId, ts: Date.now() });
    if (pkt.prayerText) {
      templePrayersById[id] = pkt;
    }
    const slotKey = pkt.prayerText ? `prayer_${String(pkt.memberCode || clientId).replace(/[^a-zA-Z0-9_-]/g, "_")}` : "live_bell";
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/temple/${slotKey}`, JSON.stringify(pkt), {
        qos: 0,
        retain: Boolean(pkt.prayerText)
      });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "temple", data: pkt } });
      if (sbClient && pkt.prayerText) {
        sbClient
          .from("temple_prayers")
          .upsert({
            id,
            member_code: pkt.memberCode || "",
            user_name: pkt.userName || "",
            province: pkt.province || "",
            ritual_kind: pkt.ritualKind || "incense",
            cushion_idx: typeof pkt.cushionIdx === "number" ? pkt.cushionIdx : 2,
            prayer_text: pkt.prayerText
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("temple", pkt);
  }

  function publishTelemetryEvent(evObj) {
    if (!evObj || !evObj.id) return;
    const pkt = Object.assign({}, evObj, { clientId });
    const ownerKey = String(pkt.memberCode || clientId).replace(/[^a-zA-Z0-9_-]/g, "_");
    if (mqttClient && connected) {
      mqttClient.publish(`${TOPIC_ROOT}/telemetry/${ownerKey}`, JSON.stringify(pkt), { qos: 0, retain: false });
    }
    if (sbChannel && connected) {
      sbChannel.send({ type: "broadcast", event: "tb_event", payload: { kind: "telemetry", data: pkt } });
      if (sbClient) {
        const m = pkt.meta || {};
        sbClient
          .from("member_telemetry_events")
          .insert({
            id: pkt.id,
            seq: pkt.seq || 0,
            member_code: pkt.memberCode || clientId,
            client_id: clientId,
            user_name: pkt.userName || "",
            age: pkt.age || 65,
            province: pkt.province || "",
            seniority_level: pkt.seniorityLevel || 0,
            seniority_title: pkt.seniorityTitle || "",
            hour_of_day: typeof pkt.hour === "number" ? pkt.hour : 6,
            day_of_week: typeof pkt.dayOfWeek === "number" ? pkt.dayOfWeek : 0,
            time_bucket: pkt.timeBucket || "sang_som_5_7",
            dwell_sec: pkt.dwellSec || 0,
            event_type: pkt.eventType || "interaction",
            module: pkt.module || "home",
            sub_action: pkt.subAction || "",
            input_method: m.inputMethod || "",
            word_count: m.wordCount || 0,
            payload_json: pkt
          })
          .then(() => {})
          .catch(() => {});
      }
    }
    postLocalBroadcast("telemetry", pkt);
  }

  function publishSafetyReport(reportObj) {
    if (!reportObj) return;
    if (sbClient) {
      sbClient
        .from("safety_reports")
        .insert({
          client_id: clientId,
          table_key: String(reportObj.tableKey || ""),
          reason: String(reportObj.reason || "").slice(0, 240)
        })
        .then(() => {})
        .catch(() => {});
    }
  }

  function getTemplePrayers() {
    return Object.values(templePrayersById).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  function getSharedPoems() {
    return Object.values(sharedPoems).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  function getStatus() {
    const snap = getPresenceSnapshot();
    return {
      clientId,
      connected,
      providerName,
      hasCustomSupabase: Boolean(getSupabaseConfig()),
      totalOtherPeers: snap.totalOtherPeers,
      activeTableKey
    };
  }

  return {
    start,
    reconnect,
    on,
    getClientId: () => clientId,
    getStatus,
    getSupabaseConfig,
    saveSupabaseConfig,
    joinTableChannel,
    leaveTableChannel,
    getPeersAtTable,
    getPresenceSnapshot,
    publishGlobalOnline,
    clearGlobalOnline,
    getOnlinePeers,
    setMyMemberCode,
    publishMemberDirectory,
    getMemberByCode,
    publishGroup,
    getSharedGroups,
    publishFriendSignal,
    publishAccountBackup,
    fetchAccountBackup,
    sendTableMessage,
    publishMorningCheckin,
    getCheckinsSummary,
    subscribeMatch,
    publishMatchState,
    getMatch,
    publishPoem,
    getSharedPoems,
    publishMemberLog,
    getMemberLogs,
    publishTelemetryEvent,
    publishSafetyReport,
    publishTableCustomMeta,
    getAllTableCustomMeta,
    publishTempleRitual,
    getTemplePrayers,
    wipeMyCloudData
  };
})();
