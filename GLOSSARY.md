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

**Retina Canvas Scaling**:
The high-DPI rasterization strategy matching the Phaser canvas render resolution to the physical device pixel ratio (capped at 2x for optimal battery and GPU thermal balance), eliminating blurry or pixelated text on Retina OLED mobile displays.
_Avoid_: Screen zoom, pixel smoothing, canvas upscaling

**Typography Hierarchy**:
The standardized two-tier font architecture segregating display headings (cinematic Japanese fantasy serif) from functional telemetry (clean, high-legibility geometric sans-serif for HUD, timers, and badges) across all game scenes.
_Avoid_: Font mixing, random fonts, ad-hoc styling

**Typography Token**:
The standardized font size, weight, and line-spacing presets (`display`, `heading`, `title`, `subtitle`, `body`, `badge`, `caption`) providing a single source of truth for text styling across the game.
_Avoid_: Arbitrary px sizes, magic numbers, inline weight strings

**Typography Factory**:
The centralized programmatic API (`Typography.create()`, `Typography.style()`, and `scene.add.uiText()`) wrapping Phaser Text generation to enforce global font family, resolution, and antialiasing rules.
_Avoid_: Direct Phaser.add.text with inline styles, custom text wrappers

**Color Token**:
A standardized, named color definition representing a canonical visual shade or semantic purpose across vector graphics, UI cards, and typography.
_Avoid_: Magic hex literals, hardcoded color numbers, ad-hoc palette strings

**Dual-Format Palette**:
The synchronized architecture exposing every color token simultaneously as an integer numeric hex (`0xRRGGBB` for Phaser Graphics / Tints) and a CSS string hex (`#RRGGBB` for Phaser Text / HTML overlays), eliminating runtime string-to-number parsing overhead.
_Avoid_: Manual parseInt conversions, HexStringToColor runtime calls

**Semantic Color Mapping**:
The layer of design tokens that assigns visual colors to game domain concepts (e.g., Gold for coin currency, Cyan for player EXP, Coral for character shards, Obsidian for card backgrounds) rather than using raw color names directly in views.
_Avoid_: Direct color references in business logic, raw color hardcoding

**Tactical Booster Dock**:
The compact, non-intrusive action container housing player consumables (Hint, Shuffle, Bomb) with an ultra-low vertical footprint, mathematically isolated from the board grid to guarantee zero tile obstruction.
_Avoid_: Item bar, booster tray, bottom buttons

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

## Asset Management & Performance Pipeline (Quản Lý Tài Nguyên & Hiệu Năng)

**Offline-First WebP Pipeline (Quy Trình Nén WebP Thuần Offline)**:
The complete bundling of all game assets within the local binary using WebP compression (85%–90% quality), shrinking raw asset weight by >90% without network dependency.
_Avoid_: Remote CDN streaming, raw PNG bundling, external asset pack

**Cold Boot Budget (Hạn Mức Khởi Động)**:
The strict memory and time boundary for `BootScene` (<15 MB VRAM, <500ms wall-clock duration) ensuring instant initial launch without triggering mobile OS memory limits.
_Avoid_: Heavy boot preload, monolithic asset splash, blocking boot screen

**Smart Hybrid Preload (Cơ Chế Nạp Lai Thông Minh)**:
A multi-tier asset lifecycle combining instant cold boot into the Main Menu with silent, non-blocking background prefetching of the player's active chapter before stage entry.
_Avoid_: All-at-once memory dump, synchronous loading screen, unbuffered asset fetch

**Texture Garbage Collection (Thu Gom Bộ Nhớ Texture)**:
The proactive eviction of inactive chapter textures from Phaser's TextureManager when transitioning between distinct world realms, maintaining steady mobile GPU thermals and preventing WebKit Jetsam kills.
_Avoid_: Unmanaged VRAM accumulation, permanent texture leaks, memory bloat

## Modal Ergonomics & Interface Architecture (Công Thái Học Giao Diện & Bố Cục)

**Asymmetric Modal Layout (Bố Cục Bất Đối Xứng)**:
The deliberate proportional divergence of UI card widths within a multi-card modal grid (e.g. allocating 330px to a condensed hero inspector and 566px to an expansive loot matrix) to guarantee ample breathing room and eliminate text truncation or element collision without requiring full-screen re-routing.
_Avoid_: Rigid 50/50 split, cramped columns, arbitrary container widths

**Unified Action Progress Bar (Thanh Tiến Độ Tác Vụ Hợp Nhất)**:
A composite interactive UI element integrating shard accumulation progress fill directly behind action state typography and icons, preventing the vertical crowding and collision of stacked independent progress bars and button pills.
_Avoid_: Stacked progress and button, colliding bars, double-pill clutter

