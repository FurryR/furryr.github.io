import { AnimationElement, Elements } from '/static/js/util/animation.ts'
import type { AnimationContext } from '/static/js/app-types.ts'

/**
 * Abstract class for scene (aka page)
 */
export class Scene {
  main: HTMLDivElement
  sidebar: HTMLDivElement

  static Transitions = {
    async loading(
      Animations: AnimationContext,
      main: HTMLElement,
      sidebar: HTMLElement
    ) {
      let mainLoadingIcon: AnimationElement,
        sidebarLoadingIcon: AnimationElement
      const reuseMainLoadingIcon =
          main.children.length === 1 &&
          main.firstElementChild?.classList.contains('loading-icon'),
        reuseSidebarLoadingIcon =
          sidebar.children.length === 1 &&
          sidebar.firstElementChild?.classList.contains('loading-icon')
      if (reuseMainLoadingIcon) {
        mainLoadingIcon = new AnimationElement(
          main.firstElementChild as HTMLElement
        )
      } else {
        mainLoadingIcon = Elements.div().class('loading-icon').hide()
        main.appendChild(mainLoadingIcon.element)
      }
      if (reuseSidebarLoadingIcon) {
        sidebarLoadingIcon = new AnimationElement(
          sidebar.firstElementChild as HTMLElement
        )
      } else {
        sidebarLoadingIcon = Elements.div().class('loading-icon').hide()
        sidebar.appendChild(sidebarLoadingIcon.element)
      }
      await Animations.wait(200)

      if (!reuseMainLoadingIcon) Animations.fadein(mainLoadingIcon, 200)
      if (!reuseSidebarLoadingIcon) Animations.fadein(sidebarLoadingIcon, 200)

      return { main: mainLoadingIcon, sidebar: sidebarLoadingIcon }
    }
  }
  static Disposes = {
    async foldAndFadeout(
      Animations: AnimationContext,
      main: HTMLElement,
      sidebar: HTMLElement
    ) {
      async function fx(elem: HTMLElement) {
        const enforced = new AnimationElement(elem)
        enforced.style('lineHeight', '0')
        await Animations.animate(
          enforced,
          [
            {
              lineHeight: '0.9em',
              opacity: 1
            },
            {
              lineHeight: '0em',
              opacity: 0
            }
          ],
          {
            duration: 300,
            easing: 'cubic-bezier(0, 1.04, 0.96, 0.98)'
          }
        )
        enforced.style('lineHeight', '')
      }
      await Promise.all([fx(main), fx(sidebar)])
      while (main.firstChild) {
        main.removeChild(main.firstChild)
      }
      while (sidebar.firstChild) {
        sidebar.removeChild(sidebar.firstChild)
      }
    }
  }
  constructor(main: HTMLDivElement, sidebar: HTMLDivElement) {
    this.main = main
    this.sidebar = sidebar
  }

  async new(_scope: AnimationContext, _fromScene: Scene | null) {
    throw new Error('Not implemented')
  }

  dispose(): Promise<void> | void {
    throw new Error('Not implemented')
  }
}
