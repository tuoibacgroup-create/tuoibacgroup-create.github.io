# 05 — Hồ Sơ Quyết Định Kiến Trúc (Architecture Decision Records — ADRs)

Tài liệu này lưu lại **lý do cốt lõi (Why)** đằng sau 6 quyết định kỹ thuật quan trọng nhất của dự án **Tuổi Bạc**, giúp các lập trình viên và AI Agent về sau hiểu rõ bối cảnh, ưu nhược điểm và không vô tình quay lại các phương án đã bị loại bỏ.

---

## ADR-001: Kiến Trúc Vanilla JS Đa Module Không Qua Bước Biên Dịch (Zero-Bundler Static PWA)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Chủ dự án cần duyệt trực tiếp trên điện thoại thật 24/7 qua GitHub Pages miễn phí, khởi động tức thì ở máy cục bộ bằng 1 cú nhấp chuột mà không phụ thuộc chuỗi công cụ `node_modules` nặng nề dễ gãy phiên bản.
- **Quyết định:** Chia mã nguồn thành các tệp `.js` độc lập theo miền nghiệp vụ (`data.js`, `progression.js`, `telemetry.js`, `tearoom3d.js`, `temple3d.js`, `xiangqi.js`, `realtime.js`, `app.js`), mỗi tệp đóng gói bằng IIFE xuất ra một namespace duy nhất trên `window`, nạp tuần tự qua `<script defer>`.
- **Phương án đã cân nhắc & loại bỏ:**
  - *React / Next.js / Vite:* Tốt cho đội ngũ frontend lớn nhưng đòi hỏi bước build CI/CD, dễ sinh lỗi lệch phiên bản gói phụ thuộc khi chuyển giao qua nhiều thế hệ AI khác nhau, và làm Chủ dự án khó chạy kiểm tra trực tiếp không cần lệnh build.
- **Hệ quả:** Bất kỳ AI nào cũng đọc và sửa trực tiếp tệp gốc mà không lo lệch bản build; đổi lại cần tuân thủ nghiêm ngặt thứ tự nạp script và cập nhật `?v=...` (đã được tự động hóa kiểm tra bởi `scripts/studio-doctor.mjs`).

---

## ADR-002: Đồ Họa 3D Họa Tiết Thủ Tục (Procedural CanvasTextures) + Tự Hạ Cấp 2.5D
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Người cao tuổi thường dùng mạng 4G dung lượng thấp hoặc Wi-Fi yếu; nếu tải mô hình `.glb`/`.gltf` và ảnh họa tiết ngoài hàng chục MB cho Sảnh Trà 5 Gian và Chánh Điện 3D, trang sẽ chờ tải rất lâu hoặc lỗi mạng.
- **Quyết định:** Dựng hình học Low-Poly trực tiếp bằng Three.js kết hợp họa tiết vẽ tự động bằng `CanvasTexture` ngay trong bộ nhớ (sàn gỗ, chiếu cói, gạch Bát Tràng, gạch bông Đông Dương, mái ngói mũi hài, hoành phi), đồng thời khóa `28 FPS` và có nhánh dự phòng `2.5D Canvas` khi máy không hỗ trợ WebGL.
- **Hệ quả:** Tải toàn bộ cả hai không gian 3D (Quán Trà + Chánh Điện) tốn `0 KB` tệp mô hình ngoài, mở lên tức thì trong chưa đầy 1 giây và không bao giờ gặp lỗi `404` mất ảnh kết cấu.

---

## ADR-003: Mạng Thời Gian Thực 3 Lớp Tự Chuyển Đổi (BroadcastChannel + MQTT WSS + Supabase)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Hai điện thoại thật mở đường dẫn `tuoibacgroup-create.github.io` phải nhìn thấy nhau ngay lập tức trong bàn trà, đánh cờ treo và thỉnh chuông chung ngay cả khi chưa tạo máy chủ trả phí.
- **Quyết định:** Xây dựng `realtime.js` hoạt động đa lớp:
  1. `BroadcastChannel` đồng bộ tức thì `0ms` giữa các tab trên cùng trình duyệt.
  2. Cụm `MQTT over WSS` công cộng có dự phòng tự động (`emqx.io` → `hivemq.com`) giúp các điện thoại khác mạng 4G/Wi-Fi thấy nhau ngay từ giây đầu mà không cần cấu hình khóa.
  3. Khi điền cấu hình `Supabase` (gói miễn phí PostgreSQL + Realtime), hệ thống tự nâng cấp sang lưu trữ bảng quan hệ lâu dài theo `supabase_schema.sql`.
- **Hệ quả:** Ứng dụng chạy thực tế đa thiết bị 24/7 với chi phí vận hành ban đầu bằng `0`, đồng thời sẵn sàng mở rộng lên cơ sở dữ liệu đám mây riêng bất cứ lúc nào mà không phải viết lại giao diện.

---

## ADR-004: Định Danh "Thẻ Hội Viên 10 Giây" Băm Một Chiều & Ảnh Thẻ QR Khôi Phục
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Người trên 60 tuổi rất hay quên mật khẩu phức tạp (chữ hoa, ký tự đặc biệt) và ngại chờ tin nhắn OTP phức tạp, nhưng vẫn cần giữ lại danh hiệu, bạn bè và đơn vị đồng ngũ khi đổi điện thoại.
- **Quyết định:**
  - Cho phép vào chơi tự do ở `Bậc 0 · Khách Ghé Hiên Trà` không rào cản; khuyến khích đăng ký bằng quyền lợi thăng thẳng lên `Tầng 1 · Tân Khách Mộc Mạc` (`+35 XP`, `+15 Xu`).
  - Khóa tài khoản tạo từ `SHA-256 / FNV` một chiều của `(Số điện thoại chuẩn hóa + Mã nhớ 4 số dễ thuộc như năm sinh/năm nhập ngũ)`. Tuyệt đối không lưu số điện thoại thô lên đám mây.
  - Xuất sẵn một tấm **Ảnh Thẻ Hội Viên có mã QR (`?khoiphuc=...`)** lưu vào album ảnh để quét 1 chạm khi sang máy mới, kèm tùy chọn mở nhanh bằng Vân tay (`WebAuthn`).
