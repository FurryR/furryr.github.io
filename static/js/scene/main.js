import { AnimationElement, Elements } from '/static/js/util/animation.js'

import { Scene } from '/static/js/scene.js'
import { Route } from '/static/js/route.js'
import { Effect } from '/static/js/effect.js'

const css = `
.blog-main-intro {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
`

export class MainScene extends Scene {
  constructor(main, sidebar, configuration) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
  }

  async new(Animations, fromScene) {
    this.effect.use(() => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
      return () => style.remove()
    })
    if (fromScene) {
      await Scene.Transitions.loading(
        Animations,
        fromScene,
        this.main,
        this.sidebar
      )
    }
    let configuration
    try {
      configuration = await this.configuration
    } catch {
      return
    }
    const mainContent = configuration.mainContent.cloneNode(true)
    const sideContent = configuration.sideContent.cloneNode(true)
    // 只添加子元素
    const mainLoadingIcon = new AnimationElement(
      this.main.querySelector('.loading-icon')
    )
    await Animations.fadeout(mainLoadingIcon, 200)
    mainLoadingIcon.element.remove()
    if (!fromScene) {
      let introTitle
      const introContainer = Elements.div([
        (introTitle = Elements.h1().content('In memory of')),
        Elements.p().content('nullqwertyuiop')
      ])
        .class('blog-main-intro')
        .hide()
      this.main.appendChild(introContainer.element)
      await Animations.fadein(introContainer, 200)
      await Animations.wait(800)
      await Animations.fadeout(introTitle, 200)
      introTitle.content('谨以此纪念')
      await Animations.fadein(introTitle, 200)
      await Animations.wait(600)
      await Animations.fadeout(introContainer, 200)
      introContainer.element.remove()
    }
    await Animations.wait(200)
    for (const child of Array.from(mainContent.children)) {
      this.main.appendChild(child)
    }
    // TODO: 更完善的控件处理
    this.main.querySelectorAll('a').forEach(element => {
      if (new URL(element.href).origin === location.origin) {
        element.addEventListener('click', ev => Route.instance.handleAnchor(ev))
      }
    })
    await Animations.fadein(new AnimationElement(this.main), 200)
    const sidebarLoadingIcon = new AnimationElement(
      this.sidebar.querySelector('.loading-icon')
    )
    await Animations.fadeout(sidebarLoadingIcon, 200)
    sidebarLoadingIcon.element.remove()
    for (const child of Array.from(sideContent.children)) {
      this.sidebar.appendChild(child)
    }
    await Animations.fadein(new AnimationElement(this.sidebar), 200)
  }

  async dispose(Animations) {
    await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
    this.effect.dispose()
  }
}

export default function (dom) {
  const cached = dom.then(dom => {
    const mainContent = dom.querySelector('main')
    const sideContent = dom.querySelector('sidebar')
    mainContent.remove()
    sideContent.remove()
    return {
      mainContent,
      sideContent
    }
  })
  return (main, sidebar) => {
    return new MainScene(main, sidebar, cached)
  }
}
