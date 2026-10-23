# ADR 0017: Mobile Production Hardening, Session Fidelity, and Auto-Healing

## Status
Accepted (2026-10-22)

## Context
During stress-testing and QA grilling for iOS / mobile readiness, four key operational vulnerabilities were identified in the production runtime:
1. **Mid-Game Interruption & Session State Discrepancy:** When an incoming call, push notification, or OS app-switch occurred, `ActiveGameSession` stored board tiles, score, and lives, but dropped `bossHp`, `playerCombatHp`, and `survivalWave`. Resuming a boss fight reset boss HP to 100%, and resuming Blizzard Survival reset the wave counter to 1.
2. **Corrupted / Truncated Save Catastrophe:** If the device experienced sudden power loss or process kill during a `localStorage.setItem` write, `JSON.parse` would throw a SyntaxError. The prior fallback reset the save completely to `DEFAULT_SAVE`, causing irreversible progress loss (loss of coins, stars, highestLevel, unlocked companions).
3. **Phaser 3 Scene Lifecycle & Event Listener Leakage:** When transitioning between gameplay, victory, and main menu, event listeners (`visibilitychange`, `pagehide`), timers, particle emitters, and BossManager instances were not guaranteed to be cleaned up idempotently on both `shutdown` and `destroy` events.
4. **Display Cutouts, Dynamic Island, and Home Indicator Occlusion:** On modern mobile screens (e.g., iPhone 15/16 Pro Max with 19.5:9 display ratio), tactical interactive elements located near screen edges risked interference from gesture areas (iOS Home bar) or island/notch cutouts.

## Decisions

### 1. High-Fidelity Active Session Serialization
- Extended `ActiveGameSession` and `GameScene.persistActiveSession()` to include:
  - `bossHp`: Current boss HP via `bossManager.getHp()`
  - `playerCombatHp`: Player's remaining combat health
  - `survivalWave`: Current wave counter in Blizzard Survival mode
- When `GameScene.init()` detects `resumeSession: true`:
  - `survivalWave` is preserved.
  - `pendingBossHp` and `pendingPlayerCombatHp` are passed to `BossManager.setHp()` and the visual combat bars during initialization.
  - Relic shards on the board are detected and synced to prevent duplicate spawn exploits.

### 2. Resilient Auto-Healing for Save Data
- Introduced `SaveSystem.tryRepairTruncatedJson(raw: string)` with a dual-stage recovery pipeline:
  1. **Structural Heuristic Closure:** Trims trailing unclosed delimiters and appends matching brackets/braces (`]`, `}`).
  2. **Regex Field Salvage:** If structural parsing fails, uses resilient regular expressions to extract `coins`, `diamonds`, `stars`, `highestLevel`, `selectedTheme`, `unlockedCompanions`, `levelStars`, and `boosters`.
- In `SaveSystem.load()`, when a corrupt JSON is repaired, the healed valid JSON is immediately written back to `localStorage` to stabilize the storage.
- In `SaveSystem.sanitize()`, all numerical values are validated using `Number.isFinite()` and checked against safe non-negative minimums, preventing `NaN` contamination.

### 3. Idempotent Scene Resource Teardown
- Consolidated all scene teardown logic into `cleanupSceneResources()`:
  - Removes `document` and `window` event listeners (`visibilitychange`, `pagehide`).
  - Calls `tweens.killAll()` and `time.removeAllEvents()`.
  - Destroys active particle emitters, tweens, and `BoardManager`.
  - Explicitly invokes `BossManager.destroy()`.
- Bound `cleanupSceneResources()` to both `this.events.once('shutdown')` and `this.events.once('destroy')`.

### 4. Safe Area Cushioning and Layout Insets
- Defined `SAFE_AREA_INSETS` (`TOP: 14`, `BOTTOM: 20`, `LEFT: 44`, `RIGHT: 44`) and `isWithinSafeAreaY()` helper in `src/constants.ts`.
- In `Board.ts`, increased `bottomReserved` to 82px, ensuring tiles never extend below 598px.
- In `GameScene.ts`, adjusted the tactical booster tray anchor to `height - 48px`, guaranteeing a 20px clearance above the bottom bezel (Home Indicator zone) and a clean air gap below the board.

## Consequences & Verification
- **Test Coverage:** Automated via `tests/MobileProductionHardening.test.ts` (11 tests), verifying session persistence, auto-healing of broken JSON, multi-match endurance across 50 simulated cycles, and safe area geometry.
- **Progress Protection:** Zero risk of total save loss on abrupt app exit.
- **Device Readiness:** All UI layers respect device safe boundaries. (Device installation remains on standby until user explicit confirmation).
