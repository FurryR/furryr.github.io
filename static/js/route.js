import { scope } from '/static/js/util/animation.js'

export class Route {
  /** @type {Map<RegExp, any>} */
  static Routes = new Map([
    [/^\/(?:index.html)?$/, () => import('/static/js/scene/main.js')],
    [/^\/posts\/.*\.html$/, () => import('/static/js/scene/blog.js')]
  ])
  static instance = null
  constructor(firstScene) {
    this.current = firstScene
    this.currentAnimation = null
    this.handlingAnchor = false
  }
  async to(sceneFn) {
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

  static async parse(domPromise, url) {
    for (const [k, v] of Route.Routes.entries()) {
      if (k.test(url)) {
        const fn = await v()
        return fn.default(domPromise)
      }
    }
    throw new Error('No matching route found')
  }

  async handleURL(url) {
    window.history.pushState({ document: null }, '', url)
    return this.to(
      await Route.parse(
        fetch(url)
          .then(req => req.text())
          .then(text => {
            if (window.location.pathname === url) {
              window.history.replaceState({ document: text }, '', url)
            }
            const dom = new DOMParser().parseFromString(text, 'text/html')
            return dom
          }),
        url
      )
    )
  }

  async handleCache(url, dom) {
    if (dom) return this.to(await Route.parse(Promise.resolve(dom), url))
    return this.handleURL(url)
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
