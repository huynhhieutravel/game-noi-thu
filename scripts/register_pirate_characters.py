import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_pirate_characters import PIRATE_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Jolly Pirates & Sunny Seas
    "captain_paws": {"bg": "#2b1414", "primary": "#d90429", "accent": "#ffd166", "glow": "#ffba08"},
    "pirate_shark": {"bg": "#0b253a", "primary": "#0077b6", "accent": "#e63946", "glow": "#90e0ef"},
    "cannon_crab": {"bg": "#2e120e", "primary": "#e63946", "accent": "#ffd166", "glow": "#ffba08"},
    "sailor_tako": {"bg": "#231238", "primary": "#7209b7", "accent": "#48cae4", "glow": "#e0aaff"},
    "coral_mermaid": {"bg": "#0b2829", "primary": "#2a9d8f", "accent": "#f72585", "glow": "#80ed99"},
    "lookout_parrot": {"bg": "#2b1d0a", "primary": "#f4a261", "accent": "#0077b6", "glow": "#ffd166"},
    "mimic_chest": {"bg": "#2b1807", "primary": "#f4a261", "accent": "#e76f51", "glow": "#ffd166"},
    "helm_spirit": {"bg": "#261e12", "primary": "#d4a373", "accent": "#2a9d8f", "glow": "#faedcd"},
    "beacon_lantern": {"bg": "#09232c", "primary": "#0077b6", "accent": "#48cae4", "glow": "#a0e7e5"},

    # Sheet 2: Cursed Depths & Ghost Fleet
    "ghost_captain": {"bg": "#062121", "primary": "#2ec4b6", "accent": "#ffd166", "glow": "#00f5d4"},
    "skeletal_fish": {"bg": "#071f25", "primary": "#2ec4b6", "accent": "#e63946", "glow": "#70e000"},
    "cursed_serpent": {"bg": "#091e1d", "primary": "#2a9d8f", "accent": "#ffd166", "glow": "#80ed99"},
    "haunted_anchor": {"bg": "#0b1a20", "primary": "#1d3557", "accent": "#00f5d4", "glow": "#48cae4"},
    "abyssal_siren": {"bg": "#1d122e", "primary": "#7209b7", "accent": "#00f5d4", "glow": "#b5179e"},
    "bone_crab": {"bg": "#121e1e", "primary": "#2ec4b6", "accent": "#e63946", "glow": "#a0e7e5"},
    "trident_obelisk": {"bg": "#082026", "primary": "#0077b6", "accent": "#ffd166", "glow": "#00f5d4"},
    "shipwreck_golem": {"bg": "#1c1912", "primary": "#8d99ae", "accent": "#2ec4b6", "glow": "#00f5d4"},
    "cursed_kraken": {"bg": "#1a0f2b", "primary": "#560bad", "accent": "#4cc9f0", "glow": "#f72585"}
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

    pirate_exists = False
    for col in collections:
        if col["id"] == "pirate":
            pirate_exists = True
            col["name"] = "Hải Tặc & Đại Dương"
            col["japaneseTitle"] = "海賊と大洋"
            col["themeFolder"] = "pirate"
            col["description"] = "Bộ sưu tập 18 nhân vật hải tặc tinh nghịch, nàng tiên cá, rương kho báu và hạm đội bóng ma biển sâu."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "captain_paws"

    if not pirate_exists:
        collections.append({
            "id": "pirate",
            "name": "Hải Tặc & Đại Dương",
            "japaneseTitle": "海賊と大洋",
            "themeFolder": "pirate",
            "description": "Bộ sưu tập 18 nhân vật hải tặc tinh nghịch, nàng tiên cá, rương kho báu và hạm đội bóng ma biển sâu.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "captain_paws"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Pirate Ocean (pirate) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing pirate characters for clean re-registration
    characters = [c for c in characters if c.get("collection") != "pirate"]

    added_count = 0
    for sheet_idx, sheet in enumerate(PIRATE_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            native_name = char.get("native", char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, ELEMENT_FALLBACK.get(element, ELEMENT_FALLBACK["water"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": native_name,
                "collection": "pirate",
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
                    "charm": 88 if char["rarity"] == "legendary" else (82 if char["rarity"] == "epic" else 75),
                    "mischief": 92 if char["rarity"] == "legendary" else (85 if char["rarity"] == "epic" else 78),
                    "mystery": 95 if "ghost" in cid or "cursed" in cid or "abyssal" in cid else 80
                },
                "palette": palette,
                "imagePath": f"assets/themes/pirate/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Pirate Ocean characters into characters.json! Total characters: {len(characters)}")

if __name__ == "__main__":
    register()
