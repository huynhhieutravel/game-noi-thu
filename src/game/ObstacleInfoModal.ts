import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { TileState } from '../types';

export interface ObstacleInfoData {
  title: string;
  subtitle: string;
  icon: string;
  themeColor: number;
  textColor: string;
  level: number;
  maxLevel: number;
  badgeLabel: string;
  effectTitle: string;
  effectDesc: string;
  breakTitle: string;
  breakDesc: string[];
  spriteKey?: string;
}

export class ObstacleInfoModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static getInfo(tile: TileState): ObstacleInfoData {
    const mod = tile.modifier;
    const lvl = tile.modifierLevel || (mod === 'web' ? 2 : 3);

    switch (mod) {
      case 'stone':
        return {
          title: 'THẠCH TRẬN PHONG ẤN',
          subtitle: 'Ancient Stone Blocker',
          icon: '🪨',
          themeColor: 0xf4a261,
          textColor: '#f4a261',
          level: lvl,
          maxLevel: 3,
          badgeLabel: `CẤP ${lvl}/3 • CẦN ${lvl} HIT`,
          spriteKey: lvl === 1 ? 'stone_lv1' : lvl === 2 ? 'stone_lv2' : 'stone_lv3',
          effectTitle: '🚫 HIỆU ỨNG PHONG TỎA Ô CỜ',
          effectDesc: '• Chiếm trọn 1 ô cờ (không có linh thú bên dưới).\n• Chặn đứng tuyệt đối đường nối Onet, tia laser không thể đi xuyên qua.\n• Miễn nhiễm hoàn toàn với mọi tương tác chạm click trực tiếp.',
          breakTitle: '🔨 CÁCH PHÁ HỦY TẢNG ĐÁ',
          breakDesc: [
            '💥 Ghép cặp lân cận: Nối bất kỳ cặp thú nào ở 4 ô liền kề (Trên, Dưới, Trái, Phải) để tạo sóng xung kích gây 1 sát thương làm nứt đá.',
            '💣 Bảo bối Bom: Sử dụng Bom Phá Cặp để tạo vụ nổ lan truyền sát thương.',
            '✨ Sau 3 hit (vỡ cấp 1): Ô đá vỡ tan biến thành khoảng trống, mở toang đường nối laser xuyên qua!'
          ]
        };

      case 'thorn':
        return {
          title: 'BỤI GAI TRÓI BUỘC',
          subtitle: 'Dense Thorn Bramble',
          icon: '🌿',
          themeColor: 0x2ec4b6,
          textColor: '#2ec4b6',
          level: lvl,
          maxLevel: 3,
          badgeLabel: `CẤP ${lvl}/3 • CẦN ${lvl} HIT`,
          spriteKey: lvl === 1 ? 'thorn_lv1' : lvl === 2 ? 'thorn_lv2' : 'thorn_lv3',
          effectTitle: '🌿 HIỆU ỨNG KHÓA THẺ THÚ',
          effectDesc: '• Dây gai cổ thụ chằng chịt trói chặt thẻ linh thú bên dưới.\n• Không thể chọn hay click thẻ này cho đến khi chặt hết các tầng gai.\n• Thẻ thú bên dưới vẫn còn nguyên vẹn và đang chờ được giải cứu.',
          breakTitle: '🔨 CÁCH CHẶT ĐỨT DÂY GAI',
          breakDesc: [
            '💥 Ghép thú cạnh bên: Tạo combo nối thú ở 4 ô sát cạnh để phát động sóng chém đứt 1 tầng gai (-1 cấp).',
            '💣 Bom & Tuyệt kỹ: Sát thương diện rộng từ bom hoặc Linh Thú đồng hành dọn sạch gai nhanh chóng.',
            '🎉 Giải cứu thành công: Khi hết cấp 1, gai đứt hoàn toàn, thẻ thú bên dưới tự do và sẵn sàng để ghép đôi!'
          ]
        };

      case 'barricade':
        return {
          title: 'SONG SẮT THIẾT NGỤC',
          subtitle: 'Reinforced Iron Barricade',
          icon: '🛡️',
          themeColor: 0xffd166,
          textColor: '#ffd166',
          level: lvl,
          maxLevel: 3,
          badgeLabel: `CẤP ${lvl}/3 • CẦN ${lvl} HIT`,
          spriteKey: lvl === 1 ? 'barricade_lv1' : lvl === 2 ? 'barricade_lv2' : 'barricade_lv3',
          effectTitle: '🛡️ HIỆU ỨNG THIẾT NGỤC GIAM CẦM',
          effectDesc: '• Khung lồng sắt thép cường lực kiên cố bao bọc thẻ thú.\n• Bất khả xâm phạm từ bên trong (không thể click trực tiếp).\n• Chỉ có thể bị suy yếu và phá vỡ bởi chấn động từ bên ngoài!',
          breakTitle: '🔨 CÁCH PHÁ HỎNG LỒNG SẮT',
          breakDesc: [
            '💥 Tác động từ ngoài: Nối các cặp thú ở xung quanh để bẻ cong và làm rạn nứt song sắt.',
            '💣 Chấn động nổ bom: Bom phá cặp kích nổ trực tiếp làm móp méo lồng thép.',
            '🏆 Phần thưởng phá rào: Khi đập tan hoàn toàn, nhận ngay +200 Điểm và giải phóng thẻ thú!'
          ]
        };

      case 'web':
        return {
          title: 'MẠNG NHỆN CỔ XƯA',
          subtitle: 'Mystic Spider Web',
          icon: '🕸️',
          themeColor: 0x00f5d4,
          textColor: '#00f5d4',
          level: lvl,
          maxLevel: 2,
          badgeLabel: `CẤP ${lvl}/2 • CẦN ${lvl} HIT HOẶC NỐI TRỰC TIẾP`,
          spriteKey: lvl === 1 ? 'web_lv1' : 'web_lv2',
          effectTitle: '🕸️ HIỆU ỨNG TƠ NHỆN BẪY LINH THÚ',
          effectDesc: '• Mạng nhện phủ lớp tơ mờ giữ chân thẻ thú bên dưới.\n• ⚡ ĐẶC BIỆT: Khác với Đá và Gai, bạn CÓ THỂ CLICK NỐI TRỰC TIẾP thẻ nhện này với thẻ thú giống nó ngoài bàn cờ!',
          breakTitle: '🔨 2 CÁCH PHÁ MẠNG NHỆN',
          breakDesc: [
            '🎯 Cách 1 - Nối trực tiếp (Ưu tiên): Ghép đôi thẻ thú này ngay lập tức để vừa ăn điểm vừa giật đứt tơ!',
            '💥 Cách 2 - Sát thương lan: Ghép cặp thú ở ô kế bên cũng làm rách từng lớp tơ nhện.',
            '🎁 Thưởng giải phóng: Giật đứt mạng nhện thưởng thêm +100 Điểm thưởng!'
          ]
        };

      case 'ice':
        return {
          title: 'BĂNG GIÁ VĨNH CỬU',
          subtitle: 'Eternal Frost Layer',
          icon: '❄️',
          themeColor: 0x90e0ef,
          textColor: '#90e0ef',
          level: tile.iceLayers || 2,
          maxLevel: 2,
          badgeLabel: `LỚP BĂNG: ${tile.iceLayers || 2} TẦNG`,
          spriteKey: 'mod_ice',
          effectTitle: '❄️ HIỆU ỨNG ĐÓNG BĂNG',
          effectDesc: '• Lớp băng dày bao bọc thẻ thú, ngăn cản thu thập trong 1 lượt.\n• Thẻ vẫn có thể nhìn thấy rõ và cho phép click chọn bình thường.',
          breakTitle: '🔨 CÁCH RÃ ĐÔNG BĂNG GIÁ',
          breakDesc: [
            '🎯 Nối 2 lần: Lần nối đầu tiên sẽ làm tan vỡ lớp băng ngoài (-1 tầng).',
            '✨ Lần nối thứ hai: Thu thập hoàn toàn thẻ thú và ghi điểm thưởng!',
            '🔥 Tuyệt chiêu Hỏa Điểu: Phượng hoàng lửa thiêu rụi toàn bộ các khối băng tức thì.'
          ]
        };

      default:
        return {
          title: 'VẬT CẢN HUYỀN BÍ',
          subtitle: 'Mystic Obstacle',
          icon: '❓',
          themeColor: 0xffd166,
          textColor: '#ffd166',
          level: 1,
          maxLevel: 1,
          badgeLabel: 'CẤP 1',
          effectTitle: '✨ HIỆU ỨNG ĐẶC BIỆT',
          effectDesc: '• Vật cản phong ấn trên bàn cờ Onet.',
          breakTitle: '🔨 CÁCH GIẢI MÃ',
          breakDesc: ['💥 Nối các cặp thú lân cận để giải phong ấn!']
        };
    }
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const subText = scene.add.text(iconX + 44, iconY + 12, info.subtitle, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: info.textColor
    }).setOrigin(0.5);

    // Close button (✖)
    const closeBtn = scene.add.text(frameW / 2 - 28, -frameH / 2 + 24, '✖', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffd166'
    }).setOrigin(0, 0.5);

    const card1Desc = scene.add.text(-cardW / 2 + 18, card1Y - card1H / 2 + 40, info.effectDesc, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: info.textColor
    }).setOrigin(0, 0.5);

    const breakTextJoined = info.breakDesc.join('\n');
    const card2Desc = scene.add.text(-cardW / 2 + 18, card2Y - card2H / 2 + 38, breakTextJoined, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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
