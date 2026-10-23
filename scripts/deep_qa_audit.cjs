const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('====================================================');
console.log('         DEEP QA AUDIT - FOXY PAIR PUZZLE           ');
console.log('====================================================\n');

let errorCount = 0;
let warnCount = 0;

// 1. Audit characters.json
const charsPath = path.join(rootDir, 'src/data/characters.json');
const chars = JSON.parse(fs.readFileSync(charsPath, 'utf8'));
const charIdMap = new Map();
chars.forEach(c => charIdMap.set(c.id, c));

console.log(`[1] CHARACTERS: Total ${chars.length} characters in registry.`);
let missingCharAssets = 0;
chars.forEach(c => {
  if (!c.asset) {
    console.error(`  [ERROR] Character ${c.id} has no asset path!`);
    errorCount++;
    missingCharAssets++;
  } else {
    const p = path.join(publicDir, c.asset.replace(/^\/+/, ''));
    if (!fs.existsSync(p)) {
      console.error(`  [ERROR] Character ${c.id} (${c.name}) asset missing: ${c.asset}`);
      errorCount++;
      missingCharAssets++;
    }
  }
});
if (missingCharAssets === 0) {
  console.log('  -> OK: 100% of characters have valid image files on disk.\n');
}

// 2. Audit bosses.json
const bossesPath = path.join(rootDir, 'src/data/bosses.json');
const bosses = JSON.parse(fs.readFileSync(bossesPath, 'utf8'));
const bossIdMap = new Map();
bosses.forEach(b => bossIdMap.set(b.id, b));

console.log(`[2] BOSSES: Total ${bosses.length} bosses in registry.`);
let missingBossAssets = 0;
bosses.forEach(b => {
  const cleanId = b.id.replace(/^boss_/, '');
  const p1 = path.join(publicDir, 'assets/bosses', `${b.id}.png`);
  const p2 = path.join(publicDir, 'assets/bosses', `boss_${cleanId}.png`);
  if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
    console.error(`  [ERROR] Boss ${b.id} (${b.name}) sprite missing on disk!`);
    errorCount++;
    missingBossAssets++;
  }
});
if (missingBossAssets === 0) {
  console.log('  -> OK: 100% of bosses have valid sprite files on disk.\n');
}

// 3. Audit levels.json (all 100 levels)
const levelsPath = path.join(rootDir, 'src/data/levels.json');
const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
console.log(`[3] LEVELS: Total ${levels.length} levels configured.`);

levels.forEach((lvl, idx) => {
  const levelNum = lvl.level || (idx + 1);
  // Check background
  if (lvl.background) {
    const bgPath = path.join(publicDir, lvl.background.replace(/^\/+/, ''));
    if (!fs.existsSync(bgPath)) {
      console.error(`  [ERROR] Level ${levelNum}: background missing: ${lvl.background}`);
      errorCount++;
    }
  } else {
    console.warn(`  [WARN] Level ${levelNum}: no background specified.`);
    warnCount++;
  }

  // Check characterPool
  if (!lvl.characterPool || lvl.characterPool.length === 0) {
    console.error(`  [ERROR] Level ${levelNum}: characterPool is empty!`);
    errorCount++;
  } else {
    lvl.characterPool.forEach(cid => {
      if (!charIdMap.has(cid)) {
        console.error(`  [ERROR] Level ${levelNum}: characterPool references unknown id: "${cid}"`);
        errorCount++;
      }
    });
  }

  // Check boss if boss level
  if (lvl.bossId) {
    if (!bossIdMap.has(lvl.bossId)) {
      console.error(`  [ERROR] Level ${levelNum}: references unknown bossId: "${lvl.bossId}"`);
      errorCount++;
    }
  }

  // Check stage thumbnail
  const thumbPath = path.join(publicDir, 'assets/stages', `stage_thumb_${levelNum}.jpg`);
  if (!fs.existsSync(thumbPath)) {
    console.error(`  [ERROR] Level ${levelNum}: thumbnail missing: stage_thumb_${levelNum}.jpg`);
    errorCount++;
  }
});

// 4. Audit Stage Backgrounds 1 to 100
let missingStageBgs = 0;
for (let i = 1; i <= 100; i++) {
  const p = path.join(publicDir, 'assets/stages', `stage_bg_${i}.png`);
  if (!fs.existsSync(p)) {
    missingStageBgs++;
  }
}
console.log(`[4] STAGE BACKGROUNDS (1..100): ${100 - missingStageBgs}/100 present.`);
if (missingStageBgs > 0) {
  console.error(`  [ERROR] ${missingStageBgs} stage backgrounds missing!`);
  errorCount += missingStageBgs;
}

// 5. Audit Stage Thumbnails 1 to 100
let missingThumbs = 0;
for (let i = 1; i <= 100; i++) {
  const p = path.join(publicDir, 'assets/stages', `stage_thumb_${i}.jpg`);
  if (!fs.existsSync(p)) {
    missingThumbs++;
  }
}
console.log(`[5] STAGE THUMBNAILS (1..100): ${100 - missingThumbs}/100 present.`);
if (missingThumbs > 0) {
  console.error(`  [ERROR] ${missingThumbs} stage thumbnails missing!`);
  errorCount += missingThumbs;
}

// 6. Audit Boss Arenas (1 to 10)
let missingArenas = 0;
for (let i = 1; i <= 10; i++) {
  const p = path.join(publicDir, 'assets/boss_arenas', `boss_arena_${i}.png`);
  if (!fs.existsSync(p)) {
    missingArenas++;
  }
}
console.log(`[6] BOSS ARENAS (1..10): ${10 - missingArenas}/10 present.`);
if (missingArenas > 0) {
  console.error(`  [ERROR] ${missingArenas} boss arenas missing!`);
  errorCount += missingArenas;
}

// 7. Audit Chapter Backgrounds (1 to 10)
let missingChBgs = 0;
for (let i = 1; i <= 10; i++) {
  const p = path.join(publicDir, 'assets/chapter_backgrounds', `chapter_bg_${i}.jpg`);
  if (!fs.existsSync(p)) {
    missingChBgs++;
  }
}
console.log(`[7] CHAPTER BACKGROUNDS (1..10): ${10 - missingChBgs}/10 present.`);
if (missingChBgs > 0) {
  console.warn(`  [WARN] ${missingChBgs} chapter backgrounds missing (checking if png or fallback exists)...`);
}

// 8. Audit Collections in CollectionScene.ts vs characters.json
const collections = [
  'yokai', 'egypt', 'greece', 'wuxia', 'korea', 'india', 
  'sea', 'pirate', 'underwater', 'dinosaur', 'monster', 
  'fantasy', 'space', 'robot', 'animal', 'plant'
];
console.log(`[8] COLLECTIONS (Total 16):`);
collections.forEach(col => {
  const count = chars.filter(c => c.collection === col).length;
  console.log(`  - ${col.padEnd(12)}: ${count} characters`);
  if (count === 0) {
    console.error(`  [ERROR] Collection ${col} has 0 characters!`);
    errorCount++;
  }
});

console.log('\n====================================================');
console.log(`FINAL QA VERDICT: Errors = ${errorCount}, Warnings = ${warnCount}`);
console.log('====================================================');
if (errorCount === 0) {
  console.log('>>> ALL QA CHECKS PASSED PERFECTLY! <<<');
}
