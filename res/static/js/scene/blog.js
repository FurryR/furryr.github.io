import { AnimationElement, Elements } from '/static/js/util/animation.js'

import { withResolvers } from '/static/js/util/promise.js'

import { Scene } from '/static/js/scene.js'
import { Effect } from '/static/js/effect.js'

const css = `
@import url('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/default.min.css');
.blog-post-split {
  border: none;
  box-shadow: 0 1px 0 0 black;
  color: black;
  overflow: visible;
  text-align: center;
  height: 5px;
}

.blog-post-split::after {
  background-color: var(--blog-background);
  content: '§';
  padding: 0 4px;
  position: relative;
  top: -3px;
}

.blog-post-metadata {
  margin-bottom: 1.5em;
}

.blog-post-title {
  font-size: 2em;
}

.blog-post-author,
.blog-post-time,
.blog-post-category,
.blog-post-tag {
  font-size: 0.8em;
  color: gray;
  margin: 0;
  margin-right: 1em;
  font-style: italic;
}

.blog-post-author-etc {
  font-size: 0.5em;
  margin-left: 5px;
}

.blog-post-author::before {
  content: url('/static/res/icons/blog-author.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}
.blog-post-time::before {
  content: url('/static/res/icons/blog-time.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}
.blog-post-category::before {
  content: url('/static/res/icons/blog-category.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}
.blog-post-tag::before {
  content: url('/static/res/icons/blog-tag.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}

/** Catalog */

.blog-catalog-title {
  font-size: 1.5em;
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  margin-bottom: 0.5em;
}

.blog-catalog-list {
  list-style-type: none;
  overflow-y: scroll;
  -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  height: 80%;
  padding: 0;
  margin: 0;
}
.blog-catalog-list::-webkit-scrollbar {
  display: none; /* Hide scrollbar for WebKit browsers */
}

.blog-catalog-item-h1 {
  text-decoration: none;
  margin: 0;
  color: rgb(50, 50, 50);
  transition: transform 0.25s ease-out;
}

.blog-catalog-item-h2 {
  text-decoration: none;
  margin-left: 10px;
  color: rgb(125, 125, 125);
}

.blog-catalog-item-h3 {
  text-decoration: none;
  margin-left: 20px;
  color: rgb(175, 175, 175);
}

/** For utterances */
.utterances-placeholder {
  position: relative;
  margin-top: 2em;
}

@media (prefers-color-scheme: dark) {
  .utterances {
    filter: invert(1) hue-rotate(180deg);
  }
  .blog-post-split::after {
    color: white;
    filter: invert(1) hue-rotate(180deg);
  }
}
`

/**
 *
 * @param {HTMLElement} element
 * @returns {{element: HTMLElement; title: string; level: number}[]}
 */
