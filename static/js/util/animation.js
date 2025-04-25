/**
 * @typedef { Promise<void> | { abort: () => void }} AbortableAnimation
 */

/**
 * @template {HTMLElement} T
 */
export class AnimationElement {
  /**
   *
   * @param {T} elem
   */
  constructor(elem) {
    this.element = elem
  }

  /**
   *
   * @param {AnimationElement[]?} elems
   */
  child(elems) {
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
  /**
   *
   * @param {string} text
   */
  content(text) {
    this.element.textContent = text
    return this
  }
  /**
   *
   * @template {keyof T} KeyT
   * @param {KeyT} key
   * @param {T[KeyT]} value
   */
  with(key, value) {
    this.element[key] = value
    return this
  }
  /**
   *
   * @param {string} className
   */
  class(className) {
    this.element.className = className
    return this
  }
  /**
   *
   * @template {keyof CSSStyleDeclaration} T
   * @param {T} key
   * @param {CSSStyleDeclaration[T]} value
   */
  style(key, value) {
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
  div(child) {
    return new AnimationElement(document.createElement('div')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  header(child) {
    return new AnimationElement(document.createElement('header')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  footer(child) {
    return new AnimationElement(document.createElement('footer')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  nav(child) {
    return new AnimationElement(document.createElement('nav')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLUListElement>}
   */
  ul(child) {
    return new AnimationElement(document.createElement('ul')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLLIElement>}
   */
  li(child) {
    return new AnimationElement(document.createElement('li')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLAnchorElement>}
   */
  a(child) {
    return new AnimationElement(document.createElement('a')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLSpanElement>}
   */
  span(child) {
    return new AnimationElement(document.createElement('span')).child(child)
  },

  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLImageElement>}
   */
  img(child) {
    return new AnimationElement(document.createElement('img')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLParagraphElement>}
   */
  p(child) {
    return new AnimationElement(document.createElement('p')).child(child)
  },
  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h1(child) {
    return new AnimationElement(document.createElement('h1')).child(child)
  },
  /**
   *
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLHeadingElement>}
   */
  h3(child) {
    return new AnimationElement(document.createElement('h3')).child(child)
  },

  /**
   * @param {AnimationElement[]?} child
   * @returns {AnimationElement<HTMLElement>}
   */
  main(child) {
    return new AnimationElement(document.createElement('main')).child(child)
  },

  /**
   *
   * @returns {AnimationElement<HTMLHRElement>}
   */
  hr() {
    return new AnimationElement(document.createElement('hr'))
  },

  input() {
    return new AnimationElement(document.createElement('input'))
  }
}

export function scope(fn) {
  let skipped = false
  let runningAnimations = []
  const preprocess = callback => {
    return function (...args) {
      if (skipped) return Promise.resolve()
      return callback(...args)
    }
  }
  const animate = preprocess((elem, keyframes, options) => {
    const animation = elem.element.animate(keyframes, options)

    return new Promise(resolve => {
      animation.addEventListener('finish', () => {
        runningAnimations = runningAnimations.filter(a => a !== animation)
        resolve()
      })
      runningAnimations.push(() => {
        animation.cancel()
        resolve()
      })
    })
  })

  const wait = preprocess(ms => {
    return new Promise(resolve => {
      runningAnimations.push(resolve)
      const end = performance.now() + ms
      requestAnimationFrame(function handle(timestamp) {
        if (skipped || timestamp >= end) {
          runningAnimations = runningAnimations.filter(a => a !== resolve)
          resolve()
        } else {
          requestAnimationFrame(handle)
        }
      })
    })
  })

  const fadein = preprocess((elem, duration, easing = 'ease-out') => {
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
  })

  const fadeout = preprocess((elem, duration, easing = 'ease-out') => {
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
  })

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
