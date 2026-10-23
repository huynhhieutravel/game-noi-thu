import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { CharacterRegistry } from './CharacterRegistry';
import { CompanionModal } from './CompanionModal';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';
import levelsData from '../data/levels.json';

interface PrestigeBadge {
  id: string;
  name: string;
  title: string;
  desc: string;
  texture: string;
  tierName: string;
  color: number;
  category: 'combat' | 'skill' | 'destiny';
  categoryName: string;
  categoryIcon: string;
  diamonds: number;
  gold: number;
  actionText: string;
  actionType: 'boss' | 'survival' | 'zen' | 'play' | 'companion' | 'shrine' | 'relics';
}

const PRESTIGE_BADGES: PrestigeBadge[] = [
  // ⚔️ CHIẾN ĐẤU (Combat & Trials)
  {
    id: 'badge_boss_slayer',
    name: 'Trảm Boss Thần Thoại',
    title: 'TRẢM YÊU TRỪ MA',
    desc: 'Tiêu diệt thành công Đại Boss Thần Thoại Bát Kỳ Đại Xà tại Màn 10 hoặc Đấu Trường Boss.',
    texture: 'badge_boss_slayer',
    tierName: 'Huyền Thoại (Boss Slayer)',
    color: 0xff0054,
    category: 'combat',
    categoryName: 'CHIẾN ĐẤU',
    categoryIcon: '⚔️',
    diamonds: 100,
    gold: 5000,
    actionText: '▶ ĐẤU TRƯỜNG BOSS',
    actionType: 'boss'
  },
  {
    id: 'badge_survival_hero',
    name: 'Bất Tử Bão Tuyết',
    title: 'BẤT TỬ BÃO TUYẾT',
    desc: 'Vượt qua thử thách Chế Độ Sinh Tồn (Survival Mode) đạt mốc từ Đợt 15 (Wave 15) trở lên.',
    texture: 'badge_survival_hero',
    tierName: 'Bất Tử (Survival Hero)',
    color: 0x38bdf8,
    category: 'combat',
    categoryName: 'CHIẾN ĐẤU',
    categoryIcon: '⚔️',
    diamonds: 80,
    gold: 4000,
    actionText: '▶ CHẾ ĐỘ SINH TỒN',
    actionType: 'survival'
  },
  {
    id: 'badge_beast_awakening',
    name: 'Thần Thú Thức Tỉnh',
    title: 'THẦN THÚ THỨC TỈNH',
    desc: 'Nâng cấp và tiến hóa bất kỳ Linh Thú Đồng Hành nào đạt Cấp Bậc 3 (Tier 3) trở lên.',
    texture: 'badge_beast_awakening',
    tierName: 'Tối Thượng (Awakened)',
    color: 0xf97316,
    category: 'combat',
    categoryName: 'CHIẾN ĐẤU',
    categoryIcon: '⚔️',
    diamonds: 80,
    gold: 3500,
    actionText: '▶ LINH THÚ ĐỒNG HÀNH',
    actionType: 'companion'
  },

  // ⚡ KỸ NĂNG (Skill & Mastery)
  {
    id: 'badge_zen_master',
    name: 'Thiền Sư Vạn Giới',
    title: 'THIỀN SƯ VẠN GIỚI',
    desc: 'Vượt qua thử thách Chế Độ Thiền Định (Zen Mode) đạt mốc kỷ lục từ 3.000 điểm trở lên.',
    texture: 'badge_zen_master',
    tierName: 'Tuyệt Kỹ (Zen Master)',
    color: 0x00f5d4,
    category: 'skill',
    categoryName: 'KỸ NĂNG',
    categoryIcon: '⚡',
    diamonds: 70,
    gold: 3000,
    actionText: '▶ CHẾ ĐỘ THIỀN ĐỊNH',
    actionType: 'zen'
  },
  {
    id: 'badge_combo_master',
    name: 'Đại Sư Liên Hoàn',
    title: 'ĐẠI SƯ LIÊN HOÀN',
    desc: 'Đạt chuỗi Combo liên hoàn thần tốc từ x10 trở lên trong bất kỳ ván đấu nào.',
    texture: 'badge_combo_master',
    tierName: 'Siêu Việt (Combo Master)',
    color: 0xffd700,
    category: 'skill',
    categoryName: 'KỸ NĂNG',
    categoryIcon: '⚡',
    diamonds: 60,
    gold: 2500,
    actionText: '▶ VÀO TRẬN ĐẤU',
    actionType: 'play'
  },
  {
    id: 'badge_speed_god',
    name: 'Thần Tốc Tận Diệt',
    title: 'THẦN TỐC TẬN DIỆT',
    desc: 'Hoàn thành bất kỳ màn chơi nào dưới 60 giây và đạt xếp hạng Đánh Giá Tuyệt Đỉnh S+.',
    texture: 'badge_speed_god',
    tierName: 'Thần Tốc (Speed Demon)',
    color: 0xe0aaff,
    category: 'skill',
    categoryName: 'KỸ NĂNG',
    categoryIcon: '⚡',
    diamonds: 75,
    gold: 3000,
    actionText: '▶ VÀO TRẬN ĐẤU',
    actionType: 'play'
  },

  // 🌌 VẬN MỆNH (Destiny & Collection)
  {
    id: 'badge_divine_shrine',
    name: 'Đại Phúc Omikuji',
    title: 'ĐẠI PHÚC OMIKUJI',
    desc: 'Cầu nguyện may mắn và rút quẻ Omikuji tại Đền Thần liên tục trong 7 ngày.',
    texture: 'badge_divine_shrine',
    tierName: 'Đại Cát (Divine Fortune)',
    color: 0xff4d6d,
    category: 'destiny',
    categoryName: 'VẬN MỆNH',
    categoryIcon: '🌌',
    diamonds: 100,
    gold: 5000,
    actionText: '▶ QUẺ THẦN ĐỀN',
    actionType: 'shrine'
  },
  {
    id: 'badge_perfect_strategist',
    name: 'Toàn Tri Vạn Giới',
    title: 'TOÀN TRI VẠN GIỚI',
    desc: 'Khám phá và thu thập trọn bộ 10/10 Cổ Vật Thần Khí Thần Thoại Yokai trong Thư Viện.',
    texture: 'badge_perfect_strategist',
    tierName: 'Toàn Tri (Omniscient)',
    color: 0x9d4edd,
    category: 'destiny',
    categoryName: 'VẬN MỆNH',
    categoryIcon: '🌌',
    diamonds: 120,
    gold: 6000,
    actionText: '▶ ĐIỆN THỜ CỔ VẬT',
    actionType: 'relics'
  }
];

