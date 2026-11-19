# 05 — Hồ Sơ Quyết Định Kiến Trúc (Architecture Decision Records — ADRs)

Tài liệu này lưu lại **lý do cốt lõi (Why)** đằng sau 11 quyết định kỹ thuật quan trọng nhất của dự án **Tuổi Bạc**, giúp các lập trình viên và AI Agent về sau hiểu rõ bối cảnh, ưu nhược điểm và không vô tình quay lại các phương án đã bị loại bỏ.

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

## ADR-007: Ba Không Gian Tĩnh Tâm Độc Lập 20 Chiếu Bồ Đoàn, Hoa Đăng 3 Phút & Tờ Giấy Đỏ Hồi Lượt 45s (`temple3d.js`)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Khi thử nghiệm dựng Chánh Điện bằng khối hình học Three.js Low-Poly hoặc dùng chung một ảnh nền chùa cho cả Từ Đường họ tộc lẫn Vườn Thiền, trải nghiệm thiếu tính chân thực và lệch ngữ cảnh văn hóa đối với người Việt Nam từ 55 tuổi trở lên. Đồng thời hội viên muốn thấy đèn Hoa Đăng thật sự nổi trôi trên mặt nước và hoạt cảnh mở tờ giấy đỏ khi rút xăm / treo thẻ ước nguyện.
- **Quyết định:**
  - Tách riêng **3 bộ ảnh nền kiến trúc độc lập** đã nén tối ưu (`assets/temple-*.jpg` cho *Sân Chùa Quê*, `assets/ancestral-*.jpg` cho *Nhà Thờ Họ* không đặt tượng Phật mà thờ khám bài vị gia tiên + hoành phi *"ĐỨC LƯU QUANG"*, và `assets/zengarden-*.jpg` cho *Vườn Thiền Tĩnh Lặng*), kết hợp Sprite Atlas `assets/temple-sprites.webp` (`44 KB`) xếp **20 Chiếu Bồ Đoàn (`4×5`)** theo thuật toán chiều sâu Painter's Algorithm (`28 FPS`).
  - Duy trì mảng `activeLanterns` lưu các ngọn **Hoa Đăng tỏa sáng trôi trên mặt Hồ Sen suốt 3 phút (`180.000 ms`)**, đồng thời dựng hoạt cảnh mở **Tờ Giấy Đỏ viền kim nhũ** (`@keyframes redSlipUnfurl`) kèm bộ đếm hồi lượt **`45 giây`** cho cả Ống Xăm và Cây Thẻ Đỏ.
- **Hệ quả:** Cả 3 không gian tâm linh – truyền thống – dưỡng tâm đều đúng bản sắc văn hóa Việt Nam, giàu cảm xúc tương tác mà không thu bất kỳ khoản phí tiền thật nào.

---

## ADR-008: Chuẩn Hóa Đồ Họa Quán Trà Full 2.5D Cổ Điển (TLBB) Với 6 Không Gian Riêng Biệt (Gồm Trà Đá Vỉa Hè), 14 Trang Phục Ba Miền, 11 Phụ Kiện & 13 Đồ Bàn Trà (`tearoom3d.js`)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11, khóa thống nhất `Full 2.5D TLBB`)
- **Bối cảnh:** Để không gian quán trà thật sự dân dã, gần gũi với đời sống người Việt ba miền, mỗi phòng sinh hoạt cần bối cảnh kiến trúc – bàn ghế riêng tương ứng và có thêm góc **Quán Trà Đá Vỉa Hè** bên cạnh các phòng trà trong nhà.
- **Quyết định:**
  - Thiết kế riêng **6 bộ tranh nền Sảnh & Bàn 5 ghế đẳng cự (`960×720`)** kèm tọa độ nệm ghế hiệu chuẩn riêng cho từng không gian: `Phòng Trà Sáng`, `Quán Trà Đá Vỉa Hè` (`room-viahe-*.jpg`: gạch đỏ lát xương cá, bóng cây sấu, tủ kẹo lạc, phích nước đỏ Rạng Đông, chiếu cói vuông), `Phòng Thơ Lục Bát` (`room-tho-*.jpg`), `Phòng Cờ Tướng` (`room-co-*.jpg`), `Phòng Cựu Chiến Binh` (`room-ccb-*.jpg`) và `Phòng Cây Cảnh` (`room-caycanh-*.jpg`).
  - Mở rộng kho trang bị lên **14 trang phục đặc trưng vùng miền** (Kinh Bắc – Bắc Ninh: *Áo tứ thân mớ ba*, *Áo the thâm*; Miền Trung: *Áo ngũ thân Cố đô*, *Áo lụa tím Huế*, *Áo thổ cẩm Trường Sơn*; Miền Nam: *Áo bà ba đen Khăn rằn*, *Áo bà ba lụa mỡ gà*), **11 phụ kiện khớp đầu/mắt/cổ** (*Nón quai thao*, *Khăn xếp chữ Nhân*, *Khăn rằn Nam Bộ*...) và **13 vật phẩm bày bàn** (gồm *Khay trà đá vỉa hè & kẹo lạc*).
