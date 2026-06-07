export type AnimationRunner = {
  animate(
    elem: AnimationElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options: number | KeyframeAnimationOptions
  ): Promise<void>
  wait(ms: number): Promise<void>
  fadein(
    elem: AnimationElement,
    duration: number,
    easing?: string
  ): Promise<void>
  fadeout(
    elem: AnimationElement,
    duration: number,
    easing?: string
  ): Promise<void>
}

export type AnimationScope = {
  promise: Promise<void>
  skip(): void
  readonly skipped: boolean
}

type AnimationAbort = () => void

export class AnimationElement<T extends HTMLElement = HTMLElement> {
  element: T

  /**
   *
   * @param {T} elem
   */
  constructor(elem: T) {
    this.element = elem
  }

  child(elems?: AnimationElement[]) {
    if (!elems) return this
    for (const elem of elems) {
      this.element.appendChild(elem.element)
    }
    return this
  }

  hide() {
    return this.style('visibility', 'hidden')
  }

  show() {
    return this.style('visibility', '')
  }
  content(text: string) {
    this.element.textContent = text
    return this
  }
  with<KeyT extends keyof T>(key: KeyT, value: T[KeyT]) {
    this.element[key] = value
    return this
  }
  class(className: string) {
    this.element.className = className
    return this
  }
  style<KeyT extends keyof CSSStyleDeclaration>(
    key: KeyT,
    value: CSSStyleDeclaration[KeyT]
  ) {
    this.element.style[key] = value
    return this
  }
  /**
   *
   * @param {Keyframe[] | PropertyIndexedKeyframes | null} keyframes
   * @param {number | KeyframeAnimationOptions} options
   * @returns {AbortableAnimation}
   */
  // animate(keyframes, options) {
  //   const animation = this.element.animate(keyframes, options)
  //   let resolveFn
  //   return Object.assign(
  //     new Promise(resolve => {
  //       resolveFn = resolve
  //       animation.addEventListener('finish', () => resolve())
  //     }),
  //     {
  //       abort: () => {
  //         animation.cancel()
  //         resolveFn()
  //       }
  //     }
  //   )
  // }
}

export const Elements = {
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLDivElement>}
   */
  div(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('div')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  header(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('header')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  footer(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('footer')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  nav(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('nav')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLUListElement>}
   */
  ul(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('ul')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLLIElement>}
   */
  li(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('li')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLAnchorElement>}
   */
  a(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('a')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLSpanElement>}
   */
  span(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('span')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLImageElement>}
   */
  img(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('img')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLParagraphElement>}
   */
  p(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('p')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h1(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('h1')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h2(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('h2')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h3(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('h3')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h4(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('h4')).child(child)
  },

  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  main(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('main')).child(child)
  },

  /**
   *
   * @returns {AnimationElement<HTMLHRElement>}
   */
  hr() {
    return new AnimationElement(document.createElement('hr'))
  },

  /**
   * @returns {AnimationElement<HTMLInputElement>}
   */
  input() {
    return new AnimationElement(document.createElement('input'))
  },

  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLLabelElement>}
   */
  label(child?: AnimationElement[]) {
    return new AnimationElement(document.createElement('label')).child(child)
  }
}

export function scope(
  fn: (Animations: AnimationRunner) => Promise<void>
): AnimationScope {
  let skipped = false
  let runningAnimations: AnimationAbort[] = []
  const animate: AnimationRunner['animate'] = (elem, keyframes, options) => {
    if (skipped) return Promise.resolve()
    const animation = elem.element.animate(keyframes, options)

    return new Promise<void>(resolve => {
      const abort = () => {
        animation.cancel()
        resolve()
      }
      animation.addEventListener('finish', () => {
        runningAnimations = runningAnimations.filter(a => a !== abort)
        resolve()
      })
      runningAnimations.push(abort)
    })
  }

  const wait: AnimationRunner['wait'] = ms => {
    if (skipped) return Promise.resolve()
    return new Promise<void>(resolve => {
      const abort = resolve
      runningAnimations.push(abort)
      const end = performance.now() + ms
      requestAnimationFrame(function handle(timestamp) {
        if (skipped || timestamp >= end) {
          runningAnimations = runningAnimations.filter(a => a !== abort)
          resolve()
        } else {
          requestAnimationFrame(handle)
        }
      })
    })
  }

  const fadein: AnimationRunner['fadein'] = (
    elem,
    duration,
    easing = 'ease-out'
  ) => {
    if (skipped) return Promise.resolve()
    elem.show()
    return animate(
      elem,
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        easing,
        duration
      }
    )
  }

  const fadeout: AnimationRunner['fadeout'] = (
    elem,
    duration,
    easing = 'ease-out'
  ) => {
    if (skipped) return Promise.resolve()
    return animate(
      elem,
      [
        {
          opacity: 1
        },
        {
          opacity: 0
        }
      ],
      {
        easing,
        duration
      }
    )
  }

  const obj = {
    animate,
    wait,
    fadein,
    fadeout
  }
  const promise = fn(obj)
  return {
    promise,
    skip() {
      skipped = true
      for (const abort of runningAnimations) {
        abort()
      }
      runningAnimations = []
    },
    get skipped() {
      return skipped
    }
  }
}
