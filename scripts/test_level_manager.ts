import { LevelManager } from '../src/game/LevelManager';
import { CharacterRegistry } from '../src/game/CharacterRegistry';
import * as fs from 'fs';
import * as path from 'path';

const publicDir = path.join(process.cwd(), 'public');

console.log('====================================================');
console.log('   FULL IN-DEPTH TEST OF LEVELMANAGER (ALL 100 LVLS)');
console.log('====================================================\n');

let issues: string[] = [];

for (let lvl = 1; lvl <= 100; lvl++) {
  ['easy', 'medium', 'hard'].forEach(diff => {
    try {
      const cfg = LevelManager.getLevelConfig(lvl, undefined, diff as any);
      
      // 1. Check character pool
      if (!cfg.characterPool || cfg.characterPool.length === 0) {
        issues.push(`Level ${lvl} [${diff}]: characterPool is empty!`);
      } else {
        cfg.characterPool.forEach(cid => {
          const char = CharacterRegistry.get(cid);
          if (!char) {
            issues.push(`Level ${lvl} [${diff}]: Character ID "${cid}" not found in registry!`);
          } else {
            const p = path.join(publicDir, char.asset.replace(/^\/+/, ''));
            if (!fs.existsSync(p)) {
              issues.push(`Level ${lvl} [${diff}]: Image missing for ${cid}: ${char.asset}`);
            }
          }
        });
      }

      // 2. Check boss config if boss level
      if (lvl % 10 === 0) {
        if (!cfg.boss) {
          issues.push(`Level ${lvl} [${diff}]: is boss level but cfg.boss is undefined!`);
        } else {
          const bId = cfg.boss.id;
          const cleanId = bId.replace(/^boss_/, '');
          const p1 = path.join(publicDir, 'assets/bosses', `${bId}.png`);
          const p2 = path.join(publicDir, 'assets/bosses', `boss_${cleanId}.png`);
          if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
            issues.push(`Level ${lvl} [${diff}]: Boss sprite missing for ${bId}`);
          }
        }
      }

      // 3. Check stage background
      const stageBgPath = path.join(publicDir, 'assets/stages', `stage_bg_${lvl}.png`);
      if (!fs.existsSync(stageBgPath)) {
        issues.push(`Level ${lvl} [${diff}]: stage_bg_${lvl}.png missing!`);
      }

      // 4. Check stage thumbnail
      const thumbPath = path.join(publicDir, 'assets/stages', `stage_thumb_${lvl}.jpg`);
      if (!fs.existsSync(thumbPath)) {
        issues.push(`Level ${lvl} [${diff}]: stage_thumb_${lvl}.jpg missing!`);
      }

    } catch (err: any) {
      issues.push(`Level ${lvl} [${diff}] threw exception: ${err.message}`);
    }
  });
}

console.log(`\nResults of auditing 100 levels across Easy, Medium, Hard (300 combinations):`);
if (issues.length === 0) {
  console.log(`🎉 100% PERFECT! All 300 level configurations tested with ZERO errors!`);
} else {
  console.error(`❌ Found ${issues.length} issues:`);
  issues.slice(0, 20).forEach(i => console.error(' - ' + i));
  if (issues.length > 20) console.error(` ... and ${issues.length - 20} more.`);
}
