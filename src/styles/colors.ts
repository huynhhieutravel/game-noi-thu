/**
 * Centralized Color & Theme Token System for Yokai Onet
 * Single Source of Truth for all vector graphics, cards, text colors, and semantic UI accents.
 */

// 1. Raw Core Palette (Dual-Format: Integer and CSS String)
export const PALETTE = {
  // Gold & Amber (Coin currency, victory stars, golden lacquer)
  GOLD: 0xffd700,
  GOLD_LIGHT: 0xffe066,
  GOLD_WARM: 0xffd166,
  GOLD_DARK: 0xb8860b,
  AMBER: 0xffb703,

  // Cyan & Aqua (EXP, diamonds, spirit energy, frozen state)
  CYAN: 0x00f5d4,
  CYAN_LIGHT: 0x70e000,
  CYAN_NEON: 0x00ffff,
  AQUA_BLUE: 0x4cc9f0,

  // Purples & Magentas (Relics, items, boss energy, void)
  PURPLE: 0xc77dff,
  PURPLE_LIGHT: 0xe0aaff,
  PURPLE_DEEP: 0x7b2cbf,
  INDIGO: 0x4361ee,

  // Corals, Pinks & Crimson (Shards, fire, danger, boss health)
  CORAL: 0xff758f,
  CRIMSON: 0xff3366,
  RUBY: 0xef233c,
  VERMILION: 0xff4d6d,

  // Emerald & Jade (Success, active state, health recovery)
  EMERALD: 0x06d6a0,
  JADE: 0x2ec4b6,
  MINT: 0x52b788,

  // Surface & Card Backgrounds (Japanese dark lacquer, obsidian)
  SURFACE_ROOT: 0x0d0f17,
  SURFACE_DEEP: 0x06050e,
  SURFACE_CARD: 0x16152b,
  SURFACE_ELEVATED: 0x1f1d36,
  SURFACE_MODAL: 0x131224,

  // Borders & Dividers
  BORDER_SUBTLE: 0x2a284e,
  BORDER_MEDIUM: 0x3d3a6d,
  BORDER_ACCENT: 0x5a559e,
  BORDER_GOLD: 0xd4af37,

  // Text Grayscale & Monochromes
  WHITE: 0xffffff,
  TEXT_BRIGHT: 0xf8fafc,
  TEXT_PRIMARY: 0xe2e8f0,
  TEXT_SECONDARY: 0xcbd5e1,
  TEXT_MUTED: 0x94a3b8,
  TEXT_DIM: 0x64748b,
  BLACK: 0x000000
} as const;

// 2. Integer Numbers for Phaser Graphics, Shape rendering, lineStyle, and setTint
export const COLORS = PALETTE;

// Cache map for instant string lookup
const NUMBER_TO_HEX_CACHE = new Map<number, string>();
const HEX_TO_NUMBER_CACHE = new Map<string, number>();

/**
 * Converts a 24-bit RGB number (e.g. 0xffd700) to a CSS hex string (e.g. '#ffd700').
 * Uses internal memoization for zero runtime allocation during render loops.
 */
export function toHexString(colorNumber: number): string {
  let hex = NUMBER_TO_HEX_CACHE.get(colorNumber);
  if (!hex) {
    hex = '#' + colorNumber.toString(16).padStart(6, '0');
    NUMBER_TO_HEX_CACHE.set(colorNumber, hex);
  }
  return hex;
}

/**
 * Converts a hex string (e.g. '#ffd700' or '0xffd700') to an integer number (0xffd700).
 */
