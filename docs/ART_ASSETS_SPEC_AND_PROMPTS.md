# BẢN ĐẶC TẢ THIẾT KẾ & BỘ PROMPT TẠO ẢNH GAME (ART ASSETS SPEC & PROMPTS)
> **Dự án:** Onet Linh Thú - Nối Thú Cổ Điển (Yokai & Thần Thoại)  
> **Phong cách chủ đạo:** Japanese Mythical Folklore, High-Fantasy Anime UI, Vibrant Stylized Mobile Game Asset, Cel-shaded with gold filigree accents, crystal clear icon silhouette.  
> **Quy cách xuất file:** Định dạng `.png`, nền trong suốt (transparent background), tỷ lệ 1:1, độ phân giải tối ưu `512x512` px (hoặc `1024x1024` px sau đó resize về thư mục `public/assets/`).

---

## 📋 DANH MỤC TỔNG HỢP CÁC TÀI NGUYÊN CẦN TẠO

| STT | Tên File Đích | Vị Trí Lưu Trong Dự Án | Mô Tả Ngắn | Vị Trí Hiển Thị Trong Game |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `icon_reward_coin.png` | `public/assets/icon_reward_coin.png` | Đồng xu vàng Koban cổ chạm khắc hoa văn | Thẻ Vàng Thắng (Victory), Top Bar, Tiệm Quân Nhu |
| **2** | `icon_reward_speed.png` | `public/assets/icon_reward_speed.png` | Đồng hồ cát ma thuật tốc chiến | Thẻ Điểm Tốc Độ (Victory Modal) |
| **3** | `icon_diamond.png` | `public/assets/icon_diamond.png` | Viên ngọc Magatama thần bí dạ quang | Top Bar, Tiệm Quân Nhu, Thưởng Boss |
| **4** | `icon_reward_exp.png` | `public/assets/icon_reward_exp.png` | Cầu linh lực tinh linh phát sáng | Cột kinh nghiệm Linh thú Màn Thắng |
| **5** | `icon_life_heart.png` | `public/assets/icon_life_heart.png` | Bùa sinh mệnh Omamori đỏ viền vàng | Chỉ số sinh lực HUD Gameplay, Top Bar |
| **6** | `badge_bronze.png` | `public/assets/badges/badge_bronze.png` | Huy hiệu Hạng Đồng (Độ khó Dễ) | Thẻ Huy Hiệu (Victory), Sổ Tay Huy Hiệu |
| **7** | `badge_silver.png` | `public/assets/badges/badge_silver.png` | Huy hiệu Hạng Bạc (Độ khó Vừa) | Thẻ Huy Hiệu (Victory), Sổ Tay Huy Hiệu |
| **8** | `badge_gold.png` | `public/assets/badges/badge_gold.png` | Huy hiệu Hạng Vàng (Độ khó Khó) | Thẻ Huy Hiệu (Victory), Sổ Tay Huy Hiệu |
| **9** | `badge_boss_slayer.png`| `public/assets/badges/badge_boss_slayer.png`| Huy hiệu Diệt Cự Trùm (Boss) | Thẻ Chiến Công Boss Màn Thắng |
| **10**| `badge_combo_master.png`| `public/assets/badges/badge_combo_master.png`| Huy hiệu Bá Chủ Combo | Sổ tay Thành Tựu |
| **11**| `badge_speed_god.png` | `public/assets/badges/badge_speed_god.png` | Huy hiệu Thần Tốc (Kỷ lục giờ) | Sổ tay Thành Tựu |
| **12**| `icon_lucky_bag.png` | `public/assets/icon_lucky_bag.png` | Túi phúc may mắn Fukubukuro | Tiếp tế khẩn cấp, Rương thưởng Shop |

---

## 🎨 CHI TIẾT PROMPT TỪNG ASSET (SẴN SÀNG COPY VÀO MIDJOURNEY / DALL-E / STABLE DIFFUSION)

