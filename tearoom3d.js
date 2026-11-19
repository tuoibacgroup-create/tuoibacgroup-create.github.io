window.TeaRoomScene = (function () {
  let mode = "2.5d"; // Khóa chuẩn Full 2.5D Cổ Điển (Thiên Long Bát Bộ)
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
    spritesReady: false,
    itemsImg: null,
    itemsReady: false,
    itemsExtraImg: null,
    itemsExtraReady: false,
    viaheItemImg: null,
    viaheItemReady: false,
    accImg: null,
    accReady: false,
    accExtraImg: null,
    accExtraReady: false,
    regAccImg: null,
    regAccReady: false
  };
  const roomBackdropsCache = Object.create(null);
  const ROOM_BACKDROP_URLS = {
    "phong-tra": { lobby: "./assets/tearoom-lobby-25d.jpg?v=20261119a", table: "./assets/tearoom-table-25d.jpg?v=20261119a" },
    "via-he": { lobby: "./assets/room-viahe-lobby.jpg?v=20261119a", table: "./assets/room-viahe-table.jpg?v=20261119a" },
    "phong-tho": { lobby: "./assets/room-tho-lobby.jpg?v=20261119a", table: "./assets/room-tho-table.jpg?v=20261119a" },
    "phong-co": { lobby: "./assets/room-co-lobby.jpg?v=20261119a", table: "./assets/room-co-table.jpg?v=20261119a" },
    "phong-ccb": { lobby: "./assets/room-ccb-lobby.jpg?v=20261119a", table: "./assets/room-ccb-table.jpg?v=20261119a" },
    "phong-cay-canh": { lobby: "./assets/room-caycanh-lobby.jpg?v=20261119a", table: "./assets/room-caycanh-table.jpg?v=20261119a" }
  };

  function getRoomBackdropImg(roomId, kind) {
    const rid = ROOM_BACKDROP_URLS[roomId] ? roomId : "phong-tra";
    if (rid === "phong-tra") {
      return kind === "lobby"
        ? assets25D.lobbyReady ? assets25D.lobbyImg : null
        : assets25D.tableReady ? assets25D.tableImg : null;
    }
    if (!roomBackdropsCache[rid] && typeof Image !== "undefined") {
      const urls = ROOM_BACKDROP_URLS[rid];
      const rec = { lobbyImg: null, lobbyReady: false, tableImg: null, tableReady: false };
      roomBackdropsCache[rid] = rec;
      const lImg = new Image();
      lImg.onload = () => {
        rec.lobbyImg = lImg;
        rec.lobbyReady = true;
        triggerRenderIf25D();
      };
      lImg.src = urls.lobby;
      const tImg = new Image();
      tImg.onload = () => {
        rec.tableImg = tImg;
        rec.tableReady = true;
        triggerRenderIf25D();
      };
      tImg.src = urls.table;
    }
    const entry = roomBackdropsCache[rid];
    if (kind === "lobby") {
      return entry && entry.lobbyReady ? entry.lobbyImg : assets25D.lobbyReady ? assets25D.lobbyImg : null;
    }
    return entry && entry.tableReady ? entry.tableImg : assets25D.tableReady ? assets25D.tableImg : null;
  }

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
    tblImg.src = "./assets/tearoom-table-25d.jpg?v=20261119a";

    const lobImg = new Image();
    lobImg.onload = () => {
      assets25D.lobbyImg = lobImg;
      assets25D.lobbyReady = true;
      triggerRenderIf25D();
    };
    lobImg.onerror = () => {
      assets25D.lobbyReady = false;
    };
    lobImg.src = "./assets/tearoom-lobby-25d.jpg?v=20261119a";

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
    sprImg.src = "./assets/tearoom-sprites.webp?v=20261119a";

    const itmImg = new Image();
    itmImg.onload = () => {
      assets25D.itemsImg = itmImg;
      assets25D.itemsReady = true;
      triggerRenderIf25D();
    };
    itmImg.onerror = () => {
      assets25D.itemsReady = false;
    };
    itmImg.src = "./assets/tearoom-items.webp?v=20261119a";

    const acImg = new Image();
    acImg.onload = () => {
      assets25D.accImg = acImg;
      assets25D.accReady = true;
      composedSpriteCache.clear();
      refreshHybridBillboardsOnLoad();
      triggerRenderIf25D();
    };
    acImg.onerror = () => {
      assets25D.accReady = false;
    };
    acImg.src = "./assets/tearoom-accessories.webp?v=20261119a";

    const itmExImg = new Image();
    itmExImg.onload = () => {
      assets25D.itemsExtraImg = itmExImg;
      assets25D.itemsExtraReady = true;
      triggerRenderIf25D();
    };
    itmExImg.onerror = () => {
      assets25D.itemsExtraReady = false;
    };
    itmExImg.src = "./assets/tearoom-items-extra.webp?v=20261119a";

    const vhItmImg = new Image();
    vhItmImg.onload = () => {
      assets25D.viaheItemImg = vhItmImg;
      assets25D.viaheItemReady = true;
      triggerRenderIf25D();
    };
    vhItmImg.onerror = () => {
      assets25D.viaheItemReady = false;
    };
    vhItmImg.src = "./assets/tearoom-viahe-item.webp?v=20261119a";

    const acExImg = new Image();
    acExImg.onload = () => {
      assets25D.accExtraImg = acExImg;
      assets25D.accExtraReady = true;
      composedSpriteCache.clear();
      refreshHybridBillboardsOnLoad();
      triggerRenderIf25D();
    };
    acExImg.onerror = () => {
      assets25D.accExtraReady = false;
    };
    acExImg.src = "./assets/tearoom-accessories-extra.webp?v=20261119a";

    const regImg = new Image();
    regImg.onload = () => {
      assets25D.regAccImg = regImg;
      assets25D.regAccReady = true;
      composedSpriteCache.clear();
      refreshHybridBillboardsOnLoad();
      triggerRenderIf25D();
    };
    regImg.onerror = () => {
      assets25D.regAccReady = false;
    };
    regImg.src = "./assets/tearoom-regional-acc.webp?v=20261119a";
  }

  function createCanvas2D(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  const ACC_CELL_W = 180;
  const ACC_CELL_H = 150;
  const ITEM_CELL_W = 240;
  const ITEM_CELL_H = 220;

  // Measured opaque sprite bounding boxes inside each 180x150 cell (prevents off-center asset drift)
  const ACC_BBOX = {
    scarf_f: { sx: 42, sy: 14, sw: 95, sh: 124 },
    scarf_b: { sx: 12, sy: 180, sw: 156, sh: 90 },
    cap_f: { sx: 192, sy: 17, sw: 156, sh: 116 },
    cap_b: { sx: 192, sy: 166, sw: 156, sh: 118 },
    khandong_f: { sx: 8, sy: 18, sw: 164, sh: 113 },
    khandong_b: { sx: 13, sy: 158, sw: 154, sh: 134 },
    mutaibeo_f: { sx: 188, sy: 18, sw: 164, sh: 114 },
    mutaibeo_b: { sx: 188, sy: 161, sw: 164, sh: 128 },
    nonquaithao_f: { sx: 11, sy: 12, sw: 158, sh: 125 },
    nonquaithao_b: { sx: 18, sy: 159, sw: 144, sh: 132 },
    khanxep_f: { sx: 216, sy: 23, sw: 133, sh: 103 },
    khanxep_b: { sx: 191, sy: 159, sw: 158, sh: 132 },
    khanran_f: { sx: 402, sy: 9, sw: 96, sh: 132 },
    khanran_b: { sx: 385, sy: 159, sw: 129, sh: 131 }
  };

  function drawCroppedRotated(ctx, img, box, cx, cy, dw, dh, rotRad) {
    ctx.save();
    ctx.translate(cx, cy);
    if (rotRad) ctx.rotate(rotRad);
    ctx.drawImage(img, box.sx, box.sy, box.sw, box.sh, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();
  }

  function drawSpritePreHeadAccessory(ctx, col, acc, outfitId) {
    if (col >= 2) return;
    const isFemale = col === 1;

    // Rear woven underside of Nón Lá behind head/bun
    if (acc === "non-la" && assets25D.accReady && assets25D.accImg) {
      const hx = isFemale ? 47 : 48;
      const hy = isFemale ? -1 : -3;
      ctx.drawImage(assets25D.accImg, ACC_CELL_W * 3, 0, ACC_CELL_W, ACC_CELL_H, hx, hy, 94, 75);
    }

    // Rear neck wrap of Khăn rằn Nam Bộ passes cleanly behind head/chin
    const showKhanRan = acc === "khan-ran-nam-bo" || (outfitId === "ao-ba-ba-nam-bo" && acc !== "scarf");
    if (showKhanRan && assets25D.regAccReady && assets25D.regAccImg) {
      const b = ACC_BBOX.khanran_f;
      const cx = isFemale ? 93.5 : 94;
      const topY = isFemale ? 60 : 57;
      const dw = isFemale ? 52 : 54;
      const dh = isFemale ? 71 : 73;
      const cutRatio = 0.34;
      ctx.drawImage(
        assets25D.regAccImg,
        b.sx,
        b.sy,
        b.sw,
        b.sh * cutRatio,
        cx - dw * 0.5,
        topY,
        dw,
        dh * cutRatio
      );
    }

    // Rear/underside ring of open turbans sits behind the crown so hair never pokes through a front hole
    if (acc === "khan-xep-kinh-bac" && assets25D.regAccReady && assets25D.regAccImg) {
      const cx = isFemale ? 94.5 : 95;
      const cy = isFemale ? 26 : 24;
      const dw = isFemale ? 44 : 42;
      const dh = isFemale ? 34 : 32;
      drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.khanxep_f, cx, cy, dw, dh, 0.36);
    } else if (acc === "khan-dong" && assets25D.accExtraReady && assets25D.accExtraImg) {
      const cx = isFemale ? 94.5 : 95;
      const cy = isFemale ? 26.5 : 24.5;
      const dw = isFemale ? 46 : 44;
      const dh = isFemale ? 32 : 30.5;
      drawCroppedRotated(ctx, assets25D.accExtraImg, ACC_BBOX.khandong_f, cx, cy, dw, dh, 0.28);
    } else if (acc === "non-quai-thao" && assets25D.regAccReady && assets25D.regAccImg) {
      // Rear shadow/rim behind head bun before front palm disc & chin cords
      const cx = isFemale ? 92.5 : 93.5;
      const cy = isFemale ? 35.5 : 33.5;
      const dw = isFemale ? 84 : 82;
      const dh = isFemale ? 66 : 65;
      drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.nonquaithao_f, cx, cy, dw, dh, 0.14);
    }
  }

  function drawSpriteAccessories(ctx, col, spec) {
    const acc = spec.accessory || "none";
    const frameId = spec.titleFrameId || "none";
    const outfitId = spec.outfitId || "";

    const anchors =
      col === 1
        ? { lx: 96.8, rx: 108.3, ey: 42.5, earX: 81.5, earY: 42.0, neckX: 98, neckY: 67, chestX: 88, chestY: 92 }
        : col === 2
          ? { lx: 112, rx: 112, ey: 44, earX: 100, earY: 44, neckX: 118, neckY: 84, chestX: 124, chestY: 118 }
          : col === 3
            ? { lx: 96.5, rx: 107.8, ey: 41.2, earX: 82, earY: 41, neckX: 98, neckY: 64, chestX: 88, chestY: 88 }
            : { lx: 97.5, rx: 108.5, ey: 39.8, earX: 83.5, earY: 39.2, neckX: 100, neckY: 64, chestX: 88, chestY: 90 };

    // Regional & traditional outfit collar/sash/brocade details
    if (col < 2 && (outfitId === "ao-gam-vang" || outfitId === "ao-gam-lam-ngoc")) {
      ctx.save();
      ctx.strokeStyle = outfitId === "ao-gam-lam-ngoc" ? "rgba(246, 214, 128, 0.86)" : "rgba(255, 232, 160, 0.78)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(anchors.neckX - 14, anchors.neckY - 2);
      ctx.lineTo(anchors.neckX + 4, anchors.neckY + 8);
      ctx.stroke();
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-tu-than-bac-ninh") {
      // Yếm đào đỏ thắm bên trong & dải lụa xanh thiên lý Kinh Bắc ngang eo
      ctx.save();
      ctx.fillStyle = "rgba(186, 38, 34, 0.92)";
      ctx.beginPath();
      ctx.moveTo(anchors.neckX - 7, anchors.neckY + 2);
      ctx.lineTo(anchors.neckX + 7, anchors.neckY + 2);
      ctx.lineTo(anchors.neckX + 1, anchors.chestY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(246, 218, 152, 0.82)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      // Dải thắt lưng lụa xanh thiên lý buộc múi
      ctx.fillStyle = "rgba(58, 156, 124, 0.88)";
      ctx.fillRect(anchors.chestX - 10, anchors.chestY + 28, 38, 5);
      ctx.beginPath();
      ctx.moveTo(anchors.chestX + 12, anchors.chestY + 32);
      ctx.lineTo(anchors.chestX + 8, anchors.chestY + 48);
      ctx.lineTo(anchors.chestX + 15, anchors.chestY + 47);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-the-kinh-bac") {
      // Cổ lụa trắng ngà lót trong áo the thâm & khuy đồng cài chéo vai phải
      ctx.save();
      ctx.strokeStyle = "rgba(248, 244, 232, 0.94)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(anchors.neckX, anchors.neckY - 1, 8.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "rgba(218, 178, 96, 0.76)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(anchors.neckX + 2, anchors.neckY + 5);
      ctx.lineTo(anchors.chestX + 18, anchors.chestY + 8);
      ctx.stroke();
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-ngu-than-mien-trung") {
      // Áo ngũ thân tay chẽn Cố đô Huế: đường tà chéo & 5 khuy đồng mạ vàng
      ctx.save();
      ctx.strokeStyle = "rgba(236, 212, 162, 0.82)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(anchors.neckX, anchors.neckY + 4);
      ctx.quadraticCurveTo(anchors.chestX + 18, anchors.chestY - 4, anchors.chestX + 22, anchors.chestY + 26);
      ctx.stroke();
      ctx.fillStyle = "#F0C45A";
      [
        [anchors.neckX + 1, anchors.neckY + 5],
        [anchors.chestX + 11, anchors.neckY + 12],
        [anchors.chestX + 18, anchors.chestY - 1],
        [anchors.chestX + 20, anchors.chestY + 11],
        [anchors.chestX + 21, anchors.chestY + 23]
      ].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-tho-cam-mien-trung") {
      // Dải hoa văn thổ cẩm đỏ-vàng Trường Sơn dệt ngang ngực
      ctx.save();
      ctx.fillStyle = "rgba(184, 48, 36, 0.88)";
      ctx.fillRect(anchors.chestX - 12, anchors.chestY + 4, 42, 6.5);
      ctx.strokeStyle = "#F4CA64";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let dx = -10; dx <= 26; dx += 6) {
        ctx.moveTo(anchors.chestX + dx, anchors.chestY + 9.5);
        ctx.lineTo(anchors.chestX + dx + 3, anchors.chestY + 5);
        ctx.lineTo(anchors.chestX + dx + 6, anchors.chestY + 9.5);
      }
      ctx.stroke();
      ctx.restore();
    } else if (col < 2 && (outfitId === "ao-ba-ba-nam-bo" || outfitId === "ao-ba-ba-mo-ga-nam")) {
      // Hàng cúc ngọc trai dọc giữa áo bà ba Phương Nam
      ctx.save();
      ctx.strokeStyle = outfitId === "ao-ba-ba-mo-ga-nam" ? "rgba(128, 86, 32, 0.42)" : "rgba(235, 232, 224, 0.42)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(anchors.neckX + 1, anchors.neckY + 5);
      ctx.lineTo(anchors.neckX + 2, anchors.chestY + 36);
      ctx.stroke();
      ctx.fillStyle = "#FFFDF6";
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(anchors.neckX + 1.5, anchors.neckY + 10 + k * 9.5, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (col < 2 && outfitId === "ao-lua-tim-hue") {
      ctx.save();
      ctx.fillStyle = "rgba(255, 244, 232, 0.9)";
      ctx.beginPath();
      ctx.arc(anchors.neckX - 2, anchors.neckY + 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (col < 2 && (outfitId === "ao-linh" || outfitId === "ao-kaki-kem")) {
      ctx.save();
      ctx.fillStyle = outfitId === "ao-kaki-kem" ? "rgba(92, 68, 38, 0.34)" : "rgba(38, 52, 28, 0.36)";
      ctx.fillRect(anchors.chestX - 9, anchors.chestY + 18, 18, 4);
      ctx.fillRect(anchors.chestX + 18, anchors.chestY + 15, 18, 4);
      ctx.restore();
    }

    // 1b. Khăn rằn Nam Bộ quàng vai (từ phụ kiện hoặc đi kèm bộ Áo bà ba đen Khăn rằn)
    // Neck-back band already drawn behind head in drawSpritePreHeadAccessory; here we drape the front checkered tails cleanly below chin!
    const showKhanRan = acc === "khan-ran-nam-bo" || (outfitId === "ao-ba-ba-nam-bo" && acc !== "scarf");
    if (showKhanRan) {
      if (assets25D.regAccReady && assets25D.regAccImg) {
        if (col === 2) {
          drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.khanran_b, 120, 100, 68, 69, 0);
        } else {
          const isFemale = col === 1;
          const b = ACC_BBOX.khanran_f;
          const cx = isFemale ? 93.5 : 94;
          const topY = isFemale ? 60 : 57;
          const dw = isFemale ? 52 : 54;
          const dh = isFemale ? 71 : 73;
          const startRatio = 0.28;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, isFemale ? 62 : 59, SPRITE_CELL_W, SPRITE_CELL_H);
          ctx.clip();
          ctx.drawImage(
            assets25D.regAccImg,
            b.sx,
            b.sy + b.sh * startRatio,
            b.sw,
            b.sh * (1 - startRatio),
            cx - dw * 0.5,
            topY + dh * startRatio,
            dw,
            dh * (1 - startRatio)
          );
          ctx.restore();
        }
      }
    }

    // 1. Khăn quàng ấm cổ (2.5D Painterly draped wool/silk scarf nestled naturally around collar beneath chin)
    if (acc === "scarf") {
      if (assets25D.accReady && assets25D.accImg) {
        if (col === 2) {
          drawCroppedRotated(ctx, assets25D.accImg, ACC_BBOX.scarf_b, 119, 86, 62, 36, 0);
        } else {
          const isFemale = col === 1;
          const cx = isFemale ? 94.5 : 95.5;
          const cy = isFemale ? 85 : 82;
          const dw = isFemale ? 42 : 43;
          const dh = isFemale ? 55 : 56;
          drawCroppedRotated(ctx, assets25D.accImg, ACC_BBOX.scarf_f, cx, cy, dw, dh, 0);
        }
      } else {
        ctx.save();
        ctx.strokeStyle = "#8C221A";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        if (col === 2) {
          ctx.arc(118, 78, 17, 0.15 * Math.PI, 0.88 * Math.PI);
        } else {
          ctx.arc(96, 65, 15, 0.12 * Math.PI, 0.92 * Math.PI);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Kính lão gọng vàng & Kính mát mắt trà gọng đồi mồi (Anatomically calibrated to exact 3/4 eye pupils + ear bridge)
    if ((acc === "glasses" || acc === "kinh-ram-tra") && col < 2) {
      const isTeaTint = acc === "kinh-ram-tra";
      ctx.save();
      const lrx = 4.4;
      const lry = 3.2;
      const rrx = 3.7;
      const rry = 3.0;
      const rey = anchors.ey - 0.5;

      // Lens tint: subtle anti-reflective clear vs warm amber-tea sun tint
      ctx.fillStyle = isTeaTint ? "rgba(156, 88, 26, 0.44)" : "rgba(235, 248, 255, 0.18)";
      ctx.beginPath();
      ctx.ellipse(anchors.lx, anchors.ey, lrx, lry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(anchors.rx, rey, rrx, rry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Temple arm resting cleanly on top of ear
      ctx.strokeStyle = isTeaTint ? "rgba(68, 34, 12, 0.94)" : "rgba(104, 66, 18, 0.88)";
      ctx.lineWidth = isTeaTint ? 1.35 : 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(anchors.earX, anchors.earY);
      ctx.lineTo(anchors.lx - lrx, anchors.ey - 0.3);
      ctx.stroke();

      // Dual-pass rim & nose bridge (18K Gold vs Classic Tortoiseshell)
      (isTeaTint
        ? [
          { color: "rgba(56, 26, 10, 0.96)", width: 1.65 },
          { color: "#B86E2E", width: 0.82 }
        ]
        : [
          { color: "rgba(92, 56, 16, 0.92)", width: 1.45 },
          { color: "#F2C14E", width: 0.78 }
        ]
      ).forEach((pass) => {
        ctx.strokeStyle = pass.color;
        ctx.lineWidth = pass.width;
        ctx.beginPath();
        ctx.ellipse(anchors.lx, anchors.ey, lrx, lry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(anchors.rx, rey, rrx, rry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(anchors.lx + lrx, anchors.ey - 0.35);
        ctx.quadraticCurveTo((anchors.lx + anchors.rx) * 0.5, anchors.ey - 1.25, anchors.rx - rrx, rey - 0.25);
        ctx.stroke();
      });

      // Tiny diagonal glass highlight glints
      ctx.strokeStyle = isTeaTint ? "rgba(255, 236, 196, 0.55)" : "rgba(255, 255, 255, 0.62)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(anchors.lx - 2.1, anchors.ey - 1.5);
      ctx.lineTo(anchors.lx - 0.6, anchors.ey - 0.2);
      ctx.moveTo(anchors.rx - 1.6, rey - 1.4);
      ctx.lineTo(anchors.rx - 0.3, rey - 0.2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Mũ cối xanh cựu chiến binh (2.5D Painterly Vietnamese pith helmet fitted snugly over 3/4 crown)
    if (acc === "cap") {
      if (assets25D.accReady && assets25D.accImg) {
        if (col === 2) {
          drawCroppedRotated(ctx, assets25D.accImg, ACC_BBOX.cap_b, 118, 34, 76, 58, 0);
        } else {
          const isFemale = col === 1;
          const cx = isFemale ? 94.5 : 95.5;
          const cy = isFemale ? 25.5 : 23.5;
          const dw = isFemale ? 54 : 52;
          const dh = isFemale ? 40 : 39;
          drawCroppedRotated(ctx, assets25D.accImg, ACC_BBOX.cap_f, cx, cy, dw, dh, -0.04);
        }
      } else {
        ctx.save();
        ctx.fillStyle = "#556B45";
        ctx.beginPath();
        ctx.ellipse(96, 24, 24, 12, -0.06, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Nón lá truyền thống (2.5D Painterly woven palm-leaf cone + silk jawline ribbon)
    if (acc === "non-la") {
      if (assets25D.accReady && assets25D.accImg) {
        if (col === 2) {
          ctx.drawImage(assets25D.accImg, ACC_CELL_W * 2, ACC_CELL_H, ACC_CELL_W, ACC_CELL_H, 62, -4, 114, 88);
        } else {
          const isFemale = col === 1;
          const hx = isFemale ? 47 : 48;
          const hy = isFemale ? -1 : -3;
          const browCutY = isFemale ? 35.5 : 33.5;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, SPRITE_CELL_W, browCutY);
          ctx.clip();
          ctx.drawImage(assets25D.accImg, ACC_CELL_W * 3, 0, ACC_CELL_W, ACC_CELL_H, hx, hy, 94, 75);
          ctx.restore();
          ctx.drawImage(assets25D.accImg, ACC_CELL_W * 2, 0, ACC_CELL_W, ACC_CELL_H, hx, hy, 94, 75);
          ctx.save();
          ctx.strokeStyle = "rgba(156, 44, 34, 0.78)";
          ctx.lineWidth = 1.25;
          ctx.lineCap = "round";
          ctx.beginPath();
          if (!isFemale) {
            ctx.moveTo(85, 46);
            ctx.quadraticCurveTo(93, 59, 102, 60);
            ctx.quadraticCurveTo(106, 59, 108.5, 55.5);
          } else {
            ctx.moveTo(83, 48);
            ctx.quadraticCurveTo(92, 62, 101, 63);
            ctx.quadraticCurveTo(105, 62, 108, 58.5);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 4b. Khăn đóng gấm đỏ lễ thọ & Mũ tai bèo kaki dã ngoại (2.5D Painterly heritage headwear)
    if (acc === "khan-dong" || acc === "mu-tai-beo") {
      if (assets25D.accExtraReady && assets25D.accExtraImg) {
        const isFemale = col === 1;
        if (acc === "khan-dong") {
          if (col === 2) {
            drawCroppedRotated(ctx, assets25D.accExtraImg, ACC_BBOX.khandong_b, 118, 33, 64, 54, 0);
          } else {
            // Front pleated turban band sits cleanly over forehead & crown (underside already drawn behind head)
            const cx = isFemale ? 94.5 : 95;
            const cy = isFemale ? 26.5 : 24.5;
            const dw = isFemale ? 46 : 44;
            const dh = isFemale ? 32 : 30.5;
            const browClipY = isFemale ? 34 : 32;
            ctx.save();
            ctx.fillStyle = "#521012";
            ctx.beginPath();
            ctx.ellipse(cx, cy - 1.5, dw * 0.34, dh * 0.24, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.rect(0, 0, SPRITE_CELL_W, browClipY);
            ctx.clip();
            drawCroppedRotated(ctx, assets25D.accExtraImg, ACC_BBOX.khandong_f, cx, cy, dw, dh, 0.28);
            ctx.restore();
          }
        } else {
          if (col === 2) {
            drawCroppedRotated(ctx, assets25D.accExtraImg, ACC_BBOX.mutaibeo_b, 118, 34, 82, 64, 0);
          } else {
            const cx = isFemale ? 94.5 : 95.5;
            const cy = isFemale ? 25.5 : 23.5;
            const dw = isFemale ? 60 : 57;
            const dh = isFemale ? 42 : 40;
            drawCroppedRotated(ctx, assets25D.accExtraImg, ACC_BBOX.mutaibeo_f, cx, cy, dw, dh, 0.03);
          }
        }
      } else {
        ctx.save();
        ctx.fillStyle = acc === "khan-dong" ? "#8E2020" : "#6D7C56";
        ctx.beginPath();
        ctx.ellipse(96, 22, 24, 11, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4c. Nón quai thao Quan họ & Khăn xếp the đen chữ Nhân (2.5D Painterly Kinh Bắc headwear)
    if (acc === "non-quai-thao" || acc === "khan-xep-kinh-bac") {
      if (assets25D.regAccReady && assets25D.regAccImg) {
        const isFemale = col === 1;
        if (acc === "non-quai-thao") {
          if (col === 2) {
            drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.nonquaithao_b, 117, 42, 92, 84, 0);
          } else {
            const cx = isFemale ? 92.5 : 93.5;
            const cy = isFemale ? 35.5 : 33.5;
            const dw = isFemale ? 84 : 82;
            const dh = isFemale ? 66 : 65;
            // Draw top palm hat disc above browline cleanly on the crown
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, SPRITE_CELL_W, isFemale ? 34 : 32);
            ctx.clip();
            drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.nonquaithao_f, cx, cy, dw, dh, 0.14);
            ctx.restore();
            // Draw hanging ivory silk quai thao tassels outside cheeks & graceful chin loop below jaw
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, isFemale ? 56.5 : 54.5, SPRITE_CELL_W, 42);
            ctx.rect(0, isFemale ? 31 : 29, isFemale ? 79 : 80, 46);
            ctx.rect(isFemale ? 114 : 113, isFemale ? 31 : 29, 60, 46);
            ctx.clip();
            drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.nonquaithao_f, cx, cy, dw, dh, 0.14);
            ctx.restore();
          }
        } else {
          if (col === 2) {
            drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.khanxep_b, 118, 32, 64, 52, 0);
          } else {
            // Front black silk chữ-Nhân pleats clipped cleanly at browline (no awkward white donut hole!)
            const cx = isFemale ? 94.5 : 95;
            const cy = isFemale ? 26 : 24;
            const dw = isFemale ? 44 : 42;
            const dh = isFemale ? 34 : 32;
            const browClipY = isFemale ? 33 : 31;
            ctx.save();
            // Subtle dark silk cap fill inside the upper turban arch so white scalp doesn't peek out awkwardly
            ctx.fillStyle = "#1E2024";
            ctx.beginPath();
            ctx.ellipse(cx, cy - 1.5, dw * 0.36, dh * 0.28, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.rect(0, 0, SPRITE_CELL_W, browClipY);
            ctx.clip();
            drawCroppedRotated(ctx, assets25D.regAccImg, ACC_BBOX.khanxep_f, cx, cy, dw, dh, 0.36);
            ctx.restore();
          }
        }
      } else {
        ctx.save();
        ctx.fillStyle = acc === "non-quai-thao" ? "#D6A856" : "#26282C";
        ctx.beginPath();
        ctx.ellipse(96, 20, acc === "non-quai-thao" ? 36 : 24, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. Refined Title Frame Lapel Pin on chest
    if (col < 2 && FRAME_HEX[frameId]) {
      ctx.save();
      ctx.fillStyle = "rgba(45, 24, 8, 0.25)";
      ctx.beginPath();
      ctx.arc(anchors.chestX + 0.6, anchors.chestY + 1.1, 5.5, 0, Math.PI * 2);
      ctx.fill();

      const pinGrad = ctx.createRadialGradient(anchors.chestX - 1.5, anchors.chestY - 1.5, 0.8, anchors.chestX, anchors.chestY, 5.6);
      pinGrad.addColorStop(0, "#FFF0B3");
      pinGrad.addColorStop(0.65, "#DFA93A");
      pinGrad.addColorStop(1, "#7B5214");
      ctx.fillStyle = pinGrad;
      ctx.strokeStyle = "#56370D";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(anchors.chestX, anchors.chestY, 5.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = FRAME_HEX[frameId];
      ctx.beginPath();
      ctx.arc(anchors.chestX, anchors.chestY, 3.3, 0, Math.PI * 2);
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
    const cacheKey = `${col}|${outfitColor}|${outfitId}|${acc}|${frameId}|${s.isHost ? 1 : 0}|${assets25D.spritesReady ? 1 : 0}|${assets25D.accReady ? 1 : 0}|${assets25D.accExtraReady ? 1 : 0}|${assets25D.regAccReady ? 1 : 0}`;

    if (composedSpriteCache.has(cacheKey)) {
      return composedSpriteCache.get(cacheKey);
    }

    const out = createCanvas2D(SPRITE_CELL_W, SPRITE_CELL_H);
    const ctx = out.getContext("2d");

    if (assets25D.spritesReady && assets25D.spritesImg) {
      drawSpritePreHeadAccessory(ctx, col, acc, outfitId);

      const chCanvas = createCanvas2D(SPRITE_CELL_W, SPRITE_CELL_H);
      const cctx = chCanvas.getContext("2d");
      const sx = col * SPRITE_CELL_W;
      cctx.drawImage(assets25D.spritesImg, sx, 0, SPRITE_CELL_W, SPRITE_CELL_H, 0, 0, SPRITE_CELL_W, SPRITE_CELL_H);

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

      cctx.globalCompositeOperation = "multiply";
      cctx.drawImage(tempMaskCanvas, 0, 0);
      cctx.globalCompositeOperation = "source-over";

      ctx.drawImage(chCanvas, 0, 0);
      drawSpriteAccessories(ctx, col, { accessory: acc, titleFrameId: frameId, outfitId });
    } else {
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

  const TABLE_ITEM_ATLAS_MAP = {
    "am-tu-sa": { sheet: "base", col: 0, row: 0, w: 66, h: 60, yOff: 14 },
    "khay-tra-da": { sheet: "viahe", col: 0, row: 0, w: 70, h: 60, yOff: 14 },
    "binh-sen": { sheet: "base", col: 1, row: 0, w: 58, h: 64, yOff: 12 },
    "bonsai-mini": { sheet: "base", col: 2, row: 0, w: 66, h: 64, yOff: 12 },
    "dia-hat-dua": { sheet: "base", col: 0, row: 1, w: 62, h: 56, yOff: 13 },
    "snack-plate": { sheet: "base", col: 0, row: 1, w: 54, h: 48, yOff: 12 },
    "den-dau": { sheet: "base", col: 1, row: 1, w: 54, h: 66, yOff: 12 },
    "radio-go": { sheet: "base", col: 2, row: 1, w: 62, h: 58, yOff: 13 },
    "khay-trau-cau": { sheet: "extra", col: 0, row: 0, w: 64, h: 54, yOff: 13 },
    "banh-dau-xanh": { sheet: "extra", col: 1, row: 0, w: 64, h: 54, yOff: 13 },
    "long-chim-khuyen": { sheet: "extra", col: 2, row: 0, w: 56, h: 68, yOff: 11 },
    "ban-co-ngoc": { sheet: "extra", col: 0, row: 1, w: 66, h: 56, yOff: 13 },
    "lu-tram-dong": { sheet: "extra", col: 1, row: 1, w: 56, h: 64, yOff: 12 },
    "tich-tra-men-lam": { sheet: "extra", col: 2, row: 1, w: 60, h: 64, yOff: 12 }
  };

  function drawPainterlyTableItem25D(ctx, itemId, x, y, sc, now) {
    ensureAssets25DLoaded();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    // Warm tabletop ambient occlusion shadow
    ctx.fillStyle = "rgba(28, 16, 8, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, 9, 25, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const meta = TABLE_ITEM_ATLAS_MAP[itemId] || TABLE_ITEM_ATLAS_MAP["am-tu-sa"];
    const sheetReady =
      meta.sheet === "viahe"
        ? assets25D.viaheItemReady
        : meta.sheet === "extra"
          ? assets25D.itemsExtraReady
          : assets25D.itemsReady;
    const sheetImg =
      meta.sheet === "viahe"
        ? assets25D.viaheItemImg
        : meta.sheet === "extra"
          ? assets25D.itemsExtraImg
          : assets25D.itemsImg;

    if (sheetReady && sheetImg) {
      ctx.drawImage(
        sheetImg,
        meta.col * ITEM_CELL_W,
        meta.row * ITEM_CELL_H,
        ITEM_CELL_W,
        ITEM_CELL_H,
        -meta.w * 0.5,
        -meta.h + meta.yOff,
        meta.w,
        meta.h
      );

      // Live atmospheric touches for oil lamp, bronze censer & tea cosy
      if (itemId === "den-dau") {
        const pulse = 0.22 + Math.sin((now || 0) * 0.007) * 0.07;
        const glow = ctx.createRadialGradient(0, -24, 2, 0, -24, 24);
        glow.addColorStop(0, `rgba(255, 232, 148, ${pulse.toFixed(2)})`);
        glow.addColorStop(1, "rgba(255, 200, 90, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -24, 24, 0, Math.PI * 2);
        ctx.fill();
      } else if (itemId === "lu-tram-dong" || itemId === "tich-tra-men-lam") {
        const tS = (now || 0) * 0.0022;
        for (let k = 0; k < 2; k++) {
          const ph = (tS + k * 2.8) % (Math.PI * 2);
          const lift = (ph / (Math.PI * 2)) * 18;
          const sway = Math.sin(ph * 2.2 + k) * 3;
          const alpha = Math.max(0, 0.42 * (1 - ph / (Math.PI * 2)));
          ctx.strokeStyle =
            itemId === "lu-tram-dong"
              ? `rgba(244, 232, 212, ${alpha.toFixed(2)})`
              : `rgba(255, 252, 244, ${alpha.toFixed(2)})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          const ox = itemId === "tich-tra-men-lam" ? -12 : 0;
          const oy = itemId === "tich-tra-men-lam" ? -34 : -48;
          ctx.moveTo(ox, oy);
          ctx.quadraticCurveTo(ox + sway, oy - lift * 0.55, ox - sway * 0.5, oy - lift);
          ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = "#7B4425";
      ctx.beginPath();
      ctx.roundRect(-20, -4, 40, 12, 4);
      ctx.fill();
      ctx.fillStyle = "#B45332";
      ctx.beginPath();
      ctx.ellipse(4, -10, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
    ctx.font = "bold 28px 'Merriweather', 'Segoe UI', sans-serif";
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

    const roomId = (currentConfig && currentConfig.roomId) || "phong-tra";
    const theme = currentConfig.roomTheme || {};
    const isUltraWide = overviewWideLevel === "ultrawide";
    const panShift = -pan25DX * w * 0.65;
    const wideRect = isUltraWide
      ? coverImageRect(panShift * 0.45 - w * 0.04, 0, w * 1.08, h, 960, 720)
      : coverImageRect(panShift - w * 0.10, -h * 0.04, w * 1.20, h * 1.08, 960, 720);

    const activeLobbyImg = getRoomBackdropImg(roomId, "lobby");
    if (activeLobbyImg) {
      ctx.drawImage(activeLobbyImg, wideRect.x, wideRect.y, wideRect.w, wideRect.h);
    } else {
      ctx.fillStyle = theme.wall2D || "#F6ECDA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = theme.floor2D || "#D6B083";
      ctx.fillRect(0, h * 0.3, w, h * 0.7);
      ctx.fillStyle = "#6B4125";
      ctx.fillRect(0, h * 0.28, w, h * 0.03);
    }

    // Gentle sunlit glow shimmer over ceiling lanterns / shady banyan canopy
    const shimmer = 0.14 + Math.sin((now || 0) * 0.0025) * 0.04;
    const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.18, 10, w * 0.5, h * 0.35, w * 0.55);
    sunGrad.addColorStop(0, `rgba(255, 226, 150, ${shimmer.toFixed(3)})`);
    sunGrad.addColorStop(1, "rgba(255, 226, 150, 0)");
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    // Room-specific host uniform & standing anchor beside counter/stall
    const hostCfgMap = {
      "via-he": { nx: 0.39, ny: 0.49, color: "#C89D54", outfitId: "ao-ba-ba-mo-ga-nam", acc: "non-la" },
      "phong-tho": { nx: 0.48, ny: 0.47, color: "#633B6E", outfitId: "ao-lua-tim-hue", acc: "hair-bun" },
      "phong-co": { nx: 0.45, ny: 0.47, color: "#23495D", outfitId: "ao-ngu-than-mien-trung", acc: "khan-xep-kinh-bac" },
      "phong-ccb": { nx: 0.43, ny: 0.45, color: "#556B45", outfitId: "ao-linh", acc: "cap" },
      "phong-cay-canh": { nx: 0.45, ny: 0.47, color: "#2E5E4E", outfitId: "ao-dai-xanh", acc: "non-la" }
    };
    const hCfg = hostCfgMap[roomId] || { nx: 0.50, ny: 0.46, color: "#D98A2B", outfitId: "", acc: "hair-bun" };
    const hostX = wideRect.x + wideRect.w * hCfg.nx;
    const hostBottomY = wideRect.y + wideRect.h * hCfg.ny;
    const hostH = wideRect.h * 0.19;
    const hostW = hostH * (SPRITE_CELL_W / SPRITE_CELL_H);
    const hostSpr = composeSeniorSpriteCanvas({
      gender: "female",
      pose: "stand",
      outfitColor: hCfg.color,
      outfitId: hCfg.outfitId,
      accessory: hCfg.acc,
      isHost: true
    });
    ctx.drawImage(hostSpr, hostX - hostW * 0.5, hostBottomY - hostH, hostW, hostH);

    // 6 Interactive Tables styled specifically for each room's identity
    const normSlots = [
      { nx: 0.21, ny: 0.58, sc: 0.80 },
      { nx: 0.50, ny: 0.56, sc: 0.78 },
      { nx: 0.79, ny: 0.58, sc: 0.80 },
      { nx: 0.20, ny: 0.83, sc: 0.98 },
      { nx: 0.50, ny: 0.85, sc: 1.00 },
      { nx: 0.80, ny: 0.83, sc: 0.98 }
    ];
    let tagHtml = "";

    const roomLobbyPalette = {
      "via-he": {
        sedgeRect: true,
        matFill: "rgba(226, 198, 138, 0.92)",
        matStroke: "#8C6834",
        tblLight: "#98704B",
        tblDark: "#5F4128",
        items: ["khay-tra-da", "banh-dau-xanh", "khay-tra-da", "dia-hat-dua", "tich-tra-men-lam", "khay-tra-da"]
      },
      "phong-tho": {
        matFill: "rgba(245, 226, 204, 0.92)",
        matStroke: "#9C2E1F",
        tblLight: "#8E3428",
        tblDark: "#4E1912",
        items: ["lu-tram-dong", "binh-sen", "khay-trau-cau", "radio-go", "bonsai-mini", "am-tu-sa"]
      },
      "phong-co": {
        matFill: "rgba(232, 214, 178, 0.92)",
        matStroke: "#8B5A2B",
        tblLight: "#6E4A32",
        tblDark: "#382214",
        goldInlay: true,
        items: ["ban-co-ngoc", "tich-tra-men-lam", "ban-co-ngoc", "am-tu-sa", "ban-co-ngoc", "khay-tra-da"]
      },
      "phong-ccb": {
        matFill: "rgba(232, 228, 210, 0.92)",
        matStroke: "#485E3B",
        tblLight: "#7F5939",
        tblDark: "#4A311D",
        items: ["tich-tra-men-lam", "ban-co-ngoc", "radio-go", "am-tu-sa", "den-dau", "khay-tra-da"]
      },
      "phong-cay-canh": {
        matFill: "rgba(234, 216, 176, 0.92)",
        matStroke: "#2E6A44",
        tblLight: "#9A623B",
        tblDark: "#5B351D",
        items: ["bonsai-mini", "binh-sen", "long-chim-khuyen", "am-tu-sa", "den-dau", "khay-trau-cau"]
      }
    }[roomId] || {
      matFill: "rgba(247, 239, 224, 0.9)",
      matStroke: "#2E5E4E",
      tblLight: "#8B4E2B",
      tblDark: "#522A14",
      items: ["am-tu-sa", "tich-tra-men-lam", "khay-trau-cau", "banh-dau-xanh", "lu-tram-dong", "ban-co-ngoc"]
    };

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

      // Room-themed mat/rug beneath each table (woven straw sedge mat on sidewalk vs medallion rug indoors)
      ctx.save();
      ctx.fillStyle = roomLobbyPalette.matFill;
      ctx.strokeStyle = isRec ? "#EFA026" : roomLobbyPalette.matStroke;
      ctx.lineWidth = isRec ? 3.2 : 1.6;
      if (roomLobbyPalette.sedgeRect) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 17 * sc);
        ctx.lineTo(cx + 50 * sc, cy + 4 * sc);
        ctx.lineTo(cx, cy + 25 * sc);
        ctx.lineTo(cx - 50 * sc, cy + 4 * sc);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4 * sc, 46 * sc, 21 * sc, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Back row seated 2.5D sprites (slots 0, 1)
      const seatOffsets = [
        { dx: -28 * sc, dy: -4 * sc, flip: false, pose: "front" },
        { dx: 28 * sc, dy: -4 * sc, flip: true, pose: "front" },
        { dx: -22 * sc, dy: 14 * sc, flip: false, pose: "back" },
        { dx: 22 * sc, dy: 14 * sc, flip: true, pose: "back" }
      ];
      const sprH = 50 * sc;
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

      // Room-styled round wooden table
      ctx.fillStyle = "rgba(35, 22, 12, 0.25)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8 * sc, 28 * sc, 13 * sc, 0, 0, Math.PI * 2);
      ctx.fill();

      const tGrad = ctx.createRadialGradient(cx - 5 * sc, cy - 3 * sc, 2, cx, cy, 28 * sc);
      tGrad.addColorStop(0, roomLobbyPalette.tblLight);
      tGrad.addColorStop(1, roomLobbyPalette.tblDark);
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1 * sc, 27 * sc, 12.5 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3E1E0E";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      if (roomLobbyPalette.goldInlay) {
        ctx.strokeStyle = "rgba(238, 194, 98, 0.72)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 1 * sc, 22 * sc, 9.8 * sc, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Room-corresponding table centerpiece (and user's equipped item on their active table)
      const lobbyItemId =
        typeof currentConfig.activeTableIdx === "number" && tIdx === currentConfig.activeTableIdx && currentConfig.userItem
          ? currentConfig.userItem
          : roomLobbyPalette.items[tIdx % roomLobbyPalette.items.length];
      drawPainterlyTableItem25D(ctx, lobbyItemId, cx, cy - 3 * sc, 0.44 * sc, now);

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

    const roomId = (currentConfig && currentConfig.roomId) || "phong-tra";
    const theme = currentConfig.roomTheme || {};
    const panShift = -pan25DX * w * 0.55;
    const bgRect = coverImageRect(panShift - w * 0.04, 0, w * 1.08, h, 960, 720);
    const activeTableImg = getRoomBackdropImg(roomId, "table");

    if (activeTableImg) {
      ctx.drawImage(activeTableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
    } else {
      ctx.fillStyle = theme.wall2D || "#F6ECDA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = theme.floor2D || "#DFC6A2";
      ctx.fillRect(0, h * 0.35, w, h * 0.65);
    }

    // Subtle glowing silk lantern halo or dappled banyan sunlight
    const lanternPulse = 0.20 + Math.sin((now || 0) * 0.003) * 0.05;
    const lx = bgRect.x + bgRect.w * (roomId === "via-he" ? 0.56 : 0.365);
    const ly = bgRect.y + bgRect.h * 0.16;
    const lg = ctx.createRadialGradient(lx, ly, 4, lx, ly, bgRect.h * 0.22);
    lg.addColorStop(0, `rgba(255, 224, 130, ${lanternPulse.toFixed(3)})`);
    lg.addColorStop(1, "rgba(255, 224, 130, 0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    // Helpers for exact 2.5D pelvis-anchored seating & foreground chair/tabletop occlusion
    function drawAnchoredSprite(spr, col, anchorNx, anchorNy, hFrac, flip, isActive, walkOffsetY) {
      const anchor = SEAT_ANCHORS[col] || SEAT_ANCHORS[0];
      const sprH = bgRect.h * hFrac;
      const sprW = sprH * (SPRITE_CELL_W / SPRITE_CELL_H);
      const ax = bgRect.x + anchorNx * bgRect.w;
      const ay = bgRect.y + anchorNy * bgRect.h;

      if (isActive) {
        ctx.save();
        const auraY = ay - anchor.v * sprH * 0.55;
        const pulseAlpha = 0.34 + Math.sin((now || 0) * 0.005) * 0.10;
        const aura = ctx.createRadialGradient(ax, auraY, 6, ax, auraY, sprW * 0.46);
        aura.addColorStop(0, `rgba(244, 176, 62, ${pulseAlpha.toFixed(2)})`);
        aura.addColorStop(1, "rgba(244, 176, 62, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(ax, auraY, sprW * 0.46, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const dy = walkOffsetY || 0;
      ctx.save();
      ctx.translate(ax, ay + dy);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(spr, -anchor.u * sprW, -anchor.v * sprH, sprW, sprH);
      ctx.restore();
      return {
        cx: ax,
        headTopY: ay - anchor.v * sprH + dy,
        sprH
      };
    }

    function restoreBackdropPoly(ptsNorm) {
      if (!activeTableImg) return;
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
      ctx.drawImage(activeTableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
      ctx.restore();
    }

    function restoreBackdropEllipse(cxN, cyN, rxN, ryN) {
      if (!activeTableImg) return;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(bgRect.x + cxN * bgRect.w, bgRect.y + cyN * bgRect.h, rxN * bgRect.w, ryN * bgRect.h, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(activeTableImg, bgRect.x, bgRect.y, bgRect.w, bgRect.h);
      ctx.restore();
    }

    // Per-room calibrated 5-chair cushions & tabletop geometry (measured from 960x720 backdrops)
    const ROOM_TABLE_GEOM = {
      "via-he": {
        chairs: [
          { nx: 0.235, ny: 0.555, hFrac: 0.465, flip: false, pose: "front", order: 2, tagDx: -8, tagDy: 20 },
          { nx: 0.352, ny: 0.388, hFrac: 0.425, flip: false, pose: "front", order: 0, tagDx: -18, tagDy: 14 },
          { nx: 0.538, ny: 0.328, hFrac: 0.410, flip: false, pose: "front", order: 0, tagDx: 18, tagDy: 8 },
          { nx: 0.728, ny: 0.408, hFrac: 0.435, flip: true, pose: "front", order: 1, tagDx: 4, tagDy: 12 },
          { nx: 0.675, ny: 0.785, hFrac: 0.350, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
        ],
        tableEllipse: [0.512, 0.522, 0.146, 0.098],
        propCenter: [0.512, 0.505],
        frontRightBackrest: [[0.700, 0.635], [0.805, 0.635], [0.805, 0.900], [0.685, 0.900]],
        centerItem: "khay-tra-da",
        treats: ["banh-dau-xanh", "dia-hat-dua", "tich-tra-men-lam"],
        noHotSteam: true,
        host: { idleNx: 0.105, idleNy: 0.735, color: "#C89D54", outfitId: "ao-ba-ba-mo-ga-nam", acc: "non-la", name: "Cô Hàng Nước" }
      },
      "phong-tho": {
        chairs: [
          { nx: 0.268, ny: 0.742, hFrac: 0.460, flip: false, pose: "front", order: 2, tagDx: -8, tagDy: 20 },
          { nx: 0.288, ny: 0.518, hFrac: 0.425, flip: false, pose: "front", order: 0, tagDx: -18, tagDy: 14 },
          { nx: 0.502, ny: 0.435, hFrac: 0.405, flip: false, pose: "front", order: 0, tagDx: 18, tagDy: -6 },
          { nx: 0.715, ny: 0.518, hFrac: 0.435, flip: true, pose: "front", order: 1, tagDx: 4, tagDy: 12 },
          { nx: 0.725, ny: 0.790, hFrac: 0.345, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
        ],
        tableEllipse: [0.502, 0.585, 0.155, 0.105],
        propCenter: [0.502, 0.566],
        frontRightBackrest: [[0.745, 0.635], [0.815, 0.635], [0.815, 0.900], [0.730, 0.900]],
        centerItem: "am-tu-sa",
        treats: ["lu-tram-dong", "binh-sen", "khay-trau-cau"],
        host: { idleNx: 0.112, idleNy: 0.655, color: "#633B6E", outfitId: "ao-lua-tim-hue", acc: "hair-bun", name: "Trợ lý Phòng Thơ" }
      },
      "phong-co": {
        chairs: [
          { nx: 0.282, ny: 0.762, hFrac: 0.460, flip: false, pose: "front", order: 2, tagDx: -8, tagDy: 20 },
          { nx: 0.295, ny: 0.545, hFrac: 0.425, flip: false, pose: "front", order: 0, tagDx: -18, tagDy: 14 },
          { nx: 0.495, ny: 0.435, hFrac: 0.405, flip: false, pose: "front", order: 0, tagDx: 18, tagDy: -6 },
          { nx: 0.712, ny: 0.545, hFrac: 0.435, flip: true, pose: "front", order: 1, tagDx: 4, tagDy: 12 },
          { nx: 0.692, ny: 0.812, hFrac: 0.345, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
        ],
        tableEllipse: [0.498, 0.610, 0.152, 0.102],
        propCenter: [0.498, 0.592],
        frontRightBackrest: [[0.712, 0.660], [0.795, 0.660], [0.795, 0.920], [0.700, 0.920]],
        centerItem: "ban-co-ngoc",
        treats: ["tich-tra-men-lam", "am-tu-sa", "khay-tra-da"],
        host: { idleNx: 0.112, idleNy: 0.665, color: "#23495D", outfitId: "ao-ngu-than-mien-trung", acc: "khan-xep-kinh-bac", name: "Trợ lý Kỳ Đài" }
      },
      "phong-ccb": {
        chairs: [
          { nx: 0.305, ny: 0.738, hFrac: 0.460, flip: false, pose: "front", order: 2, tagDx: -10, tagDy: 20 },
          { nx: 0.312, ny: 0.515, hFrac: 0.425, flip: false, pose: "front", order: 0, tagDx: -18, tagDy: 14 },
          { nx: 0.500, ny: 0.430, hFrac: 0.405, flip: false, pose: "front", order: 0, tagDx: 18, tagDy: -6 },
          { nx: 0.688, ny: 0.515, hFrac: 0.435, flip: true, pose: "front", order: 1, tagDx: 4, tagDy: 12 },
          { nx: 0.688, ny: 0.765, hFrac: 0.345, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
        ],
        tableEllipse: [0.500, 0.585, 0.152, 0.102],
        propCenter: [0.500, 0.566],
        frontRightBackrest: [[0.708, 0.615], [0.785, 0.615], [0.785, 0.880], [0.695, 0.880]],
        centerItem: "tich-tra-men-lam",
        treats: ["radio-go", "banh-dau-xanh", "den-dau"],
        host: { idleNx: 0.115, idleNy: 0.685, color: "#556B45", outfitId: "ao-linh", acc: "cap", name: "Trợ lý Đồng Ngũ" }
      },
      "phong-cay-canh": {
        chairs: [
          { nx: 0.302, ny: 0.696, hFrac: 0.445, flip: false, pose: "front", order: 2, tagDx: -10, tagDy: 20 },
          { nx: 0.318, ny: 0.518, hFrac: 0.415, flip: false, pose: "front", order: 0, tagDx: -18, tagDy: 14 },
          { nx: 0.478, ny: 0.430, hFrac: 0.395, flip: false, pose: "front", order: 0, tagDx: 18, tagDy: -6 },
          { nx: 0.632, ny: 0.518, hFrac: 0.420, flip: true, pose: "front", order: 1, tagDx: 4, tagDy: 12 },
          { nx: 0.635, ny: 0.728, hFrac: 0.335, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
        ],
        tableEllipse: [0.478, 0.562, 0.128, 0.088],
        propCenter: [0.478, 0.546],
        frontRightBackrest: [[0.652, 0.585], [0.720, 0.585], [0.720, 0.820], [0.640, 0.820]],
        centerItem: "am-tu-sa",
        treats: ["bonsai-mini", "long-chim-khuyen", "binh-sen"],
        host: { idleNx: 0.115, idleNy: 0.685, color: "#2E5E4E", outfitId: "ao-dai-xanh", acc: "non-la", name: "Trợ lý Sân Vườn" }
      }
    }[roomId] || {
      chairs: [
        { nx: 0.252, ny: 0.602, hFrac: 0.475, flip: false, pose: "front", order: 2, tagDx: -12, tagDy: 22 },
        { nx: 0.346, ny: 0.484, hFrac: 0.435, flip: false, pose: "front", order: 0, tagDx: -28, tagDy: 14 },
        { nx: 0.523, ny: 0.424, hFrac: 0.415, flip: false, pose: "front", order: 0, tagDx: 24, tagDy: -10 },
        { nx: 0.708, ny: 0.512, hFrac: 0.445, flip: true, pose: "front", order: 1, tagDx: 6, tagDy: 12 },
        { nx: 0.684, ny: 0.782, hFrac: 0.355, flip: false, pose: "back", order: 4, tagDx: 0, tagDy: 2 }
      ],
      tableEllipse: [0.510, 0.542, 0.174, 0.118],
      propCenter: [0.506, 0.508],
      extraOcclusions: [
        [[0.718, 0.520], [0.790, 0.495], [0.800, 0.695], [0.698, 0.690]],
        [[0.610, 0.590], [0.702, 0.585], [0.705, 0.700], [0.610, 0.700]],
        [[0.335, 0.545], [0.415, 0.545], [0.415, 0.665], [0.335, 0.665]]
      ],
      frontRightBackrest: [[0.735, 0.625], [0.805, 0.615], [0.800, 0.900], [0.715, 0.890]],
      centerItem: "am-tu-sa",
      treats: ["banh-dau-xanh", "khay-trau-cau", "dia-hat-dua"],
      host: { idleNx: 0.112, idleNy: 0.675, color: "#D98A2B", outfitId: "", acc: "hair-bun", name: "Trợ lý Chị Trà" }
    };

    const chairSlots = ROOM_TABLE_GEOM.chairs;

    const list = currentConfig.table.members.slice(0, 4).map((m, idx) => ({
      member: m,
      slotIdx: idx + 1,
      seatPosIdx: idx,
      isUser: false
    }));
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
      const scaleAdjust = isFem && slot.pose !== "back" ? 0.92 : 1.0;
      const spr = composeSeniorSpriteCanvas({
        gender: isFem ? "female" : "male",
        pose: slot.pose,
        outfitColor: m.outfitColor || "#2E5E4E",
        outfitId: m.outfitId || "",
        accessory: m.hat || "none",
        titleFrameId: m.titleFrameId || "none"
      });
      drawnAnchors[entry.slotIdx] = drawAnchoredSprite(spr, col, slot.nx, slot.ny, slot.hFrac * scaleAdjust, slot.flip, isActive, 0);
    }

    // 1) Draw 3 back chairs (10:30, 12:00, 2:00)
    list
      .filter((entry) => chairSlots[entry.slotIdx].order <= 1)
      .sort((a, b) => chairSlots[a.slotIdx].order - chairSlots[b.slotIdx].order)
      .forEach(renderSeatedSlot);

    // 2) Restore tabletop & optional armrest occlusions so knees tuck naturally underneath!
    if (ROOM_TABLE_GEOM.extraOcclusions) {
      ROOM_TABLE_GEOM.extraOcclusions.forEach((poly) => restoreBackdropPoly(poly));
    }
    const te = ROOM_TABLE_GEOM.tableEllipse;
    restoreBackdropEllipse(te[0], te[1], te[2], te[3]);

    // 3) Draw Chair 0 (8:30 left-front "Bạn") naturally in front of left rug
    list.filter((entry) => entry.slotIdx === 0).forEach(renderSeatedSlot);

    // 4) Room-matched tabletop props + user's equipped table item
    const tblCx = bgRect.x + bgRect.w * ROOM_TABLE_GEOM.propCenter[0];
    const tblCy = bgRect.y + bgRect.h * ROOM_TABLE_GEOM.propCenter[1];
    const propScale = (bgRect.h / 330) * 0.94;
    const treatPool = ROOM_TABLE_GEOM.treats;
    const tableSeed = Number(currentConfig.activeTableIdx) || 0;
    const leftTreatId =
      currentConfig.userItem === treatPool[tableSeed % treatPool.length]
        ? treatPool[(tableSeed + 1) % treatPool.length]
        : treatPool[tableSeed % treatPool.length];
    const centerPropId = ROOM_TABLE_GEOM.centerItem;

    drawPainterlyTableItem25D(ctx, leftTreatId, tblCx - 29 * propScale, tblCy + 10 * propScale, propScale * 0.80, now);
    drawPainterlyTableItem25D(ctx, centerPropId, tblCx, tblCy - 4 * propScale, propScale, now);
    if (currentConfig.userItem) {
      const rightPropId =
        currentConfig.userItem === centerPropId
          ? roomId === "via-he"
            ? "dia-hat-dua"
            : "tich-tra-men-lam"
          : currentConfig.userItem;
      drawPainterlyTableItem25D(ctx, rightPropId, tblCx + 31 * propScale, tblCy + 6 * propScale, propScale * 0.84, now);
    }

    // Rising aromatic steam wisps above hot tea (skipped for refreshing iced-tea tray on sidewalk!)
    if (!ROOM_TABLE_GEOM.noHotSteam) {
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
    }

    // 5) Draw foreground-right seat (4:30) and restore Chair 4:30 rear wooden backrest behind shoulder
    list.filter((entry) => entry.slotIdx === 4).forEach(renderSeatedSlot);
    if (ROOM_TABLE_GEOM.frontRightBackrest) {
      restoreBackdropPoly(ROOM_TABLE_GEOM.frontRightBackrest);
    }

    // 6) Standing & walking room host: calm at side when idle, walks steadily to serve tea!
    const hSpec = ROOM_TABLE_GEOM.host;
    const pourDur = 4200;
    const elapsed = hostServingTimer > 0 ? Math.max(0, pourDur - hostServingTimer) : 0;
    const pFrac = elapsed / pourDur;
    let hostNx = hSpec.idleNx;
    let hostNy = hSpec.idleNy;
    let hostScale = 0.420;
    let hostFlip = false;
    let stepBob = 0;
    let hostActionLabel = "";

    if (hostServingTimer > 0) {
      const walkDx = 0.405 - hSpec.idleNx;
      const walkDy = 0.860 - hSpec.idleNy;
      if (pFrac < 0.36) {
        const k = pFrac / 0.36;
        const ease = k * k * (3 - 2 * k);
        hostNx = hSpec.idleNx + ease * walkDx;
        hostNy = hSpec.idleNy + Math.sin(ease * Math.PI * 0.5) * walkDy;
        hostScale = 0.420 + ease * 0.035;
        stepBob = -Math.abs(Math.sin((now || 0) * 0.013)) * 2.2;
        hostActionLabel = `${hSpec.name} · Đang ra mời`;
      } else if (pFrac < 0.68) {
        hostNx = 0.405;
        hostNy = 0.860;
        hostScale = 0.455;
        stepBob = 0;
        hostActionLabel = `${hSpec.name} · Rót trà`;
      } else {
        const k = (pFrac - 0.68) / 0.32;
        const ease = k * k * (3 - 2 * k);
        hostNx = 0.405 - ease * walkDx;
        hostNy = 0.860 - (1 - Math.cos(ease * Math.PI * 0.5)) * walkDy;
        hostScale = 0.455 - ease * 0.035;
        hostFlip = true;
        stepBob = -Math.abs(Math.sin((now || 0) * 0.013)) * 2.2;
        hostActionLabel = `${hSpec.name} · Quay lại`;
      }
    }

    const hostSpr = composeSeniorSpriteCanvas({
      gender: "female",
      pose: "stand",
      outfitColor: hSpec.color,
      outfitId: hSpec.outfitId,
      accessory: hSpec.acc,
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

    // Warm woven Indochine sedge & crimson-gold brocade rug ellipse (thảm chiếu hoa Đông Dương)
    ctx.save();
    ctx.fillStyle = "rgba(42, 24, 12, 0.16)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.79, w * 0.43, h * 0.165, 0, 0, Math.PI * 2);
    ctx.fill();

    const rugGrad = ctx.createRadialGradient(w * 0.5, h * 0.77, 12, w * 0.5, h * 0.78, w * 0.43);
    rugGrad.addColorStop(0, "#EFE1C6");
    rugGrad.addColorStop(0.72, "#E1CBA5");
    rugGrad.addColorStop(1, "#CDAE82");
    ctx.fillStyle = rugGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.78, w * 0.42, h * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9E3324";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "rgba(46, 94, 78, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.78, w * 0.385, h * 0.14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Carved wooden armchair scaled accurately behind full-shoe adult seated portrait
    const px = w * 0.32;
    const baseFootY = h * 0.92;
    const sprH = h * 0.78;
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

    const spr = composeSeniorSpriteCanvas({
      gender: currentConfig.userGender || "male",
      pose: "front",
      outfitColor: currentConfig.userOutfitColor || "#6E4A35",
      outfitId: currentConfig.userOutfitId || "",
      accessory: currentConfig.userAccessory || "glasses",
      titleFrameId: currentConfig.userTitleFrame || "none"
    });
    ctx.drawImage(spr, px - anch.u * sprW, baseFootY - sprH, sprW, sprH);

    // Carved Vietnamese rosewood pedestal tea table (đôn trà gỗ gụ chân quỳ) at natural armrest height
    const tx = w * 0.71;
    const ty = h * 0.65;
    const legFootY = baseFootY - 8;

    ctx.save();
    // Floor contact shadow on floral rug
    ctx.fillStyle = "rgba(32, 18, 8, 0.24)";
    ctx.beginPath();
    ctx.ellipse(tx, legFootY + 2, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rear cabriole legs & lower stretcher shelf
    ctx.strokeStyle = "#3E2010";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    [[-26, -6], [26, -6]].forEach(([dxL, dyTop]) => {
      ctx.beginPath();
      ctx.moveTo(tx + dxL * 0.85, ty + dyTop + 10);
      ctx.quadraticCurveTo(tx + dxL * 1.05, (ty + legFootY) * 0.52, tx + dxL * 0.82, legFootY - 4);
      ctx.stroke();
    });
    // Lower bamboo/wood stretcher ring
    ctx.fillStyle = "#5B321A";
    ctx.strokeStyle = "#3A1E0E";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(tx, legFootY - 18, 34, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front cabriole legs (chân quỳ chạm trổ)
    ctx.strokeStyle = "#542C16";
    ctx.lineWidth = 5.5;
    [[-34, 4], [34, 4]].forEach(([dxL, dyTop]) => {
      ctx.beginPath();
      ctx.moveTo(tx + dxL, ty + dyTop + 8);
      ctx.quadraticCurveTo(tx + dxL * 1.16, (ty + legFootY) * 0.56, tx + dxL * 0.92, legFootY);
      ctx.stroke();
    });

    // Carved apron rim beneath tabletop
    ctx.fillStyle = "#4B2613";
    ctx.beginPath();
    ctx.ellipse(tx, ty + 6, 62, 23, 0, 0, Math.PI);
    ctx.fill();

    // Polished rosewood tabletop with subtle woodgrain & brocade mat
    const tblGrad = ctx.createRadialGradient(tx - 14, ty - 6, 4, tx, ty, 66);
    tblGrad.addColorStop(0, "#9A5B36");
    tblGrad.addColorStop(0.72, "#6E3B1E");
    tblGrad.addColorStop(1, "#492411");
    ctx.fillStyle = tblGrad;
    ctx.beginPath();
    ctx.ellipse(tx, ty, 64, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#361A0B";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner recessed bevel & warm burl-wood gold-filigree medallion
    ctx.strokeStyle = "rgba(245, 214, 162, 0.34)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(tx, ty - 0.5, 55, 19, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(128, 72, 38, 0.82)";
    ctx.strokeStyle = "rgba(232, 184, 96, 0.68)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(tx, ty - 1, 36, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const itemScale = Math.min(1.32, Math.max(1.18, h / 192));
    const activeItemId = currentConfig.userItem || "am-tu-sa";
    drawPainterlyTableItem25D(ctx, activeItemId, tx, ty - 2, itemScale, now);

    // Gentle rising tea steam when showcasing Tử Sa teapot
    if (activeItemId === "am-tu-sa") {
      const steamT = (now || 0) * 0.0024;
      ctx.save();
      for (let s = 0; s < 2; s++) {
        const ph = (steamT + s * 2.6) % (Math.PI * 2);
        const lift = (ph / (Math.PI * 2)) * 24;
        const drift = Math.sin(ph * 2 + s) * 3.5;
        const alpha = Math.max(0, 0.48 * (1 - ph / (Math.PI * 2)));
        ctx.strokeStyle = `rgba(255, 252, 244, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tx + 8 + drift * 0.4, ty - 34 * (itemScale / 1.4) - lift * 0.3);
        ctx.quadraticCurveTo(tx + 8 + drift * 1.2, ty - 44 * (itemScale / 1.4) - lift * 0.7, tx + 8 - drift * 0.5, ty - 54 * (itemScale / 1.4) - lift);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (tagsLayerEl) {
      const SHORT_ITEM_TAG_MAP = {
        "khay-tra-da": "Khay trà đá vỉa hè",
        "khay-trau-cau": "Cơi trầu cánh phượng",
        "banh-dau-xanh": "Bánh đậu xanh",
        "long-chim-khuyen": "Lồng chim khuyên",
        "ban-co-ngoc": "Bàn cờ tướng ngọc",
        "lu-tram-dong": "Đỉnh trầm mắt cua",
        "tich-tra-men-lam": "Ấm tích men lam"
      };
      const rawItemLbl = SHORT_ITEM_TAG_MAP[activeItemId] || currentConfig.itemLabel || "Đồ bày bàn trà";
      const conciseItemLbl = rawItemLbl.length > 20 ? rawItemLbl.slice(0, 19).trim() + "…" : rawItemLbl;
      const itemTagX = Math.max(88, Math.min(w - 88, tx));
      const itemTagY = Math.max(46, ty - 68 * (itemScale / 1.25));
      const userBadgeHtml = formatSeatTagHtml({
        sx: 10,
        sy: 10,
        isActive: true,
        label: `${currentConfig.userName || "Anh Tám Vườn"} · ${currentConfig.userAge || 65}t`,
        titleFrameId: currentConfig.userTitleFrame || "none",
        isRealPeer: false
      }).replace('style="left:10px;top:10px"', 'style="left:8px;top:8px;transform:none;max-width:calc(100% - 16px);"');
      tagsLayerEl.innerHTML =
        userBadgeHtml +
        `<span class="seat-status-tag" style="left:${itemTagX.toFixed(0)}px;top:${itemTagY.toFixed(0)}px;transform:translate(-50%,-100%);max-width:52%;">${escHtml(conciseItemLbl)}</span>`;
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
    // Khóa chuẩn Đồ họa: Full 2.5D (TLBB) cho toàn Quán Trà
    mode = "2.5d";

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
