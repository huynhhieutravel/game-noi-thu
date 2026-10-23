import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, getScreenDimensions } from '../constants';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';
import { AchievementRegistry } from './AchievementRegistry';
import { AchievementDefinition } from '../types';

export interface AchProgressInfo {
  current: number;
  target: number;
  percent: number;
  isMet: boolean;
  isClaimed: boolean;
  progressLabel: string;
}

export class AchievementModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static open(scene: Phaser.Scene, onClose?: () => void): Phaser.GameObjects.Container {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }

    const { width: screenW } = getScreenDimensions();
    const save = SaveSystem.getInstance();
    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();

    const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(450);
    this.activeModal = container;

    // 1. Dark Backdrop Overlay
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x04030a, 0.92);
    overlay.fillRect(-screenW / 2, -GAME_HEIGHT / 2, screenW, GAME_HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -GAME_HEIGHT / 2, screenW, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    container.add(overlay);

    const cardW = 1060;
    const cardH = 590;

    // 2. Main Lacquer Frame
    const card = scene.add.graphics();
    card.fillStyle(0x0a0c18, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // Ornate Imperial Gold Outer Border
    card.lineStyle(2.2, 0xd4af37, 0.95);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // Subtle Cyan Inner Line
    card.lineStyle(1.0, 0x00f5d4, 0.3);
    card.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, 16);

    // Decorative Gold Corner Brackets
    const drawCornerBracket = (bx: number, by: number, dirX: number, dirY: number) => {
      card.lineStyle(1.8, 0xffd700, 0.85);
      card.beginPath();
      card.moveTo(bx, by + dirY * 18);
      card.lineTo(bx, by);
      card.lineTo(bx + dirX * 18, by);
      card.strokePath();
    };
    drawCornerBracket(-cardW / 2 + 10, -cardH / 2 + 10, 1, 1);
    drawCornerBracket(cardW / 2 - 10, -cardH / 2 + 10, -1, 1);
    drawCornerBracket(-cardW / 2 + 10, cardH / 2 - 10, 1, -1);
    drawCornerBracket(cardW / 2 - 10, cardH / 2 - 10, -1, -1);
    container.add(card);

    const closeModal = () => {
      audio.playSelect();
      container.destroy();
      AchievementModal.activeModal = null;
      onClose?.();
    };
    overlay.on('pointerdown', closeModal);

    // Close button (Top-Right "✕")
    const closeBtn = scene.add.container(cardW / 2 - 28, -cardH / 2 + 30);
    const cBg = scene.add.graphics();
    cBg.fillStyle(0xd90429, 0.95);
    cBg.fillCircle(0, 0, 15);
    cBg.lineStyle(1.6, 0xffd700, 0.95);
    cBg.strokeCircle(0, 0, 15);
    const cTxt = scene.add.text(0, 0, '✕', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([cBg, cTxt]);
    closeBtn.setSize(30, 30).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', closeModal);
    closeBtn.on('pointerover', () => {
      cBg.clear();
      cBg.fillStyle(0xff2a5f, 1);
      cBg.fillCircle(0, 0, 16);
      cBg.lineStyle(2, 0xffe066, 1);
      cBg.strokeCircle(0, 0, 16);
    });
    closeBtn.on('pointerout', () => {
      cBg.clear();
      cBg.fillStyle(0xd90429, 0.95);
      cBg.fillCircle(0, 0, 15);
      cBg.lineStyle(1.6, 0xffd700, 0.95);
      cBg.strokeCircle(0, 0, 15);
    });
    container.add(closeBtn);

    // ==========================================
    // PROGRESS CALCULATION HELPER
    // ==========================================
    const getProgress = (ach: AchievementDefinition): AchProgressInfo => {
      const data = save.getData();
      const isClaimed = save.isAchievementUnlocked(ach.id);
      let current = 0;
      let target = 1;

      switch (ach.id) {
        case 'first_win':
          current = data.highestLevel > 1 ? 1 : 0;
          target = 1;
          break;
        case 'shrine_guardian_10':
          current = Math.min(Math.max(0, (data.highestLevel || 1) - 1), 10);
          target = 10;
          break;
        case 'stars_30':
          current = save.getStars();
          target = 30;
          break;
        case 'stars_100':
          current = save.getStars();
          target = 100;
          break;
        case 'stars_250':
          current = save.getStars();
          target = 250;
          break;
        case 'combo_5':
          current = isClaimed ? 5 : 0;
          target = 5;
          break;
        case 'combo_10':
          current = isClaimed ? 10 : 0;
          target = 10;
          break;
        case 'speed_demon':
          current = isClaimed ? 1 : 0;
          target = 1;
          break;
        case 'speed_god_sub30':
          current = isClaimed ? 1 : 0;
          target = 1;
          break;
        case 'first_boss':
          current = data.highestLevel > 10 ? 1 : 0;
          target = 1;
          break;
        case 'boss_slayer_5': {
          let bCount = 0;
          for (let b = 10; b <= 100; b += 10) {
            const lid = `level_${String(b).padStart(2, '0')}`;
            if (data.completedDifficulties?.[lid]?.easy || (data.levelStars?.[lid] || 0) > 0) {
              bCount++;
            }
          }
          current = bCount;
          target = 5;
          break;
        }
        case 'survival_wave_5':
          current = data.survivalMaxWaves || 0;
          target = 5;
          break;
        case 'survival_wave_10':
          current = data.survivalMaxWaves || 0;
          target = 10;
          break;
        case 'pet_master_50':
          current = Object.keys(data.discoveredCharacters || {}).length;
          target = 50;
          break;
        case 'companions_3':
          current = data.unlockedCompanions?.length || 1;
          target = 3;
          break;
        case 'companion_tier_2': {
          let maxTier = 1;
          for (const t of Object.values(data.companionTiers || {})) {
            if (typeof t === 'number' && t > maxTier) maxTier = t;
          }
          current = maxTier;
          target = 2;
          break;
        }
        case 'companion_tier_4': {
          let maxTier = 1;
          for (const t of Object.values(data.companionTiers || {})) {
            if (typeof t === 'number' && t > maxTier) maxTier = t;
          }
          current = maxTier;
          target = 4;
          break;
        }
        case 'relic_collector':
          current = Object.keys(data.relicsCollected || {}).length;
          target = 1;
          break;
        case 'zen_master_5000':
          current = data.zenHighScore || 0;
          target = 5000;
          break;
        case 'omikuji_streak_7':
          current = data.omikujiStreak || 0;
          target = 7;
          break;
        default:
          current = isClaimed ? 1 : 0;
          target = 1;
          break;
      }

      const isMet = isClaimed || current >= target;
      const percent = isClaimed ? 100 : Math.min(100, Math.floor((current / target) * 100));
      const progressLabel = isClaimed ? 'ĐÃ HOÀN THÀNH ✓' : `${current} / ${target} (${percent}%)`;

      return { current, target, percent, isMet, isClaimed, progressLabel };
    };

    // Sub-containers
    const headerContainer = scene.add.container(0, -cardH / 2 + 30);
    const filterContainer = scene.add.container(0, -cardH / 2 + 76);
    const cardsContainer = scene.add.container(0, 22);
    const footerContainer = scene.add.container(0, cardH / 2 - 28);
    container.add([headerContainer, filterContainer, cardsContainer, footerContainer]);

    // State
    let activeFilter: string = 'all';
    let currentPage = 1;
    const pageSize = 6; // 2 cols x 3 rows = 6 spacious cards per page

    // ==========================================
    // FLOATING REWARD FX
    // ==========================================
    const triggerRewardFX = (x: number, y: number, diamonds: number, shards?: number) => {
      let label = `+💎 ${diamonds}`;
      if (shards) label += `  +🔮 ${shards}`;

      const popTxt = scene.add.text(x, y - 20, label, {
        fontFamily: FONT_DISPLAY,
        fontSize: '18px',
        fontStyle: '900',
        color: '#ffd700',
        stroke: '#111425',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(500);
      container.add(popTxt);

      scene.tweens.add({
        targets: popTxt,
        y: y - 75,
        alpha: 0,
        scale: 1.25,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => popTxt.destroy()
      });
    };

    // ==========================================
    // RENDER HEADER
    // ==========================================
    const renderHeader = () => {
      headerContainer.removeAll(true);

      const allAchs = AchievementRegistry.getAll();
      let completedCount = 0;
      let totalClaimedDiamonds = 0;

      allAchs.forEach(ach => {
        const prog = getProgress(ach);
        if (prog.isClaimed) {
          completedCount++;
          totalClaimedDiamonds += ach.rewardDiamonds;
        }
      });

      const percentTotal = Math.round((completedCount / allAchs.length) * 100);

      // Emblem Box
      const emblemBox = scene.add.graphics();
      emblemBox.fillStyle(0x13172c, 0.95);
      emblemBox.fillRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      emblemBox.lineStyle(1.4, 0xd4af37, 0.95);
      emblemBox.strokeRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      const emblemIcon = scene.add.text(-cardW / 2 + 52, 0, '🏆', { fontSize: '20px' }).setOrigin(0.5);
      headerContainer.add([emblemBox, emblemIcon]);

      // Title & Subtitle
      const titleTxt = scene.add.text(-cardW / 2 + 82, -8, 'ĐIỆN THỜ THÀNH TỰU • HUY HIỆU DANH DỰ', {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const subTitleTxt = scene.add.text(
        -cardW / 2 + 82,
        14,
        'Chinh phục thử thách thần thoại, thăng cấp Danh hiệu & mở khóa Thần Thú Trấn Giới',
        {
          fontFamily: FONT_UI,
          fontSize: '11.5px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }
      ).setOrigin(0, 0.5);

      // Right Stats Badges
      const badgeW = 160;
      const badgeH = 30;
      const badge1X = cardW / 2 - 290;
      const badge2X = cardW / 2 - 110;

      // Progress Badge
      const b1Gfx = scene.add.graphics();
      b1Gfx.fillStyle(0x161c30, 0.95);
      b1Gfx.fillRoundedRect(badge1X - badgeW / 2, -badgeH / 2, badgeW, badgeH, 8);
      b1Gfx.lineStyle(1.2, 0x00f5d4, 0.85);
      b1Gfx.strokeRoundedRect(badge1X - badgeW / 2, -badgeH / 2, badgeW, badgeH, 8);
      const b1Txt = scene.add.text(badge1X, 0, `🏆 ${completedCount} / ${allAchs.length} (${percentTotal}%)`, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      // Diamonds Badge
      const b2Gfx = scene.add.graphics();
      b2Gfx.fillStyle(0x1e192a, 0.95);
      b2Gfx.fillRoundedRect(badge2X - badgeW / 2, -badgeH / 2, badgeW, badgeH, 8);
      b2Gfx.lineStyle(1.2, 0xffd700, 0.85);
      b2Gfx.strokeRoundedRect(badge2X - badgeW / 2, -badgeH / 2, badgeW, badgeH, 8);
      const b2Txt = scene.add.text(badge2X, 0, `💎 ${totalClaimedDiamonds} ĐÃ NHẬN`, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      headerContainer.add([titleTxt, subTitleTxt, b1Gfx, b1Txt, b2Gfx, b2Txt]);
    };

    // ==========================================
    // RENDER FILTER & EQUIPPED TITLE BAR
    // ==========================================
    const renderFilterBar = () => {
      filterContainer.removeAll(true);

      const allAchs = AchievementRegistry.getAll();
      const claimableCount = allAchs.filter(a => {
        const p = getProgress(a);
        return p.isMet && !p.isClaimed;
      }).length;

      // Left: Player Equipped Title Showcase
      const currentTitle = save.getSelectedTitle();
      const titleBoxW = 280;
      const titleBoxH = 34;
      const titleBoxX = -cardW / 2 + 24 + titleBoxW / 2;

      const tBg = scene.add.graphics();
      tBg.fillStyle(0x15162c, 0.95);
      tBg.fillRoundedRect(-titleBoxW / 2, -titleBoxH / 2, titleBoxW, titleBoxH, 8);
      tBg.lineStyle(1.2, 0xd4af37, 0.7);
      tBg.strokeRoundedRect(-titleBoxW / 2, -titleBoxH / 2, titleBoxW, titleBoxH, 8);

      const tTxt = scene.add.text(0, 0, `🎖️ DANH HIỆU: ${currentTitle.toUpperCase()}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      const titleContainer = scene.add.container(titleBoxX, 0);
      titleContainer.add([tBg, tTxt]);
      filterContainer.add(titleContainer);

      // Right: 6 Filter Tabs
      const tabs = [
        { id: 'all', label: '🌟 TẤT CẢ' },
        { id: 'progression', label: '⛩️ CHIẾN DỊCH' },
        { id: 'battle', label: '⚡ CHIẾN ĐẤU' },
        { id: 'combo', label: '🔥 COMBO' },
        { id: 'collection', label: '🦊 BỘ SƯU TẬP' },
        { id: 'claimable', label: `🎁 NHẬN (${claimableCount})` }
      ];

      const tabW = 118;
      const tabH = 34;
      const tabSpacing = 8;
      const tabsStartX = cardW / 2 - 24 - (tabs.length * (tabW + tabSpacing) - tabSpacing) + tabW / 2;

      tabs.forEach((tab, idx) => {
        const tabX = tabsStartX + idx * (tabW + tabSpacing);
        const isActive = activeFilter === tab.id;

        const tabBtn = scene.add.container(tabX, 0);
        const bg = scene.add.graphics();

        if (tab.id === 'claimable' && claimableCount > 0) {
          bg.fillStyle(isActive ? 0x2e1a3b : 0x1d1428, 0.95);
          bg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          bg.lineStyle(1.4, 0xff007f, 0.95);
          bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        } else {
          bg.fillStyle(isActive ? 0x221c3b : 0x111425, 0.95);
          bg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          bg.lineStyle(1.4, isActive ? 0x00f5d4 : 0x2e3558, isActive ? 0.95 : 0.6);
          bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        }

        const txt = scene.add.text(0, 0, tab.label, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: '900',
          color: isActive ? '#00f5d4' : (tab.id === 'claimable' && claimableCount > 0 ? '#ff758f' : '#94a3b8')
        }).setOrigin(0.5);

        tabBtn.add([bg, txt]);
        tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
        tabBtn.on('pointerdown', () => {
          if (activeFilter !== tab.id) {
            audio.playSelect();
            haptic.light();
            activeFilter = tab.id;
            currentPage = 1;
            renderFilterBar();
            renderContent();
            renderFooter();
          }
        });

        filterContainer.add(tabBtn);
      });
    };

    // ==========================================
    // RENDER ACHIEVEMENT CARDS
    // ==========================================
    const renderContent = () => {
      cardsContainer.removeAll(true);

      const allAchs = AchievementRegistry.getAll();
      let filtered = allAchs;

      if (activeFilter === 'claimable') {
        filtered = allAchs.filter(a => {
          const p = getProgress(a);
          return p.isMet && !p.isClaimed;
        });
      } else if (activeFilter !== 'all') {
        filtered = allAchs.filter(a => a.category === activeFilter);
      }

      if (filtered.length === 0) {
        const emptyTxt = scene.add.text(0, 0, '✨ Không có thành tựu nào trong danh mục này.', {
          fontFamily: FONT_UI,
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }).setOrigin(0.5);
        cardsContainer.add(emptyTxt);
        return;
      }

      const totalPages = Math.ceil(filtered.length / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const startIndex = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(startIndex, startIndex + pageSize);

      const colW = 496;
      const rowH = 104;
      const startY = -cardH / 2 + 152;

      pageItems.forEach((ach, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardX = col === 0 ? -colW / 2 - 12 : colW / 2 + 12;
        const cardY = startY + row * (rowH + 12);

        const prog = getProgress(ach);
        const isEquipped = save.getSelectedTitle() === ach.playerTitleReward;

        const aCard = scene.add.container(cardX, cardY);

        // 1. Card Background
        const aBg = scene.add.graphics();
        if (prog.isClaimed) {
          aBg.fillStyle(0x101529, 0.96);
          aBg.fillRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
          aBg.lineStyle(1.4, isEquipped ? 0x00f5d4 : 0xd4af37, isEquipped ? 0.95 : 0.7);
          aBg.strokeRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
        } else if (prog.isMet) {
          // Ready to claim!
          aBg.fillStyle(0x1c1735, 0.98);
          aBg.fillRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
          aBg.lineStyle(1.8, 0xffd700, 1);
          aBg.strokeRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
        } else {
          // In progress / Locked
          aBg.fillStyle(0x0c0e1a, 0.88);
          aBg.fillRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
          aBg.lineStyle(1.1, 0x222638, 0.6);
          aBg.strokeRoundedRect(-colW / 2, -rowH / 2, colW, rowH, 12);
        }
        aCard.add(aBg);

        // 2. Left High-Fidelity 3D Badge Image
        const badgeX = -colW / 2 + 42;
        const badgeKey = ach.badgeKey || 'badge_bronze';

        if (scene.textures.exists(badgeKey)) {
          const badgeImg = scene.add.image(badgeX, 0, badgeKey).setDisplaySize(54, 54);
          if (!prog.isMet) {
            badgeImg.setAlpha(0.45);
          }
          aCard.add(badgeImg);

          if (!prog.isMet) {
            const lockIcon = scene.add.text(badgeX + 16, 16, '🔒', { fontSize: '13px' }).setOrigin(0.5);
            aCard.add(lockIcon);
          } else {
            const ring = scene.add.graphics();
            ring.lineStyle(1.2, 0xffd700, 0.85);
            ring.strokeCircle(badgeX, 0, 29);
            aCard.add(ring);
          }
        } else {
          const fallbackIcon = scene.add.text(badgeX, 0, ach.icon, { fontSize: '28px' }).setOrigin(0.5);
          aCard.add(fallbackIcon);
        }

        // 3. Center Content Area
        const textStartX = -colW / 2 + 78;

        // Title & Category tag
        const titleTxt = scene.add.text(textStartX, -34, ach.title, {
          fontFamily: FONT_UI,
          fontSize: '13.5px',
          fontStyle: '900',
          color: prog.isMet ? '#ffd700' : '#e2e8f0'
        });

        const categoryLabels: Record<string, string> = {
          progression: 'CHIẾN DỊCH',
          battle: 'CHIẾN ĐẤU',
          combo: 'COMBO',
          collection: 'SƯU TẬP',
          zen: 'THIỀN ĐỊNH'
        };
        const catLabel = categoryLabels[ach.category] || ach.category.toUpperCase();
        const catTxt = scene.add.text(textStartX + titleTxt.width + 10, -32, `[ ${catLabel} ]`, {
          fontFamily: FONT_UI,
          fontSize: '9.5px',
          fontStyle: '900',
          color: '#00f5d4'
        });

        // Description
        const descTxt = scene.add.text(textStartX, -14, ach.description, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: 'bold',
          color: '#94a3b8',
          wordWrap: { width: 275 }
        });

        // Progress Bar
        const barW = 180;
        const barH = 6;
        const barY = 16;
        const barBg = scene.add.graphics();
        barBg.fillStyle(0x1a1e34, 1);
        barBg.fillRoundedRect(textStartX, barY, barW, barH, 3);

        const fillW = Math.max(0, Math.min(barW, Math.floor(barW * (prog.percent / 100))));
        if (fillW > 0) {
          barBg.fillStyle(prog.isClaimed ? 0x00f5d4 : (prog.isMet ? 0xffd700 : 0x00b4d8), 1);
          barBg.fillRoundedRect(textStartX, barY, fillW, barH, 3);
        }

        const progTxt = scene.add.text(textStartX + barW + 8, barY + 3, prog.progressLabel, {
          fontFamily: FONT_UI,
          fontSize: '9.5px',
          fontStyle: '900',
          color: prog.isClaimed ? '#00f5d4' : (prog.isMet ? '#ffd700' : '#cbd5e1')
        }).setOrigin(0, 0.5);

        // Reward Pill
        let rewardStr = `💎+${ach.rewardDiamonds}`;
        if (ach.rewardUniversalShards) rewardStr += `  🔮+${ach.rewardUniversalShards}`;
        rewardStr += `  •  🎖️ ${ach.playerTitleReward}`;

        const rewTxt = scene.add.text(textStartX, 30, `Phần thưởng: ${rewardStr}`, {
          fontFamily: FONT_UI,
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: '#fef08a'
        });

        aCard.add([titleTxt, catTxt, descTxt, barBg, progTxt, rewTxt]);

        // 4. Right Action Button / State Area
        const btnX = colW / 2 - 58;

        if (prog.isMet && !prog.isClaimed) {
          // ==========================================
          // CASE 1: CLAIMABLE REWARD BUTTON
          // ==========================================
          const claimBtn = scene.add.container(btnX, 0);
          const clGfx = scene.add.graphics();
          clGfx.fillStyle(0x10b981, 1);
          clGfx.fillRoundedRect(-44, -17, 88, 34, 8);
          clGfx.lineStyle(1.6, 0xffd700, 1);
          clGfx.strokeRoundedRect(-44, -17, 88, 34, 8);

          const clTxt = scene.add.text(0, 0, '🎁 NHẬN', {
            fontFamily: FONT_UI,
            fontSize: '11.5px',
            fontStyle: '900',
            color: '#ffffff'
          }).setOrigin(0.5);

          claimBtn.add([clGfx, clTxt]);
          claimBtn.setSize(88, 34).setInteractive({ useHandCursor: true });

          // Pulsing Glow Tween
          scene.tweens.add({
            targets: claimBtn,
            scale: 1.05,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          claimBtn.on('pointerdown', () => {
            audio.playVictory();
            haptic.heavy();
            const res = save.unlockAchievement(ach.id);
            if (res.success) {
              triggerRewardFX(cardX + btnX, cardY, ach.rewardDiamonds, ach.rewardUniversalShards);
            }
            renderHeader();
            renderFilterBar();
            renderContent();
            renderFooter();
          });

          aCard.add(claimBtn);
        } else if (prog.isClaimed) {
          // ==========================================
          // CASE 2: CLAIMED / EQUIP TITLE BUTTON
          // ==========================================
          if (isEquipped) {
            const eqBadge = scene.add.container(btnX, 0);
            const eqGfx = scene.add.graphics();
            eqGfx.fillStyle(0x0f2b2b, 0.95);
            eqGfx.fillRoundedRect(-42, -14, 84, 28, 6);
            eqGfx.lineStyle(1.2, 0x00f5d4, 0.9);
            eqGfx.strokeRoundedRect(-42, -14, 84, 28, 6);

            const eqTxt = scene.add.text(0, 0, '✓ ĐANG ĐEO', {
              fontFamily: FONT_UI,
              fontSize: '10px',
              fontStyle: '900',
              color: '#00f5d4'
            }).setOrigin(0.5);

            eqBadge.add([eqGfx, eqTxt]);
            aCard.add(eqBadge);
          } else {
            const eqBtn = scene.add.container(btnX, 0);
            const eqGfx = scene.add.graphics();
            eqGfx.fillStyle(0x351d45, 0.95);
            eqGfx.fillRoundedRect(-42, -15, 84, 30, 7);
            eqGfx.lineStyle(1.2, 0xd946ef, 0.85);
            eqGfx.strokeRoundedRect(-42, -15, 84, 30, 7);

            const eqTxt = scene.add.text(0, 0, '🎖️ ĐEO', {
              fontFamily: FONT_UI,
              fontSize: '10.5px',
              fontStyle: '900',
              color: '#ffffff'
            }).setOrigin(0.5);

            eqBtn.add([eqGfx, eqTxt]);
            eqBtn.setSize(84, 30).setInteractive({ useHandCursor: true });

            eqBtn.on('pointerdown', () => {
              audio.playSelect();
              haptic.medium();
              save.setSelectedTitle(ach.playerTitleReward);
              renderHeader();
              renderFilterBar();
              renderContent();
            });

            aCard.add(eqBtn);
          }
        } else {
          // ==========================================
          // CASE 3: IN PROGRESS / LOCKED BADGE
          // ==========================================
          const lockBadge = scene.add.container(btnX, 0);
          const lGfx = scene.add.graphics();
          lGfx.fillStyle(0x131726, 0.8);
          lGfx.fillRoundedRect(-40, -14, 80, 28, 6);
          lGfx.lineStyle(1, 0x2e354f, 0.6);
          lGfx.strokeRoundedRect(-40, -14, 80, 28, 6);

          const lTxt = scene.add.text(0, 0, `🔒 ${prog.percent}%`, {
            fontFamily: FONT_UI,
            fontSize: '10.5px',
            fontStyle: '900',
            color: '#64748b'
          }).setOrigin(0.5);

          lockBadge.add([lGfx, lTxt]);
          aCard.add(lockBadge);
        }

        cardsContainer.add(aCard);
      });
    };

    // ==========================================
    // RENDER FOOTER & BULK CLAIM CONTROLS
    // ==========================================
    const renderFooter = () => {
      footerContainer.removeAll(true);

      const allAchs = AchievementRegistry.getAll();
      let filtered = allAchs;
      if (activeFilter === 'claimable') {
        filtered = allAchs.filter(a => {
          const p = getProgress(a);
          return p.isMet && !p.isClaimed;
        });
      } else if (activeFilter !== 'all') {
        filtered = allAchs.filter(a => a.category === activeFilter);
      }

      const totalPages = Math.ceil(filtered.length / pageSize) || 1;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(filtered.length, startIndex + pageSize);

      // Left: Page Count Info
      const countTxt = scene.add.text(
        -cardW / 2 + 34,
        0,
        `Hiển thị ${filtered.length > 0 ? startIndex + 1 : 0} - ${endIndex} / ${filtered.length} Thành Tựu`,
        {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }
      ).setOrigin(0, 0.5);

      // Center: Pagination Navigation
      const navContainer = scene.add.container(0, 0);

      const hasPrev = currentPage > 1;
      const prevBtn = scene.add.container(-100, 0);
      const prGfx = scene.add.graphics();
      prGfx.fillStyle(hasPrev ? 0x181c33 : 0x0c0e18, 0.95);
      prGfx.fillRoundedRect(-46, -14, 92, 28, 6);
      prGfx.lineStyle(1.1, hasPrev ? 0x00f5d4 : 0x222638, hasPrev ? 0.9 : 0.4);
      prGfx.strokeRoundedRect(-46, -14, 92, 28, 6);
      const prTxt = scene.add.text(0, 0, '◀ TRƯỚC', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: hasPrev ? '#00f5d4' : '#475569'
      }).setOrigin(0.5);
      prevBtn.add([prGfx, prTxt]);
      if (hasPrev) {
        prevBtn.setSize(92, 28).setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
          audio.playSelect();
          haptic.light();
          currentPage--;
          renderContent();
          renderFooter();
        });
      }

      const pageTxt = scene.add.text(0, 0, `Trang ${currentPage} / ${totalPages}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      const hasNext = currentPage < totalPages;
      const nextBtn = scene.add.container(100, 0);
      const nxGfx = scene.add.graphics();
      nxGfx.fillStyle(hasNext ? 0x181c33 : 0x0c0e18, 0.95);
      nxGfx.fillRoundedRect(-46, -14, 92, 28, 6);
      nxGfx.lineStyle(1.1, hasNext ? 0x00f5d4 : 0x222638, hasNext ? 0.9 : 0.4);
      nxGfx.strokeRoundedRect(-46, -14, 92, 28, 6);
      const nxTxt = scene.add.text(0, 0, 'SAU ▶', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: hasNext ? '#00f5d4' : '#475569'
      }).setOrigin(0.5);
      nextBtn.add([nxGfx, nxTxt]);
      if (hasNext) {
        nextBtn.setSize(92, 28).setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
          audio.playSelect();
          haptic.light();
          currentPage++;
          renderContent();
          renderFooter();
        });
      }

      navContainer.add([prevBtn, pageTxt, nextBtn]);

      // Right: Bulk Claim All button if available
      const claimableAchs = allAchs.filter(a => {
        const p = getProgress(a);
        return p.isMet && !p.isClaimed;
      });

      if (claimableAchs.length > 0) {
        const claimAllBtn = scene.add.container(cardW / 2 - 110, 0);
        const caGfx = scene.add.graphics();
        caGfx.fillStyle(0x10b981, 1);
        caGfx.fillRoundedRect(-75, -15, 150, 30, 7);
        caGfx.lineStyle(1.4, 0xffd700, 1);
        caGfx.strokeRoundedRect(-75, -15, 150, 30, 7);

        const caTxt = scene.add.text(0, 0, `🎁 NHẬN HẾT (${claimableAchs.length})`, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);

        claimAllBtn.add([caGfx, caTxt]);
        claimAllBtn.setSize(150, 30).setInteractive({ useHandCursor: true });

        claimAllBtn.on('pointerdown', () => {
          audio.playVictory();
          haptic.heavy();
          let totD = 0;
          let totS = 0;
          claimableAchs.forEach(ach => {
            const res = save.unlockAchievement(ach.id);
            if (res.success) {
              totD += ach.rewardDiamonds;
              totS += ach.rewardUniversalShards || 0;
            }
          });
          triggerRewardFX(0, 0, totD, totS);
          renderHeader();
          renderFilterBar();
          renderContent();
          renderFooter();
        });

        footerContainer.add(claimAllBtn);
      }

      footerContainer.add([countTxt, navContainer]);
    };

    renderHeader();
    renderFilterBar();
    renderContent();
    renderFooter();

    // Opening animation
    container.setScale(0.92);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    return container;
  }
}
