import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_underwater_characters import UNDERWATER_SHEET_CONFIGS
from cut_underwater_phase4_6 import UNDERWATER_PHASE4_6_CONFIGS

ALL_UNDERWATER_CONFIGS = UNDERWATER_SHEET_CONFIGS + UNDERWATER_PHASE4_6_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Phase 1: Royal Court
    "dolphin_prince": {"bg": "#072136", "primary": "#00b4d8", "accent": "#ffd166", "glow": "#90e0ef"},
    "manta_princess": {"bg": "#1e1338", "primary": "#7209b7", "accent": "#48cae4", "glow": "#e0aaff"},
    "puffer_guard": {"bg": "#122433", "primary": "#0077b6", "accent": "#f4a261", "glow": "#ffd166"},
    "jellyfish_maiden": {"bg": "#251236", "primary": "#f72585", "accent": "#4cc9f0", "glow": "#ffb3c6"},
    "turtle_scholar": {"bg": "#0e261a", "primary": "#2a9d8f", "accent": "#ffd166", "glow": "#80ed99"},
    "seahorse_knight": {"bg": "#261330", "primary": "#b5179e", "accent": "#4cc9f0", "glow": "#e0aaff"},
    "clam_butler": {"bg": "#1e1e2c", "primary": "#d4af37", "accent": "#e63946", "glow": "#faedcd"},
    "crab_courier": {"bg": "#2e1210", "primary": "#e63946", "accent": "#0077b6", "glow": "#ffd166"},
    "pearl_shrine": {"bg": "#082333", "primary": "#00b4d8", "accent": "#ffd166", "glow": "#caf0f8"},

    # Phase 2: Coral Carnival & Melodies
    "clownfish_drummer": {"bg": "#30160a", "primary": "#f4a261", "accent": "#e63946", "glow": "#ffd166"},
    "lionfish_dancer": {"bg": "#33100c", "primary": "#d90429", "accent": "#ffb703", "glow": "#ffba08"},
    "dory_dj": {"bg": "#0b203d", "primary": "#0077b6", "accent": "#ffb703", "glow": "#90e0ef"},
    "firecracker_shrimp": {"bg": "#2e110b", "primary": "#e76f51", "accent": "#ffd166", "glow": "#ffba08"},
    "nudibranch_diva": {"bg": "#1a1636", "primary": "#f72585", "accent": "#4cc9f0", "glow": "#80ed99"},
    "starfish_acrobat": {"bg": "#2d1326", "primary": "#f72585", "accent": "#48cae4", "glow": "#ffc6ff"},
    "hermit_parade": {"bg": "#2b170c", "primary": "#e76f51", "accent": "#2a9d8f", "glow": "#ffd166"},
    "trumpet_fish": {"bg": "#2b2409", "primary": "#ffb703", "accent": "#0077b6", "glow": "#ffd166"},
    "conch_jukebox": {"bg": "#261328", "primary": "#b5179e", "accent": "#00b4d8", "glow": "#ffc6ff"},

    # Phase 3: Ancient Guardians & Relics
    "armored_moray": {"bg": "#08222b", "primary": "#0077b6", "accent": "#ffd166", "glow": "#2ec4b6"},
    "nautilus_sage": {"bg": "#241838", "primary": "#7209b7", "accent": "#ffd166", "glow": "#faedcd"},
    "crystal_stonefish": {"bg": "#132628", "primary": "#2a9d8f", "accent": "#4cc9f0", "glow": "#80ed99"},
    "angelfish_priestess": {"bg": "#122436", "primary": "#48cae4", "accent": "#ffd166", "glow": "#ffffff"},
    "swordfish_gladiator": {"bg": "#0c243a", "primary": "#0077b6", "accent": "#ffd166", "glow": "#90e0ef"},
    "crystal_urchin": {"bg": "#1f1033", "primary": "#7209b7", "accent": "#4cc9f0", "glow": "#e0aaff"},
    "coral_princess": {"bg": "#2d111d", "primary": "#f72585", "accent": "#ffd166", "glow": "#ffb3c6"},
    "obelisk_pearl": {"bg": "#1c2020", "primary": "#d4af37", "accent": "#00b4d8", "glow": "#ffeaa7"},
    "portal_atlantis": {"bg": "#092233", "primary": "#0077b6", "accent": "#4cc9f0", "glow": "#00f5d4"},

    # Phase 4: Swift Currents
    "royal_marlin": {"bg": "#072138", "primary": "#0077b6", "accent": "#ffd166", "glow": "#48cae4"},
    "winged_flying_fish": {"bg": "#12243d", "primary": "#00b4d8", "accent": "#e63946", "glow": "#caf0f8"},
    "barracuda_hunter": {"bg": "#0b1a2b", "primary": "#0077b6", "accent": "#e63946", "glow": "#90e0ef"},
    "thunder_eel": {"bg": "#261e06", "primary": "#ffd166", "accent": "#f4a261", "glow": "#ffba08"},
    "remora_scout": {"bg": "#0b2130", "primary": "#2a9d8f", "accent": "#8d99ae", "glow": "#caf0f8"},
    "neon_sailfish": {"bg": "#1d0e2e", "primary": "#b5179e", "accent": "#00f5d4", "glow": "#f72585"},
    "deep_water_beetle": {"bg": "#0a1c2e", "primary": "#0077b6", "accent": "#ffd166", "glow": "#00f5d4"},
    "vortex_conch_cannon": {"bg": "#251420", "primary": "#f72585", "accent": "#00b4d8", "glow": "#ffd166"},
    "coral_arch_portal": {"bg": "#092230", "primary": "#00b4d8", "accent": "#e76f51", "glow": "#00f5d4"},

    # Phase 5: Luminous Abyss
    "pink_axolotl": {"bg": "#2d1124", "primary": "#f72585", "accent": "#4cc9f0", "glow": "#ffc6ff"},
    "dumbo_starry_octopus": {"bg": "#180e33", "primary": "#7209b7", "accent": "#ffd166", "glow": "#e0aaff"},
    "glass_squid": {"bg": "#0d1e38", "primary": "#48cae4", "accent": "#ffd166", "glow": "#caf0f8"},
    "sea_angel_clione": {"bg": "#102038", "primary": "#48cae4", "accent": "#e63946", "glow": "#ffffff"},
    "rainbow_jellyfish": {"bg": "#1b1236", "primary": "#7209b7", "accent": "#4cc9f0", "glow": "#ffc6ff"},
    "leafy_seadragon": {"bg": "#0b281b", "primary": "#52b788", "accent": "#ffd166", "glow": "#a7c957"},
    "coral_isopod": {"bg": "#201430", "primary": "#b5179e", "accent": "#52b788", "glow": "#ffd166"},
    "luminous_angler": {"bg": "#0a182b", "primary": "#0077b6", "accent": "#ffd166", "glow": "#ffba08"},
    "anemone_pearl_flower": {"bg": "#1a2036", "primary": "#f72585", "accent": "#00b4d8", "glow": "#ffd166"},

    # Phase 6: Supreme Sovereigns
    "kraken_overlord": {"bg": "#1b0c26", "primary": "#7209b7", "accent": "#f72585", "glow": "#b5179e"},
    "archmage_cuttlefish": {"bg": "#211d2b", "primary": "#d4af37", "accent": "#ffd166", "glow": "#faedcd"},
    "orca_admiral": {"bg": "#0a1828", "primary": "#0077b6", "accent": "#ffd166", "glow": "#e0e1dd"},
    "hammerhead_warlord": {"bg": "#0b2333", "primary": "#0077b6", "accent": "#e76f51", "glow": "#ffd166"},
    "sea_naga_empress": {"bg": "#201230", "primary": "#b5179e", "accent": "#ffd166", "glow": "#ffb3c6"},
    "cosmic_sorcerer_squid": {"bg": "#150d2b", "primary": "#7209b7", "accent": "#ffd166", "glow": "#f72585"},
    "crystal_behemoth": {"bg": "#1c0d2e", "primary": "#560bad", "accent": "#4cc9f0", "glow": "#ffd166"},
    "sovereign_coral_altar": {"bg": "#2b111a", "primary": "#d90429", "accent": "#ffd166", "glow": "#ff758f"},
    "atlantis_throne": {"bg": "#082033", "primary": "#00b4d8", "accent": "#ffd166", "glow": "#caf0f8"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "spirit": {"bg": "#241a33", "primary": "#7209b7", "accent": "#9d4edd", "glow": "#e0aaff"}
}

