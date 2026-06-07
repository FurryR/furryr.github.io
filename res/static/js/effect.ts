export class Effect {
  effects: Array<() => void>

  constructor() {
    this.effects = []
  }
  use(fn: () => void | (() => void)) {
    const dispose = fn()
    if (dispose) this.effects.push(dispose)
  }
  dispose() {
    for (const effect of this.effects) {
      effect()
    }
  }
}
