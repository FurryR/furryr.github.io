import { scope } from '/static/js/util/animation.js'

export class Route {
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
      await dest.constructor.transition(Animations, src, src.main, src.sidebar)
      await dest.new(Animations)
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
      await dest.constructor.transition(Animations, src, src.main, src.sidebar)
      await dest.new(Animations)
      this.currentAnimation = null
    })
    await this.currentAnimation.promise
  }
  static async parse(dom) {
    const blog = dom.querySelector('blog')
    if (!blog) {
      // Panic.
      throw new Error('Unable to find blog metadata. Aborting.')
    }
    const route = blog.querySelector('route')?.textContent ?? 'default'
    const sceneFn = (await import(`/static/js/scene/${route}.js`)).default(dom)
    blog.remove()
    return sceneFn
    // if (!route) {
    //   const title = dom.title
    //   const author = JSON.parse(blog.querySelector('author').textContent)
    //   const time = new Date(blog.querySelector('time').textContent)
    //   const category = blog.querySelector('category').textContent
    //   const tags = JSON.parse(blog.querySelector('tag').textContent)
    //   blog.remove()
    //   const article = dom.querySelector('article')
    //   article.remove()
    //   return (main, sidebar) => {
    //     return new BlogScene(main, sidebar, article, {
    //       title,
    //       author,
    //       time,
    //       category,
    //       tags
    //     })
    //   }
    // } else {
    //   // TODO: index
    //   const r = route.textContent
    //   blog.remove()
    //   if (!Route.routes[r]) throw new Error('Route not found')
    //   return Route.routes[r](dom)
    // }
  }
  static async parseURL(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const text = await response.text()
    const dom = new DOMParser().parseFromString(text, 'text/html')
    const scene = await Route.parse(dom)
    return scene
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
        await dest.constructor.transition(
          Animations,
          src,
          src.main,
          src.sidebar
        )
        await dest.new(Animations)
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
