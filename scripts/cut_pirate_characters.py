import os
import cv2
import numpy as np
from PIL import Image

PIRATE_SHEET_CONFIGS = [
    {
        "id": "sheet_01_pirate_crew",
        "chapter_dir": "chapter_01_pirate_crew",
        "title": "Băng Hải Tặc Nắng Vàng (Jolly Pirates & Sunny Seas)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791472281429.jpg",
        "characters": [
            {
                "id": "captain_paws",
                "name": "Mèo Thuyền Trưởng Paws",
                "native": "Captain Paws",
                "title": "Thuyền Trưởng Râu Mèo",
                "symbol": "🏴‍☠️",
                "rarity": "legendary",
                "element": "wind",
                "desc": "Thuyền trưởng dũng cảm của băng hải tặc móng vuốt, tinh ranh và luôn tìm ra những hòn đảo kho báu bí ẩn nhất đại dương."
            },
            {
                "id": "pirate_shark",
                "name": "Cá Mập Hải Tặc Tiburon",
                "native": "Tiburon",
                "title": "Kình Ngư Sóng Thần",
                "symbol": "🦈",
                "rarity": "epic",
                "element": "water",
                "desc": "Tay bơi cừ khôi bảo kê mạn thuyền, dù mang danh hải tặc hung hãn nhưng lại cực kỳ khoái được gãi bụng và ăn bánh cá."
            },
            {
                "id": "cannon_crab",
                "name": "Cua Pháo Thủ Kankan",
                "native": "Cannoneer Crab",
                "title": "Xạ Thủ Bất Bại",
                "symbol": "🦀",
                "rarity": "epic",
                "element": "fire",
                "desc": "Chuyên gia hỏa lực tí hon điều khiển cỗ đại bác hải tặc bách phát bách trúng, vỏ giáp đỏ chót cứng hơn cả thép tôi."
            },
            {
                "id": "sailor_tako",
                "name": "Bạch Tuộc Thủy Thủ Tako",
                "native": "Sailor Tako",
                "title": "Bậc Thầy Xúc Tu",
                "symbol": "🐙",
                "rarity": "rare",
                "element": "water",
                "desc": "Thủy thủ đa năng đảm đương mọi việc trên tàu cùng lúc: vừa lái tàu, thả neo, giữ chìa khóa kho và pha nước giải khát thơm ngon."
            },
            {
                "id": "coral_mermaid",
                "name": "Tiên Cá San Hô Nerida",
                "native": "Nerida",
                "title": "Viên Ngọc Biển Xanh",
                "symbol": "🧜‍♀️",
                "rarity": "legendary",
                "element": "water",
                "desc": "Nàng tiên cá xinh đẹp trông coi rạn san hô lấp lánh, tiếng hát ngân nga xua tan giông bão và dẫn lối cho tàu bè lạc hướng."
            },
            {
                "id": "lookout_parrot",
                "name": "Vẹt Tiêu Điểm Pepe",
                "native": "Lookout Pepe",
                "title": "Hoa Tiêu Đỉnh Cột Buồm",
                "symbol": "🦜",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Mắt thần trên đỉnh cột buồm cao vút, chuyên phát hiện tàu buôn lẫn đá ngầm nguy hiểm từ khoảng cách hàng chục hải lý."
            },
            {
                "id": "mimic_chest",
                "name": "Rương Quỷ Mimic",
                "native": "Chester the Mimic",
                "title": "Cạm Bẫy Kho Báu",
                "symbol": "📦",
                "rarity": "epic",
                "element": "earth",
                "desc": "Cái bẫy ranh mãnh ngụy trang thành rương vàng đầy ắp châu báu để đớp gọn những kẻ hám của bước chân vào hang đá."
            },
            {
                "id": "helm_spirit",
                "name": "Linh Hồn Bánh Lái Koko",
                "native": "Helm Spirit",
                "title": "Kim Chỉ Nam Biển Khơi",
                "symbol": "☸️",
                "rarity": "common",
                "element": "water",
                "desc": "Linh hồn trú ngụ trong chiếc bánh lái gỗ cổ thụ, tự động xoay chuyển để con tàu luôn vượt qua sóng to gió lớn bình an."
            },
            {
                "id": "beacon_lantern",
                "name": "Đèn Hải Đăng Ma Thuật",
                "native": "Mystic Beacon",
                "title": "Ngọn Đăng Hồn Biển",
                "symbol": "🏮",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Ngọn đèn thần tích tụ linh khí bão biển, tỏa ánh sáng màu ngọc bích xuyên thủng màn sương mù dày đặc đêm trăng."
            }
        ]
    },
    {
        "id": "sheet_02_cursed_depths",
        "chapter_dir": "chapter_02_cursed_depths",
        "title": "Lời Nguyền Biển Sâu (Cursed Depths & Ghost Fleet)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791472281453.jpg",
        "characters": [
            {
                "id": "ghost_captain",
                "name": "Thuyền Trưởng Ma Davy",
                "native": "Davy Jones' Echo",
                "title": "U Hồn Hải Tặc Vĩ Đại",
                "symbol": "👻",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Chúa tể hạm đội bóng ma lang thang nghìn năm dưới đáy biển, tay cầm ngọn đèn u hồn thu phục mọi linh hồn đắm tàu."
            },
            {
                "id": "skeletal_fish",
                "name": "Cá Xương Ma Skully",
                "native": "Bone Piranha",
                "title": "Cá Ma Đáy Biển",
                "symbol": "🐟",
                "rarity": "common",
                "element": "water",
                "desc": "Hài cốt của loài cá săn mồi cổ xưa được hồi sinh bởi ma thuật biển sâu, bơi lội thoăn thoắt săn đuổi ánh sáng ma trơi."
            },
            {
                "id": "cursed_serpent",
                "name": "Cổ Xà Chìm Leviathan",
                "native": "Sunken Ouroboros",
                "title": "Hộ Pháp Đền Chìm",
                "symbol": "🐍",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Tượng xà thần cổ ngập dưới đáy biển sâu ngàn năm, canh giữ lối vào lăng mộ thất lạc của các vị vua đại dương."
            },
            {
                "id": "haunted_anchor",
                "name": "Mỏ Neo Quỷ Ám Malakor",
                "native": "Cursed Anchor",
                "title": "Sức Nặng Ngàn Cân",
                "symbol": "⚓",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chiếc mỏ neo rèn từ quặng sắt bị nguyền rủa, một khi cắm xuống đáy đại dương sẽ khóa chặt số phận của con tàu mãi mãi."
            },
            {
                "id": "abyssal_siren",
                "name": "Hắc Tiên Cá Syrena",
                "native": "Syrena the Abyssal",
                "title": "Mỹ Nhân Ngư U Tối",
                "symbol": "🧜‍♀️",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Nữ chúa vực thẳm mê hoặc người trần bằng giọng hát u tịch giữa đàn sứa trôi nổi, kéo những kẻ tò mò xuống đáy sâu vĩnh hằng."
            },
            {
                "id": "bone_crab",
                "name": "Cua Sọ Đá Calavera",
                "native": "Skull Reef Crab",
                "title": "Ẩn Sĩ Đầu Lâu",
                "symbol": "🦀",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Loài cua kỳ bí dùng hộp sọ của những chiến binh hải tặc xưa làm vỏ ốc ngụy trang, hai chiếc càng kẹp gãy cả đá ngầm."
            },
            {
                "id": "trident_obelisk",
                "name": "Trụ Ma Hải Vương Poseidon",
                "native": "Abyssal Monolith",
                "title": "Cột Trụ Phong Ấn",
                "symbol": "🔱",
                "rarity": "rare",
                "element": "water",
                "desc": "Cột bia đá thiêng cắm chiếc đinh ba vương quyền dưới lòng đại dương, nguồn gốc tạo nên những xoáy nước nuốt chửng vạn dặm."
            },
            {
                "id": "shipwreck_golem",
                "name": "Golem Xác Tàu Dread",
                "native": "Dreadnought Golem",
                "title": "Hộ Vệ Mảnh Ván Đắm",
                "symbol": "🪵",
                "rarity": "epic",
                "element": "earth",
                "desc": "Tập hợp từ xác của hàng trăm con tàu đắm dưới đáy vực, người khổng lồ gỗ lê bước canh giữ kho báu mà không ai dám chạm vào."
            },
            {
                "id": "cursed_kraken",
                "name": "Bạch Tuộc Bạo Chúa Kraken",
                "native": "Lord Kraken",
                "title": "Hung Thần Vực Biển Sâu",
                "symbol": "🦑",
                "rarity": "legendary",
                "element": "water",
                "desc": "Chúa tể vực thẳm trong truyền thuyết hải tặc, chỉ một cái vung xúc tu khổng lồ đủ sức bẻ gãy kỳ hạm hùng mạnh nhất thành từng mảnh vụn."
            }
        ]
    }
]

def process_and_cut_pirate():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/pirate"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(PIRATE_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(PIRATE_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(PIRATE_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (10, 20, 28, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_pirate.png")
    montage.save(montage_path)
    
    # Also save to brain artifacts dir for viewing
    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_pirate.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Pirate characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["hai-tac", "pirate-ocean", "ocean"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("pirate", link_path)
                print(f"✓ Created symlink {link_name} -> pirate")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_pirate()
