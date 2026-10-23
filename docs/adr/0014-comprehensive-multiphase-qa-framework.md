# ADR 0014: Comprehensive Multi-Phase QA Framework & Defect Trapping

## Status
Accepted

## Context
During active development and cross-scene transitions (MainMenuScene ⇄ GameScene ⇄ CollectionScene), intermittent latent defects (such as WebGL texture destruction causing WebContent reload, pointer event race conditions during modal dismissals, and stale active session restore loops) degraded gameplay stability on mobile devices (iOS WKWebView / Capacitor). A piecemeal QA approach was insufficient to guarantee zero regressions across 100 campaign levels, 16 world bosses, dynamic gravity rules, and complex dual-currency progression systems.

## Decision
We establish a standardized **5-Phase Comprehensive QA Framework** backed by a **3-Tier Automated Defect Trapping Harness** with strict non-negotiable acceptance phase gates.

### 1. 5-Phase QA Architecture
1. **Phase 1: Assets & VRAM Memory Lifecycle**:
   - Zero dynamic removal of character textures during gameplay (`char_*` textures retained in GPU memory).
   - Strict resolution, aspect ratio, and Retina 2x DPR validation for all 108 characters, 16 bosses, 30 relics, and 100 stage backgrounds.
2. **Phase 2: Scene Navigation State Machine & Lifecycle Recovery**:
   - Asynchronous safe teardown of UI modals (16ms post-input dispatch).
   - Clean segregation of fresh game starts vs. active session resumption (`save.clearActiveSession()`).
   - Exception boundary isolation (`try...catch` guards) in scene lifecycle methods (`create`, `shutdown`).
3. **Phase 3: Core Board Engine, Solvability & Gravity Invariants**:
   - Mathematical guarantee of even tile parity across all 100 levels × 3 difficulties (300 configurations).
   - 0-deadlock assurance: PathFinder 0/1/2 turn pathing and automatic reshuffle failsafes without infinite loop traps.
   - Comprehensive obstacle behavior verification (Ice, Stone, Web, Barricade, Thorns, Torii Portal).
4. **Phase 4: Game Modes & Progression Economy**:
   - Verification of Campaign, 16 Boss Arena battles, Survival Blizzard rising wave, and Zen Endless mode.
   - Star Quest mapping parity (earned stars exactly equal completed objectives).
   - Dual-currency and relic drop rate economy auditing.
5. **Phase 5: Platform & Mobile Hardware Edge Cases (iOS WKWebView)**:
   - Touch hitbox fidelity and 0px seam overlap.
   - Safe Area / notch / Dynamic Island layout compliance.
   - Audio resumption on app unpause and background tab-switching.
   - WebProcess Jetsam memory limits (<45MB VRAM ceiling).

### 2. 3-Tier Testing Harness
- **Tier 1 (Headless Node / Vitest)**: Fast algorithmic solvers, parity checks, and progression audits.
- **Tier 2 (Live Browser WebGL Automation via DevTools MCP)**: Real-time Chaos Monkey input flooding, rapid modal switching, and live WebGL error interception.
- **Tier 3 (On-Device Telemetry & Failsafes)**: Native iOS verification on physical devices via Xcode and devicectl.

### 3. Acceptance Gates
- **0 Console Errors / Warnings** during extended 15-minute live sessions.
- **100% Solvability** across all campaign levels.
- **VRAM Ceiling <45MB** without progressive memory leaks.
- **0 Dropped Inputs / Stuck Lock States** (maximum 750ms watchdog auto-release).
