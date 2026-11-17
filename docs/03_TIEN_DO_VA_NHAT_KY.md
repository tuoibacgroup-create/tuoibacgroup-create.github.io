# 03 — Bảng Tiến Độ Tổng Thể, Nhật Ký Phiên Bản & Lộ Trình Tiếp Theo

> **Quy tắc bảo trì (Append-Only):** Khi hoàn thành một bản nâng cấp hoặc sửa lỗi mới, **ghi nối thêm mục mới lên đầu phần Nhật Ký Phiên Bản**, tuyệt đối không xóa hay viết đè lịch sử các phiên bản trước.

---

## 1. Bảng Trạng Thái 16 Phân Hệ Của Game (Cập nhật: 17/11/2026)

| STT | Phân hệ chức năng | Trạng thái | Tệp phụ trách chính | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- | :--- |
| 1 | Trang chủ Mobile-First & Chế độ rút gọn 3 nút MVP | Hoàn thành | `app.js`, `styles.css` | Có cài đặt PWA ra màn hình chính & chuyển đổi chữ 20px/24px |
| 2 | Điểm danh bình an & Bản đồ 34 đơn vị hành chính mới | Hoàn thành | `app.js`, `data.js` | Có chú thích tỉnh cũ gộp vào, xuất thiệp chúc sáng kèm QR + văn bản chia sẻ |
| 3 | Sảnh Trà 3D 5 Gian Góc Rộng & Bàn Trà 5 Chỗ | Hoàn thành | `tearoom3d.js`, `app.js` | Xoay ngang góc nhìn, 2 mức zoom rộng/siêu rộng, tự hạ 2.5D cho máy yếu |
| 4 | Chủ bàn đặt tên bàn đàm đạo & Gửi 8 Sticker 1 chạm | Hoàn thành | `app.js`, `tearoom3d.js` | Bong bóng Sticker nổi trên đầu nhân vật 3D, đồng bộ qua `custom_tea_tables` |
| 5 | Trợ lý Quán Trà tự gợi chuyện sau 60s & Nhịp nhấp trà 10s | Hoàn thành | `app.js` | Rót trà 3D tự động khi bàn yên ắng quá 60 giây |
| 6 | Nhập liệu giọng nói & Sổ từ điển tự học phương ngữ | Hoàn thành | `app.js`, `data.js` | Xem trước câu nói chữ lớn trước khi gửi, tự sửa lỗi phát âm vùng miền |
| 7 | Tờ Báo Sáng Quán Trà, Tìm kiếm chủ đề & Bàn đàm đạo theo tin | Hoàn thành | `app.js`, `data.js` | Tìm theo từ khóa gợi ý (lương hưu, giá vàng, thời tiết...), nghe đọc báo TTS |
| 8 | Cờ Tướng Chuẩn `9×10` (32 quân) & Giải 6 Cờ Thế Cổ Phổ | Hoàn thành | `xiangqi.js`, `app.js` | AI Alpha-Beta 4 tầng, đấu ván treo bất đồng bộ qua liên kết mời bạn |
| 9 | Ô Ăn Quan Dân Gian (Bàn Gỗ & Sỏi Cuội Thực Tế 1:1) & Đố Vui | Hoàn thành | `app.js`, `styles.css`, `realtime.js` | Bàn gỗ khắc hốc hiển thị số kèm đúng số lượng viên sỏi cuội thực tế 1:1 & khay tre đựng quân ăn được |
| 10 | Chiếu Thơ Lục Bát, Nhạc Đàn Tranh & Gắn Khung Danh Hiệu 3D | Hoàn thành | `app.js`, `tearoom3d.js` | Sáng tác thơ mới đồng bộ thời gian thực, mở khóa khung hào quang 3D |
| 11 | Hội Đồng Ngũ (VD: Đại đội 1K2 · D3 · F25), Kết Bạn & Báo Online | Hoàn thành | `app.js`, `realtime.js` | Lập đơn vị mới, xem đồng đội đang ngồi ở phòng nào và bấm vào ngồi cạnh |
| 12 | Thẻ Hội Viên 10 Giây (SĐT + 4 số) & Khôi Phục Mã QR | Hoàn thành | `app.js`, `realtime.js` | Không mật khẩu phức tạp, băm ẩn SĐT một chiều, hỗ trợ Vân tay WebAuthn |
| 13 | Hệ Thống 96 Danh Hiệu Toán Học Lồi (32 tầng chính + 8 cây chuyên môn) | Hoàn thành | `progression.js`, `app.js` | Tách biệt bảng chào đón Người mới (Tầng 1–5) và vinh danh Trưởng lão / Đại thụ |
| 14 | Chánh Điện Online 2.5D Phong Cách TikTok Live, 10 Bồ Đoàn, Hồ Sen & Cây Thẻ Đỏ | Hoàn thành | `temple3d.js`, `app.js` | Gian Tam Bảo tranh vẽ 2.5D sắc nét, Phật tử áo lam vái lạy, Auto-Mõ bay chữ `+1 Tâm An`, lắc ống xăm, chạm trực tiếp trên màn hình |
| 15 | Kho AI Tracking 100% Toàn Thành Viên (`IndexedDB` + Xuất JSONL) | Hoàn thành | `telemetry.js`, `app.js` | Biểu đồ 24h, đo `dwellSec` từng màn hình, tách 4 kiểu chat, xuất `.jsonl`/`.json`/`.csv` |
| 16 | Hồ sơ Kiến trúc Studio 20 Năm & Cổng Kiểm Định Đồng Bộ Code ↔ Docs | Hoàn thành | `AGENTS.md`, `ARCHITECTURE.md`, `scripts/studio-doctor.mjs` | Tự động đối chiếu 1:1 màn hình, `state`, SQL, Deep Link và lịch sử Git giữa Code thực tế với `.md` |

---

## 2. Nhật Ký Phiên Bản Kỹ Thuật (Append-Only Engineering Log)

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
