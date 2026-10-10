import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { CompanionManager } from './CompanionManager';
import { CompanionConfig } from '../types';
import { TextureGenerator } from './TextureGenerator';
import { SaveSystem } from '../systems/SaveSystem';

export class CompanionModal {
  public static open(
    scene: Phaser.Scene,
    onSelect: (companion: CompanionConfig) => void
  ): Phaser.GameObjects.Container {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const save = SaveSystem.getInstance();
    const currentId = save.getSelectedCompanion();

    const container = scene.add.container(width / 2, height / 2).setDepth(300);

    // 1. Dark Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', () => {
      container.destroy();
    });

    // 2. Main Dialog Frame
    const frameW = 860;
    const frameH = 500;
    const frame = scene.add.graphics();
    frame.fillStyle(0x131424, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);
    frame.lineStyle(2, 0xffd700, 0.8);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // 3. Header
    const title = scene.add.text(0, -frameH / 2 + 36, '🦊 LINH THÚ ĐỒNG HÀNH & TUYỆT CHIÊU', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const subTitle = scene.add.text(
      0,
      -frameH / 2 + 66,
      'Ăn các cặp ô & duy trì Combo để sạc Thanh Nộ. Khi đầy 100%, chạm Linh Thú để tung Tuyệt Chiêu!',
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        color: '#adb5bd'
      }
    ).setOrigin(0.5);

    // Coins Badge (Top-Right)
    const coinsBadge = scene.add.text(frameW / 2 - 100, -frameH / 2 + 34, `💰 ${save.getCoins()} XU`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Close button (✖)
    const closeBtn = scene.add.text(frameW / 2 - 36, -frameH / 2 + 32, '✖', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      color: '#adb5bd'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      container.destroy();
    });

    container.add([backdrop, frame, title, subTitle, coinsBadge, closeBtn]);

    // 4. Render 3 Companion Cards
    const companions = CompanionManager.getAll();
    const cardW = 250;
    const cardH = 360;
    const cardSpacing = 270;
    const startX = -cardSpacing;
    const cardY = 36;

    companions.forEach((comp, idx) => {
      const cardX = startX + idx * cardSpacing;
      const isSelected = comp.id === currentId;
      const isUnlocked = save.isCompanionUnlocked(comp.id);

      const cardContainer = scene.add.container(cardX, cardY);

      // Card Background
      const cardBg = scene.add.graphics();
      cardBg.fillStyle(isSelected ? 0x22213d : 0x1a1a2b, 1);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      cardBg.lineStyle(isSelected ? 3 : 1.5, isSelected ? comp.themeColor : 0x3d3559, 1);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);

      // Avatar Halo & Portrait
      const halo = scene.add.graphics();
      halo.fillStyle(comp.themeColor, isUnlocked ? 0.15 : 0.05);
      halo.fillCircle(0, -90, 52);
      halo.lineStyle(2, comp.themeColor, isUnlocked ? 0.8 : 0.4);
      halo.strokeCircle(0, -90, 52);

      let avatar: Phaser.GameObjects.GameObject;
      TextureGenerator.ensureCharacterTexture(scene, comp.id);
      const texKey = `char_${comp.id}`;
      if (scene.textures.exists(texKey)) {
        avatar = scene.add.image(0, -90, texKey).setDisplaySize(90, 90);
        if (!isUnlocked) (avatar as Phaser.GameObjects.Image).setTint(0x777777);
      } else {
        avatar = scene.add.text(0, -90, comp.icon, { fontSize: '48px' }).setOrigin(0.5);
      }

      // Name & Title
      const nameText = scene.add.text(0, -22, `${comp.icon} ${comp.name}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '17px',
        fontStyle: '900',
        color: isUnlocked ? '#ffffff' : '#94a3b8'
      }).setOrigin(0.5);

      const titleText = scene.add.text(0, 0, `[ ${comp.title} ]`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: `#${comp.themeColor.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);

      // Skill Box
      const skillBox = scene.add.graphics();
      skillBox.fillStyle(0x10111d, 0.9);
      skillBox.fillRoundedRect(-cardW / 2 + 14, 20, cardW - 28, 85, 10);
      skillBox.lineStyle(1, 0x30354e, 0.8);
      skillBox.strokeRoundedRect(-cardW / 2 + 14, 20, cardW - 28, 85, 10);

      const skillName = scene.add.text(0, 36, `⚡ ${comp.skillName}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '800',
        color: '#ffd700'
      }).setOrigin(0.5);

      const skillDesc = scene.add.text(0, 68, comp.skillDesc, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        color: '#ced4da',
        wordWrap: { width: cardW - 40 },
        align: 'center',
        lineSpacing: 3
      }).setOrigin(0.5);

      // Action Button (Select / Equipped / Unlock)
      const btnY = 138;
      const btnW = cardW - 36;
      const btnH = 36;
      const btnBg = scene.add.graphics();
      let btnLabel = 'CHỌN LINH THÚ';
      let btnTextColor = '#000000';

      if (isSelected) {
        btnBg.fillStyle(0x2a9d8f, 1);
        btnLabel = '✓ ĐANG ĐỒNG HÀNH';
        btnTextColor = '#ffffff';
      } else if (isUnlocked) {
        btnBg.fillStyle(comp.themeColor, 1);
        btnLabel = 'CHỌN LINH THÚ';
        btnTextColor = '#000000';
      } else {
        btnBg.fillStyle(0xffd166, 1);
        btnLabel = `🔒 MỞ KHÓA (${comp.cost} XU)`;
        btnTextColor = '#000000';
      }
      btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const btnText = scene.add.text(0, btnY, btnLabel, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: '800',
        color: btnTextColor
      }).setOrigin(0.5);

      const hitZone = scene.add.zone(0, 0, cardW, cardH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        if (isSelected) {
          container.destroy();
          return;
        }

        if (isUnlocked) {
          save.setSelectedCompanion(comp.id);
          onSelect(comp);
          container.destroy();
        } else {
          // Unlock with Coins
          if (save.getCoins() >= comp.cost) {
            save.spendCoins(comp.cost);
            save.unlockCompanion(comp.id);
            save.setSelectedCompanion(comp.id);
            (scene as any).audio?.playVictory?.();
            (scene as any).showNotice?.(`🎉 ĐÃ MỞ KHÓA ${comp.name.toUpperCase()}!`, 0xffd700);
            onSelect(comp);
            container.destroy();
          } else {
            (scene as any).audio?.playError?.();
            (scene as any).showNotice?.(`❌ Chưa đủ ngân lượng! Cần ${comp.cost} Xu để mở khóa!`, 0xff4d6d);
          }
        }
      });

      cardContainer.add([
        cardBg,
        halo,
        avatar,
        nameText,
        titleText,
        skillBox,
        skillName,
        skillDesc,
        btnBg,
        btnText,
        hitZone
      ]);

      container.add(cardContainer);
    });

    return container;
  }
}
