import os
import cv2
import numpy as np
from PIL import Image

DINOSAUR_SHEET_CONFIGS = [
    {
        "id": "sheet_01_jurassic_valley",
        "chapter_dir": "chapter_01_jurassic_valley",
        "title": "Thung Lũng Kỷ Jura (Verdant Jurassic Valley)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791473612006.jpg",
        "characters": [
            {
                "id": "baby_trex",
                "name": "Bạo Long Nhí Rexy",
                "native": "Baby T-Rex",
                "title": "Chúa Tể Rừng Xanh Tí Hon",
                "symbol": "🦖",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Chú khủng long bạo chúa nhí da xanh lá cây với tiếng gầm vang rộn rã, tinh nghịch chạy nhảy khắp thung lũng tiền sử."
            },
            {
                "id": "triceratops_trixie",
                "name": "Tam Giác Long Cài Hoa Trixie",
                "native": "Triceratops Trixie",
                "title": "Bé Ba Sừng Đáng Yêu",
                "symbol": "🦏",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Bé khủng long ba sừng màu cam rực rỡ cài hoa rừng quanh diềm cổ, chiếc sừng ngộ nghĩnh húc nhẹ vào các bụi cây tìm quả mọng."
            },
            {
                "id": "stegosaurus_spike",
                "name": "Kiếm Long Lá Đỏ Stego",
                "native": "Stegosaurus Stego",
                "title": "Bọc Giáp Phiến Phong",
                "symbol": "🦕",
                "rarity": "epic",
                "element": "earth",
                "desc": "Chú khủng long phiến sừng trên lưng mọc những hàng lá đỏ rực rỡ như rừng thu, chiếc đuôi gai vẫy chào bạn bè hiền lành."
            },
            {
                "id": "raptor_dash",
                "name": "Tốc Long Tím Velocity",
                "native": "Velociraptor Dash",
                "title": "Tia Chớp Rừng Rậm",
                "symbol": "🦎",
                "rarity": "epic",
                "element": "wind",
                "desc": "Khủng long săn mồi nhỏ nhắn màu tím vằn vàng đeo khăn quàng lá xanh, sở hữu đôi chân thần tốc chạy thoăn thoắt trên sỏi đá."
            },
            {
                "id": "pterodactyl_sky",
                "name": "Dực Long Bầu Trời Ptero",
                "native": "Pterodactyl Sky",
                "title": "Chúa Tể Không Trung Tiền Sử",
                "symbol": "🦅",
                "rarity": "epic",
                "element": "wind",
                "desc": "Chú thằn lằn bay xanh biếc với đôi cánh cam lượn vòng giữa tầng mây, quan sát toàn cảnh thung lũng từ trên cao bao la."
            },
            {
                "id": "ankylosaurus_buster",
                "name": "Giáp Long Chùy Đá Anky",
                "native": "Ankylosaurus Buster",
                "title": "Chiến Xa Bọc Thép Cổ Xưa",
                "symbol": "🪨",
                "rarity": "rare",
                "element": "earth",
                "desc": "Khủng long bọc giáp gai đá phủ rêu xanh, đuôi mang khối chùy cự thạch có thể đập vỡ mọi chướng ngại cản đường."
            },
            {
                "id": "parasaurolophus_perry",
                "name": "Khủng Long Kèn Nước Perry",
                "native": "Parasaurolophus Perry",
                "title": "Nhạc Trưởng Suối Nguồn",
                "symbol": "🎺",
                "rarity": "rare",
                "element": "water",
                "desc": "Bé khủng long mào dài màu hồng pastel tinh nghịch té nước bên bờ suối, tiếng thổi từ mào ngân vang êm dịu như điệu sáo."
            },
            {
                "id": "dino_egg_nest",
                "name": "Tổ Trứng Khủng Long Rừng",
                "native": "Hatching Dino Nest",
                "title": "Mầm Sống Kỷ Jura",
                "symbol": "🥚",
                "rarity": "common",
                "element": "earth",
                "desc": "Tổ trứng khủng long đốm sắc màu lót lá ấm áp nở ra chú khủng long con mắt to tròn ngơ ngác đón chào ánh mặt trời."
            },
            {
                "id": "dino_footprint_totem",
                "name": "Cột Đá Dấu Chân Cổ Đại",
                "native": "Fossil Footprint Totem",
                "title": "Chứng Tích Tiền Sử",
                "symbol": "🗿",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Trụ đá rêu phong khắc dấu chân khủng long phát quang vàng rực, phong ấn sinh khí ngàn năm của các bậc tiền bối khổng lồ."
            }
        ]
    },
    {
        "id": "sheet_02_volcanic_primordial",
        "chapter_dir": "chapter_02_volcanic_primordial",
        "title": "Hỏa Sơn & Băng Hà Tiền Sử (Volcanic Primordial & Ice Age)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791473611983.jpg",
        "characters": [
            {
                "id": "spinosaurus_magma",
                "name": "Gai Long Hỏa Nham Spino",
                "native": "Magma Spinosaurus",
                "title": "Bá Chủ Dòng Nham Thạch",
                "symbol": "🔥",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Khủng long gai lưng khổng lồ với cánh buồm rực lửa nham thạch sùng sục, bước đi trên ngọn lửa hung bạo xé tan màn đêm."
            },
            {
                "id": "carnotaurus_blaze",
                "name": "Ngưu Long Sừng Lửa Carno",
                "native": "Carnotaurus Blaze",
                "title": "Cuồng Ngưu Hỏa Diệm",
                "symbol": "🐂",
                "rarity": "epic",
                "element": "fire",
                "desc": "Khủng long săn mồi đỏ rực với đôi sừng bò bốc khói cay nồng, lao vào trận chiến với tốc độ cuồng phong và lửa cháy hừng hực."
            },
            {
                "id": "brachiosaurus_titan",
                "name": "Đại Uyển Long Brachio",
                "native": "Titan Brachiosaurus",
                "title": "Khổng Lồ Chạm Tới Mây",
                "symbol": "🦕",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Khủng long cổ dài hùng vĩ vươn cao qua ngọn núi đá, mỗi bước chân rung chuyển đất trời nhưng tính tình lại cực kỳ hiền hòa."
            },
            {
                "id": "pachycephalosaurus_crush",
                "name": "Thiết Đầu Long Pachy",
                "native": "Meteor Pachycephalo",
                "title": "Chiếc Đầu Sao Băng",
                "symbol": "☄️",
                "rarity": "epic",
                "element": "fire",
                "desc": "Khủng long đầu vòm sắt đá cứng cáp bốc lửa, cú húc uy lực đủ sức làm nứt vỡ những tảng thiên thạch rơi từ trên trời xuống."
            },
            {
                "id": "dilophosaurus_flare",
                "name": "Mào Quạt Độc Long Dilo",
                "native": "Dilophosaurus Flare",
                "title": "Hào Quang Rực Lửa",
                "symbol": "🪭",
                "rarity": "rare",
                "element": "fire",
                "desc": "Thằn lằn mào cổ với bờm quạt bảy sắc cầu vồng xòe rộng dọa kẻ thù, đôi mắt rực sáng trong màn khói bụi miệng núi lửa."
            },
            {
                "id": "dimetrodon_pyro",
                "name": "Dị Răng Long Dimetro",
                "native": "Pyro Dimetrodon",
                "title": "Cánh Buồm Hỏa Ngục",
                "symbol": "🐊",
                "rarity": "rare",
                "element": "fire",
                "desc": "Loài bò sát cổ đại với cánh buồm gai nham thạch tím đỏ hấp thụ nhiệt lượng mặt trời, thở ra những làn hơi nóng ngùn ngụt."
            },
            {
                "id": "sabertooth_frost",
                "name": "Hổ Răng Kiếm Băng Tuyết Diego",
                "native": "Frost Sabertooth Diego",
                "title": "Chúa Tể Kỷ Băng Hà",
                "symbol": "🐅",
                "rarity": "legendary",
                "element": "water",
                "desc": "Mãnh thú lông trắng bạc của kỷ băng giá với cặp răng kiếm sắc như băng tuyết ngàn năm, thoăn thoắt săn mồi giữa bão tuyết."
            },
            {
                "id": "meteor_golem",
                "name": "Quái Cầu Thiên Thạch Cổ",
                "native": "Ancient Meteor Core",
                "title": "Linh Hồn Tinh Cầu Rơi",
                "symbol": "☄️",
                "rarity": "epic",
                "element": "fire",
                "desc": "Quả cầu thiên thạch bốc cháy ngùn ngụt có đôi mắt tinh anh rực lửa, xoay vần giữa không trung mang theo bí mật ngoài vũ trụ."
            },
            {
                "id": "volcano_spirit",
                "name": "Thần Hỏa Sơn Ignis",
                "native": "Living Volcano Ignis",
                "title": "Trái Tim Núi Lửa Tiền Sử",
                "symbol": "🌋",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Ngọn núi lửa cổ xưa sở hữu linh hồn sống, phun trào dung nham đỏ rực tạo nên những hòn đảo mới giữa đại dương nguyên thủy."
            }
        ]
    }
]

def process_and_cut_dinosaur():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/dinosaur"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(DINOSAUR_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(DINOSAUR_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(DINOSAUR_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (20, 24, 14, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_dinosaur.png")
    montage.save(montage_path)

    # Also save to brain artifacts dir for viewing
    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_dinosaur.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Dinosaur characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["khung-long", "dinosaur-world", "dino"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("dinosaur", link_path)
                print(f"✓ Created symlink {link_name} -> dinosaur")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_dinosaur()
