import { GridPoint, TileModifier, TileState } from '../types';
import { CharacterRegistry } from './CharacterRegistry';
import { BoardGrid, PathFinder } from './PathFinder';

export interface BoardConfigOptions {
  rows: number;
  cols: number;
  characterPool: string[];
  iceCount?: number;
  stoneCount?: number;
  lockCount?: number;
  fogCount?: number;
  thornCount?: number;
  webCount?: number;
  barricadeCount?: number;
}

export class BoardGenerator {
  /**
   * Generates a playable board state with guaranteed available matches.
   */
  public static generateBoard(options: BoardConfigOptions): TileState[][] {
    const { rows, cols, characterPool } = options;
    const stoneCount = options.stoneCount || 0;
    const iceCount = options.iceCount || 0;
    const lockCount = options.lockCount || 0;
    const fogCount = options.fogCount || 0;
    const thornCount = options.thornCount || 0;
    const webCount = options.webCount || 0;
    const barricadeCount = options.barricadeCount || 0;

    const totalCells = rows * cols;
    let playableSlots = totalCells - stoneCount;

    // Ensure playable slots is even for perfect pairing
    if (playableSlots % 2 !== 0) {
      playableSlots -= 1;
    }

    const totalPairs = playableSlots / 2;
    const characterList: string[] = [];

    // Guarantee diverse character distribution (Classic Onet / Pikachu standard: max 2 pairs = 4 tiles per character)
    const targetUniqueCount = Math.min(
      Math.max(characterPool.length, Math.ceil(totalPairs / 2)),
      totalPairs
    );

    let expandedPool = characterPool.filter(id => !CharacterRegistry.isBoss(id));
    if (expandedPool.length < targetUniqueCount) {
      // Find theme from first character or fallback to yokai
      const firstChar = characterPool.length > 0 ? CharacterRegistry.get(characterPool[0]) : undefined;
      const theme = firstChar?.collection || (firstChar as any)?.theme || 'yokai';
      const allThemeChars = CharacterRegistry.getByCollection(theme)
        .filter(c => !CharacterRegistry.isBoss(c))
        .map(c => c.id);
      this.shuffleArray(allThemeChars);

      for (const id of allThemeChars) {
        if (!expandedPool.includes(id)) {
          expandedPool.push(id);
          if (expandedPool.length >= targetUniqueCount) break;
        }
      }

      // If still not enough, pull from all non-boss characters in registry
      if (expandedPool.length < targetUniqueCount) {
        const allChars = CharacterRegistry.getAll()
          .filter(c => !CharacterRegistry.isBoss(c))
          .map(c => c.id);
        this.shuffleArray(allChars);
        for (const id of allChars) {
          if (!expandedPool.includes(id)) {
            expandedPool.push(id);
            if (expandedPool.length >= targetUniqueCount) break;
          }
        }
      }
    }

    // Pick exactly targetUniqueCount diverse characters
    this.shuffleArray(expandedPool);
    const chosenChars = expandedPool.slice(0, targetUniqueCount);

    // Distribute pairs evenly across chosen characters (each gets 1..2 pairs, max 3)
    for (let i = 0; i < totalPairs; i++) {
      const charId = chosenChars[i % chosenChars.length];
      characterList.push(charId, charId);
    }

    // Shuffle characters
    this.shuffleArray(characterList);

    // Initialize full grid including padding (0..rows+1, 0..cols+1)
    const grid: TileState[][] = [];
    for (let r = 0; r <= rows + 1; r++) {
      grid[r] = [];
      for (let c = 0; c <= cols + 1; c++) {
        // Boundary padding is cleared empty space
        const isBoundary = r === 0 || r === rows + 1 || c === 0 || c === cols + 1;
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
          isCleared: isBoundary
        };
      }
    }

