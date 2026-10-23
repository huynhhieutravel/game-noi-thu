#!/usr/bin/env node

/**
 * Foxy Pair - Automated WebP Asset Pipeline
 * Converts raw PNG backgrounds and characters to high-quality WebP (quality: 85),
 * dropping total asset payload from ~1.3GB down to ~90MB-120MB.
 *
 * Usage: node scripts/optimize_assets_webp.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TARGET_DIRS = [
  'public/assets/stages',
  'public/assets/themes',
  'public/assets/backgrounds',
  'public/assets/boss_arenas',
  'public/assets/bosses'
];

const DRY_RUN = process.argv.includes('--dry-run');

console.log('=== 🦊 FOXY PAIR - WEBP ASSET PIPELINE ===');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (Preview Only)' : 'EXECUTE'}\n`);

let totalOriginalBytes = 0;
let totalWebPBytes = 0;
let convertedCount = 0;

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.png') && !file.endsWith('.jpg')) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Skip small UI icons (<50KB) to preserve crisp sub-pixel pixel art
    if (stat.size < 50 * 1024) continue;

    const outWebPPath = fullPath.replace(/\.(png|jpg)$/, '.webp');
    totalOriginalBytes += stat.size;

    if (!DRY_RUN) {
      try {
        execSync(`cwebp -q 85 "${fullPath}" -o "${outWebPPath}" -quiet`);
        const newStat = fs.statSync(outWebPPath);
        totalWebPBytes += newStat.size;
        convertedCount++;
      } catch (err) {
        console.warn(`[Skip] Failed to convert ${file}:`, err.message);
        totalWebPBytes += stat.size;
      }
    } else {
      totalWebPBytes += Math.round(stat.size * 0.12);
      convertedCount++;
    }
  }
}

const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(1);
const webpMB = (totalWebPBytes / (1024 * 1024)).toFixed(1);
const savedPct = totalOriginalBytes > 0 ? (((totalOriginalBytes - totalWebPBytes) / totalOriginalBytes) * 100).toFixed(1) : 0;

console.log(`\n🎉 Hoàn thành xử lý ${convertedCount} tài nguyên:`);
console.log(`- Dung lượng gốc: ${origMB} MB`);
console.log(`- Dung lượng sau WebP: ${webpMB} MB`);
console.log(`- Tiết kiệm được: ${savedPct}%\n`);