function generateCatalog(element) {
  const catalog = []
  const headers = element.querySelectorAll('h1, h2, h3')
  for (const header of headers) {
    const title = header.textContent
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

  /**
   *
   * @param {HTMLDivElement} main
   * @param {HTMLDivElement} sidebar
   * @param {*} configuration
   */
  constructor(main, sidebar, configuration) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
  }

  async new(Animations, fromScene) {
    if (fromScene && fromScene.constructor.name !== 'ArchiveScene') {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    this.effect.use(() => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
      return () => style.remove()
    })

    // 检测是否来自 archive 场景的特殊过渡
    const isArchiveTransition =
      fromScene &&
      fromScene.constructor.name === 'ArchiveScene' &&
      fromScene.transitionContext
    const transitionContext = isArchiveTransition
      ? fromScene.transitionContext
      : null

    let loadingIcons
    let title, time, category, tag, author, metadata

    if (!isArchiveTransition) {
      // 标准过渡：显示 loading 图标
      loadingIcons = await Scene.Transitions.loading(
        Animations,
        this.main,
        this.sidebar
      )
    } else {
      // Archive 过渡：等待 archive 侧的动画完成
      await transitionContext.transitionReady.promise

      // 获取 archive 创建的 loading-icon（在 dispose 之前保存引用）
      // const loadingIconElement = transitionContext.loadingIcon
      // // 先将 loading-icon 从旧元素中移出，防止被 dispose 删除
      // if (loadingIconElement.parentNode) {
      //   loadingIconElement.parentNode.removeChild(loadingIconElement)
      // }

      // 直接淡出 loadingIcon

      const loadingIcon = new AnimationElement(transitionContext.loadingIcon)
      await Animations.fadeout(loadingIcon, 200)

      // 保存 postData 用于后续创建元素
      const postData = transitionContext.postData

      // 先销毁 fromScene（这会清空 main 和 sidebar）
      await fromScene.dispose()

      // dispose 之后再创建新元素
      const authors = postData.author.split(',').map(v => v.trim())

      author =
        authors.length > 1
          ? Elements.span([
              Elements.span().content(authors[0]),
              Elements.span().content('等').class('blog-post-author-etc')
            ])
              .class('blog-post-author')
              .with('title', authors.join('、'))
          : Elements.span().content(authors[0]).class('blog-post-author')

      metadata = Elements.div([
        (title = Elements.h1().content(postData.name).class('blog-post-title')),
        author,
        (time = Elements.span().content(postData.time).class('blog-post-time')),
        (category = Elements.span()
          .content(postData.category)
          .class('blog-post-category')),
        (tag = Elements.span().content(postData.tag).class('blog-post-tag'))
      ]).class('blog-post-metadata')

      // 添加新的 metadata 到 main
      this.main.appendChild(metadata.element)
    }

    let configuration
    try {
      configuration = await this.configuration
    } catch {
      return
    }
    document.title = configuration.title

    const article = configuration.article.cloneNode(true)
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
    const dependency = import('/static/js/component/utterances.js').then(
      v => v.default
    )
    const catalog = generateCatalog(article)

    // 如果不是 archive 过渡，则从配置创建 metadata
    if (!isArchiveTransition) {
      author =
        configuration.author.length > 1
          ? Elements.span([
              Elements.span().content(configuration.author[0]),
              Elements.span().content('等').class('blog-post-author-etc')
            ])
              .class('blog-post-author')
              .with('title', configuration.author.join('、'))
              .hide()
          : Elements.span()
              .content(configuration.author[0])
              .class('blog-post-author')
              .hide()

      metadata = Elements.div([
        (title = Elements.h1()
          .content(configuration.title)
          .class('blog-post-title')
          .hide()),
        author,
        (time = Elements.span()
          .content(configuration.time.toISOString())
          .class('blog-post-time')
          .hide()),
        (category = Elements.span()
          .content(configuration.category)
          .class('blog-post-category')
          .hide()),
        (tag = Elements.span()
          .content(configuration.tags.join(' '))
          .class('blog-post-tag')
          .hide())
      ]).class('blog-post-metadata')

      this.main.appendChild(metadata.element)
    }

    const articleElementAnimation = withResolvers()
    const splitElementAnimation = withResolvers()
    const articleElement = new AnimationElement(article).hide()
    this.main.appendChild(article)
    const split = Elements.hr().class('blog-post-split').hide()
    this.main.appendChild(split.element)
    const utterancesPlaceholder = Elements.div([
      Elements.div().class('loading-icon')
    ])
      .class('utterances-placeholder')
      .hide()
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
        const receiver = async event => {
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
            await Animations.fadein(iframe, 200)
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
      const title = Elements.h3()
        .content('目录')
        .class('blog-catalog-title')
        .hide()
      const catalogs = []
      const catalogList = Elements.ul().class('blog-catalog-list').hide()
      for (const item of catalog) {
        let a = Elements.a()
          .content(item.title)
          .with('href', '#')
          .class(`blog-catalog-item-h${item.level}`)
        const catalogItem = Elements.li([a])
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
      catalogList.child(catalogs)
      this.sidebar.appendChild(title.element)
      this.sidebar.appendChild(catalogList.element)

      if (!isArchiveTransition) {
        // 标准过渡：显示 loading 然后淡入
        await Animations.fadeout(loadingIcons.sidebar, 200)
        loadingIcons.sidebar.element.remove()
        await Animations.wait(200)
        await Animations.fadein(title, 200)
        await Animations.wait(200)
        await Animations.fadein(catalogList, 200)
      } else {
        // Archive 过渡：直接显示侧边栏内容
        title.show()
        catalogList.show()
      }
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

  async dispose() {
    this.effect.dispose()
  }
}

export default function (dom) {
  const cached = dom.then(dom => {
    const blog = dom.querySelector('blog')
    const article = dom.querySelector('article')
    article.remove()
    return {
      title: dom.title,
      author: blog
        .querySelector('author')
        .textContent.split(',')
        .map(v => v.trim()),
      time: new Date(blog.querySelector('time').textContent),
      category: blog.querySelector('category').textContent,
      tags: blog.querySelector('tag').textContent.split(' '),
      article
    }
  })
  return (main, sidebar) => {
    return new BlogScene(main, sidebar, cached)
  }
}
