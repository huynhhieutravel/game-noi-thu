import { BossConfig, TileState } from '../types';
import { CombatEngine } from './CombatEngine';

export interface BossEvents {
  onDamaged?: (currentHp: number, maxHp: number, damage: number) => void;
  onHeadSevered?: (headsLeft: number, totalHeads: number) => void;
  onBossSkillTriggered?: (
    skillName: string,
    description: string,
    skillType?: string,
    swappedPairs?: { t1: TileState; t2: TileState }[]
  ) => void;
  onBossAttackPlayer?: (damage: number, isEnraged: boolean, skillName: string) => void;
  onEnrageTriggered?: () => void;
  onDefeated?: () => void;
}

export class BossManager {
  private config: BossConfig;
  private currentHp: number;
  private headsRemaining: number;
  private totalHeads: number;
  private actionTimer: number = 0;
  private isDefeated: boolean = false;
  private isEnraged: boolean = false;
  private attackPower: number = CombatEngine.DEFAULT_BASE_BOSS_ATTACK;
  private events: BossEvents;

  constructor(config: BossConfig, events: BossEvents = {}) {
    this.config = config;
    this.currentHp = config.maxHp;
    this.totalHeads = config.headsOrParts || 8;
    this.headsRemaining = this.totalHeads;
    this.events = events;
    this.actionTimer = config.actionIntervalSeconds || 7;
    this.attackPower = (config as any).attackPower || CombatEngine.DEFAULT_BASE_BOSS_ATTACK;
  }

  public applyDamage(damage: number): { defeated: boolean; headCut: boolean } {
    if (this.isDefeated) return { defeated: true, headCut: false };

    const oldHp = this.currentHp;
    this.currentHp = Math.max(0, this.currentHp - damage);

    this.events.onDamaged?.(this.currentHp, this.config.maxHp, damage);

    // Check Enrage Phase (< 35% HP)
    if (this.currentHp > 0 && !this.isEnraged && CombatEngine.checkEnrage(this.currentHp, this.config.maxHp)) {
      this.isEnraged = true;
      this.events.onEnrageTriggered?.();
    }

    // Calculate heads based on remaining HP proportion
    const hpPerHead = this.config.maxHp / this.totalHeads;
    const newHeads = Math.ceil(this.currentHp / hpPerHead);
    let headCut = false;

    if (newHeads < this.headsRemaining && this.headsRemaining > 0) {
      this.headsRemaining = newHeads;
      headCut = true;
      // Boss is stunned for 3.5 seconds when a head is severed!
      this.actionTimer = Math.max(this.actionTimer, 3.5);
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
      const baseInterval = this.config.actionIntervalSeconds || 7;
      this.actionTimer = this.isEnraged
        ? Math.max(1.5, baseInterval * CombatEngine.ENRAGE_SPEED_MULTIPLIER)
        : baseInterval;
    }
  }

