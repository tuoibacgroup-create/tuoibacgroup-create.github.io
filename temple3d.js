window.TempleScene3D = (function () {
  // ============================================================================
  // CHÁNH ĐIỆN ONLINE 2.5D & ĐẠO TRÀNG TƯƠNG TÁC (PHONG CÁCH TIKTOK LIVE TEMPLE)
  // Lấy cảm hứng từ kiến trúc chùa cổ Việt Nam & các dự án Chùa Online Live (tiktok-live-temple-rpc):
  // - Gian Tam Bảo cửa võng son thếp vàng, Hoành phi - Câu đối, Tượng Phật đài sen & Hào quang Mandala xoay
  // - Lư hương đồng khói trầm uốn lượn, Đại Hồng Chung ngân sóng âm, Mõ gỗ gõ nhịp bay chữ "+1 Tâm An"
  // - Ống xăm tre lắc quẻ đầu ngày, Hồ Sen cá Koi thả Hoa Đăng & Cây Bồ Đề treo Thẻ Đỏ ước nguyện
  // - 10 Chiếu Bồ Đoàn thêu sen với Phật tử Áo Lam / Áo Tràng chắp tay vái lạy 3 nhịp uyển chuyển
  // - Hỗ trợ chạm trực tiếp vào Mõ, Chuông, Lư Hương, Hồ Sen, Cây Bồ Đề và 10 Chiếu Bồ Đoàn ngay trên màn hình
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
  let cushionActors = [];
  let smokeParticles = [];
  let lotusPetals = [];
  let floatingPopups = [];
  let soundRipples = [];
  let pondLanterns = [];
  let wishPlaques = [];
  let koiFish = [];
  let hitZones = [];

  let bellSwingEnergy = 0;
  let bellStrikerPhase = 0;
  let muyuPulseTimer = 0;
  let fortuneShakeTimer = 0;
  let incenseGlowBoost = 0;
  let activeTicker = null;

  const CUSHION_COORDS = [
    // Hàng trước (Chiếu 1..5 — gần Tam Bảo)
    { idx: 0, row: 0, x: -2.9, z: 0.55 },
    { idx: 1, row: 0, x: -1.45, z: 0.55 },
    { idx: 2, row: 0, x: 0.0, z: 0.55 },
    { idx: 3, row: 0, x: 1.45, z: 0.55 },
    { idx: 4, row: 0, x: 2.9, z: 0.55 },
    // Hàng sau (Chiếu 6..10)
    { idx: 5, row: 1, x: -2.9, z: 2.15 },
    { idx: 6, row: 1, x: -1.45, z: 2.15 },
    { idx: 7, row: 1, x: 0.0, z: 2.15 },
    { idx: 8, row: 1, x: 1.45, z: 2.15 },
    { idx: 9, row: 1, x: 2.9, z: 2.15 }
  ];

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function initParticlesAndProps() {
    smokeParticles = [];
    for (let i = 0; i < 14; i++) {
      smokeParticles.push({
        xOff: (Math.random() - 0.5) * 8,
        yProgress: Math.random(),
        speed: 0.0045 + Math.random() * 0.003,
        swayAmp: 6 + Math.random() * 7,
        swayPhase: Math.random() * Math.PI * 2,
        size: 7 + Math.random() * 9,
        gold: false
      });
    }

    lotusPetals = [];
    for (let i = 0; i < 16; i++) {
      lotusPetals.push({
        rx: Math.random(),
        ry: Math.random(),
        vy: 0.0012 + Math.random() * 0.0015,
        vx: (Math.random() - 0.5) * 0.0008,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.025,
        size: 3.5 + Math.random() * 3.5,
        isSpark: i % 3 === 0
      });
    }

    koiFish = [
      { angle: 0.4, speed: 0.38, rx: 0.55, ry: 0.48, color: "#FF6B35" },
      { angle: 3.5, speed: 0.32, rx: 0.42, ry: 0.38, color: "#FFD166" }
    ];

    pondLanterns = [];
    const wishes = (currentConfig && currentConfig.wishes) || [];
    const baseLanternCount = Math.min(9, Math.max(5, Math.floor(((currentConfig && currentConfig.lanternCount) || 18) / 3)));
    for (let i = 0; i < baseLanternCount; i++) {
      const w = wishes[i % Math.max(1, wishes.length)];
      pondLanterns.push({
        phase: (i / baseLanternCount) * Math.PI * 2,
        ring: i % 2 === 0 ? 0.66 : 0.36,
        speed: 0.16 + (i % 3) * 0.04,
        label: w && w.userName ? String(w.userName).split("·")[0].trim().slice(0, 10) : i === 0 ? "Bình An" : "Phước Lộc",
        tint: i % 3 === 0 ? "#FFD166" : "#FF8FA3"
      });
    }

    wishPlaques = [];
    const totalWishes = Math.min(14, Math.max(8, ((currentConfig && currentConfig.totalWishCount) || 16) % 15));
    const treeSlots = [
      [-0.36, -0.22], [-0.18, -0.34], [0.02, -0.36], [0.22, -0.30], [0.38, -0.18],
      [-0.42, 0.02], [-0.22, -0.06], [0.0, -0.10], [0.20, -0.05], [0.40, 0.04],
      [-0.28, 0.18], [-0.08, 0.15], [0.14, 0.17], [0.32, 0.20]
    ];
    for (let i = 0; i < Math.min(totalWishes, treeSlots.length); i++) {
      const slot = treeSlots[i];
      const w = wishes[i] || null;
      wishPlaques.push({
        relX: slot[0],
        relY: slot[1],
        phase: i * 0.85,
        isGold: Boolean((w && w.isVeteranGold) || i === 0 || i === 3),
        owner: w && w.userName ? String(w.userName).split("·")[0].trim().slice(0, 9) : "Cầu An"
      });
    }

    rebuildCushionActors();

    if (wishes.length > 0) {
      const latest = wishes[0];
      activeTicker = {
        speaker: latest.userName || "Đạo hữu",
        text: latest.prayerText || "Cầu gia đạo bình an, thân tâm thường an lạc.",
        kind: latest.ritualKind || "wish_plaque",
        createdAt: Date.now()
      };
    } else {
      activeTicker = {
        speaker: (currentConfig && currentConfig.userName) || "Đạo tràng Tuổi Bạc",
        text: "Chạm trực tiếp vào Mõ gỗ, Đại Hồng Chung, Lư hương, Hồ sen hoặc Cây ước nguyện để hành lễ.",
        kind: "incense",
        createdAt: Date.now()
      };
    }
  }

  function rebuildCushionActors() {
    cushionActors = [];
    const attendees = (currentConfig && currentConfig.attendees) || [];
    const selectedIdx = Math.max(0, Math.min(9, Number(currentConfig && currentConfig.userCushionIdx) || 2));

    CUSHION_COORDS.forEach((slot) => {
      const occ = attendees.find((a) => a.cushionIdx === slot.idx) || null;
      const isUser = Boolean(occ && occ.isUser) || slot.idx === selectedIdx;
      const isGolden = Boolean(occ && occ.seniorityLevel >= 20);
      cushionActors.push({
        idx: slot.idx,
        row: slot.row,
        col: slot.idx % 5,
        occupant: occ,
        isUser,
        isGolden,
        bowUntil: isUser ? Date.now() + 2600 : 0
      });
    });
  }

  function pushFloatingPopup(nx, ny, text, color, subText) {
    floatingPopups.push({
      nx,
      ny,
      vy: 0.0038,
      text: String(text || "+1 Tâm An"),
      subText: subText ? String(subText).slice(0, 26) : "",
      color: color || "#FFE066",
      alpha: 1.0,
      scale: 0.85
    });
    if (floatingPopups.length > 10) floatingPopups.shift();
  }

  function pushSoundRipple(nx, ny, color) {
    soundRipples.push({
      nx,
      ny,
      radius: 10,
      maxRadius: 95,
      alpha: 0.88,
      color: color || "#FFD166"
    });
    if (soundRipples.length > 8) soundRipples.shift();
  }

  // ============================================================================
  // BỘ VẼ CHÁNH ĐIỆN 2.5D PHONG CÁCH TIKTOK LIVE (CHÙA LINH ỨNG ONLINE)
  // ============================================================================
  function drawBackgroundAndSanctuaryFrame(c, w, h, tSec) {
    // Nền gỗ trầm ấm & ánh đèn hoàng kim chiều tà
    const bgGrad = c.createLinearGradient(0, 0, 0, h);
    if (cameraView === "courtyard") {
      bgGrad.addColorStop(0, "#19110D");
      bgGrad.addColorStop(0.38, "#3B1B12");
      bgGrad.addColorStop(0.75, "#5A301F");
      bgGrad.addColorStop(1, "#3A2218");
    } else {
      bgGrad.addColorStop(0, "#240C08");
      bgGrad.addColorStop(0.42, "#4B1710");
      bgGrad.addColorStop(0.72, "#6E2E1C");
      bgGrad.addColorStop(1, "#4E2719");
    }
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, w, h);

    // Quầng hào quang ấm lan tỏa từ chính giữa Tam Bảo
    const sanctuaryGlow = c.createRadialGradient(
      w * 0.5 + panOffsetX * 0.3,
      h * (cameraView === "cushions" ? 0.25 : 0.22),
      12,
      w * 0.5 + panOffsetX * 0.3,
      h * 0.28,
      w * 0.62
    );
    sanctuaryGlow.addColorStop(0, "rgba(255, 214, 102, 0.42)");
    sanctuaryGlow.addColorStop(0.45, "rgba(230, 126, 34, 0.16)");
    sanctuaryGlow.addColorStop(1, "rgba(36, 12, 8, 0)");
    c.fillStyle = sanctuaryGlow;
    c.fillRect(0, 0, w, h);

    // Sàn gạch Bát Tràng cổ kính có chiều sâu phối cảnh
    const floorTopY = cameraView === "cushions" ? h * 0.41 : cameraView === "courtyard" ? h * 0.26 : h * 0.42;
    const floorGrad = c.createLinearGradient(0, floorTopY, 0, h);
    floorGrad.addColorStop(0, "#753322");
    floorGrad.addColorStop(0.5, "#8E412B");
    floorGrad.addColorStop(1, "#5A2416");
    c.fillStyle = floorGrad;
    c.fillRect(0, floorTopY, w, h - floorTopY);

    // Đường kẻ gạch phối cảnh tụ về tâm Tam Bảo
    c.save();
    c.strokeStyle = "rgba(255, 218, 158, 0.11)";
    c.lineWidth = 1;
    const vanishX = w * 0.5 + panOffsetX * 0.45;
    const vanishY = floorTopY - 40;
    for (let i = -7; i <= 7; i++) {
      c.beginPath();
      c.moveTo(vanishX + i * 16, floorTopY);
      c.lineTo(vanishX + i * 68, h);
      c.stroke();
    }
    for (let r = 1; r <= 6; r++) {
      const ry = floorTopY + Math.pow(r / 6, 1.35) * (h - floorTopY);
      c.beginPath();
      c.moveTo(0, ry);
      c.lineTo(w, ry);
      c.stroke();
    }
    c.restore();

    // Viền bậc thềm đá xanh nối giữa Chánh Điện và Sân Chùa (khi ở góc wide hoặc courtyard)
    if (cameraView !== "cushions") {
      const stepY = cameraView === "wide" ? h * 0.72 : h * 0.34;
      const stepGrad = c.createLinearGradient(0, stepY - 5, 0, stepY + 9);
      stepGrad.addColorStop(0, "#DFC496");
      stepGrad.addColorStop(0.5, "#A68A64");
      stepGrad.addColorStop(1, "#5C4730");
      c.fillStyle = stepGrad;
      c.fillRect(0, stepY, w, 8);
    }
  }

  function drawPillarsAndCouplets(c, cx, topY, bottomY, spanW, tSec) {
    const leftX = cx - spanW * 0.5;
    const rightX = cx + spanW * 0.5;
    const colW = Math.max(18, spanW * 0.062);

    [leftX, rightX].forEach((px, idx) => {
      // Cột gỗ lim sơn son
      const pGrad = c.createLinearGradient(px - colW / 2, 0, px + colW / 2, 0);
      pGrad.addColorStop(0, "#3D0B07");
      pGrad.addColorStop(0.35, "#8B1E14");
      pGrad.addColorStop(0.7, "#6B130B");
      pGrad.addColorStop(1, "#2E0704");
      c.fillStyle = pGrad;
      c.fillRect(px - colW / 2, topY, colW, bottomY - topY);

      // Chân tảng đá hoa sen dưới cột
      c.fillStyle = "#B8A890";
      roundRectPath(c, px - colW * 0.72, bottomY - 10, colW * 1.44, 11, 4);
      c.fill();
      c.strokeStyle = "#5E5243";
      c.lineWidth = 1;
      c.stroke();

      // Đai đồng thếp vàng trên cột
      c.fillStyle = "#F4C44E";
      c.fillRect(px - colW * 0.52, topY + 26, colW * 1.04, 4);
      c.fillRect(px - colW * 0.52, bottomY - 22, colW * 1.04, 3);

      // Liễn Câu Đối Đỏ viền Vàng Kim
      const scrollW = Math.max(16, colW * 0.86);
      const scrollH = Math.min(138, (bottomY - topY) * 0.68);
      const scrollY = topY + 34;
      roundRectPath(c, px - scrollW / 2, scrollY, scrollW, scrollH, 3);
      c.fillStyle = "#9E1912";
      c.fill();
      c.strokeStyle = "#F7C948";
      c.lineWidth = 1.4;
      c.stroke();

      const words = idx === 0 ? ["TỪ", "BI", "PHỔ", "ĐỘ", "AN"] : ["PHƯỚC", "HUỆ", "VIÊN", "DUNG", "THỊNH"];
      c.fillStyle = "#FFE89E";
      c.font = "bold 8.5px Georgia, serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      const stepH = (scrollH - 14) / words.length;
      words.forEach((wStr, wi) => {
        c.fillText(wStr, px, scrollY + 10 + wi * stepH + stepH * 0.35);
      });
    });

    // Đôi đèn lồng lụa đỏ cung đình treo hai bên hiên Tam Bảo
    [-spanW * 0.36, spanW * 0.36].forEach((offsetX, lIdx) => {
      const lx = cx + offsetX;
      const ly = topY + 24;
      const sway = Math.sin(tSec * 1.7 + lIdx * 1.6) * 2.5;

      c.save();
      c.translate(lx, topY + 6);
      c.rotate(sway * 0.025);

      // Dây treo vàng
      c.strokeStyle = "#F4C44E";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 14);
      c.stroke();

      // Quầng sáng đèn lồng
      const lGlow = c.createRadialGradient(0, 26, 2, 0, 26, 28);
      lGlow.addColorStop(0, "rgba(255, 195, 85, 0.55)");
      lGlow.addColorStop(1, "rgba(255, 90, 30, 0)");
      c.fillStyle = lGlow;
      c.beginPath();
      c.arc(0, 26, 28, 0, Math.PI * 2);
      c.fill();

      // Bầu đèn lụa đỏ
      c.fillStyle = "#D92B22";
      c.beginPath();
      c.ellipse(0, 26, 13, 11, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#FFD166";
      c.lineWidth = 1.2;
      c.stroke();

      // Nan đèn cong
      c.beginPath();
      c.ellipse(0, 26, 6.5, 11, 0, 0, Math.PI * 2);
      c.strokeStyle = "rgba(255, 224, 130, 0.55)";
      c.stroke();

      // Nắp & đáy vàng
      c.fillStyle = "#F4C44E";
      c.fillRect(-6, 13, 12, 3);
      c.fillRect(-6, 36, 12, 3);

      // Tua rua đỏ vàng
      c.strokeStyle = "#FF5A36";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, 39);
      c.lineTo(sway * 0.4, 50);
      c.stroke();
      c.restore();
    });

    // Bức Hoành Phi Sơn Son Thếp Vàng ở chính giữa xà ngang
    const plaqueW = Math.min(186, spanW * 0.58);
    const plaqueH = 26;
    const plaqueY = topY + 8;
    roundRectPath(c, cx - plaqueW / 2, plaqueY, plaqueW, plaqueH, 4);
    c.fillStyle = "#5E110B";
    c.fill();
    c.strokeStyle = "#F7C948";
    c.lineWidth = 2;
    c.stroke();

    roundRectPath(c, cx - plaqueW / 2 + 3, plaqueY + 3, plaqueW - 6, plaqueH - 6, 2);
    c.strokeStyle = "rgba(255, 229, 143, 0.55)";
    c.lineWidth = 1;
    c.stroke();

    const plaqueTitle = (currentConfig && currentConfig.plaqueTitle) || "TÂM AN VẠN SỰ AN";
    c.fillStyle = "#FFE885";
    c.font = "bold 11.5px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(plaqueTitle, cx, plaqueY + plaqueH / 2 + 0.5);
  }

  function drawDetailedGoldenBuddhaAndAltar(c, cx, baseY, scale, tSec) {
    c.save();
    c.translate(cx, baseY);
    c.scale(scale, scale);

    // 1. Vòng Hào Quang Mandala 12 cánh sen xoay chậm phía sau Đức Phật
    const haloY = -92;
    const haloGlow = c.createRadialGradient(0, haloY, 8, 0, haloY, 68);
    haloGlow.addColorStop(0, "rgba(255, 244, 184, 0.92)");
    haloGlow.addColorStop(0.45, "rgba(255, 204, 77, 0.45)");
    haloGlow.addColorStop(0.8, "rgba(235, 130, 35, 0.14)");
    haloGlow.addColorStop(1, "rgba(235, 130, 35, 0)");
    c.fillStyle = haloGlow;
    c.beginPath();
    c.arc(0, haloY, 68, 0, Math.PI * 2);
    c.fill();

    c.save();
    c.translate(0, haloY);
    c.rotate(tSec * 0.22);
    c.strokeStyle = "rgba(255, 232, 142, 0.62)";
    c.lineWidth = 1.25;
    c.beginPath();
    c.arc(0, 0, 44, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(0, 0, 33, 0, Math.PI * 2);
    c.stroke();

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.beginPath();
      c.moveTo(0, -32);
      c.quadraticCurveTo(6, -42, 0, -49);
      c.quadraticCurveTo(-6, -42, 0, -32);
      c.fillStyle = "rgba(255, 224, 115, 0.36)";
      c.fill();
      c.stroke();
      c.restore();
    }
    c.restore();

    // 2. Đài Sen Hồng Vàng 3 Tầng (Multi-layered Lotus Throne)
    const throneY = -48;
    // Đế bát giác vàng dưới đài sen
    c.fillStyle = "#B87E1E";
    roundRectPath(c, -36, throneY + 6, 72, 10, 3);
    c.fill();
    c.strokeStyle = "#FFE58F";
    c.lineWidth = 1;
    c.stroke();

    // 7 cánh sen hồng viền vàng nở xòe
    const petalOffsets = [-28, -19, -9.5, 0, 9.5, 19, 28];
    petalOffsets.forEach((px, idx) => {
      const isCenter = idx === 3;
      const pw = isCenter ? 13 : 11.5;
      const ph = isCenter ? 19 : 16;
      c.beginPath();
      c.moveTo(px - pw * 0.65, throneY + 8);
      c.quadraticCurveTo(px - pw * 0.8, throneY - ph * 0.4, px, throneY - ph);
      c.quadraticCurveTo(px + pw * 0.8, throneY - ph * 0.4, px + pw * 0.65, throneY + 8);
      c.closePath();
      const pGrad = c.createLinearGradient(px, throneY - ph, px, throneY + 8);
      pGrad.addColorStop(0, "#FFD6E4");
      pGrad.addColorStop(0.55, "#F06292");
      pGrad.addColorStop(1, "#AD1457");
      c.fillStyle = pGrad;
      c.fill();
      c.strokeStyle = "#FFE082";
      c.lineWidth = 1.1;
      c.stroke();
    });

    // 3. Kim Thân Đức Phật (Tượng Phật Vàng Áo Cà Sa Xếp Nếp Uy Nghiêm)
    const goldBodyGrad = c.createLinearGradient(-22, -125, 24, -45);
    goldBodyGrad.addColorStop(0, "#FFF099");
    goldBodyGrad.addColorStop(0.45, "#F7B928");
    goldBodyGrad.addColorStop(1, "#B8770E");

    const robeGrad = c.createLinearGradient(-26, -98, 26, -45);
    robeGrad.addColorStop(0, "#F59F00");
    robeGrad.addColorStop(0.5, "#D96B0C");
    robeGrad.addColorStop(1, "#8C3806");

    // Chân xếp bằng kiết già trên đài sen
    c.beginPath();
    c.ellipse(0, throneY - 6, 29, 9.5, 0, 0, Math.PI * 2);
    c.fillStyle = robeGrad;
    c.fill();
    c.strokeStyle = "#FFE58F";
    c.lineWidth = 1.2;
    c.stroke();

    // Thân và vai khoác pháp y cà sa
    c.beginPath();
    c.moveTo(-24, throneY - 7);
    c.quadraticCurveTo(-26, -84, -14, -93);
    c.lineTo(14, -93);
    c.quadraticCurveTo(26, -84, 24, throneY - 7);
    c.closePath();
    c.fillStyle = robeGrad;
    c.fill();
    c.strokeStyle = "#FFE58F";
    c.lineWidth = 1.2;
    c.stroke();

    // Ngực vàng và chữ Vạn / ấn hoa sen trước ngực
    c.beginPath();
    c.moveTo(-8, -93);
    c.quadraticCurveTo(0, -73, 8, -93);
    c.closePath();
    c.fillStyle = goldBodyGrad;
    c.fill();

    // Nếp gấp áo cà sa chéo
    c.strokeStyle = "rgba(255, 236, 153, 0.65)";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-14, -91);
    c.quadraticCurveTo(2, -74, 18, -58);
    c.moveTo(-19, -76);
    c.quadraticCurveTo(0, -64, 14, -55);
    c.stroke();

    // Hai bàn tay bắt ấn Thiền định nâng đài bảo liên tại đan điền
    c.fillStyle = goldBodyGrad;
    c.beginPath();
    c.ellipse(0, throneY - 12, 10, 4.5, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#FF85A1";
    c.beginPath();
    c.arc(0, throneY - 15, 4.2, 0, Math.PI * 2);
    c.fill();

    // Dái tai dài phúc hậu hai bên
    c.fillStyle = goldBodyGrad;
    c.beginPath();
    c.ellipse(-13.5, -105, 3, 7.5, 0.12, 0, Math.PI * 2);
    c.ellipse(13.5, -105, 3, 7.5, -0.12, 0, Math.PI * 2);
    c.fill();

    // Khuôn mặt Đức Phật tròn đầy từ bi
    c.beginPath();
    c.arc(0, -107, 13.5, 0, Math.PI * 2);
    c.fillStyle = goldBodyGrad;
    c.fill();
    c.strokeStyle = "#B8770E";
    c.lineWidth = 1;
    c.stroke();

    // Tóc xoắn ốc & Nhục kế (Ushnisha) trên đỉnh đầu
    c.fillStyle = "#3E2723";
    c.beginPath();
    c.arc(0, -113, 12.8, Math.PI * 1.05, Math.PI * 1.95);
    c.fill();
    c.beginPath();
    c.arc(0, -124, 6.2, 0, Math.PI * 2);
    c.fill();
    // Ngọc sáng giữa nhục kế
    c.fillStyle = "#FFE066";
    c.beginPath();
    c.arc(0, -122.5, 2.2, 0, Math.PI * 2);
    c.fill();

    // Điểm Bạch Hào sáng giữa trán & đôi mắt khép hờ từ bi
    c.fillStyle = "#FFF8DC";
    c.beginPath();
    c.arc(0, -111, 1.5, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = "#5C3A08";
    c.lineWidth = 1.25;
    c.beginPath();
    // Chân mày lá liễu
    c.moveTo(-8.5, -109);
    c.quadraticCurveTo(-5, -111.5, -2, -109);
    c.moveTo(2, -109);
    c.quadraticCurveTo(5, -111.5, 8.5, -109);
    // Mắt khép thiền định
    c.moveTo(-8, -106);
    c.quadraticCurveTo(-5, -104.5, -2.2, -106);
    c.moveTo(2.2, -106);
    c.quadraticCurveTo(5, -104.5, 8, -106);
    // Nụ cười an nhiên
    c.moveTo(-3.8, -100);
    c.quadraticCurveTo(0, -98, 3.8, -100);
    c.stroke();

    // 4. Bàn Thờ Tam Bảo Sơn Son Thếp Vàng & Khăn Gấm Thêu Sen
    const altarTopY = -36;
    const altarW = 148;
    const altarH = 36;

    // Chân bàn thờ chạm hổ phù
    roundRectPath(c, -altarW / 2, altarTopY, altarW, altarH, 5);
    const altarGrad = c.createLinearGradient(0, altarTopY, 0, altarTopY + altarH);
    altarGrad.addColorStop(0, "#7A1811");
    altarGrad.addColorStop(0.5, "#5A100B");
    altarGrad.addColorStop(1, "#380805");
    c.fillStyle = altarGrad;
    c.fill();
    c.strokeStyle = "#F4C44E";
    c.lineWidth = 1.6;
    c.stroke();

    // Khăn phủ bàn thờ gấm vàng rủ xuống chính giữa
    c.beginPath();
    c.moveTo(-48, altarTopY);
    c.lineTo(48, altarTopY);
    c.lineTo(42, altarTopY + 24);
    c.lineTo(0, altarTopY + 30);
    c.lineTo(-42, altarTopY + 24);
    c.closePath();
    c.fillStyle = "#D99B26";
    c.fill();
    c.strokeStyle = "#FFE89E";
    c.lineWidth = 1.2;
    c.stroke();

    // Hoa sen thêu giữa khăn gấm
    c.fillStyle = "#9E1912";
    c.beginPath();
    c.arc(0, altarTopY + 14, 6.5, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#FFE89E";
    c.stroke();

    // Đôi bình gốm Bát Tràng cắm hoa sen hai bên bàn thờ
    [-56, 56].forEach((vx) => {
      c.fillStyle = "#D9E4EC";
      c.beginPath();
      c.ellipse(vx, altarTopY - 7, 6.5, 9, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#3E6B89";
      c.lineWidth = 1;
      c.stroke();
      // Lá & búp sen hồng
      c.fillStyle = "#2E7D47";
      c.beginPath();
      c.ellipse(vx - 4, altarTopY - 17, 5, 3, -0.4, 0, Math.PI * 2);
      c.ellipse(vx + 4, altarTopY - 17, 5, 3, 0.4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#FF7597";
      c.beginPath();
      c.ellipse(vx, altarTopY - 22, 4, 6.5, 0, 0, Math.PI * 2);
      c.fill();
    });

    // Đôi đèn dầu lưu ly tỏa lửa ấm
    [-34, 34].forEach((lx, lIdx) => {
      c.fillStyle = "#C8963E";
      c.fillRect(lx - 4, altarTopY - 6, 8, 6);
      const flicker = 1 + Math.sin(tSec * 8 + lIdx * 2) * 0.16;
      const fGlow = c.createRadialGradient(lx, altarTopY - 12, 1, lx, altarTopY - 12, 14 * flicker);
      fGlow.addColorStop(0, "rgba(255, 240, 150, 0.95)");
      fGlow.addColorStop(0.5, "rgba(255, 150, 40, 0.45)");
      fGlow.addColorStop(1, "rgba(255, 100, 20, 0)");
      c.fillStyle = fGlow;
      c.beginPath();
      c.arc(lx, altarTopY - 12, 14 * flicker, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#FFF3B0";
      c.beginPath();
      c.ellipse(lx, altarTopY - 11, 2.6, 5 * flicker, 0, 0, Math.PI * 2);
      c.fill();
    });

    // 5. Lư Hương Đồng Chạm Lưỡng Long & 3 Nén Hương Đỏ Rực
    const censerY = altarTopY - 6;
    c.fillStyle = "#B8862D";
    roundRectPath(c, -14, censerY - 11, 28, 12, 5);
    c.fill();
    c.strokeStyle = "#FFE58F";
    c.lineWidth = 1.2;
    c.stroke();
    // Tai lư hương uốn cong hai bên
    c.beginPath();
    c.arc(-15, censerY - 5, 4, Math.PI * 0.4, Math.PI * 1.6);
    c.arc(15, censerY - 5, 4, -Math.PI * 0.6, Math.PI * 0.6);
    c.stroke();

    // 3 nén hương đang cháy
    [-4.5, 0, 4.5].forEach((ix, sIdx) => {
      c.strokeStyle = "#B8281E";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(ix, censerY - 11);
      c.lineTo(ix + (sIdx - 1) * 1.5, censerY - 27);
      c.stroke();

      // Đốm lửa đỏ trên đầu nén hương
      const tipX = ix + (sIdx - 1) * 1.5;
      const tipY = censerY - 27;
      c.fillStyle = incenseGlowBoost > 0 ? "#FFF078" : "#FF6B2B";
      c.beginPath();
      c.arc(tipX, tipY, incenseGlowBoost > 0 ? 3.2 : 2.1, 0, Math.PI * 2);
      c.fill();
    });

    c.restore();

    // Lưu vùng chạm Lư Hương để người dùng chạm trực tiếp dâng hương
    hitZones.push({
      kind: "incense",
      x: cx - 32 * scale,
      y: baseY - 68 * scale,
      w: 64 * scale,
      h: 48 * scale
    });
  }

  function drawInteractiveBellAndMuyu(c, cx, altarBaseY, spanW, scale, tSec) {
    // 1. ĐẠI HỒNG CHUNG ĐỒNG CỔ (Bên trái bàn thờ)
    const bellX = cx - spanW * 0.34;
    const bellY = altarBaseY - 10 * scale;

    c.save();
    c.translate(bellX, bellY);
    c.scale(scale, scale);

    // Khung giá gỗ lim treo chuông
    c.fillStyle = "#4E160C";
    c.fillRect(-24, -64, 5, 64);
    c.fillRect(19, -64, 5, 64);
    roundRectPath(c, -29, -68, 58, 7, 3);
    c.fillStyle = "#6E1E11";
    c.fill();
    c.strokeStyle = "#F4C44E";
    c.lineWidth = 1.1;
    c.stroke();

    // Thân Đại Hồng Chung đung đưa khi thỉnh
    const swingAngle = bellSwingEnergy > 0.003 ? Math.sin(tSec * 7.5) * bellSwingEnergy : 0;
    c.save();
    c.translate(0, -61);
    c.rotate(swingAngle);

    // Quai chuông Bồ Lao
    c.fillStyle = "#C89228";
    c.fillRect(-4, 0, 8, 7);

    // Bầu chuông đồng ánh kim
    const bellGrad = c.createLinearGradient(-15, 7, 16, 44);
    bellGrad.addColorStop(0, "#FFE082");
    bellGrad.addColorStop(0.45, "#C88A24");
    bellGrad.addColorStop(1, "#6E470B");
    c.beginPath();
    c.moveTo(-10, 7);
    c.quadraticCurveTo(-15, 25, -19, 44);
    c.quadraticCurveTo(0, 48, 19, 44);
    c.quadraticCurveTo(15, 25, 10, 7);
    c.closePath();
    c.fillStyle = bellGrad;
    c.fill();
    c.strokeStyle = "#FFF0A8";
    c.lineWidth = 1.2;
    c.stroke();

    // Đường gân đồng chạm nổi trên thân chuông
    c.strokeStyle = "rgba(92, 52, 8, 0.65)";
    c.beginPath();
    c.moveTo(-13, 22);
    c.quadraticCurveTo(0, 25, 13, 22);
    c.moveTo(-16, 35);
    c.quadraticCurveTo(0, 38, 16, 35);
    c.stroke();
    c.restore();

    // Nhãn nhỏ dưới chân giá chuông
    roundRectPath(c, -28, 3, 56, 15, 7);
    c.fillStyle = "rgba(46, 22, 12, 0.88)";
    c.fill();
    c.strokeStyle = "#F4C44E";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "#FFE89E";
    c.font = "bold 9px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("Thỉnh Chuông", 0, 10.5);
    c.restore();

    hitZones.push({
      kind: "bell",
      x: bellX - 34 * scale,
      y: bellY - 72 * scale,
      w: 68 * scale,
      h: 92 * scale
    });

    // 2. MÕ GỖ CHẠM CÁ CHÉP & DÙI GÕ TỰ ĐỘNG (Bên phải bàn thờ — chuẩn Cyber Muyu TikTok Live)
    const muyuX = cx + spanW * 0.33;
    const muyuY = altarBaseY - 8 * scale;

    c.save();
    c.translate(muyuX, muyuY);
    c.scale(scale, scale);

    // Đệm gấm đỏ thêu vàng kê mõ
    c.fillStyle = "#9E1B14";
    roundRectPath(c, -24, -14, 48, 13, 6);
    c.fill();
    c.strokeStyle = "#F7C948";
    c.lineWidth = 1.2;
    c.stroke();

    // Thân Mõ Gỗ nảy nhịp khi gõ
    const bounceScale = muyuPulseTimer > 0 ? 1 + Math.sin(muyuPulseTimer * Math.PI) * 0.16 : 1;
    c.save();
    c.translate(0, -24);
    c.scale(bounceScale, 2 - bounceScale * 0.92);

    const muyuGrad = c.createRadialGradient(-5, -6, 2, 0, 0, 22);
    muyuGrad.addColorStop(0, "#F5B85C");
    muyuGrad.addColorStop(0.55, "#C87A28");
    muyuGrad.addColorStop(1, "#7A4210");
    c.fillStyle = muyuGrad;
    c.beginPath();
    c.ellipse(0, 0, 20, 14.5, -0.08, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#FFE599";
    c.lineWidth = 1.2;
    c.stroke();

    // Khe âm thanh & mắt cá chạm khắc trên mõ gỗ
    c.strokeStyle = "#3E1E04";
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(-16, 2);
    c.quadraticCurveTo(-2, 5, 8, 1);
    c.stroke();
    c.fillStyle = "#3E1E04";
    c.beginPath();
    c.arc(9, 0.5, 3.2, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Dùi gõ mõ bằng gỗ bọc nỉ đỏ vung xuống khi có nhịp gõ
    c.save();
    const malletAngle = muyuPulseTimer > 0 ? -0.42 + Math.sin(muyuPulseTimer * Math.PI) * 0.52 : -0.42;
    c.translate(22, -42);
    c.rotate(malletAngle);
    c.strokeStyle = "#8C4A18";
    c.lineWidth = 3.2;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-20, 6);
    c.stroke();
    c.fillStyle = "#D62828";
    c.beginPath();
    c.arc(-22, 6.5, 5.2, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#FFE082";
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    // Nhãn dưới chân Mõ Gỗ
    const muyuTotal = Number(currentConfig && currentConfig.muyuCount) || 0;
    roundRectPath(c, -30, 3, 60, 15, 7);
    c.fillStyle = "rgba(46, 22, 12, 0.88)";
    c.fill();
    c.strokeStyle = "#F4C44E";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "#FFE89E";
    c.font = "bold 9px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(muyuTotal > 0 ? `Gõ Mõ (${muyuTotal})` : "Gõ Mõ +1", 0, 10.5);
    c.restore();

    hitZones.push({
      kind: "muyu",
      x: muyuX - 34 * scale,
      y: muyuY - 52 * scale,
      w: 68 * scale,
      h: 72 * scale
    });

    // 3. ỐNG XĂM TRE GIEO QUẺ ĐẦU NGÀY (Cạnh phải bàn thờ)
    const fortuneX = cx + spanW * 0.17;
    const fortuneY = altarBaseY - 12 * scale;
    c.save();
    c.translate(fortuneX, fortuneY);
    c.scale(scale * 0.85, scale * 0.85);
    const shakeRot = fortuneShakeTimer > 0 ? Math.sin(tSec * 28) * 0.24 : 0;
    c.rotate(shakeRot);

    // Thẻ xăm tre đầu sơn đỏ nhô lên
    [-5, -2, 1, 4, 6].forEach((sx, si) => {
      const lift = fortuneShakeTimer > 0 && si === 2 ? -10 : 0;
      c.fillStyle = "#E6C280";
      c.fillRect(sx - 1, -34 + lift, 2.2, 16);
      c.fillStyle = "#D62828";
      c.fillRect(sx - 1, -37 + lift, 2.2, 4.5);
    });

    // Ống tre khắc chữ Cát
    roundRectPath(c, -10, -22, 20, 24, 4);
    const tubeGrad = c.createLinearGradient(-10, -22, 10, 0);
    tubeGrad.addColorStop(0, "#D49B4B");
    tubeGrad.addColorStop(0.5, "#9C6324");
    tubeGrad.addColorStop(1, "#5E3810");
    c.fillStyle = tubeGrad;
    c.fill();
    c.strokeStyle = "#FFE599";
    c.lineWidth = 1.1;
    c.stroke();
    c.restore();

    hitZones.push({
      kind: "peace_card",
      x: fortuneX - 20 * scale,
      y: fortuneY - 40 * scale,
      w: 40 * scale,
      h: 48 * scale
    });
  }

  function drawTenCushionsAndBowingDevotees(c, cx, startY, rowGap, spanW, charScale, tSec) {
    // Thảm cói vàng dệt hoa văn trải dưới 10 Chiếu Bồ Đoàn
    const matW = spanW * 1.06;
    const matH = rowGap * 2.15;
    roundRectPath(c, cx - matW / 2, startY - 22 * charScale, matW, matH, 10);
    c.fillStyle = "rgba(233, 213, 172, 0.22)";
    c.fill();
    c.strokeStyle = "rgba(244, 196, 78, 0.45)";
    c.lineWidth = 1.2;
    c.stroke();

    const now = Date.now();

    cushionActors.forEach((ca) => {
      const isBackRow = ca.row === 1;
      const rowScale = (isBackRow ? 1.06 : 0.94) * charScale;
      const rowSpan = isBackRow ? spanW * 0.92 : spanW * 0.84;
      const sx = cx + ((ca.col - 2) / 2) * (rowSpan * 0.5);
      const sy = startY + ca.row * rowGap;

      c.save();
      c.translate(sx, sy);

      // 1. Vòng hào quang sen vàng dưới chiếu cho Người Dùng hoặc Bậc Trưởng Lão
      if (ca.isUser || ca.isGolden) {
        const pulse = 1 + Math.sin(tSec * 2.6 + ca.idx) * 0.06;
        c.beginPath();
        c.ellipse(0, 4 * rowScale, 28 * rowScale * pulse, 11 * rowScale * pulse, 0, 0, Math.PI * 2);
        c.fillStyle = ca.isUser ? "rgba(255, 209, 102, 0.36)" : "rgba(244, 196, 78, 0.24)";
        c.fill();
        c.strokeStyle = ca.isUser ? "#FFD166" : "rgba(255, 224, 130, 0.75)";
        c.lineWidth = 1.3;
        c.stroke();
      }

      // 2. Đệm Bồ Đoàn thêu cánh sen tròn trịa
      c.beginPath();
      c.ellipse(0, 3 * rowScale, 22 * rowScale, 8.5 * rowScale, 0, 0, Math.PI * 2);
      c.fillStyle = ca.isUser ? "#B83B2A" : ca.isGolden ? "#C98A1E" : "#7D4E2D";
      c.fill();
      c.strokeStyle = ca.isUser ? "#FFE89E" : "#E6B86A";
      c.lineWidth = 1.4;
      c.stroke();

      c.beginPath();
      c.ellipse(0, 1.5 * rowScale, 17 * rowScale, 6 * rowScale, 0, 0, Math.PI * 2);
      c.strokeStyle = "rgba(255, 236, 179, 0.55)";
      c.lineWidth = 0.9;
      c.stroke();

      // 3. Phật tử mặc Áo Lam / Áo Tràng chắp tay tĩnh tọa & vái lạy nhịp nhàng (giống TikTok Live)
      if (ca.occupant) {
        const occ = ca.occupant;
        const isBowingActive = ca.bowUntil > now || (ca.isUser && incenseGlowBoost > 0);
        // Nhịp vái lạy 3 lạy mềm mại hoặc nhịp thở thiền định
        const bowAngle = isBowingActive
          ? Math.max(0, Math.sin(tSec * 5.2 + ca.idx)) * 7.5 * rowScale
          : Math.sin(tSec * 1.8 + ca.idx * 0.9) * 1.4 * rowScale;

        const robeColor = occ.outfitColor || (ca.idx % 2 === 0 ? "#5C6E7E" : "#6E5239");

        // Chân xếp bằng trong tà áo tràng
        c.beginPath();
        c.ellipse(0, -2 * rowScale, 17 * rowScale, 6.5 * rowScale, 0, 0, Math.PI * 2);
        c.fillStyle = robeColor;
        c.fill();

        c.save();
        c.translate(0, bowAngle * 0.65);

        // Thân áo lam / áo nâu sòng với tà vạt chéo
        c.beginPath();
        c.moveTo(-14 * rowScale, -2 * rowScale);
        c.quadraticCurveTo(-15 * rowScale, -22 * rowScale, -8 * rowScale, -27 * rowScale);
        c.lineTo(8 * rowScale, -27 * rowScale);
        c.quadraticCurveTo(15 * rowScale, -22 * rowScale, 14 * rowScale, -2 * rowScale);
        c.closePath();
        c.fillStyle = robeColor;
        c.fill();
        c.strokeStyle = "rgba(255, 245, 224, 0.45)";
        c.lineWidth = 1;
        c.stroke();

        // Khăn chầu / pháp phục viền vàng cho người dùng hoặc bậc cao niên
        if (ca.isUser || occ.seniorityLevel >= 12) {
          c.strokeStyle = "#FFD166";
          c.lineWidth = 2 * rowScale;
          c.beginPath();
          c.moveTo(-7 * rowScale, -26 * rowScale);
          c.lineTo(0, -14 * rowScale);
          c.lineTo(7 * rowScale, -26 * rowScale);
          c.stroke();
        }

        // Hai tay áo rộng chắp ấn búp sen trước ngực (nâng lên hạ xuống khi vái lạy)
        const handLift = isBowingActive ? -Math.abs(Math.sin(tSec * 5.2)) * 5 * rowScale : 0;
        c.fillStyle = robeColor;
        c.beginPath();
        c.ellipse(-8 * rowScale, -13 * rowScale + handLift, 5 * rowScale, 7 * rowScale, -0.35, 0, Math.PI * 2);
        c.ellipse(8 * rowScale, -13 * rowScale + handLift, 5 * rowScale, 7 * rowScale, 0.35, 0, Math.PI * 2);
        c.fill();

        // Đôi bàn tay chắp búp sen
        c.fillStyle = "#F4CFA9";
        c.beginPath();
        c.ellipse(0, -16 * rowScale + handLift, 3.6 * rowScale, 5.2 * rowScale, 0, 0, Math.PI * 2);
        c.fill();

        // Đầu & mái tóc bạc hiền từ (nhìn về hướng Tam Bảo kèm búi tóc sau gáy)
        c.beginPath();
        c.arc(0, -34 * rowScale + bowAngle * 0.35, 8.8 * rowScale, 0, Math.PI * 2);
        c.fillStyle = "#F1C9A0";
        c.fill();

        // Mái tóc bạc chỉnh tề
        c.beginPath();
        c.arc(0, -35 * rowScale + bowAngle * 0.35, 9.1 * rowScale, Math.PI * 0.88, Math.PI * 2.12);
        c.fillStyle = "#E4DFD7";
        c.fill();

        // Búi tóc truyền thống cho các chị / các bà hoặc khăn đóng
        if (occ.isFemale) {
          c.beginPath();
          c.arc(0, -34 * rowScale + bowAngle * 0.35, 4.4 * rowScale, 0, Math.PI * 2);
          c.fillStyle = "#D8D2C7";
          c.fill();
          c.strokeStyle = "#2E7D5B";
          c.lineWidth = 1.4;
          c.stroke();
        }
        c.restore();
      }

      // 4. Bảng tên lụa nhỏ gọn gắn ngay sát đế Bồ Đoàn (KHÔNG BAO GIỜ che mặt hay che Tượng Phật!)
      const shortName = ca.occupant
        ? String(ca.occupant.shortLabel || ca.occupant.name || "Bác").slice(0, 9)
        : "Trống";
      const badgeLabel = ca.isUser ? `BĐ${ca.idx + 1} · Bạn` : `BĐ${ca.idx + 1} · ${shortName}`;
      c.font = `${ca.isUser ? "bold " : ""}9.5px sans-serif`;
      const textW = Math.min(66, Math.max(44, c.measureText(badgeLabel).width + 10));
      const badgeH = 14;
      const badgeY = 8 * rowScale;

      roundRectPath(c, -textW / 2, badgeY, textW, badgeH, 6);
      c.fillStyle = ca.isUser
        ? "rgba(184, 59, 42, 0.96)"
        : ca.occupant && ca.occupant.isRealPeer
        ? "rgba(35, 110, 82, 0.95)"
        : ca.occupant
        ? "rgba(38, 25, 18, 0.88)"
        : "rgba(62, 44, 32, 0.65)";
      c.fill();
      c.strokeStyle = ca.isUser ? "#FFE066" : "rgba(255, 232, 165, 0.55)";
      c.lineWidth = ca.isUser ? 1.3 : 0.8;
      c.stroke();

      c.fillStyle = ca.isUser ? "#FFFDF7" : "#F7EFE2";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(badgeLabel, 0, badgeY + badgeH / 2 + 0.5);

      c.restore();

      hitZones.push({
        kind: "select_cushion",
        payload: ca.idx,
        x: sx - 28 * rowScale,
        y: sy - 42 * rowScale,
        w: 56 * rowScale,
        h: 64 * rowScale
      });
    });
  }

  function drawLotusPondAndLanterns(c, pondX, pondY, pondRx, pondRy, scale, tSec) {
    c.save();
    c.translate(pondX, pondY);

    // Thành hồ đá xanh chạm khắc cổ kính
    c.beginPath();
    c.ellipse(0, 0, pondRx + 7 * scale, pondRy + 5 * scale, 0, 0, Math.PI * 2);
    c.fillStyle = "#8C8275";
    c.fill();
    c.strokeStyle = "#D8CBB8";
    c.lineWidth = 1.5;
    c.stroke();

    // Mặt nước hồ sen xanh ngọc bích phát sáng
    const waterGrad = c.createRadialGradient(-pondRx * 0.2, -pondRy * 0.2, 4, 0, 0, pondRx);
    waterGrad.addColorStop(0, "#2A9D8F");
    waterGrad.addColorStop(0.6, "#1B6B63");
    waterGrad.addColorStop(1, "#0E3B38");
    c.beginPath();
    c.ellipse(0, 0, pondRx, pondRy, 0, 0, Math.PI * 2);
    c.fillStyle = waterGrad;
    c.fill();

    // Gợn sóng nước đồng tâm
    c.strokeStyle = "rgba(180, 245, 236, 0.22)";
    c.lineWidth = 1;
    [0.45, 0.78].forEach((rRatio, ri) => {
      const pulse = 1 + Math.sin(tSec * 1.5 + ri) * 0.04;
      c.beginPath();
      c.ellipse(0, 0, pondRx * rRatio * pulse, pondRy * rRatio * pulse, 0, 0, Math.PI * 2);
      c.stroke();
    });

    // Đàn cá Koi cam vàng bơi lội uyển chuyển dưới làn nước trong
    koiFish.forEach((fish, fi) => {
      const ang = fish.angle + tSec * fish.speed * (fi % 2 === 0 ? 1 : -1);
      const fx = Math.cos(ang) * pondRx * fish.rx;
      const fy = Math.sin(ang) * pondRy * fish.ry;
      const heading = ang + (fi % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);

      c.save();
      c.translate(fx, fy);
      c.rotate(heading);
      c.fillStyle = fish.color;
      c.beginPath();
      c.ellipse(0, 0, 6.5 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
      c.fill();
      // Đuôi cá vẫy
      const tailWag = Math.sin(tSec * 8 + fi) * 2 * scale;
      c.beginPath();
      c.moveTo(-5.5 * scale, 0);
      c.lineTo(-9.5 * scale, -2.8 * scale + tailWag);
      c.lineTo(-9.5 * scale, 2.8 * scale + tailWag);
      c.closePath();
      c.fill();
      c.restore();
    });

    // Lá sen xanh & Hoa sen hồng nở trên hồ
    const pads = [
      [-0.55, -0.35, 11],
      [0.48, -0.42, 10],
      [-0.42, 0.45, 12],
      [0.52, 0.35, 10.5]
    ];
    pads.forEach(([px, py, pr], pi) => {
      const lx = px * pondRx;
      const ly = py * pondRy;
      c.fillStyle = pi % 2 === 0 ? "#2D7A46" : "#236338";
      c.beginPath();
      c.ellipse(lx, ly, pr * scale, pr * 0.62 * scale, 0.2, 0.15, Math.PI * 1.92);
      c.lineTo(lx, ly);
      c.closePath();
      c.fill();

      if (pi % 2 === 0) {
        c.fillStyle = "#FF85A1";
        c.beginPath();
        c.arc(lx, ly - 2 * scale, 4.5 * scale, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#FFE066";
        c.beginPath();
        c.arc(lx, ly - 2 * scale, 1.8 * scale, 0, Math.PI * 2);
        c.fill();
      }
    });

    // Những ngọn Đèn Hoa Đăng Sen Hồng phát sáng trôi nhẹ trên mặt hồ
    pondLanterns.forEach((lt, li) => {
      const ang = lt.phase + tSec * lt.speed;
      const lx = Math.cos(ang) * pondRx * lt.ring;
      const ly = Math.sin(ang) * pondRy * lt.ring;
      const bob = Math.sin(tSec * 2.8 + li) * 1.5;

      c.save();
      c.translate(lx, ly + bob);

      // Quầng sáng phản chiếu xuống mặt nước
      const glow = c.createRadialGradient(0, 0, 1, 0, 0, 14 * scale);
      glow.addColorStop(0, "rgba(255, 230, 128, 0.85)");
      glow.addColorStop(0.5, "rgba(255, 143, 163, 0.35)");
      glow.addColorStop(1, "rgba(255, 143, 163, 0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, 14 * scale, 0, Math.PI * 2);
      c.fill();

      // Đế hoa đăng cánh sen hồng
      c.fillStyle = "#FF7597";
      c.beginPath();
      c.ellipse(0, 1.5 * scale, 6.8 * scale, 3.6 * scale, 0, 0, Math.PI * 2);
      c.fill();

      // Ngọn nến vàng giữa hoa đăng
      c.fillStyle = "#FFF3B0";
      c.beginPath();
      c.ellipse(0, -1.5 * scale, 2.2 * scale, 4.2 * scale, 0, 0, Math.PI * 2);
      c.fill();

      // Tên người thả hoa đăng khi ở góc cận cảnh sân chùa
      if (cameraView === "courtyard" && li < 5) {
        c.fillStyle = "rgba(20, 48, 44, 0.85)";
        roundRectPath(c, -22, 5 * scale, 44, 11, 4);
        c.fill();
        c.fillStyle = "#FFE89E";
        c.font = "bold 8px sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(lt.label, 0, 5 * scale + 5.5);
      }
      c.restore();
    });

    // Biển tên Hồ Sen Hoa Đăng
    const shownCount = Math.max(pondLanterns.length, Number(currentConfig && currentConfig.lanternCount) || 18);
    const tagW = 108;
    const tagH = 17;
    roundRectPath(c, -tagW / 2, pondRy + 4, tagW, tagH, 8);
    c.fillStyle = "rgba(18, 72, 66, 0.94)";
    c.fill();
    c.strokeStyle = "#80ED99";
    c.lineWidth = 1.1;
    c.stroke();
    c.fillStyle = "#FFFDF7";
    c.font = "bold 9.5px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(`Hồ Sen (${shownCount} đèn)`, 0, pondRy + 12.5);

    c.restore();

    hitZones.push({
      kind: "pond_lantern",
      x: pondX - pondRx - 8,
      y: pondY - pondRy - 8,
      w: (pondRx + 8) * 2,
      h: (pondRy + 14) * 2
    });
  }

  function drawWishingBodhiTree(c, treeX, treeBaseY, scale, tSec) {
    c.save();
    c.translate(treeX, treeBaseY);
    c.scale(scale, scale);

    // Bồn gạch bát giác cổ kính quanh gốc Bồ Đề
    roundRectPath(c, -34, -8, 68, 14, 5);
    c.fillStyle = "#8C4A2E";
    c.fill();
    c.strokeStyle = "#E6B87D";
    c.lineWidth = 1.2;
    c.stroke();

    // Thân cây Bồ Đề cổ thụ uy nghiêm & các nhánh vươn rộng
    c.fillStyle = "#5C3A21";
    c.beginPath();
    c.moveTo(-14, -7);
    c.quadraticCurveTo(-9, -36, -12, -62);
    c.lineTo(-28, -82);
    c.lineTo(-22, -86);
    c.lineTo(-5, -68);
    c.lineTo(6, -68);
    c.lineTo(24, -86);
    c.lineTo(30, -80);
    c.lineTo(11, -60);
    c.quadraticCurveTo(9, -35, 14, -7);
    c.closePath();
    c.fill();

    // Tán lá Bồ Đề xanh rợp nhiều tầng
    const foliageCircles = [
      [-32, -82, 24, "#1E5631"],
      [32, -80, 24, "#1E5631"],
      [-16, -102, 27, "#296E40"],
      [18, -100, 26, "#246339"],
      [0, -86, 30, "#2E7D47"],
      [0, -110, 25, "#388E54"]
    ];
    foliageCircles.forEach(([fx, fy, fr, fCol]) => {
      c.fillStyle = fCol;
      c.beginPath();
      c.ellipse(fx, fy, fr * 1.15, fr * 0.85, 0, 0, Math.PI * 2);
      c.fill();
    });

    // Dải lụa đỏ cát tường vắt ngang tán cây
    c.strokeStyle = "#E63946";
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(-42, -78);
    c.quadraticCurveTo(0, -64, 42, -76);
    c.stroke();

    // Các Thẻ Gỗ Đỏ & Thẻ Vàng Công Đức đung đưa trong gió trên tán cây
    const canopyCenterY = -86;
    wishPlaques.forEach((wp) => {
      const px = wp.relX * 106;
      const py = canopyCenterY + wp.relY * 68;
      const sway = Math.sin(tSec * 2.3 + wp.phase) * 0.14;

      c.save();
      c.translate(px, py);
      c.rotate(sway);

      // Dây tơ vàng treo thẻ
      c.strokeStyle = "#FFD166";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 6);
      c.stroke();

      // Thân thẻ ước nguyện sơn đỏ thẫm hoặc thếp vàng
      roundRectPath(c, -4.8, 6, 9.6, 17, 2);
      c.fillStyle = wp.isGold ? "#F5B82E" : "#C91E1A";
      c.fill();
      c.strokeStyle = "#FFE89E";
      c.lineWidth = 0.9;
      c.stroke();

      // Đầu thẻ khắc kim nhũ
      c.fillStyle = "#FFE066";
      c.fillRect(-4.2, 6, 8.4, 3);

      // Tua rua đỏ dưới đáy thẻ
      c.strokeStyle = "#FF4D4D";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, 23);
      c.lineTo(sway * 5, 28);
      c.stroke();
      c.restore();
    });

    // Biển tên Cây Thẻ Đỏ
    const shownWishes = Math.max(wishPlaques.length, Number(currentConfig && currentConfig.totalWishCount) || 16);
    const tagW = 112;
    const tagH = 17;
    roundRectPath(c, -tagW / 2, 7, tagW, tagH, 8);
    c.fillStyle = "rgba(148, 26, 20, 0.95)";
    c.fill();
    c.strokeStyle = "#FFE066";
    c.lineWidth = 1.1;
    c.stroke();
    c.fillStyle = "#FFE89E";
    c.font = "bold 9.5px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(`Cây Thẻ Đỏ (${shownWishes})`, 0, 15.5);

    c.restore();

    hitZones.push({
      kind: "wish_plaque",
      x: treeX - 64 * scale,
      y: treeBaseY - 135 * scale,
      w: 128 * scale,
      h: 160 * scale
    });
  }

  function drawSmokeAndParticlesAndHUD(c, w, h, centerX, censerY, tSec) {
    // 1. Làn khói trầm hương uốn lượn mềm mại bay lên từ Lư Hương Tam Bảo
    if (cameraView !== "courtyard") {
      smokeParticles.forEach((sp) => {
        sp.yProgress += sp.speed * (incenseGlowBoost > 0 ? 1.55 : 1);
        if (sp.yProgress >= 1) {
          sp.yProgress = 0;
          sp.gold = incenseGlowBoost > 0;
        }
        const curY = censerY - sp.yProgress * 78;
        const curX = centerX + sp.xOff + Math.sin(tSec * 2.2 + sp.swayPhase + sp.yProgress * 4.5) * sp.swayAmp * sp.yProgress;
        const alpha = Math.sin(sp.yProgress * Math.PI) * (sp.gold ? 0.52 : 0.34);
        const rad = sp.size * (0.55 + sp.yProgress * 0.95);

        const sGrad = c.createRadialGradient(curX, curY, 1, curX, curY, rad);
        if (sp.gold) {
          sGrad.addColorStop(0, `rgba(255, 232, 140, ${alpha})`);
          sGrad.addColorStop(1, "rgba(255, 232, 140, 0)");
        } else {
          sGrad.addColorStop(0, `rgba(248, 240, 225, ${alpha})`);
          sGrad.addColorStop(1, "rgba(248, 240, 225, 0)");
        }
        c.fillStyle = sGrad;
        c.beginPath();
        c.arc(curX, curY, rad, 0, Math.PI * 2);
        c.fill();
      });
    }

    // 2. Cánh hoa sen hồng & Hạt sáng vàng công đức bay lơ lửng khắp không gian
    lotusPetals.forEach((pt) => {
      pt.ry += pt.vy;
      pt.rx += pt.vx + Math.sin(tSec * 1.4 + pt.rot) * 0.0004;
      pt.rot += pt.vRot;
      if (pt.ry > 1.04) {
        pt.ry = -0.04;
        pt.rx = Math.random();
      }
      const px = pt.rx * w;
      const py = pt.ry * h;

      c.save();
      c.translate(px, py);
      c.rotate(pt.rot);
      if (pt.isSpark) {
        const sparkAlpha = 0.45 + Math.sin(tSec * 4 + pt.rot) * 0.3;
        c.fillStyle = `rgba(255, 224, 102, ${sparkAlpha})`;
        c.beginPath();
        c.arc(0, 0, pt.size * 0.55, 0, Math.PI * 2);
        c.fill();
      } else {
        c.fillStyle = "rgba(255, 158, 181, 0.65)";
        c.beginPath();
        c.ellipse(0, 0, pt.size, pt.size * 0.55, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    });

    // 3. Vòng sóng âm lan tỏa khi Gõ Mõ / Thỉnh Chuông / Thả Hoa Đăng
    for (let i = soundRipples.length - 1; i >= 0; i--) {
      const rp = soundRipples[i];
      rp.radius += 2.2;
      rp.alpha -= 0.022;
      if (rp.alpha <= 0.02) {
        soundRipples.splice(i, 1);
        continue;
      }
      c.save();
      c.strokeStyle = rp.color;
      c.globalAlpha = Math.max(0, rp.alpha);
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(rp.nx * w, rp.ny * h, rp.radius, rp.radius * 0.52, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    // 4. Chữ nổi "+1 Tâm An / Công Đức" bay lên (đúng chuẩn TikTok Live Electronic Wooden Fish)
    for (let i = floatingPopups.length - 1; i >= 0; i--) {
      const fp = floatingPopups[i];
      fp.ny -= fp.vy;
      fp.alpha -= 0.016;
      fp.scale = Math.min(1.08, fp.scale + 0.02);
      if (fp.alpha <= 0.02) {
        floatingPopups.splice(i, 1);
        continue;
      }
      const fx = Math.max(64, Math.min(w - 64, fp.nx * w));
      const fy = Math.max(26, fp.ny * h);

      c.save();
      c.globalAlpha = Math.max(0, fp.alpha);
      c.translate(fx, fy);
      c.scale(fp.scale, fp.scale);

      c.font = "bold 13px sans-serif";
      const tw = Math.max(88, c.measureText(fp.text).width + 20);
      roundRectPath(c, -tw / 2, -13, tw, fp.subText ? 31 : 22, 11);
      c.fillStyle = "rgba(48, 20, 12, 0.92)";
      c.fill();
      c.strokeStyle = fp.color;
      c.lineWidth = 1.4;
      c.stroke();

      c.fillStyle = fp.color;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(fp.text, 0, fp.subText ? -3 : -2);

      if (fp.subText) {
        c.fillStyle = "#FFFDF7";
        c.font = "600 9.5px sans-serif";
        c.fillText(fp.subText, 0, 10);
      }
      c.restore();
    }

    // 5. Thanh Header Phiên Live TikTok Chùa Online (Góc trên trái & phải)
    c.save();
    // Pill Trực Tiếp Đạo Tràng
    const liveCount = Math.max(7, ((currentConfig && currentConfig.attendees) || []).length);
    roundRectPath(c, 8, 8, 162, 22, 11);
    c.fillStyle = "rgba(32, 14, 10, 0.86)";
    c.fill();
    c.strokeStyle = "rgba(255, 214, 102, 0.65)";
    c.lineWidth = 1;
    c.stroke();

    // Chấm đỏ Live nhấp nháy
    const dotPulse = 0.6 + Math.sin(tSec * 4.5) * 0.4;
    c.fillStyle = `rgba(255, 59, 48, ${dotPulse})`;
    c.beginPath();
    c.arc(19, 19, 4.2, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#FFFDF7";
    c.font = "bold 10px sans-serif";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText(`ĐẠO TRÀNG LIVE · ${liveCount} bác`, 28, 19.5);

    // Pill Tổng Tâm An / Công Đức tích lũy góc trên phải
    const totalMerit =
      (Number(currentConfig && currentConfig.muyuCount) || 0) +
      (Number(currentConfig && currentConfig.incenseCount) || 14) +
      (Number(currentConfig && currentConfig.lanternCount) || 18) +
      (Number(currentConfig && currentConfig.totalWishCount) || 16);
    const meritText = `Tâm An: ${totalMerit}`;
    c.font = "bold 10px sans-serif";
    const mw = Math.max(82, c.measureText(meritText).width + 18);
    roundRectPath(c, w - mw - 8, 8, mw, 22, 11);
    c.fillStyle = "rgba(92, 42, 12, 0.9)";
    c.fill();
    c.strokeStyle = "#FFD166";
    c.lineWidth = 1.1;
    c.stroke();
    c.fillStyle = "#FFE89E";
    c.textAlign = "center";
    c.fillText(meritText, w - mw / 2 - 8, 19.5);

    // 6. Dải Sớ Cầu Nguyện Vàng (Live Prayer Scroll Ticker) ở sát mép dưới khung hình
    if (activeTicker && activeTicker.text) {
      const barH = 24;
      const barY = h - barH - 6;
      roundRectPath(c, 8, barY, w - 16, barH, 8);
      c.fillStyle = "rgba(38, 16, 10, 0.9)";
      c.fill();
      c.strokeStyle = "rgba(244, 196, 78, 0.72)";
      c.lineWidth = 1;
      c.stroke();

      const fullLine = `${activeTicker.speaker}: "${activeTicker.text}"`;
      const clippedLine = fullLine.length > 52 ? fullLine.slice(0, 50) + "..." : fullLine;
      c.fillStyle = "#FFE58F";
      c.font = "600 10.5px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(clippedLine, w * 0.5, barY + barH / 2 + 0.5);
    }
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

    drawBackgroundAndSanctuaryFrame(ctx, w, h, tSec);

    const cx = w * 0.5 + panOffsetX;

    if (cameraView === "cushions") {
      // Góc Cận cảnh 10 Bồ Đoàn & Bàn Thờ Tam Bảo
      drawPillarsAndCouplets(ctx, cx, 32, h * 0.48, Math.min(330, w * 0.92), tSec);
      drawDetailedGoldenBuddhaAndAltar(ctx, cx, h * 0.44, 0.96, tSec);
      drawInteractiveBellAndMuyu(ctx, cx, h * 0.44, Math.min(330, w * 0.92), 0.92, tSec);
      drawTenCushionsAndBowingDevotees(ctx, cx, h * 0.57, h * 0.17, Math.min(340, w * 0.94), 1.08, tSec);
      drawSmokeAndParticlesAndHUD(ctx, w, h, cx, h * 0.44 - 36, tSec);
    } else if (cameraView === "courtyard") {
      // Góc Sân Chùa: Cận cảnh Hồ Sen Hoa Đăng & Cây Bồ Đề Thẻ Đỏ
      drawPillarsAndCouplets(ctx, cx, 26, h * 0.34, Math.min(270, w * 0.76), tSec);
      drawDetailedGoldenBuddhaAndAltar(ctx, cx, h * 0.32, 0.62, tSec);
      drawLotusPondAndLanterns(ctx, cx - w * 0.23, h * 0.64, w * 0.22, h * 0.14, 1.18, tSec);
      drawWishingBodhiTree(ctx, cx + w * 0.23, h * 0.77, 1.14, tSec);
      drawSmokeAndParticlesAndHUD(ctx, w, h, cx, h * 0.32 - 22, tSec);
    } else {
      // Góc Toàn Cảnh Live TikTok ("wide"): Thấy trọn vẹn Tam Bảo, 10 Bồ Đoàn, Hồ Sen & Cây Thẻ Đỏ
      const hallSpan = Math.min(316, w * 0.88);
      drawPillarsAndCouplets(ctx, cx, 32, h * 0.45, hallSpan, tSec);
      drawDetailedGoldenBuddhaAndAltar(ctx, cx, h * 0.42, 0.84, tSec);
      drawInteractiveBellAndMuyu(ctx, cx, h * 0.42, hallSpan, 0.82, tSec);
      drawTenCushionsAndBowingDevotees(ctx, cx, h * 0.51, h * 0.125, Math.min(310, w * 0.86), 0.88, tSec);
      drawLotusPondAndLanterns(ctx, cx - w * 0.28, h * 0.81, w * 0.165, h * 0.075, 0.86, tSec);
      drawWishingBodhiTree(ctx, cx + w * 0.28, h * 0.86, 0.78, tSec);
      drawSmokeAndParticlesAndHUD(ctx, w, h, cx, h * 0.42 - 30, tSec);
    }

    ctx.restore();

    if (bellSwingEnergy > 0.002) bellSwingEnergy *= 0.96;
    else bellSwingEnergy = 0;

    if (muyuPulseTimer > 0) muyuPulseTimer = Math.max(0, muyuPulseTimer - 0.14);
    if (fortuneShakeTimer > 0) fortuneShakeTimer = Math.max(0, fortuneShakeTimer - 0.08);
    if (incenseGlowBoost > 0) incenseGlowBoost = Math.max(0, incenseGlowBoost - 0.04);
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
          // Dự phòng khi không truyền callback ngoài
          if (hz.kind === "muyu") triggerMuyu((Number(currentConfig && currentConfig.muyuCount) || 0) + 1);
          else if (hz.kind === "bell") triggerBell((currentConfig && currentConfig.userName) || "Chánh Điện");
          else if (hz.kind === "incense") triggerIncense((currentConfig && currentConfig.userName) || "Bạn");
          else if (hz.kind === "pond_lantern") spawnPondLantern((currentConfig && currentConfig.userName) || "Bạn");
          else if (hz.kind === "wish_plaque") spawnWishPlaque((currentConfig && currentConfig.userName) || "Bạn", false);
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
      panOffsetX = Math.max(-28, Math.min(28, dragStartPan + dx * 0.25));
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
    boundResize = () => renderSanctuaryFrame(performance.now() * 0.001);

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

      initParticlesAndProps();
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
    renderSanctuaryFrame(performance.now() * 0.001);
  }

  function getCameraView() {
    return cameraView;
  }

  function markUserBowing(durationMs) {
    const now = Date.now();
    cushionActors.forEach((ca) => {
      if (ca.isUser) {
        ca.bowUntil = now + (durationMs || 3200);
      }
    });
  }

  function triggerIncense(speakerName) {
    incenseGlowBoost = 1.0;
    if (currentConfig) {
      currentConfig.incenseCount = (Number(currentConfig.incenseCount) || 14) + 1;
    }
    markUserBowing(3600);
    pushSoundRipple(0.5, 0.34, "#FFD166");
    pushFloatingPopup(0.5, 0.32, "+1 Hương Tâm Thành", "#FFE066", `${speakerName || "Bác"} kính lễ Tam Bảo`);
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: "Thành tâm dâng nén hương trầm cầu gia đạo bình an, sức khỏe dồi dào.",
      kind: "incense",
      createdAt: Date.now()
    };
  }

  function triggerMuyu(count) {
    muyuPulseTimer = 1.0;
    if (currentConfig) {
      currentConfig.muyuCount = count || (Number(currentConfig.muyuCount) || 0) + 1;
    }
    markUserBowing(1400);
    const isCourtyard = cameraView === "courtyard";
    const rx = isCourtyard ? 0.5 : 0.78;
    const ry = isCourtyard ? 0.3 : 0.36;
    pushSoundRipple(rx, ry, "#FFE066");
    pushFloatingPopup(rx, ry - 0.04, `+1 Tâm An (${count || 1})`, "#FFE885", "Tiếng mõ tĩnh tâm");
  }

  function triggerBell(speakerName) {
    bellSwingEnergy = 0.36;
    bellStrikerPhase = 1.0;
    markUserBowing(3200);
    const isCourtyard = cameraView === "courtyard";
    const rx = isCourtyard ? 0.5 : 0.22;
    const ry = isCourtyard ? 0.3 : 0.34;
    pushSoundRipple(rx, ry, "#FFD166");
    pushSoundRipple(0.5, 0.52, "#FFE599");
    pushFloatingPopup(rx, ry - 0.04, "Chuông Chùa Ngân Vang", "#FFE066", `${speakerName || "Chánh Điện"} thỉnh chuông`);
    activeTicker = {
      speaker: speakerName || "Chánh Điện",
      text: "Thỉnh tiếng Đại Hồng Chung ngân vang, cầu quốc thái dân an, mọi nhà hạnh phúc.",
      kind: "bell",
      createdAt: Date.now()
    };
  }

  function triggerFortuneStick(cardCode) {
    fortuneShakeTimer = 1.0;
    markUserBowing(2600);
    pushSoundRipple(0.64, 0.35, "#FFD166");
    pushFloatingPopup(0.62, 0.3, cardCode || "Quẻ Đại Cát", "#FFE066", "Gieo quẻ Thẻ An Lạc đầu ngày");
  }

  function spawnWishPlaque(speakerName, isVeteranGold, wishText) {
    if (currentConfig) {
      currentConfig.totalWishCount = (Number(currentConfig.totalWishCount) || 16) + 1;
    }
    markUserBowing(3400);
    const idx = wishPlaques.length;
    wishPlaques.push({
      relX: ((idx * 37) % 80 - 40) / 100,
      relY: ((idx * 23) % 56 - 32) / 100,
      phase: idx * 0.9,
      isGold: Boolean(isVeteranGold),
      owner: String(speakerName || "Bác").slice(0, 9)
    });
    if (wishPlaques.length > 18) wishPlaques.shift();

    const rx = cameraView === "courtyard" ? 0.72 : 0.76;
    const ry = cameraView === "courtyard" ? 0.56 : 0.68;
    pushSoundRipple(rx, ry, "#FF6B6B");
    pushFloatingPopup(
      rx,
      ry - 0.08,
      isVeteranGold ? "+1 Thẻ Vàng Ước Nguyện" : "+1 Thẻ Đỏ Cầu An",
      "#FFE066",
      `${String(speakerName || "Bác").slice(0, 16)} treo thẻ`
    );
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: wishText || "Treo Thẻ Đỏ ước nguyện lên cây Bồ Đề sân chùa, cầu bình an mạnh khỏe.",
      kind: "wish_plaque",
      createdAt: Date.now()
    };
  }

  function spawnPondLantern(speakerName, wishText) {
    if (currentConfig) {
      currentConfig.lanternCount = (Number(currentConfig.lanternCount) || 18) + 1;
    }
    markUserBowing(3200);
    pondLanterns.push({
      phase: Math.random() * Math.PI * 2,
      ring: pondLanterns.length % 2 === 0 ? 0.68 : 0.4,
      speed: 0.18 + (pondLanterns.length % 3) * 0.04,
      label: String(speakerName || "Bác").split("·")[0].trim().slice(0, 10),
      tint: "#FFD166"
    });
    if (pondLanterns.length > 12) pondLanterns.shift();

    const rx = cameraView === "courtyard" ? 0.28 : 0.24;
    const ry = cameraView === "courtyard" ? 0.62 : 0.76;
    pushSoundRipple(rx, ry, "#64DFDF");
    pushFloatingPopup(
      rx,
      ry - 0.08,
      "+1 Hoa Đăng Bình An",
      "#9BF6FF",
      `Đèn của ${String(speakerName || "Bác").slice(0, 16)}`
    );
    activeTicker = {
      speaker: speakerName || "Đạo hữu",
      text: wishText || "Thả ngọn Hoa Đăng sáng lung linh trên mặt Hồ Sen cầu an lạc.",
      kind: "pond_lantern",
      createdAt: Date.now()
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
    smokeParticles = [];
    lotusPetals = [];
    floatingPopups = [];
    soundRipples = [];
    pondLanterns = [];
    wishPlaques = [];
    cushionActors = [];
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
