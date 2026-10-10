# 🌸 YOKAI ONET (妖怪コネクト) — GAME DESIGN & TECHNICAL ARCHITECTURE

> **Định vị dự án:** Không đơn thuần là bản sao Pikachu Onet truyền thống. Đây là một **Puzzle Adventure Engine** kết hợp cơ chế **Onet Cổ Điển + Boss Puzzle trực tiếp trên bàn cờ + Bộ sưu tập 108 Thần Thú Yokai Nhật Bản (Data-Driven)**, tối ưu cho quy trình phát triển nhanh (Vibe Coding) và mở rộng đa quốc gia (Around the World Matching Adventure).

---

## 1. TỔNG QUAN HỆ THỐNG & CORE LOOP

### 1.1. Core Loop Siêu Gọn & Gây Nghiện
```
┌─────────────────────────────────────────────────────────────┐
│                       CORE GAMEPLAY LOOP                    │
└─────────────────────────────────────────────────────────────┘
      ▼
  [ Vào Level ] ─── (2–4 phút / level)
      │
      ▼
  [ Nối Cặp Onet ] ── (Âm thanh Pop/Pop, xúc giác phản hồi nhanh)
      │
      ▼
  [ Combo x2..x5 ] ── (Pitch tăng dần theo ngũ âm Nhật Bản)
      │
      ├──> FEVER MODE! (Mưa hoa anh đào, Laser cầu vồng, x3.5 Điểm)
      │
      ▼
  [ Đánh Boss / Clear Board ] ── (Boss Puzzle: Trừ HP, chém đầu Thần Xà)
      │
      ▼
  [ Nhận Ngân Lượng & Sao ] ── (💰 Coins, ⭐ Stars)
      │
      ▼
  [ NEW YOKAI DISCOVERED! ] ── (Thu phục linh thú mới vào Album)
      │
      ▼
  [ Mở Level Tiếp Theo ] ── (Mở ải bản đồ, nâng cấp thử thách)
```

### 1.2. Các Yếu Tố "Thắng" Của Trải Nghiệm
1. **Cảm giác nối nhanh (Instant Response):** Input bắt trúng tức thì, tap target rộng, không delay khung hình (cố định 60 FPS).
2. **Âm thanh Pop/Pop cực đã (Procedural Web Audio Synth):** Tích hợp bộ tổng hợp âm thanh chuyên dụng, nốt nhạc bay bổng theo thang âm Ngũ Cung Nhật Bản (*Insen scale*), pitch tự động tăng cao theo chuỗi Combo.
3. **Hiệu ứng Cánh hoa Anh đào (Sakura Juice):** Khi đạt FEVER (Combo 5+), toàn màn hình kích hoạt bão cánh hoa đào, đường laser vàng kim lấp lánh.
4. **Không nhồi nhét RPG cồng kềnh:** Không equipment, không gacha roll tốn kém, không chỉ số phức tạp. Sức hút nằm ở việc **sưu tập trọn vẹn Album 108 Yokai** và vượt qua các thử thách giải đố thông minh.

---

## 2. KIẾN TRÚC THƯ MỤC CHUẨN (PHASER 3 + TYPESCRIPT + VITE)

Dự án được phân tách hoàn toàn theo nguyên lý **Decoupled Architecture**, logic tính toán tách rời UI để bảo đảm dễ bảo trì và mở rộng bằng AI:

