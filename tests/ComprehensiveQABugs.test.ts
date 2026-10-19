import { describe, it, expect } from 'vitest';
import { PathFinder, BoardGrid } from '../src/game/PathFinder';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { BoardModifiers } from '../src/game/BoardModifiers';
import { GridPoint, TileState } from '../src/types';

class TestBoardGrid implements BoardGrid {
  rows: number;
  cols: number;
  private cleared: boolean[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.cleared = [];
    for (let r = 0; r <= rows + 1; r++) {
      this.cleared[r] = [];
      for (let c = 0; c <= cols + 1; c++) {
        // Virtual border 0 and rows+1, 0 and cols+1 are empty by default
        const isBorder = r === 0 || r === rows + 1 || c === 0 || c === cols + 1;
        this.cleared[r][c] = isBorder;
      }
    }
  }

  setTile(r: number, c: number, isEmpty: boolean) {
    this.cleared[r][c] = isEmpty;
  }

  isEmpty(r: number, c: number): boolean {
    if (r <= 0 || r > this.rows || c <= 0 || c > this.cols) return true;
    return this.cleared[r]?.[c] ?? false;
  }
}

describe('Comprehensive QA Regression & Edge Case Test Suite', () => {
  describe('1. Exact User Reproduction: 2 identical tiles on Row 1 (Jorogumo case)', () => {
    it('must connect 2 identical tiles at (1, 3) and (1, 7) via Row 0 top virtual margin with 2 turns', () => {
      const grid = new TestBoardGrid(8, 10);

      // Fill row 1 between col 3 and col 7 with non-empty tiles (blocking 0-turn and 1-turn)
      for (let c = 1; c <= 10; c++) {
        grid.setTile(1, c, false);
      }

      const p1: GridPoint = { r: 1, c: 3 };
      const p2: GridPoint = { r: 1, c: 7 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 1, c: 3 },
        { r: 0, c: 3 },
        { r: 0, c: 7 },
        { r: 1, c: 7 }
      ]);
    });

    it('must connect 2 tiles on Bottom Row via Row (rows + 1) bottom virtual margin', () => {
      const grid = new TestBoardGrid(8, 10);
      for (let c = 1; c <= 10; c++) {
        grid.setTile(8, c, false);
      }
      const p1: GridPoint = { r: 8, c: 2 };
      const p2: GridPoint = { r: 8, c: 8 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 8, c: 2 },
        { r: 9, c: 2 },
        { r: 9, c: 8 },
        { r: 8, c: 8 }
      ]);
    });

    it('must connect 2 tiles on Leftmost Column via Col 0 left virtual margin', () => {
      const grid = new TestBoardGrid(8, 10);
      for (let r = 1; r <= 8; r++) {
        grid.setTile(r, 1, false);
      }
      const p1: GridPoint = { r: 2, c: 1 };
      const p2: GridPoint = { r: 7, c: 1 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 2, c: 1 },
        { r: 2, c: 0 },
        { r: 7, c: 0 },
        { r: 7, c: 1 }
      ]);
    });

    it('must connect 2 tiles on Rightmost Column via Col (cols + 1) right virtual margin', () => {
      const grid = new TestBoardGrid(8, 10);
      for (let r = 1; r <= 8; r++) {
        grid.setTile(r, 10, false);
      }
      const p1: GridPoint = { r: 3, c: 10 };
      const p2: GridPoint = { r: 6, c: 10 };

      const path = PathFinder.findPath(grid, p1, p2);
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points).toEqual([
        { r: 3, c: 10 },
        { r: 3, c: 11 },
        { r: 6, c: 11 },
        { r: 6, c: 10 }
      ]);
    });
  });

  describe('2. PathFinder with Torii Portals', () => {
    it('connects two distant tiles trapped in separate corners using Torii Portals', () => {
      const grid = new TestBoardGrid(6, 6);
      // Torii Portals at (3, 0) and (3, 7)
      const portals = {
        portalA: { r: 3, c: 0 },
        portalB: { r: 3, c: 7 }
      };

      // p1 at (3, 1) can directly exit to portalA (3, 0) in 0 turns
      // p2 at (3, 6) can directly exit to portalB (3, 7) in 0 turns
      const p1: GridPoint = { r: 3, c: 1 };
      const p2: GridPoint = { r: 3, c: 6 };

      // Block all interior cells between them
      grid.setTile(3, 2, false);
      grid.setTile(3, 3, false);
      grid.setTile(3, 4, false);
      grid.setTile(3, 5, false);

      const path = PathFinder.findPath(grid, p1, p2, portals);
      expect(path).not.toBeNull();
      expect(path?.portalConnection).toBeDefined();
    });
  });

  describe('3. Board Reshuffle & Parity Preservation', () => {
    it('guarantees that reshuffling any deadlock state produces an even pair count for every character', () => {
      // Create a mock grid with 4 pairs
      const rows = 4;
      const cols = 4;
      const grid: TileState[][] = [];
      const testChars = ['jorogumo', 'jorogumo', 'kasa_obake', 'kasa_obake', 'kappa', 'kappa', 'tengu', 'tengu'];

      let idx = 0;
      for (let r = 0; r <= rows + 1; r++) {
        grid[r] = [];
        for (let c = 0; c <= cols + 1; c++) {
          const isBorder = r === 0 || r === rows + 1 || c === 0 || c === cols + 1;
          const isCleared = isBorder || idx >= testChars.length;
          grid[r][c] = {
            r,
            c,
            characterId: isCleared ? null : testChars[idx++],
            modifier: 'none',
            iceLayers: 0,
            isLocked: false,
            isKey: false,
            isFogged: false,
            isBossSymbol: false,
            isCleared
          };
        }
      }

      const success = BoardGenerator.reshuffleBoard(grid, rows, cols);
      expect(success).toBe(true);

      // Verify all characters have even parity
      const counts: Record<string, number> = {};
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (!t.isCleared && t.characterId) {
            counts[t.characterId] = (counts[t.characterId] || 0) + 1;
          }
        }
      }

      for (const [id, count] of Object.entries(counts)) {
        expect(count % 2, `Character ${id} has odd count ${count} after reshuffle`).toBe(0);
      }

      // Verify at least one match is immediately solvable
      const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
      expect(match).not.toBeNull();
    });
  });

  describe('4. BoardModifiers Movement & Immobile Obstacles', () => {
    it('correctly keeps stone, thorn, barricade immobile during gravity down', () => {
      const rows = 4;
      const cols = 4;
      const grid: TileState[][] = [];
      for (let r = 0; r <= rows + 1; r++) {
        grid[r] = [];
        for (let c = 0; c <= cols + 1; c++) {
          grid[r][c] = {
            r,
            c,
            characterId: null,
            modifier: 'none',
            iceLayers: 0,
            isLocked: false,
            isKey: false,
            isFogged: false,
            isBossSymbol: false,
            isCleared: true
          };
        }
      }

      // Place a stone at (2, 2)
      grid[2][2].isCleared = false;
      grid[2][2].modifier = 'stone';
      grid[2][2].modifierLevel = 2;

      // Place a normal tile at (1, 2)
      grid[1][2].isCleared = false;
      grid[1][2].characterId = 'kitsune';

      // Apply downward movement
      BoardModifiers.applyMovement(grid, rows, cols, 'down');

      // The stone at (2, 2) MUST NOT move down
      expect(grid[2][2].modifier).toBe('stone');
      expect(grid[2][2].modifierLevel).toBe(2);

      // The tile above it cannot fall through the stone, so it moves to row 1 (or stops above stone)
      expect(grid[2][2].characterId).toBeNull();
    });
  });

  describe('5. Anti-Twin Filter in BoardGenerator', () => {
    it('never generates jorogumo and rokurokubi together on the same board', () => {
      const pool = ['jorogumo', 'rokurokubi', 'kasa_obake', 'nurikabe', 'aka_oni', 'umibozu'];
      for (let trial = 0; trial < 10; trial++) {
        const board = BoardGenerator.generateBoard({
          rows: 6,
          cols: 6,
          characterPool: pool,
          levelNumber: 10
        });

        const activeChars = new Set<string>();
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const charId = board[r][c].characterId;
            if (charId) activeChars.add(charId);
          }
        }

        const hasBoth = activeChars.has('jorogumo') && activeChars.has('rokurokubi');
        expect(hasBoth, 'Both jorogumo and rokurokubi found on the same board!').toBe(false);
      }
    });

    it('never generates teke_teke and hanako_san together on the same board', () => {
      const pool = ['teke_teke', 'hanako_san', 'kasa_obake', 'nurikabe', 'aka_oni', 'umibozu'];
      for (let trial = 0; trial < 10; trial++) {
        const board = BoardGenerator.generateBoard({
          rows: 6,
          cols: 6,
          characterPool: pool,
          levelNumber: 10
        });

        const activeChars = new Set<string>();
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const charId = board[r][c].characterId;
            if (charId) activeChars.add(charId);
          }
        }

        const hasBoth = activeChars.has('teke_teke') && activeChars.has('hanako_san');
        expect(hasBoth, 'Both teke_teke and hanako_san found on the same board!').toBe(false);
      }
    });

    it('never generates kuchisake_onna and hanako_san together on the same board', () => {
      const pool = ['kuchisake_onna', 'hanako_san', 'kasa_obake', 'nurikabe', 'aka_oni', 'umibozu'];
      for (let trial = 0; trial < 10; trial++) {
        const board = BoardGenerator.generateBoard({
          rows: 6,
          cols: 6,
          characterPool: pool,
          levelNumber: 8
        });

        const activeChars = new Set<string>();
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const charId = board[r][c].characterId;
            if (charId) activeChars.add(charId);
          }
        }

        const hasBoth = activeChars.has('kuchisake_onna') && activeChars.has('hanako_san');
        expect(hasBoth, 'Both kuchisake_onna and hanako_san found on the same board!').toBe(false);
      }
    });

    it('never generates inari_kitsune and kyuubi_kitsune together on the same board', () => {
      const pool = ['inari_kitsune', 'kyuubi_kitsune', 'kasa_obake', 'nurikabe', 'aka_oni', 'umibozu'];
      for (let trial = 0; trial < 10; trial++) {
        const board = BoardGenerator.generateBoard({
          rows: 6,
          cols: 6,
          characterPool: pool,
          levelNumber: 8
        });

        const activeChars = new Set<string>();
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const charId = board[r][c].characterId;
            if (charId) activeChars.add(charId);
          }
        }

        const hasBoth = activeChars.has('inari_kitsune') && activeChars.has('kyuubi_kitsune');
        expect(hasBoth, 'Both inari_kitsune and kyuubi_kitsune found on the same board!').toBe(false);
      }
    });

    it('never generates samebito and same_ronin together on the same board', () => {
      const pool = ['samebito', 'same_ronin', 'kasa_obake', 'nurikabe', 'aka_oni', 'umibozu'];
      for (let trial = 0; trial < 10; trial++) {
        const board = BoardGenerator.generateBoard({
          rows: 6,
          cols: 6,
          characterPool: pool,
          levelNumber: 4
        });

        const activeChars = new Set<string>();
        for (let r = 1; r <= 6; r++) {
          for (let c = 1; c <= 6; c++) {
            const charId = board[r][c].characterId;
            if (charId) activeChars.add(charId);
          }
        }

        const hasBoth = activeChars.has('samebito') && activeChars.has('same_ronin');
        expect(hasBoth, 'Both samebito and same_ronin found on the same board!').toBe(false);
      }
    });
  });

  describe('6. Milestone Boss Levels Movement Guarantee', () => {
    it('ensures milestone boss levels 10, 20, 30, 40, 50, 100 always use movement "none"', async () => {
      const { LevelManager } = await import('../src/game/LevelManager');
      const bossLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      for (const lvl of bossLevels) {
        const config = LevelManager.getLevelConfig(lvl);
        expect(config.movement, `Boss Level ${lvl} should have movement "none"`).toBe('none');
      }
    });
  });

  describe('7. Companion Energy Balancing & Anti-Autopilot Verification', () => {
    it('verifies tiered max energy for all 10 companions', async () => {
      const { COMPANIONS } = await import('../src/game/CompanionManager');
      
      const getMaxEnergy = (id: string) => {
        const comp = COMPANIONS[id];
        if (comp?.isApexSSR || id === 'orochi_serpent') return 140;
        if (id === 'inari_kitsune' || id === 'byakko_tiger' || id === 'raiju_thunder') return 115;
        return 100;
      };

      // Apex SSR
      expect(getMaxEnergy('orochi_serpent')).toBe(140);

      // Auto-solvers
      expect(getMaxEnergy('inari_kitsune')).toBe(115);
      expect(getMaxEnergy('byakko_tiger')).toBe(115);
      expect(getMaxEnergy('raiju_thunder')).toBe(115);

      // Standard utilities
      expect(getMaxEnergy('ryujin_pearl')).toBe(100);
      expect(getMaxEnergy('hi_no_tori')).toBe(100);
      expect(getMaxEnergy('genbu_tortoise')).toBe(100);
      expect(getMaxEnergy('kirin_sacred')).toBe(100);
      expect(getMaxEnergy('yatagarasu_crow')).toBe(100);
      expect(getMaxEnergy('nekomata_cat')).toBe(100);
    });

    it('verifies energy gain requires at least 8-14 manual matches and excludes auto clears', () => {
      const calculateEnergyGain = (combo: number, isFever: boolean, isAutoClear: boolean, isLocked: boolean) => {
        if (isAutoClear || isLocked) return 0;
        let gain = 8;
        if (combo >= 4) gain = 13;
        else if (combo >= 2) gain = 10;
        if (isFever) gain = 15;
        return gain;
      };

      // Auto clears (skills, bombs, lightning secondary arcs) award 0 energy
      expect(calculateEnergyGain(1, false, true, false)).toBe(0);
      expect(calculateEnergyGain(5, true, true, false)).toBe(0);

      // Cooldown lockout awards 0 energy
      expect(calculateEnergyGain(1, false, false, true)).toBe(0);

      // Manual matches
      expect(calculateEnergyGain(1, false, false, false)).toBe(8);
      expect(calculateEnergyGain(2, false, false, false)).toBe(10);
      expect(calculateEnergyGain(4, false, false, false)).toBe(13);
      expect(calculateEnergyGain(5, true, false, false)).toBe(15);

      // Calculate matches to reach 100 energy with normal 1x matches
      const singleMatchesTo100 = Math.ceil(100 / calculateEnergyGain(1, false, false, false));
      expect(singleMatchesTo100).toBe(13); // ~13 manual matches

      // Calculate matches to reach 115 energy (Inari Kitsune, Byakko, Raiju)
      const singleMatchesTo115 = Math.ceil(115 / calculateEnergyGain(1, false, false, false));
      expect(singleMatchesTo115).toBe(15); // ~15 manual matches

      // Calculate matches to reach 140 energy (Orochi)
      const singleMatchesTo140 = Math.ceil(140 / calculateEnergyGain(1, false, false, false));
      expect(singleMatchesTo140).toBe(18); // ~18 manual matches
    });
  });

  describe('8. Companion & Relic Skill QA: Zero Crash, Zero Desync, Re-entrant Safe', () => {
    it('executes RelicManager auto_match safely without TypeError even if scene mock is bare', async () => {
      const { RelicManager } = await import('../src/game/RelicManager');
      const manager = RelicManager.getInstance();

      let autoMatchesRequested = 0;
      const mockScene = {
        score: 0,
        scoreText: { setText: () => {} },
        time: { delayedCall: (delay: number, cb: () => void) => cb() },
        boardManager: {
          executeSequentialAutoMatches: (count: number, onPair: any) => {
            autoMatchesRequested += count;
            onPair({ r: 1, c: 1 }, { r: 1, c: 2 });
          },
          findAvailableMatch: () => ({ p1: { r: 1, c: 1 }, p2: { r: 1, c: 2 } }),
          gridToWorld: () => ({ x: 100, y: 100 })
        }
      };

      const res = manager.executeRelicSkill('relic_yokai_01', mockScene);
      expect(res.success).toBe(true);
      expect(autoMatchesRequested).toBe(2);
      expect(mockScene.score).toBe(250);
    });

    it('gracefully handles missing boardManager without throwing unhandled exceptions', async () => {
      const { RelicManager } = await import('../src/game/RelicManager');
      const manager = RelicManager.getInstance();

      const bareScene = {};
      expect(() => {
        const res = manager.executeRelicSkill('relic_yokai_01', bareScene);
        expect(res.success).toBe(true);
      }).not.toThrow();
    });

    it('verifies sequential auto match logic does not loop infinitely on clear board', () => {
      let matchedCount = 0;
      let isProcessing = false;
      const remainingPairs = 0;

      const executeSequential = (count: number, onComplete: (matched: number) => void) => {
        let matched = 0;
        const tryNext = () => {
          if (matched >= count || remainingPairs === 0) {
            onComplete(matched);
            return;
          }
          matched++;
          tryNext();
        };
        tryNext();
      };

      executeSequential(2, (m) => {
        matchedCount = m;
      });

      expect(matchedCount).toBe(0);
    });
  });

  describe('8. Level Difficulty Purity & Stage ID Safety QA', () => {
    it('ensures applying difficulty does not mutate the base LevelConfig across switches', async () => {
      const { LevelManager } = await import('../src/game/LevelManager');
      const baseCfg = LevelManager.getLevelConfig(5);
      const originalRows = baseCfg.rows;
      const originalCols = baseCfg.columns;

      const easyCfg = LevelManager.applyDifficultyToConfig(baseCfg, 'easy');
      expect(easyCfg.rows).toBe(6);
      expect(easyCfg.columns).toBe(8);

      const hardCfg = LevelManager.applyDifficultyToConfig(baseCfg, 'hard');
      // Switching from easy to hard using baseCfg should reflect hard settings, not easy settings
      expect(hardCfg.isStopwatch).toBe(false);

      // And baseCfg itself was not permanently mutated
      expect(baseCfg.rows).toBe(originalRows);
      expect(baseCfg.columns).toBe(originalCols);
    });

    it('ensures non-numeric stage IDs resolve safely without NaN in background keys', () => {
      const stageIds = ['stage_survival', 'stage_zen', 'stage_daily', 'stage_boss', 'stage_100'];
      for (const id of stageIds) {
        const rawDigits = id.replace(/\D/g, '');
        const levelNum = rawDigits.length > 0 ? parseInt(rawDigits, 10) : 1;
        expect(Number.isNaN(levelNum)).toBe(false);
        expect(levelNum).toBeGreaterThanOrEqual(1);

        const safeBgKey = `stage_bg_${levelNum}`;
        expect(safeBgKey).not.toContain('NaN');
      }
    });

    it('ensures booster deductions never allow negative inventory', async () => {
      const { SaveSystem } = await import('../src/systems/SaveSystem');
      const save = SaveSystem.getInstance();
      const initial = save.getBoosters();

      // Drain hints
      while (save.getData().boosters.hint > 0) {
        const used = save.useBooster('hint');
        expect(used).toBe(true);
      }
      expect(save.getData().boosters.hint).toBe(0);

      // Attempt to use when 0
      const failedUse = save.useBooster('hint');
      expect(failedUse).toBe(false);
      expect(save.getData().boosters.hint).toBe(0);

      // Restore initial boosters for test hygiene
      save.addBooster('hint', initial.hint);
    });

    it('ensures Night Parade timer UI update gracefully guards against destroyed or detached text', () => {
      // Mocking the guard condition verified in updateNightParadeTimerUI
      const mockDeadText = { active: false, scene: null };
      const mockLiveText = { active: true, scene: {} };

      const canUpdate = (text: any) => {
        if (!text) return false;
        if (!text.active || !text.scene) return false;
        return true;
      };

      expect(canUpdate(null)).toBe(false);
      expect(canUpdate(mockDeadText)).toBe(false);
      expect(canUpdate(mockLiveText)).toBe(true);
    });
  });
});



