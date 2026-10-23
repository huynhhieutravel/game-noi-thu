#!/usr/bin/env python3
"""
Process generated mode icons:
- Remove black/white background with smooth alpha feathering
- Auto-crop bounding box with centered margin
- Resize to 256x256 crisp Retina resolution
- Export to both WebP and PNG
"""

import os
import numpy as np
from PIL import Image

SOURCES = [
    {
        "name": "mode_campaign",
        "path": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/mode_icon_campaign_1792468750453.jpg",
        "bg": "black",
        "threshold": 18,
        "feather": 35,
        "mask_bbox": (35, 125, 989, 875)  # zero out outside the scroll body
    },
    {
        "name": "mode_survival",
        "path": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/mode_icon_survival_1792468769086.jpg",
        "bg": "black",
        "threshold": 12,
        "feather": 30
    },
    {
        "name": "mode_zen",
        "path": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/mode_icon_zen_1792468860051.jpg",
        "bg": "black",
        "threshold": 12,
        "feather": 28
    },
    {
        "name": "mode_boss",
        "path": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/3953da4c-46c9-4576-8b72-2997985d81eb/mode_icon_boss_1792468879648.jpg",
        "bg": "white",
        "threshold": 245,
        "feather": 20
    }
]

OUT_DIR_ICONS = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/icons"
OUT_DIR_ASSETS = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets"
os.makedirs(OUT_DIR_ICONS, exist_ok=True)

TARGET_SIZE = (256, 256)

def remove_bg(img, bg_type, threshold, feather, mask_bbox=None):
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    if bg_type == "black":
        intensity = np.maximum(np.maximum(r, g), b)
        alpha = np.clip((intensity - threshold) / max(1, feather), 0.0, 1.0)
    elif bg_type == "white":
        lightness = np.minimum(np.minimum(r, g), b)
        alpha = np.clip((threshold - lightness) / max(1, feather), 0.0, 1.0)
    else:
        alpha = np.ones_like(r)

    if mask_bbox:
        x1, y1, x2, y2 = mask_bbox
        # Zero out anything outside mask_bbox
        alpha[:y1, :] = 0.0
        alpha[y2:, :] = 0.0
        alpha[:, :x1] = 0.0
        alpha[:, x2:] = 0.0

    arr[:, :, 3] = alpha * 255.0
    return Image.fromarray(arr.astype(np.uint8))

def autocrop_and_center(img, padding_ratio=0.06):
    bbox = img.getbbox()
    if not bbox:
        return img
    cropped = img.crop(bbox)
    w, h = cropped.size
    max_dim = max(w, h)
    pad = int(max_dim * padding_ratio)
    total_dim = max_dim + pad * 2
    
    canvas = Image.new("RGBA", (total_dim, total_dim), (0, 0, 0, 0))
    offset_x = (total_dim - w) // 2
    offset_y = (total_dim - h) // 2
    canvas.paste(cropped, (offset_x, offset_y), cropped)
    return canvas

for item in SOURCES:
    src_path = item["path"]
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found!")
        continue
    
    raw = Image.open(src_path)
    cutout = remove_bg(raw, item["bg"], item["threshold"], item["feather"], item.get("mask_bbox"))
    square = autocrop_and_center(cutout, padding_ratio=0.06)
    final_img = square.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    
    name = item["name"]
    for folder in [OUT_DIR_ICONS, OUT_DIR_ASSETS]:
        png_path = os.path.join(folder, f"{name}.png")
        webp_path = os.path.join(folder, f"{name}.webp")
        final_img.save(png_path, "PNG", optimize=True)
        final_img.save(webp_path, "WEBP", quality=92, method=6)
        print(f"Saved {png_path} ({os.path.getsize(png_path)} bytes) & {webp_path} ({os.path.getsize(webp_path)} bytes)")

print("All 4 mode icons processed successfully!")
