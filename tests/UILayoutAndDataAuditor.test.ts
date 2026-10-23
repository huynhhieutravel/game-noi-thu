import { describe, it, expect } from 'vitest';
import relicsData from '../src/data/relics.json';
import bossesData from '../src/data/bosses.json';
import charactersData from '../src/data/characters.json';
import { RelicManager, RelicItem } from '../src/game/RelicManager';
import { COMPANIONS, CompanionManager } from '../src/game/CompanionManager';
import { LevelManager } from '../src/game/LevelManager';
import { LootManager } from '../src/game/LootManager';
import { CharacterRegistry } from '../src/game/CharacterRegistry';

describe('Automated UI/UX Layout & Data Auditor (ADR 0013)', () => {
  describe('1. Relic Data & Tier System Integrity', () => {
    const relics = relicsData as RelicItem[];

    it('should have valid fields for all relics in registry', () => {
      expect(relics.length).toBeGreaterThan(0);
      relics.forEach(r => {
        expect(r.id, `Relic missing id`).toBeTruthy();
        expect(r.name, `Relic ${r.id} missing name`).toBeTruthy();
        expect(r.subName, `Relic ${r.id} missing subName`).toBeTruthy();
        expect(r.worldId, `Relic ${r.id} missing worldId`).toBeTruthy();
        expect(r.tier, `Relic ${r.id} missing tier`).toBeTruthy();
        expect(['common', 'rare', 'epic']).toContain(r.tier);
        expect(r.skillName, `Relic ${r.id} missing skillName`).toBeTruthy();
        expect(r.skillDesc, `Relic ${r.id} missing skillDesc`).toBeTruthy();
        expect(r.rageCost, `Relic ${r.id} invalid rageCost`).toBeGreaterThan(0);
        expect(r.shardsRequired, `Relic ${r.id} invalid shardsRequired`).toBeGreaterThan(0);
      });
    });

    it('should strictly align tierName with canonical Vietnamese naming (Hạ Phẩm / Trung Phẩm / Thượng Phẩm)', () => {
      const tierMap: Record<string, string> = {
        common: 'Hạ Phẩm',
        rare: 'Trung Phẩm',
        epic: 'Thượng Phẩm'
      };

      relics.forEach(r => {
        const expected = tierMap[r.tier];
        expect(r.tierName, `Relic ${r.id} tierName mismatch`).toBe(expected);
      });
    });

    it('RelicManager should index all relics and resolve them correctly', () => {
      const manager = RelicManager.getInstance();
      const all = manager.getAllRelics();
      expect(all.length).toBe(relics.length);

      relics.forEach(r => {
        const resolved = manager.getRelicById(r.id);
        expect(resolved, `Failed to resolve ${r.id}`).toBeDefined();
        expect(resolved?.name).toBe(r.name);
      });
    });
  });

  describe('2. Companion Lore & Progression Data Integrity', () => {
    const companionList = Object.values(COMPANIONS);

    it('should configure all 10 canonical mythical companions', () => {
      expect(companionList.length).toBe(10);
      const expectedIds = [
        'inari_kitsune',
        'ryujin_pearl',
        'hi_no_tori',
        'byakko_tiger',
        'genbu_tortoise',
        'kirin_sacred',
        'raiju_thunder',
        'yatagarasu_crow',
        'nekomata_cat',
        'orochi_serpent'
      ];
      expectedIds.forEach(id => {
        expect(COMPANIONS[id], `Missing companion ${id}`).toBeDefined();
      });
    });

    it('every companion must have 5 progression levels with valid descriptions and costs', () => {
      companionList.forEach(c => {
        expect(c.name).toBeTruthy();
        expect(c.title).toBeTruthy();
        expect(c.element).toBeTruthy();
        expect(c.skillName).toBeTruthy();
        expect(c.skillDesc).toBeTruthy();
        expect(c.passiveName).toBeTruthy();
        expect(c.passiveDesc).toBeTruthy();
        expect(c.levels, `Companion ${c.id} missing levels`).toHaveLength(5);

        c.levels.forEach((lvl, idx) => {
          expect(lvl.level).toBe(idx + 1);
          expect(lvl.skillDesc, `${c.id} Lv${lvl.level} missing skillDesc`).toBeTruthy();
          expect(lvl.passiveDesc, `${c.id} Lv${lvl.level} missing passiveDesc`).toBeTruthy();
          expect(lvl.perkSummary, `${c.id} Lv${lvl.level} missing perkSummary`).toBeTruthy();
          expect(lvl.requiredShards).toBeGreaterThanOrEqual(0);
          expect(lvl.requiredCoins).toBeGreaterThanOrEqual(0);

          // No unfinished placeholders
          expect(lvl.skillDesc).not.toMatch(/TODO|placeholder|undefined|null/i);
          expect(lvl.passiveDesc).not.toMatch(/TODO|placeholder|undefined|null/i);
        });
      });
    });
  });

  describe('3. Boss Registry Data Integrity', () => {
    const bosses = bossesData as any[];

    it('should register all 16 world bosses with full stats and skills', () => {
      expect(bosses.length).toBe(16);
      bosses.forEach(b => {
        expect(b.id, `Boss missing id`).toBeTruthy();
        expect(b.name, `Boss ${b.id} missing name`).toBeTruthy();
        expect(b.title, `Boss ${b.id} missing title`).toBeTruthy();
        expect(b.max_hp, `Boss ${b.id} max_hp <= 0`).toBeGreaterThan(0);
        expect(b.parts, `Boss ${b.id} parts <= 0`).toBeGreaterThan(0);
        expect(b.skills, `Boss ${b.id} missing skills`).toBeInstanceOf(Array);
        expect(b.skills.length, `Boss ${b.id} needs at least 2 skills`).toBeGreaterThanOrEqual(2);

        b.skills.forEach((s: any, sIdx: number) => {
          expect(s.name, `Boss ${b.id} skill ${sIdx} missing name`).toBeTruthy();
          expect(s.description, `Boss ${b.id} skill ${sIdx} missing description`).toBeTruthy();
        });
      });
    });

    it('all 16 world bosses must have matching illustration assets on disk', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      bosses.forEach(b => {
        const bossPng = path.resolve(process.cwd(), `public/assets/bosses/${b.id}.png`);
        expect(fs.existsSync(bossPng), `Boss ${b.id} illustration asset missing at ${bossPng}`).toBe(true);
        const stats = fs.statSync(bossPng);
        expect(stats.size, `Boss ${b.id} asset file is empty`).toBeGreaterThan(1000);
      });
    });
  });

  describe('4. Full 1..100 Level Progression & Quest Consistency', () => {
    it('all 100 levels must provide valid configuration across easy, medium, and hard', () => {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl);
        expect(config, `Level ${lvl} returned undefined`).toBeDefined();
        expect(config.levelNumber).toBe(lvl);
        expect(config.title, `Level ${lvl} missing title`).toBeTruthy();
        expect(config.rows).toBeGreaterThanOrEqual(4);
        expect(config.columns).toBeGreaterThanOrEqual(4);
        expect(config.characterPool.length, `Level ${lvl} pool too small`).toBeGreaterThanOrEqual(4);

        // Quests
        expect(config.quests, `Level ${lvl} missing quests`).toHaveLength(3);
        config.quests.forEach((q, qIdx) => {
          expect(q.id, `Level ${lvl} quest ${qIdx} missing id`).toBeTruthy();
          expect(q.description, `Level ${lvl} quest ${qIdx} missing description`).toBeTruthy();
          expect(q.icon, `Level ${lvl} quest ${qIdx} missing icon`).toBeTruthy();
        });

        // Difficulties
        expect(config.difficulties, `Level ${lvl} missing difficulties`).toBeDefined();
        (['easy', 'medium', 'hard'] as const).forEach(diff => {
          const d = config.difficulties[diff];
          expect(d, `Level ${lvl} missing difficulty ${diff}`).toBeDefined();
          expect(d.timeLimit, `Level ${lvl} ${diff} timeLimit <= 0`).toBeGreaterThan(0);
          expect(d.rewardMultiplier, `Level ${lvl} ${diff} rewardMultiplier <= 0`).toBeGreaterThan(0);
        });
      }
    });

    it('no companion character should ever appear in any level matching tile pool (levels 1..100)', () => {
      const companionIds = Object.keys(COMPANIONS);
      for (let lvl = 1; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl);
        const leakedCompanions = config.characterPool.filter(cId => companionIds.includes(cId));
        expect(
          leakedCompanions,
          `Level ${lvl} (${config.title}) incorrectly contains companion(s) in tile matching pool: ${leakedCompanions.join(', ')}`
        ).toEqual([]);
      }
    });
  });

  describe('5. Full 1..100 Loot & Reward Matrix Consistency', () => {
    it('LootManager must return non-NaN, non-undefined loot tables for all 100 levels and 3 difficulties', () => {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const stageConfig = LootManager.getStageLootConfig(lvl);
        expect(stageConfig, `StageLootConfig is undefined for lvl ${lvl}`).toBeDefined();
        expect(stageConfig.levelNumber).toBe(lvl);
        expect(stageConfig.stageName).toBeTruthy();
        expect(stageConfig.rewardsMatrix).toBeDefined();

        (['easy', 'medium', 'hard'] as const).forEach(diff => {
          const r = stageConfig.rewardsMatrix[diff];
          expect(r, `RewardsMatrix missing for lvl ${lvl} ${diff}`).toBeDefined();
          expect(r.exp, `Loot exp invalid for lvl ${lvl} ${diff}`).toBeGreaterThan(0);
          expect(r.coins, `Loot coins invalid for lvl ${lvl} ${diff}`).toBeGreaterThan(0);
          expect(Number.isNaN(r.exp)).toBe(false);
          expect(Number.isNaN(r.coins)).toBe(false);
          expect(r.mainShardPct).toBeTruthy();
          expect(r.subShardPct).toBeTruthy();
          expect(r.itemPct).toBeTruthy();
        });
      }
    });
  });

  describe('6. Design Tokens & Uniform Relic Tier Styles', () => {
    it('RELIC_TIER_STYLES must provide consistent label, colors and backgrounds for all 3 tiers', async () => {
      const { getRelicTierStyle, RELIC_TIER_STYLES } = await import('../src/styles/colors');

      expect(RELIC_TIER_STYLES.common.label).toBe('✦ Hạ Phẩm');
      expect(RELIC_TIER_STYLES.rare.label).toBe('✦ Trung Phẩm');
      expect(RELIC_TIER_STYLES.epic.label).toBe('✦ Thượng Phẩm');

      expect(getRelicTierStyle('common').label).toBe('✦ Hạ Phẩm');
      expect(getRelicTierStyle('rare').label).toBe('✦ Trung Phẩm');
      expect(getRelicTierStyle('epic').label).toBe('✦ Thượng Phẩm');
      expect(getRelicTierStyle(undefined).label).toBe('✦ Hạ Phẩm');
    });
  });

  describe('7. Obstacle Lore & Mechanic Descriptions (ObstacleInfoModal)', () => {
    it('must provide complete title, subtitle, effectDesc, and breakDesc for all obstacle types', async () => {
      const { ObstacleData } = await import('../src/game/ObstacleData');
      const modifiers: Array<'stone' | 'thorn' | 'barricade' | 'web' | 'ice'> = [
        'stone',
        'thorn',
        'barricade',
        'web',
        'ice'
      ];

      modifiers.forEach(mod => {
        const fakeTile: any = {
          r: 1,
          c: 1,
          modifier: mod,
          modifierLevel: 2,
          iceLayers: 2
        };

        const info = ObstacleData.getInfo(fakeTile);
        expect(info, `Obstacle info for ${mod} is undefined`).toBeDefined();
        expect(info.title, `Obstacle ${mod} missing title`).toBeTruthy();
        expect(info.subtitle, `Obstacle ${mod} missing subtitle`).toBeTruthy();
        expect(info.effectDesc, `Obstacle ${mod} missing effectDesc`).toBeTruthy();
        expect(info.breakDesc.length, `Obstacle ${mod} missing breakDesc`).toBeGreaterThanOrEqual(2);
        expect(info.badgeLabel).toBeTruthy();
        expect(info.themeColor).toBeGreaterThan(0);
      });
    });
  });

  describe('8. Character Registry Lore & Symbols Integrity', () => {
    it('all registered characters must have valid metadata, names and non-empty bio', () => {
      const allCharacters = CharacterRegistry.getAll();
      expect(allCharacters.length).toBeGreaterThan(30);

      allCharacters.forEach(c => {
        expect(c.id, 'Character missing id').toBeTruthy();
        expect(c.name, `Character ${c.id} missing name`).toBeTruthy();
        expect(c.symbol, `Character ${c.id} missing symbol`).toBeTruthy();
        expect(c.rarity, `Character ${c.id} missing rarity`).toBeTruthy();
        expect(c.collection, `Character ${c.id} missing collection`).toBeTruthy();
      });
    });
  });

  describe('9. Level Titles & Badges Formatting Integrity', () => {
    it('all 100 level titles should format cleanly without unbalanced or sliced parentheses', () => {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const config = LevelManager.getLevelConfig(lvl);
        const baseTitle = config.title.replace(/^Màn \d+:\s*/, '').replace(/\s*\(.*\)/, '').trim();
        expect(baseTitle.length, `Lvl ${lvl} base title empty`).toBeGreaterThan(0);
        expect(baseTitle).not.toContain('(');
        expect(baseTitle).not.toContain(')');

        const movementNote = config.title.match(/\((.*?)\)/)?.[1];
        if (movementNote) {
          expect(movementNote.trim().length, `Lvl ${lvl} movement note empty`).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('10. HD Resolution & Asset Integrity for Backgrounds and Splash', () => {
    it('all 100 stage backgrounds must exist and be high-resolution assets (>100KB)', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      for (let lvl = 1; lvl <= 100; lvl++) {
        const bgPath = path.resolve(process.cwd(), `public/assets/stages/stage_bg_${lvl}.png`);
        expect(fs.existsSync(bgPath), `Stage background missing for lvl ${lvl} at ${bgPath}`).toBe(true);
        const stats = fs.statSync(bgPath);
        expect(stats.size, `Stage background ${lvl} is too small / low-res`).toBeGreaterThan(100 * 1024);
      }
    });

    it('all 10 boss arena backgrounds must exist and be high-resolution assets (>500KB)', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      for (let a = 1; a <= 10; a++) {
        const arenaPath = path.resolve(process.cwd(), `public/assets/boss_arenas/boss_arena_${a}.png`);
        expect(fs.existsSync(arenaPath), `Boss arena missing at ${arenaPath}`).toBe(true);
        const stats = fs.statSync(arenaPath);
        expect(stats.size, `Boss arena ${a} is too small / low-res`).toBeGreaterThan(500 * 1024);
      }
    });

    it('all 100 stage thumbnails must exist on disk', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      for (let lvl = 1; lvl <= 100; lvl++) {
        const thumbPath = path.resolve(process.cwd(), `public/assets/stages/stage_thumb_${lvl}.jpg`);
        expect(fs.existsSync(thumbPath), `Stage thumb missing for lvl ${lvl} at ${thumbPath}`).toBe(true);
      }
    });

    it('iOS Splash image must exist with valid size', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');

      const splashPath = path.resolve(process.cwd(), 'resources/splash.png');
      expect(fs.existsSync(splashPath), 'Splash screen missing at resources/splash.png').toBe(true);
      const stats = fs.statSync(splashPath);
      expect(stats.size).toBeGreaterThan(50 * 1024);

      const iosSplash = path.resolve(process.cwd(), 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png');
      expect(fs.existsSync(iosSplash), 'iOS xcassets splash missing').toBe(true);
    });
  });

  describe('8. UI/UX Spatial Collision & Bounding-Box Audit', () => {
    const fs = require('node:fs');
    const path = require('node:path');

    it('Companion Pod and Player Combat HP bar must have strictly positive vertical air gap', () => {
      const gameSceneSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/scenes/GameScene.ts'), 'utf-8');

      // Extract Combat HP bar coordinates
      const hpYMatch = gameSceneSrc.match(/private buildPlayerCombatHpBar[\s\S]*?const podY = height - (\d+);[\s\S]*?const podH = (\d+);/);
      expect(hpYMatch, 'Could not find Player Combat HP bar coordinates').toBeTruthy();
      const hpPodDistFromBottom = parseInt(hpYMatch![1], 10);
      const hpPodH = parseInt(hpYMatch![2], 10);
      const hpBottomEdgeDistFromBottom = hpPodDistFromBottom - hpPodH / 2; // e.g. 78 - 10 = 68

      // Extract Companion Pod coordinates
      const compYMatch = gameSceneSrc.match(/private buildCompanionPod[\s\S]*?const podH = (\d+);[\s\S]*?const podY = height - (\d+);/);
      expect(compYMatch, 'Could not find Companion Pod coordinates').toBeTruthy();
      const compPodH = parseInt(compYMatch![1], 10);
      const compPodDistFromBottom = parseInt(compYMatch![2], 10);
      const compTopEdgeDistFromBottom = compPodDistFromBottom + compPodH / 2; // e.g. 37 + 27 = 64

      // HP bottom must be higher than Companion top (larger distance from bottom means higher on screen)
      const gap = hpBottomEdgeDistFromBottom - compTopEdgeDistFromBottom;
      expect(gap, `HP bar overlaps Companion Pod by ${-gap}px`).toBeGreaterThanOrEqual(4);
    });

    it('Companion Pod internal name and energy bar must have positive vertical clearance', () => {
      const gameSceneSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/scenes/GameScene.ts'), 'utf-8');

      const nameYMatch = gameSceneSrc.match(/companionNameText = this\.add\.text\(-36,\s*(-?\d+)/);
      const barYMatch = gameSceneSrc.match(/buildCompanionPod[\s\S]*?const barY = (\d+);/);
      expect(nameYMatch).toBeTruthy();
      expect(barYMatch).toBeTruthy();

      const nameY = parseInt(nameYMatch![1], 10); // -11 (origin 0.5) -> bottom edge is ~ -4
      const barY = parseInt(barYMatch![1], 10); // 5
      const nameBottom = nameY + 7;
      const airGap = barY - nameBottom;
      expect(airGap, 'Companion name text collides with energy bar').toBeGreaterThanOrEqual(6);
    });

    it('Relic Pod and Companion Pod must be vertically and symmetrically aligned with zero text collisions', () => {
      const gameSceneSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/scenes/GameScene.ts'), 'utf-8');

      // Check Relic Pod dimensions
      const relicMatch = gameSceneSrc.match(/buildRelicPod[\s\S]*?const podW = (\d+);[\s\S]*?const podH = (\d+);[\s\S]*?const podX = width - (\d+);[\s\S]*?const podY = height - (\d+);/);
      expect(relicMatch).toBeTruthy();
      const rPodW = parseInt(relicMatch![1], 10);
      const rPodH = parseInt(relicMatch![2], 10);
      const rMarginX = parseInt(relicMatch![3], 10);
      const rDistY = parseInt(relicMatch![4], 10);

      expect(rPodW).toBe(216);
      expect(rPodH).toBe(54);
      expect(rMarginX).toBe(142); // Symmetrical to Companion podX = 142
      expect(rDistY).toBe(37); // Aligned to Companion podY = height - 37

      // Check Relic Name & Bar separation
      const relicNameMatch = gameSceneSrc.match(/relicNameText = this\.add\.text\(-36,\s*(-?\d+)/);
      const relicBarMatch = gameSceneSrc.match(/buildRelicPod[\s\S]*?const barY = (\d+);/);
      expect(relicNameMatch).toBeTruthy();
      expect(relicBarMatch).toBeTruthy();

      const rNameY = parseInt(relicNameMatch![1], 10);
      const rBarY = parseInt(relicBarMatch![1], 10);
      const rNameBottom = rNameY + 7;
      expect(rBarY - rNameBottom, 'Relic name collides with energy bar').toBeGreaterThanOrEqual(6);
    });

    it('Board layout bottomReserved must be >= 100 to guarantee board frame never collides with combat HUD', () => {
      const boardSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/game/Board.ts'), 'utf-8');
      const bottomMatch = boardSrc.match(/const bottomReserved = (\d+);/);
      expect(bottomMatch, 'Could not find bottomReserved in Board.ts').toBeTruthy();
      const bottomReserved = parseInt(bottomMatch![1], 10);
      expect(bottomReserved).toBeGreaterThanOrEqual(100);
    });

    it('Boss Header name and Boss HP bar must maintain clear vertical separation', () => {
      const gameSceneSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/scenes/GameScene.ts'), 'utf-8');
      const nameMatch = gameSceneSrc.match(/buildBossHeader[\s\S]*?const nameText = this\.add\.text\(contentX,\s*(-?\d+)/);
      const hpBgMatch = gameSceneSrc.match(/buildBossHeader[\s\S]*?hpBg\.fillRoundedRect\(contentX - \d+,\s*(-?\d+)/);
      expect(nameMatch).toBeTruthy();
      expect(hpBgMatch).toBeTruthy();

      const nameY = parseInt(nameMatch![1], 10); // -21 (origin 0.5, font 15) -> bottom edge is ~ -13.5
      const hpBgY = parseInt(hpBgMatch![1], 10); // -6
      const nameBottom = nameY + 7.5;
      expect(hpBgY - nameBottom, 'Boss name collides with Boss HP bar').toBeGreaterThanOrEqual(5);
    });
  });
});