- **Hệ quả:** Tỷ lệ hoàn tất mở thẻ cao, bảo vệ quyền riêng tư số điện thoại theo Nghị định 13/2023/NĐ-CP và không tốn chi phí mua cổng SMS OTP.

---

## ADR-005: Hệ Thống 96 Danh Hiệu Toán Học Lồi (Convex Power-Exponential Progression)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Thang điểm tuyến tính khiến người chơi lâu năm nhanh chóng chạm trần nhàm chán, trong khi thang quá khó ngay từ đầu làm người mới nản lòng. Ngoài ra, mỗi bác có sở thích riêng (người thích đánh cờ, người thích ngâm thơ, người thích viếng chùa).
- **Quyết định:** Tách thành 1 trục chính **32 tầng thâm niên** ($\text{XP}(L) = \lfloor 20 \cdot L^{1.85} + 12 \cdot L \cdot 1.11^L \rfloor$) và **8 cây chuyên môn** x 8 bậc ($M(k) = \lceil a \cdot k^{2.15} + b \cdot (1.38^{k-1} - 1) \rceil$). Phân biệt rõ nhãn chào đón *Người mới (Tầng 1–5)* và nhãn tôn vinh *Trưởng lão / Cây đại thụ (Tầng 17–32)*.
- **Hệ quả:** Người mới đạt danh hiệu đầu tiên ngay trong 1 phút đầu, còn các bậc cao thủ có mục tiêu phấn đấu rõ ràng suốt nhiều năm trên từng tính năng yêu thích.

---

## ADR-006: Kho Lưu Trữ AI Tracking 100% Dựa Trên `IndexedDB` + Xuất Chuẩn `JSONL`
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Mọi dữ liệu thói quen giờ giấc mở máy, thời lượng dừng ở từng màn hình (`dwellSec`), kiểu trò chuyện (`quick_0token`, `sticker_1tap`, `typed_text`, `voice_speech`), đối tượng trò chuyện cùng và chủ đề quan tâm đều cần lưu giữ đầy đủ 100% để phục vụ huấn luyện và cá nhân hóa AI về sau.
- **Quyết định:** Thiết kế `telemetry.js` ghi toàn bộ sự kiện nguyên bản vào `IndexedDB` (`tuoibac_telemetry_db_v1`) không bị giới hạn 5 MB của `localStorage`, duy trì song song bảng tổng hợp thói quen 24h để hiển thị tức thì và cung cấp nút xuất thẳng ra định dạng `.jsonl` (Newline-Delimited JSON — chuẩn đầu vào trực tiếp của các đường ống phân tích dữ liệu và huấn luyện mô hình ngôn ngữ).
- **Hệ quả:** Không bao giờ mất mát dữ liệu hành vi do tràn bộ nhớ trình duyệt, đồng thời vẫn minh bạch cho phép hội viên kiểm tra và tải dữ liệu theo đúng quy định bảo vệ dữ liệu cá nhân.

---

## ADR-007: Nhiếp Ảnh Kiến Trúc Chùa Cổ Việt Nam Kết Hợp Ánh Sáng & Khói Trầm Vật Lý Cho Chánh Điện (`temple3d.js`)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Khi thử nghiệm dựng Chánh Điện bằng khối hình học Three.js Low-Poly (trụ/nón) hoặc vẽ minh họa 2D bằng đường cong Canvas thuần túy, hình ảnh trông giống đồ họa hoạt hình trẻ em, thiếu sự tôn nghiêm, trầm mặc và chiều sâu văn hóa cần có đối với người Việt Nam từ 55 tuổi trở lên.
- **Quyết định:**
  - Sử dụng bộ 3 bức ảnh kiến trúc Chùa Cổ Bắc Bộ chân thực đã nén chuẩn nhẹ (`~130–160 KB/ảnh` tại `assets/temple-wide.jpg`, `assets/temple-altar.jpg`, `assets/temple-courtyard.jpg`, lưu sẵn trong `CORE_ASSETS` của `sw.js`).
  - Dùng `temple3d.js` làm bộ kết hợp hiệu ứng vật lý thời gian thực (`28 FPS`) ngay trên tọa độ thực của bức ảnh: hòa trộn ánh sáng `screen` cho ngọn đèn dầu lưu ly và hào quang tượng Phật, vẽ làn khói hương mảnh mai uốn lượn bay lên từ đúng đầu 3 nén nhang, sóng âm đồng tâm và định vị vùng chạm trực tiếp trên Đại Hồng Chung, Lư Hương, Mõ Gỗ, Ống Xăm, Hồ Sen, Cây Bồ Đề và 10 Chiếu Bồ Đoàn.
- **Hệ quả:** Mang lại cảm giác trang nghiêm, ấm cúng như đang xem máy quay trực tiếp tại ngôi chùa cổ thật ngoài đời, dung lượng tải nhẹ dưới `450 KB` cho cả 3 góc máy và loại bỏ hoàn toàn các chi tiết hoạt hình rối mắt.
