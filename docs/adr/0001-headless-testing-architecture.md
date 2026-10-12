# Headless Test Architecture for Core Onet Engine

## Context
Yokai Onet is built with Phaser 3, where rendering and game logic can easily become tightly coupled. As the game scaled to 100 levels, 10 chapters, gravity modifiers, and dynamic boss skills, manual end-to-end playtesting became too slow to catch regression bugs (such as tile parity mismatches, deadlocks on board generation, and corrupt level configs).

## Decision
We decouple all core puzzle logic (`PathFinder`, `BoardGenerator`, `LevelManager`, `SaveSystem`) from Phaser scene lifecycles and test them headlessly using Vitest.

## Consequences
- Core game state and algorithms can be verified in under 2 seconds across 100 levels without launching a browser or canvas context.
- Scene files (`GameScene`, `MainMenuScene`) remain purely responsible for presentation, tweens, and input dispatching, delegating validation to the headless engine.
