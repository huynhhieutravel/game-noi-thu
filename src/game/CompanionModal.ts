import Phaser from 'phaser';
import { CompanionConfig } from '../types';
import { CompanionModal3D } from './CompanionModal3D';

export class CompanionModal {
  public static open(
    scene: Phaser.Scene,
    onSelect?: (companion: CompanionConfig) => void
  ): Phaser.GameObjects.Container {
    return CompanionModal3D.open(scene, onSelect);
  }
}
