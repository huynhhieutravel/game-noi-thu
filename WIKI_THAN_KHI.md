# ⛩️ BÁCH KHOA TOÀN THƯ THẦN KHÍ (RELIC EQUIPMENT WIKI)

Tài liệu thiết kế chi tiết về **Hệ thống 30 Thần Khí Đồng Hành (Companion Mythic Relics)** cho 10 Chương (100 Màn chơi & Đấu Trường Boss). Đã được cân bằng toàn diện theo tiêu chuẩn thi đấu Onet: **70% Thắng nhờ Kỹ Năng Người Chơi → 20% Nhờ Linh Thú / Cổ Vật → 10% Nhờ Clutch Moment**.

---

## 📌 I. QUY TẮC VẬN HÀNH & TRIẾT LÝ THIẾT KẾ CỐT LÕI

### 1. Gắn Ở Đâu? (Trang Bị Trước Trận Đấu)
- **Vị trí:** Tại **Màn hình Chuẩn Bị Vào Trận (Stage Detail Modal)** - chọn mang theo **1 Thần Khí duy nhất** phù hợp với chiến thuật của màn (ví dụ: màn nhiều Băng/Đá mang *Con Mắt Thần Ra*, màn đánh Trùm mang *Thảo Thế Kiếm Kusanagi* hoặc *Lôi Đình Trượng Zeus*, màn nhiều bẫy mang *Pháp Luân Sudarshana*).

### 2. Dùng Ở Đâu? (Kích Hoạt Kỹ Năng Trong Trận Đấu)
- **Cơ chế nạp Nộ (Rage Meter):** Khi kết nối các cặp linh thú thành công và duy trì chuỗi combo, thanh Nộ sẽ tích lũy từ `0%` đến `100%`.
- **Kích hoạt:** Khi đầy Nộ (75 - 100 điểm tùy phẩm cấp), nút Thần Khí phát sáng rực rỡ và cho phép chạm để tung Tuyệt Kỹ Tối Thượng xoay chuyển thế trận!

### 3. Ba Nguyên Tắc Thiết Kế Sống Còn (Design Guard Rails)
1. **Tuyệt Đối Không Phá Vỡ Tile Parity:** Mọi kỹ năng giải bài trên bàn cờ luôn tuân thủ nghiêm ngặt **đơn vị Cặp Hợp Lệ (Valid Pairs)**. Tuyệt đối không xóa theo tile lẻ hay % tile để tránh làm hỏng cấu trúc toán học của ván đấu.
2. **Hỗ Trợ Người Chơi, Không Chơi Hộ:** Các thần khí chỉ giải phóng 2 - 4 cặp ô hiểm hóc, gom 3 cặp xa nhau về gần hoặc highlight đường nối ngắn nhất, tuyệt đối không auto-clear cả bàn cờ.
3. **Công Thức Sát Thương Hybrid (Base Damage + % Max HP Boss):** Giúp thần khí đầu game không bị phế ở late-game, đồng thời thần khí cuối game không one-shot trùm khi cày lại màn cũ. Có trần sát thương (Soft-Cap) theo từng chương.

---

## 🎲 II. CƠ CHẾ THU THẬP: BẬC THANG 40 / 75 / 100 MẢNH & QUY ĐỔI MẢNH THỪA

| Phẩm Cấp | Số Mảnh Cần Đúc | Tỷ Lệ Rơi Mảnh (Dễ / Vừa / Khó) | Phân Bổ Màn Chơi | Quy Đổi Mảnh Thừa | Power Budget |
| :--- | :---: | :---: | :--- | :---: | :---: |
| 🟢 **Hạ Phẩm** | **40 Mảnh** | **1.5% → 3.0% → 5.0%** *(1 mảnh)* | Màn thường (1–4, 6–9) | **+25 Xu / Mảnh** | 70 – 85 |
| 🟡 **Trung Phẩm** | **75 Mảnh** | **0.8% → 1.8% → 3.0%** *(1 mảnh)* | Mini-Boss Màn 5, 15... | **+50 Xu / Mảnh** | 90 – 105 |
| 🔴 **Thượng Phẩm** | **100 Mảnh** | **0.4% → 0.9% → 1.8%** *(1–2 mảnh)* | Đại Trùm Màn 10 & Boss Arena | **+100 Xu / Mảnh** | 110 – 130 *(Mythic: 140)* |

