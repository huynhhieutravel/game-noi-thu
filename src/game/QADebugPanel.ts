import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { SaveSystem } from '../systems/SaveSystem';
import { LevelManager } from './LevelManager';
import { formatCurrency } from '../styles/typography';

export class QADebugPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private isVisible: boolean = false;
  private toggleBtn: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Visible QA button removed per user request. Keyboard shortcuts ('D' or '~') remain active.
    this.setupKeyboardShortcuts();
  }

  private createToggleButton(): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const btnContainer = this.scene.add.container(width - 45, height - 24);
    btnContainer.setDepth(9999);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.lineStyle(1.5, 0x00f0ff, 0.9);
    bg.fillRoundedRect(-32, -14, 64, 28, 6);
    bg.strokeRoundedRect(-32, -14, 64, 28, 6);

    const text = this.scene.add.text(0, 0, '🐞 QA', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#00f0ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btnContainer.add([bg, text]);
    btnContainer.setSize(64, 28);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerdown', () => {
      this.toggleModal();
    });

    this.toggleBtn = btnContainer;
  }

  private setupKeyboardShortcuts(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      // Toggle Debug Panel
      if (key === 'D' || event.key === '`' || event.key === '~') {
        this.toggleModal();
        return;
      }

      // Context-specific cheats when in GameScene
      const anyScene = this.scene as any;
      if (this.scene.scene.key === 'GameScene') {
        if (key === 'W') {
          // Instant Win
          if (typeof anyScene.triggerInstantWin === 'function') {
            anyScene.triggerInstantWin();
          }
        } else if (key === 'L') {
          // Instant Lose
          if (typeof anyScene.triggerInstantLose === 'function') {
            anyScene.triggerInstantLose();
          }
        } else if (key === 'T') {
          // Add 60s
          if (typeof anyScene.addTimeCheat === 'function') {
            anyScene.addTimeCheat(60);
          }
        } else if (key === 'F') {
          // Trigger Fever
          if (typeof anyScene.triggerFeverCheat === 'function') {
            anyScene.triggerFeverCheat();
          }
        } else if (key === 'B') {
          // Damage Boss
          if (typeof anyScene.damageBossCheat === 'function') {
            anyScene.damageBossCheat(250);
          }
        } else if (key === 'S') {
          // Shuffle
          if (typeof anyScene.triggerShuffleCheat === 'function') {
            anyScene.triggerShuffleCheat();
          }
        } else if (key === 'R') {
          // Max Rage Cheat (Companion + Relic)
          if (typeof anyScene.maxRageCheat === 'function') {
            anyScene.maxRageCheat();
          }
        }
      }
    });
  }

  public toggleModal(): void {
    if (this.isVisible) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  public openModal(): void {
    if (this.container) {
      this.container.destroy();
    }

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;
    const save = SaveSystem.getInstance();
    const anyScene = this.scene as any;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(10000);

    // Dim background
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Modal Card
    const modalW = width - 40;
    const modalH = height - 120;
    const modalX = 20;
    const modalY = 60;

    const card = this.scene.add.graphics();
    card.fillStyle(0x111625, 0.98);
    card.lineStyle(2, 0x00f0ff, 1);
    card.fillRoundedRect(modalX, modalY, modalW, modalH, 16);
    card.strokeRoundedRect(modalX, modalY, modalW, modalH, 16);

    const title = this.scene.add.text(width / 2, modalY + 30, '🛠️ YOKAI ONET QA CHEATS PANEL', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#00f0ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const currentLvl = (anyScene.levelConfig?.levelNumber) || save.getHighestLevel();
    const subTitle = this.scene.add.text(width / 2, modalY + 60, `Current Level: ${currentLvl}/100 | Coins: ${formatCurrency(save.getCoins())} | Stars: ${save.getStars()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#94a3b8'
    }).setOrigin(0.5);

    this.container.add([overlay, card, title, subTitle]);

    let startY = modalY + 95;
    const btnW = modalW - 40;
    const btnH = 38;
    const btnX = modalX + 20;

    const createCheatButton = (label: string, color: number, onClick: () => void) => {
      const bGfx = this.scene.add.graphics();
      bGfx.fillStyle(color, 0.25);
      bGfx.lineStyle(1.5, color, 0.9);
      bGfx.fillRoundedRect(btnX, startY, btnW, btnH, 8);
      bGfx.strokeRoundedRect(btnX, startY, btnW, btnH, 8);

      const bText = this.scene.add.text(width / 2, startY + btnH / 2, label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const hitZone = this.scene.add.zone(btnX + btnW / 2, startY + btnH / 2, btnW, btnH);
      hitZone.setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        onClick();
        this.closeModal();
      });

      this.container?.add([bGfx, bText, hitZone]);
      startY += btnH + 12;
    };

    // 1. In Game Controls (if in GameScene)
    if (this.scene.scene.key === 'GameScene') {
      createCheatButton('🏆 Thắng Ải Tức Thì [Phím W]', 0x2ec4b6, () => {
        if (typeof anyScene.triggerInstantWin === 'function') anyScene.triggerInstantWin();
      });

      createCheatButton('⏳ Cộng +60 Giây [Phím T]', 0x3a86ff, () => {
        if (typeof anyScene.addTimeCheat === 'function') anyScene.addTimeCheat(60);
      });

      createCheatButton('⚡ Bật Sốt Fever Combo 5x [Phím F]', 0xffb703, () => {
        if (typeof anyScene.triggerFeverCheat === 'function') anyScene.triggerFeverCheat();
      });

      createCheatButton('💥 Chém Boss -250 HP [Phím B]', 0xe63946, () => {
        if (typeof anyScene.damageBossCheat === 'function') anyScene.damageBossCheat(250);
      });

      createCheatButton('🔄 Đảo Bàn Reshuffle [Phím S]', 0x9d4edd, () => {
        if (typeof anyScene.triggerShuffleCheat === 'function') anyScene.triggerShuffleCheat();
      });

      createCheatButton('⚡ Tối Đa Nộ Linh Thú & Thần Khí [Phím R]', 0xffd700, () => {
        if (typeof anyScene.maxRageCheat === 'function') anyScene.maxRageCheat();
      });

      createCheatButton('💀 Thua Màn Tức Thì [Phím L]', 0xd90429, () => {
        if (typeof anyScene.triggerInstantLose === 'function') anyScene.triggerInstantLose();
      });
    }

    // 2. Global Level & Economy Jump
    createCheatButton('⏭️ Nhảy Tới Màn Tiếp Theo', 0x06d6a0, () => {
      const next = Math.min(100, currentLvl + 1);
      this.jumpToLevel(next);
    });

    createCheatButton('⏮️ Quay Lại Màn Trước Đó', 0x118ab2, () => {
      const prev = Math.max(1, currentLvl - 1);
      this.jumpToLevel(prev);
    });

    createCheatButton('👑 Đấu Boss Orochi (Màn 10)', 0xd90429, () => {
      this.jumpToLevel(10);
    });

    createCheatButton('👑 Đấu Boss Kraken (Màn 80)', 0x118ab2, () => {
      this.jumpToLevel(80);
    });

    createCheatButton('👑 Đấu Đại Boss Singularity (Màn 100)', 0x7209b7, () => {
      this.jumpToLevel(100);
    });

    createCheatButton('💰 +50.000 Xu & +300 Sao', 0xffb703, () => {
      save.addCoins(50000);
      for (let i = 1; i <= 50; i++) {
        save.recordLevelCompleted(`level_${String(i).padStart(2, '0')}`, i, 3);
      }
      this.scene.scene.restart();
    });

    createCheatButton('🗝️ Mở Khóa Tất Cả 100 Màn & 10 Chapters', 0x3a86ff, () => {
      for (let i = 1; i <= 100; i++) {
        save.recordLevelCompleted(`level_${String(i).padStart(2, '0')}`, i, 3);
      }
      this.scene.scene.restart();
    });

    createCheatButton('⚠️ XÓA SAVE / RESET VỀ BAN ĐẦU', 0x6c757d, () => {
      save.resetSave();
      this.scene.scene.start('MainMenuScene');
    });

    // Close Button
    const closeBtn = this.scene.add.text(width / 2, modalY + modalH - 25, '✖ ĐÓNG BẢNG DEBUG (Hoặc bấm Phím D)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());
    this.container.add(closeBtn);

    this.isVisible = true;
  }

  private jumpToLevel(lvl: number): void {
    const config = LevelManager.getLevelConfig(lvl);
    this.scene.scene.start('GameScene', {
      levelConfig: config,
      difficulty: 'medium'
    });
  }

  public closeModal(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
  }

  public destroy(): void {
    this.closeModal();
    if (this.toggleBtn) {
      this.toggleBtn.destroy();
      this.toggleBtn = null;
    }
  }
}
