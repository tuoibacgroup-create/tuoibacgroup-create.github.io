window.TempleScene3D = (function () {
  // ============================================================================
  // CHÁNH ĐIỆN & SÂN CHÙA CỔ VIỆT NAM — BỘ KẾT HỢP ẢNH KIẾN TRÚC THẬT & ÁNH SÁNG SỐNG
  // Thiết kế trang nghiêm, chân thực dành riêng cho người cao tuổi (55+):
  // - Nền nhiếp ảnh kiến trúc chùa cổ Bắc Bộ sắc nét (Chánh Điện, Cận cảnh Tam Bảo, Sân Hồ Sen & Cây Bồ Đề)
  // - Hiệu ứng vật lý tinh tế: khói trầm hương uốn lượn mềm mại, ánh đèn dầu lung linh, sóng âm chuông/mõ
  // - Vùng chạm trực tiếp chính xác lên Đại Hồng Chung, Lư Hương, Mõ Gỗ, Ống Xăm, Hồ Sen, Cây Thẻ Đỏ & Bồ Đoàn
  // - Hoàn toàn không dùng hình vẽ hoạt hình trẻ con hay nhãn chữ đè chồng chéo lên Tam Bảo
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
  let activeTicker = null;

  const SCENE_IMAGES = {
    wide: "./assets/temple-wide.jpg",
    cushions: "./assets/temple-altar.jpg",
    courtyard: "./assets/temple-courtyard.jpg"
  };

  const imgCache = {};

  const CUSHION_COORDS = [
    { idx: 0, row: 0, x: -2.9, z: 0.55 },
    { idx: 1, row: 0, x: -1.45, z: 0.55 },
    { idx: 2, row: 0, x: 0.0, z: 0.55 },
    { idx: 3, row: 0, x: 1.45, z: 0.55 },
    { idx: 4, row: 0, x: 2.9, z: 0.55 },
    { idx: 5, row: 1, x: -2.9, z: 2.15 },
    { idx: 6, row: 1, x: -1.45, z: 2.15 },
    { idx: 7, row: 1, x: 0.0, z: 2.15 },
    { idx: 8, row: 1, x: 1.45, z: 2.15 },
    { idx: 9, row: 1, x: 2.9, z: 2.15 }
  ];

  // Tọa độ khớp chính xác với 2 hàng chiếu cói thật trên ảnh temple-wide.jpg
  const PHOTO_MAT_SPOTS = [
    { idx: 0, nx: 0.378, ny: 0.768, rx: 0.042, ry: 0.018 },
    { idx: 1, nx: 0.358, ny: 0.806, rx: 0.050, ry: 0.022 },
    { idx: 2, nx: 0.334, ny: 0.858, rx: 0.058, ry: 0.026 },
    { idx: 3, nx: 0.295, ny: 0.928, rx: 0.068, ry: 0.032 },
    { idx: 4, nx: 0.245, ny: 0.985, rx: 0.072, ry: 0.030 },
    { idx: 5, nx: 0.620, ny: 0.768, rx: 0.042, ry: 0.018 },
    { idx: 6, nx: 0.642, ny: 0.806, rx: 0.050, ry: 0.022 },
    { idx: 7, nx: 0.666, ny: 0.858, rx: 0.058, ry: 0.026 },
    { idx: 8, nx: 0.698, ny: 0.928, rx: 0.068, ry: 0.032 },
    { idx: 9, nx: 0.742, ny: 0.985, rx: 0.072, ry: 0.030 }
  ];

  function ensureImagesLoaded() {
    if (typeof Image === "undefined") return;
    Object.keys(SCENE_IMAGES).forEach((key) => {
      if (imgCache[key]) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        imgCache[key].loaded = true;
        renderSanctuaryFrame(performance ? performance.now() * 0.001 : 0);
      };
      img.onerror = () => {
        imgCache[key].failed = true;
      };
      imgCache[key] = { img, loaded: false, failed: false };
      img.src = SCENE_IMAGES[key];
    });
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

  function initAtmosphericParticles() {
    smokeWisps = [];
    for (let i = 0; i < 22; i++) {
      smokeWisps.push({
        progress: i / 22,
        speed: 0.0028 + (i % 5) * 0.00045,
        driftSeed: i * 1.37,
        spread: (i % 3 - 1) * 0.004,
        radiusBase: 5 + (i % 4) * 3.5
      });
    }

    dustMotes = [];
    for (let i = 0; i < 18; i++) {
      dustMotes.push({
        nx: 0.12 + ((i * 37) % 76) / 100,
        ny: 0.14 + ((i * 53) % 72) / 100,
        vy: -0.00045 - (i % 4) * 0.00018,
        phase: i * 0.9,
        size: 1.1 + (i % 3) * 0.65
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

    const wishes = (currentConfig && currentConfig.wishes) || [];
    if (wishes.length > 0) {
      activeTicker = {
        speaker: wishes[0].userName || "Đạo hữu",
        text: wishes[0].prayerText || "Cầu gia đạo bình an, thân tâm thường an lạc."
      };
    } else {
      activeTicker = {
        speaker: (currentConfig && currentConfig.userName) || "Đạo tràng Tuổi Bạc",
        text: "Chạm trực tiếp vào Chuông đồng, Lư hương, Mõ gỗ, Ống xăm hoặc Hồ sen trên ảnh để hành lễ."
      };
    }
  }

  function pushSoundRipple(nx, ny, colorStr, maxR) {
    soundRipples.push({
      nx,
      ny,
      r: 8,
      maxR: maxR || 86,
      alpha: 0.78,
      color: colorStr || "rgba(255, 222, 138, 0.9)"
    });
    if (soundRipples.length > 8) soundRipples.shift();
  }

  function pushFloatingToast(nx, ny, title, subtitle) {
    floatingPopups.push({
      nx,
      ny,
      vy: 0.0028,
      title: String(title || "+1 Tâm An"),
      subtitle: subtitle ? String(subtitle).slice(0, 28) : "",
      alpha: 1.0
    });
    if (floatingPopups.length > 6) floatingPopups.shift();
  }

  function drawCoverPhoto(c, w, h) {
    const viewKey = cameraView === "cushions" ? "cushions" : cameraView === "courtyard" ? "courtyard" : "wide";
    const entry = imgCache[viewKey];

    if (entry && entry.loaded && entry.img && entry.img.naturalWidth > 0) {
      const iw = entry.img.naturalWidth;
      const ih = entry.img.naturalHeight;
      // Phóng nhẹ 1.05x để hỗ trợ kéo lia ngang mượt mà không hở viền
      const scale = Math.max(w / iw, h / ih) * 1.05;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) * 0.5 + panOffsetX;
      const dy = (h - dh) * 0.5;
      c.drawImage(entry.img, dx, dy, dw, dh);
      return { dx, dy, dw, dh, ready: true };
    }

    // Nền chuyển sắc trang nhã trong vài chục mili-giây chờ ảnh tải lần đầu
    const fallbackGrad = c.createLinearGradient(0, 0, 0, h);
    fallbackGrad.addColorStop(0, "#1E120C");
    fallbackGrad.addColorStop(0.55, "#382115");
    fallbackGrad.addColorStop(1, "#523220");
    c.fillStyle = fallbackGrad;
    c.fillRect(0, 0, w, h);
    return { dx: 0, dy: 0, dw: w, dh: h, ready: false };
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
        Math.sin(p * 5.2 - tSec * 1.45 + sp.driftSeed) * (4 + p * 15);
      const envAlpha = Math.sin(p * Math.PI) * (incenseBoost > 0 ? 0.16 : 0.095);
      const rad = sp.radiusBase * (0.45 + p * 1.65);

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

  function drawSubtleHotspotHint(c, px, py, labelText, pulseStrength) {
    c.save();
    c.font = "600 10.5px 'Be Vietnam Pro', system-ui, sans-serif";
    const tw = Math.max(58, c.measureText(labelText).width + 18);
    const th = 20;
    roundRectPath(c, px - tw / 2, py - th / 2, tw, th, 10);
    c.fillStyle = pulseStrength > 0 ? "rgba(122, 46, 18, 0.92)" : "rgba(24, 14, 9, 0.74)";
    c.fill();
    c.strokeStyle = pulseStrength > 0 ? "#FFE082" : "rgba(242, 204, 126, 0.62)";
    c.lineWidth = pulseStrength > 0 ? 1.4 : 1;
    c.stroke();

    c.fillStyle = "#FFF8E7";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(labelText, px, py + 0.5);
    c.restore();
  }

  function renderSanctuaryFrame(tSec) {
    if (!canvasEl || !ctx || !containerEl) return;
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

    // 1. Vẽ nền nhiếp ảnh Chùa Cổ Việt Nam sắc nét
    const frame = drawCoverPhoto(ctx, w, h);
    const mapX = (nx) => frame.dx + nx * frame.dw;
    const mapY = (ny) => frame.dy + ny * frame.dh;

    // Phủ lớp sắc thái ánh sáng nhẹ theo Không gian tĩnh tâm (Sân Chùa / Nhà Thờ Họ / Vườn Thiền)
    const spaceIdx = Number(currentConfig && currentConfig.spaceIdx) || 0;
    if (spaceIdx === 1) {
      ctx.fillStyle = "rgba(88, 42, 12, 0.10)";
      ctx.fillRect(0, 0, w, h);
    } else if (spaceIdx === 2) {
      ctx.fillStyle = "rgba(18, 52, 48, 0.10)";
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Lớp ánh sáng vật lý lung linh (Screen Blend) & Khói hương lụa thật
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    if (cameraView === "wide") {
      // Hào quang ấm sau tượng Phật & 4 ngọn đèn dầu trên bàn thờ Tam Bảo
      const haloBreath = 0.12 + Math.sin(tSec * 1.8) * 0.035;
      drawSoftLightBloom(ctx, mapX(0.50), mapY(0.42), frame.dw * 0.13, haloBreath, 255, 208, 112);

      [
        [0.443, 0.508],
        [0.560, 0.508],
        [0.396, 0.476],
        [0.610, 0.476]
      ].forEach(([lx, ly], idx) => {
        const flk = 0.18 + Math.sin(tSec * 6.5 + idx * 1.9) * 0.05;
        drawSoftLightBloom(ctx, mapX(lx), mapY(ly), 22, flk, 255, 196, 92);
      });

      if (bellResonance > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.108), mapY(0.53), 68, bellResonance * 0.45, 255, 214, 120);
      }
      if (muyuPulse > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.698), mapY(0.625), 52, muyuPulse * 0.45, 255, 208, 110);
      }
    } else if (cameraView === "cushions") {
      // Hào quang tròn sau Đức Phật & đôi đèn dầu lưu ly cận cảnh
      const haloBreath = 0.15 + Math.sin(tSec * 1.7) * 0.04;
      drawSoftLightBloom(ctx, mapX(0.505), mapY(0.245), frame.dw * 0.16, haloBreath, 255, 216, 128);

      [
        [0.392, 0.752],
        [0.625, 0.752],
        [0.378, 0.446],
        [0.634, 0.446]
      ].forEach(([lx, ly], idx) => {
        const flk = 0.22 + Math.sin(tSec * 6.2 + idx * 2.1) * 0.06;
        drawSoftLightBloom(ctx, mapX(lx), mapY(ly), 30, flk, 255, 202, 104);
      });

      if (bellResonance > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.145), mapY(0.58), 80, bellResonance * 0.45, 255, 214, 120);
      }
      if (muyuPulse > 0.01) {
        drawSoftLightBloom(ctx, mapX(0.865), mapY(0.71), 68, muyuPulse * 0.48, 255, 208, 110);
      }
    } else {
      // Góc Sân Chùa: Ánh sáng Hoa Đăng lung linh trên mặt Hồ Sen & đốm sáng trên Cây Thẻ Đỏ
      [
        [0.208, 0.892],
        [0.300, 0.888],
        [0.332, 0.795],
        [0.405, 0.680]
      ].forEach(([lx, ly], idx) => {
        const flk = 0.24 + Math.sin(tSec * 4.8 + idx * 1.7) * 0.07;
        drawSoftLightBloom(ctx, mapX(lx), mapY(ly), 26, flk, 255, 190, 110);
      });

      extraPondLights.forEach((pl, idx) => {
        const driftX = pl.nx + Math.sin(tSec * 0.45 + pl.phase) * 0.018;
        const driftY = pl.ny + Math.cos(tSec * 0.38 + pl.phase) * 0.012;
        const glowA = 0.26 + Math.sin(tSec * 3.6 + idx) * 0.07;
        drawSoftLightBloom(ctx, mapX(driftX), mapY(driftY), 18, glowA, 255, 176, 125);
      });

      extraTreeGlints.forEach((tg, idx) => {
        const glintA = 0.14 + Math.max(0, Math.sin(tSec * 2.4 + tg.phase)) * 0.18;
        drawSoftLightBloom(ctx, mapX(tg.nx), mapY(tg.ny), 16, glintA, 255, 210, 115);
      });
    }

    // Hạt bụi vàng li ti bay nhẹ trong nắng / ánh nến Chánh Điện
    dustMotes.forEach((dm) => {
      dm.ny += dm.vy;
      if (dm.ny < 0.08) dm.ny = 0.92;
      const mx = mapX(dm.nx + Math.sin(tSec * 0.9 + dm.phase) * 0.012);
      const my = mapY(dm.ny);
      const ma = 0.18 + Math.sin(tSec * 2.5 + dm.phase) * 0.12;
      ctx.fillStyle = `rgba(255, 228, 158, ${Math.max(0.04, ma)})`;
      ctx.beginPath();
      ctx.arc(mx, my, dm.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Làn khói hương trầm mảnh mai bay lên từ đúng đỉnh 3 nén hương trong ảnh thật
    if (cameraView === "wide") {
      drawRealisticIncenseSmoke(ctx, mapX(0.504), mapY(0.562), frame.dh * 0.22, tSec);
    } else if (cameraView === "cushions") {
      drawRealisticIncenseSmoke(ctx, mapX(0.505), mapY(0.655), frame.dh * 0.30, tSec);
    }

    // 4. Vùng tương tác trực tiếp & Nhãn dẫn hướng tinh gọn (Không bao giờ đè lên tượng Phật)
    const muyuTotal = Number(currentConfig && currentConfig.muyuCount) || 0;
    const shownLanterns = Number(currentConfig && currentConfig.lanternCount) || 18;
    const shownWishes = Number(currentConfig && currentConfig.totalWishCount) || 16;
    const userCushionIdx = Math.max(0, Math.min(9, Number(currentConfig && currentConfig.userCushionIdx) || 2));

    if (cameraView === "wide") {
      // Viền sáng lụa vàng dịu quanh đúng chiếc chiếu cói Bồ Đoàn mà bác đang chọn ngồi
      const spot = PHOTO_MAT_SPOTS[userCushionIdx] || PHOTO_MAT_SPOTS[2];
      const sx = mapX(spot.nx);
      const sy = mapY(spot.ny);
      const srx = spot.rx * frame.dw;
      const sry = spot.ry * frame.dh;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(sx, sy, srx * 1.08, sry * 1.18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 220, 120, 0.88)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      drawSubtleHotspotHint(ctx, sx, Math.min(h - 38, sy - sry - 10), `BĐ${userCushionIdx + 1} · Chỗ của bác`, 0);
      drawSubtleHotspotHint(ctx, mapX(0.115), mapY(0.655), "Chuông đồng", bellResonance);
      drawSubtleHotspotHint(ctx, mapX(0.504), mapY(0.745), "Dâng hương", incenseBoost);
      drawSubtleHotspotHint(
        ctx,
        mapX(0.715),
        mapY(0.555),
        muyuTotal > 0 ? `Gõ mõ (${muyuTotal})` : "Gõ mõ +1",
        muyuPulse
      );

      // Đăng ký vùng chạm trên ảnh Toàn Cảnh
      hitZones.push({ kind: "bell", x: mapX(0.04), y: mapY(0.36), w: frame.dw * 0.16, h: frame.dh * 0.36 });
      hitZones.push({ kind: "incense", x: mapX(0.42), y: mapY(0.53), w: frame.dw * 0.17, h: frame.dh * 0.24 });
      hitZones.push({ kind: "muyu", x: mapX(0.63), y: mapY(0.54), w: frame.dw * 0.15, h: frame.dh * 0.17 });
      hitZones.push({ kind: "peace_card", x: mapX(0.66), y: mapY(0.69), w: frame.dw * 0.11, h: frame.dh * 0.15 });

      PHOTO_MAT_SPOTS.forEach((ms) => {
        const cx = mapX(ms.nx);
        const cy = mapY(ms.ny);
        const rw = ms.rx * frame.dw * 1.25;
        const rh = ms.ry * frame.dh * 1.45;
        hitZones.push({
          kind: "select_cushion",
          payload: ms.idx,
          x: cx - rw,
          y: cy - rh,
          w: rw * 2,
          h: rh * 2
        });
      });
    } else if (cameraView === "cushions") {
      drawSubtleHotspotHint(ctx, mapX(0.145), mapY(0.74), "Thỉnh chuông", bellResonance);
      drawSubtleHotspotHint(ctx, mapX(0.505), mapY(0.86), "Dâng hương", incenseBoost);
      drawSubtleHotspotHint(ctx, mapX(0.722), mapY(0.68), "Ống xăm", fortunePulse);
      drawSubtleHotspotHint(
        ctx,
        mapX(0.865),
        mapY(0.57),
        muyuTotal > 0 ? `Gõ mõ (${muyuTotal})` : "Gõ mõ +1",
        muyuPulse
      );

      hitZones.push({ kind: "bell", x: mapX(0.04), y: mapY(0.34), w: frame.dw * 0.22, h: frame.dh * 0.52 });
      hitZones.push({ kind: "incense", x: mapX(0.41), y: mapY(0.62), w: frame.dw * 0.19, h: frame.dh * 0.30 });
      hitZones.push({ kind: "peace_card", x: mapX(0.67), y: mapY(0.68), w: frame.dw * 0.10, h: frame.dh * 0.26 });
      hitZones.push({ kind: "muyu", x: mapX(0.77), y: mapY(0.56), w: frame.dw * 0.21, h: frame.dh * 0.34 });
    } else {
      drawSubtleHotspotHint(ctx, mapX(0.24), mapY(0.82), `Hồ Sen (${shownLanterns} đèn)`, 0);
      drawSubtleHotspotHint(ctx, mapX(0.79), mapY(0.54), `Cây Thẻ Đỏ (${shownWishes})`, 0);

      hitZones.push({ kind: "pond_lantern", x: mapX(0.02), y: mapY(0.54), w: frame.dw * 0.45, h: frame.dh * 0.42 });
      hitZones.push({ kind: "wish_plaque", x: mapX(0.60), y: mapY(0.22), w: frame.dw * 0.38, h: frame.dh * 0.58 });
    }

    // 5. Vòng sóng âm vàng kim lan nhẹ khi thỉnh chuông / gõ mõ / thả đèn
    for (let i = soundRipples.length - 1; i >= 0; i--) {
      const rp = soundRipples[i];
      rp.r += 2.1;
      rp.alpha -= 0.022;
      if (rp.alpha <= 0.02 || rp.r > rp.maxR) {
        soundRipples.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, rp.alpha);
      ctx.strokeStyle = rp.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(mapX(rp.nx), mapY(rp.ny), rp.r, rp.r * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Thẻ thông báo công đức / tâm an bay lên trang nhã
    for (let i = floatingPopups.length - 1; i >= 0; i--) {
      const fp = floatingPopups[i];
      fp.ny -= fp.vy;
      fp.alpha -= 0.017;
      if (fp.alpha <= 0.02) {
        floatingPopups.splice(i, 1);
        continue;
      }
      const fx = Math.max(76, Math.min(w - 76, mapX(fp.nx)));
      const fy = Math.max(36, mapY(fp.ny));

      ctx.save();
      ctx.globalAlpha = Math.max(0, fp.alpha);
      ctx.font = "700 12.5px 'Be Vietnam Pro', system-ui, sans-serif";
      const boxW = Math.max(106, ctx.measureText(fp.title).width + 24);
      const boxH = fp.subtitle ? 34 : 24;
      roundRectPath(ctx, fx - boxW / 2, fy - boxH / 2, boxW, boxH, 12);
      ctx.fillStyle = "rgba(32, 16, 10, 0.90)";
      ctx.fill();
      ctx.strokeStyle = "#F2C96B";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = "#FFE699";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fp.title, fx, fp.subtitle ? fy - 6 : fy + 0.5);

      if (fp.subtitle) {
        ctx.fillStyle = "#F7EFE2";
        ctx.font = "500 10px 'Be Vietnam Pro', system-ui, sans-serif";
        ctx.fillText(fp.subtitle, fx, fy + 8.5);
      }
      ctx.restore();
    }

    // 7. Thanh trạng thái Phiên Hành Lễ Trực Tuyến & Dải Lời Cầu An gọn gàng ở 2 mép
    ctx.save();
    const livePeersCount = Math.max(7, ((currentConfig && currentConfig.attendees) || []).length);
    roundRectPath(ctx, 8, 8, 166, 23, 11.5);
    ctx.fillStyle = "rgba(20, 11, 7, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 201, 107, 0.52)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const dotGlow = 0.65 + Math.sin(tSec * 3.6) * 0.3;
    ctx.fillStyle = `rgba(235, 87, 62, ${dotGlow})`;
    ctx.beginPath();
    ctx.arc(19, 19.5, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFDF7";
    ctx.font = "600 10.5px 'Be Vietnam Pro', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Đạo tràng trực tuyến · ${livePeersCount}`, 28, 20);

    const totalMerit =
      muyuTotal +
      (Number(currentConfig && currentConfig.incenseCount) || 14) +
      shownLanterns +
      shownWishes;
    const meritLabel = `Tâm An: ${totalMerit}`;
    ctx.font = "700 10.5px 'Be Vietnam Pro', system-ui, sans-serif";
    const mw = Math.max(86, ctx.measureText(meritLabel).width + 20);
    roundRectPath(ctx, w - mw - 8, 8, mw, 23, 11.5);
    ctx.fillStyle = "rgba(44, 22, 10, 0.84)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 201, 107, 0.75)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#FFE699";
    ctx.textAlign = "center";
    ctx.fillText(meritLabel, w - mw / 2 - 8, 20);

    if (activeTicker && activeTicker.text) {
      const barH = 24;
      const barY = h - barH - 6;
      roundRectPath(ctx, 8, barY, w - 16, barH, 8);
      ctx.fillStyle = "rgba(20, 11, 7, 0.82)";
      ctx.fill();
      ctx.strokeStyle = "rgba(242, 201, 107, 0.48)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const fullStr = `${activeTicker.speaker}: "${activeTicker.text}"`;
      const trimmed = fullStr.length > 52 ? fullStr.slice(0, 50) + "..." : fullStr;
      ctx.fillStyle = "#F7E6BE";
      ctx.font = "500 10.5px 'Be Vietnam Pro', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(trimmed, w * 0.5, barY + barH / 2 + 0.5);
    }
    ctx.restore();

    ctx.restore();

    if (bellResonance > 0.01) bellResonance *= 0.94;
    else bellResonance = 0;
    if (muyuPulse > 0.01) muyuPulse = Math.max(0, muyuPulse - 0.08);
    if (incenseBoost > 0.01) incenseBoost = Math.max(0, incenseBoost - 0.03);
    if (fortunePulse > 0.01) fortunePulse = Math.max(0, fortunePulse - 0.06);
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
      panOffsetX = Math.max(-18, Math.min(18, dragStartPan + dx * 0.18));
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
    dispose();
    containerEl = container;
    currentConfig = config || {};
    cameraView = (config && config.cameraView) || cameraView || "wide";
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
      bindInteractiveGestures(canvasEl);
      renderSanctuaryFrame(0);

      lastFrame = 0;
      animId = requestAnimationFrame(animateLoop);
    } catch (err) {
      if (typeof onFallback === "function") onFallback(err);
    }
  }

  function setCameraView(viewMode) {
    cameraView = viewMode || "wide";
    panOffsetX = 0;
    renderSanctuaryFrame(typeof performance !== "undefined" ? performance.now() * 0.001 : 0);
  }

  function getCameraView() {
    return cameraView;
  }

  function triggerIncense(speakerName) {
    incenseBoost = 1.0;
    if (currentConfig) {
      currentConfig.incenseCount = (Number(currentConfig.incenseCount) || 14) + 1;
    }
    const ry = cameraView === "cushions" ? 0.68 : 0.58;
    pushSoundRipple(0.504, ry, "rgba(255, 224, 140, 0.9)", 72);
    pushFloatingToast(0.504, ry - 0.10, "Dâng Hương Tâm Thành", `${speakerName || "Bác"} kính lễ Tam Bảo`);
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: "Thành tâm dâng nén hương trầm cầu gia đạo bình an, sức khỏe dồi dào."
    };
  }

  function triggerMuyu(count) {
    muyuPulse = 1.0;
    if (currentConfig) {
      currentConfig.muyuCount = count || (Number(currentConfig.muyuCount) || 0) + 1;
    }
    const rx = cameraView === "cushions" ? 0.85 : cameraView === "courtyard" ? 0.5 : 0.70;
    const ry = cameraView === "cushions" ? 0.68 : cameraView === "courtyard" ? 0.45 : 0.60;
    pushSoundRipple(rx, ry, "rgba(255, 224, 140, 0.88)", 62);
    pushFloatingToast(rx, ry - 0.10, `+1 Tâm An (${count || 1})`, "Tiếng mõ tĩnh tâm");
  }

  function triggerBell(speakerName) {
    bellResonance = 1.0;
    const rx = cameraView === "cushions" ? 0.15 : cameraView === "courtyard" ? 0.5 : 0.115;
    const ry = cameraView === "cushions" ? 0.56 : cameraView === "courtyard" ? 0.42 : 0.52;
    pushSoundRipple(rx, ry, "rgba(255, 220, 130, 0.92)", 105);
    pushSoundRipple(0.5, 0.52, "rgba(255, 232, 165, 0.65)", 125);
    pushFloatingToast(rx + 0.08, ry - 0.08, "Đại Hồng Chung Ngân Vang", `${speakerName || "Chánh Điện"} thỉnh chuông`);
    activeTicker = {
      speaker: speakerName || "Chánh Điện",
      text: "Thỉnh tiếng Đại Hồng Chung ngân vang, cầu quốc thái dân an, mọi nhà hạnh phúc."
    };
  }

  function triggerFortuneStick(cardCode) {
    fortunePulse = 1.0;
    const rx = cameraView === "cushions" ? 0.72 : 0.71;
    const ry = cameraView === "cushions" ? 0.74 : 0.72;
    pushSoundRipple(rx, ry, "rgba(255, 220, 130, 0.9)", 58);
    pushFloatingToast(rx - 0.06, ry - 0.12, cardCode || "Quẻ Thiện Lành", "Rút Thẻ An Lạc đầu ngày");
  }

  function spawnWishPlaque(speakerName, isVeteranGold, wishText) {
    if (currentConfig) {
      currentConfig.totalWishCount = (Number(currentConfig.totalWishCount) || 16) + 1;
    }
    extraTreeGlints.push({
      nx: 0.66 + (extraTreeGlints.length % 5) * 0.06,
      ny: 0.36 + (extraTreeGlints.length % 3) * 0.05,
      phase: extraTreeGlints.length * 1.1
    });
    if (extraTreeGlints.length > 9) extraTreeGlints.shift();

    const rx = cameraView === "courtyard" ? 0.78 : 0.72;
    const ry = cameraView === "courtyard" ? 0.44 : 0.48;
    pushSoundRipple(rx, ry, "rgba(255, 196, 120, 0.9)", 76);
    pushFloatingToast(
      rx,
      ry - 0.08,
      isVeteranGold ? "Thẻ Vàng Ước Nguyện" : "Treo Thẻ Đỏ Cầu An",
      `Của ${String(speakerName || "Bác").slice(0, 18)}`
    );
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: wishText || "Treo Thẻ Đỏ ước nguyện lên cây Bồ Đề cổ thụ ngoài sân chùa."
    };
  }

  function spawnPondLantern(speakerName, wishText) {
    if (currentConfig) {
      currentConfig.lanternCount = (Number(currentConfig.lanternCount) || 18) + 1;
    }
    extraPondLights.push({
      nx: 0.15 + (extraPondLights.length % 4) * 0.06,
      ny: 0.64 + (extraPondLights.length % 3) * 0.07,
      phase: extraPondLights.length * 1.3
    });
    if (extraPondLights.length > 8) extraPondLights.shift();

    const rx = cameraView === "courtyard" ? 0.25 : 0.28;
    const ry = cameraView === "courtyard" ? 0.76 : 0.78;
    pushSoundRipple(rx, ry, "rgba(180, 245, 232, 0.88)", 78);
    pushFloatingToast(rx, ry - 0.12, "Thả Hoa Đăng Bình An", `Đèn của ${String(speakerName || "Bác").slice(0, 16)}`);
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: wishText || "Thả ngọn Hoa Đăng sáng lung linh trên mặt Hồ Sen cầu an lạc."
    };
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
      } catch (e) {}
      renderer = null;
    }
    ctx = null;
    canvasEl = null;
    tagsLayerEl = null;
  }

  return {
    CUSHION_COORDS,
    mount,
    setCameraView,
    getCameraView,
    triggerIncense,
    triggerMuyu,
    triggerBell,
    triggerFortuneStick,
    spawnWishPlaque,
    spawnPondLantern,
    dispose
  };
})();
