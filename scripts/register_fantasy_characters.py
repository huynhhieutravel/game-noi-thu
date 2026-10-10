import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_fantasy_characters import FANTASY_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Royal Adventurers Party
    "human_knight": {"bg": "#101d36", "primary": "#3a86ff", "accent": "#ffd166", "glow": "#caf0f8"},
    "fire_sorceress": {"bg": "#330e0e", "primary": "#d90429", "accent": "#ffd166", "glow": "#ffba08"},
    "elf_ranger": {"bg": "#0d2818", "primary": "#52b788", "accent": "#ffd166", "glow": "#a7c957"},
    "dwarf_blacksmith": {"bg": "#2b1408", "primary": "#e76f51", "accent": "#ffd166", "glow": "#f4a261"},
    "high_elf_priestess": {"bg": "#132a24", "primary": "#2a9d8f", "accent": "#ffd166", "glow": "#c7f9cc"},
    "pixie_fairy": {"bg": "#2b0f24", "primary": "#f72585", "accent": "#ffd166", "glow": "#ffc6ff"},
    "baby_blue_dragon": {"bg": "#0c2340", "primary": "#0077b6", "accent": "#f4a261", "glow": "#90e0ef"},
    "angelic_mimic_chest": {"bg": "#2e210a", "primary": "#ffd166", "accent": "#4cc9f0", "glow": "#ffeaa7"},
    "arcane_crystal_crest": {"bg": "#0a1931", "primary": "#4361ee", "accent": "#ffd166", "glow": "#4cc9f0"},

    # Sheet 2: Mythic Crusade & Beasts
    "lion_paladin": {"bg": "#2e1c07", "primary": "#ffd166", "accent": "#3a86ff", "glow": "#ffeaa7"},
    "frost_sorceress": {"bg": "#0a192f", "primary": "#90e0ef", "accent": "#48cae4", "glow": "#e0fbfc"},
    "raven_shadow_rogue": {"bg": "#151624", "primary": "#7209b7", "accent": "#d90429", "glow": "#4cc9f0"},
    "gnome_alchemist": {"bg": "#23132e", "primary": "#7209b7", "accent": "#52b788", "glow": "#ffd166"},
    "dryad_forest_nymph": {"bg": "#0f2b1d", "primary": "#2d6a4f", "accent": "#95d5b2", "glow": "#d8f3dc"},
    "rainbow_pegasus": {"bg": "#22132e", "primary": "#f72585", "accent": "#4cc9f0", "glow": "#ffd166"},
    "golden_gryphon": {"bg": "#2b1c09", "primary": "#f4a261", "accent": "#48cae4", "glow": "#ffeaa7"},
    "crystal_shield_golem": {"bg": "#141c24", "primary": "#48cae4", "accent": "#ffd166", "glow": "#83c5be"},
    "astral_dragon_aegis": {"bg": "#260a1f", "primary": "#d90429", "accent": "#ffd166", "glow": "#b5179e"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wood": {"bg": "#0d2818", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "light": {"bg": "#2e250f", "primary": "#ffd166", "accent": "#ffeaa7", "glow": "#ffffff"},
    "dark": {"bg": "#181028", "primary": "#7209b7", "accent": "#b5179e", "glow": "#f72585"}
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    fantasy_exists = False
    for col in collections:
        if col["id"] == "fantasy":
            fantasy_exists = True
            col["name"] = "Thế Giới Fantasy"
            col["japaneseTitle"] = "クラシックファンタジー"
            col["themeFolder"] = "fantasy"
            col["description"] = "Kỷ nguyên thần thoại hiệp sĩ, pháp sư hoàng gia, rồng hộ mệnh và những sinh vật huyền thoại cổ đại."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "lion_paladin"

    if not fantasy_exists:
        collections.append({
            "id": "fantasy",
            "name": "Thế Giới Fantasy",
            "japaneseTitle": "クラシックファンタジー",
            "themeFolder": "fantasy",
            "description": "Kỷ nguyên thần thoại hiệp sĩ, pháp sư hoàng gia, rồng hộ mệnh và những sinh vật huyền thoại cổ đại.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "lion_paladin"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Classic Fantasy (fantasy) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing fantasy characters
    characters = [c for c in characters if c.get("collection") != "fantasy"]

    added_count = 0
    for sheet_idx, sheet in enumerate(FANTASY_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            native_name = char.get("native", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["light"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": native_name,
                "collection": "fantasy",
                "rarity": char["rarity"],
                "element": element,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title,
                "symbol": char["symbol"],
                "title": char["title"],
                "description": char["desc"],
                "lore": char["desc"],
                "stats": {
                    "charm": 96 if char["rarity"] == "legendary" else (88 if char["rarity"] == "epic" else 80),
                    "mischief": 92 if char["rarity"] == "legendary" else (84 if char["rarity"] == "epic" else 76),
                    "mystery": 95 if char["element"] in ["light", "dark"] else 86
                },
                "palette": palette,
                "imagePath": f"assets/themes/fantasy/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Classic Fantasy characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