  private triggerBossAction(grid: TileState[][], rows: number, cols: number): void {
    const hasSkills = this.config.skills && this.config.skills.length > 0;
    const skill = hasSkills
      ? this.config.skills[Math.floor(Math.random() * this.config.skills.length)]
      : { type: 'normal_strike', name: 'Đòn Sấm Sét', description: 'Cự Trùm giáng đòn chí mạng' };
    const type = skill.type;
    const swappedPairs: { t1: TileState; t2: TileState }[] = [];

    // Active Combat: Boss deals real damage to player Combat HP
    this.events.onBossAttackPlayer?.(this.attackPower, this.isEnraged, skill.name);

    if (!grid || grid.length <= 1) {
      this.events.onBossSkillTriggered?.(skill.name, skill.description, type, swappedPairs);
      return;
    }

    // 1. Freeze / Lock & Web / Mist skills
    if (
      type === 'ice_curse' || type === 'dark_lock' || type === 'taiji_freeze' ||
      type === 'flame_chakra' || type === 'abyssal_bubble' || type === 'sticky_mucus' ||
      type === 'blizzard_howl' || type === 'thunder_strike' ||
      type === 'sandstorm_blind' || type === 'cloud_mist' || type === 'ghost_fog' || type === 'spore_haze'
    ) {
      const candidates: TileState[] = [];
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const tile = grid[r]?.[c];
          if (tile && !tile.isCleared && tile.characterId && tile.modifier === 'none' && !tile.isLocked) {
            candidates.push(tile);
          }
        }
      }
      for (let i = 0; i < Math.min(2, candidates.length); i++) {
        const randIdx = Math.floor(Math.random() * candidates.length);
        const t = candidates.splice(randIdx, 1)[0];
        if (type === 'sandstorm_blind' || type === 'cloud_mist' || type === 'ghost_fog' || type === 'spore_haze') {
          t.modifier = 'web';
          t.modifierLevel = 1;
        } else {
          t.modifier = 'ice';
          t.iceLayers = 2;
          t.modifierLevel = 2;
        }
      }
    }
    // 2. Obstacle / Stone / Barricade spawn
    else if (
      type === 'rock_blocker' || type === 'petrify_stone' || type === 'elephant_quake' ||
      type === 'forest_vines' || type === 'powder_barrel' || type === 'volcanic_eruption' ||
      type === 'root_strangle' || type === 'trex_stomp' ||
      type === 'pearl_blessing' || type === 'temple_ward' || type === 'magma_armor' || type === 'gold_hoard_shield'
    ) {
      // Limit total stone/barricade obstacles on the board to max 4 to avoid suffocating paths
      let currentObstacles = 0;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const tile = grid[r]?.[c];
          if (tile && !tile.isCleared && (tile.modifier === 'stone' || tile.modifier === 'barricade')) {
            currentObstacles++;
          }
        }
      }

      if (currentObstacles < 4) {
        const clearedSlots: TileState[] = [];
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const tile = grid[r]?.[c];
            if (tile && tile.isCleared) {
              clearedSlots.push(tile);
            }
          }
        }
        if (clearedSlots.length > 0) {
          const randIdx = Math.floor(Math.random() * clearedSlots.length);
          const randSlot = clearedSlots[randIdx];
          const isBarricade = type === 'pearl_blessing' || type === 'temple_ward' ||
            type === 'magma_armor' || type === 'gold_hoard_shield';
          randSlot.modifier = isBarricade ? 'barricade' : 'stone';
          randSlot.modifierLevel = 2;
          randSlot.isCleared = false;
          randSlot.characterId = null;
        }
      }
    }
    // 3. Tile swap / Whirlwind / Tempest / Flash
    else if (
      type === 'tile_swap' || type === 'whirlwind_shift' || type === 'flying_swords' ||
      type === 'naga_waters' || type === 'tentacle_slam' || type === 'slime_split' ||
      type === 'wing_tempest' || type === 'gravity_warp' || type === 'pack_call' ||
      type === 'celestial_ascend' || type === 'tidal_surge' ||
      type === 'luminescence_flash' || type === 'supernova_flash' || type === 'emp_shockwave' ||
      type === 'factory_reboot' || type === 'seasonal_wind'
    ) {
      // ONLY swap playable, non-obstacle tiles that are not locked
      const activeTiles: TileState[] = [];
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const tile = grid[r]?.[c];
          if (tile && !tile.isCleared && tile.characterId && tile.modifier === 'none' && !tile.isLocked) {
            activeTiles.push(tile);
          }
        }
      }

      if (activeTiles.length >= 2) {
        const idx1 = Math.floor(Math.random() * activeTiles.length);
        let idx2 = Math.floor(Math.random() * activeTiles.length);
        let tries = 0;
        while (
          tries < 20 &&
          (idx2 === idx1 || activeTiles[idx1].characterId === activeTiles[idx2].characterId)
        ) {
          idx2 = Math.floor(Math.random() * activeTiles.length);
          tries++;
        }
        if (idx1 !== idx2 && activeTiles[idx1].characterId !== activeTiles[idx2].characterId) {
          const t1 = activeTiles[idx1];
          const t2 = activeTiles[idx2];
          const tmp = t1.characterId;
          t1.characterId = t2.characterId;
          t2.characterId = tmp;
          swappedPairs.push({ t1, t2 });
        }
      }
    }
    // 4. Time drain skills
    else if (
      type === 'time_drain' || type === 'acid_breath' || type === 'dragon_roar' ||
      type === 'ten_head_roar' || type === 'plasma_cannon' || type === 'event_horizon' ||
      type === 'crown_jewel_blast' || type === 'inferno_breath' || type === 'solar_flare'
    ) {
      // Drained via onBossSkillTriggered callback in GameScene
    }

    this.events.onBossSkillTriggered?.(skill.name, skill.description, skill.type, swappedPairs);
  }

  public getHp(): number {
    return this.currentHp;
  }

  public getMaxHp(): number {
    return this.config.maxHp;
  }

  public get maxHp(): number {
    return this.config.maxHp;
  }

  public get hp(): number {
    return this.currentHp;
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

  public isBossEnraged(): boolean {
    return this.isEnraged;
  }

  public getAttackPower(): number {
    return this.attackPower;
  }

  public setAttackPower(power: number): void {
    this.attackPower = power;
  }

  public getActionProgress(): number {
    return 1 - (Math.max(0, this.actionTimer) / this.config.actionIntervalSeconds);
  }

  public setHp(hp: number): void {
    this.currentHp = Math.max(0, Math.min(this.config.maxHp, hp));
    const hpPerHead = this.config.maxHp / this.totalHeads;
    this.headsRemaining = Math.max(1, Math.ceil(this.currentHp / hpPerHead));
    this.isEnraged = CombatEngine.checkEnrage(this.currentHp, this.config.maxHp);
  }

  public destroy(): void {
    this.events = {};
  }
}
