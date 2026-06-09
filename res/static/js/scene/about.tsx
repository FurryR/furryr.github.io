import { AnimationElement } from '/static/js/util/animation.ts'

import { Scene } from '/static/js/scene.ts'
import { Route } from '/static/js/route.ts'
import { Effect } from '/static/js/effect.ts'
import type { AnimationContext } from '/static/js/app-types.ts'

type AboutConfiguration = {
  mainContent: HTMLElement
  sideContent: HTMLElement
}

export class AboutScene extends Scene {
  static name = 'AboutScene'
  configuration: Promise<AboutConfiguration>
  effect: Effect

  constructor(
    main: HTMLDivElement,
    sidebar: HTMLDivElement,
    configuration: Promise<AboutConfiguration>
  ) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
  }

  async new(Animations: AnimationContext, fromScene: Scene | null) {
    document.title = '关于我'
    if (fromScene) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    this.effect.use(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/scene/about.css'
      document.head.appendChild(link)
      return () => link.remove()
    })

    const loadingIcons = await Scene.Transitions.loading(
      Animations,
      this.main,
      this.sidebar
    )

    let configuration
    try {
      configuration = await this.configuration
    } catch {
      return
    }

    const mainContent = configuration.mainContent.cloneNode(true)
    const sideContent = configuration.sideContent.cloneNode(true)

    const layout = new AnimationElement(
      mainContent.querySelector('.blog-about-layout') as HTMLElement
    )
    const portrait = new AnimationElement(
      mainContent.querySelector('.blog-about-portrait') as HTMLElement
    )
    const title = new AnimationElement(
      mainContent.querySelector('.blog-about-title') as HTMLElement
    )
    const split = new AnimationElement(
      mainContent.querySelector('.blog-about-split') as HTMLElement
    )
    const bodyContent = new AnimationElement(
      mainContent.querySelector('.blog-about-main') as HTMLElement
    )
    const sidebarTitle = new AnimationElement(
      sideContent.querySelector('.blog-about-sidebar-title') as HTMLElement
    )
    const sidebarText = new AnimationElement(
      sideContent.querySelector('.blog-about-sidebar-text') as HTMLElement
    )
    const sidebarLink = sideContent.querySelector(
      '.blog-about-sidebar-link'
    ) as HTMLAnchorElement | null

    layout.hide()
    portrait.hide()
    title.hide()
    split.hide()
    bodyContent.hide()
    bodyContent.style('lineHeight', '0')
    sidebarTitle.hide()
    sidebarText.hide()
    if (sidebarLink) sidebarLink.style.visibility = 'hidden'

    this.main.appendChild(mainContent)
    this.sidebar.appendChild(sideContent)

    if (sidebarLink) {
      sidebarLink.addEventListener('click', ev => {
        if (
          new URL((ev.currentTarget as HTMLAnchorElement).href).origin ===
          location.origin
        ) {
          Route.instance.handleAnchor(ev)
        }
      })
    }

    await Animations.fadeout(loadingIcons.main, 200)
    loadingIcons.main.element.remove()
    await Animations.wait(100)
    await Animations.fadein(layout, 200)
    await Animations.fadein(portrait, 200)
    await Animations.fadein(title, 200)
    await Animations.fadein(split, 200)

    await Animations.fadeout(loadingIcons.sidebar, 200)
    loadingIcons.sidebar.element.remove()
    bodyContent.style('lineHeight', '')
    bodyContent.show()
    await Promise.all([
      Animations.animate(
        bodyContent,
        [
          { lineHeight: '0em', opacity: 0 },
          { lineHeight: '1em', opacity: 1 }
        ],
        {
          duration: 300,
          easing: 'cubic-bezier(0, 1.04, 0.96, 0.98)'
        }
      ),
      Animations.fadein(sidebarTitle, 200)
    ])
    await Animations.fadein(sidebarText, 150)
    if (sidebarLink) {
      sidebarLink.style.visibility = ''
      await Animations.fadein(new AnimationElement(sidebarLink), 150)
    }
  }

  dispose() {
    this.effect.dispose()
    while (this.main.firstChild) {
      this.main.removeChild(this.main.firstChild)
    }
    while (this.sidebar.firstChild) {
      this.sidebar.removeChild(this.sidebar.firstChild)
    }
  }
}

export default function (dom: Promise<Document>) {
  const cached = dom.then(dom => {
    const mainContent = dom.querySelector('main')
    const sideContent = dom.querySelector<HTMLElement>('sidebar')
    if (!mainContent || !sideContent)
      throw new Error('About scene content missing')
    mainContent.remove()
    sideContent.remove()
    return {
      mainContent,
      sideContent
    }
  })
  return (main: HTMLDivElement, sidebar: HTMLDivElement) => {
    return new AboutScene(main, sidebar, cached)
  }
}
