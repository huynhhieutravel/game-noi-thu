import os
import cv2
import numpy as np
from PIL import Image

FANTASY_SHEET_CONFIGS = [
    {
        "id": "sheet_01_heroes_party",
        "chapter_dir": "chapter_01_heroes_party",
        "title": "Hiệp Sĩ & Pháp Sư Hoàng Gia (Royal Adventurers Party)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791474508187.jpg",
        "characters": [
            {
                "id": "human_knight",
                "name": "Hiệp Sĩ Hoàng Gia Arthur",
                "native": "Royal Knight Arthur",
                "title": "Dũng Sĩ Kiếm Sư Tử",
                "symbol": "⚔️",
                "rarity": "rare",
                "element": "light",
                "desc": "Chiến binh trẻ quả cảm trong bộ giáp bạc viền vàng, tay cầm thanh thánh kiếm và khiên xanh mang huy hiệu sư tử hoàng gia anh dũng."
            },
            {
                "id": "fire_sorceress",
                "name": "Nữ Pháp Sư Hỏa Long Pyra",
                "native": "Fire Sorceress Pyra",
                "title": "Bậc Thầy Hỏa Thuật",
                "symbol": "🔥",
                "rarity": "epic",
                "element": "fire",
                "desc": "Nữ phù thủy tóc đỏ đội mũ chóp nhọn quyền năng, nắm giữ quyền trượng bảo thạch đỏ và điều khiển ngọn lửa thần rực cháy."
            },
            {
                "id": "elf_ranger",
                "name": "Xạ Thủ Tinh Linh Sylvan",
                "native": "Elf Ranger Sylvan",
                "title": "Cung Thủ Rừng Thiêng",
                "symbol": "🏹",
                "rarity": "rare",
                "element": "wood",
                "desc": "Thiếu nữ tinh linh tóc vàng khoác áo choàng lá xanh bí ẩn, giương cung tên mũi tên lá ma pháp thiện xạ bách phát bách trúng."
            },
            {
                "id": "dwarf_blacksmith",
                "name": "Thần Rèn Người Lùn Brom",
                "native": "Dwarf Blacksmith Brom",
                "title": "Thợ Rèn Thần Binh",
                "symbol": "🔨",
                "rarity": "rare",
                "element": "fire",
                "desc": "Chiến binh người lùn cơ bắp với bộ râu đỏ rực, vung cây búa rèn lửa trác tuyệt tôi luyện nên những vũ khí huyền thoại trên đe sắt."
            },
            {
                "id": "high_elf_priestess",
                "name": "Thánh Nữ Tinh Linh Elaria",
                "native": "High Elf Priestess Elaria",
                "title": "Linh Mục Ánh Sáng Thảo Mộc",
                "symbol": "✨",
                "rarity": "epic",
                "element": "light",
                "desc": "Thánh nữ thánh thiện tóc vàng kim cài hoa trắng, tay nâng quyền trượng ngọc tỏa luồng sinh khí hồi phục xua tan mọi tà niệm."
            },
            {
                "id": "pixie_fairy",
                "name": "Tiểu Hoa Tiên Flora",
                "native": "Pixie Fairy Flora",
                "title": "Tinh Linh Bụi Phép Tinh Tú",
                "symbol": "🧚‍♀️",
                "rarity": "common",
                "element": "wood",
                "desc": "Nàng tiên nhí tóc hồng đôi cánh bướm trong suốt, vẫy đũa phép ngôi sao vàng rải bụi ma thuật lấp lánh đem lại niềm vui và may mắn."
            },
            {
                "id": "baby_blue_dragon",
                "name": "Tiểu Lam Long Sapphire",
                "native": "Baby Blue Dragon",
                "title": "Rồng Lam Lửa Xanh Tí Hon",
                "symbol": "🐉",
                "rarity": "rare",
                "element": "water",
                "desc": "Bé rồng vảy xanh sapphire có cặp sừng vàng ngộ nghĩnh, dù còn nhỏ nhưng đã biết thở ra những quả cầu lửa ấm áp bảo vệ đồng đội."
            },
            {
                "id": "angelic_mimic_chest",
                "name": "Rương Báu Cánh Tiên Aurelia",
                "native": "Angelic Winged Chest",
                "title": "Hòm Kho Báu Ban Phúc",
                "symbol": "💎",
                "rarity": "epic",
                "element": "light",
                "desc": "Hòm kho báu vàng ròng sở hữu đôi cánh thiên thần trắng muốt, cười rạng rỡ và ban tặng vô vàn bảo ngọc lục lam lấp lánh cho người xứng đáng."
            },
            {
                "id": "arcane_crystal_crest",
                "name": "Ấn Ký Khiên Pha Lê Hoàng Cung",
                "native": "Arcane Crystal Aegis Crest",
                "title": "Bảo Vật Phong Ấn Tinh Thể",
                "symbol": "🛡️",
                "rarity": "legendary",
                "element": "water",
                "desc": "Huy hiệu khiên thần nạm đại pha lê lam ngọc phát quang, bao bọc bởi luồng hào quang xoáy ma trận phòng thủ tối thượng của vương triều."
            }
        ]
    },
    {
        "id": "sheet_02_mythic_crusade",
        "chapter_dir": "chapter_02_mythic_crusade",
        "title": "Huyền Thoại Viễn Chinh & Thần Thú (Mythic Crusade & Beasts)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791474508165.jpg",
        "characters": [
            {
                "id": "lion_paladin",
                "name": "Hiệp Sĩ Sư Tử Leon",
                "native": "Lion Paladin Leon",
                "title": "Hộ Vệ Thánh Quang Sư Tử",
                "symbol": "🦁",
                "rarity": "legendary",
                "element": "light",
                "desc": "Dũng sĩ tộc sư tử bờm vàng khoác thánh giáp hoàng kim viền lam, tay cầm cự kiếm và đại khiên ngôi sao chói lọi dẫn dắt toàn quân viễn chinh."
            },
            {
                "id": "frost_sorceress",
                "name": "Băng Tuyết Pháp Sư Lumina",
                "native": "Frost Sorceress Lumina",
                "title": "Nữ Hoàng Băng Giá Vĩnh Hằng",
                "symbol": "❄️",
                "rarity": "epic",
                "element": "water",
                "desc": "Nữ pháp sư tóc bạc đội vương miện băng tinh khiết, điều khiển ngàn mảnh băng pha lê xoay quanh quyền trượng tạo nên bão tuyết tuyệt mỹ."
            },
            {
                "id": "raven_shadow_rogue",
                "name": "Xạ Thủ Quạ Đen Shadowfeather",
                "native": "Raven Rogue Shadowfeather",
                "title": "Thợ Săn Bóng Đêm Thần Tốc",
                "symbol": "🦅",
                "rarity": "rare",
                "element": "dark",
                "desc": "Chiến binh quạ đen tinh nhuệ mang áo choàng đỏ rực, sở hữu đôi mắt thần và cây nỏ sắt bắn ra những mũi tên bóng đêm bách phát bách trúng."
            },
            {
                "id": "gnome_alchemist",
                "name": "Nhà Giả Kim Gnome Barnaby",
                "native": "Gnome Alchemist Barnaby",
                "title": "Bậc Thầy Độc Dược & Cơ Khí",
                "symbol": "🧪",
                "rarity": "rare",
                "element": "earth",
                "desc": "Học giả tí hon râu bạc đội mũ phù thủy gắn bánh răng cơ giới, tay cầm bình dược liệu xanh phát sáng sẵn sàng tạo ra các công thức ma thuật kỳ bí."
            },
            {
                "id": "dryad_forest_nymph",
                "name": "Nữ Thần Rừng Dryad Lyra",
                "native": "Dryad Forest Nymph",
                "title": "Linh Hồn Rừng Đại Ngàn",
                "symbol": "🍃",
                "rarity": "epic",
                "element": "wood",
                "desc": "Nàng tiên cây mái tóc lá xanh biếc điểm xuyết hoa xuân, đôi sừng hươu nhánh gỗ nâng niu ngọc quả sinh mệnh đại diện cho sự tái sinh của rừng già."
            },
            {
                "id": "rainbow_pegasus",
                "name": "Thiên Mã Cầu Vồng Celestia",
                "native": "Rainbow Pegasus Celestia",
                "title": "Thần Mã Cánh Tiên Bảy Sắc",
                "symbol": "🦄",
                "rarity": "legendary",
                "element": "light",
                "desc": "Ngựa thần có sừng kỳ lân hoàng kim và đôi cánh thiên sứ bảy sắc cầu vồng, sải cánh lướt qua dải mây bay mang phúc lành cho nhân gian."
            },
            {
                "id": "golden_gryphon",
                "name": "Điểu Sư Hoàng Kim Gryphon",
                "native": "Chibi Golden Gryphon",
                "title": "Chúa Tể Không Trung Nhí",
                "symbol": "🦅",
                "rarity": "rare",
                "element": "wind",
                "desc": "Sinh vật huyền bí nửa đại bàng nửa sư tử với bộ lông vàng rực rỡ, đeo ngọc lam hoàng gia và vuốt sắc uy phong dũng mãnh."
            },
            {
                "id": "crystal_shield_golem",
                "name": "Người Đá Khiên Pha Lê Runic",
                "native": "Runic Crystal Golem",
                "title": "Cự Thạch Hộ Pháp Rêu Phong",
                "symbol": "🗿",
                "rarity": "epic",
                "element": "earth",
                "desc": "Người khổng lồ đá hoa cương cổ đại mọc đầy tinh thể lam ngọc, tay cầm chiếc khiên khắc ấn ký rune phát sáng không kẻ thù nào xuyên phá được."
            },
            {
                "id": "astral_dragon_aegis",
                "name": "Hắc Long Ma Trận Bahamut",
                "native": "Astral Aegis Dragon",
                "title": "Long Vương Phong Ấn Kết Giới",
                "symbol": "🐲",
                "rarity": "legendary",
                "element": "dark",
                "desc": "Rồng đen hoàng gia đội vương miện hồng ngọc, ngự giữa pháp trận khiên năng lượng lục giác hoàng kim hộ thể bất khả xâm phạm."
            }
        ]
    }
]

def process_and_cut_fantasy():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/fantasy"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(FANTASY_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(FANTASY_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(FANTASY_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (20, 18, 32, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_fantasy.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_fantasy.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Classic Fantasy characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["classic-fantasy", "huyen-ao", "fantasy-world"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("fantasy", link_path)
                print(f"✓ Created symlink {link_name} -> fantasy")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_fantasy()
