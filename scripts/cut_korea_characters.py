import os
import cv2
import numpy as np
from PIL import Image

KOREA_SHEET_CONFIGS = [
    {
        "id": "sheet_01_folklore_customs",
        "chapter_dir": "chapter_01_folklore_customs",
        "title": "Phong Tục Dân Gian (Folklore & Ancient Customs)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791470862268.jpg",
        "characters": [
            {
                "id": "dokkaebi",
                "name": "Dokkaebi Tinh Nghịch",
                "hangul": "도깨비",
                "title": "Yêu Tinh Dokkaebi",
                "symbol": "👹",
                "rarity": "epic",
                "element": "fire",
                "desc": "Yêu tinh dân gian Hàn Quốc cầm cây chùy thần Dokkaebi-bangmangi, tính tình tinh nghịch thích đố vui và ban phát của cải cho người hiền lành."
            },
            {
                "id": "jangseung",
                "name": "Mộc Thần Jangseung",
                "hangul": "장승",
                "title": "Cột Gỗ Canh Làng",
                "symbol": "🪵",
                "rarity": "rare",
                "element": "earth",
                "desc": "Cột gỗ hộ vệ làng triều Joseon đội mũ Gat và quấn dây rơm saekki linh thiêng, nụ cười sảng khoái xua đuổi mọi tà khí xâm nhập."
            },
            {
                "id": "hahoe_mask",
                "name": "Mặt Nạ Hahoe",
                "hangul": "하회탈",
                "title": "Thần Diện Hahoe",
                "symbol": "🎭",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Mặt nạ gỗ truyền thống của làng Hahoe mang nụ cười hỷ lạc phúc hậu, biểu tượng của điệu múa trừ tà và lễ hội dân gian rộn ràng."
            },
            {
                "id": "bokjumeoni",
                "name": "Túi Phúc Bokjumeoni",
                "hangul": "복주머니",
                "title": "Phúc Nang May Mắn",
                "symbol": "🧧",
                "rarity": "common",
                "element": "earth",
                "desc": "Túi lụa ngũ sắc Obangsek đựng may mắn ngày Tết Seollal, đính đồng tiền xu cổ mang lại tài lộc dồi dào, phúc thọ an khang cho muôn nhà."
            },
            {
                "id": "norigae",
                "name": "Ngọc Bội Norigae",
                "hangul": "노리개",
                "title": "Khí Tiết Norigae",
                "symbol": "📿",
                "rarity": "uncommon",
                "element": "spirit",
                "desc": "Trang sức ngọc bích kết dây lụa Maedeup tam sắc tinh xảo của các tiểu thư Joseon, biểu trưng cho vẻ đẹp đoan trang và tấm lòng thuần khiết."
            },
            {
                "id": "samulnori_buk",
                "name": "Trống Hội Samulnori",
                "hangul": "풍물북",
                "title": "Linh Vũ Thần Cổ",
                "symbol": "🥁",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Chiếc trống hội rộn ràng hòa nhịp cùng điệu múa dân gian Samulnori tưng bừng, xua tan mùa đông lạnh giá và cầu chúc mùa màng tốt tươi."
            },
            {
                "id": "kkachi_magpie",
                "name": "Hỷ Thước Kkachi",
                "hangul": "길조 까치",
                "title": "Sứ Giả Tin Vui",
                "symbol": "🐦",
                "rarity": "rare",
                "element": "wind",
                "desc": "Chim ác là linh thiêng biểu tượng của điềm lành và hy vọng, luôn cất tiếng hót líu lo đầu cành báo hiệu khách quý và niềm vui ghé thăm."
            },
            {
                "id": "korean_tiger",
                "name": "Mãnh Hổ Horangi",
                "hangul": "백두 호랑이",
                "title": "Linh Sơn Mãnh Hổ",
                "symbol": "🐯",
                "rarity": "epic",
                "element": "earth",
                "desc": "Chúa sơn lâm núi Bạch Đầu trong thần thoại lập quốc Dangun và tranh Minhwa, mang chuông vàng oai dũng xua trừ mọi ma quỷ ám muội."
            },
            {
                "id": "hanbok_maiden",
                "name": "Tiểu Thư Hanbok",
                "hangul": "한복 아가씨",
                "title": "Giai Nhân Joseon",
                "symbol": "🪭",
                "rarity": "rare",
                "element": "wind",
                "desc": "Nàng thiếu nữ Joseon dịu dàng trong tà áo Hanbok ngũ sắc thêu hoa mai, tay cầm quạt giấy Buchae múa điệu truyền thống đón tiết xuân sang."
            }
        ]
    },
    {
        "id": "sheet_02_mythic_deities",
        "chapter_dir": "chapter_02_mythic_deities",
        "title": "Thần Thú & Tiên Giới (Mythical Beasts & Celestial Spirits)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791470862277.jpg",
        "characters": [
            {
                "id": "gumiho",
                "name": "Cửu Vĩ Hồ Gumiho",
                "hangul": "구미호",
                "title": "Thiên Hồ Nghìn Năm",
                "symbol": "🦊",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Cáo chín đuôi tu luyện ngàn năm trong thần thoại xứ Hàn, sở hữu viên ngọc hồ ly thần bí Yeowoo Guseul và ma thuật biến hóa khôn lường."
            },
            {
                "id": "samjok_o",
                "name": "Tam Túc Ô Samjok-o",
                "hangul": "삼족오",
                "title": "Thần Điểu Mặt Trời",
                "symbol": "🦅",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Thần điểu ba chân ngự giữa vầng thái dương rực lửa thời vương triều Cao Câu Ly, tượng trưng cho thiên mệnh tối cao và quang năng bất diệt."
            },
            {
                "id": "haechi",
                "name": "Thần Thú Haechi",
                "hangul": "해치",
                "title": "Linh Thú Trấn Linh",
                "symbol": "🦁",
                "rarity": "epic",
                "element": "earth",
                "desc": "Linh thú công lý sừng đơn vảy ngọc trấn giữ cung điện hoàng gia, có khả năng phân biệt thiện ác thị phi và nuốt chửng hỏa hoạn tai ương."
            },
            {
                "id": "imoogi",
                "name": "Long Xà Imoogi",
                "hangul": "이무기",
                "title": "Thuồng Luồng Hóa Long",
                "symbol": "🐉",
                "rarity": "epic",
                "element": "water",
                "desc": "Mãng xà khổng lồ tu luyện ngàn năm dưới đáy biển sâu, khi đoạt được ngọc thần Yeouiju sẽ đắc đạo hóa rồng bay vút lên chín tầng mây."
            },
            {
                "id": "bulgae",
                "name": "Hỏa Khuyển Bulgae",
                "hangul": "불개",
                "title": "Chó Lửa Nhật Nguyệt",
                "symbol": "🐕",
                "rarity": "rare",
                "element": "fire",
                "desc": "Chó lửa dũng mãnh của vương quốc bóng tối Gamangnara, từng rượt đuổi mặt trời và mặt trăng tạo nên hiện tượng nhật thực nguyệt thực kỳ thú."
            },
            {
                "id": "cheonyeo_gwishin",
                "name": "U Linh Cheonyeo",
                "hangul": "처녀귀신",
                "title": "Bạch Y Ma Nữ",
                "symbol": "👻",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Hồn ma thiếu nữ áo trắng tóc dài bí ẩn nhất trong dân gian Hàn Quốc, lướt đi trong sương đêm cùng những đốm lửa ma trơi Doduri huyền ảo."
            },
            {
                "id": "mudang_shaman",
                "name": "Pháp Sư Mudang",
                "hangul": "무당",
                "title": "Vu Nữ Shaman",
                "symbol": "🔮",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Nữ pháp sư cầu an nối liền cõi trần và thế giới linh hồn, tay lắc chùm chuông đồng Bangul múa điệu Gut linh thiêng giải trừ mọi tai ương."
            },
            {
                "id": "sansin",
                "name": "Sơn Thần Sansin",
                "hangul": "산신령",
                "title": "Bạch Đầu Sơn Thần",
                "symbol": "👴",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Vị thần tối cao cai quản các dãy núi thiêng liêng xứ Hàn, râu tóc bạc phơ cầm gậy trúc hồ lô ban phát thuốc tiên che chở muôn loài."
            },
            {
                "id": "dal_tokki",
                "name": "Nguyệt Thố Dal Tokki",
                "hangul": "달토끼",
                "title": "Thỏ Ngọc Giã Bánh",
                "symbol": "🌕",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Thỏ ngọc sống trên cung trăng bên vầng trăng khuyết vàng rực, đêm rằm trung thu Chuseok chăm chỉ giã bánh gạo dẻo và linh dược trường thọ."
            }
        ]
    }
]

def process_and_cut_korea():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/korea"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(KOREA_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(KOREA_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['hangul']}) -> {dest_path}")

    # Generate preview montage of all cutouts (2 rows x 9 columns)
    cols = 9
    rows = len(KOREA_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (18, 16, 26, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_korea.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Korean Folklore characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["han-quoc", "korean"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("korea", link_path)
                print(f"✓ Created symlink {link_name} -> korea")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_korea()
