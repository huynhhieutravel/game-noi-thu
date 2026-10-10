import os
import cv2
import numpy as np
from PIL import Image

SPACE_SHEET_CONFIGS = [
    {
        "id": "sheet_01_space_explorers",
        "chapter_dir": "chapter_01_space_explorers",
        "title": "Thám Hiểm Trạm Vũ Trụ (Cosmic Explorers & Space Station)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791475028567.jpg",
        "characters": [
            {
                "id": "alien_zog",
                "name": "Bé Alien Xanh Zog",
                "native": "Little Alien Zog",
                "title": "Người Ngoài Hành Tinh Tinh Nghịch",
                "symbol": "👽",
                "rarity": "rare",
                "element": "wind",
                "desc": "Người ngoài hành tinh da xanh lá có 2 anten phát sáng, mặc phi hành phục trắng cầm máy quét radar tìm kiếm bạn mới trong vũ trụ."
            },
            {
                "id": "chibi_astronaut",
                "name": "Phi Hành Gia Nhí Leo",
                "native": "Chibi Astronaut Leo",
                "title": "Nhà Du Hành Không Trọng Lực",
                "symbol": "👨‍🚀",
                "rarity": "rare",
                "element": "light",
                "desc": "Cậu bé thám hiểm vũ trụ mắt to tròn cười rạng rỡ, trôi bồng bềnh giữa không gian cùng chiếc cờ lê và bu lông lơ lửng."
            },
            {
                "id": "space_drone_bot",
                "name": "Robot Thám Hiểm Sparky",
                "native": "Cosmic Drone Sparky",
                "title": "Thiết Bị Dò Quặng Không Gian",
                "symbol": "🤖",
                "rarity": "common",
                "element": "water",
                "desc": "Drone hình cầu trắng vàng 2 tai anten vẫy vui vẻ, gương mặt LED xanh lam rạng ngời và luồng phản lực photon linh hoạt."
            },
            {
                "id": "baby_star_meteor",
                "name": "Tiểu Sao Băng Stella",
                "native": "Rainbow Comet Stella",
                "title": "Thiên Thạch Lửa Cầu Vồng",
                "symbol": "☄️",
                "rarity": "epic",
                "element": "fire",
                "desc": "Ngôi sao vàng chibi tròn xoe lướt qua dải ngân hà với chiếc đuôi sao băng lửa cầu vồng tím hồng rực rỡ ấm áp."
            },
            {
                "id": "moon_bunny_rover",
                "name": "Thỏ Ngọc Cung Trăng Luna",
                "native": "Moon Bunny Astronaut",
                "title": "Đại Sứ Hòa Bình Mặt Trăng",
                "symbol": "🐰",
                "rarity": "epic",
                "element": "light",
                "desc": "Bé thỏ trắng tai dài trong bộ phi hành phục ôm viên đá mặt trăng, tay cắm lá cờ ngôi sao hồng đánh dấu phát hiện vĩ đại."
            },
            {
                "id": "cosmic_jellyfish",
                "name": "Sứa Tinh Vân Phát Quang Jelly",
                "native": "Nebula Space Jellyfish",
                "title": "Sinh Vật Biển Ngân Hà",
                "symbol": "🪼",
                "rarity": "rare",
                "element": "water",
                "desc": "Sứa vũ trụ trong suốt phát quang sắc màu tinh vân tím hồng, đính những ngôi sao vàng lấp lánh trên vòm dù trôi dạt giữa các vì sao."
            },
            {
                "id": "satellite_bot",
                "name": "Vệ Tinh Tai Thỏ Cosmo",
                "native": "Bunny Satellite Cosmo",
                "title": "Trạm Phát Sóng Liên Hành Tinh",
                "symbol": "🛰️",
                "rarity": "uncommon",
                "element": "water",
                "desc": "Vệ tinh hình cầu với hai cánh pin mặt trời xanh biếc và đôi anten tai thỏ, luôn truyền tín hiệu âm nhạc vui nhộn khắp dải ngân hà."
            },
            {
                "id": "chibi_rocket",
                "name": "Tên Lửa Thần Tốc Astro",
                "native": "Astro Rocket Ship",
                "title": "Phi Thuyền Du Hành Vũ Trụ",
                "symbol": "🚀",
                "rarity": "rare",
                "element": "fire",
                "desc": "Con tàu tên lửa thân trắng mũi đỏ với cửa sổ phi công nháy mắt lém lỉnh, động cơ phản lực phun chùm sao vàng bay vượt tốc độ ánh sáng."
            },
            {
                "id": "orbit_gyro_planet",
                "name": "Hành Tinh Con Quay Quỹ Đạo Gyro",
                "native": "Orbital Gyro Planet",
                "title": "Cầu Thiên Thể Vòng Đai Vàng",
                "symbol": "🪐",
                "rarity": "legendary",
                "element": "light",
                "desc": "Tiểu hành tinh chứa đựng cả một bầu trời sao tím kỳ ảo, được bao bọc bởi 3 vòng đai hoàng kim xoay vần theo lực hấp dẫn vĩnh hằng."
            }
        ]
    },
    {
        "id": "sheet_02_nebula_beasts",
        "chapter_dir": "chapter_02_nebula_beasts",
        "title": "Tinh Vân & Sinh Vật Thiên Hà (Nebula Beasts & Celestial Wonders)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791475028607.jpg",
        "characters": [
            {
                "id": "nebula_cosmic_moth",
                "name": "Bướm Tinh Vân Aurora",
                "native": "Cosmic Nebula Moth",
                "title": "Tiên Bướm Ánh Sáng Cực Quang",
                "symbol": "🦋",
                "rarity": "epic",
                "element": "light",
                "desc": "Bướm vũ trụ đôi cánh rực sáng như dải tinh vân màu tím cam vàng, thân lông mềm mại đính ngôi sao kim cương lấp lánh giữa đêm đen."
            },
            {
                "id": "asteroid_golem",
                "name": "Người Đá Thiên Thạch Meteorite",
                "native": "Asteroid Core Golem",
                "title": "Khổng Lồ Trọng Lực Nham Thạch",
                "symbol": "🪨",
                "rarity": "epic",
                "element": "earth",
                "desc": "Quái vật người đá kết tinh từ các khối thiên thạch trôi dạt nạm hồng ngọc và lam ngọc vũ trụ, phát ra sức hút hấp dẫn mãnh liệt."
            },
            {
                "id": "starlight_kitsune",
                "name": "Hồ Ly Tinh Tú Astra",
                "native": "Starlight Celestial Kitsune",
                "title": "Linh Thú Sao Trời Chín Đuôi",
                "symbol": "🦊",
                "rarity": "legendary",
                "element": "light",
                "desc": "Cáo vũ trụ lông trắng tuyết với chùm đuôi tinh vân bốc lửa sao xanh vàng rực rỡ, đôi mắt lam biếc soi sáng đường đi cho các nhà du hành (Mascot Bộ Sưu Tập)."
            },
            {
                "id": "void_star_octopus",
                "name": "Bạch Tuộc Hư Không Cổ Đại",
                "native": "Void Galaxy Kraken",
                "title": "Chúa Tể Vực Thẳm Vũ Trụ",
                "symbol": "🐙",
                "rarity": "epic",
                "element": "dark",
                "desc": "Sinh vật vũ trụ tím sẫm dát bụi sao vàng mang độc nhãn viền vàng thần bí, những xúc tu mềm mại lướt êm đềm qua các tầng không gian sâu."
            },
            {
                "id": "solar_flare_beetle",
                "name": "Bọ Cánh Cứng Bão Mặt Trời Sol",
                "native": "Solar Flare Beetle",
                "title": "Hộ Vệ Lò Lửa Thái Dương",
                "symbol": "🪲",
                "rarity": "rare",
                "element": "fire",
                "desc": "Chú bọ hung nham thạch vũ trụ sở hữu đôi cánh pha lê xanh ngọc bốc lửa mặt trời rực đỏ, tỏa năng lượng nhiệt hạch vô tận."
            },
            {
                "id": "cosmic_space_whale",
                "name": "Cá Voi Thiên Hà Levi",
                "native": "Cosmic Star Whale",
                "title": "Thần Thú Ngân Hà Vô Tận",
                "symbol": "🐋",
                "rarity": "legendary",
                "element": "water",
                "desc": "Cá voi vũ trụ bơi lội giữa đại dương các vì sao, trên lưng khắc họa dải ngân hà và các chòm sao cổ xưa mang lại bình yên cho vũ trụ."
            },
            {
                "id": "magnetic_pulsar_bot",
                "name": "Robot Từ Trường Xung Magno",
                "native": "Magnetic Pulsar Bot",
                "title": "Cơ Giới Cực Quang Âm Dương",
                "symbol": "🧲",
                "rarity": "rare",
                "element": "water",
                "desc": "Robot điều khiển từ trường mang hai cực nam châm đỏ lam mạnh mẽ, kiểm soát các hạt plasma vũ trụ bay quanh quỹ đạo bảo vệ."
            },
            {
                "id": "black_hole_singularity",
                "name": "Tiểu Hố Đen Tinh Nghịch Singulo",
                "native": "Playful Black Hole",
                "title": "Điểm Kỳ Dị Dễ Thương",
                "symbol": "🕳️",
                "rarity": "epic",
                "element": "dark",
                "desc": "Bé hố đen có đôi mắt mèo tinh nghịch được bao bọc bởi đĩa bồi tụ xoáy màu cam tím rực lửa, hút trọn mọi nỗi buồn trong vũ trụ."
            },
            {
                "id": "celestial_armillary_sphere",
                "name": "Hỗn Thiên Nghi Thiên Hà Vĩnh Cửu",
                "native": "Eternal Celestial Armillary",
                "title": "Cổ Vật Đo Không Thời Gian",
                "symbol": "🔮",
                "rarity": "legendary",
                "element": "light",
                "desc": "Cỗ máy thiên văn tối cổ hình cầu tinh thể sao xoay quanh các vòng đai hoàng kim, khóa chặt tọa độ các chiều không gian trong vũ trụ."
            }
        ]
    }
]

def process_and_cut_space():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/space"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(SPACE_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(SPACE_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(SPACE_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (10, 10, 24, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_space.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_space.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Space Galaxy characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["galaxy", "space-galaxy", "vu-tru"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("space", link_path)
                print(f"✓ Created symlink {link_name} -> space")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_space()
