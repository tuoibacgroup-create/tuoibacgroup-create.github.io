window.TuoiBacData = (function () {
  // 34 tỉnh/thành sau sáp nhập (ghi chú tỉnh cũ trong ngoặc) + Hoàng Sa, Trường Sa, Người Việt xa quê
  // Tọa độ [x, y] chiếu chuẩn Natural Earth 10m (cos 16°, kinh vĩ độ thực) trên khung SVG 380 x 560
  const PROVINCES = [
    { id: "tuyen-quang", name: "Tuyên Quang (gồm cả Hà Giang)", short: "Tuyên Quang", x: 127, y: 61, lamps: 178 },
    { id: "cao-bang", name: "Cao Bằng", short: "Cao Bằng", x: 159, y: 54, lamps: 112 },
    { id: "lai-chau", name: "Lai Châu", short: "Lai Châu", x: 67, y: 64, lamps: 84 },
    { id: "lao-cai", name: "Lào Cai (gồm cả Yên Bái)", short: "Lào Cai", x: 103, y: 77, lamps: 204 },
    { id: "thai-nguyen", name: "Thái Nguyên (gồm cả Bắc Kạn)", short: "Thái Nguyên", x: 149, y: 82, lamps: 256 },
    { id: "lang-son", name: "Lạng Sơn", short: "Lạng Sơn", x: 172, y: 81, lamps: 149 },
    { id: "quang-ninh", name: "Quảng Ninh", short: "Quảng Ninh", x: 194, y: 101, lamps: 288 },
    { id: "phu-tho", name: "Phú Thọ (gồm cả Vĩnh Phúc, Hòa Bình)", short: "Phú Thọ", x: 130, y: 104, lamps: 342 },
    { id: "bac-ninh", name: "Bắc Ninh (gồm cả Bắc Giang)", short: "Bắc Ninh", x: 162, y: 100, lamps: 315 },
    { id: "ha-noi", name: "Thủ đô Hà Nội", short: "Hà Nội", x: 149, y: 107, lamps: 1245 },
    { id: "hai-phong", name: "TP. Hải Phòng (gồm cả Hải Dương)", short: "Hải Phòng", x: 171, y: 113, lamps: 530 },
    { id: "hung-yen", name: "Hưng Yên (gồm cả Thái Bình)", short: "Hưng Yên", x: 160, y: 121, lamps: 294 },
    { id: "ninh-binh", name: "Ninh Bình (gồm cả Hà Nam, Nam Định)", short: "Ninh Bình", x: 153, y: 132, lamps: 386 },
    { id: "son-la", name: "Sơn La", short: "Sơn La", x: 94, y: 101, lamps: 121 },
    { id: "dien-bien", name: "Điện Biên", short: "Điện Biên", x: 63, y: 90, lamps: 95 },
    { id: "thanh-hoa", name: "Thanh Hóa", short: "Thanh Hóa", x: 136, y: 146, lamps: 440 },
    { id: "nghe-an", name: "Nghệ An", short: "Nghệ An", x: 122, y: 167, lamps: 512 },
    { id: "ha-tinh", name: "Hà Tĩnh", short: "Hà Tĩnh", x: 147, y: 194, lamps: 276 },
    { id: "quang-tri", name: "Quảng Trị (gồm cả Quảng Bình)", short: "Quảng Trị", x: 176, y: 232, lamps: 234 },
    { id: "hue", name: "TP. Huế", short: "TP. Huế", x: 202, y: 254, lamps: 308 },
    { id: "da-nang", name: "TP. Đà Nẵng (gồm cả Quảng Nam, Hoàng Sa)", short: "Đà Nẵng", x: 217, y: 275, lamps: 486 },
    { id: "quang-ngai", name: "Quảng Ngãi (gồm cả Kon Tum)", short: "Quảng Ngãi", x: 226, y: 305, lamps: 245 },
    { id: "gia-lai", name: "Gia Lai (gồm cả Bình Định)", short: "Gia Lai", x: 230, y: 335, lamps: 318 },
    { id: "dak-lak", name: "Đắk Lắk (gồm cả Phú Yên)", short: "Đắk Lắk", x: 231, y: 369, lamps: 274 },
    { id: "khanh-hoa", name: "Khánh Hòa (gồm cả Ninh Thuận)", short: "Khánh Hòa", x: 246, y: 393, lamps: 336 },
    { id: "lam-dong", name: "Lâm Đồng (gồm cả Đắk Nông, Bình Thuận)", short: "Lâm Đồng", x: 220, y: 409, lamps: 365 },
    { id: "dong-nai", name: "Đồng Nai (gồm cả Bình Phước)", short: "Đồng Nai", x: 191, y: 416, lamps: 412 },
    { id: "tp-hcm", name: "TP. Hồ Chí Minh (gồm cả Bình Dương, Bà Rịa – Vũng Tàu)", short: "TP. HCM", x: 176, y: 436, lamps: 1380 },
    { id: "tay-ninh", name: "Tây Ninh (gồm cả Long An)", short: "Tây Ninh", x: 158, y: 425, lamps: 268 },
    { id: "dong-thap", name: "Đồng Tháp (gồm cả Tiền Giang)", short: "Đồng Tháp", x: 149, y: 447, lamps: 325 },
    { id: "vinh-long", name: "Vĩnh Long (gồm cả Bến Tre, Trà Vinh)", short: "Vĩnh Long", x: 160, y: 460, lamps: 356 },
    { id: "can-tho", name: "TP. Cần Thơ (gồm cả Sóc Trăng, Hậu Giang)", short: "Cần Thơ", x: 144, y: 468, lamps: 492 },
    { id: "an-giang", name: "An Giang (gồm cả Kiên Giang)", short: "An Giang", x: 128, y: 455, lamps: 348 },
    { id: "ca-mau", name: "Cà Mau (gồm cả Bạc Liêu)", short: "Cà Mau", x: 128, y: 492, lamps: 215 },
    { id: "hoang-sa", name: "Quần đảo Hoàng Sa (TP. Đà Nẵng)", short: "Hoàng Sa", x: 318, y: 246, lamps: 64, island: true },
    { id: "truong-sa", name: "Quần đảo Trường Sa (Khánh Hòa)", short: "Trường Sa", x: 318, y: 448, lamps: 82, island: true },
    { id: "xa-que", name: "Người Việt xa quê", short: "Xa quê", x: 58, y: 344, lamps: 419, diaspora: true }
  ];

  const OUTFITS = [
    { id: "ao-ba-ba", name: "Áo bà ba nâu trầm", regionTag: "Truyền thống", desc: "Vải đũi mộc mạc, hàng cúc ngà truyền thống", color: "#6E4A35", cost: 0 },
    { id: "ao-dai-xanh", name: "Áo lụa xanh ngọc", regionTag: "Truyền thống", desc: "Lụa mềm cổ đứng nhã nhặn, mát mắt", color: "#2E5E4E", cost: 0 },
    { id: "ao-tu-than-bac-ninh", name: "Áo tứ thân mớ ba (Bắc Ninh)", regionTag: "Bắc Ninh · Kinh Bắc", desc: "Tà nâu non Kinh Bắc phối yếm đào đỏ thắm và dải lụa xanh thiên lý", color: "#6B3D32", cost: 16 },
    { id: "ao-the-kinh-bac", name: "Áo the thâm liền anh (Bắc Ninh)", regionTag: "Bắc Ninh · Kinh Bắc", desc: "Áo dài the thâm ánh chàm lót cổ lụa trắng ngà của liền anh Quan họ", color: "#272C36", cost: 16 },
    { id: "ao-ngu-than-mien-trung", name: "Áo ngũ thân tay chẽn (Miền Trung)", regionTag: "Miền Trung · Cố Đô", desc: "Cổ phục Cố đô cài 5 khuy đồng mạ vàng, sắc chàm trầm mặc đĩnh đạc", color: "#23495D", cost: 18 },
    { id: "ao-lua-tim-hue", name: "Áo lụa tím Huế trầm (Miền Trung)", regionTag: "Miền Trung · Xứ Huế", desc: "Lụa tơ tằm sắc tím mộng mơ bên dòng Hương Giang đằm thắm", color: "#633B6E", cost: 20 },
    { id: "ao-tho-cam-mien-trung", name: "Áo thổ cẩm Trường Sơn (Miền Trung)", regionTag: "Miền Trung · Trường Sơn", desc: "Vải chàm dệt tay viền hoa văn thổ cẩm đỏ vàng dải đất miền Trung – Tây Nguyên", color: "#3A2C39", cost: 18 },
    { id: "ao-ba-ba-nam-bo", name: "Áo bà ba đen Khăn rằn (Miền Nam)", regionTag: "Miền Nam · Sông Nước", desc: "Áo bà ba đen miệt vườn vắt đôi tà khăn rằn Nam Bộ trắng đen thân thương", color: "#2E3136", cost: 16 },
    { id: "ao-ba-ba-mo-ga-nam", name: "Áo bà ba lụa mỡ gà (Miền Nam)", regionTag: "Miền Nam · Miệt Vườn", desc: "Sắc vàng mỡ gà dịu mát của các cô, các má miền Tây sông nước", color: "#C89D54", cost: 16 },
    { id: "ao-linh", name: "Áo sơ mi cựu chiến binh", regionTag: "Đồng Ngũ", desc: "Màu xanh rêu kỷ niệm, hai túi ngực ngay ngắn", color: "#556B45", cost: 15 },
    { id: "ao-kaki-kem", name: "Áo đại cán kaki kem", regionTag: "Hưu Trí", desc: "Phong thái nhà giáo, cán bộ hưu trí điềm đạm lịch lãm", color: "#9A8160", cost: 18 },
    { id: "ao-len-do", name: "Áo gấm đỏ ấm", regionTag: "Lễ Tết", desc: "Sắc đỏ boóc-đô sang trọng cho buổi sáng se lạnh", color: "#A2382B", cost: 20 },
    { id: "ao-gam-vang", name: "Áo lụa hoa cúc vàng", regionTag: "Mừng Thọ", desc: "Vàng hoàng kim tươi tắn, điểm họa tiết cúc thu", color: "#C48A2D", cost: 25 },
    { id: "ao-gam-lam-ngoc", name: "Áo gấm lam ngọc khánh thọ", regionTag: "Khánh Thọ", desc: "Gấm dệt chữ Thọ xanh lam trầm quý phái dịp hội ngộ", color: "#1F4E68", cost: 28 }
  ];

  const TABLE_ITEMS = [
    { id: "am-tu-sa", name: "Ấm trà tử sa", desc: "Ấm đất nung giữ nhiệt trên khay trắc 3 chén men ngọc", color: "#8B4228", cost: 0 },
    { id: "khay-tra-da", name: "Khay trà đá vỉa hè & kẹo lạc", desc: "Ba cốc thủy tinh có khía mát lạnh, ấm nhôm nhỏ, kẹo lạc vừng và hạt hướng dương", color: "#C78E2C", cost: 8 },
    { id: "binh-sen", name: "Bình hoa sen hồng", desc: "Bình sứ men lam cắm búp sen hồng và gương sen sớm mai", color: "#E8D5C4", cost: 10 },
    { id: "dia-hat-dua", name: "Khay mứt Tết sơn mài", desc: "Khay sơn mài bát giác bày hạt dưa đỏ, mứt sen và bánh in", color: "#C63B2F", cost: 10 },
    { id: "khay-trau-cau", name: "Cơi trầu đồng cánh phượng", desc: "Cơi đồng chạm lọng bày trầu têm cánh phượng và cau tươi bổ tư", color: "#B08632", cost: 12 },
    { id: "banh-dau-xanh", name: "Bánh đậu xanh & kẹo lạc", desc: "Đĩa gốm men lam bày bánh đậu xanh Hải Dương và kẹo lạc vừng", color: "#D49B35", cost: 12 },
    { id: "bonsai-mini", name: "Chậu tùng la hán bonsai", desc: "Thế tùng cổ thụ uốn tay trồng trong chậu gốm men ngọc", color: "#2E6A44", cost: 15 },
    { id: "lu-tram-dong", name: "Đỉnh trầm đồng mắt cua", desc: "Lư đồng cổ nắp chạm mây đặt trên đế gỗ gụ tỏa khói trầm dịu", color: "#9C6228", cost: 18 },
    { id: "den-dau", name: "Đèn dầu thời bao cấp", desc: "Chân đồng chạm hoa văn, bóng thủy tinh thắp ngọn lửa ấm", color: "#D98A2B", cost: 20 },
    { id: "tich-tra-men-lam", name: "Ấm tích men lam ủ giỏ mây", desc: "Giỏ mây đan tay lót vải hoa ủ nóng ấm tích sứ vẽ rồng phượng", color: "#8F5D34", cost: 20 },
    { id: "ban-co-ngoc", name: "Bàn cờ tướng gỗ trắc thu nhỏ", desc: "Bàn cờ cẩm lai bày thế cờ quân ngọc bích và hổ phách tinh xảo", color: "#6A3A22", cost: 22 },
    { id: "radio-go", name: "Radio vỏ gỗ cổ", desc: "Đài bán dẫn vỏ gỗ gụ có núm xoay mạ đồng nghe đài Tiếng nói VN", color: "#5E3B25", cost: 25 },
    { id: "long-chim-khuyen", name: "Lồng chim khuyên tre trúc cổ", desc: "Lồng tre vót tay chạm đế gụ có chú chim vành khuyên đậu hót", color: "#A67B38", cost: 25 }
  ];

  const ACCESSORIES = [
    { id: "none", name: "Để đầu trần tự nhiên", desc: "Mái tóc bạc chải gọn gàng, phúc hậu", cost: 0 },
    { id: "glasses", name: "Kính lão gọng vàng", desc: "Gọng tròn mạ vàng 18K giúp đọc báo sáng rõ nét", cost: 0 },
    { id: "scarf", name: "Khăn quàng ấm cổ", desc: "Khăn len đỏ boóc-đô quàng êm quanh cổ áo ngày se lạnh", cost: 10 },
    { id: "khan-ran-nam-bo", name: "Khăn rằn Nam Bộ quàng vai", regionTag: "Miền Nam", desc: "Khăn rằn kẻ ô đen trắng vạch đỏ mộc mạc vắt ngang vai người miền Tây", cost: 12 },
    { id: "kinh-ram-tra", name: "Kính mát mắt trà đồi mồi", desc: "Tròng trà dịu mắt chống chói nắng sớm, gọng đồi mồi cổ điển", cost: 12 },
    { id: "khan-xep-kinh-bac", name: "Khăn xếp the đen chữ Nhân", regionTag: "Bắc Ninh", desc: "Khăn xếp lụa the đen nếp chữ Nhân chỉnh tề của liền anh Kinh Bắc", cost: 14 },
    { id: "cap", name: "Mũ cối xanh kỷ niệm", desc: "Mũ cối cựu chiến binh đội ngay ngắn, đậm chất lính xưa", cost: 15 },
    { id: "mu-tai-beo", name: "Mũ tai bèo kaki dã ngoại", desc: "Mũ vải kaki xanh rêu vành mềm che nắng dạo vườn, hành quân", cost: 15 },
    { id: "non-quai-thao", name: "Nón quai thao Quan họ", regionTag: "Bắc Ninh", desc: "Nón ba tầm vành phẳng đan lá cọ kèm tua quai thao lụa ngà Kinh Bắc", cost: 16 },
    { id: "khan-dong", name: "Khăn đóng gấm đỏ lễ thọ", desc: "Khăn xếp lụa gấm đỏ viền kim tuyến trang trọng dịp lễ Tết, mừng thọ", cost: 18 },
    { id: "non-la", name: "Nón lá truyền thống", regionTag: "Ba Miền", desc: "Nón lá chằm tay vành tre mộc mạc quê hương Việt Nam", cost: 20 }
  ];

  // Khung danh hiệu gắn lên thẻ tên & huy hiệu nhân vật 3D
  const TITLE_FRAMES = [
    {
      id: "none",
      name: "Thẻ tên mộc giản dị",
      shortTag: "",
      desc: "Bảng tên gỗ mộc mặc định, nhẹ nhàng dễ đọc",
      color: "#3A2A20",
      rimHex: 0x8b6240,
      cost: 0
    },
    {
      id: "tri-am",
      name: "Tri Âm Sáng Sớm",
      shortTag: "Tri Âm",
      desc: "Viền ngọc bích & huy hiệu lá trà xanh (mở sẵn cho thành viên điểm danh sáng)",
      color: "#2E5E4E",
      rimHex: 0x2e7d63,
      cost: 0
    },
    {
      id: "thi-huu",
      name: "Thi Hữu Tao Đàn",
      shortTag: "Thi Hữu",
      desc: "Khung gấm đỏ thêu bút nghiên (tự mở khi đăng thơ mới hoặc đổi bằng 10 Xu)",
      color: "#A2382B",
      rimHex: 0xc84b38,
      cost: 10
    },
    {
      id: "ky-thu",
      name: "Kỳ Thủ Đầu Xuân",
      shortTag: "Kỳ Thủ",
      desc: "Khung gỗ mun khảm đồng (tự mở khi giải thế Cờ tướng 9×10 hoặc đổi bằng 10 Xu)",
      color: "#5C3621",
      rimHex: 0xd49a35,
      cost: 10
    },
    {
      id: "giu-lua",
      name: "Người Giữ Lửa Trà",
      shortTag: "Giữ Lửa",
      desc: "Khung hoàng kim ấm áp tôn vinh người hay mời trà kết bạn",
      color: "#B6731E",
      rimHex: 0xf0b23a,
      cost: 15
    },
    {
      id: "dong-ngu",
      name: "Đồng Đội Năm Xưa",
      shortTag: "Đồng Ngũ",
      desc: "Khung xanh quân đội viền sao đồng (tự mở khi gia nhập hoặc lập Đơn vị Đồng ngũ)",
      color: "#435B35",
      rimHex: 0x6b8f4e,
      cost: 0
    },
    {
      id: "cay-cao",
      name: "Cây Cao Bóng Cả",
      shortTag: "Cây Cao",
      desc: "Khung sơn mài thếp vàng dành cho hội viên gắn bó lâu năm tại Quán Trà",
      color: "#9E6412",
      rimHex: 0xf5c242,
      cost: 0
    },
    {
      id: "tam-an",
      name: "Cư Sĩ Tâm An",
      shortTag: "Tâm An",
      desc: "Khung sen tịnh tiến mở khi đạt Hạng III cây Chánh Điện & Tâm An (đi chùa, thắp nhang, gõ mõ)",
      color: "#682642",
      rimHex: 0xd98fa8,
      cost: 0
    },
    {
      id: "kien-tuong",
      name: "Kiện Tướng Dân Gian",
      shortTag: "Kiện Tướng",
      desc: "Khung ngọc chạm vàng mở khi thắng từ 3 ván Ô ăn quan / Cờ tướng thật hoặc đạt Hạng III Dân Gian",
      color: "#1A3E6C",
      rimHex: 0xffd97d,
      cost: 0
    }
  ];

  // Thói quen & sở thích dùng để ghép bàn thông minh
  const HABIT_TAGS = [
    { id: "day-som", label: "Dậy sớm 5h30" },
    { id: "doc-bao", label: "Đọc báo sáng" },
    { id: "uong-tra", label: "Thưởng trà" },
    { id: "tho-ca", label: "Thơ lục bát & Ca dao" },
    { id: "co-tuong", label: "Cờ tướng & Cờ thế" },
    { id: "cuu-chien-binh", label: "Cựu chiến binh" },
    { id: "cay-canh", label: "Cây cảnh & Hoa lan" },
    { id: "bao-cap", label: "Ký ức thời bao cấp" },
    { id: "duong-sinh", label: "Tập dưỡng sinh" }
  ];

  // Danh bạ các anh chị đang sinh hoạt trong quán (xưng hô Anh / Chị + hiển thị tuổi rõ ràng)
  const SENIOR_DIRECTORY = [
    { id: "lan", name: "Chị Lan", gender: "female", age: 68, provinceId: "ha-noi", province: "Hà Nội", habits: ["uong-tra", "tho-ca", "day-som"], bio: "Cựu giáo viên, thích trà nhài và ngâm thơ lục bát mỗi sáng.", outfitId: "ao-len-do", outfitColor: "#A2382B", hat: "hair-bun", item: "binh-sen", badge: "Vừa cười", titleFrameId: "thi-huu" },
    { id: "tham", name: "Chị Thắm", gender: "female", age: 64, provinceId: "bac-ninh", province: "Bắc Ninh", habits: ["tho-ca", "uong-tra", "day-som"], bio: "Liền chị Quan họ Kinh Bắc, hay têm trầu cánh phượng mời bạn trà.", outfitId: "ao-tu-than-bac-ninh", outfitColor: "#6B3D32", hat: "non-quai-thao", item: "khay-trau-cau", badge: "Mời trầu", titleFrameId: "thi-huu" },
    { id: "minh", name: "Anh Minh", gender: "male", age: 71, provinceId: "hai-phong", province: "Hải Phòng", habits: ["cuu-chien-binh", "co-tuong", "doc-bao"], bio: "Cựu chiến binh Hải quân, mê cờ tướng và đọc thời sự sáng.", outfitId: "ao-linh", outfitColor: "#556B45", hat: "cap", item: "radio-go", badge: "Đang nghe", titleFrameId: "ky-thu" },
    { id: "hoa", name: "Chị Hoa", gender: "female", age: 63, provinceId: "da-nang", province: "Đà Nẵng", habits: ["duong-sinh", "uong-tra", "tho-ca"], bio: "Trưởng nhóm dân vũ phường, hay mời trà và bánh đậu xanh.", outfitId: "ao-lua-tim-hue", outfitColor: "#633B6E", hat: "hair-bob", item: "banh-dau-xanh", badge: "Mời trà", titleFrameId: "tri-am" },
    { id: "bay", name: "Anh Bảy", gender: "male", age: 66, provinceId: "dong-thap", province: "Đồng Tháp", habits: ["cay-canh", "day-som", "uong-tra"], bio: "Chăm vườn mai vàng, quàng khăn rằn ca tài tử buổi trưa.", outfitId: "ao-ba-ba-nam-bo", outfitColor: "#2E3136", hat: "khan-ran-nam-bo", item: "khay-tra-da", badge: "Đang ngồi", titleFrameId: "none" },
    { id: "thanh", name: "Anh Thành", gender: "male", age: 69, provinceId: "ninh-binh", province: "Ninh Bình", habits: ["cay-canh", "co-tuong", "day-som"], bio: "Có 15 chậu sanh bonsai tự uốn và đôi chim vành khuyên hót sáng.", outfitId: "ao-kaki-kem", outfitColor: "#9A8160", hat: "mu-tai-beo", item: "long-chim-khuyen", badge: "Đang nói", titleFrameId: "ky-thu" },
    { id: "sau", name: "Anh Sáu", gender: "male", age: 72, provinceId: "vinh-long", province: "Vĩnh Long", habits: ["cay-canh", "bao-cap", "uong-tra"], bio: "Thích kể chuyện miệt vườn sông nước và trồng lan rừng.", outfitId: "ao-ba-ba", outfitColor: "#6E4A35", hat: "khan-ran-nam-bo", item: "tich-tra-men-lam", badge: "Đang ngồi", titleFrameId: "none" },
    { id: "nga", name: "Chị Nga", gender: "female", age: 61, provinceId: "lam-dong", province: "Lâm Đồng", habits: ["duong-sinh", "cay-canh", "tho-ca"], bio: "Mặc áo thổ cẩm ấm, trồng hoa cúc Đà Lạt và tập dưỡng sinh lúc 6 giờ.", outfitId: "ao-tho-cam-mien-trung", outfitColor: "#3A2C39", hat: "non-la", item: "binh-sen", badge: "Mời trà", titleFrameId: "tri-am" },
    { id: "tu", name: "Anh Tư", gender: "male", age: 65, provinceId: "an-giang", province: "An Giang", habits: ["doc-bao", "co-tuong", "bao-cap"], bio: "Đọc báo giấy bên cốc trà đá sáng, hay giải thế cờ tàn.", outfitId: "ao-kaki-kem", outfitColor: "#9A8160", hat: "kinh-ram-tra", item: "khay-tra-da", badge: "Đang nghe", titleFrameId: "none" },
    { id: "vinh", name: "Anh Vĩnh", gender: "male", age: 74, provinceId: "nghe-an", province: "Nghệ An", habits: ["cuu-chien-binh", "bao-cap", "day-som"], bio: "Từng đóng quân Trường Sơn, nhớ nhiều kỷ niệm thời tem phiếu.", outfitId: "ao-linh", outfitColor: "#556B45", hat: "cap", item: "den-dau", badge: "Đang nói", titleFrameId: "giu-lua" },
    { id: "mai", name: "Chị Mai", gender: "female", age: 70, provinceId: "thanh-hoa", province: "Thanh Hóa", habits: ["bao-cap", "tho-ca", "duong-sinh"], bio: "Hay đọc ca dao xứ Thanh và mời trầu cánh phượng.", outfitId: "ao-lua-tim-hue", outfitColor: "#633B6E", hat: "glasses", item: "khay-trau-cau", badge: "Vừa cười", titleFrameId: "thi-huu" },
    { id: "hai", name: "Anh Hải", gender: "male", age: 68, provinceId: "hue", province: "TP. Huế", habits: ["uong-tra", "tho-ca", "bao-cap"], bio: "Mặc áo ngũ thân Cố đô, đốt trầm hương pha trà sen cung đình.", outfitId: "ao-ngu-than-mien-trung", outfitColor: "#23495D", hat: "khan-dong", item: "lu-tram-dong", badge: "Đang nghe", titleFrameId: "giu-lua" },
    { id: "lien", name: "Chị Liên", gender: "female", age: 62, provinceId: "tp-hcm", province: "TP. HCM", habits: ["duong-sinh", "doc-bao", "uong-tra"], bio: "Thích mẹo chăm sóc giấc ngủ và sống khỏe tuổi nghỉ hưu.", outfitId: "ao-dai-xanh", outfitColor: "#2E5E4E", hat: "hair-bob", item: "dia-hat-dua", badge: "Đang ngồi", titleFrameId: "tri-am" },
    { id: "dung", name: "Anh Dũng", gender: "male", age: 67, provinceId: "bac-ninh", province: "Bắc Ninh", habits: ["tho-ca", "co-tuong", "uong-tra"], bio: "Liền anh áo the khăn xếp Quan họ, mê xướng họa thơ Đường luật.", outfitId: "ao-the-kinh-bac", outfitColor: "#272C36", hat: "khan-xep-kinh-bac", item: "khay-trau-cau", badge: "Đang nói", titleFrameId: "thi-huu" },
    { id: "thu", name: "Chị Thu", gender: "female", age: 64, provinceId: "thai-nguyen", province: "Thái Nguyên", habits: ["uong-tra", "tho-ca", "cay-canh"], bio: "Quê đất chè Tân Cương, hay tặng hoa trong sân thơ.", outfitId: "ao-dai-xanh", outfitColor: "#2E5E4E", hat: "hair-bun", item: "am-tu-sa", badge: "Vừa cười", titleFrameId: "thi-huu" },
    { id: "phat", name: "Anh Phát", gender: "male", age: 66, provinceId: "can-tho", province: "Cần Thơ", habits: ["co-tuong", "uong-tra", "day-som"], bio: "Đồng hương Cần Thơ, mê ô ăn quan và trà đá sáng vỉa hè.", outfitId: "ao-ba-ba-nam-bo", outfitColor: "#2E3136", hat: "khan-ran-nam-bo", item: "khay-tra-da", badge: "Đang nghe", titleFrameId: "ky-thu" },
    { id: "quynh", name: "Anh Quỳnh", gender: "male", age: 70, provinceId: "phu-tho", province: "Phú Thọ", habits: ["cuu-chien-binh", "doc-bao", "bao-cap"], bio: "Cán bộ hưu trí, hay bàn tin lương hưu và chuyện đồng đội.", outfitId: "ao-len-do", outfitColor: "#A2382B", hat: "glasses", item: "den-dau", badge: "Đang ngồi", titleFrameId: "tri-am" },
    { id: "hung-ccb", name: "Anh Cường", gender: "male", age: 73, provinceId: "quang-tri", province: "Quảng Trị", habits: ["cuu-chien-binh", "co-tuong", "uong-tra"], bio: "Cựu chiến binh thành cổ, thích bày thế cờ ngọc giao lưu đồng đội.", outfitId: "ao-linh", outfitColor: "#556B45", hat: "mu-tai-beo", item: "ban-co-ngoc", badge: "Mời trà", titleFrameId: "giu-lua" },
    { id: "binh", name: "Chị Bình", gender: "female", age: 60, provinceId: "can-tho", province: "Cần Thơ", habits: ["duong-sinh", "doc-bao", "cay-canh"], bio: "Áo bà ba lụa mỡ gà, tập dưỡng sinh sớm ở bến Ninh Kiều.", outfitId: "ao-ba-ba-mo-ga-nam", outfitColor: "#C89D54", hat: "khan-ran-nam-bo", item: "bonsai-mini", badge: "Đang ngồi", titleFrameId: "none" }
  ];

  function pickSeniors(ids) {
    return ids
      .map((sid) => SENIOR_DIRECTORY.find((s) => s.id === sid))
      .filter(Boolean)
      .map((s) => Object.assign({}, s, { habits: s.habits.slice() }));
  }

  function buildRoomFromSpec(spec) {
    return {
      id: spec.id,
      name: spec.name,
      shortName: spec.shortName,
      description: spec.description,
      hostName: spec.hostName,
      focusHabits: spec.focusHabits.slice(),
      theme: Object.assign({}, spec.theme),
      tables: spec.tables.map((t, idx) => ({
        id: `${spec.id}-ban-${idx + 1}`,
        shortLabel: `B${idx + 1}`,
        name: t.name,
        topic: t.topic,
        tags: t.tags.slice(),
        members: pickSeniors(t.memberIds),
        initialLog: t.initialLog.slice()
      }))
    };
  }

  const ROOM_SPECS = [
    {
      id: "phong-tra",
      name: "Phòng Trà Sáng",
      shortName: "Phòng Trà",
      description: "Uống trà chào sáng, điểm tin báo giấy và chuyện đời thường",
      hostName: "Chị Trà (Trợ lý)",
      focusHabits: ["uong-tra", "doc-bao", "day-som"],
      theme: { floorHex: 0xd9bf9b, wallHex: 0xf4ead8, floor2D: "#DFC6A2", wall2D: "#F4EAD8", tableHex: 0x875434, cushionHex: 0x2e5e4e, accentHex: "#B83B2A" },
      tables: [
        {
          name: "Bàn 1: Trà Sen Sáng",
          topic: "Chào buổi sáng & Thời tiết",
          tags: ["uong-tra", "day-som", "tho-ca"],
          memberIds: ["lan", "hoa", "hai"],
          initialLog: [
            { speaker: "Chị Trà (Trợ lý)", text: "Chào các anh chị ghé Bàn 1 Trà Sen. Sáng nay trời dịu, mời mọi người dùng chén trà nóng." },
            { speaker: "Chị Lan · 68 tuổi (Hà Nội)", text: "Sáng nay Hà Nội se lạnh, tôi pha ấm trà nhài ngồi nói chuyện cùng các anh chị cho vui." }
          ]
        },
        {
          name: "Bàn 2: Điểm Báo Giấy",
          topic: "Đọc báo sáng & Tin lương hưu",
          tags: ["doc-bao", "day-som", "uong-tra"],
          memberIds: ["minh", "tu", "lien", "quynh"],
          initialLog: [
            { speaker: "Chị Trà (Trợ lý)", text: "Tờ báo sáng nay có mục tin tốt về lớp dân vũ phường xã và mẹo ngủ ngon." },
            { speaker: "Anh Minh · 71 tuổi (Hải Phòng)", text: "Tin trên Tờ báo sáng nay ngắn gọn mà dễ hiểu, uống trà đọc báo là nhất." }
          ]
        },
        {
          name: "Bàn 3: Đồng Hương Phương Nam",
          topic: "Chuyện sông nước & Miền Tây",
          tags: ["uong-tra", "cay-canh", "co-tuong"],
          memberIds: ["phat", "binh", "bay", "sau"],
          initialLog: [
            { speaker: "Anh Phát · 66 tuổi (Cần Thơ)", text: "Sáng nay bến Ninh Kiều gió mát rượi, có anh chị nào đồng hương miền Tây vào ngồi cùng không?" }
          ]
        },
        {
          name: "Bàn 4: Dưỡng Sinh & Giấc Ngủ",
          topic: "Chăm sóc sức khỏe tuổi vàng",
          tags: ["duong-sinh", "day-som", "doc-bao"],
          memberIds: ["nga", "lien", "hoa"],
          initialLog: [
            { speaker: "Chị Nga · 61 tuổi (Lâm Đồng)", text: "Tối qua tôi thử ngâm chân nước ấm gừng lúc 8 rưỡi, ngủ một mạch tới 5 giờ sáng." }
          ]
        },
        {
          name: "Bàn 5: Chuyện Con Cháu",
          topic: "Khoe ảnh cháu & Nhắn nhủ gia đình",
          tags: ["uong-tra", "bao-cap"],
          memberIds: ["mai", "thu"],
          initialLog: [
            { speaker: "Chị Mai · 70 tuổi (Thanh Hóa)", text: "Cuối tuần này cháu nội tôi được nghỉ học về quê thăm nhà đấy các anh chị ạ." }
          ]
        },
        {
          name: "Bàn 6: Ký Ức Phích Rạng Đông",
          topic: "Ôn chuyện xưa thập niên 80",
          tags: ["bao-cap", "cuu-chien-binh"],
          memberIds: ["vinh", "hai", "sau"],
          initialLog: [
            { speaker: "Anh Vĩnh · 74 tuổi (Nghệ An)", text: "Nhớ hồi xưa xếp hàng mua gạo bằng sổ gạo từ bốn giờ sáng mà vui tình hàng xóm lắm." }
          ]
        }
      ]
    },
    {
      id: "via-he",
      name: "Quán Trà Đá Vỉa Hè",
      shortName: "Trà Đá Vỉa Hè",
      description: "Dưới tán sấu già mát rượi: cốc trà đá, thanh kẹo lạc, hạt hướng dương và chuyện phố phường dân dã",
      hostName: "Cô Hàng Nước (Trợ lý)",
      focusHabits: ["uong-tra", "doc-bao", "bao-cap"],
      theme: { floorHex: 0xc96f4a, wallHex: 0xf2d07e, floor2D: "#C97550", wall2D: "#F3D68A", tableHex: 0x7a5638, cushionHex: 0x3b5f46, accentHex: "#B84328" },
      tables: [
        {
          name: "Bàn 1: Trà Đá Gốc Sấu",
          topic: "Ngồi mát hóng gió sáng & Chuyện phố phường",
          tags: ["uong-tra", "day-som", "doc-bao"],
          memberIds: ["tu", "phat", "lan"],
          initialLog: [
            { speaker: "Cô Hàng Nước (Trợ lý)", text: "Mời các anh chị ngồi ghế gỗ dưới bóng cây, em vừa rót cốc trà đá hoa nhài mát lạnh với đĩa kẹo lạc vừng mới ra lò!" },
            { speaker: "Anh Tư · 65 tuổi (An Giang)", text: "Không gì sảng khoái bằng đi bộ sáng về ghé vỉa hè làm ngụm trà đá mát, cắn hạt hướng dương tán chuyện các bác nhỉ." }
          ]
        },
        {
          name: "Bàn 2: Kẹo Lạc & Chè Xanh",
          topic: "Chè Thái đặc pha đá & Quà vặt quê nhà",
          tags: ["uong-tra", "bao-cap", "tho-ca"],
          memberIds: ["tham", "hoa", "dung"],
          initialLog: [
            { speaker: "Chị Thắm · 64 tuổi (Bắc Ninh)", text: "Thanh kẹo lạc giòn tan đi với bát nước chè xanh đá đúng vị quán cóc đầu làng Kinh Bắc quê tôi." }
          ]
        },
        {
          name: "Bàn 3: Bình Cờ Đầu Ngõ",
          topic: "Vừa uống trà đá vừa bàn nước cờ hay",
          tags: ["co-tuong", "uong-tra", "day-som"],
          memberIds: ["minh", "thanh", "hung-ccb"],
          initialLog: [
            { speaker: "Anh Thành · 69 tuổi (Ninh Bình)", text: "Ngồi vỉa hè thoáng gió thế này bày bàn cờ tướng ra thẩm vài nước Pháo đầu thì quên cả giờ trưa." }
          ]
        },
        {
          name: "Bàn 4: Chuyện Chợ Sáng Xóm Giềng",
          topic: "Món ngon cơm nhà & Mẹo chọn rau quả tươi",
          tags: ["duong-sinh", "uong-tra", "cay-canh"],
          memberIds: ["binh", "lien", "mai"],
          initialLog: [
            { speaker: "Chị Bình · 60 tuổi (Cần Thơ)", text: "Sáng nay chợ đầu ngõ có mớ bông điên điển tươi rói, trưa nay nhà tôi nấu nồi canh chua cá linh." }
          ]
        },
        {
          name: "Bàn 5: Góc Phích Nước Rạng Đông",
          topic: "Kỷ niệm phố cũ, tàu điện leng keng & tem phiếu",
          tags: ["bao-cap", "cuu-chien-binh", "doc-bao"],
          memberIds: ["vinh", "quynh", "hai"],
          initialLog: [
            { speaker: "Anh Quỳnh · 70 tuổi (Phú Thọ)", text: "Nhìn cái phích vỏ đỏ đặt cạnh tủ kính nhớ những năm tám mươi cả khu tập thể ngồi hóng mát đầu hè." }
          ]
        },
        {
          name: "Bàn 6: Hóng Mát Ba Miền",
          topic: "Giao lưu giọng quê Bắc – Trung – Nam thân tình",
          tags: ["uong-tra", "cay-canh", "tho-ca"],
          memberIds: ["bay", "nga", "sau"],
          initialLog: [
            { speaker: "Anh Bảy · 66 tuổi (Đồng Tháp)", text: "Quán vỉa hè bình dị vậy mà vui, Bắc Trung Nam ghé ngang đều như người một nhà cả." }
          ]
        }
      ]
    },
    {
      id: "phong-tho",
      name: "Phòng Thơ Lục Bát",
      shortName: "Phòng Thơ",
      description: "Xướng họa thơ lục bát, Đường luật, ca dao và nhạc xưa",
      hostName: "Anh Thơ (Trợ lý)",
      focusHabits: ["tho-ca", "uong-tra"],
      theme: { floorHex: 0xe3d2ba, wallHex: 0xf9f1e2, floor2D: "#E6D5BD", wall2D: "#FAF2E4", tableHex: 0x6f432b, cushionHex: 0x7c3b2f, accentHex: "#9C2E1F" },
      tables: [
        {
          name: "Bàn 1: Lục Bát Quê Hương",
          topic: "Nối vần lục bát tình quê",
          tags: ["tho-ca", "uong-tra"],
          memberIds: ["dung", "thu", "lan"],
          initialLog: [
            { speaker: "Anh Dũng · 67 tuổi (Bắc Ninh)", text: "Chiều thu ngồi uống chén trà, nhắc chuyện con cháu nhớ nhà phương xa." }
          ]
        },
        {
          name: "Bàn 2: Ca Dao Dân Ca",
          topic: "Đố ca dao & Làn điệu cổ truyền",
          tags: ["tho-ca", "bao-cap"],
          memberIds: ["mai", "hoa", "bay"],
          initialLog: [
            { speaker: "Chị Mai · 70 tuổi (Thanh Hóa)", text: "Ai về Xứ Thanh quê tôi, nghe câu hò sông Mã êm đềm lắm các anh chị ạ." }
          ]
        },
        {
          name: "Bàn 3: Thơ Đường Xướng Họa",
          topic: "Thất ngôn bát cú & Tứ tuyệt",
          tags: ["tho-ca", "day-som"],
          memberIds: ["hai", "lan"],
          initialLog: [
            { speaker: "Anh Hải · 68 tuổi (TP. Huế)", text: "Sáng nay đọc lại bài Thu Điếu của cụ Nguyễn Khuyến mà thấy lòng bình yên hẳn." }
          ]
        },
        {
          name: "Bàn 4: Nhạc Xưa & Đài Radio",
          topic: "Kỷ niệm nhạc trữ tình trước 1985",
          tags: ["tho-ca", "uong-tra", "bao-cap"],
          memberIds: ["hai", "thu", "nga"],
          initialLog: [
            { speaker: "Chị Thu · 64 tuổi (Thái Nguyên)", text: "Nghe lại bản Tiếng Sáo Thiên Thai tự nhiên nhớ thanh xuân quá." }
          ]
        },
        {
          name: "Bàn 5: Vườn Hoa & Thi Ca",
          topic: "Cảm hứng từ hoa lan và bonsai",
          tags: ["tho-ca", "cay-canh"],
          memberIds: ["nga", "bay", "thu"],
          initialLog: [
            { speaker: "Chị Nga · 61 tuổi (Lâm Đồng)", text: "Sáng tưới khóm hoa cúc trước hiên tự dưng nảy ra hai câu lục bát tặng cả bàn." }
          ]
        },
        {
          name: "Bàn 6: Thơ Cho Cháu Nhỏ",
          topic: "Làm thơ ru cháu & Lời dạy hiền",
          tags: ["tho-ca", "duong-sinh"],
          memberIds: ["hoa", "lien"],
          initialLog: [
            { speaker: "Chị Hoa · 63 tuổi (Đà Nẵng)", text: "Tôi hay tập cho mấy cháu bài đồng dao thả diều để chúng bớt dán mắt vào tivi." }
          ]
        }
      ]
    },
    {
      id: "phong-co",
      name: "Phòng Cờ Tướng",
      shortName: "Phòng Cờ",
      description: "Giải cờ thế, chơi ô ăn quan và kết bạn kỳ hữu Bắc - Trung - Nam",
      hostName: "Anh Trọng Tài (Trợ lý)",
      focusHabits: ["co-tuong", "day-som"],
      theme: { floorHex: 0xd5c09e, wallHex: 0xefe3ce, floor2D: "#D6C2A3", wall2D: "#F1E6D2", tableHex: 0x5c3621, cushionHex: 0x2e5e4e, accentHex: "#8B4228" },
      tables: [
        {
          name: "Bàn 1: Thế Cờ Giang Hồ",
          topic: "Đỏ đi tiên chiếu hết 2 nước",
          tags: ["co-tuong", "cuu-chien-binh"],
          memberIds: ["minh", "phat", "hung-ccb"],
          initialLog: [
            { speaker: "Anh Minh · 71 tuổi (Hải Phòng)", text: "Thế cờ Sát chiêu Tốt Pháo hôm nay nhìn tưởng dễ mà đi nhầm một nước là hòa ngay." }
          ]
        },
        {
          name: "Bàn 2: Ô Ăn Quan Ván Treo",
          topic: "Đi 1 nước gửi lời nhắc qua Zalo",
          tags: ["co-tuong", "uong-tra", "day-som"],
          memberIds: ["phat", "dung", "thanh"],
          initialLog: [
            { speaker: "Anh Phát · 66 tuổi (Cần Thơ)", text: "Tôi vừa rải quân Ô 1 xong, mời anh chị nào vào đánh ván treo với tôi cho vui." }
          ]
        },
        {
          name: "Bàn 3: Kỳ Hữu Sáng Sớm",
          topic: "Giao lưu cờ chậm không bấm giờ gắt",
          tags: ["co-tuong", "doc-bao"],
          memberIds: ["tu", "thanh"],
          initialLog: [
            { speaker: "Anh Tư · 65 tuổi (An Giang)", text: "Đánh cờ dưỡng sinh thì cứ nghĩ thong thả, vừa uống trà vừa bàn nước hay." }
          ]
        },
        {
          name: "Bàn 4: Bình Luận Ván Hay",
          topic: "Xem ván đấu và cổ vũ nhẹ nhàng",
          tags: ["co-tuong", "uong-tra"],
          memberIds: ["dung", "bay", "minh"],
          initialLog: [
            { speaker: "Anh Dũng · 67 tuổi (Bắc Ninh)", text: "Nước bình Pháo vào lộ 4 vừa rồi cao tay thật các anh chị ạ." }
          ]
        },
        {
          name: "Bàn 5: Cờ Tướng Nhập Môn",
          topic: "Ôn lại luật và khai cuộc căn bản",
          tags: ["co-tuong", "bao-cap"],
          memberIds: ["tu", "sau"],
          initialLog: [
            { speaker: "Anh Sáu · 72 tuổi (Vĩnh Long)", text: "Anh chị nào lâu ngày không cầm quân cờ vào đây ôn lại thế Pháo đầu với tôi." }
          ]
        },
        {
          name: "Bàn 6: Giải Giao Lưu Tỉnh",
          topic: "Ghép đội đại diện quê hương",
          tags: ["co-tuong", "cuu-chien-binh", "doc-bao"],
          memberIds: ["hung-ccb", "quynh", "phat"],
          initialLog: [
            { speaker: "Anh Cường · 73 tuổi (Quảng Trị)", text: "Quảng Trị với Cần Thơ hôm nay bắt cặp làm một trận giao hữu nhé." }
          ]
        }
      ]
    },
    {
      id: "phong-ccb",
      name: "Phòng Cựu Chiến Binh",
      shortName: "Cựu Chiến Binh",
      description: "Gặp gỡ đồng đội cũ, ôn ký ức quân ngũ và hỏi thăm sức khỏe",
      hostName: "Anh Liên Lạc (Trợ lý)",
      focusHabits: ["cuu-chien-binh", "bao-cap"],
      theme: { floorHex: 0xcbc2ab, wallHex: 0xe8e2d0, floor2D: "#CBC2AB", wall2D: "#EDE8D8", tableHex: 0x62442c, cushionHex: 0x45583a, accentHex: "#45583A" },
      tables: [
        {
          name: "Bàn 1: Ký Ức Trường Sơn",
          topic: "Chuyện hành quân & Tình đồng đội",
          tags: ["cuu-chien-binh", "bao-cap", "day-som"],
          memberIds: ["vinh", "hung-ccb", "minh"],
          initialLog: [
            { speaker: "Anh Vĩnh · 74 tuổi (Nghệ An)", text: "Sáng nay gặp lại anh em từng đi qua Trường Sơn lòng thấy ấm áp vô cùng." }
          ]
        },
        {
          name: "Bàn 2: Cờ Tướng Quân Khu",
          topic: "Vừa đánh cờ vừa kể chuyện doanh trại",
          tags: ["cuu-chien-binh", "co-tuong"],
          memberIds: ["minh", "hung-ccb", "thanh"],
          initialLog: [
            { speaker: "Anh Cường · 73 tuổi (Quảng Trị)", text: "Ngày xưa anh em lấy vỏ bao thuốc lá vẽ bàn cờ đánh dưới hầm trú ẩn." }
          ]
        },
        {
          name: "Bàn 3: Điểm Tin Thời Sự",
          topic: "Chính sách người có công & Tin tức",
          tags: ["cuu-chien-binh", "doc-bao"],
          memberIds: ["quynh", "tu"],
          initialLog: [
            { speaker: "Anh Quỳnh · 70 tuổi (Phú Thọ)", text: "Chi hội cựu chiến binh phường tôi vừa lập nhóm gửi thông báo họp mặt qua Zalo tiện lắm." }
          ]
        },
        {
          name: "Bàn 4: Chuyện Quân Y & Dưỡng Sinh",
          topic: "Giữ khớp gối và huyết áp ổn định",
          tags: ["cuu-chien-binh", "duong-sinh"],
          memberIds: ["vinh", "lien", "binh"],
          initialLog: [
            { speaker: "Chị Bình · 60 tuổi (Cần Thơ)", text: "Mùa trở gió các anh thương binh nhớ giữ ấm khớp gối và đo huyết áp đều nhé." }
          ]
        },
        {
          name: "Bàn 5: Khúc Quân Hành Xưa",
          topic: "Ôn lại bài hát thời tuổi trẻ",
          tags: ["cuu-chien-binh", "tho-ca"],
          memberIds: ["quynh", "mai", "hai"],
          initialLog: [
            { speaker: "Anh Hải · 68 tuổi (TP. Huế)", text: "Mỗi lần nghe lại bài Tiến Về Sài Gòn là cả thanh xuân như ùa về." }
          ]
        },
        {
          name: "Bàn 6: Tìm Bạn Cùng Đơn Vị",
          topic: "Kết nối đồng hương & đồng niên",
          tags: ["cuu-chien-binh", "uong-tra"],
          memberIds: ["vinh", "phat"],
          initialLog: [
            { speaker: "Anh Liên Lạc (Trợ lý)", text: "Mời các anh chị ghi rõ quê quán và năm nhập ngũ để dễ tìm bạn cùng đơn vị cũ." }
          ]
        }
      ]
    },
    {
      id: "phong-cay-canh",
      name: "Phòng Cây Cảnh & Ký Ức",
      shortName: "Cây Cảnh",
      description: "Khoe chậu bonsai, phong lan, vườn rau sạch và đồ vật bao cấp",
      hostName: "Anh Chủ Vườn (Trợ lý)",
      focusHabits: ["cay-canh", "bao-cap"],
      theme: { floorHex: 0xd4ccb8, wallHex: 0xf1ece0, floor2D: "#D6CEBA", wall2D: "#F2EDE0", tableHex: 0x73492e, cushionHex: 0x2e6a44, accentHex: "#2E6A44" },
      tables: [
        {
          name: "Bàn 1: Bonsai & Cây Thế",
          topic: "Chia sẻ kinh nghiệm uốn sanh, mai chiếu thủy",
          tags: ["cay-canh", "day-som"],
          memberIds: ["thanh", "bay", "sau"],
          initialLog: [
            { speaker: "Anh Thành · 69 tuổi (Ninh Bình)", text: "Chậu sanh mini tôi uốn từ năm ngoái nay ra lá non xanh mướt rồi các anh chị ạ." }
          ]
        },
        {
          name: "Bàn 2: Phong Lan Rừng",
          topic: "Cách tưới nước vo gạo và phòng sâu bệnh",
          tags: ["cay-canh", "uong-tra"],
          memberIds: ["nga", "sau", "thu"],
          initialLog: [
            { speaker: "Chị Nga · 61 tuổi (Lâm Đồng)", text: "Sáng nay giò phi điệp tím ngoài giàn hé nở ba bông thơm ngát cả sân." }
          ]
        },
        {
          name: "Bàn 3: Vườn Rau Sân Thượng",
          topic: "Trồng rau sạch cho con cháu",
          tags: ["cay-canh", "duong-sinh"],
          memberIds: ["binh", "bay", "hoa"],
          initialLog: [
            { speaker: "Chị Bình · 60 tuổi (Cần Thơ)", text: "Sáng ra cắt rổ cải xanh tự trồng gửi sang nhà con gái mà vui cả ngày." }
          ]
        },
        {
          name: "Bàn 4: Chăn Con Công & Tem Phiếu",
          topic: "Ôn kỷ niệm đồ dùng thời bao cấp",
          tags: ["bao-cap", "doc-bao"],
          memberIds: ["mai", "vinh", "tu"],
          initialLog: [
            { speaker: "Chị Mai · 70 tuổi (Thanh Hóa)", text: "Nhà tôi đến giờ vẫn giữ làm kỷ niệm một chiếc đèn dầu cổ thời trước." }
          ]
        },
        {
          name: "Bàn 5: Radio Vỏ Gỗ & Đĩa Nhựa",
          topic: "Nghe chuyện xưa & âm thanh làng quê",
          tags: ["bao-cap", "tho-ca", "uong-tra"],
          memberIds: ["hai", "lan"],
          initialLog: [
            { speaker: "Anh Hải · 68 tuổi (TP. Huế)", text: "Buổi sáng nghe tiếng chim hót ngoài vườn kèm chén trà đặc đúng là thú vui điền viên." }
          ]
        },
        {
          name: "Bàn 6: Sinh Vật Cảnh Bốn Phương",
          topic: "Cá cảnh, tiểu cảnh non bộ",
          tags: ["cay-canh", "co-tuong"],
          memberIds: ["thanh", "phat"],
          initialLog: [
            { speaker: "Anh Phát · 66 tuổi (Cần Thơ)", text: "Tôi mới làm thêm hòn non bộ nhỏ đặt cạnh bàn cờ ngoài hiên." }
          ]
        }
      ]
    }
  ];

  const ROOM_TEMPLATES = ROOM_SPECS.map(buildRoomFromSpec);

  // Nhân bản phòng mới từ mẫu khung phòng chuẩn
  function cloneRoomTemplate(baseRoomId, newName, newDesc, focusHabitIds) {
    const base = ROOM_TEMPLATES.find((r) => r.id === baseRoomId) || ROOM_TEMPLATES[0];
    const cleanId = "phong-" + Date.now();
    const habits = Array.isArray(focusHabitIds) && focusHabitIds.length > 0 ? focusHabitIds : base.focusHabits;
    return {
      id: cleanId,
      name: newName,
      shortName: newName.replace(/^Phòng\s+/i, "").slice(0, 16) || newName.slice(0, 16),
      description: newDesc || `Phòng sinh hoạt nhân bản từ ${base.name}`,
      hostName: base.hostName,
      focusHabits: habits.slice(),
      theme: Object.assign({}, base.theme),
      isCloned: true,
      tables: base.tables.map((t, i) => ({
        id: `${cleanId}-ban-${i + 1}`,
        shortLabel: `B${i + 1}`,
        name: t.name.replace(/^Bàn \d+:/, `Bàn ${i + 1}:`),
        topic: i === 0 ? newDesc || t.topic : t.topic,
        tags: Array.from(new Set(habits.concat(t.tags))).slice(0, 3),
        members: t.members.map((m) => Object.assign({}, m, { habits: m.habits.slice() })),
        initialLog: [
          {
            speaker: base.hostName,
            text: `Chào mừng các anh chị tới ${newName} — ${t.name}. Mời mọi người ngồi xuống dùng trà trò chuyện!`
          }
        ]
      }))
    };
  }

  const TEA_TABLES = ROOM_TEMPLATES[0].tables;

  // Từ điển sửa lỗi nghe nhầm khởi tạo (cộng dồn thêm khi người dùng duyệt câu mới ở Bước 3)
  const INITIAL_PHONETIC_DICT = [
    { wrong: "huyết áp trăm ba", right: "huyết áp 130", hits: 14, learnedBy: "Hệ thống" },
    { wrong: "tiểu đường tuýp hai", right: "tiểu đường tuýp 2", hits: 11, learnedBy: "Hệ thống" },
    { wrong: "cây bon sai", right: "cây bonsai", hits: 9, learnedBy: "Hệ thống" },
    { wrong: "ô ăn quang", right: "ô ăn quan", hits: 16, learnedBy: "Hệ thống" },
    { wrong: "sương khớp", right: "xương khớp", hits: 19, learnedBy: "Hệ thống" },
    { wrong: "trà sen tây hồ", right: "trà sen Tây Hồ", hits: 8, learnedBy: "Hệ thống" },
    { wrong: "tập dưởng sinh", right: "tập dưỡng sinh", hits: 12, learnedBy: "Hệ thống" },
    { wrong: "cháu nội cháu ngoai", right: "cháu nội cháu ngoại", hits: 7, learnedBy: "Hệ thống" }
  ];

  const FILLER_WORDS = [
    /^([ờàừmê]+[\s,.]*)+/i,
    /^(alo[\s,.]*)+/i,
    /^(nói gì nhỉ[\s,.]*)/i,
    /^(thế này nhé[\s,.]*)/i
  ];

  // Ma trận từ khóa 12 chủ đề cho 3 nút gợi ý 0-token
  const REPLY_MATRIX = [
    {
      topic: "Thời tiết",
      keywords: ["mưa", "nắng", "lạnh", "rét", "mát", "gió", "trời", "âm u", "nồm"],
      replies: [
        "Ngoài {tinh} chỗ tôi hôm nay thời tiết cũng dễ chịu lắm {ten} ạ.",
        "Trời này ngồi nhấp chén trà nóng trò chuyện là nhất rồi.",
        "{ten} nhớ mặc thêm áo ấm giữ sức khỏe nhé."
      ]
    },
    {
      topic: "Sức khỏe",
      keywords: ["huyết áp", "tiểu đường", "xương khớp", "ngủ", "thuốc", "đau", "mệt", "dưỡng sinh", "đi bộ", "130"],
      replies: [
        "Nghe {ten} giữ sức khỏe đều vậy tôi cũng mừng lây.",
        "Sáng nào tôi cũng đi bộ nhẹ mười lăm phút cho dẻo xương khớp.",
        "Có tuổi rồi mình cứ ngủ đủ giấc, uống nước ấm là khỏe {ten} ạ."
      ]
    },
    {
      topic: "Cây cảnh & Vườn tược",
      keywords: ["cây", "bonsai", "hoa", "lan", "vườn", "rau", "lá", "tưới", "chậu", "sanh"],
      replies: [
        "{ten} mát tay chăm cây quá, hôm nào kể thêm bí quyết nhé.",
        "Ở {tinh} nhà tôi cũng trồng mấy chậu hoa ngoài hiên cho vui mắt.",
        "Sáng ra tưới cây nhìn lá xanh là thấy tinh thần nhẹ nhõm hẳn."
      ]
    },
    {
      topic: "Kỷ niệm bao cấp",
      keywords: ["bao cấp", "tem phiếu", "sổ gạo", "xe đạp", "phích", "ngày xưa", "hồi xưa", "xếp hàng", "chăn con công"],
      replies: [
        "Nhắc chuyện xưa lại thấy thương tình làng nghĩa xóm hồi đó {ten} nhỉ.",
        "Thời khó khăn mà ai cũng quý nhau, chia nhau từng củ khoai bùi.",
        "Ở {tinh} quê tôi hồi ấy cũng xếp hàng từ tinh mơ giống hệt vậy."
      ]
    },
    {
      topic: "Thơ ca",
      keywords: ["thơ", "lục bát", "câu đối", "ngâm", "nhớ nhà", "trà", "vần", "ca dao"],
      replies: [
        "Câu thơ của {ten} nghe êm và tình cảm quá.",
        "Chiều đến ngồi nghe vài câu lục bát thấy lòng bình yên hẳn.",
        "Tôi xin góp thêm một tràng pháo tay tặng {ten} nhé."
      ]
    },
    {
      topic: "Trò chơi & Cờ",
      keywords: ["cờ", "ô ăn quan", "đố vui", "ván", "đánh cờ", "chiếu tướng"],
      replies: [
        "Lát nữa tôi với {ten} làm một ván ô ăn quan cho vui nhé.",
        "Đánh cờ giải trí buổi sáng giúp đầu óc minh mẫn lắm {ten} ạ.",
        "Tôi ở {tinh} cũng hay ngồi giải thế cờ mỗi chiều."
      ]
    },
    {
      topic: "Con cháu & Gia đình",
      keywords: ["cháu", "con", "gia đình", "quê", "về thăm", "gọi điện", "nhớ"],
      replies: [
        "Các cháu khỏe mạnh ngoan ngoãn là ông bà vui nhất rồi {ten} ạ.",
        "Con cháu bận đi làm xa, mình cứ vui khỏe ở nhà cho chúng yên tâm.",
        "Sáng nay tôi mới khoe với các con là có bạn mới ở bàn trà đây."
      ]
    },
    {
      topic: "Kinh tế & Giá cả",
      keywords: ["giá dầu", "dầu thô", "xăng", "giá vàng", "vàng", "lương hưu", "giá cả", "thị trường", "xuất khẩu", "nông sản"],
      replies: [
        "Giá xăng dầu hạ nhiệt thì cước vận chuyển rau quả hàng hóa cũng đỡ tăng {ten} nhỉ.",
        "Sáng nào uống trà tôi cũng điểm qua mục giá dầu, giá vàng trên báo sáng.",
        "Ở {tinh} chỗ tôi bà con tiểu thương cũng mừng khi giá xăng dầu ổn định."
      ]
    },
    {
      topic: "Thế giới",
      keywords: ["thế giới", "quốc tế", "châu á", "châu âu", "trung đông", "hội nghị", "ngoại giao", "hòa bình", "thương mại"],
      replies: [
        "Đọc tin thế giới để thấy trong nước mình yên bình, ổn định là quý nhất {ten} ạ.",
        "Tình hình quốc tế êm ấm thì giao thương xuất khẩu hàng Việt mình càng thuận lợi.",
        "Tôi cũng hay theo dõi mục Thế giới mỗi sáng rồi vào bàn đàm đạo cùng {ten}."
      ]
    },
    {
      topic: "Tờ báo sáng",
      keywords: ["báo", "tin", "dự báo", "mẹo", "đọc báo"],
      replies: [
        "Tin trên Tờ báo sáng nay ngắn gọn mà dễ hiểu quá {ten} nhỉ.",
        "Mỗi sáng vừa uống trà vừa nghe đọc tin tốt lành thấy phấn khởi.",
        "Cảm ơn {ten} đã mang tin hay ra bàn trà chia sẻ cùng mọi người."
      ]
    },
    {
      topic: "Mặc định",
      keywords: [],
      replies: [
        "Vâng, nghe {ten} nói chuyện mà vui cả buổi sáng.",
        "Mời {ten} dùng thêm chén trà sen cho ấm bụng nhé.",
        "Tôi ở {tinh}, rất vui được ngồi chung bàn cùng {ten}."
      ]
    }
  ];

  // Mẫu câu giả lập giọng nói để kiểm thử nhanh không cần micro
  const VOICE_SAMPLES = [
    {
      label: "Mẫu 1: Sức khỏe (có từ điển sẵn)",
      raw: "ờ... sáng nay tôi đo huyết áp trăm ba và đi tập dưởng sinh ngoài sân"
    },
    {
      label: "Mẫu 2: Cây cảnh & Cờ (có từ chưa học)",
      raw: "à chiều qua tôi mới tỉa cây bon sai rồi chơi ô ăn quang với ông hàng xóm"
    },
    {
      label: "Mẫu 3: Câu mới để test AI sửa & Từ điển tự học",
      raw: "ừm dạo này tôi hay đau lưng buổi tối nên đun lá ngãi cứu chườm ấm"
    },
    {
      label: "Mẫu 4: Kiểm thử chặn số tài khoản / SĐT",
      raw: "gọi cho tôi số 0912345678 hoặc chuyển khoản 1900123456 nhé"
    }
  ];

  // Chuyên mục & Từ khóa gợi ý nhanh trên Tờ Báo Sáng
  const NEWS_CATEGORIES = [
    { id: "all", label: "Tất cả" },
    { id: "kinh-te", label: "Kinh tế & Giá cả" },
    { id: "the-gioi", label: "Thế giới" },
    { id: "thoi-tiet", label: "Thời tiết" },
    { id: "suc-khoe", label: "Sức khỏe" },
    { id: "doi-song", label: "Đời sống" },
    { id: "van-hoa", label: "Thể thao & Ký ức" }
  ];

  const NEWS_HOT_KEYWORDS = [
    "Giá dầu",
    "Thế giới",
    "Giá vàng",
    "Lương hưu",
    "Thời tiết",
    "Huyết áp",
    "Đội tuyển VN",
    "Bao cấp"
  ];

  // "Tờ Báo Sáng Quán Trà" theo chuyên mục — bấm vào tin là ghép thẳng vào Bàn Đàm Đạo của những người đang đọc tin đó
  const MORNING_ARTICLES = [
    {
      id: "art-gia-dau-1",
      category: "kinh-te",
      tag: "Kinh tế · Giá dầu",
      title: "Giá dầu thế giới hạ nhiệt tuần thứ hai liên tiếp, cước vận tải hàng hóa giảm áp lực",
      source: "Theo Báo Tin Tức & TTXVN · 06:15 sáng nay",
      body: "Giá dầu thô Brent sáng nay lùi về quanh mốc 73 USD/thùng nhờ nguồn cung dồi dào và tồn kho nhiên liệu tăng. Các doanh nghiệp vận tải đường bộ và ghe tàu chở nông sản kỳ vọng đợt điều hành giá xăng dầu tới trong nước sẽ tiếp tục giảm nhẹ, giúp giữ ổn định giá thực phẩm ngoài chợ.",
      detailPoints: [
        "Dầu thô Brent giảm khoảng 1,8% so với đầu tuần trước, giao dịch quanh ngưỡng 73 USD/thùng.",
        "Chi phí xăng dầu chiếm 30–35% giá thành vận tải hàng rau củ, thủy sản từ miền Tây và Tây Nguyên đi các tỉnh.",
        "Dự báo kỳ điều hành trong nước tuần này có dư địa giảm nhẹ, hỗ trợ bình ổn giá tiêu dùng cuối năm."
      ],
      readerIds: ["minh", "tu", "phat", "quynh"],
      discussionLog: [
        { speaker: "Anh Minh · 71 tuổi (Hải Phòng)", text: "Giá dầu thô hạ hai tuần liền thế này thì cước xe chở hàng với tàu biển đỡ căng hẳn các anh chị nhỉ." },
        { speaker: "Anh Phát · 66 tuổi (Cần Thơ)", text: "Dưới Cần Thơ ghe chở lúa với trái cây lên thành phố mong tin xăng dầu giảm từng ngày đấy Anh Minh ạ." }
      ],
      quickReplies: [
        "Giá xăng dầu êm thì mớ rau cân cá ngoài chợ cũng đỡ tăng giá {ten} nhỉ.",
        "Sáng nào uống trà tôi cũng mở xem tin giá dầu với kinh tế đầu tiên.",
        "Ở {tinh} chỗ tôi bà con làm vườn, chạy xe tải nhỏ mừng lắm khi dầu hạ."
      ],
      topicKeyword: "Kinh tế & Giá cả"
    },
    {
      id: "art-the-gioi-1",
      category: "the-gioi",
      tag: "Thế giới · Tiêu điểm",
      title: "Thế giới sáng nay: Các nước châu Á đẩy mạnh kết nối đường sắt và thương mại nông sản xanh",
      source: "Theo Báo Nhân Dân Quốc tế · 06:30 sáng nay",
      body: "Hội nghị hợp tác kinh tế khu vực châu Á vừa thống nhất rút ngắn thủ tục thông quan cho hàng nông sản tươi và mở rộng tuyến vận tải đường sắt liên vận. Việt Nam được đánh giá là điểm sáng cung ứng gạo chất lượng cao, cà phê và trái cây nhiệt đới sang thị trường Đông Bắc Á và châu Âu.",
      detailPoints: [
        "Thời gian thông quan hàng trái cây và thủy sản qua cửa khẩu đường sắt giảm gần một nửa.",
        "Gạo thơm và cà phê Việt Nam tiếp tục giữ giá tốt tại thị trường Nhật Bản, châu Âu.",
        "Xu hướng chuyển đổi năng lượng sạch và giao thông công cộng tăng mạnh tại các đô thị lớn trên thế giới."
      ],
      readerIds: ["vinh", "dung", "hai"],
      discussionLog: [
        { speaker: "Anh Vĩnh · 74 tuổi (Nghệ An)", text: "Đọc tin thế giới thấy hàng nông sản Việt mình đi khắp châu Âu, Nhật Bản mà tự hào quá các anh chị ạ." },
        { speaker: "Anh Hải · 68 tuổi (TP. Huế)", text: "Thế giới nhiều biến động mà trong nước mình giữ được hòa bình, xuất khẩu đều đặn là quý nhất Anh Vĩnh nhỉ." }
      ],
      quickReplies: [
        "Đúng là đất nước mình yên bình, làm ăn giao thương ngày càng khởi sắc {ten} ạ.",
        "Nghe tin hạt gạo, hạt cà phê quê mình được thế giới chuộng mà mừng cho bà con.",
        "Tôi thích ngồi bàn trà đàm đạo thời sự thế giới nhẹ nhàng như thế này."
      ],
      topicKeyword: "Thế giới"
    },
    {
      id: "art-the-gioi-2",
      category: "the-gioi",
      tag: "Thế giới · Năng lượng",
      title: "OPEC+ và các nước tiêu thụ dầu lớn bàn kịch bản giữ ổn định nguồn cung năng lượng mùa đông",
      source: "Theo VnExpress Quốc tế · 06:45 sáng nay",
      body: "Trước mùa đông tại Bắc bán cầu, các quốc gia xuất khẩu dầu mỏ và các nền kinh tế lớn đang đàm phán duy trì sản lượng hợp lý nhằm tránh biến động sốc về giá dầu và khí đốt, giúp kinh tế toàn cầu phục hồi vững hơn.",
      detailPoints: [
        "Dự trữ khí đốt và dầu sưởi tại châu Âu, Đông Bắc Á hiện đạt trên 90% công suất trước mùa lạnh.",
        "Giá dầu ổn định quanh vùng 70–75 USD/thùng được xem là mức cân bằng cho cả nước xuất khẩu lẫn nước nhập khẩu.",
        "Năng lượng mặt trời và điện gió tiếp tục san sẻ áp lực tiêu thụ nhiên liệu hóa thạch."
      ],
      readerIds: ["minh", "hung-ccb", "tu"],
      discussionLog: [
        { speaker: "Anh Cường · 73 tuổi (Quảng Trị)", text: "Mùa đông bên xứ lạnh họ lo dự trữ dầu sưởi với khí đốt kỹ lắm, ảnh hưởng cả giá dầu toàn cầu." },
        { speaker: "Anh Tư · 65 tuổi (An Giang)", text: "Các nước ngồi lại giữ giá dầu ổn định thì kinh tế thế giới đỡ chao đảo Anh Cường nhỉ." }
      ],
      quickReplies: [
        "Thời buổi hội nhập, chuyện giá dầu bên ngoài tác động tới tận bữa cơm nhà mình {ten} ạ.",
        "Cứ đối thoại ôn hòa để giữ ổn định năng lượng là tốt cho tất cả các nước.",
        "Ở {tinh} anh em hưu trí tụi tôi sáng nào cũng bàn chuyện thế giới với giá dầu."
      ],
      topicKeyword: "Thế giới"
    },
    {
      id: "art-gia-vang-1",
      category: "kinh-te",
      tag: "Kinh tế · Giá vàng & Lãi suất",
      title: "Giá vàng nhẫn đi ngang theo đà thế giới, lãi suất tiết kiệm kỳ hạn 6–12 tháng nhích nhẹ",
      source: "Theo Báo Đầu Tư · 07:00 sáng nay",
      body: "Sáng nay giá vàng nhẫn tròn trơn trong nước biến động hẹp sau nhịp điều chỉnh của giá vàng quốc tế. Trong khi đó, một số ngân hàng thương mại điều chỉnh tăng 0,2%/năm lãi suất tiền gửi tiết kiệm kỳ hạn 6 đến 12 tháng, phù hợp với người nghỉ hưu gửi tích lũy an toàn.",
      detailPoints: [
        "Chênh lệch mua - bán vàng nhẫn thu hẹp hơn so với tuần trước; chuyên gia khuyên không nên mua đuổi theo tin đồn.",
        "Lãi suất tiết kiệm kỳ hạn 12 tháng tại nhiều ngân hàng dao động quanh mức 5,2% – 5,8%/năm.",
        "Người cao tuổi gửi tiết kiệm nên chọn ngân hàng uy tín và tuyệt đối cảnh giác trước lời mời đầu tư lãi cao trên mạng."
      ],
      readerIds: ["quynh", "lan", "mai"],
      discussionLog: [
        { speaker: "Anh Quỳnh · 70 tuổi (Phú Thọ)", text: "Tuổi nghỉ hưu tụi mình có đồng tích lũy cứ gửi tiết kiệm ngân hàng nhà nước là yên tâm ngủ ngon nhất." },
        { speaker: "Chị Lan · 68 tuổi (Hà Nội)", text: "Chuẩn đấy Anh Quỳnh ạ, mua vàng lúc lên xuống thất thường đau đầu lắm, lại sợ hàng trôi nổi." }
      ],
      quickReplies: [
        "Tôi cũng đồng ý với {ten}, tuổi mình cứ an toàn chắc chắn là trên hết.",
        "Ai gọi điện rủ đầu tư lãi suất cao trên mạng là tôi cúp máy ngay {ten} ạ.",
        "Sáng đọc điểm tin giá vàng, lãi suất ngắn gọn thế này rất tiện theo dõi."
      ],
      topicKeyword: "Kinh tế & Giá cả"
    },
    {
      id: "art-luong-huu-1",
      category: "doi-song",
      tag: "Đời sống · Lương hưu & BHYT",
      title: "Chi trả lương hưu đầu tháng thuận tiện và mở rộng cấp thuốc BHYT 2 tháng cho bệnh mạn tính ổn định",
      source: "Theo Báo Lao Động & BHXH Việt Nam · 06:50 sáng nay",
      body: "Nhiều bệnh viện tuyến quận, tỉnh đang áp dụng kê đơn thuốc ngoại trú tối đa 60 ngày cho người bệnh huyết áp, tiểu đường đã điều trị ổn định, giúp người lớn tuổi đỡ vất vả đi lại xếp hàng mỗi tháng. Việc nhận lương hưu vẫn duy trì song song cả qua tài khoản lẫn điểm chi trả tiền mặt tại phường xã.",
      detailPoints: [
        "Bệnh nhân mạn tính có chỉ số huyết áp, đường huyết ổn định được bác sĩ xem xét hẹn tái khám 2 tháng/lần.",
        "Người cao tuổi không rành rút thẻ ATM vẫn được nhận lương hưu tiền mặt tại bưu điện hoặc tận nhà nếu đi lại khó khăn.",
        "Thẻ BHYT đã tích hợp trên căn cước gắn chip, đi khám chỉ cần mang 1 thẻ duy nhất."
      ],
      readerIds: ["quynh", "lien", "binh"],
      discussionLog: [
        { speaker: "Chị Liên · 62 tuổi (TP. HCM)", text: "Cấp thuốc huyết áp ổn định 2 tháng một lần đỡ cho người lớn tuổi đi xếp hàng sáng sớm biết bao nhiêu." },
        { speaker: "Anh Quỳnh · 70 tuổi (Phú Thọ)", text: "Đi khám giờ chỉ mang mỗi thẻ căn cước gắn chip là xong thủ tục BHYT, gọn hơn xưa nhiều Chị Liên nhỉ." }
      ],
      quickReplies: [
        "Chính sách cấp thuốc 2 tháng này thiết thực quá {ten} ạ, đỡ cảnh chờ đợi.",
        "Ở {tinh} bệnh viện chỗ tôi cũng làm thủ tục bằng căn cước nhanh lắm.",
        "Mừng nhất là vẫn giữ cả điểm phát lương hưu tiền mặt cho ai ngại dùng thẻ."
      ],
      topicKeyword: "Tờ báo sáng"
    },
    {
      id: "art-1",
      category: "thoi-tiet",
      tag: "Thời tiết & Nông lịch",
      title: "Hôm nay 27 tháng 10 âm lịch: Bắc Bộ se lạnh sớm, Nam Bộ nắng dịu thuận lợi tập dưỡng sinh",
      source: "Theo Trung tâm Dự báo Khí tượng Thủy văn · 06:00 sáng nay",
      body: "Miền Bắc sáng sớm se lạnh 19–22 độ, trưa hửng nắng nhẹ thuận lợi đi bộ dưỡng sinh. Miền Trung và Tây Nguyên tạnh ráo. Nam Bộ sáng mát, chiều có thể có mưa rào thoáng qua.",
      detailPoints: [
        "Bắc Bộ sáng sớm có sương nhẹ, nên quàng khăn ấm cổ khi ra sân tập trước 6 giờ.",
        "Trung Bộ nắng ráo 25–29 độ, rất đẹp để phơi chăn màn và chăm sóc cây cảnh.",
        "Nam Bộ và miền Tây gió mát buổi sáng, chiều tối đề phòng mưa dông cục bộ."
      ],
      readerIds: ["lan", "hoa", "sau"],
      discussionLog: [
        { speaker: "Chị Lan · 68 tuổi (Hà Nội)", text: "Ngoài Hà Nội sáng nay ra sân tập dưỡng sinh gió heo may mát lạnh thích lắm các anh chị ạ." },
        { speaker: "Anh Sáu · 72 tuổi (Vĩnh Long)", text: "Trong Vĩnh Long sáng nay nắng dịu, tôi mới tưới mấy giò lan xong là vào bàn trà ngay." }
      ],
      quickReplies: [
        "Ngoài {tinh} chỗ tôi sáng nay thời tiết cũng dễ chịu lắm {ten} ạ.",
        "Trời chuyển mùa se lạnh {ten} đi tập sớm nhớ quàng khăn giữ ấm cổ nhé.",
        "Thời tiết này pha ấm trà nóng ngồi đọc báo đàm đạo là hợp nhất."
      ],
      topicKeyword: "Thời tiết"
    },
    {
      id: "art-4",
      category: "suc-khoe",
      tag: "Sức khỏe · Huyết áp & Giấc ngủ",
      title: "Ba thói quen nhỏ trước giờ ngủ giúp người trên 60 tuổi ổn định huyết áp và ngủ sâu giấc",
      source: "Theo Báo Sức khỏe & Đời sống · 06:20 sáng nay",
      body: "Ngâm chân nước ấm pha gừng 10 phút lúc 20h30, tắt màn hình điện thoại trước khi lên giường 30 phút và uống một ngụm nước ấm nhỏ buổi sáng trước khi rời giường giúp tuần hoàn máu êm dịu và giảm trằn trọc ban đêm.",
      detailPoints: [
        "Nước ngâm chân chỉ nên ấm vừa phải (khoảng 38–40 độ), đặc biệt lưu ý thử nhiệt độ kỹ nếu có bệnh tiểu đường.",
        "Khi thức dậy buổi sáng nên nằm vận động cổ chân tay 1–2 phút rồi mới ngồi dậy từ từ để tránh choáng huyết áp.",
        "Tránh uống trà đặc sau 4 giờ chiều để đêm dễ đi vào giấc ngủ."
      ],
      readerIds: ["nga", "lien", "binh"],
      discussionLog: [
        { speaker: "Chị Nga · 61 tuổi (Lâm Đồng)", text: "Mẹo nằm xoay cổ chân 1 phút trên giường trước khi ngồi dậy buổi sáng rất hay, hết hẳn bị choáng." },
        { speaker: "Chị Bình · 60 tuổi (Cần Thơ)", text: "Từ ngày tôi cữ trà đặc buổi chiều chuyển sang uống nước ấm là tối ngủ ngon tới sáng luôn Chị Nga ạ." }
      ],
      quickReplies: [
        "Thói quen ngồi dậy từ từ buổi sáng quan trọng lắm, cảm ơn {ten} đã nhắc.",
        "Tối nào tôi cũng ngâm chân nước ấm mười phút thấy êm lưng dễ ngủ hẳn.",
        "Ở tuổi mình cứ ăn ngủ điều độ, tập nhẹ đều đặn là quý hơn thuốc bổ {ten} nhỉ."
      ],
      topicKeyword: "Sức khỏe"
    },
    {
      id: "art-2",
      category: "doi-song",
      tag: "Đời sống · Cộng đồng",
      title: "Nhiều xã phường mở lớp dân vũ và câu lạc bộ cờ tướng miễn phí sáng sớm",
      source: "Theo Báo Nhân Dân (Mục Đời sống) · 07:10 sáng nay",
      body: "Phong trào rèn luyện thân thể cho người lớn tuổi tiếp tục lan tỏa. Các nhà văn hóa phường bố trí thêm ghế nghỉ, nước trà miễn phí và hướng dẫn viên dưỡng sinh vào khung giờ 6h00–7h30 mỗi ngày.",
      detailPoints: [
        "Hơn 400 câu lạc bộ liên thế hệ tự giúp nhau mới được thành lập tại các khu dân cư trong quý này.",
        "Kết hợp tập dưỡng sinh, đánh cờ tướng và phổ biến kiến thức phòng tránh lừa đảo qua điện thoại.",
        "Tạo không gian gặp gỡ trực tiếp kết hợp giao lưu trực tuyến khi trời mưa lạnh."
      ],
      readerIds: ["hoa", "thanh", "dung"],
      discussionLog: [
        { speaker: "Chị Hoa · 63 tuổi (Đà Nẵng)", text: "Nhà văn hóa phường tôi sáng nào cũng rộn ràng tiếng nhạc dân vũ, hôm nào mưa thì lên Quán trà online gặp nhau." }
      ],
      quickReplies: [
        "Có hội có thuyền tập chung buổi sáng tinh thần trẻ ra mấy tuổi {ten} ạ.",
        "Ở {tinh} khu phố tôi cũng có bàn cờ tướng dưới gốc cây vui lắm.",
        "Hôm nào nắng thì ra sân phường, hôm nào mưa rét thì ngồi bàn trà này gặp {ten}."
      ],
      topicKeyword: "Sức khỏe"
    },
    {
      id: "art-the-thao-1",
      category: "van-hoa",
      tag: "Thể thao · Đội tuyển VN",
      title: "Đội tuyển bóng đá Việt Nam hội quân rèn thể lực, chuẩn bị loạt trận giao hữu quốc tế trên sân nhà",
      source: "Theo Báo Thanh Niên Thể thao · 07:15 sáng nay",
      body: "Đội tuyển Việt Nam đã bắt đầu đợt tập trung mới với sự kết hợp giữa các trụ cột giàu kinh nghiệm và lứa cầu thủ trẻ giàu khát vọng. Người hâm mộ cả nước chờ đón lối chơi phối hợp nhỏ đẹp mắt trong trận giao hữu cuối tuần này.",
      detailPoints: [
        "Trận đấu diễn ra lúc 19h30 thứ Bảy tuần này, truyền hình trực tiếp miễn phí trên các kênh sóng quốc gia.",
        "Nhiều cầu thủ trẻ U23 được trao cơ hội thử sức bên cạnh các đàn anh kỳ cựu.",
        "Giá vé vào sân hợp lý để các gia đình nhiều thế hệ cùng đi cổ vũ."
      ],
      readerIds: ["dung", "phat", "minh"],
      discussionLog: [
        { speaker: "Anh Dũng · 67 tuổi (Bắc Ninh)", text: "Cuối tuần có đội tuyển Việt Nam đá là tôi lại pha ấm trà đặc xem cùng thằng cháu nội." },
        { speaker: "Anh Phát · 66 tuổi (Cần Thơ)", text: "Xem các cháu cầu thủ trẻ bây giờ chạy khỏe và phối hợp tự tin lắm Anh Dũng ạ." }
      ],
      quickReplies: [
        "Hôm tới đội tuyển đá, anh em mình vừa xem vừa lên bàn trà bình luận nhé {ten}.",
        "Ở nhà tôi cứ có bóng đá Việt Nam là cả ông lẫn cháu hò reo rôm rả.",
        "Mong lứa cầu thủ trẻ giữ được đôi chân khỏe và tinh thần thi đấu hết mình."
      ],
      topicKeyword: "Trò chơi & Cờ"
    },
    {
      id: "art-3",
      category: "van-hoa",
      tag: "Ký ức xưa · Văn hóa",
      title: "Nhớ chiếc phích nước Rạng Đông và ấm trà tích ủ rơm thập niên 80",
      source: "Chuyên mục Ký ức Tuổi Bạc · 06:00 sáng nay",
      body: "Ngày ấy mỗi nhà có một chiếc phích vỏ sắt sơn hoa mẫu đơn hoặc giỏ tích đan tre giữ ấm nước chè xanh suốt cả ngày. Khách đến chơi nhà chỉ cần rót một bát nước chè tươi nóng hổi là râm ran chuyện mùa màng, con cái suốt cả buổi.",
      detailPoints: [
        "Chiếc phích Rạng Đông vỏ thiếc in hoa hồng, hoa mẫu đơn từng là món quà mừng cưới quý giá một thời.",
        "Giỏ tích lót bông gòn hoặc rơm nếp giữ cho ấm chè xanh nóng từ sáng sớm tới chiều tối.",
        "Nếp văn hóa 'miếng trầu, chén trà mở đầu câu chuyện' vẫn giữ vẹn nguyên giá trị gắn kết tình người."
      ],
      readerIds: ["mai", "vinh", "bay"],
      discussionLog: [
        { speaker: "Chị Mai · 70 tuổi (Thanh Hóa)", text: "Đọc bài này tự nhiên nhớ cái giỏ tích đan mây lót vải hoa ngày xưa mẹ tôi hay ủ ấm nước vối quá." },
        { speaker: "Anh Bảy · 66 tuổi (Đồng Tháp)", text: "Hồi đó vật chất thiếu thốn mà hàng xóm tối lửa tắt đèn chạy sang rót chén trà ấm tình biết bao Chị Mai nhỉ." }
      ],
      quickReplies: [
        "Nhắc chuyện chiếc phích hoa mẫu đơn làm tôi bồi hồi nhớ thời trẻ quá {ten} ạ.",
        "Ở {tinh} quê tôi ngày xưa nhà nào có chiếc giỏ tích ủ chè xanh là quý lắm.",
        "Thời bao cấp tuy vất vả mà tình làng nghĩa xóm đầm ấm không quên được."
      ],
      topicKeyword: "Kỷ niệm bao cấp"
    }
  ];

  const RSS_DRAFTS = [
    {
      id: "rss-1",
      tag: "An toàn mạng (RSS nháp)",
      title: "Cảnh báo chiêu trò giả danh bác sĩ gọi điện tặng thực phẩm chức năng miễn phí",
      source: "RSS Báo Tuổi Trẻ — Đời sống",
      body: "Cơ quan chức năng lưu ý người cao tuổi không cung cấp số căn cước, số tài khoản hoặc trả tiền vận chuyển cho các gói quà không rõ nguồn gốc gửi về tận nhà.",
      topicKeyword: "Tờ báo sáng"
    },
    {
      id: "rss-2",
      tag: "Nhà nông & Cây cảnh (RSS nháp)",
      title: "Mẹo dùng nước vo gạo ủ 2 ngày tưới hoa lan và cây bonsai cuối thu",
      source: "RSS Báo Nông Nghiệp Việt Nam",
      body: "Pha loãng nước vo gạo đã lên men nhẹ theo tỷ lệ 1 phần nước gạo với 3 phần nước sạch giúp bổ sung vitamin B1 cho rễ lan phát triển chắc khỏe.",
      topicKeyword: "Cây cảnh"
    }
  ];

  // 5 Bộ Đố vui minh mẫn xoay vòng (25 câu chuẩn xác dành cho tuổi 55+)
  const QUIZ_PACKS = [
    { idx: 0, id: "pack-1", title: "Bộ 1 · Ký Ức & Quê Hương" },
    { idx: 1, id: "pack-2", title: "Bộ 2 · Ca Dao & Tục Ngữ" },
    { idx: 2, id: "pack-3", title: "Bộ 3 · Lịch Sử & Di Sản" },
    { idx: 3, id: "pack-4", title: "Bộ 4 · Sống Khỏe & An Toàn" },
    { idx: 4, id: "pack-5", title: "Bộ 5 · Ẩm Thực & Nếp Xưa" }
  ];

  const QUIZ_QUESTIONS = [
    // Bộ 1 (0..4)
    {
      id: "q1",
      packIdx: 0,
      tag: "Ký ức bao cấp",
      question: "Thời bao cấp, người dân đi mua gạo và thịt tại cửa hàng mậu dịch thường phải mang theo giấy tờ gì?",
      options: ["Thẻ căn cước gắn chip", "Tem phiếu và sổ gạo", "Giấy phép lái xe", "Sổ tiết kiệm"],
      correctIndex: 1,
      explain: "Tem phiếu và sổ gạo là giấy tờ quen thuộc gắn với đời sống sinh hoạt thời bao cấp trước năm 1986."
    },
    {
      id: "q2",
      packIdx: 0,
      tag: "Ca dao tục ngữ",
      question: "Điền từ còn thiếu vào câu ca dao: 'Uống nước nhớ..., ăn quả nhớ kẻ trồng cây'?",
      options: ["Suối", "Nguồn", "Sông", "Biển"],
      correctIndex: 1,
      explain: "Câu đầy đủ là 'Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây' nhắc nhở lòng biết ơn."
    },
    {
      id: "q3",
      packIdx: 0,
      tag: "Chống lừa đảo tuổi bạc",
      question: "Nếu có người lạ trên mạng gọi điện nói bác trúng thưởng xe máy và bảo chuyển 500 nghìn tiền làm hồ sơ trước, bác làm gì?",
      options: [
        "Chuyển ngay kẻo mất phần",
        "Đọc mã OTP ngân hàng cho họ",
        "Tắt máy ngay, không chuyển tiền và hỏi lại con cháu",
        "Gửi ảnh căn cước công dân"
      ],
      correctIndex: 2,
      explain: "Mọi giải thưởng yêu cầu đóng tiền trước hoặc hỏi mã OTP đều là lừa đảo. Bác hãy tắt máy và báo con cháu."
    },
    {
      id: "q4",
      packIdx: 0,
      tag: "Cây cảnh & Nhà vườn",
      question: "Khi tưới cây cảnh hoặc vườn rau trên sân, thời điểm nào tốt nhất cho cây hấp thụ nước?",
      options: [
        "Đúng 12 giờ trưa nắng gắt",
        "Sáng sớm hoặc chiều mát",
        "Nửa đêm lúc 1 giờ sáng",
        "Ngay lúc đang mưa to"
      ],
      correctIndex: 1,
      explain: "Tưới vào sáng sớm hoặc chiều mát giúp rễ cây hút nước đều và tránh bị sốc nhiệt."
    },
    {
      id: "q5",
      packIdx: 0,
      tag: "Quê hương Việt Nam",
      question: "Làn điệu dân ca nào được UNESCO công nhận là Di sản văn hóa phi vật thể gắn liền với vùng Kinh Bắc (Bắc Ninh)?",
      options: ["Dân ca Quan họ", "Đờn ca tài tử", "Hò giã gạo", "Hát Xoan"],
      correctIndex: 0,
      explain: "Dân ca Quan họ Bắc Ninh nổi tiếng với văn hóa giao duyên 'liền anh, liền chị' và miếng trầu cánh phượng."
    },
    // Bộ 2 (5..9)
    {
      id: "q6",
      packIdx: 1,
      tag: "Ca dao Việt Nam",
      question: "Hoàn thành câu tục ngữ nói về tình nghĩa anh chị em: 'Chị ngã ... nâng'?",
      options: ["Bạn", "Em", "Anh", "Cháu"],
      correctIndex: 1,
      explain: "'Chị ngã em nâng' khuyên anh chị em ruột thịt luôn đùm bọc, nâng đỡ nhau lúc khó khăn."
    },
    {
      id: "q7",
      packIdx: 1,
      tag: "Tục ngữ kinh nghiệm",
      question: "Ông bà xưa nhìn chuồn chuồn bay để đoán thời tiết: 'Chuồn chuồn bay thấp thì..., bay cao thì nắng, bay vừa thì râm'?",
      options: ["Bão", "Lạnh", "Mưa", "Gió"],
      correctIndex: 2,
      explain: "Khi sắp mưa độ ẩm không khí cao làm cánh chuồn chuồn nặng nên chúng thường bay sát mặt đất."
    },
    {
      id: "q8",
      packIdx: 1,
      tag: "Lời ru quê hương",
      question: "Trong bài ca dao về hoa sen: 'Trong đầm gì đẹp bằng sen, lá xanh bông trắng lại chen...'?",
      options: ["Nhị hồng", "Nhị vàng", "Đài xanh", "Hương nồng"],
      correctIndex: 1,
      explain: "'Lá xanh bông trắng lại chen nhị vàng; Nhị vàng bông trắng lá xanh, gần bùn mà chẳng hôi tanh mùi bùn.'"
    },
    {
      id: "q9",
      packIdx: 1,
      tag: "Đạo lý gia đình",
      question: "Câu tục ngữ nào đề cao kinh nghiệm quý báu của người cao tuổi?",
      options: ["Tre non dễ uốn", "Gừng càng già càng cay", "Nước chảy đá mòn", "Đi một ngày đàng"],
      correctIndex: 1,
      explain: "'Gừng càng già càng cay' tôn vinh sự từng trải, điềm đạm và sâu sắc của bậc cao niên."
    },
    {
      id: "q10",
      packIdx: 1,
      tag: "Tình làng nghĩa xóm",
      question: "Hoàn thành câu tục ngữ: 'Bán anh em xa, mua ... gần'?",
      options: ["Bạn bè", "Chợ búa", "Láng giềng", "Đồng hương"],
      correctIndex: 2,
      explain: "'Bán anh em xa, mua láng giềng gần' nhắc nhở quý trọng hàng xóm tối lửa tắt đèn có nhau."
    },
    // Bộ 3 (10..14)
    {
      id: "q11",
      packIdx: 2,
      tag: "Di sản miền Trung",
      question: "Cầu Trường Tiền 6 vai 12 nhịp bắc qua dòng sông thơ mộng nào của xứ Huế?",
      options: ["Sông Hàn", "Sông Hương", "Sông Thu Bồn", "Sông Gianh"],
      correctIndex: 1,
      explain: "Cầu Trường Tiền bắc qua dòng sông Hương là biểu tượng lâu đời của cố đô Huế."
    },
    {
      id: "q12",
      packIdx: 2,
      tag: "Lịch sử dân tộc",
      question: "Chiến thắng Điện Biên Phủ 'lừng lẫy năm châu, chấn động địa cầu' kết thúc thắng lợi vào ngày tháng năm nào?",
      options: ["30/4/1975", "7/5/1954", "2/9/1945", "19/8/1945"],
      correctIndex: 1,
      explain: "Chiều ngày 7/5/1954, lá cờ Quyết chiến Quyết thắng tung bay trên nóc hầm Đờ Cát tại Điện Biên Phủ."
    },
    {
      id: "q13",
      packIdx: 2,
      tag: "Văn hóa phương Nam",
      question: "Loại hình nghệ thuật vừa đàn vừa ca mộc mạc gắn với miệt vườn Nam Bộ được UNESCO vinh danh là gì?",
      options: ["Đờn ca tài tử", "Ca trù", "Nhã nhạc cung đình", "Hát Chầu văn"],
      correctIndex: 0,
      explain: "Đờn ca tài tử Nam Bộ gắn liền với bản Dạ cổ hoài lang của cố nhạc sĩ Cao Văn Lầu."
    },
    {
      id: "q14",
      packIdx: 2,
      tag: "Thủ đô ngàn năm",
      question: "Năm 1010, vị vua nào đã ban Chiếu dời đô từ Hoa Lư ra thành Đại La và đổi tên thành Thăng Long?",
      options: ["Lý Thường Kiệt", "Lý Thái Tổ (Lý Công Uẩn)", "Trần Nhân Tông", "Lê Thánh Tông"],
      correctIndex: 1,
      explain: "Vua Lý Thái Tổ (Lý Công Uẩn) ban Chiếu dời đô mùa thu năm Canh Tuất 1010, mở ra kinh thành Thăng Long."
    },
    {
      id: "q15",
      packIdx: 2,
      tag: "Danh nhân đất Việt",
      question: "Danh y Hải Thượng Lãn Ông — bậc tổ ngành y học cổ truyền Việt Nam — có tên thật là gì?",
      options: ["Tuệ Tĩnh", "Lê Hữu Trác", "Nguyễn Bỉnh Khiêm", "Chu Văn An"],
      correctIndex: 1,
      explain: "Đại danh y Lê Hữu Trác (Hải Thượng Lãn Ông) để lại bộ sách quý Hải Thượng Y Tông Tâm Lĩnh."
    },
    // Bộ 4 (15..19)
    {
      id: "q16",
      packIdx: 3,
      tag: "Giấc ngủ tuổi bạc",
      question: "Trước giờ đi ngủ buổi tối khoảng 2–3 tiếng, thói quen nào giúp người lớn tuổi dễ vào giấc ngủ sâu hơn?",
      options: [
        "Uống 2 chén trà đặc hoặc cà phê đậm",
        "Ngâm chân nước ấm nhẹ và hạn chế trà đặc",
        "Ăn thật no đồ chiên rán",
        "Xem điện thoại sát mắt trong phòng tối"
      ],
      correctIndex: 1,
      explain: "Ngâm chân nước ấm khoảng 40 độ C trong 10–15 phút và tránh trà đặc tối muộn giúp thư giãn mạch máu, ngủ ngon."
    },
    {
      id: "q17",
      packIdx: 3,
      tag: "An toàn điện thoại",
      question: "Khi có cuộc gọi video lạ tự xưng công an hoặc viện kiểm sát yêu cầu chuyển tiền 'xác minh tài khoản', bác nên xử lý sao?",
      options: [
        "Làm theo ngay trên điện thoại",
        "Cúp máy ngay — cơ quan nhà nước không bao giờ làm việc hay thu tiền qua điện thoại",
        "Cài ứng dụng lạ theo đường dẫn họ gửi",
        "Chụp gửi sổ tiết kiệm"
      ],
      correctIndex: 1,
      explain: "Công an, tòa án luôn gửi giấy mời làm việc trực tiếp tại trụ sở địa phương, tuyệt đối không yêu cầu chuyển tiền qua mạng."
    },
    {
      id: "q18",
      packIdx: 3,
      tag: "Vận động buổi sáng",
      question: "Vào những sáng mùa đông trời trở lạnh sâu, người cao tuổi nên đi tập thể dục như thế nào cho an toàn tim mạch?",
      options: [
        "Mở cửa ra ngoài trời gió lạnh lúc 4 giờ sáng",
        "Khởi động ấm người trong nhà và chờ trời hửng sáng bớt sương lạnh mới ra sân",
        "Tập chạy nước rút cường độ cao",
        "Tắm nước lạnh ngay sau khi tập"
      ],
      correctIndex: 1,
      explain: "Khởi động kỹ trong nhà và tránh gió lạnh đột ngột lúc tờ mờ sáng giúp phòng ngừa co mạch và tăng huyết áp."
    },
    {
      id: "q19",
      packIdx: 3,
      tag: "Dinh dưỡng lành mạnh",
      question: "Cách ăn uống nào tốt cho tim mạch và huyết áp của người từ 55 tuổi trở lên?",
      options: [
        "Ăn mặn đậm muối và nhiều dưa cà muối",
        "Giảm bớt muối (ăn nhạt vừa), tăng rau xanh, cá và uống đủ nước ấm",
        "Bỏ hẳn bữa sáng",
        "Uống nước ngọt có gas thay nước lọc"
      ],
      correctIndex: 1,
      explain: "Ăn giảm mặn, bổ sung rau củ quả tươi, cá và chia ngụm nước ấm đều trong ngày rất tốt cho thành mạch."
    },
    {
      id: "q20",
      packIdx: 3,
      tag: "Bảo vệ đôi mắt",
      question: "Khi đọc báo hoặc đánh cờ trên điện thoại được khoảng 20 phút, làm gì giúp mắt đỡ mỏi nhức?",
      options: [
        "Nhìn ra xa khoảng 20 giây và chớp mắt nhẹ",
        "Tăng độ sáng màn hình chói hết cỡ",
        "Dụi mắt thật mạnh",
        "Tắt hết đèn phòng"
      ],
      correctIndex: 0,
      explain: "Quy tắc nghỉ mắt 20 phút nhìn xa 20 giây giúp cơ điều tiết mắt được thư giãn tự nhiên."
    },
    // Bộ 5 (20..24)
    {
      id: "q21",
      packIdx: 4,
      tag: "Văn hóa thưởng trà",
      question: "Loại bánh ngọt truyền thống nào của đất Hải Dương (nay thuộc Hải Phòng mở rộng) rất hợp khi nhâm nhi cùng chén trà sen nóng?",
      options: ["Bánh đậu xanh", "Bánh tráng phơi sương", "Bánh pía sầu riêng", "Bánh căn"],
      correctIndex: 0,
      explain: "Bánh đậu xanh tan mịn vị bùi ngọt thanh là tri kỷ lâu đời của chén trà mạn, trà sen miền Bắc."
    },
    {
      id: "q22",
      packIdx: 4,
      tag: "Cờ tướng dân gian",
      question: "Trên bàn Cờ Tướng 9×10 chuẩn, quân cờ nào phải có đúng 1 quân làm 'ngòi' ở giữa mới được phép ăn quân đối phương?",
      options: ["Quân Xe", "Quân Mã", "Quân Pháo", "Quân Tốt"],
      correctIndex: 2,
      explain: "Quân Pháo đi ngang dọc như Xe nhưng khi ăn quân bắt buộc phải nhảy qua đúng một quân làm ngòi."
    },
    {
      id: "q23",
      packIdx: 4,
      tag: "Mâm cỗ ngày Tết",
      question: "Sự tích Bánh Chưng — Bánh Giầy tượng trưng cho Trời tròn Đất vuông gắn liền với người con hiếu thảo nào thời Hùng Vương?",
      options: ["Chử Đồng Tử", "Lang Liêu", "Sơn Tinh", "Mai An Tiêm"],
      correctIndex: 1,
      explain: "Hoàng tử Lang Liêu dùng hạt gạo nếp quê hương làm bánh Chưng vuông, bánh Giầy tròn dâng cúng Tổ tiên."
    },
    {
      id: "q24",
      packIdx: 4,
      tag: "Trò chơi dân gian",
      question: "Trên bàn Ô Ăn Quan truyền thống, mỗi bên người chơi quản lý bao nhiêu ô Dân ở hàng của mình?",
      options: ["3 ô Dân", "5 ô Dân", "7 ô Dân", "9 ô Dân"],
      correctIndex: 1,
      explain: "Bàn Ô Ăn Quan gồm 10 ô Dân chia đều mỗi bên 5 ô, cùng 2 ô Quan hình bán nguyệt ở hai đầu."
    },
    {
      id: "q25",
      packIdx: 4,
      tag: "Làng nghề truyền thống",
      question: "Làng gốm cổ truyền nằm bên bờ sông Hồng thuộc Gia Lâm (Hà Nội) nổi tiếng hàng trăm năm với ấm chén men rạn là làng nào?",
      options: ["Làng lụa Vạn Phúc", "Làng gốm Bát Tràng", "Làng tranh Đông Hồ", "Làng nón Chuông"],
      correctIndex: 1,
      explain: "Gốm Bát Tràng nổi danh với ấm tích, chén trà men lam, men ngọc và men rạn cổ truyền."
    }
  ];

  // 18 cặp Ca dao & Tục ngữ dùng cho trò chơi dân gian "Lật Thẻ Ca Dao Trí Nhớ"
  const PROVERB_PAIRS = [
    { id: "pv1", head: "Uống nước", tail: "nhớ nguồn", meaning: "Biết ơn cội nguồn và người đi trước." },
    { id: "pv2", head: "Ăn quả", tail: "nhớ kẻ trồng cây", meaning: "Trân trọng công sức vun trồng của thế hệ trước." },
    { id: "pv3", head: "Gừng càng già", tail: "càng cay", meaning: "Người cao niên giàu kinh nghiệm và bản lĩnh." },
    { id: "pv4", head: "Chị ngã", tail: "em nâng", meaning: "Anh chị em thương yêu đùm bọc lẫn nhau." },
    { id: "pv5", head: "Lá lành", tail: "đùm lá rách", meaning: "Tương thân tương ái giúp đỡ người khó khăn." },
    { id: "pv6", head: "Tốt gỗ", tail: "hơn tốt nước sơn", meaning: "Phẩm chất bên trong quý hơn vẻ hào nhoáng bên ngoài." },
    { id: "pv7", head: "Đi một ngày đàng", tail: "học một sàng khôn", meaning: "Giao lưu mở mang thêm nhiều điều hay mỗi ngày." },
    { id: "pv8", head: "Có công mài sắt", tail: "có ngày nên kim", meaning: "Kiên trì bền bỉ ắt sẽ thành công." },
    { id: "pv9", head: "Thuận vợ thuận chồng", tail: "tát biển Đông cũng cạn", meaning: "Gia đình đồng lòng thì việc lớn mấy cũng xong." },
    { id: "pv10", head: "Bán anh em xa", tail: "mua láng giềng gần", meaning: "Quý trọng tình làng nghĩa xóm tối lửa tắt đèn." },
    { id: "pv11", head: "Lời nói chẳng mất", tail: "tiền mua", meaning: "Lựa lời hòa nhã ấm lòng người nghe." },
    { id: "pv12", head: "Cây ngay không sợ", tail: "chết đứng", meaning: "Sống ngay thẳng chính trực thì tâm luôn an." },
    { id: "pv13", head: "Một cây làm chẳng nên non", tail: "ba cây chụm lại nên hòn núi cao", meaning: "Sức mạnh của sự đoàn kết cộng đồng." },
    { id: "pv14", head: "Đói cho sạch", tail: "rách cho thơm", meaning: "Giữ gìn nhân cách trong sáng ở mọi hoàn cảnh." },
    { id: "pv15", head: "Một nụ cười bằng", tail: "mười thang thuốc bổ", meaning: "Tinh thần vui vẻ là liều thuốc quý nhất cho tuổi già." },
    { id: "pv16", head: "Trăm hay không bằng", tail: "tay quen", meaning: "Rèn luyện đều đặn mỗi ngày giúp tay chân dẻo dai." },
    { id: "pv17", head: "Khéo ăn thì no", tail: "khéo co thì ấm", meaning: "Biết thu vén giản dị thì cuộc sống luôn đủ đầy." },
    { id: "pv18", head: "Tre già", tail: "măng mọc", meaning: "Con cháu nối tiếp truyền thống tốt đẹp của ông bà." }
  ];

  // Các Câu lạc bộ & Đơn vị bạn thi đấu trong "Cúp Cờ Tướng Giao Hữu Đồng Ngũ" (3 vòng)
  const TOURNAMENT_RIVAL_CLUBS = [
    { id: "rv-1", round: 0, roundLabel: "Vòng Tứ Kết", aiLevel: "easy", clubName: "CLB Cờ Hưu Trí Sông Hàn", captain: "Anh Tấn · 66t (Đà Nẵng)", motto: "Khai cuộc điềm đạm, giao lưu kết bạn" },
    { id: "rv-2", round: 0, roundLabel: "Vòng Tứ Kết", aiLevel: "easy", clubName: "Hội Kỳ Hữu Tây Đô", captain: "Bác Bảy · 69t (Cần Thơ)", motto: "Pháo đầu phóng khoáng miền sông nước" },
    { id: "rv-3", round: 1, roundLabel: "Vòng Bán Kết", aiLevel: "club", clubName: "Đoàn Cựu Binh Trường Sơn 559", captain: "Cụ Hòa · 73t (Nghệ An)", motto: "Thế trận Bình Phong Mã vững như bàn thạch" },
    { id: "rv-4", round: 1, roundLabel: "Vòng Bán Kết", aiLevel: "club", clubName: "CLB Cờ Công Viên Tao Đàn", captain: "Anh Phát · 68t (TP. HCM)", motto: "Song Pháo quá hà, biến hóa sắc sảo" },
    { id: "rv-5", round: 2, roundLabel: "Trận Chung Kết", aiLevel: "club", clubName: "Hội Kỳ Vương Hồ Gươm", captain: "Bác Phúc · 72t (Hà Nội)", motto: "Tinh hoa cờ thế Kinh Kỳ — Công thủ toàn diện" }
  ];

  // Cặp vần Lục Bát gợi ý nhanh khi sáng tác trên Chiếu Thơ
  const LUC_BAT_RHYME_PAIRS = [
    { theme: "Trà sớm & Tri kỷ", lines: ["Sáng ra mở cửa đón xuân,", "Ấm trà sen ngát quây quần bạn xưa."] },
    { theme: "Nhớ đồng đội cũ", lines: ["Bao năm giữ trọn nghĩa tình,", "Gặp nhau tóc bạc vẫn mình với ta."] },
    { theme: "Gia đình sum vầy", lines: ["Con khôn cháu thảo đầy nhà,", "Tiếng cười ấm áp tuổi già thêm xuân."] },
    { theme: "Quê hương thanh bình", lines: ["Chiều quê gió thổi triền đê,", "Hương sen thoang thoảng đi về thảnh thơi."] },
    { theme: "Tâm an dưỡng sinh", lines: ["Giữ cho tâm tĩnh lòng an,", "Mỗi ngày dạo bước muôn vàn niềm vui."] }
  ];

  // Thơ ca cộng đồng
  const POEMS = [
    {
      id: "p1",
      author: "Nguyễn Khuyến (Tác phẩm công cộng)",
      title: "Thu Điếu (Trích)",
      lines: [
        "Ao thu lạnh lẽo nước trong veo,",
        "Một chiếc thuyền câu bé tẻo teo.",
        "Sóng biếc theo làn hơi gợn tí,",
        "Lá vàng trước gió khẽ đưa vèo."
      ],
      flowers: 24,
      reciter: "Chị Lan · 68 tuổi (Hà Nội)"
    },
    {
      id: "p2",
      author: "Sáng tác thành viên",
      title: "Chén Trà Sớm Mai",
      lines: [
        "Sáng ra mở cửa đón bình minh,",
        "Pha ấm trà sen đợi bạn mình.",
        "Tuổi bạc thêm vui câu xướng họa,",
        "An nhiên ngày mới nghĩa thâm tình."
      ],
      flowers: 31,
      reciter: "Anh Dũng · 67 tuổi (Bắc Ninh)"
    },
    {
      id: "p3",
      author: "Ca dao Việt Nam",
      title: "Công Cha Nghĩa Mẹ",
      lines: [
        "Công cha như núi Thái Sơn,",
        "Nghĩa mẹ như nước trong nguồn chảy ra.",
        "Một lòng thờ mẹ kính cha,",
        "Cho tròn chữ hiếu mới là đạo con."
      ],
      flowers: 42,
      reciter: "Chị Hoa · 63 tuổi (Đà Nẵng)"
    }
  ];

  // Phòng xem chung & Kệ đồ dùng an toàn (tách biệt dưới video)
  const WATCH_CHANNELS = [
    {
      id: "duong-sinh",
      slot: "08:00 — Dưỡng sinh buổi sáng (10 phút)",
      title: "Bài tập vỗ tay thông kinh lạc và xoay khớp vai nhẹ nhàng",
      instructor: "CLB Dưỡng sinh phường Trúc Bạch (Đã duyệt bản quyền)",
      subtitle: "Hít vào thật sâu bằng mũi... nâng hai tay ngang vai, thở ra chậm rãi..."
    },
    {
      id: "cuoi-tuoi-bac",
      slot: "20:00 — Cười cùng Tuổi Bạc (15 phút)",
      title: "Tiểu phẩm hài dân gian: Ông Tú đi mua kính lão",
      instructor: "Nhóm Kịch Sân Khấu Nhỏ (Đã duyệt phát hành)",
      subtitle: "Ông Tú: Đeo kính này vào đọc báo sáng rõ từng dấu chấm dấu phẩy luôn bà ạ!"
    },
    {
      id: "nhac-que",
      slot: "15:00 — Phong cảnh Làng quê (12 phút)",
      title: "Mùa sen nở bên đầm và tiếng sáo diều chiều quê",
      instructor: "Kênh Tư liệu Quê Hương (Creative Commons CC-BY)",
      subtitle: "Gió nam thổi nhẹ qua cánh đồng sen hồng tháng Sáu..."
    }
  ];

  const SAFE_AFFILIATE_ITEMS = [
    {
      id: "aff-1",
      name: "Hộp chia thuốc 7 ngày chữ nổi to",
      note: "Dễ phân biệt Sáng - Trưa - Tối",
      price: "65.000đ"
    },
    {
      id: "aff-2",
      name: "Thảm cao su chống trượt nhà tắm",
      note: "Bám sàn chắc, an toàn cho người lớn tuổi",
      price: "145.000đ"
    }
  ];

  // Góc tĩnh tâm (100% miễn phí)
  const ZEN_SPACES = [
    {
      id: "chua-que",
      name: "Sân Chùa Quê",
      partner: "Đối tác: Ban Văn hóa Chùa Hương Tích",
      quote: "Buông bớt lo âu chuyện hôm qua, giữ lòng an tĩnh trong hơi thở sáng nay."
    },
    {
      id: "nha-tho-ho",
      name: "Nhà Thờ Họ",
      partner: "Không gian tưởng niệm gia tiên",
      quote: "Cây có cội mới trổ cành xanh lá, con cháu sum vầy nhờ nếp nhà giữ gìn."
    },
    {
      id: "vuon-thien",
      name: "Vườn Thiền Tĩnh Lặng",
      partner: "Không gian hít thở tự do",
      quote: "Nghe một tiếng chuông ngân, thả trôi phiền muộn theo làn nước mát."
    }
  ];

  // Trợ lý sức khỏe (không chẩn đoán, có từ khóa báo động đỏ 115)
  const HEALTH_QA = [
    {
      topic: "Đo huyết áp đúng cách tại nhà",
      answer: "Bác nên ngồi nghỉ yên 5 phút trước khi đo, đặt tay ngang tim, không uống cà phê hay trà đặc ngay trước lúc đo và ghi lại con số vào sổ để mang cho bác sĩ xem khi tái khám."
    },
    {
      topic: "Nhắc lịch uống thuốc theo đơn bác sĩ",
      answer: "Nên dùng hộp chia thuốc theo ngày và đặt giờ cố định sau bữa sáng. Không tự ý bỏ thuốc hoặc đổi liều khi chưa hỏi ý kiến bác sĩ điều trị."
    },
    {
      topic: "Chuẩn bị 3 câu hỏi trước khi đi khám",
      answer: "1. Kết quả huyết áp/đường huyết tuần này của tôi có cần chỉnh gì không? 2. Tôi cần kiêng ăn món gì? 3. Khi nào tôi cần tái khám lại?"
    }
  ];

  const RED_FLAG_WORDS = ["đau ngực", "tức ngực", "khó thở", "méo miệng", "yếu liệt", "tê nửa người", "nói ngọng", "chóng mặt ngất"];

  const IDLE_ICEBREAKERS = [
    "Tôi vừa châm thêm nước sôi vào ấm Tử Sa, sáng nay chỗ các anh chị thời tiết có dễ chịu không ạ?",
    "Thấy bàn mình trầm ngâm thưởng trà, mời cả nhà nghe mẩu tin sáng nay về mẹo đi bộ sau bữa ăn cho nhẹ bụng nhé.",
    "Nhắc chuyện xưa một chút cho vui: hồi còn công tác, buổi sáng các anh chị hay ăn sáng món gì nhất?",
    "Có câu ca dao: 'Ấm trà buổi sáng thêm hương, gặp người tri kỷ dặm trường cũng vui' — mời các anh chị nối chuyện nhé!",
    "Trên Tờ Báo Sáng vừa có tin mới về giá cả sinh hoạt và sức khỏe mùa giao mùa, các anh chị thấy sao ạ?"
  ];

  // Bảng xếp hạng & Danh hiệu
  const LEADERBOARD = [
    { name: "Anh Dũng · 67 tuổi", province: "Bắc Ninh", score: 420, title: "Nhà thơ lãng mạn", tag: "Tỉnh" },
    { name: "Chị Lan · 68 tuổi", province: "Hà Nội", score: 390, title: "Vua đố vui", tag: "Tỉnh" },
    { name: "Anh Thành · 69 tuổi", province: "Ninh Bình", score: 350, title: "Vua ô ăn quan", tag: "Tỉnh" },
    { name: "Chị Hoa · 63 tuổi", province: "Đà Nẵng", score: 310, title: "Thành viên Chăm Điểm Danh", tag: "Người mới" }
  ];

  // Gán Mã Thẻ Hội Viên & trạng thái hoạt động trực tuyến cho danh bạ bạn đồng niên
  const DIRECTORY_ACTIVITIES = [
    { roomId: "phong-tra", tableIdx: 0, online: true, where: "Đang ở Bàn 1: Trà Sen Sáng" },
    { roomId: "d25-d3-1k2-mn75", tableIdx: 0, online: true, where: "Đang ở Bàn trà Đại đội 1K2 · D3 · Sư đoàn 25" },
    { roomId: "phong-tra", tableIdx: 0, online: true, where: "Đang ở Bàn 1: Trà Sen Sáng" },
    { roomId: "phong-cay", tableIdx: 0, online: false, where: "Vừa điểm danh sáng nay" },
    { roomId: "phong-co", tableIdx: 0, online: true, where: "Đang giải Cờ Thế (Phòng Cờ)" },
    { roomId: "phong-tra", tableIdx: 2, online: false, where: "Online 25 phút trước" },
    { roomId: "phong-tra", tableIdx: 3, online: true, where: "Đang ở Bàn 4: Dưỡng Sinh" },
    { roomId: "phong-co", tableIdx: 1, online: true, where: "Đang đánh Cờ Tướng 9×10" },
    { roomId: "d25-d3-1k2-mn75", tableIdx: 0, online: true, where: "Đang trực Bàn trà Đại đội 1K2 · D3 · Sư đoàn 25" },
    { roomId: "phong-tho", tableIdx: 0, online: false, where: "Vừa ngâm thơ lục bát" },
    { roomId: "phong-tra", tableIdx: 5, online: true, where: "Đang ở Bàn 6: Ký Ức Bao Cấp" },
    { roomId: "phong-tra", tableIdx: 1, online: false, where: "Đang đọc Tờ Báo Sáng" },
    { roomId: "phong-tho", tableIdx: 0, online: true, where: "Đang ở Phòng Thơ Lục Bát" },
    { roomId: "phong-tho", tableIdx: 1, online: true, where: "Đang tặng hoa Sân Thơ" },
    { roomId: "phong-co", tableIdx: 0, online: true, where: "Đang giải Thế 4: Thiết Môn Thuyên" },
    { roomId: "d25-d3-1k2-mn75", tableIdx: 0, online: true, where: "Đang ở Bàn trà Đại đội 1K2 · D3 · Sư đoàn 25" },
    { roomId: "d25-d3-1k2-mn75", tableIdx: 0, online: true, where: "Đang điểm danh quân số Đại đội 1K2" },
    { roomId: "phong-tra", tableIdx: 2, online: false, where: "Vừa điểm danh sáng nay" }
  ];

  SENIOR_DIRECTORY.forEach((s, idx) => {
    s.memberCode = `TB-${101 + idx}`;
    const act = DIRECTORY_ACTIVITIES[idx % DIRECTORY_ACTIVITIES.length];
    s.onlineNow = act.online;
    s.onlineWhere = act.where;
    s.onlineRoomId = act.roomId;
    s.onlineTableIdx = act.tableIdx;
  });

  // Phân loại Hội nhóm / Đơn vị
  const GROUP_CATEGORIES = [
    { id: "veteran", label: "Đơn vị Quân đội / Đồng ngũ", badge: "Đồng ngũ" },
    { id: "school", label: "Đồng niên / Trường cũ", badge: "Đồng niên" },
    { id: "hometown", label: "Hội Đồng hương", badge: "Đồng hương" },
    { id: "hobby", label: "CLB Cờ · Thơ · Cây cảnh", badge: "Câu lạc bộ" }
  ];

  // Các Đơn vị / Hội nhóm khởi tạo sẵn (có mẫu chuẩn Đại đội 1K2 · D3 · Sư đoàn 25 · Miền Nam 75)
  const INITIAL_GROUPS = [
    {
      id: "d25-d3-1k2-mn75",
      name: "Đại đội 1K2 · Tiểu đoàn 3 (D3) · Sư đoàn 25",
      shortName: "Đại đội 1K2 · D3 · F25",
      category: "veteran",
      unitSpec: {
        company: "Đại đội 1K2",
        battalion: "Tiểu đoàn 3 (D3)",
        division: "Sư đoàn 25",
        campaign: "Chiến trường Miền Nam 75"
      },
      subtitle: "Chiến trường Miền Nam 75 (Đông Nam Bộ – Tây Ninh – Củ Chi)",
      motto: "Anh em Đại đội 1K2 – D3 – Sư đoàn 25 giữ ấm tình đồng chí: sáng điểm danh quân số, pha ấm trà ôn kỷ niệm chiến trường Miền Nam mùa Xuân 1975.",
      leaderName: "Anh Minh · 71 tuổi (Trưởng ban liên lạc)",
      joinPin: "",
      memberIds: ["minh", "vinh", "hung-ccb", "quynh"],
      realMembers: [],
      bulletins: [
        {
          author: "Anh Minh · 71 tuổi (Ban liên lạc)",
          time: "Sáng nay · 06:30",
          text: "Chào anh em Đại đội 1K2 - D3 - F25! Tôi vừa mở Bàn trà trực tuyến của đơn vị mình, anh em vào điểm danh sức khỏe và gửi đường dẫn cho các đồng đội ở tỉnh xa nhé."
        },
        {
          author: "Anh Cường · 73 tuổi (Quảng Trị)",
          time: "Sáng nay · 07:05",
          text: "Ngồi đây nghe tiếng anh em trò chuyện lại nhớ những đêm hành quân Đông Nam Bộ mùa khô 75. Chúc toàn đại đội luôn dẻo dai!"
        }
      ]
    },
    {
      id: "hoi-dong-nien-7x",
      name: "Hội Cựu Giáo Chức & Bạn Học Thập Niên 70",
      shortName: "Cựu Giáo Chức 7X",
      category: "school",
      unitSpec: null,
      subtitle: "Giao lưu thơ lục bát, chuyện bục giảng xưa & sức khỏe tuổi hưu",
      motto: "Mái đầu bạc vẫn vẹn nguyên tình thầy trò, bạn học năm xưa.",
      leaderName: "Chị Lan · 68 tuổi (Hà Nội)",
      joinPin: "",
      memberIds: ["lan", "mai", "dung", "thu"],
      realMembers: [],
      bulletins: [
        {
          author: "Chị Lan · 68 tuổi (Hà Nội)",
          time: "Sáng nay · 06:45",
          text: "Sáng thứ Bảy tuần này hội mình tổ chức xướng họa thơ thu tại Bàn trà riêng của hội nhé các anh chị."
        }
      ]
    },
    {
      id: "clb-ky-huu-bonsai",
      name: "CLB Kỳ Hữu Cờ Tướng & Cây Cảnh Ba Miền",
      shortName: "CLB Cờ & Bonsai",
      category: "hobby",
      unitSpec: null,
      subtitle: "Giải 6 thế cờ giang hồ, giao lưu ván treo 9×10 & chăm cây cảnh",
      motto: "Sáng tỉa cành tùng, trưa bày thế cờ — vui khỏe minh mẫn mỗi ngày.",
      leaderName: "Anh Thành · 69 tuổi (Ninh Bình)",
      joinPin: "",
      memberIds: ["thanh", "tu", "phat", "bay"],
      realMembers: [],
      bulletins: [
        {
          author: "Anh Thành · 69 tuổi (Ninh Bình)",
          time: "Sáng nay · 07:15",
          text: "Mời các kỳ hữu thử sức Thế 4 Thiết Môn Thuyên và Thế 6 Song Pháo Lồng Mã mới cập nhật trong Phòng Cờ!"
        }
      ]
    },
    {
      id: "hoi-dong-huong-nam-bo",
      name: "Hội Đồng Hương Sông Nước Miền Tây",
      shortName: "Đồng Hương Miền Tây",
      category: "hometown",
      unitSpec: null,
      subtitle: "Cần Thơ – Đồng Tháp – Vĩnh Long – An Giang – Cà Mau",
      motto: "Dù ở quê nhà hay đi xa thăm con cháu, vào bàn trà là nghe giọng quê hương.",
      leaderName: "Anh Phát · 66 tuổi (Cần Thơ)",
      joinPin: "",
      memberIds: ["phat", "binh", "bay", "sau"],
      realMembers: [],
      bulletins: [
        {
          author: "Anh Phát · 66 tuổi (Cần Thơ)",
          time: "Sáng nay · 06:50",
          text: "Mời bà con đồng hương miền Tây ghé uống trà sáng, nghe tin mùa nước nổi và giá lúa mới."
        }
      ]
    }
  ];

  // Hệ thống 6 Tầng Danh Hiệu Thâm Niên (từ Mộc Mạc đến Lâu Năm) khuyến khích đăng nhập lưu Thẻ
  const SENIORITY_TIERS = [
    {
      level: 0,
      id: "khach-ghe",
      name: "Khách Ghé Hiên Trà",
      shortBadge: "Khách Ghé",
      minPoints: 0,
      requiresCard: false,
      color: "#7A6A58",
      bgSoft: "#F3EDE2",
      frameUnlock: "none",
      perk: "Đang lưu tạm trên máy này — Mở Thẻ Hội Viên 10 giây nhận ngay +30 Điểm Thâm Niên & +15 Xu, thăng lên Bậc 1!"
    },
    {
      level: 1,
      id: "moc-mac",
      name: "Bậc 1 · Bạn Trà Mộc Mạc",
      shortBadge: "Mộc Mạc",
      minPoints: 20,
      requiresCard: true,
      color: "#6E4A35",
      bgSoft: "#F7EDE2",
      frameUnlock: "tri-am",
      perk: "Thẻ Gỗ Mộc giữ trọn Bạn bè & Đơn vị khi đổi máy · Được đặt tên bàn đàm đạo riêng"
    },
    {
      level: 2,
      id: "quen-thuoc",
      name: "Bậc 2 · Trà Hữu Quen Thuộc",
      shortBadge: "Quen Thuộc",
      minPoints: 65,
      requiresCard: true,
      color: "#2F5D7C",
      bgSoft: "#E8F1F7",
      frameUnlock: "tri-am",
      perk: "Khung Gốm Men Lam · Ưu tiên hiện bàn đàm đạo của chủ bàn lên đầu sảnh"
    },
    {
      level: 3,
      id: "tri-ky",
      name: "Bậc 3 · Tri Kỷ Sớm Hôm",
      shortBadge: "Tri Kỷ",
      minPoints: 130,
      requiresCard: true,
      color: "#2E6B56",
      bgSoft: "#E6F4EE",
      frameUnlock: "thi-huu",
      perk: "Khung Ngọc Bích Tri Kỷ · Mở khóa bộ Sticker đặc biệt & Bồ đoàn hàng đầu Chánh Điện"
    },
    {
      level: 4,
      id: "truong-lao",
      name: "Bậc 4 · Trưởng Lão Giữ Lửa",
      shortBadge: "Trưởng Lão",
      minPoints: 240,
      requiresCard: true,
      color: "#8A4224",
      bgSoft: "#FBECE6",
      frameUnlock: "giu-lua",
      perk: "Khung Gỗ Trắc Khảm Đồng · Vinh danh Ban Liên Lạc gương mẫu của cộng đồng"
    },
    {
      level: 5,
      id: "cay-cao",
      name: "Bậc 5 · Cây Cao Bóng Cả (Lâu Năm)",
      shortBadge: "Lâu Năm",
      minPoints: 380,
      requiresCard: true,
      color: "#9E6412",
      bgSoft: "#FFF6DE",
      frameUnlock: "cay-cao",
      perk: "Khung Sơn Mài Thếếp Vàng 3D · Bậc danh hiệu cao quý nhất của Quán Trà Tuổi Bạc"
    }
  ];

  // Bộ 8 Sticker Quán Trà cỡ lớn — Chạm 1 lần gửi ngay khỏi cần gõ chữ
  const TEA_STICKERS = [
    {
      id: "stk-moi-tra",
      shortLabel: "Mời chén trà!",
      fullText: "[Sticker: Mời cả bàn chén trà sen nóng ấm lòng!]",
      color: "#2E6B56",
      bg: "#E7F5EE",
      kind: "tea",
      ritual: "pour"
    },
    {
      id: "stk-hay-qua",
      shortLabel: "Hay quá bác ơi!",
      fullText: "[Sticker: Câu chuyện bác kể chí lý và hay quá!]",
      color: "#B83B2A",
      bg: "#FDECE8",
      kind: "thumb",
      ritual: ""
    },
    {
      id: "stk-suc-khoe",
      shortLabel: "Chúc luôn khỏe!",
      fullText: "[Sticker: Chúc các anh chị ngày mới dồi dào sức khỏe!]",
      color: "#9E6412",
      bg: "#FFF6DE",
      kind: "lotus",
      ritual: ""
    },
    {
      id: "stk-cuoi-vui",
      shortLabel: "Vui quá xá!",
      fullText: "[Sticker: Nghe chuyện bàn mình cười tươi trẻ ra mười tuổi!]",
      color: "#C45B1C",
      bg: "#FEF0E4",
      kind: "smile",
      ritual: ""
    },
    {
      id: "stk-hen-co",
      shortLabel: "Làm ván cờ nhé!",
      fullText: "[Sticker: Uống xong tuần trà mình bày bàn Cờ Tướng 9×10 nhé!]",
      color: "#6B3F24",
      bg: "#F6ECE2",
      kind: "chess",
      ritual: ""
    },
    {
      id: "stk-dong-doi",
      shortLabel: "Chào đồng đội!",
      fullText: "[Sticker: Bắt tay đồng đội năm xưa — chúc luôn vững vàng!]",
      color: "#3E5634",
      bg: "#EAF2E4",
      kind: "star",
      ritual: ""
    },
    {
      id: "stk-am-tinh",
      shortLabel: "Ấm tình tri kỷ",
      fullText: "[Sticker: Gửi tặng tấm lòng trân quý tới cả bàn trà!]",
      color: "#A62B38",
      bg: "#FCEAEF",
      kind: "heart",
      ritual: ""
    },
    {
      id: "stk-tam-an",
      shortLabel: "Tâm an vạn lành",
      fullText: "[Sticker: Tâm tĩnh lặng như mặt hồ thu, chúc cả nhà bình an!]",
      color: "#524678",
      bg: "#EFEQF9",
      kind: "bell",
      ritual: ""
    }
  ];

  // Viếng Chùa & Chánh Điện Online (Lấy cảm hứng từ kentjuno/chanh-dien-online & DoanDuyThanh71/chua-online-live)
  // 100% hướng thiện, tĩnh tâm, KHÔNG mê tín hù dọa, KHÔNG thu tiền cúng dường
  const TEMPLE_PRAYER_PRESETS = [
    "Cầu chúc đại gia đình bình an, con cháu đi làm xa mạnh khỏe thuận hòa.",
    "Nguyện tâm trí sáng suốt, tuổi già nhẹ nhàng an vui bên bạn hiền.",
    "Tưởng nhớ và tri ân các đồng đội năm xưa, cầu quốc thái dân an.",
    "Chúc mọi người trong Quán Trà ngủ ngon giấc, dẻo dai mỗi sớm mai."
  ];

  const TEMPLE_PEACE_CARDS = [
    {
      clipId: "que-01",
      code: "An Lạc Số 01 · Tâm Như Nước Tĩnh",
      spaceCodes: [
        "An Lạc Số 01 · Tâm Như Nước Tĩnh",
        "Gia Huấn Số 01 · Tâm Hòa Gia Định",
        "Kệ Thiền Số 01 · Tâm Như Nước Tĩnh"
      ],
      verse: "Mặt hồ không gợn sóng, trăng sáng tự hiện hình.\nLòng buông điều lo nghĩ, tuổi hạc hưởng thanh bình.",
      advice: "Hôm nay bác hãy dành 15 phút đi bộ thong thả dưới nắng sớm và uống một ấm trà nhạt, tinh thần sẽ rất khoan khoái."
    },
    {
      clipId: "que-02",
      code: "An Lạc Số 02 · Gia Đạo Thuận Hòa",
      spaceCodes: [
        "An Lạc Số 02 · Gia Đạo Thuận Hòa",
        "Gia Huấn Số 02 · Nếp Nhà Thuận Thảo",
        "Kệ Thiền Số 02 · Hơi Ấm Hiền Hòa"
      ],
      verse: "Cây xanh nhờ rễ vững, nhà ấm bởi lời hiền.\nMột câu khen con cháu, vui suốt cả tuần liền.",
      advice: "Một cuộc điện thoại ngắn hoặc tấm thiệp điểm danh gửi con cháu hôm nay sẽ mang lại niềm vui ấm áp cho cả hai thế hệ."
    },
    {
      clipId: "que-03",
      code: "An Lạc Số 03 · Tri Âm Gặp Gỡ",
      spaceCodes: [
        "An Lạc Số 03 · Tri Âm Gặp Gỡ",
        "Gia Huấn Số 03 · Trọng Nghĩa Quý Tình",
        "Kệ Thiền Số 03 · Trà Thơm Đợi Bạn"
      ],
      verse: "Trà thơm chờ bạn quý, cờ bày đợi người thân.\nChuyện xưa ôn đôi chút, nhẹ bớt vạn phong trần.",
      advice: "Ngày đẹp để bác ghé bàn trà hỏi thăm đồng đội cũ hoặc thử giải một thế cờ tàn rèn luyện trí nhớ."
    },
    {
      clipId: "que-04",
      code: "An Lạc Số 04 · Dưỡng Thân Như Chăm Cây",
      spaceCodes: [
        "An Lạc Số 04 · Dưỡng Thân Như Chăm Cây",
        "Gia Huấn Số 04 · Giữ Gìn Sức Khỏe",
        "Kệ Thiền Số 04 · Dưỡng Thân Tĩnh Khí"
      ],
      verse: "Tỉa cành khi sương sớm, tưới nước lúc chiều êm.\nGiữ hơi thở đều đặn, giấc ngủ tự nhiên mềm.",
      advice: "Tối nay bác thử ngâm chân nước ấm trước khi ngủ 30 phút và nghe vài câu thơ lục bát dịu nhẹ nhé."
    },
    {
      clipId: "que-05",
      code: "An Lạc Số 05 · Biết Đủ Là Giàu Có",
      spaceCodes: [
        "An Lạc Số 05 · Biết Đủ Là Giàu Có",
        "Gia Huấn Số 05 · Tri Túc Thường Lạc",
        "Kệ Thiền Số 05 · Mỗi Bước Nở Hoa"
      ],
      verse: "Bữa cơm rau đạm bạc, tiếng cười rộn hiên nhà.\nKhông hơn thua vội vã, mỗi bước nở sen hoa.",
      advice: "Giữ nhịp sống chậm rãi, ăn uống thanh đạm và mỉm cười với hàng xóm láng giềng là phương thuốc quý nhất."
    },
    {
      clipId: "que-06",
      code: "An Lạc Số 06 · Phúc Ấm Lưu Dài",
      spaceCodes: [
        "An Lạc Số 06 · Phúc Ấm Lưu Dài",
        "Gia Huấn Số 06 · Đức Lưu Quang Vĩnh",
        "Kệ Thiền Số 06 · Hương Lành Theo Gió"
      ],
      verse: "Trồng thêm nhành hoa quý, gieo một lời động viên.\nHương lành bay theo gió, phúc đức ở quanh hiên.",
      advice: "Hôm nay bác gửi một Sticker chúc sức khỏe hoặc tặng hoa cho bài thơ của bạn đồng niên sẽ kết thêm duyên lành."
    }
  ];

  // Bộ 15 clip giọng đọc tiếng Việt thu sẵn (.mp3 nén 32kbps ngoại tuyến cho máy Android cũ thiếu giọng TTS)
  const VOICE_CLIPS = {
    "chao-buoi-sang": { src: "./assets/audio/chao-buoi-sang.mp3", label: "Chào buổi sáng Quán Trà" },
    "diem-danh-xong": { src: "./assets/audio/diem-danh-xong.mp3", label: "Lời chúc điểm danh bình an" },
    "chao-ban-tra": { src: "./assets/audio/chao-ban-tra.mp3", label: "Lời mời vào Bàn Trà" },
    "dan-chanh-dien": { src: "./assets/audio/dan-chanh-dien.mp3", label: "Lời dẫn Chánh Điện Chùa Quê" },
    "dan-nha-tho-ho": { src: "./assets/audio/dan-nha-tho-ho.mp3", label: "Lời dẫn Từ Đường Nhà Thờ Họ" },
    "dan-vuon-thien": { src: "./assets/audio/dan-vuon-thien.mp3", label: "Lời dẫn Vườn Thiền Tĩnh Lặng" },
    "dan-co-tuong": { src: "./assets/audio/dan-co-tuong.mp3", label: "Lời dẫn Cờ Tướng 9×10" },
    "dan-o-an-quan": { src: "./assets/audio/dan-o-an-quan.mp3", label: "Lời dẫn Ô Ăn Quan" },
    "nhac-nghi-mat": { src: "./assets/audio/nhac-nghi-mat.mp3", label: "Lời nhắc nghỉ mắt 20 phút" },
    "que-01": { src: "./assets/audio/que-01.mp3", label: "Đọc Quẻ Số 01" },
    "que-02": { src: "./assets/audio/que-02.mp3", label: "Đọc Quẻ Số 02" },
    "que-03": { src: "./assets/audio/que-03.mp3", label: "Đọc Quẻ Số 03" },
    "que-04": { src: "./assets/audio/que-04.mp3", label: "Đọc Quẻ Số 04" },
    "que-05": { src: "./assets/audio/que-05.mp3", label: "Đọc Quẻ Số 05" },
    "que-06": { src: "./assets/audio/que-06.mp3", label: "Đọc Quẻ Số 06" }
  };

  // Dữ liệu Log hành vi khởi tạo của cộng đồng để AI Tracking phân tích chân dung thành viên
  const SEED_MEMBER_LOGS = [
    { id: "seed-1", ts: Date.now() - 7200000, hour: 6, memberCode: "TB-102", userName: "Anh Minh", age: 71, province: "Hải Phòng", seniorityTier: "Bậc 4 · Trưởng Lão", action: "unit_joined", category: "dong-ngu", detail: "Điểm danh Ban liên lạc Đại đội 1K2 · D3 · Sư đoàn 25" },
    { id: "seed-2", ts: Date.now() - 6800000, hour: 6, memberCode: "TB-102", userName: "Anh Minh", age: 71, province: "Hải Phòng", seniorityTier: "Bậc 4 · Trưởng Lão", action: "xiangqi_play", category: "co-tuong", detail: "Giải thành công Thế 4: Thiết Môn Thuyên (Quất Trung Bí)" },
    { id: "seed-3", ts: Date.now() - 6500000, hour: 6, memberCode: "TB-102", userName: "Anh Minh", age: 71, province: "Hải Phòng", seniorityTier: "Bậc 4 · Trưởng Lão", action: "news_read", category: "doc-bao", detail: "Đọc tin Lương hưu & Thời sự sáng nay" },
    { id: "seed-4", ts: Date.now() - 5400000, hour: 6, memberCode: "TB-101", userName: "Chị Lan", age: 68, province: "Hà Nội", seniorityTier: "Bậc 5 · Cây Cao Bóng Cả", action: "temple_incense", category: "chua-online", detail: "Dâng hương cầu bình an & rút Thẻ An Lạc Số 02 tại Chánh Điện" },
    { id: "seed-5", ts: Date.now() - 5100000, hour: 7, memberCode: "TB-101", userName: "Chị Lan", age: 68, province: "Hà Nội", seniorityTier: "Bậc 5 · Cây Cao Bóng Cả", action: "poem_posted", category: "tho-ca", detail: "Ngâm bài thơ Lục bát Hương Trà Sáng Sớm" },
    { id: "seed-6", ts: Date.now() - 4600000, hour: 7, memberCode: "TB-101", userName: "Chị Lan", age: 68, province: "Hà Nội", seniorityTier: "Bậc 5 · Cây Cao Bóng Cả", action: "tea_sticker", category: "giao-luu", detail: "Gửi Sticker 'Mời chén trà!' tại Bàn 1 Trà Sen" },
    { id: "seed-7", ts: Date.now() - 3900000, hour: 7, memberCode: "TB-109", userName: "Anh Vĩnh", age: 74, province: "Nghệ An", seniorityTier: "Bậc 4 · Trưởng Lão", action: "table_hosted", category: "dong-ngu", detail: "Đặt tên bàn đàm đạo: 'Ôn chuyện Trường Sơn & Miền Nam 75'" },
    { id: "seed-8", ts: Date.now() - 3200000, hour: 8, memberCode: "TB-113", userName: "Chị Liên", age: 62, province: "TP. HCM", seniorityTier: "Bậc 2 · Quen Thuộc", action: "temple_muyu", category: "chua-online", detail: "Gõ mõ tĩnh tâm 18 nhịp tại Chánh Điện Online" }
  ];

  // Bảng phân định rõ tính năng nào Mở Cửa Tự Do vs tính năng nào Cần Thẻ Hội Viên
  const AUTH_TIER_GUIDE = {
    freeFeatures: [
      "Điểm danh bình an buổi sáng & xem bản đồ đèn sáng 34 tỉnh thành",
      "Đọc Tờ Báo Sáng chữ to, nghe Đọc to tiếng Việt, giải Đố vui",
      "Đánh Cờ Tướng 9×10 (32 quân) với Máy & Giải 6 thế Cờ Thế cổ phổ",
      "Viếng Chùa Chánh Điện Online (gõ mõ, dâng hương, rút Thẻ An Lạc) & ghé thử Bàn trà"
    ],
    memberFeatures: [
      "Thăng 5 Bậc Danh Hiệu Thâm Niên (từ Bạn Trà Mộc Mạc → Cây Cao Bóng Cả lâu năm) + nhận 15 Xu",
      "Lập hoặc Gia nhập Đơn vị Đồng ngũ (như Đại đội 1K2 · D3 · Sư đoàn 25) & Đặt tên Bàn trà riêng",
      "Kết bạn tâm giao & thấy đèn xanh Bạn bè Đang Online ở bàn trà nào để sang ngồi cùng",
      "Lưu trữ đám mây đa lớp & Ảnh Thẻ QR — đổi điện thoại mới khôi phục 100% dữ liệu trong 1 chạm"
    ]
  };

  return {
    PROVINCES,
    OUTFITS,
    TABLE_ITEMS,
    ACCESSORIES,
    TITLE_FRAMES,
    SENIORITY_TIERS,
    TEA_STICKERS,
    TEMPLE_PRAYER_PRESETS,
    TEMPLE_PEACE_CARDS,
    VOICE_CLIPS,
    SEED_MEMBER_LOGS,
    IDLE_ICEBREAKERS,
    HABIT_TAGS,
    SENIOR_DIRECTORY,
    GROUP_CATEGORIES,
    INITIAL_GROUPS,
    AUTH_TIER_GUIDE,
    ROOM_TEMPLATES,
    cloneRoomTemplate,
    TEA_TABLES,
    INITIAL_PHONETIC_DICT,
    FILLER_WORDS,
    REPLY_MATRIX,
    VOICE_SAMPLES,
    NEWS_CATEGORIES,
    NEWS_HOT_KEYWORDS,
    MORNING_ARTICLES,
    RSS_DRAFTS,
    QUIZ_PACKS,
    QUIZ_QUESTIONS,
    PROVERB_PAIRS,
    TOURNAMENT_RIVAL_CLUBS,
    LUC_BAT_RHYME_PAIRS,
    POEMS,
    WATCH_CHANNELS,
    SAFE_AFFILIATE_ITEMS,
    ZEN_SPACES,
    HEALTH_QA,
    RED_FLAG_WORDS,
    LEADERBOARD
  };
})();
