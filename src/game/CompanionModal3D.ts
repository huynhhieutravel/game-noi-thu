import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { CompanionManager } from './CompanionManager';
import { CompanionConfig } from '../types';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { formatCurrency, FONT_UI } from '../styles/typography';

export class CompanionModal3D {
  private static readonly TOTAL_FRAMES = 18;

  // Accurate metadata and names for the 10 Mythical Companions
  private static readonly ROSTER: Array<{
    id: string;
    shortName: string;
    fullName: string;
    tagsSkill: [string, string];
    tagsPassive: [string, string];
    tagsCounter: [string, string];
  }> = [
    { id: 'inari_kitsune', shortName: 'Cáo Inari', fullName: 'CÁO INARI', tagsSkill: ['Giải Cặp', 'Boss'], tagsPassive: ['Combo', 'Thời gian'], tagsCounter: ['Ảo Ảnh', 'Phá Tường'] },
    { id: 'ryujin_pearl', shortName: 'Rồng Ryujin', fullName: 'RỒNG RYUJIN', tagsSkill: ['Đóng Băng', 'Thời gian'], tagsPassive: ['+Xu Vàng', 'Viền Ngoài'], tagsCounter: ['Kraken', 'Dập Sóng'] },
    { id: 'hi_no_tori', shortName: 'Hi-no-tori', fullName: 'HI-NO-TORI', tagsSkill: ['Phá Băng', 'Boss DPS'], tagsPassive: ['Hồi Sinh', 'Combo'], tagsCounter: ['Băng Quỷ', 'Tan Băng'] },
    { id: 'byakko_tiger', shortName: 'Bạch Hổ', fullName: 'BẠCH HỔ', tagsSkill: ['Trảm Thẳng', 'Tốc Chiến'], tagsPassive: ['Speedrun', 'Khóa Trượt'], tagsCounter: ['Thiết Giáp', 'Xuyên Giáp'] },
    { id: 'genbu_tortoise', shortName: 'Huyền Vũ', fullName: 'HUYỀN VŨ', tagsSkill: ['Đập Đá', 'Phá Khóa'], tagsPassive: ['+1 Mạng', 'Khiên Hộ'], tagsCounter: ['Trùng Độc', 'Kháng Độc'] },
    { id: 'kirin_sacred', shortName: 'Kỳ Lân', fullName: 'KỲ LÂN', tagsSkill: ['Giải Nguyền', 'Hồi Giờ'], tagsPassive: ['Tích Lũy', 'Hồi Giây'], tagsCounter: ['Chaos', 'Thánh Hóa'] },
    { id: 'raiju_thunder', shortName: 'Lôi Thú', fullName: 'LÔI THÚ', tagsSkill: ['Siêu Xa', 'Cổng Torii'], tagsPassive: ['+25% Nộ', 'Nhân Điểm'], tagsCounter: ['Phân Thân', 'Lôi Quét'] },
    { id: 'yatagarasu_crow', shortName: 'Quạ Yatagarasu', fullName: 'QUẠ YATAGARASU', tagsSkill: ['Xua Sương', 'Rọi Đêm'], tagsPassive: ['Gợi Ý', 'Cổ Vật'], tagsCounter: ['Màn Đêm', 'Phá Mù'] },
    { id: 'nekomata_cat', shortName: 'Mèo Nekomata', fullName: 'MÈO NEKOMATA', tagsSkill: ['Đảo Ô', 'Lật Kèo'], tagsPassive: ['x2 Thưởng', 'Tử Thần'], tagsCounter: ['Trộm Đồ', 'Hồi Đạo Cụ'] },
    { id: 'orochi_serpent', shortName: 'Bát Kỳ Orochi', fullName: 'BÁT KỲ OROCHI', tagsSkill: ['Trừ Giáp', 'Độc DoT'], tagsPassive: ['Áp Chế', 'Giảm Chiêu'], tagsCounter: ['Đại Trùm', '-15% HP'] }
  ];

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
    const haptic = HapticSystem.getInstance();

    let activeCompId = 'inari_kitsune';
    let onSelect: ((companion: CompanionConfig) => void) | undefined = undefined;

    if (typeof companionIdOrOnSelect === 'string') {
      activeCompId = companionIdOrOnSelect;
      onSelect = onSelectCallback;
    } else if (typeof companionIdOrOnSelect === 'function') {
      onSelect = companionIdOrOnSelect;
      activeCompId = save.getSelectedCompanion() || 'inari_kitsune';
    }

    // Modal master container
    const container = scene.add.container(width / 2, height / 2).setDepth(450);

    // Initial scale bounce animation
    container.setScale(0.92);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 220,
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

