import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_plant_characters import PLANT_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Chapter 1: Blossom Garden
    "sunflower_sunny": {"bg": "#2e2307", "primary": "#ffd166", "accent": "#f4a261", "glow": "#ffeaa7"},
    "rose_velvet_rosie": {"bg": "#2b0d12", "primary": "#e63946", "accent": "#52b788", "glow": "#ff758f"},
    "tulip_spring_tula": {"bg": "#2b1218", "primary": "#f72585", "accent": "#52b788", "glow": "#ffb3c6"},
    "daisy_blooming_daisy": {"bg": "#1c2419", "primary": "#ffffff", "accent": "#ffd166", "glow": "#fff3b0"},
    "lavender_scent_lila": {"bg": "#1c142b", "primary": "#9b5de5", "accent": "#c77dff", "glow": "#e0aaff"},
    "cactus_bloom_spiky": {"bg": "#0f2615", "primary": "#52b788", "accent": "#f72585", "glow": "#ffd166"},
    "strawberry_sweet_berry": {"bg": "#2b0e12", "primary": "#e63946", "accent": "#52b788", "glow": "#ff758f"},
    "flower_pot_potti": {"bg": "#26190f", "primary": "#f4a261", "accent": "#e63946", "glow": "#faedcd"},
    "ancient_vine_pillar": {"bg": "#1f1d12", "primary": "#52b788", "accent": "#d4a373", "glow": "#b7e4c7"},

    # Chapter 2: Mystic Flora
    "carnivorous_flytrap_chomper": {"bg": "#17240d", "primary": "#52b788", "accent": "#e63946", "glow": "#a7c957"},
    "sacred_lotus_padma": {"bg": "#122026", "primary": "#f72585", "accent": "#48cae4", "glow": "#ffc6ff"},
    "orchid_fairy_flora": {"bg": "#1e142e", "primary": "#9b5de5", "accent": "#ffd166", "glow": "#e0aaff"},
    "bonsai_master_senpai": {"bg": "#1c2114", "primary": "#52b788", "accent": "#d4a373", "glow": "#d8f3dc"},
    "pumpkin_patch_jack": {"bg": "#2b1907", "primary": "#f4a261", "accent": "#52b788", "glow": "#ffba08"},
    "hydrangea_cloud_mimi": {"bg": "#101d2e", "primary": "#48cae4", "accent": "#9b5de5", "glow": "#caf0f8"},
    "bamboo_shoot_take": {"bg": "#132612", "primary": "#52b788", "accent": "#ffd166", "glow": "#b7e4c7"},
    "autumn_oak_yggdrasil": {"bg": "#261d0a", "primary": "#ffd166", "accent": "#52b788", "glow": "#ffeaa7"},
    "celestial_flame_lotus": {"bg": "#2e0c1b", "primary": "#ffd166", "accent": "#e63946", "glow": "#f72585"},
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    plant_collection = {
        "id": "plant",
        "name": "Vương Quốc Thực Vật",
        "japaneseTitle": "植物王国 • かわいい花と木",
        "themeFolder": "plant",
        "description": "Bộ sưu tập 18 loài hoa thơm, quả ngọt & thần thảo kỳ diệu: Hướng dương Sunny, Hoa hồng Rosie, Cây bắt mồi Chomper và Hỏa liên Pyra.",
        "totalCharacters": 18,
        "totalChapters": 2,
        "rewardLegendaryId": "celestial_flame_lotus"
    }

    found = False
    for i, col in enumerate(collections):
        if col["id"] == "plant":
            collections[i] = plant_collection
            found = True
            break
    if not found:
        collections.append(plant_collection)

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print(f"✓ Updated collections.json with 'plant' theme ({len(collections)} total collections)")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing plant characters if any
    characters = [c for c in characters if c.get("collection") != "plant"]

    new_chars = []
    for sheet_idx, sheet in enumerate(PLANT_SHEET_CONFIGS):
        chapter_num = sheet_idx + 1
        chapter_dir = sheet["chapter_dir"]
        chapter_title = sheet["title"]

        for slot_idx, meta in enumerate(sheet["characters"]):
            cid = meta["id"]
            pal = CUSTOM_PALETTES.get(cid, {
                "bg": "#121b14",
                "primary": "#52b788",
                "accent": "#ffd166",
                "glow": "#b7e4c7"
            })

            # Stats based on rarity
            rarity = meta["rarity"]
            if rarity == "common":
                charm, mischief, mystery = 72, 60, 65
            elif rarity == "uncommon":
                charm, mischief, mystery = 80, 70, 75
            elif rarity == "rare":
                charm, mischief, mystery = 88, 78, 85
            elif rarity == "epic":
                charm, mischief, mystery = 94, 85, 92
            else:  # legendary
                charm, mischief, mystery = 99, 90, 98

            rel_img = f"assets/themes/plant/characters/{chapter_dir}/{cid}.png"
            asset_img = f"/assets/themes/plant/characters/{chapter_dir}/{cid}.png"

            char_obj = {
                "id": cid,
                "name": meta["name"],
                "japaneseName": meta["native"],
                "collection": "plant",
                "rarity": rarity,
                "element": meta["element"],
                "chapter": chapter_num,
                "chapterId": chapter_dir,
                "chapterTitle": chapter_title,
                "symbol": meta["symbol"],
                "title": meta["title"],
                "description": meta["desc"],
                "lore": meta["desc"],
                "stats": {
                    "charm": charm,
                    "mischief": mischief,
                    "mystery": mystery
                },
                "palette": pal,
                "imagePath": rel_img,
                "asset": asset_img
            }
            new_chars.append(char_obj)

    characters.extend(new_chars)

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {len(new_chars)} plant characters. Total characters now: {len(characters)}")

if __name__ == "__main__":
    register()
