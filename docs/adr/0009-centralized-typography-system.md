# ADR 0009: Hệ Thống Quản Lý Typography Tập Trung & Design Tokens Toàn Cục

## Trạng thái
**ĐÃ CHẤP NHẬN (ACCEPTED)** - Ngày 20/10/2026

## Bối cảnh
Trước đây trong codebase Yokai Onet:
1. **Phân mảnh cấu hình Font (Ad-hoc Inline String Styling):**
   - Hơn 160+ vị trí trong `MainMenuScene.ts` cùng hàng chục vị trí trong `GameScene.ts`, `CollectionScene.ts`, các Modal (Shop, Settings, Codex, Relics) đang gõ cứng trực tiếp inline:
     ```ts
     fontFamily: 'Plus Jakarta Sans, sans-serif',
     fontSize: '12.5px',
     fontStyle: '800'
     ```
   - Cỡ chữ bị phân tán vụn vặt (`10px`, `10.5px`, `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `13.5px`, `14px`, `15px`, `16.5px`...).
   - Trọng số font không đồng nhất (`bold`, `800`, `900` dùng lẫn lộn).
2. **Khó bảo trì và thay đổi (High Maintenance Cost):**
   - Khi cần đổi font chủ đạo sang kiểu chữ mới (hoặc tinh chỉnh độ nét, kích cỡ theo hệ thống Design Token), kỹ sư phải tìm kiếm và chỉnh sửa thủ công hàng trăm khối code, dẫn đến nguy cơ sót lỗi, gãy layout và mất tính nhất quán thị giác.
3. **Lệch pha hỗ trợ tiếng Việt (Font Diacritics Mismatch):**
   - Một số tiêu đề trước đây gán nhầm font `Philosopher` đứng trước (vốn không có ký tự tiếng Việt đầy đủ), khiến trình duyệt mobile phải fallback chắp vá sang font hệ thống, tạo cảm giác chữ bị mấp mô, méo mó và "vỡ nét".

---

## Quyết định Kiến trúc

### 1. Single Source of Truth cho Font Families (`FONTS`)
Toàn bộ tên họ font trong game được quản lý tập trung tại `src/styles/typography.ts`:
- `FONTS.DISPLAY`: Dành cho tiêu đề thần thoại, tên chương viễn chinh, đại chiến Boss, banner chiến thắng (`"Plus Jakarta Sans", Philosopher, Cinzel, sans-serif`).
- `FONTS.BODY` / `FONTS.UI`: Dành cho toàn bộ giao diện chức năng, chỉ số HUD, mô tả kỹ năng, nút bấm, nhãn mác (`"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif`).
- `FONTS.MONO`: Dành cho đồng hồ bấm giờ đếm ngược, chỉ số điểm và telemetry cần khoảng cách số cố định.

*Khi cần đổi font chữ cho toàn bộ dự án, chỉ cần thay đổi 1 dòng duy nhất tại `src/styles/typography.ts`.*

### 2. Chuẩn hóa Hệ thống Design Tokens theo Cấp bậc (Typography Variants)
Thay vì dùng cỡ pixel tùy tiện, toàn bộ text trong game được ánh xạ vào 7 cấp độ định sẵn:
- **`display`** (32px, weight 900): Tên màn chơi chính, tiêu đề đỉnh cao.
- **`heading`** (22px, weight 900): Tiêu đề Modal, đầu mục lớn của Section.
- **`title`** (17px, weight 800/900): Tên thẻ chế độ chơi, tên Linh Thú, tên Pháp Bảo.
- **`subtitle`** (13.5px, weight 800): Nhãn phụ, tiêu đề cột bảng thành tích, nhãn trạng thái.
- **`body`** (12px, weight 600/700): Mô tả chi tiết kỹ năng, thể lệ, cốt truyện thần thoại.
- **`badge`** (11px, weight 900): Nội dung viên nhộng capsule, nút hành động nhỏ, nhãn cấp độ.
- **`caption`** (9.5px, weight 800): Dòng chú thích vi mô, chỉ số đếm, footnote.

### 3. Bộ API Quản Lý & Factory Method Tiện Lợi
Cung cấp các hàm rõ ràng:
1. `Typography.style(variant, overrides)`: Trả về `Phaser.Types.GameObjects.Text.TextStyle` chuẩn mực đã tích hợp sẵn font family, size, weight, lineSpacing và cho phép ghi đè linh hoạt (`color`, `align`, `wordWrap`...).
2. `Typography.create(scene, x, y, text, variant, overrides)`: Hàm bọc tạo nhanh `Phaser.GameObjects.Text`.
3. **Mở rộng trực tiếp vào Phaser GameObjectFactory:**
   - Khai báo type augmentation cho Phaser:
     ```ts
     scene.add.uiText(x, y, text, variant, overrides);
     scene.add.displayText(x, y, text, variant, overrides);
     ```
   - Giúp lập trình viên trong mọi Scene (`MainMenuScene`, `GameScene`, `CollectionScene`) có thể gọi ngắn gọn, tường minh và đồng bộ tuyệt đối.

---

## Hệ quả & Đánh giá
- **Ưu điểm:**
  - **Sửa 1 chỗ, ăn cả hệ thống:** Đổi font chữ hay căn chỉnh typography toàn bộ game chỉ trong đúng 5 giây.
  - **Code sạch sẽ & Nhất quán:** Loại bỏ hoàn toàn hơn 200+ dòng khai báo inline vụn vặt trong các Scene.
  - **Đảm bảo 100% tiếng Việt sắc nét:** Luôn ưu tiên font có bộ ký tự dấu tiếng Việt chuẩn chỉnh, kết hợp Retina 2x rendering và bộ lọc Antialias Bilinear của WebGL.
- **Đánh giá rủi ro:**
  - Cần thực hiện kiểm thử tự động (Unit Tests) và kiểm tra màn hình thực tế trên thiết bị để đảm bảo các text sau khi chuyển đổi không bị vỡ layout hoặc tràn viền.
