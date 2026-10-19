import { COMPANION_UPGRADE_COSTS, DifficultyLevel, UserSaveData } from '../types';
import relicsData from '../data/relics.json';
import { formatCurrency } from '../styles/typography';

const RELIC_FORGE_MAP: Record<string, { shardsRequired: number; surplusExchangeRate: number }> = {};
for (const r of (relicsData as any[])) {
  RELIC_FORGE_MAP[r.id] = {
    shardsRequired: r.shardsRequired || (r.tier === 'epic' ? 100 : (r.tier === 'rare' ? 75 : 40)),
    surplusExchangeRate: r.surplusExchangeRate || (r.tier === 'epic' ? 100 : (r.tier === 'rare' ? 50 : 25))
  };
}

const STORAGE_KEY = 'yokai_onet_save_v2';

const DEFAULT_SAVE: UserSaveData = {
  version: 2,
  coins: 10000,
  diamonds: 100,
  stars: 0,
  highestLevel: 1,
  levelStars: {},
  discoveredCharacters: {
    // Chương 1
    kasa_obake: { discoveredAt: Date.now(), count: 1 },
    nurikabe: { discoveredAt: Date.now(), count: 1 },
    aka_oni: { discoveredAt: Date.now(), count: 1 },
    // Chương 2
    umibozu: { discoveredAt: Date.now(), count: 1 },
    ningyo: { discoveredAt: Date.now(), count: 1 },
    suiryu: { discoveredAt: Date.now(), count: 1 },
    // Chương 3
    jorogumo: { discoveredAt: Date.now(), count: 1 },
    yuki_onna: { discoveredAt: Date.now(), count: 1 },
    // Chương 4 (Forest)
    kijimuna: { discoveredAt: Date.now(), count: 1 },
    amabie: { discoveredAt: Date.now(), count: 1 },
    kawauso: { discoveredAt: Date.now(), count: 1 },
    // Chương 5 (Guardians)
    aka_oni_kanabo: { discoveredAt: Date.now(), count: 1 },
    kappa_cucumber: { discoveredAt: Date.now(), count: 1 },
    nekomata_calico: { discoveredAt: Date.now(), count: 1 },
    // Chương 6 (Oddities)
    tenome: { discoveredAt: Date.now(), count: 1 },
    shirime: { discoveredAt: Date.now(), count: 1 },
    kudan: { discoveredAt: Date.now(), count: 1 },
    // Chương 7 (Tsukumogami)
    biwa_bokuboku: { discoveredAt: Date.now(), count: 1 },
    bakezori: { discoveredAt: Date.now(), count: 1 },
    kameosa: { discoveredAt: Date.now(), count: 1 },
    // Chương 8 (Beasts)
    raiju: { discoveredAt: Date.now(), count: 1 },
    inari_kitsune: { discoveredAt: Date.now(), count: 1 },
    hakutaku: { discoveredAt: Date.now(), count: 1 },
    // Chương 9 (Tricksters)
    saru_goku: { discoveredAt: Date.now(), count: 1 },
    komainu: { discoveredAt: Date.now(), count: 1 },
    bake_danuki: { discoveredAt: Date.now(), count: 1 },
    // Chương 10 (Urban Legends)
    hanako_san: { discoveredAt: Date.now(), count: 1 },
    hachishakusama: { discoveredAt: Date.now(), count: 1 },
    kyuubi_kitsune: { discoveredAt: Date.now(), count: 1 },
    // Chương 11 (Flames)
    enenra: { discoveredAt: Date.now(), count: 1 },
    wanyuudo: { discoveredAt: Date.now(), count: 1 },
    hi_no_tori: { discoveredAt: Date.now(), count: 1 },
    // Chương 12 (Supreme Lords & Bosses)
    yamata_no_orochi_boss: { discoveredAt: Date.now(), count: 1 },
    ryujin_pearl: { discoveredAt: Date.now(), count: 1 },
    shuten_doji: { discoveredAt: Date.now(), count: 1 },
    // Ai Cập (Egypt khởi đầu)
    sobek: { discoveredAt: Date.now(), count: 1 },
    amun_ra: { discoveredAt: Date.now(), count: 1 },
    anubis: { discoveredAt: Date.now(), count: 1 },
    sphinx_pharaoh: { discoveredAt: Date.now(), count: 1 },
    bennu_phoenix: { discoveredAt: Date.now(), count: 1 },
    // Hy Lạp (Greece khởi đầu)
    kronos: { discoveredAt: Date.now(), count: 1 },
    heracles: { discoveredAt: Date.now(), count: 1 },
    hades: { discoveredAt: Date.now(), count: 1 },
    medusa: { discoveredAt: Date.now(), count: 1 },
    charon: { discoveredAt: Date.now(), count: 1 },
    // Võ Hiệp (Wuxia khởi đầu)
    wuxia_swordsman: { discoveredAt: Date.now(), count: 1 },
    chang_e: { discoveredAt: Date.now(), count: 1 },
    flying_sword: { discoveredAt: Date.now(), count: 1 },
    zhaocai_cat: { discoveredAt: Date.now(), count: 1 },
    sacred_lotus_flame: { discoveredAt: Date.now(), count: 1 },
    // Hàn Quốc (Korea khởi đầu)
    dokkaebi: { discoveredAt: Date.now(), count: 1 },
    gumiho: { discoveredAt: Date.now(), count: 1 },
    korean_tiger: { discoveredAt: Date.now(), count: 1 },
    bokjumeoni: { discoveredAt: Date.now(), count: 1 },
    haechi: { discoveredAt: Date.now(), count: 1 },
    // Ấn Độ (India khởi đầu)
    lord_ganesha: { discoveredAt: Date.now(), count: 1 },
    durga_maa: { discoveredAt: Date.now(), count: 1 },
    simha_lion: { discoveredAt: Date.now(), count: 1 },
    padma_lotus: { discoveredAt: Date.now(), count: 1 },
    hanuman_warrior: { discoveredAt: Date.now(), count: 1 },
    // Đông Nam Á (SEA khởi đầu)
    phaya_naga: { discoveredAt: Date.now(), count: 1 },
    garuda_warrior: { discoveredAt: Date.now(), count: 1 },
    airavata_elephant: { discoveredAt: Date.now(), count: 1 },
    chang_noi: { discoveredAt: Date.now(), count: 1 },
    angkor_smile: { discoveredAt: Date.now(), count: 1 },
    // Hải Tặc & Đại Dương (Pirate khởi đầu)
    captain_paws: { discoveredAt: Date.now(), count: 1 },
    pirate_shark: { discoveredAt: Date.now(), count: 1 },
    coral_mermaid: { discoveredAt: Date.now(), count: 1 },
    lookout_parrot: { discoveredAt: Date.now(), count: 1 },
    ghost_captain: { discoveredAt: Date.now(), count: 1 },
    // Thủy Cung Huyền Bí (Underwater khởi đầu)
    dolphin_prince: { discoveredAt: Date.now(), count: 1 },
    manta_princess: { discoveredAt: Date.now(), count: 1 },
    clownfish_drummer: { discoveredAt: Date.now(), count: 1 },
    lionfish_dancer: { discoveredAt: Date.now(), count: 1 },
    armored_moray: { discoveredAt: Date.now(), count: 1 },
    coral_princess: { discoveredAt: Date.now(), count: 1 },
    royal_marlin: { discoveredAt: Date.now(), count: 1 },
    pink_axolotl: { discoveredAt: Date.now(), count: 1 },
    dumbo_starry_octopus: { discoveredAt: Date.now(), count: 1 },
    kraken_overlord: { discoveredAt: Date.now(), count: 1 },
    orca_admiral: { discoveredAt: Date.now(), count: 1 },
    // Thế Giới Khủng Long (Dinosaur khởi đầu)
    baby_trex: { discoveredAt: Date.now(), count: 1 },
    triceratops_trixie: { discoveredAt: Date.now(), count: 1 },
    stegosaurus_spike: { discoveredAt: Date.now(), count: 1 },
    pterodactyl_sky: { discoveredAt: Date.now(), count: 1 },
    spinosaurus_magma: { discoveredAt: Date.now(), count: 1 },
    brachiosaurus_titan: { discoveredAt: Date.now(), count: 1 },
    // Quái Thú Đáng Yêu (Cute Monsters khởi đầu)
    slime_jelly: { discoveredAt: Date.now(), count: 1 },
    baby_red_dragon: { discoveredAt: Date.now(), count: 1 },
    mimic_cheesy: { discoveredAt: Date.now(), count: 1 },
    shroom_mage: { discoveredAt: Date.now(), count: 1 },
    beholder_oculus: { discoveredAt: Date.now(), count: 1 },
    dark_knight_valkor: { discoveredAt: Date.now(), count: 1 },
    // Thế Giới Fantasy (Classic Fantasy khởi đầu)
    human_knight: { discoveredAt: Date.now(), count: 1 },
    lion_paladin: { discoveredAt: Date.now(), count: 1 },
    fire_sorceress: { discoveredAt: Date.now(), count: 1 },
    elf_ranger: { discoveredAt: Date.now(), count: 1 },
    rainbow_pegasus: { discoveredAt: Date.now(), count: 1 },
    baby_blue_dragon: { discoveredAt: Date.now(), count: 1 },
    // Thiên Hà Vũ Trụ (Space Galaxy khởi đầu)
    alien_zog: { discoveredAt: Date.now(), count: 1 },
    chibi_astronaut: { discoveredAt: Date.now(), count: 1 },
    starlight_kitsune: { discoveredAt: Date.now(), count: 1 },
    cosmic_space_whale: { discoveredAt: Date.now(), count: 1 },
    moon_bunny_rover: { discoveredAt: Date.now(), count: 1 },
    baby_star_meteor: { discoveredAt: Date.now(), count: 1 },
    // Xưởng Robot (Robot Factory khởi đầu)
    builder_bot_wrench: { discoveredAt: Date.now(), count: 1 },
    medic_bot_cross: { discoveredAt: Date.now(), count: 1 },
    battery_bunny_bot: { discoveredAt: Date.now(), count: 1 },
    heavy_loader_titan: { discoveredAt: Date.now(), count: 1 },
    delivery_drone_copter: { discoveredAt: Date.now(), count: 1 },
    spider_repair_bot: { discoveredAt: Date.now(), count: 1 },
    // Thế Giới Động Vật (Animal Kingdom khởi đầu)
    shiba_inu: { discoveredAt: Date.now(), count: 1 },
    tuxedo_cat: { discoveredAt: Date.now(), count: 1 },
    lion_cub_simba: { discoveredAt: Date.now(), count: 1 },
    dairy_cow_bella: { discoveredAt: Date.now(), count: 1 },
    tiger_cub_rajah: { discoveredAt: Date.now(), count: 1 },
    polar_bear_cub_nanook: { discoveredAt: Date.now(), count: 1 },
    // Vương Quốc Thực Vật (Plant Kingdom khởi đầu)
    sunflower_sunny: { discoveredAt: Date.now(), count: 1 },
    rose_velvet_rosie: { discoveredAt: Date.now(), count: 1 },
    tulip_spring_tula: { discoveredAt: Date.now(), count: 1 },
    cactus_bloom_spiky: { discoveredAt: Date.now(), count: 1 },
    carnivorous_flytrap_chomper: { discoveredAt: Date.now(), count: 1 },
    sacred_lotus_padma: { discoveredAt: Date.now(), count: 1 },
  },
  selectedTheme: 'yokai',
  selectedWallpaper: 'bg_night_shrine',
  selectedCompanion: 'inari_kitsune',
  unlockedCompanions: ['inari_kitsune'],
  companionTiers: {
    inari_kitsune: 1,
    ryujin_pearl: 1,
    hi_no_tori: 1,
    byakko_tiger: 1,
    genbu_tortoise: 1,
    kirin_sacred: 1,
    raiju_thunder: 1,
    yatagarasu_crow: 1,
    nekomata_cat: 1,
    orochi_serpent: 1
  },
  companionLevels: {
    inari_kitsune: 1,
    ryujin_pearl: 1,
    hi_no_tori: 1,
    byakko_tiger: 1,
    genbu_tortoise: 1,
    kirin_sacred: 1,
    raiju_thunder: 1,
    yatagarasu_crow: 1,
    nekomata_cat: 1,
    orochi_serpent: 1
  },
  companionShards: {
    inari_kitsune: 10,
    ryujin_pearl: 5,
    hi_no_tori: 0,
    byakko_tiger: 0,
    genbu_tortoise: 0,
    kirin_sacred: 0,
    raiju_thunder: 0,
    yatagarasu_crow: 0,
    nekomata_cat: 0,
    orochi_serpent: 0
  },
  companionExp: {
    inari_kitsune: 0
  },
  boosters: {
    hint: 15,
    shuffle: 10,
    bomb: 10
  },
  settings: {
    sound: true,
    music: true,
    vibration: true
  },
  relicsCollected: {},
  relicShards: {},
  relicStars: {},
  equippedRelicId: '',
  badgesCollected: {},
  completedDifficulties: {},
  unlockedRealms: ['yokai'],
  activeRealm: 'yokai'
};

