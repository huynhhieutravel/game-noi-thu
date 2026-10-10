import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { BoardMovement, GridPoint, LevelConfig, MatchPath, PortalConnection, TileState } from '../types';
import { BoardGenerator } from './BoardGenerator';
import { BoardModifiers } from './BoardModifiers';
import { BoardGrid, PathFinder } from './PathFinder';
import { TileView } from './Tile';
import { ObstacleInfoModal } from './ObstacleInfoModal';

export interface BoardEvents {
  onTileSelected?: (tile: TileState) => void;
  onTileDeselected?: () => void;
  onMatchSuccess?: (t1: TileState, t2: TileState, path: GridPoint[]) => void;
  onMatchFailed?: (t1: TileState, t2: TileState, reason: 'different_char' | 'blocked_path') => void;
  onBoardCleared?: () => void;
  onBoardReshuffled?: (isAuto: boolean) => void;
}

export class BoardManager {
  private scene: Phaser.Scene;
  private config: LevelConfig;
  private rows: number;
  private cols: number;
  private grid: TileState[][] = [];
  private tileViews: (TileView | null)[][] = [];

  private boardContainer: Phaser.GameObjects.Container;
  private lineGraphics: Phaser.GameObjects.Graphics;

  private selectedTile: TileState | null = null;
  private currentHint: { p1: GridPoint; p2: GridPoint } | null = null;
  private events: BoardEvents;

  private tileSize: number = 52;
  private boardOffsetX: number = 0;
  private boardOffsetY: number = 0;
  private isProcessingMatch: boolean = false;

  // ⛩️ Board Frame Container (Japanese Shrine Roof and Backing)
  private boardFrameContainer: Phaser.GameObjects.Container | null = null;

  // ⛩️ Torii Portals (Left & Right wormhole gates)
  private portalGridA: GridPoint = { r: 1, c: 0 };
  private portalGridB: GridPoint = { r: 1, c: 0 };
  private portalContainerA: Phaser.GameObjects.Container | null = null;
  private portalContainerB: Phaser.GameObjects.Container | null = null;

  // 🍃 Shapeshifter timer (Cặp Hồ Ly Biến Hình)
  private shapeshifterTimer: Phaser.Time.TimerEvent | null = null;
  private movesSinceMorph: number = 0;

  // 🌙 Piercing Laser (Giờ Bách Quỷ Dạ Hành - Xuyên thấu vật cản)
  private isPiercingLaserActive: boolean = false;

  constructor(scene: Phaser.Scene, config: LevelConfig, events: BoardEvents = {}) {
    this.scene = scene;
    this.config = config;
    this.rows = config.rows;
    this.cols = config.columns;
    this.events = events;

    this.boardContainer = scene.add.container(0, 0);
    this.lineGraphics = scene.add.graphics();
    this.lineGraphics.setDepth(100);

    this.initBoard();
  }

  public initBoard(): void {
    // Generate logical grid (survival mode vs classic board)
    if (this.config.id === 'survival_blizzard' || (this.config as any).isSurvival) {
      this.grid = BoardGenerator.generateSurvivalBoard({
        rows: this.rows,
        cols: this.cols,
        initialActiveRows: 4,
        characterPool: this.config.characterPool
      });
    } else {
      this.grid = BoardGenerator.generateBoard({
        rows: this.rows,
        cols: this.cols,
        characterPool: this.config.characterPool,
        iceCount: this.config.modifiers?.iceCount,
        stoneCount: this.config.modifiers?.stoneCount,
        lockCount: this.config.modifiers?.lockCount,
        fogCount: this.config.modifiers?.fogCount,
        thornCount: this.config.modifiers?.thornCount,
        webCount: this.config.modifiers?.webCount,
        barricadeCount: this.config.modifiers?.barricadeCount
      });
    }

    this.calculateLayout();
    this.renderTiles();

    // Start Shapeshifter timer (every 5s or after 2 moves, Tanuki morphs into a new form)
    this.resetShapeshifterTimer();
  }

