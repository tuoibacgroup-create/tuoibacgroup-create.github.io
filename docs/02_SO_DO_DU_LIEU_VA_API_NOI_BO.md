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
    unlockedTitles: [],
    daysHistory: [],
    lastActiveDate: "2026-11-18", // Mốc ngày cục bộ để tự chuyển ngày mới (reset điểm danh, hoa, thuốc, nước & 3 niềm vui)
    dailyQuests: { dateKey: "2026-11-18", morningDone: false, socialDone: false, mindDone: false, chestClaimed: false },
    habits: [],
    gameStats: { oaqWins: 0, oaqLosses: 0, xiangqiWins: 0, xiangqiLosses: 0, proverbWins: 0, cupTitles: 0, winStreak: 0, bestWinStreak: 0 }
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
    mode: "ai" | "puzzle" | "local2p" | "async" | "cup",
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
    mySide: "red",
    inProgress: false,
    forfeitedPendingReload: false,
    cup: { active: false, round: 0, rivalId: "rv-1", unitName: "", championCount: 0, justWonTitle: false }
  },

  zen: {
    spaceIdx: 0,                  // 0: Sân Chùa Quê, 1: Nhà Thờ Họ, 2: Vườn Thiền Tĩnh Lặng
    cameraView: "wide" | "cushions" | "courtyard",
    userCushionIdx: 2,            // Vị trí chiếu ngồi 0..19 (Chiếu 1..20)
    incenseLit: true,
    incenseCount: 14,
    muyuCount: 0,
    bellCount: 0,
    lanternsReleased: 18,
    wishPlaquesCount: 16,
    peaceCardIdx: 0,
    lastPeaceCardAt: 0,           // Mốc thời gian rút xăm gần nhất (hồi lượt 45s)
    lastWishCardAt: 0,            // Mốc thời gian rút/treo thẻ đỏ gần nhất (hồi lượt 45s)
    activeLanterns: [],           // Đèn Hoa Đăng đang trôi trên mặt Hồ Sen (tồn tại 3 phút = 180.000ms)
    prayers: []                   // Lời cầu an & thẻ đỏ ước nguyện gần nhất
  },

  // Đầy đủ các khóa gốc còn lại trong createDefaultState() (tổng 20 khóa gốc):
  settings: { xlFont: false, preferredRender: "2.5d", autoFallbacked: false, homeMode: "full", pwaBannerDismissed: false, voiceMode: "auto", uatTag: "" },
  privacy: { consentFamilyCheckin: true, consentRealtimePresence: true, consentVoiceDict: true },
  analytics: { session_start: 1, morning_checkin_done: 0, tea_table_joined: 0, tea_msg_quick_0token: 0, tea_msg_voice_or_text: 0, news_article_read: 0, async_game_move: 0, poem_posted: 0, share_link_created: 0, idle_prompts_triggered: 0, feedbacks: [] },
  phoneticDict: [],               // Sổ từ điển sửa lỗi phát âm tiếng Việt tự học trên máy
  replyTemplates: [],             // Ma trận mẫu câu gợi ý nhanh 0-Token theo chủ đề
  newspaper: { articles: [], drafts: [], adminOpen: false, selectedCategory: "all", searchQuery: "", liveItems: [] },
  quiz: { packIdx: 0, idx: 0, score: 0, selectedOpt: null, hiddenOpts: [], hintUsed: false, finished: false, timeLeft: 25 },
  oaq: { cells: [], scoreP: 0, scoreAI: 0, turn: "host", mode: "ai", aiLevel: "club", matchId: "", zaloInviteUrl: "", inProgress: false, forfeitedPendingReload: false, proverbGame: { deck: [], flipped: [], matchedIds: [], moves: 0, finished: false } },
  poems: [],                      // Danh sách bài thơ lục bát & số hoa được tặng
  watch: { channelIdx: 0, votes: [], votedIdx: null, reactions: {}, clipAnswered: null },
  memberLogs: [],                 // Bộ đệm tóm tắt hoạt động gần nhất trong state
  customTables: {},               // Tên bàn trà đàm đạo do Chủ bàn đặt ({ [tableKey]: metaObj })
  health: { medMorning: false, medEvening: false, waterCups: 3, emergencyContactName: "Anh Hùng (Con trai)", emergencyContactPhone: "0900000000", bpReadings: [], lastAnswer: "", emergencyMode: false }
}
```

---

## 2. API Công Khai Của 7 Namespace Toàn Cục

### 2.0. `window.TuoiBacData` (`data.js`)
- Kho hằng số dữ liệu nền: `PROVINCES` (34 đơn vị hành chính), `ROOM_TEMPLATES` (5 phòng sinh hoạt), `MORNING_ARTICLES`, `RSS_DRAFTS`, `NEWS_CATEGORIES`, `NEWS_SUGGESTIONS`, `INITIAL_PHONETIC_DICT`, `VOICE_SAMPLES`, `VOICE_CLIPS` (15 clip `.mp3` giọng người thu sẵn ngoại tuyến), `REPLY_MATRIX`, `IDLE_ICEBREAKERS`, `TEA_STICKERS`, `TEMPLE_PEACE_CARDS` (kèm `clipId` và `spaceCodes` cho 3 không gian), `TEMPLE_PRAYER_PRESETS`, `INITIAL_GROUPS`, `SENIOR_DIRECTORY`, `POEMS`, `LUC_BAT_RHYME_PAIRS`, `QUIZ_PACKS` (5 bộ đề), `QUIZ_QUESTIONS` (25 câu đố vui), `PROVERB_PAIRS` (18 cặp ca dao tục ngữ), `TOURNAMENT_RIVAL_CLUBS` (5 CLB đối thủ Cúp 3 vòng), `OUTFITS`, `ACCESSORIES`, `TABLE_ITEMS`, `TITLE_FRAMES`, `HEALTH_QA`.

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
- `getGlobalActivityDashboard(liveSessionSec)` → Tổng hợp toàn quán: `kpis` (On-Time, cao điểm 24h, dịch vụ top, tổng chat, số phàn nàn & chặn an toàn), `serviceRanking`, `chatOverview`, `complaintRanking` (6 nhóm vấn đề), `topOnTimeMembers`, `issueFeed`.
- `getUatAndXpCalibrationReport(liveXp, liveStreakDays)` → Báo cáo UAT nhóm 5–10 cô bác (4G, tỷ lệ Chữ to 24px, tỷ lệ dùng giọng thu sẵn ngoại tuyến) và mô phỏng số ngày đạt Bậc 6 (`468 XP`), Bậc 16 (`3.928 XP`), Bậc 32 (`23.008 XP`).
- `buildExportJsonlString()` / `buildExportFullJsonObject()` / `buildExportCsvString()` → Xuất dữ liệu chuẩn huấn luyện AI.

### 2.3. `window.TeaRoomScene` (`tearoom3d.js`)
- `mount(el, canvas, tagsLayer, config, fallbackCb)`: Dựng sảnh trà 5 gian (`viewMode: "overview"`), cận cảnh bàn tròn (`viewMode: "table"` mặc định) hoặc sân khấu thử đồ (`viewMode: "profile"`). Chạy chuẩn **Full 2.5D Cổ Điển (TLBB)** (`mode === "2.5d"`) dùng `assets/tearoom-lobby-25d.jpg`, `assets/tearoom-table-25d.jpg`, Sprite nhân vật `assets/tearoom-sprites.webp`, Sprite phụ kiện khớp đầu/cổ `assets/tearoom-accessories.webp` và Sprite 6 món đồ bàn trà `assets/tearoom-items.webp`.
- `setSpeaker(idx)` / `setSeatBadge(idx, badge)` / `triggerTeaService()` / `showSeatSticker(seatIdx, label, bg, color)`.
- `toggleOverviewWide()` / `getOverviewWideLevel()` / `getActiveMode()`.
- `exportPostcardPng(opts)` / `drawQrToCanvas(ctx, text, x, y, size)`.
- `dispose()`: Hủy ngữ cảnh WebGL, giải phóng hình học/vật liệu và texture gắn theo phiên (`userData.isPerMount`), dọn trình nghe pointer (`canvasEl.onpointerdown`, `window.onpointermove/up`) và dừng vòng lặp vẽ.

### 2.4. `window.TempleScene3D` (`temple3d.js`)
- `CUSHION_COORDS`: Mảng `20` tọa độ chiếu ngồi (`4 hàng × 5 chiếu`, `idx 0..19`) trải rộng trên nền Đại Sảnh.
- `mount(container, config, onFallback)`: Dựng 3 không gian kiến trúc độc lập (`spaceIdx = 0` Sân Chùa Quê `assets/temple-*.jpg`, `spaceIdx = 1` Nhà Thờ Họ `assets/ancestral-*.jpg`, `spaceIdx = 2` Vườn Thiền `assets/zengarden-*.jpg`) kết hợp Sprite `assets/temple-sprites.webp`, đèn Hoa Đăng nổi trên mặt Hồ Sen trong 3 phút (`activeLanterns`) và thẻ đỏ đung đưa trên cây.
- `updateConfig(partialCfg)`: Cập nhật tại chỗ `attendees`, `userCushionIdx`, `wishes`, `activeLanterns`, `fortuneCooldownSec`, `wishCooldownSec` và chế độ tự gõ mõ mà không hủy `<canvas>`.
- `setCameraView("wide" | "cushions" | "courtyard")` / `getCameraView()` / `setAutoMuyuMode(active)`.
- `triggerIncense(speakerName, preferredCushionIdx)` / `triggerMuyu(count)` / `triggerBell(speakerName, preferredCushionIdx)` / `triggerFortuneStick(cardCode)`: Đưa đúng nhân vật tương ứng đứng dậy từ chiếu bước lên Lư hương / Mõ gỗ / Chuông / Ống xăm, cúi vái 3 nhịp trang nghiêm rồi bước quay về chiếu.
- `spawnWishPlaque(speakerName, isVeteranGold, wishText, preferredCushionIdx)` / `spawnPondLantern(speakerName, preferredCushionIdx)`: Hành lễ và thắp sáng thẻ đỏ / hoa đăng kèm thông báo nổi gọn nhẹ.
- `dispose()`: Giải phóng toàn bộ tài nguyên Canvas/Renderer Chánh Điện và gỡ bỏ listener kéo chuột khỏi `window`.

### 2.5. `window.TuoiBacXiangqi` (`xiangqi.js`)
- Hằng số & dữ liệu: `PIECE_LABELS`, `PUZZLES` (6 thế cờ cổ phổ đã kiểm chứng lời giải).
- Trạng thái & nước đi: `createInitialBoard()`, `buildBoardFromList(list)`, `cloneBoard(b)`, `applyMoveClone(board, move)`, `isInCheck(board, side)`.
- Luật & gợi ý: `getLegalMovesForSquare(board, r, c)`, `getAllLegalMoves(board, side)`, `pickAiMove(board, aiSide, levelOrPuzzle)`, `suggestBestMove(board, side)`.
- Hiển thị: `getCapturedPieces(board)`, `formatMoveLabel(board, mv)`, `renderBoardSvg(opts)`.

### 2.6. `window.TuoiBacRealtime` (`realtime.js`)
- Kết nối & kiểm tra Supabase: `start()`, `reconnect()`, `getStatus()`, `saveSupabaseConfig(url, anonKey)`, `getSupabaseConfig()`, `testSupabaseConnection(url, anonKey)`, `on(event, fn)`.
- Bàn trà: `joinTableChannel(tableKey, myPeerMeta)`, `leaveTableChannel()`, `sendTableMessage(...)`, `publishTableCustomMeta(...)`.
- Hiện diện & Xã hội: `publishGlobalOnline(peerMeta)`, `getOnlinePeers()`, `publishGroup(groupObj)`, `publishFriendSignal(targetCode, signalObj)`.
- Sao lưu Thẻ Hội Viên: `publishAccountBackup(accountHash, snapshotObj)`, `fetchAccountBackup(accountHash, callback)`.
- Chuyên mục & bền vững: `publishMorningCheckin(...)`, `publishMatchState(...)`, `publishPoem(...)`, `publishTempleRitual(...)`, `publishApprovedArticle(...)`, `getApprovedArticles()`, `publishPhoneticEntry(...)`, `getSharedPhonetics()`, `publishMemberLog(...)`, `publishTelemetryEvent(...)`, `publishSafetyReport(...)`.

---

## 3. Cây Chủ Đề MQTT & 14 Bảng Cơ Sở Dữ Liệu (`supabase_schema.sql`)

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
| Sổ từ điển & Báo cáo an toàn | Đồng bộ qua ứng dụng (lọc chống gói tin độc hại & giới hạn 200 khóa RAM) | `public.phonetic_dictionary`, `public.analytics_events`, `public.safety_reports` (`INSERT`-only cho `anon`, chặn `DELETE` ẩn danh trên cả 14 bảng) |
