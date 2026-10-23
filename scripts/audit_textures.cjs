const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// 1. Audit characters.json
const chars = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/characters.json'), 'utf8'));
const missingChars = [];
chars.forEach(c => {
  const assetPath = path.join(publicDir, (c.asset || '').replace(/^\/+/, ''));
  if (!fs.existsSync(assetPath)) {
    missingChars.push({ id: c.id, collection: c.collection, asset: c.asset });
  }
});

// 2. Audit bosses.json
const bosses = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/bosses.json'), 'utf8'));
const missingBosses = [];
bosses.forEach(b => {
  const cleanId = b.id.replace(/^boss_/, '');
  const p1 = path.join(publicDir, 'assets/bosses', `${b.id}.png`);
  const p2 = path.join(publicDir, 'assets/bosses', `boss_${cleanId}.png`);
  if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
    missingBosses.push({ id: b.id, name: b.name });
  }
});

// 3. Audit relics.json
const relics = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src/data/relics.json'), 'utf8'));
const missingRelics = [];
relics.forEach(r => {
  if (r.image) {
    const p = path.join(publicDir, r.image.replace(/^\/+/, ''));
    if (!fs.existsSync(p)) {
      missingRelics.push({ id: r.id, name: r.name, image: r.image });
    }
  }
});

// 4. Audit stages 1 to 100
const missingStages = [];
for (let i = 1; i <= 100; i++) {
  const p = path.join(publicDir, 'assets/stages', `stage_bg_${i}.png`);
  if (!fs.existsSync(p)) {
    missingStages.push(i);
  }
}

// 5. Audit boss arenas 1 to 10
const missingArenas = [];
for (let i = 1; i <= 10; i++) {
  const p = path.join(publicDir, 'assets/boss_arenas', `boss_arena_${i}.png`);
  if (!fs.existsSync(p)) {
    missingArenas.push(i);
  }
}

// 6. Check BootScene.ts preloaded asset paths
const bootContent = fs.readFileSync(path.join(__dirname, '..', 'src/scenes/BootScene.ts'), 'utf8');
const bootImageLoads = [...bootContent.matchAll(/this\.load\.image\(\s*['"]([^'"]+)['"]\s*,\s*resolveAsset\(\s*['"]([^'"]+)['"]\s*\)/g)];
const missingBootAssets = [];
bootImageLoads.forEach(([, key, relPath]) => {
  const p = path.join(publicDir, relPath.replace(/^\/+/, ''));
  if (!fs.existsSync(p)) {
    missingBootAssets.push({ key, path: relPath });
  }
});

console.log('=== QA COMPREHENSIVE ASSET AUDIT REPORT ===');
console.log('1. Characters (Total 495): Missing on disk:', missingChars.length);
if (missingChars.length > 0) console.log('   Missing characters:', missingChars);

console.log('2. Bosses (Total 16): Missing on disk:', missingBosses.length);
if (missingBosses.length > 0) console.log('   Missing bosses:', missingBosses);

console.log('3. Relics (Total 30): Missing on disk:', missingRelics.length);
if (missingRelics.length > 0) console.log('   Missing relics:', missingRelics);

console.log('4. Stage Backgrounds (1..100): Missing on disk:', missingStages.length);
if (missingStages.length > 0) console.log('   Missing stages:', missingStages);

console.log('5. Boss Arenas (1..10): Missing on disk:', missingArenas.length);
if (missingArenas.length > 0) console.log('   Missing arenas:', missingArenas);

console.log('6. BootScene Preloaded Static Assets: Missing on disk:', missingBootAssets.length);
if (missingBootAssets.length > 0) console.log('   Missing boot assets:', missingBootAssets);
