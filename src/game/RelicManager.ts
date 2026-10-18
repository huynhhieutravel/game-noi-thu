import relicsData from '../data/relics.json';

export type RelicTier = 'common' | 'rare' | 'epic';

export interface RelicItem {
  id: string;
  name: string;
  subName: string;
  chapter: number;
  worldId: string;
  tier: RelicTier;
  tierName: string;
  archetype?: string;
  archetypeName?: string;
  shardsRequired?: number;
  surplusExchangeRate?: number;
  powerBudget?: number;
  icon: string;
  image: string;
  skillName: string;
  skillDesc: string;
  rageCost: number;
  effectType: string;
  effectValue: number;
  bossHpPercent?: number;
  maxCapDmg?: number;
  promptVisual: string;
}

export class RelicManager {
  private static instance: RelicManager;
  private relics: RelicItem[];
  private relicMap: Map<string, RelicItem>;

  private constructor() {
    this.relics = relicsData as RelicItem[];
    this.relicMap = new Map();
    for (const r of this.relics) {
      this.relicMap.set(r.id, r);
    }
  }

  public static getInstance(): RelicManager {
    if (!RelicManager.instance) {
      RelicManager.instance = new RelicManager();
    }
    return RelicManager.instance;
  }

  public getAllRelics(): RelicItem[] {
    return this.relics;
  }

  public getRelicById(id: string): RelicItem | undefined {
    return this.relicMap.get(id);
  }

  public getRelicsByWorld(worldId: string): RelicItem[] {
    return this.relics.filter(r => r.worldId === worldId);
  }

  public getRelicsByChapter(chapter: number): RelicItem[] {
    return this.relics.filter(r => r.chapter === chapter);
  }

  public getDefaultRelicForChapter(chapter: number): RelicItem | undefined {
    const list = this.getRelicsByChapter(chapter);
    return list[0]; // Hạ phẩm mặc định
  }

  public getTierColor(tier: RelicTier): { stroke: number; fill: number; hexStr: string } {
    switch (tier) {
      case 'common':
        return { stroke: 0x2ec4b6, fill: 0x163832, hexStr: '#2ec4b6' }; // Lục/Lam
      case 'rare':
        return { stroke: 0x9d4edd, fill: 0x2b1055, hexStr: '#c77dff' }; // Tím
      case 'epic':
      default:
        return { stroke: 0xffd700, fill: 0x3d2b00, hexStr: '#ffd700' }; // Vàng kim
    }
  }

