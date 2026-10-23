import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { formatCurrency, FONT_UI, FONT_DISPLAY } from '../styles/typography';

export class ShopModal {
  public static open(
    scene: Phaser.Scene,
    onClose?: () => void
  ): Phaser.GameObjects.Container {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const { width: screenW } = getScreenDimensions();
    const audio = AudioSystem.getInstance();
    const haptic = HapticSystem.getInstance();
    const save = SaveSystem.getInstance();

    const container = scene.add.container(width / 2, height / 2).setDepth(450);

    // 1. Dark Glass Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.88);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', () => {
      audio.playSelect();
      container.destroy();
      onClose?.();
    });
    container.add(backdrop);

    // 2. Main Dialog Frame (Lacquer Wood & Gold Inlay)
    const frameW = 940;
    const frameH = 580;
    const frame = scene.add.graphics();
    // Deep Ebony Lacquer base
    frame.fillStyle(0x111024, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 22);
    // Gold filigree border
    frame.lineStyle(2.5, 0xffd700, 0.9);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 22);
    // Inner glowing ring
    frame.lineStyle(1.2, 0xff758f, 0.4);
    frame.strokeRoundedRect(-frameW / 2 + 6, -frameH / 2 + 6, frameW - 12, frameH - 12, 18);
    container.add(frame);

    // 3. Header Ribbon
    const headerY = -frameH / 2 + 38;
    const title = scene.add.text(-frameW / 2 + 38, headerY - 10, '🏮 TIỆM ĐẠO CỤ QUÂN NHU', {
      fontFamily: FONT_UI,
      fontSize: '24px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0, 0.5);
    container.add(title);

    const subTitle = scene.add.text(
      -frameW / 2 + 38,
      headerY + 16,
      'Trang bị bảo bối tác chiến trước khi ra trận • Tuyệt đối không bán giữa trận đấu',
      {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }
    ).setOrigin(0, 0.5);
    container.add(subTitle);

    // Header Right: Currency Capsule Pills (matching Main Menu style with luminous borders)
    const diaPillW = 104;
    const diaPillH = 32;
    const diaPillX = frameW / 2 - 92;

    const diaPillBg = scene.add.graphics();
    diaPillBg.fillStyle(0x13172e, 0.95);
    diaPillBg.fillRoundedRect(diaPillX - diaPillW / 2, headerY - diaPillH / 2, diaPillW, diaPillH, 16);
    diaPillBg.lineStyle(1.4, 0x00b4d8, 0.9);
    diaPillBg.strokeRoundedRect(diaPillX - diaPillW / 2, headerY - diaPillH / 2, diaPillW, diaPillH, 16);

    const hasGemIcon = scene.textures.exists('icon_diamond');
    const gemImg = hasGemIcon
      ? scene.add.image(diaPillX - diaPillW / 2 + 18, headerY, 'icon_diamond').setDisplaySize(18, 18)
      : null;

    const walletDiamondsText = scene.add.text(
      hasGemIcon ? diaPillX - diaPillW / 2 + 33 : diaPillX - diaPillW / 2 + 14,
      headerY,
      `${hasGemIcon ? '' : '💎 '}${formatCurrency(save.getDiamonds())} KC`,
      {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '900',
        color: '#00f5d4'
      }
    ).setOrigin(0, 0.5);

    const coinPillW = 124;
    const coinPillH = 32;
    const coinPillX = diaPillX - diaPillW / 2 - 12 - coinPillW / 2;

    const coinPillBg = scene.add.graphics();
    coinPillBg.fillStyle(0x13172e, 0.95);
    coinPillBg.fillRoundedRect(coinPillX - coinPillW / 2, headerY - coinPillH / 2, coinPillW, coinPillH, 16);
    coinPillBg.lineStyle(1.4, 0xd4af37, 0.9);
    coinPillBg.strokeRoundedRect(coinPillX - coinPillW / 2, headerY - coinPillH / 2, coinPillW, coinPillH, 16);

    const hasCoinIcon = scene.textures.exists('icon_reward_coin');
    const coinImg = hasCoinIcon
      ? scene.add.image(coinPillX - coinPillW / 2 + 18, headerY, 'icon_reward_coin').setDisplaySize(20, 20)
      : null;

    const walletCoinsText = scene.add.text(
      hasCoinIcon ? coinPillX - coinPillW / 2 + 34 : coinPillX - coinPillW / 2 + 14,
      headerY,
      `${hasCoinIcon ? '' : '💰 '}${formatCurrency(save.getCoins())} Xu`,
      {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '900',
        color: '#ffd700'
      }
    ).setOrigin(0, 0.5);

    container.add([
      coinPillBg,
      ...(coinImg ? [coinImg] : []),
      walletCoinsText,
      diaPillBg,
      ...(gemImg ? [gemImg] : []),
      walletDiamondsText
    ]);

    // Close button (Top-Right "✕")
    const closeTopBtn = scene.add.text(frameW / 2 - 28, headerY, '✕', {
      fontFamily: FONT_UI,
      fontSize: '22px',
      fontStyle: '900',
      color: '#ff758f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeTopBtn.on('pointerdown', () => {
      audio.playSelect();
      container.destroy();
      onClose?.();
    });
    closeTopBtn.on('pointerover', () => closeTopBtn.setColor('#ffffff'));
    closeTopBtn.on('pointerout', () => closeTopBtn.setColor('#ff758f'));
    container.add(closeTopBtn);

    // Toast feedback message
    const toastText = scene.add.text(0, -frameH / 2 + 76, '', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#51cf66'
    }).setOrigin(0.5);
    container.add(toastText);

    const showToast = (msg: string, isError: boolean = false) => {
      toastText.setText(msg);
      toastText.setColor(isError ? '#ff4d6d' : '#00f5d4');
      scene.tweens.add({
        targets: toastText,
        alpha: { from: 1, to: 0.7 },
        scale: { from: 1.08, to: 1.0 },
        duration: 250,
        yoyo: true,
        repeat: 1
      });
    };

    const updateWalletUI = () => {
      walletCoinsText.setText(`${hasCoinIcon ? '' : '💰 '}${formatCurrency(save.getCoins())} Xu`);
      walletDiamondsText.setText(`${hasGemIcon ? '' : '💎 '}${formatCurrency(save.getDiamonds())} KC`);
    };

    // Store dynamic stock labels to update counts when bought
    const stockLabels: Record<string, Phaser.GameObjects.Text> = {};
    const buttonUpdaters: Array<() => void> = [];
    const refreshAllButtons = () => {
      buttonUpdaters.forEach(fn => fn());
    };

    const updateStockUI = () => {
      const b = save.getBoosters();
      if (stockLabels.hint) stockLabels.hint.setText(`Hiện có: ${b.hint} bình`);
      if (stockLabels.shuffle) stockLabels.shuffle.setText(`Hiện có: ${b.shuffle} quạt`);
      if (stockLabels.bomb) stockLabels.bomb.setText(`Hiện có: ${b.bomb} búa`);
    };


    // ==========================================
    // TOP ROW: 3 INDIVIDUAL BOOSTER CARDS WITH x1, x5, x10
    // ==========================================
    const cardW = 286;
    const cardH = 284;
    const topCardsY = -48;
    const cardSpacing = 296;

    const boosterConfigs = [
      {
        id: 'hint' as const,
        itemKey: 'item_booster_hint',
        icon: '💡',
        title: 'BÌNH GỢI Ý',
        desc: 'Soi sáng tức thì 1 cặp thẻ hợp lệ có thể kết nối ngay trên bàn.',
        badgeColor: 0xffbe0b,
        unit: 'bình',
        priceSingle: 500,
        pricePack: 2100,
        pricePack10: 3500,
        packCount: 5,
        discount: '-16%',
        savings10: 1500,
        x: -cardSpacing
      },
      {
        id: 'shuffle' as const,
        itemKey: 'item_booster_shuffle',
        icon: '🔀',
        title: 'QUẠT ĐỔI BẢNG',
        desc: 'Xáo trộn lại toàn bộ bàn cờ khi các cặp thẻ bị phân tán hiểm hóc.',
        badgeColor: 0x9d4edd,
        unit: 'quạt',
        priceSingle: 800,
        pricePack: 3400,
        pricePack10: 5600,
        packCount: 5,
        discount: '-15%',
        savings10: 2400,
        x: 0
      },
      {
        id: 'bomb' as const,
        itemKey: 'item_booster_bomb',
        icon: '⚡',
        title: 'BÚA SÉT TRẢM QUÁI',
        desc: 'Gọi sấm sét tiêu diệt tức thì 1 cặp thẻ bất kỳ trên bàn cờ.',
        badgeColor: 0xff0054,
        unit: 'búa',
        priceSingle: 1200,
        pricePack: 5100,
        pricePack10: 8400,
        packCount: 5,
        discount: '-15%',
        savings10: 3600,
        x: cardSpacing
      }
    ];

    boosterConfigs.forEach(cfg => {
      const card = scene.add.container(cfg.x, topCardsY);

      const cardBg = scene.add.graphics();
      cardBg.fillStyle(0x17192f, 0.95);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      cardBg.lineStyle(1.8, cfg.badgeColor, 0.85);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);

      // Artwork or Fallback Halo
      const itemKey = cfg.itemKey;
      let itemHalo: Phaser.GameObjects.Graphics;
      let itemObj: Phaser.GameObjects.GameObject;
      if (scene.textures.exists(itemKey)) {
        // Soft aura glow behind the item
        itemHalo = scene.add.graphics();
        itemHalo.fillStyle(cfg.badgeColor, 0.22);
        itemHalo.fillCircle(0, -cardH / 2 + 45, 34);

        const itemImg = scene.add.image(0, -cardH / 2 + 45, itemKey);
        itemImg.setDisplaySize(72, 72);
        itemObj = itemImg;

        // Subtle gentle breathing animation
        scene.tweens.add({
          targets: itemImg,
          scaleX: itemImg.scaleX * 1.05,
          scaleY: itemImg.scaleY * 1.05,
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else {
        itemHalo = scene.add.graphics();
        itemHalo.fillStyle(cfg.badgeColor, 0.15);
        itemHalo.fillCircle(0, -cardH / 2 + 45, 30);
        itemHalo.lineStyle(1.5, cfg.badgeColor, 0.9);
        itemHalo.strokeCircle(0, -cardH / 2 + 45, 30);

        itemObj = scene.add.text(0, -cardH / 2 + 45, cfg.icon, {
          fontSize: '32px'
        }).setOrigin(0.5);
      }

      const titleText = scene.add.text(0, -cardH / 2 + 93, cfg.title, {
        fontFamily: FONT_UI,
        fontSize: '16.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      const descText = scene.add.text(0, -cardH / 2 + 122, cfg.desc, {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '700',
        color: '#f8fafc',
        align: 'center',
        lineSpacing: 1,
        wordWrap: { width: cardW - 22 }
      }).setOrigin(0.5);

      const boosters = save.getBoosters();
      const currentCount = boosters[cfg.id] || 0;
      const stockBadge = scene.add.text(0, -cardH / 2 + 155, `Hiện có: ${currentCount} ${cfg.unit}`, {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: '800',
        color: '#ffd166'
      }).setOrigin(0.5);
      stockLabels[cfg.id] = stockBadge;

      // Purchase Button A: Single (x1)
      const btnSingleW = 120;
      const btnSingleH = 34;
      const btnSingleX = -66;
      const btnSingleY = -cardH / 2 + 196;

      const btnSingle = scene.add.container(btnSingleX, btnSingleY);
      const bsBg = scene.add.graphics();
      const bsTxt = scene.add.text(0, 0, '', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);
      btnSingle.add([bsBg, bsTxt]);
      btnSingle.setSize(btnSingleW, btnSingleH).setInteractive({ useHandCursor: true });

      const updateBtnSingleState = () => {
        const coins = save.getCoins();
        const canAfford = coins >= cfg.priceSingle;
        bsBg.clear();
        if (canAfford) {
          bsBg.fillStyle(0x232644, 0.95);
          bsBg.fillRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
          bsBg.lineStyle(1.4, 0xffd700, 0.85);
          bsBg.strokeRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
          bsTxt.setText(`1 cái • ${formatCurrency(cfg.priceSingle)} 💰`);
          bsTxt.setColor('#ffd700');
        } else {
          bsBg.fillStyle(0x1a1b2a, 0.85);
          bsBg.fillRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
          bsBg.lineStyle(1.2, 0xef4444, 0.5);
          bsBg.strokeRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
          bsTxt.setText(`Thiếu ${formatCurrency(cfg.priceSingle - coins)} 💰`);
          bsTxt.setColor('#f87171');
        }
      };
      buttonUpdaters.push(updateBtnSingleState);

      btnSingle.on('pointerdown', () => {
        haptic.medium();
        const coins = save.getCoins();
        if (coins < cfg.priceSingle) {
          audio.playError();
          scene.tweens.add({
            targets: btnSingle,
            x: btnSingleX + 6,
            duration: 50,
            yoyo: true,
            repeat: 3
          });
          showToast(`⚠️ Cần thêm ${formatCurrency(cfg.priceSingle - coins)} Xu Vàng! (Bạn có ${formatCurrency(coins)} Xu)`, true);
          return;
        }

        const res = save.buyBoosterWithCoins(cfg.id, 1, cfg.priceSingle);
        if (res.success) {
          audio.playVictory();
          showToast(`🎉 Mua thành công 1 ${cfg.title}! (-${formatCurrency(cfg.priceSingle)} Xu)`);
          updateWalletUI();
          updateStockUI();
          refreshAllButtons();
        } else {
          audio.playError();
          showToast(`⚠️ ${res.reason || 'Không đủ Xu Vàng!'}`, true);
        }
      });

      btnSingle.on('pointerover', () => {
        if (save.getCoins() >= cfg.priceSingle) {
          bsBg.clear();
          bsBg.fillStyle(0x353965, 1);
          bsBg.fillRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
          bsBg.lineStyle(1.8, 0xffe066, 1);
          bsBg.strokeRoundedRect(-btnSingleW / 2, -btnSingleH / 2, btnSingleW, btnSingleH, 9);
        }
      });
      btnSingle.on('pointerout', () => {
        updateBtnSingleState();
      });

      // Purchase Button B: Pack (x5) with Discount Badge
      const btnPackW = 120;
      const btnPackH = 34;
      const btnPackX = 66;
      const btnPackY = -cardH / 2 + 196;

      const btnPack = scene.add.container(btnPackX, btnPackY);
      const bpBg = scene.add.graphics();
      const bpTxt = scene.add.text(0, 0, '', {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Discount tag on top edge of pack button
      const tagBg = scene.add.graphics();
      tagBg.fillStyle(0xff0054, 1);
      tagBg.fillRoundedRect(btnPackW / 2 - 38, -btnPackH / 2 - 7, 38, 15, 4);
      const tagTxt = scene.add.text(btnPackW / 2 - 19, -btnPackH / 2, cfg.discount, {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      btnPack.add([bpBg, bpTxt, tagBg, tagTxt]);
      btnPack.setSize(btnPackW, btnPackH).setInteractive({ useHandCursor: true });

      const updateBtnPackState = () => {
        const coins = save.getCoins();
        const canAfford = coins >= cfg.pricePack;
        bpBg.clear();
        if (canAfford) {
          bpBg.fillStyle(0x7209b7, 0.95);
          bpBg.fillRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
          bpBg.lineStyle(1.4, 0x00f5d4, 0.9);
          bpBg.strokeRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
          bpTxt.setText(`Gói x5 • ${formatCurrency(cfg.pricePack)} 💰`);
          bpTxt.setColor('#ffffff');
        } else {
          bpBg.fillStyle(0x1f142b, 0.85);
          bpBg.fillRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
          bpBg.lineStyle(1.2, 0xef4444, 0.5);
          bpBg.strokeRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
          bpTxt.setText(`Thiếu ${formatCurrency(cfg.pricePack - coins)} 💰`);
          bpTxt.setColor('#f87171');
        }
      };
      buttonUpdaters.push(updateBtnPackState);

      btnPack.on('pointerdown', () => {
        haptic.medium();
        const coins = save.getCoins();
        if (coins < cfg.pricePack) {
          audio.playError();
          scene.tweens.add({
            targets: btnPack,
            x: btnPackX + 6,
            duration: 50,
            yoyo: true,
            repeat: 3
          });
          showToast(`⚠️ Cần thêm ${formatCurrency(cfg.pricePack - coins)} Xu Vàng! (Bạn có ${formatCurrency(coins)} Xu)`, true);
          return;
        }

        const res = save.buyBoosterWithCoins(cfg.id, cfg.packCount, cfg.pricePack);
        if (res.success) {
          audio.playVictory();
          showToast(`🎉 Mua thành công Gói x5 ${cfg.title}! (-${formatCurrency(cfg.pricePack)} Xu)`);
          updateWalletUI();
          updateStockUI();
          refreshAllButtons();
        } else {
          audio.playError();
          showToast(`⚠️ ${res.reason || 'Không đủ Xu Vàng!'}`, true);
        }
      });

      btnPack.on('pointerover', () => {
        if (save.getCoins() >= cfg.pricePack) {
          bpBg.clear();
          bpBg.fillStyle(0x9d4edd, 1);
          bpBg.fillRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
          bpBg.lineStyle(1.8, 0x00f5d4, 1);
          bpBg.strokeRoundedRect(-btnPackW / 2, -btnPackH / 2, btnPackW, btnPackH, 9);
        }
      });
      btnPack.on('pointerout', () => {
        updateBtnPackState();
      });

      // Purchase Button C: Pack (x10) Full Width with -30% SUPER DISCOUNT
      const btnPack10W = cardW - 28;
      const btnPack10H = 40;
      const btnPack10X = 0;
      const btnPack10Y = -cardH / 2 + 246;

      const btnPack10 = scene.add.container(btnPack10X, btnPack10Y);
      const bp10Bg = scene.add.graphics();
      const bp10Txt = scene.add.text(0, 0, '', {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Super discount tag on top edge
      const tag10Bg = scene.add.graphics();
      tag10Bg.fillStyle(0xd90429, 1);
      tag10Bg.fillRoundedRect(btnPack10W / 2 - 86, -btnPack10H / 2 - 7, 86, 17, 5);
      tag10Bg.lineStyle(1, 0xffd700, 0.9);
      tag10Bg.strokeRoundedRect(btnPack10W / 2 - 86, -btnPack10H / 2 - 7, 86, 17, 5);

      const tag10Txt = scene.add.text(btnPack10W / 2 - 43, -btnPack10H / 2 + 1, '🔥 GIẢM -30%', {
        fontFamily: FONT_UI,
        fontSize: '10px',
        fontStyle: '900',
        color: '#ffd700'
      }).setOrigin(0.5);

      btnPack10.add([bp10Bg, bp10Txt, tag10Bg, tag10Txt]);
      btnPack10.setSize(btnPack10W, btnPack10H).setInteractive({ useHandCursor: true });

      const updateBtnPack10State = () => {
        const coins = save.getCoins();
        const canAfford = coins >= cfg.pricePack10;
        bp10Bg.clear();
        if (canAfford) {
          bp10Bg.fillStyle(0x560bad, 0.96);
          bp10Bg.fillRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
          bp10Bg.lineStyle(2, 0xffd700, 0.95);
          bp10Bg.strokeRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
          bp10Txt.setText(`⚡ MUA GÓI x10 • ${formatCurrency(cfg.pricePack10)} 💰`);
          bp10Txt.setColor('#ffd700');
        } else {
          bp10Bg.fillStyle(0x1e122b, 0.85);
          bp10Bg.fillRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
          bp10Bg.lineStyle(1.2, 0xef4444, 0.5);
          bp10Bg.strokeRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
          bp10Txt.setText(`Gói x10 • Thiếu ${formatCurrency(cfg.pricePack10 - coins)} 💰`);
          bp10Txt.setColor('#f87171');
        }
      };
      buttonUpdaters.push(updateBtnPack10State);

      btnPack10.on('pointerdown', () => {
        haptic.heavy();
        const coins = save.getCoins();
        if (coins < cfg.pricePack10) {
          audio.playError();
          scene.tweens.add({
            targets: btnPack10,
            x: btnPack10X + 6,
            duration: 50,
            yoyo: true,
            repeat: 3
          });
          showToast(`⚠️ Cần thêm ${formatCurrency(cfg.pricePack10 - coins)} Xu Vàng để mua Gói x10! (Bạn có ${formatCurrency(coins)} Xu)`, true);
          return;
        }

        const res = save.buyBoosterWithCoins(cfg.id, 10, cfg.pricePack10);
        if (res.success) {
          audio.playVictory();
          showToast(`🎉 MUA THÀNH CÔNG GÓI x10 ${cfg.title}! (-${formatCurrency(cfg.pricePack10)} Xu)`);
          updateWalletUI();
          updateStockUI();
          refreshAllButtons();
        } else {
          audio.playError();
          showToast(`⚠️ ${res.reason || 'Không đủ Xu Vàng!'}`, true);
        }
      });

      btnPack10.on('pointerover', () => {
        if (save.getCoins() >= cfg.pricePack10) {
          bp10Bg.clear();
          bp10Bg.fillStyle(0x7209b7, 1);
          bp10Bg.fillRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
          bp10Bg.lineStyle(2.2, 0xffe066, 1);
          bp10Bg.strokeRoundedRect(-btnPack10W / 2, -btnPack10H / 2, btnPack10W, btnPack10H, 11);
        }
      });
      btnPack10.on('pointerout', () => {
        updateBtnPack10State();
      });

      card.add([cardBg, itemHalo, itemObj, titleText, descText, stockBadge, btnSingle, btnPack, btnPack10]);
      container.add(card);
    });

    // ==========================================
    // BOTTOM ROW: GRAND BUNDLE CHEST CARD (ALL-IN-ONE)
    // ==========================================
    const bundleW = 872;
    const bundleH = 120;
    const bundleY = 175;

    const bundleCard = scene.add.container(0, bundleY);

    const bBg = scene.add.graphics();
    // Warm Imperial Gold & Dark Ruby background
    bBg.fillStyle(0x191428, 0.96);
    bBg.fillRoundedRect(-bundleW / 2, -bundleH / 2, bundleW, bundleH, 18);
    bBg.lineStyle(2.2, 0xffd700, 0.95);
    bBg.strokeRoundedRect(-bundleW / 2, -bundleH / 2, bundleW, bundleH, 18);

    // Inner subtle glow
    bBg.fillStyle(0xd90429, 0.12);
    bBg.fillRoundedRect(-bundleW / 2 + 3, -bundleH / 2 + 3, bundleW - 6, bundleH - 6, 16);

    // Left Chest Icon Halo
    const chestHalo = scene.add.graphics();
    chestHalo.fillStyle(0xffb703, 0.2);
    chestHalo.fillCircle(-bundleW / 2 + 56, 0, 40);
    chestHalo.lineStyle(2, 0xffd700, 0.9);
    chestHalo.strokeCircle(-bundleW / 2 + 56, 0, 40);

    const hasLuckyBag = scene.textures.exists('icon_lucky_bag');
    const chestIcon: Phaser.GameObjects.GameObject = hasLuckyBag
      ? scene.add.image(-bundleW / 2 + 56, 0, 'icon_lucky_bag').setDisplaySize(72, 72)
      : scene.add.text(-bundleW / 2 + 56, 0, '🎁', {
          fontSize: '44px'
        }).setOrigin(0.5);

    // Left Content Column
    const bTitle = scene.add.text(-bundleW / 2 + 116, -32, 'RƯƠNG QUÂN NHU TOÀN NĂNG', {
      fontFamily: FONT_UI,
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffd700'
    });

    const bDesc = scene.add.text(
      -bundleW / 2 + 116,
      -8,
      'Gói chuẩn bị sinh tử: 3 Bình Gợi Ý 💡 + 2 Quạt Đổi Bảng 🔀 + 1 Búa Sét Trảm Quái ⚡',
      {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    );

    const bBadge = scene.add.text(
      -bundleW / 2 + 116,
      18,
      '🔥 TIẾT KIỆM 700 XU VÀNG (-16% so với giá mua lẻ)',
      {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: '900',
        color: '#00f5d4'
      }
    );

    // Right Purchase Button
    const bBtnW = 200;
    const bBtnH = 50;
    const bBtnX = bundleW / 2 - 24 - bBtnW / 2;
    const bBtnY = 0;

    const bBtn = scene.add.container(bBtnX, bBtnY);
    const bbBg = scene.add.graphics();
    const bbTxt = scene.add.text(0, 0, '', {
      fontFamily: FONT_UI,
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    bBtn.add([bbBg, bbTxt]);
    bBtn.setSize(bBtnW, bBtnH).setInteractive({ useHandCursor: true });

    const updateBundleBtnState = () => {
      const coins = save.getCoins();
      const canAfford = coins >= 3600;
      bbBg.clear();
      if (canAfford) {
        bbBg.fillStyle(0xd90429, 1);
        bbBg.fillRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
        bbBg.lineStyle(2, 0xffbe0b, 0.95);
        bbBg.strokeRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
        bbTxt.setText('MUA RƯƠNG • 3.600 💰');
        bbTxt.setColor('#ffffff');
      } else {
        bbBg.fillStyle(0x24141d, 0.85);
        bbBg.fillRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
        bbBg.lineStyle(1.5, 0xef4444, 0.5);
        bbBg.strokeRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
        bbTxt.setText(`Thiếu ${formatCurrency(3600 - coins)} 💰`);
        bbTxt.setColor('#f87171');
      }
    };
    buttonUpdaters.push(updateBundleBtnState);

    bBtn.on('pointerdown', () => {
      haptic.medium();
      const coins = save.getCoins();
      if (coins < 3600) {
        audio.playError();
        scene.tweens.add({
          targets: bBtn,
          x: bBtnX + 6,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
        showToast(`⚠️ Cần thêm ${formatCurrency(3600 - coins)} Xu Vàng để mua Rương! (Bạn có ${formatCurrency(coins)} Xu)`, true);
        return;
      }

      const res = save.buyBundleWithCoins(3, 2, 1, 3600);
      if (res.success) {
        audio.playVictory();
        showToast('🎉 Mua thành công Rương Quân Nhu! (+3 Gợi Ý, +2 Đổi Bảng, +1 Búa Sét)');
        updateWalletUI();
        updateStockUI();
        refreshAllButtons();
      } else {
        audio.playError();
        showToast(`⚠️ ${res.reason || 'Không đủ Xu Vàng!'}`, true);
      }
    });

    bBtn.on('pointerover', () => {
      if (save.getCoins() >= 3600) {
        bbBg.clear();
        bbBg.fillStyle(0xff2a5f, 1);
        bbBg.fillRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
        bbBg.lineStyle(2, 0xffd700, 1);
        bbBg.strokeRoundedRect(-bBtnW / 2, -bBtnH / 2, bBtnW, bBtnH, 16);
      }
    });
    bBtn.on('pointerout', () => {
      updateBundleBtnState();
    });

    bundleCard.add([bBg, chestHalo, chestIcon, bTitle, bDesc, bBadge, bBtn]);
    container.add(bundleCard);

    // Initial sync
    updateWalletUI();
    updateStockUI();
    refreshAllButtons();

    // Opening animation (sleek spring entrance)
    container.setScale(0.92);
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    return container;
  }
}
