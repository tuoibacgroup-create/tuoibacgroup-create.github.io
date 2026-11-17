# 02 — Sơ Đồ Dữ Liệu `state`, API Nội Bộ & Lược Đồ Mạng / Cơ Sở Dữ Liệu

Tài liệu này đóng vai trò "Bản hợp đồng giao tiếp" (Interface Contract) giữa các tệp JavaScript. Trước khi đọc hoặc ghi vào `state` hay gọi hàm liên module, hãy tra cứu đúng cấu trúc tại đây.

---

## 1. Cấu Trúc Đối Tượng Trạng Thái Trung Tâm (`state` trong `app.js`)

Khởi tạo gốc nằm tại `createDefaultState()` trong `app.js`:

```javascript
state = {
  route: "home", // 1 trong 16 giá trị định tuyến (xem ARCHITECTURE.md Mục 3)

  auth: {
    isRegistered: false,          // Đã mở Thẻ Hội Viên 10 giây hay chưa
    memberCode: "",               // Mã định danh ngắn (VD: "TB-7203")
    accountHash: "",              // Mã băm một chiều từ (SĐT chuẩn hóa + PIN 4 số)
    phoneMasked: "",              // SĐT che giữa (VD: "091***5678")
    recoveryToken: "",            // Chuỗi khôi phục nhúng vào mã QR trên Ảnh Thẻ
    passkeyEnabled: false,        // Đã bật WebAuthn Vân tay / Khuôn mặt trên máy
    primaryUnitLabel: "..."       // Nhãn đơn vị/hội chính hiển thị cạnh tên
  },

  user: {
    honorific: "Anh" | "Chị",
    baseName: "Tám Vườn",
    name: "Anh Tám Vườn",
    age: 65,                      // Giới hạn hợp lệ: 45..105
    profileConfigured: false,
    provinceId: "can-tho",        // Khóa khớp với TuoiBacData.PROVINCES
    outfitId: "ao-ba-ba",
    itemId: "am-tu-sa",
    accessoryId: "glasses",
    titleFrameId: "tri-am",
    xu: 35,                       // Tiền thưởng nội bộ (chỉ đổi quà tinh thần trong quán)
    seniorityPoints: 28,          // Tổng XP thâm niên trục chính (0..23008+)
    skillPoints: {                // Điểm tích lũy riêng cho 8 cây chuyên môn (progression.js)
      tea_host: 4,
      xiangqi: 3,
      poetry: 2,
      folk_games: 2,
      morning_habit: 4,
      comrade_social: 3,
      temple_zen: 3,
      voice_wisdom: 2
    },
    flowersLeft: 3,
    giftedPoemIds: [],
    checkedInToday: false,
    mood: "Khỏe khoắn",
    streakDays: 6,
    unlockedOutfits: [],
    unlockedItems: [],
    unlockedAccessories: [],
    unlockedTitleFrames: [],
    unlockedTitles: []
  },

  social: {
    activeTab: "units" | "friends" | "online",
    selectedGroupId: "d25-d3-1k2-mn75",
    subView: "list" | "detail",
    joinedGroupIds: [],
    groups: [],                   // Danh sách đơn vị đồng ngũ & CLB
    friends: []                   // Danh sách bạn tâm giao đã kết nối
  },

  teaRoom: {
    rooms: [],                    // 5 phòng sinh hoạt (Trà, Báo, Thơ, Cờ, Quê Hương)
    roomId: "phong-tra",
    subView: "lobby" | "table",
    tableIdx: 0,                  // Bàn số 0..5 trong sảnh 5 gian
    log: [],                      // Tối đa 30 dòng hội thoại gần nhất tại bàn
    lastSentAt: 0,                // Mốc thời gian phục vụ khóa nhịp nhấp trà 10s
    activeNewspaperRef: null,
    articleTable: null            // Bàn đàm đạo riêng mở từ một bài báo cụ thể
  },

  xiangqi: {
    mode: "ai" | "puzzle" | "pass" | "async",
    aiLevel: "easy" | "club",
    puzzleIdx: 0,
    solvedPuzzleIds: [],
    board: null,                  // Mảng 10×9 ký tự quân cờ ('R','N','B','A','K','C','P' hoa=Đỏ, thường=Đen)
    turn: "red" | "black",
    selected: null,
    lastMove: null,
    hintMove: null,
    prevBoard: null,
    moveLog: [],
    matchId: "",
    mySide: "red"
  },

  zen: {
    spaceIdx: 0,                  // 0: Sân Chùa Quê, 1: Nhà Thờ Họ, 2: Vườn Thiền
    cameraView: "wide" | "cushions" | "courtyard",
    userCushionIdx: 2,            // Vị trí chiếu Bồ Đoàn 0..9 (BĐ 1..10)
    incenseLit: true,
    incenseCount: 14,
    muyuCount: 0,
    bellCount: 0,
    lanternsReleased: 18,
    wishPlaquesCount: 16,
    peaceCardIdx: 0,
    prayers: []                   // Lời cầu an & thẻ đỏ ước nguyện gần nhất
  }
  // Các nhánh phụ khác: settings, privacy, analytics, newspaper, quiz, oaq, poems, watch, health, customTables, memberLogs
}
```