```
noi-thu/
 ├── index.html                  # Container Responsive Mobile Portrait (9:16)
 ├── package.json                # Scripts: dev, build, preview
 ├── tsconfig.json               # TypeScript strict configuration
 ├── vite.config.ts              # Vite Bundler siêu tốc
 │
 ├── src/
 │   ├── main.ts                 # Điểm khởi chạy Phaser Game
 │   │
 │   ├── types/
 │   │   └── index.ts            # Data Contracts: LevelConfig, BossConfig, TileState, Yokai
 │   │
 │   ├── data/
 │   │   ├── characters.json     # Data-driven registry: 13+ Yokai mẫu (scale 108 con)
 │   │   ├── collections.json    # Bách Quỷ Dạ Hành, Thần Giới Cổ Xưa
 │   │   └── levels.json         # Danh sách màn chơi: Tutorial, Classic, Gravity, Boss Stage
 │   │
 │   ├── game/
 │   │   ├── PathFinder.ts       # ⭐ THUẬT TOÁN CỐT LÕI: 0, 1, 2 khúc cua + viền rỗng
 │   │   ├── BoardGenerator.ts   # Sinh board theo cặp, kiểm tra Solvable, chống Deadlock
 │   │   ├── Tile.ts             # Phaser Container: TileView, bounce, shake, pop animation
 │   │   ├── Board.ts            # Quản lý ma trận, click handler, vẽ tia laser nối cặp
 │   │   ├── ComboSystem.ts      # Quản lý chuỗi Combo, timer đếm ngược, kích hoạt FEVER
 │   │   ├── BossManager.ts      # ⭐ BOSS PUZZLE: Orochi 8 đầu, trừ HP, chiêu đóng băng/đá
 │   │   ├── BoardModifiers.ts   # Hiệu ứng trượt board (Gravity: Down, Left, Right)
 │   │   ├── CharacterRegistry.ts# Tra cứu nhân vật, hệ nguyên tố, màu sắc Rarity
 │   │   ├── TextureGenerator.ts # Khởi tạo đồ họa sơn mài & Kanji Nhật Bản sắc nét
 │   │   └── SheetSlicer.ts      # ⭐ Cắt sprite sheet 3x3 tự động thành 9 nhân vật
 │   │
 │   ├── scenes/
 │   │   ├── BootScene.ts        # Sinh texture nền tảng, nạp asset
 │   │   ├── MainMenuScene.ts    # Cổng Torii thần đạo, chọn Hành Trình / Boss / Album
 │   │   ├── GameScene.ts        # Màn hình chơi chính (HUD, Timer, Board, Boosters, Boss HP)
 │   │   └── CollectionScene.ts  # Album Bách Quỷ Đồ Thư, xem Lore & tỷ lệ hoàn thành (%)
 │   │
 │   └── systems/
 │       ├── AudioSystem.ts      # Web Audio Synth: Pop, Bamboo tap, Taiko hit, Victory chime
 │       ├── SaveSystem.ts       # Lưu trữ LocalStorage: Coins, Stars, Discovered Album
 │       └── RewardSystem.ts     # Tính toán phần thưởng & mở khóa ải mới
```

---

## 3. THUẬT TOÁN TÌM ĐƯỜNG ONET CHUẨN XÁC (PATHFINDER)

### 3.1. Ma trận Viền Rỗng (Padding Margin)
Nhiều bản game nối thú bị lỗi không thể nối vòng ra ngoài mép bàn cờ. Hệ thống giải quyết triệt để bằng việc mở rộng ma trận thêm **1 lớp ô trống bao quanh** ($0 .. rows + 1$ và $0 .. cols + 1$):
```
    0   1   2   3   4   5
0 [ 0   0   0   0   0   0 ]   <-- Hàng rỗng biên trên
1 [ 0   A   X   X   B   0 ]   <-- Đường nối có thể chạy vòng
2 [ 0   X   X   X   X   0 ]       qua biên ô số 0 hoặc 5
3 [ 0   0   0   0   0   0 ]   <-- Hàng rỗng biên dưới
```

