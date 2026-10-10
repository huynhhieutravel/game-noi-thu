export interface ComboEventHandlers {
  onComboChanged?: (combo: number, multiplier: number) => void;
  onFeverEnter?: () => void;
  onFeverExit?: () => void;
  onComboReset?: () => void;
}

export class ComboSystem {
  private comboCount: number = 0;
  private maxCombo: number = 0;
  private timer: number = 0;
  private readonly comboWindow: number = 3.5; // seconds to keep combo alive
  private isFeverMode: boolean = false;
  private handlers: ComboEventHandlers;

  constructor(handlers: ComboEventHandlers = {}) {
    this.handlers = handlers;
  }

  public registerMatch(): { combo: number; multiplier: number; isFever: boolean } {
    this.comboCount++;
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }
    this.timer = this.comboWindow;

    const previousFever = this.isFeverMode;
    if (this.comboCount >= 5) {
      this.isFeverMode = true;
    }

    const multiplier = this.getMultiplier();

    this.handlers.onComboChanged?.(this.comboCount, multiplier);

    if (!previousFever && this.isFeverMode) {
      this.handlers.onFeverEnter?.();
    }

    return {
      combo: this.comboCount,
      multiplier,
      isFever: this.isFeverMode
    };
  }

  public update(deltaSeconds: number): void {
    if (this.comboCount > 0) {
      this.timer -= deltaSeconds;
      if (this.timer <= 0) {
        this.resetCombo();
      }
    }
  }

  public resetCombo(): void {
    if (this.comboCount === 0) return;

    const hadFever = this.isFeverMode;
    this.comboCount = 0;
    this.timer = 0;
    this.isFeverMode = false;

    if (hadFever) {
      this.handlers.onFeverExit?.();
    }
    this.handlers.onComboReset?.();
  }

  public getMultiplier(): number {
    if (this.comboCount <= 1) return 1.0;
    if (this.comboCount === 2) return 1.5;
    if (this.comboCount === 3) return 2.0;
    if (this.comboCount === 4) return 2.5;
    return 3.5; // FEVER mode
  }

  public getCombo(): number {
    return this.comboCount;
  }

  public getMaxCombo(): number {
    return this.maxCombo;
  }

  public isFever(): boolean {
    return this.isFeverMode;
  }

  public getTimerProgress(): number {
    if (this.comboCount === 0) return 0;
    return Math.max(0, this.timer / this.comboWindow);
  }
}
