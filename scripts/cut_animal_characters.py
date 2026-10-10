import os
import cv2
import numpy as np
from PIL import Image

ANIMAL_SHEET_CONFIGS = [
    {
        "id": "sheet_01_cute_pets",
        "chapter_dir": "chapter_01_cute_pets",
        "title": "Thú Cưng Đáng Yêu (Cute Pets & Companions)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791502343596.jpg",
        "characters": [
            {
                "id": "shiba_inu",
                "name": "Chó Shiba Khăn Đỏ Mochi",
                "native": "Shiba Inu Mochi",
                "title": "Chú Cún Hạnh Phúc",
                "symbol": "🐕",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú chó Shiba lông vàng đeo khăn quàng đỏ in dấu chân, đôi mắt cười rạng rỡ và cái đuôi xoăn tít luôn vẫy chào mừng bạn (Mascot Bộ Sưu Tập)."
            },
            {
                "id": "tuxedo_cat",
                "name": "Mèo Tuxedo Chuông Vàng Oreo",
                "native": "Tuxedo Cat Oreo",
                "title": "Quý Tộc Meo Meo",
                "symbol": "🐈",
                "rarity": "rare",
                "element": "light",
                "desc": "Bé mèo nhị thể đen trắng đeo vòng cổ xanh đính chuông vàng leng keng, giơ chiếc chân tròn xoe vẫy gọi may mắn và tài lộc."
            },
            {
                "id": "golden_hamster",
                "name": "Chuột Hamster Hạt Dưa Hami",
                "native": "Golden Hamster Hami",
                "title": "Bé Gặm Nhấm Má Phính",
                "symbol": "🐹",
                "rarity": "common",
                "element": "earth",
                "desc": "Bé chuột hamster béo mầm hai má phúng phính ôm khư khư hạt hướng dương to bự, đôi mắt đen láy say sưa gặm nhấm cả ngày."
            },
            {
                "id": "chinchilla_ribbon",
                "name": "Sóc Chinchilla Nơ Tím Lala",
                "native": "Chinchilla Lala",
                "title": "Cục Bông Xám Mềm Mại",
                "symbol": "🐭",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Bé sóc Chinchilla lông xám siêu mượt cài chiếc nơ tím xinh xắn trên tai to tròn, chiếc đuôi bông bềnh mềm như kẹo bông gòn."
            },
            {
                "id": "playful_ferret",
                "name": "Chồn Ferret Bóng Xanh Pippin",
                "native": "Playful Ferret Pippin",
                "title": "Vận Động Viên Nghịch Ngợm",
                "symbol": "🦡",
                "rarity": "rare",
                "element": "water",
                "desc": "Chú chồn Ferret thân dài thon thả ôm quả bóng đồ chơi in hình bàn chân xanh biếc, uốn éo đùa nghịch thoăn thoắt không biết mệt."
            },
            {
                "id": "cockatiel_parrot",
                "name": "Vẹt Mào Má Hồng Sunny",
                "native": "Cockatiel Sunny",
                "title": "Ca Sĩ Lông Vũ Vàng",
                "symbol": "🦜",
                "rarity": "rare",
                "element": "wind",
                "desc": "Chú vẹt Cockatiel có chiếc mào vàng vểnh cao và hai đốm má hồng cam đáng yêu, giang rộng đôi cánh hót líu lo chào ngày mới."
            },
            {
                "id": "guinea_pig",
                "name": "Bọ Ú Chuột Lang Coco",
                "native": "Guinea Pig Coco",
                "title": "Bé Bông Ba Màu Mũm Mĩm",
                "symbol": "🐹",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú bọ ú chuột lang khoác bộ lông ba màu trắng vàng đen mập mạp, thích ăn cỏ tươi và phát ra tiếng kêu chít chít ngọt ngào."
            },
            {
                "id": "pomeranian_pup",
                "name": "Cún Phốc Sóc Nơ Xanh Puffy",
                "native": "Pomeranian Puffy",
                "title": "Cục Bông Vàng Tinh Nghịch",
                "symbol": "🐶",
                "rarity": "epic",
                "element": "light",
                "desc": "Cún cưng Pomeranian bộ lông xù vàng óng thắt chiếc nơ xanh ngọc bích, đôi mắt long lanh chạy lon ton quấn quýt bên chủ nhân."
            },
            {
                "id": "pet_toy_chest",
                "name": "Rương Đồ Chơi Thú Cưng Joybox",
                "native": "Pet Toy Chest Joybox",
                "title": "Kho Báu Niềm Vui Thú Cưng",
                "symbol": "🎁",
                "rarity": "legendary",
                "element": "light",
                "desc": "Chiếc rương gỗ vàng nẹp đồng nháy mắt cười híp mí, chứa đầy xương gặm, bóng cao su, cuộn len và lục lạc sắc màu cho thú cưng."
            }
        ]
    },
    {
        "id": "sheet_02_african_savanna",
        "chapter_dir": "chapter_02_african_savanna",
        "title": "Thảo Nguyên Savanna (African Savanna & Safari)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791502343642.jpg",
        "characters": [
            {
                "id": "lion_cub_simba",
                "name": "Tiểu Sư Tử Bờm Nâu Leo",
                "native": "Lion Cub Leo",
                "title": "Chúa Tể Thảo Nguyên Nhí",
                "symbol": "🦁",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Sư tử con bộ lông vàng ấm áp với chỏm bờm nâu hạt dẻ, ánh mắt dũng cảm và bước chân vững chãi trên vùng đất hoang dã Châu Phi."
            },
            {
                "id": "baby_elephant_tempo",
                "name": "Voi Con Vòi Nước Jumbo",
                "native": "Baby Elephant Jumbo",
                "title": "Khổng Lồ Hiền Lành",
                "symbol": "🐘",
                "rarity": "epic",
                "element": "water",
                "desc": "Voi con da xám quàng tấm thảm thổ cẩm đỏ vàng rực rỡ, giơ chiếc vòi dài phun ra những giọt nước mát lạnh xua tan nắng hè."
            },
            {
                "id": "baby_giraffe_twiga",
                "name": "Hươu Cao Cổ Đốm Vàng Twiga",
                "native": "Baby Giraffe Twiga",
                "title": "Cổ Dài Hái Sao",
                "symbol": "🦒",
                "rarity": "rare",
                "element": "wood",
                "desc": "Hươu cao cổ nhí có đôi sừng nhung mềm và các đốm hoa văn vàng nâu, sải đôi chân dài thoăn thoắt gặm những đọt lá keo non ngọt ngào."
            },
            {
                "id": "baby_zebra_stripes",
                "name": "Ngựa Vằn Khăn Đỏ Ziggy",
                "native": "Baby Zebra Ziggy",
                "title": "Vận Động Viên Sọc Đen Trắng",
                "symbol": "🦓",
                "rarity": "rare",
                "element": "wind",
                "desc": "Chú ngựa vằn con đeo chiếc khăn đỏ thổ cẩm viền vàng, khoác bộ sọc đen trắng kỳ ảo tung vó chạy đua cùng gió trên thảo nguyên."
            },
            {
                "id": "meerkat_sentry",
                "name": "Chồn Cảnh Vệ Meerkat Timon",
                "native": "Meerkat Sentry Timon",
                "title": "Đôi Mắt Tinh Anh Thảo Nguyên",
                "symbol": "🦫",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú chồn Meerkat đứng thẳng trên đồi cát bằng hai chân sau, nghiêng đầu quan sát chân trời bao la để bảo vệ cả đàn an toàn."
            },
            {
                "id": "baby_hippo_lotus",
                "name": "Hà Mã Đầm Sen Bubbles",
                "native": "Baby Hippo Bubbles",
                "title": "Vua Tắm Mát Đầm Lầy",
                "symbol": "🦛",
                "rarity": "rare",
                "element": "water",
                "desc": "Hà mã con da tím xám tròn lẳn ngâm mình trong dòng suối mát lành bên đóa hoa sen hồng, nở nụ cười rạng rỡ và thổi bong bóng nước."
            },
            {
                "id": "baby_rhino_horn",
                "name": "Tê Giác Con Giáp Sắt Rocky",
                "native": "Baby Rhino Rocky",
                "title": "Cỗ Xe Tăng Nhí Đáng Yêu",
                "symbol": "🦏",
                "rarity": "rare",
                "element": "earth",
                "desc": "Tê giác nhí lớp da dày như áo giáp kiên cố với chiếc sừng trắng nhú lên dũng mãnh, sẵn sàng húc đổ mọi chướng ngại vật."
            },
            {
                "id": "baby_ostrich_runner",
                "name": "Đà Điểu Chân Dài Dash",
                "native": "Baby Ostrich Dash",
                "title": "Tia Chớp Cát Vàng",
                "symbol": "🦤",
                "rarity": "uncommon",
                "element": "wind",
                "desc": "Đà điểu lông vũ đen trắng bồng bềnh với cặp chân hồng sải bước thần tốc, đôi mắt tròn xoe ngạc nhiên nhìn thế giới bao la."
            },
            {
                "id": "oasis_spring_spirit",
                "name": "Suối Nguồn Ốc Đảo Savanna",
                "native": "Oasis Spring Spirit",
                "title": "Mạch Nước Thần Tự Nhiên",
                "symbol": "🏞️",
                "rarity": "legendary",
                "element": "water",
                "desc": "Tảng đá ốc đảo cổ xưa phủ rêu xanh với thác nước trong vắt tuôn trào dưới bóng cây bao-báp, là cội nguồn sự sống của muôn thú."
            }
        ]
    },
    {
        "id": "sheet_03_happy_farm",
        "chapter_dir": "chapter_03_happy_farm",
        "title": "Nông Trại Thân Thương (Happy Farmyard)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791502343673.jpg",
        "characters": [
            {
                "id": "dairy_cow_bella",
                "name": "Bò Sữa Đeo Chuông Vàng Bella",
                "native": "Dairy Cow Bella",
                "title": "Nữ Hoàng Bơ Sữa Đồng Xanh",
                "symbol": "🐄",
                "rarity": "rare",
                "element": "earth",
                "desc": "Bò sữa đốm đen trắng dễ thương đeo vòng cổ đỏ đính quả chuông vàng kêu leng keng, cung cấp nguồn sữa tươi ngọt ngào cho trang trại."
            },
            {
                "id": "muddy_piglet_barny",
                "name": "Heo Con Lấm Bùn Barny",
                "native": "Muddy Piglet Barny",
                "title": "Bé Heo Hồng Yêu Đời",
                "symbol": "🐖",
                "rarity": "rare",
                "element": "earth",
                "desc": "Chú heo con da hồng phấn nháy mắt lém lỉnh với những vết bùn đất ấm áp trên mình sau một ngày lăn lộn vui đùa thỏa thích."
            },
            {
                "id": "fluffy_sheep_wool",
                "name": "Cừu Bông Thắt Nơ Woolly",
                "native": "Fluffy Sheep Woolly",
                "title": "Đám Mây Trắng Đồng Cỏ",
                "symbol": "🐑",
                "rarity": "rare",
                "element": "wind",
                "desc": "Bé cừu bộ lông xoăn trắng muốt bồng bềnh thắt chiếc nơ xanh thắm đeo chuông vàng, mang lại những sợi len ấm áp nhất mùa đông."
            },
            {
                "id": "baby_goat_billy",
                "name": "Dê Con Leo Núi Billy",
                "native": "Baby Goat Billy",
                "title": "Chú Dê Hiếu Động",
                "symbol": "🐐",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú dê con lông kem có cặp sừng nhỏ xíu đeo vòng cổ xanh chuông vàng, thích nhảy nhót thoăn thoắt trên những hàng rào gỗ."
            },
            {
                "id": "farm_hen_chick",
                "name": "Gà Mái Mơ Ổ Rơm Penny",
                "native": "Farm Hen Penny",
                "title": "Người Mẹ Chăm Chỉ Nông Trại",
                "symbol": "🐔",
                "rarity": "common",
                "element": "wood",
                "desc": "Cô gà mái mơ lông hoa mơ ấm áp với mào đỏ tươi, luôn cần mẫn bới đất tìm giun và ấp ủ những quả trứng vàng óng."
            },
            {
                "id": "proud_rooster_crow",
                "name": "Gà Trống Đuôi Xanh Chanticleer",
                "native": "Proud Rooster Chanticleer",
                "title": "Đồng Hồ Báo Thức Bình Minh",
                "symbol": "🐓",
                "rarity": "rare",
                "element": "fire",
                "desc": "Chú gà trống oai vệ bộ lông lửa đỏ vàng rực rỡ và chiếc đuôi xanh ngọc biếc, cất tiếng gáy vang giòn đánh thức cả nông trang."
            },
            {
                "id": "yellow_duckling_quack",
                "name": "Vịt Vàng Khăn Xanh Ducky",
                "native": "Yellow Duckling Ducky",
                "title": "Thủy Thủ Nhí Bơi Lội",
                "symbol": "🐥",
                "rarity": "common",
                "element": "water",
                "desc": "Chú vịt con lông tơ vàng óng quàng chiếc khăn xanh lá cây, vừa bơi lội vừa vẫy đôi cánh nhỏ xíu cất tiếng cạp cạp vui nhộn."
            },
            {
                "id": "farm_pony_clover",
                "name": "Ngựa Con Bờm Vàng Clover",
                "native": "Farm Pony Clover",
                "title": "Dũng Sĩ Vó Ngựa Đồng Quê",
                "symbol": "🐴",
                "rarity": "epic",
                "element": "wind",
                "desc": "Chú ngựa con màu hạt dẻ với chiếc bờm vàng óng ả tung bay, bốn móng guốc trắng phi nước đại hiền hòa trên đồng cỏ thơm."
            },
            {
                "id": "golden_haystack_spirit",
                "name": "Đụn Rơm Vàng Nơ Đỏ Haylee",
                "native": "Golden Haystack Haylee",
                "title": "Linh Hồn Mùa Gặt Bội Thu",
                "symbol": "🌾",
                "rarity": "legendary",
                "element": "wood",
                "desc": "Cuộn rơm vàng óng thắt chiếc nơ lụa đỏ tươi mang đôi mắt cười lấp lánh, tượng trưng cho mùa màng no ấm và trù phú của làng quê."
            }
        ]
    },
    {
        "id": "sheet_04_tropical_jungle",
        "chapter_dir": "chapter_04_tropical_jungle",
        "title": "Rừng Rậm Nhiệt Đới (Tropical Rainforest & Jungle)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791502343708.jpg",
        "characters": [
            {
                "id": "tiger_cub_rajah",
                "name": "Tiểu Hổ Rừng Xanh Rajah",
                "native": "Tiger Cub Rajah",
                "title": "Mãnh Hổ Vằn Cam Nhí",
                "symbol": "🐯",
                "rarity": "legendary",
                "element": "fire",
                "desc": "Bé hổ con lông cam sọc đen uy phong với chiếc đuôi vẫy cao và đôi mắt tròn xoe dũng mãnh, vua tương lai của rừng già nhiệt đới."
            },
            {
                "id": "monkey_banana_momo",
                "name": "Khỉ Con Cầm Chuối Momo",
                "native": "Monkey Momo",
                "title": "Vua Chuyền Cành Tinh Nghịch",
                "symbol": "🐒",
                "rarity": "rare",
                "element": "wood",
                "desc": "Chú khỉ nâu đuôi dài thoăn thoắt cầm quả chuối chín vàng, nhảy nhót chuyền cành trêu đùa muôn loài khắp các tán cây cổ thụ."
            },
            {
                "id": "toucan_rainbow_beak",
                "name": "Chim Toucan Mỏ Cầu Vồng Toco",
                "native": "Toucan Toco",
                "title": "Sứ Giả Tán Rừng Nhiệt Đới",
                "symbol": "🦜",
                "rarity": "rare",
                "element": "wind",
                "desc": "Chim Toucan lông đen cánh xanh đỏ sở hữu chiếc mỏ khổng lồ màu vàng cam rực rỡ, lướt bay kiêu hãnh trên vòm trời rừng mưa."
            },
            {
                "id": "sloth_tree_hugger",
                "name": "Chú Lười Ôm Nhánh Cây Slowpoke",
                "native": "Sloth Slowpoke",
                "title": "Bậc Thầy Sống Chậm Thư Thái",
                "symbol": "🦥",
                "rarity": "uncommon",
                "element": "wood",
                "desc": "Chú lười ba móng treo mình thư thái trên cành cây lá xanh, mỉm cười thanh thản tận hưởng từng khoảnh khắc bình yên của thiên nhiên."
            },
            {
                "id": "baby_tapir_snout",
                "name": "Heo Vòi Đốm Đen Trắng Pipa",
                "native": "Baby Tapir Pipa",
                "title": "Kẻ Giấu Mình Trong Lá Thấp",
                "symbol": "🦛",
                "rarity": "rare",
                "element": "earth",
                "desc": "Heo vòi con có chiếc mũi vòi linh hoạt và bộ lông hai màu đen trắng độc đáo, lách qua thảm thực vật tìm kiếm những quả mọng ngọt lành."
            },
            {
                "id": "scarlet_macaw_rio",
                "name": "Vẹt Đỏ Đuôi Dài Scarlet Rio",
                "native": "Scarlet Macaw Rio",
                "title": "Vũ Công Không Gian Rừng Rậm",
                "symbol": "🦜",
                "rarity": "epic",
                "element": "fire",
                "desc": "Vẹt Macaw đỏ thắm với đôi cánh ngũ sắc rực rỡ như cầu vồng, sải cánh bay lượn và cất tiếng gọi đàn vang vọng giữa thung lũng xanh."
            },
            {
                "id": "capybara_flower_zen",
                "name": "Chuột Lang Nước Cài Hoa Capy",
                "native": "Zen Capybara Capy",
                "title": "Sứ Giả Hòa Bình Rừng Xanh",
                "symbol": "🦫",
                "rarity": "epic",
                "element": "water",
                "desc": "Chuột lang nước Capybara hiền hòa cài đóa hoa dâm bụt hồng trên tai, ngồi thiền thư thái bên bờ suối là bạn thân của muôn loài."
            },
            {
                "id": "red_eyed_tree_frog",
                "name": "Ếch Cây Mắt Đỏ Kero",
                "native": "Tree Frog Kero",
                "title": "Vũ Công Lá Môn Mắt Hồng Ngọc",
                "symbol": "🐸",
                "rarity": "rare",
                "element": "water",
                "desc": "Chú ếch cây da xanh ngọc bích sọc lam với ngón chân cam bám dính và đôi mắt đỏ rực như ruby, nhảy múa trên phiến lá môn ướt sương."
            },
            {
                "id": "ancient_jungle_totem",
                "name": "Tượng Thần Rừng Cổ Đại Totem",
                "native": "Ancient Jungle Totem",
                "title": "Thần Hộ Vệ Thảm Thực Vật",
                "symbol": "🗿",
                "rarity": "legendary",
                "element": "wood",
                "desc": "Pho tượng gỗ thần rừng khắc viên ngọc lục bảo trên trán quấn quanh bởi dây leo cổ thụ, bảo vệ sự cân bằng thiêng liêng của rừng rậm."
            }
        ]
    },
    {
        "id": "sheet_05_arctic_polar",
        "chapter_dir": "chapter_05_arctic_polar",
        "title": "Miền Băng Tuyết Bắc Cực (Arctic & Polar Wonderland)",
        "source": "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/.user_uploaded/media_1791502343726.jpg",
        "characters": [
            {
                "id": "polar_bear_cub_nanook",
                "name": "Gấu Bắc Cực Khăn Len Đỏ Nanook",
                "native": "Polar Bear Nanook",
                "title": "Hoàng Tử Băng Giá Tí Hon",
                "symbol": "🐻‍❄️",
                "rarity": "legendary",
                "element": "water",
                "desc": "Gấu Bắc Cực lông trắng như tuyết quàng khăn len đỏ ấm áp, giơ chiếc bàn chân mập mạp vẫy chào giữa vùng cực băng giá vô tận."
            },
            {
                "id": "penguin_beanie_pip",
                "name": "Chim Cánh Cụt Mũ Len Vàng Pingu",
                "native": "Penguin Pingu",
                "title": "Thợ Trượt Băng Đáng Yêu",
                "symbol": "🐧",
                "rarity": "rare",
                "element": "water",
                "desc": "Chú chim cánh cụt mặc áo len đội mũ quả bông vàng óng ả, lắc lư đôi cánh ngắn trượt băng vèo vèo trên những tảng băng trôi."
            },
            {
                "id": "arctic_fox_snowy",
                "name": "Cáo Tuyết Bắc Cực Vulpix",
                "native": "Arctic Fox Snowy",
                "title": "Bóng Ma Trắng Bão Tuyết",
                "symbol": "🦊",
                "rarity": "epic",
                "element": "wind",
                "desc": "Cáo tuyết Bắc Cực mang bộ lông trắng muốt cùng chiếc đuôi chùm bông bồng bềnh, đôi mắt xanh thẳm lanh lợi soi bóng trong tuyết trắng."
            },
            {
                "id": "baby_harp_seal",
                "name": "Hải Cẩu Đốm Mắt Tròn Mochi",
                "native": "Baby Harp Seal Mochi",
                "title": "Cục Bông Biển Băng Cực",
                "symbol": "🦭",
                "rarity": "rare",
                "element": "water",
                "desc": "Bé hải cẩu lông đốm xám mắt to tròn xoe đen láy, bơi lội mềm mại giữa làn nước biển bắc cực lạnh giá với nụ cười thiên thần."
            },
            {
                "id": "snowy_owl_hedwig",
                "name": "Cú Tuyết Mắt Hoàng Kim Hedwig",
                "native": "Snowy Owl Hedwig",
                "title": "Kẻ Bay Lượn Đêm Bắc Cực",
                "symbol": "🦉",
                "rarity": "rare",
                "element": "wind",
                "desc": "Cú tuyết trắng chấm đen với đôi mắt vàng rực như ánh trăng rằm, sải đôi cánh êm ái bay qua đỉnh những núi băng tuyết trắng."
            },
            {
                "id": "mountain_goat_snow",
                "name": "Dê Núi Tuyết Sừng Cong Bucky",
                "native": "Mountain Goat Bucky",
                "title": "Dũng Sĩ Vách Đá Băng Giá",
                "symbol": "🐐",
                "rarity": "uncommon",
                "element": "earth",
                "desc": "Chú dê núi lông trắng dày dặn với cặp sừng cong khỏe khoắn, sải những bước chân móng guốc chắc nịch trên vách đá cheo leo phủ băng."
            },
            {
                "id": "tibetan_yak_yogi",
                "name": "Bò Tây Tạng Lông Dày Yogi",
                "native": "Tibetan Yak Yogi",
                "title": "Người Bạn Đồng Hành Băng Nguyên",
                "symbol": "🐂",
                "rarity": "epic",
                "element": "earth",
                "desc": "Bò Yak lông nâu dài rủ đeo chuông vàng và tấm thảm thêu thổ cẩm sặc sỡ, kiên cường vượt qua những đợt bão tuyết khắc nghiệt nhất."
            },
            {
                "id": "chubby_marmot_marm",
                "name": "Sóc Đất Marmot Béo Mầm Marm",
                "native": "Chubby Marmot Marm",
                "title": "Tiếng Reo Vang Đỉnh Tuyết",
                "symbol": "🐿️",
                "rarity": "rare",
                "element": "earth",
                "desc": "Bé sóc đất Marmot bụng bự múp míp đứng hai chân sau cất tiếng huýt sáo báo hiệu mùa xuân về trên thảo nguyên băng giá."
            },
            {
                "id": "ice_crystal_guardian",
                "name": "Tinh Linh Băng Tinh Frosty",
                "native": "Ice Crystal Guardian Frosty",
                "title": "Trái Tim Băng Giá Vĩnh Cửu",
                "symbol": "💎",
                "rarity": "legendary",
                "element": "water",
                "desc": "Bé tinh linh sinh ra từ các khối tinh thể lam ngọc đóng băng ngàn năm khoác giáp gỗ tuyết, phát ra hào quang lạnh giá thanh khiết."
            }
        ]
    }
]

