import json
import os

CHARACTERS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/characters.json"
COLLECTIONS_JSON = "/Users/huynhtronghieu/Documents/game/noi-thu/src/data/collections.json"

GREEK_KATAKANA = {
    "kronos": "クロノス",
    "rhea": "レア",
    "atlas": "アトラス",
    "prometheus": "プロメテウス",
    "gaia": "ガイア",
    "oceanus": "オケアノス",
    "helios": "ヘリオス",
    "typhon": "テュポン",
    "echidna": "エキドナ",

    "heracles": "ヘラクレス",
    "perseus": "ペルセウス",
    "theseus": "テーセウス",
    "ares_warrior": "アレス戦士",
    "odysseus": "オデュッセウス",
    "jason": "イアソン",
    "atalanta": "アタランテ",
    "bellerophon": "ベレロフォン",
    "orpheus": "オルフェウス",

    "hades": "ハデス",
    "demeter": "デメテル",
    "persephone": "ペルセポネ",
    "hephaestus": "ヘパイストス",
    "dionysus": "ディオニュソス",
    "hestia": "ヘスティア",
    "eros": "エロス",
    "nike": "ニケ",
    "hecate": "ヘカテー",

    "medusa": "メドゥーサ",
    "minotaur": "ミノタウロス",
    "cerberus": "ケルベロス",
    "hydra": "ヒュドラ",
    "chimera": "キマイラ",
    "pegasus": "ペガサス",
    "cyclops": "キュクロプス",
    "greek_sphinx": "ギリシャスフィンクス",
    "nemean_lion": "ネメアの獅子",

    "charon": "カロン",
    "thanatos": "タナトス",
    "hypnos": "ヒュプノス",
    "nyx": "ニュクス",
    "nemesis": "ネメシス",
    "clotho": "クロト",
    "lachesis": "ラケシス",
    "atropos": "アトロポス",
    "melinoe": "メリノエ"
}

PALETTES = {
    "earth": {
        "bg": "#222018",
        "primary": "#d4a373",
        "accent": "#ccd5ae",
        "glow": "#faedcd"
    },
    "fire": {
        "bg": "#2b1b11",
        "primary": "#e76f51",
        "accent": "#f4a261",
        "glow": "#ffba08"
    },
    "water": {
        "bg": "#0f2430",
        "primary": "#2a9d8f",
        "accent": "#48cae4",
        "glow": "#90e0ef"
    },
    "wind": {
        "bg": "#182628",
        "primary": "#52b788",
        "accent": "#74c69d",
        "glow": "#b7e4c7"
    },
    "spirit": {
        "bg": "#241a33",
        "primary": "#7209b7",
        "accent": "#9d4edd",
        "glow": "#e0aaff"
    }
}

CUSTOM_PALETTES = {
    "kronos": {"bg": "#2d2416", "primary": "#e0a96d", "accent": "#ecc8af", "glow": "#ffd166"},
    "helios": {"bg": "#2e1f0f", "primary": "#f39c12", "accent": "#f1c40f", "glow": "#ffeaa7"},
    "hades": {"bg": "#1a162b", "primary": "#5a189a", "accent": "#7b2cbf", "glow": "#c77dff"},
    "medusa": {"bg": "#14281d", "primary": "#2d6a4f", "accent": "#52b788", "glow": "#95d5b2"},
    "nyx": {"bg": "#101026", "primary": "#3a0ca3", "accent": "#4cc9f0", "glow": "#7209b7"}
}

from cut_greece_characters import GREECE_SHEET_CONFIGS

def run():
    # 1. Update collections.json
    with open(COLLECTIONS_JSON, "r", encoding="utf-8") as f:
        collections = json.load(f)

    # Check if greece exists
    greece_exists = False
    for col in collections:
        if col["id"] == "greece":
            greece_exists = True
            col["name"] = "Thần Thoại Hy Lạp"
            col["japaneseTitle"] = "ギリシャ神話"
            col["themeFolder"] = "greece"
            col["description"] = "Bộ sưu tập các vị thần đỉnh Olympus, anh hùng sử thi và quái thú thần thoại Hy Lạp cổ đại."
            col["totalCharacters"] = 45
            col["totalChapters"] = 5
            col["rewardLegendaryId"] = "kronos"

    if not greece_exists:
        collections.append({
            "id": "greece",
            "name": "Thần Thoại Hy Lạp",
            "japaneseTitle": "ギリシャ神話",
            "themeFolder": "greece",
            "description": "Bộ sưu tập các vị thần đỉnh Olympus, anh hùng sử thi và quái thú thần thoại Hy Lạp cổ đại.",
            "totalCharacters": 45,
            "totalChapters": 5,
            "rewardLegendaryId": "kronos"
        })

    with open(COLLECTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(collections, f, ensure_ascii=False, indent=2)
    print("✓ Updated collections.json with Greece collection!")

    # 2. Update characters.json
    with open(CHARACTERS_JSON, "r", encoding="utf-8") as f:
        characters = json.load(f)

    # Filter out any existing greece characters to allow clean re-registration
    characters = [c for c in characters if c.get("collection") != "greece"]

    added_count = 0
    for sheet_idx, sheet in enumerate(GREECE_SHEET_CONFIGS):
        ch_num = sheet_idx + 1
        ch_id = sheet["chapter_dir"]
        ch_title = sheet["title"]

        for char in sheet["characters"]:
            cid = char["id"]
            katakana = GREEK_KATAKANA.get(cid, char["name"])
            element = char["element"]
            palette = CUSTOM_PALETTES.get(cid, PALETTES.get(element, PALETTES["earth"]))

            char_entry = {
                "id": cid,
                "name": char["name"],
                "japaneseName": katakana,
                "collection": "greece",
                "rarity": char["rarity"],
                "element": element,
                "description": char["desc"],
                "symbol": char["symbol"],
                "asset": f"/assets/themes/greece/characters/{ch_id}/{cid}.png",
                "palette": palette,
                "chapter": ch_num,
                "chapterId": ch_id,
                "chapterTitle": ch_title
            }
            characters.append(char_entry)
            added_count += 1

    with open(CHARACTERS_JSON, "w", encoding="utf-8") as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"✓ Registered {added_count} Greek characters into characters.json! Total characters in DB: {len(characters)}")

if __name__ == "__main__":
    run()
