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
import { BossConfig, CompanionConfig, GridPoint, LevelConfig, TileState } from '../types';
import { TextureGenerator } from '../game/TextureGenerator';

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig;
  private boardManager!: BoardManager;
  private comboSystem!: ComboSystem;
  private bossManager: BossManager | null = null;
  private audio!: AudioSystem;
  private haptic!: HapticSystem;
  private save!: SaveSystem;

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
  private companionPulseTween: Phaser.Tweens.Tween | null = null;
  private isTimeFrozen: boolean = false;
  private freezeTimeRemaining: number = 0;
  private frostOverlayGraphics!: Phaser.GameObjects.Graphics;

  // 🌙 Giờ Bách Quỷ Dạ Hành (Night Parade Rush)
  private isNightParadeActive: boolean = false;
  private nightParadeTimeRemaining: number = 0;
  private hasTriggeredLowTimeRush: boolean = false;
  private nightParadeOverlay: Phaser.GameObjects.Container | null = null;
  private nightParadeTimerPill: Phaser.GameObjects.Container | null = null;
  private nightParadeTimerText: Phaser.GameObjects.Text | null = null;
  private nightParadeTimerBarGfx: Phaser.GameObjects.Graphics | null = null;

  // Game metrics
  private score: number = 0;
  private timeRemaining: number = 180;
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

  // Booster UI Texts
  private hintCountText!: Phaser.GameObjects.Text;
  private shuffleCountText!: Phaser.GameObjects.Text;
  private bombCountText!: Phaser.GameObjects.Text;

  // 4. ⭐ Hệ Thống Nhiệm Vụ 3 Sao Mỗi Màn (Star Quests)
  private maxComboAchieved: number = 0;
  private playerUsedBoosterCount: number = 0;
  private hasNotifiedComboQuest: boolean = false;
  private questTrackerStarsText: Phaser.GameObjects.Text | null = null;

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

  public init(data: { levelId?: string; lives?: number; isZenMode?: boolean; isSurvivalMode?: boolean; bossId?: string }): void {
    this.isZenMode = !!data.isZenMode;
    this.isSurvivalMode = !!data.isSurvivalMode;
    this.isBossDefeatedSequence = false;
    const levelId = data.levelId || 'level_01';
    const allLevels = levelsData as LevelConfig[];
    const found = allLevels.find(l => l.id === levelId) || allLevels[0];

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
      if (found.boss) {
        if (!found.boss.id.startsWith('boss_')) {
          found.boss.id = 'boss_orochi';
          found.boss.symbol = '🐉';
          found.boss.element = 'water';
          found.boss.native_name = '八岐大蛇';
          found.boss.title = 'Bát Kỳ Thần Xà Cổ Đại';
        }
        this.levelConfig = found;
      } else if (currentTheme !== 'yokai') {
        // Player picked a non-Yokai theme in main menu (e.g. Egypt, Greece)
        const nonBossThemeChars = CharacterRegistry.getNonBossByCollection(currentTheme);
        const poolSize = found.characterPool?.length || 15;
        this.levelConfig = {
          ...found,
          characterPool: (nonBossThemeChars.length >= 8 ? nonBossThemeChars : themeChars)
            .filter(c => !CharacterRegistry.isBoss(c))
            .map(c => c.id)
            .slice(0, poolSize)
        };
      } else {
        // Yokai default theme: ALWAYS preserve the handcrafted level characterPool!
        // Strictly filter out any boss characters so normal levels are pure puzzle animals!
        this.levelConfig = {
          ...found,
          characterPool: found.characterPool.filter(id => !CharacterRegistry.isBoss(id))
        };
      }

      this.lives = data.lives !== undefined ? data.lives : 5;
      this.timeRemaining = this.levelConfig.timeLimit;
    }

    this.score = 0;
    this.lastTickSecond = -1;
    this.isGameOver = false;
    this.isVictory = false;
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
    this.isTimeFrozen = false;
    this.freezeTimeRemaining = 0;
    this.isNightParadeActive = false;
    this.nightParadeTimeRemaining = 0;
    this.hasTriggeredLowTimeRush = false;

    // Reset Star Quests tracking
    this.maxComboAchieved = 0;
    this.playerUsedBoosterCount = 0;
    this.hasNotifiedComboQuest = false;

    // Clean up timers on scene shutdown
    this.events.once('shutdown', () => {
      this.endNightParadeRush();
      try {
        this.boardManager?.destroy();
      } catch {}
    });

    // 1. Crystal-clear HD Gameplay Shrine Night Background (100% sharp, edge-to-edge)
    const { width: screenW, offsetX } = getScreenDimensions();
    if (this.textures.exists('bg_gameplay_shrine')) {
      this.add.image(GAME_WIDTH / 2, height / 2, 'bg_gameplay_shrine')
        .setDisplaySize(screenW, height)
        .setDepth(0);
    } else if (this.textures.exists('bg_main_torii')) {
      this.add.image(GAME_WIDTH / 2, height / 2, 'bg_main_torii')
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
        onBossSkillTriggered: (skillName, desc, skillType) => {
          this.triggerBossSkillCastVisual();
          if (skillType === 'time_drain') {
            this.timeRemaining = Math.max(1, this.timeRemaining - 5);
            this.showNotice(`⏳ ${skillName}: BỊ HÚT MẤT 5 GIÂY!`, 0xff3366);
            this.showBonusTimePopup(-5);
          } else {
            this.showNotice(`⚠️ BOSS: ${skillName}!`, 0xff99c8);
          }
          this.audio.playError();
          this.haptic.error();
          if (this.boardManager) {
            this.boardManager.syncViewsAfterMovement();
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
      onTileSelected: () => {
        this.audio.playSelect();
        this.haptic.light();
      },
      onMatchSuccess: (t1, t2) => {
        this.handleMatchSuccess(t1, t2);
      },
      onMatchFailed: (t1, t2, reason) => {
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
          const name1 = char1 ? `${char1.name}` : 'Linh thú';
          const name2 = char2 ? `${char2.name}` : 'Linh thú';
          this.showNotice(`❌ Khác linh thú (-2s): ${name1} ≠ ${name2}`, 0xff758f);
        } else if (reason === 'blocked_path') {
          this.showNotice('🚧 Bị cản đường nối! (Tối đa 2 khúc gấp không bị che)', 0xffd166);
        }
      },
      onBoardCleared: () => {
        if (this.isSurvivalMode) {
          this.score += 1000;
          this.scoreText.setText(`${this.score} PTS`);
          this.save.saveSurvivalRecord(this.score, this.survivalWave);
          this.audio.playVictory();
          this.haptic.combo();
          this.showNotice('🌸 QUÉT SẠCH TOÀN BÀN! THƯỞNG +1,000 PTS! ❄️', 0xffd700);
          this.feverParticles.explode(30, GAME_WIDTH / 2, GAME_HEIGHT / 2);
          this.time.delayedCall(1000, () => {
            if (!this.isGameOver) {
              this.triggerBlizzardPush();
            }
          });
        } else if (this.isZenMode) {
          this.score += 500;
          this.scoreText.setText(`${this.score} PTS`);
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
      }
    });

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

    // 10. Frost Overlay for Time Freeze
    this.frostOverlayGraphics = this.add.graphics().setDepth(120);
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
      fontSize: '13.5px',
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
      fontSize: '16px',
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
      fontFamily: 'Zen Maru Gothic, Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: this.isSurvivalMode ? '#90e0ef' : '#ffd700',
      stroke: '#0e0b17',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.levelTitleText = titleText;

    const plaqueW = Math.max(280, Math.min(400, titleText.width + 60));
    const plaqueH = 26;
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
    this.timeText = this.add.text(timerBarX + timerBarW + 14, capY, this.isZenMode ? '∞' : `⏳ ${Math.ceil(this.timeRemaining)}s`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '15px',
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

    // Score capsule (top right) matching mockup [ 💮 0 PTS ]
    const scoreCapW = 108;
    const scoreCapH = 30;
    const scoreCapX = width - 64;
    const scoreCapY = 25;

    const scoreCapBg = this.add.graphics();
    scoreCapBg.fillStyle(0x131728, 0.92);
    scoreCapBg.fillRoundedRect(scoreCapX - scoreCapW / 2, scoreCapY - scoreCapH / 2, scoreCapW, scoreCapH, 15);
    scoreCapBg.lineStyle(1.2, 0x4a4768, 0.85);
    scoreCapBg.strokeRoundedRect(scoreCapX - scoreCapW / 2, scoreCapY - scoreCapH / 2, scoreCapW, scoreCapH, 15);

    const scoreEmblem = this.add.text(scoreCapX - scoreCapW / 2 + 16, scoreCapY, '💮', {
      fontSize: '15px'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(scoreCapX + 10, scoreCapY, `${this.score} PTS`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Floating Combo popup text
    this.comboText = this.add.text(width / 2, 58, '', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
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
      fontSize: '14.5px',
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
      fontSize: '12.5px',
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
      fontSize: '12.5px',
      fontStyle: '800',
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
    const tooltip = this.add.container(236, 120).setDepth(180);

    const bg = this.add.graphics();
    bg.fillStyle(0x19142b, 0.98);
    bg.fillRoundedRect(-155, -72, 310, 144, 14);
    bg.lineStyle(1.5, 0xffd700, 0.85);
    bg.strokeRoundedRect(-155, -72, 310, 144, 14);

    const title = this.add.text(0, -52, '⭐ THỬ THÁCH 3 SAO', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const q1 = this.add.text(-138, -30, '⭐ 1. Dọn sạch trước khi hết giờ (Đang chơi)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      color: '#00f5d4'
    });

    const isComboDone = this.maxComboAchieved >= 5;
    const q2 = this.add.text(-138, -10, `⭐ 2. Combo x5 (Đạt: x${this.maxComboAchieved}/5) ${isComboDone ? '✓' : ''}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      color: isComboDone ? '#00f5d4' : '#ffd166'
    });

    const isBoosterOk = this.playerUsedBoosterCount === 0 || this.timeRemaining > 40;
    const q3 = this.add.text(-138, 10, `⭐ 3. Không trợ giúp (Dùng: ${this.playerUsedBoosterCount}) / >40s`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      color: isBoosterOk ? '#00f5d4' : '#ff758f'
    });

    const closeTxt = this.add.text(0, 42, '(Chạm để đóng)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#adb5bd'
    }).setOrigin(0.5);

    tooltip.add([bg, title, q1, q2, q3, closeTxt]);

    const hit = this.add.zone(0, 0, 280, 130).setInteractive({ useHandCursor: true });
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
      fontSize: '15px',
      fontStyle: '800',
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

    this.bossHpText = this.add.text(contentX, 2, `${this.bossManager!.getHp()} / ${this.bossManager!.getMaxHp()} HP`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Parts / Heads display icons
    this.bossHeadsContainer = this.add.container(contentX, 22);
    this.updateBossHeadsVisual(this.bossManager!.getHeadsRemaining(), this.bossManager!.getTotalHeads());

    this.bossWarningText = this.add.text(contentX, 39, '', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'bold',
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
      this.bossHpText.setText(`${Math.max(0, Math.ceil(currentHp))} / ${maxHp} HP`);
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

  private buildBoosterTray(width: number, height: number): void {
    const saveData = this.save.getData();
    const tray = this.add.container(width / 2 + 55, height - 40).setDepth(20);

    const btnWidth = 146;
    const spacing = 154;

    // 1. Hint Button (Amber glowing - matching Image 2)
    const hintBtn = this.createBoosterButton(-spacing, 0, btnWidth, '💡', 'Gợi Ý', `x${saveData.boosters.hint}`, 0xffa200, () => {
      if (this.isGameOver || this.isVictory) return;
      if (this.save.useBooster('hint')) {
        this.playerUsedBoosterCount++;
        this.boardManager.showHint();
        this.audio.playSelect();
        this.updateBoosterCounts();
      } else {
        this.showNotice('Hết Gợi Ý! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
      }
    }, 'btn_booster_hint');
    this.hintCountText = hintBtn.countText;

    // 2. Shuffle Button (Cyan glowing - matching Image 2)
    const shuffleBtn = this.createBoosterButton(0, 0, btnWidth, '🔄', 'Đổi Vị Trí', `x${saveData.boosters.shuffle}`, 0x00b4d8, () => {
      if (this.isGameOver || this.isVictory) return;
      if (this.save.useBooster('shuffle')) {
        this.playerUsedBoosterCount++;
        this.boardManager.performShuffle();
        this.audio.playShuffle();
        this.updateBoosterCounts();
      } else {
        this.showNotice('Hết Lượt Đảo! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
      }
    }, 'btn_booster_shuffle');
    this.shuffleCountText = shuffleBtn.countText;

    // 3. Bomb Button (Purple glowing - matching Image 2)
    const bombBtn = this.createBoosterButton(spacing, 0, btnWidth, '💣', 'Phá Cặp', `x${saveData.boosters.bomb}`, 0x9d4edd, () => {
      if (this.isGameOver || this.isVictory) return;
      if (this.save.useBooster('bomb')) {
        this.playerUsedBoosterCount++;
        this.boardManager.triggerBomb();
        this.audio.playBossHit();
        this.updateBoosterCounts();
      } else {
        this.showNotice('Hết Bom! (Kiếm thêm trong màn sau)', 0xff99c8);
        this.audio.playError();
      }
    }, 'btn_booster_bomb');
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
      fontSize: '13.5px',
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
      fontSize: '11.5px',
      fontStyle: '900',
      color: '#ced4da'
    }).setOrigin(0.5);

    // Ready Badge Text (hidden by default)
    this.companionReadyBadge = this.add.text(29, 9, '⚡ BẤM DÙNG!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
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
      if (this.isGameOver || this.isVictory) return;
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

    this.companionEnergy = Math.min(100, this.companionEnergy + amount);
    this.updateCompanionEnergyUI();

    if (this.companionEnergy >= 100 && !this.isCompanionSkillReady) {
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

    const fillW = Math.max(0, (this.companionEnergy / 100) * barW);

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
      this.companionEnergyText.setText(`${Math.floor(this.companionEnergy)}% NỘ`);
      this.companionEnergyText.setVisible(true);
      this.companionReadyBadge.setVisible(false);
    }
  }

  private activateCompanionSkill(): void {
    if (!this.isCompanionSkillReady) return;
    this.isCompanionSkillReady = false;
    this.companionEnergy = 0;
    this.updateCompanionEnergyUI();

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
    if (comp.id === 'inari_kitsune') {
      // 🦊 Cáo Inari: Tự động tìm & giải cứu ngay 2 cặp ô trên bàn cờ
      this.showSkillBanner('🦊 CÁO INARI: LINH HỒ XUẤT KÍCH!', 'Linh Hồ giáng trần giải cứu ngay 2 cặp ô trên bàn cờ!', comp.themeColor);
      this.audio.playVictory();

      // Pair 1
      const match1 = BoardGenerator.findFirstAvailableMatch(
        this.boardManager.getGrid(),
        this.boardManager.getRows(),
        this.boardManager.getCols(),
        this.boardManager.getPortals()
      );

      if (match1) {
        this.audio.playLaserZap();
        this.score += 200;
        this.scoreText.setText(`${this.score} PTS`);
        this.boardManager.triggerPairClear(match1.p1, match1.p2);
        const wPos1 = this.boardManager.gridToWorld(match1.p1.r, match1.p1.c);
        this.feverParticles.explode(16, wPos1.x, wPos1.y);
      }

      // Pair 2 (delay 360ms)
      this.time.delayedCall(360, () => {
        if (this.isVictory || this.isGameOver) return;
        const match2 = BoardGenerator.findFirstAvailableMatch(
          this.boardManager.getGrid(),
          this.boardManager.getRows(),
          this.boardManager.getCols(),
          this.boardManager.getPortals()
        );
        if (match2) {
          this.audio.playLaserZap();
          this.score += 200;
          this.scoreText.setText(`${this.score} PTS`);
          this.boardManager.triggerPairClear(match2.p1, match2.p2);
          const wPos2 = this.boardManager.gridToWorld(match2.p1.r, match2.p1.c);
          this.feverParticles.explode(16, wPos2.x, wPos2.y);
          this.showNotice('🦊 Linh Hồ đã hoàn thành giải cứu 2 cặp ô! +400 PTS! ✨', 0xff758f);
        }
      });
    } else if (comp.id === 'ryujin_pearl') {
      // 🐉 Thần Rồng Ryujin: Đóng băng đồng hồ đếm ngược trong 8 giây
      this.showSkillBanner('🐉 RỒNG RYUJIN: NGƯNG ĐỌNG THỜI GIAN!', 'Bảo ngọc Long Vương đóng băng đồng hồ trong 8 giây!', comp.themeColor);
      this.audio.playVictory();
      this.isTimeFrozen = true;
      this.freezeTimeRemaining = 8.0;

      // Draw glacial frosted border on screen edges
      if (this.frostOverlayGraphics) {
        const { width: screenW, offsetX } = getScreenDimensions();
        this.frostOverlayGraphics.clear();
        this.frostOverlayGraphics.lineStyle(3, 0x00f5d4, 0.75);
        this.frostOverlayGraphics.strokeRect(-offsetX + 6, 6, screenW - 12, GAME_HEIGHT - 12);
      }

      if (this.isZenMode) {
        this.score += 500;
        this.scoreText.setText(`${this.score} PTS`);
        this.showNotice('🐉 Long Vương gia hộ Zen: Thưởng ngay +500 PTS! ❄️', 0x00f5d4);
      }
    } else if (comp.id === 'hi_no_tori') {
      // 🔥 Phượng Hoàng Hi-no-tori: Quét một luồng lửa dọn sạch toàn bộ chướng ngại vật
      this.showSkillBanner('🔥 PHƯỢNG HOÀNG: HỎA NGỤC THIÊU CHƯỚNG!', 'Ngọn lửa bất tử thiêu rụi toàn bộ Băng, Đá và Khóa!', comp.themeColor);
      this.playPhoenixFlameSweep(() => {
        const cleared = this.boardManager.clearAllObstacles();
        this.audio.playBossHit();
        if (cleared > 0) {
          const bonusPts = cleared * 150;
          this.score += bonusPts;
          this.scoreText.setText(`${this.score} PTS`);
          this.showNotice(`🔥 Phượng Hoàng thiêu rụi ${cleared} chướng ngại vật! +${bonusPts} PTS!`, 0xff595e);
        } else {
          this.score += 300;
          this.scoreText.setText(`${this.score} PTS`);
          this.showNotice('🔥 Hỏa Điểu thanh tẩy toàn bàn cờ! Thưởng +300 PTS!', 0xffd166);
        }
      });
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

  private createBoosterButton(
    x: number,
    y: number,
    btnWidth: number,
    icon: string,
    label: string,
    countStr: string,
    color: number,
    onClick: () => void,
    spriteKey?: string
  ): { container: Phaser.GameObjects.Container; countText: Phaser.GameObjects.Text } {
    const container = this.add.container(x, y);
    const btnHeight = Math.round(btnWidth * (132 / 290)); // ~66px

    if (spriteKey && this.textures.exists(spriteKey)) {
      const btnSprite = this.add.image(0, 0, spriteKey);
      btnSprite.setDisplaySize(btnWidth, btnHeight);

      // Precisely aligned with the golden circular badge on the artwork
      const badgeXNorm = spriteKey === 'btn_booster_hint' ? 0.386 : 0.404;
      const badgeX = Math.round(btnWidth * badgeXNorm);
      const badgeY = Math.round(-btnHeight * 0.265);

      const count = this.add.text(badgeX, badgeY, countStr, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13.5px',
        fontStyle: '900',
        color: '#ffd700',
        stroke: '#0d0d14',
        strokeThickness: 2
      }).setOrigin(0.5);

      container.add([btnSprite, count]);
      container.setSize(btnWidth, btnHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 140,
          ease: 'Back.easeOut'
        });
      });

      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 140,
          ease: 'Sine.easeOut'
        });
      });

      container.on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scaleX: 0.93,
          scaleY: 0.93,
          duration: 80,
          yoyo: true,
          onComplete: onClick
        });
      });

      return { container, countText: count };
    }

    // Fallback procedural capsule
    // 1. Soft glowing outer aura
    const glow = this.add.graphics();
    glow.fillStyle(color, 0.2);
    glow.fillRoundedRect(-btnWidth / 2 - 3, -btnHeight / 2 - 3, btnWidth + 6, btnHeight + 6, 16);

    // 2. Dark glass capsule background
    const bg = this.add.graphics();
    bg.fillStyle(0x131224, 0.96);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 14);

    // 3. Vibrant neon border
    bg.lineStyle(2, color, 0.95);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 14);

    // 4. Icon & Label
    const iconTxt = this.add.text(-btnWidth / 2 + 22, 0, icon, {
      fontSize: '20px'
    }).setOrigin(0.5);

    const txt = this.add.text(8, 0, label, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#f8f9fa'
    }).setOrigin(0.5);

    // 5. Circular gold badge at top-right corner
    const badgeX = btnWidth / 2 - 4;
    const badgeY = -btnHeight / 2 + 4;

    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xffd700, 1);
    badgeBg.fillCircle(badgeX, badgeY, 13);
    badgeBg.lineStyle(1.5, 0x111111, 0.9);
    badgeBg.strokeCircle(badgeX, badgeY, 13);

    const count = this.add.text(badgeX, badgeY, countStr, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#111111'
    }).setOrigin(0.5);

    container.add([glow, bg, iconTxt, txt, badgeBg, count]);
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 140,
        ease: 'Back.easeOut'
      });
      glow.alpha = 1.4;
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 140,
        ease: 'Sine.easeOut'
      });
      glow.alpha = 1.0;
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.93,
        scaleY: 0.93,
        duration: 80,
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
      this.showNotice(`🌙 KÉO DÀI DẠ HÀNH THÊM 6S! (${reasonTitle})`, 0xc77dff);
      return;
    }

    this.isNightParadeActive = true;
    this.nightParadeTimeRemaining = 10.0;
    this.boardManager.setPiercingLaser(true);
    this.audio.startNightParadeMusic();
    this.haptic.heavy();

    // 1. Create Mystical Violet Atmosphere Overlay
    const { width: screenW, offsetX } = getScreenDimensions();
    const overlay = this.add.container(0, 0).setDepth(15);
    const bgGfx = this.add.graphics();
    // Soft violet atmospheric tint across board
    bgGfx.fillStyle(0x240046, 0.42);
    bgGfx.fillRect(-offsetX, 0, screenW, GAME_HEIGHT);

    // Glowing mystical purple border vignette
    bgGfx.lineStyle(6, 0x9d4edd, 0.85);
    bgGfx.strokeRect(-offsetX + 3, 3, screenW - 6, GAME_HEIGHT - 6);
    bgGfx.lineStyle(2, 0xe0aaff, 0.6);
    bgGfx.strokeRect(-offsetX + 7, 7, screenW - 14, GAME_HEIGHT - 14);

    overlay.add(bgGfx);
    this.nightParadeOverlay = overlay;

    // Subtle breathing pulse on the mystical purple aura
    this.tweens.add({
      targets: bgGfx,
      alpha: { from: 0.7, to: 1.0 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. Build Floating Night Parade Timer Pill (HUD)
    const pillW = 320;
    const pillH = 24;
    const pillX = GAME_WIDTH / 2;
    const pillY = 56;

    const timerPill = this.add.container(pillX, pillY).setDepth(30);

    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x10002b, 0.95);
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);
    pillBg.lineStyle(1.8, 0xc77dff, 0.9);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);

    this.nightParadeTimerBarGfx = this.add.graphics();

    this.nightParadeTimerText = this.add.text(0, 0, '🌙 DẠ HÀNH: 10s • x3 PTS • XUYÊN THẤU', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    timerPill.add([pillBg, this.nightParadeTimerBarGfx, this.nightParadeTimerText]);
    this.nightParadeTimerPill = timerPill;

    this.updateNightParadeTimerUI();

    // 3. Show Grand Cinematic Announcement Banner
    this.showNightParadeBanner(reasonTitle);
  }

  private updateNightParadeTimerUI(): void {
    if (!this.nightParadeTimerBarGfx || !this.nightParadeTimerText) return;

    const pillW = 320;
    const pillH = 24;
    const progress = Math.max(0, this.nightParadeTimeRemaining / 10.0);
    const barW = Math.max(0, (pillW - 8) * Math.min(1, progress));

    this.nightParadeTimerBarGfx.clear();
    this.nightParadeTimerBarGfx.fillStyle(0x7b2cbf, 0.75);
    this.nightParadeTimerBarGfx.fillRoundedRect(-(pillW - 8) / 2, -pillH / 2 + 3, barW, pillH - 6, 9);

    const sec = Math.max(0, Math.ceil(this.nightParadeTimeRemaining));
    this.nightParadeTimerText.setText(`🌙 DẠ HÀNH: ${sec}s • x3 PTS • XUYÊN THẤU ⚡`);
  }

  private showNightParadeBanner(reason: string): void {
    const banner = this.add.container(GAME_WIDTH / 2, 125).setDepth(200);
    const bW = 680;
    const bH = 68;

    const bg = this.add.graphics();
    bg.fillStyle(0x190028, 0.98);
    bg.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 18);
    bg.lineStyle(2.5, 0xc77dff, 1);
    bg.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 18);

    const title = this.add.text(0, -13, '🌙 BÁCH QUỶ DẠ HÀNH (NIGHT PARADE RUSH)!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#e0aaff',
      stroke: '#3c096c',
      strokeThickness: 3
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 14, `${reason} • x3 ĐIỂM THƯỞNG • LASER XUYÊN THẤU VẬT CẢN (10S)!`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffd700'
    }).setOrigin(0.5);

    banner.add([bg, title, subtitle]);
    banner.setScale(0.8);
    banner.setAlpha(0);

    this.tweens.add({
      targets: banner,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: 105,
            duration: 250,
            onComplete: () => banner.destroy()
          });
        });
      }
    });
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
    this.boardManager.setPiercingLaser(false);
    this.audio.stopNightParadeMusic();

    if (this.nightParadeOverlay) {
      this.tweens.add({
        targets: this.nightParadeOverlay,
        alpha: 0,
        duration: 350,
        onComplete: () => {
          this.nightParadeOverlay?.destroy();
          this.nightParadeOverlay = null;
        }
      });
    }

    if (this.nightParadeTimerPill) {
      this.tweens.add({
        targets: this.nightParadeTimerPill,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          this.nightParadeTimerPill?.destroy();
          this.nightParadeTimerPill = null;
        }
      });
    }

    this.showNotice('🌙 Kết thúc Giờ Bách Quỷ Dạ Hành!', 0x9d4edd);
  }


  private updateBoosterCounts(): void {
    const b = this.save.getData().boosters;
    this.hintCountText.setText(`x${b.hint}`);
    this.shuffleCountText.setText(`x${b.shuffle}`);
    this.bombCountText.setText(`x${b.bomb}`);
  }

  private handleMatchSuccess(t1: TileState, t2: TileState): void {
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
    this.scoreText.setText(`${this.score} PTS`);

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

    // Record discovered character
    if (t1.characterId) {
      this.save.discoverCharacter(t1.characterId);
    }

    // ⚡ Special: Ô Sét Lan (Lightning Duo) - Tự động giật nổ 1 cặp ô khác
    if (t1.isLightning || t2.isLightning || t1.modifier === 'lightning' || t2.modifier === 'lightning') {
      this.showNotice('⚡ SÉT LAN! TỰ ĐỘNG PHÁ THÊM 1 CẶP Ô! ⚡', 0x00f5d4);
      this.haptic.combo();

      this.time.delayedCall(240, () => {
        const nextMatch = BoardGenerator.findFirstAvailableMatch(
          this.boardManager.getGrid(),
          this.boardManager.getRows(),
          this.boardManager.getCols(),
          this.boardManager.getPortals()
        );
        if (nextMatch) {
          const targetP1 = this.boardManager.gridToWorld(nextMatch.p1.r, nextMatch.p1.c);
          const targetP2 = this.boardManager.gridToWorld(nextMatch.p2.r, nextMatch.p2.c);
          const targetMidX = (targetP1.x + targetP2.x) / 2;
          const targetMidY = (targetP1.y + targetP2.y) / 2;

          this.drawChainLightningBolt(midX, midY, targetMidX, targetMidY);
          this.audio.playLaserZap();
          this.score += 200;
          this.scoreText.setText(`${this.score} PTS`);
          this.boardManager.triggerPairClear(nextMatch.p1, nextMatch.p2);
        }
      });
    }

    // 🏺 Special: Hũ Vàng May Mắn (Lucky Coin Pot) - Cơn mưa tiền vàng
    if (t1.isLuckyPot || t2.isLuckyPot || t1.modifier === 'lucky_pot' || t2.modifier === 'lucky_pot') {
      this.score += 300;
      this.scoreText.setText(`${this.score} PTS`);
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

    // 🦊 Pet Companion: Charge Energy Bar (Thanh Nộ)
    let energyGain = 16;
    if (comboData.combo >= 2) energyGain = 26;
    if (comboData.isFever) energyGain = 36;
    this.addCompanionEnergy(energyGain);

    // 🌙 Giờ Bách Quỷ Dạ Hành: Trigger khi đạt Combo x4, x8, x12...!
    if (comboData.combo >= 4 && comboData.combo % 4 === 0) {
      this.triggerNightParadeRush(`⚡ COMBO x${comboData.combo} ĐẠT ĐỈNH!`);
    }
  }

  private showBonusTimePopup(seconds: number = 1): void {
    const isPositive = seconds > 0;
    const text = isPositive ? `+${seconds}s` : `${seconds}s`;
    const color = isPositive ? '#00f5d4' : '#ff3366';
    const popup = this.add.text(GAME_WIDTH / 2 + 250, 18, text, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color,
      stroke: '#000000',
      strokeThickness: 3
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
      fontSize: '14.5px',
      fontStyle: '800',
      color: `#${color.toString(16).padStart(6, '0')}`,
      backgroundColor: 'rgba(15, 17, 26, 0.94)',
      padding: { left: 20, right: 20, top: 8, bottom: 8 }
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

  public update(time: number, delta: number): void {
    if (this.isGameOver || this.isVictory || this.isPaused) return;

    const deltaSec = delta / 1000;

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
          this.tweens.add({
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
        this.handleGameOver('⏱️ Hết thời gian thử thách!');
        return;
      }
    }

    // Update Lucky Pot countdown timers
    this.boardManager.updateLuckyPots(deltaSec);

    // Combo system update
    this.comboSystem.update(deltaSec);

    // 🌙 Update Night Parade countdown timer
    if (this.isNightParadeActive) {
      this.nightParadeTimeRemaining -= deltaSec;
      this.updateNightParadeTimerUI();
      if (this.nightParadeTimeRemaining <= 0) {
        this.endNightParadeRush();
      }
    }

    // Boss timer update (freezes when Ryujin Time Freeze or Defeat sequence is active)
    if (this.bossManager && !this.isTimeFrozen && !this.isBossDefeatedSequence) {
      this.bossManager.update(
        deltaSec,
        this.boardManager.getGrid(),
        this.boardManager.getRows(),
        this.boardManager.getCols()
      );
    }
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
      this.scoreText.setText(`${this.score} PTS`);

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

    const bossCfg = this.bossManager?.getBossConfig();
    const bossName = bossCfg?.name || 'ĐẠI TRÙM';
    this.showNotice(`👑 CHIẾN CÔNG HIỂN HÁCH! ĐÃ HẠ GỤC ${bossName.toUpperCase()}!`, 0xffd700);

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
    const timeBonus = Math.floor(this.timeRemaining * 50);
    this.score += timeBonus;
    this.scoreText.setText(`${this.score} PTS`);

    // 4. ⭐ Star Quests Evaluation
    // ⭐ 1 Sao: Dọn sạch bàn cờ trước khi hết giờ (Always true upon victory)
    const quest1Achieved = true;

    // ⭐⭐ 2 Sao: Đạt ít nhất 1 lần Combo x5 (yêu cầu nối tay nhanh)
    const quest2Achieved = this.maxComboAchieved >= 5;

    // ⭐⭐⭐ 3 Sao: Hoàn thành màn mà không dùng bất kỳ Gợi ý / Đổi vị trí nào (hoặc còn dư > 40s)
    const quest3Achieved = (this.playerUsedBoosterCount === 0) || (!this.isZenMode && this.timeRemaining > 40);

    let earnedStars = (quest1Achieved ? 1 : 0) + (quest2Achieved ? 1 : 0) + (quest3Achieved ? 1 : 0);
    earnedStars = Math.max(1, Math.min(3, earnedStars));

    const isPerfect = earnedStars === 3;
    const baseCoins = this.levelConfig.rewards.coins;
    const perfectBonusCoins = isPerfect ? 50 : 0;
    const earnedCoins = baseCoins + perfectBonusCoins;

    this.save.addCoins(earnedCoins);
    this.save.recordLevelCompleted(this.levelConfig.id, this.levelConfig.levelNumber, earnedStars);

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
      isPerfect
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
    }
  ): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const isPerfect = questStats?.isPerfect ?? (stars === 3);
    const cardW = 440;
    const cardH = 550;

    const card = this.add.graphics();
    card.fillStyle(0x161324, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2.5, isPerfect ? 0xffd700 : 0x7209b7, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    modal.add(card);

    // Title
    const title = this.add.text(0, -240, '✨ CHIẾN THẮNG! ✨', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '25px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    // Level subtitle
    const subTitle = this.add.text(0, -214, this.levelConfig.title, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5);
    modal.add(subTitle);

    // 3 Animated Stars Container
    const starsY = -170;
    const starOffsets = [-64, 0, 64];
    for (let i = 0; i < 3; i++) {
      const isEarned = i < stars;
      const starIcon = this.add.text(starOffsets[i], starsY, isEarned ? '⭐' : '☆', {
        fontSize: '38px',
        color: isEarned ? '#ffd700' : '#495057'
      }).setOrigin(0.5);

      if (isEarned) {
        starIcon.setScale(0);
        this.tweens.add({
          targets: starIcon,
          scaleX: 1,
          scaleY: 1,
          delay: 200 * (i + 1),
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

    // Rating Badge
    let ratingBadgeStr = '⭐ ĐẠT 1/3 SAO • CỐ LÊN!';
    let ratingColor = '#ffd166';
    if (isPerfect) {
      ratingBadgeStr = '🌟 HOÀN HẢO 3 SAO (+50 XU THƯỞNG)! 🌟';
      ratingColor = '#ffd700';
    } else if (stars === 2) {
      ratingBadgeStr = '⭐ ĐẠT 2/3 SAO • SẮP HOÀN HẢO!';
      ratingColor = '#00f5d4';
    }

    const ratingBadge = this.add.text(0, -128, ratingBadgeStr, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: ratingColor
    }).setOrigin(0.5);
    modal.add(ratingBadge);

    // 📋 Star Quests Checklist Panel
    const qPanelW = 420;
    const qPanelH = 162;
    const qPanelY = -30;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1d1830, 0.95);
    panelBg.fillRoundedRect(-qPanelW / 2, qPanelY - qPanelH / 2, qPanelW, qPanelH, 14);
    panelBg.lineStyle(1.2, 0x3d325c, 0.8);
    panelBg.strokeRoundedRect(-qPanelW / 2, qPanelY - qPanelH / 2, qPanelW, qPanelH, 14);
    modal.add(panelBg);

    const panelTitle = this.add.text(0, qPanelY - 60, '⭐ NHIỆM VỤ 3 SAO (STAR QUESTS)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12.5px',
      fontStyle: '900',
      color: '#c77dff'
    }).setOrigin(0.5);
    modal.add(panelTitle);

    // Quest 1
    const q1Txt = this.add.text(-195, qPanelY - 36, '⭐ 1. Dọn sạch bàn cờ trước khi hết giờ', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8f9fa'
    });
    const q1Badge = this.add.text(195, qPanelY - 36, '[✓ ĐẠT]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(1, 0);
    modal.add([q1Txt, q1Badge]);

    // Quest 2
    const q2Ok = questStats?.quest2 ?? (stars >= 2);
    const maxC = questStats?.maxCombo ?? this.maxComboAchieved;
    const q2Txt = this.add.text(-195, qPanelY - 10, `⭐ 2. Đạt Combo x5 (Đạt tối đa: x${maxC})`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: q2Ok ? '#f8f9fa' : '#adb5bd'
    });
    const q2Badge = this.add.text(195, qPanelY - 10, q2Ok ? '[✓ ĐẠT]' : '[✕ CHƯA]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: q2Ok ? '#00f5d4' : '#ff758f'
    }).setOrigin(1, 0);
    modal.add([q2Txt, q2Badge]);

    // Quest 3
    const q3Ok = questStats?.quest3 ?? (stars === 3);
    const bUsed = questStats?.boostersUsed ?? this.playerUsedBoosterCount;
    const remSec = Math.max(0, Math.floor(questStats?.timeRemaining ?? this.timeRemaining));
    const q3Txt = this.add.text(-195, qPanelY + 16, `⭐ 3. Không trợ giúp (Dùng: ${bUsed}) / Còn >40s (${remSec}s)`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: q3Ok ? '#f8f9fa' : '#adb5bd'
    });
    const q3Badge = this.add.text(195, qPanelY + 16, q3Ok ? '[✓ ĐẠT]' : '[✕ CHƯA]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: q3Ok ? '#00f5d4' : '#ff758f'
    }).setOrigin(1, 0);
    modal.add([q3Txt, q3Badge]);

    // Quest Tip / Note
    const qNoteTxt = this.add.text(0, qPanelY + 50, isPerfect ? '✨ Xuất sắc! Bạn đã thu phục trọn vẹn điểm màn này! ✨' : '💡 Mẹo: Bấm chơi lại để đạt điểm tuyệt đối 3 sao!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: isPerfect ? '#ffd700' : '#adb5bd'
    }).setOrigin(0.5);
    modal.add(qNoteTxt);

    // Rewards info text
    const rewardsText = this.add.text(0, 72, `+${coins} 💰 Ngân lượng • ⏱️ Thưởng giờ: +${timeBonus} PTS • ❤️ ${this.lives}/10`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(rewardsText);

    // If new character discovered
    if (newCharId) {
      const char = CharacterRegistry.get(newCharId);
      if (char) {
        const charTxt = this.add.text(0, 96, `🎊 THU PHỤC LINH THÚ: ${char.symbol} ${char.name} (${char.japaneseName})`, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '13px',
          fontStyle: '800',
          color: '#ff758f'
        }).setOrigin(0.5);
        modal.add(charTxt);
      }
    }

    // Action Buttons
    if (isPerfect) {
      const isFinalLevel = this.levelConfig.levelNumber >= 10;
      // 1. Next Level / Campaign Victory Button
      const nextBtn = this.add.container(0, 146);
      const nBg = this.add.graphics();
      nBg.fillStyle(isFinalLevel ? 0xffb703 : 0xe63946, 1);
      nBg.fillRoundedRect(-130, -21, 260, 42, 14);
      const nTxt = this.add.text(0, 0, isFinalLevel ? '🏆 HOÀN THÀNH CHIẾN DỊCH! 👑' : 'TIẾP TỤC HÀNH TRÌNH ➔', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13.5px',
        fontStyle: '800',
        color: isFinalLevel ? '#1a1c29' : '#ffffff'
      }).setOrigin(0.5);
      nextBtn.add([nBg, nTxt]);
      nextBtn.setSize(260, 42);
      nextBtn.setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.audio.playSelect();
        if (isFinalLevel) {
          this.scene.start('MainMenuScene');
        } else {
          const nextNum = this.levelConfig.levelNumber + 1;
          const nextId = `level_${String(nextNum).padStart(2, '0')}`;
          this.scene.restart({ levelId: nextId, lives: this.lives });
        }
      });
      modal.add(nextBtn);

      // 2. Menu Button
      const menuBtn = this.add.container(0, 204);
      const mBg = this.add.graphics();
      mBg.fillStyle(0x2b2d42, 1);
      mBg.fillRoundedRect(-130, -19, 260, 38, 12);
      const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13.5px',
        fontStyle: 'bold',
        color: '#adb5bd'
      }).setOrigin(0.5);
      menuBtn.add([mBg, mTxt]);
      menuBtn.setSize(260, 38);
      menuBtn.setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.scene.start('MainMenuScene');
      });
      modal.add(menuBtn);
    } else {
      const isFinalLevel = this.levelConfig.levelNumber >= 10;
      // 1. Next Level / Campaign Victory Button
      const nextBtn = this.add.container(0, 132);
      const nBg = this.add.graphics();
      nBg.fillStyle(isFinalLevel ? 0xffb703 : 0xe63946, 1);
      nBg.fillRoundedRect(-130, -19, 260, 38, 12);
      const nTxt = this.add.text(0, 0, isFinalLevel ? '🏆 HOÀN THÀNH CHIẾN DỊCH! 👑' : 'TIẾP TỤC HÀNH TRÌNH ➔', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13.5px',
        fontStyle: '800',
        color: isFinalLevel ? '#1a1c29' : '#ffffff'
      }).setOrigin(0.5);
      nextBtn.add([nBg, nTxt]);
      nextBtn.setSize(260, 38);
      nextBtn.setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.audio.playSelect();
        if (isFinalLevel) {
          this.scene.start('MainMenuScene');
        } else {
          const nextNum = this.levelConfig.levelNumber + 1;
          const nextId = `level_${String(nextNum).padStart(2, '0')}`;
          this.scene.restart({ levelId: nextId, lives: this.lives });
        }
      });
      modal.add(nextBtn);

      // 2. Replay to hunt 3 stars button
      const replayBtn = this.add.container(0, 178);
      const rBg = this.add.graphics();
      rBg.fillStyle(0x382c16, 1);
      rBg.fillRoundedRect(-130, -19, 260, 38, 12);
      rBg.lineStyle(1.5, 0xffb703, 0.9);
      rBg.strokeRoundedRect(-130, -19, 260, 38, 12);
      const rTxt = this.add.text(0, 0, '🔄 CHƠI LẠI ĐỂ SĂN 3 SAO!', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13.5px',
        fontStyle: '800',
        color: '#ffd166'
      }).setOrigin(0.5);
      replayBtn.add([rBg, rTxt]);
      replayBtn.setSize(260, 38);
      replayBtn.setInteractive({ useHandCursor: true });
      replayBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.scene.restart({ levelId: this.levelConfig.id, lives: this.lives });
      });
      modal.add(replayBtn);

      // 3. Menu Button
      const menuBtn = this.add.container(0, 222);
      const mBg = this.add.graphics();
      mBg.fillStyle(0x232538, 1);
      mBg.fillRoundedRect(-130, -18, 260, 36, 10);
      const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#adb5bd'
      }).setOrigin(0.5);
      menuBtn.add([mBg, mTxt]);
      menuBtn.setSize(260, 36);
      menuBtn.setInteractive({ useHandCursor: true });
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

    const card = this.add.graphics();
    card.fillStyle(0x1a1528, 1);
    card.fillRoundedRect(-150, -120, 300, 240, 20);
    card.lineStyle(2, 0xe63946, 1);
    card.strokeRoundedRect(-150, -120, 300, 240, 20);
    modal.add(card);

    const title = this.add.text(0, -75, 'GAME OVER!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '24px',
      fontStyle: '900',
      color: '#e63946'
    }).setOrigin(0.5);

    const reasonText = this.add.text(0, -45, this.gameOverReason, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#ffd166',
      wordWrap: { width: 260 },
      align: 'center'
    }).setOrigin(0.5);

    modal.add([title, reasonText]);

    const retryBtn = this.add.container(0, 5);
    const rBg = this.add.graphics();
    rBg.fillStyle(0xe63946, 1);
    rBg.fillRoundedRect(-105, -21, 210, 42, 12);
    const rTxt = this.add.text(0, 0, 'THỬ LẠI MÀN NÀY 🔄', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    retryBtn.add([rBg, rTxt]);
    retryBtn.setSize(210, 42);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.restart({ levelId: this.levelConfig.id, lives: 10 });
    });
    modal.add(retryBtn);

    const menuBtn = this.add.container(0, 60);
    const mBg = this.add.graphics();
    mBg.fillStyle(0x2b2d42, 1);
    mBg.fillRoundedRect(-105, -19, 210, 38, 12);
    const mTxt = this.add.text(0, 0, 'VỀ TRANG CHỦ 🏠', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5);
    menuBtn.add([mBg, mTxt]);
    menuBtn.setSize(210, 38);
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
      fontSize: '13.5px',
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

    const scoreText = this.add.text(0, -38, `Điểm số: ${this.score.toLocaleString()} PTS`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const recordText = this.add.text(0, -15, `Kỷ lục: ${record.maxWaves} Đợt • ${record.highScore.toLocaleString()} PTS${isNewRecord ? ' 🔥 MỚI!' : ''}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12.5px',
      fontStyle: '800',
      color: isNewRecord ? '#ffb703' : '#ced4da'
    }).setOrigin(0.5);

    const coinsText = this.add.text(0, 10, `+${earnedCoins} 💰 Ngân lượng nhận được`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: 'bold',
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
      fontSize: '14px',
      fontStyle: '800',
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
      fontSize: '13.5px',
      fontStyle: 'bold',
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
