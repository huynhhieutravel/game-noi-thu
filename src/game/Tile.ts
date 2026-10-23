import Phaser from 'phaser';
import { TileState } from '../types';
import { ObstacleInfoModal } from './ObstacleInfoModal';
import { TextureGenerator } from './TextureGenerator';
import { FONT_UI } from '../styles/typography';

export class TileView extends Phaser.GameObjects.Container {
  public static readonly BASE_DEPTH: number = 5;
  public static readonly SELECTED_DEPTH: number = 10;

  public gridR: number;
  public gridC: number;
  public tileState: TileState;

  private bgSprite: Phaser.GameObjects.Image;
  private charSprite: Phaser.GameObjects.Image;
  private modSprite: Phaser.GameObjects.Image | null = null;
  private specialBadge: Phaser.GameObjects.Text | null = null;
  private specialBorder: Phaser.GameObjects.Graphics | null = null;
  private luckyTimerText: Phaser.GameObjects.Text | null = null;
  private obstacleBadgeContainer: Phaser.GameObjects.Container | null = null;
  private selectionGlow: Phaser.GameObjects.Image;
  private isTileSelected: boolean = false;
  private hintTween: Phaser.Tweens.Tween | null = null;
  private hintScaleTween: Phaser.Tweens.Tween | null = null;
  private selectionTween: Phaser.Tweens.Tween | null = null;
  private tileSize: number;

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, state: TileState) {
    super(scene, x, y);

    this.gridR = state.r;
    this.gridC = state.c;
    this.tileState = state;
    this.tileSize = tileSize;

    this.setSize(tileSize, tileSize);
    this.setDepth(TileView.BASE_DEPTH);

    // 1. Base Background
    const isObstacle = state.modifier === 'stone' || state.modifier === 'thorn' || state.modifier === 'barricade';
    const isStone = state.modifier === 'stone';
    this.bgSprite = scene.add.image(0, 0, 'tile_base').setDisplaySize(tileSize, tileSize);
    this.bgSprite.setVisible(true);
    this.add(this.bgSprite);

    // 2. Selection Glow
    this.selectionGlow = scene.add.image(0, 0, 'tile_selected')
      .setDisplaySize(tileSize, tileSize)
      .setVisible(false);
    this.add(this.selectionGlow);

    // 3. Character Avatar
    let charKey = 'tile_base';
    if (state.characterId) {
      charKey = `char_${state.characterId}`;
      if (!scene.textures.exists(charKey)) {
        TextureGenerator.ensureCharacterTexture(scene, state.characterId);
      }
      if (!scene.textures.exists(charKey)) {
        charKey = 'tile_base';
      }
    }
    this.charSprite = scene.add.image(0, 0, charKey)
      .setDisplaySize(tileSize * 0.94, tileSize * 0.94)
      .setVisible(!isStone && !!state.characterId);
    this.add(this.charSprite);

    // 4. Modifier Overlays
    this.updateModifierVisual(tileSize);

    // Enable interactive input with correctly centered bounds covering all quadrants
    this.setupInteractiveHitArea(isObstacle);

    scene.add.existing(this);
  }

  private setupInteractiveHitArea(isObstacle: boolean): void {
    // In Phaser 3, Container displayOrigin is (width/2, height/2).
    // pointWithinHitArea adds displayOrigin, transforming [-w/2, w/2] into [0, w].
    // Therefore hitArea MUST be [0, 0, width, height] for exact 100% tile coverage without overlap.
    const hitRect = new Phaser.Geom.Rectangle(
      0,
      0,
      this.tileSize,
      this.tileSize
    );

    if (this.input) {
      this.input.hitArea = hitRect;
      this.input.hitAreaCallback = Phaser.Geom.Rectangle.Contains;
      this.input.cursor = isObstacle ? 'not-allowed' : 'pointer';
      this.input.enabled = true;
    } else {
      this.setInteractive(hitRect, Phaser.Geom.Rectangle.Contains);
      const io = this.input as any;
      if (io) {
        io.cursor = isObstacle ? 'not-allowed' : 'pointer';
      }
    }
  }

  public updateState(state: TileState, tileSize: number): void {
    this.tileState = state;
    this.tileSize = tileSize;
    this.gridR = state.r;
    this.gridC = state.c;
    this.setSize(tileSize, tileSize);
    this.bgSprite.setDisplaySize(tileSize, tileSize);
    this.selectionGlow.setDisplaySize(tileSize, tileSize);
    const isObstacle = state.modifier === 'stone' || state.modifier === 'thorn' || state.modifier === 'barricade';

    if (state.isCleared || (!state.characterId && !isObstacle)) {
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.killTweensOf(this.charSprite);
      this.setVisible(false);
      this.disableInteractive();
      return;
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.charSprite);
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);
    this.isTileSelected = false;
    this.selectionGlow.setVisible(false);

    // Ensure interactive hit area is perfectly centered and enabled
    this.setupInteractiveHitArea(isObstacle);

    const isStone = state.modifier === 'stone';
    this.bgSprite.setVisible(true);

    if (isStone || !state.characterId) {
      this.charSprite.setVisible(false);
    } else {
      let charKey = `char_${state.characterId}`;
      if (!this.scene.textures.exists(charKey)) {
        TextureGenerator.ensureCharacterTexture(this.scene, state.characterId);
      }
      if (!this.scene.textures.exists(charKey)) {
        charKey = 'tile_base';
      }
      this.charSprite.setTexture(charKey)
        .setDisplaySize(tileSize * 0.94, tileSize * 0.94)
        .setVisible(true);
    }

    this.updateModifierVisual(tileSize);
  }

  private updateModifierVisual(tileSize: number): void {
    if (this.modSprite) {
      this.modSprite.destroy();
      this.modSprite = null;
    }
    if (this.specialBadge) {
      this.specialBadge.destroy();
      this.specialBadge = null;
    }
    if (this.specialBorder) {
      this.specialBorder.destroy();
      this.specialBorder = null;
    }
    if (this.luckyTimerText) {
      this.luckyTimerText.destroy();
      this.luckyTimerText = null;
    }
    if (this.obstacleBadgeContainer) {
      this.obstacleBadgeContainer.destroy();
      this.obstacleBadgeContainer = null;
    }

    const isStone = this.tileState.modifier === 'stone';
    const isFogged = this.tileState.isFogged || this.tileState.modifier === 'fog';
    const isObstacle = isStone || this.tileState.modifier === 'thorn' || this.tileState.modifier === 'barricade';
    this.bgSprite.setVisible(true);
    this.charSprite.setVisible(!isStone && !isFogged && !!this.tileState.characterId);

    if (isFogged) {
      const fogGraphic = this.scene.add.graphics();
      fogGraphic.fillStyle(0x0e091b, 0.94);
      fogGraphic.fillRoundedRect(-tileSize / 2 + 3, -tileSize / 2 + 3, tileSize - 6, tileSize - 6, 8);
      fogGraphic.lineStyle(1.5, 0x7b2cbf, 0.85);
      fogGraphic.strokeRoundedRect(-tileSize / 2 + 3, -tileSize / 2 + 3, tileSize - 6, tileSize - 6, 8);

      const fogTxt = this.scene.add.text(0, 0, '🌫️', {
        fontSize: `${Math.round(tileSize * 0.42)}px`
      }).setOrigin(0.5);

      const fogContainer = this.scene.add.container(0, 0, [fogGraphic, fogTxt]);
      this.modSprite = fogContainer as any;
      if (this.modSprite) {
        this.add(this.modSprite);
      }
    } else if (this.tileState.modifier === 'ice') {
      this.modSprite = this.scene.add.image(0, 0, 'mod_ice').setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'stone') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'stone_lv1' : lvl === 2 ? 'stone_lv2' : 'stone_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_stone';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'thorn') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'thorn_lv1' : lvl === 2 ? 'thorn_lv2' : 'thorn_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_thorn';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'web') {
      const lvl = this.tileState.modifierLevel || 2;
      const key = lvl === 1 ? 'web_lv1' : 'web_lv2';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_web';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'barricade') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'barricade_lv1' : lvl === 2 ? 'barricade_lv2' : 'barricade_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_barricade';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'lock') {
      this.modSprite = this.scene.add.image(0, 0, 'mod_lock').setDisplaySize(tileSize * 0.94, tileSize * 0.94);
      this.add(this.modSprite);
    }

    // 5. 🏷️ Obstacle Level & Description Badge Pill (Top-Right)
    const mod = this.tileState.modifier;
    if (mod === 'stone' || mod === 'thorn' || mod === 'barricade' || mod === 'web' || mod === 'ice' || mod === 'lock') {
      let icon = '❓';
      let lvlStr = '';
      let themeColor = 0xffd166;
      let themeHex = '#ffd166';

      if (mod === 'stone') {
        const lvl = this.tileState.modifierLevel || 3;
        icon = '🪨';
        lvlStr = `Lv.${lvl}`;
        themeColor = 0xf4a261;
        themeHex = '#f4a261';
      } else if (mod === 'thorn') {
        const lvl = this.tileState.modifierLevel || 3;
        icon = '🌿';
        lvlStr = `Lv.${lvl}`;
        themeColor = 0x2ec4b6;
        themeHex = '#2ec4b6';
      } else if (mod === 'barricade') {
        const lvl = this.tileState.modifierLevel || 3;
        icon = '🛡️';
        lvlStr = `Lv.${lvl}`;
        themeColor = 0xffd166;
        themeHex = '#ffd166';
      } else if (mod === 'web') {
        const lvl = this.tileState.modifierLevel || 2;
        icon = '🕸️';
        lvlStr = `Lv.${lvl}`;
        themeColor = 0x00f5d4;
        themeHex = '#00f5d4';
      } else if (mod === 'ice') {
        icon = '❄️';
        lvlStr = `x${this.tileState.iceLayers || 2}`;
        themeColor = 0x90e0ef;
        themeHex = '#90e0ef';
      } else if (mod === 'lock') {
        icon = '🔒';
        lvlStr = 'Khóa';
        themeColor = 0xff595e;
        themeHex = '#ff595e';
      }

      const badgeW = 48;
      const badgeH = 22;
      const badgeX = tileSize / 2 - badgeW / 2 - 2;
      const badgeY = -tileSize / 2 + badgeH / 2 + 3;

      this.obstacleBadgeContainer = this.scene.add.container(badgeX, badgeY);

      const pillBg = this.scene.add.graphics();
      pillBg.fillStyle(0x0a0d18, 0.94);
      pillBg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 7);
      pillBg.lineStyle(1.5, themeColor, 0.95);
      pillBg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 7);

      const pillText = this.scene.add.text(0, 0, `${icon}${lvlStr}`, {
        fontFamily: FONT_UI,
        fontSize: '12px',
        fontStyle: '900',
        color: themeHex,
        stroke: '#000000',
        strokeThickness: 2.2
      }).setOrigin(0.5);

      this.obstacleBadgeContainer.add([pillBg, pillText]);
      this.obstacleBadgeContainer.setSize(badgeW, badgeH);
      this.obstacleBadgeContainer.setInteractive({ useHandCursor: true });

      // Click badge to open rich Obstacle Info Modal
      this.obstacleBadgeContainer.on('pointerover', () => {
        this.scene.tweens.add({ targets: this.obstacleBadgeContainer, scaleX: 1.15, scaleY: 1.15, duration: 100 });
      });
      this.obstacleBadgeContainer.on('pointerout', () => {
        this.scene.tweens.add({ targets: this.obstacleBadgeContainer, scaleX: 1.0, scaleY: 1.0, duration: 100 });
      });
      this.obstacleBadgeContainer.on('pointerdown', (_pointer: any, _localX: number, _localY: number, event: any) => {
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        ObstacleInfoModal.open(this.scene, this.tileState);
      });

      this.add(this.obstacleBadgeContainer);
    }

    // Dynamic Special Modifiers
    if (this.tileState.isLightning || this.tileState.modifier === 'lightning') {
      this.specialBorder = this.scene.add.graphics();
      this.specialBorder.lineStyle(2, 0x00f5d4, 0.95);
      this.specialBorder.strokeRoundedRect(-tileSize / 2 + 1, -tileSize / 2 + 1, tileSize - 2, tileSize - 2, 8);
      this.add(this.specialBorder);

      this.specialBadge = this.scene.add.text(tileSize / 2 - 10, -tileSize / 2 + 8, '⚡', {
        fontSize: '14px'
      }).setOrigin(0.5);
      this.add(this.specialBadge);

      this.scene.tweens.add({
        targets: this.specialBadge,
        scaleX: { from: 0.9, to: 1.2 },
        scaleY: { from: 0.9, to: 1.2 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } else if (this.tileState.isLuckyPot || this.tileState.modifier === 'lucky_pot') {
      this.specialBorder = this.scene.add.graphics();
      this.specialBorder.lineStyle(2.5, 0xffd700, 0.95);
      this.specialBorder.strokeRoundedRect(-tileSize / 2 + 1, -tileSize / 2 + 1, tileSize - 2, tileSize - 2, 8);
      this.add(this.specialBorder);

      // ✨ Subtle breathing pulse glow for Lucky Pot border
      this.scene.tweens.add({
        targets: this.specialBorder,
        alpha: { from: 0.55, to: 1.0 },
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.specialBadge = this.scene.add.text(-tileSize / 2 + 10, -tileSize / 2 + 8, '🏺', {
        fontSize: '13px'
      }).setOrigin(0.5);
      this.add(this.specialBadge);

      const timeLeft = Math.ceil(this.tileState.luckyPotTimeLeft !== undefined ? this.tileState.luckyPotTimeLeft : 10);
      this.luckyTimerText = this.scene.add.text(tileSize / 2 - 6, -tileSize / 2 + 8, `${timeLeft}s`, {
        fontFamily: FONT_UI,
        fontSize: '14px',
        fontStyle: '900',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3.5
      }).setOrigin(1, 0.5);
      this.add(this.luckyTimerText);
    } else if (this.tileState.isShapeshifter || this.tileState.modifier === 'shapeshifter') {
      this.specialBorder = this.scene.add.graphics();
      this.specialBorder.lineStyle(2, 0x2ec4b6, 0.9);
      this.specialBorder.strokeRoundedRect(-tileSize / 2 + 1, -tileSize / 2 + 1, tileSize - 2, tileSize - 2, 8);
      this.add(this.specialBorder);

      this.specialBadge = this.scene.add.text(tileSize / 2 - 10, -tileSize / 2 + 8, '🍃', {
        fontSize: '13px'
      }).setOrigin(0.5);
      this.add(this.specialBadge);

      this.scene.tweens.add({
        targets: this.specialBadge,
        angle: { from: -10, to: 10 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    // 6. ✨ Relic Shard Golden Sparkling Tile Aura
    if (this.tileState.hasRelicShard && !isObstacle) {
      if (!this.specialBorder) {
        this.specialBorder = this.scene.add.graphics();
        this.add(this.specialBorder);
      }
      this.specialBorder.lineStyle(2.8, 0xffd700, 1.0);
      this.specialBorder.strokeRoundedRect(-tileSize / 2 + 1, -tileSize / 2 + 1, tileSize - 2, tileSize - 2, 8);

      if (!this.specialBadge) {
        this.specialBadge = this.scene.add.text(tileSize / 2 - 8, -tileSize / 2 + 8, '✨', {
          fontSize: '14px'
        }).setOrigin(0.5);
        this.add(this.specialBadge);

        this.scene.tweens.add({
          targets: this.specialBadge,
          scale: { from: 0.85, to: 1.3 },
          alpha: { from: 0.6, to: 1.0 },
          duration: 550,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }

  public updateLuckyCountdown(seconds: number): void {
    if (this.luckyTimerText) {
      const ceil = Math.ceil(seconds);
      this.luckyTimerText.setText(`${ceil}s`);
      if (ceil <= 3) {
        this.luckyTimerText.setColor('#ff4d6d');
      }
    }
  }

  public playMorph(newCharId: string, tileSize: number): void {
    // Floating transformation leaf poof
    const leaf = this.scene.add.text(0, -6, '🍃', { fontSize: '16px' }).setOrigin(0.5);
    this.add(leaf);
    this.scene.tweens.add({
      targets: leaf,
      y: -28,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 450,
      onComplete: () => leaf.destroy()
    });

    this.scene.tweens.killTweensOf(this.charSprite);
    const targetW = tileSize * 0.94;
    const targetH = tileSize * 0.94;

    this.scene.tweens.add({
      targets: this.charSprite,
      scaleX: 0,
      scaleY: 0,
      alpha: 0.2,
      duration: 140,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.tileState.characterId = newCharId;
        let charKey = `char_${newCharId}`;
        if (!this.scene.textures.exists(charKey)) {
          TextureGenerator.ensureCharacterTexture(this.scene, newCharId);
        }
        if (!this.scene.textures.exists(charKey)) {
          charKey = 'tile_base';
        }
        this.charSprite.setTexture(charKey);
        this.charSprite.setDisplaySize(targetW, targetH);
        const finalScaleX = this.charSprite.scaleX;
        const finalScaleY = this.charSprite.scaleY;
        this.charSprite.setScale(0, 0);

        this.scene.tweens.add({
          targets: this.charSprite,
          scaleX: finalScaleX,
          scaleY: finalScaleY,
          alpha: 1,
          duration: 180,
          ease: 'Back.easeOut'
        });
      }
    });
  }

  public setSelected(selected: boolean): void {
    this.isTileSelected = selected;
    if (this.scene.textures.exists('tile_selected')) {
      this.selectionGlow.setTexture('tile_selected');
    }
    this.selectionGlow.setDisplaySize(this.tileSize, this.tileSize);
    this.selectionGlow.setVisible(selected);

    if (this.selectionTween) {
      this.selectionTween.stop();
      this.selectionTween = null;
      this.selectionGlow.setAlpha(1);
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.selectionGlow);

    if (selected) {
      this.setDepth(TileView.SELECTED_DEPTH);
      this.setScale(1.0);

      // Delicate, rhythmic golden pulse of the selection border (alpha only)
      this.selectionTween = this.scene.tweens.add({
        targets: this.selectionGlow,
        alpha: { from: 0.6, to: 1.0 },
        duration: 380,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.setDepth(TileView.BASE_DEPTH);
      this.setScale(1.0);
      this.selectionGlow.setAlpha(1.0);
    }
  }

  public setHinted(hinted: boolean): void {
    if (this.hintTween) {
      this.hintTween.stop();
      this.hintTween = null;
    }
    if (this.hintScaleTween) {
      this.hintScaleTween.stop();
      this.hintScaleTween = null;
    }

    if (hinted) {
      // Gentle depth pop above adjacent tiles
      this.setDepth(20);
      this.setAlpha(1.0);

      // Refined golden frame texture
      if (this.scene.textures.exists('tile_hinted')) {
        this.selectionGlow.setTexture('tile_hinted');
      }
      this.selectionGlow.setDisplaySize(this.tileSize * 1.04, this.tileSize * 1.04);
      this.selectionGlow.setVisible(true);

      // Smooth pulsing golden glow
      this.hintTween = this.scene.tweens.add({
        targets: this.selectionGlow,
        alpha: { from: 0.55, to: 1.0 },
        duration: 380,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Subtle, organic breathing scale (1.0 -> 1.06) - clean and non-distracting
      this.hintScaleTween = this.scene.tweens.add({
        targets: this,
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.setScale(1.0);
      this.setDepth(this.isTileSelected ? TileView.SELECTED_DEPTH : TileView.BASE_DEPTH);
      if (this.scene.textures.exists('tile_selected')) {
        this.selectionGlow.setTexture('tile_selected');
      }
      this.selectionGlow.setDisplaySize(this.tileSize, this.tileSize);
      this.selectionGlow.setVisible(this.isTileSelected);
      if (this.isTileSelected) {
        this.selectionGlow.setAlpha(1.0);
      }
      this.setAlpha(1.0);
    }
  }

  public playShake(): void {
    const originX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originX - 6,
      duration: 45,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.x = originX;
      }
    });
  }

  public playPopAndClear(onComplete?: () => void): void {
    this.disableInteractive();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0,
      duration: 180,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.setVisible(false);
        this.setAlpha(1);
        this.setScale(1);
        onComplete?.();
      }
    });
  }

  public playBounceIn(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(0.8);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: 'Back.easeOut'
    });
  }

  public playObstacleFeedback(customLabel?: string): void {
    this.scene.tweens.killTweensOf(this);
    const originX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: { from: originX - 5, to: originX + 5 },
      duration: 35,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.x = originX;
      }
    });

    if (this.obstacleBadgeContainer) {
      this.scene.tweens.add({
        targets: this.obstacleBadgeContainer,
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    }

    // Floating Notice Popup
    const toast = this.scene.add.container(this.x, this.y - 12);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1c29, 0.96);
    bg.fillRoundedRect(-105, -18, 210, 36, 10);
    bg.lineStyle(1.6, 0xff595e, 0.95);
    bg.strokeRoundedRect(-105, -18, 210, 36, 10);

    const txt = this.scene.add.text(0, 0, customLabel || '⛔ VẬT CẢN (ĐÁ)', {
      fontFamily: FONT_UI,
      fontSize: '15px',
      fontStyle: '900',
      color: '#ff595e'
    }).setOrigin(0.5);

    toast.add([bg, txt]);
    toast.setDepth(300);

    this.scene.tweens.add({
      targets: toast,
      y: this.y - 45,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => toast.destroy()
    });
  }

  public destroy(fromScene?: boolean): void {
    this.scene.tweens.killTweensOf(this);
    if (this.charSprite) {
      this.scene.tweens.killTweensOf(this.charSprite);
    }
    if (this.hintTween) {
      this.hintTween.stop();
      this.hintTween = null;
    }
    if (this.hintScaleTween) {
      this.hintScaleTween.stop();
      this.hintScaleTween = null;
    }
    super.destroy(fromScene);
  }
}
