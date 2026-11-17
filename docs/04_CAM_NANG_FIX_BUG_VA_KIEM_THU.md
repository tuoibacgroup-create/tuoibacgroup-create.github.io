# 04 — Cẩm Nang Chẩn Đoán Lỗi Nhanh (Bug-Fix Playbook) & Kịch Bản Kiểm Thử

Tài liệu này giúp bất kỳ AI Agent nào khi nhận báo lỗi từ Chủ dự án có thể khoanh vùng nguyên nhân gốc trong vòng 60 giây mà không sửa mò làm phát sinh lỗi dây chuyền.

---

## 1. Bảng Tra Cứu Nhanh: Triệu Chứng Lỗi → Nguyên Nhân Gốc → Vị Trí Sửa

| Triệu chứng gặp phải | Nguyên nhân gốc phổ biến nhất | Tệp & Hàm kiểm tra ngay |
| :--- | :--- | :--- |
| Sửa code đã đẩy GitHub nhưng mở điện thoại vẫn thấy giao diện cũ | Quên tăng tham số `?v=...` trong `index.html` hoặc quên nâng hằng số `CACHE_VERSION` trong `sw.js` khiến Service Worker trả bản cũ | `index.html` (dòng 21–33) & `sw.js` (dòng 1) |
| Màn hình điện thoại bị xô lệch hoặc xuất hiện thanh cuộn ngang | Nhãn `.badge-tag` để `white-space: nowrap` với chữ dài > 20 ký tự, hoặc thẻ nổi 3D `.seat-status-tag` không kẹp biên ngang `sx` | `styles.css` (`.era-section-card`, `.skill-tree-card`), `tearoom3d.js`, `temple3d.js` (`projectToOverlay`) |
| Vào Quán Trà 3D hoặc Chánh Điện 3D nhiều lần trên máy yếu bị đen khung hình | Chưa gọi `.dispose()` khi chuyển màn hình dẫn tới tràn giới hạn số lượng `WebGLRenderingContext` của trình duyệt di động | `app.js` → hàm `navigate(route)` phải gọi đủ cả `TeaRoomScene.dispose()` và `TempleScene3D.dispose()` |
| Đang gõ chữ trong ô chat bàn trà hoặc ô ước nguyện thì bàn phím ảo tự cụp xuống | Có sự kiện mạng (`presence`, `online`, `temple`, `tableMeta`) gọi lại `renderTeaRoom()` / `renderZen()` làm ghi đè toàn bộ DOM | `app.js` (cuối tệp, vùng `RT.on(...)`): kiểm tra `document.activeElement.tagName !== "INPUT" && !== "TEXTAREA"` |
| Người dùng cũ cập nhật bản mới bị lỗi `TypeError: Cannot read properties of undefined` | Thêm trường mới vào `createDefaultState()` nhưng quên gộp mặc định trong `loadState()` cho dữ liệu cũ lưu trong `localStorage` | `app.js` → `createDefaultState()` và `loadState()` |
| Trong danh sách Hội Đồng Ngũ, chính bản thân mình lại hiện chữ *"Tạm nghỉ / Chưa mở máy"* | `RT.getOnlinePeers()` chủ đích lọc bỏ `clientId` của chính máy hiện tại để tránh đếm trùng người khác | `app.js` → `resolvePeerLiveOnlineInfo()` phải kiểm tra mã thẻ của chính người dùng trước khi tìm trong `getOnlinePeers()` |
| Hai tab trên cùng 1 máy tính mở test chung lại ghi đè tên của nhau | Hai tab dùng chung một khóa `localStorage` nên ghi đè `state` và `clientId` của nhau | Khi test nhiều người trên 1 máy, bắt buộc thêm `?may=1` cho tab 1 và `?may=2` cho tab 2 trên thanh địa chỉ |
| Các nhãn tên chiếu Bồ Đoàn 3D chồng đè lên nhau khi zoom cận cảnh | Các vật thể cùng nằm trên một hàng ngang (`z` bằng nhau) nên chiếu ra cùng tung độ màn hình `sy` | `temple3d.js` → `syncOverlayTags()`: giữ cơ chế so le độ cao `tagWorldY` chẵn/lẻ (`ca.idx % 2 === 0 ? 1.48 : 1.98`) |
| Báo lỗi vượt dung lượng `QuotaExceededError` khi chạy lâu ngày | Lưu mảng sự kiện vô hạn trực tiếp vào `localStorage` thay vì `IndexedDB` | Mọi log chi tiết phải ghi qua `telemetry.js` (`IndexedDB`), mảng trong `state` phải cắt trần `.slice(0, 150)` |

