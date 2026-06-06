import type { AnimationElement } from './util/animation.ts'

export type JsxChild =
  | AnimationElement<Element>
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
export type JsxChildren = JsxChild | JsxChildren[]

export interface JsxRuntime {
  Fragment: symbol
  jsx(
    type: string | symbol | ((props: Record<string, unknown>) => JsxChildren),
    props: Record<string, unknown> | null,
    ...children: JsxChildren[]
  ): unknown
}

declare global {
  interface Window {
    Fragment: JsxRuntime['Fragment']
    Route: unknown
    jsx: JsxRuntime['jsx']
  }

  namespace JSX {
    type Element = AnimationElement<HTMLElement>
    interface IntrinsicElements {
      [tagName: string]: Record<string, unknown>
    }
  }
}