---

## 2. API Công Khai Của 7 Namespace Toàn Cục

### 2.1. `window.TuoiBacProgression` (`progression.js`)
- `MAIN_TIERS`: Mảng `33` phần tử (`level 0` đến `level 32`).
- `ERAS`: Mảng `7` giai đoạn (`era-0` đến `era-6`).
- `SKILL_TREES`: Mảng `8` cây chuyên môn, mỗi cây gồm `8` bậc (`I..VIII`).
- `calcMainTierXp(level)` → `number`: Tính mốc XP lồi cho tầng `L`.
- `calcSkillTierReq(baseA, baseB, tierIdx1Based)` → `number`: Tính mốc điểm cho bậc `k`.
- `evaluateMainProgress(rawXp, isRegistered)` → `{ xp, isGuest, current, next, xpIntoLevel, xpNeededForNext, percent }`.
- `evaluateSkillTree(treeId, rawPts)` → `{ tree, points, current, next, percent }`.
- `getCohortComparisonLabel(level, isRegistered)` → `{ tag, cls, desc }`.

### 2.2. `window.TuoiBacTelemetry` (`telemetry.js`)
- `record(eventType, moduleName, subAction, metaObj, userCtx)` → Ghi sự kiện đầy đủ vào bộ đệm nóng + `IndexedDB` + cập nhật ma trận thói quen 24h + đẩy qua hàm chuyển tiếp mạng.
- `recordRouteChange(nextRoute, userCtx)` → Chốt `dwellSec` của màn hình vừa rời đi và ghi sự kiện mở màn hình mới.
- `flushDwellHeartbeat(userCtx)` → Ghi nhận thời lượng dừng lại tại màn hình hiện tại (gọi định kỳ mỗi `20s`).
- `ingestRemoteEvent(pkt)` → Tiếp nhận sự kiện telemetry từ thiết bị khác để làm giàu bảng phân tích chung.
- `getAllEventsAsync()` → `Promise<Event[]>`: Đọc toàn bộ kho sự kiện từ `IndexedDB`.
- `getMemberDeepProfiles()` → Danh sách hồ sơ thói quen sâu của từng thành viên (`hourlyHist[24]`, `chatSummary.byMethod`, `topDwellSummary`, `searchQueries`, `aiActionableInsight`).
- `buildExportJsonlString()` / `buildExportFullJsonObject()` / `buildExportCsvString()` → Xuất dữ liệu chuẩn huấn luyện AI.

### 2.3. `window.TeaRoomScene` (`tearoom3d.js`)
- `mount(container, config, onFallback)`: Dựng sảnh trà 5 gian (`viewType: "overview"`) hoặc cận cảnh bàn tròn (`viewType: "table"`) hoặc sân khấu thử đồ (`viewType: "showcase"`).
- `setSpeaker(seatIdx)` / `triggerTeaService()` / `showSeatSticker(seatIdx, label, bg, color)`.
- `setOverviewWideLevel("wide" | "ultrawide")`.
- `capturePostcardPng(meta)` / `drawInviteCardPng(meta)` / `drawQrToCanvas(ctx, url, x, y, size)`.
- `dispose()`: Hủy ngữ cảnh WebGL và dừng vòng lặp vẽ.

