import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_monster_characters import MONSTER_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Cute Dungeon Crawlers
    "slime_jelly": {"bg": "#0d2818", "primary": "#52b788", "accent": "#ffd166", "glow": "#80ed99"},
    "mimic_cheesy": {"bg": "#2b1b0e", "primary": "#f4a261", "accent": "#e63946", "glow": "#ffd166"},
    "goblin_thief": {"bg": "#21290e", "primary": "#52b788", "accent": "#d90429", "glow": "#ffd166"},
    "shroom_mage": {"bg": "#2d0f21", "primary": "#d90429", "accent": "#7209b7", "glow": "#ffc6ff"},
    "baby_red_dragon": {"bg": "#330f0a", "primary": "#d90429", "accent": "#ffd166", "glow": "#ffba08"},
    "chibi_cyclops": {"bg": "#121b2d", "primary": "#3a86ff", "accent": "#d4a373", "glow": "#90e0ef"},
    "skeleton_skelly": {"bg": "#222129", "primary": "#adb5bd", "accent": "#ffd166", "glow": "#f8f9fa"},
    "potion_spirit": {"bg": "#260b2b", "primary": "#b5179e", "accent": "#f72585", "glow": "#ffc6ff"},
    "dungeon_gatekeeper": {"bg": "#261c10", "primary": "#d4af37", "accent": "#ffd166", "glow": "#ffeaa7"},

    # Sheet 2: Abyssal Depths & Cursed Relics
    "beholder_oculus": {"bg": "#1c0d30", "primary": "#7209b7", "accent": "#ffd166", "glow": "#b5179e"},
    "ogre_warlord": {"bg": "#16202b", "primary": "#0077b6", "accent": "#d90429", "glow": "#8d99ae"},
    "crystal_shadow_bat": {"bg": "#1e0e33", "primary": "#7209b7", "accent": "#4cc9f0", "glow": "#ff007f"},
    "dark_knight_valkor": {"bg": "#140d24", "primary": "#560bad", "accent": "#ffd166", "glow": "#b5179e"},
    "moss_gargoyle": {"bg": "#192121", "primary": "#2a9d8f", "accent": "#4cc9f0", "glow": "#a8dadc"},
    "golden_treasure_worm": {"bg": "#2b1d06", "primary": "#ffd166", "accent": "#e76f51", "glow": "#ffeaa7"},
    "cursed_grimoire": {"bg": "#230a2b", "primary": "#7209b7", "accent": "#ffd166", "glow": "#ff758f"},
    "gold_coin_golem": {"bg": "#2e1f06", "primary": "#ffd166", "accent": "#d90429", "glow": "#ffeaa7"},
    "cursed_chained_chest": {"bg": "#2e0b0e", "primary": "#d90429", "accent": "#ffd166", "glow": "#ff0054"}
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

    monster_exists = False
    for col in collections:
        if col["id"] == "monster":
            monster_exists = True
            col["name"] = "Quái Thú Đáng Yêu"
            col["japaneseTitle"] = "可愛いモンスター"
            col["themeFolder"] = "monster"
            col["description"] = "Bộ sưu tập 18 quái thú hầm ngục ngộ nghĩnh: Slime xanh, Rồng lửa nhí, Yêu tinh Goblin và Nhãn quỷ thâm uyên."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "baby_red_dragon"

    if not monster_exists:
        collections.append({
            "id": "monster",
            "name": "Quái Thú Đáng Yêu",
            "japaneseTitle": "可愛いモンスター",
            "themeFolder": "monster",
            "description": "Bộ sưu tập 18 quái thú hầm ngục ngộ nghĩnh: Slime xanh, Rồng lửa nhí, Yêu tinh Goblin và Nhãn quỷ thâm uyên.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "baby_red_dragon"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Cute Monsters (monster) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing monster characters
    characters = [c for c in characters if c.get("collection") != "monster"]

    added_count = 0
    for sheet_idx, sheet in enumerate(MONSTER_SHEET_CONFIGS):
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
                "collection": "monster",
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
                    "mischief": 94 if char["rarity"] == "legendary" else (86 if char["rarity"] == "epic" else 78),
                    "mystery": 92 if char["element"] == "spirit" else 84
                },
                "palette": palette,
                "imagePath": f"assets/themes/monster/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Cute Monsters characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