**Skill Popover (Cửa Sổ Chi Tiết Kỹ Năng Tinh Gọn)**:
A focused, transient pop-up overlay summoned on-demand from compact circular skill badges or a dedicated inspect trigger, encapsulating full ability mechanics, stat scaling, and counter mechanics to maintain high-level modal serenity.
_Avoid_: Inline text wall, truncated skill block, crowded stat box

**Unified Vertical 2-Column Grid (Lưới 2 Cột Thống Nhất Trục Dọc)**:
An architectural interface paradigm organizing content cards into two continuous vertical columns across rows: a compact 330px left column for Player Loadout (Relic Spotlight & Companion) and an expansive 566px right column for Objectives & Rewards (Difficulty Chests, Drop Capsules, and 3-Star Quests). This ensures a natural visual eye flow aligned with top-bar difficulty controls while maintaining vertical alignment.
_Avoid_: Staggered column boundaries, misaligned row splits, inconsistent card widths

**Single Authoritative Difficulty Controller (Bộ Điều Khiển Độ Khó Độc Quyền)**:
The strict UI hierarchy rule dictating that difficulty switching and chest previewing must reside exclusively within the Difficulty Pods (Card 2) rather than duplicating redundant toggle pills in the modal header, eliminating cognitive friction and duplicate visual noise.
_Avoid_: Duplicate difficulty switches, stacked toggles, header-card toggle conflict

**Balanced 2x2 Reward Matrix (Lưới Phần Thưởng 2x2 Cân Bằng Thị Giác)**:
A visual distribution layout for loot capsules in Card 4 where Currency items (Row 1) utilize balanced value-label pairings with fixity pills (`[✓ CỐ ĐỊNH]`), and Character Shards (Row 2) adopt a 3-zone horizontal division (Avatar, Name/Drop rate, Inspect Button), combined with an enlarged 66px cell height to eliminate bottom dead space.
_Avoid_: Asymmetric loot pills, left-heavy text pods, empty capsule halves, bottom dead zone

**Modal Design Engine (Động Cơ Khung Giao Diện Dùng Chung)**:
A centralized programmatic layout system providing standardized container shells, golden-ratio grid calculators, header hierarchies, and responsive padding rules across all modal views, preventing fragmented pixel coordinates and coordinate collisions.
_Avoid_: Ad-hoc modal sizing, magic pixel offsets, bespoke container wrappers

**UI Layout Auditor (Bộ Kiểm Định Bố Cục & Dữ Liệu Tự Động)**:
An automated static and runtime verification framework scanning modal trees for bounding box collisions, text truncation, missing translation keys, unrendered null/undefined tokens, and design token violations across every game scene.
_Avoid_: Manual spot-checking, visual guess-work, uncaught layout overlaps

**Batch Refactoring Pipeline (Quy Trình Tái Cấu Trúc & Sửa Hàng Loạt)**:
A structured three-stage remediation methodology (Automated Audit -> Catalog Alignment -> Batch Patching & Verifying) that allows systemic, sweeping UI/UX and data corrections across dozens of components without incurring regressions or logic breakage.
_Avoid_: Piecemeal hacking, uncoordinated hotfixes, ad-hoc visual tweaks

**Phase Gate (Cổng Nghiệm Thu Chặn Cứng)**:
A mandatory set of non-negotiable stability and correctness metrics that must be 100% satisfied before QA progression to the next development phase.
_Avoid_: Soft checklist, optional criteria, milestone estimate

**Automated Defect Trapping (Bẫy Lỗi Ngầm Tự Động Đa Tầng)**:
A multi-tiered testing strategy combining headless simulations, synthetic input flooding, and live WebGL instrumentation to surface race conditions and memory leaks without manual human intervention.
_Avoid_: Manual spot checking, ad-hoc clicking, casual smoke test

**Infinite Reshuffle (Vòng Lặp Đảo Bàn Vô Tận)**:
An illegal deadlock state where a board continuously triggers automatic reshuffles without generating any legally matchable tile pairs, permanently freezing progression.
_Avoid_: Endless shuffle, stuck loop, repeating shuffle

## RPG Combat & Adaptive Difficulty Engine

**Combat HP (Máu Chiến Đấu Của Người Chơi)**:
The real-time hit-point pool of the player in battle, dynamically augmented by companion level, tier evolution, and defensive relics, protecting the player against active damage dealt by bosses and environmental hazards.
_Avoid_: Player lives, life hearts, retry tokens

