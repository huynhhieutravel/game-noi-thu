# 0005. Tactical Supply Depot, Dual-Currency Schema, and Competitive Integrity

## Context
Following the expansion of Yokai Onet's multiverse campaign, relics, and companions, players needed a dedicated merchant sink to purchase tactical booster consumables (Hint, Shuffle, Bomb) using accumulated in-game currency. However, unconstrained shop offerings risk compromising game balance and player satisfaction in two critical ways:
1. Selling progression shards (Relic Shards or Companion Fragments) in the shop reduces boss achievements and 3-star campaign mastery to mere coin farming, stripping the game of its roguelike thrill and competitive integrity.
2. Offering mid-combat "emergency quick-buys" allows players to brute-force difficult boards by panic-spending currency, eliminating the tension of tactical planning.
3. Setting booster prices too low devalues gameplay rewards, as a single easy stage victory would fund a stockpile of boosters.

Additionally, while monetization (IAP) is not immediately active, introducing live-service monetization in future versions requires a clean dual-currency data architecture without breaking existing zero-cloud offline saves.

## Decision
We establish the **Tactical Supply Depot (Tiệm Đạo Cụ Quân Nhu)** architecture governing in-game commerce, currency separation, and gameplay purity:

### 1. Dual-Currency Data Schema (Hệ Thống Song Tệ)
- **Soft Currency (`coins` - Xu Vàng)**: Earned actively through stage clears, combo streaks, star thresholds, and relic shard surplus conversion. Used exclusively to purchase tactical boosters and fund companion rank ascensions.
- **Hard Currency (`diamonds` - Kim Cương)**: Seeded with 50 starting diamonds for new players and earned sparingly through high-tier milestones (e.g. defeating Chapter Bosses on Hard mode). Displayed on the main top bar (`💎 50`) and reserved for future non-intrusive live-service expansions.

### 2. Shop Inventory Constraints (Danh Mục & Tính Toàn Vẹn)
- **Booster-Only Catalog**: The shop exclusively stocks the 3 canonical tactical consumables:
  - **Bình Gợi Ý (Hint)**: Highlights one valid connectable pair.
  - **Quạt Hoán Đổi (Shuffle)**: Reshuffles all remaining tiles.
  - **Búa Sét (Bomb)**: Automatically destroys one valid pair instantly.
- **Non-Purchasable Invariant (Thần Khí Bất Khả Mua)**: Relic Shards, Companion Shards, and World Themes are strictly unbuyable in the shop. They must be earned through level drops, chapter 3-star ratings, and boss battles.
- **Fixed 24/7 Availability**: The catalog is static without artificial countdown timers or paid reroll mechanics.

### 3. Challenging Economy Formula (Bảng Giá Thử Thách)
Prices are pegged against player stage earnings (~150–200 coins per normal stage clear; ~500–1,000 coins per boss defeat):
- **Gợi Ý (Hint)**: 500 Xu (single) | 2,200 Xu (Pack x5, saving 300 Xu).
- **Đổi Bảng (Shuffle)**: 800 Xu (single) | 3,500 Xu (Pack x5, saving 500 Xu).
- **Búa Sét (Bomb)**: 1,200 Xu (single) | 5,200 Xu (Pack x5, saving 800 Xu).
- **Rương Quân Nhu Toàn Năng (All-in-One)**: 3,600 Xu (3 Hints + 2 Shuffles + 1 Bomb, saving 700 Xu).

### 4. Zero In-Match Shopping (Chuẩn Bị Tiền Trận)
The shop is accessible solely from the Main Hub (`MainMenuScene`). Once a level is entered (`GameScene`), the player cannot buy boosters. If on-hand supplies deplete, the player must rely strictly on pattern recognition or accept defeat, preserving the authentic arcade stakes.

## Consequences
- Preserves the sense of accomplishment: every relic forged and companion awakened represents genuine gameplay triumphs.
- Prevents inflation and gives gold coins sustained, high-value purpose across all 100 levels.
- Ensures total offline-first safety with no external network dependencies or unexpected pay-to-win friction.
