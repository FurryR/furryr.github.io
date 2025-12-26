import { AnimationElement, Elements, scope } from '/static/js/util/animation.js'
import { withResolvers } from '/static/js/util/promise.js'

import { Scene } from '/static/js/scene.js'
import { Route } from '/static/js/route.js'
import { Effect } from '/static/js/effect.js'

const css = `
.blog-archive-title {
  margin: 1.5em auto 0.5em;
  text-align: center;
  font-size: 2em;
}

.blog-archive-subtitle {
  margin: 0 auto 2em;
  text-align: center;
  font-style: italic;
  color: gray;
}

.blog-archive-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1em;
  min-height: calc(100vh - 400px);
}

.blog-archive-post {
  margin-bottom: 1.5em;
}

.blog-archive-post-title {
  font-size: 1.8em;
  margin-bottom: 0.5em;
  margin-top: 0;
}

.blog-archive-post-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s;
}

.blog-archive-post-title-link:hover {
  color: #007acc;
}

.blog-archive-post-metadata {
  margin-bottom: 1em;
}

.blog-archive-post-author,
.blog-archive-post-time,
.blog-archive-post-category,
.blog-archive-post-tag {
  font-size: 0.8em;
  color: gray;
  margin: 0;
  margin-right: 1em;
  font-style: italic;
}

.blog-archive-post-author-etc {
  font-size: 0.5em;
  margin-left: 5px;
}

.blog-archive-post-author::before {
  content: url('/static/res/icons/blog-author.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}

.blog-archive-post-time::before {
  content: url('/static/res/icons/blog-time.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}

.blog-archive-post-category::before {
  content: url('/static/res/icons/blog-category.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}

.blog-archive-post-tag::before {
  content: url('/static/res/icons/blog-tag.svg');
  position: relative;
  top: 2px;
  margin-right: 2px;
  scale: 0.8;
}

.blog-archive-separator {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2em 0;
}

.blog-archive-pagination {
  position: sticky;
  bottom: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
  padding: 0.8em 1.5em;
  background: rgba(199, 199, 199, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  width: fit-content;
  margin: 0 auto;
  z-index: 10;
  left: 50%;
  transform: translateX(-50%);
}

.blog-archive-pagination-button {
  background: none;
  border: none;
  padding: 0.3em 0.5em;
  cursor: pointer;
  color: #007acc;
  font-size: 1em;
  transition: color 0.3s;
  min-width: 2em;
}

.blog-archive-pagination-button:hover:not(:disabled) {
  color: #005a9e;
  text-decoration: underline;
}

.blog-archive-pagination-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.blog-archive-pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1em;
  color: gray;
}

.blog-archive-pagination-input {
  width: 1.5em;
  text-align: center;
  border: 1px solid lightgray;
  border-radius: 4px;
  padding: 0.2em;
  font-size: 1em;
  outline: none;
  background: transparent;
}

.blog-archive-pagination-input::-webkit-inner-spin-button,
.blog-archive-pagination-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.blog-archive-pagination-input[type=number] {
  -moz-appearance: textfield;
}

.blog-archive-pagination-input:focus {
  border-color: #007acc;
}

.blog-archive-sidebar-title {
  margin-bottom: 1em;
}

.blog-archive-sidebar-info {
  color: gray;
  font-size: 0.85em;
  line-height: 1.6em;
  margin-bottom: 0.8em;
}

.blog-archive-sidebar-info:last-child {
  margin-bottom: 0;
}

.blog-archive-filter-group {
  margin-bottom: 1.5em;
}

.blog-archive-filter-label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.blog-archive-filter-select {
  width: 100%;
  padding: 0.5em;
  border: 1px solid lightgray;
  border-radius: 4px;
  background: transparent;
  font-size: 0.9em;
  outline: none;
  cursor: pointer;
}

.blog-archive-filter-select:focus {
  border-color: #007acc;
}

.blog-archive-no-results {
  text-align: center;
  color: gray;
  font-size: 1.2em;
  margin: 3em 0;
}

@media (prefers-color-scheme: dark) {
  .blog-archive-separator {
    border-top-color: #2c2c2c;
  }
}
`

export class ArchiveScene extends Scene {
  static name = 'ArchiveScene'

