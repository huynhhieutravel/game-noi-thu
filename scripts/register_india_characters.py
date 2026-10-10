import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_india_characters import INDIA_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Gods & Vahanas
    "durga_maa": {"bg": "#350a11", "primary": "#d90429", "accent": "#ffd166", "glow": "#f72585"},
    "simha_lion": {"bg": "#2e1b0a", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},
    "naga_king": {"bg": "#0a2522", "primary": "#0077b6", "accent": "#2a9d8f", "glow": "#00f5d4"},
    "nandi_bull": {"bg": "#241e15", "primary": "#e76f51", "accent": "#ffd166", "glow": "#ffeaa7"},
    "peacock_fan": {"bg": "#0d242b", "primary": "#0077b6", "accent": "#52b788", "glow": "#48cae4"},
    "vyaghra_tiger": {"bg": "#321406", "primary": "#e76f51", "accent": "#ffba08", "glow": "#f77f00"},
    "bal_hanuman": {"bg": "#26180c", "primary": "#f4a261", "accent": "#e76f51", "glow": "#ffd166"},
    "rangoli_mandala": {"bg": "#281125", "primary": "#f72585", "accent": "#ffd166", "glow": "#ff758f"},
    "lord_krishna": {"bg": "#0d1e38", "primary": "#3a86ff", "accent": "#ffd166", "glow": "#a8dadc"},

    # Sheet 2: Festivals & Celebrations
    "lord_ganesha": {"bg": "#2e140d", "primary": "#e76f51", "accent": "#ffd166", "glow": "#ffeaa7"},
    "mayura_peacock": {"bg": "#0a2233", "primary": "#0077b6", "accent": "#52b788", "glow": "#48cae4"},
    "padma_lotus": {"bg": "#2d0e20", "primary": "#f72585", "accent": "#ffd166", "glow": "#ff758f"},
    "baby_sheru": {"bg": "#2a1708", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},
    "hanuman_warrior": {"bg": "#2f1207", "primary": "#e76f51", "accent": "#ffba08", "glow": "#f77f00"},
    "dhol_drum": {"bg": "#1d182e", "primary": "#3a86ff", "accent": "#e63946", "glow": "#ffd166"},
    "modak_sweet": {"bg": "#241c0e", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},
    "diwali_diya": {"bg": "#331405", "primary": "#ffba08", "accent": "#f72585", "glow": "#f77f00"},
    "sari_dancer": {"bg": "#290d20", "primary": "#d90429", "accent": "#3a86ff", "glow": "#ffd166"}
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

    india_exists = False
    for col in collections:
        if col["id"] == "india":
            india_exists = True
            col["name"] = "Thần Thoại & Lễ Hội Ấn Độ"
            col["japaneseTitle"] = "インド神話・祭典"
            col["themeFolder"] = "india"
            col["description"] = "Bộ sưu tập 18 vị đại thần, linh thú Vahana và pháp bảo lễ hội rực rỡ sắc màu Ấn Độ."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "lord_ganesha"

    if not india_exists:
        collections.append({
            "id": "india",
            "name": "Thần Thoại & Lễ Hội Ấn Độ",
            "japaneseTitle": "インド神話・祭典",
            "themeFolder": "india",
            "description": "Bộ sưu tập 18 vị đại thần, linh thú Vahana và pháp bảo lễ hội rực rỡ sắc màu Ấn Độ.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "lord_ganesha"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with India collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing india characters for clean re-registration
    characters = [c for c in characters if c.get("collection") != "india"]

    added_count = 0
    for sheet_idx, sheet in enumerate(INDIA_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            sanskrit_name = char.get("sanskrit", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["fire"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": sanskrit_name,
                "collection": "india",
                "rarity": char["rarity"],
                "element": element,
                "description": char["desc"],
                "symbol": char["symbol"],
                "asset": f"/assets/themes/india/characters/{ch_id}/{cid}.png",
                "palette": palette,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} India characters into characters.json! Total characters: {len(characters)}")

if __name__ == "__main__":
    register()
