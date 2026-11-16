window.TuoiBacProgression = (function () {
  // ============================================================================
  // HỆ THỐNG CÂY DANH HIỆU ĐA TẦNG (32 TẦNG THÂM NIÊN + 8 CÂY CHUYÊN MÔN = 96 DANH HIỆU)
  // Công thức toán học lồi (Convex Power-Exponential) tăng dần độ khó theo cấp số nhân:
  //   XP_thâm_niên(L) = floor( 20 * L^1.85 + 12 * L * 1.11^L )   với L = 1..32
  //   Điểm_chuyên_môn(k) = ceil( a * k^2.15 + b * (1.38^(k-1) - 1) ) với k = 1..8
  // ============================================================================

  function calcMainTierXp(level) {
    const L = Math.max(0, Math.floor(Number(level) || 0));
    if (L <= 0) return 0;
    return Math.floor(20 * Math.pow(L, 1.85) + 12 * L * Math.pow(1.11, L));
  }

  function calcSkillTierReq(baseA, baseB, tierIdx1Based) {
    const k = Math.max(1, Math.floor(Number(tierIdx1Based) || 1));
    if (k === 1) return 1;
    return Math.ceil(baseA * Math.pow(k, 2.15) + baseB * (Math.pow(1.38, k - 1) - 1));
  }

  const ERAS = [
    {
      id: "era-0",
      rangeLabel: "Chưa mở Thẻ",
      eraName: "Khách Vãng Lai",
      badgeStyle: "guest",
      color: "#7A6A58",
      bg: "#F3EDE2",
      frameUnlock: "none",
      cohortRole: "Khách mới ghé thăm"
    },
    {
      id: "era-1",
      rangeLabel: "Tầng 1–5",
      eraName: "Giai đoạn I · Mộc Mạc Khởi Đầu",
      badgeStyle: "newcomer",
      color: "#6E4A35",
      bg: "#F7EDE2",
      frameUnlock: "tri-am",
      cohortRole: "Thành viên Mới (Cộng đồng ưu tiên chào đón)"
    },
    {
      id: "era-2",
      rangeLabel: "Tầng 6–10",
      eraName: "Giai đoạn II · Gốm Lam Gắn Bó",
      badgeStyle: "regular",
      color: "#2B5B7E",
      bg: "#E8F1F8",
      frameUnlock: "tri-am",
      cohortRole: "Hội viên Quen thuộc"
    },
    {
      id: "era-3",
      rangeLabel: "Tầng 11–16",
      eraName: "Giai đoạn III · Ngọc Bích Thâm Tình",
      badgeStyle: "trusted",
      color: "#246A52",
      bg: "#E4F4ED",
      frameUnlock: "thi-huu",
      cohortRole: "Tri kỷ Nòng cốt"
    },
    {
      id: "era-4",
      rangeLabel: "Tầng 17–22",
      eraName: "Giai đoạn IV · Gỗ Trắc Khảm Đồng",
      badgeStyle: "elder",
      color: "#8A3F22",
      bg: "#FBECE6",
      frameUnlock: "giu-lua",
      cohortRole: "Bậc Trưởng Lão Giữ Lửa"
    },
    {
      id: "era-5",
      rangeLabel: "Tầng 23–28",
      eraName: "Giai đoạn V · Sơn Mài Thếp Vàng",
      badgeStyle: "veteran",
      color: "#9E6310",
      bg: "#FFF6DE",
      frameUnlock: "cay-cao",
      cohortRole: "Lão Làng Lâu Năm"
    },
    {
      id: "era-6",
      rangeLabel: "Tầng 29–32",
      eraName: "Giai đoạn VI · Đại Thụ Trăm Năm",
      badgeStyle: "legend",
      color: "#A62626",
      bg: "#FDEaea",
      frameUnlock: "cay-cao",
      cohortRole: "Tinh Hoa Bách Niên (Vinh danh toàn quán)"
    }
  ];

  const MAIN_32_NAMES = [
    // Tầng 1..5 (Mộc Mạc Khởi Đầu)
    { level: 1, title: "Tân Khách Mộc Mạc", shortTag: "Tân Khách", eraIdx: 1, perk: "Mở Thẻ Hội Viên thành công · Được đặt tên bàn trà riêng" },
    { level: 2, title: "Bạn Trà Đầu Ngõ", shortTag: "Đầu Ngõ", eraIdx: 1, perk: "Nhận nhãn Thành viên mới thân thiện để cả bàn chào hỏi" },
    { level: 3, title: "Người Quen Sớm Mai", shortTag: "Sớm Mai", eraIdx: 1, perk: "Mở khóa đầy đủ 8 Sticker Quán Trà cỡ lớn" },
    { level: 4, title: "Khách Quý Hiên Nhà", shortTag: "Khách Quý", eraIdx: 1, perk: "Tặng thêm +5 Xu khi điểm danh chuỗi 3 ngày" },
    { level: 5, title: "Bạn Trà Chân Tình", shortTag: "Chân Tình", eraIdx: 1, perk: "Hoàn thành Giai đoạn Mộc Mạc · Mở khung Tri Âm Sáng Sớm" },

    // Tầng 6..10 (Gốm Lam Gắn Bó)
    { level: 6, title: "Bạn Hiền Cùng Xóm", shortTag: "Bạn Hiền", eraIdx: 2, perk: "Bước vào hàng Hội viên Quen thuộc men lam Bát Tràng" },
    { level: 7, title: "Tri Âm Đầu Mùa", shortTag: "Tri Âm", eraIdx: 2, perk: "Được ghim lời chúc trên Cây Ước Nguyện Chánh Điện 3D" },
    { level: 8, title: "Người Giữ Ấm Chén", shortTag: "Giữ Ấm", eraIdx: 2, perk: "Bàn trà do bác làm Chủ bàn được gắn huy hiệu Men Lam" },
    { level: 9, title: "Tâm Giao Sớm Hôm", shortTag: "Tâm Giao", eraIdx: 2, perk: "Tăng giới hạn bông hoa tặng thơ mỗi ngày lên 5 hoa" },
    { level: 10, title: "Tri Kỷ Quán Quen", shortTag: "Tri Kỷ", eraIdx: 2, perk: "Vinh danh cột mốc Tầng 10 · Nhận +20 Xu thưởng" },

    // Tầng 11..16 (Ngọc Bích Thâm Tình)
    { level: 11, title: "Bậc Hiền Hòa Nhã", shortTag: "Hòa Nhã", eraIdx: 3, perk: "Bước vào Giai đoạn Ngọc Bích · Mở huy hiệu Tri Kỷ Nòng Cốt" },
    { level: 12, title: "Người Truyền Hơi Ấm", shortTag: "Hơi Ấm", eraIdx: 3, perk: "Lời chào của bác giúp người mới nhận thêm điểm khích lệ" },
    { level: 13, title: "Chủ Bàn Uy Tín", shortTag: "Uy Tín", eraIdx: 3, perk: "Ưu tiên đề xuất bàn đàm đạo của bác lên đầu sảnh" },
    { level: 14, title: "Cây Trúc Giữa Sân", shortTag: "Cây Trúc", eraIdx: 3, perk: "Mở chiếu Bồ Đoàn hàng trung tâm tại Chánh Điện 3D" },
    { level: 15, title: "Đàn Anh Đáng Mến", shortTag: "Đáng Mến", eraIdx: 3, perk: "Mở khóa Khung 3D Thi Hữu Tao Đàn miễn phí" },
    { level: 16, title: "Ngọc Sáng Tuổi Vàng", shortTag: "Ngọc Sáng", eraIdx: 3, perk: "Vinh danh cột mốc Tầng 16 trên Bảng Vàng Tỉnh Nhà" },

    // Tầng 17..22 (Gỗ Trắc Khảm Đồng)
    { level: 17, title: "Người Giữ Lửa Trà", shortTag: "Giữ Lửa", eraIdx: 4, perk: "Bước vào hàng Trưởng Lão Khảm Đồng · Mở khung Giữ Lửa 3D" },
    { level: 18, title: "Trưởng Lão Hòa Hiếu", shortTag: "Trưởng Lão", eraIdx: 4, perk: "Huy hiệu Trưởng Lão hiện cạnh tên tại mọi phòng sinh hoạt" },
    { level: 19, title: "Cao Niên Mẫu Mực", shortTag: "Mẫu Mực", eraIdx: 4, perk: "Được vinh danh trong Ban Liên Lạc các Hội Đồng Ngũ & CLB" },
    { level: 20, title: "Cây Tùng Đón Gió", shortTag: "Cây Tùng", eraIdx: 4, perk: "Cột mốc Tầng 20 · Khung thẻ tên viền đồng ánh kim" },
    { level: 21, title: "Danh Sĩ Ba Miền", shortTag: "Danh Sĩ", eraIdx: 4, perk: "Bài thơ và bàn đàm đạo được gắn nhãn Tinh Tuyển" },
    { level: 22, title: "Trụ Cột Tình Thân", shortTag: "Trụ Cột", eraIdx: 4, perk: "Hoàn thành Giai đoạn Khảm Đồng · Tôn vinh người gắn kết" },

    // Tầng 23..28 (Sơn Mài Thếp Vàng)
    { level: 23, title: "Bậc Kỳ Lão Đáng Kính", shortTag: "Kỳ Lão", eraIdx: 5, perk: "Bước vào hàng Lão Làng Sơn Mài Thếp Vàng · Mở khung Cây Cao 3D" },
    { level: 24, title: "Cội Tùng Vững Chãi", shortTag: "Cội Tùng", eraIdx: 5, perk: "Bồ đoàn viền sen vàng hàng đầu tại Chánh Điện 3D" },
    { level: 25, title: "Tinh Hoa Hội Quán", shortTag: "Tinh Hoa", eraIdx: 5, perk: "Cột mốc Tầng 25 · Khắc tên vào Sổ Vàng Lưu Niệm Quán Trà" },
    { level: 26, title: "Đại Thụ Tỏa Bóng", shortTag: "Đại Thụ", eraIdx: 5, perk: "Thẻ ước nguyện trên cây sân chùa rực sắc vàng hoàng kim" },
    { level: 27, title: "Ngọn Đèn Sáng Mãi", shortTag: "Đèn Sáng", eraIdx: 5, perk: "Ngọn đèn điểm danh của bác tỏa hào quang kép trên bản đồ" },
    { level: 28, title: "Bảo Vật Tình Quê", shortTag: "Bảo Vật", eraIdx: 5, perk: "Hoàn thành Giai đoạn Sơn Mài Thếp Vàng lâu năm" },

    // Tầng 29..32 (Đại Thụ Trăm Năm)
    { level: 29, title: "Trưởng Thượng Tri Âm", shortTag: "Trưởng Thượng", eraIdx: 6, perk: "Bước vào Cảnh giới Đại Thụ Bách Niên cao quý" },
    { level: 30, title: "Cây Đa Bến Nước", shortTag: "Cây Đa", eraIdx: 6, perk: "Cột mốc Tầng 30 · Biểu tượng sum vầy của quê hương Việt" },
    { level: 31, title: "Tinh Hoa Tuổi Hạc", shortTag: "Tuổi Hạc", eraIdx: 6, perk: "Danh hiệu truyền cảm hứng sống vui khỏe cho toàn cộng đồng" },
    { level: 32, title: "Đại Thụ Trăm Năm", shortTag: "Bách Niên", eraIdx: 6, perk: "Đỉnh cao Tầng 32 · Vinh danh vĩnh viễn tại Quán Trà Tuổi Bạc" }
  ];

  const MAIN_TIERS = [
    {
      level: 0,
      id: "tier-0",
      title: "Khách Ghé Hiên Trà",
      fullLabel: "Bậc 0 · Khách Ghé Hiên Trà",
      shortTag: "Khách Ghé",
      minXp: 0,
      requiresCard: false,
      era: ERAS[0],
      perk: "Đang dùng thử tự do — Mở Thẻ Hội Viên 10 giây nhận ngay +35 XP & +15 Xu, thăng thẳng lên Tầng 1 Tân Khách Mộc Mạc!"
    }
  ].concat(
    MAIN_32_NAMES.map((item) => {
      const era = ERAS[item.eraIdx];
      return {
        level: item.level,
        id: `tier-${item.level}`,
        title: item.title,
        fullLabel: `Tầng ${item.level} · ${item.title}`,
        shortTag: item.shortTag,
        minXp: calcMainTierXp(item.level),
        requiresCard: true,
        era,
        perk: item.perk
      };
    })
  );

  // 8 Cây Danh Hiệu Chuyên Môn (mỗi tính năng 8 bậc = 64 Danh hiệu chuyên sâu)
  const RAW_SKILL_TREES = [
    {
      id: "tea_host",
      name: "Cây Trà Đạo & Chủ Bàn",
      featureRoute: "tearoom",
      unitLabel: "điểm trà đàm & mở bàn",
      color: "#2E6B56",
      baseA: 1.5,
      baseB: 4,
      formulaNote: "M(k) = ceil(1.5·k^2.15 + 4·(1.38^(k-1) - 1))",
      howToEarn: "Ngồi bàn trà (+2), gửi câu nói/Sticker (+2), đặt tên làm Chủ bàn (+6)",
      tiers: [
        "Khách Nhấp Trà Thơm",
        "Người Pha Ấm Sớm",
        "Chủ Bàn Thân Thiện",
        "Trà Sư Hiếu Khách",
        "Tri Kỷ Ấm Tử Sa",
        "Danh Trà Quản Gia",
        "Bậc Thầy Trà Đạo",
        "Minh Chủ Hiên Trà"
      ]
    },
    {
      id: "xiangqi",
      name: "Cây Kỳ Đạo (Cờ Tướng & Cờ Thế)",
      featureRoute: "xiangqi",
      unitLabel: "điểm kỳ nghệ tích lũy",
      color: "#7A3E18",
      baseA: 1.4,
      baseB: 3.5,
      formulaNote: "M(k) = ceil(1.4·k^2.15 + 3.5·(1.38^(k-1) - 1))",
      howToEarn: "Đi nước ván thật (+1), thắng Máy / Ván treo (+8), giải 1 Cờ Thế cổ phổ (+10)",
      tiers: [
        "Tân Kỳ Nhập Môn",
        "Kỳ Thủ Đầu Phố",
        "Cao Thủ Cờ Tàn",
        "Chuyên Gia Phá Thế",
        "Kỳ Vương Câu Lạc Bộ",
        "Danh Kỳ Ba Miền",
        "Đại Sư Quất Trung Bí",
        "Quốc Thủ Lão Làng"
      ]
    },
    {
      id: "poetry",
      name: "Cây Thi Ca & Ngâm Vịnh",
      featureRoute: "poetry",
      unitLabel: "điểm thơ văn & tặng hoa",
      color: "#9E2E24",
      baseA: 1.2,
      baseB: 3,
      formulaNote: "M(k) = ceil(1.2·k^2.15 + 3·(1.38^(k-1) - 1))",
      howToEarn: "Nghe ngâm thơ (+2), tặng hoa (+3), sáng tác & đăng bài thơ mới (+8)",
      tiers: [
        "Người Yêu Vần Thơ",
        "Bạn Thơ Đầu Xuân",
        "Thi Hữu Lục Bát",
        "Mặc Khách Tao Đàn",
        "Bút Hoa Tinh Tế",
        "Trưởng Chiếu Thơ Quê",
        "Đại Thi Hữu Tuổi Vàng",
        "Thi Tiên Hội Quán"
      ]
    },
    {
      id: "folk_games",
      name: "Cây Ô Ăn Quan & Minh Mẫn",
      featureRoute: "games",
      unitLabel: "điểm dân gian & đố vui",
      color: "#9E6412",
      baseA: 1.3,
      baseB: 3.2,
      formulaNote: "M(k) = ceil(1.3·k^2.15 + 3.2·(1.38^(k-1) - 1))",
      howToEarn: "Rải quân Ô ăn quan (+2), trả lời đúng câu Đố vui (+4), hoàn thành 5 câu (+6)",
      tiers: [
        "Người Chơi Vui Vẻ",
        "Tay Rải Sỏi Khéo",
        "Cao Thủ Ăn Quan",
        "Bác Học Đố Vui",
        "Minh Mẫn Hơn Người",
        "Kiện Tướng Dân Gian",
        "Trí Tuệ Sáng Suốt",
        "Bậc Kỳ Tài Dân Gian"
      ]
    },
    {
      id: "morning_habit",
      name: "Cây Điểm Danh & Đọc Báo Sáng",
      featureRoute: "newspaper",
      unitLabel: "điểm chuyên cần buổi sáng",
      color: "#B83B2A",
      baseA: 1.5,
      baseB: 4,
      formulaNote: "M(k) = ceil(1.5·k^2.15 + 4·(1.38^(k-1) - 1))",
      howToEarn: "Điểm danh bình an (+5), đọc bài báo sáng (+3), mở bàn đàm đạo theo tin (+5)",
      tiers: [
        "Người Dậy Sớm",
        "Ngọn Đèn Tỉnh Nhà",
        "Độc Giả Điểm Tin",
        "Người Giữ Nhịp Sáng",
        "Bình Luận Điềm Đạm",
        "Hải Đăng Bình An",
        "Gương Sáng Chuyên Cần",
        "Biểu Tượng Sống Khỏe"
      ]
    },
    {
      id: "comrade_social",
      name: "Cây Đồng Ngũ & Kết Bạn Tri Âm",
      featureRoute: "groups",
      unitLabel: "điểm gắn kết đồng đội",
      color: "#3E5634",
      baseA: 1.25,
      baseB: 3,
      formulaNote: "M(k) = ceil(1.25·k^2.15 + 3·(1.38^(k-1) - 1))",
      howToEarn: "Kết bạn tâm giao (+5), gia nhập đơn vị (+6), lập hội mới / đăng bảng tin (+8)",
      tiers: [
        "Bạn Mới Quen Tên",
        "Đồng Đội Điểm Danh",
        "Nhịp Cầu Tri Âm",
        "Liên Lạc Viên Tận Tâm",
        "Trưởng Nhóm Gắn Kết",
        "Hạt Nhân Đoàn Kết",
        "Thủ Lĩnh Đồng Niên",
        "Đại Sứ Tình Đồng Đội"
      ]
    },
    {
      id: "temple_zen",
      name: "Cây Chánh Điện & Tâm An",
      featureRoute: "zen",
      unitLabel: "điểm công đức tĩnh tâm",
      color: "#7A4B1E",
      baseA: 1.5,
      baseB: 4,
      formulaNote: "M(k) = ceil(1.5·k^2.15 + 4·(1.38^(k-1) - 1))",
      howToEarn: "Gõ mõ (+1), thỉnh đại hồng chung (+2), dâng hương / thả hoa đăng / treo thẻ đỏ (+4)",
      tiers: [
        "Tâm Khởi Thiện Lành",
        "Cư Sĩ Bồ Đoàn",
        "Người Gieo Duyên Lành",
        "Tiếng Chuông Sớm Mai",
        "Hương Trầm Tĩnh Tại",
        "Bậc An Nhiên Tự Tại",
        "Tuệ Giác Tuổi Hạc",
        "Đại Đức Tâm An"
      ]
    },
    {
      id: "voice_wisdom",
      name: "Cây Giọng Quê & Giữ Gìn Tiếng Việt",
      featureRoute: "tearoom",
      unitLabel: "điểm giọng nói & từ điển",
      color: "#4A4475",
      baseA: 1.1,
      baseB: 2.5,
      formulaNote: "M(k) = ceil(1.1·k^2.15 + 2.5·(1.38^(k-1) - 1))",
      howToEarn: "Nói bằng giọng micro (+4), nghe Đọc to (+1), dạy từ mới cho Sổ từ điển (+6)",
      tiers: [
        "Giọng Quê Ấm Áp",
        "Người Nói Truyền Cảm",
        "Người Góp Chữ Vàng",
        "Sứ Giả Giọng Quê",
        "Cố Vấn Ngôn Từ",
        "Học Giả Phương Ngữ",
        "Người Giữ Tiếng Việt",
        "Tinh Hoa Ngôn Ngữ Việt"
      ]
    }
  ];

  const SKILL_TREES = RAW_SKILL_TREES.map((tree) => ({
    id: tree.id,
    name: tree.name,
    featureRoute: tree.featureRoute,
    unitLabel: tree.unitLabel,
    color: tree.color,
    formulaNote: tree.formulaNote,
    howToEarn: tree.howToEarn,
    tiers: tree.tiers.map((tName, idx) => ({
      rank: idx + 1,
      roman: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][idx],
      title: tName,
      reqPoints: calcSkillTierReq(tree.baseA, tree.baseB, idx + 1)
    }))
  }));

  function evaluateMainProgress(rawXp, isRegistered) {
    const xp = Math.max(0, Math.floor(Number(rawXp) || 0));
    if (!isRegistered) {
      const projectedXp = xp + 35;
      let projectedTier = MAIN_TIERS[1];
      for (let i = 1; i < MAIN_TIERS.length; i++) {
        if (projectedXp >= MAIN_TIERS[i].minXp) projectedTier = MAIN_TIERS[i];
      }
      return {
        xp,
        isGuest: true,
        current: MAIN_TIERS[0],
        next: projectedTier,
        xpIntoLevel: xp,
        xpNeededForNext: Math.max(1, MAIN_TIERS[1].minXp),
        percent: Math.min(95, Math.round((xp / Math.max(1, MAIN_TIERS[1].minXp)) * 100))
      };
    }

    let current = MAIN_TIERS[1];
    let next = MAIN_TIERS[2] || null;
    for (let i = 1; i < MAIN_TIERS.length; i++) {
      if (xp >= MAIN_TIERS[i].minXp) {
        current = MAIN_TIERS[i];
        next = MAIN_TIERS[i + 1] || null;
      }
    }
    const span = next ? Math.max(1, next.minXp - current.minXp) : 1;
    const into = next ? Math.max(0, xp - current.minXp) : 1;
    const percent = next ? Math.min(100, Math.max(5, Math.round((into / span) * 100))) : 100;
    return {
      xp,
      isGuest: false,
      current,
      next,
      xpIntoLevel: into,
      xpNeededForNext: next ? next.minXp - xp : 0,
      percent
    };
  }

  function evaluateSkillTree(treeId, rawPts) {
    const tree = SKILL_TREES.find((t) => t.id === treeId) || SKILL_TREES[0];
    const pts = Math.max(0, Math.floor(Number(rawPts) || 0));
    let current = null;
    let next = tree.tiers[0];
    for (let i = 0; i < tree.tiers.length; i++) {
      if (pts >= tree.tiers[i].reqPoints) {
        current = tree.tiers[i];
        next = tree.tiers[i + 1] || null;
      }
    }
    const prevReq = current ? current.reqPoints : 0;
    const span = next ? Math.max(1, next.reqPoints - prevReq) : 1;
    const percent = next ? Math.min(100, Math.max(4, Math.round(((pts - prevReq) / span) * 100))) : 100;
    return {
      tree,
      points: pts,
      current,
      next,
      percent
    };
  }

  function getCohortComparisonLabel(level, isRegistered) {
    if (!isRegistered || level <= 0) return { tag: "Khách ghé", cls: "guest", desc: "Chưa định danh" };
    if (level <= 5) return { tag: `Người mới · Tầng ${level}`, cls: "newcomer", desc: "Thành viên mới gia nhập" };
    if (level <= 10) return { tag: `Quen thân · Tầng ${level}`, cls: "regular", desc: "Sinh hoạt đều đặn" };
    if (level <= 16) return { tag: `Tri kỷ · Tầng ${level}`, cls: "trusted", desc: "Gắn bó sâu sắc" };
    if (level <= 22) return { tag: `Trưởng lão · Tầng ${level}`, cls: "elder", desc: "Người giữ lửa uy tín" };
    return { tag: `Cây đại thụ · Tầng ${level}`, cls: "veteran", desc: "Lão làng lâu năm" };
  }

  return {
    ERAS,
    MAIN_TIERS,
    SKILL_TREES,
    calcMainTierXp,
    calcSkillTierReq,
    evaluateMainProgress,
    evaluateSkillTree,
    getCohortComparisonLabel
  };
})();
