# Báo Cáo QA & Kiểm Định Chất Lượng Toàn Diện: Phase 3 (RPG Combat & Adaptive Difficulty Engine)

**Ngày kiểm thử:** 21/10/2026  
**Dự án:** Yokai Onet (Foxy Pair / Nối Thú Linh Thú)  
**Tiêu chuẩn kiến trúc:** [ADR 0015: RPG Combat and Adaptive Difficulty Engine](file:///Users/huynhtronghieu/Documents/game/noi-thu/docs/adr/0015-rpg-combat-and-adaptive-difficulty-engine.md)  
**Tài liệu thuật toán:** [ALGORITHM_WIKI_COMBAT_AND_DIFFICULTY.md](file:///Users/huynhtronghieu/Documents/game/noi-thu/docs/ALGORITHM_WIKI_COMBAT_AND_DIFFICULTY.md)  
**Báo cáo viên:** AI Pair Programmer & QA Lead Engineer  

---

## 1. Tổng Quan Kết Quả Kiểm Định (Executive Summary)

| Hạng mục kiểm tra | Công cụ / Phương thức | Kết quả | Trạng thái |
| :--- | :--- | :--- | :---: |
| **Unit & Integration Tests** | Vitest Test Suite (20 test files) | **185/185 Tests Passed (100%)** | ✅ PASS |
| **TypeScript Strict Checking** | `npx tsc --noEmit` | **0 Lỗi Type Checking** | ✅ PASS |
| **Production Bundle Compilation** | `npm run build` (Vite v6.4.4) | **Build hoàn tất trong 8.47s (0 Error)** | ✅ PASS |
| **Live Browser Runtime Stress Test** | Chrome DevTools MCP (`runChaosStressTest`) | **60 Actions, 0 Errors, 60+ FPS** | ✅ PASS |
| **Bidirectional Boss Combat HP** | Live Scene Inspection | **Sát thương 2 chiều hoạt động chính xác** | ✅ PASS |
| **Boss Enrage Phase (<35% HP)** | Live In-Game Simulation | **Tự động kích hoạt, sát thương +35%** | ✅ PASS |
| **Hộ Thể & Hồi Sinh (Divine Ward / Revive)** | Live In-Game Simulation | **Chặn đòn 100%, Hồi sinh 50% HP chuẩn xác** | ✅ PASS |
| **Multi-Vector Pressure (Hard Mode)** | Unit + Runtime Engine | **Sương mù Shadow Veil, Xung lực trọng lực, Phạt hoảng loạn** | ✅ PASS |
| **Native iOS App Compilation** | Xcode 16 + devicectl | **Build Succeeded & Signed** | ✅ PASS |

---

## 2. Chi Tiết Các Bộ Test Suite Tự Động (20 Test Files / 185 Tests)

1. `tests/CombatEngine.test.ts` (11 tests) — Kiểm tra công thức toán học HP, Damage Reduction (Cap 60%), Boss Dynamic Scaling, Enrage Threshold, Panic Click, Shadow Veil.
2. `tests/RPGCombatEngineIntegration.test.ts` (9 tests) — Kiểm tra tích hợp sâu giữa `CombatEngine`, `BossManager`, hồi sinh và cơ chế chặn đòn Divine Ward.
3. `tests/ComprehensiveQABugs.test.ts` (22 tests) — Kiểm tra không phát sinh lỗi hồi quy ở các bug kinh điển.
4. `tests/DeepAutomatedLevelSolver.test.ts` (17 tests) — Giải lập thuật toán giải tự động trên các màn chơi.
5. `tests/MultiLevelSimulation10to100.test.ts` (17 tests) — Mô phỏng pacing và khả năng vượt ải từ màn 10 đến 100.
6. `tests/RegressionAuditFix.test.ts` (14 tests) — Rà soát các lỗi layout, modal và HUD.
7. `tests/UILayoutAndDataAuditor.test.ts` (18 tests) — Kiểm định kích thước viewport retina và tỉ lệ hiển thị.
8. `tests/DifficultyProgression.test.ts` (13 tests) — Kiểm tra đường cong độ khó Easy / Medium / Hard.
9. `tests/SaveSystem.test.ts` (10 tests) — Lưu trữ tiến trình, xu, sao, mảnh linh thú và cổ vật.
10. `tests/RelicEconomyAndBossDamage.test.ts` (7 tests) — Kiểm tra kinh tế cổ vật và hệ số sát thương boss.
11. `tests/LevelManager.test.ts` (7 tests) — Khởi tạo màn chơi, scaling HP và Attack của Boss.
12. `tests/PathFinder.test.ts` (6 tests) — Thuật toán dò đường 0, 1, 2 khúc gãy Onet.
13. `tests/TypographyCurrency.test.ts` (6 tests) — Định dạng tiền tệ và typography design tokens.
14. `tests/TopRowMatchingAndInput.test.ts` (5 tests) — Xử lý chạm input hàng trên cùng không bị chạm thanh header.
15. `tests/ColorsDesignTokens.test.ts` (5 tests) — Bảng màu chuẩn hóa HSL và Hex.
16. `tests/Phase2AuditRegression.test.ts` (5 tests) — Kiểm thử hồi quy Phase 2.
17. `tests/LootManager.test.ts` (5 tests) — Cơ chế rơi đồ sau mỗi màn chơi.
18. `tests/BoardGenerator.test.ts` (4 tests) — Sinh bàn cờ đảm bảo tính giải được (solvability).
19. `tests/ChaosMonkeyRunner.test.ts` (3 tests) — Giả lập click ngẫu nhiên tốc độ cao.
20. `tests/Full100LevelsSolvability.test.ts` (1 test) — Đảm bảo 100/100 màn chơi luôn giải được.

---

## 3. Nhật Ký Kiểm Thử Thực Tế Trực Tiếp Trên Trình Duyệt (Chrome DevTools MCP)

1. **Khởi động Boss Orochi (Hard Difficulty):**
   - Boss Max HP: `960 HP`
   - Boss Attack Power: `120 DMG`
   - Player Combat HP: `1330 / 1330 HP` (Cấp 1 Tier 1: 1000 + 80 + 250)
   - Thanh Combat HP hiển thị viền đỏ sơn mài sang trọng trên bục Linh Thú, kèm chỉ số `% Damage Reduction`.

2. **Kiểm tra Boss tấn công người chơi:**
   - Khi hết chu kỳ hồi chiêu (Action Interval), Boss giáng đòn.
   - Player HP: `1090 HP` $\to$ `970 HP` (Sát thương ghi nhận chính xác: `-120 HP`).
   - Màn hình rung lắc giật nảy (`shake 180ms`), viền chớp đỏ (`flash 150ms`), hiệu ứng chữ nổi `"-120 HP"` bay lên sinh động.

3. **Kiểm tra Pha Cuồng Bạo (Enrage Phase at $\le 35\%$ HP):**
   - Gây 650 sát thương lên Boss $\to$ HP Boss còn `310 / 960 HP` ($32.2\% \le 35\%$).
   - Boss lập tức gầm thét, kích hoạt trạng thái **🔥 CUỒNG BẠO 🔥**:
     - Sprite Boss rung giật phóng to x1.12.
     - Dòng chữ cảnh báo `🔥 TRẠNG THÁI CUỒNG BẠO 🔥` đỏ rực xuất hiện.
     - Sát thương đòn đánh tăng từ `120` lên `162 DMG` ($120 \times 1.35 = 162$).
     - Chu kỳ tung đòn giảm $50\%$ tốc độ hồi, tạo sức ép sinh tồn dồn dập.

4. **Kiểm tra Linh Phù Hộ Thể (Divine Ward):**
   - Khi kích hoạt khiên hộ thể Huyền Vũ (`hasDivineWard = true`).
   - Boss giáng đòn chí mạng cuồng nộ `162 DMG`.
   - Kết quả: **Chặn đứng 100% sát thương (Damage Taken = 0)**.
   - Linh Phù tiêu hao an toàn, phát âm thanh hiệu ứng thần khí `playRelicBurst()`.

5. **Kiểm tra Cơ Chế Tử Trận & Hồi Sinh (Tactical Revive):**
   - Giáng đòn sát thương kết liễu `800 DMG` khi người chơi còn `688 HP`.
   - Máu chạm đáy `0 HP`.
   - Hệ thống tự động tiêu hao 1 Mạng sống (`lives` từ 8 giảm còn 7).
   - Người chơi hồi sinh tức thì với **$50\%$ Máu tối đa (`665 / 1330 HP`)**.
   - Thông báo hồi sinh xuất hiện trên màn hình, trận chiến tiếp diễn mượt mà.

6. **Kiểm tra Sương Mù Ảo Ảnh (Shadow Veil Fog) & Phá Sương Bằng Combo:**
   - Các ô gạch nằm sâu bên trong tâm bàn cờ ở độ khó Hard được phủ sương mây `🌫️`.
   - Khi người chơi kết nối các cặp gạch biên, sương mù kề cận tự động tan biến (`revealFogNearTile`).
   - Khi đạt Combo $\ge 4$, luồng sóng năng lượng kích hoạt `unveilAllFog()`, quét sạch toàn bộ sương mù trên bàn cờ.

7. **Kiểm tra Phạt Hoảng Loạn (Panic Click Penalty):**
   - Khi click sai liên tiếp với tốc độ $< 300\text{ms}$, hệ thống kích hoạt hình phạt hoảng loạn: trừ thêm 2 giây và cảnh báo haptic mạnh.

---

## 4. Biên Dịch & Đóng Gói Ứng Dụng (Build & Device Artifacts)

- **Web Assets Bundle:** Đã biên dịch hoàn chỉnh qua `npm run build` và đồng bộ qua Capacitor iOS (`npx cap sync ios`).
- **Xcode iOS Native Build:** Đã biên dịch thành công qua `xcodebuild` (`** BUILD SUCCEEDED **`).
- **Binary Target:** `/Users/huynhtronghieu/Documents/game/noi-thu/ios/build/Build/Products/Debug-iphoneos/App.app`.
- **Lưu ý cài đặt lên máy thật:** Khi bạn mở khóa màn hình iPhone (Loki Phone), chỉ cần chạy lệnh `./scripts/install_to_phone.sh`, app sẽ được truyền qua cáp/WiFi vào iPhone trong 3 giây.
