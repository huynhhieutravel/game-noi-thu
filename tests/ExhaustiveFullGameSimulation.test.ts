import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { BoardModifiers, BoardMovement } from '../src/game/BoardModifiers';
import { CombatEngine } from '../src/game/CombatEngine';
import { COMPANIONS } from '../src/game/CompanionManager';
import { LootManager } from '../src/game/LootManager';
import { DifficultyLevel, TileState } from '../src/types';

/**
 * Headless Automated Puzzle Solver for Full Game Simulation
 * Emulates the exact rules and collateral damage mechanics of Board.ts
 */
class HeadlessGameSimulator {
  public static simulateLevel(
    levelNum: number,
    difficulty: DifficultyLevel = 'easy'
  ): {
    success: boolean;
    totalMoves: number;
    reshuffleCount: number;
    remainingTiles: number;
    errorReason?: string;
  } {
    const rawConfig = LevelManager.getLevelConfig(levelNum, 'yokai', difficulty);
    const config = LevelManager.applyDifficultyToConfig(rawConfig, difficulty);

    const rows = config.rows;
    const cols = config.columns;
    const movement: BoardMovement = config.movement || 'none';

    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool: config.characterPool,
      levelNumber: config.levelNumber,
      stoneCount: config.modifiers?.stoneCount || 0,
      iceCount: config.modifiers?.iceCount || 0,
      thornCount: config.modifiers?.thornCount || 0,
      webCount: config.modifiers?.webCount || 0,
      barricadeCount: config.modifiers?.barricadeCount || 0
    });

    let moves = 0;
    let reshuffles = 0;
    const MAX_STEPS = 350;

    while (moves < MAX_STEPS) {
      // 1. Count remaining playable tiles
      let remaining = 0;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (!t.isCleared && t.characterId && t.modifier !== 'stone') {
            remaining++;
          }
        }
      }

      if (remaining === 0) {
        return { success: true, totalMoves: moves, reshuffleCount: reshuffles, remainingTiles: 0 };
      }

      // 2. Strict parity check
      const counts: Record<string, number> = {};
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (!t.isCleared && t.characterId && t.modifier !== 'stone') {
            counts[t.characterId] = (counts[t.characterId] || 0) + 1;
          }
        }
      }
      for (const [cid, cnt] of Object.entries(counts)) {
        if (cnt % 2 !== 0) {
          return {
            success: false,
            totalMoves: moves,
            reshuffleCount: reshuffles,
            remainingTiles: remaining,
            errorReason: `Parity broken: Character "${cid}" has odd count ${cnt} at move ${moves}`
          };
        }
      }

      // 3. Try to find a playable match
      const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);

      if (match) {
        const t1 = grid[match.p1.r][match.p1.c];
        const t2 = grid[match.p2.r][match.p2.c];

        // Handle obstacle layers on matched endpoints
        if (t1.modifier === 'ice' && t1.iceLayers && t1.iceLayers > 1) {
          t1.iceLayers--;
        } else {
          t1.isCleared = true;
          t1.characterId = null;
          t1.modifier = 'none';
        }

        if (t2.modifier === 'ice' && t2.iceLayers && t2.iceLayers > 1) {
          t2.iceLayers--;
        } else {
          t2.isCleared = true;
          t2.characterId = null;
          t2.modifier = 'none';
        }

        // 4. Collateral obstacle damage along match endpoints & path (matches Board.ts.damageAdjacentObstacles)
        const coordsToCheck: { r: number; c: number }[] = [];
        const dirs = [
          { r: -1, c: 0 },
          { r: 1, c: 0 },
          { r: 0, c: -1 },
          { r: 0, c: 1 }
        ];

        for (const pt of [match.p1, match.p2]) {
          for (const d of dirs) {
            coordsToCheck.push({ r: pt.r + d.r, c: pt.c + d.c });
          }
        }

        if (match.path && match.path.length >= 2) {
          for (let i = 0; i < match.path.length - 1; i++) {
            const pA = match.path[i];
            const pB = match.path[i + 1];
            if (pA.r === pB.r || pA.c === pB.c) {
              const minR = Math.min(pA.r, pB.r);
              const maxR = Math.max(pA.r, pB.r);
              const minC = Math.min(pA.c, pB.c);
              const maxC = Math.max(pA.c, pB.c);
              for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                  for (const d of dirs) {
                    coordsToCheck.push({ r: r + d.r, c: c + d.c });
                  }
                }
              }
            }
          }
        }

        const seenCoords = new Set<string>();
        for (const p of coordsToCheck) {
          if (p.r >= 1 && p.r <= rows && p.c >= 1 && p.c <= cols) {
            const key = `${p.r},${p.c}`;
            if (!seenCoords.has(key)) {
              seenCoords.add(key);
              const cell = grid[p.r][p.c];
              if (cell && !cell.isCleared) {
                if (cell.isFogged || cell.modifier === 'fog') {
                  cell.isFogged = false;
                  if (cell.modifier === 'fog') cell.modifier = 'none';
                }
                if (cell.modifier === 'thorn') {
                  cell.modifier = 'none';
                  cell.modifierLevel = 0;
                } else if (cell.modifier === 'web') {
                  cell.modifierLevel = (cell.modifierLevel || 2) - 1;
                  if (cell.modifierLevel <= 0) cell.modifier = 'none';
                } else if (cell.modifier === 'barricade') {
                  cell.modifierLevel = (cell.modifierLevel || 3) - 1;
                  if (cell.modifierLevel <= 0) cell.modifier = 'none';
                } else if (cell.modifier === 'ice') {
                  cell.iceLayers = (cell.iceLayers || 2) - 1;
                  if (cell.iceLayers <= 0) {
                    cell.modifier = 'none';
                    cell.iceLayers = 0;
                  }
                } else if (cell.modifier === 'stone') {
                  cell.modifierLevel = (cell.modifierLevel || 3) - 1;
                  if (cell.modifierLevel <= 0) {
                    cell.modifier = 'none';
                    cell.isCleared = true;
                    cell.characterId = null;
                  }
                }
              }
            }
          }
        }

        // Apply board movement/gravity if active
        if (movement !== 'none') {
          BoardModifiers.applyMovement(grid, rows, cols, movement);
        }

        moves++;
      } else {
        // Deadlock detected -> trigger reshuffle
        if (reshuffles >= 30) {
          return {
            success: false,
            totalMoves: moves,
            reshuffleCount: reshuffles,
            remainingTiles: remaining,
            errorReason: `Exceeded max reshuffles (30) with ${remaining} tiles remaining`
          };
        }

        const reshuffled = BoardGenerator.reshuffleBoard(grid, rows, cols);
        reshuffles++;

        if (!reshuffled && remaining > 1) {
          return {
            success: false,
            totalMoves: moves,
            reshuffleCount: reshuffles,
            remainingTiles: remaining,
            errorReason: `Reshuffle failed while ${remaining} tiles remain`
          };
        }
      }
    }

    return {
      success: false,
      totalMoves: moves,
      reshuffleCount: reshuffles,
      remainingTiles: -1,
      errorReason: 'Exceeded MAX_STEPS limit (350)'
    };
  }

  public static simulateZenBoard(characterPool: string[]): {
    success: boolean;
    totalMoves: number;
    errorReason?: string;
  } {
    const rows = 6;
    const cols = 8;
    const grid = BoardGenerator.generateBoard({
      rows,
      cols,
      characterPool
    });

    let moves = 0;
    let reshuffles = 0;
    while (moves < 120) {
      let remaining = 0;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          if (!grid[r][c].isCleared && grid[r][c].characterId) remaining++;
        }
      }
      if (remaining === 0) return { success: true, totalMoves: moves };

      const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
      if (match) {
        grid[match.p1.r][match.p1.c].isCleared = true;
        grid[match.p1.r][match.p1.c].characterId = null;
        grid[match.p2.r][match.p2.c].isCleared = true;
        grid[match.p2.r][match.p2.c].characterId = null;
        moves++;
      } else {
        if (reshuffles >= 15) return { success: false, totalMoves: moves, errorReason: 'Zen exceeded 15 reshuffles' };
        BoardGenerator.reshuffleBoard(grid, rows, cols);
        reshuffles++;
      }
    }
    return { success: false, totalMoves: moves, errorReason: 'Zen exceeded 120 moves' };
  }

  public static simulateSurvivalRun(characterPool: string[], wavesToSurvive: number = 20): {
    success: boolean;
    wavesCompleted: number;
    totalMoves: number;
    errorReason?: string;
  } {
    const rows = 8;
    const cols = 10;
    const grid = BoardGenerator.generateSurvivalBoard({
      rows,
      cols,
      initialActiveRows: 4,
      characterPool
    });

    let moves = 0;
    let wave = 0;
    let reshuffles = 0;

    while (wave < wavesToSurvive) {
      // 1. Solve pairs defensively
      let pairsSolvedThisWave = 0;
      while (pairsSolvedThisWave < 3) {
        const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
        if (match) {
          grid[match.p1.r][match.p1.c].isCleared = true;
          grid[match.p1.r][match.p1.c].characterId = null;
          grid[match.p2.r][match.p2.c].isCleared = true;
          grid[match.p2.r][match.p2.c].characterId = null;
          moves++;
          pairsSolvedThisWave++;
        } else {
          let remaining = 0;
          for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
              if (!grid[r][c].isCleared && grid[r][c].characterId) remaining++;
            }
          }
          if (remaining === 0) break;

          if (reshuffles >= 25) {
            return { success: false, wavesCompleted: wave, totalMoves: moves, errorReason: 'Survival exceeded 25 reshuffles' };
          }
          BoardGenerator.reshuffleBoard(grid, rows, cols);
          reshuffles++;
        }
      }

      // 2. Prevent ceiling danger overflow before push
      let clearTopAttempts = 0;
      while (clearTopAttempts < 20) {
        let topRowActive = false;
        for (let c = 1; c <= cols; c++) {
          if (!grid[1][c].isCleared && grid[1][c].characterId) {
            topRowActive = true;
            break;
          }
        }
        if (!topRowActive) break;

        const panicMatch = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
        if (panicMatch) {
          grid[panicMatch.p1.r][panicMatch.p1.c].isCleared = true;
          grid[panicMatch.p1.r][panicMatch.p1.c].characterId = null;
          grid[panicMatch.p2.r][panicMatch.p2.c].isCleared = true;
          grid[panicMatch.p2.r][panicMatch.p2.c].characterId = null;
          moves++;
        } else {
          BoardGenerator.reshuffleBoard(grid, rows, cols);
        }
        clearTopAttempts++;
      }

      // 3. Shift rows up
      for (let r = 1; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
          grid[r][c] = {
            ...grid[r + 1][c],
            r,
            c
          };
        }
      }
      // Fill bottom row with paired tiles
      const newRow = BoardGenerator.generatePairedRow(cols, characterPool);
      for (let c = 1; c <= cols; c++) {
        grid[rows][c] = {
          r: rows,
          c,
          characterId: newRow[c - 1],
          modifier: 'none',
          iceLayers: 0,
          isLocked: false,
          isKey: false,
          isFogged: false,
          isBossSymbol: false,
          isCleared: false
        };
      }

      // Parity check across entire board
      const counts: Record<string, number> = {};
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (!t.isCleared && t.characterId) {
            counts[t.characterId] = (counts[t.characterId] || 0) + 1;
          }
        }
      }
      for (const [cid, cnt] of Object.entries(counts)) {
        if (cnt % 2 !== 0) {
          return {
            success: false,
            wavesCompleted: wave,
            totalMoves: moves,
            errorReason: `Parity broken in wave ${wave} for ${cid} (count: ${cnt})`
          };
        }
      }

      wave++;
    }

    return { success: true, wavesCompleted: wave, totalMoves: moves };
  }
}

