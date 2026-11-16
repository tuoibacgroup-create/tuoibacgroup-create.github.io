window.TempleScene3D = (function () {
  // ============================================================================
  // CHÁNH ĐIỆN 3D GÓC RỘNG & SÂN CHÙA CỔ VIỆT NAM (THREE.JS + 2.5D FALLBACK)
  // - Mái chùa cổ 2 tầng đao cong, cột lim sơn son thếp vàng, Tam Bảo & Tượng Phật
  // - 10 Chiếu Bồ Đoàn 3D (2 hàng × 5 chiếu) cho các bác & bạn thật ngồi chung
  // - Sân gạch cổ phía trước: Hồ Sen thả hoa đăng (trái) & Cây Ước Nguyện treo thẻ đỏ (phải)
  // - Kéo ngang xoay góc nhìn 3D + 3 góc máy: Toàn cảnh Chùa & Sân / 10 Bồ Đoàn / Hồ Sen & Cây Thẻ Đỏ
  // ============================================================================

  let mode = "3d";
  let animId = null;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 28;

  let renderer = null;
  let scene = null;
  let camera = null;
  let containerEl = null;
  let canvasEl = null;
  let tagsLayerEl = null;

  let cameraView = "wide"; // "wide" | "cushions" | "courtyard"
  let orbitAzimuth = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAzimuth = 0;

  let currentConfig = null;
  let cushionActors = [];
  let smokeParticles = [];
  let pondLanternMeshes = [];
  let wishPlaqueMeshes = [];
  let expandingWaves = [];
  let bellPivotGroup = null;
  let bellSwingEnergy = 0;
  let muyuMeshGroup = null;
  let muyuPulseTimer = 0;
  let buddhaHaloMesh = null;
  let floatingBanner = null; // { worldPos, text, bg, color, expiresAt }

  const texCache = {};

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

  const POND_CENTER = { x: -4.25, z: 4.55, r: 2.15 };
  const TREE_CENTER = { x: 4.25, z: 4.35 };

  function getBatTrangCourtyardTex() {
    if (texCache.courtyard) return texCache.courtyard;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#B96B49";
    ctx.fillRect(0, 0, 512, 512);

    const tile = 64;
    for (let gx = 0; gx < 512; gx += tile) {
      for (let gy = 0; gy < 512; gy += tile) {
        const shift = (((gx / tile) * 7 + (gy / tile) * 13) % 5 - 2) * 5;
        ctx.fillStyle = `rgb(${184 + shift}, ${104 + shift}, ${70 + shift})`;
        ctx.fillRect(gx + 2, gy + 2, tile - 4, tile - 4);
        ctx.strokeStyle = "rgba(74, 38, 22, 0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(gx + 1, gy + 1, tile - 2, tile - 2);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 4);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache.courtyard = tex;
    return tex;
  }

  function getRoofTileTex() {
    if (texCache.roofTile) return texCache.roofTile;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#7D2E1E";
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 24) {
      for (let x = 0; x < 256; x += 28) {
        ctx.beginPath();
        ctx.arc(x + 14, y + 14, 12, Math.PI, 0, false);
        ctx.fillStyle = (x + y) % 2 === 0 ? "#8F3624" : "#712819";
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 14, 8, 0.45)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache.roofTile = tex;
    return tex;
  }

  function getHorizontalPlaqueTex(textStr) {
    const key = "plaque_" + textStr;
    if (texCache[key]) return texCache[key];
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#6B1712";
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#F4C552";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 476, 92);

    ctx.fillStyle = "#FFE58F";
    ctx.font = "bold 40px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textStr || "TÂM AN VẠN SỰ AN", 256, 66);

    const tex = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    texCache[key] = tex;
    return tex;
  }

  function createCushionMesh(isGoldenLotus, isSelectedUser) {
    const g = new THREE.Group();

    // Woven straw / brocade base mat
    const matColor = isSelectedUser ? 0xb83b2a : isGoldenLotus ? 0xc98a1e : 0x8d5b32;
    const rimColor = isSelectedUser ? 0xffdf7a : isGoldenLotus ? 0xffe484 : 0xd8a85c;

    const baseGeo = new THREE.CylinderGeometry(0.46, 0.5, 0.14, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: matColor, roughness: 0.72 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.07;
    g.add(base);

    // Golden embroidered lotus trim ring
    const ringGeo = new THREE.TorusGeometry(0.47, 0.032, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      roughness: 0.4,
      metalness: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    g.add(ring);

    // Subtle lotus petals around cushion if user or senior elder
    if (isSelectedUser || isGoldenLotus) {
      const auraGeo = new THREE.RingGeometry(0.52, 0.63, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: isSelectedUser ? 0xffd166 : 0xf4c552,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.015;
      g.add(aura);
    }

    return g;
  }

  function createMeditatingElderMesh(member) {
    const g = new THREE.Group();
    const coatHex = (member && member.outfitColor) || "#6E4A35";
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1cca5, roughness: 0.65 });
    const robeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(coatHex), roughness: 0.72 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe6e2da, roughness: 0.6 });

    // Cross-legged seated lower base
    const legsGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.22, 16);
    const legs = new THREE.Mesh(legsGeo, robeMat);
    legs.position.y = 0.24;
    g.add(legs);

    // Torso (facing -Z towards Tam Bảo altar!)
    const torsoGeo = new THREE.CylinderGeometry(0.21, 0.28, 0.52, 14);
    const torso = new THREE.Mesh(torsoGeo, robeMat);
    torso.position.y = 0.56;
    g.add(torso);

    // Clasped hands in prayer (chắp tay búp sen ở phía ngực hướng về tượng Phật -Z)
    const handsGeo = new THREE.SphereGeometry(0.085, 10, 10);
    const hands = new THREE.Mesh(handsGeo, skinMat);
    hands.scale.set(0.85, 1.25, 0.85);
    hands.position.set(0, 0.58, -0.24);
    g.add(hands);

    // Head
    const headGeo = new THREE.SphereGeometry(0.185, 14, 14);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.98;
    g.add(head);

    // Silver hair cap & bun on back (+Z side since character faces -Z)
    const hairGeo = new THREE.SphereGeometry(0.192, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.0;
    g.add(hair);

    if (member && member.isFemale) {
      const bunGeo = new THREE.SphereGeometry(0.085, 10, 10);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 0.98, 0.19);
      g.add(bun);
    }

    // Veteran / High-tier golden scarf (khăn chầu / áo lam viền vàng)
    if (member && (member.seniorityLevel >= 11 || member.isUser)) {
      const sashGeo = new THREE.TorusGeometry(0.2, 0.028, 8, 18);
      const sashMat = new THREE.MeshStandardMaterial({
        color: member.seniorityLevel >= 23 ? 0xffd166 : 0xd99b26,
        roughness: 0.4,
        metalness: 0.3
      });
      const sash = new THREE.Mesh(sashGeo, sashMat);
      sash.rotation.x = Math.PI / 2;
      sash.position.y = 0.8;
      g.add(sash);
    }

    return g;
  }

  function buildPagodaArchitecture() {
    // 1. Broad Courtyard Base (Sân gạch đỏ Bát Tràng cổ kính)
    const yardGeo = new THREE.PlaneGeometry(18.5, 15.5);
    const yardMat = new THREE.MeshStandardMaterial({
      map: getBatTrangCourtyardTex(),
      roughness: 0.86
    });
    const yard = new THREE.Mesh(yardGeo, yardMat);
    yard.rotation.x = -Math.PI / 2;
    yard.position.set(0, -0.02, 2.2);
    scene.add(yard);

    // 2. Elevated Sanctuary Stone Platform (Nền Tam Bảo & Gian Chánh Điện)
    const hallPlatGeo = new THREE.BoxGeometry(9.6, 0.26, 6.8);
    const hallPlatMat = new THREE.MeshStandardMaterial({ color: 0xd8c3a0, roughness: 0.72 });
    const hallPlat = new THREE.Mesh(hallPlatGeo, hallPlatMat);
    hallPlat.position.set(0, 0.11, -0.15);
    scene.add(hallPlat);

    // Warm woven reed mat inside sanctuary under the 10 cushions
    const innerMatGeo = new THREE.PlaneGeometry(7.6, 3.6);
    const innerMat = new THREE.Mesh(
      innerMatGeo,
      new THREE.MeshStandardMaterial({ color: 0xe9d7b4, roughness: 0.85 })
    );
    innerMat.rotation.x = -Math.PI / 2;
    innerMat.position.set(0, 0.25, 1.35);
    scene.add(innerMat);

    // 3 steps leading from courtyard up into Chánh Điện
    for (let st = 0; st < 2; st++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.12, 0.42),
        new THREE.MeshStandardMaterial({ color: 0xc2ab86, roughness: 0.78 })
      );
      stepMesh.position.set(0, 0.06 + st * 0.08, 3.45 - st * 0.28);
      scene.add(stepMesh);
    }

    // 3. Back Wall & Crimson-Gold Ironwood Columns (Cột gỗ lim sơn son thếp vàng)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 4.1, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x5c2618, roughness: 0.78 })
    );
    backWall.position.set(0, 2.25, -3.4);
    scene.add(backWall);

    const colPositions = [
      [-4.35, -3.1],
      [-2.35, -3.1],
      [2.35, -3.1],
      [4.35, -3.1],
      [-4.35, 2.95],
      [4.35, 2.95]
    ];
    const colMat = new THREE.MeshStandardMaterial({ color: 0x7c1f16, roughness: 0.55 });
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf4c552, roughness: 0.35, metalness: 0.45 });

    colPositions.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 3.9, 14), colMat);
      col.position.set(cx, 2.15, cz);
      scene.add(col);

      const baseStone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.28, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: 0x7a746c, roughness: 0.8 })
      );
      baseStone.position.set(cx, 0.3, cz);
      scene.add(baseStone);

      const goldBand = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), goldRingMat);
      goldBand.rotation.x = Math.PI / 2;
      goldBand.position.set(cx, 3.45, cz);
      scene.add(goldBand);
    });

    // Hoành phi "TÂM AN VẠN SỰ AN" hung high at the front beam
    const plaqueText = (currentConfig && currentConfig.plaqueTitle) || "TÂM AN VẠN SỰ AN";
    const plaqueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 0.78, 0.1),
      new THREE.MeshStandardMaterial({ map: getHorizontalPlaqueTex(plaqueText), roughness: 0.45 })
    );
    plaqueMesh.position.set(0, 3.72, -1.55);
    scene.add(plaqueMesh);

    // 4. Curved 2-Tier Traditional Vietnamese Pagoda Roof (Mái chùa cổ 2 tầng đao cong)
    // Kept at y = 4.25..5.65 with open front view so camera sees both the curved eaves AND inside the hall!
    const roofGroup = new THREE.Group();
    const roofTileMat = new THREE.MeshStandardMaterial({ map: getRoofTileTex(), roughness: 0.68 });
    const ridgeGoldMat = new THREE.MeshStandardMaterial({ color: 0xe6b44c, roughness: 0.4, metalness: 0.35 });

    // Lower main eave tier (back + left/right wings + slim front eave beam)
    const lowerRoof = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 7.1, 0.85, 4, 1, false, Math.PI / 4), roofTileMat);
    lowerRoof.scale.set(1.06, 1, 0.72);
    lowerRoof.position.set(0, 4.55, -0.85);
    roofGroup.add(lowerRoof);

    // Upper cổ diềm & top roof tier
    const upperRoof = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 4.9, 0.82, 4, 1, false, Math.PI / 4), roofTileMat);
    upperRoof.scale.set(1.04, 1, 0.68);
    upperRoof.position.set(0, 5.45, -1.05);
    roofGroup.add(upperRoof);

    // Golden ridge beam & central lotus stupa finial
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 0.18), ridgeGoldMat);
    ridge.position.set(0, 5.92, -1.05);
    roofGroup.add(ridge);

    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 12), ridgeGoldMat);
    finial.position.set(0, 6.22, -1.05);
    roofGroup.add(finial);

    // 4 Upturned Pagoda Corner Blades (Đầu đao cong vút 4 góc mái chùa Việt)
    const eaveCorners = [
      [-5.15, 4.22, 2.35, 1, 1],
      [5.15, 4.22, 2.35, -1, 1],
      [-5.15, 4.22, -4.05, 1, -1],
      [5.15, 4.22, -4.05, -1, -1]
    ];
    eaveCorners.forEach(([ex, ey, ez, sx, sz]) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.95, 8), ridgeGoldMat);
      horn.position.set(ex, ey + 0.28, ez);
      horn.rotation.z = sx * 0.52;
      horn.rotation.x = -sz * 0.35;
      roofGroup.add(horn);
    });

    // Two warm red silk lanterns hanging under front eaves
    [-3.15, 3.15].forEach((lx) => {
      const lGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xd63826,
          emissive: 0x8a1c10,
          emissiveIntensity: 0.45,
          roughness: 0.5
        })
      );
      body.scale.set(1, 1.2, 1);
      lGroup.add(body);
      lGroup.position.set(lx, 3.65, 2.55);
      roofGroup.add(lGroup);
    });

    scene.add(roofGroup);

    // 5. Tam Bảo Altar, Golden Buddha on Lotus Throne, Bronze Incense Censer, Bell & Muyu
    const altarTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.92, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x6e2316, roughness: 0.55 })
    );
    altarTable.position.set(0, 0.7, -2.35);
    scene.add(altarTable);

    const altarCloth = new THREE.Mesh(
      new THREE.BoxGeometry(3.86, 0.14, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.45 })
    );
    altarCloth.position.set(0, 1.18, -2.35);
    scene.add(altarCloth);

    // Golden Buddha Statue on Pink/Gold Lotus Pedestal
    const buddhaGroup = new THREE.Group();
    const goldBuddhaMat = new THREE.MeshStandardMaterial({
      color: 0xf7c948,
      emissive: 0x5c3d08,
      emissiveIntensity: 0.28,
      roughness: 0.3,
      metalness: 0.55
    });

    const lotusThrone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.52, 0.28, 18),
      new THREE.MeshStandardMaterial({ color: 0xe6849c, roughness: 0.5 })
    );
    lotusThrone.position.y = 1.38;
    buddhaGroup.add(lotusThrone);

    const bLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.26, 16), goldBuddhaMat);
    bLegs.position.y = 1.62;
    buddhaGroup.add(bLegs);

    const bTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.68, 16), goldBuddhaMat);
    bTorso.position.y = 2.05;
    buddhaGroup.add(bTorso);

    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), goldBuddhaMat);
    bHead.position.y = 2.56;
    buddhaGroup.add(bHead);

    const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), goldBuddhaMat);
    ushnisha.position.y = 2.82;
    buddhaGroup.add(ushnisha);

    // Radiant Halo behind Buddha
    buddhaHaloMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.92, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffe484,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.52
      })
    );
    buddhaHaloMesh.position.set(0, 2.42, -0.25);
    buddhaGroup.add(buddhaHaloMesh);

    buddhaGroup.position.set(0, 0, -2.45);
    scene.add(buddhaGroup);

    // Bronze Incense Censer (Lư hương đồng trước bàn thờ, z = -1.28)
    const censerMat = new THREE.MeshStandardMaterial({ color: 0xb07d32, roughness: 0.38, metalness: 0.5 });
    const censer = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.36, 18), censerMat);
    censer.position.set(0, 0.44, -1.18);
    scene.add(censer);

    // 3 glowing incense sticks
    [-0.07, 0, 0.07].forEach((ix) => {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.44, 6),
        new THREE.MeshBasicMaterial({ color: 0xa62626 })
      );
      stick.position.set(ix, 0.78, -1.18);
      scene.add(stick);

      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6b2b })
      );
      ember.position.set(ix, 1.01, -1.18);
      scene.add(ember);
    });

    // Hanging Bronze Đại Hồng Chung Bell (Left of altar, x = -3.35, z = -1.35)
    const bellFrame = new THREE.Group();
    const frameWoodMat = new THREE.MeshStandardMaterial({ color: 0x542316, roughness: 0.65 });
    [-0.48, 0.48].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.25, 10), frameWoodMat);
      post.position.set(px, 1.35, 0);
      bellFrame.add(post);
    });
    const topCross = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.14, 0.16), frameWoodMat);
    topCross.position.set(0, 2.42, 0);
    bellFrame.add(topCross);

    bellPivotGroup = new THREE.Group();
    bellPivotGroup.position.set(0, 2.38, 0);
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x9c722c, roughness: 0.35, metalness: 0.62 });
    const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.4, 0.86, 18), bronzeMat);
    bellBody.position.y = -0.56;
    bellPivotGroup.add(bellBody);
    bellFrame.add(bellPivotGroup);

    bellFrame.position.set(-3.35, 0, -1.25);
    scene.add(bellFrame);

    // Carved Wooden Fish Mõ (Right of altar, x = +2.35, z = -0.85)
    muyuMeshGroup = new THREE.Group();
    const muyuPillow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.14, 14),
      new THREE.MeshStandardMaterial({ color: 0x9e2a22, roughness: 0.7 })
    );
    muyuPillow.position.y = 0.32;
    muyuMeshGroup.add(muyuPillow);

    const muyuBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xc97b2c, roughness: 0.45 })
    );
    muyuBody.scale.set(1.18, 0.86, 1.0);
    muyuBody.position.y = 0.56;
    muyuMeshGroup.add(muyuBody);

    muyuMeshGroup.position.set(2.35, 0, -0.88);
    scene.add(muyuMeshGroup);
  }

  function buildCourtyardLotusPond() {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(POND_CENTER.x, 0, POND_CENTER.z);

    // Stone rim around pond
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(POND_CENTER.r, 0.22, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x8b857c, roughness: 0.82 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.12;
    pondGroup.add(rim);

    // Luminous jade-turquoise water surface
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(POND_CENTER.r - 0.08, 32),
      new THREE.MeshStandardMaterial({
        color: 0x2a7b76,
        emissive: 0x0d3633,
        emissiveIntensity: 0.25,
        roughness: 0.22,
        metalness: 0.15
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.06;
    pondGroup.add(water);

    // Lotus pads & pink 3D lotus flowers
    const padCoords = [
      [-0.85, -0.65, 0.38],
      [0.75, -0.8, 0.34],
      [-0.25, 0.85, 0.42],
      [0.95, 0.55, 0.35],
      [-1.15, 0.35, 0.32],
      [0.05, -0.15, 0.4]
    ];
    const padMat = new THREE.MeshStandardMaterial({ color: 0x2f7d4a, roughness: 0.65 });
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.5 });
    const pistilMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });

    padCoords.forEach(([lx, lz, r], i) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.025, 16), padMat);
      pad.position.set(lx, 0.08, lz);
      pondGroup.add(pad);

      if (i % 2 === 0) {
        const flower = new THREE.Group();
        for (let p = 0; p < 6; p++) {
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 6), petalMat);
          const ang = (p / 6) * Math.PI * 2;
          petal.position.set(Math.cos(ang) * 0.08, 0.12, Math.sin(ang) * 0.08);
          petal.rotation.z = -Math.cos(ang) * 0.42;
          petal.rotation.x = Math.sin(ang) * 0.42;
          flower.add(petal);
        }
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pistilMat);
        core.position.y = 0.14;
        flower.add(core);
        flower.position.set(lx, 0.07, lz);
        pondGroup.add(flower);
      }
    });

    scene.add(pondGroup);

    // Initial floating Hoa Đăng lanterns on the pond
    pondLanternMeshes = [];
    const lanternCount = Math.min(10, Math.max(4, Math.floor(((currentConfig && currentConfig.lanternCount) || 12) / 3)));
    for (let i = 0; i < lanternCount; i++) {
      addPondLanternInternal(i * 1.15);
    }
  }

  function addPondLanternInternal(phaseSeed) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.1, 0.06, 10),
      new THREE.MeshStandardMaterial({ color: 0xe86f8c, roughness: 0.5 })
    );
    g.add(base);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe07d })
    );
    flame.position.y = 0.08;
    g.add(flame);

    const orbitR = 0.45 + (pondLanternMeshes.length % 4) * 0.34;
    const baseAngle = phaseSeed || Math.random() * Math.PI * 2;
    g.position.set(
      POND_CENTER.x + Math.cos(baseAngle) * orbitR,
      0.11,
      POND_CENTER.z + Math.sin(baseAngle) * orbitR
    );
    scene.add(g);
    pondLanternMeshes.push({ mesh: g, orbitR, baseAngle, speed: 0.14 + (pondLanternMeshes.length % 3) * 0.04 });
  }

  function buildCourtyardWishingTree() {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(TREE_CENTER.x, 0, TREE_CENTER.z);

    // Circular brick planter around ancient Bodhi/Banyan tree
    const planter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.25, 0.28, 18),
      new THREE.MeshStandardMaterial({ color: 0x8c583a, roughness: 0.8 })
    );
    planter.position.y = 0.14;
    treeGroup.add(planter);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d28, roughness: 0.85 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.46, 2.35, 12), trunkMat);
    trunk.position.y = 1.25;
    treeGroup.add(trunk);

    // Spreading branches
    const branchSpecs = [
      [-0.75, 2.25, 0.3, 0.55],
      [0.75, 2.25, -0.2, -0.55],
      [0.15, 2.35, 0.72, 0.45]
    ];
    branchSpecs.forEach(([bx, by, bz, rz]) => {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.3, 8), trunkMat);
      br.position.set(bx * 0.5, by, bz * 0.5);
      br.rotation.z = rz;
      treeGroup.add(br);
    });

    // Lush green multi-crown foliage canopy
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.75 });
    const leafDarkMat = new THREE.MeshStandardMaterial({ color: 0x235932, roughness: 0.78 });
    const crowns = [
      [0, 3.15, 0, 1.35, leafMat],
      [-0.95, 2.68, 0.35, 0.95, leafDarkMat],
      [0.95, 2.72, -0.25, 0.95, leafMat],
      [-0.35, 2.75, -0.85, 0.88, leafMat],
      [0.45, 2.65, 0.88, 0.92, leafDarkMat]
    ];
    crowns.forEach(([cx, cy, cz, cr, mat]) => {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(cr, 14, 12), mat);
      sp.scale.set(1.12, 0.82, 1.12);
      sp.position.set(cx, cy, cz);
      treeGroup.add(sp);
    });

    scene.add(treeGroup);

    // Hang crimson & gold Red Wish Plaques (Thẻ đỏ ước nguyện treo quanh tán cây)
    wishPlaqueMeshes = [];
    const wishes = (currentConfig && currentConfig.wishes) || [];
    const initialCount = Math.max(10, Math.min(18, wishes.length + 8));
    for (let i = 0; i < initialCount; i++) {
      const wItem = wishes[i] || null;
      const isGold = Boolean(wItem && wItem.isVeteranGold) || i === 0;
      addWishPlaqueInternal(i, isGold);
    }
  }

  function addWishPlaqueInternal(slotSeed, isGold) {
    const idx = typeof slotSeed === "number" ? slotSeed : wishPlaqueMeshes.length;
    const ang = (idx * 0.78) % (Math.PI * 2);
    const radius = 1.08 + (idx % 3) * 0.28;
    const hangY = 1.88 + (idx % 3) * 0.26;

    const pivot = new THREE.Group();
    pivot.position.set(
      TREE_CENTER.x + Math.cos(ang) * radius,
      hangY + 0.28,
      TREE_CENTER.z + Math.sin(ang) * radius
    );

    // Golden silk cord
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6),
      new THREE.MeshBasicMaterial({ color: 0xf4c552 })
    );
    cord.position.y = -0.14;
    pivot.add(cord);

    // Crimson wooden wish tablet with gold top trim (Thẻ ước nguyện sơn đỏ viền vàng)
    const cardMat = new THREE.MeshStandardMaterial({
      color: isGold ? 0xf2b830 : 0xc92a22,
      emissive: isGold ? 0x5c3c04 : 0x4a0c08,
      emissiveIntensity: 0.28,
      roughness: 0.42
    });
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.03), cardMat);
    tablet.position.y = -0.38;
    pivot.add(tablet);

    const goldTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.055, 0.035),
      new THREE.MeshStandardMaterial({ color: 0xffe07d, roughness: 0.35 })
    );
    goldTop.position.y = -0.23;
    pivot.add(goldTop);

    // Red tassel below tablet
    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.03, 0.14, 6),
      new THREE.MeshBasicMaterial({ color: 0xd62828 })
    );
    tassel.position.y = -0.61;
    pivot.add(tassel);

    pivot.rotation.y = -ang + Math.PI / 2;
    scene.add(pivot);
    wishPlaqueMeshes.push({ pivot, phase: idx * 0.9 });
  }

  function buildTenMeditationCushions() {
    cushionActors = [];
    const attendees = (currentConfig && currentConfig.attendees) || [];
    const selectedIdx = Math.max(0, Math.min(9, Number(currentConfig && currentConfig.userCushionIdx) || 2));

    CUSHION_COORDS.forEach((slot) => {
      const occ = attendees.find((a) => a.cushionIdx === slot.idx) || null;
      const isUser = Boolean(occ && occ.isUser) || slot.idx === selectedIdx;
      const isGolden = Boolean(occ && occ.seniorityLevel >= 20);

      const cGroup = createCushionMesh(isGolden, isUser);
      cGroup.position.set(slot.x, 0.25, slot.z);
      scene.add(cGroup);

      let actorMesh = null;
      if (occ) {
        actorMesh = createMeditatingElderMesh(occ);
        actorMesh.position.set(slot.x, 0.25, slot.z);
        scene.add(actorMesh);
      }

      cushionActors.push({
        idx: slot.idx,
        x: slot.x,
        z: slot.z,
        occupant: occ,
        isUser,
        actorMesh
      });
    });
  }

  function spawnSmokeParticle(extraBoost) {
    if (!scene) return;
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(extraBoost ? 0.09 : 0.055, 8, 8),
      new THREE.MeshBasicMaterial({
        color: extraBoost ? 0xffe9a8 : 0xf2ece1,
        transparent: true,
        opacity: extraBoost ? 0.65 : 0.42
      })
    );
    puff.position.set((Math.random() - 0.5) * 0.16, 1.05, -1.18 + (Math.random() - 0.5) * 0.1);
    scene.add(puff);
    smokeParticles.push({
      mesh: puff,
      vy: 0.016 + Math.random() * 0.012,
      driftPhase: Math.random() * Math.PI * 2,
      alpha: extraBoost ? 0.65 : 0.42
    });
  }

  function spawnFloorSoundWave(colorHex, originX, originZ) {
    if (!scene) return;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex || "#FFD166"),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(originX || 0, 0.29, originZ || -0.8);
    scene.add(ring);
    expandingWaves.push({ mesh: ring, scale: 1, opacity: 0.78 });
  }

  function applyCameraPose() {
    if (!camera) return;
    let radius = 12.1;
    let camY = 6.85;
    let lookY = 1.42;
    let lookZ = 2.15;
    let fov = 54;

    if (cameraView === "cushions") {
      radius = 6.9;
      camY = 4.95;
      lookY = 1.2;
      lookZ = 0.55;
      fov = 49;
    } else if (cameraView === "courtyard") {
      radius = 9.8;
      camY = 5.35;
      lookY = 1.25;
      lookZ = 4.35;
      fov = 52;
    }

    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const cx = Math.sin(orbitAzimuth) * radius;
    const cz = lookZ + Math.cos(orbitAzimuth) * radius;
    camera.position.set(cx, camY, cz);
    camera.lookAt(0, lookY, lookZ - 1.2);
  }

  function projectToOverlay(worldVec, width, height) {
    const v = worldVec.clone().project(camera);
    if (v.z > 1) return null;
    const sx = Math.max(68, Math.min(width - 68, ((v.x + 1) * 0.5) * width));
    const sy = Math.max(22, Math.min(height - 20, ((-v.y + 1) * 0.5) * height));
    return { sx, sy };
  }

  function syncOverlayTags() {
    if (!tagsLayerEl || !camera || !containerEl || mode !== "3d") return;
    const w = containerEl.clientWidth || 358;
    const h = containerEl.clientHeight || 280;
    const pieces = [];

    if (cameraView === "wide" || cameraView === "courtyard") {
      const shownLanterns = Math.max(
        pondLanternMeshes.length,
        Number(currentConfig && currentConfig.lanternCount) || pondLanternMeshes.length
      );
      const pondPt = projectToOverlay(new THREE.Vector3(POND_CENTER.x, 0.9, POND_CENTER.z), w, h);
      if (pondPt) {
        pieces.push(
          `<div class="seat-status-tag" style="left:${Math.round(pondPt.sx)}px;top:${Math.round(pondPt.sy)}px;background:rgba(23,78,74,0.92);color:#FFFDF7;">Hồ Sen (${shownLanterns} đèn)</div>`
        );
      }

      const shownWishes = Math.max(
        wishPlaqueMeshes.length,
        Number(currentConfig && currentConfig.totalWishCount) || wishPlaqueMeshes.length
      );
      const treePt = projectToOverlay(new THREE.Vector3(TREE_CENTER.x, 3.65, TREE_CENTER.z), w, h);
      if (treePt) {
        pieces.push(
          `<div class="seat-status-tag" style="left:${Math.round(treePt.sx)}px;top:${Math.round(treePt.sy)}px;background:rgba(158,34,26,0.94);color:#FFE89E;">Cây Thẻ Đỏ (${shownWishes})</div>`
        );
      }
    }

    cushionActors.forEach((ca) => {
      if (!ca.occupant) return;
      const showInWide = ca.isUser || ca.occupant.isRealPeer;
      if (cameraView === "wide" && !showInWide) return;
      if (cameraView === "courtyard" && !ca.isUser) return;

      // Stagger odd/even column height in close-up view so adjacent pills never collide
      const tagWorldY = cameraView === "cushions" ? (ca.idx % 2 === 0 ? 1.48 : 1.98) : 1.68;
      const pt = projectToOverlay(new THREE.Vector3(ca.x, tagWorldY, ca.z), w, h);
      if (!pt) return;
      const shortName = String(ca.occupant.shortLabel || ca.occupant.name || "Bác").slice(0, 10);
      const bg = ca.isUser
        ? "rgba(184,59,42,0.95)"
        : ca.occupant.isRealPeer
        ? "rgba(36,106,82,0.95)"
        : "rgba(42,30,22,0.88)";
      pieces.push(
        `<div class="seat-status-tag" style="left:${Math.round(pt.sx)}px;top:${Math.round(pt.sy)}px;background:${bg};color:#FFFDF7;">BĐ${ca.idx + 1} · ${shortName}</div>`
      );
    });

    if (floatingBanner && floatingBanner.expiresAt > Date.now()) {
      const bPt = projectToOverlay(floatingBanner.worldPos, w, h);
      if (bPt) {
        pieces.push(
          `<div class="seat-status-tag" style="left:${Math.round(bPt.sx)}px;top:${Math.round(bPt.sy)}px;background:${floatingBanner.bg};color:${floatingBanner.color};border:1.5px solid #FFE07D;font-weight:700;">${floatingBanner.text}</div>`
        );
      }
    }

    tagsLayerEl.innerHTML = pieces.join("");
  }

  function animate3D(ts) {
    animId = requestAnimationFrame(animate3D);
    if (ts - lastFrame < FPS_INTERVAL) return;
    lastFrame = ts;
    const tSec = ts * 0.001;

    applyCameraPose();

    // Gentle breathing sway for meditating elders
    cushionActors.forEach((ca, idx) => {
      if (ca.actorMesh) {
        ca.actorMesh.position.y = 0.25 + Math.sin(tSec * 1.6 + idx * 0.7) * 0.014;
      }
    });

    // Halo pulse
    if (buddhaHaloMesh && buddhaHaloMesh.material) {
      buddhaHaloMesh.material.opacity = 0.44 + Math.sin(tSec * 2.1) * 0.12;
    }

    // Incense smoke rising
    if (Math.random() < 0.26 && smokeParticles.length < 28) {
      spawnSmokeParticle(false);
    }
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const sp = smokeParticles[i];
      sp.mesh.position.y += sp.vy;
      sp.mesh.position.x += Math.sin(tSec * 2.2 + sp.driftPhase) * 0.006;
      sp.alpha -= 0.007;
      sp.mesh.scale.multiplyScalar(1.012);
      sp.mesh.material.opacity = Math.max(0, sp.alpha);
      if (sp.alpha <= 0.02) {
        scene.remove(sp.mesh);
        sp.mesh.geometry.dispose();
        sp.mesh.material.dispose();
        smokeParticles.splice(i, 1);
      }
    }

    // Drifting lotus pond lanterns
    pondLanternMeshes.forEach((pl, idx) => {
      const ang = pl.baseAngle + tSec * pl.speed;
      pl.mesh.position.x = POND_CENTER.x + Math.cos(ang) * pl.orbitR;
      pl.mesh.position.z = POND_CENTER.z + Math.sin(ang) * pl.orbitR;
      pl.mesh.position.y = 0.11 + Math.sin(tSec * 2.5 + idx) * 0.015;
    });

    // Gentle breeze swaying the Red Wish Plaques on the Wishing Tree
    wishPlaqueMeshes.forEach((wp) => {
      wp.pivot.rotation.z = Math.sin(tSec * 2.0 + wp.phase) * 0.14;
      wp.pivot.rotation.x = Math.cos(tSec * 1.5 + wp.phase) * 0.08;
    });

    // Bell pendulum swing
    if (bellPivotGroup && bellSwingEnergy > 0.004) {
      bellPivotGroup.rotation.z = Math.sin(tSec * 6.5) * bellSwingEnergy;
      bellSwingEnergy *= 0.955;
    } else if (bellPivotGroup) {
      bellPivotGroup.rotation.z = 0;
    }

    // Muyu tap bounce
    if (muyuMeshGroup && muyuPulseTimer > 0) {
      const s = 1 + Math.sin(muyuPulseTimer * Math.PI) * 0.18;
      muyuMeshGroup.scale.set(s, s, s);
      muyuPulseTimer = Math.max(0, muyuPulseTimer - 0.12);
    } else if (muyuMeshGroup) {
      muyuMeshGroup.scale.set(1, 1, 1);
    }

    // Expanding sound/blessing waves
    for (let i = expandingWaves.length - 1; i >= 0; i--) {
      const wv = expandingWaves[i];
      wv.scale += 0.18;
      wv.opacity -= 0.026;
      wv.mesh.scale.set(wv.scale, wv.scale, 1);
      wv.mesh.material.opacity = Math.max(0, wv.opacity);
      if (wv.opacity <= 0.02) {
        scene.remove(wv.mesh);
        wv.mesh.geometry.dispose();
        wv.mesh.material.dispose();
        expandingWaves.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
    syncOverlayTags();
  }

  function render2DFallback() {
    if (!containerEl) return;
    const c = document.createElement("canvas");
    const w = containerEl.clientWidth || 360;
    const h = containerEl.clientHeight || 280;
    c.width = w * 2;
    c.height = h * 2;
    c.style.width = "100%";
    c.style.height = "100%";
    containerEl.innerHTML = "";
    containerEl.appendChild(c);

    const ctx = c.getContext("2d");
    ctx.scale(2, 2);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#332218");
    grad.addColorStop(0.55, "#5E3922");
    grad.addColorStop(1, "#A6603E");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Curved pagoda roof silhouette
    ctx.fillStyle = "#7D2E1E";
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.28);
    ctx.quadraticCurveTo(w * 0.5, h * 0.06, w * 0.88, h * 0.28);
    ctx.lineTo(w * 0.94, h * 0.33);
    ctx.lineTo(w * 0.06, h * 0.33);
    ctx.closePath();
    ctx.fill();

    // Lotus pond left & Wishing tree right
    ctx.fillStyle = "#2A7B76";
    ctx.beginPath();
    ctx.ellipse(w * 0.2, h * 0.82, 46, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2E6F40";
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.68, 34, 0, Math.PI * 2);
    ctx.fill();
    for (let r = 0; r < 6; r++) {
      ctx.fillStyle = "#D62828";
      ctx.fillRect(w * 0.74 + r * 9, h * 0.66 + (r % 2) * 8, 5, 11);
    }

    // 10 Cushions in center
    const attendees = (currentConfig && currentConfig.attendees) || [];
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const cx = w * 0.28 + col * (w * 0.11);
      const cy = h * 0.52 + row * 34;
      ctx.fillStyle = i === (currentConfig && currentConfig.userCushionIdx) ? "#B83B2A" : "#C98A1E";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (attendees.some((a) => a.cushionIdx === i)) {
        ctx.fillStyle = "#F1CCA5";
        ctx.beginPath();
        ctx.arc(cx, cy - 11, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function bindOrbitGestures(el) {
    const startDrag = (clientX) => {
      isDragging = true;
      dragStartX = clientX;
      dragStartAzimuth = orbitAzimuth;
    };
    const moveDrag = (clientX) => {
      if (!isDragging) return;
      const dx = clientX - dragStartX;
      orbitAzimuth = Math.max(-0.62, Math.min(0.62, dragStartAzimuth - dx * 0.0045));
    };
    const stopDrag = () => {
      isDragging = false;
    };

    el.addEventListener("mousedown", (e) => startDrag(e.clientX));
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
    window.addEventListener("mouseup", stopDrag);

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
    el.addEventListener("touchend", stopDrag, { passive: true });
  }

  function mount(container, config, onFallback) {
    dispose();
    containerEl = container;
    currentConfig = config || {};
    cameraView = (config && config.cameraView) || cameraView || "wide";
    mode = (config && config.preferredRender === "2.5d") ? "2.5d" : "3d";

    if (!containerEl) return;

    if (mode === "2.5d" || typeof window.THREE === "undefined") {
      mode = "2.5d";
      render2DFallback();
      return;
    }

    try {
      const w = Math.max(300, containerEl.clientWidth || 360);
      const h = Math.max(240, containerEl.clientHeight || 295);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x281c15);
      scene.fog = new THREE.Fog(0x281c15, 15, 29);

      camera = new THREE.PerspectiveCamera(55, w / h, 0.2, 45);
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

      containerEl.innerHTML = "";
      canvasEl = renderer.domElement;
      canvasEl.className = "temple-canvas";
      containerEl.appendChild(canvasEl);

      tagsLayerEl = document.createElement("div");
      tagsLayerEl.className = "stage-overlay-tags";
      containerEl.appendChild(tagsLayerEl);

      // Warm sanctuary lighting + courtyard sunlight
      const hemi = new THREE.HemisphereLight(0xfff1d6, 0x4d3320, 1.15);
      scene.add(hemi);

      const sunLight = new THREE.DirectionalLight(0xffe7ba, 1.1);
      sunLight.position.set(5.5, 11.5, 8.5);
      scene.add(sunLight);

      const altarGlow = new THREE.PointLight(0xffb84d, 1.35, 9.5);
      altarGlow.position.set(0, 2.35, -1.65);
      scene.add(altarGlow);

      const pondGlow = new THREE.PointLight(0x64dfdf, 0.65, 6.5);
      pondGlow.position.set(POND_CENTER.x, 1.1, POND_CENTER.z);
      scene.add(pondGlow);

      buildPagodaArchitecture();
      buildTenMeditationCushions();
      buildCourtyardLotusPond();
      buildCourtyardWishingTree();

      for (let s = 0; s < 7; s++) spawnSmokeParticle(false);

      bindOrbitGestures(canvasEl);
      applyCameraPose();
      lastFrame = 0;
      animId = requestAnimationFrame(animate3D);
    } catch (err) {
      mode = "2.5d";
      render2DFallback();
      if (typeof onFallback === "function") onFallback(err);
    }
  }

  function setCameraView(viewMode) {
    cameraView = viewMode || "wide";
    orbitAzimuth = 0;
    applyCameraPose();
    syncOverlayTags();
  }

  function getCameraView() {
    return cameraView;
  }

  function showBannerAt(x, y, z, text, bg, color, durationMs) {
    if (!window.THREE) return;
    floatingBanner = {
      worldPos: new THREE.Vector3(x, y, z),
      text: String(text || "").slice(0, 28),
      bg: bg || "rgba(122, 42, 22, 0.95)",
      color: color || "#FFF8DC",
      expiresAt: Date.now() + (durationMs || 3800)
    };
  }

  function triggerIncense(speakerName) {
    for (let i = 0; i < 6; i++) spawnSmokeParticle(true);
    spawnFloorSoundWave("#FFD166", 0, -1.1);
    showBannerAt(0, 2.05, -1.15, `${speakerName || "Bác"} dâng hương tâm thành`, "rgba(142,45,24,0.95)", "#FFE89E", 3800);
  }

  function triggerMuyu(count) {
    muyuPulseTimer = 1.0;
    spawnFloorSoundWave("#F4C552", 2.35, -0.88);
    showBannerAt(2.35, 1.45, -0.88, `+1 Nhịp Mõ (${count || 1})`, "rgba(110,65,18,0.95)", "#FFF6D6", 2200);
  }

  function triggerBell(speakerName) {
    bellSwingEnergy = 0.34;
    spawnFloorSoundWave("#FFE599", -3.35, -1.25);
    spawnFloorSoundWave("#FFD166", 0, 1.2);
    showBannerAt(-3.1, 2.5, -1.1, `${speakerName || "Chánh Điện"} thỉnh chuông`, "rgba(122,74,16,0.95)", "#FFF8DC", 3800);
  }

  function spawnWishPlaque(speakerName, isVeteranGold) {
    if (currentConfig) {
      currentConfig.totalWishCount = (Number(currentConfig.totalWishCount) || 16) + 1;
    }
    if (mode === "3d" && scene) {
      addWishPlaqueInternal(wishPlaqueMeshes.length + 1, Boolean(isVeteranGold));
      spawnFloorSoundWave("#E63946", TREE_CENTER.x, TREE_CENTER.z);
      showBannerAt(
        TREE_CENTER.x,
        3.95,
        TREE_CENTER.z,
        `Thẻ đỏ mới: ${String(speakerName || "Bác").slice(0, 14)}`,
        "rgba(168,28,28,0.96)",
        "#FFE89E",
        4200
      );
    }
  }

  function spawnPondLantern(speakerName) {
    if (currentConfig) {
      currentConfig.lanternCount = (Number(currentConfig.lanternCount) || 18) + 1;
    }
    if (mode === "3d" && scene) {
      addPondLanternInternal(Date.now() * 0.001);
      spawnFloorSoundWave("#64DFDF", POND_CENTER.x, POND_CENTER.z);
      showBannerAt(
        POND_CENTER.x,
        1.25,
        POND_CENTER.z,
        `Hoa đăng: ${String(speakerName || "Bác").slice(0, 14)}`,
        "rgba(24,96,90,0.95)",
        "#FFFDF7",
        3800
      );
    }
  }

  function dispose() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    smokeParticles = [];
    pondLanternMeshes = [];
    wishPlaqueMeshes = [];
    expandingWaves = [];
    cushionActors = [];
    bellPivotGroup = null;
    muyuMeshGroup = null;
    buddhaHaloMesh = null;
    floatingBanner = null;

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
    camera = null;
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
    spawnWishPlaque,
    spawnPondLantern,
    dispose
  };
})();