**Enrage Phase (Giai Đoạn Cuồng Nộ)**:
A high-intensity combat state triggered when a Boss drops below 35% HP, granting the Boss a +50% attack speed reduction, screen-tremor visual feedback, and enhanced board obstruction attacks.
_Avoid_: Phase 2, angry mode, hard phase

**Match Damage Output (Sát Thương Nối Thú)**:
The projectile damage delivered to the boss upon each successfully matched tile pair, calculated as a function of the companion level, active combo streak, and fever multipliers.
_Avoid_: Clear score, match point, damage tick

**Damage Mitigation (Chỉ Số Kháng Sát Thương & Giáp)**:
The percentage reduction applied to incoming boss damage derived from defensive companion affinities (e.g. Genbu) and equipped relics (e.g. Tortoise Shell), capped at 60%.
_Avoid_: Armor point, def value, block score

**Multi-Vector Pressure Engine (Động Cơ Áp Lực Đa Véctơ)**:
The suite of dynamic algorithms (Shadow Veil, Pulse Gravity Shift, Panic Penalty) governing Medium and Hard difficulty tiers to counter high-APM pro players and enforce adaptive strategic thinking.
_Avoid_: Random difficulty, handicap system, difficulty spike

**Shadow Veil (Màn Sương Âm Giới)**:
An obscurant fog system shrouding deep interior tiles until surrounding perimeter tiles are cleared or a combo threshold (>= 3) disperses the mist.
_Avoid_: Hidden tiles, blind spot, dark mode

**Pulse Gravity Shift (Nhịp Xoay Chiều Trọng Lực)**:
A periodic shifting algorithm rotating board gravity vectors every 10–12 seconds or on combo drops, altering tile coordinates and forcing continuous pathfinder reassessment.
_Avoid_: Board shake, tile sliding, random drift

**Panic Penalty (Hình Phạt Thao Tác Bối Rối)**:
A tempo penalty deducting countdown seconds or flash-freezing tiles when a player executes rapid erroneous taps or experiences prolonged hesitation.
_Avoid_: Error buzz, wrong click, timeout penalty

**Battle Consumable (Vật Phẩm Hộ Mệnh Chiến Đấu)**:
Pre-equipped tactical items (e.g. Divine Ward, Rejuvenation Elixir) usable during battle to absorb fatal strikes or instantly recover combat HP.
_Avoid_: Boosters, cheat items, power-ups

## Solvability & Deadlock Prevention

**Ultimate Geometric Rescue (Cứu Hộ Hình Học Tối Hậu)**:
The deadlock-resolution algorithm executed when remaining active board coordinates cannot connect with ≤ 2 turns due to obstacle topology, which relocates an active tile to an empty adjacent slot without mutating character parity.
_Avoid_: Tile teleport, random relocate, forced swap

**Collision-Free Reshuffle (Đảo Bài Bảo Toàn Chẵn Lẻ)**:
The strict bijective permutation guarantee during board reshuffle ensuring all paired character counts remain strictly even and zero orphaned tiles are generated.
_Avoid_: Random reset, tile reroll, blind shuffle

## Mobile Production Hardening & Session Integrity

**Session Resume Fidelity (Khôi Phục Toàn Vẹn Ván Đang Chơi)**:
The deep serialization standard persisting exact battle metrics (including Boss HP, player combat health, survival wave index, and relic status) on app backgrounding or incoming interruptions, ensuring zero state regression upon resuming.
_Avoid_: Quick save, checkpoint reset, soft resume

**Resilient Save Auto-Healing (Tự Động Chữa Lành File Lưu Bị Hỏng)**:
The dual-stage heuristic and regex extraction engine in `SaveSystem` that recovers critical player progress (coins, stars, highestLevel, unlocked companions, boosters) from truncated or malformed localStorage JSON strings without ever resetting the account.
_Avoid_: Save wipe, corrupted wipe, hard factory reset

**Safe Area Cushioning (Đệm Vùng An Toàn Màn Hình & Dynamic Island)**:
The layout geometry guarantees ensuring all touch targets and tactical trays maintain clearance from physical cutouts, camera notches, Dynamic Islands, and the iOS Home Indicator gesture zone.
_Avoid_: Notch padding, edge margin, screen border

**Idempotent Scene Teardown (Thu Dọn Tài Nguyên Cảnh Bất Biến)**:
The unified resource cleanup protocol binding scene teardown to both `shutdown` and `destroy` events, safely killing all background timers, particle emitters, tweens, and window event listeners to prevent memory leakage across extended play sessions.
_Avoid_: Scene dispose, manual garbage collection, stop scene

