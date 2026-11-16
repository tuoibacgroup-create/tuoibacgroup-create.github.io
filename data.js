window.TuoiBacData = (function () {
  // 34 tỉnh/thành sau sáp nhập (ghi chú tỉnh cũ trong ngoặc) + Hoàng Sa, Trường Sa, Người Việt xa quê
  // Tọa độ [x, y] đặt trên bản đồ SVG khung 360 x 520
  const PROVINCES = [
    { id: "tuyen-quang", name: "Tuyên Quang (gồm cả Hà Giang)", short: "Tuyên Quang", x: 145, y: 66, lamps: 178 },
    { id: "cao-bang", name: "Cao Bằng", short: "Cao Bằng", x: 186, y: 54, lamps: 112 },
    { id: "lai-chau", name: "Lai Châu", short: "Lai Châu", x: 92, y: 66, lamps: 84 },
    { id: "lao-cai", name: "Lào Cai (gồm cả Yên Bái)", short: "Lào Cai", x: 118, y: 74, lamps: 204 },
    { id: "thai-nguyen", name: "Thái Nguyên (gồm cả Bắc Kạn)", short: "Thái Nguyên", x: 165, y: 84, lamps: 256 },
    { id: "lang-son", name: "Lạng Sơn", short: "Lạng Sơn", x: 198, y: 82, lamps: 149 },
    { id: "quang-ninh", name: "Quảng Ninh", short: "Quảng Ninh", x: 218, y: 102, lamps: 288 },
    { id: "phu-tho", name: "Phú Thọ (gồm cả Vĩnh Phúc, Hòa Bình)", short: "Phú Thọ", x: 140, y: 104, lamps: 342 },
    { id: "bac-ninh", name: "Bắc Ninh (gồm cả Bắc Giang)", short: "Bắc Ninh", x: 182, y: 102, lamps: 315 },
    { id: "ha-noi", name: "Thủ đô Hà Nội", short: "Hà Nội", x: 164, y: 110, lamps: 1245 },
    { id: "hai-phong", name: "TP. Hải Phòng (gồm cả Hải Dương)", short: "Hải Phòng", x: 196, y: 116, lamps: 530 },
    { id: "hung-yen", name: "Hưng Yên (gồm cả Thái Bình)", short: "Hưng Yên", x: 180, y: 124, lamps: 294 },
    { id: "ninh-binh", name: "Ninh Bình (gồm cả Hà Nam, Nam Định)", short: "Ninh Bình", x: 168, y: 136, lamps: 386 },
    { id: "son-la", name: "Sơn La", short: "Sơn La", x: 104, y: 104, lamps: 121 },
    { id: "dien-bien", name: "Điện Biên", short: "Điện Biên", x: 78, y: 88, lamps: 95 },
    { id: "thanh-hoa", name: "Thanh Hóa", short: "Thanh Hóa", x: 152, y: 162, lamps: 440 },
    { id: "nghe-an", name: "Nghệ An", short: "Nghệ An", x: 146, y: 194, lamps: 512 },
    { id: "ha-tinh", name: "Hà Tĩnh", short: "Hà Tĩnh", x: 162, y: 218, lamps: 276 },
    { id: "quang-tri", name: "Quảng Trị (gồm cả Quảng Bình)", short: "Quảng Trị", x: 178, y: 244, lamps: 234 },
    { id: "hue", name: "TP. Huế", short: "TP. Huế", x: 198, y: 266, lamps: 308 },
    { id: "da-nang", name: "TP. Đà Nẵng (gồm cả Quảng Nam, Hoàng Sa)", short: "Đà Nẵng", x: 214, y: 286, lamps: 486 },
    { id: "quang-ngai", name: "Quảng Ngãi (gồm cả Kon Tum)", short: "Quảng Ngãi", x: 218, y: 312, lamps: 245 },
    { id: "gia-lai", name: "Gia Lai (gồm cả Bình Định)", short: "Gia Lai", x: 222, y: 342, lamps: 318 },
    { id: "dak-lak", name: "Đắk Lắk (gồm cả Phú Yên)", short: "Đắk Lắk", x: 214, y: 368, lamps: 274 },
    { id: "khanh-hoa", name: "Khánh Hòa (gồm cả Ninh Thuận)", short: "Khánh Hòa", x: 236, y: 394, lamps: 336 },
    { id: "lam-dong", name: "Lâm Đồng (gồm cả Đắk Nông, Bình Thuận)", short: "Lâm Đồng", x: 204, y: 404, lamps: 365 },
    { id: "dong-nai", name: "Đồng Nai (gồm cả Bình Phước)", short: "Đồng Nai", x: 184, y: 416, lamps: 412 },
    { id: "tp-hcm", name: "TP. Hồ Chí Minh (gồm cả Bình Dương, Bà Rịa – Vũng Tàu)", short: "TP. HCM", x: 174, y: 432, lamps: 1380 },
    { id: "tay-ninh", name: "Tây Ninh (gồm cả Long An)", short: "Tây Ninh", x: 152, y: 428, lamps: 268 },
    { id: "dong-thap", name: "Đồng Tháp (gồm cả Tiền Giang)", short: "Đồng Tháp", x: 154, y: 452, lamps: 325 },
    { id: "vinh-long", name: "Vĩnh Long (gồm cả Bến Tre, Trà Vinh)", short: "Vĩnh Long", x: 164, y: 468, lamps: 356 },
    { id: "can-tho", name: "TP. Cần Thơ (gồm cả Sóc Trăng, Hậu Giang)", short: "Cần Thơ", x: 144, y: 472, lamps: 492 },
    { id: "an-giang", name: "An Giang (gồm cả Kiên Giang)", short: "An Giang", x: 122, y: 462, lamps: 348 },
    { id: "ca-mau", name: "Cà Mau (gồm cả Bạc Liêu)", short: "Cà Mau", x: 134, y: 494, lamps: 215 },
    { id: "hoang-sa", name: "Quần đảo Hoàng Sa", short: "Hoàng Sa", x: 292, y: 278, lamps: 64, island: true },
    { id: "truong-sa", name: "Quần đảo Trường Sa", short: "Trường Sa", x: 306, y: 434, lamps: 82, island: true },
    { id: "xa-que", name: "Người Việt xa quê", short: "Xa quê", x: 54, y: 270, lamps: 419, diaspora: true }
  ];

  const OUTFITS = [
    { id: "ao-ba-ba", name: "Áo bà ba nâu trầm", desc: "Vải đũi mộc mạc, hàng cúc ngà truyền thống", color: "#6E4A35", cost: 0 },
    { id: "ao-dai-xanh", name: "Áo lụa xanh ngọc", desc: "Lụa mềm cổ đứng nhã nhặn, mát mắt", color: "#2E5E4E", cost: 0 },
    { id: "ao-linh", name: "Áo sơ mi cựu chiến binh", desc: "Màu xanh rêu kỷ niệm, hai túi ngực ngay ngắn", color: "#556B45", cost: 15 },
    { id: "ao-len-do", name: "Áo gấm đỏ ấm", desc: "Sắc đỏ boóc-đô sang trọng cho buổi sáng se lạnh", color: "#A2382B", cost: 20 },
    { id: "ao-gam-vang", name: "Áo lụa hoa cúc vàng", desc: "Vàng hoàng kim tươi tắn, điểm họa tiết cúc thu", color: "#C48A2D", cost: 25 }
  ];

  const TABLE_ITEMS = [
    { id: "am-tu-sa", name: "Ấm trà tử sa", desc: "Ấm đất nung giữ nhiệt, tỏa khói trà thơm dịu", color: "#8B4228", cost: 0 },
    { id: "binh-sen", name: "Bình hoa sen hồng", desc: "Bình sứ trắng cắm búp sen thanh tao trên bàn", color: "#E8D5C4", cost: 10 },
    { id: "bonsai-mini", name: "Chậu bonsai mini", desc: "Thế cây tùng xanh mát trồng trong chậu men ngọc", color: "#2E6A44", cost: 15 },
    { id: "dia-hat-dua", name: "Đĩa hạt dưa & mứt sen", desc: "Đĩa sơn mài đỏ bày hạt dưa và mứt sen vàng", color: "#C63B2F", cost: 10 },
    { id: "den-dau", name: "Đèn dầu thời bao cấp", desc: "Chân đồng bóng kính thủy tinh thắp ngọn lửa ấm", color: "#D98A2B", cost: 20 },
    { id: "radio-go", name: "Radio vỏ gỗ cổ", desc: "Đài bán dẫn vỏ gỗ gụ có núm xoay mạ đồng", color: "#5E3B25", cost: 25 }
  ];

  const ACCESSORIES = [
    { id: "none", name: "Để đầu trần tự nhiên", desc: "Mái tóc bạc chải gọn gàng, phúc hậu", cost: 0 },
    { id: "glasses", name: "Kính lão gọng vàng", desc: "Gọng tròn thanh lịch giúp đọc báo sáng rõ nét", cost: 0 },
    { id: "scarf", name: "Khăn quàng ấm cổ", desc: "Khăn lụa đỏ trầm quàng nhẹ quanh cổ áo", cost: 10 },
    { id: "cap", name: "Mũ cối / Mũ beret xanh", desc: "Mũ xanh cựu chiến binh đội ngay ngắn", cost: 15 },
    { id: "non-la", name: "Nón lá truyền thống", desc: "Nón lá chằm tay vành tre mộc mạc quê hương", cost: 20 }
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
    { id: "lan", name: "Chị Lan", gender: "female", age: 68, provinceId: "ha-noi", province: "Hà Nội", habits: ["uong-tra", "tho-ca", "day-som"], bio: "Cựu giáo viên, thích trà nhài và ngâm thơ lục bát mỗi sáng.", outfitColor: "#A2382B", hat: "hair-bun", item: "binh-sen", badge: "Vừa cười" },
    { id: "minh", name: "Anh Minh", gender: "male", age: 71, provinceId: "hai-phong", province: "Hải Phòng", habits: ["cuu-chien-binh", "co-tuong", "doc-bao"], bio: "Cựu chiến binh Hải quân, mê cờ tướng và đọc thời sự sáng.", outfitColor: "#556B45", hat: "cap", item: "radio-go", badge: "Đang nghe" },
    { id: "hoa", name: "Chị Hoa", gender: "female", age: 63, provinceId: "da-nang", province: "Đà Nẵng", habits: ["duong-sinh", "uong-tra", "tho-ca"], bio: "Trưởng nhóm dân vũ phường, hay mời trà và bánh đậu xanh.", outfitColor: "#2E5E4E", hat: "hair-bob", item: "dia-hat-dua", badge: "Mời trà" },
    { id: "bay", name: "Anh Bảy", gender: "male", age: 66, provinceId: "dong-thap", province: "Đồng Tháp", habits: ["cay-canh", "day-som", "uong-tra"], bio: "Chăm vườn mai vàng và đờn ca tài tử buổi trưa.", outfitColor: "#6E4A35", hat: "scarf", item: "bonsai-mini", badge: "Đang ngồi" },
    { id: "thanh", name: "Anh Thành", gender: "male", age: 69, provinceId: "ninh-binh", province: "Ninh Bình", habits: ["cay-canh", "co-tuong", "day-som"], bio: "Có 15 chậu sanh bonsai tự uốn trên sân thượng.", outfitColor: "#556B45", hat: "cap", item: "bonsai-mini", badge: "Đang nói" },
    { id: "sau", name: "Anh Sáu", gender: "male", age: 72, provinceId: "vinh-long", province: "Vĩnh Long", habits: ["cay-canh", "bao-cap", "uong-tra"], bio: "Thích kể chuyện miệt vườn sông nước và trồng lan rừng.", outfitColor: "#6E4A35", hat: "scarf", item: "am-tu-sa", badge: "Đang ngồi" },
    { id: "nga", name: "Chị Nga", gender: "female", age: 61, provinceId: "lam-dong", province: "Lâm Đồng", habits: ["duong-sinh", "cay-canh", "tho-ca"], bio: "Trồng hoa cúc Đà Lạt và tập thái cực quyền lúc 6 giờ.", outfitColor: "#2E5E4E", hat: "hair-bun", item: "binh-sen", badge: "Mời trà" },
    { id: "tu", name: "Anh Tư", gender: "male", age: 65, provinceId: "an-giang", province: "An Giang", habits: ["doc-bao", "co-tuong", "bao-cap"], bio: "Đọc báo giấy mỗi sáng, hay giải thế cờ tàn.", outfitColor: "#C48A2D", hat: "none", item: "den-dau", badge: "Đang nghe" },
    { id: "vinh", name: "Anh Vĩnh", gender: "male", age: 74, provinceId: "nghe-an", province: "Nghệ An", habits: ["cuu-chien-binh", "bao-cap", "day-som"], bio: "Từng đóng quân Trường Sơn, nhớ nhiều kỷ niệm thời tem phiếu.", outfitColor: "#556B45", hat: "cap", item: "den-dau", badge: "Đang nói" },
    { id: "mai", name: "Chị Mai", gender: "female", age: 70, provinceId: "thanh-hoa", province: "Thanh Hóa", habits: ["bao-cap", "tho-ca", "duong-sinh"], bio: "Hay đọc ca dao xứ Thanh và kể chuyện xếp hàng mậu dịch.", outfitColor: "#A2382B", hat: "hair-bun", item: "am-tu-sa", badge: "Vừa cười" },
    { id: "hai", name: "Anh Hải", gender: "male", age: 68, provinceId: "hue", province: "TP. Huế", habits: ["uong-tra", "tho-ca", "bao-cap"], bio: "Pha trà sen cung đình, thích nghe đài phát thanh xưa.", outfitColor: "#6E4A35", hat: "none", item: "radio-go", badge: "Đang nghe" },
    { id: "lien", name: "Chị Liên", gender: "female", age: 62, provinceId: "tp-hcm", province: "TP. HCM", habits: ["duong-sinh", "doc-bao", "uong-tra"], bio: "Thích mẹo chăm sóc giấc ngủ và sống khỏe tuổi nghỉ hưu.", outfitColor: "#2E5E4E", hat: "hair-bob", item: "dia-hat-dua", badge: "Đang ngồi" },
    { id: "dung", name: "Anh Dũng", gender: "male", age: 67, provinceId: "bac-ninh", province: "Bắc Ninh", habits: ["tho-ca", "co-tuong", "uong-tra"], bio: "Yêu dân ca Quan họ và xướng họa thơ Đường luật.", outfitColor: "#C48A2D", hat: "none", item: "am-tu-sa", badge: "Đang nói" },
    { id: "thu", name: "Chị Thu", gender: "female", age: 64, provinceId: "thai-nguyen", province: "Thái Nguyên", habits: ["uong-tra", "tho-ca", "cay-canh"], bio: "Quê đất chè Tân Cương, hay tặng hoa trong sân thơ.", outfitColor: "#2E5E4E", hat: "hair-bun", item: "binh-sen", badge: "Vừa cười" },
    { id: "phat", name: "Anh Phát", gender: "male", age: 66, provinceId: "can-tho", province: "Cần Thơ", habits: ["co-tuong", "uong-tra", "day-som"], bio: "Đồng hương Cần Thơ, mê ô ăn quan và cờ tướng mỗi sáng.", outfitColor: "#6E4A35", hat: "scarf", item: "dia-hat-dua", badge: "Đang nghe" },
    { id: "quynh", name: "Anh Quỳnh", gender: "male", age: 70, provinceId: "phu-tho", province: "Phú Thọ", habits: ["cuu-chien-binh", "doc-bao", "bao-cap"], bio: "Cán bộ hưu trí, hay bàn tin lương hưu và chuyện đồng đội.", outfitColor: "#A2382B", hat: "glasses", item: "den-dau", badge: "Đang ngồi" },
    { id: "hung-ccb", name: "Anh Cường", gender: "male", age: 73, provinceId: "quang-tri", province: "Quảng Trị", habits: ["cuu-chien-binh", "co-tuong", "uong-tra"], bio: "Cựu chiến binh thành cổ, thích cờ tướng và thăm hỏi đồng đội.", outfitColor: "#556B45", hat: "cap", item: "radio-go", badge: "Mời trà" },
    { id: "binh", name: "Chị Bình", gender: "female", age: 60, provinceId: "can-tho", province: "Cần Thơ", habits: ["duong-sinh", "doc-bao", "cay-canh"], bio: "Tập dưỡng sinh buổi sáng ở bến Ninh Kiều, thích trồng rau sạch.", outfitColor: "#2E5E4E", hat: "hair-bob", item: "bonsai-mini", badge: "Đang ngồi" }
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

  // Đố vui hôm nay (5 câu thuộc 5 thẻ chủ đề)
  const QUIZ_QUESTIONS = [
    {
      id: "q1",
      tag: "Ký ức bao cấp",
      question: "Thời bao cấp, người dân đi mua gạo và thịt tại cửa hàng mậu dịch thường phải mang theo giấy tờ gì?",
      options: ["Thẻ căn cước gắn chip", "Tem phiếu và sổ gạo", "Giấy phép lái xe", "Sổ tiết kiệm"],
      correctIndex: 1,
      explain: "Tem phiếu và sổ gạo là giấy tờ quen thuộc gắn với đời sống sinh hoạt thời bao cấp trước năm 1986."
    },
    {
      id: "q2",
      tag: "Ca dao tục ngữ",
      question: "Điền từ còn thiếu vào câu ca dao: 'Uống nước nhớ..., ăn quả nhớ kẻ trồng cây'?",
      options: ["Suối", "Nguồn", "Sông", "Biển"],
      correctIndex: 1,
      explain: "Câu đầy đủ là 'Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây' nhắc nhở lòng biết ơn."
    },
    {
      id: "q3",
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
      tag: "Quê hương Việt Nam",
      question: "Làn điệu dân ca nào được UNESCO công nhận là Di sản văn hóa phi vật thể gắn liền với vùng Kinh Bắc (Bắc Ninh)?",
      options: ["Dân ca Quan họ", "Đờn ca tài tử", "Hò giã gạo", "Hát Xoan"],
      correctIndex: 0,
      explain: "Dân ca Quan họ Bắc Ninh nổi tiếng với văn hóa giao duyên 'liền anh, liền chị' và miếng trầu cánh phượng."
    }
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

  // Bảng xếp hạng & Danh hiệu
  const LEADERBOARD = [
    { name: "Anh Dũng · 67 tuổi", province: "Bắc Ninh", score: 420, title: "Nhà thơ lãng mạn", tag: "Tỉnh" },
    { name: "Chị Lan · 68 tuổi", province: "Hà Nội", score: 390, title: "Vua đố vui", tag: "Tỉnh" },
    { name: "Anh Thành · 69 tuổi", province: "Ninh Bình", score: 350, title: "Vua ô ăn quan", tag: "Tỉnh" },
    { name: "Chị Hoa · 63 tuổi", province: "Đà Nẵng", score: 310, title: "Thành viên Chăm Điểm Danh", tag: "Người mới" }
  ];

  return {
    PROVINCES,
    OUTFITS,
    TABLE_ITEMS,
    ACCESSORIES,
    HABIT_TAGS,
    SENIOR_DIRECTORY,
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
    QUIZ_QUESTIONS,
    POEMS,
    WATCH_CHANNELS,
    SAFE_AFFILIATE_ITEMS,
    ZEN_SPACES,
    HEALTH_QA,
    RED_FLAG_WORDS,
    LEADERBOARD
  };
})();
