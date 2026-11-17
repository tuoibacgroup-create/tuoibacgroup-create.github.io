# CLAUDE.md — Hướng Dẫn Khởi Động Nhanh Cho AI Agent

Dự án **Tuổi Bạc — Quán Trà Sinh Hoạt Người Cao Tuổi** sử dụng bộ hồ sơ kỹ thuật chuẩn Studio đặt tại thư mục gốc và thư mục `docs/`.

Trước khi thực hiện bất kỳ thao tác sửa lỗi hay viết tính năng mới nào, bạn **BẮT BUỘC** đọc theo thứ tự:

1. [AGENTS.md](AGENTS.md) — 10 bất biến kỹ thuật cấm vi phạm, bảng điều phối ngữ cảnh theo tác vụ và quy trình 6 bước bàn giao.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — Sơ đồ kiến trúc tổng thể, bản đồ 9 tệp JavaScript và bảng định vị 13 màn hình (`route`) trong `app.js`.
3. Các tài liệu chuyên sâu trong `docs/` tương ứng với phần việc đang làm:
   - [docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md](docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md)
   - [docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md](docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md)
   - [docs/03_TIEN_DO_VA_NHAT_KY.md](docs/03_TIEN_DO_VA_NHAT_KY.md)
   - [docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md](docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md)
   - [docs/05_QUYET_DINH_KIEN_TRUC_ADR.md](docs/05_QUYET_DINH_KIEN_TRUC_ADR.md)

### Lệnh kiểm tra bắt buộc trước khi kết thúc phiên
```bash
node scripts/studio-doctor.mjs
```
