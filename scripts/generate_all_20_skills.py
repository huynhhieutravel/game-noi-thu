#!/usr/bin/env python3
"""
Generate all 20 high-definition, transparent PNG skill icons for the 10 Yokai Companions.
Each companion gets:
- 1 Active Skill (Tuyệt chiêu): pure spell/attack effect (NO whole animals!)
- 1 Passive Skill (Nội tại): pure buff/relic/passive aura (NO whole animals!)

All icons are 300x300 RGBA with 100% transparent backgrounds outside the circular frame.
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

def make_base(bg_color_inner, bg_color_outer, ring_color, inner_ring_color=None):
    """Creates a circular glowing emblem base with transparent background."""
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
        a_c = int(220 + 35 * t)
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), fill=(r_c, g_c, b_c, a_c))
        
    # 2. Ornate Rings
    ring_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring_img)
    rd.ellipse((CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS), outline=ring_color, width=5)
    if inner_ring_color:
        rd.ellipse((CENTER - RADIUS + 6, CENTER - RADIUS + 6, CENTER + RADIUS - 6, CENTER + RADIUS - 6), outline=inner_ring_color, width=2)
    
    # Small cardinal dots
    dot_dist = RADIUS
    dot_color = (255, 255, 255, 220)
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(angle)
        dx = CENTER + int(dot_dist * math.cos(rad))
        dy = CENTER + int(dot_dist * math.sin(rad))
        s = 3 if angle % 90 == 0 else 2
        rd.ellipse((dx - s, dy - s, dx + s, dy + s), fill=dot_color)

    ring_blur = ring_img.filter(ImageFilter.GaussianBlur(0.8))
    img = Image.alpha_composite(img, ring_blur)
    return img

def apply_circle_clip(img):
    """Ensures 100% transparency outside the radius + 2px antialiased boundary."""
    mask = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((CENTER - RADIUS - 2, CENTER - RADIUS - 2, CENTER + RADIUS + 2, CENTER + RADIUS + 2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

def load_relic_cutout(path, size_target=210, brightness_boost=1.1):
    """Loads a relic PNG and extracts pure RGBA cutout scaled to target."""
    if not os.path.exists(path):
        return None
    im = Image.open(path).convert("RGBA")
    im.thumbnail((size_target, size_target), Image.Resampling.LANCZOS)
    if brightness_boost != 1.0:
        arr = np.array(im, dtype=np.float32)
        arr[:, :, :3] = np.clip(arr[:, :, :3] * brightness_boost, 0, 255)
        im = Image.fromarray(arr.astype(np.uint8))
    return im

def paste_centered(base, fg, offset_y=0):
    """Pastes fg centered on base with optional y offset."""
    x = CENTER - fg.width // 2
    y = CENTER - fg.height // 2 + offset_y
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    layer.paste(fg, (x, y), fg)
    return Image.alpha_composite(base, layer)

def add_glow_rays(img, color, num_rays=8, max_len=110):
    """Draws radiant sun/magic rays from center."""
    ray_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(ray_layer)
    for i in range(num_rays):
        angle = (360 / num_rays) * i
        rad = math.radians(angle)
        x2 = CENTER + int(max_len * math.cos(rad))
        y2 = CENTER + int(max_len * math.sin(rad))
        d.line([(CENTER, CENTER), (x2, y2)], fill=color, width=4)
    ray_blur = ray_layer.filter(ImageFilter.GaussianBlur(4.0))
    return Image.alpha_composite(img, ray_blur)

# ==============================================================================
# 1. INARI KITSUNE
# ==============================================================================
def gen_act_inari():
    # Active: Linh Hồ Xuất Kích - Spiraling Sacred Fox-fire orb & Ofuda Talismans
    im = make_base((38, 12, 30), (14, 5, 12), (255, 77, 109, 255), (255, 215, 0, 200))
    im = add_glow_rays(im, (255, 117, 143, 80), num_rays=12, max_len=105)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Sacred Blue/Pink Fire Orb
    for r in range(48, 0, -4):
        t = r / 48
        d.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), 
                  fill=(int(56 + (255-56)*(1-t)), int(189 + (77-189)*(1-t)), 248, int(180 + 75*t)))
    # Inner blazing white core
    d.ellipse((CENTER - 18, CENTER - 18, CENTER + 18, CENTER + 18), fill=(255, 255, 255, 255))
    
    # 4 Floating Ofuda Charms (Rectangular talismans with sacred red marks)
    for angle in [40, 130, 220, 310]:
        rad = math.radians(angle)
        cx = CENTER + int(76 * math.cos(rad))
        cy = CENTER + int(76 * math.sin(rad))
        # Draw small rotated card
        d.rectangle((cx - 10, cy - 16, cx + 10, cy + 16), fill=(255, 250, 230, 240), outline=(220, 38, 38, 240), width=2)
        d.line([(cx, cy - 10), (cx, cy + 10)], fill=(220, 38, 38, 255), width=2)
        d.ellipse((cx - 3, cy - 6, cx + 3, cy), fill=(220, 38, 38, 255))
    
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.2))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_inari():
    # Passive: Kitsune Fortune - Golden Suzu Bell, Red Knot & Coins
    im = make_base((40, 18, 10), (16, 8, 4), (255, 195, 0, 255), (255, 107, 129, 200))
    im = add_glow_rays(im, (255, 215, 0, 70), num_rays=8, max_len=100)
    
    # Try using reward coin as element
    coin = load_relic_cutout("public/assets/icon_reward_coin.png", size_target=140)
    if coin:
        im = paste_centered(im, coin, offset_y=-10)
    
    # Draw Japanese Sacred Red Braided Knot & Bell underneath
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Auspicious red bow / knot
    d.line([(CENTER - 35, CENTER + 45), (CENTER + 35, CENTER + 45)], fill=(230, 30, 60, 240), width=6)
    d.line([(CENTER - 25, CENTER + 45), (CENTER - 38, CENTER + 80)], fill=(230, 30, 60, 240), width=5)
    d.line([(CENTER + 25, CENTER + 45), (CENTER + 38, CENTER + 80)], fill=(230, 30, 60, 240), width=5)
    d.ellipse((CENTER - 12, CENTER + 36, CENTER + 12, CENTER + 56), fill=(255, 215, 0, 255), outline=(180, 130, 0, 255), width=2)
    
    # Sparkles
    for sp in [(CENTER - 60, CENTER - 40), (CENTER + 65, CENTER - 35), (CENTER - 50, CENTER + 30), (CENTER + 55, CENTER + 35)]:
        d.ellipse((sp[0]-4, sp[1]-4, sp[0]+4, sp[1]+4), fill=(255, 255, 255, 240))
        d.line([(sp[0]-7, sp[1]), (sp[0]+7, sp[1])], fill=(255, 215, 0, 220), width=2)
        d.line([(sp[0], sp[1]-7), (sp[0], sp[1]+7)], fill=(255, 215, 0, 220), width=2)
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 2. RYUJIN PEARL
# ==============================================================================
def gen_act_ryujin():
    # Active: Ngưng Đọng Long Châu - Freezing Dragon Pearl & Time Freeze Ring
    im = make_base((10, 36, 50), (4, 14, 22), (0, 245, 212, 255), (144, 224, 239, 200))
    im = add_glow_rays(im, (0, 245, 212, 90), num_rays=12, max_len=115)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Clock tick marks for time stop
    for i in range(12):
        angle = i * 30
        rad = math.radians(angle)
        x1 = CENTER + int(82 * math.cos(rad))
        y1 = CENTER + int(82 * math.sin(rad))
        x2 = CENTER + int(94 * math.cos(rad))
        y2 = CENTER + int(94 * math.sin(rad))
        d.line([(x1, y1), (x2, y2)], fill=(144, 224, 239, 230), width=3)
        
    # Freezing Dragon Pearl
    for r in range(54, 0, -4):
        t = r / 54
        c = int(245 * (1 - t) + 255 * t)
        d.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), 
                  fill=(0, int(200 + 45*t), c, int(180 + 75*t)))
    # White frozen core with snowflake crystal
    d.ellipse((CENTER - 20, CENTER - 20, CENTER + 20, CENTER + 20), fill=(255, 255, 255, 255))
    # Snowflake arms
    for angle in [0, 60, 120, 180, 240, 300]:
        rad = math.radians(angle)
        x = CENTER + int(36 * math.cos(rad))
        y = CENTER + int(36 * math.sin(rad))
        d.line([(CENTER, CENTER), (x, y)], fill=(255, 255, 255, 240), width=3)
    
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.0))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_ryujin():
    # Passive: Long Mạch Thủy Triều - Ocean Tidal Surge & Gold Influx
    im = make_base((8, 28, 48), (3, 10, 20), (0, 180, 216, 255), (255, 215, 0, 200))
    relic = load_relic_cutout("public/assets/relics/relic_pirate_02.png", size_target=165)
    if relic:
        im = paste_centered(im, relic, offset_y=-8)
        
    # Add rushing water waves & gold coins
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Spiraling wave crests
    d.arc((CENTER - 70, CENTER - 70, CENTER + 70, CENTER + 70), start=30, end=190, fill=(144, 224, 239, 220), width=6)
    d.arc((CENTER - 85, CENTER - 85, CENTER + 85, CENTER + 85), start=200, end=350, fill=(0, 245, 212, 220), width=5)
    
    # Floating gold coins
    for pos in [(CENTER - 65, CENTER + 45), (CENTER + 65, CENTER + 40), (CENTER, CENTER + 65)]:
        d.ellipse((pos[0]-10, pos[1]-8, pos[0]+10, pos[1]+8), fill=(255, 215, 0, 240), outline=(200, 140, 0, 255), width=2)
        d.ellipse((pos[0]-3, pos[1]-2, pos[0]+3, pos[1]+2), fill=(200, 140, 0, 255))
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 3. HI-NO-TORI
# ==============================================================================
def gen_act_hinotori():
    # Active: Hỏa Diệm Thanh Tẩy - Sacred Flaming Phoenix Blade Incinerating Obstacles
    im = make_base((50, 16, 12), (18, 5, 4), (255, 89, 94, 255), (255, 202, 58, 220))
    im = add_glow_rays(im, (255, 100, 30, 90), num_rays=12, max_len=115)
    
    sword = load_relic_cutout("public/assets/relics/relic_yokai_03.png", size_target=175)
    if sword:
        # Rotate sword slightly for a dynamic slash angle
        sword_rot = sword.rotate(-25, resample=Image.Resampling.BICUBIC)
        im = paste_centered(im, sword_rot, offset_y=0)
        
    # Fiery explosive slash aura
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Dynamic curved flame slash
    d.arc((CENTER - 95, CENTER - 95, CENTER + 95, CENTER + 95), start=120, end=270, fill=(255, 200, 40, 230), width=7)
    d.arc((CENTER - 88, CENTER - 88, CENTER + 88, CENTER + 88), start=130, end=260, fill=(255, 80, 20, 255), width=4)
    # Fiery embers
    for ember in [(CENTER - 50, CENTER - 60), (CENTER + 60, CENTER - 45), (CENTER - 70, CENTER + 30), (CENTER + 45, CENTER + 55)]:
        d.ellipse((ember[0]-5, ember[1]-5, ember[0]+5, ember[1]+5), fill=(255, 220, 50, 240))
        d.ellipse((ember[0]-2, ember[1]-2, ember[0]+2, ember[1]+2), fill=(255, 255, 255, 255))
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_hinotori():
    # Passive: Tro Tàn Tái Sinh - Sacred Phoenix Rebirth Feather from Golden Embers
    im = make_base((48, 14, 18), (18, 4, 6), (255, 112, 67, 255), (255, 215, 0, 220))
    im = add_glow_rays(im, (255, 120, 40, 70), num_rays=10, max_len=105)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Golden Brazier / Rebirth Hearth at bottom
    d.ellipse((CENTER - 60, CENTER + 50, CENTER + 60, CENTER + 80), fill=(80, 30, 20, 255), outline=(255, 200, 50, 255), width=3)
    d.ellipse((CENTER - 45, CENTER + 52, CENTER + 45, CENTER + 72), fill=(255, 90, 30, 240))
    
    # Glowing Phoenix Sacred Feather rising upward
    # Feather quill shaft
    points_shaft = [(CENTER, CENTER + 50), (CENTER - 4, CENTER + 10), (CENTER, CENTER - 30), (CENTER + 8, CENTER - 70)]
    for i in range(len(points_shaft)-1):
        d.line([points_shaft[i], points_shaft[i+1]], fill=(255, 240, 180, 255), width=4)
    
    # Feather vanes (glowing flame barbs)
    for y in range(CENTER - 60, CENTER + 40, 8):
        dist = abs(y - (CENTER - 15))
        w = int(max(10, 38 - dist * 0.7))
        # left vane
        d.line([(CENTER - 2, y), (CENTER - w, y - 8)], fill=(255, 140, 40, 220), width=3)
        d.line([(CENTER - 2, y), (CENTER - int(w*0.7), y - 6)], fill=(255, 230, 80, 240), width=2)
        # right vane
        d.line([(CENTER + 2, y), (CENTER + w, y - 6)], fill=(255, 100, 30, 220), width=3)
        d.line([(CENTER + 2, y), (CENTER + int(w*0.7), y - 4)], fill=(255, 230, 80, 240), width=2)
        
    # Rebirth Golden Flame Core
    d.ellipse((CENTER - 15, CENTER - 15, CENTER + 15, CENTER + 15), fill=(255, 255, 200, 220))
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.0))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 4. BYAKKO TIGER
# ==============================================================================
def gen_act_byakko():
    # Active: Bạch Hổ Cuồng Trảm - Razor-sharp White/Cyan Claw Slash Shockwaves
    im = make_base((12, 32, 45), (4, 12, 18), (56, 189, 248, 255), (255, 255, 255, 240))
    im = add_glow_rays(im, (56, 189, 248, 80), num_rays=8, max_len=110)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # 3 Fierce Diagonal Tiger Claw Slashes
    slashes = [
        [(CENTER - 85, CENTER - 45), (CENTER - 25, CENTER - 20), (CENTER + 40, CENTER + 55)],
        [(CENTER - 60, CENTER - 75), (CENTER + 5, CENTER - 5), (CENTER + 70, CENTER + 65)],
        [(CENTER - 30, CENTER - 85), (CENTER + 35, CENTER - 15), (CENTER + 90, CENTER + 45)]
    ]
    for pts in slashes:
        # Outer cyan glow
        d.line(pts, fill=(56, 189, 248, 255), width=12)
        # Inner piercing white blade
        d.line(pts, fill=(255, 255, 255, 255), width=5)
        
    # Slash Impact Shockwave Arcs
    d.arc((CENTER - 95, CENTER - 95, CENTER + 95, CENTER + 95), start=300, end=40, fill=(224, 242, 254, 220), width=4)
    d.arc((CENTER - 75, CENTER - 75, CENTER + 75, CENTER + 75), start=120, end=210, fill=(56, 189, 248, 200), width=4)
    
    # Sharp claw sparks
    for sp in [(CENTER + 55, CENTER + 60), (CENTER - 70, CENTER - 60), (CENTER + 20, CENTER - 10)]:
        d.ellipse((sp[0]-6, sp[1]-6, sp[0]+6, sp[1]+6), fill=(255, 255, 255, 255))
        d.line([(sp[0]-10, sp[1]), (sp[0]+10, sp[1])], fill=(56, 189, 248, 255), width=2)
        d.line([(sp[0], sp[1]-10), (sp[0], sp[1]+10)], fill=(56, 189, 248, 255), width=2)
        
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.5))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_byakko():
    # Passive: Tốc Chiến Tiên Phong - Winged Swift Gale Boots & Speed Streaks
    im = make_base((14, 28, 42), (5, 10, 16), (14, 165, 233, 255), (250, 204, 21, 220))
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Wind Speed Streaks (horizontal motion blur lines)
    for y, x_start, x_end, w in [
        (CENTER - 45, 45, 190, 3), (CENTER - 25, 30, 220, 4), 
        (CENTER + 35, 40, 200, 3), (CENTER + 55, 60, 180, 2)
    ]:
        d.line([(x_start, y), (x_end, y)], fill=(125, 211, 252, 180), width=w)
        
    # Golden Wing of Speed (Hermes / Tiger Gale Wing)
    # Main feather curves
    wing_pts = [
        (CENTER - 30, CENTER + 25), (CENTER + 20, CENTER + 20), 
        (CENTER + 70, CENTER - 20), (CENTER + 55, CENTER - 50),
        (CENTER + 15, CENTER - 35), (CENTER - 15, CENTER - 10)
    ]
    d.polygon(wing_pts, fill=(255, 255, 255, 240), outline=(250, 204, 21, 255))
    # Wing detail feathers
    for i in range(4):
        offset = i * 14
        d.line([(CENTER - 10 + offset, CENTER + 15 - offset//2), (CENTER + 50 + offset//2, CENTER - 30 - offset//2)], 
               fill=(250, 204, 21, 240), width=3)
        
    # Sonic Gale Shockwave Ring
    d.ellipse((CENTER - 70, CENTER - 70, CENTER + 70, CENTER + 70), outline=(56, 189, 248, 160), width=3)
    
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 5. GENBU TORTOISE
# ==============================================================================
def gen_act_genbu():
    # Active: Kim Cang Địa Thuẫn - Earth Boulder Crush & Magma Tectonic Fissure
    im = make_base((32, 24, 12), (12, 8, 4), (245, 158, 11, 255), (101, 163, 13, 220))
    im = add_glow_rays(im, (245, 158, 11, 70), num_rays=8, max_len=105)
    
    # Cracked Tectonic Boulder / Stone Obstacle
    stone = load_relic_cutout("public/assets/obstacles/stone_lv3.png", size_target=150)
    if stone:
        im = paste_centered(im, stone, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Amber glowing seismic fissure lines radiating through rock
    fissures = [
        [(CENTER, CENTER), (CENTER - 45, CENTER - 50), (CENTER - 70, CENTER - 40)],
        [(CENTER, CENTER), (CENTER + 50, CENTER - 35), (CENTER + 75, CENTER - 45)],
        [(CENTER, CENTER), (CENTER - 30, CENTER + 55), (CENTER - 55, CENTER + 75)],
        [(CENTER, CENTER), (CENTER + 40, CENTER + 50), (CENTER + 65, CENTER + 70)]
    ]
    for fiss in fissures:
        d.line(fiss, fill=(251, 191, 36, 255), width=4)
        d.line(fiss, fill=(255, 255, 255, 255), width=1)
        
    # Flying stone debris shards
    for deb in [(CENTER - 60, CENTER + 10), (CENTER + 65, CENTER - 10), (CENTER, CENTER - 65)]:
        d.polygon([(deb[0]-6, deb[1]), (deb[0], deb[1]-8), (deb[0]+6, deb[1]+2), (deb[0], deb[1]+6)], fill=(180, 83, 9, 255), outline=(251, 191, 36, 255))
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_genbu():
    # Passive: Quy Giáp Trường Thọ - Golden Emerald Aegis Tortoise Carapace Shield
    im = make_base((12, 34, 24), (4, 14, 8), (16, 185, 129, 255), (251, 191, 36, 220))
    shield = load_relic_cutout("public/assets/relics/relic_greece_02.png", size_target=170)
    if shield:
        im = paste_centered(im, shield, offset_y=-5)
        
    # Hexagonal Tortoise Carapace Barrier Grid
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    
    def draw_hexagon(cx, cy, rad, col):
        pts = []
        for a in range(0, 360, 60):
            r = math.radians(a + 30)
            pts.append((cx + int(rad * math.cos(r)), cy + int(rad * math.sin(r))))
        d.polygon(pts, outline=col, width=2)
        
    draw_hexagon(CENTER, CENTER - 5, 48, (251, 191, 36, 220))
    for angle in [0, 60, 120, 180, 240, 300]:
        r = math.radians(angle)
        hx = CENTER + int(60 * math.cos(r))
        hy = CENTER - 5 + int(60 * math.sin(r))
        draw_hexagon(hx, hy, 28, (110, 231, 183, 180))
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 6. KIRIN SACRED
# ==============================================================================
def gen_act_kirin():
    # Active: Cát Tường Thanh Tẩy - Radiant Spiral Horn & Prismatic Holy Cleansing Ray
    im = make_base((24, 38, 30), (8, 16, 12), (52, 211, 153, 255), (251, 191, 36, 220))
    im = add_glow_rays(im, (167, 243, 208, 90), num_rays=12, max_len=115)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Sacred Crystalline Kirin Spiral Horn pointing diagonally up
    horn_pts = [
        (CENTER - 25, CENTER + 55), (CENTER + 20, CENTER + 45),
        (CENTER + 40, CENTER - 40), (CENTER + 50, CENTER - 75),
        (CENTER - 5, CENTER - 15)
    ]
    d.polygon(horn_pts, fill=(240, 253, 244, 240), outline=(251, 191, 36, 255))
    # Spiral grooves on horn
    for step in range(5):
        y_step = CENTER + 35 - step * 20
        d.line([(CENTER - 15 + step*10, y_step), (CENTER + 15 + step*8, y_step - 10)], fill=(245, 158, 11, 240), width=3)
        
    # Prismatic Cleansing Star at horn tip
    tip_x, tip_y = CENTER + 50, CENTER - 75
    d.ellipse((tip_x - 18, tip_y - 18, tip_x + 18, tip_y + 18), fill=(255, 255, 255, 255))
    for a in range(0, 360, 45):
        rad = math.radians(a)
        d.line([(tip_x, tip_y), (tip_x + int(45 * math.cos(rad)), tip_y + int(45 * math.sin(rad)))], fill=(251, 191, 36, 220), width=3)
        
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.2))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_kirin():
    # Passive: Sinh Sôi Nảy Nở - Celestial Blooming Lotus & Dew of Vitality
    im = make_base((38, 18, 30), (14, 6, 12), (244, 114, 182, 255), (52, 211, 153, 220))
    im = add_glow_rays(im, (244, 114, 182, 70), num_rays=8, max_len=100)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Sacred Emerald Lotus Leaf Pad underneath
    d.ellipse((CENTER - 75, CENTER + 30, CENTER + 75, CENTER + 65), fill=(16, 185, 129, 240), outline=(251, 191, 36, 255), width=2)
    
    # Radiant Sacred Lotus Petals (Pink and Gold)
    # Outer petals
    for a in [-50, -25, 0, 25, 50]:
        rad = math.radians(a - 90)
        px = CENTER + int(55 * math.cos(rad))
        py = CENTER + 35 + int(55 * math.sin(rad))
        d.polygon([(CENTER, CENTER + 35), (px - 14, py + 10), (px, py), (px + 14, py + 10)], 
                  fill=(251, 113, 133, 220), outline=(251, 191, 36, 220))
    # Inner glowing petals
    for a in [-30, 0, 30]:
        rad = math.radians(a - 90)
        px = CENTER + int(42 * math.cos(rad))
        py = CENTER + 35 + int(42 * math.sin(rad))
        d.polygon([(CENTER, CENTER + 35), (px - 10, py + 8), (px, py), (px + 10, py + 8)], 
                  fill=(254, 205, 211, 255), outline=(255, 255, 255, 240))
        
    # Sparkling golden dew drops
    d.ellipse((CENTER - 6, CENTER + 10, CENTER + 6, CENTER + 22), fill=(255, 255, 255, 255))
    for dw in [(CENTER - 40, CENTER - 20), (CENTER + 45, CENTER - 15), (CENTER, CENTER - 45)]:
        d.ellipse((dw[0]-5, dw[1]-5, dw[0]+5, dw[1]+5), fill=(52, 211, 153, 240))
        d.ellipse((dw[0]-2, dw[1]-2, dw[0]+2, dw[1]+2), fill=(255, 255, 255, 255))
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 7. RAIJU THUNDER
# ==============================================================================
def gen_act_raiju():
    # Active: Lôi Quang Liên Nối - Violent High-Voltage Chain Lightning Arcs
    im = make_base((38, 28, 8), (14, 10, 2), (250, 204, 21, 255), (56, 189, 248, 220))
    im = add_glow_rays(im, (250, 204, 21, 90), num_rays=12, max_len=115)
    
    trident = load_relic_cutout("public/assets/relics/relic_greece_03.png", size_target=170)
    if trident:
        im = paste_centered(im, trident, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Violent Zigzag Chain Lightning Arcs jumping across
    bolts = [
        [(CENTER - 85, CENTER - 20), (CENTER - 50, CENTER - 55), (CENTER - 15, CENTER - 25), (CENTER + 20, CENTER - 65), (CENTER + 75, CENTER - 35)],
        [(CENTER - 70, CENTER + 45), (CENTER - 30, CENTER + 15), (CENTER + 15, CENTER + 50), (CENTER + 65, CENTER + 20), (CENTER + 85, CENTER + 60)],
        [(CENTER, CENTER - 85), (CENTER - 20, CENTER - 35), (CENTER + 30, CENTER + 10), (CENTER, CENTER + 80)]
    ]
    for b in bolts:
        d.line(b, fill=(250, 204, 21, 255), width=7)
        d.line(b, fill=(255, 255, 255, 255), width=3)
        
    # High-voltage plasma sparks
    for sp in [(CENTER - 45, CENTER - 45), (CENTER + 50, CENTER - 50), (CENTER + 40, CENTER + 45), (CENTER - 50, CENTER + 35)]:
        d.ellipse((sp[0]-6, sp[1]-6, sp[0]+6, sp[1]+6), fill=(255, 255, 255, 255))
        d.line([(sp[0]-10, sp[1]), (sp[0]+10, sp[1])], fill=(56, 189, 248, 255), width=2)
        d.line([(sp[0], sp[1]-10), (sp[0], sp[1]+10)], fill=(56, 189, 248, 255), width=2)
        
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.2))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_raiju():
    # Passive: Gia Tốc Dẫn Điện - Overcharged Plasma Reactor Core
    im = make_base((10, 24, 45), (3, 8, 18), (56, 189, 248, 255), (250, 204, 21, 220))
    core = load_relic_cutout("public/assets/relics/relic_space_02.png", size_target=165)
    if core:
        im = paste_centered(im, core, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Rotating Tesla coil rings around core
    d.ellipse((CENTER - 65, CENTER - 65, CENTER + 65, CENTER + 65), outline=(56, 189, 248, 220), width=3)
    d.ellipse((CENTER - 80, CENTER - 80, CENTER + 80, CENTER + 80), outline=(250, 204, 21, 180), width=2)
    # Radial electric voltage spikes
    for a in range(0, 360, 45):
        rad = math.radians(a)
        d.line([(CENTER + int(65*math.cos(rad)), CENTER + int(65*math.sin(rad))),
                (CENTER + int(85*math.cos(rad)), CENTER + int(85*math.sin(rad)))], fill=(255, 255, 255, 240), width=3)
                
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 8. YATAGARASU CROW
# ==============================================================================
def gen_act_yatagarasu():
    # Active: Nhật Quang Soi Đường - Blinding Solar Flare Sunburst Piercing Darkness
    im = make_base((45, 28, 8), (16, 10, 2), (245, 158, 11, 255), (255, 255, 255, 240))
    im = add_glow_rays(im, (251, 191, 36, 100), num_rays=16, max_len=120)
    
    wheel = load_relic_cutout("public/assets/relics/relic_india_02.png", size_target=165)
    if wheel:
        im = paste_centered(im, wheel, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Blinding Golden Solar Disc Core
    for r in range(40, 0, -4):
        t = r / 40
        d.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), fill=(255, int(220 + 35*t), int(100*t), int(200 + 55*t)))
    d.ellipse((CENTER - 16, CENTER - 16, CENTER + 16, CENTER + 16), fill=(255, 255, 255, 255))
    
    # Piercing sun flare beams
    for a in [0, 90, 180, 270]:
        rad = math.radians(a)
        d.line([(CENTER, CENTER), (CENTER + int(100 * math.cos(rad)), CENTER + int(100 * math.sin(rad)))], 
               fill=(255, 255, 255, 255), width=5)
               
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.0))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_yatagarasu():
    # Passive: Kim Ô Chỉ Lối - Sacred Eye of Ra Solar Reticle Guidance
    im = make_base((40, 24, 6), (14, 8, 2), (251, 191, 36, 255), (234, 88, 12, 220))
    eye = load_relic_cutout("public/assets/relics/relic_egypt_03.png", size_target=170)
    if eye:
        im = paste_centered(im, eye, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Guidance Crosshair Reticle & Solar Target Rings
    d.ellipse((CENTER - 75, CENTER - 80, CENTER + 75, CENTER + 70), outline=(251, 191, 36, 220), width=2)
    d.ellipse((CENTER - 90, CENTER - 95, CENTER + 90, CENTER + 85), outline=(234, 88, 12, 180), width=1)
    
    # Cardinal Reticle Ticks
    d.line([(CENTER, CENTER - 95), (CENTER, CENTER - 70)], fill=(255, 255, 255, 240), width=3)
    d.line([(CENTER, CENTER + 60), (CENTER, CENTER + 85)], fill=(255, 255, 255, 240), width=3)
    d.line([(CENTER - 90, CENTER - 5), (CENTER - 65, CENTER - 5)], fill=(255, 255, 255, 240), width=3)
    d.line([(CENTER + 65, CENTER - 5), (CENTER + 90, CENTER - 5)], fill=(255, 255, 255, 240), width=3)
    
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 9. NEKOMATA CAT
# ==============================================================================
def gen_act_nekomata():
    # Active: Hoán Đổi Càn Khôn - Mystic Yin-Yang Bagua Spatial Swap Portal
    im = make_base((30, 14, 45), (10, 4, 16), (168, 85, 247, 255), (56, 189, 248, 220))
    im = add_glow_rays(im, (168, 85, 247, 80), num_rays=8, max_len=105)
    
    mirror = load_relic_cutout("public/assets/relics/relic_wuxia_02.png", size_target=170)
    if mirror:
        im = paste_centered(im, mirror, offset_y=-5)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Swirling Twin Spirit Flames (Nekomata Two-Tails)
    d.arc((CENTER - 80, CENTER - 80, CENTER + 80, CENTER + 80), start=45, end=210, fill=(168, 85, 247, 230), width=5)
    d.arc((CENTER - 80, CENTER - 80, CENTER + 80, CENTER + 80), start=225, end=390, fill=(56, 189, 248, 230), width=5)
    
    # Spirit will-o'-the-wisp orbs at arc heads
    d.ellipse((CENTER + 52, CENTER - 52, CENTER + 66, CENTER - 38), fill=(216, 180, 254, 255))
    d.ellipse((CENTER - 66, CENTER + 38, CENTER - 52, CENTER + 52), fill=(186, 230, 253, 255))
    
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_nekomata():
    # Passive: Chiêu Tài Lội Ngược - Double Japanese Golden Koban (x2) & Lucky Knot
    im = make_base((38, 22, 10), (14, 8, 3), (251, 191, 36, 255), (244, 63, 94, 220))
    im = add_glow_rays(im, (251, 191, 36, 80), num_rays=8, max_len=105)
    
    # Stacked golden coins
    coin = load_relic_cutout("public/assets/icon_reward_coin.png", size_target=135)
    if coin:
        im = paste_centered(im, coin, offset_y=-18)
        
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Lucky Red Silk Knot Ribbon
    d.arc((CENTER - 50, CENTER + 30, CENTER + 50, CENTER + 75), start=0, end=180, fill=(244, 63, 94, 240), width=6)
    d.ellipse((CENTER - 14, CENTER + 36, CENTER + 14, CENTER + 64), fill=(251, 191, 36, 255), outline=(180, 120, 0, 255), width=2)
    
    # "x2" Golden Multiplier Stamp
    d.rectangle((CENTER + 35, CENTER - 60, CENTER + 85, CENTER - 25), fill=(225, 29, 72, 240), outline=(251, 191, 36, 255), width=2)
    # Draw simple x2 mark
    # x
    d.line([(CENTER + 45, CENTER - 52), (CENTER + 55, CENTER - 33)], fill=(255, 255, 255, 255), width=3)
    d.line([(CENTER + 55, CENTER - 52), (CENTER + 45, CENTER - 33)], fill=(255, 255, 255, 255), width=3)
    # 2
    d.line([(CENTER + 63, CENTER - 52), (CENTER + 75, CENTER - 52)], fill=(255, 255, 255, 255), width=3)
    d.line([(CENTER + 75, CENTER - 52), (CENTER + 63, CENTER - 33)], fill=(255, 255, 255, 255), width=3)
    d.line([(CENTER + 63, CENTER - 33), (CENTER + 75, CENTER - 33)], fill=(255, 255, 255, 255), width=3)
    
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# 10. OROCHI SERPENT
# ==============================================================================
def gen_act_orochi():
    # Active: Bát Đầu Cuồng Nộ - Twin Venomous Viper Fangs Dripping Emerald Acid
    im = make_base((18, 36, 20), (6, 14, 8), (16, 185, 129, 255), (168, 85, 247, 220))
    im = add_glow_rays(im, (16, 185, 129, 80), num_rays=10, max_len=110)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Serpent Upper Jaw Arch
    d.arc((CENTER - 75, CENTER - 85, CENTER + 75, CENTER - 15), start=0, end=180, fill=(30, 20, 45, 240), width=10)
    
    # Twin Curved Venomous Fangs
    # Left Fang
    left_fang = [(CENTER - 45, CENTER - 45), (CENTER - 28, CENTER - 45), (CENTER - 32, CENTER + 35)]
    d.polygon(left_fang, fill=(245, 245, 250, 255), outline=(16, 185, 129, 255))
    # Right Fang
    right_fang = [(CENTER + 28, CENTER - 45), (CENTER + 45, CENTER - 45), (CENTER + 32, CENTER + 35)]
    d.polygon(right_fang, fill=(245, 245, 250, 255), outline=(16, 185, 129, 255))
    
    # Dripping Corrosive Emerald Acid Drops
    for drip in [(CENTER - 32, CENTER + 55), (CENTER + 32, CENTER + 55), (CENTER - 32, CENTER + 75)]:
        d.ellipse((drip[0]-6, drip[1]-8, drip[0]+6, drip[1]+8), fill=(52, 211, 153, 240))
        d.ellipse((drip[0]-2, drip[1]-4, drip[0]+2, drip[1]), fill=(255, 255, 255, 255))
        
    # Toxic Purple Acid Miasma Cloud at bottom
    d.ellipse((CENTER - 60, CENTER + 65, CENTER + 60, CENTER + 95), fill=(147, 51, 234, 160))
    
    fx_blur = fx.filter(ImageFilter.GaussianBlur(1.0))
    im = Image.alpha_composite(im, fx_blur)
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

def gen_pas_orochi():
    # Passive: Uy Áp Xà Thần - Menacing Crimson-Purple Serpent Slit Eye Aura
    im = make_base((35, 10, 25), (14, 4, 10), (239, 68, 68, 255), (168, 85, 247, 220))
    im = add_glow_rays(im, (239, 68, 68, 80), num_rays=8, max_len=110)
    
    fx = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx)
    # Concentric Intimidation Shockwave Rings
    d.ellipse((CENTER - 85, CENTER - 85, CENTER + 85, CENTER + 85), outline=(168, 85, 247, 160), width=2)
    d.ellipse((CENTER - 68, CENTER - 68, CENTER + 68, CENTER + 68), outline=(239, 68, 68, 200), width=3)
    
    # Glowing Golden-Amber Reptilian Eye Sclera
    d.ellipse((CENTER - 52, CENTER - 32, CENTER + 52, CENTER + 32), fill=(251, 191, 36, 240), outline=(220, 38, 38, 255), width=4)
    # Vertical Slit Black Pupil
    d.ellipse((CENTER - 9, CENTER - 30, CENTER + 9, CENTER + 30), fill=(15, 5, 10, 255))
    # Eye Iris Highlight
    d.ellipse((CENTER - 5, CENTER - 18, CENTER + 1, CENTER - 8), fill=(255, 255, 255, 240))
    
    # Intimidating Toxic Purple Lightning Sparks around eye
    for pt in [(CENTER - 65, CENTER - 30), (CENTER + 65, CENTER - 30), (CENTER - 50, CENTER + 40), (CENTER + 50, CENTER + 40)]:
        d.line([(pt[0]-8, pt[1]), (pt[0]+8, pt[1])], fill=(168, 85, 247, 255), width=2)
        d.line([(pt[0], pt[1]-8), (pt[0], pt[1]+8)], fill=(168, 85, 247, 255), width=2)
        
    im = Image.alpha_composite(im, fx)
    return apply_circle_clip(im)

# ==============================================================================
# MAIN BATCH EXECUTION
# ==============================================================================
ALL_SKILLS = [
    ("skill_act_inari_kitsune.png", gen_act_inari),
    ("skill_pas_inari_kitsune.png", gen_pas_inari),
    ("skill_act_ryujin_pearl.png", gen_act_ryujin),
    ("skill_pas_ryujin_pearl.png", gen_pas_ryujin),
    ("skill_act_hi_no_tori.png", gen_act_hinotori),
    ("skill_pas_hi_no_tori.png", gen_pas_hinotori),
    ("skill_act_byakko_tiger.png", gen_act_byakko),
    ("skill_pas_byakko_tiger.png", gen_pas_byakko),
    ("skill_act_genbu_tortoise.png", gen_act_genbu),
    ("skill_pas_genbu_tortoise.png", gen_pas_genbu),
    ("skill_act_kirin_sacred.png", gen_act_kirin),
    ("skill_pas_kirin_sacred.png", gen_pas_kirin),
    ("skill_act_raiju_thunder.png", gen_act_raiju),
    ("skill_pas_raiju_thunder.png", gen_pas_raiju),
    ("skill_act_yatagarasu_crow.png", gen_act_yatagarasu),
    ("skill_pas_yatagarasu_crow.png", gen_pas_yatagarasu),
    ("skill_act_nekomata_cat.png", gen_act_nekomata),
    ("skill_pas_nekomata_cat.png", gen_pas_nekomata),
    ("skill_act_orochi_serpent.png", gen_act_orochi),
    ("skill_pas_orochi_serpent.png", gen_pas_orochi),
]

def main():
    print(f"Generating {len(ALL_SKILLS)} skill icons...")
    for filename, gen_fn in ALL_SKILLS:
        out_path = os.path.join(SKILLS_DIR, filename)
        img = gen_fn()
        img.save(out_path, format="PNG")
        print(f"  -> Generated: {out_path} ({img.size}, mode={img.mode})")
    print("Done! All 20 skill icons generated successfully.")

if __name__ == "__main__":
    main()
