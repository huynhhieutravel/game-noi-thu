import os
import cv2
import numpy as np
from PIL import Image

SEA_SHEET_CONFIGS = [
    {
        "id": "sheet_01_mythic_beasts",
        "chapter_dir": "chapter_01_mythic_beasts",
        "title": "Linh Thú Rừng Thiêng (Mythic Beasts & Ancient Temples)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791471722019.jpg",
        "characters": [
            {
                "id": "phaya_naga",
                "name": "Thần Xà Phaya Naga",
                "native": "พญานาค",
                "title": "Chúa Tể Dòng Mê Kông",
                "symbol": "🐍",
                "rarity": "legendary",
                "element": "water",
                "desc": "Chúa tể xà thần uy nghiêm cai quản dòng sông Mê Kông huyền thoại, ban phát mưa thuận gió hòa và bảo hộ đền đài linh thiêng."
            },
            {
                "id": "garuda_warrior",
                "name": "Kim Sí Điểu Garuda",
                "native": "ครุฑ",
                "title": "Chúa Tể Bầu Trời",
                "symbol": "🦅",
                "rarity": "legendary",
                "element": "wind",
                "desc": "Kim Sí Điểu dũng mãnh sải đôi cánh lửa hoàng kim bay vút giữa tầng không, biểu tượng tối cao của lòng quả cảm và ánh sáng công lý."
            },
            {
                "id": "airavata_elephant",
                "name": "Bạch Tượng Erawan",
                "native": "ช้างเอราวัณ",
                "title": "Thần Tượng Hoàng Gia",
                "symbol": "🐘",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Voi trắng hoàng gia linh thiêng bậc nhất xứ sở Chùa Vàng, mang lại thái bình thịnh vượng và phước lành ngập tràn cho muôn dân."
            },
            {
                "id": "white_hanuman",
                "name": "Bạch Hầu Hanuman",
                "native": "หนุมาน",
                "title": "Hầu Vương Thần Tốc",
                "symbol": "🐒",
                "rarity": "epic",
                "element": "wind",
                "desc": "Tướng quân khỉ trắng vô song trong sử thi Ramakien, sở hữu sức mạnh dời non lấp biển và phép thần thông biến hóa khôn lường."
            },
            {
                "id": "malayan_tiger",
                "name": "Mãnh Hổ Malayan",
                "native": "Harimau",
                "title": "Chúa Tể Rừng Già",
                "symbol": "🐯",
                "rarity": "epic",
                "element": "earth",
                "desc": "Chúa tể sơn lâm dũng mãnh nơi rừng nhiệt đới Đông Nam Á, mang linh khí bảo hộ làng mạc và uy dũng trấn áp tà linh."
            },
            {
                "id": "barong_lion",
                "name": "Thần Sư Barong",
                "native": "Barong Ket",
                "title": "Linh Thú Trấn Linh Bali",
                "symbol": "🦁",
                "rarity": "epic",
                "element": "fire",
                "desc": "Vua của các linh hồn thiện lành trên đảo thiêng Bali, bảo hộ con người chiến thắng nữ chúa quỷ Rangda trong vũ điệu truyền đời."
            },
            {
                "id": "civet_musang",
                "name": "Bé Chồn Musang",
                "native": "Musang Luwak",
                "title": "Linh Thú Trái Cây",
                "symbol": "🦝",
                "rarity": "common",
                "element": "earth",
                "desc": "Chú chồn hương tinh nghịch sống trên tán cây rừng nhiệt đới, bầu bạn cùng muôn loài hoa trái chôm chôm măng cụt ngọt lành."
            },
            {
                "id": "ayutthaya_buddha",
                "name": "Phật Tích Ayutthaya",
                "native": "เศียรพระพุทธรูป",
                "title": "Cổ Phật Rễ Cây",
                "symbol": "🪷",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Di tích kỳ bí đầu Phật đá ngàn năm được ôm trọn bởi những chùm rễ cây bồ đề cổ thụ, tỏa ánh từ bi tĩnh lặng vượt thời gian."
            },
            {
                "id": "sacred_gong",
                "name": "Thần Chiêng Khong",
                "native": "ฆ้อง",
                "title": "Linh Âm Cồng Chiêng",
                "symbol": "🔔",
                "rarity": "rare",
                "element": "fire",
                "desc": "Tiếng chiêng đồng linh thiêng vang vọng qua muôn ngọn núi và thung lũng, kết nối con người với đất trời trong các ngày hội lớn."
            }
        ]
    },
    {
        "id": "sheet_02_tropical_festivals",
        "chapter_dir": "chapter_02_tropical_festivals",
        "title": "Lễ Hội & Rừng Nhiệt Đới (Tropical Tropics & Royal Festivals)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791471722057.jpg",
        "characters": [
            {
                "id": "naga_chibi",
                "name": "Tiểu Xà Nak Noi",
                "native": "นาคน้อย",
                "title": "Linh Xà Đài Sen",
                "symbol": "🐍",
                "rarity": "rare",
                "element": "water",
                "desc": "Chú rồng rắn nhỏ đáng yêu ngự trên đóa sen hồng giữa làn mây trắng, mang lại may mắn và những cơn mưa mát lành cho đồng ruộng."
            },
            {
                "id": "baby_garuda",
                "name": "Tiểu Thần Garuda",
                "native": "ครุฑน้อย",
                "title": "Hỏa Điểu Thiếu Niên",
                "symbol": "🐥",
                "rarity": "rare",
                "element": "fire",
                "desc": "Chú chim thần mặt trời bé nhỏ thừa hưởng đôi cánh lửa dũng mãnh, tinh nghịch bay lượn đón ánh bình minh rạng rỡ mỗi sớm mai."
            },
            {
                "id": "chang_noi",
                "name": "Bé Voi Chang Noi",
                "native": "ช้างน้อย",
                "title": "Voi Con Songkran",
                "symbol": "🐘",
                "rarity": "common",
                "element": "earth",
                "desc": "Chú voi con hiền hòa vui vẻ thích té nước trong lễ hội Songkran chào năm mới, mang lại tiếng cười giòn giã khắp các nẻo đường."
            },
            {
                "id": "golden_monkey",
                "name": "Hầu Nhi Kera",
                "native": "Kera Emas",
                "title": "Linh Hầu Rừng Thiêng",
                "symbol": "🐒",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Chú khỉ vàng nhanh nhẹn chuyền cành qua những ngôi đền cổ rêu phong, bảo vệ những bí mật của vương triều xa xưa."
            },
            {
                "id": "hornbill_enggang",
                "name": "Hồng Hoàng Enggang",
                "native": "Burung Enggang",
                "title": "Thần Điểu Mỏ Sừng",
                "symbol": "🦜",
                "rarity": "rare",
                "element": "wind",
                "desc": "Loài chim mỏ sừng quý hiếm linh thiêng bậc nhất rừng già Borneo, sứ giả hòa bình kết nối con người với thần linh trên bầu trời."
            },
            {
                "id": "yaksha_giant",
                "name": "Dạ Xoa Yaksha",
                "native": "ทศกัณฐ์",
                "title": "Hộ Môn Thần Tướng",
                "symbol": "👹",
                "rarity": "epic",
                "element": "fire",
                "desc": "Vị thần hộ pháp khổng lồ nanh vuốt oai nghiêm gác cổng Hoàng Cung và chùa Phật Ngọc, ngăn chặn mọi tà ma xâm phạm đất thánh."
            },
            {
                "id": "tokay_gecko",
                "name": "Cẩm Kè Tokay",
                "native": "ตุ๊กแก",
                "title": "Cẩm Thú May Mắn",
                "symbol": "🦎",
                "rarity": "common",
                "element": "earth",
                "desc": "Chú tắc kè gấm nhiệt đới tiếng kêu mang lại điềm lành theo quan niệm dân gian, chuyên canh giữ nhà cửa và cây trái xum xuê."
            },
            {
                "id": "loy_krathong",
                "name": "Hoa Đăng Krathong",
                "native": "ลอยกระทง",
                "title": "Đăng Hoa Nước Thiêng",
                "symbol": "🪷",
                "rarity": "uncommon",
                "element": "water",
                "desc": "Chiếc hoa đăng hình sen rực rỡ thả trôi theo dòng sông trong đêm trăng rằm, gửi gắm lời cầu chúc và lòng tri ân Mẹ Nước."
            },
            {
                "id": "angkor_smile",
                "name": "Nụ Cười Bayon",
                "native": "ប្រាសាទបាយ័ន",
                "title": "Nụ Cười Angkor Nghìn Năm",
                "symbol": "🗿",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Tượng đá bốn mặt mỉm cười huyền bí của đền Bayon Angkor, biểu tượng của sự giác ngộ, an lạc và vẻ đẹp vĩnh hằng giữa rừng sâu."
            }
        ]
    }
]

def process_and_cut_sea():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/sea"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(SEA_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(SEA_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(SEA_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (12, 24, 18, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_sea.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Southeast Asia characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["dong-nam-a", "southeast-asia"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("sea", link_path)
                print(f"✓ Created symlink {link_name} -> sea")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_sea()
