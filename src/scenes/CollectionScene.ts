import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions, setupRetinaCamera } from '../constants';
import { CharacterRegistry } from '../game/CharacterRegistry';
import { CompanionManager, COMPANIONS } from '../game/CompanionManager';
import { CompanionModal } from '../game/CompanionModal';
import { TextureGenerator } from '../game/TextureGenerator';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { CharacterData, ElementType, Rarity } from '../types';
import levelsData from '../data/levels.json';
import bossesData from '../data/bosses.json';
import { RelicManager } from '../game/RelicManager';
import { RelicCodexModal } from '../game/RelicCodexModal';
import { LevelManager } from '../game/LevelManager';
import { formatCurrency, FONT_UI, FONT_DISPLAY } from '../styles/typography';

export class CollectionScene extends Phaser.Scene {
  private audio!: AudioSystem;
  private save!: SaveSystem;
  private modalContainer: Phaser.GameObjects.Container | null = null;

  public readonly REALMS_CONFIG: Record<string, {
    id: string;
    icon: string;
    shortLabel: string;
    name: string;
    kanji: string;
    sub: string;
    chapterNum: number;
    startLevel: number;
    endLevel: number;
    collections: string[];
    themeColor: number;
    accentColor: string;
    subChapters: { name: string; sub: string }[];
  }> = {
    all: {
      id: 'all',
      icon: '🌐',
      shortLabel: 'TẤT CẢ',
      name: 'Bách Khoa Vạn Giới',
      kanji: '万界図鑑',
      sub: 'Toàn Thư 10 Thế Giới • 495 Sinh Linh',
      chapterNum: 0,
      startLevel: 1,
      endLevel: 100,
      collections: ['yokai', 'egypt', 'greece', 'wuxia', 'korea', 'india', 'sea', 'pirate', 'underwater', 'dinosaur', 'monster', 'fantasy', 'space', 'robot', 'animal', 'plant'],
      themeColor: 0xd90429,
      accentColor: '#ffd700',
      subChapters: [
        { name: 'Nhật Bản • Bách Quỷ', sub: 'Màn 1 - 10' },
        { name: 'Ai Cập • Sa Mạc & Nile', sub: 'Màn 11 - 20' },
        { name: 'Hy Lạp • Đỉnh Olympus', sub: 'Màn 21 - 30' },
        { name: 'Tam Giới • Tiên Ma Á Đông', sub: 'Màn 31 - 40' },
        { name: 'Nam Á • Sử Thi Sông Hằng', sub: 'Màn 41 - 50' },
        { name: 'Biển Cả • Hải Tặc & Thủy Cung', sub: 'Màn 51 - 60' },
        { name: 'Tiền Sử • Hỏa Diệm Khủng Long', sub: 'Màn 61 - 70' },
        { name: 'Tương Lai • Hạm Đội Cơ Giáp', sub: 'Màn 71 - 80' },
        { name: 'Hỗn Độn • Đại Loạn Đấu', sub: 'Màn 81 - 90' },
        { name: 'Tối Thượng • 16 Cự Trùm', sub: 'Màn 91 - 100' }
      ]
    },
    yokai: {
      id: 'yokai',
      icon: '⛩️',
      shortLabel: 'NHẬT BẢN',
      name: 'Nhật Bản • Bách Quỷ Khởi Nguyên',
      kanji: '百鬼図鑑',
      sub: 'Khởi Nguyên Huyền Bí Xứ Phù Tang (108 Yêu Quái)',
      chapterNum: 1,
      startLevel: 1,
      endLevel: 10,
      collections: ['yokai'],
      themeColor: 0xd90429,
      accentColor: '#ffd700',
      subChapters: [
        { name: 'LINH GIỚI', sub: 'Classic Spirits' },
        { name: 'THỦY QUÁI', sub: 'Ocean Yokai' },
        { name: 'DẠ QUỶ', sub: 'Night Spirits' },
        { name: 'RỪNG THIÊNG', sub: 'Forest Spirits' },
        { name: 'BÁCH QUỶ', sub: 'Folklore Guardians' },
        { name: 'ĐA NHÃN', sub: 'Mystic Eyes' },
        { name: 'CỔ VẬT', sub: 'Tsukumogami' },
        { name: 'THẦN THÚ', sub: 'Mythical Beasts' },
        { name: 'HUYỄN BIẾN', sub: 'Mystic Tricksters' },
        { name: 'DỊ VĂN ĐÔ THỊ', sub: 'Urban Legends' },
        { name: 'HỎA VŨ', sub: 'Elemental Flames' },
        { name: 'BÁ VƯƠNG', sub: 'Supreme Lords & Bosses' }
      ]
    },
    egypt: {
      id: 'egypt',
      icon: '🏺',
      shortLabel: 'AI CẬP',
      name: 'Ai Cập • Sa Mạc & Sông Nile',
      kanji: 'エジプト神話',
      sub: 'Chư Thần Sông Nile & Sa Mạc Cổ Đại (90 Sinh Linh)',
      chapterNum: 2,
      startLevel: 11,
      endLevel: 20,
      collections: ['egypt', 'animal'],
      themeColor: 0xe76f51,
      accentColor: '#f4a261',
      subChapters: [
        { name: 'SÔNG NILE', sub: 'Nile Deities' },
        { name: 'VŨ TRỤ & TRÍ TUỆ', sub: 'Cosmos & Wisdom' },
        { name: 'MINH GIỚI', sub: 'Underworld & Eternity' },
        { name: 'THẦN THÚ AI CẬP', sub: 'Mythic Guardians' },
        { name: 'SA MẠC SAHARA', sub: 'Desert Spirits' },
        { name: 'THẢO NGUYÊN SAVANNA', sub: 'African Savanna' },
        { name: 'THÚ CƯNG LINH THIÊNG', sub: 'Sacred Pets' },
        { name: 'NÔNG TRẠI CHÂU PHI', sub: 'Happy Delta Farm' },
        { name: 'HOANG DÃ NGUYÊN SINH', sub: 'Wild Wilderness' }
      ]
    },
    greece: {
      id: 'greece',
      icon: '🏛️',
      shortLabel: 'HY LẠP',
      name: 'Hy Lạp • Đỉnh Núi Olympus',
      kanji: 'ギリシャ神話',
      sub: 'Lôi Đình Chư Thần & Kỳ Thú Thần Thoại (63 Kỳ Thú)',
      chapterNum: 3,
      startLevel: 21,
      endLevel: 30,
      collections: ['greece', 'fantasy'],
      themeColor: 0x3a86ff,
      accentColor: '#ffd166',
      subChapters: [
        { name: 'THỜI ĐẠI TITAN', sub: 'Titans & Primordial' },
        { name: 'ANH HÙNG SỬ THI', sub: 'Heroes & Legends' },
        { name: 'CHƯ THẦN OLYMPUS', sub: 'Olympian Deities' },
        { name: 'QUÁI THÚ THẦN THOẠI', sub: 'Mythical Monsters' },
        { name: 'MINH GIỚI & ĐỊNH MỆNH', sub: 'Fate & Tartarus' },
        { name: 'ĐỘI QUÂN HOÀNG GIA', sub: 'Royal Crusaders' },
        { name: 'HUYỀN THOẠI VIỄN CHINH', sub: 'Mythic Crusade' }
      ]
    },
    wuxia: {
      id: 'wuxia',
      icon: '🗡️',
      shortLabel: 'TAM GIỚI',
      name: 'Tam Giới • Tiên Ma Á Đông',
      kanji: '仙侠神话',
      sub: 'Phi Kiếm Tiên Hiệp & Phong Tục Joseon (36 Tiên Ma)',
      chapterNum: 4,
      startLevel: 31,
      endLevel: 40,
      collections: ['wuxia', 'korea'],
      themeColor: 0xd00000,
      accentColor: '#ffb703',
      subChapters: [
        { name: 'PHONG VÂN GIANG HỒ', sub: 'Jianghu Legends' },
        { name: 'TIÊN CẢNH DIỆU PHÁP', sub: 'Celestial Realm' },
        { name: 'PHONG TỤC DÂN GIAN', sub: 'Folklore Customs' },
        { name: 'THẦN THÚ & TIÊN GIỚI', sub: 'Mythic Deities' }
      ]
    },
    india: {
      id: 'india',
      icon: '🕉️',
      shortLabel: 'NAM Á',
      name: 'Nam Á • Sử Thi Sông Hằng',
      kanji: 'भारतीय पौराणिक',
      sub: 'Sử Thi Ramayana & Tinh Linh Rừng Thiêng (36 Linh Thần)',
      chapterNum: 5,
      startLevel: 41,
      endLevel: 50,
      collections: ['india', 'plant'],
      themeColor: 0xfb5607,
      accentColor: '#ffd166',
      subChapters: [
        { name: 'CHƯ THẦN & LINH THÚ', sub: 'Divine Deities' },
        { name: 'LỄ HỘI ÁNH SÁNG', sub: 'Sacred Festivals' },
        { name: 'HOA THƠM & TRÁI NGỌT', sub: 'Blossom Garden' },
        { name: 'KỲ HOA & THẦN RỪNG', sub: 'Mystic Flora' }
      ]
    },
    sea: {
      id: 'sea',
      icon: '⚓',
      shortLabel: 'BIỂN CẢ',
      name: 'Vùng Biển Chết • Hải Tặc & Thủy Cung',
      kanji: '海底王国',
      sub: 'Hạm Đội Bóng Ma & Vực Thẳm Đại Dương (90 Thủy Thú)',
      chapterNum: 6,
      startLevel: 51,
      endLevel: 60,
      collections: ['pirate', 'underwater', 'sea'],
      themeColor: 0x0077b6,
      accentColor: '#4cc9f0',
      subChapters: [
        { name: 'BĂNG HẢI TẶC NẮNG VÀNG', sub: 'Jolly Pirates' },
        { name: 'LỜI NGUYỀN BIỂN SÂU', sub: 'Cursed Depths' },
        { name: 'HOÀNG TRIỀU THỦY CUNG', sub: 'Royal Court' },
        { name: 'LỄ HỘI SAN HÔ', sub: 'Coral Carnival' },
        { name: 'HỘ PHÁP CỔ ĐẠI', sub: 'Ancient Guardians' },
        { name: 'HẢI LƯU THẦN TỐC', sub: 'Swift Currents' },
        { name: 'KỲ QUAN PHÁT QUANG', sub: 'Luminous Abyss' },
        { name: 'ĐẾ VƯƠNG BIỂN SÂU', sub: 'Abyssal Sovereigns' },
        { name: 'LINH XÀ NHIỆT ĐỚI', sub: 'Tropical Serpents' }
      ]
    },
    dinosaur: {
      id: 'dinosaur',
      icon: '🦖',
      shortLabel: 'TIỀN SỬ',
      name: 'Tiền Sử • Hỏa Diệm Khủng Long',
      kanji: '恐竜ワールド',
      sub: 'Bạo Chúa T-Rex & Cự Quái Nguyên Thủy (36 Khủng Long)',
      chapterNum: 7,
      startLevel: 61,
      endLevel: 70,
      collections: ['dinosaur', 'monster'],
      themeColor: 0x52b788,
      accentColor: '#ffd166',
      subChapters: [
        { name: 'THUNG LŨNG JURA', sub: 'Jurassic Valley' },
        { name: 'HỎA SƠN & BĂNG HÀ', sub: 'Volcanic & Ice Age' },
        { name: 'HẦM NGỤC TÍ HON', sub: 'Playful Dungeon' },
        { name: 'THÂM UYÊN HẮC ÁM', sub: 'Abyssal Relics' }
      ]
    },
    space: {
      id: 'space',
      icon: '🌌',
      shortLabel: 'TƯƠNG LAI',
      name: 'Tương Lai • Hạm Đội Cơ Giáp',
      kanji: '未来宇宙',
      sub: 'Vũ Trụ Vô Cực & Binh Đoàn Robot (36 Cơ Giáp)',
      chapterNum: 8,
      startLevel: 71,
      endLevel: 80,
      collections: ['space', 'robot'],
      themeColor: 0x7209b7,
      accentColor: '#4cc9f0',
      subChapters: [
        { name: 'TRẠM THÁM HIỂM', sub: 'Space Station' },
        { name: 'TINH VÂN HUYỀN BÍ', sub: 'Nebula Wonders' },
        { name: 'ĐỘI THỢ MÁY NHÍ', sub: 'Workshop Crew' },
        { name: 'DÂY CHUYỀN TỰ ĐỘNG', sub: 'Heavy Assembly' }
      ]
    },
    chaos: {
      id: 'chaos',
      icon: '🌀',
      shortLabel: 'HỖN ĐỘN',
      name: 'Hỗn Độn • Đại Loạn Đấu Vạn Giới',
      kanji: '混沌の境',
      sub: 'Vết Nứt Đa Chiều & Cuộc Chiến Xuyên Không (Quái Thú Đa Vũ Trụ)',
      chapterNum: 9,
      startLevel: 81,
      endLevel: 90,
      collections: ['monster', 'fantasy', 'space', 'egypt', 'greece', 'yokai'],
      themeColor: 0x9b5de5,
      accentColor: '#f15bb5',
      subChapters: [
        { name: 'VẾT NỨT ĐA CHIỀU', sub: 'Dimension Rift' },
        { name: 'MA THÚ NGUYÊN SINH', sub: 'Primordial Fiends' },
        { name: 'TINH ANH HẮC ÁM', sub: 'Dark Elite' },
        { name: 'CUỘC CHIẾN VÔ TẬN', sub: 'Eternal Clash' }
      ]
    },
    bosses: {
      id: 'bosses',
      icon: '👑',
      shortLabel: 'TỐI THƯỢNG',
      name: 'Tối Thượng • 16 Cự Trùm Tối Cao',
      kanji: '最高覇王',
      sub: 'Vương Toạ Thần Thoại & Hộ Vệ Tối Cao (16 Đại Trùm)',
      chapterNum: 10,
      startLevel: 91,
      endLevel: 100,
      collections: ['all'],
      themeColor: 0xffd166,
      accentColor: '#ffffff',
      subChapters: [
        { name: 'BÁT ĐẠI MA THẦN', sub: 'Trùm Màn 1 - 50' },
        { name: 'BÁT ĐẠI TỐI THƯỢNG', sub: 'Trùm Màn 51 - 100' }
      ]
    }
  };

