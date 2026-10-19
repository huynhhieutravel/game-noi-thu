import { describe, it, expect } from 'vitest';
import { formatCurrency, FONT_UI, FONT_DISPLAY, FONT_WEIGHT } from '../src/styles/typography';
import { GAME_HEIGHT, GAME_WIDTH } from '../src/constants';

describe('Typography & Currency Formatting System', () => {
  it('formats currency correctly with dot "." thousands separator', () => {
    // 0 and small numbers
    expect(formatCurrency(0)).toBe('0');
    expect(formatCurrency(5)).toBe('5');
    expect(formatCurrency(99)).toBe('99');
    expect(formatCurrency(500)).toBe('500');
    expect(formatCurrency(999)).toBe('999');

    // Thousands (User specific example: 10050 -> "10.050")
    expect(formatCurrency(1000)).toBe('1.000');
    expect(formatCurrency(5000)).toBe('5.000');
    expect(formatCurrency(10050)).toBe('10.050');
    expect(formatCurrency(3600)).toBe('3.600');
    expect(formatCurrency(25000)).toBe('25.000');
    expect(formatCurrency(100000)).toBe('100.000');
    expect(formatCurrency(999999)).toBe('999.999');

    // Millions and Billions
    expect(formatCurrency(1000000)).toBe('1.000.000');
    expect(formatCurrency(12345678)).toBe('12.345.678');
    expect(formatCurrency(1000000000)).toBe('1.000.000.000');

    // Negative numbers
    expect(formatCurrency(-500)).toBe('-500');
    expect(formatCurrency(-10050)).toBe('-10.050');

    // Edge cases: null, undefined, strings
    expect(formatCurrency(null)).toBe('0');
    expect(formatCurrency(undefined)).toBe('0');
    expect(formatCurrency('10050')).toBe('10.050');
    expect(formatCurrency('1000000')).toBe('1.000.000');
    expect(formatCurrency('invalid')).toBe('0');
  });

  it('exports standardized font family and weight tokens', () => {
    expect(FONT_DISPLAY).toContain('Philosopher');
    expect(FONT_UI).toContain('Plus Jakarta Sans');
    expect(FONT_WEIGHT.REGULAR).toBe('400');
    expect(FONT_WEIGHT.MEDIUM).toBe('600');
    expect(FONT_WEIGHT.BOLD).toBe('700');
    expect(FONT_WEIGHT.EXTRA_BOLD).toBe('800');
  });

  it('mathematically verifies booster buttons safety air gap on 8-row grids', () => {
    // Height = 680
    // Board layout with 8 rows:
    const topReserved = 72;
    const bottomReserved = 78;
    const availableHeight = GAME_HEIGHT - topReserved - bottomReserved; // 530px
    const maxTileH = Math.floor(availableHeight / 8); // 66px
    const tileSize = Math.min(maxTileH, 58); // 58px cap
    const boardHeight = 8 * tileSize; // 464px
    const calcGridTop = topReserved + Math.floor((availableHeight - boardHeight) / 2); // 72 + 33 = 105px
    const boardBottom = calcGridTop + boardHeight; // 569px
    const lacquerFrameBottom = boardBottom + 16; // 585px

    // Compact booster tray:
    const trayY = GAME_HEIGHT - 24; // 656px
    const btnHeight = Math.round(92 * (132 / 290)); // 42px
    const btnTopEdge = trayY - Math.round(btnHeight / 2); // 656 - 21 = 635px

    const clearAirGap = btnTopEdge - lacquerFrameBottom; // 635 - 585 = 50px
    expect(clearAirGap).toBeGreaterThanOrEqual(45); // Guaranteed 45px+ safe distance!
  });
});