---

### 1. Đồng Xu Vàng Koban Nhật Bản (`icon_reward_coin.png`)
* **Vấn đề hiện tại:** Đang dùng emoji `🪙` bị hệ điều hành biến thành đồng bạc La Mã có hình chim đại bàng.
* **Mục tiêu:** Đồng xu vàng cổ Koban hình bầu dục truyền thống của Nhật, chạm khắc cổng Torii hoặc hoa anh đào, rực rỡ óng ánh.
* **Prompt Midjourney / SDXL:**
```text
mobile game asset, single golden Japanese Koban coin icon, oval shaped antique gold coin, embossed with a miniature red Torii gate and delicate sakura flower pattern, polished pure 24k gold surface with magical warm golden glow, cel-shaded fantasy anime style, Genshin Impact UI aesthetic, crisp outlines, studio game lighting, clean isolated on pure black background, 8k resolution, centered composition --no silver, metallic coin with eagle, realistic photo, text, watermark, human hands, blurry, dark --ar 1:1 --v 6.0 --style raw
```
* **Mô tả tiếng Việt:** Đồng tiền vàng Koban hình bầu dục phong cách anime game, chạm khắc nổi cổng Torii đỏ và hoa anh đào, ánh kim vàng 24K ấm áp lấp lánh, viền rõ nét, nền đen/trong suốt tách nền.

---

### 2. Điểm Tốc Độ / Đồng Hồ Cát Ma Thuật (`icon_reward_speed.png`)
* **Vấn đề hiện tại:** Đang dùng emoji `⏱️` bị biến thành đồng hồ bấm giờ cơ khí màu xám bạc.
* **Mục tiêu:** Biểu tượng tốc độ thần thoại dạng đồng hồ cát cổ viền vàng hoặc la bàn thời gian bốc khói gió thanh lam.
* **Prompt Midjourney / SDXL:**
```text
mobile game UI icon, magical mythical hourglass of time, ornate gold and cyan lacquer frame with Japanese cloud swirl engravings, glowing luminous cyan mystic sand flowing inside glass chamber, gentle storm wind ribbons and golden lightning sparks swirling around, vibrant anime fantasy RPG style, game reward icon, centered, crisp silhouette, isolated on black background --no modern stopwatch, gray metallic clock, human hands, messy, blurry, text, watermark --ar 1:1 --v 6.0 --style raw
```
* **Mô tả tiếng Việt:** Đồng hồ cát ma thuật cổ đại khung sơn mài vàng kim nạm ngọc lam, cát phát quang màu xanh ngọc dạ quang đang chảy, có làn gió xoáy và tia sét vàng nhỏ xung quanh thể hiện tốc độ thần sầu.

---

### 3. Ngọc Quý Magatama / Kim Cương Khí Ngọc (`icon_diamond.png`)
* **Vấn đề hiện tại:** Đang dùng emoji `💎` đơn điệu.
* **Mục tiêu:** Viên ngọc thần Magatama (Bát Quỳnh Quỳnh Câu) hình móc câu âm dương, dạ quang màu ngọc bích / lam ngọc huyền ảo.
* **Prompt Midjourney / SDXL:**
```text
mobile game currency icon, mystical ancient Japanese Magatama jewel, comma-shaped smooth glowing jade talisman, vibrant cyan and radiant emerald luminescence, polished spiritual gemstone, subtle sacred golden engravings on the curve, soft ethereal aura and glowing spiritual dust, anime mobile RPG UI asset, centered, isolated on black background --no standard diamond, faceted gem, realistic photo, text, watermark, hand --ar 1:1 --v 6.0 --style raw
```
* **Mô tả tiếng Việt:** Viên ngọc thần Magatama hình dấu phẩy truyền thống của Nhật, bề mặt nhẵn bóng phát quang màu xanh ngọc bích và lam ngọc huyền ảo, tỏa ánh sáng tinh linh.

---

