# 03 — Bảng Tiến Độ Tổng Thể, Nhật Ký Phiên Bản & Lộ Trình Tiếp Theo

> **Quy tắc bảo trì (Append-Only):** Khi hoàn thành một bản nâng cấp hoặc sửa lỗi mới, **ghi nối thêm mục mới lên đầu phần Nhật Ký Phiên Bản**, tuyệt đối không xóa hay viết đè lịch sử các phiên bản trước.

---

## 1. Bảng Trạng Thái 16 Phân Hệ Của Game (Cập nhật: 17/11/2026)

| STT | Phân hệ chức năng | Trạng thái | Tệp phụ trách chính | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- | :--- |
| 1 | Trang chủ Mobile-First & Chế độ rút gọn 3 nút MVP | Hoàn thành | `app.js`, `styles.css` | Có cài đặt PWA ra màn hình chính & chuyển đổi chữ 20px/24px |
| 2 | Điểm danh bình an & Bản đồ 34 đơn vị hành chính mới | Hoàn thành | `app.js`, `data.js` | Có chú thích tỉnh cũ gộp vào, xuất thiệp chúc sáng kèm QR + văn bản chia sẻ |
| 3 | Sảnh Trà & Bàn Trà 5 Chỗ (Chuyển Đổi Full 2.5D TLBB / Hybrid 3D+2.5D) | Hoàn thành | `tearoom3d.js`, `assets/tearoom-*`, `app.js` | Bộ 2 chế độ: Full 2.5D cổ điển nhẹ pin (`assets/tearoom-*.jpg` + `tearoom-sprites.webp`) và Hybrid Phòng 3D Xoay + Nhân vật 2.5D Billboard (`28 FPS`), kéo ngang xoay góc |
| 4 | Chủ bàn đặt tên bàn đàm đạo & Gửi 8 Sticker 1 chạm | Hoàn thành | `app.js`, `tearoom3d.js` | Bong bóng Sticker nổi trên đầu nhân vật 3D, đồng bộ qua `custom_tea_tables` |
| 5 | Trợ lý Quán Trà tự gợi chuyện sau 60s & Nhịp nhấp trà 10s | Hoàn thành | `app.js` | Rót trà 3D tự động khi bàn yên ắng quá 60 giây |
| 6 | Nhập liệu giọng nói & Sổ từ điển tự học phương ngữ | Hoàn thành | `app.js`, `data.js` | Xem trước câu nói chữ lớn trước khi gửi, tự sửa lỗi phát âm vùng miền |
| 7 | Tờ Báo Sáng Quán Trà, Tìm kiếm chủ đề & Bàn đàm đạo theo tin | Hoàn thành | `app.js`, `data.js` | Tìm theo từ khóa gợi ý (lương hưu, giá vàng, thời tiết...), nghe đọc báo TTS |
| 8 | Cờ Tướng Chuẩn `9×10` (32 quân) & Giải 6 Cờ Thế Cổ Phổ | Hoàn thành | `xiangqi.js`, `app.js` | AI Alpha-Beta 4 tầng, đấu ván treo bất đồng bộ qua liên kết mời bạn |
| 9 | Ô Ăn Quan Dân Gian (Nhịp Rải Đều 600ms, Khóa Cứng Bàn Cờ & Noti Nổi) | Hoàn thành | `app.js`, `styles.css`, `realtime.js` | Cố định tuyệt đối vị trí bàn cờ (`0px` giật nhảy), rải đều đặn `600ms/viên` không tăng tốc, toàn bộ thông báo ra Noti nổi |
| 10 | Chiếu Thơ Lục Bát, Nhạc Đàn Tranh & Gắn Khung Danh Hiệu 3D | Hoàn thành | `app.js`, `tearoom3d.js` | Sáng tác thơ mới đồng bộ thời gian thực, mở khóa khung hào quang 3D |
| 11 | Hội Đồng Ngũ (VD: Đại đội 1K2 · D3 · F25), Kết Bạn & Báo Online | Hoàn thành | `app.js`, `realtime.js` | Lập đơn vị mới, xem đồng đội đang ngồi ở phòng nào và bấm vào ngồi cạnh |
| 12 | Thẻ Hội Viên 10 Giây (SĐT + 4 số) & Khôi Phục Mã QR | Hoàn thành | `app.js`, `realtime.js` | Không mật khẩu phức tạp, băm ẩn SĐT một chiều, hỗ trợ Vân tay WebAuthn |
| 13 | Hệ Thống 96 Danh Hiệu Toán Học Lồi (32 tầng chính + 8 cây chuyên môn) | Hoàn thành | `progression.js`, `app.js` | Tách biệt bảng chào đón Người mới (Tầng 1–5) và vinh danh Trưởng lão / Đại thụ |
| 14 | Đại Sảnh Chánh Điện 20 Chiếu Bồ Đoàn & Phật Tử Tả Thực Bước Lên Hành Lễ | Hoàn thành | `temple3d.js`, `assets/temple-sprites.webp`, `app.js` | Góc đại cảnh 5 gian 20 chỗ ngồi (`14/20` bác ngồi nhộn nhịp), Phật tử Áo Lam / Áo Nâu bước lên thắp nhang / gõ mõ rồi quay về chỗ |
| 15 | Dash Quản Lý Mọi Hoạt Động User & Mục Góp Ý (`IndexedDB` + AI Tracking) | Hoàn thành | `telemetry.js`, `app.js`, `realtime.js` | Theo dõi On-Time 24h, xếp hạng dịch vụ dùng nhiều nhất, phát hiện phàn nàn từ chat/báo cáo, gửi Góp ý 2 chạm, xuất `.jsonl`/`.json`/`.csv` |
| 16 | Hồ sơ Kiến trúc Studio 20 Năm & Cổng Kiểm Định Đồng Bộ Code ↔ Docs | Hoàn thành | `AGENTS.md`, `ARCHITECTURE.md`, `scripts/studio-doctor.mjs` | Tự động đối chiếu 1:1 màn hình, `state`, SQL, Deep Link và lịch sử Git giữa Code thực tế với `.md` |