def register_all():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    for col in collections:
        if col["id"] == "underwater":
            col["name"] = "Thủy Cung Huyền Bí"
            col["japaneseTitle"] = "海底王国"
            col["themeFolder"] = "underwater"
            col["description"] = "Vương quốc Atlantis huyền bí trọn vẹn 6 chương với 54 thần thú, hoàng tộc biển xanh, kỳ quan phát quang và đế vương vực thẳm."
            col["totalCharacters"] = 54
            col["totalChapters"] = 6
            col["rewardLegendaryId"] = "dolphin_prince"

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with full 54 characters & 6 chapters for Underwater Kingdom!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing underwater characters
    characters = [c for c in characters if c.get("collection") != "underwater"]

    added_count = 0
    for sheet_idx, sheet in enumerate(ALL_UNDERWATER_CONFIGS):
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
                "collection": "underwater",
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
                    "charm": 92 if char["rarity"] == "legendary" else (85 if char["rarity"] == "epic" else 76),
                    "mischief": 88 if char["rarity"] == "legendary" else (82 if char["rarity"] == "epic" else 75),
                    "mystery": 96 if char["element"] == "spirit" else 88
                },
                "palette": palette,
                "imagePath": f"assets/themes/underwater/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered all {added_count} Underwater Kingdom characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register_all()
