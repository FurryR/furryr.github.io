import { withResolvers } from '/static/js/util/promise.ts'
import { scope } from '/static/js/util/animation.ts'
import type {
  RunningAnimationScope,
  SceneFactory,
  SceneModule
} from '/static/js/app-types.ts'
import type { Resolver } from '/static/js/util/promise.ts'
import type { Scene } from '/static/js/scene.ts'

export class Route {
  static Routes: Map<RegExp, () => Promise<SceneModule>> = new Map<
    RegExp,
    () => Promise<SceneModule>
  >([
    [/^\/(?:index\.html)?$/, () => import('/static/js/scene/main.tsx')],
    [/^\/about(?:\.html)?$/, () => import('/static/js/scene/about.tsx')],
    [/^\/archive(?:\.html)?$/, () => import('/static/js/scene/archive.tsx')],
    [/^\/friend(?:\.html)?$/, () => import('/static/js/scene/friend.tsx')],
    [/^\/posts\/.*(?:\.html)?$/, () => import('/static/js/scene/blog.tsx')]
  ])
  static instance: Route
  current: Scene
  currentAnimation: RunningAnimationScope | null
  currentRequest: Resolver<Document> | null

  constructor(firstScene: Scene) {
    this.current = firstScene
    this.currentAnimation = null
    this.currentRequest = null
  }
  async to(sceneFn: SceneFactory, previousRequest: Resolver<Document> | null) {
    const src = this.current
    const dest = sceneFn(src.main, src.sidebar)
    const currentAnimation = this.currentAnimation
    this.current = dest
    if (previousRequest) {
      previousRequest.reject(new Error('Cancelled'))
    }
    if (currentAnimation) {
      currentAnimation.abort()
      await currentAnimation.promise
    }
    this.currentAnimation = scope(async Animations => {
      await dest.new(Animations, src)
      this.currentAnimation = null
    })
    await this.currentAnimation.promise
  }

  static async parse(
    domPromise: Promise<Document>,
    url: string
  ): Promise<SceneFactory> {
    for (const [k, v] of Route.Routes.entries()) {
      if (k.test(url)) {
        const fn = await v()
        return fn.default(domPromise)
      }
    }
    throw new Error('No matching route found')
  }

  async handleURL(url: string) {
    window.history.pushState({ document: null }, '', url)
    const previousRequest = this.currentRequest
    const currentRequest = (this.currentRequest = withResolvers<Document>())
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

  async handleCache(url: string, dom: Document | null) {
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
  handleAnchor(ev: MouseEvent) {
    ev.preventDefault()
    const href = (ev.currentTarget as HTMLAnchorElement).getAttribute('href')
    if (!href) return
    return this.handleURL(href)
  }
}
