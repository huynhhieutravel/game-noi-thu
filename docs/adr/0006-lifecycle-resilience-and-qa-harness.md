# 0006. Subsystem Lifecycle Resilience, Exception Boundaries, and Chaos QA Testing Harness

## Context
During extended gameplay sessions and rapid player interactions, web and mobile puzzle games running on Phaser 3 face two architectural failure modes:
1. **Uncaught Update Loop Termination (Tử Huyệt Game Loop)**: In Phaser 3, any unhandled exception thrown within `Scene.update()` immediately terminates the active scene runner. The engine ceases calling subsequent frames, leaving the canvas frozen at 0 FPS while audio continues playing in the background.
2. **Asynchronous Tween Race Conditions (Xung Đột Vòng Đời Tween)**: UI tweens and delayed tasks frequently define `onComplete` callbacks that reference instance fields (e.g. `this.nightParadeTimerPill.destroy()`). If an event triggers a new state or tears down elements before the tween finishes, the callback executes against either destroyed objects or freshly re-created instances. In Phaser Text objects, calling methods on destroyed internal canvas contexts causes a fatal `Cannot read properties of null (reading 'drawImage')` TypeError.
3. **Input Lock Deadlock (Treo Khóa Thao Tác)**: In matching logic, `BoardManager` uses `isProcessingMatch = true` to prevent double-clicks during path drawing and tile destruction animations. If any unexpected error or unhandled edge case occurs during collateral damage calculation, shapeshifter morphing, or status auditing, `isProcessingMatch` remains stuck at `true`, rendering all subsequent taps inert ("đứng hình, bấm không được nữa").

To deliver high-resilience arcade quality, the game engine must implement strict compartmentalization, automatic input recovery, and continuous chaos testing.

## Decision
We introduce four defensive architectural standards across the codebase:

### 1. Modular Subsystem Exception Boundary (`safeSubsystemRun`)
Inside `GameScene.update(time, delta)`, all cyclic update routines are isolated into dedicated, named subsystems:
- `Timer & Game Mode Subsystem` (Blizzard surge, Zen mode, Ryujin Time Freeze, Stopwatch, Standard countdown)
- `Companion Passives & Buffs Subsystem` (Byakko gravity lock, Orochi boss suppression, Yatagarasu guidance)
- `Lucky Pots Subsystem` (Pot countdown ticks)
- `Combo System Subsystem` (Combo decay and fever duration)
- `Night Parade Subsystem` (Bách Quỷ Dạ Hành timers and laser piercing)
- `Boss Manager Subsystem` (Boss AI phase decisions and attack telegraphs)

Each subsystem executes inside `safeSubsystemRun(name, action)`. An unhandled runtime error within one subsystem is logged with descriptive diagnostic telemetry without interrupting the frame rate, the other subsystems, or the master game loop.

### 2. Safe Async Tween Lifecycle Pattern (`safeTween`)
All asynchronous tweens that mutate or destroy UI entities are created via `GameScene.safeTween()`:
- `onComplete` callbacks are wrapped in error guards that check object vitality (`active` and `scene`).
- UI references undergoing fade-outs or exits are captured into local scoped variables and immediately detached from scene instance properties before launching the fade tween (`const toFade = this.property; this.property = null;`). This prevents concurrent routines in `update()` from ever operating on dying game objects.

### 3. Failsafe Input Boundary & Watchdog Recovery
In `BoardManager`:
- `handleTileClick(r, c)` is enclosed in a try-catch error boundary. If an unhandled exception occurs at any point during pathfinding, modifier feedback, or state transition, the method immediately resets `isProcessingMatch = false`, clears `selectedTile = null`, and dismisses hint overlays.
- `checkBoardStatus()` enforces `this.setProcessingMatch(false)` in its `finally` block, ensuring that match processing locks are unconditionally released after every parity audit or status resolution.
- The 750ms timeout watchdog in `setProcessingMatch(true)` serves as an automated fallback if any delayed tween fails to invoke its final callback.

### 4. Two-Tier Chaos Monkey Test Suite
To prevent regressions and stress-test the entire engine under extreme, erratic conditions, a dedicated testing harness is established:
- **Headless Unit Suite (`tests/ChaosMonkeyRunner.test.ts`)**: Simulates 1,000+ rapid chaotic actions per run across dense modifier grids, out-of-bounds coordinates, rapid shuffles, and invalid clicks, asserting 100% parity preservation and zero uncaught exceptions.
- **Live Browser Runtime Runner (`window.runChaosStressTest`)**: Exposes an automated stress test on the browser window. DevTools or automated scripts can invoke `window.runChaosStressTest({ movesCount: 80, delayMs: 25 })` on the live WebGL/Canvas viewport, confirming that the game handles 80+ hyper-rapid clicks and booster activations with 0 console errors and unbroken 60 FPS rendering.

## Consequences
- Eliminates total game freezes caused by unhandled frame errors or UI transition race conditions.
- Guarantees that player input will never be permanently locked out even in anomalous network, hardware, or lifecycle events.
- Establishes a permanent, push-button QA validation harness accessible both in Vitest CLI and in Chrome DevTools.
