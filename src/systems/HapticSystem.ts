import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class HapticSystem {
  private static instance: HapticSystem;
  private isEnabled: boolean = true;

  private constructor() {
    const saved = localStorage.getItem('yokai_haptic_enabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }

  public static getInstance(): HapticSystem {
    if (!HapticSystem.instance) {
      HapticSystem.instance = new HapticSystem();
    }
    return HapticSystem.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('yokai_haptic_enabled', String(enabled));
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.isEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }

  /**
   * Subtle touch response when selecting a tile
   */
  public light(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        this.vibrate(15);
      });
    } catch {
      this.vibrate(15);
    }
  }

  /**
   * Crisp tactile feedback on successful match
   */
  public medium(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {
        this.vibrate(35);
      });
    } catch {
      this.vibrate(35);
    }
  }

  /**
   * Energetic double pulse on combo >= 2 or Fever mode
   */
  public combo(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {
        this.vibrate([40, 50, 60]);
      });
    } catch {
      this.vibrate([40, 50, 60]);
    }
  }

  /**
   * Soft buzz when move is blocked or invalid
   */
  public error(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.notification({ type: NotificationType.Warning }).catch(() => {
        this.vibrate(45);
      });
    } catch {
      this.vibrate(45);
    }
  }

  /**
   * Heavy rumble when Boss takes damage or strikes
   */
  public heavy(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {
        this.vibrate([70, 50, 90]);
      });
    } catch {
      this.vibrate([70, 50, 90]);
    }
  }
}