---

## 2. Tám "Bẫy Kỹ Thuật" Thực Tế Cần Nhớ (Known Gotchas)

1. **Nút `Quay về` (`#btn-back`) luôn đưa thẳng về Trang chủ (`"home"`):**
   - Thiết kế cố ý theo nguyên tắc *"1 chạm thoát ra sảnh chính"* cho người cao tuổi (không bắt bấm lùi nhiều tầng). Khi viết kịch bản kiểm thử tự động Playwright, từ bên trong bàn trà bấm `#btn-back` 1 lần là đã ở `"home"` (nút `#btn-back` sẽ ẩn đi ngay sau đó).
2. **Kiểm thử nhiều cửa sổ 3D WebGL đồng thời bằng Playwright trên Windows:**
   - Trình giả lập GPU mềm SwiftShader trên Windows có thể nghẽn nếu mở nhiều bối cảnh WebGL nặng trong cùng một tiến trình trình duyệt ẩn. Khi viết test E2E từ 2 máy trở lên, khởi tạo các thực thể `chromium.launch()` riêng cho từng máy ảo.
3. **Cỡ chữ gốc `1rem = 20px` (và `24px` khi bật Chữ to):**
   - Trong `styles.css`, `html` đặt `font-size: 20px` (lớn hơn chuẩn `16px` thông thường của web). Vì vậy `0.88rem` tương đương `17.6px`, còn `1.2rem` lên tới `24px–28.8px`. Luôn kiểm tra độ rộng nút bấm trên màn hình hẹp `390px` khi đặt chữ in đậm.
4. **Không dùng `border-left` / `border-right` dày để trang trí thẻ:**
   - Theo quy chuẩn thiết kế của dự án, mọi khung thẻ dùng viền mảnh đồng nhất `1px solid` kết hợp màu nền phân biệt nhẹ (`--bg-paper`, `#FFF6DD`, `#EEF7F2`), không tạo vạch màu dày bên sườn trái.
5. **Khóa nhịp nhấp trà `10 giây`:**
   - Sau khi gửi một câu nói hoặc một Sticker trong bàn trà, hàm `getCooldownRemaining()` khóa gửi tiếp trong `10 giây`. Đây là tính năng giữ nhịp điềm đạm cho phòng trà, không phải lỗi treo nút.
6. **Không gọi giọng đọc TTS tự động khi trang vừa mở mà chưa có thao tác chạm:**
   - Trình duyệt di động (iOS Safari / Chrome Android) chặn phát âm thanh tự động trước cú chạm đầu tiên của người dùng. Mọi lệnh `speak(...)` hoặc `AudioContext` chỉ gọi bên trong trình xử lý sự kiện `click`.
7. **Tệp `.bat` trên ổ đĩa Windows `E:\DuAn`:**
   - Mọi tệp `.bat` (`run.bat`, `verify.bat`) bắt buộc chỉ chứa ký tự **ASCII thuần** (không gõ tiếng Việt có dấu), kết thúc dòng chuẩn **`CRLF` (`\r\n`)** và không có lệnh `chcp 65001` để tương thích 100% với `cmd.exe` và trình kiểm tra `E:\DuAn\_Dashboard\doctor.mjs`.
8. **Lọc thông tin nhạy cảm trong ô trò chuyện (`cleanAndApplyDictionary`):**
   - Chuỗi chứa dãy từ 8 chữ số trở lên (SĐT / số tài khoản), `http://`, `https://` hoặc cụm từ vay mượn/chuyển khoản sẽ bị chặn gửi để bảo vệ các bác khỏi lừa đảo trực tuyến.
9. **Chống giật nhảy khung hình (`Zero Layout Shift`) khi diễn hoạt Ô Ăn Quan:**
   - Tuyệt đối không chèn thêm/xóa bỏ các khối văn bản động vào luồng DOM phía trên `.oaq-board` khi đang chạy hoạt cảnh rải sỏi; mọi thông báo trạng thái phải đẩy qua `showToast(...)`, huy hiệu đếm sỏi trên tay đặt `position: absolute` trên `.oaq-board-stage`, và luôn giữ cố định 2 hàng nút bên dưới bàn cờ.
