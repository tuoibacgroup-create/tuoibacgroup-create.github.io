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
| 9 | Ô Ăn Quan Dân Gian & Đố Vui Minh Mẫn Hôm Nay | Hoàn thành | `app.js`, `realtime.js` | Đấu Máy hoặc Ván treo qua liên kết Zalo, đố vui không trừ điểm người chậm |
| 10 | Chiếu Thơ Lục Bát, Nhạc Đàn Tranh & Gắn Khung Danh Hiệu 3D | Hoàn thành | `app.js`, `tearoom3d.js` | Sáng tác thơ mới đồng bộ thời gian thực, mở khóa khung hào quang 3D |
| 11 | Hội Đồng Ngũ (VD: Đại đội 1K2 · D3 · F25), Kết Bạn & Báo Online | Hoàn thành | `app.js`, `realtime.js` | Lập đơn vị mới, xem đồng đội đang ngồi ở phòng nào và bấm vào ngồi cạnh |
| 12 | Thẻ Hội Viên 10 Giây (SĐT + 4 số) & Khôi Phục Mã QR | Hoàn thành | `app.js`, `realtime.js` | Không mật khẩu phức tạp, băm ẩn SĐT một chiều, hỗ trợ Vân tay WebAuthn |
| 13 | Hệ Thống 96 Danh Hiệu Toán Học Lồi (32 tầng chính + 8 cây chuyên môn) | Hoàn thành | `progression.js`, `app.js` | Tách biệt bảng chào đón Người mới (Tầng 1–5) và vinh danh Trưởng lão / Đại thụ |
| 14 | Chánh Điện 3D Góc Rộng, 10 Bồ Đoàn, Hồ Sen & Cây Thẻ Đỏ | Hoàn thành | `temple3d.js`, `app.js` | Three.js mái chùa đao cong, 3 góc máy, thỉnh chuông, gõ mõ, thả hoa đăng, treo thẻ đỏ |
| 15 | Kho AI Tracking 100% Toàn Thành Viên (`IndexedDB` + Xuất JSONL) | Hoàn thành | `telemetry.js`, `app.js` | Biểu đồ 24h, đo `dwellSec` từng màn hình, tách 4 kiểu chat, xuất `.jsonl`/`.json`/`.csv` |
| 16 | Hồ sơ Kiến trúc Studio 20 Năm & Cổng Kiểm Định Tự Động | Hoàn thành | `AGENTS.md`, `ARCHITECTURE.md`, `scripts/studio-doctor.mjs` | Hệ thống tài liệu phân tầng và script tự kiểm tra 8 cổng kỹ thuật |

---

## 2. Nhật Ký Phiên Bản Kỹ Thuật (Append-Only Engineering Log)

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
