# Yokai Onet Puzzle (妖怪コネクト)

Yokai Onet is a Japanese-themed tile-matching puzzle adventure combining classic Onet (Pikachu connect-2) pathfinding rules, dynamic board gravity modifiers, and multi-phase mythological boss puzzle battles.

## Core Puzzle Mechanics

**Tile Parity**:
The invariant that every character type placed on the board must have an strictly even count so all tiles can be matched in pairs without leaving orphaned tiles.
_Avoid_: Tile balance, even matching, parity check

**PathFinder**:
The pathfinding algorithm that determines whether two identical tiles can connect with at most two 90-degree bends (0, 1, or 2 turns) through empty grid cells or the outer padding margin.
_Avoid_: Route finder, line tracer, connection checker

**Padding Margin**:
A 1-cell outer border of empty coordinates surrounding the visible playable board matrix, enabling tiles on perimeter edges to connect around the outside.
_Avoid_: Empty border, outer boundary, buffer zone

**Deadlock**:
A board state containing zero valid legal connectable pairs between any remaining tiles, which triggers an automatic reshuffle.
_Avoid_: Stuck board, no-moves state, stalemate

**Solvable State**:
A generated initial board configuration that is mathematically guaranteed to contain at least one valid legal match without requiring an immediate reshuffle.
_Avoid_: Playable board, valid board, workable grid

**Star Quest Mapping**:
The strict 1-to-1 parity between the three evaluated level objectives displayed on the victory checklist and the awarded star count, ensuring achieved quests always equal earned stars without conflicting stopwatch penalties.
_Avoid_: Rating formula, star algorithm, score bonus

**Input Pipelining**:
The queuing and instant registration of user touch selections during tile-clear animation frames, guaranteeing zero dropped clicks and fluid 60fps pacing when executing rapid consecutive matches.
_Avoid_: Buffer clicks, click spam, queue taps

## Board Dynamics & Obstacles

**Board Modifier**:
A gravitational directional shift (Down, Left, Right, Split, Center) that slides remaining tiles into empty slots after a pair is removed.
_Avoid_: Physics, slide rule, shift effect

**Obstacle**:
A non-matching board entity (Ice, Stone, Spider Web, Sandstorm) that blocks paths until reduced to zero durability by adjacent matches or skills.
_Avoid_: Barrier, trap, blocker, brick

**Relic Shard**:
A pair of special marked tiles carrying ancient runes that awards bonus stars and unlocks sacred lore when cleared.
_Avoid_: Bonus tile, gold tile, special pair

## Progression & Combat

**Boss Phase**:
A boss stage where matching tiles inflicts direct damage to a mythical beast's HP bar while surviving periodic disruptive boss skills.
_Avoid_: Boss fight, raid stage, monster round

**Fever Mode**:
A temporary high-tempo state triggered at combo streak 5+, granting score multipliers, golden laser lines, and sakura blossom visuals.
_Avoid_: Rage mode, rush mode, super streak

## Architecture & Economy

**Arcade Fair-Play**:
The progression pacing model guaranteeing unmetered level attempts with zero stamina or energy constraints, where in-game currency is exclusively used for boosters, revives, and companion unlocks.
_Avoid_: Energy system, heart timer, stamina gate

**Save Portability**:
The zero-cloud mechanism for exporting and importing complete game progression via a checksummed base64 code string, enabling device migration without a server or account.
_Avoid_: Account sync, cloud save, backup file

**Procedural Audio Synthesis**:
Real-time generation of traditional Japanese musical scales and match sound effects via the Web Audio API without downloading audio asset files.
_Avoid_: Sound download, audio stream, music assets

**Offline PWA Cache**:
The client-side Service Worker caching strategy guaranteeing immediate cold-start execution and autonomous gameplay in disconnected environments.
_Avoid_: Local cache, offline app, disk store

## Records & Honor

**Arcade Hall of Fame**:
The localized, zero-cloud trophy pavilion recording the player's lifetime personal bests (speedrun clear times, maximum combo streaks, and pure wins without boosters).
_Avoid_: Leaderboard, online ranking, global scoreboard

**Speedrun Record**:
The fastest recorded elapsed time in seconds to completely clear a playable board from first touch to final pair.
_Avoid_: Clear time, best time, fast run

**Iron Hand Streak**:
The consecutive streak of campaign stages completed with zero booster activations (no hints, no shuffles, and no bombs).
_Avoid_: No-booster streak, pure run, clean streak

## Companions & Progression (Linh Thú & Tiến Hóa)

**Companion Shard**:
A collectible elemental relic fragment specific to each mythical companion, accumulated through 3-star chapter completions, Boss defeats, or Shinto Shrine exchanges to upgrade companion levels (1-5) and trigger awakenings.
_Avoid_: Character card, duplicate hero, gacha shard

**Spirit Gauge**:
An energy meter filled incrementally as the player matches tile pairs and maintains combo streaks, unlocking the companion's active tactical skill upon reaching 100%.
_Avoid_: Mana bar, rage meter, energy pool

**Companion Awakening**:
A qualitative milestone transformation occurring at level thresholds (Tier 1 to Tier 3) that evolves the visual aura and unlocks specialized secondary skill mechanics rather than inflating raw clear counts.
_Avoid_: Star-up, limit break, stat boost

**Rule-Bending Passive**:
An innate companion trait that subtly bends standard board constraints (such as granting extra margin turns, preserving combo during deadlocks, or extra life protection) without automating puzzle clears.
_Avoid_: Stat buff, passive boost, cheat perk

