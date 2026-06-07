import { AnimationElement } from '/static/js/util/animation.ts'

import { withResolvers } from '/static/js/util/promise.ts'

import { Scene } from '/static/js/scene.ts'
import { Effect } from '/static/js/effect.ts'
import type {
  AnimationContext,
  LoadingIcons,
  TransitionContext
} from '/static/js/app-types.ts'

type BlogConfiguration = {
  title: string
  author: string[]
  time: Date
  category: string
  tags: string[]
  article: HTMLElement
}

/**
 *
 * @param {HTMLElement} element
 * @returns {{element: HTMLElement; title: string; level: number}[]}
 */
function generateCatalog(element: HTMLElement) {
  const catalog: Array<{ element: Element; title: string; level: number }> = []
  const headers = element.querySelectorAll('h1, h2, h3')
  for (const header of headers) {
    const title = header.textContent ?? ''
    const level = parseInt(header.tagName[1])
    catalog.push({
      element: header,
      title,
      level
    })
  }
  return catalog
}

export class BlogScene extends Scene {
  static name = 'BlogScene'
  configuration: Promise<BlogConfiguration>
  effect: Effect

  /**
   *
   * @param {HTMLDivElement} main
   * @param {HTMLDivElement} sidebar
   * @param {*} configuration
   */
  constructor(
    main: HTMLDivElement,
    sidebar: HTMLDivElement,
    configuration: Promise<BlogConfiguration>
  ) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
  }

  async new(Animations: AnimationContext, fromScene: Scene | null) {
    this.effect.use(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/scene/blog.css'
      document.head.appendChild(link)
      return () => link.remove()
    })

    // 检测是否来自 archive 场景的特殊过渡
    const isArchiveTransition =
      fromScene &&
      fromScene.constructor.name === 'ArchiveScene' &&
      (fromScene as Scene & { transitionContext?: TransitionContext })
        .transitionContext
    const transitionContext = isArchiveTransition
      ? (fromScene as Scene & { transitionContext: TransitionContext })
          .transitionContext
      : null

    if (fromScene && !isArchiveTransition) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    let loadingIcons: LoadingIcons

    if (!isArchiveTransition) {
      // 标准过渡：显示 loading 图标
      loadingIcons = await Scene.Transitions.loading(
        Animations,
        this.main,
        this.sidebar
      )
    } else {
      loadingIcons = transitionContext!.loadingIcons
      // Archive 过渡：等待 archive 侧的动画完成
      await transitionContext!.transitionReady.promise
    }

    let configuration
    try {
      configuration = await this.configuration
    } catch {
      return
    }

    if (isArchiveTransition) {
      // 直接淡出 loadingIcon

      await Animations.fadeout(transitionContext!.loadingIcons.main, 200)

      fromScene.dispose() // dispose() is always synchronous here

      // 再把 loadingIcon 加回 sidebar

      this.sidebar.appendChild(transitionContext!.loadingIcons.sidebar.element)
    }
    document.title = configuration.title

    const article = configuration.article.cloneNode(true) as HTMLElement
    const hljsDependency = import(
      'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/core.min.js'
    ).then(v => v.default)

    article.querySelectorAll('code').forEach(async elem => {
      const lang = elem.getAttribute('lang') ?? 'plaintext'
      const hljs = await hljsDependency
      if (!hljs.getLanguage(lang)) {
        const highlightFn = await import(
          `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/${lang}.min.js`
        ).then(v => v.default)
        hljs.registerLanguage(lang, highlightFn)
      }

      const highlighted = hljs.highlight(elem.textContent, { language: lang })
      const animation = new AnimationElement(elem)
      elem.innerHTML = highlighted.value
      await Animations.animate(
        animation,
        [
          {
            filter: 'grayscale(1)'
          },
          {
            filter: 'grayscale(0)'
          }
        ],
        {
          duration: 400,
          easing: 'ease-out'
        }
      )
    })
    const dependency = import('/static/js/component/utterances.ts').then(
      v => v.default
    )
    const catalog = generateCatalog(article)

    // 如果不是 archive 过渡，则从配置创建 metadata
    // if (!isArchiveTransition) {
    const author =
      configuration.author.length > 1 ? (
        <span
          class="blog-post-author"
          title={configuration.author.join('、')}
          hide
        >
          <span>{configuration.author[0]}</span>
          <span class="blog-post-author-etc">等</span>
        </span>
      ) : (
        <span class="blog-post-author" hide>
          {configuration.author[0]}
        </span>
      )
    const title = (
      <h1 class="blog-post-title" hide>
        {configuration.title}
      </h1>
    )
    const time = (
      <span class="blog-post-time" hide>
        {configuration.time.toISOString()}
      </span>
    )
    const category = (
      <span class="blog-post-category" hide>
        {configuration.category}
      </span>
    )
    const tag = (
      <span class="blog-post-tag" hide>
        {configuration.tags.join(' ')}
      </span>
    )

    const metadata = (
      <div class="blog-post-metadata">
        {title}
        {author}
        {time}
        {category}
        {tag}
      </div>
    )

    this.main.appendChild(metadata.element)
    // }
    if (isArchiveTransition) {
      // Archive 过渡：直接显示标题内容
      title.show()
      author.show()
      time.show()
      category.show()
      tag.show()
    }

    const articleElementAnimation = withResolvers<void>()
    const splitElementAnimation = withResolvers<void>()
    const articleElement = new AnimationElement(article).hide()
    this.main.appendChild(article)
    const split = <hr class="blog-post-split" hide />
    this.main.appendChild(split.element)
    const utterancesPlaceholder = (
      <div class="utterances-placeholder" hide>
        <div class="loading-icon" />
      </div>
    )
    this.main.appendChild(utterancesPlaceholder.element)
    const Utterances = await dependency
    this.effect.use(() => {
      const utterances = Utterances({
        repo: 'FurryR/furryr.github.io',
        'issue-term': 'pathname',
        theme: 'preferred-color-scheme'
      })
      utterances.element.style.visibility = 'hidden'
      /** @type {AnimationElement<HTMLIFrameElement>} */
      const iframe = new AnimationElement(
        utterances.element.querySelector('iframe')
      )
      this.effect.use(() => {
        const receiver = async (event: MessageEvent) => {
          const utterancesOrigin = 'https://utteranc.es'
          if (event.origin !== utterancesOrigin) {
            return
          }
          const data = event.data
          if (data && data.type === 'resize' && data.height) {
            window.removeEventListener('message', receiver)
            if (utterancesPlaceholder.element.style.visibility !== 'hidden') {
              await Animations.fadeout(utterancesPlaceholder, 200)
            }
            utterancesPlaceholder.element.remove()
            await articleElementAnimation.promise
            if (split.element.style.visibility === 'hidden')
              await Animations.fadein(split, 200)
            else await splitElementAnimation.promise
            utterances.element.style.visibility = ''
            await Animations.fadein(
              iframe as AnimationElement<HTMLIFrameElement>,
              200
            )
          }
        }
        window.addEventListener('message', receiver)
        return () => window.removeEventListener('message', receiver)
      })
      this.main.appendChild(utterances.element)
      return utterances.dispose
    })

    if (!isArchiveTransition) {
      // 标准过渡：显示标题动画
      // TODO: 等待 Utterances
      await Animations.fadeout(loadingIcons.main, 200)
      loadingIcons.main.element.remove()
      await Animations.fadein(title, 200)
      await Animations.wait(200)
      await Animations.fadein(author, 150)
      await Animations.fadein(time, 150)
      await Animations.fadein(category, 150)
      await Animations.fadein(tag, 150)
    }
    ;(async () => {
      const title = (
        <h3 class="blog-catalog-title" hide>
          目录
        </h3>
      )
      const catalogs = []
      const catalogList = <ul class="blog-catalog-list" hide />
      for (const item of catalog) {
        const a = (
          <a href="#" class={`blog-catalog-item-h${item.level}`}>
            {item.title}
          </a>
        )
        const catalogItem = <li>{a}</li>
        a.element.addEventListener('click', ev => {
          ev.preventDefault()
          item.element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        })
        catalogs.push(catalogItem)
      }
      if (catalogs.length === 0) {
        catalogs.push(<li class="blog-catalog-item-empty">(无目录项)</li>)
      }
      catalogList.child(catalogs)
      this.sidebar.appendChild(title.element)
      this.sidebar.appendChild(catalogList.element)

      await Animations.fadeout(loadingIcons.sidebar, 200)
      loadingIcons.sidebar.element.remove()
      await Animations.wait(200)
      await Animations.fadein(title, 200)
      await Animations.wait(200)
      await Animations.fadein(catalogList, 200)
    })()
    await Animations.wait(200)
    article.style.lineHeight = ''
    articleElement.show()
    await Animations.animate(
      articleElement,
      [
        {
          lineHeight: '0em',
          opacity: 0
        },
        {
          lineHeight: '1.7em',
          opacity: 1
        }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0, 1.04, 0.96, 0.98)'
      }
    )
    articleElementAnimation.resolve()

    if (split.element.style.visibility === 'hidden') {
      await Animations.fadein(split, 200)
      splitElementAnimation.resolve()
      await Animations.fadein(utterancesPlaceholder, 200)
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
    const blog = dom.querySelector('blog')
    const article = dom.querySelector<HTMLElement>('article')
    if (!blog || !article) throw new Error('Blog content missing')
    article.remove()
    return {
      title: dom.title,
      author: (blog.querySelector('author')?.textContent ?? '')
        .split(',')
        .map(v => v.trim()),
      time: new Date(blog.querySelector('time')?.textContent ?? ''),
      category: blog.querySelector('category')?.textContent ?? '',
      tags: (blog.querySelector('tag')?.textContent ?? '').split(' '),
      article
    }
  })
  return (main: HTMLDivElement, sidebar: HTMLDivElement) => {
    return new BlogScene(main, sidebar, cached)
  }
}
