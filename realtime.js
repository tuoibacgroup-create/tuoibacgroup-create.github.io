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
  let heartbeatTimer = null;
  let subscribedMatchIds = new Set();

  // Live synced stores
  const presenceByTable = {}; // { [tableKey]: { [clientId]: peerObj } }
  const checkinsToday = {};   // { [clientId]: { clientId, name, age, provinceId, provinceShort, mood, ts } }
  const matchesById = {};     // { [matchId]: matchObj }
  const sharedPoems = {};     // { [poemId]: poemObj }
  const seenMsgIds = new Set();

  const listeners = {
    status: [],
    presence: [],
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
      mqttClient.subscribe(`${TOPIC_ROOT}/checkins/${dayKey}/+`, { qos: 0 });
      mqttClient.subscribe(`${TOPIC_ROOT}/poems/+`, { qos: 0 });

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
    }, HEARTBEAT_MS);

    window.addEventListener("beforeunload", () => {
      clearMyPresence();
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

  function sendTableMessage(tableKey, speaker, text, ritual, recentLogSlice) {
    const cleanKey = String(tableKey || activeTableKey || "phong-tra-ban-1").replace(/[^a-zA-Z0-9_-]/g, "_");
    const msg = {
      msgId: `${clientId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tableKey: cleanKey,
      clientId,
      speaker,
      text,
      ritual: ritual || null,
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

  function getPresenceSnapshot() {
    prunePresence();
    let totalOtherPeers = 0;
    const byTableCounts = {};
    Object.keys(presenceByTable).forEach((tKey) => {
      const others = Object.keys(presenceByTable[tKey]).filter((cid) => cid !== clientId);
      byTableCounts[tKey] = others.length;
      totalOtherPeers += others.length;
    });
    return { totalOtherPeers, byTableCounts };
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
    sendTableMessage,
    publishMorningCheckin,
    getCheckinsSummary,
    subscribeMatch,
    publishMatchState,
    getMatch,
    publishPoem,
    getSharedPoems,
    wipeMyCloudData
  };
})();