> [!NOTE]
> **Cơ Chế Tỷ Lệ & Tỉ Lệ Rơi Khó (Calibrated Hardcore Drop System):**
> - **Ô Phát Sáng Cổ Vật Trên Bàn Cờ:** Xuất hiện hiếm với tỷ lệ **1.0%** (Dễ) → **2.0%** (Vừa) → **3.5%** (Khó) → **5.0%** (Trùm). Nếu xuất hiện và người chơi nối thành công trong ván, chắc chắn nhận **1 Mảnh Cổ Vật** khi chiến thắng.
> - **Rơi Thưởng Cuối Màn:** Tỷ lệ từ **0.4% đến 5.0%** tùy phẩm cấp và độ khó, mỗi lần rơi **1 mảnh** (riêng Thượng Phẩm ở độ khó Khó có 10% cơ hội rơi 2 mảnh).
> - **Thưởng Vượt Trùm 3⭐ Khó:** Cộng thêm **+4.0%** vào tỷ lệ rơi (thay vì 100% farm vô tận cũ), giữ trọn tính danh giá và thử thách cày cuốc RPG chuẩn mực.

---

## 🧩 III. PHÂN LOẠI 6 VAI TRÒ CHIẾN THUẬT (ARCHETYPES)

1. **Clear (Giải Cặp):** Soi sáng, tự giải 2–4 cặp ô khó nhất (Yata, Jack, Hologram, Chaos Singularity, Genesis Core).
2. **Time (Thời Gian):** Đóng băng đồng hồ 6s, hồi mạng, cộng dồn +1s/cặp có trần (Chronos, Shankha, Ankh, Hổ Phách, Pin Hạt Nhân, Chén Thánh).
3. **Control (Kiểm Soát Bàn Cờ):** Khóa trọng lực 15s, shuffle thông minh mở ít nhất 5 cặp, dồn thẻ về phẳng (Khepri, Aegis, Bát Quái Kính, Hư Không, Vòng Xoáy).
4. **Boss (Sát Thương Trùm):** Giáng đòn sát thương hybrid [Base + % HP] uy lực cao (Kusanagi, Zeus, Trishula, Pháo Phản Vật Chất, Vương Miện Cổ Thần).
5. **Economy (Kinh Tế):** Nhân đôi vàng và điểm số trong 15s (Lô Đỉnh Thái Thượng).
6. **Anti-Obstacle (Phá Bẫy & Khắc Chế):** Dọn cạm bẫy gai trói, nhện, đập đá, tan băng (Bình Hồ Lô, Con Mắt Ra, Tru Tiên Kiếm, Sudarshana, Poseidon, Rương Davy Jones, Vuốt T-Rex, Trái Tim Magma).

---

## 📜 IV. DANH SÁCH CHI TIẾT 30 THẦN KHÍ (10 CHƯƠNG / MAP)

