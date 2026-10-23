# 16. Ultimate Geometric Rescue and End-State Solvability Guarantee

Date: 2026-10-22

## Status

Accepted

## Context

During comprehensive headless simulation across all 100 levels on Easy, Medium, and Hard (300 matches), an edge-case deadlock was uncovered at **Level 94 on Hard mode**:
1. **Geometric Coordinate Trap**: In late-game states with only 2–4 tiles remaining on dense boards with indestructible or durable obstacles (e.g., Stones, Barricades, Ice) and directional gravity shifts, the remaining active tiles can become **physically isolated**.
2. **Failure of Traditional Reshuffle**: Standard Onet reshuffling algorithms only permute `characterId` across existing active tile positions $(r, c)$. If the coordinate slots themselves cannot legally connect within $\le 2$ turns (due to obstacle occlusion or Manhattan distance requiring 3+ turns through inner corridors), no amount of character permutation will ever yield a solvable match.
3. **Deadlock Loop**: The board repeatedly triggers automatic reshuffles until hitting the failsafe threshold (30 reshuffles), resulting in an unfair game over despite valid moves having been made earlier.

## Decision

We implement the **Ultimate Geometric Rescue** in `BoardGenerator.reshuffleBoard()`:

1. **Bijective Permutation Preservation (Primary Rescue)**:
   - When reshuffling, pairs are strictly mapped 1-to-1 via bijective swaps between partner tiles, preserving parity invariants ($N \equiv 0 \pmod 2$) across all character types.
2. **Geometric Fallback Activation (Secondary Rescue)**:
   - If after unfreezing and clearing non-stone status modifiers, `tryConnectPair()` still detects zero valid paths among the remaining active coordinates, the system activates the Geometric Rescue.
3. **Reachable Slot Relocation**:
   - The engine selects the first active pair $(T_{\text{anchor}}, T_{\text{relocate}})$.
   - It searches for an empty (already cleared) grid slot that is immediately adjacent to $T_{\text{anchor}}$ (guaranteeing a 0-turn straight-line match of length 1) or reachable within $\le 2$ turns.
   - It atomically clears $T_{\text{relocate}}$ at $(oldR, oldC)$ and instantiates the character at the target empty slot $(targetR, targetC)$.
4. **Visual & Parity Invariant Guarantees**:
   - Character parity is strictly preserved: exactly one instance of the character is cleared from the old slot and exactly one instance is placed in the new slot.
   - `BoardManager.syncViewsAfterMovement()` detects the vacated slot (hiding and disabling its interactive view) and the newly occupied slot (creating or updating the active `TileView`), ensuring zero visual desynchronization.

## Consequences

### Positive
- **100% Solvability Guarantee**: Eliminates the rare end-game deadlock where 2 tiles remain trapped on opposite sides of impassable obstacles.
- **Instantaneous Resolution**: Adjacent empty placement guarantees a 0-turn match that the player can immediately execute.
- **Zero Parity Degradation**: Passes 100+ consecutive chaos stress reshuffles without producing orphaned or odd-count tiles.

### Negative / Trade-offs
- A tile physically moves to a new coordinate slot during a reshuffle (whereas classic reshuffles only change tile artwork in-place). This is visually justified as a "divine vortex" or "compassionate rescue" when the board detects an inescapable jam.
