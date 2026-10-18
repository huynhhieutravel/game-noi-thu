import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { CompanionManager } from './CompanionManager';
import { CompanionConfig } from '../types';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { CompanionModal } from './CompanionModal';

export class CompanionModal3D {
  private static readonly TOTAL_FRAMES = 18;

  public static open(
    scene: Phaser.Scene,
    companionIdOrOnSelect?: string | ((companion: CompanionConfig) => void),
    onSelectCallback?: (companion: CompanionConfig) => void
  ): Phaser.GameObjects.Container {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const save = SaveSystem.getInstance();
    const audio = AudioSystem.getInstance();

    let activeCompId = 'inari_kitsune';
    let onSelect: ((companion: CompanionConfig) => void) | undefined = undefined;

    if (typeof companionIdOrOnSelect === 'string') {
      activeCompId = companionIdOrOnSelect;
      onSelect = onSelectCallback;
    } else if (typeof companionIdOrOnSelect === 'function') {
      onSelect = companionIdOrOnSelect;
      activeCompId = save.getSelectedCompanion();
    }

    const container = scene.add.container(width / 2, height / 2).setDepth(400);

    // Initial scale animation
    container.setScale(0.88);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 240,
      ease: 'Back.easeOut'
    });

    const closeModal = () => {
      audio.playSelect();
      scene.tweens.add({
        targets: container,
        scale: 0.9,
        alpha: 0,
        duration: 170,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          container.destroy();
        }
      });
    };

    // 1. Dark Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x060713, 0.88);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', closeModal);

    // 2. Main Lacquer Frame
    const frameW = 880;
    const frameH = 506;
    const frame = scene.add.graphics();

    const activeConfig = CompanionManager.get(activeCompId);
    const primaryThemeColor = activeConfig.themeColor || 0xff758f;
    const borderGold = 0xffd700;

    frame.fillStyle(0x101224, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    frame.lineStyle(1.2, primaryThemeColor, 0.45);
    frame.strokeRoundedRect(-frameW / 2 + 5, -frameH / 2 + 5, frameW - 10, frameH - 10, 16);

    frame.lineStyle(2.5, borderGold, 0.9);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // Header Bar
    const headerBg = scene.add.graphics();
    headerBg.fillStyle(0x1a1a2e, 0.92);
    headerBg.fillRoundedRect(-frameW / 2 + 12, -frameH / 2 + 10, frameW - 24, 46, 12);
    headerBg.lineStyle(1.5, primaryThemeColor, 0.8);
    headerBg.strokeRoundedRect(-frameW / 2 + 12, -frameH / 2 + 10, frameW - 24, 46, 12);

    const headerTitle = `⛩️ LINH THÚ 3D • ${activeConfig.name.toUpperCase()} (${activeConfig.title.toUpperCase()})`;
    const titleText = scene.add.text(0, -frameH / 2 + 33, headerTitle, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd700',
      letterSpacing: 0.5
    }).setOrigin(0.5);

    // Coins Pill Top-Right
    const coinsText = scene.add.text(frameW / 2 - 95, -frameH / 2 + 33, `💰 ${save.getCoins()} XU`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Close button (✖)
    const closeBtn = scene.add.text(frameW / 2 - 32, -frameH / 2 + 33, '✖', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', closeModal);
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4d6d'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#adb5bd'));

    container.add([backdrop, frame, headerBg, titleText, coinsText, closeBtn]);

    // =========================================================================
    // 3. TOP TAB SELECTOR: 10 COMPANIONS (2 ROWS OF 5)
    // =========================================================================
    const allCompanions = CompanionManager.getAll();
    const tabRow1Y = -frameH / 2 + 70;
    const tabRow2Y = -frameH / 2 + 96;
    const tabW = 82;
    const tabH = 22;
    const tabSpacing = 86;
    const startTabX = -((5 - 1) * tabSpacing) / 2;

    allCompanions.forEach((comp, idx) => {
      const isRow2 = idx >= 5;
      const colIdx = idx % 5;
      const tX = startTabX + colIdx * tabSpacing;
      const tY = isRow2 ? tabRow2Y : tabRow1Y;
      const isTabSelected = comp.id === activeCompId;

      const tBg = scene.add.graphics();
      tBg.fillStyle(isTabSelected ? comp.themeColor : 0x16182c, isTabSelected ? 0.95 : 0.8);
      tBg.fillRoundedRect(tX - tabW / 2, tY - tabH / 2, tabW, tabH, 6);
      tBg.lineStyle(1.2, isTabSelected ? 0xffd700 : 0x3d405b, 0.85);
      tBg.strokeRoundedRect(tX - tabW / 2, tY - tabH / 2, tabW, tabH, 6);

      const tTxt = scene.add.text(tX, tY, `${comp.icon} ${comp.name.split(' ')[0]}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '800',
        color: isTabSelected ? '#000000' : '#ced4da'
      }).setOrigin(0.5);

      const tZone = scene.add.zone(tX, tY, tabW, tabH).setInteractive({ useHandCursor: true });
      tZone.on('pointerdown', () => {
        if (activeCompId !== comp.id) {
          audio.playSelect();
          container.destroy();
          CompanionModal3D.open(scene, comp.id, onSelect);
        }
      });

      container.add([tBg, tTxt, tZone]);
    });

    // =========================================================================
    // 4. LEFT SIDE: 3D TURNTABLE & INTERACTIVE DAIS STAGE
    // =========================================================================
    const leftX = -215;
    const centerShowY = 56;

    // Glowing Pedestal / Dais with mystical runes
    const daisGlow = scene.add.graphics();
    daisGlow.fillStyle(primaryThemeColor, 0.22);
    daisGlow.fillEllipse(leftX, centerShowY + 115, 230, 54);
    daisGlow.lineStyle(2, 0xffd700, 0.95);
    daisGlow.strokeEllipse(leftX, centerShowY + 115, 200, 42);
    daisGlow.lineStyle(1.5, primaryThemeColor, 0.85);
    daisGlow.strokeEllipse(leftX, centerShowY + 115, 150, 28);

    const runeDaisText = activeConfig.isApexSSR
      ? '✦  👑  ✦  ⚡  ✦  👑  ✦  ⚡  ✦'
      : '✦  ⛩️  ✦  ✨  ✦  ⛩️  ✦  ✨  ✦';

    const runeDais = scene.add.text(leftX, centerShowY + 115, runeDaisText, {
      fontFamily: 'Zen Maru Gothic, sans-serif',
      fontSize: '11px',
      color: '#ffd700'
    }).setOrigin(0.5).setAlpha(0.85);

    // Floating spirit sparks
    const sparkEmoji = activeConfig.icon;
    const spark1 = scene.add.text(leftX - 105, centerShowY + 45, sparkEmoji, { fontSize: '18px' })
      .setAlpha(0.7)
      .setTint(primaryThemeColor);
    const spark2 = scene.add.text(leftX + 90, centerShowY + 45, sparkEmoji, { fontSize: '18px' })
      .setAlpha(0.7)
      .setTint(primaryThemeColor);
    scene.tweens.add({
      targets: [spark1, spark2],
      y: '-=10',
      alpha: { from: 0.35, to: 0.85 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3D Sprite Setup
    const has3DFrames =
      activeCompId === 'inari_kitsune' ||
      activeCompId === 'ryujin_pearl' ||
      activeCompId === 'hi_no_tori';

    const spritePrefix =
      activeCompId === 'hi_no_tori'
        ? 'hinotori_3d'
        : (activeCompId === 'ryujin_pearl' ? 'ryujin_3d' : 'inari_3d');

    let currentFrame = 0;
    const getFrameKey = (frameIdx: number) => {
      const idx =
        ((frameIdx % CompanionModal3D.TOTAL_FRAMES) + CompanionModal3D.TOTAL_FRAMES) %
        CompanionModal3D.TOTAL_FRAMES;
      return `${spritePrefix}_${idx.toString().padStart(2, '0')}`;
    };

    let initialKey = `char_${activeCompId}`;
    if (has3DFrames && scene.textures.exists(getFrameKey(0))) {
      initialKey = getFrameKey(0);
    }

    const mainSprite = scene.add.image(leftX, centerShowY - 10, initialKey);
    mainSprite.setDisplaySize(260, 260);

    // Soft floating bobbing
    const bobTween = scene.tweens.add({
      targets: mainSprite,
      y: centerShowY - 18,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const updateViewFrame = (newFrame: number) => {
      if (!has3DFrames) return;
      currentFrame =
        ((newFrame % CompanionModal3D.TOTAL_FRAMES) + CompanionModal3D.TOTAL_FRAMES) %
        CompanionModal3D.TOTAL_FRAMES;
      const key = getFrameKey(currentFrame);
      if (scene.textures.exists(key)) {
        mainSprite.setTexture(key);
      }
    };

    if (has3DFrames) {
      updateViewFrame(0);
    }

    // Interactive Drag & Tap Zone
    const hitZoneW = 300;
    const hitZoneH = 320;
    const touchZone = scene.add.zone(leftX, centerShowY, hitZoneW, hitZoneH)
      .setInteractive({ useHandCursor: true });

    let isDragging = false;
    let dragStartX = 0;
    let dragStartFrame = 0;

    const triggerTapInteraction = () => {
      audio.playVictory();
      bobTween.pause();

      scene.tweens.add({
        targets: mainSprite,
        y: centerShowY - 32,
        scaleX: 1.12,
        scaleY: 0.9,
        duration: 160,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          bobTween.resume();
        }
      });

      const pool = ['✨', '💫', '🌸', activeConfig.icon, '⚡'];
      for (let i = 0; i < 6; i++) {
        const pEmoji = pool[i % pool.length];
        const spark = scene.add.text(
          leftX + Phaser.Math.Between(-55, 55),
          centerShowY - 20 + Phaser.Math.Between(-35, 20),
          pEmoji,
          { fontSize: '18px' }
        ).setOrigin(0.5);

        container.add(spark);

        scene.tweens.add({
          targets: spark,
          y: spark.y - Phaser.Math.Between(30, 60),
          x: spark.x + Phaser.Math.Between(-30, 30),
          alpha: 0,
          scale: { from: 1.2, to: 0.4 },
          duration: 650 + i * 70,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy()
        });
      }
    };

    touchZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      dragStartX = pointer.x;
      dragStartFrame = currentFrame;
    });

    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      const deltaX = pointer.x - dragStartX;
      if (has3DFrames) {
        const frameDelta = Math.floor(deltaX / 14);
        updateViewFrame(dragStartFrame + frameDelta);
      } else {
        // Smooth 3D tilt & rotation effect for 2D sticker assets
        const tiltAngle = Phaser.Math.Clamp(deltaX * 0.08, -15, 15);
        mainSprite.setAngle(tiltAngle);
      }
    };
    scene.input.on('pointermove', onPointerMove);

    const finishDrag = (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      isDragging = false;
      if (!has3DFrames) {
        scene.tweens.add({
          targets: mainSprite,
          angle: 0,
          duration: 200,
          ease: 'Sine.easeOut'
        });
      }
      const totalMoved = Math.abs(pointer.x - dragStartX);
      if (totalMoved < 8) {
        triggerTapInteraction();
      }
    };

    touchZone.on('pointerup', finishDrag);
    touchZone.on('pointerupoutside', finishDrag);

    container.add([daisGlow, runeDais, spark1, spark2, mainSprite, touchZone]);

    // =========================================================================
    // 5. RIGHT SIDE: 3 EVOLUTION TIERS, 30 LEVELS, STATS & BOSS COUNTERS
    // =========================================================================
    const rightX = 220;
    const rightW = 390;

    const currentTier = save.getCompanionTier(activeCompId);
    const currentLevel = save.getCompanionLevel(activeCompId);
    const currentShards = save.getCompanionShards(activeCompId);
    const maxLevel = save.getMaxLevelForTier(currentTier);
    const tierInfo = CompanionManager.getTierInfo(activeCompId, currentTier);
    const totalStats = save.getCompanionTotalStats(activeCompId);
    const lvlCheck = save.canLevelUpCompanion(activeCompId);
    const evoCheck = save.canEvolveCompanion(activeCompId);

    // 1. Tier Badge & Level Pill
    const tierBgY = -frameH / 2 + 120;
    const tierBg = scene.add.graphics();
    const tierBgColor = currentTier === 3 ? 0x4a1236 : (currentTier === 2 ? 0x2b2206 : 0x14281d);
    tierBg.fillStyle(tierBgColor, 0.95);
    tierBg.fillRoundedRect(rightX - rightW / 2, tierBgY, rightW, 28, 8);
    tierBg.lineStyle(1.5, borderGold, 0.9);
    tierBg.strokeRoundedRect(rightX - rightW / 2, tierBgY, rightW, 28, 8);

    const tierLabel = `${tierInfo.badge} • CẤP ${currentLevel}/${maxLevel}`;

    const tierText = scene.add.text(rightX, tierBgY + 14, tierLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd700',
      letterSpacing: 0.5
    }).setOrigin(0.5);

    // 1b. Cumulative Stats Ribbon
    const statsRibbonY = tierBgY + 32;
    const statsRibbonH = 20;
    const statsRibbonBg = scene.add.graphics();
    statsRibbonBg.fillStyle(0x0e1022, 0.9);
    statsRibbonBg.fillRoundedRect(rightX - rightW / 2, statsRibbonY, rightW, statsRibbonH, 6);
    statsRibbonBg.lineStyle(1, 0x3d405b, 0.7);
    statsRibbonBg.strokeRoundedRect(rightX - rightW / 2, statsRibbonY, rightW, statsRibbonH, 6);

    const statsLabel = `💰 +${totalStats.goldBonusPercent}% Vàng & EXP  •  ⚡ +${totalStats.rageBonusPercent}% Nộ  •  ⏱️ +${totalStats.comboTimeBonusSec}s Combo`;
    const statsText = scene.add.text(rightX, statsRibbonY + 10, statsLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '10.5px',
      fontStyle: '800',
      color: '#00f5d4'
    }).setOrigin(0.5);

    // 2. Active Skill & Boss Counter Box
    const skillBoxY = statsRibbonY + statsRibbonH + 6;
    const skillBoxH = 86;
    const skillBox = scene.add.graphics();
    skillBox.fillStyle(0x131528, 0.95);
    skillBox.fillRoundedRect(rightX - rightW / 2, skillBoxY, rightW, skillBoxH, 10);
    skillBox.lineStyle(1.5, primaryThemeColor, 0.85);
    skillBox.strokeRoundedRect(rightX - rightW / 2, skillBoxY, rightW, skillBoxH, 10);

    const skillTitle = scene.add.text(
      rightX - rightW / 2 + 12,
      skillBoxY + 10,
      `⚡ TUYỆT CHIÊU: ${tierInfo.skillName.toUpperCase()}`,
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontStyle: '900',
        color: `#${primaryThemeColor.toString(16).padStart(6, '0')}`
      }
    );

    const skillDesc = scene.add.text(
      rightX - rightW / 2 + 12,
      skillBoxY + 28,
      tierInfo.skillDesc,
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        color: '#ced4da',
        wordWrap: { width: rightW - 24 },
        lineSpacing: 1.5
      }
    );

    const bossCounterText = scene.add.text(
      rightX - rightW / 2 + 12,
      skillBoxY + 56,
      `🛡️ KHẮC CHẾ: ${tierInfo.bossCounterDesc}`,
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        fontStyle: '800',
        color: '#ffd166',
        wordWrap: { width: rightW - 24 }
      }
    );

    // 3. Passive Buff Box
    const buffBoxY = skillBoxY + skillBoxH + 6;
    const buffBoxH = 46;
    const buffBox = scene.add.graphics();
    buffBox.fillStyle(0x131528, 0.95);
    buffBox.fillRoundedRect(rightX - rightW / 2, buffBoxY, rightW, buffBoxH, 10);
    buffBox.lineStyle(1.2, 0x3a86ff, 0.7);
    buffBox.strokeRoundedRect(rightX - rightW / 2, buffBoxY, rightW, buffBoxH, 10);

    const buffTitle = scene.add.text(
      rightX - rightW / 2 + 12,
      buffBoxY + 8,
      `✨ NỘI TẠI: ${(activeConfig.passiveName || 'GIA HỘ').toUpperCase()}`,
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }
    );

    const buffDesc = scene.add.text(
      rightX - rightW / 2 + 12,
      buffBoxY + 25,
      activeConfig.passiveDesc || '',
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10.5px',
        color: '#ced4da',
        wordWrap: { width: rightW - 24 },
        lineSpacing: 1.2
      }
    );

    // 4. Progression & Smart Action Box (Level Up or Evolution)
    const upgBoxY = buffBoxY + buffBoxH + 6;
    const upgBoxH = 76;
    const upgBox = scene.add.graphics();
    upgBox.fillStyle(0x0e1020, 0.95);
    upgBox.fillRoundedRect(rightX - rightW / 2, upgBoxY, rightW, upgBoxH, 10);
    upgBox.lineStyle(1.2, borderGold, 0.65);
    upgBox.strokeRoundedRect(rightX - rightW / 2, upgBoxY, rightW, upgBoxH, 10);

    const isUnlocked = save.isCompanionUnlocked(activeCompId);
    const summonCheck = save.canSummonCompanion(activeCompId);
    const isMaxTierMaxLevel = currentTier >= 3 && currentLevel >= 30;
    const isReadyForEvolution = currentLevel >= maxLevel && currentTier < 3;
    const curExp = save.getCompanionExp(activeCompId);
    const reqExp = save.getRequiredExpForNextLevel(currentTier, currentLevel);

    let upgTitleText = '';
    let upgBarLabel = '';
    let upgBarFrac = 1;
    let upgBarColor = 0xffd700;

    if (!isUnlocked) {
      upgTitleText = '🔮 TRIỆU HỒI LINH THÚ: THU THẬP 20 MẢNH';
      upgBarFrac = Math.min(1, currentShards / 20);
      upgBarLabel = `TIẾN ĐỘ THẦN THÚ: ${currentShards} / 20 MẢNH (${Math.round(upgBarFrac * 100)}%)`;
      upgBarColor = summonCheck.canSummon ? 0xffb703 : 0x00f5d4;
    } else if (isMaxTierMaxLevel) {
      upgTitleText = '👑 CỰC PHẨM TỐI THƯỢNG: ĐÃ ĐẠT GIỚI HẠN TU VI (CẤP 30)';
      upgBarLabel = 'ĐÃ THỨC TỈNH 100% TIỀM NĂNG TOÀN NĂNG';
      upgBarFrac = 1;
      upgBarColor = 0xffd700;
    } else if (isReadyForEvolution) {
      const nextTierInfo = CompanionManager.getTierInfo(activeCompId, currentTier + 1);
      upgTitleText = `🔥 ĐỘT PHÁ TIẾN HÓA: BẬC ${currentTier + 1} (${nextTierInfo.tierName.toUpperCase()})`;
      upgBarFrac = Math.min(1, currentShards / evoCheck.requiredShards);
      upgBarLabel = `MẢNH: ${currentShards} / ${evoCheck.requiredShards} • CẦN ${evoCheck.requiredCoins} XU`;
      upgBarColor = evoCheck.canEvolve ? 0xff4d6d : 0x00f5d4;
    } else {
      upgTitleText = `⚡ THĂNG CẤP LINH THÚ: CẤP ${currentLevel} ➔ ${currentLevel + 1} (MAX BẬC: ${maxLevel})`;
      const expFrac = Math.min(1, curExp / Math.max(1, reqExp));
      upgBarFrac = expFrac;
      upgBarLabel = `EXP: ${curExp}/${reqExp} (${Math.round(expFrac * 100)}%) • CẤP ${currentLevel}/${maxLevel}`;
      upgBarColor = 0x00f5d4;
    }

    const upgTitle = scene.add.text(
      rightX - rightW / 2 + 12,
      upgBoxY + 10,
      upgTitleText,
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10.5px',
        fontStyle: '800',
        color: '#ffd700'
      }
    );

    // Progress Bar inside Box
    const upgBarY = upgBoxY + 30;
    const upgBarW = rightW - 24;
    const upgBarH = 13;
    const upgBarGfx = scene.add.graphics();
    upgBarGfx.fillStyle(0x191a32, 1);
    upgBarGfx.fillRoundedRect(rightX - upgBarW / 2, upgBarY - upgBarH / 2, upgBarW, upgBarH, 5);
    upgBarGfx.lineStyle(1, 0x3d405b, 0.8);
    upgBarGfx.strokeRoundedRect(rightX - upgBarW / 2, upgBarY - upgBarH / 2, upgBarW, upgBarH, 5);

    if (upgBarFrac > 0) {
      upgBarGfx.fillStyle(upgBarColor, 0.95);
      upgBarGfx.fillRoundedRect(rightX - upgBarW / 2, upgBarY - upgBarH / 2, upgBarW * upgBarFrac, upgBarH, 5);
    }

    const upgBarText = scene.add.text(rightX, upgBarY, upgBarLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '9.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Action Button inside Progression Box
    let upgBtnZone: Phaser.GameObjects.Zone | null = null;
    if (isUnlocked && !isMaxTierMaxLevel) {
      const upgBtnY = upgBoxY + 54;
      const upgBtnW = rightW - 24;
      const upgBtnH = 24;
      const upgBtnBg = scene.add.graphics();

      let btnColor = 0x222538;
      let btnBorder = 0x4a4e69;
      let btnLabel = '';
      let isActionActive = false;

      if (isReadyForEvolution) {
        isActionActive = evoCheck.canEvolve;
        btnColor = isActionActive ? 0xd90429 : 0x222538;
        btnBorder = isActionActive ? 0xffd700 : 0x4a4e69;
        btnLabel = isActionActive
          ? `🔥 BẤM ĐỂ ĐỘT PHÁ TIẾN HÓA BẬC ${currentTier + 1}! (${evoCheck.requiredShards} MẢNH + ${evoCheck.requiredCoins} XU)`
          : `🔒 CHƯA ĐỦ ĐIỀU KIỆN ĐỘT PHÁ (CẦN ${evoCheck.requiredShards} MẢNH + ${evoCheck.requiredCoins} XU)`;
      } else {
        isActionActive = lvlCheck.canLevelUp;
        btnColor = isActionActive ? 0x7209b7 : 0x222538;
        btnBorder = isActionActive ? 0xffd700 : 0x4a4e69;
        btnLabel = isActionActive
          ? `⚡ LÊN CẤP ${currentLevel + 1} (${lvlCheck.requiredCoins} XU) • +1% VÀNG, +0.5% NỘ, +0.1s COMBO`
          : `🔒 CẦN ${lvlCheck.requiredCoins} XU HOẶC EXP ĐỂ LÊN CẤP`;
      }

      upgBtnBg.fillStyle(btnColor, 1);
      upgBtnBg.fillRoundedRect(rightX - upgBtnW / 2, upgBtnY - upgBtnH / 2, upgBtnW, upgBtnH, 6);
      upgBtnBg.lineStyle(1.2, btnBorder, 0.95);
      upgBtnBg.strokeRoundedRect(rightX - upgBtnW / 2, upgBtnY - upgBtnH / 2, upgBtnW, upgBtnH, 6);

      const upgBtnTxt = scene.add.text(rightX, upgBtnY, btnLabel, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '9.5px',
        fontStyle: '900',
        color: isActionActive ? '#ffffff' : '#8d99ae'
      }).setOrigin(0.5);

      upgBtnZone = scene.add.zone(rightX, upgBtnY, upgBtnW, upgBtnH).setInteractive({ useHandCursor: true });
      upgBtnZone.on('pointerdown', () => {
        if (isReadyForEvolution) {
          if (evoCheck.canEvolve) {
            const res = save.evolveCompanion(activeCompId);
            if (res.success) {
              audio.playVictory();
              const nextT = CompanionManager.getTierInfo(activeCompId, res.newTier);
              if ((scene as any).showNotice) {
                (scene as any).showNotice(`🎉 ${activeConfig.name.toUpperCase()} ĐÃ ĐỘT PHÁ LÊN BẬC ${res.newTier} (${nextT.tierName})! 🚀`, 0xffd700);
              }
              container.destroy();
              CompanionModal3D.open(scene, activeCompId, onSelect);
            }
          } else {
            audio.playError();
            if ((scene as any).showNotice) {
              (scene as any).showNotice(`⚠️ ${evoCheck.reason}`, 0xff4d6d);
            }
          }
        } else {
          if (lvlCheck.canLevelUp) {
            const res = save.levelUpCompanion(activeCompId);
            if (res.success) {
              audio.playVictory();
              if ((scene as any).showNotice) {
                (scene as any).showNotice(`✨ ${activeConfig.name.toUpperCase()} ĐÃ ĐẠT CẤP ${res.newLevel}! (+1% Vàng, +0.5% Nộ, +0.1s Combo) 🎉`, 0xffd700);
              }
              container.destroy();
              CompanionModal3D.open(scene, activeCompId, onSelect);
            }
          } else {
            audio.playError();
            if ((scene as any).showNotice) {
              (scene as any).showNotice(`⚠️ ${lvlCheck.reason}`, 0xff4d6d);
            }
          }
        }
      });

      container.add([upgBtnBg, upgBtnTxt, upgBtnZone]);
    } else if (!isUnlocked) {
      // Show summon hint in sub-button area
      const hintY = upgBoxY + 54;
      const hintTxt = scene.add.text(rightX, hintY, summonCheck.canSummon ? '✨ Đã gom đủ 20 Mảnh! Bấm nút bên dưới để Triệu Hồi!' : '💡 Đánh thắng các map tương ứng để thu thập Mảnh!', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        fontStyle: '800',
        color: summonCheck.canSummon ? '#00f5d4' : '#ffd166'
      }).setOrigin(0.5);
      container.add(hintTxt);
    }

    container.add([upgBox, upgTitle, upgBarGfx, upgBarText]);

    // 6. Main Action Button: Equip / Select / Unlock / Summon
    const currentEquippedId = save.getSelectedCompanion();
    const isEquipped = currentEquippedId === activeCompId;

    const btnActionY = upgBoxY + upgBoxH + 28;
    const btnActionW = rightW;
    const btnActionH = 40;

    const equipBtnBg = scene.add.graphics();
    let btnColor = 0xffd166;
    let btnLabel = '';

    if (isEquipped) {
      btnLabel = '✓ ĐANG ĐỒNG HÀNH (ĐÃ TRANG BỊ)';
      btnColor = 0x2a9d8f;
    } else if (isUnlocked) {
      btnLabel = `⛩️ CHỌN ${activeConfig.name.toUpperCase()} LÀM ĐỒNG HÀNH`;
      btnColor = primaryThemeColor;
    } else if (summonCheck.canSummon) {
      btnLabel = `✨ TRIỆU HỒI ${activeConfig.name.toUpperCase()} (20/20 MẢNH)`;
      btnColor = 0xffb703;
    } else {
      btnLabel = `🔒 CẦN 20 MẢNH ĐỂ TRIỆU HỒI (${currentShards}/20)`;
      btnColor = 0x2b2d42;
    }

    equipBtnBg.fillStyle(btnColor, 1);
    equipBtnBg.fillRoundedRect(rightX - btnActionW / 2, btnActionY - btnActionH / 2, btnActionW, btnActionH, 12);
    equipBtnBg.lineStyle(2, borderGold, 0.9);
    equipBtnBg.strokeRoundedRect(rightX - btnActionW / 2, btnActionY - btnActionH / 2, btnActionW, btnActionH, 12);

    const equipBtnText = scene.add.text(rightX, btnActionY, btnLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: (!isUnlocked && !summonCheck.canSummon) ? '#adb5bd' : (isUnlocked ? '#ffffff' : '#000000')
    }).setOrigin(0.5);

    const equipHit = scene.add.zone(rightX, btnActionY, btnActionW, btnActionH).setInteractive({ useHandCursor: true });
    equipHit.on('pointerdown', () => {
      if (isEquipped) {
        closeModal();
      } else if (isUnlocked) {
        save.setSelectedCompanion(activeCompId);
        audio.playVictory();
        if (onSelect) onSelect(activeConfig);
        closeModal();
      } else if (summonCheck.canSummon) {
        const summonRes = save.summonCompanion(activeCompId);
        if (summonRes.success) {
          save.setSelectedCompanion(activeCompId);
          audio.playVictory();
          if ((scene as any).showNotice) {
            (scene as any).showNotice(`🎉 ĐÃ TRIỆU HỒI THÀNH CÔNG ${activeConfig.name.toUpperCase()}!`, 0xffd700);
          }
          container.destroy();
          CompanionModal3D.open(scene, activeCompId, onSelect);
        }
      } else {
        audio.playError();
        if ((scene as any).showNotice) {
          (scene as any).showNotice(`❌ Chưa đủ Mảnh! Cần gom đủ 20 Mảnh ${activeConfig.name} để Triệu Hồi!`, 0xff4d6d);
        }
      }
    });

    // Secondary Link: View All Cards
    const switchBtnY = btnActionY + btnActionH / 2 + 18;
    const switchBtnText = scene.add.text(rightX, switchBtnY, '📜 Xem danh sách 10 linh thú ›', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      fontStyle: '800',
      color: '#ffd166'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    switchBtnText.on('pointerover', () => switchBtnText.setColor('#ffffff'));
    switchBtnText.on('pointerout', () => switchBtnText.setColor('#ffd166'));
    switchBtnText.on('pointerdown', () => {
      audio.playSelect();
      container.destroy();
      CompanionModal.open(scene, (newComp) => {
        save.setSelectedCompanion(newComp.id);
        if (onSelect) onSelect(newComp);
      });
    });

    container.add([
      tierBg,
      tierText,
      statsRibbonBg,
      statsText,
      skillBox,
      skillTitle,
      skillDesc,
      bossCounterText,
      buffBox,
      buffTitle,
      buffDesc,
      upgBox,
      upgTitle,
      upgBarGfx,
      upgBarText,
      equipBtnBg,
      equipBtnText,
      equipHit,
      switchBtnText
    ]);

    // Cleanup on destroy: only unregister our own pointermove handler
    container.once('destroy', () => {
      scene.input.off('pointermove', onPointerMove);
    });

    return container;
  }
}
