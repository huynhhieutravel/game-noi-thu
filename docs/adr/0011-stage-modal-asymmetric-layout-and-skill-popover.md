# 0011. Stage Modal Asymmetric Layout, Skill Popover & Unified Action Progress Bar

Date: 2026-10-20
Status: Accepted

## Context
In the Stage Detail Modal (`openStageDetailModal`), user feedback revealed three prominent visual and ergonomic issues:
1. **Vertical Element Collisions ("Dính nhau")**: In the Relic card (Card 1), the Shard Progress Bar (`0/40 Mảnh`) was placed within 2px of the Status Pill (`🔒 CHƯA MỞ`), creating a claustrophobic, colliding appearance that failed gaming UX standards.
2. **Companion Skill Overflow in Card 3**: Companions (such as Cáo Inari) possess three distinct tactical abilities (Active Skill, Passive Buff, and Boss Counter). Attempting to render multi-line descriptions for multiple skills inside a 448px card caused severe text cramping and unreadable font sizes (9.5px).
3. **Reward Section Starvation in Card 4**: Placing 4 reward items (EXP, Coins, Main Shard, Sub Shard with avatars) alongside 3 difficulty chests within a symmetric 448px column starved Card 4 of horizontal breathing room, causing long companion labels ("Mèo Nekomata") to press uncomfortably close to the boundary.

## Decision
We implemented a tripartite UX overhaul:
1. **Asymmetric Bottom-Row Architecture**:
   - Replaced the rigid 50/50 bottom-row split with an asymmetric layout:
     - **Card 3 (Linh Thú)** is narrowed to **`330px`** (`compCardX = -291`), focusing purely on high-impact visual representation: Large companion avatar, level badge, element aura, 3 circular skill badges, and a prominent call-to-action button (`📜 XEM KỸ NĂNG`).
     - **Card 4 (Phần Thưởng)** is expanded to **`566px`** (`rewardCardX = +173`), providing a total span of `912px` that perfectly aligns with the top row's outer edges.
   - The expanded 566px width allows the 4 reward capsules to comfortably expand (120px for currency, 142px for companion shards with 32px circular avatars), and difficulty chests to widen to 168px each with generous internal padding.
2. **Progressive Disclosure via Skill Popover**:
   - Stripped dense descriptive text out of Card 3.
   - Displayed 3 high-definition circular icon badges representing the companion's 3 skills (Tuyệt chiêu, Nội tại, Khắc chế).
   - Added an interactive `📜 XEM KỸ NĂNG` button and click handler on the card that summons an interactive Skill Popover, displaying complete, detailed descriptions and stats without cluttering the main modal.
3. **Unified Action Progress Bar in Card 1**:
   - Combined the separate progress bar and lock status button into a single composite interactive component: `Unified Action Progress Bar`.
   - The bar renders the internal progress fill underneath crisp typography (`🔒 CHƯA MỞ • 0/40 MẢNH`), eliminating the colliding boundary and freeing up 36px of vertical breathing room.

## Consequences
- **Positive**:
  - Zero element collisions across all 4 cards; generous 16px–24px visual padding.
  - Companion Card 3 becomes an elegant hero card without walls of tiny text.
  - Reward Card 4 gains ample room for companion avatars and long Vietnamese names without truncation or overflow.
  - Full parity with existing save state, level manager, and test suites.
- **Negative / Trade-off**:
  - The bottom row is asymmetric (330px vs 566px) while the top row remains symmetric (448px vs 448px). This creates a dynamic, weighted hierarchy that feels modern and intentional rather than rigid.
