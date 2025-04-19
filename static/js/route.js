import { withResolvers } from '/static/js/util/promise.js'
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
    this.currentRequest = null
  }
  async to(sceneFn, previousRequest) {
    const src = this.current
    const dest = sceneFn(src.main, src.sidebar)
    const currentAnimation = this.currentAnimation
    this.current = dest
    if (previousRequest) {
      previousRequest.reject(new Error('Cancelled'))
    }
    if (currentAnimation) {
      currentAnimation.skip()
      await currentAnimation.promise
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
    const previousRequest = this.currentRequest
    const currentRequest = (this.currentRequest = withResolvers())
    fetch(url)
      .then(req => req.text())
      .then(text => {
        if (window.location.pathname === url) {
          window.history.replaceState({ document: text }, '', url)
        }
        const dom = new DOMParser().parseFromString(text, 'text/html')
        if (this.currentRequest === currentRequest) {
          this.currentRequest = null
        }
        currentRequest.resolve(dom)
      })
    return this.to(
      await Route.parse(currentRequest.promise, url),
      previousRequest
    )
  }

  async handleCache(url, dom) {
    if (dom) {
      const currentRequest = this.currentRequest
      this.currentRequest = null
      return this.to(
        await Route.parse(Promise.resolve(dom), url),
        currentRequest
      )
    }
    return this.handleURL(url)
  }

  /**
   *
   * @param {MouseEvent} ev
   */
  handleAnchor(ev) {
    ev.preventDefault()
    const href = ev.target.getAttribute('href')
    if (!href) return
    return this.handleURL(href)
  }
}
