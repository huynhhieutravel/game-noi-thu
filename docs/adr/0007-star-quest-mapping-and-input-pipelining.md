# ADR 0007: Đồng Bộ Hóa Đánh Giá Sao (Star Quest Mapping) và Cơ Chế Thao Tác Gối Đầu (Input Pipelining)

## Trạng thái
**ĐÃ CHẤP NHẬN (ACCEPTED)** - Ngày 19/10/2026

## Bối cảnh
Trong đợt mô phỏng kiểm thử UX thực tế trên trình duyệt (Browser Simulation QA):
1. **Lệch pha hiển thị đánh giá sao (Star Quest Mapping Disconnect):**
   - Khi hoàn thành bàn chơi (ví dụ Màn 1), màn hình Chiến Thắng (Victory Modal) hiển thị danh sách 3 Nhiệm Vụ phụ:
     - `Nhiệm vụ 1: Hoàn thành màn chơi` `[✓ ĐẠT]`
     - `Nhiệm vụ 2: Đạt 1 Chuỗi Combo x3` `[✓ ĐẠT]`
     - `Nhiệm vụ 3: Giữ trên 50% thời gian` `[✓ ĐẠT]`
   - Tuy nhiên, chỉ có 1 ngôi sao vàng được trao trên vương miện và tiêu đề hiển thị `CHIẾN THẮNG 1 SAO!`.
   - **Nguyên nhân cốt lõi:** Trong `GameScene.ts`, logic cũ kiểm tra điều kiện `if (this.levelConfig.isStopwatch)` và ghi đè `earnedStars = (elapsed <= 45s ? 3 : elapsed <= 75s ? 2 : 1)`. Bất kể người chơi hoàn thành bao nhiêu nhiệm vụ, nếu thời gian vượt quá 75s thì chỉ nhận được 1 sao! Điều này phá vỡ kỳ vọng trực quan của người chơi (Cognitive Dissonance), khiến người chơi cảm thấy game bất công hoặc bị lỗi.

2. **Hiện tượng nuốt thao tác khi bấm nhanh (Dropped Taps during Match Resolve):**
   - Khi người chơi thực hiện nối 2 ô linh thú, game khóa tương tác `isProcessingMatch = true` trong ~200ms để chạy hiệu ứng laser kết nối và làm biến mất các ô.
   - Những game thủ chơi tốc độ cao thường chạm sẵn vào ô tiếp theo trước khi tia laser kịp tắt. Cú chạm này bị hủy thẳng cánh (`return early`), khiến thao tác nối kế tiếp bị hụt, gây cảm giác game "đơ/khựng".

3. **Thiếu định hướng tiến trình cho Ô Thần Khí (Relic Slot Empty State):**
   - Người chơi mới khi bắt đầu các màn đầu tiên nhìn thấy ô Cổ Vật hiển thị `Chưa Gắn Cổ Vật` và khi bấm vào chỉ nhận thông báo cụt lủn `Chưa có Thần Khí kích hoạt`.

4. **Tương phản nhận diện vật phẩm đặc biệt trên màn hình nhỏ:**
   - Hũ May Mắn (Lucky Pot) và Cổng Torii (Wormhole Portal) chưa có hiệu ứng nhịp thở (breathing pulse) tinh tế để phân biệt rõ ràng với các ô thường.

---

## Quyết định Kiến trúc & UX

### 1. Đồng Bộ Hóa Đánh Giá Sao (Star Quest Mapping)
- **Quy tắc tuyệt đối:** Số sao thưởng (`earnedStars`) phải tương ứng 1:1 với số lượng Nhiệm Vụ Phụ đạt được hiển thị trong bảng checklist:
  $$\text{earnedStars} = \text{clamp}\Big( \sum_{i=1}^3 (\text{quest}_i\text{Achieved} ? 1 : 0),\, 1,\, 3 \Big)$$
- Loại bỏ hoàn toàn khối ghi đè `isStopwatch` timer ẩn khỏi `handleVictory` và `showVictoryModal`.
- Đồng bộ danh hiệu sao:
  - 3 Sao: `🌟 HOÀN HẢO 3 SAO (+50 XU THƯỞNG)! 🌟`
  - 2 Sao: `⭐ XUẤT SẮC 2 SAO! ⭐`
  - 1 Sao: `CHIẾN THẮNG 1 SAO!`

### 2. Thao Tác Gối Đầu (Input Pipelining)
- Thêm cơ chế đệm vào `src/game/Board.ts`:
  - Thuộc tính `private queuedInput: GridPoint | null = null`.
  - Khi người chơi chạm vào ô hợp lệ trong thời gian `isProcessingMatch == true`, lưu tọa độ ô vào `this.queuedInput`.
  - Ngay khi `setProcessingMatch(false)` hoặc watchdog 750ms được giải phóng, `processQueuedInput()` sẽ kích hoạt cú nhấp chuột tiếp theo vào frame kế tiếp (16ms) sau khi lưới ổn định.
  - Tự động hủy hàng đợi khi `clearSelection()`, `shuffleBoard()`, hoặc `destroy()`.

### 3. Hướng dẫn Mở Khóa Thần Khí (Actionable Relic Onboarding)
- Khi ô Cổ Vật chưa trang bị:
  - Tên hiển thị: `🔒 Thần Khí (Trống)`
  - Thanh năng lượng: `CHƯA CÓ`
  - Khi nhấp vào ô: Thông báo hướng dẫn cụ thể: `"🏺 THẦN KHÍ: Vượt Màn 1-4 để rèn Cổ Vật đầu tiên! Ghé Bảo Khố tại Menu Chính để kích hoạt."`

### 4. Hiệu Ứng Nhịp Thở Vật Phẩm Đặc Biệt
- Viền Hũ May Mắn (`lucky_pot`) và Cổng Torii (`portal_torii`) được bổ sung hiệu ứng Alpha Pulse (`Sine.easeInOut`, chu kỳ 650ms - 1200ms) tạo cảm giác sống động, dễ nhận diện trên thiết bị di động mà không gây tụt FPS.

---

## Hệ quả & Đánh giá
- **Ưu điểm:**
  - 100% minh bạch về đánh giá sao: Người chơi đạt đủ 3/3 nhiệm vụ sẽ chắc chắn nhận đủ 3 sao rực rỡ và phần thưởng xứng đáng.
  - Cảm giác điều khiển siêu nhạy (responsive): Người chơi tốc độ cao có thể combo liên tục mà không bao giờ bị "nuốt click".
  - Người chơi mới hiểu rõ lộ trình thăng tiến để săn mảnh Thần Khí.
- **Rủi ro & Phòng vệ:**
  - Ô trong `queuedInput` có thể là ô vừa bị xóa trong cặp kết nối hiện tại -> Được phòng vệ bằng kiểm tra `!targetTile.isCleared` trước khi kích hoạt.
