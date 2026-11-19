# AGENTS.md — Quy Chuẩn Kỹ Thuật Studio & Điều Phối Ngữ Cảnh Cho AI

Tệp này là quy ước kỹ thuật bắt buộc đối với mọi AI Agent (Antigravity, Claude Code, Codex, Cursor, Windsurf, Copilot) khi đọc hiểu, sửa lỗi hoặc phát triển tính năng mới cho dự án **Tuổi Bạc — Quán Trà Sinh Hoạt Người Cao Tuổi**.

---

## 1. Định Vị Dự Án & Lệnh Kiểm Tra Nhanh

- **Sản phẩm:** Mạng sinh hoạt cộng đồng và trò chơi dân gian trực tuyến trên trình duyệt di động (PWA) dành cho người Việt Nam từ **55 tuổi trở lên**.
- **Máy chủ chạy trực tuyến 24/7:** `https://tuoibacgroup-create.github.io/` (nhánh `main` của kho Git tĩnh).
- **Chạy thử tại máy cục bộ:** Mở `run.bat` hoặc chạy `python -m http.server 4173 --bind 127.0.0.1` rồi mở `http://127.0.0.1:4173`.
- **Giả lập nhiều điện thoại cùng lúc trên 1 máy:** Mở hai tab trình duyệt với tham số `?may=1` và `?may=2` (tự động tách riêng `localStorage`, `IndexedDB` và `clientId` mạng).
- **Cổng kiểm định tự động bắt buộc (chạy trước và sau mọi lần sửa code):**
  ```powershell
  node scripts/studio-doctor.mjs
  ```

---

## 2. Bảng Điều Phối Đọc Tài Liệu Theo Tác Vụ (Selective Context Loading)

Không đọc tràn lan toàn bộ kho mã nguồn cùng lúc. Trước khi sửa bất kỳ phần nào, hãy đọc [ARCHITECTURE.md](ARCHITECTURE.md) và mở đúng tệp chuyên đề tương ứng dưới đây:

| Nhóm công việc / Lỗi cần xử lý | Tài liệu bắt buộc đọc & đồng bộ | Tệp mã nguồn chính |
| :--- | :--- | :--- |
| Hiểu cấu trúc tổng thể, danh sách 17 màn hình (`route`) | [ARCHITECTURE.md](ARCHITECTURE.md) | `index.html`, `app.js`, `sw.js` |
| Quy chuẩn bộ nhớ 3D, chống đua mạng, quy tắc đồng bộ Code ↔ Docs | [docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md](docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md) | Toàn dự án |
| Tra cứu 22 nhánh `state`, chữ ký hàm 7 namespace, 15 bảng SQL & MQTT | [docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md](docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md) | `data.js`, `realtime.js`, `supabase_schema.sql` |
| Kiểm tra tính năng nào đã xong, lịch sử bản dựng, hạng mục tồn đọng | [docs/03_TIEN_DO_VA_NHAT_KY.md](docs/03_TIEN_DO_VA_NHAT_KY.md) | Nhật ký dự án |
| Chẩn đoán lỗi trắng 3D, tràn màn hình `390px`, Deep Link URL, mất đồng bộ | [docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md](docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md) | Tùy triệu chứng |
| Lý do chọn kiến trúc hiện tại (tránh tự ý đập đi viết lại sai hướng) | [docs/05_QUYET_DINH_KIEN_TRUC_ADR.md](docs/05_QUYET_DINH_KIEN_TRUC_ADR.md) | Kiến trúc cốt lõi |
| Hệ thống màu sắc, cỡ chữ người cao tuổi, bố cục Mobile-first | [DESIGN.md](DESIGN.md) | `styles.css`, `index.html` |
| Phạm vi nghiệp vụ và rào chắn an toàn cho người cao tuổi | [PRODUCT.md](PRODUCT.md) | `app.js`, `data.js` |

---

