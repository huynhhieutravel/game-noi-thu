# 20. Daily Shrine Omikuji, Juicy Match Dynamics, and Mythic Hunter Engine

Date: 2026-10-23

## Status

Accepted

## Context

Following the production hardening for mobile resilience and tactile fidelity (ADR 0019), comprehensive player experience analysis identified four core opportunities to elevate retention, engagement, and audiovisual polish:

1. **Daily Retention & Habit-Forming Loop**: While the 100-stage campaign and boss encounters offer substantial depth, players lacked a dedicated daily ritual welcoming them back to the game each calendar day with rewarding anticipation and streaks.
2. **Juicy Match Dynamics (Visual Kinetic Polish)**: Matching tiles currently produces particles and sound, but lacks punchy, floating kinetic typography numbers (`+100 PTS`, `COMBO x5!`, `CRITICAL!`) and delicate cherry blossom (sakura) petal bursts radiating from the matched pair's midpoint to satisfy modern arcade tactile expectations.
3. **Mid-to-Long Term Metagame Aspirations**: Players completing stages and collecting companions did not have a unified hall of milestones (Achievements) providing diamonds, universal shards, and prestigious player titles to showcase on the main menu.
4. **Post-Run Feedback & Performance Pride**: Level clear screens reported standard 3-star checklists and rewards, but lacked granular performance telemetry (match pace per pair, companion damage contribution, letter grades like `S+`, and new high score celebrations) that motivate mastery and speedrunning.

## Decisions

### 1. Daily Shrine Omikuji & 7-Day Fortune Loop
- Implement `DailyOmikujiModal` styled after sacred Shinto shrine traditions:
  - Players shake a traditional wooden bamboo cylinder (*tsutsu*) to draw an authentic fortune slip (*omikuji*):
    - **Đại Cát (大吉 - Great Blessing)**: 2,500 Coins + 25 Diamonds + 2 Universal Shards
    - **Trung Cát (中吉 - Middle Blessing)**: 1,500 Coins + 15 Diamonds + 1 Universal Shard
    - **Tiểu Cát (小吉 - Small Blessing)**: 1,000 Coins + 10 Diamonds + 1 Hint Booster
    - **Cát (吉 - Blessing)**: 800 Coins + 5 Diamonds + 1 Shuffle Booster
    - **Mạt Cát (末吉 - Future Blessing)**: 500 Coins + 5 Diamonds + 1 Bomb Booster
  - Progression tracked across a 7-day calendar streak (`omikujiStreak`: 1..7).
  - Day 7 grants a Grand Jackpot: +50 Diamonds + 5 Universal Spirit Shards!
  - Unclaimed daily fortunes display a pulsing vermilion notification dot on the `⛩️ QUẺ NGÀY` top-bar button.

### 2. Juicy Match Dynamics: Floating Numbers & Sakura Petal Bursts
- In `GameScene.ts`:
  - `showMatchScorePopup(x, y, pts, combo, isCritical)`: Spawns kinetic typography floating upward with parabolic easing, scale popping, and semantic color-coding (Gold for Combos >= 5, Crimson for Critical Strikes, Cyan for standard streaks).
  - `spawnSakuraPetalBurst(x, y, count)`: Generates 8-12 delicate pink/white diamond petal particles radiating with radial velocity and gentle downward flutter when pairs connect.

### 3. Mythic Hunter Milestone & Player Title Engine
- Implement `AchievementRegistry` and `AchievementModal` tracking 16 diverse milestones spanning:
  - First blood & boss slayer feats (`Tập Sự Trừ Tà`, `Sát Quỷ Sư`, `Trấn Áp Yêu Thú`).
  - High-APM combo streaks (`Liên Kích Bậc Thầy`, `Thần Tốc Nối Thú`).
  - Star & realm milestones (`Tinh Anh Thám Hiểm`, `Bậc Thầy Tinh Tú`, `Chí Tôn Thiên Giới`).
  - Companion evolutions (`Khai Mở Linh Lực`, `Chúa Tể Thần Thú`).
  - Skill trials (`Tia Chớp Bạc`, `Chiến Binh Bất Tử`, `Tâm Như Chỉ Thủy`).
- Each milestone rewards diamonds and universal shards, and unlocks an honorific Player Title (e.g., `⚡ Thần Tốc Nối Thú`) equippable and displayed in a lacquer badge directly under the companion mascot on `MainMenuScene`.

### 4. Post-Run Tactical Scorecard & Hall of Fame
- In `GameScene.ts`:
  - Calculate real-time performance telemetry during every run:
    - **Match Pace**: Total seconds elapsed divided by total pairs cleared (e.g., `1.8s / cặp`).
    - **Companion Skill Contribution**: Total damage or freeze effects applied by the active companion.
    - **Letter Grade Rating**:
      - `S+`: 3 Stars + Match Pace ≤ 2.2s + 0 Boosters used (flawless execution).
      - `S`: 3 Stars.
      - `A`: 2 Stars.
      - `B`: 1 Star.
      - `C`: Level failed or incomplete.
    - **High-Score Record Flag**: Celebratory badge with sound and particle burst when beating previous personal bests.

## Consequences

- **Significant Retention Uplift**: The daily shrine ritual creates a compelling daily return trigger with zero pay-to-win pressure.
- **Hypnotic Game Feel**: Matching pairs feels tactile, kinetic, and visually rewarding.
- **Deep Metagame Prestige**: Long-term players have tangible goals, equippable titles, and performance metrics to showcase mastery.
- **Zero Performance Regression**: Lightweight particle pooling and tween disposal preserve 60 FPS on Retina mobile screens.
