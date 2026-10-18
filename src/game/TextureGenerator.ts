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
    this.createStagePreviewTextures(scene);
    this.createShrineModalDecorations(scene);
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

    // 2. Selected Tile Base (Crisp Golden Frame)
    if (!scene.textures.exists('tile_selected')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      const rad = 18;
      ctx.beginPath();
      ctx.roundRect(4, 4, size - 8, size - 8, rad);
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.16)');
      grad.addColorStop(1, 'rgba(255, 183, 3, 0.04)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Crisp luminous gold border
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = '#ffd700';
      ctx.shadowColor = '#ffb703';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // Subtle top inner highlight
      ctx.beginPath();
      ctx.roundRect(8, 8, size - 16, 5, 2.5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();

      scene.textures.addCanvas('tile_selected', canvas);
    }

    // 3. Hinted Tile Base (Refined Golden-Amber Lacquer Glow - Tasteful & Elegant)
    if (!scene.textures.exists('tile_hinted')) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      const rad = 18;
      ctx.beginPath();
      ctx.roundRect(4, 4, size - 8, size - 8, rad);

      // Subtle warm golden wash fill
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, 'rgba(255, 209, 102, 0.20)');
      grad.addColorStop(1, 'rgba(255, 183, 3, 0.06)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Refined golden frame with soft glow
      ctx.lineWidth = 3.6;
      ctx.strokeStyle = '#ffd166';
      ctx.shadowColor = '#ffb703';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Inner crisp white accent stroke for high visibility
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(7, 7, size - 14, size - 14, rad - 2);
      ctx.stroke();

      // Top glossy highlight
      ctx.beginPath();
      ctx.roundRect(10, 8, size - 20, 5, 2.5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      scene.textures.addCanvas('tile_hinted', canvas);
    }
  }

  public static ensureCharacterTexture(scene: Phaser.Scene, charId: string): void {
    const key = `char_${charId}`;
    if (scene.textures.exists(key)) return;

    const char = CharacterRegistry.get(charId);
    if (char) {
      this.createCharacterCardTexture(scene, char);
      return;
    }

    // Bulletproof Fallback: Never let Phaser draw __MISSING (black box with green slash)
    const fallbackChar = {
      id: charId,
      name: charId.replace(/_/g, ' '),
      japaneseName: '妖怪',
      symbol: '👺',
      palette: {
        bg: '#251a30',
        primary: '#7209b7',
        accent: '#f72585',
        glow: '#4cc9f0'
      }
    };
    this.createCharacterCardTexture(scene, fallbackChar);
  }

  public static ensureGrayscaleCharacterTexture(scene: Phaser.Scene, charId: string): string {
    const grayKey = `char_gray_${charId}`;
    if (scene.textures.exists(grayKey)) return grayKey;

    this.ensureCharacterTexture(scene, charId);
    const origKey = `char_${charId}`;
    if (!scene.textures.exists(origKey)) return origKey;

    try {
      const origTex = scene.textures.get(origKey);
      const sourceImg = origTex.getSourceImage() as (HTMLImageElement | HTMLCanvasElement);
      if (!sourceImg) return origKey;

      const w = (sourceImg as any).videoWidth || sourceImg.width || 128;
      const h = (sourceImg as any).videoHeight || sourceImg.height || 128;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return origKey;

      ctx.drawImage(sourceImg, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
      scene.textures.addCanvas(grayKey, canvas);
      return grayKey;
    } catch {
      return origKey;
    }
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

  /**
   * Generates Asian / Shinto Shrine decorative assets for the Campaign 100-Level Modal
   */
  private static createShrineModalDecorations(scene: Phaser.Scene): void {
    // 1. Grand Torii / Shinto Shrine Roof Beam (980 x 56)
    if (!scene.textures.exists('shrine_temple_roof')) {
      const canvas = document.createElement('canvas');
      canvas.width = 980;
      canvas.height = 56;
      const ctx = canvas.getContext('2d')!;

      // Main curved Kasagi (top beam) with authentic upturned eave horns (sorizori)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(16, 28);
      ctx.bezierCurveTo(240, 16, 740, 16, 964, 28); // underside curve
      ctx.lineTo(976, 10); // right upturned tip
      ctx.bezierCurveTo(740, 2, 240, 2, 4, 10); // top ridge
      ctx.closePath();

      // Deep vermilion lacquer gradient with rich wood luster
      const roofGrad = ctx.createLinearGradient(0, 2, 0, 30);
      roofGrad.addColorStop(0, '#f2545b');
      roofGrad.addColorStop(0.18, '#d90429');
      roofGrad.addColorStop(0.65, '#9b0a1a');
      roofGrad.addColorStop(1, '#590d18');
      ctx.fillStyle = roofGrad;
      ctx.fill();

      // Top golden ridge highlight line
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      // Golden eave tips (shikoro / kotsue)
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(2, 10); ctx.lineTo(24, 10); ctx.lineTo(18, 27); ctx.lineTo(2, 20); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(978, 10); ctx.lineTo(956, 10); ctx.lineTo(962, 27); ctx.lineTo(978, 20); ctx.closePath(); ctx.fill();

      // Lower Shimaki horizontal beam
      ctx.fillStyle = '#7a0c16';
      ctx.fillRect(40, 28, 900, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(38, 28, 6, 12);
      ctx.fillRect(936, 28, 6, 12);

      // Delicate golden eave brackets under the roof
      const brackets = [140, 280, 420, 560, 700, 840];
      for (const bx of brackets) {
        ctx.fillStyle = '#ffbe0b';
        ctx.fillRect(bx - 8, 38, 16, 4);
        ctx.fillStyle = '#590d18';
        ctx.fillRect(bx - 10, 41, 20, 3);
      }

      ctx.restore();
      scene.textures.addCanvas('shrine_temple_roof', canvas);
    }

    // 2. Hanging Traditional Japanese Toro Lantern (64 x 110)
    if (!scene.textures.exists('shrine_hanging_toro')) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 110;
      const ctx = canvas.getContext('2d')!;

      // Ambient warm amber radial glow
      const glow = ctx.createRadialGradient(32, 54, 4, 32, 54, 30);
      glow.addColorStop(0, 'rgba(255, 200, 80, 0.75)');
      glow.addColorStop(0.5, 'rgba(255, 120, 20, 0.35)');
      glow.addColorStop(1, 'rgba(255, 100, 20, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 20, 64, 70);

      // Top suspension cord & ring
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32, 0); ctx.lineTo(32, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(32, 16, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Black lacquer pagoda cap roof
      ctx.fillStyle = '#1c1b22';
      ctx.beginPath();
      ctx.moveTo(10, 28);
      ctx.quadraticCurveTo(32, 18, 54, 28);
      ctx.lineTo(58, 32);
      ctx.lineTo(6, 32);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      // Lantern body (Glowing paper chamber)
      const paperGrad = ctx.createLinearGradient(14, 32, 50, 32);
      paperGrad.addColorStop(0, '#ff9e00');
      paperGrad.addColorStop(0.5, '#fff3b0');
      paperGrad.addColorStop(1, '#ff9e00');
      ctx.fillStyle = paperGrad;
      ctx.fillRect(14, 32, 36, 42);

      // Black wood lattice framing
      ctx.fillStyle = '#1c1b22';
      // Vertical posts
      ctx.fillRect(12, 32, 4, 42);
      ctx.fillRect(48, 32, 4, 42);
      ctx.fillRect(29, 32, 6, 42);
      // Horizontal crossbeams
      ctx.fillRect(14, 45, 36, 3);
      ctx.fillRect(14, 59, 36, 3);

      // Lower pedestal
      ctx.fillStyle = '#1c1b22';
      ctx.fillRect(12, 74, 40, 8);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(14, 75, 36, 2);

      // Golden ring and Red silk tassel below
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(32, 84, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Red tassel strands
      ctx.strokeStyle = '#d90429';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(32, 87); ctx.lineTo(32, 106);
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(30, 88); ctx.lineTo(27, 104);
      ctx.moveTo(34, 88); ctx.lineTo(37, 104);
      ctx.stroke();

      scene.textures.addCanvas('shrine_hanging_toro', canvas);
    }

    // 3. Ornate Sculpted Kitsune Mask with Blue Hitodama Flames (130 x 100)
    if (!scene.textures.exists('shrine_kitsune_mask')) {
      const canvas = document.createElement('canvas');
      canvas.width = 130;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;

      // Ethereal rising hitodama spirit flames flanking the mask
      const drawFlameWisp = (fx: number, fy: number, scale: number) => {
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(scale, scale);
        const rad = ctx.createRadialGradient(0, 0, 3, 0, 0, 22);
        rad.addColorStop(0, '#ffffff');
        rad.addColorStop(0.35, '#00f5d4');
        rad.addColorStop(0.7, '#028090');
        rad.addColorStop(1, 'rgba(2, 128, 144, 0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawFlameWisp(18, 30, 1.0);
      drawFlameWisp(112, 30, 1.0);
      drawFlameWisp(12, 48, 0.7);
      drawFlameWisp(118, 48, 0.7);

      ctx.save();
      ctx.translate(65, 48);

      // Mask face shape
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.bezierCurveTo(34, 32, 42, 6, 38, -12); // right cheek
      ctx.lineTo(44, -36); // right ear tip
      ctx.lineTo(16, -22); // inner right ear
      ctx.lineTo(0, -18); // forehead dip
      ctx.lineTo(-16, -22); // inner left ear
      ctx.lineTo(-44, -36); // left ear tip
      ctx.lineTo(-38, -12); // left cheek
      ctx.bezierCurveTo(-42, 6, -34, 32, 0, 36);
      ctx.closePath();

      // Porcelain white gloss
      const maskGrad = ctx.createLinearGradient(0, -36, 0, 36);
      maskGrad.addColorStop(0, '#ffffff');
      maskGrad.addColorStop(0.65, '#f8fafc');
      maskGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = maskGrad;
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#c9184a';
      ctx.stroke();

      // Red inner ear tufts
      ctx.fillStyle = '#d90429';
      ctx.beginPath();
      ctx.moveTo(38, -32); ctx.lineTo(18, -20); ctx.lineTo(30, -14); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-38, -32); ctx.lineTo(-18, -20); ctx.lineTo(-30, -14); ctx.closePath(); ctx.fill();

      // Red Kabuki Eye Flames
      ctx.strokeStyle = '#d90429';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(15, 3, 9, 0.8 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-15, 3, 9, 1.2 * Math.PI, 0.2 * Math.PI);
      ctx.stroke();

      // Golden eyes inside the markings
      ctx.fillStyle = '#ffbe0b';
      ctx.beginPath();
      ctx.ellipse(15, 2, 3.5, 2, 0.2, 0, Math.PI * 2);
      ctx.ellipse(-15, 2, 3.5, 2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Fox nose
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(0, 22, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Whiskers
      ctx.fillStyle = '#d90429';
      ctx.fillRect(21, 14, 9, 2);
      ctx.fillRect(23, 19, 7, 2);
      ctx.fillRect(-30, 14, 9, 2);
      ctx.fillRect(-30, 19, 7, 2);

      // Gold Sun jewel on forehead
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Golden Bell & Red Tassels at chin
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 42, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
      scene.textures.addCanvas('shrine_kitsune_mask', canvas);
    }

    // 4. Grimoire Spellbook Icon (72 x 72)
    if (!scene.textures.exists('shrine_book_icon')) {
      const canvas = document.createElement('canvas');
      canvas.width = 72;
      canvas.height = 72;
      const ctx = canvas.getContext('2d')!;

      // Blue magical aura
      const glow = ctx.createRadialGradient(36, 36, 8, 36, 36, 34);
      glow.addColorStop(0, 'rgba(0, 245, 212, 0.5)');
      glow.addColorStop(0.6, 'rgba(58, 134, 255, 0.2)');
      glow.addColorStop(1, 'rgba(58, 134, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 72, 72);

      // Open / Tilted Book
      ctx.save();
      ctx.translate(36, 36);
      ctx.rotate(-0.08);

      // Book cover (deep indigo)
      ctx.fillStyle = '#101432';
      ctx.beginPath();
      ctx.roundRect(-24, -26, 48, 52, 4);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      // Gold filigree spine & corners
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-24, -26, 7, 52);
      ctx.fillRect(18, -26, 6, 6);
      ctx.fillRect(18, 20, 6, 6);

      // Glowing runic emblem on cover
      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.arc(4, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      scene.textures.addCanvas('shrine_book_icon', canvas);
    }

    // 5. Ancient Golden Parchment Scroll (72 x 72)
    if (!scene.textures.exists('shrine_scroll_icon')) {
      const canvas = document.createElement('canvas');
      canvas.width = 72;
      canvas.height = 72;
      const ctx = canvas.getContext('2d')!;

      const glow = ctx.createRadialGradient(36, 36, 8, 36, 36, 34);
      glow.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
      glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 72, 72);

      ctx.save();
      ctx.translate(36, 36);
      ctx.rotate(0.1);

      // Parchment gradient
      const parch = ctx.createLinearGradient(-24, 0, 24, 0);
      parch.addColorStop(0, '#fefae0');
      parch.addColorStop(0.5, '#dda15e');
      parch.addColorStop(1, '#bc6c25');
      ctx.fillStyle = parch;
      ctx.beginPath();
      ctx.roundRect(-22, -24, 44, 48, 6);
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#5a3410';
      ctx.stroke();

      // Red sealing wax and ribbons
      ctx.fillStyle = '#d90429';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-22, -2, 44, 4);

      ctx.restore();
      scene.textures.addCanvas('shrine_scroll_icon', canvas);
    }

    // 6. Ornate Red Lacquer Close Cartouche Button (380 x 64)
    if (!scene.textures.exists('shrine_close_banner')) {
      const canvas = document.createElement('canvas');
      canvas.width = 380;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Left & Right Golden Filigree Handles
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      // Left swirl
      ctx.moveTo(35, 32);
      ctx.bezierCurveTo(15, 12, 6, 48, 22, 54);
      ctx.bezierCurveTo(38, 48, 20, 24, 52, 32);
      // Right swirl
      ctx.moveTo(345, 32);
      ctx.bezierCurveTo(365, 12, 374, 48, 358, 54);
      ctx.bezierCurveTo(342, 48, 360, 24, 328, 32);
      ctx.stroke();

      // Main Red Pill Cartouche
      ctx.beginPath();
      ctx.roundRect(42, 8, 296, 48, 24);
      const grad = ctx.createLinearGradient(42, 8, 42, 56);
      grad.addColorStop(0, '#ef233c');
      grad.addColorStop(0.45, '#d90429');
      grad.addColorStop(1, '#800f2f');
      ctx.fillStyle = grad;
      ctx.fill();

      // Outer Golden Stroke
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();

      // Gloss highlight
      ctx.beginPath();
      ctx.roundRect(48, 12, 284, 12, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fill();

      scene.textures.addCanvas('shrine_close_banner', canvas);
    }

    // 7. Sakura Mon Crests (Gold, Cyan, Gray)
    const drawSakuraMon = (key: string, strokeCol: string, fillCol: string) => {
      if (scene.textures.exists(key)) return;
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(16, 16);
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * 2 * Math.PI) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -8, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = strokeCol;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas(key, canvas);
    };
    drawSakuraMon('crest_sakura_gold', '#ffd700', 'rgba(255, 215, 0, 0.35)');
    drawSakuraMon('crest_sakura_cyan', '#00f5d4', 'rgba(0, 245, 212, 0.35)');
    drawSakuraMon('crest_sakura_gray', '#8e95ad', 'rgba(142, 149, 173, 0.25)');
  }

  /**
   * Generates high-fidelity atmospheric Japanese landscape artwork for stages 1 to 10.
   * High-contrast grayscale versions ensure that locked stages are clearly visible and artistic.
   */
  private static createStagePreviewTextures(scene: Phaser.Scene): void {
    const w = 320;
    const h = 160;

    const toMono = (src: HTMLCanvasElement): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = src.width;
      c.height = src.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(src, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        // High-contrast ink-wash grayscale
        const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        // Map to clear readable monochrome range [35, 210]
        const v = Math.min(215, Math.max(35, (lum - 35) * 1.15 + 45));
        d[i] = Math.round(v * 0.94);      // silver-slate
        d[i + 1] = Math.round(v * 0.96);
        d[i + 2] = Math.round(v * 1.04);   // cool night-silver undertone
      }
      ctx.putImageData(imgData, 0, 0);

      // Light vignette only at the extreme edges
      const vig = ctx.createRadialGradient(c.width / 2, c.height / 2, c.width * 0.35, c.width / 2, c.height / 2, c.width * 0.55);
      vig.addColorStop(0, 'rgba(10, 12, 20, 0)');
      vig.addColorStop(1, 'rgba(8, 10, 18, 0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, c.width, c.height);

      return c;
    };

    // Draw 10 distinct landscapes
    for (let i = 1; i <= 10; i++) {
      const colKey = `stage_preview_${i}`;
      const monoKey = `stage_preview_${i}_mono`;
      if (scene.textures.exists(colKey) && scene.textures.exists(monoKey)) continue;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // 1. Sky Gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      if (i === 1) { // Night Torii & Golden Full Moon
        sky.addColorStop(0, '#15102a');
        sky.addColorStop(0.55, '#3b143c');
        sky.addColorStop(1, '#651a3a');
      } else if (i === 2) { // Mystic Blue Fire & Pagoda
        sky.addColorStop(0, '#041c32');
        sky.addColorStop(0.55, '#064469');
        sky.addColorStop(1, '#028090');
      } else if (i === 10) { // Orochi Dragon Crimson Tempest
        sky.addColorStop(0, '#2b0014');
        sky.addColorStop(0.55, '#590d22');
        sky.addColorStop(1, '#1e0510');
      } else {
        const rVal = (i * 22) % 60;
        const bVal = 70 + ((i * 30) % 80);
        sky.addColorStop(0, '#0e1224');
        sky.addColorStop(0.65, `rgb(${20 + rVal}, 35, ${bVal})`);
        sky.addColorStop(1, '#182035');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Starfield
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 36; s++) {
        const sx = (s * 53 + i * 37) % w;
        const sy = (s * 31 + i * 23) % (h * 0.72);
        const sr = (s % 4 === 0) ? 1.6 : 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moon with soft natural atmosphere
      const mx = (i % 2 === 0) ? 245 : 75;
      const my = 40;
      const moonRadius = (i === 1 || i === 8) ? 20 : 16;
      const moonGlow = ctx.createRadialGradient(mx, my, moonRadius * 0.3, mx, my, moonRadius * 2.6);
      moonGlow.addColorStop(0, i === 2 ? 'rgba(162, 210, 255, 0.85)' : 'rgba(255, 238, 175, 0.85)');
      moonGlow.addColorStop(0.4, i === 2 ? 'rgba(162, 210, 255, 0.35)' : 'rgba(255, 220, 140, 0.35)');
      moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(mx, my, moonRadius * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Moon Disc with subtle crater shading
      const lunar = ctx.createRadialGradient(mx - 3, my - 3, 2, mx, my, moonRadius);
      lunar.addColorStop(0, i === 2 ? '#f0f9ff' : '#fffdf0');
      lunar.addColorStop(0.85, i === 2 ? '#bae6fd' : '#fef08a');
      lunar.addColorStop(1, i === 2 ? '#7dd3fc' : '#fde047');
      ctx.fillStyle = lunar;
      ctx.beginPath();
      ctx.arc(mx, my, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Distant Mountains & Mist
      ctx.fillStyle = 'rgba(25, 32, 54, 0.7)';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h);
      ctx.lineTo(w * 0.48, h * 0.38);
      ctx.lineTo(w * 0.8, h);
      ctx.closePath();
      ctx.fill();

      // Snow cap
      ctx.fillStyle = 'rgba(240, 246, 252, 0.55)';
      ctx.beginPath();
      ctx.moveTo(w * 0.42, h * 0.48);
      ctx.lineTo(w * 0.48, h * 0.38);
      ctx.lineTo(w * 0.54, h * 0.48);
      ctx.closePath();
      ctx.fill();

      // Foreground Landscape Specifics
      if (i === 1 || i === 4) {
        // Red Torii Gate with glowing base lanterns
        const toriiColor = i === 1 ? '#a01a24' : '#1a1f33';
        ctx.fillStyle = toriiColor;
        // Left & right pillars
        ctx.fillRect(115, 55, 11, 105);
        ctx.fillRect(195, 55, 11, 105);
        // Crossbeam
        ctx.fillRect(100, 74, 120, 8);
        // Upper curved roof beam
        ctx.beginPath();
        ctx.moveTo(85, 58);
        ctx.quadraticCurveTo(160, 52, 235, 58);
        ctx.lineTo(242, 48);
        ctx.quadraticCurveTo(160, 42, 78, 48);
        ctx.closePath();
        ctx.fill();

        // Warm glowing lanterns at Torii base
        const lGlow = ctx.createRadialGradient(160, 115, 6, 160, 115, 55);
        lGlow.addColorStop(0, 'rgba(255, 165, 0, 0.7)');
        lGlow.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.fillStyle = lGlow;
        ctx.fillRect(95, 65, 130, 95);
      } else if (i === 2 || i === 5) {
        // Japanese Pagoda Temple
        ctx.fillStyle = i === 2 ? '#0b2545' : '#141829';
        const px = 160;
        for (let t = 0; t < 3; t++) {
          const ty = 65 + t * 25;
          const pw = 72 - t * 13;
          ctx.beginPath();
          ctx.moveTo(px - pw, ty);
          ctx.quadraticCurveTo(px, ty - 8, px + pw, ty);
          ctx.lineTo(px + pw - 6, ty + 12);
          ctx.lineTo(px - pw + 6, ty + 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillRect(px - 24, 115, 48, 45);

        // Mystical Hitodama flame for Stage 2
        if (i === 2) {
          const fGlow = ctx.createRadialGradient(210, 90, 4, 210, 90, 32);
          fGlow.addColorStop(0, '#ffffff');
          fGlow.addColorStop(0.4, '#00f5d4');
          fGlow.addColorStop(1, 'rgba(0, 245, 212, 0)');
          ctx.fillStyle = fGlow;
          ctx.beginPath();
          ctx.arc(210, 90, 32, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (i === 3 || i === 7) {
        // Shinto Kitsune Fox Guardian Statue
        ctx.fillStyle = '#181e30';
        ctx.beginPath();
        ctx.moveTo(125, 160);
        ctx.lineTo(145, 85);
        ctx.lineTo(160, 72);
        ctx.lineTo(170, 85);
        ctx.lineTo(195, 160);
        ctx.closePath();
        ctx.fill();
        // Fox ears
        ctx.beginPath();
        ctx.moveTo(150, 72); ctx.lineTo(154, 58); ctx.lineTo(159, 72); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(161, 72); ctx.lineTo(166, 58); ctx.lineTo(170, 72); ctx.closePath(); ctx.fill();

        // Small torii behind statue
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(60, 80, 6, 80);
        ctx.fillRect(100, 80, 6, 80);
        ctx.fillRect(52, 90, 60, 5);
      } else if (i === 6 || i === 9) {
        // Traditional Moon Bridge with Water Reflections
        ctx.fillStyle = '#161d30';
        ctx.beginPath();
        ctx.arc(160, 185, 82, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.lineTo(245, 160);
        ctx.lineTo(75, 160);
        ctx.closePath();
        ctx.fill();

        // Water surface & ripples
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(50, 138, 220, 3);
        ctx.fillRect(80, 147, 160, 3);

        // Bridge lanterns
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(115, 116, 5, 0, Math.PI * 2);
        ctx.arc(205, 116, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (i === 8) {
        // Gnarled Ancient Japanese Pine Tree
        ctx.fillStyle = '#141829';
        // Trunk
        ctx.beginPath();
        ctx.moveTo(160, 160);
        ctx.quadraticCurveTo(140, 110, 170, 70);
        ctx.lineTo(180, 70);
        ctx.quadraticCurveTo(155, 110, 175, 160);
        ctx.closePath();
        ctx.fill();
        // Foliage pads
        const pads = [[170, 65, 30], [135, 95, 25], [200, 90, 22], [120, 125, 20]];
        for (const [px, py, pr] of pads) {
          ctx.beginPath();
          ctx.ellipse(px, py, pr, pr * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (i === 10) {
        // Eight-Headed Serpent Dragon (Yamata-no-Orochi) Silhouette
        ctx.fillStyle = '#16040e';
        ctx.beginPath();
        ctx.moveTo(30, 160);
        ctx.quadraticCurveTo(110, 80, 160, 105);
        ctx.quadraticCurveTo(210, 80, 290, 160);
        ctx.lineTo(320, 160);
        ctx.lineTo(0, 160);
        ctx.closePath();
        ctx.fill();

        // 5 Prominent Serpent Dragon Heads
        const heads = [95, 125, 160, 195, 225];
        for (const hx of heads) {
          const hy = 90 - Math.abs(160 - hx) * 0.3;
          ctx.beginPath();
          ctx.arc(hx, hy, 13, 0, Math.PI * 2);
          ctx.fill();

          // Glowing Demonic Red Eyes
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.arc(hx + 3, hy - 2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#16040e';
        }
      }

      // Floating Cherry Blossom Petals
      ctx.fillStyle = 'rgba(255, 138, 168, 0.75)';
      for (let p = 0; p < 9; p++) {
        const px = (p * 57 + i * 27) % w;
        const py = (p * 39 + i * 17) % h;
        ctx.beginPath();
        ctx.ellipse(px, py, 4.5, 2.2, 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom shadow blend
      const bGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      bGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bGrad.addColorStop(1, 'rgba(12, 14, 24, 0.85)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      scene.textures.addCanvas(colKey, canvas);

      // Register Grayscale version for locked state
      const monoCanvas = toMono(canvas);
      scene.textures.addCanvas(monoKey, monoCanvas);
    }
  }
}


