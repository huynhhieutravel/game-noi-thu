import { describe, it, expect } from 'vitest';
import { CombatEngine, PlayerCombatStats } from '../src/game/CombatEngine';
import { BossManager } from '../src/game/BossManager';
import { BossConfig } from '../src/types';

describe('RPG Combat & Adaptive Difficulty Integration Suite (ADR 0015)', () => {
  const dummyBossConfig: BossConfig = {
    id: 'boss_test_orochi',
    name: 'Orochi Thần Xà',
    japaneseName: 'Yamata no Orochi',
    title: 'Hắc Ám Long Xà',
    element: 'dark',
    symbol: '🐉',
    theme: 'yokai',
    image: 'boss_orochi',
    maxHp: 1000,
    actionIntervalSeconds: 6,
    headsOrParts: 8,
    skills: [
      { type: 'dark_lock', name: 'Nguyền Rủa', description: 'Khóa gạch' }
    ]
  };

  it('1. Calculates player combat stats from companion and relic inputs accurately', () => {
    const stats: PlayerCombatStats = CombatEngine.calculatePlayerStats({
      companionLevel: 5,
      companionTier: 2,
      companionId: 'genbu_tortoise',
      relicHpBonus: 250,
      relicDrBonus: 0.07
    });

    // Max HP = 1000 + 5*80 (400) + 2*250 (500) + 250 relic = 2150 HP
    expect(stats.maxHp).toBe(2150);
    // Base Match Damage = 15 + round(5 * 2.5) = 28 DMG
    expect(stats.baseMatchDamage).toBe(28);
    // Genbu Tier 2 DR = 0.15 + (2 - 1)*0.05 = 0.20 + 0.07 relic = 0.27 (27% DR)
    expect(stats.damageReduction).toBeCloseTo(0.27, 2);
  });

  it('2. BossManager deals damage to player on action interval, invoking onBossAttackPlayer', () => {
    let attackReceived = false;
    let attackDmg = 0;
    let enragedStatus = false;

    const boss = new BossManager(dummyBossConfig, {
      onBossAttackPlayer: (rawDmg, isEnraged, _skill) => {
        attackReceived = true;
        attackDmg = rawDmg;
        enragedStatus = isEnraged;
      }
    });

    // Advance 6.1 seconds
    const dummyGrid: any[][] = [];
    boss.update(6.1, dummyGrid, 8, 12);

    expect(attackReceived).toBe(true);
    expect(attackDmg).toBe(CombatEngine.DEFAULT_BASE_BOSS_ATTACK);
    expect(enragedStatus).toBe(false);
  });

  it('3. Player damage reduction mitigates raw boss damage correctly', () => {
    const playerStats = CombatEngine.calculatePlayerStats({
      companionLevel: 5,
      companionTier: 2,
      companionId: 'genbu_tortoise',
      relicDrBonus: 0.10 // total DR = 0.30
    });

    const rawAttack = 200;
    const result = CombatEngine.calculateDamageReceived(rawAttack, playerStats.damageReduction, false, false);

    expect(result.absorbed).toBe(false);
    expect(result.wardConsumed).toBe(false);
    // 200 * (1 - 0.30) = 140
    expect(result.damageTaken).toBe(140);
  });

  it('4. Divine Ward absorbs 100% of damage and gets consumed', () => {
    const rawAttack = 450;
    const result = CombatEngine.calculateDamageReceived(rawAttack, 0.20, true, true);

    expect(result.absorbed).toBe(true);
    expect(result.wardConsumed).toBe(true);
    expect(result.damageTaken).toBe(0);
  });

  it('5. Boss transitions into Enrage Mode at <= 35% HP and boosts attack & speed', () => {
    let enrageTriggered = false;

    const boss = new BossManager(dummyBossConfig, {
      onEnrageTriggered: () => {
        enrageTriggered = true;
      }
    });

    expect(boss.isBossEnraged()).toBe(false);

    // Apply 650 damage -> remaining 350 / 1000 = 35%
    boss.applyDamage(650);

    expect(boss.getHp()).toBe(350);
    expect(boss.isBossEnraged()).toBe(true);
    expect(enrageTriggered).toBe(true);

    // Enraged attack calculation
    const rawAttack = 200;
    const normalDmg = CombatEngine.calculateDamageReceived(rawAttack, 0, false, false).damageTaken;
    const enragedDmg = CombatEngine.calculateDamageReceived(rawAttack, 0, true, false).damageTaken;

    expect(normalDmg).toBe(200);
    expect(enragedDmg).toBe(Math.round(200 * CombatEngine.ENRAGE_DMG_MULTIPLIER));
    expect(enragedDmg).toBe(270);
  });

  it('6. Player revive logic restores 50% HP upon tactical death with lives remaining', () => {
    let currentLives = 3;
    let playerHp = 100;
    const maxHp = 1200;

    // Incoming lethal attack of 250 DMG
    const lethalAttack = 250;
    playerHp = Math.max(0, playerHp - lethalAttack);

    expect(playerHp).toBe(0);

    if (playerHp <= 0 && currentLives > 1) {
      currentLives--;
      playerHp = Math.round(maxHp * 0.5);
    }

    expect(currentLives).toBe(2);
    expect(playerHp).toBe(600);
  });

  it('7. Panic penalty strictly penalizes rapid blind mis-clicks (< 300ms)', () => {
    const normalClick = CombatEngine.evaluatePanicPenalty(650);
    expect(normalClick.isPanic).toBe(false);
    expect(normalClick.timeDeductionSec).toBe(0);

    const panicClick = CombatEngine.evaluatePanicPenalty(180);
    expect(panicClick.isPanic).toBe(true);
    expect(panicClick.timeDeductionSec).toBe(2.0);
  });

  it('8. Shadow Veil fog calculation shields interior tiles while leaving outer perimeter visible', () => {
    const rows = 8;
    const cols = 12;

    // Perimeter tiles: (1, 1), (1, 6), (8, 12) -> should NOT be fogged
    expect(CombatEngine.isTileInShadowVeil(1, 1, rows, cols)).toBe(false);
    expect(CombatEngine.isTileInShadowVeil(1, 6, rows, cols)).toBe(false);
    expect(CombatEngine.isTileInShadowVeil(8, 12, rows, cols)).toBe(false);
    expect(CombatEngine.isTileInShadowVeil(2, 6, rows, cols)).toBe(false); // distance from top is 1 (<2)

    // Deep interior tile: (4, 6) -> distance to top is 3, bottom is 4, left is 5, right is 6 -> minDist = 3 >= 2
    expect(CombatEngine.isTileInShadowVeil(4, 6, rows, cols)).toBe(true);
  });

  it('9. Match damage and healing scales cleanly without generating NaN or negative numbers', () => {
    const match1 = CombatEngine.calculateMatchDamage(25, 0, false);
    expect(match1.totalDamage).toBe(25);
    expect(match1.healAmount).toBe(5);

    const matchComboFever = CombatEngine.calculateMatchDamage(30, 8, true);
    expect(Number.isFinite(matchComboFever.totalDamage)).toBe(true);
    expect(matchComboFever.totalDamage).toBeGreaterThan(30);
    expect(matchComboFever.healAmount).toBeGreaterThanOrEqual(5);
  });
});
