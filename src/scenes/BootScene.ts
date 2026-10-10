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

    // Pulse animation
    this.tweens.add({
      targets: [loadingText, subText],
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Helper to ensure relative asset URLs for both web and Capacitor WKWebView
    const resolveAsset = (p: string) => p.replace(/^\/+/, '');

    // Preload active theme & default yokai theme characters
    const selectedTheme = SaveSystem.getInstance().getSelectedTheme() || 'yokai';
    const activeThemes = new Set(['yokai', selectedTheme]);

    for (const char of (charactersData as CharacterData[])) {
      const theme = (char as any).theme || char.collection;
      if (activeThemes.has(theme)) {
        const rawUrl = char.asset || char.imagePath;
        if (rawUrl) {
          this.load.image(`char_${char.id}`, resolveAsset(rawUrl));
        }
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

    this.time.delayedCall(300, () => {
      this.scene.start('MainMenuScene');
      SplashScreen.hide().catch(() => {});
    });
  }
}
