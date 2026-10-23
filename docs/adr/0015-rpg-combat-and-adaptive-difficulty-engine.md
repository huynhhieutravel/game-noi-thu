# 15. RPG Combat and Adaptive Difficulty Engine

Date: 2026-10-21

## Status

Accepted

## Context

Yokai Onet features classic connect-2 pathfinding mechanics enriched with mythological companions, relics, and 16 epic bosses across a 100-level multiverse campaign. However, playtesting and QA revealed a critical pacing imbalance:
1. **Zero Defensive Threat from Bosses**: In the initial design, bosses had hit points (600–1,300 HP) and cast board obstacles (ice, stones, webs), but **never dealt direct damage to the player**. The player had only static "lives" (8–10 hearts) decremented solely upon deadlocks. High-skill players with rapid eye movement and swift touch inputs could clear the board effortlessly, bypassing boss mechanics entirely without feeling danger.
2. **Static Difficulty in Medium and Hard Regular Stages**: Standard stages scaled difficulty solely by increasing character variety (16 to 28 characters) and reducing the countdown timer (75%). Skilled players adapted instantly because tiles remained static, leaving no dynamic resistance to rapid peripheral pattern recognition.
3. **Decoupled RPG Progression**: Companion leveling (levels 1–10, tiers 1–3) and Relics (1–5 stars) provided economic and score buffs, but lacked a visceral life-or-death survival loop. Players were not incentivized to upgrade companion defense or equip protective relics to survive formidable encounters.

## Decision

We establish the **RPG Combat and Adaptive Difficulty Engine**, replacing passive board-clearing with a dynamic, bidirectional combat loop and an algorithmic multi-vector pressure system:

1. **Dual Combat Health Architecture**:
   - The player possesses a dedicated **Combat HP Bar** ($\text{Base } 1,000 \text{ HP}$) in boss encounters and high-difficulty maps.
   - Max HP scales directly with companion progression:
     $$\text{Max HP} = 1000 + (\text{Companion Level} \times 80) + (\text{Companion Tier} \times 250) + \text{Relic HP}$$
   - Lives (Hearts) are preserved as tactical revives (restoring 50% HP upon defeat).

2. **Active Boss Damage & Enrage Phase**:
   - Bosses actively execute damaging attacks on timed intervals:
     - Easy: 7.0s cooldown, 120–180 base DMG.
     - Medium: 4.5s cooldown, 200–280 base DMG.
     - Hard: 3.0s cooldown, 300–450 base DMG.
   - **Enrage / Berserk Phase**: When Boss HP falls below 35%, action cooldown drops by 50%, visual tremors activate, and attacks apply secondary board lockouts.
   - Every matched pair deals damage:
     $$\text{Match DMG} = \left(15 + \frac{\text{Companion Level} \times 5}{2}\right) \times \text{ComboMultiplier} \times \text{FeverBonus}$$

3. **Multi-Vector Pressure Engine for Non-Boss Stages (Medium & Hard)**:
   - **Shadow Veil (Dynamic Fog)**: In Hard stages, interior tiles are shrouded in mist until bordering tiles are resolved or a Combo $\ge 3$ clears the veil.
   - **Pulse Gravity Shift**: Every 10–12s on Hard, gravity vectors rotate or center-compress, preventing muscle-memory rote clearing.
   - **Panic / Mis-click Penalty**: Rapid consecutive invalid clicks or prolonged hesitation (>4s) deducts 2s from the clock or flash-freezes a random tile.

4. **Battle Consumables & Damage Mitigation**:
   - Players may equip up to 2 consumables prior to battle: *Linh Phù Hộ Thể* (Divine Ward: absorbs 1 lethal boss attack) and *Thần Dược Hồi Xuân* (Rejuvenation Elixir: restores 400 HP).
   - Defensive companions and relics provide 10%–40% passive damage reduction ($\text{DR}$).

## Consequences

### Positive
- **Genuine Challenge**: Fast players can no longer ignore boss attacks; defeating endgame bosses requires optimal match DPS, strategic companion choice, and defensive upgrades.
- **Deep Progression Value**: Upgrading companions from Tier 1 to Tier 3 and collecting relics directly impacts survivability, creating an addictive, rewarding RPG progression loop.
- **Fair & Algorithmic**: Difficulty is governed by deterministic formulas rather than random difficulty spikes.

### Negative / Trade-offs
- Requires dedicated HUD space for Player Combat HP alongside the Boss HP bar.
- Increases system state complexity in `GameScene.ts` and `BossManager.ts`.
- Requires continuous headless simulation to prevent unplayable statistical walls on casual players.
