# Nhật Ký Rà Soát & Sửa Lỗi Toàn Diện — Phase 1 (Comprehensive Code & Logic Audit)

> **Dự án**: Onet Linh Thú — Nối Thú Cổ Điển (Yokai & Thần Thoại)  
> **Chế độ**: `/goal` — Rà soát toàn diện 6 phân vùng code và kiểm tra 2 vòng (2-Phase Deep Audit)  
> **Mục tiêu**: Đi từng khu vực, soi từng dòng code, tìm ra và sửa dứt điểm các lỗi logic, toán học, đồng bộ trạng thái, vòng đời và công thức nghiệp vụ.

---

## Danh Sách 6 Phân Vùng Rà Soát
- [x] **Khu Vực 1**: Lõi Bàn Cờ & Thuật Toán Tìm Đường (`PathFinder.ts`, `BoardGenerator.ts`, `BoardModifiers.ts`, `Tile.ts`, `Board.ts`, `TextureGenerator.ts`)
- [x] **Khu Vực 2**: Vòng Lặp Trận Đấu & Xử Lý Sự Kiện Màn Chơi (`GameScene.ts`, `ComboSystem.ts`)
- [x] **Khu Vực 3**: Trí Tuệ Nhân Tạo & Trận Chiến Boss (`BossManager.ts`, `bosses.json`)
- [x] **Khu Vực 4**: Hệ Thống Linh Thú & Thần Khí (`CompanionManager.ts`, `RelicManager.ts`, `characters.json`, `relics.json`)
- [x] **Khu Vực 5**: Tiến Trình 100 Màn, Kinh Tế & Lưu Trữ Ngoại Tuyến (`LevelManager.ts`, `LootManager.ts`, `SaveSystem.ts`, `ShopModal.ts`, `levels.json`)
- [x] **Khu Vực 6**: Giao Diện Hub, Đa Chủ Đề & Tích Hợp Native (`MainMenuScene.ts`, `CollectionScene.ts`, `AudioSystem.ts`, `HapticSystem.ts`, `main.ts`)

---

## Chi Tiết Các Lỗi Phát Hiện & Đã Khắc Phục Trong Phase 1

### 🟢 Khu Vực 1: Lõi Bàn Cờ & Thuật Toán Tìm Đường
1. **Lỗi 1.1 — Bão Laser Xuyên Toàn Bàn Cờ Qua Cổng Dịch Chuyển Torii (`src/game/Board.ts`)**:
   - **Vị trí**: `damageAdjacentObstacles(t1, t2, matchPathOrPoints)`, dòng ~1092.
   - **Hiện tượng**: Khi nối 2 ô qua Cổng Không Gian Torii, mảng điểm `pts` chứa bước nhảy từ `portalA` sang `portalB`. Hàm tính sát thương diện rộng tính hộp bao `minR..maxR` và `minC..maxC` giữa 2 cổng ở 2 đầu màn hình, dẫn đến việc quét một hình chữ nhật khổng lồ xuyên qua toàn bộ bàn cờ và đập nứt/phá hủy vô số vật cản ở giữa dù không hề có tia laser nào đi qua không gian đó.
   - **Cách sửa**: Bổ sung kiểm tra `if (pA.r !== pB.r && pA.c !== pB.c) continue;`. Tia laser thực tế chỉ truyền thẳng trực giao ngang hoặc dọc. Bước nhảy chéo/phi trực giao đại diện cho cổng không gian (wormhole jump) được bỏ qua hoàn toàn, bảo toàn tính chuẩn xác của sát thương lan.
2. **Lỗi 1.2 — Đóng Băng Đếm Ngược Hũ May Mắn Khi Bàn Cờ Dồn Trọng Lực (`src/game/BoardModifiers.ts`)**:
   - **Vị trí**: `MovableTileData`, `extractTileData`, `clearTileData`, `applyTileData`.
   - **Hiện tượng**: Thuộc tính `luckyPotTimeLeft` (thời gian 10s đếm ngược của Hũ May Mắn) bị bỏ quên không khai báo trong `MovableTileData`. Khi ăn 1 cặp ô làm kích hoạt cơ chế dồn bảng (Slide Down/Up/Left/Right/Split), ô Hũ May Mắn bị dịch chuyển vị trí sẽ mất sạch giá trị `luckyPotTimeLeft` (trở thành `undefined`). Khi đó, hàm `updateLuckyPots(deltaSec)` kiểm tra `state.luckyPotTimeLeft !== undefined && state.luckyPotTimeLeft > 0` bị trả về `false`, khiến bộ đếm bị đóng băng vĩnh viễn, hũ may mắn trở thành bất tử trên bàn cờ.
   - **Cách sửa**: Khai báo `luckyPotTimeLeft?: number` trong `MovableTileData`, trích xuất đầy đủ trong `extractTileData`, áp dụng sang ô mới trong `applyTileData`, và reset về `undefined` trong `clearTileData`.