  constructor(main, sidebar, configuration) {
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

  async new(Animations, fromScene) {
    document.title = '归档'
    if (fromScene) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    this.effect.use(() => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
      return () => style.remove()
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
    const authors = new Set()
    const categories = new Set()
    const tags = new Set()

    configuration.posts.forEach(post => {
      post.author.split(',').forEach(author => authors.add(author.trim()))
      categories.add(post.category)
      post.tag.split(' ').forEach(tag => {
        if (tag.trim()) tags.add(tag.trim())
      })
    })

    // 生成主内容
    const title = Elements.h1()
      .content('归档')
      .class('blog-archive-title')
      .hide()

    const subtitle = Elements.p()
      .content('所有东西都在这咯')
      .class('blog-archive-subtitle')
      .hide()

    const container = Elements.div().class('blog-archive-container')

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
        this.currentAnimationScope.skip()
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
        loadingIcon = Elements.div().class('loading-icon').hide()
        container.element.appendChild(loadingIcon.element)
        await Animations.fadein(loadingIcon, 200)
      }

      // 清空容器
      while (container.element.firstChild) {
        container.element.removeChild(container.element.firstChild)
      }

      // 检查是否有文章
      if (this.filteredPosts.length === 0) {
        const noResults = Elements.div()
          .content('（无匹配）')
          .class('blog-archive-no-results')
          .hide()
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
          authors.length > 1
            ? Elements.span([
                Elements.span().content(authors[0]),
                Elements.span()
                  .content('等')
                  .class('blog-archive-post-author-etc')
              ])
            : Elements.span().content(authors[0])

        const postTitle = Elements.h2([
          Elements.a()
            .content(post.name)
            .with('href', post.url)
            .class('blog-archive-post-title-link')
        ]).class('blog-archive-post-title')

        const metadata = Elements.p([
          Elements.span([
            // Elements.span().content('Posted by '),
            authorSpan.class('blog-archive-post-author')
          ]),
          Elements.span().content(post.time).class('blog-archive-post-time'),
          Elements.span()
            .content(post.category)
            .class('blog-archive-post-category'),
          Elements.span().content(post.tag).class('blog-archive-post-tag')
        ]).class('blog-archive-post-metadata')

        const postElement = Elements.div([postTitle, metadata]).class(
          'blog-archive-post'
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
        const linkElement = postTitle.element.querySelector('a')
        let clicked = false
        linkElement.addEventListener('click', ev => {
          if (clicked) return // 防抖
          clicked = true

          // 禁用链接的 hover 效果，但保留选中/复制功能
          linkElement.style.pointerEvents = 'none'

          ev.preventDefault()
          linkElement.blur()
          const url = ev.target.getAttribute('href')

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
          const separator = Elements.hr().class('blog-archive-separator')
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
    const prevButton = new AnimationElement(document.createElement('button'))
      .content('←')
      .class('blog-archive-pagination-button')

    const pageInput = new AnimationElement(document.createElement('input'))
      .with('type', 'number')
      .with('min', '1')
      .with('max', totalPages().toString())
      .with('value', this.currentPage.toString())
      .class('blog-archive-pagination-input')

    const pageTotal = Elements.span().content(`/ ${totalPages()}`)

    const pageInfo = Elements.span([pageInput, pageTotal]).class(
      'blog-archive-pagination-info'
    )

    const nextButton = new AnimationElement(document.createElement('button'))
      .content('→')
      .class('blog-archive-pagination-button')

    const pagination = Elements.div([prevButton, pageInfo, nextButton])
      .class('blog-archive-pagination')
      .hide()

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
    const sidebarTitle = Elements.h2()
      .content('筛选')
      .class('blog-archive-sidebar-title')
      .hide()

    // 作者筛选
    const authorFilterGroup = Elements.div()
      .class('blog-archive-filter-group')
      .hide()
    const authorLabel = Elements.label()
      .content('作者')
      .class('blog-archive-filter-label')
    const authorSelect = new AnimationElement(
      document.createElement('select')
    ).class('blog-archive-filter-select')

    const authorAllOption = document.createElement('option')
    authorAllOption.value = 'all'
    authorAllOption.textContent = '全部'
    authorSelect.element.appendChild(authorAllOption)

    Array.from(authors)
      .sort()
      .forEach(author => {
        const option = document.createElement('option')
        option.value = author
        option.textContent = author
        authorSelect.element.appendChild(option)
      })

    authorFilterGroup.element.appendChild(authorLabel.element)
    authorFilterGroup.element.appendChild(authorSelect.element)

    // 分类筛选
    const categoryFilterGroup = Elements.div()
      .class('blog-archive-filter-group')
      .hide()
    const categoryLabel = Elements.label()
      .content('分类')
      .class('blog-archive-filter-label')
    const categorySelect = new AnimationElement(
      document.createElement('select')
    ).class('blog-archive-filter-select')

    const categoryAllOption = document.createElement('option')
    categoryAllOption.value = 'all'
    categoryAllOption.textContent = '全部'
    categorySelect.element.appendChild(categoryAllOption)

    Array.from(categories)
      .sort()
      .forEach(category => {
        const option = document.createElement('option')
        option.value = category
        option.textContent = category
        categorySelect.element.appendChild(option)
      })

    categoryFilterGroup.element.appendChild(categoryLabel.element)
    categoryFilterGroup.element.appendChild(categorySelect.element)

    // 标签筛选
    const tagFilterGroup = Elements.div()
      .class('blog-archive-filter-group')
      .hide()
    const tagLabel = Elements.label()
      .content('标签')
      .class('blog-archive-filter-label')
    const tagSelect = new AnimationElement(
      document.createElement('select')
    ).class('blog-archive-filter-select')

    const tagAllOption = document.createElement('option')
    tagAllOption.value = 'all'
    tagAllOption.textContent = '全部'
    tagSelect.element.appendChild(tagAllOption)

    Array.from(tags)
      .sort()
      .forEach(tag => {
        const option = document.createElement('option')
        option.value = tag
        option.textContent = tag
        tagSelect.element.appendChild(option)
      })

    tagFilterGroup.element.appendChild(tagLabel.element)
    tagFilterGroup.element.appendChild(tagSelect.element)

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
    await Animations.wait(200)

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
    postElement,
    postTitle,
    metadata,
    post,
    container,
    url
  ) {
    // 创建一个 Promise 用于等待 blog 场景准备好接管
    const transitionReady = withResolvers()

    // 获取所有文章元素
    const allPosts = Array.from(
      this.main.querySelectorAll('.blog-archive-post')
    )
    const otherPosts = allPosts.filter(el => el !== postElement.element)

    // 获取分页控件
    const pagination = this.main.querySelector('.blog-archive-pagination')

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
    const mainLoadingIcon = Elements.div().class('loading-icon').hide()

    // 创建 side loading-icon（但暂不添加到 DOM）
    const sidebarLoadingIcon = Elements.div().class('loading-icon').hide()

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

    // 同时开始加载 blog 页面（与动画并行）
    Route.instance.handleURL(url)

    // 开始执行动画
    const animationScope = scope(async Animations => {
      // 1. 淡出其他文章和分页控件
      const fadeOutElements = [
        ...otherPosts.map(el => new AnimationElement(el)),
        ...Array.from(
          this.main.querySelectorAll('.blog-archive-separator')
        ).map(el => new AnimationElement(el))
      ]

      if (pagination) {
        fadeOutElements.push(new AnimationElement(pagination))
      }

      // 同时淡出标题和副标题
      const archiveTitle = this.main.querySelector('.blog-archive-title')
      const archiveSubtitle = this.main.querySelector('.blog-archive-subtitle')
      if (archiveTitle) fadeOutElements.push(new AnimationElement(archiveTitle))
      if (archiveSubtitle)
        fadeOutElements.push(new AnimationElement(archiveSubtitle))

      // 淡出侧边栏
      const sidebarElements = Array.from(this.sidebar.children).map(
        el => new AnimationElement(el)
      )

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

export default function (dom) {
  const cached = dom.then(dom => {
    const index = dom.querySelector('index')
    const posts = Array.from(index.querySelectorAll('post')).map(post => ({
      name: post.querySelector('name').textContent,
      author: post.querySelector('author').textContent,
      time: post.querySelector('time').textContent,
      category: post.querySelector('category').textContent,
      tag: post.querySelector('tag').textContent,
      url: post.querySelector('url').textContent
    }))
    return { posts }
  })

  return (main, sidebar) => {
    return new ArchiveScene(main, sidebar, cached)
  }
}
