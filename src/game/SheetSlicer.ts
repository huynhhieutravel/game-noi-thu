import Phaser from 'phaser';

export class SheetSlicer {
  /**
   * Slices a 3x3 character sprite sheet (9 characters) into individual Phaser textures.
   * @param scene Phaser scene instance
   * @param sheetKey The preloaded key or image element for the 3x3 sheet
   * @param characterIds Array of 9 character IDs corresponding to the 3x3 grid (row-major order)
   */
  public static slice3x3Sheet(
    scene: Phaser.Scene,
    sheetKey: string,
    characterIds: string[]
  ): void {
    if (!scene.textures.exists(sheetKey)) {
      console.warn(`[SheetSlicer] Sheet texture key '${sheetKey}' not found.`);
      return;
    }

    const sourceImage = scene.textures.get(sheetKey).getSourceImage() as HTMLImageElement;
    const totalW = sourceImage.width;
    const totalH = sourceImage.height;

    const cellW = Math.floor(totalW / 3);
    const cellH = Math.floor(totalH / 3);

    let charIdx = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (charIdx >= characterIds.length) break;

        const charId = characterIds[charIdx];
        const textureKey = `char_${charId}`;

        // Create canvas for the sliced frame
        const canvas = document.createElement('canvas');
        canvas.width = cellW;
        canvas.height = cellH;
        const ctx = canvas.getContext('2d')!;

        // Draw the sliced section
        ctx.drawImage(
          sourceImage,
          col * cellW,
          row * cellH,
          cellW,
          cellH,
          0,
          0,
          cellW,
          cellH
        );

        // Remove old procedural texture if it exists, replace with sliced asset
        if (scene.textures.exists(textureKey)) {
          scene.textures.remove(textureKey);
        }

        scene.textures.addCanvas(textureKey, canvas);
        charIdx++;
      }
    }

    console.log(`[SheetSlicer] Successfully sliced 3x3 sheet '${sheetKey}' into 9 Yokai character frames.`);
  }
}
