import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_robot_characters import ROBOT_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Workshop Crew & Helpers
    "builder_bot_wrench": {"bg": "#2b220a", "primary": "#ffd166", "accent": "#4cc9f0", "glow": "#ffeaa7"},
    "medic_bot_cross": {"bg": "#0a2618", "primary": "#52b788", "accent": "#e63946", "glow": "#b7e4c7"},
    "drill_bot_digger": {"bg": "#2e190a", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffba08"},
    "delivery_drone_copter": {"bg": "#0a1e30", "primary": "#48cae4", "accent": "#ffd166", "glow": "#caf0f8"},
    "forklift_bot_stacker": {"bg": "#29140a", "primary": "#e76f51", "accent": "#ffd166", "glow": "#f4a261"},
    "welder_bot_sparky": {"bg": "#0d1a33", "primary": "#3a86ff", "accent": "#f4a261", "glow": "#ffba08"},
    "battery_bunny_bot": {"bg": "#1d1f2e", "primary": "#4cc9f0", "accent": "#ffd166", "glow": "#ffba08"},
    "gear_box_mimic": {"bg": "#291c0a", "primary": "#ffd166", "accent": "#e63946", "glow": "#ffeaa7"},
    "conveyor_belt_sorter": {"bg": "#141724", "primary": "#ffd166", "accent": "#4cc9f0", "glow": "#caf0f8"},

    # Sheet 2: Heavy Assembly & Automation
    "heavy_loader_titan": {"bg": "#2b2007", "primary": "#ffd166", "accent": "#d90429", "glow": "#ffeaa7"},
    "spider_repair_bot": {"bg": "#260e12", "primary": "#d90429", "accent": "#4cc9f0", "glow": "#f8f9fa"},
    "magnet_crane_bot": {"bg": "#0b1c36", "primary": "#0077b6", "accent": "#e63946", "glow": "#4cc9f0"},
    "spray_paint_bot": {"bg": "#1a0d2e", "primary": "#7209b7", "accent": "#4cc9f0", "glow": "#f72585"},
    "optical_scanner_bot": {"bg": "#121d2b", "primary": "#00b4d8", "accent": "#ffd166", "glow": "#90e0ef"},
    "monowheel_courier": {"bg": "#161b29", "primary": "#f4a261", "accent": "#4cc9f0", "glow": "#caf0f8"},
    "hydraulic_press_forge": {"bg": "#0d1d33", "primary": "#0077b6", "accent": "#4cc9f0", "glow": "#caf0f8"},
    "recycler_compactor_bot": {"bg": "#142416", "primary": "#52b788", "accent": "#f4a261", "glow": "#b7e4c7"},
    "quantum_assembly_hub": {"bg": "#0f1c38", "primary": "#3a86ff", "accent": "#ffd166", "glow": "#ffba08"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "light": {"bg": "#222129", "primary": "#ffd166", "accent": "#4cc9f0", "glow": "#ffffff"}
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    robot_exists = False
    for col in collections:
        if col["id"] == "robot":
            robot_exists = True
            col["name"] = "Xưởng Robot"
            col["japaneseTitle"] = "ロボット工場"
            col["themeFolder"] = "robot"
            col["description"] = "Bộ sưu tập 18 nhân vật & cỗ máy công xưởng tương lai: Thợ máy Rusty, Thỏ pin Volt, Nhện cơ khí Arachno và Cự nhân Titan."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "battery_bunny_bot"

    if not robot_exists:
        collections.append({
            "id": "robot",
            "name": "Xưởng Robot",
            "japaneseTitle": "ロボット工場",
            "themeFolder": "robot",
            "description": "Bộ sưu tập 18 nhân vật & cỗ máy công xưởng tương lai: Thợ máy Rusty, Thỏ pin Volt, Nhện cơ khí Arachno và Cự nhân Titan.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "battery_bunny_bot"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Robot Factory (robot) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing robot characters
    characters = [c for c in characters if c.get("collection") != "robot"]

    added_count = 0
    for sheet_idx, sheet in enumerate(ROBOT_SHEET_CONFIGS):
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
                "collection": "robot",
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
                    "charm": 96 if char["rarity"] == "legendary" else (88 if char["rarity"] == "epic" else 81),
                    "mischief": 92 if char["rarity"] == "legendary" else (85 if char["rarity"] == "epic" else 76),
                    "mystery": 94 if char["rarity"] == "legendary" else 84
                },
                "palette": palette,
                "imagePath": f"assets/themes/robot/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Robot Factory characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