def process_and_cut_animal():
    base_theme_dir = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes/animal"
    output_chars_root = os.path.join(base_theme_dir, "characters")
    output_sheets_dir = os.path.join(base_theme_dir, "sheets")

    os.makedirs(output_chars_root, exist_ok=True)
    os.makedirs(output_sheets_dir, exist_ok=True)

    grid_centers = []
    for r in range(3):
        for c in range(3):
            grid_centers.append(((c + 0.5) * 1024 / 3, (r + 0.5) * 1024 / 3))

    all_cutouts = []

    for sheet_idx, sheet in enumerate(ANIMAL_SHEET_CONFIGS):
        chapter_dir_name = sheet["chapter_dir"]
        chapter_chars_dir = os.path.join(output_chars_root, chapter_dir_name)
        os.makedirs(chapter_chars_dir, exist_ok=True)

        print(f"\n[{sheet_idx+1}/{len(ANIMAL_SHEET_CONFIGS)}] Processing {sheet['id']}: {sheet['title']} -> {chapter_dir_name}...")
        im_cv = cv2.imread(sheet["source"])
        im_pil = Image.open(sheet["source"])

        # Save copy of source sheet
        sheet_dest = os.path.join(output_sheets_dir, f"{sheet['id']}.png")
        im_pil.save(sheet_dest)

        val = np.max(im_cv, axis=2)
        binary = (val > 15).astype(np.uint8) * 255
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary)

        # Group components by nearest grid slot
        slot_components = {i: [] for i in range(9)}
        slot_bboxes = {i: [1024, 1024, 0, 0] for i in range(9)}

        for label_id in range(1, num_labels):
            cx, cy = centroids[label_id]
            dists = [((cx - gx)**2 + (cy - gy)**2) for gx, gy in grid_centers]
            nearest_slot = int(np.argmin(dists))

            slot_components[nearest_slot].append(label_id)
            x = stats[label_id, cv2.CC_STAT_LEFT]
            y = stats[label_id, cv2.CC_STAT_TOP]
            w = stats[label_id, cv2.CC_STAT_WIDTH]
            h = stats[label_id, cv2.CC_STAT_HEIGHT]

            slot_bboxes[nearest_slot][0] = min(slot_bboxes[nearest_slot][0], x)
            slot_bboxes[nearest_slot][1] = min(slot_bboxes[nearest_slot][1], y)
            slot_bboxes[nearest_slot][2] = max(slot_bboxes[nearest_slot][2], x + w)
            slot_bboxes[nearest_slot][3] = max(slot_bboxes[nearest_slot][3], y + h)

        # Process each slot
        for slot_idx in range(9):
            char_meta = sheet["characters"][slot_idx]
            x1, y1, x2, y2 = slot_bboxes[slot_idx]

            # Gentle padding
            pad = 12
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(1024, x2 + pad)
            y2 = min(1024, y2 + pad)

            # Crop region
            sub_cv = im_cv[y1:y2, x1:x2].astype(np.float32)
            sub_labels = labels[y1:y2, x1:x2]

            # Mask only components belonging to this slot
            valid_labels = set(slot_components[slot_idx])
            in_slot_mask = np.isin(sub_labels, list(valid_labels))

            sub_val = np.max(sub_cv, axis=2)
            alpha = np.zeros_like(sub_val)

            # Smooth anti-aliased alpha threshold ramp
            mask_mid = (sub_val > 4) & (sub_val <= 32) & in_slot_mask
            mask_high = (sub_val > 32) & in_slot_mask
            alpha[mask_mid] = (sub_val[mask_mid] - 4) / 28.0
            alpha[mask_high] = 1.0

            # Un-premultiply BGR by alpha to eliminate black halo/fringing
            bgr = sub_cv.copy()
            alpha_safe = np.maximum(alpha, 0.05)[:, :, np.newaxis]
            bgr = np.clip(bgr / alpha_safe, 0, 255)

            # Convert BGR to RGB
            rgb = cv2.cvtColor(bgr.astype(np.uint8), cv2.COLOR_BGR2RGB)
            rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])

            char_img = Image.fromarray(rgba)

            # Square and center the character
            cw, ch = char_img.size
            sq_size = max(cw, ch) + 16
            square_canvas = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
            offset_x = (sq_size - cw) // 2
            offset_y = (sq_size - ch) // 2
            square_canvas.paste(char_img, (offset_x, offset_y), char_img)

            # Resize to high-res standard 512x512
            final_img = square_canvas.resize((512, 512), Image.Resampling.LANCZOS)

            char_filename = f"{char_meta['id']}.png"
            dest_path = os.path.join(chapter_chars_dir, char_filename)
            final_img.save(dest_path)

            # Save to flat dir as well
            final_img.save(os.path.join(output_chars_root, char_filename))

            all_cutouts.append((char_meta, dest_path, final_img))
            print(f"  ✓ Cut [{slot_idx+1}/9] {char_meta['name']} ({char_meta['native']}) -> {dest_path}")

    # Generate preview montage of all cutouts (5 rows x 9 columns)
    cols = 9
    rows = len(ANIMAL_SHEET_CONFIGS)
    tile_size = 140
    gap = 8
    montage_w = cols * (tile_size + gap) + gap
    montage_h = rows * (tile_size + gap) + gap
    montage = Image.new("RGBA", (montage_w, montage_h), (24, 28, 24, 255))

    for idx, (meta, path, img) in enumerate(all_cutouts):
        r = idx // cols
        c = idx % cols
        thumb = img.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
        x = gap + c * (tile_size + gap)
        y = gap + r * (tile_size + gap)
        montage.paste(thumb, (x, y), thumb)

    montage_path = os.path.join(output_sheets_dir, "preview_all_45_animal.png")
    montage.save(montage_path)

    brain_montage_path = "/Users/huynhtronghieu/.gemini/antigravity-ide/brain/10bcefd0-d8c8-4018-88ba-57dbcff8ce87/preview_all_45_animal.png"
    montage.save(brain_montage_path)
    print(f"\n✨ Sliced all {len(all_cutouts)} Animal Kingdom characters! Preview montage: {montage_path}")

    # Create symlinks
    themes_root = "/Users/huynhtronghieu/Documents/game/noi-thu/public/assets/themes"
    for link_name in ["animals", "dong-vat", "thu-cung"]:
        link_path = os.path.join(themes_root, link_name)
        if not os.path.exists(link_path):
            try:
                os.symlink("animal", link_path)
                print(f"✓ Created symlink {link_name} -> animal")
            except Exception as e:
                print(f"Note on symlink {link_name}: {e}")

if __name__ == "__main__":
    process_and_cut_animal()