- **Hệ quả:** Cả 6 không gian sinh hoạt đều có hồn Việt rõ nét từ phố thị vỉa hè đến thư phòng – sân vườn, giữ tốc độ mượt `28 FPS` và đồng bộ 100% với Tủ Trang Phục.

---

## ADR-009: Tách Quyền Quản Trị Chống Dò PIN, Điểm Báo RSS 05:30 & Gia Cố Bảo Mật 7 Lớp
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Khi vận hành cộng đồng thật trên trình duyệt công cộng, ứng dụng phải bảo vệ người cao tuổi trước tin nhắn lừa đảo mạo danh, ngăn người dùng thường bấm nhầm vào bảng điều khiển hệ thống và chống tấn công XSS / đầu độc gói tin MQTT / xóa bảng cơ sở dữ liệu.
- **Quyết định:**
  - Áp dụng `Content-Security-Policy` nghiêm ngặt (`script-src 'self' https://cdn.jsdelivr.net; worker-src 'self' blob:; object-src 'none'`) ngay trong `index.html`.
  - Tách riêng khu vực duyệt RSS Báo Sáng (`05:30` hàng ngày qua `scripts/fetch-morning-rss.mjs` / mẫu workflow `docs/workflows/morning-rss.yml`), Dash hoạt động toàn quán, xuất `.jsonl` và cấu hình Supabase sau hộp thoại mã khóa Admin có cơ chế **khóa tạm `60 giây` sau `5` lần nhập sai** và **băm muối lặp `2.500` vòng (`v2$`)**.
  - Kiểm tra an toàn hai lượt (`isUnsafeScamOrPiiText` trước và sau `phoneticDict`) trên toàn bộ biểu mẫu cộng đồng; dùng `Object.create(null)`, giới hạn gói tin `24 KB` / `200` khóa RAM trong `realtime.js`; siết chính sách PostgreSQL RLS tối thiểu đặc quyền trong `supabase_schema.sql` (chặn `DELETE` ẩn danh, bảng `safety_reports` chỉ cho `INSERT`).
- **Hệ quả:** Đạt chuẩn kiểm thử thâm nhập tự động (`scripts/e2e-regression.mjs`) mà vẫn giữ thao tác 0 rào cản cho hội viên bình thường.

---

## ADR-010: Kho 15 Giọng Đọc Tiếng Việt Thu Sẵn Ngoại Tuyến (`.mp3`) & Đo Kiểm Thực Địa UAT `23.008 XP`
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Nhiều điện thoại Android tầm trung đời cũ của các bác thiếu gói giọng đọc `vi-VN` ngoại tuyến trong `window.speechSynthesis`, khiến nút `Đọc to` bị câm khi sóng 4G chập chờn. Đồng thời mốc điểm danh hiệu Bậc 32 (`23.008 XP`) cần công cụ đo tốc độ tích lũy thực tế khi thử nghiệm 5–10 máy đầu tiên.
- **Quyết định:**
  - Đóng gói sẵn **15 tệp âm thanh giọng đọc tiếng Việt ấm áp (`assets/audio/*.mp3`, tổng `564 KB`)** vào bộ đệm ngoại tuyến `sw.js` cho lời chào buổi sáng, điểm danh, bàn trà, 3 không gian tĩnh tâm, cờ tướng, ô ăn quan, nhắc nghỉ mắt 20 phút và 6 quẻ bình an; tự động phát dự phòng hoặc cho phép bật ưu tiên giọng thu sẵn.
  - Tích hợp tham số `?uat=<ma_nhom>` và báo cáo `getUatAndXpCalibrationReport()` trong `telemetry.js` để đo cỡ chữ, loại mạng và dự phóng số ngày đạt Bậc 6 / 16 / 32 ngay trong Dash Admin.
