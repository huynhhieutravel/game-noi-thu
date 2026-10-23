import { AchievementDefinition } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_win',
    title: 'Tập Sự Trừ Tà',
    description: 'Vượt qua màn 1 của Chiến dịch',
    icon: '⛩️',
    badgeKey: 'badge_bronze',
    rewardDiamonds: 15,
    playerTitleReward: 'Tập Sự Trừ Tà',
    category: 'progression'
  },
  {
    id: 'shrine_guardian_10',
    title: 'Hộ Thần Fushimi',
    description: 'Chinh phục toàn bộ 10 màn Hồi I Cõi Phù Tang',
    icon: '⛩️',
    badgeKey: 'badge_divine_shrine',
    rewardDiamonds: 35,
    rewardUniversalShards: 2,
    playerTitleReward: 'Hộ Thần Fushimi',
    category: 'progression'
  },
  {
    id: 'stars_30',
    title: 'Tinh Anh Thám Hiểm',
    description: 'Thu thập tổng cộng 30 Ngôi Sao Chiến dịch',
    icon: '⭐',
    badgeKey: 'badge_silver',
    rewardDiamonds: 25,
    playerTitleReward: 'Tinh Anh Thám Hiểm',
    category: 'progression'
  },
  {
    id: 'stars_100',
    title: 'Bậc Thầy Tinh Tú',
    description: 'Thu thập 100 Ngôi Sao Chiến dịch',
    icon: '✨',
    badgeKey: 'badge_gold',
    rewardDiamonds: 60,
    rewardUniversalShards: 3,
    playerTitleReward: 'Bậc Thầy Tinh Tú',
    category: 'progression'
  },
  {
    id: 'stars_250',
    title: 'Chí Tôn Thiên Giới',
    description: 'Thu thập 250 Ngôi Sao Chiến dịch',
    icon: '🌌',
    badgeKey: 'badge_gold',
    rewardDiamonds: 100,
    rewardUniversalShards: 5,
    playerTitleReward: 'Chí Tôn Thiên Giới',
    category: 'progression'
  },
  {
    id: 'combo_5',
    title: 'Liên Kích Bậc Thầy',
    description: 'Đạt chuỗi Combo liên tiếp x5 trong một ván đấu',
    icon: '⚡',
    badgeKey: 'badge_combo_master',
    rewardDiamonds: 20,
    playerTitleReward: 'Liên Kích Bậc Thầy',
    category: 'combo'
  },
  {
    id: 'combo_10',
    title: 'Thần Tốc Nối Thú',
    description: 'Đạt chuỗi Combo thần tốc x10 không đứt quãng',
    icon: '🔥',
    badgeKey: 'badge_combo_master',
    rewardDiamonds: 40,
    rewardUniversalShards: 2,
    playerTitleReward: 'Thần Tốc Nối Thú',
    category: 'combo'
  },
  {
    id: 'speed_demon',
    title: 'Tia Chớp Bạc',
    description: 'Vượt qua 1 màn chơi trong vòng 35 giây',
    icon: '⏱️',
    badgeKey: 'badge_speed_god',
    rewardDiamonds: 30,
    playerTitleReward: 'Tia Chớp Bạc',
    category: 'battle'
  },
  {
    id: 'speed_god_sub30',
    title: 'Thần Tốc Vô Cực',
    description: 'Vượt qua 1 màn chơi dưới 30 giây',
    icon: '⚡',
    badgeKey: 'badge_speed_god',
    rewardDiamonds: 45,
    rewardUniversalShards: 3,
    playerTitleReward: 'Thần Tốc Vô Cực',
    category: 'battle'
  },
  {
    id: 'first_boss',
    title: 'Sát Quỷ Sư',
    description: 'Đánh bại Đại Boss Thần Thoại đầu tiên (Màn 10)',
    icon: '🗡️',
    badgeKey: 'badge_boss_slayer',
    rewardDiamonds: 25,
    playerTitleReward: 'Sát Quỷ Sư',
    category: 'battle'
  },
  {
    id: 'boss_slayer_5',
    title: 'Kẻ Trấn Áp Yêu Thú',
    description: 'Hạ gục ít nhất 5 Màn Đại Boss Thần Thoại',
    icon: '👑',
    badgeKey: 'badge_boss_slayer',
    rewardDiamonds: 50,
    rewardUniversalShards: 3,
    playerTitleReward: 'Trấn Áp Yêu Thú',
    category: 'battle'
  },
  {
    id: 'survival_wave_5',
    title: 'Chiến Binh Bất Tử',
    description: 'Sống sót vượt qua Wave 5 Chế độ Sinh Tồn',
    icon: '🛡️',
    badgeKey: 'badge_survival_hero',
    rewardDiamonds: 35,
    playerTitleReward: 'Chiến Binh Bất Tử',
    category: 'battle'
  },
  {
    id: 'survival_wave_10',
    title: 'Chiến Binh Bão Tuyết',
    description: 'Sống sót qua 10 đợt tuyết dâng trong Chế độ Sinh Tồn',
    icon: '❄️',
    badgeKey: 'badge_survival_hero',
    rewardDiamonds: 50,
    rewardUniversalShards: 4,
    playerTitleReward: 'Chiến Binh Bão Tuyết',
    category: 'battle'
  },
  {
    id: 'pet_master_50',
    title: 'Bậc Thầy Thu Phục',
    description: 'Mở khóa hơn 50 Linh thú trong Bách Khoa Vạn Giới',
    icon: '🦊',
    badgeKey: 'badge_beast_awakening',
    rewardDiamonds: 40,
    rewardUniversalShards: 3,
    playerTitleReward: 'Bậc Thầy Thu Phục',
    category: 'collection'
  },
  {
    id: 'companions_3',
    title: 'Bạn Của Muôn Thú',
    description: 'Triệu hồi thành công 3 Linh Thú đồng hành',
    icon: '🐾',
    badgeKey: 'badge_beast_awakening',
    rewardDiamonds: 25,
    playerTitleReward: 'Bạn Của Muôn Thú',
    category: 'collection'
  },
  {
    id: 'companion_tier_2',
    title: 'Khai Mở Linh Lực',
    description: 'Tiến hóa 1 Linh Thú lên Bậc 2 (Huyền Bí)',
    icon: '🔮',
    badgeKey: 'badge_beast_awakening',
    rewardDiamonds: 30,
    playerTitleReward: 'Khai Mở Linh Lực',
    category: 'collection'
  },
  {
    id: 'companion_tier_4',
    title: 'Chúa Tể Thần Thú',
    description: 'Nâng cấp 1 Linh Thú đạt Bậc 4 Thần Thoại',
    icon: '🐉',
    badgeKey: 'badge_perfect_strategist',
    rewardDiamonds: 80,
    rewardUniversalShards: 5,
    playerTitleReward: 'Chúa Tể Thần Thú',
    category: 'collection'
  },
  {
    id: 'relic_collector',
    title: 'Thợ Săn Cổ Vật',
    description: 'Thu thập & Rèn thành công 1 Cổ Vật Thần',
    icon: '🏺',
    badgeKey: 'badge_perfect_strategist',
    rewardDiamonds: 30,
    playerTitleReward: 'Thợ Săn Cổ Vật',
    category: 'collection'
  },
  {
    id: 'zen_master_5000',
    title: 'Tâm Như Chỉ Thủy',
    description: 'Đạt 5,000 điểm trong Chế độ Thiền Định (Zen Mode)',
    icon: '🌊',
    badgeKey: 'badge_zen_master',
    rewardDiamonds: 30,
    playerTitleReward: 'Tâm Như Chỉ Thủy',
    category: 'zen'
  },
  {
    id: 'omikuji_streak_7',
    title: 'Đệ Tử Thần Điện',
    description: 'Điểm danh rút quẻ Shinto liên tiếp 7 ngày',
    icon: '⛩️',
    badgeKey: 'badge_divine_shrine',
    rewardDiamonds: 50,
    rewardUniversalShards: 5,
    playerTitleReward: 'Đệ Tử Thần Điện',
    category: 'progression'
  }
];

export class AchievementRegistry {
  public static getAll(): AchievementDefinition[] {
    return ACHIEVEMENTS;
  }

  public static getById(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
  }
}