**Archetype Affinity**:
The design alignment between a companion's elemental domain and specific board obstacles or modes (e.g., Fire countering Ice/Bosses, Earth crushing Stone, Water regulating Survival blizzard tempo).
_Avoid_: Hero class, counter meta, element advantage

## Multiverse Campaign & Realm Fusion (Viễn Chinh Vạn Giới)

**Multiverse Campaign (Viễn Chinh Vạn Giới)**:
The overarching 100-level progression spanning 10 distinct mythological domains, featuring 495 hand-crafted mythical creatures across 16 world collections.
_Avoid_: World map, level pack, level saga

**Sister-Theme Pairing**:
The structural fusion of complementary cultural and thematic character pools (e.g., Egypt + Desert Animals, Greece + Fantasy, Pirate + Underwater Abyss) to ensure deep, varied boards of 36–90+ candidate tiles per chapter without requiring new asset drawings.
_Avoid_: Random mix, theme shuffle, mixed pack

**Vanguard Ambassadors**:
The quartet of canonical traveling companions (`inari_kitsune`, `nekomata_calico`, `bake_danuki`, `kappa_cucumber`) that accompany the player across all worlds, providing narrative continuity and visual anchors in foreign realms.
_Avoid_: Mascots, starter squad, fixed helpers

**Intra-Chapter Pacing Formula (60/40 -> 75/25 -> 50/50 -> Boss)**:
The mathematical character distribution ratio within each 10-level chapter, shifting from introductory onboarding (levels 1–3) to deep cultural immersion (levels 4–7), high-entropy convergence (levels 8–9), and climax boss encounter (level 10).
_Avoid_: Difficulty ramp, stage mix, random ratio

## Companion Relics & 100-Shard Forging (Thần Khí & Đúc 100 Mảnh)

**Companion Relic (Cổ Vật Thần Khí)**:
A specialized mythical artifact (30 in total across 10 chapters) equipped prior to entering a stage, providing a high-impact ultimate tactical skill triggered when the rage gauge reaches 100%.
_Avoid_: Equipment item, gear piece, weapon drop

**100-Shard Forging (Quy Chuẩn Đúc 100 Mảnh)**:
The fixed progression requirement of collecting exactly 100 unique shards of a relic to permanently forge and unlock it.
_Avoid_: Gacha roll, random crafting, lucky drop

**Surplus Shard Conversion (Quy Đổi Mảnh Thừa)**:
The automated conversion of any additional shards acquired after forging a relic into 50 gold coins per shard at stage completion.
_Avoid_: Shard burn, salvage scrap, trash selling

**Three-Tier Drop Slicing (Phân Bổ 3 Cấp Bậc)**:
The structural drop allocation of relics across stage types: Common (🟢 Hạ Phẩm) dropping in regular stages (2%–8%), Rare (🟡 Trung Phẩm) in Mini-Boss stages (10%–20%), and Epic (🔴 Thượng Phẩm) exclusively in World Boss stages (25%–40%, with ≥ 2 shards guaranteed on 3-Star Hard).
_Avoid_: RNG rarity, item tier list, random loot

## Economy & Supply (Kinh Tế & Tiếp Tế)

**Tactical Supply Depot (Tiệm Đạo Cụ)**:
The hub-based pre-stage merchant where players exchange accumulated soft currency for tactical puzzle boosters before entering a match.
_Avoid_: In-game shop, cash shop, microtransaction store

**Dual-Currency System (Hệ Thống Song Tệ)**:
The macroeconomic architecture comprising Coins (earned soft currency for boosters and level-ups) and Diamonds (hard currency reserved for future live-service expansions).
_Avoid_: Token economy, multi-currency wallet, point system

**Non-Purchasable Relic (Thần Khí Bất Khả Mua)**:
The gameplay integrity rule guaranteeing that relic shards and companion awakening fragments can only be earned through stage victories and boss battles, never bought in the shop.
_Avoid_: Gacha pool, pay-to-win items, lootbox

## Reliability & QA Engineering (Độ Tin Cậy & Kiểm Thử)

**Exception Boundary (Phân Vùng Cô Lập Ngoại Lệ)**:
An architectural wrapper (`safeSubsystemRun`, `try-catch`) encapsulating discrete update subsystems or input handlers so that an unforeseen runtime exception in one module logs telemetry and fails gracefully without crashing the master engine loop or freezing user input.
_Avoid_: Global unhandled throw, silent screen freeze, monolith update loop

**Safe Async Tween Lifecycle (Vòng Đời Tween Khử Hồi Tiếp)**:
The defensive practice of detaching UI references from instance properties prior to tween fade-out and guarding `onComplete` callbacks against destroyed or recycled game objects, preventing fatal canvas draw and null context exceptions.
_Avoid_: Dangling tween callback, mutating dead display object, unreferenced timer

**Processing Watchdog (Bộ Canh Phòng Khóa Thao Tác)**:
An automated failsafe timer (750ms) and `finally` release block within `BoardManager` that unconditionally unlocks `isProcessingMatch = false` and clears tile selection if animations or collateral calculations fail to resolve, preventing permanent input lockouts.
_Avoid_: Permanent click lock, frozen board touch state, unresponsive tap

**Chaos Monkey Testing (Thử Nghiệm Khỉ Hỗn Loạn)**:
An automated testing harness (`runHeadlessChaosSimulation` in Vitest and `window.runChaosStressTest` in browser) that simulates an erratic, hyper-rapid user executing hundreds of invalid clicks, rapid matches, booster triggers, and shuffles to verify engine stability and 100% parity preservation under maximum stress.
_Avoid_: Manual-only QA, happy-path testing, unverified edge clicks

