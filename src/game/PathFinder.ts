import { GridPoint, MatchPath } from '../types';

export interface BoardGrid {
  rows: number;
  cols: number;
  isEmpty(r: number, c: number): boolean;
}

export class PathFinder {
  /**
   * Find connection path between point A and point B with at most 2 turns (3 segments).
   * Note: The board is padded with empty boundary cells from 0..rows+1 and 0..cols+1.
   * Also supports Torii Portals (wormhole routing between portalA and portalB).
   */
  public static findPath(
    grid: BoardGrid,
    p1: GridPoint,
    p2: GridPoint,
    portals?: { portalA: GridPoint; portalB: GridPoint } | null
  ): MatchPath | null {
    if (p1.r === p2.r && p1.c === p2.c) return null;

    // Check 0-turn (Direct straight line)
    const line0 = this.checkStraightLine(grid, p1, p2);
    if (line0) {
      return {
        points: this.compressPath([p1, p2]),
        turns: 0
      };
    }

    // Check 1-turn (L-shape via corner 1 or corner 2)
    const path1 = this.checkOneTurn(grid, p1, p2);
    if (path1) {
      return {
        points: this.compressPath(path1),
        turns: 1
      };
    }

    // Check 2-turns (Z or U shape)
    const path2 = this.checkTwoTurns(grid, p1, p2);
    if (path2) {
      return {
        points: this.compressPath(path2),
        turns: 2
      };
    }

    // Check Torii Portal Wormhole Path
    if (portals) {
      const portalPath = this.checkPortalPath(grid, p1, p2, portals.portalA, portals.portalB);
      if (portalPath) {
        return portalPath;
      }
    }

    return null;
  }

  /**
   * Torii Portal connection:
   * Laser enters Portal A and emerges from Portal B (or vice versa).
   * Valid if each side requires at most 1 turn to reach its corresponding portal.
   */
  public static checkPortalPath(
    grid: BoardGrid,
    p1: GridPoint,
    p2: GridPoint,
    portalA: GridPoint,
    portalB: GridPoint
  ): MatchPath | null {
    // Attempt 1: p1 -> portalA and portalB -> p2
    const pathA1 = this.findPathToPortal(grid, p1, portalA);
    const pathB2 = this.findPathToPortal(grid, p2, portalB);
    if (pathA1 && pathB2) {
      const cA = this.compressPath(pathA1);
      // pathB2 is p2 -> portalB. Reverse it so it flows portalB -> p2
      const cBFromPortal = [...this.compressPath(pathB2)].reverse();
      return {
        points: [...cA, ...cBFromPortal],
        turns: 2,
        portalConnection: {
          portalA,
          portalB,
          pathA: cA,
          pathB: cBFromPortal
        }
      };
    }

    // Attempt 2: p1 -> portalB and portalA -> p2
    const pathB1 = this.findPathToPortal(grid, p1, portalB);
    const pathA2 = this.findPathToPortal(grid, p2, portalA);
    if (pathB1 && pathA2) {
      const cB = this.compressPath(pathB1);
      // pathA2 is p2 -> portalA. Reverse it so it flows portalA -> p2
      const cAFromPortal = [...this.compressPath(pathA2)].reverse();
      return {
        points: [...cB, ...cAFromPortal],
        turns: 2,
        portalConnection: {
          portalA: portalB,
          portalB: portalA,
          pathA: cB,
          pathB: cAFromPortal
        }
      };
    }

    return null;
  }

  private static findPathToPortal(grid: BoardGrid, p: GridPoint, portal: GridPoint): GridPoint[] | null {
    if (this.checkStraightLine(grid, p, portal)) {
      return [p, portal];
    }
    const oneTurn = this.checkOneTurn(grid, p, portal);
    if (oneTurn) {
      return oneTurn;
    }
    return null;
  }

