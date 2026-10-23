# ADR 0018: Surplus Shard Economy, Panic Penalty Threshold, and Combat Fair-Play

## Status
Accepted (2026-10-23)

## Context
Following comprehensive UI/UX QA audits and domain stress-testing (/grill-with-docs), four gameplay and progression edge cases were identified:
1. **Surplus Companion Shards at Max Tier:** When players reach Level 5 (Thần Linh Thức Tỉnh) on any of the 10 Mythical Companions, clearing subsequent campaign or boss stages could still drop shards for that companion. The prior flat conversion of 20 Coins per surplus shard felt disproportionately unrewarding given the 3%–8% drop rates.
2. **Panic Click Sensitivity on Touchscreens:** On Hard difficulty, consecutive mis-clicks within 300ms triggered an immediate -2 second penalty. On smaller mobile touchscreens, accidental fast double-taps or two-finger brushes triggered false-positive panic penalties.
3. **Player Combat Vitality Recovery Scope:** Clarification was required on whether Player Combat HP carries over between levels (Roguelite attrition) or resets to 100% per stage (Arcade Fair-Play).
4. **Relic Rage Stage Independence:** Clarification was required on whether Relic Rage meters carry over into retries or reset to 0% to prevent pre-grinding exploit loops.

## Decisions

### 1. Universal Spirit Shard (Linh Thạch Vạn Năng) Conversion
- Established a 3:1 conversion ratio: 3 surplus shards of any maxed (Lv.5) companion automatically convert into 1 Universal Spirit Shard (`universalShards`).
- Universal Spirit Shards can be spent interchangeably in `CompanionModal3D` to substitute missing companion shards for any unmaxed companion (1 Universal Shard = 1 Companion Shard).
- Stored persistently in `SaveSystem` under `saveData.universalShards`.

### 2. Triple-Tap Threshold for Hard Mode Panic Penalty
- Elevated the panic filter threshold from 2 fast mis-clicks to **3 consecutive rapid mis-clicks** with a relaxed threshold of `< 350ms`.
- Single fast double-taps or accidental brush touches are safely ignored.
- Only deliberate, repeated spam clicking (3+ mis-clicks) incurs the -2s timer deduction and visual warning.

### 3. Arcade Vitality Full-Restore Convention
- Maintained the full 100% combat vitality reset at the start of each Campaign level (`playerCombatHp = playerCombatMaxHp`).
- Health attrition and persistent damage are restricted exclusively to Boss Rush and Blizzard Survival Mode.

### 4. Independent Stage Parity on Retry
- Upon level restart, defeat retry, or replay, both Relic Rage (`relicEnergy`) and Companion Energy reset to 0%.
- Guarantees each puzzle level remains an authentic, self-contained solvability test.

## Consequences & Verification
- **Economy Balance:** Players with maxed companions gain meaningful progression currency without devaluing loot excitement.
- **Mobile Usability:** Erroneous panic penalties eliminated on touchscreens.
- **Verification:** Unit tests added in `tests/CombatEngine.test.ts` and `tests/UILayoutAndDataAuditor.test.ts`.
