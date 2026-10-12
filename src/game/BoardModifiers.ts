import { BoardMovement, TileModifier, TileState } from '../types';

interface MovableTileData {
  characterId: string;
  modifier: TileModifier;
  iceLayers: number;
  isLocked: boolean;
  isKey: boolean;
  isFogged: boolean;
  isBossSymbol: boolean;
  modifierLevel?: number;
  hasRelicShard?: boolean;
  isShapeshifter?: boolean;
  isLuckyPot?: boolean;
  isLightning?: boolean;
}

function extractTileData(tile: TileState): MovableTileData {
  return {
    characterId: tile.characterId!,
    modifier: tile.modifier,
    iceLayers: tile.iceLayers,
    isLocked: tile.isLocked,
    isKey: tile.isKey,
    isFogged: tile.isFogged,
    isBossSymbol: tile.isBossSymbol,
    modifierLevel: tile.modifierLevel,
    hasRelicShard: tile.hasRelicShard,
    isShapeshifter: tile.isShapeshifter,
    isLuckyPot: tile.isLuckyPot,
    isLightning: tile.isLightning
  };
}

function clearTileData(tile: TileState): void {
  tile.characterId = null;
  tile.isCleared = true;
  tile.modifier = 'none';
  tile.iceLayers = 0;
  tile.isLocked = false;
  tile.isKey = false;
  tile.isFogged = false;
  tile.isBossSymbol = false;
  tile.hasRelicShard = false;
  tile.isShapeshifter = false;
  tile.isLuckyPot = false;
  tile.isLightning = false;
  tile.modifierLevel = 0;
}

function applyTileData(tile: TileState, data: MovableTileData): boolean {
  const changed = tile.characterId !== data.characterId || tile.modifier !== data.modifier;
  tile.characterId = data.characterId;
  tile.isCleared = false;
  tile.modifier = data.modifier;
  tile.iceLayers = data.iceLayers;
  tile.isLocked = data.isLocked;
  tile.isKey = data.isKey;
  tile.isFogged = data.isFogged;
  tile.isBossSymbol = data.isBossSymbol;
  tile.hasRelicShard = data.hasRelicShard;
  tile.isShapeshifter = data.isShapeshifter;
  tile.isLuckyPot = data.isLuckyPot;
  tile.isLightning = data.isLightning;
  tile.modifierLevel = data.modifierLevel;
  return changed;
}

export class BoardModifiers {
  public static isImmobile(mod?: string): boolean {
    return mod === 'stone' || mod === 'thorn' || mod === 'barricade' || mod === 'web' || mod === 'lock' || mod === 'ice';
  }

  /**
   * Applies directional board movement (gravity/shift) after a match has cleared tiles.
   * Transfers all tile state cleanly and ensures vacated slots are fully reset.
   * Returns true if any tile shifted position.
   */
  public static applyMovement(
    grid: TileState[][],
    rows: number,
    cols: number,
    movement: BoardMovement = 'none'
  ): boolean {
    if (movement === 'none') return false;

    let targetMovement: BoardMovement = movement;
    if (targetMovement === 'chaos') {
      const candidates: BoardMovement[] = [
        'down',
        'up',
        'left',
        'right',
        'center_row',
        'center_col',
        'split_vertical',
        'split_horizontal'
      ];
      targetMovement = candidates[Math.floor(Math.random() * candidates.length)];
    }

    let hasShifted = false;

    switch (targetMovement) {
      case 'down': {
        // Mỗi cột dồn xuống dưới (hàng = rows)
        for (let c = 1; c <= cols; c++) {
          const colTiles: MovableTileData[] = [];
          for (let r = 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              colTiles.push(extractTileData(grid[r][c]));
            }
          }

          // Clear vacated non-immobile cells
          for (let r = 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }

          // Ghi từ dưới lên
          let writeRow = rows;
          while (colTiles.length > 0 && writeRow >= 1) {
            if (!BoardModifiers.isImmobile(grid[writeRow][c].modifier)) {
              const data = colTiles.pop()!;
              if (applyTileData(grid[writeRow][c], data)) hasShifted = true;
            }
            writeRow--;
          }
        }
        break;
      }

      case 'up': {
        // Mỗi cột trôi lên trên (hàng = 1)
        for (let c = 1; c <= cols; c++) {
          const colTiles: MovableTileData[] = [];
          for (let r = 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              colTiles.push(extractTileData(grid[r][c]));
            }
          }

          for (let r = 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }

          let writeRow = 1;
          for (const data of colTiles) {
            while (writeRow <= rows && BoardModifiers.isImmobile(grid[writeRow][c].modifier)) {
              writeRow++;
            }
            if (writeRow <= rows) {
              if (applyTileData(grid[writeRow][c], data)) hasShifted = true;
              writeRow++;
            }
          }
        }
        break;
      }

