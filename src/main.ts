import Phaser from 'phaser';
import { App } from '@capacitor/app';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';

import { DPR, GAME_HEIGHT, GAME_WIDTH, getScreenDimensions, setupRetinaCamera } from './constants';
import { BootScene } from './scenes/BootScene';
import { CollectionScene } from './scenes/CollectionScene';
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { AudioSystem } from './systems/AudioSystem';

// Enhance all Phaser Text objects globally with crisp 2x resolution
const origText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const mergedStyle = Object.assign({ resolution: 2 }, style);
  return origText.call(this, x, y, text, mergedStyle);
};

const initialDims = getScreenDimensions();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: initialDims.width * DPR,
  height: initialDims.height * DPR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true
  },
  backgroundColor: '#0d0f17',
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  },
  scene: [BootScene, MainMenuScene, GameScene, CollectionScene]
};

async function initCapacitorNative(): Promise<void> {
  try {
    await ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
  } catch {}

  try {
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    await StatusBar.hide().catch(() => {});
  } catch {}

  try {
    App.addListener('appStateChange', ({ isActive }) => {
      const audio = AudioSystem.getInstance();
      if (!isActive) {
        audio.stopBGM();
      } else {
        if (audio.getEnabled()) {
          audio.startBGM();
        }
      }
    });

    let lastBackPress = 0;
    App.addListener('backButton', () => {
      const game = (window as any).__game as Phaser.Game;
      if (!game) return;

      const activeScene = game.scene.getScenes(true)[0];
      if (!activeScene) return;

      const sceneKey = activeScene.scene.key;

      if (sceneKey === 'CollectionScene') {
        activeScene.scene.start('MainMenuScene');
      } else if (sceneKey === 'GameScene') {
        activeScene.scene.start('MainMenuScene');
      } else if (sceneKey === 'MainMenuScene') {
        const handled = (activeScene as any).handleBackButton?.();
        if (handled) return;

        const now = Date.now();
        if (now - lastBackPress < 2000) {
          App.exitApp();
        } else {
          lastBackPress = now;
        }
      }
    });
  } catch {}
}

import { registerChaosRunnerGlobal } from './qa/ChaosMonkeyRunner';

function startGame(): void {
  if (!(window as any).__game) {
    const game = new Phaser.Game(config);
    (window as any).__game = game;
    initCapacitorNative();
    registerChaosRunnerGlobal();

    window.addEventListener('resize', () => {
      const { width, height } = getScreenDimensions();
      if (game.scale.width !== width * DPR || game.scale.height !== height * DPR) {
        game.scale.resize(width * DPR, height * DPR);
        game.scene.getScenes(true).forEach(scene => {
          setupRetinaCamera(scene);
        });
      }
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}
