# Companion Roster, Progression Pacing, and Qualitative Skill Architecture

## Context
Yokai Onet has 3 initial companions (Inari Kitsune, Ryujin Dragon, Hi-no-tori Phoenix). As the game scales to 10 companions with diverse campaign, boss, and survival modes, raw numerical buffs (such as clearing large percentages of the board or adding excessive time freezes) severely undermine puzzle integrity and violate the core **Tile Parity** and **Arcade Fair-Play** invariants. The player requires a balanced, tactical roster of 10 distinct mythical beasts with controlled 1-5 level progression via shard collection, where progression deepens tactical options rather than automating puzzle clears.

## Decision
1. **Tile Parity & Conservative Scaling**: Active skills that remove tiles must strictly clear matching pairs (1 pair at Lv.1-2, 2 pairs maximum at Lv.3-5). No odd-tile removals or percentage-based board wipes.
2. **5-Level Progression via Companion Shards**:
   - Level 1 (Base): Initial unlock via Coins or Chapter milestones.
   - Level 2 (+10% subtle tuning): 10 Shards + 200 Coins.
   - Level 3 (Tier 2 Awakening): 25 Shards + 500 Coins (unlocks visual aura & secondary tactical effect).
   - Level 4 (+10% subtle tuning): 50 Shards + 1,000 Coins.
   - Level 5 (Tier 3 Mythic Awakening): 100 Shards + 2,000 Coins (zenith of mastery, specialized mastery trait).
3. **10 Mythical Archetypes & Balanced Skill Profiles**:
   - **Inari Kitsune (狐 - Spirit/Tâm Linh)**:
     - Skill: Solves 1 trapped pair (Lv.1-4) -> 2 pairs (Lv.5).
     - Passive: Extends combo streak window by +1.2s to +2.0s.
   - **Ryujin Dragon (龍神 - Water/Thủy)**:
     - Skill: Freezes countdown and blizzard drop for 3.0s (Lv.1) to 5.0s (Lv.5).
     - Passive: Matches along outer Padding Margin grant +10% to +18% bonus coins.
   - **Hi-no-tori (火の鳥 - Fire/Hỏa)**:
     - Skill: Clears 1 obstacle / 150 Boss damage (Lv.1) -> 3 obstacles / 380 Boss damage (Lv.5).
     - Passive: On Deadlock, preserves 100% combo streak and restores +5s time (once per stage).
   - **Byakko (白虎 - Wind & Metal/Phong Lôi)**:
     - Skill: Clears 1 straight-line pair (0 bends); Lv.5 locks gravity for 6-8s while boosting resolve animation speed by 20-25%.
     - Passive: Fast-pace combo acceleration with +10% to +20% speedrun score bonus.
   - **Genbu (玄武 - Earth/Thổ)**:
     - Skill: Crushes 1-2 Stone/Lock obstacles and creates a Stone Shield absorbing 1 wrong move.
     - Passive: Grants +1 Extra Life buffer when timer expires before fail.
   - **Kirin (麒麟 - Wood & Nature/Mộc)**:
     - Skill: Purifies Boss curses/vines and restores +3s to +5s.
     - Passive: Every 6 matched pairs passively restores +1s (max 8s/stage).
   - **Raiju (雷獣 - Lightning/Lôi)**:
     - Skill: Torii Portal lightning relay; connects 1 farthest pair on the board; Lv.5 grants x2 score for next 2 moves.
     - Passive: Matching pairs through Torii Portals awards +25% extra Spirit Gauge.
   - **Yatagarasu (八咫烏 - Sun & Radiance/Nhật Quang)**:
     - Skill: Clears fog/darkness for 6-10s; Lv.5 reveals ancient Relic Shards and highlights the optimal legal pair.
     - Passive: Periodic subtle guidance gleam every 10s -> 7s if the player is searching.
   - **Nekomata (猫又 - Shadow & Illusion/Ảo Thuật)**:
     - Skill: Teleports a trapped inner tile to the outer perimeter to unlock an immediate move; Lv.5 steals back +4s.
     - Passive: Clutch victory with under 15s remaining multiplies earned Shards and Coins by x1.5 to x2.0.
   - **Yamata no Orochi (八岐大蛇 - Apex Mythic/Bát Kỳ Đại Xà)**:
     - Requires +25% higher Spirit Gauge to activate.
     - Skill (Lv.5): Inflicts +30% damage to Boss, crushes 1 obstacle, and solves 1 pair.
     - Passive: Suppresses Boss disruption frequency by 15% to 25%.
4. **Rule-Bending Passives**: Innate passives provide situational tactical relief without trivializing pathfinding.

## Consequences
- Guaranteed preservation of puzzle problem-solving challenge across all 100 campaign levels.
- Deep, rewarding long-term collection loop (earning Shards from 3-star clears, Boss fights, and Shrine events).
- Zero power creep: each companion occupies a distinct tactical niche with closely tuned ratings (7.5 to 8.5/10).