export class SaveSystem {
  private static instance: SaveSystem;
  private data: UserSaveData;

  private constructor() {
    this.data = this.load();
    this.save();
  }

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  public getData(): UserSaveData {
    return this.data;
  }

  public save(): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('Failed to save game data to localStorage', e);
    }
  }

  public resetSave(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    this.save();
  }

  private sanitize(parsed: any): UserSaveData {
    const completedDifficulties = { ...(DEFAULT_SAVE.completedDifficulties || {}), ...(parsed.completedDifficulties || {}) };

    // Auto-heal / downward cascading migration:
    // If a level was beaten on hard/medium, ensure medium and easy are also marked complete.
    let maxLevelBeaten = 0;
    for (const [levelId, diffs] of Object.entries(completedDifficulties)) {
      const match = levelId.match(/level_(\d+)/);
      const lvlNum = match ? parseInt(match[1], 10) : 0;
      const d = diffs as any;
      if (d && (d.hard || d.medium || d.easy)) {
        if (d.hard) {
          d.medium = true;
          d.easy = true;
        }
        if (d.medium) {
          d.easy = true;
        }
        if (lvlNum > maxLevelBeaten) {
          maxLevelBeaten = lvlNum;
        }
      }
    }

    // Also check levelStars to ensure any level with earned stars has easy marked complete
    if (parsed.levelStars && typeof parsed.levelStars === 'object') {
      for (const [key, stars] of Object.entries(parsed.levelStars)) {
        if (typeof stars === 'number' && stars > 0) {
          const match = key.match(/^level_(\d+)/);
          if (match) {
            const lvlNum = parseInt(match[1], 10);
            const lid = `level_${String(lvlNum).padStart(2, '0')}`;
            if (!completedDifficulties[lid]) {
              completedDifficulties[lid] = {};
            }
            completedDifficulties[lid]['easy'] = true;
            if (lvlNum > maxLevelBeaten) {
              maxLevelBeaten = lvlNum;
            }
          }
        }
      }
    }

    const highestLevel = Math.max(parsed.highestLevel || DEFAULT_SAVE.highestLevel, maxLevelBeaten > 0 ? maxLevelBeaten + 1 : 1);

    // Backwards compatibility migration:
    // If the player had already reached or beaten levels before the difficulty gating system,
    // ensure all those levels are marked as completed on 'easy'.
    for (let i = 1; i < highestLevel; i++) {
      const lid = `level_${String(i).padStart(2, '0')}`;
      if (!completedDifficulties[lid]) {
        completedDifficulties[lid] = {};
      }
      completedDifficulties[lid]['easy'] = true;
    }

    return {
      ...DEFAULT_SAVE,
      ...parsed,
      coins: typeof parsed.coins === 'number' ? Math.max(parsed.coins, 10000) : 10000,
      diamonds: typeof parsed.diamonds === 'number' ? Math.max(parsed.diamonds, 100) : 100,
      highestLevel,
      selectedTheme: (parsed.selectedTheme && parsed.selectedTheme !== 'pikachu') ? parsed.selectedTheme : 'yokai',
      selectedWallpaper: parsed.selectedWallpaper || 'bg_night_shrine',
      companionTiers: { ...DEFAULT_SAVE.companionTiers, ...(parsed.companionTiers || {}) },
      companionLevels: { ...DEFAULT_SAVE.companionLevels, ...(parsed.companionLevels || {}) },
      companionShards: { ...DEFAULT_SAVE.companionShards, ...(parsed.companionShards || {}) },
      unlockedCompanions: (Array.isArray(parsed.unlockedCompanions) && parsed.unlockedCompanions.length > 0)
        ? Array.from(new Set([...(DEFAULT_SAVE.unlockedCompanions || []), ...parsed.unlockedCompanions]))
        : (DEFAULT_SAVE.unlockedCompanions || ['inari_kitsune']),
      boosters: {
        hint: Math.max(parsed.boosters?.hint ?? 0, 15),
        shuffle: Math.max(parsed.boosters?.shuffle ?? 0, 10),
        bomb: Math.max(parsed.boosters?.bomb ?? 0, 10)
      },
      discoveredCharacters: { ...DEFAULT_SAVE.discoveredCharacters, ...(parsed.discoveredCharacters || {}) },
      ...(() => {
        const parsedStars = parsed.relicStars || {};
        const parsedShards = parsed.relicShards || {};
        const cheatMatches = Object.keys(parsedStars).filter(k => parsedStars[k] === 5 && parsedShards[k] === 100);
        const isCheatedRelics = cheatMatches.length >= 10;

        let relicsCollected: Record<string, boolean> = {};
        let relicShards: Record<string, number> = {};
        let relicStars: Record<string, number> = {};
        let equippedRelicId = '';

        if (!isCheatedRelics) {
          relicsCollected = { ...(DEFAULT_SAVE.relicsCollected || {}), ...(parsed.relicsCollected || {}) };
          relicShards = { ...(DEFAULT_SAVE.relicShards || {}), ...(parsed.relicShards || {}) };
          relicStars = { ...(DEFAULT_SAVE.relicStars || {}), ...(parsed.relicStars || {}) };
          equippedRelicId = parsed.equippedRelicId || DEFAULT_SAVE.equippedRelicId || '';
        }

        if (equippedRelicId && (!relicsCollected[equippedRelicId] || (relicStars[equippedRelicId] || 0) < 1)) {
          equippedRelicId = '';
        }

        return {
          relicsCollected,
          relicShards,
          relicStars,
          equippedRelicId
        };
      })(),
      badgesCollected: { ...(DEFAULT_SAVE.badgesCollected || {}), ...(parsed.badgesCollected || {}) },
      completedDifficulties,
      unlockedRealms: (Array.isArray(parsed.unlockedRealms) && parsed.unlockedRealms.length > 0) ? parsed.unlockedRealms : ['yokai'],
      activeRealm: parsed.activeRealm || 'yokai'
    };
  }

  private load(): UserSaveData {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        // Purge deprecated v1 save keys to ensure 100% clean reset
        try {
          localStorage.removeItem('yokai_onet_save_v1');
        } catch (_) {}

        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return this.sanitize(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse save data', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }

  public getCoins(): number {
    return this.data.coins || 0;
  }

  public getHighestLevel(): number {
    return this.data.highestLevel || 1;
  }

  public getStars(): number {
    return this.data.stars || 0;
  }

  public addCoins(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) return this.data.coins;
    this.data.coins += Math.floor(amount);
    this.save();
    return this.data.coins;
  }

  public spendCoins(amount: number): boolean {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    const cost = Math.floor(amount);
    if (this.data.coins >= cost) {
      this.data.coins -= cost;
      this.save();
      return true;
    }
    return false;
  }

  public getDiamonds(): number {
    return typeof this.data.diamonds === 'number' ? this.data.diamonds : 50;
  }

  public addDiamonds(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) return this.getDiamonds();
    this.data.diamonds = (this.data.diamonds || 0) + Math.floor(amount);
    this.save();
    return this.data.diamonds;
  }

  public spendDiamonds(amount: number): boolean {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    const cost = Math.floor(amount);
    const cur = this.getDiamonds();
    if (cur >= cost) {
      this.data.diamonds = cur - cost;
      this.save();
      return true;
    }
    return false;
  }

  public recordLevelCompleted(levelId: string, levelNum: number, starsEarned: number, diff: DifficultyLevel = 'easy'): void {
    const starKey = `${levelId}_${diff}`;
    const existingStars = this.data.levelStars[starKey] || 0;
    if (starsEarned > existingStars) {
      this.data.stars += (starsEarned - existingStars);
      this.data.levelStars[starKey] = starsEarned;
      this.data.levelStars[levelId] = Math.max(this.data.levelStars[levelId] || 0, starsEarned);
    }

    // Downward star inheritance:
    // If beating higher difficulty with N stars, Easy (and Medium if Hard) also gets credited!
    if (diff === 'hard') {
      const medKey = `${levelId}_medium`;
      const easyKey = `${levelId}_easy`;
      this.data.levelStars[medKey] = Math.max(this.data.levelStars[medKey] || 0, starsEarned);
      this.data.levelStars[easyKey] = Math.max(this.data.levelStars[easyKey] || 0, starsEarned);
    } else if (diff === 'medium') {
      const easyKey = `${levelId}_easy`;
      this.data.levelStars[easyKey] = Math.max(this.data.levelStars[easyKey] || 0, starsEarned);
    }

    // Level progression: beating a level on ANY difficulty advances highestLevel!
    if (levelNum >= this.data.highestLevel) {
      this.data.highestLevel = Math.min(100, levelNum + 1);
    }
    this.recordDifficultyCompleted(levelId, diff);
    this.save();
  }

  public getLevelStars(levelId: string, diff?: DifficultyLevel): number {
    if (diff) {
      const starKey = `${levelId}_${diff}`;
      if (this.data.levelStars[starKey] !== undefined) {
        return this.data.levelStars[starKey];
      }
    }
    return this.data.levelStars[levelId] || 0;
  }

  public discoverCharacter(charId: string): boolean {
    const isNew = !this.data.discoveredCharacters[charId];
    if (isNew) {
      this.data.discoveredCharacters[charId] = {
        discoveredAt: Date.now(),
        count: 1
      };
    } else {
      this.data.discoveredCharacters[charId].count++;
    }
    this.save();
    return isNew;
  }

  public isCharacterDiscovered(charId: string): boolean {
    return !!this.data.discoveredCharacters[charId];
  }

  public useBooster(type: 'hint' | 'shuffle' | 'bomb'): boolean {
    if (this.data.boosters[type] > 0) {
      this.data.boosters[type]--;
      this.save();
      return true;
    }
    return false;
  }

  public addBooster(type: 'hint' | 'shuffle' | 'bomb', amount: number = 1): void {
    this.data.boosters[type] += amount;
    this.save();
  }

  public getBoosters(): { hint: number; shuffle: number; bomb: number } {
    return { ...this.data.boosters };
  }

  public buyBoosterWithCoins(type: 'hint' | 'shuffle' | 'bomb', count: number, cost: number): { success: boolean; reason?: string } {
    if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(count) || count <= 0) {
      return { success: false, reason: 'Giao dịch không hợp lệ!' };
    }
    const safeCost = Math.floor(cost);
    const safeCount = Math.floor(count);
    if (this.data.coins < safeCost) {
      return { success: false, reason: `Cần thêm ${formatCurrency(safeCost - this.data.coins)} Xu Vàng!` };
    }
    this.data.coins -= safeCost;
    this.data.boosters[type] += safeCount;
    this.save();
    return { success: true };
  }

  public buyBundleWithCoins(hints: number, shuffles: number, bombs: number, cost: number): { success: boolean; reason?: string } {
    if (!Number.isFinite(cost) || cost <= 0) {
      return { success: false, reason: 'Giao dịch không hợp lệ!' };
    }
    const safeCost = Math.floor(cost);
    if (this.data.coins < safeCost) {
      return { success: false, reason: `Cần thêm ${formatCurrency(safeCost - this.data.coins)} Xu Vàng!` };
    }
    this.data.coins -= safeCost;
    this.data.boosters.hint += Math.max(0, Math.floor(hints));
    this.data.boosters.shuffle += Math.max(0, Math.floor(shuffles));
    this.data.boosters.bomb += Math.max(0, Math.floor(bombs));
    this.save();
    return { success: true };
  }

  public getSelectedTheme(): string {
    return (this.data.selectedTheme && this.data.selectedTheme !== 'pikachu') ? this.data.selectedTheme : 'yokai';
  }

  public setSelectedTheme(theme: string): void {
    this.data.selectedTheme = theme;
    this.save();
  }

  public getSelectedWallpaper(): string {
    return this.data.selectedWallpaper || 'bg_night_shrine';
  }

  public setSelectedWallpaper(wp: string): void {
    this.data.selectedWallpaper = wp;
    this.save();
  }

  public getZenHighScore(): number {
    return this.data.zenHighScore || 0;
  }

  public saveZenHighScore(score: number): boolean {
    if (!this.data.zenHighScore || score > this.data.zenHighScore) {
      this.data.zenHighScore = score;
      this.save();
      return true;
    }
    return false;
  }

  public getSurvivalRecord(): { highScore: number; maxWaves: number } {
    return {
      highScore: this.data.survivalHighScore || 0,
      maxWaves: this.data.survivalMaxWaves || 0
    };
  }

  public saveSurvivalRecord(score: number, waves: number): boolean {
    let isNewHigh = false;
    if (!this.data.survivalHighScore || score > this.data.survivalHighScore) {
      this.data.survivalHighScore = score;
      isNewHigh = true;
    }
    if (!this.data.survivalMaxWaves || waves > this.data.survivalMaxWaves) {
      this.data.survivalMaxWaves = waves;
    }
    this.save();
    return isNewHigh;
  }

  public getSelectedCompanion(): string {
    return this.data.selectedCompanion || 'inari_kitsune';
  }

  public setSelectedCompanion(companionId: string): void {
    this.data.selectedCompanion = companionId;
    this.save();
  }

  public getUnlockedCompanions(): string[] {
    if (!this.data.unlockedCompanions || !Array.isArray(this.data.unlockedCompanions)) {
      this.data.unlockedCompanions = ['inari_kitsune'];
    }
    return this.data.unlockedCompanions;
  }

  public isCompanionUnlocked(companionId: string): boolean {
    if (companionId === 'inari_kitsune') return true;
    return this.getUnlockedCompanions().includes(companionId);
  }

  public unlockCompanion(companionId: string): void {
    const list = this.getUnlockedCompanions();
    if (!list.includes(companionId)) {
      list.push(companionId);
      this.data.unlockedCompanions = list;
      if (!this.data.companionLevels) this.data.companionLevels = {};
      if (!this.data.companionLevels[companionId]) {
        this.data.companionLevels[companionId] = 1;
      }
      if (!this.data.companionTiers) this.data.companionTiers = {};
      if (!this.data.companionTiers[companionId]) {
        this.data.companionTiers[companionId] = 1;
      }
      if (!this.data.companionExp) this.data.companionExp = {};
      if (this.data.companionExp[companionId] === undefined) {
        this.data.companionExp[companionId] = 0;
      }
      this.save();
    }
  }

  public canSummonCompanion(companionId: string): { canSummon: boolean; currentShards: number; requiredShards: number; reason?: string } {
    if (this.isCompanionUnlocked(companionId)) {
      return { canSummon: false, currentShards: this.getCompanionShards(companionId), requiredShards: 20, reason: 'Linh Thú đã được triệu hồi!' };
    }
    const currentShards = this.getCompanionShards(companionId);
    const requiredShards = 20;
    if (currentShards < requiredShards) {
      return {
        canSummon: false,
        currentShards,
        requiredShards,
        reason: `Cần đủ ${requiredShards} Mảnh Linh Thú để Triệu Hồi! (Hiện có: ${currentShards}/${requiredShards})`
      };
    }
    return { canSummon: true, currentShards, requiredShards };
  }

  public summonCompanion(companionId: string): { success: boolean; error?: string } {
    const check = this.canSummonCompanion(companionId);
    if (!check.canSummon) {
      return { success: false, error: check.reason };
    }
    this.addCompanionShards(companionId, -check.requiredShards);
    this.unlockCompanion(companionId);
    this.setCompanionTier(companionId, 1);
    this.setCompanionLevel(companionId, 1);
    this.setCompanionExp(companionId, 0);
    return { success: true };
  }

  public getCompanionExp(companionId: string): number {
    if (!this.data.companionExp) {
      this.data.companionExp = {};
    }
    return this.data.companionExp[companionId] || 0;
  }

  public setCompanionExp(companionId: string, exp: number): void {
    if (!this.data.companionExp) {
      this.data.companionExp = {};
    }
    this.data.companionExp[companionId] = Math.max(0, Math.floor(exp));
    this.save();
  }

  public getRequiredExpForNextLevel(tier: number, currentLevel: number): number {
    if (tier === 1) {
      return Math.round(150 * Math.pow(Math.max(1, currentLevel), 1.6));
    } else if (tier === 2) {
      return Math.round(350 * Math.pow(Math.max(1, currentLevel), 1.6));
    } else {
      return Math.round(800 * Math.pow(Math.max(1, currentLevel), 1.6));
    }
  }

  public addCompanionExp(
    companionId: string,
    amount: number
  ): {
    oldExp: number;
    newExp: number;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    requiredExp: number;
  } {
    const tier = this.getCompanionTier(companionId);
    const maxLevel = this.getMaxLevelForTier(tier);
    const oldLevel = this.getCompanionLevel(companionId);
    let curLevel = oldLevel;
    const oldExp = this.getCompanionExp(companionId);
    let curExp = oldExp;
    let leveledUp = false;

    if (curLevel >= maxLevel) {
      return {
        oldExp,
        newExp: 0,
        leveledUp: false,
        oldLevel,
        newLevel: maxLevel,
        requiredExp: this.getRequiredExpForNextLevel(tier, maxLevel)
      };
    }

    let remainingExp = amount;
    while (remainingExp > 0 && curLevel < maxLevel) {
      const reqExp = this.getRequiredExpForNextLevel(tier, curLevel);
      const needed = reqExp - curExp;
      if (remainingExp >= needed) {
        remainingExp -= needed;
        curLevel += 1;
        curExp = 0;
        leveledUp = true;
      } else {
        curExp += remainingExp;
        remainingExp = 0;
      }
    }

    if (curLevel >= maxLevel) {
      curExp = 0;
    }

    this.setCompanionLevel(companionId, curLevel);
    this.setCompanionExp(companionId, curExp);

    return {
      oldExp,
      newExp: curExp,
      leveledUp,
      oldLevel,
      newLevel: curLevel,
      requiredExp: this.getRequiredExpForNextLevel(tier, curLevel)
    };
  }

  public getCompanionLevel(companionId: string): number {
    if (!this.data.companionLevels) {
      this.data.companionLevels = { inari_kitsune: 1 };
    }
    return this.data.companionLevels[companionId] || 1;
  }

  public setCompanionLevel(companionId: string, level: number): void {
    if (!this.data.companionLevels) {
      this.data.companionLevels = { inari_kitsune: 1 };
    }
    const tier = this.getCompanionTier(companionId);
    const maxLevel = this.getMaxLevelForTier(tier);
    this.data.companionLevels[companionId] = Math.max(1, Math.min(maxLevel, level));
    this.save();
  }

  public getCompanionShards(companionId: string): number {
    if (!this.data.companionShards) {
      this.data.companionShards = {};
    }
    return this.data.companionShards[companionId] || 0;
  }

  public addCompanionShards(companionId: string, count: number): void {
    if (!this.data.companionShards) {
      this.data.companionShards = {};
    }
    const current = this.data.companionShards[companionId] || 0;
    this.data.companionShards[companionId] = Math.max(0, current + count);
    this.save();
  }

  public getCompanionTier(companionId: string): number {
    if (!this.data.companionTiers) {
      this.data.companionTiers = {};
    }
    return this.data.companionTiers[companionId] || 1;
  }

  public setCompanionTier(companionId: string, tier: number): void {
    if (!this.data.companionTiers) {
      this.data.companionTiers = {};
    }
    this.data.companionTiers[companionId] = Math.max(1, Math.min(3, tier));
    this.save();
  }

  public getMaxLevelForTier(tier: number): number {
    if (tier === 1) return 10;
    if (tier === 2) return 20;
    return 30; // Tier 3
  }

  public canLevelUpCompanion(companionId: string): { canLevelUp: boolean; reason?: string; requiredCoins: number; nextLevel: number } {
    const tier = this.getCompanionTier(companionId);
    const curLevel = this.getCompanionLevel(companionId);
    const maxLevel = this.getMaxLevelForTier(tier);

    if (curLevel >= maxLevel) {
      if (tier < 3) {
        return { canLevelUp: false, reason: `Đã đạt Cấp tối đa của Bậc ${tier} (${maxLevel})! Cần Tiến Hóa Đột Phá!`, requiredCoins: 0, nextLevel: curLevel };
      }
      return { canLevelUp: false, reason: 'Đã đạt Cấp Cực Đại Thần Linh (Cấp 30)!', requiredCoins: 0, nextLevel: 30 };
    }

    const requiredCoins = 80 * tier + curLevel * 25;
    const curCoins = this.getCoins();

    if (curCoins < requiredCoins) {
      return { canLevelUp: false, reason: `Cần thêm ${formatCurrency(requiredCoins - curCoins)} Xu Vàng!`, requiredCoins, nextLevel: curLevel + 1 };
    }
    return { canLevelUp: true, requiredCoins, nextLevel: curLevel + 1 };
  }

  public levelUpCompanion(companionId: string): { success: boolean; newLevel: number; error?: string } {
    const check = this.canLevelUpCompanion(companionId);
    if (!check.canLevelUp) {
      return { success: false, newLevel: this.getCompanionLevel(companionId), error: check.reason };
    }
    this.spendCoins(check.requiredCoins);
    const newLevel = this.getCompanionLevel(companionId) + 1;
    this.setCompanionLevel(companionId, newLevel);
    return { success: true, newLevel };
  }

  public canEvolveCompanion(companionId: string): { canEvolve: boolean; reason?: string; requiredShards: number; requiredCoins: number; nextTier: number } {
    const tier = this.getCompanionTier(companionId);
    const curLevel = this.getCompanionLevel(companionId);
    const maxLevel = this.getMaxLevelForTier(tier);

    if (tier >= 3) {
      return { canEvolve: false, reason: 'Đã đạt Bậc Thần Linh Thức Tỉnh tối thượng!', requiredShards: 0, requiredCoins: 0, nextTier: 3 };
    }

    if (curLevel < maxLevel) {
      return { canEvolve: false, reason: `Cần đạt Cấp ${maxLevel} trước khi Đột Phá!`, requiredShards: 0, requiredCoins: 0, nextTier: tier + 1 };
    }

    const costs = tier === 1 ? { shards: 50, coins: 1000 } : { shards: 100, coins: 2500 };
    const curShards = this.getCompanionShards(companionId);
    const curCoins = this.getCoins();

    if (curShards < costs.shards) {
      return { canEvolve: false, reason: `Cần thêm ${costs.shards - curShards} Mảnh Linh Thú!`, requiredShards: costs.shards, requiredCoins: costs.coins, nextTier: tier + 1 };
    }
    if (curCoins < costs.coins) {
      return { canEvolve: false, reason: `Cần thêm ${formatCurrency(costs.coins - curCoins)} Xu Vàng!`, requiredShards: costs.shards, requiredCoins: costs.coins, nextTier: tier + 1 };
    }

    return { canEvolve: true, requiredShards: costs.shards, requiredCoins: costs.coins, nextTier: tier + 1 };
  }

  public evolveCompanion(companionId: string): { success: boolean; newTier: number; newLevel: number; error?: string } {
    const check = this.canEvolveCompanion(companionId);
    if (!check.canEvolve) {
      return { success: false, newTier: this.getCompanionTier(companionId), newLevel: this.getCompanionLevel(companionId), error: check.reason };
    }
    this.addCompanionShards(companionId, -check.requiredShards);
    this.spendCoins(check.requiredCoins);
    const newTier = this.getCompanionTier(companionId) + 1;
    this.setCompanionTier(companionId, newTier);
    this.setCompanionLevel(companionId, 1); // Reset level to 1 for the new tier
    return { success: true, newTier, newLevel: 1 };
  }

  public getCompanionTotalStats(companionId: string): { goldBonusPercent: number; expBonusPercent: number; rageBonusPercent: number; comboTimeBonusSec: number } {
    const tier = this.getCompanionTier(companionId);
    const level = this.getCompanionLevel(companionId);
    const prevTierLevels = tier === 1 ? 0 : (tier === 2 ? 10 : 30);
    const totalLevel = prevTierLevels + level;

    return {
      goldBonusPercent: totalLevel * 1,
      expBonusPercent: totalLevel * 1,
      rageBonusPercent: +(totalLevel * 0.5).toFixed(1),
      comboTimeBonusSec: +(totalLevel * 0.1).toFixed(1)
    };
  }

  public canUpgradeCompanion(companionId: string): { canUpgrade: boolean; reason?: string; requiredShards: number; requiredCoins: number; nextLevel: number } {
    const lvlCheck = this.canLevelUpCompanion(companionId);
    if (lvlCheck.canLevelUp) {
      return { canUpgrade: true, requiredShards: 0, requiredCoins: lvlCheck.requiredCoins, nextLevel: lvlCheck.nextLevel };
    }
    const evoCheck = this.canEvolveCompanion(companionId);
    if (evoCheck.canEvolve) {
      return { canUpgrade: true, requiredShards: evoCheck.requiredShards, requiredCoins: evoCheck.requiredCoins, nextLevel: 1 };
    }
    return { canUpgrade: false, reason: lvlCheck.reason || evoCheck.reason, requiredShards: evoCheck.requiredShards || 0, requiredCoins: lvlCheck.requiredCoins || evoCheck.requiredCoins || 0, nextLevel: this.getCompanionLevel(companionId) };
  }

  public upgradeCompanion(companionId: string): { success: boolean; newLevel: number; error?: string } {
    const lvlCheck = this.canLevelUpCompanion(companionId);
    if (lvlCheck.canLevelUp) {
      return this.levelUpCompanion(companionId);
    }
    const evoCheck = this.canEvolveCompanion(companionId);
    if (evoCheck.canEvolve) {
      const evoRes = this.evolveCompanion(companionId);
      return { success: evoRes.success, newLevel: evoRes.newLevel, error: evoRes.error };
    }
    return { success: false, newLevel: this.getCompanionLevel(companionId), error: lvlCheck.reason || evoCheck.reason };
  }

  // --- Relics & Badges Progression ---
  public collectRelic(relicId: string): boolean {
    if (!this.data.relicsCollected) this.data.relicsCollected = {};
    const isNew = !this.data.relicsCollected[relicId];
    this.data.relicsCollected[relicId] = true;
    this.save();
    return isNew;
  }

  public hasRelic(relicId: string): boolean {
    return !!(this.data.relicsCollected && this.data.relicsCollected[relicId]);
  }

  public getCollectedRelicsCount(worldId?: string): number {
    if (!this.data.relicsCollected) return 0;
    let count = 0;
    for (const [key, val] of Object.entries(this.data.relicsCollected)) {
      if (val && (!worldId || key.startsWith(worldId))) {
        count++;
      }
    }
    return count;
  }

  public isWorldRelicComplete(worldId: string): boolean {
    return this.getCollectedRelicsCount(worldId) >= 10;
  }

  public getEquippedRelicId(): string {
    const id = this.data.equippedRelicId || '';
    if (id && this.hasRelic(id)) {
      return id;
    }
    return '';
  }

  public equipRelic(relicId: string): boolean {
    if (this.hasRelic(relicId)) {
      this.data.equippedRelicId = relicId;
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Unlock all 30 mythical relics with full 5 stars and 100 shards
   */
  public unlockAllRelics(): void {
    if (!this.data.relicsCollected) this.data.relicsCollected = {};
    if (!this.data.relicStars) this.data.relicStars = {};
    if (!this.data.relicShards) this.data.relicShards = {};
    for (const r of (relicsData as any[])) {
      this.data.relicsCollected[r.id] = true;
      this.data.relicStars[r.id] = 5;
      this.data.relicShards[r.id] = 100;
    }
    this.save();
  }

  public getRelicShards(relicId: string): number {
    return (this.data.relicShards && this.data.relicShards[relicId]) || 0;
  }

  public getRelicRequiredShards(relicId: string): number {
    return RELIC_FORGE_MAP[relicId]?.shardsRequired || 40;
  }

  public getRelicSurplusRate(relicId: string): number {
    return RELIC_FORGE_MAP[relicId]?.surplusExchangeRate || 25;
  }

  public addRelicShards(relicId: string, amount: number): { currentShards: number; canUnlock: boolean; surplusCoins: number } {
    if (!this.data.relicShards) this.data.relicShards = {};
    const curStar = this.getRelicStar(relicId);
    const req = this.getRelicRequiredShards(relicId);
    const rate = this.getRelicSurplusRate(relicId);

    // If already 5-star (max level), auto-convert all newly added shards to coins!
    if (curStar >= 5) {
      const surplusCoins = amount * rate;
      this.addCoins(surplusCoins);
      return { currentShards: this.data.relicShards[relicId] || 0, canUnlock: false, surplusCoins };
    }

    const cur = (this.data.relicShards[relicId] || 0) + amount;
    this.data.relicShards[relicId] = cur;
    const canUnlock = cur >= req && curStar === 0;
    this.save();
    return { currentShards: cur, canUnlock, surplusCoins: 0 };
  }

  public getRelicStar(relicId: string): number {
    return (this.data.relicStars && this.data.relicStars[relicId]) || (this.hasRelic(relicId) ? 1 : 0);
  }

  public unlockOrUpgradeRelic(relicId: string): boolean {
    if (!this.data.relicStars) this.data.relicStars = {};
    if (!this.data.relicShards) this.data.relicShards = {};
    const curStar = this.getRelicStar(relicId);
    const shards = this.getRelicShards(relicId);
    const req = this.getRelicRequiredShards(relicId);

    if (curStar === 0) {
      if (shards >= req) {
        this.data.relicShards[relicId] -= req;
        this.data.relicStars[relicId] = 1;
        this.collectRelic(relicId);
        if (!this.data.equippedRelicId) {
          this.data.equippedRelicId = relicId;
        }
        this.save();
        return true;
      }
    } else if (curStar < 5) {
      // Star upgrade scaling: Star 2 = 1.0x, Star 3 = 1.25x, Star 4 = 1.5x, Star 5 = 2.0x of base
      const mults = [1.0, 1.0, 1.25, 1.5, 2.0];
      const cost = Math.round(req * (mults[curStar] || 1.0));
      if (shards >= cost) {
        this.data.relicShards[relicId] -= cost;
        this.data.relicStars[relicId] = curStar + 1;
        this.save();
        return true;
      }
    }
    return false;
  }

  public exchangeSurplusShards(relicId: string): { exchangedShards: number; earnedCoins: number } {
    if (!this.data.relicShards) this.data.relicShards = {};
    const shards = this.data.relicShards[relicId] || 0;
    const curStar = this.getRelicStar(relicId);
    const rate = this.getRelicSurplusRate(relicId);

    if (shards > 0 && curStar >= 5) {
      const earnedCoins = shards * rate;
      this.data.relicShards[relicId] = 0;
      this.addCoins(earnedCoins);
      this.save();
      return { exchangedShards: shards, earnedCoins };
    }
    return { exchangedShards: 0, earnedCoins: 0 };
  }

  public collectBadge(badgeId: string): boolean {
    if (!this.data.badgesCollected) this.data.badgesCollected = {};
    const isNew = !this.data.badgesCollected[badgeId];
    this.data.badgesCollected[badgeId] = true;
    this.save();
    return isNew;
  }

  public hasBadge(badgeId: string): boolean {
    return !!(this.data.badgesCollected && this.data.badgesCollected[badgeId]);
  }

  public getCollectedBadgesCount(): number {
    if (!this.data.badgesCollected) return 0;
    return Object.values(this.data.badgesCollected).filter(Boolean).length;
  }

  public recordDifficultyCompleted(levelId: string, diff: 'easy' | 'medium' | 'hard'): void {
    if (!this.data.completedDifficulties) this.data.completedDifficulties = {};
    if (!this.data.completedDifficulties[levelId]) {
      this.data.completedDifficulties[levelId] = {};
    }
    this.data.completedDifficulties[levelId][diff] = true;

    // Downward inheritance: Beating harder difficulty guarantees easier difficulty is marked complete
    if (diff === 'hard') {
      this.data.completedDifficulties[levelId]['medium'] = true;
      this.data.completedDifficulties[levelId]['easy'] = true;
    } else if (diff === 'medium') {
      this.data.completedDifficulties[levelId]['easy'] = true;
    }

    this.save();
  }

  public isDifficultyCompleted(levelId: string, diff: 'easy' | 'medium' | 'hard'): boolean {
    return !!(this.data.completedDifficulties?.[levelId]?.[diff]);
  }

  public isChapterDifficultyUnlocked(chapterNum: number, diff: DifficultyLevel): boolean {
    if (diff === 'easy') {
      if (chapterNum === 1) return true;
      const prevChapterEnd = (chapterNum - 1) * 10;
      const prevBossId = `level_${String(prevChapterEnd).padStart(2, '0')}`;
      return this.isDifficultyCompleted(prevBossId, 'easy') ||
             this.isDifficultyCompleted(prevBossId, 'medium') ||
             this.isDifficultyCompleted(prevBossId, 'hard') ||
             this.data.highestLevel > prevChapterEnd;
    }
    if (diff === 'medium') {
      const chapterEnd = chapterNum * 10;
      const chapterBossId = `level_${String(chapterEnd).padStart(2, '0')}`;
      return this.isDifficultyCompleted(chapterBossId, 'easy') ||
             this.isDifficultyCompleted(chapterBossId, 'medium') ||
             this.isDifficultyCompleted(chapterBossId, 'hard') ||
             this.data.highestLevel > chapterEnd;
    }
    if (diff === 'hard') {
      const chapterEnd = chapterNum * 10;
      const chapterBossId = `level_${String(chapterEnd).padStart(2, '0')}`;
      return this.isDifficultyCompleted(chapterBossId, 'medium') ||
             this.isDifficultyCompleted(chapterBossId, 'hard');
    }
    return false;
  }

  public isLevelUnlocked(levelNum: number, diff: DifficultyLevel = 'easy'): boolean {
    const chapterNum = Math.floor((levelNum - 1) / 10) + 1;
    if (!this.isChapterDifficultyUnlocked(chapterNum, diff)) {
      return false;
    }
    const chapterStart = (chapterNum - 1) * 10 + 1;
    if (levelNum === chapterStart) {
      return true;
    }
    const prevLevelNum = levelNum - 1;
    const prevLevelId = `level_${String(prevLevelNum).padStart(2, '0')}`;

    if (diff === 'easy') {
      return levelNum <= this.data.highestLevel ||
             this.isDifficultyCompleted(prevLevelId, 'easy') ||
             this.isDifficultyCompleted(prevLevelId, 'medium') ||
             this.isDifficultyCompleted(prevLevelId, 'hard');
    }
    if (diff === 'medium') {
      return this.isDifficultyCompleted(prevLevelId, 'medium') ||
             this.isDifficultyCompleted(prevLevelId, 'hard');
    }
    return this.isDifficultyCompleted(prevLevelId, 'hard');
  }

  public unlockRealm(realmId: string): boolean {
    if (!this.data.unlockedRealms) this.data.unlockedRealms = ['yokai'];
    if (!this.data.unlockedRealms.includes(realmId)) {
      this.data.unlockedRealms.push(realmId);
      this.save();
      return true;
    }
    return false;
  }

  public isRealmUnlocked(realmId: string): boolean {
    if (realmId === 'yokai') return true;
    return !!(this.data.unlockedRealms && this.data.unlockedRealms.includes(realmId));
  }

  public setActiveRealm(realmId: string): void {
    this.data.activeRealm = realmId;
    this.save();
  }

  public getActiveRealm(): string {
    return this.data.activeRealm || 'yokai';
  }

  /**
   * Generates a portable, checksummed base64 backup code for offline transfer
   */
  public exportSaveCode(): string {
    const jsonStr = JSON.stringify(this.data);
    const b64 = btoa(encodeURIComponent(jsonStr));
    let hash = 0;
    for (let i = 0; i < b64.length; i++) {
      hash = ((hash << 5) - hash + b64.charCodeAt(i)) & 0xffff;
    }
    const checksum = Math.abs(hash).toString(16).padStart(4, '0');
    return `YOKAI-v1-${b64}-${checksum}`;
  }

  /**
   * Imports and restores a backup code. Returns success or descriptive error.
   */
  public importSaveCode(rawCode: string): { success: boolean; message: string } {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, message: 'Mã sao lưu không được để trống!' };
    }
    const trimmed = rawCode.trim();
    if (!trimmed.startsWith('YOKAI-v1-')) {
      return { success: false, message: 'Định dạng mã sao lưu không đúng (cần bắt đầu bằng YOKAI-v1-)!' };
    }
    const parts = trimmed.split('-');
    if (parts.length < 4) {
      return { success: false, message: 'Cấu trúc mã sao lưu không hợp lệ!' };
    }
    const checksum = parts[parts.length - 1];
    const b64 = parts.slice(2, parts.length - 1).join('-');

    // Validate checksum
    let hash = 0;
    for (let i = 0; i < b64.length; i++) {
      hash = ((hash << 5) - hash + b64.charCodeAt(i)) & 0xffff;
    }
    const expectedChecksum = Math.abs(hash).toString(16).padStart(4, '0');
    if (checksum !== expectedChecksum) {
      return { success: false, message: 'Mã sao lưu bị sai hoặc thiếu ký tự (Checksum mismatch)!' };
    }

    try {
      const decodedJson = decodeURIComponent(atob(b64));
      const parsed = JSON.parse(decodedJson);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.version !== 'number') {
        return { success: false, message: 'Dữ liệu sao lưu không đúng định dạng game!' };
      }

      this.data = this.sanitize(parsed);
      this.save();
      return { success: true, message: 'Khôi phục tiến trình thành công!' };
    } catch (e: any) {
      return { success: false, message: `Lỗi giải mã: ${e?.message || 'Chuỗi hỏng'}` };
    }
  }

  /**
   * Reset save to factory default
   */
  public resetToDefault(): void {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    this.save();
  }
}
