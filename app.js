(function () {
  const URL_SLOT = (function () {
    try {
      return new URLSearchParams(window.location.search || "").get("may") || "";
    } catch (e) {
      return "";
    }
  })();
  const STORAGE_KEY = URL_SLOT ? `tuoi_bac_sim_v7_${URL_SLOT}` : "tuoi_bac_sim_v7";
  const VAULT_BACKUP_KEY = `${STORAGE_KEY}_vault_bak`;
  const D = window.TuoiBacData;
  const PROG = window.TuoiBacProgression;
  const TEL = window.TuoiBacTelemetry;
  const XQ = window.TuoiBacXiangqi;
  const RT = window.TuoiBacRealtime;

  function createDefaultState() {
    return {
      route: "home",
      auth: {
        isRegistered: false,
        memberCode: "",
        accountHash: "",
        phoneMasked: "",
        recoveryToken: "",
        passkeyEnabled: false,
        primaryUnitLabel: "Đại đội 1K2 · D3 · Sư đoàn 25"
      },
      social: {
        activeTab: "units",
        selectedGroupId: "d25-d3-1k2-mn75",
        subView: "list",
        joinedGroupIds: [],
        groups: JSON.parse(JSON.stringify(D.INITIAL_GROUPS || [])),
        friends: [
          {
            memberCode: "TB-102",
            id: "minh",
            name: "Anh Minh",
            age: 71,
            province: "Hải Phòng",
            provinceId: "hai-phong",
            outfitColor: "#556B45",
            hat: "cap",
            unitLabel: "Đại đội 1K2 · D3 · Sư đoàn 25",
            isRealPeer: false
          },
          {
            memberCode: "TB-109",
            id: "vinh",
            name: "Anh Vĩnh",
            age: 74,
            province: "Nghệ An",
            provinceId: "nghe-an",
            outfitColor: "#556B45",
            hat: "cap",
            unitLabel: "Đại đội 1K2 · D3 · Sư đoàn 25",
            isRealPeer: false
          }
        ]
      },
      user: {
        honorific: "Anh",
        baseName: "Tám Vườn",
        name: "Anh Tám Vườn",
        age: 65,
        profileConfigured: false,
        provinceId: "can-tho",
        outfitId: "ao-ba-ba",
        itemId: "am-tu-sa",
        accessoryId: "glasses",
        titleFrameId: "tri-am",
        xu: 35,
        seniorityPoints: 28,
        skillPoints: {
          tea_host: 4,
          xiangqi: 3,
          poetry: 2,
          folk_games: 2,
          morning_habit: 4,
          comrade_social: 3,
          temple_zen: 3,
          voice_wisdom: 2
        },
        flowersLeft: 3,
        giftedPoemIds: [],
        checkedInToday: false,
        mood: "Khỏe khoắn",
        streakDays: 6,
        unlockedOutfits: ["ao-ba-ba", "ao-dai-xanh"],
        unlockedItems: ["am-tu-sa"],
        unlockedAccessories: ["none", "glasses"],
        unlockedTitleFrames: ["none", "tri-am"],
        unlockedTitles: ["Thành viên Chăm Điểm Danh"],
        daysHistory: [true, true, true, true, true, true, false],
        habits: ["uong-tra", "doc-bao", "co-tuong"]
      },
      settings: {
        xlFont: false,
        preferredRender: "3d",
        autoFallbacked: false,
        homeMode: "full",
        pwaBannerDismissed: false
      },
      privacy: {
        consentFamilyCheckin: true,
        consentRealtimePresence: true,
        consentVoiceDict: true
      },
      analytics: {
        session_start: 1,
        morning_checkin_done: 0,
        tea_table_joined: 0,
        tea_msg_quick_0token: 0,
        tea_msg_voice_or_text: 0,
        news_article_read: 0,
        async_game_move: 0,
        poem_posted: 0,
        share_link_created: 0,
        idle_prompts_triggered: 0
      },
      phoneticDict: D.INITIAL_PHONETIC_DICT.map((item) => Object.assign({}, item)),
      replyTemplates: D.REPLY_MATRIX.map((item) => ({
        topic: item.topic,
        keywords: item.keywords.slice(),
        replies: item.replies.slice()
      })),
      teaRoom: {
        rooms: JSON.parse(JSON.stringify(D.ROOM_TEMPLATES)),
        roomId: "phong-tra",
        subView: "lobby",
        tableIdx: 0,
        log: D.ROOM_TEMPLATES[0].tables[0].initialLog.slice(),
        lastSentAt: 0,
        activeNewspaperRef: null,
        articleTable: null
      },
      newspaper: {
        articles: D.MORNING_ARTICLES.map((a) => Object.assign({}, a)),
        drafts: D.RSS_DRAFTS.map((r) => Object.assign({}, r)),
        adminOpen: false,
        selectedCategory: "all",
        searchQuery: "",
        liveItems: []
      },
      quiz: {
        idx: 0,
        score: 0,
        selectedOpt: null,
        finished: false,
        timeLeft: 25
      },
      oaq: {
        cells: [5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5, 10],
        scoreP: 0,
        scoreAI: 0,
        turn: "host",
        selectedCell: null,
        mode: "ai",
        matchId: "",
        myRole: "host",
        hostName: "",
        guestName: "",
        statusText: "Chọn một ô của bác (hàng dưới) để rải quân.",
        zaloInviteUrl: ""
      },
      xiangqi: {
        mode: "ai",
        aiLevel: "club",
        puzzleIdx: 0,
        puzzleStep: 0,
        solvedPuzzleIds: [],
        solved: false,
        board: null,
        turn: "red",
        selected: null,
        lastMove: null,
        hintMove: null,
        prevBoard: null,
        moveLog: [],
        matchId: "",
        mySide: "red",
        hostName: "",
        guestName: "",
        inviteUrl: "",
        status: "Bàn chuẩn 9×10 (32 quân) — Bác cầm quân Đỏ đi tiên: chạm quân Đỏ rồi chạm chấm xanh để đi."
      },
      poems: D.POEMS.map((p) => Object.assign({}, p)),
      watch: {
        channelIdx: 0,
        votes: [14, 22, 9],
        votedIdx: null,
        reactions: { laugh: 128, clap: 84, heart: 96, wow: 41 },
        clipAnswered: null
      },
      zen: {
        spaceIdx: 0,
        cameraView: "wide",
        userCushionIdx: 2,
        incenseLit: true,
        incenseCount: 14,
        muyuCount: 0,
        bellCount: 0,
        lanternsReleased: 18,
        wishPlaquesCount: 16,
        peaceCardIdx: 0,
        prayers: [
          {
            id: "seed-p1",
            userName: "Chị Lan · 68t",
            province: "Hà Nội",
            ritualKind: "wish_plaque",
            cushionIdx: 1,
            prayerText: "Cầu chúc đại gia đình bình an, các con đi làm xa mạnh khỏe thuận hòa."
          },
          {
            id: "seed-p2",
            userName: "Anh Minh · 71t",
            province: "Hải Phòng",
            ritualKind: "incense",
            cushionIdx: 3,
            prayerText: "Tưởng nhớ đồng đội năm xưa, chúc anh em Sư đoàn 25 luôn dẻo dai."
          }
        ]
      },
      memberLogs: [],
      customTables: {},
      health: {
        medMorning: false,
        bpReadings: ["Sáng nay: 128/80 mmHg", "Hôm qua: 130/82 mmHg"],
        lastAnswer: D.HEALTH_QA[0].answer,
        emergencyMode: false
      }
    };
  }

  let state = loadState();
  let sessionSeconds = 0;
  let eyeCareShownThisCycle = false;
  let quizTimerId = null;
  let teaQueueTimerId = null;
  let cooldownTickId = null;
  let pendingQueue = [];
  let pendingVoiceDraft = null;
  let activeGameTab = "oaq";
  let activeLeaderTab = "Cay32";
  let activeRankProvinceFilter = "all";
  let lastTableActivityAt = Date.now();
  let idlePromptRotIdx = 0;
  let deferredPwaPrompt = null;
  let lastRenderedPeerKey = "";

  const els = {
    main: document.getElementById("app-main"),
    btnBack: document.getElementById("btn-back"),
    brandCompact: document.getElementById("brand-compact"),
    topbarSub: document.getElementById("topbar-sub"),
    btnRead: document.getElementById("btn-read-screen"),
    btnFont: document.getElementById("btn-font-toggle"),
    fontLabel: document.getElementById("font-label"),
    stripAvatar: document.getElementById("strip-avatar"),
    stripName: document.getElementById("strip-name"),
    stripProvince: document.getElementById("strip-province"),
    stripXu: document.getElementById("strip-xu"),
    stripRtBtn: document.getElementById("btn-realtime-status"),
    stripRtDot: document.getElementById("strip-rt-dot"),
    stripRtLabel: document.getElementById("strip-rt-label"),
    btnProfile: document.getElementById("btn-go-profile"),
    dialog: document.getElementById("tb-dialog"),
    dialogTitle: document.getElementById("tb-dialog-title"),
    dialogBody: document.getElementById("tb-dialog-body"),
    dialogClose: document.getElementById("tb-dialog-close"),
    toast: document.getElementById("toast-banner"),
    simRender: document.getElementById("sim-toggle-render"),
    simFont: document.getElementById("sim-toggle-font"),
    simDict: document.getElementById("sim-open-dict"),
    simVoiceSample: document.getElementById("sim-voice-sample"),
    simIdle60: document.getElementById("sim-trigger-idle60"),
    simEye: document.getElementById("sim-trigger-eyecare"),
    simPrivacy: document.getElementById("sim-open-privacy"),
    simFamily: document.getElementById("sim-open-family"),
    simReset: document.getElementById("sim-reset-demo")
  };

  function loadState() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(VAULT_BACKUP_KEY);
    } catch (e) {}
    if (!raw) return createDefaultState();
    try {
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (errPrimary) {
        const fallbackRaw = localStorage.getItem(VAULT_BACKUP_KEY);
        if (!fallbackRaw) return createDefaultState();
        parsed = JSON.parse(fallbackRaw);
      }
      const def = createDefaultState();
      const merged = Object.assign({}, def, parsed, {
        auth: Object.assign({}, def.auth, parsed.auth || {}),
        social: Object.assign({}, def.social, parsed.social || {}),
        user: Object.assign({}, def.user, parsed.user || {}),
        settings: Object.assign({}, def.settings, parsed.settings || {}),
        privacy: Object.assign({}, def.privacy, parsed.privacy || {}),
        analytics: Object.assign({}, def.analytics, parsed.analytics || {}),
        teaRoom: Object.assign({}, def.teaRoom, parsed.teaRoom || {}),
        newspaper: Object.assign({}, def.newspaper, parsed.newspaper || {}),
        oaq: Object.assign({}, def.oaq, parsed.oaq || {}),
        xiangqi: Object.assign({}, def.xiangqi, parsed.xiangqi || {}),
        watch: Object.assign({}, def.watch, parsed.watch || {}),
        zen: Object.assign({}, def.zen, parsed.zen || {}),
        health: Object.assign({}, def.health, parsed.health || {}),
        customTables: Object.assign({}, def.customTables, parsed.customTables || {})
      });
      if (!Array.isArray(merged.memberLogs)) {
        merged.memberLogs = [];
      }
      if (!Array.isArray(merged.zen.prayers) || merged.zen.prayers.length === 0) {
        merged.zen.prayers = def.zen.prayers;
      }
      if (!Array.isArray(merged.social.groups) || merged.social.groups.length === 0) {
        merged.social.groups = def.social.groups;
      }
      if (!Array.isArray(merged.social.friends)) {
        merged.social.friends = def.social.friends;
      }
      if (!Array.isArray(merged.social.joinedGroupIds)) {
        merged.social.joinedGroupIds = [];
      }
      if (!Array.isArray(merged.user.habits)) {
        merged.user.habits = def.user.habits;
      }
      if (!Array.isArray(merged.user.unlockedTitleFrames)) {
        merged.user.unlockedTitleFrames = def.user.unlockedTitleFrames;
      }
      merged.user.skillPoints = Object.assign({}, def.user.skillPoints, (parsed.user && parsed.user.skillPoints) || {});
      if (typeof merged.zen.userCushionIdx !== "number") merged.zen.userCushionIdx = 2;
      if (!merged.zen.cameraView) merged.zen.cameraView = "wide";
      if (typeof merged.zen.wishPlaquesCount !== "number") merged.zen.wishPlaquesCount = 16;
      if (!Array.isArray(merged.user.giftedPoemIds)) {
        merged.user.giftedPoemIds = [];
      }
      if (!Array.isArray(merged.teaRoom.rooms) || merged.teaRoom.rooms.length === 0) {
        merged.teaRoom.rooms = def.teaRoom.rooms;
      }
      if (!merged.teaRoom.roomId) {
        merged.teaRoom.roomId = "phong-tra";
      }
      if (!merged.teaRoom.subView) {
        merged.teaRoom.subView = "lobby";
      }
      return merged;
    } catch (e) {
      return createDefaultState();
    }
  }

  function getSeniorityProgress() {
    const pts = Number(state.user.seniorityPoints) || 28;
    const isReg = Boolean(state.auth && state.auth.isRegistered);
    if (PROG && typeof PROG.evaluateMainProgress === "function") {
      const ev = PROG.evaluateMainProgress(pts, isReg);
      const cohort = PROG.getCohortComparisonLabel(ev.current.level, isReg);
      const mapTierCompat = (t) =>
        t
          ? {
              id: t.id,
              level: t.level,
              name: t.fullLabel,
              rawTitle: t.title,
              shortBadge: t.shortTag,
              minPoints: t.minXp,
              color: (t.era && t.era.color) || "#6E4A35",
              bg: (t.era && t.era.bg) || "#F7EDE2",
              eraName: (t.era && t.era.eraName) || "",
              frameUnlock: (t.era && t.era.frameUnlock) || "none",
              perk: t.perk
            }
          : null;
      return {
        current: mapTierCompat(ev.current),
        next: mapTierCompat(ev.next),
        points: ev.xp,
        xpNeededForNext: ev.xpNeededForNext,
        percent: ev.percent,
        isGuest: ev.isGuest,
        cohort
      };
    }

    const tiers = D.SENIORITY_TIERS || [];
    const guestTier = tiers[0];
    return {
      current: guestTier,
      next: tiers[1] || null,
      points: pts,
      xpNeededForNext: 37,
      percent: 45,
      isGuest: !isReg,
      cohort: { tag: "Khách ghé", cls: "guest", desc: "Chưa định danh" }
    };
  }

  function buildTelemetryUserCtx() {
    const prog = getSeniorityProgress();
    const code =
      state.auth && state.auth.isRegistered && state.auth.memberCode
        ? state.auth.memberCode
        : `KH-${String(RT ? RT.getClientId() : "local").slice(-4).toUpperCase()}`;
    return {
      memberCode: code,
      clientId: RT ? RT.getClientId() : "local",
      isRegistered: Boolean(state.auth && state.auth.isRegistered),
      userName: state.user.name,
      honorific: state.user.honorific || "Anh",
      age: getUserAge(),
      provinceId: state.user.provinceId || "ha-noi",
      province: getProvince(state.user.provinceId).short,
      seniorityLevel: prog.current ? prog.current.level : 0,
      seniorityTitle: prog.current ? prog.current.name : "Bậc 0 · Khách Ghé Hiên Trà",
      cohortTag: prog.cohort ? prog.cohort.tag : "Khách ghé",
      xlFont: Boolean(state.settings && state.settings.xlFont),
      renderMode: (state.settings && state.settings.preferredRender) || "3d"
    };
  }

  function awardSkillPoints(treeId, deltaPts) {
    if (!treeId || !PROG) return;
    if (!state.user.skillPoints) state.user.skillPoints = {};
    const prevPts = Number(state.user.skillPoints[treeId]) || 0;
    const prevEval = PROG.evaluateSkillTree(treeId, prevPts);
    const nextPts = prevPts + Math.max(0, Number(deltaPts) || 0);
    state.user.skillPoints[treeId] = nextPts;
    const nextEval = PROG.evaluateSkillTree(treeId, nextPts);
    const prevRank = prevEval.current ? prevEval.current.rank : 0;
    const nextRank = nextEval.current ? nextEval.current.rank : 0;
    if (nextRank > prevRank && nextEval.current) {
      const badgeTitle = `${nextEval.tree.name.split("(")[0].trim()} · Bậc ${nextEval.current.roman}: ${nextEval.current.title}`;
      if (!state.user.unlockedTitles.includes(badgeTitle)) {
        state.user.unlockedTitles.unshift(badgeTitle);
      }
    }
  }

  function mapCategoryToSkillTree(actionKey, category) {
    const act = String(actionKey || "");
    const cat = String(category || "");
    if (act.includes("voice") || act.includes("dict")) return "voice_wisdom";
    if (cat === "chua-online" || act.startsWith("temple_")) return "temple_zen";
    if (cat === "co-tuong" || act.includes("xiangqi") || act.includes("puzzle")) return "xiangqi";
    if (cat === "tho-ca" || act.includes("poem")) return "poetry";
    if (cat === "dan-gian" || act.includes("oaq") || act.includes("quiz")) return "folk_games";
    if (cat === "diem-danh" || cat === "doc-bao" || act.includes("news") || act.includes("checkin")) return "morning_habit";
    if (cat === "dong-ngu" || act.includes("group") || act.includes("friend")) return "comrade_social";
    if (cat === "giao-luu" || act.includes("table") || act.includes("tea")) return "tea_host";
    return null;
  }

  function awardSeniorityPoints(delta, actionKey, category, detail, extraMeta) {
    const prevProg = getSeniorityProgress();
    state.user.seniorityPoints = (Number(state.user.seniorityPoints) || 28) + (Number(delta) || 0);
    const treeId = mapCategoryToSkillTree(actionKey, category);
    if (treeId) {
      awardSkillPoints(treeId, Math.max(1, Math.round((Number(delta) || 2) * 0.85)));
    }
    const prog = getSeniorityProgress();
    if (!prog.isGuest && prog.current && prog.current.frameUnlock && prog.current.frameUnlock !== "none") {
      unlockTitleFrame(prog.current.frameUnlock, prog.current.name);
    }
    if (!prog.isGuest && prevProg.current && prog.current && prog.current.level > prevProg.current.level) {
      if (!state.user.unlockedTitles.includes(prog.current.name)) {
        state.user.unlockedTitles.unshift(prog.current.name);
      }
    }
    if (actionKey) {
      logMemberBehavior(actionKey, category || "sinh-hoat", detail || "", extraMeta);
    } else {
      saveState();
    }
  }

  function logMemberBehavior(action, category, detail, extraMeta) {
    if (!Array.isArray(state.memberLogs)) state.memberLogs = [];
    const ctx = buildTelemetryUserCtx();
    const now = new Date();
    const entry = {
      id: `ml_${ctx.memberCode}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      ts: now.getTime(),
      hour: now.getHours(),
      memberCode: ctx.memberCode,
      userName: ctx.userName,
      age: ctx.age,
      province: ctx.province,
      seniorityTier: ctx.seniorityTitle,
      action: action || "interaction",
      category: category || "sinh-hoat",
      detail: String(detail || "").slice(0, 160)
    };
    state.memberLogs.unshift(entry);
    if (state.memberLogs.length > 150) {
      state.memberLogs = state.memberLogs.slice(0, 150);
    }
    saveState();
    if (TEL && typeof TEL.record === "function") {
      const evType = (extraMeta && extraMeta.eventType) || "member_action";
      const modName = (extraMeta && extraMeta.module) || state.route || "home";
      TEL.record(
        evType,
        modName,
        action || "interaction",
        Object.assign({ category: category || "sinh-hoat", detail: entry.detail }, extraMeta || {}),
        ctx
      );
    }
    if (RT && typeof RT.publishMemberLog === "function") {
      RT.publishMemberLog(entry, state.memberLogs.slice(0, 10));
    }
  }

  function trackTelemetryDirect(eventType, moduleName, subAction, metaObj) {
    if (!TEL || typeof TEL.record !== "function") return;
    TEL.record(eventType, moduleName || state.route || "home", subAction, metaObj || {}, buildTelemetryUserCtx());
  }

  function getAllMemberLogsMerged() {
    const byId = {};
    (D.SEED_MEMBER_LOGS || []).forEach((item) => {
      byId[item.id] = item;
    });
    (state.memberLogs || []).forEach((item) => {
      byId[item.id] = item;
    });
    if (RT && typeof RT.getMemberLogs === "function") {
      RT.getMemberLogs().forEach((item) => {
        byId[item.id] = item;
      });
    }
    return Object.values(byId).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  function synthesizeMemberAiInsights() {
    const allLogs = getAllMemberLogsMerged();
    const byMember = {};
    allLogs.forEach((l) => {
      const k = l.memberCode || l.userName;
      if (!byMember[k]) {
        byMember[k] = {
          memberCode: l.memberCode || k,
          userName: l.userName || "Hội viên",
          age: l.age || 65,
          province: l.province || "Việt Nam",
          seniorityTier: l.seniorityTier || "Khách Ghé Hiên Trà",
          logs: [],
          catCounts: {},
          hours: []
        };
      }
      byMember[k].logs.push(l);
      if (l.category) byMember[k].catCounts[l.category] = (byMember[k].catCounts[l.category] || 0) + 1;
      if (typeof l.hour === "number") byMember[k].hours.push(l.hour);
    });

    const catLabels = {
      "dong-ngu": "Đồng đội & Hội nhóm",
      "co-tuong": "Cờ Tướng & Cờ Thế",
      "doc-bao": "Đọc Báo Thời Sự",
      "chua-online": "Viếng Chùa An Lạc",
      "tho-ca": "Ngâm Thơ Lục Bát",
      "giao-luu": "Trà Đàm & Gửi Sticker",
      "diem-danh": "Điểm Danh Sáng",
      "sinh-hoat": "Sinh Hoạt Chung"
    };

    return Object.values(byMember).map((m) => {
      const sortedCats = Object.entries(m.catCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cid]) => catLabels[cid] || cid);
      const topInterests = sortedCats.slice(0, 2).join(" · ") || "Thưởng trà buổi sáng";
      const avgHour = m.hours.length > 0 ? Math.round(m.hours.reduce((s, x) => s + x, 0) / m.hours.length) : 7;
      const timePersona =
        avgHour <= 8 ? `Hay dậy sớm (${avgHour}h sáng)` : avgHour <= 14 ? `Sinh hoạt ban trưa (${avgHour}h)` : `Thư giãn chiều tối (${avgHour}h)`;
      const aiRecommendation = m.catCounts["co-tuong"]
        ? "AI gợi ý: Mời giải Cờ Thế mới & ghép vào Phòng Cờ cùng kỳ hữu đồng niên."
        : m.catCounts["chua-online"]
        ? "AI gợi ý: Mở lời chúc Thẻ An Lạc buổi sáng & mời nghe thơ tĩnh tâm."
        : m.catCounts["dong-ngu"]
        ? "AI gợi ý: Ưu tiên thông báo khi đồng đội cùng đơn vị bật đèn Online."
        : "AI gợi ý: Ghép vào bàn trà đồng hương ấm cúng và điểm báo sáng chữ to.";
      return {
        memberCode: m.memberCode,
        userName: m.userName,
        age: m.age,
        province: m.province,
        seniorityTier: m.seniorityTier,
        totalActions: m.logs.length,
        topInterests,
        timePersona,
        aiRecommendation,
        latestDetail: m.logs[0] ? m.logs[0].detail : ""
      };
    });
  }

  function trackEvent(eventName) {
    if (!state.analytics) state.analytics = {};
    state.analytics[eventName] = (state.analytics[eventName] || 0) + 1;
    const mapActionMeta = {
      morning_checkin_done: [5, "diem-danh", "Điểm danh bình an buổi sáng"],
      tea_table_joined: [3, "giao-luu", "Ngồi vào bàn trà trò chuyện"],
      news_article_read: [3, "doc-bao", "Đọc bản tin trên Tờ Báo Sáng"],
      async_game_move: [4, "co-tuong", "Đi nước cờ giao lưu"],
      poem_posted: [6, "tho-ca", "Sáng tác / ngâm thơ lục bát"]
    };
    if (mapActionMeta[eventName]) {
      const [pts, cat, det] = mapActionMeta[eventName];
      awardSeniorityPoints(pts, eventName, cat, det);
    } else {
      saveState();
    }
  }

  function getTitleFrame(id) {
    return (D.TITLE_FRAMES || []).find((f) => f.id === id) || D.TITLE_FRAMES[0];
  }

  function unlockTitleFrame(frameId, announceLabel) {
    if (!Array.isArray(state.user.unlockedTitleFrames)) {
      state.user.unlockedTitleFrames = ["none", "tri-am"];
    }
    if (!state.user.unlockedTitleFrames.includes(frameId)) {
      state.user.unlockedTitleFrames.push(frameId);
      state.user.titleFrameId = frameId;
      if (announceLabel && !state.user.unlockedTitles.includes(announceLabel)) {
        state.user.unlockedTitles.unshift(announceLabel);
      }
      saveState();
      return true;
    }
    return false;
  }

  function isStandalonePwa() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    deferredPwaPrompt = ev;
    if (state.route === "home") renderHome();
  });

  if ("serviceWorker" in navigator && /^https?:$/i.test(window.location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  function saveState() {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(VAULT_BACKUP_KEY, serialized);
    } catch (e) {
      // Ignore quota issue
    }
  }

  function ico(name, cls) {
    return `<svg class="ico ${cls || ""}" aria-hidden="true"><use href="#ico-${name}" /></svg>`;
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getProvince(id) {
    return D.PROVINCES.find((p) => p.id === id) || D.PROVINCES[0];
  }

  function getOutfit(id) {
    return D.OUTFITS.find((o) => o.id === id) || D.OUTFITS[0];
  }

  function getTableItem(id) {
    return D.TABLE_ITEMS.find((it) => it.id === id) || D.TABLE_ITEMS[0];
  }

  let toastTimeout = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      els.toast.hidden = true;
    }, 2000);
  }

  let activeTtsAudio = null;
  let ttsSessionId = 0;
  window.__ttsState = { speaking: false, mode: "idle", playedCount: 0, lastDuration: 0, lastText: "" };

  function setReadBtnActive(isActive) {
    els.btnRead.classList.toggle("speaking", isActive);
    const span = els.btnRead.querySelector("span");
    if (span) {
      span.textContent = isActive ? "Dừng đọc" : "Đọc to";
    }
    window.__ttsState.speaking = isActive;
  }

  function normalizeVietnameseSpeechText(raw) {
    return String(raw || "")
      .replace(/[""„‟]/g, " ")
      .replace(/\(([^)]+)\)/g, ", $1, ")
      .replace(/:\s+/g, ", ")
      .replace(/·/g, ", ")
      .replace(/TP\.\s*HCM/gi, "Thành phố Hồ Chí Minh")
      .replace(/TP\.\s*Huế/gi, "Thành phố Huế")
      .replace(/(\d+)\s*\/\s*(\d+)/g, "$1 trên $2")
      .replace(/,\s*,/g, ",")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitVietnameseTtsChunks(text) {
    const cleaned = normalizeVietnameseSpeechText(text);
    if (!cleaned) return [];
    const rawSentences = cleaned.split(/(?<=[.!?;…])\s+/);
    const chunks = [];
    rawSentences.forEach((sent) => {
      let rest = sent.trim();
      while (rest.length > 165) {
        let cut = rest.lastIndexOf(", ", 165);
        if (cut < 50) cut = rest.lastIndexOf(" ", 165);
        if (cut < 30) cut = 165;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).replace(/^,\s*/, "").trim();
      }
      if (rest) chunks.push(rest);
    });
    return chunks;
  }

  function findNativeVietnameseVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    return (
      voices.find((v) => /^vi(-|_|$)/i.test(v.lang || "")) ||
      voices.find((v) => /viet|hoaimy|namminh/i.test(v.name || "")) ||
      null
    );
  }

  function playCloudVietnameseTts(chunks, session) {
    let idx = 0;
    let preloadedNext = null;
    window.__ttsState.mode = "cloud-vi-mp3";
    window.__ttsState.error = null;

    const makeAudio = (chunkText) => {
      const url =
        "https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=" +
        encodeURIComponent(chunkText);
      const a = new Audio();
      a.preload = "auto";
      a.playbackRate = 0.96;
      a.src = url;
      return a;
    };

    const playNext = () => {
      if (session !== ttsSessionId) return;
      if (idx >= chunks.length) {
        activeTtsAudio = null;
        setReadBtnActive(false);
        return;
      }
      const chunk = chunks[idx++];
      const audio = preloadedNext || makeAudio(chunk);
      preloadedNext = idx < chunks.length ? makeAudio(chunks[idx]) : null;
      activeTtsAudio = audio;

      audio.addEventListener("loadedmetadata", () => {
        if (session !== ttsSessionId) return;
        window.__ttsState.lastDuration = audio.duration || 0;
      });
      audio.addEventListener("playing", () => {
        if (session !== ttsSessionId) return;
        window.__ttsState.playedCount += 1;
      });
      audio.addEventListener("ended", () => {
        if (session !== ttsSessionId) return;
        playNext();
      });
      audio.addEventListener("error", () => {
        if (session !== ttsSessionId) return;
        window.__ttsState.error = "audio-load-error";
        activeTtsAudio = null;
        setReadBtnActive(false);
        showToast("Không tải được âm thanh Tiếng Việt (kiểm tra kết nối mạng).");
      });
      audio
        .play()
        .then(() => {
          if (session !== ttsSessionId) return;
          if (audio.duration > 0) window.__ttsState.lastDuration = audio.duration;
          if (window.__ttsState.playedCount === 0) window.__ttsState.playedCount = 1;
        })
        .catch((err) => {
          if (session !== ttsSessionId) return;
          window.__ttsState.error = String(err);
          activeTtsAudio = null;
          setReadBtnActive(false);
          showToast("Bác chạm lại nút Đọc to để phát âm thanh Tiếng Việt nhé.");
        });
    };

    playNext();
  }

  function speak(text, opts) {
    const chunks = splitVietnameseTtsChunks(text);
    if (!chunks.length) return;

    stopSpeaking();
    const session = ++ttsSessionId;
    const fullText = chunks.join(" ");
    window.__ttsState.lastText = fullText;
    setReadBtnActive(true);

    if (opts && opts.announceToast) {
      showToast("Đang đọc to bằng giọng Tiếng Việt...");
    }

    const viVoice = findNativeVietnameseVoice();
    if (viVoice) {
      window.__ttsState.mode = "native-vi";
      const utter = new SpeechSynthesisUtterance(fullText);
      utter.voice = viVoice;
      utter.lang = viVoice.lang || "vi-VN";
      utter.rate = 0.92;
      utter.onstart = () => {
        if (session === ttsSessionId) window.__ttsState.playedCount += 1;
      };
      utter.onend = () => {
        if (session === ttsSessionId) setReadBtnActive(false);
      };
      utter.onerror = () => {
        if (session === ttsSessionId) playCloudVietnameseTts(chunks, session);
      };
      setTimeout(() => {
        if (session === ttsSessionId) window.speechSynthesis.speak(utter);
      }, 40);
      return;
    }

    // Fallback to natural Vietnamese MP3 stream when OS lacks a local vi-VN SAPI voice
    playCloudVietnameseTts(chunks, session);
  }

  function stopSpeaking() {
    ttsSessionId++;
    if (activeTtsAudio) {
      try {
        activeTtsAudio.pause();
        activeTtsAudio.src = "";
      } catch (e) {
        // Ignore audio cleanup error
      }
      activeTtsAudio = null;
    }
    if ("speechSynthesis" in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      window.speechSynthesis.cancel();
    }
    setReadBtnActive(false);
  }

  function renderSeniorAvatarSvg(member) {
    const outfit = (member && member.outfitColor) || "#2E5E4E";
    const hat = (member && member.hat) || "none";
    const isFemale =
      (member && member.gender === "female") ||
      /^(Chị|Bà|Cô|Dì|Thím)/i.test(String((member && member.name) || ""));
    let accSvg = "";
    if (hat === "cap") {
      accSvg = `<path d="M9 14c2-5 10-6 18-4 2 .5 3 2 3 3.5H9z" fill="#4F6842"/><rect x="8" y="13" width="24" height="2.6" rx="1.3" fill="#3E5433"/>`;
    } else if (hat === "non-la") {
      accSvg = `<polygon points="20,4 6,16 34,16" fill="#E9D59B" stroke="#B79452" stroke-width="1.2"/>`;
    } else if (hat === "glasses") {
      accSvg = `<circle cx="16.2" cy="18.5" r="2.7" fill="none" stroke="#8C5B1F" stroke-width="1.3"/><circle cx="23.8" cy="18.5" r="2.7" fill="none" stroke="#8C5B1F" stroke-width="1.3"/><line x1="18.9" y1="18.5" x2="21.1" y2="18.5" stroke="#8C5B1F" stroke-width="1.2"/>`;
    } else if (isFemale || hat === "hair-bun") {
      accSvg = `<circle cx="20" cy="8.5" r="4" fill="#DCD6CC"/><line x1="15" y1="8.5" x2="25" y2="8.5" stroke="#2E7D63" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return `
      <span class="member-avatar-ring" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="19" fill="#F6ECDA" stroke="#D5C4AA" stroke-width="1.4"/>
          <path d="M8 37c1.5-6.5 6-10 12-10s10.5 3.5 12 10" fill="${escHtml(outfit)}"/>
          <path d="M16.5 27.2L20 30.5l3.5-3.3" fill="none" stroke="#F5EBD6" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="20" cy="18.5" r="7.5" fill="#F4CFB4"/>
          <path d="M12.5 17.5c0-5 3.4-8 7.5-8s7.5 3 7.5 8c-2-2.2-4.5-3.2-7.5-3.2s-5.5 1-7.5 3.2z" fill="#E6E1D8"/>
          <circle cx="17.2" cy="18.6" r="1.1" fill="#2A1C15"/>
          <circle cx="22.8" cy="18.6" r="1.1" fill="#2A1C15"/>
          <path d="M17.4 22c1.5 1.4 3.7 1.4 5.2 0" fill="none" stroke="#9B4B3C" stroke-width="1.3" stroke-linecap="round"/>
          ${accSvg}
        </svg>
      </span>
    `;
  }

  function buildCurrentScreenSpeech() {
    if (state.route === "tearoom") {
      const room = getCurrentRoom();
      if (state.teaRoom.subView === "table") {
        const table = getCurrentTable();
        const curr = state.teaRoom.log[state.teaRoom.log.length - 1];
        const companions = table.members.map((m) => `${m.name} ${m.age} tuổi quê ${m.province}`).join(", ");
        const currLine = curr ? `Câu mới nhất trên bàn trà: ${curr.speaker} chia sẻ: ${curr.text}` : "";
        return `${table.name}, thuộc ${room.name}. Đang ngồi cùng bàn với ${getUserPronoun()} có ${companions}. ${currLine}`;
      }
      const bestEl = document.getElementById("smart-match-card");
      const bestText = bestEl ? bestEl.innerText.replace(/\s+/g, " ") : "";
      return `${room.name}. ${room.description}. ${bestText}`;
    }
    if (state.route === "newspaper") {
      const firstArt = state.newspaperArticles && state.newspaperArticles[0];
      if (firstArt) {
        return `Tờ Báo Sáng Tuổi Bạc. Bài nổi bật hôm nay: ${firstArt.title}. ${firstArt.body}`;
      }
    }
    if (state.route === "quiz") {
      const q = D.QUIZ_QUESTIONS[state.quiz.idx];
      if (q && !state.quiz.done) {
        return `Câu hỏi số ${state.quiz.idx + 1}: ${q.question}. Đáp án A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}.`;
      }
    }
    if (state.route === "poetry") {
      const p = state.poems && state.poems[0];
      if (p) {
        return `Chiếu Thơ Tuổi Bạc. Bài thơ ${p.title} của ${p.author}. ${p.lines.join(". ")}.`;
      }
    }
    const h1 = els.main.querySelector("h1");
    const lead = els.main.querySelector(".lead-copy");
    const firstPanel = els.main.querySelector(".surface-panel p, .hero-banner p");
    const parts = [
      h1 ? h1.textContent : "Quán trà Tuổi Bạc",
      lead ? lead.textContent : "",
      !lead && firstPanel ? firstPanel.textContent : ""
    ].filter(Boolean);
    return parts.join(". ");
  }

  function openDialog(title, html) {
    els.dialogTitle.textContent = title;
    els.dialogBody.innerHTML = html;
    if (typeof els.dialog.showModal === "function") {
      if (!els.dialog.open) els.dialog.showModal();
    } else {
      els.dialog.setAttribute("open", "open");
    }
  }

  function closeDialog() {
    if (typeof els.dialog.close === "function") {
      if (els.dialog.open) els.dialog.close();
    } else {
      els.dialog.removeAttribute("open");
    }
  }

  function getUserHonorific() {
    return state.user.honorific === "Chị" ? "Chị" : "Anh";
  }

  function getUserPronoun() {
    return state.user.honorific === "Chị" ? "chị" : "anh";
  }

  function getUserAge() {
    const n = Number(state.user.age);
    return Number.isFinite(n) && n >= 40 && n <= 110 ? Math.round(n) : 65;
  }

  function applyUserIdentity(honorific, rawBaseName, rawAge, provId) {
    const hon = honorific === "Chị" ? "Chị" : "Anh";
    const cleanedBase = String(rawBaseName || "")
      .replace(/^(anh|chị|bác|cô|bà|chú|cụ|ông)\s+/i, "")
      .trim() || "Tám Vườn";
    const safeAge = Math.max(45, Math.min(105, Math.round(Number(rawAge) || 65)));
    state.user.honorific = hon;
    state.user.baseName = cleanedBase;
    state.user.name = `${hon} ${cleanedBase}`;
    state.user.age = safeAge;
    if (provId) state.user.provinceId = provId;
    state.user.profileConfigured = true;
    saveState();
    updateGlobalChrome();
    syncMyGlobalOnlinePresence();
    if (state.auth && state.auth.isRegistered) {
      syncMyCloudAccountBackup();
    }
  }

  function updateGlobalChrome() {
    document.documentElement.classList.toggle("xl-font", state.settings.xlFont);
    document.body.classList.toggle("xl-font", state.settings.xlFont);
    els.fontLabel.textContent = state.settings.xlFont ? "Chữ vừa" : "Chữ to";

    const prov = getProvince(state.user.provinceId);
    const baseInitial = (state.user.baseName || state.user.name || "A").trim().charAt(0).toUpperCase();
    els.stripAvatar.textContent = baseInitial;
    els.stripName.textContent = `${state.user.name} · ${getUserAge()}t`;
    els.stripProvince.textContent =
      state.auth && state.auth.isRegistered && state.auth.memberCode
        ? `${prov.short} · ${state.auth.memberCode}`
        : prov.short;
    els.stripXu.textContent = String(state.user.xu);
    els.topbarSub.textContent = state.user.checkedInToday
      ? `Đã điểm danh (${state.user.streakDays} ngày)`
      : "Chưa điểm danh sáng nay";

    if (els.stripRtDot && els.stripRtLabel && RT) {
      const st = RT.getStatus();
      els.stripRtDot.classList.toggle("online", Boolean(st.connected));
      if (st.connected) {
        els.stripRtLabel.textContent = st.totalOtherPeers > 0 ? `Trực tuyến (${st.totalOtherPeers})` : "Trực tuyến";
      } else {
        els.stripRtLabel.textContent = "Đang nối...";
      }
    }

    const isHome = state.route === "home";
    els.btnBack.hidden = isHome;
    els.brandCompact.hidden = !isHome;

    if (els.simRender) {
      const activeMode = state.settings.autoFallbacked ? "2.5D (Tự hạ)" : state.settings.preferredRender === "3d" ? "Không gian 3D" : "2.5D Tĩnh";
      els.simRender.textContent = `Đồ họa: ${activeMode}`;
      els.simRender.classList.toggle("active", state.settings.preferredRender === "2.5d");
    }
    if (els.simFont) {
      els.simFont.textContent = `Cỡ chữ: ${state.settings.xlFont ? "24px (Cực lớn)" : "20px (Chuẩn)"}`;
      els.simFont.classList.toggle("active", state.settings.xlFont);
    }
    if (els.simDict) {
      els.simDict.textContent = `Sổ từ điển tự học (${state.phoneticDict.length})`;
    }
  }

  function navigate(route) {
    stopSpeaking();
    clearInterval(quizTimerId);
    clearInterval(cooldownTickId);
    if ((state.route === "tearoom" || state.route === "profile") && route !== state.route) {
      window.TeaRoomScene.dispose();
    }
    if (state.route === "zen" && route !== "zen" && window.TempleScene3D) {
      window.TempleScene3D.dispose();
    }
    if (state.route === "tearoom" && route !== "tearoom" && RT) {
      RT.leaveTableChannel();
    }
    state.route = route;
    if (TEL && typeof TEL.recordRouteChange === "function") {
      TEL.recordRouteChange(route, buildTelemetryUserCtx());
    }
    saveState();
    syncMyGlobalOnlinePresence();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function addXu(amount, reason) {
    state.user.xu += amount;
    saveState();
    updateGlobalChrome();
    if (reason) showToast(`+${amount} Xu: ${reason}`);
  }

  function openPwaInstallGuide() {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choice) => {
        if (choice && choice.outcome === "accepted") {
          showToast("Đã đặt biểu tượng Quán Trà Tuổi Bạc ra màn hình chính!");
          state.settings.pwaBannerDismissed = true;
          saveState();
          if (state.route === "home") renderHome();
        }
        deferredPwaPrompt = null;
      });
      return;
    }

    openDialog(
      "Đặt Quán Trà ra màn hình chính điện thoại",
      `
      <div class="surface-panel warm">
        <div class="pwa-install-top">
          <img src="icons/icon-192.png" alt="Biểu tượng Tuổi Bạc" class="pwa-app-icon" />
          <div>
            <strong>Mở 1 chạm như ứng dụng riêng</strong>
            <p style="font-size:0.88rem; color:var(--ink-secondary);">Chữ to tràn màn hình, tự đệm ngoại tuyến khi sóng 4G yếu.</p>
          </div>
        </div>
      </div>
      <div class="surface-panel">
        <h3>Trên điện thoại Android (Chrome / Samsung)</h3>
        <p style="font-size:0.92rem;">1. Chạm dấu <strong>3 chấm dọc (⋮)</strong> ở góc trên bên phải trình duyệt.</p>
        <p style="font-size:0.92rem;">2. Chọn <strong>"Thêm vào màn hình chính"</strong> hoặc <strong>"Cài đặt ứng dụng"</strong>.</p>
      </div>
      <div class="surface-panel">
        <h3>Trên iPhone / iPad (Safari)</h3>
        <p style="font-size:0.92rem;">1. Chạm nút <strong>Chia sẻ (ô vuông có mũi tên hướng lên)</strong> ở thanh dưới cùng.</p>
        <p style="font-size:0.92rem;">2. Kéo nhẹ lên và chạm <strong>"Thêm vào MH chính"</strong> rồi bấm <strong>Thêm</strong>.</p>
      </div>
      `
    );
  }

  function openRealtimeStatusModal() {
    const st = RT ? RT.getStatus() : { connected: false, providerName: "Cục bộ", totalOtherPeers: 0, clientId: "local" };
    const savedCfg = RT ? RT.getSupabaseConfig() : null;
    const baseShare = getPublicBaseUrl();
    const room = getCurrentRoom();
    const inviteSameTable = `${baseShare}?phong=${encodeURIComponent(room.id)}&ban=${state.teaRoom.tableIdx + 1}`;

    openDialog(
      "Kết nối Thời Gian Thực (Nhiều Điện Thoại Thật)",
      `
      <div class="surface-panel ${st.connected ? "jade" : "warm"}">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong>${st.connected ? "Đang kết nối phòng chung trực tuyến" : "Đang thử kết nối lại..."}</strong>
          <span class="badge-tag num">${escHtml(st.providerName)}</span>
        </div>
        <p style="font-size:0.88rem;">Thiết bị khác đang mở cùng lúc: <strong class="num">${st.totalOtherPeers}</strong> máy · Mã máy của ${getUserPronoun()}: <code>${escHtml(st.clientId.slice(0, 12))}</code></p>
        <p style="font-size:0.88rem;">Mở đường dẫn dưới đây trên điện thoại thứ 2 để thấy hai người thật ngồi chung Bàn ${state.teaRoom.tableIdx + 1} (${escHtml(room.shortName)}):</p>
        <div class="share-url-row">
          <input type="text" class="input-lg share-url-input" id="rt-quick-url" readonly value="${escHtml(inviteSameTable)}" />
          <button type="button" class="btn-secondary btn-inline" id="btn-copy-rt-url">Chép link</button>
        </div>
      </div>

      <div class="surface-panel">
        <h3>Nối vào dự án Supabase riêng (Tùy chọn)</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Mặc định hệ thống đã chạy sẵn kênh WSS miễn phí 24/7. Nếu muốn lưu lâu dài vào PostgreSQL của riêng mình, chạy tệp <code>supabase_schema.sql</code> rồi dán Project URL + Anon Key:</p>
        <label class="field-label">
          Supabase Project URL
          <input type="url" class="input-lg" id="sb-url-in" placeholder="https://xxxx.supabase.co" value="${escHtml(savedCfg ? savedCfg.url : "")}" />
        </label>
        <label class="field-label">
          Supabase Public Anon Key
          <input type="text" class="input-lg" id="sb-key-in" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." value="${escHtml(savedCfg ? savedCfg.anonKey : "")}" />
        </label>
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-save-sb-cfg">Lưu &amp; Chuyển sang Supabase</button>
          <button type="button" class="btn-secondary" id="btn-reset-sb-cfg">Dùng kênh WSS mặc định</button>
        </div>
      </div>
      `
    );

    document.getElementById("btn-copy-rt-url").addEventListener("click", () => {
      trackEvent("share_link_created");
      copyTextSafe(inviteSameTable, "Đã sao chép link bàn trà để mở trên điện thoại thứ 2!");
    });
    document.getElementById("btn-save-sb-cfg").addEventListener("click", () => {
      const u = document.getElementById("sb-url-in").value.trim();
      const k = document.getElementById("sb-key-in").value.trim();
      if (!u || !k) {
        showToast("Vui lòng điền đủ cả Project URL và Anon Key của Supabase.");
        return;
      }
      RT.saveSupabaseConfig(u, k);
      closeDialog();
      showToast("Đã lưu cấu hình Supabase Realtime!");
    });
    document.getElementById("btn-reset-sb-cfg").addEventListener("click", () => {
      RT.saveSupabaseConfig("", "");
      closeDialog();
      showToast("Đang dùng kênh Phòng Chung Trực Tuyến (WSS) miễn phí 24/7.");
    });
  }

  // ==================== HOME VIEW ====================
  function renderHome() {
    const prov = getProvince(state.user.provinceId);
    const pron = getUserPronoun();
    const hon = getUserHonorific();
    const age = getUserAge();
    const baseName = state.user.baseName || state.user.name.replace(/^(Anh|Chị|Bác)\s+/i, "");
    const isMvpMode = state.settings.homeMode === "mvp";
    const showPwaCard = !isStandalonePwa() && !state.settings.pwaBannerDismissed;

    els.main.innerHTML = `
      <section class="section-block">
        <h1>Chào ${escHtml(state.user.name)} · ${age} tuổi</h1>
        <p class="lead-copy">Mời ${pron} chọn một việc muốn làm sáng nay. Không cần gõ phím nhiều, chạm nút lớn để bắt đầu.</p>

        <!-- Công tắc thu gọn Trang Chủ về chuẩn MVP 3 nút -->
        <div class="home-mode-switch" role="group" aria-label="Chế độ hiển thị trang chủ">
          <button type="button" class="home-mode-btn ${isMvpMode ? "active" : ""}" id="btn-mode-mvp">Chuẩn MVP (3 nút gọn)</button>
          <button type="button" class="home-mode-btn ${!isMvpMode ? "active" : ""}" id="btn-mode-full">Đầy đủ (Tất cả góc)</button>
        </div>

        <!-- 4 Nút lớn ưu tiên đặt ngay đầu màn hình để mở 1 chạm không phải cuộn -->
        <div class="home-hero-list">
          <button type="button" class="home-main-btn is-primary" data-go="checkin">
            <span class="home-main-icon">${ico("sun", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>${state.user.checkedInToday ? "Xem bản đồ Điểm danh bình an" : "1. Điểm danh bình an"}</strong>
              <small>${state.user.checkedInToday ? `Tỉnh ${prov.short} đã sáng đèn hôm nay` : "Chạm 1 lần để thắp sáng tỉnh nhà & báo tin cho con"}</small>
            </span>
          </button>

          <button type="button" class="home-main-btn is-jade" data-go="tearoom">
            <span class="home-main-icon">${ico("tea", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>2. Vào phòng sinh hoạt (${escHtml(getCurrentRoom().shortName)})</strong>
              <small>${getCurrentRoom().tables.length} bàn đang mở · Ghép bàn người thật & đồng niên của ${pron}</small>
            </span>
          </button>

          <button type="button" class="home-main-btn" data-go="newspaper">
            <span class="home-main-icon">${ico("paper", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>3. Đọc Tờ Báo Sáng</strong>
              <small>${state.newspaper.articles.length} tin chọn lọc dễ đọc, tìm từ khóa & đàm đạo theo tin</small>
            </span>
          </button>

          <button type="button" class="home-main-btn is-wood" data-go="xiangqi">
            <span class="home-main-icon">${ico("xiangqi", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>4. Cờ Tướng 9×10 &amp; Giải Cờ Thế</strong>
              <small>Đánh ván thật 32 quân (Máy CLB / 2 người / Ván treo) &amp; Giải 6 thế cờ cổ phổ</small>
            </span>
          </button>

          <button type="button" class="home-main-btn is-veteran" data-go="groups">
            <span class="home-main-icon">${ico("users", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>5. Hội Đồng Ngũ · CLB &amp; Kết Bạn</strong>
              <small>Đại đội 1K2 · D3 · Sư đoàn 25, lập đơn vị riêng &amp; xem bạn Đang Online (${countOnlineFriendsNow()} người)</small>
            </span>
          </button>

          <button type="button" class="home-main-btn is-temple" data-go="zen">
            <span class="home-main-icon">${ico("lotus", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>6. Chánh Điện 3D &amp; Sân Hồ Sen</strong>
              <small>Mái chùa cổ, 10 chiếu bồ đoàn 3D, hồ sen hoa đăng &amp; cây ước nguyện treo thẻ đỏ</small>
            </span>
          </button>
        </div>

        ${(function () {
          const prog = getSeniorityProgress();
          return `
        <div class="passcard-banner ${state.auth.isRegistered ? "verified" : ""}" id="home-passcard-banner">
          <div class="passcard-head">
            <strong>${escHtml(prog.current.name)}</strong>
            <span class="cohort-pill ${escHtml(prog.cohort.cls)}">${escHtml(prog.cohort.tag)} · ${prog.points} XP</span>
          </div>
          <div class="seniority-progress-wrap">
            <div class="seniority-progress-track">
              <div class="seniority-progress-fill" style="width:${prog.percent}%"></div>
            </div>
            <small style="font-size:0.88rem; color:var(--ink-secondary);">
              ${
                prog.isGuest
                  ? `Đang ở <strong>Bậc 0 · Khách Ghé Hiên Trà</strong>. Mở Thẻ 10 giây nhận <strong>+35 XP &amp; +15 Xu</strong>, lên thẳng <strong>${escHtml(prog.next.name)}</strong> và lưu 96 danh hiệu!`
                  : prog.next
                  ? `Còn <strong class="num">${prog.xpNeededForNext}</strong> XP để lên <strong>${escHtml(prog.next.name)}</strong> (${escHtml(prog.current.eraName)}).`
                  : "Đã đạt đỉnh cao Tầng 32 · Đại Thụ Trăm Năm!"
              }
            </small>
          </div>
          <div class="btn-row">
            <button type="button" class="btn-${state.auth.isRegistered ? "jade" : "primary"}" id="btn-home-open-auth">
              ${ico("card")}
              <span>${state.auth.isRegistered ? "Thẻ QR Hội Viên" : "Mở Thẻ Lên Tầng 1"}</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-home-open-96titles">
              ${ico("trophy")}
              <span>Cây 96 Danh Hiệu</span>
            </button>
          </div>
        </div>`;
        })()}

        ${
          !state.user.profileConfigured
            ? `
          <div class="surface-panel warm" id="initial-setup-card">
            <h3>Điền nhanh xưng hô & tuổi ban đầu</h3>
            <p style="font-size:0.88rem; color:var(--ink-secondary);">Để mọi người trong bàn trà xưng hô <strong>Anh / Chị</strong> đúng tuổi và gợi ý bạn đồng niên hợp ý:</p>
            <div class="honorific-toggle-row" role="group" aria-label="Chọn cách xưng hô">
              <button type="button" class="honorific-btn ${hon === "Anh" ? "selected" : ""}" data-hon="Anh">Xưng là Anh</button>
              <button type="button" class="honorific-btn ${hon === "Chị" ? "selected" : ""}" data-hon="Chị">Xưng là Chị</button>
            </div>
            <div class="setup-inline-fields">
              <label class="field-label" style="flex:1.2;">
                Tên gọi
                <input type="text" class="input-lg" id="home-setup-name" value="${escHtml(baseName)}" placeholder="Ví dụ: Minh, Lan..." />
              </label>
              <div class="field-label" style="flex:1;">
                Tuổi hiện tại
                <div class="age-stepper">
                  <button type="button" class="age-step-btn" id="home-age-minus" aria-label="Giảm 1 tuổi">−</button>
                  <input type="number" class="input-lg num" id="home-setup-age" min="45" max="105" value="${age}" />
                  <button type="button" class="age-step-btn" id="home-age-plus" aria-label="Tăng 1 tuổi">+</button>
                </div>
              </div>
            </div>
            <button type="button" class="btn-primary" id="btn-save-initial-setup">Lưu thông tin xưng hô (${escHtml(hon)} ${escHtml(baseName)} · ${age} tuổi)</button>
          </div>
        `
            : `
          <div class="identity-summary-bar">
            <span>Đang xưng hô: <strong>${escHtml(state.user.name)} · ${age} tuổi</strong> (${escHtml(prov.short)})</span>
            <button type="button" class="btn-mini" id="btn-reopen-setup">Đổi tuổi / tên</button>
          </div>
        `
        }

        ${
          showPwaCard
            ? `
          <div class="pwa-install-card" id="pwa-install-card">
            <div class="pwa-install-top">
              <img src="icons/icon-192.png" alt="Biểu tượng ứng dụng Tuổi Bạc" class="pwa-app-icon" />
              <div>
                <strong>Đặt Quán Trà ra màn hình chính điện thoại</strong>
                <div style="font-size:0.88rem; color:var(--ink-secondary);">Mở 1 chạm như ứng dụng riêng, không phải tìm lại đường dẫn.</div>
              </div>
            </div>
            <div class="btn-row">
              <button type="button" class="btn-jade" id="btn-pwa-install">${ico("download")}<span>${deferredPwaPrompt ? "Cài ra màn hình chính ngay" : "Hướng dẫn đặt ra màn hình chính"}</span></button>
              <button type="button" class="btn-secondary" id="btn-pwa-hide">Để sau</button>
            </div>
          </div>
        `
            : ""
        }
      </section>

      ${
        isMvpMode
          ? `
        <section class="section-block">
          <div class="surface-panel">
            <p style="font-size:0.9rem; color:var(--ink-secondary);">Đang ở <strong>Chế độ Chuẩn MVP (3 nút gọn)</strong> dành cho người mới làm quen lần đầu.</p>
            <button type="button" class="btn-secondary" id="btn-expand-from-mvp">Mở thêm Cờ tướng 9×10, Ngâm thơ, Đố vui &amp; Quyền riêng tư</button>
          </div>
        </section>
      `
          : `
        <section class="section-block">
          <h2>Khu sinh hoạt mở rộng &amp; Quản trị</h2>
          <div class="module-grid">
            <button type="button" class="module-tile" data-go="groups">
              ${ico("users")}
              <strong>Hội Đồng Ngũ &amp; Kết bạn</strong>
              <span class="sub">Đại đội 1K2 · D3 · F25, lập hội &amp; bạn Online</span>
            </button>

            <button type="button" class="module-tile" data-go="xiangqi">
              ${ico("xiangqi")}
              <strong>Cờ tướng 9×10 &amp; Giải cờ thế</strong>
              <span class="sub">Ván thật 32 quân &amp; 6 thế cờ giang hồ</span>
            </button>

            <button type="button" class="module-tile" data-go="games">
              ${ico("board")}
              <strong>Ô ăn quan dân gian</strong>
              <span class="sub">Đấu với Máy hoặc Ván treo qua link</span>
            </button>

            <button type="button" class="module-tile" data-go="quiz">
              ${ico("quiz")}
              <strong>Đố vui hôm nay</strong>
              <span class="sub">5 câu mỗi ngày, không phạt người chậm</span>
            </button>

            <button type="button" class="module-tile" data-go="poetry">
              ${ico("poem")}
              <strong>Ngâm thơ &amp; Tặng hoa</strong>
              <span class="sub">Tự đăng thơ, tiếng đàn tranh &amp; danh hiệu 3D</span>
            </button>

            <button type="button" class="module-tile" data-go="watch">
              ${ico("tv")}
              <strong>Phòng xem chung</strong>
              <span class="sub">Dưỡng sinh 8h &amp; Hài 20h có phụ đề</span>
            </button>

            <button type="button" class="module-tile" data-go="zen">
              ${ico("lotus")}
              <strong>Góc tĩnh tâm</strong>
              <span class="sub">Thỉnh chuông, thả hoa đăng miễn phí</span>
            </button>

            <button type="button" class="module-tile" data-go="leaderboard">
              ${ico("trophy")}
              <strong>Bảng xếp hạng &amp; Danh hiệu</strong>
              <span class="sub">Theo tỉnh, người mới &amp; tủ kỷ niệm</span>
            </button>

            <button type="button" class="module-tile" data-go="health">
              ${ico("heart")}
              <strong>Trợ lý sức khỏe</strong>
              <span class="sub">Nhắc uống thuốc, đo huyết áp &amp; Gọi 115</span>
            </button>

            <button type="button" class="module-tile" data-go="family">
              ${ico("family")}
              <strong>Góc Con Cái (30–50 tuổi)</strong>
              <span class="sub">Xem lịch điểm danh &amp; tạo link cho bố mẹ</span>
            </button>

            <button type="button" class="module-tile" data-go="privacy">
              ${ico("shield")}
              <strong>Chỉ số &amp; Quyền riêng tư</strong>
              <span class="sub">Đo lường 0-token, Realtime &amp; xóa dữ liệu</span>
            </button>
          </div>
        </section>
      `
      }
    `;

    els.main.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.go));
    });

    const homeOpenAuth = document.getElementById("btn-home-open-auth");
    if (homeOpenAuth) {
      homeOpenAuth.addEventListener("click", () => openMemberAuthModal());
    }
    const homeOpen96 = document.getElementById("btn-home-open-96titles");
    if (homeOpen96) {
      homeOpen96.addEventListener("click", () => {
        activeLeaderTab = "Cay32";
        navigate("leaderboard");
      });
    }
    const homeOpenFriends = document.getElementById("btn-home-open-friends");
    if (homeOpenFriends) {
      homeOpenFriends.addEventListener("click", () => {
        state.social.activeTab = "friends";
        state.social.subView = "list";
        navigate("groups");
      });
    }

    document.getElementById("btn-mode-mvp").addEventListener("click", () => {
      state.settings.homeMode = "mvp";
      saveState();
      showToast("Đã bật chế độ Chuẩn MVP tinh gọn 3 nút.");
      renderHome();
    });
    document.getElementById("btn-mode-full").addEventListener("click", () => {
      state.settings.homeMode = "full";
      saveState();
      showToast("Đã mở đầy đủ tất cả góc sinh hoạt.");
      renderHome();
    });
    const expandBtn = document.getElementById("btn-expand-from-mvp");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        state.settings.homeMode = "full";
        saveState();
        renderHome();
      });
    }

    const pwaBtn = document.getElementById("btn-pwa-install");
    if (pwaBtn) pwaBtn.addEventListener("click", openPwaInstallGuide);
    const pwaHideBtn = document.getElementById("btn-pwa-hide");
    if (pwaHideBtn) {
      pwaHideBtn.addEventListener("click", () => {
        state.settings.pwaBannerDismissed = true;
        saveState();
        renderHome();
      });
    }

    let selectedHon = state.user.honorific === "Chị" ? "Chị" : "Anh";
    const syncHomeSetupBtnLabel = () => {
      const saveBtn = document.getElementById("btn-save-initial-setup");
      const nameIn = document.getElementById("home-setup-name");
      const ageIn = document.getElementById("home-setup-age");
      if (saveBtn && nameIn && ageIn) {
        const clean = nameIn.value.replace(/^(anh|chị|bác|cô|bà|chú)\s+/i, "").trim() || "Tám Vườn";
        saveBtn.textContent = `Lưu thông tin xưng hô (${selectedHon} ${clean} · ${ageIn.value || 65} tuổi)`;
      }
    };

    els.main.querySelectorAll("[data-hon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedHon = btn.dataset.hon === "Chị" ? "Chị" : "Anh";
        els.main.querySelectorAll("[data-hon]").forEach((b) => b.classList.toggle("selected", b === btn));
        syncHomeSetupBtnLabel();
      });
    });

    const homeNameIn = document.getElementById("home-setup-name");
    const homeAgeIn = document.getElementById("home-setup-age");
    if (homeNameIn && homeAgeIn) {
      homeNameIn.addEventListener("input", syncHomeSetupBtnLabel);
      homeAgeIn.addEventListener("input", syncHomeSetupBtnLabel);
      document.getElementById("home-age-minus").addEventListener("click", () => {
        homeAgeIn.value = String(Math.max(45, (Number(homeAgeIn.value) || 65) - 1));
        syncHomeSetupBtnLabel();
      });
      document.getElementById("home-age-plus").addEventListener("click", () => {
        homeAgeIn.value = String(Math.min(105, (Number(homeAgeIn.value) || 65) + 1));
        syncHomeSetupBtnLabel();
      });
      document.getElementById("btn-save-initial-setup").addEventListener("click", () => {
        applyUserIdentity(selectedHon, homeNameIn.value, homeAgeIn.value);
        showToast(`Đã lưu: ${state.user.name} (${state.user.age} tuổi).`);
        renderHome();
      });
    }

    const reopenBtn = document.getElementById("btn-reopen-setup");
    if (reopenBtn) {
      reopenBtn.addEventListener("click", () => {
        state.user.profileConfigured = false;
        saveState();
        renderHome();
      });
    }
  }

  function getPublicBaseUrl() {
    if (
      typeof window !== "undefined" &&
      window.location &&
      /^https?:$/i.test(window.location.protocol) &&
      !/^(127\.0\.0\.1|localhost)$/i.test(window.location.hostname)
    ) {
      return window.location.origin + window.location.pathname.replace(/index\.html$/i, "");
    }
    return "https://tuoibacgroup-create.github.io/";
  }

  function copyTextSafe(text, successMsg) {
    const str = String(text || "");
    const fallbackCopy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = str;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) {
        // Ignore fallback error
      }
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(str).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    showToast(successMsg || "Đã sao chép vào bộ nhớ tạm!");
  }

  function makeStandaloneQrDataUrl(url, caption) {
    const c = document.createElement("canvas");
    c.width = 360;
    c.height = 410;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#FBF5E8";
    ctx.fillRect(0, 0, 360, 410);
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 340, 390);
    if (window.TeaRoomScene && typeof window.TeaRoomScene.drawQrToCanvas === "function") {
      window.TeaRoomScene.drawQrToCanvas(ctx, url, 55, 28, 250);
    }
    ctx.fillStyle = "#231A14";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(caption || "Quét mã QR để mở trên điện thoại", 180, 316);
    ctx.fillStyle = "#B83B2A";
    ctx.font = "15px sans-serif";
    const shortU = url.replace(/^https?:\/\//, "");
    ctx.fillText(shortU.length > 38 ? shortU.slice(0, 36) + "..." : shortU, 180, 348);
    ctx.fillStyle = "#5A4638";
    ctx.font = "14px sans-serif";
    ctx.fillText("Không cần tài khoản — Chạm là vào ngay", 180, 376);
    return c.toDataURL("image/png");
  }

  function renderSocialShareKitHtml(opts) {
    const prefix = opts.prefix || "share";
    const copyLinkBtnId = opts.copyLinkBtnId || `${prefix}-btn-copy-url`;
    return `
      <div class="share-kit-box">
        <div class="field-label">
          <span>Đường dẫn trực tiếp (gửi nhanh qua tin nhắn):</span>
          <div class="share-url-row">
            <input type="text" class="input-lg share-url-input" id="${prefix}-url-in" readonly value="${escHtml(opts.shareUrl)}" />
            <button type="button" class="btn-secondary btn-inline" id="${copyLinkBtnId}">Chép link</button>
          </div>
        </div>

        <div class="field-label">
          <span>Nội dung bài đăng / lời mời soạn sẵn (Zalo, Facebook, Messenger):</span>
          <textarea class="textarea-lg share-post-area" id="${prefix}-post-in" rows="3">${escHtml(opts.postText)}</textarea>
          <button type="button" class="btn-jade" id="${prefix}-btn-copy-post">
            ${ico("share")}
            <span>Chép cả lời mời + link (Dán lên MXH)</span>
          </button>
        </div>
      </div>
    `;
  }

  function bindSocialShareKit(opts) {
    const prefix = opts.prefix || "share";
    const copyLinkBtnId = opts.copyLinkBtnId || `${prefix}-btn-copy-url`;
    const urlIn = document.getElementById(`${prefix}-url-in`);
    const postIn = document.getElementById(`${prefix}-post-in`);
    const copyUrlBtn = document.getElementById(copyLinkBtnId);
    const copyPostBtn = document.getElementById(`${prefix}-btn-copy-post`);

    if (urlIn) {
      urlIn.addEventListener("click", () => {
        urlIn.select();
        trackEvent("share_link_created");
        copyTextSafe(urlIn.value, "Đã sao chép đường dẫn!");
      });
    }
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener("click", () => {
        trackEvent("share_link_created");
        copyTextSafe(urlIn ? urlIn.value : opts.shareUrl, "Đã sao chép đường dẫn để gửi bạn bè!");
      });
    }
    if (copyPostBtn) {
      copyPostBtn.addEventListener("click", () => {
        trackEvent("share_link_created");
        const fullPost = postIn ? postIn.value : opts.postText;
        copyTextSafe(fullPost, "Đã sao chép lời mời kèm link — dán ngay lên Zalo / Facebook!");
      });
    }
  }

  function applyUrlDeepLinkIfPresent() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const tinh = params.get("tinh");
      if (tinh && D.PROVINCES.some((p) => p.id === tinh)) {
        state.user.provinceId = tinh;
      }
      const van = params.get("van");
      if (van) {
        const cleanVan = van.trim();
        if (cleanVan.startsWith("xq-")) {
          state.route = "xiangqi";
          activeGameTab = "cotuong";
          state.xiangqi.mode = "async";
          state.xiangqi.matchId = cleanVan;
          state.xiangqi.inviteUrl = `${getPublicBaseUrl()}?van=${encodeURIComponent(cleanVan)}`;
          state.xiangqi.status = "Đang tải trạng thái Ván treo Cờ tướng thời gian thực...";
        } else {
          state.route = "games";
          activeGameTab = "oaq";
          state.oaq.mode = "async";
          state.oaq.matchId = cleanVan;
          state.oaq.zaloInviteUrl = `${getPublicBaseUrl()}?van=${encodeURIComponent(cleanVan)}`;
          state.oaq.statusText = "Đang tải trạng thái Ván treo Ô ăn quan thời gian thực...";
        }
        if (RT) RT.subscribeMatch(cleanVan);
        saveState();
        return;
      }
      const tin = params.get("tin");
      if (tin) {
        const foundArt = (state.newspaper.articles || []).find((a) => a.id === tin);
        if (foundArt) {
          joinArticleDiscussionTable(foundArt, true);
          return;
        }
      }
      const khoiphuc = params.get("khoiphuc");
      if (khoiphuc) {
        restoreFromQrRecoveryToken(khoiphuc);
      }
      const ketban = params.get("ketban");
      if (ketban) {
        state.route = "groups";
        state.social.activeTab = "friends";
        state.social.subView = "list";
        state.social.pendingFriendCodeFromUrl = ketban.trim().toUpperCase();
        saveState();
        return;
      }
      const hoi = params.get("hoi");
      if (hoi) {
        const cleanHoi = hoi.trim();
        state.route = "groups";
        state.social.activeTab = "units";
        state.social.selectedGroupId = cleanHoi;
        state.social.subView = "detail";
        saveState();
        return;
      }
      const phong = params.get("phong");
      const ban = Number(params.get("ban"));
      if (phong) {
        const targetRoom = (state.teaRoom.rooms || []).find((r) => r.id === phong);
        if (targetRoom) {
          state.teaRoom.roomId = targetRoom.id;
          state.route = "tearoom";
          if (Number.isFinite(ban) && ban >= 1 && ban <= targetRoom.tables.length) {
            state.teaRoom.tableIdx = ban - 1;
            state.teaRoom.subView = "table";
            state.teaRoom.log = targetRoom.tables[ban - 1].initialLog.slice();
            lastTableActivityAt = Date.now();
          } else {
            state.teaRoom.subView = "lobby";
          }
          saveState();
        }
      }
    } catch (e) {
      // Ignore malformed query params
    }
  }

  // ==================== MODULE 1: CHECKIN & VIETNAM MAP ====================
  function drawGreetingCardDataUrl(provinceName, mood) {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 420;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#F6EFE2";
    ctx.fillRect(0, 0, 640, 420);
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 604, 384);

    ctx.fillStyle = "#2E5E4E";
    ctx.fillRect(36, 36, 568, 74);
    ctx.fillStyle = "#FFFDF7";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("TUỔI BẠC — ĐIỂM DANH BÌNH AN", 56, 82);

    ctx.fillStyle = "#231A14";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(`${state.user.name} · ${getUserAge()} tuổi`, 44, 170);

    ctx.fillStyle = "#5A4638";
    ctx.font = "22px sans-serif";
    ctx.fillText(`Quê hương: ${provinceName}`, 44, 212);
    ctx.fillText(`Trạng thái sáng nay: ${mood}`, 44, 252);
    ctx.fillText(`Chuỗi sinh hoạt: ${state.user.streakDays} ngày bình an`, 44, 292);

    ctx.fillStyle = "#B83B2A";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Chúc cả nhà một ngày mới an vui!", 44, 344);
    const baseShare = getPublicBaseUrl();
    const shortHost = baseShare.replace(/^https?:\/\//, "").replace(/\/$/, "");
    ctx.fillStyle = "#5A4638";
    ctx.font = "17px sans-serif";
    ctx.fillText(`Vào quán trà: ${shortHost}`, 44, 376);

    if (window.TeaRoomScene && typeof window.TeaRoomScene.drawQrToCanvas === "function") {
      window.TeaRoomScene.drawQrToCanvas(ctx, `${baseShare}?tinh=${encodeURIComponent(state.user.provinceId)}`, 496, 276, 106);
    }
    return c.toDataURL("image/png");
  }

  function renderCheckin() {
    const myProv = getProvince(state.user.provinceId);
    const rtSummary = RT ? RT.getCheckinsSummary() : { totalRealCheckins: 0, countsByProvince: {}, recentList: [] };
    const lampsOf = (p) => {
      const realCount = rtSummary.countsByProvince[p.id] || 0;
      const localFallback = realCount === 0 && p.id === myProv.id && state.user.checkedInToday ? 1 : 0;
      return p.lamps + realCount + localFallback;
    };
    const totalLamps = D.PROVINCES.reduce((sum, p) => sum + lampsOf(p), 0);

    const mapDots = D.PROVINCES.map((p) => {
      const isMe = p.id === myProv.id;
      const hasReal = Boolean(rtSummary.countsByProvince[p.id]);
      const r = isMe ? 8 : Math.min(6.8, 3 + lampsOf(p) / 320);
      const fill = isMe ? (state.user.checkedInToday ? "#FFD166" : "#FF6B57") : hasReal ? "#7BF1A8" : "#F5B841";
      return `
        <g class="map-dot" data-prov="${p.id}" style="cursor:pointer">
          ${isMe ? `<circle cx="${p.x}" cy="${p.y}" r="14" fill="rgba(255, 209, 102, 0.25)" />` : ""}
          <circle cx="${p.x}" cy="${p.y}" r="${r.toFixed(1)}" fill="${fill}" stroke="#0D1520" stroke-width="1" />
          ${(p.island || p.diaspora || isMe) ? `<text x="${p.x}" y="${p.y - 11}" text-anchor="middle" fill="#F7F1E3" font-size="11" font-weight="700">${escHtml(p.short)}</text>` : ""}
        </g>
      `;
    }).join("");

    const sortedProvinces = D.PROVINCES.slice()
      .sort((a, b) => lampsOf(b) - lampsOf(a))
      .slice(0, 6);

    els.main.innerHTML = `
      <h1>Điểm danh bình an</h1>
      <p class="lead-copy">Chạm 1 nút mỗi sáng để thắp sáng tỉnh nhà trên bản đồ Việt Nam và báo tin bình an cho con cháu.</p>

      <div class="surface-panel">
        <label class="field-label">
          Tỉnh thành của bác (34 tỉnh thành sau sáp nhập)
          <select class="select-lg" id="checkin-province">
            ${D.PROVINCES.map((p) => `<option value="${p.id}" ${p.id === state.user.provinceId ? "selected" : ""}>${escHtml(p.name)}</option>`).join("")}
          </select>
        </label>

        <div>
          <p style="font-weight:600; margin-bottom:8px;">Hôm nay bác thấy thế nào?</p>
          <div class="mood-row">
            ${["Khỏe khoắn", "Bình thường", "Hơi mỏi"].map((m) => `
              <button type="button" class="mood-btn ${state.user.mood === m ? "selected" : ""}" data-mood="${m}">${m}</button>
            `).join("")}
          </div>
        </div>

        <button type="button" class="btn-primary" id="btn-do-checkin">
          ${ico("check")}
          <span>${state.user.checkedInToday ? "Đã điểm danh sáng nay (Thắp lại lời chúc)" : "Điểm danh bình an hôm nay (+5 Xu)"}</span>
        </button>

        ${state.user.checkedInToday ? `
          <div class="surface-panel jade">
            <strong>${state.privacy.consentFamilyCheckin ? "Đã gửi thông báo bình an miễn phí tới Anh Hùng (Con trai)" : "Đã ghi nhận điểm danh riêng tư trên máy"}</strong>
            <p style="font-size:0.86rem;">"Hôm nay ${escHtml(state.user.name)} đã ghé quán trà và chọn trạng thái: ${escHtml(state.user.mood)}."</p>
            <button type="button" class="btn-secondary" id="btn-share-zalo-card">
              ${ico("share")}
              <span>Chia sẻ thiệp chúc qua Zalo (1 chạm)</span>
            </button>
          </div>
        ` : ""}
      </div>

      ${
        rtSummary.recentList.length > 0
          ? `
        <div class="surface-panel warm" id="real-checkins-live-box">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <strong>Đèn thật vừa thắp sáng trực tuyến</strong>
            <span class="real-peer-pill num">+${rtSummary.totalRealCheckins} thiết bị thật</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:0.9rem;">
            ${rtSummary.recentList
              .slice(0, 5)
              .map(
                (item) =>
                  `<div>• <strong>${escHtml(item.name)} · ${item.age}t</strong> (${escHtml(item.provinceShort)}) — <span>${escHtml(item.mood)}</span></div>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <div class="map-card">
        <div class="map-stats-row">
          <div>
            <small style="color:#D8CCB8;">Đèn sáng hôm nay</small>
            <div><strong class="num">${totalLamps.toLocaleString("vi-VN")} bác</strong></div>
          </div>
          <div style="text-align:right;">
            <small style="color:#D8CCB8;">${escHtml(myProv.short)}</small>
            <div><strong class="num">${lampsOf(myProv).toLocaleString("vi-VN")} lượt</strong></div>
          </div>
        </div>

        <div class="map-canvas-wrap">
          <svg id="vn-map-svg" viewBox="0 0 360 520" role="img" aria-label="Bản đồ thắp đèn 34 tỉnh thành Việt Nam, Hoàng Sa, Trường Sa và Người Việt xa quê">
            <!-- Stylized Vietnam Outline -->
            <path d="M90,54 L148,46 L202,52 L228,92 L208,124 L172,144 L164,194 L196,248 L228,282 L242,366 L220,418 L178,448 L156,496 L124,500 L114,464 L138,426 L168,400 L196,350 L182,278 L140,214 L128,150 L96,118 L72,88 Z"
              fill="#152336" stroke="#3B5978" stroke-width="2" />
            <!-- Hoàng Sa & Trường Sa boxes -->
            <rect x="262" y="252" width="66" height="44" rx="8" fill="#111C2D" stroke="#2D4663" stroke-dasharray="4 3" />
            <rect x="272" y="408" width="68" height="46" rx="8" fill="#111C2D" stroke="#2D4663" stroke-dasharray="4 3" />
            <!-- Xa quê box -->
            <rect x="16" y="244" width="76" height="46" rx="8" fill="#111C2D" stroke="#2D4663" stroke-dasharray="4 3" />
            ${mapDots}
          </svg>
        </div>
        <small style="color:#D8CCB8;">Chạm vào chấm sáng trên bản đồ để xem số lượt điểm danh từng tỉnh.</small>
      </div>

      <div class="surface-panel">
        <h3>Xếp hạng tỉnh sáng đèn hôm nay</h3>
        <div class="province-rank-list">
          ${sortedProvinces.map((p, idx) => `
            <div class="province-rank-item">
              <span><strong>${idx + 1}. ${escHtml(p.name)}</strong></span>
              <span class="badge-tag amber num">${lampsOf(p).toLocaleString("vi-VN")} đèn</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    document.getElementById("checkin-province").addEventListener("change", (e) => {
      state.user.provinceId = e.target.value;
      saveState();
      updateGlobalChrome();
      renderCheckin();
    });

    els.main.querySelectorAll(".mood-btn").forEach((b) => {
      b.addEventListener("click", () => {
        state.user.mood = b.dataset.mood;
        saveState();
        renderCheckin();
      });
    });

    document.getElementById("btn-do-checkin").addEventListener("click", () => {
      if (!state.user.checkedInToday) {
        state.user.checkedInToday = true;
        state.user.streakDays += 1;
        state.user.daysHistory[6] = true;
        unlockTitleFrame("tri-am", "Tri Âm Sáng Sớm");
        trackEvent("morning_checkin_done");
        addXu(5, "Điểm danh sáng bình an");
      } else {
        showToast(`Đã thắp sáng lại lời chúc tại ${myProv.short}!`);
      }
      if (RT) {
        RT.publishMorningCheckin({
          name: state.user.name,
          age: getUserAge(),
          provinceId: myProv.id,
          provinceShort: myProv.short,
          mood: state.user.mood
        });
      }
      saveState();
      updateGlobalChrome();
      renderCheckin();
    });

    const shareBtn = document.getElementById("btn-share-zalo-card");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        const dataUrl = drawGreetingCardDataUrl(myProv.short, state.user.mood);
        const baseShare = getPublicBaseUrl();
        const checkinUrl = `${baseShare}?tinh=${encodeURIComponent(state.user.provinceId)}`;
        const checkinPost = `Sáng nay ${state.user.name} (${getUserAge()} tuổi, ${myProv.short}) đã điểm danh bình an tại Quán Trà Tuổi Bạc — trạng thái: ${state.user.mood}. Chúc cả nhà và hội đồng niên ngày mới nhiều sức khỏe!\nMời vào quán trà cùng tôi tại: ${checkinUrl}`;

        openDialog(
          "Chia sẻ Thiệp & Mã QR buổi sáng",
          `
          <img src="${dataUrl}" alt="Thiệp điểm danh Tuổi Bạc" style="width:100%; border-radius:12px; border:1px solid #D5C4AA;" />
          <div class="btn-row">
            <a class="btn-primary" href="${dataUrl}" download="thiep-tuoi-bac.png" style="text-decoration:none;">Lưu ảnh QR</a>
            <button type="button" class="btn-jade" id="btn-web-share-card">${ico("share")}<span>Chia sẻ nhanh</span></button>
          </div>
          ${renderSocialShareKitHtml({
            prefix: "checkin-share",
            shareUrl: checkinUrl,
            postText: checkinPost
          })}
          `
        );
        bindSocialShareKit({
          prefix: "checkin-share",
          shareUrl: checkinUrl,
          postText: checkinPost
        });
        document.getElementById("btn-web-share-card").addEventListener("click", async () => {
          const postEl = document.getElementById("checkin-share-post-in");
          const currentText = postEl ? postEl.value : checkinPost;
          if (navigator.share) {
            try {
              await navigator.share({
                title: "Lời chúc buổi sáng từ Tuổi Bạc",
                text: currentText,
                url: checkinUrl
              });
              showToast("Đã mở bảng chia sẻ lên mạng xã hội!");
              return;
            } catch (err) {
              // Fall back to clipboard
            }
          }
          copyTextSafe(currentText, "Đã sao chép lời chúc kèm link để dán lên Zalo / Facebook!");
        });
      });
    }

    els.main.querySelectorAll(".map-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const p = getProvince(dot.dataset.prov);
        showToast(`${p.name}: ${p.lamps.toLocaleString("vi-VN")} lượt điểm danh.`);
      });
    });
  }

  // ==================== MODULE 2: TEA ROOM + 0-TOKEN SELF-LEARNING ====================
  function cleanAndApplyDictionary(rawText) {
    let text = String(rawText || "").trim();
    D.FILLER_WORDS.forEach((rx) => {
      text = text.replace(rx, "");
    });
    text = text.trim();

    // Regex safety check: block >=8 digits, URLs, scam keywords
    const digitsOnly = text.replace(/[\s.-]/g, "");
    if (/\d{8,}/.test(digitsOnly) || /https?:\/\/|www\.|\.vn\b|\.com\b/i.test(text) || /(chuyển khoản|số tài khoản|nạp thẻ|trúng thưởng)/i.test(text)) {
      return { blocked: true, reason: "Hệ thống tự động chặn số điện thoại, số tài khoản, đường link hoặc từ khóa xin tiền để bảo vệ các bác." };
    }

    const appliedDict = [];
    state.phoneticDict.forEach((entry) => {
      const escaped = entry.wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "gi");
      if (rx.test(text)) {
        text = text.replace(rx, entry.right);
        appliedDict.push(entry);
      }
    });

    // Bước 2: Phát hiện cụm từ mới chưa có trong từ điển (mô phỏng AI chỉnh câu & đề xuất cặp học mới)
    const unknownFixes = [
      { wrong: "lá ngãi cứu", right: "lá ngải cứu" },
      { wrong: "đau nưng", right: "đau lưng" },
      { wrong: "mất ngủ đêm", right: "trằn trọc ban đêm" },
      { wrong: "uống nươc", right: "uống nước" }
    ];

    let learnedCandidate = null;
    let aiPolished = text;

    unknownFixes.forEach((fix) => {
      if (aiPolished.toLowerCase().includes(fix.wrong) && !state.phoneticDict.some((d) => d.wrong === fix.wrong)) {
        const rx = new RegExp(fix.wrong, "gi");
        aiPolished = aiPolished.replace(rx, fix.right);
        learnedCandidate = fix;
      }
    });

    // Format punctuation & polite ending
    if (aiPolished.length > 0) {
      aiPolished = aiPolished.charAt(0).toUpperCase() + aiPolished.slice(1);
      aiPolished = aiPolished.replace(/^(Sáng nay|Hôm qua|Chiều qua|Dạo này|Ở quê tôi)\s+/i, "$1, ");
      if (!/(ạ|nhé|bác|nhỉ)[.!?]?$/i.test(aiPolished)) {
        aiPolished = aiPolished.replace(/[.!?]*$/, "") + " các bác ạ.";
      } else if (!/[.!?]$/.test(aiPolished)) {
        aiPolished += ".";
      }
    }

    // Cap at 120 chars (~25 words) so Bảng lời bàn trà never overflows 2 lines
    if (aiPolished.length > 120) {
      aiPolished = aiPolished.slice(0, 117).trim() + "...";
    }

    const needsAI = Boolean(learnedCandidate) || appliedDict.length === 0;
    return {
      blocked: false,
      afterDictText: text,
      aiPolished,
      appliedDict,
      learnedCandidate,
      needsAI
    };
  }

  function getHabitLabel(habitId) {
    const found = D.HABIT_TAGS.find((h) => h.id === habitId);
    return found ? found.label : habitId;
  }

  function getCurrentRoom() {
    const rooms = state.teaRoom.rooms || [];
    return rooms.find((r) => r.id === state.teaRoom.roomId) || rooms[0];
  }

  function getCurrentTable() {
    if (state.teaRoom.articleTable) {
      return state.teaRoom.articleTable;
    }
    const room = getCurrentRoom();
    return room.tables[state.teaRoom.tableIdx] || room.tables[0];
  }

  function stripVnAccents(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  function getReadersForArticle(art) {
    if (Array.isArray(art.readerIds) && art.readerIds.length > 0) {
      const list = art.readerIds
        .map((rid) => D.SENIOR_DIRECTORY.find((s) => s.id === rid))
        .filter(Boolean)
        .map((s) => Object.assign({}, s, { habits: (s.habits || []).slice() }));
      if (list.length > 0) return list;
    }
    let h = 0;
    const key = String(art.id || art.title || "news");
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997;
    const picked = [];
    for (let k = 0; k < 3; k++) {
      const s = D.SENIOR_DIRECTORY[(h + k * 5) % D.SENIOR_DIRECTORY.length];
      if (s && !picked.some((p) => p.id === s.id)) {
        picked.push(Object.assign({}, s, { habits: (s.habits || []).slice() }));
      }
    }
    return picked;
  }

  function joinArticleDiscussionTable(art, silentNav) {
    const readers = getReadersForArticle(art);
    const r0 = readers[0] || D.SENIOR_DIRECTORY[0];
    const r1 = readers[1] || D.SENIOR_DIRECTORY[1];
    const defaultLog = [
      {
        speaker: `${r0.name} · ${r0.age} tuổi (${r0.province})`,
        text: `Tôi vừa đọc tin "${art.title.slice(0, 72)}${art.title.length > 72 ? "..." : ""}", mời các anh chị vào đàm đạo cùng nhé.`
      },
      {
        speaker: `${r1.name} · ${r1.age} tuổi (${r1.province})`,
        text: `Chủ đề "${art.tag || "Điểm báo"}" sáng nay thiết thực quá, ngồi nhấp chén trà bàn chuyện này rất hợp ý.`
      }
    ];
    const customLog =
      Array.isArray(art.discussionLog) && art.discussionLog.length > 0
        ? art.discussionLog.map((x) => Object.assign({}, x))
        : defaultLog;

    state.teaRoom.roomId = "phong-tra";
    state.teaRoom.subView = "table";
    state.teaRoom.activeNewspaperRef = Object.assign({}, art);
    state.teaRoom.articleTable = {
      id: `ban-bao-${art.id}`,
      shortLabel: "B.Báo",
      name: `Bàn Đàm Đạo: ${art.tag || "Điểm Báo"}`,
      topic: art.title,
      isArticleTable: true,
      article: Object.assign({}, art),
      tags: ["doc-bao", "uong-tra"],
      members: readers,
      initialLog: customLog,
      quickReplies: Array.isArray(art.quickReplies) ? art.quickReplies.slice() : null
    };
    state.teaRoom.log = customLog.slice();
    pendingQueue = [];
    saveState();

    if (!silentNav) {
      showToast(`Đã vào bàn đàm đạo cùng ${readers.length} anh chị đang đọc tin này!`);
      navigate("tearoom");
    }
  }

  function openArticleDetailModal(art) {
    const readers = getReadersForArticle(art);
    const pointsHtml =
      Array.isArray(art.detailPoints) && art.detailPoints.length > 0
        ? `
        <div class="surface-panel warm" style="gap:6px;">
          <strong>Điểm chính của bản tin:</strong>
          ${art.detailPoints.map((pt) => `<div style="font-size:0.92rem;">• ${escHtml(pt)}</div>`).join("")}
        </div>
      `
        : "";

    openDialog(
      art.tag || "Chi tiết bản tin",
      `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <h3 style="font-family:var(--font-serif); line-height:1.38;">${escHtml(art.title)}</h3>
        <small style="color:var(--ink-secondary); font-weight:600;">${escHtml(art.source)}</small>
        <p style="font-size:0.98rem; line-height:1.6;">${escHtml(art.body)}</p>
        ${pointsHtml}
        <div class="surface-panel" style="padding:12px;">
          <strong>Đang cùng đọc tin này (${readers.length} anh chị):</strong>
          <div class="member-pill-list">
            ${readers
              .map(
                (m) => `
              <div class="member-chip-btn" style="cursor:default;">
                ${renderSeniorAvatarSvg(m)}
                <span class="member-chip-meta">
                  <span class="member-chip-top">
                    <strong>${escHtml(m.name)} <span class="member-age-inline">· ${m.age} tuổi</span></strong>
                    <span class="member-chip-prov">${escHtml(m.province)}</span>
                  </span>
                  <small>${escHtml((m.habits || []).slice(0, 2).map(getHabitLabel).join(" · "))}</small>
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="modal-read-art-btn">${ico("speaker")}<span>Nghe đọc tin</span></button>
          <button type="button" class="btn-primary" id="modal-join-art-btn">${ico("tea")}<span>Vào bàn đàm đạo (${readers.length})</span></button>
        </div>
      </div>
      `
    );

    document.getElementById("modal-read-art-btn").addEventListener("click", () => {
      trackEvent("news_article_read");
      const extra = Array.isArray(art.detailPoints) ? " " + art.detailPoints.join(" ") : "";
      speak(`${art.title}. ${art.body}${extra}`, { announceToast: true });
    });
    document.getElementById("modal-join-art-btn").addEventListener("click", () => {
      trackEvent("news_article_read");
      closeDialog();
      joinArticleDiscussionTable(art, false);
    });
  }

  function scoreTableMatch(table) {
    const userHabits = state.user.habits || [];
    const userProvId = state.user.provinceId;
    const uAge = getUserAge();
    let pts = 45;
    const reasons = [];

    table.tags.forEach((tag) => {
      if (userHabits.includes(tag)) {
        pts += 12;
      }
    });

    table.members.forEach((m) => {
      if (m.provinceId === userProvId) {
        pts += 22;
        reasons.push(`Cùng quê ${m.province} với ${m.name} (${m.age} tuổi)`);
      }
      if (m.age && Math.abs(m.age - uAge) <= 3) {
        pts += 10;
        reasons.push(`Trạc tuổi ${uAge} với ${m.name} (${m.age} tuổi)`);
      }
      const shared = (m.habits || []).filter((h) => userHabits.includes(h));
      if (shared.length > 0) {
        pts += shared.length * 14;
        reasons.push(`Hợp ${getHabitLabel(shared[0])} với ${m.name}`);
      }
    });

    if (table.members.length >= 2 && table.members.length <= 3) {
      pts += 8;
    }

    const uniqReasons = Array.from(new Set(reasons)).slice(0, 3);
    if (uniqReasons.length === 0) {
      uniqReasons.push(`Bàn đang có ${table.members.length} anh chị trò chuyện cởi mở`);
    }

    return {
      score: pts,
      percent: Math.min(99, Math.max(58, pts)),
      reasons: uniqReasons
    };
  }

  function buildMyRealtimePeerInfo() {
    return {
      memberCode: state.auth && state.auth.isRegistered ? state.auth.memberCode : "",
      name: state.user.name,
      age: getUserAge(),
      gender: state.user.honorific === "Chị" ? "female" : "male",
      provinceId: state.user.provinceId,
      province: getProvince(state.user.provinceId).short,
      habits: (state.user.habits || []).slice(),
      bio: state.auth && state.auth.primaryUnitLabel
        ? `${state.user.name} · ${state.auth.primaryUnitLabel}`
        : `${state.user.name} đang trực tuyến trên điện thoại thật tại bàn trà.`,
      outfitColor: getOutfit(state.user.outfitId).color,
      hat: state.user.accessoryId || "glasses",
      item: state.user.itemId,
      titleFrameId: state.user.titleFrameId || "tri-am",
      badge: "Trực tuyến",
      isRealPeer: true
    };
  }

  function applyCustomTableMeta(baseTable) {
    if (!baseTable) return baseTable;
    const cleanKey = String(baseTable.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const remoteMap = RT && typeof RT.getAllTableCustomMeta === "function" ? RT.getAllTableCustomMeta() : {};
    const custom = remoteMap[cleanKey] || (state.customTables && state.customTables[cleanKey]) || null;
    if (!custom || !custom.customName) return baseTable;
    return Object.assign({}, baseTable, {
      name: custom.customName,
      customShortTitle: custom.customShortTitle || custom.customName.replace(/^Bàn\s*\d+\s*[:·-]?\s*/i, "").slice(0, 12),
      topic: custom.customTopic || baseTable.topic,
      hostOwnerName: custom.hostName || "",
      hostOwnerCode: custom.hostCode || "",
      isHostNamed: true
    });
  }

  function getTableWithRealPeers(baseTable) {
    if (!baseTable) return baseTable;
    const withCustom = applyCustomTableMeta(baseTable);
    const realPeers = RT ? RT.getPeersAtTable(baseTable.id) : [];
    if (realPeers.length === 0) return withCustom;
    const mergedMembers = realPeers
      .map((p) => Object.assign({}, p, { isRealPeer: true }))
      .concat(withCustom.members)
      .slice(0, 4);
    return Object.assign({}, withCustom, {
      members: mergedMembers,
      realPeerCount: realPeers.length
    });
  }

  function openHostCustomTableModal(room, defaultTableIdx) {
    const safeIdx = Math.max(0, Math.min(room.tables.length - 1, Number(defaultTableIdx) || 0));
    const curTbl = getTableWithRealPeers(room.tables[safeIdx]);
    openDialog(
      "Đặt Tên Bàn Trà Đàm Đạo (Chủ Bàn)",
      `
      <div class="surface-panel warm">
        <strong>Chủ bàn tự đặt chủ đề để mời bạn hợp ý vào đàm đạo</strong>
        <p style="font-size:0.88rem;">Tên bàn và chủ đề mới sẽ hiện ngay trên Sảnh Toàn Cảnh và đồng bộ sang điện thoại các thành viên khác.</p>
      </div>

      <label class="field-label">
        Chọn bàn muốn làm Chủ bàn (${escHtml(room.shortName)})
        <select class="select-lg" id="host-tbl-idx-in">
          ${room.tables
            .map((t, i) => {
              const eff = getTableWithRealPeers(t);
              return `<option value="${i}" ${i === safeIdx ? "selected" : ""}>Bàn ${i + 1} — ${escHtml(eff.name)}</option>`;
            })
            .join("")}
        </select>
      </label>

      <label class="field-label">
        Tên bàn trà đàm đạo (hiển thị nổi bật)
        <input type="text" class="input-lg" id="host-tbl-name-in" maxlength="48" value="${escHtml(
          curTbl.isHostNamed ? curTbl.name : `Bàn ${safeIdx + 1}: Đàm đạo cùng ${state.user.name}`
        )}" placeholder="VD: Bàn Anh Sơn: Chuyện Cờ Tàn & Trà Thái" />
      </label>

      <label class="field-label">
        Chủ đề mời gọi dưới tên bàn
        <input type="text" class="input-lg" id="host-tbl-topic-in" maxlength="68" value="${escHtml(
          curTbl.topic || "Uống trà sáng, bàn chuyện thời sự & sức khỏe"
        )}" />
      </label>

      <label class="field-label">
        Lời chào mở đầu của Chủ bàn trên Bảng lời bàn trà
        <input type="text" class="input-lg" id="host-tbl-welcome-in" maxlength="100" value="Mời các anh chị ghé bàn dùng chén trà nóng và cùng đàm đạo chủ đề hôm nay nhé!" />
      </label>

      <button type="button" class="btn-primary" id="btn-save-host-table">
        ${ico("tea")}
        <span>Lưu Tên Bàn &amp; Ngồi Vào Làm Chủ Bàn</span>
      </button>
      `
    );

    document.getElementById("btn-save-host-table").addEventListener("click", () => {
      const pickedIdx = Number(document.getElementById("host-tbl-idx-in").value) || 0;
      const rawTitle = (document.getElementById("host-tbl-name-in").value || "").trim();
      const rawTopic = (document.getElementById("host-tbl-topic-in").value || "").trim();
      const welcomeLine = (document.getElementById("host-tbl-welcome-in").value || "").trim();
      if (!rawTitle) {
        showToast("Vui lòng nhập tên bàn đàm đạo.");
        return;
      }
      const targetBase = room.tables[pickedIdx];
      const cleanKey = String(targetBase.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const formattedName = /^Bàn\s*\d+/i.test(rawTitle) ? rawTitle : `Bàn ${pickedIdx + 1}: ${rawTitle}`;
      const shortTitle = rawTitle.replace(/^Bàn\s*\d+\s*[:·-]?\s*/i, "").slice(0, 12);
      const metaObj = {
        tableKey: cleanKey,
        roomId: room.id,
        tableIdx: pickedIdx,
        customName: formattedName,
        customShortTitle: shortTitle,
        customTopic: rawTopic || targetBase.topic,
        hostName: `${state.user.name} · ${getUserAge()}t`,
        hostCode: (state.auth && state.auth.memberCode) || (RT ? RT.getClientId() : "")
      };
      if (!state.customTables) state.customTables = {};
      state.customTables[cleanKey] = metaObj;
      if (RT && typeof RT.publishTableCustomMeta === "function") {
        RT.publishTableCustomMeta(cleanKey, metaObj);
      }
      awardSeniorityPoints(8, "table_hosted", "giao-luu", `Đặt tên bàn đàm đạo: "${formattedName}"`);
      closeDialog();
      joinTable(pickedIdx);
      if (welcomeLine) {
        sendUserTeaMessage(welcomeLine, { source: "quick" });
      }
      showToast(`Đã mở "${formattedName}" — bác đang là Chủ bàn!`);
    });
  }

  function renderStickerArtSvg(stk) {
    const c = (stk && stk.color) || "#B83B2A";
    const bg = (stk && stk.bg) || "#FFF6DE";
    let inner = "";
    switch (stk && stk.kind) {
      case "tea":
        inner = `<path d="M9 17h14v5a7 7 0 0 1-14 0v-5z" fill="${c}"/><path d="M23 18h2.5a2.5 2.5 0 0 1 0 5H23" fill="none" stroke="${c}" stroke-width="2"/><path d="M13 13q-1-3 1-5M18 13q1-3-1-5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`;
        break;
      case "thumb":
        inner = `<path d="M13 25H9v-9h4v9zm2-9l3.2-6.5A2 2 0 0 1 21 11v4h4.5a2 2 0 0 1 1.9 2.6l-2 6A2 2 0 0 1 23.5 25H15v-9z" fill="${c}"/>`;
        break;
      case "lotus":
        inner = `<path d="M18 9c2.5 4 3.5 7.5 0 12-3.5-4.5-2.5-8 0-12z" fill="${c}"/><path d="M18 21c-4-1-7-4-7-8 3.5.5 6 3 7 8zm0 0c4-1 7-4 7-8-3.5.5-6 3-7 8z" fill="${c}" opacity="0.78"/><path d="M10 24c4 2 12 2 16 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
        break;
      case "smile":
        inner = `<circle cx="18" cy="18" r="9.5" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M13.5 16q1-1.8 2.2 0M20.3 16q1-1.8 2.2 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M13.2 20.2q4.8 4.5 9.6 0" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`;
        break;
      case "chess":
        inner = `<circle cx="18" cy="18" r="9.5" fill="#FFFDF7" stroke="${c}" stroke-width="2.2"/><path d="M13.5 14.5h9M18 12v12M13.5 21.5h9" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
        break;
      case "star":
        inner = `<polygon points="18,8.5 20.8,14.4 27.2,15.3 22.5,19.8 23.6,26.2 18,23.1 12.4,26.2 13.5,19.8 8.8,15.3 15.2,14.4" fill="${c}"/>`;
        break;
      case "heart":
        inner = `<path d="M18 26.2s-8.5-5.2-8.5-11A4.8 4.8 0 0 1 18 12a4.8 4.8 0 0 1 8.5 3.2c0 5.8-8.5 11-8.5 11z" fill="${c}"/>`;
        break;
      default:
        inner = `<path d="M18 9a6 6 0 0 1 6 6v4l2 2.5H10L12 19v-4a6 6 0 0 1 6-6z" fill="${c}"/><circle cx="18" cy="24.5" r="2" fill="${c}"/>`;
    }
    return `<span class="sticker-art-badge" style="background:${escHtml(bg)}"><svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true">${inner}</svg></span>`;
  }

  function formatTeaLineRichHtml(entry, isCurrent) {
    if (!entry) return "";
    const foundStk =
      (entry.stickerId && (D.TEA_STICKERS || []).find((s) => s.id === entry.stickerId)) ||
      (D.TEA_STICKERS || []).find((s) => entry.text === s.fullText);
    if (foundStk) {
      return `<span style="color:var(--accent-terracotta);font-weight:700;">${escHtml(entry.speaker)}:</span> <span class="tea-sticker-inline-card" style="background:${escHtml(foundStk.bg)};color:${escHtml(foundStk.color)};border-color:${escHtml(foundStk.color)}">${renderStickerArtSvg(foundStk)}<span>${escHtml(foundStk.shortLabel)}</span></span>`;
    }
    if (isCurrent) {
      return `<span style="color:var(--accent-terracotta);">${escHtml(entry.speaker)}:</span> "${escHtml(entry.text)}"`;
    }
    return `${escHtml(entry.speaker)}: "${escHtml(entry.text)}"`;
  }

  function sendUserTeaSticker(stk) {
    if (!stk) return;
    if (getCooldownRemaining() > 0) {
      showToast("Bác đợi vài giây nhịp nhấp trà rồi gửi tiếp nhé!");
      return;
    }
    const provShort = getProvince(state.user.provinceId).short;
    const baseTable = getCurrentTable();
    const table = getTableWithRealPeers(baseTable);
    const userSeatIdx = Math.min(4, table.members.length);
    const speakerLabel = `${state.user.name} · ${getUserAge()} tuổi (${provShort})`;
    state.teaRoom.lastSentAt = Date.now();
    lastTableActivityAt = Date.now();

    if (stk.ritual === "pour" && window.TeaRoomScene) {
      window.TeaRoomScene.triggerTeaService();
    }
    if (window.TeaRoomScene && typeof window.TeaRoomScene.showSeatSticker === "function") {
      window.TeaRoomScene.showSeatSticker(userSeatIdx, stk.shortLabel, stk.bg, stk.color);
    }
    playWoodPieceClack(false);
    trackEvent("tea_msg_quick_0token");
    const peerNames = (table.members || []).map((m) => m.name);
    awardSeniorityPoints(
      2,
      "tea_sticker",
      "giao-luu",
      `Gửi Sticker "${stk.shortLabel}" tại ${table.name}`,
      {
        eventType: "chat_message",
        module: "tearoom",
        inputMethod: "sticker_1tap",
        text: stk.fullText,
        stickerId: stk.id,
        stickerLabel: stk.shortLabel,
        roomId: state.teaRoom.roomId,
        tableId: baseTable.id,
        tableName: table.name,
        companions: peerNames,
        topicHint: table.topic || "Trà đàm buổi sáng"
      }
    );

    pushTableMessage(speakerLabel, stk.fullText, userSeatIdx, stk.id);

    if (RT) {
      const nextSlice = state.teaRoom.log
        .concat([{ speaker: speakerLabel, text: stk.fullText, stickerId: stk.id }])
        .slice(-8);
      RT.sendTableMessage(baseTable.id, speakerLabel, stk.fullText, stk.ritual || null, nextSlice, {
        stickerId: stk.id,
        stickerLabel: stk.shortLabel
      });
    }

    const realPeersHere = RT ? RT.getPeersAtTable(baseTable.id) : [];
    if (realPeersHere.length === 0 && table.members.length > 0) {
      const peerIdx = Math.floor(Math.random() * table.members.length);
      const peer = table.members[peerIdx];
      const replyPool = D.TEA_STICKERS || [];
      const replyStk = replyPool[(peerIdx + 2) % replyPool.length];
      setTimeout(() => {
        if (state.route === "tearoom" && state.teaRoom.subView === "table" && replyStk) {
          if (window.TeaRoomScene && typeof window.TeaRoomScene.showSeatSticker === "function") {
            window.TeaRoomScene.showSeatSticker(peerIdx, replyStk.shortLabel, replyStk.bg, replyStk.color);
          }
          pushTableMessage(`${peer.name} · ${peer.age} tuổi (${peer.province})`, replyStk.fullText, peerIdx, replyStk.id);
        }
      }, 4200);
    }

    startCooldownTicker();
  }

  function joinTable(idx) {
    const room = getCurrentRoom();
    const safeIdx = Math.max(0, Math.min(room.tables.length - 1, idx));
    const table = room.tables[safeIdx];
    state.teaRoom.articleTable = null;
    state.teaRoom.activeNewspaperRef = null;
    state.teaRoom.tableIdx = safeIdx;
    state.teaRoom.subView = "table";
    state.teaRoom.log = table.initialLog.slice();
    if (room.id === "phong-co") {
      switchXiangqiMode(safeIdx === 0 ? "puzzle" : "ai");
    }
    pendingQueue = [];
    lastTableActivityAt = Date.now();
    trackEvent("tea_table_joined");
    saveState();
    syncMyGlobalOnlinePresence();
    showToast(`Đã ngồi vào ${table.name} (${room.shortName}).`);
    renderTeaRoom();
  }

  function switchNextTableFast() {
    const room = getCurrentRoom();
    const nextIdx = (state.teaRoom.tableIdx + 1) % room.tables.length;
    joinTable(nextIdx);
  }

  function triggerIdleAssistantPrompt() {
    if (state.route !== "tearoom" || state.teaRoom.subView !== "table") return;
    lastTableActivityAt = Date.now();
    const room = getCurrentRoom();
    const table = getCurrentTable();
    const hostLabel = room.hostName || "Chị Trà (Trợ lý)";
    let promptText = "";
    if (table.isArticleTable && table.article) {
      promptText = `Tôi vừa châm thêm trà nóng. Về bản tin "${table.article.title.slice(0, 46)}...", chỗ các anh chị có câu chuyện thực tế nào gần gũi không ạ?`;
    } else {
      const pool = D.IDLE_ICEBREAKERS || [];
      promptText = pool[idlePromptRotIdx % Math.max(1, pool.length)] || "Mời cả bàn dùng thêm chén trà nóng và kể chuyện sáng nay nhé!";
      idlePromptRotIdx += 1;
    }
    if (window.TeaRoomScene && typeof window.TeaRoomScene.triggerTeaService === "function") {
      window.TeaRoomScene.triggerTeaService();
    }
    trackEvent("idle_prompts_triggered");
    pushTableMessage(hostLabel, promptText, null);
    showToast(`${hostLabel} vừa rót trà và gợi mở chủ đề mới sau 60 giây yên ắng.`);
  }

  function matchThreeReplies(latestText) {
    const low = String(latestText || "").toLowerCase();
    const userProv = getProvince(state.user.provinceId).short;
    const table = getTableWithRealPeers(getCurrentTable());
    const lastLog = state.teaRoom.log[state.teaRoom.log.length - 1];
    const speakerName = lastLog ? lastLog.speaker.split("(")[0].split("·")[0].trim() : table.members[0].name;

    if (
      table.isArticleTable &&
      Array.isArray(table.quickReplies) &&
      table.quickReplies.length >= 3 &&
      state.teaRoom.log.length <= (table.initialLog ? table.initialLog.length + 1 : 3)
    ) {
      return table.quickReplies.slice(0, 3).map((tpl) =>
        tpl.replace(/\{ten\}/g, speakerName).replace(/\{tinh\}/g, userProv)
      );
    }

    let chosen = state.replyTemplates.find((group) =>
      group.keywords.some((kw) => low.includes(kw.toLowerCase()))
    );
    if (!chosen && table.isArticleTable && table.article && table.article.topicKeyword) {
      chosen = state.replyTemplates.find((g) => g.topic === table.article.topicKeyword);
    }
    if (!chosen) {
      chosen = state.replyTemplates[state.replyTemplates.length - 1];
    }

    return chosen.replies.slice(0, 3).map((tpl) =>
      tpl.replace(/\{ten\}/g, speakerName).replace(/\{tinh\}/g, userProv)
    );
  }

  function pushTableMessage(speaker, text, seatIdx, stickerId) {
    const trimmed = String(text || "").trim();
    const safeText = trimmed.length > 120 ? trimmed.slice(0, 117).trim() + "..." : trimmed;
    lastTableActivityAt = Date.now();
    pendingQueue.push({ speaker, text: safeText, seatIdx, stickerId: stickerId || null });
    processQueueStep();
  }

  function processQueueStep() {
    if (teaQueueTimerId || pendingQueue.length === 0) return;
    const nextItem = pendingQueue.shift();
    state.teaRoom.log.push({
      speaker: nextItem.speaker,
      text: nextItem.text,
      stickerId: nextItem.stickerId || null
    });
    if (state.teaRoom.log.length > 30) {
      state.teaRoom.log = state.teaRoom.log.slice(-30);
    }
    saveState();

    if (typeof nextItem.seatIdx === "number") {
      window.TeaRoomScene.setSpeaker(nextItem.seatIdx);
    }
    if (state.route === "tearoom") {
      updateTeaBoardDom();
    }

    if (pendingQueue.length > 0) {
      teaQueueTimerId = setTimeout(() => {
        teaQueueTimerId = null;
        processQueueStep();
      }, 5000);
    }
  }

  function getCooldownRemaining() {
    const diff = Math.floor((Date.now() - (state.teaRoom.lastSentAt || 0)) / 1000);
    return Math.max(0, 10 - diff);
  }

  function sendUserTeaMessage(text, opts) {
    const provShort = getProvince(state.user.provinceId).short;
    const baseTable = getCurrentTable();
    const table = getTableWithRealPeers(baseTable);
    const userSeatIdx = Math.min(4, table.members.length);
    const speakerLabel = `${state.user.name} · ${getUserAge()} tuổi (${provShort})`;
    state.teaRoom.lastSentAt = Date.now();
    lastTableActivityAt = Date.now();
    const src = (opts && opts.source) || "quick";
    const inputMethod =
      src === "voice"
        ? "voice_speech"
        : src === "typed" || src === "voice_or_text"
        ? "typed_text"
        : "quick_0token";
    if (src === "voice" || src === "typed" || src === "voice_or_text") {
      trackEvent("tea_msg_voice_or_text");
    } else {
      trackEvent("tea_msg_quick_0token");
    }
    const peerNames = (table.members || []).map((m) => m.name);
    if (src === "voice") {
      awardSkillPoints("voice_wisdom", 4);
    }
    awardSeniorityPoints(
      src === "voice" ? 3 : 2,
      src === "voice" ? "tea_voice_chat" : "tea_chat_msg",
      "giao-luu",
      `Trò chuyện (${inputMethod}) tại ${table.name}: "${String(text || "").slice(0, 68)}"`,
      {
        eventType: "chat_message",
        module: "tearoom",
        inputMethod,
        text: String(text || ""),
        roomId: state.teaRoom.roomId,
        tableId: baseTable.id,
        tableName: table.name,
        companions: peerNames,
        topicHint: table.topic || "Trà đàm buổi sáng"
      }
    );
    saveState();

    pushTableMessage(speakerLabel, text, userSeatIdx);

    if (RT) {
      const nextSlice = state.teaRoom.log.concat([{ speaker: speakerLabel, text }]).slice(-8);
      RT.sendTableMessage(baseTable.id, speakerLabel, text, opts && opts.ritual ? opts.ritual : null, nextSlice);
    }

    // Only simulate NPC companion reply if no real human peer is sitting at this table right now
    const realPeersHere = RT ? RT.getPeersAtTable(baseTable.id) : [];
    if (realPeersHere.length === 0 && table.members.length > 0) {
      const peerIdx = Math.floor(Math.random() * table.members.length);
      const peer = table.members[peerIdx];
      const replies = matchThreeReplies(text);
      const peerReply = replies[0].replace(new RegExp(peer.name, "g"), state.user.name);
      setTimeout(() => {
        if (state.route === "tearoom" && state.teaRoom.subView === "table") {
          pushTableMessage(`${peer.name} · ${peer.age} tuổi (${peer.province})`, peerReply, peerIdx);
        }
      }, 4500);
    }

    startCooldownTicker();
  }

  function startCooldownTicker() {
    clearInterval(cooldownTickId);
    const syncCooldownUi = () => {
      if (state.route !== "tearoom") {
        clearInterval(cooldownTickId);
        return;
      }
      const left = getCooldownRemaining();
      const cdEl = document.getElementById("tea-cooldown-note");
      const btns = els.main.querySelectorAll(".reply-btn, .sticker-btn");
      if (left > 0) {
        if (cdEl) {
          cdEl.hidden = false;
          cdEl.textContent = `Bác nhấp ngụm trà nghe các bác khác nói nhé... (${left}s)`;
        }
        btns.forEach((b) => (b.disabled = true));
      } else {
        if (cdEl) cdEl.hidden = true;
        btns.forEach((b) => (b.disabled = false));
        clearInterval(cooldownTickId);
      }
    };
    syncCooldownUi();
    cooldownTickId = setInterval(syncCooldownUi, 400);
  }

  function updateTeaBoardDom() {
    const prevEl = document.getElementById("tea-line-prev");
    const currEl = document.getElementById("tea-line-curr");
    const replyStack = document.getElementById("tea-reply-stack");
    const log = state.teaRoom.log;
    const prev = log.length >= 2 ? log[log.length - 2] : null;
    const curr = log[log.length - 1];

    if (prevEl) {
      prevEl.innerHTML = prev ? formatTeaLineRichHtml(prev, false) : "";
      prevEl.hidden = !prev;
    }
    if (currEl && curr) {
      currEl.innerHTML = formatTeaLineRichHtml(curr, true);
    }
    if (els.simDict) {
      els.simDict.textContent = `Sổ từ điển tự học (${state.phoneticDict.length})`;
    }
    if (replyStack && curr) {
      const suggestions = matchThreeReplies(curr.text);
      const isCooling = getCooldownRemaining() > 0;
      replyStack.innerHTML = suggestions
        .map(
          (s, idx) =>
            `<button type="button" class="reply-btn" data-reply="${escHtml(s)}" ${isCooling ? "disabled" : ""}>${idx + 1}. "${escHtml(s)}"</button>`
        )
        .join("");
      replyStack.querySelectorAll(".reply-btn").forEach((btn) => {
        btn.addEventListener("click", () => sendUserTeaMessage(btn.dataset.reply));
      });
    }
  }

  function openSeniorProfileDialog(member, tableIdx, room) {
    const isArtTbl = Boolean(state.teaRoom.articleTable && state.teaRoom.subView === "table");
    const tbl = isArtTbl ? state.teaRoom.articleTable : room.tables[tableIdx];
    const userHabits = state.user.habits || [];
    const sameProv = member.provinceId === state.user.provinceId;
    const mCode = member.memberCode || (member.clientId ? `TB-${String(member.clientId).slice(-4).toUpperCase()}` : "");
    const alreadyFriend = isAlreadyFriend(member);
    openDialog(
      `Hồ sơ: ${member.name}`,
      `
      <div class="surface-panel warm">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong>${escHtml(member.name)} (${member.age} tuổi)</strong>
          <span class="badge-tag ${sameProv ? "jade" : ""}">${escHtml(member.province)}</span>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <span class="online-status-pill"><span class="online-dot-live"></span>Đang Online</span>
          ${mCode ? `<span class="member-code-chip">Mã: ${escHtml(mCode)}</span>` : ""}
        </div>
        <p>${escHtml(member.bio)}</p>
        <div class="member-pill-list">
          ${(member.habits || [])
            .map((h) => `<span class="badge-tag ${userHabits.includes(h) ? "jade" : ""}">${escHtml(getHabitLabel(h))}</span>`)
            .join("")}
        </div>
      </div>
      <p style="font-size:0.88rem;">Đang ngồi tại: <strong>${escHtml(tbl.name)}</strong> (${escHtml(isArtTbl ? "Bàn Đàm Đạo Báo Sáng" : room.shortName)})</p>
      <div class="btn-row">
        <button type="button" class="btn-${alreadyFriend ? "secondary" : "jade"}" id="btn-add-friend-from-profile" ${alreadyFriend ? "disabled" : ""}>
          ${ico("users")}
          <span>${alreadyFriend ? "Đã là Bạn tâm giao" : "+ Kết bạn / Đồng đội"}</span>
        </button>
        <button type="button" class="btn-primary" id="btn-join-senior-table">
          ${ico("tea")}
          <span>${isArtTbl ? "Tiếp tục đàm đạo" : "Ngồi cùng bàn"}</span>
        </button>
      </div>
      `
    );
    const addFrBtn = document.getElementById("btn-add-friend-from-profile");
    if (addFrBtn && !alreadyFriend) {
      addFrBtn.addEventListener("click", () => {
        closeDialog();
        requestAddFriendWithAuth(Object.assign({}, member, { memberCode: mCode }));
      });
    }
    document.getElementById("btn-join-senior-table").addEventListener("click", () => {
      closeDialog();
      if (!isArtTbl) joinTable(tableIdx);
    });
  }

  function openCloneRoomDialog() {
    openDialog(
      "Nhân bản phòng sinh hoạt mới",
      `
      <p style="font-size:0.88rem;">Từ 1 khung phòng chuẩn, bác hoặc trưởng CLB có thể mở thêm phòng theo chủ đề riêng (Đọc thơ, Dưỡng sinh, Hội đồng niên...):</p>
      <label class="field-label">
        Tên phòng mới
        <input type="text" class="input-lg" id="clone-room-name" value="Phòng Dưỡng Sinh Sáng" />
      </label>
      <label class="field-label">
        Chọn mẫu khung phòng gốc
        <select class="select-lg" id="clone-base-id">
          ${D.ROOM_TEMPLATES.map((r) => `<option value="${r.id}">${escHtml(r.name)} (${r.tables.length} bàn)</option>`).join("")}
        </select>
      </label>
      <label class="field-label">
        Sở thích trọng tâm của phòng
        <select class="select-lg" id="clone-focus-habit">
          ${D.HABIT_TAGS.map((h) => `<option value="${h.id}" ${h.id === "duong-sinh" ? "selected" : ""}>${escHtml(h.label)}</option>`).join("")}
        </select>
      </label>
      <button type="button" class="btn-jade" id="btn-confirm-clone-room">
        ${ico("check")}
        <span>Tạo & Vào phòng mới ngay</span>
      </button>
      `
    );

    document.getElementById("btn-confirm-clone-room").addEventListener("click", () => {
      const name = document.getElementById("clone-room-name").value.trim() || "Phòng Sinh Hoạt Mới";
      const baseId = document.getElementById("clone-base-id").value;
      const focusHabit = document.getElementById("clone-focus-habit").value;
      const newRoom = D.cloneRoomTemplate(baseId, name, `Không gian giao lưu ${name}`, [focusHabit]);
      state.teaRoom.rooms.push(newRoom);
      state.teaRoom.roomId = newRoom.id;
      state.teaRoom.subView = "lobby";
      state.teaRoom.tableIdx = 0;
      saveState();
      closeDialog();
      showToast(`Đã nhân bản thành công ${newRoom.name} với 6 bàn!`);
      renderTeaRoom();
    });
  }

  function renderRoomSwitcherStrip() {
    const rooms = state.teaRoom.rooms;
    return `
      <div class="room-strip" role="tablist" aria-label="Chọn phòng sinh hoạt">
        ${rooms
          .map(
            (r) =>
              `<button type="button" class="room-tab-btn ${r.id === state.teaRoom.roomId ? "active" : ""}" data-room-id="${r.id}">${escHtml(r.shortName)}</button>`
          )
          .join("")}
        <button type="button" class="room-tab-btn clone-btn" id="btn-clone-room">+ Nhân bản phòng</button>
      </div>
    `;
  }

  function bindRoomSwitcherEvents() {
    els.main.querySelectorAll("[data-room-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rid = btn.dataset.roomId;
        state.teaRoom.roomId = rid;
        state.teaRoom.subView = "lobby";
        state.teaRoom.tableIdx = 0;
        const r = getCurrentRoom();
        state.teaRoom.log = r.tables[0].initialLog.slice();
        pendingQueue = [];
        saveState();
        renderTeaRoom();
      });
    });

    const cloneBtn = document.getElementById("btn-clone-room");
    if (cloneBtn) {
      cloneBtn.addEventListener("click", openCloneRoomDialog);
    }
  }

  function mountRoomSceneView(viewMode, room, table, recommendedIdx) {
    const stageEl = document.getElementById("tearoom-stage");
    const canvasEl = document.getElementById("tearoom-canvas");
    const tagsEl = document.getElementById("avatar-tags-layer");
    const outfit = getOutfit(state.user.outfitId);
    const effectiveTables = room.tables.map((t) => getTableWithRealPeers(t));

    window.TeaRoomScene.mount(
      stageEl,
      canvasEl,
      tagsEl,
      {
        viewMode,
        preferredMode: state.settings.preferredRender,
        roomTheme: room.theme,
        tables: effectiveTables,
        recommendedIdx,
        table: getTableWithRealPeers(table),
        userName: state.user.name,
        userAge: getUserAge(),
        userGender: state.user.honorific === "Chị" ? "female" : "male",
        userProvince: getProvince(state.user.provinceId).short,
        userOutfitColor: outfit.color,
        userItem: state.user.itemId,
        userAccessory: state.user.accessoryId || "none",
        userTitleFrame: state.user.titleFrameId || "tri-am"
      },
      () => {
        state.settings.autoFallbacked = true;
        state.settings.preferredRender = "2.5d";
        saveState();
        updateGlobalChrome();
        const badge = document.getElementById("render-mode-badge");
        if (badge) badge.textContent = "2.5D (Tự hạ cho máy yếu)";
        showToast("Thiết bị chưa hỗ trợ WebGL mượt — đã tự động chuyển sang 2.5D nhẹ.");
      }
    );

    document.getElementById("btn-toggle-render-local").addEventListener("click", () => {
      state.settings.autoFallbacked = false;
      state.settings.preferredRender = state.settings.preferredRender === "3d" ? "2.5d" : "3d";
      saveState();
      updateGlobalChrome();
      renderTeaRoom();
    });
  }

  function renderTeaRoom() {
    const room = getCurrentRoom();
    if (state.teaRoom.subView === "table") {
      renderTeaRoomTableView(room);
    } else {
      if (RT) RT.leaveTableChannel();
      renderTeaRoomLobby(room);
    }
  }

  function computeRoomLobbyPeerKey(room) {
    if (!RT || !room || !Array.isArray(room.tables)) return "";
    return room.tables
      .map((t) => `${t.id}:${RT.getPeersAtTable(t.id).map((p) => p.clientId).sort().join(",")}`)
      .join("|");
  }

  let lastRenderedLobbyPeerKey = "";

  function renderTeaRoomLobby(room) {
    lastRenderedLobbyPeerKey = computeRoomLobbyPeerKey(room);
    const scoredTables = room.tables.map((t, idx) => {
      const eff = getTableWithRealPeers(t);
      return {
        idx,
        table: eff,
        match: scoreTableMatch(eff)
      };
    });
    const best = scoredTables.slice().sort((a, b) => b.match.score - a.match.score)[0];
    const totalSeated = scoredTables.reduce((sum, item) => sum + item.table.members.length, 0);

    els.main.innerHTML = `
      ${renderRoomSwitcherStrip()}

      <div>
        <h1>${escHtml(room.name)}</h1>
        <p class="lead-copy">${escHtml(room.description)} · Hiện có <strong class="num">${totalSeated}</strong> anh chị đang ngồi tại <strong class="num">${room.tables.length}</strong> bàn.</p>
      </div>

      ${
        room.id === "phong-co"
          ? `
        <div class="surface-panel warm" id="phong-co-quick-banner">
          <h3>Bàn Cờ Tướng 9×10 &amp; Kho 6 Thế Cờ Giang Hồ</h3>
          <p style="font-size:0.9rem; color:var(--ink-secondary);">Ngồi vào bất kỳ bàn nào bên dưới đều có sẵn bàn cờ 9×10 ngay tại bàn, hoặc bấm mở toàn màn hình để đánh ngay:</p>
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-lobby-play-full9x10">${ico("xiangqi")}<span>Đánh ván 9×10 thật</span></button>
            <button type="button" class="btn-jade" id="btn-lobby-play-cothe">${ico("award")}<span>Giải 6 Cờ thế</span></button>
          </div>
        </div>
      `
          : ""
      }

      <!-- Thói quen & Sở thích để ghép bàn -->
      <div class="surface-panel">
        <h3>Sở thích & Thói quen của ${getUserPronoun()} (chạm để ghép bàn hợp ý)</h3>
        <div class="habit-grid">
          ${D.HABIT_TAGS.map((h) => {
            const active = (state.user.habits || []).includes(h.id);
            return `<button type="button" class="habit-chip ${active ? "selected" : ""}" data-habit="${h.id}">${escHtml(h.label)}</button>`;
          }).join("")}
        </div>
      </div>

      <!-- Thẻ gợi ý ghép bàn phù hợp nhất -->
      <div class="surface-panel warm" id="smart-match-card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <h3>Gợi ý ghép bàn hợp nhất</h3>
          <span class="badge-tag amber num">${best.match.percent}% hợp</span>
        </div>
        <p><strong>${escHtml(best.table.name)}</strong> (${best.table.members.length}/5 người)</p>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(best.match.reasons.join(" · "))}</p>
        <button type="button" class="btn-primary" id="btn-join-recommended" data-join-idx="${best.idx}">
          ${ico("tea")}
          <span>Ngồi vào ${escHtml(best.table.name)} ngay</span>
        </button>
      </div>

      <!-- Toàn cảnh 3D / 2.5D góc rộng 5 gian (3 cột x 2 hàng, kéo ngang xoay sảnh) -->
      <div class="tearoom-controls-row" style="flex-wrap:wrap;">
        <span class="stage-badge" id="render-mode-badge">${
          state.settings.preferredRender === "3d" ? "Toàn cảnh 5 Gian Góc Rộng" : "Toàn cảnh 2.5D Góc Rộng"
        }</span>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="stage-badge-btn" id="btn-toggle-overview-wide">Góc siêu rộng</button>
          <button type="button" class="stage-badge-btn" id="btn-toggle-render-local">Đổi 3D / 2.5D</button>
        </div>
      </div>
      <div class="tearoom-stage is-overview" id="tearoom-stage" title="Kéo ngang trên hình để lia góc nhìn khắp sảnh trà 5 gian">
        <canvas class="tearoom-canvas" id="tearoom-canvas"></canvas>
        <div class="avatar-tags-layer" id="avatar-tags-layer"></div>
      </div>

      <button type="button" class="btn-secondary" id="btn-lobby-host-rename">
        ${ico("tea")}
        <span>+ Đặt Tên Bàn Trà Đàm Đạo Riêng (Làm Chủ Bàn)</span>
      </button>

      <!-- Danh sách 6 bàn & người đang ngồi -->
      <div class="section-block">
        <h2>Trong phòng đang có ai? (${room.tables.length} bàn)</h2>
        ${scoredTables
          .map(
            (item) => `
          <article class="table-card ${item.idx === best.idx ? "recommended" : ""}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
              <div>
                <h3>${escHtml(item.table.name)}</h3>
                <small style="color:var(--ink-secondary);">${escHtml(item.table.topic)}</small>
                ${
                  item.table.hostOwnerName
                    ? `<div style="margin-top:4px;"><span class="host-owner-pill">Chủ bàn: ${escHtml(item.table.hostOwnerName)}</span></div>`
                    : ""
                }
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                ${item.table.realPeerCount ? `<span class="real-peer-pill num">${item.table.realPeerCount} người thật</span>` : ""}
                <span class="badge-tag ${item.idx === best.idx ? "amber" : "jade"} num">${item.match.percent}% hợp</span>
              </div>
            </div>

            <div class="member-pill-list">
              ${item.table.members
                .map(
                  (m, mIdx) => `
                <button type="button" class="member-chip-btn" data-tidx="${item.idx}" data-midx="${mIdx}">
                  ${renderSeniorAvatarSvg(m)}
                  <span class="member-chip-meta">
                    <span class="member-chip-top">
                      <strong>${escHtml(m.name)} <span class="member-age-inline">· ${m.age} tuổi</span></strong>
                      ${m.isRealPeer ? `<span class="real-peer-pill">Trực tuyến</span>` : `<span class="member-chip-prov">${escHtml(m.province)}</span>`}
                    </span>
                    <small>${escHtml((m.habits || []).slice(0, 2).map(getHabitLabel).join(" · ") || m.province)}</small>
                  </span>
                </button>
              `
                )
                .join("")}
            </div>

            <button type="button" class="btn-jade join-table-btn" data-join-idx="${item.idx}">
              <span>Ngồi vào ${escHtml(item.table.name)} (${item.table.members.length}/5 chỗ)</span>
            </button>
          </article>
        `
          )
          .join("")}
      </div>
    `;

    bindRoomSwitcherEvents();
    mountRoomSceneView("overview", room, room.tables[0], best.idx);

    const wideBtn = document.getElementById("btn-toggle-overview-wide");
    if (wideBtn && window.TeaRoomScene && typeof window.TeaRoomScene.toggleOverviewWide === "function") {
      const syncWideLabel = () => {
        const lv = window.TeaRoomScene.getOverviewWideLevel();
        wideBtn.textContent = lv === "ultrawide" ? "Về góc rộng vừa" : "Góc siêu rộng";
      };
      syncWideLabel();
      wideBtn.addEventListener("click", () => {
        const nextLv = window.TeaRoomScene.toggleOverviewWide();
        syncWideLabel();
        showToast(nextLv === "ultrawide" ? "Đã mở Góc Siêu Rộng toàn cảnh sảnh 5 gian & sân vườn!" : "Đã về Góc Rộng tiêu chuẩn.");
      });
    }

    const lobbyHostBtn = document.getElementById("btn-lobby-host-rename");
    if (lobbyHostBtn) {
      lobbyHostBtn.addEventListener("click", () => openHostCustomTableModal(room, best.idx));
    }

    const playFull9x10Btn = document.getElementById("btn-lobby-play-full9x10");
    if (playFull9x10Btn) {
      playFull9x10Btn.addEventListener("click", () => {
        switchXiangqiMode("ai");
        navigate("xiangqi");
      });
    }
    const playCoTheBtn = document.getElementById("btn-lobby-play-cothe");
    if (playCoTheBtn) {
      playCoTheBtn.addEventListener("click", () => {
        switchXiangqiMode("puzzle");
        navigate("xiangqi");
      });
    }

    els.main.querySelectorAll("[data-habit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const hid = btn.dataset.habit;
        const curr = state.user.habits || [];
        if (curr.includes(hid)) {
          if (curr.length > 1) {
            state.user.habits = curr.filter((x) => x !== hid);
          } else {
            showToast("Bác giữ lại ít nhất 1 sở thích để hệ thống gợi ý ghép bàn nhé.");
            return;
          }
        } else {
          state.user.habits = curr.concat([hid]);
        }
        saveState();
        renderTeaRoom();
      });
    });

    els.main.querySelectorAll("[data-join-idx]").forEach((btn) => {
      btn.addEventListener("click", () => joinTable(Number(btn.dataset.joinIdx)));
    });

    els.main.querySelectorAll(".member-chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tIdx = Number(btn.dataset.tidx);
        const mIdx = Number(btn.dataset.midx);
        const member = scoredTables[tIdx].table.members[mIdx];
        if (member) openSeniorProfileDialog(member, tIdx, room);
      });
    });
  }

  function renderTeaRoomTableView(room) {
    const baseTable = getCurrentTable();
    if (RT) {
      RT.joinTableChannel(baseTable.id, buildMyRealtimePeerInfo(), state.privacy.consentRealtimePresence);
    }
    const table = getTableWithRealPeers(baseTable);
    lastRenderedPeerKey = (RT ? RT.getPeersAtTable(baseTable.id) : []).map((p) => p.clientId).sort().join(",");
    const log = state.teaRoom.log;
    const prev = log.length >= 2 ? log[log.length - 2] : null;
    const curr = log[log.length - 1];
    const suggestions = matchThreeReplies(curr ? curr.text : "");
    const coolLeft = getCooldownRemaining();
    const userSeatIdx = Math.min(4, table.members.length);

    els.main.innerHTML = `
      ${renderRoomSwitcherStrip()}

      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
        <div>
          <h1>${escHtml(table.name)}</h1>
          <small style="color:var(--ink-secondary);">${escHtml(table.isArticleTable ? "Bàn trà ghép theo chủ đề báo sáng" : `${room.name} · ${table.topic}`)}</small>
          ${
            table.hostOwnerName
              ? `<div style="margin-top:4px;"><span class="host-owner-pill">Chủ bàn: ${escHtml(table.hostOwnerName)}</span></div>`
              : ""
          }
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${!table.isArticleTable ? `<button type="button" class="btn-mini" id="btn-rename-this-table">Đặt tên bàn (Chủ bàn)</button>` : ""}
          ${!table.isArticleTable ? `<button type="button" class="btn-mini" id="btn-switch-table-fast">${ico("refresh", "ico-sm")}<span>Đổi bàn khác</span></button>` : ""}
          <button type="button" class="btn-mini" id="btn-back-lobby">Xem toàn phòng</button>
        </div>
      </div>

      ${
        table.isArticleTable && table.article
          ? `
        <div class="article-topic-banner" id="article-topic-banner">
          <div class="article-topic-head">
            <span class="badge-tag amber">Đang cùng đọc & đàm đạo</span>
            <small>${escHtml(table.article.source || "")}</small>
          </div>
          <strong class="article-topic-title">${escHtml(table.article.title)}</strong>
          <div class="btn-row">
            <button type="button" class="btn-mini" id="btn-reopen-article-detail">Xem lại bài báo</button>
            <button type="button" class="btn-mini" id="btn-pick-another-article">Chọn tin báo khác</button>
          </div>
        </div>
      `
          : ""
      }

      <!-- Người đang ngồi cùng bàn -->
      <div class="surface-panel" style="padding:12px;">
        <div class="companion-head">
          <strong>Đang ngồi cùng bàn với ${getUserPronoun()} (${table.members.length + 1}/5 chỗ)</strong>
          <span>${table.realPeerCount ? `<span class="real-peer-pill num">${table.realPeerCount} điện thoại thật</span>` : "Chạm để xem hồ sơ"}</span>
        </div>
        <div class="member-pill-list">
          ${table.members
            .map((m, mIdx) => {
              const fObj = getTitleFrame(m.titleFrameId);
              const frameBadge = fObj && fObj.shortTag ? ` · ${fObj.shortTag}` : "";
              return `
            <button type="button" class="member-chip-btn" data-tidx="${state.teaRoom.tableIdx}" data-midx="${mIdx}">
              ${renderSeniorAvatarSvg(m)}
              <span class="member-chip-meta">
                <span class="member-chip-top">
                  <strong>${escHtml(m.name)} <span class="member-age-inline">· ${m.age} tuổi${escHtml(frameBadge)}</span></strong>
                  ${m.isRealPeer ? `<span class="real-peer-pill">Người thật</span>` : `<span class="member-chip-prov">${escHtml(m.province)}</span>`}
                </span>
                <small>${escHtml((m.habits || []).slice(0, 2).map(getHabitLabel).join(" · ") || m.province)}</small>
              </span>
            </button>
          `;
            })
            .join("")}
        </div>
      </div>

      <!-- 3D / 2.5D Controls Above Stage -->
      <div class="tearoom-controls-row">
        <span class="stage-badge" id="render-mode-badge">${state.settings.preferredRender === "3d" ? "Không gian 3D" : "2.5D Máy yếu"}</span>
        <button type="button" class="stage-badge-btn" id="btn-toggle-render-local">Đổi 3D / 2.5D</button>
      </div>

      <!-- 3D Low-poly / 2.5D Fallback Scene -->
      <div class="tearoom-stage" id="tearoom-stage">
        <canvas class="tearoom-canvas" id="tearoom-canvas"></canvas>
        <div class="avatar-tags-layer" id="avatar-tags-layer"></div>
      </div>

      <button type="button" class="btn-secondary" id="btn-snap-tea">${ico("camera")}<span>Check-in bàn trà (Ảnh + Mã QR)</span></button>

      ${
        room.id === "phong-co"
          ? `
        <div class="section-block" id="phong-co-table-chess">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <h2>Bàn Cờ Tướng 9×10 Ngay Tại Bàn</h2>
            <button type="button" class="btn-mini" id="btn-open-fullscreen-xq">Mở rộng toàn màn hình</button>
          </div>
          <div id="xq-host-container"></div>
        </div>
      `
          : ""
      }

      <!-- Trợ lý tự gợi chuyện sau 60 giây im lặng -->
      <div class="idle-assistant-bar" id="idle-assistant-bar">
        <span id="idle-assistant-status">${escHtml(room.hostName || "Chị Trà (Trợ lý)")} tự gợi chuyện mới nếu bàn im lặng quá 60 giây</span>
        <button type="button" class="btn-mini" id="btn-ask-host-icebreak">Nhờ Trợ lý gợi chuyện</button>
      </div>

      <!-- Fixed 2-line Tea Table Board -->
      <div class="tea-board" aria-live="polite">
        <div class="tea-board-head">
          <strong>Bảng lời bàn trà (Nhịp nhấp trà 5 giây)</strong>
          <span>Hỗ trợ Sticker &amp; Giọng nói</span>
        </div>
        <div class="tea-board-lines">
          <div class="tea-line-prev" id="tea-line-prev" ${prev ? "" : "hidden"}>${prev ? formatTeaLineRichHtml(prev, false) : ""}</div>
          <div class="tea-line-curr" id="tea-line-curr">${curr ? formatTeaLineRichHtml(curr, true) : ""}</div>
        </div>
        <div class="tea-board-actions">
          <button type="button" class="btn-mini" id="btn-view-log">Xem lại 10 câu trước</button>
          <button type="button" class="btn-mini" id="btn-listen-board">${ico("speaker", "ico-sm")}<span>Nghe câu mới</span></button>
          <button type="button" class="btn-mini report" id="btn-report-table">${ico("flag", "ico-sm")}<span>Báo cáo</span></button>
        </div>
      </div>

      <!-- Khay Gửi Sticker Nhanh 1-Chạm (Đỡ phải gõ chữ) -->
      <div class="surface-panel warm" id="tea-sticker-tray">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <h3>Gửi Sticker nhanh (1 chạm — khỏi cần gõ chữ)</h3>
          <span class="badge-tag amber">0 tốn Token</span>
        </div>
        <div class="sticker-grid" role="group" aria-label="Bộ Sticker Quán Trà 1 chạm">
          ${(D.TEA_STICKERS || [])
            .map(
              (stk) => `
              <button type="button" class="sticker-btn" data-sticker-id="${escHtml(stk.id)}" ${coolLeft > 0 ? "disabled" : ""}>
                ${renderStickerArtSvg(stk)}
                <span>${escHtml(stk.shortLabel)}</span>
              </button>
            `
            )
            .join("")}
        </div>
      </div>

      <!-- Non-verbal Tea Rituals -->
      <div class="ritual-row">
        <button type="button" class="ritual-btn" id="btn-pour-tea">${ico("tea", "ico-sm")}<span>Rót trà mời</span></button>
        <button type="button" class="ritual-btn" id="btn-snack-tea">${ico("flower", "ico-sm")}<span>Mời hạt dưa</span></button>
        <button type="button" class="ritual-btn" id="btn-poem-tea">${ico("poem", "ico-sm")}<span>Đố câu ca dao</span></button>
      </div>

      <!-- Quick Replies + Simple Text + 2-tap Inline Voice -->
      <div class="surface-panel">
        <h3>Chọn nhanh câu trả lời (0 tốn Token):</h3>
        <div class="cooldown-note" id="tea-cooldown-note" ${coolLeft > 0 ? "" : "hidden"}>Bác nhấp ngụm trà nghe các bác khác nói nhé... (${coolLeft}s)</div>
        <div class="reply-stack" id="tea-reply-stack">
          ${suggestions
            .map(
              (s, idx) =>
                `<button type="button" class="reply-btn" data-reply="${escHtml(s)}" ${coolLeft > 0 ? "disabled" : ""}>${idx + 1}. "${escHtml(s)}"</button>`
            )
            .join("")}
        </div>
        <div style="display:flex; gap:8px; align-items:stretch;">
          <input type="text" class="input-lg" id="tea-text-input" placeholder="Gõ lời muốn nói..." style="flex:1;" />
          <button type="button" class="btn-jade btn-inline" id="btn-send-text">Gửi</button>
        </div>
        <button type="button" class="btn-primary" id="btn-voice-speak">
          ${ico("mic")}
          <span>Bấm để nói bằng giọng</span>
        </button>
        <div id="inline-voice-box" hidden></div>
      </div>
    `;

    bindRoomSwitcherEvents();
    mountRoomSceneView("table", room, baseTable, 0);

    const inlineXqHost = document.getElementById("xq-host-container");
    if (inlineXqHost) {
      renderXiangqiTab(inlineXqHost);
    }
    const openFullXqBtn = document.getElementById("btn-open-fullscreen-xq");
    if (openFullXqBtn) {
      openFullXqBtn.addEventListener("click", () => navigate("xiangqi"));
    }

    if (coolLeft > 0) startCooldownTicker();

    const switchFastBtn = document.getElementById("btn-switch-table-fast");
    if (switchFastBtn) {
      switchFastBtn.addEventListener("click", switchNextTableFast);
    }
    const renameTblBtn = document.getElementById("btn-rename-this-table");
    if (renameTblBtn) {
      renameTblBtn.addEventListener("click", () => openHostCustomTableModal(room, state.teaRoom.tableIdx));
    }
    els.main.querySelectorAll("[data-sticker-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const stk = (D.TEA_STICKERS || []).find((s) => s.id === btn.dataset.stickerId);
        if (stk) sendUserTeaSticker(stk);
      });
    });

    document.getElementById("btn-ask-host-icebreak").addEventListener("click", triggerIdleAssistantPrompt);

    document.getElementById("btn-back-lobby").addEventListener("click", () => {
      state.teaRoom.articleTable = null;
      state.teaRoom.activeNewspaperRef = null;
      state.teaRoom.subView = "lobby";
      if (RT) RT.leaveTableChannel();
      saveState();
      renderTeaRoom();
    });

    const reopenArtBtn = document.getElementById("btn-reopen-article-detail");
    if (reopenArtBtn && table.article) {
      reopenArtBtn.addEventListener("click", () => openArticleDetailModal(table.article));
    }
    const pickOtherArtBtn = document.getElementById("btn-pick-another-article");
    if (pickOtherArtBtn) {
      pickOtherArtBtn.addEventListener("click", () => navigate("newspaper"));
    }

    els.main.querySelectorAll(".member-chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = table.members[Number(btn.dataset.midx)];
        if (m) openSeniorProfileDialog(m, state.teaRoom.tableIdx, room);
      });
    });

    document.getElementById("btn-snap-tea").addEventListener("click", () => {
      const currLine = state.teaRoom.log[state.teaRoom.log.length - 1];
      const baseShare = getPublicBaseUrl();
      const shareUrl =
        table.isArticleTable && table.article
          ? `${baseShare}?tin=${encodeURIComponent(table.article.id)}`
          : `${baseShare}?phong=${encodeURIComponent(room.id)}&ban=${state.teaRoom.tableIdx + 1}`;
      const peerNames = table.members.map((m) => m.name).join(", ");
      const postText = `${state.user.name} (${getUserAge()} tuổi) đang ngồi uống trà tại ${table.name} (${room.name}) cùng ${peerNames}. Mời các anh chị bấm vào link dưới đây để vào ngồi chung bàn trò chuyện (không cần tài khoản):\n${shareUrl}`;
      const png = window.TeaRoomScene.exportPostcardPng({
        userName: state.user.name,
        userAge: getUserAge(),
        provinceName: getProvince(state.user.provinceId).short,
        roomName: room.name,
        tableName: table.name,
        attendees: table.members,
        message: currLine ? currLine.text : "Mời các anh chị uống trà buổi sáng!",
        shareUrl
      });
      openDialog(
        "Check-in bàn trà (Ảnh QR + Link MXH)",
        `<img src="${png}" alt="Ảnh Check-in bàn trà Tuổi Bạc" style="width:100%; border-radius:12px; border:1px solid #D5C4AA;" />
         <div class="btn-row">
           <a class="btn-primary" href="${png}" download="checkin-ban-tra-tuoi-bac.png" style="text-decoration:none;">Lưu ảnh QR</a>
           <button type="button" class="btn-jade" id="btn-share-table-zalo">${ico("share")}<span>Chia sẻ nhanh</span></button>
         </div>
         ${renderSocialShareKitHtml({
           prefix: "table-share",
           copyLinkBtnId: "btn-copy-table-link",
           shareUrl,
           postText
         })}`
      );
      bindSocialShareKit({
        prefix: "table-share",
        copyLinkBtnId: "btn-copy-table-link",
        shareUrl,
        postText
      });
      document.getElementById("btn-share-table-zalo").addEventListener("click", async () => {
        const postEl = document.getElementById("table-share-post-in");
        const currentText = postEl ? postEl.value : postText;
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Check-in ${table.name} — Tuổi Bạc`,
              text: currentText,
              url: shareUrl
            });
            return;
          } catch (e) {
            // Fall back to clipboard
          }
        }
        copyTextSafe(currentText, "Đã sao chép lời mời và link bàn trà để dán lên Zalo / Facebook!");
      });
    });

    document.getElementById("btn-view-log").addEventListener("click", () => {
      const last10 = state.teaRoom.log.slice(-10).reverse();
      openDialog(
        "10 câu trò chuyện gần nhất",
        last10
          .map(
            (item) => `
          <div class="dict-row">
            <strong>${escHtml(item.speaker)}</strong>
            <p>${escHtml(item.text)}</p>
          </div>`
          )
          .join("")
      );
    });

    document.getElementById("btn-listen-board").addEventListener("click", () => {
      const c = state.teaRoom.log[state.teaRoom.log.length - 1];
      if (c) speak(`${c.speaker} nói: ${c.text}`);
    });

    document.getElementById("btn-report-table").addEventListener("click", () => {
      openDialog(
        "Báo cáo tin nhắn hoặc người dùng vi phạm",
        `<p>Nếu có người lạ xin tiền, gửi đường link lạ hoặc nói năng thiếu tôn trọng, bác chọn lý do bên dưới để đội ngũ kiểm duyệt xử lý trong ngày:</p>
         <button type="button" class="btn-danger" id="confirm-report-1">Báo cáo gửi số tài khoản / xin tiền</button>
         <button type="button" class="btn-secondary" id="confirm-report-2">Báo cáo quảng cáo thuốc / thực phẩm chức năng</button>`
      );
      document.getElementById("confirm-report-1").addEventListener("click", () => {
        closeDialog();
        showToast("Đã ghi nhận báo cáo an toàn. Kiểm duyệt viên sẽ xử lý ngay.");
      });
      document.getElementById("confirm-report-2").addEventListener("click", () => {
        closeDialog();
        showToast("Đã ghi nhận báo cáo quảng cáo trái phép.");
      });
    });

    document.getElementById("btn-pour-tea").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) {
        showToast("Bác đợi hết vài giây nghỉ ngụm trà nhé.");
        return;
      }
      window.TeaRoomScene.triggerTeaService();
      window.TeaRoomScene.setSeatBadge(userSeatIdx, "Mời trà");
      sendUserTeaMessage("Mời cả bàn dùng thêm chén trà sen nóng cho ấm bụng nhé!", { ritual: "pour" });
    });

    document.getElementById("btn-snack-tea").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) return;
      window.TeaRoomScene.setSeatBadge(userSeatIdx, "Mời bánh");
      sendUserTeaMessage("Tôi mời các bác đĩa hạt dưa và miếng bánh đậu xanh Hải Dương.", { ritual: "snack" });
    });

    document.getElementById("btn-poem-tea").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) return;
      sendUserTeaMessage("Góp vui với bàn câu ca dao: Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây.");
    });

    els.main.querySelectorAll(".reply-btn").forEach((btn) => {
      btn.addEventListener("click", () => sendUserTeaMessage(btn.dataset.reply, { source: "quick" }));
    });

    const textIn = document.getElementById("tea-text-input");
    const sendTextBtn = document.getElementById("btn-send-text");
    if (sendTextBtn && textIn) {
      const submitTyped = () => {
        if (getCooldownRemaining() > 0) {
          showToast("Bác đợi hết vài giây nghỉ ngụm trà nhé.");
          return;
        }
        const raw = textIn.value.trim();
        if (!raw) return;
        const checked = cleanAndApplyDictionary(raw);
        if (checked.blocked) {
          showToast("Vì an toàn cho các bác, quán trà không gửi số điện thoại, số tài khoản hoặc đường link.");
          return;
        }
        textIn.value = "";
        if (state.privacy.consentVoiceDict) commitVoiceDictionaryLearning(checked);
        sendUserTeaMessage(checked.aiPolished, { source: "typed" });
      };
      sendTextBtn.addEventListener("click", submitTyped);
      textIn.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitTyped();
      });
    }

    document.getElementById("btn-voice-speak").addEventListener("click", startInlineVoiceCapture);
  }

  function commitVoiceDictionaryLearning(res) {
    if (!res) return;
    (res.appliedDict || []).forEach((hit) => {
      const found = state.phoneticDict.find((d) => d.wrong === hit.wrong);
      if (found) found.hits += 1;
    });
    if (res.learnedCandidate && !state.phoneticDict.some((d) => d.wrong === res.learnedCandidate.wrong)) {
      state.phoneticDict.push({
        wrong: res.learnedCandidate.wrong,
        right: res.learnedCandidate.right,
        hits: 1,
        learnedBy: `Tự học (${state.user.name})`
      });
      awardSkillPoints("voice_wisdom", 6);
      trackTelemetryDirect("dict_correction", "tearoom", "learned_new_phonetic_pair", {
        wrong: res.learnedCandidate.wrong,
        right: res.learnedCandidate.right
      });
    }
    saveState();
    updateGlobalChrome();
  }

  function showInlineVoiceDraft(rawText, infoNote) {
    const box = document.getElementById("inline-voice-box");
    if (!box) return;
    box.hidden = false;

    const res = cleanAndApplyDictionary(rawText);
    if (res.blocked) {
      box.innerHTML = `
        <div class="surface-panel danger">
          <p style="font-weight:700;">Vì an toàn cho các bác, quán trà không gửi số điện thoại, số tài khoản hoặc đường link.</p>
          <button type="button" class="btn-secondary" id="btn-inline-voice-cancel">Đóng</button>
        </div>
      `;
      document.getElementById("btn-inline-voice-cancel").addEventListener("click", () => {
        box.hidden = true;
        box.innerHTML = "";
      });
      return;
    }

    pendingVoiceDraft = res;
    box.innerHTML = `
      <div class="surface-panel warm">
        ${infoNote ? `<small style="color:var(--ink-secondary);">${escHtml(infoNote)}</small>` : ""}
        <label class="field-label">
          Kiểm tra lại câu bác vừa nói (chạm để sửa nếu cần):
          <textarea id="inline-voice-preview-input" class="input-lg" rows="2" style="min-height:76px;">${escHtml(res.aiPolished)}</textarea>
        </label>
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-inline-voice-send">${ico("check")}<span>Gửi lên bàn trà</span></button>
          <button type="button" class="btn-secondary" id="btn-inline-voice-cancel">Hủy / Nói lại</button>
        </div>
      </div>
    `;

    document.getElementById("btn-inline-voice-send").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) {
        showToast("Bác đợi hết vài giây nghỉ ngụm trà nhé.");
        return;
      }
      const editedText = document.getElementById("inline-voice-preview-input").value.trim();
      if (!editedText) return;
      const recheck = cleanAndApplyDictionary(editedText);
      if (recheck.blocked) {
        showToast("Vì an toàn cho các bác, không gửi số điện thoại hoặc đường link.");
        return;
      }
      if (state.privacy.consentVoiceDict) commitVoiceDictionaryLearning(pendingVoiceDraft);
      pendingVoiceDraft = null;
      box.hidden = true;
      box.innerHTML = "";
      sendUserTeaMessage(editedText, { source: "voice" });
    });

    document.getElementById("btn-inline-voice-cancel").addEventListener("click", () => {
      pendingVoiceDraft = null;
      box.hidden = true;
      box.innerHTML = "";
    });
  }

  function startInlineVoiceCapture() {
    if (getCooldownRemaining() > 0) {
      showToast("Bác đợi hết vài giây nghỉ ngụm trà nhé.");
      return;
    }
    const box = document.getElementById("inline-voice-box");
    if (!box) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      showInlineVoiceDraft(D.VOICE_SAMPLES[2].raw, "Máy này chưa có micro trực tiếp — hiển thị câu nói mẫu để bác bấm gửi thử:");
      return;
    }

    box.hidden = false;
    box.innerHTML = `
      <div class="surface-panel jade">
        <p style="font-weight:700;">Đang lắng nghe bác nói... Nói xong máy tự viết thành chữ.</p>
        <button type="button" class="btn-secondary" id="btn-inline-stop-mic">Dừng nghe</button>
      </div>
    `;
    const rec = new SR();
    rec.lang = "vi-VN";
    rec.interimResults = false;
    let settled = false;
    const micWatchdog = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { rec.stop(); } catch (e) {}
      showInlineVoiceDraft(D.VOICE_SAMPLES[2].raw, "Chưa nghe thấy tiếng nói — hiển thị câu mẫu để bác xem thử:");
    }, 5500);

    rec.onresult = (ev) => {
      clearTimeout(micWatchdog);
      settled = true;
      showInlineVoiceDraft(ev.results[0][0].transcript, "");
    };
    rec.onerror = () => {
      if (settled) return;
      clearTimeout(micWatchdog);
      settled = true;
      showInlineVoiceDraft(D.VOICE_SAMPLES[2].raw, "Chưa thu được tiếng từ micro — hiển thị câu mẫu để bác xem trước:");
    };
    document.getElementById("btn-inline-stop-mic").addEventListener("click", () => {
      clearTimeout(micWatchdog);
      try { rec.stop(); } catch (e) {}
      if (!settled) {
        settled = true;
        showInlineVoiceDraft(D.VOICE_SAMPLES[2].raw, "Câu nói mẫu để bác thử:");
      }
    });
    try {
      rec.start();
    } catch (e) {
      clearTimeout(micWatchdog);
      settled = true;
      showInlineVoiceDraft(D.VOICE_SAMPLES[2].raw, "Chưa bật được micro — hiển thị câu nói mẫu:");
    }
  }

  function openDictDialog() {
    openDialog(
      `Sổ từ điển tự học ngầm (${state.phoneticDict.length} mục)`,
      `<p style="font-size:0.88rem;">Bảng này chạy ngầm để chuẩn hóa câu nói mà không hiện thuật ngữ kỹ thuật lên màn hình người cao tuổi.</p>
       ${state.phoneticDict
         .slice()
         .reverse()
         .map(
           (d) => `
         <div class="dict-row">
           <div><strong>"${escHtml(d.wrong)}"</strong> → <strong style="color:var(--accent-jade);">"${escHtml(d.right)}"</strong></div>
           <small style="color:var(--ink-secondary);">Nguồn: ${escHtml(d.learnedBy)} · Đã dùng ${d.hits} lần</small>
         </div>`
         )
         .join("")}`
    );
  }

  // ==================== MODULE 3: VINTAGE NEWSPAPER, CATEGORY/SEARCH & DISCUSSION TABLES ====================
  let newsLiveSearching = false;

  function buildSynthesizedKeywordArticles(rawQuery) {
    const q = String(rawQuery || "").trim();
    return [
      {
        id: "art-custom-" + stripVnAccents(q).replace(/[^a-z0-9]+/g, "-"),
        category: "doi-song",
        tag: `Điểm tin theo từ khóa · ${q}`,
        title: `Tổng hợp tin mới sáng nay về chủ đề "${q}": góc nhìn thiết thực cho đời sống gia đình`,
        source: "Điểm báo tổng hợp từ nguồn chính thống · Vừa cập nhật",
        body: `Chủ đề "${q}" đang được nhiều độc giả quan tâm theo dõi trong bản tin sáng nay. Các chuyên gia khuyến nghị theo dõi thông tin từ các cơ quan báo chí chính thống và cùng trao đổi kinh nghiệm thực tế phù hợp với sinh hoạt hằng ngày.`,
        detailPoints: [
          `Cập nhật diễn biến chính xoay quanh "${q}" từ các đầu báo lớn trong nước.`,
          "Phân tích tác động thiết thực tới chi tiêu sinh hoạt, sức khỏe và đời sống hưu trí.",
          "Mời vào bàn trà để nghe góc nhìn thực tế từ các anh chị đang cùng quan tâm chủ đề này."
        ],
        quickReplies: [
          `Tôi sáng nay cũng vừa tìm đọc tin về "${q}" giống {ten}.`,
          `Chủ đề "${q}" này bàn cùng mọi người ở {tinh} và các tỉnh rất thú vị {ten} nhỉ.`,
          "Mình cứ chọn lọc thông tin từ báo chính thống rồi trao đổi nhẹ nhàng là chuẩn nhất."
        ],
        topicKeyword: "Tờ báo sáng"
      }
    ];
  }

  async function fetchLiveKeywordArticles(query) {
    const cleanQ = String(query || "").trim();
    if (!cleanQ) return;
    newsLiveSearching = true;
    renderNewspaper();

    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQ)}&hl=vi&gl=VN&ceid=VN:vi`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(apiUrl, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          state.newspaper.liveItems = data.items.slice(0, 4).map((it, idx) => {
            const rawTitle = String(it.title || "").replace(/\s*-\s*[^-]+$/, "").trim() || `Tin mới về ${cleanQ}`;
            const plainDesc = String(it.description || "")
              .replace(/<[^>]+>/g, " ")
              .replace(/&nbsp;/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            return {
              id: `live-${idx}-${stripVnAccents(cleanQ).replace(/[^a-z0-9]+/g, "-")}`,
              category: "all",
              tag: `Tin tìm kiếm · ${cleanQ}`,
              title: rawTitle,
              source: `${it.author || "Điểm báo trực tuyến"} · Hôm nay`,
              body:
                plainDesc.length > 40 && plainDesc !== rawTitle
                  ? plainDesc.slice(0, 260)
                  : `Bản tin thời sự cập nhật về "${cleanQ}". Chạm vào bài báo hoặc bấm nút Vào bàn đàm đạo bên dưới để cùng trò chuyện với những người đang quan tâm tin này.`,
              detailPoints: [
                `Tin tìm theo từ khóa "${cleanQ}" trên Tờ Báo Sáng.`,
                "Nội dung tóm lược chữ to dễ theo dõi để cùng bình luận bên ấm trà."
              ],
              quickReplies: [
                `Tin "${rawTitle.slice(0, 48)}..." này đáng chú ý thật {ten} nhỉ.`,
                `Tôi ở {tinh} cũng đang theo dõi thêm tin tức về "${cleanQ}".`,
                "Ngồi bàn trà nghe mọi người phân tích thêm thấy rõ vấn đề hơn hẳn."
              ],
              topicKeyword: "Tờ báo sáng"
            };
          });
          newsLiveSearching = false;
          saveState();
          renderNewspaper();
          return;
        }
      }
    } catch (e) {
      // Fall back to synthesized summary when offline or rate-limited
    }

    state.newspaper.liveItems = buildSynthesizedKeywordArticles(cleanQ);
    newsLiveSearching = false;
    saveState();
    renderNewspaper();
  }

  function getFilteredNewspaperArticles() {
    const cat = state.newspaper.selectedCategory || "all";
    const qNorm = stripVnAccents(state.newspaper.searchQuery || "").trim();
    const list = (state.newspaper.articles || []).filter((art) => {
      if (cat !== "all" && art.category && art.category !== cat) return false;
      if (!qNorm) return true;
      const hay = stripVnAccents(
        `${art.tag || ""} ${art.title || ""} ${art.body || ""} ${(art.detailPoints || []).join(" ")}`
      );
      return hay.includes(qNorm);
    });
    if (list.length > 0) return list;
    if (qNorm && Array.isArray(state.newspaper.liveItems) && state.newspaper.liveItems.length > 0) {
      return state.newspaper.liveItems;
    }
    return list;
  }

  function renderNewspaper() {
    const pron = getUserPronoun();
    const selectedCat = state.newspaper.selectedCategory || "all";
    const searchQ = state.newspaper.searchQuery || "";
    const hasFilter = selectedCat !== "all" || Boolean(searchQ.trim());
    const visibleArticles = getFilteredNewspaperArticles();

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <h1>Tờ Báo Sáng</h1>
        <button type="button" class="btn-mini" id="btn-toggle-rss-admin">${state.newspaper.adminOpen ? "Đóng góc Admin RSS" : `Duyệt RSS (${state.newspaper.drafts.length})`}</button>
      </div>
      <p class="lead-copy">Chọn chuyên mục hoặc tìm chủ đề (${pron} gõ hoặc chạm gợi ý như <strong>Giá dầu, Thế giới...</strong>), rồi ấn vào tin để ngồi đàm đạo cùng những người đang đọc tin đó.</p>

      <!-- Khung tìm kiếm & Gợi ý từ khóa nóng + Chuyên mục -->
      <div class="surface-panel" style="gap:10px;">
        <div class="news-search-row">
          <input
            type="search"
            class="input-lg"
            id="news-search-input"
            value="${escHtml(searchQ)}"
            placeholder="Gõ chủ đề: giá dầu, thế giới, giá vàng..."
          />
          <button type="button" class="btn-primary btn-inline" id="btn-news-search">Tìm tin</button>
        </div>

        <div>
          <div class="news-sub-label">Từ khóa gợi ý đang bàn sôi nổi:</div>
          <div class="news-keyword-strip">
            ${(D.NEWS_HOT_KEYWORDS || []).map((kw) => {
              const isAct = stripVnAccents(searchQ) === stripVnAccents(kw);
              return `<button type="button" class="news-kw-chip ${isAct ? "selected" : ""}" data-news-kw="${escHtml(kw)}">${escHtml(kw)}</button>`;
            }).join("")}
          </div>
        </div>

        <div>
          <div class="news-sub-label">Chuyên mục báo:</div>
          <div class="room-tabs-scroll">
            ${(D.NEWS_CATEGORIES || []).map((c) => {
              const cnt =
                c.id === "all"
                  ? state.newspaper.articles.length
                  : state.newspaper.articles.filter((a) => a.category === c.id).length;
              return `
                <button type="button" class="room-tab-btn ${selectedCat === c.id ? "active" : ""}" data-news-cat="${c.id}">
                  <span>${escHtml(c.label)} (${cnt})</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        ${
          hasFilter
            ? `
          <div class="news-filter-bar">
            <span>Đang hiển thị <strong>${visibleArticles.length}</strong> bản tin phù hợp${searchQ ? ` với "${escHtml(searchQ)}"` : ""}</span>
            <button type="button" class="btn-mini" id="btn-clear-news-filter">Xem tất cả (${state.newspaper.articles.length})</button>
          </div>
        `
            : ""
        }
      </div>

      ${
        state.newspaper.adminOpen
          ? `
        <div class="surface-panel warm">
          <h3>Góc Admin duyệt RSS 1 chạm (Hậu trường buổi sáng)</h3>
          <p style="font-size:0.88rem;">Hệ thống tự kéo RSS báo chính thống, lọc tin tích cực lưu nháp. Admin chỉ bấm duyệt 1 chạm để đăng lên Tờ Báo Sáng:</p>
          ${
            state.newspaper.drafts.length === 0
              ? `<p style="font-size:0.88rem; font-weight:700;">Đã duyệt hết bản nháp RSS sáng nay.</p>`
              : state.newspaper.drafts
                  .map(
                    (dr, i) => `
              <div class="dict-row" style="background:#FFFDF7; padding:10px; gap:6px;">
                <span class="badge-tag amber">${escHtml(dr.tag)}</span>
                <strong>${escHtml(dr.title)}</strong>
                <small style="color:var(--ink-secondary);">${escHtml(dr.source)}</small>
                <p>${escHtml(dr.body)}</p>
                <button type="button" class="btn-jade approve-rss-btn" data-idx="${i}">Duyệt 1 chạm lên Báo Sáng</button>
              </div>
            `
                  )
                  .join("")
          }
        </div>
      `
          : ""
      }

      <article class="broadsheet">
        <div class="broadsheet-masthead">
          <h2>BÁO SÁNG QUÁN TRÀ TUỔI BẠC</h2>
          <div class="broadsheet-meta">
            <span>Số ra sáng hôm nay (${visibleArticles.length} tin)</span>
            <span>Ấn vào tin để cùng ngồi đàm đạo</span>
          </div>
        </div>

        ${
          newsLiveSearching
            ? `<div class="surface-panel warm"><p style="font-weight:700;">Đang tìm bản tin mới nhất về "${escHtml(searchQ)}"...</p></div>`
            : visibleArticles.length === 0
              ? `
            <div class="surface-panel warm">
              <p>Chưa có sẵn tin trong mục này cho từ khóa <strong>"${escHtml(searchQ)}"</strong>.</p>
              <button type="button" class="btn-primary" id="btn-fetch-live-news">Tìm tin thời sự trực tuyến về "${escHtml(searchQ)}"</button>
            </div>
          `
              : visibleArticles
                  .map((art, idx) => {
                    const readers = getReadersForArticle(art);
                    const readerSummary = readers.map((r) => `${r.name} (${r.age}t)`).join(", ");
                    return `
                  <section class="news-article" data-art-idx="${idx}">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                      <span class="badge-tag">${escHtml(art.tag)}</span>
                      <span class="news-reader-count">${readers.length} người đang đọc</span>
                    </div>

                    <button type="button" class="news-open-detail-btn" data-open-idx="${idx}">
                      <h3>${escHtml(art.title)}</h3>
                      <span class="news-source">${escHtml(art.source)}</span>
                      <span class="news-body">${escHtml(art.body)}</span>
                      <span class="news-read-more-hint">Chạm vào bản tin để xem các điểm chính & danh sách người đọc →</span>
                    </button>

                    <div class="news-readers-strip">
                      <div class="news-readers-avatars">
                        ${readers.slice(0, 3).map((r) => renderSeniorAvatarSvg(r)).join("")}
                      </div>
                      <div class="news-readers-text">
                        <strong>Đang đọc & bàn tin này:</strong> ${escHtml(readerSummary)}
                      </div>
                    </div>

                    <div class="btn-row">
                      <button type="button" class="btn-secondary read-news-btn" data-idx="${idx}">${ico("speaker")}<span>Nghe đọc báo</span></button>
                      <button type="button" class="btn-primary bring-tea-btn" data-idx="${idx}">${ico("tea")}<span>Cùng đàm đạo (${readers.length})</span></button>
                    </div>
                  </section>
                `;
                  })
                  .join("")
        }
      </article>
    `;

    const runSearch = (rawVal) => {
      const q = String(rawVal || "").trim();
      state.newspaper.searchQuery = q;
      state.newspaper.liveItems = [];
      if (q) {
        awardSkillPoints("morning_habit", 2);
        trackTelemetryDirect("news_search", "newspaper", "search_keyword", {
          query: q,
          category: state.newspaper.selectedCategory
        });
      }
      saveState();
      const matched = getFilteredNewspaperArticles();
      if (q && matched.length === 0) {
        fetchLiveKeywordArticles(q);
      } else {
        renderNewspaper();
      }
    };

    const searchInput = document.getElementById("news-search-input");
    document.getElementById("btn-news-search").addEventListener("click", () => {
      runSearch(searchInput.value);
    });
    searchInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        runSearch(searchInput.value);
      }
    });

    els.main.querySelectorAll("[data-news-kw]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kw = btn.dataset.newsKw;
        const already = stripVnAccents(state.newspaper.searchQuery) === stripVnAccents(kw);
        state.newspaper.selectedCategory = "all";
        runSearch(already ? "" : kw);
      });
    });

    els.main.querySelectorAll("[data-news-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.newspaper.selectedCategory = btn.dataset.newsCat;
        state.newspaper.liveItems = [];
        saveState();
        renderNewspaper();
      });
    });

    const clearBtn = document.getElementById("btn-clear-news-filter");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.newspaper.selectedCategory = "all";
        state.newspaper.searchQuery = "";
        state.newspaper.liveItems = [];
        saveState();
        renderNewspaper();
      });
    }

    const fetchLiveBtn = document.getElementById("btn-fetch-live-news");
    if (fetchLiveBtn) {
      fetchLiveBtn.addEventListener("click", () => fetchLiveKeywordArticles(searchQ));
    }

    document.getElementById("btn-toggle-rss-admin").addEventListener("click", () => {
      state.newspaper.adminOpen = !state.newspaper.adminOpen;
      saveState();
      renderNewspaper();
    });

    els.main.querySelectorAll(".approve-rss-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        const [approved] = state.newspaper.drafts.splice(idx, 1);
        if (approved) {
          approved.tag = approved.tag.replace(" (RSS nháp)", "");
          approved.category = approved.category || "doi-song";
          state.newspaper.articles.unshift(approved);
          saveState();
          showToast("Đã duyệt tin RSS lên trang nhất Tờ Báo Sáng!");
          renderNewspaper();
        }
      });
    });

    els.main.querySelectorAll(".news-open-detail-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = visibleArticles[Number(btn.dataset.openIdx)];
        if (art) openArticleDetailModal(art);
      });
    });

    els.main.querySelectorAll(".read-news-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = visibleArticles[Number(btn.dataset.idx)];
        if (art) speak(`${art.title}. ${art.body}`, { announceToast: true });
      });
    });

    els.main.querySelectorAll(".bring-tea-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = visibleArticles[Number(btn.dataset.idx)];
        if (art) joinArticleDiscussionTable(art, false);
      });
    });
  }

  // ==================== MODULE 4: DAILY QUIZ ====================
  function renderQuiz() {
    clearInterval(quizTimerId);
    const qState = state.quiz;
    const total = D.QUIZ_QUESTIONS.length;

    if (qState.finished) {
      els.main.innerHTML = `
        <h1>Hoàn thành Đố vui hôm nay</h1>
        <div class="surface-panel jade">
          <h2>Kết quả của ${escHtml(state.user.name)}</h2>
          <p class="num" style="font-size:1.5rem; font-weight:700;">${qState.score} điểm</p>
          <p>Trả lời chậm vẫn được tối thiểu 60% điểm mỗi câu đúng. Bác giữ vững phong độ nhé!</p>
          <button type="button" class="btn-primary" id="btn-retry-quiz">Chơi lại bộ câu đố</button>
        </div>
      `;
      document.getElementById("btn-retry-quiz").addEventListener("click", () => {
        state.quiz = { idx: 0, score: 0, selectedOpt: null, finished: false, timeLeft: 25 };
        saveState();
        renderQuiz();
      });
      return;
    }

    const q = D.QUIZ_QUESTIONS[qState.idx];
    const hasAnswered = qState.selectedOpt !== null;
    const letters = ["A", "B", "C", "D"];

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h1>Đố vui hôm nay</h1>
        <span class="badge-tag amber num">Câu ${qState.idx + 1}/${total}</span>
      </div>

      <div class="surface-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <span class="badge-tag">${escHtml(q.tag)}</span>
          <span class="num" id="quiz-timer-lbl" style="font-weight:700; color:var(--accent-terracotta);">Còn ${qState.timeLeft} giây</span>
        </div>

        <h2 style="line-height:1.4;">${escHtml(q.question)}</h2>

        <button type="button" class="btn-secondary" id="btn-read-quiz" style="min-height:56px;">
          ${ico("speaker")}
          <span>Đọc to câu hỏi</span>
        </button>

        <div class="quiz-options">
          ${q.options
            .map((opt, i) => {
              let cls = "";
              if (hasAnswered) {
                if (i === q.correctIndex) cls = "correct";
                else if (i === qState.selectedOpt) cls = "wrong";
              }
              return `
                <button type="button" class="quiz-opt-btn ${cls}" data-opt="${i}" ${hasAnswered ? "disabled" : ""}>
                  <span class="quiz-opt-badge">${letters[i]}</span>
                  <span>${escHtml(opt)}</span>
                </button>
              `;
            })
            .join("")}
        </div>

        ${
          hasAnswered
            ? `
          <div class="surface-panel warm">
            <strong>${qState.selectedOpt === q.correctIndex ? "Chính xác!" : "Gần đúng rồi bác ạ:"}</strong>
            <p style="font-size:0.88rem;">${escHtml(q.explain)}</p>
            <button type="button" class="btn-primary" id="btn-next-quiz">
              ${qState.idx + 1 < total ? "Sang câu tiếp theo" : "Xem tổng điểm"}
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;

    if (!hasAnswered) {
      quizTimerId = setInterval(() => {
        if (state.route !== "quiz") {
          clearInterval(quizTimerId);
          return;
        }
        state.quiz.timeLeft = Math.max(0, state.quiz.timeLeft - 1);
        const lbl = document.getElementById("quiz-timer-lbl");
        if (lbl) lbl.textContent = `Còn ${state.quiz.timeLeft} giây`;
      }, 1000);
    }

    document.getElementById("btn-read-quiz").addEventListener("click", () => {
      speak(`${q.question}. A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}`);
    });

    els.main.querySelectorAll(".quiz-opt-btn").forEach((b) => {
      b.addEventListener("click", () => {
        clearInterval(quizTimerId);
        const picked = Number(b.dataset.opt);
        state.quiz.selectedOpt = picked;
        if (picked === q.correctIndex) {
          const gained = 60 + Math.round((state.quiz.timeLeft / 25) * 40);
          state.quiz.score += gained;
          addXu(3, `Đáp đúng +${gained} điểm`);
          awardSeniorityPoints(3, "quiz_correct", "dan-gian", `Đáp đúng câu Đố vui (+${gained} điểm)`, {
            eventType: "folk_game",
            module: "quiz",
            gameKind: "quiz",
            score: state.quiz.score
          });
        }
        saveState();
        renderQuiz();
      });
    });

    const nextBtn = document.getElementById("btn-next-quiz");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (state.quiz.idx + 1 < total) {
          state.quiz.idx += 1;
          state.quiz.selectedOpt = null;
          state.quiz.timeLeft = 25;
        } else {
          state.quiz.finished = true;
          addXu(5, "Hoàn thành 5 câu Đố vui hôm nay");
        }
        saveState();
        renderQuiz();
      });
    }
  }

  // ==================== MODULE 5: Ô ĂN QUAN & CỜ TƯỚNG ====================
  function executeOaqMove(startIdx, dirStep, isPlayer) {
    // dirStep: +1 (right/counter-clockwise around board 0..4 -> 5 -> 6..10 -> 11 -> 0) or -1
    const cells = state.oaq.cells.slice();
    let hand = cells[startIdx];
    if (hand <= 0) return null;
    cells[startIdx] = 0;

    let pos = startIdx;
    const stepNext = (idx) => (idx + dirStep + 12) % 12;

    while (true) {
      while (hand > 0) {
        pos = stepNext(pos);
        cells[pos] += 1;
        hand -= 1;
      }
      const next = stepNext(pos);
      if (next === 5 || next === 11) {
        // Stop at Mandarin square
        break;
      }
      if (cells[next] > 0) {
        hand = cells[next];
        cells[next] = 0;
        pos = next;
      } else {
        // Empty cell -> check capture on cell after next
        let after = stepNext(next);
        let captured = 0;
        let checkEmpty = next;
        while (cells[checkEmpty] === 0 && cells[after] > 0) {
          captured += cells[after];
          cells[after] = 0;
          checkEmpty = stepNext(after);
          if (checkEmpty === 5 || checkEmpty === 11) break;
          after = stepNext(checkEmpty);
        }
        if (captured > 0) {
          if (isPlayer) state.oaq.scoreP += captured;
          else state.oaq.scoreAI += captured;
        }
        break;
      }
    }

    // Refill side if empty using 5 points or free reserve
    const pSum = cells.slice(0, 5).reduce((a, b) => a + b, 0);
    if (pSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
      for (let i = 0; i < 5; i++) cells[i] = 1;
    }
    const aiSum = cells.slice(6, 11).reduce((a, b) => a + b, 0);
    if (aiSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
      for (let i = 6; i < 11; i++) cells[i] = 1;
    }

    state.oaq.cells = cells;
    state.oaq.selectedCell = null;
    return cells;
  }

  function renderGames() {
    els.main.innerHTML = `
      <h1>Trò chơi dân gian &amp; Cờ tướng 9×10</h1>
      <div class="tab-bar">
        <button type="button" class="tab-btn ${activeGameTab === "oaq" ? "active" : ""}" id="tab-oaq">Ô ăn quan</button>
        <button type="button" class="tab-btn ${activeGameTab === "cotuong" ? "active" : ""}" id="tab-cotuong">Cờ tướng 9×10</button>
      </div>
      <div id="game-tab-body"></div>
    `;

    document.getElementById("tab-oaq").addEventListener("click", () => {
      activeGameTab = "oaq";
      renderGames();
    });
    document.getElementById("tab-cotuong").addEventListener("click", () => {
      activeGameTab = "cotuong";
      renderGames();
    });

    const body = document.getElementById("game-tab-body");
    if (activeGameTab === "oaq") {
      renderOaqTab(body);
    } else {
      renderXiangqiTab(body);
    }
  }

  function ensureOaqAsyncMatch() {
    if (!state.oaq.matchId) {
      const code = "oaq-" + Math.random().toString(36).slice(2, 8);
      state.oaq.matchId = code;
      state.oaq.myRole = "host";
      state.oaq.hostName = `${state.user.name} · ${getUserAge()}t`;
      state.oaq.guestName = "Đang chờ bạn cờ bấm link...";
      state.oaq.turn = "host";
      state.oaq.zaloInviteUrl = `${getPublicBaseUrl()}?van=${encodeURIComponent(code)}`;
      if (RT) {
        RT.publishMatchState({
          matchId: code,
          kind: "oaq",
          hostId: RT.getClientId(),
          hostName: state.oaq.hostName,
          guestId: "",
          guestName: "",
          turn: "host",
          statusText: `Mời đi nước đầu tiên trên ván Ô ăn quan.`,
          payload: {
            cells: state.oaq.cells.slice(),
            scoreHost: state.oaq.scoreP,
            scoreGuest: state.oaq.scoreAI
          },
          moveCount: 0
        });
      }
      saveState();
    }
  }

  function renderOaqTab(container) {
    const o = state.oaq;
    if (o.mode !== "async" && o.turn !== "host" && o.turn !== "ai") {
      o.turn = "host";
    }
    const isGameOver = o.cells[5] === 0 && o.cells[11] === 0;
    const topCells = [10, 9, 8, 7, 6]; // Guest / AI side
    const bottomCells = [0, 1, 2, 3, 4]; // Host / Player side
    const isGuestAsync = o.mode === "async" && o.myRole === "guest";
    const isMyTurn = o.mode === "ai" ? o.turn === "host" : o.turn === o.myRole;
    const hostLabel = o.mode === "async" ? o.hostName || `${state.user.name}` : `${state.user.name}`;
    const guestLabel =
      o.mode === "ai"
        ? "Máy (Đối thủ tự động)"
        : o.guestName || "Bạn cờ qua link (Đang chờ)";

    container.innerHTML = `
      <div class="surface-panel">
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="oaq-mode-ai" style="${o.mode === "ai" ? "background:var(--accent-jade);color:#fff;" : ""}">Đấu với Máy</button>
          <button type="button" class="btn-secondary" id="oaq-mode-async" style="${o.mode === "async" ? "background:var(--accent-jade);color:#fff;" : ""}">Ván treo thật (Qua link)</button>
        </div>

        <div style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; font-weight:700; font-size:0.92rem;">
          <span>Hàng dưới (${escHtml(hostLabel)}): <span class="num">${o.scoreP}</span> quân</span>
          <span>Hàng trên (${escHtml(guestLabel)}): <span class="num">${o.scoreAI}</span> quân</span>
        </div>

        <div class="oaq-board" role="group" aria-label="Bàn cờ Ô ăn quan">
          <div class="oaq-quan oaq-quan-left">
            <span class="num">${o.cells[11]}</span>
            <small>Q.Trái</small>
          </div>

          ${topCells
            .map((idx) => {
              if (isGuestAsync) {
                return `
                  <button type="button" class="oaq-cell player-side ${o.selectedCell === idx ? "selected" : ""}" data-cell="${idx}" style="grid-row:1;" ${!isMyTurn || o.cells[idx] === 0 || isGameOver ? "disabled" : ""}>
                    <span class="num">${o.cells[idx]}</span>
                    <small>Ô${idx + 1}</small>
                  </button>
                `;
              }
              return `
                <div class="oaq-cell" style="grid-row:1;">
                  <span class="num">${o.cells[idx]}</span>
                  <small>Ô${idx + 1}</small>
                </div>
              `;
            })
            .join("")}

          ${bottomCells
            .map((idx) => {
              if (isGuestAsync) {
                return `
                  <div class="oaq-cell" style="grid-row:2;">
                    <span class="num">${o.cells[idx]}</span>
                    <small>Ô${idx + 1}</small>
                  </div>
                `;
              }
              return `
                <button type="button" class="oaq-cell player-side ${o.selectedCell === idx ? "selected" : ""}" data-cell="${idx}" style="grid-row:2;" ${!isMyTurn || o.cells[idx] === 0 || isGameOver ? "disabled" : ""}>
                  <span class="num">${o.cells[idx]}</span>
                  <small>Ô${idx + 1}</small>
                </button>
              `;
            })
            .join("")}

          <div class="oaq-quan oaq-quan-right">
            <span class="num">${o.cells[5]}</span>
            <small>Q.Phải</small>
          </div>
        </div>

        <p style="font-weight:600; color:var(--accent-terracotta);">${isGameOver ? "Ván cờ đã kết thúc — cả hai Quan đều đã ăn hết!" : escHtml(o.statusText)}</p>

        ${
          o.selectedCell !== null && isMyTurn && !isGameOver
            ? `
          <div class="btn-row">
            <button type="button" class="btn-primary" id="oaq-dir-left">Rải sang Trái</button>
            <button type="button" class="btn-jade" id="oaq-dir-right">Rải sang Phải</button>
          </div>
        `
            : ""
        }

        ${
          o.mode === "async" && o.zaloInviteUrl
            ? `
          <div class="surface-panel warm">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong>Ván treo thời gian thực (${escHtml(o.matchId)})</strong>
              <span class="real-peer-pill">${isMyTurn ? "Đến lượt bác" : "Đang chờ bạn cờ"}</span>
            </div>
            <p style="font-size:0.88rem;">Gửi link dưới đây cho người thứ 2 mở trên điện thoại thật để đánh chung ván này ngay lập tức:</p>
            ${renderSocialShareKitHtml({
              prefix: "oaq-share",
              copyLinkBtnId: "oaq-copy-zalo",
              shareUrl: o.zaloInviteUrl,
              postText: `${state.user.name} mời bạn đánh chung ván Ô ăn quan trực tuyến trên Tuổi Bạc. Bấm vào đường dẫn này là đi nước tiếp theo ngay:\n${o.zaloInviteUrl}`
            })}
          </div>
        `
            : ""
        }

        <button type="button" class="btn-secondary" id="oaq-reset">Xếp lại bàn cờ mới</button>
      </div>
    `;

    container.querySelectorAll("[data-cell]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.oaq.selectedCell = Number(btn.dataset.cell);
        state.oaq.statusText = `Đã chọn Ô ${state.oaq.selectedCell + 1} (${state.oaq.cells[state.oaq.selectedCell]} quân). Bác chọn rải Trái hay Phải?`;
        renderGames();
      });
    });

    const doPlayerDir = (dir) => {
      const chosen = state.oaq.selectedCell;
      if (chosen === null) return;
      const isHostSide = !isGuestAsync;
      // On top row (guest), visual Left corresponds to +1 index around board, Right to -1
      const actualStep = isHostSide ? dir : -dir;
      executeOaqMove(chosen, actualStep, isHostSide);
      awardSeniorityPoints(2, "oaq_move", "dan-gian", `Rải quân Ô ăn quan ô số ${chosen + 1}`, {
        eventType: "folk_game",
        module: "games",
        gameKind: "oaq",
        cellIdx: chosen
      });

      if (state.oaq.mode === "async") {
        ensureOaqAsyncMatch();
        const nextTurn = isHostSide ? "guest" : "host";
        state.oaq.turn = nextTurn;
        state.oaq.statusText = `${state.user.name} vừa rải Ô ${chosen + 1}. Đang chờ đối thủ đi lượt tiếp theo...`;
        trackEvent("async_game_move");
        if (RT) {
          const existing = RT.getMatch(state.oaq.matchId) || {};
          RT.publishMatchState({
            matchId: state.oaq.matchId,
            kind: "oaq",
            hostId: existing.hostId || RT.getClientId(),
            hostName: state.oaq.hostName || `${state.user.name} · ${getUserAge()}t`,
            guestId: isGuestAsync ? RT.getClientId() : existing.guestId || "",
            guestName: isGuestAsync ? `${state.user.name} · ${getUserAge()}t` : state.oaq.guestName || "",
            turn: nextTurn,
            statusText: `${state.user.name} vừa đi Ô ${chosen + 1} — mời đi tiếp!`,
            payload: {
              cells: state.oaq.cells.slice(),
              scoreHost: state.oaq.scoreP,
              scoreGuest: state.oaq.scoreAI
            },
            moveCount: (existing.moveCount || 0) + 1
          });
        }
        saveState();
        addXu(3, "Đi nước cờ ván treo thật");
        renderGames();
        return;
      }

      state.oaq.turn = "ai";
      state.oaq.statusText = "Đến lượt Máy (đối thủ máy) đang suy nghĩ...";
      saveState();
      renderGames();

      setTimeout(() => {
        if (state.route !== "games") return;
        const validAiCells = [6, 7, 8, 9, 10].filter((idx) => state.oaq.cells[idx] > 0);
        if (validAiCells.length > 0) {
          const pick = validAiCells[Math.floor(Math.random() * validAiCells.length)];
          const aiDir = Math.random() > 0.5 ? 1 : -1;
          executeOaqMove(pick, aiDir, false);
        }
        state.oaq.turn = "host";
        state.oaq.statusText = "Máy đã đi xong. Đến lượt bác chọn một ô hàng dưới.";
        saveState();
        renderGames();
      }, 850);
    };

    const btnL = document.getElementById("oaq-dir-left");
    const btnR = document.getElementById("oaq-dir-right");
    if (btnL) btnL.addEventListener("click", () => doPlayerDir(-1));
    if (btnR) btnR.addEventListener("click", () => doPlayerDir(1));

    document.getElementById("oaq-mode-ai").addEventListener("click", () => {
      state.oaq.mode = "ai";
      state.oaq.turn = "host";
      state.oaq.statusText = "Đang đấu với Máy (luôn ghi rõ là Máy).";
      saveState();
      renderGames();
    });

    document.getElementById("oaq-mode-async").addEventListener("click", () => {
      state.oaq.mode = "async";
      ensureOaqAsyncMatch();
      state.oaq.statusText = "Chế độ Ván treo thật: gửi link bên dưới cho điện thoại thứ 2 để đánh trực tiếp.";
      saveState();
      renderGames();
    });

    if (o.mode === "async" && o.zaloInviteUrl) {
      bindSocialShareKit({
        prefix: "oaq-share",
        copyLinkBtnId: "oaq-copy-zalo",
        shareUrl: o.zaloInviteUrl,
        postText: `${state.user.name} mời bạn đánh chung ván Ô ăn quan trực tuyến trên Tuổi Bạc. Bấm vào đường dẫn này là đi nước tiếp theo ngay:\n${o.zaloInviteUrl}`
      });
    }

    document.getElementById("oaq-reset").addEventListener("click", () => {
      const keepMode = state.oaq.mode;
      state.oaq = Object.assign({}, createDefaultState().oaq, { mode: keepMode });
      if (keepMode === "async") ensureOaqAsyncMatch();
      saveState();
      renderGames();
    });
  }

  // ==================== STANDARD 9x10 XIANGQI (FULL 32-PIECE GAME + 6 CỜ THẾ PUZZLES + LIVE ASYNC) ====================
  function playWoodPieceClack(isCapture) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isCapture ? 210 : 320, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.065);
      gain.gain.setValueAtTime(isCapture ? 0.28 : 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  function refreshXiangqiHosts() {
    const inlineHost = document.getElementById("xq-host-container");
    if (inlineHost) {
      renderXiangqiTab(inlineHost);
      return;
    }
    if (state.route === "xiangqi") {
      renderXiangqiScreen();
    } else if (state.route === "games" && activeGameTab === "cotuong") {
      renderGames();
    }
  }

  function switchXiangqiMode(nextMode) {
    if (!XQ) return;
    const x = state.xiangqi;
    x.mode = nextMode;
    x.selected = null;
    x.lastMove = null;
    x.hintMove = null;
    x.prevBoard = null;
    x.solved = false;
    x.moveLog = [];
    if (nextMode === "puzzle") {
      const curPz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
      x.board = XQ.buildBoardFromList(curPz.pieces);
      x.turn = "red";
      x.puzzleStep = 0;
      x.status = `${curPz.name} — Đỏ đi tiên: chạm quân Đỏ rồi chạm chấm xanh để chiếu Tướng.`;
    } else if (nextMode === "ai") {
      x.board = XQ.createInitialBoard();
      x.turn = "red";
      x.status = `Ván thật 9×10 (32 quân) đấu với Máy (${x.aiLevel === "club" ? "Mức CLB" : "Mức Thư giãn"}) — Bác cầm Đỏ đi tiên!`;
    } else if (nextMode === "local2p") {
      x.board = XQ.createInitialBoard();
      x.turn = "red";
      x.status = "Đánh 2 người chung máy (32 quân) — Bên Đỏ đi trước, chạm quân để đi.";
    } else {
      x.matchId = "";
      ensureXiangqiAsyncMatch();
    }
    saveState();
  }

  function ensureXiangqiBoardInitialized() {
    const x = state.xiangqi;
    if (!XQ) return;
    if (!Array.isArray(x.solvedPuzzleIds)) x.solvedPuzzleIds = [];
    if (!Array.isArray(x.moveLog)) x.moveLog = [];
    if (!x.aiLevel) x.aiLevel = "club";
    if (!Array.isArray(x.board) || x.board.length !== 10) {
      switchXiangqiMode(x.mode || "ai");
    }
  }

  function ensureXiangqiAsyncMatch() {
    const x = state.xiangqi;
    if (!x.matchId) {
      const code = "xq-" + Math.random().toString(36).slice(2, 8);
      x.matchId = code;
      x.mySide = "red";
      x.hostName = `${state.user.name} · ${getUserAge()}t`;
      x.guestName = "Đang chờ kỳ hữu mở link...";
      x.board = XQ.createInitialBoard();
      x.turn = "red";
      x.selected = null;
      x.lastMove = null;
      x.hintMove = null;
      x.solved = false;
      x.moveLog = [];
      x.inviteUrl = `${getPublicBaseUrl()}?van=${encodeURIComponent(code)}`;
      x.status = "Bác cầm quân Đỏ (đi tiên). Gửi link bên dưới để kỳ hữu cầm quân Đen trên máy khác.";
      if (RT) {
        RT.publishMatchState({
          matchId: code,
          kind: "xiangqi",
          hostId: RT.getClientId(),
          hostName: x.hostName,
          guestId: "",
          guestName: "",
          turn: "red",
          statusText: x.status,
          payload: { board: x.board, lastMove: null },
          moveCount: 0
        });
      }
      saveState();
    }
  }

  function renderXiangqiScreen() {
    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <h1>Cờ Tướng 9×10 &amp; Giải Cờ Thế</h1>
        <button type="button" class="btn-mini" id="btn-xq-goto-oaq">Sang Ô ăn quan</button>
      </div>
      <p class="lead-copy">Bàn cờ chuẩn 9 cột × 10 hàng đầy đủ luật Cửu cung, cản Mã, cản Tượng, ngòi Pháo và lộ mặt Tướng. Chơi ván thật 32 quân hoặc thử sức 6 thế cờ cổ phổ.</p>
      <div id="xq-host-container"></div>
    `;
    document.getElementById("btn-xq-goto-oaq").addEventListener("click", () => {
      activeGameTab = "oaq";
      navigate("games");
    });
    renderXiangqiTab(document.getElementById("xq-host-container"));
  }

  function renderXiangqiTab(container) {
    if (!XQ || !container) return;
    const x = state.xiangqi;
    ensureXiangqiBoardInitialized();

    const pz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
    const isPlayGameTab = x.mode !== "puzzle";
    const myControllableSide =
      x.mode === "local2p"
        ? x.turn
        : x.mode === "async"
        ? x.mySide || "red"
        : "red";
    const canInteract = !x.solved && x.turn === myControllableSide;
    const legalTargets =
      canInteract && x.selected
        ? XQ.getLegalMovesForSquare(x.board, x.selected.r, x.selected.c)
        : [];
    const inCheckNow = !x.solved && XQ.isInCheck(x.board, x.turn);
    const capInfo = isPlayGameTab ? XQ.getCapturedPieces(x.board) : null;
    const solvedCount = (x.solvedPuzzleIds || []).length;

    container.innerHTML = `
      <div class="surface-panel">
        <!-- 2 Chế độ lớn dễ chọn nhất: Đánh Ván Thật 32 Quân vs Giải 6 Thế Cờ -->
        <div class="xq-top-switch" role="tablist" aria-label="Chọn Đánh ván thật hoặc Giải cờ thế">
          <button type="button" class="xq-top-btn ${isPlayGameTab ? "active" : ""}" id="xq-top-play">Đánh ván thật (32 quân)</button>
          <button type="button" class="xq-top-btn ${!isPlayGameTab ? "active" : ""}" id="xq-top-puzzle">Giải Cờ thế (${solvedCount}/${XQ.PUZZLES.length} thế)</button>
        </div>

        ${
          isPlayGameTab
            ? `
          <div class="xq-opp-grid" role="group" aria-label="Chọn đối thủ trên bàn 9×10">
            <button type="button" class="xq-mode-btn ${x.mode === "ai" && x.aiLevel !== "easy" ? "active" : ""}" data-xq-play="ai-club">Đấu Máy CLB (Khá)</button>
            <button type="button" class="xq-mode-btn ${x.mode === "ai" && x.aiLevel === "easy" ? "active" : ""}" data-xq-play="ai-easy">Đấu Máy (Thư giãn)</button>
            <button type="button" class="xq-mode-btn ${x.mode === "local2p" ? "active" : ""}" data-xq-play="local2p">2 Người chung máy</button>
            <button type="button" class="xq-mode-btn ${x.mode === "async" ? "active" : ""}" data-xq-play="async">Ván treo qua link</button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.92rem;">
            <span><strong>Quân Đỏ:</strong> ${escHtml(x.mode === "async" ? x.hostName || state.user.name : state.user.name)}</span>
            <span><strong>Quân Đen:</strong> ${escHtml(
              x.mode === "local2p"
                ? "Người chơi 2 (Tại chỗ)"
                : x.mode === "async"
                ? x.guestName || "Chờ kỳ hữu..."
                : x.aiLevel === "easy"
                ? "Máy (Thư giãn)"
                : "Máy (Kỳ hữu CLB)"
            )}</span>
          </div>

          <div class="xq-captured-strip">
            <span>Đỏ ăn: <strong>${capInfo.capturedByRed.length ? escHtml(capInfo.capturedByRed.join(", ")) : "chưa ăn quân"}</strong></span>
            <span>Đen ăn: <strong>${capInfo.capturedByBlack.length ? escHtml(capInfo.capturedByBlack.join(", ")) : "chưa ăn quân"}</strong></span>
          </div>
        `
            : `
          <div class="surface-panel warm" style="padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:1.02rem;">${escHtml(pz.name)}</strong>
              <span class="badge-tag amber">${escHtml(pz.difficulty || "Cờ thế")}</span>
            </div>
            <p style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(pz.story || pz.subtitle)}</p>
          </div>

          <div class="xq-puzzle-strip" role="group" aria-label="Danh sách 6 thế cờ">
            ${XQ.PUZZLES.map((item, idx) => {
              const isCurr = idx === (x.puzzleIdx || 0);
              const isDone = (x.solvedPuzzleIds || []).includes(item.id);
              return `<button type="button" class="btn-mini" data-pz-idx="${idx}" style="justify-content:space-between; ${isCurr ? "background:var(--accent-jade);color:#fff;border-color:var(--accent-jade);" : ""}">
                <span>${escHtml(item.shortTitle || `Thế ${idx + 1}`)}</span>
                <span>${isDone ? "Đã giải" : item.difficulty}</span>
              </button>`;
            }).join("")}
          </div>
        `
        }

        ${inCheckNow ? `<div class="xq-check-banner">CHIẾU TƯỚNG! Bên ${x.turn === "red" ? "Đỏ" : "Đen"} cần đỡ nước chiếu ngay!</div>` : ""}

        <div class="xq-board-wrap" id="xq-board-mount">
          ${XQ.renderBoardSvg({
            board: x.board,
            selected: x.selected,
            legalTargets,
            lastMove: x.lastMove,
            hintMove: x.hintMove
          })}
        </div>

        <p id="xq-status-line" style="font-weight:700; color:${x.solved ? "var(--accent-jade)" : "var(--accent-terracotta)"};">${escHtml(x.status)}</p>

        ${
          Array.isArray(x.moveLog) && x.moveLog.length > 0
            ? `<div class="xq-move-log-strip">Biên bản gần nhất: ${escHtml(x.moveLog.slice(-3).join("  ·  "))}</div>`
            : ""
        }

        <div class="btn-row">
          ${
            !x.solved && canInteract
              ? `<button type="button" class="btn-secondary" id="xq-btn-hint">${x.mode === "puzzle" ? "Gợi ý nước giải" : "Gợi ý nước hay"}</button>`
              : ""
          }
          ${
            x.mode === "puzzle" && !x.solved && canInteract
              ? `<button type="button" class="btn-jade" id="xq-btn-demo-step">Đi mẫu 1 nước</button>`
              : ""
          }
          ${
            isPlayGameTab && x.prevBoard && x.mode !== "async"
              ? `<button type="button" class="btn-secondary" id="xq-btn-undo">Hoàn lại 1 nước</button>`
              : ""
          }
          <button type="button" class="btn-primary" id="xq-btn-reset">${x.mode === "puzzle" ? "Xếp lại thế cờ" : "Xếp ván 9×10 mới"}</button>
        </div>

        ${
          x.mode === "puzzle" && x.solved
            ? `<button type="button" class="btn-jade" id="xq-btn-next-puzzle">Sang Thế cờ tiếp theo →</button>`
            : ""
        }

        ${
          x.mode === "async" && x.inviteUrl
            ? `
          <div class="surface-panel warm">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong>Ván treo Cờ tướng 9×10 (${escHtml(x.matchId)})</strong>
              <span class="real-peer-pill">${x.turn === myControllableSide ? "Đến lượt bác" : "Chờ nước đi bạn cờ"}</span>
            </div>
            ${renderSocialShareKitHtml({
              prefix: "xq-share",
              copyLinkBtnId: "xq-copy-link",
              shareUrl: x.inviteUrl,
              postText: `${state.user.name} mời bạn đánh ván Cờ tướng 9×10 trực tuyến trên Tuổi Bạc (không cần cài tài khoản). Bấm vào link để cầm quân đi nước tiếp theo:\n${x.inviteUrl}`
            })}
          </div>
        `
            : ""
        }
      </div>
    `;

    container.querySelector("#xq-top-play").addEventListener("click", () => {
      if (x.mode === "puzzle") {
        switchXiangqiMode("ai");
        refreshXiangqiHosts();
      }
    });
    container.querySelector("#xq-top-puzzle").addEventListener("click", () => {
      if (x.mode !== "puzzle") {
        switchXiangqiMode("puzzle");
        refreshXiangqiHosts();
      }
    });

    container.querySelectorAll("[data-xq-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.xqPlay;
        if (key === "ai-club") {
          x.aiLevel = "club";
          switchXiangqiMode("ai");
        } else if (key === "ai-easy") {
          x.aiLevel = "easy";
          switchXiangqiMode("ai");
        } else if (key === "local2p") {
          switchXiangqiMode("local2p");
        } else {
          switchXiangqiMode("async");
        }
        refreshXiangqiHosts();
      });
    });

    container.querySelectorAll("[data-pz-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        x.puzzleIdx = Number(btn.dataset.pzIdx);
        switchXiangqiMode("puzzle");
        refreshXiangqiHosts();
      });
    });

    container.querySelectorAll(".xq-square").forEach((sq) => {
      sq.addEventListener("click", () => {
        if (!canInteract) return;
        const r = Number(sq.dataset.r);
        const c = Number(sq.dataset.c);
        const tappedPiece = x.board[r][c];

        if (x.selected) {
          const chosenMove = legalTargets.find((m) => m.tr === r && m.tc === c);
          if (chosenMove) {
            executeUserXiangqiMove(chosenMove);
            return;
          }
        }

        if (tappedPiece && tappedPiece.side === myControllableSide) {
          const moves = XQ.getLegalMovesForSquare(x.board, r, c);
          x.selected = { r, c };
          x.hintMove = null;
          const pLabel = XQ.PIECE_LABELS[tappedPiece.type] || tappedPiece.type;
          x.status =
            moves.length > 0
              ? `Đã chọn quân ${pLabel} — có ${moves.length} ô hợp lệ (chấm xanh trên bàn cờ).`
              : `Quân ${pLabel} này đang bị cản hoặc bận giữ Tướng, mời chọn quân khác.`;
          refreshXiangqiHosts();
        }
      });
    });

    const hintBtn = container.querySelector("#xq-btn-hint");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        if (x.mode === "puzzle") {
          const hintMv = x.puzzleStep === 0 ? pz.hintMove1 : pz.hintMove2;
          if (hintMv && x.board[hintMv.fr] && x.board[hintMv.fr][hintMv.fc]) {
            x.selected = { r: hintMv.fr, c: hintMv.fc };
            x.hintMove = hintMv;
          }
          const msg = x.puzzleStep === 0 ? pz.hint1 : pz.hint2;
          x.status = msg;
          showToast("Đã khoanh vàng quân cờ và ô đích gợi ý trên bàn!");
        } else {
          const bestMv = XQ.suggestBestMove(x.board, myControllableSide);
          if (bestMv) {
            x.selected = { r: bestMv.fr, c: bestMv.fc };
            x.hintMove = bestMv;
            const desc = XQ.formatMoveLabel(x.board, bestMv);
            x.status = `Gợi ý nước hay: ${desc} (chạm vào vòng tròn vàng để đi).`;
            showToast(`Gợi ý: ${desc}`);
          }
        }
        refreshXiangqiHosts();
      });
    }

    const demoStepBtn = container.querySelector("#xq-btn-demo-step");
    if (demoStepBtn) {
      demoStepBtn.addEventListener("click", () => {
        const stepMv = x.puzzleStep === 0 ? pz.hintMove1 : pz.hintMove2;
        if (stepMv) {
          const legal = XQ.getLegalMovesForSquare(x.board, stepMv.fr, stepMv.fc);
          const valid = legal.find((m) => m.tr === stepMv.tr && m.tc === stepMv.tc) || XQ.suggestBestMove(x.board, "red");
          if (valid) executeUserXiangqiMove(valid);
        }
      });
    }

    const nextPzBtn = container.querySelector("#xq-btn-next-puzzle");
    if (nextPzBtn) {
      nextPzBtn.addEventListener("click", () => {
        x.puzzleIdx = ((x.puzzleIdx || 0) + 1) % XQ.PUZZLES.length;
        switchXiangqiMode("puzzle");
        refreshXiangqiHosts();
      });
    }

    const undoBtn = container.querySelector("#xq-btn-undo");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => {
        if (x.prevBoard) {
          x.board = XQ.cloneBoard(x.prevBoard);
          x.prevBoard = null;
          x.turn = "red";
          x.solved = false;
          x.selected = null;
          x.hintMove = null;
          if (Array.isArray(x.moveLog) && x.moveLog.length > 0) x.moveLog.pop();
          x.status = "Đã hoàn lại 1 nước cờ — mời bác đi lại thong thả.";
          saveState();
          refreshXiangqiHosts();
        }
      });
    }

    container.querySelector("#xq-btn-reset").addEventListener("click", () => {
      switchXiangqiMode(x.mode);
      refreshXiangqiHosts();
    });

    if (x.mode === "async" && x.inviteUrl) {
      bindSocialShareKit({
        prefix: "xq-share",
        copyLinkBtnId: "xq-copy-link",
        shareUrl: x.inviteUrl,
        postText: `${state.user.name} mời bạn đánh ván Cờ tướng 9×10 trực tuyến trên Tuổi Bạc (không cần cài tài khoản). Bấm vào link để cầm quân đi nước tiếp theo:\n${x.inviteUrl}`
      });
    }
  }

  function executeUserXiangqiMove(mv) {
    const x = state.xiangqi;
    const isCapture = Boolean(x.board[mv.tr][mv.tc]);
    const moveDesc = XQ.formatMoveLabel(x.board, mv);
    playWoodPieceClack(isCapture);

    x.prevBoard = XQ.cloneBoard(x.board);
    x.board = XQ.applyMoveClone(x.board, mv);
    x.lastMove = mv;
    x.selected = null;
    x.hintMove = null;
    if (!Array.isArray(x.moveLog)) x.moveLog = [];
    x.moveLog.push(moveDesc);

    const movedSide = x.mode === "local2p" ? x.turn : x.mode === "async" ? x.mySide || "red" : "red";
    const enemySide = movedSide === "red" ? "black" : "red";
    const enemyMoves = XQ.getAllLegalMoves(x.board, enemySide);
    const enemyChecked = XQ.isInCheck(x.board, enemySide);

    if (x.mode === "local2p") {
      if (enemyMoves.length === 0) {
        x.solved = true;
        x.status = `Chiếu bí! Bên ${movedSide === "red" ? "Đỏ" : "Đen"} đã thắng ván 9×10!`;
      } else {
        x.turn = enemySide;
        x.status = `${moveDesc}${enemyChecked ? " (Chiếu Tướng!)" : ""} — Đến lượt bên ${enemySide === "red" ? "Đỏ" : "Đen"} đi.`;
      }
      saveState();
      refreshXiangqiHosts();
      return;
    }

    if (x.mode === "async") {
      trackEvent("async_game_move");
      x.turn = enemySide;
      if (enemyMoves.length === 0) {
        x.solved = true;
        x.status = `Chiếu bí! ${state.user.name} đã giành chiến thắng ván Cờ tướng 9×10!`;
        addXu(8, "Thắng ván treo Cờ tướng 9×10");
      } else {
        x.status = `${moveDesc}${enemyChecked ? " (Chiếu Tướng!)" : ""} — đang chờ đối thủ đi tiếp.`;
        addXu(2, "Đi nước Cờ tướng ván treo");
      }
      if (RT && x.matchId) {
        const existing = RT.getMatch(x.matchId) || {};
        RT.publishMatchState({
          matchId: x.matchId,
          kind: "xiangqi",
          hostId: existing.hostId || RT.getClientId(),
          hostName: x.hostName || `${state.user.name} · ${getUserAge()}t`,
          guestId: movedSide === "black" ? RT.getClientId() : existing.guestId || "",
          guestName: movedSide === "black" ? `${state.user.name} · ${getUserAge()}t` : x.guestName || "",
          turn: x.turn,
          statusText: `${state.user.name} vừa đi ${moveDesc}${enemyChecked ? " (Chiếu Tướng!)" : ""}`,
          payload: { board: x.board, lastMove: mv, solved: x.solved },
          moveCount: (existing.moveCount || 0) + 1
        });
      }
      saveState();
      refreshXiangqiHosts();
      return;
    }

    if (enemyMoves.length === 0) {
      x.solved = true;
      if (x.mode === "puzzle") {
        const pz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
        if (!Array.isArray(x.solvedPuzzleIds)) x.solvedPuzzleIds = [];
        if (pz && !x.solvedPuzzleIds.includes(pz.id)) {
          x.solvedPuzzleIds.push(pz.id);
        }
      }
      const newlyUnlocked = unlockTitleFrame("ky-thu", "Kỳ Thủ Đầu Xuân");
      x.status = newlyUnlocked
        ? "Chiếu bí xuất sắc! Bác đã mở khóa khung danh hiệu 3D 'Kỳ Thủ Đầu Xuân' gắn lên nhân vật!"
        : x.mode === "puzzle"
        ? "Chiếu bí chuẩn xác! Bác đã phá giải thành công thế cờ này!"
        : "Chiếu bí tuyệt đẹp! Bác đã chiến thắng đối thủ Máy trên bàn 9×10!";
      addXu(6, x.mode === "puzzle" ? "Phá giải thế cờ thành công" : "Thắng ván Cờ tướng 9×10");
      awardSkillPoints("xiangqi", x.mode === "puzzle" ? 10 : 8);
      awardSeniorityPoints(
        x.mode === "puzzle" ? 8 : 6,
        x.mode === "puzzle" ? "puzzle_solved" : "xiangqi_win",
        "co-tuong",
        x.mode === "puzzle" ? "Phá giải thế cờ cổ phổ thành công" : "Thắng ván Cờ tướng 9×10",
        { eventType: "puzzle_solved", module: "xiangqi", mode: x.mode }
      );
      saveState();
      refreshXiangqiHosts();
      return;
    }

    x.turn = "black";
    x.puzzleStep = (x.puzzleStep || 0) + 1;
    x.status = `${moveDesc}${enemyChecked ? " — Chiếu Tướng!" : ""}. Máy đang suy nghĩ đỡ nước cờ...`;
    saveState();
    refreshXiangqiHosts();

    setTimeout(() => {
      if (x.turn !== "black" || x.solved) return;
      const aiParam = x.mode === "puzzle" ? "puzzle" : x.aiLevel || "club";
      const aiMv = XQ.pickAiMove(x.board, "black", aiParam);
      if (!aiMv) {
        x.solved = true;
        x.status = "Đối phương hết nước đi — bác đã thắng ván này!";
        saveState();
        refreshXiangqiHosts();
        return;
      }
      const aiCap = Boolean(x.board[aiMv.tr][aiMv.tc]);
      const aiDesc = XQ.formatMoveLabel(x.board, aiMv);
      playWoodPieceClack(aiCap);
      x.board = XQ.applyMoveClone(x.board, aiMv);
      x.lastMove = aiMv;
      x.moveLog.push(aiDesc);
      x.turn = "red";
      const redMoves = XQ.getAllLegalMoves(x.board, "red");
      const redChecked = XQ.isInCheck(x.board, "red");
      if (redMoves.length === 0) {
        x.solved = true;
        x.status = `Máy vừa đi ${aiDesc} — Đỏ hết nước đi. Bác bấm Hoàn lại 1 nước hoặc Xếp lại nhé!`;
      } else {
        x.status = `Máy đỡ: ${aiDesc}${redChecked ? " (Chiếu Tướng!)" : ""}. Đến lượt bác cầm quân Đỏ!`;
      }
      saveState();
      refreshXiangqiHosts();
    }, 520);
  }

  // ==================== MODULE 6: POETRY, DAN TRANH ZITHER & 3D BADGE UNLOCK ====================
  function playDanTranhIntro() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // Vietnamese pentatonic scale (Hò - Xự - Xang - Xê - Cống): C5, D5, F5, G5, A5, C6
      const notes = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + idx * 0.16;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.14, t0);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 1.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 1.2);
      });
    } catch (e) {}
  }

  function evaluatePoemMeter(rawLines, style) {
    const lines = rawLines.map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return "Bài thơ nên có ít nhất 2 câu để nhịp ngâm ngân vang hơn.";
    }
    const counts = lines.map((l) => l.split(/\s+/).filter(Boolean).length);
    if (style === "luc-bat") {
      const okPairs = lines.every((_, i) => (i % 2 === 0 ? counts[i] === 6 : counts[i] === 8));
      return okPairs
        ? `Chuẩn nhịp Lục Bát truyền thống (${counts.join(" - ")} chữ) — rất êm tai!`
        : `Số chữ từng câu đang là (${counts.join(" - ")} chữ). Lục bát chuẩn thường theo nhịp 6 - 8 chữ, nhưng bác vẫn có thể đăng tự nhiên!`;
    }
    if (style === "bon-chu") {
      const ok4 = counts.every((n) => n === 4 || n === 5);
      return ok4
        ? `Nhịp thơ ngắn gọn (${counts.join(" - ")} chữ), rất hợp ngâm đồng dao!`
        : `Số chữ từng câu: (${counts.join(" - ")} chữ) — sẵn sàng đăng lên chiếu thơ.`;
    }
    return `Bài thơ gồm ${lines.length} câu (${counts.join(" - ")} chữ) — lời thơ chân thành, ấm áp.`;
  }

  function getMergedPoemsList() {
    const shared = RT ? RT.getSharedPoems() : [];
    const seen = new Set();
    const out = [];
    shared.concat(state.poems).forEach((p) => {
      if (p && p.id && !seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    });
    return out;
  }

  function renderPoetry() {
    const allPoems = getMergedPoemsList();
    const activeFrame = getTitleFrame(state.user.titleFrameId);

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <h1>Ngâm thơ &amp; Tặng hoa</h1>
        <span class="badge-tag amber num">Còn ${state.user.flowersLeft}/3 hoa hôm nay</span>
      </div>
      <p class="lead-copy">Tự sáng tác hoặc đọc thơ bằng giọng nói, nghe ngâm thơ cùng tiếng đàn tranh và nhận khung danh hiệu <strong>Thi Hữu Tao Đàn</strong> gắn trực tiếp lên nhân vật 3D.</p>

      <div class="surface-panel warm">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <span>Khung danh hiệu 3D đang đeo: <strong>${escHtml(activeFrame.name)}</strong></span>
          <button type="button" class="btn-mini" id="btn-go-frame-preview">${ico("award", "ico-sm")}<span>Xem trên 3D</span></button>
        </div>
      </div>

      <div class="surface-panel">
        <h3>Sáng tác &amp; Đăng bài thơ mới</h3>
        <div class="setup-inline-fields">
          <label class="field-label" style="flex:1.3;">
            Tên bài thơ
            <input type="text" class="input-lg" id="poem-title-in" placeholder="Ví dụ: Hương trà sớm mai" />
          </label>
          <label class="field-label" style="flex:1;">
            Thể thơ
            <select class="select-lg" id="poem-style-in">
              <option value="luc-bat">Lục bát (6–8)</option>
              <option value="bon-chu">Bốn / Năm chữ</option>
              <option value="tu-do">Thơ tự do</option>
            </select>
          </label>
        </div>
        <textarea class="textarea-lg" id="poem-body-in" rows="3" placeholder="Gõ từng câu thơ xuống dòng, hoặc bấm Đọc thơ bằng giọng..."></textarea>
        <div id="poem-meter-feedback" style="font-size:0.88rem; color:var(--accent-jade); font-weight:600;" hidden></div>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-mic-poem">${ico("mic")}<span>Đọc thơ bằng giọng</span></button>
          <button type="button" class="btn-secondary" id="btn-check-meter">Kiểm tra nhịp thơ</button>
        </div>
        <button type="button" class="btn-jade" id="btn-post-poem">${ico("poem")}<span>Đăng bài thơ &amp; Mở danh hiệu Thi Hữu (+4 Xu)</span></button>
      </div>

      ${allPoems
        .map((p, idx) => {
          const alreadyGifted = (state.user.giftedPoemIds || []).includes(p.id);
          return `
        <article class="surface-panel">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h3>${escHtml(p.title)}</h3>
              <small style="color:var(--ink-secondary);">${escHtml(p.reciter)} · ${escHtml(p.author)}</small>
            </div>
            <span class="badge-tag jade num">${p.flowers} hoa</span>
          </div>
          <div style="font-family:var(--font-serif); line-height:1.7; background:var(--bg-paper); padding:10px 14px; border-radius:12px; border:1px solid var(--border-subtle);">
            ${(p.lines || []).map((l) => `<div>${escHtml(l)}</div>`).join("")}
          </div>
          <div class="btn-row">
            <button type="button" class="btn-secondary listen-poem-btn" data-idx="${idx}">${ico("speaker")}<span>Ngâm cùng đàn tranh</span></button>
            <button type="button" class="btn-primary gift-flower-btn" data-idx="${idx}" ${state.user.flowersLeft <= 0 || alreadyGifted ? "disabled" : ""}>
              ${ico("flower")}
              <span>${alreadyGifted ? "Đã tặng hoa" : "Tặng 1 bông hoa"}</span>
            </button>
          </div>
        </article>
      `;
        })
        .join("")}
    `;

    document.getElementById("btn-go-frame-preview").addEventListener("click", () => navigate("profile"));

    const bodyEl = document.getElementById("poem-body-in");
    const styleEl = document.getElementById("poem-style-in");
    const meterEl = document.getElementById("poem-meter-feedback");

    document.getElementById("btn-check-meter").addEventListener("click", () => {
      const raw = bodyEl.value.trim() || "Sớm mai ấm chén trà sen\nGặp người tri kỷ thân quen một nhà";
      if (!bodyEl.value.trim()) bodyEl.value = raw;
      meterEl.hidden = false;
      meterEl.textContent = evaluatePoemMeter(raw.split("\n"), styleEl.value);
    });

    document.getElementById("btn-mic-poem").addEventListener("click", () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        bodyEl.value = "Sớm mai ấm chén trà sen,\nGặp người tri kỷ thân quen một nhà.";
        meterEl.hidden = false;
        meterEl.textContent = evaluatePoemMeter(bodyEl.value.split("\n"), styleEl.value);
        showToast("Đã điền câu lục bát mẫu để bác thử đăng & ngâm thơ!");
        return;
      }
      showToast("Mời bác đọc 2 câu thơ vào micro...");
      const rec = new SR();
      rec.lang = "vi-VN";
      rec.onresult = (ev) => {
        const spoken = ev.results[0][0].transcript.trim();
        const words = spoken.split(/\s+/);
        bodyEl.value = words.length > 7 ? words.slice(0, 6).join(" ") + ",\n" + words.slice(6).join(" ") + "." : spoken;
        meterEl.hidden = false;
        meterEl.textContent = evaluatePoemMeter(bodyEl.value.split("\n"), styleEl.value);
      };
      rec.onerror = () => {
        bodyEl.value = "Sớm mai ấm chén trà sen,\nGặp người tri kỷ thân quen một nhà.";
        showToast("Chưa thu được micro — đã điền câu thơ mẫu để bác sửa thử.");
      };
      try {
        rec.start();
      } catch (e) {}
    });

    document.getElementById("btn-post-poem").addEventListener("click", () => {
      const title = document.getElementById("poem-title-in").value.trim() || "Hương trà tri kỷ";
      const body = bodyEl.value.trim() || "Chiều nay gió mát bên thềm,\nNgâm câu lục bát êm đềm tuổi xuân.";
      const safety = cleanAndApplyDictionary(title + " " + body);
      if (safety.blocked) {
        showToast("Vì an toàn, không đăng số điện thoại, số tài khoản hoặc đường link lên Chiếu thơ.");
        return;
      }
      const newPoem = {
        id: "p-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
        author: styleEl.value === "luc-bat" ? "Thơ Lục bát mới" : "Tự sáng tác",
        title,
        lines: body.split("\n").map((l) => l.trim()).filter(Boolean),
        flowers: 1,
        reciter: `${state.user.name} · ${getUserAge()}t (${getProvince(state.user.provinceId).short})`
      };
      state.poems.unshift(newPoem);
      if (RT) RT.publishPoem(newPoem);
      trackEvent("poem_posted");
      const unlockedNow = unlockTitleFrame("thi-huu", "Thi Hữu Tao Đàn");
      state.user.titleFrameId = "thi-huu";
      addXu(4, unlockedNow ? "Đăng thơ & nhận khung 3D Thi Hữu Tao Đàn!" : "Đăng bài thơ mới lên chiếu thơ");
      saveState();
      renderPoetry();
    });

    els.main.querySelectorAll(".listen-poem-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const p = allPoems[Number(b.dataset.idx)];
        if (!p) return;
        playDanTranhIntro();
        setTimeout(() => {
          speak(`${p.title}. Tác giả ${p.reciter}. ${p.lines.join(". ")}`, { announceToast: true });
        }, 420);
      });
    });

    els.main.querySelectorAll(".gift-flower-btn").forEach((b) => {
      b.addEventListener("click", () => {
        if (state.user.flowersLeft <= 0) return;
        const p = allPoems[Number(b.dataset.idx)];
        if (!p || (state.user.giftedPoemIds || []).includes(p.id)) return;
        p.flowers += 1;
        state.user.flowersLeft -= 1;
        state.user.giftedPoemIds.push(p.id);
        if (RT) RT.publishPoem(p);
        addXu(2, `Tặng hoa cho ${p.reciter}`);
        awardSkillPoints("poetry", 3);
        awardSeniorityPoints(3, "poem_flower_gift", "tho-ca", `Tặng hoa cho bài thơ "${p.title}"`, {
          eventType: "poem_action",
          module: "poetry",
          poemId: p.id,
          poemTitle: p.title
        });
        saveState();
        renderPoetry();
      });
    });
  }

  // ==================== MODULE 7: WATCH TOGETHER ====================
  function renderWatch() {
    const ch = D.WATCH_CHANNELS[state.watch.channelIdx];
    const r = state.watch.reactions;

    els.main.innerHTML = `
      <h1>Phòng xem chung</h1>
      <p class="lead-copy">Chiếu theo giờ hẹn cố định cùng 38 bác khác. Nội dung có giấy phép rõ ràng, phụ đề chữ lớn.</p>

      <div class="watch-screen">
        <div class="watch-canvas-area">
          <span class="badge-tag amber">${escHtml(ch.slot)}</span>
          <h2 style="color:#FFFDF7;">${escHtml(ch.title)}</h2>
          <small style="color:#E0D4BE;">${escHtml(ch.instructor)}</small>
          <button type="button" class="btn-primary btn-inline" id="btn-watch-play">${ico("speaker")}<span>Nghe thuyết minh đoạn đang chiếu</span></button>
        </div>
        <div class="watch-subtitle">${escHtml(ch.subtitle)}</div>
      </div>

      <div class="reaction-grid">
        <button type="button" class="reaction-btn" data-rx="laugh"><span>Cười vui</span><strong class="num">${r.laugh}</strong></button>
        <button type="button" class="reaction-btn" data-rx="clap"><span>Vỗ tay</span><strong class="num">${r.clap}</strong></button>
        <button type="button" class="reaction-btn" data-rx="heart"><span>Yêu thích</span><strong class="num">${r.heart}</strong></button>
        <button type="button" class="reaction-btn" data-rx="wow"><span>Hay quá</span><strong class="num">${r.wow}</strong></button>
      </div>

      <div class="surface-panel">
        <h3>Bỏ phiếu tiết mục tiếp theo</h3>
        ${D.WATCH_CHANNELS.map(
          (c, i) => `
          <button type="button" class="btn-secondary vote-ch-btn" data-idx="${i}" style="justify-content:space-between; ${state.watch.channelIdx === i ? "border-color:var(--accent-terracotta);background:var(--accent-amber-soft);" : ""}">
            <span style="text-align:left;">${escHtml(c.slot)}</span>
            <span class="badge-tag num">${state.watch.votes[i]} phiếu</span>
          </button>
        `
        ).join("")}
      </div>

      <!-- Separated Utility Shelf (Never overlapping video, no supplements/medicine) -->
      <div class="surface-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
          <h3>Góc đồ dùng tiện ích</h3>
          <small style="color:var(--ink-secondary);">Chúng tôi có thể nhận hoa hồng</small>
        </div>
        <p style="font-size:0.82rem; color:var(--ink-secondary);">Chỉ giới thiệu vật dụng sinh hoạt an toàn đã kiểm duyệt, không bán thuốc hay thực phẩm chức năng.</p>
        ${D.SAFE_AFFILIATE_ITEMS.map(
          (it) => `
          <div class="province-rank-item">
            <div>
              <strong>${escHtml(it.name)}</strong>
              <div style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(it.note)}</div>
            </div>
            <span class="badge-tag amber num">${escHtml(it.price)}</span>
          </div>
        `
        ).join("")}
      </div>
    `;

    document.getElementById("btn-watch-play").addEventListener("click", () => {
      speak(`${ch.title}. ${ch.subtitle}`);
    });

    els.main.querySelectorAll(".reaction-btn").forEach((b) => {
      b.addEventListener("click", () => {
        state.watch.reactions[b.dataset.rx] += 1;
        saveState();
        renderWatch();
      });
    });

    els.main.querySelectorAll(".vote-ch-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.idx);
        state.watch.channelIdx = idx;
        state.watch.votes[idx] += 1;
        saveState();
        showToast("Đã chuyển sang kênh bác vừa chọn!");
        renderWatch();
      });
    });
  }

  // ==================== MODULE 8: ZEN SPACE (FREE, WEB AUDIO BELL) ====================
  function playTempleBell() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const freqs = [240, 482, 728];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.22 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      // Audio blocked before user gesture
    }
  }

  function playWoodenFishSound() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc2.type = "triangle";
      osc.frequency.setValueAtTime(510, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.09);
      osc2.frequency.setValueAtTime(765, now);
      osc2.frequency.exponentialRampToValueAtTime(510, now + 0.07);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch (e) {}
  }

  function triggerTempleVisualWave(colorHex, popText, ritualKind) {
    if (!window.TempleScene3D) return;
    if (ritualKind === "bell") {
      window.TempleScene3D.triggerBell(popText || "Chánh Điện");
    } else if (ritualKind === "muyu") {
      window.TempleScene3D.triggerMuyu(state.zen.muyuCount || 1);
    } else if (ritualKind === "wish_plaque") {
      window.TempleScene3D.spawnWishPlaque(popText || state.user.name, false);
    } else if (ritualKind === "pond_lantern") {
      window.TempleScene3D.spawnPondLantern(popText || state.user.name);
    } else {
      window.TempleScene3D.triggerIncense(popText || state.user.name);
    }
  }

  function getMergedTemplePrayers() {
    const byId = {};
    (state.zen.prayers || []).forEach((p) => {
      byId[p.id] = p;
    });
    if (RT && typeof RT.getTemplePrayers === "function") {
      RT.getTemplePrayers().forEach((p) => {
        byId[p.id] = p;
      });
    }
    return Object.values(byId).slice(0, 12);
  }

  function buildTempleTenCushionAttendees() {
    const myCushion = Math.max(0, Math.min(9, Number(state.zen.userCushionIdx) || 2));
    const prog = getSeniorityProgress();
    const occupiedMap = {};

    occupiedMap[myCushion] = {
      cushionIdx: myCushion,
      name: state.user.name,
      shortLabel: "Bạn",
      outfitColor: getOutfit(state.user.outfitId).color,
      isFemale: state.user.honorific === "Chị",
      seniorityLevel: prog.current ? prog.current.level : 0,
      isUser: true,
      isRealPeer: false
    };

    const livePeers = RT ? RT.getOnlinePeers() : [];
    let nextFree = 0;
    const takeFreeSlot = (preferred) => {
      if (typeof preferred === "number" && preferred >= 0 && preferred <= 9 && !occupiedMap[preferred]) {
        return preferred;
      }
      while (nextFree < 10 && occupiedMap[nextFree]) nextFree += 1;
      return nextFree < 10 ? nextFree : -1;
    };

    livePeers.slice(0, 4).forEach((lp) => {
      const slot = takeFreeSlot(typeof lp.cushionIdx === "number" ? lp.cushionIdx : undefined);
      if (slot >= 0) {
        occupiedMap[slot] = {
          cushionIdx: slot,
          name: lp.name || "Bạn trực tuyến",
          shortLabel: String(lp.name || "Bạn thật").replace(/^(Anh|Chị|Bác)\s+/i, "").slice(0, 10),
          outfitColor: lp.outfitColor || "#2E5E4E",
          isFemale: /^Chị/i.test(lp.name || ""),
          seniorityLevel: lp.seniorityLevel || 6,
          isUser: false,
          isRealPeer: true
        };
      }
    });

    const companionSeeds = [
      { pref: 0, name: "Cụ Hòa", shortLabel: "Cụ Hòa", outfitColor: "#7A4B1E", isFemale: false, seniorityLevel: 26 },
      { pref: 1, name: "Chị Lan", shortLabel: "Chị Lan", outfitColor: "#2E5E4E", isFemale: true, seniorityLevel: 14 },
      { pref: 3, name: "Anh Minh", shortLabel: "Anh Minh", outfitColor: "#556B45", isFemale: false, seniorityLevel: 18 },
      { pref: 4, name: "Chị Hạnh", shortLabel: "Chị Hạnh", outfitColor: "#8A3F22", isFemale: true, seniorityLevel: 23 },
      { pref: 6, name: "Anh Vĩnh", shortLabel: "Anh Vĩnh", outfitColor: "#4F6842", isFemale: false, seniorityLevel: 15 },
      { pref: 8, name: "Chị Mai", shortLabel: "Chị Mai", outfitColor: "#6E4A35", isFemale: true, seniorityLevel: 9 }
    ];

    companionSeeds.forEach((sc) => {
      const slot = takeFreeSlot(sc.pref);
      if (slot >= 0 && Object.keys(occupiedMap).length < 8) {
        occupiedMap[slot] = Object.assign({ cushionIdx: slot, isUser: false, isRealPeer: false }, sc);
      }
    });

    return Object.values(occupiedMap);
  }

  function renderZen() {
    const sp = D.ZEN_SPACES[state.zen.spaceIdx] || D.ZEN_SPACES[0];
    const cards = D.TEMPLE_PEACE_CARDS || [];
    const curCard = cards[(state.zen.peaceCardIdx || 0) % cards.length];
    const prayers = getMergedTemplePrayers();
    const attendees = buildTempleTenCushionAttendees();
    const camMode = state.zen.cameraView || "wide";
    const myCushion = Math.max(0, Math.min(9, Number(state.zen.userCushionIdx) || 2));
    const plaqueTitles = ["TÂM AN VẠN SỰ AN", "HƯƠNG SEN TĨNH TẠI", "ĐẠI HỒNG CHUNG AN LẠC"];

    els.main.innerHTML = `
      <h1>Chánh Điện 3D &amp; Sân Chùa Cổ</h1>
      <p class="lead-copy">Không gian 3D góc rộng: mái chùa cổ đao cong, 10 chiếu bồ đoàn ngồi chung, sân hồ sen thả hoa đăng và cây ước nguyện treo thẻ đỏ (hoàn toàn miễn phí, không thu tiền cúng dường).</p>

      <div class="temple-cam-bar" role="tablist" aria-label="Chọn không gian tĩnh tâm">
        ${D.ZEN_SPACES.map(
          (s, i) => `<button type="button" class="temple-cam-btn ${state.zen.spaceIdx === i ? "active" : ""}" data-zen="${i}">${escHtml(s.name)}</button>`
        ).join("")}
      </div>

      <!-- Chọn 3 góc máy 3D (kéo ngang trên màn hình để xoay quanh sân chùa) -->
      <div class="temple-cam-bar" role="group" aria-label="Chọn góc nhìn Chánh Điện 3D">
        <button type="button" class="temple-cam-btn ${camMode === "wide" ? "active" : ""}" data-tcam="wide">Toàn cảnh Chùa &amp; Sân</button>
        <button type="button" class="temple-cam-btn ${camMode === "cushions" ? "active" : ""}" data-tcam="cushions">Cận cảnh 10 Bồ Đoàn</button>
        <button type="button" class="temple-cam-btn ${camMode === "courtyard" ? "active" : ""}" data-tcam="courtyard">Hồ Sen &amp; Cây Thẻ Đỏ</button>
      </div>

      <div class="temple-sanctuary-wrap" id="temple-3d-stage" aria-label="Không gian Chánh Điện 3D và Sân Chùa"></div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.88rem;" class="num">
        <span>Thẻ đỏ trên cây: <strong id="zen-wish-counter">${state.zen.wishPlaquesCount || 16}</strong> thẻ · Hoa đăng hồ sen: <strong id="zen-lantern-counter">${state.zen.lanternsReleased || 18}</strong></span>
        <span>Hương trầm: <strong>${state.zen.incenseCount || 14}</strong> · Nhịp mõ: <strong id="zen-muyu-counter">${state.zen.muyuCount || 0}</strong></span>
      </div>

      <!-- Chọn 1 trong 10 Chiếu Bồ Đoàn 3D để ngồi tĩnh tâm cùng bạn -->
      <div class="surface-panel">
        <div class="passcard-head">
          <strong>Chọn Chiếu Bồ Đoàn 3D (Đang ngồi BĐ${myCushion + 1})</strong>
          <span class="badge-tag jade num">${attendees.length}/10 chiếu có người</span>
        </div>
        <div class="cushion-pick-grid" role="group" aria-label="Chọn vị trí chiếu Bồ Đoàn từ 1 đến 10">
          ${Array.from({ length: 10 }, (_, idx) => {
            const occ = attendees.find((a) => a.cushionIdx === idx);
            const isMe = idx === myCushion;
            const sub = isMe ? "Bạn ngồi" : occ ? occ.shortLabel : "Trống";
            return `
              <button type="button" class="cushion-pick-btn ${isMe ? "selected" : ""} ${occ && occ.isRealPeer ? "peer-occupied" : ""}" data-cushion="${idx}">
                <span>BĐ ${idx + 1}</span>
                <span style="font-weight:500;">${escHtml(sub)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- 6 Nghi thức Chánh Điện & Sân Chùa 3D 1 chạm -->
      <div class="temple-ritual-grid" role="group" aria-label="Nghi thức Chánh Điện và Sân Chùa 3D">
        <button type="button" class="btn-primary" id="btn-temple-hang-wish">
          ${ico("award")}
          <span>Treo Thẻ Đỏ Lên Cây</span>
        </button>
        <button type="button" class="btn-jade" id="btn-temple-pond-lantern">
          ${ico("lotus")}
          <span>Thả Hoa Đăng Hồ Sen</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-temple-incense">
          <span>Dâng Hương Tam Bảo</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-temple-muyu">
          <span>Gõ Mõ Tĩnh Tâm (+1)</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-ring-bell">
          ${ico("bell")}
          <span>Thỉnh Đại Hồng Chung</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-draw-peace-card">
          <span>Rút Thẻ An Lạc Mới</span>
        </button>
      </div>

      ${
        curCard
          ? `
        <div class="peace-card-slip" id="peace-card-box">
          <div class="passcard-head">
            <strong style="color:#7A3E12;">${escHtml(curCard.code)}</strong>
            <span class="badge-tag amber">Thẻ Thiện Lành Đầu Ngày</span>
          </div>
          <div class="peace-card-verse">${escHtml(curCard.verse)}</div>
          <p style="font-size:0.92rem; color:var(--ink-primary);">${escHtml(curCard.advice)}</p>
          <button type="button" class="btn-secondary" id="btn-zen-listen">${ico("speaker")}<span>Nghe đọc lời Thẻ An Lạc</span></button>
        </div>
      `
          : ""
      }

      <!-- Viết Thẻ Đỏ Ước Nguyện Treo Ngoài Sân Chùa -->
      <div class="surface-panel">
        <h3>Viết Thẻ Đỏ Ước Nguyện Treo Lên Cây Sân Chùa</h3>
        <div class="reply-stack">
          ${(D.TEMPLE_PRAYER_PRESETS || [])
            .map(
              (pr, i) =>
                `<button type="button" class="reply-btn" data-prayer-preset="${escHtml(pr)}">${i + 1}. "${escHtml(pr)}"</button>`
            )
            .join("")}
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" class="input-lg" id="temple-prayer-in" placeholder="Viết lời ước nguyện treo lên cây thẻ đỏ..." style="flex:1;" />
          <button type="button" class="btn-primary btn-inline" id="btn-send-prayer">Treo thẻ đỏ</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          <strong>Thẻ đỏ ước nguyện &amp; lời cầu an của các bác (${prayers.length}):</strong>
          ${prayers
            .map(
              (item) => `
              <div class="bulletin-item">
                <div style="display:flex; justify-content:space-between; gap:8px; font-size:0.88rem; color:var(--accent-jade); font-weight:700;">
                  <span>${escHtml(item.userName)}${typeof item.cushionIdx === "number" ? ` · BĐ${item.cushionIdx + 1}` : ""}</span>
                  <span>${escHtml(item.ritualKind === "wish_plaque" ? "Thẻ đỏ sân chùa" : "Hương trầm")} · ${escHtml(item.province || "")}</span>
                </div>
                <p>${escHtml(item.prayerText)}</p>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
    `;

    const stageEl = document.getElementById("temple-3d-stage");
    if (stageEl && window.TempleScene3D) {
      window.TempleScene3D.mount(
        stageEl,
        {
          preferredRender: state.settings.preferredRender,
          cameraView: camMode,
          plaqueTitle: plaqueTitles[state.zen.spaceIdx % plaqueTitles.length],
          userCushionIdx: myCushion,
          attendees,
          lanternCount: state.zen.lanternsReleased || 18,
          totalWishCount: state.zen.wishPlaquesCount || 16,
          wishes: prayers
        },
        () => {
          state.settings.autoFallbacked = true;
          updateGlobalChrome();
        }
      );
    }

    els.main.querySelectorAll("[data-zen]").forEach((b) => {
      b.addEventListener("click", () => {
        state.zen.spaceIdx = Number(b.dataset.zen);
        saveState();
        renderZen();
      });
    });

    els.main.querySelectorAll("[data-tcam]").forEach((b) => {
      b.addEventListener("click", () => {
        const nextCam = b.dataset.tcam || "wide";
        state.zen.cameraView = nextCam;
        saveState();
        els.main.querySelectorAll("[data-tcam]").forEach((el) => el.classList.toggle("active", el.dataset.tcam === nextCam));
        if (window.TempleScene3D) window.TempleScene3D.setCameraView(nextCam);
        trackTelemetryDirect("temple_ritual", "zen", "switch_3d_camera", { cameraView: nextCam });
      });
    });

    els.main.querySelectorAll("[data-cushion]").forEach((b) => {
      b.addEventListener("click", () => {
        const cIdx = Math.max(0, Math.min(9, Number(b.dataset.cushion) || 0));
        state.zen.userCushionIdx = cIdx;
        awardSkillPoints("temple_zen", 2);
        trackTelemetryDirect("temple_ritual", "zen", "select_cushion", { ritualKind: "cushion_select", cushionIdx: cIdx });
        saveState();
        syncMyGlobalOnlinePresence();
        showToast(`Bác đã chuyển sang ngồi Chiếu Bồ Đoàn số ${cIdx + 1}.`);
        renderZen();
      });
    });

    const publishWishOrIncense = (text, ritualKind) => {
      const clean = String(text || "").trim();
      if (!clean) return;
      const prog = getSeniorityProgress();
      const isVeteranGold = Boolean(prog.current && prog.current.level >= 23);
      if (ritualKind === "wish_plaque") {
        state.zen.wishPlaquesCount = (state.zen.wishPlaquesCount || 16) + 1;
      } else {
        state.zen.incenseLit = true;
        state.zen.incenseCount = (state.zen.incenseCount || 14) + 1;
      }
      const pObj = {
        id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        memberCode: (state.auth && state.auth.memberCode) || "",
        userName: `${state.user.name} · ${getUserAge()}t`,
        province: getProvince(state.user.provinceId).short,
        ritualKind: ritualKind || "wish_plaque",
        cushionIdx: myCushion,
        isVeteranGold,
        prayerText: clean
      };
      if (!Array.isArray(state.zen.prayers)) state.zen.prayers = [];
      state.zen.prayers.unshift(pObj);
      state.zen.prayers = state.zen.prayers.slice(0, 16);
      if (RT && typeof RT.publishTempleRitual === "function") {
        RT.publishTempleRitual(pObj);
      }
      awardSeniorityPoints(
        4,
        ritualKind === "wish_plaque" ? "temple_wish_plaque" : "temple_incense",
        "chua-online",
        `${ritualKind === "wish_plaque" ? "Treo thẻ đỏ ước nguyện" : "Dâng hương Tam Bảo"}: "${clean.slice(0, 56)}"`,
        {
          eventType: "temple_ritual",
          module: "zen",
          ritualKind: ritualKind || "wish_plaque",
          cushionIdx: myCushion,
          wishText: clean
        }
      );
      renderZen();
      if (window.TempleScene3D) {
        if (ritualKind === "wish_plaque") {
          window.TempleScene3D.spawnWishPlaque(state.user.name, isVeteranGold);
        } else {
          window.TempleScene3D.triggerIncense(state.user.name);
        }
      }
      showToast(
        ritualKind === "wish_plaque"
          ? "Đã treo Thẻ Đỏ ước nguyện lên cây cổ thụ ngoài sân chùa!"
          : "Đã dâng nén hương trầm thơm ấm tại Tam Bảo Chánh Điện!"
      );
    };

    document.getElementById("btn-temple-hang-wish").addEventListener("click", () => {
      const presets = D.TEMPLE_PRAYER_PRESETS || [];
      const chosen = presets[(state.zen.wishPlaquesCount || 0) % Math.max(1, presets.length)] || sp.quote;
      publishWishOrIncense(chosen, "wish_plaque");
    });

    document.getElementById("btn-temple-pond-lantern").addEventListener("click", () => {
      playWoodenFishSound();
      state.zen.lanternsReleased = (state.zen.lanternsReleased || 18) + 1;
      const lEl = document.getElementById("zen-lantern-counter");
      if (lEl) lEl.textContent = String(state.zen.lanternsReleased);
      if (window.TempleScene3D) {
        window.TempleScene3D.spawnPondLantern(state.user.name);
      }
      if (RT && typeof RT.publishTempleRitual === "function") {
        RT.publishTempleRitual({ userName: state.user.name, ritualKind: "pond_lantern", cushionIdx: myCushion });
      }
      awardSeniorityPoints(4, "temple_pond_lantern", "chua-online", "Thả Hoa Đăng sáng trên sân Hồ Sen 3D", {
        eventType: "temple_ritual",
        module: "zen",
        ritualKind: "pond_lantern",
        cushionIdx: myCushion
      });
      showToast("Đã thả thêm một ngọn Hoa Đăng trôi nhẹ trên mặt Hồ Sen!");
    });

    document.getElementById("btn-temple-incense").addEventListener("click", () => {
      const presets = D.TEMPLE_PRAYER_PRESETS || [];
      const chosen = presets[(state.zen.incenseCount || 0) % Math.max(1, presets.length)] || sp.quote;
      publishWishOrIncense(chosen, "incense");
    });

    document.getElementById("btn-temple-muyu").addEventListener("click", () => {
      playWoodenFishSound();
      state.zen.muyuCount = (state.zen.muyuCount || 0) + 1;
      const cntEl = document.getElementById("zen-muyu-counter");
      if (cntEl) cntEl.textContent = String(state.zen.muyuCount);
      if (window.TempleScene3D) window.TempleScene3D.triggerMuyu(state.zen.muyuCount);
      awardSeniorityPoints(1, "temple_muyu", "chua-online", `Gõ mõ tĩnh tâm (${state.zen.muyuCount} nhịp)`, {
        eventType: "temple_ritual",
        module: "zen",
        ritualKind: "muyu",
        cushionIdx: myCushion
      });
    });

    document.getElementById("btn-ring-bell").addEventListener("click", () => {
      playTempleBell();
      state.zen.bellCount = (state.zen.bellCount || 0) + 1;
      if (window.TempleScene3D) window.TempleScene3D.triggerBell(state.user.name);
      if (RT && typeof RT.publishTempleRitual === "function") {
        RT.publishTempleRitual({
          userName: state.user.name,
          ritualKind: "bell",
          cushionIdx: myCushion
        });
      }
      awardSeniorityPoints(2, "temple_bell", "chua-online", "Thỉnh Đại Hồng Chung ngân vang Chánh Điện", {
        eventType: "temple_ritual",
        module: "zen",
        ritualKind: "bell",
        cushionIdx: myCushion
      });
      showToast("Tiếng Đại Hồng Chung ngân vang khắp sân chùa 3D.");
    });

    document.getElementById("btn-draw-peace-card").addEventListener("click", () => {
      playWoodenFishSound();
      state.zen.peaceCardIdx = ((state.zen.peaceCardIdx || 0) + 1) % Math.max(1, cards.length);
      const nextCard = cards[state.zen.peaceCardIdx];
      awardSeniorityPoints(3, "temple_peace_card", "chua-online", `Rút ${nextCard ? nextCard.code : "Thẻ An Lạc"}`, {
        eventType: "temple_ritual",
        module: "zen",
        ritualKind: "peace_card"
      });
      showToast(`Đã rút ${nextCard ? nextCard.code : "Thẻ An Lạc mới"}!`);
      renderZen();
    });

    els.main.querySelectorAll("[data-prayer-preset]").forEach((b) => {
      b.addEventListener("click", () => publishWishOrIncense(b.dataset.prayerPreset, "wish_plaque"));
    });

    document.getElementById("btn-send-prayer").addEventListener("click", () => {
      const inp = document.getElementById("temple-prayer-in");
      if (!inp.value.trim()) {
        showToast("Mời bác nhập lời ước nguyện hoặc chạm 1 trong 4 câu mẫu bên trên.");
        return;
      }
      publishWishOrIncense(inp.value, "wish_plaque");
    });

    const listenBtn = document.getElementById("btn-zen-listen");
    if (listenBtn && curCard) {
      listenBtn.addEventListener("click", () => {
        awardSkillPoints("voice_wisdom", 1);
        speak(`${curCard.code}. ${curCard.verse}. Lời nhắn gửi: ${curCard.advice}`);
      });
    }
  }

  // ==================== MODULE 9: 96-TITLE PROGRESSION TREES & LEADERBOARD ====================
  function renderLeaderboard() {
    const prog = getSeniorityProgress();
    const myProv = getProvince(state.user.provinceId).short;
    const mainTiers = PROG ? PROG.MAIN_TIERS : [];
    const eras = PROG ? PROG.ERAS : [];
    const skillTrees = PROG ? PROG.SKILL_TREES : [];
    const userSkills = state.user.skillPoints || {};

    let unlockedSkillBadgesCount = 0;
    skillTrees.forEach((tr) => {
      const ev = PROG.evaluateSkillTree(tr.id, userSkills[tr.id] || 0);
      if (ev.current) unlockedSkillBadgesCount += ev.current.rank;
    });

    const myScore = (prog.points || 28) * 3 + state.user.xu * 4 + state.user.streakDays * 15;
    const enrichedLeaderboard = [
      { name: `${state.user.name} (Bạn)`, province: myProv, score: myScore, level: prog.current.level || 1, title: prog.current.name, cohortCls: prog.cohort.cls, cohortTag: prog.cohort.tag },
      { name: "Cụ Hòa · 79t", province: "Hà Nội", score: 49200, level: 29, title: "Tầng 29 · Trưởng Thượng Tri Âm", cohortCls: "veteran", cohortTag: "Cây đại thụ · Tầng 29" },
      { name: "Chị Hạnh · 74t", province: "Thừa Thiên Huế", score: 31400, level: 24, title: "Tầng 24 · Cội Tùng Vững Chãi", cohortCls: "veteran", cohortTag: "Cây đại thụ · Tầng 24" },
      { name: "Anh Minh · 71t", province: "Hải Phòng", score: 17850, level: 18, title: "Tầng 18 · Trưởng Lão Hòa Hiếu", cohortCls: "elder", cohortTag: "Trưởng lão · Tầng 18" },
      { name: "Chị Lan · 68t", province: "Hà Nội", score: 9640, level: 14, title: "Tầng 14 · Cây Trúc Giữa Sân", cohortCls: "trusted", cohortTag: "Tri kỷ · Tầng 14" },
      { name: "Anh Sơn · 63t", province: myProv, score: 1120, level: 4, title: "Tầng 4 · Khách Quý Hiên Nhà", cohortCls: "newcomer", cohortTag: "Người mới · Tầng 4" },
      { name: "Chị Thảo · 61t", province: "Đà Nẵng", score: 680, level: 2, title: "Tầng 2 · Bạn Trà Đầu Ngõ", cohortCls: "newcomer", cohortTag: "Người mới · Tầng 2" }
    ]
      .filter((r) => {
        if (activeRankProvinceFilter === "mine") return r.province === myProv;
        if (activeRankProvinceFilter === "newcomer") return r.level <= 5;
        if (activeRankProvinceFilter === "veteran") return r.level >= 14;
        return true;
      })
      .sort((a, b) => b.score - a.score);

    els.main.innerHTML = `
      <h1>Hệ Thống 96 Danh Hiệu &amp; Bảng Vinh Danh</h1>
      <p class="lead-copy">Gồm 32 tầng thâm niên chính thức và 8 cây danh hiệu chuyên môn (64 bậc) tính theo công thức toán học lồi độ khó tăng dần, vinh danh rõ ràng cả người mới lẫn bậc lão làng.</p>

      <!-- Thẻ tóm tắt thâm niên hiện tại của Hội viên -->
      <div class="surface-panel warm">
        <div class="passcard-head">
          <strong>${escHtml(prog.current.name)}</strong>
          <span class="cohort-pill ${escHtml(prog.cohort.cls)}">${escHtml(prog.cohort.tag)}</span>
        </div>
        <div class="seniority-progress-wrap">
          <div class="seniority-progress-track">
            <div class="seniority-progress-fill" style="width:${prog.percent}%"></div>
          </div>
          <small style="font-size:0.88rem; color:var(--ink-secondary);" class="num">
            Tích lũy hiện tại: <strong>${prog.points} XP</strong> · Đã mở <strong>${unlockedSkillBadgesCount}/64</strong> bậc chuyên môn${
              prog.next ? ` · Cần thêm <strong>${prog.xpNeededForNext} XP</strong> lên ${escHtml(prog.next.name)}` : ""
            }.
          </small>
        </div>
        ${
          prog.isGuest
            ? `<button type="button" class="btn-primary" id="btn-lb-open-card">${ico("card")}<span>Mở Thẻ 10 Giây — Nhận +35 XP Lên Tầng 1 Ngay</span></button>`
            : ""
        }
      </div>

      <div class="temple-cam-bar" role="tablist" aria-label="Chọn nhánh danh hiệu">
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "Cay32" ? "active" : ""}" id="lb-tab-32">Cây 32 Tầng Thâm Niên</button>
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "ChuyenMon" ? "active" : ""}" id="lb-tab-skills">8 Cây Chuyên Môn (64)</button>
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "Tinh" ? "active" : ""}" id="lb-tab-board">Bảng Vàng Mới &amp; Cũ</button>
      </div>

      ${
        activeLeaderTab === "Cay32"
          ? `
        <div class="math-formula-box">
          <strong>Công thức toán học độ khó tăng dần (Hàm lũy thừa kết hợp mũ lồi):</strong>
          <div class="math-formula-code">XP(L) = floor( 20 · L^1.85 + 12 · L · 1.11^L )   với L = 1..32</div>
          <span>Tầng 1 chỉ cần <strong>33 XP</strong> (người mới lên ngay trong ngày đầu), Tầng 10 cần <strong>1.756 XP</strong>, Tầng 20 cần <strong>7.024 XP</strong>, và đỉnh cao Tầng 32 cần <strong>23.006 XP</strong> gắn bó bền bỉ nhiều năm.</span>
        </div>

        ${eras
          .slice(1)
          .map((era) => {
            const tiersInEra = mainTiers.filter((t) => t.era && t.era.id === era.id);
            return `
            <div class="era-section-card">
              <div class="passcard-head">
                <strong style="color:${escHtml(era.color)};">${escHtml(era.eraName)} (${escHtml(era.rangeLabel)})</strong>
                <span class="badge-tag" style="background:${escHtml(era.bg)};color:${escHtml(era.color)};">${escHtml(era.cohortRole)}</span>
              </div>
              <div class="era-tier-grid">
                ${tiersInEra
                  .map((t) => {
                    const isCurr = !prog.isGuest && prog.current.level === t.level;
                    const isReached = !prog.isGuest && prog.current.level >= t.level;
                    const prevMin = t.level > 1 ? mainTiers[t.level - 1].minXp : 0;
                    const deltaReq = t.minXp - prevMin;
                    return `
                    <div class="tier-32-row ${isCurr ? "current" : isReached ? "reached" : ""}">
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <strong style="color:${escHtml(era.color)};">${escHtml(t.fullLabel)}</strong>
                        <span class="badge-tag ${isCurr ? "amber" : isReached ? "jade" : ""} num">${
                          isCurr ? "Đang đạt" : `${t.minXp.toLocaleString("vi-VN")} XP (+${deltaReq.toLocaleString("vi-VN")})`
                        }</span>
                      </div>
                      <span style="color:var(--ink-secondary);">${escHtml(t.perk)}</span>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>
          `;
          })
          .join("")}
      `
          : activeLeaderTab === "ChuyenMon"
          ? `
        <div class="math-formula-box">
          <strong>Công thức toán cho 8 Cây Tính Năng (Mỗi cây 8 bậc I → VIII = 64 danh hiệu):</strong>
          <div class="math-formula-code">M(k) = ceil( a · k^2.15 + b · (1.38^(k-1) - 1) )   với k = 1..8</div>
          <span>Bậc I chỉ cần 1 điểm để khích lệ người mới thử tính năng; từ Bậc V đến Bậc VIII khoảng cách điểm giãn rộng theo cấp số nhân để tôn vinh chuyên gia thực thụ.</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${skillTrees
            .map((tree) => {
              const ev = PROG.evaluateSkillTree(tree.id, userSkills[tree.id] || 0);
              return `
              <div class="skill-tree-card">
                <div class="passcard-head">
                  <strong style="color:${escHtml(tree.color)};">${escHtml(tree.name)}</strong>
                  <span class="badge-tag amber num">${ev.points} điểm</span>
                </div>
                <small style="font-size:0.88rem; color:var(--ink-secondary);">Cách tích điểm: ${escHtml(tree.howToEarn)} · <code>${escHtml(tree.formulaNote)}</code></small>
                <div class="seniority-progress-wrap">
                  <div class="seniority-progress-track">
                    <div class="seniority-progress-fill" style="width:${ev.percent}%; background-color:${escHtml(tree.color)};"></div>
                  </div>
                  <small style="font-size:0.88rem;">
                    Hiện đạt: <strong>${ev.current ? `Bậc ${ev.current.roman} · ${escHtml(ev.current.title)}` : "Chưa mở bậc I"}</strong>
                    ${ev.next ? ` · Mốc tiếp: Bậc ${ev.next.roman} (${ev.next.reqPoints} điểm)` : " · Đã đạt đỉnh Bậc VIII!"}
                  </small>
                </div>
                <div class="skill-tier-pill-grid">
                  ${tree.tiers
                    .map((rk) => {
                      const unlocked = ev.points >= rk.reqPoints;
                      const isActive = ev.current && ev.current.rank === rk.rank;
                      return `
                      <div class="skill-tier-pill ${isActive ? "active-rank" : unlocked ? "unlocked" : ""}">
                        <strong>${rk.roman}. ${escHtml(rk.title)}</strong>
                        <span style="color:var(--ink-secondary);">${rk.reqPoints} điểm</span>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
                <button type="button" class="btn-secondary" data-go-skill="${escHtml(tree.featureRoute)}">Vào rèn luyện tính năng này</button>
              </div>
            `;
            })
            .join("")}
        </div>
      `
          : `
        <div class="surface-panel">
          <h3>Phân tầng vinh danh Người Mới &amp; Bậc Lão Làng</h3>
          <p style="font-size:0.88rem; color:var(--ink-secondary);">Người mới (Tầng 1–5) có bảng chào đón riêng để tự tin hòa nhập; các bậc Tri Kỷ &amp; Cây Đại Thụ (Tầng 14–32) được gắn huy hiệu uy tín toàn quán.</p>
          <div class="temple-ritual-grid">
            <button type="button" class="btn-${activeRankProvinceFilter === "all" ? "jade" : "secondary"}" data-rkf="all">Tất cả hội viên</button>
            <button type="button" class="btn-${activeRankProvinceFilter === "newcomer" ? "jade" : "secondary"}" data-rkf="newcomer">Vinh danh Người mới</button>
            <button type="button" class="btn-${activeRankProvinceFilter === "veteran" ? "jade" : "secondary"}" data-rkf="veteran">Bậc Trưởng Lão / Cũ</button>
            <button type="button" class="btn-${activeRankProvinceFilter === "mine" ? "jade" : "secondary"}" data-rkf="mine">Đồng hương ${escHtml(myProv)}</button>
          </div>
          <div class="province-rank-list" style="margin-top:8px;">
            ${enrichedLeaderboard
              .map(
                (r, idx) => `
              <div class="province-rank-item">
                <div>
                  <strong>${idx + 1}. ${escHtml(r.name)}</strong>
                  <div style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(r.province)} · ${escHtml(r.title)}</div>
                </div>
                <span class="cohort-pill ${escHtml(r.cohortCls)}">${escHtml(r.cohortTag)}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
      }
    `;

    document.getElementById("lb-tab-32").addEventListener("click", () => {
      activeLeaderTab = "Cay32";
      renderLeaderboard();
    });
    document.getElementById("lb-tab-skills").addEventListener("click", () => {
      activeLeaderTab = "ChuyenMon";
      renderLeaderboard();
    });
    document.getElementById("lb-tab-board").addEventListener("click", () => {
      activeLeaderTab = "Tinh";
      renderLeaderboard();
    });

    const openCardBtn = document.getElementById("btn-lb-open-card");
    if (openCardBtn) {
      openCardBtn.addEventListener("click", () => openMemberAuthModal());
    }

    els.main.querySelectorAll("[data-go-skill]").forEach((b) => {
      b.addEventListener("click", () => navigate(b.dataset.goSkill));
    });

    els.main.querySelectorAll("[data-rkf]").forEach((b) => {
      b.addEventListener("click", () => {
        activeRankProvinceFilter = b.dataset.rkf || "all";
        renderLeaderboard();
      });
    });
  }

  let profilePreviewDraft = null;

  function renderOutfitSampleSvg(outfit) {
    const c = outfit.color || "#6E4A35";
    let detail = "";
    if (outfit.id === "ao-ba-ba") {
      detail = `
        <line x1="28" y1="18" x2="28" y2="46" stroke="#F5EBD6" stroke-width="1.4"/>
        <circle cx="28" cy="24" r="1.4" fill="#FFFDF7"/><circle cx="28" cy="31" r="1.4" fill="#FFFDF7"/><circle cx="28" cy="38" r="1.4" fill="#FFFDF7"/>
        <rect x="17" y="36" width="6" height="6" rx="1" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.1"/>
        <rect x="33" y="36" width="6" height="6" rx="1" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.1"/>
      `;
    } else if (outfit.id === "ao-dai-xanh") {
      detail = `
        <path d="M24 16 Q32 22 33 46" fill="none" stroke="#E8F3EE" stroke-width="1.5"/>
        <circle cx="29" cy="21" r="1.3" fill="#FFFDF7"/><circle cx="31.5" cy="27" r="1.3" fill="#FFFDF7"/>
      `;
    } else if (outfit.id === "ao-linh") {
      detail = `
        <line x1="28" y1="17" x2="28" y2="46" stroke="#DCE6D3" stroke-width="1.3"/>
        <rect x="17.5" y="24" width="6.5" height="7" rx="1" fill="none" stroke="#DCE6D3" stroke-width="1.2"/>
        <rect x="32" y="24" width="6.5" height="7" rx="1" fill="none" stroke="#DCE6D3" stroke-width="1.2"/>
        <line x1="16" y1="14" x2="22" y2="15" stroke="#DCE6D3" stroke-width="1.6"/>
        <line x1="34" y1="15" x2="40" y2="14" stroke="#DCE6D3" stroke-width="1.6"/>
      `;
    } else if (outfit.id === "ao-len-do") {
      detail = `
        <path d="M22 15 L28 23 L34 15" fill="none" stroke="#FAD8AF" stroke-width="1.8"/>
        <path d="M20 29 L24 33 L28 29 L32 33 L36 29" fill="none" stroke="rgba(255,235,210,0.65)" stroke-width="1.4"/>
      `;
    } else {
      detail = `
        <circle cx="24" cy="28" r="3.2" fill="#FFE394"/>
        <circle cx="24" cy="28" r="1.3" fill="#B83B2A"/>
        <circle cx="33" cy="35" r="2.6" fill="#FFE394"/>
      `;
    }
    return `
      <span class="sample-thumb" aria-hidden="true">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <rect x="1" y="1" width="54" height="54" rx="12" fill="#FBF5E8" stroke="#D5C4AA" stroke-width="1.4"/>
          <path d="M18 14 L23 11 L33 11 L38 14 L46 22 L41 28 L37 24 L37 46 L19 46 L19 24 L15 28 L10 22 Z" fill="${escHtml(c)}" stroke="#2A1E17" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M23 11 Q28 16 33 11" fill="#F5EBD6" stroke="#2A1E17" stroke-width="1.1"/>
          ${detail}
        </svg>
      </span>
    `;
  }

  function renderAccessorySampleSvg(acc) {
    let art = "";
    if (acc.id === "glasses") {
      art = `
        <circle cx="19" cy="29" r="7.5" fill="#FFFDF9" stroke="#B67E22" stroke-width="2.4"/>
        <circle cx="37" cy="29" r="7.5" fill="#FFFDF9" stroke="#B67E22" stroke-width="2.4"/>
        <path d="M26.5 29 Q28 26.5 29.5 29" fill="none" stroke="#B67E22" stroke-width="2.2"/>
        <line x1="8" y1="26" x2="11.5" y2="28" stroke="#8C5B1F" stroke-width="2" stroke-linecap="round"/>
        <line x1="44.5" y1="28" x2="48" y2="26" stroke="#8C5B1F" stroke-width="2" stroke-linecap="round"/>
      `;
    } else if (acc.id === "scarf") {
      art = `
        <path d="M13 22 C13 15, 43 15, 43 22 C43 29, 13 29, 13 22 Z" fill="#A63426" stroke="#6E1E14" stroke-width="1.5"/>
        <path d="M29 26 L35 44 L26 44 L23 27 Z" fill="#B83B2A" stroke="#6E1E14" stroke-width="1.3"/>
        <line x1="26" y1="44" x2="25" y2="48" stroke="#A63426" stroke-width="1.6"/>
        <line x1="30" y1="44" x2="30" y2="48" stroke="#A63426" stroke-width="1.6"/>
        <line x1="34" y1="44" x2="35" y2="48" stroke="#A63426" stroke-width="1.6"/>
      `;
    } else if (acc.id === "cap") {
      art = `
        <path d="M13 31 C14 17, 42 17, 43 31 Z" fill="#4F6842" stroke="#2D3E24" stroke-width="1.5"/>
        <ellipse cx="28" cy="31" rx="19" ry="4.5" fill="#3E5433" stroke="#2D3E24" stroke-width="1.4"/>
        <circle cx="28" cy="18" r="2" fill="#3E5433"/>
      `;
    } else if (acc.id === "non-la") {
      art = `
        <polygon points="28,12 8,36 48,36" fill="#EAD69B" stroke="#9C7A3C" stroke-width="1.6" stroke-linejoin="round"/>
        <line x1="15" y1="28" x2="41" y2="28" stroke="#C5A467" stroke-width="1.2"/>
        <line x1="21" y1="20.5" x2="35" y2="20.5" stroke="#C5A467" stroke-width="1.2"/>
        <path d="M17 36 Q28 47 39 36" fill="none" stroke="#B83B2A" stroke-width="1.8"/>
      `;
    } else {
      art = `
        <circle cx="28" cy="30" r="11" fill="#F4CFB4" stroke="#C79E82" stroke-width="1.2"/>
        <path d="M17 28 C17 19, 39 19, 39 28 C35 24, 21 24, 17 28 Z" fill="#E4DFD5" stroke="#B5AEA2" stroke-width="1.2"/>
        <circle cx="24" cy="30" r="1.4" fill="#2A1C15"/><circle cx="32" cy="30" r="1.4" fill="#2A1C15"/>
        <path d="M24.5 35 Q28 37.5 31.5 35" fill="none" stroke="#9B4B3C" stroke-width="1.5" stroke-linecap="round"/>
      `;
    }
    return `
      <span class="sample-thumb" aria-hidden="true">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <rect x="1" y="1" width="54" height="54" rx="12" fill="#FBF5E8" stroke="#D5C4AA" stroke-width="1.4"/>
          ${art}
        </svg>
      </span>
    `;
  }

  function renderTableItemSampleSvg(item) {
    let art = "";
    if (item.id === "am-tu-sa") {
      art = `
        <ellipse cx="28" cy="43" rx="16" ry="3.5" fill="#5C3620"/>
        <ellipse cx="28" cy="33" rx="12" ry="9" fill="#9B4026" stroke="#5A2212" stroke-width="1.4"/>
        <ellipse cx="28" cy="24" rx="6.5" ry="2.4" fill="#84341D"/>
        <circle cx="28" cy="21.5" r="2" fill="#D9A441"/>
        <path d="M39 32 Q45 27 46 23" fill="none" stroke="#9B4026" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M17 28 C11 28, 11 37, 17 37" fill="none" stroke="#9B4026" stroke-width="2.8"/>
        <path d="M26 17 Q24 13 27 9 M31 18 Q33 14 30 10" fill="none" stroke="#B8ADA0" stroke-width="1.5" stroke-linecap="round"/>
      `;
    } else if (item.id === "binh-sen") {
      art = `
        <path d="M22 28 L34 28 L36 44 L20 44 Z" fill="#F2EFE9" stroke="#A69F92" stroke-width="1.4" stroke-linejoin="round"/>
        <line x1="28" y1="28" x2="28" y2="18" stroke="#2E6A44" stroke-width="2.2"/>
        <ellipse cx="21" cy="23" rx="6" ry="3" transform="rotate(-20 21 23)" fill="#3D8453"/>
        <ellipse cx="28" cy="15" rx="4.5" ry="7" fill="#E88CA5" stroke="#B85672" stroke-width="1.1"/>
        <ellipse cx="23.5" cy="17" rx="3.2" ry="5.2" transform="rotate(-24 23.5 17)" fill="#F3B0C2"/>
        <ellipse cx="32.5" cy="17" rx="3.2" ry="5.2" transform="rotate(24 32.5 17)" fill="#F3B0C2"/>
      `;
    } else if (item.id === "bonsai-mini") {
      art = `
        <polygon points="16,36 40,36 37,45 19,45" fill="#3B6E5C" stroke="#23473A" stroke-width="1.4"/>
        <path d="M28 36 Q23 28 29 21" fill="none" stroke="#5C3A21" stroke-width="3.6" stroke-linecap="round"/>
        <ellipse cx="31" cy="19" rx="11" ry="6.5" fill="#2F6F44"/>
        <ellipse cx="21" cy="25" rx="8.5" ry="5" fill="#3D8453"/>
      `;
    } else if (item.id === "dia-hat-dua") {
      art = `
        <ellipse cx="28" cy="33" rx="18" ry="10" fill="#B83B2A" stroke="#742015" stroke-width="1.6"/>
        <ellipse cx="28" cy="32" rx="13" ry="6.8" fill="#9E2E1F"/>
        <circle cx="24" cy="31" r="2.6" fill="#F3D27A"/><circle cx="31" cy="30" r="2.6" fill="#F3D27A"/>
        <circle cx="28" cy="34.5" r="2.6" fill="#F3D27A"/><circle cx="21" cy="34" r="2.2" fill="#FCE9B5"/>
        <circle cx="34" cy="34" r="2.2" fill="#FCE9B5"/>
      `;
    } else if (item.id === "den-dau") {
      art = `
        <polygon points="19,36 37,36 40,45 16,45" fill="#B87D32" stroke="#784E18" stroke-width="1.4"/>
        <path d="M23 16 L33 16 L35 36 L21 36 Z" fill="#FFF7DF" stroke="#B7A886" stroke-width="1.3"/>
        <path d="M28 22 C24 27, 25 32, 28 32 C31 32, 32 27, 28 22 Z" fill="#FF9F1C"/>
        <circle cx="28" cy="29" r="2" fill="#FFF3B0"/>
      `;
    } else {
      art = `
        <line x1="18" y1="22" x2="36" y2="11" stroke="#7A7A7A" stroke-width="2" stroke-linecap="round"/>
        <rect x="11" y="21" width="34" height="23" rx="4" fill="#6B3E23" stroke="#3F2210" stroke-width="1.5"/>
        <rect x="15" y="25" width="17" height="15" rx="2" fill="#E6D2A8"/>
        <line x1="17" y1="29" x2="30" y2="29" stroke="#8C6B43" stroke-width="1.2"/>
        <line x1="17" y1="33" x2="30" y2="33" stroke="#8C6B43" stroke-width="1.2"/>
        <line x1="17" y1="37" x2="30" y2="37" stroke="#8C6B43" stroke-width="1.2"/>
        <circle cx="38.5" cy="29" r="3.6" fill="#D9A441" stroke="#4A2D12" stroke-width="1.1"/>
        <circle cx="38.5" cy="37.5" r="2.4" fill="#C89B54"/>
      `;
    }
    return `
      <span class="sample-thumb" aria-hidden="true">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <rect x="1" y="1" width="54" height="54" rx="12" fill="#FBF5E8" stroke="#D5C4AA" stroke-width="1.4"/>
          ${art}
        </svg>
      </span>
    `;
  }

  function renderTitleFrameSampleSvg(frame) {
    const col = frame.color || "#3A2A20";
    return `
      <span class="sample-thumb" aria-hidden="true">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <rect x="1" y="1" width="54" height="54" rx="12" fill="#FBF5E8" stroke="#D5C4AA" stroke-width="1.4"/>
          <rect x="7" y="16" width="42" height="24" rx="10" fill="${col}" stroke="#E6B44C" stroke-width="2"/>
          <circle cx="17" cy="28" r="5" fill="#F7D674"/>
          <line x1="26" y1="25.5" x2="43" y2="25.5" stroke="#FFFDF7" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="26" y1="31" x2="38" y2="31" stroke="#FFE6A8" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </span>
    `;
  }

  function renderProfile() {
    const pron = getUserPronoun();
    const hon = getUserHonorific();
    const age = getUserAge();
    const baseName = state.user.baseName || state.user.name.replace(/^(Anh|Chị|Bác|Cô|Bà|Chú)\s+/i, "");

    const activeOutfitId = (profilePreviewDraft && profilePreviewDraft.outfitId) || state.user.outfitId;
    const activeAccId = (profilePreviewDraft && profilePreviewDraft.accessoryId) || state.user.accessoryId || "glasses";
    const activeItemId = (profilePreviewDraft && profilePreviewDraft.itemId) || state.user.itemId;
    const activeFrameId = (profilePreviewDraft && profilePreviewDraft.titleFrameId) || state.user.titleFrameId || "tri-am";

    const activeOutfit = getOutfit(activeOutfitId);
    const activeAcc = D.ACCESSORIES.find((a) => a.id === activeAccId) || D.ACCESSORIES[0];
    const activeItem = getTableItem(activeItemId);
    const activeFrame = getTitleFrame(activeFrameId);
    const isPreviewingDraft =
      activeOutfitId !== state.user.outfitId ||
      activeAccId !== (state.user.accessoryId || "glasses") ||
      activeItemId !== state.user.itemId ||
      activeFrameId !== (state.user.titleFrameId || "tri-am");

    els.main.innerHTML = `
      <h1>Hồ sơ & Đồ bày bàn trà</h1>
      <p class="lead-copy">Dùng Xu kiếm được từ Điểm danh, Cờ tướng và Ngâm thơ để chọn áo mới, vật phẩm bàn trà và khung danh hiệu 3D (không bán xu bằng tiền).</p>

      <!-- Khung 3D / 2.5D xem trực tiếp sự thay đổi trang phục, phụ kiện, đồ bày bàn trà và khung danh hiệu -->
      <div class="surface-panel warm" id="profile-live-card">
        <div class="tearoom-controls-row">
          <span class="stage-badge" id="profile-render-badge">${isPreviewingDraft ? "Đang xem thử mẫu" : "Mẫu đang dùng"}</span>
          <button type="button" class="stage-badge-btn" id="btn-profile-toggle-render">Đổi 3D / 2.5D</button>
        </div>

        <div class="tearoom-stage profile-showcase-stage" id="profile-preview-stage">
          <canvas class="tearoom-canvas" id="profile-preview-canvas"></canvas>
          <div class="avatar-tags-layer" id="profile-preview-tags"></div>
        </div>

        <div class="profile-equipped-strip">
          <span>Áo: <strong>${escHtml(activeOutfit.name)}</strong></span>
          <span>Phụ kiện: <strong>${escHtml(activeAcc.name)}</strong></span>
          <span>Khung 3D: <strong>${escHtml(activeFrame.name)}</strong></span>
          <span>Trên bàn: <strong>${escHtml(activeItem.name)}</strong></span>
        </div>

        ${
          isPreviewingDraft
            ? `<button type="button" class="btn-secondary" id="btn-reset-preview">Quay về bộ đang trang bị thật</button>`
            : ""
        }
      </div>

      <!-- Thông tin Xưng hô Anh/Chị + Tên + Tuổi + Tỉnh thành -->
      <div class="surface-panel">
        <h3>Thông tin xưng hô & độ tuổi</h3>
        <div class="honorific-toggle-row" role="group" aria-label="Chọn cách xưng hô">
          <button type="button" class="honorific-btn ${hon === "Anh" ? "selected" : ""}" data-prof-hon="Anh">Xưng là Anh</button>
          <button type="button" class="honorific-btn ${hon === "Chị" ? "selected" : ""}" data-prof-hon="Chị">Xưng là Chị</button>
        </div>
        <div class="setup-inline-fields">
          <label class="field-label" style="flex:1.2;">
            Tên gọi hiển thị
            <input type="text" class="input-lg" id="prof-name-in" value="${escHtml(baseName)}" />
          </label>
          <div class="field-label" style="flex:1;">
            Tuổi của ${pron}
            <div class="age-stepper">
              <button type="button" class="age-step-btn" id="prof-age-minus" aria-label="Giảm 1 tuổi">−</button>
              <input type="number" class="input-lg num" id="prof-age-in" min="45" max="105" value="${age}" />
              <button type="button" class="age-step-btn" id="prof-age-plus" aria-label="Tăng 1 tuổi">+</button>
            </div>
          </div>
        </div>
        <label class="field-label">
          Quê quán (${D.PROVINCES.length} tỉnh thành & xa quê)
          <select class="select-lg" id="prof-prov-in">
            ${D.PROVINCES.map((p) => `<option value="${p.id}" ${p.id === state.user.provinceId ? "selected" : ""}>${escHtml(p.name)}</option>`).join("")}
          </select>
        </label>
        <button type="button" class="btn-primary" id="btn-save-name">Lưu xưng hô & tuổi</button>
      </div>

      <!-- 1. Mẫu Trang phục nhân vật -->
      <div class="surface-panel">
        <h3>1. Trang phục nhân vật (chạm để xem trên hình mẫu)</h3>
        <div class="catalog-stack">
          ${D.OUTFITS.map((o) => {
            const owned = state.user.unlockedOutfits.includes(o.id);
            const equipped = state.user.outfitId === o.id;
            const previewing = activeOutfitId === o.id && !equipped;
            return `
              <div class="catalog-sample-card ${equipped ? "is-equipped" : previewing ? "is-previewing" : ""}">
                <div class="catalog-sample-top">
                  ${renderOutfitSampleSvg(o)}
                  <div class="catalog-sample-info">
                    <strong>${escHtml(o.name)}</strong>
                    <small>${escHtml(o.desc || "")}</small>
                  </div>
                </div>
                <div class="catalog-sample-actions">
                  ${
                    !owned
                      ? `<button type="button" class="btn-mini preview-outfit-btn" data-id="${o.id}">${previewing ? "Đang xem thử" : "Xem thử"}</button>`
                      : ""
                  }
                  <button type="button" class="btn-mini equip-outfit-btn ${equipped ? "active-equip" : ""}" data-id="${o.id}">
                    ${equipped ? "Đang mặc" : owned ? "Chọn mặc" : `Đổi (${o.cost} Xu)`}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- 2. Mẫu Phụ kiện nhân vật 3D -->
      <div class="surface-panel">
        <h3>2. Phụ kiện nhân vật (hiển thị trực tiếp trên đầu / mặt)</h3>
        <div class="catalog-stack">
          ${D.ACCESSORIES.map((acc) => {
            const unlockedList = state.user.unlockedAccessories || ["none", "glasses"];
            const owned = unlockedList.includes(acc.id);
            const equipped = (state.user.accessoryId || "glasses") === acc.id;
            const previewing = activeAccId === acc.id && !equipped;
            return `
              <div class="catalog-sample-card ${equipped ? "is-equipped" : previewing ? "is-previewing" : ""}">
                <div class="catalog-sample-top">
                  ${renderAccessorySampleSvg(acc)}
                  <div class="catalog-sample-info">
                    <strong>${escHtml(acc.name)}</strong>
                    <small>${escHtml(acc.desc || "")}</small>
                  </div>
                </div>
                <div class="catalog-sample-actions">
                  ${
                    !owned
                      ? `<button type="button" class="btn-mini preview-acc-btn" data-id="${acc.id}">${previewing ? "Đang xem thử" : "Xem thử"}</button>`
                      : ""
                  }
                  <button type="button" class="btn-mini equip-acc-btn ${equipped ? "active-equip" : ""}" data-id="${acc.id}">
                    ${equipped ? "Đang đeo" : owned ? "Chọn đeo" : `Đổi (${acc.cost} Xu)`}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- 3. Mẫu Đồ bày bàn trà trước mặt -->
      <div class="surface-panel">
        <h3>3. Đồ bày bàn trà trước mặt (xoay trên mặt bàn mẫu)</h3>
        <div class="catalog-stack">
          ${D.TABLE_ITEMS.map((it) => {
            const owned = state.user.unlockedItems.includes(it.id);
            const equipped = state.user.itemId === it.id;
            const previewing = activeItemId === it.id && !equipped;
            return `
              <div class="catalog-sample-card ${equipped ? "is-equipped" : previewing ? "is-previewing" : ""}">
                <div class="catalog-sample-top">
                  ${renderTableItemSampleSvg(it)}
                  <div class="catalog-sample-info">
                    <strong>${escHtml(it.name)}</strong>
                    <small>${escHtml(it.desc || "")}</small>
                  </div>
                </div>
                <div class="catalog-sample-actions">
                  ${
                    !owned
                      ? `<button type="button" class="btn-mini preview-item-btn" data-id="${it.id}">${previewing ? "Đang xem thử" : "Xem thử"}</button>`
                      : ""
                  }
                  <button type="button" class="btn-mini equip-item-btn ${equipped ? "active-equip" : ""}" data-id="${it.id}">
                    ${equipped ? "Đang bày" : owned ? "Đặt lên bàn" : `Đổi (${it.cost} Xu)`}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- 4. Khung danh hiệu gắn lên nhân vật 3D -->
      <div class="surface-panel">
        <h3>4. Khung danh hiệu gắn lên nhân vật 3D (Huy hiệu áo &amp; Thẻ tên)</h3>
        <div class="catalog-stack">
          ${D.TITLE_FRAMES.map((fr) => {
            const unlockedFrames = state.user.unlockedTitleFrames || ["none", "tri-am"];
            const owned = unlockedFrames.includes(fr.id);
            const equipped = (state.user.titleFrameId || "tri-am") === fr.id;
            const previewing = activeFrameId === fr.id && !equipped;
            return `
              <div class="catalog-sample-card ${equipped ? "is-equipped" : previewing ? "is-previewing" : ""}">
                <div class="catalog-sample-top">
                  ${renderTitleFrameSampleSvg(fr)}
                  <div class="catalog-sample-info">
                    <strong>${escHtml(fr.name)}</strong>
                    <small>${escHtml(fr.desc || "")}</small>
                  </div>
                </div>
                <div class="catalog-sample-actions">
                  ${
                    !owned
                      ? `<button type="button" class="btn-mini preview-frame-btn" data-id="${fr.id}">${previewing ? "Đang xem thử" : "Xem thử"}</button>`
                      : ""
                  }
                  <button type="button" class="btn-mini equip-frame-btn ${equipped ? "active-equip" : ""}" data-id="${fr.id}">
                    ${equipped ? "Đang gắn" : owned ? "Gắn lên 3D" : `Đổi (${fr.cost} Xu)`}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="surface-panel">
        <button type="button" class="btn-secondary" id="btn-profile-open-privacy">${ico("shield")}<span>Xem Chỉ số sinh hoạt &amp; Quyền riêng tư dữ liệu</span></button>
      </div>
    `;

    // Mount live 3D / 2.5D showcase
    const stageEl = document.getElementById("profile-preview-stage");
    const canvasEl = document.getElementById("profile-preview-canvas");
    const tagsEl = document.getElementById("profile-preview-tags");
    if (stageEl && canvasEl && tagsEl) {
      window.TeaRoomScene.mount(
        stageEl,
        canvasEl,
        tagsEl,
        {
          viewMode: "profile",
          preferredMode: state.settings.preferredRender,
          roomTheme: getCurrentRoom().theme,
          userName: state.user.name,
          userAge: age,
          userGender: hon === "Chị" ? "female" : "male",
          userOutfitColor: activeOutfit.color,
          userAccessory: activeAcc.id,
          userTitleFrame: activeFrame.id,
          userItem: activeItem.id,
          itemLabel: activeItem.name,
          itemColor: activeItem.color
        },
        () => {
          state.settings.autoFallbacked = true;
          state.settings.preferredRender = "2.5d";
          saveState();
          updateGlobalChrome();
        }
      );
    }

    document.getElementById("btn-profile-toggle-render").addEventListener("click", () => {
      state.settings.autoFallbacked = false;
      state.settings.preferredRender = state.settings.preferredRender === "3d" ? "2.5d" : "3d";
      saveState();
      updateGlobalChrome();
      renderProfile();
    });

    const resetPrevBtn = document.getElementById("btn-reset-preview");
    if (resetPrevBtn) {
      resetPrevBtn.addEventListener("click", () => {
        profilePreviewDraft = null;
        renderProfile();
      });
    }

    let profHon = hon;
    els.main.querySelectorAll("[data-prof-hon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        profHon = btn.dataset.profHon === "Chị" ? "Chị" : "Anh";
        els.main.querySelectorAll("[data-prof-hon]").forEach((b) => b.classList.toggle("selected", b === btn));
      });
    });

    const profAgeIn = document.getElementById("prof-age-in");
    document.getElementById("prof-age-minus").addEventListener("click", () => {
      profAgeIn.value = String(Math.max(45, (Number(profAgeIn.value) || 65) - 1));
    });
    document.getElementById("prof-age-plus").addEventListener("click", () => {
      profAgeIn.value = String(Math.min(105, (Number(profAgeIn.value) || 65) + 1));
    });

    document.getElementById("btn-save-name").addEventListener("click", () => {
      const val = document.getElementById("prof-name-in").value.trim();
      const ageVal = document.getElementById("prof-age-in").value;
      const provVal = document.getElementById("prof-prov-in").value;
      applyUserIdentity(profHon, val, ageVal, provVal);
      showToast(`Đã lưu hồ sơ: ${state.user.name} · ${state.user.age} tuổi.`);
      renderProfile();
    });

    const scrollShowcaseIntoView = () => {
      const card = document.getElementById("profile-live-card");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    els.main.querySelectorAll(".preview-outfit-btn").forEach((b) => {
      b.addEventListener("click", () => {
        profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { outfitId: b.dataset.id });
        renderProfile();
        scrollShowcaseIntoView();
      });
    });
    els.main.querySelectorAll(".preview-acc-btn").forEach((b) => {
      b.addEventListener("click", () => {
        profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { accessoryId: b.dataset.id });
        renderProfile();
        scrollShowcaseIntoView();
      });
    });
    els.main.querySelectorAll(".preview-item-btn").forEach((b) => {
      b.addEventListener("click", () => {
        profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { itemId: b.dataset.id });
        renderProfile();
        scrollShowcaseIntoView();
      });
    });
    els.main.querySelectorAll(".preview-frame-btn").forEach((b) => {
      b.addEventListener("click", () => {
        profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { titleFrameId: b.dataset.id });
        renderProfile();
        scrollShowcaseIntoView();
      });
    });

    els.main.querySelectorAll(".equip-outfit-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const o = getOutfit(b.dataset.id);
        if (!state.user.unlockedOutfits.includes(o.id)) {
          if (state.user.xu < o.cost) {
            profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { outfitId: o.id });
            showToast(`Chưa đủ ${o.cost} Xu — đã bật Xem thử "${o.name}" trên nhân vật cho ${pron} ngắm trước!`);
            renderProfile();
            scrollShowcaseIntoView();
            return;
          }
          state.user.xu -= o.cost;
          state.user.unlockedOutfits.push(o.id);
        }
        state.user.outfitId = o.id;
        if (profilePreviewDraft) delete profilePreviewDraft.outfitId;
        saveState();
        updateGlobalChrome();
        showToast(`Đã mặc: ${o.name}`);
        renderProfile();
        scrollShowcaseIntoView();
      });
    });

    els.main.querySelectorAll(".equip-acc-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const acc = D.ACCESSORIES.find((a) => a.id === b.dataset.id) || D.ACCESSORIES[0];
        if (!Array.isArray(state.user.unlockedAccessories)) {
          state.user.unlockedAccessories = ["none", "glasses"];
        }
        if (!state.user.unlockedAccessories.includes(acc.id)) {
          if (state.user.xu < acc.cost) {
            profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { accessoryId: acc.id });
            showToast(`Chưa đủ ${acc.cost} Xu — đã bật Xem thử "${acc.name}" trên nhân vật!`);
            renderProfile();
            scrollShowcaseIntoView();
            return;
          }
          state.user.xu -= acc.cost;
          state.user.unlockedAccessories.push(acc.id);
        }
        state.user.accessoryId = acc.id;
        if (profilePreviewDraft) delete profilePreviewDraft.accessoryId;
        saveState();
        updateGlobalChrome();
        showToast(`Đã trang bị: ${acc.name}`);
        renderProfile();
        scrollShowcaseIntoView();
      });
    });

    els.main.querySelectorAll(".equip-item-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const it = getTableItem(b.dataset.id);
        if (!state.user.unlockedItems.includes(it.id)) {
          if (state.user.xu < it.cost) {
            profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { itemId: it.id });
            showToast(`Chưa đủ ${it.cost} Xu — đã đặt thử "${it.name}" lên bàn mẫu để ${pron} xem!`);
            renderProfile();
            scrollShowcaseIntoView();
            return;
          }
          state.user.xu -= it.cost;
          state.user.unlockedItems.push(it.id);
        }
        state.user.itemId = it.id;
        if (profilePreviewDraft) delete profilePreviewDraft.itemId;
        saveState();
        updateGlobalChrome();
        showToast(`Đã bày lên bàn trà: ${it.name}`);
        renderProfile();
        scrollShowcaseIntoView();
      });
    });

    els.main.querySelectorAll(".equip-frame-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const fr = getTitleFrame(b.dataset.id);
        if (!Array.isArray(state.user.unlockedTitleFrames)) {
          state.user.unlockedTitleFrames = ["none", "tri-am"];
        }
        if (!state.user.unlockedTitleFrames.includes(fr.id)) {
          if (state.user.xu < fr.cost) {
            profilePreviewDraft = Object.assign({}, profilePreviewDraft || {}, { titleFrameId: fr.id });
            showToast(`Chưa đủ ${fr.cost} Xu — đã gắn thử khung "${fr.name}" lên nhân vật 3D!`);
            renderProfile();
            scrollShowcaseIntoView();
            return;
          }
          state.user.xu -= fr.cost;
          state.user.unlockedTitleFrames.push(fr.id);
        }
        state.user.titleFrameId = fr.id;
        if (profilePreviewDraft) delete profilePreviewDraft.titleFrameId;
        saveState();
        updateGlobalChrome();
        showToast(`Đã gắn khung danh hiệu 3D: ${fr.name}`);
        renderProfile();
        scrollShowcaseIntoView();
      });
    });

    document.getElementById("btn-profile-open-privacy").addEventListener("click", () => navigate("privacy"));
  }

  // ==================== MODULE 10: HEALTH ASSISTANT & FAMILY VIEW ====================
  function renderHealth() {
    const h = state.health;
    const disclaimer =
      "Đây là thông tin tham khảo từ trợ lý tự động, không phải bác sĩ và không thay thế việc khám bệnh. Không tự ý dùng hoặc bỏ thuốc.";

    els.main.innerHTML = `
      <h1>Trợ lý sức khỏe</h1>
      <div class="surface-panel warm">
        <p style="font-size:0.86rem; font-weight:700;">${disclaimer}</p>
      </div>

      ${
        h.emergencyMode
          ? `
        <div class="surface-panel danger">
          <h2>Phát hiện dấu hiệu nguy hiểm!</h2>
          <p style="font-weight:700;">Trò chuyện đã tạm dừng. Nếu bác đang đau ngực, khó thở, méo miệng hoặc tê yếu tay chân, hãy gọi cấp cứu ngay:</p>
          <a class="btn-danger" href="tel:115" style="text-decoration:none;">${ico("phone")}<span>GỌI CẤP CỨU 115 NGAY</span></a>
          <a class="btn-primary" href="tel:0900000000" style="text-decoration:none;">${ico("family")}<span>GỌI ANH HÙNG (CON TRAI)</span></a>
          <button type="button" class="btn-secondary" id="btn-clear-emergency">Tôi chỉ đang thử nghiệm — Quay lại bình thường</button>
        </div>
      `
          : `
        <div class="surface-panel">
          <h3>Nhắc uống thuốc & Đo huyết áp hôm nay</h3>
          <button type="button" class="btn-${h.medMorning ? "jade" : "primary"}" id="btn-toggle-med">
            ${ico("check")}
            <span>${h.medMorning ? "Đã uống thuốc sáng theo đơn bác sĩ" : "Đánh dấu: Đã uống thuốc sáng nay"}</span>
          </button>
          <div style="font-size:0.88rem;">
            ${h.bpReadings.map((r) => `<div>• ${escHtml(r)}</div>`).join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Hỏi Trợ lý sức khỏe (Nội dung bác sĩ đã duyệt)</h3>
          ${D.HEALTH_QA.map((qa, i) => `<button type="button" class="btn-secondary health-qa-btn" data-idx="${i}">${escHtml(qa.topic)}</button>`).join("")}
          <div class="surface-panel jade">
            <p>${escHtml(h.lastAnswer)}</p>
            <small style="font-weight:600;">${disclaimer}</small>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Kiểm thử cảnh báo dấu hiệu nguy hiểm</h3>
          <input type="text" class="input-lg" id="health-symptom-in" placeholder="Nhập thử: 'tôi bị đau ngực khó thở'..." />
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-check-symptom">Kiểm tra triệu chứng</button>
            <button type="button" class="btn-danger" id="btn-test-redflag">Thử tình huống khẩn cấp 115</button>
          </div>
        </div>
      `
      }
    `;

    const medBtn = document.getElementById("btn-toggle-med");
    if (medBtn) {
      medBtn.addEventListener("click", () => {
        state.health.medMorning = !state.health.medMorning;
        saveState();
        renderHealth();
      });
    }

    els.main.querySelectorAll(".health-qa-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const qa = D.HEALTH_QA[Number(b.dataset.idx)];
        state.health.lastAnswer = qa.answer;
        saveState();
        renderHealth();
      });
    });

    const checkBtn = document.getElementById("btn-check-symptom");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const txt = document.getElementById("health-symptom-in").value.toLowerCase();
        if (D.RED_FLAG_WORDS.some((w) => txt.includes(w))) {
          state.health.emergencyMode = true;
          saveState();
          renderHealth();
        } else {
          state.health.lastAnswer = "Bác nhớ ghi lại các biểu hiện vào sổ và mang theo khi tái khám định kỳ. Nếu thấy khó chịu nhiều, hãy gọi bác sĩ hoặc 115.";
          saveState();
          renderHealth();
        }
      });
    }

    const redBtn = document.getElementById("btn-test-redflag");
    if (redBtn) {
      redBtn.addEventListener("click", () => {
        state.health.emergencyMode = true;
        saveState();
        renderHealth();
      });
    }

    const clearBtn = document.getElementById("btn-clear-emergency");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.health.emergencyMode = false;
        saveState();
        renderHealth();
      });
    }
  }

  function renderFamilyView() {
    const prov = getProvince(state.user.provinceId);
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const baseShare = getPublicBaseUrl();
    const shareLink = `${baseShare}?tinh=${encodeURIComponent(state.user.provinceId)}&phong=phong-tra`;
    const qrImg = makeStandaloneQrDataUrl(shareLink, `Mở quán trà cho ${state.user.name}`);
    const familyPost = `Con gửi bố/mẹ đường dẫn vào Quán Trà Tuổi Bạc (chữ to, có đọc báo sáng và bàn trà đồng hương ${prov.short}). Bố/mẹ chỉ cần chạm vào đường dẫn dưới đây là vào thẳng, không cần tạo tài khoản hay nhớ mật khẩu:\n${shareLink}`;

    els.main.innerHTML = `
      <h1>Góc Con Cái (30–50 tuổi)</h1>
      <p class="lead-copy">Màn hình mô phỏng góc nhìn của con cái đi làm xa: theo dõi nhẹ nhàng, không làm bố mẹ có cảm giác bị giám sát.</p>

      <div class="surface-panel jade">
        <h3>Trạng thái của ${escHtml(state.user.name)} · ${getUserAge()} tuổi (${escHtml(prov.short)})</h3>
        <p style="font-weight:700;">${state.user.checkedInToday ? `Sáng nay đã điểm danh: ${escHtml(state.user.mood)}` : "Sáng nay chưa điểm danh — nhắc nhẹ (không báo động)"}</p>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; text-align:center;">
          ${days
            .map(
              (d, i) => `
            <div style="padding:8px 4px; border-radius:10px; background:${state.user.daysHistory[i] ? "var(--accent-jade)" : "#FFFDF7"}; color:${state.user.daysHistory[i] ? "#FFF" : "var(--ink-primary)"}; border:1px solid var(--border-subtle); font-size:0.88rem; font-weight:700;">
              <div>${d}</div>
              <div>${state.user.daysHistory[i] ? "Có" : "—"}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="surface-panel">
        <h3>Mã QR & Tin nhắn gửi sẵn cho bố mẹ</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Đưa mã QR này cho bố mẹ quét bằng Zalo hoặc sao chép tin nhắn mẫu bên dưới gửi qua Zalo / Messenger:</p>
        <img src="${qrImg}" alt="Mã QR vào quán trà cho bố mẹ" style="width:100%; max-width:280px; margin:0 auto; display:block; border-radius:12px; border:1px solid #D5C4AA;" />
        ${renderSocialShareKitHtml({
          prefix: "family-share",
          copyLinkBtnId: "btn-copy-family-link",
          shareUrl: shareLink,
          postText: familyPost
        })}
      </div>
    `;

    bindSocialShareKit({
      prefix: "family-share",
      copyLinkBtnId: "btn-copy-family-link",
      shareUrl: shareLink,
      postText: familyPost
    });
  }

  // ==================== MODULE 11: ANALYTICS METRICS & DECREE 13/2023/NĐ-CP PRIVACY CENTER ====================
  let activePrivacySubTab = "ai-logs";

  function renderHourlyHistogramHtml(hourly24) {
    const arr = Array.isArray(hourly24) && hourly24.length === 24 ? hourly24 : new Array(24).fill(0);
    // Group into 12 clear 2-hour bins (00h, 02h, ..., 22h) so 390px mobile renders crisp bars with zero crowding
    const bins = [];
    let maxBin = 1;
    let peakBinIdx = 3;
    for (let b = 0; b < 12; b++) {
      const sum = (arr[b * 2] || 0) + (arr[b * 2 + 1] || 0);
      bins.push({ label: `${String(b * 2).padStart(2, "0")}h`, val: sum });
      if (sum > maxBin) {
        maxBin = sum;
        peakBinIdx = b;
      }
    }
    return `
      <div class="hourly-hist-wrap">
        <small style="font-size:0.88rem; color:var(--ink-secondary); font-weight:600;">Biểu đồ nhịp giờ hoạt động 24h (đỏ = khung giờ cao điểm):</small>
        <div class="hourly-hist-bars">
          ${bins
            .map((bin, idx) => {
              const pct = Math.max(8, Math.round((bin.val / maxBin) * 100));
              return `
                <div class="hourly-bar-col" title="${bin.label}: ${bin.val} sự kiện">
                  <div class="hourly-bar-fill ${idx === peakBinIdx && bin.val > 0 ? "peak" : ""}" style="height:${pct}%"></div>
                  <span class="hourly-bar-lbl">${idx % 2 === 0 ? bin.label : ""}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderPrivacyAndMetrics() {
    const a = state.analytics || {};
    const quickCount = a.tea_msg_quick_0token || 0;
    const voiceTextCount = a.tea_msg_voice_or_text || 0;
    const totalMsgs = quickCount + voiceTextCount;
    const zeroTokenPct = totalMsgs > 0 ? Math.round((quickCount / totalMsgs) * 100) : 100;
    const st = RT ? RT.getStatus() : { connected: false, providerName: "Cục bộ", totalOtherPeers: 0, clientId: "local" };
    const hotEvents = TEL ? TEL.getHotEvents() : [];
    const totalIdbEvents = TEL ? TEL.getTotalStoredEstimate() : hotEvents.length;
    const deepProfiles = TEL ? TEL.getMemberDeepProfiles() : [];

    els.main.innerHTML = `
      <h1>Kho AI Tracking 100% &amp; Quyền Riêng Tư</h1>
      <p class="lead-copy">Ghi nhận 100% nhịp sinh hoạt, khung giờ mở máy, thời lượng từng màn hình, phương thức trò chuyện và chủ đề quan tâm vào kho IndexedDB không giới hạn dung lượng để phục vụ phân tích AI lâu dài.</p>

      <div class="xq-top-switch" role="tablist" aria-label="Chọn Kho AI Tracking hoặc Quyền Riêng Tư">
        <button type="button" class="xq-top-btn ${activePrivacySubTab === "ai-logs" ? "active" : ""}" id="btn-priv-tab-ai">Kho AI Tracking 100% (${totalIdbEvents} log)</button>
        <button type="button" class="xq-top-btn ${activePrivacySubTab === "privacy" ? "active" : ""}" id="btn-priv-tab-gdpr">Chỉ Số 0-Token &amp; Quyền Riêng Tư</button>
      </div>

      ${
        activePrivacySubTab === "ai-logs"
          ? `
        <div class="surface-panel jade">
          <div class="passcard-head">
            <strong>Kho Lưu Trữ 4 Lớp Bền Vững (Tracking 100%)</strong>
            <span class="online-status-pill"><span class="online-dot-live"></span>Đang ghi 100%</span>
          </div>
          <p style="font-size:0.88rem;">1. <strong>IndexedDB Không Giới Hạn</strong> (<code>tuoibac_telemetry_db_v1</code>: <strong class="num">${totalIdbEvents}</strong> bản ghi) · 2. Bộ nhớ nóng (<code>${escHtml(STORAGE_KEY)}</code>) · 3. Bản sao dự phòng (<code>_vault_bak</code>) · 4. Đám mây (${escHtml(st.providerName)}).</p>
          <div class="temple-ritual-grid">
            <button type="button" class="btn-primary" id="btn-export-ai-jsonl">${ico("download")}<span>Xuất Chuẩn AI (.jsonl)</span></button>
            <button type="button" class="btn-jade" id="btn-export-ai-logs-json">${ico("download")}<span>Xuất Kho Đầy Đủ (.json)</span></button>
            <button type="button" class="btn-secondary" id="btn-export-ai-logs-csv"><span>Xuất Bảng Excel (.csv)</span></button>
            <button type="button" class="btn-secondary" id="btn-flush-dwell-now"><span>Chốt Thời Lượng Hiện Tại</span></button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Hồ Sơ Thói Quen Giờ Giấc &amp; Chat Chit Toàn Thành Viên (${deepProfiles.length} hồ sơ)</h3>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${deepProfiles
              .map((p) => {
                const cs = p.chatSummary;
                return `
              <div class="ai-persona-card">
                <div class="passcard-head">
                  <strong>${escHtml(p.userName)} · ${p.age}t (${escHtml(p.province)})</strong>
                  <span class="cohort-pill ${p.seniorityLevel >= 17 ? "veteran" : p.seniorityLevel >= 6 ? "trusted" : "newcomer"}">${escHtml(p.memberCode)} · ${p.totalEvents} sự kiện</span>
                </div>
                <small style="font-size:0.88rem; color:#6B4208; font-weight:700;">${escHtml(p.seniorityTitle)} · Giờ hoạt động mạnh nhất: ${String(p.peakHour).padStart(2, "0")}h00 (${escHtml(p.peakTimeBucketLabel)})</small>
                ${renderHourlyHistogramHtml(p.hourlyHist)}
                <div style="font-size:0.88rem;"><strong>Thời lượng gắn bó theo màn hình:</strong> ${escHtml(p.topDwellSummary)}</div>
                <div class="chat-method-grid">
                  <div class="chat-method-chip"><span>Câu nhanh 0-Token</span><strong>${cs.byMethod.quick_0token}</strong></div>
                  <div class="chat-method-chip"><span>Sticker 1 chạm</span><strong>${cs.byMethod.sticker_1tap}</strong></div>
                  <div class="chat-method-chip"><span>Gõ phím chữ</span><strong>${cs.byMethod.typed_text}</strong></div>
                  <div class="chat-method-chip"><span>Giọng nói Micro</span><strong>${cs.byMethod.voice_speech}</strong></div>
                </div>
                <div style="font-size:0.88rem;">
                  <strong>Thói quen chat:</strong> Tổng <span class="num">${cs.totalMessages}</span> câu (TB <span class="num">${cs.avgWords}</span> từ/câu · Ưu tiên: ${escHtml(cs.dominantMethodLabel)})${
                  cs.topCompanions.length > 0 ? ` · Hay trò chuyện cùng: ${escHtml(cs.topCompanions.join(", "))}` : ""
                }${p.searchQueries.length > 0 ? ` · Từ khóa tìm báo: "${escHtml(p.searchQueries.join(", "))}"` : ""}
                </div>
                <div style="font-size:0.88rem; color:var(--accent-jade); font-weight:700;">Hành động gợi ý từ dữ liệu: ${escHtml(p.aiActionableInsight)}</div>
              </div>
            `;
              })
              .join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Dòng Sự Kiện Telemetry Chi Tiết Thời Gian Thực (${hotEvents.length} bản ghi gần nhất)</h3>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${hotEvents
              .slice(0, 20)
              .map((ev) => {
                const d = new Date(ev.ts || Date.now());
                const hms = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
                const m = ev.meta || {};
                const methodBadge = m.inputMethod ? ` · Kiểu: ${m.inputMethod} (${m.wordCount || 0} từ)` : "";
                return `
                  <div class="member-log-item">
                    <div style="display:flex; justify-content:space-between; gap:8px; font-weight:700;">
                      <span>[${hms}] ${escHtml(ev.userName)} (${escHtml(ev.memberCode)})</span>
                      <span style="color:var(--accent-terracotta);">${escHtml(ev.module)}/${escHtml(ev.subAction)}</span>
                    </div>
                    <span>Lưu màn hình: ${ev.dwellSec || 0}s${escHtml(methodBadge)} · ${escHtml(m.detail || m.text || m.query || m.wishText || JSON.stringify(m).slice(0, 90))}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `
          : `

      <div class="surface-panel ${st.connected ? "jade" : "warm"}">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <strong>Máy chủ Thời gian thực: ${st.connected ? "Đang trực tuyến" : "Đang nối..."}</strong>
          <span class="badge-tag num">${escHtml(st.providerName)}</span>
        </div>
        <p style="font-size:0.88rem;">Số điện thoại thật khác đang mở cùng lúc: <strong class="num">${st.totalOtherPeers}</strong> thiết bị.</p>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-open-rt-modal">${ico("wifi")}<span>Cấu hình Realtime / Supabase</span></button>
          <button type="button" class="btn-secondary" id="btn-privacy-pwa">${ico("download")}<span>Đặt ra màn hình chính</span></button>
        </div>
      </div>

      <div class="surface-panel">
        <h3>Bảng đo 7 chỉ số sản phẩm &amp; Tiết kiệm Token</h3>
        <div class="metrics-stat-list">
          <div class="metrics-stat-row">
            <span>Tỷ lệ dùng nút gợi ý nhanh (0 tốn Token AI)</span>
            <strong class="num" style="color:var(--accent-jade);">${zeroTokenPct}% (${quickCount}/${totalMsgs} câu)</strong>
          </div>
          <div class="metrics-stat-row">
            <span>Cụm từ tự học trong Sổ từ điển (<code>phonetic_dictionary</code>)</span>
            <strong class="num">${state.phoneticDict.length} cặp từ</strong>
          </div>
          <div class="metrics-stat-row">
            <span>1. Phiên mở ứng dụng (<code>session_start</code>)</span>
            <strong class="num">${a.session_start || 1} lần</strong>
          </div>
          <div class="metrics-stat-row">
            <span>2. Lượt Điểm danh bình an (<code>morning_checkin</code>)</span>
            <strong class="num">${a.morning_checkin_done || 0} lần · Chuỗi ${state.user.streakDays} ngày</strong>
          </div>
          <div class="metrics-stat-row">
            <span>3. Lượt vào Bàn trà &amp; Đàm đạo báo sáng</span>
            <strong class="num">${a.tea_table_joined || 0} bàn · Đọc ${a.news_article_read || 0} tin</strong>
          </div>
          <div class="metrics-stat-row">
            <span>4. Trợ lý tự gợi chuyện sau 60 giây im lặng</span>
            <strong class="num">${a.idle_prompts_triggered || 0} lần rót trà gợi chuyện</strong>
          </div>
          <div class="metrics-stat-row">
            <span>5. Nước đi Ván treo &amp; Bài thơ mới đăng</span>
            <strong class="num">${a.async_game_move || 0} nước · ${a.poem_posted || 0} bài thơ</strong>
          </div>
          <div class="metrics-stat-row">
            <span>6. Lượt tạo đường dẫn &amp; mã QR mời bạn</span>
            <strong class="num">${a.share_link_created || 0} lượt chia sẻ</strong>
          </div>
        </div>
      </div>

      <div class="surface-panel">
        <h3>Quyền riêng tư dữ liệu (Nghị định 13/2023/NĐ-CP)</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Quán Trà Tuổi Bạc không thu thập danh bạ, không ghi âm ngầm (micro chỉ bật khi chính tay bấm nút), và không dùng dữ liệu sức khỏe để quảng cáo thuốc.</p>

        <div class="consent-toggle-card">
          <strong>1. Báo tin Điểm danh sáng cho con cái</strong>
          <small style="color:var(--ink-secondary);">Chỉ gửi trạng thái khỏe khoắn / bình thường, không theo dõi vị trí GPS.</small>
          <button type="button" class="btn-${state.privacy.consentFamilyCheckin ? "jade" : "secondary"}" id="btn-toggle-consent-family">
            ${state.privacy.consentFamilyCheckin ? "Đang bật: Cho phép báo tin bình an" : "Đang tắt: Chỉ lưu trên máy riêng"}
          </button>
        </div>

        <div class="consent-toggle-card">
          <strong>2. Hiện tên &amp; nhân vật 3D cho người thật cùng bàn</strong>
          <small style="color:var(--ink-secondary);">Giúp bạn đồng niên nhìn thấy nhau trong bàn trà thời gian thực.</small>
          <button type="button" class="btn-${state.privacy.consentRealtimePresence ? "jade" : "secondary"}" id="btn-toggle-consent-rt">
            ${state.privacy.consentRealtimePresence ? "Đang bật: Tham gia bàn trà trực tuyến" : "Đang tắt: Ẩn hiện diện trực tuyến"}
          </button>
        </div>

        <div class="consent-toggle-card">
          <strong>3. Tự học sửa lỗi phát âm tiếng Việt trên máy</strong>
          <small style="color:var(--ink-secondary);">Lưu cặp từ sửa sai vào sổ từ điển để lần sau không tốn phí xử lý.</small>
          <button type="button" class="btn-${state.privacy.consentVoiceDict ? "jade" : "secondary"}" id="btn-toggle-consent-dict">
            ${state.privacy.consentVoiceDict ? "Đang bật: Tự học từ điển" : "Đang tắt: Không lưu từ mới"}
          </button>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-export-personal-json">${ico("download")}<span>Tải dữ liệu cá nhân (.json)</span></button>
          <button type="button" class="btn-danger" id="btn-wipe-personal-data">Xóa toàn bộ dữ liệu</button>
        </div>
      </div>
      `
      }
    `;

    document.getElementById("btn-priv-tab-ai").addEventListener("click", () => {
      activePrivacySubTab = "ai-logs";
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-priv-tab-gdpr").addEventListener("click", () => {
      activePrivacySubTab = "privacy";
      renderPrivacyAndMetrics();
    });

    const triggerDownloadBlob = (blob, filename, msg) => {
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement("a");
      aTag.href = url;
      aTag.download = filename;
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
      setTimeout(() => URL.revokeObjectURL(url), 1200);
      showToast(msg);
    };

    const expJsonl = document.getElementById("btn-export-ai-jsonl");
    if (expJsonl && TEL) {
      expJsonl.addEventListener("click", async () => {
        const jsonlStr = await TEL.buildExportJsonlString();
        triggerDownloadBlob(
          new Blob([jsonlStr], { type: "application/x-ndjson;charset=utf-8" }),
          "tuoibac-ai-telemetry-100pct.jsonl",
          "Đã xuất tệp chuẩn huấn luyện & phân tích AI (.jsonl)!"
        );
      });
    }

    const expAiJson = document.getElementById("btn-export-ai-logs-json");
    if (expAiJson && TEL) {
      expAiJson.addEventListener("click", async () => {
        const fullObj = await TEL.buildExportFullJsonObject();
        triggerDownloadBlob(
          new Blob([JSON.stringify(fullObj, null, 2)], { type: "application/json;charset=utf-8" }),
          "kho-ai-telemetry-toan-thanh-vien.json",
          "Đã xuất toàn bộ Kho AI Telemetry & Ma trận thói quen (.json)!"
        );
      });
    }

    const expAiCsv = document.getElementById("btn-export-ai-logs-csv");
    if (expAiCsv && TEL) {
      expAiCsv.addEventListener("click", async () => {
        const csvStr = await TEL.buildExportCsvString();
        triggerDownloadBlob(
          new Blob([csvStr], { type: "text/csv;charset=utf-8" }),
          "bang-telemetry-thanh-vien-tuoi-bac.csv",
          "Đã xuất bảng CSV toàn bộ sự kiện Telemetry!"
        );
      });
    }

    const flushBtn = document.getElementById("btn-flush-dwell-now");
    if (flushBtn && TEL) {
      flushBtn.addEventListener("click", () => {
        TEL.flushDwellHeartbeat(buildTelemetryUserCtx());
        showToast("Đã chốt thời lượng lưu màn hình hiện tại vào kho AI Tracking!");
        renderPrivacyAndMetrics();
      });
    }

    if (activePrivacySubTab !== "privacy") return;

    document.getElementById("btn-open-rt-modal").addEventListener("click", openRealtimeStatusModal);
    document.getElementById("btn-privacy-pwa").addEventListener("click", openPwaInstallGuide);

    document.getElementById("btn-toggle-consent-family").addEventListener("click", () => {
      state.privacy.consentFamilyCheckin = !state.privacy.consentFamilyCheckin;
      saveState();
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-toggle-consent-rt").addEventListener("click", () => {
      state.privacy.consentRealtimePresence = !state.privacy.consentRealtimePresence;
      if (!state.privacy.consentRealtimePresence && RT) {
        RT.leaveTableChannel();
      }
      saveState();
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-toggle-consent-dict").addEventListener("click", () => {
      state.privacy.consentVoiceDict = !state.privacy.consentVoiceDict;
      saveState();
      renderPrivacyAndMetrics();
    });

    document.getElementById("btn-export-personal-json").addEventListener("click", () => {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: state.user,
        privacy: state.privacy,
        analytics: state.analytics,
        phoneticDictCount: state.phoneticDict.length
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement("a");
      aTag.href = url;
      aTag.download = "du-lieu-ca-nhan-tuoi-bac.json";
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Đã tải bản sao dữ liệu cá nhân (.json) về máy.");
    });

    document.getElementById("btn-wipe-personal-data").addEventListener("click", () => {
      openDialog(
        "Xác nhận xóa sạch dữ liệu cá nhân",
        `
        <div class="surface-panel danger">
          <p style="font-weight:700;">Thao tác này sẽ xóa toàn bộ hồ sơ xưng hô, lịch sử điểm danh, từ điển tự học trên trình duyệt này và gỡ hiện diện trên phòng chung.</p>
        </div>
        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-confirm-wipe-now">Đồng ý xóa vĩnh viễn</button>
          <button type="button" class="btn-secondary" id="btn-cancel-wipe">Hủy bỏ</button>
        </div>
        `
      );
      document.getElementById("btn-cancel-wipe").addEventListener("click", closeDialog);
      document.getElementById("btn-confirm-wipe-now").addEventListener("click", () => {
        if (RT) RT.wipeMyCloudData();
        if (TEL && typeof TEL.wipeLocalTelemetry === "function") TEL.wipeLocalTelemetry();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VAULT_BACKUP_KEY);
        state = createDefaultState();
        pendingQueue = [];
        closeDialog();
        showToast("Đã xóa toàn bộ dữ liệu cá nhân về trạng thái trắng ban đầu.");
        navigate("home");
      });
    });
  }

  // ==================== MODULE 11: HỘI ĐỒNG NGŨ, CLB, KẾT BẠN, HIỆN ONLINE & THẺ HỘI VIÊN 10 GIÂY ====================
  let activeGroupCatFilter = "all";

  function normalizePhoneDigits(rawPhone) {
    let digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.startsWith("84") && digits.length >= 10) {
      digits = "0" + digits.slice(2);
    }
    return digits;
  }

  function maskPhoneDigits(digits) {
    const d = normalizePhoneDigits(digits);
    if (d.length < 7) return d;
    return `${d.slice(0, 3)}***${d.slice(-3)}`;
  }

  function fnv32Hex(str, seed) {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function computeAccountHashSync(phoneDigits, pin4) {
    const payload = `tuoibac_senior_card_v1|${phoneDigits}|${pin4}`;
    return (
      fnv32Hex(payload + "|a", 0x811c9dc5) +
      fnv32Hex(payload + "|b", 0x9e3779b9) +
      fnv32Hex(payload + "|c", 0x243f6a88) +
      fnv32Hex(payload + "|d", 0xb7e15162)
    );
  }

  function deriveMemberCodeFromPhone(phoneDigits) {
    let h = 2166136261 >>> 0;
    const s = `tb_code|${phoneDigits}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const num = 1000 + (h % 8999);
    return `TB-${num}`;
  }

  function encodeRecoveryToken(obj) {
    try {
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    } catch (e) {
      return "";
    }
  }

  function decodeRecoveryToken(tok) {
    try {
      let b64 = String(tok || "").trim().replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function buildAccountBackupSnapshot() {
    return {
      accountHash: state.auth.accountHash,
      memberCode: state.auth.memberCode,
      phoneMasked: state.auth.phoneMasked,
      primaryUnitLabel: state.auth.primaryUnitLabel || "",
      honorific: state.user.honorific,
      baseName: state.user.baseName,
      name: state.user.name,
      age: getUserAge(),
      provinceId: state.user.provinceId,
      outfitId: state.user.outfitId,
      accessoryId: state.user.accessoryId,
      itemId: state.user.itemId,
      titleFrameId: state.user.titleFrameId,
      unlockedTitleFrames: (state.user.unlockedTitleFrames || []).slice(),
      xu: state.user.xu,
      seniorityPoints: state.user.seniorityPoints || 28,
      skillPoints: Object.assign({}, state.user.skillPoints || {}),
      memberLogs: (state.memberLogs || []).slice(0, 35),
      joinedGroupIds: (state.social.joinedGroupIds || []).slice(),
      friends: (state.social.friends || []).slice()
    };
  }

  function syncMyCloudAccountBackup() {
    if (!RT || !state.auth || !state.auth.isRegistered || !state.auth.accountHash) return;
    RT.publishAccountBackup(state.auth.accountHash, buildAccountBackupSnapshot());
    RT.setMyMemberCode(state.auth.memberCode);
    RT.publishMemberDirectory({
      memberCode: state.auth.memberCode,
      name: state.user.name,
      age: getUserAge(),
      province: getProvince(state.user.provinceId).short,
      provinceId: state.user.provinceId,
      outfitColor: getOutfit(state.user.outfitId).color,
      hat: state.user.accessoryId || "glasses",
      unitLabel: state.auth.primaryUnitLabel || "Hội viên Tuổi Bạc",
      isRealPeer: true
    });
  }

  function applyCloudAccountSnapshot(snap) {
    if (!snap) return;
    if (snap.honorific) state.user.honorific = snap.honorific;
    if (snap.baseName) state.user.baseName = snap.baseName;
    if (snap.name) state.user.name = snap.name;
    if (snap.age) state.user.age = snap.age;
    if (snap.provinceId) state.user.provinceId = snap.provinceId;
    if (snap.outfitId) state.user.outfitId = snap.outfitId;
    if (snap.accessoryId) state.user.accessoryId = snap.accessoryId;
    if (snap.itemId) state.user.itemId = snap.itemId;
    if (snap.titleFrameId) state.user.titleFrameId = snap.titleFrameId;
    if (Array.isArray(snap.unlockedTitleFrames)) {
      state.user.unlockedTitleFrames = Array.from(new Set(state.user.unlockedTitleFrames.concat(snap.unlockedTitleFrames)));
    }
    if (typeof snap.xu === "number" && snap.xu > state.user.xu) {
      state.user.xu = snap.xu;
    }
    if (typeof snap.seniorityPoints === "number" && snap.seniorityPoints > (state.user.seniorityPoints || 0)) {
      state.user.seniorityPoints = snap.seniorityPoints;
    }
    if (snap.skillPoints && typeof snap.skillPoints === "object") {
      if (!state.user.skillPoints) state.user.skillPoints = {};
      Object.keys(snap.skillPoints).forEach((sk) => {
        state.user.skillPoints[sk] = Math.max(Number(state.user.skillPoints[sk]) || 0, Number(snap.skillPoints[sk]) || 0);
      });
    }
    if (Array.isArray(snap.memberLogs)) {
      const existingIds = new Set((state.memberLogs || []).map((x) => x.id));
      snap.memberLogs.forEach((ml) => {
        if (ml && ml.id && !existingIds.has(ml.id)) {
          state.memberLogs.push(ml);
        }
      });
    }
    if (snap.primaryUnitLabel) {
      state.auth.primaryUnitLabel = snap.primaryUnitLabel;
    }
    if (Array.isArray(snap.joinedGroupIds)) {
      state.social.joinedGroupIds = Array.from(new Set((state.social.joinedGroupIds || []).concat(snap.joinedGroupIds)));
    }
    if (Array.isArray(snap.friends)) {
      snap.friends.forEach((f) => {
        if (!isAlreadyFriend(f)) {
          state.social.friends.unshift(f);
        }
      });
    }
    state.user.profileConfigured = true;
    saveState();
    updateGlobalChrome();
  }

  function restoreFromQrRecoveryToken(rawTok) {
    const decoded = decodeRecoveryToken(rawTok);
    if (!decoded || !decoded.h || !decoded.c) return;
    state.auth.isRegistered = true;
    state.auth.accountHash = decoded.h;
    state.auth.memberCode = decoded.c;
    state.auth.phoneMasked = decoded.m || "";
    state.auth.recoveryToken = rawTok;
    if (decoded.n) {
      const hon = decoded.hon === "Chị" ? "Chị" : "Anh";
      applyUserIdentity(hon, decoded.n, decoded.a || 65, decoded.p || state.user.provinceId);
    }
    saveState();
    setTimeout(() => {
      if (RT) {
        RT.setMyMemberCode(decoded.c);
        RT.fetchAccountBackup(decoded.h, (cloudSnap) => {
          if (cloudSnap) {
            applyCloudAccountSnapshot(cloudSnap);
            showToast(`Đã đăng nhập từ Thẻ QR: khôi phục ${state.auth.memberCode}!`);
            render();
          } else {
            showToast(`Đã mở Thẻ Hội Viên ${state.auth.memberCode} từ mã QR!`);
            render();
          }
          syncMyGlobalOnlinePresence();
        });
      }
    }, 600);
  }

  function computeCurrentActivityWhere() {
    if (state.route === "tearoom") {
      const room = getCurrentRoom();
      if (state.teaRoom.subView === "table") {
        const tbl = getCurrentTable();
        const suffix = tbl.name.includes(room.shortName) ? "" : ` (${room.shortName})`;
        return `Đang ngồi ${tbl.name}${suffix}`;
      }
      return `Đang ở sảnh ${room.name}`;
    }
    if (state.route === "xiangqi") {
      return state.xiangqi.mode === "puzzle" ? "Đang giải Cờ Thế cổ phổ" : "Đang đánh Cờ Tướng 9×10";
    }
    if (state.route === "groups") {
      const g = getGroupById(state.social.selectedGroupId);
      if (state.social.subView === "detail" && g) {
        return `Đang xem ${g.shortName || g.name}`;
      }
      return "Đang ở Hội Đồng Ngũ & Kết Bạn";
    }
    if (state.route === "newspaper") return "Đang đọc Tờ Báo Sáng";
    if (state.route === "checkin") return "Vừa Điểm danh bình an";
    if (state.route === "poetry") return "Đang ngâm thơ Lục Bát";
    if (state.route === "zen") return `Đang ngồi Bồ Đoàn BĐ${(state.zen.userCushionIdx || 0) + 1} Chánh Điện 3D`;
    if (state.route === "leaderboard") return "Đang xem Cây 96 Danh Hiệu";
    return "Đang ở Sảnh Quán Trà";
  }

  function syncMyGlobalOnlinePresence() {
    if (!RT) return;
    if (!state.privacy || !state.privacy.consentRealtimePresence) {
      RT.clearGlobalOnline();
      return;
    }
    if (state.auth && state.auth.isRegistered && state.auth.memberCode) {
      RT.setMyMemberCode(state.auth.memberCode);
    }
    const room = getCurrentRoom();
    RT.publishGlobalOnline({
      memberCode: state.auth && state.auth.isRegistered ? state.auth.memberCode : "",
      name: state.user.name,
      age: getUserAge(),
      gender: state.user.honorific === "Chị" ? "female" : "male",
      provinceId: state.user.provinceId,
      province: getProvince(state.user.provinceId).short,
      outfitColor: getOutfit(state.user.outfitId).color,
      hat: state.user.accessoryId || "glasses",
      titleFrameId: state.user.titleFrameId || "tri-am",
      seniorityLevel: getSeniorityProgress().current.level || 0,
      cushionIdx: state.zen.userCushionIdx || 2,
      unitLabel: (state.auth && state.auth.primaryUnitLabel) || "",
      where: computeCurrentActivityWhere(),
      roomId: state.route === "tearoom" ? room.id : "",
      tableIdx: state.route === "tearoom" && state.teaRoom.subView === "table" ? state.teaRoom.tableIdx : 0,
      isRealPeer: true
    });
  }

  function getAllMergedGroups() {
    const byId = {};
    (state.social.groups || []).forEach((g) => {
      byId[g.id] = g;
    });
    if (RT && typeof RT.getSharedGroups === "function") {
      RT.getSharedGroups().forEach((cg) => {
        if (!cg || !cg.id) return;
        if (!byId[cg.id]) {
          byId[cg.id] = cg;
          state.social.groups.push(cg);
        } else {
          // Merge realMembers & bulletins cleanly
          const local = byId[cg.id];
          if (Array.isArray(cg.realMembers)) {
            const seen = new Set((local.realMembers || []).map((m) => m.memberCode || m.name));
            local.realMembers = (local.realMembers || []).slice();
            cg.realMembers.forEach((rm) => {
              const k = rm.memberCode || rm.name;
              if (k && !seen.has(k)) {
                seen.add(k);
                local.realMembers.unshift(rm);
              }
            });
          }
          if (Array.isArray(cg.bulletins)) {
            const seenB = new Set((local.bulletins || []).map((b) => `${b.author}|${b.text}`));
            local.bulletins = (local.bulletins || []).slice();
            cg.bulletins.forEach((b) => {
              const kb = `${b.author}|${b.text}`;
              if (!seenB.has(kb)) {
                seenB.add(kb);
                local.bulletins.unshift(b);
              }
            });
          }
        }
      });
    }
    return Object.values(byId);
  }

  function getGroupById(gid) {
    const list = getAllMergedGroups();
    return list.find((g) => g.id === gid) || list[0] || null;
  }

  function isAlreadyFriend(candidate) {
    if (!candidate) return false;
    const list = state.social.friends || [];
    return list.some(
      (f) =>
        (candidate.memberCode && f.memberCode && f.memberCode.toUpperCase() === candidate.memberCode.toUpperCase()) ||
        (candidate.id && f.id && f.id === candidate.id) ||
        (candidate.clientId && f.clientId && f.clientId === candidate.clientId)
    );
  }

  function resolvePeerLiveOnlineInfo(friendOrMember) {
    const code = (friendOrMember.memberCode || "").toUpperCase();
    if (
      state.auth &&
      state.auth.isRegistered &&
      code &&
      state.auth.memberCode.toUpperCase() === code
    ) {
      return {
        online: Boolean(state.privacy && state.privacy.consentRealtimePresence),
        isRealPeer: true,
        where: computeCurrentActivityWhere(),
        roomId: state.route === "tearoom" ? getCurrentRoom().id : "",
        tableIdx: state.teaRoom.tableIdx || 0
      };
    }
    const livePeers = RT ? RT.getOnlinePeers() : [];
    const matchedLive = livePeers.find(
      (p) =>
        (code && p.memberCode && p.memberCode.toUpperCase() === code) ||
        (friendOrMember.clientId && p.clientId === friendOrMember.clientId) ||
        (friendOrMember.isRealPeer && p.name === friendOrMember.name)
    );
    if (matchedLive) {
      return {
        online: true,
        isRealPeer: true,
        where: matchedLive.where || "Đang trực tuyến trên điện thoại thật",
        roomId: matchedLive.roomId || "",
        tableIdx: matchedLive.tableIdx || 0
      };
    }
    // Check directory fallback for simulated senior companions
    const dir = (D.SENIOR_DIRECTORY || []).find(
      (s) => s.id === friendOrMember.id || (code && s.memberCode === code)
    );
    if (dir) {
      return {
        online: Boolean(dir.onlineNow),
        isRealPeer: false,
        where: dir.onlineWhere || "Vừa điểm danh sáng nay",
        roomId: dir.onlineRoomId || "phong-tra",
        tableIdx: dir.onlineTableIdx || 0
      };
    }
    return {
      online: false,
      isRealPeer: Boolean(friendOrMember.isRealPeer),
      where: "Chưa mở máy lúc này",
      roomId: "",
      tableIdx: 0
    };
  }

  function countOnlineFriendsNow() {
    const liveRealCount = RT ? RT.getOnlinePeers().length : 0;
    const friendOnlineCount = (state.social.friends || []).filter((f) => resolvePeerLiveOnlineInfo(f).online).length;
    return Math.max(liveRealCount, friendOnlineCount);
  }

  function requireMemberCard(reasonText, onReadyCallback) {
    if (state.auth && state.auth.isRegistered && state.auth.memberCode) {
      if (typeof onReadyCallback === "function") onReadyCallback();
      return;
    }
    openMemberAuthModal({
      reason: reasonText,
      onSuccess: onReadyCallback
    });
  }

  function drawMemberPasscardPng() {
    const c = document.createElement("canvas");
    c.width = 680;
    c.height = 420;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#F7F1E3";
    ctx.fillRect(0, 0, 680, 420);
    ctx.strokeStyle = "#3E5634";
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 648, 388);
    ctx.strokeStyle = "#C88A28";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 632, 372);

    ctx.fillStyle = "#3E5634";
    ctx.fillRect(32, 32, 616, 78);
    ctx.fillStyle = "#FFFDF7";
    ctx.font = "bold 25px sans-serif";
    ctx.fillText("THẺ HỘI VIÊN & ĐỒNG NGŨ TUỔI BẠC", 50, 74);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#E4EEDB";
    ctx.fillText("Quét mã QR trên thẻ này để đăng nhập lại khi đổi điện thoại", 50, 98);

    ctx.fillStyle = "#231A14";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(`${state.user.name} · ${getUserAge()} tuổi`, 48, 162);

    ctx.fillStyle = "#B83B2A";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`Mã Thẻ: ${state.auth.memberCode || "TB-0000"}`, 48, 200);

    const prov = getProvince(state.user.provinceId).short;
    const unitTxt = state.auth.primaryUnitLabel || "Hội viên Quán Trà Tuổi Bạc";
    ctx.fillStyle = "#4A3A2C";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Quê hương: ${prov}  ·  SĐT bảo mật: ${state.auth.phoneMasked || "Đã mã hóa"}`, 48, 240);
    ctx.font = "bold 19px sans-serif";
    ctx.fillStyle = "#3E5634";
    ctx.fillText(`Đơn vị / Hội: ${unitTxt.slice(0, 42)}`, 48, 278);

    ctx.fillStyle = "#6B5644";
    ctx.font = "17px sans-serif";
    ctx.fillText(`Đã kết nối ${state.social.friends.length} bạn tâm giao · Không cần nhớ mật khẩu`, 48, 324);
    const baseShare = getPublicBaseUrl();
    const shortHost = baseShare.replace(/^https?:\/\//, "").replace(/\/$/, "");
    ctx.fillText(`Mở trên điện thoại: ${shortHost}`, 48, 360);

    const qrUrl = `${baseShare}?khoiphuc=${encodeURIComponent(state.auth.recoveryToken || "")}`;
    if (window.TeaRoomScene && typeof window.TeaRoomScene.drawQrToCanvas === "function") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(500, 134, 136, 136);
      window.TeaRoomScene.drawQrToCanvas(ctx, qrUrl, 506, 140, 124);
      ctx.fillStyle = "#3E5634";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("QR KHÔI PHỤC 1 CHẠM", 492, 292);
    }
    return c.toDataURL("image/png");
  }

  function renderSeniorityLadderHtml() {
    const prog = getSeniorityProgress();
    const eras = PROG ? PROG.ERAS.slice(1) : [];
    const mainTiers = PROG ? PROG.MAIN_TIERS : [];
    return `
      <div class="surface-panel">
        <div class="passcard-head">
          <strong>6 Giai Đoạn · 32 Tầng Thâm Niên &amp; 64 Bậc Chuyên Môn</strong>
          <span class="cohort-pill ${escHtml(prog.cohort.cls)}">${prog.points} XP</span>
        </div>
        <div class="seniority-ladder">
          ${eras
            .map((era) => {
              const firstT = mainTiers.find((t) => t.era && t.era.id === era.id);
              const lastT = mainTiers.filter((t) => t.era && t.era.id === era.id).slice(-1)[0];
              const isMyEra = !prog.isGuest && prog.current && prog.current.eraName === era.eraName;
              return `
              <div class="seniority-tier-row ${isMyEra ? "current" : ""}">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                  <strong style="color:${escHtml(era.color)};">${escHtml(era.eraName)} (${escHtml(era.rangeLabel)})</strong>
                  <span class="badge-tag ${isMyEra ? "amber" : ""} num">${
                    isMyEra ? `Đang ở Tầng ${prog.current.level}` : `${firstT ? firstT.minXp : 33}–${lastT ? lastT.minXp : 23006} XP`
                  }</span>
                </div>
                <span style="color:var(--ink-secondary);">${escHtml(era.cohortRole)}</span>
              </div>
            `;
            })
            .join("")}
        </div>
        <button type="button" class="btn-secondary" id="btn-modal-open-full-96-tree">${ico("trophy")}<span>Xem Trọn Bộ 96 Danh Hiệu &amp; Công Thức Toán</span></button>
      </div>
    `;
  }

  function openMemberAuthModal(opts) {
    const options = opts || {};
    const isReg = Boolean(state.auth && state.auth.isRegistered && state.auth.memberCode);
    const baseName = state.user.baseName || state.user.name.replace(/^(Anh|Chị|Bác)\s+/i, "");

    if (isReg && !options.forceSwitchAccount) {
      const cardPng = drawMemberPasscardPng();
      const friendInviteUrl = `${getPublicBaseUrl()}?ketban=${encodeURIComponent(state.auth.memberCode)}`;
      const prog = getSeniorityProgress();
      openDialog(
        `Thẻ Hội Viên: ${state.auth.memberCode}`,
        `
        <div class="surface-panel jade">
          <div class="passcard-head">
            <strong>${escHtml(state.user.name)} · ${getUserAge()} tuổi</strong>
            <span class="member-code-chip">${escHtml(prog.current.shortBadge)} · ${escHtml(state.auth.memberCode)}</span>
          </div>
          <p style="font-size:0.88rem;">Đang ở <strong>${escHtml(prog.current.name)} (${prog.points} điểm)</strong> · SĐT mã hóa: <strong>${escHtml(state.auth.phoneMasked)}</strong>. Hồ sơ & lịch sử được sao lưu cẩn thận 3 lớp.</p>
        </div>

        <img src="${cardPng}" alt="Ảnh Thẻ Hội Viên QR Tuổi Bạc" style="width:100%; border-radius:12px; border:1px solid var(--border-strong);" />

        <div class="btn-row">
          <a class="btn-primary" href="${cardPng}" download="the-hoi-vien-${escHtml(state.auth.memberCode)}.png" style="text-decoration:none;">
            ${ico("download")}
            <span>Lưu Ảnh Thẻ vào máy</span>
          </a>
          <button type="button" class="btn-jade" id="btn-enable-passkey">
            <span>${state.auth.passkeyEnabled ? "Đã bật Vân tay / FaceID" : "Bật mở bằng Vân tay"}</span>
          </button>
        </div>

        ${renderSeniorityLadderHtml()}

        <div class="surface-panel">
          <strong>Gửi mã kết bạn cho đồng đội (${escHtml(state.auth.memberCode)})</strong>
          <div class="share-url-row">
            <input type="text" class="input-lg share-url-input" readonly value="${escHtml(friendInviteUrl)}" />
            <button type="button" class="btn-secondary btn-inline" id="btn-copy-my-friend-link">Chép link</button>
          </div>
        </div>

        <button type="button" class="btn-secondary" id="btn-switch-another-account">Đổi sang tài khoản khác / Đăng nhập lại</button>
        `
      );

      document.getElementById("btn-copy-my-friend-link").addEventListener("click", () => {
        copyTextSafe(friendInviteUrl, `Đã chép link kết bạn của mã ${state.auth.memberCode}!`);
      });
      const btnFullTree = document.getElementById("btn-modal-open-full-96-tree");
      if (btnFullTree) {
        btnFullTree.addEventListener("click", () => {
          closeDialog();
          activeLeaderTab = "Cay32";
          navigate("leaderboard");
        });
      }
      document.getElementById("btn-enable-passkey").addEventListener("click", async () => {
        if (window.PublicKeyCredential && navigator.credentials && typeof navigator.credentials.create === "function") {
          try {
            const challenge = new Uint8Array(16);
            window.crypto.getRandomValues(challenge);
            const userIdBytes = new TextEncoder().encode(state.auth.memberCode);
            await navigator.credentials.create({
              publicKey: {
                challenge,
                rp: { name: "Quán Trà Tuổi Bạc" },
                user: {
                  id: userIdBytes,
                  name: state.auth.memberCode,
                  displayName: `${state.user.name} (${state.auth.memberCode})`
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                timeout: 30000
              }
            });
            state.auth.passkeyEnabled = true;
            saveState();
            showToast("Đã liên kết Vân tay / Khuôn mặt trên điện thoại này!");
            openMemberAuthModal();
            return;
          } catch (err) {
            // Fall through to local quick-pin binding notice
          }
        }
        state.auth.passkeyEnabled = true;
        saveState();
        showToast("Đã bật ghi nhớ tự động trên thiết bị này!");
        openMemberAuthModal();
      });
      document.getElementById("btn-switch-another-account").addEventListener("click", () => {
        openMemberAuthModal({ forceSwitchAccount: true });
      });
      return;
    }

    openDialog(
      "Thẻ Hội Viên 10 Giây (Không Mật Khẩu Phức Tạp)",
      `
      ${
        options.reason
          ? `<div class="surface-panel warm">
               <strong>Cần mở Thẻ Hội Viên để: ${escHtml(options.reason)}</strong>
               <p style="font-size:0.88rem;">Chỉ điền 1 lần trong 10 giây. Nếu đã từng lập thẻ ở máy khác, nhập lại đúng SĐT + 4 số cũ để lấy lại toàn bộ đồng đội & bạn bè.</p>
             </div>`
          : `<div class="surface-panel jade">
               <strong>Vào mới hay Đăng nhập lại đều chung 1 bước siêu dễ</strong>
               <p style="font-size:0.88rem;">Không cần Email, không cần mật khẩu chữ hoa ký tự lạ. Số điện thoại được băm ẩn một chiều, người lạ không thể nhìn thấy.</p>
             </div>`
      }

      <div class="honorific-toggle-row" role="group" aria-label="Xưng hô trên thẻ">
        <button type="button" class="honorific-btn ${getUserHonorific() === "Anh" ? "selected" : ""}" data-auth-hon="Anh">Xưng là Anh</button>
        <button type="button" class="honorific-btn ${getUserHonorific() === "Chị" ? "selected" : ""}" data-auth-hon="Chị">Xưng là Chị</button>
      </div>

      <div class="btn-row">
        <label class="field-label">
          Tên thường gọi
          <input type="text" class="input-lg" id="auth-name-in" value="${escHtml(baseName)}" placeholder="VD: Nam, Minh..." />
        </label>
        <label class="field-label">
          Tuổi hiện tại
          <input type="number" class="input-lg num" id="auth-age-in" min="45" max="105" value="${getUserAge()}" />
        </label>
      </div>

      <label class="field-label">
        1. Số điện thoại của ${getUserPronoun()} (chỉ dùng làm chìa khóa tìm lại thẻ, tự động ẩn)
        <input type="tel" inputmode="numeric" class="input-lg num" id="auth-phone-in" placeholder="Ví dụ: 0912345678" autocomplete="tel" />
      </label>

      <label class="field-label">
        2. Mã nhớ 4 chữ số dễ thuộc (VD: năm sinh 1954 hoặc năm nhập ngũ 1975)
        <input type="tel" inputmode="numeric" maxlength="4" class="input-lg pin-4-input" id="auth-pin4-in" placeholder="1975" />
      </label>

      <button type="button" class="btn-primary" id="btn-submit-senior-auth">
        ${ico("card")}
        <span>Mở Thẻ Nhận +35 XP Lên Tầng 1 &amp; +15 Xu</span>
      </button>

      ${renderSeniorityLadderHtml()}

      <details class="surface-panel" style="padding:10px 12px;">
        <summary style="font-weight:700; cursor:pointer; min-height:44px; display:flex; align-items:center;">Cách 2: Khôi phục từ Mã QR Thẻ Hội Viên đã lưu</summary>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <p style="font-size:0.88rem; color:var(--ink-secondary);">Nếu có đường dẫn trên Ảnh Thẻ Hội Viên QR đã cất trong máy, dán vào ô dưới đây để vào lại ngay:</p>
          <input type="text" class="input-lg" id="auth-qr-token-in" placeholder="Dán link ?khoiphuc=... trên Thẻ QR" />
          <button type="button" class="btn-secondary" id="btn-restore-by-token">Khôi phục từ Thẻ QR</button>
        </div>
      </details>
      `
    );

    let chosenHon = getUserHonorific();
    els.dialogBody.querySelectorAll("[data-auth-hon]").forEach((b) => {
      b.addEventListener("click", () => {
        chosenHon = b.dataset.authHon === "Chị" ? "Chị" : "Anh";
        els.dialogBody.querySelectorAll("[data-auth-hon]").forEach((x) => x.classList.toggle("selected", x === b));
      });
    });

    const restoreBtn = document.getElementById("btn-restore-by-token");
    if (restoreBtn) {
      restoreBtn.addEventListener("click", () => {
        const raw = (document.getElementById("auth-qr-token-in").value || "").trim();
        const match = raw.match(/khoiphuc=([A-Za-z0-9_-]+)/);
        const tok = match ? match[1] : raw;
        if (!decodeRecoveryToken(tok)) {
          showToast("Mã khôi phục chưa đúng định dạng trên Thẻ QR.");
          return;
        }
        closeDialog();
        restoreFromQrRecoveryToken(tok);
        if (typeof options.onSuccess === "function") options.onSuccess();
      });
    }

    document.getElementById("btn-submit-senior-auth").addEventListener("click", () => {
      const nameVal = (document.getElementById("auth-name-in").value || "").trim() || baseName;
      const ageVal = Number(document.getElementById("auth-age-in").value) || getUserAge();
      const phoneDigits = normalizePhoneDigits(document.getElementById("auth-phone-in").value);
      const pin4 = String(document.getElementById("auth-pin4-in").value || "").replace(/\D/g, "");

      if (phoneDigits.length < 9 || phoneDigits.length > 11) {
        showToast("Vui lòng nhập đúng Số điện thoại (9–11 chữ số).");
        return;
      }
      if (pin4.length !== 4) {
        showToast("Vui lòng nhập đúng 4 chữ số dễ nhớ (ví dụ 1975).");
        return;
      }

      const submitBtn = document.getElementById("btn-submit-senior-auth");
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang kiểm tra & đồng bộ Thẻ...";

      const acctHash = computeAccountHashSync(phoneDigits, pin4);
      const memCode = deriveMemberCodeFromPhone(phoneDigits);
      const masked = maskPhoneDigits(phoneDigits);

      const finalizeActivation = (cloudSnap) => {
        state.auth.isRegistered = true;
        state.auth.accountHash = acctHash;
        state.auth.memberCode = (cloudSnap && cloudSnap.memberCode) || memCode;
        state.auth.phoneMasked = masked;

        if (cloudSnap) {
          // Existing account recovered on a second phone!
          applyCloudAccountSnapshot(cloudSnap);
          logMemberBehavior("account_recovered", "sinh-hoat", `Khôi phục Thẻ ${state.auth.memberCode} trên máy mới`);
        } else {
          applyUserIdentity(chosenHon, nameVal, ageVal, state.user.provinceId);
          state.user.xu += 15;
          awardSeniorityPoints(
            35,
            "member_card_created",
            "sinh-hoat",
            `Mở Thẻ Hội Viên ${memCode} — thăng Tầng 1 · Tân Khách Mộc Mạc`,
            { eventType: "auth_passcard", module: "auth", memberCode: memCode }
          );
        }

        state.auth.recoveryToken = encodeRecoveryToken({
          h: acctHash,
          c: state.auth.memberCode,
          m: masked,
          hon: state.user.honorific,
          n: state.user.baseName,
          a: getUserAge(),
          p: state.user.provinceId
        });

        saveState();
        syncMyCloudAccountBackup();
        syncMyGlobalOnlinePresence();
        updateGlobalChrome();
        closeDialog();

        if (cloudSnap) {
          showToast(`Chào mừng quay lại! Đã khôi phục Thẻ ${state.auth.memberCode}, bạn bè & đơn vị!`);
        } else {
          showToast(`Đã cấp Thẻ Hội Viên ${state.auth.memberCode}!`);
        }

        if (typeof options.onSuccess === "function") {
          options.onSuccess();
        } else {
          render();
        }
      };

      if (RT && typeof RT.fetchAccountBackup === "function") {
        RT.fetchAccountBackup(acctHash, (snap) => finalizeActivation(snap));
      } else {
        finalizeActivation(null);
      }
    });
  }

  function requestAddFriendWithAuth(targetPeer) {
    if (!targetPeer) return;
    requireMemberCard(`Kết bạn với ${targetPeer.name} và hiện đèn Online`, () => {
      const cleanCode =
        (targetPeer.memberCode && String(targetPeer.memberCode).toUpperCase()) ||
        (targetPeer.clientId ? `TB-${String(targetPeer.clientId).slice(-4).toUpperCase()}` : `TB-${Math.floor(1000 + Math.random() * 8999)}`);
      const friendEntry = {
        memberCode: cleanCode,
        id: targetPeer.id || "",
        clientId: targetPeer.clientId || "",
        name: targetPeer.name || `Hội viên ${cleanCode}`,
        age: targetPeer.age || 66,
        province: targetPeer.province || "Việt Nam",
        provinceId: targetPeer.provinceId || "ha-noi",
        outfitColor: targetPeer.outfitColor || "#3E5634",
        hat: targetPeer.hat || "cap",
        unitLabel: targetPeer.unitLabel || "",
        isRealPeer: Boolean(targetPeer.isRealPeer)
      };

      if (!isAlreadyFriend(friendEntry)) {
        state.social.friends.unshift(friendEntry);
        saveState();
        syncMyCloudAccountBackup();
      }

      if (RT && cleanCode) {
        RT.publishFriendSignal(cleanCode, {
          fromCode: state.auth.memberCode,
          fromName: state.user.name,
          fromAge: getUserAge(),
          fromProvince: getProvince(state.user.provinceId).short,
          fromProvinceId: state.user.provinceId,
          fromOutfitColor: getOutfit(state.user.outfitId).color,
          fromHat: state.user.accessoryId || "glasses",
          fromUnit: state.auth.primaryUnitLabel || ""
        });
      }

      addXu(2, `Kết bạn tâm giao cùng ${friendEntry.name}`);
      showToast(`Đã kết bạn với ${friendEntry.name} (${cleanCode})!`);
      if (state.route === "groups") renderGroupsAndFriends();
    });
  }

  function addFriendByCodeLookup(rawCode) {
    const cleanCode = String(rawCode || "").trim().toUpperCase();
    if (!cleanCode) {
      showToast("Vui lòng nhập Mã Thẻ Hội Viên (ví dụ TB-102 hoặc TB-4821).");
      return;
    }
    if (state.auth && state.auth.memberCode && cleanCode === state.auth.memberCode.toUpperCase()) {
      showToast("Đây là Mã Thẻ của chính bác rồi ạ!");
      return;
    }

    // Search live online peers -> directory cache -> built-in senior directory
    const livePeers = RT ? RT.getOnlinePeers() : [];
    const foundLive = livePeers.find((p) => p.memberCode && p.memberCode.toUpperCase() === cleanCode);
    const foundDirRt = RT ? RT.getMemberByCode(cleanCode) : null;
    const foundBuiltin = (D.SENIOR_DIRECTORY || []).find((s) => s.memberCode === cleanCode);
    const resolved = foundLive || foundDirRt || foundBuiltin || {
      memberCode: cleanCode,
      name: `Đồng đội (${cleanCode})`,
      age: 68,
      province: "Đang đồng bộ",
      provinceId: "ha-noi",
      outfitColor: "#3E5634",
      hat: "cap",
      isRealPeer: true
    };
    requestAddFriendWithAuth(resolved);
  }

  function joinGroupUnit(group) {
    if (!group) return;
    requireMemberCard(`Gia nhập "${group.shortName || group.name}" & điểm danh quân số`, () => {
      if (!state.social.joinedGroupIds.includes(group.id)) {
        state.social.joinedGroupIds.push(group.id);
      }
      state.auth.primaryUnitLabel = group.shortName || group.name;

      if (!Array.isArray(group.realMembers)) group.realMembers = [];
      const myCode = state.auth.memberCode;
      const existingIdx = group.realMembers.findIndex((m) => m.memberCode === myCode);
      const myMemberRecord = {
        memberCode: myCode,
        clientId: RT ? RT.getClientId() : "",
        name: state.user.name,
        age: getUserAge(),
        province: getProvince(state.user.provinceId).short,
        provinceId: state.user.provinceId,
        outfitColor: group.category === "veteran" ? "#556B45" : getOutfit(state.user.outfitId).color,
        hat: group.category === "veteran" ? "cap" : state.user.accessoryId || "glasses",
        unitLabel: group.shortName || group.name,
        isRealPeer: true
      };
      if (existingIdx >= 0) {
        group.realMembers[existingIdx] = myMemberRecord;
      } else {
        group.realMembers.unshift(myMemberRecord);
      }

      if (group.category === "veteran") {
        unlockTitleFrame("dong-ngu", `Đồng đội ${group.shortName || group.name}`);
      }

      saveState();
      if (RT) RT.publishGroup(group);
      syncMyCloudAccountBackup();
      syncMyGlobalOnlinePresence();
      showToast(`Đã ghi tên vào quân số ${group.shortName || group.name}!`);
      renderGroupsAndFriends();
    });
  }

  function enterGroupPrivateTeaRoom(group) {
    if (!group) return;
    const roomId = `hoi-${group.id}`;
    let targetRoom = (state.teaRoom.rooms || []).find((r) => r.id === roomId);
    const seedMembers = (group.memberIds || [])
      .map((sid) => (D.SENIOR_DIRECTORY || []).find((s) => s.id === sid))
      .filter(Boolean)
      .slice(0, 4);

    if (!targetRoom) {
      const isVet = group.category === "veteran";
      targetRoom = {
        id: roomId,
        name: group.name,
        shortName: group.shortName || group.name.slice(0, 20),
        description: group.subtitle || group.motto || `Phòng sinh hoạt riêng của ${group.name}`,
        hostName: isVet ? "Trực ban Đơn vị (Trợ lý)" : "Chị Trà (Trợ lý)",
        focusHabits: isVet ? ["cuu-chien-binh", "uong-tra", "co-tuong"] : ["uong-tra", "tho-ca"],
        theme: isVet
          ? { floorHex: 0xd4c7ad, wallHex: 0xf2ede0, floor2D: "#D8CCB2", wall2D: "#F2EDE0", tableHex: 0x6b4428, cushionHex: 0x3e5634, accentHex: "#3E5634" }
          : { floorHex: 0xd9bf9b, wallHex: 0xf4ead8, floor2D: "#DFC6A2", wall2D: "#F4EAD8", tableHex: 0x875434, cushionHex: 0x2e5e4e, accentHex: "#B83B2A" },
        tables: [
          {
            id: `${roomId}-ban-1`,
            shortLabel: "B1",
            name: `Bàn 1: Ban Liên Lạc (${group.shortName || group.name})`,
            topic: group.subtitle || "Điểm danh quân số & thăm hỏi sức khỏe",
            tags: ["cuu-chien-binh", "uong-tra"],
            members: seedMembers.length > 0 ? seedMembers : (D.SENIOR_DIRECTORY || []).slice(0, 3),
            initialLog: [
              {
                speaker: group.leaderName || "Ban Liên Lạc",
                text: group.motto || `Chào mừng anh chị em về ngôi nhà chung ${group.name}!`
              }
            ]
          },
          {
            id: `${roomId}-ban-2`,
            shortLabel: "B2",
            name: "Bàn 2: Ôn Kỷ Niệm Năm Xưa",
            topic: "Kể chuyện chiến trường, trường cũ & quê hương",
            tags: ["bao-cap", "uong-tra"],
            members: seedMembers.slice(0, 2),
            initialLog: [
              {
                speaker: "Trực ban Đơn vị (Trợ lý)",
                text: "Mời các anh chị pha ấm trà nóng, ôn lại kỷ niệm một thời sôi nổi nhé."
              }
            ]
          },
          {
            id: `${roomId}-ban-3`,
            shortLabel: "B3",
            name: "Bàn 3: Giao Lưu Cờ & Thơ Đồng Đội",
            topic: " Thư giãn buổi sáng cùng đồng đội",
            tags: ["co-tuong", "tho-ca"],
            members: seedMembers.slice(1, 4),
            initialLog: [
              {
                speaker: "Trực ban Đơn vị (Trợ lý)",
                text: "Bàn 3 sẵn sàng phục vụ trà nóng và các câu chuyện vui khỏe tuổi vàng."
              }
            ]
          }
        ]
      };
      state.teaRoom.rooms.unshift(targetRoom);
    }

    if (group.category === "veteran") {
      unlockTitleFrame("dong-ngu", `Đồng đội ${group.shortName || group.name}`);
    }
    state.teaRoom.roomId = roomId;
    state.teaRoom.tableIdx = 0;
    state.teaRoom.subView = "table";
    state.teaRoom.articleTable = null;
    state.teaRoom.activeNewspaperRef = null;
    state.teaRoom.log = targetRoom.tables[0].initialLog.slice();
    lastTableActivityAt = Date.now();
    saveState();
    navigate("tearoom");
    showToast(`Đã vào Bàn trà 3D riêng của ${group.shortName || group.name}!`);
  }

  function openCreateGroupModal() {
    requireMemberCard("Lập Đơn vị Đồng ngũ / Hội nhóm mới", () => {
      openDialog(
        "Lập Đơn Vị Đồng Ngũ / Hội Nhóm Mới",
        `
        <label class="field-label">
          Loại hình Hội nhóm
          <select class="select-lg" id="cg-cat-in">
            ${(D.GROUP_CATEGORIES || [])
              .map((c) => `<option value="${c.id}">${escHtml(c.label)}</option>`)
              .join("")}
          </select>
        </label>

        <div class="surface-panel warm" id="cg-veteran-box">
          <strong>Điền phiên hiệu Đơn vị (Gợi ý chuẩn Cựu chiến binh)</strong>
          <div class="btn-row">
            <label class="field-label">
              Đại đội / Phân đội
              <input type="text" class="input-lg" id="cg-comp-in" placeholder="VD: Đại đội 1K2" value="Đại đội 1K2" />
            </label>
            <label class="field-label">
              Tiểu đoàn / Trung đoàn
              <input type="text" class="input-lg" id="cg-bat-in" placeholder="VD: D3" value="Tiểu đoàn 3 (D3)" />
            </label>
          </div>
          <div class="btn-row">
            <label class="field-label">
              Sư đoàn / Quân khu
              <input type="text" class="input-lg" id="cg-div-in" placeholder="VD: Sư đoàn 25" value="Sư đoàn 25" />
            </label>
            <label class="field-label">
              Chiến trường &amp; Năm
              <input type="text" class="input-lg" id="cg-camp-in" placeholder="VD: Miền Nam 75" value="Chiến trường Miền Nam 75" />
            </label>
          </div>
        </div>

        <label class="field-label">
          Tên đầy đủ của Đơn vị / Hội nhóm
          <input type="text" class="input-lg" id="cg-name-in" value="Đại đội 1K2 · Tiểu đoàn 3 (D3) · Sư đoàn 25" />
        </label>

        <label class="field-label">
          Lời nhắn chào mừng / Khẩu hiệu phòng sinh hoạt
          <input type="text" class="input-lg" id="cg-motto-in" value="Anh em đồng ngũ điểm danh sức khỏe mỗi sáng, giữ trọn nghĩa tình đồng đội!" />
        </label>

        <button type="button" class="btn-primary" id="btn-confirm-create-group">
          ${ico("users")}
          <span>Tạo Đơn Vị &amp; Mở Bàn Trà Ngay</span>
        </button>
        `
      );

      const catSel = document.getElementById("cg-cat-in");
      const vetBox = document.getElementById("cg-veteran-box");
      const nameIn = document.getElementById("cg-name-in");
      const compIn = document.getElementById("cg-comp-in");
      const batIn = document.getElementById("cg-bat-in");
      const divIn = document.getElementById("cg-div-in");

      const syncVetName = () => {
        if (catSel.value !== "veteran") return;
        const parts = [compIn.value.trim(), batIn.value.trim(), divIn.value.trim()].filter(Boolean);
        if (parts.length > 0) nameIn.value = parts.join(" · ");
      };
      [compIn, batIn, divIn].forEach((el) => el.addEventListener("input", syncVetName));
      catSel.addEventListener("change", () => {
        const isVet = catSel.value === "veteran";
        vetBox.hidden = !isVet;
        if (!isVet && nameIn.value.includes("Đại đội")) {
          nameIn.value = catSel.value === "school" ? "Hội Bạn Học Khóa 1975" : catSel.value === "hometown" ? "Hội Đồng Hương Quê Nhà" : "CLB Cờ Tướng & Trà Sáng";
        }
      });

      document.getElementById("btn-confirm-create-group").addEventListener("click", () => {
        const cat = catSel.value;
        const fullName = nameIn.value.trim() || "Hội Đồng Niên Mới";
        const camp = (document.getElementById("cg-camp-in").value || "").trim();
        const motto = (document.getElementById("cg-motto-in").value || "").trim() || "Chúc toàn hội luôn mạnh khỏe, an vui!";
        const gid = "hoi-" + Math.random().toString(36).slice(2, 8);
        const newGrp = {
          id: gid,
          name: fullName,
          shortName: fullName.length > 26 ? fullName.slice(0, 25) + "…" : fullName,
          category: cat,
          unitSpec:
            cat === "veteran"
              ? {
                  company: compIn.value.trim(),
                  battalion: batIn.value.trim(),
                  division: divIn.value.trim(),
                  campaign: camp
                }
              : null,
          subtitle: cat === "veteran" && camp ? camp : `Trưởng ban liên lạc: ${state.user.name} (${getUserAge()} tuổi)`,
          motto,
          leaderName: `${state.user.name} · ${getUserAge()} tuổi (Trưởng ban liên lạc)`,
          joinPin: "",
          memberIds: ["minh", "vinh"],
          realMembers: [
            {
              memberCode: state.auth.memberCode,
              clientId: RT ? RT.getClientId() : "",
              name: state.user.name,
              age: getUserAge(),
              province: getProvince(state.user.provinceId).short,
              provinceId: state.user.provinceId,
              outfitColor: cat === "veteran" ? "#556B45" : getOutfit(state.user.outfitId).color,
              hat: cat === "veteran" ? "cap" : state.user.accessoryId || "glasses",
              unitLabel: fullName,
              isRealPeer: true
            }
          ],
          bulletins: [
            {
              author: `${state.user.name} (Ban liên lạc)`,
              time: "Vừa xong",
              text: motto
            }
          ]
        };

        state.social.groups.unshift(newGrp);
        if (!state.social.joinedGroupIds.includes(gid)) {
          state.social.joinedGroupIds.push(gid);
        }
        state.auth.primaryUnitLabel = newGrp.shortName;
        state.social.selectedGroupId = gid;
        state.social.subView = "detail";
        state.social.activeTab = "units";
        if (cat === "veteran") {
          unlockTitleFrame("dong-ngu", `Ban liên lạc ${newGrp.shortName}`);
        }
        awardSkillPoints("comrade_social", 8);
        awardSeniorityPoints(8, "group_created", "dong-ngu", `Thành lập đơn vị / hội "${newGrp.name}"`, {
          eventType: "social_group",
          module: "groups",
          groupId: gid,
          groupName: newGrp.name
        });
        saveState();
        if (RT) RT.publishGroup(newGrp);
        syncMyCloudAccountBackup();
        syncMyGlobalOnlinePresence();
        closeDialog();
        showToast(`Đã thành lập "${newGrp.name}" thành công!`);
        renderGroupsAndFriends();
      });
    });
  }

  function jumpToOnlineCompanion(onlineInfo, peerName) {
    if (onlineInfo && onlineInfo.roomId) {
      const foundRoom = (state.teaRoom.rooms || []).find((r) => r.id === onlineInfo.roomId);
      if (foundRoom) {
        state.teaRoom.roomId = foundRoom.id;
        state.teaRoom.tableIdx = Math.max(0, Math.min(foundRoom.tables.length - 1, onlineInfo.tableIdx || 0));
        state.teaRoom.subView = "table";
        state.teaRoom.log = foundRoom.tables[state.teaRoom.tableIdx].initialLog.slice();
        lastTableActivityAt = Date.now();
        saveState();
        navigate("tearoom");
        showToast(`Đã sang ngồi chung bàn với ${peerName}!`);
        return;
      }
      // Check if roomId matches a group id (like d25-d3-1k2-mn75)
      const grp = getGroupById(onlineInfo.roomId.replace(/^hoi-/, ""));
      if (grp) {
        enterGroupPrivateTeaRoom(grp);
        return;
      }
    }
    navigate("tearoom");
  }

  function renderGroupsAndFriends() {
    // Handle deep link ?ketban=TB-xxxx if queued
    if (state.social.pendingFriendCodeFromUrl) {
      const pendingCode = state.social.pendingFriendCodeFromUrl;
      delete state.social.pendingFriendCodeFromUrl;
      saveState();
      setTimeout(() => addFriendByCodeLookup(pendingCode), 150);
    }

    const tab = state.social.activeTab || "units";
    const allGroups = getAllMergedGroups();
    const onlineCount = countOnlineFriendsNow();
    const livePeers = RT ? RT.getOnlinePeers() : [];

    let bodyHtml = "";

    if (tab === "units") {
      if (state.social.subView === "detail") {
        const g = getGroupById(state.social.selectedGroupId);
        const isJoined = state.social.joinedGroupIds.includes(g.id);
        const builtinMembers = (g.memberIds || [])
          .map((sid) => (D.SENIOR_DIRECTORY || []).find((s) => s.id === sid))
          .filter(Boolean);
        const realMembers = Array.isArray(g.realMembers) ? g.realMembers : [];
        const combinedRoster = realMembers.concat(
          builtinMembers.filter((bm) => !realMembers.some((rm) => rm.memberCode === bm.memberCode))
        );
        const shareGroupUrl = `${getPublicBaseUrl()}?hoi=${encodeURIComponent(g.id)}`;
        const qrImg = makeStandaloneQrDataUrl(shareGroupUrl, g.shortName || g.name);
        const sharePost = `Thông báo Ban liên lạc ${g.name} (${g.subtitle || ""}): Mời anh chị em đồng đội bấm vào đường dẫn dưới đây để điểm danh quân số và ngồi Bàn trà 3D trực tuyến của đơn vị mình:\n${shareGroupUrl}`;

        bodyHtml = `
          <button type="button" class="btn-secondary" id="btn-back-group-list">← Xem tất cả Đơn vị &amp; Hội nhóm</button>

          <div class="group-unit-card ${g.category === "veteran" ? "veteran" : ""}">
            <div class="passcard-head">
              <span class="badge-tag jade">${escHtml(
                ((D.GROUP_CATEGORIES || []).find((c) => c.id === g.category) || { badge: "Hội nhóm" }).badge
              )}</span>
              <span class="online-status-pill"><span class="online-dot-live"></span>Quân số: ${combinedRoster.length} thành viên</span>
            </div>
            <h2>${escHtml(g.name)}</h2>
            <p style="font-weight:700; color:var(--accent-terracotta);">${escHtml(g.subtitle || "")}</p>
            ${
              g.unitSpec
                ? `<div class="unit-spec-badges">
                     ${g.unitSpec.company ? `<span class="unit-spec-pill">${escHtml(g.unitSpec.company)}</span>` : ""}
                     ${g.unitSpec.battalion ? `<span class="unit-spec-pill">${escHtml(g.unitSpec.battalion)}</span>` : ""}
                     ${g.unitSpec.division ? `<span class="unit-spec-pill">${escHtml(g.unitSpec.division)}</span>` : ""}
                     ${g.unitSpec.campaign ? `<span class="unit-spec-pill">${escHtml(g.unitSpec.campaign)}</span>` : ""}
                   </div>`
                : ""
            }
            <p style="font-size:0.92rem;">${escHtml(g.motto || "")}</p>
            <small style="color:var(--ink-secondary);">${escHtml(g.leaderName || "")}</small>

            <div class="btn-row">
              <button type="button" class="btn-jade" id="btn-enter-unit-tearoom">
                ${ico("tea")}
                <span>Vào Bàn Trà 3D Đơn Vị</span>
              </button>
              <button type="button" class="btn-${isJoined ? "secondary" : "primary"}" id="btn-join-unit-roster">
                ${ico("check")}
                <span>${isJoined ? "Đã ghi tên Quân số" : "Ghi tên vào Đơn vị"}</span>
              </button>
            </div>
          </div>

          <div class="surface-panel">
            <h3>Bảng Quân Số &amp; Đèn Online Trực Tiếp (${combinedRoster.length})</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${combinedRoster
                .map((m, idx) => {
                  const info = resolvePeerLiveOnlineInfo(m);
                  const isMe = state.auth.isRegistered && m.memberCode === state.auth.memberCode;
                  const alreadyFr = isMe || isAlreadyFriend(m);
                  return `
                    <div class="friend-row-card">
                      <div class="friend-row-head">
                        ${renderSeniorAvatarSvg(m)}
                        <div class="friend-row-meta">
                          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
                            <strong>${escHtml(m.name)} · ${m.age || 68}t ${isMe ? "(Bạn)" : ""}</strong>
                            <span class="online-status-pill ${info.online ? "" : "offline"}">
                              <span class="online-dot-live ${info.online ? "" : "offline"}"></span>
                              ${info.online ? "Đang Online" : "Tạm nghỉ"}
                            </span>
                          </div>
                          <small style="color:var(--ink-secondary); font-size:0.88rem;">
                            Quê ${escHtml(m.province || "Việt Nam")} ${m.memberCode ? `· Mã ${escHtml(m.memberCode)}` : ""} · ${escHtml(info.where)}
                          </small>
                        </div>
                      </div>
                      ${
                        !isMe
                          ? `<div class="btn-row">
                               <button type="button" class="btn-${alreadyFr ? "secondary" : "jade"}" data-roster-friend="${idx}" ${alreadyFr ? "disabled" : ""}>
                                 ${alreadyFr ? "Đã kết bạn" : "+ Kết bạn"}
                               </button>
                               <button type="button" class="btn-primary" data-roster-jump="${idx}">
                                 Sang ngồi cùng
                               </button>
                             </div>`
                          : ""
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <div class="surface-panel">
            <h3>Bảng Tin Ban Liên Lạc &amp; Hẹn Giờ Uống Trà</h3>
            <div style="display:flex; gap:8px;">
              <input type="text" class="input-lg" id="unit-bulletin-in" placeholder="Nhắn tin cho toàn đơn vị (VD: 8h sáng mai họp mặt nhé)..." style="flex:1;" />
              <button type="button" class="btn-primary btn-inline" id="btn-post-bulletin">Đăng</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${(g.bulletins || [])
                .slice(0, 6)
                .map(
                  (b) => `
                  <div class="bulletin-item">
                    <div style="display:flex; justify-content:space-between; gap:8px; font-size:0.88rem; color:var(--accent-terracotta); font-weight:700;">
                      <span>${escHtml(b.author)}</span>
                      <span>${escHtml(b.time || "")}</span>
                    </div>
                    <p>${escHtml(b.text)}</p>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>

          <div class="surface-panel warm">
            <h3>Thẻ QR &amp; Đường Dẫn Mời Đồng Đội Vào Đơn Vị</h3>
            <p style="font-size:0.88rem; color:var(--ink-secondary);">Gửi ảnh QR hoặc sao chép lời mời dưới đây dán vào nhóm Zalo Cựu chiến binh / Hội đồng niên:</p>
            <img src="${qrImg}" alt="Mã QR chiêu tập đồng đội" style="width:100%; max-width:250px; margin:0 auto; display:block; border-radius:12px; border:1px solid var(--border-strong);" />
            ${renderSocialShareKitHtml({
              prefix: "unit-share",
              copyLinkBtnId: "btn-copy-unit-link",
              shareUrl: shareGroupUrl,
              postText: sharePost
            })}
          </div>
        `;
      } else {
        const filteredGroups =
          activeGroupCatFilter === "all"
            ? allGroups
            : allGroups.filter((g) => g.category === activeGroupCatFilter);

        bodyHtml = `
          <div class="surface-panel jade">
            <div class="passcard-head">
              <strong>Tìm lại Đồng đội, Trường cũ &amp; Bạn đồng hương</strong>
              <span class="badge-tag jade">${allGroups.length} hội đang mở</span>
            </div>
            <p style="font-size:0.9rem;">Lập riêng phiên hiệu đơn vị (như <strong>Đại đội 1K2 · D3 · Sư đoàn 25 · Chiến trường Miền Nam 75</strong>) có sẵn Bàn trà 3D riêng, bảng quân số Online và mã QR gửi nhóm Zalo.</p>
            <button type="button" class="btn-primary" id="btn-open-create-group">
              ${ico("users")}
              <span>+ Lập Đơn Vị / Hội Nhóm Mới</span>
            </button>
          </div>

          <div class="habit-grid" role="group" aria-label="Lọc loại hội nhóm">
            <button type="button" class="habit-chip ${activeGroupCatFilter === "all" ? "selected" : ""}" data-gcat="all">Tất cả (${allGroups.length})</button>
            ${(D.GROUP_CATEGORIES || [])
              .map(
                (c) =>
                  `<button type="button" class="habit-chip ${activeGroupCatFilter === c.id ? "selected" : ""}" data-gcat="${c.id}">${escHtml(c.badge)}</button>`
              )
              .join("")}
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${filteredGroups
              .map((g) => {
                const isJoined = state.social.joinedGroupIds.includes(g.id);
                const totalMem = (g.memberIds || []).length + (g.realMembers || []).length;
                return `
                  <div class="group-unit-card ${g.category === "veteran" ? "veteran" : ""}">
                    <div class="passcard-head">
                      <span class="badge-tag ${g.category === "veteran" ? "jade" : "amber"}">${escHtml(
                        ((D.GROUP_CATEGORIES || []).find((c) => c.id === g.category) || { badge: "Hội nhóm" }).badge
                      )}</span>
                      <span class="online-status-pill"><span class="online-dot-live"></span>${totalMem} thành viên</span>
                    </div>
                    <h3>${escHtml(g.name)}</h3>
                    <p style="font-size:0.9rem; font-weight:600; color:var(--accent-terracotta);">${escHtml(g.subtitle || "")}</p>
                    <p style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(g.motto || "")}</p>
                    <div class="btn-row">
                      <button type="button" class="btn-primary" data-open-group="${escHtml(g.id)}">
                        ${isJoined ? "Mở Phòng Đơn Vị" : "Xem & Gia nhập"}
                      </button>
                      <button type="button" class="btn-jade" data-direct-tearoom="${escHtml(g.id)}">
                        Vào Bàn Trà 3D
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        `;
      }
    } else if (tab === "friends") {
      const sortedFriends = (state.social.friends || []).slice().sort((a, b) => {
        const oa = resolvePeerLiveOnlineInfo(a).online ? 1 : 0;
        const ob = resolvePeerLiveOnlineInfo(b).online ? 1 : 0;
        return ob - oa;
      });

      bodyHtml = `
        <div class="surface-panel warm">
          <div class="passcard-head">
            <strong>Kết bạn nhanh bằng Mã Thẻ Hội Viên</strong>
            <span class="member-code-chip">${
              state.auth.isRegistered ? `Mã của ${getUserPronoun()}: ${escHtml(state.auth.memberCode)}` : "Chưa mở Thẻ"
            }</span>
          </div>
          <p style="font-size:0.88rem; color:var(--ink-secondary);">Đọc cho đồng đội 4 số Mã Thẻ (ví dụ <code>TB-103</code> hoặc mã máy bạn) để kết bạn và thấy nhau Online mỗi sáng:</p>
          <div style="display:flex; gap:8px;">
            <input type="text" class="input-lg num" id="add-friend-code-in" placeholder="Nhập mã TB-xxxx (VD: TB-103)" style="flex:1;" />
            <button type="button" class="btn-primary btn-inline" id="btn-add-friend-by-code">+ Kết bạn</button>
          </div>
        </div>

        ${
          livePeers.length > 0
            ? `
          <div class="surface-panel jade">
            <div class="passcard-head">
              <strong>Người thật đang mở máy trực tuyến (${livePeers.length})</strong>
              <span class="online-status-pill"><span class="online-dot-live"></span>Thời gian thực</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${livePeers
                .map((lp, idx) => {
                  const already = isAlreadyFriend(lp);
                  return `
                    <div class="friend-row-card">
                      <div class="friend-row-head">
                        ${renderSeniorAvatarSvg(lp)}
                        <div class="friend-row-meta">
                          <strong>${escHtml(lp.name)} · ${lp.age || 65}t (${escHtml(lp.province || "VN")})</strong>
                          <small style="font-size:0.88rem; color:var(--accent-jade); font-weight:700;">
                            ${lp.memberCode ? `Mã ${escHtml(lp.memberCode)} · ` : ""}${escHtml(lp.where || "Đang trực tuyến")}
                          </small>
                        </div>
                      </div>
                      <div class="btn-row">
                        <button type="button" class="btn-${already ? "secondary" : "jade"}" data-live-add="${idx}" ${already ? "disabled" : ""}>
                          ${already ? "Đã là Bạn bè" : "+ Kết bạn ngay"}
                        </button>
                        <button type="button" class="btn-primary" data-live-jump="${idx}">
                          Sang ngồi cùng
                        </button>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        <div class="surface-panel">
          <div class="passcard-head">
            <h3>Danh sách Bạn Tâm Giao &amp; Đồng Đội (${sortedFriends.length})</h3>
            <span class="online-status-pill"><span class="online-dot-live"></span>${onlineCount} đang Online</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${sortedFriends
              .map((f, idx) => {
                const info = resolvePeerLiveOnlineInfo(f);
                return `
                  <div class="friend-row-card">
                    <div class="friend-row-head">
                      ${renderSeniorAvatarSvg(f)}
                      <div class="friend-row-meta">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
                          <strong>${escHtml(f.name)} · ${f.age || 68}t</strong>
                          <span class="online-status-pill ${info.online ? "" : "offline"}">
                            <span class="online-dot-live ${info.online ? "" : "offline"}"></span>
                            ${info.online ? "Đang Online" : "Ngoại tuyến"}
                          </span>
                        </div>
                        <small style="font-size:0.88rem; color:var(--ink-secondary);">
                          ${escHtml(f.province || "Việt Nam")} ${f.memberCode ? `· ${escHtml(f.memberCode)}` : ""} ${f.unitLabel ? `· ${escHtml(f.unitLabel)}` : ""}
                        </small>
                        <small style="font-size:0.88rem; font-weight:600; color:${info.online ? "var(--accent-jade)" : "var(--ink-secondary)"};">
                          ${escHtml(info.where)}
                        </small>
                      </div>
                    </div>
                    <div class="btn-row">
                      <button type="button" class="btn-primary" data-friend-jump="${idx}">
                        ${ico("tea")}
                        <span>Sang ngồi cùng</span>
                      </button>
                      <button type="button" class="btn-secondary" data-friend-chess="${idx}">
                        ${ico("xiangqi")}
                        <span>Rủ đánh Cờ</span>
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    } else {
      // Tab 3: Thẻ Hội Viên & Bảng Phân Quyền Mở Tự Do vs Cần Đăng Ký
      const tier = D.AUTH_TIER_GUIDE || { freeFeatures: [], memberFeatures: [] };
      bodyHtml = `
        <div class="passcard-banner ${state.auth.isRegistered ? "verified" : ""}">
          <div class="passcard-head">
            <strong>${
              state.auth.isRegistered
                ? `Thẻ Hội Viên Đang Hoạt Động: ${escHtml(state.auth.memberCode)}`
                : "Chưa mở Thẻ Hội Viên (Đang dùng chế độ Mở Cửa Tự Do)"
            }</strong>
            <span class="member-code-chip">${state.auth.isRegistered ? escHtml(state.auth.phoneMasked) : "0 mật khẩu"}</span>
          </div>
          <p style="font-size:0.9rem;">
            ${
              state.auth.isRegistered
                ? "Bấm nút dưới đây để tải Ảnh Thẻ Hội Viên QR về máy (phòng khi đổi điện thoại mới chỉ cần quét ảnh là vào lại ngay)."
                : "Chỉ mất 10 giây điền Số điện thoại + 4 số dễ nhớ (như năm nhập ngũ 1975). Không cần Email, không sợ quên mật khẩu."
            }
          </p>
          <button type="button" class="btn-primary" id="btn-auth-guide-open-modal">
            ${ico("card")}
            <span>${state.auth.isRegistered ? "Xem & Lưu Ảnh Thẻ Hội Viên QR" : "Cấp Thẻ Hội Viên / Đăng Nhập Ngay (10s)"}</span>
          </button>
        </div>

        <div class="surface-panel jade">
          <h3>Tầng 0 — Mở Cửa Tự Do (Không cần đăng ký)</h3>
          <ul class="tier-compare-list">
            ${tier.freeFeatures.map((item) => `<li>${escHtml(item)}</li>`).join("")}
          </ul>
        </div>

        <div class="surface-panel warm">
          <h3>Tầng 1 — Cần Thẻ Hội Viên (Giữ Bạn bè &amp; Đơn vị lâu dài)</h3>
          <ul class="tier-compare-list">
            ${tier.memberFeatures.map((item) => `<li>${escHtml(item)}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    els.main.innerHTML = `
      <h1>Hội Đồng Ngũ · CLB &amp; Kết Bạn</h1>
      <p class="lead-copy">Tập hợp đồng đội đơn vị cũ, bạn học đồng niên, thấy nhau sáng đèn Online mỗi sáng và vào thẳng Bàn trà 3D riêng.</p>

      <div class="social-top-tabs" role="tablist" aria-label="Chọn mục Hội nhóm, Bạn bè hoặc Thẻ Hội Viên">
        <button type="button" class="social-tab-btn ${tab === "units" ? "active" : ""}" data-soc-tab="units">Đơn vị &amp; Hội</button>
        <button type="button" class="social-tab-btn ${tab === "friends" ? "active" : ""}" data-soc-tab="friends">Bạn Online (${onlineCount})</button>
        <button type="button" class="social-tab-btn ${tab === "auth-guide" ? "active" : ""}" data-soc-tab="auth-guide">Thẻ Hội Viên</button>
      </div>

      ${bodyHtml}
    `;

    els.main.querySelectorAll("[data-soc-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.social.activeTab = btn.dataset.socTab;
        if (btn.dataset.socTab !== "units") state.social.subView = "list";
        saveState();
        renderGroupsAndFriends();
      });
    });

    // Units List bindings
    const createGrpBtn = document.getElementById("btn-open-create-group");
    if (createGrpBtn) createGrpBtn.addEventListener("click", openCreateGroupModal);

    els.main.querySelectorAll("[data-gcat]").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeGroupCatFilter = chip.dataset.gcat;
        renderGroupsAndFriends();
      });
    });

    els.main.querySelectorAll("[data-open-group]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.social.selectedGroupId = btn.dataset.openGroup;
        state.social.subView = "detail";
        saveState();
        syncMyGlobalOnlinePresence();
        renderGroupsAndFriends();
      });
    });

    els.main.querySelectorAll("[data-direct-tearoom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const g = getGroupById(btn.dataset.directTearoom);
        enterGroupPrivateTeaRoom(g);
      });
    });

    // Unit Detail bindings
    const backListBtn = document.getElementById("btn-back-group-list");
    if (backListBtn) {
      backListBtn.addEventListener("click", () => {
        state.social.subView = "list";
        saveState();
        renderGroupsAndFriends();
      });
    }

    const enterUnitTeaBtn = document.getElementById("btn-enter-unit-tearoom");
    if (enterUnitTeaBtn) {
      enterUnitTeaBtn.addEventListener("click", () => {
        enterGroupPrivateTeaRoom(getGroupById(state.social.selectedGroupId));
      });
    }

    const joinRosterBtn = document.getElementById("btn-join-unit-roster");
    if (joinRosterBtn) {
      joinRosterBtn.addEventListener("click", () => {
        joinGroupUnit(getGroupById(state.social.selectedGroupId));
      });
    }

    if (tab === "units" && state.social.subView === "detail") {
      const g = getGroupById(state.social.selectedGroupId);
      const builtinMembers = (g.memberIds || [])
        .map((sid) => (D.SENIOR_DIRECTORY || []).find((s) => s.id === sid))
        .filter(Boolean);
      const realMembers = Array.isArray(g.realMembers) ? g.realMembers : [];
      const combinedRoster = realMembers.concat(
        builtinMembers.filter((bm) => !realMembers.some((rm) => rm.memberCode === bm.memberCode))
      );

      els.main.querySelectorAll("[data-roster-friend]").forEach((b) => {
        b.addEventListener("click", () => {
          const m = combinedRoster[Number(b.dataset.rosterFriend)];
          if (m) requestAddFriendWithAuth(Object.assign({}, m, { unitLabel: g.shortName || g.name }));
        });
      });

      els.main.querySelectorAll("[data-roster-jump]").forEach((b) => {
        b.addEventListener("click", () => {
          const m = combinedRoster[Number(b.dataset.rosterJump)];
          if (m) jumpToOnlineCompanion(resolvePeerLiveOnlineInfo(m), m.name);
        });
      });

      const postBulBtn = document.getElementById("btn-post-bulletin");
      if (postBulBtn) {
        postBulBtn.addEventListener("click", () => {
          const txt = (document.getElementById("unit-bulletin-in").value || "").trim();
          if (!txt) {
            showToast("Vui lòng nhập nội dung thông báo gửi đồng đội.");
            return;
          }
          requireMemberCard("Đăng thông báo lên Bảng tin Đơn vị", () => {
            if (!Array.isArray(g.bulletins)) g.bulletins = [];
            g.bulletins.unshift({
              author: `${state.user.name} · ${getUserAge()} tuổi`,
              time: "Vừa xong",
              text: txt
            });
            saveState();
            if (RT) RT.publishGroup(g);
            showToast("Đã đăng thông báo lên Bảng tin Đơn vị!");
            renderGroupsAndFriends();
          });
        });
      }

      const shareGroupUrl = `${getPublicBaseUrl()}?hoi=${encodeURIComponent(g.id)}`;
      const sharePost = `Thông báo Ban liên lạc ${g.name} (${g.subtitle || ""}): Mời anh chị em đồng đội bấm vào đường dẫn dưới đây để điểm danh quân số và ngồi Bàn trà 3D trực tuyến của đơn vị mình:\n${shareGroupUrl}`;
      bindSocialShareKit({
        prefix: "unit-share",
        copyLinkBtnId: "btn-copy-unit-link",
        shareUrl: shareGroupUrl,
        postText: sharePost
      });
    }

    // Friends Tab bindings
    const addByCodeBtn = document.getElementById("btn-add-friend-by-code");
    if (addByCodeBtn) {
      addByCodeBtn.addEventListener("click", () => {
        const val = document.getElementById("add-friend-code-in").value;
        addFriendByCodeLookup(val);
      });
    }

    els.main.querySelectorAll("[data-live-add]").forEach((b) => {
      b.addEventListener("click", () => {
        const lp = livePeers[Number(b.dataset.liveAdd)];
        if (lp) requestAddFriendWithAuth(lp);
      });
    });

    els.main.querySelectorAll("[data-live-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        const lp = livePeers[Number(b.dataset.liveJump)];
        if (lp) jumpToOnlineCompanion({ online: true, roomId: lp.roomId, tableIdx: lp.tableIdx }, lp.name);
      });
    });

    if (tab === "friends") {
      const sortedFriends = (state.social.friends || []).slice().sort((a, b) => {
        const oa = resolvePeerLiveOnlineInfo(a).online ? 1 : 0;
        const ob = resolvePeerLiveOnlineInfo(b).online ? 1 : 0;
        return ob - oa;
      });

      els.main.querySelectorAll("[data-friend-jump]").forEach((b) => {
        b.addEventListener("click", () => {
          const f = sortedFriends[Number(b.dataset.friendJump)];
          if (f) jumpToOnlineCompanion(resolvePeerLiveOnlineInfo(f), f.name);
        });
      });

      els.main.querySelectorAll("[data-friend-chess]").forEach((b) => {
        b.addEventListener("click", () => {
          const f = sortedFriends[Number(b.dataset.friendChess)];
          switchXiangqiMode("async");
          navigate("xiangqi");
          if (f) showToast(`Đã tạo ván Cờ Tướng 9×10 — hãy chép link gửi cho ${f.name}!`);
        });
      });
    }

    // Auth Guide Tab binding
    const authGuideBtn = document.getElementById("btn-auth-guide-open-modal");
    if (authGuideBtn) {
      authGuideBtn.addEventListener("click", () => openMemberAuthModal());
    }
  }

  // ==================== ROUTER & GLOBAL TIMERS ====================
  function render() {
    updateGlobalChrome();
    switch (state.route) {
      case "groups":
        renderGroupsAndFriends();
        break;
      case "checkin":
        renderCheckin();
        break;
      case "tearoom":
        renderTeaRoom();
        break;
      case "newspaper":
        renderNewspaper();
        break;
      case "quiz":
        renderQuiz();
        break;
      case "games":
        renderGames();
        break;
      case "xiangqi":
        renderXiangqiScreen();
        break;
      case "poetry":
        renderPoetry();
        break;
      case "watch":
        renderWatch();
        break;
      case "zen":
        renderZen();
        break;
      case "leaderboard":
        renderLeaderboard();
        break;
      case "profile":
        renderProfile();
        break;
      case "health":
        renderHealth();
        break;
      case "family":
        renderFamilyView();
        break;
      case "privacy":
        renderPrivacyAndMetrics();
        break;
      default:
        renderHome();
    }
  }

  function showEyeRestModal() {
    eyeCareShownThisCycle = true;
    openDialog(
      "Nhắc nghỉ mắt sau 20 phút",
      `
      <div class="surface-panel warm">
        <h3>Bác nghỉ mắt một chút nhé</h3>
        <p>Bác đã sinh hoạt được 20 phút rồi. Mời bác nhìn ra xa 20 giây, uống ngụm nước ấm và vươn vai nhẹ.</p>
      </div>
      <button type="button" class="btn-jade" id="btn-ack-eyecare">Tôi đã nghỉ mắt — Tiếp tục</button>
      `
    );
    document.getElementById("btn-ack-eyecare").addEventListener("click", () => {
      sessionSeconds = 0;
      eyeCareShownThisCycle = false;
      closeDialog();
    });
  }

  if (TEL && RT && typeof TEL.setRemoteForwarder === "function") {
    TEL.setRemoteForwarder((ev) => {
      if (RT && typeof RT.publishTelemetryEvent === "function") {
        RT.publishTelemetryEvent(ev);
      }
    });
  }

  // 1-second session, 20-second AI dwell-time flush & 60-second Tea Table silence watchdog
  setInterval(() => {
    sessionSeconds += 1;
    if (sessionSeconds % 20 === 0 && TEL && typeof TEL.flushDwellHeartbeat === "function") {
      TEL.flushDwellHeartbeat(buildTelemetryUserCtx());
    }
    if (sessionSeconds >= 1200 && !eyeCareShownThisCycle) {
      showEyeRestModal();
    }

    if (state.route === "tearoom" && state.teaRoom.subView === "table") {
      const idleSec = Math.floor((Date.now() - lastTableActivityAt) / 1000);
      const idleStatusEl = document.getElementById("idle-assistant-status");
      if (idleStatusEl && idleSec >= 10 && idleSec < 60) {
        const room = getCurrentRoom();
        idleStatusEl.textContent = `${room.hostName || "Chị Trà (Trợ lý)"} giữ ấm trà · Tự gợi chuyện mới sau ${60 - idleSec}s`;
      }
      if (idleSec >= 60) {
        triggerIdleAssistantPrompt();
      }
    }
  }, 1000);

  // Realtime cross-device synchronization bindings
  if (RT) {
    RT.on("status", () => {
      updateGlobalChrome();
      if (state.route === "privacy") renderPrivacyAndMetrics();
    });

    let presenceDebounceId = null;
    RT.on("presence", () => {
      updateGlobalChrome();
      clearTimeout(presenceDebounceId);
      presenceDebounceId = setTimeout(() => {
        if (state.route !== "tearoom") return;
        if (state.teaRoom.subView === "table") {
          const baseTable = getCurrentTable();
          const newKey = RT.getPeersAtTable(baseTable.id)
            .map((p) => p.clientId)
            .sort()
            .join(",");
          if (newKey !== lastRenderedPeerKey) {
            const draftVal = (document.getElementById("tea-text-input") || {}).value || "";
            renderTeaRoomTableView(getCurrentRoom());
            const nextIn = document.getElementById("tea-text-input");
            if (nextIn && draftVal) nextIn.value = draftVal;
          }
        } else {
          const room = getCurrentRoom();
          const newLobbyKey = computeRoomLobbyPeerKey(room);
          if (newLobbyKey !== lastRenderedLobbyPeerKey) {
            renderTeaRoomLobby(room);
          }
        }
      }, 160);
    });

    RT.on("chat", (pkt) => {
      if (state.route !== "tearoom" || state.teaRoom.subView !== "table") return;
      const baseTable = getCurrentTable();
      const cleanCurr = String(baseTable.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
      if (pkt.tableKey !== cleanCurr) return;
      const table = getTableWithRealPeers(baseTable);
      const seatIdx = table.members.findIndex((m) => m.clientId && m.clientId === pkt.clientId);
      if (pkt.ritual === "pour" && window.TeaRoomScene) {
        window.TeaRoomScene.triggerTeaService();
      }
      if (pkt.stickerId && window.TeaRoomScene && typeof window.TeaRoomScene.showSeatSticker === "function") {
        const foundStk = (D.TEA_STICKERS || []).find((s) => s.id === pkt.stickerId);
        if (foundStk) {
          window.TeaRoomScene.showSeatSticker(seatIdx >= 0 ? seatIdx : 0, foundStk.shortLabel, foundStk.bg, foundStk.color);
        }
      }
      pushTableMessage(pkt.speaker, pkt.text, seatIdx >= 0 ? seatIdx : 0, pkt.stickerId || null);
    });

    RT.on("tableMeta", () => {
      if (state.route === "tearoom") {
        const activeTag = document.activeElement && document.activeElement.tagName;
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          renderTeaRoom();
        }
      }
    });

    RT.on("temple", (pkt) => {
      if (!pkt || pkt.clientId === RT.getClientId()) return;
      if (state.route === "zen") {
        triggerTempleVisualWave(
          "#FFD166",
          pkt.userName || "Bạn trực tuyến",
          pkt.ritualKind || (pkt.prayerText ? "wish_plaque" : "bell")
        );
        if (pkt.prayerText) {
          const activeTag = document.activeElement && document.activeElement.tagName;
          if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
            renderZen();
          }
        }
      }
    });

    RT.on("telemetry", () => {
      if (state.route === "privacy" && activePrivacySubTab === "ai-logs") {
        renderPrivacyAndMetrics();
      }
    });

    RT.on("memberLogs", () => {
      if (state.route === "privacy" && activePrivacySubTab === "ai-logs") {
        renderPrivacyAndMetrics();
      }
    });

    RT.on("tableLog", (pkt) => {
      if (state.route !== "tearoom" || state.teaRoom.subView !== "table") return;
      const baseTable = getCurrentTable();
      const cleanCurr = String(baseTable.id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
      if (pkt.tableKey !== cleanCurr || !Array.isArray(pkt.lines) || pkt.lines.length === 0) return;
      // Hydrate recent real messages if we just joined this table fresh
      if (state.teaRoom.log.length <= (baseTable.initialLog ? baseTable.initialLog.length : 2)) {
        state.teaRoom.log = pkt.lines.slice(-10);
        saveState();
        updateTeaBoardDom();
      }
    });

    let checkinDebounceId = null;
    RT.on("checkins", () => {
      clearTimeout(checkinDebounceId);
      checkinDebounceId = setTimeout(() => {
        if (state.route === "checkin") renderCheckin();
      }, 160);
    });

    let poemDebounceId = null;
    RT.on("poems", () => {
      clearTimeout(poemDebounceId);
      poemDebounceId = setTimeout(() => {
        if (state.route === "poetry") renderPoetry();
      }, 160);
    });

    let onlineDebounceId = null;
    RT.on("online", () => {
      updateGlobalChrome();
      clearTimeout(onlineDebounceId);
      onlineDebounceId = setTimeout(() => {
        if (state.route === "groups") {
          const activeTag = document.activeElement && document.activeElement.tagName;
          if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
            renderGroupsAndFriends();
          }
        }
      }, 220);
    });

    let groupsDebounceId = null;
    RT.on("groups", () => {
      clearTimeout(groupsDebounceId);
      groupsDebounceId = setTimeout(() => {
        getAllMergedGroups();
        saveState();
        if (state.route === "groups") {
          const activeTag = document.activeElement && document.activeElement.tagName;
          if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
            renderGroupsAndFriends();
          }
        }
      }, 220);
    });

    RT.on("friends", (pkt) => {
      if (!pkt || !pkt.fromCode) return;
      const incoming = {
        memberCode: pkt.fromCode,
        name: pkt.fromName || `Đồng đội ${pkt.fromCode}`,
        age: pkt.fromAge || 68,
        province: pkt.fromProvince || "Việt Nam",
        provinceId: pkt.fromProvinceId || "ha-noi",
        outfitColor: pkt.fromOutfitColor || "#3E5634",
        hat: pkt.fromHat || "cap",
        unitLabel: pkt.fromUnit || "",
        isRealPeer: true
      };
      if (!isAlreadyFriend(incoming)) {
        state.social.friends.unshift(incoming);
        saveState();
        syncMyCloudAccountBackup();
        showToast(`${incoming.name} (${incoming.memberCode}) vừa kết bạn với bác!`);
        if (state.route === "groups") renderGroupsAndFriends();
      }
    });

    RT.on("match", (m) => {
      if (!m || !m.matchId) return;
      const myCid = RT.getClientId();
      if (m.kind === "oaq" && state.oaq.matchId === m.matchId) {
        state.oaq.mode = "async";
        state.oaq.myRole = m.hostId === myCid ? "host" : "guest";
        state.oaq.hostName = m.hostName || "Chủ bàn";
        state.oaq.guestName =
          m.guestName || (state.oaq.myRole === "guest" ? `${state.user.name} · ${getUserAge()}t` : "Đang chờ bạn cờ...");
        if (m.payload && Array.isArray(m.payload.cells)) {
          state.oaq.cells = m.payload.cells.slice();
          state.oaq.scoreP = m.payload.scoreHost || 0;
          state.oaq.scoreAI = m.payload.scoreGuest || 0;
        }
        state.oaq.turn = m.turn || "host";
        state.oaq.statusText = m.statusText || "Đã đồng bộ nước đi ván treo!";
        saveState();
        if (state.route === "games" && activeGameTab === "oaq") renderGames();
      } else if (m.kind === "xiangqi" && state.xiangqi.matchId === m.matchId) {
        state.xiangqi.mode = "async";
        state.xiangqi.mySide = m.hostId === myCid ? "red" : "black";
        state.xiangqi.hostName = m.hostName || "Chủ bàn (Đỏ)";
        state.xiangqi.guestName =
          m.guestName || (state.xiangqi.mySide === "black" ? `${state.user.name} · ${getUserAge()}t` : "Đang chờ kỳ hữu...");
        if (m.payload && Array.isArray(m.payload.board)) {
          state.xiangqi.board = XQ.cloneBoard(m.payload.board);
          state.xiangqi.lastMove = m.payload.lastMove || null;
          state.xiangqi.solved = Boolean(m.payload.solved);
        }
        state.xiangqi.turn = m.turn || "red";
        state.xiangqi.status =
          m.statusText ||
          (state.xiangqi.turn === state.xiangqi.mySide
            ? `Đến lượt bác cầm quân ${state.xiangqi.mySide === "red" ? "Đỏ" : "Đen"}!`
            : "Đang chờ bạn cờ đi nước tiếp theo...");
        saveState();
        refreshXiangqiHosts();
      }
    });
  }

  // Event bindings
  els.btnBack.addEventListener("click", () => navigate("home"));
  els.btnProfile.addEventListener("click", () => navigate("profile"));
  els.dialogClose.addEventListener("click", closeDialog);
  if (els.stripRtBtn) {
    els.stripRtBtn.addEventListener("click", openRealtimeStatusModal);
  }
  const simOpenXq = document.getElementById("sim-open-xiangqi");
  if (simOpenXq) {
    simOpenXq.addEventListener("click", () => navigate("xiangqi"));
  }
  const simOpenGroups = document.getElementById("sim-open-groups");
  if (simOpenGroups) {
    simOpenGroups.addEventListener("click", () => navigate("groups"));
  }
  const simOpenTemple = document.getElementById("sim-open-temple");
  if (simOpenTemple) {
    simOpenTemple.addEventListener("click", () => navigate("zen"));
  }

  els.btnFont.addEventListener("click", () => {
    state.settings.xlFont = !state.settings.xlFont;
    saveState();
    updateGlobalChrome();
    showToast(state.settings.xlFont ? "Đã bật chế độ chữ cực lớn (24px)." : "Đã về cỡ chữ chuẩn (20px).");
  });

  els.btnRead.addEventListener("click", () => {
    if (els.btnRead.classList.contains("speaking")) {
      stopSpeaking();
      showToast("Đã dừng đọc.");
      return;
    }
    speak(buildCurrentScreenSpeech(), { announceToast: true });
  });

  if (els.simRender) {
    els.simRender.addEventListener("click", () => {
      state.settings.autoFallbacked = false;
      state.settings.preferredRender = state.settings.preferredRender === "3d" ? "2.5d" : "3d";
      saveState();
      updateGlobalChrome();
      if (state.route === "tearoom") renderTeaRoom();
    });
  }
  if (els.simFont) {
    els.simFont.addEventListener("click", () => els.btnFont.click());
  }
  if (els.simDict) {
    els.simDict.addEventListener("click", openDictDialog);
  }
  if (els.simVoiceSample) {
    let sampleRot = 2;
    els.simVoiceSample.addEventListener("click", () => {
      if (state.route !== "tearoom" || state.teaRoom.subView !== "table") {
        state.route = "tearoom";
        state.teaRoom.subView = "table";
        render();
      }
      const pick = D.VOICE_SAMPLES[sampleRot % D.VOICE_SAMPLES.length];
      sampleRot += 1;
      showInlineVoiceDraft(pick.raw, `Mẫu thử: ${pick.label}`);
      const box = document.getElementById("inline-voice-box");
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  if (els.simIdle60) {
    els.simIdle60.addEventListener("click", () => {
      if (state.route !== "tearoom" || state.teaRoom.subView !== "table") {
        state.route = "tearoom";
        state.teaRoom.subView = "table";
        render();
      }
      triggerIdleAssistantPrompt();
    });
  }
  if (els.simEye) {
    els.simEye.addEventListener("click", () => {
      sessionSeconds = 1200;
      showEyeRestModal();
    });
  }
  if (els.simPrivacy) {
    els.simPrivacy.addEventListener("click", () => navigate("privacy"));
  }
  if (els.simFamily) {
    els.simFamily.addEventListener("click", () => navigate("family"));
  }
  if (els.simReset) {
    els.simReset.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VAULT_BACKUP_KEY);
      if (TEL && typeof TEL.wipeLocalTelemetry === "function") TEL.wipeLocalTelemetry();
      state = createDefaultState();
      sessionSeconds = 0;
      pendingQueue = [];
      showToast("Đã đặt lại dữ liệu mô phỏng ban đầu.");
      render();
    });
  }

  applyUrlDeepLinkIfPresent();
  if (RT) {
    RT.start();
    setTimeout(() => {
      syncMyGlobalOnlinePresence();
      if (state.auth && state.auth.isRegistered) {
        syncMyCloudAccountBackup();
      }
    }, 500);
  }
  render();
})();




































































