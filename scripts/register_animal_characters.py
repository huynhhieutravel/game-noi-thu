import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from cut_animal_characters import ANIMAL_SHEET_CONFIGS

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

CUSTOM_PALETTES = {
    # Chapter 1: Cute Pets
    "shiba_inu": {"bg": "#2b1c09", "primary": "#f4a261", "accent": "#e63946", "glow": "#ffeaa7"},
    "tuxedo_cat": {"bg": "#12141c", "primary": "#48cae4", "accent": "#ffd166", "glow": "#f8f9fa"},
    "golden_hamster": {"bg": "#2e210c", "primary": "#ffd166", "accent": "#f4a261", "glow": "#ffeaa7"},
    "chinchilla_ribbon": {"bg": "#1c1829", "primary": "#b5179e", "accent": "#adb5bd", "glow": "#e0aaff"},
    "playful_ferret": {"bg": "#241912", "primary": "#48cae4", "accent": "#d4a373", "glow": "#90e0ef"},
    "cockatiel_parrot": {"bg": "#29240c", "primary": "#ffd166", "accent": "#e76f51", "glow": "#fff3b0"},
    "guinea_pig": {"bg": "#2b1c0e", "primary": "#d4a373", "accent": "#f4a261", "glow": "#faedcd"},
    "pomeranian_pup": {"bg": "#2b1e0d", "primary": "#f4a261", "accent": "#00b4d8", "glow": "#ffeaa7"},
    "pet_toy_chest": {"bg": "#24180a", "primary": "#ffd166", "accent": "#e63946", "glow": "#ffba08"},

    # Chapter 2: African Savanna
    "lion_cub_simba": {"bg": "#2e1e07", "primary": "#f4a261", "accent": "#e76f51", "glow": "#ffeaa7"},
    "baby_elephant_tempo": {"bg": "#141c24", "primary": "#48cae4", "accent": "#e63946", "glow": "#caf0f8"},
    "baby_giraffe_twiga": {"bg": "#2b2208", "primary": "#ffd166", "accent": "#d4a373", "glow": "#ffeaa7"},
    "baby_zebra_stripes": {"bg": "#191a24", "primary": "#e63946", "accent": "#ffd166", "glow": "#f8f9fa"},
    "meerkat_sentry": {"bg": "#2b2313", "primary": "#d4a373", "accent": "#e76f51", "glow": "#faedcd"},
    "baby_hippo_lotus": {"bg": "#13212b", "primary": "#f72585", "accent": "#48cae4", "glow": "#ffc6ff"},
    "baby_rhino_horn": {"bg": "#1c1e24", "primary": "#adb5bd", "accent": "#ffd166", "glow": "#e9ecef"},
    "baby_ostrich_runner": {"bg": "#241b21", "primary": "#f72585", "accent": "#ffd166", "glow": "#ffc6ff"},
    "oasis_spring_spirit": {"bg": "#0b261c", "primary": "#48cae4", "accent": "#52b788", "glow": "#90e0ef"},

    # Chapter 3: Happy Farm
    "dairy_cow_bella": {"bg": "#191b24", "primary": "#e63946", "accent": "#ffd166", "glow": "#f8f9fa"},
    "muddy_piglet_barny": {"bg": "#2e171b", "primary": "#f72585", "accent": "#d4a373", "glow": "#ffb3c6"},
    "fluffy_sheep_wool": {"bg": "#121b29", "primary": "#3a86ff", "accent": "#ffd166", "glow": "#caf0f8"},
    "baby_goat_billy": {"bg": "#262316", "primary": "#52b788", "accent": "#ffd166", "glow": "#faedcd"},
    "farm_hen_chick": {"bg": "#2b1c10", "primary": "#e76f51", "accent": "#ffd166", "glow": "#ffba08"},
    "proud_rooster_crow": {"bg": "#260e10", "primary": "#e63946", "accent": "#2a9d8f", "glow": "#ffba08"},
    "yellow_duckling_quack": {"bg": "#262309", "primary": "#ffd166", "accent": "#52b788", "glow": "#fff3b0"},
    "farm_pony_clover": {"bg": "#2e1c0d", "primary": "#f4a261", "accent": "#ffd166", "glow": "#ffeaa7"},
    "golden_haystack_spirit": {"bg": "#2e2507", "primary": "#ffd166", "accent": "#e63946", "glow": "#ffeaa7"},

    # Chapter 4: Tropical Jungle
    "tiger_cub_rajah": {"bg": "#2e1606", "primary": "#f4a261", "accent": "#e76f51", "glow": "#ffba08"},
    "monkey_banana_momo": {"bg": "#261a0f", "primary": "#ffd166", "accent": "#d4a373", "glow": "#ffeaa7"},
    "toucan_rainbow_beak": {"bg": "#141a29", "primary": "#ffd166", "accent": "#e63946", "glow": "#4cc9f0"},
    "sloth_tree_hugger": {"bg": "#241e14", "primary": "#52b788", "accent": "#d4a373", "glow": "#b7e4c7"},
    "baby_tapir_snout": {"bg": "#181a21", "primary": "#adb5bd", "accent": "#f72585", "glow": "#f8f9fa"},
    "scarlet_macaw_rio": {"bg": "#2b0a11", "primary": "#e63946", "accent": "#ffd166", "glow": "#4cc9f0"},
    "capybara_flower_zen": {"bg": "#261b0e", "primary": "#f4a261", "accent": "#f72585", "glow": "#ffeaa7"},
    "red_eyed_tree_frog": {"bg": "#0c2414", "primary": "#52b788", "accent": "#e63946", "glow": "#80ed99"},
    "ancient_jungle_totem": {"bg": "#1b210f", "primary": "#52b788", "accent": "#ffd166", "glow": "#d8f3dc"},

    # Chapter 5: Arctic & Polar
    "polar_bear_cub_nanook": {"bg": "#1a1624", "primary": "#e63946", "accent": "#48cae4", "glow": "#ffffff"},
    "penguin_beanie_pip": {"bg": "#141b26", "primary": "#ffd166", "accent": "#f4a261", "glow": "#caf0f8"},
    "arctic_fox_snowy": {"bg": "#161b2b", "primary": "#48cae4", "accent": "#90e0ef", "glow": "#ffffff"},
    "baby_harp_seal": {"bg": "#121d29", "primary": "#48cae4", "accent": "#adb5bd", "glow": "#e0fbfc"},
    "snowy_owl_hedwig": {"bg": "#171824", "primary": "#ffd166", "accent": "#adb5bd", "glow": "#ffffff"},
    "mountain_goat_snow": {"bg": "#212129", "primary": "#adb5bd", "accent": "#d4a373", "glow": "#ffffff"},
    "tibetan_yak_yogi": {"bg": "#291811", "primary": "#ffd166", "accent": "#e63946", "glow": "#f4a261"},
    "chubby_marmot_marm": {"bg": "#291e10", "primary": "#f4a261", "accent": "#d4a373", "glow": "#ffeaa7"},
    "ice_crystal_guardian": {"bg": "#0a1f33", "primary": "#48cae4", "accent": "#ffd166", "glow": "#90e0ef"}
}

