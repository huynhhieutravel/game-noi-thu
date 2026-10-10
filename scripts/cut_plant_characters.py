import os
import cv2
import numpy as np
from PIL import Image

PLANT_SHEET_CONFIGS = [
    {
        "id": "sheet_01_blossom_garden",
        "chapter_dir": "chapter_01_blossom_garden",
        "title": "Khu Vườn Hoa Thơm & Trái Ngọt (Blossom Garden & Orchard)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791503164601.jpg",
        "characters": [
            {
                "id": "sunflower_sunny",
                "name": "Hướng Dương Rực Rỡ Sunny",
                "native": "Sunflower Sunny",
                "title": "Mặt Trời Nhí Của Khu Vườn",
                "symbol": "🌻",
                "rarity": "rare",
                "element": "fire",
                "desc": "Bông hoa hướng dương rạng rỡ với những cánh hoa vàng óng và nụ cười ấm áp, luôn hướng về phía ánh sáng mặt trời mang lại niềm vui cho muôn loài."
            },
            {
                "id": "rose_velvet_rosie",
                "name": "Hoa Hồng Nhung Đỏ Rosie",
                "native": "Red Rose Rosie",
                "title": "Nữ Hoàng Các Loài Hoa",
                "symbol": "🌹",
                "rarity": "rare",
                "element": "fire",
                "desc": "Bông hoa hồng đỏ nhung kiêu sa với những cánh hoa xếp lớp mềm mại, đôi mắt long lanh dịu dàng và chiếc thân gai nhọn kiên cường bảo vệ vẻ đẹp thuần khiết."
            },
            {
                "id": "tulip_spring_tula",
                "name": "Hoa Tulip Mùa Xuân Tula",
                "native": "Pink Tulip Tula",
                "title": "Sứ Giả Mùa Xuân",
                "symbol": "🌷",
                "rarity": "uncommon",
                "element": "water",
                "desc": "Búp hoa tulip hồng phấn e ấp vươn mình trong làn gió xuân mát lành, đôi lá xanh mướt ôm ấp nụ cười ngọt ngào báo hiệu mùa lễ hội trăm hoa đua nở."
            },
            {
                "id": "daisy_blooming_daisy",
                "name": "Cúc Họa Mi Trong Sáng Daisy",
                "native": "White Daisy Daisy",
                "title": "Nắng Sớm Tinh Khôi",
                "symbol": "🌼",
                "rarity": "common",
                "element": "wind",
                "desc": "Bông cúc họa mi trắng muốt với nhụy hoa vàng rực rỡ và nụ cười ngây thơ, đung đưa hồn nhiên đón những giọt sương mai đầu ngày."
            },
            {
                "id": "lavender_scent_lila",
                "name": "Oải Hương Ngát Mùi Lila",
                "native": "Lavender Lila",
                "title": "Giấc Mộng Tím Thảo Mộc",
                "symbol": "🪻",
                "rarity": "uncommon",
                "element": "spirit",
                "desc": "Cành hoa oải hương tím biếc nháy mắt tinh nghịch, tỏa ra hương thơm dịu nhẹ xua tan mệt mỏi và ru muôn loài vào giấc ngủ bình yên."
            },
            {
                "id": "cactus_bloom_spiky",
                "name": "Xương Rồng Gai Sao Spiky",
                "native": "Star Cactus Spiky",
                "title": "Chiến Binh Sa Mạc Nở Hoa",
                "symbol": "🌵",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú xương rồng tròn xoe phủ đầy gai vàng lấp lánh như những vì sao, trên đỉnh đầu kiêu hãnh nở một đóa hoa hồng thắm ngát hương giữa nắng gió sa mạc."
            },
            {
                "id": "strawberry_sweet_berry",
                "name": "Dâu Tây Đỏ Mọng Berry",
                "native": "Strawberry Berry",
                "title": "Trái Ngọt Đầu Mùa",
                "symbol": "🍓",
                "rarity": "rare",
                "element": "earth",
                "desc": "Quả dâu tây đỏ mọng căng tràn sức sống nép mình dưới tán lá xanh và những bông hoa trắng tinh khôi, mang vị ngọt thanh mát làm say đắm lòng người."
            },
            {
                "id": "flower_pot_potti",
                "name": "Chậu Cây Vui Vẻ Potti",
                "native": "Happy Pot Potti",
                "title": "Ngôi Nhà Của Ngàn Hoa",
                "symbol": "🪴",
                "rarity": "epic",
                "element": "earth",
                "desc": "Chiếc chậu gốm đất nung mặt cười ửng hồng nuôi dưỡng cả một vườn hoa tím hồng rực rỡ cùng những tai nấm đốm đỏ đáng yêu và dây thường xuân xanh mướt."
            },
            {
                "id": "ancient_vine_pillar",
                "name": "Trụ Cây Cổ Thụ Dây Leo Silvan",
                "native": "Ancient Vine Pillar Silvan",
                "title": "Lõi Rừng Nguyên Sinh",
                "symbol": "🪵",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Thân gỗ cổ thụ ngàn năm khắc hoa văn xoắn ốc cổ xưa, được bao bọc bởi dây leo thường xuân xanh biếc tràn đầy linh khí đất trời (Mascot Bảo Vệ)."
            }
        ]
    },
    {
        "id": "sheet_02_mystic_flora",
        "chapter_dir": "chapter_02_mystic_flora",
        "title": "Kỳ Hoa Dị Thảo & Thần Rừng (Mystic Flora & Forest Spirits)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791503164629.jpg",
        "characters": [
            {
                "id": "carnivorous_flytrap_chomper",
                "name": "Cây Bắt Mồi Răng Nhọn Chomper",
                "native": "Flytrap Chomper",
                "title": "Kẻ Săn Mồi Xanh Rừng Rậm",
                "symbol": "🪴",
                "rarity": "rare",
                "element": "fire",
                "desc": "Cây bắt mồi nắp gập xanh biếc với hàm răng gai nhọn trắng muốt và vòm miệng đỏ rực, luôn há to tinh nghịch sẵn sàng đớp gọn những hạt phấn hoa."
            },
            {
                "id": "sacred_lotus_padma",
                "name": "Hoa Sen Thanh Tịnh Padma",
                "native": "Sacred Lotus Padma",
                "title": "Búp Sen Ngọc Tịnh Thủy",
                "symbol": "🪷",
                "rarity": "epic",
                "element": "water",
                "desc": "Bông sen hồng bồng bềnh trên lá biếc long lanh giọt sương, đính giọt ngọc thanh khiết trên trán tỏa ra năng lượng an lành gột rửa tâm hồn."
            },
            {
                "id": "orchid_fairy_flora",
                "name": "Tiên Hoa Phong Lan Flora",
                "native": "Orchid Fairy Flora",
                "title": "Nữ Pháp Sư Hương Hoa",
                "symbol": "🪻",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Nàng tiên phong lan cánh tím quý phái đội vương miện vàng, tay cầm quyền trượng ngọc tỏa ánh sáng ma thuật điều khiển sự đâm chồi nảy lộc của muôn loài hoa."
            },
            {
                "id": "bonsai_master_senpai",
                "name": "Cây Bonsai Cổ Thụ Senpai",
                "native": "Bonsai Master Senpai",
                "title": "Bậc Thầy Trầm Mặc Thiền Định",
                "symbol": "🪴",
                "rarity": "epic",
                "element": "earth",
                "desc": "Cây bonsai cổ thụ ngàn năm uốn lượn phong trần trong chậu gốm hoa văn mây vàng, đôi mắt hiền từ chứa đựng triết lý bất biến của thời gian."
            },
            {
                "id": "pumpkin_patch_jack",
                "name": "Bí Ngô Mặt Cười Lém Lỉnh Jack",
                "native": "Pumpkin Jack",
                "title": "Lãnh Chúa Mùa Thu Hoạch",
                "symbol": "🎃",
                "rarity": "rare",
                "element": "earth",
                "desc": "Quả bí ngô vàng cam béo múp với nụ cười răng khểnh lém lỉnh, quấn quanh bởi những cuống lá xoăn tít báo hiệu mùa thu hoạch bội thu và ấm no."
            },
            {
                "id": "hydrangea_cloud_mimi",
                "name": "Cẩm Tú Cầu Lam Tím Mimi",
                "native": "Hydrangea Mimi",
                "title": "Cầu Vồng Mưa Đầu Hạ",
                "symbol": "🫐",
                "rarity": "rare",
                "element": "water",
                "desc": "Bụi cẩm tú cầu tròn xoe kết hợp hàng trăm cánh hoa xanh lam tím biếc như một đám mây hoa ngọt ngào, lấp lánh những giọt mưa đầu hạ trong trẻo."
            },
            {
                "id": "bamboo_shoot_take",
                "name": "Búp Măng Non Trúc Xanh Take",
                "native": "Bamboo Shoot Take",
                "title": "Mầm Xanh Bất Khuất",
                "symbol": "🎋",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Búp măng non vàng óng nháy mắt tinh nghịch ôm chặt thân trúc xanh mướt, tượng trưng cho sức sống dẻo dai vươn lên mạnh mẽ qua sương gió."
            },
            {
                "id": "autumn_oak_yggdrasil",
                "name": "Thần Cây Đại Thụ Mùa Thu Yggdy",
                "native": "Autumn Tree Spirit Yggdy",
                "title": "Linh Hồn Rừng Vàng Bất Diệt",
                "symbol": "🌳",
                "rarity": "epic",
                "element": "earth",
                "desc": "Đại thụ cổ thụ khoác áo choàng lá vàng rực rỡ, hai tay dang rộng nâng niu những đốm sáng đom đóm thần tiên, chở che cho muôn vàn sinh vật rừng sâu."
            },
            {
                "id": "celestial_flame_lotus",
                "name": "Hỏa Liên Thần Thoại Pyra",
                "native": "Celestial Flame Lotus Pyra",
                "title": "Trái Tim Lửa Của Đất Mẹ",
                "symbol": "🪷",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Đóa hỏa liên thần thoại rực rỡ bung nở từ lòng đất mẹ, nhụy sen là khối tinh thể hoàng kim phát quang thiêng liêng nắm giữ ngọn lửa nguyên sơ của sự sống."
            }
        ]
    }
]

def process_and_cut_plant():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/plant"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(PLANT_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(PLANT_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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

            # Gentle padding
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

            # Un-premultiply BGR by alpha to eliminate black halo/fringing
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

            # Save to flat dir as well
            final_img.save(os.path.join(output_chars_root, char_filename))

            all_cutouts.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['native']}) -> {dest_path}")

    # Generate preview montage of all cutouts (2 rows x 9 columns)
    cols = 9
    rows = len(PLANT_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (18, 22, 18, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_plant.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_plant.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Plant Kingdom characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["plants", "flora", "thuc-vat", "hoa-la"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("plant", link_path)
                print(f"✓ Created symlink {link_name} -> plant")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_plant()
