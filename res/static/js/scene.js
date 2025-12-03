import { AnimationElement, Elements } from '/static/js/util/animation.js'

/**
 * Abstract class for scene (aka page)
 */
export class Scene {
  static Transitions = {
    /**
     *
     * @param {Scene} Animations
     * @param {HTMLElement} main
     * @param {HTMLElement} sidebar
     */
    async loading(Animations, main, sidebar) {
      let mainLoadingIcon, sidebarLoadingIcon
      let reuseMainLoadingIcon =
          main.children.length === 1 &&
          main.firstElementChild.classList.contains('loading-icon'),
        reuseSidebarLoadingIcon =
          sidebar.children.length === 1 &&
          sidebar.firstElementChild.classList.contains('loading-icon')
      if (reuseMainLoadingIcon) {
        mainLoadingIcon = new AnimationElement(main.firstElementChild)
      } else {
        mainLoadingIcon = Elements.div().class('loading-icon').hide()
        main.appendChild(mainLoadingIcon.element)
      }
      if (reuseSidebarLoadingIcon) {
        sidebarLoadingIcon = new AnimationElement(sidebar.firstElementChild)
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
  /**
   * @returns {Promise<void> | void}
   */
  dispose() {
    throw new Error('Not implemented')
  }
}
