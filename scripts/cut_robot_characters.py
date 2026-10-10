import os
import cv2
import numpy as np
from PIL import Image

ROBOT_SHEET_CONFIGS = [
    {
        "id": "sheet_01_workshop_crew",
        "chapter_dir": "chapter_01_workshop_crew",
        "title": "Đội Thợ Máy Công Xưởng (Workshop Crew & Helpers)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791475362297.jpg",
        "characters": [
            {
                "id": "builder_bot_wrench",
                "name": "Robot Thợ Máy Mũ Vàng Rusty",
                "native": "Builder Bot Rusty",
                "title": "Thợ Sửa Chữa Đa Năng",
                "symbol": "🔧",
                "rarity": "rare",
                "element": "earth",
                "desc": "Robot vàng đội mũ bảo hộ công trường, tay cầm cờ lê và bu lông thép, gương mặt LED xanh dương luôn tươi cười sẵn sàng sửa chữa mọi cỗ máy."
            },
            {
                "id": "medic_bot_cross",
                "name": "Robot Y Tế Cứu Thương Pip",
                "native": "Medic Bot Pip",
                "title": "Bác Sĩ Vi Mạch Nano",
                "symbol": "💉",
                "rarity": "rare",
                "element": "water",
                "desc": "Robot bác sĩ thân trắng xanh lá mang biểu tượng chữ thập y tế, tay xách hộp cứu thương sơ cứu và phục hồi năng lượng cho đồng đội."
            },
            {
                "id": "drill_bot_digger",
                "name": "Robot Mũi Khoan Lửa Drillz",
                "native": "Drill Bot Drillz",
                "title": "Chuyên Viên Khoan Cắt Nham Thạch",
                "symbol": "🔩",
                "rarity": "uncommon",
                "element": "fire",
                "desc": "Robot công trình màu cam vằn đen dũng mãnh, sở hữu cánh tay mũi khoan xoay tít tóe tia lửa điện khoan thủng mọi tầng đá cứng."
            },
            {
                "id": "delivery_drone_copter",
                "name": "Drone Giao Hàng Siêu Tốc Copter",
                "native": "Aero Drone Copter",
                "title": "Vận Chuyển Không Gian Hẹp",
                "symbol": "🚁",
                "rarity": "common",
                "element": "wind",
                "desc": "Robot drone hai cánh quạt phát quang xanh lam linh hoạt, cẩu những kiện hàng phụ tùng cơ khí bay lượn thoăn thoắt trong nhà máy."
            },
            {
                "id": "forklift_bot_stacker",
                "name": "Xe Nâng Tí Hon Forky",
                "native": "Forklift Bot Forky",
                "title": "Bậc Thầy Xếp Hàng Kho Bãi",
                "symbol": "🚜",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Robot xe nâng 4 bánh màu đỏ vàng gắn còi đèn nhấp nháy, chăm chỉ nâng đỡ kiện hàng chứa đầy bánh răng và ốc vít cơ khí."
            },
            {
                "id": "welder_bot_sparky",
                "name": "Robot Hàn Xì Lửa Điện Sparky",
                "native": "Welder Bot Sparky",
                "title": "Kỹ Thuật Viên Hàn Ghép",
                "symbol": "🔥",
                "rarity": "rare",
                "element": "fire",
                "desc": "Thợ hàn robot giáp xanh cam đeo bình khí nén sau lưng, khéo léo dùng mỏ hàn điện ghép nối các khối kim loại bằng những tia lửa rực sáng."
            },
            {
                "id": "battery_bunny_bot",
                "name": "Thỏ Pin Năng Lượng Volt",
                "native": "Battery Bunny Volt",
                "title": "Nguồn Điện Sống Siêu Tụ",
                "symbol": "⚡",
                "rarity": "legendary",
                "element": "light",
                "desc": "Bé thỏ robot sở hữu đôi tai pin thủy tinh tích điện phát tia sét vàng óng ả, ngực mang biểu tượng sấm sét tiếp năng lượng cho toàn xưởng (Mascot Bộ Sưu Tập)."
            },
            {
                "id": "gear_box_mimic",
                "name": "Hòm Bánh Răng Tinh Nghịch Geary",
                "native": "Gear Box Mimic",
                "title": "Thùng Phụ Tùng Đáng Yêu",
                "symbol": "⚙️",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chiếc rương kim loại vằn vàng đen ngập tràn lò xo và bánh răng, luôn thè chiếc lưỡi đỏ tươi tắn thích đùa giỡn với các chú robot thợ máy."
            },
            {
                "id": "conveyor_belt_sorter",
                "name": "Robot Băng Tải Phân Loại Convy",
                "native": "Conveyor Sorter Convy",
                "title": "Bộ Điều Hướng Sản Phẩm",
                "symbol": "📦",
                "rarity": "epic",
                "element": "light",
                "desc": "Hệ thống băng chuyền mini thông minh mặt LED cười tít, vận hành nhịp nhàng đẩy các khối pin phát sáng tiến về dây chuyền tiếp theo."
            }
        ]
    },
    {
        "id": "sheet_02_heavy_assembly",
        "chapter_dir": "chapter_02_heavy_assembly",
        "title": "Dây Chuyền Lắp Ráp Tự Động (Heavy Assembly & Automation)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791475362318.jpg",
        "characters": [
            {
                "id": "heavy_loader_titan",
                "name": "Cự Nhân Tay Kẹp Titan",
                "native": "Heavy Loader Titan",
                "title": "Người Khổng Lồ Nâng Tải",
                "symbol": "🏗️",
                "rarity": "epic",
                "element": "earth",
                "desc": "Robot công nghiệp hạng nặng sơn vàng sọc đen, đôi tay gọng kìm thủy lực cực khỏe ôm trọn những kiện hàng thép nặng hàng tấn dễ như trở bàn tay."
            },
            {
                "id": "spider_repair_bot",
                "name": "Nhện Cơ Khí Đa Năng Arachno",
                "native": "Spider Mechanic Arachno",
                "title": "Kỹ Sư Đa Chân Thần Tốc",
                "symbol": "🕷️",
                "rarity": "epic",
                "element": "fire",
                "desc": "Robot nhện 6 chân trắng đỏ trang bị đầy đủ mỏ hàn khò, cờ lê, mũi khoan và hộp dụng cụ, bò linh hoạt vào các góc hẹp xử lý sự cố."
            },
            {
                "id": "magnet_crane_bot",
                "name": "Cần Cẩu Nam Châm Clang",
                "native": "Magnet Crane Clang",
                "title": "Cần Trục Điện Từ Bánh Xích",
                "symbol": "🧲",
                "rarity": "rare",
                "element": "water",
                "desc": "Robot bánh xích xanh lam mang cần cẩu nam châm điện cực mạnh, tạo lực từ hút hàng trăm chiếc bánh răng sắt bay bổng trên không trung."
            },
            {
                "id": "spray_paint_bot",
                "name": "Robot Phun Sơn Sắc Màu Chroma",
                "native": "Spray Painter Chroma",
                "title": "Họa Sĩ Công Nghiệp Rực Rỡ",
                "symbol": "🎨",
                "rarity": "rare",
                "element": "water",
                "desc": "Robot tím trắng mang bình áp lực hóa chất sau lưng, súng phun tạo nên luồng sương màu sắc rực rỡ khoác áo mới cho từng sản phẩm xuất xưởng."
            },
            {
                "id": "optical_scanner_bot",
                "name": "Robot Kính Hiển Vi Iris",
                "native": "Optical Inspector Iris",
                "title": "Chuyên Viên Kiểm Định Thấu Kính",
                "symbol": "🔍",
                "rarity": "rare",
                "element": "light",
                "desc": "Robot hình cầu độc nhãn thấu kính lam ngọc, tay cầm kính lúp và màn hình quét quang học phát hiện từng vết nứt vi mô nhỏ nhất."
            },
            {
                "id": "monowheel_courier",
                "name": "Robot Một Bánh Siêu Tốc Turbo",
                "native": "Monowheel Turbo",
                "title": "Người Vận Chuyển Bão Táp",
                "symbol": "🏎️",
                "rarity": "epic",
                "element": "wind",
                "desc": "Robot chuyển phát nhanh một bánh xe công nghệ cao phát sáng xanh dương, cõng kiện hàng bảo mật phóng đi vèo vèo qua các hành lang nhà máy."
            },
            {
                "id": "hydraulic_press_forge",
                "name": "Máy Dập Thủy Lực Năng Lượng Forge",
                "native": "Hydraulic Press Forge",
                "title": "Cỗ Máy Đúc Thép Plasma",
                "symbol": "💠",
                "rarity": "legendary",
                "element": "light",
                "desc": "Cỗ máy ép thủy lực khổng lồ vận hành bởi 4 trụ plasma phát quang xanh rực rỡ, dập nén tinh hoa kim loại thành những tấm giáp siêu bền."
            },
            {
                "id": "recycler_compactor_bot",
                "name": "Robot Tái Chế Phế Liệu Scrappy",
                "native": "Recycler Scrappy",
                "title": "Cỗ Xe Thu Gom Xanh",
                "symbol": "♻️",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chiếc xe nghiền phế liệu xanh lục mang biểu tượng tái chế, vui vẻ nuốt trọn những đai ốc cũ kỹ để biến chúng thành nguồn nguyên liệu tinh khiết mới."
            },
            {
                "id": "quantum_assembly_hub",
                "name": "Trạm Điều Phối Dây Chuyền Hub",
                "native": "Assembly Matrix Hub",
                "title": "Bộ Não Điều Khiển Trung Tâm",
                "symbol": "🎛️",
                "rarity": "legendary",
                "element": "light",
                "desc": "Trạm điều phối tự động hóa 4 hướng đèn vàng báo hiệu nhịp nhàng, là trái tim điều khiển mọi phân xưởng trong toàn bộ khu phức hợp robot."
            }
        ]
    }
]

def process_and_cut_robot():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/robot"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(ROBOT_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(ROBOT_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(ROBOT_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (18, 18, 22, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_18_robot.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_18_robot.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Robot Factory characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["robot-factory", "cong-xuong", "may-moc"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("robot", link_path)
                print(f"✓ Created symlink {link_name} -> robot")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_robot()
