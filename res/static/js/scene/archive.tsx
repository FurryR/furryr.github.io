import { AnimationElement, scope } from '/static/js/util/animation.ts'
import { withResolvers } from '/static/js/util/promise.ts'

import { Scene } from '/static/js/scene.ts'
import { Route } from '/static/js/route.ts'
import { Effect } from '/static/js/effect.ts'
import type {
  AnimationContext,
  PostData,
  RunningAnimationScope,
  TransitionContext
} from '/static/js/app-types.ts'

type ArchiveConfiguration = {
  posts: PostData[]
}

type ArchiveFilters = {
  author: string
  category: string
  tag: string
}

export class ArchiveScene extends Scene {
  static name = 'ArchiveScene'
  configuration: Promise<ArchiveConfiguration>
  effect: Effect
  currentPage: number
  postsPerPage: number
  filters: ArchiveFilters
  filteredPosts: PostData[]
  currentAnimationScope: RunningAnimationScope | null
  postElementsMap: Map<string, unknown>
  transitionContext: TransitionContext | null

  constructor(
    main: HTMLDivElement,
    sidebar: HTMLDivElement,
    configuration: Promise<ArchiveConfiguration>
  ) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
    this.currentPage = 1
    this.postsPerPage = 5
    this.filters = {
      author: 'all',
      category: 'all',
      tag: 'all'
    }
    this.filteredPosts = []
    this.currentAnimationScope = null
    this.postElementsMap = new Map() // 存储文章元素和元数据的映射
    this.transitionContext = null // 存储过渡上下文
  }

  async new(Animations: AnimationContext, fromScene: Scene | null) {
    document.title = '熊谷凌的博客 / 归档'
    if (fromScene) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    this.effect.use(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/scene/archive.css'
      document.head.appendChild(link)
      return () => link.remove()
    })

    const loadingIcons = await Scene.Transitions.loading(
      Animations,
      this.main,
      this.sidebar
    )

    let configuration
    try {
      configuration = await this.configuration
    } catch {
      return
    }

    // 初始化筛选后的文章列表
    this.filteredPosts = configuration.posts

    // 提取所有的作者、分类、标签
    const authors = new Set<string>()
    const categories = new Set<string>()
    const tags = new Set<string>()

    configuration.posts.forEach(post => {
      post.author.split(',').forEach(author => authors.add(author.trim()))
      categories.add(post.category)
      post.tag.split(' ').forEach(tag => {
        if (tag.trim()) tags.add(tag.trim())
      })
    })

    // 生成主内容
    const title = (
      <h1 class="blog-archive-title" hide>
        归档
      </h1>
    )
    const subtitle = (
      <p class="blog-archive-subtitle" hide>
        所有东西都在这咯
      </p>
    )
    const container = <div class="blog-archive-container" />

    this.main.appendChild(title.element)
    this.main.appendChild(subtitle.element)
    this.main.appendChild(container.element)

    // 应用筛选
    const applyFilters = () => {
      this.filteredPosts = configuration.posts.filter(post => {
        const authorMatch =
          this.filters.author === 'all' ||
          post.author
            .split(',')
            .map(v => v.trim())
            .includes(this.filters.author)
        const categoryMatch =
          this.filters.category === 'all' ||
          post.category === this.filters.category
        const tagMatch =
          this.filters.tag === 'all' ||
          post.tag
            .split(' ')
            .map(v => v.trim())
            .includes(this.filters.tag)
        return authorMatch && categoryMatch && tagMatch
      })
      this.currentPage = 1
    }

    const totalPages = () =>
      Math.ceil(this.filteredPosts.length / this.postsPerPage)

    // 渲染当前页的文章
    const renderPage = async (page, animate = true, showLoading = false) => {
      // 打断当前正在进行的动画
      if (this.currentAnimationScope) {
        this.currentAnimationScope.abort()
        this.currentAnimationScope = null
      }

      // 更新分页信息（在动画之前）
      const pages = totalPages()
      pageInput.element.value = page.toString()
      pageInput.element.max = pages.toString()
      prevButton.element.disabled = page === 1
      nextButton.element.disabled = page === pages
      pageTotal.element.textContent = `/ ${pages}`

      // 显示加载动画
      let loadingIcon
      if (showLoading) {
        loadingIcon = <div class="loading-icon" hide />
        container.element.appendChild(loadingIcon.element)
        await Animations.fadein(loadingIcon, 200)
      }

      // 清空容器
      while (container.element.firstChild) {
        container.element.removeChild(container.element.firstChild)
      }

      // 检查是否有文章
      if (this.filteredPosts.length === 0) {
        const noResults = (
          <div class="blog-archive-no-results" hide>
            （无匹配）
          </div>
        )
        container.element.appendChild(noResults.element)
        await Animations.fadein(noResults, 200)
        return
      }

      const startIndex = (page - 1) * this.postsPerPage
      const endIndex = Math.min(
        startIndex + this.postsPerPage,
        this.filteredPosts.length
      )
      const pagePosts = this.filteredPosts.slice(startIndex, endIndex)

      const postElements = []
      for (let i = 0; i < pagePosts.length; i++) {
        const post = pagePosts[i]
        const authors = post.author.split(',').map(v => v.trim())
        const authorSpan =
          authors.length > 1 ? (
            <span>
              <span>{authors[0]}</span>
              <span class="blog-archive-post-author-etc">等</span>
            </span>
          ) : (
            <span>{authors[0]}</span>
          )

        const postTitle = (
          <h2 class="blog-archive-post-title">
            <a href={post.url} class="blog-archive-post-title-link">
              {post.name}
            </a>
          </h2>
        )

        const metadata = (
          <p class="blog-archive-post-metadata">
            <span class="blog-archive-post-author">{authorSpan}</span>
            <span class="blog-archive-post-time">{post.time}</span>
            <span class="blog-archive-post-category">{post.category}</span>
            <span class="blog-archive-post-tag">{post.tag}</span>
          </p>
        )

        const postElement = (
          <div class="blog-archive-post">
            {postTitle}
            {metadata}
          </div>
        )

        if (animate) {
          postElement.hide()
        }

        container.element.appendChild(postElement.element)
        postElements.push(postElement)

        // 存储文章元素和元数据
        this.postElementsMap.set(post.url, {
          postElement,
          postTitle,
          metadata,
          post
        })

        // 为链接添加路由处理
        const linkElement =
          postTitle.element.querySelector<HTMLAnchorElement>('a')
        if (!linkElement) continue
        let clicked = false
        linkElement.addEventListener('click', ev => {
          if (clicked) return // 防抖
          clicked = true

          // 禁用链接的 hover 效果，但保留选中/复制功能
          linkElement.style.pointerEvents = 'none'

          ev.preventDefault()
          linkElement.blur()
          const url = (ev.currentTarget as HTMLAnchorElement).getAttribute(
            'href'
          )
          if (!url) return

          // 在 archive 侧执行过渡动画
          this.performTransitionAnimation(
            postElement,
            postTitle,
            metadata,
            post,
            container,
            url
          )
        })

        // 在文章之间添加分隔线（除了最后一篇）
        if (i < pagePosts.length - 1) {
          const separator = <hr class="blog-archive-separator" />
          if (animate) {
            separator.hide()
          }
          container.element.appendChild(separator.element)
          postElements.push(separator)
        }
      }

      // 动画显示文章 - 每个文章200ms渐入，间隔50ms
      if (animate) {
        this.currentAnimationScope = scope(async Anim => {
          for (let i = 0; i < postElements.length; i++) {
            if (i > 0) {
              await Anim.wait(25)
            }
            Anim.fadein(postElements[i], 200)
          }
        })
        await this.currentAnimationScope.promise
        this.currentAnimationScope = null
      }
    }

    // 创建分页控件
    const prevButton = (
      <button class="blog-archive-pagination-button">←</button>
    ) as AnimationElement<HTMLButtonElement>
    const pageInput = (
      <input
        type="number"
        min="1"
        max={totalPages().toString()}
        value={this.currentPage.toString()}
        class="blog-archive-pagination-input"
      />
    ) as AnimationElement<HTMLInputElement>
    const pageTotal = <span>{`/ ${totalPages()}`}</span>
    const pageInfo = (
      <span class="blog-archive-pagination-info">
        {pageInput}
        {pageTotal}
      </span>
    )
    const nextButton = (
      <button class="blog-archive-pagination-button">→</button>
    ) as AnimationElement<HTMLButtonElement>
    const pagination = (
      <div class="blog-archive-pagination" hide>
        {prevButton}
        {pageInfo}
        {nextButton}
      </div>
    )

    this.main.appendChild(pagination.element)

    // 绑定分页事件
    prevButton.element.addEventListener('click', async () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.main.scrollTop = 0
        await renderPage(this.currentPage, true)
      }
    })

    nextButton.element.addEventListener('click', async () => {
      if (this.currentPage < totalPages()) {
        this.currentPage++
        this.main.scrollTop = 0
        await renderPage(this.currentPage, true)
      }
    })

    // 绑定页码输入框事件
    pageInput.element.addEventListener('change', async () => {
      let page = parseInt(pageInput.element.value)
      if (isNaN(page) || page < 1) {
        page = 1
      } else if (page > totalPages()) {
        page = totalPages()
      }
      if (page !== this.currentPage) {
        this.currentPage = page
        this.main.scrollTop = 0
        await renderPage(this.currentPage, true)
      }
    })

    pageInput.element.addEventListener('keypress', async ev => {
      if (ev.key === 'Enter') {
        pageInput.element.blur()
      }
    })

    // 侧边栏内容
    const sidebarTitle = (
      <h2 class="blog-archive-sidebar-title" hide>
        筛选
      </h2>
    )

    // 作者筛选
    const authorSelect = (
      <select class="blog-archive-filter-select">
        <option value="all">全部</option>
      </select>
    ) as AnimationElement<HTMLSelectElement>
    const authorFilterGroup = (
      <div class="blog-archive-filter-group" hide>
        <label class="blog-archive-filter-label">作者</label>
        {authorSelect}
      </div>
    )

    Array.from(authors)
      .sort()
      .forEach(author => {
        const option = <option value={author}>{author}</option>
        authorSelect.element.appendChild(option.element)
      })

    // 分类筛选
    const categorySelect = (
      <select class="blog-archive-filter-select">
        <option value="all">全部</option>
      </select>
    ) as AnimationElement<HTMLSelectElement>
    const categoryFilterGroup = (
      <div class="blog-archive-filter-group" hide>
        <label class="blog-archive-filter-label">分类</label>
        {categorySelect}
      </div>
    )

    Array.from(categories)
      .sort()
      .forEach(category => {
        const option = <option value={category}>{category}</option>
        categorySelect.element.appendChild(option.element)
      })

    // 标签筛选
    const tagSelect = (
      <select class="blog-archive-filter-select">
        <option value="all">全部</option>
      </select>
    ) as AnimationElement<HTMLSelectElement>
    const tagFilterGroup = (
      <div class="blog-archive-filter-group" hide>
        <label class="blog-archive-filter-label">标签</label>
        {tagSelect}
      </div>
    )

    Array.from(tags)
      .sort()
      .forEach(tag => {
        const option = <option value={tag}>{tag}</option>
        tagSelect.element.appendChild(option.element)
      })

    this.sidebar.appendChild(sidebarTitle.element)
    this.sidebar.appendChild(authorFilterGroup.element)
    this.sidebar.appendChild(categoryFilterGroup.element)
    this.sidebar.appendChild(tagFilterGroup.element)

    // 绑定筛选事件
    const handleFilter = async () => {
      this.filters.author = authorSelect.element.value
      this.filters.category = categorySelect.element.value
      this.filters.tag = tagSelect.element.value
      applyFilters()
      this.main.scrollTop = 0
      await renderPage(this.currentPage, true, true)
    }

    authorSelect.element.addEventListener('change', handleFilter)
    categorySelect.element.addEventListener('change', handleFilter)
    tagSelect.element.addEventListener('change', handleFilter)

    // 动画序列
    await Animations.fadeout(loadingIcons.main, 200)
    loadingIcons.main.element.remove()

    await Animations.fadein(title, 200)
    await Animations.fadein(subtitle, 200)
    // await Animations.wait(200)

    // 渲染第一页
    await renderPage(this.currentPage, true)

    // 显示分页控件
    await Animations.fadein(pagination, 200)

    // 侧边栏动画
    await Animations.fadeout(loadingIcons.sidebar, 200)
    loadingIcons.sidebar.element.remove()
    await Animations.fadein(sidebarTitle, 200)
    await Animations.fadein(authorFilterGroup, 150)
    await Animations.fadein(categoryFilterGroup, 150)
    await Animations.fadein(tagFilterGroup, 150)
  }

  /**
   * 在 archive 侧执行过渡动画，然后导航到 blog
   */
  async performTransitionAnimation(
    postElement: AnimationElement,
    postTitle: AnimationElement,
    metadata: AnimationElement,
    post: PostData,
    container: AnimationElement,
    url: string
  ) {
    // 创建一个 Promise 用于等待 blog 场景准备好接管
    const transitionReady = withResolvers<void>()

    // 获取所有文章元素
    const allPosts = Array.from(
      this.main.querySelectorAll('.blog-archive-post')
    ) as HTMLElement[]
    const otherPosts = allPosts.filter(el => el !== postElement.element)

    // 获取分页控件
    const pagination = this.main.querySelector<HTMLElement>(
      '.blog-archive-pagination'
    )

    // 计算位置信息
    const rect = postElement.element.getBoundingClientRect()
    const containerRect = container.element.getBoundingClientRect()
    const mainRect = this.main.getBoundingClientRect()
    const scrollTop = this.main.parentElement.scrollTop

    // 计算需要移动的距离
    const targetTop = -27
    const currentTop1 = rect.top - mainRect.top + scrollTop
    const currentTop2 = rect.top - containerRect.top + scrollTop
    const translateDistance1 = targetTop - currentTop1
    const translateDistance2 = targetTop - currentTop2

    // 计算需要移动的 x 距离
    const targetLeft = mainRect.left
    // 当前 x 位置：文章元素左边缘
    const currentLeft = rect.left
    // 需要移动的 x 距离
    const translateX = targetLeft - currentLeft

    // 计算标题的目标大小（postTitle.element 本身就是 h2 元素）
    const currentTitleSize = parseFloat(
      getComputedStyle(postTitle.element).fontSize
    )
    const targetTitleSize = currentTitleSize * (2.0 / 1.8)

    // 创建 loading-icon（但暂不添加到 DOM）
    const mainLoadingIcon = <div class="loading-icon" hide />

    // 创建 side loading-icon（但暂不添加到 DOM）
    const sidebarLoadingIcon = <div class="loading-icon" hide />

    // 先设置 transitionContext，让 blog 可以立即访问
    this.transitionContext = {
      postElement: postElement.element,
      postTitle: postTitle.element,
      metadata: metadata.element,
      loadingIcons: {
        main: mainLoadingIcon,
        sidebar: sidebarLoadingIcon
      },
      transitionReady,
      postData: {
        name: post.name,
        author: post.author,
        time: post.time,
        category: post.category,
        tag: post.tag
      }
    }

    postTitle.element.blur() // 移动端适配

    // 同时开始加载 blog 页面（与动画并行）
    Route.instance.handleURL(url)

    // 开始执行动画
    const animationScope = scope(async Animations => {
      // 1. 淡出其他文章和分页控件
      const fadeOutElements = [
        ...otherPosts.map(el => new AnimationElement(el)),
        ...(
          Array.from(
            this.main.querySelectorAll('.blog-archive-separator')
          ) as HTMLElement[]
        ).map(el => new AnimationElement(el))
      ]

      if (pagination) {
        fadeOutElements.push(new AnimationElement(pagination))
      }

      // 同时淡出标题和副标题
      const archiveTitle = this.main.querySelector<HTMLElement>(
        '.blog-archive-title'
      )
      const archiveSubtitle = this.main.querySelector<HTMLElement>(
        '.blog-archive-subtitle'
      )
      if (archiveTitle) fadeOutElements.push(new AnimationElement(archiveTitle))
      if (archiveSubtitle)
        fadeOutElements.push(new AnimationElement(archiveSubtitle))

      // 淡出侧边栏
      const sidebarElements = (
        Array.from(this.sidebar.children) as HTMLElement[]
      ).map(el => new AnimationElement(el))

      // 并行执行淡出动画
      Promise.all([
        ...fadeOutElements.map(el => Animations.fadeout(el, 300)),
        ...sidebarElements.map(el => Animations.fadeout(el, 300))
      ]).then(() => {
        sidebarElements.forEach(el => el.element.remove())
        fadeOutElements.forEach(el => {
          if (el.element !== postElement.element)
            el.element.style.visibility = 'hidden'
        })
      })

      // 2. 将选中的文章元素移动到顶部
      const postElem = new AnimationElement(postElement.element)
      const titleElem = new AnimationElement(postTitle.element)

      postElem.element.style.transform = `translate(${translateX}px, ${scrollTop ? translateDistance2 : translateDistance1}px)`
      titleElem.element.style.fontSize = `${targetTitleSize}px`
      titleElem.element.style.marginBottom = '0.69em'

      await Promise.all([
        // 使用 translateY 移动整个文章块
        Animations.animate(
          postElem,
          [
            { transform: 'translate(0,0)' },
            {
              transform: `translate(${translateX}px, ${scrollTop ? translateDistance2 : translateDistance1}px)`
            }
          ],
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
          }
        ),
        // 调整标题大小
        Animations.animate(
          titleElem,
          [
            { fontSize: `${currentTitleSize}px` },
            { fontSize: `${targetTitleSize}px` }
          ],
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
          }
        ),
        // 调整 metadata 的 margin-bottom
        Animations.animate(
          titleElem,
          [{ marginBottom: '0.5em' }, { marginBottom: '0.69em' }],
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
          }
        )
      ])

      // 3. 移动动画完成后，添加 loading-icon 到 DOM 并显示
      // 由于 postElement 使用 translateY 向上移动，loading-icon 需要向下偏移来补偿
      const loadingOffset = -(scrollTop
        ? translateDistance2
        : translateDistance1)
      mainLoadingIcon.element.style.transform = `translate(100%, ${loadingOffset}px)`
      postElement.element.appendChild(mainLoadingIcon.element)

      this.sidebar.appendChild(sidebarLoadingIcon.element)
      await Promise.all([
        Animations.fadein(mainLoadingIcon, 200),
        Animations.fadein(sidebarLoadingIcon, 200)
      ])

      // 4. 通知过渡准备完成
      transitionReady.resolve()
    })

    // 等待动画完成
    await animationScope.promise
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
    const index = dom.querySelector('index')
    if (!index) throw new Error('Archive index missing')
    const posts = Array.from(index.querySelectorAll('post')).map(post => ({
      name: post.querySelector('name')?.textContent ?? '',
      author: post.querySelector('author')?.textContent ?? '',
      time: post.querySelector('time')?.textContent ?? '',
      category: post.querySelector('category')?.textContent ?? '',
      tag: post.querySelector('tag')?.textContent ?? '',
      url: post.querySelector('url')?.textContent ?? ''
    }))
    return { posts }
  })

  return (main: HTMLDivElement, sidebar: HTMLDivElement) => {
    return new ArchiveScene(main, sidebar, cached)
  }
}