3. **Lỗi 1.3 — Thiếu Texture Cho Modifier Mạng Nhện, Gai Góc & Rào Gỗ (`src/game/TextureGenerator.ts` & `src/game/Tile.ts`)**:
   - **Vị trí**: `TextureGenerator.createModifierTextures` và `TileView.constructor`.
   - **Hiện tượng**: `TextureGenerator` chỉ sinh procedural texture cho `mod_ice`, `mod_stone`, `mod_lock`. Khi xuất hiện ô `thorn`, `web`, `barricade`, `Tile.ts` phải fallback sang texture sai ngữ nghĩa (`mod_ice` hoặc `mod_lock`).
   - **Cách sửa**: Sinh đầy đủ procedural textures sắc nét gồm `mod_web` (tơ nhện và biểu tượng 🕸️), `mod_thorn` (dây leo gai và biểu tượng 🌿), `mod_barricade` (rào gỗ kiên cố và biểu tượng 🪵). Cập nhật fallback trong `Tile.ts` về đúng texture tương ứng.

### 🟢 Khu Vực 2: Vòng Lặp Trận Đấu & Xử Lý Sự Kiện Màn Chơi
1. **Lỗi 2.1 — Rò Rỉ Tween `this.relicPulseTween` Khi Đóng Màn Chơi (`src/scenes/GameScene.ts`)**:
   - **Vị trí**: `events.once('shutdown')` trong `GameScene.ts`.
   - **Hiện tượng**: Bộ đệm tween nhịp thở của nút Thần Khí `this.relicPulseTween` không được giải phóng trong sự kiện `shutdown`. Khi người chơi thoát ra Main Menu rồi vào lại trận mới nhiều lần, tween cũ vẫn âm thầm chạy trên tham chiếu đã hủy.
   - **Cách sửa**: Thêm `if (this.relicPulseTween) { this.relicPulseTween.stop(); this.relicPulseTween = null; }` vào hook shutdown.
2. **Lỗi 2.2 — Không Tự Động Hủy Lựa Chọn Ô Khi Bị Boss Biến Thành Mạng Nhện Hoặc Rào Gỗ (`src/scenes/GameScene.ts`)**:
   - **Vị trí**: `onBossSkillTriggered` trong `GameScene.ts`.
   - **Hiện tượng**: Khi Boss tung chiêu biến đổi ô bàn cờ, hàm kiểm tra chỉ bỏ chọn nếu ô đang chọn chuyển thành `ice`, `stone` hoặc `isCleared`. Nếu ô đang chọn bị Boss phủ mạng nhện `web` hoặc rào gỗ `barricade`, khung viền vàng lựa chọn vẫn giữ nguyên trên ô bị khóa, gây lỗi logic thao tác tiếp theo.
   - **Cách sửa**: Bổ sung `selectedTile.modifier === 'web' || selectedTile.modifier === 'barricade'` vào điều kiện gọi `this.boardManager.clearSelection()`.

### 🟢 Khu Vực 3: Trí Tuệ Nhân Tạo & Trận Chiến Boss
1. **Lỗi 3.1 — 8 Kỹ Năng Hút Thời Gian Của Boss Bị Bỏ Quên (`src/scenes/GameScene.ts` & `src/game/BossManager.ts`)**:
   - **Vị trí**: `onBossSkillTriggered` và `triggerBossAction`.
   - **Hiện tượng**: Trong `bosses.json`, các đại Boss sở hữu các chiêu thức rút cạn thời gian độc đáo (`acid_breath`, `dragon_roar`, `ten_head_roar`, `plasma_cannon`, `event_horizon`, `crown_jewel_blast`, `inferno_breath`, `solar_flare`). Tuy nhiên code chỉ bắt đúng chuỗi literal `'time_drain'`. Kết quả là 8 đại Boss khi thi triển tuyệt chiêu thương hiệu thì người chơi hoàn toàn không bị trừ thời gian!
   - **Cách sửa**: Cập nhật cả `BossManager.ts` và `GameScene.ts` kiểm tra đầy đủ danh sách 8 chiêu thức hút thời gian.
2. **Lỗi 3.2 — 14 Kỹ Năng Boss Không Thể Hiện Hiệu Ứng Trên Bàn Cờ (Bị Skip Turn) (`src/game/BossManager.ts`)**:
   - **Vị trí**: `triggerBossAction` trong `BossManager.ts`.
   - **Hiện tượng**: Các kỹ năng tạo sương mù/mù mắt (`sandstorm_blind`, `cloud_mist`, `ghost_fog`, `spore_haze`), kỹ năng khiên hộ mệnh (`pearl_blessing`, `temple_ward`, `magma_armor`, `gold_hoard_shield`), kỹ năng đảo vị trí/sóng xung kích (`luminescence_flash`, `supernova_flash`, `emp_shockwave`, `factory_reboot`, `seasonal_wind`) rơi vào khối lệnh trống, khiến Boss mất lượt mà không tác động gì lên bàn cờ.
   - **Cách sửa**: Ánh xạ toàn bộ 48/48 kỹ năng Boss vào đúng nhóm hiệu ứng:
     - Sương mù/Phấn hoa -> Phủ mạng nhện `web` lên 1-2 ô tích cực.
     - Khiên hộ mệnh -> Đặt rào chắn `barricade` lên ô trống (tối đa 4 vật cản).
     - Đảo loạn/Xung kích -> Đảo ngẫu nhiên các cặp ô hợp lệ.
     - Hỏa liên bùng cháy -> Trừ 5s thời gian.

