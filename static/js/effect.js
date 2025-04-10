export class Effect {
  constructor() {
    this.effects = []
  }
  use(fn) {
    this.effects.push(fn())
  }
  dispose() {
    for (const effect of this.effects) {
      effect()
    }
  }
}
