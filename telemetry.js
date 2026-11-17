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
  const FEEDBACK_KEY = URL_SLOT ? `tuoibac_tel_feedback_v1_${URL_SLOT}` : "tuoibac_tel_feedback_v1";
  const MAX_HOT = 500;
  const MAX_FEEDBACK = 200;

  const MODULE_LABELS = {
    home: "Sảnh chính",
    checkin: "Điểm danh sáng",
    tearoom: "Bàn trà 3D",
    newspaper: "Tờ báo sáng",
    groups: "Đồng ngũ & Bạn bè",
    xiangqi: "Cờ tướng & Cờ thế",
    games: "Ô ăn quan",
    quiz: "Đố vui hôm nay",
    poetry: "Chiếu thơ & Đàn tranh",
    watch: "Phòng xem chung",
    zen: "Chánh Điện 3D",
    leaderboard: "Bảng danh hiệu",
    profile: "Hồ sơ & Tủ đồ",
    health: "Trợ lý sức khỏe",
    family: "Góc con cái",
    privacy: "Dash & Quyền riêng tư"
  };

  const COMPLAINT_CATEGORIES = [
    {
      id: "ui_font",
      label: "Chữ nhỏ / Giao diện khó nhìn",
      isComplaint: true,
      rx: /chữ nhỏ|khó nhìn|\bmờ\b|chói|đau mắt|mỏi mắt|nhảy hình|rối mắt|\bchật\b/i
    },
    {
      id: "speed_bug",
      label: "Mạng chậm / Bàn cờ lỗi / Khó bấm",
      isComplaint: true,
      rx: /chậm|\blag\b|\bđơ\b|\bkẹt\b|\blỗi\b|mất kết nối|khó bấm|ấn nhầm|thoát nhầm|không bấm được|chờ lâu/i
    },
    {
      id: "audio_voice",
      label: "Âm thanh / Giọng đọc / Micro",
      isComplaint: true,
      rx: /không nghe|nhỏ tiếng|\brè\b|đọc nhanh|giọng đọc|micro|nhận giọng|\bồn\b/i
    },
    {
      id: "safety_alert",
      label: "Cảnh báo an toàn / Chặn SĐT & Link",
      isComplaint: true,
      rx: /lừa đảo|xin tiền|quảng cáo thuốc|tài khoản lạ/i
    },
    {
      id: "feature_wish",
      label: "Đề xuất thêm trò chơi / nội dung",
      isComplaint: false,
      rx: /\bthêm\b|mong có|nên có|ước gì|mở thêm|cờ mới|mục mới|đề xuất/i
    },
    {
      id: "praise",
      label: "Khen ngợi / Hài lòng ấm cúng",
      isComplaint: false,
      rx: /hài lòng|rất thích|ấm cúng|vui vẻ|dễ dùng|tuyệt vời|rõ ràng|cảm ơn/i
    }
  ];

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
  let feedbackFeed = loadFeedbackFeed();
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
      ritualCounts: {},
      complaintCount: 0,
      feedbackCount: 0
    };
  }

  function buildSeedFeedbackFeed() {
    const now = Date.now();
    return [
      {
        id: "seed-fb-1",
        ts: now - 3600000 * 6,
        userName: "Anh Minh",
        age: 71,
        province: "Hải Phòng",
        memberCode: "TB-102",
        sourceType: "user_feedback",
        categoryId: "speed_bug",
        categoryLabel: "Mạng chậm / Bàn cờ lỗi / Khó bấm",
        isComplaint: true,
        text: "Đôi lúc vào bàn cờ tối muộn tải hơi chậm, mong tối ưu thêm để đánh mượt hơn."
      },
      {
        id: "seed-fb-2",
        ts: now - 3600000 * 5,
        userName: "Chị Lan",
        age: 68,
        province: "Hà Nội",
        memberCode: "TB-204",
        sourceType: "chat_message",
        categoryId: "ui_font",
        categoryLabel: "Chữ nhỏ / Giao diện khó nhìn",
        isComplaint: true,
        text: "Phần chú thích nhỏ trên bảng danh hiệu trước đây hơi khó nhìn, bật chữ to 24px thì rõ hẳn."
      },
      {
        id: "seed-fb-3",
        ts: now - 3600000 * 4,
        userName: "Cụ Hòa",
        age: 79,
        province: "Hà Nội",
        memberCode: "TB-309",
        sourceType: "user_feedback",
        categoryId: "audio_voice",
        categoryLabel: "Âm thanh / Giọng đọc / Micro",
        isComplaint: true,
        text: "Giọng đọc báo buổi sáng nghe rõ, nhưng nếu nói chậm thêm một chút sẽ hợp tai hơn."
      },
      {
        id: "seed-fb-4",
        ts: now - 3600000 * 2.5,
        userName: "Chị Lan",
        age: 68,
        province: "Hà Nội",
        memberCode: "TB-204",
        sourceType: "user_feedback",
        categoryId: "feature_wish",
        categoryLabel: "Đề xuất thêm trò chơi / nội dung",
        isComplaint: false,
        text: "Mong quán trà mở thêm mục tập dưỡng sinh theo nhịp thở buổi sáng 6 giờ."
      },
      {
        id: "seed-fb-5",
        ts: now - 3600000 * 1.2,
        userName: "Anh Minh",
        age: 71,
        province: "Hải Phòng",
        memberCode: "TB-102",
        sourceType: "user_feedback",
        categoryId: "praise",
        categoryLabel: "Khen ngợi / Hài lòng ấm cúng",
        isComplaint: false,
        text: "Ô ăn quan thả từng viên sỏi chậm rãi rất dễ nhìn, không bị hoa mắt như trước."
      }
    ];
  }

  function loadFeedbackFeed() {
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      if (!raw) {
        const seeded = buildSeedFeedbackFeed();
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : buildSeedFeedbackFeed();
    } catch (e) {
      return buildSeedFeedbackFeed();
    }
  }

  function saveFeedbackFeed() {
    try {
      if (feedbackFeed.length > MAX_FEEDBACK) {
        feedbackFeed = feedbackFeed.slice(0, MAX_FEEDBACK);
      }
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackFeed));
    } catch (e) {}
  }

  function classifyIssueEvent(ev) {
    if (!ev) return null;
    const type = ev.eventType || "";
    const meta = ev.meta || {};
    const rawText = String(meta.text || meta.detail || meta.reason || ev.subAction || "").trim();
    const isDirectIssue = type === "user_feedback" || type === "safety_report" || type === "chat_blocked";
    if (!isDirectIssue && type !== "chat_message") return null;

    let matchedCat = null;
    if (meta.category) {
      matchedCat = COMPLAINT_CATEGORIES.find((c) => c.id === meta.category) || null;
    }
    if (!matchedCat && rawText) {
      matchedCat = COMPLAINT_CATEGORIES.find((c) => c.rx.test(rawText)) || null;
    }
    if (!matchedCat) {
      if (type === "safety_report" || type === "chat_blocked") {
        matchedCat = COMPLAINT_CATEGORIES.find((c) => c.id === "safety_alert");
      } else if (type === "user_feedback") {
        matchedCat = COMPLAINT_CATEGORIES.find((c) => c.id === "feature_wish");
      } else {
        return null;
      }
    }

    return {
      id: ev.id || `iss_${Date.now()}`,
      ts: ev.ts || Date.now(),
      userName: ev.userName || "Hội viên",
      age: ev.age || 65,
      province: ev.province || "Việt Nam",
      memberCode: ev.memberCode || "KH-LOCAL",
      sourceType: type,
      categoryId: matchedCat.id,
      categoryLabel: matchedCat.label,
      isComplaint: Boolean(matchedCat.isComplaint),
      text: rawText || matchedCat.label
    };
  }

  function pushFeedbackFeedItem(item) {
    if (!item || !item.id) return;
    if (feedbackFeed.some((x) => x.id === item.id)) return;
    feedbackFeed.unshift(item);
    saveFeedbackFeed();
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
    pMinh.complaintCount = 1;
    pMinh.feedbackCount = 1;
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
    pLan.complaintCount = 1;
    pLan.feedbackCount = 2;
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

    const issue = classifyIssueEvent(ev);
    if (issue) {
      if (issue.isComplaint) {
        p.complaintCount = (p.complaintCount || 0) + 1;
      } else {
        p.feedbackCount = (p.feedbackCount || 0) + 1;
      }
      pushFeedbackFeedItem(issue);
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
      meta: Object.assign(
        {
          uatTag: ctx.uatTag || "",
          netType: ctx.netType || "wifi",
          ttsMode: ctx.ttsMode || "auto",
          xlFont: Boolean(ctx.xlFont)
        },
        metaObj || {}
      )
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

  function getGlobalActivityDashboard(liveSessionSec) {
    const profiles = Object.values(habitProfiles);
    const liveSec = Math.max(0, Math.round(Number(liveSessionSec) || 0));
    const globalHourlyHist = new Array(24).fill(0);
    const modDwellTotals = {};
    const modActionTotals = {};
    const byMethod = { quick_0token: 0, sticker_1tap: 0, typed_text: 0, voice_speech: 0 };
    const topicAgg = {};
    const searchAgg = {};
    let totalEvents = 0;
    let totalOnTimeSec = liveSec;
    let totalChats = 0;

    profiles.forEach((p) => {
      totalEvents += Number(p.totalEvents) || 0;
      const hourly = Array.isArray(p.hourlyHist) ? p.hourlyHist : [];
      for (let h = 0; h < 24; h++) {
        globalHourlyHist[h] += Number(hourly[h]) || 0;
      }
      Object.entries(p.moduleDwellSec || {}).forEach(([mod, sec]) => {
        const sVal = Math.max(0, Number(sec) || 0);
        modDwellTotals[mod] = (modDwellTotals[mod] || 0) + sVal;
        totalOnTimeSec += sVal;
      });
      Object.entries(p.moduleActions || {}).forEach(([mod, cnt]) => {
        modActionTotals[mod] = (modActionTotals[mod] || 0) + (Number(cnt) || 0);
      });
      const ch = p.chatHabits || {};
      totalChats += Number(ch.totalMessages) || 0;
      Object.keys(byMethod).forEach((mk) => {
        byMethod[mk] += Number((ch.byMethod && ch.byMethod[mk]) || 0);
      });
      Object.entries(ch.topicCounts || {}).forEach(([tp, cnt]) => {
        topicAgg[tp] = (topicAgg[tp] || 0) + (Number(cnt) || 0);
      });
      (p.searchQueries || []).forEach((q) => {
        if (q) searchAgg[q] = (searchAgg[q] || 0) + 1;
      });
    });

    let peakHour = 6;
    let peakVal = -1;
    globalHourlyHist.forEach((val, h) => {
      if (val > peakVal) {
        peakVal = val;
        peakHour = h;
      }
    });

    const allModIds = new Set([...Object.keys(modDwellTotals), ...Object.keys(modActionTotals)]);
    const sumModDwell = Object.values(modDwellTotals).reduce((s, v) => s + v, 0);
    const sumModActions = Object.values(modActionTotals).reduce((s, v) => s + v, 0);
    const serviceRanking = [...allModIds]
      .map((id) => {
        const dwellSec = modDwellTotals[id] || 0;
        const actions = modActionTotals[id] || 0;
        const pct =
          sumModDwell > 0
            ? Math.round((dwellSec / sumModDwell) * 100)
            : sumModActions > 0
            ? Math.round((actions / sumModActions) * 100)
            : 0;
        return {
          id,
          label: MODULE_LABELS[id] || id,
          dwellSec,
          dwellMin: Math.max(1, Math.round(dwellSec / 60)),
          actions,
          pctOfTime: pct,
          _score: dwellSec + actions * 15
        };
      })
      .filter((x) => x.dwellSec > 0 || x.actions > 0)
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rest }) => rest);

    const catCounts = {};
    COMPLAINT_CATEGORIES.forEach((c) => {
      catCounts[c.id] = 0;
    });
    let totalComplaints = 0;
    let totalSuggestions = 0;
    let totalSafetyAlerts = 0;
    const sortedIssues = (feedbackFeed || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
    sortedIssues.forEach((it) => {
      if (catCounts[it.categoryId] === undefined) catCounts[it.categoryId] = 0;
      catCounts[it.categoryId] += 1;
      if (it.isComplaint) totalComplaints += 1;
      else totalSuggestions += 1;
      if (it.categoryId === "safety_alert") totalSafetyAlerts += 1;
    });
    const totalIssuesAll = Math.max(1, sortedIssues.length);
    const complaintRanking = COMPLAINT_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      isComplaint: c.isComplaint,
      count: catCounts[c.id] || 0,
      pct: Math.round(((catCounts[c.id] || 0) / totalIssuesAll) * 100)
    })).sort((a, b) => b.count - a.count);

    const topOnTimeMembers = profiles
      .map((p) => {
        const dwellSec = Object.values(p.moduleDwellSec || {}).reduce((s, v) => s + (Number(v) || 0), 0);
        const topModEntry = Object.entries(p.moduleDwellSec || {}).sort((a, b) => b[1] - a[1])[0];
        return {
          userName: p.userName || "Hội viên",
          age: p.age || 65,
          province: p.province || "Việt Nam",
          memberCode: p.memberCode || p.memberKey,
          dwellSec,
          dwellMin: Math.max(1, Math.round(dwellSec / 60)),
          topModuleLabel: topModEntry ? MODULE_LABELS[topModEntry[0]] || topModEntry[0] : "Sảnh chính",
          chatCount: (p.chatHabits && p.chatHabits.totalMessages) || 0,
          complaintCount: p.complaintCount || 0
        };
      })
      .sort((a, b) => b.dwellSec - a.dwellSec)
      .slice(0, 5);

    const zeroTokCount = byMethod.quick_0token + byMethod.sticker_1tap;
    const zeroTokenPct = totalChats > 0 ? Math.round((zeroTokCount / totalChats) * 100) : 100;
    const totalMembers = Math.max(1, profiles.length);
    const totalOnTimeMin = Math.max(1, Math.round(totalOnTimeSec / 60));

    return {
      kpis: {
        totalMembers: profiles.length,
        totalEvents,
        totalOnTimeSec,
        totalOnTimeMin,
        avgOnTimeMin: Math.max(1, Math.round(totalOnTimeMin / totalMembers)),
        peakHour,
        peakTimeBucketLabel: getTimeBucketLabel(getTimeBucketId(peakHour)),
        totalChats,
        zeroTokenPct,
        totalComplaints,
        totalSuggestions,
        totalSafetyAlerts,
        topService: serviceRanking[0] || { id: "tearoom", label: "Bàn trà 3D", dwellMin: 1, pctOfTime: 100 },
        topComplaint: complaintRanking.find((x) => x.isComplaint && x.count > 0) || complaintRanking[0]
      },
      globalHourlyHist,
      topOnTimeMembers,
      serviceRanking,
      chatOverview: {
        totalMessages: totalChats,
        byMethod,
        topTopics: Object.entries(topicAgg).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => ({ topic, count })),
        topSearchQueries: Object.entries(searchAgg).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([q]) => q)
      },
      complaintRanking,
      issueFeed: sortedIssues.slice(0, 60)
    };
  }

  function wipeLocalTelemetry() {
    hotEvents = [];
    habitProfiles = buildSeedHabitProfiles();
    feedbackFeed = buildSeedFeedbackFeed();
    try {
      localStorage.removeItem(HOT_KEY);
      localStorage.removeItem(HABIT_KEY);
      localStorage.removeItem(SEQ_KEY);
      localStorage.removeItem(FEEDBACK_KEY);
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
      globalActivityDashboard: getGlobalActivityDashboard(0),
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

  function getUatAndXpCalibrationReport(liveXp, liveStreakDays) {
    const profiles = Object.values(habitProfiles);
    const events = hotEvents || [];
    let xlFontUsers = 0;
    let totalFontEvents = 0;
    const ttsBreakdown = { recorded_mp3: 0, native_vi: 0, cloud_vi: 0 };
    const netBreakdown = {};
    const uatParticipants = {};

    events.forEach((ev) => {
      const m = ev.meta || {};
      if (ev.eventType === "font_toggle") {
        totalFontEvents += 1;
        if (m.xlFont) xlFontUsers += 1;
      }
      if (ev.eventType === "tts_read" || m.ttsMode) {
        const tm = String(m.ttsMode || "");
        if (tm.includes("recorded")) ttsBreakdown.recorded_mp3 += 1;
        else if (tm.includes("native")) ttsBreakdown.native_vi += 1;
        else ttsBreakdown.cloud_vi += 1;
      }
      if (m.netType) {
        netBreakdown[m.netType] = (netBreakdown[m.netType] || 0) + 1;
      }
      if (m.uatTag) {
        const tag = String(m.uatTag);
        if (!uatParticipants[tag]) {
          uatParticipants[tag] = {
            uatTag: tag,
            userName: ev.userName || "Cô/Bác UAT",
            age: ev.age || 65,
            province: ev.province || "VN",
            eventsCount: 0,
            dwellSec: 0,
            netType: m.netType || "4g",
            xlFont: Boolean(m.xlFont),
            ttsMode: m.ttsMode || "auto",
            lastSeenAt: ev.ts || Date.now()
          };
        }
        uatParticipants[tag].eventsCount += 1;
        uatParticipants[tag].dwellSec += Number(ev.dwellSec) || 0;
        if (m.netType) uatParticipants[tag].netType = m.netType;
        if (typeof m.xlFont === "boolean") uatParticipants[tag].xlFont = m.xlFont;
        if (m.ttsMode) uatParticipants[tag].ttsMode = m.ttsMode;
        uatParticipants[tag].lastSeenAt = Math.max(uatParticipants[tag].lastSeenAt, ev.ts || 0);
      }
    });

    const curXp = Math.max(28, Number(liveXp) || 28);
    const activeDays = Math.max(1, Number(liveStreakDays) || 6);
    const avgDailyMinutes = Math.max(
      8,
      Math.round(
        profiles.reduce((sum, p) => sum + Object.values(p.moduleDwellSec || {}).reduce((a, b) => a + (b || 0), 0), 0) /
          Math.max(1, profiles.length) /
          60
      )
    );
    // Estimate realistic daily XP velocity from active actions + morning check-in + tea/games/zen
    const measuredXpPerDay = Math.max(18, Math.min(180, Math.round(curXp / activeDays + avgDailyMinutes * 1.6)));

    const buildProjection = (capXp, label) => ({
      capXp,
      label,
      daysToTier5: Math.max(1, Math.round((132 * (capXp / 23008)) / measuredXpPerDay)),
      daysToTier16: Math.max(7, Math.round((3492 * (capXp / 23008)) / measuredXpPerDay)),
      daysToTier32: Math.max(30, Math.round(capXp / measuredXpPerDay)),
      monthsToTier32: Math.round((capXp / measuredXpPerDay / 30) * 10) / 10
    });

    const recommendation =
      measuredXpPerDay > 95
        ? "Tốc độ tích lũy thực tế khá nhanh (>95 XP/ngày) — sau 2 tuần UAT có thể cân nhắc nâng trần Tầng 32 lên 35.000 XP để giữ động lực trên 12 tháng."
        : measuredXpPerDay < 32
        ? "Nhịp chơi thư thả (<32 XP/ngày) — giữ nguyên mốc chuẩn 23.008 XP giúp các bác đạt Tầng 5 sớm trong tuần đầu và gắn bó bền bỉ."
        : "Nhịp tích lũy cân bằng chuẩn thiết kế (~35–90 XP/ngày) — mốc 23.008 XP cho Tầng 32 khớp lộ trình 10–18 tháng sinh hoạt đều đặn.";

    return {
      measuredXpPerDay,
      avgDailyMinutes,
      xlFontAdoptionPct: totalFontEvents > 0 ? Math.round((xlFontUsers / totalFontEvents) * 100) : 25,
      ttsBreakdown,
      netBreakdown,
      uatRoster: Object.values(uatParticipants).sort((a, b) => b.lastSeenAt - a.lastSeenAt),
      projections: [
        buildProjection(23008, "Chuẩn hiện hành (23.008 XP)"),
        buildProjection(35000, "Mở rộng trung hạn (35.000 XP)"),
        buildProjection(50000, "Trường kỳ 2 năm (50.000 XP)")
      ],
      recommendation
    };
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
    getGlobalActivityDashboard,
    getUatAndXpCalibrationReport,
    wipeLocalTelemetry,
    buildExportJsonlString,
    buildExportFullJsonObject,
    buildExportCsvString
  };
})();
