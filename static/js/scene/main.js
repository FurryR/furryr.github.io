import { AnimationElement } from '/static/js/util/animation.js'

import { Scene } from '/static/js/scene.js'
import { Route } from '/static/js/route.js'

export class MainScene extends Scene {
  constructor(main, sidebar, configuration) {
    super(main, sidebar)
    this.configuration = configuration
  }

  static async transition(Animations, src, main, sidebar) {
    await Scene.Transitions.loading(Animations, src, main, sidebar)
  }

  async new(Animations) {
    const mainContent = this.configuration.mainContent.cloneNode(true)
    const sideContent = this.configuration.sideContent.cloneNode(true)
    // 只添加子元素
    const mainLoadingIcon = new AnimationElement(
      this.main.querySelector('.loading-icon')
    )
    await Animations.fadeout(mainLoadingIcon, 200)
    mainLoadingIcon.element.remove()
    for (const child of Array.from(mainContent.children)) {
      this.main.appendChild(child)
    }
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
  }
}

export default function (dom) {
  const mainContent = dom.querySelector('main')
  const sideContent = dom.querySelector('sidebar')
  mainContent.remove()
  sideContent.remove()
  const cached = {
    mainContent,
    sideContent
  }
  return (main, sidebar) => {
    return new MainScene(main, sidebar, cached)
  }
}
