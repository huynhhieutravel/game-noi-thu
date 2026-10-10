import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions, setupRetinaCamera } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { CompanionManager } from '../game/CompanionManager';
import { CompanionModal } from '../game/CompanionModal';
import { TextureGenerator } from '../game/TextureGenerator';

export class MainMenuScene extends Phaser.Scene {
  private saveSystem!: SaveSystem;
  private audio!: AudioSystem;
  private haptic!: HapticSystem;
  private stageModalContainer: Phaser.GameObjects.Container | null = null;
  private rulesModalContainer: Phaser.GameObjects.Container | null = null;
  private themeModalContainer: Phaser.GameObjects.Container | null = null;

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

    // 1. Fullscreen Cinematic Night Torii Background (Edge-to-Edge)
    if (this.textures.exists('bg_main_torii')) {
      const bgImg = this.add.image(GAME_WIDTH / 2, height / 2, 'bg_main_torii');
      bgImg.setDisplaySize(screenW, height);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x131224, 0x131224, 0x090a12, 0x090a12, 1);
      bg.fillRect(-offsetX, 0, screenW, height);
    }

    // Atmospheric Vignette & Contrast Overlays for pristine WCAG readability
    const vignette = this.add.graphics();
    vignette.fillStyle(0x06050e, 0.28);
    vignette.fillRect(-offsetX, 0, screenW, height);

    // Subtle dark glass plate behind right section for maximum card pop
    vignette.fillStyle(0x080614, 0.32);
    vignette.fillRoundedRect(495, 75, 565, 545, 24);

    // Subtle Radial Glow behind Hero & Mascot (Left)
    const glow = this.add.graphics();
    glow.fillStyle(0x00b4d8, 0.12);
    glow.fillCircle(240, 320, 200);
    glow.fillStyle(0xd90429, 0.08);
    glow.fillCircle(240, 360, 160);

    // Authentic Torii Gate Backdrop (Only needed if NOT yokai or if bg_main_torii is missing)
    if (currentTheme !== 'yokai' || !this.textures.exists('bg_main_torii')) {
      this.createToriiGateBackdrop(240, 306, currentTheme);
    }

    // 2. Falling Sakura Petals Ambient Effect
    this.createAmbientSakura();

    // 3. Top Navigation & Status Bar (Full Width)
    this.createTopBar(width, save, currentTheme);

    // 4. Left Hero Section: Mascot Showcase, Title & Album Access
    this.createHeroShowcase(save, currentTheme);

    // 5. Right Hub Section: Primary Play CTA & Game Mode Grid
    this.createGameHub(save);

    // 6. Footer Signature
    this.add.text(width / 2, height - 16, '⛩️ Onet Linh Thú • Cơ Chế Nối Thú 2003 Cổ Điển • Âm Thanh & Haptic Chuẩn Mobile Native', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#adb5bd'
    }).setOrigin(0.5);
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

    // High-resolution Torii Gate Sprite with transparent cutout
    const torii = this.add.image(centerX, centerY, 'torii_gate');
    torii.setDisplaySize(410, 390);
    torii.setAlpha(0.96);

    // Ethereal floating breath animation
    this.tweens.add({
      targets: torii,
      y: centerY - 5,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtle pulsing spiritual glow
    this.tweens.add({
      targets: aura,
      alpha: { from: 0.6, to: 1.0 },
      scaleX: { from: 0.95, to: 1.05 },
      scaleY: { from: 0.95, to: 1.05 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Top Glassmorphic Navigation Bar
   */
  private createTopBar(width: number, save: any, currentTheme: string): void {
    const container = this.add.container(0, 0);

    // --- Left: Companion / Pet Pill ---
    const compId = this.saveSystem.getSelectedCompanion();
    const companion = CompanionManager.get(compId);
    const compW = 216;
    const compH = 38;
    const compX = 24;
    const topY = 16;

    const compBg = this.add.graphics();
    compBg.fillStyle(0x111024, 0.88);
    compBg.fillRoundedRect(compX, topY, compW, compH, 19);
    compBg.lineStyle(1.5, companion.themeColor, 0.85);
    compBg.strokeRoundedRect(compX, topY, compW, compH, 19);

    // Avatar Circle (Uses avatar_inari if available, or procedural character card)
    let avItem: Phaser.GameObjects.GameObject;
    const compTexKey = `char_${companion.id}`;
    if (this.textures.exists('avatar_inari')) {
      const avRing = this.add.graphics();
      avRing.lineStyle(2, 0xd90429, 0.9);
      avRing.strokeCircle(compX + 22, topY + compH / 2, 16);
      container.add(avRing);

      const avImg = this.add.image(compX + 22, topY + compH / 2, 'avatar_inari');
      avImg.setDisplaySize(30, 30);
      avItem = avImg;
    } else {
      TextureGenerator.ensureCharacterTexture(this, companion.id);
      if (this.textures.exists(compTexKey)) {
        const avRing = this.add.graphics();
        avRing.lineStyle(2, companion.themeColor, 0.9);
        avRing.strokeCircle(compX + 22, topY + compH / 2, 16);
        container.add(avRing);

        const avImg = this.add.image(compX + 22, topY + compH / 2, compTexKey);
        avImg.setDisplaySize(30, 30);
        avItem = avImg;
      } else {
        avItem = this.add.text(compX + 12, topY + 9, companion.icon, { fontSize: '18px' });
      }
    }

    const compText = this.add.text(compX + 44, topY + 10, `${companion.name} ⚙`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '800',
      color: '#ffffff'
    });

    // Purple "ĐỔI" Button Capsule
    const changeBg = this.add.graphics();
    changeBg.fillStyle(0x7209b7, 0.95);
    changeBg.fillRoundedRect(compX + compW - 54, topY + 7, 46, 24, 11);
    changeBg.lineStyle(1, 0x9d4edd, 0.9);
    changeBg.strokeRoundedRect(compX + compW - 54, topY + 7, 46, 24, 11);

    const changeTag = this.add.text(compX + compW - 31, topY + 19, 'ĐỔI', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    const compHit = this.add.zone(compX, topY, compW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    compHit.on('pointerdown', () => {
      this.audio.playSelect();
      CompanionModal.open(this, (newComp) => {
        this.saveSystem.setSelectedCompanion(newComp.id);
        this.audio.playVictory();
        this.haptic.medium();
        this.scene.restart();
      });
    });

    // --- Left: Coins Pill with "+" Button ---
    const coinW = 110;
    const coinX = compX + compW + 10;

    const coinsBg = this.add.graphics();
    coinsBg.fillStyle(0x111024, 0.88);
    coinsBg.fillRoundedRect(coinX, topY, coinW, compH, 19);
    coinsBg.lineStyle(1.5, 0xffd166, 0.8);
    coinsBg.strokeRoundedRect(coinX, topY, coinW, compH, 19);

    const coinIcon = this.add.text(coinX + 13, topY + 9, '💰', { fontSize: '16px' });
    const coinText = this.add.text(coinX + 38, topY + 10, `${save.coins}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700'
    });

    // Small "+" circle
    const plusCircle = this.add.graphics();
    plusCircle.fillStyle(0x272346, 0.9);
    plusCircle.fillCircle(coinX + coinW - 17, topY + compH / 2, 9);
    plusCircle.lineStyle(1, 0xffd166, 0.75);
    plusCircle.strokeCircle(coinX + coinW - 17, topY + compH / 2, 9);

    const plusTxt = this.add.text(coinX + coinW - 17, topY + compH / 2 - 1, '+', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    // --- Right: Audio Toggle (Circular Glass Button) ---
    const audioW = 38;
    const audioX = width - 24 - audioW;

    const audioBg = this.add.graphics();
    audioBg.fillStyle(0x111024, 0.88);
    audioBg.fillCircle(audioX + audioW / 2, topY + compH / 2, 19);
    audioBg.lineStyle(1.5, 0x00f5d4, 0.6);
    audioBg.strokeCircle(audioX + audioW / 2, topY + compH / 2, 19);

    const audioIcon = this.add.text(audioX + audioW / 2, topY + compH / 2, this.audio.getEnabled() ? '🔊' : '🔇', {
      fontSize: '17px'
    }).setOrigin(0.5);

    const audioHit = this.add.zone(audioX, topY, audioW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    audioHit.on('pointerdown', () => {
      const enabled = this.audio.toggle();
      audioIcon.setText(enabled ? '🔊' : '🔇');
      this.haptic.light();
      if (enabled) {
        this.audio.playSelect();
      }
    });

    // --- Right: Rulebook Guide Button ---
    const ruleW = 124;
    const ruleX = audioX - 10 - ruleW;

    const ruleBg = this.add.graphics();
    ruleBg.fillStyle(0x111024, 0.88);
    ruleBg.fillRoundedRect(ruleX, topY, ruleW, compH, 19);
    ruleBg.lineStyle(1.5, 0x00f5d4, 0.85);
    ruleBg.strokeRoundedRect(ruleX, topY, ruleW, compH, 19);

    const ruleTxt = this.add.text(ruleX + ruleW / 2, topY + compH / 2, '📖 LUẬT CHƠI', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#00f5d4'
    }).setOrigin(0.5);

    const ruleHit = this.add.zone(ruleX, topY, ruleW, compH)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    ruleHit.on('pointerdown', () => {
      this.audio.playSelect();
      this.haptic.light();
      this.openRulebookModal();
    });

    // --- Right: Stars Pill ---
    const starW = 95;
    const starX = ruleX - 10 - starW;

    const starsBg = this.add.graphics();
    starsBg.fillStyle(0x111024, 0.88);
    starsBg.fillRoundedRect(starX, topY, starW, compH, 19);
    starsBg.lineStyle(1.5, 0xffb703, 0.8);
    starsBg.strokeRoundedRect(starX, topY, starW, compH, 19);

    const starIcon = this.add.text(starX + 14, topY + 9, '⭐', { fontSize: '15px' });
    const starText = this.add.text(starX + 40, topY + 10, `${save.stars}/30`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // --- Center: Theme Switcher Capsule (Quick Prev/Next & Gallery Modal) ---
    const centerAreaX = (coinX + coinW + starX) / 2;
    this.createThemeSwitcher(container, centerAreaX, topY + compH / 2, currentTheme);

    container.add([
      compBg, avItem, compText, changeBg, changeTag, compHit,
      coinsBg, coinIcon, coinText, plusCircle, plusTxt,
      starsBg, starIcon, starText,
      ruleBg, ruleTxt, ruleHit,
      audioBg, audioIcon, audioHit
    ]);
  }

  /**
   * Modern Theme Switcher Capsule with Quick Prev/Next & Full Modal Access
   */
  private createThemeSwitcher(parent: Phaser.GameObjects.Container, centerX: number, centerY: number, currentTheme: string): void {
    const themes = MainMenuScene.THEMES;
    const currIdx = Math.max(0, themes.findIndex(t => t.id === currentTheme));
    const curr = themes[currIdx] || themes[0];

    const switcherGroup = this.add.container(centerX, centerY);

    const arrowW = 34;
    const arrowH = 34;
    const pillW = 210;
    const pillH = 38;
    const gap = 8;
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
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
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 19);
    pillBg.lineStyle(2, curr.color, 0.9);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 19);

    const pillInnerGlow = this.add.graphics();
    pillInnerGlow.fillStyle(curr.color, 0.12);
    pillInnerGlow.fillRoundedRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW - 4, pillH - 4, 17);

    // Left Icon (e.g. 🏴‍☠️)
    const iconTxt = this.add.text(-pillW / 2 + 16, 0, curr.icon, {
      fontSize: '18px'
    }).setOrigin(0, 0.5);

    // Theme Name
    const labelTxt = this.add.text(-pillW / 2 + 42, 0, curr.label, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Counter Badge (e.g. 8/16)
    const countTxt = this.add.text(pillW / 2 - 32, 0, `${currIdx + 1}/16`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#8d99ae'
    }).setOrigin(1, 0.5);

    // Dropdown arrow
    const downArrow = this.add.text(pillW / 2 - 16, 0, '▾', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    centerPill.add([pillBg, pillInnerGlow, iconTxt, labelTxt, countTxt, downArrow]);
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
   * Left Hero Section: Mascot Dais, Animated Character & Title
   */
  private createHeroShowcase(save: any, currentTheme: string): void {
    const leftCenterX = 240;

    let subTitleTxt = '百鬼夜行 • 妖怪コネクト';
    let mainTitleTxt = 'YOKAI ONET';
    let titleColor = '#ff758f';
    let badgeText = '⛩️ HUYỀN THOẠI NỐI THÚ 2003 • 108 QUÁI THÚ';
    let mascotKey = 'char_inari_kitsune';
    let mascotFallback = '🦊';

    if (currentTheme === 'egypt') {
      subTitleTxt = 'エジプト神話 • 古代の神々';
      mainTitleTxt = 'EGYPT ONET';
      titleColor = '#f4a261';
      badgeText = '🏺 CHƯ THẦN SÔNG NILE • 45 VỊ THẦN HUYỀN BÍ';
      mascotKey = 'char_sobek';
      mascotFallback = '🐊';
    } else if (currentTheme === 'greece') {
      subTitleTxt = 'ギリシャ神話 • オリンポス';
      mainTitleTxt = 'GREECE ONET';
      titleColor = '#90e0ef';
      badgeText = '🏛️ ĐỈNH CAO OLYMPUS • 45 THẦN THOẠI HY LẠP';
      mascotKey = 'char_kronos';
      mascotFallback = '⚡';
    } else if (currentTheme === 'wuxia') {
      subTitleTxt = '仙侠神话 • 江湖武林';
      mainTitleTxt = 'WUXIA ONET';
      titleColor = '#ffd166';
      badgeText = '🗡️ VÕ LÂM TIÊN HIỆP • 18 PHÁP BẢO & ĐẠI HIỆP';
      mascotKey = 'char_wuxia_swordsman';
      mascotFallback = '🗡️';
    } else if (currentTheme === 'korea') {
      subTitleTxt = '한국 설화 • 조선 신화';
      mainTitleTxt = 'KOREA ONET';
      titleColor = '#2a9d8f';
      badgeText = '🐯 THẦN THOẠI XỨ HÀN • 18 LINH HỒN & THẦN THÚ';
      mascotKey = 'char_gumiho';
      mascotFallback = '🦊';
    } else if (currentTheme === 'india') {
      subTitleTxt = 'भारतीय पौराणिक कथा • उत्सव';
      mainTitleTxt = 'INDIA ONET';
      titleColor = '#ffb703';
      badgeText = '🐘 THẦN THOẠI & LỄ HỘI ẤN ĐỘ • 18 CHƯ THẦN & VAHANA';
      mascotKey = 'char_lord_ganesha';
      mascotFallback = '🐘';
    } else if (currentTheme === 'sea') {
      subTitleTxt = 'เอเชียตะวันออกเฉียงใต้ • เทพนิยาย';
      mainTitleTxt = 'S.E.A ONET';
      titleColor = '#52b788';
      badgeText = '🌴 ĐÔNG NAM Á • 18 LINH THÚ & DI TÍCH RỪNG THIÊNG';
      mascotKey = 'char_phaya_naga';
      mascotFallback = '🐍';
    } else if (currentTheme === 'pirate') {
      subTitleTxt = '海賊の航海 • 呪われた深海';
      mainTitleTxt = 'PIRATE ONET';
      titleColor = '#4cc9f0';
      badgeText = '🏴‍☠️ HẢI TẶC ĐẠI DƯƠNG • 18 THỦY THỦ & BÓNG MA BIỂN';
      mascotKey = 'char_captain_paws';
      mascotFallback = '🏴‍☠️';
    } else if (currentTheme === 'underwater') {
      subTitleTxt = '海底王国 • アトランティス';
      mainTitleTxt = 'ATLANTIS ONET';
      titleColor = '#00b4d8';
      badgeText = '🌊 THỦY CUNG HUYỀN BÍ • 54 LINH VẬT & ĐẾ VƯƠNG BIỂN';
      mascotKey = 'char_dolphin_prince';
      mascotFallback = '🐬';
    } else if (currentTheme === 'dinosaur') {
      subTitleTxt = '恐竜ワールド • ジュラ紀の谷';
      mainTitleTxt = 'DINO ONET';
      titleColor = '#52b788';
      badgeText = '🦖 KỶ NGUYÊN TIỀN SỬ • 18 KHỦNG LONG & HỎA SƠN';
      mascotKey = 'char_baby_trex';
      mascotFallback = '🦖';
    } else if (currentTheme === 'monster') {
      subTitleTxt = 'ダンジョンモンスター • 冒険';
      mainTitleTxt = 'MONSTER ONET';
      titleColor = '#c77dff';
      badgeText = '👾 QUÁI THÚ HẦM NGỤC • 18 TIỂU QUÁI & BẢO VẬT';
      mascotKey = 'char_baby_red_dragon';
      mascotFallback = '🐉';
    } else if (currentTheme === 'fantasy') {
      subTitleTxt = 'クラシックファンタジー • 冒険';
      mainTitleTxt = 'FANTASY ONET';
      titleColor = '#4cc9f0';
      badgeText = '🏰 KỶ NGUYÊN HIỆP SĨ • 18 DŨNG SĨ & THẦN THÚ';
      mascotKey = 'char_lion_paladin';
      mascotFallback = '🦁';
    } else if (currentTheme === 'space') {
      subTitleTxt = 'スペース・ギャラクシー • 宇宙探索';
      mainTitleTxt = 'SPACE ONET';
      titleColor = '#4cc9f0';
      badgeText = '🚀 THIÊN HÀ VŨ TRỤ • 18 PHI HÀNH GIA & THẦN THÚ SAO';
      mascotKey = 'char_starlight_kitsune';
      mascotFallback = '🦊';
    } else if (currentTheme === 'robot') {
      subTitleTxt = 'ロボット工場 • メカニック';
      mainTitleTxt = 'ROBOT ONET';
      titleColor = '#ffd166';
      badgeText = '🤖 CÔNG XƯỞNG TƯƠNG LAI • 18 THỢ MÁY & CỖ MÁY';
      mascotKey = 'char_battery_bunny_bot';
      mascotFallback = '⚡';
    } else if (currentTheme === 'animal') {
      subTitleTxt = '動物王国 • かわいい動物たち';
      mainTitleTxt = 'ANIMAL ONET';
      titleColor = '#ffd166';
      badgeText = '🐾 THẾ GIỚI ĐỘNG VẬT • 45 THÚ CƯNG & MUÔN THÚ';
      mascotKey = 'char_shiba_inu';
      mascotFallback = '🐕';
    } else if (currentTheme === 'plant') {
      subTitleTxt = '植物王国 • かわいい花と木';
      mainTitleTxt = 'PLANT ONET';
      titleColor = '#52b788';
      badgeText = '🌱 VƯƠNG QUỐC THỰC VẬT • 18 KỲ HOA DỊ THẢO';
      mascotKey = 'char_sunflower_sunny';
      mascotFallback = '🌻';
    }

    // 1. Japanese / Mythological Subtitle
    const kanjiTitle = this.add.text(leftCenterX, 94, subTitleTxt, {
      fontFamily: 'Zen Maru Gothic, serif',
      fontSize: '15px',
      color: '#ffccd5'
    }).setOrigin(0.5);

    // 2. Grand Main Title with Glowing Red Stroke & Arcade Shadow
    const mainTitle = this.add.text(leftCenterX, 138, mainTitleTxt, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '48px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: currentTheme === 'yokai' ? '#d90429' : '#0e0b17',
      strokeThickness: 8,
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: currentTheme === 'yokai' ? '#e63946' : titleColor,
        blur: 16,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Subtitle Badge
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0x120f24, 0.92);
    badgeBg.fillRoundedRect(leftCenterX - 180, 172, 360, 26, 13);
    badgeBg.lineStyle(1.5, 0xffb703, 0.85);
    badgeBg.strokeRoundedRect(leftCenterX - 180, 172, 360, 26, 13);

    const badgeTxtObj = this.add.text(leftCenterX, 185, badgeText, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '10px',
      fontStyle: '800',
      color: '#ffd700',
      letterSpacing: 0.5
    }).setOrigin(0.5);

    // Idle title float tween
    this.tweens.add({
      targets: [mainTitle, kanjiTitle],
      y: '-=3',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Mystic Dais & Animated Mascot Spotlight
    const daisY = 320;

    // Glowing dais rings with blue & golden spiritual light
    const daisGlow = this.add.graphics();
    daisGlow.fillStyle(0x00b4d8, 0.2);
    daisGlow.fillEllipse(leftCenterX, daisY + 65, 200, 48);
    daisGlow.lineStyle(2, 0x3a86ff, 0.85);
    daisGlow.strokeEllipse(leftCenterX, daisY + 65, 175, 38);
    daisGlow.lineStyle(1.5, 0xffd166, 0.95);
    daisGlow.strokeEllipse(leftCenterX, daisY + 65, 135, 28);

    // Rotating rune effect on dais
    const runeText = this.add.text(leftCenterX, daisY + 65, '✦  ⛩️  ✦  ⛩️  ✦', {
      fontFamily: 'Zen Maru Gothic, sans-serif',
      fontSize: '11px',
      color: '#ffd166'
    }).setOrigin(0.5).setAlpha(0.7);

    this.tweens.add({
      targets: runeText,
      alpha: { from: 0.4, to: 0.9 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Ambient floating hitodama spirit flames near dais
    const flameL = this.add.text(leftCenterX - 95, daisY + 25, '🔥', { fontSize: '20px' }).setAlpha(0.65).setTint(0x00f5d4);
    const flameR = this.add.text(leftCenterX + 75, daisY + 25, '🔥', { fontSize: '20px' }).setAlpha(0.65).setTint(0x00f5d4);
    this.tweens.add({
      targets: [flameL, flameR],
      y: '-=6',
      alpha: { from: 0.4, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Mascot Sprite
    let mascotObj: Phaser.GameObjects.GameObject;
    if (this.textures.exists(mascotKey)) {
      const sprite = this.add.image(leftCenterX, daisY + 6, mascotKey);
      sprite.setDisplaySize(130, 130);
      mascotObj = sprite;
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

    // Mascot Buff Banner
    const compId = this.saveSystem.getSelectedCompanion();
    const companion = CompanionManager.get(compId);
    const buffBg = this.add.graphics();
    buffBg.fillStyle(0x111024, 0.88);
    buffBg.fillRoundedRect(leftCenterX - 180, daisY + 95, 360, 36, 12);
    buffBg.lineStyle(1.5, companion.themeColor, 0.85);
    buffBg.strokeRoundedRect(leftCenterX - 180, daisY + 95, 360, 36, 12);

    const buffTxt = this.add.text(leftCenterX - 10, daisY + 113, `${companion.icon} ${companion.name}: ${companion.skillName} (Buff)`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    const buffArrow = this.add.text(leftCenterX + 162, daisY + 113, '›', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: `#${companion.themeColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);

    // 4. Left Bottom Card: Quick Collection Album & Rules Summary (Two-Column Non-Overlapping Layout)
    const albumCardW = 416;
    const albumCardH = 116;
    const albumCardX = leftCenterX;
    const albumCardY = 530;

    const albumContainer = this.add.container(albumCardX, albumCardY);

    const aBg = this.add.graphics();
    aBg.fillStyle(0x101224, 0.88);
    aBg.fillRoundedRect(-albumCardW / 2, -albumCardH / 2, albumCardW, albumCardH, 16);
    aBg.lineStyle(2, 0x00f5d4, 0.95);
    aBg.strokeRoundedRect(-albumCardW / 2, -albumCardH / 2, albumCardW, albumCardH, 16);

    const discoveredCount = Object.keys(save.discoveredCharacters).length;

    // Glowing Tome Book Icon & Blue Aura Glow
    const bookGlow = this.add.graphics();
    bookGlow.fillStyle(0x00f5d4, 0.2);
    bookGlow.fillCircle(-albumCardW / 2 + 50, 0, 36);

    let bookItem: Phaser.GameObjects.GameObject;
    if (this.textures.exists('album_book_icon')) {
      const bookImg = this.add.image(-albumCardW / 2 + 50, 0, 'album_book_icon');
      bookImg.setDisplaySize(68, 68);
      bookItem = bookImg;
    } else {
      bookItem = this.add.text(-albumCardW / 2 + 35, 0, '📜', { fontSize: '32px' }).setOrigin(0.5);
    }

    // Left Column Content: Constrained within 200px width (starts at x = -albumCardW / 2 + 96)
    const contentLeft = -albumCardW / 2 + 96;

    const aTitle = this.add.text(contentLeft, -36, 'BỘ SƯU TẬP LINH THÚ', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: '#00f5d4'
    });

    const aDesc = this.add.text(contentLeft, -14, `Đã mở: ${discoveredCount}/198 Linh thú • 3 Thần thoại`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#ced4da'
    });

    // Visual Progress Bar Track & Fill
    const barW = 185;
    const barH = 5;
    const barY = 8;
    const pBarBg = this.add.graphics();
    pBarBg.fillStyle(0x232138, 1);
    pBarBg.fillRoundedRect(contentLeft, barY, barW, barH, 3);

    const fillRatio = Math.max(0.04, Math.min(1, discoveredCount / 198));
    const pBarFill = this.add.graphics();
    pBarFill.fillStyle(0x00f5d4, 1);
    pBarFill.fillRoundedRect(contentLeft, barY, barW * fillRatio, barH, 3);

    const aRuleMini = this.add.text(contentLeft, 26, '⚡ Pikachu 2003: 10 Mạng ❤️ • +2s/cặp', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ffd166'
    });

    // Right Action Column: Dedicated Docked Button (Zero Overlap)
    const btnW = 84;
    const btnH = 40;
    const btnX = albumCardW / 2 - 54; // Center X
    const btnY = 0;   // Center Y

    const aBtnBg = this.add.graphics();
    aBtnBg.fillStyle(0x00f5d4, 1);
    aBtnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
    aBtnBg.lineStyle(1.5, 0xa7f3d0, 0.9);
    aBtnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

    const aBtnTxt = this.add.text(btnX, btnY, 'XEM ➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#052c24'
    }).setOrigin(0.5);

    albumContainer.add([aBg, bookGlow, bookItem, aTitle, aDesc, pBarBg, pBarFill, aRuleMini, aBtnBg, aBtnTxt]);
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
   * Right Section: Primary Play CTA, 2x2 Game Mode Cards & Stats
   */
  private createGameHub(save: any): void {
    const hubX = 765;
    const hubW = 530;

    // --- 1. HERO CTA: Primary "CHƠI TIẾP" Button ---
    const currentLvl = Math.min(save.highestLevel, 10);
    const heroY = 120;
    const heroH = 82;

    const heroBtn = this.add.container(hubX, heroY);

    const heroBg = this.add.graphics();
    // Dark Ruby Glass Base
    heroBg.fillStyle(0x1a0c16, 0.88);
    heroBg.fillRoundedRect(-hubW / 2, -heroH / 2, hubW, heroH, 18);
    // Inner Warm Radiant Tint
    heroBg.fillStyle(0xd90429, 0.22);
    heroBg.fillRoundedRect(-hubW / 2 + 2, -heroH / 2 + 2, hubW - 4, heroH - 4, 16);
    // Glowing Neon Coral Red Border
    heroBg.lineStyle(2.5, 0xff2a5f, 0.95);
    heroBg.strokeRoundedRect(-hubW / 2, -heroH / 2, hubW, heroH, 18);

    // Glowing play icon circle
    const iconCircle = this.add.graphics();
    iconCircle.fillStyle(0xd90429, 1);
    iconCircle.fillCircle(-hubW / 2 + 45, 0, 24);
    iconCircle.lineStyle(2, 0xff758f, 0.85);
    iconCircle.strokeCircle(-hubW / 2 + 45, 0, 24);

    const playIcon = this.add.text(-hubW / 2 + 47, 0, '▶', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    const heroTitle = this.add.text(-hubW / 2 + 86, -13, `CHƠI TIẾP • MÀN ${currentLvl}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const heroSub = this.add.text(-hubW / 2 + 86, 14, `Khám phá hướng dồn trọng lực • 10 Mạng ❤️ • Săn 3 Sao ⭐`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      color: '#ffe5ec'
    }).setOrigin(0, 0.5);

    // Right Gold Pill Button: [ VÀO TRẬN ➔ ]
    const goBadgeBg = this.add.graphics();
    goBadgeBg.fillStyle(0xffbe0b, 1);
    goBadgeBg.fillRoundedRect(hubW / 2 - 122, -18, 106, 36, 18);
    goBadgeBg.lineStyle(1.5, 0xffe6a7, 0.9);
    goBadgeBg.strokeRoundedRect(hubW / 2 - 122, -18, 106, 36, 18);

    const goBadgeTxt = this.add.text(hubW / 2 - 69, 0, 'VÀO TRẬN ➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#161426'
    }).setOrigin(0.5);

    heroBtn.add([heroBg, iconCircle, playIcon, heroTitle, heroSub, goBadgeBg, goBadgeTxt]);
    heroBtn.setSize(hubW, heroH).setInteractive({ useHandCursor: true });

    // Subtle breathing pulse for Hero Button
    this.tweens.add({
      targets: heroBtn,
      scaleX: 1.015,
      scaleY: 1.015,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    heroBtn.on('pointerdown', () => {
      this.haptic.medium();
      this.audio.playSelect();
      this.scene.start('GameScene', { levelId: `level_${String(currentLvl).padStart(2, '0')}`, lives: 10 });
    });

    // --- 2. 2x2 Modern Game Modes Grid ---
    const gridStartY = 235;
    const cardW = 255;
    const cardH = 122;
    const colSpacing = 275;
    const rowSpacing = 135;

    const col1X = hubX - colSpacing / 2;
    const col2X = hubX + colSpacing / 2;

    const row1Y = gridStartY;
    const row2Y = gridStartY + rowSpacing;

    const survivalRecord = this.saveSystem.getSurvivalRecord();

    // Mode 1: Chọn Màn Chơi (Stage Select)
    this.createModeCard({
      x: col1X,
      y: row1Y,
      width: cardW,
      height: cardH,
      icon: '🗺️',
      title: 'CHỌN MÀN (1 - 10)',
      sub: '10 Hướng dồn trọng lực cổ điển',
      badge: `Màn cao: ${save.highestLevel}/10  •  ⭐ ${save.stars}/30`,
      actionTxt: 'BẢN ĐỒ ➔',
      primaryColor: 0x0e172a,
      accentColor: 0x3a86ff,
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
      icon: '❄️',
      title: 'SINH TỒN BÃO TUYẾT',
      sub: 'Băng dâng mỗi 10s kiểu Tetris',
      badge: `Kỷ lục: ${survivalRecord.maxWaves} Đợt (${survivalRecord.highScore} PTS)`,
      actionTxt: 'SỐNG CÒN ➔',
      primaryColor: 0x091e2b,
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
      icon: '🌸',
      title: 'THIỀN ĐỊNH (ZEN)',
      sub: 'Vô hạn giờ • Không sợ thua cuộc',
      badge: `Kỷ lục: ${save.zenHighScore || 0} PTS`,
      actionTxt: 'THƯ GIÃN ➔',
      primaryColor: 0x0a2219,
      accentColor: 0x06d6a0,
      onClick: () => {
        this.audio.playSelect();
        this.scene.start('GameScene', { isZenMode: true });
      }
    });

    // Mode 4: Boss Puzzle Orochi
    this.createModeCard({
      x: col2X,
      y: row2Y,
      width: cardW,
      height: cardH,
      icon: '🐉',
      title: 'BOSS: OROCHI',
      sub: 'Bát Xà 8 Đầu • Phá vỡ giáp',
      badge: 'Màn 30 • Thần Xà Cổ Đại',
      actionTxt: 'CHIẾN ĐẤU ➔',
      primaryColor: 0x1f0d2b,
      accentColor: 0x9d4edd,
      onClick: () => {
        this.audio.playBossHit();
        this.scene.start('GameScene', { levelId: 'level_30', lives: 10 });
      }
    });

    // --- 3. Bottom Player Stats & Summary Bar ---
    const statsY = 530;
    const statsH = 70;
    const statsContainer = this.add.container(hubX, statsY);

    const sBg = this.add.graphics();
    sBg.fillStyle(0x101224, 0.88);
    sBg.fillRoundedRect(-hubW / 2, -statsH / 2, hubW, statsH, 16);
    sBg.lineStyle(1.5, 0x3a86ff, 0.75);
    sBg.strokeRoundedRect(-hubW / 2, -statsH / 2, hubW, statsH, 16);

    const sTitle = this.add.text(0, -17, '🏆 THÀNH TÍCH NGƯỜI CHƠI', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '800',
      color: '#ffd700'
    }).setOrigin(0.5);

    const sLine1 = this.add.text(0, 4, `📊 Màn cao: Màn ${save.highestLevel}/10   ⭐ ${save.stars} Sao   💰 ${save.coins} Xu`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f8f9fa'
    }).setOrigin(0.5);

    const sLine2 = this.add.text(0, 23, `❄️ Sinh Tồn: ${survivalRecord.maxWaves} Đợt (${survivalRecord.highScore} PTS)   🌸 Zen: ${save.zenHighScore || 0} PTS`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f5d4'
    }).setOrigin(0.5);

    statsContainer.add([sBg, sTitle, sLine1, sLine2]);
  }

  /**
   * Helper to create sleek, modern Game Mode cards matching Image 3
   */
  private createModeCard(opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    icon: string;
    title: string;
    sub: string;
    badge: string;
    actionTxt: string;
    primaryColor: number;
    accentColor: number;
    onClick: () => void;
  }): void {
    const container = this.add.container(opts.x, opts.y);

    const bg = this.add.graphics();
    // Glass base
    bg.fillStyle(0x101224, 0.85);
    bg.fillRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);
    // Inner theme tint
    bg.fillStyle(opts.accentColor, 0.12);
    bg.fillRoundedRect(-opts.width / 2 + 2, -opts.height / 2 + 2, opts.width - 4, opts.height - 4, 14);
    // Neon border
    bg.lineStyle(2, opts.accentColor, 0.95);
    bg.strokeRoundedRect(-opts.width / 2, -opts.height / 2, opts.width, opts.height, 16);

    const icon = this.add.text(-opts.width / 2 + 26, -opts.height / 2 + 28, opts.icon, {
      fontSize: '26px'
    }).setOrigin(0.5);

    const title = this.add.text(-opts.width / 2 + 48, -opts.height / 2 + 28, opts.title, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const sub = this.add.text(-opts.width / 2 + 18, 0, opts.sub, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#ced4da'
    }).setOrigin(0, 0.5);

    // Bottom Badge text (Left) - Compact to avoid any overlap
    const badgeTxt = this.add.text(-opts.width / 2 + 18, opts.height / 2 - 20, opts.badge, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: `#${opts.accentColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0, 0.5);

    // Right Action Pill Button (Glass capsule with neon stroke)
    const btnW = 88;
    const btnH = 26;
    const btnX = opts.width / 2 - 16 - btnW / 2;
    const btnY = opts.height / 2 - 20;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x101224, 0.9);
    btnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
    btnBg.lineStyle(1.5, opts.accentColor, 0.9);
    btnBg.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 13);

    const actionPill = this.add.text(btnX, btnY, opts.actionTxt, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '10.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, icon, title, sub, badgeTxt, btnBg, actionPill]);
    container.setSize(opts.width, opts.height).setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.03, duration: 90 });
      btnBg.fillStyle(opts.accentColor, 0.35);
      btnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 90 });
      btnBg.fillStyle(0x101224, 0.9);
      btnBg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 13);
    });

    container.on('pointerdown', () => {
      this.haptic.light();
      opts.onClick();
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
    const title = this.add.text(0, -cardH / 2 + 40, '⛩️ CẨM NANG & CƠ CHẾ NỐI THÚ PIKACHU 2003', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -cardH / 2 + 68, 'Hiểu rõ quy tắc để chinh phục 10 màn chơi & Bách Quỷ Dạ Hành', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      color: '#adb5bd'
    }).setOrigin(0.5);
    modal.add(sub);

    // 4 Rule Sections
    const rules = [
      {
        icon: '⚡',
        title: 'QUY TẮC 2 KHÚC GẬP (PIKACHU 2003)',
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

      const iconObj = this.add.text(itemX + 22, itemY + 22, r.icon, { fontSize: '24px' });
      const titleObj = this.add.text(itemX + 54, itemY + 20, r.title, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '900',
        color: r.color
      });

      const descObj = this.add.text(itemX + 22, itemY + 48, r.desc, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        color: '#ced4da',
        wordWrap: { width: colW - 40 }
      });

      modal.add([rBg, iconObj, titleObj, descObj]);
    });

    // Close Button
    const closeBtn = this.add.container(0, cardH / 2 - 45);
    const cBg = this.add.graphics();
    cBg.fillStyle(0xe63946, 1);
    cBg.fillRoundedRect(-110, -20, 220, 40, 12);

    const cTxt = this.add.text(0, 0, 'ĐÃ HIỂU & QUAY LẠI ➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(220, 40).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.rulesModalContainer = null;
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -cardH / 2 + 62, '16 Phong cách Onet Cổ Điển • Click vào bất kỳ chủ đề nào để chuyển đổi giao diện', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontStyle: '800',
        color: isAct ? '#ffffff' : '#e0e1dd'
      }).setOrigin(0, 0);

      // Tag
      const tagTxt = this.add.text(-itemW / 2 + 42, -3, th.tag, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        color: '#8d99ae'
      }).setOrigin(0, 0);

      // Status Pill
      const statusPill = this.add.text(-itemW / 2 + 42, 17, isAct ? '✓ ĐANG CHỌN' : 'CHỌN ➔', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '9.5px',
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
    cBg.fillRoundedRect(-100, -18, 200, 36, 12);
    cBg.lineStyle(1.5, 0x5a557d, 0.8);
    cBg.strokeRoundedRect(-100, -18, 200, 36, 12);

    const cTxt = this.add.text(0, 0, 'ĐÓNG [ ✕ ]', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
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
   * Stage Select (1 - 10) Modal
   */
  private openStageSelectModal(): void {
    if (this.stageModalContainer) return;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const save = this.saveSystem || SaveSystem.getInstance();

    const modal = this.add.container(width / 2, height / 2).setDepth(200);
    this.stageModalContainer = modal;

    const { width: screenW } = getScreenDimensions();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    modal.add(overlay);

    const card = this.add.graphics();
    card.fillStyle(0x181828, 1);
    card.fillRoundedRect(-440, -240, 880, 480, 22);
    card.lineStyle(2, 0xffd700, 0.9);
    card.strokeRoundedRect(-440, -240, 880, 480, 22);
    modal.add(card);

    const title = this.add.text(0, -200, '🗺️ CHỌN MÀN CHƠI (1 - 10)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const sub = this.add.text(0, -172, '10 Màn Thử Thách Cân Bằng • Băng • Khóa • Đá • Trùm Thần Xà 🐉', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      color: '#adb5bd'
    }).setOrigin(0.5);
    modal.add(sub);

    const STAGES = [
      { id: 'level_01', num: 1, name: 'Màn 1: Tĩnh Lặng', sub: '90s • 4x6 Khởi động', boss: false },
      { id: 'level_02', num: 2, name: 'Màn 2: Trọng Lực Đáy', sub: '120s • Dồn xuống + Băng', boss: false },
      { id: 'level_03', num: 3, name: 'Màn 3: Khinh Khí Đỉnh', sub: '125s • Dồn lên + Đá cản', boss: false },
      { id: 'level_04', num: 4, name: 'Màn 4: Thủy Triều Trái', sub: '135s • Dồn trái + Sương mù', boss: false },
      { id: 'level_05', num: 5, name: 'Màn 5: Phong Vân Phải', sub: '135s • Dồn phải + Ổ khóa', boss: false },
      { id: 'level_06', num: 6, name: 'Màn 6: Hợp Tung Ngang', sub: '150s • Ép tâm + Băng đá', boss: false },
      { id: 'level_07', num: 7, name: 'Màn 7: Quy Tụ Dọc', sub: '155s • Ép dọc + Sương mù', boss: false },
      { id: 'level_08', num: 8, name: 'Màn 8: Phân Ly Dọc', sub: '175s • Tách đôi + Tứ thạch', boss: false },
      { id: 'level_09', num: 9, name: 'Màn 9: Phân Ly Ngang', sub: '185s • Tách ngang + Hàn băng', boss: false },
      { id: 'level_10', num: 10, name: 'Màn 10: Trảm Xà Thần 🐉', sub: '210s • Bát Kỳ Đại Xà (400HP)', boss: true }
    ];

    const cardW = 155;
    const cardH = 106;
    const colSpacing = 168;
    const rowY1 = -90;
    const rowY2 = 45;

    STAGES.forEach((stg, i) => {
      const isSecondRow = i >= 5;
      const colIndex = i % 5;
      const posX = -2 * colSpacing + colIndex * colSpacing;
      const posY = isSecondRow ? rowY2 : rowY1;

      const row = this.add.container(posX, posY);

      const stars = save.getLevelStars(stg.id);
      const isPerfect = stars === 3;
      let starStr = '☆☆☆';
      if (stars === 3) starStr = '⭐⭐⭐';
      else if (stars === 2) starStr = '⭐⭐☆';
      else if (stars === 1) starStr = '⭐☆☆';

      const rBg = this.add.graphics();
      if (stg.boss) {
        rBg.fillStyle(isPerfect ? 0x3d1a24 : 0x2a1219, 0.95);
        rBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        rBg.lineStyle(1.8, isPerfect ? 0xffd700 : 0xff595e, 0.95);
        rBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      } else {
        rBg.fillStyle(isPerfect ? 0x27203a : 0x232538, 0.95);
        rBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        rBg.lineStyle(1.5, isPerfect ? 0xffd700 : 0x4f5d75, isPerfect ? 0.9 : 0.7);
        rBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
      }

      const numBadge = this.add.text(0, -34, stg.boss ? '👑 TRÙM CUỐI' : `MÀN ${stg.num}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: '900',
        color: stg.boss ? '#ff595e' : (isPerfect ? '#ffd700' : '#00f5d4')
      }).setOrigin(0.5);

      const stgName = this.add.text(0, -16, stg.name.split(':')[1]?.trim() || stg.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: stg.boss ? '11px' : '12px',
        fontStyle: '800',
        color: stg.boss ? '#ffd166' : '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      const stgSub = this.add.text(0, 3, stg.sub, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '9.5px',
        color: stg.boss ? '#fca311' : '#adb5bd',
        align: 'center'
      }).setOrigin(0.5);

      const starsTxt = this.add.text(0, 21, starStr, {
        fontSize: '13px'
      }).setOrigin(0.5);

      const playTxt = this.add.text(0, 38, isPerfect ? 'CHƠI LẠI ➔' : (stars > 0 ? 'SĂN 3 SAO ➔' : (stg.boss ? 'KHIÊU CHIẾN ⚔️' : 'CHƠI ➔')), {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: isPerfect ? '#ffd700' : (stg.boss ? '#ff595e' : '#ff758f')
      }).setOrigin(0.5);

      row.add([rBg, numBadge, stgName, stgSub, starsTxt, playTxt]);
      row.setSize(cardW, cardH).setInteractive({ useHandCursor: true });

      row.on('pointerdown', () => {
        this.audio.playSelect();
        modal.destroy();
        this.stageModalContainer = null;
        this.scene.start('GameScene', { levelId: stg.id, lives: 10 });
      });

      modal.add(row);
    });

    // Close button
    const closeBtn = this.add.container(0, 185);
    const cBg = this.add.graphics();
    cBg.fillStyle(0xe63946, 1);
    cBg.fillRoundedRect(-90, -18, 180, 36, 10);
    const cTxt = this.add.text(0, 0, 'ĐÓNG BẢNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(180, 36).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      modal.destroy();
      this.stageModalContainer = null;
    });
    modal.add(closeBtn);
  }

  /**
   * Ambient Falling Sakura Petals
   */
  private createAmbientSakura(): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    for (let i = 0; i < 20; i++) {
      const petal = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-50, height),
        'particle_sakura'
      );
      petal.setScale(Phaser.Math.FloatBetween(0.4, 0.85));
      petal.setAlpha(Phaser.Math.FloatBetween(0.2, 0.65));

      this.tweens.add({
        targets: petal,
        y: height + 60,
        x: `+=${Phaser.Math.Between(40, 100)}`,
        angle: 360,
        duration: Phaser.Math.Between(6000, 12000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        onRepeat: () => {
          petal.x = Phaser.Math.Between(0, width);
          petal.y = -40;
        }
      });
    }
  }

  public handleBackButton(): boolean {
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
