import Phaser from 'phaser';
import { SplashScreen } from '@capacitor/splash-screen';
import { GAME_HEIGHT, GAME_WIDTH, setupRetinaCamera } from '../constants';
import charactersData from '../data/characters.json';
import relicsData from '../data/relics.json';
import bossesData from '../data/bosses.json';
import { TextureGenerator } from '../game/TextureGenerator';
import { CharacterData } from '../types';
import { FONT_DISPLAY, FONT_UI } from '../styles/typography';
import { SaveSystem } from '../systems/SaveSystem';

export class BootScene extends Phaser.Scene {
  private hasTransitioned: boolean = false;

  constructor() {
    super('BootScene');
  }

  private safeTransition(): void {
    if (this.hasTransitioned) return;
    this.hasTransitioned = true;
    try {
      this.load.removeAllListeners();
    } catch {}
    try {
      // Alias companion textures without duplicating VRAM (zero GPU allocations)
      const compIds = [
        'inari_kitsune', 'ryujin_pearl', 'hi_no_tori',
        'byakko_tiger', 'genbu_tortoise', 'kirin_sacred',
        'raiju_thunder', 'yatagarasu_crow', 'nekomata_cat', 'orochi_serpent'
      ];
      const texList = (this.textures as any).list;
      for (const compId of compIds) {
        if (this.textures.exists(`char_${compId}`)) {
          const tex = this.textures.get(`char_${compId}`);
          if (!this.textures.exists(`avatar_${compId}`)) texList[`avatar_${compId}`] = tex;
          if (!this.textures.exists(`comp_${compId}`)) texList[`comp_${compId}`] = tex;
        }
        if (this.textures.exists(`skill_act_${compId}`) && !this.textures.exists(`skill_${compId}`)) {
          texList[`skill_${compId}`] = this.textures.get(`skill_act_${compId}`);
        }
      }
      // Alias relics without duplicating VRAM
      for (const relic of (relicsData as any[])) {
        if (relic.image && this.textures.exists(`relic_${relic.id}`) && !this.textures.exists(relic.id)) {
          texList[relic.id] = this.textures.get(`relic_${relic.id}`);
        }
      }
      // Alias all 16 bosses without duplicate VRAM
      for (const b of (bossesData as any[])) {
        if (b.id && this.textures.exists(b.id)) {
          const tex = this.textures.get(b.id);
          const clean = b.id.replace(/^boss_/, '').replace(/_boss$/, '');
          if (!this.textures.exists(`boss_${clean}`)) texList[`boss_${clean}`] = tex;
          if (!this.textures.exists(`${clean}_boss`)) texList[`${clean}_boss`] = tex;
          if (b.id === 'boss_orochi') {
            if (!this.textures.exists('boss_yamata_no_orochi')) texList['boss_yamata_no_orochi'] = tex;
            if (!this.textures.exists('orochi_boss')) texList['orochi_boss'] = tex;
            if (!this.textures.exists('yamata_no_orochi_boss')) texList['yamata_no_orochi_boss'] = tex;
          }
        }
      }

      TextureGenerator.generateAll(this);
    } catch (e) {
      console.warn('[BootScene] TextureGenerator warning:', e);
    }

    try {
      this.scene.start('MainMenuScene');
    } catch (e) {
      console.error('[BootScene] scene.start error:', e);
    }

    try {
      SplashScreen.hide().catch(() => {});
    } catch {}
  }

