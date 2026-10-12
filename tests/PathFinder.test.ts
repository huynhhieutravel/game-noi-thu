import { describe, it, expect } from 'vitest';
import { PathFinder, BoardGrid } from '../src/game/PathFinder';
import { GridPoint } from '../src/types';

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
        // Boundary is empty by default
        const isBoundary = r === 0 || r === rows + 1 || c === 0 || c === cols + 1;
        this.cleared[r][c] = isBoundary;
      }
    }
  }

  setEmpty(r: number, c: number, empty: boolean) {
    this.cleared[r][c] = empty;
  }

  isEmpty(r: number, c: number): boolean {
    if (r < 0 || r > this.rows + 1 || c < 0 || c > this.cols + 1) return false;
    return this.cleared[r][c];
  }
}

describe('PathFinder', () => {
  it('should return null if points are identical', () => {
    const grid = new MockGrid(4, 4);
    const p1: GridPoint = { r: 1, c: 1 };
    expect(PathFinder.findPath(grid, p1, p1)).toBeNull();
  });

  it('should find 0-turn straight horizontal path between adjacent tiles', () => {
    const grid = new MockGrid(4, 4);
    // (1,1) to (1,2)
    const p1: GridPoint = { r: 1, c: 1 };
    const p2: GridPoint = { r: 1, c: 2 };
    const path = PathFinder.findPath(grid, p1, p2);
    expect(path).not.toBeNull();
    expect(path?.turns).toBe(0);
    expect(path?.points).toEqual([p1, p2]);
  });

  it('should find 0-turn straight vertical path through empty cells', () => {
    const grid = new MockGrid(4, 4);
    // (1,1) to (3,1), with (2,1) empty
    grid.setEmpty(2, 1, true);
    const p1: GridPoint = { r: 1, c: 1 };
    const p2: GridPoint = { r: 3, c: 1 };
    const path = PathFinder.findPath(grid, p1, p2);
    expect(path).not.toBeNull();
    expect(path?.turns).toBe(0);
  });

  it('should return null if 0-turn straight path is blocked', () => {
    const grid = new MockGrid(4, 4);
    // (1,1) to (3,1), but (2,1) is NOT empty
    grid.setEmpty(2, 1, false);
    // Also block surrounding corners so 1-turn and 2-turn don't match
    const p1: GridPoint = { r: 1, c: 1 };
    const p2: GridPoint = { r: 3, c: 1 };
    // Only test checkStraightLine directly
    const straight = PathFinder.checkStraightLine(grid, p1, p2);
    expect(straight).toBe(false);
  });

  it('should find 1-turn L-shaped path via corner', () => {
    const grid = new MockGrid(4, 4);
    // (1,1) to (2,2) with corner (1,2) empty
    grid.setEmpty(1, 2, true);
    const p1: GridPoint = { r: 1, c: 1 };
    const p2: GridPoint = { r: 2, c: 2 };
    const path = PathFinder.findPath(grid, p1, p2);
    expect(path).not.toBeNull();
    expect(path?.turns).toBe(1);
  });

  it('should find 2-turn U-shaped path around the exterior padding margin', () => {
    const grid = new MockGrid(4, 4);
    // Two tiles on the top row: (1, 1) and (1, 3).
    // The cell between them (1, 2) is blocked (not empty).
    grid.setEmpty(1, 2, false);
    // Row 0 is the boundary padding margin (always empty).
    const p1: GridPoint = { r: 1, c: 1 };
    const p2: GridPoint = { r: 1, c: 3 };
    const path = PathFinder.findPath(grid, p1, p2);
    expect(path).not.toBeNull();
    expect(path?.turns).toBe(2);
    // The path should route through row 0
    const routesViaRow0 = path?.points.some(pt => pt.r === 0);
    expect(routesViaRow0).toBe(true);
  });
});