### 🇯🇵 CHƯƠNG 1: NHẬT BẢN • BÁCH QUỶ KHỞI NGUYÊN (Màn 1 – 10)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_yokai_01`**<br>🪞 **Gương Thần Yata**<br>*(Bát Chỉ Kính (八咫鏡))* | 🟢 Hạ Phẩm | `clear`<br>75pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Kính Chiếu Chân Tướng:** Lập tức soi sáng và tự động nối ngay 2 cặp linh thú khó nhất trên bàn cờ. | `3D isometric render of ancient ornate golden Japanese sacred mirror Yata no Kagami, intricate mythical kitsune carvings, glowing lunar aura, resting on an ancient stone shrine pedestal, 1:1 ratio, dark cinematic fantasy background, octane render, 8k resolution` |
| **`relic_yokai_02`**<br>🍶 **Bình Hồ Lô Quỷ Vương**<br>*(Tửu Thôn Hồ Lô (酒呑童子))* | 🟡 Trung Phẩm | `anti_obstacle`<br>95pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Hút Hồn Quỷ Lửa:** Hút sạch toàn bộ mạng nhện và bụi gai trên bàn cờ, mỗi bẫy hút được +1s thời gian (tối đa +6 giây). | `3D isometric render of demonic dark purple sake gourd bottle wrapped with sacred golden shimenawa ropes, ominous red demonic flame leaking from the mouth, floating on ancient stone, 1:1 ratio, dark fantasy atmosphere, 8k resolution` |
| **`relic_yokai_03`**<br>🗡️ **Thảo Thế Kiếm Kusanagi**<br>*(Thiên Tôn Vân Kiếm (草薙の剣))* | 🔴 Thượng Phẩm | `boss`<br>115pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Thiên Kiếm Trảm Ma:** Phóng kiếm khí hình chữ Thập quét ngang dọc, giáng [180 + 4% Max HP] sát thương lên Boss! | `3D isometric render of mythical Japanese holy sword Kusanagi no Tsurugi, crackling with cyan lightning and heavenly clouds, ornate golden dragon hilt, resting vertically on glowing pedestal, 1:1 ratio, epic lighting, 8k resolution` |

### 🇪🇬 CHƯƠNG 2: AI CẬP • SA MẠC & SÔNG NILE (Màn 11 – 20)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_egypt_01`**<br>☥ **Chìa Khóa Sinh Mệnh Ankh**<br>*(Thần Khí Bất Tử)* | 🟢 Hạ Phẩm | `time`<br>78pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **85** | **Sinh Mệnh Phục Sinh:** Hồi phục lập tức +1 Mạng sống và cộng thêm +8 giây vào đồng hồ đếm ngược. | `3D isometric render of ancient Egyptian gold Ankh cross inlaid with lapis lazuli and turquoise gems, radiating warm solar vitality aura, resting on golden sand pedestal, 1:1 ratio, photorealistic, 8k resolution` |
| **`relic_egypt_02`**<br>🪲 **Bọ Hung Hoàng Kim Khepri**<br>*(Thần Hộ Mệnh Cát Vàng)* | 🟡 Trung Phẩm | `control`<br>95pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Bão Cát Biến Hóa:** Biến đổi 2 cặp ô ngẫu nhiên về cùng một loại linh thú, mở đường tạo chuỗi Siêu Combo x5. | `3D isometric render of sacred Egyptian scarab beetle made of polished pure gold, holding a glowing ruby red sun orb, intricate hieroglyphic engravings on pedestal, 1:1 ratio, cinematic octane render` |
| **`relic_egypt_03`**<br>👁️ **Con Mắt Thần Ra**<br>*(Eye of Ra (Nhật Nhãn Tối Cao))* | 🔴 Thượng Phẩm | `anti_obstacle`<br>118pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Nhật Thần Phán Quyết:** Bắn chùm quang tuyến thiêu rụi tối đa 4 ô Băng/Đá, đồng thời làm mù Boss trong 5 giây. | `3D isometric render of Eye of Ra amulet crafted in pure gold and fiery ruby iris, shooting rays of divine sunlight, resting on pharaoh altar, 1:1 ratio, god rays lighting, 8k resolution` |

