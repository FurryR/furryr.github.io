import { AnimationElement } from '/static/js/util/animation.ts'
import type { JsxChildren, JsxRuntime } from '/static/js/types.d.ts'

const Fragment = Symbol('Fragment')

function appendChild(element: Element, child: JsxChildren): void {
  if (Array.isArray(child)) {
    for (const item of child) appendChild(element, item)
  } else if (child instanceof AnimationElement) {
    element.appendChild(child.element)
  } else if (child instanceof Node) {
    element.appendChild(child)
  } else if (
    child !== null &&
    child !== undefined &&
    child !== false &&
    child !== true
  ) {
    element.appendChild(document.createTextNode(String(child)))
  }
}

function setProp(element: HTMLElement, key: string, value: unknown): void {
  if (
    key === 'children' ||
    value === null ||
    value === undefined ||
    value === false
  )
    return
  if (key === 'class' || key === 'className') {
    element.className = String(value)
  } else if (key === 'style' && value && typeof value === 'object') {
    Object.assign(element.style, value)
  } else if (key === 'hide' && value) {
    element.style.visibility = 'hidden'
  } else if (key.startsWith('on') && typeof value === 'function') {
    element.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
  } else if (key in element) {
    ;(element as unknown as Record<string, unknown>)[key] =
      value === true ? '' : value
  } else if (value === true) {
    element.setAttribute(key, '')
  } else {
    element.setAttribute(key, String(value))
  }
}

const jsx: JsxRuntime['jsx'] = (type, props, ...children) => {
  if (typeof type === 'function') return type({ ...props, children })
  if (type === Fragment) return children

  const element = document.createElement(String(type))
  for (const [key, value] of Object.entries(props ?? {}))
    setProp(element, key, value)
  appendChild(
    element,
    children.length > 0 ? children : (props?.children as JsxChildren)
  )
  return new AnimationElement(element)
}

window.Fragment = Fragment
window.jsx = jsx
