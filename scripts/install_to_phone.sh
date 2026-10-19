#!/bin/bash
set -e

DEVICE_UDID="00008130-0004111811E8001C"
APP_PATH="/Users/huynhtronghieu/Library/Developer/Xcode/DerivedData/App-cvzlitrjpxugopekmssrgnjscbzc/Build/Products/Debug-iphoneos/App.app"
ENTITLEMENTS="/Users/huynhtronghieu/Library/Developer/Xcode/DerivedData/App-cvzlitrjpxugopekmssrgnjscbzc/Build/Intermediates.noindex/App.build/Debug-iphoneos/App.build/App.app.xcent"
SIGN_ID="Apple Development: hiepkhachsitinh395@gmail.com (N5CFMH5VY5)"

echo "=== 🦊 CẬP NHẬT GAME LÊN IPHONE (LOKI PHONE) ==="

# 1. Sync & Copy latest web build
echo "1. Đang đồng bộ tài nguyên mới nhất vào App.app..."
rsync -a dist/ "$APP_PATH/public/"

# 2. Re-sign app bundle
echo "2. Đang ký lại mã số (codesign)..."
codesign --force --sign "$SIGN_ID" --entitlements "$ENTITLEMENTS" --timestamp=none "$APP_PATH"

# 3. Check device readiness
echo "3. Đang kiểm tra kết nối với iPhone 15 Pro Max..."
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"

echo "🎉 Nạp thành công lên iPhone! Hãy mở game để trải nghiệm Cáo Inari 3D!"