### 🏛️ CHƯƠNG 3: HY LẠP • ĐỈNH NÚI OLYMPUS (Màn 21 – 30)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_greece_01`**<br>⏳ **Đồng Hồ Cát Chronos**<br>*(Thời Gian Sa Lậu)* | 🟢 Hạ Phẩm | `time`<br>80pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Ngưng Đọng Không Gian:** Đóng băng hoàn toàn thời gian trong 6 giây (vẫn kết nối ăn điểm bình thường). | `3D isometric render of magical Greek marble and gold hourglass, glowing stardust flowing inside, ancient Greek pillar base, 1:1 ratio, mystical ambient glow, 8k resolution` |
| **`relic_greece_02`**<br>🛡️ **Khiên Thần Aegis**<br>*(Thần Khiên Medusa)* | 🟡 Trung Phẩm | `control`<br>98pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Hóa Đá Cương Tỏa:** Khóa cứng hướng dồn trọng lực trong 15 giây, chuyển bàn cờ về dạng tĩnh lặng dễ nối. | `3D isometric render of ornate bronze Greek round shield Aegis with embossed Medusa face, emerald glowing eyes, golden laurel border on marble altar, 1:1 ratio, dramatic cinematic rim light` |
| **`relic_greece_03`**<br>⚡ **Lôi Đình Trượng Zeus**<br>*(Thần Lôi Bạt Tụy)* | 🔴 Thượng Phẩm | `boss`<br>122pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Vạn Lôi Oanh Đỉnh:** Phóng sấm sét giải phóng 2 cặp ô ngẫu nhiên và giáng [220 + 5% Max HP] sát thương điện giật lên Boss! | `3D isometric render of Zeus thunderbolt spear of pure solidified electrical plasma and gold, surrounded by crackling violet lightning arcs, floating on Olympus pedestal, 1:1 ratio, 8k resolution` |

### 🐉 CHƯƠNG 4: TAM GIỚI • TIÊN MA Á ĐÔNG (Màn 31 – 40)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_wuxia_01`**<br>🏺 **Lô Đỉnh Thái Thượng**<br>*(Bát Quái Đan Lô)* | 🟢 Hạ Phẩm | `economy`<br>72pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Luyện Đan Tăng Thưởng:** Nhân đôi (x2) toàn bộ lượng Tiền Vàng và Điểm số kiếm được trong 15 giây tiếp theo. | `3D isometric render of Taoist bronze alchemy cauldron tripod with Bagua trigram engravings, five-color celestial smoke swirling from lid, jade pedestal, 1:1 ratio, wuxia fantasy style` |
| **`relic_wuxia_02`**<br>☯️ **Bát Quái Kính Phong Ma**<br>*(Càn Khôn Kính)* | 🟡 Trung Phẩm | `control`<br>96pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **85** | **Càn Khôn Nghịch Chuyển:** Sắp xếp lại bàn cờ theo trật tự tối ưu, đảm bảo mở ra ít nhất 5 cặp ăn được ngay trước mắt. | `3D isometric render of peachwood Bagua mirror with Yin Yang talisman in the center, inlaid with azure dragon green jade, glowing runes floating, 1:1 ratio, 8k resolution` |
| **`relic_wuxia_03`**<br>⚔️ **Tru Tiên Kiếm Trận**<br>*(Thái Cổ Tru Tiên)* | 🔴 Thượng Phẩm | `boss`<br>120pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Vạn Kiếm Quy Tông:** Hàng trăm phi kiếm quét sạch 3 vật cản và chém thẳng [200 + 4.5% Max HP] sát thương lên Boss! | `3D isometric render of ancient Chinese divine celestial sword hovering inside a glowing red formation circle with miniature flying swords, glowing mystical runes, 1:1 ratio, cinematic` |

