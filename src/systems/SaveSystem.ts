import { UserSaveData } from '../types';

const STORAGE_KEY = 'yokai_onet_save_v1';

const DEFAULT_SAVE: UserSaveData = {
  version: 1,
  coins: 300,
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
  selectedCompanion: 'inari_kitsune',
  unlockedCompanions: ['inari_kitsune'],
  boosters: {
    hint: 5,
    shuffle: 3,
    bomb: 2
  },
  settings: {
    sound: true,
    music: true,
    vibration: true
  },
  relicsCollected: {},
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save game data to localStorage', e);
    }
  }

  private load(): UserSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          selectedTheme: (parsed.selectedTheme && parsed.selectedTheme !== 'pikachu') ? parsed.selectedTheme : 'yokai',
          boosters: { ...DEFAULT_SAVE.boosters, ...(parsed.boosters || {}) },
          discoveredCharacters: { ...DEFAULT_SAVE.discoveredCharacters, ...(parsed.discoveredCharacters || {}) },
          relicsCollected: { ...(DEFAULT_SAVE.relicsCollected || {}), ...(parsed.relicsCollected || {}) },
          badgesCollected: { ...(DEFAULT_SAVE.badgesCollected || {}), ...(parsed.badgesCollected || {}) },
          completedDifficulties: { ...(DEFAULT_SAVE.completedDifficulties || {}), ...(parsed.completedDifficulties || {}) },
          unlockedRealms: (Array.isArray(parsed.unlockedRealms) && parsed.unlockedRealms.length > 0) ? parsed.unlockedRealms : ['yokai'],
          activeRealm: parsed.activeRealm || 'yokai'
        };
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
    this.data.coins += amount;
    this.save();
    return this.data.coins;
  }

  public spendCoins(amount: number): boolean {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public recordLevelCompleted(levelId: string, levelNum: number, starsEarned: number): void {
    const existingStars = this.data.levelStars[levelId] || 0;
    if (starsEarned > existingStars) {
      this.data.stars += (starsEarned - existingStars);
      this.data.levelStars[levelId] = starsEarned;
    }
    if (levelNum >= this.data.highestLevel) {
      this.data.highestLevel = levelNum + 1;
    }
    this.save();
  }

  public getLevelStars(levelId: string): number {
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

  public getSelectedTheme(): string {
    return (this.data.selectedTheme && this.data.selectedTheme !== 'pikachu') ? this.data.selectedTheme : 'yokai';
  }

  public setSelectedTheme(theme: string): void {
    this.data.selectedTheme = theme;
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
      this.save();
    }
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
    this.save();
  }

  public isDifficultyCompleted(levelId: string, diff: 'easy' | 'medium' | 'hard'): boolean {
    return !!(this.data.completedDifficulties?.[levelId]?.[diff]);
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
}
