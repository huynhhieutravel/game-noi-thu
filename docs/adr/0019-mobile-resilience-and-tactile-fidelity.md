# 19. Mobile Resilience and Tactile Fidelity Architecture

Date: 2026-10-23

## Status

Accepted

## Context

Following extensive QA on gameplay logic, progression economy, and battle mechanics, production hardening for iOS App Store release (running via Capacitor WKWebView on iOS devices) revealed four operational mobile edge cases:

1. **Unshielded App Backgrounding**: Incoming phone calls, notifications, or app-switching during active puzzle or boss battles didn't engage a visual pause overlay. Upon returning, players were greeted with sudden timer jumps or instant Boss enrage attacks without time to regain physical control.
2. **WKWebView AudioContext Interruption**: On iOS, external audio session interruptions (AirPods connect/disconnect, Siri, or incoming calls) transition `AudioContext.state` to `'interrupted'`. Apple's WebKit security policy rejects programmatic `.resume()` unless directly accompanied by a physical user gesture. Without explicit gesture re-arming, sound stayed permanently muted until full app kill/restart.
3. **Tactile Disconnection in Companion 3D Modal**: While gameplay tiles and combo streaks enjoyed full Taptic Engine haptic response, the newly introduced high-fidelity 3D Companion Modal lacked tactile haptic feedback on summons, evolutions, level-ups, and carousel navigation.
4. **iOS WKWebView Storage Eviction Vulnerability**: Under low-storage conditions or major iOS OS updates, WebKit can purge volatile storage partitions, endangering players' 100-level progression and companion rosters when relying solely on an unverified single-key `localStorage`.

## Decisions

### 1. Auto-Pause Interruption Shield with 3-2-1 Breather
- In `GameScene.ts`, whenever `document.hidden` or `visibilitychange` triggers during active gameplay (and the stage is neither victory nor game over):
  - Automatically freeze gameplay logic (`this.isPaused = true`).
  - Render an unobtrusive, modal pause barrier: *"⏸️ TRÒ CHƠI TẠM DỪNG"* with a `[TIẾP TỤC]` button.
  - Upon tapping `[TIẾP TỤC]`, trigger a 3-2-1 animated countdown breather before unfreezing countdown timers and boss AI, granting the player time to reposition their fingers.

### 2. Gesture Re-armed WebAudio Protocol
- In `AudioSystem.ts`, listen for audio context state changes. If `ctx.state === 'interrupted'` or `ctx.state === 'suspended'`:
  - Automatically arm a transient, passive one-shot touch listener (`pointerdown` and `touchstart`) on the window.
  - On the very next tap, execute `ctx.resume()` within the trusted user-gesture callstack, restoring BGM and SFX without requiring an application restart.

### 3. Companion Tactile Resonance
- In `CompanionModal3D.ts`, integrate `HapticSystem`:
  - **Success Haptic** (`NotificationType.Success`): Dispatched on successful Companion Summoning and Tier Evolution.
  - **Medium Impact** (`ImpactStyle.Medium`): Dispatched on Level-Up button press.
  - **Light Impact** (`ImpactStyle.Light`): Dispatched on Carousel thumbnail selection/navigation.
  - **Warning Haptic** (`NotificationType.Warning`): Dispatched when tapping locked buttons or insufficient shard notices.

### 4. Dual-Layer Eviction Shield & Checksummed Backup
- In `SaveSystem.ts`, alongside `yokai_save_data`, persist an isolated, verified backup payload: `yokai_save_backup` containing a CRC/length checksum and timestamp.
- On `load()`, if `yokai_save_data` is missing, unparseable, or truncated while `yokai_save_backup` is intact:
  - Automatically restore the save state from the backup payload and re-serialize.
  - Log an auto-recovery event to telemetry and notify the player seamlessly.

## Consequences

- **Zero Accidental Defeats**: Players can take calls or switch apps mid-battle without timer penalties or surprise boss strikes.
- **Unbroken Audio Fidelity**: Zero permanent sound dropouts across Bluetooth disconnects, AirPods switching, and phone calls.
- **Console-Grade Touch Feel**: Companion interactions deliver crisp physical tactile response on iPhone Taptic Engine.
- **Absolute Data Permanence**: Progression across all 100 levels, mythic relics, and companions is completely insulated against iOS storage purges.
