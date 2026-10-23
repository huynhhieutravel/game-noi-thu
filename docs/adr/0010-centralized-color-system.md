# 0010. Centralized Color & Theme Token System

Date: 2026-10-20
Status: Accepted

## Context

Prior to this decision, colors throughout the codebase were defined as raw, inline magic values (`0x00f5d4`, `#ffd700`, `#ff758f`, `0x16152b`, `#1a1638`, `0x000000`, etc.) scattered across over 400 call sites in 15+ scene, modal, and system files.

This caused three major issues:
1. **Visual Inconsistency**: Slightly different shades of gold (`#ffd700`, `#ffd166`, `#ffbe0b`), cyan (`#00f5d4`, `#4cc9f0`, `#00ffcc`), and card dark backgrounds were introduced ad-hoc, diluting the Japanese cyberpunk/mythological aesthetic.
2. **Type Friction**: Phaser requires integer color hexes (`0xffd700`) for canvas vector drawings (`graphics.fillStyle()`, `lineStyle()`, `setTint()`), but requires CSS string hexes (`'#ffd700'`) for `Text` game objects and DOM overlays. Developers continually wrote manual string replacements or `parseInt` casts.
3. **Inability to Theme Globally**: Theming or adjusting contrast across the application required manual edits across dozens of files, introducing high regression risk.

## Decision

We establish a single source of truth for all game colors in `src/styles/colors.ts` with a **Dual-Format Token Architecture**:

1. **`COLORS`**: Integer hex numbers (`0xRRGGBB`) designed for Phaser Graphics, Shapes, Particles, and Tints.
2. **`COLOR_HEX`**: String hexes (`#RRGGBB`) designed for Phaser Text GameObjects, Typography tokens, and CSS.
3. **Semantic Tokens**: Abstracting domain-specific intentions:
   - `CURRENCY`: `GOLD` (`#ffd700`), `DIAMOND` (`#00f5d4`), `STAR` (`#ffb703`)
   - `REWARD`: `EXP` (`#00f5d4`), `SHARD` (`#ff758f`), `ITEM` (`#c77dff`), `COIN` (`#ffd166`)
   - `SURFACE`: `CARD_BG` (`0x16152b`), `CARD_BORDER` (`0x2a284e`), `MODAL_BACKDROP` (`0x06050e`), `VIGNETTE` (`0x06050e`)
   - `STATE`: `SUCCESS` (`0x00f5d4`), `DANGER` (`0xff3366`), `WARNING` (`0xffb703`), `INFO` (`0x4cc9f0`), `LOCKED` (`0x475569`)
4. **Pure Utility Converters**: Zero-allocation helpers `toHexString(number)` and `toColorNumber(string)` with memoization.

## Consequences

- All colors across scenes and modals can be updated globally from one file.
- Type errors and runtime parsing between number and string color formats are eliminated.
- Unit tests can verify contrast and color token integrity automatically.
