import json
import os
import sys

# Add scripts directory to path to import WUXIA_SHEET_CONFIGS
sys.path.append(os.path.dirname(__file__))
from cut_wuxia_characters import WUXIA_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Jianghu Legends
    "bianlian_mask": {"bg": "#2b090c", "primary": "#d90429", "accent": "#ffb703", "glow": "#ff4d6d"},
    "zhaocai_cat": {"bg": "#2c1809", "primary": "#e63946", "accent": "#ffd166", "glow": "#ffeaa7"},
    "bagua_mirror": {"bg": "#101826", "primary": "#3a86ff", "accent": "#8338ec", "glow": "#00f5d4"},
    "feather_fan": {"bg": "#1a162b", "primary": "#7209b7", "accent": "#d4af37", "glow": "#e0aaff"},
    "dragon_carp": {"bg": "#0c2333", "primary": "#0077b6", "accent": "#ffb703", "glow": "#90e0ef"},
    "jade_pixiu": {"bg": "#0b2520", "primary": "#2a9d8f", "accent": "#52b788", "glow": "#80ed99"},
    "fox_swordsman": {"bg": "#320b12", "primary": "#c1121f", "accent": "#fdf0d5", "glow": "#e63946"},
    "wuxia_swordsman": {"bg": "#14213d", "primary": "#1d3557", "accent": "#457b9d", "glow": "#a8dadc"},
    "wuxia_maiden": {"bg": "#2b0e1a", "primary": "#d90429", "accent": "#f72585", "glow": "#ffd166"},

    # Sheet 2: Celestial Realm
    "purple_gold_gourd": {"bg": "#2d1c07", "primary": "#f4a261", "accent": "#ffd166", "glow": "#00f5d4"},
    "flying_sword": {"bg": "#0d2137", "primary": "#0077b6", "accent": "#48cae4", "glow": "#caf0f8"},
    "taoist_talisman": {"bg": "#2a1e09", "primary": "#e76f51", "accent": "#ffd166", "glow": "#00f5d4"},
    "incense_burner": {"bg": "#241429", "primary": "#7209b7", "accent": "#d4af37", "glow": "#c77dff"},
    "jade_rabbit": {"bg": "#0f2820", "primary": "#2a9d8f", "accent": "#e76f51", "glow": "#80ed99"},
    "immortal_crane": {"bg": "#16233b", "primary": "#3a86ff", "accent": "#ffd166", "glow": "#90e0ef"},
    "sacred_lotus_flame": {"bg": "#2e0f1e", "primary": "#d90429", "accent": "#3a86ff", "glow": "#ff758f"},
    "landscape_scroll": {"bg": "#1c2419", "primary": "#588157", "accent": "#d4af37", "glow": "#a3b18a"},
    "chang_e": {"bg": "#2a121d", "primary": "#e63946", "accent": "#ffd166", "glow": "#ffb703"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "spirit": {"bg": "#241a33", "primary": "#7209b7", "accent": "#9d4edd", "glow": "#e0aaff"}
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    wuxia_exists = False
    for col in collections:
        if col["id"] == "wuxia":
            wuxia_exists = True
            col["name"] = "Võ Hiệp & Tiên Cảnh"
            col["japaneseTitle"] = "仙侠・武侠"
            col["themeFolder"] = "wuxia"
            col["description"] = "Bộ sưu tập pháp bảo thần thoại, linh thú tiên gia và kiếm khách giang hồ Trung Hoa."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "wuxia_swordsman"

    if not wuxia_exists:
        collections.append({
            "id": "wuxia",
            "name": "Võ Hiệp & Tiên Cảnh",
            "japaneseTitle": "仙侠・武侠",
            "themeFolder": "wuxia",
            "description": "Bộ sưu tập pháp bảo thần thoại, linh thú tiên gia và kiếm khách giang hồ Trung Hoa.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "wuxia_swordsman"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Wuxia collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing wuxia characters for clean re-registration
    characters = [c for c in characters if c.get("collection") != "wuxia"]

    added_count = 0
    for sheet_idx, sheet in enumerate(WUXIA_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            chinese_name = char.get("chinese", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["spirit"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": chinese_name,
                "collection": "wuxia",
                "rarity": char["rarity"],
                "element": element,
                "description": char["desc"],
                "symbol": char["symbol"],
                "asset": f"/assets/themes/wuxia/characters/{ch_id}/{cid}.png",
                "palette": palette,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Wuxia characters into characters.json! Total characters: {len(characters)}")

if __name__ == "__main__":
    register()
