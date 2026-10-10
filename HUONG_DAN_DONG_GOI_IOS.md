# 📱 Hướng Dẫn Đóng Gói Game Lên iPhone Bằng Capacitor & Xcode

Tài liệu hướng dẫn từng bước để đóng gói và cài đặt trò chơi **Yokai Onet (Onet Linh Thú)** lên iPhone từ MacBook để chơi **Offline 100% không cần Internet**.

---

## 🏛️ 1. Mô Hình Hoạt Động Của Game

```
       💻 MacBook (Source code)
   [Vite / TypeScript / Phaser 3]
                 ↓
      📦 Capacitor (Đã cài đặt & cấu hình)
  [Bridge: Haptics, Orientation, Offline Storage]
                 ↓
        🛠️ Xcode (Trình biên dịch của Apple)
  [Ký chứng chỉ nhà phát triển Apple ID miễn phí]
                 ↓
        📱 iPhone (Game Offline)
  [Không cần mạng, rung Taptic Engine, full màn hình]
```

---

## ⚙️ 2. Các Tối Ưu Đã Thực Hiện Cho Bản Build Mobile

Toàn bộ mã nguồn đã được tối ưu hóa chuyên sâu cho môi trường iOS WKWebView:
1. **Đường dẫn tương đối (`base: './'`):** Đảm bảo không bị lỗi 404 hình ảnh và âm thanh khi chạy offline trên máy ảo hoặc thiết bị thật.
2. **Tách gói Bundle (`manualChunks`):** Đã phân tách `vendor-phaser` (~1.4MB) và `vendor-capacitor` riêng biệt, giúp giảm tải RAM và thời gian khởi động app trên iOS.
3. **Âm thanh thuần Web Audio Synthesizer:** Nhạc nền và hiệu ứng âm thanh được tổng hợp bằng bộ dao động tần số trực tiếp, không phụ thuộc vào file nhạc tải từ mạng, **chạy offline 100%**.
4. **Capacitor Haptics Native:** Rung phản hồi lực thật qua Taptic Engine của iPhone khi chạm ô, nối thành công, combo, và chém Boss.
5. **Cố định màn hình ngang (Landscape Lock):** Đã cấu hình khóa góc nhìn ngang ở cả tầng web (`ScreenOrientation.lock`) và tầng gốc iOS (`Info.plist`).
6. **Xử lý Tai Thỏ & Dynamic Island:** Hỗ trợ `viewport-fit=cover` và `safe-area-inset` để nội dung bàn cờ không bị che khuất.

---

## 🚀 3. Các Bước Đóng Gói Lên iPhone (Từng Bước Cụ Thể)

### Bước 1: Cài đặt Xcode trên MacBook
* Mở ứng dụng **App Store** trên MacBook.
* Tìm kiếm từ khóa **Xcode** và bấm **Nhận / Cài đặt** (miễn phí từ Apple).
* *Lưu ý: Xcode có dung lượng khoảng 10-15GB, cần đảm bảo ổ cứng còn trống.*

Sau khi cài đặt xong Xcode, mở Terminal và chạy lệnh sau một lần duy nhất để thiết lập Developer Tools:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

---

### Bước 2: Build game & Mở Xcode từ dự án
Trong thư mục dự án `noi-thu`, bạn chỉ cần chạy lệnh:
```bash
npm run cap:open:ios
```
Lệnh này sẽ tự động:
1. Biên dịch TypeScript & đóng gói Vite vào thư mục `dist/`.
2. Đồng bộ web assets và native plugins vào `ios/`.
3. Tự động khởi chạy **Xcode** và mở sẵn dự án `App.xcodeproj`.

---

### Bước 3: Đăng nhập Apple ID (Miễn phí) trong Xcode
1. Trong Xcode, trên thanh menu chọn: **Xcode** → **Settings** (hoặc nhấn `Cmd + ,`).
2. Chọn tab **Accounts**.
3. Bấm dấu `+` ở góc dưới bên trái → Chọn **Apple ID** → Đăng nhập tài khoản Apple ID của bạn (chính là tài khoản iCloud đang dùng trên iPhone).
4. Sau khi đăng nhập, bạn sẽ thấy xuất hiện một mục Personal Team miễn phí (ví dụ: `Nguyen Van A (Personal Team)`).

---

### Bước 4: Thiết lập Signing cho App
1. Trong thanh điều hướng bên trái của Xcode, click vào dòng trên cùng có icon màu xanh: **App**.
2. Chọn tab **Signing & Capabilities**.
3. Tích chọn ô: **Automatically manage signing**.
4. Tại mục **Team**: Chọn tài khoản Apple ID cá nhân của bạn vừa thêm ở Bước 3.
5. Tại mục **Bundle Identifier**: Nếu Xcode báo trùng tên, bạn có thể đổi nhẹ chữ số (ví dụ: `com.yokai.onet.mygame`).

---

### Bước 5: Cắm iPhone vào MacBook & Cài Đặt Game
1. Dùng cáp sạc cắm iPhone vào MacBook.
2. Trên màn hình iPhone, nếu có thông báo hỏi *"Tin cậy máy tính này?"* → Chọn **Tin cậy (Trust)** và nhập mã mở khóa màn hình.
3. Trên thanh công cụ trên cùng của Xcode (cạnh nút Play ▶️):
   - Nhấp vào thanh chọn thiết bị (đang hiển thị *Any iOS Device* hoặc tên Simulator).
   - Chọn chính xác tên chiếc **iPhone** của bạn trong danh sách thiết bị thật.
4. Bấm nút **Play (▶️)** (hoặc phím tắt `Cmd + R`).
5. Xcode sẽ tự động build và nạp game vào màn hình chính của iPhone!

---

### Bước 6: Cho phép ứng dụng chạy lần đầu trên iPhone (Bắt buộc cho tài khoản miễn phí)
Khi game vừa nạp xong vào iPhone, nếu bạn bấm vào icon app và thấy thông báo *"Nhà phát triển doanh nghiệp / cá nhân không tin cậy"*:
1. Trên iPhone, mở **Cài đặt (Settings)** → **Cài đặt chung (General)**.
2. Chọn **Quản lý VPN & Thiết bị (VPN & Device Management)**.
3. Dưới mục *Ứng dụng của nhà phát triển*, bấm vào tài khoản Apple ID của bạn.
4. Bấm **Tin cậy "[Apple ID của bạn]" (Trust)** → Xác nhận **Tin cậy**.
5. Mở game và tận hưởng ngay lập tức! Game chạy mượt mà, offline 100%, không cần mạng Internet!

---

## 🛠️ Danh Sách Các Lệnh Hữu Ích

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run build` | Kiểm tra lỗi TypeScript & đóng gói bản web `dist/` |
| `npm run cap:sync` | Đóng gói và đồng bộ cho cả iOS & Android |
| `npm run cap:build:ios` | Đóng gói và đồng bộ riêng cho iOS |
| `npm run cap:open:ios` | Đóng gói, đồng bộ và mở trực tiếp trong Xcode |
| `npm run cap:open:android` | Mở trực tiếp trong Android Studio |
