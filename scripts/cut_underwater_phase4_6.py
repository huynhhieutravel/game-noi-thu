import os
import cv2
import numpy as np
from PIL import Image

UNDERWATER_PHASE4_6_CONFIGS = [
    {
        "id": "sheet_04_swift_currents",
        "chapter_dir": "chapter_04_swift_currents",
        "title": "Hải Lưu Thần Tốc (Ocean Currents & Swift Swimmers)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791473172350.jpg",
        "characters": [
            {
                "id": "royal_marlin",
                "name": "Cá Cờ Hoàng Gia Marlin",
                "native": "Royal Marlin",
                "title": "Mũi Giáo Biển Khơi",
                "symbol": "🐟",
                "rarity": "legendary",
                "element": "water",
                "desc": "Cá cờ hoàng kim lướt nhanh như tên bắn qua các luồng hải lưu xiết, dẫn đầu đội kỵ binh bảo vệ vùng biển lãnh hải."
            },
            {
                "id": "winged_flying_fish",
                "name": "Cá Chuồn Cánh Bướm Tobi",
                "native": "Tobi the Flyer",
                "title": "Sứ Giả Vượt Sóng",
                "symbol": "🦋",
                "rarity": "epic",
                "element": "wind",
                "desc": "Chú cá chuồn mang đôi cánh phát sáng cầu vồng, đeo cuộn thư liên lạc thắt nơ đỏ bay lượn trên mặt sóng truyền tin khẩn cấp."
            },
            {
                "id": "barracuda_hunter",
                "name": "Cá Nhồng Săn Mồi Cuda",
                "native": "Cuda the Hunter",
                "title": "Sát Thủ Tia Chớp",
                "symbol": "🦈",
                "rarity": "epic",
                "element": "water",
                "desc": "Chiến binh cá nhồng vằn với hàm răng sắc nhọn như dao cạo, thoắt ẩn thoắt hiện trong các dòng nước xoáy để phục kích kẻ địch."
            },
            {
                "id": "thunder_eel",
                "name": "Lươn Điện Lôi Thần Volt",
                "native": "Volt the Thunder Eel",
                "title": "Lôi Điện Biển Sâu",
                "symbol": "⚡",
                "rarity": "epic",
                "element": "fire",
                "desc": "Lươn điện cổ xưa mình quấn những dải sét hoàng kim chói lòa, phóng ra nguồn năng lượng điện trường làm tê liệt mọi hiểm nguy."
            },
            {
                "id": "remora_scout",
                "name": "Cá Ép Giác Hút Remi",
                "native": "Remi the Clinger",
                "title": "Thám Tử Bám Mạn",
                "symbol": "🐟",
                "rarity": "common",
                "element": "water",
                "desc": "Chú cá ép tinh nghịch đội đĩa giác hút trên đầu, chuyên bám theo các loài cá voi khổng lồ để khám phá những vùng biển mới lạ."
            },
            {
                "id": "neon_sailfish",
                "name": "Cá Buồm Dạ Quang Zephyr",
                "native": "Neon Sailfish",
                "title": "Cánh Buồm Cầu Vồng",
                "symbol": "⛵",
                "rarity": "rare",
                "element": "wind",
                "desc": "Cá buồm lộng lẫy với vây lưng tím hồng phát quang như ngọn lửa cực quang, xé gió phi thân vượt qua những ngọn sóng dữ."
            },
            {
                "id": "deep_water_beetle",
                "name": "Bọ Nước Giáp Vàng Scarab",
                "native": "Abyssal Diving Beetle",
                "title": "Thiết Giáp Tí Hon",
                "symbol": "🪲",
                "rarity": "rare",
                "element": "earth",
                "desc": "Bọ cánh cứng thợ lặn mình khoác giáp vàng nạm ngọc xanh, có khả năng lặn xuống những khe nứt sâu nhất dưới đáy đại dương."
            },
            {
                "id": "vortex_conch_cannon",
                "name": "Pháo Xoáy Vỏ Ốc Maelstrom",
                "native": "Maelstrom Conch Cannon",
                "title": "Hỏa Lực Thủy Triều",
                "symbol": "🐚",
                "rarity": "rare",
                "element": "water",
                "desc": "Cỗ đại pháo vỏ ốc xà cừ ngọc đặt trên bệ xe san hô, bắn ra những cột xoáy nước khổng lồ chặn đứng các cuộc xâm lược."
            },
            {
                "id": "coral_arch_portal",
                "name": "Cổng Hải Lưu San Hô",
                "native": "Currents Coral Arch",
                "title": "Cổng Tốc Hành Atlantis",
                "symbol": "🌀",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Cánh cổng vòm kết từ san hô đỏ và đá ngọc bích, bên trong là dòng xoáy không gian giúp di chuyển tức thời giữa các hải vực."
            }
        ]
    },
    {
        "id": "sheet_05_luminous_abyss",
        "chapter_dir": "chapter_05_luminous_abyss",
        "title": "Kỳ Quan Phát Quang (Bioluminescent Abyss & Tiny Wonders)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791473172382.jpg",
        "characters": [
            {
                "id": "pink_axolotl",
                "name": "Khủng Long Nước Axie",
                "native": "Baby Axolotl",
                "title": "Tiểu Long Nước Ngọt Ngào",
                "symbol": "🦎",
                "rarity": "legendary",
                "element": "water",
                "desc": "Bé kỳ giông nước hồng đáng yêu với mang ngoài xòe rộng như cánh hoa, luôn mỉm cười mang lại may mắn và bình yên cho muôn loài."
            },
            {
                "id": "dumbo_starry_octopus",
                "name": "Bạch Tuộc Tai Voi Dumbo",
                "native": "Starry Dumbo",
                "title": "Tinh Tú Đáy Sâu",
                "symbol": "🐙",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Chú bạch tuộc tai voi tí hon có làn da lấp lánh dải ngân hà, vẫy đôi tai nhỏ bơi lơ lửng giữa bóng tối huyền bí vực sâu."
            },
            {
                "id": "glass_squid",
                "name": "Mực Thủy Tinh Pha Lê Lumi",
                "native": "Crystal Glass Squid",
                "title": "Pha Lê Sống Động",
                "symbol": "🦑",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Mực trong suốt như pha lê lấp lánh ánh kim cương, cơ thể phản chiếu ánh sáng huyền ảo khiến kẻ săn mồi không thể phát hiện."
            },
            {
                "id": "sea_angel_clione",
                "name": "Thiên Thần Biển Clione",
                "native": "Sea Angel Clione",
                "title": "Băng Linh Cực Bắc",
                "symbol": "👼",
                "rarity": "epic",
                "element": "water",
                "desc": "Sinh vật tí hon với đôi cánh phát quang trong suốt và trái tim đỏ rực, bay lượn nhẹ nhàng như một thiên thần giữa làn nước giá buốt."
            },
            {
                "id": "rainbow_jellyfish",
                "name": "Sứa Cầu Vồng Quang Phổ",
                "native": "Prismatic Jelly",
                "title": "Ảo Ảnh Cung Đình",
                "symbol": "🪼",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Nàng sứa phát ra luồng ánh sáng neon bảy sắc huyền ảo, nhịp thở nhịp nhàng thắp sáng cả một góc trời biển sâu."
            },
            {
                "id": "leafy_seadragon",
                "name": "Hải Long Lá Lục Diệp",
                "native": "Leafy Seadragon",
                "title": "Ẩn Sĩ Rừng Rong Biển",
                "symbol": "🐉",
                "rarity": "rare",
                "element": "earth",
                "desc": "Hải long tuyệt đẹp khoác lên mình những chiếc lá rong biển xanh rực rỡ, ngụy trang hoàn mỹ giữa rừng tảo biển thần tiên."
            },
            {
                "id": "coral_isopod",
                "name": "Bọ Chân Giống San Hô Iso",
                "native": "Giant Coral Isopod",
                "title": "Kẻ Lữ Hành Đáy Vực",
                "symbol": "🦐",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú bọ biển khổng lồ mang trên lưng cả một khu vườn hải quỳ và san hô phát quang rực rỡ, chậm rãi dạo bước dưới đáy biển."
            },
            {
                "id": "luminous_angler",
                "name": "Cá Lồng Đèn Tinh Dạ Angly",
                "native": "Starlight Anglerfish",
                "title": "Ngọn Đèn Đêm Vực Thẳm",
                "symbol": "🐟",
                "rarity": "rare",
                "element": "spirit",
                "desc": "Cá lồng đèn mắt to ngộ nghĩnh mang chiếc cần câu phát sáng vàng rực, vừa dẫn lối cho bạn bè vừa xua tan bóng tối u uất."
            },
            {
                "id": "anemone_pearl_flower",
                "name": "Đóa Sen San Hô Dạ Minh",
                "native": "Bioluminescent Anemone Lotus",
                "title": "Hoa Thiêng Đáy Biển",
                "symbol": "🪷",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Bông hoa hải quỳ hình sen nở rộ với nhụy là viên dạ minh châu tỏa ánh hào quang xoa dịu mọi vết thương của muôn loài."
            }
        ]
    },
    {
        "id": "sheet_06_abyssal_sovereigns",
        "chapter_dir": "chapter_06_abyssal_sovereigns",
        "title": "Đế Vương Biển Sâu (Supreme Sovereigns & Ancient Leviathans)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791473172407.jpg",
        "characters": [
            {
                "id": "kraken_overlord",
                "name": "Bá Vương Bạch Tuộc Cthulhu",
                "native": "Kraken Overlord",
                "title": "Chúa Tể Vực Thẳm Hư Không",
                "symbol": "🐙",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Bá vương bạch tuộc hắc ám đội vương miện hoàng kim nạm hồng ngọc, đôi mắt phát quang ma mị thống trị tầng sâu nhất của đại dương."
            },
            {
                "id": "archmage_cuttlefish",
                "name": "Đại Giáo Trưởng Mực Nang Sepia",
                "native": "Grand Archmage Sepia",
                "title": "Đức Giáo Hoàng Biển Sâu",
                "symbol": "🦑",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Bậc thánh nhân mực nang đội mũ tế lễ trắng viền vàng, tay nắm trượng đinh ba ngọc trai nắm giữ toàn bộ giáo điều cổ xưa của Atlantis."
            },
            {
                "id": "orca_admiral",
                "name": "Đô Đốc Cá Voi Sát Thủ Orca",
                "native": "Admiral Orca",
                "title": "Hạm Trưởng Hùng Cường",
                "symbol": "🐋",
                "rarity": "legendary",
                "element": "water",
                "desc": "Đô đốc cá voi sát thủ dũng mãnh đội vương miện chiến binh, khoác áo choàng hoàng gia chỉ huy hạm đội vô địch bảo vệ bờ cõi."
            },
            {
                "id": "hammerhead_warlord",
                "name": "Đại Tướng Cá Mập Đầu Búa Tiburo",
                "native": "Warlord Hammerhead",
                "title": "Thiết Đầu Chiến Tướng",
                "symbol": "🦈",
                "rarity": "epic",
                "element": "water",
                "desc": "Chiến tướng cá mập đầu búa dũng cảm khoác giáp ngọc, tay cầm kích vàng uy dũng trấn thủ cửa ải xung yếu của vương triều."
            },
            {
                "id": "sea_naga_empress",
                "name": "Nữ Hoàng Xà Long Tethys",
                "native": "Empress Tethys",
                "title": "Mẫu Nghi Đại Dương",
                "symbol": "🐍",
                "rarity": "legendary",
                "element": "water",
                "desc": "Nữ hoàng rồng rắn biển tuyệt mỹ với vương miện vàng nạm ngọc trai, dải lụa tiên bồng bềnh mang vẻ đẹp uy nghiêm vĩnh hằng."
            },
            {
                "id": "cosmic_sorcerer_squid",
                "name": "Phù Thủy Tinh Vân Calamari",
                "native": "Cosmic Sorcerer Squid",
                "title": "Chiêm Tinh Gia Đại Ngàn",
                "symbol": "🔮",
                "rarity": "epic",
                "element": "spirit",
                "desc": "Pháp sư mực khoác áo choàng tinh vân vũ trụ huyền bí, tay điều khiển quả cầu ma thuật tím nhìn thấu tương lai của vương quốc."
            },
            {
                "id": "crystal_behemoth",
                "name": "Cự Thú Gai Ngọc Behemoth",
                "native": "Crystal Spire Behemoth",
                "title": "Hộ Vệ Vương Miện Đá",
                "symbol": "🦔",
                "rarity": "epic",
                "element": "earth",
                "desc": "Quái thú khổng lồ toàn thân mọc gai ngọc bích tím đội vương miện cổ, rầm rộ tiến bước như một pháo đài sống kiên cố."
            },
            {
                "id": "sovereign_coral_altar",
                "name": "Bàn Thờ Ngọc Vương Tôn",
                "native": "Sovereign Coral Altar",
                "title": "Ngai Báu San Hô Đỏ",
                "symbol": "👑",
                "rarity": "legendary",
                "element": "earth",
                "desc": "Bàn thờ thánh tích khảm viên hồng ngọc khổng lồ và ngọc trai hoàng gia, nơi cử hành các đại lễ phong vương trang trọng nhất."
            },
            {
                "id": "atlantis_throne",
                "name": "Ngai Vàng Tối Cao Atlantis",
                "native": "Grand Throne of Atlantis",
                "title": "Trọng Tâm Quyền Lực Đại Dương",
                "symbol": "🏛️",
                "rarity": "legendary",
                "element": "spirit",
                "desc": "Ngai vàng đại đế ngự trên thác nước ngọc bích bao quanh bởi san hô đỏ và trân châu nghìn năm, biểu tượng tối thượng của vương triều."
            }
        ]
    }
]

