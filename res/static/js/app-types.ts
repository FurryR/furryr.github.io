import type {
  AnimationElement,
  AnimationRunner,
  AnimationScope
} from './util/animation.ts'
import type { Resolver } from './util/promise.ts'

export type PostData = {
  name: string
  author: string
  time: string
  category: string
  tag: string
  url: string
}

export type LoadingIcons = {
  main: AnimationElement
  sidebar: AnimationElement
}

export type SceneConfiguration<T> = Promise<T>

export type SceneFactory = (
  main: HTMLDivElement,
  sidebar: HTMLDivElement
) => import('./scene.ts').Scene

export type SceneModule = {
  default: (dom: Promise<Document>) => SceneFactory
}

export type TransitionContext = {
  postElement: HTMLElement
  postTitle: HTMLElement
  metadata: HTMLElement
  loadingIcons: LoadingIcons
  transitionReady: Resolver<void>
  postData: Omit<PostData, 'url'>
}

export type AnimationContext = AnimationRunner
export type RunningAnimationScope = AnimationScope
