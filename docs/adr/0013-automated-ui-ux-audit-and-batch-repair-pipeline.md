# ADR 0013: Quy Trình Kiểm Định Tự Động & Sửa Chữa Hàng Loạt Giao Diện (Automated UI/UX Audit & Batch Repair Pipeline)

## Trạng thái
Đã chấp thuận (Accepted) & Đang thực thi (In Execution)

## Ngữ cảnh
Qua quá trình nâng cấp Modal Chi Tiết Màn Chơi (`StageDetailModal`), người dùng nhận thấy nhiều khu vực khác trong game (các modal, mô tả kỹ năng, vật phẩm, phần thưởng, khoảng cách lề) đang gặp tình trạng mô tả sai, câu chữ không khớp cơ chế game, hoặc bố cục khoảng cách (Gestalt Spacing) bị lệch nhịp, thiếu chuyên nghiệp. Thay vì chỉnh sửa thủ công phân mảnh, người dùng yêu cầu một giải pháp QA toàn diện và quy trình sửa hàng loạt chuẩn mực.

## Quyết định Thiết Kế (Architectural Decisions)

### 1. Phân Tầng Phạm Vi Kiểm Định (4 Nhóm Giao Diện)
* **Nhóm 1 - Menu Chính (`MainMenuScene`):** `StageDetailModal`, `StageSelectModal`, `RealmModal`, `RulesModal`, `LootTableModal`, `BossModal`.
* **Nhóm 2 - Modal Chuyên Sâu (`src/game/`):** `RelicCodexModal`, `CompanionModal3D`, `ShopModal`, `SettingsModal`, `ObstacleInfoModal`, `StageBadgesModal`.
* **Nhóm 3 - Màn Chơi & Kết Quả (`GameScene`):** `VictoryModal`, `DefeatModal`, `PauseModal`, Bàn cờ & HUD.
* **Nhóm 4 - Bộ Sưu Tập (`CollectionScene`):** Thư viện linh thú, huy hiệu danh hiệu.

### 2. Kiến Trúc Bộ Kiểm Định Bố Cục & Dữ Liệu Tự Động (`UI Layout Auditor`)
Xây dựng công cụ kiểm tra tự động (`tests/UILayoutAuditor.test.ts` / `src/qa/UILayoutAuditor.ts`) phát hiện 4 nhóm lỗi trọng yếu:
1. **Va chạm hình học (Bounds Collision & Text Truncation):** Bounding box của text hoặc button chèn đè lên nhau hoặc tràn mép card.
2. **Sai lệch & Thất thoát Dữ Liệu:** Phát hiện chuỗi rác, placeholder, `undefined`, `null`, `NaN`, tỷ lệ rớt không đồng bộ giữa UI và logic config.
3. **Vi phạm nhịp điệu Gestalt (Spacing & Rhythm):** Padding lề bất thường (< 8px hoặc > 35px không đối xứng), ô lưới không cân xứng.
4. **Vi phạm Design Token:** Sử dụng màu hex nằm ngoài hệ thống `ColorToken` hoặc font size tùy tiện.

### 3. Động Cơ Khung Giao Diện Dùng Chung (`Modal Design Engine`)
Thay vì hardcode pixel độc lập cho từng modal, hệ thống chuẩn hóa các hàm dựng layout dùng chung:
* `createModalShell()`: Khung modal viền vàng gold, nền obsidian, Torii watermark và nút đóng chuẩn.
* `createModalHeader()`: Header phân tầng Title, Subtitle và Status badge không chồng lấn.
* `createCardGrid()`: Tự động phân bổ lưới cột/hàng với padding và gap chuẩn hóa theo tỷ lệ vàng.

### 4. Quy Trình Thực Hiện 3 Pha (`Batch Refactoring Pipeline`)
* **Pha 1 (Audit & Catalog):** Chạy kiểm tra tự động, tổng hợp danh mục lỗi dữ liệu & bố cục kèm ảnh chụp thực tế.
* **Pha 2 (Alignment):** Thống nhất chuẩn sửa đổi chi tiết với người dùng.
* **Pha 3 (Batch Refactor & Deploy):** Áp dụng sửa chữa hàng loạt, xác thực 100% test và deploy trực tiếp lên iPhone.

## Hệ quả & Lợi ích (Consequences & Benefits)
1. **Sửa tận gốc:** Triệt tiêu hoàn toàn lỗi hiển thị trên toàn bộ các modal, không còn tình trạng sửa màn hình này thì màn hình kia vẫn lỗi.
2. **Đồng bộ nhận diện thương hiệu:** Tất cả các modal trong game đều đạt chuẩn visual game AAA của Nhật Bản.
3. **An toàn & Bền vững:** Kiểm thử tự động đảm bảo không gây hồi quy (regression) và không ảnh hưởng đến gameplay loop.
