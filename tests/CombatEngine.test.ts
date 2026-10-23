import { describe, it, expect } from 'vitest';
import { CombatEngine } from '../src/game/CombatEngine';

describe('CombatEngine & Adaptive Difficulty Math Suite (ADR 0015)', () => {
  describe('1. Player Combat HP & Match Damage Scaling', () => {
    it('calculates baseline Level 1 Tier 1 stats correctly', () => {
      const stats = CombatEngine.calculatePlayerStats({ companionLevel: 1, companionTier: 1 });
      // 1000 base + 1*80 + 1*250 = 1330 HP
      expect(stats.maxHp).toBe(1330);
      // 15 base + round(1 * 2.5) = 18 DMG
      expect(stats.baseMatchDamage).toBe(18);
      expect(stats.damageReduction).toBe(0);
    });

    it('calculates max Level 10 Tier 3 stats with Relic bonuses correctly', () => {
      const stats = CombatEngine.calculatePlayerStats({
        companionLevel: 10,
        companionTier: 3,
        companionId: 'genbu_tortoise',
        relicHpBonus: 500,
        relicDrBonus: 0.15
      });

      // 1000 base + 10*80 (800) + 3*250 (750) + 500 relic = 3050 HP
      expect(stats.maxHp).toBe(3050);
      // 15 base + round(10 * 2.5 = 25) = 40 DMG
      expect(stats.baseMatchDamage).toBe(40);
      // Genbu Tier 3 inherent DR (0.15 + 2*0.05 = 0.25) + 0.15 relic = 0.40 (40% DR)
      expect(stats.damageReduction).toBe(0.40);
    });

    it('strictly enforces the 60% hard cap on Damage Reduction', () => {
      const stats = CombatEngine.calculatePlayerStats({
        companionLevel: 10,
        companionTier: 3,
        companionId: 'genbu_tortoise',
        relicDrBonus: 0.50 // Exceeds cap
      });

      expect(stats.damageReduction).toBeLessThanOrEqual(0.60);
      expect(stats.damageReduction).toBe(0.60);
    });
  });

  describe('2. Boss Dynamic Scaling & Enrage Phase Mechanics', () => {
    it('scales Boss HP and Attack Power progressively across Levels and Difficulties', () => {
      const easyLvl10 = CombatEngine.calculateBossStats(10, 'easy');
      const medLvl10 = CombatEngine.calculateBossStats(10, 'medium');
      const hardLvl10 = CombatEngine.calculateBossStats(10, 'hard');

      expect(medLvl10.maxHp).toBeGreaterThan(easyLvl10.maxHp);
      expect(hardLvl10.maxHp).toBeGreaterThan(medLvl10.maxHp);
      expect(hardLvl10.attackPower).toBeGreaterThan(medLvl10.attackPower);

      // Verify cooldown speeds: Hard (3s) faster than Medium (4.5s) faster than Easy (7s)
      expect(hardLvl10.actionIntervalSeconds).toBe(3.0);
      expect(medLvl10.actionIntervalSeconds).toBe(4.5);
      expect(easyLvl10.actionIntervalSeconds).toBe(7.0);
    });

    it('verifies Apex Milestone Boss at Level 100 on Hard difficulty', () => {
      const apexBoss = CombatEngine.calculateBossStats(100, 'hard');
      // HP: 600 * (1 + 100/15) * 3.0 ~ 13800
      expect(apexBoss.maxHp).toBeGreaterThanOrEqual(13000);
      // DMG: 120 * (1 + 100/20) * 2.2 ~ 1584
      expect(apexBoss.attackPower).toBeGreaterThanOrEqual(1500);
      expect(apexBoss.actionIntervalSeconds).toBe(3.0);
    });

    it('triggers Enrage Mode when Boss HP drops to <= 35%', () => {
      expect(CombatEngine.checkEnrage(350, 1000)).toBe(true);
      expect(CombatEngine.checkEnrage(349, 1000)).toBe(true);
      expect(CombatEngine.checkEnrage(351, 1000)).toBe(false);
      expect(CombatEngine.checkEnrage(700, 1000)).toBe(false);
    });
  });

  describe('3. Match Damage & Healing Output', () => {
    it('multiplies match damage with combo streak and fever rush', () => {
      const baseDmg = 20;

      // 0 Combo, Normal
      const normal = CombatEngine.calculateMatchDamage(baseDmg, 0, false);
      expect(normal.totalDamage).toBe(20);
      expect(normal.healAmount).toBe(5);

      // 5 Combo, Normal
      const combo5 = CombatEngine.calculateMatchDamage(baseDmg, 5, false);
      // Combo mult = 1.0 + 5*0.15 = 1.75 -> 20 * 1.75 = 35
      expect(combo5.totalDamage).toBe(35);
      expect(combo5.healAmount).toBe(5 + Math.floor(5 * 1.5)); // 12 HP heal

      // 5 Combo + Fever (1.5x)
      const fever = CombatEngine.calculateMatchDamage(baseDmg, 5, true);
      expect(fever.totalDamage).toBe(Math.round(35 * 1.5)); // 53 DMG
    });
  });

  describe('4. Damage Received & Divine Ward Mitigation', () => {
    it('absorbs 100% of damage when Divine Ward is active', () => {
      const res = CombatEngine.calculateDamageReceived(500, 0.2, false, true);
      expect(res.damageTaken).toBe(0);
      expect(res.absorbed).toBe(true);
      expect(res.wardConsumed).toBe(true);
    });

    it('applies damage reduction and enrage boost correctly', () => {
      // 200 raw attack, 30% DR, normal mode
      const resNormal = CombatEngine.calculateDamageReceived(200, 0.30, false, false);
      // 200 * (1 - 0.30) = 140 DMG
      expect(resNormal.damageTaken).toBe(140);
      expect(resNormal.absorbed).toBe(false);

      // 200 raw attack, 30% DR, Enraged mode (+35% attack = 270)
      const resEnraged = CombatEngine.calculateDamageReceived(200, 0.30, true, false);
      // 270 * 0.70 = 189 DMG
      expect(resEnraged.damageTaken).toBe(189);
    });
  });

  describe('5. Multi-Vector Pressure: Shadow Veil & Panic Penalty', () => {
    it('detects inner tiles for Shadow Veil fog shroud on 8x10 board', () => {
      const rows = 8;
      const cols = 10;

      // Perimeter tiles (distance 0 or 1 from boundary) -> NOT in shadow veil
      expect(CombatEngine.isTileInShadowVeil(1, 1, rows, cols)).toBe(false);
      expect(CombatEngine.isTileInShadowVeil(1, 5, rows, cols)).toBe(false);
      expect(CombatEngine.isTileInShadowVeil(2, 2, rows, cols)).toBe(false);

      // Deep interior tiles (distance >= 2 from all 4 borders) -> IN shadow veil
      expect(CombatEngine.isTileInShadowVeil(3, 3, rows, cols)).toBe(true);
      expect(CombatEngine.isTileInShadowVeil(4, 5, rows, cols)).toBe(true);
      expect(CombatEngine.isTileInShadowVeil(5, 6, rows, cols)).toBe(true);
    });

    it('applies panic penalty on frantic clicks under 350ms requiring 3 consecutive mis-clicks', () => {
      // 2 mis-clicks under 350ms does not trigger penalty (prevents false positive on touchscreen)
      const twoClicks = CombatEngine.evaluatePanicPenalty(150, 2);
      expect(twoClicks.isPanic).toBe(false);

      // 3 consecutive mis-clicks under 350ms triggers penalty
      const panic = CombatEngine.evaluatePanicPenalty(150, 3);
      expect(panic.isPanic).toBe(true);
      expect(panic.timeDeductionSec).toBe(2.0);

      const deliberate = CombatEngine.evaluatePanicPenalty(500, 3);
      expect(deliberate.isPanic).toBe(false);
      expect(deliberate.timeDeductionSec).toBe(0);
    });
  });
});
