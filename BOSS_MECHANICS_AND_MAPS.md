# ⛩️ HỒ SƠ CHIẾN TRƯỜNG ĐẠI CHIẾN: CƠ CHẾ, KỸ NĂNG & THIẾT KẾ BẢN ĐỒ TỪNG BOSS
> **Dự án:** Yokai Onet Puzzle (Nối Thú Bách Quỷ Thần Thoại)  
> **Tài liệu:** Game Design Document (GDD) — Hệ Thống Trùm Đại Chiến & Thiết Kế Bản Đồ  
> **Phiên bản:** v1.0.0 (Dành cho Dev & Game Designer thẩm định)

---

## MỤC LỤC
1. [Triết Lý Vận Hành & Khung Chiến Đấu 2 Chiều](#1-triết-lý-vận-hành--khung-chiến-đấu-2-chiều)
2. [Boss 1: Yamata-no-Orochi (八岐大蛇 - Bát Kỳ Đại Xà)](#boss-1-yamata-no-orochi-八岐大蛇---bát-kỳ-đại-xà)
3. [Boss 2: Kasha (火車 - Hỏa Xa Ma Vương)](#boss-2-kasha-火車---hỏa-xa-ma-vương)
4. [Boss 3: Gashadokuro (がしゃどくろ - Dạ Xoa Cự Cốt)](#boss-3-gashadokuro-がしゃどくろ---dạ-xoa-cự-cốt)
5. [Boss 4: Tamamo-no-Mae (玉藻前 - Cửu Vĩ Bạch Diện Hồ)](#boss-4-tamamo-no-mae-玉藻前---cửu-vĩ-bạch-diện-hồ)
6. [Boss 5: Raijin & Fujin (Lôi Thần & Phong Thần)](#boss-5-raijin--fujin-lôi-thần--phong-thần)
7. [Bảng Ma Trận Tương Khắc Nguyên Tố & Kế Hoạch Đấu Trùm](#7-bảng-ma-trận-tương-khắc-nguyên-tố--kế-hoạch-đấu-trùm)

---

## 1. TRIẾT LÝ VẬN HÀNH & KHUNG CHIẾN ĐẤU 2 CHIỀU

Trong Yokai Onet, các màn Boss không đơn thuần là dọn bàn cờ tĩnh mà là **trận đối kháng thời gian thực giữa Người chơi + Linh Thú với Chúa Tể Bách Quỷ**:

```
[BÀN CỜ ONET CHIẾN TRƯỜNG]
      │
      ├─► Nối Cặp Ô Thành Công ──► Bắn Đạn Nguyên Tố Trừ Máu Boss (Damage = ATK x Combo x Hệ)
      ├─► Tích Lũy Combo (x2 ➜ x8) ──► Nạp Đầy Thanh Nộ Linh Thú (100% ➜ Bấm Dùng Ultimate)
      │
      ▼ (Phản Đòn Từ Boss Theo Chu Kỳ 8s - 14s)
[HIỆU ỨNG THIÊN TAI & BẪY PHÁ BÀN CỜ]
      ├─ Biến đổi ô (Đóng băng 2 lớp, Cháy rụi, Hóa đá, Đổi hình Shapeshifter)
      ├─ Bẫy Sinh Tử (Vòng đếm ngược đỏ 5s - 8s trên ô mục tiêu ➜ Trừ Tim ❤️ / Trừ Giờ)
      └─ Pha Cuồng Nộ (Enrage khi HP < 30%): Nhạc dồn dập, hồi chiêu giảm 50%
```

---

## BOSS 1: YAMATA-NO-OROCHI (八岐大蛇 - BÁT KỲ ĐẠI XÀ)

### 1.1. Hồ Sơ Chỉ Số
- **Danh hiệu:** Thần Xà Tám Đầu Vùng Đầm Lầy Koshi
- **Cấp độ xuất hiện:** Màn 30 (Trùm Cuối Chương 1 - Yokai) & Khiêu Chiến Boss Tuần Bậc 1
- **Hệ nguyên tố:** **Thủy / Hàn Băng (Water / Ice)**
- **Tổng Máu (Max HP):** **400 HP** (chia làm 8 mốc, tương ứng **50 HP/Đầu Xà**)
- **Nhịp độ hành động:** Mỗi **12 giây** xuất 1 chiêu
- **Thời gian màn đấu:** **220 giây** | **Mạng:** 10 ❤️
- **Linh Thú Khắc Tinh:** 🔥 **Hi-no-tori** (Hỏa thiêu rụi băng, x1.5 sát thương)

---

### 1.2. Cơ Chế Đặc Trưng: 8 Chiếc Đầu & Nguy Cơ Tái Sinh
- **Cắt Đầu Xà:** Mỗi khi Boss mất đủ 50 HP, hoạt ảnh chém đứt 1 đầu xà phát nổ kèm âm thanh Taiko đanh thép. Biểu tượng đầu xà trên thanh máu rơi rụng (`8/8 ➜ 7/8 ➜ ... ➜ 1/8`).
- **Nguy Cơ Tái Sinh:** Nếu trong vòng **25 giây** người chơi không gây đủ 50 sát thương để chặt rơi đầu kế tiếp, Orochi sẽ gầm rú **mọc lại 1 đầu (+50 HP)** và phong ấn thêm 2 ô đá cản đường.

---

### 1.3. Bộ Kỹ Năng Chi Tiết

| Kỹ Năng | Chu Kỳ | Hiệu Ứng Bàn Cờ | Cảnh Báo & Hóa Giải | Hình Phạt Nếu Thất Bại |
| :--- | :---: | :--- | :--- | :--- |
| **1. Hơi Thở Băng Hà** *(Glacial Breath)* | 12s | Đóng băng **3 ô ngẫu nhiên** thành **Băng 2 Tầng** (cần nối 2 lần hoặc dùng chiêu Lửa). | Băng tỏa hơi lạnh màu xanh ngọc bích. Nối cặp chứa ô băng để rã 1 lớp. | Ô bị đóng băng không thể dọn sạch trong 1 lượt, làm chậm nhịp combo. |
| **2. Độc Dịch Sa Lầy** *(Venom Mud)* | 24s | Phun nọc độc lên 4 ô ở mép biên ngoài cùng. Đường nối laser đi qua vùng độc chỉ sáng trong 0.2s. | Vết độc sủi bọt màu tím lục. Có thể dùng **Cổng Torii (Portal A ⇄ B)** để nối xuyên tường vòng qua bãi độc. | Rối mắt và khó nhận biết đường nối vừa đi qua. |
| **3. Bão Tuyết Cuồng Nộ** *(Blizzard Enrage)* | Khi HP < 100 (còn 2 đầu) | Toàn màn hình tuyết rơi dày đặc; **thời gian đếm ngược trôi nhanh gấp 1.3 lần**, chu kỳ xuất chiêu rút xuống **7 giây/lần**. | Màn hình viền sương giá băng tuyết, tiếng gió rít gầm rú. | Áp lực thời gian cực lớn ép người chơi phải xả Nộ chiêu của Pet ngay lập tức. |

---

### 1.4. Thiết Kế Bản Đồ Chiến Trường (Map Layout)
- **Kích thước:** **8 Hàng $\times$ 12 Cột** (96 ô)
- **Quy tắc trượt:** `movement: "none"` (Cổ điển Pikachu 2003, giữ nguyên vị trí để tập trung xử lý băng và độc)
- **Đặc trưng địa hình ban đầu:**
  - 4 khối băng tuyết bố trí đối xứng tại 4 góc chiến trường.
  - 2 Cổng không gian Torii bố trí ở Hàng 4, Cột 0 (Cổng A) và Hàng 4, Cột 13 (Cổng B).
- **Sơ đồ bố cục bàn cờ (Arena Blueprint):**

```
      [C1] [C2] [C3] [C4] [C5] [C6] [C7] [C8] [C9] [C10] [C11] [C12]
[R1]   ❄️   .    .    .    .    .    .    .    .    .     .    ❄️
[R2]   .    .    .    .    .    .    .    .    .    .     .    .
[R3]   .    .    .    .    .    .    .    .    .    .     .    .
[R4] ⛩️A   .    .    .    .    .    .    .    .    .     .   ⛩️B
[R5]   .    .    .    .    .    .    .    .    .    .     .    .
[R6]   .    .    .    .    .    .    .    .    .    .     .    .
[R7]   .    .    .    .    .    .    .    .    .    .     .    .
[R8]   ❄️   .    .    .    .    .    .    .    .    .     .    ❄️

Ghi chú: 
  ❄️: Ô Băng 2 tầng ban đầu (Frost Lock)
 ⛩️A, ⛩️B: Cổng không gian Torii đối xứng tại hàng giữa
```

- **Bầu không khí môi trường (VFX & BGM):**
  - **Nền:** Màu xanh đen vực thẳm hồ nước lạnh (`0x0a192f` sang `0x020813`).
  - **Hạt Ambient:** Tinh thể tuyết rơi chầm chậm, tăng tốc thành bão xoáy khi Boss vào pha cuồng nộ.
  - **Nhạc nền:** Nhạc sáo Shakuhachi u buồn kết hợp nhịp trống Taiko dồn dập tiếng rít của rắn thần.

---

### 1.5. Chiến Lợi Phẩm Rơi Ra
- **Xu vàng:** 1,000 Xu
- **Thức ăn Linh Thú:** 3x 🍡 Dango Ngũ Sắc (+150 EXP) + 1x 🍙 Onigiri Rong Biển (+300 EXP)
- **Đá Tiến Hóa:** 1x Đá Hàn Băng (Dùng thức tỉnh Linh Thú Hệ Thủy)
- **Mở khóa Album:** Danh hiệu *“Kẻ Chém Rơi Bát Đầu”* + Mở khóa thẻ bài Thần Xà Yamata-no-Orochi mạ vàng.

---

## BOSS 2: KASHA (火車 - HỎA XA MA VƯƠNG)

### 2.1. Hồ Sơ Chỉ Số
- **Danh hiệu:** Ma Vương Ngự Cỗ Xe Lửa Địa Ngục
- **Cấp độ xuất hiện:** Màn 45 (Trùm Cuối Chương 2 - Hỏa Ngục)
- **Hệ nguyên tố:** **Hỏa / Dung Nham (Fire / Magma)**
- **Tổng Máu (Max HP):** **600 HP**
- **Nhịp độ hành động:** Mỗi **10 giây** xuất 1 chiêu
- **Thời gian màn đấu:** **200 giây** | **Mạng:** 10 ❤️
- **Linh Thú Khắc Tinh:** 🐉 **Rồng Ryujin** (Thủy dập tắt lửa, x1.5 sát thương)

---

### 2.2. Cơ Chế Đặc Trưng: Vệt Bánh Xe Lửa & Trọng Lực Cuồng Loạn
- **Vệt Bánh Xe Lửa (Blazing Wheel Tracks):** Kasha cưỡi xe lửa quét ngang hoặc dọc một hàng cờ. Hàng này biến thành dải lửa rực cháy trong **8 giây**. **Mọi đường laser KHÔNG THỂ nối xuyên qua dải lửa!** Người chơi bị chia cắt bàn cờ làm 2 nửa độc lập, buộc phải tìm cặp trong từng nửa hoặc nối vòng ra ngoài mép viền.
- **Cuồng Loạn Đảo Trọng Lực (Gravity Flip):** Kasha thét lên làm bàn cờ bị đổi hướng trượt mỗi khi mất 200 HP.

---

### 2.3. Bộ Kỹ Năng Chi Tiết

| Kỹ Năng | Chu Kỳ | Hiệu Ứng Bàn Cờ | Cảnh Báo & Hóa Giải | Hình Phạt Nếu Thất Bại |
| :--- | :---: | :--- | :--- | :--- |
| **1. Vệt Bánh Xe Lửa** *(Inferno Tracks)* | 14s | Tạo 1 vệt lửa đỏ rực chia cắt hàng ngang hoặc cột dọc trong **8 giây**. Laser bị cản hoàn toàn. | Bánh xe lửa kêu rít kèn kẹt trước khi vệt lửa bốc lên. Ép người chơi nối vòng viền ngoài. | Làm đứt mọi đường nối trực diện giữa 2 nửa bàn cờ. |
| **2. Đảo Chiều Trọng Lực** *(Gravity Inversion)* | Mỗi khi mất 150 HP | Đảo hướng trượt từ **Dồn Xuống Đáy** $\to$ **Dồn Lên Đỉnh** $\to$ **Dồn Vào Tâm**. | Mũi tên lửa nhấp nháy chỉ hướng trượt mới trong 1.5s kèm tiếng còi xe lửa vang lên. | Xáo trộn toàn bộ toan tính ghi nhớ vị trí ô của người chơi. |
| **3. Bom Lửa Đếm Ngược** *(Doomsday Spark)* | 10s | Thả **2 ô Bom Nhiệt Độc** có đồng hồ đếm ngược **6 giây**. | Vòng lửa thu nhỏ dần trên 2 ô mục tiêu kèm tiếng tích tắc dồn dập. | Nếu sau 6s không nối cặp giải cứu: **Thiêu rụi ngay 8 giây trên thanh thời gian**! |
| **4. Biển Lửa Địa Ngục** *(Hellfire Enrage)* | Khi HP < 180 (30%) | Toàn bộ bàn cờ bốc khói đen; thời gian xuất chiêu giảm còn **6 giây/lần**, vệt lửa xuất hiện liên tục 2 đường. | Dùng Rồng Ryujin xả Tuyệt Kỹ: Mưa rào cuốn trôi toàn bộ lửa và làm choáng Kasha 8 giây. | Không dùng chiêu Thủy thì bàn cờ gần như bị chia cắt hoàn toàn. |

---

### 2.4. Thiết Kế Bản Đồ Chiến Trường (Map Layout)
- **Kích thước:** **8 Hàng $\times$ 10 Cột** (80 ô)
- **Quy tắc trượt:** `movement: "down"` (Dồn xuống đáy ban đầu, sau đó bị Boss đảo sang `up` hoặc `center_row`)
- **Đặc trưng địa hình ban đầu:**
  - 2 Cột lửa dung nham cản đường vĩnh viễn ở trung tâm (Cột 5 & 6 ở hàng 4 & 5).
  - Bàn cờ hẹp ngang hơn giúp người chơi cảm nhận rõ độ nguy hiểm của vệt lửa cắt ngang.
- **Sơ đồ bố cục bàn cờ (Arena Blueprint):**

```
      [C1] [C2] [C3] [C4] [C5] [C6] [C7] [C8] [C9] [C10]
[R1]   .    .    .    .    .    .    .    .    .    .
[R2]   .    .    .    .    .    .    .    .    .    .
[R3]   .    .    .    .    .    .    .    .    .    .
[R4]   .    .    .    .   🌋   🌋    .    .    .    .
[R5]   .    .    .    .   🌋   🌋    .    .    .    .
[R6]   .    .    .    .    .    .    .    .    .    .
[R7]   .    .    .    .    .    .    .    .    .    .
[R8]   .    .    .    .    .    .    .    .    .    .

Ghi chú:
  🌋: Trụ Dung Nham Vĩnh Viễn (Magma Pillar không thể phá) buộc đường nối phải bẻ khúc cua.
  Khi Kasha ra chiêu: Một hàng [R] bất kỳ sẽ bốc cháy đỏ rực không cho tia laser đi qua.
```

- **Bầu không khí môi trường (VFX & BGM):**
  - **Nền:** Hỏa ngục đỏ cam rực lửa (`0x2b0908` sang `0x140303`).
  - **Hạt Ambient:** Tàn tro bay lơ lửng, đốm than hồng bốc lên từ đáy màn hình.
  - **Nhạc nền:** Trống Taiko phối cùng guitar điện phong cách Rock Nhật Bản cuồng nhiệt, tiếng bánh xe sắt nghiến trên đường ray địa ngục.

---

### 2.5. Chiến Lợi Phẩm Rơi Ra
- **Xu vàng:** 1,500 Xu
- **Thức ăn Linh Thú:** 4x 🍡 Dango Ngũ Sắc + 2x 🍙 Onigiri Rong Biển + 1x 🐟 Taiyaki Kim Ngân (+1,000 EXP)
- **Đá Tiến Hóa:** 1x Đá Hỏa Ngục (Dùng thức tỉnh Linh Thú Hệ Hỏa)
- **Mở khóa Album:** Thẻ bài Kasha Hỏa Xa Ma Vương + Hiệu ứng vệt laser rực lửa độc quyền.

---

## BOSS 3: GASHADOKURO (がしゃどくろ - DẠ XOA CỰ CỐT)

### 3.1. Hồ Sơ Chỉ Số
- **Danh hiệu:** Khổng Lồ Xương Oan Hồn Chiến Trận
- **Cấp độ xuất hiện:** Màn 60 (Trùm Cuối Chương 3 - Cốt Ma Cổ Mộ)
- **Hệ nguyên tố:** **Thổ / Cốt Ma (Earth / Undead)**
- **Tổng Máu (Max HP):** **850 HP**
- **Nhịp độ hành động:** Mỗi **14 giây** xuất 1 chiêu
- **Thời gian màn đấu:** **210 giây** | **Mạng:** 10 ❤️
- **Linh Thú Khắc Tinh:** 🦊 **Cáo Inari** (Tâm Linh Ánh Sáng xua tan hắc ám, x1.5 sát thương)

---

### 3.2. Cơ Chế Đặc Trưng: Đập Nát Địa Tầng & Xiềng Xích Phong Ấn
- **Địa Chấn Sụp Đổ:** Gashadokuro giậm bàn chân khổng lồ làm rung chuyển màn hình, biến các ô trống đã ăn trước đó mọc lên những **Khối Đá Hộc Cản Đường** mới, làm bít kín các khe hở thông thoáng.
- **Xiềng Xích Oan Hồn & Chìa Khóa Cổ:** Boss xích 2 cặp ô lại. Người chơi bắt buộc phải dọn sạch **ô Chìa Khóa Cổ (Skeleton Key)** nằm ở vị trí hiểm hóc thì toàn bộ xích sắt mới nổ tung.

---

### 3.3. Bộ Kỹ Năng Chi Tiết

| Kỹ Năng | Chu Kỳ | Hiệu Ứng Bàn Cờ | Cảnh Báo & Hóa Giải | Hình Phạt Nếu Thất Bại |
| :--- | :---: | :--- | :--- | :--- |
| **1. Địa Chấn Vỡ Sàn** *(Bone Stomp)* | 14s | Giậm gót chân làm rung màn hình, biến **3 ô trống ngẫu nhiên thành Đá Hộc cản đường**. | Màn hình rung giật, bụi đất rơi lả tả. Phải ăn các ô xung quanh để tìm đường vòng. | Lối đi trống vừa mở ra bị bít kín lại. |
| **2. Xích Oan Hồn** *(Skeleton Chains)* | 24s | Khóa cứng 2 cặp ô bằng xích sắt. Sinh ra **1 ô Chìa Khóa Cổ** ở rìa ngoài. | Biểu tượng ổ khóa xích sắt kêu loảng xoảng. Ưu tiên tìm đường nối đến ô Chìa Khóa Cổ. | Các ô bị xích không thể chọn hay di chuyển. |
| **3. Màn Đêm Vĩnh Dạ** *(Bone Fog)* | 18s | Thổi sương đen che khuất vùng trung tâm **3x3 trong 6 giây** (các ô biến thành bóng đen mờ). | Dùng ngón tay hoặc chuột rê qua ô để tạm soi sáng ô đó, hoặc dùng Cáo Inari phá sương mù. | Mất tầm nhìn các ô ở trung tâm bàn cờ. |
| **4. Tiếng Nghiến Răng Tử Vong** *(Death Rattle)* | Khi HP < 250 (30%) | Boss chuẩn bị tung đòn hủy diệt trong **8 giây**. Đòi hỏi người chơi phải đạt ít nhất **Combo x3** để phá tụ khí! | Vòng âm ba rung bần bật, đồng hồ cát đếm ngược đỏ rực từ `8s ➜ 0s`. | Nếu sau 8s không đạt Combo x3: **Gashadokuro giáng đòn trừ thẳng 2 Mạng ❤️!** |

---

### 3.4. Thiết Kế Bản Đồ Chiến Trường (Map Layout)
- **Kích thước:** **8 Hàng $\times$ 10 Cột** (80 ô)
- **Quy tắc trượt:** `movement: "center_col"` (Trọng lực hút dồn từ hai cạnh trái/phải vào giữa cột trung tâm)
- **Đặc trưng địa hình ban đầu:**
  - 4 Ô Đá Hộc cổ đại bố trí hình thoi ở trung tâm bàn cờ.
  - Vùng trung tâm là nơi dễ bị sương mù bao phủ nhất.
- **Sơ đồ bố cục bàn cờ (Arena Blueprint):**

```
      [C1] [C2] [C3] [C4] [C5] [C6] [C7] [C8] [C9] [C10]
[R1]   .    .    .    .    .    .    .    .    .    .
[R2]   .    .    .    .    .    .    .    .    .    .
[R3]   .    .    .    .   🪨    .    .    .    .    .
[R4]   .    .    .   🪨   💀   🪨    .    .    .    .
[R5]   .    .    .   🪨   💀   🪨    .    .    .    .
[R6]   .    .    .    .   🪨    .    .    .    .    .
[R7]   .    .    .    .    .    .    .    .    .    .
[R8]   .    .    .    .    .    .    .    .    .    .

Ghi chú:
  🪨: Đá Hộc Cản Đường (Cần dùng Bom hoặc nối vòng)
  💀: Vùng Hố Sọ Oan Hồn (Nơi Boss thường xuyên thả Xích Oan Hồn)
```

- **Bầu không khí môi trường (VFX & BGM):**
  - **Nền:** Hang động cổ mộ xanh rêu u tối (`0x111618` sang `0x07090a`).
  - **Hạt Ambient:** Đốm ma trơi xanh lập lòe, mảnh vụn xương bay lất phất.
  - **Nhạc nền:** Tiếng gõ mõ rùng rợn, tiếng sọ người nghiến lách cách nhịp điệu rùng rợn, tiếng tụng kinh trừ tà xa xăm.

---

### 3.5. Chiến Lợi Phẩm Rơi Ra
- **Xu vàng:** 2,000 Xu
- **Thức ăn Linh Thú:** 5x 🍡 Dango Ngũ Sắc + 3x 🍙 Onigiri Rong Biển + 1x 🐟 Taiyaki Kim Ngân
- **Đá Tiến Hóa:** 1x Đá Tâm Linh Cổ Thần (Dùng thức tỉnh Linh Thú Cáo Inari)
- **Mở khóa Album:** Thẻ bài Gashadokuro Dạ Xoa Cự Cốt + Khung avatar xương trắng Gothic.

---

## BOSS 4: TAMAMO-NO-MAE (玉藻前 - CỬU VĨ BẠCH DIỆN HỒ)

### 4.1. Hồ Sơ Chỉ Số
- **Danh hiệu:** Tuyệt Sắc Yêu Hồ Thao Túng Ảo Giác
- **Cấp độ xuất hiện:** Màn 75 (Trùm Cuối Chương 4 - Ảo Cảnh Cung Điện)
- **Hệ nguyên tố:** **Mộng Cảnh / Ảo Thuật (Illusion / Chaos)**
- **Tổng Máu (Max HP):** **1,100 HP**
- **Nhịp độ hành động:** Mỗi **9 giây** xuất 1 chiêu
- **Thời gian màn đấu:** **230 giây** | **Mạng:** 10 ❤️
- **Linh Thú Khắc Tinh:** 🦊 **Cáo Inari Thức Tỉnh** & 🔥 **Hi-no-tori**

---

### 4.2. Cơ Chế Đặc Trưng: Ảo Ảnh Biến Hình & Hoán Đổi Cực Đoan
- **Linh Hồn Biến Hình Hàng Loạt (Mass Shapeshift):** Phù phép khiến **4 ô ngẫu nhiên liên tục biến đổi chân dung** mỗi 3.5 giây. Người chơi phải quan sát nhịp nhảy hình của cả 2 ô để bắt đúng lúc chúng trùng nhau.
- **Mị Hoặc Tráo Đổi (Charm Swap):** Khi người chơi vừa click chọn ô thứ nhất, Tamamo có 40% tỉ lệ **hoán đổi ô thứ hai sang vị trí khác** trên bàn cờ.

---

### 4.3. Bộ Kỹ Năng Chi Tiết

| Kỹ Năng | Chu Kỳ | Hiệu Ứng Bàn Cờ | Cảnh Báo & Hóa Giải | Hình Phạt Nếu Thất Bại |
| :--- | :---: | :--- | :--- | :--- |
| **1. Biến Hình Vạn Hóa** *(Mirage Shift)* | 9s | Chọn **4 ô trên bàn cờ liên tục đổi hình dạng** mỗi 3 giây. | Biểu tượng lá phong 🍃 bay quanh ô. Quan sát nhịp biến hình để bắt lúc 2 ô trùng khớp. | Bẫy sai nhịp khiến người chơi click hụt và đứt chuỗi combo. |
| **2. Tráo Đổi Vị Trí** *(Charm Swap)* | Nội tại (tỷ lệ 40%) | Khi người chơi chọn 1 ô, Boss lập tức tráo đổi ô ghép đôi của nó sang vị trí khác. | Khói hồng hồ ly nổ lách tách tại vị trí mới. Đòi hỏi phản xạ lia mắt tức thì. | Làm hỏng toan tính nước đi định sẵn của người chơi. |
| **3. Cửu Vĩ Phong Khí** *(Nine-Tail Spirit Lock)* | 22s | Phong ấn thanh Nộ của Linh thú trong **12 giây** (ngăn không cho bấm dùng chiêu cuối). | Dải lụa hồ ly trói chặt khung avatar Linh Thú. Phải canh xả Nộ trước khi bị phong ấn. | Không thể dùng Ultimate để giải cứu bàn cờ trong 12 giây. |
| **4. Gương Soi Nghịch Đảo** *(Mirror Realm Enrage)* | Khi HP < 330 (30%) | Toàn bộ bàn cờ bị **lật ngược gương đối xứng trái-phải** hoặc đảo ngược chiều chữ. | Ánh sáng hồng tím lóa mắt, bàn cờ xoay 180 độ. Cần giữ bình tĩnh định vị lại tọa độ. | Gây chóng mặt và rối loạn thị giác cực độ. |

---

### 4.4. Thiết Kế Bản Đồ Chiến Trường (Map Layout)
- **Kích thước:** **8 Hàng $\times$ 12 Cột** (96 ô)
- **Quy tắc trượt:** `movement: "chaos"` (Mỗi lần ăn 1 cặp, trọng lực ngẫu nhiên đổi 1 trong 4 hướng)
- **Đặc trưng địa hình ban đầu:**
  - Bố trí theo hình hoa sen 9 cánh, có 2 Cổng Torii ở biên và các ô Băng/Đá rải rác xen kẽ.
- **Sơ đồ bố cục bàn cờ (Arena Blueprint):**

```
      [C1] [C2] [C3] [C4] [C5] [C6] [C7] [C8] [C9] [C10] [C11] [C12]
[R1]   .    .    .    🌸   .    .    .    .    🌸    .     .    .
[R2]   .    .    🌸   .    .    .    .    .    .     🌸    .    .
[R3]   .    🌸   .    .    .    .    .    .    .     .     🌸   .
[R4] ⛩️A   .    .    .    .   🦊   🦊   .    .     .     .   ⛩️B
[R5] ⛩️A   .    .    .    .   🦊   🦊   .    .     .     .   ⛩️B
[R6]   .    🌸   .    .    .    .    .    .    .     .     🌸   .
[R7]   .    .    🌸   .    .    .    .    .    .     🌸    .    .
[R8]   .    .    .    🌸   .    .    .    .    🌸    .     .    .

Ghi chú:
  🌸: Ô Hoa Sen Biến Hình (Shapeshifter Tile liên tục đổi hình dạng)
  🦊: Tâm Điểm Cung Điện Hồ Ly (Khu vực dễ bị tráo đổi ô)
```

- **Bầu không khí môi trường (VFX & BGM):**
  - **Nền:** Cung điện sương khói tím hồng huyền ảo (`0x230c33` sang `0x0f0417`).
  - **Hạt Ambient:** Cánh hoa anh đào màu tím và đốm lửa hồ ly lượn lờ.
  - **Nhạc nền:** Đàn Koto réo rắt ma mị, tiếng cười khúc khích mê hoặc của mỹ nữ ngàn năm.

---

### 4.5. Chiến Lợi Phẩm Rơi Ra
- **Xu vàng:** 3,000 Xu
- **Thức ăn Linh Thú:** 6x 🍡 Dango Ngũ Sắc + 4x 🍙 Onigiri Rong Biển + 2x 🐟 Taiyaki Kim Ngân
- **Đá Tiến Hóa:** 2x Ngọc Cửu Vĩ Huyền Ảo (Nguyên liệu tiến hóa Bậc 3 Thần Thú)
- **Mở khóa Album:** Thẻ bài Tamamo-no-Mae Cửu Vĩ Hồ + Giao diện nền bàn cờ Cung Điện Hoa Sen Hồng.

---

## BOSS 5: RAIJIN & FUJIN (LÔI THẦN & PHONG THẦN)

### 5.1. Hồ Sơ Chỉ Số
- **Danh hiệu:** Song Thần Thiên Tai Tối Thượng
- **Cấp độ xuất hiện:** Màn 100 (Đại Trùm Cuối Hoàn Thành Game) & Đấu Trường Xếp Hạng Vô Tận
- **Hệ nguyên tố:** **Phong Lôi (Thunder / Wind)**
- **Tổng Máu (Max HP):** **1,500 HP** (Raijin **750 HP** + Fujin **750 HP**)
- **Nhịp độ hành động:** Mỗi **8 giây** xuất 1 chiêu (cực dồn dập!)
- **Thời gian màn đấu:** **240 giây** | **Mạng:** 10 ❤️
- **Linh Thú Khắc Tinh:** Đội hình Linh Thú đã thức tỉnh Cảnh Giới 3 (Max Level 50)

---

### 5.2. Cơ Chế Đặc Trưng: Tác Chiến Kép & Lôi Phạt Tử Vong
- **Song Boss Độc Lập:** Màn hình có 2 thanh máu song song: Raijin (Lôi) và Fujin (Phong). Người chơi gây sát thương sẽ trừ máu dựa trên hệ của cặp ô vừa nối:
  - Nối cặp hệ Kim/Lôi ➜ Trừ máu Fujin (Phong).
  - Nối cặp hệ Mộc/Phong ➜ Trừ máu Raijin (Lôi).
- **Tuyệt Kỹ Song Sát Khi Một Boss Ngã Xuống:** Khi 1 trong 2 con chết trước, con còn lại sẽ gầm thét cuồng nộ thừa hưởng toàn bộ sức mạnh của đồng đội, **tăng tốc xuất chiêu lên 4 giây/lần!** Chiến thuật tối ưu là cấu máu cả 2 đều nhau và kết liễu gần như cùng lúc!

---

### 5.3. Bộ Kỹ Năng Chi Tiết

| Kỹ Năng | Boss Xuất Chiêu | Hiệu Ứng Bàn Cờ | Cảnh Báo & Hóa Giải | Hình Phạt Nếu Thất Bại |
| :--- | :---: | :--- | :--- | :--- |
| **1. Bão Sét Tê Liệt** *(EMP Shock)* | ⚡ Raijin (15s) | Đánh trống sấm làm **vô hiệu hóa 3 nút bổ trợ** (Gợi ý, Đổi vị trí, Phá cặp) trong 12 giây. | Tia sét giật sáng chói khung nút bấm dưới đáy màn hình. | Buộc người chơi phải hoàn toàn tự lực dùng mắt tìm ô. |
| **2. Cuồng Phong Hoán Vị** *(Gale Cyclone)* | 🌪️ Fujin (18s) | Mở bao tải gió thổi tung **Shuffle toàn bộ bàn cờ** sang vị trí ngẫu nhiên mới. | Lốc xoáy cuốn các ô quay tròn 1 vòng rồi đáp xuống vị trí mới. | Phá hủy toàn bộ các cặp ô người chơi đang chuẩn bị ăn. |
| **3. Lôi Phạt Tử Vong** *(Thunderbolt Smite)* | ⚡ Raijin (12s) | Đánh dấu **2 ô có tia sét chạy quanh** đếm ngược **5 giây**. | Vòng sấm sét thu nhỏ dần trên 2 ô kèm tiếng sấm gầm rền vang. Ưu tiên phá cặp này ngay! | Nếu sau 5 giây không giải cứu: **Sét đánh nổ làm mất ngay 1 Tim ❤️!** |
| **4. Lốc Xoáy Hút Ô** *(Vortex Devour)* | 🌪️ Fujin (16s) | Tạo một lốc xoáy ở giữa hút 2 ô cờ vào hư không trong 8 giây (không thể chọn). | Lốc xoáy tím cuộn tròn ở tâm bàn cờ. | Giảm diện tích thao tác của người chơi. |
| **5. Cuồng Nộ Thiên Tai Kép** *(Cataclysmic Rage)* | Khi 1 Boss bị hạ gục | Boss sống sót kích hoạt Lôi Phong Hợp Bích: Bão sét liên tục, chiêu xuất mỗi **4 giây/lần**! | Màn hình chớp giật liên hồi, nhạc trống Taiko cuồng nộ cực đại. | Tốc độ phá cờ phải cực nhanh trước khi hết tim. |

---

### 5.4. Thiết Kế Bản Đồ Chiến Trường (Map Layout)
- **Kích thước:** **8 Hàng $\times$ 12 Cột** (96 ô)
- **Quy tắc trượt:** `movement: "split_vertical"` (Nửa trên dồn lên trên, nửa dưới dồn xuống dưới)
- **Đặc trưng địa hình ban đầu:**
  - 2 Cột thu lôi sấm sét ở Cột 3 và Cột 10.
  - 4 Cổng Torii (2 Cổng bên trái và 2 Cổng bên phải) tạo mạng lưới giao thông không gian dày đặc.
- **Sơ đồ bố cục bàn cờ (Arena Blueprint):**

```
      [C1] [C2] [C3] [C4] [C5] [C6] [C7] [C8] [C9] [C10] [C11] [C12]
[R1]   .    .    ⚡   .    .    .    .    .    .    ⚡     .    .
[R2] ⛩️A1  .    .    .    .    .    .    .    .    .     .   ⛩️B1
[R3]   .    .    .    .    .    .    .    .    .    .     .    .
[R4]   .    .    .    .    🌪️  🌪️   .    .    .    .     .    .
[R5]   .    .    .    .    🌪️  🌪️   .    .    .    .     .    .
[R6]   .    .    .    .    .    .    .    .    .    .     .    .
[R7] ⛩️A2  .    .    .    .    .    .    .    .    .     .   ⛩️B2
[R8]   .    .    ⚡   .    .    .    .    .    .    ⚡     .    .

Ghi chú:
  ⚡: Trụ Thu Lôi (Vùng giật sét của Raijin)
  🌪️: Mắt Bão Cuồng Phong (Vùng gió xoáy của Fujin)
  ⛩️A1, ⛩️A2, ⛩️B1, ⛩️B2: Hệ thống 4 Cổng Torii dịch chuyển đa chiều
```

- **Bầu không khí môi trường (VFX & BGM):**
  - **Nền:** Bầu trời giông bão mây đen vần vũ xé toạc bởi tia chớp (`0x0d131f` sang `0x1f1a3a`).
  - **Hạt Ambient:** Tia sét hồ quang phóng ngẫu nhiên trên màn hình, mưa bão nghiêng ngả.
  - **Nhạc nền:** Bản giao hưởng trống sấm Taiko đỉnh cao kết hợp dàn đồng ca Nhật Bản bi tráng, tiếng sấm nổ vang trời.

---

### 5.5. Chiến Lợi Phẩm Rơi Ra
- **Xu vàng:** 5,000 Xu
- **Thức ăn Linh Thú:** 10x 🍡 Dango Ngũ Sắc + 5x 🍙 Onigiri Rong Biển + 3x 🐟 Taiyaki Kim Ngân + 2x 🍶 Rượu Thần Đạo Shinto (+5,000 EXP)
- **Đá Tiến Hóa:** 3x Trái Tim Lôi Phong Thần Thoại
- **Mở khóa Album:** Tượng Vàng Raijin & Fujin + Danh hiệu *“Kẻ Chế Ngự Thiên Tai”* + Vương Miện Quán Quân Bách Quỷ.

---

## 7. BẢNG MA TRẬN TƯƠNG KHẮC NGUYÊN TỐ & KẾ HOẠCH ĐẤU TRÙM

```
                     ┌──────────────────┐
                     │   🔥 HỎA         │
                     │  (Hi-no-tori)    │
                     └─────────┬────────┘
                               │ Khắc chế (x1.5 Dmg)
                               ▼
┌──────────────────┐  Khắc chế  ┌──────────────────┐
│   ⚡ LÔI / TÂM   │ ─────────► │  ❄️ THỦY / HÀN   │
│   (Cáo Inari)    │ (x1.5 Dmg) │  (Rồng Ryujin)   │
└─────────▲────────┘            └─────────┬────────┘
          │                               │
          └───────────────────────────────┘
                     Khắc chế (x1.5 Dmg)
```

| Boss | Nguyên Tố | Sát Thương Nhận Từ Hỏa 🔥 | Sát Thương Nhận Từ Thủy ❄️ | Sát Thương Nhận Từ Tâm Linh ⚡ |
| :--- | :---: | :---: | :---: | :---: |
| **1. Yamata-no-Orochi** | Thủy/Băng | **x1.5 (Bạo Kích)** | x0.75 (Kháng) | x1.0 (Bình thường) |
| **2. Kasha** | Hỏa/Nham | x0.75 (Kháng) | **x1.5 (Dập Lửa)** | x1.0 (Bình thường) |
| **3. Gashadokuro** | Thổ/Cốt | x1.0 (Bình thường) | x1.0 (Bình thường) | **x1.5 (Thanh Tẩy)** |
| **4. Tamamo-no-Mae** | Ảo Thuật | x1.25 (Thiêu Ảo) | x1.0 (Bình thường) | **x1.5 (Phá Ảo)** |
| **5. Raijin & Fujin** | Phong Lôi | Cần phối hợp Linh Thú Max Cấp để dồn sát thương cân bằng cả 2 mục tiêu |

---
*Tài liệu này là căn cứ kỹ thuật chính xác để triển khai cấu hình trong `levels.json`, `BossManager.ts` và các hệ thống VFX trong `GameScene.ts`.*