ELEMENT_FALLBACK = {
    "earth": {"bg": "#222018", "primary": "#d4a373", "accent": "#ccd5ae", "glow": "#faedcd"},
    "fire": {"bg": "#2b1b11", "primary": "#e76f51", "accent": "#f4a261", "glow": "#ffba08"},
    "water": {"bg": "#0f2430", "primary": "#2a9d8f", "accent": "#48cae4", "glow": "#90e0ef"},
    "wind": {"bg": "#182628", "primary": "#52b788", "accent": "#74c69d", "glow": "#b7e4c7"},
    "wood": {"bg": "#122616", "primary": "#52b788", "accent": "#ffd166", "glow": "#d8f3dc"},
    "light": {"bg": "#242017", "primary": "#ffd166", "accent": "#48cae4", "glow": "#ffffff"}
}

def register():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    animal_exists = False
    for col in collections:
        if col["id"] == "animal":
            animal_exists = True
            col["name"] = "Thế Giới Động Vật"
            col["japaneseTitle"] = "動物王国 • かわいい動物たち"
            col["themeFolder"] = "animal"
            col["description"] = "Siêu bộ sưu tập 45 loài động vật đáng yêu khắp 5 châu lục: Thú cưng, Thảo nguyên Châu Phi, Nông trại, Rừng Amazon và Miền tuyết Bắc Cực."
            col["totalCharacters"] = 45
            col["totalChapters"] = 5
            col["rewardLegendaryId"] = "shiba_inu"

    if not animal_exists:
        collections.append({
            "id": "animal",
            "name": "Thế Giới Động Vật",
            "japaneseTitle": "動物王国 • かわいい動物たち",
            "themeFolder": "animal",
            "description": "Siêu bộ sưu tập 45 loài động vật đáng yêu khắp 5 châu lục: Thú cưng, Thảo nguyên Châu Phi, Nông trại, Rừng Amazon và Miền tuyết Bắc Cực.",
            "totalCharacters": 45,
            "totalChapters": 5,
            "rewardLegendaryId": "shiba_inu"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Animal Kingdom (animal) collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out existing animal characters
    characters = [c for c in characters if c.get("collection") != "animal"]

    added_count = 0
    for sheet_idx, sheet in enumerate(ANIMAL_SHEET_CONFIGS):
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
                "collection": "animal",
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
                    "charm": 98 if char["rarity"] == "legendary" else (90 if char["rarity"] == "epic" else 84),
                    "mischief": 92 if char["rarity"] == "legendary" else (86 if char["rarity"] == "epic" else 78),
                    "mystery": 90 if char["rarity"] == "legendary" else 80
                },
                "palette": palette,
                "imagePath": f"assets/themes/animal/characters/{ch_id}/{cid}.png"
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Animal Kingdom characters into characters.json! Total characters in game: {len(characters)}")

if __name__ == "__main__":
    register()
