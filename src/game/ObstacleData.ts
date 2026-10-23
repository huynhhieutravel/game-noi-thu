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

export class ObstacleData {
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
}
