import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_space_characters import SPACE_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Cosmic Explorers & Space Station
    "alien_zog": {"bg": "#0a261a", "primary": "#52b788", "accent": "#4cc9f0", "glow": "#b7e4c7"},
    "chibi_astronaut": {"bg": "#0f1c30", "primary": "#48cae4", "accent": "#ffd166", "glow": "#caf0f8"},
    "space_drone_bot": {"bg": "#1f1d10", "primary": "#ffd166", "accent": "#4cc9f0", "glow": "#ffeaa7"},
    "baby_star_meteor": {"bg": "#2b0d1e", "primary": "#f72585", "accent": "#ffd166", "glow": "#ffba08"},
    "moon_bunny_rover": {"bg": "#18142a", "primary": "#f72585", "accent": "#ffd166", "glow": "#f8f9fa"},
    "cosmic_jellyfish": {"bg": "#0d1b33", "primary": "#4cc9f0", "accent": "#f72585", "glow": "#ffd166"},
    "satellite_bot": {"bg": "#0d2238", "primary": "#0077b6", "accent": "#ffd166", "glow": "#90e0ef"},
    "chibi_rocket": {"bg": "#2e0f14", "primary": "#d90429", "accent": "#ffd166", "glow": "#ffba08"},
    "orbit_gyro_planet": {"bg": "#18112c", "primary": "#7209b7", "accent": "#ffd166", "glow": "#4cc9f0"},

    # Sheet 2: Nebula Beasts & Celestial Wonders
    "nebula_cosmic_moth": {"bg": "#1c0d2b", "primary": "#7209b7", "accent": "#ffd166", "glow": "#ff758f"},
    "asteroid_golem": {"bg": "#1f1414", "primary": "#e63946", "accent": "#4cc9f0", "glow": "#f4a261"},
    "starlight_kitsune": {"bg": "#0a1838", "primary": "#4cc9f0", "accent": "#ffd166", "glow": "#caf0f8"},
    "void_star_octopus": {"bg": "#1b0a2a", "primary": "#7209b7", "accent": "#ffd166", "glow": "#b5179e"},
    "solar_flare_beetle": {"bg": "#2b1208", "primary": "#e76f51", "accent": "#4cc9f0", "glow": "#ffba08"},
    "cosmic_space_whale": {"bg": "#0a1636", "primary": "#0077b6", "accent": "#ffd166", "glow": "#4cc9f0"},
    "magnetic_pulsar_bot": {"bg": "#14172a", "primary": "#3a86ff", "accent": "#d90429", "glow": "#caf0f8"},
    "black_hole_singularity": {"bg": "#180824", "primary": "#7209b7", "accent": "#f72585", "glow": "#ffd166"},
    "celestial_armillary_sphere": {"bg": "#150d2e", "primary": "#b5179e", "accent": "#ffd166", "glow": "#4cc9f0"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "light": {"bg": "#1f1a38", "primary": "#4cc9f0", "accent": "#ffd166", "glow": "#ffffff"},
    "dark": {"bg": "#160a24", "primary": "#7209b7", "accent": "#f72585", "glow": "#b5179e"}
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    space_exists = False
    for col in collections:
        if col["id"] == "space":
            space_exists = True
            col["name"] = "Thiên Hà Vũ Trụ"
            col["japaneseTitle"] = "スペース・ギャラクシー"
            col["themeFolder"] = "space"
            col["description"] = "Bộ sưu tập 18 nhân vật & sinh vật vũ trụ: Phi hành gia nhí, Alien Zog, Hồ ly sao trời Astra và Cá voi thiên hà Levi."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "starlight_kitsune"

    if not space_exists:
        collections.append({
            "id": "space",
            "name": "Thiên Hà Vũ Trụ",
            "japaneseTitle": "スペース・ギャラクシー",
            "themeFolder": "space",
            "description": "Bộ sưu tập 18 nhân vật & sinh vật vũ trụ: Phi hành gia nhí, Alien Zog, Hồ ly sao trời Astra và Cá voi thiên hà Levi.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "starlight_kitsune"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Space Galaxy (space) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing space characters
    characters = [c for c in characters if c.get("collection") != "space"]

    added_count = 0
    for sheet_idx, sheet in enumerate(SPACE_SHEET_CONFIGS):
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
                "collection": "space",
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
                    "charm": 97 if char["rarity"] == "legendary" else (89 if char["rarity"] == "epic" else 82),
                    "mischief": 93 if char["rarity"] == "legendary" else (85 if char["rarity"] == "epic" else 77),
                    "mystery": 98 if char["element"] in ["light", "dark"] else 88
                },
                "palette": palette,
                "imagePath": f"assets/themes/space/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Space Galaxy characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
