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

