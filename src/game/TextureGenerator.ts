import Phaser from 'phaser';
import { CharacterRegistry } from './CharacterRegistry';

export class TextureGenerator {
  /**
   * Generates all procedural textures (Yokai tiles, borders, modifiers, particles) into Phaser's TextureManager
   */
  public static generateAll(scene: Phaser.Scene): void {
    this.createTileBaseTextures(scene);
    this.createYokaiCharacterTextures(scene);
    this.createModifierTextures(scene);
    this.createParticleTextures(scene);
  }

  private static createTileBaseTextures(scene: Phaser.Scene): void {
    const size = 128; // High-res power-of-two tile base for crisp WebGL & retina rendering

    // 1. Normal Tile Base
    if (!scene.textures.exists('tile_base')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Rounded rectangle with Japanese lacquerware gradient
      const rad = 18;
      ctx.beginPath();
      ctx.roundRect(4, 4, size - 8, size - 8, rad);
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#26283b');
      grad.addColorStop(1, '#13141f');
      ctx.fillStyle = grad;
      ctx.fill();

      // Golden inner border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#cda250';
      ctx.stroke();

      // Subtle top inner highlight
      ctx.beginPath();
      ctx.roundRect(8, 8, size - 16, 6, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      scene.textures.addCanvas('tile_base', canvas);
    }

    // 2. Selected Tile Base (Golden Glow)
    if (!scene.textures.exists('tile_selected')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      const rad = 18;
      ctx.beginPath();
      ctx.roundRect(4, 4, size - 8, size - 8, rad);
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#664614');
      grad.addColorStop(1, '#33230a');
      ctx.fillStyle = grad;
      ctx.fill();

      // Radiant glowing gold border
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      scene.textures.addCanvas('tile_selected', canvas);
    }

    // 3. Hinted Tile Base (Cyan pulsating border)
    if (!scene.textures.exists('tile_hinted')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      const rad = 18;
      ctx.beginPath();
      ctx.roundRect(4, 4, size - 8, size - 8, rad);
      ctx.fillStyle = '#0f3342';
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#00f5d4';
      ctx.stroke();

      scene.textures.addCanvas('tile_hinted', canvas);
    }
  }

  public static ensureCharacterTexture(scene: Phaser.Scene, charId: string): void {
    const key = `char_${charId}`;
    if (scene.textures.exists(key)) return;

    const char = CharacterRegistry.get(charId);
    if (!char) return;

    this.createCharacterCardTexture(scene, char);
  }

  public static createCharacterCardTexture(scene: Phaser.Scene, char: any): void {
    const size = 128;
    const key = `char_${char.id}`;
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background rounded card
    const rad = 20;
    ctx.beginPath();
    ctx.roundRect(6, 6, size - 12, size - 12, rad);

    // Deep vibrant theme gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 1.4);
    grad.addColorStop(0, char.palette?.bg || '#2a2d42');
    grad.addColorStop(0.7, '#141724');
    grad.addColorStop(1, '#090a10');
    ctx.fillStyle = grad;
    ctx.fill();

    // Outer accent border
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = char.palette?.accent || '#ffd700';
    ctx.stroke();

    // Center decorative badge circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 4, 34, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = char.palette?.glow || '#ffb703';
    ctx.stroke();

    // Prominent Japanese Kanji Calligraphy
    ctx.font = '900 38px "Zen Maru Gothic", "Hiragino Kaku Gothic Pro", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = char.palette?.glow || '#ffb703';
    ctx.shadowBlur = 10;
    ctx.fillText((char.japaneseName || char.name || '靈').substring(0, 2), size / 2, size / 2 - 5);
    ctx.shadowBlur = 0;

    // Small character icon emblem on top left
    ctx.font = '22px sans-serif';
    ctx.fillText(char.symbol || '✨', 24, 26);

    // Small Element Badge on top right
    const elementIcon = this.getElementIcon(char.element || 'spirit');
    ctx.font = '16px sans-serif';
    ctx.fillText(elementIcon, size - 24, 25);

    // Character English/Romaji Mini Name Plate at bottom
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f8f9fa';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.fillText(char.name, size / 2, size - 16);
    ctx.shadowBlur = 0;

    scene.textures.addCanvas(key, canvas);
  }

  private static createYokaiCharacterTextures(scene: Phaser.Scene): void {
    // Only generate for core default yokai theme characters if missing
    const yokaiChars = CharacterRegistry.getByCollection('yokai');
    for (const char of yokaiChars) {
      this.ensureCharacterTexture(scene, char.id);
    }
  }

  private static getElementIcon(element: string): string {
    switch (element) {
      case 'water': return '💧';
      case 'fire': return '🔥';
      case 'wind': return '🌪️';
      case 'earth': return '🌿';
      case 'spirit': return '✨';
      case 'thunder': return '⚡';
      default: return '🔮';
    }
  }

  private static createModifierTextures(scene: Phaser.Scene): void {
    const size = 128;

    // 1. Ice modifier overlay
    if (!scene.textures.exists('mod_ice')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      ctx.roundRect(6, 6, size - 12, size - 12, 18);
      ctx.fillStyle = 'rgba(173, 232, 244, 0.65)';
      ctx.fill();

      // Frost crackles
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(25, 25);
      ctx.lineTo(55, 60);
      ctx.lineTo(85, 40);
      ctx.moveTo(55, 60);
      ctx.lineTo(65, 95);
      ctx.stroke();

      // Ice icon in corner
      ctx.font = '24px sans-serif';
      ctx.fillText('❄️', size - 26, 26);

      scene.textures.addCanvas('mod_ice', canvas);
    }

    // 2. Stone blocker (3D Ancient Obstacle Monolith with Warning Tag)
    if (!scene.textures.exists('mod_stone')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // 1. Heavy drop shadow on ground
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 10, size * 0.44, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fill();

      // 2. Heavy Obsidian/Granite Chiseled Boulder Polygon
      ctx.beginPath();
      ctx.moveTo(18, 16);
      ctx.lineTo(66, 8);
      ctx.lineTo(112, 18);
      ctx.lineTo(122, 68);
      ctx.lineTo(112, 114);
      ctx.lineTo(76, 122);
      ctx.lineTo(22, 118);
      ctx.lineTo(8, 74);
      ctx.lineTo(10, 36);
      ctx.closePath();

      // Granite Dark Base Gradient
      const rockGrad = ctx.createLinearGradient(0, 8, size, size);
      rockGrad.addColorStop(0, '#3e4452');
      rockGrad.addColorStop(0.5, '#282c37');
      rockGrad.addColorStop(1, '#181a22');
      ctx.fillStyle = rockGrad;
      ctx.fill();

      // Chiseled Outer Stone Rim
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#111217';
      ctx.stroke();

      // 3. 3D Facet Planes
      // Top facet (Hứng sáng từ trên xuống)
      ctx.beginPath();
      ctx.moveTo(18, 16);
      ctx.lineTo(66, 8);
      ctx.lineTo(84, 38);
      ctx.lineTo(44, 46);
      ctx.closePath();
      ctx.fillStyle = 'rgba(130, 145, 170, 0.45)';
      ctx.fill();

      // Right side shadow facet
      ctx.beginPath();
      ctx.moveTo(66, 8);
      ctx.lineTo(112, 18);
      ctx.lineTo(122, 68);
      ctx.lineTo(92, 70);
      ctx.lineTo(84, 38);
      ctx.closePath();
      ctx.fillStyle = 'rgba(20, 22, 28, 0.55)';
      ctx.fill();

      // Bottom shadow facet
      ctx.beginPath();
      ctx.moveTo(122, 68);
      ctx.lineTo(112, 114);
      ctx.lineTo(76, 122);
      ctx.lineTo(80, 85);
      ctx.lineTo(92, 70);
      ctx.closePath();
      ctx.fillStyle = 'rgba(10, 12, 16, 0.75)';
      ctx.fill();

      // 4. Glowing Deep Fissure Cracks
      ctx.strokeStyle = '#ff595e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(44, 46);
      ctx.lineTo(62, 66);
      ctx.lineTo(54, 88);
      ctx.lineTo(68, 110);
      ctx.moveTo(62, 66);
      ctx.lineTo(88, 62);
      ctx.lineTo(95, 76);
      ctx.stroke();

      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 5. Four Corner Heavy Iron Rivet Brackets
      const drawBracket = (x: number, y: number, rad: number) => {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#495057';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#212529';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, rad * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ced4da';
        ctx.fill();
      };
      drawBracket(18, 24, 4.5);
      drawBracket(110, 24, 4.5);
      drawBracket(22, 110, 4.5);
      drawBracket(108, 110, 4.5);

      // 6. Central Danger Warning Shield
      const badgeY = size / 2 - 4;
      ctx.beginPath();
      ctx.arc(size / 2, badgeY, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1e28';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ff595e';
      ctx.stroke();

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛔', size / 2, badgeY);

      // 7. Bottom Metallic Plate Tag: "VẬT CẢN"
      const tagW = size - 36;
      const tagH = 20;
      const tagX = (size - tagW) / 2;
      const tagY = size - 28;

      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 5);
      ctx.fillStyle = '#161821';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ff595e';
      ctx.stroke();

      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛔ VẬT CẢN', size / 2, tagY + tagH / 2);

      scene.textures.addCanvas('mod_stone', canvas);
    }

    // 3. Locked tile overlay
    if (!scene.textures.exists('mod_lock')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      ctx.roundRect(6, 6, size - 12, size - 12, 18);
      ctx.fillStyle = 'rgba(20, 20, 25, 0.75)';
      ctx.fill();

      ctx.font = '50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', size / 2, size / 2);

      scene.textures.addCanvas('mod_lock', canvas);
    }
  }

  private static createParticleTextures(scene: Phaser.Scene): void {
    // Sakura Petal Particle
    if (!scene.textures.exists('particle_sakura')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;

      ctx.beginPath();
      ctx.ellipse(16, 16, 12, 6, Math.PI / 4, 0, Math.PI * 2);
      const grad = ctx.createLinearGradient(0, 0, 32, 32);
      grad.addColorStop(0, '#ffb3c6');
      grad.addColorStop(1, '#ff758f');
      ctx.fillStyle = grad;
      ctx.fill();

      scene.textures.addCanvas('particle_sakura', canvas);
    }

    // Golden Sparkle Star
    if (!scene.textures.exists('particle_sparkle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('particle_sparkle', canvas);
    }
  }
}