export class StageBadgesModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static open(scene: Phaser.Scene, onClose?: () => void): Phaser.GameObjects.Container {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }

    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();
    const save = SaveSystem.getInstance();

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
    backdrop.on('pointerdown', () => closeModal());
    modal.add(backdrop);

    // 2. Full-Screen Landscape Card Frame (1060 x 590)
    const cardW = 1060;
    const cardH = 590;
    const card = scene.add.graphics();

    // Deep Midnight Lacquer Base
    card.fillStyle(0x0a0c18, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // Ornate Japanese Imperial Gold Outer Border
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
    modal.add(card);

    // State
    let activeTab: 'stages_1_5' | 'stages_6_10' | 'prestige' = 'stages_1_5';
    let prestigeCategory: 'all' | 'combat' | 'skill' | 'destiny' = 'all';
    let prestigePage = 0;

    // Content Containers
    const headerContainer = scene.add.container(0, -cardH / 2 + 34);
    const tabsContainer = scene.add.container(0, -cardH / 2 + 76);
    const bodyContainer = scene.add.container(0, 0);
    const footerContainer = scene.add.container(0, cardH / 2 - 28);
    modal.add([headerContainer, tabsContainer, bodyContainer, footerContainer]);

    const closeModal = () => {
      audio.playSelect();
      modal.destroy();
      StageBadgesModal.activeModal = null;
      onClose?.();
    };

    const handleBadgeAction = (actionType: string) => {
      if (actionType === 'boss') {
        scene.scene.start('GameScene', { bossId: 'boss_orochi', lives: 5 });
      } else if (actionType === 'survival') {
        scene.scene.start('GameScene', { isSurvivalMode: true });
      } else if (actionType === 'zen') {
        scene.scene.start('GameScene', { isZenMode: true });
      } else if (actionType === 'play') {
        scene.scene.start('GameScene', { levelNumber: 1 });
      } else if (actionType === 'companion') {
        CompanionModal.open(scene, (newComp: any) => {
          save.setSelectedCompanion(newComp.id);
          audio.playVictory();
          scene.scene.restart();
        });
      } else if (actionType === 'shrine') {
        scene.scene.start('MainMenuScene');
      } else if (actionType === 'relics') {
        if ((scene as any).openFull30RelicsCodex) {
          (scene as any).openFull30RelicsCodex(1);
        } else {
          scene.scene.start('CollectionScene');
        }
      }
    };

    // Close button (Top-Right "✕")
    const closeBtn = scene.add.container(cardW / 2 - 28, -cardH / 2 + 32);
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
    closeBtn.on('pointerdown', () => closeModal());
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
    modal.add(closeBtn);

    const isPrestigeOwned = (bId: string): boolean => {
      return save.hasBadge(bId) || (bId === 'badge_boss_slayer' && (save.isDifficultyCompleted('level_10', 'easy') || save.isAchievementUnlocked('boss_slayer_1')));
    };

    // ==========================================
    // DETAIL POPUP (Hiển thị Chi Tiết Khi Chạm Vào Huy Hiệu)
    // ==========================================
    const openBadgeDetail = (b: any, stageNum: number, stageTitle: string, isOwned: boolean) => {
      audio.playSelect();
      haptic.light();

      const detailPopup = scene.add.container(0, 0).setDepth(600);

      // Dark translucent backdrop
      const dBackdrop = scene.add.graphics();
      dBackdrop.fillStyle(0x000000, 0.88);
      dBackdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
      dBackdrop.setInteractive(
        new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
        Phaser.Geom.Rectangle.Contains
      );
      dBackdrop.on('pointerdown', () => {
        audio.playSelect();
        detailPopup.destroy();
      });
      detailPopup.add(dBackdrop);

      // Detail Card Frame (680 x 430)
      const dCardW = 680;
      const dCardH = 430;
      const dCard = scene.add.graphics();
      dCard.fillStyle(0x090c1a, 0.99);
      dCard.fillRoundedRect(-dCardW / 2, -dCardH / 2, dCardW, dCardH, 18);
      dCard.lineStyle(2.4, 0xffd700, 0.95);
      dCard.strokeRoundedRect(-dCardW / 2, -dCardH / 2, dCardW, dCardH, 18);
      dCard.lineStyle(1.0, 0x38bdf8, 0.4);
      dCard.strokeRoundedRect(-dCardW / 2 + 5, -dCardH / 2 + 5, dCardW - 10, dCardH - 10, 14);

      // Corner flourishes
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

      const isPrestige = !!b.category;
      const headerTitle = isPrestige
        ? `👑 HUY HIỆU TINH ANH & DANH DỰ • ${b.categoryIcon || '✦'} ${b.categoryName || 'TỐI THƯỢNG'}`
        : `⛩️ CHI TIẾT HUY HIỆU CHIẾN TÍCH • MÀN ${stageNum}`;

      const dHeaderTag = scene.add.text(0, -dCardH / 2 + 24, headerTitle, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);
      detailPopup.add(dHeaderTag);

      // Close Button on Detail (✕)
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
      // LEFT SIDE: Big 88x88 Badge Artwork (x = -205)
      // ------------------------------------------
      const leftColX = -205;
      const bTier = b.tier || 1;
      const badgeKey = b.texture || (bTier === 1 ? 'badge_bronze' : (bTier === 2 ? 'badge_silver' : 'badge_gold'));
      const tierColor = isPrestige
        ? (b.color || 0xffd700)
        : (bTier === 1 ? 0xcd7f32 : (bTier === 2 ? 0xa8dadc : 0xffd700));
      const tierHex = isPrestige
        ? `#${(b.color || 0xffd700).toString(16).padStart(6, '0')}`
        : (bTier === 1 ? '#cd7f32' : (bTier === 2 ? '#a8dadc' : '#ffd700'));
      const tierName = b.tierName || (bTier === 1 ? 'Hạng Đồng (Cấp Dễ)' : (bTier === 2 ? 'Hạng Bạc (Cấp Vừa)' : 'Hạng Vàng (Cấp Khó)'));

      // Halo behind badge
      const artHalo = scene.add.graphics();
      artHalo.fillStyle(tierColor, isOwned ? 0.28 : 0.12);
      artHalo.fillCircle(leftColX, -25, 52);
      artHalo.lineStyle(2, tierColor, isOwned ? 0.95 : 0.4);
      artHalo.strokeCircle(leftColX, -25, 52);
      detailPopup.add(artHalo);

      if (scene.textures.exists(badgeKey)) {
        const bigImg = scene.add.image(leftColX, -25, badgeKey).setDisplaySize(88, 88);
        if (!isOwned) bigImg.setAlpha(0.38);
        detailPopup.add(bigImg);

        if (isOwned) {
          scene.tweens.add({
            targets: bigImg,
            scaleX: bigImg.scaleX * 1.06,
            scaleY: bigImg.scaleY * 1.06,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }

      // Status pill under badge
      const statPillW = 145;
      const statPillH = 28;
      const statPill = scene.add.graphics();
      statPill.fillStyle(isOwned ? 0x1b4332 : 0x221d2a, 0.95);
      statPill.fillRoundedRect(leftColX - statPillW / 2, 48, statPillW, statPillH, 8);
      statPill.lineStyle(1.4, isOwned ? 0x52b788 : 0xef4444, 0.85);
      statPill.strokeRoundedRect(leftColX - statPillW / 2, 48, statPillW, statPillH, 8);
      const statTxt = scene.add.text(leftColX, 62, isOwned ? '✅ ĐÃ SỞ HỮU' : '🔒 CHƯA HOÀN THÀNH', {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: isOwned ? '#74c69d' : '#f87171'
      }).setOrigin(0.5);
      detailPopup.add([statPill, statTxt]);

      // ------------------------------------------
      // RIGHT SIDE: Details, Lore & Criteria (x = -80)
      // ------------------------------------------
      const rightX = -80;
      const cleanBadgeTitle = (b.name || b.title || '').replace(/^Huy\s*Hiệu\s*/i, '').trim();
      const bTitle = scene.add.text(rightX, -125, cleanBadgeTitle.toUpperCase(), {
        fontFamily: FONT_DISPLAY,
        fontSize: '18px',
        fontStyle: '900',
        color: tierHex,
        maxLines: 1
      }).setOrigin(0, 0.5);

      const char = b.characterId ? CharacterRegistry.get(b.characterId) : null;
      const charNameStr = isPrestige
        ? `${b.categoryIcon} Danh Mục: ${b.categoryName} • ${b.tierName}`
        : (char ? `Linh thú liên kết: ${char.symbol || '🦊'} ${char.name} (${char.japaneseName || ''})` : `Thử thách: ${b.title || ''}`);
      const charTxt = scene.add.text(rightX, -98, charNameStr, {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: '#e2e8f0'
      }).setOrigin(0, 0.5);

      const tierBadgeTxt = scene.add.text(rightX, -74, `Đẳng Cấp: ${tierName}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffd166'
      }).setOrigin(0, 0.5);

      const locationStr = isPrestige
        ? `Hệ Thống: Bách Khoa Toàn Thư Vạn Giới`
        : `Địa danh: Màn ${stageNum} - ${stageTitle}`;
      const stageInfoTxt = scene.add.text(rightX, -50, locationStr, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0, 0.5);

      // Criteria Box
      const critBoxW = 390;
      const critBoxH = 88;
      const critBox = scene.add.graphics();
      critBox.fillStyle(0x13172e, 0.95);
      critBox.fillRoundedRect(rightX, -30, critBoxW, critBoxH, 10);
      critBox.lineStyle(1.2, 0x2a3258, 0.85);
      critBox.strokeRoundedRect(rightX, -30, critBoxW, critBoxH, 10);

      const critHeader = scene.add.text(rightX + 12, -18, '📋 ĐIỀU KIỆN MỞ KHÓA CHIẾN TÍCH:', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0, 0.5);

      let conditionDesc = b.desc;
      if (!conditionDesc) {
        conditionDesc = bTier === 1
          ? `Vượt qua Màn ${stageNum} ở độ khó DỄ (Easy).`
          : bTier === 2
          ? `Vượt qua Màn ${stageNum} ở độ khó VỪA (Medium) hoặc đạt 2 Sao trở lên.`
          : `Vượt qua Màn ${stageNum} ở độ khó KHÓ (Hard) hoặc hoàn tất xuất sắc 3 Sao!`;
      }

      // Add dynamic progress text for prestige badges
      let progressExtra = '';
      if (b.id === 'badge_boss_slayer') {
        const beat10 = save.isDifficultyCompleted('level_10', 'easy') || save.isAchievementUnlocked('boss_slayer_1');
        progressExtra = beat10 ? ' (Đã diệt Boss Màn 10)' : ' (Chưa diệt Boss Màn 10)';
      } else if (b.id === 'badge_survival_hero') {
        progressExtra = ` (Hiện tại: ${(save.getSurvivalRecord()?.maxWaves || 0)}/15 Đợt)`;
      } else if (b.id === 'badge_beast_awakening') {
        progressExtra = ` (Linh thú chính: Cấp ${save.getCompanionTier(save.getSelectedCompanion())}/3)`;
      } else if (b.id === 'badge_zen_master') {
        progressExtra = ` (Kỷ lục: ${(save.getZenHighScore() || 0).toLocaleString()}/3.000 điểm)`;
      } else if (b.id === 'badge_combo_master') {
        progressExtra = save.isAchievementUnlocked('combo_10') ? ' (Đã đạt x10)' : ' (Chưa đạt x10)';
      } else if (b.id === 'badge_speed_god') {
        progressExtra = save.isAchievementUnlocked('speed_demon') ? ' (Đã đạt S+)' : ' (Chưa đạt)';
      } else if (b.id === 'badge_divine_shrine') {
        progressExtra = ` (Chuỗi hiện tại: ${save.getDailyOmikujiStreak() || 0}/7 ngày)`;
      } else if (b.id === 'badge_perfect_strategist') {
        progressExtra = ` (Đã thu thập: ${save.getCollectedRelicsCount('yokai') || 0}/10 Cổ vật)`;
      }

      const critDesc = scene.add.text(rightX + 12, 14, conditionDesc + progressExtra, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f8fafc',
        wordWrap: { width: critBoxW - 24 },
        lineSpacing: 2
      }).setOrigin(0, 0.5);

      // Reward Capsule Box (if prestige badge)
      const rewardGfx = scene.add.graphics();
      let rewardTxt: Phaser.GameObjects.Text | null = null;
      if (isPrestige && b.diamonds) {
        rewardGfx.fillStyle(0x1a1c30, 0.95);
        rewardGfx.fillRoundedRect(rightX, 66, critBoxW, 30, 8);
        rewardGfx.lineStyle(1.1, 0xd4af37, 0.7);
        rewardGfx.strokeRoundedRect(rightX, 66, critBoxW, 30, 8);

        rewardTxt = scene.add.text(rightX + critBoxW / 2, 81, `🎁 PHẦN THƯỞNG: 💎 +${b.diamonds} Kim Cương • 🪙 +${b.gold.toLocaleString()} Xu Vàng`, {
          fontFamily: FONT_UI,
          fontSize: '11.5px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);
      }

      detailPopup.add([bTitle, charTxt, tierBadgeTxt, stageInfoTxt, critBox, critHeader, critDesc, rewardGfx, ...(rewardTxt ? [rewardTxt] : [])]);

      // Action Buttons at bottom
      const btnY = dCardH / 2 - 36;
      if (isPrestige && !isOwned && b.actionText) {
        // Direct Action Button (Left/Center)
        const dActionBtn = scene.add.container(-85, btnY);
        const daBg = scene.add.graphics();
        daBg.fillStyle(0xd90429, 1);
        daBg.fillRoundedRect(-95, -16, 190, 32, 9);
        daBg.lineStyle(1.4, 0xffd700, 0.95);
        daBg.strokeRoundedRect(-95, -16, 190, 32, 9);
        const daTxt = scene.add.text(0, 0, b.actionText, {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);
        dActionBtn.add([daBg, daTxt]);
        dActionBtn.setSize(190, 32).setInteractive({ useHandCursor: true });
        dActionBtn.on('pointerdown', () => {
          audio.playSelect();
          detailPopup.destroy();
          closeModal();
          handleBadgeAction(b.actionType);
        });
        dActionBtn.on('pointerover', () => {
          daBg.clear();
          daBg.fillStyle(0xef233c, 1);
          daBg.fillRoundedRect(-95, -16, 190, 32, 9);
          daBg.lineStyle(1.6, 0xffe066, 1);
          daBg.strokeRoundedRect(-95, -16, 190, 32, 9);
        });
        dActionBtn.on('pointerout', () => {
          daBg.clear();
          daBg.fillStyle(0xd90429, 1);
          daBg.fillRoundedRect(-95, -16, 190, 32, 9);
          daBg.lineStyle(1.4, 0xffd700, 0.95);
          daBg.strokeRoundedRect(-95, -16, 190, 32, 9);
        });
        detailPopup.add(dActionBtn);

        // Close button (Right)
        const dCloseBtnBottom = scene.add.container(120, btnY);
        const dbBg = scene.add.graphics();
        dbBg.fillStyle(0x242d4a, 1);
        dbBg.fillRoundedRect(-70, -16, 140, 32, 9);
        dbBg.lineStyle(1.2, 0x64748b, 0.8);
        dbBg.strokeRoundedRect(-70, -16, 140, 32, 9);
        const dbTxt = scene.add.text(0, 0, 'ĐÃ HIỂU', {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: '900',
          color: '#cbd5e1'
        }).setOrigin(0.5);
        dCloseBtnBottom.add([dbBg, dbTxt]);
        dCloseBtnBottom.setSize(140, 32).setInteractive({ useHandCursor: true });
        dCloseBtnBottom.on('pointerdown', () => {
          audio.playSelect();
          detailPopup.destroy();
        });
        detailPopup.add(dCloseBtnBottom);
      } else {
        // Single Close Action button
        const dCloseBtnBottom = scene.add.container(0, btnY);
        const dbBg = scene.add.graphics();
        dbBg.fillStyle(0x00b4d8, 1);
        dbBg.fillRoundedRect(-85, -16, 170, 32, 10);
        dbBg.lineStyle(1.4, 0xffd700, 0.9);
        dbBg.strokeRoundedRect(-85, -16, 170, 32, 10);
        const dbTxt = scene.add.text(0, 0, 'ĐÃ HIỂU', {
          fontFamily: FONT_UI,
          fontSize: '12.5px',
          fontStyle: '900',
          color: '#05192d'
        }).setOrigin(0.5);
        dCloseBtnBottom.add([dbBg, dbTxt]);
        dCloseBtnBottom.setSize(170, 32).setInteractive({ useHandCursor: true });
        dCloseBtnBottom.on('pointerdown', () => {
          audio.playSelect();
          detailPopup.destroy();
        });
        detailPopup.add(dCloseBtnBottom);
      }

      modal.add(detailPopup);
    };

    // ==========================================
    // RENDER CONTENT
    // ==========================================
    const renderContent = () => {
      headerContainer.removeAll(true);
      tabsContainer.removeAll(true);
      bodyContainer.removeAll(true);
      footerContainer.removeAll(true);

      save.checkAndSyncPrestigeBadges();

      const prestigeOwnedCount = PRESTIGE_BADGES.filter(p => isPrestigeOwned(p.id)).length;

      // Compute tier counts
      let bronzeOwned = 0;
      let silverOwned = 0;
      let goldOwned = 0;
      (levelsData as any[]).forEach(lvl => {
        (lvl.badgeRewards || []).forEach((b: any) => {
          if (save.hasBadge(b.id)) {
            if (b.tier === 1) bronzeOwned++;
            if (b.tier === 2) silverOwned++;
            if (b.tier === 3) goldOwned++;
          }
        });
      });

      const totalOwnedAll = bronzeOwned + silverOwned + goldOwned + prestigeOwnedCount;
      const totalMaxBadges = 38;
      const pct = Math.min(100, Math.round((totalOwnedAll / totalMaxBadges) * 100));

      // ------------------------------------------
      // 1. HEADER BAR
      // ------------------------------------------
      const emblemBox = scene.add.graphics();
      emblemBox.fillStyle(0x13172c, 0.95);
      emblemBox.fillRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      emblemBox.lineStyle(1.4, 0xd4af37, 0.95);
      emblemBox.strokeRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      const emblemIcon = scene.add.text(-cardW / 2 + 52, 0, '🎖️', { fontSize: '20px' }).setOrigin(0.5);
      headerContainer.add([emblemBox, emblemIcon]);

      const titleTxt = scene.add.text(-cardW / 2 + 82, -8, 'HUY HIỆU CHIẾN TÍCH VƯỢT MÀN', {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const subTitleTxt = scene.add.text(
        -cardW / 2 + 82,
        14,
        `Tổng tiến độ: ${totalOwnedAll}/${totalMaxBadges} Huy Hiệu (${pct}%) • 🥉 Đồng: ${bronzeOwned}/10 • 🥈 Bạc: ${silverOwned}/10 • 🥇 Vàng: ${goldOwned}/10 • 👑 Tinh Anh: ${prestigeOwnedCount}/8`,
        {
          fontFamily: FONT_UI,
          fontSize: '12.5px',
          fontStyle: 'bold',
          color: '#cbd5e1'
        }
      ).setOrigin(0, 0.5);
      headerContainer.add([titleTxt, subTitleTxt]);

      // Progress bar on header right
      const pbW = 210;
      const pbH = 10;
      const pbX = cardW / 2 - 190;
      const pbY = 0;
      const pbBg = scene.add.graphics();
      pbBg.fillStyle(0x14182b, 0.95);
      pbBg.fillRoundedRect(pbX - pbW / 2, pbY - pbH / 2, pbW, pbH, 5);
      pbBg.lineStyle(1, 0x3d456b, 0.8);
      pbBg.strokeRoundedRect(pbX - pbW / 2, pbY - pbH / 2, pbW, pbH, 5);

      const fillW = Math.max(4, Math.round((totalOwnedAll / totalMaxBadges) * pbW));
      const pbFill = scene.add.graphics();
      pbFill.fillStyle(0x00f5d4, 1);
      pbFill.fillRoundedRect(pbX - pbW / 2, pbY - pbH / 2, fillW, pbH, 5);

      const pbTxt = scene.add.text(pbX, pbY - 14, `TIẾN ĐỘ THU THẬP ${pct}%`, {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);
      headerContainer.add([pbBg, pbFill, pbTxt]);

      // ------------------------------------------
      // 2. NAVIGATION TABS BAR
      // ------------------------------------------
      const tabsDef = [
        { id: 'stages_1_5' as const, label: '⛩️ MÀN 1 - 5 (RỪNG TRÚC & QUỶ ĐỒ)', count: '15 Huy Hiệu' },
        { id: 'stages_6_10' as const, label: '🏯 MÀN 6 - 10 (TUYẾT SƠN & ĐẠI XÀ)', count: '15 Huy Hiệu' },
        { id: 'prestige' as const, label: `👑 HUY HIỆU TINH ANH & DANH DỰ (${prestigeOwnedCount}/8)`, count: '8 Danh Hiệu' }
      ];

      const tabW = 318;
      const tabH = 34;
      const tabStartX = -((tabsDef.length * (tabW + 12) - 12) / 2) + tabW / 2;

      tabsDef.forEach((t, tIdx) => {
        const tX = tabStartX + tIdx * (tabW + 12);
        const isActive = activeTab === t.id;

        const tabBtn = scene.add.container(tX, 0);
        const tBg = scene.add.graphics();
        tBg.fillStyle(isActive ? 0x221c3b : 0x111425, 0.95);
        tBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 9);
        tBg.lineStyle(1.4, isActive ? 0x00f5d4 : 0x2e3558, isActive ? 0.95 : 0.6);
        tBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 9);

        const tTxt = scene.add.text(0, 0, t.label, {
          fontFamily: FONT_UI,
          fontSize: '11.5px',
          fontStyle: '900',
          color: isActive ? '#00f5d4' : '#94a3b8'
        }).setOrigin(0.5);

        tabBtn.add([tBg, tTxt]);
        tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
        tabBtn.on('pointerdown', () => {
          if (activeTab !== t.id) {
            audio.playSelect();
            haptic.light();
            activeTab = t.id;
            renderContent();
          }
        });
        tabsContainer.add(tabBtn);
      });

      // ------------------------------------------
      // 3. BODY CONTENT: STAGES OR PRESTIGE
      // ------------------------------------------
      if (activeTab === 'stages_1_5' || activeTab === 'stages_6_10') {
        const stageStart = activeTab === 'stages_1_5' ? 0 : 5;
        const currentStages = (levelsData as any[]).slice(stageStart, stageStart + 5);

        const cardRowW = 996;
        const cardRowH = 72;
        const startY = -140;
        const rowSpacing = 78;

        currentStages.forEach((lvl, sIdx) => {
          const posY = startY + sIdx * rowSpacing;
          const stageCard = scene.add.container(0, posY);

          const badges = lvl.badgeRewards || [];
          const stageOwned = badges.filter((b: any) => save.hasBadge(b.id)).length;
          const isComplete = stageOwned === 3;

          // Stage Row Background
          const rowBg = scene.add.graphics();
          rowBg.fillStyle(isComplete ? 0x17162d : 0x101323, 0.95);
          rowBg.fillRoundedRect(-cardRowW / 2, -cardRowH / 2, cardRowW, cardRowH, 12);
          rowBg.lineStyle(isComplete ? 1.5 : 1.1, isComplete ? 0xffd700 : 0x2b3252, isComplete ? 0.9 : 0.7);
          rowBg.strokeRoundedRect(-cardRowW / 2, -cardRowH / 2, cardRowW, cardRowH, 12);
          stageCard.add(rowBg);

          // Left Stage Title Column (x = -482 to -262)
          const baseTitle = lvl.title.replace(/^Màn \d+:\s*/, '').replace(/\s*\(.*\)/, '');
          const lvlTitleTxt = scene.add.text(-cardRowW / 2 + 18, -12, `⛩️ MÀN ${lvl.levelNumber}: ${baseTitle}`, {
            fontFamily: FONT_UI,
            fontSize: '13.5px',
            fontStyle: '900',
            color: '#ffd700'
          }).setOrigin(0, 0.5);

          const movementNote = lvl.title.match(/\((.*?)\)/)?.[1];
          const statusStr = isComplete ? '⭐ 3/3 HOÀN HẢO' : `★ ${stageOwned}/3 Huy Hiệu`;
          const subTextCombined = movementNote ? `${statusStr} • ${movementNote}` : statusStr;
          const lvlSubTxt = scene.add.text(-cardRowW / 2 + 18, 12, subTextCombined, {
            fontFamily: FONT_UI,
            fontSize: '11px',
            fontStyle: 'bold',
            color: isComplete ? '#00f5d4' : '#94a3b8'
          }).setOrigin(0, 0.5);
          stageCard.add([lvlTitleTxt, lvlSubTxt]);

          // Right 3 Badges side-by-side
          const badgeBoxW = 236;
          const badgeBoxH = 58;
          const badgeCenters = [-135, 115, 365];

          badges.forEach((b: any, bIdx: number) => {
            const isOwned = save.hasBadge(b.id);
            const bX = badgeCenters[bIdx];
            const bContainer = scene.add.container(bX, 0);

            const bTier = b.tier || (bIdx + 1);
            const tierColor = bTier === 1 ? 0xcd7f32 : (bTier === 2 ? 0xa8dadc : 0xffd700);
            const tierHex = bTier === 1 ? '#cd7f32' : (bTier === 2 ? '#a8dadc' : '#ffd700');
            const tierLabel = bTier === 1 ? 'Đồng' : (bTier === 2 ? 'Bạc' : 'Vàng');

            // Badge Pill Background
            const bPill = scene.add.graphics();
            bPill.fillStyle(isOwned ? 0x1b2038 : 0x0c0f1c, 0.95);
            bPill.fillRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);
            bPill.lineStyle(1.3, isOwned ? tierColor : 0x2a3048, isOwned ? 0.9 : 0.6);
            bPill.strokeRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);

            // Large 44x44 Badge Medal
            const medalX = -badgeBoxW / 2 + 30;
            const badgeKey = bIdx === 0 ? 'badge_bronze' : (bIdx === 1 ? 'badge_silver' : 'badge_gold');
            let bImgObj: Phaser.GameObjects.GameObject;

            if (scene.textures.exists(badgeKey)) {
              const img = scene.add.image(medalX, 0, badgeKey).setDisplaySize(44, 44);
              if (!isOwned) img.setAlpha(0.28);
              bImgObj = img;
            } else {
              const char = CharacterRegistry.get(b.characterId);
              bImgObj = scene.add.text(medalX, 0, char?.symbol || '🎖️', { fontSize: '24px' }).setOrigin(0.5);
              if (!isOwned) (bImgObj as Phaser.GameObjects.Text).setAlpha(0.35);
            }

            // Lock overlay if not owned
            const lockIcon = !isOwned ? scene.add.text(medalX + 10, -10, '🔒', { fontSize: '12px' }).setOrigin(0.5) : null;

            // Badge Name (13px bold)
            const cleanBadgeName = (b.name || '').replace(/^Huy\s*Hiệu\s*/i, '').trim();
            const bName = scene.add.text(-badgeBoxW / 2 + 58, -10, cleanBadgeName, {
              fontFamily: FONT_UI,
              fontSize: '13px',
              fontStyle: '900',
              color: isOwned ? tierHex : '#94a3b8'
            }).setOrigin(0, 0.5);

            // Subtitle / Criteria (11.5px bold)
            const bSub = scene.add.text(-badgeBoxW / 2 + 58, 11, isOwned ? `✅ ĐÃ ĐẠT • ${tierLabel}` : `🔒 Cấp ${tierLabel}`, {
              fontFamily: FONT_UI,
              fontSize: '11.5px',
              fontStyle: isOwned ? '900' : 'bold',
              color: isOwned ? '#00f5d4' : '#64748b'
            }).setOrigin(0, 0.5);

            bContainer.add([bPill, bImgObj, ...(lockIcon ? [lockIcon] : []), bName, bSub]);
            bContainer.setSize(badgeBoxW, badgeBoxH).setInteractive({ useHandCursor: true });

            bContainer.on('pointerdown', () => {
              openBadgeDetail(b, lvl.levelNumber, baseTitle, isOwned);
            });
            bContainer.on('pointerover', () => {
              bContainer.setScale(1.03);
              bPill.clear();
              bPill.fillStyle(isOwned ? 0x252c4c : 0x15192d, 1);
              bPill.fillRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);
              bPill.lineStyle(1.8, isOwned ? tierColor : 0x4a547a, 1);
              bPill.strokeRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);
            });
            bContainer.on('pointerout', () => {
              bContainer.setScale(1.0);
              bPill.clear();
              bPill.fillStyle(isOwned ? 0x1b2038 : 0x0c0f1c, 0.95);
              bPill.fillRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);
              bPill.lineStyle(1.3, isOwned ? tierColor : 0x2a3048, isOwned ? 0.9 : 0.6);
              bPill.strokeRoundedRect(-badgeBoxW / 2, -badgeBoxH / 2, badgeBoxW, badgeBoxH, 10);
            });

            stageCard.add(bContainer);
          });

          bodyContainer.add(stageCard);
        });
      } else {
        // Tab: PRESTIGE / SPECIAL BADGES (8 Badges Total)
        // 1. Category Filter Pills (y = -162)
        const categories = [
          { id: 'all' as const, label: '✦ TẤT CẢ (8)' },
          { id: 'combat' as const, label: '⚔️ CHIẾN ĐẤU (3)' },
          { id: 'skill' as const, label: '⚡ KỸ NĂNG (3)' },
          { id: 'destiny' as const, label: '🌌 VẬN MỆNH (2)' }
        ];

        const catW = 160;
        const catH = 28;
        const catSpacing = 12;
        const totalCatW = categories.length * (catW + catSpacing) - catSpacing;
        const startCatX = -totalCatW / 2 + catW / 2;

        categories.forEach((cat, cIdx) => {
          const catX = startCatX + cIdx * (catW + catSpacing);
          const isAct = prestigeCategory === cat.id;

          const catBtn = scene.add.container(catX, -162);
          const cGfx = scene.add.graphics();
          cGfx.fillStyle(isAct ? 0x241d3d : 0x0f1222, 0.95);
          cGfx.fillRoundedRect(-catW / 2, -catH / 2, catW, catH, 8);
          cGfx.lineStyle(1.3, isAct ? 0x00f5d4 : 0x2e3555, isAct ? 0.95 : 0.6);
          cGfx.strokeRoundedRect(-catW / 2, -catH / 2, catW, catH, 8);

          const cTxt = scene.add.text(0, 0, cat.label, {
            fontFamily: FONT_UI,
            fontSize: '11px',
            fontStyle: '900',
            color: isAct ? '#00f5d4' : '#94a3b8'
          }).setOrigin(0.5);

          catBtn.add([cGfx, cTxt]);
          catBtn.setSize(catW, catH).setInteractive({ useHandCursor: true });
          catBtn.on('pointerdown', () => {
            if (prestigeCategory !== cat.id) {
              audio.playSelect();
              haptic.light();
              prestigeCategory = cat.id;
              prestigePage = 0;
              renderContent();
            }
          });
          bodyContainer.add(catBtn);
        });

        // 2. Filter Badges & Paginate
        const filtered = prestigeCategory === 'all'
          ? PRESTIGE_BADGES
          : PRESTIGE_BADGES.filter(p => p.category === prestigeCategory);

        const pageSize = 4;
        const totalPages = Math.ceil(filtered.length / pageSize);
        const currentBadges = filtered.slice(prestigePage * pageSize, (prestigePage + 1) * pageSize);

        const cardPW = 236;
        const cardPH = 328;
        const cardSpacing = 16;
        const count = currentBadges.length;
        const totalRowW = count * (cardPW + cardSpacing) - cardSpacing;
        const startCardX = -totalRowW / 2 + cardPW / 2;

        currentBadges.forEach((p, pIdx) => {
          const isOwned = isPrestigeOwned(p.id);
          const pX = startCardX + pIdx * (cardPW + cardSpacing);
          const pCard = scene.add.container(pX, 22);

          const pcBg = scene.add.graphics();
          pcBg.fillStyle(isOwned ? 0x16152b : 0x0c0e1b, 0.96);
          pcBg.fillRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
          pcBg.lineStyle(isOwned ? 1.8 : 1.1, isOwned ? p.color : 0x2c334d, isOwned ? 0.95 : 0.6);
          pcBg.strokeRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
          pCard.add(pcBg);

          // Category capsule badge
          const capW = 100;
          const capH = 20;
          const capGfx = scene.add.graphics();
          capGfx.fillStyle(isOwned ? 0x281e40 : 0x141829, 0.95);
          capGfx.fillRoundedRect(-capW / 2, -cardPH / 2 + 8, capW, capH, 6);
          capGfx.lineStyle(1.0, isOwned ? p.color : 0x3d4768, 0.8);
          capGfx.strokeRoundedRect(-capW / 2, -cardPH / 2 + 8, capW, capH, 6);
          const capTxt = scene.add.text(0, -cardPH / 2 + 18, `${p.categoryIcon} ${p.categoryName}`, {
            fontFamily: FONT_UI,
            fontSize: '9.5px',
            fontStyle: '900',
            color: isOwned ? '#ffd700' : '#8892b0'
          }).setOrigin(0.5);
          pCard.add([capGfx, capTxt]);

          // Halo & 76x76 Image
          const artY = -cardPH / 2 + 76;
          const pHalo = scene.add.graphics();
          pHalo.fillStyle(p.color, isOwned ? 0.25 : 0.08);
          pHalo.fillCircle(0, artY, 40);
          pHalo.lineStyle(1.8, p.color, isOwned ? 0.9 : 0.3);
          pHalo.strokeCircle(0, artY, 40);
          pCard.add(pHalo);

          if (scene.textures.exists(p.texture)) {
            const pImg = scene.add.image(0, artY, p.texture).setDisplaySize(76, 76);
            if (!isOwned) pImg.setAlpha(0.35);
            pCard.add(pImg);

            if (isOwned) {
              scene.tweens.add({
                targets: pImg,
                scaleX: pImg.scaleX * 1.05,
                scaleY: pImg.scaleY * 1.05,
                duration: 1600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
            }
          }

          if (!isOwned) {
            const lockMedal = scene.add.text(28, artY - 26, '🔒', { fontSize: '13px' }).setOrigin(0.5);
            pCard.add(lockMedal);
          }

          // Titles & Tier
          const pTitle = scene.add.text(0, -cardPH / 2 + 134, p.title, {
            fontFamily: FONT_DISPLAY,
            fontSize: '13.5px',
            fontStyle: '900',
            color: isOwned ? '#ffffff' : '#94a3b8'
          }).setOrigin(0.5);

          const pTier = scene.add.text(0, -cardPH / 2 + 154, p.tierName, {
            fontFamily: FONT_UI,
            fontSize: '10.5px',
            fontStyle: '900',
            color: isOwned ? '#ffd700' : '#64748b'
          }).setOrigin(0.5);

          const pDesc = scene.add.text(0, -cardPH / 2 + 204, p.desc, {
            fontFamily: FONT_UI,
            fontSize: '11px',
            fontStyle: 'bold',
            color: isOwned ? '#cbd5e1' : '#64748b',
            align: 'center',
            wordWrap: { width: cardPW - 30 },
            lineSpacing: 2.5
          }).setOrigin(0.5);

          // Reward pill
          const rewGfx = scene.add.graphics();
          rewGfx.fillStyle(0x131728, 0.9);
          rewGfx.fillRoundedRect(-cardPW / 2 + 16, -cardPH / 2 + 248, cardPW - 32, 22, 6);
          rewGfx.lineStyle(1.0, 0xd4af37, 0.5);
          rewGfx.strokeRoundedRect(-cardPW / 2 + 16, -cardPH / 2 + 248, cardPW - 32, 22, 6);
          const rewTxt = scene.add.text(0, -cardPH / 2 + 259, `💎 +${p.diamonds} • 🪙 +${p.gold.toLocaleString()}`, {
            fontFamily: FONT_UI,
            fontSize: '10px',
            fontStyle: '900',
            color: '#ffd700'
          }).setOrigin(0.5);

          // Status Button
          const pBtnW = cardPW - 36;
          const pBtnH = 30;
          const pBtn = scene.add.container(0, cardPH / 2 - 22);
          const pbGfx = scene.add.graphics();
          pbGfx.fillStyle(isOwned ? 0x1b4332 : 0x1b1f33, 0.95);
          pbGfx.fillRoundedRect(-pBtnW / 2, -pBtnH / 2, pBtnW, pBtnH, 8);
          pbGfx.lineStyle(1.3, isOwned ? 0x52b788 : 0xef4444, 0.85);
          pbGfx.strokeRoundedRect(-pBtnW / 2, -pBtnH / 2, pBtnW, pBtnH, 8);
          const pbLabel = scene.add.text(0, 0, isOwned ? '👑 ĐÃ ĐẠT CHIẾN TÍCH' : '🔒 XEM ĐIỀU KIỆN', {
            fontFamily: FONT_UI,
            fontSize: '10.5px',
            fontStyle: '900',
            color: isOwned ? '#74c69d' : '#f87171'
          }).setOrigin(0.5);
          pBtn.add([pbGfx, pbLabel]);

          pCard.add([pTitle, pTier, pDesc, rewGfx, rewTxt, pBtn]);
          pCard.setSize(cardPW, cardPH).setInteractive({ useHandCursor: true });
          pCard.on('pointerdown', () => {
            openBadgeDetail(p, 0, 'Đấu Trường Danh Dự', isOwned);
          });
          pCard.on('pointerover', () => {
            pCard.setScale(1.02);
            pcBg.clear();
            pcBg.fillStyle(isOwned ? 0x221f3f : 0x15182e, 1);
            pcBg.fillRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
            pcBg.lineStyle(2, isOwned ? p.color : 0x4a547a, 1);
            pcBg.strokeRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
          });
          pCard.on('pointerout', () => {
            pCard.setScale(1.0);
            pcBg.clear();
            pcBg.fillStyle(isOwned ? 0x16152b : 0x0c0e1b, 0.96);
            pcBg.fillRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
            pcBg.lineStyle(isOwned ? 1.8 : 1.1, isOwned ? p.color : 0x2c334d, isOwned ? 0.95 : 0.6);
            pcBg.strokeRoundedRect(-cardPW / 2, -cardPH / 2, cardPW, cardPH, 16);
          });

          bodyContainer.add(pCard);
        });

        // 3. Pagination Controls (if totalPages > 1)
        if (totalPages > 1) {
          const pagContainer = scene.add.container(0, 204);

          // Prev button
          const prevBtn = scene.add.container(-110, 0);
          const prBg = scene.add.graphics();
          const canPrev = prestigePage > 0;
          prBg.fillStyle(canPrev ? 0x181c33 : 0x0b0d18, 0.95);
          prBg.fillRoundedRect(-55, -13, 110, 26, 6);
          prBg.lineStyle(1.1, canPrev ? 0x00f5d4 : 0x252a42, canPrev ? 0.9 : 0.4);
          prBg.strokeRoundedRect(-55, -13, 110, 26, 6);
          const prTxt = scene.add.text(0, 0, '◀ TRANG TRƯỚC', {
            fontFamily: FONT_UI,
            fontSize: '10px',
            fontStyle: '900',
            color: canPrev ? '#00f5d4' : '#475569'
          }).setOrigin(0.5);
          prevBtn.add([prBg, prTxt]);
          if (canPrev) {
            prevBtn.setSize(110, 26).setInteractive({ useHandCursor: true });
            prevBtn.on('pointerdown', () => {
              audio.playSelect();
              haptic.light();
              prestigePage--;
              renderContent();
            });
          }

          // Page text
          const pageTxt = scene.add.text(0, 0, `TRANG ${prestigePage + 1} / ${totalPages}`, {
            fontFamily: FONT_UI,
            fontSize: '11px',
            fontStyle: '900',
            color: '#ffd700'
          }).setOrigin(0.5);

          // Next button
          const nextBtn = scene.add.container(110, 0);
          const nxBg = scene.add.graphics();
          const canNext = prestigePage < totalPages - 1;
          nxBg.fillStyle(canNext ? 0x181c33 : 0x0b0d18, 0.95);
          nxBg.fillRoundedRect(-55, -13, 110, 26, 6);
          nxBg.lineStyle(1.1, canNext ? 0x00f5d4 : 0x252a42, canNext ? 0.9 : 0.4);
          nxBg.strokeRoundedRect(-55, -13, 110, 26, 6);
          const nxTxt = scene.add.text(0, 0, 'TRANG KẾ TIẾP ▶', {
            fontFamily: FONT_UI,
            fontSize: '10px',
            fontStyle: '900',
            color: canNext ? '#00f5d4' : '#475569'
          }).setOrigin(0.5);
          nextBtn.add([nxBg, nxTxt]);
          if (canNext) {
            nextBtn.setSize(110, 26).setInteractive({ useHandCursor: true });
            nextBtn.on('pointerdown', () => {
              audio.playSelect();
              haptic.light();
              prestigePage++;
              renderContent();
            });
          }

          pagContainer.add([prevBtn, pageTxt, nextBtn]);
          bodyContainer.add(pagContainer);
        }
      }

      // ------------------------------------------
      // 4. FOOTER BAR
      // ------------------------------------------
      const tipTxt = scene.add.text(-cardW / 2 + 34, 0, '💡 Nhấn vào bất kỳ huy hiệu nào để xem hình ảnh lớn, truyền thuyết linh thú & điều kiện sở hữu.', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0, 0.5);

      // Return Button on Bottom Right
      const backBtn = scene.add.container(cardW / 2 - 140, 0);
      const bbBg = scene.add.graphics();
      bbBg.fillStyle(0x00b4d8, 1);
      bbBg.fillRoundedRect(-110, -16, 220, 32, 10);
      bbBg.lineStyle(1.4, 0xffd700, 0.9);
      bbBg.strokeRoundedRect(-110, -16, 220, 32, 10);
      const bbTxt = scene.add.text(0, 0, '🌐 VỀ THƯ VIỆN VẠN GIỚI', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#05192d'
      }).setOrigin(0.5);
      backBtn.add([bbBg, bbTxt]);
      backBtn.setSize(220, 32).setInteractive({ useHandCursor: true });
      backBtn.on('pointerdown', () => closeModal());
      backBtn.on('pointerover', () => {
        bbBg.clear();
        bbBg.fillStyle(0x48cae4, 1);
        bbBg.fillRoundedRect(-110, -16, 220, 32, 10);
        bbBg.lineStyle(1.8, 0xffe066, 1);
        bbBg.strokeRoundedRect(-110, -16, 220, 32, 10);
      });
      backBtn.on('pointerout', () => {
        bbBg.clear();
        bbBg.fillStyle(0x00b4d8, 1);
        bbBg.fillRoundedRect(-110, -16, 220, 32, 10);
        bbBg.lineStyle(1.4, 0xffd700, 0.9);
        bbBg.strokeRoundedRect(-110, -16, 220, 32, 10);
      });

      footerContainer.add([tipTxt, backBtn]);
    };

    renderContent();

    // Opening animation (sleek spring entrance)
    modal.setScale(0.92);
    modal.setAlpha(0);
    scene.tweens.add({
      targets: modal,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    return modal;
  }
}
