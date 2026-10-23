import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { TileState } from '../types';
import { FONT_UI } from '../styles/typography';

import { ObstacleData, ObstacleInfoData } from './ObstacleData';
export { ObstacleData };
export type { ObstacleInfoData };

export class ObstacleInfoModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static getInfo(tile: TileState): ObstacleInfoData {
    return ObstacleData.getInfo(tile);
  }


  public static open(scene: Phaser.Scene, tile: TileState): Phaser.GameObjects.Container {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }

    const info = this.getInfo(tile);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    // Pause timer in GameScene while reading guide
    (scene as any).isPaused = true;
    (scene as any).audio?.playTileSelect?.();

    const container = scene.add.container(width / 2, height / 2).setDepth(400);
    this.activeModal = container;

    // 1. Dark Glass Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.82);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );

    const closeModal = () => {
      (scene as any).isPaused = false;
      (scene as any).audio?.playClick?.();
      scene.tweens.add({
        targets: container,
        scaleX: 0.85,
        scaleY: 0.85,
        alpha: 0,
        duration: 150,
        ease: 'Back.easeIn',
        onComplete: () => {
          container.destroy();
          if (ObstacleInfoModal.activeModal === container) {
            ObstacleInfoModal.activeModal = null;
          }
        }
      });
    };

    backdrop.on('pointerdown', closeModal);

    // 2. Main Frame
    const frameW = 620;
    const frameH = 460;
    const frame = scene.add.graphics();

    // Body dark gradient
    frame.fillStyle(0x0e111d, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 22);

    // Outer Glowing Border matching theme
    frame.lineStyle(2.5, info.themeColor, 0.95);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 22);

    // Header Accent Glow Bar
    frame.fillStyle(info.themeColor, 0.15);
    frame.fillRoundedRect(-frameW / 2 + 3, -frameH / 2 + 3, frameW - 6, 85, { tl: 19, tr: 19, bl: 0, br: 0 });

    // 3. Top Header: Sprite / Icon + Title + Level Badge
    const iconX = -frameW / 2 + 56;
    const iconY = -frameH / 2 + 45;

    let spriteObj: Phaser.GameObjects.GameObject;
    if (info.spriteKey && scene.textures.exists(info.spriteKey)) {
      spriteObj = scene.add.image(iconX, iconY, info.spriteKey).setDisplaySize(58, 58);
    } else {
      spriteObj = scene.add.text(iconX, iconY, info.icon, { fontSize: '38px' }).setOrigin(0.5);
    }

    const titleText = scene.add.text(iconX + 44, iconY - 14, `${info.icon} ${info.title}`, {
      fontFamily: FONT_UI,
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const subText = scene.add.text(iconX + 44, iconY + 12, info.subtitle, {
      fontFamily: FONT_UI,
      fontSize: '12px',
      color: '#9aa0a6'
    }).setOrigin(0, 0.5);

    // Badge Pill (Top-Right)
    const badgeW = 160;
    const badgeH = 28;
    const badgeX = frameW / 2 - 120;
    const badgeY = -frameH / 2 + 45;

    const badgeBg = scene.add.graphics();
    badgeBg.fillStyle(info.themeColor, 0.22);
    badgeBg.fillRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 14);
    badgeBg.lineStyle(1.5, info.themeColor, 0.9);
    badgeBg.strokeRoundedRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 14);

    const badgeText = scene.add.text(badgeX, badgeY, info.badgeLabel, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: info.textColor
    }).setOrigin(0.5);

    // Close button (✖)
    const closeBtn = scene.add.text(frameW / 2 - 28, -frameH / 2 + 24, '✖', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      color: '#adb5bd'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', closeModal);

    // 4. Hit Progression Bar (Segmented Pips)
    const pipsContainer = scene.add.container(0, -frameH / 2 + 104);
    const pipsW = frameW - 60;
    const pipH = 8;
    const pipsBg = scene.add.graphics();
    pipsBg.fillStyle(0x1a1e2e, 1);
    pipsBg.fillRoundedRect(-pipsW / 2, -pipH / 2, pipsW, pipH, 4);

    const segW = (pipsW - (info.maxLevel - 1) * 6) / info.maxLevel;
    for (let i = 0; i < info.maxLevel; i++) {
      const segX = -pipsW / 2 + i * (segW + 6);
      const isFilled = i < info.level;
      pipsBg.fillStyle(isFilled ? info.themeColor : 0x252a3d, 1);
      pipsBg.fillRoundedRect(segX, -pipH / 2, segW, pipH, 4);
    }
    pipsContainer.add(pipsBg);

    // 5. Section 1: Effect Card Box
    const card1Y = -frameH / 2 + 180;
    const cardW = frameW - 56;
    const card1H = 110;
    const card1 = scene.add.graphics();
    card1.fillStyle(0x131728, 0.95);
    card1.fillRoundedRect(-cardW / 2, card1Y - card1H / 2, cardW, card1H, 14);
    card1.lineStyle(1.2, 0x2b324d, 0.8);
    card1.strokeRoundedRect(-cardW / 2, card1Y - card1H / 2, cardW, card1H, 14);

    const card1Title = scene.add.text(-cardW / 2 + 18, card1Y - card1H / 2 + 16, info.effectTitle, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0, 0.5);

    const card1Desc = scene.add.text(-cardW / 2 + 18, card1Y - card1H / 2 + 40, info.effectDesc, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      lineSpacing: 5,
      color: '#e2e8f0',
      wordWrap: { width: cardW - 36 }
    });

    // 6. Section 2: How to Break Card Box
    const card2Y = card1Y + card1H / 2 + 75;
    const card2H = 120;
    const card2 = scene.add.graphics();
    card2.fillStyle(0x131c28, 0.95);
    card2.fillRoundedRect(-cardW / 2, card2Y - card2H / 2, cardW, card2H, 14);
    card2.lineStyle(1.2, info.themeColor, 0.45);
    card2.strokeRoundedRect(-cardW / 2, card2Y - card2H / 2, cardW, card2H, 14);

    const card2Title = scene.add.text(-cardW / 2 + 18, card2Y - card2H / 2 + 16, info.breakTitle, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: info.textColor
    }).setOrigin(0, 0.5);

    const breakTextJoined = info.breakDesc.join('\n');
    const card2Desc = scene.add.text(-cardW / 2 + 18, card2Y - card2H / 2 + 38, breakTextJoined, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      lineSpacing: 4,
      color: '#e2e8f0',
      wordWrap: { width: cardW - 36 }
    });

    // 7. Bottom Button: [ ✓ ĐÃ HIỂU - TIẾP TỤC CHƠI ]
    const btnW = 260;
    const btnH = 40;
    const btnY = frameH / 2 - 36;

    const btnContainer = scene.add.container(0, btnY);
    const btnBg = scene.add.graphics();
    btnBg.fillStyle(info.themeColor, 0.95);
    btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);

    const btnText = scene.add.text(0, 0, '✓ ĐÃ HIỂU • TIẾP TỤC CHƠI', {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '900',
      color: '#0d0f17'
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnContainer.setSize(btnW, btnH);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      scene.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 120 });
    });
    btnContainer.on('pointerout', () => {
      scene.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 120 });
    });
    btnContainer.on('pointerdown', closeModal);

    container.add([
      backdrop,
      frame,
      spriteObj,
      titleText,
      subText,
      badgeBg,
      badgeText,
      closeBtn,
      pipsContainer,
      card1,
      card1Title,
      card1Desc,
      card2,
      card2Title,
      card2Desc,
      btnContainer
    ]);

    // Pop-in Scale Tween
    container.setScale(0.85);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    return container;
  }
}
