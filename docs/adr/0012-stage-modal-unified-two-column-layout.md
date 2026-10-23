# ADR 0012: Thống Nhất Lưới 2 Cột Đối Xứng Dọc Cho Modal Chi Tiết Màn Chơi (Stage Detail Modal)

## Trạng thái
Đã chấp thuận (Accepted) & Đã triển khai (Implemented)

## Ngữ cảnh
Sau khi cải tiến giao diện Modal Chi Tiết Màn Chơi với bố cục bất đối xứng ở hàng dưới (Card Linh thú 330px và Card Phần thưởng 566px), người dùng đề xuất:
1. Thu gọn Card Bảo Vật Thần Khí (Card 1) về cùng kích thước 330px giống hệt Card Linh Thú (Card 3) để tạo sự đồng bộ trục dọc.
2. Dời cụm "Thưởng theo độ khó" (3 rương Dễ, Vừa, Khó) lên hàng trên (Top-Right), nằm ngay bên dưới bộ điều khiển chọn độ khó ở Header để tối ưu luồng thị giác (Eye Flow).
3. Chuyển cụm "Nhiệm vụ 3 sao thử thách" xuống hàng dưới (Bottom-Right) với kích thước mở rộng 566px để hiển thị các hàng nhiệm vụ thoáng đãng kèm trạng thái hoàn thành.

2. Khử trùng lặp bộ chọn độ khó ở Header: Chuyển toàn bộ quyền điều khiển và xem rương độ khó về duy nhất Card 2 (Single Authoritative Difficulty Controller), giải phóng không gian Header cho nhãn trạng thái màn chơi thanh thoát.
3. Nâng cấp chuẩn mực nhịp điệu không gian (Gestalt Spacing & Visual Rhythm):
   - Mở rộng 3 hàng nhiệm vụ Card 2 lên chiều cao 34px, giãn đều nhịp 40px, triệt tiêu vùng đen trống ở đáy Card 2.
   - Nở rộng các ô thưởng Card 4 lên chiều cao 66px (Balanced 2x2 Reward Matrix), bổ sung nhãn cố định cho tiền tệ và phân bổ 3 cột thoáng đạt cho linh thú.

## Quyết định Thiết Kế (Architectural Decisions)

### 1. Kiến trúc Lưới 2 Cột Đối Xứng Trục Dọc (Vertical 2-Column Grid)
* **Tổng bề ngang nội dung:** `330px + 16px (gap) + 566px = 912px` (vừa vặn khung Modal 950px với lề 19px mỗi bên).
* **Header Màn Chơi (Tối giản & Đơn mục đích):**
  * Hiển thị Tên màn, Tên Hán-Việt, 4 thẻ điều kiện (`☷ Bàn cờ`, `⏱ Thời gian`, `⭐ ≤ 45s`, `⭐⭐ ≤ 75s`).
  * Bên phải hiển thị duy nhất 1 Huy hiệu trạng thái lớn (`🟢 SẴN SÀNG VƯỢT ẢI` / `🔒 CHƯA MỞ`). Loại bỏ hoàn toàn thanh tab độ khó trùng lặp.
* **Cột Trái (Loadout & Đồng Hành - Rộng 330px, Tâm X = -291):**
  * **Top-Left (Card 1): BẢO VẬT THẦN KHÍ (330px)**
    * Bệ thờ thu gọn bên trái, hiển thị Thần khí nổi 3D bay bổng cùng huy hiệu Phẩm cấp (`✦ Hạ Phẩm`).
    * Thông tin bên phải: Tên thần khí, tên Hán-Nhật, mô tả kỹ năng 2 dòng và thanh hợp nhất tiến độ `🔒 CHƯA MỞ • 0/40 MẢNH`.
    * Nút tiện ích `📖 TỦ BẢO` mở nhanh Tủ Bảo Vật Wiki.
  * **Bottom-Left (Card 3): LINH THÚ ĐỒNG HÀNH (330px)**
    * Avatar Cáo Inari hào quang tròn, badge `★ CẤP 1/10`.
    * Tên linh thú, thuộc tính phẩm chất.
    * 3 huy hiệu icon tròn biểu trưng cho 3 kỹ năng (Tuyệt chiêu, Nội tại, Khắc chế).
    * Nút tương tác `📜 XEM KỸ NĂNG` mở Skill Popover chi tiết.