---

## 2. Nhật Ký Phiên Bản Kỹ Thuật (Append-Only Engineering Log)

### [2026-11-17] — Tùy Chọn Chuyển Đổi Hai Chế Độ Đồ Họa: Full 2.5D Cổ Điển (TLBB) & Hybrid Phòng 3D Xoay + Nhân Vật 2.5D (`?v=20261117j`)
- **Tệp cập nhật:** `assets/tearoom-table-25d.jpg`, `assets/tearoom-lobby-25d.jpg`, `assets/tearoom-sprites.webp`, `tearoom3d.js`, `app.js`, `styles.css`, `index.html` (`?v=20261117j`), `sw.js` (`tuoibac-pwa-v22`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/05_QUYET_DINH_KIEN_TRUC_ADR.md`.
- **Chi tiết nâng cấp:**
  1. **Tạo bộ tài nguyên Quán Trà 2.5D kiểu Thiên Long Bát Bộ (`assets/`):** Nén 2 nền cảnh đẳng cự không người (`tearoom-table-25d.jpg` `130.1 KB`, `tearoom-lobby-25d.jpg` `143.4 KB`) và Sprite Atlas 3×2 tách nền Chroma-key + mặt nạ nhuộm áo dài/áo bà ba/áo lính/áo len/áo gấm động (`tearoom-sprites.webp` `42.8 KB`, gồm Nam 3/4, Nữ 3/4 và Góc lưng 3/4), vẽ thêm phụ kiện (kính, khăn, mũ, nón lá) và huy hiệu khung danh hiệu theo tọa độ neo.
  2. **Nâng cấp `tearoom3d.js` chạy song song 2 chế độ (`mode === "2.5d"` & `mode === "3d"`):**
     - **Full 2.5D Cổ Điển:** Vẽ cảnh Canvas 2D thuần không cần WebGL cho Sảnh 5 gian (hỗ trợ zoom rộng/siêu rộng + kéo ngang lia góc), Bàn trà 5 ghế (đặt nhân vật khớp ghế, ấm Tử Sa bốc hơi, Trợ lý Chị Trà ra rót trà theo nhịp `4.2s`, đồng bộ đủ `activeSeatIdx`, `userBadge` và bong bóng Sticker) và Tủ Trang Phục Cá Nhân.
     - **Hybrid Phòng 3D Xoay + Nhân Vật 2.5D:** Thay toàn bộ khối Low-Poly hình cầu/trụ cũ bằng nhân vật 2.5D Billboard phẳng trục Y tự quay hướng camera kèm đổi mặt trước/sau theo góc xoay, cho phép kéo ngang xoay góc nhìn 3D ở cả Sảnh, Bàn trà tròn và Cá nhân; dọn triệt để `map.userData.isPerMount` trong `dispose3D()`.
  3. **Thanh chuyển đổi 2 nút to dễ bấm (`styles.css`, `app.js`, `sw.js`):** Thêm `.render-mode-switch` / `.render-mode-opt` (`>= 56px`, chế độ `Full 2.5D · Cổ điển · Nhẹ` vs `Hybrid 3D+2.5D · Xoay góc`) ở Sảnh, Bàn trà, Tủ Trang Phục và thanh mô phỏng `#sim-toggle-render`; ghi telemetry `render_mode_switch` và thêm 3 tệp `assets/tearoom-*` vào `CORE_ASSETS` của `sw.js`.

### [2026-11-17] — Dash Quản Trị Mọi Hoạt Động User (On-Time, Top Dịch Vụ, Phàn Nàn Chat) & Mục Góp Ý Nhanh (`?v=20261117i`)
- **Tệp cập nhật:** `telemetry.js`, `app.js`, `index.html` (`?v=20261117i`), `styles.css`, `realtime.js`, `sw.js` (`tuoibac-pwa-v21`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md`.
- **Chi tiết 2 hạng mục vừa hoàn thành:**
  1. **Nâng cấp Dash Quản Lý Mọi Hoạt Động User (`telemetry.js` → `getGlobalActivityDashboard()`, `app.js` → `renderPrivacyAndMetrics()`):**
     - **Tab `Tổng Quan & Dịch Vụ`:** Tổng hợp 4 KPI toàn quán (Tổng phút On-Time + TB/người + máy đang mở, Dịch vụ dùng nhiều nhất & `%` thời lượng, Tổng câu Chat & tỷ lệ `0-Token`, Số phàn nàn / chặn an toàn / góp ý), biểu đồ nhịp giờ 24h toàn hệ thống, Top 5 người On-Time nhiều nhất và bảng xếp hạng đầy đủ các dịch vụ theo phút & lượt dùng.
     - **Tab `Chat & Phàn Nàn`:** Tự động phân loại 6 nhóm vấn đề (`ui_font`, `speed_bug`, `audio_voice`, `safety_alert`, `feature_wish`, `praise`) từ cả mục Góp ý, báo cáo vi phạm, chuỗi bị bộ lọc an toàn chặn và tin nhắn chat thực tế có dấu hiệu phàn nàn; xếp hạng nhóm phàn nàn nhiều nhất, thống kê 4 kiểu chat / chủ đề / từ khóa tìm báo và bộ lọc chi tiết.
     - **Tab `Hội Viên & Riêng Tư`:** Bổ sung bộ lọc theo từng thành viên (`#dash-member-filter`) và ô tìm kiếm dòng sự kiện (`#dash-log-search`), gắn thêm tracking đủ cho Đố vui, Phòng xem chung, Trợ lý sức khỏe, Đổi cỡ chữ, Đọc to, Báo cáo vi phạm và Tự động chặn SĐT/link. Hỗ trợ mở nhanh qua tham số `?dash=1`.
  2. **Thêm mục `Góp ý nhanh` (`openFeedbackModal()` trong `app.js`):** Đặt nút mở tại Trang chủ (`#btn-home-feedback`), Hồ sơ cá nhân (`#btn-profile-feedback`) và trong Dash (`#btn-dash-open-feedback`) với 5 lựa chọn chạm lớn (`>= 56px`), lọc an toàn SĐT/link, ghi thẳng vào kho `feedbacks` + `IndexedDB` và tặng `+2 Xu` lượt góp ý đầu tiên trong phiên.

### [2026-11-17] — Bảo Vệ Ván Cờ Đang Đánh, Khung Danh Hiệu Chùa & Thắng Cờ, Tối Giản Bố Cục Người Cao Tuổi (`?v=20261117h`)
- **Tệp cập nhật:** `app.js`, `data.js`, `progression.js`, `tearoom3d.js`, `styles.css`, `index.html` (`?v=20261117h`), `sw.js` (`tuoibac-pwa-v20`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md`.
- **Chi tiết 4 hạng mục triển khai & 2 mẫu đối chiếu thiết kế 2.5D:**
  1. **Cảnh báo & Tính THUA khi rời ván Ô ăn quan / Cờ tướng đang đánh dở (`app.js`, `styles.css`):** Theo dõi `inProgress`, `forfeitedPendingReload` và thống kê `user.gameStats` (`oaqWins`, `oaqLosses`, `xiangqiWins`, `xiangqiLosses`, `winStreak`, `bestWinStreak`); hiển thị hộp thoại xác nhận to rõ (`Ở lại đánh tiếp` / `Chấp nhận THUA & Rời đi`) khi chuyển mục, đổi tab/chế độ, xếp lại bàn, bấm Quay lại (`popstate`) hoặc tải lại/đóng trang (`beforeunload` + `pagehide` xử lý tiếp trong `loadState()`), ngoại trừ chế độ Giải Cờ Thế (`mode === "puzzle"`).
  2. **Mở rộng Cây & Khung Danh Hiệu Chánh Điện + Thắng Ván Cờ (`data.js`, `progression.js`, `tearoom3d.js`, `styles.css`, `app.js`):** Bổ sung 2 khung danh hiệu 3D/Thẻ tên `"tam-an"` (*Cư Sĩ Tâm An* — mở ở Hạng III cây `temple_zen`) và `"kien-tuong"` (*Kiện Tướng Dân Gian* — mở khi thắng `>= 3` ván hoặc Hạng III `folk_games`).
  3. **Ẩn công thức toán & thu gọn cài đặt/cây danh hiệu (`app.js`):** Bỏ hộp `.math-formula-box` và chuỗi `formulaNote` khỏi giao diện `Bảng Vinh Danh` (`renderLeaderboard()`); chỉ mở sẵn Giai đoạn hiện tại của người chơi, gộp các giai đoạn khác và 8 bậc `I..VIII` vào thẻ `<details>` bấm mở khi cần; tách phần sửa Tên · Tuổi ra tab riêng trong `Cá Nhân` thay vì bày ra Trang Chủ.
  4. **Đại rà soát bố cục thân thiện người cao tuổi với Thanh Điều Hướng Đáy 4 Mục (`index.html`, `styles.css`, `app.js`):** Gắn thanh `.bottom-nav` cố định đáy (`Sảnh chính` · `Quán trà` · `Đánh cờ` · `Cá nhân`), tái cấu trúc `Trang Chủ` thành 3 vùng không trùng lặp (Thẻ tóm tắt, 4 Việc Chính, 6 Góc Phụ + 2 nút tiện ích), chia `Cá Nhân` thành 2 tab (`Tủ Trang Phục & Đồ Bày` chọn theo 4 nhóm ngay dưới sân khấu thử đồ vs `Đổi Tên · Tuổi & Thẻ QR`), và thu gọn danh sách bạn cùng bàn + 2 tab giao tiếp tại bàn trà.
  5. **Bộ 2 ảnh mẫu đối chiếu nâng cấp Quán Trà sang 2.5D (`so_sanh_2_phuong_an_25d.md`):** Hoàn thiện 2 bản mẫu trực quan giữ đúng 5 ghế/trang phục hiện tại của ứng dụng (Phương án 1: *Full 2.5D Isometric kiểu Thiên Long Bát Bộ* và Phương án 2: *Hybrid Phòng 3D + Nhân vật 2.5D Sprite*) để Chủ dự án duyệt trước khi chỉnh mã dựng hình `tearoom3d.js`.

### [2026-11-17] — Kiểm Thử Toàn Diện 16 Màn Hình & Vá Triệt Để 8 Lỗi Tiềm Ẩn (`?v=20261117g`)
- **Tệp cập nhật:** `app.js`, `temple3d.js`, `styles.css`, `index.html` (`?v=20261117g`), `sw.js` (`tuoibac-pwa-v19`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md`.
- **8 lỗi thực tế đã phát hiện và xử lý dứt điểm:**
  1. **Kẹt lượt `turn = "ai"` trong Ô Ăn Quan khi F5 / chuyển tab / rời màn hình:** Bổ sung tự phục hồi lượt `"host"` trong `loadState()`, `renderOaqTab()` và chốt nước đi Máy đồng bộ trong `cancelOrCommitOaqAnimation(true)` khi chuyển sang tab `Cờ tướng 9×10` hoặc thoát màn hình.
  2. **Thiếu luật tàn cuộc kéo quân khi cả 2 Quan đều hết & thưởng Xu thắng ván:** Đồng bộ trong cả `executeOaqMove()` lẫn `buildOaqMoveTimeline()` (`sweep_end`) để thu toàn bộ quân Dân còn lại về giỏ hai bên khi `cells[5] === 0 && cells[11] === 0`, kèm `finishOaqGameIfEnded()` thông báo tỷ số và cộng `+5 Xu` nếu thắng.
  3. **Dính chữ số với nhãn `Ô1..Ô11` và nhảy chiều cao nút dưới bàn Ô Ăn Quan:** Đưa `.oaq-count-num` lên đỉnh ô, hốc sỏi SVG ở giữa, `<small>Ôx</small>` xuống đáy ô giống `.oaq-quan` trong `styles.css`, đồng thời giữ cố định 2 hàng nút dưới `.oaq-score-tray`.
  4. **Lỗi Falsy-Zero khi ngồi Chiếu Bồ Đoàn số 1 (`BĐ 1`, `userCushionIdx = 0`):** Sửa toàn bộ biểu thức `|| 7` / `|| 2` trong `temple3d.js` (`rebuildTwentySeatActors`, `findActorIndexBySpeaker`) và `app.js` (`loadState`, `buildTempleTenCushionAttendees`, `syncMyGlobalOnlinePresence`) để chỉ hiện duy nhất 1 nhãn `BĐ1·Bạn` và không gán nhầm hành trình đi bộ khi đổi chiếu.
  5. **Thiếu bộ lọc an toàn SĐT / link lạ trên Sớ Cầu An (`#temple-prayer-in`):** Gọi `cleanAndApplyDictionary()` chặn SĐT >= 8 số, link và từ khóa nhạy cảm ngay đầu `publishWishOrIncense()`.
  6. **Cập nhật Chánh Điện tại chỗ không làm mất khói hương / sóng âm:** Bổ sung `TempleScene3D.updateConfig()` và tách `#peace-card-host`, `#temple-prayers-list-host` để rút quẻ, gửi sớ, đổi chiếu hay nhận gói tin `RT.on("temple")` / `RT.on("online")` không phải dựng lại `<canvas>`.
  7. **Khớp chính xác người hành lễ qua mạng trong `findActorIndexBySpeaker()`:** Cắt hậu tố tuổi (`"Chị Lan · 68t"`) và dùng `preferredCushionIdx` để đúng bác đạo hữu đó bước đi thắp nhang thay vì kéo nhầm nhân vật người dùng.
  8. **Chống tràn ô nhập Sớ trên `390px` & sửa nút `"Đọc to"` (`buildCurrentScreenSpeech`):** Thêm `min-width: 0` + `flex-wrap: wrap` cho `#temple-prayer-in`; sửa `state.newspaper.articles`, `!state.quiz.finished`, và bổ sung lời đọc to rõ ràng cho hai màn hình `games` và `zen`.

### [2026-11-17] — Khóa Cứng Bàn Ô Ăn Quan Nhịp Đều 600ms + Đại Sảnh Chánh Điện 20 Bồ Đoàn Có Phật Tử Tả Thực Bước Lên Hành Lễ (`?v=20261117f`)
- **Tệp tạo mới / cập nhật:** `assets/temple-wide.jpg`, `assets/temple-sprites.webp` (`44 KB`), `temple3d.js`, `app.js`, `styles.css`, `index.html` (`?v=20261117f`), `sw.js` (`tuoibac-pwa-v18`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md`, `docs/05_QUYET_DINH_KIEN_TRUC_ADR.md`.
- **Chi tiết kỹ thuật theo 2 hạng mục:**
  1. **Ô Ăn Quan — Nhịp rải chậm đều `600ms/viên`, khóa cứng `0px` vị trí bàn cờ & gom toàn bộ thông báo sang Noti nổi (`app.js`, `styles.css`):**
     - Bỏ cơ chế tăng tốc sau 10 viên; đặt nhịp thả cố định **`600ms/viên`** đều đặn từ đầu tới cuối lượt (`pickup`: `560ms`, `pickup_chain`: `720ms`, `capture`: `800ms`) giúp mắt người lớn tuổi theo dõi từng viên sỏi rơi rất êm.
     - Loại bỏ toàn bộ các thanh chữ động nằm trên/dưới bàn cờ từng gây đẩy nhảy khung hình (`oaq-hand-live-bar` và đoạn `<p>` trạng thái); khóa chiều cao 1 dòng cho khay quân ăn được (`.oaq-basket-pebbles` `height: 22px; flex-wrap: nowrap`), chuyển bộ đếm `Trên tay: X viên` thành huy hiệu nổi `position: absolute` trên viền gỗ và chuyển tất cả thông báo bốc quân / ăn quân / đổi lượt sang **Toast Noti nổi tự tắt**.
  2. **Đại Sảnh Chánh Điện 20 Chiếu Bồ Đoàn & Phật Tử Áo Lam / Áo Nâu Tả Thực Bước Lên Thắp Nhang / Gõ Mõ (`temple3d.js`, `assets/temple-sprites.webp`, `app.js`):**
     - Nâng cấp ảnh nền sang **Đại Sảnh Chùa Cổ 5 Gian góc siêu rộng** với nền gạch Bát Tràng thoáng đãng chứa đủ **20 Chiếu Bồ Đoàn (`4 hàng × 5 chỗ`, luôn có ~14 bác ngồi nhộn nhịp)**.
     - Trích xuất nền xanh chuẩn phòng thu (Chroma-key + khử ám xanh + cân chỉnh ánh nến ấm) bộ **9 Sprite nhiếp ảnh tả thực nhìn từ sau lưng** (`cushion`, nam/nữ mặc Áo Lam và Áo Nâu ở tư thế ngồi tĩnh tọa và đứng hành lễ) đóng gói gọn trong 1 tệp `assets/temple-sprites.webp` chỉ `44 KB`.
     - Xây dựng bộ diễn hoạt đường cong Bezier lối đi (`startActorRitualWalk` + Painter's Algorithm theo chiều sâu `Y`): khi bác (hoặc các đạo hữu trong sảnh) bấm **Lên Dâng Hương / Lên Gõ Mõ / Lên Thỉnh Chuông / Xin Xăm**, nhân vật đứng dậy rời chiếu, bước nhịp nhàng theo lối đi lên trước Lư hương / Mõ gỗ / Đại Hồng Chung, cúi đầu vái lễ 3 nhịp rồi bước quay về ngồi lại trên chiếu. Khi bật **Tự Động Gõ Mõ**, nhân vật bước lên đứng cạnh Mõ gỗ gõ đều nhịp cho tới khi bác bấm về chiếu.

### [2026-11-17] — Chuyển Sang Nhiếp Ảnh Chùa Cổ Chân Thực Trang Nghiêm & Hoạt Cảnh Rải Sỏi Ô Ăn Quan Từng Viên Một (`?v=20261117e`)
- **Tệp tạo mới / cập nhật:** `assets/temple-wide.jpg`, `assets/temple-altar.jpg`, `assets/temple-courtyard.jpg`, `temple3d.js`, `app.js`, `styles.css`, `index.html` (`?v=20261117e`), `sw.js` (`tuoibac-pwa-v17`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`, `docs/05_QUYET_DINH_KIEN_TRUC_ADR.md`.
- **Lý do & Chi tiết kỹ thuật:**
  1. **Loại bỏ hoàn toàn nét vẽ hoạt hình trẻ con tại Chánh Điện — Chuyển sang Nhiếp Ảnh Kiến Trúc Chùa Cổ Việt Nam + Lớp Ánh Sáng & Khói Trầm Vật Lý (`temple3d.js`, `assets/temple-*.jpg`):**
     - Thay vì tự vẽ tượng Phật, cột chùa và nhân vật bằng hình khối vector/3D trông giả và trẻ con, hệ thống sử dụng 3 bức ảnh kiến trúc Chùa Cổ Bắc Bộ độ phân giải cao đã nén tối ưu (`128–163 KB/ảnh`, đệm ngoại tuyến trong `sw.js`): **Toàn cảnh Chánh Điện chiếu cói**, **Cận cảnh Tam Bảo - Đại Hồng Chung - Mõ gỗ - Ống xăm**, và **Sân gạch Bát Tràng - Hồ Sen Hoa Đăng - Cây Bồ Đề Thẻ Đỏ**.
     - Trên nền ảnh thật, `temple3d.js` phủ lớp ánh sáng vật lý (`globalCompositeOperation = "screen"`) làm ngọn đèn dầu lưu ly và hào quang thở nhẹ tự nhiên, khói trầm mảnh mai uốn lượn bay lên từ đúng đầu 3 nén nhang trong ảnh, hạt bụi nắng li ti, vòng sóng âm vàng kim và vùng chạm chính xác lên từng pháp khí mà không có bất kỳ nhãn chữ hay hình người hoạt hình nào che khuất Tam Bảo.
  2. **Sỏi Cuội Suối Tự Nhiên 3D & Hoạt Cảnh Rải Sỏi Từng Viên Qua Từng Ô Trong Ô Ăn Quan (`app.js`, `styles.css`):**
     - Đổi bảng màu sỏi từ các màu pastel tươi sang **4 chất liệu đá cuội suối thật** (`radialGradient` thạch anh trắng ngà, đá bazan đen bóng, sỏi nâu cát sông, đá phiến xám tro và đá Quan hổ phách) nằm trong hốc bàn **Gỗ Hương chạm khắc trầm ấm**.
     - Xây dựng bộ máy diễn hoạt `buildOaqMoveTimeline(...)` + `runOaqSowingAnimation(...)`: khi bác chọn 1 ô (ví dụ có `5` viên sỏi) và bấm rải sang Trái hoặc Phải, bàn cờ diễn hoạt đúng như ngoài đời thật — bốc sỏi lên tay (`Trên tay: 5 viên`), lần lượt thả **từng viên một (`270ms/viên`)** vào từng ô kế tiếp kèm hiệu ứng viên sỏi mới rơi nảy nhẹ vào hốc gỗ (`@keyframes oaqPebbleDropIn`), nhãn `+1` và tiếng sỏi chạm gỗ; nếu gặp ô có quân thì tự động dừng nhịp `360ms` bốc nối tiếp rải tiếp; nếu gặp ô trống thì diễn hoạt nhịp **chập ô trống — ăn quân** bỏ vào khay. Lượt của Máy cũng rải từng viên một để các bác dễ dàng quan sát.

### [2026-11-17] — Nâng Cấp Bàn Ô Ăn Quan Sỏi Cuội Thực Tế 1:1 & Tái Thiết Chánh Điện Online Phong Cách TikTok Live (`?v=20261117d`)
- **Tệp cập nhật:** `app.js`, `temple3d.js`, `styles.css`, `index.html` (`?v=20261117d`), `sw.js` (`tuoibac-pwa-v16`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `docs/03_TIEN_DO_VA_NHAT_KY.md`.
- **Chi tiết 2 hạng mục nâng cấp lớn:**
  1. **Bàn Ô Ăn Quan bằng gỗ khắc hốc kèm viên sỏi cuội thực tế 1:1 (`app.js`, `styles.css`):**
     - Thiết kế lại bàn cờ `.oaq-board` theo chất liệu gỗ trắc khắc hốc lõm tự nhiên kèm 2 khay tre đựng quân đã ăn (`oaq-score-tray`) cho cả Hàng trên và Hàng dưới.
     - Bổ sung hàm `renderOaqCellPebblesSvg(count, isQuan, cellSeed)` và `computePebblePositions(...)` vẽ chính xác từng viên sỏi cuội nhỏ (đủ 6 sắc độ đá tự nhiên, bóng đổ và điểm phản quang) với **số lượng viên sỏi khớp 1:1 tuyệt đối với con số hiển thị trong từng ô** (kể cả viên Đá Quan lớn trong 2 ô Quan bán nguyệt và các viên sỏi trong khay quân ăn được).
  2. **Tái thiết hoàn toàn Chánh Điện Online theo phong cách TikTok Live (`tiktok-live-temple-rpc` / Chùa Linh Ứng Online 2.5D trong `temple3d.js`, `app.js`):**
     - Thay thế các khối hình trụ/nón 3D thô và các nhãn chữ to che khuất màn hình bằng **Engine Đồ Họa Chánh Điện 2.5D & Hạt Ánh Sáng Cao Cấp (28 FPS)**: Gian Tam Bảo cửa võng son thếp vàng, Hoành phi - Câu đối, đèn lồng cung đình, Tượng Phật Vàng ngồi đài sen hồng 3 tầng với gương mặt từ bi và Hào quang Mandala 12 cánh sen xoay chậm.
     - Vẽ 10 Chiếu Bồ Đoàn thêu hoa sen cùng các Phật tử mặc Áo Lam / Áo Tràng chắp tay thực hiện **động tác cúi lạy 3 nhịp uyển chuyển** khi hành lễ; bảng tên nhỏ gọn gắn ngay sát đế chiếu không bao giờ đè lên nhau hay che tượng Phật.
     - Hỗ trợ **chạm trực tiếp lên màn hình Chánh Điện** (vào Mõ gỗ, Đại Hồng Chung, Lư hương, Ống xăm tre, Hồ sen cá Koi, Cây Bồ Đề thẻ đỏ, hoặc từng Chiếu Bồ Đoàn), bổ sung chế độ **Bật Tự Động Gõ Mõ Đều Nhịp (Auto Mõ)** bay chữ vàng **`+1 Tâm An`**, dải sớ cầu nguyện chạy trực tiếp và nút nghe giọng đọc AI (TTS) xướng lời cầu an.

### [2026-11-17] — Tổng Rà Soát Toàn Hệ Thống, Vá Lỗi Xóa Vault, Rò Rỉ WebGL/Event & Khớp API Export
- **Tệp cập nhật:** `app.js`, `tearoom3d.js`, `temple3d.js`, `realtime.js`, `styles.css`, `index.html` (`?v=20261117c`), `sw.js` (`tuoibac-pwa-v15`), `ARCHITECTURE.md`, `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md`, `scripts/studio-doctor.mjs`.
- **Chi tiết 5 lỗi kỹ thuật vừa phát hiện và xử lý triệt để:**
  1. **Xóa dữ liệu NĐ 13/2023 & Reset Demo:** Bổ sung xóa `VAULT_BACKUP_KEY` (`_vault_bak`), gọi `RT.clearGlobalOnline()` trong `wipeMyCloudData()` và dọn `IndexedDB` khi đặt lại dữ liệu mẫu, tránh tình trạng bản sao dự phòng tự khôi phục dữ liệu cũ sau khi người dùng đã chọn xóa vĩnh viễn.
  2. **Rò rỉ bộ nhớ & Event Listener 3D:** Bổ sung gỡ `boundMouseMove` / `boundMouseUp` trong `TempleScene3D.dispose()`, thêm `scene.traverse(...)` giải phóng Geometry/Material và xóa `window.onpointermove/up` trong `TeaRoomScene.dispose()`.
  3. **Thoát chuỗi HTML trong nhãn nổi 3D (XSS Hardening):** Thêm `escHtml()` cho mọi nhãn bảng tên 3D/2.5D và banner nổi nhận tên bàn/tên người dùng từ mạng công cộng.
  4. **Giới hạn `seenMsgIds` & Chuẩn hóa lưới nút / thanh đầu trang ở chế độ Chữ to 24px:** Đặt trần `seenMsgIds` tại `800` phần tử trong `realtime.js`; dùng `clamp(16px, 0.88rem, 18px)` trên `.app-topbar` (ngăn nút `Quay về` đè nút `Đọc to`), cho phép `.user-strip` tự xuống hàng khi cần, và chuyển `.room-strip` + `.tab-bar` sang bố cục xuống dòng (`flex-wrap: wrap`) để toàn bộ 6 phòng và các tab chức năng hiển thị trọn vẹn trong `390px` ngay cả khi bật **Chữ to 24px** (`0` nút chồng đè, `0` nút tràn ngang, `0` nút cao dưới `56px`).
  5. **Chuẩn hóa 100% tên hàm API thực tế:** Cập nhật đúng tên hàm export của `tearoom3d.js` (`exportPostcardPng`, `toggleOverviewWide`) và `xiangqi.js` (`pickAiMove`, `applyMoveClone`, `getAllLegalMoves`, `formatMoveLabel`) vào `docs/02` và khóa kiểm tra tự động trong Cổng 7G/7H của `studio-doctor.mjs`.

### [2026-11-17] — Bổ sung Bất Biến #11 & Cổng Kiểm Định Đồng Bộ Sâu Code ↔ Docs (`9/9 PASS`)
- **Tệp cập nhật:** `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`, `docs/01..04_*.md`, `scripts/studio-doctor.mjs`.
- **Lý do & Nội dung:** Thiết lập quy tắc bắt buộc đồng bộ hai chiều giữa mã nguồn thực tế và toàn bộ tệp `.md` trong cùng một lượt sửa. Nâng cấp `scripts/studio-doctor.mjs` lên **9 cổng kiểm định**: tự động bóc tách 16 `route`, 7 namespace `window.*`, 20 khóa gốc `state`, 14 bảng SQL, 8 tham số URL Deep Link, phiên bản `sw.js` và lịch sử Git để chặn ngay nếu sửa code mà chưa cập nhật tài liệu tiến độ/kiến trúc.

### [2026-11-17] — Thiết lập Hệ Thống Quản Trị Kỹ Thuật Chuẩn Game Studio 20 Năm
- **Tệp tạo mới / cập nhật:** `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`, `docs/01..05_*.md`, `scripts/studio-doctor.mjs`, `verify.bat`, `styles.css`, `app.js`, `index.html` (`?v=20261117b`), `sw.js` (`v14`).
- **Lý do & Nội dung:** Chuẩn hóa toàn bộ bản đồ kiến trúc, hợp đồng dữ liệu `state`, 6 hồ sơ quyết định kiến trúc (ADR), cẩm nang sửa lỗi nhanh và trình kiểm định tự động 8 cổng chất lượng (`8/8 PASS`). Qua Cổng 6, phát hiện và khắc phục lỗi biến `--base-size: 24px` trên thẻ `html.xl-font` để toàn bộ đơn vị `rem` phóng to đồng bộ lên chuẩn `24px` khi bật chế độ Chữ to.

### [2026-11-17] — `commit 4ed1704`: Hệ Thống 96 Danh Hiệu Toán Học, AI Tracking 100% & Chánh Điện 3D Góc Rộng
- **Tệp tạo mới / cập nhật:** `progression.js`, `telemetry.js`, `temple3d.js`, `app.js`, `realtime.js`, `styles.css`, `index.html`, `sw.js` (`v13`), `supabase_schema.sql`.
- **Lý do & Nội dung:**
  - Triển khai công thức toán học lồi cho 32 tầng thâm niên chính thức và 8 cây danh hiệu chuyên môn (64 bậc).
  - Xây dựng kho `IndexedDB` (`tuoibac_telemetry_db_v1`) lưu không giới hạn 100% hành vi giờ giấc, thời lượng màn hình và thói quen chat, hỗ trợ xuất `.jsonl` huấn luyện AI.
  - Nâng cấp Chánh Điện từ Canvas 2D lên không gian **Three.js 3D góc rộng** gồm mái chùa cổ 2 tầng, 10 chiếu Bồ Đoàn chọn chỗ ngồi, sân Hồ Sen hoa đăng và Cây Ước Nguyện treo thẻ đỏ.

### [2026-11-16] — `commit 147d1dc`: Chủ Bàn Đặt Tên Bàn Trà, Khay 8 Sticker, Góc Rộng Sảnh 5 Gian & Nền Tảng Chánh Điện
- **Tệp cập nhật:** `data.js`, `tearoom3d.js`, `realtime.js`, `app.js`, `styles.css`, `supabase_schema.sql`.
- **Lý do & Nội dung:** Cho phép hội viên làm Chủ bàn tự đặt tên bàn đàm đạo, thêm 8 nút gửi Sticker 1 chạm có bong bóng nổi trên nhân vật 3D, mở rộng góc nhìn sảnh 5 gian hình chữ U và thiết lập bộ lưu trữ dự phòng kép `_vault_bak`.

### [2026-11-16] — `commit 77ad11d`: Hội Đồng Ngũ (Đại Đội 1K2 · D3 · F25), Kết Bạn 1 Chạm & Thẻ Hội Viên 10 Giây
- **Tệp cập nhật:** `data.js`, `realtime.js`, `app.js`, `styles.css`, `supabase_schema.sql`.
- **Lý do & Nội dung:** Xây dựng hệ thống lập đơn vị đồng ngũ / câu lạc bộ, đèn báo bạn Đang Online toàn quán (bấm nhảy thẳng tới bàn bạn đang ngồi) và cơ chế đăng ký/khôi phục bằng SĐT + 4 số dễ nhớ kèm Ảnh Thẻ QR.

### [2026-11-16] — `commit f3a2909`: Bàn Cờ Tướng Chuẩn `9×10` (32 Quân) & 6 Thế Cờ Cổ Phổ
- **Tệp tạo mới / cập nhật:** `xiangqi.js`, `app.js`, `styles.css`, `index.html`, `sw.js`.
- **Lý do & Nội dung:** Hoàn thiện bộ máy luật Cờ Tướng đầy đủ, AI đối thủ câu lạc bộ 4 tầng và 6 thế cờ giải đố tích hợp cả màn hình riêng lẫn ngay trong Phòng Cờ của Quán Trà.

---

## 3. Lộ Trình Mở Rộng Tiếp Theo (Backlog Giai Đoạn Tới & Điểm Chờ Duyệt)

1. **Kết nối khóa Supabase cố định (Tùy chọn vận hành):** Hiện hệ thống đã chạy trực tuyến nhiều máy thật qua cụm `MQTT over WSS` miễn phí 0 cấu hình; khi lượng người dùng đồng thời tăng cao, chỉ cần chạy `supabase_schema.sql` trên tài khoản Supabase của dự án và điền `url` + `anonKey` để lưu vĩnh viễn toàn bộ bảng SQL trên đám mây riêng.
2. **Bảng Quản Trị Viên (Admin Web Console riêng):** Tách giao diện duyệt bản nháp RSS báo sáng, xem thống kê nhiệt độ hoạt động 24h toàn cộng đồng và quản lý báo cáo an toàn sang một mật khẩu quản trị riêng.
3. **Sự kiện Giải Cờ Tướng Giao Hữu Cuối Tuần Theo Đơn Vị Đồng Ngũ:** Ghép cặp tự động giữa các hội/đơn vị vào sáng Chủ Nhật hàng tuần để tăng tính gắn kết dài hạn.
4. **Cân chỉnh tham số công thức danh hiệu thực tế:** Theo dõi dữ liệu từ kho `telemetry.js` sau 2–4 tuần người thật sử dụng để quyết định giữ mốc Tầng 32 ở `23.008 XP` hay nới lên `50.000 XP`.