- **Hệ quả:** Máy Android cũ vẫn phát giọng tiếng Việt rõ ràng cả khi ngoại tuyến, và Ban Chủ Nhiệm có số liệu thực chứng để cân chỉnh nhịp độ thăng cấp.

---

## ADR-011: Bản Đồ Việt Nam Chuẩn GIS Natural Earth 10m (`380×560`), Mặt Nạ Phụ Kiện `evenodd` 2 Lớp & Bố Cục Operate Mode (`?v=20261119a–b`)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Trong rà soát thực tế trên điện thoại `390×844`, phiên bản cũ bộc lộ 4 điểm gây khó dùng và thiếu chính xác: (1) Bản đồ Điểm danh vẽ tay (đa giác 23 đỉnh rồi Bezier ước lượng 85 điểm) vẫn méo hình thể vùng biên giới phía Bắc/miền Trung và thiếu quy chuẩn bản đồ hành chính Việt Nam; (2) Một số phụ kiện 2.5D như Khăn rằn Nam Bộ bị đè cằm hoặc cắt ngang hở cổ khi cắt bằng hình chữ nhật, Khăn xếp the đen / Khăn đóng bị cắt thẳng viền trán và ló góc đen cạnh tai, còn Nón quai thao bị dây cắt qua cằm/má; (3) Khối `4 Việc Chính Hôm Nay` ở Trang chủ và sân khấu 2.5D ở Sảnh Quán Trà bị đẩy xuống dưới ~1.000px bởi các thẻ phụ, thanh `.user-strip` gãy 2 hàng; (4) Font dự phòng `Georgia` làm tách rời dấu tiếng Việt trên Báo Sáng và thơ Quẻ Xăm khi ngoại tuyến.
- **Quyết định:**
  - **Bản đồ địa lý chuẩn GIS Natural Earth 10m (`data.js`, `app.js`, `styles.css`):** Trích xuất trực tiếp ranh giới quốc gia Việt Nam (`VNM`) từ **Natural Earth 10m** (`290` đỉnh đất liền + `21` đảo ven bờ thật: Phú Quốc, Cát Bà, Vân Đồn, Côn Đảo, Cần Giờ, Hòn Tre...) chiếu đúng tỷ lệ `cos 16°` lên khung `380×560` với `0` tỉnh đất liền nằm ngoài bờ; bổ sung đầy đủ quy chuẩn bản đồ Việt Nam gồm khung viền kép, tiêu đề `BẢN ĐỒ VIỆT NAM`, lưới kinh vĩ tuyến chính xác (`10°B–20°B / 105°Đ–110°Đ`), la bàn `B/Đ/N/T`, thước tỷ lệ thật `0—200 km` (`58px`), ngôi sao vàng 5 cánh nền đỏ đánh dấu Thủ đô Hà Nội, `VỊNH BẮC BỘ`, `BIỂN ĐÔNG`, Bạch Long Vĩ, Lý Sơn, hai khung chủ quyền nét đứt `Quần đảo Hoàng Sa (TP. Đà Nẵng · Việt Nam)` & `Quần đảo Trường Sa (Khánh Hòa · Việt Nam)`, huy hiệu địa cầu Người Việt xa quê, khóa chống bôi đen `user-select: none` và thanh xem nhanh tỉnh đang chạm `#vn-map-selected-bar`.
  - **Hiệu chuẩn phụ kiện 2 lớp bằng mặt nạ `evenodd` & vòng cung trán (`tearoom3d.js`):** Đo khung bao điểm ảnh thật (`ACC_BBOX`) cho toàn bộ phụ kiện, vẽ lớp sau gáy trong `drawSpritePreHeadAccessory()`, rồi ở lượt trước trong `drawSpriteAccessories()` dùng mặt nạ bầu dục đảo ngược `ctx.clip("evenodd")` cho `Khăn rằn Nam Bộ` (liền mạch quanh cổ không đứt ngang) và `Nón quai thao` (giữ trọn đôi tua lụa kèm dải quai lụa trắng ngà dưới cằm, không dây ngang mặt), dùng cung bậc hai `quadraticCurveTo` cho viền trán của `Khăn xếp` / `Khăn đóng` (bỏ lớp sau đầu thừa), đồng thời nới mặt đôn gỗ gụ Tủ đồ (`rx=64`) để 13 vật phẩm đặt gọn trong lòng bàn.
  - **Bố cục Operate Mode & Serif an toàn (`app.js`, `styles.css`):** Gom `.user-strip` còn 1 hàng ngang (tự mở rộng ở `.xl-font` `24px`), đưa `4 Việc Chính Hôm Nay` lên ngay khung nhìn đầu tiên Trang chủ, đưa sân khấu 2.5D lên đầu Sảnh Quán Trà, thay thông tin rời ở Tủ đồ bằng lưới `2×2` (`.equipped-spec-grid`), chuẩn hóa lưới `.tabs-3` / `.segmented-2` / `.zen-space-tabs` + `.zen-view-bar` và chuyển `--font-serif` sang `"Merriweather", "Cambria", "Noto Serif", "Times New Roman", serif`.
