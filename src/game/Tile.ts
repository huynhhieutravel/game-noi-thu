import Phaser from 'phaser';
import { TileState } from '../types';
import { ObstacleInfoModal } from './ObstacleInfoModal';
import { TextureGenerator } from './TextureGenerator';

export class TileView extends Phaser.GameObjects.Container {
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

  constructor(scene: Phaser.Scene, x: number, y: number, tileSize: number, state: TileState) {
    super(scene, x, y);

    this.gridR = state.r;
    this.gridC = state.c;
    this.tileState = state;

    this.setSize(tileSize, tileSize);

    // 1. Base Background
    const isObstacle = state.modifier === 'stone' || state.modifier === 'thorn' || state.modifier === 'barricade';
    this.bgSprite = scene.add.image(0, 0, 'tile_base').setDisplaySize(tileSize, tileSize);
    this.bgSprite.setVisible(!isObstacle);
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
    }
    this.charSprite = scene.add.image(0, 0, charKey)
      .setDisplaySize(tileSize * 0.94, tileSize * 0.94)
      .setVisible(!isObstacle && !!state.characterId);
    this.add(this.charSprite);

    // 4. Modifier Overlays
    this.updateModifierVisual(tileSize);

    // Enable interactive input (not-allowed cursor for hard blockers / cages)
    if (isObstacle) {
      this.setInteractive({ cursor: 'not-allowed' });
    } else {
      this.setInteractive({ useHandCursor: true });
    }

    scene.add.existing(this);
  }

  public updateState(state: TileState, tileSize: number): void {
    this.tileState = state;
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

    if (isObstacle) {
      this.setInteractive({ cursor: 'not-allowed' });
    } else {
      this.setInteractive({ useHandCursor: true });
    }

    if (isObstacle) {
      this.bgSprite.setVisible(false);
      this.charSprite.setVisible(false);
      this.updateModifierVisual(tileSize);
      return;
    }

    const charKey = state.characterId ? `char_${state.characterId}` : 'tile_base';
    if (state.characterId && !this.scene.textures.exists(charKey)) {
      TextureGenerator.ensureCharacterTexture(this.scene, state.characterId);
    }
    this.charSprite.setTexture(charKey)
      .setDisplaySize(tileSize * 0.94, tileSize * 0.94)
      .setVisible(true);
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

    const isObstacle = this.tileState.modifier === 'stone' || this.tileState.modifier === 'thorn' || this.tileState.modifier === 'barricade';
    this.bgSprite.setVisible(!isObstacle);
    this.charSprite.setVisible(!isObstacle && !!this.tileState.characterId);

    if (this.tileState.modifier === 'ice') {
      this.modSprite = this.scene.add.image(0, 0, 'mod_ice').setDisplaySize(tileSize, tileSize);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'stone') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'stone_lv1' : lvl === 2 ? 'stone_lv2' : 'stone_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_stone';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 1.08, tileSize * 1.08);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'thorn') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'thorn_lv1' : lvl === 2 ? 'thorn_lv2' : 'thorn_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_lock';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 1.08, tileSize * 1.08);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'web') {
      const lvl = this.tileState.modifierLevel || 2;
      const key = lvl === 1 ? 'web_lv1' : 'web_lv2';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_ice';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 1.04, tileSize * 1.04);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'barricade') {
      const lvl = this.tileState.modifierLevel || 3;
      const key = lvl === 1 ? 'barricade_lv1' : lvl === 2 ? 'barricade_lv2' : 'barricade_lv3';
      const texKey = this.scene.textures.exists(key) ? key : 'mod_lock';
      this.modSprite = this.scene.add.image(0, 0, texKey).setDisplaySize(tileSize * 1.08, tileSize * 1.08);
      this.add(this.modSprite);
    } else if (this.tileState.modifier === 'lock') {
      this.modSprite = this.scene.add.image(0, 0, 'mod_lock').setDisplaySize(tileSize, tileSize);
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

      const badgeW = 38;
      const badgeH = 16;
      const badgeX = tileSize / 2 - badgeW / 2 - 2;
      const badgeY = -tileSize / 2 + badgeH / 2 + 3;

      this.obstacleBadgeContainer = this.scene.add.container(badgeX, badgeY);

      const pillBg = this.scene.add.graphics();
      pillBg.fillStyle(0x0a0d18, 0.94);
      pillBg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 6);
      pillBg.lineStyle(1.4, themeColor, 0.95);
      pillBg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 6);

      const pillText = this.scene.add.text(0, 0, `${icon}${lvlStr}`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '8.5px',
        fontStyle: '900',
        color: themeHex,
        stroke: '#000000',
        strokeThickness: 2
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

      this.specialBadge = this.scene.add.text(-tileSize / 2 + 10, -tileSize / 2 + 8, '🏺', {
        fontSize: '13px'
      }).setOrigin(0.5);
      this.add(this.specialBadge);

      const timeLeft = Math.ceil(this.tileState.luckyPotTimeLeft !== undefined ? this.tileState.luckyPotTimeLeft : 10);
      this.luckyTimerText = this.scene.add.text(tileSize / 2 - 8, -tileSize / 2 + 8, `${timeLeft}s`, {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        fontStyle: '900',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
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
        const charKey = `char_${newCharId}`;
        if (!this.scene.textures.exists(charKey)) {
          TextureGenerator.ensureCharacterTexture(this.scene, newCharId);
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
    this.selectionGlow.setVisible(selected);

    if (selected) {
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 120,
        ease: 'Back.easeOut'
      });
    } else {
      this.scene.tweens.killTweensOf(this);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 120,
        ease: 'Quad.easeOut'
      });
    }
  }

  public setHinted(hinted: boolean): void {
    if (this.hintTween) {
      this.hintTween.stop();
      this.hintTween = null;
    }

    if (hinted) {
      this.selectionGlow.setVisible(true);
      this.hintTween = this.scene.tweens.add({
        targets: [this.selectionGlow, this],
        alpha: { from: 1, to: 0.4 },
        scaleX: { from: 1.08, to: 1.0 },
        scaleY: { from: 1.08, to: 1.0 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.selectionGlow.setVisible(this.isTileSelected);
      this.setAlpha(1);
      this.setScale(this.isTileSelected ? 1.12 : 1.0);
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
    const toast = this.scene.add.container(this.x, this.y - 8);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1c29, 0.96);
    bg.fillRoundedRect(-75, -13, 150, 26, 7);
    bg.lineStyle(1.5, 0xff595e, 0.95);
    bg.strokeRoundedRect(-75, -13, 150, 26, 7);

    const txt = this.scene.add.text(0, 0, customLabel || '⛔ VẬT CẢN (ĐÁ)', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '11px',
      fontStyle: '800',
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
    super.destroy(fromScene);
  }
}
