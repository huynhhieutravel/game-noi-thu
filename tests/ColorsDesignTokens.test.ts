import { describe, it, expect } from 'vitest';
import {
  COLORS,
  COLOR_HEX,
  SEMANTIC_COLORS,
  toHexString,
  toColorNumber,
  hexToRgb,
  toRgbaString
} from '../src/styles/colors';

describe('Centralized Color & Theme Token System', () => {
  it('guarantees dual-format parity between numeric COLORS and string COLOR_HEX', () => {
    // Check that every key in COLORS corresponds to valid 6-char hex in COLOR_HEX
    const keys = Object.keys(COLORS) as Array<keyof typeof COLORS>;
    expect(keys.length).toBeGreaterThanOrEqual(25);

    for (const key of keys) {
      const numVal = COLORS[key];
      const strVal = COLOR_HEX[key];

      expect(typeof numVal).toBe('number');
      expect(typeof strVal).toBe('string');
      expect(strVal).toMatch(/^#[0-9a-f]{6}$/i);

      // Bidirectional equality
      expect(toHexString(numVal).toLowerCase()).toBe(strVal.toLowerCase());
      expect(toColorNumber(strVal)).toBe(numVal);
    }
  });

  it('correctly maps core brand and domain colors', () => {
    // Gold currency
    expect(COLOR_HEX.GOLD.toLowerCase()).toBe('#ffd700');
    expect(COLORS.GOLD).toBe(0xffd700);

    // Cyan EXP
    expect(COLOR_HEX.CYAN.toLowerCase()).toBe('#00f5d4');
    expect(COLORS.CYAN).toBe(0x00f5d4);

    // Purple item
    expect(COLOR_HEX.PURPLE.toLowerCase()).toBe('#c77dff');
    expect(COLORS.PURPLE).toBe(0xc77dff);

    // Card background
    expect(COLORS.SURFACE_CARD).toBe(0x16152b);
    expect(COLOR_HEX.SURFACE_CARD.toLowerCase()).toBe('#16152b');
  });

  it('supports semantic token mappings for currencies and rewards', () => {
    expect(SEMANTIC_COLORS.CURRENCY.COIN).toBe(COLORS.GOLD);
    expect(SEMANTIC_COLORS.CURRENCY.COIN_HEX).toBe(COLOR_HEX.GOLD);

    expect(SEMANTIC_COLORS.REWARD.EXP).toBe(COLORS.CYAN);
    expect(SEMANTIC_COLORS.REWARD.EXP_HEX).toBe(COLOR_HEX.CYAN);

    expect(SEMANTIC_COLORS.REWARD.MAIN_SHARD).toBe(COLORS.CORAL);
    expect(SEMANTIC_COLORS.REWARD.MAIN_SHARD_HEX).toBe(COLOR_HEX.CORAL);

    expect(SEMANTIC_COLORS.REWARD.ITEM).toBe(COLORS.PURPLE);
    expect(SEMANTIC_COLORS.REWARD.ITEM_HEX).toBe(COLOR_HEX.PURPLE);
  });

  it('correctly performs RGB extraction and RGBA string formatting', () => {
    const rgb = hexToRgb(0xffd700);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(215);
    expect(rgb.b).toBe(0);

    const rgba = toRgbaString(0xffd700, 0.85);
    expect(rgba).toBe('rgba(255, 215, 0, 0.85)');
  });

  it('safely handles edge case inputs in toColorNumber and toHexString', () => {
    expect(toColorNumber('#000000')).toBe(0);
    expect(toColorNumber('0x000000')).toBe(0);
    expect(toColorNumber('#ffffff')).toBe(0xffffff);
    expect(toColorNumber('invalid')).toBe(0);

    expect(toHexString(0)).toBe('#000000');
    expect(toHexString(0xffffff)).toBe('#ffffff');
  });
});
