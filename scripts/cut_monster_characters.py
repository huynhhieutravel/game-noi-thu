import os
import cv2
import numpy as np
from PIL import Image

MONSTER_SHEET_CONFIGS = [
    {
        "id": "sheet_01_cute_dungeon",
        "chapter_dir": "chapter_01_cute_dungeon",
        "title": "Hầm Ngục Tí Hon (Playful Dungeon Crawlers)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791474017787.jpg",
        "characters": [
            {
                "id": "slime_jelly",
                "name": "Bé Slime Xanh SuSu",
                "native": "Jelly Slime",
                "title": "Giọt Thạch Tinh Nghịch",
                "symbol": "🟢",
                "rarity": "common",
                "element": "water",
                "desc": "Khối thạch chất dẻo xanh trong suốt nuốt đồng xu vàng lấp lánh, nảy tưng tưng khắp hành lang hầm ngục chào đón mạo hiểm giả."
            },
            {
                "id": "mimic_cheesy",
                "name": "Rương Gỗ Mimic Lè Lưỡi",
                "native": "Cheesy Mimic",
                "title": "Cạm Bẫy Đáng Yêu",
                "symbol": "📦",
                "rarity": "epic",
                "element": "earth",
                "desc": "Chiếc rương kho báu gỗ nẹp vàng lè chiếc lưỡi đỏ tinh nghịch, xung quanh rơi vãi đầy tiền vàng và bảo ngọc ruby quyến rũ."
            },
            {
                "id": "goblin_thief",
                "name": "Yêu Tinh Mũ Đỏ Gobby",
                "native": "Goblin Gobby",
                "title": "Kẻ Gom Vàng Nhanh Chân",
                "symbol": "👺",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú goblin da xanh đội mũ trùm đỏ vác bao tiền vàng nặng trĩu, tay cầm chìa khóa hầm bí mật chạy trốn cực kỳ thoăn thoắt."
            },
            {
                "id": "shroom_mage",
                "name": "Pháp Sư Nấm Lùn Shroomy",
                "native": "Mushroom Mage",
                "title": "Phù Thủy Bào Tử Tím",
                "symbol": "🍄",
                "rarity": "rare",
                "element": "earth",
                "desc": "Bé nấm mũ đỏ chấm trắng khoác áo choàng phù thủy, tay cầm quyền trượng pha lê tím phóng ra những quả cầu bào tử ma thuật."
            },
            {
                "id": "baby_red_dragon",
                "name": "Tiểu Hỏa Long Ignis",
                "native": "Baby Red Dragon",
                "title": "Rồng Lửa Nhí Đáng Yêu",
                "symbol": "🐉",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Bé rồng vảy đỏ có đôi cánh vàng tí hon, thích thổi ra những đóa hoa lửa nhỏ xíu sưởi ấm cho các bạn trong hầm đá lạnh."
            },
            {
                "id": "chibi_cyclops",
                "name": "Khổng Lồ Một Mắt Cyco",
                "native": "Cyclops Cyco",
                "title": "Cự Nhân Một Mắt Tí Hon",
                "symbol": "👁️",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú cự nhân da xanh dương có chiếc sừng nhỏ và độc nhãn to tròn ngơ ngác, tay vác chùy gỗ đinh nhọn bảo vệ lối vào hang đá."
            },
            {
                "id": "skeleton_skelly",
                "name": "Hiệp Sĩ Xương Skelly",
                "native": "Skelly Knight",
                "title": "Chiến Binh Bộ Xương Nhí",
                "symbol": "💀",
                "rarity": "uncommon",
                "element": "spirit",
                "desc": "Bộ xương tí hon đội mũ giáp sắt nứt nẻ, tay cầm thanh gươm chìa khóa vàng và khiên gỗ dũng cảm xông pha trận mạc."
            },
            {
                "id": "potion_spirit",
                "name": "Linh Hồn Bình Thuốc Poti",
                "native": "Living Potion Spirit",
                "title": "Dược Thủy Ma Lực",
                "symbol": "🧪",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Bình thủy tinh chứa độc dược ma thuật màu tím hồng nở nụ cười rạng rỡ, bọt khí ma thuật sủi lách tách tràn ngập năng lượng hồi phục."
            },
            {
                "id": "dungeon_gatekeeper",
                "name": "Thần Cửa Hầm Ngục Dori",
                "native": "Living Dungeon Gate",
                "title": "Người Gác Cổng Vui Vẻ",
                "symbol": "🚪",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Cánh cổng vòm đá gỗ cổ thụ nẹp vàng có đôi mắt biết cười và ổ khóa thần, bảo vệ kho báu kim cương châu báu chất cao như núi."
            }
        ]
    },
    {
        "id": "sheet_02_abyssal_dungeon",
        "chapter_dir": "chapter_02_abyssal_dungeon",
        "title": "Thâm Uyên & Bảo Vật Hắc Ám (Abyssal Depths & Cursed Relics)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791474017819.jpg",
        "characters": [
            {
                "id": "beholder_oculus",
                "name": "Vạn Nhãn Quỷ Oculus",
                "native": "All-Seeing Beholder",
                "title": "Chúa Tể Tia Chớp Ma Nhãn",
                "symbol": "👁️",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Nhãn ma tối thượng lơ lửng giữa làn khói tím hư không, mắt chính nhìn thấu vạn vật và các xúc tu mắt phụ phóng tia phân rã ma thuật."
            },
            {
                "id": "ogre_warlord",
                "name": "Chiến Tướng Khổng Lồ Ogre",
                "native": "Iron Ogre Warlord",
                "title": "Thiết Giáp Cự Địch",
                "symbol": "👹",
                "rarity": "epic",
                "element": "earth",
                "desc": "Quái tướng da xanh mang giáp vai gắn gai nhọn, quấn xích sắt chìa khóa vàng và vung chùy gai sắt quét sạch mọi kẻ đột nhập."
            },
            {
                "id": "crystal_shadow_bat",
                "name": "Dơi Pha Lê Thạch Anh Batty",
                "native": "Crystal Shadow Bat",
                "title": "Dạ Yến Tinh Thể",
                "symbol": "🦇",
                "rarity": "epic",
                "element": "wind",
                "desc": "Dơi bóng đêm sở hữu đôi cánh dệt từ các mảnh pha lê thạch anh tím xanh sắc lẹm, bay lượn vun vút phóng ra các phiến đá ma thuật."
            },
            {
                "id": "dark_knight_valkor",
                "name": "Hắc Kỵ Sĩ Hư Không Valkor",
                "native": "Void Dark Knight",
                "title": "Kỵ Sĩ Linh Hồn Bóng Đêm",
                "symbol": "🛡️",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Hiệp sĩ trong bộ giáp sắt cổ cháy rực ngọn lửa tím u linh, thanh hắc kiếm và tấm khiên phong ấn linh hồn bất khả chiến bại."
            },
            {
                "id": "moss_gargoyle",
                "name": "Quỷ Đá Rêu Phong Gargoyle",
                "native": "Ancient Gargoyle",
                "title": "Thần Hộ Mệnh Đền Đá",
                "symbol": "🗿",
                "rarity": "epic",
                "element": "earth",
                "desc": "Tượng đá có cánh phủ rêu xanh ngàn năm khắc ấn ký phát quang lam ngọc, hóa thân thành quái thú uy phong bảo vệ thánh đường cổ."
            },
            {
                "id": "golden_treasure_worm",
                "name": "Hoàng Kim Thần Trùng Goldy",
                "native": "Gold Devourer Wyrm",
                "title": "Sâu Vàng Nuốt Châu Báu",
                "symbol": "🐛",
                "rarity": "epic",
                "element": "earth",
                "desc": "Sâu đất khổng lồ đội vương miện hoàng gia nuốt vàng ròng và đá quý đầy mình, lớp vảy phát quang óng ánh giữa lòng đất sâu."
            },
            {
                "id": "cursed_grimoire",
                "name": "Ma Thư Răng Quỷ Grimoire",
                "native": "Awakened Grimoire",
                "title": "Cấm Sách Hắc Ám",
                "symbol": "📖",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Cuốn sách ma pháp cấm bọc bìa da rồng nhe hàm răng nhọn hoắt và thè lưỡi quỷ tím, bay lượn cùng những lá bùa phong ấn cổ xưa."
            },
            {
                "id": "gold_coin_golem",
                "name": "Người Đá Tiền Vàng Midas",
                "native": "Gold Coin Golem",
                "title": "Khổng Lồ Tiền Vàng Triệu Đô",
                "symbol": "🪙",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Người khổng lồ đúc từ hàng vạn đồng tiền vàng cổ xưa nạm hồng ngọc và ngọc bích, đôi mắt rực lửa canh giữ kho tàng đế vương."
            },
            {
                "id": "cursed_chained_chest",
                "name": "Rương Quỷ Xích Sắt Abaddon",
                "native": "Chained Abyssal Mimic",
                "title": "Ngục Tối Phong Ấn Quỷ Dữ",
                "symbol": "⛓️",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Rương báu cổ bị trói chặt bởi dây xích sắt thiêng, bên trong bốc cháy ngọn lửa hắc ám đỏ thẫm và hàm răng quỷ chực nuốt chửng kẻ tham lam."
            }
        ]
    }
]

def process_and_cut_monster():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/monster"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(MONSTER_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(MONSTER_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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

    # Generate preview montage of all cutouts (2 rows x 9 columns)
    cols = 9
    rows = len(MONSTER_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (22, 14, 28, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_monster.png")
    montage.save(montage_path)

    # Also save to brain artifacts dir for viewing
    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_monster.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Cute Monsters characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["quai-vat", "cute-monsters", "monsters"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("monster", link_path)
                print(f"✓ Created symlink {link_name} -> monster")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_monster()
