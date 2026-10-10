import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_sea_characters import SEA_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Mythic Beasts
    "phaya_naga": {"bg": "#0a2428", "primary": "#0077b6", "accent": "#2a9d8f", "glow": "#00f5d4"},
    "garuda_warrior": {"bg": "#320f09", "primary": "#d90429", "accent": "#ffb703", "glow": "#f77f00"},
    "airavata_elephant": {"bg": "#2b2014", "primary": "#d4af37", "accent": "#ffd166", "glow": "#ffeaa7"},
    "white_hanuman": {"bg": "#18222b", "primary": "#e63946", "accent": "#ffd166", "glow": "#f1faee"},
    "malayan_tiger": {"bg": "#2d1708", "primary": "#f4a261", "accent": "#2a9d8f", "glow": "#ffba08"},
    "barong_lion": {"bg": "#330f0d", "primary": "#d90429", "accent": "#ffd166", "glow": "#f72585"},
    "civet_musang": {"bg": "#241b12", "primary": "#e76f51", "accent": "#52b788", "glow": "#ffd166"},
    "ayutthaya_buddha": {"bg": "#142416", "primary": "#52b788", "accent": "#d4af37", "glow": "#b7e4c7"},
    "sacred_gong": {"bg": "#2e1c07", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},

    # Sheet 2: Tropical Festivals
    "naga_chibi": {"bg": "#0b2520", "primary": "#2a9d8f", "accent": "#f72585", "glow": "#80ed99"},
    "baby_garuda": {"bg": "#30100d", "primary": "#e63946", "accent": "#0077b6", "glow": "#ffd166"},
    "chang_noi": {"bg": "#281d19", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},
    "golden_monkey": {"bg": "#2b1b0b", "primary": "#f4a261", "accent": "#e76f51", "glow": "#ffd166"},
    "hornbill_enggang": {"bg": "#112328", "primary": "#0077b6", "accent": "#ffba08", "glow": "#ffd166"},
    "yaksha_giant": {"bg": "#1a2614", "primary": "#2a9d8f", "accent": "#d90429", "glow": "#ffd166"},
    "tokay_gecko": {"bg": "#0d281a", "primary": "#52b788", "accent": "#f72585", "glow": "#80ed99"},
    "loy_krathong": {"bg": "#2c1020", "primary": "#f72585", "accent": "#ffba08", "glow": "#ff758f"},
    "angkor_smile": {"bg": "#172619", "primary": "#52b788", "accent": "#d4af37", "glow": "#a3b18a"}
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

    sea_exists = False
    for col in collections:
        if col["id"] == "sea":
            sea_exists = True
            col["name"] = "Huyền Thoại Đông Nam Á"
            col["japaneseTitle"] = "東南アジア神話"
            col["themeFolder"] = "sea"
            col["description"] = "Bộ sưu tập 18 linh thú rừng nhiệt đới, thần xà Naga và di tích đền đài cổ kính Đông Nam Á."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "phaya_naga"

    if not sea_exists:
        collections.append({
            "id": "sea",
            "name": "Huyền Thoại Đông Nam Á",
            "japaneseTitle": "東南アジア神話",
            "themeFolder": "sea",
            "description": "Bộ sưu tập 18 linh thú rừng nhiệt đới, thần xà Naga và di tích đền đài cổ kính Đông Nam Á.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "phaya_naga"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Southeast Asia (sea) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing sea characters for clean re-registration
    characters = [c for c in characters if c.get("collection") != "sea"]

    added_count = 0
    for sheet_idx, sheet in enumerate(SEA_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            native_name = char.get("native", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["earth"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": native_name,
                "collection": "sea",
                "rarity": char["rarity"],
                "element": element,
                "description": char["desc"],
                "symbol": char["symbol"],
                "asset": f"/assets/themes/sea/characters/{ch_id}/{cid}.png",
                "palette": palette,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Southeast Asia characters into characters.json! Total characters: {len(characters)}")

if __name__ == "__main__":
    register()