    // Collect playable inner coordinates
    const innerCoords: GridPoint[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        innerCoords.push({ r, c });
      }
    }
    this.shuffleArray(innerCoords);

    // Place stone obstacles if any
    let placedStones = 0;
    while (placedStones < stoneCount && innerCoords.length > 0) {
      const coord = innerCoords.pop()!;
      grid[coord.r][coord.c].modifier = 'stone';
      grid[coord.r][coord.c].modifierLevel = 3; // Cự thạch cấp 3
      grid[coord.r][coord.c].characterId = null;
      grid[coord.r][coord.c].isCleared = false;
      placedStones++;
    }

    // Fill inner tiles with characters
    let charIdx = 0;
    for (const coord of innerCoords) {
      if (charIdx < characterList.length) {
        grid[coord.r][coord.c].characterId = characterList[charIdx++];
        grid[coord.r][coord.c].isCleared = false;
      } else {
        // Any remaining odd cell left empty
        grid[coord.r][coord.c].isCleared = true;
      }
    }

    // Apply modifiers to randomly selected active tiles
    const activeTiles: TileState[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const tile = grid[r][c];
        if (!tile.isCleared && tile.characterId && tile.modifier === 'none') {
          activeTiles.push(tile);
        }
      }
    }
    this.shuffleArray(activeTiles);

    // Apply Thorn Bramble (3 levels)
    let appliedThorn = 0;
    while (appliedThorn < thornCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'thorn';
      t.modifierLevel = 3;
      appliedThorn++;
    }

    // Apply Spider Web (2 levels)
    let appliedWeb = 0;
    while (appliedWeb < webCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'web';
      t.modifierLevel = 2;
      appliedWeb++;
    }

    // Apply Iron Barricade (3 levels)
    let appliedBarricade = 0;
    while (appliedBarricade < barricadeCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'barricade';
      t.modifierLevel = 3;
      appliedBarricade++;
    }

    // Apply Ice
    let appliedIce = 0;
    while (appliedIce < iceCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'ice';
      t.iceLayers = 2;
      appliedIce++;
    }

    // Apply Lock
    let appliedLock = 0;
    while (appliedLock < lockCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'lock';
      t.isLocked = true;
      appliedLock++;
    }

    // Apply Fog
    let appliedFog = 0;
    while (appliedFog < fogCount && activeTiles.length > 0) {
      const t = activeTiles.pop()!;
      t.modifier = 'fog';
      t.isFogged = true;
      appliedFog++;
    }

    // Dynamic Special Tiles: Lightning, Lucky Pot, Shapeshifter
    const findMatchingPair = (): [TileState, TileState] | null => {
      for (let i = 0; i < activeTiles.length; i++) {
        const t1 = activeTiles[i];
        if (t1.modifier !== 'none') continue;
        for (let j = i + 1; j < activeTiles.length; j++) {
          const t2 = activeTiles[j];
          if (t2.modifier !== 'none') continue;
          if (t1.characterId === t2.characterId) {
            return [t1, t2];
          }
        }
      }
      return null;
    };

    // 1. Ô Sét Lan (Lightning Duo ⚡)
    const lightningPair = findMatchingPair();
    if (lightningPair) {
      lightningPair[0].modifier = 'lightning';
      lightningPair[0].isLightning = true;
      lightningPair[1].modifier = 'lightning';
      lightningPair[1].isLightning = true;
    }

    // 2. Hũ Vàng May Mắn (Lucky Coin Pot 🏺)
    const luckyPair = findMatchingPair();
    if (luckyPair) {
      luckyPair[0].modifier = 'lucky_pot';
      luckyPair[0].isLuckyPot = true;
      luckyPair[0].luckyPotTimeLeft = 10;
      luckyPair[1].modifier = 'lucky_pot';
      luckyPair[1].isLuckyPot = true;
      luckyPair[1].luckyPotTimeLeft = 10;
    }

    // 3. Ô Hồ Ly Biến Hình (Shapeshifter 🍃)
    const shapeshifterPair = findMatchingPair();
    if (shapeshifterPair) {
      shapeshifterPair[0].modifier = 'shapeshifter';
      shapeshifterPair[0].isShapeshifter = true;
      shapeshifterPair[1].modifier = 'shapeshifter';
      shapeshifterPair[1].isShapeshifter = true;
    }

    // Verify board has at least 1 legal match; if not, reshuffle characters
    let attempts = 0;
    while (!this.findFirstAvailableMatch(grid, rows, cols) && attempts < 20) {
      this.reshuffleBoard(grid, rows, cols);
      attempts++;
    }

    return grid;
  }

  /**
   * Reshuffle non-cleared, non-stone tiles when in deadlock or booster shuffle is triggered
   */
  /**
   * Reshuffle non-cleared, non-stone tiles when in deadlock or booster shuffle is triggered.
   * Self-healing: Guarantees that every character has an even pair and the board is 100% solvable.
   */
  public static reshuffleBoard(
    grid: TileState[][],
    rows: number,
    cols: number,
    portals?: { portalA: GridPoint; portalB: GridPoint } | null
  ): boolean {
    const movableTiles: TileState[] = [];
    let charPool: string[] = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const tile = grid[r][c];
        if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
          movableTiles.push(tile);
          charPool.push(tile.characterId);
        }
      }
    }

    if (movableTiles.length <= 1) return false;

    // 0. Auto-rescue trapped tiles if fewer than 2 clickable tiles remain (prevents infinite deadlock auto-shuffle loop)
    const trappedTiles = movableTiles.filter(t => t.modifier === 'thorn' || t.modifier === 'barricade' || t.isLocked);
    let clickableCount = movableTiles.length - trappedTiles.length;
    if (clickableCount < 2 && trappedTiles.length > 0) {
      for (const t of trappedTiles) {
        t.modifier = 'none';
        t.modifierLevel = 0;
        t.isLocked = false;
        clickableCount++;
        if (clickableCount >= 2) break;
      }
    }

    // 1. Revert solitary special tiles whose partners were already cleared
    const rawShifters = movableTiles.filter(t => t.isShapeshifter || t.modifier === 'shapeshifter');
    if (rawShifters.length === 1) {
      rawShifters[0].isShapeshifter = false;
      rawShifters[0].modifier = 'none';
    }
    const rawLucky = movableTiles.filter(t => t.isLuckyPot || t.modifier === 'lucky_pot');
    if (rawLucky.length === 1) {
      rawLucky[0].isLuckyPot = false;
      rawLucky[0].modifier = 'none';
      rawLucky[0].luckyPotTimeLeft = undefined;
    }
    const rawLightning = movableTiles.filter(t => t.isLightning || t.modifier === 'lightning');
    if (rawLightning.length === 1) {
      rawLightning[0].isLightning = false;
      rawLightning[0].modifier = 'none';
    }

    const shifters = movableTiles.filter(t => t.isShapeshifter || t.modifier === 'shapeshifter');
    const lucky = movableTiles.filter(t => t.isLuckyPot || t.modifier === 'lucky_pot');
    const lightning = movableTiles.filter(t => t.isLightning || t.modifier === 'lightning');

    // 2. Audit character parity in charPool
    const counts: Record<string, number> = {};
    for (const id of charPool) {
      counts[id] = (counts[id] || 0) + 1;
    }

    const hasOddCount = Object.values(counts).some(cnt => cnt % 2 !== 0);

    // If parity is broken (e.g. from lone shapeshifter morphing), HEAL the pool immediately!
    if (hasOddCount || charPool.length % 2 !== 0) {
      let targetCount = movableTiles.length;
      if (targetCount % 2 !== 0) {
        const oddTile = movableTiles.pop()!;
        oddTile.isCleared = true;
        oddTile.characterId = null;
        targetCount = movableTiles.length;
      }

      const uniqueChars = Object.keys(counts);
      const totalPairs = targetCount / 2;
      charPool = [];
      for (let p = 0; p < totalPairs; p++) {
        const charId = uniqueChars[p % uniqueChars.length] || 'kasa_obake';
        charPool.push(charId, charId);
      }
    }

    // Extract unique character pairs from charPool
    const pairChars: string[] = [];
    for (let p = 0; p < charPool.length; p += 2) {
      pairChars.push(charPool[p]);
    }

    // Group non-special tiles
    const specialSet = new Set([...shifters, ...lucky, ...lightning]);
    const regularTiles = movableTiles.filter(t => !specialSet.has(t));

    // 3. Try random shuffles while strictly keeping coupled special pairs identical
    let attempts = 0;
    while (attempts < 60) {
      this.shuffleArray(pairChars);
      let pairIdx = 0;

      // Assign identical character to both Shapeshifter tiles
      if (shifters.length >= 2) {
        const char = pairChars[pairIdx++];
        for (const s of shifters) s.characterId = char;
      }

      // Assign identical character to both Lucky Pot tiles
      if (lucky.length >= 2) {
        const char = pairChars[pairIdx++];
        for (const l of lucky) l.characterId = char;
      }

      // Assign identical character to both Lightning tiles
      if (lightning.length >= 2) {
        const char = pairChars[pairIdx++];
        for (const lt of lightning) lt.characterId = char;
      }

      // Remaining characters are distributed among regular tiles in pairs
      const remainingChars: string[] = [];
      while (pairIdx < pairChars.length) {
        const c = pairChars[pairIdx++];
        remainingChars.push(c, c);
      }
      this.shuffleArray(remainingChars);

      for (let i = 0; i < regularTiles.length; i++) {
        regularTiles[i].characterId = remainingChars[i] || 'kasa_obake';
      }

      if (this.findFirstAvailableMatch(grid, rows, cols, portals)) {
        return true;
      }
      attempts++;
    }

    // 4. Fallback: Force a guaranteed valid reachable pair to prevent any deadlock
    const boardGridAdapter: BoardGrid = {
      rows,
      cols,
      isEmpty: (r, c) => {
        if (r < 0 || r > rows + 1 || c < 0 || c > cols + 1) return true;
        const cell = grid[r][c];
        return cell.isCleared && cell.modifier !== 'stone';
      }
    };

    // Find any reachable pair among clickable regular tiles first
    const clickableTiles = regularTiles.filter(t => t.modifier !== 'thorn' && t.modifier !== 'barricade' && t.modifier !== 'stone');
    const targetPool = clickableTiles.length >= 2 ? clickableTiles : regularTiles.length >= 2 ? regularTiles : movableTiles;
    for (let i = 0; i < targetPool.length; i++) {
      for (let j = i + 1; j < targetPool.length; j++) {
        const t1 = targetPool[i];
        const t2 = targetPool[j];
        const path = PathFinder.findPath(boardGridAdapter, { r: t1.r, c: t1.c }, { r: t2.r, c: t2.c }, portals);
        if (path) {
          const matchChar = t1.characterId || pairChars[0] || 'kasa_obake';
          t1.characterId = matchChar;
          if (t2.characterId !== matchChar) {
            // Find another tile with matchChar and swap with t2 to preserve exact pair parity
            const otherPartner = regularTiles.find(t => t !== t1 && t.characterId === matchChar);
            if (otherPartner && otherPartner !== t2) {
              const oldT2Char = t2.characterId;
              t2.characterId = matchChar;
              otherPartner.characterId = oldT2Char;
            } else {
              t2.characterId = matchChar;
            }
          }
          return true;
        }
      }
    }

    return true;
  }

  /**
   * Finds the first playable pair that can be connected right now (used for Hint & Solvability check)
   */
  public static findFirstAvailableMatch(
    grid: TileState[][],
    rows: number,
    cols: number,
    portals?: { portalA: GridPoint; portalB: GridPoint } | null
  ): { p1: GridPoint; p2: GridPoint; path: GridPoint[] } | null {
    const activeTiles: TileState[] = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const tile = grid[r][c];
        if (!tile.isCleared && tile.characterId && !tile.isLocked && tile.modifier !== 'thorn' && tile.modifier !== 'barricade' && tile.modifier !== 'stone') {
          activeTiles.push(tile);
        }
      }
    }

    const effectivePortals = portals || null;

    const boardGridAdapter: BoardGrid = {
      rows,
      cols,
      isEmpty: (r, c) => {
        if (r < 0 || r > rows + 1 || c < 0 || c > cols + 1) return true;
        const cell = grid[r][c];
        return cell.isCleared && cell.modifier !== 'stone';
      }
    };

    // Compare all pairs with identical character ID
    for (let i = 0; i < activeTiles.length; i++) {
      const t1 = activeTiles[i];
      for (let j = i + 1; j < activeTiles.length; j++) {
        const t2 = activeTiles[j];
        if (t1.characterId === t2.characterId) {
          const pathResult = PathFinder.findPath(
            boardGridAdapter,
            { r: t1.r, c: t1.c },
            { r: t2.r, c: t2.c },
            effectivePortals
          );

          if (pathResult) {
            return {
              p1: { r: t1.r, c: t1.c },
              p2: { r: t2.r, c: t2.c },
              path: pathResult.points
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Generates a survival board where top rows are initially empty,
   * and only the bottom rows are filled with paired characters.
   */
  public static generateSurvivalBoard(options: {
    rows: number;
    cols: number;
    initialActiveRows: number;
    characterPool: string[];
  }): TileState[][] {
    const { rows, cols, initialActiveRows, characterPool } = options;

    const playableSlots = initialActiveRows * cols;
    const totalPairs = Math.floor(playableSlots / 2);
    const characterList: string[] = [];

    for (let i = 0; i < totalPairs; i++) {
      const charId = characterPool[i % characterPool.length];
      characterList.push(charId, charId);
    }
    this.shuffleArray(characterList);

    const grid: TileState[][] = [];
    for (let r = 0; r <= rows + 1; r++) {
      grid[r] = [];
      for (let c = 0; c <= cols + 1; c++) {
        const isBoundary = r === 0 || r === rows + 1 || c === 0 || c === cols + 1;
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
          isCleared: isBoundary
        };
      }
    }

    // Top rows: 1 to (rows - initialActiveRows) are initially cleared/empty
    const startRow = rows - initialActiveRows + 1;
    for (let r = 1; r < startRow; r++) {
      for (let c = 1; c <= cols; c++) {
        grid[r][c].isCleared = true;
      }
    }

    // Bottom rows: startRow to rows
    let charIdx = 0;
    for (let r = startRow; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        if (charIdx < characterList.length) {
          grid[r][c].characterId = characterList[charIdx++];
          grid[r][c].isCleared = false;
        } else {
          grid[r][c].isCleared = true;
        }
      }
    }

    // Verify board has at least 1 legal match; if not, reshuffle bottom rows
    let attempts = 0;
    while (!this.findFirstAvailableMatch(grid, rows, cols) && attempts < 25) {
      this.shuffleArray(characterList);
      charIdx = 0;
      for (let r = startRow; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          grid[r][c].characterId = characterList[charIdx++];
          grid[r][c].isCleared = false;
        }
      }
      attempts++;
    }

    return grid;
  }

  /**
   * Generates a single row of characters with guaranteed paired characters.
   */
  public static generatePairedRow(cols: number, characterPool: string[]): string[] {
    const pairsCount = Math.floor(cols / 2);
    const result: string[] = [];
    for (let i = 0; i < pairsCount; i++) {
      const charId = characterPool[Math.floor(Math.random() * characterPool.length)];
      result.push(charId, charId);
    }
    while (result.length < cols) {
      result.push(characterPool[Math.floor(Math.random() * characterPool.length)]);
    }
    this.shuffleArray(result);
    return result;
  }

  public static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
