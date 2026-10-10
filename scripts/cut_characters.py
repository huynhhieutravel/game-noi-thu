import os
import cv2
import numpy as np
from PIL import Image

SHEET_CONFIGS = [
    {
        "id": "sheet_01_classic",
        "title": "Bách Quỷ Linh Giới (Classic Spirits)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791259471310.jpg",
        "characters": [
            {"id": "kasa_obake", "name": "Kasa-Obake", "japanese": "傘お化け", "symbol": "☂️", "rarity": "common", "element": "wind"},
            {"id": "nurikabe", "name": "Nurikabe", "japanese": "塗壁", "symbol": "🧱", "rarity": "common", "element": "earth"},
            {"id": "fukurokuju", "name": "Nurarihyon", "japanese": "滑瓢", "symbol": "👴", "rarity": "rare", "element": "spirit"},
            {"id": "aka_oni", "name": "Aka Oni", "japanese": "赤鬼", "symbol": "👹", "rarity": "uncommon", "element": "fire"},
            {"id": "azuki_arai", "name": "Azuki-Arai", "japanese": "小豆洗い", "symbol": "🥣", "rarity": "common", "element": "water"},
            {"id": "konaki_jiji", "name": "Konaki-Jiji", "japanese": "子泣き爺", "symbol": "👶", "rarity": "uncommon", "element": "earth"},
            {"id": "sunakake_baba", "name": "Sunakake-Baba", "japanese": "砂かけ婆", "symbol": "🌪️", "rarity": "uncommon", "element": "earth"},
            {"id": "zashiki_warashi", "name": "Zashiki-Warashi", "japanese": "座敷童子", "symbol": "👧", "rarity": "rare", "element": "spirit"},
            {"id": "keukegen", "name": "Keukegen", "japanese": "毛羽毛現", "symbol": "🦠", "rarity": "common", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_02_ocean",
        "title": "Thủy Quái Hải Giới (Ocean Yokai)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791259471350.jpg",
        "characters": [
            {"id": "umibozu", "name": "Umibozu", "japanese": "海坊主", "symbol": "🌊", "rarity": "rare", "element": "water"},
            {"id": "funayurei", "name": "Funayurei", "japanese": "船幽霊", "symbol": "🛶", "rarity": "uncommon", "element": "water"},
            {"id": "samebito", "name": "Samebito", "japanese": "鮫人", "symbol": "🦈", "rarity": "uncommon", "element": "water"},
            {"id": "same_ronin", "name": "Same Ronin", "japanese": "鮫浪人", "symbol": "⚔️", "rarity": "rare", "element": "water"},
            {"id": "ningyo", "name": "Ningyo", "japanese": "人魚", "symbol": "🧜‍♀️", "rarity": "rare", "element": "water"},
            {"id": "sazae_oni", "name": "Sazae-Oni", "japanese": "栄螺鬼", "symbol": "🐚", "rarity": "uncommon", "element": "water"},
            {"id": "tako_hachimaki", "name": "Akakage Tako", "japanese": "赤影蛸", "symbol": "🐙", "rarity": "common", "element": "water"},
            {"id": "suiryu", "name": "Suiryu", "japanese": "水竜", "symbol": "🐉", "rarity": "epic", "element": "water"},
            {"id": "namazu", "name": "O-Namazu", "japanese": "大鯰", "symbol": "🐟", "rarity": "epic", "element": "earth"}
        ]
    },
    {
        "id": "sheet_03_night",
        "title": "U Linh Đêm Trăng (Night & Ice Yokai)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791259471360.jpg",
        "characters": [
            {"id": "jorogumo", "name": "Jorogumo", "japanese": "絡新婦", "symbol": "🕷️", "rarity": "rare", "element": "spirit"},
            {"id": "tsuchigumo", "name": "Tsuchigumo", "japanese": "土蜘蛛", "symbol": "🕸️", "rarity": "epic", "element": "earth"},
            {"id": "hone_onna", "name": "Hone-Onna", "japanese": "骨女", "symbol": "💀", "rarity": "rare", "element": "spirit"},
            {"id": "ubume", "name": "Ubume", "japanese": "姑獲鳥", "symbol": "🦅", "rarity": "uncommon", "element": "wind"},
            {"id": "yuki_onna", "name": "Yuki-Onna", "japanese": "雪女", "symbol": "❄️", "rarity": "epic", "element": "water"},
            {"id": "yama_uba", "name": "Yama-Uba", "japanese": "山姥", "symbol": "🌿", "rarity": "uncommon", "element": "earth"},
            {"id": "noppera_bo", "name": "Noppera-bo", "japanese": "野箆坊", "symbol": "👤", "rarity": "common", "element": "spirit"},
            {"id": "kuchisake_onna", "name": "Kuchisake-Onna", "japanese": "口裂け女", "symbol": "✂️", "rarity": "epic", "element": "spirit"},
            {"id": "kage_onna", "name": "Kage-Onna", "japanese": "影女", "symbol": "👥", "rarity": "rare", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_04_forest",
        "title": "Tinh Linh Rừng Thiêng (Forest Spirits)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791260433817.jpg",
        "characters": [
            {"id": "kijimuna", "name": "Kijimuna", "japanese": "キジムナー", "symbol": "🌿", "rarity": "uncommon", "element": "earth"},
            {"id": "amabie", "name": "Amabie", "japanese": "アマビエ", "symbol": "🧜‍♀️", "rarity": "rare", "element": "water"},
            {"id": "tsuchinoko_kawa", "name": "Tsuchinoko Cỏ", "japanese": "ツチノコ", "symbol": "🐍", "rarity": "common", "element": "earth"},
            {"id": "kawauso", "name": "Kawauso", "japanese": "獺", "symbol": "🦦", "rarity": "common", "element": "water"},
            {"id": "jubokko", "name": "Jubokko", "japanese": "樹木子", "symbol": "🪵", "rarity": "epic", "element": "earth"},
            {"id": "tatarimokke", "name": "Tatarimokke", "japanese": "祟り目気", "symbol": "🦉", "rarity": "uncommon", "element": "spirit"},
            {"id": "makura_gaeshi", "name": "Makura-Gaeshi", "japanese": "枕返し", "symbol": "🛏️", "rarity": "common", "element": "spirit"},
            {"id": "ao_kaachoo", "name": "Aoi Tori", "japanese": "青火鳥", "symbol": "🐦", "rarity": "rare", "element": "fire"},
            {"id": "obake_shita", "name": "Obake Shita", "japanese": "お化け舌", "symbol": "👻", "rarity": "common", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_05_guardians",
        "title": "Bách Quỷ Dị Thú (Folklore Guardians)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791260433866.jpg",
        "characters": [
            {"id": "aka_oni_kanabo", "name": "Aka Oni Thần Chùy", "japanese": "金棒赤鬼", "symbol": "👹", "rarity": "rare", "element": "fire"},
            {"id": "kappa_cucumber", "name": "Kappa Dưa Leo", "japanese": "河童", "symbol": "🥒", "rarity": "common", "element": "water"},
            {"id": "nekomata_calico", "name": "Nekomata Tam Thể", "japanese": "三毛猫又", "symbol": "🐱", "rarity": "rare", "element": "spirit"},
            {"id": "kamaitachi", "name": "Kamaitachi", "japanese": "窮奇", "symbol": "🦡", "rarity": "epic", "element": "wind"},
            {"id": "tsuchinoko_chua", "name": "Tsuchinoko Tinh Anh", "japanese": "ツチノコ王", "symbol": "🐍", "rarity": "uncommon", "element": "earth"},
            {"id": "ittan_momen", "name": "Ittan-Momen", "japanese": "一反木綿", "symbol": "🧣", "rarity": "common", "element": "wind"},
            {"id": "mokumokuren", "name": "Mokumokuren", "japanese": "目目連", "symbol": "🚪", "rarity": "uncommon", "element": "spirit"},
            {"id": "rokurokubi", "name": "Rokurokubi", "japanese": "ろくろ首", "symbol": "👘", "rarity": "rare", "element": "spirit"},
            {"id": "futakuchi_onna", "name": "Futakuchi-Onna", "japanese": "二口女", "symbol": "👄", "rarity": "epic", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_06_oddities",
        "title": "Kỳ Dị Đa Nhãn (Mystic Eyes & Oddities)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791260434150.jpg",
        "characters": [
            {"id": "tenome", "name": "Tenome", "japanese": "手の目", "symbol": "🤲", "rarity": "rare", "element": "spirit"},
            {"id": "dodomeki", "name": "Dodomeki", "japanese": "百々目鬼", "symbol": "👁️", "rarity": "epic", "element": "spirit"},
            {"id": "hyakume", "name": "Hyakume", "japanese": "百目", "symbol": "🧿", "rarity": "rare", "element": "spirit"},
            {"id": "shirime", "name": "Shirime", "japanese": "尻目", "symbol": "🍑", "rarity": "common", "element": "spirit"},
            {"id": "jinmenju", "name": "Jinmenju", "japanese": "人面樹", "symbol": "🌳", "rarity": "uncommon", "element": "earth"},
            {"id": "kudan", "name": "Kudan", "japanese": "件", "symbol": "🐂", "rarity": "epic", "element": "spirit"},
            {"id": "ippon_datara", "name": "Ippon-Datara", "japanese": "一本だたら", "symbol": "🔨", "rarity": "rare", "element": "fire"},
            {"id": "tsurube_otoshi", "name": "Tsurube-Otoshi", "japanese": "釣瓶落", "symbol": "🪣", "rarity": "uncommon", "element": "earth"},
            {"id": "daidarabotchi", "name": "Daidarabotchi", "japanese": "ダイダラボッチ", "symbol": "⛰️", "rarity": "epic", "element": "earth"}
        ]
    },
    {
        "id": "sheet_07_tsukumogami",
        "title": "Cổ Vật Khởi Linh (Tsukumogami Artifacts)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791260434182.jpg",
        "characters": [
            {"id": "biwa_bokuboku", "name": "Biwa-Bokuboku", "japanese": "琵琶牧々", "symbol": "🪕", "rarity": "uncommon", "element": "wind"},
            {"id": "koto_furunushi", "name": "Koto-Furunushi", "japanese": "琴古主", "symbol": "🎼", "rarity": "uncommon", "element": "wind"},
            {"id": "kosode_te_cat", "name": "Kosode-Neko", "japanese": "小袖の手", "symbol": "🧶", "rarity": "common", "element": "spirit"},
            {"id": "bakezori", "name": "Bakezori", "japanese": "化け草履", "symbol": "🩴", "rarity": "common", "element": "earth"},
            {"id": "suzuribako", "name": "Suzuribako", "japanese": "鳥心硯箱", "symbol": "👝", "rarity": "rare", "element": "spirit"},
            {"id": "ungaikyo", "name": "Ungaikyo", "japanese": "雲外鏡", "symbol": "🪞", "rarity": "rare", "element": "spirit"},
            {"id": "makimono_obake", "name": "Makimono-Obake", "japanese": "巻物お化け", "symbol": "📜", "rarity": "common", "element": "wind"},
            {"id": "shoujo_ningyo", "name": "Karakuri Maiden", "japanese": "多手傀儡", "symbol": "🎎", "rarity": "epic", "element": "spirit"},
            {"id": "kameosa", "name": "Kameosa", "japanese": "瓶長", "symbol": "🏺", "rarity": "rare", "element": "water"}
        ]
    },
    {
        "id": "sheet_08_beasts",
        "title": "Thần Thú Thụy Thú (Sacred & Mythical Beasts)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791260434200.jpg",
        "characters": [
            {"id": "raiju", "name": "Raiju", "japanese": "雷獣", "symbol": "⚡", "rarity": "epic", "element": "wind"},
            {"id": "baku", "name": "Baku", "japanese": "獏", "symbol": "🐘", "rarity": "rare", "element": "spirit"},
            {"id": "nue", "name": "Nue", "japanese": "鵺", "symbol": "🐯", "rarity": "legendary", "element": "earth"},
            {"id": "inari_kitsune", "name": "Inari Kitsune", "japanese": "稲荷狐", "symbol": "🦊", "rarity": "rare", "element": "fire"},
            {"id": "tabi_shiba", "name": "Tabi Shiba", "japanese": "旅犬神", "symbol": "🐕", "rarity": "common", "element": "earth"},
            {"id": "sarugami", "name": "Sarugami", "japanese": "猿神", "symbol": "🐒", "rarity": "uncommon", "element": "wind"},
            {"id": "basan", "name": "Basan", "japanese": "波山", "symbol": "🐓", "rarity": "rare", "element": "fire"},
            {"id": "aosagibi_heron", "name": "Aosagibi", "japanese": "青鷺火", "symbol": "🪶", "rarity": "epic", "element": "water"},
            {"id": "hakutaku", "name": "Hakutaku", "japanese": "白澤", "symbol": "🦄", "rarity": "legendary", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_09_tricksters",
        "title": "Bách Quỷ Huyễn Biến (Mystic Tricksters)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791263107125.jpg",
        "characters": [
            {"id": "saru_goku", "name": "Saru Shin", "japanese": "猿神猴", "symbol": "🐒", "rarity": "rare", "element": "wind"},
            {"id": "komainu", "name": "Komainu", "japanese": "狛犬", "symbol": "🦁", "rarity": "rare", "element": "earth"},
            {"id": "hitotsume_nyudo", "name": "Hitotsume-Nyudo", "japanese": "一つ目入道", "symbol": "🔨", "rarity": "uncommon", "element": "spirit"},
            {"id": "tengu_peeker", "name": "Ki-no-Ko Tengu", "japanese": "木の隠天狗", "symbol": "👺", "rarity": "common", "element": "wind"},
            {"id": "karasu_hime", "name": "Karasu Hime", "japanese": "烏天狗姫", "symbol": "🪶", "rarity": "epic", "element": "wind"},
            {"id": "kamikiri", "name": "Kamikiri", "japanese": "髪切り", "symbol": "✂️", "rarity": "uncommon", "element": "wind"},
            {"id": "suiseichu", "name": "Suiseichu", "japanese": "水生蟲", "symbol": "🦀", "rarity": "common", "element": "water"},
            {"id": "bake_danuki", "name": "Bake-Danuki", "japanese": "化け狸", "symbol": "🦝", "rarity": "rare", "element": "earth"},
            {"id": "kage_boshi", "name": "Kageboshi", "japanese": "影法師", "symbol": "👤", "rarity": "uncommon", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_10_urban",
        "title": "Dị Văn Đô Thị (Urban Legends)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791263107407.jpg",
        "characters": [
            {"id": "hanako_san", "name": "Hanako-san", "japanese": "花子さん", "symbol": "🚪", "rarity": "rare", "element": "spirit"},
            {"id": "aka_manto", "name": "Aka Manto", "japanese": "赤マント", "symbol": "🧣", "rarity": "uncommon", "element": "fire"},
            {"id": "teke_teke", "name": "Teke-Teke", "japanese": "テケテケ", "symbol": "🏃‍♀️", "rarity": "rare", "element": "spirit"},
            {"id": "hachishakusama", "name": "Hachishakusama", "japanese": "八尺様", "symbol": "👒", "rarity": "epic", "element": "spirit"},
            {"id": "jinmenken", "name": "Jinmenken", "japanese": "人面犬", "symbol": "🐶", "rarity": "common", "element": "earth"},
            {"id": "kage_nyoro", "name": "Nyoro-Ghost", "japanese": "にょろ霊", "symbol": "👻", "rarity": "common", "element": "spirit"},
            {"id": "shiro_fujin", "name": "Shiro Fujin", "japanese": "白夫人", "symbol": "💃", "rarity": "rare", "element": "spirit"},
            {"id": "kyuubi_kitsune", "name": "Kyuubi Kitsune", "japanese": "九尾狐", "symbol": "🦊", "rarity": "legendary", "element": "fire"},
            {"id": "turbo_baba", "name": "Turbo Baba", "japanese": "ターボばあちゃん", "symbol": "👵", "rarity": "epic", "element": "wind"}
        ]
    },
    {
        "id": "sheet_11_flames",
        "title": "Hỏa Vũ Thần Linh (Elemental Flames)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791263107446.jpg",
        "characters": [
            {"id": "enenra", "name": "Enenra", "japanese": "煙々羅", "symbol": "💨", "rarity": "uncommon", "element": "fire"},
            {"id": "amefuri_kozo", "name": "Amefuri-Kozo", "japanese": "雨降小僧", "symbol": "🌧️", "rarity": "common", "element": "water"},
            {"id": "teru_teru_bozu", "name": "Teru Teru Bozu", "japanese": "照る照る坊主", "symbol": "☀️", "rarity": "common", "element": "wind"},
            {"id": "kodama_fire", "name": "Kahi Kodama", "japanese": "火木霊", "symbol": "🔥", "rarity": "uncommon", "element": "fire"},
            {"id": "wanyuudo", "name": "Wanyuudo", "japanese": "輪入道", "symbol": "☸️", "rarity": "rare", "element": "fire"},
            {"id": "kasha_neko", "name": "Kasha Neko", "japanese": "火車猫", "symbol": "🐈‍⬛", "rarity": "epic", "element": "fire"},
            {"id": "hi_no_tori", "name": "Hi-no-Tori", "japanese": "火の鳥", "symbol": "🦚", "rarity": "epic", "element": "fire"},
            {"id": "karasu_purple", "name": "Shiden Karasu", "japanese": "紫電烏", "symbol": "🦅", "rarity": "rare", "element": "spirit"},
            {"id": "oboroguruma", "name": "Oboroguruma", "japanese": "朧車", "symbol": "🏮", "rarity": "rare", "element": "spirit"}
        ]
    },
    {
        "id": "sheet_12_bosses",
        "title": "Bách Quỷ Bá Vương (Supreme Lords & Bosses)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/9a596ee4-6028-4cb7-ae0f-48fd01a267fe/.user_uploaded/media_1791263107476.jpg",
        "characters": [
            {"id": "yamata_no_orochi_boss", "name": "Yamata-no-Orochi", "japanese": "八岐大蛇", "symbol": "🐉", "rarity": "legendary", "element": "water"},
            {"id": "ryujin_pearl", "name": "Ryujin Long Vương", "japanese": "龍神", "symbol": "🌊", "rarity": "legendary", "element": "water"},
            {"id": "shuten_doji", "name": "Shuten-Doji", "japanese": "酒呑童子", "symbol": "👹", "rarity": "legendary", "element": "fire"},
            {"id": "onmyo_samurai", "name": "Kigetsu Samurai", "japanese": "鬼月侍", "symbol": "⚔️", "rarity": "epic", "element": "spirit"},
            {"id": "omukade", "name": "Omukade", "japanese": "大百足", "symbol": "🐛", "rarity": "epic", "element": "earth"},
            {"id": "ushi_oni", "name": "Ushi-Oni Gyuki", "japanese": "牛鬼", "symbol": "🐂", "rarity": "epic", "element": "water"},
            {"id": "fujin_god", "name": "Fujin Phong Thần", "japanese": "風神", "symbol": "🌪️", "rarity": "legendary", "element": "wind"},
            {"id": "raijin_god", "name": "Raijin Lôi Thần", "japanese": "雷神", "symbol": "⚡", "rarity": "legendary", "element": "fire"},
            {"id": "enma_daio", "name": "Enma Dai-O", "japanese": "閻魔大王", "symbol": "👑", "rarity": "legendary", "element": "spirit"}
        ]
    }
]

def process_and_cut():
    output_chars_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/yokai/characters"
    output_sheets_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/yokai/sheets"
    os.makedirs(output_chars_dir, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(SHEET_CONFIGS):
        chapter_sub = f"chapter_{sheet_idx+1:02d}_{sheet['id'].replace('sheet_', '')}"
        chapter_chars_dir = os.path.join(output_chars_dir, chapter_sub)
        os.makedirs(chapter_chars_dir, exist_ok=True)
        print(f"\n[{sheet_idx+1}/{len(SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_sub}...")
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
            final_img.save(os.path.join(output_chars_dir, char_filename))

            all_cutouts.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['japanese']}) -> {char_filename}")

    # Generate preview montage of all 72 cutouts (8 rows x 9 columns)
    cols = 9
    rows = len(SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (18, 20, 32, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_108_yokai.png")
    montage.save(montage_path)
    print(f"\n✨ Successfully sliced all {len(all_cutouts)} Yokai cutouts! Complete montage: {montage_path}")

if __name__ == "__main__":
    process_and_cut()

