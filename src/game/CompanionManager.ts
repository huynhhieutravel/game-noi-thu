import { COMPANION_UPGRADE_COSTS, CompanionConfig, CompanionLevelInfo, CompanionTierInfo } from '../types';
export { COMPANION_UPGRADE_COSTS };

export const COMPANIONS: Record<string, CompanionConfig> = {
  inari_kitsune: {
    id: 'inari_kitsune',
    name: 'Cáo Inari',
    title: 'Hồ Ly Thần Bí',
    icon: '🦊',
    element: 'spirit',
    elementLabel: 'Tâm Linh',
    themeColor: 0xff758f,
    skillName: 'Linh Hồ Xuất Kích',
    skillDesc: 'Tìm & giải cứu 1 cặp ô bị kẹt sâu nhất trên bàn cờ',
    passiveName: 'Kitsune Fortune',
    passiveDesc: 'Khi đạt Streak Combo 4+, thời gian đếm duy trì combo được cộng thêm +1.2s',
    cost: 0,
    unlockReqDesc: 'Mặc định (Miễn phí)',
    roleDescription: 'Chuyên Màn Hóc Búa / Rối Mắt / Màn Zen Combo',
    levels: [
      {
        level: 1,
        skillDesc: 'Tìm & giải cứu 1 cặp ô bị kẹt sâu nhất trên bàn cờ.',
        passiveDesc: 'Duy trì combo 4+: cộng thêm +1.2s vào thanh đếm combo.',
        perkSummary: 'Mở khóa dạng Ấu Thú cơ bản.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Tìm & giải cứu 1 cặp ô bị kẹt sâu nhất, tích nộ nhanh hơn 5%.',
        passiveDesc: 'Duy trì combo 4+: cộng thêm +1.4s vào thanh đếm combo.',
        perkSummary: '+5% Tốc độ tích Nộ.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Giải cứu 1 cặp ô + bắn tia linh quang làm tan chảy 1 mạng nhện hoặc băng đá kế bên.',
        passiveDesc: 'Duy trì combo 4+: cộng thêm +1.6s vào thanh đếm combo.',
        perkSummary: 'Đột phá Trưởng Thành: Thanh tẩy thêm 1 bẫy lân cận.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Giải cứu 1 cặp ô + làm tan chảy 1 mạng nhện/băng, tích nộ nhanh hơn 10%.',
        passiveDesc: 'Duy trì combo 4+: cộng thêm +1.8s vào thanh đếm combo.',
        perkSummary: '+10% Tốc độ tích Nộ.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Giải cứu chuẩn xác 2 cặp ô cô lập nhất mà không làm sai lệch logic bàn cờ.',
        passiveDesc: 'Duy trì combo 4+: cộng thêm +2.0s vào thanh đếm combo.',
        perkSummary: 'Thần Linh Thức Tỉnh: Giải cứu trọn vẹn 2 cặp ô nguy hiểm.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  ryujin_pearl: {
    id: 'ryujin_pearl',
    name: 'Rồng Ryujin',
    title: 'Long Vương Biển Sâu',
    icon: '🐉',
    element: 'water',
    elementLabel: 'Thủy Thần',
    themeColor: 0x00f5d4,
    skillName: 'Ngưng Đọng Long Châu',
    skillDesc: 'Đóng băng đồng hồ đếm ngược và nhịp rơi tuyết trong 3.0 giây',
    passiveName: 'Long Mạch Thủy Triều',
    passiveDesc: 'Đường nối chạy qua viền ngoài (Padding Margin) nhận thêm +10% Xu vàng',
    cost: 300,
    unlockReqDesc: '300 Xu hoặc Vượt Chương 2',
    roleDescription: 'Chuyên Màn Bão Tuyết Sinh Tồn & Chạy Đua Thời Gian',
    levels: [
      {
        level: 1,
        skillDesc: 'Đóng băng đồng hồ đếm ngược và nhịp rơi tuyết trong 3.0 giây.',
        passiveDesc: 'Nối gạch qua viền ngoài: nhận thêm +10% Xu vàng.',
        perkSummary: 'Mở khóa Long Vương Biển Sâu.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Đóng băng đồng hồ đếm ngược và nhịp rơi tuyết trong 3.5 giây.',
        passiveDesc: 'Nối gạch qua viền ngoài: nhận thêm +12% Xu vàng.',
        perkSummary: '+0.5s Đóng băng thời gian.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Đóng băng đồng hồ trong 4.0 giây + tạm dừng đòn đánh quấy rối của Boss.',
        passiveDesc: 'Nối gạch qua viền ngoài: nhận thêm +14% Xu vàng.',
        perkSummary: 'Đột phá Trưởng Thành: Đóng băng cả chiêu thức của Boss.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Đóng băng đồng hồ trong 4.5 giây + tạm dừng đòn đánh của Boss.',
        passiveDesc: 'Nối gạch qua viền ngoài: nhận thêm +16% Xu vàng.',
        perkSummary: '+0.5s Thời gian đóng băng.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Đóng băng đồng hồ trong 5.0 giây trọn vẹn, dập tắt mọi bão tuyết rơi dồn.',
        passiveDesc: 'Nối gạch qua viền ngoài: nhận thêm +18% Xu vàng.',
        perkSummary: 'Thần Linh Thức Tỉnh: 5 giây ngưng đọng thời không tuyệt đối.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  hi_no_tori: {
    id: 'hi_no_tori',
    name: 'Hi-no-tori',
    title: 'Bất Tử Hỏa Điểu',
    icon: '🔥',
    element: 'fire',
    elementLabel: 'Hỏa Phượng',
    themeColor: 0xff595e,
    skillName: 'Hỏa Diệm Thanh Tẩy',
    skillDesc: 'Thiêu rụi 1 chướng ngại vật Băng/Đá hoặc giáng 150 sát thương vào Boss',
    passiveName: 'Tro Tàn Tái Sinh',
    passiveDesc: 'Khi bàn cờ rơi vào Deadlock (hết nước đi), giữ nguyên 100% combo streak + thưởng 5s',
    cost: 600,
    unlockReqDesc: '600 Xu hoặc Vượt Chương 3',
    roleDescription: 'Chuyên Đấu Trường 16 Boss & Màn Băng Giá Dày Đặc',
    levels: [
      {
        level: 1,
        skillDesc: 'Thiêu rụi 1 chướng ngại vật (Băng/Đá) HOẶC giáng 150 sát thương vào Boss.',
        passiveDesc: 'Deadlock: Giữ nguyên 100% thanh Combo + thưởng +5s thời gian (1 lần/màn).',
        perkSummary: 'Mở khóa Phượng Hoàng Lửa Bất Tử.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Thiêu rụi 1 chướng ngại vật HOẶC giáng 200 sát thương vào Boss.',
        passiveDesc: 'Deadlock: Giữ nguyên 100% Combo + thưởng +6s thời gian (1 lần/màn).',
        perkSummary: '+50 Sát thương Boss.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Thiêu rụi 2 chướng ngại vật HOẶC giáng 250 sát thương vào Boss.',
        passiveDesc: 'Deadlock: Giữ nguyên 100% Combo + thưởng +7s thời gian (1 lần/màn).',
        perkSummary: 'Đột phá Trưởng Thành: Thiêu rụi 2 chướng ngại vật cùng lúc.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Thiêu rụi 2 chướng ngại vật HOẶC giáng 320 sát thương vào Boss.',
        passiveDesc: 'Deadlock: Giữ nguyên 100% Combo + thưởng +8s thời gian (1 lần/màn).',
        perkSummary: '+70 Sát thương Boss.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Thiêu rụi 3 chướng ngại vật HOẶC giáng 380 sát thương thiêu đốt Boss trong 4s.',
        passiveDesc: 'Deadlock: Giữ nguyên 100% Combo + thưởng +10s thời gian (1 lần/màn).',
        perkSummary: 'Thần Linh Thức Tỉnh: Phá 3 chướng ngại vật hoặc thiêu rụi 380 HP Boss.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  byakko_tiger: {
    id: 'byakko_tiger',
    name: 'Bạch Hổ Byakko',
    title: 'Thánh Hổ Tây Phương',
    icon: '🐯',
    element: 'metal',
    elementLabel: 'Kim / Phong',
    themeColor: 0xadb5bd,
    skillName: 'Bạch Hổ Cuồng Trảo',
    skillDesc: 'Chém dọc ngang giải quyết 1 cặp ô thẳng hàng (0 khúc cua)',
    passiveName: 'Tốc Chiến Tiên Phong',
    passiveDesc: 'Giảm 15% độ trễ hoạt ảnh giải gạch và tăng +15% điểm thưởng Speedrun',
    cost: 500,
    unlockReqDesc: '500 Xu hoặc Vượt Chương 4',
    roleDescription: 'Chuyên Màn Trọng Lực Phức Tạp & Đua Tốc Độ Speedrun',
    levels: [
      {
        level: 1,
        skillDesc: 'Chém giải quyết 1 cặp ô thẳng hàng (0 khúc cua) ngay tức thì.',
        passiveDesc: 'Giảm 10% độ trễ hoạt ảnh giải gạch, tăng +10% điểm Speedrun.',
        perkSummary: 'Mở khóa Bạch Hổ Tây Phương.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Chém 1 cặp ô thẳng hàng + khóa trọng lực trượt gạch trong 4s.',
        passiveDesc: 'Giảm 12% độ trễ hoạt ảnh giải gạch, tăng +12% điểm Speedrun.',
        perkSummary: 'Khóa trọng lực tạm thời trong 4s.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Chém 1 cặp ô thẳng hàng + khóa trọng lực trượt gạch trong 5s.',
        passiveDesc: 'Giảm 15% độ trễ hoạt ảnh giải gạch, tăng +15% điểm Speedrun.',
        perkSummary: 'Đột phá Trưởng Thành: Khóa trọng lực 5s định hình bàn cờ.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Chém 1 cặp ô thẳng hàng + khóa trọng lực 6s, tăng tốc hoạt ảnh 15%.',
        passiveDesc: 'Giảm 18% độ trễ hoạt ảnh giải gạch, tăng +18% điểm Speedrun.',
        perkSummary: 'Khóa trọng lực 6s + Tăng tốc độ nối.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Chém 1 cặp ô thẳng hàng + khóa trọng lực 7s, trong thời gian đó tốc độ resolve animation tăng 25%.',
        passiveDesc: 'Giảm 20% độ trễ hoạt ảnh giải gạch, tăng +25% điểm Speedrun.',
        perkSummary: 'Thần Linh Thức Tỉnh: Khóa trọng lực 7s + Tăng tốc giải gạch cực đại 25%.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  genbu_tortoise: {
    id: 'genbu_tortoise',
    name: 'Huyền Vũ Genbu',
    title: 'Trấn Thiên Quy Xà',
    icon: '🐢',
    element: 'earth',
    elementLabel: 'Thổ / Địa',
    themeColor: 0x2a9d8f,
    skillName: 'Kim Cang Địa Thuẫn',
    skillDesc: 'Đập vỡ vụn 1 khối Đá/Khóa xích cứng nhất và tạo Khiên Hộ Thể',
    passiveName: 'Quy Giáp Trường Thọ',
    passiveDesc: 'Khởi đầu màn chơi với thêm +1 Mạng bảo hộ (thêm 5s khi hết giờ)',
    cost: 500,
    unlockReqDesc: '500 Xu hoặc Vượt Chương 5',
    roleDescription: 'Chuyên Màn Sinh Tử, Nhiều Khóa Sắt & Đá Tảng Cản Đường',
    levels: [
      {
        level: 1,
        skillDesc: 'Đập vỡ vụn 1 khối Đá hoặc Khóa xích cứng nhất trên sân.',
        passiveDesc: '+1 Mạng bảo vệ dự phòng: khi hết giờ được thêm 5s cứu nguy.',
        perkSummary: 'Mở khóa Trấn Thiên Quy Xà.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Đập vỡ vụn 1 khối Đá/Khóa + tạo Khiên Thổ chặn 1 lần nối sai không bị phạt.',
        passiveDesc: '+1 Mạng bảo vệ dự phòng (thêm 5s khi hết giờ).',
        perkSummary: 'Khiên Thổ bảo vệ 1 lần nối nhầm.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Đập vỡ vụn 1 khối Đá/Khóa + tạo Khiên Thổ chặn 1 lần nối sai không bị trừ thời gian.',
        passiveDesc: '+1 Mạng bảo vệ dự phòng (thêm 6s khi hết giờ).',
        perkSummary: 'Đột phá Trưởng Thành: Tăng thời gian mạng bảo vệ lên 6s.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Đập vỡ 2 khối Đá/Khóa xích + tạo Khiên Thổ chặn 1 lần nối sai.',
        passiveDesc: '+1 Mạng bảo vệ dự phòng (thêm 7s khi hết giờ).',
        perkSummary: 'Đập vỡ 2 khối Đá cùng lúc.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Đập vỡ 2 khối Đá/Khóa + Khiên Thổ chặn 2 lần nối sai liên tiếp không bị phạt.',
        passiveDesc: '+1 Mạng bảo vệ dự phòng (thêm 8s khi hết giờ).',
        perkSummary: 'Thần Linh Thức Tỉnh: Phá 2 đá + Khiên Thổ bảo vệ 2 lần nối sai.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  kirin_sacred: {
    id: 'kirin_sacred',
    name: 'Kỳ Lân Kirin',
    title: 'Thánh Thú Cát Tường',
    icon: '🦌',
    element: 'wood',
    elementLabel: 'Mộc Thần',
    themeColor: 0x52b788,
    skillName: 'Cát Tường Thanh Tẩy',
    skillDesc: 'Thanh lọc bùa chú của Boss và hồi phục +3 giây quý giá',
    passiveName: 'Sinh Sôi Nảy Nở',
    passiveDesc: 'Mỗi khi xóa thành công 6 cặp gạch, đồng hồ tự động hồi lại +1 giây',
    cost: 700,
    unlockReqDesc: '700 Xu hoặc Vượt Chương 6',
    roleDescription: 'Chuyên Màn Dây Leo, Mù Sương & Boss Tung Nguyền Rủa',
    levels: [
      {
        level: 1,
        skillDesc: 'Thanh lọc 1 bùa chú nguyền rủa của Boss và hồi phục +3 giây thời gian.',
        passiveDesc: 'Mỗi 6 cặp gạch nối thành công: hồi +1s (tối đa 6s/màn).',
        perkSummary: 'Mở khóa Thánh Thú Cát Tường Kirin.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Thanh lọc 1 bùa chú nguyền rủa của Boss và hồi phục +4 giây thời gian.',
        passiveDesc: 'Mỗi 6 cặp gạch nối thành công: hồi +1s (tối đa 7s/màn).',
        perkSummary: '+1s Thời gian hồi phục từ tuyệt chiêu.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Thanh lọc toàn bộ bùa nguyền rủa trên sân và hồi phục +4 giây thời gian.',
        passiveDesc: 'Mỗi 6 cặp gạch nối thành công: hồi +1s (tối đa 8s/màn).',
        perkSummary: 'Đột phá Trưởng Thành: Thanh tẩy toàn bộ mọi nguyền rủa trên sân.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Thanh lọc toàn bộ bùa nguyền rủa và hồi phục +5 giây thời gian.',
        passiveDesc: 'Mỗi 5 cặp gạch nối thành công: hồi +1s (tối đa 9s/màn).',
        perkSummary: 'Giảm mốc tích lũy xuống mỗi 5 cặp gạch.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Thanh lọc toàn bộ nguyền rủa + hồi +5 giây + biến 1 cặp ô khó thành Thánh Hoa dễ kết nối.',
        passiveDesc: 'Mỗi 5 cặp gạch nối thành công: hồi +1s (tối đa 10s/màn).',
        perkSummary: 'Thần Linh Thức Tỉnh: Hồi 5s + Hóa giải hoàn toàn nguyền rủa + Tạo Thánh Hoa.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  raiju_thunder: {
    id: 'raiju_thunder',
    name: 'Lôi Thú Raiju',
    title: 'Sấm Chớp Thiên Lôi',
    icon: '⚡',
    element: 'lightning',
    elementLabel: 'Lôi Điện',
    themeColor: 0xffb703,
    skillName: 'Lôi Quang Liên Nối',
    skillDesc: 'Phóng luồng điện xuyên Cổng Torii, tự kết nối 1 cặp ô ở cự ly xa nhất',
    passiveName: 'Gia Tốc Dẫn Điện',
    passiveDesc: 'Mọi đường nối xuyên qua Cổng Torii tích lũy thêm +25% Nộ cho Linh Thú',
    cost: 700,
    unlockReqDesc: '700 Xu hoặc Vượt Chương 7',
    roleDescription: 'Chuyên Màn Cổng Dịch Chuyển Torii & Khoảng Cách Siêu Xa',
    levels: [
      {
        level: 1,
        skillDesc: 'Phóng luồng điện xuyên qua Cổng Torii, tự kết nối 1 cặp ô ở cự ly xa nhất.',
        passiveDesc: 'Nối qua Cổng Torii: tích lũy thêm +20% Nộ.',
        perkSummary: 'Mở khóa Lôi Thú Sấm Chớp.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Phóng luồng điện kết nối 1 cặp ô xa nhất, tích nộ nhanh hơn 5%.',
        passiveDesc: 'Nối qua Cổng Torii: tích lũy thêm +22% Nộ.',
        perkSummary: '+5% Tốc độ tích Nộ.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Kết nối 1 cặp ô xa nhất + làm phát sáng vị trí 2 cổng Torii đang thông nhau.',
        passiveDesc: 'Nối qua Cổng Torii: tích lũy thêm +25% Nộ.',
        perkSummary: 'Đột phá Trưởng Thành: Tự động soi sáng cặp Cổng Torii tối ưu.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Kết nối 1 cặp ô xa nhất + lượt nối kế tiếp được nhân x1.5 điểm số.',
        passiveDesc: 'Nối qua Cổng Torii: tích lũy thêm +28% Nộ.',
        perkSummary: 'x1.5 Điểm số cho lượt nối tiếp theo.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Kết nối 1 cặp ô xa nhất + 2 lượt nối tiếp theo được nhân x2 điểm số thần tốc.',
        passiveDesc: 'Nối qua Cổng Torii: tích lũy thêm +30% Nộ.',
        perkSummary: 'Thần Linh Thức Tỉnh: Kết nối xa nhất + Nhân x2 điểm 2 lượt tiếp theo.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  yatagarasu_crow: {
    id: 'yatagarasu_crow',
    name: 'Quạ Yatagarasu',
    title: 'Tam Túc Thái Dương',
    icon: '🦅',
    element: 'sun',
    elementLabel: 'Nhật Quang',
    themeColor: 0xfb8500,
    skillName: 'Nhật Quang Soi Đường',
    skillDesc: 'Rọi ánh sáng mặt trời xua tan bóng tối và sương mù trong 6-10 giây',
    passiveName: 'Kim Ô Chỉ Lối',
    passiveDesc: 'Sau mỗi 8s không thao tác, đốm sáng mặt trời nhấp nháy chỉ nhẹ 1 ô hợp lệ',
    cost: 800,
    unlockReqDesc: '800 Xu hoặc Vượt Chương 8',
    roleDescription: 'Chuyên Màn Sương Mù Bí Ẩn, Màn Đêm & Tầm Nhìn Kém',
    levels: [
      {
        level: 1,
        skillDesc: 'Rọi ánh sáng mặt trời xua tan hoàn toàn bóng tối và sương mù trong 6 giây.',
        passiveDesc: 'Sau 10s chưa tìm ra ô: ánh mặt trời nhấp nháy báo hiệu 1 ô hợp lệ.',
        perkSummary: 'Mở khóa Quạ Ba Chân Nhật Quang.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Rọi ánh sáng xua tan bóng tối trong 7 giây, tích nộ nhanh hơn 5%.',
        passiveDesc: 'Sau 9s chưa tìm ra ô: ánh mặt trời nhấp nháy báo hiệu 1 ô hợp lệ.',
        perkSummary: 'Thời gian xua tan sương mù tăng lên 7s.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Xua tan bóng tối trong 8 giây + định vị chính xác vị trí cặp Relic Shard cổ vật.',
        passiveDesc: 'Sau 8s chưa tìm ra ô: ánh mặt trời nhấp nháy báo hiệu 1 ô hợp lệ.',
        perkSummary: 'Đột phá Trưởng Thành: Định vị chính xác Cổ vật Relic Shard.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Xua tan bóng tối trong 9 giây + định vị Relic Shard + giảm 5% Nộ yêu cầu.',
        passiveDesc: 'Sau 7s chưa tìm ra ô: ánh mặt trời nhấp nháy báo hiệu 1 ô hợp lệ.',
        perkSummary: 'Thời gian xua tan sương mù tăng lên 9s.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Xua tan bóng tối trong 10 giây + reveal Relic Shard + highlight 1 cặp hợp lệ tốt nhất.',
        passiveDesc: 'Sau 7s chưa tìm ra ô: ánh mặt trời nhấp nháy báo hiệu 1 ô hợp lệ.',
        perkSummary: 'Thần Linh Thức Tỉnh: Xua fog 10s + Reveal Relic + Highlight cặp tối ưu.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  nekomata_cat: {
    id: 'nekomata_cat',
    name: 'Mèo Nekomata',
    title: 'Linh Miêu Song Vĩ',
    icon: '🐾',
    element: 'shadow',
    elementLabel: 'Ảo Thuật',
    themeColor: 0x9d4edd,
    skillName: 'Hoán Đổi Càn Khôn',
    skillDesc: 'Hoán đổi 1 ô gạch bị kẹt sâu đưa ra rìa ngoài để tạo đường nối ngay',
    passiveName: 'Chiêu Tài Lội Ngược',
    passiveDesc: 'Thắng ván khi đồng hồ còn dưới 15 giây: nhân x1.5 lượng Mảnh & Xu nhận được',
    cost: 800,
    unlockReqDesc: '800 Xu hoặc Vượt Chương 9',
    roleDescription: 'Chuyên Màn Đảo Ngược Bàn Cờ & Lật Kèo Phút Tử Thần',
    levels: [
      {
        level: 1,
        skillDesc: 'Hoán đổi 1 ô gạch bị kẹt sâu đưa ra rìa ngoài để lập tức tạo đường nối.',
        passiveDesc: 'Thắng khi thời gian < 15s: nhân x1.5 Mảnh linh thú và Xu nhận được.',
        perkSummary: 'Mở khóa Linh Miêu Song Vĩ.',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Hoán đổi 1 ô kẹt sâu ra rìa ngoài + thưởng thêm +2 giây thời gian.',
        passiveDesc: 'Thắng khi thời gian < 15s: nhân x1.6 Mảnh linh thú và Xu nhận được.',
        perkSummary: 'Hồi thêm +2s thời gian khi hoán đổi.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Hoán đổi 1 ô kẹt sâu ra rìa ngoài + cướp lại +3 giây từ đồng hồ cát.',
        passiveDesc: 'Thắng khi thời gian < 15s: nhân x1.7 Mảnh linh thú và Xu nhận được.',
        perkSummary: 'Đột phá Trưởng Thành: Cướp lại +3s thời gian quý giá.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Hoán đổi 1 ô kẹt sâu ra rìa ngoài + cướp lại +4 giây thời gian.',
        passiveDesc: 'Thắng khi thời gian < 15s: nhân x1.8 Mảnh linh thú và Xu nhận được.',
        perkSummary: 'Cướp lại +4s thời gian.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Hoán đổi 1 cặp gạch hiểm hóc sang vị trí kề cận ăn ngay + cướp lại +4 giây.',
        passiveDesc: 'Thắng khi thời gian < 15s: nhân x2.0 Mảnh linh thú và Xu nhận được.',
        perkSummary: 'Thần Linh Thức Tỉnh: Hoán đổi trực tiếp 1 cặp kề nhau + x2.0 Thưởng lội ngược.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  },

  orochi_serpent: {
    id: 'orochi_serpent',
    name: 'Bát Kỳ Orochi',
    title: 'Thần Xà Bát Đầu (Apex SSR)',
    icon: '🐍',
    element: 'mythic',
    elementLabel: 'Thần Thoại',
    themeColor: 0x7209b7,
    skillName: 'Bát Đầu Cuồng Nộ',
    skillDesc: 'Yêu cầu +25% Nộ: Ăn mòn giáp Boss (+20% damage) và nghiền nát chướng ngại vật',
    passiveName: 'Uy Áp Xà Thần',
    passiveDesc: 'Giảm 15% đến 25% tần suất Boss tung kỹ năng quấy rối lên bàn cờ',
    cost: 1500,
    unlockReqDesc: 'Hạ gục 5 Boss Cổ Đại hoặc 1500 Xu',
    roleDescription: 'Thống Trị Tuyệt Đối Đấu Trường 16 Boss (Apex SSR)',
    isApexSSR: true,
    levels: [
      {
        level: 1,
        skillDesc: 'Yêu cầu +25% Nộ: Ăn mòn giáp Boss khiến đòn đánh tăng +20% sát thương trong 6s.',
        passiveDesc: 'Giảm 15% tần suất Boss tung chiêu quấy rối bàn cờ.',
        perkSummary: 'Mở khóa Thần Xà Bát Đầu Orochi (Apex SSR).',
        requiredShards: 0,
        requiredCoins: 0
      },
      {
        level: 2,
        skillDesc: 'Tăng +22% sát thương Boss trong 6s + nghiền nát 1 chướng ngại vật trên sân.',
        passiveDesc: 'Giảm 17% tần suất Boss tung chiêu quấy rối bàn cờ.',
        perkSummary: '+22% Sát thương Boss + Nghiền nát 1 chướng ngại vật.',
        requiredShards: 10,
        requiredCoins: 200
      },
      {
        level: 3,
        skillDesc: 'Tăng +25% sát thương Boss trong 7s + nghiền nát 1 chướng ngại vật.',
        passiveDesc: 'Giảm 20% tần suất Boss tung chiêu quấy rối bàn cờ.',
        perkSummary: 'Đột phá Trưởng Thành: +25% Sát thương Boss trong 7s.',
        requiredShards: 25,
        requiredCoins: 500
      },
      {
        level: 4,
        skillDesc: 'Tăng +28% sát thương Boss trong 7s + nghiền nát 1 chướng ngại vật + giải 1 cặp ô.',
        passiveDesc: 'Giảm 22% tần suất Boss tung chiêu quấy rối bàn cờ.',
        perkSummary: '+28% Sát thương Boss + Phá 1 chướng ngại vật + Giải 1 cặp ô.',
        requiredShards: 50,
        requiredCoins: 1000
      },
      {
        level: 5,
        skillDesc: 'Tăng +30% sát thương Boss trong 8s + nghiền nát 1 chướng ngại vật + tự động giải 1 cặp ô.',
        passiveDesc: 'Giảm 25% tần suất Boss tung chiêu quấy rối bàn cờ.',
        perkSummary: 'Thần Linh Thức Tỉnh (Apex Balanced): +30% Sát thương Boss + Phá 1 obstacle + Giải 1 pair.',
        requiredShards: 100,
        requiredCoins: 2000
      }
    ]
  }
};

export const COMPANION_TIERS: Record<string, Record<number, CompanionTierInfo>> = {
  inari_kitsune: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Linh Hồ Xuất Kích',
      skillDesc: 'Tìm & giải cứu 1 cặp ô bị kẹt sâu nhất trên bàn cờ.',
      bossCounterDesc: 'Boss Ma Dù & Bức Tường Ma: Hóa giải các góc kẹt do ảo ảnh tạo ra.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Linh Hồ Phá Ảo',
      skillDesc: 'Giải cứu 1 cặp ô + thiêu rụi 1 mạng nhện/băng đá và xua tan ảo ảnh Boss trong 6s.',
      bossCounterDesc: 'Boss Ma Dù: Vô hiệu hóa ảo ảnh tàng hình và bẫy mạng nhện.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Cửu Vĩ Thiên Hồ Giáng Trần',
      skillDesc: 'Giải cứu 2 cặp ô hiểm hóc + giáng 300 sát thương tâm linh tê liệt Boss 8s!',
      bossCounterDesc: 'Boss Ma Dù & Nurikabe: Tê liệt hoàn toàn mọi kỹ năng của Boss.',
      maxLevel: 30
    }
  },
  ryujin_pearl: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Ngưng Đọng Long Châu',
      skillDesc: 'Đóng băng đồng hồ đếm ngược và nhịp rơi tuyết trong 3.0 giây.',
      bossCounterDesc: 'Thủy Quái Kraken & Apep: Kìm hãm đợt sóng thần dâng trào.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Hải Triều Tịnh Hóa',
      skillDesc: 'Đóng băng thời gian 4.5s + tan chảy toàn bộ ô Băng, vô hiệu hóa xúc tu Kraken.',
      bossCounterDesc: 'Boss Kraken: Phá tan toàn bộ xúc tu và bão tuyết đóng băng.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Thái Cổ Long Vương Phẫn Nộ',
      skillDesc: 'Đóng băng thời gian 6.0s + sóng thần quét sạch 2 cặp ô và giáng 350 sát thương lên Boss!',
      bossCounterDesc: 'Kraken & Boss Bão Tuyết: Giáng đòn sấm sét thủy triều hủy diệt.',
      maxLevel: 30
    }
  },
  hi_no_tori: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Hỏa Vũ Trùng Sinh',
      skillDesc: 'Khi hết giờ, hồi sinh tức thì ban thêm +10 giây (1 lần/trận).',
      bossCounterDesc: 'Xác Ướp Pharaoh & Hades: Cứu nguy khi bị nguyền rủa thời gian.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Liệt Diễm Tẩy Uế',
      skillDesc: 'Hồi sinh ban +15s + ngọn lửa thiêng thiêu rụi toàn bộ lời nguyền thời gian và đá tảng.',
      bossCounterDesc: 'Pharaoh & Hades: Thiêu hủy lời nguyền cát lún rút cạn thời gian.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Bất Tử Niết Bàn',
      skillDesc: 'Hồi sinh ban +20s + hồi phục 1 Mạng sống ❤️ và thiêu đốt Boss trừ 5% HP/giây trong 5s!',
      bossCounterDesc: 'Đại Boss Âm Giới: Thiêu đốt liên tục theo % máu tối đa.',
      maxLevel: 30
    }
  },
  byakko_tiger: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Bạch Hổ Cuồng Trảm',
      skillDesc: 'Chém đứt 1 ô vật cản bất kỳ trên bàn cờ.',
      bossCounterDesc: 'Bức Tường Đá Golem: Phá vỡ giáp đá kiên cố.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Toái Thiết Liệt Thạch',
      skillDesc: 'Nghiền nát 3 ô Đá/Giáp sắt và phá vỡ thế phòng ngự của Boss trong 10 giây.',
      bossCounterDesc: 'Golem & Khủng Long T-Rex: Đập tan mọi khiên phòng thủ hộ thân.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Bạch Hổ Thần Uy Trảm Tướng',
      skillDesc: 'Phóng vuốt thần trảm đứt 1 bộ phận Boss, giáng 400 sát thương chuẩn xuyên giáp!',
      bossCounterDesc: 'Đại Boss Giáp Sắt: Đòn chém tử thần trừ thẳng máu gốc.',
      maxLevel: 30
    }
  },
  genbu_turtle: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Huyền Thuẫn Thạch Bích',
      skillDesc: 'Dựng khiên bảo vệ người chơi không bị trừ mạng nếu nối sai trong 12 giây.',
      bossCounterDesc: 'Xà Thần Medusa & Asura: Chặn đòn sát thương hóa đá và phản pháo.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Trấn Địa Quy Giáp',
      skillDesc: 'Vô hiệu hóa toàn bộ chấn động đổi trọng lực của Boss trong 20s + miễn nhiễm độc tố.',
      bossCounterDesc: 'Boss Asura: Ngăn chặn động đất đảo lộn hướng rơi ô cờ.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Vạn Thạch Bất Động Minh Vương',
      skillDesc: 'Hóa giải bàn cờ về tĩnh lặng tuyệt đối + phản lại 50% sát thương của Boss vào chính Boss!',
      bossCounterDesc: 'Boss Bạo Loạn Trọng Lực: Phản đòn bẻ gãy ý chí tấn công.',
      maxLevel: 30
    }
  },
  kirin_sacred: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Thánh Quang Tường Vân',
      skillDesc: 'Nhân đôi (x2) điểm số kiếm được trong 15 giây.',
      bossCounterDesc: 'Quỷ Vương Ravana & Chaos: Tăng tốc tích điểm lật kèo.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Kỳ Lân Ban Phúc',
      skillDesc: 'Sắp xếp lại bàn cờ theo trật tự tối ưu (ít nhất 5 cặp ăn ngay) + tăng 50% Xu nhận được.',
      bossCounterDesc: 'Boss Ravana: Hóa giải tuyệt chiêu tráo đảo loạn bàn cờ.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Tam Giới Thánh Quang Phổ Chiếu',
      skillDesc: 'Thanh tẩy sạch bóng chướng ngại vật + x3 toàn bộ Xu và Mảnh rơi ra khi hạ gục Boss!',
      bossCounterDesc: 'Đại Trùm Chaos: Xóa tan hỗn mang, đại thu hoạch phần thưởng.',
      maxLevel: 30
    }
  },
  raiju_thunder: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Lôi Quang Thiểm Điện',
      skillDesc: 'Phóng sét ăn ngay 1 cặp ô ngẫu nhiên.',
      bossCounterDesc: 'Cơ Giáp Mecha: Xâm nhập mạch điện tử quái thú.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Vạn Lôi Tỏa Xích',
      skillDesc: 'Phóng 4 tia sét giật đứt toàn bộ song sắt và làm đoản mạch khiên Boss trong 8s.',
      bossCounterDesc: 'Boss Robot Cyber: Phá bung song sắt giam hãm và khiên chắn điện từ.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Thiên Lôi Oanh Đỉnh Tuyệt Sát',
      skillDesc: 'Đánh tan 3 cặp ô nguy hiểm cùng lúc + giáng 380 sát thương điện giật Boss bất động!',
      bossCounterDesc: 'Boss Mecha Siêu Cường: Tê liệt toàn bộ hệ thống động lực.',
      maxLevel: 30
    }
  },
  yatagarasu_crow: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Hắc Dực Chỉ Dẫn',
      skillDesc: 'Soi sáng và đánh dấu đường nối ngắn nhất của 2 cặp ô.',
      bossCounterDesc: 'Boss Dạ Xoa Kuro-Oni: Soi sáng màn đêm mịt mù.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Nhật Luân Phá Ám',
      skillDesc: 'Xua tan 100% bóng tối dày đặc của Boss trong 15s + định vị vị trí Mảnh Thần Khí ẩn.',
      bossCounterDesc: 'Boss Kuro-Oni & Rồng Đen: Dẹp tan màn đêm che khuất tầm nhìn.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Tam Túc Liệt Nhật Thần Ô',
      skillDesc: 'Biến bóng đêm thành ban ngày rực rỡ + tự động kết nối 3 cặp ô viền ngoài bàn cờ!',
      bossCounterDesc: 'Boss Hắc Ám Tối Thượng: Triệt hạ thế độc quyền trong bóng tối.',
      maxLevel: 30
    }
  },
  nekomata_cat: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Song Vĩ Mê Hoặc',
      skillDesc: 'Làm chậm 50% nhịp tụt của thanh thời gian trong 10 giây.',
      bossCounterDesc: 'Boss Ma Trơi Hitodama: Giảm tốc độ rút cạn sinh lực.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Nghịch Chuyển Linh Phù',
      skillDesc: 'Hóa giải hiệu ứng làm chậm / đảo phím của Boss, biến thành Buff +2s mỗi khi ăn cặp.',
      bossCounterDesc: 'Boss Ma Trơi & Phù Thủy: Chuyển hóa nguyền rủa thành thời gian quý giá.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Bách Quỷ Miêu Hầu Đại Pháp',
      skillDesc: 'Đánh tráo ô xấu về góc chết + rút trộm 15% năng lượng Boss nạp thẳng vào Nộ người chơi!',
      bossCounterDesc: 'Boss Dùng Chiêu Nhanh: Cướp đoạt năng lượng đòn thế.',
      maxLevel: 30
    }
  },
  orochi_serpent: {
    1: {
      tier: 1,
      tierName: 'Ấu Thú',
      badge: '🟢 BẬC 1: ẤU THÚ',
      skillName: 'Bát Đầu Độc Vụ',
      skillDesc: 'Khạc độc trừ 100 HP của Boss và làm độc lan sang 1 ô bên cạnh.',
      bossCounterDesc: '16 Cự Trùm Boss Arena: Đòn độc ăn mòn sinh lực đầu tiên.',
      maxLevel: 10
    },
    2: {
      tier: 2,
      tierName: 'Trưởng Thành',
      badge: '🟡 BẬC 2: TRƯỞNG THÀNH',
      skillName: 'Cửu U Xà Trận',
      skillDesc: 'Độc ăn mòn DoT: Mỗi giây Boss mất 30 HP trong 10s (Tổng 300 HP) và không thể hồi phục.',
      bossCounterDesc: 'Boss Lượng Máu Lớn: Chặn hoàn toàn khả năng hồi phục máu của Boss.',
      maxLevel: 20
    },
    3: {
      tier: 3,
      tierName: 'Thần Linh Thức Tỉnh',
      badge: '🔴 BẬC 3: THẦN LINH THỨC TỈNH',
      skillName: 'Bát Kỳ Thần Diệt Hoang Dã',
      skillDesc: 'Nuốt chửng 15% HP hiện tại của Đại Trùm ngay lập tức + tan rã toàn bộ độc tố bàn cờ!',
      bossCounterDesc: 'Boss Tối Cường Boss Arena: Trảm thẳng 15% HP khổng lồ.',
      maxLevel: 30
    }
  }
};

export class CompanionManager {
  public static get(id: string): CompanionConfig {
    return COMPANIONS[id] || COMPANIONS['inari_kitsune'];
  }

  public static getAll(): CompanionConfig[] {
    return Object.values(COMPANIONS);
  }

  public static getUpgradeCost(currentLevel: number): { shards: number; coins: number } {
    return COMPANION_UPGRADE_COSTS[currentLevel] || { shards: 100, coins: 2000 };
  }

  public static getTierInfo(companionId: string, tier: number): CompanionTierInfo {
    const validTier = Math.max(1, Math.min(3, tier));
    const compTiers = COMPANION_TIERS[companionId];
    if (compTiers && compTiers[validTier]) {
      return compTiers[validTier];
    }
    const comp = this.get(companionId);
    return {
      tier: validTier,
      tierName: validTier === 1 ? 'Ấu Thú' : (validTier === 2 ? 'Trưởng Thành' : 'Thần Linh Thức Tỉnh'),
      badge: validTier === 1 ? '🟢 BẬC 1: ẤU THÚ' : (validTier === 2 ? '🟡 BẬC 2: TRƯỞNG THÀNH' : '🔴 BẬC 3: THẦN LINH THỨC TỈNH'),
      skillName: comp.skillName,
      skillDesc: comp.skillDesc,
      bossCounterDesc: 'Khắc chế cơ chế đặc trưng của Đại Boss tương ứng.',
      maxLevel: validTier === 1 ? 10 : (validTier === 2 ? 20 : 30)
    };
  }

  public static getLevelInfo(companionId: string, level: number): CompanionLevelInfo {
    const comp = this.get(companionId);
    const lvIndex = Math.max(0, Math.min(4, level - 1));
    if (comp.levels && comp.levels[lvIndex]) {
      return comp.levels[lvIndex];
    }
    return {
      level,
      skillDesc: comp.skillDesc,
      passiveDesc: comp.passiveDesc || '',
      perkSummary: '',
      requiredShards: 0,
      requiredCoins: 0
    };
  }
}
