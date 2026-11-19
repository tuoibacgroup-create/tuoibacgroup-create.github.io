# 01 — Tiêu Chuẩn Kỹ Thuật Game Studio 20 Năm (Engineering Discipline)

Tài liệu này quy định các nguyên tắc lập trình thực chiến để dự án **Tuổi Bạc** mở rộng lên hàng chục nghìn dòng mã mà vẫn chạy mượt trên điện thoại cấu hình thấp của người cao tuổi, không rò rỉ bộ nhớ, không hỏng dữ liệu cũ và không xung đột mạng.

---

## 1. Quản Lý Bộ Nhớ Đồ Họa 3D WebGL & Kết Cấu Thủ Tục (Procedural Textures)

Điện thoại tầm trung và giá rẻ của người lớn tuổi có giới hạn nghiêm ngặt về số lượng ngữ cảnh WebGL đồng thời (thường tối đa 4–8 WebGL contexts trên trình duyệt di động). Do đó mọi cảnh 3D (`tearoom3d.js` và `temple3d.js`) phải tuân thủ 4 quy tắc:

1. **Giải phóng triệt để khi chuyển màn hình (`dispose()`):**
   - Trước khi dựng cảnh mới hoặc khi `navigate(route)` rời khỏi màn hình 3D, phải gọi `cancelAnimationFrame(animId)`, duyệt toàn bộ `scene.traverse(...)` để gọi `geometry.dispose()` và `material.dispose()`, sau đó gọi `renderer.dispose()` và gán `scene = null; renderer = null;`.
2. **Tái sử dụng bộ đệm họa tiết (`texCache`):**
   - Họa tiết gạch bông Đông Dương, vân gỗ sàn, ngói mũi hài và hoành phi được vẽ bằng `HTMLCanvasElement` rồi đóng gói thành `THREE.CanvasTexture` lưu trong `texCache`. Không tạo mới `CanvasTexture` bên trong vòng lặp `requestAnimationFrame`.
3. **Khóa nhịp khung hình (`28 FPS`):**
   - Dùng `FPS_INTERVAL = 1000 / 28` trong vòng lặp vẽ. Mắt người xem cảnh tĩnh tâm / bàn trà không cần `60–120 FPS`, trong khi khóa `28 FPS` giảm một nửa lượng nhiệt và điện năng tiêu thụ trên điện thoại.
4. **Luôn có đường lùi 2.5D (`render2DFallback`):**
   - Bọc toàn bộ khối khởi tạo `new THREE.WebGLRenderer(...)` trong `try / catch`. Nếu trình duyệt trong Zalo WebView hoặc máy cũ từ chối cấp WebGL, tự động chuyển sang hàm vẽ Canvas 2D tĩnh mà không văng lỗi trắng trang.

---

## 2. Lưu Trữ Bền Vững & Nâng Cấp Lược Đồ Không Mất Dữ Liệu Cũ (Schema Migration)

Trong vận hành game lâu dài, lỗi nghiêm trọng nhất là cập nhật phiên bản mới làm mất Xu, mất Thẻ Hội Viên hoặc văng lỗi trắng màn hình do thiếu trường mới trong `localStorage` của người chơi cũ.

1. **Hợp nhất sâu theo khuôn mẫu mặc định (`loadState`):**
   - Mọi nhánh con của `state` (`auth`, `social`, `user`, `settings`, `privacy`, `analytics`, `teaRoom`, `newspaper`, `oaq`, `xiangqi`, `watch`, `zen`, `health`, `customTables`) đều phải gộp bằng `Object.assign({}, def.subKey, parsed.subKey || {})`.
   - Với các trường kiểu mảng (`unlockedTitleFrames`, `giftedPoemIds`, `joinedGroupIds`, `prayers`, `memberLogs`) hoặc đối tượng con sâu hơn (`user.skillPoints`), phải kiểm tra `Array.isArray(...)` hoặc gộp riêng từng khóa sau `Object.assign`.
2. **Ghi kép chống hỏng tệp (`Dual-Key Vault`):**
   - Hàm `saveState()` luôn ghi bản JSON hợp lệ vào `STORAGE_KEY` chính trước, sau đó sao chép sang `VAULT_BACKUP_KEY` (`_vault_bak`). Khi `JSON.parse` ở khóa chính gặp lỗi do tắt máy đột ngột, `loadState()` tự khôi phục từ `_vault_bak`.