  public executeRelicSkill(relicId: string, scene: any): { success: boolean; message: string } {
    try {
      const relic = this.getRelicById(relicId) || this.relics[0];
      if (!relic) return { success: false, message: 'Thần Khí không tồn tại' };

      // 🎵 Play Dynamic Mythic Soundscape based on Relic Archetype
      try {
        if (scene.audio && typeof scene.audio.playRelicBurst === 'function') {
          scene.audio.playRelicBurst(relic.archetype || 'boss');
        }
      } catch (err) {
        console.warn('[RelicManager] playRelicBurst error:', err);
      }

      switch (relic.effectType) {
        case 'auto_match': {
          const count = relic.effectValue || 2;
          if (scene.boardManager?.executeSequentialAutoMatches) {
            scene.boardManager.executeSequentialAutoMatches(count, (p1: any, p2: any) => {
              scene.score = (scene.score || 0) + 250;
              if (scene.scoreText) scene.scoreText.setText(`${scene.score} PTS`);
              try {
                const wPos = scene.boardManager.gridToWorld(p1.r, p1.c);
                scene.feverParticles?.explode(16, wPos.x, wPos.y);
              } catch {}
            });
          }
          return { success: true, message: `✨ ${relic.skillName}: Tự động kết nối ${count} cặp!` };
        }

        case 'clear_traps': {
          if (scene.boardManager?.destroyObstaclesOfType) {
            scene.boardManager.destroyObstaclesOfType(['web', 'thorn'], 99);
          }
          scene.timeRemaining = (scene.timeRemaining || 0) + (relic.effectValue || 6);
          return { success: true, message: `🍶 ${relic.skillName}: Dọn sạch cạm bẫy & +${relic.effectValue}s!` };
        }

        case 'destroy_ice_stone': {
          if (scene.boardManager?.destroyObstaclesOfType) {
            scene.boardManager.destroyObstaclesOfType(['ice', 'stone'], relic.effectValue || 4);
          }
          if (scene.bossManager && typeof scene.damageBoss === 'function') {
            scene.damageBoss(150);
          }
          return { success: true, message: `👁️ ${relic.skillName}: Thiêu rụi tối đa 4 Băng/Đá & làm mù Boss 5s!` };
        }

        case 'heal_time': {
          scene.lives = Math.min(10, (scene.lives || 3) + (relic.effectValue || 1));
          scene.timeRemaining = (scene.timeRemaining || 0) + 8;
          return { success: true, message: `☥ ${relic.skillName}: Hồi +1 Mạng & +8s!` };
        }

        case 'freeze_time': {
          scene.timeRemaining = (scene.timeRemaining || 0) + (relic.effectValue || 6);
          return { success: true, message: `⏳ ${relic.skillName}: Ngưng đọng thời gian +${relic.effectValue}s!` };
        }

        case 'lightning_smite':
        case 'boss_damage_cross':
        case 'trishula_strike':
        case 'kraken_slam':
        case 'sword_formation':
        case 'sovereign_edict':
        case 'quantum_beam':
        case 'chaos_singularity':
        case 'genesis_apocalypse': {
          const baseDmg = relic.effectValue || 200;
          const bossMaxHp = scene.bossManager?.maxHp || 2000;
          const percentDmg = relic.bossHpPercent ? Math.floor(bossMaxHp * relic.bossHpPercent) : 0;
          const totalDmg = Math.min(relic.maxCapDmg || 9999, baseDmg + percentDmg);

          if (scene.bossManager && typeof scene.damageBoss === 'function') {
            scene.damageBoss(totalDmg);
          }

          // Trigger safe matched pairs based on archetype (guarantee tile parity)
          const freePairs = relic.effectType === 'genesis_apocalypse' ? 4 : (relic.effectType === 'chaos_singularity' ? 3 : 2);
          if (scene.boardManager?.executeSequentialAutoMatches) {
            scene.boardManager.executeSequentialAutoMatches(freePairs, (p1: any, p2: any) => {
              scene.score = (scene.score || 0) + 250;
              if (scene.scoreText) scene.scoreText.setText(`${scene.score} PTS`);
            });
          }
          return { success: true, message: `⚡ ${relic.skillName}: Giáng ${totalDmg} sát thương (${baseDmg} + %HP) lên Trùm!` };
        }

        case 'magma_surge': {
          // Resolve exactly 2 valid pairs safely
          if (scene.boardManager?.executeSequentialAutoMatches) {
            scene.boardManager.executeSequentialAutoMatches(2, (p1: any, p2: any) => {
              scene.score = (scene.score || 0) + 300;
              if (scene.scoreText) scene.scoreText.setText(`${scene.score} PTS`);
            });
          }
          return { success: true, message: `❤️‍🔥 ${relic.skillName}: Giải phóng 2 cặp hợp lệ & nung chảy giáp Boss (+20% sát thương)!` };
        }

        default: {
          // Universal fallback: trigger bomb or auto match
          if (scene.boardManager?.triggerBomb) {
            scene.boardManager.triggerBomb();
          }
          scene.score = (scene.score || 0) + 200;
          return { success: true, message: `✨ ${relic.skillName} kích hoạt!` };
        }
      }
    } catch (err) {
      console.error('[RelicManager] executeRelicSkill error:', err);
      return { success: false, message: 'Kỹ Năng Thần Khí kích hoạt thất bại' };
    }
  }
}
