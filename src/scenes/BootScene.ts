import Phaser from 'phaser';
import { SplashScreen } from '@capacitor/splash-screen';
import { GAME_HEIGHT, GAME_WIDTH, setupRetinaCamera } from '../constants';
import charactersData from '../data/characters.json';
import bossesData from '../data/bosses.json';
import relicsData from '../data/relics.json';
import { TextureGenerator } from '../game/TextureGenerator';
import { SaveSystem } from '../systems/SaveSystem';
import { CharacterData } from '../types';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';

export class BootScene extends Phaser.Scene {
  private hasTransitioned: boolean = false;

  constructor() {
    super('BootScene');
  }

  private safeTransition(): void {
    if (this.hasTransitioned) return;
    this.hasTransitioned = true;
    TextureGenerator.generateAll(this);
    this.scene.start('MainMenuScene');
    SplashScreen.hide().catch(() => {});
  }

  public preload(): void {
    this.hasTransitioned = false;
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    // Loading Screen
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'YOKAI ONET', {
      fontFamily: FONT_DISPLAY,
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subText = this.add.text(width / 2, height / 2 + 25, 'Đang triệu hồi Bách Quỷ Linh Giới...', {
      fontFamily: FONT_UI,
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

    // Safety Watchdog: If offline I/O stalls, guarantee transition within 5s
    const watchdogTimer = setTimeout(() => {
      if (!this.hasTransitioned) {
        console.warn('[BootScene] Watchdog timer fired - proceeding to MainMenuScene');
        this.safeTransition();
      }
    }, 5000);

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
    this.load.image('bg_night_shrine', resolveAsset('/assets/bg_night_shrine.jpg'));
    this.load.image('bg_boss_arena', resolveAsset('/assets/bg_boss_arena.jpg'));
    this.load.image('bg_zen_forest', resolveAsset('/assets/bg_zen_forest.jpg'));
    this.load.image('bg_survival_snow', resolveAsset('/assets/bg_survival_snow.jpg'));
    this.load.image('bg_gameplay_shrine', resolveAsset('/assets/bg_gameplay_shrine.jpg'));
    this.load.image('bg_egypt_nile', resolveAsset('/assets/themes/egypt/bg_egypt_nile.jpg'));
    this.load.image('album_book_icon', resolveAsset('/assets/album_book_icon.png'));
    this.load.image('avatar_inari', resolveAsset('/assets/avatar_inari.png'));

    // Preload Torii Gate high-res asset and new Cổng A / Cổng B portals
    this.load.image('torii_gate', resolveAsset('/assets/torii_gate.png'));
    this.load.image('portal_torii_a', resolveAsset('/assets/portal_torii_a.png'));
    this.load.image('portal_torii_b', resolveAsset('/assets/portal_torii_b.png'));
    this.load.image('shrine_roof', resolveAsset('/assets/shrine_roof.png'));
    this.load.image('shrine_lantern', resolveAsset('/assets/shrine_lantern.png'));

    // Preload initial Stage 1 to 10 backgrounds for instantaneous Chapter 1 launch
    for (let stg = 1; stg <= 10; stg++) {
      const stgPath = resolveAsset(`/assets/stages/stage_bg_${stg}.png`);
      this.load.image(`stage_bg_${stg}`, stgPath);
      this.load.image(`bg${stg}`, stgPath);
    }

    // Preload 30 Relics (if PNGs exist in public/assets/relics/) with all key aliases
    for (const relic of (relicsData as any[])) {
      const assetUrl = resolveAsset(`/${relic.image}`);
      this.load.image(relic.id, assetUrl);
      this.load.image(`relic_${relic.id}`, assetUrl);
      const alias = relic.id.replace(/^relic_/, '');
      this.load.image(alias, assetUrl);
      this.load.image(`relic_${alias}`, assetUrl);

      // Support legacy format e.g. yokai_relic_01
      const parts = relic.id.split('_');
      if (parts.length === 3 && parts[0] === 'relic') {
        const legacyId = `${parts[1]}_relic_${parts[2]}`;
        this.load.image(legacyId, assetUrl);
        this.load.image(`relic_${legacyId}`, assetUrl);
      }
    }

    // Preload Inari Kitsune 3D Turntable Frames (18 frames across 360 degrees)
    for (let i = 0; i < 18; i++) {
      const pad = i.toString().padStart(2, '0');
      this.load.image(`inari_3d_${pad}`, resolveAsset(`/assets/companion/inari_3d/inari_3d_${pad}.png`));
    }

    // Preload Ryujin Pearl 3D Turntable Frames (18 frames across 360 degrees)
    for (let i = 0; i < 18; i++) {
      const pad = i.toString().padStart(2, '0');
      this.load.image(`ryujin_3d_${pad}`, resolveAsset(`/assets/companion/ryujin_3d/ryujin_3d_${pad}.png`));
    }

    // Preload Hi-no-tori 3D Turntable Frames (18 frames across 360 degrees)
    for (let i = 0; i < 18; i++) {
      const pad = i.toString().padStart(2, '0');
      this.load.image(`hinotori_3d_${pad}`, resolveAsset(`/assets/companion/hinotori_3d/hinotori_3d_${pad}.png`));
    }

    // Preload ALL 10 Mythical Companions
    const all10Companions = [
      'inari_kitsune', 'ryujin_pearl', 'hi_no_tori',
      'byakko_tiger', 'genbu_tortoise', 'kirin_sacred',
      'raiju_thunder', 'yatagarasu_crow', 'nekomata_cat', 'orochi_serpent'
    ];
    const compArtMap: Record<string, string> = {
      inari_kitsune: '/assets/companion/inari_3d/inari_3d_00.png',
      ryujin_pearl: '/assets/companion/ryujin_3d/ryujin_3d_00.png',
      hi_no_tori: '/assets/companion/hinotori_3d/hinotori_3d_00.png',
      byakko_tiger: '/assets/companion/byakko_tiger/byakko_tiger.png',
      genbu_tortoise: '/assets/companion/genbu_tortoise/genbu_tortoise.png',
      kirin_sacred: '/assets/companion/kirin_sacred/kirin_sacred.png',
      raiju_thunder: '/assets/companion/raiju_thunder/raiju_thunder.png',
      nekomata_cat: '/assets/companion/nekomata_cat/nekomata_cat.png',
      yatagarasu_crow: '/assets/companion/yatagarasu_crow/yatagarasu_crow.png',
      orochi_serpent: '/assets/companion/orochi_serpent/orochi_serpent.png'
    };
    for (const compId of all10Companions) {
      const charPath = resolveAsset(`/assets/characters/${compId}.png`);
      this.load.image(`char_${compId}`, charPath);
      this.load.image(`avatar_${compId}`, charPath);
      this.load.image(`comp_${compId}`, charPath);
      if (compArtMap[compId]) {
        this.load.image(`comp_art_${compId}`, resolveAsset(compArtMap[compId]));
      }
    }

    // Preload HD Booster Button Sprites (matching mockup)
    this.load.image('btn_booster_hint', resolveAsset('/assets/btn_booster_hint.png'));
    this.load.image('btn_booster_shuffle', resolveAsset('/assets/btn_booster_shuffle.png'));
    this.load.image('btn_booster_bomb', resolveAsset('/assets/btn_booster_bomb.png'));

    // Preload Standalone Item Booster Artwork Icons (Hint Bottle, Shuffle Fan, Thunder Hammer)
    this.load.image('item_booster_hint', resolveAsset('/assets/item_booster_hint.png'));
    this.load.image('item_booster_shuffle', resolveAsset('/assets/item_booster_shuffle.png'));
    this.load.image('item_booster_bomb', resolveAsset('/assets/item_booster_bomb.png'));

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
    if (typeof document !== 'undefined' && (document as any).fonts && (document as any).fonts.ready) {
      (document as any).fonts.ready.then(() => {
        this.safeTransition();
      }).catch(() => {
        this.safeTransition();
      });
    } else {
      this.safeTransition();
    }
  }
}
