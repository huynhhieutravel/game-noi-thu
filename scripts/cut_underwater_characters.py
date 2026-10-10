import os
import cv2
import numpy as np
from PIL import Image

UNDERWATER_SHEET_CONFIGS = [
    {
        "id": "sheet_01_royal_court",
        "chapter_dir": "chapter_01_royal_court",
        "title": "Hoàng Triều Thủy Cung (Royal Court of Atlantis)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791472769665.jpg",
        "characters": [
            {
                "id": "dolphin_prince",
                "name": "Hoàng Tử Cá Heo Delphin",
                "native": "Prince Delphin",
                "title": "Người Kế Vị Biển Xanh",
                "symbol": "🐬",
                "rarity": "legendary",
                "element": "water",
                "desc": "Hoàng tử cá heo thông minh tuấn tú đội vương miện hoàng gia vàng nạm ngọc bích, khoác áo choàng xanh lướt sóng uy nghiêm."
            },
            {
                "id": "manta_princess",
                "name": "Công Chúa Đuối Hoa Rayna",
                "native": "Princess Rayna",
                "title": "Vũ Nữ Cung Đình Atlantis",
                "symbol": "🪸",
                "rarity": "legendary",
                "element": "water",
                "desc": "Nàng công chúa cá đuối kiêu sa khoác xiêm y tím lấp lánh dệt từ tơ ngọc trai, duyên dáng uyển chuyển giữa làn nước trong vắt."
            },
            {
                "id": "puffer_guard",
                "name": "Thị Vệ Cá Nóc Blowy",
                "native": "Guard Blowy",
                "title": "Hộ Vệ Gai Nhọn Cung Đình",
                "symbol": "🐡",
                "rarity": "epic",
                "element": "water",
                "desc": "Thị vệ cá nóc tròn xoe đội mũ giáp hoàng kim, tay cầm giáo nhọn và khiên san hô, sẵn sàng phồng to mình che chở hoàng gia."
            },
            {
                "id": "jellyfish_maiden",
                "name": "Thần Đèn Sứa Aurelia",
                "native": "Lady Aurelia",
                "title": "Hoa Đăng Biển Sâu",
                "symbol": "🪼",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Nàng tiên sứa lung linh phát quang bảy sắc cầu vồng, thân mang lồng đèn ngọc trai chiếu rọi cung điện thủy tề trong đêm."
            },
            {
                "id": "turtle_scholar",
                "name": "Học Giả Rùa Biển Shelly",
                "native": "Scholar Shelly",
                "title": "Trưởng Lão Mai Ngọc",
                "symbol": "🐢",
                "rarity": "epic",
                "element": "earth",
                "desc": "Nhà thông thái uyên bác của vương quốc mang giáp ngọc lục bảo và vương miện vàng, am hiểu tường tận ngàn năm lịch sử biển sâu."
            },
            {
                "id": "seahorse_knight",
                "name": "Kỵ Sĩ Cá Ngựa Hippy",
                "native": "Knight Hippy",
                "title": "Tiên Phong Cờ Xanh",
                "symbol": "🦄",
                "rarity": "rare",
                "element": "water",
                "desc": "Kỵ sĩ cá ngựa sắc hồng tím oai vệ giương cao lá cờ hoàng gia cây đinh ba vàng, dẫn dắt đội tiền tiêu tuần tra biên giới biển."
            },
            {
                "id": "clam_butler",
                "name": "Quản Gia Sò Trai Barnaby",
                "native": "Butler Barnaby",
                "title": "Quản Gia Trân Châu",
                "symbol": "🦪",
                "rarity": "rare",
                "element": "earth",
                "desc": "Quản gia sò điệp lịch thiệp diện tuxedo thắt nơ đỏ, tay bưng khay bạc phục vụ trân châu hoàng gia với phong thái cung đình mẫu mực."
            },
            {
                "id": "crab_courier",
                "name": "Liên Lạc Viên Cua Krabby",
                "native": "Courier Krabby",
                "title": "Sứ Giả Tin Mật Cung Đình",
                "symbol": "🦀",
                "rarity": "common",
                "element": "earth",
                "desc": "Chú cua đỏ vui tính đội mũ sĩ quan gắn lông vũ, đeo balo đựng mật thư hoàng gia chạy thoăn thoắt truyền tin tức khắp đại dương."
            },
            {
                "id": "pearl_shrine",
                "name": "Đài Phun Nước Trân Châu",
                "native": "Royal Pearl Shrine",
                "title": "Thần Tích Suối Nguồn",
                "symbol": "⛲",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Đài tế linh thiêng đính ngọc trai khổng lồ tỏa sóng ma thuật xanh biếc, suối nguồn nuôi dưỡng sinh khí cho toàn bộ vương quốc Atlantis."
            }
        ]
    },
    {
        "id": "sheet_02_coral_carnival",
        "chapter_dir": "chapter_02_coral_carnival",
        "title": "Lễ Hội San Hô & Âm Nhạc (Coral Carnival & Ocean Melodies)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791472769641.jpg",
        "characters": [
            {
                "id": "clownfish_drummer",
                "name": "Nhạc Công Cá Hề Nemo",
                "native": "Drummer Nemo",
                "title": "Tay Trống San Hô",
                "symbol": "🥁",
                "rarity": "epic",
                "element": "fire",
                "desc": "Chú cá hề nhiệt huyết quấn khăn lễ hội đỏ trắng, gõ dùi trống tưng bừng tạo nhịp điệu mở màn lễ hội đường phố dưới đáy biển."
            },
            {
                "id": "lionfish_dancer",
                "name": "Vũ Công Cá Sư Tử Liona",
                "native": "Dancer Liona",
                "title": "Hỏa Điểu Dưới Nước",
                "symbol": "💃",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Nàng cá sư tử lộng lẫy đội vương miện đính ngọc, múa điệu flamenco san hô với vây áo xòe rộng rực rỡ như ngọn lửa bập bùng."
            },
            {
                "id": "dory_dj",
                "name": "Phù Thủy Bàn Xoay DJ Dory",
                "native": "DJ Dory",
                "title": "Ảo Thuật Gia Âm Thanh",
                "symbol": "🎧",
                "rarity": "epic",
                "element": "water",
                "desc": "Chú cá đuôi gai xanh đeo tai nghe vỏ sò sành điệu, đôi vây thoăn thoắt chà đĩa trên bàn xoay san hô khuấy động cả biển sâu."
            },
            {
                "id": "firecracker_shrimp",
                "name": "Bé Tôm Pháo Bông Shrimpy",
                "native": "Shrimpy the Sparkler",
                "title": "Thần Pháo Mừng Lễ",
                "symbol": "🦐",
                "rarity": "common",
                "element": "fire",
                "desc": "Chú tôm nhỏ tinh nghịch quấn băng đô lễ hội, hai tay cầm hai ống pháo hoa dưới nước bắn ra những chùm tia sáng lấp lánh."
            },
            {
                "id": "nudibranch_diva",
                "name": "Danh Ca Sên Biển Glauca",
                "native": "Diva Glauca",
                "title": "Giọng Ca Cầu Vồng",
                "symbol": "🎤",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Cô nàng sên biển cầu vồng bảy sắc cầm micro vỏ sò ngọc, cất giọng ca thánh thót khiến muôn loài sinh vật đáy biển say đắm."
            },
            {
                "id": "starfish_acrobat",
                "name": "Nghệ Sĩ Sao Biển Stella",
                "native": "Acrobat Stella",
                "title": "Ngôi Sao Xiếc Cung Đình",
                "symbol": "⭐",
                "rarity": "rare",
                "element": "earth",
                "desc": "Ngôi sao biển hồng đáng yêu đội mũ ảo thuật gia, biểu diễn màn thăng bằng đỉnh cao trên quả bóng ngọc bích giữa tiếng reo hò."
            },
            {
                "id": "hermit_parade",
                "name": "Ốc Mượn Hồn Diễu Hành Hermy",
                "native": "Hermy the Marshall",
                "title": "Người Dẫn Đoàn Rực Rỡ",
                "symbol": "🐚",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú cua ẩn sĩ cõng chiếc vỏ ốc ngọc san hô trang hoàng lộng lẫy cắm cờ hoàng gia, dẫn đầu đoàn diễu hành lễ hội carnival."
            },
            {
                "id": "trumpet_fish",
                "name": "Kèn Đồng Cá Mũi Dài Pip",
                "native": "Trumpeter Pip",
                "title": "Kèn Trưởng Quân Nhạc",
                "symbol": "🎺",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Chú cá mỏ kèn khoác quân phục hải quân thổi vang tiếng trumpet hoàng kim giòn giã, thúc giục vũ hội tưng bừng bắt đầu."
            },
            {
                "id": "conch_jukebox",
                "name": "Ốc Loa Đại Ngàn Conchita",
                "native": "Mystic Conch Jukebox",
                "title": "Hộp Nhạc San Hô Thần",
                "symbol": "📻",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Chiếc vỏ ốc xà cừ khổng lồ tích tụ âm hưởng ngàn năm của sóng biển, phát ra những bản nhạc du dương xoa dịu tâm hồn biển cả."
            }
        ]
    },
    {
        "id": "sheet_03_ancient_guardians",
        "chapter_dir": "chapter_03_ancient_guardians",
        "title": "Hộ Pháp Cổ Đại & Di Tích (Ancient Guardians & Sunken Relics)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791472769613.jpg",
        "characters": [
            {
                "id": "armored_moray",
                "name": "Chiến Xà Thiết Giáp Moray",
                "native": "Moray the Titan",
                "title": "Mãng Xà Đáy Vực",
                "symbol": "🐍",
                "rarity": "legendary",
                "element": "water",
                "desc": "Chiến xà biển khổng lồ mình khoác giáp vàng nạm lam ngọc, canh gác vực thẳm cấm địa với ánh nhìn sắc lẹm và sức mạnh cuồng phong."
            },
            {
                "id": "nautilus_sage",
                "name": "Hiền Triết Ốc Anh Vũ Nauti",
                "native": "Nautilus Sage",
                "title": "Đại Pháp Sư Vỏ Cổ",
                "symbol": "🧙‍♂️",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Bậc thầy ma pháp cổ đại đội mũ ốc anh vũ xoắn hoàng kim, tay nắm quyền trượng pháp châu điều khiển thần chú thủy nguyên bí truyền."
            },
            {
                "id": "crystal_stonefish",
                "name": "Cá Đá Lam Ngọc Golem",
                "native": "Crystal Stonefish",
                "title": "Hộ Pháp Đá Gai",
                "symbol": "🪨",
                "rarity": "epic",
                "element": "earth",
                "desc": "Quái thú mình đá mọc đầy gai tinh thể ngọc bích và vỏ sò hóa thạch, ngụy trang hoàn hảo thành tảng đá ngầm bảo vệ đền thiêng."
            },
            {
                "id": "angelfish_priestess",
                "name": "Tư Tế Thần Tiên Cá Angela",
                "native": "High Priestess Angela",
                "title": "Sứ Giả Ánh Sáng Thủy Cung",
                "symbol": "🐠",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Nàng tư tế cá thiên thần mang đôi cánh vây lụa trắng hoàng kim, tay nâng quyền trượng ngọc tỏa linh quang thanh tẩy ô uế."
            },
            {
                "id": "swordfish_gladiator",
                "name": "Chiến Binh Kiếm Ngư Gladius",
                "native": "Gladius the Vanguard",
                "title": "Mũi Kiếm Xuyên Đại Dương",
                "symbol": "🗡️",
                "rarity": "epic",
                "element": "water",
                "desc": "Chiến binh kiếm ngư mình khoác lam giáp hoàng kim, tay cầm ngọn giáo thủy lưu lao vút như sao băng xé toạc mọi chướng ngại."
            },
            {
                "id": "crystal_urchin",
                "name": "Cầu Gai Tinh Thể Urchin",
                "native": "Astral Crystal Urchin",
                "title": "Lõi Năng Lượng Biển Sâu",
                "symbol": "🔮",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Khối cầu gai huyền bí phát sáng tím ma mị với lõi ngọc tâm linh, điều hòa dòng năng lượng ma pháp ngầm sâu dưới đáy biển."
            },
            {
                "id": "coral_princess",
                "name": "Thánh Nữ San Hô Coralia",
                "native": "Coral Princess Coralia",
                "title": "Nữ Thần Rạn San Hô Đỏ",
                "symbol": "👸",
                "rarity": "legendary",
                "element": "water",
                "desc": "Thánh nữ với mái tóc san hô hồng bồng bềnh đội vương miện ngọc trai, hai tay ôm trân châu đại dương lắng nghe nhịp đập của biển."
            },
            {
                "id": "obelisk_pearl",
                "name": "Bia Đá Quang Ngọc Atlantis",
                "native": "Sacred Pearl Monolith",
                "title": "Cột Phong Ấn Ánh Sáng",
                "symbol": "🪨",
                "rarity": "rare",
                "element": "earth",
                "desc": "Cột đá bia cổ nghìn năm khảm trân châu phát quang dải vàng rực rỡ, điểm tựa kết giới ngăn chặn các cơn đại hồng thủy cổ đại."
            },
            {
                "id": "portal_atlantis",
                "name": "Cổng Cổ Đại Thủy Tề",
                "native": "Ancient Abyssal Gate",
                "title": "Cánh Cổng Thời Không",
                "symbol": "🌀",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Cánh cổng vĩ đại dẫn đến cung điện Atlantis đã chìm sâu dưới đáy biển, mang biểu tượng xoáy nước vĩnh hằng chỉ mở ra cho bậc đế vương."
            }
        ]
    }
]

