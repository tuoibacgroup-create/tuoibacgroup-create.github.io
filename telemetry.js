window.TuoiBacTelemetry = (function () {
  // ============================================================================
  // HỆ THỐNG AI TRACKING TOÀN THÀNH VIÊN 100% (FULL-FIDELITY TELEMETRY WAREHOUSE)
  // - Lưu trữ 100% sự kiện không giới hạn trong IndexedDB (tuoibac_telemetry_db_v1)
  // - Bộ đệm nóng 500 sự kiện + Ma trận thói quen 24h / Thứ / Kiểu Chat / Thời lượng
  // - Phục vụ tái sử dụng dữ liệu AI lâu dài: xuất JSONL (chuẩn huấn luyện AI), JSON, CSV
  // ============================================================================

  const URL_SLOT = (function () {
    try {
      return new URLSearchParams(window.location.search || "").get("may") || "";
    } catch (e) {
      return "";
    }
  })();

  const IDB_NAME = URL_SLOT ? `tuoibac_telemetry_db_v1_${URL_SLOT}` : "tuoibac_telemetry_db_v1";
  const IDB_STORE = "events";
  const HOT_KEY = URL_SLOT ? `tuoibac_tel_hot_v1_${URL_SLOT}` : "tuoibac_tel_hot_v1";
  const HABIT_KEY = URL_SLOT ? `tuoibac_tel_habits_v1_${URL_SLOT}` : "tuoibac_tel_habits_v1";
  const SEQ_KEY = URL_SLOT ? `tuoibac_tel_seq_v1_${URL_SLOT}` : "tuoibac_tel_seq_v1";
  const MAX_HOT = 500;

  const TIME_BUCKETS = [
    { id: "sang_som_5_7", label: "Sáng sớm (05h–07h)", from: 5, to: 7 },
    { id: "buoi_sang_8_10", label: "Buổi sáng (08h–10h)", from: 8, to: 10 },
    { id: "buoi_trua_11_13", label: "Buổi trưa (11h–13h)", from: 11, to: 13 },
    { id: "buoi_chieu_14_17", label: "Buổi chiều (14h–17h)", from: 14, to: 17 },
    { id: "buoi_toi_18_21", label: "Buổi tối (18h–21h)", from: 18, to: 21 },
    { id: "khuya_22_4", label: "Đêm khuya (22h–04h)", from: 22, to: 4 }
  ];

  let dbPromise = null;
  let hotEvents = loadHotEvents();
  let habitProfiles = loadHabitProfiles();
  let seqCounter = loadSeqCounter();
  let sessionStartTs = Date.now();
  let currentRoute = "home";
  let currentRouteEnteredAt = Date.now();
  let totalIdbCountEstimate = hotEvents.length;
  let onRemoteForward = null;

  function getTimeBucketId(hour) {
    const h = Number(hour) || 0;
    if (h >= 5 && h <= 7) return "sang_som_5_7";
    if (h >= 8 && h <= 10) return "buoi_sang_8_10";
    if (h >= 11 && h <= 13) return "buoi_trua_11_13";
    if (h >= 14 && h <= 17) return "buoi_chieu_14_17";
    if (h >= 18 && h <= 21) return "buoi_toi_18_21";
    return "khuya_22_4";
  }

  function getTimeBucketLabel(bucketId) {
    const found = TIME_BUCKETS.find((b) => b.id === bucketId);
    return found ? found.label : "Buổi sáng (05h–10h)";
  }

  function formatLocalDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function loadSeqCounter() {
    try {
      return Math.max(0, parseInt(localStorage.getItem(SEQ_KEY) || "0", 10) || 0);
    } catch (e) {
      return 0;
    }
  }

  function bumpSeqCounter() {
    seqCounter += 1;
    try {
      localStorage.setItem(SEQ_KEY, String(seqCounter));
    } catch (e) {}
    return seqCounter;
  }

  function loadHotEvents() {
    try {
      const raw = localStorage.getItem(HOT_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveHotEvents() {
    try {
      if (hotEvents.length > MAX_HOT) {
        hotEvents = hotEvents.slice(0, MAX_HOT);
      }
      localStorage.setItem(HOT_KEY, JSON.stringify(hotEvents));
    } catch (e) {
      hotEvents = hotEvents.slice(0, 150);
      try {
        localStorage.setItem(HOT_KEY, JSON.stringify(hotEvents));
      } catch (e2) {}
    }
  }

  function createEmptyHabitProfile(memberKey, ctx) {
    const info = ctx || {};
    return {
      memberKey,
      memberCode: info.memberCode || memberKey,
      userName: info.userName || "Hội viên",
      honorific: info.honorific || "Anh",
      age: info.age || 65,
      province: info.province || "Việt Nam",
      provinceId: info.provinceId || "ha-noi",
      isRegistered: Boolean(info.isRegistered),
      seniorityLevel: info.seniorityLevel || 0,
      seniorityTitle: info.seniorityTitle || "Khách Ghé Hiên Trà",
      cohortTag: info.cohortTag || "Khách ghé",
      firstSeenTs: Date.now(),
      lastSeenTs: Date.now(),
      totalEvents: 0,
      hourlyHist: new Array(24).fill(0),
      weekdayHist: new Array(7).fill(0),
      bucketCounts: {
        sang_som_5_7: 0,
        buoi_sang_8_10: 0,
        buoi_trua_11_13: 0,
        buoi_chieu_14_17: 0,
        buoi_toi_18_21: 0,
        khuya_22_4: 0
      },
      moduleDwellSec: {},
      moduleActions: {},
      chatHabits: {
        totalMessages: 0,
        byMethod: {
          quick_0token: 0,
          sticker_1tap: 0,
          typed_text: 0,
          voice_speech: 0
        },
        hourlyChatHist: new Array(24).fill(0),
        totalChars: 0,
        totalWords: 0,
        stickerCounts: {},
        companionCounts: {},
        topicCounts: {},
        recentSamples: []
      },
      searchQueries: [],
      ritualCounts: {}
    };
  }

  function buildSeedHabitProfiles() {
    const now = Date.now();
    const pMinh = createEmptyHabitProfile("TB-102", {
      memberCode: "TB-102",
      userName: "Anh Minh",
      honorific: "Anh",
      age: 71,
      province: "Hải Phòng",
      provinceId: "hai-phong",
      isRegistered: true,
      seniorityLevel: 18,
      seniorityTitle: "Tầng 18 · Trưởng Lão Hòa Hiếu",
      cohortTag: "Trưởng lão · Tầng 18"
    });
    pMinh.totalEvents = 46;
    pMinh.hourlyHist[5] = 8;
    pMinh.hourlyHist[6] = 16;
    pMinh.hourlyHist[7] = 11;
    pMinh.hourlyHist[15] = 7;
    pMinh.hourlyHist[19] = 4;
    pMinh.weekdayHist = [7, 6, 7, 6, 7, 6, 7];
    pMinh.bucketCounts.sang_som_5_7 = 35;
    pMinh.bucketCounts.buoi_chieu_14_17 = 7;
    pMinh.bucketCounts.buoi_toi_18_21 = 4;
    pMinh.moduleDwellSec = { groups: 1420, xiangqi: 2180, tearoom: 1640, zen: 540 };
    pMinh.moduleActions = { groups: 12, xiangqi: 18, tearoom: 11, zen: 5 };
    pMinh.chatHabits.totalMessages = 19;
    pMinh.chatHabits.byMethod = { quick_0token: 9, sticker_1tap: 5, typed_text: 2, voice_speech: 3 };
    pMinh.chatHabits.hourlyChatHist[6] = 10;
    pMinh.chatHabits.hourlyChatHist[7] = 5;
    pMinh.chatHabits.hourlyChatHist[15] = 4;
    pMinh.chatHabits.totalChars = 684;
    pMinh.chatHabits.totalWords = 152;
    pMinh.chatHabits.stickerCounts = { "moi-tra": 3, "dong-doi": 2 };
    pMinh.chatHabits.companionCounts = { "Anh Vĩnh": 8, "Chị Lan": 4 };
    pMinh.chatHabits.topicCounts = { "Đồng đội Sư đoàn 25": 9, "Cờ thế cổ phổ": 7 };
    pMinh.lastSeenTs = now - 240000;

    const pLan = createEmptyHabitProfile("TB-204", {
      memberCode: "TB-204",
      userName: "Chị Lan",
      honorific: "Chị",
      age: 68,
      province: "Hà Nội",
      provinceId: "ha-noi",
      isRegistered: true,
      seniorityLevel: 14,
      seniorityTitle: "Tầng 14 · Cây Trúc Giữa Sân",
      cohortTag: "Tri kỷ · Tầng 14"
    });
    pLan.totalEvents = 38;
    pLan.hourlyHist[6] = 9;
    pLan.hourlyHist[8] = 12;
    pLan.hourlyHist[9] = 8;
    pLan.hourlyHist[20] = 9;
    pLan.weekdayHist = [6, 5, 5, 6, 5, 5, 6];
    pLan.bucketCounts.sang_som_5_7 = 9;
    pLan.bucketCounts.buoi_sang_8_10 = 20;
    pLan.bucketCounts.buoi_toi_18_21 = 9;
    pLan.moduleDwellSec = { zen: 1890, poetry: 1560, newspaper: 1120, tearoom: 1320 };
    pLan.moduleActions = { zen: 14, poetry: 10, newspaper: 7, tearoom: 7 };
    pLan.chatHabits.totalMessages = 15;
    pLan.chatHabits.byMethod = { quick_0token: 6, sticker_1tap: 6, typed_text: 1, voice_speech: 2 };
    pLan.chatHabits.hourlyChatHist[8] = 8;
    pLan.chatHabits.hourlyChatHist[20] = 7;
    pLan.chatHabits.totalChars = 540;
    pLan.chatHabits.totalWords = 124;
    pLan.chatHabits.stickerCounts = { "binh-an": 4, "tha-tim": 2 };
    pLan.chatHabits.companionCounts = { "Anh Tám Vườn": 5, "Anh Minh": 4 };
    pLan.chatHabits.topicCounts = { "Chánh điện cầu an": 8, "Thơ lục bát quê hương": 6 };
    pLan.ritualCounts = { incense: 5, wish_plaque: 4, muyu: 18, pond_lantern: 3 };
    pLan.lastSeenTs = now - 180000;

    return {
      "TB-102": pMinh,
      "TB-204": pLan
    };
  }

  function loadHabitProfiles() {
    try {
      const raw = localStorage.getItem(HABIT_KEY);
      if (!raw) {
        const seeded = buildSeedHabitProfiles();
        localStorage.setItem(HABIT_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : buildSeedHabitProfiles();
    } catch (e) {
      return buildSeedHabitProfiles();
    }
  }

  function saveHabitProfiles() {
    try {
      localStorage.setItem(HABIT_KEY, JSON.stringify(habitProfiles));
    } catch (e) {}
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (ev) => {
          const db = ev.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            const store = db.createObjectStore(IDB_STORE, { keyPath: "id" });
            store.createIndex("by_ts", "ts", { unique: false });
            store.createIndex("by_member", "memberCode", { unique: false });
            store.createIndex("by_type", "eventType", { unique: false });
          }
        };
        req.onsuccess = (ev) => {
          const db = ev.target.result;
          try {
            const tx = db.transaction(IDB_STORE, "readonly");
            const countReq = tx.objectStore(IDB_STORE).count();
            countReq.onsuccess = () => {
              if (typeof countReq.result === "number") {
                totalIdbCountEstimate = Math.max(totalIdbCountEstimate, countReq.result);
              }
            };
          } catch (e2) {}
          resolve(db);
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
    return dbPromise;
  }

  function writeEventToIdb(evObj) {
    openDb().then((db) => {
      if (!db) return;
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(evObj);
        totalIdbCountEstimate += 1;
      } catch (e) {}
    });
  }

  function countWordsViet(str) {
    const clean = String(str || "").trim();
    if (!clean) return 0;
    return clean.split(/\s+/).filter(Boolean).length;
  }

  function foldEventIntoHabitProfile(ev) {
    if (!ev) return;
    const key = ev.memberCode || ev.clientId || "guest";
    if (!habitProfiles[key]) {
      habitProfiles[key] = createEmptyHabitProfile(key, ev);
    }
    const p = habitProfiles[key];
    p.memberCode = ev.memberCode || p.memberCode;
    if (ev.userName) p.userName = ev.userName;
    if (ev.honorific) p.honorific = ev.honorific;
    if (ev.age) p.age = ev.age;
    if (ev.province) p.province = ev.province;
    if (ev.provinceId) p.provinceId = ev.provinceId;
    if (typeof ev.isRegistered === "boolean") p.isRegistered = ev.isRegistered;
    if (typeof ev.seniorityLevel === "number") p.seniorityLevel = ev.seniorityLevel;
    if (ev.seniorityTitle) p.seniorityTitle = ev.seniorityTitle;
    if (ev.cohortTag) p.cohortTag = ev.cohortTag;

    p.lastSeenTs = Math.max(p.lastSeenTs || 0, ev.ts || Date.now());
    p.totalEvents = (p.totalEvents || 0) + 1;

    const hr = Math.max(0, Math.min(23, Number(ev.hour) || 0));
    const dow = Math.max(0, Math.min(6, Number(ev.dayOfWeek) || 0));
    if (!Array.isArray(p.hourlyHist) || p.hourlyHist.length !== 24) p.hourlyHist = new Array(24).fill(0);
    if (!Array.isArray(p.weekdayHist) || p.weekdayHist.length !== 7) p.weekdayHist = new Array(7).fill(0);
    p.hourlyHist[hr] += 1;
    p.weekdayHist[dow] += 1;

    const bucket = ev.timeBucket || getTimeBucketId(hr);
    if (!p.bucketCounts) p.bucketCounts = {};
    p.bucketCounts[bucket] = (p.bucketCounts[bucket] || 0) + 1;

    const mod = ev.module || "home";
    if (!p.moduleActions) p.moduleActions = {};
    p.moduleActions[mod] = (p.moduleActions[mod] || 0) + 1;

    if (typeof ev.dwellSec === "number" && ev.dwellSec > 0) {
      if (!p.moduleDwellSec) p.moduleDwellSec = {};
      const dwellTarget = (ev.meta && ev.meta.prevModule) || mod;
      p.moduleDwellSec[dwellTarget] = (p.moduleDwellSec[dwellTarget] || 0) + Math.min(3600, Math.round(ev.dwellSec));
    }

    const meta = ev.meta || {};
    if (ev.eventType === "chat_message") {
      const ch = p.chatHabits;
      ch.totalMessages = (ch.totalMessages || 0) + 1;
      const method = meta.inputMethod || "quick_0token";
      if (!ch.byMethod) ch.byMethod = { quick_0token: 0, sticker_1tap: 0, typed_text: 0, voice_speech: 0 };
      ch.byMethod[method] = (ch.byMethod[method] || 0) + 1;

      if (!Array.isArray(ch.hourlyChatHist) || ch.hourlyChatHist.length !== 24) {
        ch.hourlyChatHist = new Array(24).fill(0);
      }
      ch.hourlyChatHist[hr] += 1;

      const cLen = typeof meta.charLen === "number" ? meta.charLen : String(meta.text || "").length;
      const wCnt = typeof meta.wordCount === "number" ? meta.wordCount : countWordsViet(meta.text || "");
      ch.totalChars = (ch.totalChars || 0) + cLen;
      ch.totalWords = (ch.totalWords || 0) + wCnt;

      if (meta.stickerId) {
        ch.stickerCounts[meta.stickerId] = (ch.stickerCounts[meta.stickerId] || 0) + 1;
      }
      if (Array.isArray(meta.companions)) {
        meta.companions.forEach((cName) => {
          if (cName) ch.companionCounts[cName] = (ch.companionCounts[cName] || 0) + 1;
        });
      }
      if (meta.topicHint) {
        ch.topicCounts[meta.topicHint] = (ch.topicCounts[meta.topicHint] || 0) + 1;
      }
      if (!Array.isArray(ch.recentSamples)) ch.recentSamples = [];
      ch.recentSamples.unshift({
        ts: ev.ts,
        hour: hr,
        method,
        tableName: meta.tableName || "",
        text: String(meta.text || "").slice(0, 120)
      });
      if (ch.recentSamples.length > 15) ch.recentSamples = ch.recentSamples.slice(0, 15);
    }

    if (ev.eventType === "news_search" && meta.query) {
      if (!Array.isArray(p.searchQueries)) p.searchQueries = [];
      const q = String(meta.query).trim().slice(0, 60);
      if (q && !p.searchQueries.includes(q)) {
        p.searchQueries.unshift(q);
        if (p.searchQueries.length > 20) p.searchQueries = p.searchQueries.slice(0, 20);
      }
    }

    if (ev.eventType === "temple_ritual" && meta.ritualKind) {
      if (!p.ritualCounts) p.ritualCounts = {};
      p.ritualCounts[meta.ritualKind] = (p.ritualCounts[meta.ritualKind] || 0) + 1;
    }

    saveHabitProfiles();
  }

  function record(eventType, moduleName, subAction, metaObj, userCtx) {
    const now = new Date();
    const ts = now.getTime();
    const hr = now.getHours();
    const ctx = userCtx || {};
    const memberCode = ctx.memberCode || "KH-LOCAL";
    const seq = bumpSeqCounter();

    const ev = {
      id: `ev_${String(memberCode).replace(/[^A-Za-z0-9_-]/g, "")}_${ts}_${seq}`,
      seq,
      ts,
      isoTime: now.toISOString(),
      localDate: formatLocalDate(now),
      hour: hr,
      minute: now.getMinutes(),
      dayOfWeek: now.getDay(),
      timeBucket: getTimeBucketId(hr),
      sessionSec: Math.max(0, Math.round((ts - sessionStartTs) / 1000)),
      dwellSec: typeof (metaObj && metaObj.dwellSec) === "number"
        ? metaObj.dwellSec
        : Math.max(0, Math.round((ts - currentRouteEnteredAt) / 1000)),
      memberCode,
      clientId: ctx.clientId || "local",
      isRegistered: Boolean(ctx.isRegistered),
      userName: ctx.userName || "Hội viên",
      honorific: ctx.honorific || "Anh",
      age: ctx.age || 65,
      provinceId: ctx.provinceId || "ha-noi",
      province: ctx.province || "Hà Nội",
      seniorityLevel: typeof ctx.seniorityLevel === "number" ? ctx.seniorityLevel : 0,
      seniorityTitle: ctx.seniorityTitle || "Khách Ghé Hiên Trà",
      cohortTag: ctx.cohortTag || "Khách ghé",
      device: {
        viewportW: typeof window !== "undefined" ? window.innerWidth : 390,
        viewportH: typeof window !== "undefined" ? window.innerHeight : 844,
        xlFont: Boolean(ctx.xlFont),
        renderMode: ctx.renderMode || "3d"
      },
      eventType: eventType || "interaction",
      module: moduleName || currentRoute || "home",
      subAction: subAction || eventType || "click",
      meta: Object.assign({}, metaObj || {})
    };

    if (ev.eventType === "chat_message" && ev.meta) {
      ev.meta.charLen = String(ev.meta.text || "").length;
      ev.meta.wordCount = countWordsViet(ev.meta.text || "");
    }

    hotEvents.unshift(ev);
    saveHotEvents();
    writeEventToIdb(ev);
    foldEventIntoHabitProfile(ev);

    if (typeof onRemoteForward === "function") {
      try {
        onRemoteForward(ev);
      } catch (e) {}
    }

    return ev;
  }

  function recordRouteChange(nextRoute, userCtx) {
    const nowTs = Date.now();
    const prevRoute = currentRoute;
    const elapsedSec = Math.max(1, Math.round((nowTs - currentRouteEnteredAt) / 1000));
    currentRoute = nextRoute || "home";
    currentRouteEnteredAt = nowTs;
    return record(
      "route_view",
      currentRoute,
      `enter_${currentRoute}`,
      {
        prevModule: prevRoute,
        dwellSec: elapsedSec
      },
      userCtx
    );
  }

  function flushDwellHeartbeat(userCtx) {
    const nowTs = Date.now();
    const elapsedSec = Math.max(0, Math.round((nowTs - currentRouteEnteredAt) / 1000));
    if (elapsedSec < 5) return null;
    currentRouteEnteredAt = nowTs;
    return record(
      "route_dwell",
      currentRoute,
      "active_dwell_tick",
      {
        prevModule: currentRoute,
        dwellSec: elapsedSec
      },
      userCtx
    );
  }

  function ingestRemoteEvent(pkt) {
    if (!pkt || !pkt.id) return;
    if (hotEvents.some((x) => x.id === pkt.id)) return;
    hotEvents.unshift(pkt);
    saveHotEvents();
    writeEventToIdb(pkt);
    foldEventIntoHabitProfile(pkt);
  }

  function setRemoteForwarder(fn) {
    onRemoteForward = fn;
  }

  function getHotEvents() {
    return hotEvents.slice();
  }

  function getTotalStoredEstimate() {
    return Math.max(totalIdbCountEstimate, hotEvents.length);
  }

  function getAllEventsAsync() {
    return openDb().then((db) => {
      if (!db) return hotEvents.slice();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(IDB_STORE, "readonly");
          const req = tx.objectStore(IDB_STORE).getAll();
          req.onsuccess = () => {
            const list = Array.isArray(req.result) ? req.result : [];
            const byId = {};
            hotEvents.forEach((e) => {
              byId[e.id] = e;
            });
            list.forEach((e) => {
              byId[e.id] = e;
            });
            const merged = Object.values(byId).sort((a, b) => (b.ts || 0) - (a.ts || 0));
            totalIdbCountEstimate = merged.length;
            resolve(merged);
          };
          req.onerror = () => resolve(hotEvents.slice());
        } catch (e) {
          resolve(hotEvents.slice());
        }
      });
    });
  }

  function getMemberDeepProfiles() {
    const modLabels = {
      home: "Sảnh chính",
      tearoom: "Bàn trà 3D",
      xiangqi: "Cờ Tướng & Cờ Thế",
      newspaper: "Tờ Báo Sáng",
      zen: "Chánh Điện 3D",
      groups: "Đồng Ngũ & Bạn Bè",
      poetry: " Chiếu Thơ",
      games: "Ô Ăn Quan & Đố Vui",
      checkin: "Điểm Danh Sáng",
      profile: "Hồ Sơ Nhân Vật",
      leaderboard: "Cây Danh Hiệu"
    };

    const methodLabels = {
      quick_0token: "Chạm câu gợi ý nhanh",
      sticker_1tap: "Gửi Sticker 1 chạm",
      typed_text: "Tự gõ phím chữ",
      voice_speech: "Nói giọng micro"
    };

    return Object.values(habitProfiles)
      .sort((a, b) => (b.lastSeenTs || 0) - (a.lastSeenTs || 0))
      .map((p) => {
        const hourly = Array.isArray(p.hourlyHist) && p.hourlyHist.length === 24 ? p.hourlyHist : new Array(24).fill(0);
        let peakHour = 6;
        let peakVal = -1;
        hourly.forEach((v, idx) => {
          if (v > peakVal) {
            peakVal = v;
            peakHour = idx;
          }
        });

        let topBucketId = "sang_som_5_7";
        let topBucketCnt = -1;
        Object.entries(p.bucketCounts || {}).forEach(([bid, cnt]) => {
          if (cnt > topBucketCnt) {
            topBucketCnt = cnt;
            topBucketId = bid;
          }
        });

        const topDwellModules = Object.entries(p.moduleDwellSec || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([m, sec]) => `${modLabels[m] || m} (${Math.max(1, Math.round(sec / 60))}p)`);

        const ch = p.chatHabits || {};
        const totalMsgs = ch.totalMessages || 0;
        const byM = ch.byMethod || {};
        let dominantMethodKey = "quick_0token";
        let dominantMethodVal = -1;
        Object.entries(byM).forEach(([mk, mv]) => {
          if (mv > dominantMethodVal) {
            dominantMethodVal = mv;
            dominantMethodKey = mk;
          }
        });

        const avgWords = totalMsgs > 0 ? Math.round(((ch.totalWords || 0) / totalMsgs) * 10) / 10 : 0;
        const topCompanions = Object.entries(ch.companionCounts || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cName, cnt]) => `${cName} (${cnt} lần)`);

        const topTopics = Object.entries(ch.topicCounts || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([tp]) => tp);

        const aiActionableInsight =
          dominantMethodKey === "sticker_1tap"
            ? `Ưa dùng Sticker 1 chạm lúc ${String(peakHour).padStart(2, "0")}h00 — tự động ưu tiên khay Sticker lớn & ghép cùng ${topCompanions[0] || "bạn đồng hương"}.`
            : dominantMethodKey === "voice_speech"
            ? `Hay trò chuyện bằng giọng nói (${avgWords} từ/câu) khung ${getTimeBucketLabel(topBucketId)} — bật sẵn gợi ý micro & sổ từ điển vùng miền.`
            : (p.moduleDwellSec && (p.moduleDwellSec.xiangqi || 0) > (p.moduleDwellSec.zen || 0))
            ? `Hoạt động mạnh khung ${String(peakHour).padStart(2, "0")}h00, tập trung Cờ Tướng/Đồng ngũ — đề xuất thế cờ mới và báo khi đồng đội Online.`
            : `Sinh hoạt đều đặn khung ${String(peakHour).padStart(2, "0")}h00 (${getTimeBucketLabel(topBucketId)}) — gợi ý Thẻ An Lạc & bàn báo sáng chữ to.`;

        return {
          memberKey: p.memberKey,
          memberCode: p.memberCode,
          userName: p.userName,
          age: p.age,
          province: p.province,
          isRegistered: p.isRegistered,
          seniorityLevel: p.seniorityLevel || 0,
          seniorityTitle: p.seniorityTitle || "Khách Ghé Hiên Trà",
          cohortTag: p.cohortTag || "Khách ghé",
          totalEvents: p.totalEvents || 0,
          peakHour,
          peakTimeBucketLabel: getTimeBucketLabel(topBucketId),
          hourlyHist: hourly.slice(),
          weekdayHist: (p.weekdayHist || new Array(7).fill(0)).slice(),
          topDwellSummary: topDwellModules.join(" · ") || "Sảnh chính (1p)",
          totalDwellSec: Object.values(p.moduleDwellSec || {}).reduce((s, v) => s + (v || 0), 0),
          chatSummary: {
            totalMessages: totalMsgs,
            byMethod: Object.assign({ quick_0token: 0, sticker_1tap: 0, typed_text: 0, voice_speech: 0 }, byM),
            dominantMethodLabel: methodLabels[dominantMethodKey] || "Chạm câu gợi ý nhanh",
            avgWords,
            totalWords: ch.totalWords || 0,
            topCompanions,
            topTopics,
            recentSamples: (ch.recentSamples || []).slice(0, 5)
          },
          searchQueries: (p.searchQueries || []).slice(0, 8),
          aiActionableInsight
        };
      });
  }

  function wipeLocalTelemetry() {
    hotEvents = [];
    habitProfiles = buildSeedHabitProfiles();
    try {
      localStorage.removeItem(HOT_KEY);
      localStorage.removeItem(HABIT_KEY);
      localStorage.removeItem(SEQ_KEY);
    } catch (e) {}
    openDb().then((db) => {
      if (!db) return;
      try {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).clear();
        totalIdbCountEstimate = 0;
      } catch (e) {}
    });
  }

  async function buildExportJsonlString() {
    const allEvents = await getAllEventsAsync();
    return allEvents.map((ev) => JSON.stringify(ev)).join("\n");
  }

  async function buildExportFullJsonObject() {
    const allEvents = await getAllEventsAsync();
    return {
      schemaVersion: "tuoibac-ai-telemetry-v2",
      exportedAt: new Date().toISOString(),
      totalEventsCount: allEvents.length,
      memberDeepHabitProfiles: getMemberDeepProfiles(),
      rawHabitMatrix: habitProfiles,
      events: allEvents
    };
  }

  async function buildExportCsvString() {
    const allEvents = await getAllEventsAsync();
    const header = [
      "EventId",
      "Seq",
      "IsoTime",
      "LocalDate",
      "Hour",
      "DayOfWeek",
      "TimeBucket",
      "DwellSec",
      "MemberCode",
      "UserName",
      "Age",
      "Province",
      "SeniorityTitle",
      "EventType",
      "Module",
      "SubAction",
      "ChatMethod",
      "WordCount",
      "DetailJson"
    ].join(",");

    const rows = allEvents.map((e) => {
      const m = e.meta || {};
      const esc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
      return [
        esc(e.id),
        e.seq || 0,
        esc(e.isoTime),
        esc(e.localDate),
        e.hour,
        e.dayOfWeek,
        esc(e.timeBucket),
        e.dwellSec || 0,
        esc(e.memberCode),
        esc(e.userName),
        e.age || 65,
        esc(e.province),
        esc(e.seniorityTitle),
        esc(e.eventType),
        esc(e.module),
        esc(e.subAction),
        esc(m.inputMethod || ""),
        m.wordCount || 0,
        esc(JSON.stringify(m))
      ].join(",");
    });

    return "\uFEFF" + header + "\n" + rows.join("\n");
  }

  // Warm up IndexedDB right away
  openDb();

  return {
    TIME_BUCKETS,
    record,
    recordRouteChange,
    flushDwellHeartbeat,
    ingestRemoteEvent,
    setRemoteForwarder,
    getHotEvents,
    getTotalStoredEstimate,
    getAllEventsAsync,
    getMemberDeepProfiles,
    wipeLocalTelemetry,
    buildExportJsonlString,
    buildExportFullJsonObject,
    buildExportCsvString
  };
})();