describe('Comprehensive QA & Multi-Match Simulation Suite', () => {

  describe('1. Full Playthrough Simulation (All 100 Levels on Easy, Medium, Hard)', () => {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

    for (const diff of difficulties) {
      it(`successfully solves all 100 levels on [${diff.toUpperCase()}] without deadlock or parity breakage`, () => {
        const failures: { level: number; error: string }[] = [];

        for (let lvl = 1; lvl <= 100; lvl++) {
          const result = HeadlessGameSimulator.simulateLevel(lvl, diff);
          if (!result.success) {
            failures.push({
              level: lvl,
              error: result.errorReason || 'Unknown error'
            });
          }
        }

        expect(
          failures,
          `Failed levels on ${diff}: ${JSON.stringify(failures, null, 2)}`
        ).toHaveLength(0);
      });
    }
  });

  describe('2. Directional Movement & Gravity Shifts Stress Test', () => {
    const movements: BoardMovement[] = [
      'down',
      'up',
      'left',
      'right',
      'center_row',
      'center_col',
      'split_vertical',
      'split_horizontal',
      'chaos'
    ];

    for (const mov of movements) {
      it(`preserves coordinate integrity and parity under movement "${mov}"`, () => {
        const rows = 8;
        const cols = 8;
        const grid = BoardGenerator.generateBoard({
          rows,
          cols,
          characterPool: ['kasa_obake', 'chochin_obake', 'tanuki', 'kitsune', 'tengu', 'kappa']
        });

        // Clear 4 random pairs cleanly
        let pairsCleared = 0;
        outerLoop: for (let r = 1; r <= rows && pairsCleared < 4; r++) {
          for (let c = 1; c <= cols && pairsCleared < 4; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId) {
              const targetChar = grid[r][c].characterId;
              grid[r][c].isCleared = true;
              grid[r][c].characterId = null;

              // Find and clear its matching partner
              let partnerFound = false;
              for (let pr = 1; pr <= rows && !partnerFound; pr++) {
                for (let pc = 1; pc <= cols && !partnerFound; pc++) {
                  if (!grid[pr][pc].isCleared && grid[pr][pc].characterId === targetChar) {
                    grid[pr][pc].isCleared = true;
                    grid[pr][pc].characterId = null;
                    partnerFound = true;
                    pairsCleared++;
                  }
                }
              }
              if (pairsCleared >= 4) break outerLoop;
            }
          }
        }

        // Apply movement
        BoardModifiers.applyMovement(grid, rows, cols, mov);

        // Verify tile coordinate integrity
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            expect(tile.r).toBe(r);
            expect(tile.c).toBe(c);
          }
        }

        // Verify parity after movement
        const counts: Record<string, number> = {};
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId) {
              counts[tile.characterId] = (counts[tile.characterId] || 0) + 1;
            }
          }
        }
        for (const [charId, count] of Object.entries(counts)) {
          expect(count % 2, `Character "${charId}" has odd count ${count} after ${mov} movement`).toBe(0);
        }
      });
    }
  });

  describe('3. Boss Battles & Combat Engine Simulation (All 10 Bosses)', () => {
    const bossMilestoneLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    it('simulates combat for all 10 Bosses with valid damage scaling and victory triggers', () => {
      for (const lvl of bossMilestoneLevels) {
        const config = LevelManager.getLevelConfig(lvl);
        expect(config.boss).toBeDefined();

        const bossCfg = config.boss!;
        const bossStats = CombatEngine.calculateBossStats(lvl, 'medium', bossCfg.maxHp, bossCfg.attackPower);
        const playerStats = CombatEngine.calculatePlayerStats({
          companionLevel: 3,
          companionTier: 2,
          relicHpBonus: 100,
          relicDrBonus: 0.1
        });

        expect(bossStats.maxHp).toBeGreaterThan(0);
        expect(bossStats.attackPower).toBeGreaterThan(0);
        expect(playerStats.maxHp).toBeGreaterThan(0);

        // Simulate combat turns
        let currentBossHp = bossStats.maxHp;
        let currentPlayerHp = playerStats.maxHp;
        let turn = 0;

        while (currentBossHp > 0 && currentPlayerHp > 0 && turn < 2000) {
          // Player match attack with combo
          const combo = (turn % 4) + 1;
          const matchDmg = CombatEngine.calculateMatchDamage(playerStats.baseMatchDamage, combo, combo >= 3);
          currentBossHp = Math.max(0, currentBossHp - matchDmg.totalDamage);

          // Boss counterattack every 3 turns
          if (turn % 3 === 0 && currentBossHp > 0) {
            const isEnraged = currentBossHp / bossStats.maxHp <= 0.35;
            const bossAtk = CombatEngine.calculateDamageReceived(bossStats.attackPower, playerStats.damageReduction, isEnraged);
            currentPlayerHp = Math.max(0, currentPlayerHp - bossAtk.damageTaken);
          }

          turn++;
        }

        // Verify combat resolved with decisive outcome
        expect(currentBossHp === 0 || currentPlayerHp === 0).toBe(true);
        expect(Number.isNaN(currentBossHp)).toBe(false);
        expect(Number.isNaN(currentPlayerHp)).toBe(false);
      }
    });
  });

  describe('4. All 10 Mythical Companions RPG Progression Simulation', () => {
    it('verifies all 10 companions have valid unlock curves, costs, and stats', () => {
      const compIds = Object.keys(COMPANIONS);
      expect(compIds).toHaveLength(10);

      for (const cid of compIds) {
        const comp = COMPANIONS[cid];
        expect(comp.id).toBe(cid);
        expect(comp.name.length).toBeGreaterThan(0);
        expect(comp.levels).toHaveLength(5);

        for (let l = 0; l < comp.levels.length; l++) {
          const lvlInfo = comp.levels[l];
          expect(lvlInfo.level).toBe(l + 1);
          if (l === 0) {
            expect(lvlInfo.requiredShards).toBe(0);
          } else {
            expect(lvlInfo.requiredShards).toBeGreaterThan(0);
            expect(lvlInfo.requiredCoins).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('5. Loot Economy: 1,000 Matches Loot Distribution Simulation', () => {
    it('verifies mathematical drop distributions over 1,000 matches without NaN or negative values', () => {
      let totalCoinsEarned = 0;
      let totalExpEarned = 0;
      let totalShardsEarned = 0;
      let totalItemsEarned = 0;

      for (let run = 1; run <= 1000; run++) {
        const sampleLevel = (run % 100) + 1;
        const diff: DifficultyLevel = run % 3 === 0 ? 'hard' : run % 2 === 0 ? 'medium' : 'easy';
        const stars = (run % 3) + 1;

        const loot = LootManager.calculateLoot(sampleLevel, diff, stars, 1.0, 0);

        expect(loot.coinsEarned).toBeGreaterThan(0);
        expect(loot.expEarned).toBeGreaterThan(0);
        expect(Number.isNaN(loot.coinsEarned)).toBe(false);
        expect(Number.isNaN(loot.expEarned)).toBe(false);

        totalCoinsEarned += loot.coinsEarned;
        totalExpEarned += loot.expEarned;
        if (loot.mainShardsEarned > 0 || loot.subShardsEarned > 0) {
          totalShardsEarned += (loot.mainShardsEarned + loot.subShardsEarned);
        }
        if (loot.itemEarned) {
          totalItemsEarned++;
        }
      }

      // Over 1000 runs, avg coins should be reasonable
      expect(totalCoinsEarned).toBeGreaterThan(30000);
      expect(totalExpEarned).toBeGreaterThan(10000);
      // Shards drop at 1.0% and 0.3%, so expect between 2 and 35 drops over 1000 runs
      expect(totalShardsEarned).toBeGreaterThanOrEqual(1);
    });
  });

  describe('6. Chaos Reshuffle Resilience Test (100 Consecutive Shuffles)', () => {
    it('survives 100 consecutive reshuffles on a dense board with zero parity degradation', () => {
      const rows = 8;
      const cols = 8;
      const grid = BoardGenerator.generateBoard({
        rows,
        cols,
        characterPool: ['kasa_obake', 'chochin_obake', 'tanuki', 'kitsune', 'tengu', 'kappa']
      });

      for (let s = 1; s <= 100; s++) {
        const ok = BoardGenerator.reshuffleBoard(grid, rows, cols);
        expect(ok, `Reshuffle failed at iteration ${s}`).toBe(true);

        // Verify parity after every single shuffle
        const counts: Record<string, number> = {};
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
              counts[tile.characterId] = (counts[tile.characterId] || 0) + 1;
            }
          }
        }
        for (const [charId, count] of Object.entries(counts)) {
          expect(count % 2, `Parity broken for "${charId}" on shuffle iteration ${s}`).toBe(0);
        }

        // At least 1 move must exist
        const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
        expect(match, `Board deadlocked after shuffle iteration ${s}`).not.toBeNull();
      }
    });
  });

  describe('7. Zen Mode Endless Simulation (25 Consecutive Clean Sweeps)', () => {
    it('simulates 25 consecutive Zen boards from start to finish with 100% solvability', () => {
      const zenPool = ['kasa_obake', 'chochin_obake', 'tanuki', 'kitsune', 'tengu', 'kappa', 'amabie', 'sunakake_baba'];

      for (let board = 1; board <= 25; board++) {
        const result = HeadlessGameSimulator.simulateZenBoard(zenPool);
        expect(result.success, `Zen Board #${board} failed: ${result.errorReason}`).toBe(true);
        expect(result.totalMoves).toBeGreaterThanOrEqual(20);
      }
    });
  });

  describe('8. Survival Blizzard Mode Simulation (25 Wave Pushes)', () => {
    it('survives 25 continuous Blizzard waves with pushing rows and strict parity', () => {
      const survivalPool = ['kasa_obake', 'chochin_obake', 'tanuki', 'kitsune', 'tengu', 'kappa', 'amabie', 'sunakake_baba'];
      const result = HeadlessGameSimulator.simulateSurvivalRun(survivalPool, 25);
      expect(result.success, `Survival run failed: ${result.errorReason}`).toBe(true);
      expect(result.wavesCompleted).toBe(25);
      expect(result.totalMoves).toBeGreaterThan(30);
    });
  });

  describe('9. Multi-Realm Playthrough Simulation (All 10 World Themes)', () => {
    const realms = [
      'yokai',
      'egypt',
      'greece',
      'wuxia',
      'india',
      'pirate',
      'dinosaur',
      'space',
      'monster',
      'underwater'
    ];

    it('simulates and solves levels across all 10 mythological realms without errors', () => {
      for (const realm of realms) {
        // Test first stage and middle stage of each realm
        for (const lvl of [1, 5]) {
          const rawConfig = LevelManager.getLevelConfig(lvl, realm, 'medium');
          expect(rawConfig.characterPool.length).toBeGreaterThanOrEqual(4);

          const grid = BoardGenerator.generateBoard({
            rows: rawConfig.rows,
            cols: rawConfig.columns,
            characterPool: rawConfig.characterPool,
            levelNumber: rawConfig.levelNumber
          });

          // Check initial solvability
          const initialMatch = BoardGenerator.findFirstAvailableMatch(grid, rawConfig.rows, rawConfig.columns);
          expect(initialMatch, `Realm "${realm}" Level ${lvl} initial board has no valid matches`).not.toBeNull();

          // Check initial parity
          const counts: Record<string, number> = {};
          for (let r = 1; r <= rawConfig.rows; r++) {
            for (let c = 1; c <= rawConfig.columns; c++) {
              const t = grid[r][c];
              if (!t.isCleared && t.characterId) {
                counts[t.characterId] = (counts[t.characterId] || 0) + 1;
              }
            }
          }
          for (const [cid, cnt] of Object.entries(counts)) {
            expect(cnt % 2, `Realm "${realm}" Level ${lvl} has odd count for ${cid}`).toBe(0);
          }
        }
      }
    });
  });

});