  public currentRealmId: string = 'all';
  public currentTab: number = 0;
  private currentSidebarTab: string = 'yokai_library';

  // Containers
  private sidebarContainer!: Phaser.GameObjects.Container;
  private filterBarContainer!: Phaser.GameObjects.Container;
  private progressContainer!: Phaser.GameObjects.Container;
  private chapterNavContainer!: Phaser.GameObjects.Container;
  private gridContainer!: Phaser.GameObjects.Container;

  // Header Elements
  private mainTitleText!: Phaser.GameObjects.Text;
  private subTitleText!: Phaser.GameObjects.Text;

  constructor() {
    super('CollectionScene');
  }

  public init(data?: { realmId?: string; themeId?: string }): void {
    const targetRealm = (data && (data.realmId || data.themeId)) || 'all';
    if (this.REALMS_CONFIG[targetRealm]) {
      this.currentRealmId = targetRealm;
    } else {
      this.currentRealmId = 'all';
    }
    this.currentTab = 0;
    this.currentSidebarTab = 'yokai_library';
  }

  public create(): void {
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    this.audio = AudioSystem.getInstance();
    this.save = SaveSystem.getInstance();
    const save = this.save.getData();

    // 1. Fullscreen Cinematic Night Torii Background (Edge-to-Edge)
    const { width: screenW, offsetX } = getScreenDimensions();
    if (this.textures.exists('bg_main_torii')) {
      const bgImg = this.add.image(GAME_WIDTH / 2, height / 2, 'bg_main_torii');
      bgImg.setDisplaySize(screenW, height);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x181424, 0x181424, 0x0a0b12, 0x0a0b12, 1);
      bg.fillRect(-offsetX, 0, screenW, height);
    }

    // Atmospheric Vignette Overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x06050e, 0.45);
    vignette.fillRect(-offsetX, 0, screenW, height);

    // Subtle dark glass backing for content area
    vignette.fillStyle(0x090715, 0.4);
    vignette.fillRoundedRect(175, 70, 885, 590, 20);

    // 2. Top Header Bar
    this.createHeaderBar(width, save);

    // 3. Left Sidebar (Navigation Tabs)
    this.sidebarContainer = this.add.container(0, 0);
    this.renderSidebar();

    // 4. Realm / World Filter Pills Row (Horizontal Category Chips)
    this.filterBarContainer = this.add.container(0, 0);
    this.renderFilterBar();

    // 5. Collection Progress Bar Row
    this.progressContainer = this.add.container(0, 0);
    this.renderProgressCard();

    // 6. Chapter Navigation & Quick Jump Pills
    this.chapterNavContainer = this.add.container(0, 0);
    this.renderChapterNav();