### 🇮🇳 CHƯƠNG 5: NAM Á • SỬ THI SÔNG HẰNG (Màn 41 – 50)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_india_01`**<br>🐚 **Tù Và Vỏ Ốc Shankha**<br>*(Thần Loa Thiêng)* | 🟢 Hạ Phẩm | `time`<br>76pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Thần Loa Tĩnh Tâm:** Trong 12 giây, mỗi cặp kết nối thành công được cộng thêm +1s (trần tối đa +6 giây). | `3D isometric render of holy white conch shell Shankha decorated with filigree gold and rubies, emitting sacred soundwave light waves, lotus flower base, 1:1 ratio, 8k resolution` |
| **`relic_india_02`**<br>☸️ **Pháp Luân Sudarshana**<br>*(Vòng Xoay Thần Thánh)* | 🟡 Trung Phẩm | `anti_obstacle`<br>94pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Luân Xa Quét Sạch:** Đĩa luân xa xoay tròn cắt đứt tối đa 4 dây leo gai trói và song sắt trên bàn cờ. | `3D isometric render of golden spinning discus weapon Sudarshana Chakra with 108 serrated solar blades of light, glowing sacred energy, ornate Indian pedestal, 1:1 ratio` |
| **`relic_india_03`**<br>🔱 **Đinh Ba Trishula Thần Shiva**<br>*(Tam Xoa Kích Hủy Diệt)* | 🔴 Thượng Phẩm | `boss`<br>125pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Tam Giới Hủy Diệt:** Sóng xung kích giải 2 cặp thẻ bất kỳ và giáng [250 + 6% Max HP] sát thương hủy diệt lên Boss! | `3D isometric render of divine gold trident Trishula entwined by a sacred cobra snake, blue cosmic flame burning on the tips, damaru drum attached, 1:1 ratio, majestic lighting, 8k resolution` |

