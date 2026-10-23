import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { formatCurrency, FONT_UI, FONT_DISPLAY } from '../styles/typography';
import { ShopModal } from './ShopModal';

export interface InventoryItemDef {
  id: string;
  name: string;
  title: string;
  category: 'combat' | 'survival' | 'material';
  categoryLabel: string;
  categoryIcon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarityLabel: string;
  rarityColor: number;
  rarityHex: string;
  spriteKey: string;
  icon: string;
  getQty: (save: SaveSystem) => number | string;
  unit: string;
  desc: string;
  effect: string;
  usage: string;
  obtain: string;
  buyable?: {
    type: 'hint' | 'shuffle' | 'bomb';
    count: number;
    costCoins: number;
  };
  actionType: 'buy' | 'play' | 'relics' | 'shrine' | 'shop';
  actionLabel: string;
}

export class ItemsModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  private static readonly ITEMS: InventoryItemDef[] = [
    // ⚔️ ĐẠO CỤ TÁC CHIẾN
    {
      id: 'hint',
      name: 'Bình Gợi Ý (Hint Bottle)',
      title: 'BÌNH GỢI Ý',
      category: 'combat',
      categoryLabel: 'ĐẠO CỤ TÁC CHIẾN',
      categoryIcon: '⚔️',
      rarity: 'rare',
      rarityLabel: 'HIẾM',
      rarityColor: 0x00f5d4,
      rarityHex: '#00f5d4',
      spriteKey: 'item_booster_hint',
      icon: '💡',
      getQty: (save) => save.getBoosters().hint,
      unit: 'bình',
      desc: 'Soi sáng tức thì 1 cặp thẻ Yokai có thể kết nối ngay trên bàn cờ.',
      effect: 'Tìm kiếm tức thì 1 cặp thẻ hợp lệ và hiển thị đường nối hướng dẫn quang học sáng rực rỡ.',
      usage: 'Chạm biểu tượng Bình Gợi Ý ở góc dưới bàn cờ khi ván đấu đang diễn ra.',
      obtain: 'Mua tại Kho / Tiệm Quân Nhu, Thưởng hoàn tất 3 Sao ván đấu, hoặc Quẻ Omikuji.',
      buyable: { type: 'hint', count: 5, costCoins: 2100 },
      actionType: 'play',
      actionLabel: '▶ VÀO TRẬN ĐẤU'
    },
    {
      id: 'shuffle',
      name: 'Quạt Đổi Bảng (Shuffle Fan)',
      title: 'QUẠT ĐỔI BẢNG',
      category: 'combat',
      categoryLabel: 'ĐẠO CỤ TÁC CHIẾN',
      categoryIcon: '⚔️',
      rarity: 'epic',
      rarityLabel: 'SỬ THI',
      rarityColor: 0x9d4edd,
      rarityHex: '#9d4edd',
      spriteKey: 'item_booster_shuffle',
      icon: '🔀',
      getQty: (save) => save.getBoosters().shuffle,
      unit: 'quạt',
      desc: 'Xáo trộn lại toàn bộ bàn cờ khi các cặp thẻ bị phân tán hiểm hóc.',
      effect: 'Tái cấu trúc lại vị trí toàn bộ thẻ trên bàn cờ, mở ra nhiều đường nối thông thoáng mới.',
      usage: 'Chạm nút Đổi Cờ hoặc hệ thống tự động kích hoạt bảo hộ khi bàn cờ không còn đường nối nào.',
      obtain: 'Mua tại Kho / Tiệm Quân Nhu, Thưởng Điểm Danh Hàng Ngày & Vòng Quay May Mắn.',
      buyable: { type: 'shuffle', count: 5, costCoins: 3400 },
      actionType: 'play',
      actionLabel: '▶ VÀO TRẬN ĐẤU'
    },
    {
      id: 'bomb',
      name: 'Búa Sét Trảm Quái (Thunder Hammer)',
      title: 'BÚA SÉT TRẢM QUÁI',
      category: 'combat',
      categoryLabel: 'ĐẠO CỤ TÁC CHIẾN',
      categoryIcon: '⚔️',
      rarity: 'legendary',
      rarityLabel: 'HUYỀN THOẠI',
      rarityColor: 0xff0054,
      rarityHex: '#ff0054',
      spriteKey: 'item_booster_bomb',
      icon: '⚡',
      getQty: (save) => save.getBoosters().bomb,
      unit: 'búa',
      desc: 'Gọi sấm sét tiêu diệt tức thì 1 cặp thẻ bất kỳ trên bàn cờ.',
      effect: 'Thiên lôi oanh tạc tự động triệt tiêu 1 cặp thẻ hiểm hóc nhất mà không cần kiểm tra đường nối.',
      usage: 'Chạm nút Phá Cặp để quét sạch cặp thẻ gai góc đang cản trở đường đi.',
      obtain: 'Mua tại Kho / Tiệm Quân Nhu, Thưởng chiến thắng Đấu Trường Boss Thế Giới.',
      buyable: { type: 'bomb', count: 5, costCoins: 5100 },
      actionType: 'play',
      actionLabel: '▶ VÀO TRẬN ĐẤU'
    },

    // 💖 BẢO BỐI SINH TỒN
    {
      id: 'hourglass',
      name: 'Đồng Hồ Cát (+15s)',
      title: 'ĐỒNG HỒ CÁT THỜI GIAN',
      category: 'survival',
      categoryLabel: 'BẢO BỐI SINH TỒN',
      categoryIcon: '💖',
      rarity: 'epic',
      rarityLabel: 'SỬ THI',
      rarityColor: 0x38bdf8,
      rarityHex: '#38bdf8',
      spriteKey: 'icon_reward_speed',
      icon: '⏳',
      getQty: () => 5,
      unit: 'cái',
      desc: 'Cộng thêm +15 giây sinh tồn khẩn cấp trong màn chơi.',
      effect: 'Tự động nạp thêm 15 giây quý giá vào đồng hồ đếm ngược, giúp bạn lội ngược dòng ngoạn mục.',
      usage: 'Tự động kích hoạt khi kỹ năng Thần Khí Thời Gian phát động hoặc ở chế độ khẩn cấp.',
      obtain: 'Phần thưởng hoàn tất màn chơi Thần Tốc S+ và tiêu diệt Boss Màn 5, Màn 10.',
      actionType: 'play',
      actionLabel: '▶ VÀO TRẬN ĐẤU'
    },
    {
      id: 'elixir',
      name: 'Linh Đan Trường Sinh',
      title: 'LINH ĐAN TRƯỜNG SINH',
      category: 'survival',
      categoryLabel: 'BẢO BỐI SINH TỒN',
      categoryIcon: '💖',
      rarity: 'legendary',
      rarityLabel: 'HUYỀN THOẠI',
      rarityColor: 0xff4d6d,
      rarityHex: '#ff4d6d',
      spriteKey: 'icon_life_heart',
      icon: '❤️',
      getQty: () => 10,
      unit: 'viên',
      desc: 'Hồi phục lại 1 Trái Tim sinh mệnh khi nối sai ô hoặc chạm vạch giới hạn.',
      effect: 'Tạo lá chắn bảo hộ linh hồn, ngăn chặn trạng thái Thất Bại (Game Over) khi cạn mạng.',
      usage: 'Bảo hộ thụ động vĩnh viễn trong mọi màn chơi chiến dịch và Đấu Trường Boss.',
      obtain: 'Ban phước từ Cổ Vật Bất Tử Ankh và Cầu Nguyện Rút Quẻ Thần Đền Omikuji.',
      actionType: 'shrine',
      actionLabel: '▶ RÚT QUẺ THẦN ĐỀN'
    },
    {
      id: 'omikuji_charm',
      name: 'Bùa Bình An Omikuji',
      title: 'BÙA BÌNH AN THẦN ĐẠO',
      category: 'survival',
      categoryLabel: 'BẢO BỐI SINH TỒN',
      categoryIcon: '💖',
      rarity: 'rare',
      rarityLabel: 'HIẾM',
      rarityColor: 0xffd700,
      rarityHex: '#ffd700',
      spriteKey: 'icon_lucky_bag',
      icon: '🧧',
      getQty: (save) => Math.max(save.getDailyOmikujiStreak(), 1),
      unit: 'bùa',
      desc: 'Tăng tỉ lệ xuất hiện Thẻ Thần Tài Vàng và Thẻ Sấm Sét trên bàn cờ.',
      effect: 'Tăng +25% vận may kết nối thẻ may mắn để nhận gấp đôi Xu Vàng và nhân chuỗi Combo.',
      usage: 'Tự động duy trì hiệu ứng theo chuỗi ngày cầu nguyện liên tục tại Đền Thần.',
      obtain: 'Cầu nguyện và rút quẻ may mắn mỗi ngày tại Đền Thần Shinto.',
      actionType: 'shrine',
      actionLabel: '▶ RÚT QUẺ THẦN ĐỀN'
    },

    // 🔮 NGUYÊN LIỆU THẦN KHÍ
    {
      id: 'universal_shard',
      name: 'Mảnh Thần Khí Vạn Năng',
      title: 'MẢNH THẦN KHÍ VẠN NĂNG',
      category: 'material',
      categoryLabel: 'NGUYÊN LIỆU THẦN KHÍ',
      categoryIcon: '🔮',
      rarity: 'epic',
      rarityLabel: 'SỬ THI',
      rarityColor: 0xd946ef,
      rarityHex: '#d946ef',
      spriteKey: 'icon_reward_exp',
      icon: '🔮',
      getQty: (save) => save.getUniversalShards(),
      unit: 'mảnh',
      desc: 'Tinh thạch vạn năng dùng để đúc ghép bất kỳ Cổ Vật Thần Khí nào bị thiếu.',
      effect: 'Thay thế cho mảnh vỡ cổ vật cụ thể trong quá trình Đúc Cổ Vật tại Thư Viện Thần Khí.',
      usage: 'Vào mục Thần Khí Cổ Vật trong Thư Viện để tiến hành đúc ghép bảo vật.',
      obtain: 'Quy đổi từ mảnh cổ vật dư thừa hoặc thưởng Vượt Màn Đỉnh Cao.',
      actionType: 'relics',
      actionLabel: '▶ ĐIỆN THỜ CỔ VẬT'
    },
    {
      id: 'relic_chest',
      name: 'Rương Cổ Vật Thần Thoại',
      title: 'RƯƠNG CỔ VẬT THẦN THOẠI',
      category: 'material',
      categoryLabel: 'NGUYÊN LIỆU THẦN KHÍ',
      categoryIcon: '🔮',
      rarity: 'legendary',
      rarityLabel: 'HUYỀN THOẠI',
      rarityColor: 0xf59e0b,
      rarityHex: '#f59e0b',
      spriteKey: 'chest_diff_hard',
      icon: '📦',
      getQty: () => 3,
      unit: 'rương',
      desc: 'Rương báu hoàng gia chứa mảnh Cổ Vật Thần Khí, Xu Vàng và Kim Cương.',
      effect: 'Mở ra ngẫu nhiên từ 10 - 50 mảnh Cổ Vật Thần Thoại và hàng ngàn Xu Vàng quý hiếm.',
      usage: 'Chạm Mở Rương để thu nạp chiến lợi phẩm thần thoại vào kho báu.',
      obtain: 'Phần thưởng đạt 30★ tối đa trong mỗi Chương thế giới.',
      actionType: 'relics',
      actionLabel: '▶ ĐIỆN THỜ CỔ VẬT'
    }
  ];

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
    let activeCategory: 'all' | 'combat' | 'survival' | 'material' = 'all';
    let selectedItemId: string = 'hint';

    // Content Containers
    const headerContainer = scene.add.container(0, -cardH / 2 + 34);
    const tabsContainer = scene.add.container(0, -cardH / 2 + 76);
    const gridContainer = scene.add.container(-cardW / 2 + 322, 34);
    const inspectorContainer = scene.add.container(cardW / 2 - 200, 34);
    const footerContainer = scene.add.container(0, cardH / 2 - 28);
    const toastContainer = scene.add.container(0, 0).setDepth(650);

    modal.add([headerContainer, tabsContainer, gridContainer, inspectorContainer, footerContainer, toastContainer]);

    const closeModal = () => {
      audio.playSelect();
      modal.destroy();
      ItemsModal.activeModal = null;
      onClose?.();
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

    // Floating Toast Notification
    const showToast = (msg: string, colorHex: string = '#00f5d4') => {
      toastContainer.removeAll(true);
      const tGfx = scene.add.graphics();
      tGfx.fillStyle(0x0d1124, 0.96);
      tGfx.fillRoundedRect(-150, -20, 300, 40, 10);
      tGfx.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(colorHex).color, 0.95);
      tGfx.strokeRoundedRect(-150, -20, 300, 40, 10);

      const tTxt = scene.add.text(0, 0, msg, {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: '900',
        color: colorHex
      }).setOrigin(0.5);

      toastContainer.add([tGfx, tTxt]);
      toastContainer.setPosition(0, -10);
      toastContainer.setAlpha(1);

      scene.tweens.add({
        targets: toastContainer,
        y: -40,
        alpha: 0,
        duration: 1800,
        ease: 'Cubic.easeOut',
        onComplete: () => toastContainer.removeAll(true)
      });
    };

    // ==========================================
    // RENDER HEADER
    // ==========================================
    const renderHeader = () => {
      headerContainer.removeAll(true);

      const emblemBox = scene.add.graphics();
      emblemBox.fillStyle(0x13172c, 0.95);
      emblemBox.fillRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      emblemBox.lineStyle(1.4, 0xd4af37, 0.95);
      emblemBox.strokeRoundedRect(-cardW / 2 + 34, -18, 36, 36, 8);
      const emblemIcon = scene.add.text(-cardW / 2 + 52, 0, '🎒', { fontSize: '20px' }).setOrigin(0.5);
      headerContainer.add([emblemBox, emblemIcon]);

      const titleTxt = scene.add.text(-cardW / 2 + 82, -8, 'KHO VẬT PHẨM & PHÁP BẢO HOÀNG GIA', {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const subTitleTxt = scene.add.text(
        -cardW / 2 + 82,
        14,
        'Hệ thống đạo cụ tác chiến, bảo bối sinh tồn & nguyên liệu thần khí đa vũ trụ',
        {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }
      ).setOrigin(0, 0.5);
      headerContainer.add([titleTxt, subTitleTxt]);

      // Header Right: Live Currency Pills
      // 1. Coins Pill
      const coinPillW = 118;
      const coinPillH = 30;
      const coinX = cardW / 2 - 340;
      const cGfx = scene.add.graphics();
      cGfx.fillStyle(0x13172c, 0.95);
      cGfx.fillRoundedRect(coinX - coinPillW / 2, -coinPillH / 2, coinPillW, coinPillH, 8);
      cGfx.lineStyle(1.2, 0xffd700, 0.85);
      cGfx.strokeRoundedRect(coinX - coinPillW / 2, -coinPillH / 2, coinPillW, coinPillH, 8);
      const cTxt = scene.add.text(coinX, 0, `🪙 ${formatCurrency(save.getCoins())}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      // 2. Diamonds Pill
      const diaPillW = 100;
      const diaPillH = 30;
      const diaX = cardW / 2 - 215;
      const dGfx = scene.add.graphics();
      dGfx.fillStyle(0x13172c, 0.95);
      dGfx.fillRoundedRect(diaX - diaPillW / 2, -diaPillH / 2, diaPillW, diaPillH, 8);
      dGfx.lineStyle(1.2, 0x00f5d4, 0.85);
      dGfx.strokeRoundedRect(diaX - diaPillW / 2, -diaPillH / 2, diaPillW, diaPillH, 8);
      const dTxt = scene.add.text(diaX, 0, `💎 ${save.getDiamonds()}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      // 3. Shards Pill
      const shPillW = 100;
      const shPillH = 30;
      const shX = cardW / 2 - 105;
      const shGfx = scene.add.graphics();
      shGfx.fillStyle(0x13172c, 0.95);
      shGfx.fillRoundedRect(shX - shPillW / 2, -shPillH / 2, shPillW, shPillH, 8);
      shGfx.lineStyle(1.2, 0xd946ef, 0.85);
      shGfx.strokeRoundedRect(shX - shPillW / 2, -shPillH / 2, shPillW, shPillH, 8);
      const shTxt = scene.add.text(shX, 0, `🔮 ${save.getUniversalShards()}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#f0abfc'
      }).setOrigin(0.5);

      headerContainer.add([cGfx, cTxt, dGfx, dTxt, shGfx, shTxt]);
    };

    // ==========================================
    // RENDER CATEGORY TABS
    // ==========================================
    const renderTabs = () => {
      tabsContainer.removeAll(true);

      const tabs = [
        { id: 'all' as const, label: '✦ TẤT CẢ (8)', count: 8 },
        { id: 'combat' as const, label: '⚔️ ĐẠO CỤ TÁC CHIẾN (3)', count: 3 },
        { id: 'survival' as const, label: '💖 BẢO BỐI SINH TỒN (3)', count: 3 },
        { id: 'material' as const, label: '🔮 NGUYÊN LIỆU THẦN KHÍ (2)', count: 2 }
      ];

      const tabW = 236;
      const tabH = 34;
      const tabSpacing = 12;
      const totalW = tabs.length * (tabW + tabSpacing) - tabSpacing;
      const startX = -totalW / 2 + tabW / 2;

      tabs.forEach((t, idx) => {
        const tX = startX + idx * (tabW + tabSpacing);
        const isActive = activeCategory === t.id;

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
          if (activeCategory !== t.id) {
            audio.playSelect();
            haptic.light();
            activeCategory = t.id;
            renderTabs();
            renderGrid();
          }
        });
        tabsContainer.add(tabBtn);
      });
    };

    // ==========================================
    // RENDER ITEMS GRID (LEFT PANEL)
    // ==========================================
    const renderGrid = () => {
      gridContainer.removeAll(true);

      const filteredItems = activeCategory === 'all'
        ? ItemsModal.ITEMS
        : ItemsModal.ITEMS.filter(it => it.category === activeCategory);

      // Ensure selected item is valid within filter
      if (!filteredItems.some(it => it.id === selectedItemId)) {
        selectedItemId = filteredItems[0]?.id || 'hint';
      }

      const cardW = 292;
      const cardH = 88;
      const colX = [-150, 150];
      const rowY = [-120, -22, 76, 174];

      filteredItems.forEach((it, idx) => {
        const cIdx = idx % 2;
        const rIdx = Math.floor(idx / 2);
        const posX = colX[cIdx];
        const posY = rowY[rIdx];

        const isSelected = it.id === selectedItemId;
        const iCard = scene.add.container(posX, posY);

        const cBg = scene.add.graphics();
        cBg.fillStyle(isSelected ? 0x221f3d : 0x111426, 0.96);
        cBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        cBg.lineStyle(isSelected ? 2.0 : 1.2, isSelected ? 0xffd700 : it.rarityColor, isSelected ? 1 : 0.65);
        cBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        iCard.add(cBg);

        if (isSelected) {
          const selRing = scene.add.graphics();
          selRing.lineStyle(1.0, 0x00f5d4, 0.5);
          selRing.strokeRoundedRect(-cardW / 2 + 4, -cardH / 2 + 4, cardW - 8, cardH - 8, 9);
          iCard.add(selRing);
        }

        // Left Icon & Halo
        const iconX = -cardW / 2 + 36;
        const iHalo = scene.add.graphics();
        iHalo.fillStyle(it.rarityColor, isSelected ? 0.28 : 0.12);
        iHalo.fillCircle(iconX, 0, 24);
        iHalo.lineStyle(1.4, it.rarityColor, isSelected ? 0.95 : 0.5);
        iHalo.strokeCircle(iconX, 0, 24);
        iCard.add(iHalo);

        if (scene.textures.exists(it.spriteKey)) {
          const sprite = scene.add.image(iconX, 0, it.spriteKey).setDisplaySize(44, 44);
          iCard.add(sprite);
        } else {
          const iconTxt = scene.add.text(iconX, 0, it.icon, { fontSize: '24px' }).setOrigin(0.5);
          iCard.add(iconTxt);
        }

        // Title
        const titleTxt = scene.add.text(-cardW / 2 + 70, -22, it.title, {
          fontFamily: FONT_UI,
          fontSize: '12.5px',
          fontStyle: '900',
          color: isSelected ? '#ffd700' : '#ffffff'
        }).setOrigin(0, 0.5);

        // Rarity Tag Pill
        const rTag = scene.add.text(-cardW / 2 + 70, -4, `${it.categoryIcon} ${it.rarityLabel}`, {
          fontFamily: FONT_UI,
          fontSize: '10px',
          fontStyle: '900',
          color: it.rarityHex
        }).setOrigin(0, 0.5);

        // Subtitle / Desc
        const subTxt = scene.add.text(-cardW / 2 + 70, 16, it.desc, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: 'bold',
          color: '#94a3b8',
          wordWrap: { width: 145 },
          maxLines: 2
        }).setOrigin(0, 0.5);

        // Quantity Pill Badge in top right
        const qtyVal = it.getQty(save);
        const qPillW = 60;
        const qPillH = 24;
        const qX = cardW / 2 - 38;
        const qY = 0;
        const qGfx = scene.add.graphics();
        qGfx.fillStyle(0x161a30, 0.95);
        qGfx.fillRoundedRect(qX - qPillW / 2, qY - qPillH / 2, qPillW, qPillH, 7);
        qGfx.lineStyle(1.2, 0x00f5d4, 0.8);
        qGfx.strokeRoundedRect(qX - qPillW / 2, qY - qPillH / 2, qPillW, qPillH, 7);

        const qTxt = scene.add.text(qX, qY, `x${qtyVal}`, {
          fontFamily: FONT_UI,
          fontSize: '12.5px',
          fontStyle: '900',
          color: '#00f5d4'
        }).setOrigin(0.5);

        iCard.add([titleTxt, rTag, subTxt, qGfx, qTxt]);
        iCard.setSize(cardW, cardH).setInteractive({ useHandCursor: true });

        iCard.on('pointerdown', () => {
          if (selectedItemId !== it.id) {
            audio.playSelect();
            haptic.light();
            selectedItemId = it.id;
            renderGrid();
            renderInspector();
          }
        });

        iCard.on('pointerover', () => {
          iCard.setScale(1.025);
        });
        iCard.on('pointerout', () => {
          iCard.setScale(1.0);
        });

        gridContainer.add(iCard);
      });

      renderInspector();
    };

    // ==========================================
    // RENDER INSPECTOR PANEL (RIGHT PANEL)
    // ==========================================
    const renderInspector = () => {
      inspectorContainer.removeAll(true);

      const it = ItemsModal.ITEMS.find(item => item.id === selectedItemId) || ItemsModal.ITEMS[0];
      const pW = 360;
      const pH = 405;

      const pBg = scene.add.graphics();
      pBg.fillStyle(0x0e1122, 0.98);
      pBg.fillRoundedRect(-pW / 2, -pH / 2, pW, pH, 16);
      pBg.lineStyle(1.8, it.rarityColor, 0.9);
      pBg.strokeRoundedRect(-pW / 2, -pH / 2, pW, pH, 16);
      pBg.lineStyle(1.0, 0x2b3352, 0.4);
      pBg.strokeRoundedRect(-pW / 2 + 5, -pH / 2 + 5, pW - 10, pH - 10, 12);
      inspectorContainer.add(pBg);

      // Top Artwork & Pulsing Halo
      const artY = -pH / 2 + 60;
      const aHalo = scene.add.graphics();
      aHalo.fillStyle(it.rarityColor, 0.25);
      aHalo.fillCircle(0, artY, 38);
      aHalo.lineStyle(1.8, it.rarityColor, 0.9);
      aHalo.strokeCircle(0, artY, 38);
      inspectorContainer.add(aHalo);

      if (scene.textures.exists(it.spriteKey)) {
        const bigImg = scene.add.image(0, artY, it.spriteKey).setDisplaySize(72, 72);
        inspectorContainer.add(bigImg);

        scene.tweens.add({
          targets: bigImg,
          scaleX: bigImg.scaleX * 1.06,
          scaleY: bigImg.scaleY * 1.06,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else {
        const bigIcon = scene.add.text(0, artY, it.icon, { fontSize: '38px' }).setOrigin(0.5);
        inspectorContainer.add(bigIcon);
      }

      // Title & Category Tag
      const titleTxt = scene.add.text(0, -pH / 2 + 118, it.title, {
        fontFamily: FONT_DISPLAY,
        fontSize: '16px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      const tierTxt = scene.add.text(0, -pH / 2 + 138, `${it.categoryIcon} ${it.categoryLabel} • ${it.rarityLabel}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: it.rarityHex
      }).setOrigin(0.5);

      // Stock Counter Pill
      const curQty = it.getQty(save);
      const stockPillW = 160;
      const stockPillH = 26;
      const stockY = -pH / 2 + 164;
      const stGfx = scene.add.graphics();
      stGfx.fillStyle(0x16233b, 0.95);
      stGfx.fillRoundedRect(-stockPillW / 2, stockY - stockPillH / 2, stockPillW, stockPillH, 7);
      stGfx.lineStyle(1.2, 0x00f5d4, 0.85);
      stGfx.strokeRoundedRect(-stockPillW / 2, stockY - stockPillH / 2, stockPillW, stockPillH, 7);
      const stTxt = scene.add.text(0, stockY, `🎒 Đang có: x${curQty} ${it.unit}`, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      // Effect Box
      const boxW = 328;
      const boxH = 68;
      const boxY = -pH / 2 + 224;
      const eBox = scene.add.graphics();
      eBox.fillStyle(0x13172c, 0.95);
      eBox.fillRoundedRect(-boxW / 2, boxY - boxH / 2, boxW, boxH, 10);
      eBox.lineStyle(1.2, 0x2e3558, 0.8);
      eBox.strokeRoundedRect(-boxW / 2, boxY - boxH / 2, boxW, boxH, 10);

      const eHead = scene.add.text(-boxW / 2 + 10, boxY - boxH / 2 + 10, '⚡ HIỆU QUẢ TÁC CHIẾN:', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0, 0.5);

      const eDesc = scene.add.text(-boxW / 2 + 10, boxY - boxH / 2 + 38, it.effect, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
        wordWrap: { width: boxW - 20 },
        lineSpacing: 2
      }).setOrigin(0, 0.5);

      // How to Obtain Box
      const oBoxH = 50;
      const oBoxY = -pH / 2 + 292;
      const oBox = scene.add.graphics();
      oBox.fillStyle(0x13172c, 0.95);
      oBox.fillRoundedRect(-boxW / 2, oBoxY - oBoxH / 2, boxW, oBoxH, 10);
      oBox.lineStyle(1.2, 0x2e3558, 0.8);
      oBox.strokeRoundedRect(-boxW / 2, oBoxY - oBoxH / 2, boxW, oBoxH, 10);

      const oHead = scene.add.text(-boxW / 2 + 10, oBoxY - oBoxH / 2 + 10, '🎁 NGUỒN GỐC & CÁCH KIẾM:', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const oDesc = scene.add.text(-boxW / 2 + 10, oBoxY - oBoxH / 2 + 30, it.obtain, {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: 'bold',
        color: '#cbd5e1',
        wordWrap: { width: boxW - 20 },
        maxLines: 2
      }).setOrigin(0, 0.5);

      inspectorContainer.add([titleTxt, tierTxt, stGfx, stTxt, eBox, eHead, eDesc, oBox, oHead, oDesc]);

      // Action Buttons Bar
      const actY = pH / 2 - 34;

      if (it.buyable) {
        // Double button: [MUA +5] & [VÀO TRẬN ĐẤU]
        const btnW = 156;
        const btnH = 34;

        // Buy Button
        const buyBtn = scene.add.container(-boxW / 2 + btnW / 2, actY);
        const bBg = scene.add.graphics();
        bBg.fillStyle(0x194532, 0.98);
        bBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        bBg.lineStyle(1.4, 0x52b788, 0.95);
        bBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);

        const bTxt = scene.add.text(0, 0, `➕ MUA +${it.buyable.count} (🪙 ${it.buyable.costCoins.toLocaleString()})`, {
          fontFamily: FONT_UI,
          fontSize: '10.5px',
          fontStyle: '900',
          color: '#ffd700'
        }).setOrigin(0.5);
        buyBtn.add([bBg, bTxt]);
        buyBtn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });

        buyBtn.on('pointerdown', () => {
          if (!it.buyable) return;
          const res = save.buyBoosterWithCoins(it.buyable.type, it.buyable.count, it.buyable.costCoins);
          if (res.success) {
            audio.playVictory();
            haptic.light();
            renderHeader();
            renderGrid();
            showToast(`+${it.buyable.count} ${it.title}!`, '#52b788');
          } else {
            audio.playSelect();
            haptic.error();
            showToast(res.reason || 'Không đủ Xu Vàng!', '#ef4444');
          }
        });
        buyBtn.on('pointerover', () => {
          bBg.clear();
          bBg.fillStyle(0x2d6a4f, 1);
          bBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          bBg.lineStyle(1.8, 0x74c69d, 1);
          bBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });
        buyBtn.on('pointerout', () => {
          bBg.clear();
          bBg.fillStyle(0x194532, 0.98);
          bBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          bBg.lineStyle(1.4, 0x52b788, 0.95);
          bBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });

        // Play Button
        const playBtn = scene.add.container(boxW / 2 - btnW / 2, actY);
        const pBg2 = scene.add.graphics();
        pBg2.fillStyle(0x0077b6, 0.98);
        pBg2.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        pBg2.lineStyle(1.4, 0x00f5d4, 0.95);
        pBg2.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);

        const pTxt = scene.add.text(0, 0, it.actionLabel, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);
        playBtn.add([pBg2, pTxt]);
        playBtn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });

        playBtn.on('pointerdown', () => {
          audio.playSelect();
          closeModal();
          scene.scene.start('GameScene', { levelNumber: 1 });
        });
        playBtn.on('pointerover', () => {
          pBg2.clear();
          pBg2.fillStyle(0x0096c7, 1);
          pBg2.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          pBg2.lineStyle(1.8, 0x48cae4, 1);
          pBg2.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });
        playBtn.on('pointerout', () => {
          pBg2.clear();
          pBg2.fillStyle(0x0077b6, 0.98);
          pBg2.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          pBg2.lineStyle(1.4, 0x00f5d4, 0.95);
          pBg2.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });

        inspectorContainer.add([buyBtn, playBtn]);
      } else {
        // Single Action Button
        const btnW = 328;
        const btnH = 34;
        const actBtn = scene.add.container(0, actY);
        const aBg = scene.add.graphics();
        aBg.fillStyle(0x0077b6, 0.98);
        aBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        aBg.lineStyle(1.4, 0x00f5d4, 0.95);
        aBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);

        const aTxt = scene.add.text(0, 0, it.actionLabel, {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: '900',
          color: '#ffffff'
        }).setOrigin(0.5);
        actBtn.add([aBg, aTxt]);
        actBtn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });

        actBtn.on('pointerdown', () => {
          audio.playSelect();
          closeModal();
          if (it.actionType === 'play') {
            scene.scene.start('GameScene', { levelNumber: 1 });
          } else if (it.actionType === 'shrine') {
            scene.scene.start('MainMenuScene');
          } else if (it.actionType === 'relics') {
            if ((scene as any).openFull30RelicsCodex) {
              (scene as any).openFull30RelicsCodex(1);
            } else {
              scene.scene.start('CollectionScene');
            }
          }
        });
        actBtn.on('pointerover', () => {
          aBg.clear();
          aBg.fillStyle(0x0096c7, 1);
          aBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          aBg.lineStyle(1.8, 0x48cae4, 1);
          aBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });
        actBtn.on('pointerout', () => {
          aBg.clear();
          aBg.fillStyle(0x0077b6, 0.98);
          aBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
          aBg.lineStyle(1.4, 0x00f5d4, 0.95);
          aBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });

        inspectorContainer.add(actBtn);
      }
    };

    // ==========================================
    // RENDER FOOTER
    // ==========================================
    const renderFooter = () => {
      footerContainer.removeAll(true);

      const tipTxt = scene.add.text(-cardW / 2 + 34, 0, '💡 Chọn vật phẩm để xem chi tiết công năng & mua trực tiếp đạo cụ bằng Xu Vàng ngay tại đây.', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0, 0.5);

      // Shortcut to Shop Modal
      const shopBtn = scene.add.container(cardW / 2 - 270, 0);
      const sBg = scene.add.graphics();
      sBg.fillStyle(0x28193d, 0.95);
      sBg.fillRoundedRect(-80, -16, 160, 32, 8);
      sBg.lineStyle(1.2, 0xd946ef, 0.85);
      sBg.strokeRoundedRect(-80, -16, 160, 32, 8);
      const sTxt = scene.add.text(0, 0, '🏮 TIỆM QUÂN NHU', {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#f0abfc'
      }).setOrigin(0.5);
      shopBtn.add([sBg, sTxt]);
      shopBtn.setSize(160, 32).setInteractive({ useHandCursor: true });
      shopBtn.on('pointerdown', () => {
        closeModal();
        ShopModal.open(scene);
      });

      // Close Button
      const backBtn = scene.add.container(cardW / 2 - 100, 0);
      const bbBg = scene.add.graphics();
      bbBg.fillStyle(0x00b4d8, 1);
      bbBg.fillRoundedRect(-70, -16, 140, 32, 8);
      bbBg.lineStyle(1.4, 0xffd700, 0.9);
      bbBg.strokeRoundedRect(-70, -16, 140, 32, 8);
      const bbTxt = scene.add.text(0, 0, 'ĐÃ HIỂU', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#05192d'
      }).setOrigin(0.5);
      backBtn.add([bbBg, bbTxt]);
      backBtn.setSize(140, 32).setInteractive({ useHandCursor: true });
      backBtn.on('pointerdown', () => closeModal());

      footerContainer.add([tipTxt, shopBtn, backBtn]);
    };

    // Render Initial State
    renderHeader();
    renderTabs();
    renderGrid();
    renderFooter();

    // Opening animation
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