export function toColorNumber(hexStr: string): number {
  let num = HEX_TO_NUMBER_CACHE.get(hexStr);
  if (num === undefined) {
    const cleanStr = hexStr.replace(/^#|^0x/i, '');
    num = parseInt(cleanStr, 16);
    if (isNaN(num)) num = 0;
    HEX_TO_NUMBER_CACHE.set(hexStr, num);
  }
  return num;
}

// 3. String Hex Map for Phaser Text, CSS Styles, and DOM Overlays
export const COLOR_HEX: Record<keyof typeof PALETTE, string> = Object.keys(PALETTE).reduce(
  (acc, key) => {
    const k = key as keyof typeof PALETTE;
    acc[k] = toHexString(PALETTE[k]);
    return acc;
  },
  {} as Record<keyof typeof PALETTE, string>
);

// 4. High-Level Semantic Tokens (Domain Concepts)
export const SEMANTIC_COLORS = {
  // Currencies
  CURRENCY: {
    COIN: COLORS.GOLD,
    COIN_HEX: COLOR_HEX.GOLD,
    DIAMOND: COLORS.CYAN,
    DIAMOND_HEX: COLOR_HEX.CYAN,
    STAR: COLORS.AMBER,
    STAR_HEX: COLOR_HEX.AMBER
  },

  // Reward Matrix (Exp, Coins, Shards, Items)
  REWARD: {
    EXP: COLORS.CYAN,
    EXP_HEX: COLOR_HEX.CYAN,
    COIN: COLORS.GOLD_WARM,
    COIN_HEX: COLOR_HEX.GOLD_WARM,
    MAIN_SHARD: COLORS.CORAL,
    MAIN_SHARD_HEX: COLOR_HEX.CORAL,
    SUB_SHARD: COLORS.TEXT_MUTED,
    SUB_SHARD_HEX: COLOR_HEX.TEXT_MUTED,
    ITEM: COLORS.PURPLE,
    ITEM_HEX: COLOR_HEX.PURPLE
  },

  // Interactive Surface Tokens
  SURFACE: {
    BACKGROUND: COLORS.SURFACE_ROOT,
    BACKGROUND_HEX: COLOR_HEX.SURFACE_ROOT,
    MODAL_BACKDROP: COLORS.SURFACE_DEEP,
    MODAL_SHELL: COLORS.SURFACE_MODAL,
    CARD_DEFAULT: COLORS.SURFACE_CARD,
    CARD_HOVER: COLORS.SURFACE_ELEVATED,
    BORDER_DEFAULT: COLORS.BORDER_SUBTLE,
    BORDER_FOCUSED: COLORS.BORDER_ACCENT,
    BORDER_GOLD: COLORS.BORDER_GOLD
  },

  // Status & Feedback Tokens
  STATUS: {
    SUCCESS: COLORS.EMERALD,
    SUCCESS_HEX: COLOR_HEX.EMERALD,
    DANGER: COLORS.CRIMSON,
    DANGER_HEX: COLOR_HEX.CRIMSON,
    WARNING: COLORS.AMBER,
    WARNING_HEX: COLOR_HEX.AMBER,
    INFO: COLORS.AQUA_BLUE,
    INFO_HEX: COLOR_HEX.AQUA_BLUE,
    LOCKED: COLORS.TEXT_DIM,
    LOCKED_HEX: COLOR_HEX.TEXT_DIM
  },

  // Text Hierarchy Colors
  TEXT: {
    BRIGHT: COLOR_HEX.TEXT_BRIGHT,
    PRIMARY: COLOR_HEX.TEXT_PRIMARY,
    SECONDARY: COLOR_HEX.TEXT_SECONDARY,
    MUTED: COLOR_HEX.TEXT_MUTED,
    DIM: COLOR_HEX.TEXT_DIM,
    GOLD: COLOR_HEX.GOLD,
    CYAN: COLOR_HEX.CYAN,
    CORAL: COLOR_HEX.CORAL
  }
} as const;

/**
 * Splits a 24-bit integer color into {r, g, b} components [0-255].
 */
export function hexToRgb(color: number): { r: number; g: number; b: number } {
  return {
    r: (color >> 16) & 0xff,
    g: (color >> 8) & 0xff,
    b: color & 0xff
  };
}

/**
 * Returns a CSS rgba string from an integer color and an alpha value [0, 1].
 */
export function toRgbaString(color: number, alpha: number): string {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Standardized Relic Tier Visual Presentation (ADR 0013)
 * Canonical Japanese-fantasy tier hierarchy: Hạ Phẩm, Trung Phẩm, Thượng Phẩm
 */
export const RELIC_TIER_STYLES = {
  common: {
    label: '✦ Hạ Phẩm',
    tierName: 'Hạ Phẩm',
    colorHex: '#00f5d4',
    border: 0x00f5d4,
    bg: 0x0c252a
  },
  rare: {
    label: '✦ Trung Phẩm',
    tierName: 'Trung Phẩm',
    colorHex: '#c084fc',
    border: 0xa855f7,
    bg: 0x2e104f
  },
  epic: {
    label: '✦ Thượng Phẩm',
    tierName: 'Thượng Phẩm',
    colorHex: '#ffd700',
    border: 0xffd700,
    bg: 0x452303
  }
} as const;

export function getRelicTierStyle(tier?: string) {
  if (tier === 'epic') return RELIC_TIER_STYLES.epic;
  if (tier === 'rare') return RELIC_TIER_STYLES.rare;
  return RELIC_TIER_STYLES.common;
}
