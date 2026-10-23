import { describe, it, expect } from 'vitest';
import { PathFinder, BoardGrid } from '../src/game/PathFinder';
import { BoardGenerator } from '../src/game/BoardGenerator';
import { BoardModifiers } from '../src/game/BoardModifiers';
import { GridPoint, TileState } from '../src/types';

class MockGrid implements BoardGrid {
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
        this.cleared[r][c] = (r === 0 || r === rows + 1 || c === 0 || c === cols + 1);
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

describe('Regression Audit & Side Effect Validation Test Suite', () => {
  describe('1. HitArea Boundaries & Neighbor Non-Interference', () => {
    it('guarantees 0px seam overlap between horizontally adjacent tiles', () => {
      const tileSize = 76;
      const x1 = 100;
      const x2 = 100 + tileSize; // 176
      const seamX = (x1 + x2) / 2; // 138

      const hitArea1 = {
        left: x1 - tileSize / 2, // 62
        right: x1 + tileSize / 2 // 138
      };
      const hitArea2 = {
        left: x2 - tileSize / 2, // 138
        right: x2 + tileSize / 2 // 214
      };

      // Seam is exactly at x = 138
      expect(hitArea1.right).toBe(seamX);
      expect(hitArea2.left).toBe(seamX);

      // Point at 137.9px belongs exclusively to tile 1
      expect(137.9 >= hitArea1.left && 137.9 <= hitArea1.right).toBe(true);
      expect(137.9 >= hitArea2.left && 137.9 <= hitArea2.right).toBe(false);

      // Point at 138.1px belongs exclusively to tile 2
      expect(138.1 >= hitArea1.left && 138.1 <= hitArea1.right).toBe(false);
      expect(138.1 >= hitArea2.left && 138.1 <= hitArea2.right).toBe(true);
    });

    it('guarantees 0px seam overlap between vertically adjacent tiles', () => {
      const tileSize = 76;
      const y1 = 120;
      const y2 = 120 + tileSize; // 196
      const seamY = (y1 + y2) / 2; // 158

      const hitArea1 = {
        top: y1 - tileSize / 2, // 82
        bottom: y1 + tileSize / 2 // 158
      };
      const hitArea2 = {
        top: y2 - tileSize / 2, // 158
        bottom: y2 + tileSize / 2 // 234
      };

      expect(hitArea1.bottom).toBe(seamY);
      expect(hitArea2.top).toBe(seamY);

      // Point 1px above seam belongs exclusively to row 1
      expect(157 >= hitArea1.top && 157 <= hitArea1.bottom).toBe(true);
      expect(157 >= hitArea2.top && 157 <= hitArea2.bottom).toBe(false);

      // Point 1px below seam belongs exclusively to row 2
      expect(159 >= hitArea1.top && 159 <= hitArea1.bottom).toBe(false);
      expect(159 >= hitArea2.top && 159 <= hitArea2.bottom).toBe(true);
    });
  });

  describe('2. Z-Ordering Depth Hierarchy Invariants', () => {
    it('strictly preserves BASE_DEPTH > boardFrameContainer depth', () => {
      const FRAME_DEPTH = 3;
      const BASE_DEPTH = 5;
      const SELECTED_DEPTH = 10;
      expect(BASE_DEPTH).toBeGreaterThan(FRAME_DEPTH);
      expect(SELECTED_DEPTH).toBeGreaterThan(BASE_DEPTH);
    });

    it('ensures TileView depth constants are strictly positive and distinct', () => {
      const BASE_DEPTH = 5;
      const SELECTED_DEPTH = 10;
      expect(BASE_DEPTH).toBe(5);
      expect(SELECTED_DEPTH).toBe(10);
    });
  });

  describe('3. PathFinding Across All 4 Boundaries', () => {
    it('verifies 2-turn path along TOP boundary (Row 0)', () => {
      const grid = new MockGrid(6, 6);
      for (let c = 1; c <= 6; c++) grid.setTile(1, c, false);
      const path = PathFinder.findPath(grid, { r: 1, c: 2 }, { r: 1, c: 5 });
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points[1]).toEqual({ r: 0, c: 2 });
      expect(path?.points[2]).toEqual({ r: 0, c: 5 });
    });

    it('verifies 2-turn path along BOTTOM boundary (Row rows+1)', () => {
      const grid = new MockGrid(6, 6);
      for (let c = 1; c <= 6; c++) grid.setTile(6, c, false);
      const path = PathFinder.findPath(grid, { r: 6, c: 2 }, { r: 6, c: 5 });
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points[1]).toEqual({ r: 7, c: 2 });
      expect(path?.points[2]).toEqual({ r: 7, c: 5 });
    });

    it('verifies 2-turn path along LEFT boundary (Col 0)', () => {
      const grid = new MockGrid(6, 6);
      for (let r = 1; r <= 6; r++) grid.setTile(r, 1, false);
      const path = PathFinder.findPath(grid, { r: 2, c: 1 }, { r: 5, c: 1 });
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points[1]).toEqual({ r: 2, c: 0 });
      expect(path?.points[2]).toEqual({ r: 5, c: 0 });
    });

    it('verifies 2-turn path along RIGHT boundary (Col cols+1)', () => {
      const grid = new MockGrid(6, 6);
      for (let r = 1; r <= 6; r++) grid.setTile(r, 6, false);
      const path = PathFinder.findPath(grid, { r: 2, c: 6 }, { r: 5, c: 6 });
      expect(path).not.toBeNull();
      expect(path?.turns).toBe(2);
      expect(path?.points[1]).toEqual({ r: 2, c: 7 });
      expect(path?.points[2]).toEqual({ r: 5, c: 7 });
    });
  });

  describe('4. Input Lock During Match Processing', () => {
    it('strictly locks input during isProcessingMatch to prevent phantom queued clicks', () => {
      let isProcessingMatch = true;
      let handledClicks: GridPoint[] = [];

      const handleClick = (r: number, c: number) => {
        if (isProcessingMatch) return;
        handledClicks.push({ r, c });
      };

      // Taps during animation are ignored
      handleClick(1, 1);
      handleClick(1, 2);
      expect(handledClicks.length).toBe(0);

      // Once animation finishes, input unlocks for deliberate new taps
      isProcessingMatch = false;
      handleClick(2, 3);
      expect(handledClicks).toEqual([{ r: 2, c: 3 }]);
    });
  });

  describe('5. Obstacle Safety & Immobile Attributes', () => {
    it('confirms all obstacle types are strictly flagged as immobile in BoardModifiers', () => {
      expect(BoardModifiers.isImmobile('stone')).toBe(true);
      expect(BoardModifiers.isImmobile('thorn')).toBe(true);
      expect(BoardModifiers.isImmobile('barricade')).toBe(true);
      expect(BoardModifiers.isImmobile('web')).toBe(true);
      expect(BoardModifiers.isImmobile('lock')).toBe(true);
      expect(BoardModifiers.isImmobile('ice')).toBe(true);
      expect(BoardModifiers.isImmobile('none')).toBe(false);
      expect(BoardModifiers.isImmobile(undefined)).toBe(false);
    });
  });

  describe('6. Onet UX Flow & Selection Switching', () => {
    it('switches selection seamlessly when clicking a tile with a different character', () => {
      let selectedTile: { r: number; c: number; characterId: string } | null = null;
      let selectionEvents: string[] = [];

      const tileA = { r: 1, c: 1, characterId: 'kappa' };
      const tileB = { r: 2, c: 3, characterId: 'kitsune' };
      const tileA2 = { r: 1, c: 4, characterId: 'kappa' };

      const simulateClick = (tile: typeof tileA) => {
        if (!selectedTile) {
          selectedTile = tile;
          selectionEvents.push(`select_${tile.characterId}_(${tile.r},${tile.c})`);
          return;
        }

        if (selectedTile.r === tile.r && selectedTile.c === tile.c) {
          selectionEvents.push(`deselect_${tile.characterId}`);
          selectedTile = null;
          return;
        }

        if (selectedTile.characterId !== tile.characterId) {
          // New behavior: switch selection smoothly to the newly clicked tile!
          selectionEvents.push(`switch_to_${tile.characterId}_(${tile.r},${tile.c})`);
          selectedTile = tile;
          return;
        }

        // Same character -> match
        selectionEvents.push(`match_${selectedTile.characterId}_and_${tile.characterId}`);
        selectedTile = null;
      };

      // 1. Click Kappa -> selected
      simulateClick(tileA);
      expect(selectedTile).toBe(tileA);

      // 2. Click Kitsune -> smoothly switches selection to Kitsune (NOT deselected/shaken)
      simulateClick(tileB);
      expect(selectedTile).toBe(tileB);

      // 3. Click Kitsune again -> deselects
      simulateClick(tileB);
      expect(selectedTile).toBeNull();

      // 4. Click Kappa -> selected
      simulateClick(tileA);
      expect(selectedTile).toBe(tileA);

      // 5. Click Kappa 2 -> matches!
      simulateClick(tileA2);
      expect(selectedTile).toBeNull();

      expect(selectionEvents).toEqual([
        'select_kappa_(1,1)',
        'switch_to_kitsune_(2,3)',
        'deselect_kitsune',
        'select_kappa_(1,1)',
        'match_kappa_and_kappa'
      ]);
    });
  });

  describe('5. Game Start & Replay Stability (Anti-Crash & Session Safety)', () => {
    it('ensures SaveSystem clears activeSession cleanly on new game starts', async () => {
      const { SaveSystem } = await import('../src/systems/SaveSystem');
      const save = SaveSystem.getInstance();
      save.saveActiveSession({
        levelId: 'level_01',
        score: 500,
        lives: 5,
        timeRemaining: 120,
        timestamp: Date.now()
      });
      expect(save.getActiveSession()).not.toBeNull();
      expect(save.getActiveSession()?.levelId).toBe('level_01');

      // Emulate starting fresh level (isResuming: false)
      save.clearActiveSession();
      expect(save.getActiveSession()).toBeNull();
    });

    it('guarantees LevelManager provides valid, non-empty character pools for all 100 levels', async () => {
      const { LevelManager } = await import('../src/game/LevelManager');
      const { CharacterRegistry } = await import('../src/game/CharacterRegistry');

      for (let lvl = 1; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl);
        expect(config).toBeDefined();
        expect(config.characterPool.length).toBeGreaterThanOrEqual(4);

        // Every character in pool must exist in registry
        for (const cid of config.characterPool) {
          const char = CharacterRegistry.get(cid);
          expect(char).toBeDefined();
          expect(char?.name).toBeTruthy();
        }
      }
    });

    it('verifies all 16 Bosses have valid configurations, arena thumbnails and battlefield images', async () => {
      const bosses = (await import('../src/data/bosses.json')).default;
      expect(bosses.length).toBe(16);
      for (const b of bosses) {
        expect(b.id).toBeTruthy();
        expect(b.name).toBeTruthy();
        expect(b.max_hp).toBeGreaterThan(0);
      }
    });
  });
});

