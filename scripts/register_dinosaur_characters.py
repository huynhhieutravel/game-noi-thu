import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_dinosaur_characters import DINOSAUR_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Sheet 1: Jurassic Valley
    "baby_trex": {"bg": "#142912", "primary": "#52b788", "accent": "#ffd166", "glow": "#b7e4c7"},
    "triceratops_trixie": {"bg": "#2e1b0c", "primary": "#f4a261", "accent": "#52b788", "glow": "#ffd166"},
    "stegosaurus_spike": {"bg": "#1e2614", "primary": "#52b788", "accent": "#e76f51", "glow": "#d8f3dc"},
    "raptor_dash": {"bg": "#251233", "primary": "#7209b7", "accent": "#ffd166", "glow": "#e0aaff"},
    "pterodactyl_sky": {"bg": "#0b2438", "primary": "#00b4d8", "accent": "#f4a261", "glow": "#caf0f8"},
    "ankylosaurus_buster": {"bg": "#241e14", "primary": "#d4a373", "accent": "#52b788", "glow": "#faedcd"},
    "parasaurolophus_perry": {"bg": "#2b1422", "primary": "#f72585", "accent": "#48cae4", "glow": "#ffc6ff"},
    "dino_egg_nest": {"bg": "#1c2415", "primary": "#52b788", "accent": "#f4a261", "glow": "#ffd166"},
    "dino_footprint_totem": {"bg": "#1a2619", "primary": "#2a9d8f", "accent": "#ffd166", "glow": "#faedcd"},

    # Sheet 2: Volcanic Primordial & Ice Age
    "spinosaurus_magma": {"bg": "#2d0f07", "primary": "#d90429", "accent": "#ffb703", "glow": "#f77f00"},
    "carnotaurus_blaze": {"bg": "#300d08", "primary": "#d90429", "accent": "#ffba08", "glow": "#ffd166"},
    "brachiosaurus_titan": {"bg": "#0e1f30", "primary": "#0077b6", "accent": "#52b788", "glow": "#90e0ef"},
    "pachycephalosaurus_crush": {"bg": "#1c2226", "primary": "#2a9d8f", "accent": "#e76f51", "glow": "#ffd166"},
    "dilophosaurus_flare": {"bg": "#1c2410", "primary": "#52b788", "accent": "#f72585", "glow": "#ffd166"},
    "dimetrodon_pyro": {"bg": "#260f21", "primary": "#b5179e", "accent": "#d90429", "glow": "#ff758f"},
    "sabertooth_frost": {"bg": "#151e2b", "primary": "#00b4d8", "accent": "#ffffff", "glow": "#caf0f8"},
    "meteor_golem": {"bg": "#331405", "primary": "#e76f51", "accent": "#ffd166", "glow": "#ffba08"},
    "volcano_spirit": {"bg": "#330a06", "primary": "#d90429", "accent": "#ffba08", "glow": "#ff7b00"}
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

    dino_exists = False
    for col in collections:
        if col["id"] == "dinosaur":
            dino_exists = True
            col["name"] = "Thế Giới Khủng Long"
            col["japaneseTitle"] = "恐竜ワールド"
            col["themeFolder"] = "dinosaur"
            col["description"] = "Bộ sưu tập 18 loài khủng long tiền sử từ thung lũng Kỷ Jura rợp bóng cây đến hỏa sơn nham thạch và kỷ băng hà."
            col["totalCharacters"] = 18
            col["totalChapters"] = 2
            col["rewardLegendaryId"] = "baby_trex"

    if not dino_exists:
        collections.append({
            "id": "dinosaur",
            "name": "Thế Giới Khủng Long",
            "japaneseTitle": "恐竜ワールド",
            "themeFolder": "dinosaur",
            "description": "Bộ sưu tập 18 loài khủng long tiền sử từ thung lũng Kỷ Jura rợp bóng cây đến hỏa sơn nham thạch và kỷ băng hà.",
            "totalCharacters": 18,
            "totalChapters": 2,
            "rewardLegendaryId": "baby_trex"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Dinosaur World (dinosaur) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing dinosaur characters
    characters = [c for c in characters if c.get("collection") != "dinosaur"]

    added_count = 0
    for sheet_idx, sheet in enumerate(DINOSAUR_SHEET_CONFIGS):
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
                "collection": "dinosaur",
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
                    "charm": 94 if char["rarity"] == "legendary" else (86 if char["rarity"] == "epic" else 78),
                    "mischief": 90 if char["rarity"] == "legendary" else (84 if char["rarity"] == "epic" else 76),
                    "mystery": 88 if char["element"] == "fire" else 82
                },
                "palette": palette,
                "imagePath": f"assets/themes/dinosaur/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Dinosaur World characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
