const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imgMatches = [...content.matchAll(/add\.image\([^,]+,[^,]+,\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  const texMatches = [...content.matchAll(/setTexture\(\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  const existsMatches = [...content.matchAll(/textures\.exists\(\s*['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  return {
    images: Array.from(new Set(imgMatches)),
    textures: Array.from(new Set(texMatches)),
    exists: Array.from(new Set(existsMatches))
  };
}

console.log('MainMenuScene:', checkFile('src/scenes/MainMenuScene.ts'));