def process_and_cut_phase4_6():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/underwater"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts_phase4_6 = []

    for sheet_idx, sheet in enumerate(UNDERWATER_PHASE4_6_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+4}/6] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
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

            all_cutouts_phase4_6.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['native']}) -> {dest_path}")

    # Build Complete Montage for ALL 54 Characters (6 rows x 9 columns)
    from cut_underwater_characters import UNDERWATER_SHEET_CONFIGS
    all_6_configs = UNDERWATER_SHEET_CONFIGS + UNDERWATER_PHASE4_6_CONFIGS

    cols = 9
    rows = 6
    tile_size = 130
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (6, 18, 32, 255))

    total_idx = 0
    for r, sheet in enumerate(all_6_configs):
        chapter_dir = sheet["chapter_dir"]
        for c, char in enumerate(sheet["characters"]):
            char_path = os.path.join(output_chars_root, chapter_dir, f"{char['id']}.png")
            if os.path.exists(char_path):
                img = Image.open(char_path)
                thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
                x = gap + c * (tile_size + gap)
                y = gap + r * (tile_size + gap)
                montage.paste(thumb, (x, y), thumb)
            total_idx += 1

    montage_path = os.path.join(output_sheets_dir, "preview_all_54_underwater.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_54_underwater.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all 54 Underwater Kingdom characters! Complete preview montage: {montage_path}")

if __name__ == "__main__":
    process_and_cut_phase4_6()