* **Cột Phải (Thử Thách & Phần Thưởng - Rộng 566px, Tâm X = +173):**
  * **Top-Right (Card 2): ĐỘ KHÓ & NHIỆM VỤ 3 SAO (566px, H=196px)**
    * **Hàng trên:** 3 Rương độ khó nhỏ gọn (Icon 24x24), Tên độ khó (`Dễ`, `Vừa 🔒`, `Khó 🔒`) và phần thưởng (`+100 Xu +50 Exp`, `+200 Xu +100 Exp`, `+300 Xu +150 Exp`) hiển thị nằm trên **cùng 1 hàng duy nhất** (Single Line). Đây là bộ điều khiển độ khó độc quyền (Single Authoritative Controller).
    * **3 hàng bên dưới:** 3 Hàng Nhiệm Vụ 3 Sao Thử Thách đặt ngay bên dưới bộ chọn độ khó với chiều cao **34px** và nhịp bước **40px**, mỗi hàng có sao vàng, mô tả nhiệm vụ rõ ràng font 12px bold và Badge trạng thái hoàn thành (`[✓ ĐÃ ĐẠT]` / `[CHƯA ĐẠT]`), lấp đầy không gian Card 2 cân đối hoàn hảo.
  * **Bottom-Right (Card 4): PHẦN THƯỞNG VƯỢT ẢI (566px, H=196px - Balanced 2x2 Matrix)**
    * Phân bổ 4 phần thưởng thành **lưới 2 Hàng × 2 Cột (2x2 Grid)** với kích thước ô nở rộng **262px × 66px**, loại bỏ toàn bộ khoảng chết ở đáy Card 4:
      * **Ô (1, 1):** `+10 EXP` (Kinh nghiệm vượt ải) — Icon khối cầu phát sáng bên trái, nhãn `[✓ CỐ ĐỊNH]` bên phải.
      * **Ô (1, 2):** `+35 Xu` (Tiền thưởng hoàn thành) — Icon thỏi vàng lấp lánh bên trái, nhãn `[✓ CỐ ĐỊNH]` bên phải.
      * **Ô (2, 1):** `Cáo Inari` — Bố cục 3 cột: Avatar 38px viền aura trái, Tên + Tag `Mảnh rớt: 1.0%` ở giữa, Nút tương tác `🔍 Xem` gọn gàng bên phải.
      * **Ô (2, 2):** `Mèo Nekomata` — Bố cục 3 cột: Avatar 38px viền aura trái, Tên + Tag `Mảnh rớt: 0.3%` ở giữa, Nút tương tác `🔍 Xem` gọn gàng bên phải.
    * Tương tác: Nhấp vào ô Cáo Inari hoặc Mèo Nekomata sẽ mở trực tiếp `CompanionModal3D` xem kỹ năng & nâng cấp.

## Hệ quả & Lợi ích (Consequences & Benefits)
1. **Trực quan & Nhất quán:** Cột trái (330px) đại diện cho nhân vật & trang bị (Loadout); Cột phải (566px) đại diện cho thử thách & phần thưởng (Challenge & Rewards). 2 cột thẳng tắp từ trên xuống dưới, không còn tình trạng so le hàng trên 50/50 - hàng dưới 36/64.
2. **Khử xung đột điều hướng:** Không còn 2 bộ chọn độ khó giẫm chân nhau giữa Header và Card 2.
3. **Chuẩn hóa nhịp điệu Gestalt (Visual Rhythm):** Cả Card 2 và Card 4 đều được tính toán lề và chiều cao chuẩn chỉ (Row 34px ở Card 2 và Cell 66px ở Card 4), triệt tiêu hoàn toàn các khoảng đen trống vô nghĩa.
4. **Kiểm thử tự động:** Tất cả 127 bài kiểm tra hệ thống đều tiếp tục đạt chuẩn 100%.

