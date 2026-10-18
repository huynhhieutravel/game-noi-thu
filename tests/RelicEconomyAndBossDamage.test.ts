import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';
import { RelicManager } from '../src/game/RelicManager';
import { BossManager } from '../src/game/BossManager';

describe('Relic Economy & Boss Combat QA Suite', () => {
  let save: SaveSystem;

  beforeEach(() => {
    save = SaveSystem.getInstance();
    save.resetSave();
  });

  describe('1. Tiered Shard Requirements (40 / 75 / 100)', () => {
    it('should require 40 shards for Common relics', () => {
      expect(save.getRelicRequiredShards('relic_yokai_01')).toBe(40);
      expect(save.getRelicRequiredShards('relic_greece_01')).toBe(40);
      expect(save.getRelicRequiredShards('relic_pirate_01')).toBe(40);
    });

    it('should require 75 shards for Rare relics', () => {
      expect(save.getRelicRequiredShards('relic_yokai_02')).toBe(75);
      expect(save.getRelicRequiredShards('relic_greece_02')).toBe(75);
      expect(save.getRelicRequiredShards('relic_space_02')).toBe(75);
    });

    it('should require 100 shards for Epic relics', () => {
      expect(save.getRelicRequiredShards('relic_yokai_03')).toBe(100);
      expect(save.getRelicRequiredShards('relic_greece_03')).toBe(100);
      expect(save.getRelicRequiredShards('relic_ultimate_03')).toBe(100);
    });

    it('should unlock Common relic at 40 shards and consume 40 shards', () => {
      const res = save.addRelicShards('relic_egypt_01', 40);
      expect(res.currentShards).toBe(40);
      expect(res.canUnlock).toBe(true);

      const unlocked = save.unlockOrUpgradeRelic('relic_egypt_01');
      expect(unlocked).toBe(true);
      expect(save.getRelicStar('relic_egypt_01')).toBe(1);
      expect(save.getRelicShards('relic_egypt_01')).toBe(0);
    });

    it('should unlock Rare relic at 75 shards', () => {
      save.addRelicShards('relic_yokai_02', 74);
      expect(save.unlockOrUpgradeRelic('relic_yokai_02')).toBe(false);

      save.addRelicShards('relic_yokai_02', 1);
      expect(save.unlockOrUpgradeRelic('relic_yokai_02')).toBe(true);
      expect(save.getRelicStar('relic_yokai_02')).toBe(1);
    });
  });

  describe('2. Surplus Shards Conversion (+25 / +50 / +100 Xu)', () => {
    it('should auto-convert shards to coins when relic has reached Star 5', () => {
      // Force relic to 5 stars
      save.addRelicShards('relic_yokai_01', 500);
      for (let i = 0; i < 5; i++) {
        save.unlockOrUpgradeRelic('relic_yokai_01');
      }
      expect(save.getRelicStar('relic_yokai_01')).toBe(5);

      const initialCoins = save.getCoins();
      // Add 2 shards of Common (rate: 25 xu/shard)
      const res = save.addRelicShards('relic_yokai_01', 2);
      expect(res.surplusCoins).toBe(50);
      expect(save.getCoins()).toBe(initialCoins + 50);
    });
  });

  describe('3. Relic Hybrid Boss Damage Execution', () => {
    it('should execute Kusanagi hybrid damage [180 + 4% Max HP] on BossManager', () => {
      const mockBoss = new BossManager({
        id: 'yamata_orochi',
        name: 'Bát Kỳ Đại Xà',
        title: 'Cự Trùm',
        maxHp: 1000,
        headsOrParts: 8,
        actionIntervalSeconds: 7,
        themeColor: 0xff0000,
        skills: []
      });

      const mockScene: any = {
        bossManager: mockBoss,
        levelConfig: { levelNumber: 10 },
        damageBoss(dmg: number) {
          mockBoss.applyDamage(dmg);
        },
        time: {
          delayedCall: (_delay: number, fn: Function) => fn()
        },
        boardManager: {
          getGrid: () => [],
          getRows: () => 8,
          getCols: () => 10,
          getPortals: () => [],
          performShuffle: () => {},
          clearSelection: () => {},
          findAvailableMatch: () => null,
          triggerPairClear: () => {}
        },
        comboSystem: { registerMatch: () => {} },
        showNotice: () => {},
        audio: { playSelect: () => {}, playVictory: () => {} },
        haptic: { medium: () => {} }
      };

      let playedArchetype = '';
      mockScene.audio.playRelicBurst = (arch: string) => {
        playedArchetype = arch;
      };

      // Kusanagi: 180 + 4% of 2000 Max HP = 180 + 80 = 260 damage
      const relicMgr = RelicManager.getInstance();
      const res = relicMgr.executeRelicSkill('relic_yokai_03', mockScene);
      expect(res.success).toBe(true);

      // Boss initial HP: 1000 -> after 260 damage -> 740
      const currentHp = (mockBoss as any).currentHp;
      expect(currentHp).toBe(740);

      // Verify dynamic mythic soundscape triggered with 'boss' archetype
      expect(playedArchetype).toBe('boss');
    });
  });
});
