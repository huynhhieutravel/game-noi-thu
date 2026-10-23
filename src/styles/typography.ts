import type Phaser from 'phaser';

/**
 * Standardized Typography & Currency Formatting System for Yokai Onet
 * Single Source of Truth for all fonts, text hierarchy tokens, and factory functions.
 */

export const FONTS = {
  DISPLAY: '"Plus Jakarta Sans", Philosopher, Cinzel, -apple-system, sans-serif',
  UI: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  MONO: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
} as const;

// Backward-compatible aliases
export const FONT_DISPLAY = FONTS.DISPLAY;
export const FONT_UI = FONTS.UI;

export const FONT_WEIGHT = {
  REGULAR: '400',
  MEDIUM: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
  BLACK: '900'
} as const;

export type TypographyVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'badge'
  | 'caption';

export interface TypographyTokenConfig {
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  color: string;
  lineSpacing?: number;
  letterSpacing?: number;
}

export const TYPOGRAPHY_TOKENS: Record<TypographyVariant, TypographyTokenConfig> = {
  display: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '32px',
    fontStyle: '900',
    color: '#ffffff',
    lineSpacing: 0,
    letterSpacing: 0.5
  },
  heading: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '22px',
    fontStyle: '900',
    color: '#ffd700',
    lineSpacing: 1
  },
  title: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '17px',
    fontStyle: '900',
    color: '#ffffff',
    lineSpacing: 1
  },
  subtitle: {
    fontFamily: FONTS.UI,
    fontSize: '13.5px',
    fontStyle: '800',
    color: '#f8fafc',
    lineSpacing: 2
  },
  body: {
    fontFamily: FONTS.UI,
    fontSize: '12px',
    fontStyle: '600',
    color: '#cbd5e1',
    lineSpacing: 2
  },
  badge: {
    fontFamily: FONTS.UI,
    fontSize: '11px',
    fontStyle: '900',
    color: '#ffffff',
    lineSpacing: 0
  },
  caption: {
    fontFamily: FONTS.UI,
    fontSize: '9.5px',
    fontStyle: '800',
    color: '#94a3b8',
    lineSpacing: 0
  }
};

/**
 * Typography helper class providing style generators and text creation factory methods.
 */
export class Typography {
  /**
   * Generates a complete Phaser TextStyle object from a variant with optional overrides.
   */
  public static style(
    variant: TypographyVariant = 'body',
    overrides?: Phaser.Types.GameObjects.Text.TextStyle
  ): Phaser.Types.GameObjects.Text.TextStyle {
    const token = TYPOGRAPHY_TOKENS[variant] || TYPOGRAPHY_TOKENS.body;
    return Object.assign({}, token, overrides);
  }

  /**
   * Factory function to create a Phaser Text GameObject using a Typography variant.
   */
  public static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    variant: TypographyVariant = 'body',
    overrides?: Phaser.Types.GameObjects.Text.TextStyle
  ): Phaser.GameObjects.Text {
    const finalStyle = Typography.style(variant, overrides);
    return scene.add.text(x, y, text, finalStyle);
  }

  /**
   * Alias for create()
   */
  public static createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    variant: TypographyVariant = 'body',
    overrides?: Phaser.Types.GameObjects.Text.TextStyle
  ): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, variant, overrides);
  }

  // Convenience shorthand methods
  public static display(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'display', overrides);
  }

  public static heading(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'heading', overrides);
  }

  public static title(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'title', overrides);
  }

  public static subtitle(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'subtitle', overrides);
  }

  public static body(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'body', overrides);
  }

  public static badge(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'badge', overrides);
  }

  public static caption(scene: Phaser.Scene, x: number, y: number, text: string | string[], overrides?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
    return Typography.create(scene, x, y, text, 'caption', overrides);
  }
}

/**
 * Phaser GameObjectFactory Type Augmentation
 */
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      uiText(
        x: number,
        y: number,
        text: string | string[],
        variant?: TypographyVariant,
        overrides?: Phaser.Types.GameObjects.Text.TextStyle
      ): Phaser.GameObjects.Text;
      displayText(
        x: number,
        y: number,
        text: string | string[],
        variant?: TypographyVariant,
        overrides?: Phaser.Types.GameObjects.Text.TextStyle
      ): Phaser.GameObjects.Text;
    }
  }
}

export function registerTypographyExtensions(phaserLib?: any): void {
  const p = phaserLib || (typeof window !== 'undefined' ? (window as any).Phaser : undefined);
  if (!p || !p.GameObjects?.GameObjectFactory?.prototype) return;

  const proto = p.GameObjects.GameObjectFactory.prototype;
  if (!proto.uiText) {
    proto.uiText = function (
      this: any,
      x: number,
      y: number,
      text: string | string[],
      variant: TypographyVariant = 'body',
      overrides?: any
    ) {
      const finalStyle = Typography.style(variant, overrides);
      return this.text(x, y, text, finalStyle);
    };
  }

  if (!proto.displayText) {
    proto.displayText = function (
      this: any,
      x: number,
      y: number,
      text: string | string[],
      variant: TypographyVariant = 'heading',
      overrides?: any
    ) {
      const finalStyle = Typography.style(variant, Object.assign({ fontFamily: FONTS.DISPLAY }, overrides));
      return this.text(x, y, text, finalStyle);
    };
  }
}

// Safely attempt registration if in browser environment
registerTypographyExtensions();

/**
 * Formats any number or currency with standard Vietnamese/European dot '.' thousands separators
 * e.g. 10050 -> "10.050", 1000000 -> "1.000.000", 5000 -> "5.000"
 */
export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '0';
  const sign = num < 0 ? '-' : '';
  const intPart = Math.floor(Math.abs(num)).toString();
  return sign + intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