  private resetShapeshifterTimer(): void {
    if (this.shapeshifterTimer) {
      this.shapeshifterTimer.destroy();
    }
    this.shapeshifterTimer = this.scene.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => this.morphShapeshifters()
    });
  }

  private calculateLayout(): void {
    const screenWidth = GAME_WIDTH;
    const screenHeight = GAME_HEIGHT;

    // Top reserved for Header HUD (Score, Timer, Lives) ~ 100px (or ~135px if Boss)
    // Bottom reserved for Boosters ~ 78px
    const isBoss = !!this.config.boss;
    const topReserved = isBoss ? 135 : 100;
    const bottomReserved = 78;

    const availableWidth = screenWidth - 64;
    const availableHeight = screenHeight - topReserved - bottomReserved;

    const maxTileW = Math.floor(availableWidth / this.cols);
    const maxTileH = Math.floor(availableHeight / this.rows);
    this.tileSize = Math.min(maxTileW, maxTileH, this.rows >= 6 ? 70 : 74);

    const boardWidth = this.cols * this.tileSize;
    const boardHeight = this.rows * this.tileSize;

    this.boardOffsetX = (screenWidth - boardWidth) / 2 + this.tileSize / 2;
    const calcGridTop = isBoss
      ? topReserved + 15
      : Math.min(160, topReserved + Math.max(16, (availableHeight - boardHeight) / 2));
    this.boardOffsetY = calcGridTop + this.tileSize / 2;

    // Torii Portals coordinates at midRow
    this.portalGridA = { r: Math.ceil(this.rows / 2), c: 0 };
    this.portalGridB = { r: Math.ceil(this.rows / 2), c: this.cols + 1 };
  }

  private renderTiles(): void {
    this.clearViews();

    if (this.boardFrameContainer) {
      this.boardFrameContainer.destroy();
      this.boardFrameContainer = null;
    }

    // 1. Render Torii Portals on Left and Right sides (depth 1, behind board frame)
    this.renderToriiPortals();

    // 2. Render Shrine Board Frame backing & Roof Header (depth 3)
    this.boardFrameContainer = this.renderBoardShrineFrame();
    this.boardContainer.add(this.boardFrameContainer);

    for (let r = 0; r <= this.rows + 1; r++) {
      this.tileViews[r] = [];
      for (let c = 0; c <= this.cols + 1; c++) {
        this.tileViews[r][c] = null;
      }
    }

    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const state = this.grid[r][c];
        if (state.modifier === 'stone' || (!state.isCleared && state.characterId)) {
          const worldPos = this.gridToWorld(r, c);
          const view = new TileView(this.scene, worldPos.x, worldPos.y, this.tileSize, state);
          view.setDepth(5);

          view.on('pointerdown', () => this.handleTileClick(r, c));
          this.tileViews[r][c] = view;
          this.boardContainer.add(view);
        }
      }
    }
  }

  private renderBoardShrineFrame(): Phaser.GameObjects.Container {
    const frameContainer = this.scene.add.container(0, 0).setDepth(3);

    const gridLeft = this.boardOffsetX - this.tileSize / 2;
    const gridTop = this.boardOffsetY - this.tileSize / 2;
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const pad = 12;

    // 1. Soft ambient outer shadow
    const shadowGfx = this.scene.add.graphics();
    shadowGfx.fillStyle(0x000000, 0.45);
    shadowGfx.fillRoundedRect(gridLeft - pad - 6, gridTop - pad - 4, gridW + (pad + 6) * 2, gridH + (pad + 6) * 2, 20);

    // 2. Japanese Dark Lacquer Board Panel
    const panelGfx = this.scene.add.graphics();
    panelGfx.fillStyle(0x0c0b17, 0.94);
    panelGfx.fillRoundedRect(gridLeft - pad, gridTop - pad, gridW + pad * 2, gridH + pad * 2, 16);

    // 3. Ornate Golden Border Rim
    panelGfx.lineStyle(2.5, 0xe09f3e, 0.95);
    panelGfx.strokeRoundedRect(gridLeft - pad, gridTop - pad, gridW + pad * 2, gridH + pad * 2, 16);

    // 4. Subtle inner golden hairline
    panelGfx.lineStyle(1, 0xffd166, 0.35);
    panelGfx.strokeRoundedRect(gridLeft - pad + 3, gridTop - pad + 3, gridW + pad * 2 - 6, gridH + pad * 2 - 6, 13);

    frameContainer.add([shadowGfx, panelGfx]);

    // 5. Traditional Japanese Shrine Temple Roof Header (🌸 golden crest & ropes)
    if (this.scene.textures.exists('shrine_roof') && !this.config.boss) {
      const roofTargetW = Math.round(gridW + pad * 2 + 16);
      const roofTargetH = Math.round(roofTargetW * (47 / 499));
      const roofCenterX = gridLeft + gridW / 2;
      const roofY = (gridTop - pad) - roofTargetH / 2 + 3;

      const roofImg = this.scene.add.image(roofCenterX, roofY, 'shrine_roof')
        .setDisplaySize(roofTargetW, roofTargetH)
        .setDepth(2);
      frameContainer.add(roofImg);
    }

    return frameContainer;
  }

  private renderToriiPortals(): void {
    if (this.portalContainerA) this.portalContainerA.destroy();
    if (this.portalContainerB) this.portalContainerB.destroy();

    const gridLeft = this.boardOffsetX - this.tileSize / 2;
    const gridTop = this.boardOffsetY - this.tileSize / 2;
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const pad = 12;

    // Gate height scaled to frame
    const frameH = gridH + pad * 2;
    const gateH = Math.min(Math.max(Math.round(frameH * 1.05), 235), 295);
    const gateW = Math.round(gateH * (495 / 600));

    // Vertically centered with board frame
    const portalY = (gridTop - pad) + frameH / 2;

    // Position flanking left & right, tucking 28px under the lacquer board frame
    const tuckOffset = 28;
    const portalAX = (gridLeft - pad) - gateW / 2 + tuckOffset;
    const portalBX = (gridLeft + gridW + pad) + gateW / 2 - tuckOffset;

    // Portal A (Left - Red Torii)
    this.portalContainerA = this.createPortalGate(portalAX, portalY, 'A', 0xe63946, gateW, gateH);
    // Portal B (Right - Blue Torii)
    this.portalContainerB = this.createPortalGate(portalBX, portalY, 'B', 0x3a86ff, gateW, gateH);

    this.boardContainer.add([this.portalContainerA, this.portalContainerB]);
  }

  private createPortalGate(x: number, y: number, label: string, color: number, gateW: number, gateH: number): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(x, y).setDepth(1);

    // 1. Soft pulsing outer ambient elemental aura
    const glow = this.scene.add.graphics();
    glow.fillStyle(color, 0.28);
    glow.fillCircle(0, 0, Math.round(gateW * 0.44));

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.35, to: 0.85 },
      scaleX: { from: 0.95, to: 1.08 },
      scaleY: { from: 0.95, to: 1.08 },
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 2. High-res Torii Gate image (portal_torii_a for A, portal_torii_b for B)
    const texKey = label === 'A' ? 'portal_torii_a' : 'portal_torii_b';
    let gateImg: Phaser.GameObjects.GameObject;
    if (this.scene.textures.exists(texKey)) {
      gateImg = this.scene.add.image(0, 0, texKey).setDisplaySize(gateW, gateH);
    } else if (this.scene.textures.exists('torii_gate')) {
      const fallbackImg = this.scene.add.image(0, 0, 'torii_gate').setDisplaySize(gateW * 0.9, gateH * 0.9);
      if (label === 'B') fallbackImg.setTint(0x70d6ff);
      gateImg = fallbackImg;
    } else {
      gateImg = this.scene.add.text(0, 0, '⛩️', { fontSize: `${Math.round(gateW * 0.5)}px` }).setOrigin(0.5);
    }

    cont.add([glow, gateImg]);

    // Make interactive with hover & click to open explanation
    cont.setSize(gateW, gateH);
    cont.setInteractive({ useHandCursor: true });

    cont.on('pointerover', () => {
      this.scene.tweens.add({
        targets: cont,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 160,
        ease: 'Back.easeOut'
      });
    });

    cont.on('pointerout', () => {
      this.scene.tweens.add({
        targets: cont,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 160,
        ease: 'Sine.easeOut'
      });
    });

    cont.on('pointerdown', () => {
      (this.scene as any).audio?.playPortalWarp?.();
      this.playWormholePulseDemo();
      this.showPortalExplanationModal(label);
    });

    // Gentle ambient levitation float
    this.scene.tweens.add({
      targets: cont,
      y: y - 5,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return cont;
  }

  /**
   * ⛩️ Draw temporary laser beam connecting Portal A and Portal B to demonstrate wormhole
   */
  private playWormholePulseDemo(): void {
    if (!this.portalContainerA || !this.portalContainerB) return;
    const ax = this.portalContainerA.x;
    const ay = this.portalContainerA.y;
    const bx = this.portalContainerB.x;
    const by = this.portalContainerB.y;

    const beam = this.scene.add.graphics().setDepth(150);
    beam.lineStyle(4, 0x00f5d4, 0.9);
    beam.lineBetween(ax, ay, bx, by);
    beam.lineStyle(10, 0x7209b7, 0.45);
    beam.lineBetween(ax, ay, bx, by);

    this.boardContainer.add(beam);

    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        beam.destroy();
      }
    });
  }

  /**
   * ⛩️ Modal explaining Torii Portals (A & B) with interactive visual diagram
   */
  public showPortalExplanationModal(gateLabel?: string): void {
    if ((this.scene as any).isModalOpen) return;
    (this.scene as any).isModalOpen = true;

    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    const modal = this.scene.add.container(width / 2, height / 2).setDepth(300);

    // Dark backdrop overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(-width / 2, -height / 2, width, height);
    modal.add(overlay);

    const closeModal = () => {
      (this.scene as any).audio?.playSelect?.();
      this.scene.tweens.add({
        targets: modal,
        scaleX: 0.9,
        scaleY: 0.9,
        alpha: 0,
        duration: 180,
        ease: 'Power2',
        onComplete: () => {
          modal.destroy();
          (this.scene as any).isModalOpen = false;
        }
      });
    };

    overlay.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.on('pointerdown', closeModal);

    // Card background
    const cardW = 500;
    const cardH = 430;
    const card = this.scene.add.graphics();
    card.fillStyle(0x151224, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.lineStyle(2.5, 0x7209b7, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    modal.add(card);

    // Header Title
    const title = this.scene.add.text(0, -180, '⛩️ CỔNG KHÔNG GIAN TORII (PORTAL A ⇄ B)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#ffd700'
    }).setOrigin(0.5);

    const subtitle = this.scene.add.text(0, -156, 'CƠ CHẾ ĐẶC BIỆT: NỐI XUYÊN KHÔNG GIAN (PAC-MAN STYLE)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '800',
      color: '#00f5d4'
    }).setOrigin(0.5);

    modal.add([title, subtitle]);

    // Visual Flow Diagram Box
    const diagW = 450;
    const diagH = 76;
    const diagY = -100;
    const diagBg = this.scene.add.graphics();
    diagBg.fillStyle(0x211a36, 0.95);
    diagBg.fillRoundedRect(-diagW / 2, diagY - diagH / 2, diagW, diagH, 12);
    diagBg.lineStyle(1.5, 0x4338ca, 0.8);
    diagBg.strokeRoundedRect(-diagW / 2, diagY - diagH / 2, diagW, diagH, 12);
    modal.add(diagBg);

    const leftTile = this.scene.add.text(-160, diagY, '🦊 Linh Thú\n(Cạnh Trái)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const arrow1 = this.scene.add.text(-96, diagY, '➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16px',
      fontStyle: '900',
      color: '#e63946'
    }).setOrigin(0.5);

    const portalAText = this.scene.add.text(-52, diagY, '⛩️ CỔNG A\n(Đỏ)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: '#ff758f',
      align: 'center'
    }).setOrigin(0.5);

    const wormholeText = this.scene.add.text(0, diagY, '🌀\nXUYÊN KHÔNG', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '9px',
      fontStyle: '900',
      color: '#00f5d4',
      align: 'center'
    }).setOrigin(0.5);

    const portalBText = this.scene.add.text(52, diagY, '⛩️ CỔNG B\n(Xanh)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: '#48cae4',
      align: 'center'
    }).setOrigin(0.5);

    const arrow2 = this.scene.add.text(96, diagY, '➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16px',
      fontStyle: '900',
      color: '#3a86ff'
    }).setOrigin(0.5);

    const rightTile = this.scene.add.text(160, diagY, '🦊 Linh Thú\n(Cạnh Phải)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    modal.add([leftTile, arrow1, portalAText, wormholeText, portalBText, arrow2, rightTile]);

    // Explanation Points (3 clean structured points)
    const bulletX = -215;
    const descWidth = 430;

    const b1Title = this.scene.add.text(bulletX, -45, '🌀 1. Xuyên thấu mép bàn cờ (Wormhole Portal):', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffd700'
    });
    const b1Desc = this.scene.add.text(bulletX + 12, -26, 'Đường laser chui vào Cổng A sẽ tự động bay xuyên không gian phóng ra từ Cổng B (như Pac-Man đi xuyên từ cạnh trái sang cạnh phải).', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#e0e1dd',
      wordWrap: { width: descWidth - 12 }
    });

    const b2Title = this.scene.add.text(bulletX, 15, '⚡ 2. Cứu nguy khi giữa bàn cờ bị bít kín 100%:', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#00f5d4'
    });
    const b2Desc = this.scene.add.text(bulletX + 12, 34, 'Giúp bạn nối được 2 con thú giống nhau ở 2 góc xa bàn cờ dù toàn bộ khu vực trung tâm đang bị chặn đặc không lối thoát!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#e0e1dd',
      wordWrap: { width: descWidth - 12 }
    });

    const b3Title = this.scene.add.text(bulletX, 75, '📐 3. Quy tắc đường đi tối đa 1 khúc gấp:', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#c77dff'
    });
    const b3Desc = this.scene.add.text(bulletX + 12, 94, 'Chỉ cần ô bên trái đi tối đa 1 khúc cua tới Cổng A, và ô bên phải đi tối đa 1 khúc cua tới Cổng B là đường nối hợp lệ!', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      color: '#e0e1dd',
      wordWrap: { width: descWidth - 12 }
    });

    modal.add([b1Title, b1Desc, b2Title, b2Desc, b3Title, b3Desc]);

    // Action Close Button
    const closeBtn = this.scene.add.container(0, 165);
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xe63946, 1);
    btnBg.fillRoundedRect(-120, -19, 240, 38, 12);
    btnBg.lineStyle(1.5, 0xff758f, 0.9);
    btnBg.strokeRoundedRect(-120, -19, 240, 38, 12);

    const btnTxt = this.scene.add.text(0, 0, 'ĐÃ HIỂU, TIẾP TỤC CHƠI! ➔', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '12px',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);

    closeBtn.add([btnBg, btnTxt]);
    closeBtn.setSize(240, 38);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', closeModal);

    modal.add(closeBtn);

    // Entrance pop animation
    modal.setScale(0.85);
    modal.setAlpha(0);
    this.scene.tweens.add({
      targets: modal,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
  }

  private clearViews(): void {
    for (let r = 0; r < this.tileViews.length; r++) {
      for (let c = 0; c < (this.tileViews[r]?.length || 0); c++) {
        const view = this.tileViews[r][c];
        if (view) view.destroy();
      }
    }
    this.tileViews = [];
  }

  public handleTileClick(r: number, c: number): void {
    if (this.isProcessingMatch) return;

    const tile = this.grid[r][c];
    if (tile.modifier === 'stone') {
      const lvl = tile.modifierLevel || 3;
      this.tileViews[r][c]?.playObstacleFeedback(`🪨 CẤP ${lvl}`);
      const audio = (this.scene as any).audio;
      audio?.playError();
      const haptic = (this.scene as any).haptic;
      haptic?.medium();
      ObstacleInfoModal.open(this.scene, tile);
      return;
    }

    if (tile.modifier === 'barricade') {
      const lvl = tile.modifierLevel || 3;
      this.tileViews[r][c]?.playObstacleFeedback(`🛡️ CẤP ${lvl}`);
      const audio = (this.scene as any).audio;
      audio?.playError();
      const haptic = (this.scene as any).haptic;
      haptic?.medium();
      ObstacleInfoModal.open(this.scene, tile);
      return;
    }

    if (tile.modifier === 'thorn') {
      const lvl = tile.modifierLevel || 3;
      this.tileViews[r][c]?.playObstacleFeedback(`🌿 CẤP ${lvl}`);
      const audio = (this.scene as any).audio;
      audio?.playError();
      const haptic = (this.scene as any).haptic;
      haptic?.medium();
      ObstacleInfoModal.open(this.scene, tile);
      return;
    }

    if (tile.isCleared || !tile.characterId || tile.isLocked) {
      if (tile.isLocked) {
        ObstacleInfoModal.open(this.scene, tile);
        const audio = (this.scene as any).audio;
        audio?.playError();
      }
      return;
    }

    this.clearHint();

    // First tile clicked
    if (!this.selectedTile) {
      this.selectedTile = tile;
      this.tileViews[r][c]?.setSelected(true);
      this.events.onTileSelected?.(tile);
      return;
    }

    // Clicked the exact same tile again -> deselect
    if (this.selectedTile.r === r && this.selectedTile.c === c) {
      this.tileViews[r][c]?.setSelected(false);
      this.selectedTile = null;
      this.events.onTileDeselected?.();
      return;
    }

    // Second tile clicked -> attempt match
    const firstTile = this.selectedTile;
    const secondTile = tile;

    // Must be identical character
    if (firstTile.characterId !== secondTile.characterId) {
      this.tileViews[firstTile.r][firstTile.c]?.setSelected(false);
      this.tileViews[secondTile.r][secondTile.c]?.playShake();
      this.selectedTile = null;
      this.events.onMatchFailed?.(firstTile, secondTile, 'different_char');
      return;
    }

    // Path verification
    const boardGridAdapter: BoardGrid = {
      rows: this.rows,
      cols: this.cols,
      isEmpty: (row, col) => {
        if (row < 0 || row > this.rows + 1 || col < 0 || col > this.cols + 1) return true;
        const cell = this.grid[row][col];
        return cell.isCleared && cell.modifier !== 'stone';
      }
    };

    let matchPath = PathFinder.findPath(
      boardGridAdapter,
      { r: firstTile.r, c: firstTile.c },
      { r: secondTile.r, c: secondTile.c },
      { portalA: this.portalGridA, portalB: this.portalGridB }
    );

    // 🌙 Giờ Bách Quỷ Dạ Hành: Laser xuyên thấu vật cản!
    if (!matchPath && this.isPiercingLaserActive) {
      matchPath = {
        points: [
          { r: firstTile.r, c: firstTile.c },
          { r: secondTile.r, c: secondTile.c }
        ],
        turns: 0
      };
    }

    if (!matchPath) {
      // Path blocked -> shake both
      this.tileViews[firstTile.r][firstTile.c]?.setSelected(false);
      this.tileViews[firstTile.r][firstTile.c]?.playShake();
      this.tileViews[secondTile.r][secondTile.c]?.playShake();
      this.selectedTile = null;
      this.events.onMatchFailed?.(firstTile, secondTile, 'blocked_path');
      return;
    }

    // Successful Match!
    this.isProcessingMatch = true;
    this.selectedTile = null;
    this.tileViews[firstTile.r][firstTile.c]?.setSelected(false);

    // Draw connecting laser path
    this.drawMatchPath(matchPath, () => {
      this.processClearedTiles(firstTile, secondTile, matchPath.points);
    });
  }

  private drawMatchPath(matchPathOrPoints: MatchPath | GridPoint[], onFinished: () => void): void {
    const isMatchPathObj = !Array.isArray(matchPathOrPoints);
    const matchPath = isMatchPathObj ? (matchPathOrPoints as MatchPath) : null;
    const portalConn = matchPath?.portalConnection;

    this.lineGraphics.clear();

    const drawBeam = (pts: GridPoint[]) => {
      const worldCoords = pts.map(p => this.gridToWorld(p.r, p.c));
      if (worldCoords.length < 2) return;

      // 1. Electric Lightning Aura (Violet in Piercing mode / Cyan in normal)
      const auraColor = this.isPiercingLaserActive ? 0x9d4edd : 0x00f5d4;
      const beamColor = this.isPiercingLaserActive ? 0xc77dff : 0xffd166;
      const coreColor = 0xffffff;

      this.lineGraphics.lineStyle(this.isPiercingLaserActive ? 14 : 10, auraColor, 0.55);
      this.lineGraphics.beginPath();
      this.lineGraphics.moveTo(worldCoords[0].x, worldCoords[0].y);
      for (let i = 1; i < worldCoords.length; i++) {
        this.lineGraphics.lineTo(worldCoords[i].x, worldCoords[i].y);
      }
      this.lineGraphics.strokePath();

      // 2. Mid Lightning Beam
      this.lineGraphics.lineStyle(this.isPiercingLaserActive ? 7 : 5, beamColor, 0.95);
      this.lineGraphics.beginPath();
      this.lineGraphics.moveTo(worldCoords[0].x, worldCoords[0].y);
      for (let i = 1; i < worldCoords.length; i++) {
        this.lineGraphics.lineTo(worldCoords[i].x, worldCoords[i].y);
      }
      this.lineGraphics.strokePath();

      // 3. Core Electric Arc (Pure White)
      this.lineGraphics.lineStyle(this.isPiercingLaserActive ? 3.5 : 2.5, coreColor, 1.0);
      this.lineGraphics.beginPath();
      this.lineGraphics.moveTo(worldCoords[0].x, worldCoords[0].y);
      for (let i = 1; i < worldCoords.length; i++) {
        this.lineGraphics.lineTo(worldCoords[i].x, worldCoords[i].y);
      }
      this.lineGraphics.strokePath();

      // 4. Waypoint flash spark circles at corners & endpoints
      for (const pt of worldCoords) {
        this.lineGraphics.fillStyle(beamColor, 0.9);
        this.lineGraphics.fillCircle(pt.x, pt.y, this.isPiercingLaserActive ? 11 : 8);
        this.lineGraphics.fillStyle(0xffffff, 1.0);
        this.lineGraphics.fillCircle(pt.x, pt.y, this.isPiercingLaserActive ? 6 : 4);
      }
    };

    if (portalConn) {
      drawBeam(portalConn.pathA);
      drawBeam(portalConn.pathB);

      // Play mystical portal warp audio cue
      (this.scene as any).audio?.playPortalWarp?.();

      // Pulse Torii Portals with flash animation
      if (this.portalContainerA && this.portalContainerB) {
        this.scene.tweens.add({
          targets: [this.portalContainerA, this.portalContainerB],
          scaleX: 1.35,
          scaleY: 1.35,
          duration: 160,
          yoyo: true
        });
      }
    } else {
      const points = Array.isArray(matchPathOrPoints) ? matchPathOrPoints : matchPathOrPoints.points;
      drawBeam(points);
    }

    // Hold path visible for 150ms for that nostalgic Pikachu laser sensation
    this.scene.time.delayedCall(150, () => {
      this.scene.tweens.add({
        targets: this.lineGraphics,
        alpha: 0,
        duration: 90,
        onComplete: () => {
          this.lineGraphics.clear();
          this.lineGraphics.setAlpha(1);
          onFinished();
        }
      });
    });
  }

  private processClearedTiles(t1: TileState, t2: TileState, path: GridPoint[]): void {
    const v1 = this.tileViews[t1.r][t1.c];
    const v2 = this.tileViews[t2.r][t2.c];

    // Handle Ice modifier
    let t1Cleared = true;
    let t2Cleared = true;

    if (t1.modifier === 'ice' && t1.iceLayers > 1) {
      t1.iceLayers--;
      t1Cleared = false;
      v1?.updateState(t1, this.tileSize);
    } else {
      t1.isCleared = true;
      t1.characterId = null;
      v1?.playPopAndClear();
    }

    if (t2.modifier === 'ice' && t2.iceLayers > 1) {
      t2.iceLayers--;
      t2Cleared = false;
      v2?.updateState(t2, this.tileSize);
    } else {
      t2.isCleared = true;
      t2.characterId = null;
      v2?.playPopAndClear();
    }

    // Handle Web modifier directly on matched tiles
    if (t1.modifier === 'web') {
      this.spawnObstacleDebris(v1?.x || 0, v1?.y || 0, 'web_debris', 8);
      t1.modifier = 'none';
      t1.modifierLevel = 0;
      (this.scene as any).showNotice?.('🕸️ GIẬT ĐỨT MẠNG NHỆN! +100 PTS', 0x00f5d4);
      (this.scene as any).addScore?.(100);
    }
    if (t2.modifier === 'web') {
      this.spawnObstacleDebris(v2?.x || 0, v2?.y || 0, 'web_debris', 8);
      t2.modifier = 'none';
      t2.modifierLevel = 0;
      (this.scene as any).showNotice?.('🕸️ GIẬT ĐỨT MẠNG NHỆN! +100 PTS', 0x00f5d4);
      (this.scene as any).addScore?.(100);
    }

    // 💥 Shockwave damage to adjacent obstacles (Stone, Thorn, Web, Barricade)
    this.damageAdjacentObstacles(t1, t2);

    this.events.onMatchSuccess?.(t1, t2, path);

    // 🍃 Morph trigger: morphs every 5s OR after every 2 successful moves!
    this.movesSinceMorph++;
    if (this.movesSinceMorph >= 2) {
      this.movesSinceMorph = 0;
      this.resetShapeshifterTimer();
      this.morphShapeshifters();
    }

    // If a shapeshifter was cleared and only 1 remains, revert it to normal so it doesn't break parity
    if (t1.isShapeshifter || t2.isShapeshifter || t1.modifier === 'shapeshifter' || t2.modifier === 'shapeshifter') {
      const remainingShifters: TileState[] = [];
      for (let r = 1; r <= this.rows; r++) {
        for (let c = 1; c <= this.cols; c++) {
          const s = this.grid[r][c];
          if (s && !s.isCleared && (s.isShapeshifter || s.modifier === 'shapeshifter')) {
            remainingShifters.push(s);
          }
        }
      }
      if (remainingShifters.length === 1) {
        const solitary = remainingShifters[0];
        solitary.isShapeshifter = false;
        solitary.modifier = 'none';
        this.tileViews[solitary.r]?.[solitary.c]?.updateState(solitary, this.tileSize);
      }
    }

    // Check Board Movement (gravity) if applicable
    if (this.config.movement && this.config.movement !== 'none') {
      this.scene.time.delayedCall(220, () => {
        BoardModifiers.applyMovement(this.grid, this.rows, this.cols, this.config.movement);
        this.syncViewsAfterMovement();
        this.checkBoardStatus();
      });
    } else {
      this.scene.time.delayedCall(200, () => {
        this.checkBoardStatus();
      });
    }
  }

  /**
   * 💥 Gây damage lên các ô vật cản xung quanh cặp ô vừa nối (Stone, Thorn, Web, Barricade)
   */
  private damageAdjacentObstacles(t1: TileState, t2: TileState): void {
    const coordsToCheck: GridPoint[] = [];
    const dirs = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];

    for (const d of dirs) {
      coordsToCheck.push({ r: t1.r + d.r, c: t1.c + d.c });
      coordsToCheck.push({ r: t2.r + d.r, c: t2.c + d.c });
    }

    const seen = new Set<string>();
    const uniqueTargets: GridPoint[] = [];
    for (const p of coordsToCheck) {
      if (p.r >= 1 && p.r <= this.rows && p.c >= 1 && p.c <= this.cols) {
        const key = `${p.r},${p.c}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueTargets.push(p);
        }
      }
    }

    for (const p of uniqueTargets) {
      const tile = this.grid[p.r][p.c];
      if (!tile || tile.isCleared) continue;

      const mod = tile.modifier;
      if (mod === 'stone' || mod === 'thorn' || mod === 'web' || mod === 'barricade') {
        this.hitObstacle(p.r, p.c);
      }
    }
  }

  /**
   * 💥 Tác động 1 hit lên vật cản tại ô (r, c)
   */
  public hitObstacle(r: number, c: number): void {
    const tile = this.grid[r][c];
    const view = this.tileViews[r]?.[c];
    if (!tile || !view || tile.isCleared) return;

    const mod = tile.modifier;
    if (mod !== 'stone' && mod !== 'thorn' && mod !== 'web' && mod !== 'barricade') return;

    if (!tile.modifierLevel || tile.modifierLevel <= 0) {
      tile.modifierLevel = mod === 'web' ? 2 : 3;
    }

    tile.modifierLevel--;
    const newLvl = tile.modifierLevel;
    const posX = view.x;
    const posY = view.y;

    if (mod === 'stone') {
      if (newLvl > 0) {
        view.updateState(tile, this.tileSize);
        view.playObstacleFeedback(`🪨 ĐÁ CÒN ${newLvl} HIT`);
        this.spawnObstacleDebris(posX, posY, 'stone_debris', 4);
        (this.scene as any).audio?.playWoodHit?.();
      } else {
        tile.modifier = 'none';
        tile.isCleared = true;
        tile.characterId = null;
        view.playPopAndClear();
        this.spawnObstacleDebris(posX, posY, 'stone_debris', 10);
        (this.scene as any).audio?.playMatchSuccess?.();
        (this.scene as any).showNotice?.('💥 ĐẬP VỠ ĐÁ! +100 PTS', 0xffd166);
        (this.scene as any).addScore?.(100);
      }
    } else if (mod === 'thorn') {
      if (newLvl > 0) {
        view.updateState(tile, this.tileSize);
        view.playObstacleFeedback(`🌿 GAI CÒN ${newLvl} HIT`);
        this.spawnObstacleDebris(posX, posY, 'thorn_debris', 4);
        (this.scene as any).audio?.playWoodHit?.();
      } else {
        tile.modifier = 'none';
        tile.modifierLevel = 0;
        view.updateState(tile, this.tileSize);
        view.playBounceIn();
        this.spawnObstacleDebris(posX, posY, 'thorn_debris', 10);
        (this.scene as any).audio?.playMatchSuccess?.();
        (this.scene as any).showNotice?.('🌿 GIẢI CỨU LINH THÚ! +150 PTS', 0x2ec4b6);
        (this.scene as any).addScore?.(150);
      }
    } else if (mod === 'web') {
      if (newLvl > 0) {
        view.updateState(tile, this.tileSize);
        view.playObstacleFeedback(`🕸️ MẠNG CÒN ${newLvl} HIT`);
        this.spawnObstacleDebris(posX, posY, 'web_debris', 3);
      } else {
        tile.modifier = 'none';
        tile.modifierLevel = 0;
        view.updateState(tile, this.tileSize);
        view.playBounceIn();
        this.spawnObstacleDebris(posX, posY, 'web_debris', 8);
        (this.scene as any).audio?.playMatchSuccess?.();
        (this.scene as any).showNotice?.('🕸️ ĐỨT MẠNG NHỆN! +100 PTS', 0x00f5d4);
        (this.scene as any).addScore?.(100);
      }
    } else if (mod === 'barricade') {
      if (newLvl > 0) {
        view.updateState(tile, this.tileSize);
        view.playObstacleFeedback(`🛡️ SẮT CÒN ${newLvl} HIT`);
        this.spawnObstacleDebris(posX, posY, 'barricade_debris', 4);
        (this.scene as any).audio?.playWoodHit?.();
      } else {
        tile.modifier = 'none';
        tile.modifierLevel = 0;
        view.updateState(tile, this.tileSize);
        view.playBounceIn();
        this.spawnObstacleDebris(posX, posY, 'barricade_debris', 12);
        (this.scene as any).audio?.playMatchSuccess?.();
        (this.scene as any).showNotice?.('🛡️ PHÁ LỒNG SẮT! +200 PTS', 0xffbe0b);
        (this.scene as any).addScore?.(200);
      }
    }
  }

  /**
   * 🌟 Bắn tung tóe các mảnh vụn vật cản khi bị trúng đòn hoặc phá hủy
   */
  private spawnObstacleDebris(x: number, y: number, textureKey: string, count: number): void {
    if (!this.scene.textures.exists(textureKey)) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(25, 60);
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist + Phaser.Math.Between(10, 25);

      const shard = this.scene.add.image(x, y, textureKey);
      const scale = Phaser.Math.FloatBetween(0.3, 0.6);
      shard.setScale(scale);
      shard.setAlpha(1);
      shard.setDepth(250);
      this.boardContainer.add(shard);

      this.scene.tweens.add({
        targets: shard,
        x: targetX,
        y: targetY,
        angle: Phaser.Math.Between(-180, 180),
        scale: scale * 0.4,
        alpha: 0,
        duration: Phaser.Math.Between(450, 650),
        ease: 'Cubic.easeOut',
        onComplete: () => {
          shard.destroy();
        }
      });
    }
  }

  public syncViewsAfterMovement(): void {
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const state = this.grid[r][c];
        let view = this.tileViews[r]?.[c];
        if (!view && !state.isCleared && state.characterId) {
          const worldPos = this.gridToWorld(r, c);
          view = new TileView(this.scene, worldPos.x, worldPos.y, this.tileSize, state);
          view.on('pointerdown', () => this.handleTileClick(r, c));
          if (!this.tileViews[r]) this.tileViews[r] = [];
          this.tileViews[r][c] = view;
          this.boardContainer.add(view);
        } else if (view) {
          view.updateState(state, this.tileSize);
        }
      }
    }
  }

  public checkBoardStatus(): void {
    this.isProcessingMatch = false;

    // Check if all playable tiles cleared
    let remainingPlayable = 0;
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isCleared && cell.characterId && cell.modifier !== 'stone') {
          remainingPlayable++;
        }
      }
    }

    if (remainingPlayable === 0) {
      this.events.onBoardCleared?.();
      return;
    }

    // Check for available matches (accounting for Torii Portals)
    const available = BoardGenerator.findFirstAvailableMatch(this.grid, this.rows, this.cols, {
      portalA: this.portalGridA,
      portalB: this.portalGridB
    });

    // CRITICAL: Do NOT auto-shuffle deadlock if Piercing Laser is active!
    // Player can pierce through obstacles to connect any matching pair!
    if (!available && !this.isPiercingLaserActive) {
      // Deadlock detected -> slight pause for player to comprehend before smooth auto-shuffle
      this.scene.time.delayedCall(350, () => {
        this.performShuffle(true);
      });
    }
  }

  public performShuffle(isAuto: boolean = false): void {
    BoardGenerator.reshuffleBoard(this.grid, this.rows, this.cols, {
      portalA: this.portalGridA,
      portalB: this.portalGridB
    });
    this.syncViewsAfterMovement();
    this.events.onBoardReshuffled?.(isAuto);
  }

  public showHint(): boolean {
    let match = BoardGenerator.findFirstAvailableMatch(this.grid, this.rows, this.cols, {
      portalA: this.portalGridA,
      portalB: this.portalGridB
    });

    if (!match && this.isPiercingLaserActive) {
      // Find ANY pair of identical active characters on the board!
      const activeTiles: TileState[] = [];
      for (let r = 1; r <= this.rows; r++) {
        for (let c = 1; c <= this.cols; c++) {
          const t = this.grid[r][c];
          if (!t.isCleared && t.characterId && !t.isLocked && t.modifier !== 'thorn' && t.modifier !== 'barricade' && t.modifier !== 'stone') {
            activeTiles.push(t);
          }
        }
      }
      for (let i = 0; i < activeTiles.length; i++) {
        for (let j = i + 1; j < activeTiles.length; j++) {
          if (activeTiles[i].characterId === activeTiles[j].characterId) {
            match = {
              p1: { r: activeTiles[i].r, c: activeTiles[i].c },
              p2: { r: activeTiles[j].r, c: activeTiles[j].c },
              path: []
            };
            break;
          }
        }
        if (match) break;
      }
    }

    if (!match) return false;

    this.clearHint();
    this.currentHint = { p1: match.p1, p2: match.p2 };

    this.tileViews[match.p1.r]?.[match.p1.c]?.setHinted(true);
    this.tileViews[match.p2.r]?.[match.p2.c]?.setHinted(true);

    return true;
  }

  public clearHint(): void {
    if (this.currentHint) {
      this.tileViews[this.currentHint.p1.r]?.[this.currentHint.p1.c]?.setHinted(false);
      this.tileViews[this.currentHint.p2.r]?.[this.currentHint.p2.c]?.setHinted(false);
      this.currentHint = null;
    }
  }

  public clearSelection(): void {
    if (this.selectedTile) {
      this.tileViews[this.selectedTile.r]?.[this.selectedTile.c]?.setSelected(false);
      this.selectedTile = null;
      this.events.onTileDeselected?.();
    }
  }

  public triggerBomb(): boolean {
    let match = BoardGenerator.findFirstAvailableMatch(this.grid, this.rows, this.cols, {
      portalA: this.portalGridA,
      portalB: this.portalGridB
    });

    if (!match && this.isPiercingLaserActive) {
      // Find ANY pair of identical active characters on the board
      const activeTiles: TileState[] = [];
      for (let r = 1; r <= this.rows; r++) {
        for (let c = 1; c <= this.cols; c++) {
          const t = this.grid[r][c];
          if (!t.isCleared && t.characterId && !t.isLocked && t.modifier !== 'thorn' && t.modifier !== 'barricade' && t.modifier !== 'stone') {
            activeTiles.push(t);
          }
        }
      }
      for (let i = 0; i < activeTiles.length; i++) {
        for (let j = i + 1; j < activeTiles.length; j++) {
          if (activeTiles[i].characterId === activeTiles[j].characterId) {
            match = {
              p1: { r: activeTiles[i].r, c: activeTiles[i].c },
              p2: { r: activeTiles[j].r, c: activeTiles[j].c },
              path: [
                { r: activeTiles[i].r, c: activeTiles[i].c },
                { r: activeTiles[j].r, c: activeTiles[j].c }
              ]
            };
            break;
          }
        }
        if (match) break;
      }
    }

    if (!match) return false;

    this.clearHint();
    const t1 = this.grid[match.p1.r][match.p1.c];
    const t2 = this.grid[match.p2.r][match.p2.c];

    this.isProcessingMatch = true;
    this.drawMatchPath(match.path, () => {
      this.processClearedTiles(t1, t2, match.path);
    });

    return true;
  }

  /**
   * ⚡ Trigger secondary pair clear (used by Lightning Duo chain arc)
   */
  public triggerPairClear(p1: GridPoint, p2: GridPoint): void {
    const t1 = this.grid[p1.r]?.[p1.c];
    const t2 = this.grid[p2.r]?.[p2.c];
    if (!t1 || !t2 || t1.isCleared || t2.isCleared) return;

    const boardGridAdapter: BoardGrid = {
      rows: this.rows,
      cols: this.cols,
      isEmpty: (row, col) => {
        if (row < 0 || row > this.rows + 1 || col < 0 || col > this.cols + 1) return true;
        const cell = this.grid[row][col];
        return cell.isCleared && cell.modifier !== 'stone';
      }
    };

    const matchPath = PathFinder.findPath(
      boardGridAdapter,
      p1,
      p2,
      { portalA: this.portalGridA, portalB: this.portalGridB }
    );

    const pathOrPoints = matchPath || [p1, p2];
    this.drawMatchPath(pathOrPoints, () => {
      const points = Array.isArray(pathOrPoints) ? pathOrPoints : pathOrPoints.points;
      this.processClearedTiles(t1, t2, points);
    });
  }

  /**
   * 🍃 Morph all active Shapeshifter (Tanuki) tiles simultaneously
   */
  private morphShapeshifters(): void {
    if (this.isProcessingMatch) return;

    const shifters: { state: TileState; view: TileView }[] = [];
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const state = this.grid[r][c];
        const view = this.tileViews[r]?.[c];
        if (state && view && !state.isCleared && (state.isShapeshifter || state.modifier === 'shapeshifter')) {
          shifters.push({ state, view });
        }
      }
    }

    if (shifters.length === 0) return;

    // CRITICAL: If only 1 shapeshifter remains, its twin was cleared!
    // It MUST NOT morph alone because that breaks the parity of the board!
    // Instead, revert it to a normal tile so it stays matched with its existing partner.
    if (shifters.length === 1) {
      const solitary = shifters[0];
      solitary.state.isShapeshifter = false;
      solitary.state.modifier = 'none';
      solitary.view.updateState(solitary.state, this.tileSize);
      return;
    }

    const currentPool = this.config.characterPool;
    const currentId = shifters[0].state.characterId;
    const candidates = currentPool.filter(id => id !== currentId);
    if (candidates.length === 0) return;
    const newCharId = candidates[Math.floor(Math.random() * candidates.length)];

    this.movesSinceMorph = 0;

    for (const item of shifters) {
      item.state.characterId = newCharId;
      item.view.playMorph(newCharId, this.tileSize);
    }
  }

  /**
   * 🏺 Update Lucky Pot 10s countdown timers
   */
  public updateLuckyPots(deltaSec: number): void {
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const state = this.grid[r][c];
        if (state && !state.isCleared && (state.isLuckyPot || state.modifier === 'lucky_pot')) {
          if (state.luckyPotTimeLeft !== undefined && state.luckyPotTimeLeft > 0) {
            state.luckyPotTimeLeft -= deltaSec;
            const view = this.tileViews[r]?.[c];
            if (view) {
              view.updateLuckyCountdown(state.luckyPotTimeLeft);
            }
            if (state.luckyPotTimeLeft <= 0) {
              state.isLuckyPot = false;
              state.modifier = 'none';
              state.luckyPotTimeLeft = undefined;
              if (view) {
                const wasSelected = (this.selectedTile === state);
                view.updateState(state, this.tileSize);
                if (wasSelected) {
                  view.setSelected(true);
                }
              }
            }
          }
        }
      }
    }
  }

  public getPortals(): { portalA: GridPoint; portalB: GridPoint } {
    return {
      portalA: this.portalGridA,
      portalB: this.portalGridB
    };
  }

  /**
   * 🔥 Hi-no-tori Ultimate: Melts all Ice, breaks Locks, clears Stone blockers, disperses Fog
   */
  public clearAllObstacles(): number {
    let clearedCount = 0;
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const state = this.grid[r][c];
        const view = this.tileViews[r]?.[c];
        if (!state || state.isCleared) continue;

        let modified = false;
        if (state.modifier === 'ice' || state.iceLayers > 0) {
          state.modifier = 'none';
          state.iceLayers = 0;
          modified = true;
          clearedCount++;
        }
        if (state.modifier === 'lock' || state.isLocked) {
          state.modifier = 'none';
          state.isLocked = false;
          modified = true;
          clearedCount++;
        }
        if (state.modifier === 'fog' || state.isFogged) {
          state.modifier = 'none';
          state.isFogged = false;
          modified = true;
          clearedCount++;
        }
        if (state.modifier === 'stone') {
          state.modifier = 'none';
          state.modifierLevel = 0;
          state.isCleared = true;
          state.characterId = null;
          if (view) {
            view.playPopAndClear();
          }
          clearedCount++;
        }
        if (state.modifier === 'thorn') {
          state.modifier = 'none';
          state.modifierLevel = 0;
          modified = true;
          clearedCount++;
        }
        if (state.modifier === 'web') {
          state.modifier = 'none';
          state.modifierLevel = 0;
          modified = true;
          clearedCount++;
        }
        if (state.modifier === 'barricade') {
          state.modifier = 'none';
          state.modifierLevel = 0;
          modified = true;
          clearedCount++;
        }
        
        if (modified && view) {
          view.updateState(state, this.tileSize);
          view.playBounceIn();
        }
      }
    }

    if (clearedCount > 0 && this.config.movement && this.config.movement !== 'none') {
      this.scene.time.delayedCall(120, () => {
        BoardModifiers.applyMovement(this.grid, this.rows, this.cols, this.config.movement);
        this.syncViewsAfterMovement();
        this.checkBoardStatus();
      });
    }

    return clearedCount;
  }

  public setPiercingLaser(active: boolean): void {
    this.isPiercingLaserActive = active;
    if (!active) {
      this.checkBoardStatus();
    }
  }

  public getPiercingLaser(): boolean {
    return this.isPiercingLaserActive;
  }

  public gridToWorld(r: number, c: number): { x: number; y: number } {
    return {
      x: this.boardOffsetX + (c - 1) * this.tileSize,
      y: this.boardOffsetY + (r - 1) * this.tileSize
    };
  }

  public getGrid(): TileState[][] {
    return this.grid;
  }

  public getRows(): number {
    return this.rows;
  }

  public getCols(): number {
    return this.cols;
  }

  /**
   * Check if any tile is in the danger zone (row 1 or row 2)
   */
  public checkCeilingDanger(): { isDanger: boolean; isOverflow: boolean } {
    let isOverflow = false;
    let isDanger = false;
    for (let c = 1; c <= this.cols; c++) {
      const topTile = this.grid[1]?.[c];
      if (topTile && !topTile.isCleared && topTile.characterId) {
        isOverflow = true;
      }
      const warnTile = this.grid[2]?.[c];
      if (warnTile && !warnTile.isCleared && warnTile.characterId) {
        isDanger = true;
      }
    }
    return { isDanger, isOverflow };
  }

  /**
   * Push all rows UP by 1 cell, and spawn a new row of paired characters at the bottom.
   * Returns false if overflow (game over).
   */
  public pushBlizzardRow(newRowChars: string[], onComplete?: () => void): boolean {
    // 1. Check if row 1 has any active tile -> OVERFLOW / GAME OVER
    for (let c = 1; c <= this.cols; c++) {
      const topTile = this.grid[1]?.[c];
      if (topTile && !topTile.isCleared && topTile.characterId) {
        return false;
      }
    }

    this.clearSelection();
    this.isProcessingMatch = true;

    // 2. Animate all active existing TileViews sliding UP by tileSize
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const view = this.tileViews[r]?.[c];
        if (view) {
          this.scene.tweens.add({
            targets: view,
            y: view.y - this.tileSize,
            duration: 240,
            ease: 'Quad.easeOut'
          });
        }
      }
    }

    // 3. Shift logical grid up by 1 row
    for (let r = 1; r < this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        this.grid[r][c] = {
          ...this.grid[r + 1][c],
          r: r,
          c: c
        };
      }
    }

    // 4. Fill bottom row with new paired tiles
    for (let c = 1; c <= this.cols; c++) {
      const charId = newRowChars[c - 1] || this.config.characterPool[0];
      this.grid[this.rows][c] = {
        r: this.rows,
        c: c,
        characterId: charId,
        modifier: 'none',
        iceLayers: 0,
        isLocked: false,
        isKey: false,
        isFogged: false,
        isBossSymbol: false,
        isCleared: false
      };
    }

    // 5. After the slide tween finishes (260ms), rebuild views and spawn bottom row
    this.scene.time.delayedCall(260, () => {
      this.clearViews();

      for (let r = 0; r <= this.rows + 1; r++) {
        this.tileViews[r] = [];
        for (let c = 0; c <= this.cols + 1; c++) {
          this.tileViews[r][c] = null;
        }
      }

      for (let r = 1; r <= this.rows; r++) {
        for (let c = 1; c <= this.cols; c++) {
          const state = this.grid[r][c];
          if (!state.isCleared && state.characterId) {
            const worldPos = this.gridToWorld(r, c);
            const view = new TileView(this.scene, worldPos.x, worldPos.y, this.tileSize, state);
            view.on('pointerdown', () => this.handleTileClick(r, c));
            this.tileViews[r][c] = view;
            this.boardContainer.add(view);

            // Pop-in animation for bottom row
            if (r === this.rows) {
              view.setScale(0.3);
              view.setAlpha(0.2);
              this.scene.tweens.add({
                targets: view,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 200,
                ease: 'Back.easeOut'
              });
            }
          }
        }
      }

      this.isProcessingMatch = false;

      // Ensure solvable matches exist on board
      const hasMatch = !!BoardGenerator.findFirstAvailableMatch(this.grid, this.rows, this.cols, this.getPortals());
      if (!hasMatch) {
        this.performShuffle();
      }

      onComplete?.();
    });

    return true;
  }

  public destroy(): void {
    if (this.shapeshifterTimer) {
      this.shapeshifterTimer.destroy();
      this.shapeshifterTimer = null;
    }
    if (this.portalContainerA) this.portalContainerA.destroy();
    if (this.portalContainerB) this.portalContainerB.destroy();
    this.clearViews();
    this.lineGraphics.destroy();
    this.boardContainer.destroy();
  }
}
