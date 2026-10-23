import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { RelicManager, RelicItem } from './RelicManager';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';
import { getRelicTierStyle } from '../styles/colors';

interface RealmTab {
  id: string;
  name: string;
  icon: string;
}

export class RelicCodexModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static readonly REALM_TABS: RealmTab[] = [
    { id: 'all', name: 'Tất cả', icon: '⊞' },
    { id: 'yokai', name: 'Nhật Bản', icon: '⛩️' },
    { id: 'egypt', name: 'Ai Cập', icon: '🔺' },
    { id: 'greece', name: 'Hy Lạp', icon: '🌿' },
    { id: 'wuxia', name: 'Tam Giới', icon: '🌀' },
    { id: 'india', name: 'Nam Á', icon: '🇮🇳' },
    { id: 'pirate', name: 'Hải Tặc', icon: '🏴‍☠️' },
    { id: 'dinosaur', name: 'Tiền Sử', icon: '🦖' },
    { id: 'space', name: 'Cơ Giáp', icon: '🛸' },
    { id: 'chaos', name: 'Hỗn Mang', icon: '🌌' }
  ];

  public static getRealmName(worldId: string): string {
    const match = RelicCodexModal.REALM_TABS.find(t => t.id === worldId);
    return match ? `${match.icon} ${match.name}` : worldId;
  }

  public static open(
    scene: Phaser.Scene,
    initialPage: number = 0,
    initialWorld: string = 'all',
    onClose?: () => void
  ): Phaser.GameObjects.Container {
    // If already open, close old one first
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }

    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();
    const save = SaveSystem.getInstance();
    const relicMgr = RelicManager.getInstance();

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    const modal = scene.add.container(width / 2, height / 2).setDepth(480);
    this.activeModal = modal;

    // 1. Dark Backdrop Overlay
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.90);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', () => {
      audio.playSelect();
      closeModal();
    });
    modal.add(backdrop);

    // 2. Main Modal Card (1040 x 600)
    const cardW = 1040;
    const cardH = 600;
    const card = scene.add.graphics();

    // Deep Midnight Lacquer Base
    card.fillStyle(0x0a0c18, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // Ornate Gold Outer Border
    card.lineStyle(2.2, 0xd4af37, 0.95);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // Subtle Indigo/Cyan Inner Accent
    card.lineStyle(1.0, 0x38bdf8, 0.35);
    card.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, 16);

    // Decorative Gold Corner Brackets on Main Card
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

    modal.add(card);

    // State Variables
    let selectedWorld = initialWorld;
    let currentPage = initialPage;
    const PAGE_SIZE = 6;

    // Realm Tabs definition
    const realmTabs = RelicCodexModal.REALM_TABS;
    const getRealmName = RelicCodexModal.getRealmName;

    // Containers for dynamic content
    const headerContainer = scene.add.container(0, -cardH / 2 + 32);
    const tabsContainer = scene.add.container(0, -cardH / 2 + 75);
    const gridContainer = scene.add.container(0, 0);
    modal.add([headerContainer, tabsContainer, gridContainer]);

    // Toast Notice helper
    const showNotice = (text: string, colorHex: number = 0x00f5d4) => {
      const toast = scene.add.container(0, -cardH / 2 + 115).setDepth(700);
      const tBg = scene.add.graphics();
      tBg.fillStyle(0x0c1222, 0.96);
      tBg.fillRoundedRect(-240, -16, 480, 32, 16);
      tBg.lineStyle(1.4, colorHex, 0.95);
      tBg.strokeRoundedRect(-240, -16, 480, 32, 16);
      const tTxt = scene.add.text(0, 0, text, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      toast.add([tBg, tTxt]);
      modal.add(toast);

      scene.tweens.add({
        targets: toast,
        y: -cardH / 2 + 105,
        alpha: { from: 0, to: 1 },
        duration: 220,
        yoyo: true,
        hold: 1400,
        onComplete: () => toast.destroy()
      });
    };

    const closeModal = () => {
      audio.playSelect();
      modal.destroy();
      RelicCodexModal.activeModal = null;
      onClose?.();
    };

    // ==========================================
    // DETAIL POPUP MODAL (Hiển thị Toàn Bộ Thông Tin & Hiệu Ứng Chi Tiết)
    // ==========================================
    const openRelicDetailModal = (r: RelicItem) => {
      RelicCodexModal.openRelicDetail(scene, r, () => {
        renderContent();
      });
    };

    // Render Function: Rerenders Header, Tabs, and Grid
    const renderContent = () => {
      headerContainer.removeAll(true);
      tabsContainer.removeAll(true);
      gridContainer.removeAll(true);

      // 1. Filter relics according to selected tab
      const allRelics = relicMgr.getAllRelics();
      const filteredRelics = selectedWorld === 'all'
        ? allRelics
        : allRelics.filter(r => r.worldId === selectedWorld);

      const totalPages = Math.max(1, Math.ceil(filteredRelics.length / PAGE_SIZE));
      if (currentPage >= totalPages) currentPage = totalPages - 1;
      if (currentPage < 0) currentPage = 0;

      const startIndex = currentPage * PAGE_SIZE;
      const currentRelics = filteredRelics.slice(startIndex, startIndex + PAGE_SIZE);

      // Unlocked counter (count how many of 30 relics player owns)
      const unlockedCount = allRelics.filter(r => save.getRelicStar(r.id) > 0).length;

      // ==========================================
      // A. HEADER BAR
      // ==========================================
      // Left Book Icon Emblem
      const emblemBox = scene.add.graphics();
      emblemBox.fillStyle(0x13172c, 0.95);
      emblemBox.fillRoundedRect(-485, -17, 34, 34, 8);
      emblemBox.lineStyle(1.2, 0xd4af37, 0.9);
      emblemBox.strokeRoundedRect(-485, -17, 34, 34, 8);
      const bookIcon = scene.add.text(-468, 0, '📖', { fontSize: '18px' }).setOrigin(0.5);
      headerContainer.add([emblemBox, bookIcon]);

      // Title: ✧・ TOÀN THƯ CỔ VẬT THẦN KHÍ
      const titleTxt = scene.add.text(-435, 0, '✧・ TOÀN THƯ CỔ VẬT THẦN KHÍ', {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);
      titleTxt.setShadow(0, 2, 'rgba(0,0,0,0.85)', 4, true, false);
      headerContainer.add(titleTxt);

      // Collection Progress Pill: 📖 12/30
      const progPill = scene.add.graphics();
      progPill.fillStyle(0x111628, 0.95);
      progPill.fillRoundedRect(205, -14, 84, 28, 14);
      progPill.lineStyle(1.2, 0xd4af37, 0.85);
      progPill.strokeRoundedRect(205, -14, 84, 28, 14);
      const progTxt = scene.add.text(247, 0, `📖 ${unlockedCount}/30`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffd700'
      }).setOrigin(0.5);
      headerContainer.add([progPill, progTxt]);

      // Pagination Control Pill: [ ←  2/5  → ]
      const navPill = scene.add.graphics();
      navPill.fillStyle(0x0b1122, 0.95);
      navPill.fillRoundedRect(305, -14, 115, 28, 14);
      navPill.lineStyle(1.2, 0x38bdf8, 0.5);
      navPill.strokeRoundedRect(305, -14, 115, 28, 14);
      headerContainer.add(navPill);

      // Prev Arrow
      const prevBtn = scene.add.text(324, 0, '←', {
        fontFamily: FONT_UI,
        fontSize: '17px',
        fontStyle: '900',
        color: currentPage > 0 ? '#38bdf8' : '#475569'
      }).setOrigin(0.5);
      if (currentPage > 0) {
        prevBtn.setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
          audio.playSelect();
          currentPage--;
          renderContent();
        });
      }
      headerContainer.add(prevBtn);

      // Page Text
      const pageTxt = scene.add.text(363, 0, `${currentPage + 1}/${totalPages}`, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      headerContainer.add(pageTxt);

      // Next Arrow
      const nextBtn = scene.add.text(401, 0, '→', {
        fontFamily: FONT_UI,
        fontSize: '17px',
        fontStyle: '900',
        color: currentPage < totalPages - 1 ? '#38bdf8' : '#475569'
      }).setOrigin(0.5);
      if (currentPage < totalPages - 1) {
        nextBtn.setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
          audio.playSelect();
          currentPage++;
          renderContent();
        });
      }
      headerContainer.add(nextBtn);

      // Close Button (Red Circle with Gold Rim and ✕)
      const closeBtn = scene.add.container(465, 0);
      const closeGfx = scene.add.graphics();
      closeGfx.fillStyle(0xd90429, 1);
      closeGfx.fillCircle(0, 0, 16);
      closeGfx.lineStyle(1.8, 0xffd700, 0.95);
      closeGfx.strokeCircle(0, 0, 16);
      const closeX = scene.add.text(0, 0, '✕', {
        fontFamily: FONT_UI,
        fontSize: '15px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);
      closeBtn.add([closeGfx, closeX]);
      closeBtn.setSize(34, 34).setInteractive({ useHandCursor: true });
      closeBtn.on('pointerdown', closeModal);
      closeBtn.on('pointerover', () => closeBtn.setScale(1.08));
      closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
      headerContainer.add(closeBtn);

      // ==========================================
      // B. REALM FILTER TABS BAR (Centered under header)
      // ==========================================
      const visibleTabs: RealmTab[] = [
        realmTabs[0], // Tất cả
        realmTabs[1], // Nhật Bản
        realmTabs[2], // Ai Cập
        realmTabs[3], // Hy Lạp
        realmTabs[4], // Tam Giới
      ];

      const currentSelectedIsOther = !visibleTabs.some(t => t.id === selectedWorld);
      const tabW = 120;
      const tabH = 30;
      const tabGap = 10;
      const totalTabsWidth = (visibleTabs.length + 1) * tabW + visibleTabs.length * tabGap;
      const startTabX = -totalTabsWidth / 2 + tabW / 2;

      visibleTabs.forEach((tab, tIdx) => {
        const tx = startTabX + tIdx * (tabW + tabGap);
        const isTabActive = selectedWorld === tab.id;

        const tabBtn = scene.add.container(tx, 0);
        const tGfx = scene.add.graphics();

        if (isTabActive) {
          tGfx.fillStyle(0xb45309, 0.98);
          tGfx.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          tGfx.lineStyle(1.8, 0xfcd34d, 1);
          tGfx.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        } else {
          tGfx.fillStyle(0x11162b, 0.85);
          tGfx.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
          tGfx.lineStyle(1.0, 0x242e4c, 0.7);
          tGfx.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        }

        const tLabel = scene.add.text(0, 0, `${tab.icon} ${tab.name}`, {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: isTabActive ? '900' : 'bold',
          color: isTabActive ? '#ffffff' : '#94a3b8'
        }).setOrigin(0.5);

        tabBtn.add([tGfx, tLabel]);
        tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
        tabBtn.on('pointerdown', () => {
          if (selectedWorld !== tab.id) {
            audio.playSelect();
            selectedWorld = tab.id;
            currentPage = 0;
            renderContent();
          }
        });
        tabBtn.on('pointerover', () => {
          if (!isTabActive) tLabel.setColor('#ffffff');
        });
        tabBtn.on('pointerout', () => {
          if (!isTabActive) tLabel.setColor('#94a3b8');
        });

        tabsContainer.add(tabBtn);
      });

      // 6th Tab: Vạn Giới (More Realms)
      const moreTabX = startTabX + visibleTabs.length * (tabW + tabGap);
      const moreTabBtn = scene.add.container(moreTabX, 0);
      const moreGfx = scene.add.graphics();
      if (currentSelectedIsOther) {
        moreGfx.fillStyle(0xb45309, 0.98);
        moreGfx.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        moreGfx.lineStyle(1.8, 0xfcd34d, 1);
        moreGfx.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
      } else {
        moreGfx.fillStyle(0x11162b, 0.85);
        moreGfx.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
        moreGfx.lineStyle(1.0, 0x242e4c, 0.7);
        moreGfx.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 8);
      }

      const activeOtherTab = realmTabs.find(t => t.id === selectedWorld);
      const moreLabelText = currentSelectedIsOther && activeOtherTab
        ? `${activeOtherTab.icon} ${activeOtherTab.name}`
        : '🌐 Vạn Giới ▾';

      const moreLabel = scene.add.text(0, 0, moreLabelText, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: currentSelectedIsOther ? '900' : 'bold',
        color: currentSelectedIsOther ? '#ffffff' : '#94a3b8'
      }).setOrigin(0.5);

      moreTabBtn.add([moreGfx, moreLabel]);
      moreTabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
      moreTabBtn.on('pointerdown', () => {
        audio.playSelect();
        const otherIds = ['india', 'pirate', 'dinosaur', 'space', 'chaos'];
        const curIdx = otherIds.indexOf(selectedWorld);
        const nextId = curIdx === -1 ? otherIds[0] : (curIdx === otherIds.length - 1 ? 'all' : otherIds[curIdx + 1]);
        selectedWorld = nextId;
        currentPage = 0;
        renderContent();
      });
      tabsContainer.add(moreTabBtn);

      // ==========================================
      // C. THE 6 RELIC CARDS GRID (2 Rows x 3 Columns)
      // ==========================================
      const colW = 320;
      const colH = 176;
      const colSpacing = 334;
      const rowY1 = -46;
      const rowY2 = 142;

      currentRelics.forEach((r, idx) => {
        const isSecondRow = idx >= 3;
        const col = idx % 3;
        const posX = (col - 1) * colSpacing;
        const posY = isSecondRow ? rowY2 : rowY1;

        const rBox = scene.add.container(posX, posY);

        const stars = save.getRelicStar(r.id);
        const shards = save.getRelicShards(r.id);
        const reqShards = save.getRelicRequiredShards(r.id);
        const isUnlocked = stars > 0;
        const isEquipped = isUnlocked && save.getEquippedRelicId() === r.id;
        const canUnlock = !isUnlocked && shards >= reqShards;
        const mults = [1.0, 1.0, 1.25, 1.5, 2.0];
        const nextStarCost = Math.round(reqShards * (mults[stars] || 1.0));

        // Card Outer Frame & Shadow
        const cGfx = scene.add.graphics();
        const cardBg = isEquipped ? 0x121a2d : 0x0c0f1e;
        cGfx.fillStyle(cardBg, 0.98);
        cGfx.fillRoundedRect(-colW / 2, -colH / 2, colW, colH, 14);

        // Gold outer border
        const borderColor = isEquipped ? 0x00f5d4 : (canUnlock ? 0xf59e0b : (isUnlocked ? 0xd4af37 : 0x8a7030));
        cGfx.lineStyle(isEquipped ? 2.2 : 1.5, borderColor, 0.95);
        cGfx.strokeRoundedRect(-colW / 2, -colH / 2, colW, colH, 14);

        // Inner subtle indigo line
        cGfx.lineStyle(1.0, isEquipped ? 0x00f5d4 : 0x4338ca, 0.3);
        cGfx.strokeRoundedRect(-colW / 2 + 3, -colH / 2 + 3, colW - 6, colH - 6, 12);

        // Ornate Corner Accents on Card
        const drawMiniCorner = (cx: number, cy: number, dx: number, dy: number) => {
          cGfx.lineStyle(1.5, 0xffd700, 0.7);
          cGfx.beginPath();
          cGfx.moveTo(cx, cy + dy * 10);
          cGfx.lineTo(cx, cy);
          cGfx.lineTo(cx + dx * 10, cy);
          cGfx.strokePath();
        };
        drawMiniCorner(-colW / 2 + 7, -colH / 2 + 7, 1, 1);
        drawMiniCorner(colW / 2 - 7, -colH / 2 + 7, -1, 1);
        drawMiniCorner(-colW / 2 + 7, colH / 2 - 7, 1, -1);
        drawMiniCorner(colW / 2 - 7, colH / 2 - 7, -1, -1);

        rBox.add(cGfx);

        // ------------------------------------------
        // 1. LEFT SIDE: 104x104 Artwork Box
        // ------------------------------------------
        const artSize = 104;
        const artX = -colW / 2 + 66;
        const artY = 0;

        const artBox = scene.add.graphics();
        artBox.fillStyle(0x060812, 0.98);
        artBox.fillRoundedRect(artX - artSize / 2, artY - artSize / 2, artSize, artSize, 10);
        artBox.lineStyle(1.4, isEquipped ? 0x00f5d4 : (isUnlocked ? 0xd4af37 : 0x475569), 0.9);
        artBox.strokeRoundedRect(artX - artSize / 2, artY - artSize / 2, artSize, artSize, 10);

        // 4 Golden Diagonal Corner Accents on Artwork Box
        const drawArtCorner = (acx: number, acy: number, adx: number, ady: number) => {
          artBox.lineStyle(1.5, 0xffd700, 0.85);
          artBox.beginPath();
          artBox.moveTo(acx, acy + ady * 9);
          artBox.lineTo(acx, acy);
          artBox.lineTo(acx + adx * 9, acy);
          artBox.strokePath();
        };
        drawArtCorner(artX - artSize / 2 + 4, artY - artSize / 2 + 4, 1, 1);
        drawArtCorner(artX + artSize / 2 - 4, artY - artSize / 2 + 4, -1, 1);
        drawArtCorner(artX - artSize / 2 + 4, artY + artSize / 2 - 4, 1, -1);
        drawArtCorner(artX + artSize / 2 - 4, artY + artSize / 2 - 4, -1, -1);
        rBox.add(artBox);

        // Relic Image or fallback icon
        const texKey = `relic_${r.id}`;
        if (scene.textures.exists(texKey)) {
          const img = scene.add.image(artX, artY, texKey).setDisplaySize(artSize - 8, artSize - 8);
          if (!isUnlocked) {
            img.setAlpha(0.88);
          }
          rBox.add(img);
        } else {
          const iconTxt = scene.add.text(artX, artY, r.icon || '🏺', { fontSize: '42px' }).setOrigin(0.5);
          rBox.add(iconTxt);
        }

        // Equipped Badge Overlay
        if (isEquipped) {
          const eqBadge = scene.add.graphics();
          eqBadge.fillStyle(0x00f5d4, 0.95);
          eqBadge.fillRoundedRect(artX - 44, artY + artSize / 2 - 16, 88, 16, 4);
          const eqTxt = scene.add.text(artX, artY + artSize / 2 - 8, '✨ ĐANG DÙNG', {
            fontFamily: FONT_UI,
            fontSize: '9px',
            fontStyle: '900',
            color: '#08121e'
          }).setOrigin(0.5);
          rBox.add([eqBadge, eqTxt]);
        }

        // ------------------------------------------
        // 2. RIGHT SIDE: Relic Info & Progress Bar
        // ------------------------------------------
        const infoX = -colW / 2 + 128;
        const infoW = colW - 136;

        // Line 1: Relic Name
        const nameTxt = scene.add.text(infoX, -colH / 2 + 18, r.name, {
          fontFamily: FONT_DISPLAY,
          fontSize: '13.5px',
          fontStyle: 'bold',
          color: isEquipped ? '#00f5d4' : '#ffffff'
        }).setOrigin(0, 0.5);
        rBox.add(nameTxt);

        // Line 2: Canonical Tier Badge Pill
        const tierStyle = getRelicTierStyle(r.tier);
        const pillW = 84;
        const pillH = 19;
        const pillY = -colH / 2 + 39;
        const rarityGfx = scene.add.graphics();
        rarityGfx.fillStyle(tierStyle.bg, 0.95);
        rarityGfx.fillRoundedRect(infoX, pillY - pillH / 2, pillW, pillH, 9);
        rarityGfx.lineStyle(1.2, tierStyle.border, 0.95);
        rarityGfx.strokeRoundedRect(infoX, pillY - pillH / 2, pillW, pillH, 9);
        const rarityTxt = scene.add.text(infoX + pillW / 2, pillY, tierStyle.label, {
          fontFamily: FONT_UI,
          fontSize: '10px',
          fontStyle: 'bold',
          color: tierStyle.colorHex
        }).setOrigin(0.5);
        rBox.add([rarityGfx, rarityTxt]);

        // Hint "🔍 Chi tiết" icon/text on line 2 (aligned with rarity pill, avoiding long relic name overlap)
        const inspectHint = scene.add.text(colW / 2 - 14, pillY, '🔍 Chi tiết', {
          fontFamily: FONT_UI,
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: '#38bdf8'
        }).setOrigin(1, 0.5);
        rBox.add(inspectHint);

        // Line 3: Skill Description with Yellow Lightning (Full clean wrapped text, no mid-word cutoff!)
        const lightningIcon = scene.add.text(infoX, -colH / 2 + 58, '⚡', {
          fontSize: '12px',
          color: '#ffd700'
        }).setOrigin(0, 0);

        const skillDesc = scene.add.text(infoX + 15, -colH / 2 + 56, r.skillDesc, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '500',
          color: '#ffffff',
          lineSpacing: 2.2,
          wordWrap: { width: infoW - 16, useAdvancedWrap: true }
        }).setOrigin(0, 0);
        rBox.add([lightningIcon, skillDesc]);

        // Line 4: Shard Progress (🧩 0/100, 32/40, etc.)
        const progressY = colH / 2 - 28;
        const puzzleIcon = scene.add.text(infoX, progressY, '🧩', {
          fontSize: '12px'
        }).setOrigin(0, 0.5);

        const curTarget = isUnlocked ? (stars >= 5 ? reqShards : nextStarCost) : reqShards;
        const shardLabel = isUnlocked
          ? (stars >= 5 ? `MAX (★5)` : `★${stars} • ${shards}/${curTarget}`)
          : `${shards}/${reqShards}`;

        const shardTxt = scene.add.text(infoX + 18, progressY, shardLabel, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: 'bold',
          color: canUnlock ? '#f59e0b' : '#38bdf8'
        }).setOrigin(0, 0.5);
        rBox.add([puzzleIcon, shardTxt]);

        // Progress Bar (Sleek cyan/neon fill)
        const pBarW = 166;
        const pBarH = 7;
        const pBarY = colH / 2 - 14;
        const pGfx = scene.add.graphics();
        pGfx.fillStyle(0x080e1c, 0.95);
        pGfx.fillRoundedRect(infoX, pBarY - pBarH / 2, pBarW, pBarH, 3.5);
        pGfx.lineStyle(1.0, 0x1e293b, 0.8);
        pGfx.strokeRoundedRect(infoX, pBarY - pBarH / 2, pBarW, pBarH, 3.5);

        const pRatio = isUnlocked
          ? (stars >= 5 ? 1 : Math.min(1, shards / Math.max(1, nextStarCost)))
          : Math.min(1, shards / Math.max(1, reqShards));

        if (pRatio > 0) {
          const fillCol = canUnlock ? 0xf59e0b : (isUnlocked ? 0x00f5d4 : 0x38bdf8);
          pGfx.fillStyle(fillCol, 1);
          pGfx.fillRoundedRect(infoX, pBarY - pBarH / 2, Math.max(7, pBarW * pRatio), pBarH, 3.5);
        }
        rBox.add(pGfx);

        // ------------------------------------------
        // 3. INTERACTION & CLICK HANDLER -> OPENS FULL DETAIL POPUP
        // ------------------------------------------
        rBox.setSize(colW, colH).setInteractive({ useHandCursor: true });
        rBox.on('pointerover', () => {
          scene.tweens.add({
            targets: rBox,
            scale: 1.02,
            duration: 120
          });
        });
        rBox.on('pointerout', () => {
          scene.tweens.add({
            targets: rBox,
            scale: 1.0,
            duration: 120
          });
        });

        // Tapping card opens the rich, full Detail Popup
        rBox.on('pointerdown', () => {
          openRelicDetailModal(r);
        });

        gridContainer.add(rBox);
      });

      // ==========================================
      // D. BOTTOM CLOSE BUTTON (Matching Image 1)
      // ==========================================
      const bottomCloseBtn = scene.add.container(0, cardH / 2 - 24);
      const bGfx = scene.add.graphics();
      const bW = 210;
      const bH = 34;

      bGfx.fillStyle(0xd90429, 1); // Crimson red
      bGfx.fillRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);
      bGfx.lineStyle(1.8, 0xffd700, 0.95); // Gold rim
      bGfx.strokeRoundedRect(-bW / 2, -bH / 2, bW, bH, 10);

      const bTxt = scene.add.text(0, 0, 'ĐÓNG BÁCH KHOA', {
        fontFamily: FONT_DISPLAY,
        fontSize: '13px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      bottomCloseBtn.add([bGfx, bTxt]);
      bottomCloseBtn.setSize(bW, bH).setInteractive({ useHandCursor: true });
      bottomCloseBtn.on('pointerdown', closeModal);
      bottomCloseBtn.on('pointerover', () => bottomCloseBtn.setScale(1.05));
      bottomCloseBtn.on('pointerout', () => bottomCloseBtn.setScale(1.0));
      gridContainer.add(bottomCloseBtn);
    };

    // Initial Render
    renderContent();

    return modal;
  }

  // ==========================================
  // DETAIL POPUP MODAL (Hiển thị Toàn Bộ Thông Tin & Hiệu Ứng Chi Tiết To Rõ Cho Mobile)
  // ==========================================
  public static openRelicDetail(
    scene: Phaser.Scene,
    r: RelicItem,
    onActionCompleted?: () => void
  ): Phaser.GameObjects.Container {
    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();
    const save = SaveSystem.getInstance();

    audio.playSelect();
    haptic.light();

    const stars = save.getRelicStar(r.id);
    const shards = save.getRelicShards(r.id);
    const reqShards = save.getRelicRequiredShards(r.id);
    const isUnlocked = stars > 0;
    const isEquipped = isUnlocked && save.getEquippedRelicId() === r.id;
    const canUnlock = !isUnlocked && shards >= reqShards;
    const mults = [1.0, 1.0, 1.25, 1.5, 2.0];
    const nextStarCost = Math.round(reqShards * (mults[stars] || 1.0));
    const canUpgrade = isUnlocked && stars < 5 && shards >= nextStarCost;

    const { width: screenW, height: screenH } = getScreenDimensions();
    const detailPopup = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(850);

    // Detail Card Frame (680 x 470)
    const dCardW = 680;
    const dCardH = 470;

    // Toast Notice helper
    const showNotice = (text: string, colorHex: number = 0x00f5d4) => {
      const toast = scene.add.container(0, -dCardH / 2 + 30).setDepth(1000);
      const tBg = scene.add.graphics();
      tBg.fillStyle(0x0c1222, 0.96);
      tBg.fillRoundedRect(-240, -16, 480, 32, 16);
      tBg.lineStyle(1.4, colorHex, 0.95);
      tBg.strokeRoundedRect(-240, -16, 480, 32, 16);
      const tTxt = scene.add.text(0, 0, text, {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      toast.add([tBg, tTxt]);
      detailPopup.add(toast);

      scene.tweens.add({
        targets: toast,
        y: -dCardH / 2 + 18,
        alpha: { from: 0, to: 1 },
        duration: 220,
        yoyo: true,
        hold: 1400,
        onComplete: () => toast.destroy()
      });
    };

    // Dark translucent backdrop
    const dBackdrop = scene.add.graphics();
    dBackdrop.fillStyle(0x000000, 0.88);
    dBackdrop.fillRect(-screenW / 2, -screenH / 2, screenW, screenH);
    dBackdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -screenH / 2, screenW, screenH),
      Phaser.Geom.Rectangle.Contains
    );
    dBackdrop.on('pointerdown', () => {
      audio.playSelect();
      detailPopup.destroy();
    });
    detailPopup.add(dBackdrop);

    const dCard = scene.add.graphics();
    dCard.fillStyle(0x080b18, 0.99);
    dCard.fillRoundedRect(-dCardW / 2, -dCardH / 2, dCardW, dCardH, 18);
    dCard.lineStyle(2.4, 0xffd700, 0.95);
    dCard.strokeRoundedRect(-dCardW / 2, -dCardH / 2, dCardW, dCardH, 18);
    dCard.lineStyle(1.0, 0x38bdf8, 0.4);
    dCard.strokeRoundedRect(-dCardW / 2 + 5, -dCardH / 2 + 5, dCardW - 10, dCardH - 10, 14);

    // Corner flourishes on detail modal
    const drawDetailCorner = (dcx: number, dcy: number, ddx: number, ddy: number) => {
      dCard.lineStyle(1.8, 0xffd700, 0.85);
      dCard.beginPath();
      dCard.moveTo(dcx, dcy + ddy * 14);
      dCard.lineTo(dcx, dcy);
      dCard.lineTo(dcx + ddx * 14, dcy);
      dCard.strokePath();
    };
    drawDetailCorner(-dCardW / 2 + 8, -dCardH / 2 + 8, 1, 1);
    drawDetailCorner(dCardW / 2 - 8, -dCardH / 2 + 8, -1, 1);
    drawDetailCorner(-dCardW / 2 + 8, dCardH / 2 - 8, 1, -1);
    drawDetailCorner(dCardW / 2 - 8, dCardH / 2 - 8, -1, -1);
    detailPopup.add(dCard);

    // Header Tag: ⛩️ CHI TIẾT THẦN KHÍ BẢO VẬT • CHƯƠNG r.chapter
    const dHeaderTag = scene.add.text(0, -dCardH / 2 + 24, `⛩️ CHI TIẾT THẦN KHÍ BẢO VẬT • CHƯƠNG ${r.chapter}`, {
      fontFamily: FONT_UI,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);
    detailPopup.add(dHeaderTag);

    // Close Button on Top Right (✕)
    const dCloseBtn = scene.add.container(dCardW / 2 - 28, -dCardH / 2 + 24);
    const dcBg = scene.add.graphics();
    dcBg.fillStyle(0xd90429, 1);
    dcBg.fillCircle(0, 0, 14);
    dcBg.lineStyle(1.5, 0xffd700, 0.95);
    dcBg.strokeCircle(0, 0, 14);
    const dcX = scene.add.text(0, 0, '✕', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    dCloseBtn.add([dcBg, dcX]);
    dCloseBtn.setSize(28, 28).setInteractive({ useHandCursor: true });
    dCloseBtn.on('pointerdown', () => {
      audio.playSelect();
      detailPopup.destroy();
    });
    detailPopup.add(dCloseBtn);

    // ------------------------------------------
    // LEFT SIDE: Big 3D Art & Badges (x = -205)
    // ------------------------------------------
    const leftColX = -205;
    const bigArtSize = 138;
    const artBox = scene.add.graphics();
    artBox.fillStyle(0x050711, 0.98);
    artBox.fillRoundedRect(leftColX - bigArtSize / 2, -75 - bigArtSize / 2, bigArtSize, bigArtSize, 12);
    artBox.lineStyle(1.8, isEquipped ? 0x00f5d4 : (isUnlocked ? 0xd4af37 : 0x475569), 0.95);
    artBox.strokeRoundedRect(leftColX - bigArtSize / 2, -75 - bigArtSize / 2, bigArtSize, bigArtSize, 12);

    // Corner trims on art
    const drawArtC = (acx: number, acy: number, adx: number, ady: number) => {
      artBox.lineStyle(1.6, 0xffd700, 0.9);
      artBox.beginPath();
      artBox.moveTo(acx, acy + ady * 12);
      artBox.lineTo(acx, acy);
      artBox.lineTo(acx + adx * 12, acy);
      artBox.strokePath();
    };
    drawArtC(leftColX - bigArtSize / 2 + 4, -75 - bigArtSize / 2 + 4, 1, 1);
    drawArtC(leftColX + bigArtSize / 2 - 4, -75 - bigArtSize / 2 + 4, -1, 1);
    drawArtC(leftColX - bigArtSize / 2 + 4, -75 + bigArtSize / 2 - 4, 1, -1);
    drawArtC(leftColX + bigArtSize / 2 - 4, -75 + bigArtSize / 2 - 4, -1, -1);
    detailPopup.add(artBox);

    // Artwork Image
    const texKey = `relic_${r.id}`;
    if (scene.textures.exists(texKey)) {
      const bigImg = scene.add.image(leftColX, -75, texKey).setDisplaySize(bigArtSize - 10, bigArtSize - 10);
      detailPopup.add(bigImg);
    } else {
      const bigIcon = scene.add.text(leftColX, -75, r.icon || '🏺', { fontSize: '54px' }).setOrigin(0.5);
      detailPopup.add(bigIcon);
    }

    // Canonical Relic Tier Pill
    const tierStyle = getRelicTierStyle(r.tier);
    const rPill = scene.add.graphics();
    rPill.fillStyle(tierStyle.bg, 0.95);
    rPill.fillRoundedRect(leftColX - 55, 12, 110, 22, 11);
    rPill.lineStyle(1.4, tierStyle.border, 0.95);
    rPill.strokeRoundedRect(leftColX - 55, 12, 110, 22, 11);
    const rPillTxt = scene.add.text(leftColX, 23, tierStyle.label, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: tierStyle.colorHex
    }).setOrigin(0.5);
    detailPopup.add([rPill, rPillTxt]);

    // Star / Status Tag
    const starTagTxt = scene.add.text(leftColX, 48, isUnlocked ? `★${stars}/5 Tinh Anh` : 'Chưa Mở Khóa', {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: isUnlocked ? '#ffd700' : '#94a3b8'
    }).setOrigin(0.5);
    detailPopup.add(starTagTxt);

    // Archetype badge
    const archTxt = scene.add.text(leftColX, 70, `🎯 ${r.archetypeName || 'Chiến Đấu'}`, {
      fontFamily: FONT_UI,
      fontSize: '10.5px',
      color: '#38bdf8'
    }).setOrigin(0.5);
    detailPopup.add(archTxt);

    // ------------------------------------------
    // RIGHT SIDE: Relic Details & Full Skill (x = -105 to +305)
    // ------------------------------------------
    const rightColX = -105;
    const rightColW = 410;

    // 1. Relic Title & Subname
    const dTitle = scene.add.text(rightColX, -172, r.name, {
      fontFamily: FONT_DISPLAY,
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0, 0);
    detailPopup.add(dTitle);

    const dSubTitle = scene.add.text(rightColX, -145, `📜 Danh xưng: ${r.subName}  |  🌐 ${RelicCodexModal.getRealmName(r.worldId)}`, {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      color: '#94a3b8'
    }).setOrigin(0, 0);
    detailPopup.add(dSubTitle);

    // 2. Full Ultimate Skill Box (Khung Tuyệt Chiêu Đầy Đủ)
    const skillBoxY = -120;
    const skillBoxH = 152;
    const sBox = scene.add.graphics();
    sBox.fillStyle(0x0e1428, 0.96);
    sBox.fillRoundedRect(rightColX, skillBoxY, rightColW, skillBoxH, 12);
    sBox.lineStyle(1.4, 0x1e3a6a, 0.85);
    sBox.strokeRoundedRect(rightColX, skillBoxY, rightColW, skillBoxH, 12);
    detailPopup.add(sBox);

    // Skill Header: ⚡ Tuyệt Kỹ: ... (Nộ: 100%)
    const sHeadTxt = scene.add.text(rightColX + 14, skillBoxY + 11, `⚡ TUYỆT KỸ: ${r.skillName}`, {
      fontFamily: FONT_DISPLAY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#00f5d4'
    }).setOrigin(0, 0);

    const sRageBadge = scene.add.graphics();
    sRageBadge.fillStyle(0x312e81, 0.95);
    sRageBadge.fillRoundedRect(rightColX + rightColW - 100, skillBoxY + 9, 88, 20, 6);
    sRageBadge.lineStyle(1, 0x6366f1, 0.8);
    sRageBadge.strokeRoundedRect(rightColX + rightColW - 100, skillBoxY + 9, 88, 20, 6);
    const sRageTxt = scene.add.text(rightColX + rightColW - 56, skillBoxY + 19, `Nộ: ${r.rageCost}%`, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#c7d2fe'
    }).setOrigin(0.5);
    detailPopup.add([sHeadTxt, sRageBadge, sRageTxt]);

    // Full Detailed Skill Description - EXTREMELY CLEAR ON MOBILE (14.5px, #ffffff, semi-bold 600)
    const sDescTxt = scene.add.text(rightColX + 14, skillBoxY + 38, r.skillDesc, {
      fontFamily: FONT_UI,
      fontSize: '14.5px',
      fontStyle: '600',
      color: '#ffffff',
      lineSpacing: 5,
      wordWrap: { width: rightColW - 28, useAdvancedWrap: true }
    }).setOrigin(0, 0);
    detailPopup.add(sDescTxt);

    // Mechanics notes
    let mechNote = '';
    if (r.bossHpPercent) {
      mechNote = `• Sát thương Boss: ${r.effectValue} + ${Math.round(r.bossHpPercent * 100)}% Max HP (Tối đa ${r.maxCapDmg || 500} HP).`;
    } else if (r.effectType === 'auto_match') {
      mechNote = `• Tự động quét và giải phóng ${r.effectValue} cặp ô nan giải nhất trên bàn cờ.`;
    } else if (r.effectType === 'lock_gravity') {
      mechNote = `• Đóng băng mọi hướng trôi dồn của các ô trong ${r.effectValue} giây.`;
    } else if (r.effectType === 'clear_traps') {
      mechNote = `• Quét sạch toàn bộ bẫy nhện và gai trói, tích thêm +1s thời gian mỗi bẫy.`;
    } else if (r.effectType === 'double_reward') {
      mechNote = `• Tăng 100% (x2) điểm số và lượng Tiền Vàng rơi ra trong suốt ${r.effectValue}s.`;
    } else if (r.effectType === 'time_freeze') {
      mechNote = `• Ngưng đọng thời gian đếm ngược trong ${r.effectValue}s, không bị trừ mạng khi nối sai.`;
    }
    if (mechNote) {
      const sMechTxt = scene.add.text(rightColX + 14, skillBoxY + skillBoxH - 26, mechNote, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#38bdf8'
      }).setOrigin(0, 0);
      detailPopup.add(sMechTxt);
    }

    // 3. Shard Collection & Drop Source Box
    const shardBoxY = 46;
    const curTarget = isUnlocked ? (stars >= 5 ? reqShards : nextStarCost) : reqShards;
    const dShardIcon = scene.add.text(rightColX, shardBoxY, '🧩', { fontSize: '15px' }).setOrigin(0, 0.5);

    const dShardTxt = scene.add.text(rightColX + 24, shardBoxY, `Tiến độ mảnh: ${shards} / ${curTarget} Mảnh`, {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: canUnlock ? '#f59e0b' : '#38bdf8'
    }).setOrigin(0, 0.5);

    const dStatusHint = scene.add.text(rightColX + rightColW, shardBoxY, isEquipped ? '✨ Đang trang bị' : (isUnlocked ? 'Đã sở hữu' : `Thiếu ${Math.max(0, reqShards - shards)} mảnh`), {
      fontFamily: FONT_UI,
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: isEquipped ? '#00f5d4' : (canUnlock ? '#f59e0b' : '#94a3b8')
    }).setOrigin(1, 0.5);
    detailPopup.add([dShardIcon, dShardTxt, dStatusHint]);

    // Progress bar
    const dpBarW = rightColW;
    const dpBarH = 8;
    const dpBarY = shardBoxY + 18;
    const dpGfx = scene.add.graphics();
    dpGfx.fillStyle(0x060914, 0.95);
    dpGfx.fillRoundedRect(rightColX, dpBarY - dpBarH / 2, dpBarW, dpBarH, 4);
    dpGfx.lineStyle(1.0, 0x1e293b, 0.8);
    dpGfx.strokeRoundedRect(rightColX, dpBarY - dpBarH / 2, dpBarW, dpBarH, 4);

    const dpRatio = isUnlocked
      ? (stars >= 5 ? 1 : Math.min(1, shards / Math.max(1, nextStarCost)))
      : Math.min(1, shards / Math.max(1, reqShards));

    if (dpRatio > 0) {
      const fillC = canUnlock ? 0xf59e0b : (isUnlocked ? 0x00f5d4 : 0x38bdf8);
      dpGfx.fillStyle(fillC, 1);
      dpGfx.fillRoundedRect(rightColX, dpBarY - dpBarH / 2, Math.max(8, dpBarW * dpRatio), dpBarH, 4);
    }
    detailPopup.add(dpGfx);

    // Drop source hint
    const dropSourceTxt = scene.add.text(rightColX, shardBoxY + 36, `📍 Nguồn rơi: Màn ${r.chapter * 10 - 9} – ${r.chapter * 10} (${r.tierName}) hoặc vượt 3⭐ Trùm ${RelicCodexModal.getRealmName(r.worldId)}.`, {
      fontFamily: FONT_UI,
      fontSize: '11px',
      color: '#cbd5e1'
    }).setOrigin(0, 0);
    detailPopup.add(dropSourceTxt);

    // ------------------------------------------
    // BOTTOM BUTTONS: Action & Close
    // ------------------------------------------
    const btnRowY = dCardH / 2 - 34;

    // Action Button (Equip / Craft / Upgrade)
    const actionBtn = scene.add.container(rightColX + rightColW / 2 - 50, btnRowY);
    const aGfx = scene.add.graphics();
    const aW = 240;
    const aH = 36;

    let aLabel = '';
    let aColor = '#ffffff';

    if (isEquipped) {
      aGfx.fillStyle(0x00f5d4, 1);
      aGfx.fillRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aLabel = `✨ ĐANG TRANG BỊ`;
      aColor = '#081320';
    } else if (isUnlocked) {
      aGfx.fillStyle(0x192238, 0.95);
      aGfx.fillRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aGfx.lineStyle(1.4, 0xffd700, 0.95);
      aGfx.strokeRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aLabel = canUpgrade ? `🔥 NÂNG CẤP (★${stars + 1})` : `⚡ TRANG BỊ THẦN KHÍ`;
      aColor = '#ffd700';
    } else if (canUnlock) {
      aGfx.fillStyle(0xf59e0b, 1);
      aGfx.fillRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aGfx.lineStyle(1.4, 0xffd700, 1);
      aGfx.strokeRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aLabel = `🔥 ĐÚC THẦN KHÍ (${shards}/${reqShards})`;
      aColor = '#1a0f00';
    } else {
      aGfx.fillStyle(0x131728, 0.95);
      aGfx.fillRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aGfx.lineStyle(1, 0x363c54, 0.8);
      aGfx.strokeRoundedRect(-aW / 2, -aH / 2, aW, aH, 10);
      aLabel = `🔒 CẦN THÊM ${reqShards - shards} MẢNH`;
      aColor = '#7d859b';
    }

    const aTxt = scene.add.text(0, 0, aLabel, {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: '900',
      color: aColor
    }).setOrigin(0.5);

    actionBtn.add([aGfx, aTxt]);
    actionBtn.setSize(aW, aH).setInteractive({ useHandCursor: isUnlocked || canUnlock });
    actionBtn.on('pointerdown', () => {
      haptic.medium();
      if (isEquipped) {
        audio.playTick();
      } else if (isUnlocked) {
        save.equipRelic(r.id);
        audio.playSelect();
        showNotice(`✨ Đã trang bị Thần Khí: ${r.name}!`, 0x00f5d4);
        detailPopup.destroy();
        onActionCompleted?.();
      } else if (canUnlock) {
        const success = save.unlockOrUpgradeRelic(r.id);
        if (success) {
          audio.playVictory();
          haptic.heavy();
          showNotice(`🎉 Đúc thành công Thần Khí: ${r.name}!`, 0xffd700);
          detailPopup.destroy();
          onActionCompleted?.();
        }
      } else {
        audio.playError();
        showNotice(`🔒 Cần thêm ${reqShards - shards} mảnh để đúc ${r.name}!`, 0xf59e0b);
      }
    });
    detailPopup.add(actionBtn);

    // Close Button
    const dCloseTextBtn = scene.add.container(leftColX, btnRowY);
    const dctBg = scene.add.graphics();
    dctBg.fillStyle(0xd90429, 0.95);
    dctBg.fillRoundedRect(-55, -18, 110, 36, 10);
    dctBg.lineStyle(1.4, 0xffd700, 0.85);
    dctBg.strokeRoundedRect(-55, -18, 110, 36, 10);
    const dctTxt = scene.add.text(0, 0, 'ĐÓNG', {
      fontFamily: FONT_UI,
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    dCloseTextBtn.add([dctBg, dctTxt]);
    dCloseTextBtn.setSize(110, 36).setInteractive({ useHandCursor: true });
    dCloseTextBtn.on('pointerdown', () => {
      audio.playSelect();
      detailPopup.destroy();
    });
    detailPopup.add(dCloseTextBtn);

    return detailPopup;
  }
}
