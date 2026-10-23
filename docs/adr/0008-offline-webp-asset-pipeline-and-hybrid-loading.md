# ADR 0008: Quy Trình Đóng Gói Tài Nguyên WebP Thuần Offline và Cơ Chế Nạp Lai Thông Minh (Smart Hybrid Preload)

## Trạng thái
**ĐÃ CHẤP NHẬN (ACCEPTED)** - Ngày 19/10/2026

## Bối cảnh
1. **Dung lượng gói cài đặt khổng lồ:**
   - Thư mục `public/assets/` trước đây chứa 1.3 GB hình ảnh định dạng PNG thô chưa nén (trong đó 100 màn chơi chiếm hơn 509 MB, hình nhân vật/thế giới chiếm hơn 600 MB).
   - Khi đóng gói vào ứng dụng Capacitor iOS, toàn bộ bundle phình to lên tới 2.5 GB, vượt xa giới hạn tải qua mạng di động của Apple App Store (200 MB), gây tốn dung lượng bộ nhớ thiết bị của người dùng.

2. **Giới hạn bộ nhớ WebKit trên thiết bị di động (Jetsam OOM):**
   - Hệ điều hành iOS áp đặt ngưỡng trần RAM nghiêm ngặt đối với tiến trình WebKit (`com.apple.WebKit.WebContent`) ở mức ~250 MB - 300 MB.
   - Khi `BootScene` cố gắng nạp toàn bộ hàng trăm tài nguyên vào VRAM WebGL cùng một lúc lúc khởi động, tiến trình bị iOS cưỡng chế tắt (`SIGKILL Jetsam`), dẫn tới vòng lặp sập và tải lại (Reload Loop) ở mốc 29% - 33%.

3. **Cân nhắc chiến lược cập nhật tương lai:**
   - Cân bằng giữa mô hình cập nhật truyền thống qua App Store và khả năng mở rộng sang cơ chế cập nhật nóng không dây (Over-The-Air / OTA) trong tương lai mà không làm phát sinh chi phí vận hành máy chủ hiện tại.

---

## Quyết định Kiến trúc & Triển khai

### 1. Thuần Offline với Quy Trình Nén WebP (Offline-First WebP Pipeline)
- **Quyết định:** Giữ vững nguyên tắc cốt lõi 100% Offline-First. Toàn bộ 10 Thế giới và 100 màn chơi nằm trọn vẹn trong gói cài đặt của người dùng, không phụ thuộc vào kết nối mạng hay máy chủ CDN bên ngoài.
- **Nén tài nguyên:** Chuyển đổi toàn bộ các file PNG phong cảnh, nền màn chơi và nhân vật sang chuẩn WebP chất lượng cao (chất lượng 85% - 90%).
  - Dung lượng 100 hình nền màn chơi giảm từ 509 MB xuống còn ~25 MB (giảm 95%).
  - Tổng dung lượng tài nguyên giảm từ 1.3 GB xuống mức an toàn **~90 MB - 120 MB**, đảm bảo nằm dưới ngưỡng 200 MB của Apple App Store.

### 2. Mô Hình Phát Hành Ứng Dụng (Release & Update Strategy)
- **Giai đoạn hiện tại:** Sử dụng quy trình phát hành chính thức tiêu chuẩn qua Apple App Store (Xcode Build, TestFlight, App Store Review).
- **Thiết kế mở rộng (Future Seam):** Tách bạch rõ ràng giữa mã nguồn Web (HTML/CSS/JS/Assets) và vỏ bọc Native Capacitor để sẵn sàng tích hợp giải pháp Live Update OTA (như Capgo) trong tương lai khi có nhu cầu cập nhật logic không cần qua kiểm duyệt.

### 3. Cơ Chế Nạp Lai Thông Minh (Smart Hybrid Preload Lifecycle)
Để giải quyết mâu thuẫn giữa *"người chơi tải game 1 lần"* và *"tốc độ mở game siêu tốc không bị tràn RAM"*:
- **Tầng 1 - Khởi Động Siêu Tốc (Cold Boot < 500ms):**
  - `BootScene` chỉ nạp vào RAM các tài nguyên tối thiểu cần thiết để hiển thị Menu Chính: Hình nền Torii/Đền đêm, 10 linh thú thần thoại đại diện, 20 icon kỹ năng trong suốt, các nút điều hướng và rương thưởng (~15 MB VRAM).
  - Thanh tải lướt qua 100% trong chưa đầy 0.5 giây.
- **Tầng 2 - Tải Ngầm Trong Nền (Background Idle Prefetch):**
  - Khi người chơi dừng ở Menu Chính để duyệt nhiệm vụ hoặc chọn màn, một tiến trình chạy ngầm với độ ưu tiên thấp sẽ tự động nạp trước các tài nguyên của Chương hiện tại vào bộ đệm RAM.
- **Tầng 3 - Vào Chơi Tức Thì (Instant Play Transition):**
  - Khi người chơi bấm "Vào Chơi", màn chơi hiển thị ngay lập tức (0 giây chờ) vì tài nguyên đã được tải sẵn ở Tầng 2.
- **Tầng 4 - Dọn Dẹp Bộ Nhớ Định Kỳ (Texture Garbage Collection):**
  - Khi người chơi chuyển đổi giữa các Chương/Thế giới khác nhau, các texture không còn sử dụng của chương cũ sẽ được giải phóng khỏi TextureManager của Phaser, giữ cho RAM luôn dưới 100 MB, máy mát và tiết kiệm pin.

---

## Hệ quả & Đánh giá
- **Ưu điểm:**
  - Dung lượng tải app từ App Store giảm hơn 90%, tải nhanh chóng qua 4G/5G.
  - Người chơi chơi được 100% không cần internet, không tốn chi phí thuê máy chủ CDN.
  - Tốc độ mở game tức thì (< 0.5s), không còn hiện tượng treo hoặc văng ở thanh tiến trình.
  - Không bao giờ bị lỗi tràn bộ nhớ (Out-Of-Memory) trên iOS.