    // =========================================================================
    // 1. FULL-SCREEN DARK BACKDROP
    // =========================================================================
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x060814, 0.90);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', closeModal);
    container.add(backdrop);

    // =========================================================================
    // 2. ORNATE JAPANESE LACQUER FRAME (1010 x 616)
    // =========================================================================
    const frameW = 1010;
    const frameH = 616;
    const frame = scene.add.graphics();

    // Deep obsidian lacquer background
    frame.fillStyle(0x0c0f1d, 0.97);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // Inner subtle gold inset
    frame.lineStyle(1.2, 0x85662a, 0.5);
    frame.strokeRoundedRect(-frameW / 2 + 6, -frameH / 2 + 6, frameW - 12, frameH - 12, 16);

    // Outer rich gold border
    frame.lineStyle(2.5, 0xd4af37, 1);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // Ornate Golden Corner Flourishes (4 corners)
    const drawCornerOrnament = (cx: number, cy: number, flipX: number, flipY: number) => {
      const g = scene.add.graphics();
      g.lineStyle(2, 0xffd700, 0.9);
      g.beginPath();
      g.moveTo(cx + flipX * 22, cy);
      g.lineTo(cx, cy);
      g.lineTo(cx, cy + flipY * 22);
      g.strokePath();

      g.lineStyle(1.2, 0xffe57f, 0.7);
      g.beginPath();
      g.moveTo(cx + flipX * 14, cy + flipY * 14);
      g.lineTo(cx + flipX * 14, cy + flipY * 6);
      g.lineTo(cx + flipX * 6, cy + flipY * 14);
      g.closePath();
      g.strokePath();

      g.fillStyle(0xffd700, 1);
      g.fillCircle(cx + flipX * 10, cy + flipY * 10, 2.5);
      container.add(g);
    };

    drawCornerOrnament(-frameW / 2 + 10, -frameH / 2 + 10, 1, 1);
    drawCornerOrnament(frameW / 2 - 10, -frameH / 2 + 10, -1, 1);
    drawCornerOrnament(-frameW / 2 + 10, frameH / 2 - 10, 1, -1);
    drawCornerOrnament(frameW / 2 - 10, frameH / 2 - 10, -1, -1);

    container.add(frame);

    // =========================================================================
    // 3. TOP HEADER BAR: LINH THÚ (?) + 3 CURRENCY PILLS + CIRCULAR CLOSE BUTTON
    // =========================================================================
    const headerY = -frameH / 2 + 28;

    // Golden Torii / Shrine Emblem
    const emblemText = scene.add.text(-frameW / 2 + 38, headerY, '⛩️', {
      fontSize: '22px'
    }).setOrigin(0.5);

    // Title: LINH THÚ
    const titleText = scene.add.text(-frameW / 2 + 62, headerY, 'LINH THÚ', {
      fontFamily: FONT_UI,
      fontSize: '22px',
      fontStyle: '900',
      color: '#ffd700',
      letterSpacing: 1
    }).setOrigin(0, 0.5);

    // Help Button (?)
    const helpBtnGfx = scene.add.graphics();
    helpBtnGfx.lineStyle(1.5, 0xd4af37, 0.9);
    helpBtnGfx.strokeCircle(-frameW / 2 + 192, headerY, 11);
    const helpBtnText = scene.add.text(-frameW / 2 + 192, headerY, '?', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const helpZone = scene.add.zone(-frameW / 2 + 192, headerY, 26, 26).setInteractive({ useHandCursor: true });
    helpZone.on('pointerdown', () => {
      audio.playSelect();
      if ((scene as any).showNotice) {
        (scene as any).showNotice('⛩️ ĐỒNG HÀNH: Thăng cấp & Tiến hóa Linh Thú để nhận buff Vàng, Nộ và Tuyệt Chiêu giải cứu bàn cờ!', 0xffd700);
      }
    });

    container.add([emblemText, titleText, helpBtnGfx, helpBtnText, helpZone]);

    // Top-Right: 4 Currency Pills & Circular Ruby Close Button
    // Pill 1: Coins (💰 10050 +)
    const coinPillX = frameW / 2 - 430;
    const coinPillW = 110;
    const coinPillH = 28;
    const coinPillGfx = scene.add.graphics();
    coinPillGfx.fillStyle(0x13172e, 0.95);
    coinPillGfx.fillRoundedRect(coinPillX - coinPillW / 2, headerY - coinPillH / 2, coinPillW, coinPillH, 14);
    coinPillGfx.lineStyle(1.2, 0xd4af37, 0.85);
    coinPillGfx.strokeRoundedRect(coinPillX - coinPillW / 2, headerY - coinPillH / 2, coinPillW, coinPillH, 14);

    const hasCoinIcon = scene.textures.exists('icon_reward_coin');
    const coinIcon = hasCoinIcon
      ? scene.add.image(coinPillX - coinPillW / 2 + 16, headerY, 'icon_reward_coin').setDisplaySize(20, 20)
      : null;

    const coinText = scene.add.text(hasCoinIcon ? coinPillX + 4 : coinPillX - 10, headerY, `${hasCoinIcon ? '' : '🪙 '}${formatCurrency(save.getCoins())}`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const coinPlus = scene.add.text(coinPillX + coinPillW / 2 - 14, headerY, '+', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Pill 2: Gems (💎 100 +)
    const gemPillX = frameW / 2 - 315;
    const gemPillW = 96;
    const gemPillGfx = scene.add.graphics();
    gemPillGfx.fillStyle(0x13172e, 0.95);
    gemPillGfx.fillRoundedRect(gemPillX - gemPillW / 2, headerY - coinPillH / 2, gemPillW, coinPillH, 14);
    gemPillGfx.lineStyle(1.2, 0x00b4d8, 0.85);
    gemPillGfx.strokeRoundedRect(gemPillX - gemPillW / 2, headerY - coinPillH / 2, gemPillW, coinPillH, 14);

    const hasGemIcon = scene.textures.exists('icon_diamond');
    const gemIcon = hasGemIcon
      ? scene.add.image(gemPillX - gemPillW / 2 + 15, headerY, 'icon_diamond').setDisplaySize(18, 18)
      : null;

    const gemText = scene.add.text(hasGemIcon ? gemPillX + 5 : gemPillX - 8, headerY, `${hasGemIcon ? '' : '💎 '}${formatCurrency(save.getDiamonds())}`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#48cae4'
    }).setOrigin(0.5);

    const gemPlus = scene.add.text(gemPillX + gemPillW / 2 - 13, headerY, '+', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#48cae4'
    }).setOrigin(0.5);

    // Pill 3: Stars (⭐ 0/30)
    const starPillX = frameW / 2 - 208;
    const starPillW = 86;
    const starPillGfx = scene.add.graphics();
    starPillGfx.fillStyle(0x13172e, 0.95);
    starPillGfx.fillRoundedRect(starPillX - starPillW / 2, headerY - coinPillH / 2, starPillW, coinPillH, 14);
    starPillGfx.lineStyle(1.2, 0xffb703, 0.85);
    starPillGfx.strokeRoundedRect(starPillX - starPillW / 2, headerY - coinPillH / 2, starPillW, coinPillH, 14);

    const starText = scene.add.text(starPillX, headerY, `⭐ ${save.getStars()}/30`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffb703'
    }).setOrigin(0.5);

    // Pill 4: Universal Spirit Shards (🔮 Linh Thạch Vạn Năng)
    const uniPillX = frameW / 2 - 108;
    const uniPillW = 90;
    const uniPillGfx = scene.add.graphics();
    uniPillGfx.fillStyle(0x1a122e, 0.95);
    uniPillGfx.fillRoundedRect(uniPillX - uniPillW / 2, headerY - coinPillH / 2, uniPillW, coinPillH, 14);
    uniPillGfx.lineStyle(1.2, 0xa855f7, 0.85);
    uniPillGfx.strokeRoundedRect(uniPillX - uniPillW / 2, headerY - coinPillH / 2, uniPillW, coinPillH, 14);

    const uniText = scene.add.text(uniPillX, headerY, `🔮 ${formatCurrency(save.getUniversalShards())}`, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#d8b4fe'
    }).setOrigin(0.5);

    const uniZone = scene.add.zone(uniPillX, headerY, uniPillW, coinPillH).setInteractive({ useHandCursor: true });
    uniZone.on('pointerdown', () => {
      audio.playSelect();
      if ((scene as any).showNotice) {
        (scene as any).showNotice(
          `🔮 Linh Thạch Vạn Năng (Kho: ${save.getUniversalShards()}): Dùng để tự động bù đắp Mảnh Linh Thú khi Triệu Hồi hoặc Tiến Hóa!`,
          0xa855f7
        );
      }
    });

    // Circular Crimson Close Button (✖)
    const closeBtnX = frameW / 2 - 36;
    const closeBtnDia = 36;
    const closeBtnGfx = scene.add.graphics();
    closeBtnGfx.fillStyle(0x9e2a2b, 0.95);
    closeBtnGfx.fillCircle(closeBtnX, headerY, closeBtnDia / 2);
    closeBtnGfx.lineStyle(2, 0xffd700, 0.95);
    closeBtnGfx.strokeCircle(closeBtnX, headerY, closeBtnDia / 2);

    const closeBtnText = scene.add.text(closeBtnX, headerY, '✖', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const closeZone = scene.add.zone(closeBtnX, headerY, closeBtnDia, closeBtnDia).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', closeModal);
    closeZone.on('pointerover', () => {
      closeBtnGfx.clear();
      closeBtnGfx.fillStyle(0xd90429, 1);
      closeBtnGfx.fillCircle(closeBtnX, headerY, closeBtnDia / 2);
      closeBtnGfx.lineStyle(2.5, 0xffe57f, 1);
      closeBtnGfx.strokeCircle(closeBtnX, headerY, closeBtnDia / 2);
    });
    closeZone.on('pointerout', () => {
      closeBtnGfx.clear();
      closeBtnGfx.fillStyle(0x9e2a2b, 0.95);
      closeBtnGfx.fillCircle(closeBtnX, headerY, closeBtnDia / 2);
      closeBtnGfx.lineStyle(2, 0xffd700, 0.95);
      closeBtnGfx.strokeCircle(closeBtnX, headerY, closeBtnDia / 2);
    });

    container.add([
      coinPillGfx, ...(coinIcon ? [coinIcon] : []), coinText, coinPlus,
      gemPillGfx, ...(gemIcon ? [gemIcon] : []), gemText, gemPlus,
      starPillGfx, starText,
      uniPillGfx, uniText, uniZone,
      closeBtnGfx, closeBtnText, closeZone
    ]);

    // =========================================================================
    // 4. TOP ROSTER CAROUSEL: 10 COMPANIONS WITH REAL LINH THÚ ARTWORKS & NAMES
    // =========================================================================
    const carouselY = -frameH / 2 + 76;
    const totalComps = CompanionModal3D.ROSTER.length;
    const spacing = 87;
    const startX = -((totalComps - 1) * spacing) / 2;

    // Helper to get high-res Linh Thú artwork key
    const getCompanionArtKey = (cId: string): string => {
      if (scene.textures.exists(`comp_art_${cId}`)) {
        return `comp_art_${cId}`;
      }
      if (cId === 'inari_kitsune' && scene.textures.exists('inari_3d_00')) return 'inari_3d_00';
      if (cId === 'ryujin_pearl' && scene.textures.exists('ryujin_3d_00')) return 'ryujin_3d_00';
      if (cId === 'hi_no_tori' && scene.textures.exists('hinotori_3d_00')) return 'hinotori_3d_00';
      if (scene.textures.exists(`char_${cId}`)) return `char_${cId}`;
      if (cId === 'inari_kitsune' && scene.textures.exists('avatar_inari')) return 'avatar_inari';
      return '';
    };

    // Left chevron (<)
    const arrowLeft = scene.add.text(-frameW / 2 + 25, carouselY + 8, '‹', {
      fontFamily: FONT_UI,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#8d99ae'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Right chevron (>)
    const arrowRight = scene.add.text(frameW / 2 - 25, carouselY + 8, '›', {
      fontFamily: FONT_UI,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#8d99ae'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    arrowLeft.on('pointerdown', () => {
      audio.playSelect();
      const curIdx = CompanionModal3D.ROSTER.findIndex(r => r.id === activeCompId);
      const prevIdx = (curIdx - 1 + totalComps) % totalComps;
      container.destroy();
      CompanionModal3D.open(scene, CompanionModal3D.ROSTER[prevIdx].id, onSelect);
    });

    arrowRight.on('pointerdown', () => {
      audio.playSelect();
      const curIdx = CompanionModal3D.ROSTER.findIndex(r => r.id === activeCompId);
      const nextIdx = (curIdx + 1) % totalComps;
      container.destroy();
      CompanionModal3D.open(scene, CompanionModal3D.ROSTER[nextIdx].id, onSelect);
    });

    container.add([arrowLeft, arrowRight]);

    CompanionModal3D.ROSTER.forEach((item, idx) => {
      const itemX = startX + idx * spacing;
      const isSelected = item.id === activeCompId;
      const avatarDia = isSelected ? 50 : 46;
      const avatarRadius = avatarDia / 2;
      const avatarY = carouselY;

      // Halo / glow for active companion
      if (isSelected) {
        const auraHalo = scene.add.graphics();
        auraHalo.fillStyle(0xff3b30, 0.4);
        auraHalo.fillCircle(itemX, avatarY, avatarRadius + 8);
        auraHalo.fillStyle(0xff9500, 0.25);
        auraHalo.fillCircle(itemX, avatarY, avatarRadius + 13);
        container.add(auraHalo);

        scene.tweens.add({
          targets: auraHalo,
          alpha: { from: 0.35, to: 0.85 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Circular masked avatar image using the actual Linh Thú artwork!
      const artKey = getCompanionArtKey(item.id);
      let avatarElem: Phaser.GameObjects.GameObject;
      if (artKey && scene.textures.exists(artKey)) {
        const avatarImg = scene.add.image(itemX, avatarY, artKey);
        avatarImg.setDisplaySize(avatarDia, avatarDia);

        // Mask with circle
        const maskShape = scene.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillCircle(width / 2 + itemX, height / 2 + avatarY, avatarRadius);
        const circleMask = maskShape.createGeometryMask();
        avatarImg.setMask(circleMask);
        avatarElem = avatarImg;
      } else {
        const compCfg = CompanionManager.get(item.id);
        avatarElem = scene.add.text(itemX, avatarY, compCfg?.icon || '🦊', { fontSize: `${Math.round(avatarDia * 0.5)}px` }).setOrigin(0.5);
      }

      // Border ring
      const ringGfx = scene.add.graphics();
      if (isSelected) {
        ringGfx.lineStyle(2.5, 0xff4d6d, 1);
        ringGfx.strokeCircle(itemX, avatarY, avatarRadius + 2);
        ringGfx.lineStyle(1.2, 0xffd700, 1);
        ringGfx.strokeCircle(itemX, avatarY, avatarRadius - 1);
      } else {
        ringGfx.lineStyle(1.5, 0x495057, 0.85);
        ringGfx.strokeCircle(itemX, avatarY, avatarRadius + 1);
      }

      // Label Underneath
      const labelY = avatarY + avatarRadius + 15;
      let labelPill: Phaser.GameObjects.Graphics | null = null;
      let labelText: Phaser.GameObjects.Text;

      if (isSelected) {
        labelPill = scene.add.graphics();
        const pillW = Math.min(84, Math.max(64, item.shortName.length * 6.5 + 14));
        const pillH = 20;
        labelPill.fillStyle(0x3a0914, 0.95);
        labelPill.fillRoundedRect(itemX - pillW / 2, labelY - pillH / 2, pillW, pillH, 6);
        labelPill.lineStyle(1.2, 0xff4d6d, 0.95);
        labelPill.strokeRoundedRect(itemX - pillW / 2, labelY - pillH / 2, pillW, pillH, 6);

        labelText = scene.add.text(itemX, labelY, item.shortName, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: '800',
          color: '#ffffff'
        }).setOrigin(0.5);
      } else {
        labelText = scene.add.text(itemX, labelY, item.shortName, {
          fontFamily: FONT_UI,
          fontSize: '10px',
          fontStyle: '700',
          color: '#adb5bd'
        }).setOrigin(0.5);
      }

      // Click zone for each carousel item
      const itemZone = scene.add.zone(itemX, avatarY + 6, avatarDia + 16, avatarDia + 32)
        .setInteractive({ useHandCursor: true });

      itemZone.on('pointerdown', () => {
        if (activeCompId !== item.id) {
          audio.playSelect();
          haptic.light();
          container.destroy();
          CompanionModal3D.open(scene, item.id, onSelect);
        }
      });

      itemZone.on('pointerover', () => {
        if (!isSelected) {
          labelText.setColor('#ffd700');
        }
      });
      itemZone.on('pointerout', () => {
        if (!isSelected) {
          labelText.setColor('#ced4da');
        }
      });

      if (labelPill) container.add(labelPill);
      container.add([avatarElem, ringGfx, labelText, itemZone]);
    });

    // =========================================================================
    // 5. LEFT SHOWCASE AREA (CINEMATIC STAGE - 3.5 : 6.5 RATIO WITH RIGHT SECTION)
    // =========================================================================
    const showW = 326;
    const showH = 450;
    const showX = -frameW / 2 + 30 + showW / 2; // ~ -312
    const showY = 60;

    const activeConfig = CompanionManager.get(activeCompId);
    const primaryThemeColor = activeConfig.themeColor || 0xff758f;
    const activeMeta = CompanionModal3D.ROSTER.find(r => r.id === activeCompId) || CompanionModal3D.ROSTER[0];

    // Background container & Masking
    const showMaskShape = scene.make.graphics({});
    showMaskShape.fillStyle(0xffffff);
    showMaskShape.fillRoundedRect(
      width / 2 + showX - showW / 2,
      height / 2 + showY - showH / 2,
      showW,
      showH,
      16
    );
    const showMask = showMaskShape.createGeometryMask();

    // Shinto Shrine Night Background
    let bgTextureKey = 'bg_gameplay_shrine';
    if (!scene.textures.exists(bgTextureKey)) {
      bgTextureKey = 'bg_main_torii';
    }

    const showBg = scene.add.image(showX, showY, bgTextureKey);
    showBg.setDisplaySize(showW * 1.35, showH * 1.15);
    showBg.setMask(showMask);

    // Vignette & Night Shadow Overlay
    const showVignette = scene.add.graphics();
    showVignette.fillStyle(0x060814, 0.42);
    showVignette.fillRect(showX - showW / 2, showY - showH / 2, showW, showH);
    // Dark bottom floor gradient
    showVignette.fillStyle(0x0a0c1a, 0.75);
    showVignette.fillRect(showX - showW / 2, showY + showH / 2 - 130, showW, 130);
    showVignette.lineStyle(1.5, 0x3d4461, 0.85);
    showVignette.strokeRoundedRect(showX - showW / 2, showY - showH / 2, showW, showH, 16);
    showVignette.setMask(showMask);

    container.add([showBg, showVignette]);

    // Dais / Ritual Altar at Creature's Feet (Proportional to 326px stage)
    const daisY = showY + 140;
    const daisGfx = scene.add.graphics();
    // Glowing base ellipse
    daisGfx.fillStyle(primaryThemeColor, 0.28);
    daisGfx.fillEllipse(showX, daisY, 230, 50);
    // Outer golden ring
    daisGfx.lineStyle(2.5, 0xffd700, 0.95);
    daisGfx.strokeEllipse(showX, daisY, 210, 42);
    // Inner primary colored ring
    daisGfx.lineStyle(1.8, primaryThemeColor, 0.9);
    daisGfx.strokeEllipse(showX, daisY, 160, 30);

    const runeText = scene.add.text(showX, daisY, '✦ ⛩️ ✦ ✨ ✦ ⛩️ ✦', {
      fontFamily: 'Zen Maru Gothic, sans-serif',
      fontSize: '11px',
      color: '#ffd700'
    }).setOrigin(0.5).setAlpha(0.9);

    container.add([daisGfx, runeText]);

    // Chevrons on sides of Pedestal (< and >)
    const pedArrowLeft = scene.add.text(showX - 135, showY + 30, '‹', {
      fontFamily: FONT_UI,
      fontSize: '32px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const pedArrowRight = scene.add.text(showX + 135, showY + 30, '›', {
      fontFamily: FONT_UI,
      fontSize: '32px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    pedArrowLeft.on('pointerdown', () => {
      audio.playSelect();
      const curIdx = CompanionModal3D.ROSTER.findIndex(r => r.id === activeCompId);
      const prevIdx = (curIdx - 1 + totalComps) % totalComps;
      container.destroy();
      CompanionModal3D.open(scene, CompanionModal3D.ROSTER[prevIdx].id, onSelect);
    });

    pedArrowRight.on('pointerdown', () => {
      audio.playSelect();
      const curIdx = CompanionModal3D.ROSTER.findIndex(r => r.id === activeCompId);
      const nextIdx = (curIdx + 1) % totalComps;
      container.destroy();
      CompanionModal3D.open(scene, CompanionModal3D.ROSTER[nextIdx].id, onSelect);
    });

    container.add([pedArrowLeft, pedArrowRight]);

    // Center Creature Sprite & 3D Turntable Support (3.5 : 6.5 proportions)
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

    let initialKey = getCompanionArtKey(activeCompId);
    if (has3DFrames && scene.textures.exists(getFrameKey(0))) {
      initialKey = getFrameKey(0);
    }

    const mainCreature = scene.add.image(showX, showY + 12, initialKey);
    mainCreature.setDisplaySize(225, 225);

    // Floating breathing bobbing
    const bobTween = scene.tweens.add({
      targets: mainCreature,
      y: showY + 4,
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
        mainCreature.setTexture(key);
      }
    };

    if (has3DFrames) {
      updateViewFrame(0);
    }

    // Falling Sakura Blossom Particles across showcase
    for (let s = 0; s < 7; s++) {
      const petal = scene.add.text(
        showX + Phaser.Math.Between(-showW / 2 + 20, showW / 2 - 20),
        showY - showH / 2 + Phaser.Math.Between(0, showH),
        '🌸',
        { fontSize: `${Phaser.Math.Between(12, 15)}px` }
      ).setAlpha(Phaser.Math.FloatBetween(0.5, 0.85)).setMask(showMask);

      container.add(petal);

      scene.tweens.add({
        targets: petal,
        y: showY + showH / 2 + 20,
        x: petal.x + Phaser.Math.Between(-25, 25),
        duration: Phaser.Math.Between(3500, 5500),
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          petal.x = showX + Phaser.Math.Between(-showW / 2 + 20, showW / 2 - 20);
          petal.y = showY - showH / 2 - 20;
        }
      });
    }

    // Touch & Drag Zone to Rotate 360° or Tap to interact
    const dragZone = scene.add.zone(showX, showY + 20, 260, 260).setInteractive({ useHandCursor: true });
    let isDragging = false;
    let dragStartX = 0;
    let dragStartFrame = 0;

    const triggerCreatureTap = () => {
      audio.playVictory();
      bobTween.pause();

      scene.tweens.add({
        targets: mainCreature,
        y: showY - 14,
        scaleX: 1.1,
        scaleY: 0.92,
        duration: 160,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          bobTween.resume();
        }
      });

      const pool = ['✨', '💫', '🌸', activeConfig.icon, '⚡'];
      for (let i = 0; i < 6; i++) {
        const spark = scene.add.text(
          showX + Phaser.Math.Between(-50, 50),
          showY + Phaser.Math.Between(-30, 30),
          pool[i % pool.length],
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

    dragZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
        const tiltAngle = Phaser.Math.Clamp(deltaX * 0.08, -15, 15);
        mainCreature.setAngle(tiltAngle);
      }
    };
    scene.input.on('pointermove', onPointerMove);

    const finishDrag = (pointer: Phaser.Input.Pointer) => {
      if (!isDragging) return;
      isDragging = false;
      if (!has3DFrames) {
        scene.tweens.add({
          targets: mainCreature,
          angle: 0,
          duration: 200,
          ease: 'Sine.easeOut'
        });
      }
      const totalMoved = Math.abs(pointer.x - dragStartX);
      if (totalMoved < 8) {
        triggerCreatureTap();
      }
    };

    dragZone.on('pointerup', finishDrag);
    dragZone.on('pointerupoutside', finishDrag);

    container.add([mainCreature, dragZone]);

    // =========================================================================
    // 6. RIGHT STATS & SKILLS COLUMN (3.5 : 6.5 RATIO - 600PX WIDTH - SPACIOUS UX/UI)
    // =========================================================================
    const rightW = 600;
    const rightX = frameW / 2 - 30 - rightW / 2; // ~ 175
    const colLeft = rightX - rightW / 2; // -125
    const colRight = rightX + rightW / 2; // 475

    const currentTier = save.getCompanionTier(activeCompId);
    const currentLevel = save.getCompanionLevel(activeCompId);
    const currentShards = save.getCompanionShards(activeCompId);
    const maxLevel = save.getMaxLevelForTier(currentTier);
    const tierInfo = CompanionManager.getTierInfo(activeCompId, currentTier);
    const totalStats = save.getCompanionTotalStats(activeCompId);
    const lvlCheck = save.canLevelUpCompanion(activeCompId);
    const evoCheck = save.canEvolveCompanion(activeCompId);
    const isUnlocked = save.isCompanionUnlocked(activeCompId);
    const summonCheck = save.canSummonCompanion(activeCompId);
    const isMaxTierMaxLevel = currentTier >= 3 && currentLevel >= 30;
    const isReadyForEvolution = currentLevel >= maxLevel && currentTier < 3;
    const curExp = save.getCompanionExp(activeCompId);
    const reqExp = save.getRequiredExpForNextLevel(currentTier, currentLevel);

    // Row 1: Header (NO ICON - CLEAN NAME + CRIMSON TIER BADGE + SHARD BADGE + SUBTITLE)
    const headerRowY = -144;

    const nameText = scene.add.text(colLeft + 8, headerRowY, activeMeta.fullName, {
      fontFamily: FONT_UI,
      fontSize: '23px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 0.5
    }).setOrigin(0, 0.5);

    // Crimson Badge Pill (BẬC I • ẤU THÚ)
    const tierRoman = currentTier === 1 ? 'I' : (currentTier === 2 ? 'II' : 'III');
    const badgeTextStr = `BẬC ${tierRoman} • ${tierInfo.tierName.toUpperCase()}`;
    const badgeW = Math.max(124, badgeTextStr.length * 7.5 + 24);
    const badgeH = 24;
    const badgeX = colLeft + 8 + nameText.width + 12 + badgeW / 2;
    const badgeGfx = scene.add.graphics();
    badgeGfx.fillStyle(0xd90429, 0.95);
    badgeGfx.fillRoundedRect(badgeX - badgeW / 2, headerRowY - badgeH / 2, badgeW, badgeH, 12);
    badgeGfx.lineStyle(1.2, 0xff758f, 0.95);
    badgeGfx.strokeRoundedRect(badgeX - badgeW / 2, headerRowY - badgeH / 2, badgeW, badgeH, 12);

    const badgeText = scene.add.text(badgeX, headerRowY, badgeTextStr, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Mảnh Tiến Hóa Badge Pill (e.g. 🧩 18/50 MẢNH or 🧩 18/50 (+32 🔮) or 👑 100 MẢNH • TỐI THƯỢNG)
    const reqEvoShards = currentTier === 1 ? 50 : (currentTier === 2 ? 100 : 0);
    const universalShards = save.getUniversalShards();
    const effectiveShards = currentShards + universalShards;
    const hasDirectShards = currentTier < 3 && currentShards >= reqEvoShards;
    const hasUniversalFallback = currentTier < 3 && !hasDirectShards && effectiveShards >= reqEvoShards;
    const hasEnoughShards = hasDirectShards || hasUniversalFallback;

    let shardBadgeStr: string;
    if (currentTier >= 3) {
      shardBadgeStr = `👑 ${currentShards} MẢNH (MAX BẬC)`;
    } else if (hasDirectShards) {
      shardBadgeStr = `🧩 ${currentShards}/${reqEvoShards} MẢNH`;
    } else if (hasUniversalFallback) {
      shardBadgeStr = `🧩 ${currentShards}/${reqEvoShards} (+${reqEvoShards - currentShards} 🔮)`;
    } else {
      shardBadgeStr = `🧩 ${currentShards}/${reqEvoShards} MẢNH`;
    }

    const shardBadgeW = Math.max(116, shardBadgeStr.length * 7.2 + 22);
    const shardBadgeH = 24;
    const shardBadgeX = colRight - shardBadgeW / 2;
    const shardGfx = scene.add.graphics();

    // Glowing cyan/emerald/purple lacquer background
    const shardBgColor = hasDirectShards ? 0x064e3b : (hasUniversalFallback ? 0x2e1065 : 0x082f49);
    const shardStrokeColor = hasDirectShards ? 0x10b981 : (hasUniversalFallback ? 0xa855f7 : 0x38bdf8);
    const shardTextColor = hasDirectShards ? '#34d399' : (hasUniversalFallback ? '#d8b4fe' : '#7dd3fc');

    shardGfx.fillStyle(shardBgColor, 0.95);
    shardGfx.fillRoundedRect(shardBadgeX - shardBadgeW / 2, headerRowY - shardBadgeH / 2, shardBadgeW, shardBadgeH, 12);
    shardGfx.lineStyle(1.2, shardStrokeColor, 0.95);
    shardGfx.strokeRoundedRect(shardBadgeX - shardBadgeW / 2, headerRowY - shardBadgeH / 2, shardBadgeW, shardBadgeH, 12);

    const shardBadgeText = scene.add.text(shardBadgeX, headerRowY, shardBadgeStr, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: shardTextColor
    }).setOrigin(0.5);

    const shardZone = scene.add.zone(shardBadgeX, headerRowY, shardBadgeW, shardBadgeH).setInteractive({ useHandCursor: true });
    shardZone.on('pointerdown', () => {
      audio.playSelect();
      if ((scene as any).showNotice) {
        if (currentTier < 3) {
          if (hasDirectShards) {
            (scene as any).showNotice(
              `🧩 Mảnh ${activeMeta.fullName}: Có ${currentShards}/${reqEvoShards} Mảnh. Cần ${reqEvoShards} Mảnh + ${currentTier === 1 ? '1.000' : '2.500'} Xu để Tiến Hóa lên Bậc ${currentTier + 1}!`,
              0x10b981
            );
          } else if (hasUniversalFallback) {
            const neededUni = reqEvoShards - currentShards;
            (scene as any).showNotice(
              `🔮 Mảnh ${activeMeta.fullName}: Có ${currentShards}/${reqEvoShards} Mảnh + tự động bù ${neededUni} Linh Thạch Vạn Năng (Kho: ${universalShards} 🔮). Đủ điều kiện Tiến Hóa!`,
              0xa855f7
            );
          } else {
            (scene as any).showNotice(
              `🧩 Mảnh ${activeMeta.fullName}: Có ${currentShards}/${reqEvoShards} Mảnh (Kho Vạn Năng: ${universalShards} 🔮). Cần ${reqEvoShards} Mảnh + ${currentTier === 1 ? '1.000' : '2.500'} Xu để Tiến Hóa lên Bậc ${currentTier + 1}!`,
              0x38bdf8
            );
          }
        } else {
          (scene as any).showNotice(
            `👑 Linh Thú đã đạt Bậc III Thần Linh Thức Tỉnh tối thượng! (Kho: ${currentShards} Mảnh)`,
            0xffd700
          );
        }
      }
    });

    // Subtitle (Lore accurate element & title)
    const subTitleStr = `${activeConfig.title} • ${activeConfig.elementLabel}`;
    const subTitleText = scene.add.text(colLeft + 8, headerRowY + 24, subTitleStr, {
      fontFamily: FONT_UI,
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0, 0.5);

    container.add([nameText, badgeGfx, badgeText, shardGfx, shardBadgeText, shardZone, subTitleText]);

    // Row 2: Level & EXP Bar + [ ⬆ NÂNG CẤP ] or [ ⚡ TIẾN HÓA ] Button
    const expRowY = headerRowY + 58; // ~ -86
    const levelLabel = scene.add.text(colLeft + 8, expRowY, `Lv. ${currentLevel}/${maxLevel}`, {
      fontFamily: FONT_UI,
      fontSize: '15.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // [ ⬆ NÂNG CẤP ] or [ ⚡ TIẾN HÓA ] Dynamic Button
    const upgBtnW = 112;
    const upgBtnH = 32;
    const upgBtnX = colRight - upgBtnW / 2;
    const upgBtnGfx = scene.add.graphics();

    let btnBgColor = 0xd4af37;
    let btnStrokeColor = 0xffe57f;
    let btnTextColor = '#1a1a2e';
    let btnLabel = '⬆ NÂNG CẤP';

    if (isMaxTierMaxLevel) {
      btnBgColor = 0x161a29;
      btnStrokeColor = 0x475569;
      btnTextColor = '#94a3b8';
      btnLabel = '👑 CỰC ĐẠI';
    } else if (isReadyForEvolution) {
      if (evoCheck.canEvolve) {
        btnBgColor = 0x059669;
        btnStrokeColor = 0x34d399;
        btnTextColor = '#ffffff';
        btnLabel = '⚡ TIẾN HÓA';
      } else {
        btnBgColor = 0x241624;
        btnStrokeColor = 0xa855f7;
        btnTextColor = '#d8b4fe';
        const neededShards = Math.max(0, evoCheck.requiredShards - (currentShards + universalShards));
        btnLabel = `🔒 CẦN ${neededShards > 0 ? neededShards : evoCheck.requiredShards} MẢNH`;
      }
    } else {
      if (lvlCheck.canLevelUp) {
        btnBgColor = 0xd4af37;
        btnStrokeColor = 0xffe57f;
        btnTextColor = '#1a1a2e';
        btnLabel = '⬆ NÂNG CẤP';
      } else {
        btnBgColor = 0x141824;
        btnStrokeColor = 0x2d3748;
        btnTextColor = '#64748b';
        btnLabel = '⬆ NÂNG CẤP';
      }
    }

    upgBtnGfx.fillStyle(btnBgColor, 0.95);
    upgBtnGfx.fillRoundedRect(upgBtnX - upgBtnW / 2, expRowY - upgBtnH / 2, upgBtnW, upgBtnH, 16);
    upgBtnGfx.lineStyle(1.4, btnStrokeColor, 1);
    upgBtnGfx.strokeRoundedRect(upgBtnX - upgBtnW / 2, expRowY - upgBtnH / 2, upgBtnW, upgBtnH, 16);

    const upgBtnText = scene.add.text(upgBtnX, expRowY, btnLabel, {
      fontFamily: FONT_UI,
      fontSize: btnLabel.length > 10 ? '10px' : '12px',
      fontStyle: '900',
      color: btnTextColor
    }).setOrigin(0.5);

    // EXP Bar (Placed cleanly between level label and upgrade button)
    const expBarX = colLeft + 96;
    const expBarW = colRight - upgBtnW - 14 - expBarX;
    const expBarH = 20;
    const expBarGfx = scene.add.graphics();
    expBarGfx.fillStyle(0x0f1424, 0.95);
    expBarGfx.fillRoundedRect(expBarX, expRowY - expBarH / 2, expBarW, expBarH, 10);
    expBarGfx.lineStyle(1, 0x2d3748, 0.85);
    expBarGfx.strokeRoundedRect(expBarX, expRowY - expBarH / 2, expBarW, expBarH, 10);

    const expFrac = isMaxTierMaxLevel ? 1 : Math.min(1, curExp / Math.max(1, reqExp));
    if (expFrac > 0) {
      expBarGfx.fillStyle(curExp >= reqExp ? 0x10b981 : 0xf59e0b, 0.95);
      expBarGfx.fillRoundedRect(expBarX, expRowY - expBarH / 2, expBarW * expFrac, expBarH, 10);
    }

    const expBarTextStr = isMaxTierMaxLevel
      ? 'MAX LEVEL'
      : isReadyForEvolution
        ? `CẤP TỐI ĐA BẬC ${currentTier} (${maxLevel}/${maxLevel})`
        : curExp >= reqExp
          ? `EXP ĐÃ ĐẦY! (${formatCurrency(curExp)}/${formatCurrency(reqExp)})`
          : `${formatCurrency(curExp)}/${formatCurrency(reqExp)} EXP`;

    const expBarText = scene.add.text(expBarX + expBarW / 2, expRowY, expBarTextStr, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    const upgZone = scene.add.zone(upgBtnX, expRowY, upgBtnW, upgBtnH).setInteractive({ useHandCursor: true });
    upgZone.on('pointerdown', () => {
      if (isReadyForEvolution) {
        if (evoCheck.canEvolve) {
          const uniBefore = save.getUniversalShards();
          const res = save.evolveCompanion(activeCompId);
          if (res.success) {
            audio.playVictory();
            haptic.success();
            const uniUsed = uniBefore - save.getUniversalShards();
            if ((scene as any).showNotice) {
              const extraMsg = uniUsed > 0 ? ` (Dùng ${uniUsed} 🔮 Linh Thạch Vạn Năng)` : '';
              (scene as any).showNotice(`⚡ TIẾN HÓA THÀNH CÔNG BẬC ${res.newTier}!${extraMsg}`, 0x10b981);
            }
            container.destroy();
            CompanionModal3D.open(scene, activeCompId, onSelect);
          }
        } else {
          audio.playError();
          haptic.warning();
          if ((scene as any).showNotice) {
            (scene as any).showNotice(`⚠️ ${evoCheck.reason}`, 0xff4d6d);
          }
        }
      } else if (isMaxTierMaxLevel) {
        audio.playSelect();
        haptic.light();
        if ((scene as any).showNotice) {
          (scene as any).showNotice('👑 Linh Thú đã đạt cấp tối thượng Thần Linh!', 0xffd700);
        }
      } else {
        if (lvlCheck.canLevelUp) {
          const res = save.levelUpCompanion(activeCompId);
          if (res.success) {
            audio.playVictory();
            haptic.medium();
            container.destroy();
            CompanionModal3D.open(scene, activeCompId, onSelect);
          }
        } else {
          audio.playError();
          haptic.warning();
          if ((scene as any).showNotice) {
            (scene as any).showNotice(`⚠️ ${lvlCheck.reason}`, 0xff4d6d);
          }
        }
      }
    });

    container.add([levelLabel, expBarGfx, expBarText, upgBtnGfx, upgBtnText, upgZone]);

    // Row 3: 3 Stat Badges (Horizontal Row - Spacious 44px gap after exp row)
    const statsY = expRowY + 44; // ~ -42
    const statPillW = (rightW - 16) / 3; // ~ 194
    const statPillH = 30;

    const statsData = [
      { texture: 'icon_reward_coin', icon: '🪙', label: `+${totalStats.goldBonusPercent}% Vàng & EXP`, x: colLeft + statPillW / 2 },
      { texture: null, icon: '🔥', label: `+${totalStats.rageBonusPercent}% Nộ`, x: colLeft + statPillW + 8 + statPillW / 2 },
      { texture: 'icon_reward_speed', icon: '⏳', label: `+${totalStats.comboTimeBonusSec}s Combo`, x: colRight - statPillW / 2 }
    ];

    statsData.forEach(s => {
      const sGfx = scene.add.graphics();
      sGfx.fillStyle(0x101426, 0.92);
      sGfx.fillRoundedRect(s.x - statPillW / 2, statsY - statPillH / 2, statPillW, statPillH, 8);
      sGfx.lineStyle(1.2, 0x2e3852, 0.85);
      sGfx.strokeRoundedRect(s.x - statPillW / 2, statsY - statPillH / 2, statPillW, statPillH, 8);

      const hasTex = s.texture && scene.textures.exists(s.texture);
      let sIcon: Phaser.GameObjects.GameObject | null = null;
      if (hasTex) {
        sIcon = scene.add.image(s.x - statPillW / 2 + 14, statsY, s.texture!).setDisplaySize(16, 16);
      }
      const sText = scene.add.text(hasTex ? s.x + 8 : s.x, statsY, `${hasTex ? '' : s.icon + ' '}${s.label}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '800',
        color: '#ffffff'
      }).setOrigin(0.5);

      container.add(sIcon ? [sGfx, sIcon, sText] : [sGfx, sText]);
    });

    // Helper to render crisp skill / passive badges (ALWAYS ON TOP OF CARD BACKGROUND)
    const addBadgeTag = (tx: number, ty: number, tw: number, txt: string, strokeColor: number, bgColor: number) => {
      const tg = scene.add.graphics();
      tg.fillStyle(bgColor, 1);
      tg.fillRoundedRect(tx - tw / 2, ty - 11, tw, 22, 6);
      tg.lineStyle(1.2, strokeColor, 0.95);
      tg.strokeRoundedRect(tx - tw / 2, ty - 11, tw, 22, 6);
      const tt = scene.add.text(tx, ty, txt, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '800',
        color: '#ffffff'
      }).setOrigin(0.5);
      container.add([tg, tt]);
    };

    // =========================================================================
    // 3 SKILL CARDS (SPACIOUS 78PX HEIGHT - 11PX GAP - CRISP 1-LINE EVOLUTION PREVIEW)
    // =========================================================================
    const cardW = rightW;
    const card1H = 78;
    const card1Top = -12;
    const card1Y = card1Top + card1H / 2;

    // Glowing crimson / ruby card background
    const card1Gfx = scene.add.graphics();
    card1Gfx.fillStyle(0x1e0b14, 0.96);
    card1Gfx.fillRoundedRect(colLeft, card1Top, cardW, card1H, 14);
    card1Gfx.lineStyle(1.5, 0xff3855, 0.9);
    card1Gfx.strokeRoundedRect(colLeft, card1Top, cardW, card1H, 14);
    container.add(card1Gfx);

    // Whole Card 1 click zone to view 3-tier evolution roadmap
    const card1Zone = scene.add.zone(rightX, card1Y, cardW, card1H).setInteractive({ useHandCursor: true });
    card1Zone.on('pointerdown', () => {
      audio.playSelect();
      CompanionModal3D.openSkillPreview(scene, activeCompId, tierInfo.skillName, tierInfo.skillDesc, 'active');
    });
    container.add(card1Zone);

    // Circular glowing skill icon on left (HD Skill Art)
    const icon1X = colLeft + 40;
    const skillActKey = scene.textures.exists(`skill_act_${activeCompId}`)
      ? `skill_act_${activeCompId}`
      : `skill_${activeCompId}`;
    const skillIconBg = scene.add.graphics();
    skillIconBg.fillStyle(0x0a0c16, 0.98);
    skillIconBg.fillCircle(icon1X, card1Y, 26);
    skillIconBg.lineStyle(2, 0xff3855, 0.95);
    skillIconBg.strokeCircle(icon1X, card1Y, 26);
    skillIconBg.lineStyle(1.2, 0xffd700, 0.75);
    skillIconBg.strokeCircle(icon1X, card1Y, 28);
    container.add(skillIconBg);

    let skillIconElem: Phaser.GameObjects.GameObject;
    if (scene.textures.exists(skillActKey)) {
      const skillImg = scene.add.image(icon1X, card1Y, skillActKey);
      skillImg.setDisplaySize(50, 50);
      skillIconElem = skillImg;
    } else {
      skillIconElem = scene.add.text(icon1X, card1Y, '🔥', { fontSize: '24px' }).setOrigin(0.5);
    }
    container.add(skillIconElem);

    // Card 1 Text Hierarchy: Row 1 Subtitle, Row 2 Skill Name, Row 3 Description, Row 4 Next Evolution
    const c1Sub = scene.add.text(colLeft + 76, card1Top + 14, `TUYỆT CHIÊU (BẬC ${tierRoman})`, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#ff6b81'
    }).setOrigin(0, 0.5);

    const c1Title = scene.add.text(colLeft + 76, card1Top + 30, tierInfo.skillName.toUpperCase(), {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const c1Desc = scene.add.text(colLeft + 76, card1Top + 47, tierInfo.skillDesc, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      color: '#cbd5e1',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    const nextTier1Info = currentTier < 3 ? CompanionManager.getTierInfo(activeCompId, currentTier + 1) : null;
    let c1EvoStr = '👑 Đã đạt Bậc III tối thượng: Uy lực Thần Linh cực đại!';
    if (nextTier1Info) {
      if (currentTier === 1) {
        c1EvoStr = `⚡ Bậc II (${nextTier1Info.tierName}): [${nextTier1Info.skillName}] Phá băng/nhện & xua ảo ảnh Boss (6s)`;
      } else if (currentTier === 2) {
        c1EvoStr = `⚡ Bậc III (${nextTier1Info.tierName}): [${nextTier1Info.skillName}] Giải 2 cặp ô & giáng 300 sát thương tê liệt`;
      }
    }

    const c1Next = scene.add.text(colLeft + 76, card1Top + 63, c1EvoStr, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '800',
      color: nextTier1Info ? '#ff758f' : '#ffd700',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    container.add([c1Sub, c1Title, c1Desc, c1Next]);

    // Right Badges & Info (i) - Perfectly aligned with Row 1
    const tag1RowY = card1Top + 16;
    addBadgeTag(colRight - 124, tag1RowY, 60, activeMeta.tagsSkill[0], 0xff4d6d, 0x400c18);
    addBadgeTag(colRight - 60, tag1RowY, 56, activeMeta.tagsSkill[1], 0xff4d6d, 0x400c18);

    // Info circle (i)
    const info1X = colRight - 18;
    const info1Gfx = scene.add.graphics();
    info1Gfx.fillStyle(0x3a0e1c, 0.85);
    info1Gfx.fillCircle(info1X, tag1RowY, 11);
    info1Gfx.lineStyle(1.2, 0xff758f, 0.9);
    info1Gfx.strokeCircle(info1X, tag1RowY, 11);
    const info1Text = scene.add.text(info1X, tag1RowY, 'i', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ff758f'
    }).setOrigin(0.5);
    container.add([info1Gfx, info1Text]);

    // Row 5: Card 2: Nội Tại (Passive Skill - 11px gap after Card 1)
    const card2H = 78;
    const card2Top = card1Top + card1H + 11; // 77
    const card2Y = card2Top + card2H / 2;

    // Glowing sapphire / blue card background
    const card2Gfx = scene.add.graphics();
    card2Gfx.fillStyle(0x091929, 0.96);
    card2Gfx.fillRoundedRect(colLeft, card2Top, cardW, card2H, 14);
    card2Gfx.lineStyle(1.5, 0x00b4d8, 0.9);
    card2Gfx.strokeRoundedRect(colLeft, card2Top, cardW, card2H, 14);
    container.add(card2Gfx);

    // Whole Card 2 click zone to view 3-tier evolution roadmap
    const card2Zone = scene.add.zone(rightX, card2Y, cardW, card2H).setInteractive({ useHandCursor: true });
    card2Zone.on('pointerdown', () => {
      audio.playSelect();
      CompanionModal3D.openSkillPreview(
        scene, 
        activeCompId, 
        activeConfig.passiveName || 'GIA HỘ NỘI TẠI', 
        activeConfig.passiveDesc || 'Tăng cường sức mạnh liên tục trong trận đấu.', 
        'passive'
      );
    });
    container.add(card2Zone);

    // Circular glowing passive icon on left (HD Skill Art)
    const icon2X = colLeft + 40;
    const skillPasKey = `skill_pas_${activeCompId}`;
    const icon2Gfx = scene.add.graphics();
    icon2Gfx.fillStyle(0x051b2c, 0.98);
    icon2Gfx.fillCircle(icon2X, card2Y, 26);
    icon2Gfx.lineStyle(2, 0x00b4d8, 0.95);
    icon2Gfx.strokeCircle(icon2X, card2Y, 26);
    icon2Gfx.lineStyle(1.2, 0x48cae4, 0.65);
    icon2Gfx.strokeCircle(icon2X, card2Y, 28);
    container.add(icon2Gfx);

    let icon2Elem: Phaser.GameObjects.GameObject;
    if (scene.textures.exists(skillPasKey)) {
      const pasImg = scene.add.image(icon2X, card2Y, skillPasKey);
      pasImg.setDisplaySize(50, 50);
      icon2Elem = pasImg;
    } else {
      const passiveIconsMap: Record<string, string> = {
        inari_kitsune: '🦊',
        ryujin_pearl: '🌊',
        hi_no_tori: '🪶',
        byakko_tiger: '⚡',
        genbu_tortoise: '🛡️',
        kirin_sacred: '🌸',
        raiju_thunder: '⚡',
        yatagarasu_crow: '☀️',
        nekomata_cat: '🪙',
        orochi_serpent: '👑'
      };
      const passiveEmoji = passiveIconsMap[activeCompId] || '💧';
      icon2Elem = scene.add.text(icon2X, card2Y, passiveEmoji, { fontSize: '24px' }).setOrigin(0.5);
    }
    container.add(icon2Elem);

    // Card 2 Text Hierarchy
    const c2Sub = scene.add.text(colLeft + 76, card2Top + 14, 'NỘI TẠI', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#38bdf8'
    }).setOrigin(0, 0.5);

    const c2Title = scene.add.text(colLeft + 76, card2Top + 30, (activeConfig.passiveName || 'GIA HỘ').toUpperCase(), {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const c2Desc = scene.add.text(colLeft + 76, card2Top + 47, activeConfig.passiveDesc || '', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      color: '#cbd5e1',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    let c2EvoStr = '👑 Đã đạt Bậc III tối thượng: Gia hộ nội tại thức tỉnh toàn diện';
    if (currentTier === 1) {
      c2EvoStr = '⚡ Tiến Hóa Bậc II: Tăng thêm thời gian duy trì combo +1.6s & thưởng Xu';
    } else if (currentTier === 2) {
      c2EvoStr = '⚡ Tiến Hóa Bậc III: Khóa thời gian combo vĩnh viễn trong 5s sau khi nối gạch';
    }

    const c2Next = scene.add.text(colLeft + 76, card2Top + 63, c2EvoStr, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '800',
      color: currentTier < 3 ? '#38bdf8' : '#ffd700',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    container.add([c2Sub, c2Title, c2Desc, c2Next]);

    // Right Badges & Info (i) - Perfectly aligned with Row 1
    const tag2RowY = card2Top + 16;
    addBadgeTag(colRight - 134, tag2RowY, 56, activeMeta.tagsPassive[0], 0x00b4d8, 0x092644);
    addBadgeTag(colRight - 66, tag2RowY, 68, activeMeta.tagsPassive[1], 0x00b4d8, 0x092644);

    // Info circle (i)
    const info2X = colRight - 18;
    const info2Gfx = scene.add.graphics();
    info2Gfx.fillStyle(0x0c2b4a, 0.85);
    info2Gfx.fillCircle(info2X, tag2RowY, 11);
    info2Gfx.lineStyle(1.2, 0x48cae4, 0.9);
    info2Gfx.strokeCircle(info2X, tag2RowY, 11);
    const info2Text = scene.add.text(info2X, tag2RowY, 'i', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#48cae4'
    }).setOrigin(0.5);
    container.add([info2Gfx, info2Text]);

    // Row 6: Card 3: Khắc Chế (Counter / Advantage - 11px gap after Card 2)
    const card3H = 78;
    const card3Top = card2Top + card2H + 11; // 166
    const card3Y = card3Top + card3H / 2;

    // Glowing warm amber / gold card background
    const card3Gfx = scene.add.graphics();
    card3Gfx.fillStyle(0x191408, 0.96);
    card3Gfx.fillRoundedRect(colLeft, card3Top, cardW, card3H, 14);
    card3Gfx.lineStyle(1.5, 0xf59e0b, 0.9);
    card3Gfx.strokeRoundedRect(colLeft, card3Top, cardW, card3H, 14);
    container.add(card3Gfx);

    // Whole Card 3 click zone to view 3-tier evolution roadmap
    const card3Zone = scene.add.zone(rightX, card3Y, cardW, card3H).setInteractive({ useHandCursor: true });
    card3Zone.on('pointerdown', () => {
      audio.playSelect();
      CompanionModal3D.openSkillPreview(
        scene, 
        activeCompId, 
        `KHẮC CHẾ: ${counterHead}`, 
        tierInfo.bossCounterDesc, 
        'counter'
      );
    });
    container.add(card3Zone);

    // Circular glowing counter icon on left (HD Skill Art)
    const icon3X = colLeft + 40;
    const skillCntKey = scene.textures.exists(`skill_cnt_${activeCompId}`)
      ? `skill_cnt_${activeCompId}`
      : null;
    const icon3Gfx = scene.add.graphics();
    icon3Gfx.fillStyle(0x1f1406, 0.98);
    icon3Gfx.fillCircle(icon3X, card3Y, 26);
    icon3Gfx.lineStyle(2, 0xf59e0b, 0.95);
    icon3Gfx.strokeCircle(icon3X, card3Y, 26);
    icon3Gfx.lineStyle(1.2, 0xffd700, 0.75);
    icon3Gfx.strokeCircle(icon3X, card3Y, 28);
    container.add(icon3Gfx);

    let icon3Elem: Phaser.GameObjects.GameObject;
    if (skillCntKey) {
      const cntImg = scene.add.image(icon3X, card3Y, skillCntKey);
      cntImg.setDisplaySize(50, 50);
      icon3Elem = cntImg;
    } else {
      icon3Elem = scene.add.text(icon3X, card3Y, '🛡️', { fontSize: '24px' }).setOrigin(0.5);
    }
    container.add(icon3Elem);

    const counterParts = tierInfo.bossCounterDesc.split(':');
    const counterHead = (counterParts[0] || 'Boss Ma Dù & Bức Tường Ma').replace(/^Khắc chế\s*:\s*/i, '').trim();
    const counterBody = (counterParts[1] || 'Hóa giải các góc kẹt do ảo ảnh tạo ra.').trim();

    // Card 3 Text Hierarchy
    const c3Sub = scene.add.text(colLeft + 76, card3Top + 14, 'KHẮC CHẾ', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: '900',
      color: '#fbbf24'
    }).setOrigin(0, 0.5);

    const c3Title = scene.add.text(colLeft + 76, card3Top + 30, counterHead.toUpperCase(), {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    const c3Desc = scene.add.text(colLeft + 76, card3Top + 47, counterBody, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      color: '#cbd5e1',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    let c3EvoStr = '👑 Đã khắc chế tuyệt đối: Vô hiệu hóa toàn bộ cơ chế của Đại Boss';
    if (currentTier === 1) {
      c3EvoStr = '⚡ Khắc Chế Bậc II: Vô hiệu hóa ảo ảnh tàng hình & thiêu rụi bẫy mạng nhện';
    } else if (currentTier === 2) {
      c3EvoStr = '⚡ Khắc Chế Bậc III: Tê liệt hoàn toàn mọi tà thuật và chiêu thức phong tỏa';
    }

    const c3Next = scene.add.text(colLeft + 76, card3Top + 63, c3EvoStr, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      fontStyle: '800',
      color: currentTier < 3 ? '#fbbf24' : '#ffd700',
      wordWrap: { width: cardW - 85 }
    }).setOrigin(0, 0.5);

    container.add([c3Sub, c3Title, c3Desc, c3Next]);

    // Right Badges & Info (i) - Perfectly aligned with Row 1 & 2
    const tag3RowY = card3Top + 16;
    addBadgeTag(colRight - 134, tag3RowY, 60, activeMeta.tagsCounter[0], 0xf59e0b, 0x3d2503);
    addBadgeTag(colRight - 66, tag3RowY, 68, activeMeta.tagsCounter[1], 0xf59e0b, 0x3d2503);

    // Info circle (i)
    const info3X = colRight - 18;
    const info3Gfx = scene.add.graphics();
    info3Gfx.fillStyle(0x3d2503, 0.85);
    info3Gfx.fillCircle(info3X, tag3RowY, 11);
    info3Gfx.lineStyle(1.2, 0xfbbf24, 0.9);
    info3Gfx.strokeCircle(info3X, tag3RowY, 11);
    const info3Text = scene.add.text(info3X, tag3RowY, 'i', {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setOrigin(0.5);
    container.add([info3Gfx, info3Text]);

    // Row 7: Action Footer Buttons: [ 🔄 ĐỔI LINH THÚ ] + [ ✔ ĐANG ĐỒNG HÀNH ] / [ ⚡ CHỌN ĐỒNG HÀNH ]
    const footerBtnH = 46;
    const footerY = card3Top + card3H + 16 + footerBtnH / 2; // ~ 283

    // Left Button: [ 🔄 ĐỔI LINH THÚ ]
    const switchBtnW = 180;
    const switchBtnX = colLeft + switchBtnW / 2;
    const switchBtnGfx = scene.add.graphics();
    switchBtnGfx.fillStyle(0x132238, 0.95);
    switchBtnGfx.fillRoundedRect(switchBtnX - switchBtnW / 2, footerY - footerBtnH / 2, switchBtnW, footerBtnH, 12);
    switchBtnGfx.lineStyle(1.4, 0x48cae4, 0.85);
    switchBtnGfx.strokeRoundedRect(switchBtnX - switchBtnW / 2, footerY - footerBtnH / 2, switchBtnW, footerBtnH, 12);

    const switchBtnText = scene.add.text(switchBtnX, footerY, '🔄 ĐỔI LINH THÚ', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#48cae4'
    }).setOrigin(0.5);

    const switchZone = scene.add.zone(switchBtnX, footerY, switchBtnW, footerBtnH).setInteractive({ useHandCursor: true });
    switchZone.on('pointerdown', () => {
      audio.playSelect();
      haptic.light();
      const curIdx = CompanionModal3D.ROSTER.findIndex(r => r.id === activeCompId);
      const nextIdx = (curIdx + 1) % totalComps;
      container.destroy();
      CompanionModal3D.open(scene, CompanionModal3D.ROSTER[nextIdx].id, onSelect);
    });

    // Right Button: [ ✔ ĐANG ĐỒNG HÀNH ] or [ ⚡ CHỌN ĐỒNG HÀNH ]
    const currentEquippedId = save.getSelectedCompanion();
    const isEquipped = currentEquippedId === activeCompId;

    const equipBtnW = rightW - switchBtnW - 14; // ~ 406
    const equipBtnX = colRight - equipBtnW / 2;
    const equipBtnGfx = scene.add.graphics();

    let equipBgColor = 0x2a9d8f;
    let equipBorderColor = 0x52b788;
    let equipLabelStr = '';
    let equipTextColor = '#ffffff';

    if (isEquipped) {
      equipBgColor = 0x198754;
      equipBorderColor = 0x52b788;
      equipLabelStr = '✔ ĐANG ĐỒNG HÀNH';
      equipTextColor = '#ffffff';
    } else if (isUnlocked) {
      equipBgColor = 0xd4af37;
      equipBorderColor = 0xffe57f;
      equipLabelStr = '⚡ CHỌN ĐỒNG HÀNH';
      equipTextColor = '#1a1a2e';
    } else if (summonCheck.canSummon) {
      equipBgColor = 0xff9f1c;
      equipBorderColor = 0xffd700;
      if (currentShards >= 20) {
        equipLabelStr = `✨ TRIỆU HỒI (${currentShards}/20)`;
      } else {
        equipLabelStr = `✨ TRIỆU HỒI (${currentShards}+${20 - currentShards}🔮/20)`;
      }
      equipTextColor = '#ffffff';
    } else {
      equipBgColor = 0x2b2d42;
      equipBorderColor = 0x4a4e69;
      const uniShards = save.getUniversalShards();
      if (uniShards > 0) {
        equipLabelStr = `🔒 CẦN 20 MẢNH (${currentShards}+${uniShards}🔮/20)`;
      } else {
        equipLabelStr = `🔒 CẦN 20 MẢNH (${currentShards}/20)`;
      }
      equipTextColor = '#adb5bd';
    }

    equipBtnGfx.fillStyle(equipBgColor, 0.95);
    equipBtnGfx.fillRoundedRect(equipBtnX - equipBtnW / 2, footerY - footerBtnH / 2, equipBtnW, footerBtnH, 12);
    equipBtnGfx.lineStyle(1.8, equipBorderColor, 1);
    equipBtnGfx.strokeRoundedRect(equipBtnX - equipBtnW / 2, footerY - footerBtnH / 2, equipBtnW, footerBtnH, 12);

    const equipText = scene.add.text(equipBtnX, footerY, equipLabelStr, {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: equipTextColor
    }).setOrigin(0.5);

    const equipZone = scene.add.zone(equipBtnX, footerY, equipBtnW, footerBtnH).setInteractive({ useHandCursor: true });
    equipZone.on('pointerdown', () => {
      if (isEquipped) {
        closeModal();
      } else if (isUnlocked) {
        save.setSelectedCompanion(activeCompId);
        audio.playVictory();
        haptic.medium();
        if (onSelect) onSelect(activeConfig);
        closeModal();
      } else if (summonCheck.canSummon) {
        const uniBefore = save.getUniversalShards();
        const summonRes = save.summonCompanion(activeCompId);
        if (summonRes.success) {
          save.setSelectedCompanion(activeCompId);
          audio.playVictory();
          haptic.success();
          const uniUsed = uniBefore - save.getUniversalShards();
          if ((scene as any).showNotice) {
            const extraMsg = uniUsed > 0 ? ` (Dùng ${uniUsed} 🔮 Linh Thạch Vạn Năng)` : '';
            (scene as any).showNotice(`🎉 ĐÃ TRIỆU HỒI THÀNH CÔNG ${activeConfig.name.toUpperCase()}!${extraMsg}`, 0xffd700);
          }
          container.destroy();
          CompanionModal3D.open(scene, activeCompId, onSelect);
        }
      } else {
        audio.playError();
        haptic.warning();
        if ((scene as any).showNotice) {
          const uniShards = save.getUniversalShards();
          (scene as any).showNotice(
            `❌ Cần đủ 20 Mảnh để Triệu Hồi ${activeConfig.name}! (Hiện có: ${currentShards} Mảnh${uniShards > 0 ? ` + ${uniShards} Linh Thạch 🔮` : ''})`,
            0xff4d6d
          );
        }
      }
    });

    container.add([switchBtnGfx, switchBtnText, switchZone, equipBtnGfx, equipText, equipZone]);

    // Unregister pointermove handler on container destroy
    container.once('destroy', () => {
      scene.input.off('pointermove', onPointerMove);
    });

    return container;
  }

  public static openSkillPreview(
    scene: Phaser.Scene,
    companionId: string,
    skillName: string,
    skillDesc: string,
    skillType: 'active' | 'passive' | 'counter' = 'active'
  ): void {
    const audio = AudioSystem.getInstance();
    const save = SaveSystem.getInstance();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const compConfig = CompanionManager.get(companionId);
    const currentTier = save.getCompanionTier(companionId);

    const previewModal = scene.add.container(width / 2, height / 2).setDepth(600);
    previewModal.setScale(0.9);
    previewModal.setAlpha(0);
    scene.tweens.add({
      targets: previewModal,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    const closePreview = () => {
      audio.playSelect();
      scene.tweens.add({
        targets: previewModal,
        scale: 0.9,
        alpha: 0,
        duration: 150,
        ease: 'Cubic.easeIn',
        onComplete: () => previewModal.destroy()
      });
    };

    // Dark backdrop
    const bg = scene.add.graphics();
    bg.fillStyle(0x060814, 0.90);
    bg.fillRect(-screenW / 2, -height / 2, screenW, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', closePreview);
    previewModal.add(bg);

    // Card frame
    const pW = 560;
    const pH = 520;
    const pGfx = scene.add.graphics();
    pGfx.fillStyle(0x0a0c18, 0.98);
    pGfx.fillRoundedRect(-pW / 2, -pH / 2, pW, pH, 18);
    const borderColor = skillType === 'counter'
      ? 0xf59e0b
      : (skillType === 'passive' ? 0x00b4d8 : 0xff3855);
    pGfx.lineStyle(2, borderColor, 0.95);
    pGfx.strokeRoundedRect(-pW / 2, -pH / 2, pW, pH, 18);
    pGfx.lineStyle(1.2, 0xffd700, 0.8);
    pGfx.strokeRoundedRect(-pW / 2 + 5, -pH / 2 + 5, pW - 10, pH - 10, 14);
    previewModal.add(pGfx);

    // Header title & Type Badge
    const headerTitle = skillType === 'counter'
      ? `🛡️ TIẾN HÓA KHẮC CHẾ • ${compConfig.name.toUpperCase()}`
      : (skillType === 'passive'
        ? `✨ GIA HỘ NỘI TẠI 3 BẬC • ${compConfig.name.toUpperCase()}`
        : `⚡ TIẾN HÓA TUYỆT KỸ • ${compConfig.name.toUpperCase()}`);
    const headerColor = skillType === 'counter'
      ? '#fbbf24'
      : (skillType === 'passive' ? '#38bdf8' : '#ffd700');

    // Header row
    const headerY = -pH / 2 + 28;
    const headerTxt = scene.add.text(-pW / 2 + 24, headerY - 7, headerTitle, {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: headerColor
    }).setOrigin(0, 0.5);

    const subHeaderTxt = scene.add.text(-pW / 2 + 24, headerY + 13, `Hệ: ${compConfig.elementLabel} • ${compConfig.title} • ${compConfig.roleDescription}`, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      color: '#94a3b8'
    }).setOrigin(0, 0.5);

    // Close button
    const closeBtn = scene.add.text(pW / 2 - 24, headerY, '✕', {
      fontFamily: FONT_UI,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ff3855'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', closePreview);
    previewModal.add([headerTxt, subHeaderTxt, closeBtn]);

    // 3 Tier Progression Cards
    const tierCardW = pW - 40; // 520
    const tierCardH = 100;
    const startY = headerY + 36; // ~ -196
    const tierGaps = 14;

    for (let t = 1; t <= 3; t++) {
      const tInfo = CompanionManager.getTierInfo(companionId, t);
      const isCurrent = t === currentTier;
      const isUnlocked = t <= currentTier;
      const tRoman = t === 1 ? 'I' : (t === 2 ? 'II' : 'III');
      const cardY = startY + (t - 1) * (tierCardH + tierGaps) + tierCardH / 2;
      const cardTop = cardY - tierCardH / 2;

      // Card Background
      const tcGfx = scene.add.graphics();
      if (isCurrent) {
        tcGfx.fillStyle(skillType === 'counter' ? 0x221a08 : (skillType === 'passive' ? 0x091e33 : 0x250d18), 0.98);
        tcGfx.fillRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
        tcGfx.lineStyle(2, 0xffd700, 0.95);
        tcGfx.strokeRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
        tcGfx.lineStyle(1.2, borderColor, 0.7);
        tcGfx.strokeRoundedRect(-tierCardW / 2 + 3, cardTop + 3, tierCardW - 6, tierCardH - 6, 9);
      } else if (isUnlocked) {
        tcGfx.fillStyle(0x0c1624, 0.95);
        tcGfx.fillRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
        tcGfx.lineStyle(1.4, 0x10b981, 0.85);
        tcGfx.strokeRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
      } else {
        tcGfx.fillStyle(0x0c0f1a, 0.88);
        tcGfx.fillRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
        tcGfx.lineStyle(1.2, 0x273048, 0.75);
        tcGfx.strokeRoundedRect(-tierCardW / 2, cardTop, tierCardW, tierCardH, 12);
      }
      previewModal.add(tcGfx);

      // Line 1: Tier Name & Level Range + Status Badge
      const tTitleColor = t === 1 ? '#a7f3d0' : (t === 2 ? '#fde047' : '#fca5a5');
      const tLabel = t === 1
        ? '🟢 BẬC I: ẤU THÚ (CẤP 1 - 10)'
        : (t === 2 ? '🟡 BẬC II: TRƯỞNG THÀNH (CẤP 11 - 20)' : '🔴 BẬC III: THẦN LINH THỨC TỈNH (CẤP 21 - 30)');
      
      const tLabelTxt = scene.add.text(-tierCardW / 2 + 16, cardTop + 14, tLabel, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: tTitleColor
      }).setOrigin(0, 0.5);

      // Status Pill on top right of card
      let badgeStr = '';
      let badgeBg = 0x1e293b;
      let badgeStroke = 0x475569;
      let badgeColor = '#94a3b8';

      if (isCurrent) {
        badgeStr = `✨ HIỆN TẠI (BẬC ${tRoman})`;
        badgeBg = 0x451a03;
        badgeStroke = 0xf59e0b;
        badgeColor = '#fbbf24';
      } else if (isUnlocked) {
        badgeStr = '✔ ĐÃ MỞ KHÓA';
        badgeBg = 0x064e3b;
        badgeStroke = 0x10b981;
        badgeColor = '#34d399';
      } else {
        badgeStr = `🔒 CẦN ${t === 2 ? '50' : '100'} MẢNH`;
        badgeBg = 0x1f1418;
        badgeStroke = 0xe11d48;
        badgeColor = '#f87171';
      }

      const bW = Math.max(96, badgeStr.length * 7.2 + 20);
      const bH = 20;
      const bX = tierCardW / 2 - 14 - bW / 2;
      const bY = cardTop + 14;

      const bGfx = scene.add.graphics();
      bGfx.fillStyle(badgeBg, 0.95);
      bGfx.fillRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 6);
      bGfx.lineStyle(1.2, badgeStroke, 0.95);
      bGfx.strokeRoundedRect(bX - bW / 2, bY - bH / 2, bW, bH, 6);

      const bTxt = scene.add.text(bX, bY, badgeStr, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: badgeColor
      }).setOrigin(0.5);

      // Line 2: Name
      let tSkillName = '';
      let tSkillDesc = '';

      if (skillType === 'active') {
        tSkillName = tInfo.skillName.toUpperCase();
        tSkillDesc = tInfo.skillDesc;
      } else if (skillType === 'passive') {
        tSkillName = (compConfig.passiveName || 'GIA HỘ NỘI TẠI').toUpperCase();
        if (t === 1) {
          tSkillDesc = compConfig.levels?.[0]?.passiveDesc || compConfig.passiveDesc || '';
        } else if (t === 2) {
          tSkillDesc = compConfig.levels?.[2]?.passiveDesc || 'Mở rộng thời gian duy trì combo +1.6s, tăng tốc tích Nộ & thưởng Xu.';
        } else {
          tSkillDesc = compConfig.levels?.[4]?.passiveDesc || 'Thần Linh Thức Tỉnh: Tăng tối đa thời gian duy trì +2.0s và khóa nhịp rơi.';
        }
      } else {
        const parts = tInfo.bossCounterDesc.split(':');
        tSkillName = (parts[0] || 'CƠ CHẾ BOSS').replace(/^Khắc chế\s*:\s*/i, '').trim().toUpperCase();
        tSkillDesc = (parts[1] || tInfo.bossCounterDesc).trim();
      }

      const sNameTxt = scene.add.text(-tierCardW / 2 + 16, cardTop + 33, tSkillName, {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '900',
        color: isCurrent ? '#ffffff' : (isUnlocked ? '#e2e8f0' : '#94a3b8')
      }).setOrigin(0, 0.5);

      // Line 3 & 4: Skill Description
      const sDescTxt = scene.add.text(-tierCardW / 2 + 16, cardTop + 48, tSkillDesc, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        color: isCurrent ? '#ffffff' : (isUnlocked ? '#cbd5e1' : '#64748b'),
        lineSpacing: 3,
        wordWrap: { width: tierCardW - 32 }
      }).setOrigin(0, 0);

      previewModal.add([tLabelTxt, bGfx, bTxt, sNameTxt, sDescTxt]);

      // Downward Connecting Arrow between cards
      if (t < 3) {
        const arrowY = cardTop + tierCardH + tierGaps / 2;
        const arrowTxt = scene.add.text(0, arrowY, '▼', {
          fontFamily: FONT_UI,
          fontSize: '11px',
          color: t < currentTier ? '#10b981' : (t === currentTier ? '#ffd700' : '#475569')
        }).setOrigin(0.5);
        previewModal.add(arrowTxt);
      }
    }

    // Close button at bottom
    const okBtn = scene.add.container(0, pH / 2 - 26);
    const okGfx = scene.add.graphics();
    okGfx.fillStyle(0xd90429, 0.95);
    okGfx.fillRoundedRect(-70, -16, 140, 32, 8);
    okGfx.lineStyle(1.4, 0xffd700, 0.85);
    okGfx.strokeRoundedRect(-70, -16, 140, 32, 8);
    const okTxt = scene.add.text(0, 0, 'ĐÃ HIỂU', {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    okBtn.add([okGfx, okTxt]);
    okBtn.setSize(140, 32).setInteractive({ useHandCursor: true });
    okBtn.on('pointerdown', closePreview);
    previewModal.add(okBtn);
  }
}