3. **Tách dữ liệu tăng trưởng vô hạn sang `IndexedDB`:**
   - `localStorage` chỉ có hạn mức khoảng `5 MB`. Không bao giờ đẩy mảng lịch sử vô hạn vào `state`. Nhật ký hành vi AI Tracking 100% bắt buộc ghi vào `IndexedDB` (`tuoibac_telemetry_db_v1`) thông qua `telemetry.js`, chỉ giữ tối đa `500` sự kiện nóng để hiển thị tức thì.
4. **Hợp nhất điểm số chỉ tăng (`Monotonic Max-Merge`) khi đồng bộ đám mây:**
   - Trong `applyCloudAccountSnapshot(snap)`, Xu (`xu`), điểm thâm niên (`seniorityPoints`) và điểm 8 nhánh chuyên môn (`skillPoints[sk]`) luôn lấy `Math.max(local, cloud)`, còn danh sách bạn bè, đơn vị và khung danh hiệu dùng hợp nhất tập hợp (`Set` union) để không bao giờ ghi đè lùi tiến trình của người chơi.

---

## 3. Đồng Bộ Thời Gian Thực Bất Đồng Bộ & Chống Đua Trạng Thái (Network Safety)

1. **Khử trùng lặp gói tin (`Idempotency`):**
   - Vì hệ thống chạy song song cả `BroadcastChannel` (giữa các tab cùng máy) và `MQTT WSS` / `Supabase`, một tin nhắn có thể đến 2 lần. `realtime.js` dùng `seenMsgIds` (`Set`) và kiểm tra `payload.clientId === clientId` để loại bỏ gói tin vọng lại.
2. **Ưu tiên bản cập nhật mới nhất (`Last-Write-Wins`):**
   - Với trạng thái ván cờ treo (`match`) và hội nhóm (`group`), luôn so sánh `(payload.updatedAt || 0) >= (prev.updatedAt || 0)` trước khi ghi đè.
3. **Bảo vệ luồng nhập liệu của người dùng (`Focus-Safe Re-render`):**
   - Khi nhận sự kiện mạng (`presence`, `online`, `tableMeta`, `temple`), phải trì hoãn bằng `setTimeout` khử rung (`debounce 160ms`) và kiểm tra:
     ```javascript
     const activeTag = document.activeElement && document.activeElement.tagName;
     if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
     ```
     Nếu đang mở bàn phím ảo gõ chữ mà gọi `innerHTML = ...`, bàn phím trên điện thoại sẽ cụp xuống ngay lập tức gây ức chế lớn cho người cao tuổi.

---

## 4. Quy Chuẩn Giao Diện Công Thái Học Người Cao Tuổi (Senior UX Craft Floor)

1. **Một màn hình một tiêu điểm:** Tránh nhồi nhét nhiều thanh trượt ngang nhỏ; ưu tiên lưới 2 hoặc 3 cột nút bấm lớn có chữ tiếng Việt rõ nghĩa.
2. **Kích thước chạm & Cỡ chữ bất biến:**
   - Mọi nút hành động chính, nút chọn chiếu Bồ Đoàn, nút đổi góc máy 3D, nút Sticker đều phải đạt `min-height: 56px`.
   - Không dùng cỡ chữ nhỏ hơn `0.88rem` (`17.6px` ở chế độ chuẩn `20px`).
3. **Chống tràn ngang trên màn hình hẹp (`360px–390px`):**
   - Thẻ con bên trong `flex` hoặc `grid` có chứa văn bản động phải đặt `min-width: 0; overflow-wrap: anywhere;`.
   - Không đặt `white-space: nowrap` cho các nhãn có độ dài trên 18 ký tự.
4. **Ngôn ngữ tôn trọng, ấm áp, tự nhiên:**
   - Xưng hô nhất quán theo lựa chọn của hội viên (`Anh` / `Chị` hoặc `bác`), không dùng thông báo lỗi mang tính trách phạt kỹ thuật (ví dụ thay *"Invalid input"* bằng *"Mời bác nhập đủ 4 chữ số dễ nhớ"*).