- **Hệ quả:** Người dùng 55+ mở ứng dụng chạm được ngay việc chính, bản đồ đạt chuẩn hình thể địa lý GIS Việt Nam và toàn bộ 11 phụ kiện 2.5D khớp liền mạch trên cả Nam/Nữ/Lưng, đồng thời giữ nguyên 100% kiến trúc tĩnh không cần build và đạt tuyệt đối `9/9` Studio Doctor + `32` lượt quét E2E (`20px` & `24px`).

---

## ADR-012: Hệ Thống Thiết Kế "Mực & Chu Sa · Sáng" (Ink & Cinnabar Light · Material 3) & Kiến Trúc Chia Thẻ Ngắn Gọn Trên Toàn Bộ 16 Màn Hình (`?v=20261119c`)
- **Trạng thái:** Đã chấp thuận & Đang vận hành (2026-11)
- **Bối cảnh:** Sau khi chuẩn hóa bản đồ và phụ kiện 2.5D, rà soát tổng thể cho thấy bề mặt giấy vàng đậm + viền nâu cũ vẫn tạo cảm giác nặng và nhiều màn hình bị kéo dọc quá dài khiến người lớn tuổi phải vuốt lên xuống nhiều lần (`newspaper` tới `8.548px` / 10 màn hình, `tearoom` `5.008px` / 6 màn hình, `profile` `4.756px`, `zen` `3.080px`, `poetry` `2.988px`, `home` `2.811px`).
- **Quyết định:**
  - **Áp dụng ngôn ngữ "Mực & Chu Sa · Sáng" (Material Design 3 Light):** Chuyển nền sang giấy ngà sáng dịu `#F7F5F0`, thẻ trắng `#FFFFFF`, viền sáng mảnh `#E5DFD5`, mực chữ `#1C1917` (> 14:1), nhấn Đỏ Chu Sa `#B63A24` / `#FBEAE6` đồng bộ trên 5 thành phần chuẩn: Banner Chu Sa đầu trang (`.m3-hero-banner`), Thanh đáy Active Pill (`.bnav-pill`), Khay Segmented Control (`.m3-seg-bar`), Hàng List-Row (`.m3-list-row`) và Lưới công cụ 3 cột (`.m3-tool-grid`), giữ nguyên bất biến chữ `20px/24px` và nút chính `>= 56px`.
  - **Chia nhỏ thành thẻ & sub-tab gọn trong ~1–2 khung hình (giữ trạng thái tab trong RAM để không phình schema `state`):** Tách 2 ngăn Segmented Control cho `checkin`, `tearoom`, `zen`, `health`, `family`, `watch`; phân trang 4 tin + dải chuyên mục cuộn ngang cho `newspaper`; lật từng bài cho `poetry`; lưới 2 cột cho `profile`; lưới 3 cột + thanh 3 niềm vui ngang cho `home`; giữ toàn bộ các khu vực đồ họa văn hóa (Quán Trà 2.5D, Chánh Điện, Bản đồ GIS nền đêm, Bàn cờ) tương phản nổi bật trên nền sáng mới.
- **Hệ quả:** Giảm `40%–80%` chiều dài cuộn dọc trên các màn hình nặng nhất, giao diện sáng – hiện đại – rõ mạch, người 55+ thao tác tức thì không phải vuốt dài, đồng thời giữ `0px` tràn ngang ở cả `20px` và `24px`, `0` cảnh báo Impeccable và `100% PASS` trên toàn bộ bộ kiểm định tự động.
