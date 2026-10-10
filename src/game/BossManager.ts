import { BossConfig, TileState } from '../types';

export interface BossEvents {
  onDamaged?: (currentHp: number, maxHp: number, damage: number) => void;
  onHeadSevered?: (headsLeft: number, totalHeads: number) => void;
  onBossSkillTriggered?: (skillName: string, description: string) => void;
  onDefeated?: () => void;
}

export class BossManager {
  private config: BossConfig;
  private currentHp: number;
  private headsRemaining: number;
  private totalHeads: number;
  private actionTimer: number = 0;
  private isDefeated: boolean = false;
  private events: BossEvents;

  constructor(config: BossConfig, events: BossEvents = {}) {
    this.config = config;
    this.currentHp = config.maxHp;
    this.totalHeads = config.headsOrParts || 8;
    this.headsRemaining = this.totalHeads;
    this.events = events;
    this.actionTimer = config.actionIntervalSeconds;
  }

  public applyDamage(damage: number): { defeated: boolean; headCut: boolean } {
    if (this.isDefeated) return { defeated: true, headCut: false };

    const oldHp = this.currentHp;
    this.currentHp = Math.max(0, this.currentHp - damage);

    this.events.onDamaged?.(this.currentHp, this.config.maxHp, damage);

    // Calculate heads based on remaining HP proportion
    const hpPerHead = this.config.maxHp / this.totalHeads;
    const newHeads = Math.ceil(this.currentHp / hpPerHead);
    let headCut = false;

    if (newHeads < this.headsRemaining && this.headsRemaining > 0) {
      this.headsRemaining = newHeads;
      headCut = true;
      this.events.onHeadSevered?.(this.headsRemaining, this.totalHeads);
    }

    if (this.currentHp <= 0) {
      this.isDefeated = true;
      this.events.onDefeated?.();
      return { defeated: true, headCut: true };
    }

    return { defeated: false, headCut };
  }

  public update(deltaSeconds: number, grid: TileState[][], rows: number, cols: number): void {
    if (this.isDefeated) return;

    this.actionTimer -= deltaSeconds;
    if (this.actionTimer <= 0) {
      this.triggerBossAction(grid, rows, cols);
      this.actionTimer = this.config.actionIntervalSeconds;
    }
  }

  private triggerBossAction(grid: TileState[][], rows: number, cols: number): void {
    if (this.config.skills.length === 0) return;

    const skill = this.config.skills[Math.floor(Math.random() * this.config.skills.length)];

    switch (skill.type) {
      case 'ice_curse': {
        // Freeze up to 2 active non-ice tiles
        const candidates: TileState[] = [];
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'ice' && tile.modifier !== 'stone') {
              candidates.push(tile);
            }
          }
        }
        for (let i = 0; i < Math.min(2, candidates.length); i++) {
          const randIdx = Math.floor(Math.random() * candidates.length);
          const t = candidates.splice(randIdx, 1)[0];
          t.modifier = 'ice';
          t.iceLayers = 2;
        }
        break;
      }

      case 'rock_blocker': {
        // Spawn 1 stone obstacle in an already cleared slot to block paths
        const clearedSlots: TileState[] = [];
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            if (tile.isCleared) {
              clearedSlots.push(tile);
            }
          }
        }
        if (clearedSlots.length > 0) {
          const randSlot = clearedSlots[Math.floor(Math.random() * clearedSlots.length)];
          randSlot.modifier = 'stone';
          randSlot.modifierLevel = 3;
          randSlot.isCleared = false;
          randSlot.characterId = null;
        }
        break;
      }

      case 'tile_swap': {
        // Swap 2 random pairs of active tiles
        const activeTiles: TileState[] = [];
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r][c];
            if (!tile.isCleared && tile.characterId && tile.modifier !== 'stone') {
              activeTiles.push(tile);
            }
          }
        }
        if (activeTiles.length >= 2) {
          const idx1 = Math.floor(Math.random() * activeTiles.length);
          let idx2 = Math.floor(Math.random() * activeTiles.length);
          while (idx2 === idx1 && activeTiles.length > 1) {
            idx2 = Math.floor(Math.random() * activeTiles.length);
          }
          const tmp = activeTiles[idx1].characterId;
          activeTiles[idx1].characterId = activeTiles[idx2].characterId;
          activeTiles[idx2].characterId = tmp;
        }
        break;
      }
    }

    this.events.onBossSkillTriggered?.(skill.name, skill.description);
  }

  public getHp(): number {
    return this.currentHp;
  }

  public getMaxHp(): number {
    return this.config.maxHp;
  }

  public getHeadsRemaining(): number {
    return this.headsRemaining;
  }

  public getTotalHeads(): number {
    return this.totalHeads;
  }

  public getBossConfig(): BossConfig {
    return this.config;
  }

  public isBossDead(): boolean {
    return this.isDefeated;
  }

  public getActionProgress(): number {
    return 1 - (Math.max(0, this.actionTimer) / this.config.actionIntervalSeconds);
  }
}
