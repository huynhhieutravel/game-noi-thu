import { BoardGenerator } from '../game/BoardGenerator';
import { PathFinder, BoardGrid } from '../game/PathFinder';
import { TileState, GridPoint, LevelConfig } from '../types';

export interface ChaosTestResult {
  success: boolean;
  totalActions: number;
  validMatches: number;
  invalidClicks: number;
  shufflesTriggered: number;
  errors: string[];
  durationMs: number;
}

export interface BrowserStressTestOptions {
  movesCount?: number;
  delayMs?: number;
  spamBoosters?: boolean;
}

/**
 * Headless Chaos Simulation Grid adapter for PathFinder
 */
class ChaosBoardAdapter implements BoardGrid {
  rows: number;
  cols: number;
  private grid: (TileState | null)[][];

  constructor(grid: (TileState | null)[][], rows: number, cols: number) {
    this.grid = grid;
    this.rows = rows;
    this.cols = cols;
  }

  isEmpty(row: number, col: number): boolean {
    if (row <= 0 || row > this.rows || col <= 0 || col > this.cols) return true;
    const cell = this.grid[row]?.[col];
    return !!(cell && cell.isCleared && cell.modifier !== 'stone');
  }
}

/**
 * Headless Chaos Monkey runner that stresses board mechanics, parity checks,
 * rapid matching, out-of-bounds clicks, and obstacle interactions without Phaser dependencies.
 */
export function runHeadlessChaosSimulation(rounds: number = 500): ChaosTestResult {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalActions = 0;
  let validMatches = 0;
  let invalidClicks = 0;
  let shufflesTriggered = 0;

  const rows = 8;
  const cols = 10;
  const characterPool = [
    'kitsune', 'tanuki', 'tengu', 'kappa', 'oni', 'nekomata', 'chochin', 'bakekujira'
  ];

  let grid = BoardGenerator.generateBoard({
    rows,
    cols,
    characterPool,
    stoneCount: 4,
    iceCount: 4,
    thornCount: 4,
    webCount: 4,
    barricadeCount: 4
  });

  let selectedTile: TileState | null = null;

  for (let step = 0; step < rounds; step++) {
    totalActions++;
    try {
      // 10% chance to simulate a full shuffle
      if (Math.random() < 0.1) {
        BoardGenerator.reshuffleBoard(grid, rows, cols);
        shufflesTriggered++;
        selectedTile = null;
        continue;
      }

      // 40% chance: Try to find a real valid match and clear it
      if (Math.random() < 0.4) {
        const match = BoardGenerator.findFirstAvailableMatch(grid, rows, cols);
        if (match) {
          const t1 = grid[match.p1.r][match.p1.c];
          const t2 = grid[match.p2.r][match.p2.c];
          if (t1 && t2 && t1.characterId === t2.characterId) {
            t1.isCleared = true;
            t1.characterId = null;
            t2.isCleared = true;
            t2.characterId = null;
            validMatches++;
            selectedTile = null;
            continue;
          }
        }
      }

      // 50% chance: Simulate random or erratic clicks (including out of bounds, already cleared, obstacles)
      const r = Math.floor(Math.random() * (rows + 4)) - 2; // may produce -2..rows+1
      const c = Math.floor(Math.random() * (cols + 4)) - 2; // may produce -2..cols+1

      if (r < 1 || r > rows || c < 1 || c > cols) {
        // Out of bounds click simulation
        invalidClicks++;
        continue;
      }

      const tile = grid[r][c];
      if (!tile || tile.isCleared || !tile.characterId || tile.modifier === 'stone') {
        invalidClicks++;
        continue;
      }

      if (!selectedTile) {
        selectedTile = tile;
      } else if (selectedTile.r === r && selectedTile.c === c) {
        selectedTile = null; // deselect
      } else if (selectedTile.characterId !== tile.characterId) {
        selectedTile = tile; // change selection
      } else {
        // Same character - test path finding
        const adapter = new ChaosBoardAdapter(grid, rows, cols);
        const path = PathFinder.findPath(adapter, { r: selectedTile.r, c: selectedTile.c }, { r, c });
        if (path) {
          selectedTile.isCleared = true;
          selectedTile.characterId = null;
          tile.isCleared = true;
          tile.characterId = null;
          validMatches++;
          selectedTile = null;
        } else {
          invalidClicks++;
          selectedTile = null;
        }
      }

      // Audit parity at every 50 steps
      if (step % 50 === 0) {
        const counts = new Map<string, number>();
        for (let ro = 1; ro <= rows; ro++) {
          for (let co = 1; co <= cols; co++) {
            const cell = grid[ro][co];
            if (cell && !cell.isCleared && cell.characterId) {
              counts.set(cell.characterId, (counts.get(cell.characterId) || 0) + 1);
            }
          }
        }
        for (const [charId, count] of counts.entries()) {
          if (count % 2 !== 0) {
            errors.push(`Parity violation detected at step ${step}: ${charId} count = ${count}`);
          }
        }
      }
    } catch (err: any) {
      errors.push(`Exception at step ${step}: ${err?.message || String(err)}`);
    }
  }

  return {
    success: errors.length === 0,
    totalActions,
    validMatches,
    invalidClicks,
    shufflesTriggered,
    errors,
    durationMs: Date.now() - startTime
  };
}