### 3.2. Ba Điều Kiện Khúc Cua (Turns)
Hai ô $A(r_1, c_1)$ và $B(r_2, c_2)$ kết nối hợp lệ khi:
1. **0 Khúc Cua (Đường thẳng):** $r_1 = r_2$ hoặc $c_1 = c_2$. Toàn bộ ô trung gian nằm giữa $A$ và $B$ đều trống rỗng (`isCleared = true`).
2. **1 Khúc Cua (Chữ L):** Xét 2 góc vuông tiềm năng $C_1(r_1, c_2)$ hoặc $C_2(r_2, c_1)$. Nếu góc trống và 2 đoạn thẳng nối tới góc đều thông suốt $\to$ hợp lệ.
3. **2 Khúc Cua (Chữ Z hoặc Chữ U):** Quét tia song song theo chiều ngang và dọc (bao gồm cả các ô viền biên $0$ và $N+1$). Nếu tìm được 2 điểm chuyển tiếp hợp lệ $\to$ trả về danh sách tọa độ chính xác để vẽ tia laser.

---

## 4. CƠ CHẾ BOSS PUZZLE (KHÔNG TÁCH COMBAT RIÊNG)

Trong màn chơi Boss (Ví dụ: Màn 30 — **Yamata-no-Orochi / Bát Kỳ Đại Xà**):
1. **Hiển thị trực quan trên HUD:**
   - Thanh máu Boss (300 HP).
   - 8 Biểu tượng đầu rồng (`🐉🐉🐉🐉🐉🐉🐉🐉`). Cứ mỗi 37.5 HP bị trừ, 1 đầu rồng bị chém rơi kèm âm thanh trống Taiko dồn dập!
2. **Cơ chế gây sát thương qua Nối Thú:**
   - Mỗi cặp nối thường: Gây `10 DMG * Combo Multiplier`.
   - Đạt trạng thái FEVER (Combo 5+): Sát thương nhân thêm `1.5x` (lên tới 50+ DMG mỗi hit).
3. **Kỹ năng cản trở bàn cờ của Boss (Boss Skills):**
   Cứ sau mỗi 15 giây, Orochi tung ra 1 chiêu thức can thiệp trực tiếp lên bàn cờ:
   - ❄️ **Hơi Thở Băng Giá (Ice Curse):** Đóng băng ngẫu nhiên 2 ô (người chơi phải match 2 lần mới phá được).
   - 🪨 **Địa Chấn Vụn Đá (Rock Blocker):** Thả đá tảng vào ô trống, chặn đường nối xuyên qua.
   - 🌪️ **Cuồng Phong Bát Quái (Tile Swap):** Đảo lộn vị trí 2 cặp ô trên bàn cờ làm xáo trộn tính toán của người chơi.
4. **Điều kiện thắng:** Đưa HP của Boss về 0 $\to$ Thắng màn, nhận Danh hiệu và Mở khóa Thần Thú Huyền Thoại Yamata-no-Orochi vào Album!

---

## 5. BỘ QUY TẮC TIẾN TRÌNH & MODIFIERS (300+ LEVELS)

Để tránh cảm giác lặp lại trên 300 màn chơi, game phân bổ theo ma trận tiến trình:

| Màn | Kích thước | Số lượng Yokai | Cơ chế / Modifiers | Ý nghĩa trải nghiệm |
| :--- | :---: | :---: | :--- | :--- |
| **1 – 5** | $6 \times 4$ | 6 loại | Classic Onet | Làm quen thao tác, nối cực nhanh, pop đã tay |
| **6 – 15** | $8 \times 6$ | 8 – 10 loại | Ice Tiles (Đóng băng 2 lớp) | Bắt đầu cần tính toán thứ tự ưu tiên |
| **16 – 20** | $8 \times 6$ | 10 loại | Moving Board (Trượt xuống / sang trái) | Cục diện thay đổi sau mỗi lần nối |
| **21 – 25** | $10 \times 6$ | 12 loại | Stone Blocks (Đá cản đường không thể xóa) | Thu hẹp góc cua, tăng độ khó giải đố |
| **26 – 29** | $10 \times 8$ | 14 loại | Locked Tiles (Khóa xích cần tìm chìa) | Cần tư duy mở khóa theo tầng lớp |
| **30** | $8 \times 6$ | 10 loại | **BOSS PUZZLE: Yamata-no-Orochi** | Trận chiến kịch tính với Thần Xà 8 Đầu |

