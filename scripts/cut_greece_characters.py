import os
import cv2
import numpy as np
from PIL import Image

GREECE_SHEET_CONFIGS = [
    {
        "id": "sheet_01_titans",
        "chapter_dir": "chapter_01_titans",
        "title": "Thời Đại Titan (Titans & Primordial)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791272184065.jpg",
        "characters": [
            {"id": "kronos", "name": "Kronos", "title": "Titan Thời Gian", "symbol": "⏳", "rarity": "legendary", "element": "earth", "desc": "Vua của các Titan cổ đại, người nắm giữ chiếc lưỡi hái vàng kiểm soát dòng chảy thời gian bất tận."},
            {"id": "rhea", "name": "Rhea", "title": "Nữ Hoàng Titan", "symbol": "👑", "rarity": "epic", "element": "earth", "desc": "Mẹ của các vị thần đỉnh Olympus, người bảo hộ sinh sôi nảy nở của muôn loài muôn thú."},
            {"id": "atlas", "name": "Atlas", "title": "Thần Nâng Bầu Trời", "symbol": "🌍", "rarity": "rare", "element": "earth", "desc": "Vị thần khổng lồ gánh vác cả vòm trời tinh tú trên đôi vai vững như bàn thạch ngàn năm."},
            {"id": "prometheus", "name": "Prometheus", "title": "Titan Trao Lửa", "symbol": "🔥", "rarity": "epic", "element": "fire", "desc": "Vị thần nhân từ đã đánh cắp ngọn lửa thiêng từ đỉnh Olympus trao cho nhân loại mang lại ánh sáng văn minh."},
            {"id": "gaia", "name": "Gaia", "title": "Mẹ Đất Mẹ Nguyên Thủy", "symbol": "🌿", "rarity": "legendary", "element": "earth", "desc": "Hiện thân linh thiêng của Đất Mẹ bao la, mái tóc cỏ hoa xanh biếc ôm ấp sự sống toàn cầu."},
            {"id": "oceanus", "name": "Oceanus", "title": "Titan Đại Dương", "symbol": "🌊", "rarity": "rare", "element": "water", "desc": "Dòng sông biển cả nguyên thủy cuồn cuộn bao bọc lấy toàn bộ thế giới cổ đại."},
            {"id": "helios", "name": "Helios", "title": "Thần Mặt Trời Rực Rỡ", "symbol": "☀️", "rarity": "epic", "element": "fire", "desc": "Vị thần mặt trời đội vương miện hào quang lấp lánh lái cỗ xe ngựa lửa qua bầu trời mỗi ngày."},
            {"id": "typhon", "name": "Typhon", "title": "Cuồng Long Tartarus", "symbol": "🐲", "rarity": "legendary", "element": "fire", "desc": "Quái thú cổ đại trăm đầu phun khói lửa hung tợn nhất từng thách thức quyền uy của đỉnh Olympus."},
            {"id": "echidna", "name": "Echidna", "title": "Mẫu Hậu Quái Vật", "symbol": "🐍", "rarity": "rare", "element": "spirit", "desc": "Nửa tiên nữ xinh đẹp nửa quái xà uốn lượn, mẹ của Cerberus, Chimera và muôn loài dị thú."}
        ]
    },
    {
        "id": "sheet_02_heroes",
        "chapter_dir": "chapter_02_heroes",
        "title": "Anh Hùng Sử Thi (Heroes & Legends)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791272184089.jpg",
        "characters": [
            {"id": "heracles", "name": "Heracles", "title": "Dũng Sĩ Héc-quyn", "symbol": "🦁", "rarity": "legendary", "element": "earth", "desc": "Người hùng vĩ đại nhất Hy Lạp khoác tấm da sư tử Nemea, hoàn thành 12 chiến công hiển hách."},
            {"id": "perseus", "name": "Perseus", "title": "Dũng Sĩ Trảm Xà Quỷ", "symbol": "🛡️", "rarity": "epic", "element": "wind", "desc": "Người anh hùng mang kiếm bạc và chiếc khiên Aegis phản chiếu trảm đầu nữ quỷ Medusa."},
            {"id": "theseus", "name": "Theseus", "title": "Dũng Sĩ Vượt Mê Cung", "symbol": "⚔️", "rarity": "rare", "element": "earth", "desc": "Vị vua thành Athens lần theo cuộn chỉ vàng tiến vào mê cung tiêu diệt quái vật Minotaur."},
            {"id": "ares_warrior", "name": "Ares Chiến Binh", "title": "Dũng Sĩ Sparta", "symbol": "🗡️", "rarity": "epic", "element": "fire", "desc": "Chiến binh mang mũ giáp đồng đỏ rực và ngọn giáo nhọn không bao giờ lùi bước trước kẻ thù."},
            {"id": "odysseus", "name": "Odysseus", "title": "Lữ Khách Biển Khơi", "symbol": "🧭", "rarity": "rare", "element": "wind", "desc": "Vị tướng mưu lược với cuộc hành trình 10 năm vượt qua muôn vàn cạm bẫy để trở về quê hương Ithaca."},
            {"id": "jason", "name": "Jason", "title": "Thủ Lĩnh Tàu Argo", "symbol": "✨", "rarity": "rare", "element": "wind", "desc": "Người dẫn đầu 50 anh hùng vượt sóng gió đoạt lấy Bộ Lông Cừu Vàng danh tiếng."},
            {"id": "atalanta", "name": "Atalanta", "title": "Nữ Thợ Săn Thiện Xạ", "symbol": "🏹", "rarity": "uncommon", "element": "earth", "desc": "Nàng thợ săn chạy nhanh như gió được nữ thần Artemis bảo trợ, bắn tên bách phát bách trúng."},
            {"id": "bellerophon", "name": "Bellerophon", "title": "Dũng Sĩ Cưỡi Ngựa Bay", "symbol": "🪽", "rarity": "rare", "element": "wind", "desc": "Người thuần hóa thần mã Pegasus và dùng ngọn giáo diệt trừ quái thú phun lửa Chimera."},
            {"id": "orpheus", "name": "Orpheus", "title": "Thi Sĩ Đàn Hạc Vàng", "symbol": "🎵", "rarity": "epic", "element": "spirit", "desc": "Nghệ sĩ gảy đàn Lyre với tiếng hát lay động muôn thú, đá sỏi và cảm hóa cả vua cõi chết."}
        ]
    },
    {
        "id": "sheet_03_olympus",
        "chapter_dir": "chapter_03_olympus",
        "title": "Chư Thần Đời Sống (Olympian Deities & Hearth)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791272184104.jpg",
        "characters": [
            {"id": "hades", "name": "Hades", "title": "Chúa Tể Minh Giới", "symbol": "👑", "rarity": "legendary", "element": "spirit", "desc": "Vị thần cai quản cõi âm ti trong tà áo choàng đen bí ẩn cầm cây đinh ba hộ mệnh."},
            {"id": "demeter", "name": "Demeter", "title": "Nữ Thần Mùa Màng", "symbol": "🌾", "rarity": "epic", "element": "earth", "desc": "Nữ thần nông nghiệp nâng niu những bông lúa mì vàng óng mang lại no ấm cho thế gian."},
            {"id": "persephone", "name": "Persephone", "title": "Nữ Hoàng Mùa Xuân & Cõi Âm", "symbol": "🌺", "rarity": "epic", "element": "spirit", "desc": "Nàng tiên mang sắc xuân rạng ngời cầm quả lựu đỏ gắn liền với sự chuyển giao bốn mùa."},
            {"id": "hephaestus", "name": "Hephaestus", "title": "Thần Rèn & Ngọn Lửa Thiêng", "symbol": "🔨", "rarity": "rare", "element": "fire", "desc": "Bậc thầy rèn đúc tài hoa tạo nên những món vũ khí thần thánh dưới đáy núi lửa cuồn cuộn."},
            {"id": "dionysus", "name": "Dionysus", "title": "Thần Rượu Vang & Lễ Hội", "symbol": "🍇", "rarity": "uncommon", "element": "water", "desc": "Vị thần vui tươi tóc chùm nho tím luôn mang theo rượu ngon và tiếng cười trong mọi vũ hội."},
            {"id": "hestia", "name": "Hestia", "title": "Nữ Thần Bếp Lửa Gia Đình", "symbol": "🔥", "rarity": "rare", "element": "fire", "desc": "Nữ thần dịu dàng giữ cho ngọn lửa gia đình luôn bập bùng ấm áp và ngập tràn tình yêu thương."},
            {"id": "eros", "name": "Eros", "title": "Thần Tình Yêu Nhỏ", "symbol": "💘", "rarity": "uncommon", "element": "wind", "desc": "Cậu bé thiên thần mang đôi cánh trắng bay lượn bắn những mũi tên tình yêu nhiệm màu."},
            {"id": "nike", "name": "Nike", "title": "Nữ Thần Chiến Thắng", "symbol": "🏆", "rarity": "epic", "element": "wind", "desc": "Vị nữ thần có cánh sải bay mang vòng nguyệt quế vinh quang trao tặng cho những người kiên cường."},
            {"id": "hecate", "name": "Hecate", "title": "Nữ Thần Ma Thuật Đêm Trăng", "symbol": "🔮", "rarity": "legendary", "element": "spirit", "desc": "Nữ thần áo tím tay cầm ngọn đuốc xanh soi sáng những ngã rẽ bí ẩn của pháp thuật cổ xưa."}
        ]
    },
    {
        "id": "sheet_04_monsters",
        "chapter_dir": "chapter_04_monsters",
        "title": "Quái Thú Thần Thoại (Mythical Monsters)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791272184390.jpg",
        "characters": [
            {"id": "medusa", "name": "Medusa", "title": "Nữ Quỷ Tóc Rắn", "symbol": "🐍", "rarity": "legendary", "element": "spirit", "desc": "Mỹ nhân mang mái tóc rắn xanh biếc với ánh nhìn ma mị có thể hóa đá bất kỳ ai nhìn vào mắt nàng."},
            {"id": "minotaur", "name": "Minotaur", "title": "Nhân Ngưu Mê Cung", "symbol": "🐂", "rarity": "epic", "element": "earth", "desc": "Quái vật đầu bò mình người cầm chiếc rìu chiến khổng lồ gầm rú trong mê cung sâu thẳm."},
            {"id": "cerberus", "name": "Cerberus", "title": "Chó Ba Đầu Canh Cửa", "symbol": "🐕", "rarity": "legendary", "element": "fire", "desc": "Thú cưng ba đầu trung thành của thần Hades với vòng gai bảo vệ cánh cổng bước vào cõi âm."},
            {"id": "hydra", "name": "Hydra", "title": "Quái Xà Nhiều Đầu", "symbol": "🐉", "rarity": "epic", "element": "water", "desc": "Mãng xà đầm lầy Lerna mỗi khi bị chém đứt một đầu sẽ mọc lại hai đầu mới hung tợn hơn."},
            {"id": "chimera", "name": "Chimera", "title": "Dị Thú Ba Thể", "symbol": "🦁", "rarity": "epic", "element": "fire", "desc": "Sinh vật kết hợp thân sư tử, đầu dê trên lưng và đuôi rắn độc có khả năng phun ra lửa dữ."},
            {"id": "pegasus", "name": "Pegasus", "title": "Ngựa Thần Có Cánh", "symbol": "🦄", "rarity": "rare", "element": "wind", "desc": "Bạch mã tuyệt đẹp với đôi cánh thiên thần trắng muốt sải cánh tự do trên những tầng mây cao."},
            {"id": "cyclops", "name": "Cyclops", "title": "Khổng Lồ Một Mắt", "symbol": "👁️", "rarity": "rare", "element": "earth", "desc": "Người khổng lồ dũng mãnh chỉ có duy nhất một con mắt giữa trán cầm chày đá tạo nên sấm sét."},
            {"id": "greek_sphinx", "name": "Sphinx Hy Lạp", "title": "Nhân Sư Đố Vui", "symbol": "👧", "rarity": "rare", "element": "wind", "desc": "Nàng nhân sư có cánh vàng đố các lữ khách những câu hỏi trí tuệ trước khi cho qua cổng thành Thebes."},
            {"id": "nemean_lion", "name": "Sư Tử Nemea", "title": "Chúa Tể Mình Đồng Da Sắt", "symbol": "🦁", "rarity": "rare", "element": "earth", "desc": "Mãnh thú bờm vàng với lớp da đao thương bất nhập không một loại vũ khí bình thường nào xuyên thủng."}
        ]
    },
    {
        "id": "sheet_05_fates",
        "chapter_dir": "chapter_05_fates",
        "title": "Minh Giới & Số Mệnh (Fate & Eternity)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791272184400.jpg",
        "characters": [
            {"id": "charon", "name": "Charon", "title": "Người Đưa Đò Sông Styx", "symbol": "🚣", "rarity": "epic", "element": "water", "desc": "Lão chèo đò áo choàng đen cầm chiếc đèn lồng ma quái đưa các linh hồn băng qua dòng sông lạnh giá."},
            {"id": "thanatos", "name": "Thanatos", "title": "Hiện Thân Thần Chết", "symbol": "🪽", "rarity": "legendary", "element": "spirit", "desc": "Thiên thần tóc bạc với đôi cánh đen cầm nhành hoa tím đưa sinh mệnh bước vào giấc ngủ ngàn thu."},
            {"id": "hypnos", "name": "Hypnos", "title": "Thần Giấc Ngủ Êm Đềm", "symbol": "💤", "rarity": "rare", "element": "spirit", "desc": "Vị thần dễ thương nằm ngủ say trên đám mây trắng, mang lại những giấc mộng êm đềm cho trần gian."},
            {"id": "nyx", "name": "Nyx", "title": "Nữ Thần Màn Đêm", "symbol": "🌌", "rarity": "legendary", "element": "spirit", "desc": "Mẹ của màn đêm sâu thẳm mang mái tóc đen huyền lấp lánh trăng sao khiến cả thần Zeus cũng phải kính nể."},
            {"id": "nemesis", "name": "Nemesis", "title": "Nữ Thần Báo Ứng & Công Lý", "symbol": "⚖️", "rarity": "epic", "element": "wind", "desc": "Nữ thần cầm chiếc cân công lý và thanh kiếm trừng phạt nghiêm khắc những kẻ kiêu ngạo quá đà."},
            {"id": "clotho", "name": "Clotho", "title": "Nàng Moirai Quay Sợi Chỉ", "symbol": "🧵", "rarity": "rare", "element": "spirit", "desc": "Nàng tiên thứ nhất trong ba nữ thần Số Mệnh tay cầm cọc quay những sợi chỉ cuộc đời ban đầu."},
            {"id": "lachesis", "name": "Lachesis", "title": "Nàng Moirai Đo Chiều Dài", "symbol": "📏", "rarity": "rare", "element": "spirit", "desc": "Nàng tiên thứ hai trong trang phục tím đo lường chiều dài định mệnh và may rủi của mỗi kiếp người."},
            {"id": "atropos", "name": "Atropos", "title": "Nàng Moirai Cắt Sợi Chỉ", "symbol": "✂️", "rarity": "rare", "element": "spirit", "desc": "Nàng tiên thứ ba mang đóa hoa bỉ ngạn cầm chiếc kéo vàng định đoạt hồi kết của cuộc đời."},
            {"id": "melinoe", "name": "Melinoe", "title": "Nàng Tiên Bóng Đêm", "symbol": "👻", "rarity": "rare", "element": "spirit", "desc": "Linh hồn thiếu nữ tóc xanh ôm đầu lâu trắng được vây quanh bởi những ngọn lửa ma trơi xanh ngọc."}
        ]
    }
]

def process_and_cut_greece():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/greece"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(GREECE_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(GREECE_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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

            all_cutouts.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['title']}) -> {dest_path}")

    # Generate preview montage of all cutouts (5 rows x 9 columns)
    cols = 9
    rows = len(GREECE_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (18, 22, 34, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_45_greece.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Greece characters! Preview montage: {montage_path}")

if __name__ == "__main__":
    process_and_cut_greece()