  public preload(): void {
    this.hasTransitioned = false;
    setupRetinaCamera(this);
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    // Loading Screen
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'FOXY PAIR', {
      fontFamily: FONT_DISPLAY,
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subText = this.add.text(width / 2, height / 2 + 25, 'Đang triệu hồi Hồ Ly & Linh Thú...', {
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

    let lastProgress = 0;
    let lastProgressTime = Date.now();
    this.load.on('progress', (val: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRoundedRect(barX + 1, barY + 1, (barWidth - 2) * val, barHeight - 2, 3);
      subText.setText(`Đang chuẩn bị linh giới... ${Math.round(val * 100)}%`);
      if (val > lastProgress) {
        lastProgress = val;
        lastProgressTime = Date.now();
      }
    });

    // Resilience: Never let a single missing or slow asset stall boot
    this.load.on('loaderror', (fileObj: any) => {
      console.warn(`[BootScene] Warning: Asset ${fileObj?.key || 'unknown'} skipped.`);
    });

    // Safety Watchdog: Only trigger if loader completely stalls with NO progress for 8s
    const watchdogInterval = setInterval(() => {
      if (this.hasTransitioned) {
        clearInterval(watchdogInterval);
        return;
      }
      if (Date.now() - lastProgressTime > 8000) {
        clearInterval(watchdogInterval);
        console.warn('[BootScene] Watchdog timer fired: progress stalled - proceeding to MainMenuScene');
        this.safeTransition();
      }
    }, 1000);

    this.events.once('shutdown', () => clearInterval(watchdogInterval));
    this.events.once('destroy', () => clearInterval(watchdogInterval));

    // Helper to ensure relative asset URLs for both web and Capacitor WKWebView
    const resolveAsset = (p: string) => p.replace(/^\/+/, '');

    // Preload Main Menu & Gameplay HD Backgrounds & UI Assets (minimal core)
    this.load.image('bg_main_torii', resolveAsset('/assets/bg_main_torii.jpg'));
    this.load.image('bg_night_shrine', resolveAsset('/assets/bg_night_shrine.jpg'));
    this.load.image('bg_boss_arena', resolveAsset('/assets/bg_boss_arena.jpg'));
    this.load.image('bg_zen_forest', resolveAsset('/assets/bg_zen_forest.jpg'));
    this.load.image('bg_survival_snow', resolveAsset('/assets/bg_survival_snow.jpg'));
    this.load.image('bg_gameplay_shrine', resolveAsset('/assets/bg_gameplay_shrine.jpg'));
    this.load.image('bg_egypt_nile', resolveAsset('/assets/themes/egypt/bg_egypt_nile.jpg'));
    this.load.image('album_book_icon', resolveAsset('/assets/album_book_icon.png'));
    this.load.image('avatar_inari', resolveAsset('/assets/avatar_inari.png'));

    // Preload Dedicated 16:9 Cinematic Story Lore Illustrations (All 6 Chapters)
    this.load.image('story_art_yokai_origin', resolveAsset('/assets/story/story_art_yokai_origin.jpg'));
    this.load.image('story_art_egypt', resolveAsset('/assets/story/story_art_egypt.jpg'));
    this.load.image('story_art_olympus', resolveAsset('/assets/story/story_art_olympus.jpg'));
    this.load.image('story_art_kunlun', resolveAsset('/assets/story/story_art_kunlun.jpg'));
    this.load.image('story_art_kraken', resolveAsset('/assets/story/story_art_kraken.jpg'));
    this.load.image('story_art_chaos', resolveAsset('/assets/story/story_art_chaos.jpg'));
    this.load.image('story_art_multiverse_rift', resolveAsset('/assets/story/story_art_multiverse_rift.jpg'));
    this.load.image('story_album_ch1', resolveAsset('/assets/collection_album_chapter1.png'));
    this.load.image('story_album_ch4', resolveAsset('/assets/collection_album_chapter4.png'));
    this.load.image('story_album_ch8', resolveAsset('/assets/collection_album_chapter8.png'));
    this.load.image('story_album_ch10', resolveAsset('/assets/collection_album_chapter10.png'));
    this.load.image('story_album_ch12', resolveAsset('/assets/collection_album_chapter12.png'));
    this.load.image('story_kyuubi', resolveAsset('/assets/collection_kyuubi_modal.png'));

    // Preload Stage Loot Reward Icons & Difficulty Chests
    this.load.image('icon_reward_exp', resolveAsset('/assets/icon_reward_exp.png'));
    this.load.image('icon_reward_coin', resolveAsset('/assets/icon_reward_coin.png'));
    this.load.image('icon_reward_speed', resolveAsset('/assets/icon_reward_speed.png'));
    this.load.image('icon_diamond', resolveAsset('/assets/icon_diamond.png'));
    this.load.image('icon_life_heart', resolveAsset('/assets/icon_life_heart.png'));
    this.load.image('icon_lucky_bag', resolveAsset('/assets/icon_lucky_bag.png'));

    // Preload High-Fidelity Japanese Stage & Prestige Badges
    this.load.image('badge_bronze', resolveAsset('/assets/badges/badge_bronze.png'));
    this.load.image('badge_silver', resolveAsset('/assets/badges/badge_silver.png'));
    this.load.image('badge_gold', resolveAsset('/assets/badges/badge_gold.png'));
    this.load.image('badge_boss_slayer', resolveAsset('/assets/badges/badge_boss_slayer.png'));
    this.load.image('badge_zen_master', resolveAsset('/assets/badges/badge_zen_master.png'));
    this.load.image('badge_combo_master', resolveAsset('/assets/badges/badge_combo_master.png'));
    this.load.image('badge_speed_god', resolveAsset('/assets/badges/badge_speed_god.png'));
    this.load.image('badge_survival_hero', resolveAsset('/assets/badges/badge_survival_hero.png'));
    this.load.image('badge_divine_shrine', resolveAsset('/assets/badges/badge_divine_shrine.png'));
    this.load.image('badge_beast_awakening', resolveAsset('/assets/badges/badge_beast_awakening.png'));
    this.load.image('badge_perfect_strategist', resolveAsset('/assets/badges/badge_perfect_strategist.png'));

    // Preload Top Action Button Icons (Wallpaper, Codex Book, Sound, Settings)
    this.load.image('btn_wallpaper', resolveAsset('/assets/icons/btn_wallpaper.png'));
    this.load.image('btn_book', resolveAsset('/assets/icons/btn_book.png'));
    this.load.image('btn_sound_on', resolveAsset('/assets/icons/btn_sound_on.png'));
    this.load.image('btn_sound_off', resolveAsset('/assets/icons/btn_sound_off.png'));
    this.load.image('btn_settings', resolveAsset('/assets/icons/btn_settings.png'));

    // Preload 4 Game Mode Card Icons (Campaign Scroll, Survival Blizzard Crystal, Zen Sakura, Boss Demon Crown)
    this.load.image('mode_campaign', resolveAsset('/assets/icons/mode_campaign.png'));
    this.load.image('mode_survival', resolveAsset('/assets/icons/mode_survival.png'));
    this.load.image('mode_zen', resolveAsset('/assets/icons/mode_zen.png'));
    this.load.image('mode_boss', resolveAsset('/assets/icons/mode_boss.png'));

    this.load.image('chest_diff_easy', resolveAsset('/assets/chest_diff_easy.png'));
    this.load.image('chest_diff_medium', resolveAsset('/assets/chest_diff_medium.png'));
    this.load.image('chest_diff_hard', resolveAsset('/assets/chest_diff_hard.png'));

    // Preload Torii Gate high-res asset and Cổng A / Cổng B portals
    this.load.image('icon_torii_menu', resolveAsset('/assets/icon_torii_menu.png'));
    this.load.image('torii_gate', resolveAsset('/assets/torii_gate.png'));
    this.load.image('portal_torii_a', resolveAsset('/assets/portal_torii_a.png'));
    this.load.image('portal_torii_b', resolveAsset('/assets/portal_torii_b.png'));
    this.load.image('shrine_roof', resolveAsset('/assets/shrine_roof.png'));
    this.load.image('shrine_lantern', resolveAsset('/assets/shrine_lantern.png'));

    // Preload Chapter 1 stage thumbnails (1 to 10) for instant startup (remaining chapters loaded on-demand)
    for (let stg = 1; stg <= 10; stg++) {
      this.load.image(`stage_thumb_${stg}`, resolveAsset(`/assets/stages/stage_thumb_${stg}.jpg`));
    }
    // Preload Stage 1 full scenic background for instant opening
    this.load.image('stage_bg_1', resolveAsset('/assets/stages/stage_bg_1.png'));
    this.load.image('bg1', resolveAsset('/assets/stages/stage_bg_1.png'));

    // Preload ALL 108 Yokai characters (256x256, crystal clear retina, only 28MB VRAM total!)
    const allYokai = (charactersData as any[]).filter((c: any) => c.collection === 'yokai' && !c.isBoss);
    for (const c of allYokai) {
      this.load.image(`char_${c.id}`, resolveAsset(`/assets/characters/${c.id}.png`));
    }

    // Preload ALL 16 World Bosses (512x512 retina crystal clear)
    for (const b of (bossesData as any[])) {
      if (b.id) {
        this.load.image(b.id, resolveAsset(`/assets/bosses/${b.id}.png`));
      }
    }

    // Preload 10 Boss Arena battlefield thumbnails (240x135 JPEG, ~23KB each)
    for (let a = 1; a <= 10; a++) {
      this.load.image(`boss_arena_thumb_${a}`, resolveAsset(`/assets/boss_arenas/boss_arena_thumb_${a}.jpg`));
    }
    this.load.image('boss_arena_1', resolveAsset('/assets/boss_arenas/boss_arena_1.png'));

    // Preload 30 Relics (single canonical entry per relic to stay within mobile RAM limits)
    for (const relic of (relicsData as any[])) {
      if (relic.image) {
        const assetUrl = resolveAsset(`/${relic.image}`);
        this.load.image(`relic_${relic.id}`, assetUrl);
      }
    }

    // Preload 3D Turntable Frame 00 for instant hero avatar presentation
    this.load.image('inari_3d_00', resolveAsset('/assets/companion/inari_3d/inari_3d_00.png'));
    this.load.image('ryujin_3d_00', resolveAsset('/assets/companion/ryujin_3d/ryujin_3d_00.png'));
    this.load.image('hinotori_3d_00', resolveAsset('/assets/companion/hinotori_3d/hinotori_3d_00.png'));

    // Preload ALL 10 Mythical Companions & their dedicated Skill Icons
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
      if (compArtMap[compId]) {
        this.load.image(`comp_art_${compId}`, resolveAsset(compArtMap[compId]));
      }
      this.load.image(`skill_act_${compId}`, resolveAsset(`/assets/skills/skill_act_${compId}.png`));
      this.load.image(`skill_pas_${compId}`, resolveAsset(`/assets/skills/skill_pas_${compId}.png`));
      this.load.image(`skill_cnt_${compId}`, resolveAsset(`/assets/skills/skill_cnt_${compId}.png`));
    }

    // Preload HD Booster Button Sprites
    this.load.image('btn_booster_hint', resolveAsset('/assets/btn_booster_hint.png'));
    this.load.image('btn_booster_shuffle', resolveAsset('/assets/btn_booster_shuffle.png'));
    this.load.image('btn_booster_bomb', resolveAsset('/assets/btn_booster_bomb.png'));

    // Preload Standalone Item Booster Artwork Icons
    this.load.image('item_booster_hint', resolveAsset('/assets/item_booster_hint.png'));
    this.load.image('item_booster_shuffle', resolveAsset('/assets/item_booster_shuffle.png'));
    this.load.image('item_booster_bomb', resolveAsset('/assets/item_booster_bomb.png'));

    // Preload all 16 Core Obstacle Sprites
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
    const proceed = () => this.safeTransition();
    if (typeof document !== 'undefined' && (document as any).fonts && (document as any).fonts.ready) {
      Promise.race([
        (document as any).fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 500))
      ]).then(proceed).catch(proceed);
    } else {
      proceed();
    }
  }
}