5. **Ưu tiên khung nhìn đầu tiên (Above-the-Fold) & Dấu tiếng Việt sắc nét:**
   - Thanh trạng thái `.user-strip` giữ gọn 1 hàng ngang trên màn hình `390px` (tự xuống dòng khi bật `24px`); `4 Việc Chính Hôm Nay` ở Trang chủ và sân khấu 2.5D ở Sảnh Quán Trà phải xuất hiện ngay phần đầu màn hình, không bị đẩy sâu xuống dưới bởi các khối phụ hoặc danh sách chip dài.
   - Chuỗi font chữ có chân `--font-serif` bắt buộc đặt `"Merriweather", "Cambria", "Noto Serif", "Times New Roman", serif` (tránh dùng `Georgia` làm dự phòng trực tiếp trên Windows vì gây rời dấu tiếng Việt khi chạy ngoại tuyến).
6. **Kỷ luật cắt khung bao `ACC_BBOX` & tách 2 lớp phụ kiện 2.5D (`tearoom3d.js`):**
   - Khi thêm hoặc chỉnh sửa phụ kiện đội đầu / khăn quàng trong `tearoom-accessories*.webp` hay `tearoom-regional-acc.webp`, bắt buộc đo khung bao điểm ảnh thật (`ACC_BBOX`) và tách 2 lượt vẽ (`drawSpritePreHeadAccessory` vẽ phần sau cổ/vành sau trước nhân vật → `drawSpriteAccessories` vẽ phần trước kèm cắt biên `browClipY` / `chinClipY` sau nhân vật) để khớp đồng bộ cả 3 tư thế Nam (`col 0`), Nữ (`col 1`) và Lưng (`col 2`).

---

## 5. Kỷ Luật Đồng Bộ Sống Giữa Code Thực Tế & Hồ Sơ `.md` (Continuous Code-Doc Sync)

Tài liệu kỹ thuật bị lệch so với code thực tế nguy hiểm hơn không có tài liệu vì nó dẫn AI sửa sai hướng. Do đó mọi phiên làm việc bắt buộc thực thi quy tắc **Đồng bộ tức thì trong cùng một lượt sửa**:

| Khi thay đổi phần này trong Code thực tế | Bắt buộc cập nhật ngay tệp `.md` này trước khi báo cáo / commit |
| :--- | :--- |
| Thêm/xóa tệp `.js`, thêm/đổi màn hình `route`, đổi `CACHE_VERSION` trong `sw.js`, thêm bộ hẹn giờ ngầm | `ARCHITECTURE.md` |
| Thêm/đổi khóa gốc trong `createDefaultState()`, thêm namespace `window.*`, đổi chủ đề MQTT hoặc thêm bảng trong `supabase_schema.sql` | `docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md` |
| Thêm/đổi tham số liên kết sâu `params.get("...")` hoặc xử lý một ca lỗi phức tạp mới | `docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md` |
| Thay đổi giải pháp công nghệ, công thức toán học hoặc cơ chế lưu trữ/mạng | `docs/05_QUYET_DINH_KIEN_TRUC_ADR.md` |
| Thay đổi bảng màu, cỡ chữ, quy tắc bố cục hoặc phạm vi tính năng sản phẩm | `DESIGN.md` / `PRODUCT.md` |
| **Mọi lần sửa đổi `.js`, `.css`, `.html`, `.sql`** (thêm tính năng, tinh chỉnh UI, sửa bug) | `docs/03_TIEN_DO_VA_NHAT_KY.md` (cập nhật bảng tiến độ + ghi nối mục mới vào Nhật ký phiên bản) |

Trình kiểm định `scripts/studio-doctor.mjs` (Cổng 7 và Cổng 9) tự động bóc tách danh sách tệp `.js`, biến `window.*`, danh sách `route`, 20 khóa gốc của `state`, 14 bảng SQL, các tham số URL và trạng thái `git status / git log` để đối chiếu trực tiếp với các tệp `.md`. Nếu thiếu bất kỳ mục nào hoặc sửa code mà chưa cập nhật tiến độ, cổng kiểm định sẽ trả mã lỗi `1` (`[FAIL]`).