### 4. Quả Cầu Tinh Linh Kinh Nghiệm (`icon_reward_exp.png`)
* **Vấn đề hiện tại:** Canvas code vẽ hình cầu chữ EXP phẳng lì.
* **Mục tiêu:** Quả cầu linh lực màu lam ngọc bích bốc lửa ma trơi hồ ly (Kitsunebi) huyền bí.
* **Prompt Midjourney / SDXL:**
```text
mobile game reward icon, magical foxfire spirit orb, glowing Kitsunebi spirit flame, spherical ethereal blue and pink spiritual energy core, floating sparkles and cherry blossom petal wisps orbiting the core, vibrant cel-shaded anime fantasy style, game icon, clean edges, centered, isolated on black background --no text EXP, dark, blurry, realistic photograph, human, hands --ar 1:1 --v 6.0 --style raw
```
* **Mô tả tiếng Việt:** Quả cầu linh lực hồ ly Kitsunebi phát sáng màu xanh lam và hồng phấn rực rỡ, bao quanh bởi luồng năng lượng thần thú và cánh hoa đào phát sáng.

---

### 5. Bùa Sinh Mệnh / Trái Tim Hồ Ly (`icon_life_heart.png`)
* **Vấn đề hiện tại:** Đang dùng emoji trái tim `❤️` thông thường.
* **Mục tiêu:** Bùa Omamori sinh mệnh màu đỏ thắm thêu chỉ vàng hình trái tim hồ ly linh thiêng.
* **Prompt Midjourney / SDXL:**
```text
mobile game UI life icon, sacred Japanese Omamori amulet heart talisman, heart-shaped crimson silk pouch embroidered with golden sakura motifs and a cute fox emblem, delicate gold tassel and knotted cord at top, vibrant glowing ruby red aura, anime mobile RPG aesthetic, stylized vector asset, centered, isolated on black background --no flat emoji, realistic medical heart, text, watermark, human hands --ar 1:1 --v 6.0 --style raw
```
* **Mô tả tiếng Việt:** Bùa may mắn Omamori hình trái tim cách điệu bằng lụa đỏ thắm thêu chỉ vàng, có tua rua vàng truyền thống và gia huy hồ ly, phát ánh sáng hồng ngọc ấm áp.

---

### 6. Bộ 3 Huy Hiệu Vượt Màn Theo Độ Khó (Stage Badges: Bronze, Silver, Gold)
* **Vấn đề hiện tại:** Đang dùng emoji khiên Trung Cổ `🛡️` sọc đỏ trắng châu Âu lạc quẻ.
* **Mục tiêu:** 3 huy chương kim loại phong cách võ sĩ đạo / đền thần Thần Đạo Nhật Bản.

#### A. Huy Hiệu Hạng Đồng - Độ khó Dễ (`badge_bronze.png`)
* **Prompt:**
```text
mobile game achievement badge icon, bronze tier, circular ancient bronze medal with ornate Japanese wave patterns (Seigaiha), weathered antique copper and polished bronze finish, center engraved with a sacred wooden shrine icon, framed with dark crimson lacquer cord and decorative ribbons, anime game medal UI, centered, isolated on black background --no European medieval shield, knight, cross, photorealistic, blurry, text --ar 1:1 --v 6.0 --style raw
```

#### B. Huy Hiệu Hạng Bạc - Độ khó Vừa (`badge_silver.png`)
* **Prompt:**
```text
mobile game achievement badge icon, silver tier, circular shining sterling silver medal with celestial cloud engravings, gleaming platinum highlights, inlaid with a glowing sapphire gem in the center, decorated with royal indigo and cyan Japanese braided cords, anime game medal UI, crisp metallic reflections, centered, isolated on black background --no medieval shield, cross, blurry, text, watermark --ar 1:1 --v 6.0 --style raw
```

