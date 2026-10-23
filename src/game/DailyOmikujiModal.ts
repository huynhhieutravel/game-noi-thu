import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, getScreenDimensions } from '../constants';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';
import { COLORS, COLOR_HEX } from '../styles/colors';
import { DailyFortuneResult } from '../types';

export class DailyOmikujiModal {
  public static open(scene: Phaser.Scene, onClose?: () => void): Phaser.GameObjects.Container {
    const { width: screenW } = getScreenDimensions();
    const save = SaveSystem.getInstance();
    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();

    const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(300);

    // 1. Dark Backdrop Overlay
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x06050e, 0.92);
    overlay.fillRect(-screenW / 2, -GAME_HEIGHT / 2, screenW, GAME_HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -GAME_HEIGHT / 2, screenW, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    container.add(overlay);

    const cardW = 860;
    const cardH = 590;

    // 2. Ornate Shinto Shrine Wooden Lacquer Card
    const card = scene.add.graphics();
    card.fillStyle(0x13101d, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    card.lineStyle(2.5, 0xd90429, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);

    // Inner Gold Accent Line
    card.lineStyle(1.4, 0xffd166, 0.7);
    card.strokeRoundedRect(-cardW / 2 + 6, -cardH / 2 + 6, cardW - 12, cardH - 12, 17);
    container.add(card);

    // Header Torii Icon & Title
    const headerTitle = scene.add.text(0, -cardH / 2 + 45, '⛩️ QUẺ THẦN ĐỀN SHINTO • おみくじ', {
      fontFamily: FONT_DISPLAY,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffd166',
      stroke: '#9e0018',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add(headerTitle);

    // 3. 7-Day Streak Track
    const currentStreak = save.getDailyOmikujiStreak();
    const canClaim = save.canClaimDailyOmikuji();
    const streakTrackY = -cardH / 2 + 115;
    const dayBoxW = 104;
    const dayBoxH = 74;
    const dayGap = 12;
    const startX = -((7 * dayBoxW + 6 * dayGap) / 2) + dayBoxW / 2;

    for (let day = 1; day <= 7; day++) {
      const boxX = startX + (day - 1) * (dayBoxW + dayGap);
      const isCompleted = !canClaim ? (day <= currentStreak) : (day < currentStreak);
      const isToday = canClaim ? (day === (currentStreak % 7) + 1) : (day === currentStreak);
      const isDay7 = day === 7;

      const boxBg = scene.add.graphics();
      if (isToday) {
        boxBg.fillStyle(0x3a1420, 0.95);
        boxBg.fillRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
        boxBg.lineStyle(2, 0xffd166, 1);
        boxBg.strokeRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
      } else if (isCompleted) {
        boxBg.fillStyle(0x182c25, 0.95);
        boxBg.fillRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
        boxBg.lineStyle(1.5, 0x2a9d8f, 0.9);
        boxBg.strokeRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
      } else {
        boxBg.fillStyle(0x1b192e, 0.85);
        boxBg.fillRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
        boxBg.lineStyle(1.2, 0x3d3559, 0.7);
        boxBg.strokeRoundedRect(boxX - dayBoxW / 2, streakTrackY - dayBoxH / 2, dayBoxW, dayBoxH, 12);
      }
      container.add(boxBg);

      const dayTitle = scene.add.text(boxX, streakTrackY - 22, `NGÀY ${day}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '800',
        color: isToday ? '#ffd166' : isCompleted ? '#2a9d8f' : '#8d99ae'
      }).setOrigin(0.5);

      const dayIcon = scene.add.text(boxX, streakTrackY + 2, isCompleted ? '✓' : (isDay7 ? '👑' : (day === 6 ? '💎' : (day % 2 === 0 ? '💎' : '🪙'))), {
        fontFamily: FONT_UI,
        fontSize: isCompleted ? '22px' : '19px',
        fontStyle: '900',
        color: isCompleted ? '#00f5d4' : (isDay7 ? '#ffd700' : '#ffffff')
      }).setOrigin(0.5);

      const rewardDesc = isDay7 ? 'JACKPOT' : (day === 6 ? '💎 25' : (day % 2 === 0 ? '💎 10' : '🪙 200'));
      const dayReward = scene.add.text(boxX, streakTrackY + 22, rewardDesc, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: isDay7 ? '#ffd700' : '#adb5bd'
      }).setOrigin(0.5);

      container.add([dayTitle, dayIcon, dayReward]);
    }

    // 4. Center Stage: Bamboo Tsutsu (Cylinder) & Fortune Scroll
    const stageY = 55;
    const stageContainer = scene.add.container(0, stageY);
    container.add(stageContainer);

    // Decorative shrine background circle
    const shrineAura = scene.add.graphics();
    shrineAura.fillStyle(0xd90429, 0.12);
    shrineAura.fillCircle(0, 0, 110);
    shrineAura.lineStyle(1.5, 0xff4d6d, 0.35);
    shrineAura.strokeCircle(0, 0, 110);
    stageContainer.add(shrineAura);

    // Bamboo cylinder graphic container
    const cylinderGroup = scene.add.container(0, -10);
    stageContainer.add(cylinderGroup);

    const cylW = 76;
    const cylH = 120;
    const cyl = scene.add.graphics();
    cyl.fillStyle(0x7f4f24, 1);
    cyl.fillRoundedRect(-cylW / 2, -cylH / 2, cylW, cylH, 16);
    cyl.lineStyle(2, 0xd4a373, 1);
    cyl.strokeRoundedRect(-cylW / 2, -cylH / 2, cylW, cylH, 16);

    // Bamboo rings
    cyl.lineStyle(2.5, 0x582f0e, 1);
    cyl.strokeLineShape(new Phaser.Geom.Line(-cylW / 2 + 4, -cylH / 4, cylW / 2 - 4, -cylH / 4));
    cyl.strokeLineShape(new Phaser.Geom.Line(-cylW / 2 + 4, cylH / 4, cylW / 2 - 4, cylH / 4));

    const cylLabel = scene.add.text(0, 0, '神籤\nOMIKUJI', {
      fontFamily: FONT_DISPLAY,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd166',
      align: 'center'
    }).setOrigin(0.5);

    cylinderGroup.add([cyl, cylLabel]);

    // Fortune result card container (hidden until shaken or if already claimed)
    const resultCardGroup = scene.add.container(0, 0);
    resultCardGroup.setVisible(false);
    stageContainer.add(resultCardGroup);

    const showFortuneResult = (fortune: DailyFortuneResult, isNew: boolean = false) => {
      cylinderGroup.setVisible(false);
      resultCardGroup.removeAll(true);
      resultCardGroup.setVisible(true);

      const resW = 540;
      const resH = 210;

      const resBg = scene.add.graphics();
      resBg.fillStyle(0x191428, 0.98);
      resBg.fillRoundedRect(-resW / 2, -resH / 2, resW, resH, 18);
      resBg.lineStyle(2, fortune.isJackpotDay7 ? 0xffd700 : 0xd90429, 1);
      resBg.strokeRoundedRect(-resW / 2, -resH / 2, resW, resH, 18);

      const jpText = scene.add.text(0, -66, fortune.japaneseTitle, {
        fontFamily: FONT_DISPLAY,
        fontSize: '40px',
        fontStyle: 'bold',
        color: fortune.isJackpotDay7 ? '#ffd700' : '#ff758f',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      const viText = scene.add.text(0, -22, fortune.vietnameseTitle.toUpperCase(), {
        fontFamily: FONT_UI,
        fontSize: '16.5px',
        fontStyle: '900',
        color: '#ffd166'
      }).setOrigin(0.5);

      const blessText = scene.add.text(0, 10, `"${fortune.blessingText}"`, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: 'italic',
        color: '#e2e8f0',
        align: 'center',
        wordWrap: { width: 480 }
      }).setOrigin(0.5);

      // Reward summary line
      let rewStr = `💰 +${fortune.coins.toLocaleString()} Xu  •  💎 +${fortune.diamonds} KC`;
      if (fortune.universalShards > 0) {
        rewStr += `  •  🔮 +${fortune.universalShards} Linh Thạch`;
      }
      if (fortune.boosterReward) {
        const bName = fortune.boosterReward.type === 'hint' ? 'Kính Lúp' : (fortune.boosterReward.type === 'shuffle' ? 'Đổi Bài' : 'Bom');
        rewStr += `  •  ⚡ +${fortune.boosterReward.count} ${bName}`;
      }
      if (fortune.isJackpotDay7) {
        rewStr += '  👑 [JACKPOT NGÀY 7!]';
      }

      const rewardPill = scene.add.text(0, 58, rewStr, {
        fontFamily: FONT_UI,
        fontSize: '14px',
        fontStyle: '900',
        color: '#00f5d4',
        backgroundColor: '#0f172a',
        padding: { top: 6, bottom: 6, left: 16, right: 16 }
      }).setOrigin(0.5);

      resultCardGroup.add([resBg, jpText, viText, blessText, rewardPill]);

      if (isNew) {
        resultCardGroup.setScale(0.7);
        resultCardGroup.setAlpha(0);
        scene.tweens.add({
          targets: resultCardGroup,
          scale: 1,
          alpha: 1,
          duration: 350,
          ease: 'Back.easeOut'
        });
      }
    };

    // If already claimed today, display today's fortune or message
    if (!canClaim) {
      showFortuneResult({
        fortuneType: 'trung_cat',
        japaneseTitle: '今日完了',
        vietnameseTitle: `Chuỗi ${currentStreak} Ngày May Mắn`,
        blessingText: 'Hôm nay bạn đã nhận lộc may mắn. Hẹn gặp lại vào ngày mai!',
        coins: 0,
        diamonds: 0,
        universalShards: 0
      }, false);
    }

    // 5. Action Button: Rút Quẻ Ngay vs Đã Rút Hôm Nay
    const btnY = cardH / 2 - 58;
    const btnW = 320;
    const btnH = 50;

    const actionBtn = scene.add.container(0, btnY);
    container.add(actionBtn);

    const btnBg = scene.add.graphics();
    if (canClaim) {
      btnBg.fillStyle(0xd90429, 1);
      btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
      btnBg.lineStyle(2, 0xffd166, 1);
      btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
    } else {
      btnBg.fillStyle(0x2b293d, 0.9);
      btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
      btnBg.lineStyle(1.5, 0x4a475d, 0.8);
      btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
    }

    const btnTxt = scene.add.text(0, 0, canClaim ? '🎋 RÚT QUẺ HÔM NAY' : '✓ ĐÃ RÚT HÔM NAY', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: canClaim ? '#ffffff' : '#8d99ae'
    }).setOrigin(0.5);

    actionBtn.add([btnBg, btnTxt]);

    if (canClaim) {
      actionBtn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });

      actionBtn.on('pointerdown', () => {
        actionBtn.disableInteractive();
        audio.playSelect();
        haptic.medium();

        // Bamboo cylinder shake animation
        scene.tweens.add({
          targets: cylinderGroup,
          angle: { from: -15, to: 15 },
          duration: 90,
          yoyo: true,
          repeat: 6,
          onComplete: () => {
            cylinderGroup.setAngle(0);
            const result = save.claimDailyOmikuji();
            if (result.success && result.fortune) {
              audio.playVictory();
              haptic.combo();
              showFortuneResult(result.fortune, true);

              // Update button to claimed state
              btnBg.clear();
              btnBg.fillStyle(0x2b293d, 0.9);
              btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
              btnBg.lineStyle(1.5, 0x4a475d, 0.8);
              btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
              btnTxt.setText('✓ ĐÃ RÚT THÀNH CÔNG!');
              btnTxt.setColor('#00f5d4');
            }
          }
        });
      });
    }

    // 6. Close Button Top Right
    const closeBtnX = cardW / 2 - 32;
    const closeBtnY = -cardH / 2 + 32;
    const closeBtn = scene.add.text(closeBtnX, closeBtnY, '✕', {
      fontFamily: FONT_UI,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ced4da'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const handleClose = () => {
      audio.playSelect();
      haptic.light();
      container.destroy();
      if (onClose) onClose();
    };

    closeBtn.on('pointerdown', handleClose);
    overlay.on('pointerdown', handleClose);

    // Entry Pop-in Tween
    container.setScale(0.85);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });

    return container;
  }
}