def process_and_cut_underwater():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/underwater"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(UNDERWATER_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(UNDERWATER_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
        im_cv = cv2.imread(sheet["source"])
        im_pil = Image.open(sheet["source"])

        # Save copy of source sheet
        sheet_dest = os.path.join(output_sheets_dir, f"{sheet['id']}.png")
        im_pil.save(sheet_dest)

        val = np.max(im_cv, axis=2)
        binary = (val > 15).astype(np.uint8) * 255
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary)

        # Group components by nearest grid slot
        slot_components = {i: [] for i in range(9)}
        slot_bboxes = {i: [1024, 1024, 0, 0] for i in range(9)}

        for label_id in range(1, num_labels):
            cx, cy = centroids[label_id]
            dists = [((cx - gx)**2 + (cy - gy)**2) for gx, gy in grid_centers]
            nearest_slot = int(np.argmin(dists))

            slot_components[nearest_slot].append(label_id)
            x = stats[label_id, cv2.CC_STAT_LEFT]
            y = stats[label_id, cv2.CC_STAT_TOP]
            w = stats[label_id, cv2.CC_STAT_WIDTH]
            h = stats[label_id, cv2.CC_STAT_HEIGHT]

            slot_bboxes[nearest_slot][0] = min(slot_bboxes[nearest_slot][0], x)
            slot_bboxes[nearest_slot][1] = min(slot_bboxes[nearest_slot][1], y)
            slot_bboxes[nearest_slot][2] = max(slot_bboxes[nearest_slot][2], x + w)
            slot_bboxes[nearest_slot][3] = max(slot_bboxes[nearest_slot][3], y + h)

        # Process each slot
        for slot_idx in range(9):
            char_meta = sheet["characters"][slot_idx]
            x1, y1, x2, y2 = slot_bboxes[slot_idx]

            # Add gentle padding
            pad = 12
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(1024, x2 + pad)
            y2 = min(1024, y2 + pad)

            # Crop region
            sub_cv = im_cv[y1:y2, x1:x2].astype(np.float32)
            sub_labels = labels[y1:y2, x1:x2]

            # Mask only components belonging to this slot
            valid_labels = set(slot_components[slot_idx])
            in_slot_mask = np.isin(sub_labels, list(valid_labels))

            sub_val = np.max(sub_cv, axis=2)
            alpha = np.zeros_like(sub_val)

            # Smooth anti-aliased alpha threshold ramp
            mask_mid = (sub_val > 4) & (sub_val <= 32) & in_slot_mask
            mask_high = (sub_val > 32) & in_slot_mask
            alpha[mask_mid] = (sub_val[mask_mid] - 4) / 28.0
            alpha[mask_high] = 1.0

            # Un-premultiply BGR by alpha to completely eliminate black halo/fringing
            bgr = sub_cv.copy()
            alpha_safe = np.maximum(alpha, 0.05)[:, :, np.newaxis]
            bgr = np.clip(bgr / alpha_safe, 0, 255)

            # Convert BGR to RGB
            rgb = cv2.cvtColor(bgr.astype(np.uint8), cv2.COLOR_BGR2RGB)
            rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])

            char_img = Image.fromarray(rgba)

            # Square and center the character
            cw, ch = char_img.size
            sq_size = max(cw, ch) + 16
            square_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
            offset_x = (sq_size - cw) // 2
            offset_y = (sq_size - ch) // 2
            square_canvas.paste(char_img, (offset_x, offset_y), char_img)

            # Resize to high-res standard 512x512
            final_img = square_canvas.resize((512, 512), Image.Resampling.LANCZOS)

            char_filename = f"{char_meta['id']}.png"
            dest_path = os.path.join(chapter_chars_dir, char_filename)
            final_img.save(dest_path)

            # Also save to flat dir for backward compatibility
            final_img.save(os.path.join(output_chars_root, char_filename))

            all_cutouts.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['native']}) -> {dest_path}")

    # Generate preview montage of all cutouts (3 rows x 9 columns)
    cols = 9
    rows = len(UNDERWATER_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (8, 20, 36, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_phase1_3_underwater.png")
    montage.save(montage_path)
    
    # Also save to brain artifacts dir for viewing
    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_phase1_3_underwater.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Underwater Kingdom characters (Phases 1-3)! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["thuy-cung", "underwater-kingdom", "atlantis"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("underwater", link_path)
                print(f"✓ Created symlink {link_name} -> underwater")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_underwater()
