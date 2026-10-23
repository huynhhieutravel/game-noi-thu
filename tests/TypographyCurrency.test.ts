import { describe, it, expect } from 'vitest';
import { formatCurrency, FONT_UI, FONT_DISPLAY, FONT_WEIGHT, Typography, registerTypographyExtensions } from '../src/styles/typography';
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
    expect(FONT_DISPLAY).toContain('Plus Jakarta Sans');
    expect(FONT_DISPLAY).toContain('Philosopher');
    expect(FONT_UI).toContain('Plus Jakarta Sans');
    expect(FONT_WEIGHT.REGULAR).toBe('400');
    expect(FONT_WEIGHT.MEDIUM).toBe('600');
    expect(FONT_WEIGHT.BOLD).toBe('700');
    expect(FONT_WEIGHT.EXTRA_BOLD).toBe('800');
    expect(FONT_WEIGHT.BLACK).toBe('900');
  });

  it('provides complete typography token presets for all 7 variants', () => {
    const variants = ['display', 'heading', 'title', 'subtitle', 'body', 'badge', 'caption'] as const;
    for (const v of variants) {
      const style = Typography.style(v);
      expect(style.fontFamily).toBeDefined();
      expect(style.fontSize).toBeDefined();
      expect(style.fontStyle).toBeDefined();
      expect(style.color).toBeDefined();
    }

    // Specific token checks
    expect(Typography.style('display').fontSize).toBe('32px');
    expect(Typography.style('heading').fontSize).toBe('22px');
    expect(Typography.style('title').fontSize).toBe('17px');
    expect(Typography.style('subtitle').fontSize).toBe('13.5px');
    expect(Typography.style('body').fontSize).toBe('12px');
    expect(Typography.style('badge').fontSize).toBe('11px');
    expect(Typography.style('caption').fontSize).toBe('9.5px');
  });

  it('correctly merges style overrides without mutating base tokens', () => {
    const customStyle = Typography.style('heading', {
      color: '#00ffcc',
      fontSize: '26px'
    });
    expect(customStyle.color).toBe('#00ffcc');
    expect(customStyle.fontSize).toBe('26px');
    expect(customStyle.fontFamily).toBe(FONT_DISPLAY);

    // Verify base token is untouched
    const freshStyle = Typography.style('heading');
    expect(freshStyle.color).toBe('#ffd700');
    expect(freshStyle.fontSize).toBe('22px');
  });

  it('safely registers and invokes uiText and displayText extensions on GameObjectFactory', () => {
    const mockFactoryProto: any = {
      text: (x: number, y: number, text: string, style: any) => ({ x, y, text, style })
    };
    const mockPhaser = {
      GameObjects: {
        GameObjectFactory: {
          prototype: mockFactoryProto
        }
      }
    };

    registerTypographyExtensions(mockPhaser);
    expect(typeof mockFactoryProto.uiText).toBe('function');
    expect(typeof mockFactoryProto.displayText).toBe('function');

    const createdUi = mockFactoryProto.uiText(100, 200, 'Test UI', 'title', { color: '#ff0000' });
    expect(createdUi.x).toBe(100);
    expect(createdUi.y).toBe(200);
    expect(createdUi.text).toBe('Test UI');
    expect(createdUi.style.fontSize).toBe('17px');
    expect(createdUi.style.color).toBe('#ff0000');

    const createdDisplay = mockFactoryProto.displayText(50, 60, 'Test Display', 'heading');
    expect(createdDisplay.text).toBe('Test Display');
    expect(createdDisplay.style.fontFamily).toBe(FONT_DISPLAY);
    expect(createdDisplay.style.fontSize).toBe('22px');
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
    const trayY = GAME_HEIGHT - 44; // 636px (raised to avoid iOS home bar / Siri gesture)
    const btnHeight = 56; // 56px enlarged tactile buttons
    const btnTopEdge = trayY - Math.round(btnHeight / 2); // 636 - 28 = 608px

    const clearAirGap = btnTopEdge - lacquerFrameBottom; // 608 - 585 = 23px
    expect(clearAirGap).toBeGreaterThanOrEqual(20); // Guaranteed 20px+ safe distance from board!
  });
});
