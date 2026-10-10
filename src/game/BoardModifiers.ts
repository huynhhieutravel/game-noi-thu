import { BoardMovement, TileState } from '../types';

export class BoardModifiers {
  public static isImmobile(mod?: string): boolean {
    return mod === 'stone' || mod === 'thorn' || mod === 'barricade' || mod === 'web' || mod === 'lock' || mod === 'ice';
  }

  /**
   * Applies directional board movement (gravity/shift) after a match has cleared tiles.
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
          const colTiles: string[] = [];
          for (let r = 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              colTiles.push(grid[r][c].characterId!);
            }
          }

          // Clear
          for (let r = 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }

          // Ghi từ dưới lên
          let writeRow = rows;
          while (colTiles.length > 0 && writeRow >= 1) {
            if (!BoardModifiers.isImmobile(grid[writeRow][c].modifier)) {
              const charId = colTiles.pop()!;
              if (grid[writeRow][c].characterId !== charId) hasShifted = true;
              grid[writeRow][c].characterId = charId;
              grid[writeRow][c].isCleared = false;
            }
            writeRow--;
          }
        }
        break;
      }

      case 'up': {
        // Mỗi cột trôi lên trên (hàng = 1)
        for (let c = 1; c <= cols; c++) {
          const colTiles: string[] = [];
          for (let r = 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              colTiles.push(grid[r][c].characterId!);
            }
          }

          for (let r = 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }

          let writeRow = 1;
          for (const charId of colTiles) {
            while (writeRow <= rows && BoardModifiers.isImmobile(grid[writeRow][c].modifier)) {
              writeRow++;
            }
            if (writeRow <= rows) {
              if (grid[writeRow][c].characterId !== charId) hasShifted = true;
              grid[writeRow][c].characterId = charId;
              grid[writeRow][c].isCleared = false;
              writeRow++;
            }
          }
        }
        break;
      }

      case 'left': {
        // Mỗi hàng dạt sang trái (cột = 1)
        for (let r = 1; r <= rows; r++) {
          const rowTiles: string[] = [];
          for (let c = 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rowTiles.push(grid[r][c].characterId!);
            }
          }

          for (let c = 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }

          let writeCol = 1;
          for (const charId of rowTiles) {
            while (writeCol <= cols && BoardModifiers.isImmobile(grid[r][writeCol].modifier)) {
              writeCol++;
            }
            if (writeCol <= cols) {
              if (grid[r][writeCol].characterId !== charId) hasShifted = true;
              grid[r][writeCol].characterId = charId;
              grid[r][writeCol].isCleared = false;
              writeCol++;
            }
          }
        }
        break;
      }

      case 'right': {
        // Mỗi hàng dạt sang phải (cột = cols)
        for (let r = 1; r <= rows; r++) {
          const rowTiles: string[] = [];
          for (let c = 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rowTiles.push(grid[r][c].characterId!);
            }
          }

          for (let c = 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }

          let writeCol = cols;
          while (rowTiles.length > 0 && writeCol >= 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeCol].modifier)) {
              const charId = rowTiles.pop()!;
              if (grid[r][writeCol].characterId !== charId) hasShifted = true;
              grid[r][writeCol].characterId = charId;
              grid[r][writeCol].isCleared = false;
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
          const topTiles: string[] = [];
          for (let r = 1; r <= midR; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              topTiles.push(grid[r][c].characterId!);
            }
          }
          for (let r = 1; r <= midR; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeTop = midR;
          while (topTiles.length > 0 && writeTop >= 1) {
            if (!BoardModifiers.isImmobile(grid[writeTop][c].modifier)) {
              const charId = topTiles.pop()!;
              if (grid[writeTop][c].characterId !== charId) hasShifted = true;
              grid[writeTop][c].characterId = charId;
              grid[writeTop][c].isCleared = false;
            }
            writeTop--;
          }

          // Nửa dưới (midR+1..rows) -> dồn lên midR+1
          const botTiles: string[] = [];
          for (let r = midR + 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              botTiles.push(grid[r][c].characterId!);
            }
          }
          for (let r = midR + 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeBot = midR + 1;
          let botIdx = 0;
          while (botIdx < botTiles.length && writeBot <= rows) {
            if (!BoardModifiers.isImmobile(grid[writeBot][c].modifier)) {
              const charId = botTiles[botIdx++];
              if (grid[writeBot][c].characterId !== charId) hasShifted = true;
              grid[writeBot][c].characterId = charId;
              grid[writeBot][c].isCleared = false;
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
          const leftTiles: string[] = [];
          for (let c = 1; c <= midC; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              leftTiles.push(grid[r][c].characterId!);
            }
          }
          for (let c = 1; c <= midC; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeLeft = midC;
          while (leftTiles.length > 0 && writeLeft >= 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeLeft].modifier)) {
              const charId = leftTiles.pop()!;
              if (grid[r][writeLeft].characterId !== charId) hasShifted = true;
              grid[r][writeLeft].characterId = charId;
              grid[r][writeLeft].isCleared = false;
            }
            writeLeft--;
          }

          // Nửa phải (midC+1..cols) -> dồn sang trái midC+1
          const rightTiles: string[] = [];
          for (let c = midC + 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rightTiles.push(grid[r][c].characterId!);
            }
          }
          for (let c = midC + 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeRight = midC + 1;
          let rightIdx = 0;
          while (rightIdx < rightTiles.length && writeRight <= cols) {
            if (!BoardModifiers.isImmobile(grid[r][writeRight].modifier)) {
              const charId = rightTiles[rightIdx++];
              if (grid[r][writeRight].characterId !== charId) hasShifted = true;
              grid[r][writeRight].characterId = charId;
              grid[r][writeRight].isCleared = false;
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
          const topTiles: string[] = [];
          for (let r = 1; r <= midR; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              topTiles.push(grid[r][c].characterId!);
            }
          }
          for (let r = 1; r <= midR; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeTop = 1;
          let topIdx = 0;
          while (topIdx < topTiles.length && writeTop <= midR) {
            if (!BoardModifiers.isImmobile(grid[writeTop][c].modifier)) {
              const charId = topTiles[topIdx++];
              if (grid[writeTop][c].characterId !== charId) hasShifted = true;
              grid[writeTop][c].characterId = charId;
              grid[writeTop][c].isCleared = false;
            }
            writeTop++;
          }

          // Nửa dưới -> rơi xuống rows
          const botTiles: string[] = [];
          for (let r = midR + 1; r <= rows; r++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              botTiles.push(grid[r][c].characterId!);
            }
          }
          for (let r = midR + 1; r <= rows; r++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeBot = rows;
          while (botTiles.length > 0 && writeBot >= midR + 1) {
            if (!BoardModifiers.isImmobile(grid[writeBot][c].modifier)) {
              const charId = botTiles.pop()!;
              if (grid[writeBot][c].characterId !== charId) hasShifted = true;
              grid[writeBot][c].characterId = charId;
              grid[writeBot][c].isCleared = false;
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
          const leftTiles: string[] = [];
          for (let c = 1; c <= midC; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              leftTiles.push(grid[r][c].characterId!);
            }
          }
          for (let c = 1; c <= midC; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeLeft = 1;
          let leftIdx = 0;
          while (leftIdx < leftTiles.length && writeLeft <= midC) {
            if (!BoardModifiers.isImmobile(grid[r][writeLeft].modifier)) {
              const charId = leftTiles[leftIdx++];
              if (grid[r][writeLeft].characterId !== charId) hasShifted = true;
              grid[r][writeLeft].characterId = charId;
              grid[r][writeLeft].isCleared = false;
            }
            writeLeft++;
          }

          // Nửa phải -> dạt về mép phải c = cols
          const rightTiles: string[] = [];
          for (let c = midC + 1; c <= cols; c++) {
            if (!grid[r][c].isCleared && grid[r][c].characterId && !BoardModifiers.isImmobile(grid[r][c].modifier)) {
              rightTiles.push(grid[r][c].characterId!);
            }
          }
          for (let c = midC + 1; c <= cols; c++) {
            if (!BoardModifiers.isImmobile(grid[r][c].modifier)) {
              grid[r][c].characterId = null;
              grid[r][c].isCleared = true;
            }
          }
          let writeRight = cols;
          while (rightTiles.length > 0 && writeRight >= midC + 1) {
            if (!BoardModifiers.isImmobile(grid[r][writeRight].modifier)) {
              const charId = rightTiles.pop()!;
              if (grid[r][writeRight].characterId !== charId) hasShifted = true;
              grid[r][writeRight].characterId = charId;
              grid[r][writeRight].isCleared = false;
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
