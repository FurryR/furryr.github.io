import { scope } from '/static/js/util/animation.js'

export class Route {
  /** @type {Map<RegExp, any>} */
  static Routes = new Map([
    [/^\/(?:index.html)?$/, () => import('/static/js/scene/main.js')],
    [/^\/posts\/.*\.html$/, () => import('/static/js/scene/blog.js')]
  ])
  static instance = null
  constructor(firstSceneFn, firstScene) {
    this.scenes = [firstSceneFn]
    this.position = 0
    this.current = firstScene
    this.currentAnimation = null
    this.handlingAnchor = false
  }
  /**
   *
   * @param {Scene} scene
   */
  async push(sceneFn) {
    this.scenes.length = ++this.position
    this.scenes.push(sceneFn)
    const src = this.current
    const dest = sceneFn(src.main, src.sidebar)
    this.current = dest
    if (this.currentAnimation) {
      this.currentAnimation.skip()
      await this.currentAnimation.promise
    }
    this.currentAnimation = scope(async Animations => {
      await dest.new(Animations, src)
      this.currentAnimation = null
    })
    await this.currentAnimation.promise
  }
  async pop() {
    if (this.scenes.length < 2) return
    const src = this.current
    const dest = this.scenes[--this.position](src.main, src.sidebar)
    this.current = dest
    if (this.currentAnimation) {
      this.currentAnimation.skip()
      await this.currentAnimation.promise
    }
    this.currentAnimation = scope(async Animations => {
      await dest.new(Animations, src)
      this.currentAnimation = null
    })
    await this.currentAnimation.promise
  }
  static async parse(domPromise, url) {
    for (const [k, v] of Route.Routes.entries()) {
      if (k.test(url)) {
        const fn = await v()
        return fn.default(domPromise)
      }
    }
    throw new Error('No matching route found')
  }
  static async parseURL(url) {
    return this.parse(
      fetch(url)
        .then(req => req.text())
        .then(text => {
          const dom = new DOMParser().parseFromString(text, 'text/html')
          return dom
        }),
      url
    )
  }
  async handleURL(url) {
    window.history.pushState({ position: this.scenes.length }, '', url)
    const scene = await Route.parseURL(url)
    this.push(scene)
  }

  async handleForward(url, position) {
    if (position < this.scenes.length) {
      this.position = position
      const src = this.current
      const dest = this.scenes[this.position](src.main, src.sidebar)
      this.current = dest
      if (this.currentAnimation) {
        this.currentAnimation.skip()
        await this.currentAnimation.promise
      }
      this.currentAnimation = scope(async Animations => {
        await dest.new(Animations, src)
        this.currentAnimation = null
      })
      await this.currentAnimation.promise
    } else {
      return this.handleURL(url)
    }
  }

  /**
   *
   * @param {MouseEvent} ev
   */
  handleAnchor(ev) {
    ev.preventDefault()
    if (this.handlingAnchor || this.current === null) return
    this.handlingAnchor = true
    const href = ev.target.getAttribute('href')
    if (!href) return
    return this.handleURL(href).then(() => {
      this.handlingAnchor = false
    })
  }
}
