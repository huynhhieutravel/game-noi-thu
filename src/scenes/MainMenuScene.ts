import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions, setupRetinaCamera } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { CompanionManager } from '../game/CompanionManager';
import { CompanionModal } from '../game/CompanionModal';
import { CompanionModal3D } from '../game/CompanionModal3D';
import { TextureGenerator } from '../game/TextureGenerator';
import bossesData from '../data/bosses.json';
import levelsData from '../data/levels.json';
import { LevelConfig, DifficultyLevel, CharacterData } from '../types';
import { LevelManager } from '../game/LevelManager';
import { CharacterRegistry } from '../game/CharacterRegistry';
import { RelicManager } from '../game/RelicManager';
import { RelicCodexModal } from '../game/RelicCodexModal';
import { LootManager } from '../game/LootManager';
import { QADebugPanel } from '../game/QADebugPanel';
import { SettingsModal } from '../game/SettingsModal';
import { ShopModal } from '../game/ShopModal';
import { DailyOmikujiModal } from '../game/DailyOmikujiModal';
import { AchievementModal } from '../game/AchievementModal';
import { formatCurrency, FONT_UI, FONT_DISPLAY, FONT_WEIGHT } from '../styles/typography';
import { COLORS, COLOR_HEX, SEMANTIC_COLORS } from '../styles/colors';

export class MainMenuScene extends Phaser.Scene {
  private saveSystem!: SaveSystem;
  private audio!: AudioSystem;
  private haptic!: HapticSystem;
  private qaDebugPanel!: QADebugPanel;
  private stageModalContainer: Phaser.GameObjects.Container | null = null;
  private stageDetailModalContainer: Phaser.GameObjects.Container | null = null;
  private realmModalContainer: Phaser.GameObjects.Container | null = null;
  private rulesModalContainer: Phaser.GameObjects.Container | null = null;
  private relicsWikiModalContainer: Phaser.GameObjects.Container | null = null;
  private lootTableModalContainer: Phaser.GameObjects.Container | null = null;
  private themeModalContainer: Phaser.GameObjects.Container | null = null;
  private bossModalContainer: Phaser.GameObjects.Container | null = null;
  private wallpaperModalContainer: Phaser.GameObjects.Container | null = null;
  private bgImage!: Phaser.GameObjects.Image;
  private sakuraContainer: Phaser.GameObjects.Container | null = null;
  private effectsEnabled: boolean = true;
  private stageSelectChapter: number = 1;
  private stageSelectDifficulty: DifficultyLevel = 'easy';

  public static readonly THEMES = [
    { id: 'yokai', label: 'Bách Quỷ', icon: '⛩️', tag: 'Thần Thoại Nhật', color: 0xd90429, hex: '#d90429' },
    { id: 'egypt', label: 'Ai Cập', icon: '🏺', tag: 'Chư Thần Nile', color: 0xe76f51, hex: '#e76f51' },
    { id: 'greece', label: 'Hy Lạp', icon: '🏛️', tag: 'Đỉnh Olympus', color: 0x3a86ff, hex: '#3a86ff' },
    { id: 'wuxia', label: 'Võ Hiệp', icon: '🗡️', tag: 'Võ Lâm Tiên Hiệp', color: 0xd00000, hex: '#d00000' },
    { id: 'korea', label: 'Hàn Quốc', icon: '🐯', tag: 'Thần Thoại Triều Tiên', color: 0x2a9d8f, hex: '#2a9d8f' },
    { id: 'india', label: 'Ấn Độ', icon: '🐘', tag: 'Chư Thần & Lễ Hội', color: 0xe76f51, hex: '#e76f51' },
    { id: 'sea', label: 'Đông Nam Á', icon: '🌴', tag: 'Di Tích Rừng Thiêng', color: 0x2a9d8f, hex: '#2a9d8f' },
    { id: 'pirate', label: 'Hải Tặc', icon: '🏴‍☠️', tag: 'Đại Dương Huyền Bí', color: 0x0077b6, hex: '#0077b6' },
    { id: 'underwater', label: 'Thủy Cung', icon: '🌊', tag: 'Đế Vương Atlantis', color: 0x00b4d8, hex: '#00b4d8' },
    { id: 'dinosaur', label: 'Khủng Long', icon: '🦖', tag: 'Kỷ Kỷ Tiền Sử', color: 0x52b788, hex: '#52b788' },
    { id: 'monster', label: 'Quái Thú', icon: '👾', tag: 'Hầm Ngục Dị Giới', color: 0x9b5de5, hex: '#9b5de5' },
    { id: 'fantasy', label: 'Fantasy', icon: '🏰', tag: 'Kỷ Nguyên Hiệp Sĩ', color: 0x4361ee, hex: '#4361ee' },
    { id: 'space', label: 'Vũ Trụ', icon: '🚀', tag: 'Thiên Hà Tinh Vân', color: 0x7209b7, hex: '#7209b7' },
    { id: 'robot', label: 'Robot', icon: '🤖', tag: 'Xưởng Máy Tương Lai', color: 0xffa200, hex: '#ffa200' },
    { id: 'animal', label: 'Động Vật', icon: '🐾', tag: 'Thú Cưng Đáng Yêu', color: 0x2a9d8f, hex: '#2a9d8f' },
    { id: 'plant', label: 'Thực Vật', icon: '🌱', tag: 'Vương Quốc Hoa Cỏ', color: 0x2d6a4f, hex: '#2d6a4f' }
  ];

  constructor() {
    super('MainMenuScene');
  }

  public create(): void {
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    this.saveSystem = SaveSystem.getInstance();
    const save = this.saveSystem.getData();
    this.audio = AudioSystem.getInstance();
    this.haptic = HapticSystem.getInstance();

    // Start ambient BGM upon first user interaction
    this.input.once('pointerdown', () => {
      this.audio.startBGM();
    });

    const currentTheme = this.saveSystem.getSelectedTheme();
    const { width: screenW, offsetX } = getScreenDimensions();

    // 1. Fullscreen Cinematic Background (Edge-to-Edge) matching Reference Image 1
    const savedWallpaper = this.saveSystem.getSelectedWallpaper();
    let mainBgKey = this.textures.exists(savedWallpaper) ? savedWallpaper : 'bg_night_shrine';
    if (!this.textures.exists(mainBgKey) && this.textures.exists('bg_main_torii')) {
      mainBgKey = 'bg_main_torii';
    }

    if (this.textures.exists(mainBgKey)) {
      this.bgImage = this.add.image(GAME_WIDTH / 2, height / 2, mainBgKey);
      this.bgImage.setDisplaySize(screenW, height);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x131224, 0x131224, 0x090a12, 0x090a12, 1);
      bg.fillRect(-offsetX, 0, screenW, height);
    }

    // Atmospheric Vignette & Contrast Overlays for pristine WCAG readability
    const vignette = this.add.graphics();
    vignette.fillStyle(0x06050e, 0.22);
    vignette.fillRect(-offsetX, 0, screenW, height);
    
    // 2. Falling Sakura Petals Ambient Effect
    this.createAmbientSakura();

    // 3. Top Navigation & Status Bar (Full Width)
    this.createTopBar(width, save, currentTheme);

    // 4. Left Hero Section: Mascot Showcase, Title & Album Access
    this.createHeroShowcase(save, currentTheme);

    // 5. Right Hub Section: Primary Play CTA & Game Mode Grid
    this.createGameHub(save);

