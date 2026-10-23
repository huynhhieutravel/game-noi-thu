import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { FONT_UI, FONT_DISPLAY } from '../styles/typography';

export interface StoryChapterDef {
  id: string;
  actNumber: string;
  shortLabel: string;
  title: string;
  realmName: string;
  quote: string;
  imageKey: string;
  cast: string;
  relic: string;
  originText: string;
  magicText: string;
  secretText: string;
  targetLevel: number;
}

export class StoryModal {
  private static activeModal: Phaser.GameObjects.Container | null = null;

  public static readonly CHAPTERS: StoryChapterDef[] = [
    {
      id: 'chapter_1',
      actNumber: 'HỒI I',
      shortLabel: '⛩️ HỒI I: BÁCH QUỶ',
      title: 'CỔNG THIÊNG NỔI GIÓ • BÁCH QUỶ DẠ HÀNH',
      realmName: 'CÕI PHÙ TANG • THẦN ĐIỆN INARI',
      quote: '"Khi ánh nguyệt thực nhuộm đỏ hồ nước thiêng, ranh giới giữa hai bờ sinh tử chỉ mỏng như một sợi tơ."',
      imageKey: 'story_art_yokai_origin',
      cast: '🦊 Linh Hồ Inari • 🐍 Bát Kỳ Đại Xà • 👹 Aka Oni',
      relic: '🔮 Gương Thần Yata no Kagami',
      originText: 'Khi màn đêm buông xuống trên đất nước Phù Tang, phong ấn vạn cổ tại Cổng Torii Thiêng Fushimi Inari bất ngờ nứt vỡ. Một luồng khí đen cuồn cuộn xé toạc không gian, giải phóng 108 linh hồn yêu quái cổ đại vào cõi nhân gian. Bách Quỷ Dạ Hành (Hyakki Yagyo) bắt đầu trỗi dậy, đe dọa biến thế giới thanh bình thành biển lửa vĩnh cửu.',
      magicText: 'Với thiên mệnh là Âm Dương Sư thừa kế huyết mạch Cáo Thần Inari, bạn lĩnh ngộ bí pháp "Song Khúc Quy Nguyên". Theo cổ luật, mỗi linh hồn bị tha hóa chỉ có thể được thanh tẩy khi tìm thấy bản thể đồng điệu qua một đường dẫn không quá 2 góc gập. Từng cặp thẻ nối lại là một tầng chướng khí được gột rửa, đưa linh hồn trở về chánh đạo.',
      secretText: 'Dưới chân núi tuyết sừng sững, tiếng gầm của Đại Boss Thần Thoại Bát Kỳ Đại Xà bắt đầu rung chuyển địa tầng. Thu thập đủ mảnh vỡ Gương Thần Yata là chìa khóa duy nhất để phong ấn vĩnh viễn tà thần tám đầu.',
      targetLevel: 1
    },
    {
      id: 'chapter_2',
      actNumber: 'HỒI II',
      shortLabel: '⏳ HỒI II: AI CẬP',
      title: 'BÃO CÁT THỜI GIAN • LỜI NGUYỀN PHARAON',
      realmName: 'CÕI SA MẠC CỔ ĐẠI • DÒNG SÔNG NILE',
      quote: '"Dưới nghìn tầng cát nóng, linh hồn các vị vua cổ đại vẫn lắng nghe nhịp thở của dòng sông định mệnh."',
      imageKey: 'story_art_egypt',
      cast: '🐕 Tử Thần Anubis • 🦅 Thần Bầu Trời Horus • 🐍 Thần Rắn Apep',
      relic: '☥ Biểu Tượng Sinh Mệnh Ankh',
      originText: 'Vết rách không gian lan rộng từ cõi Phù Tang đã chấn động đến thung lũng Kim Tự Tháp nghìn năm. Cát vàng sa mạc cuộn trào thành những cơn bão cát ma quái. Tử Thần Anubis và Chúa Tể Sa Mạc Set bị tà khí xâm chiếm, phong tỏa dòng nước thiêng sông Nile, giam cầm linh hồn các vị Pharaon trong lăng mộ vĩnh hằng.',
      magicText: 'Âm Dương Sư cùng Linh Hồ vượt qua biển cát bỏng rát, vận dụng pháp trận Thần Khí Thời Gian để hóa giải những bẫy nguyền rủa cổ xưa. Các biểu tượng chữ tượng hình và thần thú sa mạc đòi hỏi sự tinh tường tuyệt đối, bởi chỉ một sai lầm nhỏ sẽ đánh thức bầy bọ hung xác ướp nghìn năm.',
      secretText: 'Lời sấm truyền trên vách đá lăng mộ tiết lộ: Thần Rắn Apep đang tích tụ sức mạnh bóng đêm để nuốt chửng Mặt Trời Ra. Chỉ có Biểu Tượng Bất Tử Ankh mới có thể thắp lại ngọn đuốc quang minh cứu rỗi lục địa cát.',
      targetLevel: 11
    },
    {
      id: 'chapter_3',
      actNumber: 'HỒI III',
      shortLabel: '⚡ HỒI III: OLYMPUS',
      title: 'SẤM SÉT VỰC THẦN • ĐỈNH NÚI OLYMPUS',
      realmName: 'CÕI THẦN THOẠI HY LẠP • NÚI THẦN',
      quote: '"Ngay cả sấm sét quyền năng của các vị thần cũng có thể bị bóng tối làm cho mù quáng."',
      imageKey: 'story_art_olympus',
      cast: '⚡ Thần Sấm Zeus • 🐍 Quỷ Xà Medusa • 🐂 Quái Vật Minotaur',
      relic: '⚡ Ngọn Sấm Sét Vạn Năng Của Zeus',
      originText: 'Trên đỉnh Olympus phủ mây trắng huyền thoại, ngọn lửa vĩnh cửu của Titan Prometheus bỗng nhiên chuyển sang màu tím thẫm u ám. Thần Sấm Zeus bị mê hoặc bởi tiếng thì thầm từ hư không, giáng sấm sét hủy diệt xuống các đền thờ thần thoại. Mê cung dưới lòng đất của Minotaur sụp đổ, thả xích hàng trăm sinh vật quái dị.',
      magicText: 'Giữa biển sấm sét chớp giật kinh hoàng, người chơi phải đối đầu với ánh mắt hóa đá của Medusa và sức mạnh cuồng bạo của dũng sĩ Minotaur. Phép liên kết thẻ bài chuyển hóa thành những đường lôi điện thuần khiết, rọi sáng mê cung tăm tối và phá vỡ ảo ảnh ma thuật.',
      secretText: 'Zeus không hề phản bội — ngài đã tự phong ấn thần thức để bảo vệ thế giới khỏi kẻ thao túng tối thượng. Thanh sấm sét hoàng kim chính là mảnh ghép thứ ba kết nối chiếc la bàn đa vũ trụ.',
      targetLevel: 21
    },
    {
      id: 'chapter_4',
      actNumber: 'HỒI IV',
      shortLabel: '⚔️ HỒI IV: CÔN LÔN',
      title: 'VẠN KIẾM PHI THĂNG • CÔN LÔN TIÊN CẢNH',
      realmName: 'CÕI TIÊN HIỆP & TAM GIỚI • ĐỈNH CÔN LÔN',
      quote: '"Kiếm vốn vô tình, nhưng tâm người cầm kiếm quyết định sinh diệt của một cõi thái bình."',
      imageKey: 'story_art_kunlun',
      cast: '🦊 Cửu Vĩ Thiên Hồ • 🗡️ Kiếm Tiên Vô Danh • 🐉 Hắc Long Ma Tôn',
      relic: '🗡️ Hiên Viên Kiếm Thái Cực',
      originText: 'Côn Lôn Sơn bồng bềnh mây khói, nơi giao thoa giữa Tiên giới và Ma giới bị một luồng kiếm khí hắc ám rạch đôi. Cửu Vĩ Thiên Hồ thức tỉnh sau mười ngàn năm tu luyện, cùng Kiếm Tiên Vô Danh rơi vào ma đạo. Hắc Long Ma Tôn từ đáy hàn đầm trỗi dậy, biến tiên hoa linh thảo thành độc đầm chết chóc.',
      magicText: 'Âm Dương Sư kết hợp kiếm quyết ngũ hành với thuật nối linh bài. Mỗi đường kiếm trảm là một nhịp luân hồi tịnh hóa tâm ma. Người chơi phải thấu suốt lẽ biến ảo của âm dương bát quái để chế ngự ngọn lửa Cửu Hồ Tam Muội Chân Hỏa.',
      secretText: 'Cổ bảo Hiên Viên Kiếm hé lộ rằng các cõi giới không độc lập — chúng là những trụ cột chống đỡ thiên địa. Nếu một cõi sụp đổ, toàn bộ đa vũ trụ sẽ rơi vào vòng xoáy hư vô không lối thoát.',
      targetLevel: 31
    },
    {
      id: 'chapter_5',
      actNumber: 'HỒI V',
      shortLabel: '🌊 HỒI V: THẤT HẢI',
      title: 'SÓNG NGẦM ĐẠI DƯƠNG • BÓNG MA KRAKEN',
      realmName: 'CÕI THỦY CUNG & HẢI TẶC • VÙNG NƯỚC ĐEN',
      quote: '"Đáy đại dương sâu thẳm giấu kín những bí mật cổ xưa hơn cả những vì sao."',
      imageKey: 'story_art_kraken',
      cast: '🐙 Hải Quái Kraken • 🏴‍☠️ Thuyền Trưởng Vong Hồn • 🧜‍♀️ Tiên Cá Biển Sâu',
      relic: '🔱 Đinh Ba Thần Poseidon',
      originText: 'Bên dưới Tam Giác Quỷ Bermuda và những rạn san hô phát quang, một tiếng gầm chấn động đáy biển sâu vang lên. Hải Quái Kraken trỗi dậy, quấn chặt các hạm đội hải tặc ma quái và kéo chìm cả vương quốc Thủy Tề xuống vực thẳm rãnh Mariana. Ánh sáng mặt trời bị ngăn cách bởi màn sương đen độc tố.',
      magicText: 'Hành trình dưới áp lực nước ngàn cân buộc người chơi phải thao tác thần tốc. Những xúc tu khổng lồ và bầy lươn điện ngầm sẵn sàng phong tỏa bàn cờ. Bằng cách nối những viên ngọc trai linh quang và bảo vật biển cả, luồng hải lưu thánh khiết dần được khai thông.',
      secretText: 'Đinh Ba Thần Poseidon bị đánh cắp bởi kẻ đứng trong bóng tối. Một cánh cổng không gian ngầm dưới đáy rãnh biển đang dẫn thẳng tới Vực Thẳm Hỗn Độn — nơi trận chiến cuối cùng đang chờ đón.',
      targetLevel: 41
    },
    {
      id: 'chapter_6',
      actNumber: 'HỒI VI',
      shortLabel: '🌌 HỒI VI: HỖN ĐỘN',
      title: 'HỘI TỤ VẠN GIỚI • ĐẠI CHIẾN HỖN ĐỘN',
      realmName: 'VỰC THẲM HƯ KHÔNG • TRẬN CHIẾN ĐỈNH PHONG',
      quote: '"Khi vạn linh quy nhất, ánh sáng từ trái tim dũng cảm sẽ xua tan bóng tối ngàn năm."',
      imageKey: 'story_art_chaos',
      cast: '👑 Chúa Tể Hư Không • 🦊 Thần Thú Cửu Vĩ • 🐉 Long Thần Ryujin',
      relic: '🌌 Ngọc Tinh Cầu Hỗn Độn Đa Vũ Trụ',
      originText: 'Tất cả các manh mối từ 10 cõi giới đã quy về một điểm: Kẻ thao túng đứng sau sự tha hóa của muôn loài chính là Chúa Tể Hư Không (Void Overlord), kẻ muốn nghiền nát ký ức và linh hồn muôn cõi thành cát bụi hư vô để tái lập trật tự tĩnh lặng tuyệt đối.',
      magicText: 'Trong trận chiến đỉnh cao, toàn bộ 10 Thần Thú Đồng Hành — từ Cáo Inari, Rồng Ryujin, Phượng Hoàng Lửa Hinotori đến Bạch Hổ và Huyền Vũ — đồng loạt thức tỉnh thần lực. Trận cờ Onet trở thành chiến trường thiêng nơi các vị thần và quái thú cùng hợp nhất sức mạnh.',
      secretText: 'Chiến thắng không phải là tiêu diệt, mà là thấu hiểu và liên kết. Khi cặp linh hồn cuối cùng được hòa hợp, cánh Cổng Vạn Giới bừng sáng ánh bình minh, mở ra kỷ nguyên thái bình thịnh vượng cho toàn cõi thần thoại.',
      targetLevel: 51
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
    let activeChapterIdx = 0;

    // Content Containers (Spacious 2-column layout without footer clutter)
    const headerContainer = scene.add.container(0, -cardH / 2 + 30);
    const tabsContainer = scene.add.container(0, -cardH / 2 + 74);
    const leftArtContainer = scene.add.container(-cardW / 2 + 240, 42);
    const rightProseContainer = scene.add.container(cardW / 2 - 280, 42);

    modal.add([headerContainer, tabsContainer, leftArtContainer, rightProseContainer]);

    const closeModal = () => {
      audio.playSelect();
      modal.destroy();
      StoryModal.activeModal = null;
      onClose?.();
    };

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
      const emblemIcon = scene.add.text(-cardW / 2 + 52, 0, '📖', { fontSize: '20px' }).setOrigin(0.5);
      headerContainer.add([emblemBox, emblemIcon]);

      const titleTxt = scene.add.text(-cardW / 2 + 82, -8, 'BÁCH KHOA VẠN GIỚI KÝ • BIÊN NIÊN SỬ THẦN THOẠI', {
        fontFamily: FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const subTitleTxt = scene.add.text(
        -cardW / 2 + 82,
        14,
        'Huyền sử 10 cõi giới, phong ấn Bách Quỷ & hành trình định mệnh của Âm Dương Sư',
        {
          fontFamily: FONT_UI,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#94a3b8'
        }
      ).setOrigin(0, 0.5);

      // Chapter badge in header right
      const chBadgeW = 160;
      const chBadgeH = 30;
      const chBadgeX = cardW / 2 - 130;
      const bGfx = scene.add.graphics();
      bGfx.fillStyle(0x1a1833, 0.95);
      bGfx.fillRoundedRect(chBadgeX - chBadgeW / 2, -chBadgeH / 2, chBadgeW, chBadgeH, 8);
      bGfx.lineStyle(1.2, 0x00f5d4, 0.85);
      bGfx.strokeRoundedRect(chBadgeX - chBadgeW / 2, -chBadgeH / 2, chBadgeW, chBadgeH, 8);

      const bTxt = scene.add.text(chBadgeX, 0, `📜 HỒI ${activeChapterIdx + 1} / ${StoryModal.CHAPTERS.length}`, {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      headerContainer.add([titleTxt, subTitleTxt, bGfx, bTxt]);
    };

    // ==========================================
    // RENDER CHAPTER TABS
    // ==========================================
    const renderTabs = () => {
      tabsContainer.removeAll(true);

      const tabW = 156;
      const tabH = 34;
      const tabSpacing = 10;
      const totalW = StoryModal.CHAPTERS.length * (tabW + tabSpacing) - tabSpacing;
      const startX = -totalW / 2 + tabW / 2;

      StoryModal.CHAPTERS.forEach((ch, idx) => {
        const tX = startX + idx * (tabW + tabSpacing);
        const isActive = activeChapterIdx === idx;

        const tabBtn = scene.add.container(tX, 0);
        const tBg = scene.add.graphics();
        tBg.fillStyle(isActive ? 0x221c3b : 0x111425, 0.95);
        tBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 9);
        tBg.lineStyle(1.4, isActive ? 0x00f5d4 : 0x2e3558, isActive ? 0.95 : 0.6);
        tBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 9);

        const tTxt = scene.add.text(0, 0, ch.shortLabel, {
          fontFamily: FONT_UI,
          fontSize: '11px',
          fontStyle: '900',
          color: isActive ? '#00f5d4' : '#94a3b8'
        }).setOrigin(0.5);

        tabBtn.add([tBg, tTxt]);
        tabBtn.setSize(tabW, tabH).setInteractive({ useHandCursor: true });
        tabBtn.on('pointerdown', () => {
          if (activeChapterIdx !== idx) {
            audio.playSelect();
            haptic.light();
            activeChapterIdx = idx;
            renderHeader();
            renderTabs();
            renderContent();
          }
        });
        tabsContainer.add(tabBtn);
      });
    };

    // ==========================================
    // RENDER CONTENT (LEFT ART + RIGHT PROSE)
    // ==========================================
    const renderContent = () => {
      leftArtContainer.removeAll(true);
      rightProseContainer.removeAll(true);

      const ch = StoryModal.CHAPTERS[activeChapterIdx];

      // ------------------------------------------
      // 1. LEFT PANEL: CINEMATIC ARTWORK & MYTHIC INFO
      // ------------------------------------------
      const artW = 430;
      const artH = 450;

      const artBg = scene.add.graphics();
      artBg.fillStyle(0x0e1122, 0.98);
      artBg.fillRoundedRect(-artW / 2, -artH / 2, artW, artH, 16);
      artBg.lineStyle(1.8, 0xd4af37, 0.9);
      artBg.strokeRoundedRect(-artW / 2, -artH / 2, artW, artH, 16);
      artBg.lineStyle(1.0, 0x2b3352, 0.4);
      artBg.strokeRoundedRect(-artW / 2 + 5, -artH / 2 + 5, artW - 10, artH - 10, 12);
      leftArtContainer.add(artBg);

      // Artwork frame (400 x 225 px -> 16:9 cinematic ratio)
      const imgW = 400;
      const imgH = 225;
      const imgY = -artH / 2 + imgH / 2 + 14;

      if (scene.textures.exists(ch.imageKey)) {
        const artImg = scene.add.image(0, imgY, ch.imageKey).setDisplaySize(imgW, imgH);
        leftArtContainer.add(artImg);

        // Subtle glowing border around artwork
        const imgFrame = scene.add.graphics();
        imgFrame.lineStyle(1.6, 0xffd700, 0.9);
        imgFrame.strokeRoundedRect(-imgW / 2, imgY - imgH / 2, imgW, imgH, 10);
        leftArtContainer.add(imgFrame);
      } else {
        const placeholderBg = scene.add.graphics();
        placeholderBg.fillStyle(0x161a30, 1);
        placeholderBg.fillRoundedRect(-imgW / 2, imgY - imgH / 2, imgW, imgH, 10);
        const phIcon = scene.add.text(0, imgY, '⛩️', { fontSize: '48px' }).setOrigin(0.5);
        leftArtContainer.add([placeholderBg, phIcon]);
      }

      // Information Pills below Artwork
      const infoBoxW = 400;
      const startInfoY = 46;

      // Realm Pill
      const rPillH = 32;
      const rPillGfx = scene.add.graphics();
      rPillGfx.fillStyle(0x181730, 0.95);
      rPillGfx.fillRoundedRect(-infoBoxW / 2, startInfoY - rPillH / 2, infoBoxW, rPillH, 8);
      rPillGfx.lineStyle(1.1, 0x00f5d4, 0.7);
      rPillGfx.strokeRoundedRect(-infoBoxW / 2, startInfoY - rPillH / 2, infoBoxW, rPillH, 8);
      const rPillTxt = scene.add.text(0, startInfoY, `⛩️ CÕI GIỚI: ${ch.realmName}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0.5);

      // Cast Pill
      const cPillY = startInfoY + 40;
      const cPillH = 32;
      const cPillGfx = scene.add.graphics();
      cPillGfx.fillStyle(0x181730, 0.95);
      cPillGfx.fillRoundedRect(-infoBoxW / 2, cPillY - cPillH / 2, infoBoxW, cPillH, 8);
      cPillGfx.lineStyle(1.1, 0xffd700, 0.6);
      cPillGfx.strokeRoundedRect(-infoBoxW / 2, cPillY - cPillH / 2, infoBoxW, cPillH, 8);
      const cPillTxt = scene.add.text(0, cPillY, `👥 TRỌNG TÂM: ${ch.cast}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd700'
      }).setOrigin(0.5);

      // Relic Pill
      const relPillY = cPillY + 40;
      const relPillH = 32;
      const relPillGfx = scene.add.graphics();
      relPillGfx.fillStyle(0x181730, 0.95);
      relPillGfx.fillRoundedRect(-infoBoxW / 2, relPillY - relPillH / 2, infoBoxW, relPillH, 8);
      relPillGfx.lineStyle(1.1, 0xd946ef, 0.7);
      relPillGfx.strokeRoundedRect(-infoBoxW / 2, relPillY - relPillH / 2, infoBoxW, relPillH, 8);
      const relPillTxt = scene.add.text(0, relPillY, `🏺 THẦN KHÍ TRẤN GIỚI: ${ch.relic}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#f0abfc'
      }).setOrigin(0.5);

      // Mythic Codex Seal Badge at bottom
      const sealY = relPillY + 38;
      const sealGfx = scene.add.graphics();
      sealGfx.fillStyle(0x12162a, 0.85);
      sealGfx.fillRoundedRect(-infoBoxW / 2, sealY - 14, infoBoxW, 28, 6);
      sealGfx.lineStyle(1, 0xd4af37, 0.4);
      sealGfx.strokeRoundedRect(-infoBoxW / 2, sealY - 14, infoBoxW, 28, 6);
      const sealTxt = scene.add.text(0, sealY, '📜 BẢN THẢO THẦN KHÍ TRẤN VẠN GIỚI • ĐÃ PHONG ẤN BẢO TOÀN', {
        fontFamily: FONT_UI,
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0.5);

      leftArtContainer.add([rPillGfx, rPillTxt, cPillGfx, cPillTxt, relPillGfx, relPillTxt, sealGfx, sealTxt]);

      // ------------------------------------------
      // 2. RIGHT PANEL: DEEP NARRATIVE PROSE (Width 540px)
      // ------------------------------------------
      const proseW = 540;
      const proseH = 450;

      const pBg = scene.add.graphics();
      pBg.fillStyle(0x0e1122, 0.98);
      pBg.fillRoundedRect(-proseW / 2, -proseH / 2, proseW, proseH, 16);
      pBg.lineStyle(1.8, 0xd4af37, 0.9);
      pBg.strokeRoundedRect(-proseW / 2, -proseH / 2, proseW, proseH, 16);
      pBg.lineStyle(1.0, 0x2b3352, 0.4);
      pBg.strokeRoundedRect(-proseW / 2 + 5, -proseH / 2 + 5, proseW - 10, proseH - 10, 12);
      rightProseContainer.add(pBg);

      // Chapter Title & Act
      const chTitle = scene.add.text(-proseW / 2 + 22, -proseH / 2 + 22, ch.title, {
        fontFamily: FONT_DISPLAY,
        fontSize: '16.5px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0, 0.5);

      const chRealmTag = scene.add.text(-proseW / 2 + 22, -proseH / 2 + 43, `${ch.actNumber} • ${ch.realmName}`, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0, 0.5);

      // Poetic Quote Box
      const qBoxW = proseW - 44;
      const qBoxH = 34;
      const qBoxY = -proseH / 2 + 74;
      const qBoxGfx = scene.add.graphics();
      qBoxGfx.fillStyle(0x17152b, 0.95);
      qBoxGfx.fillRoundedRect(-qBoxW / 2, qBoxY - qBoxH / 2, qBoxW, qBoxH, 7);
      qBoxGfx.lineStyle(1.1, 0xffbe0b, 0.6);
      qBoxGfx.strokeRoundedRect(-qBoxW / 2, qBoxY - qBoxH / 2, qBoxW, qBoxH, 7);

      const qTxt = scene.add.text(0, qBoxY, ch.quote, {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: 'italic',
        color: '#fef08a',
        align: 'center',
        wordWrap: { width: qBoxW - 20 }
      }).setOrigin(0.5);

      rightProseContainer.add([chTitle, chRealmTag, qBoxGfx, qTxt]);

      // ========================================================
      // 3 RICH NARRATIVE PROSE BLOCKS (DYNAMIC TOP-DOWN FLOW)
      // Eliminates text overlap bugs by dynamically computing Y
      // ========================================================
      let currY = -proseH / 2 + 102;
      const textWrapW = qBoxW;

      // Section 1: Origin
      const sec1Header = scene.add.text(-proseW / 2 + 22, currY, '🔥 1. BIẾN CỐ KHỞI NGUYÊN', {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#ff4d6d'
      }).setOrigin(0, 0);
      currY += sec1Header.height + 4;

      const sec1Desc = scene.add.text(-proseW / 2 + 22, currY, ch.originText, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f8fafc',
        wordWrap: { width: textWrapW },
        lineSpacing: 3
      }).setOrigin(0, 0);
      currY += sec1Desc.height + 12;

      // Section 2: Magic & Gameplay connection
      const sec2Header = scene.add.text(-proseW / 2 + 22, currY, '⚡ 2. BÍ PHÁP THANH TẨY SONG KHÚC', {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }).setOrigin(0, 0);
      currY += sec2Header.height + 4;

      const sec2Desc = scene.add.text(-proseW / 2 + 22, currY, ch.magicText, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#cbd5e1',
        wordWrap: { width: textWrapW },
        lineSpacing: 3
      }).setOrigin(0, 0);
      currY += sec2Desc.height + 12;

      // Section 3: Mythic Secret & Boss Threat
      const sec3Header = scene.add.text(-proseW / 2 + 22, currY, '🌌 3. MANH MỐI THẦN KHÍ & ĐẠI BOSS', {
        fontFamily: FONT_UI,
        fontSize: '11.5px',
        fontStyle: '900',
        color: '#e879f9'
      }).setOrigin(0, 0);
      currY += sec3Header.height + 4;

      const sec3Desc = scene.add.text(-proseW / 2 + 22, currY, ch.secretText, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#c4b5fd',
        wordWrap: { width: textWrapW },
        lineSpacing: 3
      }).setOrigin(0, 0);

      rightProseContainer.add([sec1Header, sec1Desc, sec2Header, sec2Desc, sec3Header, sec3Desc]);

      // Action Buttons at bottom of right panel
      const actY = proseH / 2 - 34;

      // Prev Act button
      const hasPrev = activeChapterIdx > 0;
      const prevBtn = scene.add.container(-proseW / 2 + 65, actY);
      const prGfx = scene.add.graphics();
      prGfx.fillStyle(hasPrev ? 0x181c33 : 0x0c0e18, 0.95);
      prGfx.fillRoundedRect(-50, -16, 100, 32, 8);
      prGfx.lineStyle(1.1, hasPrev ? 0x00f5d4 : 0x222638, hasPrev ? 0.9 : 0.4);
      prGfx.strokeRoundedRect(-50, -16, 100, 32, 8);
      const prTxt = scene.add.text(0, 0, '◀ HỒI TRƯỚC', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: hasPrev ? '#00f5d4' : '#475569'
      }).setOrigin(0.5);
      prevBtn.add([prGfx, prTxt]);
      if (hasPrev) {
        prevBtn.setSize(100, 32).setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
          audio.playSelect();
          haptic.light();
          activeChapterIdx--;
          renderHeader();
          renderTabs();
          renderContent();
        });
      }

      // Next Act button
      const hasNext = activeChapterIdx < StoryModal.CHAPTERS.length - 1;
      const nextBtn = scene.add.container(-proseW / 2 + 180, actY);
      const nxGfx = scene.add.graphics();
      nxGfx.fillStyle(hasNext ? 0x181c33 : 0x0c0e18, 0.95);
      nxGfx.fillRoundedRect(-50, -16, 100, 32, 8);
      nxGfx.lineStyle(1.1, hasNext ? 0x00f5d4 : 0x222638, hasNext ? 0.9 : 0.4);
      nxGfx.strokeRoundedRect(-50, -16, 100, 32, 8);
      const nxTxt = scene.add.text(0, 0, 'HỒI TIẾP ▶', {
        fontFamily: FONT_UI,
        fontSize: '10.5px',
        fontStyle: '900',
        color: hasNext ? '#00f5d4' : '#475569'
      }).setOrigin(0.5);
      nextBtn.add([nxGfx, nxTxt]);
      if (hasNext) {
        nextBtn.setSize(100, 32).setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
          audio.playSelect();
          haptic.light();
          activeChapterIdx++;
          renderHeader();
          renderTabs();
          renderContent();
        });
      }

      // Action: Jump to level
      const playBtn = scene.add.container(proseW / 2 - 120, actY);
      const plGfx = scene.add.graphics();
      plGfx.fillStyle(0xd90429, 0.98);
      plGfx.fillRoundedRect(-100, -17, 200, 34, 9);
      plGfx.lineStyle(1.5, 0xffd700, 0.95);
      plGfx.strokeRoundedRect(-100, -17, 200, 34, 9);
      const plTxt = scene.add.text(0, 0, `▶ CHINH PHỤC (MÀN ${ch.targetLevel})`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);
      playBtn.add([plGfx, plTxt]);
      playBtn.setSize(200, 34).setInteractive({ useHandCursor: true });
      playBtn.on('pointerdown', () => {
        audio.playSelect();
        closeModal();
        scene.scene.start('GameScene', { levelNumber: ch.targetLevel });
      });
      playBtn.on('pointerover', () => {
        plGfx.clear();
        plGfx.fillStyle(0xef233c, 1);
        plGfx.fillRoundedRect(-100, -17, 200, 34, 9);
        plGfx.lineStyle(1.8, 0xffe066, 1);
        plGfx.strokeRoundedRect(-100, -17, 200, 34, 9);
      });
      playBtn.on('pointerout', () => {
        plGfx.clear();
        plGfx.fillStyle(0xd90429, 0.98);
        plGfx.fillRoundedRect(-100, -17, 200, 34, 9);
        plGfx.lineStyle(1.5, 0xffd700, 0.95);
        plGfx.strokeRoundedRect(-100, -17, 200, 34, 9);
      });

      rightProseContainer.add([prevBtn, nextBtn, playBtn]);
    };

    renderHeader();
    renderTabs();
    renderContent();

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
