import charactersData from '../data/characters.json';
import { CharacterData, Rarity } from '../types';

export class CharacterRegistry {
  private static characters: Map<string, CharacterData> = new Map();

  static {
    for (const char of (charactersData as CharacterData[])) {
      this.characters.set(char.id, char);
    }
  }

  public static get(id: string): CharacterData | undefined {
    return this.characters.get(id);
  }

  public static getAll(): CharacterData[] {
    return Array.from(this.characters.values());
  }

  public static getByRarity(rarity: Rarity): CharacterData[] {
    return this.getAll().filter(c => c.rarity === rarity);
  }

  public static getByCollection(collection: string): CharacterData[] {
    return this.getAll().filter(c => c.collection === collection);
  }

  public static isBoss(char: CharacterData | string): boolean {
    const data = typeof char === 'string' ? this.get(char) : char;
    if (!data) return false;
    return (
      data.id.endsWith('_boss') ||
      data.id.startsWith('boss_') ||
      data.id.includes('_boss') ||
      data.chapterId === 'chapter_12_bosses' ||
      data.chapter === 12 ||
      (data as any).isBoss === true
    );
  }

  public static getNonBossByCollection(collection: string): CharacterData[] {
    return this.getByCollection(collection).filter(c => !this.isBoss(c));
  }

  public static getRarityColor(rarity: Rarity): number {
    switch (rarity) {
      case 'common': return 0xa0aab2;
      case 'uncommon': return 0x2ec4b6;
      case 'rare': return 0x3a86ff;
      case 'epic': return 0x9b5de5;
      case 'legendary': return 0xffb703;
      default: return 0xffffff;
    }
  }

  public static getRarityName(rarity: Rarity): string {
    switch (rarity) {
      case 'common': return 'Phổ Biến';
      case 'uncommon': return 'Hiếm Nhẹ';
      case 'rare': return 'Hiếm';
      case 'epic': return 'Sử Thi';
      case 'legendary': return 'Huyền Thoại';
      default: return '';
    }
  }
}
