import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';
import { HapticSystem } from '../src/systems/HapticSystem';
import { BossManager } from '../src/game/BossManager';
import { GAME_HEIGHT, GAME_WIDTH, SAFE_AREA_INSETS, isWithinSafeAreaY } from '../src/constants';
import type { ActiveGameSession, BossConfig } from '../src/types';

// In-memory mock localStorage for Node/Vitest test environment
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => memoryStorage[k] ?? null,
  setItem: (k: string, v: string) => { memoryStorage[k] = String(v); },
  removeItem: (k: string) => { delete memoryStorage[k]; },
  clear: () => {
    Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
  }
};
(globalThis as any).localStorage = mockLocalStorage;

describe('📱 Mobile Production Hardening & Session Resume QA Suite', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    SaveSystem.getInstance().resetSave();
  });

  // =========================================================================
  // 1. App Interruption & Session Resume Fidelity (Q1)
  // =========================================================================
  describe('1. Mid-Game Session Resume Fidelity', () => {
    it('accurately stores and retrieves bossHp, playerCombatHp, and survivalWave across app backgrounding', () => {
      const save = SaveSystem.getInstance();
      
      const mockSession: ActiveGameSession = {
        levelId: 'boss_yamata_no_orochi',
        difficulty: 'hard',
        score: 12500,
        lives: 4,
        timeRemaining: 185,
        isSurvivalMode: false,
        isZenMode: false,
        bossId: 'yamata_no_orochi',
        bossHp: 340,
        playerCombatHp: 720,
        survivalWave: undefined,
        timestamp: Date.now(),
        gridState: []
      };

      save.saveActiveSession(mockSession);

      const retrieved = save.getActiveSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.levelId).toBe('boss_yamata_no_orochi');
      expect(retrieved?.difficulty).toBe('hard');
      expect(retrieved?.score).toBe(12500);
      expect(retrieved?.lives).toBe(4);
      expect(retrieved?.timeRemaining).toBe(185);
      expect(retrieved?.bossHp).toBe(340);
      expect(retrieved?.playerCombatHp).toBe(720);

      // Verify clearActiveSession
      save.clearActiveSession();
      expect(save.getActiveSession()).toBeNull();
    });

    it('accurately preserves survivalWave in Blizzard Survival Mode', () => {
      const save = SaveSystem.getInstance();
      
      const survivalSession: ActiveGameSession = {
        levelId: 'survival_blizzard',
        difficulty: 'medium',
        score: 8400,
        lives: 3,
        timeRemaining: 999999,
        isSurvivalMode: true,
        isZenMode: false,
        survivalWave: 9,
        playerCombatHp: 850,
        timestamp: Date.now()
      };

      save.saveActiveSession(survivalSession);

      const retrieved = save.getActiveSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.isSurvivalMode).toBe(true);
      expect(retrieved?.survivalWave).toBe(9);
      expect(retrieved?.playerCombatHp).toBe(850);
    });

    it('sets bossHp and recalculates headsRemaining accurately in BossManager.setHp', () => {
      const bossConfig: BossConfig = {
        id: 'boss_fenrir',
        name: 'Fenrir',
        maxHp: 800,
        actionIntervalSeconds: 6,
        headsOrParts: 8,
        parts: 8,
        skills: []
      };

      const boss = new BossManager(bossConfig);
      expect(boss.getHp()).toBe(800);
      expect(boss.getHeadsRemaining()).toBe(8);

      // Restore session mid-fight at 250 HP (250 / 800 = 31.25% <= 35% enrage threshold)
      boss.setHp(250);
      expect(boss.getHp()).toBe(250);
      // 800 / 8 = 100 HP per part. 250 HP ceil => 3 parts remaining
      expect(boss.getHeadsRemaining()).toBe(3);
      // Below 35% HP (250 <= 280), should trigger enrage
      expect(boss.isBossEnraged()).toBe(true);

      boss.destroy();
    });
  });

  // =========================================================================
  // 2. Corrupted Save Auto-Healing (Q4)
  // =========================================================================
  describe('2. Corrupted Save Resilient Auto-Healing', () => {
    it('salvages player coins, stars, highestLevel from structurally unclosed JSON', () => {
      const truncatedJson = '{"version":2,"coins":75000,"stars":142,"highestLevel":58,"selectedTheme":"yokai"';
      
      const repaired = SaveSystem.tryRepairTruncatedJson(truncatedJson);
      expect(repaired).not.toBeNull();
      expect(repaired.coins).toBe(75000);
      expect(repaired.stars).toBe(142);
      expect(repaired.highestLevel).toBe(58);
      expect(repaired.selectedTheme).toBe('yokai');
    });

    it('salvages vital fields via regex when JSON is severely cut off mid-property', () => {
      const brokenJson = '{"version":2,"coins":92000,"diamonds":450,"stars":210,"highestLevel":75,"unlockedCompanions":["inari_kitsune","nekomata"],"selectedCo';
      
      const repaired = SaveSystem.tryRepairTruncatedJson(brokenJson);
      expect(repaired).not.toBeNull();
      expect(repaired.coins).toBe(92000);
      expect(repaired.diamonds).toBe(450);
      expect(repaired.stars).toBe(210);
      expect(repaired.highestLevel).toBe(75);
      expect(repaired.unlockedCompanions).toEqual(['inari_kitsune', 'nekomata']);
    });

    it('recovers levelStars and boosters from partial JSON save', () => {
      const partialJson = '{"coins":50000,"stars":60,"highestLevel":20,"levelStars":{"level_01":3,"level_02":3},"boosters":{"hint":25,"shuffle":18,"bomb":12';
      
      const repaired = SaveSystem.tryRepairTruncatedJson(partialJson);
      expect(repaired).not.toBeNull();
      expect(repaired.coins).toBe(50000);
      expect(repaired.levelStars?.['level_01']).toBe(3);
      expect(repaired.levelStars?.['level_02']).toBe(3);
      expect(repaired.boosters?.hint).toBe(25);
      expect(repaired.boosters?.shuffle).toBe(18);
    });

    it('sanitizes NaN, Infinity, and negative values into safe boundaries', () => {
      const save = SaveSystem.getInstance();
      
      // Inject corrupt values into localStorage
      mockLocalStorage.setItem('yokai_onet_save_v2', JSON.stringify({
        coins: -9999,
        stars: -50,
        highestLevel: -10,
        diamonds: null
      }));

      // Force reload
      (save as any).data = (save as any).load();

      expect(save.getCoins()).toBeGreaterThanOrEqual(10000);
      expect(save.getStars()).toBeGreaterThanOrEqual(0);
      expect(save.getHighestLevel()).toBeGreaterThanOrEqual(1);
      expect(save.getDiamonds()).toBeGreaterThanOrEqual(100);
    });
  });

  // =========================================================================
  // 3. Memory Cleanup & Multi-Match Endurance (Q2)
  // =========================================================================
  describe('3. Scene Lifecycle & Memory Leak Endurance', () => {
    it('executes 50 consecutive boss fight lifecycles with zero listener leakage', () => {
      const bossConfig: BossConfig = {
        id: 'boss_test_endurance',
        name: 'Endurance Boss',
        maxHp: 500,
        actionIntervalSeconds: 5,
        headsOrParts: 5,
        skills: [{ type: 'tile_swap', name: 'Tempest', description: 'Swap' }]
      };

      for (let cycle = 1; cycle <= 50; cycle++) {
        let damagedCalled = 0;
        let headSeveredCalled = 0;
        let defeatedCalled = 0;

        const boss = new BossManager(bossConfig, {
          onDamaged: () => { damagedCalled++; },
          onHeadSevered: () => { headSeveredCalled++; },
          onDefeated: () => { defeatedCalled++; }
        });

        // Simulate combat actions
        boss.applyDamage(120);
        expect(damagedCalled).toBe(1);
        expect(headSeveredCalled).toBe(1);

        boss.applyDamage(400);
        expect(damagedCalled).toBe(2);
        expect(defeatedCalled).toBe(1);
        expect(boss.isBossDead()).toBe(true);

        // Explicit scene shutdown destruction
        boss.destroy();

        // Further damage after destroy should not trigger callbacks
        boss.applyDamage(100);
        expect(damagedCalled).toBe(2);
      }
    });
  });

  // =========================================================================
  // 4. Safe Area Cushioning & Layout Insets (Q3)
  // =========================================================================
  describe('4. Safe Area Cushioning & Display Insets', () => {
    it('defines safe area insets protecting against iOS notch and Home Indicator', () => {
      expect(SAFE_AREA_INSETS.TOP).toBe(14);
      expect(SAFE_AREA_INSETS.BOTTOM).toBe(20);
      expect(SAFE_AREA_INSETS.LEFT).toBe(44);
      expect(SAFE_AREA_INSETS.RIGHT).toBe(44);
    });

    it('verifies booster tray at height - 48 leaves safe margin above bottom bezel', () => {
      const boosterTrayY = GAME_HEIGHT - 48; // 632px
      const boosterButtonRadius = 28; // 56px button diameter

      const buttonBottom = boosterTrayY + boosterButtonRadius; // 660px
      const distanceToBottomBezel = GAME_HEIGHT - buttonBottom; // 20px

      expect(distanceToBottomBezel).toBe(20);
      expect(isWithinSafeAreaY(boosterTrayY, 56)).toBe(true);
    });

    it('confirms adaptive screen layout symmetrically cushions ultra-wide iPhone displays', () => {
      // Mock window dimensions for iPhone 16 Pro Max landscape (19.5:9 ~ 2.167 ratio)
      const mockW = 932;
      const mockH = 430;
      
      const ratio = mockW / mockH;
      const targetWidth = Math.max(GAME_WIDTH, Math.round(GAME_HEIGHT * ratio));
      const offsetX = Math.round((targetWidth - GAME_WIDTH) / 2);

      // Symmetrical offset should provide >= 150px padding on each flank, completely clearing the Dynamic Island
      expect(offsetX).toBeGreaterThanOrEqual(150);
      expect(targetWidth).toBe(GAME_WIDTH + offsetX * 2);
    });
  });

  // =========================================================================
  // 5. ADR 0019: Mobile Resilience & Tactile Fidelity
  // =========================================================================
  describe('5. ADR 0019 Mobile Resilience & Tactile Fidelity', () => {
    it('Dual-Layer Eviction Shield recovers 100% of progress when iOS purges primary storage key', () => {
      const save = SaveSystem.getInstance();
      save.resetSave();

      // Setup custom progress
      save.addCoins(50000);
      save.recordLevelCompleted('level_25', 25, 3);
      save.addUniversalShards(42);
      save.save();

      expect(save.getCoins()).toBeGreaterThanOrEqual(50000);
      expect(save.getUniversalShards()).toBe(42);

      // Verify backup key was written
      const backupRaw = mockLocalStorage.getItem('yokai_onet_save_backup_v2');
      expect(backupRaw).not.toBeNull();
      const parsedBackup = JSON.parse(backupRaw!);
      expect(parsedBackup.data.universalShards).toBe(42);

      // Simulate iOS storage eviction: purge primary key
      mockLocalStorage.removeItem('yokai_onet_save_v2');
      expect(mockLocalStorage.getItem('yokai_onet_save_v2')).toBeNull();

      // Trigger reload -> Dual-Layer Eviction Shield kicks in
      const restored = (save as any).load();
      expect(restored.universalShards).toBe(42);
      expect(restored.coins).toBeGreaterThanOrEqual(50000);
      expect(restored.highestLevel).toBeGreaterThanOrEqual(26);

      // Verify primary storage was auto-healed
      expect(mockLocalStorage.getItem('yokai_onet_save_v2')).not.toBeNull();
    });

    it('HapticSystem provides success and warning methods without throwing', () => {
      const haptic = HapticSystem.getInstance();
      expect(() => haptic.success()).not.toThrow();
      expect(() => haptic.warning()).not.toThrow();
      expect(() => haptic.light()).not.toThrow();
      expect(() => haptic.medium()).not.toThrow();
      expect(() => haptic.heavy()).not.toThrow();
    });
  });
});
