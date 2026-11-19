# Tuổi Bạc — Quán Trà Sinh Hoạt Người Cao Tuổi (Hồ Sơ Quản Trị Dự Án)

Đây là kho mã nguồn và bộ hồ sơ kỹ thuật chuẩn Studio của dự án **Tuổi Bạc** — nền tảng sinh hoạt trực tuyến, đọc báo đàm đạo, chơi cờ tướng, kết nối đồng ngũ và tĩnh tâm 3D trên trình duyệt di động (PWA) dành cho người Việt Nam từ 55 tuổi trở lên.

- **Địa chỉ chạy trực tuyến 24/7 trên điện thoại:** https://tuoibacgroup-create.github.io/

---

## 1. Dành Cho Chủ Dự Án (Không Cần Biết Lập Trình Vẫn Kiểm Soát Được Toàn Bộ)

Bộ tài liệu của dự án được chia nhỏ giống mô hình một Studio làm game chuyên nghiệp. Anh không cần đọc code, chỉ cần nắm ý nghĩa các tệp sau:

| Tệp / Thư mục | Vai trò dễ hiểu |
| :--- | :--- |
| [AGENTS.md](AGENTS.md) & [CLAUDE.md](CLAUDE.md) | **"Nội quy bắt buộc cho AI"** — Mọi AI lập trình (Antigravity, Claude, Cursor, ChatGPT/Codex) khi mở thư mục này sẽ tự đọc tệp này đầu tiên để nắm đủ 11 bất biến kỹ thuật cấm vi phạm (bao gồm quy tắc đồng bộ Code ↔ Docs). |
| [ARCHITECTURE.md](ARCHITECTURE.md) | **"Bản vẽ tổng thể tòa nhà"** — Chỉ rõ game có bao nhiêu tệp, 17 màn hình nằm ở đâu, phần nào nối với phần nào để AI tìm đúng chỗ sửa trong 5 giây. |
| [docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md](docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md) | **"Tiêu chuẩn xây dựng bền vững"** — Quy định cách giữ máy điện thoại mát pin khi chạy 3D, không mất nick/xu của người chơi cũ khi nâng cấp bản mới. |
| [docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md](docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md) | **"Sổ đăng ký dữ liệu"** — Ghi rõ cấu trúc 22 nhánh lưu điểm, danh hiệu, Lịch Vạn Niên, nhắc việc, tin nhắn và 15 bảng cơ sở dữ liệu đám mây. |
| [docs/03_TIEN_DO_VA_NHAT_KY.md](docs/03_TIEN_DO_VA_NHAT_KY.md) | **"Sổ theo dõi tiến độ & lịch sử"** — Ghi rõ 17 phân hệ đã xong, ngày nào nâng cấp gì, còn việc gì dự kiến làm tiếp. |
| [docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md](docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md) | **"Sổ bắt bệnh nhanh"** — Bảng tra cứu: thấy hiện tượng lỗi gì thì mở đúng tệp nào để sửa ngay, kèm các bẫy kỹ thuật cần tránh. |
| [docs/05_QUYET_DINH_KIEN_TRUC_ADR.md](docs/05_QUYET_DINH_KIEN_TRUC_ADR.md) | **"Lý do thiết kế"** — Giải thích vì sao chọn cách làm hiện tại để AI đời sau không tự ý đập đi làm lại sai hướng. |
| `verify.bat` / `scripts/studio-doctor.mjs` / `scripts/e2e-regression.mjs` | **"Máy khám sức khỏe, E2E 17 màn hình & Pentest tự động"** — Nhấp đúp `verify.bat`, máy tự rà soát **9 cổng kỹ thuật Code ↔ Docs**, quét đủ **17 màn hình ở cả 20px và 24px** (`390×844`) và chạy bộ kiểm thử bảo mật Pentest. |

---

## 2. Câu Lệnh Mẫu Khi Anh Giao Việc Cho Bất Kỳ AI Nào Sau Này

Khi mở phiên chat mới hoặc chuyển sang dùng một công cụ AI khác để sửa lỗi hay thêm tính năng, anh chỉ cần dán đúng 1 câu ngắn này ở đầu buổi:

> *"Hãy đọc AGENTS.md, ARCHITECTURE.md và tệp liên quan trong thư mục docs/ trước khi làm. Mọi thay đổi về tính năng, dữ liệu và tiến độ trong code thực tế bắt buộc đồng bộ ngay sang các tệp .md đối ứng, sau đó chạy `node scripts/studio-doctor.mjs` đạt đủ 9/9 cổng PASS trước khi bàn giao."*

---

## 3. Khởi Chạy & Kiểm Định Nhanh Tại Máy Tính

- **Mở game chạy thử tại máy:** Nhấp đúp `run.bat` (hoặc mở qua Dashboard `E:\DuAn`).
- **Kiểm tra sức khỏe toàn bộ mã nguồn & tài liệu:** Nhấp đúp `verify.bat` hoặc chạy lệnh:
  ```powershell
  node scripts/studio-doctor.mjs
  ```
- **Đẩy bản cập nhật mới lên điện thoại (`github.io`):**
  ```powershell
  git add .
  git commit -m "mo ta ngan gon thay doi"
  git push origin main
  ```