/**
 * Browser runtime Chaos Stress Test Runner.
 * Exposed on window.runChaosStressTest for automated or manual DevTools execution.
 */
export async function runBrowserChaosStressTest(options: BrowserStressTestOptions = {}): Promise<ChaosTestResult> {
  const movesCount = options.movesCount || 60;
  const delayMs = options.delayMs || 40;
  const spamBoosters = options.spamBoosters ?? true;

  const startTime = Date.now();
  const errors: string[] = [];
  let validMatches = 0;
  let invalidClicks = 0;
  let shufflesTriggered = 0;

  const game = (window as any).__game;
  if (!game) {
    return {
      success: false,
      totalActions: 0,
      validMatches: 0,
      invalidClicks: 0,
      shufflesTriggered: 0,
      errors: ['Phaser Game instance (window.__game) not found.'],
      durationMs: 0
    };
  }

  let activeScene = game.scene.getScenes(true).find((s: any) => s.scene.key === 'GameScene');
  if (!activeScene) {
    console.log('[ChaosMonkey] 🎮 GameScene not active, automatically starting Level 1 for stress test...');
    const currentScene = game.scene.getScenes(true)[0];
    if (currentScene) {
      currentScene.scene.start('GameScene', { levelId: 1 });
    } else {
      game.scene.start('GameScene', { levelId: 1 });
    }
    await new Promise(res => setTimeout(res, 800));
    activeScene = game.scene.getScenes(true).find((s: any) => s.scene.key === 'GameScene');
  }

  if (!activeScene) {
    return {
      success: false,
      totalActions: 0,
      validMatches: 0,
      invalidClicks: 0,
      shufflesTriggered: 0,
      errors: ['Failed to initialize or transition to GameScene.'],
      durationMs: 0
    };
  }

  const boardManager = (activeScene as any).boardManager;
  if (!boardManager) {
    return {
      success: false,
      totalActions: 0,
      validMatches: 0,
      invalidClicks: 0,
      shufflesTriggered: 0,
      errors: ['BoardManager not found in active GameScene.'],
      durationMs: 0
    };
  }

  const rows = boardManager.getRows();
  const cols = boardManager.getCols();

  console.log(`[ChaosMonkey] 🐵 Starting Chaos Stress Test with ${movesCount} actions (delay ${delayMs}ms)...`);

  for (let i = 0; i < movesCount; i++) {
    try {
      const actionType = Math.random();

      if (actionType < 0.70) {
        // Tile Click: randomly click tiles (including obstacles, empty cells, corners)
        const r = Math.floor(Math.random() * (rows + 2)); // 0..rows+1
        const c = Math.floor(Math.random() * (cols + 2)); // 0..cols+1
        boardManager.handleTileClick(r, c);
        invalidClicks++;
      } else if (actionType < 0.85 && spamBoosters) {
        // Booster action test
        if (Math.random() < 0.5) {
          const hintFound = boardManager.showHint();
          if (hintFound) validMatches++;
        } else {
          boardManager.performShuffle();
          shufflesTriggered++;
        }
      } else {
        // Auto-match if available to simulate fast user skill
        const match = BoardGenerator.findFirstAvailableMatch(boardManager.getGrid(), rows, cols, boardManager.getPortals());
        if (match) {
          boardManager.handleTileClick(match.p1.r, match.p1.c);
          boardManager.handleTileClick(match.p2.r, match.p2.c);
          validMatches++;
        }
      }
    } catch (err: any) {
      const msg = `Step ${i} threw: ${err?.message || String(err)}`;
      console.error('[ChaosMonkey Error]', msg);
      errors.push(msg);
    }

    if (delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  // Failsafe check: verify scene is still running and did not crash
  const isSceneActive = activeScene.scene.isActive();
  if (!isSceneActive) {
    errors.push('GameScene stopped or crashed during stress test.');
  }

  const result: ChaosTestResult = {
    success: errors.length === 0,
    totalActions: movesCount,
    validMatches,
    invalidClicks,
    shufflesTriggered,
    errors,
    durationMs: Date.now() - startTime
  };

  console.log('[ChaosMonkey] 🏁 Stress Test Completed:', result);
  return result;
}

/**
 * Registers window.runChaosStressTest globally in browser environments
 */
export function registerChaosRunnerGlobal(): void {
  if (typeof window !== 'undefined') {
    (window as any).runChaosStressTest = runBrowserChaosStressTest;
    (window as any).runHeadlessChaosSimulation = runHeadlessChaosSimulation;
  }
}