#### C. Huy Hiệu Hạng Vàng - Độ khó Khó (`badge_gold.png`)
* **Prompt:**
```text
mobile game achievement badge icon, gold tier, supreme circular pure 24k gold championship medal, intricate imperial chrysanthemum and flaming dragon filigree, inlaid with a radiant glowing red ruby crystal at the core, framed with golden braided Shimenawa sacred rope and festive vermilion silk ribbons, breathtaking high-end anime mobile game badge, centered, isolated on black background --no medieval kite shield, cross, dull bronze, blurry, text --ar 1:1 --v 6.0 --style raw
```

---

### 7. Huy Hiệu Diệt Cự Trùm / Trảm Xà (`badge_boss_slayer.png`)
* **Mục đích:** Thưởng khi người chơi đánh bại 16 Cự Trùm (Boss Yamata-no-Orochi, v.v.).
* **Prompt:**
```text
mobile game legendary trophy badge, Boss Slayer crest, demonic horned Oni dragon skull emblem forged in dark obsidian steel and blazing inferno gold, eight miniature glowing serpent eyes, fiery magma embers and purple curse aura radiating, supreme dark fantasy anime trophy, game achievement icon, isolated on black background --no friendly cartoon, medieval knight shield, blurry, text --ar 1:1 --v 6.0 --style raw
```

---

### 8. Huy Hiệu Tuyệt Đỉnh Combo (`badge_combo_master.png`)
* **Mục đích:** Thưởng khi người chơi đạt chuỗi nối combo liên tiếp x10 - x20.
* **Prompt:**
```text
mobile game achievement badge icon, Combo Master medal, twin golden lightning bolts striking a glowing thunder drum (Taiko), crackling electrical plasma aura in electric cyan and neon violet, Japanese Raijin lightning god motif, dynamic anime mobile RPG emblem, centered, isolated on black background --no medieval shield, blurry, dark, text --ar 1:1 --v 6.0 --style raw
```

---

### 9. Túi Phúc May Mắn Fukubukuro (`icon_lucky_bag.png`)
* **Mục đích:** Dùng trong Tiệm Quân Nhu cho gói quà bí ẩn hoặc nút tiếp tế khẩn cấp.
* **Prompt:**
```text
mobile game reward icon, Japanese lucky blessing pouch, traditional Fukubukuro gift bag made of radiant red silk, tied with a braided golden cord and bell, embroidered with golden cherry blossoms and lucky kanji symbol, golden coins and glowing magical sparkles spilling from top, whimsical anime mobile game style, isolated on black background --no dark, realistic photo, paper bag, text, watermark --ar 1:1 --v 6.0 --style raw
```

---

## 📌 HƯỚNG DẪN CÁCH LƯU & GẮN ẢNH VÀO DỰ ÁN

Khi bạn tạo xong các file ảnh trên:
1. **Tách nền trong suốt:** Đảm bảo file xuất ra là định dạng `.png` đã loại bỏ nền đen/trắng (transparent PNG).
2. **Kích thước khuyến nghị:** `512x512` px (sắc nét tuyệt đối trên màn hình Retina iPhone).
3. **Copy vào các thư mục sau trong dự án:**
   * Xu vàng: `public/assets/icon_reward_coin.png`
   * Điểm tốc độ: `public/assets/icon_reward_speed.png`
   * Kim cương: `public/assets/icon_diamond.png`
   * Kinh nghiệm: `public/assets/icon_reward_exp.png`
   * Bùa sinh mệnh: `public/assets/icon_life_heart.png`
   * Túi phúc: `public/assets/icon_lucky_bag.png`
   * Các huy hiệu: `public/assets/badges/badge_bronze.png`, `public/assets/badges/badge_silver.png`, `public/assets/badges/badge_gold.png`, `badge_boss_slayer.png`
4. **Báo cho tôi:** Ngay khi bạn copy ảnh vào, tôi sẽ cập nhật code trong `GameScene.ts`, `MainMenuScene.ts`, và `ShopModal.ts` để hiển thị ngay lập tức lên game!
