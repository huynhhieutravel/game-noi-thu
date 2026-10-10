import type Phaser from 'phaser';

export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 680;
export const DPR = 1;

/**
 * Calculates adaptive screen dimensions matching the device aspect ratio.
 * Expands canvas width on ultra-wide devices (e.g. iPhone 15/16 Pro Max 19.5:9 -> ~1474px)
 * so there are 0 black bars.
 */
export function getScreenDimensions(): { width: number; height: number; offsetX: number } {
  if (typeof window === 'undefined') {
    return { width: GAME_WIDTH, height: GAME_HEIGHT, offsetX: 0 };
  }
  const w = window.innerWidth > 0 ? window.innerWidth : screen.width;
  const h = window.innerHeight > 0 ? window.innerHeight : screen.height;
  const ratio = w > 0 && h > 0 ? Math.max(w, h) / Math.min(w, h) : 16 / 10;

  // If device is wider than 1080/680 (1.588), expand width to cover edge-to-edge
  const targetWidth = Math.max(GAME_WIDTH, Math.round(GAME_HEIGHT * ratio));
  const offsetX = Math.round((targetWidth - GAME_WIDTH) / 2);
  return { width: targetWidth, height: GAME_HEIGHT, offsetX };
}

/**
 * Configure the scene camera so that all existing 1080x680 coordinates
 * are centered in the middle of the ultra-wide display.
 */
export function setupRetinaCamera(scene: Phaser.Scene): void {
  const { offsetX } = getScreenDimensions();
  scene.cameras.main.setScroll(-offsetX, 0);
}

