import { LevelManager } from '../src/game/LevelManager';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { CharacterRegistry } from '../src/game/CharacterRegistry';
import * as fs from 'fs';
import * as path from 'path';

const publicDir = path.join(process.cwd(), 'public');

console.log('====================================================');
console.log('   FULL IN-DEPTH TEST OF BOARDGENERATOR (100 LVLS)  ');
console.log('====================================================\n');

let issues: string[] = [];

for (let lvl = 1; lvl <= 100; lvl++) {
  ['easy', 'medium', 'hard'].forEach(diff => {
    try {
      const cfg = LevelManager.getLevelConfig(lvl, undefined, diff as any);
      const board = BoardGenerator.generateBoard({
        rows: cfg.rows,
        cols: cfg.columns,
        characterPool: cfg.characterPool,
        levelNumber: cfg.levelNumber,
        iceCount: cfg.modifiers?.iceCount,
        stoneCount: cfg.modifiers?.stoneCount,
        lockCount: cfg.modifiers?.lockCount,
        fogCount: cfg.modifiers?.fogCount,
        thornCount: cfg.modifiers?.thornCount,
        webCount: cfg.modifiers?.webCount,
        barricadeCount: cfg.modifiers?.barricadeCount
      });

      if (!board || board.length === 0 || board[0].length === 0) {
        issues.push(`Level ${lvl} [${diff}]: generated empty board!`);
        return;
      }

      const rows = board.length;
      const cols = board[0].length;
      let nonNullCount = 0;
      const charCounts = new Map<string, number>();

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = board[r][c];
          if (tile && tile.characterId) {
            nonNullCount++;
            charCounts.set(tile.characterId, (charCounts.get(tile.characterId) || 0) + 1);

            // Verify character exists in registry
            const char = CharacterRegistry.get(tile.characterId);
            if (!char) {
              issues.push(`Level ${lvl} [${diff}]: Tile at (${r},${c}) has unknown charId "${tile.characterId}"`);
            } else {
              // Verify image exists
              const p = path.join(publicDir, char.asset.replace(/^\/+/, ''));
              if (!fs.existsSync(p)) {
                issues.push(`Level ${lvl} [${diff}]: Tile at (${r},${c}) charId "${tile.characterId}" image missing!`);
              }
            }
          }
        }
      }

      // Must be even count of tiles
      if (nonNullCount % 2 !== 0) {
        issues.push(`Level ${lvl} [${diff}]: Non-null tile count is odd (${nonNullCount})!`);
      }

      // Every character must appear in pairs (even count)
      for (const [cid, count] of charCounts.entries()) {
        if (count % 2 !== 0) {
          issues.push(`Level ${lvl} [${diff}]: Character "${cid}" count is odd (${count})!`);
        }
      }

    } catch (err: any) {
      issues.push(`Level ${lvl} [${diff}] board generation threw error: ${err.message}`);
    }
  });
}

console.log(`\nResults of BoardGenerator test across 100 levels & 3 difficulties (300 boards):`);
if (issues.length === 0) {
  console.log(`🎉 100% PERFECT! All 300 boards generated cleanly with valid matching pairs & existing images!`);
} else {
  console.error(`❌ Found ${issues.length} issues:`);
  issues.slice(0, 20).forEach(i => console.error(' - ' + i));
  if (issues.length > 20) console.error(` ... and ${issues.length - 20} more.`);
}
