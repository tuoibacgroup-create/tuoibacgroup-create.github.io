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
        lastActiveDate: "",
        dailyQuests: {
          dateKey: "",
          morningDone: false,
          socialDone: false,
          mindDone: false,
          chestClaimed: false
        },
        habits: ["uong-tra", "doc-bao", "co-tuong"],
        gameStats: {
          oaqWins: 0,
          oaqLosses: 0,
          xiangqiWins: 0,
          xiangqiLosses: 0,
          proverbWins: 0,
          cupTitles: 0,
          winStreak: 0,
          bestWinStreak: 0
        }
      },
      settings: {
        xlFont: false,
        preferredRender: "2.5d",
        autoFallbacked: false,
        homeMode: "full",
        pwaBannerDismissed: false,
        voiceMode: "auto",
        uatTag: ""
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
        idle_prompts_triggered: 0,
        feedbacks: []
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
        packIdx: 0,
        idx: 0,
        score: 0,
        selectedOpt: null,
        hiddenOpts: [],
        hintUsed: false,
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
        aiLevel: "club",
        matchId: "",
        myRole: "host",
        hostName: "",
        guestName: "",
        statusText: "Chọn một ô của bác (hàng dưới) để rải quân.",
        zaloInviteUrl: "",
        inProgress: false,
        forfeitedPendingReload: false,
        proverbGame: {
          deck: [],
          flipped: [],
          matchedIds: [],
          moves: 0,
          roundSeed: 0,
          lastMatchedPair: null
        }
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
        status: "Bàn chuẩn 9×10 (32 quân) — Bác cầm quân Đỏ đi tiên: chạm quân Đỏ rồi chạm chấm xanh để đi.",
        inProgress: false,
        forfeitedPendingReload: false,
        cup: {
          active: false,
          round: 0,
          rivalId: "rv-1",
          unitName: "",
          championCount: 0,
          justWonTitle: false
        }
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
        lastPeaceCardAt: 0,
        lastWishCardAt: 0,
        activeLanterns: [],
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
        medEvening: false,
        waterCups: 3,
        emergencyContactName: "Anh Hùng (Con trai)",
        emergencyContactPhone: "0900000000",
        bpReadings: ["Sáng nay: 128/80 mmHg (Ổn định)", "Hôm qua: 130/82 mmHg (Ổn định)"],
        lastAnswer: D.HEALTH_QA[0].answer,
        emergencyMode: false
      }
    };
  }

  function getLocalDateKey(d) {
    const dt = d || new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function ensureDailyRollover(targetState) {
    const st = targetState;
    if (!st || !st.user) return false;
    const todayKey = getLocalDateKey(new Date());
    if (!st.user.dailyQuests || typeof st.user.dailyQuests !== "object") {
      st.user.dailyQuests = {
        dateKey: todayKey,
        morningDone: Boolean(st.user.checkedInToday),
        socialDone: false,
        mindDone: false,
        chestClaimed: false
      };
    }
    if (!st.user.lastActiveDate) {
      st.user.lastActiveDate = todayKey;
      st.user.dailyQuests.dateKey = todayKey;
      if (st.user.checkedInToday) st.user.dailyQuests.morningDone = true;
      return false;
    }
    if (st.user.lastActiveDate === todayKey) {
      if (st.user.dailyQuests.dateKey !== todayKey) {
        st.user.dailyQuests.dateKey = todayKey;
      }
      return false;
    }
    // Parse day difference safely in local midnight coordinates
    const prevParts = String(st.user.lastActiveDate).split("-").map(Number);
    const prevMid =
      prevParts.length === 3
        ? new Date(prevParts[0], prevParts[1] - 1, prevParts[2]).getTime()
        : Date.now() - 86400000;
    const nowNow = new Date();
    const curMid = new Date(nowNow.getFullYear(), nowNow.getMonth(), nowNow.getDate()).getTime();
    const gapDays = Math.max(1, Math.round((curMid - prevMid) / 86400000));

    const hist = Array.isArray(st.user.daysHistory) && st.user.daysHistory.length === 7
      ? st.user.daysHistory.slice()
      : [true, true, true, true, true, true, false];
    hist[6] = Boolean(st.user.checkedInToday);
    const shifts = Math.min(7, gapDays);
    for (let s = 0; s < shifts; s++) {
      hist.shift();
      hist.push(false);
    }
    st.user.daysHistory = hist;

    if (gapDays > 2 && !st.user.checkedInToday) {
      st.user.streakDays = Math.max(1, (Number(st.user.streakDays) || 1) - 1);
    }
    st.user.checkedInToday = false;
    st.user.flowersLeft = 3;
    if (st.health) {
      st.health.medMorning = false;
      st.health.medEvening = false;
      st.health.waterCups = 0;
    }
    st.user.dailyQuests = {
      dateKey: todayKey,
      morningDone: false,
      socialDone: false,
      mindDone: false,
      chestClaimed: false
    };
    st.user.lastActiveDate = todayKey;
    return true;
  }

  let pendingReloadForfeitNotice = "";
  let matchHistoryGuardArmed = false;
  let state = loadState();
  let sessionSeconds = 0;
  let eyeCareShownThisCycle = false;
  let quizTimerId = null;
  let teaQueueTimerId = null;
  let cooldownTickId = null;
  let autoMuyuTimerId = null;
  let zenCooldownTimerId = null;
  let watchAnimId = null;
  let proverbFlipTimerId = null;
  let morningRssFetchedOnce = false;
  let pendingAdminAutoPrompt = false;
  let oaqAnimTimerId = null;
  let oaqAnimState = null;
  let pendingQueue = [];
  let pendingVoiceDraft = null;
  let activeGameTab = "oaq";
  let activeLeaderTab = "Cay32";
  let activeRankProvinceFilter = "all";
  let activeProfileMainTab = "wardrobe";
  let activeWardrobeCat = "outfits";
  let activeTeaInputTab = "quick";
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
        quiz: Object.assign({}, def.quiz, parsed.quiz || {}),
        oaq: Object.assign({}, def.oaq, parsed.oaq || {}),
        xiangqi: Object.assign({}, def.xiangqi, parsed.xiangqi || {}),
        watch: Object.assign({}, def.watch, parsed.watch || {}),
        zen: Object.assign({}, def.zen, parsed.zen || {}),
        health: Object.assign({}, def.health, parsed.health || {}),
        customTables: Object.assign({}, def.customTables, parsed.customTables || {})
      });
      merged.settings.preferredRender = "2.5d";
      merged.settings.autoFallbacked = false;
      merged.settings.voiceMode = merged.settings.voiceMode === "recorded" ? "recorded" : "auto";
      merged.settings.uatTag = String(merged.settings.uatTag || "").slice(0, 24);
      merged.newspaper.adminOpen = false;
      if (!Array.isArray(merged.quiz.hiddenOpts)) merged.quiz.hiddenOpts = [];
      merged.quiz.packIdx = Math.max(0, Math.min(4, Number(merged.quiz.packIdx) || 0));
      merged.oaq.aiLevel = merged.oaq.aiLevel === "easy" ? "easy" : "club";
      merged.oaq.proverbGame = Object.assign({}, def.oaq.proverbGame, (parsed.oaq && parsed.oaq.proverbGame) || {});
      if (!Array.isArray(merged.oaq.proverbGame.deck)) merged.oaq.proverbGame.deck = [];
      if (!Array.isArray(merged.oaq.proverbGame.flipped)) merged.oaq.proverbGame.flipped = [];
      if (!Array.isArray(merged.oaq.proverbGame.matchedIds)) merged.oaq.proverbGame.matchedIds = [];
      merged.xiangqi.cup = Object.assign({}, def.xiangqi.cup, (parsed.xiangqi && parsed.xiangqi.cup) || {});
      merged.health.waterCups = Math.max(0, Math.min(12, Number(merged.health.waterCups) || 0));
      if (!merged.health.emergencyContactName) merged.health.emergencyContactName = def.health.emergencyContactName;
      if (!merged.health.emergencyContactPhone) merged.health.emergencyContactPhone = def.health.emergencyContactPhone;
      const didRollover = ensureDailyRollover(merged);
      if (didRollover) {
        try {
          const rolledJson = JSON.stringify(merged);
          localStorage.setItem(STORAGE_KEY, rolledJson);
          localStorage.setItem(VAULT_BACKUP_KEY, rolledJson);
        } catch (e) {}
      }
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
      merged.user.gameStats = Object.assign({}, def.user.gameStats, (parsed.user && parsed.user.gameStats) || {});
      if (!Array.isArray(merged.analytics.feedbacks)) merged.analytics.feedbacks = [];
      merged.oaq.inProgress = Boolean(merged.oaq.inProgress);
      merged.oaq.forfeitedPendingReload = Boolean(merged.oaq.forfeitedPendingReload);
      merged.xiangqi.inProgress = Boolean(merged.xiangqi.inProgress);
      merged.xiangqi.forfeitedPendingReload = Boolean(merged.xiangqi.forfeitedPendingReload);

      const forfeitNotes = [];
      if (merged.oaq.forfeitedPendingReload) {
        const keepOaqMode = merged.oaq.mode === "async" ? "async" : "ai";
        merged.user.gameStats.oaqLosses = (Number(merged.user.gameStats.oaqLosses) || 0) + 1;
        merged.user.gameStats.winStreak = 0;
        merged.oaq = Object.assign({}, def.oaq, {
          mode: keepOaqMode,
          statusText: "Ván trước đã bị tính THUA do tải lại trang giữa ván. Mời chọn ô đi ván mới."
        });
        forfeitNotes.push("Ô ăn quan");
      }
      if (merged.xiangqi.forfeitedPendingReload) {
        const keepXqMode = merged.xiangqi.mode || "ai";
        const keepXqLevel = merged.xiangqi.aiLevel || "club";
        const keepPzIdx = merged.xiangqi.puzzleIdx || 0;
        const keepSolvedIds = Array.isArray(merged.xiangqi.solvedPuzzleIds) ? merged.xiangqi.solvedPuzzleIds : [];
        merged.user.gameStats.xiangqiLosses = (Number(merged.user.gameStats.xiangqiLosses) || 0) + 1;
        merged.user.gameStats.winStreak = 0;
        merged.xiangqi = Object.assign({}, def.xiangqi, {
          mode: keepXqMode === "puzzle" ? "ai" : keepXqMode,
          aiLevel: keepXqLevel,
          puzzleIdx: keepPzIdx,
          solvedPuzzleIds: keepSolvedIds,
          board: XQ ? XQ.createInitialBoard() : null,
          status: "Ván trước đã bị tính THUA do tải lại trang giữa ván. Mời bác đánh ván mới!"
        });
        forfeitNotes.push("Cờ tướng");
      }
      if (forfeitNotes.length > 0) {
        pendingReloadForfeitNotice = `Đã tính THUA (+1 trận thua) vì rời/tải lại trang giữa ván ${forfeitNotes.join(" & ")}.`;
      }
      merged.zen.userCushionIdx =
        typeof merged.zen.userCushionIdx === "number" && Number.isFinite(merged.zen.userCushionIdx)
          ? Math.max(0, Math.min(19, Math.floor(merged.zen.userCushionIdx)))
          : 2;
      if (!merged.zen.cameraView) merged.zen.cameraView = "wide";
      if (typeof merged.zen.wishPlaquesCount !== "number") merged.zen.wishPlaquesCount = 16;
      merged.zen.lastPeaceCardAt = Number(merged.zen.lastPeaceCardAt) || 0;
      merged.zen.lastWishCardAt = Number(merged.zen.lastWishCardAt) || 0;
      merged.zen.activeLanterns = Array.isArray(merged.zen.activeLanterns)
        ? merged.zen.activeLanterns.filter((it) => it && (it.expiresAt || 0) > Date.now()).slice(-16)
        : [];
      if (merged.oaq.mode !== "async" && merged.oaq.turn !== "host") {
        merged.oaq.turn = "host";
        merged.oaq.selectedCell = null;
      }
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
      renderMode: (state.settings && state.settings.preferredRender) || "3d",
      uatTag: (state.settings && state.settings.uatTag) || "",
      voiceMode: (state.settings && state.settings.voiceMode) || "auto",
      ttsMode: (window.__ttsState && window.__ttsState.mode) || ((state.settings && state.settings.voiceMode) || "auto"),
      netType: (typeof navigator !== "undefined" && navigator.connection && navigator.connection.effectiveType) || "wifi"
    };
  }

  function checkGameWinMilestones() {
    if (!state.user.gameStats) return;
    const gs = state.user.gameStats;
    const totalWins = (Number(gs.oaqWins) || 0) + (Number(gs.xiangqiWins) || 0);
    if (totalWins >= 3) {
      unlockTitleFrame("kien-tuong", "Kiện Tướng Dân Gian");
    }
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
    if (treeId === "temple_zen" && nextRank >= 2) {
      unlockHeritageTableItem("lu-tram-dong");
    }
    if (treeId === "temple_zen" && nextRank >= 3) {
      unlockTitleFrame("tam-an", "Cư Sĩ Tâm An");
    }
    if (treeId === "folk_games" && nextRank >= 3) {
      unlockTitleFrame("kien-tuong", "Kiện Tướng Dân Gian");
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

  function syncDailyQuestFlagsFromAction(actionKey, category) {
    ensureDailyRollover(state);
    const dq = state.user.dailyQuests;
    if (!dq) return;
    const act = String(actionKey || "");
    const cat = String(category || "");
    if (
      cat === "diem-danh" ||
      cat === "doc-bao" ||
      act.includes("checkin") ||
      act.includes("news") ||
      state.user.checkedInToday
    ) {
      dq.morningDone = true;
    }
    if (
      cat === "giao-luu" ||
      cat === "chua-online" ||
      cat === "tho-ca" ||
      cat === "dong-ngu" ||
      act.includes("tea") ||
      act.includes("temple") ||
      act.includes("poem")
    ) {
      dq.socialDone = true;
    }
    if (
      cat === "co-tuong" ||
      cat === "dan-gian" ||
      act.includes("xiangqi") ||
      act.includes("oaq") ||
      act.includes("quiz") ||
      act.includes("proverb")
    ) {
      dq.mindDone = true;
    }
  }

  function awardSeniorityPoints(delta, actionKey, category, detail, extraMeta) {
    syncDailyQuestFlagsFromAction(actionKey, category);
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

  function unlockHeritageTableItem(itemId) {
    if (!Array.isArray(state.user.unlockedItems)) {
      state.user.unlockedItems = ["am-tu-sa"];
    }
    if (!state.user.unlockedItems.includes(itemId)) {
      state.user.unlockedItems.push(itemId);
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
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function sanitizeColorCss(val, fallback) {
    const raw = String(val || "").trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(raw) || /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(raw)) {
      return raw;
    }
    return fallback || "#2E5E4E";
  }

  function isUnsafeScamOrPiiText(raw) {
    const str = String(raw || "")
      .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 48))
      .trim();
    if (!str) return false;
    if (/<\s*\/?\s*(script|iframe|img|svg|object|embed|style|link|meta)\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon[a-z]{2,18}\s*=/i.test(str)) {
      return true;
    }
    const digitsCollapsed = str.replace(/[\s._\-()]/g, "");
    if (/\d{8,}/.test(digitsCollapsed)) return true;
    if (/https?:\/\/|www\.|zalo\.me|t\.me\/|bit\.ly|tinyurl|\.(vn|com|net|org|xyz|top|click|apk)\b/i.test(str)) {
      return true;
    }
    if (/(chuyển khoản|số tài khoản|nạp thẻ|trúng thưởng|mã otp|viện kiểm sát|khóa tài khoản|vay vốn|thần dược)/i.test(str)) {
      return true;
    }
    return false;
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

  function resolveMatchingVoiceClipId(text, opts) {
    const clips = (D && D.VOICE_CLIPS) || {};
    if (opts && opts.clipId && clips[opts.clipId]) {
      return opts.clipId;
    }
    const raw = String(text || "");
    if (!raw) return null;
    const cards = (D && D.TEMPLE_PEACE_CARDS) || [];
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (!c || !c.clipId || !clips[c.clipId]) continue;
      if (
        raw.includes(c.code) ||
        raw.includes(c.verse.slice(0, 18)) ||
        (Array.isArray(c.spaceCodes) && c.spaceCodes.some((sc) => sc && raw.includes(sc)))
      ) {
        return c.clipId;
      }
    }
    if (/nghỉ mắt một chút|nhìn ra xa 20 giây/i.test(raw) && clips["nhac-nghi-mat"]) return "nhac-nghi-mat";
    if (opts && opts.screenRead) {
      if (state.route === "home" && clips["chao-buoi-sang"]) return "chao-buoi-sang";
      if (state.route === "checkin") {
        return state.user.checkedInToday && clips["diem-danh-xong"] ? "diem-danh-xong" : "chao-buoi-sang";
      }
      if (state.route === "tearoom" && clips["chao-ban-tra"]) return "chao-ban-tra";
      if (state.route === "zen") {
        const spIdx = Number(state.zen && state.zen.spaceIdx) || 0;
        const mapZenClip = ["dan-chanh-dien", "dan-nha-tho-ho", "dan-vuon-thien"];
        const cid = mapZenClip[spIdx] || "dan-chanh-dien";
        if (clips[cid]) return cid;
      }
      if (state.route === "xiangqi" && clips["dan-co-tuong"]) return "dan-co-tuong";
      if (state.route === "games") {
        const cid = activeGameTab === "oaq" ? "dan-o-an-quan" : "dan-co-tuong";
        if (clips[cid]) return cid;
      }
    }
    return null;
  }

  function playPreRecordedVoiceClip(clipId, session, onFallback) {
    const clips = (D && D.VOICE_CLIPS) || {};
    const entry = clips[clipId];
    if (!entry || !entry.src) {
      if (typeof onFallback === "function") onFallback();
      return false;
    }
    window.__ttsState.mode = "recorded-vi-mp3";
    window.__ttsState.error = null;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = entry.src;
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
      activeTtsAudio = null;
      setReadBtnActive(false);
    });
    audio.addEventListener("error", () => {
      if (session !== ttsSessionId) return;
      activeTtsAudio = null;
      if (typeof onFallback === "function") {
        onFallback();
      } else {
        setReadBtnActive(false);
      }
    });
    audio.play().catch((err) => {
      if (session !== ttsSessionId) return;
      window.__ttsState.error = String(err);
      activeTtsAudio = null;
      if (typeof onFallback === "function") {
        onFallback();
      } else {
        setReadBtnActive(false);
      }
    });
    return true;
  }

  function speak(text, opts) {
    const chunks = splitVietnameseTtsChunks(text);
    const matchedClipId = resolveMatchingVoiceClipId(text, opts);
    if (!chunks.length && !matchedClipId) return;

    stopSpeaking();
    const session = ++ttsSessionId;
    const fullText = chunks.join(" ");
    window.__ttsState.lastText = fullText;
    setReadBtnActive(true);

    const preferRecorded = (state.settings && state.settings.voiceMode === "recorded") || Boolean(opts && opts.clipId);
    const viVoice = findNativeVietnameseVoice();

    if (opts && opts.announceToast) {
      showToast(
        matchedClipId && (preferRecorded || !viVoice)
          ? "Đang phát giọng đọc Tiếng Việt thu sẵn..."
          : "Đang đọc to bằng giọng Tiếng Việt..."
      );
    }

    if (matchedClipId && (preferRecorded || !viVoice)) {
      playPreRecordedVoiceClip(matchedClipId, session, () => {
        if (viVoice && fullText) {
          const fbUtter = new SpeechSynthesisUtterance(fullText);
          fbUtter.voice = viVoice;
          fbUtter.lang = viVoice.lang || "vi-VN";
          fbUtter.rate = 0.92;
          fbUtter.onend = () => {
            if (session === ttsSessionId) setReadBtnActive(false);
          };
          window.speechSynthesis.speak(fbUtter);
        } else if (chunks.length) {
          playCloudVietnameseTts(chunks, session);
        } else {
          setReadBtnActive(false);
        }
      });
      return;
    }

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
        if (session !== ttsSessionId) return;
        if (matchedClipId) {
          playPreRecordedVoiceClip(matchedClipId, session, () => playCloudVietnameseTts(chunks, session));
        } else {
          playCloudVietnameseTts(chunks, session);
        }
      };
      setTimeout(() => {
        if (session === ttsSessionId) window.speechSynthesis.speak(utter);
      }, 40);
      return;
    }

    // Fallback to offline pre-recorded voice clip first if matched, else natural Vietnamese MP3 stream
    if (matchedClipId) {
      playPreRecordedVoiceClip(matchedClipId, session, () => playCloudVietnameseTts(chunks, session));
      return;
    }
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
    const outfit = sanitizeColorCss((member && member.outfitColor) || "#2E5E4E", "#2E5E4E");
    const hat = (member && member.hat) || "none";
    const isFemale =
      (member && member.gender === "female") ||
      /^(Chị|Bà|Cô|Dì|Thím)/i.test(String((member && member.name) || ""));
    let accSvg = "";
    if (hat === "cap") {
      accSvg = `<path d="M9 14c2-5 10-6 18-4 2 .5 3 2 3 3.5H9z" fill="#4F6842"/><rect x="8" y="13" width="24" height="2.6" rx="1.3" fill="#3E5433"/>`;
    } else if (hat === "mu-tai-beo") {
      accSvg = `<ellipse cx="20" cy="14" rx="13.5" ry="3.2" fill="#3F5636"/><path d="M12 13.8c1-4.5 15-4.5 16 0z" fill="#556E48"/><line x1="12.5" y1="12.8" x2="27.5" y2="12.8" stroke="#2D3E26" stroke-width="1.2"/>`;
    } else if (hat === "khan-dong") {
      accSvg = `<path d="M11.5 15.2c0-4.6 3.8-7.4 8.5-7.4s8.5 2.8 8.5 7.4c-2.6-1.6-5.5-2.2-8.5-2.2s-5.9.6-8.5 2.2z" fill="#9E241C" stroke="#E3B448" stroke-width="1.1"/><path d="M14 12.2L20 9.6l6 2.6" fill="none" stroke="#F6D57A" stroke-width="1.1"/>`;
    } else if (hat === "non-la") {
      accSvg = `<polygon points="20,4 6,16 34,16" fill="#E9D59B" stroke="#B79452" stroke-width="1.2"/>`;
    } else if (hat === "glasses") {
      accSvg = `<circle cx="16.2" cy="18.5" r="2.7" fill="none" stroke="#8C5B1F" stroke-width="1.3"/><circle cx="23.8" cy="18.5" r="2.7" fill="none" stroke="#8C5B1F" stroke-width="1.3"/><line x1="18.9" y1="18.5" x2="21.1" y2="18.5" stroke="#8C5B1F" stroke-width="1.2"/>`;
    } else if (hat === "kinh-ram-tra") {
      accSvg = `<circle cx="16.2" cy="18.5" r="2.8" fill="rgba(184,115,36,0.48)" stroke="#5A3414" stroke-width="1.4"/><circle cx="23.8" cy="18.5" r="2.8" fill="rgba(184,115,36,0.48)" stroke="#5A3414" stroke-width="1.4"/><line x1="19" y1="18.3" x2="21" y2="18.3" stroke="#5A3414" stroke-width="1.3"/>`;
    } else if (hat === "scarf") {
      accSvg = `<path d="M13 24.8c2 2.2 12 2.2 14 0l1 2.8c-3 2-13 2-16 0z" fill="#9E2B20"/><rect x="21.5" y="26.5" width="3.6" height="7" rx="1.2" fill="#B23528"/>`;
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
      const arts = state.newspaper && state.newspaper.articles;
      const firstArt = Array.isArray(arts) && arts[0];
      if (firstArt) {
        return `Tờ Báo Sáng Tuổi Bạc. Bài nổi bật hôm nay: ${firstArt.title}. ${firstArt.body}`;
      }
    }
    if (state.route === "quiz") {
      const packQs = getActiveQuizPackQuestions();
      const q = packQs[state.quiz.idx];
      if (q && !state.quiz.finished) {
        return `Câu hỏi số ${state.quiz.idx + 1}: ${q.question}. Đáp án A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}.`;
      }
    }
    if (state.route === "games") {
      if (activeGameTab === "cadao") {
        const pg = (state.oaq && state.oaq.proverbGame) || {};
        const matched = (pg.matchedIds || []).length;
        return `Bàn Lật Thẻ Ca Dao Trí Nhớ. Bác đã ghép đúng ${matched} trên 6 cặp ca dao tục ngữ Việt Nam. Mời bác chạm mở 2 thẻ gỗ để ghép câu đầu với câu kết.`;
      }
      if (activeGameTab === "oaq") {
        const c = state.oaq.cells || [5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5, 10];
        return `Bàn Ô ăn quan dân gian. Hàng dưới của bác đang có ${state.oaq.scoreP} quân, Hàng trên đang có ${state.oaq.scoreAI} quân. Quan Trái còn ${c[11]} quân, Quan Phải còn ${c[5]} quân. Năm ô của bác lần lượt có ${c.slice(0, 5).join(", ")} viên sỏi.`;
      }
      return `Bàn Cờ tướng 9×10. ${state.xiangqi.status || "Mời bác chọn quân để đi."}`;
    }
    if (state.route === "zen") {
      const spIdx = Number(state.zen.spaceIdx) || 0;
      const sp = D.ZEN_SPACES[spIdx] || D.ZEN_SPACES[0];
      const seatNum =
        (typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx)
          ? Math.max(0, Math.min(19, Math.floor(state.zen.userCushionIdx)))
          : 2) + 1;
      const attendeeCount = buildTempleTenCushionAttendees().length;
      const cards = D.TEMPLE_PEACE_CARDS || [];
      const curCard = cards.length > 0 ? cards[(state.zen.peaceCardIdx || 0) % cards.length] : null;
      const cardTitle =
        curCard && Array.isArray(curCard.spaceCodes) && curCard.spaceCodes[spIdx]
          ? curCard.spaceCodes[spIdx]
          : curCard
          ? curCard.code
          : "";
      const spacePlaceLabel =
        spIdx === 1
          ? `Gian Bái Đường ${sp.name}`
          : spIdx === 2
          ? `Thiền Đường ${sp.name}`
          : `Chánh Điện ${sp.name}`;
      return `${spacePlaceLabel}. Đang có ${attendeeCount} trên 20 bác ngồi tĩnh tâm cùng nhau, bác đang ngồi chiếu số ${seatNum}. ${
        curCard ? `Tờ lộc hiện tại: ${cardTitle}. ${curCard.advice}` : sp.quote
      }`;
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
    let cleanedBase = String(rawBaseName || "")
      .replace(/[<>"'`\\\u0000-\u001F]/g, " ")
      .replace(/^(anh|chị|bác|cô|bà|chú|cụ|ông)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);
    if (!cleanedBase || isUnsafeScamOrPiiText(cleanedBase)) {
      if (cleanedBase && isUnsafeScamOrPiiText(cleanedBase)) {
        showToast("Tên hiển thị không được chứa số điện thoại, đường link hoặc mã lạ.");
      }
      cleanedBase = state.user.baseName || "Tám Vườn";
    }
    const safeAge = Math.max(45, Math.min(105, Math.round(Number(rawAge) || 65)));
    state.user.honorific = hon;
    state.user.baseName = cleanedBase;
    state.user.name = `${hon} ${cleanedBase}`;
    state.user.age = safeAge;
    if (provId && D.PROVINCES.some((p) => p.id === provId)) {
      state.user.provinceId = provId;
    }
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

    const bnavTarget =
      state.route === "home"
        ? "home"
        : state.route === "tearoom"
        ? "tearoom"
        : state.route === "games" || state.route === "xiangqi"
        ? "games"
        : state.route === "profile" || state.route === "leaderboard"
        ? "profile"
        : "";
    document.querySelectorAll("[data-bnav]").forEach((btn) => {
      const isAct = btn.dataset.bnav === bnavTarget;
      btn.classList.toggle("active", isAct);
      if (isAct) {
        btn.setAttribute("aria-current", "page");
      } else {
        btn.removeAttribute("aria-current");
      }
    });

    if (els.simRender) {
      els.simRender.textContent = "Đồ họa: Full 2.5D (TLBB)";
      els.simRender.classList.add("active");
    }
    if (els.simFont) {
      els.simFont.textContent = `Cỡ chữ: ${state.settings.xlFont ? "24px (Cực lớn)" : "20px (Chuẩn)"}`;
      els.simFont.classList.toggle("active", state.settings.xlFont);
    }
    if (els.simDict) {
      els.simDict.textContent = `Sổ từ điển tự học (${state.phoneticDict.length})`;
    }
  }

  function getActiveForfeitableMatch() {
    const o = state.oaq;
    const isOaqEnded = o && o.cells[5] === 0 && o.cells[11] === 0;
    if (o && o.inProgress && !isOaqEnded) {
      return {
        kind: "oaq",
        label: o.mode === "async" ? "ván Ô ăn quan treo qua link" : "ván Ô ăn quan với Máy"
      };
    }
    const x = state.xiangqi;
    if (x && x.mode !== "puzzle" && x.inProgress && !x.solved && Array.isArray(x.moveLog) && x.moveLog.length > 0) {
      return {
        kind: "xiangqi",
        label:
          x.mode === "async"
            ? "ván Cờ tướng qua link"
            : x.mode === "local2p"
            ? "ván Cờ tướng 2 người"
            : x.mode === "cup"
            ? "trận Cúp Cờ Tướng Đồng Ngũ"
            : "ván Cờ tướng với Máy"
      };
    }
    return null;
  }

  function isCurrentlyInsideMatchContext(active) {
    if (!active) return false;
    if (active.kind === "oaq") {
      return state.route === "games" && activeGameTab === "oaq";
    }
    if (active.kind === "xiangqi") {
      if (state.route === "xiangqi") return true;
      if (state.route === "games" && activeGameTab === "cotuong") return true;
      if (state.route === "tearoom" && state.teaRoom.subView === "table" && getCurrentRoom().id === "phong-co") return true;
    }
    return false;
  }

  function armBrowserBackMatchGuard(kind) {
    if (matchHistoryGuardArmed) return;
    try {
      if (window.history && typeof window.history.pushState === "function") {
        window.history.pushState({ tuoibacGuard: kind }, "");
        matchHistoryGuardArmed = true;
      }
    } catch (e) {}
  }

  function getCupUnitDisplayName() {
    const cup = (state.xiangqi && state.xiangqi.cup) || {};
    if (cup.unitName) return cup.unitName;
    if (state.auth && state.auth.primaryUnitLabel) return state.auth.primaryUnitLabel;
    const joinedId = state.social && Array.isArray(state.social.joinedGroupIds) && state.social.joinedGroupIds[0];
    if (joinedId) {
      const grp = ((state.social && state.social.groups) || []).find((g) => g.id === joinedId);
      if (grp) return grp.shortName || grp.name;
    }
    return `Đoàn Cờ ${getProvince(state.user.provinceId).short}`;
  }

  function getCupCurrentRival(cupState) {
    const cup = cupState || {};
    const r = Math.max(0, Math.min(2, Number(cup.round) || 0));
    const list = (D.TOURNAMENT_RIVAL_CLUBS || []).filter((c) => c.round === r);
    const matched = list.find((c) => c.id === cup.rivalId) || list[0] || (D.TOURNAMENT_RIVAL_CLUBS || [])[0];
    if (matched && cup.rivalId !== matched.id) {
      cup.rivalId = matched.id;
    }
    return (
      matched || {
        id: "rv-1",
        round: r,
        roundLabel: r === 0 ? "Vòng Tứ Kết" : r === 1 ? "Vòng Bán Kết" : "Trận Chung Kết",
        aiLevel: r === 0 ? "easy" : "club",
        clubName: "CLB Cờ Hưu Trí Sông Hàn",
        captain: "Anh Tấn · 66t (Đà Nẵng)",
        motto: "Khai cuộc điềm đạm, giao lưu kết bạn"
      }
    );
  }

  function resetXiangqiMatchState(nextMode) {
    if (!XQ) return;
    const x = state.xiangqi;
    x.mode = nextMode;
    x.selected = null;
    x.lastMove = null;
    x.hintMove = null;
    x.prevBoard = null;
    x.solved = false;
    x.inProgress = false;
    x.forfeitedPendingReload = false;
    x.moveLog = [];
    if (nextMode === "puzzle") {
      const curPz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
      x.board = XQ.buildBoardFromList(curPz.pieces);
      x.turn = "red";
      x.puzzleStep = 0;
      x.status = `${curPz.name} — Đỏ đi tiên: chạm quân Đỏ rồi chạm chấm xanh để chiếu Tướng.`;
    } else if (nextMode === "cup") {
      if (!x.cup || typeof x.cup !== "object") {
        x.cup = createDefaultState().xiangqi.cup;
      }
      x.cup.active = true;
      x.cup.justWonRound = false;
      if (!x.cup.unitName) x.cup.unitName = getCupUnitDisplayName();
      const rival = getCupCurrentRival(x.cup);
      x.aiLevel = rival.aiLevel || (x.cup.round === 0 ? "easy" : "club");
      x.board = XQ.createInitialBoard();
      x.turn = "red";
      x.status = `${rival.roundLabel}: Đại diện ${x.cup.unitName} gặp ${rival.clubName} (${rival.captain}) — Bác cầm Đỏ đi tiên!`;
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

  function forfeitActiveMatchAsLoss(kind) {
    if (!state.user.gameStats) {
      state.user.gameStats = createDefaultState().user.gameStats;
    }
    if (kind === "oaq" && state.oaq.inProgress) {
      cancelOrCommitOaqAnimation(false);
      state.user.gameStats.oaqLosses = (Number(state.user.gameStats.oaqLosses) || 0) + 1;
      state.user.gameStats.winStreak = 0;
      const keepMode = state.oaq.mode === "async" ? "async" : "ai";
      state.oaq = Object.assign({}, createDefaultState().oaq, {
        mode: keepMode,
        statusText: "Ván trước đã tính THUA do rời ván giữa chừng. Mời chọn ô đi ván mới."
      });
      if (keepMode === "async") ensureOaqAsyncMatch();
      matchHistoryGuardArmed = false;
      logMemberBehavior("oaq_forfeit", "dan-gian", "Thoát giữa ván Ô ăn quan (tính Thua)", {
        eventType: "game_forfeit",
        module: "games",
        gameKind: "oaq"
      });
      saveState();
      updateGlobalChrome();
      return "Đã kết thúc và tính THUA (+1 trận thua) ván Ô ăn quan.";
    }
    if (kind === "xiangqi" && state.xiangqi.inProgress) {
      state.user.gameStats.xiangqiLosses = (Number(state.user.gameStats.xiangqiLosses) || 0) + 1;
      state.user.gameStats.winStreak = 0;
      const keepMode = state.xiangqi.mode === "puzzle" ? "ai" : state.xiangqi.mode || "ai";
      resetXiangqiMatchState(keepMode);
      state.xiangqi.status = "Ván trước đã tính THUA do thoát giữa chừng. Mời bác đánh ván mới!";
      matchHistoryGuardArmed = false;
      logMemberBehavior("xiangqi_forfeit", "co-tuong", "Thoát giữa ván Cờ tướng (tính Thua)", {
        eventType: "game_forfeit",
        module: "xiangqi",
        gameKind: "xiangqi"
      });
      saveState();
      updateGlobalChrome();
      return "Đã kết thúc và tính THUA (+1 trận thua) ván Cờ tướng.";
    }
    return "";
  }

  function confirmMatchExitOrStay(onProceed, actionDesc) {
    const active = getActiveForfeitableMatch();
    if (!active || !isCurrentlyInsideMatchContext(active)) {
      onProceed();
      return;
    }
    openDialog(
      "Cảnh báo đang dở ván cờ",
      `
      <div class="forfeit-warning-box">
        <p>Bác đang đánh dở <strong>${escHtml(active.label)}</strong>.</p>
        <p style="margin-top:6px;">Nếu <strong>${escHtml(actionDesc || "thoát ra ngoài")}</strong> ngay lúc này, ván hiện tại sẽ tự động kết thúc và tính là <strong>THUA (+1 trận thua)</strong>.</p>
      </div>
      <div class="btn-row" style="margin-top:14px;">
        <button type="button" class="btn-jade" id="btn-stay-in-match">Ở lại đánh tiếp ván này</button>
        <button type="button" class="btn-danger" id="btn-forfeit-and-leave">Chấp nhận THUA &amp; Rời đi</button>
      </div>
      `
    );
    document.getElementById("btn-stay-in-match").addEventListener("click", () => {
      closeDialog();
    });
    document.getElementById("btn-forfeit-and-leave").addEventListener("click", () => {
      const msg = forfeitActiveMatchAsLoss(active.kind);
      closeDialog();
      if (msg) showToast(msg);
      onProceed();
    });
  }

  function executeNavigate(route) {
    stopSpeaking();
    clearInterval(quizTimerId);
    clearInterval(cooldownTickId);
    if ((state.route === "tearoom" || state.route === "profile") && route !== state.route) {
      window.TeaRoomScene.dispose();
    }
    if (state.route === "games" && route !== "games") {
      cancelOrCommitOaqAnimation(true);
      if (proverbFlipTimerId) {
        clearTimeout(proverbFlipTimerId);
        proverbFlipTimerId = null;
      }
    }
    if (state.route === "watch" && route !== "watch") {
      if (watchAnimId) {
        cancelAnimationFrame(watchAnimId);
        watchAnimId = null;
      }
    }
    if (state.route === "zen" && route !== "zen") {
      if (autoMuyuTimerId) {
        clearInterval(autoMuyuTimerId);
        autoMuyuTimerId = null;
      }
      if (zenCooldownTimerId) {
        clearInterval(zenCooldownTimerId);
        zenCooldownTimerId = null;
      }
      const existingSlip = document.querySelector(".red-slip-backdrop");
      if (existingSlip) existingSlip.remove();
      if (window.TempleScene3D) {
        window.TempleScene3D.dispose();
      }
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

  function navigate(route) {
    if (route === state.route) {
      executeNavigate(route);
      return;
    }
    confirmMatchExitOrStay(() => executeNavigate(route), "chuyển sang mục khác");
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

  const ADMIN_HASH_KEY = "tuoi_bac_admin_hash_v1";
  const ADMIN_SESSION_KEY = "tuoi_bac_admin_session_v1";
  const ADMIN_LOCKOUT_KEY = "tuoi_bac_admin_lockout_v1";
  const ADMIN_MAX_ATTEMPTS = 5;
  const ADMIN_LOCKOUT_MS = 60 * 1000;
  const DEFAULT_ADMIN_PIN_HASH = "12bac726287ff3aa";

  function computeAdminPinHash(rawPin) {
    const clean = String(rawPin || "").trim();
    return fnv32Hex("tb_adm_v1|" + clean, 0x811c9dc5) + fnv32Hex("tb_adm_s2|" + clean, 0x9e3779b9);
  }

  function computeStretchedAdminHash(rawPin, salt) {
    const clean = String(rawPin || "").trim();
    const s = String(salt || "tb26");
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < 2500; i++) {
      h1 = parseInt(fnv32Hex(`${s}|${i}|${clean}|${h2}`, h1), 16) >>> 0;
      h2 = parseInt(fnv32Hex(`${h1}|${clean}|${s}|${i}`, h2), 16) >>> 0;
    }
    return `v2$${s}$${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
  }

  function verifyAdminPinInput(rawPin) {
    const clean = String(rawPin || "").trim();
    if (!clean) return false;
    const stored = getActiveAdminPinHash();
    if (stored.startsWith("v2$")) {
      const parts = stored.split("$");
      const salt = parts[1] || "tb26";
      return computeStretchedAdminHash(clean, salt) === stored;
    }
    return computeAdminPinHash(clean) === stored;
  }

  function readAdminLockoutState() {
    try {
      const raw = JSON.parse(localStorage.getItem(ADMIN_LOCKOUT_KEY) || "null");
      if (raw && typeof raw === "object") {
        return {
          fails: Math.max(0, Number(raw.fails) || 0),
          lockedUntil: Math.max(0, Number(raw.lockedUntil) || 0)
        };
      }
    } catch (e) {}
    return { fails: 0, lockedUntil: 0 };
  }

  function writeAdminLockoutState(st) {
    try {
      localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(st));
    } catch (e) {}
  }

  function getActiveAdminPinHash() {
    try {
      const saved = localStorage.getItem(ADMIN_HASH_KEY);
      return saved && saved.length >= 16 ? saved : DEFAULT_ADMIN_PIN_HASH;
    } catch (e) {
      return DEFAULT_ADMIN_PIN_HASH;
    }
  }

  function isAdminUnlocked() {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function lockAdminSession() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {}
    if (state.newspaper) {
      state.newspaper.adminOpen = false;
      saveState();
    }
  }

  function openAdminUnlockModal(onSuccess) {
    openDialog(
      "Xác thực Quản Trị Viên (Admin)",
      `
      <div class="surface-panel warm">
        <p style="font-size:0.9rem;">Khu vực duyệt RSS Báo Sáng, giám sát vận hành UAT, xuất dữ liệu AI (<code>.jsonl</code>) và cấu hình Supabase cố định được khóa riêng để hội viên không bấm nhầm.</p>
        <label class="field-label">
          Mã khóa Quản trị viên
          <input type="password" inputmode="numeric" autocomplete="off" class="input-lg" id="admin-pin-input" placeholder="Nhập mã khóa Admin..." />
        </label>
        <div id="admin-pin-err" style="font-size:0.86rem; color:#B42318; font-weight:700;" hidden>Mã khóa chưa đúng. Vui lòng kiểm tra lại.</div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btn-submit-admin-pin">${ico("shield")}<span>Mở khóa Admin</span></button>
        <button type="button" class="btn-secondary" id="btn-cancel-admin-pin">Đóng</button>
      </div>
      `
    );
    const pinIn = document.getElementById("admin-pin-input");
    const errEl = document.getElementById("admin-pin-err");
    const showErrMsg = (msg) => {
      if (!errEl) return;
      errEl.textContent = msg;
      errEl.hidden = false;
    };
    const initLock = readAdminLockoutState();
    if (initLock.lockedUntil > Date.now()) {
      const waitSec = Math.ceil((initLock.lockedUntil - Date.now()) / 1000);
      showErrMsg(`Đã nhập sai quá ${ADMIN_MAX_ATTEMPTS} lần. Tạm khóa thêm ${waitSec} giây để chống dò mật khẩu.`);
    }
    const tryUnlock = () => {
      const now = Date.now();
      const lockSt = readAdminLockoutState();
      if (lockSt.lockedUntil > now) {
        const waitSec = Math.ceil((lockSt.lockedUntil - now) / 1000);
        showErrMsg(`Tạm khóa bảo vệ Admin (${waitSec} giây). Vui lòng thử lại sau.`);
        return;
      }
      const val = (pinIn && pinIn.value ? pinIn.value : "").trim();
      if (!verifyAdminPinInput(val)) {
        const nextFails = (lockSt.lockedUntil > 0 && lockSt.lockedUntil <= now ? 0 : lockSt.fails) + 1;
        if (nextFails >= ADMIN_MAX_ATTEMPTS) {
          writeAdminLockoutState({ fails: nextFails, lockedUntil: now + ADMIN_LOCKOUT_MS });
          showErrMsg(`Nhập sai ${ADMIN_MAX_ATTEMPTS} lần liên tiếp. Khóa bảo vệ trong 60 giây.`);
          trackTelemetryDirect("admin_lockout", state.route, "pin_bruteforce_locked", {});
        } else {
          writeAdminLockoutState({ fails: nextFails, lockedUntil: 0 });
          showErrMsg(`Mã khóa chưa đúng (còn ${ADMIN_MAX_ATTEMPTS - nextFails} lần thử).`);
          trackTelemetryDirect("admin_auth_fail", state.route, "wrong_admin_pin", {});
        }
        return;
      }
      writeAdminLockoutState({ fails: 0, lockedUntil: 0 });
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch (e) {}
      trackTelemetryDirect("admin_auth_ok", state.route, "unlocked_admin_session", {});
      closeDialog();
      showToast("Đã mở quyền Quản trị viên trong phiên làm việc này.");
      if (typeof onSuccess === "function") onSuccess();
    };
    document.getElementById("btn-submit-admin-pin").addEventListener("click", tryUnlock);
    document.getElementById("btn-cancel-admin-pin").addEventListener("click", closeDialog);
    if (pinIn) {
      pinIn.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          tryUnlock();
        }
      });
      setTimeout(() => pinIn.focus(), 60);
    }
  }

  function openChangeAdminPinModal() {
    if (!isAdminUnlocked()) {
      openAdminUnlockModal(openChangeAdminPinModal);
      return;
    }
    openDialog(
      "Đổi mã khóa Quản Trị Viên",
      `
      <div class="surface-panel">
        <label class="field-label">
          Mã khóa Admin hiện tại
          <input type="password" autocomplete="off" class="input-lg" id="adm-old-pin" placeholder="Nhập mã hiện tại..." />
        </label>
        <label class="field-label">
          Mã khóa Admin mới (từ 4 ký tự trở lên)
          <input type="password" autocomplete="off" class="input-lg" id="adm-new-pin" placeholder="Nhập mã mới..." />
        </label>
      </div>
      <div class="btn-row">
        <button type="button" class="btn-jade" id="btn-save-new-admin-pin">Lưu mã khóa mới</button>
        <button type="button" class="btn-secondary" id="btn-cancel-new-admin-pin">Hủy</button>
      </div>
      `
    );
    document.getElementById("btn-cancel-new-admin-pin").addEventListener("click", closeDialog);
    document.getElementById("btn-save-new-admin-pin").addEventListener("click", () => {
      const oldVal = (document.getElementById("adm-old-pin").value || "").trim();
      const newVal = (document.getElementById("adm-new-pin").value || "").trim();
      if (!verifyAdminPinInput(oldVal)) {
        showToast("Mã khóa hiện tại chưa chính xác.");
        return;
      }
      if (newVal.length < 4) {
        showToast("Mã khóa mới cần tối thiểu 4 ký tự.");
        return;
      }
      try {
        const salt = Math.random().toString(36).slice(2, 8) || "tb26";
        localStorage.setItem(ADMIN_HASH_KEY, computeStretchedAdminHash(newVal, salt));
        writeAdminLockoutState({ fails: 0, lockedUntil: 0 });
      } catch (e) {}
      closeDialog();
      showToast("Đã cập nhật mã khóa Quản trị viên mới!");
    });
  }

  function openRealtimeStatusModal() {
    const st = RT ? RT.getStatus() : { connected: false, providerName: "Cục bộ", totalOtherPeers: 0, clientId: "local" };
    const savedCfg = RT ? RT.getSupabaseConfig() : null;
    const baseShare = getPublicBaseUrl();
    const room = getCurrentRoom();
    const inviteSameTable = `${baseShare}?phong=${encodeURIComponent(room.id)}&ban=${state.teaRoom.tableIdx + 1}`;
    const adminOpen = isAdminUnlocked();

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

      ${
        adminOpen
          ? `
      <div class="surface-panel">
        <h3>Cấu hình Supabase cố định (Admin)</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Chạy tệp <code>supabase_schema.sql</code> trên dự án Supabase rồi dán Project URL + Public Anon Key để lưu dài hạn điểm danh, ván cờ treo, thơ, sớ cầu an và báo cáo an toàn:</p>
        <label class="field-label">
          Supabase Project URL
          <input type="url" class="input-lg" id="sb-url-in" placeholder="https://xxxx.supabase.co" value="${escHtml(savedCfg ? savedCfg.url : "")}" />
        </label>
        <label class="field-label">
          Supabase Public Anon Key
          <input type="text" class="input-lg" id="sb-key-in" placeholder="Dán anon public key của dự án..." value="${escHtml(savedCfg ? savedCfg.anonKey : "")}" />
        </label>
        <div id="sb-test-result-box" style="font-size:0.86rem;" hidden></div>
        <div class="btn-row">
          <button type="button" class="btn-jade" id="btn-test-sb-cfg">Kiểm tra bảng SQL</button>
          <button type="button" class="btn-primary" id="btn-save-sb-cfg">Lưu &amp; Bật Supabase</button>
        </div>
        <button type="button" class="btn-secondary" id="btn-reset-sb-cfg">Chuyển về kênh WSS mặc định</button>
      </div>
      `
          : `
      <div class="surface-panel">
        <h3>Máy chủ lưu trữ dài hạn (Dành cho Quản trị viên)</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Hệ thống đang tự đồng bộ trực tuyến miễn phí 24/7. Khu vực gắn khóa Supabase cố định được khóa bảo vệ để các bác yên tâm sinh hoạt.</p>
        <button type="button" class="btn-secondary" id="btn-unlock-rt-admin">${ico("shield")}<span>Mở khóa cấu hình máy chủ (Admin)</span></button>
      </div>
      `
      }
      `
    );

    document.getElementById("btn-copy-rt-url").addEventListener("click", () => {
      trackEvent("share_link_created");
      copyTextSafe(inviteSameTable, "Đã sao chép link bàn trà để mở trên điện thoại thứ 2!");
    });

    const unlockRtBtn = document.getElementById("btn-unlock-rt-admin");
    if (unlockRtBtn) {
      unlockRtBtn.addEventListener("click", () => {
        openAdminUnlockModal(() => openRealtimeStatusModal());
      });
      return;
    }

    const testBtn = document.getElementById("btn-test-sb-cfg");
    const testBox = document.getElementById("sb-test-result-box");
    if (testBtn && RT && typeof RT.testSupabaseConnection === "function") {
      testBtn.addEventListener("click", async () => {
        const u = document.getElementById("sb-url-in").value.trim();
        const k = document.getElementById("sb-key-in").value.trim();
        if (testBox) {
          testBox.hidden = false;
          testBox.textContent = "Đang kiểm tra kết nối và bảng dữ liệu trên Supabase...";
        }
        const res = await RT.testSupabaseConnection(u, k);
        if (testBox) {
          testBox.style.color = res.ok ? "#1F5F46" : "#B42318";
          testBox.style.fontWeight = "700";
          testBox.textContent = res.message;
        }
      });
    }

    document.getElementById("btn-save-sb-cfg").addEventListener("click", () => {
      const u = document.getElementById("sb-url-in").value.trim();
      const k = document.getElementById("sb-key-in").value.trim();
      if (!u || !k) {
        showToast("Vui lòng điền đủ cả Project URL và Anon Key của Supabase.");
        return;
      }
      RT.saveSupabaseConfig(u, k);
      closeDialog();
      showToast("Đã lưu cấu hình Supabase Realtime & lưu trữ bền vững!");
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
    const age = getUserAge();
    const showPwaCard = !isStandalonePwa() && !state.settings.pwaBannerDismissed;
    const prog = getSeniorityProgress();
    const gs = state.user.gameStats || {};
    const totalWins = (Number(gs.oaqWins) || 0) + (Number(gs.xiangqiWins) || 0) + (Number(gs.proverbWins) || 0);
    ensureDailyRollover(state);
    const dq = state.user.dailyQuests || {};
    if (state.user.checkedInToday) dq.morningDone = true;
    const doneQuestCount = [dq.morningDone, dq.socialDone, dq.mindDone].filter(Boolean).length;
    const canClaimDailyChest = doneQuestCount === 3 && !dq.chestClaimed;

    const hourNow = new Date().getHours();
    const timeGreeting =
      hourNow < 11
        ? "Buổi sáng an lành · Ấm trà đầu ngày đã pha"
        : hourNow < 14
        ? "Buổi trưa thư thái · Nghỉ ngơi dưỡng sức"
        : hourNow < 18
        ? "Buổi chiều ấm áp · Trà thơm đợi bạn hiền"
        : "Buổi tối tĩnh tâm · An nhiên bên tách trà";

    els.main.innerHTML = `
      <section class="section-block">
        <div class="home-pavilion-hero">
          <div class="home-pavilion-meta">
            <span class="home-time-pill">${ico("tea", "ico-sm")}<span>${timeGreeting}</span></span>
            <span class="home-streak-pill num">${escHtml(prov.short)} · Chuỗi ${state.user.streakDays || 1} ngày</span>
          </div>
          <div class="home-pavilion-title-row">
            <h1>Chào ${escHtml(state.user.name)} · <span class="num">${age}t</span></h1>
            <button type="button" class="btn-mini" id="btn-home-edit-identity">${ico("user", "ico-sm")}<span>Đổi Tên · Tuổi</span></button>
          </div>
          <p class="lead-copy">Mời ${pron} chọn góc sinh hoạt hôm nay. Chữ nét đậm, nút rộng rãi, thảnh thơi trò chuyện cùng bạn đồng niên.</p>
        </div>

        <div class="passcard-banner ${state.auth.isRegistered ? "verified" : ""}" id="home-passcard-banner">
          <div class="passcard-head">
            <strong>${escHtml(prog.current.name)}</strong>
            <span class="cohort-pill ${escHtml(prog.cohort.cls)}">${escHtml(prog.cohort.tag)} · ${prog.points} XP</span>
          </div>
          <div class="seniority-progress-wrap">
            <div class="seniority-progress-track">
              <div class="seniority-progress-fill" style="width:${prog.percent}%"></div>
            </div>
            <small style="font-size:0.86rem; color:var(--ink-secondary);">
              ${
                prog.isGuest
                  ? `Mở Thẻ 10 giây để lưu tên, nhận <strong>+35 XP &amp; +15 Xu</strong>${totalWins > 0 ? ` · Đã thắng <strong class="num">${totalWins}</strong> ván` : ""}.`
                  : `${prog.next ? `Còn <strong class="num">${prog.xpNeededForNext}</strong> XP lên ${escHtml(prog.next.name)}` : "Đã đạt đỉnh cao sinh hoạt"} · Thắng cờ/trò chơi: <strong class="num">${totalWins}</strong> ván`
              }
            </small>
          </div>
          <div class="btn-row">
            <button type="button" class="btn-${state.auth.isRegistered ? "jade" : "primary"}" id="btn-home-open-auth">
              ${ico("card")}
              <span>${state.auth.isRegistered ? "Thẻ QR Hội Viên" : "Mở Thẻ Lên Tầng 1"}</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-home-open-96titles" data-go="leaderboard">
              ${ico("trophy")}
              <span>Bảng Danh Hiệu</span>
            </button>
          </div>
        </div>

        <div class="daily-quest-card" id="home-daily-quest-card">
          <div class="passcard-head">
            <strong>Sổ Tay 3 Niềm Vui Hôm Nay</strong>
            <span class="badge-tag ${doneQuestCount === 3 ? "jade" : "amber"} num">${doneQuestCount}/3 việc</span>
          </div>
          <div class="daily-quest-list">
            <button type="button" class="daily-quest-row ${dq.morningDone ? "is-done" : ""}" data-go="${state.user.checkedInToday ? "newspaper" : "checkin"}">
              <span>1. Khởi đầu bình an (Điểm danh hoặc Đọc báo)</span>
              <span class="daily-quest-status">${dq.morningDone ? "Đã xong" : "Mở ngay"}</span>
            </button>
            <button type="button" class="daily-quest-row ${dq.socialDone ? "is-done" : ""}" data-go="tearoom">
              <span>2. Kết nối tình thân (Trà đàm, Thơ hoặc Hoa đăng)</span>
              <span class="daily-quest-status">${dq.socialDone ? "Đã xong" : "Mở ngay"}</span>
            </button>
            <button type="button" class="daily-quest-row ${dq.mindDone ? "is-done" : ""}" data-go="games">
              <span>3. Rèn trí minh mẫn (Cờ, Ca dao hoặc Đố vui)</span>
              <span class="daily-quest-status">${dq.mindDone ? "Đã xong" : "Mở ngay"}</span>
            </button>
          </div>
          ${
            canClaimDailyChest
              ? `<button type="button" class="btn-primary" id="btn-claim-daily-chest">${ico("award")}<span>Nhận Lộc Ngày Mới (+12 Xu · +15 XP)</span></button>`
              : dq.chestClaimed
              ? `<div style="font-size:0.86rem; color:var(--accent-jade); font-weight:700;">Đã nhận trọn vẹn Rương Lộc Ngày Mới hôm nay. Hẹn gặp lại ${pron} sáng mai!</div>`
              : `<small style="font-size:0.84rem; color:var(--ink-secondary);">Hoàn thành đủ 3 niềm vui để mở Rương Lộc <strong>+12 Xu &amp; +15 XP</strong> mỗi ngày.</small>`
          }
        </div>

        ${
          showPwaCard
            ? `
          <div class="pwa-install-card" id="pwa-install-card">
            <div class="pwa-install-top">
              <img src="icons/icon-192.png" alt="Biểu tượng ứng dụng Tuổi Bạc" class="pwa-app-icon" />
              <div>
                <strong>Đặt Quán Trà ra màn hình chính</strong>
                <div style="font-size:0.86rem; color:var(--ink-secondary);">Mở 1 chạm như ứng dụng riêng trên điện thoại.</div>
              </div>
            </div>
            <div class="btn-row">
              <button type="button" class="btn-jade" id="btn-pwa-install">${ico("download")}<span>${deferredPwaPrompt ? "Cài ra màn hình ngay" : "Hướng dẫn cài nhanh"}</span></button>
              <button type="button" class="btn-secondary" id="btn-pwa-hide">Để sau</button>
            </div>
          </div>
        `
            : ""
        }
      </section>

      <section class="section-block">
        <h2>4 Việc Chính Mỗi Ngày</h2>
        <div class="home-hero-grid-4">
          <button type="button" class="home-core-card is-primary" data-go="checkin">
            <span class="home-main-icon">${ico("sun", "ico-lg")}</span>
            <strong>${state.user.checkedInToday ? "Bản đồ Điểm danh" : "Điểm danh sáng nay"}</strong>
            <small>${state.user.checkedInToday ? `${prov.short} đã sáng đèn` : "Báo bình an cho con cháu"}</small>
          </button>

          <button type="button" class="home-core-card is-jade" data-go="tearoom">
            <span class="home-main-icon">${ico("tea", "ico-lg")}</span>
            <strong>Vào Quán Trà 3D</strong>
            <small>${escHtml(getCurrentRoom().shortName)} · ${getCurrentRoom().tables.length} bàn mở</small>
          </button>

          <button type="button" class="home-core-card" data-go="newspaper">
            <span class="home-main-icon">${ico("paper", "ico-lg")}</span>
            <strong>Đọc Tờ Báo Sáng</strong>
            <small>${state.newspaper.articles.length} tin chữ to dễ đọc</small>
          </button>

          <button type="button" class="home-core-card is-wood" data-go="games">
            <span class="home-main-icon">${ico("xiangqi", "ico-lg")}</span>
            <strong>Đánh Cờ &amp; Ô Ăn Quan</strong>
            <small>Cờ tướng 9×10 &amp; Ô ăn quan</small>
          </button>
        </div>
      </section>

      <section class="section-block">
        <h2>Góc Sinh Hoạt Cộng Đồng</h2>
        <div class="module-grid">
          <button type="button" class="module-tile" data-go="groups">
            ${ico("users")}
            <strong>Hội Đồng Ngũ &amp; Bạn</strong>
            <span class="sub">${countOnlineFriendsNow()} bạn đang trực tuyến</span>
          </button>

          <button type="button" class="module-tile" data-go="zen">
            ${ico("lotus")}
            <strong>Chùa Quê &amp; Từ Đường</strong>
            <span class="sub">Chánh điện, Nhà thờ họ, Hồ sen</span>
          </button>

          <button type="button" class="module-tile" data-go="poetry">
            ${ico("poem")}
            <strong>Ngâm thơ &amp; Tặng hoa</strong>
            <span class="sub">Thơ lục bát &amp; đàn tranh</span>
          </button>

          <button type="button" class="module-tile" data-go="quiz">
            ${ico("quiz")}
            <strong>Đố vui hôm nay</strong>
            <span class="sub">5 câu rèn trí nhớ vui</span>
          </button>

          <button type="button" class="module-tile" data-go="watch">
            ${ico("tv")}
            <strong>Phòng xem chung</strong>
            <span class="sub">Dưỡng sinh 8h &amp; Hài 20h</span>
          </button>

          <button type="button" class="module-tile" data-go="health">
            ${ico("heart")}
            <strong>Trợ lý sức khỏe</strong>
            <span class="sub">Nhắc thuốc, huyết áp, 115</span>
          </button>
        </div>

        <div class="btn-row" style="margin-top:4px;">
          <button type="button" class="btn-secondary" id="btn-home-feedback">${ico("feedback", "ico-sm")}<span>Góp ý nhanh</span></button>
          <button type="button" class="btn-secondary" data-go="privacy">${ico("shield", "ico-sm")}<span>Riêng tư &amp; Admin</span></button>
          <button type="button" class="btn-secondary" data-go="family">${ico("family", "ico-sm")}<span>Góc Con Cái</span></button>
          <button type="button" class="btn-secondary" data-go="xiangqi">${ico("xiangqi", "ico-sm")}<span>Bàn Cờ 9×10</span></button>
        </div>
      </section>
    `;

    els.main.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.id === "btn-home-open-96titles") {
          activeLeaderTab = "Cay32";
        }
        navigate(btn.dataset.go);
      });
    });

    const homeFeedbackBtn = document.getElementById("btn-home-feedback");
    if (homeFeedbackBtn) {
      homeFeedbackBtn.addEventListener("click", () => openFeedbackModal("home"));
    }

    const claimChestBtn = document.getElementById("btn-claim-daily-chest");
    if (claimChestBtn) {
      claimChestBtn.addEventListener("click", () => {
        if (!state.user.dailyQuests || state.user.dailyQuests.chestClaimed) return;
        state.user.dailyQuests.chestClaimed = true;
        playTempleBell();
        const giftedPastry = (state.user.streakDays || 0) >= 7 ? unlockHeritageTableItem("banh-dau-xanh") : false;
        addXu(12, giftedPastry ? "Mở Rương Lộc + Tặng Đĩa bánh đậu xanh men lam!" : "Mở Rương Lộc 3 Niềm Vui Hôm Nay");
        awardSeniorityPoints(15, "daily_chest_claimed", "diem-danh", "Hoàn thành trọn vẹn Sổ Tay 3 Niềm Vui Hôm Nay (+15 XP)");
        saveState();
        renderHome();
      });
    }

    const homeOpenAuth = document.getElementById("btn-home-open-auth");
    if (homeOpenAuth) {
      homeOpenAuth.addEventListener("click", () => openMemberAuthModal());
    }
    const editIdBtn = document.getElementById("btn-home-edit-identity");
    if (editIdBtn) {
      editIdBtn.addEventListener("click", () => {
        activeProfileMainTab = "identity";
        navigate("profile");
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
      const uat = params.get("uat");
      if (uat) {
        const cleanUat = String(uat).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
        if (cleanUat) {
          state.settings.uatTag = cleanUat;
          saveState();
          trackTelemetryDirect("uat_cohort", state.route || "home", "uat_link_opened", { uatTag: cleanUat });
        }
      }
      const admin = params.get("admin");
      const dash = params.get("dash");
      if (admin || dash) {
        activePrivacySubTab = "overview-dash";
        state.route = "privacy";
        if (admin && !isAdminUnlocked()) {
          pendingAdminAutoPrompt = true;
        }
        saveState();
        return;
      }
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
      if (state.settings && state.settings.voiceMode === "recorded" && D.VOICE_CLIPS && D.VOICE_CLIPS["diem-danh-xong"]) {
        speak(D.VOICE_CLIPS["diem-danh-xong"].text, { clipId: "diem-danh-xong" });
      }
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

    if (isUnsafeScamOrPiiText(text)) {
      return {
        blocked: true,
        reason: "Hệ thống tự động chặn số điện thoại, số tài khoản, đường link hoặc từ khóa lừa đảo để bảo vệ các bác."
      };
    }

    const appliedDict = [];
    state.phoneticDict.forEach((entry) => {
      if (!entry || !entry.wrong || !entry.right || isUnsafeScamOrPiiText(entry.right)) return;
      const escaped = String(entry.wrong).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "gi");
      if (rx.test(text)) {
        text = text.replace(rx, String(entry.right));
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

    if (isUnsafeScamOrPiiText(text) || isUnsafeScamOrPiiText(aiPolished)) {
      return {
        blocked: true,
        reason: "Hệ thống tự động chặn số điện thoại, số tài khoản, đường link hoặc từ khóa lừa đảo để bảo vệ các bác."
      };
    }

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
      outfitId: state.user.outfitId,
      outfitColor: getOutfit(state.user.outfitId).color,
      hat: state.user.accessoryId || "glasses",
      item: state.user.itemId,
      titleFrameId: state.user.titleFrameId || "tri-am",
      badge: "Trực tuyến",
      isRealPeer: true
    };
  }

  function refreshRealtimeAppearance() {
    if (!RT) return;
    if (state.teaRoom && state.teaRoom.subView === "table") {
      RT.joinTableChannel(getCurrentTable().id, buildMyRealtimePeerInfo(), state.privacy.consentRealtimePresence);
    }
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
      const rawTitle = (document.getElementById("host-tbl-name-in").value || "").replace(/[<>]/g, "").trim();
      const rawTopic = (document.getElementById("host-tbl-topic-in").value || "").replace(/[<>]/g, "").trim();
      const welcomeLine = (document.getElementById("host-tbl-welcome-in").value || "").replace(/[<>]/g, "").trim();
      if (!rawTitle) {
        showToast("Vui lòng nhập tên bàn đàm đạo.");
        return;
      }
      if (isUnsafeScamOrPiiText(`${rawTitle} ${rawTopic} ${welcomeLine}`)) {
        trackTelemetryDirect("chat_blocked", "tearoom", "auto_blocked_table_rename", {
          category: "safety_alert",
          detail: "Chặn tự động SĐT, đường link hoặc từ khóa lừa đảo khi đặt tên bàn trà"
        });
        showToast("Vì an toàn, tên bàn và lời chào không được chứa số điện thoại, số tài khoản hoặc đường link.");
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

  function renderGraphicsModeSwitchHtml(opts) {
    const o = opts || {};
    const badgeHtml = `<span class="stage-badge" id="render-mode-badge">Đồ họa: Full 2.5D (TLBB)</span>`;
    if (o.innerOnly) return badgeHtml;
    return `
      <div class="tearoom-controls-row" style="flex-wrap:wrap;">
        ${badgeHtml}
        ${o.extraHtml || ""}
      </div>
    `;
  }

  function bindRenderChoiceButtons() {}

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
        activeTableIdx: state.teaRoom.tableIdx,
        table: getTableWithRealPeers(table),
        userName: state.user.name,
        userAge: getUserAge(),
        userGender: state.user.honorific === "Chị" ? "female" : "male",
        userProvince: getProvince(state.user.provinceId).short,
        userOutfitColor: outfit.color,
        userOutfitId: outfit.id,
        userItem: state.user.itemId,
        userAccessory: state.user.accessoryId || "none",
        userTitleFrame: state.user.titleFrameId || "tri-am"
      },
      () => {
        state.settings.autoFallbacked = true;
        state.settings.preferredRender = "2.5d";
        saveState();
        updateGlobalChrome();
        document.querySelectorAll("[data-render-choice]").forEach((b) => {
          const is25 = b.dataset.renderChoice === "2.5d";
          b.classList.toggle("active", is25);
          b.setAttribute("aria-pressed", String(is25));
        });
        showToast("Thiết bị chưa hỗ trợ WebGL mượt — đã tự động chuyển sang Full 2.5D nhẹ.");
      }
    );

    bindRenderChoiceButtons(renderTeaRoom);
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
      ${renderGraphicsModeSwitchHtml({
        extraHtml: `<button type="button" class="stage-badge-btn" id="btn-toggle-overview-wide">Góc siêu rộng</button>`
      })}
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

      <!-- Người đang ngồi cùng bàn (Thu gọn gọn gàng để không che sân khấu 3D) -->
      <details class="tb-details">
        <summary>
          <span>Cùng bàn (${table.members.length + 1}/5): ${escHtml(
            table.members
              .map((m) => m.name.split(" ").slice(-1)[0] || m.name)
              .slice(0, 3)
              .join(", ")
          )}</span>
          <span class="tb-details-hint">${table.realPeerCount ? `${table.realPeerCount} người thật` : "Chạm xem"}</span>
        </summary>
        <div class="member-pill-list" style="margin-top:8px;">
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
      </details>

      <!-- 3D / 2.5D Controls Above Stage -->
      ${renderGraphicsModeSwitchHtml()}

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

      <!-- Non-verbal Tea Rituals -->
      <div class="ritual-row">
        <button type="button" class="ritual-btn" id="btn-pour-tea">${ico("tea", "ico-sm")}<span>Rót trà mời</span></button>
        <button type="button" class="ritual-btn" id="btn-snack-tea">${ico("flower", "ico-sm")}<span>Mời hạt dưa</span></button>
        <button type="button" class="ritual-btn" id="btn-poem-tea">${ico("poem", "ico-sm")}<span>Đố câu ca dao</span></button>
      </div>

      <!-- Khung giao tiếp thu gọn 2 tab: Nói nhanh & Sticker vs Gõ chữ & Giọng nói -->
      <div class="surface-panel">
        <div class="tab-bar" role="tablist" aria-label="Cách gửi lời chào trên bàn trà">
          <button type="button" class="tab-btn ${activeTeaInputTab === "quick" ? "active" : ""}" id="tea-in-tab-quick">Nói nhanh &amp; Sticker</button>
          <button type="button" class="tab-btn ${activeTeaInputTab === "compose" ? "active" : ""}" id="tea-in-tab-compose">Gõ chữ &amp; Nói giọng</button>
        </div>
        <div class="cooldown-note" id="tea-cooldown-note" ${coolLeft > 0 ? "" : "hidden"}>Bác nhấp ngụm trà nghe các bác khác nói nhé... (${coolLeft}s)</div>

        <div id="tea-pane-quick" ${activeTeaInputTab === "quick" ? "" : "hidden"}>
          <div class="reply-stack" id="tea-reply-stack" style="margin-bottom:10px;">
            ${suggestions
              .map(
                (s, idx) =>
                  `<button type="button" class="reply-btn" data-reply="${escHtml(s)}" ${coolLeft > 0 ? "disabled" : ""}>${idx + 1}. "${escHtml(s)}"</button>`
              )
              .join("")}
          </div>
          <div class="sticker-grid" role="group" aria-label="Bộ Sticker Quán Trà 1 chạm" id="tea-sticker-tray">
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

        <div id="tea-pane-compose" ${activeTeaInputTab === "compose" ? "" : "hidden"} style="display:${activeTeaInputTab === "compose" ? "flex" : "none"}; flex-direction:column; gap:10px;">
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
      </div>
    `;

    bindRoomSwitcherEvents();
    mountRoomSceneView("table", room, baseTable, 0);

    const teaInQuick = document.getElementById("tea-in-tab-quick");
    const teaInCompose = document.getElementById("tea-in-tab-compose");
    const syncTeaInputTabUi = (tab) => {
      activeTeaInputTab = tab;
      teaInQuick.classList.toggle("active", tab === "quick");
      teaInCompose.classList.toggle("active", tab === "compose");
      const pQuick = document.getElementById("tea-pane-quick");
      const pComp = document.getElementById("tea-pane-compose");
      if (pQuick) pQuick.hidden = tab !== "quick";
      if (pComp) {
        pComp.hidden = tab !== "compose";
        pComp.style.display = tab === "compose" ? "flex" : "none";
      }
    };
    if (teaInQuick) teaInQuick.addEventListener("click", () => syncTeaInputTabUi("quick"));
    if (teaInCompose) teaInCompose.addEventListener("click", () => syncTeaInputTabUi("compose"));

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
      switchFastBtn.addEventListener("click", () => {
        confirmMatchExitOrStay(() => switchNextTableFast(), "đổi sang bàn cờ khác");
      });
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
      confirmMatchExitOrStay(() => {
        state.teaRoom.articleTable = null;
        state.teaRoom.activeNewspaperRef = null;
        state.teaRoom.subView = "lobby";
        if (RT) RT.leaveTableChannel();
        saveState();
        renderTeaRoom();
      }, "quay ra danh sách bàn");
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
        const tblId = (getCurrentTable() && getCurrentTable().id) || "";
        trackTelemetryDirect("safety_report", "tearoom", "report_scam_money", {
          category: "safety_alert",
          tableId: tblId,
          detail: "Báo cáo gửi số tài khoản / xin tiền trong bàn trà"
        });
        if (RT && typeof RT.publishSafetyReport === "function") {
          RT.publishSafetyReport({ tableKey: tblId, reason: "scam_money" });
        }
        closeDialog();
        showToast("Đã ghi nhận báo cáo an toàn. Kiểm duyệt viên sẽ xử lý ngay.");
      });
      document.getElementById("confirm-report-2").addEventListener("click", () => {
        const tblId = (getCurrentTable() && getCurrentTable().id) || "";
        trackTelemetryDirect("safety_report", "tearoom", "report_spam_ads", {
          category: "safety_alert",
          tableId: tblId,
          detail: "Báo cáo quảng cáo thuốc / thực phẩm chức năng"
        });
        if (RT && typeof RT.publishSafetyReport === "function") {
          RT.publishSafetyReport({ tableKey: tblId, reason: "spam_ads" });
        }
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
          trackTelemetryDirect("chat_blocked", "tearoom", "auto_blocked_typed", {
            category: "safety_alert",
            detail: "Chặn tự động SĐT, số tài khoản hoặc đường dẫn lạ trong ô chat"
          });
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
      const newEntry = {
        wrong: res.learnedCandidate.wrong,
        right: res.learnedCandidate.right,
        hits: 1,
        learnedBy: `Tự học (${state.user.name})`
      };
      state.phoneticDict.push(newEntry);
      if (RT && typeof RT.publishPhoneticEntry === "function") {
        RT.publishPhoneticEntry(newEntry);
      }
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
      trackTelemetryDirect("chat_blocked", "tearoom", "auto_blocked_voice", {
        category: "safety_alert",
        detail: "Chặn tự động nội dung nhạy cảm khi nhập bằng giọng nói"
      });
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

  function syncMorningRssFeedOnce() {
    if (RT && typeof RT.getApprovedArticles === "function") {
      const remoteArts = RT.getApprovedArticles() || [];
      if (remoteArts.length > 0 && state.newspaper && Array.isArray(state.newspaper.articles)) {
        const existingIds = new Set(state.newspaper.articles.map((a) => a.id));
        let addedRemote = false;
        remoteArts.forEach((ra) => {
          if (ra && ra.id && !existingIds.has(ra.id)) {
            state.newspaper.articles.unshift(ra);
            existingIds.add(ra.id);
            addedRemote = true;
          }
        });
        if (addedRemote) saveState();
      }
    }
    if (morningRssFetchedOnce) return;
    morningRssFetchedOnce = true;
    if (typeof fetch !== "function") return;
    fetch("./assets/morning-rss.json", { cache: "no-store" })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((payload) => {
        if (!payload || !Array.isArray(payload.items) || !state.newspaper) return;
        const knownTitles = new Set(
          []
            .concat(state.newspaper.articles || [])
            .concat(state.newspaper.drafts || [])
            .map((x) => stripVnAccents((x && x.title) || "").toLowerCase())
        );
        let added = 0;
        payload.items.forEach((it) => {
          if (!it || !it.title || !it.body) return;
          const normTitle = stripVnAccents(it.title).toLowerCase();
          if (knownTitles.has(normTitle)) return;
          knownTitles.add(normTitle);
          state.newspaper.drafts.push({
            id: it.id || `rss_${Date.now()}_${added}`,
            category: it.category || "doi-song",
            tag: it.tag || "Điểm báo 05:30 (RSS nháp)",
            title: it.title,
            source: it.source || "Điểm báo tích cực 05:30",
            body: it.body,
            detailPoints: Array.isArray(it.detailPoints) ? it.detailPoints : [],
            topicKeyword: it.topicKeyword || "thời sự"
          });
          added += 1;
        });
        if (added > 0) {
          saveState();
          if (state.route === "newspaper") {
            const actTag = (document.activeElement && document.activeElement.tagName) || "";
            if (actTag !== "INPUT" && actTag !== "TEXTAREA") renderNewspaper();
          }
        }
      })
      .catch(() => {});
  }

  function renderNewspaper() {
    syncMorningRssFeedOnce();
    const pron = getUserPronoun();
    const selectedCat = state.newspaper.selectedCategory || "all";
    const searchQ = state.newspaper.searchQuery || "";
    const hasFilter = selectedCat !== "all" || Boolean(searchQ.trim());
    const visibleArticles = getFilteredNewspaperArticles();
    const adminUnlocked = isAdminUnlocked();
    const showAdminRssBox = Boolean(state.newspaper.adminOpen && adminUnlocked);

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <h1>Tờ Báo Sáng</h1>
        <button type="button" class="btn-mini" id="btn-toggle-rss-admin">${
          !adminUnlocked
            ? `${ico("shield", "ico-sm")}<span>Duyệt RSS (Admin)</span>`
            : showAdminRssBox
            ? "Đóng góc Admin RSS"
            : `Duyệt RSS (${state.newspaper.drafts.length})`
        }</button>
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
        showAdminRssBox
          ? `
        <div class="surface-panel warm">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <h3>Góc Admin duyệt RSS 05:30 (1 chạm)</h3>
            <button type="button" class="btn-mini" id="btn-lock-rss-admin">Khóa lại</button>
          </div>
          <p style="font-size:0.88rem;">GitHub Action 05:30 sáng tự kéo RSS báo chính thống, lọc tin tích cực lưu vào <code>assets/morning-rss.json</code>. Quản trị viên bấm duyệt để đăng đồng bộ lên Báo Sáng:</p>
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
      if (!isAdminUnlocked()) {
        openAdminUnlockModal(() => {
          state.newspaper.adminOpen = true;
          saveState();
          renderNewspaper();
        });
        return;
      }
      state.newspaper.adminOpen = !state.newspaper.adminOpen;
      saveState();
      renderNewspaper();
    });

    const lockRssAdminBtn = document.getElementById("btn-lock-rss-admin");
    if (lockRssAdminBtn) {
      lockRssAdminBtn.addEventListener("click", () => {
        lockAdminSession();
        showToast("Đã khóa góc quản trị RSS.");
        renderNewspaper();
      });
    }

    els.main.querySelectorAll(".approve-rss-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!isAdminUnlocked()) return;
        const idx = Number(btn.dataset.idx);
        const [approved] = state.newspaper.drafts.splice(idx, 1);
        if (approved) {
          approved.tag = String(approved.tag || "Điểm báo sáng").replace(" (RSS nháp)", "");
          approved.category = approved.category || "doi-song";
          state.newspaper.articles.unshift(approved);
          if (RT && typeof RT.publishApprovedArticle === "function") {
            RT.publishApprovedArticle(approved);
          }
          trackTelemetryDirect("rss_approved", "newspaper", "approve_morning_rss", {
            articleId: approved.id,
            title: approved.title
          });
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

  // ==================== MODULE 4: DAILY QUIZ (25 ROTATING QUESTIONS · 5 PACKS · 50/50 HINT) ====================
  function getActiveQuizPackQuestions() {
    const all = D.QUIZ_QUESTIONS || [];
    const pIdx = Math.max(0, Math.min(4, Number(state.quiz && state.quiz.packIdx) || 0));
    const filtered = all.filter((q) => Number(q.packIdx || 0) === pIdx);
    return filtered.length > 0 ? filtered : all.slice(0, 5);
  }

  function renderQuiz() {
    clearInterval(quizTimerId);
    const qState = state.quiz;
    if (!Array.isArray(qState.hiddenOpts)) qState.hiddenOpts = [];
    const packs = D.QUIZ_PACKS || [{ idx: 0, title: "Bộ 1 · Ký Ức & Quê Hương" }];
    const curPackIdx = Math.max(0, Math.min(packs.length - 1, Number(qState.packIdx) || 0));
    const curPack = packs[curPackIdx] || packs[0];
    const packQuestions = getActiveQuizPackQuestions();
    const total = packQuestions.length;

    const packBarHtml = `
      <div class="temple-cam-bar" role="tablist" aria-label="Chọn bộ câu đố vui">
        ${packs
          .map(
            (pk) =>
              `<button type="button" class="temple-cam-btn ${pk.idx === curPackIdx ? "active" : ""}" data-qpack="${pk.idx}">${escHtml(pk.title.split("·")[0].trim())} · ${escHtml((pk.title.split("·")[1] || "").trim())}</button>`
          )
          .join("")}
      </div>
    `;

    if (qState.finished) {
      const nextPackIdx = (curPackIdx + 1) % packs.length;
      els.main.innerHTML = `
        <h1>Hoàn thành Đố vui hôm nay</h1>
        ${packBarHtml}
        <div class="surface-panel jade">
          <h2>Kết quả ${escHtml(curPack.title)}</h2>
          <p class="num" style="font-size:1.5rem; font-weight:700;">${qState.score} điểm</p>
          <p>Trả lời thong thả sau 25 giây vẫn nhận đủ 60% điểm mỗi câu đúng. Mời bác thử sức tiếp bộ chủ đề mới nhé!</p>
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-next-pack-quiz">Sang ${escHtml(packs[nextPackIdx].title)}</button>
            <button type="button" class="btn-secondary" id="btn-retry-quiz">Chơi lại bộ này</button>
          </div>
        </div>
      `;
      els.main.querySelectorAll("[data-qpack]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.quiz = { packIdx: Number(btn.dataset.qpack) || 0, idx: 0, score: 0, selectedOpt: null, hiddenOpts: [], hintUsed: false, finished: false, timeLeft: 25 };
          saveState();
          renderQuiz();
        });
      });
      document.getElementById("btn-next-pack-quiz").addEventListener("click", () => {
        state.quiz = { packIdx: nextPackIdx, idx: 0, score: 0, selectedOpt: null, hiddenOpts: [], hintUsed: false, finished: false, timeLeft: 25 };
        saveState();
        renderQuiz();
      });
      document.getElementById("btn-retry-quiz").addEventListener("click", () => {
        state.quiz = { packIdx: curPackIdx, idx: 0, score: 0, selectedOpt: null, hiddenOpts: [], hintUsed: false, finished: false, timeLeft: 25 };
        saveState();
        renderQuiz();
      });
      return;
    }

    const safeIdx = Math.max(0, Math.min(total - 1, Number(qState.idx) || 0));
    qState.idx = safeIdx;
    const q = packQuestions[safeIdx];
    const hasAnswered = qState.selectedOpt !== null;
    const letters = ["A", "B", "C", "D"];

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <h1>Đố vui minh mẫn</h1>
        <span class="badge-tag amber num">Câu ${safeIdx + 1}/${total} · ${qState.score}đ</span>
      </div>

      ${packBarHtml}

      <div class="surface-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <span class="badge-tag">${escHtml(q.tag)}</span>
          <span class="num" id="quiz-timer-lbl" style="font-weight:700; color:${qState.timeLeft > 0 ? "var(--accent-terracotta)" : "var(--accent-jade)"};">
            ${qState.timeLeft > 0 ? `Tham khảo ${qState.timeLeft} giây` : "Thong thả chọn (vẫn +60đ)"}
          </span>
        </div>

        <h2 style="line-height:1.4;">${escHtml(q.question)}</h2>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-read-quiz">
            ${ico("speaker")}
            <span>Đọc to câu hỏi</span>
          </button>
          ${
            !hasAnswered
              ? `<button type="button" class="btn-jade" id="btn-quiz-5050" ${qState.hintUsed ? "disabled" : ""}>
                  ${ico("eye")}
                  <span>${qState.hintUsed ? "Đã lọc 2 câu nhiễu" : "Gợi ý 50/50"}</span>
                </button>`
              : ""
          }
        </div>

        <div class="quiz-options">
          ${q.options
            .map((opt, i) => {
              const isElim = !hasAnswered && qState.hiddenOpts.includes(i);
              let cls = isElim ? "is-eliminated" : "";
              if (hasAnswered) {
                if (i === q.correctIndex) cls = "correct";
                else if (i === qState.selectedOpt) cls = "wrong";
              }
              return `
                <button type="button" class="quiz-opt-btn ${cls}" data-opt="${i}" ${hasAnswered || isElim ? "disabled" : ""}>
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
              ${safeIdx + 1 < total ? "Sang câu tiếp theo →" : "Xem tổng điểm &amp; Nhận thưởng"}
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;

    els.main.querySelectorAll("[data-qpack]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextP = Number(btn.dataset.qpack) || 0;
        if (nextP === curPackIdx) return;
        state.quiz = { packIdx: nextP, idx: 0, score: 0, selectedOpt: null, hiddenOpts: [], hintUsed: false, finished: false, timeLeft: 25 };
        saveState();
        renderQuiz();
      });
    });

    if (!hasAnswered && qState.timeLeft > 0) {
      quizTimerId = setInterval(() => {
        if (state.route !== "quiz") {
          clearInterval(quizTimerId);
          return;
        }
        state.quiz.timeLeft = Math.max(0, state.quiz.timeLeft - 1);
        const lbl = document.getElementById("quiz-timer-lbl");
        if (lbl) {
          if (state.quiz.timeLeft > 0) {
            lbl.textContent = `Tham khảo ${state.quiz.timeLeft} giây`;
          } else {
            lbl.style.color = "var(--accent-jade)";
            lbl.textContent = "Thong thả chọn (vẫn +60đ)";
            clearInterval(quizTimerId);
          }
        }
      }, 1000);
    }

    document.getElementById("btn-read-quiz").addEventListener("click", () => {
      speak(`${q.question}. A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}`);
    });

    const btn5050 = document.getElementById("btn-quiz-5050");
    if (btn5050) {
      btn5050.addEventListener("click", () => {
        if (state.quiz.hintUsed) return;
        const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== q.correctIndex);
        state.quiz.hiddenOpts = wrongIndices.slice(0, 2);
        state.quiz.hintUsed = true;
        saveState();
        showToast("Đã gạch bớt 2 phương án sai để bác dễ chọn!");
        renderQuiz();
      });
    }

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
            packIdx: curPackIdx,
            score: state.quiz.score
          });
        } else {
          syncDailyQuestFlagsFromAction("quiz_try", "dan-gian");
          trackTelemetryDirect("folk_game", "quiz", "quiz_wrong_try", {
            packIdx: curPackIdx,
            questionIdx: safeIdx,
            detail: `Thử câu đố vui số ${safeIdx + 1}`
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
          state.quiz.hiddenOpts = [];
          state.quiz.hintUsed = false;
          state.quiz.timeLeft = 25;
        } else {
          state.quiz.finished = true;
          addXu(5, `Hoàn thành ${curPack.title}`);
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

    // Hết hai Quan -> tàn cuộc, thu toàn bộ quân Dân còn lại trên bàn về giỏ mỗi bên
    if (cells[5] === 0 && cells[11] === 0) {
      const remP = cells.slice(0, 5).reduce((a, b) => a + b, 0);
      const remAI = cells.slice(6, 11).reduce((a, b) => a + b, 0);
      for (let i = 0; i < 5; i++) cells[i] = 0;
      for (let i = 6; i < 11; i++) cells[i] = 0;
      state.oaq.scoreP += remP;
      state.oaq.scoreAI += remAI;
    } else {
      // Rải cứu bàn nếu một bên hết sạch 5 ô Dân khi vẫn còn Quan
      const pSum = cells.slice(0, 5).reduce((a, b) => a + b, 0);
      if (pSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
        for (let i = 0; i < 5; i++) cells[i] = 1;
      }
      const aiSum = cells.slice(6, 11).reduce((a, b) => a + b, 0);
      if (aiSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
        for (let i = 6; i < 11; i++) cells[i] = 1;
      }
    }

    state.oaq.cells = cells;
    state.oaq.selectedCell = null;
    return cells;
  }

  function buildProverbMemoryDeck(seedNum) {
    const allPairs = D.PROVERB_PAIRS || [];
    const offset = ((Number(seedNum) || 0) * 6) % Math.max(1, allPairs.length);
    const chosen = [];
    for (let i = 0; i < 6 && i < allPairs.length; i++) {
      chosen.push(allPairs[(offset + i) % allPairs.length]);
    }
    const cards = [];
    chosen.forEach((pv) => {
      cards.push({ uid: `${pv.id}_h`, pairId: pv.id, role: "Vế đầu", text: pv.head, full: `${pv.head}, ${pv.tail}`, meaning: pv.meaning });
      cards.push({ uid: `${pv.id}_t`, pairId: pv.id, role: "Vế kết", text: pv.tail, full: `${pv.head}, ${pv.tail}`, meaning: pv.meaning });
    });
    // Deterministic Fisher-Yates shuffle mixed with seed so every deal feels fresh
    let s = (Number(seedNum) || 1) * 9301 + 49297;
    for (let i = cards.length - 1; i > 0; i--) {
      s = (s * 233280 + 12345) % 2147483647;
      const j = s % (i + 1);
      const tmp = cards[i];
      cards[i] = cards[j];
      cards[j] = tmp;
    }
    return cards;
  }

  function renderProverbMemoryTab(container) {
    if (!state.oaq.proverbGame || !Array.isArray(state.oaq.proverbGame.deck) || state.oaq.proverbGame.deck.length !== 12) {
      const nextSeed = ((state.oaq.proverbGame && state.oaq.proverbGame.roundSeed) || 0) + 1;
      state.oaq.proverbGame = {
        deck: buildProverbMemoryDeck(nextSeed),
        flipped: [],
        matchedIds: [],
        moves: 0,
        roundSeed: nextSeed,
        lastMatchedPair: null
      };
      saveState();
    }
    const pg = state.oaq.proverbGame;
    const matchedSet = new Set(pg.matchedIds || []);
    const allCleared = matchedSet.size >= 6;
    const proverbWins = (state.user.gameStats && state.user.gameStats.proverbWins) || 0;

    container.innerHTML = `
      <div class="surface-panel">
        <div class="passcard-head">
          <strong>Ghép Cặp Ca Dao &amp; Tục Ngữ (6 cặp)</strong>
          <span class="badge-tag jade num">Đã ghép ${matchedSet.size}/6 · Thắng ${proverbWins} ván</span>
        </div>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Chạm mở lần lượt 2 thẻ gỗ để nối <strong>Vế đầu</strong> với <strong>Vế kết</strong> của câu ca dao. Không tính giờ gấp gáp.</p>

        ${
          pg.lastMatchedPair
            ? `
          <div class="surface-panel warm" style="padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="color:var(--accent-jade);">"${escHtml(pg.lastMatchedPair.full)}"</strong>
              <button type="button" class="btn-mini" id="btn-read-matched-proverb">${ico("speaker", "ico-sm")}<span>Nghe đọc</span></button>
            </div>
            <small style="font-size:0.86rem; color:var(--ink-secondary);">${escHtml(pg.lastMatchedPair.meaning)}</small>
          </div>
        `
            : ""
        }

        <div class="proverb-board-grid" role="group" aria-label="Bàn 12 thẻ gỗ ca dao tục ngữ">
          ${pg.deck
            .map((card, idx) => {
              const isMatched = matchedSet.has(card.pairId);
              const isFlipped = isMatched || (pg.flipped || []).includes(idx);
              const cls = isMatched ? "is-matched" : isFlipped ? "is-flipped" : "";
              return `
                <button type="button" class="proverb-tile-btn ${cls}" data-pv-idx="${idx}" ${isMatched ? "disabled" : ""}>
                  ${
                    isFlipped
                      ? `<small style="font-size:0.74rem; opacity:0.78;">${escHtml(card.role)}</small><span>${escHtml(card.text)}</span>`
                      : `<span>Thẻ ${idx + 1}</span><small style="font-size:0.74rem; opacity:0.85;">Chạm mở</small>`
                  }
                </button>
              `;
            })
            .join("")}
        </div>

        ${
          allCleared
            ? `
          <div class="surface-panel jade">
            <strong>Tuyệt vời! Bác đã ghép trọn vẹn 6 cặp ca dao sau ${pg.moves} lượt lật!</strong>
            <button type="button" class="btn-primary" id="btn-proverb-next-round">Chia ván Ca dao mới (Đổi câu khác)</button>
          </div>
        `
            : `<button type="button" class="btn-secondary" id="btn-proverb-reset">Xáo bộ thẻ Ca dao mới</button>`
        }
      </div>
    `;

    const readPvBtn = container.querySelector("#btn-read-matched-proverb");
    if (readPvBtn && pg.lastMatchedPair) {
      readPvBtn.addEventListener("click", () => {
        speak(`${pg.lastMatchedPair.full}. Ý nghĩa: ${pg.lastMatchedPair.meaning}`, { announceToast: true });
      });
    }

    const startFreshDeck = () => {
      if (proverbFlipTimerId) {
        clearTimeout(proverbFlipTimerId);
        proverbFlipTimerId = null;
      }
      const nextSeed = (Number(pg.roundSeed) || 0) + 1;
      state.oaq.proverbGame = {
        deck: buildProverbMemoryDeck(nextSeed),
        flipped: [],
        matchedIds: [],
        moves: 0,
        roundSeed: nextSeed,
        lastMatchedPair: null
      };
      saveState();
      renderProverbMemoryTab(container);
    };

    const nextRoundBtn = container.querySelector("#btn-proverb-next-round");
    if (nextRoundBtn) nextRoundBtn.addEventListener("click", startFreshDeck);
    const resetPvBtn = container.querySelector("#btn-proverb-reset");
    if (resetPvBtn) resetPvBtn.addEventListener("click", startFreshDeck);

    container.querySelectorAll("[data-pv-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (proverbFlipTimerId) return;
        const idx = Number(btn.dataset.pvIdx);
        if ((pg.flipped || []).includes(idx)) return;
        const card = pg.deck[idx];
        if (!card || matchedSet.has(card.pairId)) return;

        playWoodPieceClack(false);
        pg.flipped.push(idx);

        if (pg.flipped.length === 2) {
          pg.moves = (Number(pg.moves) || 0) + 1;
          const c1 = pg.deck[pg.flipped[0]];
          const c2 = pg.deck[pg.flipped[1]];
          if (c1 && c2 && c1.pairId === c2.pairId) {
            pg.matchedIds.push(c1.pairId);
            pg.lastMatchedPair = { full: c1.full, meaning: c1.meaning };
            pg.flipped = [];
            playTempleBell();
            if (pg.matchedIds.length >= 6) {
              if (!state.user.gameStats) state.user.gameStats = createDefaultState().user.gameStats;
              state.user.gameStats.proverbWins = (Number(state.user.gameStats.proverbWins) || 0) + 1;
              checkGameWinMilestones();
              const giftedBetel = unlockHeritageTableItem("khay-trau-cau");
              addXu(6, giftedBetel ? "Ghép trọn 6 cặp Ca dao + Tặng Cơi trầu đồng cánh phượng!" : "Ghép trọn 6 cặp Ca dao Trí nhớ!");
              awardSeniorityPoints(6, "proverb_memory_win", "dan-gian", "Hoàn thành bàn Lật Thẻ Ca Dao Trí Nhớ", {
                eventType: "folk_game",
                module: "games",
                gameKind: "proverb_memory",
                moves: pg.moves
              });
            } else {
              awardSkillPoints("folk_games", 2);
              showToast(`Khớp đúng: "${c1.full}"!`);
            }
            saveState();
            renderProverbMemoryTab(container);
            return;
          }

          renderProverbMemoryTab(container);
          proverbFlipTimerId = setTimeout(() => {
            proverbFlipTimerId = null;
            pg.flipped = [];
            saveState();
            if (state.route === "games" && activeGameTab === "cadao") {
              const host = document.getElementById("game-tab-body");
              if (host) renderProverbMemoryTab(host);
            }
          }, 950);
          return;
        }

        saveState();
        renderProverbMemoryTab(container);
      });
    });
  }

  function pickSmartOaqAiMove(cells, scoreP, scoreAI, forPlayerSide, difficulty) {
    const candidateCells = forPlayerSide ? [0, 1, 2, 3, 4] : [6, 7, 8, 9, 10];
    const valid = candidateCells.filter((idx) => (cells[idx] || 0) > 0);
    if (valid.length === 0) return null;

    const scoredMoves = [];
    valid.forEach((cIdx) => {
      [-1, 1].forEach((dirStep) => {
        const sim = buildOaqMoveTimeline(cells, scoreP, scoreAI, cIdx, dirStep, forPlayerSide, "", "");
        if (!sim || !sim.finalSnapshot) return;
        const myGain = forPlayerSide
          ? sim.finalSnapshot.scoreP - scoreP
          : sim.finalSnapshot.scoreAI - scoreAI;
        const nextCells = sim.finalSnapshot.cells;
        // 1-ply opponent reply lookahead
        const oppIndices = forPlayerSide ? [6, 7, 8, 9, 10] : [0, 1, 2, 3, 4];
        let maxOppReply = 0;
        oppIndices.forEach((oppIdx) => {
          if ((nextCells[oppIdx] || 0) <= 0) return;
          [-1, 1].forEach((oppDir) => {
            const oppSim = buildOaqMoveTimeline(
              nextCells,
              sim.finalSnapshot.scoreP,
              sim.finalSnapshot.scoreAI,
              oppIdx,
              oppDir,
              !forPlayerSide,
              "",
              ""
            );
            if (!oppSim || !oppSim.finalSnapshot) return;
            const oppGain = forPlayerSide
              ? oppSim.finalSnapshot.scoreAI - sim.finalSnapshot.scoreAI
              : oppSim.finalSnapshot.scoreP - sim.finalSnapshot.scoreP;
            if (oppGain > maxOppReply) maxOppReply = oppGain;
          });
        });

        const totalEval = myGain * 2.25 - maxOppReply * 1.05 + (myGain >= 10 ? 2.5 : 0);
        scoredMoves.push({
          cell: cIdx,
          dirStep,
          myGain,
          maxOppReply,
          totalEval
        });
      });
    });

    if (scoredMoves.length === 0) {
      return { cell: valid[0], dirStep: 1, myGain: 0 };
    }
    scoredMoves.sort((a, b) => b.totalEval - a.totalEval || b.myGain - a.myGain);

    if (!forPlayerSide && difficulty === "easy" && scoredMoves.length > 2) {
      // Gentle relaxed AI picks a moderate move so newcomers enjoy smooth rallies
      const midIdx = Math.min(scoredMoves.length - 1, 1 + Math.floor(Math.random() * Math.min(3, scoredMoves.length - 1)));
      return scoredMoves[midIdx];
    }
    return scoredMoves[0];
  }

  function renderGames() {
    els.main.innerHTML = `
      <h1>Trò chơi dân gian &amp; Rèn trí nhớ</h1>
      <div class="tab-bar" role="tablist" aria-label="Chọn trò chơi dân gian">
        <button type="button" class="tab-btn ${activeGameTab === "oaq" ? "active" : ""}" id="tab-oaq">Ô ăn quan</button>
        <button type="button" class="tab-btn ${activeGameTab === "cadao" ? "active" : ""}" id="tab-cadao">Ca dao Trí nhớ</button>
        <button type="button" class="tab-btn ${activeGameTab === "cotuong" ? "active" : ""}" id="tab-cotuong">Cờ tướng 9×10</button>
      </div>
      <div id="game-tab-body"></div>
    `;

    document.getElementById("tab-oaq").addEventListener("click", () => {
      if (activeGameTab === "oaq") return;
      if (proverbFlipTimerId) {
        clearTimeout(proverbFlipTimerId);
        proverbFlipTimerId = null;
      }
      confirmMatchExitOrStay(() => {
        activeGameTab = "oaq";
        renderGames();
      }, "chuyển sang Ô ăn quan");
    });
    document.getElementById("tab-cadao").addEventListener("click", () => {
      if (activeGameTab === "cadao") return;
      confirmMatchExitOrStay(() => {
        cancelOrCommitOaqAnimation(true);
        activeGameTab = "cadao";
        renderGames();
      }, "chuyển sang Lật Thẻ Ca Dao");
    });
    document.getElementById("tab-cotuong").addEventListener("click", () => {
      if (activeGameTab === "cotuong") return;
      if (proverbFlipTimerId) {
        clearTimeout(proverbFlipTimerId);
        proverbFlipTimerId = null;
      }
      confirmMatchExitOrStay(() => {
        cancelOrCommitOaqAnimation(true);
        activeGameTab = "cotuong";
        renderGames();
      }, "chuyển sang Cờ tướng");
    });

    const body = document.getElementById("game-tab-body");
    if (activeGameTab === "oaq") {
      renderOaqTab(body);
    } else if (activeGameTab === "cadao") {
      renderProverbMemoryTab(body);
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

  // Sỏi cuội suối tự nhiên (Trắng thạch anh, Đen bazan, Nâu cát sông, Xám đá phiến — không màu kẹo ngọt trẻ con)
  const PEBBLE_PALETTE = [
    { id: "quartz", hi: "#FAF7F0", mid: "#DDD5C5", low: "#9C9282", cssBg: "radial-gradient(circle at 32% 30%, #FAF7F0 0%, #DDD5C5 56%, #9C9282 100%)", rim: "#7A7062" },
    { id: "basalt", hi: "#787E85", mid: "#3B4046", low: "#1B1E22", cssBg: "radial-gradient(circle at 32% 30%, #787E85 0%, #3B4046 58%, #1B1E22 100%)", rim: "#181A1D" },
    { id: "jasper", hi: "#EAD2B0", mid: "#B48C60", low: "#6B4C2B", cssBg: "radial-gradient(circle at 32% 30%, #EAD2B0 0%, #B48C60 58%, #6B4C2B 100%)", rim: "#593E22" },
    { id: "slate", hi: "#D6D3CB", mid: "#938E84", low: "#534F48", cssBg: "radial-gradient(circle at 32% 30%, #D6D3CB 0%, #938E84 58%, #534F48 100%)", rim: "#46423C" }
  ];

  function playOaqPebbleDropSound(stepCount, isCapture) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isCapture ? "sine" : "triangle";
      const baseFreq = isCapture ? 520 : 370 + ((stepCount || 0) % 5) * 26;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(isCapture ? 240 : 120, now + (isCapture ? 0.12 : 0.055));
      gain.gain.setValueAtTime(isCapture ? 0.24 : 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isCapture ? 0.13 : 0.065));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (isCapture ? 0.14 : 0.07));
    } catch (e) {}
  }

  function getOaqCellLabel(idx) {
    if (idx === 11) return "Quan Trái";
    if (idx === 5) return "Quan Phải";
    return `Ô ${idx + 1}`;
  }

  function buildOaqMoveTimeline(initialCells, startScoreP, startScoreAI, startIdx, dirStep, isPlayer, actorName, dirLabel) {
    const cells = initialCells.slice();
    let scoreP = startScoreP;
    let scoreAI = startScoreAI;
    let hand = cells[startIdx];
    if (hand <= 0) return null;

    const frames = [];
    const stepNext = (idx) => (idx + dirStep + 12) % 12;

    cells[startIdx] = 0;
    frames.push({
      kind: "pickup",
      cells: cells.slice(),
      scoreP,
      scoreAI,
      hand,
      activeCell: startIdx,
      newlyDroppedCell: null,
      capturedCell: null,
      slapEmptyCell: null,
      delayMs: 560,
      notiText: `${actorName} bốc ${hand} viên ở ${getOaqCellLabel(startIdx)} (${dirLabel})`
    });

    let pos = startIdx;

    while (true) {
      while (hand > 0) {
        pos = stepNext(pos);
        cells[pos] += 1;
        hand -= 1;
        if (frames.length < 72) {
          frames.push({
            kind: "drop",
            cells: cells.slice(),
            scoreP,
            scoreAI,
            hand,
            activeCell: pos,
            newlyDroppedCell: pos,
            capturedCell: null,
            slapEmptyCell: null,
            delayMs: 600,
            notiText: ""
          });
        }
      }

      const next = stepNext(pos);
      if (next === 5 || next === 11) {
        frames.push({
          kind: "stop_quan",
          cells: cells.slice(),
          scoreP,
          scoreAI,
          hand: 0,
          activeCell: next,
          newlyDroppedCell: null,
          capturedCell: null,
          slapEmptyCell: null,
          delayMs: 520,
          notiText: `Dừng lượt trước ${getOaqCellLabel(next)}`
        });
        break;
      }

      if (cells[next] > 0) {
        hand = cells[next];
        cells[next] = 0;
        pos = next;
        if (frames.length < 72) {
          frames.push({
            kind: "pickup_chain",
            cells: cells.slice(),
            scoreP,
            scoreAI,
            hand,
            activeCell: next,
            newlyDroppedCell: null,
            capturedCell: null,
            slapEmptyCell: null,
            delayMs: 720,
            notiText: `${actorName} bốc tiếp ${hand} viên ở ${getOaqCellLabel(next)}`
          });
        }
      } else {
        let after = stepNext(next);
        let checkEmpty = next;
        let anyCaptured = false;

        while (cells[checkEmpty] === 0 && cells[after] > 0) {
          anyCaptured = true;
          const capAmt = cells[after];
          frames.push({
            kind: "slap_empty",
            cells: cells.slice(),
            scoreP,
            scoreAI,
            hand: 0,
            activeCell: checkEmpty,
            newlyDroppedCell: null,
            capturedCell: null,
            slapEmptyCell: checkEmpty,
            delayMs: 520,
            notiText: ""
          });

          cells[after] = 0;
          if (isPlayer) scoreP += capAmt;
          else scoreAI += capAmt;

          frames.push({
            kind: "capture",
            cells: cells.slice(),
            scoreP,
            scoreAI,
            hand: 0,
            activeCell: after,
            newlyDroppedCell: null,
            capturedCell: after,
            slapEmptyCell: null,
            delayMs: 800,
            notiText: `${actorName} ăn được ${capAmt} viên sỏi từ ${getOaqCellLabel(after)}!`
          });

          checkEmpty = stepNext(after);
          if (checkEmpty === 5 || checkEmpty === 11) break;
          after = stepNext(checkEmpty);
        }

        if (!anyCaptured) {
          frames.push({
            kind: "stop_empty",
            cells: cells.slice(),
            scoreP,
            scoreAI,
            hand: 0,
            activeCell: next,
            newlyDroppedCell: null,
            capturedCell: null,
            slapEmptyCell: next,
            delayMs: 480,
            notiText: "Gặp hai ô trống — dừng lượt rải"
          });
        }
        break;
      }
    }

    // Hết hai Quan -> tàn cuộc, thu toàn bộ quân Dân còn lại trên bàn về giỏ mỗi bên
    if (cells[5] === 0 && cells[11] === 0) {
      const remP = cells.slice(0, 5).reduce((a, b) => a + b, 0);
      const remAI = cells.slice(6, 11).reduce((a, b) => a + b, 0);
      if (remP > 0 || remAI > 0) {
        for (let i = 0; i < 5; i++) cells[i] = 0;
        for (let i = 6; i < 11; i++) cells[i] = 0;
        scoreP += remP;
        scoreAI += remAI;
        frames.push({
          kind: "sweep_end",
          cells: cells.slice(),
          scoreP,
          scoreAI,
          hand: 0,
          activeCell: null,
          newlyDroppedCell: null,
          capturedCell: null,
          slapEmptyCell: null,
          delayMs: 650,
          notiText: "Hết hai Quan — thu quân tàn cuộc trên bàn về giỏ!"
        });
      }
    } else {
      // Rải cứu bàn nếu một bên hết sạch 5 ô Dân khi vẫn còn Quan
      const pSum = cells.slice(0, 5).reduce((a, b) => a + b, 0);
      if (pSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
        for (let i = 0; i < 5; i++) cells[i] = 1;
        frames.push({
          kind: "refill",
          cells: cells.slice(),
          scoreP,
          scoreAI,
          hand: 0,
          activeCell: null,
          newlyDroppedCell: null,
          capturedCell: null,
          slapEmptyCell: null,
          delayMs: 560,
          notiText: "Hàng dưới hết quân — rải 5 viên tiếp sức"
        });
      }
      const aiSum = cells.slice(6, 11).reduce((a, b) => a + b, 0);
      if (aiSum === 0 && (cells[5] > 0 || cells[11] > 0)) {
        for (let i = 6; i < 11; i++) cells[i] = 1;
        frames.push({
          kind: "refill",
          cells: cells.slice(),
          scoreP,
          scoreAI,
          hand: 0,
          activeCell: null,
          newlyDroppedCell: null,
          capturedCell: null,
          slapEmptyCell: null,
          delayMs: 560,
          notiText: "Hàng trên hết quân — rải 5 viên tiếp sức"
        });
      }
    }

    return {
      frames,
      finalSnapshot: {
        cells: cells.slice(),
        scoreP,
        scoreAI
      }
    };
  }

  function refreshOaqTabIfActive() {
    if (state.route === "games" && activeGameTab === "oaq") {
      const body = document.getElementById("game-tab-body");
      if (body) renderOaqTab(body);
    }
  }

  function finishOaqGameIfEnded() {
    if (state.oaq.cells[5] !== 0 || state.oaq.cells[11] !== 0) return false;
    state.oaq.turn = "host";
    state.oaq.inProgress = false;
    state.oaq.forfeitedPendingReload = false;
    matchHistoryGuardArmed = false;
    if (!state.user.gameStats) {
      state.user.gameStats = createDefaultState().user.gameStats;
    }
    const gs = state.user.gameStats;
    const isGuest = state.oaq.mode === "async" && state.oaq.myRole === "guest";
    const myScore = isGuest ? state.oaq.scoreAI : state.oaq.scoreP;
    const oppScore = isGuest ? state.oaq.scoreP : state.oaq.scoreAI;
    if (myScore > oppScore) {
      gs.oaqWins = (Number(gs.oaqWins) || 0) + 1;
      gs.winStreak = (Number(gs.winStreak) || 0) + 1;
      gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
      awardSkillPoints("folk_games", 8);
      checkGameWinMilestones();
      addXu(5, `Thắng ván Ô ăn quan (${myScore}–${oppScore})`);
    } else if (myScore === oppScore) {
      showToast(`Ván cờ hòa đẹp (${myScore}–${oppScore})!`);
    } else {
      gs.oaqLosses = (Number(gs.oaqLosses) || 0) + 1;
      gs.winStreak = 0;
      showToast(`Ván kết thúc: Đối phương ${oppScore} quân — Bác ${myScore} quân`);
    }
    return true;
  }

  function cancelOrCommitOaqAnimation(commitFinal) {
    if (oaqAnimTimerId) {
      clearTimeout(oaqAnimTimerId);
      oaqAnimTimerId = null;
    }
    if (oaqAnimState) {
      const pending = oaqAnimState;
      oaqAnimState = null;
      if (commitFinal && pending.finalSnapshot) {
        state.oaq.cells = pending.finalSnapshot.cells.slice();
        state.oaq.scoreP = pending.finalSnapshot.scoreP;
        state.oaq.scoreAI = pending.finalSnapshot.scoreAI;
        state.oaq.selectedCell = null;
        if (typeof pending.onSettled === "function") {
          pending.onSettled(true);
        } else {
          saveState();
        }
      }
    }
    if (state.oaq.mode !== "async" && state.oaq.turn === "ai") {
      if (commitFinal && !(state.oaq.cells[5] === 0 && state.oaq.cells[11] === 0)) {
        const validAi = [6, 7, 8, 9, 10].filter((i) => state.oaq.cells[i] > 0);
        if (validAi.length > 0) {
          executeOaqMove(validAi[0], 1, false);
        }
      }
      state.oaq.turn = "host";
      state.oaq.selectedCell = null;
      saveState();
    }
  }

  function runOaqSowingAnimation(timeline, onComplete) {
    cancelOrCommitOaqAnimation(false);
    if (!timeline || !Array.isArray(timeline.frames) || timeline.frames.length === 0) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    state.oaq.selectedCell = null;
    oaqAnimState = {
      stepIdx: 0,
      frames: timeline.frames,
      finalSnapshot: timeline.finalSnapshot,
      currentFrame: timeline.frames[0],
      onSettled: (wasAborted) => {
        if (!wasAborted && typeof onComplete === "function") {
          onComplete();
        } else {
          if (state.oaq.mode !== "async") state.oaq.turn = "host";
          saveState();
        }
      }
    };

    const advanceStep = () => {
      if (!oaqAnimState) return;
      const idx = oaqAnimState.stepIdx;
      if (idx >= oaqAnimState.frames.length) {
        state.oaq.cells = oaqAnimState.finalSnapshot.cells.slice();
        state.oaq.scoreP = oaqAnimState.finalSnapshot.scoreP;
        state.oaq.scoreAI = oaqAnimState.finalSnapshot.scoreAI;
        const doneCb = onComplete;
        oaqAnimState = null;
        oaqAnimTimerId = null;
        saveState();
        if (typeof doneCb === "function") doneCb();
        return;
      }

      const fr = oaqAnimState.frames[idx];
      oaqAnimState.currentFrame = fr;
      state.oaq.cells = fr.cells.slice();
      state.oaq.scoreP = fr.scoreP;
      state.oaq.scoreAI = fr.scoreAI;
      if (fr.notiText) {
        state.oaq.statusText = fr.notiText;
        showToast(fr.notiText);
      }

      if (fr.kind === "drop") {
        playOaqPebbleDropSound(idx, false);
      } else if (fr.kind === "capture" || fr.kind === "sweep_end") {
        playOaqPebbleDropSound(idx, true);
      } else if (fr.kind === "pickup" || fr.kind === "pickup_chain") {
        playWoodPieceClack(false);
      }

      refreshOaqTabIfActive();

      oaqAnimState.stepIdx += 1;
      oaqAnimTimerId = setTimeout(advanceStep, fr.delayMs || 600);
    };

    advanceStep();
  }

  function renderOaqStoneGradientDefs() {
    return `
      <defs>
        ${PEBBLE_PALETTE.map(
          (p) => `
          <radialGradient id="oaq-grad-${p.id}" cx="34%" cy="30%" r="68%">
            <stop offset="0%" stop-color="${p.hi}" />
            <stop offset="56%" stop-color="${p.mid}" />
            <stop offset="100%" stop-color="${p.low}" />
          </radialGradient>
        `
        ).join("")}
        <radialGradient id="oaq-grad-mandarin" cx="34%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#FFF4C8" />
          <stop offset="45%" stop-color="#D99032" />
          <stop offset="100%" stop-color="#6B370A" />
        </radialGradient>
        <radialGradient id="oaq-pit-wood" cx="50%" cy="44%" r="58%">
          <stop offset="0%" stop-color="#4A2B16" />
          <stop offset="72%" stop-color="#361E0E" />
          <stop offset="100%" stop-color="#241207" />
        </radialGradient>
      </defs>
    `;
  }

  function computePebblePositions(count, isQuan, cellSeed) {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    if (n === 0) return [];
    const out = [];

    if (isQuan) {
      const hasMandarinGem = n >= 10;
      if (hasMandarinGem) {
        out.push({ x: 44, y: 80, rx: 16.5, ry: 12.2, rot: -12, isMandarin: true, colorIdx: 0 });
      }
      const rem = hasMandarinGem ? n - 1 : n;
      const rStone = rem <= 8 ? 7.8 : rem <= 14 ? 6.8 : 5.8;
      for (let i = 0; i < rem; i++) {
        const ang = i * 2.39996 + cellSeed * 0.7;
        const ringRatio = hasMandarinGem
          ? 0.42 + 0.54 * Math.sqrt((i + 0.5) / Math.max(1, rem))
          : 0.18 + 0.76 * Math.sqrt((i + 0.4) / Math.max(1, rem));
        const px = 44 + Math.cos(ang) * 26 * ringRatio;
        const py = 82 + Math.sin(ang) * 58 * ringRatio;
        out.push({
          x: px,
          y: py,
          rx: rStone,
          ry: rStone * 0.78,
          rot: ((i * 47 + cellSeed * 19) % 70) - 35,
          isMandarin: false,
          colorIdx: (i + cellSeed) % PEBBLE_PALETTE.length
        });
      }
      return out;
    }

    const presetCoords = {
      1: [[50, 35, 11.2]],
      2: [[34, 35, 10.2], [66, 35, 10.2]],
      3: [[50, 22, 9.6], [33, 44, 9.6], [67, 44, 9.6]],
      4: [[33, 23, 9.2], [67, 23, 9.2], [33, 46, 9.2], [67, 46, 9.2]],
      5: [[31, 22, 8.8], [69, 22, 8.8], [50, 35, 9.0], [31, 47, 8.8], [69, 47, 8.8]],
      6: [[27, 23, 8.4], [50, 22, 8.4], [73, 23, 8.4], [27, 46, 8.4], [50, 47, 8.4], [73, 46, 8.4]],
      7: [[27, 21, 8.0], [50, 20, 8.0], [73, 21, 8.0], [50, 35, 8.2], [27, 48, 8.0], [50, 49, 8.0], [73, 48, 8.0]],
      8: [[23, 23, 7.5], [41, 22, 7.5], [59, 22, 7.5], [77, 23, 7.5], [23, 46, 7.5], [41, 47, 7.5], [59, 47, 7.5], [77, 46, 7.5]],
      9: [[26, 20, 7.1], [50, 19, 7.1], [74, 20, 7.1], [26, 35, 7.1], [50, 35, 7.2], [74, 35, 7.1], [26, 50, 7.1], [50, 51, 7.1], [74, 50, 7.1]]
    };

    if (presetCoords[n]) {
      return presetCoords[n].map(([x, y, r], i) => {
        const jx = Math.sin(i * 3.1 + cellSeed) * 1.4;
        const jy = Math.cos(i * 2.7 + cellSeed) * 1.1;
        return {
          x: x + jx,
          y: y + jy,
          rx: r,
          ry: r * 0.78,
          rot: ((i * 53 + cellSeed * 23) % 64) - 32,
          isMandarin: false,
          colorIdx: (i + cellSeed) % PEBBLE_PALETTE.length
        };
      });
    }

    const rDynamic = Math.max(4.6, Math.min(6.8, 22 / Math.sqrt(n)));
    for (let i = 0; i < n; i++) {
      const ang = i * 2.39996 + cellSeed * 0.5;
      const rad = Math.sqrt((i + 0.45) / n);
      const px = 50 + Math.cos(ang) * 34 * rad;
      const py = 35 + Math.sin(ang) * 20 * rad;
      out.push({
        x: px,
        y: py,
        rx: rDynamic,
        ry: rDynamic * 0.78,
        rot: ((i * 41 + cellSeed * 17) % 70) - 35,
        isMandarin: false,
        colorIdx: (i + cellSeed) % PEBBLE_PALETTE.length
      });
    }
    return out;
  }

  function renderOaqCellPebblesSvg(count, isQuan, cellSeed, highlightNewStone) {
    const stones = computePebblePositions(count, isQuan, cellSeed);
    const vb = isQuan ? "0 0 88 164" : "0 0 100 68";
    const pitShape = isQuan
      ? `<rect x="6" y="6" width="76" height="152" rx="38" fill="url(#oaq-pit-wood)" stroke="rgba(218, 174, 112, 0.32)" stroke-width="1.4" />`
      : `<ellipse cx="50" cy="35" rx="45" ry="29" fill="url(#oaq-pit-wood)" stroke="rgba(218, 174, 112, 0.30)" stroke-width="1.3" />`;

    const stonesSvg = stones
      .map((st, idx) => {
        const isLastAdded = Boolean(highlightNewStone && idx === stones.length - 1);
        const animCls = isLastAdded ? " is-newly-dropped" : "";
        if (st.isMandarin) {
          return `
            <g class="oaq-pebble is-mandarin${animCls}" transform="translate(${st.x.toFixed(1)},${st.y.toFixed(1)}) rotate(${st.rot})">
              <ellipse cx="1.6" cy="2.6" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="rgba(12, 6, 2, 0.55)" />
              <ellipse cx="0" cy="0" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="url(#oaq-grad-mandarin)" stroke="rgba(92, 45, 12, 0.55)" stroke-width="0.9" />
              <ellipse cx="-4.2" cy="-3.4" rx="${(st.rx * 0.30).toFixed(1)}" ry="${(st.ry * 0.22).toFixed(1)}" fill="rgba(255, 252, 240, 0.55)" />
            </g>
          `;
        }
        const pal = PEBBLE_PALETTE[st.colorIdx % PEBBLE_PALETTE.length];
        return `
          <g class="oaq-pebble${animCls}" transform="translate(${st.x.toFixed(1)},${st.y.toFixed(1)}) rotate(${st.rot})">
            <ellipse cx="1.2" cy="2.0" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="rgba(12, 6, 2, 0.52)" />
            <ellipse cx="0" cy="0" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="url(#oaq-grad-${pal.id})" stroke="rgba(35, 24, 14, 0.35)" stroke-width="0.7" />
            ${isLastAdded ? `<ellipse cx="0" cy="0" rx="${(st.rx + 2.4).toFixed(1)}" ry="${(st.ry + 2.2).toFixed(1)}" fill="none" stroke="#FFE082" stroke-width="1.6" />` : ""}
          </g>
        `;
      })
      .join("");

    return `<svg class="oaq-pit-svg ${isQuan ? "is-quan-svg" : ""}" viewBox="${vb}" aria-hidden="true">${pitShape}${stonesSvg}</svg>`;
  }

  function renderOaqCapturedBasketSvg(score, seedOffset) {
    const n = Math.max(0, Math.floor(Number(score) || 0));
    const off = Math.max(0, Math.floor(Number(seedOffset) || 0));
    if (n === 0) {
      return `<div class="oaq-basket-pebbles"><span class="oaq-basket-empty">Chưa ăn quân nào</span></div>`;
    }
    const visibleStones = Math.min(n, 12);
    const items = [];
    for (let i = 0; i < visibleStones; i++) {
      const pal = PEBBLE_PALETTE[(i + off) % PEBBLE_PALETTE.length];
      items.push(
        `<span class="oaq-mini-stone" style="background:${pal.cssBg};border-color:${pal.rim};" title="Viên sỏi thứ ${i + 1}"></span>`
      );
    }
    if (n > visibleStones) {
      items.push(`<span class="oaq-mini-more num">+${n - visibleStones}</span>`);
    }
    return `<div class="oaq-basket-pebbles" aria-label="${n} viên sỏi đã ăn">${items.join("")}</div>`;
  }

  function renderOaqTab(container) {
    const o = state.oaq;
    if (o.mode !== "async" && ((o.turn !== "host" && o.turn !== "ai") || (!oaqAnimState && !oaqAnimTimerId && o.turn !== "host"))) {
      o.turn = "host";
    }
    const isAnimating = Boolean(oaqAnimState);
    const animFrame = oaqAnimState ? oaqAnimState.currentFrame : null;
    const isGameOver = !isAnimating && o.cells[5] === 0 && o.cells[11] === 0;
    const topCells = [10, 9, 8, 7, 6]; // Guest / AI side
    const bottomCells = [0, 1, 2, 3, 4]; // Host / Player side
    const isGuestAsync = o.mode === "async" && o.myRole === "guest";
    const isMyTurn = !isAnimating && (o.mode === "ai" ? o.turn === "host" : o.turn === o.myRole);
    const hostLabel = o.mode === "async" ? o.hostName || `${state.user.name}` : `${state.user.name}`;
    const guestLabel =
      o.mode === "ai"
        ? "Máy (Đối thủ tự động)"
        : o.guestName || "Bạn cờ qua link (Đang chờ)";

    const renderCellStateClasses = (idx) => {
      const cls = [];
      if (o.selectedCell === idx) cls.push("selected");
      if (animFrame && animFrame.activeCell === idx) cls.push("is-sowing-active");
      if (animFrame && animFrame.capturedCell === idx) cls.push("is-captured-flash");
      if (animFrame && animFrame.slapEmptyCell === idx) cls.push("is-slap-empty");
      return cls.join(" ");
    };

    const isNewlyDroppedAt = (idx) => Boolean(animFrame && animFrame.newlyDroppedCell === idx);

    container.innerHTML = `
      <div class="surface-panel">
        <!-- SVG Gradient Definitions dùng chung cho các viên sỏi cuội suối 3D -->
        <svg width="0" height="0" style="position:absolute;pointer-events:none;" aria-hidden="true">
          ${renderOaqStoneGradientDefs()}
        </svg>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="oaq-mode-ai" ${isAnimating ? "disabled" : ""} style="${o.mode === "ai" ? "background:var(--accent-jade);color:#fff;" : ""}">Đấu với Máy</button>
          <button type="button" class="btn-secondary" id="oaq-mode-async" ${isAnimating ? "disabled" : ""} style="${o.mode === "async" ? "background:var(--accent-jade);color:#fff;" : ""}">Ván treo thật (Qua link)</button>
        </div>

        ${
          o.mode === "ai"
            ? `
          <div class="temple-cam-bar" role="group" aria-label="Chọn mức độ Máy Ô ăn quan">
            <button type="button" class="temple-cam-btn ${o.aiLevel === "easy" ? "active" : ""}" data-oaq-lvl="easy" ${isAnimating ? "disabled" : ""}>Máy Thư Giãn</button>
            <button type="button" class="temple-cam-btn ${o.aiLevel !== "easy" ? "active" : ""}" data-oaq-lvl="club" ${isAnimating ? "disabled" : ""}>Máy Cao Thủ Làng</button>
          </div>
        `
            : ""
        }

        <div class="game-stats-strip num">
          <span>Thắng: <strong>${(state.user.gameStats && state.user.gameStats.oaqWins) || 0}</strong></span>
          <span>Thua: <strong>${(state.user.gameStats && state.user.gameStats.oaqLosses) || 0}</strong></span>
          <span>Chuỗi thắng: <strong>${(state.user.gameStats && state.user.gameStats.winStreak) || 0}</strong></span>
        </div>

        <!-- Khay mây tre đựng sỏi đã ăn của Hàng Trên (cố định đúng 1 dòng không làm nhảy bàn cờ) -->
        <div class="oaq-score-tray">
          <div class="oaq-score-tray-head">
            <span>Hàng trên (${escHtml(guestLabel)})</span>
            <strong class="badge-tag num">${o.scoreAI} quân</strong>
          </div>
          ${renderOaqCapturedBasketSvg(o.scoreAI, 2)}
        </div>

        <!-- Khung bàn Gỗ Hương cố định tuyệt đối tọa độ, huy hiệu đếm sỏi trên tay nổi nhẹ trên viền -->
        <div class="oaq-board-stage">
          ${
            isAnimating && animFrame && animFrame.hand > 0
              ? `<div class="oaq-floating-hand-badge num" aria-live="polite">Trên tay: ${animFrame.hand} viên</div>`
              : ""
          }
          <div class="oaq-board" role="group" aria-label="Bàn cờ Ô ăn quan bằng gỗ kèm viên sỏi cuội thực tế">
          <div class="oaq-quan oaq-quan-left ${renderCellStateClasses(11)}" aria-label="Quan Trái còn ${o.cells[11]} quân">
            <span class="oaq-count-pill num">${o.cells[11]}${isNewlyDroppedAt(11) ? " +1" : ""}</span>
            ${renderOaqCellPebblesSvg(o.cells[11], true, 11, isNewlyDroppedAt(11))}
            <small>Q.Trái</small>
          </div>

          ${topCells
            .map((idx) => {
              const count = o.cells[idx];
              const newly = isNewlyDroppedAt(idx);
              const extraCls = renderCellStateClasses(idx);
              const innerHtml = `
                <span class="oaq-count-num num">${count}${newly ? '<sup class="oaq-plus-one">+1</sup>' : ""}</span>
                ${renderOaqCellPebblesSvg(count, false, idx, newly)}
                <small>Ô${idx + 1}</small>
              `;
              if (isGuestAsync) {
                return `
                  <button type="button" class="oaq-cell player-side ${extraCls}" data-cell="${idx}" style="grid-row:1;" aria-label="Ô ${idx + 1} có ${count} viên sỏi" ${!isMyTurn || count === 0 || isGameOver ? "disabled" : ""}>
                    ${innerHtml}
                  </button>
                `;
              }
              return `
                <div class="oaq-cell opponent-side ${extraCls}" style="grid-row:1;" aria-label="Ô ${idx + 1} có ${count} viên sỏi">
                  ${innerHtml}
                </div>
              `;
            })
            .join("")}

          ${bottomCells
            .map((idx) => {
              const count = o.cells[idx];
              const newly = isNewlyDroppedAt(idx);
              const extraCls = renderCellStateClasses(idx);
              const innerHtml = `
                <span class="oaq-count-num num">${count}${newly ? '<sup class="oaq-plus-one">+1</sup>' : ""}</span>
                ${renderOaqCellPebblesSvg(count, false, idx, newly)}
                <small>Ô${idx + 1}</small>
              `;
              if (isGuestAsync) {
                return `
                  <div class="oaq-cell opponent-side ${extraCls}" style="grid-row:2;" aria-label="Ô ${idx + 1} có ${count} viên sỏi">
                    ${innerHtml}
                  </div>
                `;
              }
              return `
                <button type="button" class="oaq-cell player-side ${extraCls}" data-cell="${idx}" style="grid-row:2;" aria-label="Ô ${idx + 1} có ${count} viên sỏi" ${!isMyTurn || count === 0 || isGameOver ? "disabled" : ""}>
                  ${innerHtml}
                </button>
              `;
            })
            .join("")}

          <div class="oaq-quan oaq-quan-right ${renderCellStateClasses(5)}" aria-label="Quan Phải còn ${o.cells[5]} quân">
            <span class="oaq-count-pill num">${o.cells[5]}${isNewlyDroppedAt(5) ? " +1" : ""}</span>
            ${renderOaqCellPebblesSvg(o.cells[5], true, 5, isNewlyDroppedAt(5))}
            <small>Q.Phải</small>
          </div>
          </div>
        </div>

        <!-- Khay mây tre đựng sỏi đã ăn của Hàng Dưới (Bác) -->
        <div class="oaq-score-tray is-player">
          <div class="oaq-score-tray-head">
            <span>Hàng dưới (${escHtml(hostLabel)})</span>
            <strong class="badge-tag amber num">${o.scoreP} quân</strong>
          </div>
          ${renderOaqCapturedBasketSvg(o.scoreP, 0)}
        </div>

        <!-- Hai hàng nút chiều cao cố định bên dưới bàn cờ (không đẩy xô lệch chiều cao trang khi chạm ô) -->
        <div class="oaq-action-slot">
          ${
            o.selectedCell !== null && isMyTurn && !isGameOver
              ? `
            <div class="btn-row">
              <button type="button" class="btn-primary" id="oaq-dir-left">← Rải sang Trái</button>
              <button type="button" class="btn-jade" id="oaq-dir-right">Rải sang Phải →</button>
            </div>
          `
              : `<button type="button" class="btn-secondary" disabled>${
                  isGameOver
                    ? "Ván đã kết thúc — mời bấm Xếp lại bàn mới"
                    : isAnimating
                    ? "Đang thong thả rải từng viên sỏi..."
                    : isMyTurn
                    ? "Chạm 1 ô có sỏi của bác để chọn hướng rải"
                    : "Đang chờ lượt đối phương..."
                }</button>`
          }
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="oaq-btn-hint" ${!isMyTurn || isGameOver || isAnimating ? "disabled" : ""}>Gợi ý nước ăn sỏi</button>
          <button type="button" class="btn-secondary" id="oaq-reset">${isAnimating ? "Bỏ qua &amp; Ván mới" : "Xếp ván mới"}</button>
        </div>

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
      </div>
    `;

    container.querySelectorAll("[data-cell]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (oaqAnimState) return;
        playWoodPieceClack(false);
        state.oaq.selectedCell = Number(btn.dataset.cell);
        showToast(`Đã chọn Ô ${state.oaq.selectedCell + 1} (${state.oaq.cells[state.oaq.selectedCell]} viên) — mời chọn hướng rải`);
        refreshOaqTabIfActive();
      });
    });

    const doPlayerDir = (dir) => {
      const chosen = state.oaq.selectedCell;
      if (chosen === null || oaqAnimState) return;
      const isHostSide = !isGuestAsync;
      // On top row (guest), visual Left corresponds to +1 index around board, Right to -1
      const actualStep = isHostSide ? dir : -dir;
      const dirLabel = dir > 0 ? "bên Phải" : "bên Trái";
      const timeline = buildOaqMoveTimeline(
        state.oaq.cells,
        state.oaq.scoreP,
        state.oaq.scoreAI,
        chosen,
        actualStep,
        isHostSide,
        state.user.name,
        dirLabel
      );
      if (!timeline) return;

      state.oaq.inProgress = true;
      armBrowserBackMatchGuard("oaq");

      awardSeniorityPoints(2, "oaq_move", "dan-gian", `Rải quân Ô ăn quan ô số ${chosen + 1}`, {
        eventType: "folk_game",
        module: "games",
        gameKind: "oaq",
        cellIdx: chosen
      });

      runOaqSowingAnimation(timeline, () => {
        if (state.oaq.mode === "async") {
          ensureOaqAsyncMatch();
          const nextTurn = isHostSide ? "guest" : "host";
          state.oaq.turn = nextTurn;
          state.oaq.statusText = `${state.user.name} vừa rải xong Ô ${chosen + 1}. Đang chờ đối thủ đi lượt tiếp theo...`;
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
          finishOaqGameIfEnded();
          saveState();
          addXu(3, "Đi nước cờ ván treo thật");
          refreshOaqTabIfActive();
          return;
        }

        // Kiểm tra nếu cả hai ô Quan đã hết sạch quân sau nước của bác
        if (finishOaqGameIfEnded()) {
          saveState();
          refreshOaqTabIfActive();
          return;
        }

        state.oaq.turn = "ai";
        showToast("Đến lượt Máy rải sỏi...");
        saveState();
        refreshOaqTabIfActive();

        oaqAnimTimerId = setTimeout(() => {
          if (state.route !== "games" || activeGameTab !== "oaq") {
            cancelOrCommitOaqAnimation(true);
            return;
          }
          const validAiCells = [6, 7, 8, 9, 10].filter((idx) => state.oaq.cells[idx] > 0);
          if (validAiCells.length === 0) {
            state.oaq.turn = "host";
            showToast("Đến lượt bác chọn một ô hàng dưới");
            saveState();
            refreshOaqTabIfActive();
            return;
          }
          const smartPick = pickSmartOaqAiMove(
            state.oaq.cells,
            state.oaq.scoreP,
            state.oaq.scoreAI,
            false,
            state.oaq.aiLevel || "club"
          );
          const pick = smartPick ? smartPick.cell : validAiCells[0];
          const aiDir = smartPick ? smartPick.dirStep : 1;
          const aiTimeline = buildOaqMoveTimeline(
            state.oaq.cells,
            state.oaq.scoreP,
            state.oaq.scoreAI,
            pick,
            aiDir,
            false,
            state.oaq.aiLevel === "easy" ? "Máy (Thư giãn)" : "Máy (Cao thủ)",
            aiDir === -1 ? "bên Phải" : "bên Trái"
          );
          runOaqSowingAnimation(aiTimeline, () => {
            state.oaq.turn = "host";
            if (!finishOaqGameIfEnded()) {
              showToast("Máy đã rải xong — đến lượt bác chọn ô");
            }
            saveState();
            refreshOaqTabIfActive();
          });
        }, 750);
      });
    };

    const btnL = document.getElementById("oaq-dir-left");
    const btnR = document.getElementById("oaq-dir-right");
    if (btnL) btnL.addEventListener("click", () => doPlayerDir(-1));
    if (btnR) btnR.addEventListener("click", () => doPlayerDir(1));

    container.querySelectorAll("[data-oaq-lvl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (oaqAnimState) return;
        const nextLv = btn.dataset.oaqLvl === "easy" ? "easy" : "club";
        if (state.oaq.aiLevel === nextLv) return;
        state.oaq.aiLevel = nextLv;
        saveState();
        showToast(nextLv === "easy" ? "Đã chọn Máy Thư Giãn — rải sỏi nhẹ nhàng." : "Đã chọn Máy Cao Thủ Làng — tính nước ăn liên hoàn!");
        refreshOaqTabIfActive();
      });
    });

    const oaqHintBtn = document.getElementById("oaq-btn-hint");
    if (oaqHintBtn) {
      oaqHintBtn.addEventListener("click", () => {
        if (oaqAnimState || !isMyTurn || isGameOver) return;
        const isHostSide = !isGuestAsync;
        const best = pickSmartOaqAiMove(state.oaq.cells, state.oaq.scoreP, state.oaq.scoreAI, isHostSide, "club");
        if (!best) return;
        state.oaq.selectedCell = best.cell;
        const visualDir = (isHostSide ? best.dirStep : -best.dirStep) > 0 ? "Rải sang Phải →" : "← Rải sang Trái";
        showToast(
          best.myGain > 0
            ? `Gợi ý: Ô ${best.cell + 1} · ${visualDir} (ăn ngay ${best.myGain} quân)!`
            : `Gợi ý thế thủ chắc nhất: Ô ${best.cell + 1} · ${visualDir}`
        );
        refreshOaqTabIfActive();
      });
    }

    document.getElementById("oaq-mode-ai").addEventListener("click", () => {
      if (oaqAnimState || state.oaq.mode === "ai") return;
      confirmMatchExitOrStay(() => {
        state.oaq.mode = "ai";
        state.oaq.turn = "host";
        state.oaq.statusText = "Đang đấu với Máy (luôn ghi rõ là Máy).";
        saveState();
        refreshOaqTabIfActive();
      }, "đổi sang chế độ Đấu với Máy");
    });

    document.getElementById("oaq-mode-async").addEventListener("click", () => {
      if (oaqAnimState || state.oaq.mode === "async") return;
      confirmMatchExitOrStay(() => {
        state.oaq.mode = "async";
        ensureOaqAsyncMatch();
        state.oaq.statusText = "Chế độ Ván treo thật: gửi link bên dưới cho điện thoại thứ 2 để đánh trực tiếp.";
        saveState();
        refreshOaqTabIfActive();
      }, "đổi sang chế độ Ván treo qua link");
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
      confirmMatchExitOrStay(() => {
        cancelOrCommitOaqAnimation(false);
        const keepMode = state.oaq.mode;
        state.oaq = Object.assign({}, createDefaultState().oaq, { mode: keepMode });
        if (keepMode === "async") ensureOaqAsyncMatch();
        saveState();
        refreshOaqTabIfActive();
      }, "xếp lại bàn cờ mới");
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
    resetXiangqiMatchState(nextMode);
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
      confirmMatchExitOrStay(() => {
        activeGameTab = "oaq";
        executeNavigate("games");
      }, "chuyển sang Ô ăn quan");
    });
    renderXiangqiTab(document.getElementById("xq-host-container"));
  }

  function renderXiangqiTab(container) {
    if (!XQ || !container) return;
    const x = state.xiangqi;
    ensureXiangqiBoardInitialized();

    const pz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
    const isCupTab = x.mode === "cup";
    const isPlayGameTab = x.mode !== "puzzle";
    const cupObj = x.cup || createDefaultState().xiangqi.cup;
    const cupRival = getCupCurrentRival(cupObj);
    const cupUnitLabel = getCupUnitDisplayName();
    const cupTitlesCount = (state.user.gameStats && state.user.gameStats.cupTitles) || 0;
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
        <!-- Chế độ lớn dễ chọn nhất: Đánh Ván Thật · Giải Cờ Thế · Cúp Đồng Ngũ -->
        <div class="xq-top-switch" role="tablist" aria-label="Chọn Đánh ván thật, Giải cờ thế hoặc Cúp Đồng Ngũ">
          <button type="button" class="xq-top-btn ${isPlayGameTab && !isCupTab ? "active" : ""}" id="xq-top-play">Đánh ván thật (32 quân)</button>
          <button type="button" class="xq-top-btn ${!isPlayGameTab ? "active" : ""}" id="xq-top-puzzle">Giải Cờ thế (${solvedCount}/${XQ.PUZZLES.length} thế)</button>
        </div>
        <button type="button" class="xq-top-btn ${isCupTab ? "active" : ""}" id="xq-top-cup" style="width:100%;">
          ${ico("trophy", "ico-sm")} Cúp Cờ Tướng Đồng Ngũ · 3 Vòng (${cupTitlesCount} Cúp)
        </button>

        <div class="game-stats-strip num">
          <span>Thắng: <strong>${(state.user.gameStats && state.user.gameStats.xiangqiWins) || 0}</strong></span>
          <span>Thua: <strong>${(state.user.gameStats && state.user.gameStats.xiangqiLosses) || 0}</strong></span>
          <span>Cúp CLB: <strong>${cupTitlesCount}</strong></span>
        </div>

        ${
          isCupTab
            ? `
          <div class="surface-panel jade" style="padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong>Đại diện: ${escHtml(cupUnitLabel)}</strong>
              <span class="badge-tag jade num">${escHtml(cupRival.roundLabel)}</span>
            </div>
            <div class="cup-bracket-bar" role="group" aria-label="Tiến độ 3 vòng Cúp Đồng Ngũ">
              <div class="cup-step-pill ${cupObj.round > 0 || (cupObj.round === 0 && cupObj.justWonRound) ? "is-won" : cupObj.round === 0 ? "is-current" : ""}">1. Tứ Kết</div>
              <div class="cup-step-pill ${cupObj.round > 1 || (cupObj.round === 1 && cupObj.justWonRound) ? "is-won" : cupObj.round === 1 ? "is-current" : ""}">2. Bán Kết</div>
              <div class="cup-step-pill ${cupObj.justWonTitle ? "is-won" : cupObj.round === 2 ? "is-current" : ""}">3. Chung Kết</div>
            </div>
            <div style="font-size:0.88rem; color:var(--ink-primary);">
              Đối thủ CLB bạn: <strong>${escHtml(cupRival.clubName)}</strong> · Đội trưởng ${escHtml(cupRival.captain)}
            </div>
            <small style="font-size:0.84rem; color:var(--ink-secondary);">${escHtml(cupRival.motto)}</small>
          </div>

          <div class="xq-captured-strip">
            <span>Đỏ ăn: <strong>${capInfo.capturedByRed.length ? escHtml(capInfo.capturedByRed.join(", ")) : "chưa ăn quân"}</strong></span>
            <span>Đen ăn: <strong>${capInfo.capturedByBlack.length ? escHtml(capInfo.capturedByBlack.join(", ")) : "chưa ăn quân"}</strong></span>
          </div>
        `
            : isPlayGameTab
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
          <button type="button" class="btn-primary" id="xq-btn-reset">${
            x.mode === "puzzle" ? "Xếp lại thế cờ" : isCupTab ? "Đánh lại vòng này" : "Xếp ván 9×10 mới"
          }</button>
        </div>

        ${
          x.mode === "puzzle" && x.solved
            ? `<button type="button" class="btn-jade" id="xq-btn-next-puzzle">Sang Thế cờ tiếp theo →</button>`
            : ""
        }
        ${
          isCupTab && x.solved && cupObj.justWonRound && !cupObj.justWonTitle
            ? `<button type="button" class="btn-jade" id="xq-btn-next-cup-round">${
                cupObj.round === 0 ? "Vào Vòng Bán Kết →" : "Tiến vào Trận Chung Kết →"
              }</button>`
            : ""
        }
        ${
          isCupTab && x.solved && cupObj.justWonTitle
            ? `<button type="button" class="btn-jade" id="xq-btn-restart-cup">${ico("trophy")}<span>Bảo vệ ngôi vô địch mùa Cúp mới</span></button>`
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
      if (x.mode === "puzzle" || x.mode === "cup") {
        confirmMatchExitOrStay(() => {
          switchXiangqiMode("ai");
          refreshXiangqiHosts();
        }, "chuyển sang Đánh ván thật tự do");
      }
    });
    container.querySelector("#xq-top-puzzle").addEventListener("click", () => {
      if (x.mode !== "puzzle") {
        confirmMatchExitOrStay(() => {
          switchXiangqiMode("puzzle");
          refreshXiangqiHosts();
        }, "chuyển sang Giải Cờ thế");
      }
    });
    container.querySelector("#xq-top-cup").addEventListener("click", () => {
      if (x.mode !== "cup") {
        confirmMatchExitOrStay(() => {
          if (!x.cup) x.cup = createDefaultState().xiangqi.cup;
          if (x.cup.justWonTitle) {
            x.cup.round = 0;
            x.cup.justWonTitle = false;
            x.cup.justWonRound = false;
          }
          switchXiangqiMode("cup");
          refreshXiangqiHosts();
        }, "bước vào Cúp Cờ Tướng Đồng Ngũ");
      }
    });

    const nextCupBtn = container.querySelector("#xq-btn-next-cup-round");
    if (nextCupBtn) {
      nextCupBtn.addEventListener("click", () => {
        if (!x.cup) x.cup = createDefaultState().xiangqi.cup;
        x.cup.round = Math.min(2, (Number(x.cup.round) || 0) + 1);
        x.cup.justWonRound = false;
        const roundRivals = (D.TOURNAMENT_RIVAL_CLUBS || []).filter((c) => c.round === x.cup.round);
        if (roundRivals.length > 0) {
          const pickIdx = (Number(x.cup.championCount) || 0) % roundRivals.length;
          x.cup.rivalId = roundRivals[pickIdx].id;
        }
        switchXiangqiMode("cup");
        refreshXiangqiHosts();
      });
    }

    const restartCupBtn = container.querySelector("#xq-btn-restart-cup");
    if (restartCupBtn) {
      restartCupBtn.addEventListener("click", () => {
        if (!x.cup) x.cup = createDefaultState().xiangqi.cup;
        x.cup.round = 0;
        x.cup.justWonTitle = false;
        x.cup.justWonRound = false;
        const r0 = (D.TOURNAMENT_RIVAL_CLUBS || []).filter((c) => c.round === 0);
        if (r0.length > 0) {
          x.cup.rivalId = r0[((Number(x.cup.championCount) || 0) + 1) % r0.length].id;
        }
        switchXiangqiMode("cup");
        refreshXiangqiHosts();
      });
    }

    container.querySelectorAll("[data-xq-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.xqPlay;
        const targetMode = key === "ai-club" || key === "ai-easy" ? "ai" : key === "local2p" ? "local2p" : "async";
        const targetLevel = key === "ai-easy" ? "easy" : "club";
        if (x.mode === targetMode && (targetMode !== "ai" || x.aiLevel === targetLevel)) return;
        confirmMatchExitOrStay(() => {
          if (targetMode === "ai") x.aiLevel = targetLevel;
          switchXiangqiMode(targetMode);
          refreshXiangqiHosts();
        }, "đổi chế độ đối thủ mới");
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
      if (x.mode === "puzzle") {
        switchXiangqiMode("puzzle");
        refreshXiangqiHosts();
        return;
      }
      confirmMatchExitOrStay(() => {
        switchXiangqiMode(x.mode);
        refreshXiangqiHosts();
      }, "xếp lại bàn cờ mới");
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

    if (!state.user.gameStats) state.user.gameStats = createDefaultState().user.gameStats;
    const gs = state.user.gameStats;

    if (x.mode === "local2p") {
      if (enemyMoves.length === 0) {
        x.solved = true;
        x.inProgress = false;
        x.forfeitedPendingReload = false;
        matchHistoryGuardArmed = false;
        gs.xiangqiWins = (Number(gs.xiangqiWins) || 0) + 1;
        gs.winStreak = (Number(gs.winStreak) || 0) + 1;
        gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
        checkGameWinMilestones();
        x.status = `Chiếu bí! Bên ${movedSide === "red" ? "Đỏ" : "Đen"} đã thắng ván 9×10!`;
      } else {
        x.inProgress = true;
        armBrowserBackMatchGuard("xiangqi");
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
        x.inProgress = false;
        x.forfeitedPendingReload = false;
        matchHistoryGuardArmed = false;
        gs.xiangqiWins = (Number(gs.xiangqiWins) || 0) + 1;
        gs.winStreak = (Number(gs.winStreak) || 0) + 1;
        gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
        awardSkillPoints("xiangqi", 8);
        checkGameWinMilestones();
        x.status = `Chiếu bí! ${state.user.name} đã giành chiến thắng ván Cờ tướng 9×10!`;
        addXu(8, "Thắng ván treo Cờ tướng 9×10");
      } else {
        x.inProgress = true;
        armBrowserBackMatchGuard("xiangqi");
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

    const handleCupVictory = () => {
      if (!x.cup || typeof x.cup !== "object") x.cup = createDefaultState().xiangqi.cup;
      const rival = getCupCurrentRival(x.cup);
      const unitLabel = getCupUnitDisplayName();
      x.cup.justWonRound = true;
      gs.xiangqiWins = (Number(gs.xiangqiWins) || 0) + 1;
      gs.winStreak = (Number(gs.winStreak) || 0) + 1;
      gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
      checkGameWinMilestones();
      if ((Number(x.cup.round) || 0) >= 2) {
        x.cup.justWonTitle = true;
        x.cup.championCount = (Number(x.cup.championCount) || 0) + 1;
        gs.cupTitles = (Number(gs.cupTitles) || 0) + 1;
        unlockTitleFrame("kien-tuong", "Kiện Tướng Dân Gian");
        unlockHeritageTableItem("ban-co-ngoc");
        x.status = `Vô địch Cúp Đồng Ngũ! ${state.user.name} đại diện ${unitLabel} đã thắng ${rival.clubName} ở Trận Chung Kết (+25 Xu · +25 XP · Mở khóa Bàn cờ ngọc)!`;
        addXu(25, `Vô địch Cúp Cờ Tướng Đồng Ngũ (${unitLabel})`);
        awardSkillPoints("xiangqi", 16);
        awardSkillPoints("comrade_social", 14);
        awardSeniorityPoints(
          25,
          "xiangqi_cup_champion",
          "co-tuong",
          `Vô địch Cúp Cờ Tướng Đồng Ngũ đại diện "${unitLabel}"`,
          { eventType: "cup_champion", module: "xiangqi", unitName: unitLabel, rivalClub: rival.clubName }
        );
      } else {
        const nextRoundName = x.cup.round === 0 ? "Vòng Bán Kết" : "Trận Chung Kết";
        x.status = `Chiến thắng ${rival.roundLabel} trước ${rival.clubName}! Mời bác bấm tiến vào ${nextRoundName} (+10 Xu · +12 XP).`;
        addXu(10, `Vượt qua ${rival.roundLabel} Cúp Đồng Ngũ`);
        awardSkillPoints("xiangqi", 10);
        awardSkillPoints("comrade_social", 8);
        awardSeniorityPoints(
          12,
          "xiangqi_cup_round_win",
          "co-tuong",
          `Thắng ${rival.roundLabel} trước ${rival.clubName}`,
          { eventType: "cup_round_win", module: "xiangqi", round: x.cup.round, rivalClub: rival.clubName }
        );
      }
    };

    if (enemyMoves.length === 0) {
      x.solved = true;
      x.inProgress = false;
      x.forfeitedPendingReload = false;
      matchHistoryGuardArmed = false;
      if (x.mode === "cup") {
        handleCupVictory();
        saveState();
        refreshXiangqiHosts();
        return;
      }
      if (x.mode === "puzzle") {
        const pz = XQ.PUZZLES[(x.puzzleIdx || 0) % XQ.PUZZLES.length];
        if (!Array.isArray(x.solvedPuzzleIds)) x.solvedPuzzleIds = [];
        if (pz && !x.solvedPuzzleIds.includes(pz.id)) {
          x.solvedPuzzleIds.push(pz.id);
        }
      } else {
        gs.xiangqiWins = (Number(gs.xiangqiWins) || 0) + 1;
        gs.winStreak = (Number(gs.winStreak) || 0) + 1;
        gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
      }
      const newlyUnlocked = unlockTitleFrame("ky-thu", "Kỳ Thủ Đầu Xuân");
      x.status = newlyUnlocked
        ? "Chiếu bí xuất sắc! Bác đã mở khóa khung danh hiệu 3D 'Kỳ Thủ Đầu Xuân' gắn lên nhân vật!"
        : x.mode === "puzzle"
        ? "Chiếu bí chuẩn xác! Bác đã phá giải thành công thế cờ này!"
        : "Chiếu bí tuyệt đẹp! Bác đã chiến thắng đối thủ Máy trên bàn 9×10!";
      addXu(6, x.mode === "puzzle" ? "Phá giải thế cờ thành công" : "Thắng ván Cờ tướng 9×10");
      awardSkillPoints("xiangqi", x.mode === "puzzle" ? 10 : 8);
      if (x.mode !== "puzzle") checkGameWinMilestones();
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

    if (x.mode !== "puzzle") {
      x.inProgress = true;
      armBrowserBackMatchGuard("xiangqi");
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
        x.inProgress = false;
        x.forfeitedPendingReload = false;
        matchHistoryGuardArmed = false;
        if (x.mode === "cup") {
          handleCupVictory();
          saveState();
          refreshXiangqiHosts();
          return;
        }
        if (x.mode !== "puzzle") {
          gs.xiangqiWins = (Number(gs.xiangqiWins) || 0) + 1;
          gs.winStreak = (Number(gs.winStreak) || 0) + 1;
          gs.bestWinStreak = Math.max(Number(gs.bestWinStreak) || 0, gs.winStreak);
          awardSkillPoints("xiangqi", 8);
          checkGameWinMilestones();
        }
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
        x.inProgress = false;
        x.forfeitedPendingReload = false;
        matchHistoryGuardArmed = false;
        if (x.mode !== "puzzle") {
          gs.xiangqiLosses = (Number(gs.xiangqiLosses) || 0) + 1;
          gs.winStreak = 0;
        }
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

  let rhymeHelperIdx = 0;

  function wrapCanvasLineText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const lines = [];
    let curr = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = curr + " " + words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        curr = test;
      } else {
        lines.push(curr);
        curr = words[i];
      }
    }
    lines.push(curr);
    return lines;
  }

  function exportPoemSilkPostcardPng(poem) {
    if (!poem) return;
    const c = document.createElement("canvas");
    c.width = 720;
    c.height = 920;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 0, 920);
    grad.addColorStop(0, "#FDF8EC");
    grad.addColorStop(0.55, "#F7ECD4");
    grad.addColorStop(1, "#EFE0BE");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 920);

    // Outer & inner traditional silk-scroll border
    ctx.strokeStyle = "#8C3526";
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 672, 872);
    ctx.strokeStyle = "#C6923E";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 648, 848);

    // Corner ornamental brackets
    const corners = [
      [44, 44, 1, 1],
      [676, 44, -1, 1],
      [44, 876, 1, -1],
      [676, 876, -1, -1]
    ];
    ctx.strokeStyle = "#8C3526";
    ctx.lineWidth = 2.4;
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * 28);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * 28, cy);
      ctx.stroke();
    });

    // Header banner & cinnabar seal
    ctx.fillStyle = "#8C3526";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText("CHIẾU THƠ QUÁN TRÀ TUỔI BẠC", 64, 92);

    ctx.save();
    ctx.fillStyle = "#B22E21";
    ctx.fillRect(584, 64, 72, 72);
    ctx.strokeStyle = "#FCE9C5";
    ctx.lineWidth = 2;
    ctx.strokeRect(590, 70, 60, 60);
    ctx.fillStyle = "#FFF8EB";
    ctx.font = "bold 18px 'Merriweather', 'Be Vietnam Pro', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("THI", 620, 98);
    ctx.fillText("HỮU", 620, 120);
    ctx.restore();

    // Poem title & credit
    ctx.fillStyle = "#2A1C15";
    ctx.font = "bold 33px 'Merriweather', 'Be Vietnam Pro', 'Segoe UI', sans-serif";
    const titleLines = wrapCanvasLineText(ctx, poem.title || "Hương Trà Sớm Mai", 490).slice(0, 2);
    let yCursor = 152;
    titleLines.forEach((tl) => {
      ctx.fillText(tl, 64, yCursor);
      yCursor += 42;
    });

    ctx.fillStyle = "#6B4E35";
    ctx.font = "italic 19px 'Merriweather', 'Be Vietnam Pro', 'Segoe UI', sans-serif";
    ctx.fillText(`${poem.reciter || state.user.name} · ${poem.author || "Thơ cộng đồng"}`, 64, yCursor + 6);

    // Subtle divider
    ctx.strokeStyle = "#D4B483";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(64, yCursor + 28);
    ctx.lineTo(656, yCursor + 28);
    ctx.stroke();

    // Poem body lines
    ctx.fillStyle = "#23170F";
    ctx.font = "25px 'Merriweather', 'Be Vietnam Pro', 'Segoe UI', sans-serif";
    let bodyY = yCursor + 82;
    const rawLines = Array.isArray(poem.lines) ? poem.lines : [];
    const wrappedBody = [];
    rawLines.forEach((ln) => {
      wrapCanvasLineText(ctx, ln, 580).forEach((sub) => wrappedBody.push(sub));
    });
    wrappedBody.slice(0, 10).forEach((ln) => {
      ctx.fillText(ln, 72, bodyY);
      bodyY += 46;
    });

    // Footer card with QR code
    ctx.fillStyle = "#F3E2BE";
    ctx.fillRect(52, 726, 616, 144);
    ctx.strokeStyle = "#C6923E";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(52, 726, 616, 144);

    ctx.fillStyle = "#2E5E4E";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`Đã nhận ${Number(poem.flowers) || 1} bông hoa tri âm`, 76, 772);
    ctx.fillStyle = "#4A3A2C";
    ctx.font = "18px sans-serif";
    ctx.fillText("Quét mã QR bằng Zalo hoặc máy ảnh để vào", 76, 808);
    ctx.fillText("nghe ngâm thơ cùng tiếng đàn tranh tại Tuổi Bạc.", 76, 836);

    const shareUrl = `${getPublicBaseUrl()}?phong=phong-tho`;
    if (window.TeaRoomScene && typeof window.TeaRoomScene.drawQrToCanvas === "function") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(534, 738, 120, 120);
      window.TeaRoomScene.drawQrToCanvas(ctx, shareUrl, 540, 744, 108);
    }

    const pngUrl = c.toDataURL("image/png");
    trackTelemetryDirect("poem_postcard", "poetry", "export_silk_poem_card", {
      poemId: poem.id,
      poemTitle: poem.title
    });

    openDialog(
      "Thiệp Lụa Bài Thơ (Lưu gửi bạn bè & con cháu)",
      `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <img src="${pngUrl}" alt="Thiệp lụa bài thơ ${escHtml(poem.title)}" style="width:100%; border-radius:12px; border:1px solid var(--border-strong);" />
        <a href="${pngUrl}" download="thiep-tho-tuoi-bac.png" class="btn-jade" style="text-decoration:none;">
          ${ico("download")}
          <span>Tải ảnh Thiệp Lụa về điện thoại</span>
        </a>
      </div>
      `
    );
  }

  function renderPoetry() {
    const allPoems = getMergedPoemsList();
    const activeFrame = getTitleFrame(state.user.titleFrameId);

    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <h1>Ngâm thơ &amp; Tặng hoa</h1>
        <span class="badge-tag amber num">Còn ${state.user.flowersLeft}/3 hoa hôm nay</span>
      </div>
      <p class="lead-copy">Tự sáng tác hoặc đọc thơ bằng giọng nói, nghe ngâm thơ cùng tiếng đàn tranh, in Thiệp Lụa gửi Zalo và nhận khung danh hiệu <strong>Thi Hữu Tao Đàn</strong>.</p>

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
        <textarea class="textarea-lg" id="poem-body-in" rows="3" placeholder="Gõ từng câu thơ xuống dòng, hoặc bấm Đọc thơ bằng giọng / Gợi ý câu Lục Bát..."></textarea>
        <div id="poem-meter-feedback" style="font-size:0.88rem; color:var(--accent-jade); font-weight:600;" hidden></div>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-mic-poem">${ico("mic")}<span>Đọc thơ bằng giọng</span></button>
          <button type="button" class="btn-secondary" id="btn-rhyme-helper">Gợi ý câu Lục Bát</button>
        </div>
        <button type="button" class="btn-secondary" id="btn-check-meter">Kiểm tra nhịp thơ 6–8</button>
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
          <button type="button" class="btn-secondary export-poem-card-btn" data-idx="${idx}">
            ${ico("camera")}
            <span>In Thiệp Lụa Bài Thơ (Lưu gửi Zalo)</span>
          </button>
        </article>
      `;
        })
        .join("")}
    `;

    document.getElementById("btn-go-frame-preview").addEventListener("click", () => navigate("profile"));

    const titleEl = document.getElementById("poem-title-in");
    const bodyEl = document.getElementById("poem-body-in");
    const styleEl = document.getElementById("poem-style-in");
    const meterEl = document.getElementById("poem-meter-feedback");

    document.getElementById("btn-rhyme-helper").addEventListener("click", () => {
      const pairs = D.LUC_BAT_RHYME_PAIRS || [];
      if (pairs.length === 0) return;
      const picked = pairs[rhymeHelperIdx % pairs.length];
      rhymeHelperIdx += 1;
      styleEl.value = "luc-bat";
      if (titleEl && !titleEl.value.trim()) {
        titleEl.value = picked.theme;
      }
      bodyEl.value = picked.lines.join("\n");
      meterEl.hidden = false;
      meterEl.textContent = `Gợi ý chủ đề "${picked.theme}" — ${evaluatePoemMeter(picked.lines, "luc-bat")}`;
    });

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

    els.main.querySelectorAll(".export-poem-card-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const p = allPoems[Number(b.dataset.idx)];
        if (p) exportPoemSilkPostcardPng(p);
      });
    });
  }

  // ==================== MODULE 7: WATCH TOGETHER (LIVE 24 FPS CANVAS STAGE) ====================
  let watchStageBubbles = [];

  function spawnWatchReactionBubble(rxKey) {
    const labelMap = {
      laugh: "Vui quá",
      clap: "Vỗ tay",
      heart: "Thả tim",
      wow: "Tuyệt đẹp"
    };
    const colMap = {
      laugh: "#F5C242",
      clap: "#7DE0AD",
      heart: "#FF998A",
      wow: "#9ED8FF"
    };
    watchStageBubbles.push({
      text: labelMap[rxKey] || "Hay quá",
      color: colMap[rxKey] || "#FFE6A8",
      xFrac: 0.22 + Math.random() * 0.56,
      bornAt: performance.now()
    });
    if (watchStageBubbles.length > 14) {
      watchStageBubbles = watchStageBubbles.slice(-14);
    }
  }

  function mountWatchStageCanvas(chIdx) {
    if (watchAnimId) {
      cancelAnimationFrame(watchAnimId);
      watchAnimId = null;
    }
    const canvas = document.getElementById("watch-stage-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rectW = Math.max(300, Math.round(canvas.clientWidth || 336));
    const rectH = 196;
    canvas.width = Math.round(rectW * dpr);
    canvas.height = Math.round(rectH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let lastDrawTs = 0;
    const drawFrame = (ts) => {
      if (state.route !== "watch" || !document.body.contains(canvas)) {
        watchAnimId = null;
        return;
      }
      if (ts - lastDrawTs >= 40) {
        lastDrawTs = ts;
        const t = ts * 0.001;
        ctx.clearRect(0, 0, rectW, rectH);

        if (chIdx === 0) {
          // Channel 0: Morning Breathing Lotus (4s inhale - 4s hold - 6s exhale = 14s)
          const bg = ctx.createLinearGradient(0, 0, 0, rectH);
          bg.addColorStop(0, "#102820");
          bg.addColorStop(1, "#1C3F33");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, rectW, rectH);

          const cycle = t % 14;
          let breathScale = 0.62;
          let phaseText = "Hít vào sâu bằng mũi (4 giây)";
          let subText = "Mở rộng lồng ngực nhẹ nhàng";
          if (cycle < 4) {
            const p = cycle / 4;
            breathScale = 0.58 + 0.42 * (0.5 - 0.5 * Math.cos(Math.PI * p));
            phaseText = `Hít vào chậm · ${Math.ceil(4 - cycle)}s`;
            subText = "Đón khí lành buổi sớm";
          } else if (cycle < 8) {
            breathScale = 1.0 + 0.02 * Math.sin(t * 3);
            phaseText = `Giữ hơi ấm · ${Math.ceil(8 - cycle)}s`;
            subText = "Thả lỏng hai vai và cổ";
          } else {
            const p = (cycle - 8) / 6;
            breathScale = 1.0 - 0.42 * (0.5 - 0.5 * Math.cos(Math.PI * p));
            phaseText = `Thở ra êm · ${Math.ceil(14 - cycle)}s`;
            subText = "Thở sạch hơi chậm rãi qua miệng";
          }

          const cx = rectW * 0.5;
          const cy = 84;
          const rOuter = 54 * breathScale;

          // Soft golden-jade aura
          const aura = ctx.createRadialGradient(cx, cy, 6, cx, cy, rOuter + 24);
          aura.addColorStop(0, "rgba(247, 214, 116, 0.48)");
          aura.addColorStop(0.6, "rgba(68, 179, 134, 0.24)");
          aura.addColorStop(1, "rgba(16, 40, 32, 0)");
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(cx, cy, rOuter + 24, 0, Math.PI * 2);
          ctx.fill();

          // 8 Lotus petals
          for (let k = 0; k < 8; k++) {
            const ang = (k * Math.PI) / 4 + t * 0.12;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ang);
            ctx.beginPath();
            ctx.ellipse(0, -rOuter * 0.46, rOuter * 0.24, rOuter * 0.48, 0, 0, Math.PI * 2);
            ctx.fillStyle = k % 2 === 0 ? "rgba(245, 200, 108, 0.78)" : "rgba(118, 219, 174, 0.68)";
            ctx.fill();
            ctx.restore();
          }

          ctx.fillStyle = "#FFF7DC";
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.textAlign = "center";
          ctx.fillStyle = "#FFFDF7";
          ctx.font = "bold 20px sans-serif";
          ctx.fillText(phaseText, cx, 162);
          ctx.fillStyle = "#CBEAD9";
          ctx.font = "15px sans-serif";
          ctx.fillText(subText, cx, 184);
        } else if (chIdx === 1) {
          // Channel 1: Folk Cheo / Comedy Velvet Stage
          const bg = ctx.createLinearGradient(0, 0, 0, rectH);
          bg.addColorStop(0, "#2A1215");
          bg.addColorStop(0.75, "#471D20");
          bg.addColorStop(1, "#3B2416");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, rectW, rectH);

          // Warm sweeping spotlight
          const spotX = rectW * (0.5 + 0.18 * Math.sin(t * 0.85));
          const spot = ctx.createRadialGradient(spotX, 88, 10, spotX, 96, 118);
          spot.addColorStop(0, "rgba(255, 224, 148, 0.36)");
          spot.addColorStop(1, "rgba(42, 18, 21, 0)");
          ctx.fillStyle = spot;
          ctx.fillRect(0, 0, rectW, rectH);

          // Stage wooden apron
          ctx.fillStyle = "#5C3720";
          ctx.fillRect(0, 152, rectW, 44);
          ctx.strokeStyle = "#D49B3E";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 152);
          ctx.lineTo(rectW, 152);
          ctx.stroke();

          // Velvet side curtains
          ctx.fillStyle = "#8B2220";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(48, 0);
          ctx.quadraticCurveTo(30, 82, 18, 152);
          ctx.lineTo(0, 152);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(rectW, 0);
          ctx.lineTo(rectW - 48, 0);
          ctx.quadraticCurveTo(rectW - 30, 82, rectW - 18, 152);
          ctx.lineTo(rectW, 152);
          ctx.closePath();
          ctx.fill();

          // Traditional fan & lantern silhouettes on stage
          const fanSwing = Math.sin(t * 1.8) * 0.14;
          ctx.save();
          ctx.translate(rectW * 0.5, 118);
          ctx.rotate(fanSwing);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, 44, -Math.PI * 0.82, -Math.PI * 0.18);
          ctx.closePath();
          ctx.fillStyle = "#F2C464";
          ctx.fill();
          ctx.strokeStyle = "#8C3526";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

          ctx.textAlign = "center";
          ctx.fillStyle = "#FFEBC2";
          ctx.font = "bold 17px sans-serif";
          ctx.fillText("Sân khấu Chiếu Chèo & Hài kịch tối", rectW * 0.5, 178);
        } else {
          // Channel 2: Peaceful Vietnamese Countryside Sunset & Bamboo Flute
          const sky = ctx.createLinearGradient(0, 0, 0, 132);
          sky.addColorStop(0, "#2E2436");
          sky.addColorStop(0.55, "#8E4B32");
          sky.addColorStop(1, "#E5A552");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, rectW, 132);

          // Setting sun
          const sunX = rectW * 0.68;
          ctx.fillStyle = "rgba(255, 232, 166, 0.88)";
          ctx.beginPath();
          ctx.arc(sunX, 86, 22, 0, Math.PI * 2);
          ctx.fill();

          // Distant hills
          ctx.fillStyle = "#3B2B28";
          ctx.beginPath();
          ctx.moveTo(0, 132);
          ctx.quadraticCurveTo(rectW * 0.25, 92, rectW * 0.52, 124);
          ctx.quadraticCurveTo(rectW * 0.78, 98, rectW, 128);
          ctx.lineTo(rectW, 132);
          ctx.closePath();
          ctx.fill();

          // Calm lotus pond water
          const pond = ctx.createLinearGradient(0, 132, 0, rectH);
          pond.addColorStop(0, "#2F4544");
          pond.addColorStop(1, "#182829");
          ctx.fillStyle = pond;
          ctx.fillRect(0, 132, rectW, rectH - 132);

          // Shimmering water ripples
          ctx.strokeStyle = "rgba(255, 222, 148, 0.45)";
          ctx.lineWidth = 1.4;
          for (let r = 0; r < 4; r++) {
            const ry = 144 + r * 11;
            const rw = 36 - r * 5 + Math.sin(t * 2 + r) * 6;
            ctx.beginPath();
            ctx.moveTo(sunX - rw, ry);
            ctx.lineTo(sunX + rw, ry);
            ctx.stroke();
          }

          // Swaying bamboo stalks on left bank
          const sway = Math.sin(t * 1.4) * 6;
          ctx.strokeStyle = "#1D2A1E";
          ctx.lineWidth = 3;
          [26, 42, 56].forEach((bx, bi) => {
            ctx.beginPath();
            ctx.moveTo(bx, 140);
            ctx.quadraticCurveTo(bx + sway * 0.5, 80, bx + sway + bi * 3, 24 + bi * 10);
            ctx.stroke();
          });

          // Flying white herons
          for (let h = 0; h < 2; h++) {
            const hx = ((t * 22 + h * 90) % (rectW + 60)) - 30;
            const hy = 46 + h * 16 + Math.sin(t * 3 + h) * 4;
            const wing = Math.sin(t * 6 + h) * 5;
            ctx.strokeStyle = "#FFF6E0";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(hx - 8, hy + wing);
            ctx.quadraticCurveTo(hx - 3, hy - 4, hx, hy);
            ctx.quadraticCurveTo(hx + 3, hy - 4, hx + 8, hy + wing);
            ctx.stroke();
          }
        }

        // Floating community reaction pills
        watchStageBubbles = watchStageBubbles.filter((b) => ts - b.bornAt < 2400);
        watchStageBubbles.forEach((b) => {
          const age = (ts - b.bornAt) / 2400;
          const bx = b.xFrac * rectW + Math.sin(age * 6) * 8;
          const by = rectH - 22 - age * 125;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - age);
          ctx.fillStyle = "rgba(24, 18, 14, 0.78)";
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.roundRect(bx - 38, by - 13, 76, 24, 12);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = b.color;
          ctx.textAlign = "center";
          ctx.font = "bold 13px sans-serif";
          ctx.fillText(b.text, bx, by + 4);
          ctx.restore();
        });
      }
      watchAnimId = requestAnimationFrame(drawFrame);
    };
    watchAnimId = requestAnimationFrame(drawFrame);
  }

  function renderWatch() {
    const ch = D.WATCH_CHANNELS[state.watch.channelIdx];
    const r = state.watch.reactions;

    els.main.innerHTML = `
      <h1>Phòng xem chung</h1>
      <p class="lead-copy">Chiếu theo giờ hẹn cố định cùng 38 bác khác. Nội dung có giấy phép rõ ràng, phụ đề chữ lớn.</p>

      <div class="watch-screen">
        <div class="watch-canvas-area">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; flex-wrap:wrap;">
            <span class="badge-tag amber" style="white-space:normal; max-width:100%; text-align:left;">${escHtml(ch.slot)}</span>
            <small style="color:#E0D4BE; font-weight:600;">39 bác đang xem</small>
          </div>
          <canvas id="watch-stage-canvas" class="watch-live-canvas" aria-label="Màn hình sân khấu trực tiếp ${escHtml(ch.title)}"></canvas>
          <h2 style="color:#FFFDF7; font-size:1.12rem;">${escHtml(ch.title)}</h2>
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

    mountWatchStageCanvas(state.watch.channelIdx);

    document.getElementById("btn-watch-play").addEventListener("click", () => {
      trackTelemetryDirect("watch_play", "watch", "listen_channel", { channelIdx: state.watch.channelIdx, title: ch.title });
      speak(`${ch.title}. ${ch.subtitle}`, { announceToast: true });
    });

    els.main.querySelectorAll(".reaction-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const rxKey = b.dataset.rx;
        state.watch.reactions[rxKey] += 1;
        const numEl = b.querySelector("strong.num");
        if (numEl) numEl.textContent = String(state.watch.reactions[rxKey]);
        spawnWatchReactionBubble(rxKey);
        trackTelemetryDirect("watch_reaction", "watch", `react_${rxKey}`, { channelIdx: state.watch.channelIdx });
        saveState();
      });
    });

    els.main.querySelectorAll(".vote-ch-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const idx = Number(b.dataset.idx);
        state.watch.channelIdx = idx;
        state.watch.votes[idx] += 1;
        trackTelemetryDirect("watch_channel", "watch", `switch_channel_${idx}`, { channelIdx: idx });
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

  const FORTUNE_COOLDOWN_MS = 45000;
  const WISH_COOLDOWN_MS = 45000;
  const POND_LANTERN_TTL_MS = 180000;

  function playFortuneShakeSound() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const base = ctx.currentTime;
      [0, 0.09, 0.18, 0.28, 0.4].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(620 + (idx % 3) * 115, base + offset);
        osc.frequency.exponentialRampToValueAtTime(360, base + offset + 0.06);
        gain.gain.setValueAtTime(0.22, base + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, base + offset + 0.075);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(base + offset);
        osc.stop(base + offset + 0.08);
      });
    } catch (e) {}
  }

  function getFortuneCooldownSec() {
    const last = Number(state.zen && state.zen.lastPeaceCardAt) || 0;
    if (!last) return 0;
    const rem = Math.ceil((last + FORTUNE_COOLDOWN_MS - Date.now()) / 1000);
    return rem > 0 ? rem : 0;
  }

  function getWishCooldownSec() {
    const last = Number(state.zen && state.zen.lastWishCardAt) || 0;
    if (!last) return 0;
    const rem = Math.ceil((last + WISH_COOLDOWN_MS - Date.now()) / 1000);
    return rem > 0 ? rem : 0;
  }

  function pruneAndGetActiveLanterns() {
    if (!state.zen || !Array.isArray(state.zen.activeLanterns)) return [];
    const now = Date.now();
    const alive = state.zen.activeLanterns.filter((it) => it && (Number(it.expiresAt) || 0) > now);
    if (alive.length !== state.zen.activeLanterns.length) {
      state.zen.activeLanterns = alive;
      saveState();
    }
    return alive;
  }

  function appendActivePondLantern(ownerName, isUser) {
    if (!state.zen) return [];
    const now = Date.now();
    const alive = pruneAndGetActiveLanterns();
    alive.push({
      id: `lt_${now}_${Math.random().toString(36).slice(2, 6)}`,
      ownerName: String(ownerName || state.user.name || "Bạn trà").slice(0, 22),
      isUser: Boolean(isUser),
      spawnAt: now,
      expiresAt: now + POND_LANTERN_TTL_MS,
      phase: Math.random() * Math.PI * 2
    });
    state.zen.activeLanterns = alive.slice(-14);
    saveState();
    return state.zen.activeLanterns;
  }

  function getZenSpaceMeta(rawSpaceIdx) {
    const idx = Math.max(0, Math.min(2, Number(rawSpaceIdx) || 0));
    if (idx === 1) {
      return {
        idx: 1,
        heading: "Nhà Thờ Họ & Từ Đường Tộc Việt",
        plaqueTitle: "ĐỨC LƯU QUANG · UỐNG NƯỚC NHỚ NGUỒN",
        camWide: "Gian Bái Đường",
        camAltar: "Hương Án Gia Tiên",
        camYard: "Hồ Sen & Cây Thẻ Đỏ",
        incenseBtn: "Dâng Hương Tiên Tổ",
        muyuBtn: "Gõ Phách Tĩnh Tâm (+1)",
        autoMuyuIdle: "Bật Nhịp Tĩnh Tâm Đều Đặn",
        autoMuyuRunning: "Đang Giữ Nhịp Tĩnh Tâm (Chạm để về chiếu)",
        bellBtn: "Thỉnh Khánh Đồng",
        fortuneBtn: "Rút Xăm Gia Huấn",
        prayerHeading: "Viết Lời Khấn Gia Tiên & Treo Thẻ Đỏ Cây Lộc",
        prayerVoicePrefix: "Thành tâm kính lễ Tiên Tổ. Lời khấn nguyện của",
        slipSeal: "GIA PHONG PHÚC ẤM",
        cardBadge: "Quẻ Gia Huấn Đầu Ngày",
        presets: [
          "Con cháu thành tâm dâng nén hương trầm tưởng nhớ công đức Tổ tiên.",
          "Cầu mong đại gia đình thuận hòa, con cháu thảo hiền, học hành tấn tới.",
          "Kính chúc các bậc cao niên trong họ trường thọ, bách niên giai lão.",
          "Giữ gìn gia phong nề nếp, uống nước nhớ nguồn, phúc ấm muôn đời."
        ]
      };
    }
    if (idx === 2) {
      return {
        idx: 2,
        heading: "Vườn Thiền Tĩnh Lặng & Hồ Sen",
        plaqueTitle: "TÂM TỊNH AN NHIÊN · TRÚC LÂM TĨNH TỌA",
        camWide: "Thiền Đường Trúc Lâm",
        camAltar: "Bàn Trà Thiền Tĩnh",
        camYard: "Hồ Sen & Cây Thẻ Đỏ",
        incenseBtn: "Thắp Trầm Tĩnh Tâm",
        muyuBtn: "Gõ Mõ Thiền (+1)",
        autoMuyuIdle: "Bật Tự Động Gõ Mõ Thiền Đều Nhịp",
        autoMuyuRunning: "Đang Gõ Mõ Thiền Đều Nhịp (Chạm để về chiếu)",
        bellBtn: "Thỉnh Chuông Thiền",
        fortuneBtn: "Rút Thẻ Thiền Ngữ",
        prayerHeading: "Gửi Lời Nguyện An Nhiên & Treo Thẻ Đỏ Vườn Thiền",
        prayerVoicePrefix: "Giữ tâm thanh tịnh. Lời nguyện an lành của",
        slipSeal: "TÂM AN VẠN SỰ AN",
        cardBadge: "Thẻ Thiền Ngữ Tĩnh Tâm",
        presets: [
          "Hít vào tâm tĩnh lặng, thở ra miệng mỉm cười, an trú ngay phút giây này.",
          "Chúc bạn đồng niên thân khỏe tâm an, mỗi sớm mai thức dậy đều nhẹ nhõm.",
          "Buông bớt lo toan thường nhật, giữ lòng trong sáng như mặt hồ sen.",
          "Cầu chúc mọi nhà bình yên, xóm giềng ấm áp nghĩa tình sớm tối."
        ]
      };
    }
    return {
      idx: 0,
      heading: "Sân Chùa Quê & Đạo Tràng 20 Bồ Đoàn",
      plaqueTitle: "TÂM AN VẠN SỰ AN",
      camWide: "Đại sảnh 20 Chiếu",
      camAltar: "Cận cảnh Tam Bảo",
      camYard: "Hồ Sen & Cây Thẻ Đỏ",
      incenseBtn: "Lên Dâng Hương",
      muyuBtn: "Lên Gõ Mõ (+1)",
      autoMuyuIdle: "Bật Tự Động Lên Gõ Mõ Đều Nhịp",
      autoMuyuRunning: "Đang Đứng Gõ Mõ Đều Nhịp (Chạm để về chiếu)",
      bellBtn: "Lên Thỉnh Chuông",
      fortuneBtn: "Lên Xin Xăm / Quẻ",
      prayerHeading: "Viết Sớ Cầu Nguyện & Treo Thẻ Đỏ Sân Chùa",
      prayerVoicePrefix: "Nam mô A Di Đà Phật. Hồi hướng lời cầu an của",
      slipSeal: "LỘC PHÚC ĐẦU NGÀY",
      cardBadge: "Quẻ Xăm Thiện Lành Đầu Ngày",
      presets: D.TEMPLE_PRAYER_PRESETS || []
    };
  }

  function showCeremonialRedSlipOverlay(opts) {
    const prev = document.querySelector(".red-slip-backdrop");
    if (prev) prev.remove();
    const o = opts || {};
    const spMeta = getZenSpaceMeta(state.zen.spaceIdx);
    const card = o.card || (D.TEMPLE_PEACE_CARDS && D.TEMPLE_PEACE_CARDS[0]);
    if (!card) return;
    const spaceTitle =
      (Array.isArray(card.spaceCodes) && card.spaceCodes[spMeta.idx]) || card.code || "Quẻ Bình An";
    const wishLine = String(o.wishText || "").trim();
    const cooldownSec = Number(o.cooldownSec) || 45;
    const sealLabel = o.kind === "wish_plaque" ? "THẺ ĐỎ ƯỚC NGUYỆN" : spMeta.slipSeal;

    const backdrop = document.createElement("div");
    backdrop.className = "red-slip-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", spaceTitle);
    backdrop.innerHTML = `
      <div class="red-slip-card">
        <span class="red-slip-seal">${escHtml(sealLabel)}</span>
        <div class="red-slip-title">${escHtml(spaceTitle)}</div>
        <div class="red-slip-sub">${escHtml(o.subtitle || spMeta.heading)}</div>
        <div class="red-slip-verse-box">
          <div class="red-slip-verse">${escHtml(card.verse)}</div>
        </div>
        ${
          wishLine
            ? `<div class="red-slip-wish-quote"><strong>Lời nguyện trên thẻ đỏ:</strong> "${escHtml(wishLine)}"</div>`
            : ""
        }
        <div class="red-slip-advice">${escHtml(card.advice)}</div>
        <span class="red-slip-cooldown-pill num">${
          o.isReopen
            ? "Đang xem lại tờ giấy đỏ của bác"
            : `Đã trao tờ giấy đỏ · Hồi lượt rút tiếp sau ${cooldownSec}s`
        }</span>
        <div class="red-slip-actions">
          <button type="button" class="btn-red-slip-gold" id="btn-red-slip-speak">
            ${ico("speaker")}
            <span>Nghe đọc lời quẻ trên giấy đỏ</span>
          </button>
          <button type="button" class="btn-red-slip-close" id="btn-red-slip-dismiss">Giữ Lộc Bình An &amp; Đóng</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const closeSlip = () => {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    };
    backdrop.addEventListener("click", (ev) => {
      if (ev.target === backdrop) closeSlip();
    });
    const dismissBtn = backdrop.querySelector("#btn-red-slip-dismiss");
    if (dismissBtn) dismissBtn.addEventListener("click", closeSlip);
    const speakBtn = backdrop.querySelector("#btn-red-slip-speak");
    if (speakBtn) {
      speakBtn.addEventListener("click", () => {
        awardSkillPoints("voice_wisdom", 1);
        const spoken = wishLine
          ? `${spaceTitle}. ${card.verse}. Lời nguyện của bác: ${wishLine}. Lời nhắn gửi: ${card.advice}`
          : `${spaceTitle}. ${card.verse}. Lời nhắn gửi: ${card.advice}`;
        speak(spoken, {
          clipId: wishLine ? undefined : card.clipId,
          announceToast: true
        });
      });
    }
  }

  function triggerTempleVisualWave(colorHex, popText, ritualKind, preferredCushionIdx) {
    if (!window.TempleScene3D) return;
    if (ritualKind === "bell") {
      window.TempleScene3D.triggerBell(popText || "Chánh Điện", preferredCushionIdx);
    } else if (ritualKind === "muyu") {
      window.TempleScene3D.triggerMuyu(state.zen.muyuCount || 1);
    } else if (ritualKind === "wish_plaque") {
      window.TempleScene3D.spawnWishPlaque(popText || state.user.name, false, "", preferredCushionIdx);
    } else if (ritualKind === "pond_lantern") {
      const alive = appendActivePondLantern(popText || "Bạn trực tuyến", false);
      window.TempleScene3D.updateConfig({ activeLanterns: alive });
      window.TempleScene3D.spawnPondLantern(popText || state.user.name, preferredCushionIdx);
    } else {
      window.TempleScene3D.triggerIncense(popText || state.user.name, preferredCushionIdx);
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

  function buildTemplePeaceCardHtml(curCard) {
    if (!curCard) return "";
    const spMeta = getZenSpaceMeta(state.zen.spaceIdx);
    const spaceTitle =
      (Array.isArray(curCard.spaceCodes) && curCard.spaceCodes[spMeta.idx]) || curCard.code;
    return `
      <div class="peace-card-slip" id="peace-card-box">
        <div class="passcard-head">
          <strong style="color:#7A3E12;">${escHtml(spaceTitle)}</strong>
          <span class="badge-tag amber">${escHtml(spMeta.cardBadge)}</span>
        </div>
        <div class="peace-card-verse">${escHtml(curCard.verse)}</div>
        <p style="font-size:0.92rem; color:var(--ink-primary);">${escHtml(curCard.advice)}</p>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-zen-listen">${ico("speaker")}<span>Nghe đọc lời quẻ</span></button>
          <button type="button" class="btn-primary" id="btn-zen-reopen-slip">${ico("award")}<span>Mở tờ giấy đỏ</span></button>
        </div>
      </div>
    `;
  }

  function bindTemplePeaceCardEvents(curCard) {
    const spMeta = getZenSpaceMeta(state.zen.spaceIdx);
    const spaceTitle =
      curCard && Array.isArray(curCard.spaceCodes) && curCard.spaceCodes[spMeta.idx]
        ? curCard.spaceCodes[spMeta.idx]
        : curCard
        ? curCard.code
        : "";
    const listenBtn = document.getElementById("btn-zen-listen");
    if (listenBtn && curCard) {
      listenBtn.addEventListener("click", () => {
        awardSkillPoints("voice_wisdom", 1);
        speak(`${spaceTitle}. ${curCard.verse}. Lời nhắn gửi: ${curCard.advice}`, {
          clipId: curCard.clipId,
          announceToast: true
        });
      });
    }
    const reopenBtn = document.getElementById("btn-zen-reopen-slip");
    if (reopenBtn && curCard) {
      reopenBtn.addEventListener("click", () => {
        showCeremonialRedSlipOverlay({
          card: curCard,
          kind: "peace_card",
          isReopen: true
        });
      });
    }
  }

  function buildTemplePrayersListHtml(prayers) {
    const spMeta = getZenSpaceMeta(state.zen.spaceIdx);
    const tagWish = spMeta.idx === 1 ? "Thẻ đỏ cây lộc" : spMeta.idx === 2 ? "Thẻ đỏ vườn thiền" : "Thẻ đỏ sân chùa";
    return `
      <strong>Bảng Tâm Thành &amp; Lời Nguyện (${prayers.length}):</strong>
      ${prayers
        .map(
          (item, pIdx) => `
          <div class="bulletin-item">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.88rem; color:var(--accent-jade); font-weight:700;">
              <span>${escHtml(item.userName)}${typeof item.cushionIdx === "number" ? ` · Chiếu ${item.cushionIdx + 1}` : ""}</span>
              <span>${escHtml(item.ritualKind === "wish_plaque" ? tagWish : "Hương trầm")} · ${escHtml(item.province || "")}</span>
            </div>
            <p>${escHtml(item.prayerText)}</p>
            <button type="button" class="btn-mini listen-prayer-btn" data-prayer-idx="${pIdx}" style="align-self:flex-start;">
              ${ico("speaker")}
              <span>Nghe đọc lời nguyện</span>
            </button>
          </div>
        `
        )
        .join("")}
    `;
  }

  function bindTemplePrayersListEvents(prayers) {
    const spMeta = getZenSpaceMeta(state.zen.spaceIdx);
    els.main.querySelectorAll(".listen-prayer-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const item = prayers[Number(b.dataset.prayerIdx)];
        if (!item) return;
        playTempleBell();
        speak(`${spMeta.prayerVoicePrefix} ${item.userName}, quê ${item.province || "Việt Nam"}: ${item.prayerText}`, {
          announceToast: true
        });
      });
    });
  }

  function refreshZenPrayersHostIfActive() {
    if (state.route !== "zen") return;
    const host = document.getElementById("temple-prayers-list-host");
    if (!host) return;
    const prayers = getMergedTemplePrayers();
    host.innerHTML = buildTemplePrayersListHtml(prayers);
    bindTemplePrayersListEvents(prayers);
    if (window.TempleScene3D && typeof window.TempleScene3D.updateConfig === "function") {
      window.TempleScene3D.updateConfig({
        incenseCount: state.zen.incenseCount || 14,
        totalWishCount: state.zen.wishPlaquesCount || 16,
        wishes: prayers
      });
    }
  }

  function buildTempleTenCushionAttendees() {
    const rawSeat =
      typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx)
        ? Math.floor(state.zen.userCushionIdx)
        : 2;
    const myCushion = Math.max(0, Math.min(19, rawSeat));
    const prog = getSeniorityProgress();
    const occupiedMap = {};

    occupiedMap[myCushion] = {
      cushionIdx: myCushion,
      name: state.user.name,
      shortLabel: "Bạn",
      robeStyle: state.user.outfitId === "ao-ba-ba" ? "nau" : "lam",
      outfitColor: getOutfit(state.user.outfitId).color,
      isFemale: state.user.honorific === "Chị",
      seniorityLevel: prog.current ? prog.current.level : 0,
      isUser: true,
      isRealPeer: false
    };

    const livePeers = RT ? RT.getOnlinePeers() : [];
    let nextFree = 0;
    const takeFreeSlot = (preferred) => {
      if (typeof preferred === "number" && preferred >= 0 && preferred <= 19 && !occupiedMap[preferred]) {
        return preferred;
      }
      while (nextFree < 20 && occupiedMap[nextFree]) nextFree += 1;
      return nextFree < 20 ? nextFree : -1;
    };

    livePeers.slice(0, 8).forEach((lp, idx) => {
      const slot = takeFreeSlot(typeof lp.cushionIdx === "number" ? lp.cushionIdx : undefined);
      if (slot >= 0) {
        occupiedMap[slot] = {
          cushionIdx: slot,
          name: lp.name || "Bạn trực tuyến",
          shortLabel: String(lp.name || "Bạn thật").slice(0, 9),
          robeStyle: idx % 2 === 0 ? "lam" : "nau",
          outfitColor: lp.outfitColor || "#2E5E4E",
          isFemale: /^(Chị|Cô|Bà)/i.test(lp.name || ""),
          seniorityLevel: lp.seniorityLevel || 6,
          isUser: false,
          isRealPeer: true
        };
      }
    });

    // 13 đạo hữu cao niên ngồi rải đều khắp 4 hàng (giữ lại ~6 chiếu trống để các bác tùy ý đổi chỗ)
    const companionSeeds = [
      { pref: 0, name: "Cụ Hòa", shortLabel: "Cụ Hòa", robeStyle: "nau", isFemale: false, seniorityLevel: 26 },
      { pref: 1, name: "Chị Lan", shortLabel: "Chị Lan", robeStyle: "lam", isFemale: true, seniorityLevel: 14 },
      { pref: 2, name: "Bác Phúc", shortLabel: "Bác Phúc", robeStyle: "lam", isFemale: false, seniorityLevel: 21 },
      { pref: 3, name: "Anh Minh", shortLabel: "Anh Minh", robeStyle: "lam", isFemale: false, seniorityLevel: 18 },
      { pref: 4, name: "Chị Hạnh", shortLabel: "Chị Hạnh", robeStyle: "nau", isFemale: true, seniorityLevel: 23 },
      { pref: 8, name: "Cô Thảo", shortLabel: "Cô Thảo", robeStyle: "nau", isFemale: true, seniorityLevel: 12 },
      { pref: 9, name: "Anh Vĩnh", shortLabel: "Anh Vĩnh", robeStyle: "nau", isFemale: false, seniorityLevel: 15 },
      { pref: 10, name: "Chị Mai", shortLabel: "Chị Mai", robeStyle: "lam", isFemale: true, seniorityLevel: 9 },
      { pref: 12, name: "Chú Sơn", shortLabel: "Chú Sơn", robeStyle: "lam", isFemale: false, seniorityLevel: 16 },
      { pref: 13, name: "Cô Dung", shortLabel: "Cô Dung", robeStyle: "nau", isFemale: true, seniorityLevel: 11 },
      { pref: 15, name: "Bác Tùng", shortLabel: "Bác Tùng", robeStyle: "nau", isFemale: false, seniorityLevel: 19 },
      { pref: 16, name: "Chị Liên", shortLabel: "Chị Liên", robeStyle: "lam", isFemale: true, seniorityLevel: 10 },
      { pref: 19, name: "Anh Khải", shortLabel: "Anh Khải", robeStyle: "lam", isFemale: false, seniorityLevel: 13 }
    ];

    companionSeeds.forEach((sc) => {
      if (Object.keys(occupiedMap).length >= 14) return;
      const slot = takeFreeSlot(sc.pref);
      if (slot >= 0) {
        occupiedMap[slot] = Object.assign({ cushionIdx: slot, isUser: false, isRealPeer: false }, sc);
      }
    });

    return Object.values(occupiedMap);
  }

  function renderZen() {
    if (zenCooldownTimerId) {
      clearInterval(zenCooldownTimerId);
      zenCooldownTimerId = null;
    }
    const spIdx = Math.max(0, Math.min(2, Number(state.zen.spaceIdx) || 0));
    const sp = D.ZEN_SPACES[spIdx] || D.ZEN_SPACES[0];
    const spMeta = getZenSpaceMeta(spIdx);
    const cards = D.TEMPLE_PEACE_CARDS || [];
    const curCard = cards[(state.zen.peaceCardIdx || 0) % cards.length];
    const prayers = getMergedTemplePrayers();
    const attendees = buildTempleTenCushionAttendees();
    const activeLanterns = pruneAndGetActiveLanterns();
    const camMode = state.zen.cameraView || "wide";
    const myCushion = Math.max(
      0,
      Math.min(19, typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx) ? Math.floor(state.zen.userCushionIdx) : 2)
    );
    const isAutoMuyuActive = Boolean(autoMuyuTimerId);
    const initFortuneCd = getFortuneCooldownSec();
    const initWishCd = getWishCooldownSec();

    els.main.innerHTML = `
      <h1>${escHtml(spMeta.heading)}</h1>

      <div class="temple-cam-bar" role="tablist" aria-label="Chọn không gian tĩnh tâm">
        ${D.ZEN_SPACES.map(
          (s, i) => `<button type="button" class="temple-cam-btn ${spIdx === i ? "active" : ""}" data-zen="${i}">${escHtml(s.name)}</button>`
        ).join("")}
      </div>

      <div class="temple-cam-bar" role="group" aria-label="Chọn góc nhìn không gian">
        <button type="button" class="temple-cam-btn ${camMode === "wide" ? "active" : ""}" data-tcam="wide">${escHtml(spMeta.camWide)}</button>
        <button type="button" class="temple-cam-btn ${camMode === "cushions" ? "active" : ""}" data-tcam="cushions">${escHtml(spMeta.camAltar)}</button>
        <button type="button" class="temple-cam-btn ${camMode === "courtyard" ? "active" : ""}" data-tcam="courtyard">${escHtml(spMeta.camYard)}</button>
      </div>

      <div class="temple-sanctuary-wrap" id="temple-3d-stage" aria-label="${escHtml(spMeta.heading)}"></div>

      <button type="button" class="btn-${isAutoMuyuActive ? "primary" : "jade"}" id="btn-temple-auto-muyu">
        ${ico("bell")}
        <span id="auto-muyu-label">${escHtml(isAutoMuyuActive ? spMeta.autoMuyuRunning : spMeta.autoMuyuIdle)}</span>
      </button>

      <div class="temple-ritual-grid" role="group" aria-label="Nghi thức tĩnh tâm và sân Hồ Sen">
        <button type="button" class="btn-primary" id="btn-temple-incense">
          <span>${escHtml(spMeta.incenseBtn)}</span>
        </button>
        <button type="button" class="btn-jade" id="btn-temple-muyu">
          <span>${escHtml(spMeta.muyuBtn)}</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-ring-bell">
          ${ico("bell")}
          <span>${escHtml(spMeta.bellBtn)}</span>
        </button>
        <button type="button" class="btn-secondary ${initFortuneCd > 0 ? "is-cooldown" : ""}" id="btn-draw-peace-card">
          <span class="num">${initFortuneCd > 0 ? `Hồi xăm (${initFortuneCd}s)` : escHtml(spMeta.fortuneBtn)}</span>
        </button>
        <button type="button" class="btn-secondary" id="btn-temple-pond-lantern">
          ${ico("lotus")}
          <span class="num">Thả Hoa Đăng (${activeLanterns.length > 0 ? `${activeLanterns.length} đang trôi` : state.zen.lanternsReleased || 18})</span>
        </button>
        <button type="button" class="btn-secondary ${initWishCd > 0 ? "is-cooldown" : ""}" id="btn-temple-hang-wish">
          ${ico("award")}
          <span class="num">${initWishCd > 0 ? `Hồi thẻ (${initWishCd}s)` : `Rút & Treo Thẻ Đỏ (${state.zen.wishPlaquesCount || 16})`}</span>
        </button>
      </div>

      <details class="surface-panel">
        <summary style="cursor:pointer; font-weight:700; display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <span id="zen-cushion-summary-text">Đổi chỗ trong 20 Chiếu ngồi (Đang ngồi chiếu ${myCushion + 1})</span>
          <span class="badge-tag jade num">${attendees.length}/20 bác</span>
        </summary>
        <div class="cushion-pick-grid" id="zen-cushion-grid" role="group" aria-label="Chọn vị trí chiếu ngồi từ 1 đến 20" style="margin-top:10px;">
          ${Array.from({ length: 20 }, (_, idx) => {
            const occ = attendees.find((a) => a.cushionIdx === idx);
            const isMe = idx === myCushion;
            const sub = isMe ? "Bạn ngồi" : occ ? occ.shortLabel : "Trống";
            return `
              <button type="button" class="cushion-pick-btn ${isMe ? "selected" : ""} ${occ && occ.isRealPeer ? "peer-occupied" : ""}" data-cushion="${idx}">
                <span>Chiếu ${idx + 1}</span>
                <span style="font-weight:500;">${escHtml(sub)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </details>

      <div id="peace-card-host">${buildTemplePeaceCardHtml(curCard)}</div>

      <div class="surface-panel">
        <h3>${escHtml(spMeta.prayerHeading)}</h3>
        <div class="reply-stack">
          ${spMeta.presets
            .map(
              (pr, i) =>
                `<button type="button" class="reply-btn" data-prayer-preset="${escHtml(pr)}">${i + 1}. "${escHtml(pr)}"</button>`
            )
            .join("")}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input type="text" class="input-lg" id="temple-prayer-in" placeholder="Viết lời ước nguyện treo lên cây thẻ đỏ..." style="flex:1 1 185px; min-width:0;" />
          <button type="button" class="btn-primary btn-inline ${initWishCd > 0 ? "is-cooldown" : ""}" id="btn-send-prayer" style="flex:1 0 auto;">${initWishCd > 0 ? `Đợi ${initWishCd}s` : "Treo thẻ đỏ"}</button>
        </div>

        <div id="temple-prayers-list-host" style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
          ${buildTemplePrayersListHtml(prayers)}
        </div>
      </div>
    `;

    const syncZenCooldownAndLanternUi = () => {
      if (state.route !== "zen") {
        if (zenCooldownTimerId) {
          clearInterval(zenCooldownTimerId);
          zenCooldownTimerId = null;
        }
        return;
      }
      const fCd = getFortuneCooldownSec();
      const wCd = getWishCooldownSec();
      const aliveLanterns = pruneAndGetActiveLanterns();

      const drawBtn = document.getElementById("btn-draw-peace-card");
      if (drawBtn) {
        drawBtn.classList.toggle("is-cooldown", fCd > 0);
        const spEl = drawBtn.querySelector("span");
        if (spEl) spEl.textContent = fCd > 0 ? `Hồi xăm (${fCd}s)` : spMeta.fortuneBtn;
      }
      const wishBtn = document.getElementById("btn-temple-hang-wish");
      if (wishBtn) {
        wishBtn.classList.toggle("is-cooldown", wCd > 0);
        const spEl = wishBtn.querySelector("span");
        if (spEl) spEl.textContent = wCd > 0 ? `Hồi thẻ (${wCd}s)` : `Rút & Treo Thẻ Đỏ (${state.zen.wishPlaquesCount || 16})`;
      }
      const sendWishBtn = document.getElementById("btn-send-prayer");
      if (sendWishBtn) {
        sendWishBtn.classList.toggle("is-cooldown", wCd > 0);
        sendWishBtn.textContent = wCd > 0 ? `Đợi ${wCd}s` : "Treo thẻ đỏ";
      }
      const lanternBtn = document.getElementById("btn-temple-pond-lantern");
      if (lanternBtn) {
        const spEl = lanternBtn.querySelector("span");
        if (spEl) {
          spEl.textContent =
            aliveLanterns.length > 0
              ? `Thả Hoa Đăng (${aliveLanterns.length} đang trôi)`
              : `Thả Hoa Đăng (${state.zen.lanternsReleased || 18})`;
        }
      }
      if (window.TempleScene3D && typeof window.TempleScene3D.updateConfig === "function") {
        window.TempleScene3D.updateConfig({
          fortuneCooldownSec: fCd,
          wishCooldownSec: wCd,
          activeLanterns: aliveLanterns
        });
      }
    };

    zenCooldownTimerId = setInterval(syncZenCooldownAndLanternUi, 1000);

    const switchZenCameraSmooth = (nextCam) => {
      state.zen.cameraView = nextCam;
      saveState();
      els.main.querySelectorAll("[data-tcam]").forEach((el) => el.classList.toggle("active", el.dataset.tcam === nextCam));
      if (window.TempleScene3D) window.TempleScene3D.setCameraView(nextCam);
    };

    const refreshCushionPickerInPlace = (nextIdx) => {
      const nextAttendees = buildTempleTenCushionAttendees();
      const summaryEl = document.getElementById("zen-cushion-summary-text");
      if (summaryEl) summaryEl.textContent = `Đổi chỗ trong 20 Chiếu ngồi (Đang ngồi chiếu ${nextIdx + 1})`;
      const grid = document.getElementById("zen-cushion-grid");
      if (grid) {
        grid.querySelectorAll("[data-cushion]").forEach((btn) => {
          const idx = Number(btn.dataset.cushion);
          const occ = nextAttendees.find((a) => a.cushionIdx === idx);
          const isMe = idx === nextIdx;
          const sub = isMe ? "Bạn ngồi" : occ ? occ.shortLabel : "Trống";
          btn.classList.toggle("selected", isMe);
          btn.classList.toggle("peer-occupied", Boolean(!isMe && occ && occ.isRealPeer));
          const spans = btn.querySelectorAll("span");
          if (spans[1]) spans[1].textContent = sub;
        });
      }
      if (window.TempleScene3D && typeof window.TempleScene3D.updateConfig === "function") {
        window.TempleScene3D.updateConfig({
          userCushionIdx: nextIdx,
          attendees: nextAttendees
        });
      }
    };

    const activeSeat = () =>
      Math.max(
        0,
        Math.min(19, typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx) ? Math.floor(state.zen.userCushionIdx) : 2)
      );

    const doMuyuStep = (fromAuto) => {
      playWoodenFishSound();
      state.zen.muyuCount = (state.zen.muyuCount || 0) + 1;
      if (window.TempleScene3D) window.TempleScene3D.triggerMuyu(state.zen.muyuCount);
      if (!fromAuto) {
        showToast(`Đã giữ nhịp tĩnh tâm (+1 Tâm An · tổng ${state.zen.muyuCount})`);
      }
      if (!fromAuto || state.zen.muyuCount % 5 === 0) {
        awardSeniorityPoints(1, "temple_muyu", "chua-online", `Giữ nhịp tĩnh tâm (${state.zen.muyuCount} nhịp)`, {
          eventType: "temple_ritual",
          module: "zen",
          spaceIdx: spIdx,
          ritualKind: "muyu",
          cushionIdx: activeSeat()
        });
      } else {
        saveState();
      }
    };

    const scrollZenStageIntoViewSmooth = () => {
      const stg = document.getElementById("temple-3d-stage");
      if (!stg || typeof stg.getBoundingClientRect !== "function") return;
      const rect = stg.getBoundingClientRect();
      if (rect.top < 56 || rect.bottom > window.innerHeight) {
        stg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    const doBellStep = () => {
      playTempleBell();
      state.zen.bellCount = (state.zen.bellCount || 0) + 1;
      const seatNow = activeSeat();
      scrollZenStageIntoViewSmooth();
      if (window.TempleScene3D) window.TempleScene3D.triggerBell(state.user.name, seatNow);
      if (RT && typeof RT.publishTempleRitual === "function") {
        RT.publishTempleRitual({
          userName: state.user.name,
          ritualKind: "bell",
          cushionIdx: seatNow
        });
      }
      awardSeniorityPoints(2, "temple_bell", "chua-online", `${spMeta.bellBtn} tại ${sp.name}`, {
        eventType: "temple_ritual",
        module: "zen",
        spaceIdx: spIdx,
        ritualKind: "bell",
        cushionIdx: seatNow
      });
      showToast(`Đang bước lên ${spMeta.bellBtn.replace(/^lên\s+/i, "").toLowerCase()} ngân vang...`);
    };

    const doPondLanternStep = () => {
      playTempleBell();
      const seatNow = activeSeat();
      state.zen.lanternsReleased = (state.zen.lanternsReleased || 18) + 1;
      const aliveLanterns = appendActivePondLantern(state.user.name, true);
      if (state.zen.cameraView !== "courtyard") {
        switchZenCameraSmooth("courtyard");
      }
      scrollZenStageIntoViewSmooth();
      if (window.TempleScene3D) {
        window.TempleScene3D.updateConfig({
          lanternCount: state.zen.lanternsReleased,
          activeLanterns: aliveLanterns
        });
        window.TempleScene3D.spawnPondLantern(state.user.name, seatNow);
      }
      syncZenCooldownAndLanternUi();
      if (RT && typeof RT.publishTempleRitual === "function") {
        RT.publishTempleRitual({ userName: state.user.name, ritualKind: "pond_lantern", cushionIdx: seatNow });
      }
      awardSeniorityPoints(4, "temple_pond_lantern", "chua-online", `Thả Hoa Đăng sáng trên mặt Hồ Sen (${sp.name})`, {
        eventType: "temple_ritual",
        module: "zen",
        spaceIdx: spIdx,
        ritualKind: "pond_lantern",
        cushionIdx: seatNow
      });
      showToast("Đã thả đèn Hoa Đăng xuống Hồ Sen — đèn sẽ tỏa sáng trôi trên mặt nước trong 3 phút!");
    };

    const doDrawPeaceCardStep = () => {
      const waitSec = getFortuneCooldownSec();
      if (waitSec > 0) {
        showToast(`Ống xăm đang tĩnh lộc — mời bác đợi thêm ${waitSec} giây (hoặc bấm "Mở tờ giấy đỏ" để xem lại quẻ vừa rút).`);
        return;
      }
      playFortuneShakeSound();
      state.zen.lastPeaceCardAt = Date.now();
      state.zen.peaceCardIdx = ((state.zen.peaceCardIdx || 0) + 1) % Math.max(1, cards.length);
      const nextCard = cards[state.zen.peaceCardIdx];
      const nextTitle =
        nextCard && Array.isArray(nextCard.spaceCodes) && nextCard.spaceCodes[spIdx]
          ? nextCard.spaceCodes[spIdx]
          : nextCard
          ? nextCard.code
          : "Quẻ An Lạc";
      awardSeniorityPoints(3, "temple_peace_card", "chua-online", `Rút ${nextTitle} tại ${sp.name}`, {
        eventType: "temple_ritual",
        module: "zen",
        spaceIdx: spIdx,
        ritualKind: "peace_card"
      });
      syncZenCooldownAndLanternUi();
      const cardHost = document.getElementById("peace-card-host");
      if (cardHost) {
        cardHost.innerHTML = buildTemplePeaceCardHtml(nextCard);
        bindTemplePeaceCardEvents(nextCard);
      }
      if (window.TempleScene3D && typeof window.TempleScene3D.triggerFortuneStick === "function") {
        window.TempleScene3D.triggerFortuneStick(nextTitle);
      }
      showCeremonialRedSlipOverlay({
        card: nextCard,
        kind: "peace_card",
        subtitle: `${sp.name} · Ống xăm đầu ngày`,
        cooldownSec: Math.ceil(FORTUNE_COOLDOWN_MS / 1000)
      });
    };

    const publishWishOrIncense = (text, ritualKind) => {
      const rawClean = String(text || "").trim();
      if (!rawClean) return false;
      if (ritualKind === "wish_plaque") {
        const waitWish = getWishCooldownSec();
        if (waitWish > 0) {
          showToast(`Cây Thẻ Đỏ đang lắng nhận lời ước nguyện trước — mời bác đợi thêm ${waitWish} giây nhé.`);
          return false;
        }
      }
      const safety = cleanAndApplyDictionary(rawClean);
      if (safety.blocked) {
        trackTelemetryDirect("chat_blocked", "zen", "auto_blocked_prayer", {
          category: "safety_alert",
          detail: "Chặn tự động SĐT, số tài khoản hoặc đường dẫn trên Sớ cầu an"
        });
        showToast("Vì an toàn, không đăng số điện thoại, số tài khoản hoặc đường link lên thẻ cầu nguyện.");
        return false;
      }
      const clean = rawClean;
      const seatNow = activeSeat();
      const prog = getSeniorityProgress();
      const isVeteranGold = Boolean(prog.current && prog.current.level >= 23);
      if (ritualKind === "wish_plaque") {
        state.zen.lastWishCardAt = Date.now();
        state.zen.wishPlaquesCount = (state.zen.wishPlaquesCount || 16) + 1;
        playFortuneShakeSound();
      } else {
        state.zen.incenseLit = true;
        state.zen.incenseCount = (state.zen.incenseCount || 14) + 1;
        playWoodenFishSound();
      }
      const pObj = {
        id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        memberCode: (state.auth && state.auth.memberCode) || "",
        userName: `${state.user.name} · ${getUserAge()}t`,
        province: getProvince(state.user.provinceId).short,
        ritualKind: ritualKind || "wish_plaque",
        cushionIdx: seatNow,
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
        `${ritualKind === "wish_plaque" ? "Treo thẻ đỏ ước nguyện" : spMeta.incenseBtn}: "${clean.slice(0, 56)}"`,
        {
          eventType: "temple_ritual",
          module: "zen",
          spaceIdx: spIdx,
          ritualKind: ritualKind || "wish_plaque",
          cushionIdx: seatNow,
          wishText: clean
        }
      );

      syncZenCooldownAndLanternUi();
      refreshZenPrayersHostIfActive();

      if (window.TempleScene3D) {
        if (ritualKind === "wish_plaque") {
          if (state.zen.cameraView !== "courtyard") {
            switchZenCameraSmooth("courtyard");
          }
          window.TempleScene3D.spawnWishPlaque(state.user.name, isVeteranGold, clean, seatNow);
        } else {
          scrollZenStageIntoViewSmooth();
          window.TempleScene3D.triggerIncense(state.user.name, seatNow);
        }
      }

      if (ritualKind === "wish_plaque" && cards.length > 0) {
        const matchedCard = cards[(state.zen.wishPlaquesCount || 0) % cards.length];
        showCeremonialRedSlipOverlay({
          card: matchedCard,
          kind: "wish_plaque",
          wishText: clean,
          subtitle: `${sp.name} · Cây Thẻ Đỏ Ước Nguyện`,
          cooldownSec: Math.ceil(WISH_COOLDOWN_MS / 1000)
        });
      } else {
        showToast(`Đang bước lên thành tâm ${spMeta.incenseBtn.toLowerCase()}...`);
      }
      return true;
    };

    const stageEl = document.getElementById("temple-3d-stage");
    if (stageEl && window.TempleScene3D) {
      window.TempleScene3D.mount(
        stageEl,
        {
          preferredRender: state.settings.preferredRender,
          cameraView: camMode,
          spaceIdx: spIdx,
          autoMuyuActive: isAutoMuyuActive,
          plaqueTitle: spMeta.plaqueTitle,
          userName: state.user.name,
          userCushionIdx: myCushion,
          attendees,
          muyuCount: state.zen.muyuCount || 0,
          incenseCount: state.zen.incenseCount || 14,
          lanternCount: state.zen.lanternsReleased || 18,
          activeLanterns,
          fortuneCooldownSec: initFortuneCd,
          wishCooldownSec: initWishCd,
          totalWishCount: state.zen.wishPlaquesCount || 16,
          wishes: prayers,
          onInteractiveAction: (kind, payload) => {
            if (kind === "muyu") {
              doMuyuStep(false);
            } else if (kind === "bell") {
              doBellStep();
            } else if (kind === "incense") {
              const chosen = spMeta.presets[(state.zen.incenseCount || 0) % Math.max(1, spMeta.presets.length)] || sp.quote;
              publishWishOrIncense(chosen, "incense");
            } else if (kind === "pond_lantern") {
              doPondLanternStep();
            } else if (kind === "wish_plaque") {
              const chosen = spMeta.presets[(state.zen.wishPlaquesCount || 0) % Math.max(1, spMeta.presets.length)] || sp.quote;
              publishWishOrIncense(chosen, "wish_plaque");
            } else if (kind === "peace_card") {
              doDrawPeaceCardStep();
            } else if (kind === "select_cushion" && typeof payload === "number") {
              const cIdx = Math.max(0, Math.min(19, Math.floor(payload)));
              if (cIdx !== state.zen.userCushionIdx) {
                state.zen.userCushionIdx = cIdx;
                saveState();
                syncMyGlobalOnlinePresence();
                showToast(`Đã chuyển sang ngồi Chiếu số ${cIdx + 1}`);
                refreshCushionPickerInPlace(cIdx);
              } else {
                const chosen = spMeta.presets[(state.zen.incenseCount || 0) % Math.max(1, spMeta.presets.length)] || sp.quote;
                publishWishOrIncense(chosen, "incense");
              }
            }
          }
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
        switchZenCameraSmooth(nextCam);
        trackTelemetryDirect("temple_ritual", "zen", "switch_3d_camera", { cameraView: nextCam, spaceIdx: spIdx });
      });
    });

    els.main.querySelectorAll("[data-cushion]").forEach((b) => {
      b.addEventListener("click", () => {
        const cIdx = Math.max(0, Math.min(19, Number(b.dataset.cushion) || 0));
        state.zen.userCushionIdx = cIdx;
        awardSkillPoints("temple_zen", 2);
        trackTelemetryDirect("temple_ritual", "zen", "select_cushion", { ritualKind: "cushion_select", cushionIdx: cIdx, spaceIdx: spIdx });
        saveState();
        syncMyGlobalOnlinePresence();
        showToast(`Đã chuyển sang ngồi Chiếu số ${cIdx + 1}`);
        refreshCushionPickerInPlace(cIdx);
      });
    });

    const autoMuyuBtn = document.getElementById("btn-temple-auto-muyu");
    if (autoMuyuBtn) {
      autoMuyuBtn.addEventListener("click", () => {
        const lbl = document.getElementById("auto-muyu-label");
        if (autoMuyuTimerId) {
          clearInterval(autoMuyuTimerId);
          autoMuyuTimerId = null;
          autoMuyuBtn.className = "btn-jade";
          if (lbl) lbl.textContent = spMeta.autoMuyuIdle;
          if (window.TempleScene3D && typeof window.TempleScene3D.setAutoMuyuMode === "function") {
            window.TempleScene3D.setAutoMuyuMode(false);
          }
          showToast("Đã dừng nhịp gõ — nhân vật đang bước về chiếu ngồi.");
        } else {
          autoMuyuBtn.className = "btn-primary";
          if (lbl) lbl.textContent = spMeta.autoMuyuRunning;
          if (window.TempleScene3D && typeof window.TempleScene3D.setAutoMuyuMode === "function") {
            window.TempleScene3D.setAutoMuyuMode(true);
          }
          doMuyuStep(true);
          autoMuyuTimerId = setInterval(() => {
            if (state.route !== "zen") {
              clearInterval(autoMuyuTimerId);
              autoMuyuTimerId = null;
              return;
            }
            doMuyuStep(true);
          }, 2200);
          showToast("Nhân vật đang bước lên giữ nhịp tĩnh tâm đều đặn!");
        }
      });
    }

    document.getElementById("btn-temple-hang-wish").addEventListener("click", () => {
      const chosen = spMeta.presets[(state.zen.wishPlaquesCount || 0) % Math.max(1, spMeta.presets.length)] || sp.quote;
      publishWishOrIncense(chosen, "wish_plaque");
    });

    document.getElementById("btn-temple-pond-lantern").addEventListener("click", doPondLanternStep);

    document.getElementById("btn-temple-incense").addEventListener("click", () => {
      const chosen = spMeta.presets[(state.zen.incenseCount || 0) % Math.max(1, spMeta.presets.length)] || sp.quote;
      publishWishOrIncense(chosen, "incense");
    });

    document.getElementById("btn-temple-muyu").addEventListener("click", () => doMuyuStep(false));
    document.getElementById("btn-ring-bell").addEventListener("click", doBellStep);
    document.getElementById("btn-draw-peace-card").addEventListener("click", doDrawPeaceCardStep);

    els.main.querySelectorAll("[data-prayer-preset]").forEach((b) => {
      b.addEventListener("click", () => publishWishOrIncense(b.dataset.prayerPreset, "wish_plaque"));
    });

    document.getElementById("btn-send-prayer").addEventListener("click", () => {
      const inp = document.getElementById("temple-prayer-in");
      if (!inp.value.trim()) {
        showToast("Mời bác nhập lời ước nguyện hoặc chạm 1 trong 4 câu mẫu bên trên.");
        return;
      }
      if (publishWishOrIncense(inp.value, "wish_plaque")) {
        inp.value = "";
      }
    });

    bindTemplePeaceCardEvents(curCard);
    bindTemplePrayersListEvents(prayers);
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

    const gs = state.user.gameStats || {};
    const totalGameWins = (Number(gs.oaqWins) || 0) + (Number(gs.xiangqiWins) || 0);
    const totalGameLosses = (Number(gs.oaqLosses) || 0) + (Number(gs.xiangqiLosses) || 0);
    const templeActions = (Number(userSkills.temple_zen) || 0);
    const currentEraId =
      !prog.isGuest && prog.current && prog.current.era
        ? prog.current.era.id
        : eras[1]
        ? eras[1].id
        : "";

    els.main.innerHTML = `
      <h1>Danh Hiệu &amp; Bảng Vinh Danh</h1>
      <p class="lead-copy">Ghi nhận thâm niên sinh hoạt, công đức Chánh Điện và thành tích thắng ván cờ của từng hội viên.</p>

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
          <small style="font-size:0.86rem; color:var(--ink-secondary);" class="num">
            Tích lũy: <strong>${prog.points} XP</strong> · Đã mở <strong>${unlockedSkillBadgesCount}/64</strong> bậc kỹ năng${
              prog.next ? ` · Cần thêm <strong>${prog.xpNeededForNext} XP</strong> lên ${escHtml(prog.next.name)}` : ""
            }
          </small>
        </div>
        <div class="game-stats-strip num" style="margin-top:6px;">
          <span>Thắng cờ: <strong>${totalGameWins}</strong></span>
          <span>Thua: <strong>${totalGameLosses}</strong></span>
          <span>Đi chùa: <strong>${templeActions}</strong> điểm</span>
        </div>
        ${
          prog.isGuest
            ? `<button type="button" class="btn-primary" id="btn-lb-open-card">${ico("card")}<span>Mở Thẻ 10 Giây — Lưu Danh Hiệu Ngay</span></button>`
            : ""
        }
      </div>

      <div class="temple-cam-bar" role="tablist" aria-label="Chọn nhánh danh hiệu">
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "Cay32" ? "active" : ""}" id="lb-tab-32">32 Tầng Sinh Hoạt</button>
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "ChuyenMon" ? "active" : ""}" id="lb-tab-skills">8 Nhánh Kỹ Năng</button>
        <button type="button" class="temple-cam-btn ${activeLeaderTab === "Tinh" ? "active" : ""}" id="lb-tab-board">Bảng Xếp Hạng</button>
      </div>

      ${
        activeLeaderTab === "Cay32"
          ? `
        ${eras
          .slice(1)
          .map((era) => {
            const tiersInEra = mainTiers.filter((t) => t.era && t.era.id === era.id);
            const isOpenByDefault = era.id === currentEraId;
            return `
            <details class="tb-details" ${isOpenByDefault ? "open" : ""}>
              <summary>
                <span style="color:${escHtml(era.color)};">${escHtml(era.eraName)} (${escHtml(era.rangeLabel)})</span>
                <span class="tb-details-hint">${isOpenByDefault ? "Cấp hiện tại" : `${tiersInEra.length} tầng`}</span>
              </summary>
              <div class="era-tier-grid" style="margin-top:8px;">
                ${tiersInEra
                  .map((t) => {
                    const isCurr = !prog.isGuest && prog.current.level === t.level;
                    const isReached = !prog.isGuest && prog.current.level >= t.level;
                    return `
                    <div class="tier-32-row ${isCurr ? "current" : isReached ? "reached" : ""}">
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <strong style="color:${escHtml(era.color)};">${escHtml(t.fullLabel)}</strong>
                        <span class="badge-tag ${isCurr ? "amber" : isReached ? "jade" : ""} num">${
                          isCurr ? "Đang đạt" : isReached ? "Đã qua" : `${t.minXp.toLocaleString("vi-VN")} XP`
                        }</span>
                      </div>
                      <span style="color:var(--ink-secondary);">${escHtml(t.perk)}</span>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </details>
          `;
          })
          .join("")}
      `
          : activeLeaderTab === "ChuyenMon"
          ? `
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
                <small style="font-size:0.86rem; color:var(--ink-secondary);">Cách tích điểm: ${escHtml(tree.howToEarn)}</small>
                <div class="seniority-progress-wrap">
                  <div class="seniority-progress-track">
                    <div class="seniority-progress-fill" style="width:${ev.percent}%; background-color:${escHtml(tree.color)};"></div>
                  </div>
                  <small style="font-size:0.86rem;">
                    Hiện đạt: <strong>${ev.current ? `Bậc ${ev.current.roman} · ${escHtml(ev.current.title)}` : "Chưa mở bậc I"}</strong>
                    ${ev.next ? ` · Mốc tiếp: Bậc ${ev.next.roman} (${ev.next.reqPoints} điểm)` : " · Đã đạt đỉnh Bậc VIII!"}
                  </small>
                </div>
                <details class="tb-details">
                  <summary>
                    <span>Xem chi tiết 8 bậc danh hiệu</span>
                    <span class="tb-details-hint">Bấm mở</span>
                  </summary>
                  <div class="skill-tier-pill-grid" style="margin-top:8px;">
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
                </details>
                <button type="button" class="btn-secondary" data-go-skill="${escHtml(tree.featureRoute)}">Vào rèn luyện mục này</button>
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
    const c = sanitizeColorCss(outfit.color || "#6E4A35", "#6E4A35");
    let detail = "";
    if (outfit.id === "ao-ba-ba") {
      detail = `
        <line x1="28" y1="18" x2="28" y2="46" stroke="#F5EBD6" stroke-width="1.4"/>
        <circle cx="28" cy="24" r="1.4" fill="#FFFDF7"/><circle cx="28" cy="31" r="1.4" fill="#FFFDF7"/><circle cx="28" cy="38" r="1.4" fill="#FFFDF7"/>
        <rect x="17" y="36" width="6" height="6" rx="1" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.1"/>
        <rect x="33" y="36" width="6" height="6" rx="1" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.1"/>
      `;
    } else if (outfit.id === "ao-dai-xanh" || outfit.id === "ao-lua-tim-hue") {
      detail = `
        <path d="M24 16 Q32 22 33 46" fill="none" stroke="#F6EDE8" stroke-width="1.5"/>
        <circle cx="29" cy="21" r="1.3" fill="#FFFDF7"/><circle cx="31.5" cy="27" r="1.3" fill="#FFFDF7"/>
        ${outfit.id === "ao-lua-tim-hue" ? `<circle cx="23.5" cy="33" r="2.7" fill="#F9D5E5" opacity="0.88"/><circle cx="23.5" cy="33" r="1.1" fill="#F4B43A"/>` : ""}
      `;
    } else if (outfit.id === "ao-linh" || outfit.id === "ao-kaki-kem") {
      const trimCol = outfit.id === "ao-kaki-kem" ? "#6D5438" : "#DCE6D3";
      detail = `
        <line x1="28" y1="17" x2="28" y2="46" stroke="${trimCol}" stroke-width="1.3"/>
        <rect x="17.5" y="24" width="6.5" height="7" rx="1" fill="none" stroke="${trimCol}" stroke-width="1.2"/>
        <rect x="32" y="24" width="6.5" height="7" rx="1" fill="none" stroke="${trimCol}" stroke-width="1.2"/>
        <line x1="16" y1="14" x2="22" y2="15" stroke="${trimCol}" stroke-width="1.6"/>
        <line x1="34" y1="15" x2="40" y2="14" stroke="${trimCol}" stroke-width="1.6"/>
      `;
    } else if (outfit.id === "ao-gam-lam-ngoc") {
      detail = `
        <path d="M24 16 Q32 22 33 46" fill="none" stroke="#F2D27A" stroke-width="1.4"/>
        <circle cx="28" cy="29" r="4.2" fill="none" stroke="#F2D27A" stroke-width="1.3"/>
        <circle cx="28" cy="29" r="1.6" fill="#F7DC88"/>
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
    const spritePos = {
      scarf: "0% 0%",
      cap: "33.333% 0%",
      "non-la": "66.667% 0%"
    }[acc.id];
    if (spritePos) {
      return `
        <span class="sample-thumb" aria-hidden="true" style="display:inline-block; width:56px; height:56px; border-radius:12px; background-color:#FBF5E8; border:1px solid #D5C4AA; background-image:url('assets/tearoom-accessories.webp?v=20261118c'); background-size:400% 200%; background-position:${spritePos}; background-repeat:no-repeat;"></span>
      `;
    }
    const extraAccPos = {
      "khan-dong": "0% 0%",
      "mu-tai-beo": "100% 0%"
    }[acc.id];
    if (extraAccPos) {
      return `
        <span class="sample-thumb" aria-hidden="true" style="display:inline-block; width:56px; height:56px; border-radius:12px; background-color:#FBF5E8; border:1px solid #D5C4AA; background-image:url('assets/tearoom-accessories-extra.webp?v=20261118c'); background-size:200% 200%; background-position:${extraAccPos}; background-repeat:no-repeat;"></span>
      `;
    }
    let art = "";
    if (acc.id === "glasses") {
      art = `
        <ellipse cx="19" cy="29" rx="7.8" ry="6.4" fill="rgba(255,250,235,0.8)" stroke="#B67E22" stroke-width="2.3"/>
        <ellipse cx="37" cy="29" rx="7.8" ry="6.4" fill="rgba(255,250,235,0.8)" stroke="#B67E22" stroke-width="2.3"/>
        <path d="M26.8 28.5 Q28 25.8 29.2 28.5" fill="none" stroke="#B67E22" stroke-width="2.2"/>
        <line x1="7" y1="25" x2="11.2" y2="28" stroke="#8C5B1F" stroke-width="2" stroke-linecap="round"/>
        <line x1="44.8" y1="28" x2="49" y2="25" stroke="#8C5B1F" stroke-width="2" stroke-linecap="round"/>
      `;
    } else if (acc.id === "kinh-ram-tra") {
      art = `
        <ellipse cx="19" cy="29" rx="8.1" ry="6.6" fill="rgba(186,118,38,0.44)" stroke="#5A3414" stroke-width="2.5"/>
        <ellipse cx="37" cy="29" rx="8.1" ry="6.6" fill="rgba(186,118,38,0.44)" stroke="#5A3414" stroke-width="2.5"/>
        <line x1="15" y1="25.5" x2="21" y2="31.5" stroke="rgba(255,244,214,0.55)" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="33" y1="25.5" x2="39" y2="31.5" stroke="rgba(255,244,214,0.55)" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M27.1 28.2 Q28 25.5 28.9 28.2" fill="none" stroke="#8C5B1F" stroke-width="2.3"/>
        <line x1="6.8" y1="25" x2="11" y2="28" stroke="#5A3414" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="45" y1="28" x2="49.2" y2="25" stroke="#5A3414" stroke-width="2.2" stroke-linecap="round"/>
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
    const spritePos = {
      "am-tu-sa": "0% 0%",
      "binh-sen": "50% 0%",
      "bonsai-mini": "100% 0%",
      "dia-hat-dua": "0% 100%",
      "den-dau": "50% 100%",
      "radio-go": "100% 100%"
    }[item.id];
    if (spritePos) {
      return `
        <span class="sample-thumb" aria-hidden="true" style="display:inline-block; width:56px; height:56px; border-radius:12px; background-color:#FBF5E8; border:1px solid #D5C4AA; background-image:url('assets/tearoom-items.webp?v=20261118c'); background-size:300% 200%; background-position:${spritePos}; background-repeat:no-repeat;"></span>
      `;
    }
    const extraSpritePos = {
      "khay-trau-cau": "0% 0%",
      "banh-dau-xanh": "50% 0%",
      "long-chim-khuyen": "100% 0%",
      "ban-co-ngoc": "0% 100%",
      "lu-tram-dong": "50% 100%",
      "tich-tra-men-lam": "100% 100%"
    }[item.id];
    if (extraSpritePos) {
      return `
        <span class="sample-thumb" aria-hidden="true" style="display:inline-block; width:56px; height:56px; border-radius:12px; background-color:#FBF5E8; border:1px solid #D5C4AA; background-image:url('assets/tearoom-items-extra.webp?v=20261118c'); background-size:300% 200%; background-position:${extraSpritePos}; background-repeat:no-repeat;"></span>
      `;
    }
    return `
      <span class="sample-thumb" aria-hidden="true">
        <svg viewBox="0 0 56 56" width="56" height="56">
          <rect x="1" y="1" width="54" height="54" rx="12" fill="#FBF5E8" stroke="#D5C4AA" stroke-width="1.4"/>
        </svg>
      </span>
    `;
  }

  function renderTitleFrameSampleSvg(frame) {
    const col = sanitizeColorCss(frame.color || "#3A2A20", "#3A2A20");
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

    const gs = state.user.gameStats || {};
    const totalWins = (Number(gs.oaqWins) || 0) + (Number(gs.xiangqiWins) || 0);

    const renderWardrobeCatalogList = (heading, items, cfg) => `
      <div class="surface-panel">
        <h3>${heading}</h3>
        <div class="catalog-stack">
          ${items
            .map((item) => {
              const owned = cfg.ownedList.includes(item.id);
              const equipped = cfg.equippedId === item.id;
              const previewing = cfg.activeId === item.id && !equipped;
              return `
                <div class="catalog-sample-card ${equipped ? "is-equipped" : previewing ? "is-previewing" : ""}">
                  <div class="catalog-sample-top">
                    ${cfg.thumbFn(item)}
                    <div class="catalog-sample-info">
                      <strong>${escHtml(item.name)}</strong>
                      <small>${escHtml(item.desc || "")}</small>
                    </div>
                  </div>
                  <div class="catalog-sample-actions">
                    ${!owned ? `<button type="button" class="btn-mini ${cfg.previewCls}" data-id="${item.id}">${previewing ? "Đang thử" : "Xem thử"}</button>` : ""}
                    <button type="button" class="btn-mini ${cfg.equipCls} ${equipped ? "active-equip" : ""}" data-id="${item.id}">
                      ${equipped ? cfg.activeLabel : owned ? cfg.ownedLabel : `Đổi (${item.cost} Xu)`}
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;

    const wardrobeCategoryConfigs = {
      outfits: [
        "Trang phục nhân vật",
        D.OUTFITS,
        {
          ownedList: state.user.unlockedOutfits,
          equippedId: state.user.outfitId,
          activeId: activeOutfitId,
          thumbFn: renderOutfitSampleSvg,
          previewCls: "preview-outfit-btn",
          equipCls: "equip-outfit-btn",
          activeLabel: "Đang mặc",
          ownedLabel: "Chọn mặc"
        }
      ],
      accessories: [
        "Phụ kiện đội đầu &amp; mắt",
        D.ACCESSORIES,
        {
          ownedList: state.user.unlockedAccessories || ["none", "glasses"],
          equippedId: state.user.accessoryId || "glasses",
          activeId: activeAccId,
          thumbFn: renderAccessorySampleSvg,
          previewCls: "preview-acc-btn",
          equipCls: "equip-acc-btn",
          activeLabel: "Đang đeo",
          ownedLabel: "Chọn đeo"
        }
      ],
      items: [
        "Đồ bày bàn trà trước mặt",
        D.TABLE_ITEMS,
        {
          ownedList: state.user.unlockedItems,
          equippedId: state.user.itemId,
          activeId: activeItemId,
          thumbFn: renderTableItemSampleSvg,
          previewCls: "preview-item-btn",
          equipCls: "equip-item-btn",
          activeLabel: "Đang bày",
          ownedLabel: "Đặt lên bàn"
        }
      ],
      frames: [
        "Khung danh hiệu gắn lên nhân vật",
        D.TITLE_FRAMES,
        {
          ownedList: state.user.unlockedTitleFrames || ["none", "tri-am"],
          equippedId: state.user.titleFrameId || "tri-am",
          activeId: activeFrameId,
          thumbFn: renderTitleFrameSampleSvg,
          previewCls: "preview-frame-btn",
          equipCls: "equip-frame-btn",
          activeLabel: "Đang gắn",
          ownedLabel: "Gắn khung tên"
        }
      ]
    };

    const renderSelectedWardrobeCatalog = () => {
      const args = wardrobeCategoryConfigs[activeWardrobeCat] || wardrobeCategoryConfigs.outfits;
      return renderWardrobeCatalogList(args[0], args[1], args[2]);
    };

    els.main.innerHTML = `
      <h1>Cá Nhân &amp; Tủ Trang Phục</h1>
      <div class="tab-bar" role="tablist" aria-label="Chọn mục Cá nhân">
        <button type="button" class="tab-btn ${activeProfileMainTab === "wardrobe" ? "active" : ""}" id="prof-tab-wardrobe">Tủ Trang Phục &amp; Đồ Bày</button>
        <button type="button" class="tab-btn ${activeProfileMainTab === "identity" ? "active" : ""}" id="prof-tab-identity">Đổi Tên · Tuổi &amp; Thẻ QR</button>
      </div>

      ${
        activeProfileMainTab === "wardrobe"
          ? `
        <div class="surface-panel warm" id="profile-live-card">
          <div class="tearoom-controls-row" style="flex-wrap:wrap;">
            <span class="stage-badge" id="profile-render-badge">${isPreviewingDraft ? "Đang xem thử mẫu" : "Mẫu đang dùng"}</span>
            ${renderGraphicsModeSwitchHtml({ innerOnly: true })}
          </div>

          <div class="tearoom-stage profile-showcase-stage" id="profile-preview-stage">
            <canvas class="tearoom-canvas" id="profile-preview-canvas"></canvas>
            <div class="avatar-tags-layer" id="profile-preview-tags"></div>
          </div>

          <div class="profile-equipped-strip">
            <span>Áo: <strong>${escHtml(activeOutfit.name)}</strong></span>
            <span>Phụ kiện: <strong>${escHtml(activeAcc.name)}</strong></span>
            <span>Khung: <strong>${escHtml(activeFrame.name)}</strong></span>
            <span>Bàn: <strong>${escHtml(activeItem.name)}</strong></span>
          </div>

          ${isPreviewingDraft ? `<button type="button" class="btn-secondary" id="btn-reset-preview">Quay về bộ đang dùng thật</button>` : ""}
          <button type="button" class="btn-jade" id="btn-goto-tearoom-from-wardrobe">${ico("tea")}<span>Ra Bàn Trà xem trang phục ngay</span></button>
        </div>

        <div class="wardrobe-cat-bar" role="tablist" aria-label="Danh mục trang bị">
          <button type="button" class="wardrobe-cat-btn ${activeWardrobeCat === "outfits" ? "active" : ""}" data-wcat="outfits">Trang phục (${D.OUTFITS.length})</button>
          <button type="button" class="wardrobe-cat-btn ${activeWardrobeCat === "accessories" ? "active" : ""}" data-wcat="accessories">Phụ kiện (${D.ACCESSORIES.length})</button>
          <button type="button" class="wardrobe-cat-btn ${activeWardrobeCat === "items" ? "active" : ""}" data-wcat="items">Đồ bàn trà (${D.TABLE_ITEMS.length})</button>
          <button type="button" class="wardrobe-cat-btn ${activeWardrobeCat === "frames" ? "active" : ""}" data-wcat="frames">Khung tên (${D.TITLE_FRAMES.length})</button>
        </div>

        ${renderSelectedWardrobeCatalog()}
      `
          : `
        <div class="surface-panel warm">
          <h3>Thông tin xưng hô &amp; độ tuổi</h3>
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
            Quê quán (${D.PROVINCES.length} tỉnh thành &amp; xa quê)
            <select class="select-lg" id="prof-prov-in">
              ${D.PROVINCES.map((p) => `<option value="${p.id}" ${p.id === state.user.provinceId ? "selected" : ""}>${escHtml(p.name)}</option>`).join("")}
            </select>
          </label>
          <button type="button" class="btn-primary" id="btn-save-name">Lưu xưng hô &amp; tuổi</button>
        </div>

        <div class="surface-panel">
          <h3>Thẻ Hội Viên &amp; Danh Hiệu Đã Đạt</h3>
          <p class="num" style="font-size:0.9rem; color:var(--ink-secondary);">Thắng cờ: <strong>${totalWins}</strong> ván · Khung đã mở: <strong>${(state.user.unlockedTitleFrames || []).length}/${D.TITLE_FRAMES.length}</strong></p>
          <div class="btn-row">
            <button type="button" class="btn-jade" id="btn-prof-open-auth">${ico("card")}<span>${state.auth.isRegistered ? "Xem Thẻ QR Hội Viên" : "Mở Thẻ Lưu Dữ Liệu"}</span></button>
            <button type="button" class="btn-secondary" id="btn-prof-goto-lb">${ico("trophy")}<span>Bảng Danh Hiệu</span></button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Giọng đọc Tiếng Việt (Hỗ trợ máy Android cũ ngoại tuyến)</h3>
          <p style="font-size:0.88rem; color:var(--ink-secondary);">Máy thiếu bộ giọng tiếng Việt có thể bật sẵn kho 15 tệp giọng thu ấm áp (chào sáng, lời dẫn chùa/cờ, 6 quẻ bình an).</p>
          <div class="btn-row">
            <button type="button" class="btn-${state.settings.voiceMode === "recorded" ? "jade" : "secondary"}" id="btn-prof-toggle-voicemode">
              ${ico("speaker")}
              <span>${state.settings.voiceMode === "recorded" ? "Đang ưu tiên: Giọng thu sẵn (.mp3)" : "Chế độ: Tự động (TTS + Dự phòng)"}</span>
            </button>
            <button type="button" class="btn-secondary" id="btn-prof-test-voice">Nghe thử</button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Riêng tư &amp; Góp ý Quán Trà</h3>
          <div class="btn-row">
            <button type="button" class="btn-secondary" id="btn-profile-feedback">${ico("feedback", "ico-sm")}<span>Gửi Góp ý</span></button>
            <button type="button" class="btn-secondary" id="btn-profile-open-privacy">${ico("shield", "ico-sm")}<span>Riêng tư &amp; Admin</span></button>
          </div>
        </div>
      `
      }
    `;

    document.getElementById("prof-tab-wardrobe").addEventListener("click", () => {
      if (activeProfileMainTab === "wardrobe") return;
      activeProfileMainTab = "wardrobe";
      renderProfile();
    });
    document.getElementById("prof-tab-identity").addEventListener("click", () => {
      if (activeProfileMainTab === "identity") return;
      window.TeaRoomScene.dispose();
      activeProfileMainTab = "identity";
      renderProfile();
    });

    if (activeProfileMainTab === "wardrobe") {
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
            userOutfitId: activeOutfit.id,
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

      bindRenderChoiceButtons(renderProfile);

      const resetPrevBtn = document.getElementById("btn-reset-preview");
      if (resetPrevBtn) {
        resetPrevBtn.addEventListener("click", () => {
          profilePreviewDraft = null;
          renderProfile();
        });
      }
      const gotoTeaBtn = document.getElementById("btn-goto-tearoom-from-wardrobe");
      if (gotoTeaBtn) {
        gotoTeaBtn.addEventListener("click", () => {
          profilePreviewDraft = null;
          state.teaRoom.subView = "table";
          saveState();
          navigate("tearoom");
        });
      }

      els.main.querySelectorAll("[data-wcat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeWardrobeCat = btn.dataset.wcat || "outfits";
          renderProfile();
        });
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
          refreshRealtimeAppearance();
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
          refreshRealtimeAppearance();
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
          refreshRealtimeAppearance();
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
              showToast(`Chưa đủ ${fr.cost} Xu — đã gắn thử khung "${fr.name}" để ${pron} ngắm trước!`);
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
          refreshRealtimeAppearance();
          showToast(`Đã gắn khung danh hiệu: ${fr.name}`);
          renderProfile();
          scrollShowcaseIntoView();
        });
      });
    } else {
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

      document.getElementById("btn-prof-open-auth").addEventListener("click", () => openMemberAuthModal());
      document.getElementById("btn-prof-goto-lb").addEventListener("click", () => {
        activeLeaderTab = "Cay32";
        navigate("leaderboard");
      });
      const profVoiceModeBtn = document.getElementById("btn-prof-toggle-voicemode");
      if (profVoiceModeBtn) {
        profVoiceModeBtn.addEventListener("click", () => {
          state.settings.voiceMode = state.settings.voiceMode === "recorded" ? "auto" : "recorded";
          saveState();
          showToast(
            state.settings.voiceMode === "recorded"
              ? "Đã bật ưu tiên Giọng thu sẵn ngoại tuyến (.mp3)!"
              : "Đã chuyển về chế độ Giọng đọc Tự động."
          );
          renderProfile();
        });
      }
      const profTestVoiceBtn = document.getElementById("btn-prof-test-voice");
      if (profTestVoiceBtn) {
        profTestVoiceBtn.addEventListener("click", () => {
          const clip = D.VOICE_CLIPS && D.VOICE_CLIPS["chao-buoi-sang"];
          speak(clip ? clip.text : "Chào buổi sáng bác tại Quán Trà Tuổi Bạc!", {
            clipId: "chao-buoi-sang",
            announceToast: true
          });
        });
      }
      const profFbBtn = document.getElementById("btn-profile-feedback");
      if (profFbBtn) profFbBtn.addEventListener("click", () => openFeedbackModal("profile"));
      document.getElementById("btn-profile-open-privacy").addEventListener("click", () => navigate("privacy"));
    }
  }

  // ==================== MODULE 10: HEALTH ASSISTANT & FAMILY VIEW ====================
  function renderHealth() {
    const h = state.health;
    const disclaimer =
      "Đây là thông tin tham khảo từ trợ lý tự động, không phải bác sĩ và không thay thế việc khám bệnh. Không tự ý dùng hoặc bỏ thuốc.";
    const contactName = (h.emergencyContactName || "Anh Hùng (Con trai)").trim();
    const cleanFamPhone = String(h.emergencyContactPhone || "0900000000").replace(/[^0-9+]/g, "") || "0900000000";
    const waterCups = Math.max(0, Math.min(8, Number(h.waterCups) || 0));

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
          <p style="font-weight:700;">Trò chuyện đã tạm dừng. Nếu bác đang đau ngực, khó thở, méo miệng, tê yếu tay chân hoặc huyết áp tăng vọt (≥ 180/120 mmHg), hãy gọi cấp cứu ngay:</p>
          <a class="btn-danger" href="tel:115" style="text-decoration:none;">${ico("phone")}<span>GỌI CẤP CỨU 115 NGAY</span></a>
          <a class="btn-primary" href="tel:${escHtml(cleanFamPhone)}" style="text-decoration:none;">${ico("family")}<span>GỌI ${escHtml(contactName.toUpperCase())}</span></a>
          <button type="button" class="btn-secondary" id="btn-clear-emergency">Tôi chỉ đang thử nghiệm — Quay lại bình thường</button>
        </div>
      `
          : `
        <div class="surface-panel">
          <h3>Nhắc uống thuốc theo đơn hôm nay</h3>
          <button type="button" class="btn-${h.medMorning ? "jade" : "primary"}" id="btn-toggle-med">
            ${ico("check")}
            <span>${h.medMorning ? "Đã uống cử thuốc Sáng" : "Đánh dấu: Đã uống thuốc Sáng"}</span>
          </button>
          <button type="button" class="btn-${h.medEvening ? "jade" : "secondary"}" id="btn-toggle-med-eve">
            ${ico("check")}
            <span>${h.medEvening ? "Đã uống cử thuốc Tối" : "Đánh dấu: Đã uống thuốc Tối"}</span>
          </button>
        </div>

        <div class="surface-panel">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <h3>Sổ uống nước ấm trong ngày</h3>
            <span class="badge-tag jade num">${waterCups}/8 cốc</span>
          </div>
          <div class="water-cups-grid" role="group" aria-label="Tiến độ 8 cốc nước ấm">
            ${Array.from({ length: 8 })
              .map(
                (_, i) =>
                  `<div class="water-cup-pill ${i < waterCups ? "is-filled" : ""}">Cốc ${i + 1}${i < waterCups ? " ✓" : ""}</div>`
              )
              .join("")}
          </div>
          <div class="btn-row">
            <button type="button" class="btn-jade" id="btn-add-water-cup" ${waterCups >= 8 ? "disabled" : ""}>${
              waterCups >= 8 ? "Đã uống đủ 8 cốc hôm nay" : "+1 cốc nước ấm"
            }</button>
            <button type="button" class="btn-secondary" id="btn-reset-water">Đặt lại</button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Sổ đo huyết áp tại nhà (mmHg)</h3>
          <div class="setup-inline-fields">
            <label class="field-label" style="flex:1;">
              Tâm thu (số trên)
              <input type="number" inputmode="numeric" min="70" max="250" class="input-lg num" id="bp-sys-in" placeholder="125" />
            </label>
            <label class="field-label" style="flex:1;">
              Tâm trương (số dưới)
              <input type="number" inputmode="numeric" min="40" max="160" class="input-lg num" id="bp-dia-in" placeholder="80" />
            </label>
          </div>
          <button type="button" class="btn-primary" id="btn-save-bp">${ico("heart")}<span>Ghi vào sổ huyết áp</span></button>
          <div style="font-size:0.88rem; display:flex; flex-direction:column; gap:4px;" class="num">
            ${(h.bpReadings || []).map((r) => `<div>• ${escHtml(r)}</div>`).join("")}
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
        trackTelemetryDirect("health_med", "health", state.health.medMorning ? "checked_morning_med" : "unchecked_morning_med", {
          medMorning: state.health.medMorning
        });
        saveState();
        renderHealth();
      });
    }

    const medEveBtn = document.getElementById("btn-toggle-med-eve");
    if (medEveBtn) {
      medEveBtn.addEventListener("click", () => {
        state.health.medEvening = !state.health.medEvening;
        trackTelemetryDirect("health_med", "health", state.health.medEvening ? "checked_evening_med" : "unchecked_evening_med", {
          medEvening: state.health.medEvening
        });
        saveState();
        renderHealth();
      });
    }

    const addWaterBtn = document.getElementById("btn-add-water-cup");
    if (addWaterBtn) {
      addWaterBtn.addEventListener("click", () => {
        state.health.waterCups = Math.min(8, (Number(state.health.waterCups) || 0) + 1);
        trackTelemetryDirect("health_water", "health", "drink_warm_water", { cups: state.health.waterCups });
        if (state.health.waterCups === 8) {
          addXu(2, "Hoàn thành 8 cốc nước ấm tốt cho sức khỏe!");
        } else {
          saveState();
          showToast(`Đã ghi nhận ${state.health.waterCups}/8 cốc nước ấm hôm nay.`);
        }
        renderHealth();
      });
    }

    const resetWaterBtn = document.getElementById("btn-reset-water");
    if (resetWaterBtn) {
      resetWaterBtn.addEventListener("click", () => {
        state.health.waterCups = 0;
        saveState();
        renderHealth();
      });
    }

    const saveBpBtn = document.getElementById("btn-save-bp");
    if (saveBpBtn) {
      saveBpBtn.addEventListener("click", () => {
        const sys = Math.round(Number(document.getElementById("bp-sys-in").value));
        const dia = Math.round(Number(document.getElementById("bp-dia-in").value));
        if (!Number.isFinite(sys) || !Number.isFinite(dia) || sys < 70 || sys > 250 || dia < 40 || dia > 160 || dia >= sys) {
          showToast("Mời bác nhập đúng chỉ số Tâm thu (70–250) và Tâm trương (40–160 mmHg).");
          return;
        }
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const note =
          sys >= 180 || dia >= 120
            ? "Tăng rất cao — Cần gọi y tế"
            : sys >= 140 || dia >= 90
            ? "Hơi cao — Nghỉ ngơi đo lại"
            : sys < 90 || dia < 60
            ? "Hơi thấp — Nằm nghỉ uống nước ấm"
            : "Ổn định";
        if (!Array.isArray(state.health.bpReadings)) state.health.bpReadings = [];
        state.health.bpReadings.unshift(`Lúc ${hh}:${mm}: ${sys}/${dia} mmHg (${note})`);
        state.health.bpReadings = state.health.bpReadings.slice(0, 10);
        trackTelemetryDirect("health_bp", "health", "logged_bp_reading", { sys, dia, note });
        if (sys >= 180 || dia >= 120) {
          state.health.emergencyMode = true;
        } else {
          showToast(`Đã lưu chỉ số ${sys}/${dia} mmHg (${note}) vào sổ.`);
        }
        saveState();
        renderHealth();
      });
    }

    els.main.querySelectorAll(".health-qa-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const qa = D.HEALTH_QA[Number(b.dataset.idx)];
        state.health.lastAnswer = qa.answer;
        trackTelemetryDirect("health_qa", "health", "ask_health_qa", { question: qa.q });
        saveState();
        renderHealth();
      });
    });

    const checkBtn = document.getElementById("btn-check-symptom");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const txt = document.getElementById("health-symptom-in").value.toLowerCase();
        const isRed = D.RED_FLAG_WORDS.some((w) => txt.includes(w));
        trackTelemetryDirect("health_symptom", "health", isRed ? "red_flag_detected" : "symptom_checked", { redFlag: isRed });
        if (isRed) {
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
        trackTelemetryDirect("health_emergency", "health", "test_115_mode", {});
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
    const famName = (state.health && state.health.emergencyContactName) || "Anh Hùng (Con trai)";
    const famPhone = (state.health && state.health.emergencyContactPhone) || "0900000000";

    els.main.innerHTML = `
      <h1>Góc Con Cái (30–50 tuổi)</h1>
      <p class="lead-copy">Màn hình dành cho con cháu cài sẵn trên máy bố mẹ: theo dõi nhịp sinh hoạt nhẹ nhàng, cài số gọi khẩn cấp và gửi mã QR vào thẳng quán trà.</p>

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
        <p class="num" style="font-size:0.88rem; color:var(--ink-secondary);">
          Nước ấm hôm nay: <strong>${(state.health && state.health.waterCups) || 0}/8 cốc</strong> · Thuốc sáng: <strong>${
            state.health && state.health.medMorning ? "Đã uống" : "Chưa đánh dấu"
          }</strong>
        </p>
      </div>

      <div class="surface-panel warm">
        <h3>Số điện thoại Người Thân Khẩn Cấp (Lưu riêng trên máy này)</h3>
        <p style="font-size:0.86rem; color:var(--ink-secondary);">Chỉ lưu cục bộ trong bộ nhớ chiếc điện thoại này để nút <strong>Gọi Người Thân</strong> ở mục Sức Khỏe quay đúng số con cháu, không gửi lên mạng công cộng.</p>
        <label class="field-label">
          Tên người thân hiển thị trên nút gọi
          <input type="text" class="input-lg" id="fam-contact-name" value="${escHtml(famName)}" placeholder="Ví dụ: Con trai Minh Hùng" />
        </label>
        <label class="field-label">
          Số điện thoại nhận cuộc gọi khẩn
          <input type="tel" inputmode="tel" class="input-lg num" id="fam-contact-phone" value="${escHtml(famPhone)}" placeholder="Ví dụ: 0912345678" />
        </label>
        <button type="button" class="btn-primary" id="btn-save-fam-contact">${ico("phone")}<span>Lưu số khẩn cấp trên máy bố mẹ</span></button>
      </div>

      <div class="surface-panel">
        <h3>Mã QR &amp; Tin nhắn gửi sẵn cho bố mẹ</h3>
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

    const saveFamBtn = document.getElementById("btn-save-fam-contact");
    if (saveFamBtn) {
      saveFamBtn.addEventListener("click", () => {
        const rawName = (document.getElementById("fam-contact-name").value || "").trim() || "Người thân";
        const rawDigits = String(document.getElementById("fam-contact-phone").value || "").replace(/[^0-9+]/g, "");
        if (rawDigits.replace(/\D/g, "").length < 8 || rawDigits.replace(/\D/g, "").length > 12) {
          showToast("Vui lòng nhập số điện thoại hợp lệ (8–12 chữ số).");
          return;
        }
        state.health.emergencyContactName = rawName.slice(0, 36);
        state.health.emergencyContactPhone = rawDigits.slice(0, 15);
        saveState();
        showToast(`Đã lưu số khẩn cấp của ${state.health.emergencyContactName} trên máy!`);
        renderFamilyView();
      });
    }

    bindSocialShareKit({
      prefix: "family-share",
      copyLinkBtnId: "btn-copy-family-link",
      shareUrl: shareLink,
      postText: familyPost
    });
  }

  // ==================== MODULE 11: USER ACTIVITY MANAGEMENT DASHBOARD, FEEDBACK & PRIVACY CENTER ====================
  let activePrivacySubTab = "overview-dash";
  let activeIssueFilter = "all";
  let activeDashMemberFilter = "all";
  let activeDashSearchQuery = "";
  let feedbackRewardedThisSession = false;

  const FEEDBACK_PRESETS = [
    { id: "ui_font", label: "Chữ hoặc nút bấm hơi khó nhìn" },
    { id: "speed_bug", label: "Bàn cờ / Mạng đôi lúc hơi chậm" },
    { id: "audio_voice", label: "Âm thanh / Giọng đọc cần rõ hơn" },
    { id: "feature_wish", label: "Mong thêm trò chơi / mục báo mới" },
    { id: "praise", label: "Quán trà ấm cúng, dễ dùng" }
  ];

  function openFeedbackModal(sourceHint) {
    let selectedCat = "";
    let userEditedText = false;
    openDialog(
      "Góp ý & Báo lỗi cho Quán Trà",
      `
      <p style="font-size:0.9rem; color:var(--ink-secondary);">Bác chạm 1 mục có sẵn bên dưới hoặc viết vài chữ để Ban Quản Trị cải thiện quán tốt hơn mỗi ngày:</p>
      <div class="feedback-preset-stack" role="group" aria-label="Chọn nhanh chủ đề góp ý">
        ${FEEDBACK_PRESETS.map(
          (p) => `<button type="button" class="feedback-preset-btn" data-fb-cat="${p.id}">${escHtml(p.label)}</button>`
        ).join("")}
      </div>
      <label class="field-label" style="margin-top:8px;">
        Lời nhắn thêm (không bắt buộc gõ nếu đã chọn mục trên)
        <textarea class="textarea-lg" id="feedback-text-in" rows="3" placeholder="Ví dụ: Mong chữ ở mục báo sáng đậm hơn, hoặc thêm cờ thế mới..."></textarea>
      </label>
      <button type="button" class="btn-primary" id="btn-submit-feedback" style="margin-top:8px;">
        ${ico("feedback", "ico-sm")}
        <span>Gửi góp ý tới Ban Quản Trị</span>
      </button>
      `
    );

    const textEl = document.getElementById("feedback-text-in");
    if (textEl) {
      textEl.addEventListener("input", () => {
        userEditedText = textEl.value.trim().length > 0;
      });
    }

    document.querySelectorAll("[data-fb-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCat = btn.dataset.fbCat || "";
        document.querySelectorAll("[data-fb-cat]").forEach((b) => b.classList.toggle("selected", b === btn));
        if (textEl && !userEditedText) {
          textEl.value = btn.textContent.trim();
        }
      });
    });

    const submitBtn = document.getElementById("btn-submit-feedback");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const typed = textEl ? textEl.value.trim() : "";
        const presetObj = FEEDBACK_PRESETS.find((p) => p.id === selectedCat);
        const cleanMsg = typed || (presetObj ? presetObj.label : "");
        if (!cleanMsg) {
          showToast("Bác chạm chọn 1 mục hoặc gõ vài chữ góp ý nhé.");
          return;
        }
        const safety = cleanAndApplyDictionary(cleanMsg);
        if (safety.blocked) {
          trackTelemetryDirect("chat_blocked", "privacy", "auto_blocked_feedback", {
            category: "safety_alert",
            detail: "Chặn tự động SĐT, số tài khoản hoặc đường dẫn trong ô Góp ý"
          });
          showToast("Vì an toàn, vui lòng không điền số điện thoại hay đường link lạ vào mục góp ý.");
          return;
        }
        const chosenCat = selectedCat || "feature_wish";
        if (!state.analytics) state.analytics = {};
        if (!Array.isArray(state.analytics.feedbacks)) state.analytics.feedbacks = [];
        state.analytics.feedbacks.unshift({
          id: `fb_${Date.now()}`,
          ts: Date.now(),
          category: chosenCat,
          text: cleanMsg.slice(0, 200)
        });
        if (state.analytics.feedbacks.length > 60) {
          state.analytics.feedbacks = state.analytics.feedbacks.slice(0, 60);
        }
        trackTelemetryDirect("user_feedback", sourceHint || state.route || "home", chosenCat, {
          category: chosenCat,
          text: cleanMsg.slice(0, 200),
          detail: cleanMsg.slice(0, 140)
        });
        saveState();
        closeDialog();
        if (!feedbackRewardedThisSession) {
          feedbackRewardedThisSession = true;
          addXu(2, "Cảm ơn bác đã gửi góp ý xây dựng Quán Trà");
        } else {
          showToast("Đã gửi góp ý tới Ban Quản Trị Quán Trà. Xin cảm ơn bác!");
        }
        if (state.route === "privacy") {
          renderPrivacyAndMetrics();
        }
      });
    }
  }

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

  function bindPersonalPrivacyEvents() {
    const voiceToggleBtn = document.getElementById("btn-priv-toggle-voicemode");
    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener("click", () => {
        state.settings.voiceMode = state.settings.voiceMode === "recorded" ? "auto" : "recorded";
        saveState();
        showToast(
          state.settings.voiceMode === "recorded"
            ? "Đã bật ưu tiên Giọng người thu sẵn ngoại tuyến (.mp3)!"
            : "Đã chuyển về chế độ Giọng đọc Tự động."
        );
        renderPrivacyAndMetrics();
      });
    }
    const voiceSampleBtn = document.getElementById("btn-priv-sample-voice");
    if (voiceSampleBtn) {
      voiceSampleBtn.addEventListener("click", () => {
        const clip = D.VOICE_CLIPS && D.VOICE_CLIPS["chao-buoi-sang"];
        speak(clip ? clip.text : "Chào buổi sáng bác!", {
          clipId: "chao-buoi-sang",
          announceToast: true
        });
      });
    }

    const famBtn = document.getElementById("btn-toggle-consent-family");
    if (famBtn) {
      famBtn.addEventListener("click", () => {
        state.privacy.consentFamilyCheckin = !state.privacy.consentFamilyCheckin;
        saveState();
        renderPrivacyAndMetrics();
      });
    }
    const rtBtn = document.getElementById("btn-toggle-consent-rt");
    if (rtBtn) {
      rtBtn.addEventListener("click", () => {
        state.privacy.consentRealtimePresence = !state.privacy.consentRealtimePresence;
        if (!state.privacy.consentRealtimePresence && RT) {
          RT.leaveTableChannel();
        }
        saveState();
        renderPrivacyAndMetrics();
      });
    }
    const dictBtn = document.getElementById("btn-toggle-consent-dict");
    if (dictBtn) {
      dictBtn.addEventListener("click", () => {
        state.privacy.consentVoiceDict = !state.privacy.consentVoiceDict;
        saveState();
        renderPrivacyAndMetrics();
      });
    }

    const expPersonal = document.getElementById("btn-export-personal-json");
    if (expPersonal) {
      expPersonal.addEventListener("click", () => {
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
    }

    const wipeBtn = document.getElementById("btn-wipe-personal-data");
    if (wipeBtn) {
      wipeBtn.addEventListener("click", () => {
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
  }

  function renderPersonalPrivacySectionHtml() {
    return `
      <div class="surface-panel warm">
        <h3>Giọng Đọc Tiếng Việt Ngoại Tuyến (15 Clip Thu Sẵn)</h3>
        <p style="font-size:0.88rem; color:var(--ink-secondary);">Dành cho điện thoại Android cũ thiếu bộ giọng tiếng Việt: phát trực tiếp tệp âm thanh thu sẵn cho lời chào sáng, dẫn Chánh Điện/Nhà Thờ Họ/Vườn Thiền, cờ dân gian và 6 quẻ lộc đầu ngày.</p>
        <div class="btn-row">
          <button type="button" class="btn-${state.settings.voiceMode === "recorded" ? "jade" : "secondary"}" id="btn-priv-toggle-voicemode">
            ${ico("speaker")}
            <span>${state.settings.voiceMode === "recorded" ? "Đang bật: Giọng thu sẵn (.mp3)" : "Chế độ: Tự động (TTS + Dự phòng)"}</span>
          </button>
          <button type="button" class="btn-secondary" id="btn-priv-sample-voice">Nghe thử giọng thu sẵn</button>
        </div>
      </div>

      <div class="surface-panel">
        <h3>Quyền Riêng Tư Cá Nhân (Nghị định 13/2023/NĐ-CP)</h3>
        <div class="consent-toggle-card">
          <strong>1. Báo tin Điểm danh sáng cho con cái</strong>
          <button type="button" class="btn-${state.privacy.consentFamilyCheckin ? "jade" : "secondary"}" id="btn-toggle-consent-family">
            ${state.privacy.consentFamilyCheckin ? "Đang bật: Báo tin bình an" : "Đang tắt: Lưu trên máy"}
          </button>
        </div>
        <div class="consent-toggle-card">
          <strong>2. Hiện tên &amp; nhân vật cùng bàn trà</strong>
          <button type="button" class="btn-${state.privacy.consentRealtimePresence ? "jade" : "secondary"}" id="btn-toggle-consent-rt">
            ${state.privacy.consentRealtimePresence ? "Đang bật: Tham gia trực tuyến" : "Đang tắt: Ẩn hiện diện"}
          </button>
        </div>
        <div class="consent-toggle-card">
          <strong>3. Tự học từ điển phát âm trên máy</strong>
          <button type="button" class="btn-${state.privacy.consentVoiceDict ? "jade" : "secondary"}" id="btn-toggle-consent-dict">
            ${state.privacy.consentVoiceDict ? "Đang bật: Tự học từ điển" : "Đang tắt: Không lưu từ mới"}
          </button>
        </div>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-export-personal-json">${ico("download")}<span>Tải dữ liệu cá nhân (.json)</span></button>
          <button type="button" class="btn-danger" id="btn-wipe-personal-data">Xóa dữ liệu trên máy này</button>
        </div>
      </div>
    `;
  }

  function renderPrivacyAndMetrics() {
    const adminUnlocked = isAdminUnlocked();
    if (!adminUnlocked) {
      els.main.innerHTML = `
        <h1>Quyền Riêng Tư &amp; Cài Đặt Cá Nhân</h1>
        <p class="lead-copy">Quản lý dữ liệu riêng tư trên máy của ${getUserPronoun()}, chọn chế độ giọng đọc ngoại tuyến hoặc gửi góp ý cho Ban Chủ Nhiệm.</p>

        <div class="surface-panel jade">
          <div class="passcard-head">
            <strong>Hòm thư Góp ý &amp; Hỗ trợ Hội viên</strong>
            ${state.settings.uatTag ? `<span class="badge-tag amber">UAT: ${escHtml(state.settings.uatTag)}</span>` : ""}
          </div>
          <p style="font-size:0.88rem;">Nếu chữ nhỏ, âm thanh khó nghe hoặc muốn đề xuất tính năng mới, mời ${getUserPronoun()} bấm gửi góp ý 1 chạm:</p>
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-member-open-feedback">${ico("feedback", "ico-sm")}<span>Gửi Góp ý nhanh</span></button>
            <button type="button" class="btn-secondary" id="btn-member-pwa-guide">${ico("download", "ico-sm")}<span>Cài ra màn hình</span></button>
          </div>
        </div>

        ${renderPersonalPrivacySectionHtml()}

        <div class="surface-panel">
          <div class="passcard-head">
            <strong>Khu vực Quản trị viên &amp; Vận hành (Đã khóa bảo vệ)</strong>
            <span class="badge-tag">Admin</span>
          </div>
          <p style="font-size:0.86rem; color:var(--ink-secondary);">Dash quản lý hoạt động toàn quán, duyệt RSS Báo Sáng, kiểm thử UAT 5–10 bác và cấu hình máy chủ Supabase được đặt mật khẩu riêng để hội viên không bấm nhầm.</p>
          <button type="button" class="btn-secondary" id="btn-unlock-admin-console">${ico("shield")}<span>Mở khóa Dash Quản Trị (Admin)</span></button>
        </div>
      `;

      document.getElementById("btn-member-open-feedback").addEventListener("click", () => openFeedbackModal("privacy"));
      document.getElementById("btn-member-pwa-guide").addEventListener("click", openPwaInstallGuide);
      document.getElementById("btn-unlock-admin-console").addEventListener("click", () => {
        openAdminUnlockModal(() => renderPrivacyAndMetrics());
      });
      bindPersonalPrivacyEvents();

      if (pendingAdminAutoPrompt) {
        pendingAdminAutoPrompt = false;
        setTimeout(() => openAdminUnlockModal(() => renderPrivacyAndMetrics()), 80);
      }
      return;
    }

    if (activePrivacySubTab === "ai-logs") {
      activePrivacySubTab = "overview-dash";
    }
    const a = state.analytics || {};
    const quickCount = a.tea_msg_quick_0token || 0;
    const voiceTextCount = a.tea_msg_voice_or_text || 0;
    const totalMsgs = quickCount + voiceTextCount;
    const zeroTokenPct = totalMsgs > 0 ? Math.round((quickCount / totalMsgs) * 100) : 100;
    const st = RT ? RT.getStatus() : { connected: false, providerName: "Cục bộ", totalOtherPeers: 0, clientId: "local" };
    const savedSbCfg = RT ? RT.getSupabaseConfig() : null;
    const hotEvents = TEL ? TEL.getHotEvents() : [];
    const totalIdbEvents = TEL ? TEL.getTotalStoredEstimate() : hotEvents.length;
    const deepProfiles = TEL ? TEL.getMemberDeepProfiles() : [];
    const uatReport =
      TEL && typeof TEL.getUatAndXpCalibrationReport === "function"
        ? TEL.getUatAndXpCalibrationReport(state.user.seniorityPoints || 28, state.user.streakDays || 1)
        : null;
    const dash = TEL
      ? TEL.getGlobalActivityDashboard(sessionSeconds)
      : {
          kpis: {
            totalMembers: deepProfiles.length,
            totalEvents: hotEvents.length,
            totalOnTimeMin: 1,
            avgOnTimeMin: 1,
            peakHour: 6,
            peakTimeBucketLabel: "Buổi sáng",
            totalChats: 0,
            zeroTokenPct: 100,
            totalComplaints: 0,
            totalSuggestions: 0,
            totalSafetyAlerts: 0,
            topService: { label: "Sảnh chính", dwellMin: 1, pctOfTime: 100 },
            topComplaint: { label: "Chưa có", count: 0 }
          },
          globalHourlyHist: new Array(24).fill(0),
          topOnTimeMembers: [],
          serviceRanking: [],
          chatOverview: { totalMessages: 0, byMethod: { quick_0token: 0, sticker_1tap: 0, typed_text: 0, voice_speech: 0 }, topTopics: [], topSearchQueries: [] },
          complaintRanking: [],
          issueFeed: []
        };

    const filteredIssues = (dash.issueFeed || []).filter((item) => {
      if (activeIssueFilter === "complaints") return Boolean(item.isComplaint);
      if (activeIssueFilter === "suggestions") return !item.isComplaint;
      return true;
    });

    const filteredProfiles = deepProfiles.filter((p) =>
      activeDashMemberFilter === "all" ? true : p.memberCode === activeDashMemberFilter
    );

    const searchQ = activeDashSearchQuery.trim().toLowerCase();
    const filteredEvents = hotEvents.filter((ev) => {
      if (activeDashMemberFilter !== "all" && ev.memberCode !== activeDashMemberFilter) return false;
      if (!searchQ) return true;
      const m = ev.meta || {};
      const hay = `${ev.userName || ""} ${ev.memberCode || ""} ${ev.module || ""} ${ev.subAction || ""} ${m.detail || ""} ${m.text || ""} ${m.query || ""}`.toLowerCase();
      return hay.includes(searchQ);
    });

    const maxSvcScore = Math.max(1, ...(dash.serviceRanking || []).map((s) => s.dwellSec + s.actions * 15));
    const maxCmpCount = Math.max(1, ...(dash.complaintRanking || []).map((c) => c.count));
    const baseShare = getPublicBaseUrl();

    els.main.innerHTML = `
      <h1>Dash Quản Trị Hoạt Động &amp; Vận Hành</h1>

      <div class="admin-session-bar">
        <span>${ico("shield", "ico-sm")} Đang mở phiên Quản trị viên (Admin)</span>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn-mini" id="btn-admin-change-pin">Đổi mã khóa</button>
          <button type="button" class="btn-mini" id="btn-admin-lock-now">Khóa lại</button>
        </div>
      </div>

      <div class="temple-cam-bar" role="tablist" aria-label="Chọn khu vực quản trị hoạt động">
        <button type="button" class="temple-cam-btn ${activePrivacySubTab === "overview-dash" ? "active" : ""}" id="btn-priv-tab-overview">Tổng Quan</button>
        <button type="button" class="temple-cam-btn ${activePrivacySubTab === "complaints-chat" ? "active" : ""}" id="btn-priv-tab-issues">Chat &amp; Góp Ý (${dash.kpis.totalComplaints + dash.kpis.totalSuggestions})</button>
        <button type="button" class="temple-cam-btn ${activePrivacySubTab === "uat-xp" ? "active" : ""}" id="btn-priv-tab-uat">UAT &amp; 23.008 XP</button>
        <button type="button" class="temple-cam-btn ${activePrivacySubTab === "privacy" ? "active" : ""}" id="btn-priv-tab-gdpr">Supabase &amp; Kho AI</button>
      </div>

      ${
        activePrivacySubTab === "overview-dash"
          ? `
        <div class="surface-panel jade">
          <div class="passcard-head">
            <strong>Giám sát 100% hành vi (${totalIdbEvents} sự kiện)</strong>
            <span class="online-status-pill"><span class="online-dot-live"></span>${st.totalOtherPeers + 1} máy mở</span>
          </div>
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-dash-open-rss-review">${ico("paper", "ico-sm")}<span>Duyệt Báo Sáng (${state.newspaper.drafts.length})</span></button>
            <button type="button" class="btn-secondary" id="btn-flush-dwell-now">Chốt On-Time ngay</button>
          </div>
        </div>

        <div class="dash-kpi-grid">
          <div class="dash-kpi-card is-jade">
            <small>Tổng On-Time toàn quán</small>
            <strong class="num">${dash.kpis.totalOnTimeMin} phút</strong>
            <small class="num">TB ${dash.kpis.avgOnTimeMin}p/người · Cao điểm ${String(dash.kpis.peakHour).padStart(2, "0")}h</small>
          </div>
          <div class="dash-kpi-card">
            <small>Dịch vụ dùng nhiều nhất</small>
            <strong>${escHtml(dash.kpis.topService.label)}</strong>
            <small class="num">${dash.kpis.topService.dwellMin} phút · ${dash.kpis.topService.pctOfTime}% thời lượng</small>
          </div>
          <div class="dash-kpi-card">
            <small>Tổng lượt Chat toàn quán</small>
            <strong class="num">${dash.kpis.totalChats} câu</strong>
            <small class="num">${dash.kpis.zeroTokenPct}% dùng câu nhanh/Sticker</small>
          </div>
          <div class="dash-kpi-card is-warn">
            <small>Phàn nàn &amp; An toàn</small>
            <strong class="num">${dash.kpis.totalComplaints} phàn nàn</strong>
            <small class="num">${dash.kpis.totalSafetyAlerts} chặn an toàn · ${dash.kpis.totalSuggestions} đề xuất</small>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Nhịp On-Time 24h Toàn Quán (${escHtml(dash.kpis.peakTimeBucketLabel)})</h3>
          ${renderHourlyHistogramHtml(dash.globalHourlyHist)}
          <div class="member-log-list" style="margin-top:6px;">
            ${(dash.topOnTimeMembers || [])
              .map(
                (m, idx) => `
              <div class="province-rank-item">
                <div>
                  <strong>${idx + 1}. ${escHtml(m.userName)} · ${m.age}t</strong>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">${escHtml(m.province)} · Hay ở: ${escHtml(m.topModuleLabel)} · ${m.chatCount} chat</div>
                </div>
                <span class="badge-tag amber num">${m.dwellMin} phút</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Xếp Hạng Dịch Vụ Được Dùng Nhiều Nhất</h3>
          <div class="dash-rank-list">
            ${(dash.serviceRanking || [])
              .map((svc, idx) => {
                const barW = Math.max(8, Math.round(((svc.dwellSec + svc.actions * 15) / maxSvcScore) * 100));
                return `
                <div class="dash-rank-row">
                  <div class="dash-rank-head">
                    <strong>${idx + 1}. ${escHtml(svc.label)}</strong>
                    <span class="num">${svc.dwellMin} phút (${svc.pctOfTime}%) · ${svc.actions} lượt</span>
                  </div>
                  <div class="dash-bar-track">
                    <div class="dash-bar-fill ${idx === 0 ? "" : "is-amber"}" style="width:${barW}%"></div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `
          : activePrivacySubTab === "complaints-chat"
          ? `
        <div class="surface-panel">
          <div class="passcard-head">
            <h3>Chủ Đề Phàn Nàn &amp; Góp Ý Nhiều Nhất</h3>
            <button type="button" class="btn-mini" id="btn-dash-feedback-2">+ Thêm góp ý</button>
          </div>
          <div class="dash-rank-list">
            ${(dash.complaintRanking || [])
              .map((cmp) => {
                const barW = cmp.count > 0 ? Math.max(10, Math.round((cmp.count / maxCmpCount) * 100)) : 4;
                return `
                <div class="dash-rank-row">
                  <div class="dash-rank-head">
                    <strong>${escHtml(cmp.label)}</strong>
                    <span class="num">${cmp.count} lượt (${cmp.pct}%)</span>
                  </div>
                  <div class="dash-bar-track">
                    <div class="dash-bar-fill ${cmp.isComplaint ? "is-complaint" : ""}" style="width:${barW}%"></div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <div class="surface-panel warm">
          <h3>Thói Quen Chat Chit &amp; Tìm Kiếm Toàn Quán (${dash.chatOverview.totalMessages} câu)</h3>
          <div class="chat-method-grid">
            <div class="chat-method-chip"><span>Câu nhanh 0-Token</span><strong class="num">${dash.chatOverview.byMethod.quick_0token}</strong></div>
            <div class="chat-method-chip"><span>Sticker 1 chạm</span><strong class="num">${dash.chatOverview.byMethod.sticker_1tap}</strong></div>
            <div class="chat-method-chip"><span>Gõ phím chữ</span><strong class="num">${dash.chatOverview.byMethod.typed_text}</strong></div>
            <div class="chat-method-chip"><span>Giọng nói Micro</span><strong class="num">${dash.chatOverview.byMethod.voice_speech}</strong></div>
          </div>
          ${
            dash.chatOverview.topTopics.length > 0
              ? `<p style="font-size:0.86rem;"><strong>Chủ đề bàn trà nổi bật:</strong> ${dash.chatOverview.topTopics.map((t) => `${escHtml(t.topic)} (${t.count})`).join(" · ")}</p>`
              : ""
          }
          ${
            dash.chatOverview.topSearchQueries.length > 0
              ? `<p style="font-size:0.86rem;"><strong>Từ khóa tìm kiếm gần đây:</strong> ${dash.chatOverview.topSearchQueries.map((q) => `"${escHtml(q)}"`).join(", ")}</p>`
              : ""
          }
        </div>

        <div class="surface-panel">
          <h3>Chi Tiết Phàn Nàn, Góp Ý &amp; Cảnh Báo An Toàn (${filteredIssues.length})</h3>
          <div class="temple-cam-bar" role="group" aria-label="Lọc danh sách phàn nàn và góp ý">
            <button type="button" class="temple-cam-btn ${activeIssueFilter === "all" ? "active" : ""}" data-issue-flt="all">Tất cả (${(dash.issueFeed || []).length})</button>
            <button type="button" class="temple-cam-btn ${activeIssueFilter === "complaints" ? "active" : ""}" data-issue-flt="complaints">Phàn nàn (${dash.kpis.totalComplaints})</button>
            <button type="button" class="temple-cam-btn ${activeIssueFilter === "suggestions" ? "active" : ""}" data-issue-flt="suggestions">Đề xuất &amp; Khen (${dash.kpis.totalSuggestions})</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${
              filteredIssues.length === 0
                ? `<p style="font-size:0.88rem; color:var(--ink-secondary);">Chưa có ghi nhận nào trong mục lọc này.</p>`
                : filteredIssues
                    .map((it) => {
                      const d = new Date(it.ts || Date.now());
                      const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      const tagCls =
                        it.categoryId === "safety_alert"
                          ? "is-safe"
                          : it.isComplaint
                          ? "is-pain"
                          : it.categoryId === "praise"
                          ? "is-praise"
                          : "is-wish";
                      return `
                      <div class="issue-feed-card">
                        <div class="issue-feed-top">
                          <strong>${escHtml(it.userName)} · ${it.age}t (${escHtml(it.province)}) · ${hhmm}</strong>
                          <span class="issue-tag ${tagCls}">${escHtml(it.categoryLabel)}</span>
                        </div>
                        <p style="font-size:0.9rem;">${escHtml(it.text)}</p>
                      </div>
                    `;
                    })
                    .join("")
            }
          </div>
        </div>
      `
          : activePrivacySubTab === "uat-xp"
          ? `
        <div class="surface-panel jade">
          <div class="passcard-head">
            <strong>UAT Thực Tế 5–10 Cô Bác (Android tầm trung · 4G)</strong>
            <span class="badge-tag amber num">${uatReport && Array.isArray(uatReport.uatRoster) ? uatReport.uatRoster.length : 0}/10 máy UAT</span>
          </div>
          <p style="font-size:0.88rem;">Gửi đường dẫn gắn nhãn <code>?uat=...</code> qua Zalo cho 5–10 cô bác dùng thử 1–2 tuần trên 4G để tự động gom số liệu cỡ chữ, mạng và tốc độ lên bậc XP:</p>
          <div class="btn-row">
            <button type="button" class="btn-primary copy-uat-link-btn" data-uat-code="bac01-4g">Chép link Bác 01 (4G)</button>
            <button type="button" class="btn-secondary copy-uat-link-btn" data-uat-code="clb-huutri">Chép link Nhóm CLB</button>
          </div>
        </div>

        ${
          uatReport
            ? `
        <div class="dash-kpi-grid">
          <div class="dash-kpi-card is-jade">
            <small>Nhịp XP thực tế / ngày</small>
            <strong class="num">${uatReport.measuredXpPerDay} XP/ngày</strong>
            <small class="num">TB ${uatReport.avgDailyMinutes} phút/ngày</small>
          </div>
          <div class="dash-kpi-card">
            <small>Dự phóng Bậc 32 (23.008 XP)</small>
            <strong class="num">${uatReport.projections[0].daysToTier32} ngày</strong>
            <small class="num">~${uatReport.projections[0].monthsToTier32} tháng · Bậc 16: ~${uatReport.projections[0].daysToTier16}n</small>
          </div>
          <div class="dash-kpi-card">
            <small>Tỷ lệ bật Chữ to 24px</small>
            <strong class="num">${uatReport.xlFontAdoptionPct}%</strong>
            <small class="num">Đo trực tiếp trên thiết bị thật</small>
          </div>
          <div class="dash-kpi-card">
            <small>Giọng thu sẵn (.mp3)</small>
            <strong class="num">${uatReport.ttsBreakdown.recorded_mp3} lượt</strong>
            <small class="num">Nội bộ: ${uatReport.ttsBreakdown.native_vi} · Đám mây: ${uatReport.ttsBreakdown.cloud_vi}</small>
          </div>
        </div>

        <div class="surface-panel warm">
          <h3>Đề xuất cân chỉnh mốc 23.008 XP (Tự động từ Telemetry)</h3>
          <p style="font-size:0.9rem; font-weight:600; color:#5A3410;">${escHtml(uatReport.recommendation)}</p>
          <div class="metrics-stat-list">
            ${uatReport.projections
              .map(
                (pj) => `
              <div class="metrics-stat-row">
                <span>${escHtml(pj.label)}</span>
                <strong class="num">~${pj.daysToTier32} ngày (${pj.monthsToTier32} tháng)</strong>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Danh sách máy UAT đã ghi nhận (${uatReport.uatRoster.length})</h3>
          ${
            uatReport.uatRoster.length === 0
              ? `<p style="font-size:0.88rem; color:var(--ink-secondary);">Chưa có phiên mở từ liên kết <code>?uat=...</code> trên máy này.</p>`
              : uatReport.uatRoster
                  .map(
                    (ur) => `
              <div class="province-rank-item">
                <div>
                  <strong>${escHtml(ur.userName)} · ${ur.age}t (${escHtml(ur.province)})</strong>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">Mã UAT: <code>${escHtml(ur.uatTag)}</code> · Mạng: ${escHtml(ur.netType)} · ${ur.xlFont ? "Chữ 24px" : "Chữ 20px"}</div>
                </div>
                <span class="badge-tag jade num">${ur.eventsCount} sự kiện</span>
              </div>
            `
                  )
                  .join("")
          }
        </div>
        `
            : ""
        }
      `
          : `
        <div class="surface-panel ${st.connected ? "jade" : "warm"}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <strong>Máy chủ Bền Vững &amp; Realtime: ${st.connected ? "Đang trực tuyến" : "Đang nối..."}</strong>
            <span class="badge-tag num">${escHtml(st.providerName)}</span>
          </div>
          <p style="font-size:0.88rem;">Thiết bị thật đang mở cùng lúc: <strong class="num">${st.totalOtherPeers}</strong> · Trạng thái Supabase: <strong>${savedSbCfg ? "Đã gắn khóa dự án" : "Đang chạy WSS công cộng"}</strong></p>
          <div class="btn-row">
            <button type="button" class="btn-primary" id="btn-open-rt-modal">${ico("wifi")}<span>Gắn &amp; Kiểm tra Supabase</span></button>
            <button type="button" class="btn-secondary" id="btn-privacy-pwa">${ico("download")}<span>Cài ra màn hình</span></button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Tra Cứu Từng Thành Viên &amp; Xuất Dữ Liệu AI (${deepProfiles.length} hồ sơ)</h3>
          <div class="setup-inline-fields">
            <label class="field-label" style="flex:1;">
              Chọn thành viên
              <select class="select-lg" id="dash-member-filter">
                <option value="all" ${activeDashMemberFilter === "all" ? "selected" : ""}>Tất cả hội viên (${deepProfiles.length})</option>
                ${deepProfiles
                  .map(
                    (p) =>
                      `<option value="${escHtml(p.memberCode)}" ${activeDashMemberFilter === p.memberCode ? "selected" : ""}>${escHtml(p.userName)} (${escHtml(p.memberCode)})</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field-label" style="flex:1.2;">
              Tìm trong log hành vi
              <input type="text" class="input-lg" id="dash-log-search" value="${escHtml(activeDashSearchQuery)}" placeholder="Ví dụ: chat, cờ, báo..." />
            </label>
          </div>
          <div class="temple-ritual-grid" style="margin-top:8px;">
            <button type="button" class="btn-primary" id="btn-export-ai-jsonl">${ico("download")}<span>Xuất AI (.jsonl)</span></button>
            <button type="button" class="btn-jade" id="btn-export-ai-logs-json">${ico("download")}<span>Xuất Kho (.json)</span></button>
            <button type="button" class="btn-secondary" id="btn-export-ai-logs-csv"><span>Xuất Excel (.csv)</span></button>
            <button type="button" class="btn-secondary" id="btn-flush-dwell-now"><span>Chốt On-Time</span></button>
          </div>
        </div>

        <div class="surface-panel">
          <h3>Hồ Sơ Thói Quen Từng Thành Viên (${filteredProfiles.length})</h3>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${filteredProfiles
              .map((p) => {
                const cs = p.chatSummary;
                return `
              <div class="ai-persona-card">
                <div class="passcard-head">
                  <strong>${escHtml(p.userName)} · ${p.age}t (${escHtml(p.province)})</strong>
                  <span class="cohort-pill ${p.seniorityLevel >= 17 ? "veteran" : p.seniorityLevel >= 6 ? "trusted" : "newcomer"}">${escHtml(p.memberCode)} · ${p.totalEvents} sự kiện</span>
                </div>
                <small style="font-size:0.88rem; color:#6B4208; font-weight:700;">${escHtml(p.seniorityTitle)} · Cao điểm: ${String(p.peakHour).padStart(2, "0")}h00</small>
                ${renderHourlyHistogramHtml(p.hourlyHist)}
                <div style="font-size:0.88rem;"><strong>Gắn bó theo màn hình:</strong> ${escHtml(p.topDwellSummary)}</div>
                <div style="font-size:0.88rem;"><strong>Thói quen chat:</strong> <span class="num">${cs.totalMessages}</span> câu · ${escHtml(cs.dominantMethodLabel)}</div>
                <div style="font-size:0.88rem; color:var(--accent-jade); font-weight:700;">Gợi ý AI: ${escHtml(p.aiActionableInsight)}</div>
              </div>
            `;
              })
              .join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Dòng Sự Kiện Gần Nhất (${filteredEvents.length} bản ghi khớp)</h3>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${filteredEvents
              .slice(0, 25)
              .map((ev) => {
                const d = new Date(ev.ts || Date.now());
                const hms = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
                const m = ev.meta || {};
                const methodBadge = m.inputMethod ? ` · ${m.inputMethod}` : "";
                return `
                  <div class="member-log-item">
                    <div style="display:flex; justify-content:space-between; gap:8px; font-weight:700; flex-wrap:wrap;">
                      <span>[${hms}] ${escHtml(ev.userName)} (${escHtml(ev.memberCode)})</span>
                      <span style="color:var(--accent-terracotta);">${escHtml(ev.module)}/${escHtml(ev.subAction)}</span>
                    </div>
                    <span>On-Time: ${ev.dwellSec || 0}s${escHtml(methodBadge)} · ${escHtml(m.detail || m.text || m.query || m.wishText || JSON.stringify(m).slice(0, 90))}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <div class="surface-panel">
          <h3>Chỉ Số Sản Phẩm &amp; Tiết Kiệm Token</h3>
          <div class="metrics-stat-list">
            <div class="metrics-stat-row">
              <span>Nút gợi ý nhanh (0 tốn Token)</span>
              <strong class="num" style="color:var(--accent-jade);">${zeroTokenPct}% (${quickCount}/${totalMsgs})</strong>
            </div>
            <div class="metrics-stat-row">
              <span>Sổ từ điển tự học (<code>phonetic_dictionary</code>)</span>
              <strong class="num">${state.phoneticDict.length} cặp từ</strong>
            </div>
            <div class="metrics-stat-row">
              <span>Phiên mở app · Điểm danh sáng</span>
              <strong class="num">${a.session_start || 1} · ${a.morning_checkin_done || 0}</strong>
            </div>
            <div class="metrics-stat-row">
              <span>Vào bàn trà · Đọc báo sáng</span>
              <strong class="num">${a.tea_table_joined || 0} · ${a.news_article_read || 0}</strong>
            </div>
            <div class="metrics-stat-row">
              <span>Nước cờ treo · Thơ mới · Chia sẻ</span>
              <strong class="num">${a.async_game_move || 0} · ${a.poem_posted || 0} · ${a.share_link_created || 0}</strong>
            </div>
          </div>
        </div>

        ${renderPersonalPrivacySectionHtml()}
      `
      }
    `;

    document.getElementById("btn-admin-lock-now").addEventListener("click", () => {
      lockAdminSession();
      showToast("Đã khóa quyền Quản trị viên — quay về giao diện Hội viên.");
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-admin-change-pin").addEventListener("click", openChangeAdminPinModal);

    document.getElementById("btn-priv-tab-overview").addEventListener("click", () => {
      activePrivacySubTab = "overview-dash";
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-priv-tab-issues").addEventListener("click", () => {
      activePrivacySubTab = "complaints-chat";
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-priv-tab-uat").addEventListener("click", () => {
      activePrivacySubTab = "uat-xp";
      renderPrivacyAndMetrics();
    });
    document.getElementById("btn-priv-tab-gdpr").addEventListener("click", () => {
      activePrivacySubTab = "privacy";
      renderPrivacyAndMetrics();
    });

    const rssJumpBtn = document.getElementById("btn-dash-open-rss-review");
    if (rssJumpBtn) {
      rssJumpBtn.addEventListener("click", () => {
        state.newspaper.adminOpen = true;
        saveState();
        navigate("newspaper");
      });
    }
    const dashFbBtn2 = document.getElementById("btn-dash-feedback-2");
    if (dashFbBtn2) dashFbBtn2.addEventListener("click", () => openFeedbackModal("privacy"));

    els.main.querySelectorAll(".copy-uat-link-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.uatCode || "bac01";
        const uatUrl = `${baseShare}?uat=${encodeURIComponent(code)}`;
        copyTextSafe(uatUrl, `Đã chép link UAT (${code}) để gửi Zalo cho cô bác thử nghiệm!`);
      });
    });

    els.main.querySelectorAll("[data-issue-flt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeIssueFilter = btn.dataset.issueFlt || "all";
        renderPrivacyAndMetrics();
      });
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
          "Đã xuất tệp chuẩn phân tích AI (.jsonl)!"
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
          "Đã xuất toàn bộ Kho AI Telemetry & Dash (.json)!"
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
        showToast("Đã chốt thời lượng On-Time hiện tại vào kho theo dõi!");
        renderPrivacyAndMetrics();
      });
    }

    if (activePrivacySubTab !== "privacy") return;

    const memFilterEl = document.getElementById("dash-member-filter");
    if (memFilterEl) {
      memFilterEl.addEventListener("change", () => {
        activeDashMemberFilter = memFilterEl.value || "all";
        renderPrivacyAndMetrics();
      });
    }
    const logSearchEl = document.getElementById("dash-log-search");
    if (logSearchEl) {
      logSearchEl.addEventListener("change", () => {
        activeDashSearchQuery = logSearchEl.value || "";
        renderPrivacyAndMetrics();
      });
    }

    document.getElementById("btn-open-rt-modal").addEventListener("click", openRealtimeStatusModal);
    document.getElementById("btn-privacy-pwa").addEventListener("click", openPwaInstallGuide);
    bindPersonalPrivacyEvents();
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
    const safeHash = String(decoded.h).trim();
    const safeCode = String(decoded.c).trim();
    if (!/^[a-zA-Z0-9_-]{8,48}$/.test(safeHash) || !/^TB-\d{4,6}$/.test(safeCode)) return;
    state.auth.isRegistered = true;
    state.auth.accountHash = safeHash;
    state.auth.memberCode = safeCode;
    state.auth.phoneMasked = String(decoded.m || "").replace(/[<>"'`\\]/g, "").slice(0, 20);
    state.auth.recoveryToken = String(rawTok || "").slice(0, 360);
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
    if (state.route === "zen") {
      const seatIdx =
        typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx)
          ? Math.max(0, Math.min(19, Math.floor(state.zen.userCushionIdx)))
          : 2;
      const spObj = (D.ZEN_SPACES && D.ZEN_SPACES[state.zen.spaceIdx]) || { name: "Sân Chùa Quê" };
      return `Đang ngồi Chiếu ${seatIdx + 1} (${spObj.name})`;
    }
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
    const cushionIdx =
      typeof state.zen.userCushionIdx === "number" && Number.isFinite(state.zen.userCushionIdx)
        ? Math.max(0, Math.min(19, Math.floor(state.zen.userCushionIdx)))
        : 2;
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
      cushionIdx,
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
        const fullName = (nameIn.value || "").replace(/[<>]/g, "").trim() || "Hội Đồng Niên Mới";
        const camp = (document.getElementById("cg-camp-in").value || "").replace(/[<>]/g, "").trim();
        const motto = (document.getElementById("cg-motto-in").value || "").replace(/[<>]/g, "").trim() || "Chúc toàn hội luôn mạnh khỏe, an vui!";
        const compClean = (compIn.value || "").replace(/[<>]/g, "").trim();
        const batClean = (batIn.value || "").replace(/[<>]/g, "").trim();
        const divClean = (divIn.value || "").replace(/[<>]/g, "").trim();
        if (isUnsafeScamOrPiiText(`${fullName} ${camp} ${motto} ${compClean} ${batClean} ${divClean}`)) {
          trackTelemetryDirect("chat_blocked", "groups", "auto_blocked_group_create", {
            category: "safety_alert",
            detail: "Chặn tự động SĐT, đường link hoặc từ khóa lừa đảo khi lập Hội nhóm"
          });
          showToast("Vì an toàn, tên hội và khẩu hiệu không được chứa số điện thoại, số tài khoản hoặc đường link.");
          return;
        }
        const gid = "hoi-" + Math.random().toString(36).slice(2, 8);
        const newGrp = {
          id: gid,
          name: fullName,
          shortName: fullName.length > 26 ? fullName.slice(0, 25) + "…" : fullName,
          category: cat,
          unitSpec:
            cat === "veteran"
              ? {
                  company: compClean,
                  battalion: batClean,
                  division: divClean,
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
            <button type="button" class="btn-secondary" id="btn-unit-enter-chess-cup">
              ${ico("trophy")}
              <span>Đấu Cúp Cờ Tướng Đại Diện Đơn Vị</span>
            </button>
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

    const enterCupFromUnitBtn = document.getElementById("btn-unit-enter-chess-cup");
    if (enterCupFromUnitBtn) {
      enterCupFromUnitBtn.addEventListener("click", () => {
        const g = getGroupById(state.social.selectedGroupId);
        if (!state.xiangqi.cup || typeof state.xiangqi.cup !== "object") {
          state.xiangqi.cup = createDefaultState().xiangqi.cup;
        }
        state.xiangqi.cup.unitName = (g && (g.shortName || g.name)) || getCupUnitDisplayName();
        if (state.xiangqi.cup.justWonTitle) {
          state.xiangqi.cup.round = 0;
          state.xiangqi.cup.justWonTitle = false;
          state.xiangqi.cup.justWonRound = false;
        }
        switchXiangqiMode("cup");
        navigate("xiangqi");
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
          const safety = cleanAndApplyDictionary(txt);
          if (safety.blocked) {
            trackTelemetryDirect("chat_blocked", "groups", "auto_blocked_bulletin", {
              category: "safety_alert",
              detail: "Chặn tự động SĐT, số tài khoản hoặc đường link trên Bảng tin Đơn vị"
            });
            showToast(safety.reason);
            return;
          }
          requireMemberCard("Đăng thông báo lên Bảng tin Đơn vị", () => {
            if (!Array.isArray(g.bulletins)) g.bulletins = [];
            g.bulletins.unshift({
              author: `${state.user.name} · ${getUserAge()} tuổi`,
              time: "Vừa xong",
              text: txt.slice(0, 200)
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
      <div class="btn-row">
        <button type="button" class="btn-secondary" id="btn-listen-eyecare">${ico("speaker")}<span>Nghe lời nhắc</span></button>
        <button type="button" class="btn-jade" id="btn-ack-eyecare">Tôi đã nghỉ mắt — Tiếp tục</button>
      </div>
      `
    );
    const listenEyeBtn = document.getElementById("btn-listen-eyecare");
    if (listenEyeBtn) {
      listenEyeBtn.addEventListener("click", () => {
        const clip = D.VOICE_CLIPS && D.VOICE_CLIPS["nhac-nghi-mat"];
        speak(
          clip ? clip.text : "Bác đã sinh hoạt được hai mươi phút rồi. Mời bác nhìn ra xa hai mươi giây và uống ngụm nước ấm nhé.",
          { clipId: "nhac-nghi-mat", announceToast: true }
        );
      });
    }
    if (state.settings && state.settings.voiceMode === "recorded") {
      const clip = D.VOICE_CLIPS && D.VOICE_CLIPS["nhac-nghi-mat"];
      if (clip) speak(clip.text, { clipId: "nhac-nghi-mat" });
    }
    document.getElementById("btn-ack-eyecare").addEventListener("click", () => {
      stopSpeaking();
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
    if (sessionSeconds % 60 === 0 && ensureDailyRollover(state)) {
      saveState();
      updateGlobalChrome();
      if (state.route === "home") renderHome();
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
          pkt.ritualKind || (pkt.prayerText ? "wish_plaque" : "bell"),
          pkt.cushionIdx
        );
        if (pkt.prayerText) {
          refreshZenPrayersHostIfActive();
        }
      }
    });

    const isUserTypingOrInDialog = () => {
      const actTag = (document.activeElement && document.activeElement.tagName) || "";
      return (
        actTag === "INPUT" ||
        actTag === "TEXTAREA" ||
        actTag === "SELECT" ||
        Boolean(els.dialog && els.dialog.open)
      );
    };

    RT.on("telemetry", () => {
      if (state.route === "privacy" && !isUserTypingOrInDialog()) {
        renderPrivacyAndMetrics();
      }
    });

    RT.on("memberLogs", () => {
      if (state.route === "privacy" && !isUserTypingOrInDialog()) {
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

    RT.on("news", () => {
      if (!RT || typeof RT.getApprovedArticles !== "function") return;
      const remoteArts = RT.getApprovedArticles() || [];
      if (!remoteArts.length || !state.newspaper || !Array.isArray(state.newspaper.articles)) return;
      const existingIds = new Set(state.newspaper.articles.map((a) => a.id));
      let changed = false;
      remoteArts.forEach((ra) => {
        if (ra && ra.id && !existingIds.has(ra.id)) {
          state.newspaper.articles.unshift(ra);
          existingIds.add(ra.id);
          changed = true;
        }
      });
      if (changed) {
        saveState();
        if (state.route === "newspaper" && !isUserTypingOrInDialog()) {
          renderNewspaper();
        }
      }
    });

    RT.on("phonetics", () => {
      if (!RT || typeof RT.getSharedPhonetics !== "function" || !Array.isArray(state.phoneticDict)) return;
      const remotePh = RT.getSharedPhonetics() || [];
      let changed = false;
      remotePh.forEach((rp) => {
        if (!rp || typeof rp.wrong !== "string" || typeof rp.right !== "string") return;
        const w = rp.wrong.replace(/[<>]/g, "").trim();
        const r = rp.right.replace(/[<>]/g, "").trim();
        if (!w || !r || w.length > 40 || r.length > 60) return;
        if (isUnsafeScamOrPiiText(w) || isUnsafeScamOrPiiText(r)) return;
        if (!state.phoneticDict.some((d) => d.wrong === w) && state.phoneticDict.length < 180) {
          state.phoneticDict.push({
            wrong: w,
            right: r,
            hits: Math.max(1, Math.min(9999, Number(rp.hits) || 1)),
            learnedBy: String(rp.learnedBy || "Cộng đồng").replace(/[<>]/g, "").slice(0, 32)
          });
          changed = true;
        }
      });
      if (changed) saveState();
    });

    let onlineDebounceId = null;
    RT.on("online", () => {
      updateGlobalChrome();
      clearTimeout(onlineDebounceId);
      onlineDebounceId = setTimeout(() => {
        if (state.route === "zen" && window.TempleScene3D && typeof window.TempleScene3D.updateConfig === "function") {
          window.TempleScene3D.updateConfig({ attendees: buildTempleTenCushionAttendees() });
        }
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
        refreshOaqTabIfActive();
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
    trackTelemetryDirect("font_toggle", state.route, state.settings.xlFont ? "enable_xl_24px" : "default_20px", {
      xlFont: state.settings.xlFont
    });
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
    trackTelemetryDirect("tts_read", state.route, `read_${state.route}`, {});
    speak(buildCurrentScreenSpeech(), { announceToast: true, screenRead: true });
  });

  if (els.simRender) {
    els.simRender.addEventListener("click", () => {
      state.settings.autoFallbacked = false;
      state.settings.preferredRender = "2.5d";
      saveState();
      updateGlobalChrome();
      showToast("Đang chạy chuẩn Đồ họa: Full 2.5D (TLBB) sắc nét, nhẹ máy.");
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

  document.querySelectorAll("[data-bnav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.bnav;
      if (!target) return;
      if (target === "games") {
        if (state.route === "xiangqi") return;
        if (state.xiangqi && state.xiangqi.inProgress && state.xiangqi.mode !== "puzzle") {
          activeGameTab = "cotuong";
        }
      }
      navigate(target);
    });
  });

  let pendingUnloadClearTimerId = null;
  function markPendingReloadForfeitIfActive() {
    const active = getActiveForfeitableMatch();
    if (!active || !isCurrentlyInsideMatchContext(active)) return null;
    if (state[active.kind]) {
      state[active.kind].forfeitedPendingReload = true;
      saveState();
    }
    return active;
  }

  window.addEventListener("beforeunload", (e) => {
    const active = markPendingReloadForfeitIfActive();
    if (!active) return;
    if (pendingUnloadClearTimerId) clearTimeout(pendingUnloadClearTimerId);
    pendingUnloadClearTimerId = setTimeout(() => {
      if (state.oaq) state.oaq.forfeitedPendingReload = false;
      if (state.xiangqi) state.xiangqi.forfeitedPendingReload = false;
      saveState();
    }, 1500);
    e.preventDefault();
    e.returnValue = "";
  });

  window.addEventListener("pagehide", () => {
    markPendingReloadForfeitIfActive();
  });

  window.addEventListener("popstate", () => {
    const active = getActiveForfeitableMatch();
    if (!active) {
      matchHistoryGuardArmed = false;
      return;
    }
    matchHistoryGuardArmed = false;
    armBrowserBackMatchGuard(active.kind);
    confirmMatchExitOrStay(() => {
      matchHistoryGuardArmed = false;
      executeNavigate("home");
    }, "bấm nút Quay lại trên trình duyệt");
  });

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
  saveState();
  if (pendingReloadForfeitNotice) {
    showToast(pendingReloadForfeitNotice);
    pendingReloadForfeitNotice = "";
  }
})();
