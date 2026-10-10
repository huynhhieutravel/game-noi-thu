# 📱 HƯỚNG DẪN IMPORT ICON & SPLASH SCREEN CHO APP STORE & GOOGLE PLAY

Thư mục này dùng để chứa file ảnh thiết kế gốc của bạn. Khi bạn đã có sẵn ảnh, hãy đặt ảnh vào thư mục này theo đúng quy cách sau:

---

### 1. Quy Cách File Ảnh Yêu Cầu

1. **`icon.png` (App Icon chính):**
   - **Kích thước:** `1024 x 1024 px`
   - **Định dạng:** PNG (RGB, **KHÔNG CÓ KÊNH TRONG SUỐT / NO ALPHA**, Apple App Store sẽ từ chối nếu icon có độ trong suốt).
   - **Nội dung:** Logo game / Mascot Cáo Inari hoặc cổng Torii ở giữa, căn lề an toàn cách mép 10-15%.

2. **`splash.png` (Màn hình khởi động):**
   - **Kích thước:** `2732 x 2732 px` (hoặc `2048 x 2048 px`)
   - **Màu nền:** `#0d0f17` (Tone tối đồng bộ với game)
   - **Nội dung:** Logo Yokai Onet đặt ở chính giữa tâm hình tròn đường kính ~1200px (để khi hiển thị trên điện thoại dài/ngắn không bị cắt mất chữ).

---

### 2. Cách Tạo Tự Động Toàn Bộ Kích Thước (Chỉ 1 Dòng Lệnh)

Sau khi bạn đã copy `icon.png` và `splash.png` vào thư mục `resources/` này, bạn chỉ cần chạy lệnh:

```bash
npx @capacitor/assets generate
```

Lệnh này sẽ tự động:
- Cắt và xuất toàn bộ các kích thước icon cho iOS (`ios/App/App/Assets.xcassets/AppIcon.appiconset`).
- Cắt và tạo trọn bộ Adaptive Icon cho Android (`android/app/src/main/res/mipmap-*`).
- Cắt màn hình Splash Screen cho tất cả dòng iPhone, iPad và điện thoại Android.

---

### 3. Cách Thay Thủ Công (Nếu Không Dùng Tool Tự Động)

#### A. Đối với iOS (Xcode):
1. Mở file `ios/App/App.xcworkspace` bằng **Xcode**.
2. Chọn thư mục `App` ➔ `Assets` ➔ `AppIcon`.
3. Kéo thả file `icon.png` (1024x1024) vào ô **All Sizes (1024x1024 pt)**.

#### B. Đối với Android (Android Studio):
1. Mở thư mục `android/` bằng **Android Studio**.
2. Chuột phải vào thư mục `app/src/main/res` ➔ Chọn **New** ➔ **Image Asset**.
3. Chọn Asset Type là **Launcher Icons (Adaptive and Legacy)**.
4. Ở mục **Path**, duyệt chọn file `resources/icon.png` của bạn và kéo thanh **Resize** cho vừa khung tròn/vuông.
5. Bấm **Next** ➔ **Finish**.
