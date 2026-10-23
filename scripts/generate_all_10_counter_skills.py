#!/usr/bin/env python3
"""
Generate all 10 high-definition, transparent PNG Counter Skill icons (skill_cnt_*.png)
for the 10 Yokai Companions in Foxy Pair.

All icons are 300x300 RGBA with 100% transparent backgrounds outside the circular frame,
matching the exact art style of skill_act_*.png and skill_pas_*.png.
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SKILLS_DIR = "public/assets/skills"
os.makedirs(SKILLS_DIR, exist_ok=True)

SIZE = 300
CENTER = SIZE // 2
RADIUS = 135

def make_counter_base(bg_color_inner, bg_color_outer, ring_color=(255, 183, 3), inner_ring_color=(217, 4, 41)):
    """Creates a circular glowing emblem base with amber/golden counter styling."""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Radial background gradient within circular radius
    steps = 45
    for i in range(steps):
        r = int(RADIUS * (1.0 - i / steps))
        if r <= 0:
            break
        t = i / steps
        r_c = int(bg_color_outer[0] * (1 - t) + bg_color_inner[0] * t)
        g_c = int(bg_color_outer[1] * (1 - t) + bg_color_inner[1] * t)
        b_c = int(bg_color_outer[2] * (1 - t) + bg_color_inner[2] * t)
        a_c = int(225 + 30 * t)
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), fill=(r_c, g_c, b_c, a_c))
        
    # 2. Ornate Outer Rings
    ring_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring_img)
    rd.ellipse((CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS), outline=ring_color, width=5)
    if inner_ring_color:
        rd.ellipse((CENTER - RADIUS + 6, CENTER - RADIUS + 6, CENTER + RADIUS - 6, CENTER + RADIUS - 6), outline=inner_ring_color, width=2)
    
    # Small cardinal dots
    dot_dist = RADIUS
    dot_color = (255, 235, 160, 240)
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(angle)
        dx = CENTER + int(dot_dist * math.cos(rad))
        dy = CENTER + int(dot_dist * math.sin(rad))
        s = 3 if angle % 90 == 0 else 2
        rd.ellipse((dx - s, dy - s, dx + s, dy + s), fill=dot_color)

    ring_blur = ring_img.filter(ImageFilter.GaussianBlur(0.8))
    img = Image.alpha_composite(img, ring_blur)
    return img

# 1. Cáo Inari: Bát Quái Kính Chiếu Ma (Khắc Ma Dù & Tường Ảo)
def gen_cnt_inari():
    base = make_counter_base((50, 20, 25), (18, 12, 16), ring_color=(255, 183, 3), inner_ring_color=(255, 77, 109))
    draw = ImageDraw.Draw(base)
    # Divine Mirror with Inari Flame Eye that pierces illusions
    cx, cy = CENTER, CENTER
    # Golden Octagonal Mirror rim
    poly = []
    r_oct = 68
    for i in range(8):
        ang = math.radians(i * 45)
        poly.append((cx + int(r_oct * math.cos(ang)), cy + int(r_oct * math.sin(ang))))
    draw.polygon(poly, outline=(255, 215, 0), width=4, fill=(35, 25, 45))
    # Inner Mirror glass
    draw.ellipse((cx - 45, cy - 45, cx + 45, cy + 45), fill=(0, 212, 255, 190), outline=(255, 255, 255, 220), width=3)
    # Fox Eye / Piercing Light inside mirror
    draw.ellipse((cx - 22, cy - 14, cx + 22, cy + 14), fill=(217, 4, 41))
    draw.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=(255, 215, 0))
    draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=(255, 255, 255))
    # Radiating Dispel Rays
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        x1 = cx + int(76 * math.cos(rad))
        y1 = cy + int(76 * math.sin(rad))
        x2 = cx + int(96 * math.cos(rad))
        y2 = cy + int(96 * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=(255, 215, 0, 180), width=3)
    return base

# 2. Rồng Ryujin: Định Hải Trấn Ba Châu (Khắc Kraken & Apep Sóng Thần)
def gen_cnt_ryujin():
    base = make_counter_base((12, 45, 60), (8, 20, 35), ring_color=(0, 245, 212), inner_ring_color=(0, 180, 216))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Golden Neptune Anchor / Trident Piercing Great Waves
    # Ocean Waves suppressed below
    draw.arc((cx - 75, cy + 10, cx + 75, cy + 70), start=0, end=180, fill=(0, 180, 216), width=6)
    draw.arc((cx - 60, cy + 25, cx + 60, cy + 85), start=0, end=180, fill=(72, 202, 228), width=4)
    # Divine Water Pearl Anchor
    draw.ellipse((cx - 32, cy - 35, cx + 32, cy + 29), fill=(0, 245, 212, 220), outline=(255, 255, 255), width=3)
    draw.ellipse((cx - 16, cy - 20, cx + 16, cy + 12), fill=(255, 255, 255, 240))
    # Golden Trident Shaft & Crown
    draw.line([cx, cy - 75, cx, cy + 45], fill=(255, 215, 0), width=6)
    draw.polygon([(cx - 28, cy - 55), (cx - 24, cy - 78), (cx - 20, cy - 55)], fill=(255, 215, 0))
    draw.polygon([(cx + 20, cy - 55), (cx + 24, cy - 78), (cx + 28, cy - 55)], fill=(255, 215, 0))
    draw.polygon([(cx - 7, cy - 75), (cx, cy - 92), (cx + 7, cy - 75)], fill=(255, 255, 255))
    return base

# 3. Hi-no-tori: Liệt Diệm Phá Băng (Khắc Tuyết Nữ & Quỷ Băng)
def gen_cnt_hinotori():
    base = make_counter_base((60, 22, 14), (25, 8, 8), ring_color=(255, 89, 94), inner_ring_color=(255, 183, 3))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Cracked Ice crystal shattered by Phoenix Sun Fire
    # Ice shards breaking
    draw.polygon([(cx - 65, cy - 35), (cx - 30, cy - 65), (cx - 45, cy + 25)], fill=(144, 224, 239, 130), outline=(255, 255, 255), width=2)
    draw.polygon([(cx + 65, cy - 35), (cx + 30, cy - 65), (cx + 45, cy + 25)], fill=(144, 224, 239, 130), outline=(255, 255, 255), width=2)
    # Bursting Phoenix Fire in the core
    for r in range(55, 10, -8):
        alpha = int(240 * (1 - r / 60))
        draw.ellipse((cx - r, cy - r + 5, cx + r, cy + r + 5), fill=(255, 100, 30, alpha))
    # Sacred Phoenix Feather of Flame
    draw.ellipse((cx - 15, cy - 65, cx + 15, cy + 25), fill=(255, 215, 0))
    draw.ellipse((cx - 8, cy - 50, cx + 8, cy + 15), fill=(255, 255, 255))
    # Heat sparks
    for dx, dy in [(-35, -55), (35, -55), (-45, 45), (45, 45), (0, -85)]:
        draw.ellipse((cx + dx - 4, cy + dy - 4, cx + dx + 4, cy + dy + 4), fill=(255, 215, 0))
    return base

# 4. Bạch Hổ: Lôi Trảo Phá Giáp (Khắc Thiết Giáp & Hóa Thạch)
def gen_cnt_byakko():
    base = make_counter_base((30, 35, 55), (12, 15, 28), ring_color=(144, 224, 239), inner_ring_color=(255, 255, 255))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Heavy Iron Shield sliced into 3 pieces by glowing tiger claws
    # Iron Shield background
    shield_pts = [(cx, cy - 75), (cx + 60, cy - 50), (cx + 45, cy + 45), (cx, cy + 80), (cx - 45, cy + 45), (cx - 60, cy - 50)]
    draw.polygon(shield_pts, fill=(60, 68, 85), outline=(173, 181, 189), width=4)
    # Core boss armor emblem cracked
    draw.ellipse((cx - 24, cy - 10, cx + 24, cy + 38), fill=(30, 35, 45), outline=(217, 4, 41), width=3)
    # 3 Glowing Cyan/White Claw Slashes cutting completely through
    slashes = [
        [(cx - 55, cy - 65), (cx - 15, cy + 65)],
        [(cx - 20, cy - 75), (cx + 20, cy + 55)],
        [(cx + 15, cy - 65), (cx + 55, cy + 65)]
    ]
    for s in slashes:
        draw.line(s, fill=(0, 240, 255), width=7)
        draw.line(s, fill=(255, 255, 255), width=3)
    return base

# 5. Huyền Vũ: Kim Quy Bách Độc Bất Xâm (Khắc Trùng Độc & Bẫy Chông)
def gen_cnt_genbu():
    base = make_counter_base((20, 50, 35), (8, 24, 18), ring_color=(82, 183, 136), inner_ring_color=(255, 209, 102))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Sacred Emerald Turtle Shell Shield repelling venomous spikes
    # Emerald Shell Hexagons
    shell_r = 65
    hex_pts = []
    for i in range(6):
        ang = math.radians(i * 60 + 30)
        hex_pts.append((cx + int(shell_r * math.cos(ang)), cy + int(shell_r * math.sin(ang))))
    draw.polygon(hex_pts, fill=(45, 106, 79), outline=(116, 198, 157), width=5)
    # Inner Shell Grooves
    for i in range(6):
        ang = math.radians(i * 60 + 30)
        draw.line([cx, cy, cx + int(shell_r * math.cos(ang)), cy + int(shell_r * math.sin(ang))], fill=(183, 228, 199), width=2)
    draw.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), fill=(82, 183, 136), outline=(255, 255, 255), width=3)
    # Poison Drop dissolving into holy mist
    draw.polygon([(cx - 12, cy - 80), (cx, cy - 98), (cx + 12, cy - 80)], fill=(168, 85, 247))
    draw.ellipse((cx - 12, cy - 85, cx + 12, cy - 65), fill=(168, 85, 247), outline=(255, 255, 255), width=2)
    # Dissipating barrier ring
    draw.arc((cx - 85, cy - 85, cx + 85, cy + 85), start=200, end=340, fill=(255, 215, 0), width=4)
    return base

# 6. Kỳ Lân: Thánh Quang Trảm Tà (Khắc Quỷ Vương Ravana & Chaos)
def gen_cnt_kirin():
    base = make_counter_base((40, 25, 45), (16, 10, 22), ring_color=(255, 209, 102), inner_ring_color=(247, 37, 133))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Sacred Lotus blooming with Kirin Antler Holy Light
    # Lotus petals
    petals = [
        [(cx, cy + 45), (cx - 40, cy + 15), (cx, cy - 35), (cx + 40, cy + 15)],
        [(cx - 50, cy + 30), (cx - 75, cy - 10), (cx - 30, cy - 15)],
        [(cx + 50, cy + 30), (cx + 75, cy - 10), (cx + 30, cy - 15)]
    ]
    for p in petals:
        draw.polygon(p, fill=(247, 140, 160), outline=(255, 255, 255), width=2)
    # Golden Antler radiating sacred order
    draw.line([cx - 20, cy - 10, cx - 45, cy - 65], fill=(255, 215, 0), width=5)
    draw.line([cx + 20, cy - 10, cx + 45, cy - 65], fill=(255, 215, 0), width=5)
    draw.line([cx - 35, cy - 40, cx - 60, cy - 45], fill=(255, 215, 0), width=4)
    draw.line([cx + 35, cy - 40, cx + 60, cy - 45], fill=(255, 215, 0), width=4)
    # Sacred jewel in center
    draw.ellipse((cx - 18, cy - 20, cx + 18, cy + 16), fill=(255, 255, 255), outline=(255, 215, 0), width=3)
    return base

# 7. Lôi Thú: Lôi Đình Tảo Lạc (Khắc Boss Tốc Độ & Phân Thân)
def gen_cnt_raiju():
    base = make_counter_base((45, 38, 15), (20, 16, 6), ring_color=(255, 215, 0), inner_ring_color=(0, 240, 255))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # 4-Way Lightning Star disintegrating clone illusions
    for ang in [0, 90, 180, 270]:
        rad = math.radians(ang)
        p1 = (cx + int(35 * math.cos(rad - 0.4)), cy + int(35 * math.sin(rad - 0.4)))
        p2 = (cx + int(90 * math.cos(rad)), cy + int(90 * math.sin(rad)))
        p3 = (cx + int(35 * math.cos(rad + 0.4)), cy + int(35 * math.sin(rad + 0.4)))
        draw.polygon([(cx, cy), p1, p2, p3], fill=(255, 215, 0), outline=(255, 255, 255), width=2)
    # Core Plasma Sphere
    draw.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=(0, 240, 255, 220), outline=(255, 255, 255), width=3)
    draw.ellipse((cx - 15, cy - 15, cx + 15, cy + 15), fill=(255, 255, 255))
    # Electric arcing ring
    draw.arc((cx - 75, cy - 75, cx + 75, cy + 75), start=15, end=75, fill=(255, 255, 255), width=4)
    draw.arc((cx - 75, cy - 75, cx + 75, cy + 75), start=195, end=255, fill=(255, 255, 255), width=4)
    return base

# 8. Quạ Yatagarasu: Kim Ô Nhật Luân (Khắc Màn Đêm & Mù Mắt)
def gen_cnt_yatagarasu():
    base = make_counter_base((50, 25, 12), (20, 10, 5), ring_color=(255, 183, 3), inner_ring_color=(255, 89, 94))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Blazing Golden Sun Eye banishing darkness
    # 12 Sun Rays
    for i in range(12):
        ang = math.radians(i * 30)
        p1 = (cx + int(60 * math.cos(ang - 0.15)), cy + int(60 * math.sin(ang - 0.15)))
        p2 = (cx + int(90 * math.cos(ang)), cy + int(90 * math.sin(ang)))
        p3 = (cx + int(60 * math.cos(ang + 0.15)), cy + int(60 * math.sin(ang + 0.15)))
        draw.polygon([p1, p2, p3], fill=(255, 183, 3), outline=(255, 235, 160), width=2)
    # Solar Disc
    draw.ellipse((cx - 50, cy - 50, cx + 50, cy + 50), fill=(217, 4, 41), outline=(255, 215, 0), width=4)
    # Divine Yatagarasu 3-Legged Crow Eye
    draw.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=(255, 215, 0))
    draw.ellipse((cx - 15, cy - 15, cx + 15, cy + 15), fill=(255, 255, 255))
    return base

# 9. Mèo Nekomata: Chiêu Tài Đoạt Bảo (Khắc Boss Trộm Cắp Đạo Cụ)
def gen_cnt_nekomata():
    base = make_counter_base((40, 20, 45), (18, 8, 20), ring_color=(255, 183, 3), inner_ring_color=(200, 100, 255))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Sacred Koban Gold Coin with Spiritual Cat Paw holding stolen treasures back
    # Giant Golden Koban Coin
    draw.ellipse((cx - 45, cy - 70, cx + 45, cy + 70), fill=(255, 209, 102), outline=(180, 130, 20), width=4)
    # Coin Inscription lines
    draw.line([cx - 25, cy - 40, cx + 25, cy - 40], fill=(180, 130, 20), width=3)
    draw.line([cx - 20, cy + 40, cx + 20, cy + 40], fill=(180, 130, 20), width=3)
    draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=(180, 130, 20))
    # Glowing Cat Paw Emblem in white & pink
    draw.ellipse((cx - 28, cy - 12, cx + 28, cy + 28), fill=(255, 255, 255))
    for dx, dy in [(-18, -22), (-6, -28), (6, -28), (18, -22)]:
        draw.ellipse((cx + dx - 6, cy + dy - 6, cx + dx + 6, cy + dy + 6), fill=(255, 255, 255))
    draw.ellipse((cx - 18, cy, cx + 18, cy + 22), fill=(255, 140, 180))
    return base

# 10. Bát Kỳ Orochi: Thần Kiếm Trảm Trùm (Khắc Boss Tối Cường Boss Arena)
def gen_cnt_orochi():
    base = make_counter_base((40, 15, 50), (16, 6, 22), ring_color=(200, 50, 255), inner_ring_color=(255, 215, 0))
    draw = ImageDraw.Draw(base)
    cx, cy = CENTER, CENTER
    # Muramasa / Kusanagi Sacred Dragon Blade bisecting darkness
    # Dark Aura Serpent coils
    draw.arc((cx - 75, cy - 75, cx + 75, cy + 75), start=45, end=225, fill=(147, 51, 234), width=8)
    # Holy Golden Blade pointing down
    blade_pts = [(cx, cy - 90), (cx + 12, cy - 65), (cx + 10, cy + 45), (cx, cy + 85), (cx - 10, cy + 45), (cx - 12, cy - 65)]
    draw.polygon(blade_pts, fill=(255, 255, 255), outline=(255, 215, 0), width=3)
    # Blade fuller
    draw.line([cx, cy - 80, cx, cy + 65], fill=(200, 50, 255), width=3)
    # Golden Sword Crossguard & Pommel
    draw.rectangle([cx - 30, cy - 65, cx + 30, cy - 55], fill=(255, 215, 0), outline=(255, 255, 255), width=1)
    draw.ellipse((cx - 8, cy - 96, cx + 8, cy - 80), fill=(255, 215, 0))
    # Percentage -15% glow badge
    draw.ellipse((cx + 35, cy + 25, cx + 85, cy + 75), fill=(217, 4, 41), outline=(255, 215, 0), width=2)
    return base

SKILL_GENS = [
    ("skill_cnt_inari_kitsune.png", gen_cnt_inari),
    ("skill_cnt_ryujin_pearl.png", gen_cnt_ryujin),
    ("skill_cnt_hi_no_tori.png", gen_cnt_hinotori),
    ("skill_cnt_byakko_tiger.png", gen_cnt_byakko),
    ("skill_cnt_genbu_tortoise.png", gen_cnt_genbu),
    ("skill_cnt_kirin_sacred.png", gen_cnt_kirin),
    ("skill_cnt_raiju_thunder.png", gen_cnt_raiju),
    ("skill_cnt_yatagarasu_crow.png", gen_cnt_yatagarasu),
    ("skill_cnt_nekomata_cat.png", gen_cnt_nekomata),
    ("skill_cnt_orochi_serpent.png", gen_cnt_orochi)
]

def main():
    print(f"Generating 10 Counter Skill Icons into {SKILLS_DIR}...")
    for filename, func in SKILL_GENS:
        out_path = os.path.join(SKILLS_DIR, filename)
        img = func()
        img.save(out_path, "PNG")
        print(f" ✓ Saved {out_path} ({img.size[0]}x{img.size[1]})")
    print("All 10 counter skill icons successfully generated!")

if __name__ == "__main__":
    main()