## 3. Mười Một Bất Biến Kỹ Thuật Cấm Vi Phạm (Hard Studio Invariants)

1. **Giữ kiến trúc Zero-Build Static PWA:** Không tự ý cài đặt Webpack/Vite/React biến dự án thành cấu trúc phải biên dịch trừ khi Chủ dự án yêu cầu bằng văn bản. Mã nguồn phải chạy trực tiếp trên trình duyệt và đẩy thẳng lên GitHub Pages.
2. **Thứ tự nạp Script & Chống kẹt Cache đồng bộ:** Trong `index.html`, thứ tự thẻ `<script defer>` bắt buộc là:
   `three.min.js` → `qrcode.min.js` → `mqtt.min.js` → `supabase.min.js` → `data.js` → `progression.js` → `telemetry.js` → `tearoom3d.js` → `temple3d.js` → `xiangqi.js` → `realtime.js` → `app.js`.
   Mỗi khi sửa `.js` hoặc `.css`, phải tăng đồng loạt tham số `?v=...` trong `index.html` và tăng `CACHE_VERSION` trong `sw.js`.
3. **Công thái học người cao tuổi (55+):** Cỡ chữ gốc `html` tối thiểu `20px` (`24px` ở chế độ Chữ to); chiều cao vùng chạm mọi nút tương tác chính tối thiểu `56px`; không được có thanh cuộn ngang (`scrollWidth <= innerWidth`) ở khung di động chuẩn `390×844`.
4. **Số liệu thẳng hàng & Thẩm mỹ sạch:** Dùng `font-variant-numeric: tabular-nums` cho mọi con số (Xu, XP, đồng hồ, thống kê); dùng icon SVG đồng bộ nét vẽ trong sprite `index.html` (không dùng emoji trang trí thay icon); không dùng `border-left` hoặc `border-right` dày quá `1px`.
5. **Kỷ luật vòng đời WebGL 3D (`tearoom3d.js` & `temple3d.js`):** Khóa tốc độ vẽ tối đa ~`28 FPS` để tiết kiệm pin điện thoại; bắt buộc gọi `.dispose()` giải phóng `Geometry`, `Material` và `WebGLRenderer` trong `navigate(route)` khi rời màn hình 3D; luôn duy trì nhánh vẽ dự phòng `2.5D Canvas` khi máy không có WebGL.
6. **Nhãn HTML nổi trên nền 3D (`seat-status-tag`):** Nội dung chữ ngắn gọn (`<= 18` ký tự), kẹp biên tọa độ ngang `sx` cách mép trái/phải tối thiểu `58px–68px` để không bao giờ tràn khỏi khung trên màn hình `390px`.
7. **Tương thích ngược khi sửa `state`:** Mọi khóa mới thêm vào `createDefaultState()` trong `app.js` bắt buộc phải có bước gán giá trị mặc định an toàn trong `loadState()` để dữ liệu cũ đang lưu trên điện thoại của hội viên không bị lỗi `undefined`.
8. **Bảo toàn dữ liệu 4 lớp & Tracking 100%:** Trạng thái người dùng ghi kép vào `STORAGE_KEY` và `_vault_bak`; toàn bộ hành vi (giờ giấc, thời lượng lưu màn hình `dwellSec`, 4 kiểu chat, từ khóa tìm kiếm, ván cờ, nghi thức) phải đi qua `window.TuoiBacTelemetry` lưu vào `IndexedDB` (`tuoibac_telemetry_db_v1`).
9. **Chống giật giao diện khi nhận gói tin mạng:** Khi lắng nghe sự kiện thời gian thực từ `window.TuoiBacRealtime`, luôn kiểm tra `document.activeElement.tagName` — không gọi hàm vẽ lại toàn bộ màn hình (`innerHTML = ...`) nếu người dùng đang đặt con trỏ gõ chữ trong `INPUT` hoặc `TEXTAREA`.
10. **Đạo đức & An toàn tuyệt đối cho người lớn tuổi:** Không thu phí tiền thật tại Chánh Điện 3D hay bất kỳ nghi thức tâm linh nào; chặn tự động số điện thoại dài, số tài khoản ngân hàng và đường dẫn lạ trong ô chat; số điện thoại mở Thẻ Hội Viên chỉ băm một chiều (không lưu số thô); ghi nhãn rõ `"Máy"` hoặc `"Trợ lý"` cho nhân vật tự động.
11. **Đồng bộ hai chiều 100% giữa Code thực tế & Tài liệu `.md` (Zero Code-Doc Drift):** Nghiêm cấm sửa code mà để tài liệu `.md` tụt hậu. Trong cùng một lượt làm việc và cùng một commit, mọi thay đổi kỹ thuật hoặc tính năng bắt buộc cập nhật ngay vào đúng tệp `.md` đối ứng:
    - Đổi/thêm tệp `.js`, màn hình `route`, bộ đếm thời gian hoặc `CACHE_VERSION` (`sw.js`) → cập nhật [ARCHITECTURE.md](ARCHITECTURE.md).
    - Đổi/thêm khóa gốc trong `createDefaultState()`, hàm `window.*`, kênh MQTT hoặc bảng `supabase_schema.sql` → cập nhật [docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md](docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md).
    - Đổi/thêm tham số URL (`?...=`) hoặc phát hiện bẫy kỹ thuật mới → cập nhật [docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md](docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md).
    - Đổi quyết định kiến trúc nền tảng → ghi thêm ADR mới vào [docs/05_QUYET_DINH_KIEN_TRUC_ADR.md](docs/05_QUYET_DINH_KIEN_TRUC_ADR.md).
    - Mọi thay đổi trên `.js`, `.css`, `.html`, `.sql` (dù lớn hay nhỏ) → bắt buộc cập nhật bảng tiến độ và ghi nối nhật ký vào [docs/03_TIEN_DO_VA_NHAT_KY.md](docs/03_TIEN_DO_VA_NHAT_KY.md) (kèm [PRODUCT.md](PRODUCT.md) / [DESIGN.md](DESIGN.md) nếu đổi phạm vi sản phẩm hoặc thiết kế). Trình kiểm định `scripts/studio-doctor.mjs` sẽ đối chiếu trực tiếp mã nguồn và lịch sử Git với các tệp `.md` và chặn báo lỗi `FAIL` nếu phát hiện bất kỳ độ lệch nào.