    // 7. Grid of 10 Character Cards (2 rows x 5 columns)
    this.gridContainer = this.add.container(0, 0);
    this.renderCurrentTabGrid();
  }

  /**
   * Top Header Bar: Back Button, Grand Title & Top Status Pills
   */
  private createHeaderBar(width: number, save: any): void {
    // 1. Left Back Button: [ ⬅ Quay lại ]
    const backBtn = this.add.container(80, 28);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x131124, 0.88);
    backBg.fillRoundedRect(-55, -16, 110, 32, 16);
    backBg.lineStyle(1.5, 0x495057, 0.8);
    backBg.strokeRoundedRect(-55, -16, 110, 32, 16);

    const backTxt = this.add.text(0, 0, '⬅ Quay lại', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.add([backBg, backTxt]);
    backBtn.setSize(110, 32).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.start('MainMenuScene');
    });

    backBtn.on('pointerover', () => {
      this.tweens.add({ targets: backBtn, scale: 1.05, duration: 80 });
      backBg.lineStyle(1.5, 0x00f5d4, 1);
      backBg.strokeRoundedRect(-55, -16, 110, 32, 16);
    });

    backBtn.on('pointerout', () => {
      this.tweens.add({ targets: backBtn, scale: 1.0, duration: 80 });
      backBg.lineStyle(1.5, 0x495057, 0.8);
      backBg.strokeRoundedRect(-55, -16, 110, 32, 16);
    });

    // 2. Grand Calligraphic Center Title
    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    const titleY = 24;

    this.mainTitleText = this.add.text(width / 2, titleY, realm.name, {
      fontFamily: FONT_DISPLAY,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#c1121f',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#e63946',
        blur: 14,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Decorative Subtitle
    const subStr = realm.id === 'all'
      ? '✦  🌸  万界図鑑 • TOÀN THƯ SINH LINH VẠN GIỚI  🌸  ✦'
      : `✦  🌸  ${realm.kanji}  •  ${realm.sub}  🌸  ✦`;

    this.subTitleText = this.add.text(width / 2, titleY + 22, subStr, {
      fontFamily: FONT_DISPLAY,
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#ffccd5'
    }).setOrigin(0.5);

    // 3. Right Status Bar Elements
    // Exit / Home Button
    const homeBtn = this.add.container(width - 36, 28);
    const homeBg = this.add.graphics();
    homeBg.fillStyle(0x131124, 0.88);
    homeBg.fillCircle(0, 0, 16);
    homeBg.lineStyle(1.5, 0x6c757d, 0.8);
    homeBg.strokeCircle(0, 0, 16);

    const homeTxt = this.add.text(0, -1, '🏠', { fontSize: '15px' }).setOrigin(0.5);
    homeBtn.add([homeBg, homeTxt]);
    homeBtn.setSize(32, 32).setInteractive({ useHandCursor: true });

    homeBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.scene.start('MainMenuScene');
    });

    // Stars Pill: [ ⭐ 6/30 ]
    const starW = 85;
    const starX = width - 110;
    const starsBg = this.add.graphics();
    starsBg.fillStyle(0x131124, 0.88);
    starsBg.fillRoundedRect(starX - starW / 2, 12, starW, 32, 16);
    starsBg.lineStyle(1.2, 0xffb703, 0.8);
    starsBg.strokeRoundedRect(starX - starW / 2, 12, starW, 32, 16);

    this.add.text(starX, 28, `⭐ ${save.stars}/30`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Coins Pill: [ 💰 620 + ]
    const coinW = 108;
    const coinX = width - 215;
    const coinsBg = this.add.graphics();
    coinsBg.fillStyle(0x131124, 0.88);
    coinsBg.fillRoundedRect(coinX - coinW / 2, 12, coinW, 32, 16);
    coinsBg.lineStyle(1.2, 0xffd166, 0.8);
    coinsBg.strokeRoundedRect(coinX - coinW / 2, 12, coinW, 32, 16);

    this.add.text(coinX - 8, 28, `💰 ${formatCurrency(save.coins)}`, {
      fontFamily: FONT_UI,
      fontSize: '13.5px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const plusCircle = this.add.graphics();
    plusCircle.fillStyle(0x272346, 0.9);
    plusCircle.fillCircle(coinX + 34, 28, 8);
    this.add.text(coinX + 34, 27, '+', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Mascot Avatar Circle
    const avX = width - 285;
    const avRing = this.add.graphics();
    avRing.lineStyle(2, 0xd90429, 0.9);
    avRing.strokeCircle(avX, 28, 16);

    if (this.textures.exists('avatar_inari')) {
      const avImg = this.add.image(avX, 28, 'avatar_inari');
      avImg.setDisplaySize(30, 30);
    } else {
      this.add.text(avX, 28, '🦊', { fontSize: '18px' }).setOrigin(0.5);
    }
  }

  /**
   * Dynamically update title and subtitle when realm changes
   */
  private updateHeaderTitle(): void {
    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    if (!this.mainTitleText || !this.subTitleText) return;

    this.mainTitleText.setText(realm.name);
    const subStr = realm.id === 'all'
      ? '✦  🌸  万界図鑑 • TOÀN THƯ SINH LINH VẠN GIỚI  🌸  ✦'
      : `✦  🌸  ${realm.kanji}  •  ${realm.sub}  🌸  ✦`;
    this.subTitleText.setText(subStr);
  }

  /**
   * Left Sidebar Navigation
   */
  private renderSidebar(): void {
    this.sidebarContainer.removeAll(true);

    const tabs = [
      { id: 'yokai_library', icon: '🌐', label: 'Thư Viện Vạn Giới' },
      { id: 'relics', icon: '🏺', label: 'Thần Khí Cổ Vật' },
      { id: 'badges', icon: '🎖️', label: 'Huy Hiệu Màn' },
      { id: 'companions', icon: '🦊', label: 'Linh Thú' },
      { id: 'items', icon: '🎒', label: 'Vật Phẩm' },
      { id: 'story', icon: '📖', label: 'Cốt Truyện' },
      { id: 'achievements', icon: '🏆', label: 'Thành Tựu' }
    ];

    const startY = 145;
    const tabSpacing = 44;
    const tabW = 146;
    const tabH = 38;
    const tabX = 95;

    tabs.forEach((tabItem, idx) => {
      const posY = startY + idx * tabSpacing;
      const isAct = tabItem.id === this.currentSidebarTab;

      const tabBtn = this.add.container(tabX, posY);
      const bg = this.add.graphics();

      if (isAct) {
        bg.fillStyle(0xd90429, 0.95);
        bg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);
        bg.lineStyle(1.8, 0xffd166, 0.95);
        bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);

        bg.fillStyle(0xffd700, 1);
        bg.fillCircle(tabW / 2 - 10, 0, 3.5);
      } else {
        bg.fillStyle(0x131124, 0.85);
        bg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);
        bg.lineStyle(1.2, 0x3d3a54, 0.65);
        bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);
      }

      const iconTxt = this.add.text(-tabW / 2 + 10, 0, tabItem.icon, {
        fontSize: '17px'
      }).setOrigin(0, 0.5);

      const labelTxt = this.add.text(-tabW / 2 + 32, 0, tabItem.label, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12.5px',
        fontStyle: '900',
        color: isAct ? '#ffffff' : '#ced4da'
      }).setOrigin(0, 0.5);

      tabBtn.add([bg, iconTxt, labelTxt]);
      tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });

      tabBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.onSidebarTabClick(tabItem.id);
      });

      tabBtn.on('pointerover', () => {
        if (!isAct) {
          this.tweens.add({ targets: tabBtn, scale: 1.03, duration: 80 });
          bg.lineStyle(1.5, 0x00f5d4, 0.8);
          bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);
        }
      });

      tabBtn.on('pointerout', () => {
        if (!isAct) {
          this.tweens.add({ targets: tabBtn, scale: 1.0, duration: 80 });
          bg.lineStyle(1.2, 0x3d3a54, 0.65);
          bg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 12);
        }
      });

      this.sidebarContainer.add(tabBtn);
    });
  }

  private onSidebarTabClick(tabId: string): void {
    if (tabId === 'yokai_library') {
      this.currentSidebarTab = tabId;
      this.renderSidebar();
    } else if (tabId === 'relics') {
      this.openFull30RelicsCodex(1);
    } else if (tabId === 'badges') {
      this.openBadgesModal();
    } else if (tabId === 'companions') {
      CompanionModal.open(this, (newComp) => {
        this.save.setSelectedCompanion(newComp.id);
        this.audio.playVictory();
        this.scene.restart();
      });
    } else if (tabId === 'items') {
      this.openItemsModal();
    } else if (tabId === 'story') {
      this.openStoryModal();
    } else if (tabId === 'achievements') {
      this.openAchievementsModal();
    }
  }

  /**
   * Top 11 Realm / World Filter Pills
   */
  private renderFilterBar(): void {
    this.filterBarContainer.removeAll(true);

    const realmsList = [
      this.REALMS_CONFIG['all'],
      this.REALMS_CONFIG['yokai'],
      this.REALMS_CONFIG['egypt'],
      this.REALMS_CONFIG['greece'],
      this.REALMS_CONFIG['wuxia'],
      this.REALMS_CONFIG['india'],
      this.REALMS_CONFIG['sea'],
      this.REALMS_CONFIG['dinosaur'],
      this.REALMS_CONFIG['space'],
      this.REALMS_CONFIG['chaos'],
      this.REALMS_CONFIG['bosses']
    ];

    const contentLeft = 185;
    const contentW = 875;
    const barY = 82;
    const pillH = 30;
    const pillSpacing = Math.floor(contentW / realmsList.length);
    const highestLevel = this.save.getHighestLevel();

    realmsList.forEach((realm, idx) => {
      const isAct = realm.id === this.currentRealmId;
      const pillX = contentLeft + idx * pillSpacing + pillSpacing / 2;
      const pillW = pillSpacing - 4;
      const isLevelLocked = realm.id !== 'all' && highestLevel < realm.startLevel;

      const pillBtn = this.add.container(pillX, barY);
      const bg = this.add.graphics();

      if (isAct) {
        bg.fillStyle(realm.themeColor || 0xd90429, 0.95);
        bg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 9);
        bg.lineStyle(1.6, 0xffd166, 0.95);
        bg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 9);
      } else {
        bg.fillStyle(0x131124, 0.85);
        bg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 9);
        bg.lineStyle(1, 0x3a3652, 0.6);
        bg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 9);
      }

      const lockPrefix = isLevelLocked ? '🔒 ' : '';
      const txt = this.add.text(0, 0, `${lockPrefix}${realm.icon} ${realm.shortLabel}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10.5px',
        fontStyle: '900',
        color: isAct ? '#ffffff' : (isLevelLocked ? '#8d99ae' : '#ced4da')
      }).setOrigin(0.5);

      pillBtn.add([bg, txt]);
      pillBtn.setSize(pillW, pillH).setInteractive({ useHandCursor: true });

      pillBtn.on('pointerdown', () => {
        this.audio.playSelect();
        this.currentRealmId = realm.id;
        this.currentTab = 0;
        this.updateHeaderTitle();
        this.renderFilterBar();
        this.renderProgressCard();
        this.renderChapterNav();
        this.renderCurrentTabGrid();
      });

      this.filterBarContainer.add(pillBtn);
    });
  }

  /**
   * Helper to get boss characters from bosses.json mapped to CharacterData
   */
  private getBossCharacters(): CharacterData[] {
    const list = bossesData as any[];
    return list.map(b => ({
      id: b.id,
      name: b.name,
      japaneseName: b.native_name || b.title,
      collection: 'bosses',
      chapter: 10,
      chapterId: 'chapter_10_bosses',
      rarity: 'legendary' as Rarity,
      element: (b.element || 'spirit') as ElementType,
      description: b.desc || `Đại Cự Trùm ${b.name} ngự trị tại ${b.title}.`,
      palette: {
        bg: '#181428',
        primary: '#ffd700',
        accent: '#e63946',
        glow: '#ffb703'
      },
      symbol: b.symbol || '👑'
    }));
  }

  /**
   * Helper to retrieve characters for the active tab/sub-chapter
   */
  private getCharactersForActiveTab(): CharacterData[] {
    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    const allCharacters = CharacterRegistry.getAll();

    if (realm.id === 'all') {
      const chIdx = this.currentTab; // 0 to 9
      const chNum = chIdx + 1;
      const chConfig = LevelManager.CHAPTERS[chIdx];
      if (chConfig) {
        if (chConfig.worldId === 'underwater' && chNum === 10) {
          return this.getBossCharacters().slice(0, 10);
        }
        let chChars: CharacterData[] = [];
        if (chConfig.primaryCollection === 'all') {
          chChars = allCharacters.filter(c => chConfig.sisterCollections.includes(c.collection));
        } else {
          chChars = allCharacters.filter(c => c.collection === chConfig.primaryCollection || chConfig.sisterCollections.includes(c.collection));
        }
        return chChars.slice(0, 10);
      }
      return allCharacters.slice(this.currentTab * 10, (this.currentTab + 1) * 10);
    }

    if (realm.id === 'bosses') {
      const bosses = this.getBossCharacters();
      const start = this.currentTab * 8;
      return bosses.slice(start, start + 8);
    }

    if (realm.id === 'chaos') {
      const chaosPool = allCharacters.filter(c =>
        ['monster', 'fantasy', 'space', 'egypt', 'greece', 'yokai'].includes(c.collection) &&
        (c.rarity === 'epic' || c.rarity === 'legendary' || c.rarity === 'rare')
      );
      const start = this.currentTab * 10;
      return chaosPool.slice(start, start + 10);
    }

    if (realm.id === 'yokai') {
      const chNum = this.currentTab + 1;
      return allCharacters.filter(c => c.collection === 'yokai' && c.chapter === chNum);
    }

    const realmCharacters = allCharacters.filter(c => realm.collections.includes(c.collection));
    const start = this.currentTab * 10;
    return realmCharacters.slice(start, start + 10);
  }

  /**
   * Helper to determine exact level requirement for a character
   */
  private getCharacterLevelRequirement(char: CharacterData, realm: any): { startLevel: number; endLevel: number } {
    if (realm.id === 'bosses' || char.collection === 'bosses') return { startLevel: 91, endLevel: 100 };
    if (realm.id === 'chaos') return { startLevel: 81, endLevel: 90 };
    if (char.collection === 'yokai') return { startLevel: 1, endLevel: 10 };
    if (char.collection === 'egypt' || char.collection === 'animal') return { startLevel: 11, endLevel: 20 };
    if (char.collection === 'greece' || char.collection === 'fantasy') return { startLevel: 21, endLevel: 30 };
    if (char.collection === 'wuxia' || char.collection === 'korea') return { startLevel: 31, endLevel: 40 };
    if (char.collection === 'india' || char.collection === 'plant') return { startLevel: 41, endLevel: 50 };
    if (char.collection === 'pirate' || char.collection === 'underwater' || char.collection === 'sea') return { startLevel: 51, endLevel: 60 };
    if (char.collection === 'dinosaur' || char.collection === 'monster') return { startLevel: 61, endLevel: 70 };
    if (char.collection === 'space' || char.collection === 'robot') return { startLevel: 71, endLevel: 80 };
    return { startLevel: realm.startLevel || 1, endLevel: realm.endLevel || 10 };
  }

  /**
   * Collection Progress Bar Row
   */
  private renderProgressCard(): void {
    this.progressContainer.removeAll(true);

    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    const allCharacters = CharacterRegistry.getAll();
    const discovered = this.save.getData().discoveredCharacters;
    const highestLevel = this.save.getHighestLevel();

    let targetCharacters: CharacterData[] = [];
    if (realm.id === 'all') {
      targetCharacters = allCharacters;
    } else if (realm.id === 'bosses') {
      targetCharacters = this.getBossCharacters();
    } else if (realm.id === 'chaos') {
      targetCharacters = allCharacters.filter(c =>
        ['monster', 'fantasy', 'space', 'egypt', 'greece', 'yokai'].includes(c.collection) &&
        (c.rarity === 'epic' || c.rarity === 'legendary' || c.rarity === 'rare')
      );
    } else {
      targetCharacters = allCharacters.filter(c => realm.collections.includes(c.collection));
    }

    let discoveredCount = 0;
    targetCharacters.forEach(c => {
      if (discovered[c.id]) discoveredCount++;
    });

    const totalCount = targetCharacters.length || 1;
    const completionPct = Math.round((discoveredCount / totalCount) * 100);

    const cardY = 114;
    const contentLeft = 185;
    const cardW = 875;
    const cardCenterX = contentLeft + cardW / 2;

    const pCard = this.add.container(cardCenterX, cardY);
    const pBg = this.add.graphics();
    pBg.fillStyle(0x111020, 0.85);
    pBg.fillRoundedRect(-cardW / 2, -14, cardW, 28, 10);
    pBg.lineStyle(1, 0x38344e, 0.6);
    pBg.strokeRoundedRect(-cardW / 2, -14, cardW, 28, 10);

    const pLabel = this.add.text(-cardW / 2 + 18, 0, `TIẾN ĐỘ THU PHỤC ${realm.shortLabel}:`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#adb5bd'
    }).setOrigin(0, 0.5);

    let rightStatusText = `${discoveredCount} / ${totalCount} (${completionPct}%)`;
    if (realm.id !== 'all') {
      const isLevelUnlocked = highestLevel >= realm.startLevel;
      const statusPill = isLevelUnlocked
        ? `✓ Mở (Màn ${realm.startLevel}-${realm.endLevel})`
        : `🔒 Cần Màn ${realm.startLevel}`;
      rightStatusText = `${statusPill}   •   ${discoveredCount}/${totalCount} (${completionPct}%)`;
    } else {
      rightStatusText = `Màn cao nhất: ${highestLevel}/100   •   ${discoveredCount}/${totalCount} (${completionPct}%)`;
    }

    const pValue = this.add.text(cardW / 2 - 18, 0, rightStatusText, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(1, 0.5);

    // Glowing Progress Bar in Middle
    const barX = -cardW / 2 + 205;
    const barW = cardW - 530;
    const pFillBg = this.add.graphics();
    pFillBg.fillStyle(0x1a192e, 1);
    pFillBg.fillRoundedRect(barX, -3.5, barW, 7, 3.5);

    const pFill = this.add.graphics();
    const fillWidth = barW * Math.min(1, discoveredCount / totalCount);
    pFill.fillStyle(realm.themeColor || 0xd90429, 1);
    pFill.fillRoundedRect(barX, -3.5, Math.max(6, fillWidth), 7, 3.5);

    pCard.add([pBg, pLabel, pValue, pFillBg, pFill]);
    this.progressContainer.add(pCard);
  }

  /**
   * Chapter Navigation Bar & Jump Pills
   */
  public renderChapterNav(): void {
    this.chapterNavContainer.removeAll(true);

    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    const subChapters = realm.subChapters;
    const highestLevel = this.save.getHighestLevel();

    if (this.currentTab >= subChapters.length) {
      this.currentTab = 0;
    }

    const currentSub = subChapters[this.currentTab];
    const contentLeft = 185;
    const barW = 875;
    const barCenterX = contentLeft + barW / 2;
    const barY = 148;

    // Chapter Header Capsule
    const barBg = this.add.graphics();
    barBg.fillStyle(0x111020, 0.88);
    barBg.fillRoundedRect(barCenterX - barW / 2, barY - 15, barW, 30, 9);
    barBg.lineStyle(1.2, 0x3d3956, 0.7);
    barBg.strokeRoundedRect(barCenterX - barW / 2, barY - 15, barW, 30, 9);
    this.chapterNavContainer.add(barBg);

    // Prev Button ◀
    const prevBtn = this.add.container(barCenterX - barW / 2 + 22, barY);
    const prevBg = this.add.graphics();
    prevBg.fillStyle(0x222036, 1);
    prevBg.fillRoundedRect(-14, -10, 28, 20, 5);
    const prevTxt = this.add.text(0, 0, '◀', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);
    prevBtn.add([prevBg, prevTxt]);
    prevBtn.setSize(28, 20).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.currentTab = (this.currentTab - 1 + subChapters.length) % subChapters.length;
      this.renderChapterNav();
      this.renderCurrentTabGrid();
    });
    this.chapterNavContainer.add(prevBtn);

    // Next Button ▶
    const nextBtn = this.add.container(barCenterX + barW / 2 - 22, barY);
    const nextBg = this.add.graphics();
    nextBg.fillStyle(0x222036, 1);
    nextBg.fillRoundedRect(-14, -10, 28, 20, 5);
    const nextTxt = this.add.text(0, 0, '▶', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);
    nextBtn.add([nextBg, nextTxt]);
    nextBtn.setSize(28, 20).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.currentTab = (this.currentTab + 1) % subChapters.length;
      this.renderChapterNav();
      this.renderCurrentTabGrid();
    });
    this.chapterNavContainer.add(nextBtn);

    // Center Title Text
    let titleString = '';
    if (realm.id === 'all') {
      const chIdx = this.currentTab;
      const chLvlStart = chIdx * 10 + 1;
      const chLvlEnd = (chIdx + 1) * 10;
      const isChUnlocked = highestLevel >= chLvlStart;
      const lockIndicator = isChUnlocked ? '✓ ĐÃ MỞ' : `🔒 CẦN VƯỢT MÀN ${chLvlStart - 1}`;
      titleString = `CHƯƠNG ${chIdx + 1}/10: ${currentSub.name.toUpperCase()} (MÀN ${chLvlStart} - ${chLvlEnd}) • ${lockIndicator}`;
    } else {
      const isRealmUnlocked = highestLevel >= realm.startLevel;
      const lockIndicator = isRealmUnlocked ? '✓ ĐÃ MỞ' : `🔒 CẦN VƯỢT MÀN ${realm.startLevel - 1}`;
      titleString = `TRANG ${this.currentTab + 1}/${subChapters.length}: ${realm.icon} ${currentSub.name.toUpperCase()} • ${currentSub.sub.toUpperCase()} (MÀN ${realm.startLevel} - ${realm.endLevel}) • ${lockIndicator}`;
    }

    const titleText = this.add.text(barCenterX, barY, titleString, {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.chapterNavContainer.add(titleText);

    // Row of Chapter / Page Number Pills [ 1 ] [ 2 ] ... [ N ]
    const chipsY = 180;
    const chipSpacing = Math.min(54, Math.floor(barW / subChapters.length));
    const totalChipsW = subChapters.length * chipSpacing;
    const chipStartX = barCenterX - totalChipsW / 2 + chipSpacing / 2;

    subChapters.forEach((_, idx) => {
      const chip = this.add.container(chipStartX + idx * chipSpacing, chipsY);
      const isAct = idx === this.currentTab;

      let isLocked = false;
      if (realm.id === 'all') {
        const startLvl = idx * 10 + 1;
        isLocked = highestLevel < startLvl;
      } else {
        isLocked = highestLevel < realm.startLevel;
      }

      const cBg = this.add.graphics();
      if (isAct) {
        cBg.fillStyle(realm.themeColor || 0xd90429, 1);
        cBg.fillRoundedRect(-chipSpacing / 2 + 3, -10, chipSpacing - 6, 20, 6);
        cBg.lineStyle(1.5, 0xffd700, 1);
        cBg.strokeRoundedRect(-chipSpacing / 2 + 3, -10, chipSpacing - 6, 20, 6);
      } else {
        cBg.fillStyle(0x161528, 0.85);
        cBg.fillRoundedRect(-chipSpacing / 2 + 3, -10, chipSpacing - 6, 20, 6);
        cBg.lineStyle(1, 0x3d3956, 0.5);
        cBg.strokeRoundedRect(-chipSpacing / 2 + 3, -10, chipSpacing - 6, 20, 6);
      }

      const labelText = isLocked && realm.id === 'all' ? `🔒${idx + 1}` : `${idx + 1}`;
      const cTxt = this.add.text(0, 0, labelText, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '900',
        color: isAct ? '#ffffff' : (isLocked ? '#6c757d' : '#adb5bd')
      }).setOrigin(0.5);

      chip.add([cBg, cTxt]);
      chip.setSize(chipSpacing - 6, 20).setInteractive({ useHandCursor: true });

      chip.on('pointerdown', () => {
        if (this.currentTab === idx) return;
        this.audio.playSelect();
        this.currentTab = idx;
        this.renderChapterNav();
        this.renderCurrentTabGrid();
      });

      this.chapterNavContainer.add(chip);
    });
  }

  /**
   * Render 10 Cards in 2 Rows x 5 Columns
   */
  public renderCurrentTabGrid(): void {
    this.gridContainer.removeAll(true);

    const realm = this.REALMS_CONFIG[this.currentRealmId] || this.REALMS_CONFIG['all'];
    const tabCharacters = this.getCharactersForActiveTab();
    const discovered = this.save.getData().discoveredCharacters;

    const contentLeft = 185;
    const cardW = 160;
    const cardH = 195;
    const gapX = 16;
    const row0Y = 305;
    const row1Y = 514;

    const totalCols = 5;
    const row0Count = Math.min(5, tabCharacters.length);
    const row1Count = Math.max(0, tabCharacters.length - row0Count);

    tabCharacters.forEach((char, slot) => {
      const isSecondRow = slot >= 5;
      const col = isSecondRow ? slot - 5 : slot;

      const rowOffsetX = isSecondRow && row1Count < totalCols
        ? ((totalCols - row1Count) * (cardW + gapX)) / 2
        : 0;

      const posX = contentLeft + 10 + rowOffsetX + col * (cardW + gapX) + cardW / 2;
      const posY = isSecondRow ? row1Y : row0Y;

      const isDiscovered = !!discovered[char.id];
      const lvlReq = this.getCharacterLevelRequirement(char, realm);
      const card = this.createCharacterCard(posX, posY, cardW, cardH, char, isDiscovered, realm, lvlReq);
      this.gridContainer.add(card);
    });
  }

  /**
   * Create an authentic Character Card with clear level requirement
   */
  private createCharacterCard(
    x: number,
    y: number,
    w: number,
    h: number,
    char: CharacterData,
    isDiscovered: boolean,
    realm: any,
    lvlReq: { startLevel: number; endLevel: number }
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const rarityColor = CharacterRegistry.getRarityColor(char.rarity);

    if (isDiscovered) {
      bg.fillStyle(0x141326, 0.88);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      bg.lineStyle(1.8, rarityColor, 0.95);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

      // Top-Left Element Rune Badge
      const elementIcon = this.getElementIcon(char.element);
      const runeTxt = this.add.text(-w / 2 + 12, -h / 2 + 10, elementIcon, {
        fontSize: '13px'
      }).setOrigin(0, 0);

      // Top-Right Golden Star Badge
      const starTxt = this.add.text(w / 2 - 12, -h / 2 + 10, '⭐', {
        fontSize: '11px'
      }).setOrigin(1, 0);

      // Center Character Sprite Image
      TextureGenerator.ensureCharacterTexture(this, char.id);
      const texKey = `char_${char.id}`;
      let charVisual: Phaser.GameObjects.GameObject;
      if (this.textures.exists(texKey)) {
        charVisual = this.add.image(0, -22, texKey).setDisplaySize(92, 92);
      } else {
        charVisual = this.add.text(0, -22, char.symbol, { fontSize: '46px' }).setOrigin(0.5);
      }

      // Name
      const name = this.add.text(0, 39, char.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '14.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Kanji / Subtitle
      const kanji = this.add.text(0, 58, char.japaneseName || '', {
        fontFamily: FONT_DISPLAY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ced4da'
      }).setOrigin(0.5);

      // Footer: Rarity & Level Span
      const rarityBadge = this.add.text(0, 77, `${CharacterRegistry.getRarityName(char.rarity)} • Màn ${lvlReq.startLevel}-${lvlReq.endLevel}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: '900',
        color: `#${rarityColor.toString(16).padStart(6, '0')}`
      }).setOrigin(0.5);

      container.add([bg, runeTxt, starTxt, charVisual, name, kanji, rarityBadge]);
      container.setSize(w, h).setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scale: 1.04, duration: 80 });
        bg.lineStyle(2.5, 0xffd166, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      });

      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1.0, duration: 80 });
        bg.lineStyle(1.8, rarityColor, 0.95);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      });

      container.on('pointerdown', () => {
        this.audio.playSelect();
        this.showCharacterModal(char, true, realm, lvlReq);
      });
    } else {
      // Locked Card with Grayscale Black-and-White Art & Blur
      bg.fillStyle(0x101117, 0.94);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      bg.lineStyle(1.4, 0x414552, 0.65);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

      // Top-Left Lock Badge
      const lockBadge = this.add.text(-w / 2 + 10, -h / 2 + 8, '🔒', {
        fontSize: '11px'
      }).setOrigin(0, 0);

      // Top-Right Element Symbol (Monochrome slate)
      const elemSymbol = this.getElementIcon(char.element);
      const elemTxt = this.add.text(w / 2 - 10, -h / 2 + 8, elemSymbol, {
        fontSize: '11px'
      }).setOrigin(1, 0).setAlpha(0.5);

      // Center Character Sprite Image - Grayscale
      const grayKey = TextureGenerator.ensureGrayscaleCharacterTexture(this, char.id);
      let charVisual: Phaser.GameObjects.GameObject;
      if (this.textures.exists(grayKey)) {
        const silImg = this.add.image(0, -22, grayKey).setDisplaySize(92, 92);
        silImg.setAlpha(0.58);
        if (silImg.postFX) {
          try {
            silImg.postFX.addBlur(0, 0.8, 0.8, 0.35);
          } catch {}
        }
        charVisual = silImg;
      } else {
        const txt = this.add.text(0, -22, char.symbol, { fontSize: '46px' }).setOrigin(0.5);
        txt.setAlpha(0.55);
        charVisual = txt;
      }

      // Real Name (Visible in clean silver-gray)
      const name = this.add.text(0, 39, char.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '14px',
        fontStyle: '800',
        color: '#ced4da'
      }).setOrigin(0.5);

      // Subtitle
      const kanji = this.add.text(0, 58, char.japaneseName || '', {
        fontFamily: FONT_DISPLAY,
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: '#6c757d'
      }).setOrigin(0.5);

      // Explicit Level Requirement Footer
      const rarityBadge = this.add.text(0, 77, `🔒 Mở tại Màn ${lvlReq.startLevel}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd166'
      }).setOrigin(0.5);

      container.add([bg, lockBadge, elemTxt, charVisual, name, kanji, rarityBadge]);
      container.setSize(w, h).setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scale: 1.04, duration: 80 });
        bg.lineStyle(1.8, 0xadb5bd, 0.95);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      });

      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1.0, duration: 80 });
        bg.lineStyle(1.4, 0x414552, 0.65);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
      });

      container.on('pointerdown', () => {
        this.audio.playSelect();
        this.showCharacterModal(char, false, realm, lvlReq);
      });
    }

    return container;
  }

  /**
   * Helper for empty locked card slot
   */
  private createEmptyLockedCard(x: number, y: number, w: number, h: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0d18, 0.85);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(1.2, 0x27243a, 0.65);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const lockBadge = this.add.text(-w / 2 + 12, -h / 2 + 10, '🔒', { fontSize: '12px' }).setOrigin(0, 0);
    const qMark = this.add.text(0, -22, '?', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '36px',
      fontStyle: '900',
      color: '#343048'
    }).setOrigin(0.5);

    const unknownText = this.add.text(0, 44, 'Chưa Gặp', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#adb5bd'
    }).setOrigin(0.5);

    const hintText = this.add.text(0, 64, 'Vượt ải để mở', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#6c757d'
    }).setOrigin(0.5);

    container.add([bg, lockBadge, qMark, unknownText, hintText]);
    return container;
  }

  private getElementIcon(element: string): string {
    switch (element) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'wind': return '🌪️';
      case 'earth': return '🌿';
      case 'thunder': return '⚡';
      case 'spirit': return '🔮';
      case 'dark': return '🌑';
      default: return '✦';
    }
  }

  /**
   * Character Detailed Modal with Campaign Stage Direct Jump
   */
  private showCharacterModal(
    char: CharacterData,
    isDiscovered: boolean = true,
    realm: any = this.REALMS_CONFIG['all'],
    lvlReq: { startLevel: number; endLevel: number } = { startLevel: 1, endLevel: 10 }
  ): void {
    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = null;
    }

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const highestLevel = this.save.getHighestLevel();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => {
      this.modalContainer?.destroy();
      this.modalContainer = null;
    });

    const card = this.add.graphics();
    const rarityColor = CharacterRegistry.getRarityColor(char.rarity);
    card.fillStyle(0x161426, 0.96);
    card.fillRoundedRect(-290, -210, 580, 420, 20);
    card.lineStyle(2.5, rarityColor, 1);
    card.strokeRoundedRect(-290, -210, 580, 420, 20);

    // Left side: Large character portrait
    TextureGenerator.ensureCharacterTexture(this, char.id);
    const texKey = `char_${char.id}`;
    let portrait: Phaser.GameObjects.GameObject;
    if (this.textures.exists(texKey)) {
      portrait = this.add.image(-155, -20, texKey).setDisplaySize(185, 185);
    } else {
      portrait = this.add.text(-155, -20, char.symbol, { fontSize: '80px' }).setOrigin(0.5);
    }

    // Right side: Info and lore
    const kanji = this.add.text(125, -145, char.japaneseName || '', {
      fontFamily: FONT_DISPLAY,
      fontSize: '22px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const name = this.add.text(125, -112, char.name, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    const rarityBadge = this.add.text(125, -82, `[ ${CharacterRegistry.getRarityName(char.rarity)} • Hệ ${char.element.toUpperCase()} ]`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: `#${rarityColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);

    const compData = COMPANIONS[char.id];
    const descY = compData ? -15 : -10;
    const desc = this.add.text(125, descY, char.description, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12.5px',
      color: '#ced4da',
      wordWrap: { width: 275 },
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5);

    // Location & Unlock Stage Banner
    const isLevelUnlocked = highestLevel >= lvlReq.startLevel;
    const locationY = compData ? 45 : 55;
    const locationBox = this.add.text(125, locationY,
      `📍 Xuất hiện: ${realm.name} (Màn ${lvlReq.startLevel} - ${lvlReq.endLevel})\n` +
      `✨ Thu phục: Nối các cặp ô ${char.name} trong màn chơi`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: isLevelUnlocked ? '#00f5d4' : '#ffd166',
      align: 'center',
      wordWrap: { width: 275 },
      lineSpacing: 3
    }).setOrigin(0.5);

    let skillDescText: Phaser.GameObjects.Text | null = null;
    let equipBtn: Phaser.GameObjects.Container | null = null;

    if (compData) {
      skillDescText = this.add.text(125, 100, `⚡ TUYỆT CHIÊU: ${compData.skillName} (${compData.skillDesc})`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd700',
        wordWrap: { width: 275 },
        align: 'center'
      }).setOrigin(0.5);

      const isEquipped = this.save.getSelectedCompanion() === char.id;
      const isUnlocked = this.save.isCompanionUnlocked(char.id);
      equipBtn = this.add.container(40, 155);
      const eqBg = this.add.graphics();
      let btnColor = compData.themeColor;
      let btnLabel = '🦊 ĐỒNG HÀNH';
      let btnTxtColor = '#000000';

      if (isEquipped) {
        btnColor = 0x2a9d8f;
        btnLabel = '✓ ĐANG CHỌN';
        btnTxtColor = '#ffffff';
      } else if (!isUnlocked) {
        btnColor = 0xffd166;
        btnLabel = `🔒 MỞ (${formatCurrency(compData.cost)} XU)`;
        btnTxtColor = '#000000';
      }

      eqBg.fillStyle(btnColor, 1);
      eqBg.fillRoundedRect(-70, -16, 140, 32, 8);
      const eqTxt = this.add.text(0, 0, btnLabel, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11.5px',
        fontStyle: '900',
        color: btnTxtColor
      }).setOrigin(0.5);
      equipBtn.add([eqBg, eqTxt]);
      equipBtn.setSize(140, 32).setInteractive({ useHandCursor: true });

      equipBtn.on('pointerdown', () => {
        if (isEquipped) return;
        if (this.save.isCompanionUnlocked(char.id)) {
          this.save.setSelectedCompanion(char.id);
          this.audio.playVictory();
          eqBg.clear();
          eqBg.fillStyle(0x2a9d8f, 1);
          eqBg.fillRoundedRect(-70, -16, 140, 32, 8);
          eqTxt.setText('✓ ĐANG CHỌN');
          eqTxt.setColor('#ffffff');
        } else {
          if (this.save.getCoins() >= compData.cost) {
            this.save.spendCoins(compData.cost);
            this.save.unlockCompanion(char.id);
            this.save.setSelectedCompanion(char.id);
            this.audio.playVictory();
            eqBg.clear();
            eqBg.fillStyle(0x2a9d8f, 1);
            eqBg.fillRoundedRect(-70, -16, 140, 32, 8);
            eqTxt.setText('✓ ĐANG CHỌN');
            eqTxt.setColor('#ffffff');
          } else {
            this.audio.playError();
          }
        }
      });
    }

    // Direct Play Stage Button
    const playBtnX = compData ? 145 : 60;
    const playBtnW = compData ? 100 : 150;
    const playBtn = this.add.container(playBtnX, 155);
    const playBg = this.add.graphics();
    const targetPlayLevel = isLevelUnlocked ? lvlReq.startLevel : highestLevel;
    const playBtnColor = isLevelUnlocked ? 0x00f5d4 : 0x4361ee;
    playBg.fillStyle(playBtnColor, 1);
    playBg.fillRoundedRect(-playBtnW / 2, -16, playBtnW, 32, 8);

    const playLabel = isLevelUnlocked ? `🎮 VÀO MÀN ${lvlReq.startLevel}` : `▶ CHƠI MÀN ${highestLevel}`;
    const playTxt = this.add.text(0, 0, playLabel, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11.5px',
      fontStyle: '900',
      color: '#052c24'
    }).setOrigin(0.5);
    playBtn.add([playBg, playTxt]);
    playBtn.setSize(playBtnW, 32).setInteractive({ useHandCursor: true });

    playBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.modalContainer?.destroy();
      this.modalContainer = null;
      this.scene.start('GameScene', {
        levelNumber: targetPlayLevel,
        difficulty: 'easy'
      });
    });

    // Close button
    const closeBtnX = compData ? 225 : 185;
    const closeBtnW = compData ? 60 : 80;
    const closeBtn = this.add.container(closeBtnX, 155);
    const clBg = this.add.graphics();
    clBg.fillStyle(0xd90429, 1);
    clBg.fillRoundedRect(-closeBtnW / 2, -16, closeBtnW, 32, 8);
    const clTxt = this.add.text(0, 0, 'ĐÓNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(closeBtnW, 32).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.modalContainer?.destroy();
      this.modalContainer = null;
    });

    const modalElements: Phaser.GameObjects.GameObject[] = [
      overlay, card, portrait, kanji, name, rarityBadge, desc, locationBox, playBtn, closeBtn
    ];

    if (!isDiscovered) {
      const lockBanner = this.add.text(-155, -125, '🔒 CHƯA THU THẬP', {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '11px',
        fontStyle: '900',
        color: '#ffd166',
        backgroundColor: '#110f1eed',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5);
      modalElements.push(lockBanner);
    }

    if (skillDescText) modalElements.push(skillDescText);
    if (equipBtn) modalElements.push(equipBtn);
    this.modalContainer.add(modalElements);
  }

  /**
   * Items Modal
   */
  private openItemsModal(): void {
    if (this.modalContainer) this.modalContainer.destroy();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    const card = this.add.graphics();
    card.fillStyle(0x161426, 0.96);
    card.fillRoundedRect(-260, -190, 520, 385, 20);
    card.lineStyle(2, 0xffd166, 1);
    card.strokeRoundedRect(-260, -190, 520, 385, 20);

    const title = this.add.text(0, -155, '🎒 KHO VẬT PHẨM & PHÁP BẢO', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const boosters = this.save.getBoosters();
    const items = [
      { id: 'hint', spriteKey: 'item_booster_hint', icon: '💡', name: 'Bình Gợi Ý (Hint Bottle)', desc: 'Soi sáng tức thì 1 cặp Yokai có thể kết nối ngay trên bàn.', qty: `x${boosters.hint}`, usage: 'Bấm nút Gợi Ý 💡 trong màn chơi hoặc khi bí đường.', obtain: 'Mua tại Cửa Hàng Xu Vàng hoặc Thưởng 3★ mỗi màn chơi.' },
      { id: 'shuffle', spriteKey: 'item_booster_shuffle', icon: '🔀', name: 'Quạt Đổi Bảng (Shuffle Fan)', desc: 'Xáo trộn lại toàn bộ bàn cờ khi các cặp thẻ bị phân tán hiểm hóc.', qty: `x${boosters.shuffle}`, usage: 'Bấm nút Đổi Cờ 🔄 hoặc tự động kích hoạt khi bàn cờ bế tắc.', obtain: 'Mua tại Cửa Hàng Xu Vàng & Điểm Danh Hàng Ngày.' },
      { id: 'bomb', spriteKey: 'item_booster_bomb', icon: '⚡', name: 'Búa Sét Trảm Quái (Thunder Hammer)', desc: 'Gọi sấm sét tiêu diệt tức thì 1 cặp thẻ bất kỳ trên bàn cờ.', qty: `x${boosters.bomb}`, usage: 'Bấm nút Phá Cặp 💣 để trảm ngay cặp cờ hiểm hóc.', obtain: 'Mua tại Cửa Hàng Quân Nhu hoặc Thưởng Boss Thế Giới.' },
      { id: 'hourglass', icon: '⏳', name: 'Đồng Hồ Cát (+15s)', desc: 'Cộng thêm +15 giây sinh tồn khẩn cấp trong màn chơi.', qty: 'x2', usage: 'Tự động kích hoạt khi Thần Khí Thời Gian phát động chiêu.', obtain: 'Phần thưởng diệt Boss thế giới.' },
      { id: 'elixir', icon: '❤️', name: 'Linh Đan Trường Sinh', desc: 'Hồi phục lại 1 Trái Tim sinh mệnh khi nối sai ô.', qty: 'x10', usage: 'Bảo hộ thanh sinh mệnh không bị trừ hết mạng.', obtain: 'Phần thưởng Cổ Vật Bất Tử Ankh.' }
    ];

    const itemElements: Phaser.GameObjects.GameObject[] = [overlay, card, title];

    let itemDetailBox: Phaser.GameObjects.Text;

    items.forEach((it, i) => {
      const y = -112 + i * 44;
      const iContainer = this.add.container(0, y);
      const iBg = this.add.graphics();
      iBg.fillStyle(0x211f36, 0.9);
      iBg.fillRoundedRect(-220, -18, 440, 38, 10);
      iBg.lineStyle(1.2, 0x4d4668, 0.8);
      iBg.strokeRoundedRect(-220, -18, 440, 38, 10);

      let ic: Phaser.GameObjects.GameObject;
      if (it.spriteKey && this.textures.exists(it.spriteKey)) {
        const itemImg = this.add.image(-198, 0, it.spriteKey);
        itemImg.setDisplaySize(30, 30);
        ic = itemImg;
      } else {
        ic = this.add.text(-200, 0, it.icon, { fontSize: '20px' }).setOrigin(0, 0.5);
      }

      const nm = this.add.text(-170, -7, it.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '800',
        color: '#ffd700'
      });
      const dc = this.add.text(-170, 8, it.desc, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '9.5px',
        color: '#adb5bd'
      });
      const qt = this.add.text(200, 0, it.qty, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(1, 0.5);

      iContainer.add([iBg, ic, nm, dc, qt]);
      iContainer.setSize(440, 38).setInteractive({ useHandCursor: true });

      iContainer.on('pointerover', () => {
        iBg.lineStyle(1.8, 0xffd166, 1);
        iBg.strokeRoundedRect(-220, -18, 440, 38, 10);
      });
      iContainer.on('pointerout', () => {
        iBg.lineStyle(1.2, 0x4d4668, 0.8);
        iBg.strokeRoundedRect(-220, -18, 440, 38, 10);
      });
      iContainer.on('pointerdown', () => {
        this.audio.playSelect();
        itemDetailBox.setText(
          `✨ ${it.name} • Đang có: ${it.qty}\n` +
          `⚡ Hiệu Quả: ${it.desc}\n` +
          `🎮 Cách Dùng: ${it.usage}\n` +
          `🎁 Cách Kiếm: ${it.obtain}`
        );
        itemDetailBox.setColor('#00f5d4');
      });

      itemElements.push(iContainer);
    });

    // Detail Info Box at bottom
    itemDetailBox = this.add.text(0, 122, '💡 Chạm vào bất kỳ vật phẩm nào ở trên để xem chi tiết cách dùng & cách nhận.', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '10.5px',
      color: '#ced4da',
      align: 'center',
      wordWrap: { width: 440 },
      lineSpacing: 2
    }).setOrigin(0.5);
    itemElements.push(itemDetailBox);

    const closeBtn = this.add.container(0, 162);
    const clBg = this.add.graphics();
    clBg.fillStyle(0xd90429, 1);
    clBg.fillRoundedRect(-60, -14, 120, 28, 8);
    const clTxt = this.add.text(0, 0, 'ĐÓNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(120, 28).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });
    itemElements.push(closeBtn);

    this.modalContainer.add(itemElements);
  }

  /**
   * Story Lore Modal
   */
  private openStoryModal(): void {
    if (this.modalContainer) this.modalContainer.destroy();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    const card = this.add.graphics();
    card.fillStyle(0x161426, 0.96);
    card.fillRoundedRect(-260, -180, 520, 360, 20);
    card.lineStyle(2, 0x00f5d4, 1);
    card.strokeRoundedRect(-260, -180, 520, 360, 20);

    const title = this.add.text(0, -135, '📖 CỐT TRUYỆN BÁCH QUỶ DẠ HÀNH', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);

    const storyTxt = this.add.text(0, -5,
      'Khi màn đêm buông xuống trên đất nước Phù Tang, cánh cổng Torii cổ kính giữa hồ nước thiêng phát sáng rực rỡ.\n\n' +
      'Bách Quỷ Dạ Hành (Hyakki Yagyo) bắt đầu trỗi dậy. 108 linh hồn yêu quái cổ đại vượt qua bờ cõi linh giới mang theo sức mạnh thần bí.\n\n' +
      'Với tư cách là Âm Dương Sư mang linh hồ Cáo Inari dẫn đường, bạn phải kết nối các linh hồn đồng điệu theo luật 2 khúc gập cổ xưa để thu phục và thanh tẩy cõi nhân gian!',
      {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12.5px',
        color: '#ced4da',
        lineSpacing: 6,
        wordWrap: { width: 450 },
        align: 'center'
      }
    ).setOrigin(0.5);

    const closeBtn = this.add.container(0, 135);
    const clBg = this.add.graphics();
    clBg.fillStyle(0xd90429, 1);
    clBg.fillRoundedRect(-60, -16, 120, 32, 10);
    const clTxt = this.add.text(0, 0, 'ĐÃ HIỂU', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(120, 32).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    this.modalContainer.add([overlay, card, title, storyTxt, closeBtn]);
  }

  /**
   * Achievements Modal
   */
  private openAchievementsModal(): void {
    if (this.modalContainer) this.modalContainer.destroy();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const save = this.save.getData();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    const card = this.add.graphics();
    card.fillStyle(0x161426, 0.96);
    card.fillRoundedRect(-260, -180, 520, 360, 20);
    card.lineStyle(2, 0xffd700, 1);
    card.strokeRoundedRect(-260, -180, 520, 360, 20);

    const title = this.add.text(0, -135, '🏆 BẢNG VÀNG THÀNH TỰU', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const achievements = [
      { icon: '⭐', name: 'Đệ Nhất Tinh Tú', desc: `Thu thập đủ 30 Ngôi Sao Vàng (${save.stars}/30)` },
      { icon: '🦊', name: 'Bậc Thầy Thu Phục', desc: `Mở khóa hơn 50 Linh thú (${Object.keys(save.discoveredCharacters).length}/198)` },
      { icon: '🐉', name: 'Đả Bại Bát Xà Orochi', desc: 'Chinh phục Boss 30 và phong ấn Thần Xà Cổ Đại' },
      { icon: '❄️', name: 'Chiến Binh Bão Tuyết', desc: `Sống sót qua 10 đợt tuyết dâng (${save.survivalMaxWaves || 0} đợt)` }
    ];

    const achElements: Phaser.GameObjects.GameObject[] = [overlay, card, title];

    achievements.forEach((ach, i) => {
      const y = -70 + i * 50;
      const iBg = this.add.graphics();
      iBg.fillStyle(0x211f36, 0.9);
      iBg.fillRoundedRect(-220, y - 18, 440, 42, 10);
      iBg.lineStyle(1, 0x3d3956, 0.8);
      iBg.strokeRoundedRect(-220, y - 18, 440, 42, 10);

      const ic = this.add.text(-200, y + 3, ach.icon, { fontSize: '20px' }).setOrigin(0, 0.5);
      const nm = this.add.text(-165, y - 3, ach.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '12px',
        fontStyle: '800',
        color: '#ffd700'
      });
      const dc = this.add.text(-165, y + 12, ach.desc, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        color: '#ced4da'
      });

      achElements.push(iBg, ic, nm, dc);
    });

    const closeBtn = this.add.container(0, 135);
    const clBg = this.add.graphics();
    clBg.fillStyle(0xd90429, 1);
    clBg.fillRoundedRect(-60, -16, 120, 32, 10);
    const clTxt = this.add.text(0, 0, 'ĐÓNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(120, 32).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });
    achElements.push(closeBtn);

    this.modalContainer.add(achElements);
  }

  /**
   * Sacred Relics Sanctuary Modal
   */
  private openRelicsModal(): void {
    if (this.modalContainer) this.modalContainer.destroy();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    const cardW = 630;
    const cardH = 510;
    const card = this.add.graphics();
    card.fillStyle(0x151226, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2, 0xffd700, 0.95);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    const title = this.add.text(0, -222, '🏺 ĐIỆN THỜ CỔ VẬT THẦN KHÍ (RELICS SANCTUARY)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const collectedCount = this.save.getCollectedRelicsCount('yokai');
    const isGateReady = collectedCount >= 10;

    const subTitle = this.add.text(0, -195, `Tiến độ Thần Khí Nhật Bản: ${collectedCount}/10 Mảnh • ${isGateReady ? '🌌 CỔNG ĐA VŨ TRỤ ĐÃ MỞ!' : 'Thu thập đủ 10 mảnh mở Cổng Thế Giới'}`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: isGateReady ? '#00f5d4' : '#c77dff'
    }).setOrigin(0.5);

    const elements: Phaser.GameObjects.GameObject[] = [overlay, card, title, subTitle];

    // Grid of 10 relics: 5 columns x 2 rows
    const allRelics = (levelsData as any[]).map(lvl => ({
      ...lvl.relicReward,
      levelNum: lvl.levelNumber,
      levelTitle: lvl.title
    })).filter(r => Boolean(r && r.id));

    const cols = 5;
    const itemW = 110;
    const itemH = 118;
    const startX = -((cols - 1) * 118) / 2;
    const startY = -118;

    let selectedRelicDescText: Phaser.GameObjects.Text | null = null;

    allRelics.forEach((relic, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const posX = startX + col * 118;
      const posY = startY + row * 130;

      const relicKey = relic.id.startsWith('relic_') ? relic.id : `relic_${relic.id.replace('yokai_relic_', 'yokai_')}`;
      const fullRelic = RelicManager.getInstance().getRelicById(relicKey) || RelicManager.getInstance().getRelicById(relic.id) || relic;

      const isOwned = this.save.hasRelic(relic.id) || this.save.getRelicStar(fullRelic.id || relicKey || relic.id) > 0;
      const shards = this.save.getRelicShards(fullRelic.id || relicKey || relic.id);
      const reqShards = this.save.getRelicRequiredShards(fullRelic.id || relicKey || relic.id);
      const itemContainer = this.add.container(posX, posY);

      const itemBg = this.add.graphics();
      if (isOwned) {
        itemBg.fillStyle(0x282042, 0.95);
        itemBg.fillRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 12);
        itemBg.lineStyle(1.8, 0xffd700, 0.95);
        itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 12);
      } else {
        itemBg.fillStyle(0x191629, 0.9);
        itemBg.fillRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 12);
        itemBg.lineStyle(1.4, 0x5d4d7e, 0.75);
        itemBg.strokeRoundedRect(-itemW / 2, -itemH / 2, itemW, itemH, 12);
      }

      itemContainer.add([itemBg]);

      // Real Relic Artwork or Fallback Icon
      const possibleKeys = [
        relicKey,
        `relic_${relicKey}`,
        `relic_relic_${relicKey.replace('relic_', '')}`,
        relic.id,
        `relic_${relic.id}`
      ];
      const foundKey = possibleKeys.find(k => this.textures.exists(k));

      if (foundKey) {
        const rImg = this.add.image(0, -24, foundKey).setDisplaySize(50, 50);
        if (!isOwned) {
          rImg.setAlpha(0.6);
          if (rImg.postFX) {
            try { rImg.postFX.addColorMatrix().grayscale(1); } catch {}
          }
        }
        itemContainer.add(rImg);
      } else {
        const iconTxt = this.add.text(0, -24, relic.icon, {
          fontSize: '28px'
        }).setOrigin(0.5);
        if (!isOwned) iconTxt.setAlpha(0.6);
        itemContainer.add(iconTxt);
      }

      if (!isOwned) {
        const lockBadge = this.add.text(-itemW / 2 + 8, -itemH / 2 + 6, '🔒', { fontSize: '10px' });
        itemContainer.add(lockBadge);
      }

      // Always show real relic name! (No ???)
      const nameTxt = this.add.text(0, 10, relic.name, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10.5px',
        fontStyle: '800',
        color: isOwned ? '#ffd700' : '#e2e8f0',
        align: 'center',
        wordWrap: { width: itemW - 10 }
      }).setOrigin(0.5);

      const tagTxt = this.add.text(0, 42, isOwned ? '✓ THU THẬP' : `${shards}/${reqShards} Mảnh`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: isOwned ? '#00f5d4' : '#ffd166'
      }).setOrigin(0.5);

      itemContainer.add([nameTxt, tagTxt]);
      itemContainer.setSize(itemW, itemH);
      itemContainer.setInteractive({ useHandCursor: true });

      itemContainer.on('pointerdown', () => {
        this.audio.playSelect();
        if (selectedRelicDescText) {
          const statusStr = isOwned ? '✨ [ĐÃ MỞ KHÓA]' : `🔒 [CHƯA MỞ • Tiến độ: ${shards}/${reqShards} Mảnh]`;
          const skillStr = fullRelic.skillName
            ? `⚡ KỸ NĂNG: ${fullRelic.skillName} (Nộ: ${fullRelic.rageCost || 100}%) — ${fullRelic.skillDesc || relic.description}`
            : `⚡ TÁC DỤNG: ${relic.description}`;

          selectedRelicDescText.setText(
            `✨ ${relic.icon} ${relic.name} (${relic.japaneseName || ''}) • ${statusStr}\n` +
            `${skillStr}\n` +
            `🎯 Vượt Màn ${relic.levelNum} đạt 3★ hoặc tích lũy ${reqShards} mảnh để Đúc Thần Khí!`
          );
          selectedRelicDescText.setColor(isOwned ? '#ffd700' : '#00f5d4');
        }
      });

      elements.push(itemContainer);
    });

    // Description Box at bottom
    const descBoxY = 162;
    const descBg = this.add.graphics();
    descBg.fillStyle(0x1e1936, 0.95);
    descBg.fillRoundedRect(-cardW / 2 + 25, descBoxY - 26, cardW - 50, 52, 10);
    descBg.lineStyle(1.2, 0x5a4880, 0.8);
    descBg.strokeRoundedRect(-cardW / 2 + 25, descBoxY - 26, cardW - 50, 52, 10);
    elements.push(descBg);

    selectedRelicDescText = this.add.text(0, descBoxY, '💡 Nhấn vào bất kỳ Thần Khí nào ở trên để xem chi tiết tuyệt chiêu & truyền thuyết cổ vật.', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#adb5bd',
      align: 'center',
      wordWrap: { width: cardW - 70 }
    }).setOrigin(0.5);
    elements.push(selectedRelicDescText);

    // Close Button & Wiki Shortcut
    const wikiBtn = this.add.container(-100, 222);
    const wBg = this.add.graphics();
    wBg.fillStyle(0x7209b7, 1);
    wBg.fillRoundedRect(-110, -15, 220, 30, 10);
    wBg.lineStyle(1.5, 0xffd166, 0.95);
    wBg.strokeRoundedRect(-110, -15, 220, 30, 10);
    const wTxt = this.add.text(0, 0, '📖 TOÀN THƯ 30 THẦN KHÍ', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    wikiBtn.add([wBg, wTxt]);
    wikiBtn.setSize(220, 30).setInteractive({ useHandCursor: true });
    wikiBtn.on('pointerdown', () => {
      this.audio.playSelect();
      this.modalContainer?.destroy();
      this.modalContainer = null;
      this.openFull30RelicsCodex(1);
    });
    elements.push(wikiBtn);

    const closeBtn = this.add.container(130, 222);
    const clBg = this.add.graphics();
    clBg.fillStyle(0xd90429, 1);
    clBg.fillRoundedRect(-55, -15, 110, 30, 10);
    const clTxt = this.add.text(0, 0, 'ĐÓNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(110, 30).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });
    elements.push(closeBtn);

    this.modalContainer.add(elements);
  }

  /**
   * Bách Khoa Toàn Thư 30 Thần Khí (Full 30 Relics Codex across 10 Chapters)
   */
  private openFull30RelicsCodex(pageOrChapter: number = 0, initialWorld: string = 'all'): void {
    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = null;
    }

    this.modalContainer = RelicCodexModal.open(
      this,
      pageOrChapter,
      initialWorld,
      () => {
        this.modalContainer = null;
      }
    );
  }

  /**
   * Monster Badges Collection Modal
   */
  private openBadgesModal(): void {
    if (this.modalContainer) this.modalContainer.destroy();
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();

    this.modalContainer = this.add.container(width / 2, height / 2).setDepth(200);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.88);
    overlay.fillRect(-screenW / 2, -height / 2, screenW, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });

    const cardW = 650;
    const cardH = 520;
    const card = this.add.graphics();
    card.fillStyle(0x151226, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2, 0x00f5d4, 0.95);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    const title = this.add.text(0, -228, '🎖️ HUY HIỆU VƯỢT MÀN (STAGE BADGES)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16.5px',
      fontStyle: '900',
      color: '#00f5d4'
    }).setOrigin(0.5);

    const totalBadges = this.save.getCollectedBadgesCount();
    const subTitle = this.add.text(0, -202, `Chiến tích vượt 100 Màn Onet • ${totalBadges}/30 Huy hiệu • 🟢 Đồng | ⚪ Bạc | 🟡 Vàng`, {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    const elements: Phaser.GameObjects.GameObject[] = [overlay, card, title, subTitle];

    const startY = -168;
    const rowH = 34;
    let tooltipTxt: Phaser.GameObjects.Text;

    (levelsData as any[]).forEach((lvl, rowIdx) => {
      const posY = startY + rowIdx * rowH;
      const rowBg = this.add.graphics();
      rowBg.fillStyle(rowIdx % 2 === 0 ? 0x1d1830 : 0x161325, 0.9);
      rowBg.fillRoundedRect(-cardW / 2 + 18, posY - 14, cardW - 36, 28, 6);
      elements.push(rowBg);

      // Level title
      const lvlTxt = this.add.text(-cardW / 2 + 28, posY, `M${lvl.levelNumber}. ${lvl.title.slice(0, 16)}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10.5px',
        fontStyle: 'bold',
        color: '#adb5bd'
      }).setOrigin(0, 0.5);
      elements.push(lvlTxt);

      // 3 badges per level
      const badges = lvl.badgeRewards || [];
      const tierStartX = -50;
      const tierSpacing = 115;
      const tierColors = ['#cd7f32', '#ced4da', '#ffd700'];
      const tierLabels = ['Đồng', 'Bạc', 'Vàng'];

      badges.forEach((b: any, bIdx: number) => {
        const isOwned = this.save.hasBadge(b.id);
        const bX = tierStartX + bIdx * tierSpacing;

        const bContainer = this.add.container(bX, posY);
        const char = CharacterRegistry.get(b.characterId);
        const iconChar = char?.symbol || '🎖️';

        const bIcon = this.add.text(-40, 0, iconChar, {
          fontSize: '13px'
        }).setOrigin(0, 0.5);
        if (!isOwned) {
          bIcon.setAlpha(0.65);
        }

        const bName = this.add.text(-22, 0, `${isOwned ? '' : '🔒 '}${b.name.replace('Huy Hiệu ', '')}`, {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '9.5px',
          fontStyle: 'bold',
          color: isOwned ? tierColors[bIdx] : '#8e9aaf'
        }).setOrigin(0, 0.5);

        bContainer.add([bIcon, bName]);
        bContainer.setSize(105, 24);
        bContainer.setInteractive({ useHandCursor: true });
        bContainer.on('pointerdown', () => {
          this.audio.playSelect();
          const tierStr = bIdx === 0 ? 'Dễ (Đồng)' : bIdx === 1 ? 'Vừa (Bạc)' : 'Khó (Vàng)';
          const msg = isOwned
            ? `🎖️ ${b.name} (${tierStr}): Đã sở hữu khi vượt qua Màn ${lvl.levelNumber}!`
            : `🔒 ${b.name}: Vượt qua Màn ${lvl.levelNumber} ở độ khó ${tierStr} để nhận! (Tối đa 1 chiếc)`;
          tooltipTxt.setText(msg);
          tooltipTxt.setColor(isOwned ? '#00f5d4' : '#ffd166');
        });

        elements.push(bContainer);
      });
    });

    // Tooltip info bar
    const tipY = 186;
    tooltipTxt = this.add.text(0, tipY, '💡 Nhấn vào từng huy hiệu để xem điều kiện mở khóa & giới hạn sở hữu.', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#adb5bd'
    }).setOrigin(0.5);
    elements.push(tooltipTxt);

    // Return to Library button
    const closeBtn = this.add.container(0, 226);
    const clBg = this.add.graphics();
    clBg.fillStyle(0x00b4d8, 1);
    clBg.fillRoundedRect(-110, -15, 220, 30, 10);
    const clTxt = this.add.text(0, 0, '🌐 VỀ THƯ VIỆN VẠN GIỚI', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#05192d'
    }).setOrigin(0.5);
    closeBtn.add([clBg, clTxt]);
    closeBtn.setSize(220, 30).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { this.modalContainer?.destroy(); this.modalContainer = null; });
    elements.push(closeBtn);

    this.modalContainer.add(elements);
  }
}
