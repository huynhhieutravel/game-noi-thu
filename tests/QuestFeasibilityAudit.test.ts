import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/LevelManager';
import { DifficultyLevel } from '../src/types';

describe('Comprehensive 100-Level Quest Feasibility & Anti-Impossible QA Suite', () => {
  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  describe('1. Immediate Target: Màn 3 Stone Quest Resolution', () => {
    it('Màn 3 Easy must NEVER ask to break stones when 0 stones exist', () => {
      const easyConfig = LevelManager.getLevelConfig(3, 'yokai', 'easy');
      const stoneCount = easyConfig.modifiers?.stoneCount || 0;
      expect(stoneCount).toBe(0);

      const quests = easyConfig.quests || [];
      expect(quests.length).toBe(3);

      // Quest 2 must be an achievable skill challenge, NOT break_stone
      const stoneQuests = quests.filter(q => q.type === 'break_stone');
      expect(stoneQuests.length, 'Màn 3 Easy must not contain any break_stone quest!').toBe(0);

      // Verify all 3 quests are completely feasible
      quests.forEach(q => {
        expect(['clear', 'combo', 'no_booster', 'no_shuffle', 'time_left']).toContain(q.type);
      });
    });

    it('Màn 3 Medium and Hard must have stones on the board if break_stone is requested', () => {
      const medConfig = LevelManager.getLevelConfig(3, 'yokai', 'medium');
      const hardConfig = LevelManager.getLevelConfig(3, 'yokai', 'hard');

      const medStone = medConfig.modifiers?.stoneCount || 0;
      const hardStone = hardConfig.modifiers?.stoneCount || 0;

      expect(medStone).toBeGreaterThanOrEqual(2);
      expect(hardStone).toBeGreaterThanOrEqual(2);

      const medStoneQuest = medConfig.quests?.find(q => q.type === 'break_stone');
      const hardStoneQuest = hardConfig.quests?.find(q => q.type === 'break_stone');

      if (medStoneQuest) {
        expect(medStone).toBeGreaterThanOrEqual(medStoneQuest.target);
      }
      if (hardStoneQuest) {
        expect(hardStone).toBeGreaterThanOrEqual(hardStoneQuest.target);
      }
    });
  });

  describe('2. Exhaustive Audit: 100 Levels x 3 Difficulties (300 Configurations)', () => {
    it('every single level and difficulty must guarantee 100% physically achievable quests', () => {
      let totalQuestsChecked = 0;

      for (let lvl = 1; lvl <= 100; lvl++) {
        for (const diff of difficulties) {
          const config = LevelManager.getLevelConfig(lvl, 'yokai', diff);
          const quests = config.quests || [];

          expect(quests.length, `Level ${lvl} [${diff}] missing quests`).toBeGreaterThanOrEqual(3);

          const mods = config.modifiers || {};
          const stoneCount = mods.stoneCount || 0;
          const iceCount = mods.iceCount || 0;
          const lockCount = mods.lockCount || 0;

          // 1. Verify obstacle requirements vs actual board contents
          for (const q of quests) {
            totalQuestsChecked++;

            if (q.type === 'break_stone') {
              expect(
                stoneCount,
                `Level ${lvl} [${diff}] requires ${q.target} stones but board only has ${stoneCount} stones!`
              ).toBeGreaterThanOrEqual(q.target);
              expect(stoneCount).toBeGreaterThan(0);
            }

            if (q.type === 'break_ice') {
              expect(
                iceCount,
                `Level ${lvl} [${diff}] requires ${q.target} ice blocks but board only has ${iceCount} ice!`
              ).toBeGreaterThanOrEqual(q.target);
              expect(iceCount).toBeGreaterThan(0);
            }

            if (q.type === 'rescue_cages') {
              expect(
                lockCount,
                `Level ${lvl} [${diff}] requires ${q.target} cages/locks but board only has ${lockCount} locks!`
              ).toBeGreaterThanOrEqual(q.target);
              expect(lockCount).toBeGreaterThan(0);
            }

            if (q.type === 'time_left' && !config.isStopwatch) {
              expect(
                q.target,
                `Level ${lvl} [${diff}] time_left target (${q.target}s) >= timeLimit (${config.timeLimit}s)!`
              ).toBeLessThan(config.timeLimit);
            }

            // Description must be meaningful and non-empty
            expect(q.description.trim().length).toBeGreaterThan(5);
          }

          // 2. Verify quest diversity (no duplicate non-clear types)
          const nonClearTypes = quests.map(q => q.type).filter(t => t !== 'clear');
          const uniqueTypes = new Set(nonClearTypes);
          expect(
            uniqueTypes.size,
            `Level ${lvl} [${diff}] has duplicate quest types: ${JSON.stringify(nonClearTypes)}`
          ).toBe(nonClearTypes.length);
        }
      }

      expect(totalQuestsChecked).toBe(900); // 300 configs * 3 quests = 900 verified quests
    });
  });

  describe('3. Unit Test: sanitizeQuestsForDifficulty Edge Cases', () => {
    it('seamlessly falls back to combo when an obstacle quest has zero obstacles', () => {
      const sanitized = LevelManager.sanitizeQuestsForDifficulty(
        [
          { id: 'q1', type: 'clear', target: 1, description: 'Clear' },
          { id: 'q2', type: 'break_stone', target: 3, description: 'Break 3 rocks' },
          { id: 'q3', type: 'time_left', target: 30, description: 'Time left' }
        ],
        { stoneCount: 0 },
        'easy',
        100,
        false
      );

      expect(sanitized[1].type).toBe('combo');
      expect(sanitized[1].target).toBe(4); // Easy combo target
    });

    it('clamps obstacle target down if fewer obstacles exist than originally demanded', () => {
      const sanitized = LevelManager.sanitizeQuestsForDifficulty(
        [
          { id: 'q1', type: 'clear', target: 1, description: 'Clear' },
          { id: 'q2', type: 'break_ice', target: 6, description: 'Break 6 ice' },
          { id: 'q3', type: 'no_booster', target: 0, description: 'No booster' }
        ],
        { iceCount: 2 },
        'medium',
        100,
        false
      );

      expect(sanitized[1].type).toBe('break_ice');
      expect(sanitized[1].target).toBe(2);
      expect(sanitized[1].description).toContain('2');
    });

    it('diversifies duplicate combo quests into no_booster', () => {
      const sanitized = LevelManager.sanitizeQuestsForDifficulty(
        [
          { id: 'q1', type: 'clear', target: 1, description: 'Clear' },
          { id: 'q2', type: 'combo', target: 5, description: 'Combo x5' },
          { id: 'q3', type: 'break_stone', target: 2, description: 'Break 2 rocks' } // 0 stones -> would become combo
        ],
        { stoneCount: 0 },
        'easy',
        100,
        false
      );

      expect(sanitized[1].type).toBe('combo');
      expect(sanitized[2].type).toBe('no_booster');
    });
  });
});
