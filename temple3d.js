window.TempleScene3D = (function () {
  // ============================================================================
  // ĐẠI SẢNH CHÁNH ĐIỆN 20 BỒ ĐOÀN & ĐẠO TRÀNG HÀNH LỄ TẢ THỰC (28 FPS)
  // - Nền nhiếp ảnh Đại Sảnh Chùa Cổ 5 Gian góc siêu rộng + Sprite Phật tử Áo Lam / Áo Nâu tả thực (nhìn từ sau lưng)
  // - 20 Chiếu Bồ Đoàn (4 hàng × 5 chỗ) đông vui nhộn nhịp, sắp xếp chiều sâu chuẩn Painter's Algorithm
  // - Hiệu ứng Phật tử đứng dậy từ chiếu, bước đi theo lối hành lễ lên Lư Hương thắp nhang, Mõ Gỗ gõ mõ,
  //   Đại Hồng Chung thỉnh chuông hoặc Ống Xăm gieo quẻ, cúi vái 3 nhịp trang nghiêm rồi bước quay về chiếu
  // - Các đạo hữu trong sảnh cũng luân phiên bước lên thắp nhang / gõ mõ tự nhiên như phiên Live thật
  // ============================================================================

  let mode = "3d";
  let animId = null;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 28;

  let renderer = null;
  let scene = null;
  let containerEl = null;
  let canvasEl = null;
  let ctx = null;
  let tagsLayerEl = null;

  let cameraView = "wide"; // "wide" | "cushions" | "courtyard"
  let panOffsetX = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartPan = 0;
  let pointerMovedDist = 0;
  let boundMouseMove = null;
  let boundMouseUp = null;
  let boundResize = null;

  let currentConfig = null;
  let autoMuyuPinned = false;
  let nextAmbientWalkAt = 0;

  let seatActors = []; // 20 slots: { idx, row, col, nx, ny, scale, occupant, isUser, spritePrefix, walkTask }
  let smokeWisps = [];
  let dustMotes = [];
  let soundRipples = [];
  let floatingPopups = [];
  let extraPondLights = [];
  let extraTreeGlints = [];
  let hitZones = [];

  let bellResonance = 0;
  let muyuPulse = 0;
  let incenseBoost = 0;
  let fortunePulse = 0;
  let wishPulse = 0;

  const LANTERN_TTL_MS = 180000; // Đèn Hoa Đăng trôi lung linh trên mặt hồ suốt 3 phút trước khi tan dần
  let activePondLanterns = [];   // [{ id, ownerName, isUser, spawnAt, expiresAt, baseNx, baseNy, phase, variant }]
  let activeTreePlaques = [];    // [{ id, isGold, nx, ny, phase, spawnAt }]

  const SPRITES_URL = "./assets/temple-sprites.webp?v=20261118a";
  const SCENE_IMAGES_BY_SPACE = [
    {
      // 0: Sân Chùa Quê (Chánh Điện Tam Bảo Chùa Cổ Bắc Bộ)
      wide: "./assets/temple-wide.jpg?v=20261118a",
      cushions: "./assets/temple-altar.jpg?v=20261118a",
      courtyard: "./assets/temple-courtyard.jpg?v=20261118a",
      hallBadge: "Chánh điện",
      meritBadge: "Tâm An",
      bellLabel: "Chuông đồng",
      incenseLabel: "Dâng hương",
      fortuneLabel: "Ống xăm",
      muyuLabel: "Gõ mõ",
      pondLabel: "Hồ Sen",
      treeLabel: "Cây Thẻ Đỏ"
    },
    {
      // 1: Nhà Thờ Họ (Từ Đường Gia Tộc Việt Nam — Hoành phi Đức Lưu Quang, KHÔNG tượng Phật)
      wide: "./assets/ancestral-wide.jpg?v=20261118a",
      cushions: "./assets/ancestral-altar.jpg?v=20261118a",
      courtyard: "./assets/ancestral-courtyard.jpg?v=20261118a",
      hallBadge: "Từ đường",
      meritBadge: "Phúc Ấm",
      bellLabel: "Khánh đồng",
      incenseLabel: "Kính hương",
      fortuneLabel: "Ống thẻ lộc",
      muyuLabel: "Mõ lễ",
      pondLabel: "Hồ Bán Nguyệt",
      treeLabel: "Cây Phúc Lộc"
    },
    {
      // 2: Vườn Thiền Tĩnh Lặng (Hiên Gỗ Trúc Lâm & Vườn Sỏi Hồ Tịnh Tâm)
      wide: "./assets/zengarden-wide.jpg?v=20261118a",
      cushions: "./assets/zengarden-altar.jpg?v=20261118a",
      courtyard: "./assets/zengarden-courtyard.jpg?v=20261118a",
      hallBadge: "Thiền đường",
      meritBadge: "Tĩnh Tâm",
      bellLabel: "Chuông thiền",
      incenseLabel: "Thắp trầm",
      fortuneLabel: "Ống kệ thiền",
      muyuLabel: "Mõ thiền",
      pondLabel: "Hồ Tịnh Tâm",
      treeLabel: "Cây Ước Nguyện"
    }
  ];

  const ATLAS_RECTS = {
    cushion: { x: 6, y: 6, w: 156, h: 68 },
    m_lam_sit: { x: 168, y: 6, w: 120, h: 168 },
    m_nau_sit: { x: 294, y: 6, w: 120, h: 168 },
    f_nau_sit: { x: 420, y: 6, w: 112, h: 162 },
    f_lam_sit: { x: 538, y: 6, w: 112, h: 162 },
    m_lam_stand: { x: 6, y: 180, w: 83, h: 224 },
    m_nau_stand: { x: 95, y: 180, w: 83, h: 224 },
    f_nau_stand: { x: 184, y: 180, w: 70, h: 216 },
    f_lam_stand: { x: 260, y: 180, w: 70, h: 216 }
  };

  const imgCache = {};

  // 20 Chiếu Bồ Đoàn (4 hàng × 5 cột) trải rộng khắp Đại Sảnh gạch Bát Tràng
  const ROW_SPECS = [
    { row: 0, ny: 0.684, scale: 0.48, span: 0.60 },
    { row: 1, ny: 0.758, scale: 0.59, span: 0.70 },
    { row: 2, ny: 0.840, scale: 0.72, span: 0.80 },
    { row: 3, ny: 0.932, scale: 0.86, span: 0.90 }
  ];

  const CUSHION_COORDS = (function () {
    const arr = [];
    for (let r = 0; r < 4; r++) {
      const sp = ROW_SPECS[r];
      for (let c = 0; c < 5; c++) {
        const idx = r * 5 + c;
        const rel = (c - 2) / 2;
        const nx = 0.50 + rel * (sp.span * 0.5);
        arr.push({
          idx,
          row: r,
          col: c,
          nx,
          ny: sp.ny,
          scale: sp.scale,
          x: (c - 2) * 1.45,
          z: 0.55 + r * 1.15
        });
      }
    }
    return arr;
  })();

  // Tọa độ đứng hành lễ trước từng pháp khí trong ảnh Đại Sảnh (temple-wide.jpg)
  const RITUAL_STATIONS = {
    incense: { nx: 0.476, ny: 0.626, aisleX: 0.46 },
    muyu: { nx: 0.772, ny: 0.628, aisleX: 0.72 },
    bell: { nx: 0.208, ny: 0.618, aisleX: 0.25 },
    peace_card: { nx: 0.706, ny: 0.630, aisleX: 0.68 }
  };

  function getSpaceSpec() {
    const rawIdx = Number(currentConfig && currentConfig.spaceIdx) || 0;
    const safeIdx = Math.max(0, Math.min(SCENE_IMAGES_BY_SPACE.length - 1, rawIdx));
    return SCENE_IMAGES_BY_SPACE[safeIdx];
  }

  function loadSingleCachedImage(cacheKey, url) {
    if (imgCache[cacheKey] || typeof Image === "undefined") return;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      imgCache[cacheKey].loaded = true;
      renderSanctuaryFrame(typeof performance !== "undefined" ? performance.now() * 0.001 : 0);
    };
    img.onerror = () => {
      imgCache[cacheKey].failed = true;
    };
    imgCache[cacheKey] = { img, loaded: false, failed: false };
    img.src = url;
  }

  function ensureImagesLoaded() {
    if (typeof Image === "undefined") return;
    loadSingleCachedImage("sprites", SPRITES_URL);
    const activeIdx = Math.max(0, Math.min(2, Number(currentConfig && currentConfig.spaceIdx) || 0));
    // Load active space immediately first, then warm-cache remaining spaces
    const order = [activeIdx, 0, 1, 2];
    order.forEach((sIdx) => {
      const sp = SCENE_IMAGES_BY_SPACE[sIdx];
      if (!sp) return;
      ["wide", "cushions", "courtyard"].forEach((view) => {
        loadSingleCachedImage(`sp${sIdx}_${view}`, sp[view]);
      });
    });
  }

  function syncActiveLanternsFromConfig(cfg) {
    if (!cfg || !Array.isArray(cfg.activeLanterns)) return;
    const now = Date.now();
    activePondLanterns = cfg.activeLanterns
      .filter((it) => it && (it.expiresAt || 0) > now)
      .map((it, idx) => ({
        id: it.id || `ltn_${idx}`,
        ownerName: it.ownerName || "Bác",
        isUser: Boolean(it.isUser),
        spawnAt: it.spawnAt || now - 2000,
        expiresAt: it.expiresAt || now + LANTERN_TTL_MS,
        baseNx: typeof it.baseNx === "number" ? it.baseNx : 0.14 + ((idx * 37) % 21) * 0.01,
        baseNy: typeof it.baseNy === "number" ? it.baseNy : 0.65 + ((idx * 53) % 23) * 0.01,
        phase: typeof it.phase === "number" ? it.phase : idx * 1.4,
        variant: it.variant || (idx % 3 === 0 ? "gold" : idx % 2 === 0 ? "pink" : "coral")
      }));
  }

  function roundRectPath(c, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  }

  function chooseSpritePrefix(occ, idx) {
    const isFem = Boolean(occ && occ.isFemale);
    const robePref = occ && occ.robeStyle ? occ.robeStyle : idx % 2 === 0 ? "lam" : "nau";
    if (isFem) {
      return robePref === "lam" ? "f_lam" : "f_nau";
    }
    return robePref === "nau" ? "m_nau" : "m_lam";
  }

  function rebuildTwentySeatActors() {
    const attendees = (currentConfig && currentConfig.attendees) || [];
    const rawIdx =
      currentConfig && typeof currentConfig.userCushionIdx === "number" && Number.isFinite(currentConfig.userCushionIdx)
        ? Math.floor(currentConfig.userCushionIdx)
        : 2;
    const selectedIdx = Math.max(0, Math.min(19, rawIdx));

    // Giữ lại tiến trình đi bộ đang diễn ra nếu cùng vai (tránh gán nhầm hành trình sang NPC khác khi đổi chiếu)
    const prevWalkByIdx = {};
    seatActors.forEach((sa) => {
      if (sa.walkTask) prevWalkByIdx[sa.idx] = { task: sa.walkTask, isUser: Boolean(sa.isUser) };
    });

    seatActors = CUSHION_COORDS.map((slot) => {
      const occ = attendees.find((a) => a.cushionIdx === slot.idx) || null;
      const isUser = slot.idx === selectedIdx;
      const prevWalk = prevWalkByIdx[slot.idx];
      return {
        idx: slot.idx,
        row: slot.row,
        col: slot.col,
        nx: slot.nx,
        ny: slot.ny,
        scale: slot.scale,
        occupant: occ,
        isUser,
        spritePrefix: chooseSpritePrefix(occ, slot.idx),
        walkTask: prevWalk && prevWalk.isUser === isUser && occ ? prevWalk.task : null
      };
    });

    if (autoMuyuPinned) {
      const userActor = seatActors.find((a) => a.isUser);
      if (userActor && (!userActor.walkTask || userActor.walkTask.stationKey !== "muyu")) {
        startActorRitualWalk(userActor.idx, "muyu", null, true);
      }
    }
  }

  function initAtmosphericParticles() {
    smokeWisps = [];
    for (let i = 0; i < 22; i++) {
      smokeWisps.push({
        progress: i / 22,
        speed: 0.0028 + (i % 5) * 0.00045,
        driftSeed: i * 1.37,
        spread: (i % 3 - 1) * 0.004,
        radiusBase: 5 + (i % 4) * 3.2
      });
    }

    dustMotes = [];
    for (let i = 0; i < 16; i++) {
      dustMotes.push({
        nx: 0.10 + ((i * 37) % 80) / 100,
        ny: 0.12 + ((i * 53) % 76) / 100,
        vy: -0.0004 - (i % 4) * 0.00016,
        phase: i * 0.9,
        size: 1.0 + (i % 3) * 0.6
      });
    }

    extraPondLights = [
      { nx: 0.24, ny: 0.72, phase: 0.5 },
      { nx: 0.16, ny: 0.66, phase: 1.9 },
      { nx: 0.31, ny: 0.63, phase: 3.1 }
    ];

    extraTreeGlints = [
      { nx: 0.72, ny: 0.41, phase: 0.4 },
      { nx: 0.81, ny: 0.39, phase: 1.7 },
      { nx: 0.90, ny: 0.38, phase: 2.8 },
      { nx: 0.66, ny: 0.38, phase: 3.9 }
    ];

    rebuildTwentySeatActors();
    nextAmbientWalkAt = Date.now() + 4500;
  }

  function evalQuadraticBezier(p0, p1, p2, t) {
    const inv = 1 - t;
    return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function perspectiveScaleAtY(ny) {
    // Nội suy tỷ lệ phối cảnh theo chiều sâu sàn gạch (từ y=0.618 gần Tam Bảo tới y=0.95 tiền cảnh)
    const clamped = Math.max(0.60, Math.min(0.96, ny));
    return 0.44 + ((clamped - 0.618) / (0.932 - 0.618)) * 0.42;
  }

  function startActorRitualWalk(seatIdx, stationKey, onArriveEffect, pinAtStation) {
    const actor = seatActors.find((a) => a.idx === seatIdx);
    if (!actor || !actor.occupant) return;
    const st = RITUAL_STATIONS[stationKey] || RITUAL_STATIONS.incense;

    // Nếu nhân vật đang đứng sẵn ngay trạm đó (ví dụ gõ mõ liên tiếp), nhún vái thêm nhịp mà không chạy lại từ đầu
    if (actor.walkTask && actor.walkTask.stationKey === stationKey && actor.walkTask.phase === "bow") {
      actor.walkTask.bowStartedAt = Date.now();
      actor.walkTask.pinned = Boolean(pinAtStation);
      if (typeof onArriveEffect === "function") onArriveEffect();
      return;
    }

    const startX = actor.walkTask ? actor.walkTask.curX : actor.nx;
    const startY = actor.walkTask ? actor.walkTask.curY : actor.ny;
    // Điểm uốn lối đi để người đi lượn mượt qua lối hành lễ chứ không cắt xuyên qua đầu người hàng trước
    const ctrlX = st.aisleX + (startX - 0.5) * 0.18;
    const ctrlY = (startY + st.ny) * 0.5 + 0.03;

    actor.walkTask = {
      stationKey,
      startX,
      startY,
      ctrlX,
      ctrlY,
      destX: st.nx + (actor.isUser ? 0 : ((seatIdx % 3) - 1) * 0.018),
      destY: st.ny + (actor.isUser ? 0 : (seatIdx % 2) * 0.012),
      curX: startX,
      curY: startY,
      phase: "walk_out", // "walk_out" | "bow" | "walk_back"
      phaseStartedAt: Date.now(),
      walkOutMs: 1450,
      bowMs: 1850,
      walkBackMs: 1450,
      pinned: Boolean(pinAtStation),
      onArriveEffect: onArriveEffect || null,
      effectFired: false
    };
  }

  function updateAllWalkingTasks(nowMs) {
    // Lịch tự động cho các bác đạo hữu trong sảnh thỉnh thoảng bước lên dâng hương / gõ mõ cho nhộn nhịp
    if (cameraView === "wide" && nowMs > nextAmbientWalkAt) {
      const activeWalkers = seatActors.filter((a) => a.walkTask !== null).length;
      if (activeWalkers < 2) {
        const candidates = seatActors.filter((a) => a.occupant && !a.isUser && !a.walkTask);
        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const kinds = ["incense", "muyu", "incense", "bell"];
          const chosenKind = kinds[Math.floor(Math.random() * kinds.length)];
          startActorRitualWalk(pick.idx, chosenKind, () => {
            if (chosenKind === "incense") {
              incenseBoost = Math.max(incenseBoost, 0.7);
              pushSoundRipple(0.50, 0.54, "rgba(255, 224, 140, 0.72)", 48);
            } else if (chosenKind === "muyu") {
              muyuPulse = Math.max(muyuPulse, 0.7);
              pushSoundRipple(0.815, 0.53, "rgba(255, 224, 140, 0.72)", 44);
            } else {
              bellResonance = Math.max(bellResonance, 0.65);
              pushSoundRipple(0.155, 0.46, "rgba(255, 224, 140, 0.72)", 64);
            }
          });
        }
      }
      nextAmbientWalkAt = nowMs + 7500 + Math.random() * 4500;
    }

    seatActors.forEach((actor) => {
      const wt = actor.walkTask;
      if (!wt) return;
      const elapsed = nowMs - wt.phaseStartedAt;

      if (wt.phase === "walk_out") {
        const rawT = Math.min(1, elapsed / wt.walkOutMs);
        const t = easeInOutQuad(rawT);
        wt.curX = evalQuadraticBezier(wt.startX, wt.ctrlX, wt.destX, t);
        wt.curY = evalQuadraticBezier(wt.startY, wt.ctrlY, wt.destY, t);
        if (rawT >= 1) {
          wt.phase = "bow";
          wt.phaseStartedAt = nowMs;
          wt.bowStartedAt = nowMs;
          if (!wt.effectFired && typeof wt.onArriveEffect === "function") {
            wt.effectFired = true;
            wt.onArriveEffect();
          }
        }
      } else if (wt.phase === "bow") {
        wt.curX = wt.destX;
        wt.curY = wt.destY;
        if (!wt.pinned && nowMs - wt.bowStartedAt >= wt.bowMs) {
          wt.phase = "walk_back";
          wt.phaseStartedAt = nowMs;
        }
      } else if (wt.phase === "walk_back") {
        const rawT = Math.min(1, elapsed / wt.walkBackMs);
        const t = easeInOutQuad(rawT);
        wt.curX = evalQuadraticBezier(wt.destX, wt.ctrlX, actor.nx, t);
        wt.curY = evalQuadraticBezier(wt.destY, wt.ctrlY, actor.ny, t);
        if (rawT >= 1) {
          actor.walkTask = null;
        }
      }
    });
  }

  function pushSoundRipple(nx, ny, colorStr, maxR) {
    soundRipples.push({
      nx,
      ny,
      r: 8,
      maxR: maxR || 76,
      alpha: 0.78,
      color: colorStr || "rgba(255, 222, 138, 0.9)"
    });
    if (soundRipples.length > 8) soundRipples.shift();
  }

  function pushFloatingToast(nx, ny, title) {
    floatingPopups.push({
      nx,
      ny,
      vy: 0.0024,
      title: String(title || "+1 Tâm An").slice(0, 26),
      alpha: 1.0
    });
    if (floatingPopups.length > 5) floatingPopups.shift();
  }

  function drawCoverPhoto(c, w, h) {
    const sIdx = Math.max(0, Math.min(2, Number(currentConfig && currentConfig.spaceIdx) || 0));
    const viewKey = cameraView === "cushions" ? "cushions" : cameraView === "courtyard" ? "courtyard" : "wide";
    const entry = imgCache[`sp${sIdx}_${viewKey}`];

    if (entry && entry.loaded && entry.img && entry.img.naturalWidth > 0) {
      const iw = entry.img.naturalWidth;
      const ih = entry.img.naturalHeight;
      const scale = Math.max(w / iw, h / ih) * 1.04;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) * 0.5 + panOffsetX;
      const dy = (h - dh) * 0.5;
      c.drawImage(entry.img, dx, dy, dw, dh);
      return { dx, dy, dw, dh, ready: true };
    }

    const fallbackGrad = c.createLinearGradient(0, 0, 0, h);
    if (sIdx === 2) {
      fallbackGrad.addColorStop(0, "#1E2D24");
      fallbackGrad.addColorStop(0.55, "#2C4034");
      fallbackGrad.addColorStop(1, "#4A3A28");
    } else {
      fallbackGrad.addColorStop(0, "#1E120C");
      fallbackGrad.addColorStop(0.55, "#382115");
      fallbackGrad.addColorStop(1, "#523220");
    }
    c.fillStyle = fallbackGrad;
    c.fillRect(0, 0, w, h);
    return { dx: 0, dy: 0, dw: w, dh: h, ready: false };
  }

  function drawAtlasSprite(c, spriteKey, destX, destY, destW, destH) {
    const spEntry = imgCache.sprites;
    const rect = ATLAS_RECTS[spriteKey];
    if (!spEntry || !spEntry.loaded || !rect) return false;
    c.drawImage(spEntry.img, rect.x, rect.y, rect.w, rect.h, destX, destY, destW, destH);
    return true;
  }

  function drawSoftLightBloom(c, x, y, radius, alpha, rCol, gCol, bCol) {
    if (alpha <= 0.005 || radius <= 1) return;
    const grad = c.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha})`);
    grad.addColorStop(0.45, `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha * 0.38})`);
    grad.addColorStop(1, `rgba(${rCol}, ${gCol}, ${bCol}, 0)`);
    c.fillStyle = grad;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2);
    c.fill();
  }

  function drawRealisticIncenseSmoke(c, originX, originY, heightSpan, tSec) {
    c.save();
    smokeWisps.forEach((sp) => {
      sp.progress += sp.speed * (incenseBoost > 0 ? 1.45 : 1);
      if (sp.progress >= 1) sp.progress -= 1;

      const p = sp.progress;
      const riseY = originY - p * heightSpan;
      const curlX =
        originX +
        sp.spread * heightSpan * p +
        Math.sin(p * 5.2 - tSec * 1.45 + sp.driftSeed) * (3.5 + p * 13);
      const envAlpha = Math.sin(p * Math.PI) * (incenseBoost > 0 ? 0.16 : 0.095);
      const rad = sp.radiusBase * (0.45 + p * 1.55);

      const sGrad = c.createRadialGradient(curlX, riseY, 0, curlX, riseY, rad);
      if (incenseBoost > 0) {
        sGrad.addColorStop(0, `rgba(255, 240, 205, ${envAlpha})`);
        sGrad.addColorStop(0.55, `rgba(236, 228, 214, ${envAlpha * 0.45})`);
        sGrad.addColorStop(1, "rgba(236, 228, 214, 0)");
      } else {
        sGrad.addColorStop(0, `rgba(238, 234, 228, ${envAlpha})`);
        sGrad.addColorStop(0.55, `rgba(220, 216, 210, ${envAlpha * 0.42})`);
        sGrad.addColorStop(1, "rgba(220, 216, 210, 0)");
      }
      c.fillStyle = sGrad;
      c.beginPath();
      c.arc(curlX, riseY, rad, 0, Math.PI * 2);
      c.fill();
    });
    c.restore();
  }

  function drawClampedHotspotPill(c, w, rawPx, py, labelText, pulseStrength) {
    c.save();
    c.font = "600 9.5px 'Be Vietnam Pro', system-ui, sans-serif";
    const tw = Math.max(52, c.measureText(labelText).width + 14);
    const th = 18;
    // Kẹp biên trái/phải an toàn để nhãn không bao giờ bị cắt chữ ở mép màn hình
    const px = Math.max(tw * 0.5 + 6, Math.min(w - tw * 0.5 - 6, rawPx));

    roundRectPath(c, px - tw / 2, py - th / 2, tw, th, 9);
    c.fillStyle = pulseStrength > 0 ? "rgba(122, 46, 18, 0.92)" : "rgba(22, 12, 8, 0.74)";
    c.fill();
    c.strokeStyle = pulseStrength > 0 ? "#FFE082" : "rgba(242, 204, 126, 0.58)";
    c.lineWidth = pulseStrength > 0 ? 1.3 : 0.9;
    c.stroke();

    c.fillStyle = "#FFF8E7";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(labelText, px, py + 0.5);
    c.restore();
  }

  function drawMiniSeatNameTag(c, w, rawX, rawY, text, isUser, isRealPeer, canvasH) {
    c.save();
    c.font = `${isUser ? "700" : "600"} 8.5px 'Be Vietnam Pro', system-ui, sans-serif`;
    const tw = Math.max(36, c.measureText(text).width + 10);
    const th = 13.5;
    const px = Math.max(tw * 0.5 + 5, Math.min(w - tw * 0.5 - 5, rawX));
    const maxH = canvasH || 9999;
    const py = Math.max(th * 0.5 + 4, Math.min(maxH - th * 0.5 - 4, rawY));

    roundRectPath(c, px - tw / 2, py - th / 2, tw, th, 6.5);
    c.fillStyle = isUser
      ? "rgba(176, 52, 34, 0.95)"
      : isRealPeer
        ? "rgba(32, 102, 76, 0.92)"
        : "rgba(24, 14, 9, 0.84)";
    c.fill();
    c.strokeStyle = isUser ? "#FFE082" : "rgba(242, 204, 126, 0.52)";
    c.lineWidth = isUser ? 1.2 : 0.8;
    c.stroke();

    c.fillStyle = "#FFFDF7";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, px, py + 0.5);
    c.restore();
  }

  function drawTwentyCushionsAndDevotees(c, w, h, frame, tSec, nowMs) {
    const mapX = (nx) => frame.dx + nx * frame.dw;
    const mapY = (ny) => frame.dy + ny * frame.dh;
    const unitScale = frame.dw / 960;

    // Bước 1: Vẽ toàn bộ 20 Chiếu Bồ Đoàn cói thật kèm bóng đổ mềm trên nền gạch Bát Tràng
    seatActors.forEach((sa) => {
      const cx = mapX(sa.nx);
      const cy = mapY(sa.ny);
      const sc = sa.scale * unitScale;
      const cw = ATLAS_RECTS.cushion.w * sc * 0.80;
      const ch = ATLAS_RECTS.cushion.h * sc * 0.76;

      // Bóng tiếp đất dưới chiếu
      c.save();
      c.fillStyle = "rgba(14, 7, 3, 0.42)";
      c.beginPath();
      c.ellipse(cx, cy + ch * 0.14, cw * 0.52, ch * 0.44, 0, 0, Math.PI * 2);
      c.fill();

      // Vòng lụa sáng đánh dấu chiếu của Bác đang chọn
      if (sa.isUser) {
        c.strokeStyle = "rgba(255, 222, 122, 0.90)";
        c.lineWidth = 1.8;
        c.beginPath();
        c.ellipse(cx, cy + ch * 0.04, cw * 0.56, ch * 0.52, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();

      if (!drawAtlasSprite(c, "cushion", cx - cw * 0.5, cy - ch * 0.5, cw, ch)) {
        c.fillStyle = "#A68254";
        c.beginPath();
        c.ellipse(cx, cy, cw * 0.48, ch * 0.44, 0, 0, Math.PI * 2);
        c.fill();
      }

      // Vùng chạm để đổi sang ngồi bất kỳ chiếu nào trong 20 chiếu
      hitZones.push({
        kind: "select_cushion",
        payload: sa.idx,
        x: cx - cw * 0.56,
        y: cy - ch * 1.35,
        w: cw * 1.12,
        h: ch * 1.95
      });
    });

    // Bước 2: Thu thập danh sách Phật tử đang ngồi tại chiếu VÀ đang đi hành lễ, sắp xếp theo chiều sâu Y
    const renderQueue = [];
    seatActors.forEach((sa) => {
      if (!sa.occupant) return;
      if (sa.walkTask) {
        renderQueue.push({ kind: "walker", sa, footY: sa.walkTask.curY });
      } else {
        renderQueue.push({ kind: "seated", sa, footY: sa.ny });
      }
    });
    renderQueue.sort((a, b) => a.footY - b.footY);

    // Bước 3: Vẽ từng Phật tử tả thực theo thứ tự xa trước - gần sau, gom nhãn tên vẽ lớp trên cùng để không bị đầu hàng trước che chữ
    const pendingNameTags = [];
    renderQueue.forEach((item) => {
      const sa = item.sa;
      const occ = sa.occupant;
      const shortName = sa.isUser
        ? `BĐ${sa.idx + 1}·Bạn`
        : String(occ.shortLabel || occ.name || "Bác")
          .replace(/^(Anh|Chị|Bác|Cụ|Chú|Cô)\s+/i, "$1 ")
          .slice(0, 10);

      if (item.kind === "seated") {
        const cx = mapX(sa.nx);
        const cy = mapY(sa.ny);
        const sc = sa.scale * unitScale;
        const sitKey = `${sa.spritePrefix}_sit`;
        const rect = ATLAS_RECTS[sitKey];
        const sw = rect.w * sc * 0.72;
        const sh = rect.h * sc * 0.72;
        const ch = ATLAS_RECTS.cushion.h * sc * 0.76;
        // Nhịp thở tĩnh tọa rất nhẹ
        const breathY = Math.sin(tSec * 1.7 + sa.idx * 0.8) * 0.8;

        drawAtlasSprite(c, sitKey, cx - sw * 0.5, cy - sh + ch * 0.24 + breathY, sw, sh);
        pendingNameTags.push({
          x: cx,
          y: cy - sh * 0.22,
          text: shortName,
          isUser: sa.isUser,
          isRealPeer: Boolean(occ.isRealPeer)
        });
      } else {
        // Nhân vật đang bước đi lên thắp nhang / gõ mõ / thỉnh chuông hoặc đang cúi vái hành lễ
        const wt = sa.walkTask;
        const wx = mapX(wt.curX);
        const wy = mapY(wt.curY);
        const dynScale = perspectiveScaleAtY(wt.curY) * unitScale;
        const standKey = `${sa.spritePrefix}_stand`;
        const rect = ATLAS_RECTS[standKey];
        const baseW = rect.w * dynScale * 0.76;
        const baseH = rect.h * dynScale * 0.76;

        let stepBobY = 0;
        let swayRot = 0;
        let bowScaleY = 1.0;

        if (wt.phase === "walk_out" || wt.phase === "walk_back") {
          stepBobY = -Math.abs(Math.sin(tSec * 8.6 + sa.idx)) * 2.4;
          swayRot = Math.sin(tSec * 4.3 + sa.idx) * 0.016;
        } else if (wt.phase === "bow") {
          // Cúi đầu vái lễ 3 nhịp trang nghiêm hướng lên Tam Bảo
          const bowElapsed = (nowMs - (wt.bowStartedAt || wt.phaseStartedAt)) * 0.001;
          const bowWave = Math.max(0, Math.sin(bowElapsed * 4.8));
          bowScaleY = 1.0 - bowWave * 0.065;
          stepBobY = bowWave * 2.5;
        }

        // Bóng chân tiếp đất trên gạch Bát Tràng khi di chuyển
        c.save();
        c.fillStyle = "rgba(14, 7, 3, 0.44)";
        c.beginPath();
        c.ellipse(wx, wy + 1.5, baseW * 0.42, baseW * 0.16, 0, 0, Math.PI * 2);
        c.fill();

        c.translate(wx, wy);
        c.rotate(swayRot);
        c.scale(1, bowScaleY);
        drawAtlasSprite(c, standKey, -baseW * 0.5, -baseH + stepBobY, baseW, baseH);
        c.restore();

        pendingNameTags.push({
          x: wx,
          y: wy + 7,
          text: shortName,
          isUser: sa.isUser,
          isRealPeer: Boolean(occ.isRealPeer)
        });
      }
    });

    // Bước 4: Vẽ nhãn tên rõ nét trên lưng áo tràng, tự kẹp biên trong khung [w × h]
    pendingNameTags.forEach((nt) => {
      drawMiniSeatNameTag(c, w, nt.x, nt.y, nt.text, nt.isUser, nt.isRealPeer, h);
    });
  }

  function drawSingleLotusLantern(c, w, px, py, sc, alpha, variant, tSec, ageMs, ownerLabel, isUser) {
    if (alpha <= 0.01) return;
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, alpha));

    // 1. Expanding water ripple ring when newly placed on the pond (first 4.5s)
    if (ageMs < 4500) {
      const k = Math.max(0, ageMs / 4500);
      const ripR = (10 + k * 28) * sc;
      c.strokeStyle = `rgba(182, 245, 228, ${((1 - k) * 0.65).toFixed(2)})`;
      c.lineWidth = 1.25;
      c.beginPath();
      c.ellipse(px, py + 3 * sc, ripR, ripR * 0.42, 0, 0, Math.PI * 2);
      c.stroke();
    }

    // 2. Warm shimmering reflection on dark emerald pond water
    const reflFlicker = 0.30 + Math.sin(tSec * 5.8 + px * 0.05) * 0.08;
    const reflGrad = c.createRadialGradient(px, py + 7 * sc, 1, px, py + 8 * sc, 18 * sc);
    reflGrad.addColorStop(0, `rgba(255, 206, 118, ${reflFlicker.toFixed(2)})`);
    reflGrad.addColorStop(0.55, `rgba(244, 132, 112, ${(reflFlicker * 0.45).toFixed(2)})`);
    reflGrad.addColorStop(1, "rgba(244, 132, 112, 0)");
    c.fillStyle = reflGrad;
    c.beginPath();
    c.ellipse(px, py + 7 * sc, 18 * sc, 7.5 * sc, 0, 0, Math.PI * 2);
    c.fill();

    // 3. Floating dark-jade lotus leaf pad base
    c.fillStyle = "#1D4D38";
    c.strokeStyle = "#367858";
    c.lineWidth = 1.0;
    c.beginPath();
    c.ellipse(px, py + 2.5 * sc, 13.5 * sc, 5.4 * sc, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    const pal =
      variant === "gold"
        ? { outer: "#D9822B", inner: "#FAD06C", tip: "#FFF6D6", stroke: "#8C4814" }
        : variant === "coral"
          ? { outer: "#D85A4A", inner: "#F7A188", tip: "#FFE8DF", stroke: "#8A281E" }
          : { outer: "#C9486B", inner: "#F598B2", tip: "#FFEAF0", stroke: "#7D203C" };

    // 4. Back ring of pointed lotus petals
    c.fillStyle = pal.outer;
    c.strokeStyle = pal.stroke;
    c.lineWidth = 0.85;
    [-9.5, -4.8, 0, 4.8, 9.5].forEach((dx, i) => {
      const tilt = dx * 0.045;
      const ph = (i === 2 ? 11.5 : i === 1 || i === 3 ? 10.2 : 8.5) * sc;
      c.save();
      c.translate(px + dx * sc, py + 1 * sc);
      c.rotate(tilt);
      c.beginPath();
      c.moveTo(-3.6 * sc, 0);
      c.quadraticCurveTo(-4.2 * sc, -ph * 0.65, 0, -ph);
      c.quadraticCurveTo(4.2 * sc, -ph * 0.65, 3.6 * sc, 0);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    });

    // 5. Warm glowing candle core & flickering flame inside lotus cup
    const flameH = (7.2 + Math.sin(tSec * 9.5 + px) * 1.1) * sc;
    const candleGlow = c.createRadialGradient(px, py - 3.5 * sc, 1, px, py - 3.5 * sc, 13 * sc);
    candleGlow.addColorStop(0, "rgba(255, 248, 196, 0.92)");
    candleGlow.addColorStop(0.5, "rgba(255, 192, 82, 0.45)");
    candleGlow.addColorStop(1, "rgba(255, 160, 60, 0)");
    c.fillStyle = candleGlow;
    c.beginPath();
    c.arc(px, py - 3.5 * sc, 13 * sc, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#FFB938";
    c.beginPath();
    c.moveTo(px - 2.1 * sc, py - 1.5 * sc);
    c.quadraticCurveTo(px - 2.4 * sc, py - flameH * 0.7, px, py - flameH - 1.5 * sc);
    c.quadraticCurveTo(px + 2.4 * sc, py - flameH * 0.7, px + 2.1 * sc, py - 1.5 * sc);
    c.closePath();
    c.fill();

    c.fillStyle = "#FFFDF2";
    c.beginPath();
    c.ellipse(px, py - 3.6 * sc, 1.1 * sc, 2.4 * sc, 0, 0, Math.PI * 2);
    c.fill();

    // 6. Front translucent lotus petals cradling the candle light
    const frontGrad = c.createLinearGradient(px, py - 8 * sc, px, py + 3 * sc);
    frontGrad.addColorStop(0, pal.tip);
    frontGrad.addColorStop(0.45, pal.inner);
    frontGrad.addColorStop(1, pal.outer);
    c.fillStyle = frontGrad;
    [-7.2, -2.4, 2.4, 7.2].forEach((dx) => {
      const tilt = dx * 0.05;
      const ph = (Math.abs(dx) < 4 ? 7.8 : 6.8) * sc;
      c.save();
      c.translate(px + dx * sc, py + 2.2 * sc);
      c.rotate(tilt);
      c.beginPath();
      c.moveTo(-3.4 * sc, 0);
      c.quadraticCurveTo(-3.8 * sc, -ph * 0.6, 0, -ph);
      c.quadraticCurveTo(3.8 * sc, -ph * 0.6, 3.4 * sc, 0);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    });

    // 7. Subtle tag for newly released lantern (first 14s) so the user immediately spots their lantern
    if (ownerLabel && ageMs < 14000) {
      const tagAlpha = ageMs > 11000 ? (14000 - ageMs) / 3000 : 1;
      c.globalAlpha = alpha * Math.max(0, tagAlpha);
      c.font = "700 8.5px 'Be Vietnam Pro', system-ui, sans-serif";
      const txt = isUser ? "Hoa đăng · Bạn" : ownerLabel.slice(0, 12);
      const tw = Math.max(46, c.measureText(txt).width + 10);
      const tx = Math.max(tw * 0.5 + 4, Math.min(w - tw * 0.5 - 4, px));
      const ty = py - 15 * sc;
      roundRectPath(c, tx - tw / 2, ty - 7, tw, 14, 7);
      c.fillStyle = isUser ? "rgba(176, 52, 34, 0.92)" : "rgba(24, 58, 44, 0.88)";
      c.fill();
      c.strokeStyle = "#FFE082";
      c.lineWidth = 0.9;
      c.stroke();
      c.fillStyle = "#FFFDF7";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(txt, tx, ty + 0.4);
    }

    c.restore();
  }

  function drawFloatingLotusLanterns(c, w, frame, tSec, nowMs) {
    // Prune lanterns past their 3-minute (180s) lifetime
    activePondLanterns = activePondLanterns.filter((it) => (it.expiresAt || 0) > nowMs);
    if (!activePondLanterns.length) return;

    const mapX = (nx) => frame.dx + nx * frame.dw;
    const mapY = (ny) => frame.dy + ny * frame.dh;
    const unitScale = frame.dw / 960;

    const live = activePondLanterns
      .map((it) => {
        const ageMs = Math.max(0, nowMs - (it.spawnAt || nowMs));
        const remMs = Math.max(0, (it.expiresAt || nowMs) - nowMs);
        // Gentle water current drift across the lotus pond
        const driftX = Math.sin(tSec * 0.34 + it.phase) * 0.016 + Math.min(0.035, ageMs * 0.00000022);
        const driftY = Math.cos(tSec * 0.28 + it.phase * 1.3) * 0.009;
        const nx = Math.max(0.08, Math.min(0.37, it.baseNx + driftX));
        const ny = Math.max(0.61, Math.min(0.92, it.baseNy + driftY));
        // Perspective scale: smaller near far pond edge (ny=0.61), larger in foreground (ny=0.92)
        const pScale = (0.72 + ((ny - 0.61) / 0.31) * 0.72) * Math.max(0.85, unitScale * 1.9);
        const fadeIn = Math.min(1, ageMs / 750);
        const fadeOut = remMs < 8000 ? remMs / 8000 : 1;
        return {
          it,
          nx,
          ny,
          pScale,
          alpha: fadeIn * fadeOut,
          ageMs
        };
      })
      .sort((a, b) => a.ny - b.ny);

    live.forEach((row) => {
      drawSingleLotusLantern(
        c,
        w,
        mapX(row.nx),
        mapY(row.ny),
        row.pScale,
        row.alpha,
        row.it.variant,
        tSec,
        row.ageMs,
        row.it.ownerName,
        row.it.isUser
      );
    });
  }

  function drawHangingTreePlaques(c, frame, tSec, nowMs) {
    activeTreePlaques = activeTreePlaques.filter((p) => nowMs - p.spawnAt < 300000);
    if (!activeTreePlaques.length) return;
    const mapX = (nx) => frame.dx + nx * frame.dw;
    const mapY = (ny) => frame.dy + ny * frame.dh;

    activeTreePlaques.forEach((pl) => {
      const px = mapX(pl.nx);
      const py = mapY(pl.ny);
      const sway = Math.sin(tSec * 2.1 + pl.phase) * 0.09;
      c.save();
      c.translate(px, py - 12);
      c.rotate(sway);
      // Red silk cord from tree branch
      c.strokeStyle = "#C92A22";
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 10);
      c.stroke();
      // Crimson-and-gold plaque body
      roundRectPath(c, -6.5, 10, 13, 21, 2.2);
      c.fillStyle = pl.isGold ? "#C88A1E" : "#A61E19";
      c.fill();
      c.strokeStyle = "#FFE082";
      c.lineWidth = 1.1;
      c.stroke();
      // Tiny gold ornament dot + bottom silk tassel
      c.fillStyle = "#FFE699";
      c.beginPath();
      c.arc(0, 16, 1.8, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#D4382C";
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(0, 31);
      c.lineTo(0, 37);
      c.stroke();
      c.restore();
    });
  }

  function renderSanctuaryFrame(tSec) {
    if (!canvasEl || !ctx || !containerEl) return;
    const nowMs = Date.now();
    updateAllWalkingTasks(nowMs);

    const w = Math.max(300, containerEl.clientWidth || 358);
    const h = Math.max(245, containerEl.clientHeight || 295);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvasEl.width !== Math.round(w * dpr) || canvasEl.height !== Math.round(h * dpr)) {
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    hitZones = [];

    const frame = drawCoverPhoto(ctx, w, h);
    const mapX = (nx) => frame.dx + nx * frame.dw;
    const mapY = (ny) => frame.dy + ny * frame.dh;

    const spaceIdx = Math.max(0, Math.min(2, Number(currentConfig && currentConfig.spaceIdx) || 0));
    const spSpec = getSpaceSpec();

    // Ánh sáng vật lý lung linh tùy theo từng không gian kiến trúc
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    if (cameraView === "wide") {
      if (spaceIdx === 0) {
        const haloBreath = 0.12 + Math.sin(tSec * 1.8) * 0.035;
        drawSoftLightBloom(ctx, mapX(0.50), mapY(0.32), frame.dw * 0.12, haloBreath, 255, 208, 112);
      } else if (spaceIdx === 1) {
        // Ánh nến & hoành phi sơn son thếp vàng ấm cúng trong Từ Đường
        const shrineGlow = 0.10 + Math.sin(tSec * 1.6) * 0.025;
        drawSoftLightBloom(ctx, mapX(0.50), mapY(0.36), frame.dw * 0.14, shrineGlow, 255, 192, 96);
      } else {
        // Nắng mai dịu nhẹ chiếu qua vườn trúc Vườn Thiền
        const mistGlow = 0.09 + Math.sin(tSec * 1.2) * 0.02;
        drawSoftLightBloom(ctx, mapX(0.50), mapY(0.34), frame.dw * 0.18, mistGlow, 255, 236, 178);
      }

      [
        [0.405, 0.402],
        [0.598, 0.402],
        [0.376, 0.422],
        [0.632, 0.422]
      ].forEach(([lx, ly], idx) => {
        const flk = 0.16 + Math.sin(tSec * 6.2 + idx * 1.9) * 0.045;
        drawSoftLightBloom(ctx, mapX(lx), mapY(ly), 20, flk, 255, 196, 92);
      });

      if (bellResonance > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.155), mapY(0.45), 65, bellResonance * 0.42, 255, 214, 120);
      }
      if (muyuPulse > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.815), mapY(0.53), 55, muyuPulse * 0.45, 255, 208, 110);
      }
    } else if (cameraView === "cushions") {
      if (spaceIdx === 0) {
        const haloBreath = 0.15 + Math.sin(tSec * 1.7) * 0.04;
        drawSoftLightBloom(ctx, mapX(0.505), mapY(0.245), frame.dw * 0.16, haloBreath, 255, 216, 128);
      } else if (spaceIdx === 1) {
        const tabletGlow = 0.12 + Math.sin(tSec * 1.7) * 0.03;
        drawSoftLightBloom(ctx, mapX(0.50), mapY(0.36), frame.dw * 0.15, tabletGlow, 255, 194, 96);
      }

      [
        [0.392, 0.752],
        [0.625, 0.752],
        [0.378, 0.446],
        [0.634, 0.446]
      ].forEach(([lx, ly], idx) => {
        const flk = 0.20 + Math.sin(tSec * 6.2 + idx * 2.1) * 0.05;
        drawSoftLightBloom(ctx, mapX(lx), mapY(ly), 28, flk, 255, 202, 104);
      });
    } else {
      extraTreeGlints.forEach((tg) => {
        const glintA = 0.14 + Math.max(0, Math.sin(tSec * 2.4 + tg.phase)) * 0.18;
        drawSoftLightBloom(ctx, mapX(tg.nx), mapY(tg.ny), 16, glintA, 255, 210, 115);
      });
    }

    dustMotes.forEach((dm) => {
      dm.ny += dm.vy;
      if (dm.ny < 0.08) dm.ny = 0.92;
      const mx = mapX(dm.nx + Math.sin(tSec * 0.9 + dm.phase) * 0.012);
      const my = mapY(dm.ny);
      const ma = 0.16 + Math.sin(tSec * 2.5 + dm.phase) * 0.10;
      ctx.fillStyle = `rgba(255, 228, 158, ${Math.max(0.04, ma)})`;
      ctx.beginPath();
      ctx.arc(mx, my, dm.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Làn khói hương trầm bay lên từ đỉnh lư hương
    if (cameraView === "wide") {
      drawRealisticIncenseSmoke(ctx, mapX(0.502), mapY(0.495), frame.dh * 0.22, tSec);
    } else if (cameraView === "cushions") {
      drawRealisticIncenseSmoke(ctx, mapX(0.505), mapY(0.655), frame.dh * 0.30, tSec);
    }

    const muyuTotal = Number(currentConfig && currentConfig.muyuCount) || 0;
    const shownLanterns = Number(currentConfig && currentConfig.lanternCount) || 18;
    const shownWishes = Number(currentConfig && currentConfig.totalWishCount) || 16;
    const fortuneCoolSec = Math.max(0, Number(currentConfig && currentConfig.fortuneCooldownSec) || 0);
    const wishCoolSec = Math.max(0, Number(currentConfig && currentConfig.wishCooldownSec) || 0);
    const fortunePillText = fortuneCoolSec > 0 ? `${spSpec.fortuneLabel} (${fortuneCoolSec}s)` : spSpec.fortuneLabel;

    if (cameraView === "wide") {
      // Vẽ 20 Chiếu Bồ Đoàn và các bác ngồi tĩnh tọa + bước đi hành lễ
      drawTwentyCushionsAndDevotees(ctx, w, h, frame, tSec, nowMs);

      // Nhãn dẫn hướng pháp khí theo từng không gian (kẹp biên chống cắt chữ)
      drawClampedHotspotPill(ctx, w, mapX(0.155), mapY(0.32), spSpec.bellLabel, bellResonance);
      drawClampedHotspotPill(ctx, w, mapX(0.502), mapY(0.46), spSpec.incenseLabel, incenseBoost);
      drawClampedHotspotPill(ctx, w, mapX(0.706), mapY(0.53), fortunePillText, fortunePulse);
      drawClampedHotspotPill(
        ctx,
        w,
        mapX(0.845),
        mapY(0.43),
        muyuTotal > 0 ? `${spSpec.muyuLabel} (${muyuTotal})` : `${spSpec.muyuLabel} +1`,
        muyuPulse
      );

      // Vùng chạm pháp khí trên ảnh Đại Sảnh
      hitZones.push({ kind: "bell", x: mapX(0.06), y: mapY(0.28), w: frame.dw * 0.18, h: frame.dh * 0.32 });
      hitZones.push({ kind: "incense", x: mapX(0.41), y: mapY(0.43), w: frame.dw * 0.18, h: frame.dh * 0.20 });
      hitZones.push({ kind: "peace_card", x: mapX(0.66), y: mapY(0.48), w: frame.dw * 0.09, h: frame.dh * 0.16 });
      hitZones.push({ kind: "muyu", x: mapX(0.76), y: mapY(0.44), w: frame.dw * 0.16, h: frame.dh * 0.19 });
    } else if (cameraView === "cushions") {
      drawClampedHotspotPill(ctx, w, mapX(0.145), mapY(0.74), spSpec.bellLabel, bellResonance);
      drawClampedHotspotPill(ctx, w, mapX(0.505), mapY(0.86), spSpec.incenseLabel, incenseBoost);
      drawClampedHotspotPill(ctx, w, mapX(0.722), mapY(0.68), fortunePillText, fortunePulse);
      drawClampedHotspotPill(
        ctx,
        w,
        mapX(0.865),
        mapY(0.57),
        muyuTotal > 0 ? `${spSpec.muyuLabel} (${muyuTotal})` : `${spSpec.muyuLabel} +1`,
        muyuPulse
      );

      hitZones.push({ kind: "bell", x: mapX(0.04), y: mapY(0.34), w: frame.dw * 0.22, h: frame.dh * 0.52 });
      hitZones.push({ kind: "incense", x: mapX(0.41), y: mapY(0.62), w: frame.dw * 0.19, h: frame.dh * 0.30 });
      hitZones.push({ kind: "peace_card", x: mapX(0.66), y: mapY(0.64), w: frame.dw * 0.11, h: frame.dh * 0.28 });
      hitZones.push({ kind: "muyu", x: mapX(0.77), y: mapY(0.56), w: frame.dw * 0.21, h: frame.dh * 0.34 });
    } else {
      // Vẽ Đèn Hoa Đăng trôi thực tế trên mặt hồ (tồn tại 3 phút) & Thẻ Đỏ đung đưa trên cành cây
      drawFloatingLotusLanterns(ctx, w, frame, tSec, nowMs);
      drawHangingTreePlaques(ctx, frame, tSec, nowMs);

      const livePondCount = activePondLanterns.length;
      const pondPillText =
        livePondCount > 0
          ? `${spSpec.pondLabel} (${livePondCount} đèn đang trôi)`
          : `${spSpec.pondLabel} · Chạm thả đèn`;
      const treePillText =
        wishCoolSec > 0
          ? `${spSpec.treeLabel} (${wishCoolSec}s)`
          : `${spSpec.treeLabel} (${shownWishes})`;

      drawClampedHotspotPill(ctx, w, mapX(0.24), mapY(0.87), pondPillText, livePondCount > 0 ? 0.35 : 0);
      drawClampedHotspotPill(ctx, w, mapX(0.79), mapY(0.54), treePillText, wishPulse);

      hitZones.push({ kind: "pond_lantern", x: mapX(0.02), y: mapY(0.54), w: frame.dw * 0.45, h: frame.dh * 0.42 });
      hitZones.push({ kind: "wish_plaque", x: mapX(0.60), y: mapY(0.22), w: frame.dw * 0.38, h: frame.dh * 0.58 });
    }

    // Vòng sóng âm đồng tâm
    for (let i = soundRipples.length - 1; i >= 0; i--) {
      const rp = soundRipples[i];
      rp.r += 2.0;
      rp.alpha -= 0.022;
      if (rp.alpha <= 0.02 || rp.r > rp.maxR) {
        soundRipples.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, rp.alpha);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.ellipse(mapX(rp.nx), mapY(rp.ny), rp.r, rp.r * 0.56, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Noti nổi nhỏ gọn bay lên ngay tại pháp khí rồi tự tan
    for (let i = floatingPopups.length - 1; i >= 0; i--) {
      const fp = floatingPopups[i];
      fp.ny -= fp.vy;
      fp.alpha -= 0.018;
      if (fp.alpha <= 0.02) {
        floatingPopups.splice(i, 1);
        continue;
      }
      const fx = Math.max(68, Math.min(w - 68, mapX(fp.nx)));
      const fy = Math.max(34, mapY(fp.ny));

      ctx.save();
      ctx.globalAlpha = Math.max(0, fp.alpha);
      ctx.font = "700 11.5px 'Be Vietnam Pro', system-ui, sans-serif";
      const boxW = Math.max(92, ctx.measureText(fp.title).width + 20);
      roundRectPath(ctx, fx - boxW / 2, fy - 11, boxW, 22, 11);
      ctx.fillStyle = "rgba(28, 14, 9, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "#F2C96B";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.fillStyle = "#FFE699";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fp.title, fx, fy + 0.5);
      ctx.restore();
    }

    // Hai huy hiệu mỏng gọn ở góc trên theo đúng tên không gian
    ctx.save();
    const seatedCount = seatActors.filter((a) => Boolean(a.occupant)).length;
    const leftText = `${spSpec.hallBadge} · ${seatedCount}/20 chiếu`;
    ctx.font = "600 10px 'Be Vietnam Pro', system-ui, sans-serif";
    const lw = Math.max(138, ctx.measureText(leftText).width + 26);
    roundRectPath(ctx, 8, 8, lw, 22, 11);
    ctx.fillStyle = "rgba(20, 11, 7, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 201, 107, 0.50)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const dotGlow = 0.65 + Math.sin(tSec * 3.6) * 0.3;
    ctx.fillStyle = `rgba(235, 87, 62, ${dotGlow})`;
    ctx.beginPath();
    ctx.arc(18, 19, 3.6, 0, Math.PI * 2);
    c_fill(ctx);

    ctx.fillStyle = "#FFFDF7";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(leftText, 26, 19.5);

    const totalMerit =
      muyuTotal +
      (Number(currentConfig && currentConfig.incenseCount) || 14) +
      shownLanterns +
      shownWishes;
    const meritLabel = `${spSpec.meritBadge}: ${totalMerit}`;
    const mw = Math.max(82, ctx.measureText(meritLabel).width + 18);
    roundRectPath(ctx, w - mw - 8, 8, mw, 22, 11);
    ctx.fillStyle = "rgba(44, 22, 10, 0.84)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 201, 107, 0.72)";
    ctx.stroke();
    ctx.fillStyle = "#FFE699";
    ctx.textAlign = "center";
    ctx.fillText(meritLabel, w - mw / 2 - 8, 19.5);
    ctx.restore();

    ctx.restore();

    if (bellResonance > 0.01) bellResonance *= 0.94;
    else bellResonance = 0;
    if (muyuPulse > 0.01) muyuPulse = Math.max(0, muyuPulse - 0.08);
    if (incenseBoost > 0.01) incenseBoost = Math.max(0, incenseBoost - 0.03);
    if (fortunePulse > 0.01) fortunePulse = Math.max(0, fortunePulse - 0.06);
    if (wishPulse > 0.01) wishPulse = Math.max(0, wishPulse - 0.06);
  }

  function c_fill(c) {
    c.fill();
  }

  function animateLoop(ts) {
    animId = requestAnimationFrame(animateLoop);
    if (ts - lastFrame < FPS_INTERVAL) return;
    lastFrame = ts;
    renderSanctuaryFrame(ts * 0.001);
  }

  function handleCanvasTap(clientX, clientY) {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = hitZones.length - 1; i >= 0; i--) {
      const hz = hitZones[i];
      if (x >= hz.x && x <= hz.x + hz.w && y >= hz.y && y <= hz.y + hz.h) {
        if (currentConfig && typeof currentConfig.onInteractiveAction === "function") {
          currentConfig.onInteractiveAction(hz.kind, hz.payload);
        } else {
          if (hz.kind === "muyu") triggerMuyu((Number(currentConfig && currentConfig.muyuCount) || 0) + 1);
          else if (hz.kind === "bell") triggerBell((currentConfig && currentConfig.userName) || "Chánh Điện");
          else if (hz.kind === "incense") triggerIncense((currentConfig && currentConfig.userName) || "Bác");
          else if (hz.kind === "pond_lantern") spawnPondLantern((currentConfig && currentConfig.userName) || "Bác");
          else if (hz.kind === "wish_plaque") spawnWishPlaque((currentConfig && currentConfig.userName) || "Bác", false);
          else if (hz.kind === "peace_card") triggerFortuneStick();
        }
        return;
      }
    }
  }

  function bindInteractiveGestures(el) {
    const startDrag = (clientX) => {
      isDragging = true;
      dragStartX = clientX;
      dragStartPan = panOffsetX;
      pointerMovedDist = 0;
    };
    const moveDrag = (clientX) => {
      if (!isDragging) return;
      const dx = clientX - dragStartX;
      pointerMovedDist = Math.max(pointerMovedDist, Math.abs(dx));
      panOffsetX = Math.max(-14, Math.min(14, dragStartPan + dx * 0.16));
    };
    const stopDrag = (clientX, clientY) => {
      if (!isDragging) return;
      isDragging = false;
      if (pointerMovedDist < 8 && typeof clientX === "number" && typeof clientY === "number") {
        handleCanvasTap(clientX, clientY);
      }
    };

    boundMouseMove = (e) => moveDrag(e.clientX);
    boundMouseUp = (e) => stopDrag(e.clientX, e.clientY);
    boundResize = () => renderSanctuaryFrame(typeof performance !== "undefined" ? performance.now() * 0.001 : 0);

    el.addEventListener("mousedown", (e) => startDrag(e.clientX));
    window.addEventListener("mousemove", boundMouseMove);
    window.addEventListener("mouseup", boundMouseUp);
    window.addEventListener("resize", boundResize);

    el.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches && e.touches.length === 1) startDrag(e.touches[0].clientX);
      },
      { passive: true }
    );
    el.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches && e.touches.length === 1) moveDrag(e.touches[0].clientX);
      },
      { passive: true }
    );
    el.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches && e.changedTouches[0];
        stopDrag(t ? t.clientX : undefined, t ? t.clientY : undefined);
      },
      { passive: true }
    );
  }

  function mount(container, config, onFallback) {
    const prevWalkSnapshot = seatActors.map((sa) => ({
      idx: sa.idx,
      isUser: Boolean(sa.isUser),
      walkTask: sa.walkTask
    }));
    dispose();
    containerEl = container;
    currentConfig = config || {};
    cameraView = (config && config.cameraView) || cameraView || "wide";
    autoMuyuPinned = Boolean(config && config.autoMuyuActive);
    mode = config && config.preferredRender === "2.5d" ? "2.5d" : "3d";
    panOffsetX = 0;

    if (!containerEl) return;

    try {
      ensureImagesLoaded();
      containerEl.innerHTML = "";
      canvasEl = document.createElement("canvas");
      canvasEl.className = "temple-canvas";
      canvasEl.style.cursor = "pointer";
      containerEl.appendChild(canvasEl);

      tagsLayerEl = document.createElement("div");
      tagsLayerEl.className = "stage-overlay-tags";
      containerEl.appendChild(tagsLayerEl);

      ctx = canvasEl.getContext("2d");
      renderer = {
        dispose() {
          ctx = null;
        }
      };

      initAtmosphericParticles();
      syncActiveLanternsFromConfig(currentConfig);
      // Khôi phục hành trình đi bộ nếu cùng vai trò trên đúng chiếu
      prevWalkSnapshot.forEach((snap) => {
        if (snap.walkTask) {
          const found = seatActors.find((a) => a.idx === snap.idx);
          if (found && found.occupant && Boolean(found.isUser) === snap.isUser) {
            found.walkTask = snap.walkTask;
          }
        }
      });

      bindInteractiveGestures(canvasEl);
      renderSanctuaryFrame(0);

      lastFrame = 0;
      animId = requestAnimationFrame(animateLoop);
    } catch (err) {
      if (typeof onFallback === "function") onFallback(err);
    }
  }

  function updateConfig(partialCfg) {
    if (!partialCfg) return;
    currentConfig = Object.assign({}, currentConfig || {}, partialCfg);
    if (typeof partialCfg.spaceIdx === "number") {
      ensureImagesLoaded();
    }
    if (typeof partialCfg.cameraView === "string") {
      cameraView = partialCfg.cameraView;
    }
    if (typeof partialCfg.autoMuyuActive === "boolean") {
      autoMuyuPinned = partialCfg.autoMuyuActive;
    }
    if (Array.isArray(partialCfg.activeLanterns)) {
      syncActiveLanternsFromConfig(currentConfig);
    }
    rebuildTwentySeatActors();
  }

  function setCameraView(viewMode) {
    cameraView = viewMode || "wide";
    panOffsetX = 0;
    renderSanctuaryFrame(typeof performance !== "undefined" ? performance.now() * 0.001 : 0);
  }

  function getCameraView() {
    return cameraView;
  }

  function setAutoMuyuMode(active) {
    autoMuyuPinned = Boolean(active);
    const userActor = seatActors.find((a) => a.isUser);
    if (!userActor) return;
    if (autoMuyuPinned) {
      startActorRitualWalk(userActor.idx, "muyu", null, true);
    } else if (userActor.walkTask && userActor.walkTask.stationKey === "muyu") {
      userActor.walkTask.pinned = false;
      userActor.walkTask.phase = "walk_back";
      userActor.walkTask.phaseStartedAt = Date.now();
    }
  }

  function findActorIndexBySpeaker(speakerName, preferredCushionIdx) {
    const userActor = seatActors.find((a) => a.isUser);
    const fallbackUserIdx = userActor ? userActor.idx : 2;
    const baseClean = String(speakerName || "").split("·")[0].trim().toLowerCase();
    if (!baseClean) return fallbackUserIdx;

    const myClean = String((currentConfig && currentConfig.userName) || "").split("·")[0].trim().toLowerCase();
    if (myClean && baseClean === myClean) {
      return fallbackUserIdx;
    }

    const matched = seatActors.find((a) => {
      if (!a.occupant) return false;
      const occClean = String(a.occupant.name || "").split("·")[0].trim().toLowerCase();
      return Boolean(occClean && (occClean === baseClean || occClean.includes(baseClean) || baseClean.includes(occClean)));
    });
    if (matched) return matched.idx;

    if (typeof preferredCushionIdx === "number" && Number.isFinite(preferredCushionIdx)) {
      const prefIdx = Math.max(0, Math.min(19, Math.floor(preferredCushionIdx)));
      const prefActor = seatActors.find((a) => a.idx === prefIdx);
      if (prefActor && prefActor.occupant && !prefActor.isUser) {
        return prefActor.idx;
      }
    }

    const peerIdle =
      seatActors.find((a) => a.occupant && !a.isUser && !a.walkTask) ||
      seatActors.find((a) => a.occupant && !a.isUser);
    return peerIdle ? peerIdle.idx : fallbackUserIdx;
  }

  function triggerIncense(speakerName, preferredCushionIdx) {
    if (currentConfig) {
      currentConfig.incenseCount = (Number(currentConfig.incenseCount) || 14) + 1;
    }
    const actorIdx = findActorIndexBySpeaker(speakerName, preferredCushionIdx);
    const fireFx = () => {
      incenseBoost = 1.0;
      const ry = cameraView === "cushions" ? 0.68 : 0.50;
      pushSoundRipple(0.502, ry, "rgba(255, 224, 140, 0.9)", 68);
      pushFloatingToast(0.502, ry - 0.08, "Dâng Hương Tâm Thành");
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "incense", fireFx, false);
    } else {
      fireFx();
    }
  }

  function triggerMuyu(count) {
    const nextCnt = count || (Number(currentConfig && currentConfig.muyuCount) || 0) + 1;
    if (currentConfig) {
      currentConfig.muyuCount = nextCnt;
    }
    const userActor = seatActors.find((a) => a.isUser);
    const actorIdx = userActor ? userActor.idx : 2;
    const fireFx = () => {
      muyuPulse = 1.0;
      const rx = cameraView === "cushions" ? 0.85 : cameraView === "courtyard" ? 0.5 : 0.815;
      const ry = cameraView === "cushions" ? 0.68 : cameraView === "courtyard" ? 0.45 : 0.50;
      pushSoundRipple(rx, ry, "rgba(255, 224, 140, 0.88)", 58);
      pushFloatingToast(rx, ry - 0.08, `+1 Tâm An (${nextCnt})`);
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "muyu", fireFx, autoMuyuPinned);
    } else {
      fireFx();
    }
  }

  function triggerBell(speakerName, preferredCushionIdx) {
    const actorIdx = findActorIndexBySpeaker(speakerName, preferredCushionIdx);
    const fireFx = () => {
      bellResonance = 1.0;
      const rx = cameraView === "cushions" ? 0.15 : cameraView === "courtyard" ? 0.5 : 0.155;
      const ry = cameraView === "cushions" ? 0.56 : cameraView === "courtyard" ? 0.42 : 0.45;
      pushSoundRipple(rx, ry, "rgba(255, 220, 130, 0.92)", 95);
      pushFloatingToast(rx + 0.06, ry - 0.08, "Đại Hồng Chung Ngân Vang");
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "bell", fireFx, false);
    } else {
      fireFx();
    }
  }

  function triggerFortuneStick(cardCode) {
    const userActor = seatActors.find((a) => a.isUser);
    const actorIdx = userActor ? userActor.idx : 2;
    const fireFx = () => {
      fortunePulse = 1.0;
      const rx = cameraView === "cushions" ? 0.72 : 0.72;
      const ry = cameraView === "cushions" ? 0.74 : 0.55;
      pushSoundRipple(rx, ry, "rgba(255, 220, 130, 0.9)", 54);
      pushFloatingToast(rx - 0.05, ry - 0.10, cardCode || "Quẻ Thiện Lành");
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "peace_card", fireFx, false);
    } else {
      fireFx();
    }
  }

  function spawnWishPlaque(speakerName, isVeteranGold, wishText, preferredCushionIdx) {
    if (currentConfig) {
      currentConfig.totalWishCount = (Number(currentConfig.totalWishCount) || 16) + 1;
    }
    const slotIdx = activeTreePlaques.length;
    const pNx = 0.67 + ((slotIdx * 0.067) % 0.24);
    const pNy = 0.36 + ((slotIdx * 0.043) % 0.14);
    activeTreePlaques.push({
      id: `plq_${Date.now()}_${slotIdx}`,
      isGold: Boolean(isVeteranGold),
      nx: pNx,
      ny: pNy,
      phase: slotIdx * 1.25,
      spawnAt: Date.now()
    });
    if (activeTreePlaques.length > 14) activeTreePlaques.shift();

    extraTreeGlints.push({
      nx: pNx,
      ny: pNy,
      phase: extraTreeGlints.length * 1.1
    });
    if (extraTreeGlints.length > 9) extraTreeGlints.shift();

    const actorIdx = findActorIndexBySpeaker(speakerName, preferredCushionIdx);
    const fireFx = () => {
      wishPulse = 1.0;
      const rx = cameraView === "courtyard" ? pNx : 0.502;
      const ry = cameraView === "courtyard" ? pNy : 0.50;
      pushSoundRipple(rx, ry, "rgba(255, 196, 120, 0.9)", 70);
      pushFloatingToast(rx, ry - 0.08, isVeteranGold ? "+1 Thẻ Vàng Cầu An" : "+1 Thẻ Đỏ Cầu An");
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "incense", fireFx, false);
    } else {
      fireFx();
    }
  }

  function spawnPondLantern(speakerName, preferredCushionIdx, lanternMeta) {
    if (currentConfig) {
      currentConfig.lanternCount = (Number(currentConfig.lanternCount) || 18) + 1;
    }
    const now = Date.now();
    const idx = activePondLanterns.length;
    const meta = lanternMeta || {};
    const myClean = String((currentConfig && currentConfig.userName) || "").split("·")[0].trim().toLowerCase();
    const spkClean = String(speakerName || "").split("·")[0].trim().toLowerCase();
    const isUser = typeof meta.isUser === "boolean" ? meta.isUser : Boolean(myClean && spkClean === myClean);

    // Distribute floating lotus lanterns harmoniously across the pond water surface
    const pondSlots = [
      [0.24, 0.80],
      [0.17, 0.74],
      [0.30, 0.73],
      [0.14, 0.84],
      [0.27, 0.66],
      [0.21, 0.88],
      [0.19, 0.65],
      [0.32, 0.81]
    ];
    const picked = pondSlots[idx % pondSlots.length];
    const jitterX = (((idx * 29) % 7) - 3) * 0.008;
    const jitterY = (((idx * 17) % 5) - 2) * 0.008;
    const baseNx = typeof meta.baseNx === "number" ? meta.baseNx : Math.max(0.10, Math.min(0.35, picked[0] + jitterX));
    const baseNy = typeof meta.baseNy === "number" ? meta.baseNy : Math.max(0.63, Math.min(0.90, picked[1] + jitterY));
    const variants = ["pink", "gold", "coral"];
    const entry = {
      id: meta.id || `ltn_${now}_${idx}`,
      ownerName: speakerName || "Bác",
      isUser,
      spawnAt: meta.spawnAt || now,
      expiresAt: meta.expiresAt || now + LANTERN_TTL_MS,
      baseNx,
      baseNy,
      phase: typeof meta.phase === "number" ? meta.phase : idx * 1.45,
      variant: meta.variant || variants[idx % variants.length]
    };
    activePondLanterns = activePondLanterns.filter((it) => it.id !== entry.id && (it.expiresAt || 0) > now);
    activePondLanterns.push(entry);
    if (activePondLanterns.length > 16) activePondLanterns.shift();

    const actorIdx = findActorIndexBySpeaker(speakerName, preferredCushionIdx);
    const fireFx = () => {
      const rx = cameraView === "courtyard" ? baseNx : 0.502;
      const ry = cameraView === "courtyard" ? baseNy : 0.50;
      pushSoundRipple(rx, ry, "rgba(180, 245, 232, 0.88)", 72);
      pushFloatingToast(rx, ry - 0.10, "+1 Hoa Đăng Bình An (3 phút)");
    };
    if (cameraView === "wide") {
      startActorRitualWalk(actorIdx, "incense", fireFx, false);
    } else {
      fireFx();
    }
    return entry;
  }

  function dispose() {
    if (boundMouseMove) {
      window.removeEventListener("mousemove", boundMouseMove);
      boundMouseMove = null;
    }
    if (boundMouseUp) {
      window.removeEventListener("mouseup", boundMouseUp);
      boundMouseUp = null;
    }
    if (boundResize) {
      window.removeEventListener("resize", boundResize);
      boundResize = null;
    }
    isDragging = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    smokeWisps = [];
    dustMotes = [];
    soundRipples = [];
    floatingPopups = [];
    hitZones = [];

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry && typeof obj.geometry.dispose === "function") {
          obj.geometry.dispose();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m && typeof m.dispose === "function") m.dispose();
          });
        }
      });
      scene = null;
    }
    if (renderer) {
      try {
        renderer.dispose();
      } catch (e) { }
      renderer = null;
    }
    ctx = null;
    canvasEl = null;
    tagsLayerEl = null;
  }

  if (typeof window !== "undefined") {
    setTimeout(() => {
      try {
        ensureImagesLoaded();
      } catch (e) { }
    }, 320);
  }

  return {
    CUSHION_COORDS,
    mount,
    updateConfig,
    setCameraView,
    getCameraView,
    setAutoMuyuMode,
    triggerIncense,
    triggerMuyu,
    triggerBell,
    triggerFortuneStick,
    spawnWishPlaque,
    spawnPondLantern,
    dispose
  };
})();
