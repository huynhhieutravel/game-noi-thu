import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions, setupRetinaCamera } from '../constants';
import levelsData from '../data/levels.json';
import bossesData from '../data/bosses.json';
import { BoardManager } from '../game/Board';
import { BoardGenerator } from '../game/BoardGenerator';
import { BossManager } from '../game/BossManager';
import { CharacterRegistry } from '../game/CharacterRegistry';
import { ComboSystem } from '../game/ComboSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { CompanionManager } from '../game/CompanionManager';
import { CompanionModal } from '../game/CompanionModal';
import { LevelManager } from '../game/LevelManager';
import { RelicManager } from '../game/RelicManager';
import { BoardMovement, BossConfig, CompanionConfig, DifficultyLevel, GridPoint, LevelConfig, TileState } from '../types';
import { TextureGenerator } from '../game/TextureGenerator';
import { QADebugPanel } from '../game/QADebugPanel';
import { SettingsModal } from '../game/SettingsModal';
import { LootManager, CalculatedLootResult } from '../game/LootManager';
import { formatCurrency, FONT_UI, FONT_DISPLAY, FONT_WEIGHT } from '../styles/typography';

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig;
  private boardManager!: BoardManager;
  private comboSystem!: ComboSystem;
  private bossManager: BossManager | null = null;
  private audio!: AudioSystem;
  private haptic!: HapticSystem;
  private save!: SaveSystem;
  private qaDebugPanel!: QADebugPanel;

  // Pet Companion System
  private companionConfig!: CompanionConfig;
  private companionEnergy: number = 0; // 0 to 100
  private companionPod!: Phaser.GameObjects.Container;
  private companionPodBorder!: Phaser.GameObjects.Graphics;
  private companionEnergyGraphics!: Phaser.GameObjects.Graphics;
  private companionEnergyText!: Phaser.GameObjects.Text;
  private companionAvatarImg: Phaser.GameObjects.GameObject | null = null;
  private companionNameText!: Phaser.GameObjects.Text;
  private companionReadyBadge!: Phaser.GameObjects.Text;
  private isCompanionSkillReady: boolean = false;
  private isSkillRechargeLocked: boolean = false;
  private companionPulseTween: Phaser.Tweens.Tween | null = null;

  // Equipped Relic Pod System (Bottom-Right)
  private relicEnergy: number = 0;
  private isRelicSkillReady: boolean = false;
  private relicPulseTween: Phaser.Tweens.Tween | null = null;
  private relicPod!: Phaser.GameObjects.Container;
  private relicPodBorder!: Phaser.GameObjects.Graphics;
  private relicAvatarImg: Phaser.GameObjects.GameObject | null = null;
  private relicNameText!: Phaser.GameObjects.Text;
  private relicEnergyGraphics!: Phaser.GameObjects.Graphics;
  private relicEnergyText!: Phaser.GameObjects.Text;
  private relicReadyBadge!: Phaser.GameObjects.Text;

  private isTimeFrozen: boolean = false;
  private freezeTimeRemaining: number = 0;
  private frostOverlayGraphics!: Phaser.GameObjects.Graphics;
  private byakkoGravityLockRemaining: number = 0;
  private genbuShieldCharges: number = 0;
  private genbuExtraLifeUsed: boolean = false;
  private raijuScoreMultiplierMoves: number = 0;
  private raijuScoreMultiplier: number = 1.0;
  private orochiBossDamageBuffRemaining: number = 0;
  private orochiBossDamageMultiplier: number = 1.0;
  private kirinMatchCounter: number = 0;
  private kirinTimeHealedTotal: number = 0;
  private yatagarasuIdleTimer: number = 0;

  private get maxCompanionEnergy(): number {
    const id = this.companionConfig?.id;
    if (this.companionConfig?.isApexSSR || id === 'orochi_serpent') return 140;
    if (id === 'inari_kitsune' || id === 'byakko_tiger' || id === 'raiju_thunder') return 115;
    return 100;
  }

  // 🌙 Giờ Bách Quỷ Dạ Hành (Night Parade Rush)
  private isNightParadeActive: boolean = false;
  private nightParadeTimeRemaining: number = 0;
  private nightParadeMaxDuration: number = 10.0;
  private hasTriggeredLowTimeRush: boolean = false;
  private nightParadeOverlay: Phaser.GameObjects.Container | null = null;
  private nightParadeTimerPill: Phaser.GameObjects.Container | null = null;
  private nightParadeTimerText: Phaser.GameObjects.Text | null = null;
  private nightParadeTimerBarGfx: Phaser.GameObjects.Graphics | null = null;
  private nightParadeFadeTween: Phaser.Tweens.Tween | null = null;
  private nightParadeOverlayFadeTween: Phaser.Tweens.Tween | null = null;
  private lastNightParadeSec: number = -1;
  private lastNightParadeUrgent: boolean = false;

  // Game metrics
  private score: number = 0;
  private timeRemaining: number = 180;
  private elapsedTimeSeconds: number = 0;
  private isGameOver: boolean = false;
  private isVictory: boolean = false;
  private isZenMode: boolean = false;

  // UI Elements
  private timerBarGraphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private feverBanner!: Phaser.GameObjects.Container;
  private feverParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private audioToggleIcon!: Phaser.GameObjects.Text;

  // Boss UI
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;
  private bossHeadsContainer!: Phaser.GameObjects.Container;
  private bossWarningText!: Phaser.GameObjects.Text;
  private bossSprite: Phaser.GameObjects.Image | null = null;
  private bossContainer: Phaser.GameObjects.Container | null = null;
  private isBossDefeatedSequence: boolean = false;
  private isBossDefeatedThisRun: boolean = false;

  // Booster UI Texts
  private hintCountText!: Phaser.GameObjects.Text;
  private shuffleCountText!: Phaser.GameObjects.Text;
  private bombCountText!: Phaser.GameObjects.Text;

  // 4. ⭐ Hệ Thống Nhiệm Vụ 3 Sao Mỗi Màn (Star Quests)
  private maxComboAchieved: number = 0;
  private playerUsedBoosterCount: number = 0;
  private hasNotifiedComboQuest: boolean = false;
  private questTrackerStarsText: Phaser.GameObjects.Text | null = null;

  // 6. 🏆 Đa Độ Khó (Difficulty) & Mảnh Cổ Vật (Relic Shards) & Thống Kê Nhiệm Vụ
  private currentDifficulty: DifficultyLevel = 'easy';
  private isRelicShardCollectedThisRun: boolean = false;
  private isRelicShardSpawnedThisRun: boolean = false;
  private brokenIceCount: number = 0;
  private brokenStoneCount: number = 0;
  private brokenCagesCount: number = 0;
  private playerUsedShuffleCount: number = 0;

  // 5. ❄️ Chế Độ Sinh Tồn Dâng Trào (Survival Blizzard Mode)
  private isSurvivalMode: boolean = false;
  private survivalWave: number = 1;
  private blizzardTimeRemaining: number = 10.0;
  private readonly BLIZZARD_WAVE_INTERVAL: number = 10.0;
  private isBlizzardPushing: boolean = false;
  private ceilingWarningBanner: Phaser.GameObjects.Container | null = null;
  private levelTitleText!: Phaser.GameObjects.Text;
  private readonly TIMER_BAR_W: number = 390;
  private readonly TIMER_BAR_H: number = 17;
  private readonly TIMER_BAR_Y: number = 33;

  // Classic Pikachu Life & Countdown System
  private lives: number = 10;
  private livesText!: Phaser.GameObjects.Text;
  private lastTickSecond: number = -1;
  private gameOverReason: string = 'Hết thời gian thử thách!';

  constructor() {
    super('GameScene');
  }

  public init(data: { levelId?: string; lives?: number; isZenMode?: boolean; isSurvivalMode?: boolean; bossId?: string; difficulty?: DifficultyLevel }): void {
    this.isZenMode = !!data.isZenMode;
    this.isSurvivalMode = !!data.isSurvivalMode;
    this.isBossDefeatedSequence = false;
    this.isBossDefeatedThisRun = false;
    this.currentDifficulty = data.difficulty || 'easy';
    this.isRelicShardCollectedThisRun = false;
    this.isRelicShardSpawnedThisRun = false;
    this.brokenIceCount = 0;
    this.brokenStoneCount = 0;
    this.brokenCagesCount = 0;
    this.playerUsedShuffleCount = 0;
    this.playerUsedBoosterCount = 0;
    this.maxComboAchieved = 0;
    const levelId = data.levelId || 'level_01';

    // Check selected theme from save system
    const save = SaveSystem.getInstance();
    const currentTheme = save.getSelectedTheme();
    const themeChars = CharacterRegistry.getByCollection(currentTheme);

    if (data.bossId) {
      // 👑 Khiêu Chiến Boss Trực Tiếp từ Đấu Trường 16 Boss Thế Giới
      const bList = bossesData as any[];
      const bData = bList.find((b: any) => b.id === data.bossId || b.id === 'boss_' + data.bossId || b.id.replace('boss_', '') === data.bossId) || bList[0];
      const bossConfig: BossConfig = {
        id: bData.id,
        name: bData.name,
        japaneseName: bData.native_name || bData.title,
        native_name: bData.native_name,
        title: bData.title,
        element: bData.element,
        symbol: bData.symbol,
        theme: bData.theme,
        image: bData.id,
        maxHp: bData.max_hp || 560,
        actionIntervalSeconds: bData.action_interval || 7,
        headsOrParts: bData.parts || 8,
        parts: bData.parts || 8,
        part_name: bData.part_name || 'Bộ Phận',
        skills: bData.skills || [],
        desc: bData.desc
      };

      const bThemeChars = CharacterRegistry.getByCollection(bData.theme || currentTheme);
      this.levelConfig = {
        id: `boss_${bData.id}`,
        levelNumber: 30,
        worldId: bData.theme || 'yokai',
        title: `👑 ĐẠI CHIẾN: ${bData.name} (${bData.title})`,
        rows: 8,
        columns: 12,
        timeLimit: 240,
        movement: 'chaos',
        modifiers: {
          iceCount: 4,
          stoneCount: 2,
          thornCount: 2,
          barricadeCount: 2
        },
        characterPool: (bThemeChars.length >= 10 ? bThemeChars : themeChars).map(c => c.id).slice(0, 24),
        boss: bossConfig,
        rewards: {
          coins: 1500,
          stars: 3
        }
      };
      this.lives = data.lives !== undefined ? data.lives : 8;
      this.timeRemaining = this.levelConfig.timeLimit;
    } else if (this.isSurvivalMode) {
      // 5. ❄️ Chế Độ Sinh Tồn Dâng Trào (Survival Blizzard Mode)
      // 8 hàng x 10 cột, khởi đầu 4 hàng dưới, mỗi 10s dâng 1 hàng lên
      const nonBossThemeChars = CharacterRegistry.getNonBossByCollection(currentTheme);
      this.levelConfig = {
        id: 'survival_blizzard',
        levelNumber: 0,
        worldId: 'survival',
        title: '❄️ Sinh Tồn Bão Tuyết (Survival Blizzard)',
        rows: 8,
        columns: 10,
        timeLimit: 999999,
        movement: 'none',
        characterPool: (nonBossThemeChars.length >= 8 ? nonBossThemeChars : themeChars)
          .filter(c => !CharacterRegistry.isBoss(c))
          .map(c => c.id),
        rewards: { stars: 3, coins: 0 }
      };
      this.lives = 5;
      this.timeRemaining = 999999;
      this.survivalWave = 1;
      this.blizzardTimeRemaining = this.BLIZZARD_WAVE_INTERVAL;
      this.isBlizzardPushing = false;
    } else if (this.isZenMode) {
      // Endless Relaxing Mode: 6x8 board, no gravity, pure zen matching
      const nonBossThemeChars = CharacterRegistry.getNonBossByCollection(currentTheme);
      this.levelConfig = {
        id: 'zen_mode',
        levelNumber: 0,
        worldId: 'zen',
        title: '🌸 Chế Độ Thư Giãn (Zen Vô Tận)',
        rows: 6,
        columns: 8,
        timeLimit: 999999,
        movement: 'none',
        characterPool: (nonBossThemeChars.length >= 8 ? nonBossThemeChars : themeChars)
          .filter(c => !CharacterRegistry.isBoss(c))
          .map(c => c.id),
        rewards: { stars: 3, coins: 100 }
      };
      this.lives = 999;
      this.timeRemaining = 999999;
    } else {
      this.levelConfig = LevelManager.getLevelConfig(levelId, currentTheme, this.currentDifficulty);
      this.lives = data.lives !== undefined ? data.lives : 5;
      this.timeRemaining = this.levelConfig.timeLimit;
      this.elapsedTimeSeconds = 0;
    }

    this.score = 0;
    this.lastTickSecond = -1;
    this.isGameOver = false;
    this.isVictory = false;
  }

  public preload(): void {
    const rawDigits = (this.levelConfig?.id || '').replace(/\D/g, '');
    const parsedNum = this.levelConfig?.levelNumber || (rawDigits ? parseInt(rawDigits, 10) : 1);
    const lvlNum = !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : 1;
    const stageKey = `stage_bg_${lvlNum}`;
    if (!this.textures.exists(stageKey)) {
      this.load.image(stageKey, `assets/stages/stage_bg_${lvlNum}.png`);
      this.load.image(`bg${lvlNum}`, `assets/stages/stage_bg_${lvlNum}.png`);
    }

    // Load boss arena if this is a boss level
    if (this.levelConfig?.id?.startsWith('boss_') || this.levelConfig?.boss) {
      const bList = bossesData as any[];
      const bIdx = bList.findIndex((b: any) => b.id === this.levelConfig.boss?.id || 'boss_' + b.id === this.levelConfig.boss?.id);
      const arenaNum = (bIdx >= 0 ? (bIdx % 10) : 0) + 1;
      const arenaKey = `boss_arena_${arenaNum}`;
      if (!this.textures.exists(arenaKey)) {
        this.load.image(arenaKey, `assets/boss_arenas/boss_arena_${arenaNum}.png`);
      }
    }
  }

  public onObstacleDestroyed(type: string): void {
    if (type === 'ice') this.brokenIceCount++;
    else if (type === 'stone') this.brokenStoneCount++;
    else if (type === 'lock' || type === 'barricade' || type === 'thorn' || type === 'cage') this.brokenCagesCount++;
  }

  public create(): void {
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    // Ensure all characters in current level have textures
    if (this.levelConfig?.characterPool) {
      for (const charId of this.levelConfig.characterPool) {
        TextureGenerator.ensureCharacterTexture(this, charId);
      }
    }

    this.audio = AudioSystem.getInstance();
    this.haptic = HapticSystem.getInstance();
    this.save = SaveSystem.getInstance();
    this.companionConfig = CompanionManager.get(this.save.getSelectedCompanion());
    this.companionEnergy = 0;
    this.isCompanionSkillReady = false;
    this.isSkillRechargeLocked = false;
    this.relicEnergy = 0;
    this.isRelicSkillReady = false;
    this.isTimeFrozen = false;
    this.freezeTimeRemaining = 0;
    this.isNightParadeActive = false;
    this.nightParadeTimeRemaining = 0;
    this.hasTriggeredLowTimeRush = false;
    this.byakkoGravityLockRemaining = 0;
    this.genbuShieldCharges = 0;
    this.genbuExtraLifeUsed = false;
    this.raijuScoreMultiplierMoves = 0;
    this.raijuScoreMultiplier = 1.0;
    this.orochiBossDamageBuffRemaining = 0;
    this.orochiBossDamageMultiplier = 1.0;
    this.kirinMatchCounter = 0;
    this.kirinTimeHealedTotal = 0;
    this.yatagarasuIdleTimer = 0;

    // Reset Star Quests tracking
    this.maxComboAchieved = 0;
    this.playerUsedBoosterCount = 0;
    this.hasNotifiedComboQuest = false;

    // Clean up timers & tweens on scene shutdown
    this.events.once('shutdown', () => {
      this.endNightParadeRush();
      if (this.nightParadeFadeTween) {
        this.nightParadeFadeTween.stop();
        this.nightParadeFadeTween = null;
      }
      if (this.nightParadeOverlayFadeTween) {
        this.nightParadeOverlayFadeTween.stop();
        this.nightParadeOverlayFadeTween = null;
      }
      if (this.companionPulseTween) {
        this.companionPulseTween.stop();
        this.companionPulseTween = null;
      }
      if (this.relicPulseTween) {
        this.relicPulseTween.stop();
        this.relicPulseTween = null;
      }
      if (this.feverParticles) {
        try {
          this.feverParticles.destroy();
        } catch {}
      }
      try {
        this.boardManager?.destroy();
      } catch {}
    });

    // 1. Crystal-clear HD Gameplay Background (Individual Stage Background for Japan stages 1-10, fallback to Shrine)
    const { width: screenW, offsetX } = getScreenDimensions();
    const rawDigits = (this.levelConfig?.id || '').replace(/\D/g, '');
    const parsedNum = this.levelConfig?.levelNumber || (rawDigits ? parseInt(rawDigits, 10) : 1);
    const lvlNum = !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : 1;
    const chapter = LevelManager.getChapterByLevel(lvlNum);
    const worldTheme = this.levelConfig?.worldId || chapter?.worldId || 'yokai';
    
    let bgKey = '';
    // If directly challenged from Boss Arena, use dedicated Boss Arena battlefield
    if (this.levelConfig?.id?.startsWith('boss_') || this.levelConfig?.boss) {
      const bList = bossesData as any[];
      const bIdx = bList.findIndex((b: any) => b.id === this.levelConfig.boss?.id || 'boss_' + b.id === this.levelConfig.boss?.id);
      const arenaNum = (bIdx >= 0 ? (bIdx % 10) : 0) + 1;
      if (this.textures.exists(`boss_arena_${arenaNum}`)) {
        bgKey = `boss_arena_${arenaNum}`;
      }
    }

    if (!bgKey) {
      if (this.textures.exists(`stage_bg_${lvlNum}`)) {
        bgKey = `stage_bg_${lvlNum}`;
      } else if (this.textures.exists(`bg${lvlNum}`)) {
        bgKey = `bg${lvlNum}`;
      } else if ((worldTheme === 'egypt' || (lvlNum >= 11 && lvlNum <= 20)) && this.textures.exists('bg_egypt_nile')) {
        bgKey = 'bg_egypt_nile';
      } else if (this.textures.exists(`bg_theme_${worldTheme}`)) {
        bgKey = `bg_theme_${worldTheme}`;
      } else if (this.textures.exists('bg_gameplay_shrine')) {
        bgKey = 'bg_gameplay_shrine';
      } else if (this.textures.exists('bg_main_torii')) {
        bgKey = 'bg_main_torii';
      }
    }

    if (bgKey && this.textures.exists(bgKey)) {
      this.add.image(GAME_WIDTH / 2, height / 2, bgKey)
        .setDisplaySize(screenW, height)
        .setDepth(0);
    } else {
      const bg = this.add.graphics().setDepth(0);
      if (this.isSurvivalMode) {
        bg.fillGradientStyle(0x0a192f, 0x0a192f, 0x020813, 0x020813, 1);
      } else {
        bg.fillGradientStyle(0x181426, 0x181426, 0x090a10, 0x090a10, 1);
      }
      bg.fillRect(-offsetX, 0, screenW, height);
    }

    // 2. Sakura particle emitter (subtle normally, intense on fever)
    this.setupSakuraParticles();

    // 3. Initialize Combo System
    this.comboSystem = new ComboSystem({
      onComboChanged: (combo, multiplier) => {
        this.showComboPopup(combo, multiplier);
      },
      onFeverEnter: () => {
        this.enterFeverMode();
      },
      onFeverExit: () => {
        this.exitFeverMode();
      },
      onComboReset: () => {
        this.comboText.setVisible(false);
      }
    });

    // 🐾 Apply Companion Combo Window Bonus
    if (this.companionConfig?.id) {
      const compStats = this.save.getCompanionTotalStats(this.companionConfig.id);
      if (compStats.comboTimeBonusSec > 0) {
        this.comboSystem.setBonusComboWindow(compStats.comboTimeBonusSec);
      }
    }

    // 4. Initialize Boss System (if level has boss)
    if (this.levelConfig.boss) {
      this.bossManager = new BossManager(this.levelConfig.boss, {
        onDamaged: (currentHp, maxHp, damage) => {
          this.updateBossHpVisual(currentHp, maxHp);
          this.showDamagePopup(damage);
          this.triggerBossHitReaction(damage);
        },
        onHeadSevered: (headsLeft, total) => {
          this.updateBossHeadsVisual(headsLeft, total);
          this.triggerBossPartSeveredVisual();
          const bossCfg = this.bossManager?.getBossConfig();
          const partTitle = bossCfg?.part_name || 'BỘ PHẬN';
          this.showNotice(`💥 ĐÃ PHÁ HỦY 1 ${partTitle.toUpperCase()}! (Còn ${headsLeft}/${total}) Thưởng +5s!`, 0xff595e);
          this.timeRemaining = Math.min(this.levelConfig.timeLimit + 30, this.timeRemaining + 5);
          this.showBonusTimePopup(5);
          this.audio.playBossHit();
          this.haptic.heavy();
        },
        onBossSkillTriggered: (skillName, desc, skillType, swappedPairs) => {
          this.triggerBossSkillCastVisual();
          const isTimeDrain = skillType === 'time_drain' || skillType === 'acid_breath' ||
            skillType === 'dragon_roar' || skillType === 'ten_head_roar' ||
            skillType === 'plasma_cannon' || skillType === 'event_horizon' ||
            skillType === 'crown_jewel_blast' || skillType === 'inferno_breath' ||
            skillType === 'solar_flare';
          if (isTimeDrain) {
            this.timeRemaining = Math.max(1, this.timeRemaining - 5);
            this.showNotice(`⏳ ${skillName}: BỊ HÚT MẤT 5 GIÂY!`, 0xff3366);
            this.showBonusTimePopup(-5);
          } else {
            this.showNotice(`⚠️ BOSS: ${skillName}!`, 0xff99c8);
          }
          this.audio.playError();
          this.haptic.error();
          if (this.boardManager) {
            // Only clear selection if currently selected tile was affected by the skill!
            const selectedTile = this.boardManager.getSelectedTile();
            if (selectedTile) {
              const isSwapped = swappedPairs?.some(p => p.t1 === selectedTile || p.t2 === selectedTile);
              if (selectedTile.modifier === 'ice' || selectedTile.modifier === 'stone' || selectedTile.modifier === 'web' || selectedTile.modifier === 'barricade' || selectedTile.isCleared || isSwapped) {
                this.boardManager.clearSelection();
              }
            }
            this.boardManager.clearHint();

            if (swappedPairs && swappedPairs.length > 0) {
              this.boardManager.animateTileSwaps(swappedPairs, () => {
                this.boardManager.checkBoardStatus();
              });
            } else {
              this.boardManager.syncViewsAfterMovement();
              this.boardManager.checkBoardStatus();
            }
          }
        },
        onDefeated: () => {
          this.triggerBossDefeatSequence();
        }
      });
    } else {
      this.bossManager = null;
    }

    // 5. Initialize Board Manager
    this.boardManager = new BoardManager(this, this.levelConfig, {
      onTileSelected: (tile) => {
        this.audio.playSelect();
        this.haptic.light();
        this.showTileSelectionPill(tile);
      },
      onTileDeselected: () => {
        this.hideTileSelectionPill();
      },
      onMatchSuccess: (t1, t2, path, isAutoClear) => {
        this.hideTileSelectionPill();
        this.handleMatchSuccess(t1, t2, path, isAutoClear);
      },
      onMatchFailed: (t1, t2, reason) => {
        this.hideTileSelectionPill();
        this.audio.playError();
        this.haptic.error();
        if (reason === 'different_char') {
          // Penalty: deduct 2 seconds in timed modes to prevent blind tapping
          if (!this.isZenMode) {
            this.timeRemaining = Math.max(0, this.timeRemaining - 2);
            this.showBonusTimePopup(-2);
          }
          const char1 = CharacterRegistry.get(t1.characterId || '');
          const char2 = CharacterRegistry.get(t2.characterId || '');
          const name1 = char1 ? `${char1.symbol || ''} ${char1.name}` : 'Linh thú';
          const name2 = char2 ? `${char2.symbol || ''} ${char2.name}` : 'Linh thú';
          this.showNotice(`❌ Khác linh thú (-2s): ${name1} ≠ ${name2}`, 0xff758f);
        } else if (reason === 'blocked_path') {
          this.showNotice('🚧 Bị cản đường nối! (Tối đa 2 khúc gấp không bị che)', 0xffd166);
        }
      },
      onBoardCleared: () => {
        if (this.isSurvivalMode) {
          this.score += 1000;
          this.updateScoreDisplay();
          this.save.saveSurvivalRecord(this.score, this.survivalWave);
          this.audio.playVictory();
          this.haptic.combo();
          this.showNotice('🌸 QUÉT SẠCH TOÀN BÀN! THƯỞNG +1.000 PTS! ❄️', 0xffd700);
          this.feverParticles.explode(30, GAME_WIDTH / 2, GAME_HEIGHT / 2);
          this.time.delayedCall(1000, () => {
            if (!this.isGameOver) {
              this.triggerBlizzardPush();
            }
          });
        } else if (this.isZenMode) {
          this.score += 500;
          this.updateScoreDisplay();
          this.save.saveZenHighScore(this.score);
          this.audio.playVictory();
          this.haptic.combo();
          this.showNotice('🎉 BÀN MỚI! +500 PTS THƯỞNG! 🌸', 0x00f5d4);
          this.feverParticles.explode(24, GAME_WIDTH / 2, GAME_HEIGHT / 2);
          this.time.delayedCall(1200, () => {
            if (!this.isGameOver) {
              this.boardManager.initBoard();
            }
          });
        } else {
          this.handleVictory();
        }
      },
      onBoardReshuffled: (isAuto?: boolean) => {
        if (isAuto) {
          if (this.levelConfig.boss) {
            // Trong chế độ Boss, tự động đảo bàn là giải tỏa bí đường do dịch chuyển / chướng ngại vật của Boss, KHÔNG trừ mạng!
            this.showNotice('🔄 BÀN CỜ ĐÃ TỰ ĐỘNG ĐẢO VỊ TRÍ!', 0x00f5d4);
            this.audio.playShuffle();
          } else if (!this.isZenMode && !this.isSurvivalMode) {
            this.lives--;
            this.updateLivesDisplay();
            this.showNotice(`⚠️ HẾT ĐƯỜNG ĐI! TỰ ĐỘNG ĐẢO BÀN (Mạng còn: ${this.lives})`, 0xff595e);
            this.audio.playShuffle();
            if (this.lives <= 0) {
              this.handleGameOver('Bạn đã hết Mạng (❤️) do bị bí đường!');
              return;
            }
          } else {
            this.showNotice(this.isSurvivalMode ? '❄️ HẾT ĐƯỜNG ĐI! ĐÃ TỰ ĐỘNG ĐẢO BÀN' : '🌸 HẾT ĐƯỜNG ĐI! ĐÃ TỰ ĐỘNG ĐẢO BÀN', 0x00f5d4);
            this.audio.playShuffle();
          }
        } else {
          this.showNotice('Đang đảo bài (Reshuffled)...', 0xffd166);
          this.audio.playShuffle();
        }

        // Re-sync Relic Shard pair after reshuffle if spawned on board and not yet collected
        if (this.isRelicShardSpawnedThisRun && !this.isRelicShardCollectedThisRun && this.levelConfig.relicReward && !this.save.hasRelic(this.levelConfig.relicReward.id)) {
          this.boardManager.clearRelicShardTags();
          this.boardManager.tagRelicShardPair();
        }
      }
    });

    // Tag Relic Shard pair with calibrated rare spawn chance (1.0% - 5.0%)
    if (this.levelConfig.relicReward && !this.save.hasRelic(this.levelConfig.relicReward.id)) {
      const isBossLevel = !!(this.bossManager || this.levelConfig.levelNumber % 10 === 0 || this.levelConfig.levelNumber % 5 === 0);
      const spawnChance = this.currentDifficulty === 'hard'
        ? (isBossLevel ? 0.05 : 0.035)
        : this.currentDifficulty === 'medium'
          ? (isBossLevel ? 0.03 : 0.02)
          : (isBossLevel ? 0.015 : 0.01);

      if (Math.random() < spawnChance) {
        this.isRelicShardSpawnedThisRun = true;
        this.boardManager.tagRelicShardPair();
      }
    }

    // 6. Build Top HUD & Header
    this.buildHeader(width);

    // 7. Build Boss HUD if applicable
    if (this.bossManager) {
      this.buildBossHeader(width);
    }

    // 8. Build Bottom Booster Tray
    this.buildBoosterTray(width, height);

    // 9. Build Pet Companion Pod (Bottom-Left)
    this.buildCompanionPod(width, height);

    // 10. Build Equipped Relic Pod (Bottom-Right)
    this.buildRelicPod(width, height);

    // 11. Frost Overlay for Time Freeze
    this.frostOverlayGraphics = this.add.graphics().setDepth(120);

    // 11. QA Debug Cheats Panel
    this.qaDebugPanel = new QADebugPanel(this);
  }

  // ==========================================
  // 🐞 QA DEBUG CHEAT METHODS
  // ==========================================
  public triggerInstantWin(): void {
    if (this.isVictory || this.isGameOver) return;
    this.handleVictory();
  }

  public triggerInstantLose(): void {
    if (this.isVictory || this.isGameOver) return;
    this.handleGameOver('QA Forced Defeat');
  }

  public addTimeCheat(seconds: number = 60): void {
    if (this.isZenMode) return;
    this.timeRemaining += seconds;
    if (this.timeText) {
      this.timeText.setText(`⏳ ${Math.max(0, Math.ceil(this.timeRemaining))}s`);
    }
  }

  public triggerFeverCheat(): void {
    for (let i = 0; i < 5; i++) {
      this.comboSystem.registerMatch();
    }
  }

  public damageBossCheat(damage: number = 250): void {
    if (this.bossManager) {
      this.bossManager.applyDamage(damage);
    }
  }

  public damageBoss(damage: number): void {
    if (this.bossManager) {
      this.bossManager.applyDamage(damage);
    }
  }

  public triggerShuffleCheat(): void {
    if (this.boardManager) {
      this.boardManager.performShuffle(false);
    }
  }

  private setupSakuraParticles(): void {
    const { width: screenW, offsetX } = getScreenDimensions();
    this.feverParticles = this.add.particles(0, 0, 'particle_sakura', {
      x: { min: -offsetX, max: GAME_WIDTH + offsetX },
      y: -20,
      lifespan: 5000,
      speedY: { min: 60, max: 140 },
      speedX: { min: 20, max: 60 },
      scale: { min: 0.3, max: 0.6 },
      alpha: { start: 0.6, end: 0 },
      rotate: { start: 0, end: 360 },
      frequency: 450
    });
    this.feverParticles.setDepth(5);
  }

  private buildHeader(width: number): void {
    // Top Bar Container
    const topBar = this.add.container(0, 0).setDepth(20);

    // Back button (capsule style [ ⛩️ MENU ])
    const currentTheme = this.save.getSelectedTheme();
    const menuIcon = currentTheme === 'pikachu' ? '⚡' : '⛩️';

    const backBtnContainer = this.add.container(68, 25);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x191829, 0.92);
    backBg.fillRoundedRect(-44, -16, 88, 32, 16);
    backBg.lineStyle(1.2, 0x5a547a, 0.85);
    backBg.strokeRoundedRect(-44, -16, 88, 32, 16);

    const backTxt = this.add.text(0, 0, `${menuIcon} MENU`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15.5px',
      fontStyle: '900',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    const backHit = this.add.zone(0, 0, 88, 32).setInteractive({ useHandCursor: true });
    backHit.on('pointerover', () => backBtnContainer.setScale(1.05));
    backHit.on('pointerout', () => backBtnContainer.setScale(1.0));
    backHit.on('pointerdown', () => {
      this.audio.playSelect();
      this.endNightParadeRush();
      this.scene.start('MainMenuScene');
    });
    backBtnContainer.add([backBg, backTxt, backHit]);

    // Lives next to Menu button (In Zen mode: 🌸 Vô Tận)
    this.livesText = this.add.text(142, 25, this.isSurvivalMode ? `❤️ x${this.lives}` : (this.isZenMode ? '🌸 Vô Tận' : `❤️ x${this.lives}`), {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: this.isZenMode ? '#ff758f' : (this.isSurvivalMode ? '#00f5d4' : '#ff4d6d')
    }).setOrigin(0, 0.5);

    // Star Quest Tracker Pill Button (between lives and timer bar)
    const questPill = this.buildQuestTrackerHeaderPill();

    // Level Title (centered above timer bar with ornate Japanese shrine plaque)
    const cleanTitle = this.isSurvivalMode
      ? `❄️ BÃO TUYẾT • ĐỢT ${this.survivalWave}`
      : (this.isZenMode ? '🌸 TĨNH TÂM VÔ TẬN' : this.levelConfig.title.replace(/\s*\([^)]*\)/g, '').trim());

    const titleText = this.add.text(width / 2, 17, cleanTitle, {
      fontFamily: FONT_DISPLAY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: this.isSurvivalMode ? '#90e0ef' : '#ffd700',
      stroke: '#0e0b17',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.levelTitleText = titleText;

    const plaqueW = Math.max(300, Math.min(420, titleText.width + 64));
    const plaqueH = 28;
    const plaqueX = width / 2;
    const plaqueY = 17;

    const titlePillBg = this.add.graphics();
    // 1. Dark lacquer base
    titlePillBg.fillStyle(0x0c0b17, 0.96);
    titlePillBg.fillRoundedRect(plaqueX - plaqueW / 2, plaqueY - plaqueH / 2, plaqueW, plaqueH, 8);

    // 2. Stepped pagoda top beam accent
    titlePillBg.lineStyle(2, 0xd4af37, 1);
    titlePillBg.lineBetween(plaqueX - plaqueW / 2 + 12, plaqueY - plaqueH / 2, plaqueX + plaqueW / 2 - 12, plaqueY - plaqueH / 2);

    // 3. Ornate golden border
    titlePillBg.lineStyle(1.8, 0xd4af37, 0.95);
    titlePillBg.strokeRoundedRect(plaqueX - plaqueW / 2, plaqueY - plaqueH / 2, plaqueW, plaqueH, 6);

    // 4. Subtle inner golden hairline
    titlePillBg.lineStyle(1, 0xffd166, 0.4);
    titlePillBg.strokeRoundedRect(plaqueX - plaqueW / 2 + 3, plaqueY - plaqueH / 2 + 3, plaqueW - 6, plaqueH - 6, 4);

    // 5. Left & right traditional golden cloud swirl ornaments
    const lx = plaqueX - plaqueW / 2 + 12;
    titlePillBg.lineStyle(1.6, 0xffd166, 0.9);
    titlePillBg.beginPath();
    titlePillBg.arc(lx, plaqueY, 4.5, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(325), false);
    titlePillBg.strokePath();
    titlePillBg.fillStyle(0xffd166, 0.95);
    titlePillBg.fillCircle(lx + 2, plaqueY, 1.8);

    const rx = plaqueX + plaqueW / 2 - 12;
    titlePillBg.beginPath();
    titlePillBg.arc(rx, plaqueY, 4.5, Phaser.Math.DegToRad(215), Phaser.Math.DegToRad(145), false);
    titlePillBg.strokePath();
    titlePillBg.fillCircle(rx - 2, plaqueY, 1.8);

    // Timer Bar Background (centered directly below the plaque)
    const timerBarW = this.TIMER_BAR_W;
    const timerBarH = this.TIMER_BAR_H;
    const timerBarX = width / 2 - timerBarW / 2;
    const timerBarY = this.TIMER_BAR_Y;

    const timerBg = this.add.graphics();
    // Soft outer neon glow aura
    timerBg.lineStyle(4, 0x00b4d8, 0.22);
    timerBg.strokeRoundedRect(timerBarX - 1, timerBarY - 1, timerBarW + 2, timerBarH + 2, 9.5);

    // Dark obsidian glass track
    timerBg.fillStyle(0x070d18, 0.96);
    timerBg.fillRoundedRect(timerBarX, timerBarY, timerBarW, timerBarH, 8.5);

    // Glowing vibrant cyan outer stroke
    timerBg.lineStyle(1.8, 0x00f5d4, 0.95);
    timerBg.strokeRoundedRect(timerBarX, timerBarY, timerBarW, timerBarH, 8.5);

    // Left ornate diamond / lotus flourish clasping the left tip
    const capX = timerBarX;
    const capY = timerBarY + timerBarH / 2;
    timerBg.lineStyle(2, 0x00f5d4, 1);
    timerBg.beginPath();
    timerBg.moveTo(capX - 8, capY);
    timerBg.lineTo(capX - 2, capY - 6);
    timerBg.lineTo(capX + 4, capY);
    timerBg.lineTo(capX - 2, capY + 6);
    timerBg.closePath();
    timerBg.strokePath();

    timerBg.fillStyle(0x00f5d4, 1);
    timerBg.fillCircle(capX - 2, capY, 2.5);

    timerBg.lineStyle(1.5, 0x00f5d4, 0.8);
    timerBg.lineBetween(capX - 12, capY, capX - 8, capY);

    this.timerBarGraphics = this.add.graphics();
    this.updateTimerBar();

    // Time Label (placed right next to the timer bar)
    const initialTimeStr = this.isZenMode
      ? '∞'
      : this.levelConfig.isStopwatch
      ? '⏱️ 0:00 ⭐⭐⭐'
      : `⏳ ${Math.ceil(this.timeRemaining)}s`;
    this.timeText = this.add.text(timerBarX + timerBarW + 14, capY, initialTimeStr, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0, 0.5);

    // Audio toggle circle button (🔊 / 🔇)
    const audioBtnX = width - 150;
    const audioBtnY = 25;
    const audioBtnSize = 34;

    const audioBg = this.add.graphics();
    audioBg.fillStyle(0x131728, 0.92);
    audioBg.fillCircle(audioBtnX, audioBtnY, audioBtnSize / 2);
    audioBg.lineStyle(1.5, 0x00f5d4, 0.75);
    audioBg.strokeCircle(audioBtnX, audioBtnY, audioBtnSize / 2);

    this.audioToggleIcon = this.add.text(audioBtnX, audioBtnY, this.audio.getEnabled() ? '🔊' : '🔇', {
      fontSize: '16px'
    }).setOrigin(0.5);

    const audioHit = this.add.zone(audioBtnX, audioBtnY, audioBtnSize, audioBtnSize)
      .setInteractive({ useHandCursor: true });

    audioHit.on('pointerdown', () => {
      const enabled = this.audio.toggle();
      this.audioToggleIcon.setText(enabled ? '🔊' : '🔇');
      this.haptic.light();
      if (enabled) {
        this.audio.playSelect();
      }
    });

    // Settings Gear Button (⚙️)
    const setBtnX = audioBtnX - 42;
    const setBtnY = 25;
    const setBtnSize = 34;

    const setBg = this.add.graphics();
    setBg.fillStyle(0x131728, 0.92);
    setBg.fillCircle(setBtnX, setBtnY, setBtnSize / 2);
    setBg.lineStyle(1.5, 0xffd700, 0.75);
    setBg.strokeCircle(setBtnX, setBtnY, setBtnSize / 2);

    this.add.text(setBtnX, setBtnY, '⚙️', {
      fontSize: '16px'
    }).setOrigin(0.5);

    const setHit = this.add.zone(setBtnX, setBtnY, setBtnSize, setBtnSize)
      .setInteractive({ useHandCursor: true });

    setHit.on('pointerdown', () => {
      this.isPaused = true;
      this.audio.playSelect();
      this.haptic.light();
      SettingsModal.open(this, () => {
        this.isPaused = false;
        if (this.audioToggleIcon) {
          this.audioToggleIcon.setText(this.audio.getEnabled() ? '🔊' : '🔇');
        }
      });
    });

    // Score capsule (top right) matching mockup [ 💮 0 PTS ]
    const scoreCapW = 118;
    const scoreCapH = 32;
    const scoreCapX = width - 64;
    const scoreCapY = 25;

    const scoreCapBg = this.add.graphics();
    scoreCapBg.fillStyle(0x131728, 0.92);
    scoreCapBg.fillRoundedRect(scoreCapX - scoreCapW / 2, scoreCapY - scoreCapH / 2, scoreCapW, scoreCapH, 16);
    scoreCapBg.lineStyle(1.2, 0x4a4768, 0.85);
    scoreCapBg.strokeRoundedRect(scoreCapX - scoreCapW / 2, scoreCapY - scoreCapH / 2, scoreCapW, scoreCapH, 16);

    const scoreEmblem = this.add.text(scoreCapX - scoreCapW / 2 + 16, scoreCapY, '💮', {
      fontSize: '16px'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(scoreCapX + 10, scoreCapY, `${formatCurrency(this.score)} PTS`, {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Floating Combo popup text
    this.comboText = this.add.text(width / 2, 58, '', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '24px',
      fontStyle: '900',
      color: '#ff758f',
      stroke: '#3b0918',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);

    // Fever Banner
    this.feverBanner = this.add.container(width / 2, 58).setDepth(25).setVisible(false);
    const fvBg = this.add.graphics();
    fvBg.fillStyle(0xd90429, 0.95);
    fvBg.fillRoundedRect(-135, -16, 270, 32, 16);
    fvBg.lineStyle(2, 0xffd700, 1);
    fvBg.strokeRoundedRect(-135, -16, 270, 32, 16);

    const fvText = this.add.text(0, 0, '⚡ FEVER MODE x3.5! ⚡', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.feverBanner.add([fvBg, fvText]);

    // Ceiling Warning Banner (pulses when tiles approach row 1 / 2)
    this.ceilingWarningBanner = this.add.container(width / 2, 54).setDepth(30).setVisible(false);
    const wBg = this.add.graphics();
    wBg.fillStyle(0x3d0c11, 0.95);
    wBg.fillRoundedRect(-185, -15, 370, 30, 15);
    wBg.lineStyle(1.8, 0xff595e, 1);
    wBg.strokeRoundedRect(-185, -15, 370, 30, 15);

    const wTxt = this.add.text(0, 0, '⚠️ CẢNH BÁO: BĂNG DÂNG GẦN NÓC TRÊN! ⚠️', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#ff595e'
    }).setOrigin(0.5);
    this.ceilingWarningBanner.add([wBg, wTxt]);

    this.tweens.add({
      targets: this.ceilingWarningBanner,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    topBar.add([backBtnContainer, this.livesText, questPill, titlePillBg, titleText, timerBg, this.timerBarGraphics, this.timeText, audioBg, this.audioToggleIcon, audioHit, scoreCapBg, scoreEmblem, this.scoreText, this.comboText, this.feverBanner, this.ceilingWarningBanner]);
  }

  private updateLivesDisplay(): void {
    if (this.livesText) {
      this.livesText.setText(this.isZenMode ? '🌸 Vô Tận' : `❤️ x${this.lives}`);
      this.tweens.add({
        targets: this.livesText,
        scaleX: { from: 1.4, to: 1.0 },
        scaleY: { from: 1.4, to: 1.0 },
        duration: 220,
        ease: 'Back.easeOut'
      });
    }
  }

  private buildQuestTrackerHeaderPill(): Phaser.GameObjects.Container {
    const pillX = 248;
    const pillY = 25;
    const pillW = 120;
    const pillH = 30;

    const questContainer = this.add.container(pillX, pillY);

    const qBg = this.add.graphics();
    qBg.fillStyle(0x191628, 0.92);
    qBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 15);
    qBg.lineStyle(1.5, 0xffd700, 0.85);
    qBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 15);

    this.questTrackerStarsText = this.add.text(0, 0, '⭐ THỬ THÁCH', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const hitZone = this.add.zone(0, 0, pillW, pillH).setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => questContainer.setScale(1.05));
    hitZone.on('pointerout', () => questContainer.setScale(1.0));
    hitZone.on('pointerdown', () => {
      this.audio.playSelect();
      this.showQuestInfoTooltip();
    });

    questContainer.add([qBg, this.questTrackerStarsText, hitZone]);
    return questContainer;
  }

  private showQuestInfoTooltip(): void {
    if (this.isGameOver || this.isVictory) return;
    const tooltip = this.add.container(236, 125).setDepth(180);

    const bg = this.add.graphics();
    bg.fillStyle(0x19142b, 0.98);
    bg.fillRoundedRect(-165, -82, 330, 164, 14);
    bg.lineStyle(1.5, 0xffd700, 0.85);
    bg.strokeRoundedRect(-165, -82, 330, 164, 14);

    const diffName = this.currentDifficulty === 'easy' ? 'DỄ' : this.currentDifficulty === 'medium' ? 'VỪA' : 'KHÓ';
    const title = this.add.text(0, -58, `⭐ THỬ THÁCH 3 SAO (${diffName})`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const quests = this.levelConfig.quests || [
      { id: 'q1', type: 'clear', target: 1, description: 'Dọn sạch trước khi hết giờ', icon: '🎯' },
      { id: 'q2', type: 'combo', target: 5, description: 'Đạt chuỗi Combo liên tiếp x5', icon: '⚡' },
      { id: 'q3', type: 'no_booster', target: 0, description: 'Không dùng trợ giúp', icon: '✨' }
    ];

    const questTexts: Phaser.GameObjects.Text[] = [];
    quests.slice(0, 3).forEach((q: any, idx) => {
      let isDone = false;
      let statusStr = '';
      if (q.type === 'clear') {
        isDone = false;
        statusStr = '(Đang chơi)';
      } else if (q.type === 'combo') {
        isDone = this.maxComboAchieved >= q.target;
        statusStr = `(x${this.maxComboAchieved}/${q.target})`;
      } else if (q.type === 'no_booster') {
        isDone = this.playerUsedBoosterCount === 0;
        statusStr = `(Dùng: ${this.playerUsedBoosterCount})`;
      } else if (q.type === 'no_shuffle') {
        isDone = this.playerUsedShuffleCount === 0;
        statusStr = `(Đổi: ${this.playerUsedShuffleCount})`;
      } else if (q.type === 'time_left') {
        isDone = this.timeRemaining >= q.target;
        statusStr = `(Còn: ${Math.floor(this.timeRemaining)}s/${q.target}s)`;
      } else if (q.type === 'break_ice') {
        isDone = this.brokenIceCount >= q.target;
        statusStr = `(${this.brokenIceCount}/${q.target})`;
      } else if (q.type === 'break_stone') {
        isDone = this.brokenStoneCount >= q.target;
        statusStr = `(${this.brokenStoneCount}/${q.target})`;
      } else if (q.type === 'rescue_cages') {
        isDone = this.brokenCagesCount >= q.target;
        statusStr = `(${this.brokenCagesCount}/${q.target})`;
      }

      const qTxt = this.add.text(-150, -32 + idx * 25, `⭐ ${idx + 1}. ${q.description} ${statusStr} ${isDone ? '✓' : ''}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: isDone ? '#00f5d4' : '#ffd166',
        wordWrap: { width: 300 }
      });
      questTexts.push(qTxt);
    });

    const closeTxt = this.add.text(0, 52, '(Chạm để đóng)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5);

    tooltip.add([bg, title, ...questTexts, closeTxt]);

    const hit = this.add.zone(0, 0, 310, 150).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      tooltip.destroy();
    });
    tooltip.add(hit);

    this.time.delayedCall(4000, () => {
      if (tooltip && tooltip.active) {
        tooltip.destroy();
      }
    });
  }

  private buildBossHeader(width: number): void {
    const boss = this.bossManager!.getBossConfig();
    const bossContainer = this.add.container(width / 2, 70).setDepth(20);
    this.bossContainer = bossContainer;

    // 1. Resolve Boss Texture Key
    let bossTexture = boss.id;
    if (!this.textures.exists(bossTexture)) {
      if (this.textures.exists(`boss_${boss.id}`)) {
        bossTexture = `boss_${boss.id}`;
      } else if (this.textures.exists(boss.id.replace('boss_', '') + '_boss')) {
        bossTexture = boss.id.replace('boss_', '') + '_boss';
      } else if (this.textures.exists('boss_orochi')) {
        bossTexture = 'boss_orochi';
      }
    }

    // 2. Boss Avatar Frame (Left of HP Bar)
    const avatarX = -215;
    const avatarY = 12;
    const avatarRadius = 40;

    // Element color scheme
    let elementColor = 0xffd166;
    if (boss.element === 'fire') elementColor = 0xff4d6d;
    else if (boss.element === 'water') elementColor = 0x00b4d8;
    else if (boss.element === 'dark') elementColor = 0x9d4edd;
    else if (boss.element === 'lightning') elementColor = 0x3a86ff;
    else if (boss.element === 'nature') elementColor = 0x52b788;

    // Glowing Aura Ring behind Avatar
    const auraGlow = this.add.graphics();
    auraGlow.fillStyle(elementColor, 0.22);
    auraGlow.fillCircle(avatarX, avatarY, avatarRadius + 6);
    auraGlow.lineStyle(2, elementColor, 0.85);
    auraGlow.strokeCircle(avatarX, avatarY, avatarRadius + 3);
    bossContainer.add(auraGlow);

    // Dark Plate backing
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(0x0e0717, 0.95);
    avatarBg.fillCircle(avatarX, avatarY, avatarRadius);
    bossContainer.add(avatarBg);

    // Boss Sprite Graphic
    if (this.textures.exists(bossTexture)) {
      const bossSprite = this.add.image(avatarX, avatarY, bossTexture);
      bossSprite.setDisplaySize(76, 76);
      this.bossSprite = bossSprite;
      bossContainer.add(bossSprite);

      // Idle Breathing / Floating Animation
      this.tweens.add({
        targets: bossSprite,
        y: avatarY - 4,
        scaleX: bossSprite.scaleX * 1.05,
        scaleY: bossSprite.scaleY * 1.05,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Ornate Golden Border around Avatar
    const avatarFrame = this.add.graphics();
    avatarFrame.lineStyle(2.5, 0xffd700, 0.95);
    avatarFrame.strokeCircle(avatarX, avatarY, avatarRadius);
    bossContainer.add(avatarFrame);

    // Element / Symbol Badge at bottom of Avatar
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0x160c24, 0.95);
    badgeBg.fillCircle(avatarX, avatarY + avatarRadius - 4, 13);
    badgeBg.lineStyle(1.5, elementColor, 1);
    badgeBg.strokeCircle(avatarX, avatarY + avatarRadius - 4, 13);
    const badgeTxt = this.add.text(avatarX, avatarY + avatarRadius - 4, boss.symbol || '👑', {
      fontSize: '13px'
    }).setOrigin(0.5);
    bossContainer.add([badgeBg, badgeTxt]);

    // 3. Boss Information & Name Plate (Right of Avatar)
    const contentX = 35;
    const nameStr = `👑 TRÙM: ${boss.name} ${boss.native_name || boss.japaneseName ? `(${boss.native_name || boss.japaneseName})` : ''}`;
    const nameText = this.add.text(contentX, -17, nameStr, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16.5px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0.5);

    // Boss HP bar background
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x1a0509, 0.9);
    hpBg.fillRoundedRect(contentX - 170, -6, 340, 16, 8);
    hpBg.lineStyle(1.5, 0xff4d6d, 0.7);
    hpBg.strokeRoundedRect(contentX - 170, -6, 340, 16, 8);

    this.bossHpBar = this.add.graphics();
    this.updateBossHpVisual(this.bossManager!.getHp(), this.bossManager!.getMaxHp());

    this.bossHpText = this.add.text(contentX, 2, `${formatCurrency(this.bossManager!.getHp())} / ${formatCurrency(this.bossManager!.getMaxHp())} HP`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Parts / Heads display icons
    this.bossHeadsContainer = this.add.container(contentX, 22);
    this.updateBossHeadsVisual(this.bossManager!.getHeadsRemaining(), this.bossManager!.getTotalHeads());

    this.bossWarningText = this.add.text(contentX, 39, '', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0.5);

    bossContainer.add([nameText, hpBg, this.bossHpBar, this.bossHpText, this.bossHeadsContainer, this.bossWarningText]);
  }

  private updateBossHpVisual(currentHp: number, maxHp: number): void {
    if (!this.bossHpBar) return;
    this.bossHpBar.clear();
    const pct = Math.max(0, currentHp / maxHp);
    const contentX = 35;
    const barWidth = 336 * pct;

    this.bossHpBar.fillStyle(0xd90429, 1);
    this.bossHpBar.fillRoundedRect(contentX - 168, -5, barWidth, 14, 7);

    if (this.bossHpText) {
      this.bossHpText.setText(`${formatCurrency(Math.max(0, Math.ceil(currentHp)))} / ${formatCurrency(maxHp)} HP`);
    }
  }

  private updateBossHeadsVisual(headsLeft: number, total: number): void {
    if (!this.bossHeadsContainer) return;
    this.bossHeadsContainer.removeAll(true);
    const boss = this.bossManager?.getBossConfig();
    const symbol = boss?.symbol || '🐉';

    const startX = -((total - 1) * 22) / 2;
    for (let i = 0; i < total; i++) {
      const isAlive = i < headsLeft;
      const headIcon = this.add.text(startX + i * 22, 0, symbol, {
        fontSize: '15px'
      }).setOrigin(0.5);

      if (!isAlive) {
        headIcon.setAlpha(0.2);
      }
      this.bossHeadsContainer.add(headIcon);
    }
  }

  private triggerBossHitReaction(dmg: number): void {
    if (!this.bossSprite) return;
    this.bossSprite.setTint(0xff3333);
    const originX = this.bossSprite.x;
    this.tweens.add({
      targets: this.bossSprite,
      x: originX + 7,
      yoyo: true,
      duration: 45,
      repeat: 3,
      onComplete: () => {
        if (this.bossSprite) {
          this.bossSprite.x = originX;
          this.bossSprite.clearTint();
        }
      }
    });
  }

  private triggerBossPartSeveredVisual(): void {
    if (!this.bossSprite) return;
    this.bossSprite.setTint(0xffffff);
    this.cameras.main.shake(280, 0.015);
    this.time.delayedCall(160, () => {
      if (this.bossSprite) this.bossSprite.clearTint();
    });
  }

  private triggerBossSkillCastVisual(): void {
    if (!this.bossSprite) return;
    this.bossSprite.setTint(0xff99c8);
    this.cameras.main.shake(200, 0.008);
    this.tweens.add({
      targets: this.bossSprite,
      scaleX: this.bossSprite.scaleX * 1.25,
      scaleY: this.bossSprite.scaleY * 1.25,
      duration: 180,
      yoyo: true,
      onComplete: () => {
        if (this.bossSprite) this.bossSprite.clearTint();
      }
    });
  }

  private updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(`${formatCurrency(this.score)} PTS`);
    }
  }

  private buildBoosterTray(width: number, height: number): void {
    const saveData = this.save.getData();
    // 3 Circular Tactical Booster Action Gems (42px) anchored at height - 24
    // Compact spacing (58px) guarantees a massive 50px+ air gap below the board frame
    const tray = this.add.container(width / 2, height - 24).setDepth(20);

    const spacing = 58;

    // 1. Hint Gem (💡 - Amber radiant glow)
    const hintBtn = this.createBoosterButton(-spacing, 0, 42, '💡', 'Gợi Ý', `${saveData.boosters.hint}`, 0xffa200, () => {
      if (this.isGameOver || this.isVictory || this.isPaused || this.boardManager.isProcessing()) return;
      if (this.save.getData().boosters.hint <= 0) {
        this.showNotice('Hết Gợi Ý! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
        return;
      }
      const success = this.boardManager.showHint();
      if (success) {
        this.save.useBooster('hint');
        this.playerUsedBoosterCount++;
        this.audio.playHint();
        this.updateBoosterCounts();
      } else {
        this.showNotice('Không tìm thấy nước đi phù hợp!', 0xffd166);
        this.audio.playError();
      }
    });
    this.hintCountText = hintBtn.countText;

    // 2. Shuffle Gem (🔄 - Cyan electric glow)
    const shuffleBtn = this.createBoosterButton(0, 0, 42, '🔄', 'Đổi Vị Trí', `${saveData.boosters.shuffle}`, 0x00b4d8, () => {
      if (this.isGameOver || this.isVictory || this.isPaused || this.boardManager.isProcessing()) return;
      if (this.save.getData().boosters.shuffle <= 0) {
        this.showNotice('Hết Lượt Đảo! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
        return;
      }
      if (this.save.useBooster('shuffle')) {
        this.playerUsedBoosterCount++;
        this.playerUsedShuffleCount++;
        this.boardManager.performShuffle();
        this.audio.playShuffle();
        this.updateBoosterCounts();
      }
    });
    this.shuffleCountText = shuffleBtn.countText;

    // 3. Bomb Gem (💣 - Amethyst purple glow)
    const bombBtn = this.createBoosterButton(spacing, 0, 42, '💣', 'Phá Cặp', `${saveData.boosters.bomb}`, 0x9d4edd, () => {
      if (this.isGameOver || this.isVictory || this.isPaused || this.boardManager.isProcessing()) return;
      if (this.save.getData().boosters.bomb <= 0) {
        this.showNotice('Hết Bom! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
        return;
      }
      const success = this.boardManager.triggerBomb();
      if (success) {
        this.save.useBooster('bomb');
        this.playerUsedBoosterCount++;
        this.audio.playBossHit();
        this.updateBoosterCounts();
      } else {
        this.showNotice('Không tìm thấy cặp ô để phá!', 0xffd166);
        this.audio.playError();
      }
    });
    this.bombCountText = bombBtn.countText;

    tray.add([hintBtn.container, shuffleBtn.container, bombBtn.container]);
  }

  private buildCompanionPod(width: number, height: number): void {
    const podW = 216;
    const podH = 56;
    const podX = 130;
    const podY = height - 40;

    this.companionPod = this.add.container(podX, podY).setDepth(25);

    // Base background & border
    this.companionPodBorder = this.add.graphics();
    this.updatePodBackground();

    // Circular Avatar Container with glowing red halo
    const avatarHalo = this.add.graphics();
    avatarHalo.fillStyle(0x1a1226, 1);
    avatarHalo.fillCircle(-68, 0, 24);
    avatarHalo.lineStyle(2, 0xff3366, 0.95);
    avatarHalo.strokeCircle(-68, 0, 24);

    // Soft aura
    avatarHalo.fillStyle(0xff3366, 0.25);
    avatarHalo.fillCircle(-68, 0, 28);

    const texKey = `char_${this.companionConfig.id}`;
    if (this.textures.exists('avatar_inari')) {
      this.companionAvatarImg = this.add.image(-68, 0, 'avatar_inari').setDisplaySize(48, 48);
    } else if (this.textures.exists(texKey)) {
      this.companionAvatarImg = this.add.image(-68, 0, texKey).setDisplaySize(44, 44);
    } else {
      this.companionAvatarImg = this.add.text(-68, 0, this.companionConfig.icon, { fontSize: '24px' }).setOrigin(0.5);
    }

    // Companion Name
    this.companionNameText = this.add.text(-38, -14, `⛩️ ${this.companionConfig.name}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15.5px',
      fontStyle: '900',
      color: '#ffffff'
    });

    // Energy Bar Background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0e0e18, 0.95);
    barBg.fillRoundedRect(-38, 2, 134, 15, 7.5);
    barBg.lineStyle(1, 0x5a2d48, 0.85);
    barBg.strokeRoundedRect(-38, 2, 134, 15, 7.5);

    // Dynamic Energy Fill
    this.companionEnergyGraphics = this.add.graphics();

    // Energy Text
    this.companionEnergyText = this.add.text(29, 9, '0% NỘ', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ced4da'
    }).setOrigin(0.5);

    // Ready Badge Text (hidden by default)
    this.companionReadyBadge = this.add.text(29, 9, '⚡ BẤM DÙNG!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5).setVisible(false);

    this.companionPod.add([
      this.companionPodBorder,
      avatarHalo,
      this.companionAvatarImg,
      this.companionNameText,
      barBg,
      this.companionEnergyGraphics,
      this.companionEnergyText,
      this.companionReadyBadge
    ]);

    this.companionPod.setSize(podW, podH).setInteractive({ useHandCursor: true });

    this.companionPod.on('pointerdown', () => {
      if (this.isGameOver || this.isVictory || this.boardManager.isProcessing()) return;
      if (this.isCompanionSkillReady) {
        this.activateCompanionSkill();
      } else {
        this.openCompanionModal();
      }
    });

    this.updateCompanionEnergyUI();
  }

  private updatePodBackground(): void {
    if (!this.companionPodBorder) return;
    const podW = 216;
    const podH = 56;
    this.companionPodBorder.clear();
    this.companionPodBorder.fillStyle(0x111022, 0.96);
    this.companionPodBorder.fillRoundedRect(-podW / 2, -podH / 2, podW, podH, 16);
    this.companionPodBorder.lineStyle(
      this.isCompanionSkillReady ? 2.5 : 2.0,
      this.isCompanionSkillReady ? 0xffd700 : 0xff3366,
      0.95
    );
    this.companionPodBorder.strokeRoundedRect(-podW / 2, -podH / 2, podW, podH, 16);
  }

  private updateCompanionPodVisuals(): void {
    if (!this.companionPod) return;
    this.updatePodBackground();
    this.companionNameText.setText(`⛩️ ${this.companionConfig.name}`);

    // Update avatar image
    if (this.companionAvatarImg) {
      this.companionAvatarImg.destroy();
      const texKey = `char_${this.companionConfig.id}`;
      if (this.textures.exists('avatar_inari')) {
        this.companionAvatarImg = this.add.image(-68, 0, 'avatar_inari').setDisplaySize(48, 48);
      } else if (this.textures.exists(texKey)) {
        this.companionAvatarImg = this.add.image(-68, 0, texKey).setDisplaySize(44, 44);
      } else {
        this.companionAvatarImg = this.add.text(-68, 0, this.companionConfig.icon, { fontSize: '24px' }).setOrigin(0.5);
      }
      this.companionPod.addAt(this.companionAvatarImg, 2);
    }

    this.updateCompanionEnergyUI();
  }

  private addCompanionEnergy(amount: number): void {
    if (this.isCompanionSkillReady) return;

    const maxE = this.maxCompanionEnergy;
    this.companionEnergy = Math.min(maxE, this.companionEnergy + amount);
    this.updateCompanionEnergyUI();

    if (this.companionEnergy >= maxE && !this.isCompanionSkillReady) {
      this.isCompanionSkillReady = true;
      this.updatePodBackground();
      this.audio.playMatch(5);
      this.haptic.medium();
      this.showNotice(`⚡ TUYỆT CHIÊU CỦA ${this.companionConfig.name.toUpperCase()} ĐÃ ĐẦY! CHẠM ĐỂ DÙNG!`, 0xffd700);

      // Start gentle pulsing aura tween
      if (!this.companionPulseTween) {
        this.companionPulseTween = this.tweens.add({
          targets: this.companionPod,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 450,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  private updateCompanionEnergyUI(): void {
    if (!this.companionEnergyGraphics) return;

    this.companionEnergyGraphics.clear();
    const barW = 134;
    const barH = 12;
    const startX = -43;
    const startY = 3;

    const maxE = this.maxCompanionEnergy;
    const fillW = Math.max(0, (this.companionEnergy / maxE) * barW);

    if (this.isCompanionSkillReady) {
      this.companionEnergyGraphics.fillStyle(0xffd700, 1);
      this.companionEnergyGraphics.fillRoundedRect(startX, startY, fillW, barH, 6);
      this.companionEnergyText.setVisible(false);
      this.companionReadyBadge.setVisible(true);
    } else {
      this.companionEnergyGraphics.fillStyle(0xff3366, 0.95);
      if (fillW > 0) {
        this.companionEnergyGraphics.fillRoundedRect(startX, startY, fillW, barH, 6);
      }
      this.companionEnergyText.setText(`${Math.floor((this.companionEnergy / maxE) * 100)}% NỘ`);
      this.companionEnergyText.setVisible(true);
      this.companionReadyBadge.setVisible(false);
    }
  }

  private activateCompanionSkill(): void {
    if (!this.isCompanionSkillReady) return;
    if (this.isGameOver || this.isVictory || this.boardManager.isProcessing()) return;
    this.isCompanionSkillReady = false;
    this.companionEnergy = 0;
    this.updateCompanionEnergyUI();

    // Lock companion skill recharge while skill is actively executing
    this.isSkillRechargeLocked = true;
    this.time.delayedCall(2500, () => {
      this.isSkillRechargeLocked = false;
    });

    // Clear any active tile selection to prevent dangling highlights
    this.boardManager.clearSelection();

    if (this.companionPulseTween) {
      this.companionPulseTween.stop();
      this.companionPulseTween = null;
      this.companionPod.setScale(1);
    }
    this.updatePodBackground();

    this.haptic.heavy();

    const comp = this.companionConfig;
    const lvl = this.save.getCompanionLevel(comp.id);

    if (comp.id === 'inari_kitsune') {
      // 🦊 Cáo Inari: Tự động tìm & giải cứu 1-2 cặp ô kẹt sâu nhất (Tuần tự an toàn)
      const bannerSub = lvl >= 5
        ? 'Linh Hồ giáng trần giải cứu trọn vẹn 2 cặp ô hiểm hóc nhất!'
        : 'Linh Hồ giáng trần giải cứu 1 cặp ô bị kẹt sâu trên bàn cờ!';
      this.showSkillBanner(`🦊 CÁO INARI (CẤP ${lvl}): LINH HỒ XUẤT KÍCH!`, bannerSub, comp.themeColor);
      this.audio.playVictory();

      // Lv.3-4: Melts 1 web or ice obstacle
      if (lvl >= 3 && lvl < 5) {
        this.boardManager.destroyObstaclesOfType(['ice', 'web'], 1);
      }

      const pairCount = lvl >= 5 ? 2 : 1;
      this.boardManager.executeSequentialAutoMatches(
        pairCount,
        (p1, p2, idx) => {
          this.audio.playLaserZap();
          this.score += 200;
          this.updateScoreDisplay();
          const wPos = this.boardManager.gridToWorld(p1.r, p1.c);
          this.feverParticles.explode(16, wPos.x, wPos.y);
          if (idx === 1) {
            this.showNotice('🦊 Linh Hồ thức tỉnh: Giải cứu thành công 2 cặp ô! +400 PTS! ✨', 0xff758f);
          }
        }
      );
    } else if (comp.id === 'ryujin_pearl') {
      // 🐉 Thần Rồng Ryujin: Đóng băng đồng hồ đếm ngược 3.0s - 5.0s
      const freezeDuration = lvl >= 5 ? 5.0 : lvl >= 4 ? 4.5 : lvl >= 3 ? 4.0 : lvl >= 2 ? 3.5 : 3.0;
      this.showSkillBanner(
        `🐉 RỒNG RYUJIN (CẤP ${lvl}): NGƯNG ĐỌNG LONG CHÂU!`,
        `Bảo ngọc Long Vương đóng băng đồng hồ trong ${freezeDuration.toFixed(1)} giây!`,
        comp.themeColor
      );
      this.audio.playVictory();
      this.isTimeFrozen = true;
      this.freezeTimeRemaining = freezeDuration;

      if (this.frostOverlayGraphics) {
        const { width: screenW, offsetX } = getScreenDimensions();
        this.frostOverlayGraphics.clear();
        this.frostOverlayGraphics.lineStyle(3, 0x00f5d4, 0.75);
        this.frostOverlayGraphics.strokeRect(-offsetX + 6, 6, screenW - 12, GAME_HEIGHT - 12);
      }

      if (this.isZenMode) {
        this.score += 500;
        this.updateScoreDisplay();
        this.showNotice('🐉 Long Vương gia hộ Zen: Thưởng ngay +500 PTS! ❄️', 0x00f5d4);
      }
    } else if (comp.id === 'hi_no_tori') {
      // 🔥 Phượng Hoàng Hi-no-tori: Thiêu rụi chướng ngại vật hoặc giáng sát thương Boss
      const obsCount = lvl >= 5 ? 3 : lvl >= 3 ? 2 : 1;
      const bossDmg = lvl >= 5 ? 380 : lvl >= 4 ? 320 : lvl >= 3 ? 250 : lvl >= 2 ? 200 : 150;

      this.showSkillBanner(
        `🔥 PHƯỢNG HOÀNG (CẤP ${lvl}): HỎA DIỆM THANH TẨY!`,
        this.bossManager
          ? `Ngọn lửa bất tử giáng ${bossDmg} sát thương thiêu đốt Boss!`
          : `Ngọn lửa bất tử thiêu rụi ${obsCount} chướng ngại vật trên bàn cờ!`,
        comp.themeColor
      );

      this.playPhoenixFlameSweep(() => {
        if (this.bossManager) {
          this.audio.playBossHit();
          this.bossManager.applyDamage(bossDmg);
          this.triggerBossHitReaction(bossDmg);
          this.showNotice(`🔥 Hỏa Điểu giáng ${bossDmg} sát thương cực đại lên Boss!`, 0xff595e);
        } else {
          const cleared = this.boardManager.destroyObstaclesOfType(
            ['ice', 'stone', 'lock', 'thorn', 'web', 'barricade'],
            obsCount
          );
          this.audio.playBossHit();
          if (cleared > 0) {
            const bonusPts = cleared * 150;
            this.score += bonusPts;
            this.updateScoreDisplay();
            this.showNotice(`🔥 Phượng Hoàng thiêu rụi ${cleared} chướng ngại vật! +${bonusPts} PTS!`, 0xff595e);
          } else {
            this.score += 300;
            this.updateScoreDisplay();
            this.showNotice('🔥 Hỏa Điểu thanh tẩy toàn bàn cờ! Thưởng +300 PTS!', 0xffd166);
          }
        }
      });
    } else if (comp.id === 'byakko_tiger') {
      // 🐯 Bạch Hổ Byakko (USER MANDATED): Giải 1 cặp thẳng hàng + Khóa trọng lực 4-7s (+25% resolve animation speed ở Lv.5)
      const lockDuration = lvl >= 5 ? 7.0 : lvl >= 4 ? 6.0 : lvl >= 3 ? 5.0 : lvl >= 2 ? 4.0 : 0;
      const isLv5 = lvl >= 5;

      const bannerDesc = isLv5
        ? 'Chém 1 cặp ô thẳng hàng + Khóa trọng lực 7s & Tốc độ giải gạch tăng +25%!'
        : lockDuration > 0
          ? `Chém 1 cặp ô thẳng hàng + Khóa trọng lực trượt gạch trong ${lockDuration}s!`
          : 'Chém giải quyết 1 cặp ô thẳng hàng (0 khúc cua) ngay tức thì!';

      this.showSkillBanner(`🐯 BẠCH HỔ BYAKKO (CẤP ${lvl}): BẠCH HỔ CUỒNG TRẢO!`, bannerDesc, comp.themeColor);
      this.audio.playVictory();

      let straightMatch = this.boardManager.findStraightLineMatch();
      if (!straightMatch) {
        straightMatch = this.boardManager.findAvailableMatch();
      }

      if (straightMatch) {
        this.audio.playLaserZap();
        this.score += 250;
        this.updateScoreDisplay();
        this.boardManager.triggerPairClear(straightMatch.p1, straightMatch.p2);
        const wPos = this.boardManager.gridToWorld(straightMatch.p1.r, straightMatch.p1.c);
        this.feverParticles.explode(20, wPos.x, wPos.y);
      }

      // Lock gravity
      if (lockDuration > 0) {
        this.boardManager.setGravityLocked(true);
        this.byakkoGravityLockRemaining = lockDuration;
        if (isLv5) {
          this.boardManager.setResolveSpeedMultiplier(1.25);
        }
        this.showNotice(`🐯 Bạch Hổ đã khóa trọng lực ${lockDuration}s! Bàn cờ định hình tĩnh!`, 0xadb5bd);
      }
    } else if (comp.id === 'genbu_tortoise') {
      // 🐢 Huyền Vũ Genbu: Đập vỡ Stone/Lock + Tạo Khiên Thổ chống phạt nối sai
      const smashCount = lvl >= 4 ? 2 : 1;
      const shieldCharges = lvl >= 5 ? 2 : lvl >= 2 ? 1 : 0;

      this.showSkillBanner(
        `🐢 HUYỀN VŨ GENBU (CẤP ${lvl}): KIM CANG ĐỊA THUẪN!`,
        `Đập vỡ ${smashCount} khối Đá/Khóa + Tạo Khiên Thổ chặn ${shieldCharges} lần nối sai!`,
        comp.themeColor
      );
      this.audio.playBossHit();

      const smashed = this.boardManager.destroyObstaclesOfType(['stone', 'lock', 'barricade'], smashCount);
      if (smashed > 0) {
        this.score += smashed * 200;
        this.updateScoreDisplay();
      }

      if (shieldCharges > 0) {
        this.genbuShieldCharges = shieldCharges;
        this.showNotice(`🛡️ Khiên Thổ kích hoạt: Bảo vệ ${shieldCharges} lần nối sai không bị trừ thời gian!`, 0x2a9d8f);
      }
    } else if (comp.id === 'kirin_sacred') {
      // 🦌 Kỳ Lân Kirin: Thanh lọc nguyền rủa + Hồi phục thời gian + Biến Thánh Hoa (Lv.5)
      const bonusSeconds = lvl >= 4 ? 5 : lvl >= 2 ? 4 : 3;
      this.timeRemaining = Math.min(this.levelConfig.timeLimit + 30, this.timeRemaining + bonusSeconds);
      this.showBonusTimePopup(bonusSeconds);

      this.showSkillBanner(
        `🦌 KỲ LÂN KIRIN (CẤP ${lvl}): CÁT TƯỜNG THANH TẨY!`,
        `Thanh tẩy bùa nguyền rủa trên sân và hồi phục +${bonusSeconds} giây thời gian!`,
        comp.themeColor
      );
      this.audio.playVictory();

      this.boardManager.destroyObstaclesOfType(['thorn', 'web', 'fog'], 2);

      if (lvl >= 5) {
        this.boardManager.createHolyBlossomPair();
        this.showNotice('🦌 Kỳ Lân thức tỉnh: Biến 1 cặp ô thành Thánh Hoa dễ kết nối!', 0x52b788);
      }
    } else if (comp.id === 'raiju_thunder') {
      // ⚡ Lôi Thú Raiju: Phóng điện kết nối 1 cặp ô cự ly xa nhất (+ nhân x1.5 / x2.0 điểm số ở Lv.4-5)
      let farthestMatch = this.boardManager.findFarthestMatch();
      if (!farthestMatch) {
        farthestMatch = this.boardManager.findAvailableMatch();
      }

      if (lvl >= 5) {
        this.raijuScoreMultiplierMoves = 2;
        this.raijuScoreMultiplier = 2.0;
      } else if (lvl >= 4) {
        this.raijuScoreMultiplierMoves = 1;
        this.raijuScoreMultiplier = 1.5;
      }

      const multText = lvl >= 5 ? ' (2 lượt kế tiếp nhân x2.0 điểm!)' : (lvl >= 4 ? ' (Lượt kế tiếp nhân x1.5 điểm!)' : '');
      this.showSkillBanner(
        `⚡ LÔI THÚ RAIJU (CẤP ${lvl}): LÔI QUANG LIÊN NỐI!`,
        `Phóng luồng điện Torii kết nối 1 cặp ô ở cự ly xa nhất${multText}!`,
        comp.themeColor
      );
      this.audio.playLaserZap();

      if (farthestMatch) {
        this.score += 300;
        this.updateScoreDisplay();
        this.boardManager.triggerPairClear(farthestMatch.p1, farthestMatch.p2);
        const wPos = this.boardManager.gridToWorld(farthestMatch.p1.r, farthestMatch.p1.c);
        this.feverParticles.explode(24, wPos.x, wPos.y);
      }
    } else if (comp.id === 'yatagarasu_crow') {
      // 🦅 Quạ Yatagarasu (USER MANDATED): Xua tan fog 6-10s; Lv.3+ reveal Relic; Lv.5 highlight cặp tối ưu
      const fogDuration = lvl >= 5 ? 10 : lvl >= 4 ? 9 : lvl >= 3 ? 8 : lvl >= 2 ? 7 : 6;
      this.boardManager.clearAllFog();

      const bannerDesc = lvl >= 5
        ? 'Xua tan bóng tối 10s + Định vị Cổ vật Relic + Soi sáng cặp hợp lệ tốt nhất!'
        : lvl >= 3
          ? `Xua tan bóng tối ${fogDuration}s + Định vị chính xác Cổ vật Relic Shard!`
          : `Rọi ánh sáng mặt trời xua tan bóng tối và sương mù trong ${fogDuration}s!`;

      this.showSkillBanner(`🦅 QUẠ YATAGARASU (CẤP ${lvl}): NHẬT QUANG SOI ĐƯỜNG!`, bannerDesc, comp.themeColor);
      this.audio.playVictory();

      if (lvl >= 3) {
        if (this.levelConfig.relicReward && !this.save.hasRelic(this.levelConfig.relicReward.id) && !this.isRelicShardCollectedThisRun) {
          this.isRelicShardSpawnedThisRun = true;
          this.boardManager.tagRelicShardPair();
        }
      }
      if (lvl >= 5) {
        this.boardManager.showHint();
        this.showNotice('🦅 Kim Ô chiếu rọi: Soi sáng cặp ô hợp lệ tốt nhất trên sân!', 0xfb8500);
      }
    } else if (comp.id === 'nekomata_cat') {
      // 🐾 Mèo Nekomata: Hoán đổi 1 ô kẹt sâu ra rìa ngoài + cướp thời gian 2-4s
      const bonusSec = lvl >= 4 ? 4 : lvl >= 3 ? 3 : lvl >= 2 ? 2 : 0;
      if (bonusSec > 0) {
        this.timeRemaining = Math.min(this.levelConfig.timeLimit + 30, this.timeRemaining + bonusSec);
        this.showBonusTimePopup(bonusSec);
      }

      this.showSkillBanner(
        `🐾 MÈO NEKOMATA (CẤP ${lvl}): HOÁN ĐỔI CÀN KHÔN!`,
        `Hoán đổi ô gạch kẹt sâu ra ngoài rìa bàn cờ + Cướp lại +${bonusSec}s thời gian!`,
        comp.themeColor
      );
      this.audio.playVictory();
      this.boardManager.swapDeepTileToPerimeter();
    } else if (comp.id === 'orochi_serpent') {
      // 🐍 Bát Kỳ Orochi (USER MANDATED APEX SSR): +20% đến +30% damage Boss trong 8s, phá 1 chướng ngại vật, giải 1 cặp ô
      const dmgMult = lvl >= 5 ? 1.30 : lvl >= 4 ? 1.28 : lvl >= 3 ? 1.25 : lvl >= 2 ? 1.22 : 1.20;
      const buffDuration = lvl >= 5 ? 8.0 : lvl >= 3 ? 7.0 : 6.0;

      this.orochiBossDamageMultiplier = dmgMult;
      this.orochiBossDamageBuffRemaining = buffDuration;

      const pctStr = Math.round((dmgMult - 1) * 100);
      this.showSkillBanner(
        `🐍 BÁT KỲ OROCHI (CẤP ${lvl}): BÁT ĐẦU CUỒNG NỘ!`,
        `Tăng +${pctStr}% Sát thương Boss trong ${buffDuration}s + Nghiền nát chướng ngại vật!`,
        comp.themeColor
      );
      this.audio.playBossHit();

      // Crushes 1 obstacle (Lv.2+)
      if (lvl >= 2) {
        this.boardManager.destroyObstaclesOfType(
          ['stone', 'lock', 'thorn', 'ice', 'web', 'barricade'],
          1
        );
      }

      // Solves 1 pair (Lv.4-5)
      if (lvl >= 4) {
        const match = this.boardManager.findAvailableMatch();
        if (match) {
          this.audio.playLaserZap();
          this.score += 300;
          this.updateScoreDisplay();
          this.boardManager.triggerPairClear(match.p1, match.p2);
          const wPos = this.boardManager.gridToWorld(match.p1.r, match.p1.c);
          this.feverParticles.explode(20, wPos.x, wPos.y);
          this.showNotice('🐍 Xà Thần nuốt trọn 1 cặp ô gạch! +300 PTS!', 0x7209b7);
        }
      }
    }
  }

  private playPhoenixFlameSweep(onMidpoint: () => void): void {
    const waveContainer = this.add.container(-120, GAME_HEIGHT / 2).setDepth(150);

    const waveGfx = this.add.graphics();
    // Flame beam gradient
    waveGfx.fillStyle(0xff3300, 0.4);
    waveGfx.fillRect(-60, -GAME_HEIGHT / 2, 120, GAME_HEIGHT);
    waveGfx.fillStyle(0xffaa00, 0.6);
    waveGfx.fillRect(-30, -GAME_HEIGHT / 2, 60, GAME_HEIGHT);
    waveGfx.fillStyle(0xffffff, 0.9);
    waveGfx.fillRect(-10, -GAME_HEIGHT / 2, 20, GAME_HEIGHT);

    const phoenixIcon = this.add.text(0, 0, '🔥', { fontSize: '42px' }).setOrigin(0.5);

    waveContainer.add([waveGfx, phoenixIcon]);

    this.tweens.add({
      targets: waveContainer,
      x: GAME_WIDTH + 120,
      duration: 650,
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        if (tween.progress >= 0.5 && !(waveContainer as any).midpointCalled) {
          (waveContainer as any).midpointCalled = true;
          onMidpoint();
        }
      },
      onComplete: () => {
        waveContainer.destroy();
      }
    });
  }

  private showSkillBanner(title: string, desc: string, color: number): void {
    const banner = this.add.container(GAME_WIDTH / 2, 125).setDepth(200);

    const bannerW = 620;
    const bannerH = 64;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e101f, 0.96);
    bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);

    const titleTxt = this.add.text(0, -12, title, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: `#${color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);

    const descTxt = this.add.text(0, 14, desc, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    banner.add([bg, titleTxt, descTxt]);
    banner.setScale(0.85);
    banner.setAlpha(0);

    this.tweens.add({
      targets: banner,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: 105,
            duration: 250,
            ease: 'Quad.easeIn',
            onComplete: () => banner.destroy()
          });
        });
      }
    });
  }

  private openCompanionModal(): void {
    this.audio.playSelect();
    CompanionModal.open(this, (comp) => {
      this.companionConfig = comp;
      this.updateCompanionPodVisuals();
      this.showNotice(`🦊 Đã chuyển sang bạn đồng hành: ${comp.name}!`, comp.themeColor);
      this.audio.playVictory();
    });
  }

  // ==========================================
  // 🏺 EQUIPPED RELIC POD SYSTEM (BOTTOM-RIGHT)
  // ==========================================
  private buildRelicPod(width: number, height: number): void {
    const podW = 216;
    const podH = 56;
    const podX = width - 130;
    const podY = height - 40;

    this.relicPod = this.add.container(podX, podY).setDepth(25);

    // Base background & border
    this.relicPodBorder = this.add.graphics();
    this.updateRelicPodBackground();

    const equippedRelicId = this.save.getEquippedRelicId();
    const relic = equippedRelicId ? RelicManager.getInstance().getRelicById(equippedRelicId) : null;
    const tierColor = relic 
      ? RelicManager.getInstance().getTierColor(relic.tier) 
      : { stroke: 0x4a4e69, fill: 0x141624, hexStr: '#adb5bd' };

    // Circular Avatar Container with tier-colored glowing halo
    const avatarHalo = this.add.graphics();
    avatarHalo.fillStyle(0x1a1226, 1);
    avatarHalo.fillCircle(-68, 0, 24);
    avatarHalo.lineStyle(2, tierColor.stroke, 0.95);
    avatarHalo.strokeCircle(-68, 0, 24);

    // Soft aura
    avatarHalo.fillStyle(tierColor.stroke, 0.25);
    avatarHalo.fillCircle(-68, 0, 28);

    if (relic && this.textures.exists(relic.id)) {
      this.relicAvatarImg = this.add.image(-68, 0, relic.id).setDisplaySize(44, 44);
    } else if (relic && this.textures.exists(`relic_${relic.id}`)) {
      this.relicAvatarImg = this.add.image(-68, 0, `relic_${relic.id}`).setDisplaySize(44, 44);
    } else {
      this.relicAvatarImg = this.add.text(-68, 0, relic ? (relic.icon || '🏺') : '🔒', { fontSize: '24px' }).setOrigin(0.5);
    }

    // Relic Name
    const displayName = relic ? `🏺 ${relic.name}` : '🔒 Thần Khí (Trống)';
    this.relicNameText = this.add.text(-43, -14, displayName, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: '900',
      color: tierColor.hexStr
    });

    // Energy Bar Background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0e0e18, 0.95);
    barBg.fillRoundedRect(-43, 3, 134, 12, 6);
    barBg.lineStyle(1, tierColor.stroke, 0.45);
    barBg.strokeRoundedRect(-43, 3, 134, 12, 6);

    // Dynamic Energy Fill
    this.relicEnergyGraphics = this.add.graphics();

    // Energy Text
    this.relicEnergyText = this.add.text(24, 9, relic ? '0% NỘ' : 'CHƯA CÓ', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ced4da'
    }).setOrigin(0.5);

    // Ready Badge Text (hidden by default)
    this.relicReadyBadge = this.add.text(24, 9, '⚡ BẤM DÙNG!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5).setVisible(false);

    this.relicPod.add([
      this.relicPodBorder,
      avatarHalo,
      this.relicAvatarImg,
      this.relicNameText,
      barBg,
      this.relicEnergyGraphics,
      this.relicEnergyText,
      this.relicReadyBadge
    ]);

    this.relicPod.setSize(podW, podH).setInteractive({ useHandCursor: true });

    this.relicPod.on('pointerdown', () => {
      if (this.isGameOver || this.isVictory || this.boardManager.isProcessing()) return;
      if (!relic) {
        this.showNotice('🏺 THẦN KHÍ: Vượt Màn 1-4 để rèn Cổ Vật đầu tiên! Ghé Bảo Khố tại Menu Chính để kích hoạt.', 0xffd166);
        this.audio.playSelect();
        return;
      }
      if (this.isRelicSkillReady) {
        this.activateRelicSkill();
      } else {
        const maxE = relic.rageCost || 100;
        const pct = Math.floor((this.relicEnergy / maxE) * 100);
        this.showNotice(
          `🏺 ${relic.name}: Cần ${maxE}% Nộ (Hiện có: ${pct}%). Nối thêm cặp để tích nộ!`,
          tierColor.stroke
        );
        this.audio.playSelect();
      }
    });

    this.relicPod.on('pointerover', () => {
      this.tweens.add({
        targets: this.relicPod,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
        ease: 'Quad.easeOut'
      });
    });

    this.relicPod.on('pointerout', () => {
      if (!this.isRelicSkillReady) {
        this.tweens.add({
          targets: this.relicPod,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 120,
          ease: 'Quad.easeOut'
        });
      }
    });

    this.updateRelicEnergyUI();
  }

  private updateRelicPodBackground(): void {
    if (!this.relicPodBorder) return;
    const podW = 216;
    const podH = 56;
    const equippedRelicId = this.save.getEquippedRelicId();
    const relic = equippedRelicId ? RelicManager.getInstance().getRelicById(equippedRelicId) : null;
    const tierColor = relic ? RelicManager.getInstance().getTierColor(relic.tier) : { stroke: 0x4a4e69 };

    this.relicPodBorder.clear();
    this.relicPodBorder.fillStyle(0x111022, 0.96);
    this.relicPodBorder.fillRoundedRect(-podW / 2, -podH / 2, podW, podH, 16);
    this.relicPodBorder.lineStyle(
      this.isRelicSkillReady ? 2.5 : 1.8,
      this.isRelicSkillReady ? 0xffd700 : tierColor.stroke,
      this.isRelicSkillReady ? 1 : 0.75
    );
    this.relicPodBorder.strokeRoundedRect(-podW / 2, -podH / 2, podW, podH, 16);
  }

  private updateRelicEnergyUI(): void {
    if (!this.relicEnergyGraphics) return;

    this.relicEnergyGraphics.clear();
    const barW = 134;
    const barH = 12;
    const startX = -43;
    const startY = 3;

    const equippedRelicId = this.save.getEquippedRelicId();
    const relic = equippedRelicId ? RelicManager.getInstance().getRelicById(equippedRelicId) : null;
    if (!relic) {
      this.relicEnergyText.setText('CHƯA CÓ');
      this.relicEnergyText.setVisible(true);
      this.relicReadyBadge.setVisible(false);
      return;
    }

    const maxE = relic?.rageCost || 100;
    const tierColor = RelicManager.getInstance().getTierColor(relic?.tier || 'common');
    const fillW = Math.max(0, Math.min(1, this.relicEnergy / maxE) * barW);

    if (this.isRelicSkillReady) {
      this.relicEnergyGraphics.fillStyle(0xffd700, 1);
      this.relicEnergyGraphics.fillRoundedRect(startX, startY, fillW, barH, 6);
      this.relicEnergyText.setVisible(false);
      this.relicReadyBadge.setVisible(true);
    } else {
      this.relicEnergyGraphics.fillStyle(tierColor.stroke, 0.92);
      if (fillW > 0) {
        this.relicEnergyGraphics.fillRoundedRect(startX, startY, fillW, barH, 6);
      }
      this.relicEnergyText.setText(`${Math.floor((this.relicEnergy / maxE) * 100)}% NỘ`);
      this.relicEnergyText.setVisible(true);
      this.relicReadyBadge.setVisible(false);
    }
  }

  private addRelicEnergy(amount: number): void {
    const equippedRelicId = this.save.getEquippedRelicId();
    if (!equippedRelicId) return;
    const relic = RelicManager.getInstance().getRelicById(equippedRelicId);
    if (!relic) return;
    const maxE = relic?.rageCost || 100;

    this.relicEnergy = Math.min(maxE, this.relicEnergy + amount);
    this.updateRelicEnergyUI();

    if (this.relicEnergy >= maxE && !this.isRelicSkillReady) {
      this.isRelicSkillReady = true;
      this.audio.playVictory();
      this.haptic.medium();
      if (relic) {
        this.showNotice(`✨ Thần Khí ${relic.name}: ĐÃ TÍCH ĐỦ NỘ! BẤM ĐỂ DÙNG!`, 0xffd700);
      }

      if (!this.relicPulseTween && this.relicPod) {
        this.relicPulseTween = this.tweens.add({
          targets: this.relicPod,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 480,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      this.updateRelicPodBackground();
    }
  }

  public activateRelicSkill(): void {
    if (!this.isRelicSkillReady) return;
    if (this.isGameOver || this.isVictory || this.boardManager.isProcessing()) return;

    this.isRelicSkillReady = false;
    this.relicEnergy = 0;
    this.updateRelicEnergyUI();

    if (this.relicPulseTween) {
      this.relicPulseTween.stop();
      this.relicPulseTween = null;
      this.relicPod.setScale(1);
    }
    this.updateRelicPodBackground();
    this.haptic.heavy();

    const equippedRelicId = this.save.getEquippedRelicId();
    if (!equippedRelicId) return;
    const relic = RelicManager.getInstance().getRelicById(equippedRelicId);
    if (relic) {
      const tierColor = RelicManager.getInstance().getTierColor(relic.tier);
      this.showSkillBanner(
        `🏺 ${relic.name.toUpperCase()}: ${relic.skillName.toUpperCase()}`,
        relic.skillDesc,
        tierColor.stroke
      );
      this.audio.playRelicBurst(relic.archetype || 'boss');

      this.time.delayedCall(400, () => {
        if (this.isGameOver || this.isVictory) return;
        try {
          const res = RelicManager.getInstance().executeRelicSkill(equippedRelicId, this);
          if (res && res.success) {
            this.showNotice(res.message, tierColor.stroke);
            this.haptic.medium();
          }
        } catch (err) {
          console.warn('[GameScene] executeRelicSkill error:', err);
        }
      });
    }
  }

  public maxRageCheat(): void {
    this.addCompanionEnergy(100);
    this.addRelicEnergy(100);
    this.showNotice('⚡ QA Cheat: Nộ Linh Thú & Thần Khí ĐÃ ĐẦY 100%!', 0xffd700);
  }

  private createBoosterButton(
    x: number,
    y: number,
    size: number,
    icon: string,
    label: string,
    countStr: string,
    color: number,
    onClick: () => void,
    spriteKey?: string
  ): { container: Phaser.GameObjects.Container; countText: Phaser.GameObjects.Text } {
    const container = this.add.container(x, y);
    const radius = 21; // 42px diameter circular action gem

    // 1. Soft glowing outer neon aura
    const aura = this.add.graphics();
    aura.fillStyle(color, 0.25);
    aura.fillCircle(0, 0, radius + 4);

    // 2. Obsidian glass disc background
    const bg = this.add.graphics();
    bg.fillStyle(0x121124, 0.98);
    bg.fillCircle(0, 0, radius);

    // 3. Vibrant neon border ring
    bg.lineStyle(1.8, color, 0.95);
    bg.strokeCircle(0, 0, radius);

    // 4. Inner subtle bevel highlight ring
    bg.lineStyle(1.0, 0xffffff, 0.22);
    bg.strokeCircle(0, 0, radius - 2.5);

    // 5. Center Neon Action Icon
    const iconTxt = this.add.text(0, 0, icon, {
      fontSize: '20px'
    }).setOrigin(0.5);

    // 6. Mini Count Badge (Top-Right Pill, e.g. "15", "10")
    const badgeW = 22;
    const badgeH = 14;
    const badgeX = radius - 4;
    const badgeY = -radius + 4;

    const badgeGfx = this.add.graphics();
    badgeGfx.fillStyle(0xd90429, 0.98); // Rich crimson / gold accent
    badgeGfx.fillRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
    badgeGfx.lineStyle(1.2, 0xffd700, 0.95);
    badgeGfx.strokeRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);

    const count = this.add.text(badgeX, badgeY, countStr.replace(/^x/, ''), {
      fontFamily: FONT_UI,
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([aura, bg, iconTxt, badgeGfx, count]);
    container.setSize(radius * 2, radius * 2);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, radius + 4), Phaser.Geom.Circle.Contains);
    if (container.input) {
      container.input.cursor = 'pointer';
    }

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 120,
        ease: 'Back.easeOut'
      });
      aura.clear();
      aura.fillStyle(color, 0.5);
      aura.fillCircle(0, 0, radius + 6);
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 120,
        ease: 'Sine.easeOut'
      });
      aura.clear();
      aura.fillStyle(color, 0.25);
      aura.fillCircle(0, 0, radius + 4);
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.90,
        scaleY: 0.90,
        duration: 70,
        yoyo: true,
        onComplete: onClick
      });
    });

    return { container, countText: count };
  }

  private triggerNightParadeRush(reasonTitle: string): void {
    if (this.isNightParadeActive) {
      // If already active, extend duration by 6s (up to max 15s)
      this.nightParadeTimeRemaining = Math.min(15, this.nightParadeTimeRemaining + 6);
      this.nightParadeMaxDuration = Math.max(this.nightParadeMaxDuration, this.nightParadeTimeRemaining);
      this.showNotice(`🌙 KÉO DÀI DẠ HÀNH THÊM 6S! (${reasonTitle})`, 0xc77dff);
      this.updateNightParadeTimerUI();
      if (this.nightParadeTimerPill && this.nightParadeTimerPill.active) {
        this.tweens.add({
          targets: this.nightParadeTimerPill,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 160,
          yoyo: true
        });
      }
      return;
    }

    // Stop and kill any in-progress fade out tweens immediately
    if (this.nightParadeFadeTween) {
      this.nightParadeFadeTween.stop();
      this.nightParadeFadeTween = null;
    }
    if (this.nightParadeOverlayFadeTween) {
      this.nightParadeOverlayFadeTween.stop();
      this.nightParadeOverlayFadeTween = null;
    }

    // Clean up any remaining objects before recreating fresh ones
    if (this.nightParadeTimerPill) {
      try { this.nightParadeTimerPill.destroy(); } catch {}
      this.nightParadeTimerPill = null;
    }
    this.nightParadeTimerText = null;
    this.nightParadeTimerBarGfx = null;
    if (this.nightParadeOverlay) {
      try { this.nightParadeOverlay.destroy(); } catch {}
      this.nightParadeOverlay = null;
    }

    this.isNightParadeActive = true;
    this.nightParadeTimeRemaining = 10.0;
    this.nightParadeMaxDuration = 10.0;
    this.lastNightParadeSec = -1;
    this.lastNightParadeUrgent = false;

    this.boardManager.setPiercingLaser(true);
    this.audio.startNightParadeMusic();
    this.haptic.heavy();

    const { width: screenW, offsetX } = getScreenDimensions();

    // 1. SÓNG ĐIỆN QUANG MỞ MÀN (Chỉ lóe sáng năng lượng thần bí 0.9s rồi tan biến ngay, BÀN CỜ LUÔN SÁNG 100%, KHÔNG TỐI MÀN HÌNH)
    const introSurge = this.add.container(0, 0).setDepth(85);
    const surgeGfx = this.add.graphics();
    // Vầng hào quang tím sáng nhẹ (chỉ 0.15 alpha, tuyệt đối không làm đen/tối màn hình gây mỏi mắt)
    surgeGfx.fillStyle(0x7209b7, 0.15);
    surgeGfx.fillRect(-offsetX, 0, screenW, GAME_HEIGHT);
    surgeGfx.lineStyle(4, 0xe0aaff, 0.85);
    surgeGfx.strokeRect(-offsetX + 4, 4, screenW - 8, GAME_HEIGHT - 8);
    introSurge.add(surgeGfx);

    // Tan biến nhanh sau 900ms để người chơi tập trung tối đa vào các ô thú
    this.tweens.add({
      targets: introSurge,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => {
        try { introSurge.destroy(); } catch {}
      }
    });

    // 2. HIỆU ỨNG NGOÀI KHUNG (Chỉ hiển thị ngoài viền màn hình và mép viền, TUYỆT ĐỐI KHÔNG PHỦ LÊN CÁC Ô BÀN CỜ)
    const borderOverlay = this.add.container(0, 0).setDepth(18);
    const borderGfx = this.add.graphics();

    // Viền Neon Dạ Hành tím điện quang quanh rìa ngoài cùng mép màn hình
    borderGfx.lineStyle(5, 0x9d4edd, 0.85);
    borderGfx.strokeRect(-offsetX + 3, 3, screenW - 6, GAME_HEIGHT - 6);
    borderGfx.lineStyle(2, 0xc77dff, 0.95);
    borderGfx.strokeRect(-offsetX + 6, 6, screenW - 12, GAME_HEIGHT - 12);
    borderGfx.lineStyle(1, 0xffffff, 0.6);
    borderGfx.strokeRect(-offsetX + 8, 8, screenW - 16, GAME_HEIGHT - 16);

    // 4 Góc Đền Torii phát quang vàng tím tinh xảo
    const cornerSize = 32;
    borderGfx.lineStyle(3, 0xffd700, 0.9);
    borderGfx.lineBetween(-offsetX + 3, 3 + cornerSize, -offsetX + 3, 3);
    borderGfx.lineBetween(-offsetX + 3, 3, -offsetX + 3 + cornerSize, 3);
    borderGfx.lineBetween(-offsetX + screenW - 3 - cornerSize, 3, -offsetX + screenW - 3, 3);
    borderGfx.lineBetween(-offsetX + screenW - 3, 3, -offsetX + screenW - 3, 3 + cornerSize);
    borderGfx.lineBetween(-offsetX + 3, GAME_HEIGHT - 3 - cornerSize, -offsetX + 3, GAME_HEIGHT - 3);
    borderGfx.lineBetween(-offsetX + 3, GAME_HEIGHT - 3, -offsetX + 3 + cornerSize, GAME_HEIGHT - 3);
    borderGfx.lineBetween(-offsetX + screenW - 3 - cornerSize, GAME_HEIGHT - 3, -offsetX + screenW - 3, GAME_HEIGHT - 3);
    borderGfx.lineBetween(-offsetX + screenW - 3, GAME_HEIGHT - 3, -offsetX + screenW - 3, GAME_HEIGHT - 3 - cornerSize);

    borderOverlay.add(borderGfx);

    // Linh hồn dạ hành (Hitodama wisps) bay lượn ở mép ngoài lề màn hình (ngoài rìa bàn cờ)
    const wispPositions = [
      { x: -offsetX + 18, y: GAME_HEIGHT * 0.25 },
      { x: -offsetX + 22, y: GAME_HEIGHT * 0.55 },
      { x: -offsetX + 18, y: GAME_HEIGHT * 0.75 },
      { x: -offsetX + screenW - 18, y: GAME_HEIGHT * 0.35 },
      { x: -offsetX + screenW - 22, y: GAME_HEIGHT * 0.65 },
      { x: -offsetX + screenW - 18, y: GAME_HEIGHT * 0.82 }
    ];

    for (const pos of wispPositions) {
      const wisp = this.add.circle(pos.x, pos.y, 6, 0xc77dff, 0.75);
      borderOverlay.add(wisp);
      this.tweens.add({
        targets: wisp,
        y: pos.y + Phaser.Math.Between(-25, 25),
        alpha: { from: 0.4, to: 0.9 },
        scale: { from: 0.8, to: 1.3 },
        duration: Phaser.Math.Between(800, 1400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Nhịp thở phát quang viền ngoài màn hình
    this.tweens.add({
      targets: borderGfx,
      alpha: { from: 0.75, to: 1.0 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.nightParadeOverlay = borderOverlay;

    // 3. ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN DẠ HÀNH (HUD COUNTDOWN CLOCK)
    // Vị trí an toàn tuyệt đối: không đè thanh máu Trùm và không đè bàn cờ
    const pillW = 340;
    const pillH = 28;
    const pillX = GAME_WIDTH / 2;
    const pillY = this.bossManager ? 126 : 68;

    const timerPill = this.add.container(pillX, pillY).setDepth(35);

    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x10002b, 0.96);
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 14);
    pillBg.lineStyle(2, 0xc77dff, 0.95);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 14);
    pillBg.lineStyle(1, 0xffd700, 0.7);
    pillBg.strokeRoundedRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW - 4, pillH - 4, 12);

    this.nightParadeTimerBarGfx = this.add.graphics();

    this.nightParadeTimerText = this.add.text(0, 0, '🌙 BÁCH QUỶ DẠ HÀNH: 10s • XUYÊN THẤU ⚡', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff',
      stroke: '#240046',
      strokeThickness: 2
    }).setOrigin(0.5);

    timerPill.add([pillBg, this.nightParadeTimerBarGfx, this.nightParadeTimerText]);
    this.nightParadeTimerPill = timerPill;

    // Pop-in animation cho đồng hồ đếm ngược
    timerPill.setScale(0.85);
    timerPill.setAlpha(0);
    this.tweens.add({
      targets: timerPill,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    this.updateNightParadeTimerUI();

    // 4. Thông báo Toast trang trọng gọn gàng ở khu vực an toàn (KHÔNG che khuất bất kỳ ô thú nào trên bàn cờ)
    this.showNotice(`🌙 BÁCH QUỶ DẠ HÀNH KÍCH HOẠT! (${reasonTitle}) • x3 ĐIỂM & XUYÊN THẤU ⚡`, 0xe0aaff);
  }

  private updateNightParadeTimerUI(): void {
    if (!this.nightParadeTimerBarGfx || !this.nightParadeTimerText || !this.nightParadeTimerPill) return;
    if (!this.nightParadeTimerText.active || !this.nightParadeTimerText.scene) return;
    if (!this.nightParadeTimerBarGfx.active || !this.nightParadeTimerBarGfx.scene) return;
    if (!this.nightParadeTimerPill.active || !this.nightParadeTimerPill.scene) return;

    try {
      const pillW = 340;
      const pillH = 28;
      const maxDur = this.nightParadeMaxDuration || 10.0;
      const progress = Math.max(0, Math.min(1, this.nightParadeTimeRemaining / maxDur));
      const barW = Math.max(0, (pillW - 8) * progress);

      const isUrgent = this.nightParadeTimeRemaining <= 3.0;
      const barColor = isUrgent ? 0xff006e : 0x7b2cbf;

      this.nightParadeTimerBarGfx.clear();
      this.nightParadeTimerBarGfx.fillStyle(barColor, 0.85);
      this.nightParadeTimerBarGfx.fillRoundedRect(-(pillW - 8) / 2, -pillH / 2 + 3, barW, pillH - 6, 11);

      const sec = Math.max(0, Math.ceil(this.nightParadeTimeRemaining));
      if (sec !== this.lastNightParadeSec || isUrgent !== this.lastNightParadeUrgent) {
        this.lastNightParadeSec = sec;
        this.lastNightParadeUrgent = isUrgent;
        if (isUrgent) {
          this.nightParadeTimerText.setText(`⚠️ DẠ HÀNH SẮP HẾT: ${sec}s • XUYÊN THẤU ⚡`);
          this.nightParadeTimerText.setColor('#ff99c8');
        } else {
          this.nightParadeTimerText.setText(`🌙 DẠ HÀNH: ${sec}s • x3 ĐIỂM • XUYÊN THẤU ⚡`);
          this.nightParadeTimerText.setColor('#ffffff');
        }
      }
    } catch {
      // Gracefully ignore frame draw issues during fast transitions
    }
  }

  private showRushPointsPopup(x: number, y: number, pts: number): void {
    const popup = this.add.text(x, y - 10, `+${pts} PTS (x3 DẠ HÀNH!) 🌙`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#e0aaff',
      stroke: '#240046',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: popup,
      y: y - 45,
      alpha: 0,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 750,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  private endNightParadeRush(): void {
    if (!this.isNightParadeActive) return;
    this.isNightParadeActive = false;
    this.nightParadeTimeRemaining = 0;
    this.lastNightParadeSec = -1;
    this.lastNightParadeUrgent = false;

    if (this.boardManager && !this.isGameOver && !this.isVictory) {
      this.boardManager.setPiercingLaser(false);
    }
    this.audio.stopNightParadeMusic();

    // Cancel existing fade tweens if any
    if (this.nightParadeOverlayFadeTween) {
      this.nightParadeOverlayFadeTween.stop();
      this.nightParadeOverlayFadeTween = null;
    }
    if (this.nightParadeFadeTween) {
      this.nightParadeFadeTween.stop();
      this.nightParadeFadeTween = null;
    }

    // Capture and immediately detach overlay reference
    const overlayToFade = this.nightParadeOverlay;
    this.nightParadeOverlay = null;

    if (overlayToFade) {
      if (this.scene?.isActive() && overlayToFade.active) {
        this.nightParadeOverlayFadeTween = this.safeTween({
          targets: overlayToFade,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            try { overlayToFade.destroy(); } catch {}
            this.nightParadeOverlayFadeTween = null;
          }
        });
      } else {
        try { overlayToFade.destroy(); } catch {}
      }
    }

    // Capture and immediately detach timer references so update() never touches dying objects
    const pillToFade = this.nightParadeTimerPill;
    this.nightParadeTimerPill = null;
    this.nightParadeTimerText = null;
    this.nightParadeTimerBarGfx = null;

    if (pillToFade) {
      if (this.scene?.isActive() && pillToFade.active) {
        this.nightParadeFadeTween = this.safeTween({
          targets: pillToFade,
          alpha: 0,
          duration: 250,
          onComplete: () => {
            try { pillToFade.destroy(); } catch {}
            this.nightParadeFadeTween = null;
          }
        });
      } else {
        try { pillToFade.destroy(); } catch {}
      }
    }

    this.showNotice('🌙 Kết thúc Giờ Bách Quỷ Dạ Hành!', 0x9d4edd);
  }


  private updateBoosterCounts(): void {
    const b = this.save.getData().boosters;
    this.hintCountText.setText(`${b.hint}`);
    this.shuffleCountText.setText(`${b.shuffle}`);
    this.bombCountText.setText(`${b.bomb}`);
  }

  private handleMatchSuccess(t1: TileState, t2: TileState, path?: GridPoint[], isAutoClear: boolean = false): void {
    const comboData = this.comboSystem.registerMatch();

    // 4. ⭐ Star Quest 2: Đạt ít nhất Combo x5
    this.maxComboAchieved = Math.max(this.maxComboAchieved, comboData.combo);
    if (this.maxComboAchieved >= 5 && !this.hasNotifiedComboQuest) {
      this.hasNotifiedComboQuest = true;
      this.showNotice('⭐ NHIỆM VỤ ĐẠT: COMBO x5! (+1 SAO)', 0xffd700);
      this.audio.playFever();
    }

    const basePts = 100;
    let earnedPts = Math.round(basePts * comboData.multiplier);
    if (this.isNightParadeActive) {
      earnedPts *= 3; // 🌙 x3 Điểm thưởng trong Giờ Bách Quỷ Dạ Hành!
    }
    this.score += earnedPts;
    this.updateScoreDisplay();

    if (this.isZenMode) {
      this.save.saveZenHighScore(this.score);
    } else if (this.bossManager) {
      // In Boss mode: only reward time on skillful combos (>= 3)
      if (comboData.combo >= 3) {
        this.timeRemaining = Math.min(this.levelConfig.timeLimit + 30, this.timeRemaining + 2);
        this.showBonusTimePopup(2);
      }
    } else {
      // Standard mode: +1s bonus per match (tight and engaging)
      this.timeRemaining = Math.min(this.levelConfig.timeLimit, this.timeRemaining + 1);
      this.showBonusTimePopup(1);
    }

    // Play pitch-shifted match & electric laser zap
    this.audio.playLaserZap();
    this.audio.playMatch(comboData.combo);

    // Tactile haptic feedback & Combo shockwave against obstacles
    if (comboData.combo >= 2 || comboData.isFever) {
      this.haptic.combo();
      if (comboData.combo >= 3) {
        const damaged = this.boardManager.damageRandomObstacles(1);
        if (damaged > 0) {
          this.showNotice?.(`⚡ COMBO x${comboData.combo}! Sóng chấn động làm nứt vật cản!`, 0xffd166);
        }
      }
    } else {
      this.haptic.medium();
    }

    // Sakura particle bursts at both matched tiles & midpoint
    const p1 = this.boardManager.gridToWorld(t1.r, t1.c);
    const p2 = this.boardManager.gridToWorld(t2.r, t2.c);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    this.feverParticles.explode(8, p1.x, p1.y);
    this.feverParticles.explode(8, p2.x, p2.y);
    this.feverParticles.explode(14, midX, midY);

    if (this.isNightParadeActive) {
      this.showRushPointsPopup(midX, midY, earnedPts);
    }

    // ✨ Relic Shard Drop: Nối cặp ô phát sáng
    if ((t1.hasRelicShard || t2.hasRelicShard) && !this.isRelicShardCollectedThisRun && this.levelConfig.relicReward) {
      this.isRelicShardCollectedThisRun = true;
      this.boardManager.clearRelicShardTags();
      this.audio.playVictory();
      this.haptic.combo();

      this.showNotice(`✨ ĐÃ TÌM THẤY: +1 MẢNH ${this.levelConfig.relicReward.name.toUpperCase()}!`, 0xffd700);

      const relicIcon = this.add.text(midX, midY, this.levelConfig.relicReward.icon || '🏺', {
        fontSize: '32px'
      }).setOrigin(0.5).setDepth(200);

      this.tweens.add({
        targets: relicIcon,
        x: 236,
        y: 28,
        scale: { from: 1.6, to: 0.8 },
        alpha: { from: 1.0, to: 0.3 },
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          relicIcon.destroy();
          if (this.questTrackerStarsText) {
            this.questTrackerStarsText.setText('✨ ĐÃ NHẶT CỔ VẬT');
          }
        }
      });
    }

    // Record discovered character
    if (t1.characterId) {
      this.save.discoverCharacter(t1.characterId);
    }

    // ⚡ Special: Ô Sét Lan (Lightning Duo) - Tự động giật nổ 1 cặp ô khác
    if (t1.isLightning || t2.isLightning || t1.modifier === 'lightning' || t2.modifier === 'lightning') {
      this.showNotice('⚡ SÉT LAN! TỰ ĐỘNG PHÁ THÊM 1 CẶP Ô! ⚡', 0x00f5d4);
      this.haptic.combo();

      this.time.delayedCall(240, () => {
        const nextMatch = this.boardManager.findAvailableMatch();
        if (nextMatch) {
          const targetP1 = this.boardManager.gridToWorld(nextMatch.p1.r, nextMatch.p1.c);
          const targetP2 = this.boardManager.gridToWorld(nextMatch.p2.r, nextMatch.p2.c);
          const targetMidX = (targetP1.x + targetP2.x) / 2;
          const targetMidY = (targetP1.y + targetP2.y) / 2;

          this.drawChainLightningBolt(midX, midY, targetMidX, targetMidY);
          this.audio.playLaserZap();
          this.score += 200;
          this.updateScoreDisplay();
          this.boardManager.triggerPairClear(nextMatch.p1, nextMatch.p2);
        }
      });
    }

    // 🏺 Special: Hũ Vàng May Mắn (Lucky Coin Pot) - Cơn mưa tiền vàng
    if (t1.isLuckyPot || t2.isLuckyPot || t1.modifier === 'lucky_pot' || t2.modifier === 'lucky_pot') {
      this.score += 300;
      this.updateScoreDisplay();
      this.save.addCoins(50);
      this.timeRemaining = Math.min(this.levelConfig.timeLimit + 30, this.timeRemaining + 5);
      this.showNotice('🏺 HŨ VÀNG MAY MẮN! +300 PTS & +50 XU! 💰', 0xffd700);
      this.feverParticles.explode(24, midX, midY);
      this.audio.playVictory();
    }

    // Apply Damage to Boss if boss level
    if (this.bossManager) {
      let bossDamage = 10 * comboData.multiplier;
      if (comboData.isFever) bossDamage *= 1.5;
      this.bossManager.applyDamage(bossDamage);
    }

    // 🦊 Pet Companion: Charge Energy Bar (Thanh Nộ) - Only manual player matches, never auto-cleared pairs!
    if (!isAutoClear && !this.isSkillRechargeLocked) {
      let energyGain = 8;
      if (comboData.combo >= 4) {
        energyGain = 13;
      } else if (comboData.combo >= 2) {
        energyGain = 10;
      }
      if (comboData.isFever) {
        energyGain = 15;
      }

      // Companion perk scaling (e.g. Inari Kitsune Lv.2 +5%, Lv.4 +10% charge rate)
      if (this.companionConfig?.id === 'inari_kitsune') {
        const inariLvl = this.save.getCompanionLevel('inari_kitsune');
        if (inariLvl >= 4) {
          energyGain = Math.round(energyGain * 1.10);
        } else if (inariLvl >= 2) {
          energyGain = Math.round(energyGain * 1.05);
        }
      }

      // 🐾 Companion Evolution Perks: +rageBonusPercent
      if (this.companionConfig?.id) {
        const compStats = this.save.getCompanionTotalStats(this.companionConfig.id);
        if (compStats.rageBonusPercent > 0) {
          energyGain = Math.round(energyGain * (1 + compStats.rageBonusPercent / 100));
        }
      }

      this.addCompanionEnergy(energyGain);
      this.addRelicEnergy(energyGain);
    }

    // 🌙 Giờ Bách Quỷ Dạ Hành: Trigger khi đạt Combo x5, x10, x15...!
    if (comboData.combo >= 5 && comboData.combo % 5 === 0) {
      this.triggerNightParadeRush(`⚡ COMBO x${comboData.combo} BÁCH QUỶ DẠ HÀNH!`);
    }
  }

  private showBonusTimePopup(seconds: number = 1): void {
    const isPositive = seconds > 0;
    const text = isPositive ? `+${seconds}s` : `${seconds}s`;
    const color = isPositive ? '#00f5d4' : '#ff3366';
    const popup = this.add.text(GAME_WIDTH / 2 + 250, 18, text, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(40);

    this.tweens.add({
      targets: popup,
      y: 4,
      alpha: 0,
      duration: 700,
      ease: 'Power1',
      onComplete: () => popup.destroy()
    });
  }

  /**
   * ⚡ Electric Chain Lightning Bolt arcing from Lightning Duo to secondary target pair
   */
  private drawChainLightningBolt(fromX: number, fromY: number, toX: number, toY: number): void {
    const gfx = this.add.graphics().setDepth(35);
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) return;

    const steps = Math.max(4, Math.min(12, Math.floor(dist / 35)));
    const px = -dy / dist;
    const py = dx / dist;

    const points: { x: number; y: number }[] = [{ x: fromX, y: fromY }];
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      const jitter = (Math.random() - 0.5) * 32;
      points.push({
        x: fromX + dx * t + px * jitter,
        y: fromY + dy * t + py * jitter
      });
    }
    points.push({ x: toX, y: toY });

    // Outer cyan electric glow
    gfx.lineStyle(9, 0x00f5d4, 0.85);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.strokePath();

    // Core white lightning arc
    gfx.lineStyle(3, 0xffffff, 1.0);
    gfx.beginPath();
    gfx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      gfx.lineTo(points[i].x, points[i].y);
    }
    gfx.strokePath();

    this.feverParticles.explode(14, toX, toY);

    this.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => gfx.destroy()
    });
  }

  private showComboPopup(combo: number, multiplier: number): void {
    if (combo < 2) return;

    this.comboText.setText(`COMBO x${combo}! (+${Math.round(multiplier * 100)}%)`);
    this.comboText.setVisible(true);

    this.tweens.killTweensOf(this.comboText);
    this.comboText.setScale(1.35);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }

  private enterFeverMode(): void {
    this.audio.playFever();
    this.haptic.combo();
    this.feverBanner.setVisible(true);

    this.tweens.add({
      targets: this.feverBanner,
      scaleX: { from: 0.9, to: 1.08 },
      scaleY: { from: 0.9, to: 1.08 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Intense sakura flurry
    this.feverParticles.setFrequency(80);
    (this.feverParticles as any).speedY = { min: 120, max: 260 };
  }

  private exitFeverMode(): void {
    this.feverBanner.setVisible(false);
    this.feverParticles.setFrequency(450);
    (this.feverParticles as any).speedY = { min: 60, max: 140 };
  }

  private currentNotice: Phaser.GameObjects.Text | null = null;
  private tileSelectionPill: Phaser.GameObjects.Container | null = null;

  private showTileSelectionPill(tile: TileState): void {
    this.hideTileSelectionPill();
    if (!tile.characterId) return;

    const char = CharacterRegistry.get(tile.characterId);
    if (!char) return;

    const isBoss = !!this.bossManager;
    const pillY = isBoss ? 116 : 64;

    const container = this.add.container(GAME_WIDTH / 2, pillY).setDepth(140);

    const labelText = `🎯 Đang chọn: ${char.symbol || '✨'} ${char.name}`;
    const textObj = this.add.text(0, 0, labelText, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '800',
      color: '#ffd700'
    }).setOrigin(0.5);

    const padX = 18;
    const padY = 7;
    const textBounds = textObj.getBounds();
    const bgW = textBounds.width + padX * 2;
    const bgH = textBounds.height + padY * 2;

    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x0f111a, 0.94);
    bgGfx.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 12);
    bgGfx.lineStyle(2, 0xffd700, 0.85);
    bgGfx.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 12);

    container.add([bgGfx, textObj]);
    container.setScale(0.85).setAlpha(0);

    this.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: 150,
      ease: 'Back.easeOut'
    });

    this.tileSelectionPill = container;
  }

  private hideTileSelectionPill(): void {
    if (this.tileSelectionPill) {
      const p = this.tileSelectionPill;
      this.tileSelectionPill = null;
      this.tweens.add({
        targets: p,
        alpha: 0,
        scaleY: 0.8,
        duration: 120,
        ease: 'Quad.easeIn',
        onComplete: () => p.destroy()
      });
    }
  }

  private showNotice(text: string, color: number): void {
    if (this.currentNotice) {
      this.currentNotice.destroy();
      this.currentNotice = null;
    }

    const isBoss = !!this.bossManager;
    const startY = isBoss ? 116 : 65;
    const targetY = isBoss ? 108 : 55;

    const notice = this.add.text(GAME_WIDTH / 2, startY, text, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: `#${color.toString(16).padStart(6, '0')}`,
      backgroundColor: 'rgba(15, 17, 26, 0.95)',
      padding: { left: 26, right: 26, top: 11, bottom: 11 }
    }).setOrigin(0.5).setDepth(150);

    this.currentNotice = notice;

    this.tweens.add({
      targets: notice,
      y: targetY,
      alpha: 0,
      delay: 1800,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.currentNotice === notice) {
          this.currentNotice = null;
        }
        notice.destroy();
      }
    });
  }

  private showDamagePopup(dmg: number): void {
    const popX = this.bossSprite ? (GAME_WIDTH / 2 - 215) : (GAME_WIDTH / 2 + 35);
    const popY = this.bossSprite ? 55 : 135;
    const dmgText = this.add.text(popX, popY, `-${Math.round(dmg)} HP`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd700',
      stroke: '#d90429',
      strokeThickness: 3.5
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: dmgText,
      y: popY - 24,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => dmgText.destroy()
    });
  }

  private updateTimerBar(): void {
    if (!this.timerBarGraphics) return;

    this.timerBarGraphics.clear();
    const timerBarW = this.TIMER_BAR_W;
    const timerBarH = this.TIMER_BAR_H;
    const timerBarX = GAME_WIDTH / 2 - timerBarW / 2;
    const timerBarY = this.TIMER_BAR_Y;

    if (this.isSurvivalMode) {
      const pct = Math.max(0, Math.min(1, this.blizzardTimeRemaining / this.BLIZZARD_WAVE_INTERVAL));
      const currentW = Math.max(0, (timerBarW - 4) * pct);

      let color = 0x00f5d4; // Cyan normal
      if (this.blizzardTimeRemaining <= 3) {
        color = 0xff595e; // Warning Red in last 3s
      } else if (this.blizzardTimeRemaining <= 5) {
        color = 0xffd166; // Caution Yellow
      }

      this.timerBarGraphics.fillStyle(color, 0.95);
      this.timerBarGraphics.fillRoundedRect(timerBarX + 2, timerBarY + 2, currentW, timerBarH - 4, 7);

      if (this.isTimeFrozen) {
        this.timerBarGraphics.lineStyle(2, 0xe0fbfc, 1);
        this.timerBarGraphics.strokeRoundedRect(timerBarX, timerBarY, timerBarW, timerBarH, 8.5);
      }
      return;
    }

    if (this.isZenMode) {
      this.timerBarGraphics.fillStyle(0x00f5d4, 0.95);
      this.timerBarGraphics.fillRoundedRect(timerBarX + 2, timerBarY + 2, timerBarW - 4, timerBarH - 4, 7);
      return;
    }

    if (this.isTimeFrozen) {
      this.timerBarGraphics.fillStyle(0x00f5d4, 1);
      this.timerBarGraphics.fillRoundedRect(timerBarX + 2, timerBarY + 2, timerBarW - 4, timerBarH - 4, 7);
      this.timerBarGraphics.lineStyle(2, 0xe0fbfc, 1);
      this.timerBarGraphics.strokeRoundedRect(timerBarX, timerBarY, timerBarW, timerBarH, 8.5);
      return;
    }

    if (this.levelConfig.isStopwatch) {
      const gold = this.levelConfig.targetGoldSeconds || 45;
      const silver = this.levelConfig.targetSilverSeconds || 75;
      let progress = 1;
      let color = 0x00f5d4;

      if (this.elapsedTimeSeconds <= gold) {
        progress = Math.max(0.1, 1 - (this.elapsedTimeSeconds / gold) * 0.4);
        color = 0x00f5d4;
      } else if (this.elapsedTimeSeconds <= silver) {
        const span = silver - gold;
        const passedInSpan = this.elapsedTimeSeconds - gold;
        progress = Math.max(0.1, 0.6 - (passedInSpan / span) * 0.45);
        color = 0xffd166;
      } else {
        progress = 0.15;
        color = 0xff595e;
      }

      const barWidth = Math.max(0, (timerBarW - 4) * progress);
      this.timerBarGraphics.fillStyle(color, 1);
      this.timerBarGraphics.fillRoundedRect(timerBarX + 2, timerBarY + 2, barWidth, timerBarH - 4, 7);
      return;
    }

    const progress = Math.max(0, this.timeRemaining / this.levelConfig.timeLimit);
    const barWidth = Math.max(0, (timerBarW - 4) * progress);

    let color = 0x00f5d4;
    if (progress < 0.2) {
      color = 0xff595e;
    } else if (progress < 0.5) {
      color = 0xffd166;
    }

    this.timerBarGraphics.fillStyle(color, 1);
    this.timerBarGraphics.fillRoundedRect(timerBarX + 2, timerBarY + 2, barWidth, timerBarH - 4, 7);
  }

  public isPaused: boolean = false;

  /**
   * 🛡️ Safe Subsystem Runner: Encapsulates periodic scene subsystems so errors
   * in one module never break Phaser's requestAnimationFrame loop or freeze gameplay.
   */
  public safeSubsystemRun(subsystemName: string, action: () => void): void {
    try {
      action();
    } catch (err) {
      console.error(`[GameScene SafeSubsystem] Exception in ${subsystemName}:`, err);
    }
  }

  /**
   * 🛡️ Safe Tween: Wraps Phaser's tweens.add with target lifecycle checks and
   * safe onComplete execution to prevent dangling callbacks on destroyed game objects.
   */
  public safeTween(config: Phaser.Types.Tweens.TweenBuilderConfig): Phaser.Tweens.Tween | null {
    if (!this.scene?.isActive() || !this.tweens) {
      return null;
    }
    const originalComplete = config.onComplete;
    config.onComplete = (tween: Phaser.Tweens.Tween, targets: any[]) => {
      try {
        if (originalComplete) {
          originalComplete.call(config.onCompleteScope || this, tween, targets);
        }
      } catch (err) {
        console.warn('[GameScene SafeTween] Caught exception during tween onComplete:', err);
      }
    };
    return this.tweens.add(config);
  }

  public update(time: number, delta: number): void {
    if (this.isGameOver || this.isVictory || this.isPaused) return;

    const deltaSec = delta / 1000;

    // 1. Timer & Mode Subsystem
    this.safeSubsystemRun('Timer & Game Mode Subsystem', () => {
      if (this.isSurvivalMode) {
        // 5. ❄️ Chế Độ Sinh Tồn Dâng Trào (Survival Blizzard Mode loop)
        if (!this.isTimeFrozen) {
          this.blizzardTimeRemaining -= deltaSec;
        } else {
          this.freezeTimeRemaining -= deltaSec;
          if (this.freezeTimeRemaining <= 0) {
            this.isTimeFrozen = false;
            if (this.frostOverlayGraphics) {
              this.frostOverlayGraphics.clear();
            }
            this.showNotice('❄️ Hết thời gian đóng băng! Bão tuyết tiếp tục dâng!', 0x90e0ef);
          }
        }

        this.updateTimerBar();

        if (this.isTimeFrozen) {
          this.timeText.setText(`❄️ ĐÓNG BĂNG (${Math.ceil(this.freezeTimeRemaining)}s)`);
          this.timeText.setColor('#90e0ef');
        } else {
          const sec = Math.max(0, Math.ceil(this.blizzardTimeRemaining));
          this.timeText.setText(`⏳ BĂNG: ${sec}s`);
          if (this.blizzardTimeRemaining <= 3) {
            this.timeText.setColor('#ff595e');
            if (sec !== this.lastTickSecond) {
              this.lastTickSecond = sec;
              this.audio.playTick();
            }
          } else {
            this.timeText.setColor('#00f5d4');
          }
        }

        // Check ceiling danger
        const danger = this.boardManager.checkCeilingDanger();
        if (this.ceilingWarningBanner) {
          this.ceilingWarningBanner.setVisible(danger.isDanger || danger.isOverflow);
        }

        // Trigger blizzard push when countdown finishes
        if (this.blizzardTimeRemaining <= 0 && !this.isBlizzardPushing) {
          this.triggerBlizzardPush();
        }
      } else if (this.isZenMode) {
        if (this.timeText) {
          this.timeText.setText('∞');
        }
        this.updateTimerBar();
      } else if (this.isTimeFrozen) {
        // 🐉 Ryujin Time Freeze Ultimate Active!
        this.freezeTimeRemaining -= deltaSec;
        const displayTime = Math.max(0, Math.ceil(this.timeRemaining));
        const freezeSec = Math.max(0, Math.ceil(this.freezeTimeRemaining));
        this.timeText.setText(`❄️ ${displayTime}s (${freezeSec}s)`);
        this.timeText.setColor('#00f5d4');
        this.updateTimerBar();

        if (this.freezeTimeRemaining <= 0) {
          this.isTimeFrozen = false;
          this.timeText.setColor('#00f5d4');
          if (this.frostOverlayGraphics) {
            this.frostOverlayGraphics.clear();
          }
          this.showNotice('❄️ Hết thời gian đóng băng! Tiếp tục đếm ngược!', 0x90e0ef);
        }
      } else if (this.levelConfig.isStopwatch) {
        this.elapsedTimeSeconds += deltaSec;
        const totalSec = Math.floor(this.elapsedTimeSeconds);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

        const gold = this.levelConfig.targetGoldSeconds || 45;
        const silver = this.levelConfig.targetSilverSeconds || 75;
        let starsBadge = '⭐⭐⭐';
        let textColor = '#00f5d4';

        if (this.elapsedTimeSeconds > silver) {
          starsBadge = '⭐';
          textColor = '#ff595e';
        } else if (this.elapsedTimeSeconds > gold) {
          starsBadge = '⭐⭐';
          textColor = '#ffd166';
        }

        this.timeText.setText(`⏱️ ${timeStr} ${starsBadge}`);
        this.timeText.setColor(textColor);
        this.updateTimerBar();
      } else {
        // Timer countdown
        this.timeRemaining -= deltaSec;
        this.timeText.setText(`⏳ ${Math.max(0, Math.ceil(this.timeRemaining))}s`);
        this.timeText.setColor('#00f5d4');
        this.updateTimerBar();

        // Clock ticking warning when time < 20s
        if (this.timeRemaining <= 20 && this.timeRemaining > 0) {
          const currentSec = Math.floor(this.timeRemaining);
          if (currentSec !== this.lastTickSecond) {
            this.lastTickSecond = currentSec;
            this.audio.playTick();
            // Subtle red flash on low time
            this.safeTween({
              targets: this.timeText,
              scaleX: 1.25,
              scaleY: 1.25,
              duration: 120,
              yoyo: true
            });
          }
        }

        // 🌙 Giờ Bách Quỷ Dạ Hành: Trigger khi vào 30 giây cuối cùng của màn chơi!
        if (!this.isZenMode && this.timeRemaining <= 30 && this.timeRemaining > 0 && !this.hasTriggeredLowTimeRush) {
          this.hasTriggeredLowTimeRush = true;
          if (!this.isNightParadeActive) {
            this.triggerNightParadeRush('⏱️ 30 GIÂY SINH TỬ!');
          }
        }

        if (this.timeRemaining <= 0) {
          // 🐢 Genbu Passive: Quy Giáp Trường Thọ (+1 Mạng sinh mệnh dự phòng khi hết giờ)
          if (this.companionConfig.id === 'genbu_tortoise' && !this.genbuExtraLifeUsed) {
            this.genbuExtraLifeUsed = true;
            const level = this.save.getCompanionLevel('genbu_tortoise');
            const bonusSeconds = level >= 5 ? 8 : level >= 4 ? 7 : level >= 3 ? 6 : 5;
            this.timeRemaining = bonusSeconds;
            this.audio.playVictory();
            this.showNotice(`🛡️ QUY GIÁP HUYỀN VŨ BẢO HỘ! CỨU NGUY +${bonusSeconds}S!`, 0x2a9d8f);
            return;
          }
          this.handleGameOver('⏱️ Hết thời gian thử thách!');
          return;
        }
      }
    });

    // 2. Companion Passives & Temporary Buffs Subsystem
    this.safeSubsystemRun('Companion Passives & Buffs Subsystem', () => {
      // 🐯 Byakko Gravity Lock Countdown
      if (this.byakkoGravityLockRemaining > 0) {
        this.byakkoGravityLockRemaining -= deltaSec;
        if (this.byakkoGravityLockRemaining <= 0) {
          this.byakkoGravityLockRemaining = 0;
          this.boardManager.setGravityLocked(false);
          this.boardManager.setResolveSpeedMultiplier(1.0);
          this.showNotice('🐯 Khóa trọng lực của Bạch Hổ đã kết thúc!', 0xadb5bd);
        }
      }

      // 🐍 Orochi Boss Damage Buff Countdown
      if (this.orochiBossDamageBuffRemaining > 0) {
        this.orochiBossDamageBuffRemaining -= deltaSec;
        if (this.orochiBossDamageBuffRemaining <= 0) {
          this.orochiBossDamageBuffRemaining = 0;
          this.orochiBossDamageMultiplier = 1.0;
        }
      }

      // 🦅 Yatagarasu Idle Guidance Passive
      if (this.companionConfig.id === 'yatagarasu_crow' && !this.isGameOver && !this.isVictory) {
        const lvl = this.save.getCompanionLevel('yatagarasu_crow');
        const idleThreshold = lvl >= 4 ? 7 : lvl >= 2 ? 8 : 10;
        this.yatagarasuIdleTimer += deltaSec;
        if (this.yatagarasuIdleTimer >= idleThreshold) {
          this.yatagarasuIdleTimer = 0;
          this.boardManager.showHint();
          this.showNotice('🦅 Kim Ô chỉ lối: Đốm sáng mặt trời soi sáng ô hợp lệ!', 0xfb8500);
        }
      }
    });

    // 3. Lucky Pots Subsystem
    this.safeSubsystemRun('Lucky Pots Subsystem', () => {
      this.boardManager?.updateLuckyPots(deltaSec);
    });

    // 4. Combo System Subsystem
    this.safeSubsystemRun('Combo System Subsystem', () => {
      this.comboSystem?.update(deltaSec);
    });

    // 5. Night Parade Subsystem
    this.safeSubsystemRun('Night Parade Subsystem', () => {
      if (this.isNightParadeActive) {
        this.nightParadeTimeRemaining -= deltaSec;
        this.updateNightParadeTimerUI();
        if (this.nightParadeTimeRemaining <= 0) {
          this.endNightParadeRush();
        }
      }
    });

    // 6. Boss Manager Subsystem
    this.safeSubsystemRun('Boss Manager Subsystem', () => {
      if (this.bossManager && !this.isTimeFrozen && !this.isBossDefeatedSequence) {
        let bossDeltaSec = deltaSec;
        if (this.companionConfig.id === 'orochi_serpent') {
          const oLvl = this.save.getCompanionLevel('orochi_serpent');
          const suppression = oLvl >= 5 ? 0.25 : oLvl >= 3 ? 0.20 : 0.15;
          bossDeltaSec *= (1 - suppression);
        }
        this.bossManager.update(
          bossDeltaSec,
          this.boardManager.getGrid(),
          this.boardManager.getRows(),
          this.boardManager.getCols()
        );
      }
    });
  }

  private triggerBlizzardPush(): void {
    if (this.isGameOver || this.isVictory || this.isBlizzardPushing) return;
    this.isBlizzardPushing = true;

    // Check if ceiling danger is already overflow before push
    const danger = this.boardManager.checkCeilingDanger();
    if (danger.isOverflow) {
      this.handleGameOver('❄️ Băng tuyết đã dâng chạm kịch nóc trên!');
      return;
    }

    this.audio.playLaserZap();
    this.haptic.heavy();
    this.feverParticles.explode(20, GAME_WIDTH / 2, GAME_HEIGHT - 60);

    const newRow = BoardGenerator.generatePairedRow(this.levelConfig.columns, this.levelConfig.characterPool);
    const success = this.boardManager.pushBlizzardRow(newRow, () => {
      this.survivalWave++;
      const waveBonus = this.survivalWave * 150;
      this.score += waveBonus;
      this.updateScoreDisplay();

      this.showNotice(`❄️ ĐỢT ${this.survivalWave}: BĂNG DÂNG LÊN! (+${waveBonus} PTS)`, 0x90e0ef);
      this.blizzardTimeRemaining = this.BLIZZARD_WAVE_INTERVAL;
      this.isBlizzardPushing = false;

      if (this.levelTitleText) {
        this.levelTitleText.setText(`❄️ BÃO TUYẾT • ĐỢT ${this.survivalWave}`);
      }
    });

    if (!success) {
      this.handleGameOver('❄️ Băng tuyết đã dâng chạm kịch nóc trên!');
    }
  }

  private triggerBossDefeatSequence(): void {
    if (this.isBossDefeatedSequence || this.isVictory || this.isGameOver) return;
    this.isBossDefeatedSequence = true;

    // 1. Play dramatic sounds & haptic feedback
    this.audio.playTaikoHit(false, true);
    this.audio.playVictory();
    this.haptic.combo();

    // 2. Camera shake to emphasize the epic titan fall
    this.cameras.main.shake(700, 0.018);

    // 3. Boss Sprite Dramatic Defeat Animation
    if (this.bossContainer) {
      this.tweens.add({
        targets: this.bossContainer,
        scaleX: 1.3,
        scaleY: 1.3,
        angle: 12,
        duration: 200,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.tweens.add({
            targets: this.bossContainer,
            alpha: 0,
            scaleX: 0.1,
            scaleY: 0.1,
            duration: 400,
            ease: 'Back.easeIn'
          });
        }
      });
    }

    // 4. Gold & Spark Explosion at Boss Header
    const width = GAME_WIDTH;
    this.feverParticles.explode(50, width / 2, 70);

    // 5. Shatter all obstacle blocks on the board
    if (this.boardManager) {
      const grid = this.boardManager.getGrid();
      const rows = this.boardManager.getRows();
      const cols = this.boardManager.getCols();
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const t = grid[r][c];
          if (t.modifier === 'stone' || t.modifier === 'ice' || t.modifier === 'thorn' || t.modifier === 'barricade') {
            t.modifier = 'none';
            t.modifierLevel = 0;
            t.iceLayers = 0;
          }
        }
      }
      this.boardManager.syncViewsAfterMovement();
    }

    this.isBossDefeatedThisRun = true;

    // 6. Smooth delay before transitioning to Victory dialog
    this.time.delayedCall(1600, () => {
      this.handleVictory();
    });
  }

  private handleVictory(): void {
    if (this.isNightParadeActive) {
      this.endNightParadeRush();
    }
    if (this.isVictory) return;
    this.isVictory = true;

    this.audio.playVictory();

    // Remaining time bonus (+50 pts per second)
    const timeBonus = this.levelConfig.isStopwatch
      ? Math.max(300, Math.floor(((this.levelConfig.targetSilverSeconds || 75) - this.elapsedTimeSeconds) * 40))
      : Math.floor(this.timeRemaining * 50);
    this.score += Math.max(0, timeBonus);
    this.updateScoreDisplay();

    // 4. ⭐ Dynamic Star Quests Evaluation
    const quests = this.levelConfig.quests || [
      { id: 'q1', type: 'clear', target: 1, description: 'Dọn sạch bàn cờ trước khi hết giờ' },
      { id: 'q2', type: 'combo', target: 5, description: 'Đạt chuỗi Combo liên tiếp x5' },
      { id: 'q3', type: 'no_booster', target: 0, description: 'Không dùng trợ giúp' }
    ];

    const evaluateQuest = (q: any) => {
      if (q.type === 'clear') return true;
      if (q.type === 'combo') return this.maxComboAchieved >= q.target;
      if (q.type === 'no_booster') return this.playerUsedBoosterCount === 0;
      if (q.type === 'no_shuffle') return this.playerUsedShuffleCount === 0;
      if (q.type === 'time_left') return !this.isZenMode && this.timeRemaining >= q.target;
      if (q.type === 'break_ice') return this.brokenIceCount >= q.target;
      if (q.type === 'break_stone') return this.brokenStoneCount >= q.target;
      if (q.type === 'rescue_cages') return this.brokenCagesCount >= q.target;
      return true;
    };

    const quest1Achieved = quests[0] ? evaluateQuest(quests[0]) : true;
    const quest2Achieved = quests[1] ? evaluateQuest(quests[1]) : (this.maxComboAchieved >= 5);
    const quest3Achieved = quests[2] ? evaluateQuest(quests[2]) : (this.playerUsedBoosterCount === 0 || this.timeRemaining > 40);

    // Star Quest Mapping: Earned stars strictly match completed quest objectives (1 quest = 1 star)
    let earnedStars = (quest1Achieved ? 1 : 0) + (quest2Achieved ? 1 : 0) + (quest3Achieved ? 1 : 0);
    earnedStars = Math.max(1, Math.min(3, earnedStars));

    const isPerfect = earnedStars === 3;
    const diffCfg = this.levelConfig.difficulties?.[this.currentDifficulty];
    const diffMultiplier = diffCfg?.rewardMultiplier || 1.0;
    const baseCoins = Math.round(this.levelConfig.rewards.coins * diffMultiplier);
    const perfectBonusCoins = isPerfect ? 50 : 0;
    let earnedCoins = baseCoins + perfectBonusCoins;

    // 🐯 Byakko Passive: Tốc Chiến Tiên Phong (Thưởng điểm Speedrun)
    if (this.companionConfig.id === 'byakko_tiger') {
      const bLvl = this.save.getCompanionLevel('byakko_tiger');
      const bonusPct = bLvl >= 5 ? 0.25 : bLvl >= 4 ? 0.18 : bLvl >= 3 ? 0.15 : bLvl >= 2 ? 0.12 : 0.10;
      const speedrunBonus = Math.round(this.score * bonusPct);
      this.score += speedrunBonus;
      this.updateScoreDisplay();
    }

    // 🐾 Nekomata Passive: Chiêu Tài Lội Ngược (Thắng khi < 15s nhân x1.5 đến x2.0 Mảnh & Xu)
    let nekomataMultiplier = 1.0;
    if (this.companionConfig.id === 'nekomata_cat' && this.timeRemaining < 15) {
      const nLvl = this.save.getCompanionLevel('nekomata_cat');
      nekomataMultiplier = nLvl >= 5 ? 2.0 : nLvl >= 4 ? 1.8 : nLvl >= 3 ? 1.7 : nLvl >= 2 ? 1.6 : 1.5;
    }
    earnedCoins = Math.round(earnedCoins * nekomataMultiplier);

    // 🐾 Thưởng Vàng cộng dồn từ Cấp & Bậc Tiến Hóa của Linh Thú
    // 🐾 Thưởng Vàng cộng dồn từ Cấp & Bậc Tiến Hóa của Linh Thú
    const compStats = this.companionConfig?.id ? this.save.getCompanionTotalStats(this.companionConfig.id) : { expBonusPercent: 0, goldBonusPercent: 0 };
    if (compStats.goldBonusPercent > 0) {
      earnedCoins = Math.round(earnedCoins * (1 + compStats.goldBonusPercent / 100));
    }

    // 🎲 Tính toán Chiến Lợi Phẩm theo tỷ lệ rớt (LootManager)
    const lootResult = LootManager.calculateLoot(
      this.levelConfig.levelNumber,
      this.currentDifficulty as 'easy' | 'medium' | 'hard',
      earnedStars,
      nekomataMultiplier,
      compStats.expBonusPercent
    );

    // Xử lý Mảnh Linh Thú nếu rớt
    let shardsEarned = 0;
    let shardCompanionName = '';
    let shardCompanionId = '';

    if (lootResult.mainShardsEarned > 0) {
      shardsEarned = lootResult.mainShardsEarned;
      shardCompanionName = lootResult.mainCompanionName;
      shardCompanionId = lootResult.mainCompanionId;
      this.save.addCompanionShards(lootResult.mainCompanionId, lootResult.mainShardsEarned);
    } else if (lootResult.subShardsEarned > 0) {
      shardsEarned = lootResult.subShardsEarned;
      shardCompanionName = lootResult.subCompanionName;
      shardCompanionId = lootResult.subCompanionId;
      this.save.addCompanionShards(lootResult.subCompanionId, lootResult.subShardsEarned);
    }

    // Xử lý Thẻ Vật Phẩm Hỗ Trợ (Booster) nếu rớt
    if (lootResult.itemEarned) {
      this.save.addBooster(lootResult.itemEarned.type, 1);
    }

    // Tích Lũy Điểm Kinh Nghiệm (EXP) cho Linh Thú đang trang bị
    const expResult = this.save.addCompanionExp(this.companionConfig.id, lootResult.expEarned);

    this.save.addCoins(earnedCoins);
    this.save.recordLevelCompleted(this.levelConfig.id, this.levelConfig.levelNumber, earnedStars, this.currentDifficulty);
    this.save.recordDifficultyCompleted(this.levelConfig.id, this.currentDifficulty);

    // Unlock next realm if completing milestone 10th level of chapter
    if (this.levelConfig.levelNumber % 10 === 0) {
      const nextChapter = LevelManager.getChapterByLevel(this.levelConfig.levelNumber + 1);
      if (nextChapter && nextChapter.worldId) {
        this.save.unlockRealm(nextChapter.worldId);
      }
    }

    // Relic Shard Drop Calculation (Calibrated Hardcore Low Drop Rate Model)
    let relicShardsEarned = 0;
    let relicSurplusCoins = 0;
    let relicCanUnlock = false;
    const targetRelic = this.levelConfig.relicReward;

    if (targetRelic) {
      const tier = targetRelic.tier || 'common';
      const isBossLevel = !!(this.bossManager || this.levelConfig.levelNumber % 10 === 0 || this.levelConfig.levelNumber % 5 === 0);
      const is3StarHard = earnedStars === 3 && this.currentDifficulty === 'hard';

      // Drop rates by tier and difficulty:
      // 🟢 Hạ Phẩm (Common - Cần 40 Mảnh): Dễ 1.5% | Vừa 3.0% | Khó 5.0%
      // 🟡 Trung Phẩm (Rare - Cần 75 Mảnh): Dễ 0.8% | Vừa 1.8% | Khó 3.0%
      // 🔴 Thượng Phẩm (Epic - Cần 100 Mảnh): Dễ 0.4% | Vừa 0.9% | Khó 1.8%
      let dropChance = 0.015;

      if (tier === 'epic') {
        dropChance = this.currentDifficulty === 'hard' ? 0.018 : (this.currentDifficulty === 'medium' ? 0.009 : 0.004);
      } else if (tier === 'rare') {
        dropChance = this.currentDifficulty === 'hard' ? 0.030 : (this.currentDifficulty === 'medium' ? 0.018 : 0.008);
      } else { // common
        dropChance = this.currentDifficulty === 'hard' ? 0.050 : (this.currentDifficulty === 'medium' ? 0.030 : 0.015);
      }

      // Hardcore Boss bonus: 3-Star on Hard at Boss Level adds +4.0% bonus drop rate (no longer 100% farm exploit)
      if (isBossLevel && is3StarHard) {
        dropChance += 0.040;
      }

      // 1) In-game board shard collection: Guaranteed 1 shard if player matched the rare glowing board tile
      if (this.isRelicShardCollectedThisRun) {
        relicShardsEarned += 1;
      }

      // 2) End-of-stage clear RNG drop roll (if not already found on board)
      if (relicShardsEarned === 0 && Math.random() <= dropChance) {
        // Epic on Hard has a rare 10% chance to drop 2 shards, otherwise strictly 1 shard
        const dropAmount = (tier === 'epic' && this.currentDifficulty === 'hard' && Math.random() < 0.10) ? 2 : 1;
        relicShardsEarned += dropAmount;
      }

      if (relicShardsEarned > 0) {
        const shardResult = this.save.addRelicShards(targetRelic.id, relicShardsEarned);
        relicSurplusCoins = shardResult.surplusCoins;
        relicCanUnlock = shardResult.canUnlock;
      }
    }

    // Award Monster Badge corresponding to current difficulty tier
    const badgeIdx = this.currentDifficulty === 'easy' ? 0 : this.currentDifficulty === 'medium' ? 1 : 2;
    const earnedBadge = this.levelConfig.badgeRewards?.[badgeIdx];
    if (earnedBadge) {
      this.save.collectBadge(earnedBadge.id);
    }

    // Restore +1 life bonus on level clear (max 10)
    this.lives = Math.min(10, this.lives + 1);

    // Check newly unlocked character
    let newlyUnlockedId: string | null = null;
    if (this.levelConfig.rewards.unlockCharacterId) {
      const isNew = this.save.discoverCharacter(this.levelConfig.rewards.unlockCharacterId);
      if (isNew) {
        newlyUnlockedId = this.levelConfig.rewards.unlockCharacterId;
      }
    }

    this.showVictoryModal(earnedCoins, earnedStars, newlyUnlockedId, timeBonus, {
      quest1: quest1Achieved,
      quest2: quest2Achieved,
      quest3: quest3Achieved,
      maxCombo: this.maxComboAchieved,
      boostersUsed: this.playerUsedBoosterCount,
      timeRemaining: this.timeRemaining,
      isPerfect,
      relicReward: targetRelic || null,
      relicShardsEarned,
      relicSurplusCoins,
      relicCanUnlock,
      badgeReward: earnedBadge || null,
      shardsEarned,
      shardCompanionName,
      shardCompanionId,
      lootResult,
      expResult,
      bossDefeated: (this.isBossDefeatedThisRun || this.bossManager) ? this.bossManager?.getBossConfig() : null,
      nekomataMultiplier
    });
  }

  private showVictoryModal(
    coins: number,
    stars: number,
    newCharId: string | null,
    timeBonus: number = 0,
    questStats?: {
      quest1: boolean;
      quest2: boolean;
      quest3: boolean;
      maxCombo: number;
      boostersUsed: number;
      timeRemaining: number;
      isPerfect: boolean;
      relicReward?: any;
      relicShardsEarned?: number;
      relicSurplusCoins?: number;
      relicCanUnlock?: boolean;
      badgeReward?: any;
      shardsEarned?: number;
      shardCompanionName?: string;
      shardCompanionId?: string;
      lootResult?: CalculatedLootResult;
      expResult?: any;
      bossDefeated?: any;
      nekomataMultiplier?: number;
    }
  ): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.92);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const isPerfect = questStats?.isPerfect ?? (stars === 3);
    const cardW = 940;
    const cardH = 610;

    const card = this.add.graphics();
    card.fillStyle(0x131122, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    card.lineStyle(2.5, isPerfect ? 0xffd700 : 0x7209b7, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);

    // Decorative Golden Inner Line
    card.lineStyle(1.4, 0xffd700, 0.55);
    card.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, 18);
    modal.add(card);

    // 1. Header: Title
    const title = this.add.text(0, -258, '🏆 CHIẾN THẮNG HUY HOÀNG! 🏆', {
      fontFamily: FONT_DISPLAY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);
    modal.add(title);

    // Level subtitle with Difficulty badge
    const diffBadge = this.currentDifficulty === 'easy' ? '🟢 DỄ' : this.currentDifficulty === 'medium' ? '🟡 VỪA' : '🔴 KHÓ';
    const subTitle = this.add.text(0, -222, `${this.levelConfig.title}  •  [${diffBadge}]`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ced4da'
    }).setOrigin(0.5);
    modal.add(subTitle);

    // 3 Animated Stars Container
    const starsY = -176;
    const starOffsets = [-72, 0, 72];
    for (let i = 0; i < 3; i++) {
      const isEarned = i < stars;
      const starIcon = this.add.text(starOffsets[i], starsY, isEarned ? '⭐' : '☆', {
        fontSize: '50px',
        color: isEarned ? '#ffd700' : '#495057'
      }).setOrigin(0.5);

      if (isEarned) {
        starIcon.setScale(0);
        this.tweens.add({
          targets: starIcon,
          scaleX: 1,
          scaleY: 1,
          delay: 180 * (i + 1),
          duration: 350,
          ease: 'Back.easeOut',
          onStart: () => {
            this.audio.playMatch(i + 2);
          }
        });
      } else {
        starIcon.setAlpha(0.35);
      }
      modal.add(starIcon);
    }

    // Rating Badge Pill
    let ratingBadgeStr = '⭐ ĐẠT 1/3 SAO • CỐ LÊN!';
    let ratingColor = '#ffd166';
    if (isPerfect || stars === 3) {
      ratingBadgeStr = '🌟 HOÀN HẢO 3 SAO (+50 XU THƯỞNG)! 🌟';
      ratingColor = '#ffd700';
    } else if (stars === 2) {
      ratingBadgeStr = '⭐ ĐẠT 2/3 SAO • SẮP HOÀN HẢO!';
      ratingColor = '#00f5d4';
    }

    const ratingBadge = this.add.text(0, -130, ratingBadgeStr, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: ratingColor
    }).setOrigin(0.5);
    modal.add(ratingBadge);

    // ==========================================
    // 2. LEFT PANEL: Star Quests Checklist Panel
    // ==========================================
    const qPanelW = 350;
    const qPanelH = 265;
    const qPanelX = -260;
    const qPanelY = 28;

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a162b, 0.95);
    panelBg.fillRoundedRect(qPanelX - qPanelW / 2, qPanelY - qPanelH / 2, qPanelW, qPanelH, 16);
    panelBg.lineStyle(1.6, 0x4338ca, 0.75);
    panelBg.strokeRoundedRect(qPanelX - qPanelW / 2, qPanelY - qPanelH / 2, qPanelW, qPanelH, 16);
    modal.add(panelBg);

    const panelTitle = this.add.text(qPanelX, qPanelY - 105, '⭐ NHIỆM VỤ 3 SAO (QUESTS)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16.5px',
      fontStyle: '900',
      color: '#c77dff'
    }).setOrigin(0.5);
    modal.add(panelTitle);

    const levelQuests = this.levelConfig.quests || [
      { id: 'q1', type: 'clear' as const, description: 'Dọn sạch bàn cờ trước khi hết giờ', star: 1 },
      { id: 'q2', type: 'combo' as const, description: 'Đạt chuỗi Combo liên tiếp x5', star: 2 },
      { id: 'q3', type: 'no_booster' as const, description: 'Không dùng quyền trợ giúp', star: 3 }
    ];

    // Quest 1
    const q1Desc = levelQuests[0]?.description || 'Dọn sạch bàn cờ trước khi hết giờ';
    const q1Txt = this.add.text(qPanelX - 158, qPanelY - 68, `⭐ 1. ${q1Desc}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f8f9fa',
      wordWrap: { width: 240 }
    });
    const q1Badge = this.add.text(qPanelX + 158, qPanelY - 68, '[✓ ĐẠT]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(1, 0);
    modal.add([q1Txt, q1Badge]);

    // Quest 2
    const q2Ok = questStats?.quest2 ?? (stars >= 2);
    const q2Desc = levelQuests[1]?.description || 'Đạt chuỗi Combo thử thách';
    const q2Txt = this.add.text(qPanelX - 158, qPanelY - 20, `⭐ 2. ${q2Desc}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: q2Ok ? '#f8f9fa' : '#adb5bd',
      wordWrap: { width: 240 }
    });
    const q2Badge = this.add.text(qPanelX + 158, qPanelY - 20, q2Ok ? '[✓ ĐẠT]' : '[✕ CHƯA]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: q2Ok ? '#00f5d4' : '#ff758f'
    }).setOrigin(1, 0);
    modal.add([q2Txt, q2Badge]);

    // Quest 3
    const q3Ok = questStats?.quest3 ?? (stars === 3);
    const q3Desc = levelQuests[2]?.description || 'Vượt qua không dùng trợ giúp';
    const q3Txt = this.add.text(qPanelX - 158, qPanelY + 28, `⭐ 3. ${q3Desc}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: q3Ok ? '#f8f9fa' : '#adb5bd',
      wordWrap: { width: 240 }
    });
    const q3Badge = this.add.text(qPanelX + 158, qPanelY + 28, q3Ok ? '[✓ ĐẠT]' : '[✕ CHƯA]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: q3Ok ? '#00f5d4' : '#ff758f'
    }).setOrigin(1, 0);
    modal.add([q3Txt, q3Badge]);

    // Quest Tip / Note
    const qNoteTxt = this.add.text(qPanelX, qPanelY + 95, isPerfect ? '✨ Xuất sắc! Nhận trọn vẹn điểm thưởng! ✨' : '💡 Mẹo: Chơi lại để săn trọn 3 sao!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: isPerfect ? '#ffd700' : '#ffd166'
    }).setOrigin(0.5);
    modal.add(qNoteTxt);

    // ==========================================
    // 3. RIGHT PANEL: REWARD CARDS SHOWCASE
    // ==========================================
    const rPanelW = 520;
    const rPanelH = 265;
    const rPanelX = 195;
    const rPanelY = 28;

    const rPanelBg = this.add.graphics();
    rPanelBg.fillStyle(0x1e1915, 0.95);
    rPanelBg.fillRoundedRect(rPanelX - rPanelW / 2, rPanelY - rPanelH / 2, rPanelW, rPanelH, 16);
    rPanelBg.lineStyle(1.6, 0x855a1d, 0.8);
    rPanelBg.strokeRoundedRect(rPanelX - rPanelW / 2, rPanelY - rPanelH / 2, rPanelW, rPanelH, 16);
    modal.add(rPanelBg);

    const rPanelTitle = this.add.text(rPanelX, rPanelY - 105, '🎁 THẺ BÀI CHIẾN LỢI PHẨM (REWARDS)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(rPanelTitle);

    const rSubNote = this.add.text(rPanelX, rPanelY - 82, `❤️ Tự động hồi phục +1 sinh lực (Hiện có: ${this.lives}/10)`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ced4da'
    }).setOrigin(0.5);
    modal.add(rSubNote);

    // Assemble dynamic reward cards
    interface RewardCardItem {
      type: string;
      title: string;
      amount?: string;
      sub?: string;
      icon?: string;
      imageKey?: string;
      borderColor: number;
      badgeColor: number;
      isHighlighted?: boolean;
    }

    const rewardCards: RewardCardItem[] = [];

    // Card 1: Coins Card
    const nekoMult = questStats?.nekomataMultiplier || 1.0;
    const coinTag = nekoMult > 1
      ? `🐾 x${nekoMult} NEKOMATA`
      : isPerfect
        ? '🌟 3-SAO (+50)'
        : '💰 VÀNG THẮNG';

    rewardCards.push({
      type: 'coins',
      title: coinTag,
      amount: `+${formatCurrency(coins)} XU`,
      sub: 'VÀNG CHIẾN LỢI',
      icon: '🪙',
      borderColor: 0xffd700,
      badgeColor: 0x9a6b00,
      isHighlighted: isPerfect || nekoMult > 1
    });

    // Card 2: Companion Shards Card (Only if dropped)
    const shardCount = questStats?.shardsEarned || 0;
    if (shardCount > 0) {
      const shardName = questStats?.shardCompanionName || this.companionConfig.name;
      const shardId = questStats?.shardCompanionId || this.companionConfig.id;
      const compTex = `comp_${shardId}`;
      const charTexForComp = `char_${shardId}`;
      const shardImageKey = this.textures.exists(compTex)
        ? compTex
        : (this.textures.exists(charTexForComp) ? charTexForComp : undefined);

      const shardTag = nekoMult > 1
        ? `🐾 x${nekoMult} MẢNH`
        : '💎 MẢNH THẦN THÚ';

      rewardCards.push({
        type: 'shards',
        title: shardTag,
        amount: `+${shardCount} MẢNH`,
        sub: shardName.toUpperCase(),
        icon: '💎',
        imageKey: shardImageKey,
        borderColor: 0x00f5d4,
        badgeColor: 0x007f5f,
        isHighlighted: true
      });
    }

    // Card 2.5: Booster Item Card (If dropped by LootManager)
    if (questStats?.lootResult?.itemEarned) {
      const it = questStats.lootResult.itemEarned;
      const boosterImgKey = `item_booster_${it.type}`;
      rewardCards.push({
        type: 'item',
        title: '🎁 VẬT PHẨM RỚT',
        amount: `+1 ${it.name.toUpperCase()}`,
        sub: 'CHIẾN LỢI PHẨM',
        icon: it.icon,
        imageKey: this.textures.exists(boosterImgKey) ? boosterImgKey : undefined,
        borderColor: 0x06d6a0,
        badgeColor: 0x007f5f,
        isHighlighted: true
      });
    }

    // Card 3: Boss Bounty / Boss Trophy Card (if boss defeated this run)
    if (questStats?.bossDefeated) {
      const boss = questStats.bossDefeated;
      const bossTex = `boss_${boss.id || 'orochi'}`;
      rewardCards.push({
        type: 'boss',
        title: '👑 CHIẾN CÔNG BOSS',
        amount: 'HẠ GỤC TRÙM!',
        sub: boss.name.toUpperCase(),
        icon: '👹',
        imageKey: this.textures.exists(bossTex) ? bossTex : undefined,
        borderColor: 0xff595e,
        badgeColor: 0xb5179e,
        isHighlighted: true
      });
    }

    // Card 4: Newly Unlocked Character Card (if any)
    if (newCharId) {
      const char = CharacterRegistry.get(newCharId);
      TextureGenerator.ensureCharacterTexture(this, newCharId);
      const charTex = `char_${newCharId}`;
      rewardCards.push({
        type: 'character',
        title: '🎊 MỞ KHÓA MỚI!',
        amount: char ? char.name : 'Linh Thú',
        sub: char ? char.japaneseName : 'MỚI MỞ KHÓA',
        icon: char ? char.symbol : '🦊',
        imageKey: this.textures.exists(charTex) ? charTex : undefined,
        borderColor: 0xff758f,
        badgeColor: 0xd90429,
        isHighlighted: true
      });
    }

    // Card 5: Relic Shard Drop Card
    if (questStats?.relicReward && questStats.relicShardsEarned && questStats.relicShardsEarned > 0) {
      const relic = questStats.relicReward;
      const surplusCoins = questStats.relicSurplusCoins || 0;
      const amountTxt = surplusCoins > 0 
        ? `+${formatCurrency(surplusCoins)} XU` 
        : `+${questStats.relicShardsEarned} MẢNH`;
      const subTxt = surplusCoins > 0
        ? '★5 Tối Đa • Tự Đổi Xu'
        : (questStats.relicCanUnlock ? '⚡ ĐÃ ĐỦ MẢNH ĐÚC!' : `${this.save.getRelicShards(relic.id)}/${this.save.getRelicRequiredShards(relic.id)} Mảnh`);
      
      const candidateRelicKeys = [
        relic.id,
        `relic_${relic.id}`,
        relic.id.replace(/^relic_/, ''),
        `relic_${relic.id.replace(/^relic_/, '')}`
      ];
      const relicFoundKey = candidateRelicKeys.find(k => this.textures.exists(k));

      rewardCards.push({
        type: 'relic',
        title: surplusCoins > 0 ? '💰 QUY ĐỔI MẢNH THỪA' : '⛩️ MẢNH THẦN KHÍ',
        amount: amountTxt,
        sub: subTxt,
        icon: relic.icon || '🪞',
        imageKey: relicFoundKey,
        borderColor: 0xffd700,
        badgeColor: 0x9c6644,
        isHighlighted: true
      });
    }

    // Card 6: Monster Badge Card (if any)
    if (questStats?.badgeReward) {
      const badge = questStats.badgeReward;
      const tierLabel = this.currentDifficulty === 'easy' ? 'ĐỒNG' : this.currentDifficulty === 'medium' ? 'BẠC' : 'VÀNG';
      rewardCards.push({
        type: 'badge',
        title: '🎖️ HUY HIỆU',
        amount: badge.name,
        sub: `HẠNG ${tierLabel}`,
        icon: '🛡️',
        borderColor: 0x00f5d4,
        badgeColor: 0x3f37c9
      });
    }

    // Card 7: Speed Bonus PTS Card (if timeBonus > 0 and room available)
    if (rewardCards.length <= 2 && timeBonus > 0) {
      rewardCards.push({
        type: 'speed',
        title: '⚡ TỐC CHIẾN',
        amount: `+${formatCurrency(timeBonus)} PTS`,
        sub: 'ĐIỂM TỐC ĐỘ',
        icon: '⏱️',
        borderColor: 0x4cc9f0,
        badgeColor: 0x1d3557
      });
    }

    // Render cards side by side
    const maxShowCards = Math.min(4, rewardCards.length);
    const visibleCards = rewardCards.slice(0, maxShowCards);
    const cardItemW = maxShowCards === 4 ? 118 : maxShowCards === 3 ? 152 : 190;
    const cardItemH = 180;
    const cardSpacing = Math.floor(rPanelW / maxShowCards);
    const cardsStartY = rPanelY + 24;

    visibleCards.forEach((cData, cIdx) => {
      const cPosX = rPanelX - rPanelW / 2 + cIdx * cardSpacing + cardSpacing / 2;
      const cPosY = cardsStartY;

      const cardContainer = this.add.container(cPosX, cPosY);

      // Card Base
      const cBg = this.add.graphics();
      cBg.fillStyle(cData.isHighlighted ? 0x221326 : 0x141224, 0.96);
      cBg.fillRoundedRect(-cardItemW / 2, -cardItemH / 2, cardItemW, cardItemH, 14);
      cBg.lineStyle(cData.isHighlighted ? 2.5 : 1.8, cData.borderColor, 0.95);
      cBg.strokeRoundedRect(-cardItemW / 2, -cardItemH / 2, cardItemW, cardItemH, 14);

      // Subtle inner frame
      cBg.lineStyle(1.0, cData.borderColor, 0.35);
      cBg.strokeRoundedRect(-cardItemW / 2 + 3, -cardItemH / 2 + 3, cardItemW - 6, cardItemH - 6, 11);

      // Header Tag Badge
      const tagW = cardItemW - 14;
      const tagH = 24;
      const tagBg = this.add.graphics();
      tagBg.fillStyle(cData.badgeColor, 0.95);
      tagBg.fillRoundedRect(-tagW / 2, -cardItemH / 2 + 6, tagW, tagH, 6);

      const tagTxt = this.add.text(0, -cardItemH / 2 + 18, cData.title, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: maxShowCards === 4 ? '11.5px' : '13px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Card Graphic/Visual in Center
      let centerVisual: Phaser.GameObjects.GameObject;
      const visualSize = maxShowCards === 4 ? 54 : 64;
      if (cData.imageKey && this.textures.exists(cData.imageKey)) {
        centerVisual = this.add.image(0, -6, cData.imageKey).setDisplaySize(visualSize, visualSize);
      } else {
        centerVisual = this.add.text(0, -6, cData.icon || '🎁', {
          fontSize: maxShowCards === 4 ? '38px' : '44px'
        }).setOrigin(0.5);
      }

      // Bottom Main Amount / Name
      const amtTxt = this.add.text(0, 42, cData.amount || '', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: maxShowCards === 4 ? '15.5px' : '18px',
        fontStyle: '900',
        color: `#${cData.borderColor.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 3.0
      }).setOrigin(0.5);

      // Bottom Sublabel
      const subTxt = this.add.text(0, 64, cData.sub || '', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: maxShowCards === 4 ? '12px' : '13px',
        fontStyle: '800',
        color: '#e0e1dd'
      }).setOrigin(0.5);

      cardContainer.add([cBg, tagBg, tagTxt, centerVisual, amtTxt, subTxt]);

      // Interactive hover scale
      cardContainer.setSize(cardItemW, cardItemH).setInteractive({ useHandCursor: true });
      cardContainer.on('pointerover', () => {
        this.tweens.add({ targets: cardContainer, scaleX: 1.04, scaleY: 1.04, duration: 120 });
      });
      cardContainer.on('pointerout', () => {
        this.tweens.add({ targets: cardContainer, scaleX: 1.0, scaleY: 1.0, duration: 120 });
      });

      // Staggered Pop-in animation with taiko & haptic (single run, then stays still)
      cardContainer.setScale(0);
      this.tweens.add({
        targets: cardContainer,
        scale: 1,
        delay: 350 + cIdx * 140,
        duration: 340,
        ease: 'Back.easeOut',
        onStart: () => {
          this.audio.playSelect();
          this.haptic.light();
        }
      });

      modal.add(cardContainer);
    });

    // ==========================================
    // 3.5 COMPANION EXP BAR (Dynamic Progression)
    // ==========================================
    if (questStats?.expResult && questStats?.lootResult) {
      const expR = questStats.expResult;
      const lootR = questStats.lootResult;
      const expBoxY = 188;
      const expBoxW = 740;
      const expBoxH = 36;

      const expContainer = this.add.container(0, expBoxY);
      modal.add(expContainer);

      const expBg = this.add.graphics();
      expBg.fillStyle(0x131122, 0.95);
      expBg.fillRoundedRect(-expBoxW / 2, -expBoxH / 2, expBoxW, expBoxH, 10);
      expBg.lineStyle(1.4, expR.leveledUp ? 0xffd700 : 0x00f5d4, expR.leveledUp ? 1 : 0.7);
      expBg.strokeRoundedRect(-expBoxW / 2, -expBoxH / 2, expBoxW, expBoxH, 10);
      expContainer.add(expBg);

      // Icon & Companion Name
      const compIcon = this.companionConfig.icon || '🦊';
      const compLabel = `${compIcon} ${this.companionConfig.name.toUpperCase()} (CẤP ${expR.newLevel})`;
      const compTxt = this.add.text(-expBoxW / 2 + 18, 0, compLabel, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);
      expContainer.add(compTxt);

      // EXP Bar Graphic
      const barX = 18;
      const barW = 320;
      const barH = 14;
      const barGfx = this.add.graphics();
      barGfx.fillStyle(0x232538, 1);
      barGfx.fillRoundedRect(barX, -barH / 2, barW, barH, 5);
      barGfx.lineStyle(1, 0x495057, 0.8);
      barGfx.strokeRoundedRect(barX, -barH / 2, barW, barH, 5);
      expContainer.add(barGfx);

      const expFrac = Math.min(1, expR.newExp / Math.max(1, expR.requiredExp));
      const fillGfx = this.add.graphics();
      fillGfx.fillStyle(0x00f5d4, 1);
      fillGfx.fillRoundedRect(barX, -barH / 2, barW * expFrac, barH, 5);
      expContainer.add(fillGfx);

      // EXP text info
      const expText = expR.leveledUp
        ? `🌟 LEVEL UP! CẤP ${expR.newLevel} (+${lootR.expEarned} EXP)`
        : `+${lootR.expEarned} EXP • (${expR.newExp}/${expR.requiredExp})`;

      const expTxt = this.add.text(barX + barW + 16, 0, expText, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12.5px',
        fontStyle: '900',
        color: expR.leveledUp ? '#ffd700' : '#ffffff'
      }).setOrigin(0, 0.5);
      expContainer.add(expTxt);

      if (expR.leveledUp) {
        this.tweens.add({
          targets: expTxt,
          scaleX: 1.1,
          scaleY: 1.1,
          yoyo: true,
          repeat: -1,
          duration: 400
        });
      }
    }

    // ==========================================
    // 4. ACTION BUTTONS (Horizontal Bottom Row)
    // ==========================================
    const isFinalLevel = this.levelConfig.levelNumber >= 100;
    const btnY = 244;

    if (isPerfect) {
      // 1. Next Level / Campaign Victory Button
      const nextBtn = this.add.container(-140, btnY);
      const nBg = this.add.graphics();
      nBg.fillStyle(isFinalLevel ? 0xffb703 : 0xe63946, 1);
      nBg.fillRoundedRect(-150, -24, 300, 48, 14);
      nBg.lineStyle(2, 0xffd700, 0.95);
      nBg.strokeRoundedRect(-150, -24, 300, 48, 14);

      const nTxt = this.add.text(0, 0, isFinalLevel ? '🏆 HOÀN THÀNH CHIẾN DỊCH! 👑' : 'TIẾP TỤC HÀNH TRÌNH ➔', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '17px',
        fontStyle: '900',
        color: isFinalLevel ? '#1a1c29' : '#ffffff'
      }).setOrigin(0.5);
      nextBtn.add([nBg, nTxt]);
      nextBtn.setSize(300, 48).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.audio.playSelect();
        if (isFinalLevel) {
          this.scene.start('MainMenuScene');
        } else {
          const nextNum = this.levelConfig.levelNumber + 1;
          const nextId = `level_${String(nextNum).padStart(2, '0')}`;
          this.scene.restart({ levelId: nextId, lives: this.lives, difficulty: this.currentDifficulty });
        }
      });
      modal.add(nextBtn);

      // 2. Menu Button
      const menuBtn = this.add.container(180, btnY);
      const mBg = this.add.graphics();
      mBg.fillStyle(0x232538, 1);
      mBg.fillRoundedRect(-120, -24, 240, 48, 14);
      mBg.lineStyle(1.6, 0x495057, 0.85);
      mBg.strokeRoundedRect(-120, -24, 240, 48, 14);

      const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '16.5px',
        fontStyle: '800',
        color: '#ced4da'
      }).setOrigin(0.5);
      menuBtn.add([mBg, mTxt]);
      menuBtn.setSize(240, 48).setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.scene.start('MainMenuScene');
      });
      modal.add(menuBtn);
    } else {
      // 1. Next Level Button
      const nextBtn = this.add.container(-255, btnY);
      const nBg = this.add.graphics();
      nBg.fillStyle(isFinalLevel ? 0xffb703 : 0xe63946, 1);
      nBg.fillRoundedRect(-125, -24, 250, 48, 14);
      nBg.lineStyle(2, 0xffd700, 0.9);
      nBg.strokeRoundedRect(-125, -24, 250, 48, 14);

      const nTxt = this.add.text(0, 0, isFinalLevel ? '🏆 HOÀN THÀNH!' : 'TIẾP TỤC ➔', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '17px',
        fontStyle: '900',
        color: isFinalLevel ? '#1a1c29' : '#ffffff'
      }).setOrigin(0.5);
      nextBtn.add([nBg, nTxt]);
      nextBtn.setSize(250, 48).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.audio.playSelect();
        if (isFinalLevel) {
          this.scene.start('MainMenuScene');
        } else {
          const nextNum = this.levelConfig.levelNumber + 1;
          const nextId = `level_${String(nextNum).padStart(2, '0')}`;
          this.scene.restart({ levelId: nextId, lives: this.lives, difficulty: this.currentDifficulty });
        }
      });
      modal.add(nextBtn);

      // 2. Replay Button
      const replayBtn = this.add.container(25, btnY);
      const rBg = this.add.graphics();
      rBg.fillStyle(0x382c16, 1);
      rBg.fillRoundedRect(-130, -24, 260, 48, 14);
      rBg.lineStyle(2, 0xffb703, 0.95);
      rBg.strokeRoundedRect(-130, -24, 260, 48, 14);

      const rTxt = this.add.text(0, 0, '🔄 CHƠI LẠI (SĂN 3⭐)', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '16.5px',
        fontStyle: '900',
        color: '#ffd166'
      }).setOrigin(0.5);
      replayBtn.add([rBg, rTxt]);
      replayBtn.setSize(260, 48).setInteractive({ useHandCursor: true });
      replayBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.scene.restart({ levelId: this.levelConfig.id, lives: this.lives, difficulty: this.currentDifficulty });
      });
      modal.add(replayBtn);

      // 3. Menu Button
      const menuBtn = this.add.container(285, btnY);
      const mBg = this.add.graphics();
      mBg.fillStyle(0x232538, 1);
      mBg.fillRoundedRect(-95, -24, 190, 48, 14);
      mBg.lineStyle(1.6, 0x495057, 0.85);
      mBg.strokeRoundedRect(-95, -24, 190, 48, 14);

      const mTxt = this.add.text(0, 0, 'VỀ MENU 🏠', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '16px',
        fontStyle: '800',
        color: '#ced4da'
      }).setOrigin(0.5);
      menuBtn.add([mBg, mTxt]);
      menuBtn.setSize(190, 48).setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.scene.start('MainMenuScene');
      });
      modal.add(menuBtn);
    }
  }

  private handleGameOver(reason: string = '⏱️ Hết thời gian thử thách!'): void {
    if (this.isNightParadeActive) {
      this.endNightParadeRush();
    }
    if (this.isZenMode) return;
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.gameOverReason = reason;

    this.audio.playError();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    if (this.isSurvivalMode) {
      this.showSurvivalGameOverModal(width, height);
      return;
    }

    const { width: screenW } = getScreenDimensions();
    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const cardW = 440;
    const cardH = 310;
    const card = this.add.graphics();
    card.fillStyle(0x1a1528, 1);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2.5, 0xe63946, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    modal.add(card);

    const title = this.add.text(0, -100, 'GAME OVER!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '28px',
      fontStyle: '900',
      color: '#e63946'
    }).setOrigin(0.5);

    const reasonText = this.add.text(0, -60, this.gameOverReason, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16.5px',
      fontStyle: 'bold',
      color: '#ffd166',
      wordWrap: { width: 380 },
      align: 'center'
    }).setOrigin(0.5);

    modal.add([title, reasonText]);

    const retryBtn = this.add.container(0, 8);
    const rBg = this.add.graphics();
    rBg.fillStyle(0xe63946, 1);
    rBg.fillRoundedRect(-140, -24, 280, 48, 14);
    rBg.lineStyle(1.8, 0xff758f, 0.9);
    rBg.strokeRoundedRect(-140, -24, 280, 48, 14);

    const rTxt = this.add.text(0, 0, 'THỬ LẠI MÀN NÀY 🔄', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    retryBtn.add([rBg, rTxt]);
    retryBtn.setSize(280, 48);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.restart({ levelId: this.levelConfig.id, lives: 10, difficulty: this.currentDifficulty });
    });
    modal.add(retryBtn);

    const menuBtn = this.add.container(0, 72);
    const mBg = this.add.graphics();
    mBg.fillStyle(0x2b2d42, 1);
    mBg.fillRoundedRect(-140, -24, 280, 48, 14);
    mBg.lineStyle(1.5, 0x495057, 0.85);
    mBg.strokeRoundedRect(-140, -24, 280, 48, 14);

    const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16.5px',
      fontStyle: '800',
      color: '#adb5bd'
    }).setOrigin(0.5);
    menuBtn.add([mBg, mTxt]);
    menuBtn.setSize(280, 48);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.start('MainMenuScene');
    });
    modal.add(menuBtn);
  }

  private showSurvivalGameOverModal(width: number, height: number): void {
    const earnedCoins = Math.max(10, this.survivalWave * 25);
    this.save.addCoins(earnedCoins);
    const isNewRecord = this.save.saveSurvivalRecord(this.score, this.survivalWave);
    const record = this.save.getSurvivalRecord();

    const { width: screenW } = getScreenDimensions();
    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const cardW = 360;
    const cardH = 360;
    const card = this.add.graphics();
    card.fillStyle(0x0c192c, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2.5, 0x00f5d4, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    modal.add(card);

    const title = this.add.text(0, -138, '❄️ BÃO TUYẾT DÂNG TRÀO!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);

    const reasonText = this.add.text(0, -110, this.gameOverReason, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#ffd166',
      wordWrap: { width: 320 },
      align: 'center'
    }).setOrigin(0.5);

    modal.add([title, reasonText]);

    // Stats Box
    const statBox = this.add.graphics();
    statBox.fillStyle(0x162a45, 0.9);
    statBox.fillRoundedRect(-150, -85, 300, 118, 14);
    statBox.lineStyle(1.5, 0x1f4068, 0.8);
    statBox.strokeRoundedRect(-150, -85, 300, 118, 14);
    modal.add(statBox);

    const waveText = this.add.text(0, -62, `SỐNG SÓT: ĐỢT ${this.survivalWave}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);

    const scoreText = this.add.text(0, -38, `Điểm số: ${formatCurrency(this.score)} PTS`, {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const recordText = this.add.text(0, -15, `Kỷ lục: ${record.maxWaves} Đợt • ${formatCurrency(record.highScore)} PTS${isNewRecord ? ' 🔥 MỚI!' : ''}`, {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: isNewRecord ? '#ffb703' : '#ced4da'
    }).setOrigin(0.5);

    const coinsText = this.add.text(0, 10, `+${formatCurrency(earnedCoins)} 💰 Ngân lượng nhận được`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    modal.add([waveText, scoreText, recordText, coinsText]);

    // Retry Survival Button
    const retryBtn = this.add.container(0, 72);
    const rBg = this.add.graphics();
    rBg.fillStyle(0x0077b6, 1);
    rBg.fillRoundedRect(-120, -21, 240, 42, 14);
    rBg.lineStyle(1.5, 0x00f5d4, 1);
    rBg.strokeRoundedRect(-120, -21, 240, 42, 14);
    const rTxt = this.add.text(0, 0, 'THỬ LẠI SINH TỒN ❄️🔄', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    retryBtn.add([rBg, rTxt]);
    retryBtn.setSize(240, 42);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.restart({ isSurvivalMode: true, lives: 5 });
    });
    modal.add(retryBtn);

    // Menu Button
    const menuBtn = this.add.container(0, 126);
    const mBg = this.add.graphics();
    mBg.fillStyle(0x232538, 1);
    mBg.fillRoundedRect(-120, -19, 240, 38, 12);
    const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: '800',
      color: '#adb5bd'
    }).setOrigin(0.5);
    menuBtn.add([mBg, mTxt]);
    menuBtn.setSize(240, 38);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.start('MainMenuScene');
    });
    modal.add(menuBtn);
  }
}
