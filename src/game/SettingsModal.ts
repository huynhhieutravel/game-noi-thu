import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, getScreenDimensions } from '../constants';
import { AudioSystem } from '../systems/AudioSystem';
import { HapticSystem } from '../systems/HapticSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { FONT_UI } from '../styles/typography';

export class SettingsModal {
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

    const container = scene.add.container(width / 2, height / 2).setDepth(400);

    // 1. Dark Glass Backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-screenW / 2, -height / 2, screenW, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(-screenW / 2, -height / 2, screenW, height),
      Phaser.Geom.Rectangle.Contains
    );
    backdrop.on('pointerdown', () => {
      container.destroy();
      onClose?.();
    });
    container.add(backdrop);

    // 2. Main Dialog Frame (Lacquer Wood & Gold Inlay)
    const frameW = 820;
    const frameH = 500;
    const frame = scene.add.graphics();
    frame.fillStyle(0x131424, 0.98);
    frame.fillRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);
    frame.lineStyle(2, 0xffd700, 0.85);
    frame.strokeRoundedRect(-frameW / 2, -frameH / 2, frameW, frameH, 20);

    // Inner subtle glow
    frame.lineStyle(1, 0x485175, 0.6);
    frame.strokeRoundedRect(-frameW / 2 + 6, -frameH / 2 + 6, frameW - 12, frameH - 12, 16);
    container.add(frame);

    // 3. Header
    const title = scene.add.text(0, -frameH / 2 + 36, '⚙️ CÀI ĐẶT & SAO LƯU TIẾN TRÌNH', {
      fontFamily: FONT_UI,
      fontSize: '23px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);
    container.add(title);

    const subTitle = scene.add.text(
      0,
      -frameH / 2 + 66,
      'Quản lý âm thanh, xúc giác và sao lưu dữ liệu 100% Offline (Không phụ thuộc máy chủ)',
      {
        fontFamily: FONT_UI,
        fontSize: '13.5px',
        color: '#ced4da'
      }
    ).setOrigin(0.5);
    container.add(subTitle);

    // Notification toast text inside modal
    const toastText = scene.add.text(0, -frameH / 2 + 96, '', {
      fontFamily: FONT_UI,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#51cf66'
    }).setOrigin(0.5);
    container.add(toastText);

    const showToast = (msg: string, isError: boolean = false) => {
      toastText.setText(msg);
      toastText.setColor(isError ? '#ff6b6b' : '#51cf66');
      scene.tweens.add({
        targets: toastText,
        alpha: { from: 1, to: 0.8 },
        duration: 300,
        yoyo: true,
        repeat: 1
      });
    };

    // ==========================================
    // SECTION 1: ÂM THANH & XÚC GIÁC (Left Box)
    // ==========================================
    const colW = 360;
    const colH = 265;
    const colLeftX = -frameW / 2 + 35;
    const colY = -frameH / 2 + 115;

    const leftBox = scene.add.graphics();
    leftBox.fillStyle(0x1a1d30, 0.9);
    leftBox.fillRoundedRect(colLeftX, colY, colW, colH, 14);
    leftBox.lineStyle(1, 0x3d4368, 0.8);
    leftBox.strokeRoundedRect(colLeftX, colY, colW, colH, 14);
    container.add(leftBox);

    const leftHeading = scene.add.text(colLeftX + colW / 2, colY + 22, '🎵 ÂM THANH & RUNG', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '800',
      color: '#ffd700'
    }).setOrigin(0.5);
    container.add(leftHeading);

    // Helper to create switch row
    const createToggleRow = (
      icon: string,
      label: string,
      initialVal: boolean,
      yPos: number,
      onToggle: (newVal: boolean) => void
    ) => {
      let currentVal = initialVal;

      const rowLabel = scene.add.text(colLeftX + 20, yPos, `${icon} ${label}`, {
        fontFamily: FONT_UI,
        fontSize: '14.5px',
        color: '#f8f9fa'
      }).setOrigin(0, 0.5);
      container.add(rowLabel);

      const btnW = 92;
      const btnH = 34;
      const btnX = colLeftX + colW - 20 - btnW;
      const btnY = yPos - btnH / 2;

      const btnBg = scene.add.graphics();
      const btnText = scene.add.text(btnX + btnW / 2, yPos, '', {
        fontFamily: FONT_UI,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);

      const renderBtn = () => {
        btnBg.clear();
        if (currentVal) {
          btnBg.fillStyle(0x2f9e44, 1);
          btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
          btnText.setText('ĐANG BẬT');
        } else {
          btnBg.fillStyle(0x495057, 1);
          btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 8);
          btnText.setText('ĐÃ TẮT');
        }
      };
      renderBtn();

      const hitZone = scene.add.zone(btnX + btnW / 2, yPos, btnW, btnH)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => {
        currentVal = !currentVal;
        renderBtn();
        onToggle(currentVal);
        audio.playSelect();
        haptic.light();
      });

      container.add(btnBg);
      container.add(btnText);
      container.add(hitZone);
    };

    createToggleRow('🏮', 'Nhạc nền (BGM)', audio.getBGMEnabled(), colY + 70, (val) => {
      audio.setBGMEnabled(val);
    });

    createToggleRow('🔔', 'Hiệu ứng (SFX)', audio.getSFXEnabled(), colY + 135, (val) => {
      audio.setSFXEnabled(val);
    });

    createToggleRow('📳', 'Rung lực (Haptics)', haptic.getEnabled(), colY + 200, (val) => {
      haptic.setEnabled(val);
    });

    // ==========================================
    // SECTION 2: QUẢN LÝ TIẾN TRÌNH (Right Box)
    // ==========================================
    const colRightX = 25;
    const rightBox = scene.add.graphics();
    rightBox.fillStyle(0x1a1d30, 0.9);
    rightBox.fillRoundedRect(colRightX, colY, colW, colH, 14);
    rightBox.lineStyle(1, 0x3d4368, 0.8);
    rightBox.strokeRoundedRect(colRightX, colY, colW, colH, 14);
    container.add(rightBox);

    const rightHeading = scene.add.text(colRightX + colW / 2, colY + 22, '📦 SAO LƯU TIẾN TRÌNH', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '800',
      color: '#ffd700'
    }).setOrigin(0.5);
    container.add(rightHeading);

    // Action Button 1: Xuất mã sao lưu
    const createActionButton = (
      btnLabel: string,
      desc: string,
      yPos: number,
      colorHex: number,
      onClick: () => void
    ) => {
      const bW = colW - 36;
      const bH = 50;
      const bX = colRightX + 18;
      const bY = yPos;

      const bg = scene.add.graphics();
      bg.fillStyle(colorHex, 0.88);
      bg.fillRoundedRect(bX, bY, bW, bH, 10);
      bg.lineStyle(1, 0xffd700, 0.4);
      bg.strokeRoundedRect(bX, bY, bW, bH, 10);

      const text = scene.add.text(bX + bW / 2, bY + 18, btnLabel, {
        fontFamily: FONT_UI,
        fontSize: '14.5px',
        fontStyle: '900',
        color: '#ffffff'
      }).setOrigin(0.5);

      const sub = scene.add.text(bX + bW / 2, bY + 36, desc, {
        fontFamily: FONT_UI,
        fontSize: '11px',
        color: '#ced4da'
      }).setOrigin(0.5);

      const zone = scene.add.zone(bX + bW / 2, bY + bH / 2, bW, bH)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        audio.playSelect();
        haptic.medium();
        onClick();
      });

      container.add(bg);
      container.add(text);
      container.add(sub);
      container.add(zone);
    };

    // 1. Export Button
    createActionButton(
      '📤 Xuất Mã Sao Lưu (Copy)',
      'Tạo mã Base64 lưu vào Clipboard để chuyển máy',
      colY + 52,
      0x1f4068,
      () => {
        const code = save.exportSaveCode();
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(code).then(() => {
            showToast('✅ Đã sao chép mã sao lưu vào Clipboard!');
          }).catch(() => {
            // Fallback for non-secure contexts
            prompt('Sao chép mã sao lưu bên dưới để lưu trữ:', code);
            showToast('✅ Đã xuất mã sao lưu!');
          });
        } else {
          prompt('Sao chép mã sao lưu bên dưới để lưu trữ:', code);
          showToast('✅ Đã xuất mã sao lưu!');
        }
      }
    );

    // 2. Import Button
    createActionButton(
      '📥 Nhập Mã Khôi Phục',
      'Dán mã sao lưu để lấy lại 100 màn & linh thú',
      colY + 115,
      0x1b5e20,
      () => {
        const inputCode = prompt('Dán chuỗi mã sao lưu (bắt đầu bằng YOKAI-v1-):');
        if (inputCode) {
          const result = save.importSaveCode(inputCode);
          if (result.success) {
            audio.playVictory();
            showToast('🎉 Khôi phục tiến trình thành công!');
            scene.time.delayedCall(1200, () => {
              container.destroy();
              scene.scene.restart();
            });
          } else {
            audio.playError();
            showToast(`❌ ${result.message}`, true);
          }
        }
      }
    );

    // 3. Reset Button (Reliable without browser popup)
    let isResetArmed = false;
    createActionButton(
      '🔄 Đặt Lại Dữ Liệu (Reset)',
      'Xóa sạch tiến trình, bắt đầu lại từ màn 1',
      colY + 178,
      0x7f1d1d,
      () => {
        if (!isResetArmed) {
          isResetArmed = true;
          showToast('⚠️ Nhấn LẦN NỮA để xác nhận xóa toàn bộ tiến trình!', true);
          return;
        }
        save.resetToDefault();
        audio.playError();
        showToast('🔄 Đã xóa sạch dữ liệu! Bắt đầu lại từ Màn 1...');
        scene.time.delayedCall(800, () => {
          container.destroy();
          scene.scene.restart();
        });
      }
    );

    // 4. Footer info
    const footer = scene.add.text(
      0,
      frameH / 2 - 28,
      '🟢 Trạng Thái: 100% Offline Ready • Foxy Pair v1.0.0 • Zero-Cloud Architecture',
      {
        fontFamily: FONT_UI,
        fontSize: '12.5px',
        color: '#adb5bd'
      }
    ).setOrigin(0.5);
    container.add(footer);

    // 5. Close Button (✕)
    const closeBtn = scene.add.text(frameW / 2 - 26, -frameH / 2 + 24, '✕', {
      fontFamily: FONT_UI,
      fontSize: '26px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      audio.playSelect();
      container.destroy();
      onClose?.();
    });
    container.add(closeBtn);

    return container;
  }
}