### 🟢 Khu Vực 4: Hệ Thống Linh Thú & Thần Khí
1. **Lỗi 4.1 — Thiếu Ánh Xạ Cho `genbu_tortoise` Trong `COMPANION_TIERS` (`src/game/CompanionManager.ts`)**:
   - **Vị trí**: `COMPANION_TIERS` trong `CompanionManager.ts`.
   - **Hiện tượng**: Object `COMPANION_TIERS` định nghĩa khóa `genbu_turtle`, trong khi toàn bộ hệ thống ID linh thú sử dụng `genbu_tortoise`. Hàm `getTierInfo` phải thêm fallback tạm thời `companionId === 'genbu_tortoise' ? COMPANION_TIERS['genbu_turtle'] : undefined`. Nếu truy cập trực tiếp `COMPANION_TIERS[id]` sẽ nhận `undefined`.
   - **Cách sửa**: Thiết lập alias trực tiếp `COMPANION_TIERS.genbu_tortoise = COMPANION_TIERS.genbu_turtle;`, đảm bảo an toàn tuyệt đối ở mọi nơi tra cứu.
2. **Lỗi 4.2 — Công Thức Tính Sát Thương Thần Khí Rơi Vào Sai Số Mặc Định 2000 HP (`src/game/RelicManager.ts` & `src/game/BossManager.ts`)**:
   - **Vị trí**: `RelicManager.executeRelicSkill` dòng ~175.
   - **Hiện tượng**: Sát thương Thần Khí tính theo tỷ lệ máu Boss (`relic.bossHpPercent`) truy xuất `scene.bossManager?.maxHp || 2000`. Nhưng `BossManager` khai báo `private config: BossConfig` và hàm `getMaxHp(): number`. `maxHp` là `undefined`, khiến mọi Boss (dù có 1040 HP hay 1200 HP) đều bị tính sát thương dựa trên mốc cứng 2000 HP!
   - **Cách sửa**: Bổ sung getter `public get maxHp(): number { return this.config.maxHp; }` và `public get hp(): number { return this.currentHp; }` trong `BossManager.ts`. Đồng thời cập nhật `RelicManager.ts` gọi an toàn `scene.bossManager?.getMaxHp ? scene.bossManager.getMaxHp() : (scene.bossManager?.maxHp || 2000)`.

### 🟢 Khu Vực 5: Tiến Trình 100 Màn, Kinh Tế & Lưu Trữ Ngoại Tuyến
1. **Lỗi 5.1 — Thiếu Kiểm Định Số Học Cho Các Hàm Tiền Tệ & Đạo Cụ (`src/systems/SaveSystem.ts`)**:
   - **Vị trí**: `addCoins`, `spendCoins`, `addDiamonds`, `spendDiamonds`, `buyBoosterWithCoins`, `buyBundleWithCoins`.
   - **Hiện tượng**: Không kiểm tra `Number.isFinite(amount)` hoặc `amount <= 0`. Nếu có bất kỳ sự cố tính toán trả về `NaN`, `null`, `undefined` hoặc số âm, số dư ví tiền của người chơi trong LocalStorage sẽ bị nhiễm độc thành `NaN`, phá hủy toàn bộ khả năng mua bán.
   - **Cách sửa**: Bổ sung kiểm định số hữu hạn và số dương nghiêm ngặt (`!Number.isFinite(...) || ... <= 0`), làm tròn nguyên (`Math.floor`) trước khi ghi vào `UserSaveData`.

### 🟢 Khu Vực 6: Giao Diện Hub, Đa Chủ Đề & Tích Hợp Native
1. **Lỗi 6.1 — AudioContext Tiếp Tục Tiêu Thụ Tài Nguyên Khi Ứng Dụng Thu Nhỏ (`src/systems/AudioSystem.ts`)**:
   - **Vị trí**: Event listener trong constructor `AudioSystem.ts`.
   - **Hiện tượng**: Chỉ có listener `resumeAudio()` khi `visibilitychange` trở lại `!document.hidden`. Khi người chơi thu nhỏ trình duyệt hoặc chuyển app trên iOS/Android, `AudioContext` vẫn ở trạng thái `running`, gây hao pin và tiếng ồn nền.
   - **Cách sửa**: Thêm hàm `pauseAudio()` gọi `ctx.suspend()` khi `document.hidden === true` hoặc sự kiện `pagehide`.