---

## 6. DATA-DRIVEN & TÍCH HỢP SPRITE SHEET 3×3

### 6.1. Cắt tự động Sprite Sheet 3x3 (`SheetSlicer.ts`)
Khi sản xuất asset bằng AI theo dạng lưới **3 hàng × 3 cột (9 nhân vật)**, game tích hợp sẵn công cụ `SheetSlicer`:
- Đưa file ảnh vào (Ví dụ: `yokai_chapter_01.png`).
- Gọi hàm:
  ```typescript
  SheetSlicer.slice3x3Sheet(scene, 'yokai_chapter_01', [
    'kappa', 'kitsune', 'tanuki',
    'tengu', 'oni',     'maneki',
    'chochin','kasa',   'kodama'
  ]);
  ```
- Engine tự động cắt thành 9 frame texture độc lập trong bộ nhớ đệm, người chơi thấy ngay nhân vật vẽ tay sắc nét mà không cần cắt file thủ công.

### 6.2. Cấu trúc Cấu hình Màn chơi (`levels.json`)
```json
{
  "id": "level_30",
  "levelNumber": 30,
  "worldId": "yokai",
  "title": "Trận Chiến Thần Xà: Yamata-no-Orochi",
  "rows": 6,
  "columns": 8,
  "characterPool": ["kappa", "kitsune", "tanuki", "maneki", "oni", "tengu", "yukionna", "nue"],
  "timeLimit": 220,
  "movement": "none",
  "modifiers": { "iceCount": 4 },
  "boss": {
    "id": "orochi_boss",
    "name": "Yamata-no-Orochi",
    "japaneseName": "八岐大蛇",
    "maxHp": 300,
    "headsOrParts": 8,
    "actionIntervalSeconds": 15,
    "skills": [
      { "type": "ice_curse", "name": "Hơi Thở Băng Giá" },
      { "type": "rock_blocker", "name": "Địa Chấn Vụn Đá" },
      { "type": "tile_swap", "name": "Cuồng Phong Bát Quái" }
    ]
  },
  "rewards": {
    "coins": 1000,
    "stars": 3,
    "unlockCharacterId": "orochi"
  }
}
```

---

## 7. LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

```
[ Phase 1: Core Engine MVP ]  (ĐÃ HOÀN TẤT)
  ✅ Thuật toán PathFinder 0/1/2 turns + viền rỗng
  ✅ Board Generator bảo đảm Solvable & Tự động đảo bài (Deadlock safe)
  ✅ Hệ thống Combo & FEVER Mode (mưa hoa anh đào, x3.5 điểm)
  ✅ Bộ tổng hợp âm thanh Web Audio chân thực (không phụ thuộc file ngoài)
  ✅ Cơ chế Boss Puzzle Orochi 8 đầu
  ✅ Bách Quỷ Đồ Thư (Album 108 Yokai) & Lore Modal
  ✅ 3 Boosters cốt lõi: Gợi Ý (Hint), Đổi Vị Trí (Shuffle), Phá Cặp (Bomb)
      │
      ▼
[ Phase 2: Content Expansion ]
  - Nạp 50 levels JSON theo các Chapter Nhật Bản
  - Nhập các Sprite Sheet 3x3 đã sinh vào thư mục assets
  - Thêm hiệu ứng âm thanh nhạc nền truyền thống (Koto / Shamisen lo-fi)
      │
      ▼
[ Phase 3: World Map & Meta Systems ]
  - Bản đồ World Map dạng cuộn tranh thủy mặc
  - Thêm World 2: Ai Cập Cổ Đại (Anubis, Ra, Sphinx)
  - Thêm World 3: Thần Thoại Bắc Âu (Thor, Odin, Fenrir)
```
