import os
import cv2
import numpy as np
from PIL import Image

WUXIA_SHEET_CONFIGS = [
    {
        "id": "sheet_01_jianghu_legends",
        "chapter_dir": "chapter_01_jianghu_legends",
        "title": "Phong Vân Giang Hồ (Jianghu & Folk Legends)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791470079543.jpg",
        "characters": [
            {
                "id": "bianlian_mask",
                "name": "Biến Diện Miêu",
                "chinese": "川剧变脸",
                "title": "Biến Diện Xuyên Kịch",
                "symbol": "🎭",
                "rarity": "epic",
                "element": "fire",
                "desc": "Tinh linh Xuyên Kịch với tuyệt kỹ Biến Diện thoắt ẩn thoắt hiện trong chớp mắt, biến hóa muôn hình vạn trạng biểu cảm hỷ nộ ái ố."
            },
            {
                "id": "zhaocai_cat",
                "name": "Chiêu Tài Kim Miêu",
                "chinese": "招财金猫",
                "title": "Phúc Lộc Chiêu Tài",
                "symbol": "🐱",
                "rarity": "rare",
                "element": "earth",
                "desc": "Mèo thần tài lộc khoác túi gấm đỏ thêu hoa mai hoàng kim và kết dây cát tường, mang phúc khí và thịnh vượng đến khắp muôn nhà."
            },
            {
                "id": "bagua_mirror",
                "name": "Bát Quái Kính",
                "chinese": "八卦宝镜",
                "title": "Trấn Yêu Kính",
                "symbol": "🪞",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Pháp bảo Đạo gia huyền diệu khắc họa Bát Quái trận đồ viền mây vàng, phát ra u hỏa linh quang đẩy lùi ma quỷ và soi tỏ tà khí."
            },
            {
                "id": "feather_fan",
                "name": "Khổng Minh Vũ Phiến",
                "chinese": "诸葛羽扇",
                "title": "Bạch Vũ Luân Cân",
                "symbol": "🪶",
                "rarity": "epic",
                "element": "wind",
                "desc": "Chiếc quạt lông ngỗng trắng từng theo chân bậc kỳ tài Gia Cát Khổng Minh định đoạt thế sự, vung quạt mượn gió đông xoay chuyển càn khôn."
            },
            {
                "id": "dragon_carp",
                "name": "Cá Chép Vượt Vũ Môn",
                "chinese": "鲤鱼跃龙门",
                "title": "Hóa Long Kim Ngư",
                "symbol": "🐟",
                "rarity": "rare",
                "element": "water",
                "desc": "Cá chép đỏ kim lân kiên cường vượt thác Vũ Môn, đầu mọc sừng rồng uy nghi giữa sóng nước cuộn trào đón chờ thời khắc hóa rồng."
            },
            {
                "id": "jade_pixiu",
                "name": "Bích Ngọc Tỳ Hưu",
                "chinese": "碧玉貔貅",
                "title": "Kỳ Lân Ngọc Ấn",
                "symbol": "🦁",
                "rarity": "epic",
                "element": "earth",
                "desc": "Thụy thú ngọc phỉ thúy cổ tọa lạc trên ấn triện hoàng gia tỏa khói bích hỏa, thu hút tài lộc bốn phương và trấn giữ linh khí giang sơn."
            },
            {
                "id": "fox_swordsman",
                "name": "Bạch Hồ Kiếm Khách",
                "chinese": "白狐剑客",
                "title": "Cửu Vĩ Kiếm Tiên",
                "symbol": "🦊",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Hiệp sĩ cửu vĩ hồ khoác chiến bào hồng y thêu kim tuyến, tay vung thanh bảo kiếm sáng như tuyết xé tan màn sương mù chốn giang hồ."
            },
            {
                "id": "wuxia_swordsman",
                "name": "Tiêu Dao Kiếm Khách",
                "chinese": "逍遥剑客",
                "title": "Lãng Tử Tiêu Dao",
                "symbol": "🍶",
                "rarity": "legendary",
                "element": "wind",
                "desc": "Lãng khách phiêu bạt chốn võ lâm mang theo hồ lô rượu thơm bên hông, tiêu sái ngao du tứ hải theo ngọn gió lá trúc xanh ngát."
            },
            {
                "id": "wuxia_maiden",
                "name": "Nguyệt Ảnh Nữ Hiệp",
                "chinese": "月影女侠",
                "title": "Song Đao Hiệp Nữ",
                "symbol": "⚔️",
                "rarity": "epic",
                "element": "wind",
                "desc": "Thiếu nữ hiệp khách võ nghệ xuất chúng sử dụng song nguyệt nha đao sắc lẹm, thân pháp linh diệu thoắt ẩn thoắt hiện giữa làn mưa cánh hoa đào."
            }
        ]
    },
    {
        "id": "sheet_02_celestial_realm",
        "chapter_dir": "chapter_02_celestial_realm",
        "title": "Tiên Cảnh Diệu Pháp (Celestial Realm & Magic Artifacts)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791470079557.jpg",
        "characters": [
            {
                "id": "purple_gold_gourd",
                "name": "Tử Kim Hồ Lô",
                "chinese": "紫金葫芦",
                "title": "Thái Thượng Linh Hồ",
                "symbol": "🏺",
                "rarity": "rare",
                "element": "fire",
                "desc": "Tiên bảo hồ lô hoàng kim đúc hoa văn tường vân của Đạo gia, có khả năng hút trọn yêu ma và chứa đựng tiên đan ngàn năm."
            },
            {
                "id": "flying_sword",
                "name": "Thanh Phong Phi Kiếm",
                "chinese": "青锋飞剑",
                "title": "Ngự Kiếm Linh Khí",
                "symbol": "🗡️",
                "rarity": "epic",
                "element": "wind",
                "desc": "Bảo kiếm ngự kiếm phi hành của bậc tu tiên, thân kiếm lấp lánh hàn quang và luồng kiếm khí xoáy nước lam sắc trảm yêu cách xa ngàn dặm."
            },
            {
                "id": "taoist_talisman",
                "name": "Thái Cực Thần Phù",
                "chinese": "太极神符",
                "title": "Đạo Gia Linh Phù",
                "symbol": "📜",
                "rarity": "common",
                "element": "spirit",
                "desc": "Lá bùa vàng linh nghiệm viết chu sa của đạo sĩ Mao Sơn, kết hợp Thái Cực đồ khai mở kết giới phong ấn ma quỷ và hộ mệnh bình an."
            },
            {
                "id": "incense_burner",
                "name": "Tử Đồng Đỉnh Hương",
                "chinese": "紫铜香炉",
                "title": "Cổ Lư Hương Luyện Đan",
                "symbol": "🪔",
                "rarity": "uncommon",
                "element": "fire",
                "desc": "Lư hương đồng cổ ba chân chạm khắc hoa văn tường vân, tỏa ra làn khói trầm hương tím thanh khiết giúp tịnh hóa tâm can và tụ linh khí."
            },
            {
                "id": "jade_rabbit",
                "name": "Quảng Hàn Ngọc Thố",
                "chinese": "广寒玉兔",
                "title": "Thỏ Ngọc Giã Thuốc",
                "symbol": "🐇",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Thỏ ngọc đáng yêu bên cung Quảng Hàn dùng cối ngọc bích giã thảo dược trường sinh bất lão mang lại sự sống vĩnh cửu."
            },
            {
                "id": "immortal_crane",
                "name": "Đan Đỉnh Tiên Hạc",
                "chinese": "丹顶仙鹤",
                "title": "Bạch Hạc Cưỡi Mây",
                "symbol": "🪶",
                "rarity": "rare",
                "element": "wind",
                "desc": "Linh điểu cao quý đỉnh đầu đỏ thắm và đôi cánh viền vàng, cưỡi mây tường vân xanh biếc đưa các bậc tiên nhân phi thăng cõi bồng lai."
            },
            {
                "id": "sacred_lotus_flame",
                "name": "Bảo Liên Thần Hỏa",
                "chinese": "宝莲神灯",
                "title": "Tam Muội Hỏa Liên",
                "symbol": "🪷",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Đóa sen thiêng tỏa ngọn lửa tam muội chân hỏa xanh lam và cánh hồng rực rỡ, pháp bảo hộ thể xua tan mọi tà khí tăm tối."
            },
            {
                "id": "landscape_scroll",
                "name": "Sơn Hà Họa Quyển",
                "chinese": "山河画卷",
                "title": "Sơn Hà Xã Tắc Đồ",
                "symbol": "📜",
                "rarity": "epic",
                "element": "earth",
                "desc": "Bức họa trục cuộn tiên gia ẩn chứa càn khôn vũ trụ, thu nhỏ vạn dặm non xanh nước biếc và mây trắng vào từng nét vẽ thủy mặc thần sầu."
            },
            {
                "id": "chang_e",
                "name": "Hằng Nga Tiên Tử",
                "chinese": "嫦娥仙子",
                "title": "Nguyệt Cung Tiên Nga",
                "symbol": "🌕",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Tiên nữ tuyệt sắc nơi Cung Quảng Hàn, tay cầm quạt bạch vũ phiến múa điệu Nghê Thường thướt tha giữa những tầng mây trăng bồng bềnh lãng mạn."
            }
        ]
    }
]

def process_and_cut_wuxia():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/wuxia"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(WUXIA_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(WUXIA_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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

            char_img = Image.fromarray(rgba, mode="RGBA")

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
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['chinese']}) -> {dest_path}")

    # Generate preview montage of all cutouts (2 rows x 9 columns)
    cols = 9
    rows = len(WUXIA_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (20, 14, 18, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_wuxia.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Wuxia / Chinese Myth characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["trung-quoc", "vo-hiep"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("wuxia", link_path)
                print(f"✓ Created symlink {link_name} -> wuxia")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_wuxia()
