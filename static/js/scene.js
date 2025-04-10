import { AnimationElement, Elements } from '/static/js/util/animation.js'

/**
 * Abstract class for scene (aka page)
 */
export class Scene {
  static Transitions = {
    async loading(Animations, src, main, sidebar) {
      if (src) await src.dispose(Animations)
      await Animations.wait(200)
      const mainLoadingIcon = Elements.div().class('loading-icon').hide()
      const sidebarLoadingIcon = Elements.div().class('loading-icon').hide()
      main.appendChild(mainLoadingIcon.element)
      sidebar.appendChild(sidebarLoadingIcon.element)
      await Animations.fadein(mainLoadingIcon, 200)
      await Animations.fadein(sidebarLoadingIcon, 200)
    }
  }
  static Disposes = {
    async foldAndFadeout(Animations, main, sidebar) {
      async function fx(elem) {
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
  /**
   *
   * @param {HTMLDivElement} main
   * @param {HTMLDivElement} sidebar
   */
  constructor(main, sidebar) {
    this.main = main
    this.sidebar = sidebar
  }

  async new(scope, fromScene) {
    throw new Error('Not implemented')
  }
  async dispose(scope) {
    throw new Error('Not implemented')
  }
}
