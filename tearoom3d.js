window.TeaRoomScene = (function () {
  let mode = "3d"; // "3d" | "2.5d"
  let animId = null;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 28;

  let renderer = null;
  let scene = null;
  let camera = null;
  let containerEl = null;
  let canvasEl = null;
  let tagsLayerEl = null;
  let seatObjects = [];
  let overviewTables = [];
  let hostGroup = null;
  let lanternGroup = null;
  let profileItemGroup = null;
  let profileItemAnchor = null;
  let hostServingTimer = 0;
  let steamParticles = [];
  let activeSeatIdx = 0;
  let activeStickerPop = null; // { seatIdx, label, bg, color, expiresAt }
  let overviewWideLevel = "wide"; // "wide" | "ultrawide"
  let overviewAzimuth = 0;
  let tableAzimuth = 0;
  let pan25DX = 0;
  let isDraggingOverview = false;
  let dragStartX = 0;
  let dragStartAzimuth = 0;
  let dragStartPan = 0;
  let currentConfig = null;
  let onFallbackCallback = null;
  let hybridBillboards = [];

  // Cached procedural CanvasTextures so room switching stays instant & zero external asset dependencies
  const texCache = {};

  // Pre-rendered 2.5D painterly backdrops & chroma-keyed sprite atlas (row 0 = base, row 1 = tint mask)
  const SPRITE_CELL_W = 220;
  const SPRITE_CELL_H = 280;
  const SEAT_ANCHORS = [
    { u: 0.418, v: 0.571 }, // 0: male_3q seated buttocks on cushion
    { u: 0.418, v: 0.614 }, // 1: female_3q seated buttocks on cushion
    { u: 0.564, v: 0.900 }, // 2: back_3q seated buttocks on cushion
    { u: 0.445, v: 0.960 }  // 3: host_stand standing shoes on floor
  ];
  const assets25D = {
    started: false,
    tableImg: null,
    tableReady: false,
    lobbyImg: null,
    lobbyReady: false,
    spritesImg: null,
    spritesReady: false
  };
  const composedSpriteCache = new Map();
  let tempMaskCanvas = null;

  const FRAME_HEX = {
    "tri-am": "#2e7d63",
    "thi-huu": "#c84b38",
    "ky-thu": "#d49a35",
    "giu-lua": "#f0b23a",
    "dong-ngu": "#6b8f4e",
    "cay-cao": "#f5c242",
    "tam-an": "#d98fa8",
    "kien-tuong": "#ffd97d"
  };

  function refreshHybridBillboardsOnLoad() {
    if (!assets25D.spritesReady || !hybridBillboards.length) return;
    hybridBillboards.forEach((entry) => {
      if (!entry || !entry.tex || !entry.spec) return;
      const freshCanvas = composeSeniorSpriteCanvas({
        ...entry.spec,
        pose: entry.pose || entry.spec.pose || "front"
      });
      entry.tex.image = freshCanvas;
      entry.tex.needsUpdate = true;
    });
  }

  function triggerRenderIf25D() {
    if (mode === "2.5d" && canvasEl && currentConfig) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (currentConfig.viewMode === "overview") drawOverview25D(now);
      else if (currentConfig.viewMode === "profile") drawProfileShowcase25D(now);
      else drawTableCloseUp25D(now);
    }
  }

  function ensureAssets25DLoaded() {
    if (assets25D.started || typeof Image === "undefined") return;
    assets25D.started = true;

    const tblImg = new Image();
    tblImg.onload = () => {
      assets25D.tableImg = tblImg;
      assets25D.tableReady = true;
      triggerRenderIf25D();
    };
    tblImg.onerror = () => {
      assets25D.tableReady = false;
    };
    tblImg.src = "./assets/tearoom-table-25d.jpg?v=20261117k";

    const lobImg = new Image();
    lobImg.onload = () => {
      assets25D.lobbyImg = lobImg;
      assets25D.lobbyReady = true;
      triggerRenderIf25D();
    };
    lobImg.onerror = () => {
      assets25D.lobbyReady = false;
    };
    lobImg.src = "./assets/tearoom-lobby-25d.jpg?v=20261117k";

    const sprImg = new Image();
    sprImg.onload = () => {
      assets25D.spritesImg = sprImg;
      assets25D.spritesReady = true;
      composedSpriteCache.clear();
      refreshHybridBillboardsOnLoad();
      triggerRenderIf25D();
    };
    sprImg.onerror = () => {
      assets25D.spritesReady = false;
    };
    sprImg.src = "./assets/tearoom-sprites.webp?v=20261117k";
  }

  function createCanvas2D(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function drawSpriteAccessories(ctx, col, spec) {
    const acc = spec.accessory || "none";
    const frameId = spec.titleFrameId || "none";
    const outfitId = spec.outfitId || "";

    const anchors =
      col === 1
        ? { crownX: 100, crownY: 20, leftEyeX: 104, rightEyeX: 117, eyeY: 40, earX: 84, neckX: 102, neckY: 66, chestX: 90, chestY: 96 }
        : col === 2
          ? { crownX: 118, crownY: 24, leftEyeX: 112, rightEyeX: 112, eyeY: 44, earX: 100, neckX: 118, neckY: 86, chestX: 124, chestY: 118 }
          : col === 3
            ? { crownX: 100, crownY: 22, leftEyeX: 102, rightEyeX: 114, eyeY: 41, earX: 86, neckX: 98, neckY: 64, chestX: 88, chestY: 90 }
            : { crownX: 99, crownY: 20, leftEyeX: 104, rightEyeX: 117, eyeY: 38, earX: 85, neckX: 104, neckY: 63, chestX: 88, chestY: 92 };

    // Outfit character touches (collar piping for ao-gam-vang / uniform pockets for ao-linh)
    if (col < 2 && outfitId === "ao-gam-vang") {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 232, 160, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(anchors.neckX - 16, anchors.neckY + 2);
      ctx.lineTo(anchors.neckX + 6, anchors.neckY + 12);
      ctx.stroke();
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-linh") {
      ctx.save();
      ctx.fillStyle = "rgba(42, 56, 30, 0.42)";
      ctx.fillRect(anchors.chestX - 10, anchors.chestY + 18, 20, 5);
      ctx.fillRect(anchors.chestX + 20, anchors.chestY + 15, 20, 5);
      ctx.restore();
    }

    // Silk scarf worn around neck
    if (acc === "scarf") {
      ctx.save();
      const scGrad = ctx.createLinearGradient(anchors.neckX - 24, anchors.neckY - 4, anchors.neckX + 26, anchors.neckY + 40);
      scGrad.addColorStop(0, "#B83B2A");
      scGrad.addColorStop(1, "#7B1F16");
      ctx.fillStyle = scGrad;
      ctx.strokeStyle = "#4A120D";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (col === 2) {
        ctx.ellipse(anchors.neckX, anchors.neckY + 3, 21, 7, -0.1, 0, Math.PI * 2);
      } else {
        ctx.ellipse(anchors.neckX, anchors.neckY + 3, 22, 8.5, 0.08, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      if (col < 2) {
        ctx.beginPath();
        ctx.roundRect(anchors.neckX - 3, anchors.neckY + 6, 14, 36, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#F5DFB6";
        ctx.fillRect(anchors.neckX - 2, anchors.neckY + 36, 12, 3.2);
      }
      ctx.restore();
    }

    // High-contrast reading glasses calibrated to true eye pixels (crisp even when scaled small at table)
    if (acc === "glasses" && col < 2) {
      ctx.save();
      ctx.fillStyle = "rgba(235, 250, 255, 0.34)";
      ctx.beginPath();
      ctx.ellipse(anchors.leftEyeX, anchors.eyeY, 6.8, 4.9, 0, 0, Math.PI * 2);
      ctx.ellipse(anchors.rightEyeX, anchors.eyeY - 0.5, 6.2, 4.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark bronze rim + bright brass inner wire
      [
        { color: "#4A2E0B", width: 2.8 },
        { color: "#F2BC46", width: 1.3 }
      ].forEach((pass) => {
        ctx.strokeStyle = pass.color;
        ctx.lineWidth = pass.width;
        ctx.beginPath();
        ctx.ellipse(anchors.leftEyeX, anchors.eyeY, 6.8, 4.9, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(anchors.rightEyeX, anchors.eyeY - 0.5, 6.2, 4.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(anchors.leftEyeX + 6.8, anchors.eyeY);
        ctx.lineTo(anchors.rightEyeX - 6.2, anchors.eyeY - 0.5);
        ctx.moveTo(anchors.leftEyeX - 6.8, anchors.eyeY);
        ctx.lineTo(anchors.earX, anchors.eyeY + 2);
        ctx.stroke();
      });
      ctx.restore();
    }

    // Military / Cloth field cap
    if (acc === "cap") {
      ctx.save();
      const capGrad = ctx.createLinearGradient(anchors.crownX - 28, anchors.crownY - 12, anchors.crownX + 28, anchors.crownY + 18);
      capGrad.addColorStop(0, "#637D4F");
      capGrad.addColorStop(1, "#3A4E2D");
      ctx.fillStyle = capGrad;
      ctx.strokeStyle = "#26331D";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(anchors.crownX, anchors.crownY + 3, 27, 14, col === 2 ? -0.1 : 0.1, Math.PI * 0.96, Math.PI * 2.04);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Visor
      ctx.fillStyle = "#334527";
      ctx.beginPath();
      if (col === 2) {
        ctx.ellipse(anchors.crownX - 22, anchors.crownY + 7, 15, 5.2, -0.22, 0, Math.PI * 2);
      } else {
        ctx.ellipse(anchors.crownX + 18, anchors.crownY + 8, 18, 5.8, 0.22, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Traditional Vietnamese Nón Lá conical palm hat
    if (acc === "non-la") {
      ctx.save();
      const hatX = col === 2 ? anchors.crownX - 3 : anchors.crownX - 1;
      const hatTopY = anchors.crownY - 22;
      const brimY = anchors.crownY + 15;
      const nonGrad = ctx.createLinearGradient(hatX - 52, hatTopY, hatX + 52, brimY);
      nonGrad.addColorStop(0, "#F6E8BE");
      nonGrad.addColorStop(0.55, "#E7CD8B");
      nonGrad.addColorStop(1, "#C39E59");
      ctx.fillStyle = nonGrad;
      ctx.strokeStyle = "#7D5D28";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(hatX, hatTopY);
      ctx.lineTo(hatX - 52, brimY);
      ctx.quadraticCurveTo(hatX, brimY + 11, hatX + 52, brimY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Subtle woven bamboo ribs
      ctx.strokeStyle = "rgba(125, 93, 40, 0.35)";
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
        const frac = r * 0.24;
        const ry = hatTopY + (brimY - hatTopY) * frac;
        const rx = 50 * frac;
        ctx.beginPath();
        ctx.moveTo(hatX - rx, ry);
        ctx.quadraticCurveTo(hatX, ry + 7 * frac, hatX + rx, ry);
        ctx.stroke();
      }
      // Red silk chin strap hint
      if (col < 2) {
        ctx.strokeStyle = "#A93B2C";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(hatX - 18, brimY + 2);
        ctx.quadraticCurveTo(anchors.neckX, anchors.neckY + 2, anchors.rightEyeX + 4, brimY + 3);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Chest Title Frame Honor Rosette
    if (col < 2 && FRAME_HEX[frameId]) {
      ctx.save();
      ctx.fillStyle = "#E8B74E";
      ctx.strokeStyle = "#5F3E12";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(anchors.chestX, anchors.chestY, 7.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = FRAME_HEX[frameId];
      ctx.beginPath();
      ctx.arc(anchors.chestX, anchors.chestY, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function composeSeniorSpriteCanvas(spec) {
    ensureAssets25DLoaded();
    const s = spec || {};
    const pose = s.pose === "stand" || s.isHost ? "stand" : s.pose === "back" ? "back" : "front";
    const col = pose === "stand" ? 3 : pose === "back" ? 2 : s.gender === "female" ? 1 : 0;
    const outfitColor = s.outfitColor || (s.isHost ? "#D98A2B" : "#2E5E4E");
    const outfitId = s.outfitId || "";
    const acc = s.accessory || "none";
    const frameId = s.titleFrameId || "none";
    const cacheKey = `${col}|${outfitColor}|${outfitId}|${acc}|${frameId}|${s.isHost ? 1 : 0}|${assets25D.spritesReady ? 1 : 0}`;

    if (composedSpriteCache.has(cacheKey)) {
      return composedSpriteCache.get(cacheKey);
    }

    const out = createCanvas2D(SPRITE_CELL_W, SPRITE_CELL_H);
    const ctx = out.getContext("2d");

    if (assets25D.spritesReady && assets25D.spritesImg) {
      const sx = col * SPRITE_CELL_W;
      ctx.drawImage(assets25D.spritesImg, sx, 0, SPRITE_CELL_W, SPRITE_CELL_H, 0, 0, SPRITE_CELL_W, SPRITE_CELL_H);

      if (!tempMaskCanvas) {
        tempMaskCanvas = createCanvas2D(SPRITE_CELL_W, SPRITE_CELL_H);
      }
      const mctx = tempMaskCanvas.getContext("2d");
      mctx.globalCompositeOperation = "source-over";
      mctx.clearRect(0, 0, SPRITE_CELL_W, SPRITE_CELL_H);
      mctx.drawImage(assets25D.spritesImg, sx, SPRITE_CELL_H, SPRITE_CELL_W, SPRITE_CELL_H, 0, 0, SPRITE_CELL_W, SPRITE_CELL_H);
      mctx.globalCompositeOperation = "source-in";
      mctx.fillStyle = outfitColor;
      mctx.fillRect(0, 0, SPRITE_CELL_W, SPRITE_CELL_H);
      mctx.globalCompositeOperation = "source-over";

      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tempMaskCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      drawSpriteAccessories(ctx, col, { accessory: acc, titleFrameId: frameId, outfitId });
    } else {
      // Painterly fallback silhouette while tearoom-sprites.webp loads
      ctx.fillStyle = outfitColor;
      ctx.strokeStyle = "#3E291C";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(62, 74, 96, 174, 34);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = col === 2 ? "#D8D2C8" : "#ECC2A3";
      ctx.beginPath();
      ctx.arc(110, 48, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#E4DFD6";
      ctx.beginPath();
      ctx.arc(110, 42, 24.5, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
      drawSpriteAccessories(ctx, col, { accessory: acc, titleFrameId: frameId, outfitId });
    }

    if (composedSpriteCache.size >= 64) {
      composedSpriteCache.clear();
    }
    composedSpriteCache.set(cacheKey, out);
    return out;
  }

  function drawPainterlyTableItem25D(ctx, itemId, x, y, sc, now) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    // Subtle tabletop shadow
    ctx.fillStyle = "rgba(35, 22, 12, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 12, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (itemId === "binh-sen") {
      const vaseGrad = ctx.createLinearGradient(-12, -26, 12, 10);
      vaseGrad.addColorStop(0, "#4F8F77");
      vaseGrad.addColorStop(1, "#2A5746");
      ctx.fillStyle = vaseGrad;
      ctx.strokeStyle = "#1E3B2F";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, -4, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Two lotus blossoms
      [[-8, -28], [8, -24]].forEach(([lx, ly]) => {
        ctx.strokeStyle = "#3E7047";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(lx, ly + 4);
        ctx.stroke();
        ctx.fillStyle = "#EFA5B9";
        ctx.beginPath();
        ctx.ellipse(lx, ly, 7.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FAD76B";
        ctx.beginPath();
        ctx.arc(lx, ly - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (itemId === "bonsai-mini") {
      ctx.fillStyle = "#2E6A75";
      ctx.strokeStyle = "#1C4249";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-16, 0, 32, 11, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#5B3B24";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(-8, -14, 6, -24);
      ctx.stroke();
      [[-10, -18, 9], [8, -26, 11], [15, -16, 7.5]].forEach(([bx, by, br]) => {
        ctx.fillStyle = "#3E7A48";
        ctx.beginPath();
        ctx.ellipse(bx, by, br + 2, br * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (itemId === "dia-hat-dua" || itemId === "snack-plate") {
      ctx.fillStyle = "#E8DFCC";
      ctx.strokeStyle = "#8C785C";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 4, 21, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      [[-6, 3, "#C9483B"], [4, 2, "#D49B3D"], [-1, -1, "#5C3A28"], [7, 5, "#C9483B"], [-7, 6, "#D49B3D"]].forEach(([sx, sy, col]) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (itemId === "den-dau") {
      ctx.fillStyle = "#7D522D";
      ctx.beginPath();
      ctx.ellipse(0, 6, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      const glow = 0.78 + Math.sin((now || 0) * 0.008) * 0.16;
      ctx.fillStyle = `rgba(255, 224, 128, ${glow.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(0, -14, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#B88438";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = "#FFF5CC";
      ctx.beginPath();
      ctx.ellipse(0, -13, 3.2, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (itemId === "radio-go") {
      ctx.fillStyle = "#7C4C2B";
      ctx.strokeStyle = "#482914";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-18, -16, 36, 25, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#E8D3A4";
      ctx.fillRect(-13, -11, 16, 15);
      ctx.fillStyle = "#C99848";
      ctx.beginPath();
      ctx.arc(10, -6, 3.2, 0, Math.PI * 2);
      ctx.arc(10, 3, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Classic Tử Sa teapot + wooden coaster
      ctx.fillStyle = "#4C2C18";
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      const potGrad = ctx.createRadialGradient(-4, -8, 2, 0, -2, 18);
      potGrad.addColorStop(0, "#C85A38");
      potGrad.addColorStop(1, "#7F2F1B");
      ctx.fillStyle = potGrad;
      ctx.strokeStyle = "#481C10";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -2, 13, 10.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#E2AD42";
      ctx.beginPath();
      ctx.arc(0, -14, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hexToCss(val, fallback) {
    if (typeof val === "string") return val;
    if (typeof val === "number") return "#" + val.toString(16).padStart(6, "0");
    return fallback || "#8B5A38";
  }

  function getWoodFloorTex(floorHex) {
    const key = "floor_" + String(floorHex || "default");
    if (texCache[key]) return texCache[key];
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#D8B589";
    ctx.fillRect(0, 0, 512, 512);

    const plankH = 64;
    for (let row = 0; row < 8; row++) {
      const y = row * plankH;
      const toneShift = (row % 3 - 1) * 7;
      ctx.fillStyle = `rgb(${214 + toneShift}, ${176 + toneShift}, ${130 + toneShift})`;
      ctx.fillRect(0, y, 512, plankH - 2);

      // Subtle woodgrain streaks
      ctx.strokeStyle = "rgba(116, 74, 38, 0.14)";
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        const gy = y + 8 + g * 9;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(170, gy + ((g % 2) ? 3 : -3), 340, gy + ((g % 2) ? -2 : 3), 512, gy);
        ctx.stroke();
      }

      // Plank horizontal groove
      ctx.fillStyle = "rgba(92, 56, 28, 0.32)";
      ctx.fillRect(0, y + plankH - 2, 512, 2);

      // Staggered vertical plank joint
      const jointX = ((row * 173 + 90) % 440) + 36;
      ctx.fillRect(jointX, y, 2, plankH);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3.5);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache[key] = tex;
    return tex;
  }

  function getVietTileRugTex() {
    if (texCache.vietRug) return texCache.vietRug;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    // Outer woven border ring
    ctx.beginPath();
    ctx.arc(cx, cy, 248, 0, Math.PI * 2);
    ctx.fillStyle = "#B83B2A";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 236, 0, Math.PI * 2);
    ctx.fillStyle = "#F7EFE0";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 226, 0, Math.PI * 2);
    ctx.strokeStyle = "#2E5E4E";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Clip inner pattern to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.clip();

    // Subtle Indochine gạch bông grid inside circle
    const tile = 64;
    for (let gx = 0; gx < 512; gx += tile) {
      for (let gy = 0; gy < 512; gy += tile) {
        const mx = gx + tile / 2;
        const my = gy + tile / 2;
        ctx.strokeStyle = "rgba(46, 94, 78, 0.22)";
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, tile, tile);

        // 4-petal lotus motif per tile
        ctx.fillStyle = ((gx / tile + gy / tile) % 2 === 0) ? "rgba(184, 59, 42, 0.22)" : "rgba(46, 94, 78, 0.22)";
        for (let a = 0; a < 4; a++) {
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate((a * Math.PI) / 2);
          ctx.beginPath();
          ctx.ellipse(0, -13, 5, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = "#D98A2B";
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Center lotus medallion
    ctx.beginPath();
    ctx.arc(cx, cy, 86, 0, Math.PI * 2);
    ctx.fillStyle = "#EFE2CA";
    ctx.fill();
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 4;
    ctx.stroke();

    for (let p = 0; p < 8; p++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((p * Math.PI) / 4);
      ctx.beginPath();
      ctx.ellipse(0, -48, 12, 26, 0, 0, Math.PI * 2);
      ctx.fillStyle = p % 2 === 0 ? "#B83B2A" : "#2E5E4E";
      ctx.fill();
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache.vietRug = tex;
    return tex;
  }

  function getWoodTableTex() {
    if (texCache.woodTable) return texCache.woodTable;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");

    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
    grad.addColorStop(0, "#8E5534");
    grad.addColorStop(0.75, "#744225");
    grad.addColorStop(1, "#593019");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = "rgba(255, 224, 185, 0.09)";
    ctx.lineWidth = 2;
    for (let r = 18; r < 120; r += 14) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center golden woven runner strip
    ctx.fillStyle = "rgba(232, 208, 162, 0.88)";
    ctx.beginPath();
    ctx.arc(128, 128, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 3;
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache.woodTable = tex;
    return tex;
  }

  function getScrollTex() {
    if (texCache.scroll) return texCache.scroll;
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 280;
    const ctx = c.getContext("2d");

    // Silk brocade border
    ctx.fillStyle = "#C8A978";
    ctx.fillRect(0, 0, 160, 280);
    // Ivory rice paper inside
    ctx.fillStyle = "#FBF5E8";
    ctx.fillRect(14, 22, 132, 236);
    ctx.strokeStyle = "#8C583A";
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 22, 132, 236);

    // Traditional Vietnamese calligraphy ("Trà Tâm" / "Bình An")
    ctx.fillStyle = "#2A1E17";
    ctx.font = "bold 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("BÌNH", 80, 74);
    ctx.fillText("AN", 80, 112);

    // Subtle ink lotus stem & blossom
    ctx.strokeStyle = "#2E5E4E";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(78, 228);
    ctx.quadraticCurveTo(68, 190, 82, 160);
    ctx.stroke();

    ctx.fillStyle = "#C85A48";
    ctx.beginPath();
    ctx.ellipse(82, 154, 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(70, 158, 8, 14, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(94, 158, 8, 14, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Red vermilion seal
    ctx.fillStyle = "#B83B2A";
    ctx.fillRect(104, 212, 22, 22);

    const tex = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache.scroll = tex;
    return tex;
  }

  function getSeniorFaceTex(isFemale) {
    const key = isFemale ? "face_f" : "face_m";
    if (texCache[key]) return texCache[key];
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d");

    // Warm rosy skin base across entire UV sphere
    ctx.fillStyle = "#F4CFB4";
    ctx.fillRect(0, 0, 256, 128);

    // Front of Three.js SphereGeometry faces +X at u=0 / +Z at u=0.25 depending on rotation;
    // We orient head.rotation.y = -Math.PI / 2 so UV u = 0.5 faces straight forward (+Z)!
    const fx = 128;
    const fy = 66;

    // Warm rosy cheeks
    ctx.fillStyle = "rgba(226, 128, 108, 0.34)";
    ctx.beginPath();
    ctx.ellipse(fx - 20, fy + 8, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(fx + 20, fy + 8, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Silver-white kind eyebrows
    ctx.strokeStyle = "#EAE4DA";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.quadraticCurveTo(fx - 14, fy - 14, fx - 7, fy - 11);
    ctx.moveTo(fx - 21, fy - 10);
    ctx.quadraticCurveTo(fx - 14, fy - 15, fx - 7, fy - 11);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fx + 7, fy - 11);
    ctx.quadraticCurveTo(fx + 14, fy - 15, fx + 21, fy - 10);
    ctx.stroke();

    // Warm dark eyes + tiny white catchlight
    ctx.fillStyle = "#2A1C15";
    ctx.beginPath();
    ctx.arc(fx - 13, fy - 2, 3.6, 0, Math.PI * 2);
    ctx.arc(fx + 13, fy - 2, 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(fx - 14, fy - 3.2, 1.2, 0, Math.PI * 2);
    ctx.arc(fx + 12, fy - 3.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Gentle smile & laugh lines
    ctx.strokeStyle = isFemale ? "#B45346" : "#8A4B3C";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(fx, fy + 7, 9, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache[key] = tex;
    return tex;
  }

  function dispose3D() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (canvasEl) {
      canvasEl.onpointerdown = null;
      canvasEl.style.cursor = "";
    }
    window.onpointermove = null;
    window.onpointerup = null;
    isDraggingOverview = false;
    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry && typeof obj.geometry.dispose === "function") {
          obj.geometry.dispose();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m && m.map && m.map.userData && m.map.userData.isPerMount && typeof m.map.dispose === "function") {
              m.map.dispose();
            }
            if (m && typeof m.dispose === "function") m.dispose();
          });
        }
      });
    }
    if (renderer) {
      try {
        renderer.dispose();
      } catch (e) {
        // Ignore disposal error
      }
      renderer = null;
    }
    scene = null;
    camera = null;
    seatObjects = [];
    overviewTables = [];
    hybridBillboards = [];
    steamParticles = [];
    hostGroup = null;
    lanternGroup = null;
    profileItemGroup = null;
    profileItemAnchor = null;
  }

  function makeWoodenChair(cushionHex) {
    const chair = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6a4328, roughness: 0.58, metalness: 0.06 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4f301b, roughness: 0.62, metalness: 0.05 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: cushionHex || 0x2e5e4e, roughness: 0.78, metalness: 0.02 });

    // 4 tapered chair legs
    const legCoords = [
      [-0.28, -0.26],
      [0.28, -0.26],
      [-0.28, 0.26],
      [0.28, 0.26]
    ];
    legCoords.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.34, 10), darkWoodMat);
      leg.position.set(lx, 0.17, lz);
      leg.castShadow = true;
      chair.add(leg);
    });

    // Wooden seat base
    const seatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.43, 0.06, 20), woodMat);
    seatBase.position.y = 0.34;
    seatBase.castShadow = true;
    seatBase.receiveShadow = true;
    chair.add(seatBase);

    // Plump stitched cushion
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.43, 0.1, 20), cushionMat);
    cushion.position.y = 0.41;
    cushion.castShadow = true;
    chair.add(cushion);

    // Backrest side posts + curved top rail + spindles
    [-0.27, 0.27].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.038, 0.58, 10), woodMat);
      post.position.set(px, 0.65, -0.31);
      post.rotation.x = -0.08;
      post.castShadow = true;
      chair.add(post);
    });

    [-0.13, 0, 0.13].forEach((sx) => {
      const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 8), darkWoodMat);
      spindle.position.set(sx, 0.62, -0.33);
      spindle.rotation.x = -0.08;
      chair.add(spindle);
    });

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.11, 0.07), woodMat);
    topRail.position.set(0, 0.92, -0.34);
    topRail.castShadow = true;
    chair.add(topRail);

    // Subtle armrests
    [-0.32, 0.32].forEach((ax) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.38), woodMat);
      arm.position.set(ax, 0.58, -0.08);
      chair.add(arm);
    });

    return chair;
  }

  function makeHybrid25DSenior(member, isUser, outfitColorOverride, cushionHex, accessoryId, withChair, outfitIdOverride) {
    const g = new THREE.Group();
    const nameStr = String((member && member.name) || "");
    const isFemale = (member && member.gender === "female") || /^(Chị|Bà|Cô|Dì|Thím)/i.test(nameStr);
    const outfitColor = isUser ? outfitColorOverride || "#B83B2A" : (member && member.outfitColor) || "#2E5E4E";
    const acc = accessoryId || (member && member.hat) || (isFemale ? "hair-bun" : "none");
    const frameId = (member && member.titleFrameId) || "none";
    const outfitId = isUser ? outfitIdOverride || "" : (member && member.outfitId) || "";
    const isHost = Boolean(member && member.isHost);

    if (withChair !== false) {
      g.add(makeWoodenChair(cushionHex));
    }

    const isStandHost = isHost || withChair === false;
    const basePose = isStandHost ? "stand" : "front";
    const spec = {
      gender: isFemale ? "female" : "male",
      pose: basePose,
      outfitColor,
      outfitId,
      accessory: acc,
      titleFrameId: frameId,
      isHost
    };
    const sprCanvas = composeSeniorSpriteCanvas(spec);
    const tex = new THREE.CanvasTexture(sprCanvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.userData = { isPerMount: true };

    const spriteMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.14,
      side: THREE.DoubleSide
    });
    const planeW = isStandHost ? 1.14 : 1.06;
    const planeH = isStandHost ? 1.56 : 1.38;
    const sprCol = isStandHost ? 3 : isFemale ? 1 : 0;
    const sprAnchor = SEAT_ANCHORS[sprCol];

    const billboardPivot = new THREE.Group();
    // Seated: anchor pelvis onto y=0.45 cushion so knees extend toward table & shoes touch floor ~0.04; standing: feet flush at floor y=0
    const pivotY = isStandHost ? planeH * sprAnchor.v - planeH * 0.5 : 0.46 + planeH * (sprAnchor.v - 0.5);
    billboardPivot.position.set(0, Math.max(0.74, pivotY), withChair === false ? 0 : 0.04);

    const billboard = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), spriteMat);
    billboard.position.set((0.5 - sprAnchor.u) * planeW, 0, 0);
    billboardPivot.add(billboard);
    g.add(billboardPivot);

    const headAnchor = new THREE.Object3D();
    headAnchor.position.set(0, isStandHost ? 1.46 : 1.42, withChair === false ? 0 : 0.04);
    g.add(headAnchor);

    // Subtle inlaid honor ring around chair base
    if (FRAME_HEX[frameId]) {
      const fHex = parseInt(FRAME_HEX[frameId].slice(1), 16);
      const badgeCoreMat = new THREE.MeshStandardMaterial({ color: fHex, roughness: 0.38, metalness: 0.28 });
      const honorRing = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.022, 10, 36), badgeCoreMat);
      honorRing.rotation.x = Math.PI / 2;
      honorRing.position.y = 0.032;
      g.add(honorRing);
    }

    // Warm speaker glow ring on floor
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf4a836,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.54, 0.68, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.025;
    g.add(ring);

    const bbEntry = {
      pivot: billboardPivot,
      billboard,
      planeW,
      tex,
      spec,
      pose: basePose,
      baseY: billboardPivot.position.y,
      seatGroup: g,
      lockFrontOnly: isStandHost
    };
    hybridBillboards.push(bbEntry);

    return { group: g, head: headAnchor, ringMat, billboard, billboardPivot, billboardEntry: bbEntry };
  }

  const makeLowPolySenior = makeHybrid25DSenior;

  function makeDetailedTeapot(potColorHex) {
    const grp = new THREE.Group();
    const clayMat = new THREE.MeshStandardMaterial({
      color: potColorHex || 0x9c4228,
      roughness: 0.42,
      metalness: 0.08
    });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.35, metalness: 0.5 });

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 22, 18), clayMat);
    belly.scale.set(1.08, 0.82, 1.08);
    belly.position.y = 0.14;
    belly.castShadow = true;
    grp.add(belly);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 18), clayMat);
    lid.position.y = 0.27;
    grp.add(lid);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), goldMat);
    knob.position.y = 0.31;
    grp.add(knob);

    // Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.04, 0.18, 12), clayMat);
    spout.position.set(0.18, 0.18, 0);
    spout.rotation.z = -0.78;
    grp.add(spout);

    // Handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 10, 18, Math.PI * 1.3), clayMat);
    handle.position.set(-0.16, 0.16, 0);
    handle.rotation.z = Math.PI * 0.35;
    grp.add(handle);

    return grp;
  }

  function makeTeacupMesh() {
    const g = new THREE.Group();
    const porcelain = new THREE.MeshStandardMaterial({ color: 0xf4f0e4, roughness: 0.32, metalness: 0.05 });
    const saucerMat = new THREE.MeshStandardMaterial({ color: 0xd7e3da, roughness: 0.4 });
    const teaLiquid = new THREE.MeshStandardMaterial({ color: 0x6c8c3c, roughness: 0.2, metalness: 0.1 });

    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.07, 0.018, 16), saucerMat);
    saucer.position.y = 0.01;
    g.add(saucer);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.045, 0.075, 16), porcelain);
    cup.position.y = 0.048;
    cup.castShadow = true;
    g.add(cup);

    const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.054, 14), teaLiquid);
    liquid.rotation.x = -Math.PI / 2;
    liquid.position.y = 0.086;
    g.add(liquid);

    return g;
  }

  function makeTableItemMesh(itemId) {
    const grp = new THREE.Group();
    if (itemId === "am-tu-sa") {
      const coaster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.2, 0.028, 20),
        new THREE.MeshStandardMaterial({ color: 0x4b2b17, roughness: 0.45 })
      );
      coaster.position.y = 0.014;
      const pot = makeDetailedTeapot(0x9b4026);
      pot.scale.set(0.88, 0.88, 0.88);
      pot.position.y = 0.025;
      grp.add(coaster, pot);
    } else if (itemId === "bonsai-mini") {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.11, 0.11, 14),
        new THREE.MeshStandardMaterial({ color: 0x3b6e5c, roughness: 0.45 })
      );
      pot.position.y = 0.055;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.04, 0.18, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 })
      );
      trunk.position.set(-0.02, 0.16, 0);
      trunk.rotation.z = -0.22;
      const canopy1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x2f6f44, roughness: 0.75 })
      );
      canopy1.scale.set(1.25, 0.68, 1.1);
      canopy1.position.set(0.03, 0.25, 0);
      const canopy2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0x3d8453, roughness: 0.75 })
      );
      canopy2.scale.set(1.2, 0.65, 1.1);
      canopy2.position.set(-0.08, 0.21, 0.03);
      grp.add(pot, trunk, canopy1, canopy2);
    } else if (itemId === "den-dau") {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.12, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xb87d32, roughness: 0.38, metalness: 0.45 })
      );
      base.position.y = 0.05;
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.075, 0.18, 16),
        new THREE.MeshStandardMaterial({ color: 0xfff3d1, transparent: true, opacity: 0.78, roughness: 0.2 })
      );
      chimney.position.y = 0.18;
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.09, 10),
        new THREE.MeshBasicMaterial({ color: 0xffb838 })
      );
      flame.position.y = 0.16;
      grp.add(base, chimney, flame);
    } else if (itemId === "binh-sen") {
      const vase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.1, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0xebe5d8, roughness: 0.35 })
      );
      vase.position.y = 0.11;
      const lotus = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xe88ca5, roughness: 0.6 })
      );
      lotus.scale.set(0.9, 1.2, 0.9);
      lotus.position.y = 0.26;
      grp.add(vase, lotus);
    } else if (itemId === "radio-go") {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.17, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x6b3e23, roughness: 0.55 })
      );
      box.position.y = 0.085;
      const grille = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xe6d2a8, roughness: 0.7 })
      );
      grille.position.set(-0.03, 0.09, 0.062);
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12),
        new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.5, roughness: 0.4 })
      );
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0.09, 0.09, 0.065);
      grp.add(box, grille, dial);
    } else {
      // Red lacquer snack plate with golden lotus seeds / sunflower seeds
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.12, 0.04, 20),
        new THREE.MeshStandardMaterial({ color: 0xb83b2a, roughness: 0.38 })
      );
      plate.position.y = 0.02;
      grp.add(plate);
      const seedMat = new THREE.MeshStandardMaterial({ color: 0xf0cf82, roughness: 0.55 });
      for (let s = 0; s < 6; s++) {
        const ang = (s * Math.PI) / 3;
        const seed = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), seedMat);
        seed.position.set(Math.cos(ang) * 0.065, 0.048, Math.sin(ang) * 0.065);
        grp.add(seed);
      }
    }
    return grp;
  }

  function makeSilkLantern(colorHex) {
    const g = new THREE.Group();
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2e1b })
    );
    cord.position.y = 0.42;
    g.add(cord);

    const silk = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 16),
      new THREE.MeshStandardMaterial({
        color: colorHex || 0xffc86b,
        emissive: 0xe08b28,
        emissiveIntensity: 0.55,
        roughness: 0.5
      })
    );
    silk.scale.set(1, 0.84, 1);
    g.add(silk);

    const capMat = new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.5 });
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.05, 16), capMat);
    topCap.position.y = 0.23;
    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.05, 16), capMat);
    botCap.position.y = -0.23;
    const tassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: 0xb83b2a, roughness: 0.7 })
    );
    tassel.rotation.x = Math.PI;
    tassel.position.y = -0.35;
    g.add(topCap, botCap, tassel);
    return g;
  }

  function addRoomShell(theme, isOverview) {
    const wallColor = theme.wallHex || 0xf6ecda;
    scene.background = new THREE.Color(wallColor);
    scene.fog = new THREE.Fog(wallColor, isOverview ? 18 : 13, isOverview ? 30 : 22);

    // Warm 3-point heritage lighting
    const hemi = new THREE.HemisphereLight(0xfff9ed, 0xc49566, 0.98);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe7bf, 1.15);
    sun.position.set(-4.2, 8.8, 5.4);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 24;
    const d = isOverview ? 10.5 : 4.5;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xfff2de, 0.48);
    fill.position.set(5.5, 5.2, 7.2);
    scene.add(fill);

    const lanternLight = new THREE.PointLight(0xffb85c, 0.78, 15);
    lanternLight.position.set(0, 3.4, 0);
    scene.add(lanternLight);

    // Warm honey-wood plank floor (expanded wide for 5-bay panoramic tea hall)
    const floorW = isOverview ? 38 : 24;
    const floorD = isOverview ? 28 : 20;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(floorW, floorD),
      new THREE.MeshStandardMaterial({
        map: getWoodFloorTex(theme.floorHex),
        roughness: 0.72,
        metalness: 0.04
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall with wooden wainscoting (ốp gỗ chân tường)
    const wallZ = isOverview ? -6.35 : -3.85;
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(floorW, 8.2),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88 })
    );
    backWall.position.set(0, 4.1, wallZ);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const wainscot = new THREE.Mesh(
      new THREE.BoxGeometry(floorW, 1.05, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x8b5d3b, roughness: 0.68 })
    );
    wainscot.position.set(0, 0.52, wallZ + 0.04);
    scene.add(wainscot);

    const chairRail = new THREE.Mesh(
      new THREE.BoxGeometry(floorW, 0.09, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x5d3920, roughness: 0.55 })
    );
    chairRail.position.set(0, 1.06, wallZ + 0.06);
    scene.add(chairRail);

    // Sunlit wooden lattice windows with green bamboo outside
    const windowXs = isOverview ? [-4.45, 4.45] : [-2.05];
    const winY = isOverview ? 2.48 : 1.78;
    const winW = isOverview ? 2.55 : 1.95;
    const winH = isOverview ? 1.58 : 1.24;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x623c22, roughness: 0.55 });
    const bambooMat = new THREE.MeshBasicMaterial({ color: 0x4b8b5b });

    windowXs.forEach((winX) => {
      const winOuter = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.18, winH + 0.18, 0.1), frameMat);
      winOuter.position.set(winX, winY, wallZ + 0.06);
      scene.add(winOuter);

      const winSky = new THREE.Mesh(
        new THREE.PlaneGeometry(winW, winH),
        new THREE.MeshBasicMaterial({ color: 0xe6f5f0 })
      );
      winSky.position.set(winX, winY, wallZ + 0.12);
      scene.add(winSky);

      [-0.55, -0.15, 0.34].forEach((bx, bi) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, winH * 0.92, 8), bambooMat);
        stalk.position.set(winX + bx, winY - 0.02, wallZ + 0.13);
        stalk.rotation.z = (bi - 1) * 0.09;
        scene.add(stalk);

        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0x64a86e }));
        leaf.scale.set(1.4, 0.55, 0.3);
        leaf.position.set(winX + bx + 0.12, winY + 0.22 - bi * 0.15, wallZ + 0.135);
        scene.add(leaf);
      });

      [-winW * 0.18, winW * 0.18].forEach((mx) => {
        const barV = new THREE.Mesh(new THREE.BoxGeometry(0.045, winH, 0.04), frameMat);
        barV.position.set(winX + mx, winY, wallZ + 0.15);
        scene.add(barV);
      });
      const barH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.045, 0.04), frameMat);
      barH.position.set(winX, winY, wallZ + 0.15);
      scene.add(barH);
    });

    if (isOverview) {
      // 5-bay Vietnamese ironwood pillars (cột gỗ lim nhà 5 gian) + lanterns + garden veranda
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x52311b, roughness: 0.52 });
      [-8.4, -2.85, 2.85, 8.4].forEach((px) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 5.6, 16), pillarMat);
        col.position.set(px, 2.8, wallZ + 0.32);
        col.castShadow = true;
        scene.add(col);
      });

      [-5.2, 5.2].forEach((lx) => {
        const lant = makeSilkLantern(0xffc86b);
        lant.scale.set(0.98, 0.98, 0.98);
        lant.position.set(lx, 3.55, -1.6);
        scene.add(lant);
      });

      // Side bonsai trees along the left & right verandas
      [-7.75, 7.75].forEach((bx) => {
        [-1.3, 2.4].forEach((bz) => {
          const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.46, 14), pillarMat);
          stand.position.set(bx, 0.23, bz);
          scene.add(stand);
          const tree = makeTableItemMesh("bonsai-mini");
          tree.scale.set(1.9, 1.9, 1.9);
          tree.position.set(bx, 0.46, bz);
          scene.add(tree);
        });
      });

      // Carved Tea Counter at the back center for Chị Trà
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.86, 0.68),
        new THREE.MeshStandardMaterial({ color: 0x6b4125, roughness: 0.5 })
      );
      counter.position.set(0, 0.43, -5.25);
      counter.castShadow = true;
      scene.add(counter);
      const counterPot = makeDetailedTeapot(0xa44528);
      counterPot.position.set(-0.45, 0.87, -5.25);
      scene.add(counterPot);

      // Front Bát Tràng brick courtyard veranda border
      const veranda = new THREE.Mesh(
        new THREE.BoxGeometry(26, 0.06, 1.25),
        new THREE.MeshStandardMaterial({ color: 0xa85239, roughness: 0.78 })
      );
      veranda.position.set(0, 0.03, 5.85);
      veranda.receiveShadow = true;
      scene.add(veranda);
    }

    // Hanging Vietnamese Calligraphy Scroll on back wall
    const scrollX = isOverview ? 0 : 0.96;
    const scrollY = isOverview ? 2.38 : 1.82;
    const scrollPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 1.3),
      new THREE.MeshStandardMaterial({ map: getScrollTex(), roughness: 0.78 })
    );
    scrollPlane.position.set(scrollX, scrollY, wallZ + 0.08);
    scene.add(scrollPlane);

    const dowelTop = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.92, 12), frameMat);
    dowelTop.rotation.z = Math.PI / 2;
    dowelTop.position.set(scrollX, scrollY + 0.66, wallZ + 0.09);
    const dowelBot = dowelTop.clone();
    dowelBot.position.set(scrollX, scrollY - 0.66, wallZ + 0.09);
    scene.add(dowelTop, dowelBot);
  }

  function applyTableCameraPose() {
    if (!camera || !currentConfig) return;
    if (currentConfig.viewMode === "profile") {
      const dist = 3.78;
      camera.fov = 38;
      camera.updateProjectionMatrix();
      camera.position.set(0.04 + Math.sin(tableAzimuth) * dist, 2.28, Math.cos(tableAzimuth) * dist);
      camera.lookAt(0.02, 1.08, 0);
      return;
    }
    const radius = 5.55;
    camera.fov = 40;
    camera.updateProjectionMatrix();
    camera.position.set(Math.sin(tableAzimuth) * radius, 4.02, Math.cos(tableAzimuth) * radius);
    camera.lookAt(0, 1.04, -0.35);
  }

  function applyOverviewCameraPose() {
    if (!camera) return;
    const isUltra = overviewWideLevel === "ultrawide";
    camera.fov = isUltra ? 58 : 52;
    camera.updateProjectionMatrix();
    const dist = isUltra ? 14.2 : 11.8;
    const camY = isUltra ? 11.4 : 9.6;
    const cx = Math.sin(overviewAzimuth) * dist;
    const cz = Math.cos(overviewAzimuth) * dist;
    camera.position.set(cx, camY, cz);
    camera.lookAt(0, 0.3, 0.55);
  }

  function init3DOverview(config) {
    const theme = config.roomTheme || {};
    applyOverviewCameraPose();

    addRoomShell(theme, true);

    // Wide central Indochine tile medallion carpet spanning the 5-bay hall
    const hallRug = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 48),
      new THREE.MeshStandardMaterial({ map: getVietTileRugTex(), transparent: true, roughness: 0.85 })
    );
    hallRug.rotation.x = -Math.PI / 2;
    hallRug.position.set(0, 0.014, 0.45);
    hallRug.receiveShadow = true;
    scene.add(hallRug);

    // Spacious 5-bay staggered arc layout (Gian Trái / Gian Giữa / Gian Phải) so all 6 tables & pills never overlap!
    const tableSlots = [
      [-5.35, -1.15],
      [0, -2.55],
      [5.35, -1.15],
      [-5.05, 2.35],
      [0, 3.35],
      [5.05, 2.35]
    ];
    overviewTables = [];

    config.tables.slice(0, 6).forEach((tbl, tIdx) => {
      const slot = tableSlots[tIdx % tableSlots.length];
      const tx = slot[0];
      const tz = slot[1];
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, 0, tz);

      // Sub-rug per table
      const miniRug = new THREE.Mesh(
        new THREE.CircleGeometry(1.55, 32),
        new THREE.MeshStandardMaterial({ map: getVietTileRugTex(), transparent: true, roughness: 0.85 })
      );
      miniRug.rotation.x = -Math.PI / 2;
      miniRug.position.y = 0.02;
      miniRug.receiveShadow = true;
      tGroup.add(miniRug);

      // Polished round table top & leg
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(1.04, 0.99, 0.1, 28),
        new THREE.MeshStandardMaterial({ map: getWoodTableTex(), roughness: 0.45, metalness: 0.06 })
      );
      top.position.y = 0.64;
      top.castShadow = true;
      top.receiveShadow = true;
      tGroup.add(top);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.26, 0.62, 16),
        new THREE.MeshStandardMaterial({ color: 0x58331c, roughness: 0.55 })
      );
      leg.position.y = 0.31;
      leg.castShadow = true;
      tGroup.add(leg);

      // Miniature teapot & cups
      const miniPot = makeDetailedTeapot(tIdx === config.recommendedIdx ? 0xc85a32 : 0x9c4228);
      miniPot.scale.set(0.75, 0.75, 0.75);
      miniPot.position.y = 0.69;
      tGroup.add(miniPot);

      let ringMat = null;
      if (tIdx === config.recommendedIdx) {
        ringMat = new THREE.MeshBasicMaterial({
          color: 0xf4a836,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.86
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(1.58, 1.82, 36), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        tGroup.add(ring);
      }

      // Seated stylized seniors around each table (front seats filled first so 2-3 person tables look lively)
      const seatAngles = [2.28, 0.86, -2.35, -0.78];
      tbl.members.slice(0, 4).forEach((m, mIdx) => {
        const built = makeLowPolySenior(m, false, null, theme.cushionHex, m.hat, true);
        built.group.scale.set(0.62, 0.62, 0.62);
        const ang = seatAngles[mIdx];
        built.group.position.set(Math.cos(ang) * 1.38, 0, Math.sin(ang) * 1.38);
        built.group.rotation.y = Math.atan2(-Math.cos(ang), -Math.sin(ang));
        tGroup.add(built.group);
      });

      const anchor = new THREE.Object3D();
      anchor.position.set(0, 1.5, 0);
      tGroup.add(anchor);

      scene.add(tGroup);
      overviewTables.push({
        idx: tIdx,
        table: tbl,
        anchor,
        ringMat
      });
    });

    const hostBuild = makeHybrid25DSenior(
      { name: "Trợ lý Chị Trà", gender: "female", outfitColor: "#D98A2B", hat: "hair-bun", isHost: true },
      false,
      null,
      theme.cushionHex,
      "hair-bun",
      false
    );
    hostGroup = hostBuild.group;
    hostGroup.scale.set(0.76, 0.76, 0.76);
    hostGroup.position.set(0, 0, -4.15);
    hostGroup.lookAt(0, 0, 2);
    scene.add(hostGroup);
  }

  function init3DTableCloseUp(config) {
    const theme = config.roomTheme || {};
    applyTableCameraPose();

    addRoomShell(theme, false);

    // Traditional Indochine Gạch Bông circular rug beneath the tea table
    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(2.85, 56),
      new THREE.MeshStandardMaterial({
        map: getVietTileRugTex(),
        transparent: true,
        roughness: 0.85,
        metalness: 0.02
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.015;
    rug.receiveShadow = true;
    scene.add(rug);

    // Hanging Silk Lantern gently swaying above table
    lanternGroup = makeSilkLantern(0xffc966);
    lanternGroup.scale.set(0.88, 0.88, 0.88);
    lanternGroup.position.set(-0.55, 2.48, -0.35);
    scene.add(lanternGroup);

    // Carved Wooden Tea Cabinet (tủ chè cổ) on back-right with tea canisters & bonsai
    const cabGroup = new THREE.Group();
    cabGroup.position.set(2.15, 0, -3.25);
    const cabWood = new THREE.MeshStandardMaterial({ color: 0x6b4125, roughness: 0.52, metalness: 0.06 });
    const cabTopMat = new THREE.MeshStandardMaterial({ color: 0x52301a, roughness: 0.45 });

    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.96, 0.68), cabWood);
    cabBody.position.y = 0.52;
    cabBody.castShadow = true;
    cabBody.receiveShadow = true;
    cabGroup.add(cabBody);

    const cabTop = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.08, 0.76), cabTopMat);
    cabTop.position.y = 1.02;
    cabGroup.add(cabTop);

    // Brass cabinet pulls
    [-0.35, 0.35].forEach((px) => {
      const pull = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.012, 8, 14),
        new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.6, roughness: 0.35 })
      );
      pull.position.set(px, 0.54, 0.35);
      cabGroup.add(pull);
    });

    // Porcelain blue-and-white tea canisters on cabinet
    [-0.58, -0.22].forEach((jx) => {
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.11, 0.24, 16),
        new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.3 })
      );
      jar.position.set(jx, 1.18, 0);
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.05, 14),
        new THREE.MeshStandardMaterial({ color: 0x2c567a, roughness: 0.35 })
      );
      lid.position.set(jx, 1.32, 0);
      cabGroup.add(jar, lid);
    });

    const cabBonsai = makeTableItemMesh("bonsai-mini");
    cabBonsai.scale.set(1.25, 1.25, 1.25);
    cabBonsai.position.set(0.48, 1.06, 0);
    cabGroup.add(cabBonsai);
    scene.add(cabGroup);

    // Central Sculpted Rosewood Round Tea Table
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.56, 1.5, 0.11, 40),
      new THREE.MeshStandardMaterial({
        map: getWoodTableTex(),
        roughness: 0.38,
        metalness: 0.08
      })
    );
    tableTop.position.y = 0.77;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    const tableRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.54, 0.038, 12, 44),
      new THREE.MeshStandardMaterial({ color: 0x59321b, roughness: 0.42 })
    );
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.y = 0.78;
    tableGroup.add(tableRim);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.34, 0.72, 20),
      new THREE.MeshStandardMaterial({ color: 0x542f19, roughness: 0.55 })
    );
    pedestal.position.y = 0.36;
    pedestal.castShadow = true;
    tableGroup.add(pedestal);

    for (let f = 0; f < 4; f++) {
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.09, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x4a2814, roughness: 0.58 })
      );
      foot.position.y = 0.05;
      foot.rotation.y = (f * Math.PI) / 2 + Math.PI / 4;
      foot.castShadow = true;
      tableGroup.add(foot);
    }
    scene.add(tableGroup);

    // Wooden Tea Tray + Detailed Tử Sa Teapot + Steam
    const tray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.4, 0.035, 24),
      new THREE.MeshStandardMaterial({ color: 0x4b2b17, roughness: 0.45 })
    );
    tray.position.set(0, 0.84, 0);
    tray.receiveShadow = true;
    scene.add(tray);

    const teapot = makeDetailedTeapot(0xa44528);
    teapot.position.set(0, 0.85, 0);
    scene.add(teapot);

    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.052, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfffdf8, transparent: true, opacity: 0.55 })
      );
      puff.position.set((i - 2) * 0.035, 1.22 + i * 0.14, 0);
      scene.add(puff);
      steamParticles.push({ mesh: puff, phase: i * 1.15, baseX: (i - 2) * 0.028 });
    }

    // Sweet sunflower seed / lotus candy plate + User's chosen table item
    const snackPlate = makeTableItemMesh("snack-plate");
    snackPlate.position.set(-0.52, 0.83, 0.36);
    scene.add(snackPlate);

    const itemMesh = makeTableItemMesh(config.userItem || "bonsai-mini");
    itemMesh.position.set(0.52, 0.83, -0.34);
    scene.add(itemMesh);

    // 5 Seated Seniors + 5 Individual Celadon Teacups spread cleanly across X so nobody overlaps from camera!
    // User ("Bạn") sits at angIdx 0 (-2.78 open left) so outfit/accessories/rosette stay 100% visible in Hybrid 3D.
    const seatAngles = [-2.78, -1.78, -0.78, 0.28, 1.48];
    seatObjects = [];
    const existing = config.table.members.slice(0, 4).map((m, idx) => ({
      member: m,
      angIdx: idx + 1,
      isUser: false
    }));
    existing.push({
      member: {
        name: config.userName,
        gender: config.userGender || "male",
        province: config.userProvince,
        hat: config.userAccessory || "none",
        outfitId: config.userOutfitId || "",
        titleFrameId: config.userTitleFrame || "none",
        badge: config.userBadge || "Bạn"
      },
      angIdx: 0,
      isUser: true
    });

    existing.forEach((slot, idx) => {
      const m = slot.member;
      const ang = seatAngles[slot.angIdx];
      const radius = 2.04;
      const built = makeHybrid25DSenior(
        m,
        slot.isUser,
        config.userOutfitColor,
        theme.cushionHex,
        slot.isUser ? config.userAccessory : m.hat,
        true,
        slot.isUser ? config.userOutfitId : m.outfitId
      );
      built.group.scale.set(1.16, 1.16, 1.16);
      built.group.position.set(Math.cos(ang) * radius, 0, Math.sin(ang) * radius);
      built.group.lookAt(0, 0, 0);
      scene.add(built.group);

      // Personal teacup on the table facing this seat
      const cup = makeTeacupMesh();
      cup.position.set(Math.cos(ang) * 1.05, 0.83, Math.sin(ang) * 1.05);
      scene.add(cup);

      seatObjects.push({
        idx,
        name: m.name,
        badge: m.badge || (slot.isUser ? "Bạn" : "Đang nghe"),
        titleFrameId: m.titleFrameId || "none",
        isRealPeer: Boolean(m.isRealPeer),
        isUser: slot.isUser,
        group: built.group,
        head: built.head,
        billboard: built.billboard,
        ringMat: built.ringMat
      });
    });

    const hostBuild = makeHybrid25DSenior(
      { name: "Trợ lý Chị Trà", gender: "female", outfitColor: "#D98A2B", hat: "hair-bun", isHost: true },
      false,
      null,
      theme.cushionHex,
      "hair-bun",
      false
    );
    hostGroup = hostBuild.group;
    hostGroup.position.set(2.15, 0, -2.25);
    hostGroup.lookAt(0, 0, 0);
    scene.add(hostGroup);
  }

  function init3DProfileShowcase(config) {
    const theme = config.roomTheme || {};
    applyTableCameraPose();

    addRoomShell(theme, false);

    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 48),
      new THREE.MeshStandardMaterial({ map: getVietTileRugTex(), transparent: true, roughness: 0.85 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.015;
    rug.receiveShadow = true;
    scene.add(rug);

    // User's 2.5D character sprite mounted on 3D carved chair
    const userMember = {
      name: config.userName || "Anh Tám Vườn",
      gender: config.userGender || "male",
      hat: config.userAccessory || "glasses",
      titleFrameId: config.userTitleFrame || "none"
    };
    const built = makeHybrid25DSenior(
      userMember,
      true,
      config.userOutfitColor || "#6E4A35",
      0x2e5e4e,
      config.userAccessory || "glasses",
      true,
      config.userOutfitId || ""
    );
    built.group.scale.set(1.24, 1.24, 1.24);
    built.group.position.set(-0.62, 0, -0.05);
    built.group.rotation.y = 0.34;
    scene.add(built.group);

    seatObjects = [
      {
        idx: 0,
        name: `${config.userName || "Anh Tám Vườn"} · ${config.userAge || 65}t`,
        titleFrameId: config.userTitleFrame || "none",
        badge: "Bạn",
        isUser: true,
        group: built.group,
        head: built.head,
        ringMat: built.ringMat
      }
    ];

    // Personal Rosewood Tea Table on the right showcasing the selected/previewed Table Item enlarged
    const sideTable = new THREE.Group();
    sideTable.position.set(0.64, 0, 0.28);

    const tTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.66, 0.62, 0.08, 32),
      new THREE.MeshStandardMaterial({ map: getWoodTableTex(), roughness: 0.38, metalness: 0.08 })
    );
    tTop.position.y = 0.68;
    tTop.castShadow = true;
    tTop.receiveShadow = true;
    sideTable.add(tTop);

    const tPed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.19, 0.64, 16),
      new THREE.MeshStandardMaterial({ color: 0x542f19, roughness: 0.55 })
    );
    tPed.position.y = 0.32;
    tPed.castShadow = true;
    sideTable.add(tPed);

    const cup = makeTeacupMesh();
    cup.scale.set(1.2, 1.2, 1.2);
    cup.position.set(-0.32, 0.72, 0.18);
    sideTable.add(cup);

    profileItemGroup = makeTableItemMesh(config.userItem || "am-tu-sa");
    profileItemGroup.scale.set(1.75, 1.75, 1.75);
    profileItemGroup.position.set(0.06, 0.72, -0.02);
    sideTable.add(profileItemGroup);

    profileItemAnchor = new THREE.Object3D();
    profileItemAnchor.position.set(0.08, 1.46, 0);
    sideTable.add(profileItemAnchor);

    scene.add(sideTable);
  }

  function init3DScene(config) {
    if (!window.THREE) return false;
    try {
      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(300, Math.round(rect.width || 440));
      const height = Math.max(200, Math.round(rect.height || 300));

      renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
      }
      if (THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 70);

      if (config.viewMode === "overview") {
        init3DOverview(config);
      } else if (config.viewMode === "profile") {
        init3DProfileShowcase(config);
      } else {
        init3DTableCloseUp(config);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  function updateOverviewTags3D() {
    if (!tagsLayerEl || !camera || !canvasEl) return;
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;
    let html = "";

    overviewTables.forEach((item) => {
      const v = new THREE.Vector3();
      item.anchor.getWorldPosition(v);
      v.project(camera);
      const sx = Math.max(58, Math.min(width - 58, (v.x * 0.5 + 0.5) * width));
      const sy = Math.max(24, Math.min(height - 10, (-v.y * 0.5 + 0.5) * height));
      const isRec = item.idx === currentConfig.recommendedIdx;
      const count = item.table.members.length;
      const hostMark = item.table.isHostNamed ? " · Chủ bàn" : "";
      const text = isRec
        ? `${item.table.shortLabel} · Gợi ý (${count}/5)`
        : `${item.table.shortLabel}${hostMark} · ${count}/5`;
      html += `<span class="seat-status-tag ${isRec ? "active-speaker" : ""}" style="left:${sx.toFixed(0)}px;top:${sy.toFixed(0)}px">${escHtml(text)}</span>`;
    });

    tagsLayerEl.innerHTML = html;
  }

  const FRAME_SHORT_LABELS = {
    "tri-am": "Tri Âm",
    "thi-huu": "Thi Hữu",
    "ky-thu": "Kỳ Thủ",
    "giu-lua": "Giữ Lửa",
    "dong-ngu": "Đồng Ngũ",
    "cay-cao": "Cây Cao",
    "tam-an": "Tâm An",
    "kien-tuong": "Kiện Tướng"
  };

  function formatSeatTagHtml(opts) {
    const fId = String(opts.titleFrameId || "none").replace(/[^a-z0-9_-]/gi, "");
    const fShort = FRAME_SHORT_LABELS[fId] || "";
    const prefix = fShort ? `<em class="tag-frame-pill">${escHtml(fShort)}</em> ` : "";
    const liveDot = opts.isRealPeer ? `<i class="tag-live-dot" aria-hidden="true"></i>` : "";
    const frameCls = fId !== "none" ? `has-frame frame-${fId}` : "";
    const spkCls = opts.isActive ? "active-speaker" : "";
    return `<span class="seat-status-tag ${spkCls} ${frameCls}" style="left:${opts.sx.toFixed(0)}px;top:${opts.sy.toFixed(0)}px">${liveDot}${prefix}${escHtml(opts.label)}</span>`;
  }

  function updateTagOverlays3D() {
    if (!tagsLayerEl || !camera || !canvasEl) return;
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;
    let html = "";

    seatObjects.forEach((s, i) => {
      const v = new THREE.Vector3();
      s.head.getWorldPosition(v);
      v.y += 0.44;
      v.project(camera);
      const sx = Math.max(82, Math.min(width - 82, (v.x * 0.5 + 0.5) * width));
      const sy = Math.max(28, Math.min(height - 8, (-v.y * 0.5 + 0.5) * height));
      const isActive = i === activeSeatIdx;
      const shortName = s.isUser ? "Bạn" : s.name;
      const label = isActive ? `${shortName} · Nói` : s.badge === "Mời trà" ? `${shortName} · Trà` : shortName;
      html += formatSeatTagHtml({
        sx,
        sy,
        isActive,
        label,
        titleFrameId: s.titleFrameId,
        isRealPeer: s.isRealPeer
      });
      if (activeStickerPop && activeStickerPop.seatIdx === i && activeStickerPop.expiresAt > Date.now()) {
        const popY = Math.max(26, sy - 30);
        html += `<span class="seat-sticker-pop" style="left:${sx.toFixed(0)}px;top:${popY.toFixed(0)}px;background:${escHtml(activeStickerPop.bg)};color:${escHtml(activeStickerPop.color)};border-color:${escHtml(activeStickerPop.color)}">${escHtml(activeStickerPop.label)}</span>`;
      }
    });

    tagsLayerEl.innerHTML = html;
  }

  function coverImageRect(boxX, boxY, boxW, boxH, srcW, srcH) {
    const scale = Math.max(boxW / srcW, boxH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    return {
      x: boxX + (boxW - drawW) * 0.5,
      y: boxY + (boxH - drawH) * 0.5,
      w: drawW,
      h: drawH
    };
  }

  function drawOverview25D(now) {
    if (!canvasEl || !currentConfig) return;
    ensureAssets25DLoaded();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = containerEl.getBoundingClientRect();
    const w = Math.max(300, Math.round(rect.width || 440));
    const h = Math.max(220, Math.round(rect.height || 330));
    if (canvasEl.width !== Math.round(w * dpr) || canvasEl.height !== Math.round(h * dpr)) {
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
    }
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const theme = currentConfig.roomTheme || {};
    const isUltraWide = overviewWideLevel === "ultrawide";
    const panShift = -pan25DX * w * 0.65;
    const wideRect = isUltraWide
      ? coverImageRect(panShift * 0.45 - w * 0.04, 0, w * 1.08, h, 960, 720)
      : coverImageRect(panShift - w * 0.10, -h * 0.04, w * 1.20, h * 1.08, 960, 720);

    if (assets25D.lobbyReady && assets25D.lobbyImg) {
      ctx.drawImage(assets25D.lobbyImg, wideRect.x, wideRect.y, wideRect.w, wideRect.h);
    } else {
      ctx.fillStyle = theme.wall2D || "#F6ECDA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = theme.floor2D || "#D6B083";
      ctx.fillRect(0, h * 0.3, w, h * 0.7);
      ctx.fillStyle = "#6B4125";
      ctx.fillRect(0, h * 0.28, w, h * 0.03);
    }

    // Gentle sunlit glow shimmer over ceiling lanterns
    const shimmer = 0.14 + Math.sin((now || 0) * 0.0025) * 0.04;
    const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.18, 10, w * 0.5, h * 0.35, w * 0.55);
    sunGrad.addColorStop(0, `rgba(255, 226, 150, ${shimmer.toFixed(3)})`);
    sunGrad.addColorStop(1, "rgba(255, 226, 150, 0)");
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Chị Trà standing gracefully beside the carved back tea counter
    const hostX = wideRect.x + wideRect.w * 0.5 + Math.sin((now || 0) * 0.001) * 14;
    const hostBottomY = wideRect.y + wideRect.h * 0.455;
    const hostH = wideRect.h * 0.165;
    const hostW = hostH * (SPRITE_CELL_W / SPRITE_CELL_H);
    const hostSpr = composeSeniorSpriteCanvas({
      gender: "female",
      pose: "stand",
      outfitColor: "#D98A2B",
      accessory: "hair-bun",
      isHost: true
    });
    ctx.drawImage(hostSpr, hostX - hostW * 0.5, hostBottomY - hostH, hostW, hostH);

    // 6 Interactive Tables across the open honey-oak floor bays
    const normSlots = [
      { nx: 0.21, ny: 0.56, sc: 0.80 },
      { nx: 0.50, ny: 0.53, sc: 0.78 },
      { nx: 0.79, ny: 0.56, sc: 0.80 },
      { nx: 0.20, ny: 0.82, sc: 0.98 },
      { nx: 0.50, ny: 0.84, sc: 1.00 },
      { nx: 0.80, ny: 0.82, sc: 0.98 }
    ];
    let tagHtml = "";

    currentConfig.tables.slice(0, 6).forEach((tbl, tIdx) => {
      const slot = normSlots[tIdx % normSlots.length];
      const cx = wideRect.x + slot.nx * wideRect.w;
      const cy = wideRect.y + slot.ny * wideRect.h;
      const sc = slot.sc * (h / 300) * (isUltraWide ? 0.90 : 1.0);
      const isRec = tIdx === currentConfig.recommendedIdx;
      const lobbyMembers = tbl.members.slice();
      if (typeof currentConfig.activeTableIdx === "number" && tIdx === currentConfig.activeTableIdx) {
        lobbyMembers[0] = {
          name: currentConfig.userName || "Bạn",
          gender: currentConfig.userGender || "male",
          outfitColor: currentConfig.userOutfitColor || "#2E5E4E",
          outfitId: currentConfig.userOutfitId || "",
          hat: currentConfig.userAccessory || "none",
          titleFrameId: currentConfig.userTitleFrame || "none"
        };
      }

      // Woven medallion rug beneath each table
      ctx.save();
      ctx.fillStyle = "rgba(247, 239, 224, 0.9)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4 * sc, 46 * sc, 21 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isRec ? "#EFA026" : "#2E5E4E";
      ctx.lineWidth = isRec ? 3.2 : 1.5;
      ctx.stroke();

      // Back row seated 2.5D sprites (slots 0, 1)
      const seatOffsets = [
        { dx: -28 * sc, dy: -4 * sc, flip: false, pose: "front" },
        { dx: 28 * sc, dy: -4 * sc, flip: true, pose: "front" },
        { dx: -22 * sc, dy: 14 * sc, flip: false, pose: "back" },
        { dx: 22 * sc, dy: 14 * sc, flip: true, pose: "back" }
      ];
      const sprH = 44 * sc;
      const sprW = sprH * (SPRITE_CELL_W / SPRITE_CELL_H);

      lobbyMembers.slice(0, 2).forEach((m, idx) => {
        const o = seatOffsets[idx];
        const spr = composeSeniorSpriteCanvas({
          gender: m.gender || (/^(Chị|Bà|Cô|Dì|Thím)/i.test(m.name || "") ? "female" : "male"),
          pose: o.pose,
          outfitColor: m.outfitColor || "#2E5E4E",
          outfitId: m.outfitId || "",
          accessory: m.hat || "none",
          titleFrameId: m.titleFrameId || "none"
        });
        ctx.save();
        ctx.translate(cx + o.dx, cy + o.dy + 10 * sc);
        if (o.flip) ctx.scale(-1, 1);
        ctx.drawImage(spr, -sprW * 0.5, -sprH, sprW, sprH);
        ctx.restore();
      });

      // Carved round wooden table
      ctx.fillStyle = "rgba(35, 22, 12, 0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8 * sc, 28 * sc, 13 * sc, 0, 0, Math.PI * 2);
      ctx.fill();

      const tGrad = ctx.createRadialGradient(cx - 5 * sc, cy - 3 * sc, 2, cx, cy, 28 * sc);
      tGrad.addColorStop(0, "#8B4E2B");
      tGrad.addColorStop(1, "#522A14");
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1 * sc, 27 * sc, 12.5 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3E1E0E";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Tiny Tử Sa pot center
      drawPainterlyTableItem25D(ctx, isRec ? "binh-sen" : "am-tu-sa", cx, cy - 3 * sc, 0.42 * sc, now);

      // Front row seated sprites (slots 2, 3)
      lobbyMembers.slice(2, 4).forEach((m, mIdx) => {
        const o = seatOffsets[2 + mIdx];
        const spr = composeSeniorSpriteCanvas({
          gender: m.gender || (/^(Chị|Bà|Cô|Dì|Thím)/i.test(m.name || "") ? "female" : "male"),
          pose: o.pose,
          outfitColor: m.outfitColor || "#2E5E4E",
          outfitId: m.outfitId || "",
          accessory: m.hat || "none",
          titleFrameId: m.titleFrameId || "none"
        });
        ctx.save();
        ctx.translate(cx + o.dx, cy + o.dy + 10 * sc);
        if (o.flip) ctx.scale(-1, 1);
        ctx.drawImage(spr, -sprW * 0.5, -sprH, sprW, sprH);
        ctx.restore();
      });
      ctx.restore();

      const sx = Math.max(76, Math.min(w - 76, cx));
      const sy = Math.max(24, Math.min(h - 10, cy - 28 * sc));
      const count = tbl.members.length;
      const hostMark = tbl.isHostNamed ? " · Chủ bàn" : "";
      const text = isRec ? `${tbl.shortLabel} · Gợi ý (${count}/5)` : `${tbl.shortLabel}${hostMark} · ${count}/5`;
      tagHtml += `<span class="seat-status-tag ${isRec ? "active-speaker" : ""}" style="left:${sx.toFixed(0)}px;top:${sy.toFixed(0)}px">${escHtml(text)}</span>`;
    });

    if (tagsLayerEl) {
      tagsLayerEl.innerHTML = tagHtml;
    }
  }

  function drawTableCloseUp25D(now) {
    if (!canvasEl || !currentConfig) return;
    ensureAssets25DLoaded();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = containerEl.getBoundingClientRect();
    const w = Math.max(300, Math.round(rect.width || 440));
    const h = Math.max(220, Math.round(rect.height || 330));
    if (canvasEl.width !== Math.round(w * dpr) || canvasEl.height !== Math.round(h * dpr)) {
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
    }
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const theme = currentConfig.roomTheme || {};
    const panShift = -pan25DX * w * 0.55;
    const bgRect = coverImageRect(panShift - w * 0.04, 0, w * 1.08, h, 960, 720);

    if (assets25D.tableReady && assets25D.tableImg) {
      ctx.drawImage(assets25D.tableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
    } else {
      ctx.fillStyle = theme.wall2D || "#F6ECDA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = theme.floor2D || "#DFC6A2";
      ctx.fillRect(0, h * 0.35, w, h * 0.65);
    }

    // Subtle glowing silk lantern halo on upper-left & warm window sunbeams
    const lanternPulse = 0.20 + Math.sin((now || 0) * 0.003) * 0.05;
    const lx = bgRect.x + bgRect.w * 0.365;
    const ly = bgRect.y + bgRect.h * 0.16;
    const lg = ctx.createRadialGradient(lx, ly, 4, lx, ly, bgRect.h * 0.22);
    lg.addColorStop(0, `rgba(255, 224, 130, ${lanternPulse.toFixed(3)})`);
    lg.addColorStop(1, "rgba(255, 224, 130, 0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    // Helpers for exact 2.5D pelvis-anchored seating & foreground chair/tabletop occlusion
    function drawAnchoredSprite(spr, col, anchorNx, anchorNy, hFrac, flip, isActive, bobY) {
      const anchor = SEAT_ANCHORS[col] || SEAT_ANCHORS[0];
      const sprH = bgRect.h * hFrac;
      const sprW = sprH * (SPRITE_CELL_W / SPRITE_CELL_H);
      const ax = bgRect.x + anchorNx * bgRect.w;
      const ay = bgRect.y + anchorNy * bgRect.h;

      if (isActive) {
        ctx.save();
        const auraY = ay - anchor.v * sprH * 0.55;
        const aura = ctx.createRadialGradient(ax, auraY, 6, ax, auraY, sprW * 0.48);
        aura.addColorStop(0, "rgba(244, 176, 62, 0.44)");
        aura.addColorStop(1, "rgba(244, 176, 62, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(ax, auraY, sprW * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(ax, ay + (bobY || 0));
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(spr, -anchor.u * sprW, -anchor.v * sprH, sprW, sprH);
      ctx.restore();
      return {
        cx: ax,
        headTopY: ay - anchor.v * sprH + (bobY || 0),
        sprH
      };
    }

    function restoreBackdropPoly(ptsNorm) {
      if (!assets25D.tableReady || !assets25D.tableImg) return;
      ctx.save();
      ctx.beginPath();
      ptsNorm.forEach(([pxN, pyN], idx) => {
        const px = bgRect.x + pxN * bgRect.w;
        const py = bgRect.y + pyN * bgRect.h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(assets25D.tableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
      ctx.restore();
    }

    function restoreBackdropEllipse(cxN, cyN, rxN, ryN) {
      if (!assets25D.tableReady || !assets25D.tableImg) return;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(bgRect.x + cxN * bgRect.w, bgRect.y + cyN * bgRect.h, rxN * bgRect.w, ryN * bgRect.h, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(assets25D.tableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
      ctx.restore();
    }

    // 5 exact cushion coordinates calibrated to the carved armchairs of tearoom-table-25d.jpg
    const chairSlots = [
      { nx: 0.246, ny: 0.592, hFrac: 0.375, flip: false, pose: "front", order: 2, tagDx: -8, tagDy: 6 },   // 0: 8:30 left-front (Bạn)
      { nx: 0.345, ny: 0.482, hFrac: 0.355, flip: false, pose: "front", order: 0, tagDx: -28, tagDy: 14 }, // 1: 10:30 left-back
      { nx: 0.523, ny: 0.422, hFrac: 0.330, flip: false, pose: "front", order: 0, tagDx: 16, tagDy: -4 },  // 2: 12:00 top-center
      { nx: 0.712, ny: 0.506, hFrac: 0.345, flip: true, pose: "front", order: 1, tagDx: 0, tagDy: 8 },     // 3: 2:00 right-back
      { nx: 0.688, ny: 0.768, hFrac: 0.305, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 0 }      // 4: 4:30 foreground-right
    ];

    const list = currentConfig.table.members.slice(0, 4).map((m, idx) => ({
      member: m,
      slotIdx: idx + 1,
      seatPosIdx: idx,
      isUser: false
    }));
    // Place user prominently at left-front chair (index 0) so outfit/accessories/face stay visible!
    list.unshift({
      member: {
        name: currentConfig.userName,
        outfitColor: currentConfig.userOutfitColor,
        outfitId: currentConfig.userOutfitId || "",
        hat: currentConfig.userAccessory || "none",
        gender: currentConfig.userGender || "male",
        titleFrameId: currentConfig.userTitleFrame || "none",
        badge: currentConfig.userBadge || "Bạn"
      },
      slotIdx: 0,
      seatPosIdx: list.length,
      isUser: true
    });

    const drawnAnchors = {};
    function renderSeatedSlot(entry) {
      const slot = chairSlots[entry.slotIdx];
      const m = entry.member;
      const isActive = entry.seatPosIdx === activeSeatIdx;
      const isFem = m.gender === "female" || /^(Chị|Bà|Cô|Dì|Thím)/i.test(m.name || "");
      const col = slot.pose === "back" ? 2 : isFem ? 1 : 0;
      const bob = isActive ? Math.sin((now || 0) * 0.006) * 1.8 : Math.sin((now || 0) * 0.002 + entry.slotIdx) * 0.7;
      const spr = composeSeniorSpriteCanvas({
        gender: isFem ? "female" : "male",
        pose: slot.pose,
        outfitColor: m.outfitColor || "#2E5E4E",
        outfitId: m.outfitId || "",
        accessory: m.hat || "none",
        titleFrameId: m.titleFrameId || "none"
      });
      drawnAnchors[entry.slotIdx] = drawAnchoredSprite(spr, col, slot.nx, slot.ny, slot.hFrac, slot.flip, isActive, bob);
    }

    // 1) Draw 3 back chairs (10:30, 12:00, 2:00)
    list
      .filter((entry) => chairSlots[entry.slotIdx].order <= 1)
      .sort((a, b) => chairSlots[a.slotIdx].order - chairSlots[b.slotIdx].order)
      .forEach(renderSeatedSlot);

    // 2) Restore Chair 2:00 outer right armrest, under-table gap & central rosewood tabletop so back knees tuck underneath!
    restoreBackdropPoly([[0.720, 0.520], [0.785, 0.495], [0.795, 0.655], [0.700, 0.650]]);
    restoreBackdropPoly([[0.625, 0.595], [0.695, 0.590], [0.700, 0.655], [0.625, 0.655]]);
    restoreBackdropEllipse(0.510, 0.540, 0.174, 0.116);

    // 3) Draw Chair 0 (8:30 left-front "Bạn") naturally in front of left rug
    list.filter((entry) => entry.slotIdx === 0).forEach(renderSeatedSlot);

    // 4) Center tabletop props + user's equipped table item
    const tblCx = bgRect.x + bgRect.w * 0.506;
    const tblCy = bgRect.y + bgRect.h * 0.508;
    const propScale = (bgRect.h / 330) * 0.96;
    drawPainterlyTableItem25D(ctx, "snack-plate", tblCx - 29 * propScale, tblCy + 11 * propScale, propScale * 0.80, now);
    drawPainterlyTableItem25D(ctx, "am-tu-sa", tblCx, tblCy - 4 * propScale, propScale, now);
    if (currentConfig.userItem) {
      if (currentConfig.userItem === "am-tu-sa") {
        // Distinct personal warm porcelain tasting pot near user side when classic Tử Sa pot is selected
        drawPainterlyTableItem25D(ctx, "am-tu-sa", tblCx - 34 * propScale, tblCy + 26 * propScale, propScale * 0.72, now);
      } else {
        drawPainterlyTableItem25D(ctx, currentConfig.userItem, tblCx + 33 * propScale, tblCy + 6 * propScale, propScale * 0.86, now);
      }
    }

    // Rising aromatic steam wisps above the teapot
    const steamT = (now || 0) * 0.0024;
    for (let s = 0; s < 3; s++) {
      const ph = (steamT + s * 2.1) % (Math.PI * 2);
      const lift = (ph / (Math.PI * 2)) * 28 * propScale;
      const drift = Math.sin(ph * 2 + s) * 4;
      const alpha = Math.max(0, 0.52 * (1 - ph / (Math.PI * 2)));
      ctx.strokeStyle = `rgba(255, 252, 244, ${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tblCx + drift * 0.5, tblCy - 14 * propScale - lift * 0.4);
      ctx.quadraticCurveTo(tblCx + drift * 1.4, tblCy - 24 * propScale - lift * 0.8, tblCx - drift * 0.6, tblCy - 34 * propScale - lift);
      ctx.stroke();
    }

    // 5) Draw foreground-right seat (4:30) and restore Chair 4:30 rear carved wooden backrest behind shoulder
    list.filter((entry) => entry.slotIdx === 4).forEach(renderSeatedSlot);
    restoreBackdropPoly([[0.735, 0.625], [0.805, 0.615], [0.800, 0.900], [0.715, 0.890]]);

    // 6) Standing & walking Trợ lý Chị Trà holding tea tray: waits by left sideboard, walks to table to pour, walks back!
    const pourDur = 4200;
    const elapsed = hostServingTimer > 0 ? Math.max(0, pourDur - hostServingTimer) : 0;
    const pFrac = elapsed / pourDur;
    let hostNx = 0.115;
    let hostNy = 0.655;
    let hostScale = 0.335;
    let hostFlip = false;
    let stepBob = 0;
    let hostActionLabel = "";

    if (hostServingTimer > 0) {
      if (pFrac < 0.36) {
        const k = pFrac / 0.36;
        const ease = k * k * (3 - 2 * k);
        hostNx = 0.115 + ease * 0.290;
        hostNy = 0.655 + Math.sin(ease * Math.PI * 0.5) * 0.185;
        hostScale = 0.335 + ease * 0.025;
        stepBob = -Math.abs(Math.sin((now || 0) * 0.015)) * 3.5;
        hostActionLabel = "Trợ lý Chị Trà · Đang ra mời";
      } else if (pFrac < 0.68) {
        hostNx = 0.405;
        hostNy = 0.840;
        hostScale = 0.360;
        stepBob = Math.sin((now || 0) * 0.004) * 1.2;
        hostActionLabel = "Trợ lý Chị Trà · Rót trà";
      } else {
        const k = (pFrac - 0.68) / 0.32;
        const ease = k * k * (3 - 2 * k);
        hostNx = 0.405 - ease * 0.290;
        hostNy = 0.840 - (1 - Math.cos(ease * Math.PI * 0.5)) * 0.185;
        hostScale = 0.360 - ease * 0.025;
        hostFlip = true;
        stepBob = -Math.abs(Math.sin((now || 0) * 0.015)) * 3.5;
        hostActionLabel = "Trợ lý Chị Trà · Quay lại";
      }
    }

    const hostSpr = composeSeniorSpriteCanvas({
      gender: "female",
      pose: "stand",
      outfitColor: "#D98A2B",
      accessory: "hair-bun",
      isHost: true
    });
    const hx = bgRect.x + hostNx * bgRect.w;
    const hy = bgRect.y + hostNy * bgRect.h;
    ctx.save();
    ctx.fillStyle = "rgba(28, 16, 8, 0.28)";
    ctx.beginPath();
    ctx.ellipse(hx, hy + 2, 16 * (bgRect.h / 720) * 2, 5 * (bgRect.h / 720) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const hostMetrics = drawAnchoredSprite(hostSpr, 3, hostNx, hostNy, hostScale, hostFlip, false, stepBob);

    // Generate clean floating status pills & sticker pops anchored right over each person's head
    let tagHtml = "";
    list.forEach((entry) => {
      const slot = chairSlots[entry.slotIdx];
      const m = entry.member;
      const isActive = entry.seatPosIdx === activeSeatIdx;
      const dm = drawnAnchors[entry.slotIdx];
      if (!dm) return;

      const shortName = entry.isUser ? "Bạn" : m.name;
      const label = isActive ? `${shortName} · Nói` : m.badge === "Mời trà" || m.badge === "Mời bánh" ? `${shortName} · ${m.badge}` : shortName;
      const sx = Math.max(80, Math.min(w - 80, dm.cx + slot.tagDx));
      const sy = Math.max(24, Math.min(h - 8, dm.headTopY - 2 + slot.tagDy));
      tagHtml += formatSeatTagHtml({
        sx,
        sy,
        isActive,
        label,
        titleFrameId: m.titleFrameId,
        isRealPeer: m.isRealPeer
      });
      const matchStickerIdx = entry.seatPosIdx;
      if (activeStickerPop && activeStickerPop.seatIdx === matchStickerIdx && activeStickerPop.expiresAt > Date.now()) {
        const popY = Math.max(24, sy - 30);
        tagHtml += `<span class="seat-sticker-pop" style="left:${sx.toFixed(0)}px;top:${popY.toFixed(0)}px;background:${escHtml(activeStickerPop.bg)};color:${escHtml(activeStickerPop.color)};border-color:${escHtml(activeStickerPop.color)}">${escHtml(activeStickerPop.label)}</span>`;
      }
    });

    if (hostServingTimer > 0 && hostMetrics) {
      tagHtml += `<span class="seat-status-tag" style="left:${Math.max(86, Math.min(w - 86, hostMetrics.cx)).toFixed(0)}px;top:${Math.max(22, hostMetrics.headTopY - 2).toFixed(0)}px">${escHtml(hostActionLabel)}</span>`;
    }

    if (tagsLayerEl) {
      tagsLayerEl.innerHTML = tagHtml;
    }
  }

  function updateProfileTags3D() {
    if (!tagsLayerEl || !camera || !canvasEl || !currentConfig) return;
    const width = canvasEl.clientWidth;
    const height = canvasEl.clientHeight;
    let html = "";

    if (seatObjects[0] && seatObjects[0].head) {
      const v = new THREE.Vector3();
      seatObjects[0].head.getWorldPosition(v);
      v.y += 0.44;
      v.project(camera);
      const sx = Math.max(76, Math.min(width - 76, (v.x * 0.5 + 0.5) * width));
      const sy = Math.max(28, Math.min(height - 10, (-v.y * 0.5 + 0.5) * height));
      html += formatSeatTagHtml({
        sx,
        sy,
        isActive: true,
        label: seatObjects[0].name,
        titleFrameId: seatObjects[0].titleFrameId,
        isRealPeer: false
      });
    }

    if (profileItemAnchor) {
      const vi = new THREE.Vector3();
      profileItemAnchor.getWorldPosition(vi);
      vi.project(camera);
      const ix = Math.max(84, Math.min(width - 96, (vi.x * 0.5 + 0.5) * width));
      const iy = Math.max(30, Math.min(height - 10, (-vi.y * 0.5 + 0.5) * height));
      html += `<span class="seat-status-tag" style="left:${ix.toFixed(0)}px;top:${iy.toFixed(0)}px">${escHtml(currentConfig.itemLabel || "Đồ bày bàn trà")}</span>`;
    }

    tagsLayerEl.innerHTML = html;
  }

  function drawProfileShowcase25D(now) {
    if (!canvasEl || !currentConfig) return;
    ensureAssets25DLoaded();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = containerEl.getBoundingClientRect();
    const w = Math.max(300, Math.round(rect.width || 440));
    const h = Math.max(200, Math.round(rect.height || 280));
    if (canvasEl.width !== Math.round(w * dpr) || canvasEl.height !== Math.round(h * dpr)) {
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
    }
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Warm tea room corner backdrop
    if (assets25D.tableReady && assets25D.tableImg) {
      const bgRect = coverImageRect(0, 0, w, h, 960, 720);
      ctx.save();
      ctx.globalAlpha = 0.42;
      ctx.drawImage(assets25D.tableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
      ctx.restore();
      const wash = ctx.createLinearGradient(0, 0, 0, h);
      wash.addColorStop(0, "rgba(246, 236, 218, 0.72)");
      wash.addColorStop(1, "rgba(223, 198, 162, 0.68)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = "#F6ECDA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8B5D3B";
      ctx.fillRect(0, h * 0.34, w, h * 0.08);
      ctx.fillStyle = "#DFC6A2";
      ctx.fillRect(0, h * 0.42, w, h * 0.58);
    }

    // Floral Indochine rug ellipse
    ctx.fillStyle = "#F7EFE0";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.78, w * 0.42, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Carved wooden armchair scaled accurately behind full-shoe seated portrait
    const px = w * 0.32;
    const baseFootY = h * 0.91;
    const sprH = h * 0.72;
    const sprW = sprH * (SPRITE_CELL_W / SPRITE_CELL_H);
    const sprCol = (currentConfig.userGender || "male") === "female" ? 1 : 0;
    const anch = SEAT_ANCHORS[sprCol];
    const cushY = baseFootY - sprH * (1 - anch.v) + 4;

    ctx.save();
    // Shoe & chair shadow on floral rug
    ctx.fillStyle = "rgba(35, 22, 12, 0.22)";
    ctx.beginPath();
    ctx.ellipse(px + 4, baseFootY - 4, 48, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Carved chair rear backrest + chair front legs down to rug
    ctx.strokeStyle = "#59331B";
    ctx.fillStyle = "#59331B";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px - 32, cushY + 4);
    ctx.lineTo(px - 34, cushY - sprH * 0.36);
    ctx.quadraticCurveTo(px - 4, cushY - sprH * 0.42, px + 26, cushY - sprH * 0.36);
    ctx.lineTo(px + 24, cushY + 4);
    ctx.stroke();
    // Front chair legs beneath seat
    ctx.fillRect(px - 32, cushY + 4, 5, baseFootY - cushY - 12);
    ctx.fillRect(px + 18, cushY + 6, 5, baseFootY - cushY - 12);
    // Dark jade seat cushion right beneath hips
    ctx.fillStyle = "#2E5E4E";
    ctx.beginPath();
    ctx.ellipse(px - 4, cushY + 2, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const sway = Math.sin((now || 0) * 0.0022) * 1.4;
    const spr = composeSeniorSpriteCanvas({
      gender: currentConfig.userGender || "male",
      pose: "front",
      outfitColor: currentConfig.userOutfitColor || "#6E4A35",
      outfitId: currentConfig.userOutfitId || "",
      accessory: currentConfig.userAccessory || "glasses",
      titleFrameId: currentConfig.userTitleFrame || "none"
    });
    ctx.drawImage(spr, px - anch.u * sprW, baseFootY - sprH + sway, sprW, sprH);

    // Rosewood round side table & enlarged painterly Table Item on the right
    const tx = w * 0.72;
    const ty = h * 0.74;
    ctx.fillStyle = "rgba(35, 22, 12, 0.24)";
    ctx.beginPath();
    ctx.ellipse(tx, ty + 18, 44, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#542F19";
    ctx.fillRect(tx - 10, ty - 2, 20, 20);
    const tblGrad = ctx.createRadialGradient(tx - 10, ty - 8, 4, tx, ty - 4, 52);
    tblGrad.addColorStop(0, "#8B4E2B");
    tblGrad.addColorStop(1, "#522A14");
    ctx.fillStyle = tblGrad;
    ctx.beginPath();
    ctx.ellipse(tx, ty - 4, 52, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3B1E0D";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawPainterlyTableItem25D(ctx, currentConfig.userItem || "am-tu-sa", tx, ty - 16, Math.max(1.25, h / 190), now);

    if (tagsLayerEl) {
      const tagPx = Math.max(82, Math.min(w - 82, px));
      const tagTx = Math.max(82, Math.min(w - 82, tx));
      tagsLayerEl.innerHTML =
        formatSeatTagHtml({
          sx: tagPx,
          sy: Math.max(28, baseFootY - sprH - 2),
          isActive: true,
          label: `${currentConfig.userName || "Anh Tám Vườn"} · ${currentConfig.userAge || 65}t`,
          titleFrameId: currentConfig.userTitleFrame || "none",
          isRealPeer: false
        }) +
        `<span class="seat-status-tag" style="left:${tagTx.toFixed(0)}px;top:${Math.max(28, ty - 56).toFixed(0)}px">${escHtml(currentConfig.itemLabel || "Đồ bày bàn trà")}</span>`;
    }
  }

  function updateHybridBillboards(now) {
    if (!camera || !hybridBillboards.length) return;
    const wp = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    hybridBillboards.forEach((entry, idx) => {
      if (!entry || !entry.billboard || !entry.seatGroup) return;
      const rotTarget = entry.pivot || entry.billboard;
      rotTarget.getWorldPosition(wp);
      rotTarget.lookAt(camera.position.x, wp.y, camera.position.z);

      // Gentle breathing bob (and brisk walking step when Chị Trà moves to pour tea)
      const isHostWalking =
        entry.lockFrontOnly &&
        hostGroup &&
        entry.seatGroup === hostGroup &&
        hostServingTimer > 600 &&
        hostServingTimer < 3800;
      const bobAmp = isHostWalking ? 0.045 : 0.012;
      const bobFreq = isHostWalking ? 0.014 : 0.002;
      rotTarget.position.y = entry.baseY + Math.abs(Math.sin(now * bobFreq + idx * 1.1)) * bobAmp;

      if (!entry.lockFrontOnly && entry.tex && entry.spec) {
        entry.seatGroup.getWorldDirection(fwd);
        const toCamX = camera.position.x - wp.x;
        const toCamZ = camera.position.z - wp.z;
        const dot = fwd.x * toCamX + fwd.z * toCamZ;
        const cross = fwd.x * toCamZ - fwd.z * toCamX;
        const wantPose = dot < -0.22 ? "back" : "front";
        if (wantPose !== entry.pose) {
          entry.pose = wantPose;
          entry.tex.image = composeSeniorSpriteCanvas({ ...entry.spec, pose: wantPose });
          entry.tex.needsUpdate = true;
        }
        const sprCol = wantPose === "back" ? 2 : entry.spec.gender === "female" ? 1 : 0;
        const anch = SEAT_ANCHORS[sprCol] || SEAT_ANCHORS[0];
        const wantFlip = wantPose === "front" ? cross < -0.15 : cross > 0.15;
        const flipSign = wantFlip ? -1 : 1;
        entry.billboard.scale.x = flipSign;
        if (entry.pivot && entry.planeW) {
          entry.billboard.position.x = flipSign * (0.5 - anch.u) * entry.planeW;
        }
      }
    });
  }

  function loop(now) {
    animId = requestAnimationFrame(loop);
    if (now - lastFrame < FPS_INTERVAL) return;
    lastFrame = now;

    if (hostServingTimer > 0) {
      hostServingTimer = Math.max(0, hostServingTimer - FPS_INTERVAL);
    }

    if (mode === "3d" && renderer && scene && camera) {
      if (currentConfig && currentConfig.viewMode === "overview") {
        overviewTables.forEach((ot) => {
          if (ot.ringMat) {
            ot.ringMat.opacity = 0.65 + Math.sin(now * 0.007) * 0.25;
          }
        });
        if (hostGroup) {
          hostGroup.position.x = Math.sin(now * 0.0008) * 0.45;
        }
        updateHybridBillboards(now);
        renderer.render(scene, camera);
        updateOverviewTags3D();
      } else if (currentConfig && currentConfig.viewMode === "profile") {
        if (seatObjects[0]) {
          seatObjects[0].ringMat.opacity = 0.75 + Math.sin(now * 0.006) * 0.18;
        }
        if (profileItemGroup) {
          profileItemGroup.rotation.y = now * 0.0009;
        }
        updateHybridBillboards(now);
        renderer.render(scene, camera);
        updateProfileTags3D();
      } else {
        steamParticles.forEach((p) => {
          const t = (now * 0.0012 + p.phase) % 2.4;
          p.mesh.position.y = 1.18 + t * 0.34;
          p.mesh.position.x = p.baseX + Math.sin(now * 0.002 + p.phase) * 0.04;
          p.mesh.material.opacity = Math.max(0, 0.62 - t * 0.25);
        });

        if (lanternGroup) {
          lanternGroup.rotation.z = Math.sin(now * 0.0011) * 0.035;
        }

        seatObjects.forEach((s, i) => {
          const isActive = i === activeSeatIdx;
          s.ringMat.opacity = isActive ? 0.8 + Math.sin(now * 0.008) * 0.18 : 0;
          if (s.billboard) {
            s.billboard.rotation.z = isActive ? Math.sin(now * 0.005) * 0.025 : 0;
          }
        });

        if (hostGroup) {
          const targetX = hostServingTimer > 0 ? 1.45 : 2.15;
          const targetZ = hostServingTimer > 0 ? -0.95 : -2.25;
          hostGroup.position.x += (targetX - hostGroup.position.x) * 0.12;
          hostGroup.position.z += (targetZ - hostGroup.position.z) * 0.12;
        }

        updateHybridBillboards(now);
        renderer.render(scene, camera);
        updateTagOverlays3D();
      }
    } else {
      if (currentConfig && currentConfig.viewMode === "overview") {
        drawOverview25D(now);
      } else if (currentConfig && currentConfig.viewMode === "profile") {
        drawProfileShowcase25D(now);
      } else {
        drawTableCloseUp25D(now);
      }
    }
  }

  function mount(el, canvas, tagsLayer, config, fallbackCb) {
    dispose3D();
    ensureAssets25DLoaded();
    containerEl = el;
    canvasEl = canvas;
    tagsLayerEl = tagsLayer;
    currentConfig = config;
    onFallbackCallback = fallbackCb || null;
    tableAzimuth = 0;
    pan25DX = 0;
    mode = config.preferredMode || "3d";

    if (mode === "3d") {
      const ok = init3DScene(config);
      if (!ok) {
        mode = "2.5d";
        if (onFallbackCallback) onFallbackCallback("auto-fallback");
      }
    }

    if (canvasEl && config) {
      const isOv = config.viewMode === "overview";
      canvasEl.style.cursor = "grab";
      canvasEl.onpointerdown = (ev) => {
        isDraggingOverview = true;
        dragStartX = ev.clientX;
        dragStartAzimuth = isOv ? overviewAzimuth : tableAzimuth;
        dragStartPan = pan25DX;
        canvasEl.style.cursor = "grabbing";
      };
      window.onpointermove = (ev) => {
        if (!isDraggingOverview) return;
        const dx = ev.clientX - dragStartX;
        if (mode === "3d") {
          if (isOv) {
            overviewAzimuth = Math.max(-0.48, Math.min(0.48, dragStartAzimuth - dx * 0.0045));
            applyOverviewCameraPose();
          } else {
            tableAzimuth = Math.max(-0.56, Math.min(0.56, dragStartAzimuth - dx * 0.0048));
            applyTableCameraPose();
          }
        } else {
          const lim = isOv ? 0.11 : 0.045;
          pan25DX = Math.max(-lim, Math.min(lim, dragStartPan - dx * 0.00055));
        }
      };
      window.onpointerup = () => {
        if (isDraggingOverview) {
          isDraggingOverview = false;
          if (canvasEl) canvasEl.style.cursor = "grab";
        }
      };
    }

    // Render frame 0 immediately when in 2.5D so switches & headless screenshots paint without delay
    triggerRenderIf25D();
    lastFrame = 0;
    animId = requestAnimationFrame(loop);
  }

  function toggleOverviewWide() {
    overviewWideLevel = overviewWideLevel === "ultrawide" ? "wide" : "ultrawide";
    overviewAzimuth = 0;
    pan25DX = 0;
    applyOverviewCameraPose();
    return overviewWideLevel;
  }

  function getOverviewWideLevel() {
    return overviewWideLevel;
  }

  function showSeatSticker(seatIdx, label, bg, color) {
    activeSeatIdx = seatIdx;
    activeStickerPop = {
      seatIdx,
      label: label || "Mời trà!",
      bg: bg || "#FFF6DE",
      color: color || "#9E6412",
      expiresAt: Date.now() + 4800
    };
  }

  function setSpeaker(idx) {
    activeSeatIdx = idx;
  }

  function setSeatBadge(idx, badge) {
    if (seatObjects[idx]) {
      seatObjects[idx].badge = badge;
    }
    if (currentConfig && currentConfig.table) {
      if (idx === Math.min(4, (currentConfig.table.members || []).length)) {
        currentConfig.userBadge = badge;
      } else if (currentConfig.table.members && currentConfig.table.members[idx]) {
        currentConfig.table.members[idx].badge = badge;
      }
    }
  }

  function triggerTeaService() {
    hostServingTimer = 4200;
  }

  function getActiveMode() {
    return mode;
  }

  function drawQrToCanvas(ctx, text, x, y, size) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = "#231A14";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    const pad = 6;
    const inner = size - pad * 2;
    if (typeof window.qrcode === "function") {
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(text);
        qr.make();
        const count = qr.getModuleCount();
        const cell = inner / count;
        ctx.fillStyle = "#231A14";
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(x + pad + c * cell, y + pad + r * cell, Math.ceil(cell), Math.ceil(cell));
            }
          }
        }
        return;
      } catch (e) {
        // Fall through to deterministic pattern
      }
    }
    const modules = 21;
    const cell = inner / modules;
    ctx.fillStyle = "#231A14";
    const drawFinder = (fx, fy) => {
      ctx.fillRect(x + pad + fx * cell, y + pad + fy * cell, cell * 7, cell * 7);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x + pad + (fx + 1) * cell, y + pad + (fy + 1) * cell, cell * 5, cell * 5);
      ctx.fillStyle = "#231A14";
      ctx.fillRect(x + pad + (fx + 2) * cell, y + pad + (fy + 2) * cell, cell * 3, cell * 3);
    };
    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) % 9973;
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inFinder = (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8);
        if (!inFinder && ((r * 17 + c * 31 + seed) % 3 === 0)) {
          ctx.fillRect(x + pad + c * cell, y + pad + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  function exportPostcardPng(opts) {
    const o = typeof opts === "object" && opts !== null ? opts : {};
    const userName = o.userName || "Anh Tám Vườn";
    const userAge = o.userAge || 65;
    const provinceName = o.provinceName || "Việt Nam";
    const roomName = o.roomName || "Phòng Trà Sáng";
    const tableName = o.tableName || "Bàn Trà Sen";
    const attendees = Array.isArray(o.attendees) ? o.attendees : [];
    const message = o.message || "Mời các anh chị uống trà buổi sáng!";
    const shareUrl = o.shareUrl || "https://tuoibac.vn";

    const out = document.createElement("canvas");
    out.width = 720;
    out.height = 760;
    const ctx = out.getContext("2d");

    ctx.fillStyle = "#F6EFE2";
    ctx.fillRect(0, 0, 720, 760);
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 692, 732);

    ctx.fillStyle = "#2E5E4E";
    ctx.fillRect(28, 28, 664, 78);
    ctx.fillStyle = "#FFFDF7";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("CHECK-IN BÀN TRÀ TUỔI BẠC", 46, 62);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#E6F0EC";
    ctx.fillText(`${roomName} — ${tableName} · ${timeStr}`, 46, 92);

    if (canvasEl) {
      ctx.drawImage(canvasEl, 32, 120, 656, 300);
    }
    ctx.strokeStyle = "#875434";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 120, 656, 300);

    ctx.fillStyle = "#FFFDF7";
    ctx.fillRect(32, 434, 656, 114);
    ctx.strokeStyle = "#D5C4AA";
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 434, 656, 114);

    ctx.fillStyle = "#B83B2A";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(`Có mặt tại bàn hôm nay (${attendees.length + 1} người):`, 46, 464);

    const allNames = [`${userName} · ${userAge}t (${provinceName})`].concat(
      attendees.map((m) => `${m.name}${m.age ? ` · ${m.age}t` : ""} (${m.province})`)
    );
    const line1 = allNames.slice(0, 2).join("  ·  ");
    const line2 = allNames.slice(2).join("  ·  ");
    ctx.fillStyle = "#231A14";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(line1, 46, 498);
    if (line2) {
      ctx.fillText(line2, 46, 528);
    }

    ctx.fillStyle = "#5A4638";
    ctx.font = "italic 19px sans-serif";
    const clippedMsg = message.length > 64 ? message.slice(0, 61) + "..." : message;
    ctx.fillText(`"${clippedMsg}"`, 34, 582);

    ctx.fillStyle = "#EFE4CE";
    ctx.fillRect(32, 606, 656, 124);
    ctx.strokeStyle = "#9C856B";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 606, 656, 124);

    ctx.fillStyle = "#231A14";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Mời các anh chị vào ngồi chung bàn:", 46, 640);
    ctx.fillStyle = "#B83B2A";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(shareUrl.replace(/^https?:\/\//, ""), 46, 672);
    ctx.fillStyle = "#5A4638";
    ctx.font = "17px sans-serif";
    ctx.fillText("Mở Zalo quét mã QR để vào thẳng quán trà", 46, 704);

    drawQrToCanvas(ctx, shareUrl, 566, 612, 112);

    return out.toDataURL("image/png");
  }

  return {
    mount,
    dispose: dispose3D,
    setSpeaker,
    setSeatBadge,
    showSeatSticker,
    toggleOverviewWide,
    getOverviewWideLevel,
    triggerTeaService,
    getActiveMode,
    drawQrToCanvas,
    exportPostcardPng
  };
})();
