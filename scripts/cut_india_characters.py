import os
import cv2
import numpy as np
from PIL import Image

INDIA_SHEET_CONFIGS = [
    {
        "id": "sheet_01_gods_mounts",
        "chapter_dir": "chapter_01_gods_mounts",
        "title": "Chư Thần & Linh Thú (Divine Deities & Sacred Vahanas)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791471315100.jpg",
        "characters": [
            {
                "id": "durga_maa",
                "name": "Đại Nữ Thần Durga",
                "sanskrit": "माँ दुर्गा",
                "title": "Nữ Thần Chiến Thắng",
                "symbol": "🔱",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Nữ thần chiến thắng tối cao mười tay cầm binh khí thần thánh, hiện thân của sức mạnh Shakti diệt trừ cái ác bảo hộ vũ trụ."
            },
            {
                "id": "simha_lion",
                "name": "Kim Sư Simha",
                "sanskrit": "सिंह",
                "title": "Thánh Thú Sư Tử",
                "symbol": "🦁",
                "rarity": "epic",
                "element": "earth",
                "desc": "Sư tử hoàng kim dũng mãnh vật cưỡi của Nữ thần Durga, biểu tượng của lòng dũng cảm, vương quyền và sức mạnh vô song."
            },
            {
                "id": "naga_king",
                "name": "Thần Xà Naga",
                "sanskrit": "नागराज",
                "title": "Minh Giới Xà Thần",
                "symbol": "🐍",
                "rarity": "rare",
                "element": "water",
                "desc": "Chúa tể loài rắn linh thiêng ngự trên ngai vàng đáy biển, bảo hộ kho báu bí ẩn và dòng nước mát lành cho cõi trần gian."
            },
            {
                "id": "nandi_bull",
                "name": "Bò Thần Nandi",
                "sanskrit": "नन्दिन्",
                "title": "Thánh Ngưu Nandi",
                "symbol": "🐂",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú bò trắng linh thiêng trung thành của Thần Shiva, biểu trưng cho sự kiên định, công lý, niềm vui và lòng tận tụy."
            },
            {
                "id": "peacock_fan",
                "name": "Khổng Tước Vũ Phiến",
                "sanskrit": "मयूर पंखा",
                "title": "Quạt Lông Công Thiêng",
                "symbol": "🪶",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Chiếc quạt lông công xòe rộng lộng lẫy kết chuông vàng, xua tan oi bức và mang lại làn gió thanh tịnh trong các nghi lễ đền đài."
            },
            {
                "id": "vyaghra_tiger",
                "name": "Thần Hổ Vyaghra",
                "sanskrit": "व्याघ्र",
                "title": "Linh Sơn Bá Hổ",
                "symbol": "🐯",
                "rarity": "epic",
                "element": "fire",
                "desc": "Mãnh hổ thần thoại khoác vòng hoa cúc vàng rực rỡ, linh thú dũng cảm xua đuổi bóng tối và bảo hộ người hành hương nơi rừng thiêng."
            },
            {
                "id": "bal_hanuman",
                "name": "Tiểu Thần Hanuman",
                "sanskrit": "बाल हनुमान",
                "title": "Thần Khỉ Thiếu Niên",
                "symbol": "🐒",
                "rarity": "rare",
                "element": "wind",
                "desc": "Hanuman thời thơ ấu với lòng dũng cảm phi thường từng nhảy vọt lên bầu trời hái mặt trời tưởng là quả đào chín mọng."
            },
            {
                "id": "rangoli_mandala",
                "name": "Hoa Đồ Rangoli",
                "sanskrit": "रंगोली",
                "title": "Mạn Đà La Sắc Màu",
                "symbol": "🌺",
                "rarity": "common",
                "element": "earth",
                "desc": "Bức tranh hoa tươi và bột màu truyền thống vẽ trước cửa nhà ngày Tết Diwali, mời gọi Nữ thần May mắn Lakshmi ghé thăm ban phúc."
            },
            {
                "id": "lord_krishna",
                "name": "Thần Sáo Krishna",
                "sanskrit": "श्रीकृष्ण",
                "title": "Thiên Tử Thổi Sáo",
                "symbol": "🪈",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Hiện thân của tình yêu và sự thông tuệ, tiếng sáo trúc Bansuri mê hoặc lòng người khiến muôn loài muôn thú và hoa cỏ cùng say đắm."
            }
        ]
    },
    {
        "id": "sheet_02_festivals_celebrations",
        "chapter_dir": "chapter_02_festivals_celebrations",
        "title": "Lễ Hội & Thần Thoại (Festivals & Joyful Legends)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791471315110.jpg",
        "characters": [
            {
                "id": "lord_ganesha",
                "name": "Thần Voi Ganesha",
                "sanskrit": "गणेश",
                "title": "Thần Trí Tuệ & May Mắn",
                "symbol": "🐘",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Vị thần đầu voi được tôn kính bậc nhất Ấn Độ, người xóa tan mọi trở ngại gian khó, ban phát trí tuệ và sự khởi đầu hanh thông tốt lành."
            },
            {
                "id": "mayura_peacock",
                "name": "Linh Điểu Mayura",
                "sanskrit": "मयूर",
                "title": "Khổng Tước Hoàng Kim",
                "symbol": "🦚",
                "rarity": "rare",
                "element": "wind",
                "desc": "Loài chim công cao quý với bộ lông đuôi lấp lánh muôn sắc màu, tượng trưng cho vẻ đẹp kiêu sa, niềm kiêu hãnh và điềm lành bất tận."
            },
            {
                "id": "padma_lotus",
                "name": "Thánh Liên Padma",
                "sanskrit": "पद्म",
                "title": "Hoa Sen Thiêng",
                "symbol": "🪷",
                "rarity": "rare",
                "element": "water",
                "desc": "Đóa sen hồng linh thiêng vươn lên từ bùn lầy tỏa hương thơm ngát, biểu tượng của sự thuần khiết tinh khôi và phúc lành thịnh vượng."
            },
            {
                "id": "baby_sheru",
                "name": "Tiểu Hổ Sheru",
                "sanskrit": "शेरू",
                "title": "Hổ Nhỏ Lễ Hội",
                "symbol": "🐯",
                "rarity": "common",
                "element": "earth",
                "desc": "Chú hổ con đáng yêu tinh nghịch nhảy nhót trong các lễ hội rộn ràng, mang lại tiếng cười và niềm vui cho mọi trẻ em."
            },
            {
                "id": "hanuman_warrior",
                "name": "Chiến Thần Hanuman",
                "sanskrit": "हनुमान",
                "title": "Đại Thánh Kim Chùy",
                "symbol": "🔱",
                "rarity": "legendary",
                "element": "wind",
                "desc": "Chiến thần khỉ trung thành bậc nhất với cây chùy vàng Gada đập tan mọi yêu ma, biểu tượng của lòng quả cảm và sức mạnh vô địch."
            },
            {
                "id": "dhol_drum",
                "name": "Trống Hội Dholak",
                "sanskrit": "ढोलक",
                "title": "Thần Cổ Lễ Hội",
                "symbol": "🥁",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Chiếc trống rộn rã trong lễ hội Holi và ngày Tết truyền thống, nhịp trống tưng bừng khuấy động mọi bước nhảy rực lửa đam mê."
            },
            {
                "id": "modak_sweet",
                "name": "Bánh Lễ Modak",
                "sanskrit": "मोदक",
                "title": "Phúc Lộc Bánh Ngọt",
                "symbol": "🥟",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Món bánh ngọt truyền thống hình búp sen nhân dừa đường thốt nốt dâng lên thần Ganesha, biểu tượng của niềm hỷ lạc viên mãn."
            },
            {
                "id": "diwali_diya",
                "name": "Đèn Lửa Diya",
                "sanskrit": "दिया",
                "title": "Ngọn Lửa Ánh Sáng",
                "symbol": "🪔",
                "rarity": "epic",
                "element": "fire",
                "desc": "Ngọn đèn dầu đất nung thắp sáng muôn nơi trong đêm Diwali, biểu trưng cho sự chiến thắng của ánh sáng trước bóng tối u minh."
            },
            {
                "id": "sari_dancer",
                "name": "Vũ Nữ Sari",
                "sanskrit": "नर्तकी",
                "title": "Vũ Khúc Ấn Độ",
                "symbol": "💃",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Nàng vũ công xinh đẹp trong tà áo Sari rực rỡ sắc màu, đôi bàn tay mềm mại uyển chuyển biểu diễn vũ điệu thần tiên đón chào ngày hội lớn."
            }
        ]
    }
]

def process_and_cut_india():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/india"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(INDIA_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(INDIA_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['sanskrit']}) -> {dest_path}")

    # Generate preview montage of all cutouts (2 rows x 9 columns)
    cols = 9
    rows = len(INDIA_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (24, 14, 18, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_india.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} India Myth characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["an-do", "indian"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("india", link_path)
                print(f"✓ Created symlink {link_name} -> india")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_india()
