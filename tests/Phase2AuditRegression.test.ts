import { describe, it, expect, beforeEach } from 'vitest';
import { BossManager } from '../src/game/BossManager';
import { RelicManager } from '../src/game/RelicManager';
import { CompanionManager, COMPANION_TIERS } from '../src/game/CompanionManager';
import { SaveSystem } from '../src/systems/SaveSystem';
import { BoardModifiers } from '../src/game/BoardModifiers';
import bossesData from '../src/data/bosses.json';
import { BossConfig, TileState } from '../src/types';

describe('Phase 2 Deep Audit & Regression Verification', () => {
  beforeEach(() => {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.clear === 'function') {
        localStorage.clear();
      }
    } catch {}
    SaveSystem.getInstance().resetSave();
  });

  // -------------------------------------------------------------
  // Test 1: BossManager 48/48 skills coverage & maxHp getter
  // -------------------------------------------------------------
  it('covers all 48 boss skills without exception and exposes maxHp getter', () => {
    const allBosses = bossesData as BossConfig[];
    expect(allBosses.length).toBe(16);

    for (const boss of allBosses) {
      expect(boss.skills.length).toBe(3);
      const bm = new BossManager(boss);

      // Verify maxHp and hp getters
      expect(bm.maxHp).toBe(boss.maxHp);
      expect(bm.hp).toBe(boss.maxHp);
      expect(bm.getMaxHp()).toBe(boss.maxHp);
      expect(bm.getHp()).toBe(boss.maxHp);

      // Create a test 6x6 grid
      const grid: TileState[][] = [];
      for (let r = 0; r <= 7; r++) {
        grid[r] = [];
        for (let c = 0; c <= 7; c++) {
          grid[r][c] = {
            r,
            c,
            characterId: (r >= 1 && r <= 6 && c >= 1 && c <= 6) ? 'char_test' : null,
            modifier: 'none',
            isCleared: (r === 0 || r === 7 || c === 0 || c === 7),
            isLocked: false
          };
        }
      }

      // Trigger each skill of this boss
      for (const skill of boss.skills) {
        expect(() => {
          bm.triggerBossAction(grid, 6, 6);
        }).not.toThrow();
      }
    }
  });

  // -------------------------------------------------------------
  // Test 2: RelicManager calculates %HP using exact boss maxHp
  // -------------------------------------------------------------
  it('calculates %HP damage in RelicManager using bossManager.maxHp accurately', () => {
    const rm = RelicManager.getInstance();
    const bossRelic = rm.getAllRelics().find(r => r.bossHpPercent && r.bossHpPercent > 0);
    expect(bossRelic).toBeDefined();

    if (bossRelic) {
      let damagedAmount = 0;
      const mockScene = {
        bossManager: {
          maxHp: 1200,
          getMaxHp: () => 1200
        },
        damageBoss: (dmg: number) => {
          damagedAmount = dmg;
        },
        boardManager: {
          executeSequentialAutoMatches: () => {}
        },
        score: 0
      };

      const result = rm.executeRelicSkill(bossRelic.id, mockScene);
      expect(result.success).toBe(true);
      const expectedPercentDmg = Math.floor(1200 * (bossRelic.bossHpPercent || 0));
      const expectedTotal = Math.min(bossRelic.maxCapDmg || 9999, (bossRelic.effectValue || 200) + expectedPercentDmg);
      expect(damagedAmount).toBe(expectedTotal);
    }
  });

  // -------------------------------------------------------------
  // Test 3: MovableTileData retains luckyPotTimeLeft on gravity shifts
  // -------------------------------------------------------------
  it('preserves luckyPotTimeLeft during board gravity shifts', () => {
    const grid: TileState[][] = [];
    for (let r = 0; r <= 5; r++) {
      grid[r] = [];
      for (let c = 0; c <= 5; c++) {
        grid[r][c] = {
          r,
          c,
          characterId: 'char_test',
          modifier: 'none',
          isCleared: false,
          isLocked: false
        };
      }
    }

    // Set a lucky pot tile at (2, 2)
    grid[2][2].isLuckyPot = true;
    grid[2][2].luckyPotTimeLeft = 7.5;
    grid[1][2].isCleared = true; // cleared slot above to slide into on up movement

    BoardModifiers.applyMovement(grid, 4, 4, 'up');

    // Tile moved up from (2, 2) to (1, 2)
    expect(grid[1][2].isLuckyPot).toBe(true);
    expect(grid[1][2].luckyPotTimeLeft).toBe(7.5);
  });

  // -------------------------------------------------------------
  // Test 4: SaveSystem Currency Validation rejects NaN, negative, and invalid values
  // -------------------------------------------------------------
  it('protects currency and boosters against NaN, null, and negative values', () => {
    const save = SaveSystem.getInstance();
    const initialCoins = save.getCoins();
    const initialDiamonds = save.getDiamonds();

    // 1. Negative & NaN addCoins
    save.addCoins(-500);
    expect(save.getCoins()).toBe(initialCoins);
    save.addCoins(NaN);
    expect(save.getCoins()).toBe(initialCoins);
    save.addCoins(Infinity);
    expect(save.getCoins()).toBe(initialCoins);

    // 2. Negative & NaN spendCoins
    expect(save.spendCoins(-100)).toBe(false);
    expect(save.spendCoins(NaN)).toBe(false);
    expect(save.getCoins()).toBe(initialCoins);

    // 3. Negative & NaN addDiamonds
    save.addDiamonds(-50);
    expect(save.getDiamonds()).toBe(initialDiamonds);
    save.addDiamonds(NaN);
    expect(save.getDiamonds()).toBe(initialDiamonds);

    // 4. Negative & NaN spendDiamonds
    expect(save.spendDiamonds(-20)).toBe(false);
    expect(save.spendDiamonds(NaN)).toBe(false);
    expect(save.getDiamonds()).toBe(initialDiamonds);

    // 5. Booster purchases with invalid cost/count
    const bRes1 = save.buyBoosterWithCoins('hint', -1, 100);
    expect(bRes1.success).toBe(false);
    const bRes2 = save.buyBoosterWithCoins('hint', 1, -100);
    expect(bRes2.success).toBe(false);
    const bRes3 = save.buyBoosterWithCoins('hint', NaN, 100);
    expect(bRes3.success).toBe(false);

    // 6. Valid purchase
    const validRes = save.buyBoosterWithCoins('hint', 1, 100);
    expect(validRes.success).toBe(true);
    expect(save.getCoins()).toBe(initialCoins - 100);
  });

  // -------------------------------------------------------------
  // Test 5: COMPANION_TIERS has genbu_tortoise directly mapped
  // -------------------------------------------------------------
  it('directly provides tier info for genbu_tortoise in COMPANION_TIERS', () => {
    expect(COMPANION_TIERS['genbu_tortoise']).toBeDefined();
    expect(COMPANION_TIERS['genbu_tortoise'][1]).toBeDefined();
    expect(COMPANION_TIERS['genbu_tortoise'][2]).toBeDefined();
    expect(COMPANION_TIERS['genbu_tortoise'][3]).toBeDefined();

    const tierInfo = CompanionManager.getTierInfo('genbu_tortoise', 2);
    expect(tierInfo.tier).toBe(2);
    expect(tierInfo.tierName).toBe('Trưởng Thành');
  });
});
