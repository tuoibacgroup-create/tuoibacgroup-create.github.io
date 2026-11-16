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
  let currentConfig = null;
  let onFallbackCallback = null;

  // Cached procedural CanvasTextures so room switching stays instant & zero external asset dependencies
  const texCache = {};

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

  function makeLowPolySenior(member, isUser, outfitColorOverride, cushionHex, accessoryId, withChair) {
    const g = new THREE.Group();
    const nameStr = String((member && member.name) || "");
    const isFemale = (member && member.gender === "female") || /^(Chị|Bà|Cô|Dì|Thím)/i.test(nameStr);
    const outfitColor = isUser ? outfitColorOverride || "#B83B2A" : (member && member.outfitColor) || "#2E5E4E";

    const matSkin = new THREE.MeshStandardMaterial({ color: 0xf4cfb4, roughness: 0.68, metalness: 0.02 });
    const matFace = new THREE.MeshStandardMaterial({
      map: getSeniorFaceTex(isFemale),
      roughness: 0.66,
      metalness: 0.02
    });
    const matOutfit = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.72, metalness: 0.03 });
    const matTrim = new THREE.MeshStandardMaterial({ color: 0xf5ebd6, roughness: 0.6, metalness: 0.05 });
    const matPants = new THREE.MeshStandardMaterial({ color: 0x352923, roughness: 0.8, metalness: 0.02 });
    const matHair = new THREE.MeshStandardMaterial({ color: 0xe6e1d8, roughness: 0.55, metalness: 0.06 });

    if (withChair !== false) {
      g.add(makeWoodenChair(cushionHex));
    }

    // Seated trousers / lap
    const lap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.24, 16), matPants);
    lap.scale.set(1.1, 1, 1.25);
    lap.position.set(0, 0.5, 0.06);
    g.add(lap);

    // Smooth torso (Áo bà ba / Áo lụa cổ tàu)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.58, 20), matOutfit);
    torso.scale.set(1.08, 1, 0.92);
    torso.position.set(0, 0.82, -0.03);
    torso.castShadow = true;
    torso.receiveShadow = true;
    g.add(torso);

    // Mandarin collar & ivory front buttons
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.08, 16), matTrim);
    collar.position.set(0, 1.11, -0.02);
    g.add(collar);

    [0.98, 0.87, 0.76].forEach((by) => {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), matTrim);
      btn.position.set(0, by, 0.2);
      g.add(btn);
    });

    // Sculpted shoulders, sleeves & warm hands resting forward
    [-1, 1].forEach((dir) => {
      const armGrp = new THREE.Group();
      armGrp.position.set(dir * 0.26, 0.98, -0.01);
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.065, 0.34, 12), matOutfit);
      upperArm.position.set(dir * 0.03, -0.13, 0.11);
      upperArm.rotation.x = -0.78;
      upperArm.rotation.z = dir * -0.18;
      upperArm.castShadow = true;
      armGrp.add(upperArm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), matSkin);
      hand.position.set(dir * 0.04, -0.25, 0.25);
      armGrp.add(hand);
      g.add(armGrp);
    });

    // Head group so nodding moves hair, ears, and accessories together!
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.35, -0.01);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 20), matFace);
    headMesh.rotation.y = -Math.PI / 2; // Aligns UV u=0.5 directly with +Z forward
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Sculpted ears
    [-0.23, 0.23].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), matSkin);
      ear.scale.set(0.55, 1, 0.8);
      ear.position.set(ex, -0.01, 0);
      headGroup.add(ear);
    });

    // Smooth volumetric silver-white hair cap + side locks
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.252, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
      matHair
    );
    hairCap.position.set(0, 0.02, -0.02);
    hairCap.rotation.x = -0.16;
    hairCap.castShadow = true;
    headGroup.add(hairCap);

    const hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.244, 18, 14, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.3, Math.PI * 0.52),
      matHair
    );
    hairBack.rotation.y = Math.PI;
    hairBack.position.set(0, -0.01, -0.02);
    headGroup.add(hairBack);

    const acc = accessoryId || (member && member.hat) || (isFemale ? "hair-bun" : "none");
    if (acc === "cap") {
      const capMat = new THREE.MeshStandardMaterial({ color: 0x4f6842, roughness: 0.72 });
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.258, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), capMat);
      crown.position.set(0, 0.08, 0);
      crown.castShadow = true;
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.32, 0.035, 20), capMat);
      brim.scale.set(0.95, 1, 1.12);
      brim.position.set(0, 0.11, 0.04);
      headGroup.add(crown, brim);
    } else if (acc === "non-la") {
      const nonMat = new THREE.MeshStandardMaterial({ color: 0xe9d59b, roughness: 0.65 });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.28, 24), nonMat);
      cone.position.set(0, 0.27, 0);
      cone.castShadow = true;
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.47, 0.014, 8, 28),
        new THREE.MeshStandardMaterial({ color: 0xc5a467, roughness: 0.6 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 0.13, 0);
      headGroup.add(cone, rim);
    } else if (acc === "scarf") {
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0x9e3426, roughness: 0.8 });
      const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.055, 12, 22), scarfMat);
      scarfRing.rotation.x = Math.PI / 2;
      scarfRing.position.set(0, 1.1, 0.01);
      const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.045), scarfMat);
      scarfTail.position.set(0.06, 0.96, 0.19);
      scarfTail.rotation.z = -0.12;
      g.add(scarfRing, scarfTail);
    } else if (acc === "glasses") {
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a243, roughness: 0.35, metalness: 0.65 });
      const leftLens = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 10, 18), brassMat);
      leftLens.position.set(-0.085, 0.01, 0.225);
      const rightLens = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 10, 18), brassMat);
      rightLens.position.set(0.085, 0.01, 0.225);
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.06, 8), brassMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.015, 0.23);
      headGroup.add(leftLens, rightLens, bridge);
    }

    if (acc === "hair-bun" || (isFemale && acc !== "cap" && acc !== "non-la")) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 14), matHair);
      bun.position.set(0, 0.04, -0.25);
      const jadePin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e7d63, roughness: 0.35 })
      );
      jadePin.rotation.z = 1.15;
      jadePin.position.set(0.02, 0.06, -0.27);
      headGroup.add(bun, jadePin);
    }

    g.add(headGroup);

    // 3D Honor Badge Medallion & Carved Base Ring for Title Frame (Khung danh hiệu 3D)
    const frameId = (member && member.titleFrameId) || "none";
    const frameColors = {
      "tri-am": 0x2e7d63,
      "thi-huu": 0xc84b38,
      "ky-thu": 0xd49a35,
      "giu-lua": 0xf0b23a,
      "dong-ngu": 0x6b8f4e
    };
    if (frameColors[frameId]) {
      const fHex = frameColors[frameId];
      const badgeGoldMat = new THREE.MeshStandardMaterial({ color: 0xe6b44c, roughness: 0.32, metalness: 0.68 });
      const badgeCoreMat = new THREE.MeshStandardMaterial({ color: fHex, roughness: 0.38, metalness: 0.28 });

      // Pinned chest honor rosette on left tunic lapel
      const medalRim = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 18), badgeGoldMat);
      medalRim.rotation.x = Math.PI / 2;
      medalRim.position.set(-0.088, 0.96, 0.195);
      const medalCore = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.022, 16), badgeCoreMat);
      medalCore.rotation.x = Math.PI / 2;
      medalCore.position.set(-0.088, 0.96, 0.197);
      g.add(medalRim, medalCore);

      // Subtle inlaid honor ring around chair base
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

    return { group: g, head: headGroup, ringMat };
  }

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
    const d = isOverview ? 7.5 : 4.5;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xfff2de, 0.45);
    fill.position.set(4.5, 4.2, 6.2);
    scene.add(fill);

    const lanternLight = new THREE.PointLight(0xffb85c, 0.75, 11);
    lanternLight.position.set(0, 3.1, 0);
    scene.add(lanternLight);

    // Warm honey-wood plank floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
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
    const wallZ = isOverview ? -5.3 : -3.85;
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 7.5),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88 })
    );
    backWall.position.set(0, 3.75, wallZ);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const wainscot = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.98, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x8b5d3b, roughness: 0.68 })
    );
    wainscot.position.set(0, 0.49, wallZ + 0.04);
    scene.add(wainscot);

    const chairRail = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x5d3920, roughness: 0.55 })
    );
    chairRail.position.set(0, 1.0, wallZ + 0.06);
    scene.add(chairRail);

    // Sunlit wooden lattice window with green bamboo outside (framed completely inside camera!)
    const winX = isOverview ? -3.1 : -2.05;
    const winY = isOverview ? 2.35 : 1.78;
    const winW = isOverview ? 2.5 : 1.95;
    const winH = isOverview ? 1.55 : 1.24;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x623c22, roughness: 0.55 });

    const winOuter = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.18, winH + 0.18, 0.1), frameMat);
    winOuter.position.set(winX, winY, wallZ + 0.06);
    scene.add(winOuter);

    const winSky = new THREE.Mesh(
      new THREE.PlaneGeometry(winW, winH),
      new THREE.MeshBasicMaterial({ color: 0xe6f5f0 })
    );
    winSky.position.set(winX, winY, wallZ + 0.12);
    scene.add(winSky);

    // Green bamboo stalks outside window
    const bambooMat = new THREE.MeshBasicMaterial({ color: 0x4b8b5b });
    [-0.55, -0.18, 0.32].forEach((bx, bi) => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, winH * 0.92, 8), bambooMat);
      stalk.position.set(winX + bx, winY - 0.02, wallZ + 0.13);
      stalk.rotation.z = (bi - 1) * 0.09;
      scene.add(stalk);

      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0x64a86e }));
      leaf.scale.set(1.4, 0.55, 0.3);
      leaf.position.set(winX + bx + 0.12, winY + 0.22 - bi * 0.15, wallZ + 0.135);
      scene.add(leaf);
    });

    // Lattice mullions (chấn song gỗ)
    [-winW * 0.18, winW * 0.18].forEach((mx) => {
      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.045, winH, 0.04), frameMat);
      barV.position.set(winX + mx, winY, wallZ + 0.15);
      scene.add(barV);
    });
    const barH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.045, 0.04), frameMat);
    barH.position.set(winX, winY, wallZ + 0.15);
    scene.add(barH);

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

  function init3DOverview(config) {
    const theme = config.roomTheme || {};
    camera.fov = 39;
    camera.updateProjectionMatrix();
    camera.position.set(0, 10.1, 9.8);
    camera.lookAt(0, 0.25, 0.35);

    addRoomShell(theme, true);

    // Central patterned carpet runner down the hall
    const hallRug = new THREE.Mesh(
      new THREE.CircleGeometry(3.9, 48),
      new THREE.MeshStandardMaterial({ map: getVietTileRugTex(), transparent: true, roughness: 0.85 })
    );
    hallRug.rotation.x = -Math.PI / 2;
    hallRug.position.set(0, 0.015, 0.4);
    hallRug.receiveShadow = true;
    scene.add(hallRug);

    const cols = [-2.55, 2.55];
    const rows = [-2.25, 0.45, 3.1];
    overviewTables = [];

    config.tables.slice(0, 6).forEach((tbl, tIdx) => {
      const col = tIdx % 2;
      const row = Math.floor(tIdx / 2);
      const tx = cols[col];
      const tz = rows[row];
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

    const hostBuild = makeLowPolySenior({ name: "Chị Trà", gender: "female", outfitColor: "#D98A2B", hat: "hair-bun" }, false, null, theme.cushionHex, "hair-bun", false);
    hostGroup = hostBuild.group;
    hostGroup.scale.set(0.72, 0.72, 0.72);
    hostGroup.position.set(0, 0, -3.9);
    hostGroup.lookAt(0, 0, 2);
    scene.add(hostGroup);
  }

  function init3DTableCloseUp(config) {
    const theme = config.roomTheme || {};
    camera.fov = 40;
    camera.updateProjectionMatrix();
    camera.position.set(0, 4.05, 5.5);
    camera.lookAt(0, 1.04, -0.4);

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

    // 5 Seated Seniors + 5 Individual Celadon Teacups placed right in front of each person!
    const seatAngles = [-2.82, -1.52, -0.32, 2.34, 0.82];
    seatObjects = [];
    const existing = config.table.members.slice(0, 4).map((m, idx) => ({
      member: m,
      angIdx: idx,
      isUser: false
    }));
    existing.push({
      member: {
        name: config.userName,
        province: config.userProvince,
        hat: config.userAccessory || "none",
        titleFrameId: config.userTitleFrame || "none",
        badge: "Bạn"
      },
      angIdx: 4,
      isUser: true
    });

    existing.forEach((slot, idx) => {
      const m = slot.member;
      const ang = seatAngles[slot.angIdx];
      const radius = 2.04;
      const built = makeLowPolySenior(
        m,
        slot.isUser,
        config.userOutfitColor,
        theme.cushionHex,
        slot.isUser ? config.userAccessory : m.hat,
        true
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
        ringMat: built.ringMat
      });
    });

    const hostBuild = makeLowPolySenior(
      { name: "Chị Trà", gender: "female", outfitColor: "#D98A2B", hat: "hair-bun" },
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
    camera.fov = 38;
    camera.updateProjectionMatrix();
    camera.position.set(0.04, 2.3, 3.78);
    camera.lookAt(0.02, 1.1, 0);

    addRoomShell(theme, false);

    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 48),
      new THREE.MeshStandardMaterial({ map: getVietTileRugTex(), transparent: true, roughness: 0.85 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.015;
    rug.receiveShadow = true;
    scene.add(rug);

    // User's 3D character seated on the left, angled toward camera so outfit + hat/glasses/scarf are super clear
    const userMember = {
      name: config.userName || "Anh Tám Vườn",
      gender: config.userGender || "male",
      hat: config.userAccessory || "glasses",
      titleFrameId: config.userTitleFrame || "none"
    };
    const built = makeLowPolySenior(
      userMember,
      true,
      config.userOutfitColor || "#6E4A35",
      0x2e5e4e,
      config.userAccessory || "glasses",
      true
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
      const sy = Math.max(32, Math.min(height - 10, (-v.y * 0.5 + 0.5) * height));
      const isRec = item.idx === currentConfig.recommendedIdx;
      const count = item.table.members.length;
      const text = isRec ? `${item.table.shortLabel} · Gợi ý (${count}/5)` : `${item.table.shortLabel} · ${count}/5 chỗ`;
      html += `<span class="seat-status-tag ${isRec ? "active-speaker" : ""}" style="left:${sx.toFixed(0)}px;top:${sy.toFixed(0)}px">${text}</span>`;
    });

    tagsLayerEl.innerHTML = html;
  }

  const FRAME_SHORT_LABELS = {
    "tri-am": "Tri Âm",
    "thi-huu": "Thi Hữu",
    "ky-thu": "Kỳ Thủ",
    "giu-lua": "Giữ Lửa",
    "dong-ngu": "Đồng Ngũ"
  };

  function formatSeatTagHtml(opts) {
    const fId = opts.titleFrameId || "none";
    const fShort = FRAME_SHORT_LABELS[fId] || "";
    const prefix = fShort ? `<em class="tag-frame-pill">${fShort}</em> ` : "";
    const liveDot = opts.isRealPeer ? `<i class="tag-live-dot" aria-hidden="true"></i>` : "";
    const frameCls = fId !== "none" ? `has-frame frame-${fId}` : "";
    const spkCls = opts.isActive ? "active-speaker" : "";
    return `<span class="seat-status-tag ${spkCls} ${frameCls}" style="left:${opts.sx.toFixed(0)}px;top:${opts.sy.toFixed(0)}px">${liveDot}${prefix}${opts.label}</span>`;
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
    });

    tagsLayerEl.innerHTML = html;
  }

  function drawOverview25D(now) {
    if (!canvasEl || !currentConfig) return;
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
    ctx.fillStyle = theme.wall2D || "#F6ECDA";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = theme.floor2D || "#DFC6A2";
    ctx.fillRect(0, h * 0.16, w, h * 0.84);

    ctx.fillStyle = "#7B5233";
    ctx.fillRect(0, h * 0.145, w, h * 0.02);

    ctx.fillStyle = "rgba(184, 59, 42, 0.1)";
    ctx.fillRect(w * 0.44, h * 0.16, w * 0.12, h * 0.84);

    const cols = [w * 0.25, w * 0.75];
    const rows = [h * 0.29, h * 0.56, h * 0.83];
    let tagHtml = "";

    currentConfig.tables.slice(0, 6).forEach((tbl, tIdx) => {
      const cx = cols[tIdx % 2];
      const cy = rows[Math.floor(tIdx / 2)];
      const isRec = tIdx === currentConfig.recommendedIdx;

      // Patterned rug halo
      ctx.fillStyle = "#F7EFE0";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 48, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isRec ? "#F4A836" : "#2E5E4E";
      ctx.lineWidth = isRec ? 3.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = "rgba(35, 26, 20, 0.16)";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 9, 35, 17, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#7D492A";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 34, 17, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isRec ? "#FFCF5C" : "#B84A2E";
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 6, 0, Math.PI * 2);
      ctx.fill();

      const offsets = [
        { dx: -38, dy: -4 },
        { dx: 38, dy: -4 },
        { dx: -26, dy: 20 },
        { dx: 26, dy: 20 }
      ];
      tbl.members.slice(0, 4).forEach((m, idx) => {
        const o = offsets[idx];
        ctx.fillStyle = m.outfitColor || "#2E5E4E";
        ctx.beginPath();
        ctx.arc(cx + o.dx, cy + o.dy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#F4CFB4";
        ctx.beginPath();
        ctx.arc(cx + o.dx, cy + o.dy - 6, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#E6E1D8";
        ctx.beginPath();
        ctx.arc(cx + o.dx, cy + o.dy - 7.5, 5.2, Math.PI, 0);
        ctx.fill();
      });

      const count = tbl.members.length;
      const text = isRec ? `${tbl.shortLabel} · Gợi ý (${count}/5)` : `${tbl.shortLabel} · ${count}/5 chỗ`;
      tagHtml += `<span class="seat-status-tag ${isRec ? "active-speaker" : ""}" style="left:${cx.toFixed(0)}px;top:${Math.max(28, cy - 22).toFixed(0)}px">${text}</span>`;
    });

    if (tagsLayerEl) {
      tagsLayerEl.innerHTML = tagHtml;
    }
  }

  function drawTableCloseUp25D(now) {
    if (!canvasEl || !currentConfig) return;
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
    ctx.fillStyle = theme.wall2D || "#F6ECDA";
    ctx.fillRect(0, 0, w, h);

    // Wainscoting & floor
    ctx.fillStyle = "#8B5D3B";
    ctx.fillRect(0, h * 0.27, w, h * 0.08);
    ctx.fillStyle = theme.floor2D || "#DFC6A2";
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    // Lattice window with bamboo
    ctx.fillStyle = "#623C22";
    ctx.fillRect(w * 0.07, h * 0.05, w * 0.27, h * 0.2);
    ctx.fillStyle = "#E6F5F0";
    ctx.fillRect(w * 0.085, h * 0.068, w * 0.24, h * 0.164);
    ctx.strokeStyle = "#4B8B5B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.23);
    ctx.lineTo(w * 0.17, h * 0.08);
    ctx.moveTo(w * 0.22, h * 0.23);
    ctx.lineTo(w * 0.21, h * 0.09);
    ctx.stroke();

    // Calligraphy scroll in center
    ctx.fillStyle = "#FBF5E8";
    ctx.fillRect(w * 0.45, h * 0.04, w * 0.1, h * 0.2);
    ctx.strokeStyle = "#8C583A";
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.45, h * 0.04, w * 0.1, h * 0.2);

    const cx = w * 0.5;
    const cy = h * 0.6;

    // Gạch bông rug ellipse
    ctx.fillStyle = "#F7EFE0";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, w * 0.38, h * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rosewood table
    ctx.fillStyle = "rgba(35, 26, 20, 0.18)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 26, w * 0.24, h * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#784527";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.24, h * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#522D17";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Teapot & 5 cups
    ctx.fillStyle = "#A44528";
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 11, 0, Math.PI * 2);
    ctx.fill();
    const pulse = Math.sin(now * 0.004) * 3;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 20);
    ctx.quadraticCurveTo(cx + pulse, cy - 29, cx - 1, cy - 38);
    ctx.stroke();

    const seatCoords = [
      { x: w * 0.17, y: h * 0.44 },
      { x: w * 0.5, y: h * 0.33 },
      { x: w * 0.83, y: h * 0.44 },
      { x: w * 0.23, y: h * 0.8 },
      { x: w * 0.77, y: h * 0.8 }
    ];

    const list = currentConfig.table.members.slice(0, 4).map((m, idx) => ({
      member: m,
      coordIdx: idx,
      isUser: false
    }));
    list.push({
      member: {
        name: currentConfig.userName,
        outfitColor: currentConfig.userOutfitColor,
        titleFrameId: currentConfig.userTitleFrame || "none",
        badge: "Bạn"
      },
      coordIdx: 4,
      isUser: true
    });

    let tagHtml = "";
    list.forEach((slot, idx) => {
      const m = slot.member;
      const p = seatCoords[slot.coordIdx];
      const isActive = idx === activeSeatIdx;

      // Teacup on table toward each person
      const cupX = cx + (p.x - cx) * 0.45;
      const cupY = cy + (p.y - cy) * 0.42;
      ctx.fillStyle = "#F4F0E4";
      ctx.beginPath();
      ctx.arc(cupX, cupY, 5, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = "#F4A836";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 18, 28, 13, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#2E5E4E";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 14, 21, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = m.outfitColor || "#B83B2A";
      ctx.beginPath();
      ctx.roundRect(p.x - 14, p.y - 8, 28, 23, 9);
      ctx.fill();

      ctx.fillStyle = "#F4CFB4";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 17, 11.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E6E1D8";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 20, 11, Math.PI, 0);
      ctx.fill();

      // Eyes & smile
      ctx.fillStyle = "#2A1C15";
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y - 17, 1.3, 0, Math.PI * 2);
      ctx.arc(p.x + 4, p.y - 17, 1.3, 0, Math.PI * 2);
      ctx.fill();

      const shortName = slot.isUser ? "Bạn" : m.name;
      const label = isActive ? `${shortName} · Nói` : m.badge === "Mời trà" ? `${shortName} · Trà` : shortName;
      const sx = Math.max(82, Math.min(w - 82, p.x));
      const sy = Math.max(28, p.y - 32);
      tagHtml += formatSeatTagHtml({
        sx,
        sy,
        isActive,
        label,
        titleFrameId: m.titleFrameId,
        isRealPeer: m.isRealPeer
      });
    });

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
      html += `<span class="seat-status-tag" style="left:${ix.toFixed(0)}px;top:${iy.toFixed(0)}px">${currentConfig.itemLabel || "Đồ bày bàn trà"}</span>`;
    }

    tagsLayerEl.innerHTML = html;
  }

  function drawProfileShowcase25D() {
    if (!canvasEl || !currentConfig) return;
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

    ctx.fillStyle = "#F6ECDA";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#8B5D3B";
    ctx.fillRect(0, h * 0.34, w, h * 0.08);
    ctx.fillStyle = "#DFC6A2";
    ctx.fillRect(0, h * 0.42, w, h * 0.58);

    // Rug
    ctx.fillStyle = "#F7EFE0";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.72, w * 0.38, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B83B2A";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Seated User Avatar on left
    const px = w * 0.32;
    const py = h * 0.58;
    ctx.fillStyle = "#2E5E4E";
    ctx.beginPath();
    ctx.ellipse(px, py + 28, 36, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = currentConfig.userOutfitColor || "#6E4A35";
    ctx.beginPath();
    ctx.roundRect(px - 24, py - 8, 48, 38, 12);
    ctx.fill();

    ctx.fillStyle = "#F4CFB4";
    ctx.beginPath();
    ctx.arc(px, py - 24, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E6E1D8";
    ctx.beginPath();
    ctx.arc(px, py - 28, 17.5, Math.PI, 0);
    ctx.fill();

    const acc = currentConfig.userAccessory || "glasses";
    if (acc === "cap") {
      ctx.fillStyle = "#4F6842";
      ctx.beginPath();
      ctx.ellipse(px, py - 38, 22, 9, 0, Math.PI, 0);
      ctx.fill();
    } else if (acc === "non-la") {
      ctx.fillStyle = "#E9D59B";
      ctx.beginPath();
      ctx.moveTo(px, py - 52);
      ctx.lineTo(px - 26, py - 32);
      ctx.lineTo(px + 26, py - 32);
      ctx.closePath();
      ctx.fill();
    } else if (acc === "glasses") {
      ctx.strokeStyle = "#8C5B1F";
      ctx.lineWidth = 2;
      ctx.strokeRect(px - 11, py - 27, 8, 6);
      ctx.strokeRect(px + 3, py - 27, 8, 6);
    } else if (acc === "scarf") {
      ctx.fillStyle = "#9E3426";
      ctx.fillRect(px - 16, py - 9, 32, 8);
    }

    // Side table & item on right
    const tx = w * 0.7;
    const ty = h * 0.65;
    ctx.fillStyle = "#784527";
    ctx.beginPath();
    ctx.ellipse(tx, ty, 48, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = currentConfig.itemColor || "#8B4228";
    ctx.beginPath();
    ctx.arc(tx, ty - 14, 16, 0, Math.PI * 2);
    ctx.fill();

    if (tagsLayerEl) {
      tagsLayerEl.innerHTML =
        formatSeatTagHtml({
          sx: px,
          sy: Math.max(28, py - 54),
          isActive: true,
          label: `${currentConfig.userName || "Anh Tám Vườn"} · ${currentConfig.userAge || 65}t`,
          titleFrameId: currentConfig.userTitleFrame || "none",
          isRealPeer: false
        }) +
        `<span class="seat-status-tag" style="left:${tx.toFixed(0)}px;top:${Math.max(28, ty - 42).toFixed(0)}px">${currentConfig.itemLabel || "Đồ bày bàn trà"}</span>`;
    }
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
        renderer.render(scene, camera);
        updateOverviewTags3D();
      } else if (currentConfig && currentConfig.viewMode === "profile") {
        if (seatObjects[0]) {
          seatObjects[0].ringMat.opacity = 0.75 + Math.sin(now * 0.006) * 0.18;
          seatObjects[0].head.rotation.y = Math.sin(now * 0.0014) * 0.18;
        }
        if (profileItemGroup) {
          profileItemGroup.rotation.y = now * 0.0009;
        }
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
          s.head.rotation.y = Math.sin(now * 0.0013 + i * 1.3) * (isActive ? 0.18 : 0.08);
          s.head.rotation.x = isActive ? Math.sin(now * 0.006) * 0.06 : 0;
        });

        if (hostGroup) {
          const targetX = hostServingTimer > 0 ? 1.45 : 2.15;
          const targetZ = hostServingTimer > 0 ? -0.95 : -2.25;
          hostGroup.position.x += (targetX - hostGroup.position.x) * 0.12;
          hostGroup.position.z += (targetZ - hostGroup.position.z) * 0.12;
        }

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
    containerEl = el;
    canvasEl = canvas;
    tagsLayerEl = tagsLayer;
    currentConfig = config;
    onFallbackCallback = fallbackCb || null;
    mode = config.preferredMode || "3d";

    if (mode === "3d") {
      const ok = init3DScene(config);
      if (!ok) {
        mode = "2.5d";
        if (onFallbackCallback) onFallbackCallback("auto-fallback");
      }
    }

    lastFrame = 0;
    animId = requestAnimationFrame(loop);
  }

  function setSpeaker(idx) {
    activeSeatIdx = idx;
  }

  function setSeatBadge(idx, badge) {
    if (seatObjects[idx]) {
      seatObjects[idx].badge = badge;
    }
    if (currentConfig && currentConfig.table && currentConfig.table.members[idx]) {
      currentConfig.table.members[idx].badge = badge;
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
    triggerTeaService,
    getActiveMode,
    drawQrToCanvas,
    exportPostcardPng
  };
})();