### 2.4. `window.TempleScene3D` (`temple3d.js`)
- `mount(container, config, onFallback)`: Dựng Chánh Điện 3D góc rộng, 10 chiếu Bồ Đoàn, sân Hồ Sen và Cây Thẻ Đỏ.
- `setCameraView("wide" | "cushions" | "courtyard")` / `getCameraView()`.
- `triggerIncense(speakerName)` / `triggerMuyu(count)` / `triggerBell(speakerName)`.
- `spawnWishPlaque(speakerName, isVeteranGold)`: Treo thêm một thẻ đỏ (hoặc thẻ vàng cho bậc từ Tầng 23) đung đưa trên cây sân chùa.
- `spawnPondLantern(speakerName)`: Thả thêm một ngọn hoa đăng trôi trên mặt hồ sen.
- `dispose()`: Giải phóng toàn bộ tài nguyên 3D Chánh Điện.

### 2.5. `window.TuoiBacXiangqi` (`xiangqi.js`)
- `PUZZLES`: Mảng 6 thế cờ cổ phổ đã kiểm chứng lời giải.
- `createInitialBoard()` / `cloneBoard(b)` / `parseFen(fen)`.
- `generateLegalMoves(board, side)` / `applyMove(board, mv)` / `isInCheck(board, side)`.
- `chooseAiMove(board, side, depthLevel)`: AI đối thủ máy (`easy` hoặc `club` 4 tầng Alpha-Beta).
- `formatMoveViet(board, mv)`: Đọc tên nước cờ theo thuật ngữ cờ tướng Việt Nam (ví dụ: *"Pháo Đỏ bình 5"*).

### 2.6. `window.TuoiBacRealtime` (`realtime.js`)
- Kết nối & trạng thái: `start()`, `reconnect()`, `getStatus()`, `on(event, fn)`.
- Bàn trà: `joinTableChannel(tableKey, myPeerMeta)`, `leaveTableChannel()`, `sendTableMessage(...)`, `publishTableCustomMeta(...)`.
- Hiện diện & Xã hội: `publishGlobalOnline(peerMeta)`, `getOnlinePeers()`, `publishGroup(groupObj)`, `publishFriendSignal(targetCode, signalObj)`.
- Sao lưu Thẻ Hội Viên: `publishAccountBackup(accountHash, snapshotObj)`, `fetchAccountBackup(accountHash, callback)`.
- Chuyên mục khác: `publishMorningCheckin(...)`, `publishMatchState(...)`, `publishPoem(...)`, `publishTempleRitual(...)`, `publishMemberLog(...)`, `publishTelemetryEvent(...)`.

---

## 3. Cây Chủ Đề MQTT & 13 Bảng Cơ Sở Dữ Liệu (`supabase_schema.sql`)

| Phân hệ | Chủ đề MQTT (`tuoibac/prod/v1/...`) | Bảng PostgreSQL tương ứng |
| :--- | :--- | :--- |
| Hiện diện bàn trà | `/presence/{tableKey}/{clientId}` | Supabase Realtime Presence |
| Hiện diện toàn quán | `/online/{memberCode_or_clientId}` | Broadcast `tb_event` (`online`) |
| Trò chuyện & Sticker | `/chat/{tableKey}` & `/log/{tableKey}` | `public.tea_messages` |
| Đặt tên bàn trà riêng | `/tablemeta/{tableKey}` | `public.custom_tea_tables` |
| Điểm danh buổi sáng | `/checkins/{YYYY-MM-DD}/{clientId}` | `public.morning_checkins` |
| Cờ tướng & Ô ăn quan treo | `/matches/{matchId}` | `public.async_matches` |
| Đăng thơ & Tặng hoa | `/poems/{poemId}` | `public.poems` |
| Hội đồng ngũ & CLB | `/groups/{groupId}` | `public.community_groups` |
| Kết bạn hai chiều | `/friends/{toCode}/{fromCode}` | `public.friend_links` |
| Sao lưu Thẻ Hội Viên | `/accounts/{accountHash}` | `public.member_accounts` |
| Chánh Điện & Thẻ Đỏ 3D | `/temple/{slotKey}` | `public.temple_prayers` |
| Nhật ký tóm tắt | `/memberlogs/{ownerKey}` | `public.member_activity_logs` |
| Kho AI Telemetry 100% | `/telemetry/{ownerKey}` | `public.member_telemetry_events` |
| Sổ từ điển & Báo cáo an toàn | Đồng bộ qua ứng dụng | `public.phonetic_dictionary`, `public.analytics_events`, `public.safety_reports` |