10. **Tránh lỗi Falsy-Zero (`cushionIdx = 0`), kẹt lượt `turn = "ai"` và hủy `<canvas>` Chánh Điện khi nhận gói tin Realtime:**
    - Không bao giờ dùng `userCushionIdx || 2` hay `userCushionIdx || 7` vì vị trí Chiếu số 1 có chỉ số `0` (falsy trong JavaScript); luôn kiểm tra `typeof x === "number" && Number.isFinite(x)`.
    - Khi F5 hoặc chuyển tab/màn hình giữa lúc Máy Ô Ăn Quan đang chờ đi (`turn = "ai"`), `loadState()` và `cancelOrCommitOaqAnimation(true)` bắt buộc chốt nước đi và trả lượt về `"host"`.
    - Khi cập nhật danh sách sớ cầu an, người online hoặc đổi chỗ chiếu tại Chánh Điện, gọi `TempleScene3D.updateConfig(...)` và chỉ thay HTML vùng danh sách thay vì gọi `renderZen()` làm mất khói hương và sóng âm đang chạy trên `<canvas>`.

---

## 3. Bảng Tham Số Liên Kết Sâu (URL Deep Links) Khớp 1:1 Với `applyUrlDeepLinkIfPresent()`

Các tham số dưới đây được bóc tách trực tiếp từ `app.js` (trình kiểm định `studio-doctor.mjs` đối chiếu tự động tên biến `params.get(...)`):

| Tham số URL thực tế | Hành vi kích hoạt tự động khi mở trang |
| :--- | :--- |
| `?may=1`, `?may=2` | Cô lập hoàn toàn `STORAGE_KEY`, `IndexedDB` và `clientId` để giả lập nhiều điện thoại độc lập trên cùng 1 máy. |
| `?tinh=ha-noi` | Chọn sẵn tỉnh/thành phố quê hương cho hội viên khi mở từ liên kết thiệp mời điểm danh. |
| `?phong=phong-tra&ban=1` | Mở thẳng phòng sinh hoạt `phong` và vào ngồi ngay tại bàn số `ban` (đánh số từ `1` trở đi; nếu bỏ trống `ban` thì mở sảnh phòng đó). |
| `?tin=<articleId>` | Mở thẳng bàn trà đàm đạo riêng xoay quanh bài báo có mã `<articleId>`. |
| `?van=xq-123` hoặc `?van=oaq-123` | Kết nối thẳng vào Ván treo thời gian thực: tiền tố `xq-` mở bàn Cờ Tướng `9×10`, tiền tố khác mở bàn Ô Ăn Quan. |
| `?ketban=TB-102` | Mở mục Bạn Bè và tự động gửi/chấp nhận kết nối tâm giao với mã thẻ `TB-102`. |
| `?hoi=d25-d3-1k2-mn75` | Mở thẳng trang chi tiết đơn vị đồng ngũ / câu lạc bộ có mã `d25-d3-1k2-mn75`. |
| `?khoiphuc=<token>` | Khôi phục toàn bộ Thẻ Hội Viên, Xu, 96 danh hiệu, đơn vị và bạn bè trên điện thoại mới từ mã QR Ảnh Thẻ. |

---

## 4. Quy Trình Kiểm Thử Chuẩn Trước Mỗi Bản Phát Hành

1. **Bước 1 — Chạy cổng kiểm định tự động (< 1 giây):**
   ```powershell
   node scripts/studio-doctor.mjs
   ```
2. **Bước 2 — Kiểm tra đồng bộ Kho Dự Án `E:\DuAn`:**
   ```powershell
   node "E:\DuAn\_Dashboard\doctor.mjs"
   ```
3. **Bước 3 — Kiểm tra trực quan trên khung di động `390×844` (`@2x`):**
   - Kiểm tra 4 màn hình trọng tâm: Trang chủ (`home`), Bàn trà 3D (`tearoom`), Chánh Điện 3D (`zen`), Cây 96 Danh Hiệu (`leaderboard`) và Kho AI Tracking (`privacy`).
   - Đảm bảo `document.documentElement.scrollWidth <= window.innerWidth`, mọi nút chính cao `>= 56px` và Console không có dòng lỗi đỏ nào.
