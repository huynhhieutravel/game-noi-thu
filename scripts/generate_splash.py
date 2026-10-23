import math
import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_splash():
    W, H = 2732, 2732
    bg_color = (13, 15, 23) # #0d0f17
    
    # 1. Base Dark Canvas
    img = Image.new("RGBA", (W, H), bg_color + (255,))
    
    # Radial Glow in center behind mascot
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx = W // 2
    mascot_cy = 1200
    mascot_size = 460
    
    # Outer Crimson Aura
    for r in range(480, 80, -15):
        alpha = int(45 * (1.0 - (r / 480.0) ** 1.6))
        glow_draw.ellipse(
            [cx - r, mascot_cy - r, cx + r, mascot_cy + r],
            fill=(217, 4, 41, alpha) # Red/crimson torii aura
        )
    # Inner Golden Spiritual Light
    for r in range(300, 30, -10):
        alpha = int(60 * (1.0 - (r / 300.0) ** 1.3))
        glow_draw.ellipse(
            [cx - r, mascot_cy - r, cx + r, mascot_cy + r],
            fill=(255, 183, 3, alpha) # Warm golden light
        )
    
    img = Image.alpha_composite(img, glow)
    
    # 2. Add Inari Mascot (from AppIcon)
    icon_path = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon = icon.resize((mascot_size, mascot_size), Image.Resampling.LANCZOS)
        
        # Circular mask with smooth anti-aliased edge
        mask = Image.new("L", (mascot_size, mascot_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([4, 4, mascot_size - 4, mascot_size - 4], fill=255)
        
        # Gold & Crimson double border ring
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ring_draw = ImageDraw.Draw(ring)
        ring_r = mascot_size // 2 + 8
        ring_draw.ellipse([cx - ring_r, mascot_cy - ring_r, cx + ring_r, mascot_cy + ring_r], outline=(255, 209, 102, 240), width=8)
        ring_r_outer = ring_r + 10
        ring_draw.ellipse([cx - ring_r_outer, mascot_cy - ring_r_outer, cx + ring_r_outer, mascot_cy + ring_r_outer], outline=(217, 4, 41, 180), width=4)
        
        img = Image.alpha_composite(img, ring)
        
        # Paste mascot centered
        icon_x = cx - mascot_size // 2
        icon_y = mascot_cy - mascot_size // 2
        img.paste(icon, (icon_x, icon_y), mask)
    
    # 3. Typography
    draw = ImageDraw.Draw(img)
    
    font_title_path = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
    if not os.path.exists(font_title_path):
        font_title_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        
    font_unicode_path = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
    
    font_large = ImageFont.truetype(font_title_path, 108)
    font_sub = ImageFont.truetype(font_unicode_path, 36)
    
    # Title Words: "FOXY" in White, "PAIR" in Gold
    word_foxy = "FOXY "
    word_pair = "PAIR"
    
    bbox_foxy = draw.textbbox((0, 0), word_foxy, font=font_large)
    bbox_pair = draw.textbbox((0, 0), word_pair, font=font_large)
    
    w_foxy = bbox_foxy[2] - bbox_foxy[0]
    w_pair = bbox_pair[2] - bbox_pair[0]
    total_w = w_foxy + w_pair
    
    start_x = cx - total_w // 2
    ty = 1490
    
    # Deep Shadow for both words
    for dx in range(-4, 5):
        for dy in range(4, 10):
            draw.text((start_x + dx, ty + dy), word_foxy + word_pair, font=font_large, fill=(0, 0, 0, 200))
            
    # Stroke for FOXY (Crimson red stroke)
    stroke_w = 6
    for dx in range(-stroke_w, stroke_w + 1):
        for dy in range(-stroke_w, stroke_w + 1):
            if dx * dx + dy * dy <= stroke_w * stroke_w:
                draw.text((start_x + dx, ty + dy), word_foxy, font=font_large, fill=(217, 4, 41, 255))
    draw.text((start_x, ty), word_foxy, font=font_large, fill=(255, 255, 255, 255))
    
    # Stroke for PAIR (Dark amber/maroon stroke)
    pair_x = start_x + w_foxy
    for dx in range(-stroke_w, stroke_w + 1):
        for dy in range(-stroke_w, stroke_w + 1):
            if dx * dx + dy * dy <= stroke_w * stroke_w:
                draw.text((pair_x + dx, ty + dy), word_pair, font=font_large, fill=(158, 0, 24, 255))
    draw.text((pair_x, ty), word_pair, font=font_large, fill=(255, 209, 102, 255))
    
    # Subtitle Pill Badge
    sub_text = "THẦN HỒ INARI • NỐI THÚ CỔ ĐIỂN"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = sub_bbox[2] - sub_bbox[0]
    sh = sub_bbox[3] - sub_bbox[1]
    sx = cx - sw // 2
    sy = 1640
    
    pad_x, pad_y = 32, 14
    draw.rounded_rectangle(
        [sx - pad_x, sy - pad_y, sx + sw + pad_x, sy + sh + pad_y],
        radius=22,
        fill=(26, 29, 46, 220),
        outline=(255, 209, 102, 160),
        width=2
    )
    draw.text((sx, sy), sub_text, font=font_sub, fill=(255, 215, 0, 255))
    
    # Convert to RGB (strict requirement for iOS launch screen image)
    final_rgb = Image.new("RGB", (W, H), bg_color)
    final_rgb.paste(img, (0, 0), img)
    
    os.makedirs("resources", exist_ok=True)
    splash_path = "resources/splash.png"
    final_rgb.save(splash_path, "PNG")
    print("Generated resources/splash.png (2732x2732)")
    
    # Copy to iOS Splash.imageset
    splash_ios_dir = "ios/App/App/Assets.xcassets/Splash.imageset"
    if os.path.exists(splash_ios_dir):
        shutil.copy2(splash_path, os.path.join(splash_ios_dir, "splash-2732x2732.png"))
        shutil.copy2(splash_path, os.path.join(splash_ios_dir, "splash-2732x2732-1.png"))
        shutil.copy2(splash_path, os.path.join(splash_ios_dir, "splash-2732x2732-2.png"))
        print("Updated ios/App/App/Assets.xcassets/Splash.imageset successfully")
    
    # Save preview for developer inspection
    landscape_h = int(W * 1290 / 2796)
    top_crop = (H - landscape_h) // 2
    landscape_crop = final_rgb.crop((0, top_crop, W, top_crop + landscape_h))
    preview = landscape_crop.resize((932, 430), Image.Resampling.LANCZOS)
    os.makedirs("/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/scratch", exist_ok=True)
    preview.save("/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/scratch/splash_landscape_preview.png")
    print("Saved landscape preview to artifacts")

if __name__ == "__main__":
    create_splash()
