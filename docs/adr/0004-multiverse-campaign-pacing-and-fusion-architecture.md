# 0004. Multiverse Campaign Pacing, Sister-Theme Fusion, and Character Distribution Architecture

## Context
The game features a rich library of 495 characters distributed across 16 thematic collections:
- `yokai`: 108 characters (12 sub-chapters of 9 characters each)
- `underwater`: 54 characters
- `egypt`: 45 characters
- `greece`: 45 characters
- `animal`: 45 characters
- 11 niche collections with 18 characters each (`wuxia`, `korea`, `india`, `sea`, `pirate`, `dinosaur`, `monster`, `fantasy`, `space`, `robot`, `plant`)

The initial 100-level campaign architecture attempted to map each 10-level chapter to a single collection in isolation. However, an 8x10 or 8x12 Onet puzzle board requires between 16 and 24 unique character types per board. Constraining single chapters to 18-character collections caused tile repetition, visual fatigue, and lacked the character diversity needed for fair Onet pathfinding. Furthermore, drawing dozens of new characters was explicitly ruled out.

## Decision
We implement a **Multiverse Mythological Expedition (Viễn Chinh Vạn Giới)** framework that harmoniously fuses complementary cultural collections into 10 grand campaign chapters, combined with an intra-chapter pacing curve and traveling companion continuity.

### 1. 10-Chapter Sister-Theme Pairing Architecture
Complementary collections are fused so that every chapter commands a deep pool of 36 to 90+ characters:

1. **Chapter 1: Khởi Nguyên Nhật Bản (Classic Shinto & Yokai)**
   - *Primary*: `yokai` Classic & Folklore (108 pool)
   - *Atmosphere*: Cherry blossoms, Shinto shrines, Torii gates.
   - *Boss*: Yamata-no-Orochi (Xà Thần Bát Kỳ).

2. **Chapter 2: Bí Ẩn Sông Nile & Sa Mạc (Egyptian Gods & Desert Beasts)**
   - *Sister Fusion*: `egypt` (45) + `animal` (Desert & Sacred Fauna, 45) + Vanguard Yokai.
   - *Total Pool*: 90+ characters (Anubis, Bastet, Ra, Horus mix with sacred jackals, falcons, camels).
   - *Boss*: Apep & Pharaoh Golem.

3. **Chapter 3: Đỉnh Núi Olympus & Kỳ Thú Thần Thoại (Greco-Roman & Mythical Beasts)**
   - *Sister Fusion*: `greece` (45) + `fantasy` (18) + Vanguard Yokai.
   - *Total Pool*: 63+ characters (Zeus, Athena, Poseidon, Medusa mix with Griffins, Pegasi, European Dragons).
   - *Boss*: Typhon & Hydra of Lerna.

4. **Chapter 4: Tam Giới Tiên Ma Á Đông (Wuxia Immortals & Joseon Mythos)**
   - *Sister Fusion*: `wuxia` (18) + `korea` (18) + `yokai` Spirits (Spiritual affinity).
   - *Total Pool*: 60+ characters (Daoist sword masters, Imoogi serpents, Nine-tailed Fox, Tiger spirits).
   - *Boss*: Thái Cổ Hắc Long & Imoogi Thăng Thiên.

5. **Chapter 5: Sử Thi Sông Hằng & Tinh Linh Rừng (Vedic Lore & Forest Spirits)**
   - *Sister Fusion*: `india` (18) + `plant` (Sacred Flora, 18) + `yokai` Forest Yokai.
   - *Total Pool*: 50+ characters (Ganesha, Garuda, Asuras mix with ancient treants, lotus spirits).
   - *Boss*: Asura Mười Đầu Ravana.

6. **Chapter 6: Hạm Đội Hải Tặc & Vực Thẳm Thủy Cung (Pirate Fleets & Oceanic Abyss)**
   - *Sister Fusion*: `pirate` (18) + `underwater` (54) + `sea` (18).
   - *Total Pool*: 90 characters (Ghost ship captains, Davy Jones, Mermaids, Megalodons, Kraken).
   - *Boss*: Davy Jones & Cự Quái Kraken.

7. **Chapter 7: Kỷ Băng Hà & Hỏa Diệm Tiền Sử (Prehistoric Titans & Primal Beasts)**
   - *Sister Fusion*: `dinosaur` (18) + `monster` (18) + Primal beasts.
   - *Total Pool*: 45+ characters (T-Rex, Triceratops, Lava Behemoths, Frost Wyrms).
   - *Boss*: Bạo Chúa Nham Thạch Magma T-Rex.

8. **Chapter 8: Chiến Hạm Cơ Giáp Tương Lai (Sci-Fi Nebula & Cyber Mecha)**
   - *Sister Fusion*: `space` (18) + `robot` (18) + Cyber guardians.
   - *Total Pool*: 36+ characters (Starships, Cybernetic droids, Void mechas, Pulsar constructs).
   - *Boss*: Rồng Hố Đen Singularity Void Dragon.

9. **Chapter 9: Vùng Đất Hỗn Độn (The Chaos Rift - All-Stars Clash)**
   - *Multi-dimensional Rift*: Characters from all eras and mythologies collide in an unpredictable cosmic rift.
   - *Total Pool*: 400+ characters sampled across all dimensions.
   - *Boss*: Hỗn Độn Ma Thần (Chaos Primordial).

10. **Chapter 10: Đại Chiến Chư Thần Tối Thượng (The Pantheon of Supreme Bosses)**
    - *The Ultimate Climax*: Elite guardians and supreme archetypes from all 16 domains converge for the final test.
    - *Total Pool*: Pinnacle SSR and boss tier guardians.
    - *Boss*: Đấng Sáng Thế & Bát Kỳ Thần Thoại.

### 2. Intra-Chapter Pacing Formula (The 60/40 -> 75/25 -> 50/50 -> Boss Rule)
Each 10-level chapter progresses along a deliberate cognitive adaptation curve:
- **Levels 1–3 (Frontier Crossing):** 60% new realm characters + 40% familiar Vanguard/expedition characters. Smooth onboarding prevents visual shock.
- **Levels 4–7 (Heart of Realm):** 75% local primary theme + 25% secondary sister theme. Deep immersion into the chapter's unique mythology.
- **Levels 8–9 (Elite Convergence):** 50% Primary + 50% Sister theme across maximum grid dimensions (8x12), testing broad pattern recognition.
- **Level 10 (Realm Climax):** Dedicated Mythological Boss with themed HP, disruptive skills, and signature elite guards.

### 3. Vanguard Ambassadors (Narrative Thread)
To maintain emotional connection, a core cohort of 4 canonical traveling companions (`inari_kitsune`, `nekomata_calico`, `bake_danuki`, `kappa_cucumber`) accompany the player across the dimensions, appearing as rare friendly tiles across all non-Japanese chapters.

### 4. Rebranding Alignment
The project subtitle is updated to **"LINH THÚ ONET • HUYỀN THOẠI NỐI THÚ 2003 • VIỄN CHINH VẠN GIỚI (495 THẦN THÚ)"** to celebrate the expansive 495-character multiverse while honoring classic 2003 Onet gameplay.

## Consequences
- 100% utilization of all 495 existing hand-drawn character assets with zero new drawing requirements.
- Zero boards will ever experience character exhaustion or visual repetition.
- Rich narrative progression that remains thrilling and unpredictable across all 100 levels.
