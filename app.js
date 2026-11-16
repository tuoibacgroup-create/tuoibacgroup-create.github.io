(function () {
  const STORAGE_KEY = "tuoi_bac_sim_v2";
  const D = window.TuoiBacData;

  function createDefaultState() {
    return {
      route: "home",
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
        xu: 35,
        flowersLeft: 3,
        checkedInToday: false,
        mood: "Khỏe khoắn",
        streakDays: 6,
        unlockedOutfits: ["ao-ba-ba", "ao-dai-xanh"],
        unlockedItems: ["am-tu-sa"],
        unlockedAccessories: ["none", "glasses"],
        unlockedTitles: ["Thành viên Chăm Điểm Danh"],
        daysHistory: [true, true, true, true, true, true, false],
        habits: ["uong-tra", "doc-bao", "co-tuong"]
      },
      settings: {
        xlFont: false,
        preferredRender: "3d",
        autoFallbacked: false
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
        activeNewspaperRef: null
      },
      newspaper: {
        articles: D.MORNING_ARTICLES.map((a) => Object.assign({}, a)),
        drafts: D.RSS_DRAFTS.map((r) => Object.assign({}, r)),
        adminOpen: false
      },
      quiz: {
        idx: 0,
        score: 0,
        selectedOpt: null,
        finished: false,
        timeLeft: 25
      },
      oaq: {
        // 0..4: Player bottom (left->right), 5: Quan phải, 6..10: AI top (right->left), 11: Quan trái
        cells: [5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5, 10],
        scoreP: 0,
        scoreAI: 0,
        turn: "player",
        selectedCell: null,
        mode: "ai",
        statusText: "Chọn một ô của bác (hàng dưới) để rải quân.",
        zaloInviteUrl: ""
      },
      xiangqi: {
        step: 0,
        solved: false,
        status: "Đỏ đi tiên: Hãy chọn quân Xe Đỏ để chiếu tướng ở nước 1."
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
        incenseLit: false,
        lanternsReleased: 18
      },
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
  let activeLeaderTab = "Tỉnh";
  let activeRankProvinceFilter = "all";

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
    stripTimer: document.getElementById("strip-timer"),
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
    simEye: document.getElementById("sim-trigger-eyecare"),
    simFamily: document.getElementById("sim-open-family"),
    simReset: document.getElementById("sim-reset-demo")
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const def = createDefaultState();
      const merged = Object.assign({}, def, parsed, {
        user: Object.assign({}, def.user, parsed.user || {}),
        settings: Object.assign({}, def.settings, parsed.settings || {}),
        teaRoom: Object.assign({}, def.teaRoom, parsed.teaRoom || {}),
        newspaper: Object.assign({}, def.newspaper, parsed.newspaper || {}),
        oaq: Object.assign({}, def.oaq, parsed.oaq || {}),
        watch: Object.assign({}, def.watch, parsed.watch || {}),
        zen: Object.assign({}, def.zen, parsed.zen || {}),
        health: Object.assign({}, def.health, parsed.health || {})
      });
      if (!Array.isArray(merged.user.habits)) {
        merged.user.habits = def.user.habits;
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

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  }

  function updateGlobalChrome() {
    document.body.classList.toggle("xl-font", state.settings.xlFont);
    els.fontLabel.textContent = state.settings.xlFont ? "Chữ vừa" : "Chữ to";

    const prov = getProvince(state.user.provinceId);
    const baseInitial = (state.user.baseName || state.user.name || "A").trim().charAt(0).toUpperCase();
    els.stripAvatar.textContent = baseInitial;
    els.stripName.textContent = `${state.user.name} · ${getUserAge()}t`;
    els.stripProvince.textContent = prov.short;
    els.stripXu.textContent = String(state.user.xu);
    els.topbarSub.textContent = state.user.checkedInToday
      ? `Đã điểm danh (${state.user.streakDays} ngày)`
      : "Chưa điểm danh sáng nay";

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
    state.route = route;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function addXu(amount, reason) {
    state.user.xu += amount;
    saveState();
    updateGlobalChrome();
    if (reason) showToast(`+${amount} Xu: ${reason}`);
  }

  // ==================== HOME VIEW ====================
  function renderHome() {
    const prov = getProvince(state.user.provinceId);
    const pron = getUserPronoun();
    const hon = getUserHonorific();
    const age = getUserAge();
    const baseName = state.user.baseName || state.user.name.replace(/^(Anh|Chị|Bác)\s+/i, "");

    els.main.innerHTML = `
      <section class="section-block">
        <h1>Chào ${escHtml(state.user.name)} · ${age} tuổi</h1>
        <p class="lead-copy">Mời ${pron} chọn một việc muốn làm sáng nay. Không cần gõ phím nhiều, chạm nút lớn để bắt đầu.</p>

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
              <small>${getCurrentRoom().tables.length} bàn đang mở · Gợi ý ghép bàn theo tuổi & sở thích của ${pron}</small>
            </span>
          </button>

          <button type="button" class="home-main-btn" data-go="newspaper">
            <span class="home-main-icon">${ico("paper", "ico-lg")}</span>
            <span class="home-main-text">
              <strong>3. Đọc Tờ Báo Sáng</strong>
              <small>${state.newspaper.articles.length} tin chọn lọc dễ đọc, có giọng đọc & đem ra bàn trà</small>
            </span>
          </button>
        </div>
      </section>

      <section class="section-block">
        <h2>Khu sinh hoạt & Trò chơi (Bản mô phỏng đầy đủ)</h2>
        <div class="module-grid">
          <button type="button" class="module-tile" data-go="quiz">
            ${ico("quiz")}
            <strong>Đố vui hôm nay</strong>
            <span class="sub">5 câu mỗi ngày, không phạt người chậm</span>
          </button>

          <button type="button" class="module-tile" data-go="games">
            ${ico("board")}
            <strong>Ô ăn quan & Cờ tướng</strong>
            <span class="sub">Đấu máy hoặc gửi ván treo qua Zalo</span>
          </button>

          <button type="button" class="module-tile" data-go="poetry">
            ${ico("poem")}
            <strong>Ngâm thơ & Tặng hoa</strong>
            <span class="sub">Còn ${state.user.flowersLeft} bông hoa hôm nay</span>
          </button>

          <button type="button" class="module-tile" data-go="watch">
            ${ico("tv")}
            <strong>Phòng xem chung</strong>
            <span class="sub">Dưỡng sinh 8h & Hài 20h có phụ đề</span>
          </button>

          <button type="button" class="module-tile" data-go="zen">
            ${ico("lotus")}
            <strong>Góc tĩnh tâm</strong>
            <span class="sub">Thỉnh chuông, thả hoa đăng miễn phí</span>
          </button>

          <button type="button" class="module-tile" data-go="leaderboard">
            ${ico("trophy")}
            <strong>Bảng xếp hạng & Danh hiệu</strong>
            <span class="sub">Theo tỉnh, người mới & tủ kỷ niệm</span>
          </button>

          <button type="button" class="module-tile" data-go="health">
            ${ico("heart")}
            <strong>Trợ lý sức khỏe</strong>
            <span class="sub">Nhắc uống thuốc, đo huyết áp & Gọi 115</span>
          </button>

          <button type="button" class="module-tile" data-go="family">
            ${ico("family")}
            <strong>Góc Con Cái (30–50 tuổi)</strong>
            <span class="sub">Xem lịch điểm danh & tạo link cho bố mẹ</span>
          </button>
        </div>
      </section>
    `;

    els.main.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.go));
    });

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
        copyTextSafe(urlIn.value, "Đã sao chép đường dẫn!");
      });
    }
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener("click", () => {
        copyTextSafe(urlIn ? urlIn.value : opts.shareUrl, "Đã sao chép đường dẫn để gửi bạn bè!");
      });
    }
    if (copyPostBtn) {
      copyPostBtn.addEventListener("click", () => {
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
    const totalLamps = D.PROVINCES.reduce((sum, p) => sum + p.lamps + (p.id === myProv.id && state.user.checkedInToday ? 1 : 0), 0);

    const mapDots = D.PROVINCES.map((p) => {
      const isMe = p.id === myProv.id;
      const r = isMe ? 8 : Math.min(6.5, 3 + p.lamps / 320);
      const fill = isMe ? (state.user.checkedInToday ? "#FFD166" : "#FF6B57") : "#F5B841";
      return `
        <g class="map-dot" data-prov="${p.id}" style="cursor:pointer">
          ${isMe ? `<circle cx="${p.x}" cy="${p.y}" r="14" fill="rgba(255, 209, 102, 0.25)" />` : ""}
          <circle cx="${p.x}" cy="${p.y}" r="${r.toFixed(1)}" fill="${fill}" stroke="#0D1520" stroke-width="1" />
          ${(p.island || p.diaspora || isMe) ? `<text x="${p.x}" y="${p.y - 11}" text-anchor="middle" fill="#F7F1E3" font-size="11" font-weight="700">${escHtml(p.short)}</text>` : ""}
        </g>
      `;
    }).join("");

    const sortedProvinces = D.PROVINCES.slice()
      .sort((a, b) => b.lamps - a.lamps)
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
            <strong>Đã gửi Web Push miễn phí tới Anh Hùng (Con trai)</strong>
            <p style="font-size:0.86rem;">"Hôm nay ${escHtml(state.user.name)} đã ghé quán trà và chọn trạng thái: ${escHtml(state.user.mood)}."</p>
            <button type="button" class="btn-secondary" id="btn-share-zalo-card">
              ${ico("share")}
              <span>Chia sẻ thiệp chúc qua Zalo (1 chạm)</span>
            </button>
          </div>
        ` : ""}
      </div>

      <div class="map-card">
        <div class="map-stats-row">
          <div>
            <small style="color:#D8CCB8;">Đèn sáng hôm nay</small>
            <div><strong class="num">${totalLamps.toLocaleString("vi-VN")} bác</strong></div>
          </div>
          <div style="text-align:right;">
            <small style="color:#D8CCB8;">${escHtml(myProv.short)}</small>
            <div><strong class="num">${(myProv.lamps + (state.user.checkedInToday ? 1 : 0)).toLocaleString("vi-VN")} lượt</strong></div>
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
              <span class="badge-tag amber num">${p.lamps.toLocaleString("vi-VN")} đèn</span>
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
        addXu(5, "Điểm danh sáng bình an");
      } else {
        showToast(`Đã thắp sáng lại lời chúc tại ${myProv.short}!`);
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
    const room = getCurrentRoom();
    return room.tables[state.teaRoom.tableIdx] || room.tables[0];
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

  function joinTable(idx) {
    const room = getCurrentRoom();
    const safeIdx = Math.max(0, Math.min(room.tables.length - 1, idx));
    const table = room.tables[safeIdx];
    state.teaRoom.tableIdx = safeIdx;
    state.teaRoom.subView = "table";
    state.teaRoom.log = table.initialLog.slice();
    pendingQueue = [];
    saveState();
    showToast(`Đã ngồi vào ${table.name} (${room.shortName}).`);
    renderTeaRoom();
  }

  function matchThreeReplies(latestText) {
    const low = String(latestText || "").toLowerCase();
    const userProv = getProvince(state.user.provinceId).short;
    const table = getCurrentTable();
    const lastLog = state.teaRoom.log[state.teaRoom.log.length - 1];
    const speakerName = lastLog ? lastLog.speaker.split("(")[0].split("·")[0].trim() : table.members[0].name;

    let chosen = state.replyTemplates.find((group) =>
      group.keywords.some((kw) => low.includes(kw.toLowerCase()))
    );
    if (!chosen) {
      chosen = state.replyTemplates[state.replyTemplates.length - 1];
    }

    return chosen.replies.slice(0, 3).map((tpl) =>
      tpl.replace(/\{ten\}/g, speakerName).replace(/\{tinh\}/g, userProv)
    );
  }

  function pushTableMessage(speaker, text, seatIdx) {
    const trimmed = String(text || "").trim();
    const safeText = trimmed.length > 120 ? trimmed.slice(0, 117).trim() + "..." : trimmed;
    pendingQueue.push({ speaker, text: safeText, seatIdx });
    processQueueStep();
  }

  function processQueueStep() {
    if (teaQueueTimerId || pendingQueue.length === 0) return;
    const nextItem = pendingQueue.shift();
    state.teaRoom.log.push({ speaker: nextItem.speaker, text: nextItem.text });
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

  function sendUserTeaMessage(text) {
    const provShort = getProvince(state.user.provinceId).short;
    const table = getCurrentTable();
    const userSeatIdx = Math.min(4, table.members.length);
    state.teaRoom.lastSentAt = Date.now();
    saveState();

    pushTableMessage(`${state.user.name} · ${getUserAge()} tuổi (${provShort})`, text, userSeatIdx);

    // Trigger natural peer response via Pacing Queue (Nhịp nhấp trà 5s)
    const peerIdx = Math.floor(Math.random() * table.members.length);
    const peer = table.members[peerIdx];
    const replies = matchThreeReplies(text);
    const peerReply = replies[0].replace(new RegExp(peer.name, "g"), state.user.name);
    setTimeout(() => {
      pushTableMessage(`${peer.name} · ${peer.age} tuổi (${peer.province})`, peerReply, peerIdx);
    }, 4500);

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
      const btns = els.main.querySelectorAll(".reply-btn");
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
      prevEl.textContent = prev ? `${prev.speaker}: "${prev.text}"` : "";
      prevEl.hidden = !prev;
    }
    if (currEl && curr) {
      currEl.innerHTML = `<span style="color:var(--accent-terracotta);">${escHtml(curr.speaker)}:</span> "${escHtml(curr.text)}"`;
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
    const tbl = room.tables[tableIdx];
    const userHabits = state.user.habits || [];
    const sameProv = member.provinceId === state.user.provinceId;
    openDialog(
      `Hồ sơ: ${member.name}`,
      `
      <div class="surface-panel warm">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong>${escHtml(member.name)} (${member.age} tuổi)</strong>
          <span class="badge-tag ${sameProv ? "jade" : ""}">${escHtml(member.province)}</span>
        </div>
        <p>${escHtml(member.bio)}</p>
        <div class="member-pill-list">
          ${(member.habits || [])
            .map((h) => `<span class="badge-tag ${userHabits.includes(h) ? "jade" : ""}">${escHtml(getHabitLabel(h))}</span>`)
            .join("")}
        </div>
      </div>
      <p style="font-size:0.88rem;">Đang ngồi tại: <strong>${escHtml(tbl.name)}</strong> (${escHtml(room.shortName)})</p>
      <button type="button" class="btn-primary" id="btn-join-senior-table">
        ${ico("tea")}
        <span>Ngồi cùng bàn với ${escHtml(member.name)}</span>
      </button>
      `
    );
    document.getElementById("btn-join-senior-table").addEventListener("click", () => {
      closeDialog();
      joinTable(tableIdx);
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

    window.TeaRoomScene.mount(
      stageEl,
      canvasEl,
      tagsEl,
      {
        viewMode,
        preferredMode: state.settings.preferredRender,
        roomTheme: room.theme,
        tables: room.tables,
        recommendedIdx,
        table,
        userName: state.user.name,
        userAge: getUserAge(),
        userGender: state.user.honorific === "Chị" ? "female" : "male",
        userProvince: getProvince(state.user.provinceId).short,
        userOutfitColor: outfit.color,
        userItem: state.user.itemId,
        userAccessory: state.user.accessoryId || "none"
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
      renderTeaRoomLobby(room);
    }
  }

  function renderTeaRoomLobby(room) {
    const scoredTables = room.tables.map((t, idx) => ({
      idx,
      table: t,
      match: scoreTableMatch(t)
    }));
    const best = scoredTables.slice().sort((a, b) => b.match.score - a.match.score)[0];
    const totalSeated = room.tables.reduce((sum, t) => sum + t.members.length, 0);

    els.main.innerHTML = `
      ${renderRoomSwitcherStrip()}

      <div>
        <h1>${escHtml(room.name)}</h1>
        <p class="lead-copy">${escHtml(room.description)} · Hiện có <strong class="num">${totalSeated}</strong> anh chị đang ngồi tại <strong class="num">${room.tables.length}</strong> bàn.</p>
      </div>

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

      <!-- Toàn cảnh 3D / 2.5D 6 bàn trong phòng -->
      <div class="tearoom-controls-row">
        <span class="stage-badge" id="render-mode-badge">${state.settings.preferredRender === "3d" ? "Toàn cảnh 3D" : "Toàn cảnh 2.5D"}</span>
        <button type="button" class="stage-badge-btn" id="btn-toggle-render-local">Đổi 3D / 2.5D</button>
      </div>
      <div class="tearoom-stage" id="tearoom-stage">
        <canvas class="tearoom-canvas" id="tearoom-canvas"></canvas>
        <div class="avatar-tags-layer" id="avatar-tags-layer"></div>
      </div>

      <!-- Danh sách 6 bàn & người đang ngồi -->
      <div class="section-block">
        <h2>Trong phòng đang có ai? (${room.tables.length} bàn)</h2>
        ${scoredTables
          .map(
            (item) => `
          <article class="table-card ${item.idx === best.idx ? "recommended" : ""}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <h3>${escHtml(item.table.name)}</h3>
                <small style="color:var(--ink-secondary);">${escHtml(item.table.topic)}</small>
              </div>
              <span class="badge-tag ${item.idx === best.idx ? "amber" : "jade"} num">${item.match.percent}% hợp</span>
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
                      <span class="member-chip-prov">${escHtml(m.province)}</span>
                    </span>
                    <small>${escHtml((m.habits || []).slice(0, 2).map(getHabitLabel).join(" · "))}</small>
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
        const member = room.tables[tIdx].members[mIdx];
        if (member) openSeniorProfileDialog(member, tIdx, room);
      });
    });
  }

  function renderTeaRoomTableView(room) {
    const table = getCurrentTable();
    const log = state.teaRoom.log;
    const prev = log.length >= 2 ? log[log.length - 2] : null;
    const curr = log[log.length - 1];
    const suggestions = matchThreeReplies(curr ? curr.text : "");
    const coolLeft = getCooldownRemaining();
    const userSeatIdx = Math.min(4, table.members.length);

    els.main.innerHTML = `
      ${renderRoomSwitcherStrip()}

      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <h1>${escHtml(table.name)}</h1>
          <small style="color:var(--ink-secondary);">${escHtml(room.name)} · ${escHtml(table.topic)}</small>
        </div>
        <button type="button" class="btn-mini" id="btn-back-lobby">Xem toàn phòng</button>
      </div>

      <!-- Người đang ngồi cùng bàn -->
      <div class="surface-panel" style="padding:12px;">
        <div class="companion-head">
          <strong>Đang ngồi cùng bàn với ${getUserPronoun()} (${table.members.length + 1}/5 chỗ)</strong>
          <span>Chạm để xem hồ sơ</span>
        </div>
        <div class="member-pill-list">
          ${table.members
            .map(
              (m, mIdx) => `
            <button type="button" class="member-chip-btn" data-tidx="${state.teaRoom.tableIdx}" data-midx="${mIdx}">
              ${renderSeniorAvatarSvg(m)}
              <span class="member-chip-meta">
                <span class="member-chip-top">
                  <strong>${escHtml(m.name)} <span class="member-age-inline">· ${m.age} tuổi</span></strong>
                  <span class="member-chip-prov">${escHtml(m.province)}</span>
                </span>
                <small>${escHtml((m.habits || []).slice(0, 2).map(getHabitLabel).join(" · "))}</small>
              </span>
            </button>
          `
            )
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

      <!-- Fixed 2-line Tea Table Board -->
      <div class="tea-board" aria-live="polite">
        <div class="tea-board-head">
          <strong>Bảng lời bàn trà (Không tự biến mất)</strong>
          <span>Độ dài tối đa 25 chữ</span>
        </div>
        <div class="tea-board-lines">
          <div class="tea-line-prev" id="tea-line-prev" ${prev ? "" : "hidden"}>${prev ? `${escHtml(prev.speaker)}: "${escHtml(prev.text)}"` : ""}</div>
          <div class="tea-line-curr" id="tea-line-curr">${curr ? `<span style="color:var(--accent-terracotta);">${escHtml(curr.speaker)}:</span> "${escHtml(curr.text)}"` : ""}</div>
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

      <!-- Quick Replies + Simple Text + 2-tap Inline Voice -->
      <div class="surface-panel">
        <h3>Chọn nhanh câu trả lời:</h3>
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
    mountRoomSceneView("table", room, table, 0);

    if (coolLeft > 0) startCooldownTicker();

    document.getElementById("btn-back-lobby").addEventListener("click", () => {
      state.teaRoom.subView = "lobby";
      saveState();
      renderTeaRoom();
    });

    els.main.querySelectorAll(".member-chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = table.members[Number(btn.dataset.midx)];
        if (m) openSeniorProfileDialog(m, state.teaRoom.tableIdx, room);
      });
    });

    document.getElementById("btn-snap-tea").addEventListener("click", () => {
      const currLine = state.teaRoom.log[state.teaRoom.log.length - 1];
      const baseShare = getPublicBaseUrl();
      const shareUrl = `${baseShare}?phong=${encodeURIComponent(room.id)}&ban=${state.teaRoom.tableIdx + 1}`;
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
      sendUserTeaMessage("Mời cả bàn dùng thêm chén trà sen nóng cho ấm bụng nhé!");
    });

    document.getElementById("btn-snack-tea").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) return;
      window.TeaRoomScene.setSeatBadge(userSeatIdx, "Mời bánh");
      sendUserTeaMessage("Tôi mời các bác đĩa hạt dưa và miếng bánh đậu xanh Hải Dương.");
    });

    document.getElementById("btn-poem-tea").addEventListener("click", () => {
      if (getCooldownRemaining() > 0) return;
      sendUserTeaMessage("Góp vui với bàn câu ca dao: Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây.");
    });

    els.main.querySelectorAll(".reply-btn").forEach((btn) => {
      btn.addEventListener("click", () => sendUserTeaMessage(btn.dataset.reply));
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
        commitVoiceDictionaryLearning(checked);
        sendUserTeaMessage(checked.aiPolished);
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
      commitVoiceDictionaryLearning(pendingVoiceDraft);
      pendingVoiceDraft = null;
      box.hidden = true;
      box.innerHTML = "";
      sendUserTeaMessage(editedText);
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

  // ==================== MODULE 3: VINTAGE NEWSPAPER & RSS ADMIN ====================
  function renderNewspaper() {
    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <h1>Tờ Báo Sáng</h1>
        <button type="button" class="btn-mini" id="btn-toggle-rss-admin">${state.newspaper.adminOpen ? "Đóng góc Admin RSS" : `Duyệt RSS (${state.newspaper.drafts.length})`}</button>
      </div>
      <p class="lead-copy">Báo giấy xưa dễ đọc chữ to. Chạm "Đem ra bàn trà" để mời các bác cùng bàn thảo luận.</p>

      ${
        state.newspaper.adminOpen
          ? `
        <div class="surface-panel warm">
          <h3>Góc Admin duyệt RSS 1 chạm (Hậu trường buổi sáng)</h3>
          <p style="font-size:0.84rem;">Hệ thống tự kéo RSS báo chính thống, lọc tin tích cực lưu nháp. Admin chỉ bấm duyệt 1 chạm để đăng lên Tờ Báo Sáng:</p>
          ${
            state.newspaper.drafts.length === 0
              ? `<p style="font-size:0.86rem; font-weight:700;">Đã duyệt hết bản nháp RSS sáng nay.</p>`
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
            <span>Số ra sáng hôm nay</span>
            <span>Bản chữ to rõ nét · Nguồn chính thống</span>
          </div>
        </div>

        ${state.newspaper.articles
          .map(
            (art, idx) => `
          <section class="news-article">
            <div><span class="badge-tag">${escHtml(art.tag)}</span></div>
            <h3>${escHtml(art.title)}</h3>
            <div class="news-source">${escHtml(art.source)}</div>
            <p class="news-body">${escHtml(art.body)}</p>
            <div class="btn-row">
              <button type="button" class="btn-secondary read-news-btn" data-idx="${idx}">${ico("speaker")}<span>Nghe đọc báo</span></button>
              <button type="button" class="btn-primary bring-tea-btn" data-idx="${idx}">${ico("tea")}<span>Đem ra bàn trà</span></button>
            </div>
          </section>
        `
          )
          .join("")}
      </article>
    `;

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
          state.newspaper.articles.unshift(approved);
          saveState();
          showToast("Đã duyệt tin RSS lên trang nhất Tờ Báo Sáng!");
          renderNewspaper();
        }
      });
    });

    els.main.querySelectorAll(".read-news-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = state.newspaper.articles[Number(btn.dataset.idx)];
        speak(`${art.title}. ${art.body}`);
      });
    });

    els.main.querySelectorAll(".bring-tea-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = state.newspaper.articles[Number(btn.dataset.idx)];
        const provShort = getProvince(state.user.provinceId).short;
        const table = getCurrentTable();
        state.teaRoom.subView = "table";
        pushTableMessage(
          `${state.user.name} (${provShort})`,
          `Mời cả bàn đọc tin báo sáng nay: "${art.title}"`,
          Math.min(4, table.members.length)
        );
        navigate("tearoom");
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
      <h1>Trò chơi dân gian</h1>
      <div class="tab-bar">
        <button type="button" class="tab-btn ${activeGameTab === "oaq" ? "active" : ""}" id="tab-oaq">Ô ăn quan</button>
        <button type="button" class="tab-btn ${activeGameTab === "cotuong" ? "active" : ""}" id="tab-cotuong">Cờ tướng giải thế</button>
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

  function renderOaqTab(container) {
    const o = state.oaq;
    const isGameOver = o.cells[5] === 0 && o.cells[11] === 0;
    const topCells = [10, 9, 8, 7, 6]; // Rendered left -> right across top row
    const bottomCells = [0, 1, 2, 3, 4];

    container.innerHTML = `
      <div class="surface-panel">
        <div class="btn-row">
          <button type="button" class="btn-secondary ${o.mode === "ai" ? "is-jade" : ""}" id="oaq-mode-ai" style="${o.mode === "ai" ? "background:var(--accent-jade);color:#fff;" : ""}">Đấu với Máy</button>
          <button type="button" class="btn-secondary" id="oaq-mode-async" style="${o.mode === "async" ? "background:var(--accent-jade);color:#fff;" : ""}">Ván treo (Mời bạn)</button>
        </div>

        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span>${escHtml(state.user.name)}: <span class="num">${o.scoreP}</span> quân</span>
          <span>${o.mode === "ai" ? "Máy (Đối thủ tự động)" : "Anh Minh · 71t (Hải Phòng)"}: <span class="num">${o.scoreAI}</span> quân</span>
        </div>

        <div class="oaq-board" role="group" aria-label="Bàn cờ Ô ăn quan">
          <div class="oaq-quan oaq-quan-left">
            <span class="num">${o.cells[11]}</span>
            <small>Q.Trái</small>
          </div>

          ${topCells
            .map(
              (idx) => `
            <div class="oaq-cell" style="grid-row:1;">
              <span class="num">${o.cells[idx]}</span>
              <small>Ô${idx + 1}</small>
            </div>
          `
            )
            .join("")}

          ${bottomCells
            .map(
              (idx) => `
            <button type="button" class="oaq-cell player-side ${o.selectedCell === idx ? "selected" : ""}" data-cell="${idx}" style="grid-row:2;" ${o.turn !== "player" || o.cells[idx] === 0 || isGameOver ? "disabled" : ""}>
              <span class="num">${o.cells[idx]}</span>
              <small>Ô${idx + 1}</small>
            </button>
          `
            )
            .join("")}

          <div class="oaq-quan oaq-quan-right">
            <span class="num">${o.cells[5]}</span>
            <small>Q.Phải</small>
          </div>
        </div>

        <p style="font-weight:600; color:var(--accent-terracotta);">${isGameOver ? "Ván cờ đã kết thúc — cả hai Quan đều đã ăn hết!" : escHtml(o.statusText)}</p>

        ${
          o.selectedCell !== null && o.turn === "player" && !isGameOver
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
            <strong>Ván treo đang chờ lượt bạn cờ</strong>
            <p style="font-size:0.88rem;">Đã lưu nước đi. Gửi mã QR hoặc tin nhắn nhắc lượt cho Anh Minh:</p>
            ${renderSocialShareKitHtml({
              prefix: "oaq-share",
              copyLinkBtnId: "oaq-copy-zalo",
              shareUrl: o.zaloInviteUrl,
              postText: `${state.user.name} vừa đi 1 nước trong ván Ô ăn quan cùng Anh Minh. Mời bấm vào link này để đi tiếp lượt của mình nhé:\n${o.zaloInviteUrl}`
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
      executeOaqMove(chosen, dir, true);

      if (state.oaq.mode === "async") {
        state.oaq.turn = "ai";
        state.oaq.statusText = `Đã đi xong lượt. Ván treo đang chờ đối thủ phản hồi.`;
        state.oaq.zaloInviteUrl = `${getPublicBaseUrl()}?phong=phong-co&ban=2`;
        saveState();
        addXu(3, "Đi nước cờ ván treo");
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
        state.oaq.turn = "player";
        state.oaq.statusText = "Máy đã đi xong. Đến lượt bác chọn một ô hàng dưới.";
        saveState();
        renderGames();
      }, 900);
    };

    const btnL = document.getElementById("oaq-dir-left");
    const btnR = document.getElementById("oaq-dir-right");
    if (btnL) btnL.addEventListener("click", () => doPlayerDir(-1));
    if (btnR) btnR.addEventListener("click", () => doPlayerDir(1));

    document.getElementById("oaq-mode-ai").addEventListener("click", () => {
      state.oaq.mode = "ai";
      state.oaq.turn = "player";
      state.oaq.statusText = "Đang đấu với Máy (luôn ghi rõ là Máy).";
      saveState();
      renderGames();
    });

    document.getElementById("oaq-mode-async").addEventListener("click", () => {
      state.oaq.mode = "async";
      state.oaq.turn = "player";
      state.oaq.statusText = "Chế độ Ván treo: đi 1 nước rồi gửi nhắc lượt qua Zalo.";
      saveState();
      renderGames();
    });

    if (o.mode === "async" && o.zaloInviteUrl) {
      bindSocialShareKit({
        prefix: "oaq-share",
        copyLinkBtnId: "oaq-copy-zalo",
        shareUrl: o.zaloInviteUrl,
        postText: `${state.user.name} vừa đi 1 nước trong ván Ô ăn quan cùng Anh Minh. Mời bấm vào link này để đi tiếp lượt của mình nhé:\n${o.zaloInviteUrl}`
      });
    }

    document.getElementById("oaq-reset").addEventListener("click", () => {
      state.oaq = Object.assign({}, createDefaultState().oaq, { mode: state.oaq.mode });
      saveState();
      renderGames();
    });
  }

  function renderXiangqiTab(container) {
    const x = state.xiangqi;
    // Puzzle: Tướng Đen ở (cột 5, hàng 1), Sĩ Đen (4,1), Xe Đỏ ở (4,3), Pháo Đỏ ở (5,4), Tướng Đỏ ở (5,9)
    // Nước 1: Xe Đỏ tiến lên (6,1) hoặc (4,2)? Đơn giản cho bác: Xe Đỏ ăn Sĩ (4,1) chiếu Tướng! Tướng Đen buộc bình sang (4,1) ăn Xe -> Nước 2: Pháo Đỏ chiếu bí hoặc Xe/Mã chiếu.
    // Chuẩn hơn: Tướng Đen (5,0). Xe Đỏ ở (3,2). Pháo Đỏ ở (5,4). Chốt Đỏ ở (4,1).
    // Nút bấm rõ ràng cho 2 bước chiếu hết:
    const step = x.step;
    const pieces =
      step === 0
        ? [
            { x: 180, y: 40, label: "Tướng", side: "black" },
            { x: 140, y: 40, label: "Sĩ", side: "black" },
            { x: 140, y: 120, label: "Xe", side: "red", id: "xe" },
            { x: 180, y: 200, label: "Pháo", side: "red", id: "phao" },
            { x: 140, y: 80, label: "Tốt", side: "red", id: "tot" }
          ]
        : step === 1
        ? [
            { x: 140, y: 40, label: "Tướng", side: "black" },
            { x: 180, y: 200, label: "Pháo", side: "red", id: "phao" },
            { x: 140, y: 80, label: "Tốt", side: "red", id: "tot" }
          ]
        : [
            { x: 140, y: 40, label: "Tướng", side: "black" },
            { x: 140, y: 160, label: "Pháo", side: "red", id: "phao" },
            { x: 140, y: 80, label: "Tốt", side: "red", id: "tot" }
          ];

    container.innerHTML = `
      <div class="surface-panel">
        <h2>Thế cờ: Sát chiêu Tốt Pháo (2 nước)</h2>
        <p style="font-size:0.86rem;">Đỏ đi tiên. Đang có 14 bác ngồi xem và cổ vũ thế cờ này.</p>

        <svg viewBox="0 0 360 240" style="width:100%; background:#F1DCBA; border:2px solid #755333; border-radius:12px;">
          <!-- Grid -->
          ${[40, 80, 120, 160, 200].map((y) => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="#876340" stroke-width="1.5" />`).join("")}
          ${[20, 60, 100, 140, 180, 220, 260, 300, 340].map((xPos) => `<line x1="${xPos}" y1="40" x2="${xPos}" y2="200" stroke="#876340" stroke-width="1.5" />`).join("")}
          <!-- Palace diagonals -->
          <line x1="140" y1="40" x2="220" y2="120" stroke="#876340" stroke-width="1.5" />
          <line x1="220" y1="40" x2="140" y2="120" stroke="#876340" stroke-width="1.5" />
          ${pieces
            .map(
              (p) => `
            <g>
              <circle cx="${p.x}" cy="${p.y}" r="18" fill="#FFF7E6" stroke="${p.side === "red" ? "#B83B2A" : "#231A14"}" stroke-width="3" />
              <text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="${p.side === "red" ? "#B83B2A" : "#231A14"}">${p.label}</text>
            </g>
          `
            )
            .join("")}
        </svg>

        <p style="font-weight:700; color:${x.solved ? "var(--accent-jade)" : "var(--accent-terracotta)"};">${escHtml(x.status)}</p>

        ${
          !x.solved
            ? `
          <div class="btn-row">
            <button type="button" class="btn-primary" id="xq-move-1">
              ${step === 0 ? "1. Xe Đỏ ăn Sĩ (Chiếu)" : "2. Bình Pháo vào lộ 4 (Chiếu bí)"}
            </button>
            <button type="button" class="btn-secondary" id="xq-hint">Gợi ý nước đi</button>
          </div>
        `
            : `<button type="button" class="btn-primary" id="xq-reset">Giải lại thế cờ</button>`
        }
      </div>
    `;

    const moveBtn = document.getElementById("xq-move-1");
    if (moveBtn) {
      moveBtn.addEventListener("click", () => {
        if (state.xiangqi.step === 0) {
          state.xiangqi.step = 1;
          state.xiangqi.status = "Tuyệt! Tướng Đen buộc phải ăn Xe sang lộ 4. Mời bác đi nước 2 chiếu hết!";
        } else {
          state.xiangqi.step = 2;
          state.xiangqi.solved = true;
          state.xiangqi.status = "Chiếu bí! Pháo Đỏ có Tốt Đỏ làm ngòi, Tướng Đen hết đường chạy!";
          addXu(6, "Giải xong thế cờ tướng");
        }
        saveState();
        renderGames();
      });
    }

    const hintBtn = document.getElementById("xq-hint");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        showToast(state.xiangqi.step === 0 ? "Dùng Xe Đỏ chém Sĩ để kéo Tướng Đen sang lộ 4." : "Đưa Pháo Đỏ sang cột của Tướng Đen, mượn Tốt làm ngòi!");
      });
    }

    const resetBtn = document.getElementById("xq-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.xiangqi = { step: 0, solved: false, status: "Đỏ đi tiên: Hãy chọn quân Xe Đỏ để chiếu tướng ở nước 1." };
        saveState();
        renderGames();
      });
    }
  }

  // ==================== MODULE 6: POETRY & FLOWERS ====================
  function renderPoetry() {
    els.main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h1>Ngâm thơ & Tặng hoa</h1>
        <span class="badge-tag amber num">Còn ${state.user.flowersLeft}/3 hoa hôm nay</span>
      </div>
      <p class="lead-copy">Mỗi ngày bác có 3 bông hoa quý để tặng người ngâm thơ hay. Cuối tuần bình chọn danh hiệu Nhà thơ lãng mạn.</p>

      <div class="surface-panel">
        <h3>Góp một đôi lục bát</h3>
        <input type="text" class="input-lg" id="poem-title-in" placeholder="Tên bài thơ (ví dụ: Nhớ quê)" />
        <textarea class="input-lg" id="poem-body-in" rows="2" style="min-height:78px;" placeholder="Gõ hoặc bấm mic đọc 2 câu thơ..."></textarea>
        <button type="button" class="btn-jade" id="btn-post-poem">${ico("poem")}<span>Đăng bài thơ lên sảnh (+4 Xu)</span></button>
      </div>

      ${state.poems
        .map(
          (p, idx) => `
        <article class="surface-panel">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h3>${escHtml(p.title)}</h3>
              <small style="color:var(--ink-secondary);">${escHtml(p.reciter)} · ${escHtml(p.author)}</small>
            </div>
            <span class="badge-tag jade num">${p.flowers} hoa</span>
          </div>
          <div style="font-family:var(--font-serif); line-height:1.65; background:var(--bg-paper); padding:10px 12px; border-radius:12px; border:1px solid var(--border-subtle);">
            ${p.lines.map((l) => `<div>${escHtml(l)}</div>`).join("")}
          </div>
          <div class="btn-row">
            <button type="button" class="btn-secondary listen-poem-btn" data-idx="${idx}">${ico("speaker")}<span>Nghe ngâm thơ</span></button>
            <button type="button" class="btn-primary gift-flower-btn" data-idx="${idx}" ${state.user.flowersLeft <= 0 ? "disabled" : ""}>${ico("flower")}<span>Tặng 1 bông hoa</span></button>
          </div>
        </article>
      `
        )
        .join("")}
    `;

    document.getElementById("btn-post-poem").addEventListener("click", () => {
      const title = document.getElementById("poem-title-in").value.trim() || "Tâm sự tuổi bạc";
      const body = document.getElementById("poem-body-in").value.trim() || "Chiều nay gió mát bên thềm,\nNgâm câu lục bát êm đềm tuổi xuân.";
      state.poems.unshift({
        id: "p-" + Date.now(),
        author: "Tự sáng tác",
        title,
        lines: body.split("\n"),
        flowers: 1,
        reciter: `${state.user.name} (${getProvince(state.user.provinceId).short})`
      });
      addXu(4, "Đăng bài thơ mới");
      saveState();
      renderPoetry();
    });

    els.main.querySelectorAll(".listen-poem-btn").forEach((b) => {
      b.addEventListener("click", () => {
        const p = state.poems[Number(b.dataset.idx)];
        speak(`${p.title}. ${p.lines.join(", ")}`);
      });
    });

    els.main.querySelectorAll(".gift-flower-btn").forEach((b) => {
      b.addEventListener("click", () => {
        if (state.user.flowersLeft <= 0) return;
        const p = state.poems[Number(b.dataset.idx)];
        p.flowers += 1;
        state.user.flowersLeft -= 1;
        addXu(2, `Tặng hoa cho ${p.reciter}`);
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

  function renderZen() {
    const sp = D.ZEN_SPACES[state.zen.spaceIdx];
    els.main.innerHTML = `
      <h1>Góc tĩnh tâm</h1>
      <p class="lead-copy">Hoàn toàn miễn phí, không thu tiền cúng dường. Tôn trọng đa tín ngưỡng với nguồn nội dung từ cơ sở đối tác thật.</p>

      <div class="tab-bar">
        ${D.ZEN_SPACES.map(
          (s, i) => `<button type="button" class="tab-btn ${state.zen.spaceIdx === i ? "active" : ""}" data-zen="${i}">${escHtml(s.name)}</button>`
        ).join("")}
      </div>

      <div class="zen-stage">
        <div class="zen-ripple" id="zen-bell-ring">${ico("bell", "ico-lg")}</div>
        <h2 style="color:#F6E3B4;">${escHtml(sp.name)}</h2>
        <small style="color:#C9D6CE;">${escHtml(sp.partner)}</small>
        <p style="font-family:var(--font-serif); font-size:0.95rem; line-height:1.55;">"${escHtml(sp.quote)}"</p>
        <div style="font-size:0.84rem; color:#F6C367;">
          Hôm nay đã có <strong class="num">${state.zen.lanternsReleased}</strong> ngọn hoa đăng cầu bình an
        </div>
      </div>

      <div class="btn-row">
        <button type="button" class="btn-primary" id="btn-ring-bell">${ico("bell")}<span>Thỉnh chuông an yên</span></button>
        <button type="button" class="btn-jade" id="btn-lantern">${ico("lotus")}<span>Thả hoa đăng miễn phí</span></button>
      </div>
      <button type="button" class="btn-secondary" id="btn-zen-listen">${ico("speaker")}<span>Nghe lời dạy bình an hôm nay</span></button>
    `;

    els.main.querySelectorAll("[data-zen]").forEach((b) => {
      b.addEventListener("click", () => {
        state.zen.spaceIdx = Number(b.dataset.zen);
        saveState();
        renderZen();
      });
    });

    document.getElementById("btn-ring-bell").addEventListener("click", () => {
      playTempleBell();
      const ring = document.getElementById("zen-bell-ring");
      if (ring) {
        ring.classList.add("ringing");
        setTimeout(() => ring.classList.remove("ringing"), 700);
      }
      showToast("Tiếng chuông vang nhẹ mang lại phút giây thư thái.");
    });

    document.getElementById("btn-lantern").addEventListener("click", () => {
      state.zen.lanternsReleased += 1;
      saveState();
      showToast("Đã thả hoa đăng cầu bình an cho gia đình (Miễn phí).");
      renderZen();
    });

    document.getElementById("btn-zen-listen").addEventListener("click", () => {
      speak(sp.quote);
    });
  }

  // ==================== MODULE 9: LEADERBOARD & PROFILE ====================
  function renderLeaderboard() {
    const myScore = state.user.xu * 8 + state.user.streakDays * 15;
    const myProv = getProvince(state.user.provinceId).short;
    const rows = D.LEADERBOARD.concat([{ name: state.user.name + " (Bạn)", province: myProv, score: myScore, title: state.user.unlockedTitles[0], tag: "Người mới" }])
      .filter((r) => (activeRankProvinceFilter === "all" ? true : r.province === myProv))
      .sort((a, b) => b.score - a.score);

    els.main.innerHTML = `
      <h1>Bảng xếp hạng & Danh hiệu</h1>
      <p class="lead-copy">Đặt lại hàng tuần để ai cũng có cơ hội. Danh hiệu cũ lưu vào tủ kỷ niệm, không dùng danh hiệu chê bai.</p>

      <div class="tab-bar">
        <button type="button" class="tab-btn ${activeLeaderTab === "Tỉnh" ? "active" : ""}" id="lb-tab-all">Toàn quốc</button>
        <button type="button" class="tab-btn ${activeLeaderTab === "Tủ kỷ niệm" ? "active" : ""}" id="lb-tab-mem">Tủ kỷ niệm</button>
      </div>

      ${
        activeLeaderTab === "Tủ kỷ niệm"
          ? `
        <div class="surface-panel">
          <h3>Tủ kỷ niệm của ${escHtml(state.user.name)}</h3>
          ${state.user.unlockedTitles.map((t) => `<div class="province-rank-item"><strong>${escHtml(t)}</strong><span class="badge-tag jade">Đã lưu</span></div>`).join("")}
        </div>
      `
          : `
        <div class="surface-panel">
          <div class="btn-row">
            <button type="button" class="btn-secondary" id="lb-filter-all" style="${activeRankProvinceFilter === "all" ? "background:var(--accent-jade);color:#fff;" : ""}">Cả nước</button>
            <button type="button" class="btn-secondary" id="lb-filter-prov" style="${activeRankProvinceFilter === "mine" ? "background:var(--accent-jade);color:#fff;" : ""}">Riêng ${escHtml(myProv)}</button>
          </div>
          <div class="province-rank-list">
            ${rows
              .map(
                (r, idx) => `
              <div class="province-rank-item">
                <div>
                  <strong>${idx + 1}. ${escHtml(r.name)}</strong>
                  <div style="font-size:0.88rem; color:var(--ink-secondary);">${escHtml(r.province)} · ${escHtml(r.title)}</div>
                </div>
                <span class="badge-tag amber num">${r.score} điểm</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
      }
    `;

    document.getElementById("lb-tab-all").addEventListener("click", () => {
      activeLeaderTab = "Tỉnh";
      renderLeaderboard();
    });
    document.getElementById("lb-tab-mem").addEventListener("click", () => {
      activeLeaderTab = "Tủ kỷ niệm";
      renderLeaderboard();
    });
    const fAll = document.getElementById("lb-filter-all");
    const fProv = document.getElementById("lb-filter-prov");
    if (fAll) {
      fAll.addEventListener("click", () => {
        activeRankProvinceFilter = "all";
        renderLeaderboard();
      });
    }
    if (fProv) {
      fProv.addEventListener("click", () => {
        activeRankProvinceFilter = "mine";
        renderLeaderboard();
      });
    }
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

  function renderProfile() {
    const pron = getUserPronoun();
    const hon = getUserHonorific();
    const age = getUserAge();
    const baseName = state.user.baseName || state.user.name.replace(/^(Anh|Chị|Bác|Cô|Bà|Chú)\s+/i, "");

    const activeOutfitId = (profilePreviewDraft && profilePreviewDraft.outfitId) || state.user.outfitId;
    const activeAccId = (profilePreviewDraft && profilePreviewDraft.accessoryId) || state.user.accessoryId || "glasses";
    const activeItemId = (profilePreviewDraft && profilePreviewDraft.itemId) || state.user.itemId;

    const activeOutfit = getOutfit(activeOutfitId);
    const activeAcc = D.ACCESSORIES.find((a) => a.id === activeAccId) || D.ACCESSORIES[0];
    const activeItem = getTableItem(activeItemId);
    const isPreviewingDraft =
      activeOutfitId !== state.user.outfitId ||
      activeAccId !== (state.user.accessoryId || "glasses") ||
      activeItemId !== state.user.itemId;

    els.main.innerHTML = `
      <h1>Hồ sơ & Đồ bày bàn trà</h1>
      <p class="lead-copy">Dùng Xu kiếm được từ Điểm danh và Đố vui để chọn áo mới và vật phẩm đặt trên bàn trà (không bán xu bằng tiền).</p>

      <!-- Khung 3D / 2.5D xem trực tiếp sự thay đổi trang phục, phụ kiện và đồ bày bàn trà -->
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

  // ==================== ROUTER & GLOBAL TIMERS ====================
  function render() {
    updateGlobalChrome();
    switch (state.route) {
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

  setInterval(() => {
    sessionSeconds += 1;
    const mm = String(Math.floor(sessionSeconds / 60)).padStart(2, "0");
    const ss = String(sessionSeconds % 60).padStart(2, "0");
    if (els.stripTimer) {
      els.stripTimer.textContent = `${mm}:${ss}`;
    }
    if (sessionSeconds >= 1200 && !eyeCareShownThisCycle) {
      showEyeRestModal();
    }
  }, 1000);

  // Event bindings
  els.btnBack.addEventListener("click", () => navigate("home"));
  els.btnProfile.addEventListener("click", () => navigate("profile"));
  els.dialogClose.addEventListener("click", closeDialog);

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
  if (els.simEye) {
    els.simEye.addEventListener("click", () => {
      sessionSeconds = 1200;
      showEyeRestModal();
    });
  }
  if (els.simFamily) {
    els.simFamily.addEventListener("click", () => navigate("family"));
  }
  if (els.simReset) {
    els.simReset.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
      sessionSeconds = 0;
      pendingQueue = [];
      showToast("Đã đặt lại dữ liệu mô phỏng ban đầu.");
      render();
    });
  }

  applyUrlDeepLinkIfPresent();
  render();
})();