    // 6. QA Debug Panel
    this.qaDebugPanel = new QADebugPanel(this);
  }

  /**
   * Authentic Shinto Torii Gate Backdrop with Sacred Shimenawa & Hitodama Spirit Flames
   */
  private createToriiGateBackdrop(centerX: number, centerY: number, currentTheme: string): void {
    if (currentTheme !== 'yokai') {
      return;
    }

    if (!this.textures.exists('torii_gate')) {
      return;
    }

    // Mystical blue & vermilion spiritual aura behind the Torii gate
    const aura = this.add.graphics();
    aura.fillStyle(0x00b4d8, 0.09);
    aura.fillCircle(centerX, centerY - 15, 180);
    aura.fillStyle(0xd90429, 0.06);
    aura.fillCircle(centerX, centerY + 25, 150);

    // High-resolution Torii Gate Sprite with transparent cutout (static, fixed positioning to guarantee 60 FPS)
    const torii = this.add.image(centerX, centerY, 'torii_gate');
    torii.setDisplaySize(410, 390);
    torii.setAlpha(0.96);
  }

  /**
   * Helper to resolve the best high-res companion texture key
   */
  public getCompanionTextureKey(cId: string): string {
    if (!cId) return '';
    if (this.textures.exists(`comp_art_${cId}`)) return `comp_art_${cId}`;
    if (cId === 'inari_kitsune' && this.textures.exists('inari_3d_00')) return 'inari_3d_00';
    if (cId === 'ryujin_pearl' && this.textures.exists('ryujin_3d_00')) return 'ryujin_3d_00';
    if (cId === 'hi_no_tori' && this.textures.exists('hinotori_3d_00')) return 'hinotori_3d_00';
    if (this.textures.exists(`char_${cId}`)) return `char_${cId}`;
    if (cId === 'inari_kitsune' && this.textures.exists('avatar_inari')) return 'avatar_inari';
    return '';
  }

  /**
   * Top Glassmorphic Navigation Bar - Symmetrically balanced with 0 overlap
   */
  private createTopBar(width: number, save: any, currentTheme: string): void {
    const container = this.add.container(0, 0);
    const topY = 14;
    const compH = 36;

    // --- 1. Companion / Pet Profile Capsule (x = 16 to 166, width = 150) ---
    const compId = this.saveSystem.getSelectedCompanion();
    const companion = CompanionManager.get(compId);
    const compW = 150;
    const compX = 16;

    const compBg = this.add.graphics();
    compBg.fillStyle(0x111024, 0.92);
    compBg.fillRoundedRect(compX, topY, compW, compH, 18);
    compBg.lineStyle(1.5, companion.themeColor || 0xd90429, 0.9);
    compBg.strokeRoundedRect(compX, topY, compW, compH, 18);

    // Avatar ring & image
    const avCenterX = compX + 18;
    const avCenterY = topY + compH / 2;
    const avRing = this.add.graphics();
    avRing.lineStyle(2, 0xd90429, 0.95);
    avRing.strokeCircle(avCenterX, avCenterY, 13);
    container.add(avRing);

    let avItem: Phaser.GameObjects.GameObject;
    const compTex = this.getCompanionTextureKey(companion.id);
    if (compTex && this.textures.exists(compTex)) {
      const avImg = this.add.image(avCenterX, avCenterY, compTex);
      avImg.setDisplaySize(24, 24);
      avItem = avImg;
    } else {
      avItem = this.add.text(avCenterX, avCenterY, companion.icon || '🦊', { fontSize: '15px' }).setOrigin(0.5);
    }

    // Companion Name (Top row)
    const compNameTxt = this.add.text(compX + 36, topY + 5, `${companion.name}`, {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    });

    // Level Badge (Lv.32)
    const lvlW = 34;
    const lvlH = 14;
    const lvlX = compX + compW - 38;
    const lvlY = topY + 6;

    const lvlBg = this.add.graphics();
    lvlBg.fillStyle(0xffd166, 1);
    lvlBg.fillRoundedRect(lvlX, lvlY, lvlW, lvlH, 7);

    const lvlTxt = this.add.text(lvlX + lvlW / 2, lvlY + lvlH / 2, 'Lv.32', {
      fontFamily: FONT_UI,
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#161426'
    }).setOrigin(0.5);

    // Mini Blue EXP Bar underneath name & level
    const expBarX = compX + 36;
    const expBarY = topY + 23;
    const expBarW = 104;
    const expBarH = 4;

    const expTrack = this.add.graphics();
    expTrack.fillStyle(0x232138, 0.9);
    expTrack.fillRoundedRect(expBarX, expBarY, expBarW, expBarH, 2);

    const expFill = this.add.graphics();
    expFill.fillStyle(0x3a86ff, 1);
    expFill.fillRoundedRect(expBarX, expBarY, expBarW * 0.65, expBarH, 2);

    const compHit = this.add.zone(compX, topY, compW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    compHit.on('pointerdown', () => {
      this.audio.playSelect();
      CompanionModal3D.open(this, compId, (newComp) => {
        this.saveSystem.setSelectedCompanion(newComp.id);
        this.audio.playVictory();
        this.haptic.medium();
        this.scene.restart();
      });
    });

    // --- 2. Coins Pill (x = 174, width = 108) ---
    const coinW = 108;
    const coinX = compX + compW + 8; // 174

    const coinsBg = this.add.graphics();
    coinsBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    coinsBg.fillRoundedRect(coinX, topY, coinW, compH, 18);
    coinsBg.lineStyle(1.5, COLORS.GOLD_WARM, 0.85);
    coinsBg.strokeRoundedRect(coinX, topY, coinW, compH, 18);

    const coinIcon = this.textures.exists('icon_reward_coin')
      ? this.add.image(coinX + 17, topY + compH / 2, 'icon_reward_coin').setDisplaySize(20, 20)
      : this.add.text(coinX + 9, topY + 8, '💰', { fontSize: '15px' });
    const coinText = this.add.text(coinX + 30, topY + 9, formatCurrency(save.coins), {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '800',
      color: COLOR_HEX.GOLD
    });

    const coinPlus = this.add.graphics();
    coinPlus.fillStyle(COLORS.BORDER_SUBTLE, 0.9);
    coinPlus.fillCircle(coinX + coinW - 13, topY + compH / 2, 8);
    coinPlus.lineStyle(1.2, COLORS.GOLD_WARM, 0.85);
    coinPlus.strokeCircle(coinX + coinW - 13, topY + compH / 2, 8);

    const coinPlusTxt = this.add.text(coinX + coinW - 13, topY + compH / 2 - 1, '+', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '800',
      color: COLOR_HEX.GOLD
    }).setOrigin(0.5);

    const coinHit = this.add.zone(coinX, topY, coinW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    coinHit.on('pointerdown', () => this.openShopModal());

    // --- 3. Diamonds Pill (x = 290, width = 88) ---
    const diaW = 88;
    const diaX = coinX + coinW + 8; // 290

    const diaBg = this.add.graphics();
    diaBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    diaBg.fillRoundedRect(diaX, topY, diaW, compH, 18);
    diaBg.lineStyle(1.5, COLORS.CYAN, 0.85);
    diaBg.strokeRoundedRect(diaX, topY, diaW, compH, 18);

    const diaIcon = this.textures.exists('icon_diamond')
      ? this.add.image(diaX + 16, topY + compH / 2, 'icon_diamond').setDisplaySize(19, 19)
      : this.add.text(diaX + 8, topY + 8, '💎', { fontSize: '15px' });
    const diaText = this.add.text(diaX + 29, topY + 9, formatCurrency(this.saveSystem.getDiamonds()), {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '800',
      color: COLOR_HEX.CYAN
    });

    const diaPlus = this.add.graphics();
    diaPlus.fillStyle(COLORS.BORDER_SUBTLE, 0.9);
    diaPlus.fillCircle(diaX + diaW - 13, topY + compH / 2, 8);
    diaPlus.lineStyle(1.2, COLORS.CYAN, 0.85);
    diaPlus.strokeCircle(diaX + diaW - 13, topY + compH / 2, 8);

    const diaPlusTxt = this.add.text(diaX + diaW - 13, topY + compH / 2 - 1, '+', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: COLOR_HEX.CYAN
    }).setOrigin(0.5);

    const diaHit = this.add.zone(diaX, topY, diaW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    diaHit.on('pointerdown', () => this.openShopModal());

    // --- 5. 100 Màn Codex Button (x = 388, width = 118) ---
    const codexW = 118;
    const codexX = diaX + diaW + 10; // 388

    const codexBg = this.add.graphics();
    codexBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    codexBg.fillRoundedRect(codexX, topY, codexW, compH, 18);
    codexBg.lineStyle(1.5, COLORS.GOLD, 0.95);
    codexBg.strokeRoundedRect(codexX, topY, codexW, compH, 18);

    const codexTxt = this.add.text(codexX + codexW / 2, topY + compH / 2, '🏛️ VẠN GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: COLOR_HEX.GOLD
    }).setOrigin(0.5);

    const codexHit = this.add.zone(codexX, topY, codexW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    codexHit.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      this.scene.start('CollectionScene');
    });

    // --- 6. Stars Pill (x = 516, width = 92) ---
    const starW = 92;
    const starX = codexX + codexW + 10; // 516

    const starsBg = this.add.graphics();
    starsBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    starsBg.fillRoundedRect(starX, topY, starW, compH, 18);
    starsBg.lineStyle(1.5, COLORS.AMBER, 0.85);
    starsBg.strokeRoundedRect(starX, topY, starW, compH, 18);

    const starIcon = this.add.text(starX + 10, topY + 7, '⭐', {
      fontSize: '14px',
      padding: { top: 4, bottom: 4, left: 2, right: 2 }
    });
    const starText = this.add.text(starX + 28, topY + 9, `${save.stars}/300`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: COLOR_HEX.GOLD
    });

    // --- 7. Daily Omikuji Button (x = 618, width = 118) ---
    const omiW = 118;
    const omiX = starX + starW + 10; // 618
    const canClaimOmikuji = this.saveSystem.canClaimDailyOmikuji();

    const omiBg = this.add.graphics();
    omiBg.fillStyle(canClaimOmikuji ? 0x2d121c : COLORS.SURFACE_CARD, 0.92);
    omiBg.fillRoundedRect(omiX, topY, omiW, compH, 18);
    omiBg.lineStyle(1.5, canClaimOmikuji ? 0xd90429 : 0x7209b7, 0.95);
    omiBg.strokeRoundedRect(omiX, topY, omiW, compH, 18);

    const omiTxt = this.add.text(omiX + omiW / 2, topY + compH / 2, '⛩️ QUẺ NGÀY', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: canClaimOmikuji ? '#ff758f' : '#ced4da'
    }).setOrigin(0.5);

    let omiDot: Phaser.GameObjects.Graphics | null = null;
    if (canClaimOmikuji) {
      omiDot = this.add.graphics();
      omiDot.fillStyle(0xd90429, 1);
      omiDot.fillCircle(omiX + omiW - 10, topY + 8, 4.5);
      omiDot.lineStyle(1, 0xffd166, 1);
      omiDot.strokeCircle(omiX + omiW - 10, topY + 8, 4.5);
      this.tweens.add({
        targets: omiDot,
        alpha: { from: 0.4, to: 1.0 },
        scale: { from: 0.8, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }

    const omiHit = this.add.zone(omiX, topY, omiW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    omiHit.on('pointerdown', () => {
      this.haptic.medium();
      this.audio.playSelect();
      DailyOmikujiModal.open(this, () => this.scene.restart());
    });

    // --- 7.5 Achievements Button (x = 746, width = 132) ---
    const achW = 132;
    const achX = omiX + omiW + 10; // 746

    const achBg = this.add.graphics();
    achBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    achBg.fillRoundedRect(achX, topY, achW, compH, 18);
    achBg.lineStyle(1.5, 0xffd700, 0.9);
    achBg.strokeRoundedRect(achX, topY, achW, compH, 18);

    const achTxt = this.add.text(achX + achW / 2, topY + compH / 2, '🏆 THÀNH TỰU', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const achHit = this.add.zone(achX, topY, achW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    achHit.on('pointerdown', () => {
      this.haptic.medium();
      this.audio.playSelect();
      AchievementModal.open(this, () => this.scene.restart());
    });

    // --- 8, 9, 10, 11: Circular Action Buttons (🖼️, 📖, 🔊, ⚙️) positioned gracefully toward top-right ---
    const btnRadius = 17;

    // 8. Wallpaper Selector Modal
    const wallCenterX = 896;
    const wallCenterY = topY + compH / 2;
    const wallBg = this.add.graphics();
    wallBg.fillStyle(0x111024, 0.92);
    wallBg.fillCircle(wallCenterX, wallCenterY, btnRadius);
    wallBg.lineStyle(1.4, 0x3a86ff, 0.85);
    wallBg.strokeCircle(wallCenterX, wallCenterY, btnRadius);

    const hasWallTex = this.textures.exists('btn_wallpaper');
    const wallIcon = hasWallTex
      ? this.add.image(wallCenterX, wallCenterY, 'btn_wallpaper').setDisplaySize(23, 23)
      : this.add.text(wallCenterX, wallCenterY, '🖼️', { fontSize: '15px' }).setOrigin(0.5);

    const wallHit = this.add.zone(wallCenterX - btnRadius, wallCenterY - btnRadius, btnRadius * 2, btnRadius * 2)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    wallHit.on('pointerdown', () => {
      this.haptic.light();
      this.audio.playSelect();
      this.openWallpaperModal();
    });

    // 9. Book / Codex Guide
    const bookCenterX = 940;
    const bookCenterY = topY + compH / 2;
    const bookBg = this.add.graphics();
    bookBg.fillStyle(0x111024, 0.92);
    bookBg.fillCircle(bookCenterX, bookCenterY, btnRadius);
    bookBg.lineStyle(1.4, 0xffd166, 0.85);
    bookBg.strokeCircle(bookCenterX, bookCenterY, btnRadius);

    const hasBookTex = this.textures.exists('btn_book');
    const bookIcon = hasBookTex
      ? this.add.image(bookCenterX, bookCenterY, 'btn_book').setDisplaySize(23, 23)
      : this.add.text(bookCenterX, bookCenterY, '📖', { fontSize: '15px' }).setOrigin(0.5);

    const bookHit = this.add.zone(bookCenterX - btnRadius, bookCenterY - btnRadius, btnRadius * 2, btnRadius * 2)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    bookHit.on('pointerdown', () => {
      this.haptic.light();
      this.audio.playSelect();
      this.openRulebookModal();
    });

    // 10. Audio Toggle
    const audioCenterX = 984;
    const audioCenterY = topY + compH / 2;
    const audioBg = this.add.graphics();
    audioBg.fillStyle(0x111024, 0.92);
    audioBg.fillCircle(audioCenterX, audioCenterY, btnRadius);
    audioBg.lineStyle(1.4, 0x00f5d4, 0.85);
    audioBg.strokeCircle(audioCenterX, audioCenterY, btnRadius);

    const hasAudioTex = this.textures.exists('btn_sound_on');
    const audioIcon = hasAudioTex
      ? this.add.image(audioCenterX, audioCenterY, this.audio.getEnabled() ? 'btn_sound_on' : 'btn_sound_off').setDisplaySize(23, 23)
      : this.add.text(audioCenterX, audioCenterY, this.audio.getEnabled() ? '🔊' : '🔇', { fontSize: '15px' }).setOrigin(0.5);

    const audioHit = this.add.zone(audioCenterX - btnRadius, audioCenterY - btnRadius, btnRadius * 2, btnRadius * 2)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    audioHit.on('pointerdown', () => {
      const enabled = this.audio.toggle();
      if (hasAudioTex) {
        (audioIcon as Phaser.GameObjects.Image).setTexture(enabled ? 'btn_sound_on' : 'btn_sound_off').setDisplaySize(23, 23);
      } else {
        (audioIcon as Phaser.GameObjects.Text).setText(enabled ? '🔊' : '🔇');
      }
      this.haptic.light();
      if (enabled) this.audio.playSelect();
    });

    // 11. Settings Modal
    const setCenterX = 1028;
    const setCenterY = topY + compH / 2;
    const setBg = this.add.graphics();
    setBg.fillStyle(0x111024, 0.92);
    setBg.fillCircle(setCenterX, setCenterY, btnRadius);
    setBg.lineStyle(1.4, 0xffd700, 0.85);
    setBg.strokeCircle(setCenterX, setCenterY, btnRadius);

    const hasSetTex = this.textures.exists('btn_settings');
    const setIcon = hasSetTex
      ? this.add.image(setCenterX, setCenterY, 'btn_settings').setDisplaySize(23, 23)
      : this.add.text(setCenterX, setCenterY, '⚙️', { fontSize: '15px' }).setOrigin(0.5);

    const setHit = this.add.zone(setCenterX - btnRadius, setCenterY - btnRadius, btnRadius * 2, btnRadius * 2)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    setHit.on('pointerdown', () => {
      this.haptic.medium();
      this.audio.playSelect();
      SettingsModal.open(this, () => {
        if (hasAudioTex) {
          (audioIcon as Phaser.GameObjects.Image).setTexture(this.audio.getEnabled() ? 'btn_sound_on' : 'btn_sound_off').setDisplaySize(23, 23);
        } else {
          (audioIcon as Phaser.GameObjects.Text).setText(this.audio.getEnabled() ? '🔊' : '🔇');
        }
      });
    });

    const topElements = [
      compBg, avItem, compNameTxt, lvlBg, lvlTxt, expTrack, expFill, compHit,
      coinsBg, coinIcon, coinText, coinPlus, coinPlusTxt, coinHit,
      diaBg, diaIcon, diaText, diaPlus, diaPlusTxt, diaHit,
      codexBg, codexTxt, codexHit,
      starsBg, starIcon, starText,
      omiBg, omiTxt, omiHit,
      achBg, achTxt, achHit,
      wallBg, wallIcon, wallHit,
      bookBg, bookIcon, bookHit,
      audioBg, audioIcon, audioHit,
      setBg, setIcon, setHit
    ];
    if (omiDot) topElements.push(omiDot);
    container.add(topElements);
  }


  /**
   * Open Tactical Supply Depot Shop Modal
   */
  public openShopModal(): void {
    this.audio.playSelect();
    this.haptic.light();
    ShopModal.open(this, () => {
      this.scene.restart();
    });
  }

  /**
   * Modern Theme Switcher Capsule with Quick Prev/Next & Full Modal Access
   */
  private createThemeSwitcher(parent: Phaser.GameObjects.Container, centerX: number, centerY: number, currentTheme: string): void {
    const themes = MainMenuScene.THEMES;
    const currIdx = Math.max(0, themes.findIndex(t => t.id === currentTheme));
    const curr = themes[currIdx] || themes[0];

    const switcherGroup = this.add.container(centerX, centerY);

    const arrowW = 26;
    const arrowH = 26;
    const pillW = 126;
    const pillH = 34;
    const gap = 4;
    const prevX = -(pillW / 2 + gap + arrowW / 2);
    const nextX = (pillW / 2 + gap + arrowW / 2);

    // 1. Previous Theme Button
    const prevBtn = this.add.container(prevX, 0);
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0x1a192e, 0.95);
    prevBg.fillCircle(0, 0, arrowW / 2);
    prevBg.lineStyle(1.5, 0x3d3559, 0.8);
    prevBg.strokeCircle(0, 0, arrowW / 2);

    const prevTxt = this.add.text(0, -1, '‹', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      fontStyle: '900',
      color: '#adb5bd'
    }).setOrigin(0.5);

    prevBtn.add([prevBg, prevTxt]);
    prevBtn.setSize(arrowW, arrowH).setInteractive({ useHandCursor: true });

    prevBtn.on('pointerdown', () => {
      const prevIdx = (currIdx - 1 + themes.length) % themes.length;
      this.audio.playSelect();
      this.haptic.light();
      this.saveSystem.setSelectedTheme(themes[prevIdx].id);
      this.scene.restart();
    });

    prevBtn.on('pointerover', () => {
      this.tweens.add({ targets: prevBtn, scale: 1.15, duration: 80 });
      prevBg.lineStyle(2, curr.color, 1);
      prevBg.strokeCircle(0, 0, arrowW / 2);
      prevTxt.setColor('#ffffff');
    });

    prevBtn.on('pointerout', () => {
      this.tweens.add({ targets: prevBtn, scale: 1.0, duration: 80 });
      prevBg.lineStyle(1.5, 0x3d3559, 0.8);
      prevBg.strokeCircle(0, 0, arrowW / 2);
      prevTxt.setColor('#adb5bd');
    });

    // 2. Next Theme Button
    const nextBtn = this.add.container(nextX, 0);
    const nextBg = this.add.graphics();
    nextBg.fillStyle(0x1a192e, 0.95);
    nextBg.fillCircle(0, 0, arrowW / 2);
    nextBg.lineStyle(1.5, 0x3d3559, 0.8);
    nextBg.strokeCircle(0, 0, arrowW / 2);

    const nextTxt = this.add.text(0, -1, '›', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      fontStyle: '900',
      color: '#adb5bd'
    }).setOrigin(0.5);

    nextBtn.add([nextBg, nextTxt]);
    nextBtn.setSize(arrowW, arrowH).setInteractive({ useHandCursor: true });

    nextBtn.on('pointerdown', () => {
      const nextIdx = (currIdx + 1) % themes.length;
      this.audio.playSelect();
      this.haptic.light();
      this.saveSystem.setSelectedTheme(themes[nextIdx].id);
      this.scene.restart();
    });

    nextBtn.on('pointerover', () => {
      this.tweens.add({ targets: nextBtn, scale: 1.15, duration: 80 });
      nextBg.lineStyle(2, curr.color, 1);
      nextBg.strokeCircle(0, 0, arrowW / 2);
      nextTxt.setColor('#ffffff');
    });

    nextBtn.on('pointerout', () => {
      this.tweens.add({ targets: nextBtn, scale: 1.0, duration: 80 });
      nextBg.lineStyle(1.5, 0x3d3559, 0.8);
      nextBg.strokeCircle(0, 0, arrowW / 2);
      nextTxt.setColor('#adb5bd');
    });

    // 3. Center Theme Capsule (Click to open full 16-theme gallery modal)
    const centerPill = this.add.container(0, 0);
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x151426, 0.95);
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 17);
    pillBg.lineStyle(1.8, curr.color, 0.9);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 17);

    const pillInnerGlow = this.add.graphics();
    pillInnerGlow.fillStyle(curr.color, 0.12);
    pillInnerGlow.fillRoundedRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW - 4, pillH - 4, 15);

    // Left Icon (e.g. ⛩️)
    const iconTxt = this.add.text(-pillW / 2 + 10, 0, curr.icon, {
      fontSize: '16px'
    }).setOrigin(0, 0.5);

    // Theme Name
    const labelTxt = this.add.text(-pillW / 2 + 30, 0, curr.label, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Dropdown arrow
    const downArrow = this.add.text(pillW / 2 - 12, 0, '▾', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    centerPill.add([pillBg, pillInnerGlow, iconTxt, labelTxt, downArrow]);
    centerPill.setSize(pillW, pillH).setInteractive({ useHandCursor: true });

    centerPill.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      this.openThemeSelectorModal();
    });

    centerPill.on('pointerover', () => {
      this.tweens.add({ targets: centerPill, scale: 1.03, duration: 80 });
      pillBg.lineStyle(2.5, 0xffffff, 1);
      pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 19);
    });

    centerPill.on('pointerout', () => {
      this.tweens.add({ targets: centerPill, scale: 1.0, duration: 80 });
      pillBg.lineStyle(2, curr.color, 0.9);
      pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 19);
    });

    switcherGroup.add([prevBtn, nextBtn, centerPill]);
    parent.add(switcherGroup);
  }

  /**
   * Left Hero Section: Mascot Dais, Animated Character & Title (matching Image 1)
   */
  private createHeroShowcase(save: any, currentTheme: string): void {
    const leftCenterX = 250;

    let subTitleTxt = '🦊 稲荷の神狐 • 牌つなぎ';
    let mainTitleTxt = 'FOXY PAIR';
    let titleColor = '#ff758f';
    let mascotKey = this.getCompanionTextureKey('inari_kitsune') || 'char_inari_kitsune';
    let mascotFallback = '🦊';

    if (currentTheme === 'egypt') {
      subTitleTxt = 'エジプト神話 • 古代の神々';
      mainTitleTxt = 'EGYPT PAIR';
      titleColor = '#f4a261';
      mascotKey = 'char_sobek';
      mascotFallback = '🐊';
    } else if (currentTheme === 'greece') {
      subTitleTxt = 'ギリシャ神話 • オリンポス';
      mainTitleTxt = 'GREECE PAIR';
      titleColor = '#90e0ef';
      mascotKey = 'char_kronos';
      mascotFallback = '⚡';
    } else if (currentTheme === 'wuxia') {
      subTitleTxt = '仙侠神话 • 江湖武林';
      mainTitleTxt = 'WUXIA PAIR';
      titleColor = '#ffd166';
      mascotKey = 'char_wuxia_swordsman';
      mascotFallback = '🗡️';
    } else if (currentTheme === 'korea') {
      subTitleTxt = '한국 설話 • 조선 신화';
      mainTitleTxt = 'KOREA PAIR';
      titleColor = '#2a9d8f';
      mascotKey = 'char_gumiho';
      mascotFallback = '🦊';
    } else if (currentTheme === 'india') {
      subTitleTxt = 'भारतीय पौराणिक कथा • उत्सव';
      mainTitleTxt = 'INDIA PAIR';
      titleColor = '#ffb703';
      mascotKey = 'char_lord_ganesha';
      mascotFallback = '🐘';
    } else if (currentTheme === 'sea') {
      subTitleTxt = 'เอเชียตะวันออกเฉียงใต้ • เทพนิยาย';
      mainTitleTxt = 'S.E.A PAIR';
      titleColor = '#52b788';
      mascotKey = 'char_phaya_naga';
      mascotFallback = '🐍';
    } else if (currentTheme === 'pirate') {
      subTitleTxt = '海賊の航海 • 呪われた深海';
      mainTitleTxt = 'PIRATE PAIR';
      titleColor = '#4cc9f0';
      mascotKey = 'char_captain_paws';
      mascotFallback = '🏴‍☠️';
    } else if (currentTheme === 'underwater') {
      subTitleTxt = '海底王国 • アトランティス';
      mainTitleTxt = 'ATLANTIS PAIR';
      titleColor = '#00b4d8';
      mascotKey = 'char_dolphin_prince';
      mascotFallback = '🐬';
    } else if (currentTheme === 'dinosaur') {
      subTitleTxt = '恐竜ワールド • ジュラ紀の谷';
      mainTitleTxt = 'DINO PAIR';
      titleColor = '#52b788';
      mascotKey = 'char_baby_trex';
      mascotFallback = '🦖';
    } else if (currentTheme === 'monster') {
      subTitleTxt = 'ダンジョンモンスター • 冒険';
      mainTitleTxt = 'MONSTER PAIR';
      titleColor = '#c77dff';
      mascotKey = 'char_baby_red_dragon';
      mascotFallback = '🐉';
    } else if (currentTheme === 'fantasy') {
      subTitleTxt = 'クラシックファンタジー • 冒険';
      mainTitleTxt = 'FANTASY PAIR';
      titleColor = '#4cc9f0';
      mascotKey = 'char_lion_paladin';
      mascotFallback = '🦁';
    } else if (currentTheme === 'space') {
      subTitleTxt = 'スペース・ギャラクシー • 宇宙探索';
      mainTitleTxt = 'SPACE PAIR';
      titleColor = '#4cc9f0';
      mascotKey = 'char_starlight_kitsune';
      mascotFallback = '🦊';
    } else if (currentTheme === 'robot') {
      subTitleTxt = 'ロボット工場 • メカニック';
      mainTitleTxt = 'ROBOT PAIR';
      titleColor = '#ffd166';
      mascotKey = 'char_battery_bunny_bot';
      mascotFallback = '⚡';
    } else if (currentTheme === 'animal') {
      subTitleTxt = '動物王国 • かわいい動物たち';
      mainTitleTxt = 'ANIMAL PAIR';
      titleColor = '#ffd166';
      mascotKey = 'char_shiba_inu';
      mascotFallback = '🐕';
    } else if (currentTheme === 'plant') {
      subTitleTxt = '植物王国 • かわいい花と木';
      mainTitleTxt = 'PLANT PAIR';
      titleColor = '#52b788';
      mascotKey = 'char_sunflower_sunny';
      mascotFallback = '🌻';
    }

    // Companion Data
    const compId = this.saveSystem.getSelectedCompanion();
    const companion = CompanionManager.get(compId);

    // 1. Stylized Title & Logo Group (Top Left matching Image 1)
    const logoGroup = this.add.container(165, 115);
    logoGroup.setAngle(-2);

    // Red crescent moon backdrop behind title
    const redMoon = this.add.graphics();
    redMoon.fillStyle(0xd90429, 0.85);
    redMoon.fillCircle(82, 0, 28);
    redMoon.lineStyle(1.5, 0xff4d6d, 0.9);
    redMoon.strokeCircle(82, 0, 28);

    // Torii silhouette icon on red moon
    const moonTorii = this.add.text(82, 0, '⛩️', { fontSize: '26px' }).setOrigin(0.5).setAlpha(0.65);

    const titleParts = mainTitleTxt.split(' ');
    const topWord = titleParts[0] || 'FOXY';
    const bottomWord = titleParts[1] || 'PAIR';

    // FOXY / Theme Top Word (Dynamic Brush font styling)
    const titleTop = this.add.text(-42, -12, topWord, {
      fontFamily: FONT_DISPLAY,
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: currentTheme === 'japan' ? '#d90429' : titleColor,
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(217, 4, 41, 0.6)', blur: 4, stroke: false, fill: true }
    }).setOrigin(0, 0.5);

    // PAIR / Theme Bottom Word (Golden warm brush styling)
    const titleBottom = this.add.text(-22, 24, bottomWord, {
      fontFamily: FONT_UI,
      fontSize: '28px',
      fontStyle: '900',
      color: '#ffd166',
      stroke: '#9e0018',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(255, 183, 3, 0.6)', blur: 3, stroke: false, fill: true }
    }).setOrigin(0, 0.5);

    logoGroup.add([redMoon, moonTorii, titleTop, titleBottom]);

    this.tweens.add({
      targets: logoGroup,
      y: '-=3',
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. Mystic Dais & Animated Mascot Spotlight (Enlarged and Heroic)
    const daisY = 320;

    // Glowing dais rings with red & golden spiritual light matching Image 1
    const daisGlow = this.add.graphics();
    daisGlow.fillStyle(0xd90429, 0.22);
    daisGlow.fillEllipse(leftCenterX, daisY + 76, 260, 62);
    daisGlow.lineStyle(2, 0xff2a5f, 0.9);
    daisGlow.strokeEllipse(leftCenterX, daisY + 76, 235, 52);
    daisGlow.lineStyle(1.6, 0xffd166, 0.95);
    daisGlow.strokeEllipse(leftCenterX, daisY + 76, 185, 38);

    // Rotating rune effect on dais
    const runeText = this.add.text(leftCenterX, daisY + 76, '✦  ⛩️  ✦  ⛩️  ✦', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      color: '#ffd166'
    }).setOrigin(0.5).setAlpha(0.85);

    this.tweens.add({
      targets: runeText,
      alpha: { from: 0.5, to: 0.95 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Ambient floating hitodama spirit flames near dais
    const flameL = this.add.text(leftCenterX - 120, daisY + 36, '🔥', { fontSize: '20px' }).setAlpha(0.7).setTint(0xff4d6d);
    const flameR = this.add.text(leftCenterX + 100, daisY + 36, '🔥', { fontSize: '20px' }).setAlpha(0.7).setTint(0xff4d6d);
    this.tweens.add({
      targets: [flameL, flameR],
      y: '-=6',
      alpha: { from: 0.4, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Support all 3D companions: Inari Kitsune, Ryujin Dragon & Hi-no-tori Phoenix
    const is3DHinotori = compId === 'hi_no_tori' && this.textures.exists('hinotori_3d_00');
    const is3DRyujin = compId === 'ryujin_pearl' && this.textures.exists('ryujin_3d_00');
    const is3DInari = (mascotKey === 'char_inari_kitsune' || compId === 'inari_kitsune') && this.textures.exists('inari_3d_00') && !is3DRyujin && !is3DHinotori;
    const is3DMascot = is3DHinotori || is3DRyujin || is3DInari;

    let mascotObj: Phaser.GameObjects.GameObject;
    let mascot3DContainer: Phaser.GameObjects.Container | null = null;

    if (is3DMascot) {
      mascot3DContainer = this.add.container(leftCenterX, daisY);
      let current3DFrame = 0;
      const prefix3D = is3DHinotori ? 'hinotori_3d' : (is3DRyujin ? 'ryujin_3d' : 'inari_3d');
      const initial3DKey = `${prefix3D}_00`;
      const sprite3D = this.add.image(0, -14, initial3DKey);
      sprite3D.setDisplaySize(235, 235);

      mascot3DContainer.add(sprite3D);
      mascotObj = mascot3DContainer;

      const updateHome3DFrame = (f: number) => {
        current3DFrame = ((f % 18) + 18) % 18;
        const key = `${prefix3D}_${current3DFrame.toString().padStart(2, '0')}`;
        if (this.textures.exists(key)) {
          sprite3D.setTexture(key);
        }
      };

      // Gentle floating bobbing tween
      this.tweens.add({
        targets: sprite3D,
        y: -20,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Natural drag to rotate mascot in 3D
      let isDraggingHome = false;
      let dragStartXHome = 0;
      let dragStartFrameHome = 0;

      const dragZone = this.add.zone(leftCenterX, daisY - 10, 240, 220)
        .setInteractive({ useHandCursor: true });

      dragZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        isDraggingHome = true;
        dragStartXHome = pointer.x;
        dragStartFrameHome = current3DFrame;
      });

      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!isDraggingHome) return;
        const deltaX = pointer.x - dragStartXHome;
        const frameDelta = Math.floor(deltaX / 10);
        updateHome3DFrame(dragStartFrameHome + frameDelta);
      });

      const finishHomeDrag = (pointer: Phaser.Input.Pointer) => {
        if (!isDraggingHome) return;
        isDraggingHome = false;
        const totalMoved = Math.abs(pointer.x - dragStartXHome);
        if (totalMoved < 8) {
          // Minimal tap reaction: light audio + subtle micro-hop (NO scale distortion, NO intrusive modal)
          this.audio.playSelect();
          this.haptic.light();
          this.tweens.add({
            targets: sprite3D,
            y: '-=4',
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
          });
        }
      };

      dragZone.on('pointerup', finishHomeDrag);
      dragZone.on('pointerupoutside', finishHomeDrag);

      this.events.once('shutdown', () => {
        this.input.off('pointermove');
      });
    } else if (this.textures.exists(mascotKey)) {
      const sprite = this.add.image(leftCenterX, daisY - 6, mascotKey);
      sprite.setDisplaySize(210, 210);
      mascotObj = sprite;

      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        this.audio.playSelect();
        this.haptic.light();
        this.tweens.add({
          targets: sprite,
          y: '-=4',
          duration: 100,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      });
    } else {
      const fallbackTxt = this.add.text(leftCenterX, daisY + 6, mascotFallback, {
        fontSize: '72px'
      }).setOrigin(0.5);
      mascotObj = fallbackTxt;
    }

    // Floating idle tween for Mascot right above the dais
    this.tweens.add({
      targets: mascotObj,
      y: daisY - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Mascot Capsule Pill below Dais (Name only, without redundant fox emoji)
    const mascotPillContainer = this.add.container(leftCenterX, daisY + 112);

    const mascotNameTxt = this.add.text(0, 0, companion.name, {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    const mascotChevron = this.add.text(0, -0.5, '›', {
      fontFamily: FONT_UI,
      fontSize: '17px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0.5);

    const pillGap = 8;
    const contentW = mascotNameTxt.width + pillGap + mascotChevron.width;
    const pillW = Math.max(136, contentW + 36);
    const pillH = 32;

    const mascotPillBg = this.add.graphics();
    mascotPillBg.fillStyle(0x111024, 0.92);
    mascotPillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
    mascotPillBg.lineStyle(1.5, 0xff4d6d, 0.85);
    mascotPillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);

    // Center content group inside pill
    const startX = -contentW / 2;
    mascotNameTxt.setX(startX + mascotNameTxt.width / 2);
    mascotChevron.setX(startX + mascotNameTxt.width + pillGap + mascotChevron.width / 2);

    mascotPillContainer.add([mascotPillBg, mascotNameTxt, mascotChevron]);

    const mascotPillHit = this.add.zone(0, 0, pillW, pillH)
      .setInteractive({ useHandCursor: true });
    mascotPillContainer.add(mascotPillHit);

    mascotPillHit.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      CompanionModal3D.open(this, compId, (newComp) => {
        this.saveSystem.setSelectedCompanion(newComp.id);
        this.scene.restart();
      });
    });

    mascotPillHit.on('pointerover', () => {
      this.tweens.add({ targets: mascotPillContainer, scale: 1.05, duration: 80 });
      mascotPillBg.clear();
      mascotPillBg.fillStyle(0x1a1532, 0.95);
      mascotPillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
      mascotPillBg.lineStyle(2, 0xffd166, 1);
      mascotPillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
    });

    mascotPillHit.on('pointerout', () => {
      this.tweens.add({ targets: mascotPillContainer, scale: 1.0, duration: 80 });
      mascotPillBg.clear();
      mascotPillBg.fillStyle(0x111024, 0.92);
      mascotPillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
      mascotPillBg.lineStyle(1.5, 0xff4d6d, 0.85);
      mascotPillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 16);
    });

    // 4.5 Player Title Honorific Badge (ADR 0020)
    const playerTitle = this.saveSystem.getSelectedTitle();
    const titlePillContainer = this.add.container(leftCenterX, daisY + 148);

    const titleTxt = this.add.text(0, 0, `✦ ${playerTitle.toUpperCase()} ✦`, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0.5);

    const tPillW = Math.max(160, titleTxt.width + 32);
    const tPillH = 25;

    const tPillBg = this.add.graphics();
    tPillBg.fillStyle(0x18172c, 0.95);
    tPillBg.fillRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);
    tPillBg.lineStyle(1.4, 0xffd166, 0.85);
    tPillBg.strokeRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);

    titlePillContainer.add([tPillBg, titleTxt]);

    const titleHit = this.add.zone(0, 0, tPillW, tPillH)
      .setInteractive({ useHandCursor: true });
    titlePillContainer.add(titleHit);

    titleHit.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      AchievementModal.open(this, () => this.scene.restart());
    });

    titleHit.on('pointerover', () => {
      this.tweens.add({ targets: titlePillContainer, scale: 1.05, duration: 80 });
      tPillBg.clear();
      tPillBg.fillStyle(0x231f42, 0.98);
      tPillBg.fillRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);
      tPillBg.lineStyle(1.8, 0x00f5d4, 1);
      tPillBg.strokeRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);
    });

    titleHit.on('pointerout', () => {
      this.tweens.add({ targets: titlePillContainer, scale: 1.0, duration: 80 });
      tPillBg.clear();
      tPillBg.fillStyle(0x18172c, 0.95);
      tPillBg.fillRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);
      tPillBg.lineStyle(1.4, 0xffd166, 0.85);
      tPillBg.strokeRoundedRect(-tPillW / 2, -tPillH / 2, tPillW, tPillH, 12);
    });

    // 5. Left Bottom Card: Universal Encyclopedia Codex Album (Double Gold & Cyan Border)

    const albumCardW = 440;
    const albumCardH = 118;
    const albumCardX = leftCenterX;
    const albumCardY = 575;

    const albumContainer = this.add.container(albumCardX, albumCardY);

    const aBg = this.add.graphics();
    aBg.fillStyle(0x101224, 0.92);
    aBg.fillRoundedRect(-albumCardW / 2, -albumCardH / 2, albumCardW, albumCardH, 16);
    // Outer cyan border
    aBg.lineStyle(1.8, 0x00f5d4, 0.95);
    aBg.strokeRoundedRect(-albumCardW / 2, -albumCardH / 2, albumCardW, albumCardH, 16);
    // Inner gold accent line
    aBg.lineStyle(1, 0xffd166, 0.45);
    aBg.strokeRoundedRect(-albumCardW / 2 + 3, -albumCardH / 2 + 3, albumCardW - 6, albumCardH - 6, 13);

    const discoveredCount = Object.keys(save.discoveredCharacters).length;

    // Glowing Tome Book Icon & Blue Aura Glow
    const bookGlow = this.add.graphics();
    bookGlow.fillStyle(0x00f5d4, 0.2);
    bookGlow.fillCircle(-albumCardW / 2 + 48, 0, 36);

    let bookItem: Phaser.GameObjects.GameObject;
    if (this.textures.exists('album_book_icon')) {
      const bookImg = this.add.image(-albumCardW / 2 + 48, 0, 'album_book_icon');
      bookImg.setDisplaySize(64, 64);
      bookItem = bookImg;
    } else {
      bookItem = this.add.text(-albumCardW / 2 + 48, 0, '📜', { fontSize: '32px' }).setOrigin(0.5);
    }

    // Left Column Content: Starts at contentLeft with strict safe width
    const contentLeft = -albumCardW / 2 + 90;

    const aTitle = this.add.text(contentLeft, -34, '🌐 THƯ VIỆN VẠN GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#00f5d4'
    });

    const aDesc = this.add.text(contentLeft, 6, `${discoveredCount} / 495 Sinh linh`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    });

    // Visual Progress Bar Track & Fill
    const barW = 200;
    const barH = 6;
    const barY = 25;
    const pBarBg = this.add.graphics();
    pBarBg.fillStyle(0x232138, 1);
    pBarBg.fillRoundedRect(contentLeft, barY, barW, barH, 3);

    const fillRatio = Math.max(0.04, Math.min(1, discoveredCount / 495));
    const pBarFill = this.add.graphics();
    pBarFill.fillStyle(0x00f5d4, 1);
    pBarFill.fillRoundedRect(contentLeft, barY, barW * fillRatio, barH, 3);

    // Right Action Button
    const btnW = 84;
    const btnH = 36;
    const btnX = albumCardW / 2 - 52;
    const btnY = 0;

    const aBtnBg = this.add.graphics();
    aBtnBg.fillStyle(0x00f5d4, 1);
    aBtnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    aBtnBg.lineStyle(1.5, 0xa7f3d0, 0.9);
    aBtnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

    const aBtnTxt = this.add.text(btnX, btnY, 'MỞ ➔', {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#052c24'
    }).setOrigin(0.5);

    albumContainer.add([aBg, bookGlow, bookItem, aTitle, aDesc, pBarBg, pBarFill, aBtnBg, aBtnTxt]);
    albumContainer.setSize(albumCardW, albumCardH).setInteractive({ useHandCursor: true });

    albumContainer.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      this.scene.start('CollectionScene');
    });

    albumContainer.on('pointerover', () => {
      this.tweens.add({ targets: albumContainer, scale: 1.02, duration: 80 });
      aBtnBg.fillStyle(0x52b788, 1);
      aBtnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    });
    albumContainer.on('pointerout', () => {
      this.tweens.add({ targets: albumContainer, scale: 1.0, duration: 80 });
      aBtnBg.fillStyle(0x00f5d4, 1);
      aBtnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    });
  }



  /**
   * Quick Non-Intrusive Floating Toast Message
   */
  private showToast(msg: string): void {
    const toast = this.add.container(GAME_WIDTH / 2, 70).setDepth(500);
    const text = this.add.text(0, 0, msg, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    const pad = 16;
    const bg = this.add.graphics();
    bg.fillStyle(0x111024, 0.95);
    bg.fillRoundedRect(-text.width / 2 - pad, -text.height / 2 - 8, text.width + pad * 2, text.height + 16, 12);
    bg.lineStyle(1.5, 0x00f5d4, 0.9);
    bg.strokeRoundedRect(-text.width / 2 - pad, -text.height / 2 - 8, text.width + pad * 2, text.height + 16, 12);

    toast.add([bg, text]);
    toast.setAlpha(0);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: 80,
      duration: 200,
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: 70,
            duration: 250,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  /**
   * Right Section: Primary Play CTA, 2x2 Game Mode Cards & Stats Dashboard (matching Image 1)
   */
  private createGameHub(save: any): void {
    const hubX = 765;
    const hubW = 530;

    // --- 1. HERO CTA: Primary "CHƠI TIẾP" Button ---
    // --- 1. HERO CTA: Primary "CHƠI TIẾP" / "TIẾP TỤC VÁN ĐANG CHƠI" Button ---
    const activeSession = (save && typeof save.getActiveSession === 'function') ? save.getActiveSession() : null;
    const hasActiveSession = !!(activeSession && activeSession.levelId);

    const currentLvl = Math.min(save.highestLevel, 100);
    const heroY = 124;
    const heroH = 100;

    const heroBtn = this.add.container(hubX, heroY);

    const baseColor = hasActiveSession ? 0x0a1c1a : 0x160c18;
    const heroBg = this.add.graphics();
    heroBg.fillStyle(baseColor, 0.96);
    heroBg.fillRoundedRect(-hubW / 2, -heroH / 2, hubW, heroH, 18);
    heroBtn.add(heroBg);

    // Dynamic stage thumbnail / artwork for current level (Màn 2 uses stage_thumb_2!)
    let heroBgKey = '';
    if (this.textures.exists(`stage_thumb_${currentLvl}`)) {
      heroBgKey = `stage_thumb_${currentLvl}`;
    } else if (this.textures.exists(`stage_bg_${currentLvl}`)) {
      heroBgKey = `stage_bg_${currentLvl}`;
    } else {
      const inChIdx = ((currentLvl - 1) % 10) + 1;
      if (this.textures.exists(`stage_thumb_${inChIdx}`)) {
        heroBgKey = `stage_thumb_${inChIdx}`;
      } else if (this.textures.exists('bg_night_shrine')) {
        heroBgKey = 'bg_night_shrine';
      }
    }

    if (heroBgKey && this.textures.exists(heroBgKey)) {
      const thumbW = 290;
      const thumbH = heroH;
      const thumbX = hubW / 2 - thumbW / 2;
      const heroThumb = this.add.image(thumbX, 0, heroBgKey);
      heroThumb.setDisplaySize(thumbW, thumbH);
      heroThumb.setAlpha(0.85);

      const heroMaskG = this.make.graphics({});
      heroMaskG.fillStyle(0xffffff);
      heroMaskG.fillRoundedRect(hubX - hubW / 2, heroY - heroH / 2, hubW, heroH, 18);
      const geomMask = heroMaskG.createGeometryMask();
      heroThumb.setMask(geomMask);

      const fadeW = 110;
      const heroFade = this.add.graphics();
      heroFade.fillGradientStyle(
        baseColor, baseColor,
        baseColor, baseColor,
        1, 0, 1, 0
      );
      heroFade.fillRect(thumbX - thumbW / 2 - 1, -thumbH / 2, fadeW, thumbH);
      heroFade.setMask(geomMask);

      heroBtn.add([heroThumb, heroFade]);
    }

    // Glowing Neon Border (drawn on top of background image)
    const heroBorder = this.add.graphics();
    const borderColor = hasActiveSession ? 0x00f5d4 : 0xff2a5f;
    heroBorder.lineStyle(2.2, borderColor, 0.95);
    heroBorder.strokeRoundedRect(-hubW / 2, -heroH / 2, hubW, heroH, 18);

    // Torii silhouette aura on the right background of the card
    const heroToriiAura = this.add.text(hubW / 2 - 195, 0, hasActiveSession ? '⚡' : '⛩️', {
      fontSize: '44px'
    }).setOrigin(0.5).setAlpha(0.20).setTint(hasActiveSession ? 0x00f5d4 : 0xff758f);

    const sessionTitle = hasActiveSession
      ? (activeSession.levelId.startsWith('boss_') ? '👑 ĐẠI CHIẾN BOSS' : (activeSession.isSurvivalMode ? '❄️ BÃO TUYẾT' : (activeSession.isZenMode ? '🌸 ZEN VÔ TẬN' : `MÀN ${activeSession.levelId.replace(/\D/g, '') || activeSession.levelId}`)))
      : `MÀN ${currentLvl}`;

    const heroTitle = this.add.text(-hubW / 2 + 28, 0, sessionTitle, {
      fontFamily: FONT_UI,
      fontSize: '42px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Right Pill Button: [ ⚡ TIẾP TỤC ➔ ] or [ ▶ VÀO TRẬN ➔ ]
    const goBadgeW = hasActiveSession ? 160 : 156;
    const goBadgeH = 46;
    const goBadgeX = hubW / 2 - 18 - goBadgeW / 2;

    const btnBackDrop = this.add.graphics();
    btnBackDrop.fillStyle(0x000000, 0.55);
    btnBackDrop.fillRoundedRect(goBadgeX - goBadgeW / 2 - 4, -goBadgeH / 2 - 3, goBadgeW + 8, goBadgeH + 6, 24);

    const goBadgeBg = this.add.graphics();
    if (hasActiveSession) {
      goBadgeBg.fillStyle(0x00f5d4, 1);
      goBadgeBg.fillRoundedRect(goBadgeX - goBadgeW / 2, -goBadgeH / 2, goBadgeW, goBadgeH, 23);
      goBadgeBg.lineStyle(2, 0xffffff, 0.95);
      goBadgeBg.strokeRoundedRect(goBadgeX - goBadgeW / 2, -goBadgeH / 2, goBadgeW, goBadgeH, 23);
    } else {
      goBadgeBg.fillStyle(0xff9e00, 1);
      goBadgeBg.fillRoundedRect(goBadgeX - goBadgeW / 2, -goBadgeH / 2, goBadgeW, goBadgeH, 23);
      goBadgeBg.lineStyle(2, 0xffe6a7, 0.95);
      goBadgeBg.strokeRoundedRect(goBadgeX - goBadgeW / 2, -goBadgeH / 2, goBadgeW, goBadgeH, 23);
    }

    const goBadgeTxt = this.add.text(goBadgeX, 0, hasActiveSession ? '⚡ TIẾP TỤC ➔' : '▶ VÀO TRẬN ➔', {
      fontFamily: FONT_UI,
      fontSize: '16px',
      fontStyle: '900',
      color: hasActiveSession ? '#052e2b' : '#1a1005'
    }).setOrigin(0.5);

    heroBtn.add([heroBorder, heroToriiAura, heroTitle, btnBackDrop, goBadgeBg, goBadgeTxt]);
    heroBtn.setSize(hubW, heroH).setInteractive({ useHandCursor: true });

    // Subtle breathing pulse for Hero Button
    this.tweens.add({
      targets: heroBtn,
      scaleX: hasActiveSession ? 1.025 : 1.015,
      scaleY: hasActiveSession ? 1.025 : 1.015,
      duration: hasActiveSession ? 650 : 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    heroBtn.on('pointerdown', () => {
      heroBtn.disableInteractive();
      this.haptic.medium();
      this.audio.playSelect();
      this.time.delayedCall(16, () => {
        if (hasActiveSession) {
          this.scene.start('GameScene', { resumeSession: true });
        } else {
          this.scene.start('GameScene', {
            levelId: `level_${String(currentLvl).padStart(2, '0')}`,
            difficulty: 'easy',
            lives: 10
          });
        }
      });
    });

    // --- 2. 2x2 Modern Game Modes Grid ---
    const cardW = 258;
    const cardH = 146; // Increased from 124 (+22px taller!)
    const colSpacing = 270;
    const row1Y = 262; // Center of Row 1 (top 189, bottom 335)
    const row2Y = 424; // Center of Row 2 (top 351, bottom 497)

    const col1X = hubX - colSpacing / 2;
    const col2X = hubX + colSpacing / 2;

    const survivalRecord = this.saveSystem.getSurvivalRecord();

    // Mode 1: Chọn Màn Chơi (Stage Select)
    this.createModeCard({
      x: col1X,
      y: row1Y,
      width: cardW,
      height: cardH,
      icon: 'mode_campaign',
      title: 'CHỌN MÀN',
      isStackedTitle: false,
      badge: `Màn ${save.highestLevel}/100`,
      hasProgressBar: true,
      progressRatio: Math.min(1, save.highestLevel / 100),
      illustration: 'bg_night_shrine',
      primaryColor: 0x091b36,
      accentColor: 0x00d2ff,
      onClick: () => {
        this.audio.playSelect();
        this.openStageSelectModal();
      }
    });

    // Mode 2: Sinh Tồn Bão Tuyết (Survival Mode)
    this.createModeCard({
      x: col2X,
      y: row1Y,
      width: cardW,
      height: cardH,
      icon: 'mode_survival',
      title: 'SINH TỒN\nBÃO TUYẾT',
      isStackedTitle: true,
      crestEmblem: '🛡️',
      badge: `Kỷ lục: ${survivalRecord.maxWaves} Đợt`,
      badgeWidth: 104,
      illustration: 'bg_survival_snow',
      primaryColor: 0x072236,
      accentColor: 0x00f5d4,
      onClick: () => {
        this.audio.playSelect();
        this.scene.start('GameScene', { isSurvivalMode: true });
      }
    });

    // Mode 3: Chế Độ Thư Giãn (Zen Mode)
    this.createModeCard({
      x: col1X,
      y: row2Y,
      width: cardW,
      height: cardH,
      icon: 'mode_zen',
      title: 'THIỀN ĐỊNH\n(ZEN)',
      isStackedTitle: true,
      crestEmblem: '🍃',
      badge: `Kỷ lục: ${save.zenHighScore || 0}đ`,
      badgeWidth: 98,
      illustration: 'bg_zen_forest',
      primaryColor: 0x07271e,
      accentColor: 0x06d6a0,
      onClick: () => {
        this.audio.playSelect();
        this.scene.start('GameScene', { isZenMode: true });
      }
    });

    // Mode 4: Đấu Trường 16 Boss Thế Giới (World Boss Arena)
    this.createModeCard({
      x: col2X,
      y: row2Y,
      width: cardW,
      height: cardH,
      icon: 'mode_boss',
      title: 'ĐẤU TRƯỜNG\n16 BOSS',
      isStackedTitle: true,
      crestEmblem: '👹',
      badge: '16 Cự Trùm',
      badgeWidth: 100,
      illustration: 'bg_boss_arena',
      primaryColor: 0x280612,
      accentColor: 0xff0054,
      onClick: () => {
        this.audio.playBossHit();
        this.openBossArenaModal();
      }
    });

    // --- 3. Bottom Player Stats & Summary Bar (3-Column HUD Dashboard) ---
    const statsY = 574;
    const statsH = 114;
    const statsContainer = this.add.container(hubX, statsY);

    const sBg = this.add.graphics();
    sBg.fillStyle(COLORS.SURFACE_CARD, 0.92);
    sBg.fillRoundedRect(-hubW / 2, -statsH / 2, hubW, statsH, 16);
    sBg.lineStyle(1.8, COLORS.GOLD, 0.9);
    sBg.strokeRoundedRect(-hubW / 2, -statsH / 2, hubW, statsH, 16);
    sBg.lineStyle(1, COLORS.BORDER_ACCENT, 0.45);
    sBg.strokeRoundedRect(-hubW / 2 + 3, -statsH / 2 + 3, hubW - 6, statsH - 6, 13);

    const sTitle = this.add.text(0, -32, '🏆 THÀNH TÍCH CHIẾN DỊCH VẠN GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: COLOR_HEX.GOLD
    }).setOrigin(0.5);

    // Vertical column dividers
    const sDivider = this.add.graphics();
    sDivider.lineStyle(1, COLORS.BORDER_SUBTLE, 0.6);
    sDivider.lineBetween(-hubW / 6, -14, -hubW / 6, 38);
    sDivider.lineBetween(hubW / 6, -14, hubW / 6, 38);

    // Column 1: Campaign
    const col1StatsX = -hubW / 3;
    const c1Label = this.add.text(col1StatsX, -8, '⛩️ CHIẾN DỊCH', {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '800',
      color: COLOR_HEX.TEXT_MUTED,
      padding: { top: 4, bottom: 4, left: 4, right: 4 }
    }).setOrigin(0.5);
    const c1Value = this.add.text(col1StatsX, 16, `Màn ${save.highestLevel}/100 ★ ${save.stars}`, {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: COLOR_HEX.WHITE
    }).setOrigin(0.5);

    // Column 2: Survival
    const c2Label = this.add.text(0, -8, '❄️ SINH TỒN', {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '800',
      color: COLOR_HEX.TEXT_MUTED,
      padding: { top: 4, bottom: 4, left: 4, right: 4 }
    }).setOrigin(0.5);
    const c2Value = this.add.text(0, 16, `${survivalRecord.maxWaves} Đợt (${survivalRecord.highScore}đ)`, {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: COLOR_HEX.CYAN
    }).setOrigin(0.5);

    // Column 3: Zen
    const col3StatsX = hubW / 3;
    const c3Label = this.add.text(col3StatsX, -8, '🌸 THIỀN ĐỊNH', {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '800',
      color: COLOR_HEX.TEXT_MUTED,
      padding: { top: 4, bottom: 4, left: 4, right: 4 }
    }).setOrigin(0.5);
    const c3Value = this.add.text(col3StatsX, 16, `Kỷ lục: ${save.zenHighScore || 0}đ`, {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: COLOR_HEX.GOLD_WARM
    }).setOrigin(0.5);

    statsContainer.add([sBg, sTitle, sDivider, c1Label, c1Value, c2Label, c2Value, c3Label, c3Value]);
  }

  /**
   * Generates a high-DPI, anti-aliased, mathematically and optically centered circular action arrow button
   */
  private getCardArrowTexture(accentColor: number): string {
    const hexStr = accentColor.toString(16).padStart(6, '0');
    const key = `mode_card_arrow_${hexStr}`;
    if (this.textures.exists(key)) return key;

    const size = 80; // 2.22x supersampling for a 36x36 px display size
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return key;

    const center = size / 2; // 40
    const r = 32; // radius = 32px (diameter 64px)

    // 1. Soft theme accent aura / glow behind button
    const accentHex = `#${hexStr}`;
    ctx.beginPath();
    ctx.arc(center, center, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = accentHex;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 2. Obsidian glass disc background with subtle radial gradient
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    const radGrad = ctx.createRadialGradient(center - 6, center - 6, 2, center, center, r);
    radGrad.addColorStop(0, '#1c2238');
    radGrad.addColorStop(0.55, '#0c0f1c');
    radGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = radGrad;
    ctx.fill();

    // 3. Crisp anti-aliased border ring (Sleek bright white)
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.lineWidth = 3.6; // ~1.8px at 1x
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 4. Subtle inner accent rim for depth
    ctx.beginPath();
    ctx.arc(center, center, r - 3.4, 0, Math.PI * 2);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = accentHex;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 5. Razor-sharp, mathematically & optically centered vector chevron
    // Chevron geometry:
    // Vertical span: from y = 28 to y = 52 (height = 24px). Midpoint: (28 + 52) / 2 = 40.0 (EXACT vertical center)
    // Horizontal span: left endpoints at x = 35.0, right tip at x = 45.0 (width = 10px).
    // Center of mass of the two chevron arms is at EXACTLY x = 40.0, y = 40.0!
    ctx.beginPath();
    ctx.moveTo(35.0, 28);
    ctx.lineTo(45.0, 40);
    ctx.lineTo(35.0, 52);
    ctx.lineWidth = 4.8; // ~2.4px at 1x
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    this.textures.addCanvas(key, canvas);
    return key;
  }

  /**
   * Helper to create sleek, modern Game Mode cards matching Image 1
   */
  private createModeCard(opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    icon: string;
    title: string;
    isStackedTitle?: boolean;
    sub?: string;
    badge: string;
    badgeWidth?: number;
    crestEmblem?: string;
    hasProgressBar?: boolean;
    progressRatio?: number;
    illustration?: string;
    primaryColor: number;
    accentColor: number;
    onClick: () => void;
  }): void {
    const container = this.add.container(opts.x, opts.y);

    // 1. Rich Themed Base (Harmonious with theme color, NOT solid black!)
    const bg = this.add.graphics();
    bg.fillStyle(opts.primaryColor, 0.90);
    bg.fillRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);

    // Soft ambient color bloom behind icon/title
    bg.fillStyle(opts.accentColor, 0.12);
    bg.fillCircle(-opts.width / 2 + 42, -opts.height / 2 + 36, 52);

    // Glowing Neon Border
    bg.lineStyle(1.8, opts.accentColor, 0.95);
    bg.strokeRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);

    container.add(bg);

    // 2. Wide Panoramic Scenic Artwork (Spans nicely from right, beautifully blended)
    if (opts.illustration && this.textures.exists(opts.illustration)) {
      const thumbW = 144;
      const thumbH = opts.height;
      const thumbX = opts.width / 2 - thumbW / 2;
      const thumb = this.add.image(thumbX, 0, opts.illustration);
      thumb.setDisplaySize(thumbW, thumbH);
      thumb.setAlpha(0.96);

      // Mask to card's 16px rounded borders
      const cardMaskG = this.make.graphics({});
      cardMaskG.fillStyle(0xffffff);
      cardMaskG.fillRoundedRect(opts.x - opts.width / 2, opts.y - opts.height / 2, opts.width, opts.height, 16);
      const cardGeomMask = cardMaskG.createGeometryMask();
      thumb.setMask(cardGeomMask);

      // Silky smooth color gradient fade from the card's primary theme color into the illustration
      const fadeW = 48;
      const fade = this.add.graphics();
      fade.fillGradientStyle(
        opts.primaryColor, opts.primaryColor,
        opts.primaryColor, opts.primaryColor,
        1, 0, 1, 0
      );
      fade.fillRect(thumbX - thumbW / 2 - 1, -thumbH / 2, fadeW, thumbH);
      fade.setMask(cardGeomMask);

      container.add([thumb, fade]);
    }

    // 3. Floating circular action arrow on the bottom-right of the illustration (Retina Vector Button)
    const arrowSize = 36;
    const arrowX = opts.width / 2 - 25;
    const arrowY = 18;

    const arrowTexKey = this.getCardArrowTexture(opts.accentColor);
    const arrowImg = this.add.image(arrowX, arrowY, arrowTexKey);
    arrowImg.setDisplaySize(arrowSize, arrowSize);

    container.add(arrowImg);

    // 4. Header: Icon + Title
    const hasIconTex = this.textures.exists(opts.icon);
    const iconX = -opts.width / 2 + 30;
    const iconY = -opts.height / 2 + 42;
    const iconSize = 38;

    const iconObj: Phaser.GameObjects.GameObject = hasIconTex
      ? this.add.image(iconX, iconY, opts.icon).setDisplaySize(iconSize, iconSize)
      : this.add.text(iconX, iconY, opts.icon, {
          fontSize: '26px',
          padding: { top: 6, bottom: 6, left: 6, right: 6 }
        }).setOrigin(0.5);

    if (opts.isStackedTitle) {
      // 2-line title (SINH TỒN BÃO TUYẾT, THIỀN ĐỊNH (ZEN), ĐẤU TRƯỜNG 16 BOSS)
      const title = this.add.text(-opts.width / 2 + 56, -opts.height / 2 + 42, opts.title, {
        fontFamily: FONT_UI,
        fontSize: '17px',
        fontStyle: '900',
        color: '#ffffff',
        lineSpacing: 2
      }).setOrigin(0, 0.5);

      container.add([iconObj, title]);
    } else {
      // Single line title (CHỌN MÀN)
      const title = this.add.text(-opts.width / 2 + 56, -opts.height / 2 + 42, opts.title, {
        fontFamily: FONT_UI,
        fontSize: '19px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      container.add([iconObj, title]);
    }

    // 5. Bottom Indicators matching Image 3
    if (opts.hasProgressBar) {
      // Card 1: Combined Capsule with "Màn 1/100" and Cyan Progress Bar inside
      const capW = 138;
      const capH = 32;
      const capX = -opts.width / 2 + 16 + capW / 2;
      const capY = opts.height / 2 - 22;

      const capBg = this.add.graphics();
      capBg.fillStyle(0x061426, 0.92);
      capBg.fillRoundedRect(capX - capW / 2, capY - capH / 2, capW, capH, 9);
      capBg.lineStyle(1.2, opts.accentColor, 0.85);
      capBg.strokeRoundedRect(capX - capW / 2, capY - capH / 2, capW, capH, 9);

      const capTxt = this.add.text(capX, capY - 5, opts.badge, {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      const barW = 120;
      const barH = 5;
      const barX = capX - barW / 2;
      const barY = capY + 5;

      const pTrack = this.add.graphics();
      pTrack.fillStyle(0x040d1a, 0.95);
      pTrack.fillRoundedRect(barX, barY, barW, barH, 2.5);

      const ratio = typeof opts.progressRatio === 'number' ? opts.progressRatio : 0.01;
      const pFill = this.add.graphics();
      pFill.fillStyle(0x00f5d4, 1);
      pFill.fillRoundedRect(barX, barY, Math.max(4, barW * ratio), barH, 2.5);

      container.add([capBg, capTxt, pTrack, pFill]);
    } else {
      // Cards 2, 3, 4: Small circular crest emblem + Capsule Pill
      const crestR = 14;
      const crestX = -opts.width / 2 + 18 + crestR;
      const crestY = opts.height / 2 - 22;

      const crestBg = this.add.graphics();
      crestBg.fillStyle(0x08101a, 0.92);
      crestBg.fillCircle(crestX, crestY, crestR);
      crestBg.lineStyle(1.2, opts.accentColor, 0.85);
      crestBg.strokeCircle(crestX, crestY, crestR);

      const crestIcon = this.add.text(crestX, crestY, opts.crestEmblem || '🛡️', {
        fontSize: '14px',
        padding: { top: 4, bottom: 4, left: 4, right: 4 }
      }).setOrigin(0.5);

      const badgeW = opts.badgeWidth || 98;
      const badgeH = 28;
      const badgeX = crestX + crestR + 6 + badgeW / 2;
      const badgeY = crestY;

      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0x08101a, 0.92);
      badgeBg.fillRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 14);
      badgeBg.lineStyle(1.2, opts.accentColor, 0.85);
      badgeBg.strokeRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 14);

      const badgeTxt = this.add.text(badgeX, badgeY, opts.badge, {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        fontStyle: '900',
        color: `#${opts.accentColor.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);

      container.add([crestBg, crestIcon, badgeBg, badgeTxt]);
    }

    container.setSize(opts.width, opts.height).setInteractive({ useHandCursor: true });

    const baseArrowScale = arrowImg.scaleX;
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.025, duration: 90 });
      this.tweens.add({ targets: arrowImg, scale: baseArrowScale * 1.1, duration: 90 });
      bg.lineStyle(2.2, 0xffffff, 1);
      bg.strokeRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 90 });
      this.tweens.add({ targets: arrowImg, scale: baseArrowScale, duration: 90 });
      bg.lineStyle(1.8, opts.accentColor, 0.9);
      bg.strokeRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);
    });

    container.on('pointerdown', () => {
      this.haptic.light();
      opts.onClick();
    });
  }

  /**
   * Wallpaper Selector Modal (4 Backgrounds matching user images)
   */
  public openWallpaperModal(): void {
    if (this.wallpaperModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    const modal = this.add.container(width / 2, height / 2).setDepth(450);
    this.wallpaperModalContainer = modal;

    // Dark backdrop overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x05030a, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const cardW = 760;
    const cardH = 460;
    const card = this.add.graphics();
    card.fillStyle(0x0e0d1c, 0.96);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2, 0xffd700, 0.95);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(1, 0x3a86ff, 0.45);
    card.strokeRoundedRect(-cardW / 2 + 4, -cardH / 2 + 4, cardW - 8, cardH - 8, 16);
    modal.add(card);

    // Header Title
    const title = this.add.text(0, -cardH / 2 + 42, '🖼️ CHỌN ẢNH NỀN LINH GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '21px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    modal.add(title);

    // Close button
    const closeBtn = this.add.container(cardW / 2 - 32, -cardH / 2 + 32);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x221f38, 0.9);
    closeBg.fillCircle(0, 0, 16);
    closeBg.lineStyle(1.5, 0xff4d6d, 0.85);
    closeBg.strokeCircle(0, 0, 16);

    const closeTxt = this.add.text(0, 0, '✕', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#ff4d6d'
    }).setOrigin(0.5);

    closeBtn.add([closeBg, closeTxt]);
    closeBtn.setSize(32, 32).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.wallpaperModalContainer = null;
    });
    modal.add(closeBtn);

    // 4 Wallpapers (2 columns x 2 rows)
    const wallpapers = [
      {
        key: 'bg_night_shrine',
        name: 'Đêm Phù Tang (Mặc định)',
        tag: '⛩️ Cổ Tự Trăng Tròn & Đèn Lồng',
        desc: 'Đền Shinto linh thiêng dưới ánh trăng rằm'
      },
      {
        key: 'bg_boss_arena',
        name: 'Đại Ngục Hỏa Long',
        tag: '🔥 Hỏa Ngục & Cự Trùm Titan',
        desc: 'Vương quốc nham thạch của đại ma đầu'
      },
      {
        key: 'bg_zen_forest',
        name: 'Rừng Thiêng Zen',
        tag: '🌸 Thác Nước & Torii Rừng Xanh',
        desc: 'Nắng sớm chiếu rọi thác nước an yên'
      },
      {
        key: 'bg_survival_snow',
        name: 'Bão Tuyết Băng Hà',
        tag: '❄️ Băng Động & Cực Hàn Băng Giá',
        desc: 'Động băng vĩnh cửu giữa bão tuyết mù mịt'
      }
    ];

    const currentWp = this.saveSystem.getSelectedWallpaper();
    const wpCardW = 340;
    const wpCardH = 150;
    const wpColSpacing = 360;
    const wpRowSpacing = 165;
    const startY = -cardH / 2 + 165;

    wallpapers.forEach((wp, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const wpX = (col === 0 ? -wpColSpacing / 2 : wpColSpacing / 2);
      const wpY = startY + row * wpRowSpacing;

      const wpCard = this.add.container(wpX, wpY);
      const isSelected = currentWp === wp.key;

      const wpBg = this.add.graphics();
      wpBg.fillStyle(0x16152b, 0.95);
      wpBg.fillRoundedRect(-wpCardW / 2, -wpCardH / 2, wpCardW, wpCardH, 14);
      wpBg.lineStyle(1.8, isSelected ? 0x00f5d4 : 0x3a4060, isSelected ? 1 : 0.8);
      wpBg.strokeRoundedRect(-wpCardW / 2, -wpCardH / 2, wpCardW, wpCardH, 14);
      wpCard.add(wpBg);

      // Thumbnail Image on Left with crisp rounded frame
      if (this.textures.exists(wp.key)) {
        const thumbW = 126;
        const thumbH = wpCardH - 18;
        const thumbX = -wpCardW / 2 + thumbW / 2 + 10;
        const thumb = this.add.image(thumbX, 0, wp.key);
        thumb.setDisplaySize(thumbW, thumbH);
        thumb.setAlpha(1.0);

        const thumbMask = this.make.graphics({});
        thumbMask.fillStyle(0xffffff);
        thumbMask.fillRoundedRect(modal.x + wpX + thumbX - thumbW / 2, modal.y + wpY - thumbH / 2, thumbW, thumbH, 10);
        thumb.setMask(thumbMask.createGeometryMask());

        const thumbBorder = this.add.graphics();
        thumbBorder.lineStyle(1.5, isSelected ? 0x00f5d4 : 0x5a6275, 0.9);
        thumbBorder.strokeRoundedRect(thumbX - thumbW / 2, -thumbH / 2, thumbW, thumbH, 10);

        wpCard.add([thumb, thumbBorder]);
      }

      // Title & Text on Right
      const textLeft = -wpCardW / 2 + 150;
      const nameTxt = this.add.text(textLeft, -wpCardH / 2 + 20, wp.name, {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '900',
        color: isSelected ? '#00f5d4' : '#ffffff'
      });

      const tagTxt = this.add.text(textLeft, -wpCardH / 2 + 42, wp.tag, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd166'
      });

      const descTxt = this.add.text(textLeft, -wpCardH / 2 + 64, wp.desc, {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        color: '#94a3b8',
        wordWrap: { width: 175 }
      });

      // Action Button
      const btnW = 100;
      const btnH = 28;
      const btnX = textLeft + btnW / 2;
      const btnY = wpCardH / 2 - 24;

      const actBtn = this.add.graphics();
      actBtn.fillStyle(isSelected ? 0x06d6a0 : 0x221f38, 1);
      actBtn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      actBtn.lineStyle(1.5, isSelected ? 0x00f5d4 : 0xffd166, 0.9);
      actBtn.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

      const actTxt = this.add.text(btnX, btnY, isSelected ? '✓ ĐANG DÙNG' : 'ÁP DỤNG ➔', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: isSelected ? '#052c24' : '#ffd166'
      }).setOrigin(0.5);

      wpCard.add([nameTxt, tagTxt, descTxt, actBtn, actTxt]);
      wpCard.setSize(wpCardW, wpCardH).setInteractive({ useHandCursor: true });

      wpCard.on('pointerdown', () => {
        this.saveSystem.setSelectedWallpaper(wp.key);
        this.audio.playVictory();
        this.haptic.medium();

        // Crossfade background image
        if (this.bgImage && this.textures.exists(wp.key)) {
          this.tweens.add({
            targets: this.bgImage,
            alpha: 0.3,
            duration: 180,
            onComplete: () => {
              this.bgImage.setTexture(wp.key);
              this.tweens.add({
                targets: this.bgImage,
                alpha: 1,
                duration: 250
              });
            }
          });
        }

        modal.destroy();
        this.wallpaperModalContainer = null;
        this.showToast(`Đã đổi ảnh nền: ${wp.name} ✨`);
      });

      wpCard.on('pointerover', () => {
        this.tweens.add({ targets: wpCard, scale: 1.025, duration: 80 });
        wpBg.lineStyle(2, 0xffffff, 1);
        wpBg.strokeRoundedRect(-wpCardW / 2, -wpCardH / 2, wpCardW, wpCardH, 14);
      });

      wpCard.on('pointerout', () => {
        this.tweens.add({ targets: wpCard, scale: 1.0, duration: 80 });
        wpBg.lineStyle(1.8, isSelected ? 0x00f5d4 : 0x3a4060, isSelected ? 1 : 0.8);
        wpBg.strokeRoundedRect(-wpCardW / 2, -wpCardH / 2, wpCardW, wpCardH, 14);
      });

      modal.add(wpCard);
    });

    // Animate modal appearance
    modal.setScale(0.92);
    modal.setAlpha(0);
    this.tweens.add({
      targets: modal,
      scale: 1,
      alpha: 1,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Rulebook Guide Modal
   */
  private openRulebookModal(): void {
    if (this.rulesModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    const modal = this.add.container(width / 2, height / 2).setDepth(300);
    this.rulesModalContainer = modal;

    // Dark backdrop overlay
    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    // Modal Card
    const cardW = 860;
    const cardH = 540;
    const card = this.add.graphics();
    card.fillStyle(0x161526, 1);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    card.lineStyle(2, 0x00f5d4, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    modal.add(card);

    // Header
    const title = this.add.text(0, -cardH / 2 + 40, '⛩️ CẨM NANG & CƠ CHẾ NỐI THÚ CỔ ĐIỂN', {
      fontFamily: FONT_UI,
      fontSize: '22px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -cardH / 2 + 70, 'Hiểu rõ quy tắc để chinh phục 100 màn chơi & Bách Quỷ Dạ Hành', {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5);
    modal.add(sub);

    // 4 Rule Sections
    const rules = [
      {
        icon: '⚡',
        title: 'QUY TẮC 2 KHÚC GẬP (CỔ ĐIỂN)',
        color: '#ffd700',
        desc: 'Nối 2 linh thú giống nhau bằng tối đa 3 đoạn thẳng (2 góc vuông 90°). Đường nối không được bị cản bởi bất kỳ ô linh thú nào khác.'
      },
      {
        icon: '⏱️',
        title: 'CỘNG THỜI GIAN & TRỌNG LỰC',
        color: '#00f5d4',
        desc: 'Mỗi cặp nối thành công được cộng ngay +2 giây vào thanh thời gian. Ô trống sau khi ăn sẽ bị hút dồn theo hướng trọng lực đặc trưng của từng màn.'
      },
      {
        icon: '🪨',
        title: 'HỆ THỐNG VẬT CẢN & CẠM BẪY',
        color: '#ff758f',
        desc: '🪨 Đá: Chặn ô hoàn toàn (cần combo cạnh phá vỡ). 🌿 Bụi gai & 🕸️ Mạng nhện: Trói thẻ linh thú (gỡ bằng match/combo). 🛡️ Song sắt: Giam giữ thẻ (chỉ phá từ bên ngoài).'
      },
      {
        icon: '🌙',
        title: 'GIỜ BÁCH QUỶ DẠ HÀNH (RUSH)',
        color: '#c77dff',
        desc: 'Đạt Combo x4 hoặc vào 30s cuối: Nhạc Taiko dồn dập, Laser xuyên thấu mọi vật cản trong 10 giây kèm x3 Điểm thưởng cực khủng!'
      }
    ];

    const colW = 390;
    const itemH = 105;
    const startY = -cardH / 2 + 105;

    rules.forEach((r, idx) => {
      const isRightCol = idx % 2 === 1;
      const rowIdx = Math.floor(idx / 2);

      const itemX = isRightCol ? 15 : -cardW / 2 + 30;
      const itemY = startY + rowIdx * (itemH + 18);

      const rBg = this.add.graphics();
      rBg.fillStyle(0x1e1c33, 0.95);
      rBg.fillRoundedRect(itemX, itemY, colW, itemH, 14);
      rBg.lineStyle(1.5, 0x3d3559, 0.7);
      rBg.strokeRoundedRect(itemX, itemY, colW, itemH, 14);

      const iconObj = this.add.text(itemX + 20, itemY + 22, r.icon, { fontSize: '24px' });
      const titleObj = this.add.text(itemX + 54, itemY + 16, r.title, {
        fontFamily: FONT_UI,
        fontSize: '15px',
        fontStyle: '900',
        color: r.color
      });

      const descObj = this.add.text(itemX + 20, itemY + 44, r.desc, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        color: '#ced4da',
        wordWrap: { width: colW - 36 }
      });

      modal.add([rBg, iconObj, titleObj, descObj]);
    });

    // Buttons Tray (Wiki 30 Thần Khí + Quay Lại)
    const btnWiki = this.add.container(-130, cardH / 2 - 45);
    const wBg = this.add.graphics();
    wBg.fillStyle(0x0e3b34, 1);
    wBg.fillRoundedRect(-115, -22, 230, 44, 14);
    wBg.lineStyle(2, 0x00f5d4, 0.9);
    wBg.strokeRoundedRect(-115, -22, 230, 44, 14);
    const wTxt = this.add.text(0, 0, '⛩️ BÁCH KHOA 30 THẦN KHÍ', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    btnWiki.add([wBg, wTxt]);
    btnWiki.setSize(230, 44).setInteractive({ useHandCursor: true });
    btnWiki.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.rulesModalContainer = null;
      this.openRelicsWikiModal(1);
    });
    modal.add(btnWiki);

    const closeBtn = this.add.container(130, cardH / 2 - 45);
    const cBg = this.add.graphics();
    cBg.fillStyle(0xe63946, 1);
    cBg.fillRoundedRect(-115, -22, 230, 44, 14);
    const cTxt = this.add.text(0, 0, 'ĐÃ HIỂU & QUAY LẠI ➔', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(230, 44).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.rulesModalContainer = null;
    });
    modal.add(closeBtn);
  }

  /**
   * Bách Khoa Toàn Thư 30 Thần Khí (Relic Codex Modal matching Image 1)
   */
  public openRelicsWikiModal(pageOrChapter: number = 0, initialWorld: string = 'all'): void {
    if (this.relicsWikiModalContainer) {
      this.relicsWikiModalContainer.destroy();
      this.relicsWikiModalContainer = null;
    }

    this.relicsWikiModalContainer = RelicCodexModal.open(
      this,
      pageOrChapter,
      initialWorld,
      () => {
        this.relicsWikiModalContainer = null;
      }
    );
  }

  /**
   * Bảng Tra Cứu Tỷ Lệ Rớt Chiến Lợi Phẩm 10 Chương (Loot Table Modal)
   */
  public openLootTableModal(chapterNum: number = 1, selectedLevel?: number): void {
    this.openStageLootCodexModal(chapterNum, selectedLevel);
  }

  /**
   * 🗺️ Dedicated Stage Loot Codex & 100-Map Almanac Modal
   * Features: Full 100 stages breakdown, mathematical formulas, item distributions,
   * single-stage deep view, and full 10-stage comparison table mode.
   */
  public openStageLootCodexModal(initialChapter: number = 1, initialLevel?: number): void {
    if (this.lootTableModalContainer) {
      this.lootTableModalContainer.destroy();
      this.lootTableModalContainer = null;
    }

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    let curChapter = Math.max(1, Math.min(10, initialChapter));
    let curLevel = initialLevel ? Math.max(1, Math.min(100, initialLevel)) : (curChapter - 1) * 10 + 1;
    let viewMode: 'detail' | 'table' = 'detail';
    let formulaModal: Phaser.GameObjects.Container | null = null;

    const modal = this.add.container(width / 2, height / 2).setDepth(320);
    this.lootTableModalContainer = modal;

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.92);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const cardW = 1000;
    const cardH = 630;

    const bg = this.add.graphics();
    bg.fillStyle(0x0f111a, 0.98);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    bg.lineStyle(2.5, 0xffd700, 0.95);
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    bg.lineStyle(1.2, 0x4338ca, 0.6);
    bg.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, 16);
    modal.add(bg);

    // Header Title
    const title = this.add.text(0, -cardH / 2 + 25, '🗺️ SỔ TAY 100 MÀN CHƠI & CHIẾN LỢI PHẨM (STAGE CODEX)', {
      fontFamily: FONT_UI,
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -cardH / 2 + 48, 'Phép tính toán học minh bạch • Phân rã 100 Map • Tỷ lệ Mảnh Thần Thú, Vật Phẩm, EXP & Vàng', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    modal.add(sub);

    // --- 10 CHAPTER TABS ---
    const chIcons = ['⛩️', '🌊', '🏜️', '🏔️', '🏛️', '⚡', '🌪️', '🌌', '👹', '🐉'];
    const chShortNames = ['Nhật', 'Thủy', 'Ai Cập', 'Kim', 'Hy Lạp', 'Lôi', 'Sấm', 'Hư', 'Dạ', 'Bát Kỳ'];
    const tabY = -cardH / 2 + 78;
    const tabW = 86;
    const tabH = 26;
    const tabGap = 8;
    const totalTabsW = 10 * tabW + 9 * tabGap;
    const tabStartX = -totalTabsW / 2 + tabW / 2;

    const chapterTabsContainer = this.add.container(0, 0);
    modal.add(chapterTabsContainer);

    const mainContentContainer = this.add.container(0, 0);
    modal.add(mainContentContainer);

    const renderChapterTabs = () => {
      chapterTabsContainer.removeAll(true);
      for (let ch = 1; ch <= 10; ch++) {
        const tx = tabStartX + (ch - 1) * (tabW + tabGap);
        const isActive = ch === curChapter;
        const tabBtn = this.add.container(tx, tabY);

        const tBg = this.add.graphics();
        if (isActive) {
          tBg.fillStyle(0xffd700, 1);
          tBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          tBg.lineStyle(1.4, 0xffffff, 1);
          tBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        } else {
          tBg.fillStyle(0x191a2e, 0.9);
          tBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          tBg.lineStyle(1.2, 0x4338ca, 0.6);
          tBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        }

        const tText = this.add.text(0, 0, `${chIcons[ch - 1]} Ch.${ch}`, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: isActive ? '#0f111a' : '#cbd5e1'
        }).setOrigin(0.5);

        tabBtn.add([tBg, tText]);
        tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
        tabBtn.on('pointerdown', () => {
          if (curChapter !== ch) {
            this.audio.playSelect();
            curChapter = ch;
            curLevel = (curChapter - 1) * 10 + 1;
            renderChapterTabs();
            renderMainContent();
          }
        });

        chapterTabsContainer.add(tabBtn);
      }
    };

    // --- FORMULA POPUP OVERLAY ---
    const showFormulaModal = () => {
      if (formulaModal) {
        formulaModal.destroy();
        formulaModal = null;
      }

      const fCont = this.add.container(0, 0).setDepth(330);
      formulaModal = fCont;
      modal.add(fCont);

      const fOverlay = this.add.graphics();
      fOverlay.fillStyle(0x000000, 0.85);
      fOverlay.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      fOverlay.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
      fCont.add(fOverlay);

      const fBoxW = 760;
      const fBoxH = 460;
      const fBox = this.add.graphics();
      fBox.fillStyle(0x131124, 0.98);
      fBox.fillRoundedRect(-fBoxW / 2, -fBoxH / 2, fBoxW, fBoxH, 16);
      fBox.lineStyle(2, 0x00f5d4, 1);
      fBox.strokeRoundedRect(-fBoxW / 2, -fBoxH / 2, fBoxW, fBoxH, 16);
      fCont.add(fBox);

      const fTitle = this.add.text(0, -fBoxH / 2 + 30, '📐 CÔNG THỨC TOÁN HỌC & THUẬT TOÁN PHẦN THƯỞNG', {
        fontFamily: FONT_UI,
        fontSize: '17px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      const formulas = [
        {
          label: '1. KINH NGHIỆM CƠ BẢN (Base EXP):',
          desc: 'BaseEXP(Level) = 10 + ⌊ (Level - 1) × 0.4 ⌋\n• Chạy mượt mà từ 10 EXP (Màn 1) đến 49 EXP (Màn 100).'
        },
        {
          label: '2. VÀNG CƠ BẢN (Base Coins):',
          desc: 'BaseCoins(Level) = 35 + ⌊ (Level - 1) × 1.65 ⌋\n• Chạy từ 35 Xu (Màn 1) đến 198 Xu (Màn 100).'
        },
        {
          label: '3. HỆ SỐ LOẠI MÀN (Stage Multipliers):',
          desc: '• Màn Thường: x1.0 EXP & Xu\n• Mini-Boss (Màn 5, 15, 25...): x1.25 EXP, x1.25 Xu, Tăng tỷ lệ rớt đồ +1.5%\n• Đại Trùm (Màn 10, 20...): x1.6 EXP, x1.5 Xu, Mảnh Trùm rớt 8% - 30%!'
        },
        {
          label: '4. ĐỘ KHÓ & SAO CHIẾN THẮNG:',
          desc: '• 🟢 Dễ: x1.0 EXP/Xu  |  🟡 Vừa: x1.25 EXP, x1.2 Xu  |  🔴 Khó: x1.6 EXP, x1.5 Xu\n• Thưởng Sao: 1⭐ x1.0 (+0 Xu), 2⭐ x1.15 (+20 Xu), 3⭐ x1.3 (+50 Xu, Boss +100 Xu & +1 Mảnh Khó)'
        }
      ];

      let fy = -fBoxH / 2 + 75;
      formulas.forEach((f) => {
        const l = this.add.text(-fBoxW / 2 + 36, fy, f.label, {
          fontFamily: FONT_UI,
          fontSize: '13px',
          fontStyle: '900',
          color: '#ffd166'
        });
        const d = this.add.text(-fBoxW / 2 + 36, fy + 20, f.desc, {
          fontFamily: FONT_UI,
          fontSize: '11.5px',
          fontStyle: 'bold',
          color: '#e2e8f0',
          lineSpacing: 4
        });
        fCont.add([l, d]);
        fy += 78;
      });

      // Close button for formula popup
      const fCloseBtn = this.add.container(0, fBoxH / 2 - 32);
      const fcBg = this.add.graphics();
      fcBg.fillStyle(0x3a3a52, 1);
      fcBg.fillRoundedRect(-70, -15, 140, 30, 8);
      fcBg.lineStyle(1.2, 0x00f5d4, 0.9);
      fcBg.strokeRoundedRect(-70, -15, 140, 30, 8);
      const fcTxt = this.add.text(0, 0, '✕ ĐÃ HIỂU', { fontFamily: FONT_UI, fontSize: '12px', fontStyle: '900', color: '#00f5d4' }).setOrigin(0.5);
      fCloseBtn.add([fcBg, fcTxt]);
      fCloseBtn.setSize(140, 30).setInteractive({ useHandCursor: true });
      fCloseBtn.on('pointerdown', () => {
        this.audio.playSelect();
        fCont.destroy();
        formulaModal = null;
      });

      fCont.add([fTitle, fCloseBtn]);
    };

    // --- MAIN RENDER FUNCTION ---
    const renderMainContent = () => {
      mainContentContainer.removeAll(true);
      const chCfg = LootManager.CHAPTERS[curChapter - 1];
      const stages = LootManager.getChapterStages(curChapter);

      // Clamp curLevel to current chapter
      if (curLevel < chCfg.levelRange[0] || curLevel > chCfg.levelRange[1]) {
        curLevel = chCfg.levelRange[0];
      }

      // Banner Strip: Chapter Info + View Switch Buttons
      const bannerY = -cardH / 2 + 114;
      const bannerBg = this.add.graphics();
      bannerBg.fillStyle(0x16182a, 0.95);
      bannerBg.fillRoundedRect(-cardW / 2 + 25, bannerY - 16, cardW - 50, 32, 8);
      bannerBg.lineStyle(1.2, 0x3a86ff, 0.7);
      bannerBg.strokeRoundedRect(-cardW / 2 + 25, bannerY - 16, cardW - 50, 32, 8);
      mainContentContainer.add(bannerBg);

      const mainCompIcon = CompanionManager.get(chCfg.mainCompanionId)?.icon || '🦊';
      const subCompIcon = CompanionManager.get(chCfg.subCompanionId)?.icon || '🐾';
      const chInfoTxt = this.add.text(-cardW / 2 + 40, bannerY, `CHƯƠNG ${curChapter}: ${chCfg.chapterName.toUpperCase()} • LINH THÚ: ${mainCompIcon} ${chCfg.mainCompanionName} (CHÍNH) • ${subCompIcon} ${chCfg.subCompanionName} (PHỤ)`, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0, 0.5);
      mainContentContainer.add(chInfoTxt);

      // Mode Switch Button (Detail vs Table)
      const modeBtnX = cardW / 2 - 190;
      const modeBtn = this.add.container(modeBtnX, bannerY);
      const mBg = this.add.graphics();
      mBg.fillStyle(0x272445, 1);
      mBg.fillRoundedRect(-65, -12, 130, 24, 6);
      mBg.lineStyle(1.2, 0xffd166, 0.85);
      mBg.strokeRoundedRect(-65, -12, 130, 24, 6);
      const mTxt = this.add.text(0, 0, viewMode === 'detail' ? '📊 XEM BẢNG 10 MÀN' : '🔍 XEM TỪNG MÀN', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: '#ffd166'
      }).setOrigin(0.5);
      modeBtn.add([mBg, mTxt]);
      modeBtn.setSize(130, 24).setInteractive({ useHandCursor: true });
      modeBtn.on('pointerdown', () => {
        this.audio.playSelect();
        viewMode = viewMode === 'detail' ? 'table' : 'detail';
        renderMainContent();
      });
      mainContentContainer.add(modeBtn);

      // Formula Help Button
      const formulaBtnX = cardW / 2 - 65;
      const formulaBtn = this.add.container(formulaBtnX, bannerY);
      const fbBg = this.add.graphics();
      fbBg.fillStyle(0x19273c, 1);
      fbBg.fillRoundedRect(-48, -12, 96, 24, 6);
      fbBg.lineStyle(1.2, 0x00f5d4, 0.85);
      fbBg.strokeRoundedRect(-48, -12, 96, 24, 6);
      const fbTxt = this.add.text(0, 0, '📐 CÔNG THỨC', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);
      formulaBtn.add([fbBg, fbTxt]);
      formulaBtn.setSize(96, 24).setInteractive({ useHandCursor: true });
      formulaBtn.on('pointerdown', () => {
        this.audio.playSelect();
        showFormulaModal();
      });
      mainContentContainer.add(formulaBtn);

      if (viewMode === 'detail') {
        renderDetailView(stages);
      } else {
        renderTableView(stages);
      }
    };

    // --- VIEW 1: SINGLE STAGE DETAIL WITH 4 CARDS ---
    const renderDetailView = (stages: any[]) => {
      // Stage Selector Strip (10 stages)
      const stripY = -cardH / 2 + 158;
      const sBtnW = 88;
      const sBtnH = 38;
      const sGap = 8;
      const totalStripW = 10 * sBtnW + 9 * sGap;
      const stripStartX = -totalStripW / 2 + sBtnW / 2;

      stages.forEach((st, idx) => {
        const sx = stripStartX + idx * (sBtnW + sGap);
        const isSelected = st.levelNumber === curLevel;
        const sBtn = this.add.container(sx, stripY);

        const bGfx = this.add.graphics();
        if (isSelected) {
          bGfx.fillStyle(0x2d1f4d, 1);
          bGfx.fillRoundedRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 8);
          bGfx.lineStyle(2, 0x00f5d4, 1);
          bGfx.strokeRoundedRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 8);
        } else {
          bGfx.fillStyle(st.stageType === 'boss' ? 0x2d1522 : st.stageType === 'miniboss' ? 0x221a2e : 0x141524, 0.9);
          bGfx.fillRoundedRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 8);
          bGfx.lineStyle(1.2, st.stageType === 'boss' ? 0xff476f : st.stageType === 'miniboss' ? 0xffd166 : 0x3a3d5e, 0.8);
          bGfx.strokeRoundedRect(-sBtnW / 2, -sBtnH / 2, sBtnW, sBtnH, 8);
        }

        const tagIcon = st.stageType === 'boss' ? '👑' : st.stageType === 'miniboss' ? '⚔️' : '🟢';
        const l1 = this.add.text(0, -6, `${tagIcon} Màn ${st.levelNumber}`, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: isSelected ? '#00f5d4' : '#ffffff'
        }).setOrigin(0.5);

        const l2 = this.add.text(0, 9, `${st.itemIcon} ${st.itemName.substring(0, 8)}`, {
          fontFamily: FONT_UI,
          fontSize: '9px',
          fontStyle: 'bold',
          color: isSelected ? '#ffd166' : '#94a3b8'
        }).setOrigin(0.5);

        sBtn.add([bGfx, l1, l2]);
        sBtn.setSize(sBtnW, sBtnH).setInteractive({ useHandCursor: true });
        sBtn.on('pointerdown', () => {
          this.audio.playSelect();
          curLevel = st.levelNumber;
          renderMainContent();
        });

        mainContentContainer.add(sBtn);
      });

      // Selected Stage Header
      const activeStage = LootManager.getStageLootConfig(curLevel);
      const headerY = -cardH / 2 + 198;
      const typeLabel = activeStage.stageType === 'boss'
        ? '👑 ĐẠI TRÙM THẾ GIỚI (BOSS CỰC HẠN)'
        : activeStage.stageType === 'miniboss'
        ? '⚔️ THỬ THÁCH ĐẶC BIỆT (MINI-BOSS)'
        : '🟢 MÀN CHIẾN DỊCH TIÊU CHUẨN';

      const sTitle = this.add.text(0, headerY, `${activeStage.stageName.toUpperCase()}`, {
        fontFamily: FONT_UI,
        fontSize: '15px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      const sSub = this.add.text(0, headerY + 18, `Phân loại: ${typeLabel} • Hệ số EXP: x${activeStage.stageExpMult} • Hệ số Xu: x${activeStage.stageCoinMult}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd166'
      }).setOrigin(0.5);
      mainContentContainer.add([sTitle, sSub]);

      // 4 Mathematical Reward Cards
      const colW = 226;
      const colH = 265;
      const startX = -357;
      const gapX = 238;
      const colY = -cardH / 2 + 365;

      // Card 1: EXP
      const c1 = this.add.container(startX, colY);
      const b1 = this.add.graphics();
      b1.fillStyle(0x15162a, 0.98);
      b1.fillRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      b1.lineStyle(1.6, 0x00f5d4, 0.9);
      b1.strokeRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      c1.add(b1);

      const t1 = this.add.text(0, -colH / 2 + 18, '⚡ KINH NGHIỆM (EXP)', { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#00f5d4' }).setOrigin(0.5);
      const math1 = this.add.text(0, -colH / 2 + 38, `Base: 10 + ⌊(${curLevel}-1)*0.4⌋ = ${activeStage.baseExp}`, { fontFamily: FONT_UI, fontSize: '9.5px', fontStyle: 'bold', color: '#94a3b8' }).setOrigin(0.5);

      const rates1 = [
        { label: '🟢 DỄ:', val: `+${activeStage.rewardsMatrix.easy.exp} EXP`, sub: 'x1.0 Multiplier', color: '#06d6a0' },
        { label: '🟡 VỪA:', val: `+${activeStage.rewardsMatrix.medium.exp} EXP`, sub: 'x1.25 Multiplier', color: '#ffd166' },
        { label: '🔴 KHÓ:', val: `+${activeStage.rewardsMatrix.hard.exp} EXP`, sub: 'x1.6 Multiplier', color: '#ef476f' },
        { label: '⭐ 3 SAO:', val: activeStage.rewardsMatrix.threeStarExpBonus, sub: `Đạt ~${Math.round(activeStage.rewardsMatrix.hard.exp * 1.3)} EXP`, color: '#ffd700' }
      ];

      rates1.forEach((r, idx) => {
        const ry = -colH / 2 + 70 + idx * 46;
        const rBox = this.add.graphics();
        rBox.fillStyle(0x0e101c, 0.9);
        rBox.fillRoundedRect(-colW / 2 + 10, ry - 16, colW - 20, 38, 6);
        c1.add(rBox);

        const lTxt = this.add.text(-colW / 2 + 18, ry + 2, r.label, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: r.color }).setOrigin(0, 0.5);
        const vTxt = this.add.text(colW / 2 - 18, ry - 4, r.val, { fontFamily: FONT_UI, fontSize: '12px', fontStyle: '900', color: '#ffffff' }).setOrigin(1, 0.5);
        const sTxt = this.add.text(colW / 2 - 18, ry + 10, r.sub, { fontFamily: FONT_UI, fontSize: '9px', fontStyle: 'bold', color: '#8d99ae' }).setOrigin(1, 0.5);
        c1.add([lTxt, vTxt, sTxt]);
      });
      c1.add([t1, math1]);
      mainContentContainer.add(c1);

      // Card 2: Coins
      const c2 = this.add.container(startX + gapX, colY);
      const b2 = this.add.graphics();
      b2.fillStyle(0x15162a, 0.98);
      b2.fillRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      b2.lineStyle(1.6, 0xffd166, 0.9);
      b2.strokeRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      c2.add(b2);

      const t2 = this.add.text(0, -colH / 2 + 18, '💰 VÀNG (XU THƯỞNG)', { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#ffd166' }).setOrigin(0.5);
      const math2 = this.add.text(0, -colH / 2 + 38, `Base: 35 + ⌊(${curLevel}-1)*1.65⌋ = ${activeStage.baseCoins}`, { fontFamily: FONT_UI, fontSize: '9.5px', fontStyle: 'bold', color: '#94a3b8' }).setOrigin(0.5);

      const rates2 = [
        { label: '🟢 DỄ:', val: `+${formatCurrency(activeStage.rewardsMatrix.easy.coins)} Xu`, sub: 'x1.0 Multiplier', color: '#06d6a0' },
        { label: '🟡 VỪA:', val: `+${formatCurrency(activeStage.rewardsMatrix.medium.coins)} Xu`, sub: 'x1.2 Multiplier', color: '#ffd166' },
        { label: '🔴 KHÓ:', val: `+${formatCurrency(activeStage.rewardsMatrix.hard.coins)} Xu`, sub: 'x1.5 Multiplier', color: '#ef476f' },
        { label: '⭐ THƯỞNG:', val: activeStage.stageType === 'boss' ? `+${formatCurrency(100)} Xu` : `+${formatCurrency(50)} Xu`, sub: activeStage.rewardsMatrix.threeStarCoinBonus, color: '#ffd700' }
      ];

      rates2.forEach((r, idx) => {
        const ry = -colH / 2 + 70 + idx * 46;
        const rBox = this.add.graphics();
        rBox.fillStyle(0x0e101c, 0.9);
        rBox.fillRoundedRect(-colW / 2 + 10, ry - 16, colW - 20, 38, 6);
        c2.add(rBox);

        const lTxt = this.add.text(-colW / 2 + 18, ry + 2, r.label, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: r.color }).setOrigin(0, 0.5);
        const vTxt = this.add.text(colW / 2 - 18, ry - 4, r.val, { fontFamily: FONT_UI, fontSize: '12px', fontStyle: '900', color: '#ffffff' }).setOrigin(1, 0.5);
        const sTxt = this.add.text(colW / 2 - 18, ry + 10, r.sub, { fontFamily: FONT_UI, fontSize: '9px', fontStyle: 'bold', color: '#8d99ae' }).setOrigin(1, 0.5);
        c2.add([lTxt, vTxt, sTxt]);
      });
      c2.add([t2, math2]);
      mainContentContainer.add(c2);

      // Card 3: Companion Shards
      const c3 = this.add.container(startX + gapX * 2, colY);
      const b3 = this.add.graphics();
      b3.fillStyle(0x15162a, 0.98);
      b3.fillRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      b3.lineStyle(1.6, 0xff758f, 0.9);
      b3.strokeRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      c3.add(b3);

      const t3 = this.add.text(0, -colH / 2 + 18, '🐾 MẢNH LINH THÚ', { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#ff758f' }).setOrigin(0.5);
      const sub3 = this.add.text(0, -colH / 2 + 38, `Cần 20 Mảnh Triệu Hồi`, { fontFamily: FONT_UI, fontSize: '9.5px', fontStyle: 'bold', color: '#ffd166' }).setOrigin(0.5);

      const rates3 = [
        { label: '💎 CHÍNH:', val: activeStage.mainCompanionName, sub: `D:${activeStage.rewardsMatrix.easy.mainShardPct} V:${activeStage.rewardsMatrix.medium.mainShardPct} K:${activeStage.rewardsMatrix.hard.mainShardPct}`, color: '#00f5d4' },
        { label: '✨ PHỤ:', val: activeStage.subCompanionName, sub: `D:${activeStage.rewardsMatrix.easy.subShardPct} V:${activeStage.rewardsMatrix.medium.subShardPct} K:${activeStage.rewardsMatrix.hard.subShardPct}`, color: '#ff758f' },
        { label: '🐾 LỘI NGƯỢC:', val: 'x2.0 MẢNH', sub: 'Mèo Nekomata (<15s)', color: '#ffd700' },
        { label: '👑 ĐẠI TRÙM:', val: activeStage.stageType === 'boss' ? '30% KHÓ' : 'TẬP TRUNG', sub: activeStage.stageType === 'boss' ? '3⭐ Khó thưởng 1 Mảnh' : 'Chỉ rớt ở Màn 10', color: '#ef476f' }
      ];

      rates3.forEach((r, idx) => {
        const ry = -colH / 2 + 70 + idx * 46;
        const rBox = this.add.graphics();
        rBox.fillStyle(0x0e101c, 0.9);
        rBox.fillRoundedRect(-colW / 2 + 10, ry - 16, colW - 20, 38, 6);
        c3.add(rBox);

        const lTxt = this.add.text(-colW / 2 + 18, ry + 2, r.label, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: r.color }).setOrigin(0, 0.5);
        const vTxt = this.add.text(colW / 2 - 18, ry - 4, r.val, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#ffffff' }).setOrigin(1, 0.5);
        const sTxt = this.add.text(colW / 2 - 18, ry + 10, r.sub, { fontFamily: FONT_UI, fontSize: '8.5px', fontStyle: 'bold', color: '#8d99ae' }).setOrigin(1, 0.5);
        c3.add([lTxt, vTxt, sTxt]);
      });
      c3.add([t3, sub3]);
      mainContentContainer.add(c3);

      // Card 4: Booster Items
      const c4 = this.add.container(startX + gapX * 3, colY);
      const b4 = this.add.graphics();
      b4.fillStyle(0x15162a, 0.98);
      b4.fillRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      b4.lineStyle(1.6, 0x7209b7, 0.9);
      b4.strokeRoundedRect(-colW / 2, -colH / 2, colW, colH, 12);
      c4.add(b4);

      const t4 = this.add.text(0, -colH / 2 + 18, '🎁 VẬT PHẨM TRỢ GIÚP', { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#c77dff' }).setOrigin(0.5);
      const math4 = this.add.text(0, -colH / 2 + 38, `${activeStage.itemIcon} ${activeStage.itemName}`, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: '#ffffff' }).setOrigin(0.5);

      const rates4 = [
        { label: '🟢 DỄ:', val: activeStage.rewardsMatrix.easy.itemPct, sub: 'Nhận +1 vật phẩm', color: '#06d6a0' },
        { label: '🟡 VỪA:', val: activeStage.rewardsMatrix.medium.itemPct, sub: 'Nhận +1 vật phẩm', color: '#ffd166' },
        { label: '🔴 KHÓ:', val: activeStage.rewardsMatrix.hard.itemPct, sub: 'Nhận +1 vật phẩm', color: '#ef476f' },
        { label: '💎 DI VẬT:', val: activeStage.stageType === 'boss' ? '100% RƠI' : '0% MÀN NÀY', sub: activeStage.stageType === 'boss' ? 'Cổ Vật lần đầu' : 'Chỉ có ở Trùm', color: '#00f5d4' }
      ];

      rates4.forEach((r, idx) => {
        const ry = -colH / 2 + 70 + idx * 46;
        const rBox = this.add.graphics();
        rBox.fillStyle(0x0e101c, 0.9);
        rBox.fillRoundedRect(-colW / 2 + 10, ry - 16, colW - 20, 38, 6);
        c4.add(rBox);

        const lTxt = this.add.text(-colW / 2 + 18, ry + 2, r.label, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: r.color }).setOrigin(0, 0.5);
        const vTxt = this.add.text(colW / 2 - 18, ry - 4, r.val, { fontFamily: FONT_UI, fontSize: '12px', fontStyle: '900', color: '#ffffff' }).setOrigin(1, 0.5);
        const sTxt = this.add.text(colW / 2 - 18, ry + 10, r.sub, { fontFamily: FONT_UI, fontSize: '9px', fontStyle: 'bold', color: '#8d99ae' }).setOrigin(1, 0.5);
        c4.add([lTxt, vTxt, sTxt]);
      });
      c4.add([t4, math4]);
      mainContentContainer.add(c4);
    };

    // --- VIEW 2: 10-STAGE COMPARISON MATRIX TABLE ---
    const renderTableView = (stages: any[]) => {
      const tableStartY = -cardH / 2 + 148;
      const rowH = 26;
      const tW = cardW - 60;

      // Header row
      const hBg = this.add.graphics();
      hBg.fillStyle(0x272445, 1);
      hBg.fillRoundedRect(-tW / 2, tableStartY, tW, rowH, 6);
      mainContentContainer.add(hBg);

      const headers = [
        { title: 'MÀN', x: -tW / 2 + 35 },
        { title: 'TÊN MÀN CHƠI', x: -tW / 2 + 175 },
        { title: 'EXP (D / V / K)', x: -tW / 2 + 390 },
        { title: 'XU (D / V / K)', x: -tW / 2 + 520 },
        { title: 'MẢNH CHÍNH', x: -tW / 2 + 645 },
        { title: 'MẢNH PHỤ', x: -tW / 2 + 760 },
        { title: 'VẬT PHẨM (K)', x: -tW / 2 + 875 }
      ];

      headers.forEach((h) => {
        const ht = this.add.text(h.x, tableStartY + rowH / 2, h.title, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: '900',
          color: '#ffd166'
        }).setOrigin(0.5);
        mainContentContainer.add(ht);
      });

      // 10 Stage Rows
      stages.forEach((st, idx) => {
        const ry = tableStartY + (idx + 1) * (rowH + 3);
        const isSelected = st.levelNumber === curLevel;
        const rowCont = this.add.container(0, ry);

        const rBg = this.add.graphics();
        if (isSelected) {
          rBg.fillStyle(0x2d1f4d, 1);
          rBg.fillRoundedRect(-tW / 2, 0, tW, rowH, 4);
          rBg.lineStyle(1.4, 0x00f5d4, 1);
          rBg.strokeRoundedRect(-tW / 2, 0, tW, rowH, 4);
        } else {
          rBg.fillStyle(idx % 2 === 0 ? 0x131526 : 0x181a2e, 0.95);
          rBg.fillRoundedRect(-tW / 2, 0, tW, rowH, 4);
        }
        rowCont.add(rBg);

        const tag = st.stageType === 'boss' ? '👑' : st.stageType === 'miniboss' ? '⚔️' : '🟢';
        const c1 = this.add.text(-tW / 2 + 35, rowH / 2, `${tag} ${st.levelNumber}`, { fontFamily: FONT_UI, fontSize: '11px', fontStyle: '900', color: isSelected ? COLOR_HEX.CYAN : COLOR_HEX.WHITE }).setOrigin(0.5);
        const c2 = this.add.text(-tW / 2 + 80, rowH / 2, st.stageName.replace(/👑 |⚔️ /g, '').substring(0, 26), { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: 'bold', color: COLOR_HEX.TEXT_PRIMARY }).setOrigin(0, 0.5);
        const c3 = this.add.text(-tW / 2 + 390, rowH / 2, `${st.rewardsMatrix.easy.exp} / ${st.rewardsMatrix.medium.exp} / ${st.rewardsMatrix.hard.exp}`, { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: '900', color: SEMANTIC_COLORS.REWARD.EXP_HEX }).setOrigin(0.5);
        const c4 = this.add.text(-tW / 2 + 520, rowH / 2, `${formatCurrency(st.rewardsMatrix.easy.coins)} / ${formatCurrency(st.rewardsMatrix.medium.coins)} / ${formatCurrency(st.rewardsMatrix.hard.coins)}`, { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: '800', color: SEMANTIC_COLORS.REWARD.COIN_HEX }).setOrigin(0.5);
        const c5 = this.add.text(-tW / 2 + 645, rowH / 2, `${st.rewardsMatrix.hard.mainShardPct} (K)`, { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: 'bold', color: SEMANTIC_COLORS.REWARD.MAIN_SHARD_HEX }).setOrigin(0.5);
        const c6 = this.add.text(-tW / 2 + 760, rowH / 2, st.stageType === 'boss' ? '—' : `${st.rewardsMatrix.hard.subShardPct} (K)`, { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: 'bold', color: SEMANTIC_COLORS.REWARD.SUB_SHARD_HEX }).setOrigin(0.5);
        const c7 = this.add.text(-tW / 2 + 875, rowH / 2, `${st.itemIcon} ${st.rewardsMatrix.hard.itemPct}`, { fontFamily: FONT_UI, fontSize: '10.5px', fontStyle: '900', color: SEMANTIC_COLORS.REWARD.ITEM_HEX }).setOrigin(0.5);

        rowCont.add([c1, c2, c3, c4, c5, c6, c7]);
        rowCont.setSize(tW, rowH).setInteractive(new Phaser.Geom.Rectangle(-tW / 2, 0, tW, rowH), Phaser.Geom.Rectangle.Contains);
        rowCont.on('pointerdown', () => {
          this.audio.playSelect();
          curLevel = st.levelNumber;
          viewMode = 'detail';
          renderMainContent();
        });

        mainContentContainer.add(rowCont);
      });
    };

    renderChapterTabs();
    renderMainContent();

    // Bottom Footer Tip & Close Button
    const tipTxt = this.add.text(0, cardH / 2 - 58, '💡 Mẹo: Bấm vào từng màn để soi rõ phép tính EXP/Vàng hoặc chuyển sang dạng Bảng đối chiếu 10 màn!', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '800',
      color: '#ffd166'
    }).setOrigin(0.5);
    modal.add(tipTxt);

    const closeBtnY = cardH / 2 - 28;
    const closeBtn = this.add.container(0, closeBtnY);
    const cBg = this.add.graphics();
    cBg.fillStyle(0x3a3a52, 1);
    cBg.fillRoundedRect(-80, -15, 160, 30, 8);
    cBg.lineStyle(1.4, 0xffd700, 0.85);
    cBg.strokeRoundedRect(-80, -15, 160, 30, 8);
    const cTxt = this.add.text(0, 0, '✕ ĐÓNG', { fontFamily: FONT_UI, fontSize: '12.5px', fontStyle: '900', color: '#ffffff' }).setOrigin(0.5);
    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(160, 30).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.lootTableModalContainer = null;
    });
    modal.add(closeBtn);
  }

  /**
   * 16-Theme Interactive Gallery Modal (4x4 Grid)
   */
  private openThemeSelectorModal(): void {
    if (this.themeModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const currentTheme = this.saveSystem.getSelectedTheme();
    const themes = MainMenuScene.THEMES;

    const modal = this.add.container(width / 2, height / 2).setDepth(300);
    this.themeModalContainer = modal;

    // Dark backdrop overlay
    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    overlay.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.themeModalContainer = null;
    });

    // Modal Card
    const cardW = 860;
    const cardH = 540;
    const card = this.add.graphics();
    card.fillStyle(0x141324, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    card.lineStyle(2, 0x00f5d4, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    modal.add(card);

    // Header
    const title = this.add.text(0, -cardH / 2 + 35, '🎨 BỘ CHỦ ĐỀ & THẦN THÚ LINH GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -cardH / 2 + 62, '16 Phong cách Onet Cổ Điển • Click vào bất kỳ chủ đề nào để chuyển đổi giao diện', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      color: '#adb5bd'
    }).setOrigin(0.5);
    modal.add(sub);

    // 4x4 Grid of 16 Themes
    const itemW = 190;
    const itemH = 82;
    const colSpacing = 202;
    const rowSpacing = 92;
    const startX = -((4 - 1) * colSpacing) / 2; // -303
    const startY = -cardH / 2 + 120; // -150

    themes.forEach((th, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const itemX = startX + col * colSpacing;
      const itemY = startY + row * rowSpacing;
      const isAct = th.id === currentTheme;

      const itemContainer = this.add.container(itemX, itemY);

      const itemBg = this.add.graphics();
      if (isAct) {
        itemBg.fillStyle(0x211f3d, 1);
        itemBg.fillRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
        itemBg.lineStyle(2, th.color, 1);
        itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
      } else {
        itemBg.fillStyle(0x19182b, 0.9);
        itemBg.fillRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
        itemBg.lineStyle(1.5, 0x363352, 0.7);
        itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
      }

      // Icon
      const iconTxt = this.add.text(-itemW / 2 + 22, -10, th.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);

      // Name
      const nameTxt = this.add.text(-itemW / 2 + 42, -22, th.label, {
        fontFamily: FONT_UI,
        fontSize: '16px',
        fontStyle: '900',
        color: isAct ? '#ffffff' : '#e0e1dd'
      }).setOrigin(0, 0);

      // Tag
      const tagTxt = this.add.text(-itemW / 2 + 42, -2, th.tag, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0, 0);

      // Status Pill
      const statusPill = this.add.text(-itemW / 2 + 42, 17, isAct ? '✓ ĐANG CHỌN' : 'CHỌN ➔', {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: '900',
        color: isAct ? th.hex : '#4cc9f0'
      }).setOrigin(0, 0);

      itemContainer.add([itemBg, iconTxt, nameTxt, tagTxt, statusPill]);
      itemContainer.setSize(itemW, itemH).setInteractive({ useHandCursor: true });

      itemContainer.on('pointerover', () => {
        this.tweens.add({ targets: itemContainer, scale: 1.04, duration: 80 });
        itemBg.lineStyle(2, th.color, 1);
        itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
      });

      itemContainer.on('pointerout', () => {
        this.tweens.add({ targets: itemContainer, scale: 1.0, duration: 80 });
        if (!isAct) {
          itemBg.lineStyle(1.5, 0x363352, 0.7);
          itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 14);
        }
      });

      itemContainer.on('pointerdown', () => {
        if (th.id === currentTheme) {
          modal.destroy();
          this.themeModalContainer = null;
          return;
        }
        this.audio.playVictory();
        this.haptic.medium();
        this.saveSystem.setSelectedTheme(th.id);
        modal.destroy();
        this.themeModalContainer = null;
        this.scene.restart();
      });

      modal.add(itemContainer);
    });

    // Close Button
    const closeBtn = this.add.container(0, cardH / 2 - 38);
    const cBg = this.add.graphics();
    cBg.fillStyle(0x2a2845, 1);
    cBg.fillRoundedRect(-110, -20, 220, 40, 14);
    cBg.lineStyle(1.5, 0x5a557d, 0.8);
    cBg.strokeRoundedRect(-110, -20, 220, 40, 14);

    const cTxt = this.add.text(0, 0, 'ĐÓNG [ ✕ ]', {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(200, 36).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.themeModalContainer = null;
    });

    closeBtn.on('pointerover', () => {
      cBg.fillStyle(0xe63946, 1);
      cBg.fillRoundedRect(-100, -18, 200, 36, 12);
    });
    closeBtn.on('pointerout', () => {
      cBg.fillStyle(0x2a2845, 1);
      cBg.fillRoundedRect(-100, -18, 200, 36, 12);
    });

    modal.add(closeBtn);
  }

  /**
   * Floating notification toast for locked difficulties or game alerts
   */
  private showFloatingToast(message: string, color: number = 0xff595e): void {
    const toast = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(400);
    const text = this.add.text(0, 0, message, {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const padX = 36;
    const padY = 18;
    const bgW = text.width + padX;
    const bgH = text.height + padY;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e101c, 0.98);
    bg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 14);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, 14);

    toast.add([bg, text]);
    toast.setAlpha(0);
    toast.setScale(0.85);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: GAME_HEIGHT / 2 - 16,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: GAME_HEIGHT / 2 - 36,
            duration: 250,
            ease: 'Quad.easeIn',
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  /**
   * Stage Select (1 - 100) Modal with Ornate Shinto Shrine / Torii Frame, Direct Difficulty Tabs & Asian Lacquer Aesthetics
   */
  private openStageSelectModal(targetChapter?: number): void {
    if (this.stageModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const save = this.saveSystem || SaveSystem.getInstance();

    this.stageSelectChapter = targetChapter ? Math.max(1, Math.min(10, targetChapter)) : Math.max(1, Math.min(10, Math.ceil(save.getHighestLevel() / 10)));

    const modal = this.add.container(width / 2, height / 2).setDepth(200);
    this.stageModalContainer = modal;
    let renderChapterFunc: () => void = () => {};

    const { width: screenW } = getScreenDimensions();

    // 1. Fullscreen Scenic Wallpaper Backdrop (Completely hides main menu buttons & cards!)
    const savedWallpaper = this.saveSystem.getSelectedWallpaper();
    const bgKey = this.textures.exists(savedWallpaper) ? savedWallpaper : (this.textures.exists('bg_night_shrine') ? 'bg_night_shrine' : 'bg_main_torii');
    if (this.textures.exists(bgKey)) {
      const modalBg = this.add.image(0, 0, bgKey);
      modalBg.setDisplaySize(screenW, height);
      modal.add(modalBg);
    }

    // Atmospheric dark vignette overlay matching Image 1
    const overlay = this.add.graphics();
    overlay.fillStyle(0x04060f, 0.65);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    // --- 1. TOP CREST: KITSUNE MASK FLANKED BY ORNAMENTAL GOLDEN CLOUDS ---
    const crestY = -276;
    if (this.textures.exists('stage_modal_crest')) {
      const crestImg = this.add.image(0, crestY, 'stage_modal_crest');
      crestImg.setDisplaySize(280, 62);
      modal.add(crestImg);
    } else if (this.textures.exists('avatar_inari')) {
      const maskCrest = this.add.image(0, crestY + 3, 'avatar_inari');
      maskCrest.setDisplaySize(44, 44);
      modal.add(maskCrest);
    } else {
      const maskTxt = this.add.text(0, crestY, '🦊', { fontSize: '28px' }).setOrigin(0.5);
      modal.add(maskTxt);
    }

    // --- 2. GRAND GOLDEN FANTASY TITLE ---
    const headerY = -236;
    const title = this.add.text(0, headerY, 'CHIẾN DỊCH VIỄN CHINH • 100 MÀN CHƠI', {
      fontFamily: FONT_DISPLAY,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#1a0d00',
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0, 0, 0, 0.75)', blur: 2, fill: true, stroke: false }
    }).setOrigin(0.5);
    modal.add(title);

    // --- 3. UNIFIED DIFFICULTY SELECTOR & LOOT BUTTON CAPSULE ---
    const diffY = -196;
    const diffTabsContainer = this.add.container(0, diffY);
    modal.add(diffTabsContainer);

    const diffConfigs: { key: DifficultyLevel; label: string; activeColor: number; activeHex: string }[] = [
      { key: 'easy', label: '🟢 DỄ', activeColor: 0x00b4d8, activeHex: '#00b4d8' },
      { key: 'medium', label: '🟡 VỪA', activeColor: 0xffb703, activeHex: '#ffb703' },
      { key: 'hard', label: '🔴 KHÓ', activeColor: 0xff2a5f, activeHex: '#ff2a5f' }
    ];

    const dCapsuleW = 580;
    const dCapsuleH = 36;
    const capsuleBg = this.add.graphics();
    capsuleBg.fillStyle(0x080e1c, 0.88);
    capsuleBg.fillRoundedRect(-dCapsuleW / 2, -dCapsuleH / 2, dCapsuleW, dCapsuleH, 18);
    capsuleBg.lineStyle(1.4, 0x1e2b46, 0.9);
    capsuleBg.strokeRoundedRect(-dCapsuleW / 2, -dCapsuleH / 2, dCapsuleW, dCapsuleH, 18);
    // Divider line between diff pills and loot button
    capsuleBg.lineStyle(1.4, 0x25334d, 0.85);
    capsuleBg.lineBetween(80, -11, 80, 11);
    diffTabsContainer.add(capsuleBg);

    const dTabW = 86;
    const dTabH = 28;
    const dSpacing = 92;
    const tabBgs: Phaser.GameObjects.Graphics[] = [];
    const tabTexts: Phaser.GameObjects.Text[] = [];

    const updateDiffTabs = () => {
      diffConfigs.forEach((d, idx) => {
        const isUnlocked = save.isChapterDifficultyUnlocked(this.stageSelectChapter, d.key);
        const isSelected = this.stageSelectDifficulty === d.key;
        const bg = tabBgs[idx];
        const txt = tabTexts[idx];

        bg.clear();
        if (isSelected) {
          if (d.key === 'easy') {
            // Emerald/Teal gradient look for Easy
            bg.fillStyle(0x06d6a0, 1);
            bg.fillRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            bg.lineStyle(1.5, 0x5eead4, 0.95);
            bg.strokeRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            txt.setColor('#ffffff');
          } else if (d.key === 'medium') {
            bg.fillStyle(0xffb703, 1);
            bg.fillRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            bg.lineStyle(1.5, 0xffe082, 0.95);
            bg.strokeRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            txt.setColor('#0f172a');
          } else {
            bg.fillStyle(0xff2a5f, 1);
            bg.fillRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            bg.lineStyle(1.5, 0xffa0bc, 0.95);
            bg.strokeRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
            txt.setColor('#ffffff');
          }
          txt.setText(d.label);
          txt.setFontStyle('900');
        } else if (isUnlocked) {
          bg.fillStyle(0x111929, 0.6);
          bg.fillRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
          txt.setText(d.label);
          txt.setColor('#94a3b8');
          txt.setFontStyle('bold');
        } else {
          bg.fillStyle(0x0e1420, 0.4);
          bg.fillRoundedRect(-dTabW / 2, -dTabH / 2, dTabW, dTabH, 14);
          txt.setText(`${d.label} 🔒`);
          txt.setColor('#475569');
          txt.setFontStyle('bold');
        }
      });
    };

    diffConfigs.forEach((d, idx) => {
      const posX = -190 + idx * dSpacing;
      const tabC = this.add.container(posX, 0);
      const bg = this.add.graphics();
      const txt = this.add.text(0, 0, d.label, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      tabC.add([bg, txt]);
      tabC.setSize(dTabW, dTabH).setInteractive({ useHandCursor: true });
      tabC.on('pointerdown', () => {
        const isUnlocked = save.isChapterDifficultyUnlocked(this.stageSelectChapter, d.key);
        if (!isUnlocked) {
          this.audio.playTick();
          if (d.key === 'medium') {
            this.showFloatingToast(`🔒 Cần vượt hết 10 màn Dễ Chương ${this.stageSelectChapter} để mở Vừa!`, 0xffd166);
          } else if (d.key === 'hard') {
            this.showFloatingToast(`🔒 Cần vượt hết 10 màn Vừa Chương ${this.stageSelectChapter} để mở Khó!`, 0xef476f);
          }
          return;
        }
        if (this.stageSelectDifficulty !== d.key) {
          this.audio.playSelect();
          this.stageSelectDifficulty = d.key;
          updateDiffTabs();
          renderChapterFunc();
        }
      });

      tabBgs.push(bg);
      tabTexts.push(txt);
      diffTabsContainer.add(tabC);
    });

    // Button: 🎁 TRA CỨU RỚT ĐỒ ✦
    // Button: 🎁 TRA CỨU RỚT ĐỒ ✦
    const lootBtnW = 180;
    const lootBtnH = 28;
    const lootBtn = this.add.container(188, 0);
    const lBg = this.add.graphics();
    // Deep royal velvet lacquer base
    lBg.fillStyle(0x181028, 0.96);
    lBg.fillRoundedRect(-lootBtnW / 2, -lootBtnH / 2, lootBtnW, lootBtnH, 14);
    // 3D glass gloss
    lBg.fillStyle(0xffffff, 0.1);
    lBg.fillRoundedRect(-lootBtnW / 2, -lootBtnH / 2, lootBtnW, 10, { tl: 14, tr: 14, bl: 0, br: 0 });
    // Dual border: amethyst purple stroke + inner warm gold accent
    lBg.lineStyle(1.5, 0xc084fc, 0.85);
    lBg.strokeRoundedRect(-lootBtnW / 2, -lootBtnH / 2, lootBtnW, lootBtnH, 14);
    lBg.lineStyle(1.0, 0xf59e0b, 0.45);
    lBg.strokeRoundedRect(-lootBtnW / 2 + 2, -lootBtnH / 2 + 2, lootBtnW - 4, lootBtnH - 4, 12);

    const lTxt = this.add.text(0, 0, '🎁 TRA CỨU RỚT ĐỒ ✦', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#0d0718',
      strokeThickness: 2.5
    }).setOrigin(0.5);

    lootBtn.add([lBg, lTxt]);
    lootBtn.setSize(lootBtnW, lootBtnH).setInteractive({ useHandCursor: true });
    lootBtn.on('pointerover', () => this.tweens.add({ targets: lootBtn, scale: 1.05, duration: 80 }));
    lootBtn.on('pointerout', () => this.tweens.add({ targets: lootBtn, scale: 1.0, duration: 80 }));
    lootBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.openLootTableModal(this.stageSelectChapter);
    });
    diffTabsContainer.add(lootBtn);

    // --- 4. CHAPTER NAVIGATION BAR & OBLONG AMBIENT PLATE ---
    const navY = -152;
    const chBannerW = 590;
    const chBannerH = 34;

    // Center Chapter Bar Plate
    const navBar = this.add.graphics();
    navBar.fillStyle(0x091222, 0.92);
    navBar.fillRoundedRect(-chBannerW / 2, navY - chBannerH / 2, chBannerW, chBannerH, 17);
    navBar.lineStyle(1.4, 0x38bdf8, 0.7);
    navBar.strokeRoundedRect(-chBannerW / 2, navY - chBannerH / 2, chBannerW, chBannerH, 17);
    modal.add(navBar);

    // Prev Chapter Button
    const navBtnW = 146;
    const navBtnH = 34;
    const prevBtnX = -chBannerW / 2 - navBtnW / 2 - 12;
    const prevBtn = this.add.container(prevBtnX, navY);
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0x0d1527, 0.96);
    prevBg.fillRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, navBtnH, 17);
    prevBg.fillStyle(0xffffff, 0.08);
    prevBg.fillRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, 12, { tl: 17, tr: 17, bl: 0, br: 0 });
    prevBg.lineStyle(1.6, 0x38bdf8, 0.8);
    prevBg.strokeRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, navBtnH, 17);
    prevBg.lineStyle(1.0, 0xffd166, 0.4);
    prevBg.strokeRoundedRect(-navBtnW / 2 + 2, -navBtnH / 2 + 2, navBtnW - 4, navBtnH - 4, 15);

    const prevTxt = this.add.text(0, 0, '◀ CHƯƠNG TRƯỚC', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#080c18',
      strokeThickness: 2.5
    }).setOrigin(0.5);
    prevBtn.add([prevBg, prevTxt]);
    prevBtn.setSize(navBtnW, navBtnH).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerover', () => {
      if (this.stageSelectChapter > 1) {
        this.tweens.add({ targets: prevBtn, scale: 1.05, duration: 90 });
      }
    });
    prevBtn.on('pointerout', () => {
      this.tweens.add({ targets: prevBtn, scale: 1.0, duration: 90 });
    });
    modal.add(prevBtn);

    // Next Chapter Button
    const nextBtnX = chBannerW / 2 + navBtnW / 2 + 12;
    const nextBtn = this.add.container(nextBtnX, navY);
    const nextBg = this.add.graphics();
    nextBg.fillStyle(0x0d1527, 0.96);
    nextBg.fillRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, navBtnH, 17);
    nextBg.fillStyle(0xffffff, 0.08);
    nextBg.fillRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, 12, { tl: 17, tr: 17, bl: 0, br: 0 });
    nextBg.lineStyle(1.6, 0x38bdf8, 0.8);
    nextBg.strokeRoundedRect(-navBtnW / 2, -navBtnH / 2, navBtnW, navBtnH, 17);
    nextBg.lineStyle(1.0, 0xffd166, 0.4);
    nextBg.strokeRoundedRect(-navBtnW / 2 + 2, -navBtnH / 2 + 2, navBtnW - 4, navBtnH - 4, 15);

    const nextTxt = this.add.text(0, 0, 'CHƯƠNG SAU ▶', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#080c18',
      strokeThickness: 2.5
    }).setOrigin(0.5);
    nextBtn.add([nextBg, nextTxt]);
    nextBtn.setSize(navBtnW, navBtnH).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerover', () => {
      if (this.stageSelectChapter < 10) {
        this.tweens.add({ targets: nextBtn, scale: 1.05, duration: 90 });
      }
    });
    nextBtn.on('pointerout', () => {
      this.tweens.add({ targets: nextBtn, scale: 1.0, duration: 90 });
    });
    modal.add(nextBtn);

    // Center Chapter Info Banner Text
    const chBannerTxt = this.add.text(0, navY - 6, '', {
      fontFamily: FONT_DISPLAY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    modal.add(chBannerTxt);

    // Progress Bar inside Chapter Plate
    const chProgressBar = this.add.graphics();
    modal.add(chProgressBar);
    const chProgressTxt = this.add.text(182, navY + 6.5, '', {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    modal.add(chProgressTxt);

    // --- 5. 10 STAGE CARDS GRID (2 ROWS X 5 COLUMNS) ---
    const stagesGrid = this.add.container(0, 0);
    modal.add(stagesGrid);

    const cardW = 216;
    const cardH = 164; // Increased from 152 (+12px taller for generous breathing room!)
    const colSpacing = 232;
    const rowY1 = -46;
    const rowY2 = +124;

    const cleanStageTitle = (rawTitle: string): string => {
      let t = rawTitle.includes(':') ? rawTitle.split(':')[1]?.trim() : rawTitle;
      t = t.replace(/\s*\([^)]*\)/g, ''); // strip parentheses details
      t = t.replace(/-no-Orochi/gi, ''); // clean Yamata boss title
      if (t.length > 22) t = t.slice(0, 21) + '…';
      return t;
    };

    const renderChapter = () => {
      stagesGrid.removeAll(true);

      // Auto-fallback if the currently selected difficulty is locked for this chapter
      if (!save.isChapterDifficultyUnlocked(this.stageSelectChapter, this.stageSelectDifficulty)) {
        this.stageSelectDifficulty = 'easy';
      }

      updateDiffTabs();

      const ch = LevelManager.getChapterConfig(this.stageSelectChapter);
      chBannerTxt.setText(`${ch.title} (Màn ${ch.startLevel} - ${ch.endLevel})  •  Trùm: 👹 ${ch.bossName}`);
      chBannerTxt.setColor('#ffffff');

      // Count cleared stages in this chapter
      let clearedInChapter = 0;
      for (let s = ch.startLevel; s <= ch.endLevel; s++) {
        if (save.isDifficultyCompleted(`level_${s}`, this.stageSelectDifficulty) || (this.stageSelectDifficulty === 'easy' && s < save.getHighestLevel())) {
          clearedInChapter++;
        }
      }

      chProgressBar.clear();
      // Progress track
      chProgressBar.fillStyle(0x151f33, 0.9);
      chProgressBar.fillRoundedRect(-165, navY + 5.5, 290, 3.5, 2);
      // Progress fill
      if (clearedInChapter > 0) {
        chProgressBar.fillStyle(0xffb703, 1);
        chProgressBar.fillRoundedRect(-165, navY + 5.5, (clearedInChapter / 10) * 290, 3.5, 2);
      }
      chProgressTxt.setText(`${clearedInChapter}/10`);

      prevBtn.setAlpha(this.stageSelectChapter > 1 ? 1 : 0.35);
      nextBtn.setAlpha(this.stageSelectChapter < 10 ? 1 : 0.35);

      // On-demand load chapter thumbnails if missing (instant 15KB JPEGs)
      const missingThumbs: number[] = [];
      for (let i = 0; i < 10; i++) {
        const s = ch.startLevel + i;
        if (!this.textures.exists(`stage_thumb_${s}`)) {
          missingThumbs.push(s);
        }
      }
      if (missingThumbs.length > 0) {
        for (const s of missingThumbs) {
          this.load.image(`stage_thumb_${s}`, `assets/stages/stage_thumb_${s}.jpg`);
        }
        this.load.once('complete', () => {
          renderChapterFunc();
        });
        this.load.start();
        return;
      }

      for (let i = 0; i < 10; i++) {
        const inChIdx = i + 1;
        const stgNum = ch.startLevel + i;
        const baseStgConfig = LevelManager.getLevelConfig(stgNum, save.getSelectedTheme());
        const stgConfig = LevelManager.applyDifficultyToConfig(baseStgConfig, this.stageSelectDifficulty);

        const isUnlocked = save.isLevelUnlocked(stgNum, this.stageSelectDifficulty);
        const isBoss = stgNum % 10 === 0;

        const isSecondRow = i >= 5;
        const colIndex = i % 5;
        const posX = (colIndex - 2) * colSpacing;
        const posY = isSecondRow ? rowY2 : rowY1;

        const cardContainer = this.add.container(posX, posY);

        const rawStars = save.getLevelStars(stgConfig.id, this.stageSelectDifficulty) ||
                         save.getLevelStars(`level_${stgNum}`, this.stageSelectDifficulty);
        const isPassed = save.isDifficultyCompleted(stgConfig.id, this.stageSelectDifficulty) || (this.stageSelectDifficulty === 'easy' && (stgNum < save.getHighestLevel() || rawStars > 0));

        // Determine Stage Thumbnail Texture (lightweight real photo thumbnails)
        let thumbKey = '';
        if (this.textures.exists(`stage_thumb_${stgNum}`)) {
          thumbKey = `stage_thumb_${stgNum}`;
        } else if (this.textures.exists(`stage_bg_${stgNum}`)) {
          thumbKey = `stage_bg_${stgNum}`;
        } else if (this.textures.exists(`bg${stgNum}`)) {
          thumbKey = `bg${stgNum}`;
        } else if (this.textures.exists(`stage_thumb_${inChIdx}`)) {
          thumbKey = `stage_thumb_${inChIdx}`;
        } else if (this.textures.exists(`stage_bg_${inChIdx}`)) {
          thumbKey = `stage_bg_${inChIdx}`;
        } else if (this.textures.exists(`stage_preview_${inChIdx}`)) {
          thumbKey = `stage_preview_${inChIdx}`;
        } else if (this.textures.exists(`bg_theme_${ch.worldId}`)) {
          thumbKey = `bg_theme_${ch.worldId}`;
        } else {
          thumbKey = 'bg_night_shrine';
        }

        const halfW = cardW / 2;
        const halfH = cardH / 2;

        // 1. Base card body (Solid dark obsidian background)
        const rBg = this.add.graphics();
        rBg.fillStyle(0x0a101f, 0.95);
        rBg.fillRoundedRect(-halfW, -halfH, cardW, cardH, 14);
        cardContainer.add(rBg);

        // 2. UPPER THUMBNAIL IMAGE (Rendered ON TOP of rBg!)
        if (thumbKey && this.textures.exists(thumbKey)) {
          const thumb = this.add.image(0, -halfH + 45, thumbKey);
          thumb.setDisplaySize(cardW - 6, 86);
          if (!isUnlocked) {
            if (isBoss) {
              thumb.setTint(0xff7788);
              thumb.setAlpha(0.85);
            } else {
              thumb.setTint(0x94a3b8);
              thumb.setAlpha(0.72);
            }
          } else {
            thumb.clearTint();
            thumb.setAlpha(1);
          }
          cardContainer.add(thumb);
        }

        // 3. Card Outer Borders & Glows
        const rBorder = this.add.graphics();
        if (isPassed) {
          // --- STATE A: PASSED / BEATEN (ROYAL AMBER DOUBLE BORDER) ---
          rBorder.lineStyle(1.8, 0xd4af37, 0.95);
          rBorder.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 14);
          rBorder.lineStyle(1, 0xffe89e, 0.35);
          rBorder.strokeRoundedRect(-halfW + 3, -halfH + 3, cardW - 6, cardH - 6, 11);
        } else if (isUnlocked) {
          // --- STATE B: UNLOCKED / ACTIVE (CYAN NEON BORDER) ---
          rBorder.lineStyle(2, 0x00f5d4, 1);
          rBorder.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 14);
          rBorder.lineStyle(1, 0x00b4d8, 0.45);
          rBorder.strokeRoundedRect(-halfW + 3, -halfH + 3, cardW - 6, cardH - 6, 11);
        } else if (isBoss) {
          // --- STATE C: LOCKED BOSS (CRIMSON BORDER) ---
          rBorder.lineStyle(2, 0xff2a5f, 0.95);
          rBorder.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 14);
        } else {
          // --- STATE D: LOCKED (SLATE BORDER) ---
          rBorder.lineStyle(1.4, 0x1f2c45, 0.9);
          rBorder.strokeRoundedRect(-halfW, -halfH, cardW, cardH, 14);
        }
        cardContainer.add(rBorder);

        // --- TOP BADGE: MÀN X ---
        const badgeBg = this.add.graphics();
        const badgeW = isBoss ? 122 : 82;
        const badgeH = 20;
        const badgeY = -halfH + 11;

        if (isPassed) {
          // Royal Amber Seal Badge (Dark glass base with warm gold trim)
          badgeBg.fillStyle(0x1c1507, 0.95);
          badgeBg.fillRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
          badgeBg.lineStyle(1.2, 0xf59e0b, 0.9);
          badgeBg.strokeRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
        } else if (isUnlocked) {
          badgeBg.fillStyle(0x003544, 0.95);
          badgeBg.fillRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
          badgeBg.lineStyle(1.4, 0x00f5d4, 1);
          badgeBg.strokeRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
        } else if (isBoss) {
          badgeBg.fillStyle(0x380512, 0.95);
          badgeBg.fillRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
          badgeBg.lineStyle(1.4, 0xff2a5f, 1);
          badgeBg.strokeRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
        } else {
          badgeBg.fillStyle(0x111927, 0.95);
          badgeBg.fillRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
          badgeBg.lineStyle(1, 0x2d3a54, 0.85);
          badgeBg.strokeRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10);
        }
        cardContainer.add(badgeBg);

        const badgeStr = isBoss ? `❖ MÀN ${stgNum} ❖ 👹 BOSS` : (isPassed ? `MÀN ${stgNum}` : `❖ MÀN ${stgNum} ❖`);
        const badgeColor = isPassed ? '#ffd166' : (isUnlocked ? '#00f5d4' : (isBoss ? '#ff4d6d' : '#94a3b8'));
        const badgeText = this.add.text(0, badgeY, badgeStr, {
          fontFamily: FONT_UI,
          fontSize: isBoss ? '11px' : '11.5px',
          fontStyle: '900',
          color: badgeColor
        }).setOrigin(0.5);
        cardContainer.add(badgeText);

        // --- CENTER LOCK ICON (FOR LOCKED CARDS) ---
        if (!isUnlocked) {
          const lockDisc = this.add.graphics();
          lockDisc.fillStyle(0x0a101f, 0.82);
          lockDisc.fillCircle(0, -halfH + 45, 16);
          lockDisc.lineStyle(1.4, 0x475569, 0.9);
          lockDisc.strokeCircle(0, -halfH + 45, 16);
          cardContainer.add(lockDisc);

          const lockTxt = this.add.text(0, -halfH + 45, '🔒', { fontSize: '15px' }).setOrigin(0.5);
          cardContainer.add(lockTxt);
        }

        // --- LOWER INFO PANEL CONTENT ---
        const displayTitle = cleanStageTitle(stgConfig.title);

        // Level Title
        const stgTitle = this.add.text(0, 26, displayTitle, {
          fontFamily: FONT_DISPLAY,
          fontSize: '14.5px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        }).setOrigin(0.5);
        cardContainer.add(stgTitle);

        // Action Pill Button
        const btnBg = this.add.graphics();
        let btnLabel = '';
        let btnTextColor = '#ffffff';

        const btnY = 56;
        const btnW = 144;
        const btnH = 26;

        if (isPassed) {
          // Glassmorphic Royal Amber Pill Button for Passed Stage
          btnBg.fillStyle(0x221708, 0.95);
          btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnBg.fillStyle(0xffffff, 0.08);
          btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, 6, { tl: 13, tr: 13, bl: 0, br: 0 });
          btnBg.lineStyle(1.4, 0xf59e0b, 0.95);
          btnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnLabel = 'CHƠI LẠI ▶';
          btnTextColor = '#ffd166';
        } else if (isUnlocked) {
          // Cyan Glass Pill Button for Active Stage
          btnBg.fillStyle(0x003844, 0.95);
          btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnBg.lineStyle(1.4, 0x00f5d4, 1);
          btnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnLabel = 'VÀO MÀN';
          btnTextColor = '#00f5d4';
        } else {
          // Locked: Show "🔍 XEM MÀN"
          btnBg.fillStyle(0x101726, 0.95);
          btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnBg.lineStyle(1.2, 0x253248, 0.85);
          btnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
          btnLabel = '🔍 XEM MÀN';
          btnTextColor = '#94a3b8';
        }
        cardContainer.add(btnBg);

        const btnText = this.add.text(0, btnY, btnLabel, {
          fontFamily: FONT_UI,
          fontSize: '11.5px',
          fontStyle: '900',
          letterSpacing: 0.5,
          color: btnTextColor
        }).setOrigin(0.5);
        cardContainer.add(btnText);

        cardContainer.setSize(cardW, cardH).setInteractive({ useHandCursor: true });
        cardContainer.on('pointerdown', () => {
          this.audio.playSelect();
          this.openStageDetailModal(stgConfig, this.stageSelectDifficulty);
        });
        cardContainer.on('pointerover', () => {
          this.tweens.add({ targets: cardContainer, scale: 1.03, duration: 80 });
        });
        cardContainer.on('pointerout', () => {
          this.tweens.add({ targets: cardContainer, scale: 1.0, duration: 80 });
        });

        stagesGrid.add(cardContainer);
      }
    };

    renderChapterFunc = renderChapter;
    renderChapter();

    prevBtn.on('pointerdown', () => {
      if (this.stageSelectChapter > 1) {
        this.audio.playSelect();
        this.stageSelectChapter--;
        renderChapter();
      }
    });

    nextBtn.on('pointerdown', () => {
      if (this.stageSelectChapter < 10) {
        this.audio.playSelect();
        this.stageSelectChapter++;
        renderChapter();
      }
    });

    // --- 6. BOTTOM ELEGANT BACK BUTTON ("🌸 ◀ QUAY LẠI 🌸") ---
    const closeBtnY = 270;
    const closeBtn = this.add.container(0, closeBtnY);

    const cBtnW = 210;
    const cBtnH = 44;
    const cBg = this.add.graphics();
    // Soft shadow
    cBg.fillStyle(0x000000, 0.6);
    cBg.fillRoundedRect(-cBtnW / 2 - 2, -cBtnH / 2 + 3, cBtnW + 4, cBtnH + 4, 24);
    // Deep obsidian lacquer base
    cBg.fillStyle(0x0c0f1d, 0.96);
    cBg.fillRoundedRect(-cBtnW / 2, -cBtnH / 2, cBtnW, cBtnH, 22);
    // Top 3D glass gloss
    cBg.fillStyle(0xffffff, 0.08);
    cBg.fillRoundedRect(-cBtnW / 2, -cBtnH / 2, cBtnW, 14, { tl: 22, tr: 22, bl: 0, br: 0 });
    // Dual lacquer border: Cinnabar Vermillion outer + delicate gold inner hairline
    cBg.lineStyle(2, 0xff385c, 0.92);
    cBg.strokeRoundedRect(-cBtnW / 2, -cBtnH / 2, cBtnW, cBtnH, 22);
    cBg.lineStyle(1, 0xffd166, 0.45);
    cBg.strokeRoundedRect(-cBtnW / 2 + 3, -cBtnH / 2 + 3, cBtnW - 6, cBtnH - 6, 19);
    closeBtn.add(cBg);

    // Sakura blossoms flanking the back button
    const flowerL = this.add.text(-cBtnW / 2 - 18, 0, '🌸', { fontSize: '18px' }).setOrigin(0.5);
    const flowerR = this.add.text(cBtnW / 2 + 18, 0, '🌸', { fontSize: '18px' }).setOrigin(0.5);
    closeBtn.add([flowerL, flowerR]);

    const cTxt = this.add.text(0, 0, '◀ QUAY LẠI', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#080512',
      strokeThickness: 3,
      letterSpacing: 2
    }).setOrigin(0.5);
    closeBtn.add(cTxt);

    closeBtn.setSize(cBtnW + 40, cBtnH + 10).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => {
      this.tweens.add({ targets: closeBtn, scaleX: 1.05, scaleY: 1.05, duration: 120, ease: 'Cubic.easeOut' });
    });
    closeBtn.on('pointerout', () => {
      this.tweens.add({ targets: closeBtn, scaleX: 1.0, scaleY: 1.0, duration: 120, ease: 'Cubic.easeOut' });
    });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.tweens.add({
        targets: modal,
        alpha: 0,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          modal.destroy();
          this.stageModalContainer = null;
        }
      });
    });
    modal.add(closeBtn);
  }

  /**
   * Stage Detail Modal: Pre-selected Difficulty, View 3 Quests, Relic Shard & Badges
   */
  /**
   * Stage Detail Modal: Real Stage Background Header, Relic Drops, Monsters & Yokai Pool with "NEW" badges, 3 Star Quests & Rewards
   */
  private openStageDetailModal(lvlConfig: any, chosenDiff: DifficultyLevel = 'easy'): void {
    if (this.stageDetailModalContainer) {
      this.stageDetailModalContainer.destroy();
      this.stageDetailModalContainer = null;
    }

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const save = this.saveSystem || SaveSystem.getInstance();
    const relicMgr = RelicManager.getInstance();

    const baseConfig = LevelManager.getLevelConfig(lvlConfig.levelNumber || lvlConfig.id, save.getSelectedTheme());
    const isUnlocked = save.isLevelUnlocked(baseConfig.levelNumber, chosenDiff);
    const currentDiffConfig = LevelManager.applyDifficultyToConfig(baseConfig, chosenDiff);
    const ch = LevelManager.getChapterByLevel(baseConfig.levelNumber);

    const modal = this.add.container(width / 2, height / 2).setDepth(350);
    this.stageDetailModalContainer = modal;

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.stageDetailModalContainer = null;
    });
    modal.add(overlay);

    // Modal Card Dimensions (960 x 590)
    const modalW = 960;
    const modalH = 590;

    // --- FLANKING HANGING CHŌCHIN LANTERNS (LEFT & RIGHT) ---
    const lanternLeft = this.add.image(-modalW / 2 - 20, -110, 'shrine_modal_lantern').setOrigin(0.5, 0.2);
    const lanternRight = this.add.image(modalW / 2 + 20, -110, 'shrine_modal_lantern').setOrigin(0.5, 0.2);
    modal.add([lanternLeft, lanternRight]);

    // Gentle swaying animation for lanterns
    this.tweens.add({
      targets: lanternLeft,
      angle: { from: -2.5, to: 2.5 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: lanternRight,
      angle: { from: 2.5, to: -2.5 },
      duration: 3400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- MAIN CARD SHELL & ORNATE TORII FRAME ---
    const card = this.add.graphics();
    // Deep obsidian lacquer backing
    card.fillStyle(0x070914, 0.98);
    card.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 22);

    // Ornate Japanese double gold borders
    card.lineStyle(1.4, 0x855f24, 0.65);
    card.strokeRoundedRect(-modalW / 2 + 5, -modalH / 2 + 5, modalW - 10, modalH - 10, 18);
    card.lineStyle(2.5, 0xd4af37, 0.95);
    card.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 22);

    // Japanese filigree corner brackets
    const drawCornerFlourish = (cx: number, cy: number, flipX: number, flipY: number) => {
      card.lineStyle(2, 0xffd700, 0.9);
      card.beginPath();
      card.moveTo(cx, cy + flipY * 26);
      card.lineTo(cx, cy + flipY * 6);
      card.lineTo(cx + flipX * 6, cy);
      card.lineTo(cx + flipX * 26, cy);
      card.stroke();

      card.fillStyle(0xffd700, 1);
      card.fillCircle(cx + flipX * 10, cy + flipY * 10, 2.5);
    };
    drawCornerFlourish(-modalW / 2 + 10, -modalH / 2 + 10, 1, 1);
    drawCornerFlourish(modalW / 2 - 10, -modalH / 2 + 10, -1, 1);
    drawCornerFlourish(-modalW / 2 + 10, modalH / 2 - 10, 1, -1);
    drawCornerFlourish(modalW / 2 - 10, modalH / 2 - 10, -1, -1);
    modal.add(card);

    // Floating sakura petals around the frame
    const petalCoords = [
      { x: -modalW / 2 + 36, y: -modalH / 2 + 40, rot: 0.3, scale: 0.6 },
      { x: -modalW / 2 + 20, y: modalH / 2 - 50, rot: -0.5, scale: 0.5 },
      { x: modalW / 2 - 35, y: modalH / 2 - 40, rot: 0.8, scale: 0.65 }
    ];
    petalCoords.forEach(p => {
      if (this.textures.exists('crest_sakura_gold')) {
        const pet = this.add.image(p.x, p.y, 'crest_sakura_gold').setScale(p.scale).setRotation(p.rot).setAlpha(0.7);
        modal.add(pet);
        this.tweens.add({
          targets: pet,
          y: p.y + 6,
          rotation: p.rot + 0.15,
          duration: 2600 + Math.random() * 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // --- 1. PANORAMIC HEADER BAR (HEIGHT: 86, WIDTH: 920) ---
    const bannerW = modalW - 40; // 920
    const bannerH = 86;
    const bannerY = -modalH / 2 + 58;

    const bannerContainer = this.add.container(0, bannerY);
    modal.add(bannerContainer);

    // Header Background Image
    let bgKey = '';
    const inCh = ((baseConfig.levelNumber - 1) % 10) + 1;
    if (this.textures.exists(`stage_thumb_${baseConfig.levelNumber}`)) {
      bgKey = `stage_thumb_${baseConfig.levelNumber}`;
    } else if (this.textures.exists(`stage_thumb_${inCh}`)) {
      bgKey = `stage_thumb_${inCh}`;
    } else if (this.textures.exists(`stage_bg_${baseConfig.levelNumber}`)) {
      bgKey = `stage_bg_${baseConfig.levelNumber}`;
    } else if (this.textures.exists(`bg${baseConfig.levelNumber}`)) {
      bgKey = `bg${baseConfig.levelNumber}`;
    } else if (this.textures.exists('bg_night_shrine')) {
      bgKey = 'bg_night_shrine';
    } else if (this.textures.exists(`bg_theme_${ch.worldId}`)) {
      bgKey = `bg_theme_${ch.worldId}`;
    } else {
      bgKey = `stage_preview_${inCh}`;
    }

    if (bgKey && this.textures.exists(bgKey)) {
      const bannerImg = this.add.image(0, 0, bgKey);
      bannerImg.setDisplaySize(bannerW, bannerH);
      if (!isUnlocked) {
        bannerImg.setTint(0x40445a);
        bannerImg.setAlpha(0.5);
      }
      bannerContainer.add(bannerImg);
    }

    // Header Dark Luminous Japanese Vignette & Gold Frame
    const bannerOverlay = this.add.graphics();
    bannerOverlay.fillStyle(0x060914, 0.78);
    bannerOverlay.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    bannerOverlay.lineStyle(1.4, 0xd4af37, 0.9);
    bannerOverlay.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    bannerContainer.add(bannerOverlay);

    // Kitsune Spirit Mask at Top-Right of Header
    if (this.textures.exists('shrine_kitsune_mask')) {
      const mask = this.add.image(bannerW / 2 - 32, -bannerH / 2 - 8, 'shrine_kitsune_mask')
        .setScale(0.52)
        .setOrigin(0.5, 0.5)
        .setAlpha(0.95);
      bannerContainer.add(mask);
    }

    // Clean stage title (avoid duplicate "Màn 1: Màn 1:...")
    const rawTitle = (baseConfig.title || 'TĨNH LẶNG CỔ ĐIỂN').trim();
    const cleanTitle = rawTitle.replace(/^Màn\s*\d+\s*:\s*/i, '');

    // Torii Icon & Level Header
    const toriiIcon = this.add.text(-bannerW / 2 + 18, -26, '⛩️', {
      fontSize: '26px'
    }).setOrigin(0, 0.5);
    bannerContainer.add(toriiIcon);

    const levelNumTxt = this.add.text(-bannerW / 2 + 56, -28, `Màn ${baseConfig.levelNumber}`, {
      fontFamily: FONT_DISPLAY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    bannerContainer.add(levelNumTxt);

    const mainTitleTxt = this.add.text(-bannerW / 2 + 56, -3, cleanTitle, {
      fontFamily: FONT_DISPLAY,
      fontSize: '23px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#05070e',
      strokeThickness: 4
    }).setOrigin(0, 0.5);
    bannerContainer.add(mainTitleTxt);

    // 4 Metadata Pills in Header
    const timeInfo = currentDiffConfig.isStopwatch
      ? '⏱ Tự do'
      : `⏱ Giới hạn ${currentDiffConfig.timeLimit}s`;
    const star1Desc = currentDiffConfig.isStopwatch ? '⭐ ≤ 45s' : '⭐ ≥ 50%';
    const star2Desc = currentDiffConfig.isStopwatch ? '⭐⭐ ≤ 75s' : '⭐⭐ ≥ 75%';

    const metaPills = [
      `☷ Bàn cờ ${currentDiffConfig.rows}x${currentDiffConfig.columns}`,
      timeInfo,
      star1Desc,
      star2Desc
    ];

    let metaX = -bannerW / 2 + 56;
    const metaY = 25;
    metaPills.forEach(pillText => {
      const pTxt = this.add.text(0, 0, pillText, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#e2e8f0'
      }).setOrigin(0.5);

      const pW = pTxt.width + 16;
      const pH = 20;

      const pBg = this.add.graphics();
      pBg.fillStyle(0x0a0f1d, 0.85);
      pBg.fillRoundedRect(-pW / 2, -pH / 2, pW, pH, 10);
      pBg.lineStyle(1, 0x2e3650, 0.9);
      pBg.strokeRoundedRect(-pW / 2, -pH / 2, pW, pH, 10);

      const pCont = this.add.container(metaX + pW / 2, metaY, [pBg, pTxt]);
      bannerContainer.add(pCont);
      metaX += pW + 8;
    });

    // Right Status Badge on Header (Clean, Centered Vertically at Y = 0)
    const stBadgeW = 124;
    const stBadgeH = 32;
    const stBadgeX = bannerW / 2 - 82;
    const stBadgeY = 0;
    const stBadge = this.add.graphics();
    if (isUnlocked) {
      stBadge.fillStyle(0x063328, 0.95);
      stBadge.fillRoundedRect(stBadgeX - stBadgeW / 2, stBadgeY - stBadgeH / 2, stBadgeW, stBadgeH, 16);
      stBadge.lineStyle(1.4, 0x06d6a0, 0.95);
      stBadge.strokeRoundedRect(stBadgeX - stBadgeW / 2, stBadgeY - stBadgeH / 2, stBadgeW, stBadgeH, 16);
    } else {
      stBadge.fillStyle(0x320914, 0.95);
      stBadge.fillRoundedRect(stBadgeX - stBadgeW / 2, stBadgeY - stBadgeH / 2, stBadgeW, stBadgeH, 16);
      stBadge.lineStyle(1.4, 0xef476f, 0.95);
      stBadge.strokeRoundedRect(stBadgeX - stBadgeW / 2, stBadgeY - stBadgeH / 2, stBadgeW, stBadgeH, 16);
    }
    bannerContainer.add(stBadge);

    const prevNum = baseConfig.levelNumber > 1 ? baseConfig.levelNumber - 1 : 1;
    const stLabel = isUnlocked ? '🟢 SẴN SÀNG' : '🔒 CHƯA MỞ';
    const stTxt = this.add.text(stBadgeX, stBadgeY, stLabel, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      fontStyle: '900',
      color: isUnlocked ? '#06d6a0' : '#ffd166'
    }).setOrigin(0.5);
    bannerContainer.add(stTxt);

    // --- 2. FOUR CONTENT CARDS (UNIFIED 2-COLUMN GRID: LEFT=330px, RIGHT=566px) ---
    const topCardY = -76;
    const topCardH = 196;
    const bottomCardY = +132;
    const bottomCardH = 196;

    // Symmetrical 2-Column Grid (Total row span: 330 + 16 + 566 = 912px)
    const leftColW = 330;
    const rightColW = 566;
    const leftColX = -291;
    const rightColX = +173;

    // Helper for ornate card borders
    const createCardBackground = (w: number, h: number, strokeColor: number = 0xd4af37) => {
      const g = this.add.graphics();
      g.fillStyle(0x0b1022, 0.96);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      g.lineStyle(1.4, strokeColor, 0.85);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

      // Delicate inner filigree corner marks
      g.lineStyle(1, 0xffd700, 0.6);
      g.strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 11);
      return g;
    };

    // ==================== CARD 1: RELIC SPOTLIGHT (TOP-LEFT, COMPACT WIDTH: 330) ====================
    const relicBox = this.add.container(leftColX, topCardY);
    relicBox.add(createCardBackground(leftColW, topCardH, 0xd4af37));

    const rawRelicId = baseConfig.relicReward?.id || `relic_yokai_0${((baseConfig.levelNumber - 1) % 3) + 1}`;
    const fullRelic = relicMgr.getRelicById(rawRelicId) 
      || relicMgr.getRelicsByChapter(ch.chapterNum)?.[(baseConfig.levelNumber - 1) % 3] 
      || relicMgr.getRelicById('relic_yokai_01');
    const relic = fullRelic || baseConfig.relicReward;
    const relicId = relic?.id || 'relic_yokai_01';
    const shards = save.getRelicShards(relicId);
    const stars = save.getRelicStar(relicId);
    const isRelicUnlocked = stars > 0;
    const isEquipped = isRelicUnlocked && save.getEquippedRelicId() === relicId;
    const reqShards = save.getRelicRequiredShards(relicId);
    const canUnlock = !isRelicUnlocked && shards >= reqShards;
    const mults = [1.0, 1.0, 1.25, 1.5, 2.0];
    const nextStarCost = Math.round(reqShards * (mults[stars] || 1.0));

    // Header Emblem & Title
    const rEmblem = this.add.text(-leftColW / 2 + 14, -topCardH / 2 + 18, '⛩', { fontSize: '15px' }).setOrigin(0, 0.5);
    const rHeader = this.add.text(-leftColW / 2 + 34, -topCardH / 2 + 18, 'BẢO VẬT THẦN KHÍ', {
      fontFamily: FONT_DISPLAY,
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    relicBox.add([rEmblem, rHeader]);

    // Quick Action Buttons on top-right: 🔍 XEM TO & 📖 TỦ BÁO
    const topBtnW = 60;
    const topBtnH = 20;
    const topBtnY = -topCardH / 2 + 18;
    const wikiBtnX = leftColW / 2 - 12 - topBtnW / 2;
    const zoomBtnX = wikiBtnX - topBtnW - 6;

    // Button 1: 🔍 XEM TO
    const zoomBtn = this.add.container(zoomBtnX, topBtnY);
    const zoomBg = this.add.graphics();
    zoomBg.fillStyle(0x0a2238, 0.95);
    zoomBg.fillRoundedRect(-topBtnW / 2, -topBtnH / 2, topBtnW, topBtnH, 10);
    zoomBg.lineStyle(1.2, 0x00f5d4, 0.9);
    zoomBg.strokeRoundedRect(-topBtnW / 2, -topBtnH / 2, topBtnW, topBtnH, 10);
    const zoomTxt = this.add.text(0, 0, '🔍 XEM TO', {
      fontFamily: FONT_UI,
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    zoomBtn.add([zoomBg, zoomTxt]);
    zoomBtn.setSize(topBtnW, topBtnH).setInteractive({ useHandCursor: true });
    zoomBtn.on('pointerdown', (_p: any, _lx: number, _ly: number, event: any) => {
      event?.stopPropagation?.();
      this.audio.playSelect();
      RelicCodexModal.openRelicDetail(this, fullRelic || relic);
    });
    relicBox.add(zoomBtn);

    // Button 2: 📖 TỦ BÁO
    const wikiBtn = this.add.container(wikiBtnX, topBtnY);
    const wikiBg = this.add.graphics();
    wikiBg.fillStyle(0x1a1a2e, 0.95);
    wikiBg.fillRoundedRect(-topBtnW / 2, -topBtnH / 2, topBtnW, topBtnH, 10);
    wikiBg.lineStyle(1.2, 0xffd700, 0.9);
    wikiBg.strokeRoundedRect(-topBtnW / 2, -topBtnH / 2, topBtnW, topBtnH, 10);
    const wikiTxt = this.add.text(0, 0, '📖 TỦ BÁO', {
      fontFamily: FONT_UI,
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    wikiBtn.add([wikiBg, wikiTxt]);
    wikiBtn.setSize(topBtnW, topBtnH).setInteractive({ useHandCursor: true });
    wikiBtn.on('pointerdown', (_p: any, _lx: number, _ly: number, event: any) => {
      event?.stopPropagation?.();
      this.audio.playSelect();
      this.openRelicsWikiModal();
    });
    relicBox.add(wikiBtn);

    // Left Altar Showcase (Compact & elegant on left)
    const altarX = -leftColW / 2 + 46;
    const altarY = -4;
    const altarImg = this.add.image(altarX, altarY, 'relic_shrine_altar').setScale(0.70);
    relicBox.add(altarImg);

    const candidateKeys = [
      relicId,
      `relic_${relicId}`,
      relicId.replace(/^relic_/, ''),
      `relic_${relicId.replace(/^relic_/, '')}`
    ];
    const foundKey = candidateKeys.find(k => this.textures.exists(k));
    if (foundKey) {
      const rImg = this.add.image(altarX, altarY - 10, foundKey).setDisplaySize(76, 76);
      this.tweens.add({
        targets: rImg,
        y: altarY - 14,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      relicBox.add(rImg);
    }

    // Tier badge under altar
    const tierBadge = relic?.tierName || (relic?.tier === 'epic' ? 'Thượng Phẩm' : relic?.tier === 'rare' ? 'Trung Phẩm' : 'Hạ phẩm');
    const tierPill = this.add.graphics();
    tierPill.fillStyle(0x06332c, 0.95);
    tierPill.fillRoundedRect(altarX - 36, altarY + 44, 72, 18, 9);
    tierPill.lineStyle(1.2, 0x00f5d4, 0.9);
    tierPill.strokeRoundedRect(altarX - 36, altarY + 44, 72, 18, 9);
    relicBox.add(tierPill);

    const tierTxt = this.add.text(altarX, altarY + 53, `✦ ${tierBadge}`, {
      fontFamily: FONT_UI,
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    relicBox.add(tierTxt);

    const zoomHintTxt = this.add.text(altarX, altarY + 69, '🔍 Chạm xem to', {
      fontFamily: FONT_UI,
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5);
    relicBox.add(zoomHintTxt);

    // Right Side Information (Expanded 228px width, highly readable on mobile)
    const rStartX = -leftColW / 2 + 92;
    const rTitleTxt = this.add.text(rStartX, -topCardH / 2 + 32, relic?.name || 'Gương Thần Yata', {
      fontFamily: FONT_DISPLAY,
      fontSize: '15.5px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    });
    const rSub = relic?.subName || (relic as any)?.japaneseName || 'Bát Chỉ Kính (八咫鏡)';
    const rSubTxt = this.add.text(rStartX, -topCardH / 2 + 51, rSub, {
      fontFamily: FONT_UI,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#94a3b8'
    });
    relicBox.add([rTitleTxt, rSubTxt]);

    // High-contrast Skill Plaque for Mobile Readability
    const plaqueX = rStartX;
    const plaqueY = -topCardH / 2 + 67;
    const plaqueW = 226;
    const plaqueH = 76;

    const plaqueGfx = this.add.graphics();
    plaqueGfx.fillStyle(0x071126, 0.94);
    plaqueGfx.fillRoundedRect(plaqueX, plaqueY, plaqueW, plaqueH, 8);
    plaqueGfx.lineStyle(1.2, 0x00f5d4, 0.5);
    plaqueGfx.strokeRoundedRect(plaqueX, plaqueY, plaqueW, plaqueH, 8);
    relicBox.add(plaqueGfx);

    const sName = relic?.skillName || 'TUYỆT KỸ';
    const skillHeaderTxt = this.add.text(plaqueX + 8, plaqueY + 7, `⚡ TUYỆT KỸ: ${sName.toUpperCase()}`, {
      fontFamily: FONT_DISPLAY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f5d4'
    });

    const skillText = relic?.skillDesc || (relic as any)?.description || 'Lập tức soi sáng và tự động nối ngay 2 cặp linh thú khó nhất trên bàn cờ.';
    const skillTxt = this.add.text(plaqueX + 8, plaqueY + 23, skillText, {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '600',
      color: '#ffffff',
      lineSpacing: 3,
      wordWrap: { width: plaqueW - 16, useAdvancedWrap: true }
    });
    relicBox.add([skillHeaderTxt, skillTxt]);

    // Unified Action Progress Bar (226px aligned with plaque)
    const actionW = 226;
    const actionH = 26;
    const actionX = rStartX + actionW / 2;
    const actionY = topCardH / 2 - 20;
    const targetMax = isRelicUnlocked ? nextStarCost : reqShards;
    const pRatio = stars >= 5 ? 1 : Math.min(1, shards / Math.max(1, targetMax));

    const actionGfx = this.add.graphics();
    actionGfx.fillStyle(0x0a0f1d, 0.95);
    actionGfx.fillRoundedRect(actionX - actionW / 2, actionY - actionH / 2, actionW, actionH, 13);

    let barFillCol = 0x00f5d4;
    let barBorderCol = 0x00f5d4;
    let actionLabel = '🔒 CHƯA MỞ';
    let actionTxtCol = '#ff758f';

    if (isEquipped) {
      barFillCol = 0x00f5d4;
      barBorderCol = 0x00f5d4;
      actionLabel = `✨ ĐANG GẮN • ★${stars}`;
      actionTxtCol = '#00f5d4';
    } else if (isRelicUnlocked) {
      barFillCol = 0xffd700;
      barBorderCol = 0xffd700;
      actionLabel = stars >= 5 ? `⚡ ĐÃ MỞ • ★5 Tối Đa` : `⚡ ĐÃ MỞ (★${stars}) • ${shards}/${nextStarCost}`;
      actionTxtCol = '#ffd700';
    } else if (canUnlock) {
      barFillCol = 0xff9f1c;
      barBorderCol = 0xff9f1c;
      actionLabel = `🔥 ĐỦ MẢNH • ${shards}/${reqShards}`;
      actionTxtCol = '#ff9f1c';
    } else {
      barFillCol = 0x028090;
      barBorderCol = 0xef476f;
      actionLabel = `🔒 CHƯA MỞ • ${shards}/${reqShards} MẢNH`;
      actionTxtCol = '#ff758f';
    }

    if (pRatio > 0 && !isEquipped) {
      actionGfx.fillStyle(barFillCol, 0.35);
      actionGfx.fillRoundedRect(actionX - actionW / 2 + 2, actionY - actionH / 2 + 2, (actionW - 4) * pRatio, actionH - 4, 11);
    }
    actionGfx.lineStyle(1.4, barBorderCol, 0.95);
    actionGfx.strokeRoundedRect(actionX - actionW / 2, actionY - actionH / 2, actionW, actionH, 13);
    relicBox.add(actionGfx);

    const actionTxt = this.add.text(actionX, actionY, actionLabel, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '900',
      color: actionTxtCol
    }).setOrigin(0.5);
    relicBox.add(actionTxt);

    relicBox.setSize(leftColW, topCardH).setInteractive({ useHandCursor: true });
    relicBox.on('pointerdown', () => {
      this.audio.playSelect();
      RelicCodexModal.openRelicDetail(this, fullRelic || relic);
    });
    modal.add(relicBox);

    // ==================== CARD 2: ĐỘ KHÓ & NHIỆM VỤ 3 SAO (TOP-RIGHT, EXPANDED WIDTH: 566) ====================
    const rewardTopBox = this.add.container(rightColX, topCardY);
    rewardTopBox.add(createCardBackground(rightColW, topCardH, 0xd4af37));

    const achievedStars = save.getLevelStars(baseConfig.id, chosenDiff) || 0;

    // Header Emblem & Title
    const rtEmblem = this.add.text(-rightColW / 2 + 18, -topCardH / 2 + 18, '🎯', { fontSize: '15px' }).setOrigin(0, 0.5);
    const rtHeader = this.add.text(-rightColW / 2 + 40, -topCardH / 2 + 18, 'ĐỘ KHÓ & NHIỆM VỤ 3 SAO', {
      fontFamily: FONT_DISPLAY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    const rtHint = this.add.text(rightColW / 2 - 18, -topCardH / 2 + 18, `⭐ Đã đạt: ${achievedStars}/3`, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f5d4'
    }).setOrigin(1, 0.5);
    rewardTopBox.add([rtEmblem, rtHeader, rtHint]);

    // UPPER SECTION: 3 DIFFICULTY CHESTS (Single Line: Icon 24x24 + Name + Rewards on 1 line)
    const isEasyUnlocked = save.isLevelUnlocked(baseConfig.levelNumber, 'easy');
    const isMediumUnlocked = save.isLevelUnlocked(baseConfig.levelNumber, 'medium');
    const isHardUnlocked = save.isLevelUnlocked(baseConfig.levelNumber, 'hard');

    const cPodW = 174;
    const cPodH = 34;
    const cPodY = -topCardH / 2 + 48;

    const chestPods = [
      {
        diffKey: 'easy',
        name: 'Dễ',
        rewardStr: '+100 Xu +50 Exp',
        chestKey: 'chest_diff_easy',
        tint: 0x064e3b,
        border: 0x00f5d4,
        isUnlocked: isEasyUnlocked
      },
      {
        diffKey: 'medium',
        name: 'Vừa',
        rewardStr: '+200 Xu +100 Exp',
        chestKey: 'chest_diff_medium',
        tint: 0x1e293b,
        border: 0x38bdf8,
        isUnlocked: isMediumUnlocked
      },
      {
        diffKey: 'hard',
        name: 'Khó',
        rewardStr: '+300 Xu +150 Exp',
        chestKey: 'chest_diff_hard',
        tint: 0x450a0a,
        border: 0xf43f5e,
        isUnlocked: isHardUnlocked
      }
    ];

    chestPods.forEach((cp, idx) => {
      const cPodX = (idx - 1) * (cPodW + 10);
      const isSel = chosenDiff === cp.diffKey;
      const podC = this.add.container(cPodX, cPodY);

      const podG = this.add.graphics();
      podG.fillStyle(isSel ? 0x072828 : (cp.isUnlocked ? 0x0e1428 : 0x090d19), 0.95);
      podG.fillRoundedRect(-cPodW / 2, -cPodH / 2, cPodW, cPodH, 8);
      podG.lineStyle(isSel ? 1.8 : 1.2, isSel ? 0x00f5d4 : (cp.isUnlocked ? cp.border : 0x27314d), isSel ? 1.0 : (cp.isUnlocked ? 0.75 : 0.45));
      podG.strokeRoundedRect(-cPodW / 2, -cPodH / 2, cPodW, cPodH, 8);
      podC.add(podG);

      // Chest 3D Icon (Smaller: 24x24)
      let chestTex = 'chest_wood';
      if (this.textures.exists(cp.chestKey)) {
        chestTex = cp.chestKey;
      } else if (this.textures.exists(`chest_${idx === 0 ? 'common' : idx === 1 ? 'rare' : 'legendary'}`)) {
        chestTex = `chest_${idx === 0 ? 'common' : idx === 1 ? 'rare' : 'legendary'}`;
      } else if (this.textures.exists('icon_chest_easy')) {
        chestTex = idx === 0 ? 'icon_chest_easy' : idx === 1 ? 'icon_chest_medium' : 'icon_chest_hard';
      }
      if (this.textures.exists(chestTex)) {
        const cImg = this.add.image(-cPodW / 2 + 18, 0, chestTex).setDisplaySize(24, 24);
        if (!cp.isUnlocked) cImg.setTint(0x555555);
        podC.add(cImg);
      }

      // Title & Difficulty + Lock on 1 line
      const titleTxt = this.add.text(-cPodW / 2 + 35, 0, cp.name, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: isSel ? '#00f5d4' : (cp.isUnlocked ? '#ffffff' : '#64748b')
      }).setOrigin(0, 0.5);
      podC.add(titleTxt);

      if (!cp.isUnlocked) {
        const lockIcon = this.add.text(-cPodW / 2 + 58, 0, '🔒', { fontSize: '10px' }).setOrigin(0, 0.5);
        podC.add(lockIcon);
      }

      // Rewards on the EXACT same line (Right side of pod)
      const rTxt = this.add.text(cPodW / 2 - 8, 0, cp.rewardStr, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '800',
        color: isSel ? '#ffd166' : (cp.isUnlocked ? '#fef08a' : '#64748b')
      }).setOrigin(1, 0.5);
      podC.add(rTxt);

      // Interactive Click to Switch Difficulty
      podC.setSize(cPodW, cPodH).setInteractive({ useHandCursor: true });
      podC.on('pointerdown', () => {
        if (!cp.isUnlocked) {
          this.audio.playTick();
          if (cp.diffKey === 'medium') {
            this.showFloatingToast(`🔒 Cần vượt hết 10 màn Dễ Chương ${ch.chapterNum} để mở Vừa!`, 0xffd166);
          } else if (cp.diffKey === 'hard') {
            this.showFloatingToast(`🔒 Cần vượt hết 10 màn Vừa Chương ${ch.chapterNum} để mở Khó!`, 0xef476f);
          }
          return;
        }
        if (chosenDiff !== cp.diffKey) {
          this.audio.playSelect();
          this.openStageDetailModal(baseConfig, cp.diffKey as DifficultyLevel);
        }
      });
      rewardTopBox.add(podC);
    });

    // LOWER SECTION: 3 ROWS OF 3-STAR QUESTS DIRECTLY BELOW (Spacious 34px rows, balanced vertical rhythm)
    const quests = currentDiffConfig.quests || [
      { description: 'Dọn sạch bàn cờ trước khi hết thời gian quy định', icon: '🎯' },
      { description: 'Đạt chuỗi Combo liên tiếp x4 không bị ngắt quãng', icon: '⚡' },
      { description: 'Vượt ải không dùng bất kỳ Trợ giúp soi sáng nào', icon: '✨' }
    ];

    const qRowW = rightColW - 32;
    const qRowH = 33;
    const qStartY = -8;
    const qRowSpacing = 39;

    quests.slice(0, 3).forEach((q: any, qIdx: number) => {
      const rowY = qStartY + qIdx * qRowSpacing;
      const isDone = qIdx < achievedStars;

      const rowG = this.add.graphics();
      rowG.fillStyle(isDone ? 0x072828 : 0x0e1428, 0.92);
      rowG.fillRoundedRect(-qRowW / 2, rowY - qRowH / 2, qRowW, qRowH, 8);
      rowG.lineStyle(1.2, isDone ? 0x00f5d4 : 0x27314d, isDone ? 0.9 : 0.6);
      rowG.strokeRoundedRect(-qRowW / 2, rowY - qRowH / 2, qRowW, qRowH, 8);
      rewardTopBox.add(rowG);

      const starIcon = this.add.text(-qRowW / 2 + 20, rowY, '⭐', {
        fontSize: '16px',
        padding: { top: 4, bottom: 4, left: 2, right: 2 }
      }).setOrigin(0.5);
      if (!isDone) starIcon.setAlpha(0.6);

      const qDesc = this.add.text(-qRowW / 2 + 38, rowY, q.description, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: isDone ? '#ffffff' : '#cbd5e1'
      }).setOrigin(0, 0.5);
      rewardTopBox.add([starIcon, qDesc]);

      // Status pill on the right
      const statusPillW = 82;
      const statusPillH = 24;
      const statusPillX = qRowW / 2 - 10 - statusPillW / 2;
      const sPillGfx = this.add.graphics();
      sPillGfx.fillStyle(isDone ? 0x064e3b : 0x1e293b, 0.95);
      sPillGfx.fillRoundedRect(statusPillX - statusPillW / 2, rowY - statusPillH / 2, statusPillW, statusPillH, 12);
      sPillGfx.lineStyle(1.2, isDone ? 0x00f5d4 : 0x475569, 0.9);
      sPillGfx.strokeRoundedRect(statusPillX - statusPillW / 2, rowY - statusPillH / 2, statusPillW, statusPillH, 12);
      rewardTopBox.add(sPillGfx);

      const sPillTxt = this.add.text(statusPillX, rowY, isDone ? '✓ ĐÃ ĐẠT' : 'CHƯA ĐẠT', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: isDone ? '#00f5d4' : '#94a3b8'
      }).setOrigin(0.5);
      rewardTopBox.add(sPillTxt);
    });

    modal.add(rewardTopBox);

    // ==================== CARD 3: LINH THÚ ĐỒNG HÀNH (BOTTOM-LEFT, WIDTH: 330) ====================
    const compCardW = leftColW;
    const compCardX = leftColX;
    const compBox = this.add.container(compCardX, bottomCardY);
    compBox.add(createCardBackground(compCardW, bottomCardH, 0xd4af37));

    const equippedCompId = save.getSelectedCompanion() || 'inari_kitsune';
    const compConfig = CompanionManager.get(equippedCompId);
    const compLevel = save.getCompanionLevel(equippedCompId) || 1;
    const compTier = save.getCompanionTier(equippedCompId) || 1;
    const tierInfo = CompanionManager.getTierInfo(equippedCompId, compTier);
    const compLevelConfig = compConfig.levels?.[Math.min(compLevel - 1, (compConfig.levels?.length || 1) - 1)];

    // Header Emblem & Title
    const cEmblemX = -compCardW / 2 + 18;
    const cEmblemY = -bottomCardH / 2 + 18;
    const emblemTex = this.getCompanionTextureKey(equippedCompId);
    let cEmblem: Phaser.GameObjects.GameObject;
    if (emblemTex && this.textures.exists(emblemTex)) {
      cEmblem = this.add.image(cEmblemX, cEmblemY, emblemTex).setDisplaySize(20, 20);
    } else {
      cEmblem = this.add.text(cEmblemX, cEmblemY, compConfig.icon || '🦊', { fontSize: '15px' }).setOrigin(0.5);
    }
    const cHeader = this.add.text(-compCardW / 2 + 34, -bottomCardH / 2 + 18, 'LINH THÚ ĐỒNG HÀNH', {
      fontFamily: FONT_DISPLAY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    compBox.add([cEmblem, cHeader]);

    // Quick Change Icon / Button on top-right of header
    const chgBtnW = 62;
    const chgBtnH = 20;
    const chgBtnX = compCardW / 2 - 14 - chgBtnW / 2;
    const chgBtnY = -bottomCardH / 2 + 18;
    const chgBtnBg = this.add.graphics();
    chgBtnBg.fillStyle(0x0e1f38, 0.95);
    chgBtnBg.fillRoundedRect(chgBtnX - chgBtnW / 2, chgBtnY - chgBtnH / 2, chgBtnW, chgBtnH, 10);
    chgBtnBg.lineStyle(1.2, 0x00f5d4, 0.9);
    chgBtnBg.strokeRoundedRect(chgBtnX - chgBtnW / 2, chgBtnY - chgBtnH / 2, chgBtnW, chgBtnH, 10);
    const chgBtnTxt = this.add.text(chgBtnX, chgBtnY, '🔄 ĐỔI', {
      fontFamily: FONT_UI,
      fontSize: '10px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    compBox.add([chgBtnBg, chgBtnTxt]);

    // Left: Companion Avatar Dais
    const compAltarX = -compCardW / 2 + 62;
    const compAltarY = -6;
    const auraColor = compConfig.themeColor || 0xff758f;

    const compAura = this.add.graphics();
    compAura.fillStyle(auraColor, 0.15);
    compAura.fillCircle(compAltarX, compAltarY, 40);
    compAura.lineStyle(1.5, auraColor, 0.85);
    compAura.strokeCircle(compAltarX, compAltarY, 40);
    compBox.add(compAura);

    // Companion Artwork
    const compArtKey = this.getCompanionTextureKey(equippedCompId);

    if (compArtKey && this.textures.exists(compArtKey)) {
      const compImg = this.add.image(compAltarX, compAltarY - 4, compArtKey).setDisplaySize(80, 80);
      this.tweens.add({
        targets: compImg,
        y: compAltarY - 8,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      compBox.add(compImg);
    } else {
      const iconTxt = this.add.text(compAltarX, compAltarY - 4, compConfig.icon || '🦊', { fontSize: '44px' }).setOrigin(0.5);
      compBox.add(iconTxt);
    }

    // Right of Avatar: Name & Tier Capsule
    const cStartX = -compCardW / 2 + 118;
    const cTitleTxt = this.add.text(cStartX, -bottomCardH / 2 + 46, compConfig.name, {
      fontFamily: FONT_DISPLAY,
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    compBox.add(cTitleTxt);

    const elemTxt = `✦ ${compConfig.elementLabel || 'Tâm Linh'} • ${tierInfo.tierName}`;
    const elemBadge = this.add.text(cStartX, -bottomCardH / 2 + 68, elemTxt, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '900',
      color: `#${auraColor.toString(16).padStart(6, '0')}`
    });
    compBox.add(elemBadge);

    // Level Pill
    const lvlPillW = 86;
    const lvlPillH = 20;
    const lvlPillX = cStartX + lvlPillW / 2;
    const lvlPillY = -bottomCardH / 2 + 94;
    const lvlPillBg = this.add.graphics();
    lvlPillBg.fillStyle(0x0e1428, 0.95);
    lvlPillBg.fillRoundedRect(lvlPillX - lvlPillW / 2, lvlPillY - lvlPillH / 2, lvlPillW, lvlPillH, 10);
    lvlPillBg.lineStyle(1.2, 0xffd700, 0.9);
    lvlPillBg.strokeRoundedRect(lvlPillX - lvlPillW / 2, lvlPillY - lvlPillH / 2, lvlPillW, lvlPillH, 10);
    const lvlPillTxt = this.add.text(lvlPillX, lvlPillY, `⭐ CẤP ${compLevel} / 10`, {
      fontFamily: FONT_UI,
      fontSize: '10px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    compBox.add([lvlPillBg, lvlPillTxt]);

    // Bottom Area: 3 Circular Skill Icons + View Skills Button
    const skillIcons = [
      { key: `skill_act_${equippedCompId}`, ringColor: 0xef476f },
      { key: `skill_pas_${equippedCompId}`, ringColor: 0x00f5d4 },
      { key: `skill_cnt_${equippedCompId}`, ringColor: 0xffd700 }
    ];

    const sBadgeStartX = -compCardW / 2 + 48;
    const sBadgeY = bottomCardH / 2 - 42;
    const sBadgeSpacing = 38;

    skillIcons.forEach((s, sIdx) => {
      const bx = sBadgeStartX + sIdx * sBadgeSpacing;
      const ringG = this.add.graphics();
      ringG.fillStyle(0x0a0f1d, 0.95);
      ringG.fillCircle(bx, sBadgeY, 15);
      ringG.lineStyle(1.4, s.ringColor, 0.95);
      ringG.strokeCircle(bx, sBadgeY, 15);
      compBox.add(ringG);

      if (this.textures.exists(s.key)) {
        const sImg = this.add.image(bx, sBadgeY, s.key).setDisplaySize(24, 24);
        compBox.add(sImg);
      }
    });

    // Button: "📜 XEM KỸ NĂNG"
    const skillBtnW = 144;
    const skillBtnH = 30;
    const skillBtnX = compCardW / 2 - 16 - skillBtnW / 2;
    const skillBtnY = sBadgeY;

    const skillBtnGfx = this.add.graphics();
    skillBtnGfx.fillStyle(0x111c38, 0.95);
    skillBtnGfx.fillRoundedRect(skillBtnX - skillBtnW / 2, skillBtnY - skillBtnH / 2, skillBtnW, skillBtnH, 15);
    skillBtnGfx.lineStyle(1.4, 0x00f5d4, 0.95);
    skillBtnGfx.strokeRoundedRect(skillBtnX - skillBtnW / 2, skillBtnY - skillBtnH / 2, skillBtnW, skillBtnH, 15);
    compBox.add(skillBtnGfx);

    const skillBtnTxt = this.add.text(skillBtnX, skillBtnY, '📜 XEM KỸ NĂNG', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    compBox.add(skillBtnTxt);

    // Call openCompanionSkillPopover on click
    const openSkillsModal = () => {
      this.audio.playSelect();
      this.openCompanionSkillPopover(compConfig, compLevel, compTier, tierInfo, compLevelConfig);
    };

    compBox.setSize(compCardW, bottomCardH).setInteractive({ useHandCursor: true });
    compBox.on('pointerdown', openSkillsModal);
    modal.add(compBox);

    // ==================== CARD 4: PHẦN THƯỞNG VƯỢT ẢI (BOTTOM-RIGHT, 2 HÀNG 2 CỘT, EXPANDED WIDTH: 566) ====================
    const rewardBox = this.add.container(rightColX, bottomCardY);
    rewardBox.add(createCardBackground(rightColW, bottomCardH, 0xd4af37));

    // Torii Gate Watermark on Right
    if (this.textures.exists('torii_watermark')) {
      const wm = this.add.image(rightColW / 2 - 62, 10, 'torii_watermark').setAlpha(0.2);
      rewardBox.add(wm);
    }

    // Header Emblem & Title
    const lootEmblem = this.add.text(-rightColW / 2 + 18, -bottomCardH / 2 + 18, '🎁', { fontSize: '15px' }).setOrigin(0, 0.5);
    const lootHeader = this.add.text(-rightColW / 2 + 40, -bottomCardH / 2 + 18, 'PHẦN THƯỞNG VƯỢT ẢI', {
      fontFamily: FONT_DISPLAY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0, 0.5);

    const lootSub = this.add.text(rightColW / 2 - 18, -bottomCardH / 2 + 18, '(Nhấp linh thú xem kỹ năng)', {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#94a3b8'
    }).setOrigin(1, 0.5);
    rewardBox.add([lootEmblem, lootHeader, lootSub]);

    // Data Resolution for Loot
    const stageLoot = LootManager.getStageLootConfig(baseConfig.levelNumber);
    const validDiff = (chosenDiff === 'medium' || chosenDiff === 'hard') ? chosenDiff : 'easy';
    const matrix = stageLoot.rewardsMatrix[validDiff] || stageLoot.rewardsMatrix.easy;

    const mainCompId = stageLoot.mainCompanionId || 'inari_kitsune';
    const subCompId = stageLoot.subCompanionId || 'nekomata_cat';
    const mainCompArt = this.getCompanionTextureKey(mainCompId);
    const subCompArt = this.getCompanionTextureKey(subCompId);

    // 2-ROW × 2-COLUMN GRID (Enlarged 64px cells, balanced 3-zone visual distribution, no header overlap)
    const gridCellW = 262;
    const gridCellH = 64;
    const colGap = 12;
    const colXs = [-(gridCellW / 2 + colGap / 2), (gridCellW / 2 + colGap / 2)];
    const rowYs = [-30, 44]; // Row 1 top at -62 (10px below header at -72), bottom at +2. Row 2 top at +12, bottom at +76 (22px above card bottom)

    const gridRewards = [
      // Row 1, Col 1: EXP
      {
        row: 0,
        col: 0,
        type: 'currency',
        iconKey: 'icon_reward_exp',
        fallback: '🔥',
        title: `+${matrix.exp} EXP`,
        sub: 'Kinh nghiệm vượt ải',
        fixityText: '✓ CỐ ĐỊNH',
        borderColor: 0x3b82f6,
        bgFill: 0x0c192c,
        fixityBg: 0x0f2942,
        valColor: '#93c5fd',
        onClick: null
      },
      // Row 1, Col 2: Coins
      {
        row: 0,
        col: 1,
        type: 'currency',
        iconKey: 'icon_reward_coin',
        fallback: '🪙',
        title: `+${matrix.coins} Xu`,
        sub: 'Tiền thưởng hoàn thành',
        fixityText: '✓ CỐ ĐỊNH',
        borderColor: 0xf59e0b,
        bgFill: 0x1f1807,
        fixityBg: 0x382205,
        valColor: '#fde047',
        onClick: null
      },
      // Row 2, Col 1: Main Companion (Inari)
      {
        row: 1,
        col: 0,
        type: 'companion',
        iconKey: mainCompArt,
        fallback: '🦊',
        title: stageLoot.mainCompanionName || 'Cáo Inari',
        rateText: `Mảnh rớt: ${matrix.mainShardPct || '1.0%'}`,
        borderColor: 0xf43f5e,
        bgFill: 0x1a0b16,
        rateBg: 0x3f0a1c,
        rateColor: '#fda4af',
        onClick: () => {
          this.audio.playSelect();
          CompanionModal3D.open(this, mainCompId, (newComp: any) => {
            this.saveSystem.setSelectedCompanion(newComp.id);
            this.openStageDetailModal(baseConfig, chosenDiff);
          });
        }
      },
      // Row 2, Col 2: Sub Companion (Nekomata)
      {
        row: 1,
        col: 1,
        type: 'companion',
        iconKey: subCompArt,
        fallback: '🐱',
        title: stageLoot.subCompanionName || 'Mèo Nekomata',
        rateText: `Mảnh rớt: ${matrix.subShardPct || '0.3%'}`,
        borderColor: 0xa855f7,
        bgFill: 0x160b24,
        rateBg: 0x2e0854,
        rateColor: '#d8b4fe',
        onClick: () => {
          this.audio.playSelect();
          CompanionModal3D.open(this, subCompId, (newComp: any) => {
            this.saveSystem.setSelectedCompanion(newComp.id);
            this.openStageDetailModal(baseConfig, chosenDiff);
          });
        }
      }
    ];

    gridRewards.forEach((item) => {
      const cellX = colXs[item.col];
      const cellY = rowYs[item.row];
      const cellC = this.add.container(cellX, cellY);

      const cellG = this.add.graphics();
      cellG.fillStyle(item.bgFill, 0.95);
      cellG.fillRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
      cellG.lineStyle(1.4, item.borderColor, 0.85);
      cellG.strokeRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
      cellC.add(cellG);

      // Icon / Avatar (Prominent 36x36)
      if (item.iconKey && this.textures.exists(item.iconKey)) {
        const img = this.add.image(-gridCellW / 2 + 28, 0, item.iconKey).setDisplaySize(36, 36);
        cellC.add(img);
      } else {
        const em = this.add.text(-gridCellW / 2 + 28, 0, item.fallback, { fontSize: '24px' }).setOrigin(0.5);
        cellC.add(em);
      }

      if (item.type === 'currency') {
        const valTxt = this.add.text(-gridCellW / 2 + 54, -10, item.title, {
          fontFamily: FONT_UI,
          fontSize: '15px',
          fontStyle: '900',
          color: item.valColor
        }).setOrigin(0, 0.5);

        const subTxt = this.add.text(-gridCellW / 2 + 54, 12, item.sub || '', {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }).setOrigin(0, 0.5);

        // Fixity Pill on the right to balance empty space
        const fixityW = 76;
        const fixityH = 22;
        const fixityX = gridCellW / 2 - 12 - fixityW / 2;
        const fGfx = this.add.graphics();
        fGfx.fillStyle(item.fixityBg || 0x000000, 0.85);
        fGfx.fillRoundedRect(fixityX - fixityW / 2, -fixityH / 2, fixityW, fixityH, 11);
        fGfx.lineStyle(1.1, item.borderColor, 0.85);
        fGfx.strokeRoundedRect(fixityX - fixityW / 2, -fixityH / 2, fixityW, fixityH, 11);

        const fTxt = this.add.text(fixityX, 0, item.fixityText || '✓ CỐ ĐỊNH', {
          fontFamily: FONT_UI,
          fontSize: '9.5px',
          fontStyle: '900',
          color: item.valColor
        }).setOrigin(0.5);

        cellC.add([valTxt, subTxt, fGfx, fTxt]);
      } else {
        const nameTxt = this.add.text(-gridCellW / 2 + 54, -11, item.title, {
          fontFamily: FONT_UI,
          fontSize: '13.5px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Drop Rate Pill
        const pillW = 96;
        const pillH = 19;
        const pillX = -gridCellW / 2 + 54 + pillW / 2;
        const pillY = 12;

        const pGfx = this.add.graphics();
        pGfx.fillStyle(item.rateBg || 0x000000, 0.85);
        pGfx.fillRoundedRect(pillX - pillW / 2, pillY - pillH / 2, pillW, pillH, 9);
        pGfx.lineStyle(1.1, item.borderColor, 0.85);
        pGfx.strokeRoundedRect(pillX - pillW / 2, pillY - pillH / 2, pillW, pillH, 9);
        cellC.add(pGfx);

        const pTxt = this.add.text(pillX, pillY, item.rateText || '', {
          fontFamily: FONT_UI,
          fontSize: '10px',
          fontStyle: '900',
          color: item.rateColor
        }).setOrigin(0.5);

        // Action button pill (Dedicated inspect trigger on right)
        const btnW = 66;
        const btnH = 26;
        const btnX = gridCellW / 2 - 12 - btnW / 2;
        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(item.rateBg || 0x000000, 0.9);
        btnGfx.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 13);
        btnGfx.lineStyle(1.3, item.borderColor, 0.95);
        btnGfx.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 13);

        const btnTxt = this.add.text(btnX, 0, '🔍 Xem', {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: item.rateColor
        }).setOrigin(0.5);

        cellC.add([nameTxt, pTxt, btnGfx, btnTxt]);
      }

      if (item.onClick) {
        cellC.setSize(gridCellW, gridCellH).setInteractive({ useHandCursor: true });
        cellC.on('pointerover', () => {
          cellG.clear();
          cellG.fillStyle(item.bgFill, 1);
          cellG.fillRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
          cellG.lineStyle(2, 0x00f5d4, 1);
          cellG.strokeRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
        });
        cellC.on('pointerout', () => {
          cellG.clear();
          cellG.fillStyle(item.bgFill, 0.95);
          cellG.fillRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
          cellG.lineStyle(1.4, item.borderColor, 0.85);
          cellG.strokeRoundedRect(-gridCellW / 2, -gridCellH / 2, gridCellW, gridCellH, 10);
        });
        cellC.on('pointerdown', item.onClick);
      }

      rewardBox.add(cellC);
    });

    modal.add(rewardBox);

    // --- 4. BOTTOM ACTION BUTTONS ---
    const btnY = modalH / 2 - 34;

    // Back Button (Dark Sapphire Glass Pill)
    const backBtn = this.add.container(-170, btnY);
    const backW = 150;
    const backH = 42;
    const backBg = this.add.graphics();
    backBg.fillStyle(0x1a2135, 0.95);
    backBg.fillRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);
    backBg.lineStyle(1.4, 0x4f5d84, 0.9);
    backBg.strokeRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);

    const backTxt = this.add.text(0, 0, '↩  QUAY LẠI', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    backBtn.add([backBg, backTxt]);

    backBtn.setSize(backW, backH).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => {
      backBg.clear();
      backBg.fillStyle(0x28324f, 1);
      backBg.fillRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);
      backBg.lineStyle(1.6, 0x818cf8, 1);
      backBg.strokeRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);
    });
    backBtn.on('pointerout', () => {
      backBg.clear();
      backBg.fillStyle(0x1a2135, 0.95);
      backBg.fillRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);
      backBg.lineStyle(1.4, 0x4f5d84, 0.9);
      backBg.strokeRoundedRect(-backW / 2, -backH / 2, backW, backH, 21);
    });
    backBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.stageDetailModalContainer = null;
    });
    modal.add(backBtn);

    // Start / Play Button (Grand Banner Pill with Cyan Oriental Cloud Wings)
    const startBtn = this.add.container(140, btnY);
    const btnW = 320;
    const btnH = 44;

    // Cloud Wings on Left and Right
    if (this.textures.exists('button_cloud_tail_left') && this.textures.exists('button_cloud_tail_right')) {
      const wL = this.add.image(-btnW / 2 - 8, 0, 'button_cloud_tail_left').setDisplaySize(44, 38);
      const wR = this.add.image(btnW / 2 + 8, 0, 'button_cloud_tail_right').setDisplaySize(44, 38);
      startBtn.add([wL, wR]);
    }

    const sBg = this.add.graphics();
    let btnLabel = '';
    let btnColor = '#051923';

    if (isUnlocked) {
      sBg.fillStyle(0x00f5d4, 1);
      sBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
      sBg.lineStyle(1.8, 0xffffff, 0.95);
      sBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
      btnLabel = '⚔️  BẮT ĐẦU CHƠI';
      btnColor = '#051923';
    } else {
      sBg.fillStyle(0x2d1520, 0.95);
      sBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
      sBg.lineStyle(1.5, 0xef476f, 0.85);
      sBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
      btnLabel = baseConfig.levelNumber === 1
        ? '🔒  CẦN MỞ ĐỘ KHÓ TRƯỚC'
        : `🔒  CHƯA MỞ (CẦN VƯỢT MÀN ${prevNum})`;
      btnColor = '#ffd166';
    }

    const sTxt = this.add.text(0, 0, btnLabel, {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: btnColor
    }).setOrigin(0.5);

    startBtn.add([sBg, sTxt]);
    startBtn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => {
      if (isUnlocked) {
        startBtn.setScale(1.03);
      }
    });
    startBtn.on('pointerout', () => {
      startBtn.setScale(1.0);
    });

    startBtn.on('pointerdown', () => {
      if (isUnlocked) {
        startBtn.disableInteractive();
        this.audio.playSelect();
        this.time.delayedCall(16, () => {
          if (this.stageDetailModalContainer) {
            try { this.stageDetailModalContainer.destroy(); } catch {}
            this.stageDetailModalContainer = null;
          }
          if (this.stageModalContainer) {
            try { this.stageModalContainer.destroy(); } catch {}
            this.stageModalContainer = null;
          }
          this.scene.start('GameScene', {
            levelId: baseConfig.id,
            difficulty: chosenDiff,
            lives: 10
          });
        });
      } else {
        this.audio.playTick();
        const hintMsg = baseConfig.levelNumber === 1
          ? `🔒 Cần vượt hết 10 màn độ khó trước để mở!`
          : `🔒 Bạn cần vượt qua Màn ${prevNum} để mở khóa màn này!`;
        this.showFloatingToast(hintMsg, 0xef476f);
      }
    });
    modal.add(startBtn);
  }

  /**
   * 🦊 Companion Skill Popover: Dedicated pop-up overlay inspecting Active, Passive, and Counter skills
   */
  private openCompanionSkillPopover(
    compConfig: any,
    compLevel: number,
    compTier: number,
    tierInfo: any,
    compLevelConfig: any
  ): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const popover = this.add.container(width / 2, height / 2).setDepth(400);

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.82);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    popover.add(overlay);

    // Popover Shell Dimensions
    const popW = 560;
    const popH = 360;

    const popBg = this.add.graphics();
    popBg.fillStyle(0x0b1022, 0.98);
    popBg.fillRoundedRect(-popW / 2, -popH / 2, popW, popH, 18);
    popBg.lineStyle(2, 0xd4af37, 0.95);
    popBg.strokeRoundedRect(-popW / 2, -popH / 2, popW, popH, 18);
    popBg.lineStyle(1, 0xffd700, 0.5);
    popBg.strokeRoundedRect(-popW / 2 + 4, -popH / 2 + 4, popW - 8, popH - 8, 15);
    popover.add(popBg);

    // Header: Icon + Title
    const headerTitle = this.add.text(-popW / 2 + 24, -popH / 2 + 24, `📜 CHI TIẾT KỸ NĂNG • ${compConfig.name.toUpperCase()}`, {
      fontFamily: FONT_DISPLAY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    popover.add(headerTitle);

    // Close Button (✕)
    const closeBtn = this.add.text(popW / 2 - 24, -popH / 2 + 24, '✕', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playTick();
      popover.destroy();
    });
    overlay.on('pointerdown', () => {
      this.audio.playTick();
      popover.destroy();
    });
    popover.add(closeBtn);

    // 3 Skill Cards stacked vertically
    const compId = compConfig.id;
    const skills = [
      {
        iconKey: `skill_act_${compId}`,
        category: 'TUYỆT CHIÊU (ACTIVE)',
        categoryColor: '#ef476f',
        borderColor: 0xef476f,
        name: compConfig.skillName,
        desc: compLevelConfig?.skillDesc || compConfig.skillDesc
      },
      {
        iconKey: `skill_pas_${compId}`,
        category: 'NỘI TẠI (PASSIVE)',
        categoryColor: '#00f5d4',
        borderColor: 0x00f5d4,
        name: compConfig.passiveName,
        desc: compLevelConfig?.passiveDesc || compConfig.passiveDesc || 'Tăng cường sức mạnh hộ mệnh và duy trì chuỗi combo.'
      },
      {
        iconKey: `skill_cnt_${compId}`,
        category: 'KHẮC CHẾ BOSS (COUNTER)',
        categoryColor: '#ffd700',
        borderColor: 0xffd700,
        name: tierInfo?.bossCounter || 'Đặc Trị Cơ Chế Boss & Góc Kẹt',
        desc: tierInfo?.bossCounterDesc || 'Hóa giải các góc kẹt và cơ chế ảo ảnh do Boss tạo ra.'
      }
    ];

    const cardW = popW - 44; // 516
    const cardH = 70;
    const startY = -popH / 2 + 76;
    const spacingY = 78;

    skills.forEach((s, idx) => {
      const cy = startY + idx * spacingY;
      const sBox = this.add.container(0, cy);

      const sBg = this.add.graphics();
      sBg.fillStyle(0x0e1428, 0.95);
      sBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
      sBg.lineStyle(1.4, s.borderColor, 0.85);
      sBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
      sBox.add(sBg);

      // Left Skill Icon
      const iconX = -cardW / 2 + 30;
      const ring = this.add.graphics();
      ring.fillStyle(0x070b16, 1);
      ring.fillCircle(iconX, 0, 20);
      ring.lineStyle(1.4, s.borderColor, 0.95);
      ring.strokeCircle(iconX, 0, 20);
      sBox.add(ring);

      if (this.textures.exists(s.iconKey)) {
        const sImg = this.add.image(iconX, 0, s.iconKey).setDisplaySize(34, 34);
        sBox.add(sImg);
      }

      // Category Tag
      const catTxt = this.add.text(-cardW / 2 + 62, -cardH / 2 + 13, s.category, {
        fontFamily: FONT_UI,
        fontSize: '9.5px',
        fontStyle: '900',
        color: s.categoryColor
      }).setOrigin(0, 0.5);

      // Skill Name
      const nameTxt = this.add.text(-cardW / 2 + 62, -cardH / 2 + 28, s.name, {
        fontFamily: FONT_DISPLAY,
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      // Skill Description
      const descTxt = this.add.text(-cardW / 2 + 62, -cardH / 2 + 45, s.desc, {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        color: '#cbd5e1',
        wordWrap: { width: cardW - 74 }
      });

      sBox.add([catTxt, nameTxt, descTxt]);
      popover.add(sBox);
    });

    // Footer Button: NÂNG CẤP / ĐỔI LINH THÚ (Opens CompanionModal3D)
    const fBtnW = 230;
    const fBtnH = 32;
    const fBtnY = popH / 2 - 24;
    const fBtnBg = this.add.graphics();
    fBtnBg.fillStyle(0x063328, 0.95);
    fBtnBg.fillRoundedRect(-fBtnW / 2, fBtnY - fBtnH / 2, fBtnW, fBtnH, 16);
    fBtnBg.lineStyle(1.4, 0x00f5d4, 0.95);
    fBtnBg.strokeRoundedRect(-fBtnW / 2, fBtnY - fBtnH / 2, fBtnW, fBtnH, 16);
    popover.add(fBtnBg);

    const fBtnTxt = this.add.text(0, fBtnY, '✨ QUẢN LÝ LINH THÚ 3D', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);
    popover.add(fBtnTxt);

    const fBtnHit = this.add.zone(0, fBtnY, fBtnW, fBtnH).setInteractive({ useHandCursor: true });
    fBtnHit.on('pointerdown', () => {
      this.audio.playSelect();
      popover.destroy();
      CompanionModal3D.open(this, compConfig.id);
    });
    popover.add(fBtnHit);
  }

  /**
   * Realm Selector Modal: Multi-verse Portals (Japan, Egypt, Greece, Wuxia, Underwater)
   */
  private openRealmSelectorModal(): void {
    if (this.realmModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const save = this.saveSystem || SaveSystem.getInstance();

    const modal = this.add.container(width / 2, height / 2).setDepth(200);
    this.realmModalContainer = modal;

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const card = this.add.graphics();
    card.fillStyle(0x101026, 0.98);
    card.fillRoundedRect(-460, -250, 920, 500, 22);
    card.lineStyle(2, 0x4cc9f0, 0.95);
    card.strokeRoundedRect(-460, -250, 920, 500, 22);
    modal.add(card);

    const title = this.add.text(0, -210, '🌌 CỔNG KHÔNG GIAN • ĐA VŨ TRỤ THẦN THOẠI', {
      fontFamily: FONT_UI,
      fontSize: '23px',
      fontStyle: '900',
      color: '#4cc9f0'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -180, '✨ Đã Khai Mở Thần Khí Nhật Bản! Chạm vào Thế Giới bạn muốn viễn chinh:', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      color: '#ffd166'
    }).setOrigin(0.5);
    modal.add(sub);

    const REALMS = [
      { id: 'yokai', name: '⛩️ Nhật Bản', sub: 'Bách Quỷ Đồ Thư • 108 Quái', color: 0xd90429, desc: 'Vùng đất khởi nguyên đã thuần thục hoàn toàn.', unlockAtLevel: 1 },
      { id: 'egypt', name: '🏺 Ai Cập Cổ Đại', sub: 'Chư Thần Sông Nile • 45 Vị Thần', color: 0xe76f51, desc: 'Bí ẩn kim tự tháp, Pharaoh và lời nguyền sa mạc.', unlockAtLevel: 10 },
      { id: 'greece', name: '🏛️ Hy Lạp Thần Thoại', sub: 'Đỉnh Olympus • 45 Vị Thần', color: 0x3a86ff, desc: 'Lôi đình Zeus, đại dương Poseidon và minh giới Hades.', unlockAtLevel: 20 },
      { id: 'wuxia', name: '🗡️ Võ Hiệp Tiên Hiệp', sub: 'Võ Lâm Tiên Giới • 18 Pháp Bảo', color: 0xd00000, desc: 'Phi kiếm ngự phong, chân khí trừ ma độ thế.', unlockAtLevel: 30 },
      { id: 'underwater', name: '🌊 Thủy Cung Biển Sâu', sub: 'Đế Vương Atlantis • 54 Sinh Vật', color: 0x00b4d8, desc: 'Hải vương kỳ bí, nàng tiên cá và quái vật Kraken.', unlockAtLevel: 40 }
    ];

    const currentRealm = save.getActiveRealm();
    const rW = 160;
    const rH = 250;
    const spacing = 175;

    REALMS.forEach((r, idx) => {
      const posX = -2 * spacing + idx * spacing;
      const posY = 0;
      const rBox = this.add.container(posX, posY);

      const isUnlocked = save.isRealmUnlocked(r.id);
      const isCurrent = currentRealm === r.id;
      const rCard = this.add.graphics();
      if (!isUnlocked) {
        rCard.fillStyle(0x121220, 0.85);
        rCard.fillRoundedRect(-rW / 2, -rH / 2, rW, rH, 14);
        rCard.lineStyle(1, 0x333348, 0.6);
        rCard.strokeRoundedRect(-rW / 2, -rH / 2, rW, rH, 14);
      } else {
        rCard.fillStyle(isCurrent ? 0x241e3d : 0x18182e, 0.95);
        rCard.fillRoundedRect(-rW / 2, -rH / 2, rW, rH, 14);
        rCard.lineStyle(isCurrent ? 2 : 1.2, isCurrent ? 0xffd700 : r.color, isCurrent ? 1 : 0.7);
        rCard.strokeRoundedRect(-rW / 2, -rH / 2, rW, rH, 14);
      }
      rBox.add(rCard);

      const rName = this.add.text(0, -90, !isUnlocked ? `🔒 ${r.name.replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '').trim()}` : r.name, {
        fontFamily: FONT_UI,
        fontSize: '15.5px',
        fontStyle: '900',
        color: !isUnlocked ? '#6c757d' : (isCurrent ? '#ffd700' : '#ffffff'),
        align: 'center'
      }).setOrigin(0.5);
      rBox.add(rName);

      const rSub = this.add.text(0, -60, r.sub, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: !isUnlocked ? '#495057' : '#ced4da',
        align: 'center',
        wordWrap: { width: 145 }
      }).setOrigin(0.5);
      rBox.add(rSub);

      const descText = !isUnlocked
        ? `Vượt Màn ${r.unlockAtLevel} (Trảm Đại Trùm) để khai mở Thế Giới này.`
        : r.desc;
      const rDesc = this.add.text(0, 0, descText, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: !isUnlocked ? '#fca311' : '#adb5bd',
        align: 'center',
        wordWrap: { width: 140 }
      }).setOrigin(0.5);
      rBox.add(rDesc);

      const statusBtn = this.add.container(0, 85);
      const sBg = this.add.graphics();
      if (!isUnlocked) {
        sBg.fillStyle(0x242436, 0.9);
        sBg.fillRoundedRect(-65, -16, 130, 32, 8);
      } else {
        sBg.fillStyle(isCurrent ? 0x00f5d4 : r.color, 0.95);
        sBg.fillRoundedRect(-65, -16, 130, 32, 8);
      }
      const btnLabel = !isUnlocked
        ? `🔒 MỞ MÀN ${r.unlockAtLevel}`
        : (isCurrent ? '✓ ĐANG CHỌN' : 'CHUYỂN ĐẾN ➔');
      const sTxt = this.add.text(0, 0, btnLabel, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: !isUnlocked ? '#adb5bd' : (isCurrent ? '#101018' : '#ffffff')
      }).setOrigin(0.5);
      statusBtn.add([sBg, sTxt]);
      rBox.add(statusBtn);

      rBox.setSize(rW, rH).setInteractive({ useHandCursor: true });
      rBox.on('pointerdown', () => {
        if (!isUnlocked) {
          this.haptic.error();
          this.audio.playError();
          return;
        }
        this.audio.playSelect();
        save.setActiveRealm(r.id);
        save.setSelectedTheme(r.id);
        modal.destroy();
        this.realmModalContainer = null;
        this.scene.restart();
      });

      modal.add(rBox);
    });

    // Close button
    const closeBtn = this.add.container(0, 205);
    const cBg = this.add.graphics();
    cBg.fillStyle(0xe63946, 1);
    cBg.fillRoundedRect(-100, -20, 200, 40, 12);
    const cTxt = this.add.text(0, 0, 'ĐÓNG CỔNG', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(200, 40).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.realmModalContainer = null;
    });
    modal.add(closeBtn);
  }

  /**
   * World Boss Arena Modal (16 World Bosses)
   */
  private openBossArenaModal(): void {
    if (this.bossModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const modal = this.add.container(width / 2, height / 2).setDepth(200);
    this.bossModalContainer = modal;

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const card = this.add.graphics();
    card.fillStyle(0x130d20, 0.98);
    card.fillRoundedRect(-460, -250, 920, 500, 22);
    card.lineStyle(2, 0xff4d6d, 0.9);
    card.strokeRoundedRect(-460, -250, 920, 500, 22);
    modal.add(card);

    const title = this.add.text(0, -215, '👑 ĐẤU TRƯỜNG 16 ĐẠI BOSS THẾ GIỚI', {
      fontFamily: FONT_UI,
      fontSize: '24px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -188, '16 Đại Trùm Thần Thoại Cực Đại • Chém Rơi Đầu, Phá Hủy Bộ Phận & Săn Thưởng', {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      color: '#ced4da'
    }).setOrigin(0.5);
    modal.add(sub);

    const allBosses = bossesData as any[];
    let currentPage = 0; // 0: Boss 1-8, 1: Boss 9-16
    const cardsContainer = this.add.container(0, 0);
    modal.add(cardsContainer);

    // Tab buttons for Page 1 / Page 2
    const tabContainer = this.add.container(0, -154);
    modal.add(tabContainer);

    const renderTabs = () => {
      tabContainer.removeAll(true);
      const tabs = [
        { label: '🐉 ĐỢT 1: CỔ ĐẠI & THẦN THOẠI (8)', page: 0 },
        { label: '🌌 ĐỢT 2: HƯ KHÔNG & QUÁI THÚ (8)', page: 1 }
      ];

      tabs.forEach((t, idx) => {
        const tabX = (idx === 0 ? -185 : 185);
        const isActive = currentPage === t.page;
        const tBg = this.add.graphics();
        tBg.fillStyle(isActive ? 0xff4d6d : 0x1d1430, 0.95);
        tBg.fillRoundedRect(tabX - 170, -17, 340, 34, 17);
        tBg.lineStyle(1.5, isActive ? 0xffd166 : 0x3d2960, 0.9);
        tBg.strokeRoundedRect(tabX - 170, -17, 340, 34, 17);

        const tTxt = this.add.text(tabX, 0, t.label, {
          fontFamily: FONT_UI,
          fontSize: '13.5px',
          fontStyle: '900',
          color: isActive ? '#ffffff' : '#adb5bd'
        }).setOrigin(0.5);

        const tHit = this.add.zone(tabX, 0, 340, 34).setInteractive({ useHandCursor: true });
        tHit.on('pointerdown', () => {
          if (currentPage !== t.page) {
            currentPage = t.page;
            this.audio.playSelect();
            this.haptic.light();
            renderTabs();
            renderBossCards();
          }
        });

        tabContainer.add([tBg, tTxt, tHit]);
      });
    };

    const renderBossCards = () => {
      cardsContainer.removeAll(true);
      const startIdx = currentPage * 8;
      const pageBosses = allBosses.slice(startIdx, startIdx + 8);

      const cardW = 216;
      const cardH = 126;
      const colSpacing = 222;
      const rowY1 = -70;
      const rowY2 = 65;

      pageBosses.forEach((b, i) => {
        const isSecondRow = i >= 4;
        const colIndex = i % 4;
        const posX = -1.5 * colSpacing + colIndex * colSpacing;
        const posY = isSecondRow ? rowY2 : rowY1;

        const bCard = this.add.container(posX, posY);

        const bg = this.add.graphics();
        bg.fillStyle(0x19102b, 0.95);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);

        let elemCol = 0xffd166;
        if (b.element === 'fire') elemCol = 0xff4d6d;
        else if (b.element === 'water') elemCol = 0x00b4d8;
        else if (b.element === 'dark') elemCol = 0x9d4edd;
        else if (b.element === 'lightning') elemCol = 0x3a86ff;
        else if (b.element === 'nature') elemCol = 0x52b788;

        bg.lineStyle(1.5, elemCol, 0.7);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
        bCard.add(bg);

        // Atmospheric Boss Arena Battlefield Backdrop
        const arenaIdx = ((startIdx + i) % 10) + 1;
        const arenaKey = this.textures.exists(`boss_arena_thumb_${arenaIdx}`)
          ? `boss_arena_thumb_${arenaIdx}`
          : (this.textures.exists(`boss_arena_${arenaIdx}`) ? `boss_arena_${arenaIdx}` : 'bg_boss_arena');
        if (this.textures.exists(arenaKey)) {
          const arenaBg = this.add.image(0, 0, arenaKey);
          arenaBg.setDisplaySize(cardW - 4, cardH - 4);
          arenaBg.setAlpha(0.28);
          bCard.add(arenaBg);
        }

        // Thumbnail Sprite
        let bossTex = b.id;
        if (!this.textures.exists(bossTex)) {
          const clean = b.id.replace(/^boss_/, '').replace(/_boss$/, '');
          if (this.textures.exists(`boss_${clean}`)) bossTex = `boss_${clean}`;
          else if (this.textures.exists(`${clean}_boss`)) bossTex = `${clean}_boss`;
          else if (this.textures.exists(`boss_${b.id}`)) bossTex = `boss_${b.id}`;
        }

        const thumbX = -cardW / 2 + 28;
        const thumbY = -cardH / 2 + 40;

        const thumbBg = this.add.graphics();
        thumbBg.fillStyle(0x0e0817, 1);
        thumbBg.fillCircle(thumbX, thumbY, 22);
        thumbBg.lineStyle(1.4, elemCol, 0.9);
        thumbBg.strokeCircle(thumbX, thumbY, 22);

        let thumbSprite: Phaser.GameObjects.GameObject;
        if (this.textures.exists(bossTex)) {
          const img = this.add.image(thumbX, thumbY, bossTex);
          img.setDisplaySize(40, 40);
          thumbSprite = img;
        } else {
          thumbSprite = this.add.text(thumbX, thumbY, b.symbol || '👑', { fontSize: '20px' }).setOrigin(0.5);
        }

        // Info right
        const infoX = thumbX + 28;
        const maxTextW = cardW - (infoX - (-cardW / 2)) - 10;
        const bName = this.add.text(infoX, -cardH / 2 + 18, b.name, {
          fontFamily: FONT_UI,
          fontSize: '13px',
          fontStyle: '900',
          color: '#ffffff',
          maxLines: 1,
          wordWrap: { width: maxTextW }
        });

        const bTitle = this.add.text(infoX, -cardH / 2 + 37, b.title || b.theme, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ced4da',
          maxLines: 1,
          wordWrap: { width: maxTextW }
        });

        const bHp = this.add.text(infoX, -cardH / 2 + 55, `${b.symbol || '⚔️'} ${b.max_hp} HP • ${b.parts || 8} Phần`, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: '#ffd166'
        });

        // Play Button Pill
        const btnY = cardH / 2 - 19;
        const pBtnBg = this.add.graphics();
        pBtnBg.fillStyle(0xd90429, 1);
        pBtnBg.fillRoundedRect(-cardW / 2 + 12, btnY - 13, cardW - 24, 26, 13);
        pBtnBg.lineStyle(1, 0xff758f, 0.8);
        pBtnBg.strokeRoundedRect(-cardW / 2 + 12, btnY - 13, cardW - 24, 26, 13);

        const pBtnTxt = this.add.text(0, btnY, '⚔️ KHIÊU CHIẾN', {
          fontFamily: FONT_UI,
          fontSize: '12.5px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);

        bCard.add([thumbBg, thumbSprite, bName, bTitle, bHp, pBtnBg, pBtnTxt]);

        bCard.setSize(cardW, cardH).setInteractive({ useHandCursor: true });

        bCard.on('pointerdown', () => {
          bCard.disableInteractive();
          this.audio.playBossHit();
          this.haptic.heavy();
          this.time.delayedCall(16, () => {
            if (this.bossModalContainer) {
              try { this.bossModalContainer.destroy(); } catch {}
              this.bossModalContainer = null;
            }
            this.scene.start('GameScene', { bossId: b.id, lives: 5 });
          });
        });

        bCard.on('pointerover', () => {
          this.tweens.add({ targets: bCard, scale: 1.03, duration: 80 });
          bg.lineStyle(2, 0xffffff, 1);
          bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
        });

        bCard.on('pointerout', () => {
          this.tweens.add({ targets: bCard, scale: 1.0, duration: 80 });
          bg.lineStyle(1.5, elemCol, 0.7);
          bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
        });

        cardsContainer.add(bCard);
      });
    };

    renderTabs();
    renderBossCards();

    // Close button
    const closeBtn = this.add.container(0, 205);
    const cBg = this.add.graphics();
    cBg.fillStyle(0x3a0ca3, 0.95);
    cBg.fillRoundedRect(-110, -20, 220, 40, 14);
    cBg.lineStyle(1.5, 0x4cc9f0, 0.9);
    cBg.strokeRoundedRect(-110, -20, 220, 40, 14);

    const cTxt = this.add.text(0, 0, 'ĐÓNG ĐẤU TRƯỜNG', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(220, 40).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.bossModalContainer = null;
    });
    modal.add(closeBtn);
  }

  /**
   * Ambient Falling Sakura Petals (Optimized to 8 lightweight particles for silky 60 FPS)
   */
  private createAmbientSakura(): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    this.sakuraContainer = this.add.container(0, 0);

    for (let i = 0; i < 8; i++) {
      const petal = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-50, height),
        'particle_sakura'
      );
      petal.setScale(Phaser.Math.FloatBetween(0.4, 0.75));
      petal.setAlpha(Phaser.Math.FloatBetween(0.2, 0.55));
      this.sakuraContainer.add(petal);

      this.tweens.add({
        targets: petal,
        y: height + 60,
        x: `+=${Phaser.Math.Between(40, 80)}`,
        angle: 360,
        duration: Phaser.Math.Between(7000, 13000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
        onRepeat: () => {
          petal.x = Phaser.Math.Between(0, width);
          petal.y = -40;
        }
      });
    }
  }

  public handleBackButton(): boolean {
    if (this.wallpaperModalContainer) {
      this.wallpaperModalContainer.destroy();
      this.wallpaperModalContainer = null;
      return true;
    }
    if (this.themeModalContainer) {
      this.themeModalContainer.destroy();
      this.themeModalContainer = null;
      return true;
    }
    if (this.rulesModalContainer) {
      this.rulesModalContainer.destroy();
      this.rulesModalContainer = null;
      return true;
    }
    if (this.stageModalContainer) {
      this.stageModalContainer.destroy();
      this.stageModalContainer = null;
      return true;
    }
    return false;
  }
}
