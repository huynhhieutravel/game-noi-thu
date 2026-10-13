import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../src/systems/SaveSystem';

describe('SaveSystem', () => {
  beforeEach(() => {
    // Reset or initialize instance
    const save = SaveSystem.getInstance();
    save.resetSave();
  });

  it('should initialize with default save values', () => {
    const save = SaveSystem.getInstance();
    expect(save.getCoins()).toBe(300);
    expect(save.getHighestLevel()).toBe(1);
    expect(save.getStars()).toBe(0);
  });

  it('should correctly add coins and persist', () => {
    const save = SaveSystem.getInstance();
    const newCoins = save.addCoins(250);
    expect(newCoins).toBe(550);
    expect(save.getCoins()).toBe(550);
  });

  it('should complete level and update stars and highest level', () => {
    const save = SaveSystem.getInstance();
    save.recordLevelCompleted('level_01', 1, 3);
    expect(save.getStars()).toBe(3);
    expect(save.getHighestLevel()).toBe(2);
    expect(save.getLevelStars('level_01')).toBe(3);

    // Replay with lower stars should not decrease high score
    save.recordLevelCompleted('level_01', 1, 1);
    expect(save.getLevelStars('level_01')).toBe(3);
    expect(save.getStars()).toBe(3);
  });

  it('should record discovered characters in album', () => {
    const save = SaveSystem.getInstance();
    const isNew = save.discoverCharacter('yamata_no_orochi_boss');
    expect(typeof isNew).toBe('boolean');
    expect(save.isCharacterDiscovered('yamata_no_orochi_boss')).toBe(true);
  });

  it('should export and import save codes accurately across devices', () => {
    const save = SaveSystem.getInstance();
    save.addCoins(700);
    save.recordLevelCompleted('level_05', 5, 3);

    const exportCode = save.exportSaveCode();
    expect(exportCode.startsWith('YOKAI-v1-')).toBe(true);

    // Reset save to simulate moving to a new phone/browser
    save.resetToDefault();
    expect(save.getCoins()).toBe(300);
    expect(save.getHighestLevel()).toBe(1);

    // Import the backup code
    const result = save.importSaveCode(exportCode);
    expect(result.success).toBe(true);
    expect(save.getCoins()).toBe(1000); // 300 initial + 700
    expect(save.getHighestLevel()).toBe(6);
    expect(save.getLevelStars('level_05')).toBe(3);
  });

  it('should reject tampered or invalid save codes', () => {
    const save = SaveSystem.getInstance();
    const exportCode = save.exportSaveCode();

    // Tamper with the code
    const tampered = exportCode.slice(0, -2) + '99';
    const result = save.importSaveCode(tampered);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Checksum mismatch');

    // Reject totally garbage string
    const garbageResult = save.importSaveCode('INVALID-CODE-STRING');
    expect(garbageResult.success).toBe(false);
  });
});
