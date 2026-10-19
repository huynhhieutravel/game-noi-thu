#!/bin/bash
set -e

DEVICE_UDID="00008130-0004111811E8001C"
PROJECT_DIR="/Users/huynhtronghieu/Documents/game/noi-thu"
APP_PATH="$PROJECT_DIR/ios/build/Build/Products/Debug-iphoneos/App.app"
ENTITLEMENTS="$PROJECT_DIR/ios/build/Build/Intermediates.noindex/App.build/Debug-iphoneos/App.build/App.app.xcent"
SIGN_ID="Apple Development: hiepkhachsitinh395@gmail.com (N5CFMH5VY5)"

echo "=== 🦊 CẬP NHẬT GAME LÊN IPHONE QUA WIFI / DEV-CABLE ==="

cd "$PROJECT_DIR"

# 1. Build web bundle
echo "1. Đang build web bundle mới nhất..."
npm run build

# 2. Sync into iOS
echo "2. Đang sync Capacitor iOS..."
npx cap sync ios

# 3. If App.app doesn't exist, build from Xcode
if [ ! -d "$APP_PATH" ]; then
  echo "3. Chưa có App.app, đang build qua xcodebuild..."
  DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination "id=$DEVICE_UDID" -derivedDataPath ios/build build
else
  echo "3. Đang đồng bộ tài nguyên mới nhất vào App.app..."
  rsync -a dist/ "$APP_PATH/public/"
  echo "Đang ký lại mã số (codesign)..."
  codesign --force --sign "$SIGN_ID" --entitlements "$ENTITLEMENTS" --timestamp=none "$APP_PATH"
fi

# 4. Install over WiFi / devicectl
echo "4. Đang nạp app lên iPhone (Loki Phone)..."
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"

echo "🎉 Nạp thành công lên iPhone! Bạn hãy mở hoặc vuốt tắt mở lại app trên iPhone để thấy bản cập nhật mới nhất!"