      case 'left': {
        // Mỗi hàng dạt sang trái (cột = 1)
        for (let r = 1; r <= rows; r++) {
          const rowTiles: MovableTileData[] = [];
          for (let c = 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rowTiles.push(extractTileData(grid[r][c]));
            }
          }

          for (let c = 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }

          let writeCol = 1;
          for (const data of rowTiles) {
            while (writeCol <= cols && BoardModifiers.isImmobile(grid[r][writeCol].modifier)) {
              writeCol++;
            }
            if (writeCol <= cols) {
              if (applyTileData(grid[r][writeCol], data)) hasShifted = true;
              writeCol++;
            }
          }
        }
        break;
      }

      case 'right': {
        // Mỗi hàng dạt sang phải (cột = cols)
        for (let r = 1; r <= rows; r++) {
          const rowTiles: MovableTileData[] = [];
          for (let c = 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rowTiles.push(extractTileData(grid[r][c]));
            }
          }

          for (let c = 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }

          let writeCol = cols;
          while (rowTiles.length > 0 && writeCol >= 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeCol].modifier)) {
              const data = rowTiles.pop()!;
              if (applyTileData(grid[r][writeCol], data)) hasShifted = true;
            }
            writeCol--;
          }
        }
        break;
      }

      case 'center_row': {
        // Ép vào trục ngang giữa: Nửa trên rơi xuống mid, Nửa dưới trôi lên mid+1
        const midR = Math.floor(rows / 2);
        for (let c = 1; c <= cols; c++) {
          // Nửa trên (1..midR) -> dồn xuống midR
          const topTiles: MovableTileData[] = [];
          for (let r = 1; r <= midR; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              topTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let r = 1; r <= midR; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeTop = midR;
          while (topTiles.length > 0 && writeTop >= 1) {
            if (!BoardModifiers.isImmobile(grid[writeTop][c].modifier)) {
              const data = topTiles.pop()!;
              if (applyTileData(grid[writeTop][c], data)) hasShifted = true;
            }
            writeTop--;
          }

          // Nửa dưới (midR+1..rows) -> dồn lên midR+1
          const botTiles: MovableTileData[] = [];
          for (let r = midR + 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              botTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let r = midR + 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeBot = midR + 1;
          let botIdx = 0;
          while (botIdx < botTiles.length && writeBot <= rows) {
            if (!BoardModifiers.isImmobile(grid[writeBot][c].modifier)) {
              const data = botTiles[botIdx++];
              if (applyTileData(grid[writeBot][c], data)) hasShifted = true;
            }
            writeBot++;
          }
        }
        break;
      }

      case 'center_col': {
        // Ép vào tâm cột: Nửa trái dạt sang phải midC, Nửa phải dạt sang trái midC+1
        const midC = Math.floor(cols / 2);
        for (let r = 1; r <= rows; r++) {
          // Nửa trái (1..midC) -> dồn sang midC
          const leftTiles: MovableTileData[] = [];
          for (let c = 1; c <= midC; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              leftTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let c = 1; c <= midC; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeLeft = midC;
          while (leftTiles.length > 0 && writeLeft >= 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeLeft].modifier)) {
              const data = leftTiles.pop()!;
              if (applyTileData(grid[r][writeLeft], data)) hasShifted = true;
            }
            writeLeft--;
          }

          // Nửa phải (midC+1..cols) -> dồn sang trái midC+1
          const rightTiles: MovableTileData[] = [];
          for (let c = midC + 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rightTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let c = midC + 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeRight = midC + 1;
          let rightIdx = 0;
          while (rightIdx < rightTiles.length && writeRight <= cols) {
            if (!BoardModifiers.isImmobile(grid[r][writeRight].modifier)) {
              const data = rightTiles[rightIdx++];
              if (applyTileData(grid[r][writeRight], data)) hasShifted = true;
            }
            writeRight++;
          }
        }
        break;
      }

      case 'split_vertical': {
        // Tách ra hai biên trên dưới: Nửa trên trôi lên 1, Nửa dưới rơi xuống rows
        const midR = Math.floor(rows / 2);
        for (let c = 1; c <= cols; c++) {
          // Nửa trên -> trôi lên hàng 1
          const topTiles: MovableTileData[] = [];
          for (let r = 1; r <= midR; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              topTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let r = 1; r <= midR; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeTop = 1;
          let topIdx = 0;
          while (topIdx < topTiles.length && writeTop <= midR) {
            if (!BoardModifiers.isImmobile(grid[writeTop][c].modifier)) {
              const data = topTiles[topIdx++];
              if (applyTileData(grid[writeTop][c], data)) hasShifted = true;
            }
            writeTop++;
          }

          // Nửa dưới -> rơi xuống rows
          const botTiles: MovableTileData[] = [];
          for (let r = midR + 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              botTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let r = midR + 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeBot = rows;
          while (botTiles.length > 0 && writeBot >= midR + 1) {
            if (!BoardModifiers.isImmobile(grid[writeBot][c].modifier)) {
              const data = botTiles.pop()!;
              if (applyTileData(grid[writeBot][c], data)) hasShifted = true;
            }
            writeBot--;
          }
        }
        break;
      }

      case 'split_horizontal': {
        // Tách ra hai biên trái phải: Nửa trái dạt về 1, Nửa phải dạt về cols
        const midC = Math.floor(cols / 2);
        for (let r = 1; r <= rows; r++) {
          // Nửa trái -> dạt về mép trái c = 1
          const leftTiles: MovableTileData[] = [];
          for (let c = 1; c <= midC; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              leftTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let c = 1; c <= midC; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeLeft = 1;
          let leftIdx = 0;
          while (leftIdx < leftTiles.length && writeLeft <= midC) {
            if (!BoardModifiers.isImmobile(grid[r][writeLeft].modifier)) {
              const data = leftTiles[leftIdx++];
              if (applyTileData(grid[r][writeLeft], data)) hasShifted = true;
            }
            writeLeft++;
          }

          // Nửa phải -> dạt về mép phải c = cols
          const rightTiles: MovableTileData[] = [];
          for (let c = midC + 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rightTiles.push(extractTileData(grid[r][c]));
            }
          }
          for (let c = midC + 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              clearTileData(grid[r][c]);
            }
          }
          let writeRight = cols;
          while (rightTiles.length > 0 && writeRight >= midC + 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeRight].modifier)) {
              const data = rightTiles.pop()!;
              if (applyTileData(grid[r][writeRight], data)) hasShifted = true;
            }
            writeRight--;
          }
        }
        break;
      }
    }

    return hasShifted;
  }
}
