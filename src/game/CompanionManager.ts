import { CompanionConfig } from '../types';

export const COMPANIONS: Record<string, CompanionConfig> = {
  inari_kitsune: {
    id: 'inari_kitsune',
    name: 'Cáo Inari',
    title: 'Hồ Ly Thần Bí',
    icon: '🦊',
    element: 'spirit',
    themeColor: 0xff758f,
    skillName: 'Linh Hồ Xuất Kích',
    skillDesc: 'Tự động tìm & giải cứu 2 cặp ô trên bàn cờ',
    cost: 0,
    unlockReqDesc: 'Mặc định (Miễn phí)'
  },
  ryujin_pearl: {
    id: 'ryujin_pearl',
    name: 'Rồng Ryujin',
    title: 'Long Vương Biển Sâu',
    icon: '🐉',
    element: 'water',
    themeColor: 0x00f5d4,
    skillName: 'Ngưng Đọng Thời Gian',
    skillDesc: 'Đóng băng thời gian đếm ngược trong 8 giây',
    cost: 300,
    unlockReqDesc: '300 Xu hoặc Chương 2'
  },
  hi_no_tori: {
    id: 'hi_no_tori',
    name: 'Hi-no-tori',
    title: 'Bất Tử Hỏa Điểu',
    icon: '🔥',
    element: 'fire',
    themeColor: 0xff595e,
    skillName: 'Hỏa Ngục Thiêu Chướng',
    skillDesc: 'Quét lửa thiêu rụi toàn bộ Băng, Đá và Khóa',
    cost: 600,
    unlockReqDesc: '600 Xu hoặc Chương 3'
  }
};

export class CompanionManager {
  public static get(id: string): CompanionConfig {
    return COMPANIONS[id] || COMPANIONS['inari_kitsune'];
  }

  public static getAll(): CompanionConfig[] {
    return Object.values(COMPANIONS);
  }
}
