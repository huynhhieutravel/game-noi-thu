import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { CompanionManager } from './CompanionManager';
import { CompanionConfig } from '../types';
import { TextureGenerator } from './TextureGenerator';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { CompanionModal3D } from './CompanionModal3D';

export class CompanionModal {
  private static readonly CARDS_PER_PAGE = 3;

  public static open(
    scene: Phaser.Scene,
    onSelect: (companion: CompanionConfig) => void
  ): Phaser.GameObjects.Container {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const save = SaveSystem.getInstance();
    const audio = AudioSystem.getInstance();
    const currentId = save.getSelectedCompanion();

    const container = scene.add.container(width / 2, height / 2).setDepth(300);

    // Initial scale animation
    container.setScale(0.9);
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
        duration: 160,
        ease: 'Cubic.easeIn',
        onComplete: () => container.destroy()
      });
    };

    // 1. Dark Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.88);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', closeModal);

    // 2. Main Dialog Frame
    const frameW = 870;
    const frameH = 506;
    const frame = scene.add.graphics();
    frame.fillStyle(0x111322, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);
    frame.lineStyle(2, 0xffd700, 0.85);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // 3. Header
    const title = scene.add.text(0, -frameH / 2 + 32, '⛩️ THẬP ĐẠI LINH THÚ • KỸ NĂNG & TIẾN HÓA', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '21px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const subTitle = scene.add.text(
      0,
      -frameH / 2 + 58,
      'Thu thập Mảnh Linh Thú & Xu Vàng để thức tỉnh sức mạnh từ Cấp 1 lên Cấp 5 Thần Linh!',
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '14px',
        color: '#ced4da'
      }
    ).setOrigin(0.5);

    // Coins Badge (Top-Right)
    const coinsBadge = scene.add.text(frameW / 2 - 100, -frameH / 2 + 30, `💰 ${save.getCoins()} XU`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Close button (✖)
    const closeBtn = scene.add.text(frameW / 2 - 32, -frameH / 2 + 28, '✖', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', closeModal);
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff4d6d'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#adb5bd'));

    container.add([backdrop, frame, title, subTitle, coinsBadge, closeBtn]);

    // 4. Companion Cards Setup
    const allCompanions = CompanionManager.getAll();
    const totalCompanions = allCompanions.length;
    const totalPages = Math.ceil(totalCompanions / CompanionModal.CARDS_PER_PAGE);

    // Find initial page of current selected companion
    let currentPage = 0;
    const currentIdx = allCompanions.findIndex((c) => c.id === currentId);
    if (currentIdx >= 0) {
      currentPage = Math.floor(currentIdx / CompanionModal.CARDS_PER_PAGE);
    }

    const cardsLayer = scene.add.container(0, 0);
    container.add(cardsLayer);

    // Bottom Navigation Layer
    const navLayer = scene.add.container(0, 0);
    container.add(navLayer);

    const renderPage = (page: number) => {
      currentPage = page;
      cardsLayer.removeAll(true);
      navLayer.removeAll(true);

      const startIndex = page * CompanionModal.CARDS_PER_PAGE;
      const pageCompanions = allCompanions.slice(startIndex, startIndex + CompanionModal.CARDS_PER_PAGE);

      const cardW = 252;
      const cardH = 376;
      const cardSpacing = 272;
      const count = pageCompanions.length;
      const startX = -((count - 1) * cardSpacing) / 2;
      const cardY = 32;

      pageCompanions.forEach((comp, idx) => {
        const cardX = startX + idx * cardSpacing;
        const isSelected = comp.id === save.getSelectedCompanion();
        const isUnlocked = save.isCompanionUnlocked(comp.id);
        const compTier = save.getCompanionTier(comp.id);
        const compLevel = save.getCompanionLevel(comp.id);
        const compShards = save.getCompanionShards(comp.id);
        const maxLevel = save.getMaxLevelForTier(compTier);
        const tierInfo = CompanionManager.getTierInfo(comp.id, compTier);
        const isMaxTierMaxLevel = compTier >= 3 && compLevel >= 30;
        const isReadyForEvolution = compLevel >= maxLevel && compTier < 3;
        const lvlCheck = save.canLevelUpCompanion(comp.id);
        const evoCheck = save.canEvolveCompanion(comp.id);

        const cardContainer = scene.add.container(cardX, cardY);

        // Card Background
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(isSelected ? 0x232042 : 0x16172a, 1);
        cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
        cardBg.lineStyle(isSelected ? 2.5 : 1.2, isSelected ? comp.themeColor : 0x3d3860, 1);
        cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);

        // Header Pill: Element & Level
        const pillW = cardW - 24;
        const pillH = 22;
        const pillY = -cardH / 2 + 18;
        const headerPill = scene.add.graphics();
        headerPill.fillStyle(comp.isApexSSR ? 0x4a1236 : 0x0f1124, 0.95);
        headerPill.fillRoundedRect(-pillW / 2, pillY - pillH / 2, pillW, pillH, 6);
        headerPill.lineStyle(1, comp.themeColor, 0.7);
        headerPill.strokeRoundedRect(-pillW / 2, pillY - pillH / 2, pillW, pillH, 6);

        const levelLabel = isMaxTierMaxLevel ? '👑 CỰC PHẨM (MAX 30)' : `${tierInfo.badge} • CẤP ${compLevel}/${maxLevel}`;
        const pillText = scene.add.text(
          0,
          pillY,
          levelLabel,
          {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '11px',
            fontStyle: '900',
            color: comp.isApexSSR ? '#ffd700' : '#e0e1dd'
          }
        ).setOrigin(0.5);

        // Avatar Halo & Portrait
        const halo = scene.add.graphics();
        halo.fillStyle(comp.themeColor, isUnlocked ? 0.16 : 0.05);
        halo.fillCircle(0, -96, 44);
        halo.lineStyle(1.8, comp.themeColor, isUnlocked ? 0.85 : 0.35);
        halo.strokeCircle(0, -96, 48);

        let avatar: Phaser.GameObjects.GameObject;
        TextureGenerator.ensureCharacterTexture(scene, comp.id);
        const texKey = `char_${comp.id}`;
        if (scene.textures.exists(texKey)) {
          avatar = scene.add.image(0, -96, texKey).setDisplaySize(88, 88);
          if (!isUnlocked) (avatar as Phaser.GameObjects.Image).setTint(0x666666);
        } else {
          avatar = scene.add.text(0, -96, comp.icon, { fontSize: '48px' }).setOrigin(0.5);
        }

        // 3D / Detail inspect button
        const btn3DW = 104;
        const btn3DH = 20;
        const btn3DY = -142;
        const b3d = scene.add.graphics();
        b3d.fillStyle(0x0e1329, 0.95);
        b3d.fillRoundedRect(-btn3DW / 2, btn3DY - btn3DH / 2, btn3DW, btn3DH, 6);
        b3d.lineStyle(1, 0xffd700, 0.85);
        b3d.strokeRoundedRect(-btn3DW / 2, btn3DY - btn3DH / 2, btn3DW, btn3DH, 6);

        const b3dTxt = scene.add.text(0, btn3DY, '👁️ CHI TIẾT 3D', {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '12px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);

        const b3dHit = scene.add.zone(0, btn3DY, btn3DW, btn3DH).setInteractive({ useHandCursor: true });
        b3dHit.on('pointerdown', () => {
          container.destroy();
          CompanionModal3D.open(scene, comp.id, onSelect);
        });

        // Name & Title
        const nameText = scene.add.text(0, -42, `${comp.icon} ${comp.name}`, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '18px',
          fontStyle: '900',
          color: isUnlocked ? '#ffffff' : '#94a3b8'
        }).setOrigin(0.5);

        const titleText = scene.add.text(0, -22, `[ ${comp.title} ]`, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '13.5px',
          fontStyle: '800',
          color: `#${comp.themeColor.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);

        // Shard Progress Bar
        const shardBarY = -4;
        const shardBarW = cardW - 36;
        const shardBarH = 12;
        const shardBg = scene.add.graphics();
        shardBg.fillStyle(0x0e111d, 0.95);
        shardBg.fillRoundedRect(-shardBarW / 2, shardBarY - shardBarH / 2, shardBarW, shardBarH, 5);
        shardBg.lineStyle(1, 0x3d405b, 0.8);
        shardBg.strokeRoundedRect(-shardBarW / 2, shardBarY - shardBarH / 2, shardBarW, shardBarH, 5);

        const neededShards = isReadyForEvolution ? evoCheck.requiredShards : (isMaxTierMaxLevel ? 100 : (compTier === 1 ? 50 : 100));
        const shardFraction = isMaxTierMaxLevel ? 1 : Math.min(1, compShards / neededShards);
        if (shardFraction > 0) {
          shardBg.fillStyle(isMaxTierMaxLevel ? 0xffd700 : (isReadyForEvolution ? 0xff4d6d : 0x00f5d4), 0.9);
          shardBg.fillRoundedRect(-shardBarW / 2, shardBarY - shardBarH / 2, shardBarW * shardFraction, shardBarH, 5);
        }

        const shardTextLabel = isMaxTierMaxLevel
          ? `MẢNH: ${compShards} (ĐÃ THỨC TỈNH MAX)`
          : (isReadyForEvolution
              ? `MẢNH: ${compShards} / ${neededShards} (SẴN SÀNG ĐỘT PHÁ)`
              : `MẢNH: ${compShards} / ${neededShards} (TIẾN HÓA)`);
        const shardText = scene.add.text(0, shardBarY, shardTextLabel, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '11px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);

        // Active Skill Box
        const skillBox = scene.add.graphics();
        const skillBoxY = 12;
        const skillBoxH = 78;
        skillBox.fillStyle(0x0d0e1b, 0.92);
        skillBox.fillRoundedRect(-cardW / 2 + 12, skillBoxY, cardW - 24, skillBoxH, 10);
        skillBox.lineStyle(1, 0x30354e, 0.8);
        skillBox.strokeRoundedRect(-cardW / 2 + 12, skillBoxY, cardW - 24, skillBoxH, 10);

        const skillName = scene.add.text(0, skillBoxY + 14, `⚡ ${tierInfo.skillName}`, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '13.5px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);

        const skillDesc = scene.add.text(0, skillBoxY + 44, tierInfo.skillDesc, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '11.5px',
          color: '#ced4da',
          wordWrap: { width: cardW - 32 },
          align: 'center',
          lineSpacing: 1.5
        }).setOrigin(0.5);

        // Action Buttons Row: [NÂNG CẤP] & [CHỌN/MỞ KHÓA]
        const btnW = cardW - 28;
        const btnH = 34;
        const btnY = 112;

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
          fontSize: '14.5px',
          fontStyle: '900',
          color: btnTextColor
        }).setOrigin(0.5);

        const hitZone = scene.add.zone(0, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
        hitZone.on('pointerdown', () => {
          if (isSelected) {
            closeModal();
            return;
          }

          if (isUnlocked) {
            save.setSelectedCompanion(comp.id);
            audio.playVictory();
            onSelect(comp);
            closeModal();
          } else {
            if (save.getCoins() >= comp.cost) {
              save.spendCoins(comp.cost);
              save.unlockCompanion(comp.id);
              save.setSelectedCompanion(comp.id);
              audio.playVictory();
              if ((scene as any).showNotice) {
                (scene as any).showNotice(`🎉 ĐÃ MỞ KHÓA ${comp.name.toUpperCase()}!`, 0xffd700);
              }
              onSelect(comp);
              closeModal();
            } else {
              audio.playError();
              if ((scene as any).showNotice) {
                (scene as any).showNotice(`❌ Chưa đủ Xu! Cần ${comp.cost} Xu để mở khóa!`, 0xff4d6d);
              }
            }
          }
        });

        // Upgrade / Evolution Button Row
        const upgY = 154;
        const upgW = cardW - 28;
        const upgH = 28;
        const upgBg = scene.add.graphics();
        let upgLabel = '';
        let upgColor = '#ffffff';
        let isActionActive = false;

        if (isMaxTierMaxLevel) {
          upgBg.fillStyle(0x192036, 0.85);
          upgLabel = '👑 CỰC PHẨM THẦN LINH (MAX)';
          upgColor = '#ffd700';
        } else if (isReadyForEvolution) {
          isActionActive = evoCheck.canEvolve;
          upgBg.fillStyle(isActionActive ? 0xd90429 : 0x131525, 0.95);
          upgBg.lineStyle(1.5, isActionActive ? 0xffd700 : 0x3d405b, 0.9);
          upgBg.strokeRoundedRect(-upgW / 2, upgY - upgH / 2, upgW, upgH, 8);
          upgLabel = isActionActive
            ? `🔥 ĐỘT PHÁ TIẾN HÓA BẬC ${compTier + 1}`
            : `🔒 CẦN ${evoCheck.requiredShards} MẢNH + ${evoCheck.requiredCoins} XU`;
          upgColor = isActionActive ? '#ffffff' : '#adb5bd';
        } else {
          isActionActive = lvlCheck.canLevelUp;
          upgBg.fillStyle(isActionActive ? 0x7209b7 : 0x131525, 0.95);
          upgBg.lineStyle(1.5, isActionActive ? 0xffd700 : 0x3d405b, 0.9);
          upgBg.strokeRoundedRect(-upgW / 2, upgY - upgH / 2, upgW, upgH, 8);
          upgLabel = isActionActive
            ? `⚡ LÊN CẤP ${compLevel + 1} (${lvlCheck.requiredCoins} XU)`
            : `🔒 CẦN ${lvlCheck.requiredCoins} XU ĐỂ LÊN CẤP`;
          upgColor = isActionActive ? '#ffffff' : '#adb5bd';
        }
        upgBg.fillRoundedRect(-upgW / 2, upgY - upgH / 2, upgW, upgH, 8);

        const upgText = scene.add.text(0, upgY, upgLabel, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '10.5px',
          fontStyle: '900',
          color: upgColor
        }).setOrigin(0.5);

        if (!isMaxTierMaxLevel) {
          const upgHit = scene.add.zone(0, upgY, upgW, upgH).setInteractive({ useHandCursor: true });
          upgHit.on('pointerdown', () => {
            if (isReadyForEvolution) {
              if (evoCheck.canEvolve) {
                const res = save.evolveCompanion(comp.id);
                if (res.success) {
                  audio.playVictory();
                  const nextT = CompanionManager.getTierInfo(comp.id, res.newTier);
                  if ((scene as any).showNotice) {
                    (scene as any).showNotice(
                      `🎉 ${comp.name.toUpperCase()} ĐÃ ĐỘT PHÁ LÊN BẬC ${res.newTier} (${nextT.tierName})! 🚀`,
                      0xffd700
                    );
                  }
                  coinsBadge.setText(`💰 ${save.getCoins()} XU`);
                  renderPage(currentPage);
                }
              } else {
                audio.playError();
                if ((scene as any).showNotice) {
                  (scene as any).showNotice(`⚠️ ${evoCheck.reason}`, 0xff4d6d);
                }
              }
            } else {
              if (lvlCheck.canLevelUp) {
                const res = save.levelUpCompanion(comp.id);
                if (res.success) {
                  audio.playVictory();
                  if ((scene as any).showNotice) {
                    (scene as any).showNotice(
                      `✨ ${comp.name.toUpperCase()} ĐÃ LÊN CẤP ${res.newLevel}! (+1% Vàng, +0.5% Nộ, +0.1s Combo) 🎉`,
                      0xffd700
                    );
                  }
                  coinsBadge.setText(`💰 ${save.getCoins()} XU`);
                  renderPage(currentPage);
                }
              } else {
                audio.playError();
                if ((scene as any).showNotice) {
                  (scene as any).showNotice(`⚠️ ${lvlCheck.reason}`, 0xff4d6d);
                }
              }
            }
          });
          cardContainer.add(upgHit);
        }

        cardContainer.add([
          cardBg,
          headerPill,
          pillText,
          halo,
          avatar,
          b3d,
          b3dTxt,
          b3dHit,
          nameText,
          titleText,
          shardBg,
          shardText,
          skillBox,
          skillName,
          skillDesc,
          btnBg,
          btnText,
          hitZone,
          upgBg,
          upgText
        ]);

        cardsLayer.add(cardContainer);
      });

      // 5. Render Navigation Controls (Bottom)
      const navY = frameH / 2 - 28;

      // Prev Button
      if (page > 0) {
        const prevW = 96;
        const prevH = 30;
        const prevBg = scene.add.graphics();
        prevBg.fillStyle(0x1e2038, 0.95);
        prevBg.fillRoundedRect(-frameW / 2 + 70 - prevW / 2, navY - prevH / 2, prevW, prevH, 8);
        prevBg.lineStyle(1.5, 0xffd700, 0.8);
        prevBg.strokeRoundedRect(-frameW / 2 + 70 - prevW / 2, navY - prevH / 2, prevW, prevH, 8);

        const prevTxt = scene.add.text(-frameW / 2 + 70, navY, '◀ TRƯỚC', {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '12px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);

        const prevHit = scene.add.zone(-frameW / 2 + 70, navY, prevW, prevH).setInteractive({ useHandCursor: true });
        prevHit.on('pointerdown', () => {
          audio.playSelect();
          renderPage(page - 1);
        });

        navLayer.add([prevBg, prevTxt, prevHit]);
      }

      // Next Button
      if (page < totalPages - 1) {
        const nextW = 96;
        const nextH = 30;
        const nextBg = scene.add.graphics();
        nextBg.fillStyle(0x1e2038, 0.95);
        nextBg.fillRoundedRect(frameW / 2 - 70 - nextW / 2, navY - nextH / 2, nextW, nextH, 8);
        nextBg.lineStyle(1.5, 0xffd700, 0.8);
        nextBg.strokeRoundedRect(frameW / 2 - 70 - nextW / 2, navY - nextH / 2, nextW, nextH, 8);

        const nextTxt = scene.add.text(frameW / 2 - 70, navY, 'SAU ▶', {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '12px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);

        const nextHit = scene.add.zone(frameW / 2 - 70, navY, nextW, nextH).setInteractive({ useHandCursor: true });
        nextHit.on('pointerdown', () => {
          audio.playSelect();
          renderPage(page + 1);
        });

        navLayer.add([nextBg, nextTxt, nextHit]);
      }

      // Page Dots Indicator
      const dotSpacing = 22;
      const dotsStartX = -((totalPages - 1) * dotSpacing) / 2;
      for (let p = 0; p < totalPages; p++) {
        const dotX = dotsStartX + p * dotSpacing;
        const isCurrent = p === page;
        const dot = scene.add.graphics();
        dot.fillStyle(isCurrent ? 0xffd700 : 0x4a4e69, isCurrent ? 1 : 0.6);
        dot.fillCircle(dotX, navY, isCurrent ? 5.5 : 3.5);

        const dotZone = scene.add.zone(dotX, navY, 20, 20).setInteractive({ useHandCursor: true });
        dotZone.on('pointerdown', () => {
          if (p !== currentPage) {
            audio.playSelect();
            renderPage(p);
          }
        });

        navLayer.add([dot, dotZone]);
      }
    };

    renderPage(currentPage);

    return container;
  }
}