---

## 4. Quy Trình 6 Bước Chuẩn Studio Trước Khi Bàn Giao (Definition of Done)

1. Đọc đúng tài liệu chuyên đề ở Bảng 2 và đọc trực tiếp vùng mã nguồn sẽ sửa.
2. Thực hiện thay đổi theo từng lát cắt nhỏ, giữ hàm rõ nghĩa, không để lại mã chết bị chú thích (`// old code`).
3. Đồng bộ ngay toàn bộ thay đổi sang các tệp `.md` đối ứng theo **Bất biến #11**, tăng `?v=...` trong `index.html` và tăng `CACHE_VERSION` trong `sw.js` + `ARCHITECTURE.md`.
4. Ghi nối thêm (append-only, không xóa lịch sử cũ) một mục vào `docs/03_TIEN_DO_VA_NHAT_KY.md` nêu rõ ngày, tệp đã sửa, tính năng/lỗi đã xử lý và cập nhật bảng tiến độ phân hệ.
5. Chạy `node scripts/studio-doctor.mjs` và đảm bảo toàn bộ **9/9 cổng kiểm định** (bao gồm cổng đối chiếu cấu trúc Code ↔ Docs và cổng kiểm tra đồng bộ tiến độ Git) báo **`PASS`** (mã thoát `0`).
6. Mở kiểm tra thực tế ở kích thước di động `390×844` (`@2x`), xác nhận `0` lỗi Console, `0` lỗi tràn ngang trước khi commit & push.
