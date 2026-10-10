import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_korea_characters import KOREA_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Folklore Customs
    "dokkaebi": {"bg": "#2d0e12", "primary": "#e63946", "accent": "#ffd166", "glow": "#ff4d6d"},
    "jangseung": {"bg": "#241e15", "primary": "#cda250", "accent": "#52b788", "glow": "#ffeaa7"},
    "hahoe_mask": {"bg": "#1a1e28", "primary": "#e76f51", "accent": "#3a86ff", "glow": "#ffd166"},
    "bokjumeoni": {"bg": "#2b1419", "primary": "#d90429", "accent": "#ffd166", "glow": "#f72585"},
    "norigae": {"bg": "#0c2423", "primary": "#2a9d8f", "accent": "#e76f51", "glow": "#80ed99"},
    "samulnori_buk": {"bg": "#1e192c", "primary": "#3a86ff", "accent": "#e63946", "glow": "#ffd166"},
    "kkachi_magpie": {"bg": "#131b26", "primary": "#1d3557", "accent": "#457b9d", "glow": "#a8dadc"},
    "korean_tiger": {"bg": "#2d1a08", "primary": "#f4a261", "accent": "#2a9d8f", "glow": "#ffd166"},
    "hanbok_maiden": {"bg": "#28111e", "primary": "#d90429", "accent": "#3a86ff", "glow": "#ffd166"},

    # Sheet 2: Mythic Deities
    "gumiho": {"bg": "#320b12", "primary": "#e63946", "accent": "#ffd166", "glow": "#ff758f"},
    "samjok_o": {"bg": "#2b1009", "primary": "#d90429", "accent": "#ffb703", "glow": "#f77f00"},
    "haechi": {"bg": "#0d2822", "primary": "#2a9d8f", "accent": "#ffd166", "glow": "#52b788"},
    "imoogi": {"bg": "#092233", "primary": "#0077b6", "accent": "#48cae4", "glow": "#90e0ef"},
    "bulgae": {"bg": "#331109", "primary": "#e76f51", "accent": "#ffba08", "glow": "#f72585"},
    "cheonyeo_gwishin": {"bg": "#1a162b", "primary": "#7209b7", "accent": "#9d4edd", "glow": "#00f5d4"},
    "mudang_shaman": {"bg": "#281125", "primary": "#d90429", "accent": "#ffb703", "glow": "#3a86ff"},
    "sansin": {"bg": "#162618", "primary": "#52b788", "accent": "#d4af37", "glow": "#b7e4c7"},
    "dal_tokki": {"bg": "#261f0f", "primary": "#f39c12", "accent": "#ffd166", "glow": "#ffeaa7"}
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

    korea_exists = False
    for col in collections:
        if col["id"] == "korea":
            korea_exists = True
            col["name"] = "Thần Thoại Hàn Quốc"
            col["japaneseTitle"] = "한국 설화・신화"
            col["themeFolder"] = "korea"
            col["description"] = "Bộ sưu tập 18 linh hồn dân gian, thần thú hộ vệ và truyền thuyết kỳ ảo xứ sở Kim Chi."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "gumiho"

    if not korea_exists:
        collections.append({
            "id": "korea",
            "name": "Thần Thoại Hàn Quốc",
            "japaneseTitle": "한국 설화・신화",
            "themeFolder": "korea",
            "description": "Bộ sưu tập 18 linh hồn dân gian, thần thú hộ vệ và truyền thuyết kỳ ảo xứ sở Kim Chi.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "gumiho"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Korea collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing korea characters for clean re-registration
    characters = [c for c in characters if c.get("collection") != "korea"]

    added_count = 0
    for sheet_idx, sheet in enumerate(KOREA_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            hangul_name = char.get("hangul", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["spirit"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": hangul_name,
                "collection": "korea",
                "rarity": char["rarity"],
                "element": element,
                "description": char["desc"],
                "symbol": char["symbol"],
                "asset": f"/assets/themes/korea/characters/{ch_id}/{cid}.png",
                "palette": palette,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Korea characters into characters.json! Total characters: {len(characters)}")

if __name__ == "__main__":
    register()