### 🏴‍☠️ CHƯƠNG 6: VÙNG BIỂN CHẾT • HẢI TẶC & THỦY CUNG (Màn 51 – 60)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_pirate_01`**<br>🧭 **La Bàn Jack Ma Thần**<br>*(La Bàn Chỉ Tim)* | 🟢 Hạ Phẩm | `clear`<br>74pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **75** | **Chỉ Dẫn Kho Báu:** Soi sáng rực rỡ 3 cặp thẻ có đường đi ngắn nhất, mở tốc độ nối siêu tốc. | `3D isometric render of weathered brass pirate compass with spinning mystical glowing needle, moss and barnacles on rim, resting on wooden ship deck pedestal, 1:1 ratio` |
| **`relic_pirate_02`**<br>🦪 **Chuỗi Ngọc Poseidon**<br>*(Hải Vương Châu)* | 🟡 Trung Phẩm | `anti_obstacle`<br>96pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **85** | **Thủy Triều Rút Cạn:** Làm tan chảy tối đa 4 ô Băng giá và dập tắt độc tố của xúc tu Kraken trên bàn cờ. | `3D isometric render of glowing aquamarine pearl necklace with golden seashell clasp, floating water droplets and luminescent seafoam aura, coral reef base, 1:1 ratio` |
| **`relic_pirate_03`**<br>🧰 **Rương Tử Thần Davy Jones**<br>*(Dead Man's Chest)* | 🔴 Thượng Phẩm | `boss`<br>124pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Triệu Hồi Cự Quái Kraken:** Xúc tu đập tan tối đa 4 vật cản ở các góc và giáng [240 + 5.5% Max HP] sát thương chuẩn lên Boss! | `3D isometric render of cursed iron-bound treasure chest wrapped in rusted anchor chains, lock shaped like a snarling Kraken skull with glowing green ghostfire, 1:1 ratio` |

### 🦖 CHƯƠNG 7: TIỀN SỬ • HỎA DIỆM KHỦNG LONG (Màn 61 – 70)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_dinosaur_01`**<br>💎 **Hổ Phách Muôn Loài**<br>*(Amber Hóa Thạch)* | 🟢 Hạ Phẩm | `time`<br>78pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Đóng Băng Thời Khắc:** Ngưng trệ thời gian 6 giây, bảo vệ người chơi 1 lần không bị trừ mạng nếu đi sai. | `3D isometric render of translucent golden amber gemstone with a glowing prehistoric insect preserved inside, warm inner bioluminescence, volcanic rock base, 1:1 ratio` |
| **`relic_dinosaur_02`**<br>🦖 **Vuốt Bạo Chúa T-Rex**<br>*(Bạo Chúa Cự Trảo)* | 🟡 Trung Phẩm | `anti_obstacle`<br>95pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Cào Nát Chướng Ngại:** Nghiền nát ngay lập tức tối đa 4 tảng đá cản đường trên bàn cờ thành cát bụi! | `3D isometric render of massive fossilized T-Rex claw weapon coated in veins of glowing red molten magma, sharp and lethal, stone pedestal, 1:1 ratio` |
| **`relic_dinosaur_03`**<br>❤️‍🔥 **Trái Tim Nham Thạch Magma**<br>*(Hỏa Sơn Thần Tâm)* | 🔴 Thượng Phẩm | `control`<br>122pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Hỏa Sơn Bùng Nổ:** Tự động giải phóng đúng 2 cặp linh thú hợp lệ và nung chảy giáp Boss (+20% sát thương nhận thêm trong 8s)! | `3D isometric render of pulsating molten lava rock shaped like a beating dragon heart, cracked black crust with blazing orange fire glowing inside, obsidian base, 1:1 ratio` |

### 🛸 CHƯƠNG 8: TƯƠNG LAI • HẠM ĐỘI CƠ GIÁP (Màn 71 – 80)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_space_01`**<br>💠 **Lăng Kính Hologram AI**<br>*(Trợ Lý Không Gian)* | 🟢 Hạ Phẩm | `clear`<br>78pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Quét Tia Laser Ma Trận:** Tự động phân tích và kết nối chuẩn xác 2 cặp thẻ nằm ở mép ngoài cùng bàn cờ. | `3D isometric render of futuristic crystalline glass data cube projecting floating cyan neon holographic star maps and HUD rings, sleek sci-fi carbon fiber pedestal, 1:1 ratio` |
| **`relic_space_02`**<br>🔋 **Pin Hạt Nhân Vĩnh Cửu**<br>*(Nano Core)* | 🟡 Trung Phẩm | `time`<br>102pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **85** | **Siêu Tốc Đột Phá:** Trong 15 giây, mỗi cặp ăn được +1s (tối đa +6s) và giảm 10% Nộ tiêu hao cho lần dùng tiếp theo. | `3D isometric render of hexagonal high-tech energy battery core glowing with intense pulsating cobalt blue plasma, metallic titanium casing, futuristic display base, 1:1 ratio` |
| **`relic_space_03`**<br>🚀 **Pháo Hạt Phản Vật Chất**<br>*(Anti-Matter Cannon)* | 🔴 Thượng Phẩm | `boss`<br>126pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Tia Hủy Diệt Lượng Tử:** Bắn chùm tia xóa sổ 2 cặp ngẫu nhiên, giáng [260 + 6.5% Max HP] và khóa chiêu Boss trong 6 giây! | `3D isometric render of miniature floating orbital mecha railgun cannon charging miniature black hole gravity singularity, neon purple and electric blue lighting, 1:1 ratio` |

### 🌀 CHƯƠNG 9: HỖN ĐỘN • ĐẠI LOẠN ĐẤU VẠN GIỚI (Màn 81 – 90)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_chaos_01`**<br>🔮 **Mảnh Vỡ Hư Không**<br>*(Void Shard)* | 🟢 Hạ Phẩm | `control`<br>80pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **80** | **Dịch Chuyển Không Gian:** Hóa giải toàn bộ trọng lực dị thường trong 15 giây, dồn thẻ về dạng phẳng để kết nối dễ dàng. | `3D isometric render of floating cracked deep purple obsidian crystal shard, containing moving miniature nebulae, surrounded by cosmic dust rings, floating over void pedestal, 1:1 ratio` |
| **`relic_chaos_02`**<br>🌀 **Vòng Xoáy Đa Chiều**<br>*(Dimensional Vortex)* | 🟡 Trung Phẩm | `control`<br>104pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **90** | **Hút Sao Đồng Quy:** Hút 3 cặp thẻ xa nhau nhất về cạnh nhau, khai thông bế tắc và tạo thế nối liên hoàn! | `3D isometric render of miniature spiral galaxy vortex spinning with violet and neon magenta cosmic energy, encircled by golden ancient runic ring, 1:1 ratio, 8k resolution` |
| **`relic_chaos_03`**<br>🪐 **Viên Đá Hỗn Độn Vạn Giới**<br>*(Chaos Singularity)* | 🔴 Thượng Phẩm | `clear`<br>135pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **Tái Thiết Vũ Trụ:** Tự động giải 3 cặp thẻ khó nhất và giáng [280 + 7% Max HP] sát thương cực đại lên Đại Trùm! | `3D isometric render of celestial rainbow prism infinity stone surrounded by rotating gyroscopic rings of celestial gold, casting iridescent light beams, 1:1 ratio, majestic render` |

### 👑 CHƯƠNG 10: TỐI THƯỢNG • ĐẠI CHIẾN 16 CỰ TRÙM (Màn 91 – 100)

| ID & Tên | Phẩm Cấp | Vai Trò | Mảnh Đúc | Nộ | Kỹ Năng Cân Bằng Thực Chiến | Prompt Vẽ Ảnh AI (1:1) |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **`relic_ultimate_01`**<br>🏆 **Chén Thánh Hoàng Gia**<br>*(Holy Grail)* | 🟢 Hạ Phẩm | `time`<br>82pt | **40 Mảnh**<br><small>Thừa: +25 Xu</small> | **85** | **Ân Huệ Thánh Quang:** Ban trạng thái Hộ Thể trong 8 giây: không thua nếu hết giờ và không bị trừ mạng khi nối sai. | `3D isometric render of golden Holy Grail goblet carved with divine dragons and angels, filled with glowing sacred blue liquid light, white marble pedestal, 1:1 ratio` |
| **`relic_ultimate_02`**<br>👑 **Vương Miện Cổ Thần**<br>*(Crown of Ancients)* | 🟡 Trung Phẩm | `boss`<br>105pt | **75 Mảnh**<br><small>Thừa: +50 Xu</small> | **95** | **Uy Nghi Đấng Sáng Tạo:** Giáng đòn uy áp trừ thẳng 8% Max HP Boss và quét sạch tối đa 3 vật cản nguy hiểm nhất! | `3D isometric render of sovereign radiant gold crown inlaid with 16 elemental gemstones representing 16 boss realms, floating majestically with blinding golden aura, 1:1 ratio` |
| **`relic_ultimate_03`**<br>✨ **Trái Tim Vũ Trụ Vĩnh Cửu**<br>*(Eternal Genesis Core)* | 🔴 Thượng Phẩm | `clear`<br>140pt | **100 Mảnh**<br><small>Thừa: +100 Xu</small> | **100** | **ĐẠI TẬN THẾ - TÁI SINH:** Quét sạch 4 cặp thẻ khó nhất bàn cờ và dội sấm chém [320 + 8% Max HP] sát thương hủy diệt Boss! | `3D isometric render of crystal celestial sphere enclosing a living miniature universe with spiraling galaxies and supernova explosions, held by ancient divine golden pillars, 1:1 ratio, ultimate masterwork` |

---

## 📂 V. THƯ MỤC LƯU ẢNH TRONG DỰ ÁN
Khi bạn tạo ảnh 1:1 cho Thần Khí, đổi tên file theo ID tương ứng và đặt vào thư mục:
`public/assets/relics/` (Ví dụ: `public/assets/relics/relic_yokai_01.png`). Hệ thống game và Wiki sẽ tự động nhận diện và hiển thị!
