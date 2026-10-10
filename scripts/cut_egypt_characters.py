import os
import cv2
import numpy as np
from PIL import Image

EGYPT_SHEET_CONFIGS = [
    {
        "id": "sheet_01_gods_nile",
        "chapter_dir": "chapter_01_gods_nile",
        "title": "Chư Thần Sông Nile (Nile Deities)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791271136566.jpg",
        "characters": [
            {"id": "sobek", "name": "Sobek", "title": "Thần Cá Sấu Sông Nile", "symbol": "🐊", "rarity": "rare", "element": "water", "desc": "Chúa tể đầm lầy và dòng nước sông Nile hùng vĩ, bảo hộ mùa màng bội thu."},
            {"id": "hathor", "name": "Hathor", "title": "Nữ Thần Tình Mẫu Tử", "symbol": "🐮", "rarity": "rare", "element": "spirit", "desc": "Nữ thần của niềm vui, âm nhạc và tình mẫu tử dịu dàng mang sừng bò và đĩa mặt trời."},
            {"id": "khnum", "name": "Khnum", "title": "Thần Thợ Gốm Khởi Nguyên", "symbol": "🏺", "rarity": "uncommon", "element": "earth", "desc": "Vị thần đầu cừu dùng bàn xoay gốm nặn ra thể xác và sinh linh của con người."},
            {"id": "taweret", "name": "Taweret", "title": "Nữ Thần Hà Mã Bảo Hộ", "symbol": "🦛", "rarity": "common", "element": "water", "desc": "Hà mã hiền hòa cầm đóa sen hồng xua đuổi tà khí, che chở cho phụ nữ và trẻ nhỏ."},
            {"id": "khepri", "name": "Khepri", "title": "Bọ Hung Mặt Trời Ban Mai", "symbol": "🪲", "rarity": "uncommon", "element": "fire", "desc": "Thần bọ hung linh thiêng đẩy quả cầu mặt trời đỏ rực qua đường chân trời mỗi sớm."},
            {"id": "wepwawet", "name": "Wepwawet", "title": "Sói Thần Mở Đường", "symbol": "🐺", "rarity": "rare", "element": "wind", "desc": "Thần sói sa mạc cầm ngọn giáo vàng dẫn lối quân đội và khai thông mọi nẻo đường."},
            {"id": "serket", "name": "Serket", "title": "Nữ Thần Bò Cạp Sa Mạc", "symbol": "🦂", "rarity": "uncommon", "element": "earth", "desc": "Thiếu nữ mang đuôi bò cạp rực đỏ, nắm giữ bí quyết giải mọi loại nọc độc nguy hiểm."},
            {"id": "wadjet", "name": "Wadjet", "title": "Rắn Hổ Mang Hạ Ai Cập", "symbol": "🐍", "rarity": "common", "element": "fire", "desc": "Thần rắn hổ mang khoác giáp vàng lam bảo hộ vùng đồng bằng và vương quyền Pharaoh."},
            {"id": "horus_young", "name": "Horus Ban Mai", "title": "Linh Ưng Bình Minh", "symbol": "🦅", "rarity": "rare", "element": "wind", "desc": "Cậu bé ưng sải cánh bay lượn trên nền trời xanh, hiện thân của ánh sáng tươi mới."}
        ]
    },
    {
        "id": "sheet_02_sky_stars",
        "chapter_dir": "chapter_02_sky_stars",
        "title": "Vũ Trụ & Trời Sao (Cosmos & Wisdom)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791271136597.jpg",
        "characters": [
            {"id": "amun_ra", "name": "Amun-Ra", "title": "Vua Của Các Vị Thần", "symbol": "👑", "rarity": "legendary", "element": "fire", "desc": "Vua tối cao của các vị thần Ai Cập đội vương miện lông vũ kép và quyền trượng uy nghiêm."},
            {"id": "ptah", "name": "Ptah", "title": "Kiến Trúc Sư Tối Cao", "symbol": "🏛️", "rarity": "rare", "element": "earth", "desc": "Vị thần tạo dựng Memphis mang hình dạng xác ướp tay cầm trượng Djed biểu trưng sự vững bền."},
            {"id": "maat", "name": "Ma'at", "title": "Nữ Thần Chân Lý & Công Lý", "symbol": "🪶", "rarity": "epic", "element": "wind", "desc": "Nàng tiên mang đôi cánh thần và chiếc lông vũ trắng dùng để cân đo tâm hồn nơi cõi chết."},
            {"id": "khonsu", "name": "Khonsu", "title": "Thần Mặt Trăng Du Hành", "symbol": "🌙", "rarity": "epic", "element": "spirit", "desc": "Vị thần trăng khuyết khoác áo choàng ngàn sao, bảo vệ lữ khách đi trong đêm tối sa mạc."},
            {"id": "nut", "name": "Nut", "title": "Nữ Thần Bầu Trời Ngàn Sao", "symbol": "✨", "rarity": "epic", "element": "spirit", "desc": "Mái tóc xanh thẳm lấp lánh muôn vì tinh tú uốn cong ôm trọn cả mặt đất bao la."},
            {"id": "geb", "name": "Geb", "title": "Thần Đất Mẹ Cỏ Cây", "symbol": "🌿", "rarity": "rare", "element": "earth", "desc": "Thần mặt đất thân xanh ngọc bích nằm gối đầu bên bờ sông, nuôi dưỡng vạn vật đâm chồi."},
            {"id": "shu", "name": "Shu", "title": "Thần Không Khí & Ngọn Gió", "symbol": "🌪️", "rarity": "rare", "element": "wind", "desc": "Linh ưng sải cánh tạo nên những làn gió mát lành ngăn cách bầu trời và mặt đất."},
            {"id": "tefnut", "name": "Tefnut", "title": "Nữ Thần Mưa & Ẩm Ướt", "symbol": "💧", "rarity": "rare", "element": "water", "desc": "Nàng sư tử cái hoàng kim rót bình nước thánh xua tan khô hạn của nắng cháy sa mạc."},
            {"id": "thoth", "name": "Thoth", "title": "Thần Trí Tuệ & Pháp Thuật", "symbol": "📜", "rarity": "legendary", "element": "spirit", "desc": "Vị thần đầu chim Cò Quăm nắm giữ toàn bộ kho tàng tri thức, chữ tượng hình và pháp thuật cổ."}
        ]
    },
    {
        "id": "sheet_03_underworld",
        "chapter_dir": "chapter_03_underworld",
        "title": "Minh Giới & Phán Quyết (Underworld & Eternity)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791271136897.jpg",
        "characters": [
            {"id": "isis", "name": "Isis", "title": "Đại Nữ Thần Phù Thủy", "symbol": "🪄", "rarity": "legendary", "element": "spirit", "desc": "Bậc thầy ma pháp vĩ đại nhất Ai Cập, sải đôi cánh sắc màu che chở cho người sống và kẻ khuất."},
            {"id": "horus_pharaoh", "name": "Horus Vương Giả", "title": "Chúa Tể Hai Vùng Đất", "symbol": "⚜️", "rarity": "legendary", "element": "wind", "desc": "Hiện thân thần thánh của các Pharaoh vĩ đại, mang cặp mắt trăng sao nhìn thấu vũ trụ."},
            {"id": "ammit", "name": "Ammit", "title": "Quái Thú Phán Xét", "symbol": "🦁", "rarity": "epic", "element": "earth", "desc": "Quái thú kết hợp đầu cá sấu, thân sư tử và hà mã chuyên trừng phạt linh hồn bất lương."},
            {"id": "aker", "name": "Aker", "title": "Thần Sư Tử Kép Bình Minh", "symbol": "🌅", "rarity": "rare", "element": "earth", "desc": "Sư tử hai đầu quay về hai hướng canh giữ cánh cổng hoàng hôn và đón chào rạng đông."},
            {"id": "uraeus_guard", "name": "Uraeus Hộ Vệ", "title": "Linh Xà Vương Quyền", "symbol": "👑", "rarity": "uncommon", "element": "fire", "desc": "Thần rắn hổ mang cuộn mình trên vương miện sẵn sàng phun lửa thiêu rụi kẻ xâm lăng."},
            {"id": "bastet_shadow", "name": "Bastet An Táng", "title": "Mèo Đen Canh Giữ Hầm Mộ", "symbol": "🐱", "rarity": "rare", "element": "spirit", "desc": "Dáng hình mèo đen bí ẩn tay cầm chìa khóa Ankh canh gác yên bình cho các hầm mộ hoàng gia."},
            {"id": "nephthys", "name": "Nephthys", "title": "Nữ Thần Đêm Tối & An Nghỉ", "symbol": "🕯️", "rarity": "epic", "element": "spirit", "desc": "Vị nữ thần áo trắng tinh khôi giang tay xoa dịu những nỗi đau và dẫn dắt người mất sang cõi vĩnh hằng."},
            {"id": "anubis", "name": "Anubis", "title": "Thần Đầu Chó Dẫn Lối Linh Hồn", "symbol": "⚖️", "rarity": "legendary", "element": "spirit", "desc": "Vị thần nổi tiếng nhất của cõi chết, người ướp xác và canh giữ chiếc cân công lý đo lường trái tim."},
            {"id": "ra_horakhty", "name": "Ra-Horakhty", "title": "Hiện Thân Mặt Trời Chiếu Rọi", "symbol": "☀️", "rarity": "legendary", "element": "fire", "desc": "Mặt trời chói lọi nơi thiên đỉnh mang sức mạnh quang năng xua tan bóng tối hỗn mang."}
        ]
    },
    {
        "id": "sheet_04_mythic_beasts",
        "chapter_dir": "chapter_04_mythic_beasts",
        "title": "Thần Thú Kim Tự Tháp (Mythic Guardians)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791271136971.jpg",
        "characters": [
            {"id": "apophis_chaos", "name": "Apophis Ma Xà", "title": "Hắc Xà Hỗn Mang Đêm Tối", "symbol": "🐍", "rarity": "legendary", "element": "spirit", "desc": "Con rắn bóng tối khổng lồ dưới lòng đất luôn tìm cách nuốt chửng cỗ xe mặt trời của thần Ra."},
            {"id": "bennu_phoenix", "name": "Bennu Hỏa Điểu", "title": "Phượng Hoàng Lửa Vĩnh Cửu", "symbol": "🔥", "rarity": "epic", "element": "fire", "desc": "Loài chim thần thánh tái sinh từ ngọn lửa thiêng, biểu tượng của sự sống bất diệt và chu kỳ thời gian."},
            {"id": "sphinx_pharaoh", "name": "Sphinx Hoàng Đế", "title": "Nhân Sư Kim Tự Tháp", "symbol": "🗿", "rarity": "legendary", "element": "earth", "desc": "Sinh vật uy dũng đầu người mình sư tử oai phong trấn giữ cửa ngõ lăng mộ các bậc đế vương."},
            {"id": "bastet_winged", "name": "Bastet Thánh Miêu", "title": "Mèo Thần Có Cánh", "symbol": "🪽", "rarity": "rare", "element": "wind", "desc": "Mèo trắng mang đôi cánh lông vũ biếc xanh mang lại may mắn, bình an cho mọi gia đình."},
            {"id": "hieracosphinx", "name": "Hieracosphinx", "title": "Ưng Sư Hộ Mộ Cổ", "symbol": "🦅", "rarity": "epic", "element": "wind", "desc": "Quái thú mình sư tử đầu chim ưng dũng mãnh, sở hữu tốc độ phi thường và móng vuốt sắc lẹm."},
            {"id": "serpopard", "name": "Serpopard", "title": "Báo Xà Sa Mạc", "symbol": "🐆", "rarity": "epic", "element": "earth", "desc": "Kỳ thú sa mạc cổ đại mình báo hoa mai cổ rắn hổ mang linh hoạt, biểu trưng cho sự hoang dã khôn lường."},
            {"id": "criosphinx_gold", "name": "Criosphinx Hoàng Kim", "title": "Sư Tử Cánh Vàng Sấm Sét", "symbol": "🦁", "rarity": "epic", "element": "fire", "desc": "Sư tử dũng mãnh mang đôi cánh dát vàng rống vang giữa sa mạc khiến vạn quỷ kinh sợ."},
            {"id": "sphinx_maiden", "name": "Sphinx Thiếu Nữ", "title": "Nhân Sư Cánh Lam Huyền Bí", "symbol": "👧", "rarity": "rare", "element": "spirit", "desc": "Cô bé nhân sư xinh đẹp đáng yêu thích đặt ra những câu đố hóc búa cho những ai đi qua."},
            {"id": "uraeus_titan", "name": "Cự Xà Sa Mạc", "title": "Vua Rắn Hổ Mang Khổng Lồ", "symbol": "🐍", "rarity": "epic", "element": "fire", "desc": "Rắn hổ mang khổng lồ bằng vàng rực lửa, bảo vệ kho báu ngàn năm trong các kim tự tháp sâu thẳm."}
        ]
    },
    {
        "id": "sheet_05_desert_spirits",
        "chapter_dir": "chapter_05_desert_spirits",
        "title": "Linh Hồn Sa Mạc Cổ (Desert Spirits & Totems)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791271136982.jpg",
        "characters": [
            {"id": "apep_shadow", "name": "Apep Vực Thẳm", "title": "U Xà Khí Độc", "symbol": "☠️", "rarity": "legendary", "element": "spirit", "desc": "Hắc xà tỏa ra làn sương độc tím chết chóc, ẩn mình dưới vực thẳm cát nóng chờ thời cơ nổi dậy."},
            {"id": "bennu_chibi", "name": "Bennu Nhỏ", "title": "Hỏa Điểu Ban Mai", "symbol": "🐥", "rarity": "uncommon", "element": "fire", "desc": "Chú chim lửa non mới nở từ đống tro tàn, mang ánh hào quang ấm áp chiếu rọi muôn nơi."},
            {"id": "queen_sphinx", "name": "Sphinx Nữ Vương", "title": "Nhân Sư Nữ Hoàng", "symbol": "👸", "rarity": "epic", "element": "earth", "desc": "Nhân sư mang nụ cười nhân từ của hoàng hậu Ai Cập, bảo hộ hòa bình và nền văn minh thịnh vượng."},
            {"id": "criosphinx_ram", "name": "Criosphinx Bạch Dương", "title": "Nhân Sư Đầu Cừu Amun", "symbol": "🐑", "rarity": "rare", "element": "earth", "desc": "Nhân sư mang đầu cừu đực sừng xoắn linh thiêng của đền Karnak, biểu trưng cho sự sinh sôi nảy nở."},
            {"id": "gryphon_guardian", "name": "Gryphon Ai Cập", "title": "Sứ Giả Bầu Trời Cát Vàng", "symbol": "🪶", "rarity": "rare", "element": "wind", "desc": "Chim ưng mình sư tử khoác khăn choàng Pharaoh Nemes bay tuần tra khắp các ốc đảo xa xôi."},
            {"id": "serpopard_cub", "name": "Báo Sa Mạc Chibi", "title": "Linh Thú Đốm Cát", "symbol": "🐾", "rarity": "common", "element": "earth", "desc": "Bé báo sa mạc cổ dài tinh nghịch thích chơi đùa với những cơn lốc xoáy cát nhỏ."},
            {"id": "falcon_courier", "name": "Ưng Phong Cổ Đại", "title": "Sứ Giả Gió Cát", "symbol": "🌪️", "rarity": "uncommon", "element": "wind", "desc": "Linh ưng mang đôi cánh xanh lam bay nhanh như chớp vượt qua bão cát sa mạc truyền tin vui."},
            {"id": "ba_spirit", "name": "Ba Linh Hồn", "title": "Linh Điểu Tự Do", "symbol": "🕊️", "rarity": "rare", "element": "spirit", "desc": "Linh hồn mang hình dạng chim mặt người bay lượn tự do giữa cõi trần và cõi vĩnh hằng."},
            {"id": "sun_cobra_flame", "name": "Hỏa Xà Lửa Thiêng", "title": "Rắn Lửa Bảo Vệ Vương Miện", "symbol": "🔥", "rarity": "epic", "element": "fire", "desc": "Rắn hổ mang vàng đứng giữa ngọn lửa thiêng, biểu trưng cho ánh sáng bất hoại của vương triều Ai Cập."}
        ]
    }
]

def process_and_cut_egypt():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/egypt"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(EGYPT_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(EGYPT_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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
    rows = len(EGYPT_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (24, 18, 12, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_45_egypt.png")
    montage.save(montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Egypt characters! Preview montage: {montage_path}")

if __name__ == "__main__":
    process_and_cut_egypt()