## Economy & Progression Fair-Play

**Universal Spirit Shard (Linh Thạch Vạn Năng)**:
A premium progression currency minted automatically when dropping shards for an already max-level (Lv.5) companion at a 3:1 ratio, universally spendable to substitute missing shards for any unmaxed companion.
_Avoid_: Wild shard, rainbow gem, joker piece

**Panic Click Threshold (Ngưỡng Hoảng Loạn)**:
The multi-vector pressure filter on Hard mode requiring at least 3 consecutive rapid mis-clicks (< 350ms delta) before deducting countdown seconds (-2s), preventing false-positive penalties from touchscreen double-taps.
_Avoid_: Spam detector, double-tap penalty, rapid tap blocker

**Arcade Vitality Full-Restore (Hồi Sinh Lực Toàn Vẹn Theo Màn)**:
The baseline convention where player Combat HP resets to 100% upon starting each Campaign level, restricting persistent health attrition exclusively to Boss Rush and Survival Mode.
_Avoid_: Level heal, free potion, auto-revive

**Independent Stage Parity (Độc Lập Nộ Khí Theo Màn)**:
The rule ensuring Relic Rage and Companion Energy reset to 0% on level restart or retry, preserving puzzle integrity by disallowing carry-over rage grinding from prior attempts.
_Avoid_: Rage carry, meter save, cheat retention

## Mobile Resilience & Tactile Fidelity

**Auto-Pause Interruption Shield (Lá Chắn Tạm Dừng Khi Gián Đoạn)**:
The automatic freeze protocol that engages upon app backgrounding (`visibilitychange` or `appStateChange`) during active puzzle or boss battles, presenting an explicit resume gate with a 3-2-1 countdown breather before unpausing.
_Avoid_: Sudden resume, background drain, unpaused minimize

**Gesture Re-armed WebAudio (Tái Kích Hoạt Âm Thanh Theo Cử Chỉ)**:
The dynamic re-registration of a one-shot touch listener (`pointerdown`/`touchstart`) when the WebAudio context enters an `interrupted` state from incoming phone calls or Bluetooth reconnects, seamlessly unlocking audio on the player's next screen tap.
_Avoid_: Permanent mute, silent state, audio restart hack

**Companion Tactile Resonance (Phản Hồi Xúc Giác Linh Thú)**:
The curated physical haptic patterns assigned to companion management actions (Success for summon/evolve, Medium for level-up, Light for roster carousel navigation, Warning for insufficient resources) enhancing tactile delight on physical devices.
_Avoid_: Generic vibration, button buzz, blind haptics

**Dual-Layer Eviction Shield (Lưu Trữ Phòng Vệ Hai Lớp)**:
The redundant persistence architecture maintaining an autonomous, checksummed backup record (`yokai_save_backup`) alongside the primary save slot, guaranteeing automatic self-recovery if iOS purges WKWebView storage under memory pressure.
_Avoid_: Single-slot save, unverified persistence, volatile storage

## Daily Retention & Engagement Feel

**Shrine Omikuji (Quẻ Thần Đền Shinto)**:
A daily fortune-drawing system styled after authentic Japanese Shinto shrine traditions, where players shake a sacred wooden cylinder once per calendar day to draw a randomized fortune tier (Đại Cát, Trung Cát, Tiểu Cát, Cát, Mạt Cát) and progress across a 7-day streak track culminating in a grand diamond/shard jackpot.
_Avoid_: Daily spin, lucky wheel, random login reward

**Floating Combat Popups (Chữ Số Điểm Bay)**:
Kinetic typography animations bursting upward from matched tile coordinates that dynamically format and color-code match rewards (+100 PTS, COMBO x5!, CRITICAL!) with scale bouncing and parabolic physics.
_Avoid_: Static score increment, raw text flash, score fly

**Mythic Hunter Milestone (Cột Mốc Thợ Săn Yokai)**:
A permanent achievement framework tracking 16 diverse skill and progression milestones across combat, speed, combos, and companion evolutions, rewarding premium diamonds and unlocking equippable honorific player titles displayed on the main menu.
_Avoid_: Quest list, checklist, achievement badge

**Tactical Scorecard (Thẻ Kỷ Lục Phân Tích Trận Đấu)**:
The end-of-match performance breakdown panel evaluating match duration, tile-clearing pace (seconds per pair), companion damage contribution, and awarding an arcade grade rank (S+, S, A, B, C) with high-score record celebrations.
_Avoid_: Win screen, end dialog, basic results

