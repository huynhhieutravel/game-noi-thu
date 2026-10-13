import Phaser from 'phaser';
import { SplashScreen } from '@capacitor/splash-screen';
import { GAME_HEIGHT, GAME_WIDTH, setupRetinaCamera } from '../constants';
import charactersData from '../data/characters.json';
import bossesData from '../data/bosses.json';
import { TextureGenerator } from '../game/TextureGenerator';
import { SaveSystem } from '../systems/SaveSystem';
import { CharacterData } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    // Loading Screen
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'YOKAI ONET', {
      fontFamily: 'Zen Maru Gothic, sans-serif',
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subText = this.add.text(width / 2, height / 2 + 25, 'Đang triệu hồi Bách Quỷ Linh Giới...', {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '14px',
      color: '#adb5bd'
    }).setOrigin(0.5);

    // Pulse animation for header
    this.tweens.add({
      targets: [loadingText],
      alpha: { from: 1, to: 0.6 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Loading Progress Bar
    const barWidth = 240;
    const barHeight = 8;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 55;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1d2e, 0.9);
    progressBox.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    progressBox.lineStyle(1, 0x3a4060, 0.8);
    progressBox.strokeRoundedRect(barX, barY, barWidth, barHeight, 4);

    const progressBar = this.add.graphics();

    this.load.on('progress', (val: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRoundedRect(barX + 1, barY + 1, (barWidth - 2) * val, barHeight - 2, 3);
      subText.setText(`Đang chuẩn bị linh giới... ${Math.round(val * 100)}%`);
    });

    // Resilience: Never let a single missing or slow asset stall boot
    this.load.on('loaderror', (fileObj: any) => {
      console.warn(`[BootScene] Warning: Asset ${fileObj?.key || 'unknown'} skipped.`);
    });

    // Safety Watchdog: If offline I/O stalls, guarantee transition within 3.5s
    let hasTransitioned = false;
    const safeTransition = () => {
      if (hasTransitioned) return;
      hasTransitioned = true;
      TextureGenerator.generateAll(this);
      this.scene.start('MainMenuScene');
      SplashScreen.hide().catch(() => {});
    };

    const watchdogTimer = setTimeout(() => {
      if (this.scene.isActive('BootScene')) {
        console.warn('[BootScene] Watchdog timer fired - proceeding to MainMenuScene');
        safeTransition();
      }
    }, 3500);

    this.load.once('complete', () => {
      clearTimeout(watchdogTimer);
    });

    // Helper to ensure relative asset URLs for both web and Capacitor WKWebView
    const resolveAsset = (p: string) => p.replace(/^\/+/, '');

    // Preload ALL 495 characters across all 16 themes (Yokai, Egypt, Greece, Wuxia, Korea, India, Sea, Pirate, Dinosaur, Monster, Fantasy, Space, Robot, Animal, Plant, etc.)
    for (const char of (charactersData as CharacterData[])) {
      const rawUrl = char.asset || char.imagePath;
      if (rawUrl) {
        this.load.image(`char_${char.id}`, resolveAsset(rawUrl));
      }
    }

    // Preload Main Menu & Gameplay HD Backgrounds & UI Assets
    this.load.image('bg_main_torii', resolveAsset('/assets/bg_main_torii.jpg'));
    this.load.image('bg_gameplay_shrine', resolveAsset('/assets/bg_gameplay_shrine.jpg'));
    this.load.image('album_book_icon', resolveAsset('/assets/album_book_icon.png'));
    this.load.image('avatar_inari', resolveAsset('/assets/avatar_inari.png'));

    // Preload Torii Gate high-res asset and new Cổng A / Cổng B portals
    this.load.image('torii_gate', resolveAsset('/assets/torii_gate.png'));
    this.load.image('portal_torii_a', resolveAsset('/assets/portal_torii_a.png'));
    this.load.image('portal_torii_b', resolveAsset('/assets/portal_torii_b.png'));
    this.load.image('shrine_roof', resolveAsset('/assets/shrine_roof.png'));

    // Preload HD Booster Button Sprites (matching mockup)
    this.load.image('btn_booster_hint', resolveAsset('/assets/btn_booster_hint.png'));
    this.load.image('btn_booster_shuffle', resolveAsset('/assets/btn_booster_shuffle.png'));
    this.load.image('btn_booster_bomb', resolveAsset('/assets/btn_booster_bomb.png'));

    // Preload all 16 World Bosses (single instance)
    for (const boss of (bossesData as any[])) {
      const bossUrl = resolveAsset(`/assets/bosses/${boss.id}.png`);
      this.load.image(boss.id, bossUrl);
      this.load.image(`boss_${boss.id}`, bossUrl);
      this.load.image(boss.id.replace('boss_', '') + '_boss', bossUrl);
    }

    // Preload all 16 Core Obstacle Sprites (Phase 1)
    const obstacleSprites = [
      'stone_lv3', 'stone_lv2', 'stone_lv1', 'stone_debris',
      'thorn_lv3', 'thorn_lv2', 'thorn_lv1', 'thorn_debris',
      'web_lv2', 'web_lv1', 'web_torn', 'web_debris',
      'barricade_lv3', 'barricade_lv2', 'barricade_lv1', 'barricade_debris'
    ];
    for (const obs of obstacleSprites) {
      this.load.image(obs, resolveAsset(`/assets/obstacles/${obs}.png`));
    }
  }

  public create(): void {
    // Generate procedural tile bases, borders, particles and fallbacks
    TextureGenerator.generateAll(this);

    this.time.delayedCall(200, () => {
      this.scene.start('MainMenuScene');
      SplashScreen.hide().catch(() => {});
    });
  }
}
