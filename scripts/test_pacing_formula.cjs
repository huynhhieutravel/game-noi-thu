const fs = require('fs');
const path = require('path');

// Simulate the proposed formula across all 100 levels
console.log('========================================================================');
console.log('       QA AUDIT: MATHEMATICAL PACING FORMULA ACROSS 100 LEVELS          ');
console.log('========================================================================\n');

function calculatePacing(levelNum, difficulty) {
  // 1. Board Dimensions
  let rows, cols;
  if (difficulty === 'easy') {
    if (levelNum === 1) { rows = 4; cols = 6; }
    else if (levelNum <= 3) { rows = 6; cols = 6; }
    else if (levelNum <= 10) { rows = levelNum <= 6 ? 6 : (levelNum <= 8 ? 6 : 8); cols = levelNum <= 6 ? 8 : (levelNum <= 8 ? 10 : 8); }
    else if (levelNum <= 30) { rows = 6; cols = 8; }
    else if (levelNum <= 70) { rows = 6; cols = 10; }
    else { rows = 8; cols = 10; }
  } else {
    // Medium / Hard
    if (levelNum <= 20) { rows = 6; cols = 8; }
    else if (levelNum <= 50) { rows = 6; cols = 10; }
    else { rows = 8; cols = 12; }
  }

  const totalCells = rows * cols;
  const totalPairs = totalCells / 2;

  // 2. Target Unique Cards Formula
  let ratio, minFloor, maxCap;
  if (difficulty === 'easy') {
    ratio = 0.50; // Each card appears ~2 pairs (4 tiles)
    if (levelNum === 1) { minFloor = 4; maxCap = 4; }
    else if (levelNum <= 3) { minFloor = 6; maxCap = 8; }
    else if (levelNum <= 10) { minFloor = 8; maxCap = 11; }
    else if (levelNum <= 20) { minFloor = 12; maxCap = 14; } // Egypt
    else if (levelNum <= 50) { minFloor = 14; maxCap = 16; }
    else { minFloor = 16; maxCap = 20; }
  } else if (difficulty === 'medium') {
    ratio = 0.65;
    minFloor = levelNum <= 10 ? 10 : levelNum <= 50 ? 16 : 22;
    maxCap = levelNum <= 10 ? 14 : levelNum <= 50 ? 22 : 28;
  } else {
    // Hard
    ratio = 0.80;
    minFloor = levelNum <= 10 ? 12 : levelNum <= 50 ? 20 : 26;
    maxCap = levelNum <= 10 ? 16 : levelNum <= 50 ? 26 : 34;
  }

  const calculated = Math.round(totalPairs * ratio);
  const targetU = Math.max(minFloor, Math.min(maxCap, Math.min(totalPairs, calculated)));
  const avgPairsPerCard = (totalPairs / targetU).toFixed(2);
  const avgTilesPerCard = (totalCells / targetU).toFixed(1);

  return {
    rows,
    cols,
    totalCells,
    totalPairs,
    targetU,
    avgPairsPerCard,
    avgTilesPerCard
  };
}

// Sample audit key milestones
const milestones = [1, 2, 5, 10, 11, 15, 20, 21, 35, 50, 51, 75, 100];
console.log('SAMPLE LEVELS AUDIT:');
console.log('Level | Diff   | Grid  | Tiles | Pairs | Unique Cards | Avg Pairs/Card | Avg Tiles/Card | Quality Verdict');
console.log('-------------------------------------------------------------------------------------------------------');

milestones.forEach(lvl => {
  ['easy', 'medium', 'hard'].forEach(diff => {
    const res = calculatePacing(lvl, diff);
    const verdict = (res.avgPairsPerCard >= 1.2 && res.avgPairsPerCard <= 3.0) ? 'EXCELLENT' : 'CHECK';
    console.log(
      `${String(lvl).padStart(5)} | ` +
      `${diff.padEnd(6)} | ` +
      `${res.rows}x${String(res.cols).padEnd(2)} | ` +
      `${String(res.totalCells).padStart(5)} | ` +
      `${String(res.totalPairs).padStart(5)} | ` +
      `${String(res.targetU).padStart(12)} | ` +
      `${String(res.avgPairsPerCard).padStart(14)} | ` +
      `${String(res.avgTilesPerCard).padStart(14)} | ` +
      `${verdict}`
    );
  });
});