  /**
   * Checks if there is an unobstructed straight horizontal or vertical line between p1 and p2.
   * Both endpoints can be non-empty; all points STRICTLY between them must be empty.
   */
  public static checkStraightLine(
    grid: BoardGrid,
    p1: GridPoint,
    p2: GridPoint
  ): boolean {
    if (p1.r !== p2.r && p1.c !== p2.c) return false;

    if (p1.r === p2.r) {
      const minC = Math.min(p1.c, p2.c);
      const maxC = Math.max(p1.c, p2.c);
      for (let c = minC + 1; c < maxC; c++) {
        if (!grid.isEmpty(p1.r, c)) return false;
      }
      return true;
    } else {
      const minR = Math.min(p1.r, p2.r);
      const maxR = Math.max(p1.r, p2.r);
      for (let r = minR + 1; r < maxR; r++) {
        if (!grid.isEmpty(r, p1.c)) return false;
      }
      return true;
    }
  }

  /**
   * Check 1-turn connection through Corner 1 (p1.r, p2.c) or Corner 2 (p2.r, p1.c).
   */
  private static checkOneTurn(
    grid: BoardGrid,
    p1: GridPoint,
    p2: GridPoint
  ): GridPoint[] | null {
    // Corner 1: (p1.r, p2.c)
    const c1: GridPoint = { r: p1.r, c: p2.c };
    if (grid.isEmpty(c1.r, c1.c)) {
      if (this.checkStraightLine(grid, p1, c1) && this.checkStraightLine(grid, c1, p2)) {
        return [p1, c1, p2];
      }
    }

    // Corner 2: (p2.r, p1.c)
    const c2: GridPoint = { r: p2.r, c: p1.c };
    if (grid.isEmpty(c2.r, c2.c)) {
      if (this.checkStraightLine(grid, p1, c2) && this.checkStraightLine(grid, c2, p2)) {
        return [p1, c2, p2];
      }
    }

    return null;
  }

  /**
   * Check 2-turn connection by sweeping lines parallel to rows and columns,
   * including the virtual empty margins (0 and rows+1, 0 and cols+1).
   */
  private static checkTwoTurns(
    grid: BoardGrid,
    p1: GridPoint,
    p2: GridPoint
  ): GridPoint[] | null {
    // Sweep along columns (expand horizontally, then vertical connect)
    const maxCols = grid.cols + 1;
    for (let c = 0; c <= maxCols; c++) {
      const pt1: GridPoint = { r: p1.r, c };
      const pt2: GridPoint = { r: p2.r, c };

      const canReachPt1 = (c === p1.c) || (grid.isEmpty(pt1.r, pt1.c) && this.checkStraightLine(grid, p1, pt1));
      if (!canReachPt1) continue;

      const canReachPt2 = (c === p2.c) || (grid.isEmpty(pt2.r, pt2.c) && this.checkStraightLine(grid, p2, pt2));
      if (!canReachPt2) continue;

      if (this.checkStraightLine(grid, pt1, pt2)) {
        return [p1, pt1, pt2, p2];
      }
    }

    // Sweep along rows (expand vertically, then horizontal connect)
    const maxRows = grid.rows + 1;
    for (let r = 0; r <= maxRows; r++) {
      const pt1: GridPoint = { r, c: p1.c };
      const pt2: GridPoint = { r, c: p2.c };

      const canReachPt1 = (r === p1.r) || (grid.isEmpty(pt1.r, pt1.c) && this.checkStraightLine(grid, p1, pt1));
      if (!canReachPt1) continue;

      const canReachPt2 = (r === p2.r) || (grid.isEmpty(pt2.r, pt2.c) && this.checkStraightLine(grid, p2, pt2));
      if (!canReachPt2) continue;

      if (this.checkStraightLine(grid, pt1, pt2)) {
        return [p1, pt1, pt2, p2];
      }
    }

    return null;
  }

  /**
   * Compress intermediate redundant collinear points for clean line rendering
   */
  public static compressPath(points: GridPoint[]): GridPoint[] {
    if (points.length <= 2) return points;

    const result: GridPoint[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = result[result.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // If prev, curr, and next are not in the same straight line, keep curr as a corner
      const isCollinear =
        (prev.r === curr.r && curr.r === next.r) ||
        (prev.c === curr.c && curr.c === next.c);

      if (!isCollinear) {
        result.push(curr);
      }
    }

    result.push(points[points.length - 1]);
    return result;
  }
}
