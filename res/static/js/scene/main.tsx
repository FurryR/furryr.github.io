import { AnimationElement } from '/static/js/util/animation.ts'

import { Scene } from '/static/js/scene.ts'
import { Route } from '/static/js/route.ts'
import { Effect } from '/static/js/effect.ts'
import type { AnimationContext, PostData } from '/static/js/app-types.ts'

export class MainScene extends Scene {
  static name = 'MainScene'
  configuration: Promise<{
    mainContent: HTMLElement
    sideContent: HTMLElement
  }>
  effect: Effect
  postsData: PostData[] | null
  selectedIndex: number
  filteredPosts: PostData[]

  constructor(
    main: HTMLDivElement,
    sidebar: HTMLDivElement,
    configuration: Promise<{
      mainContent: HTMLElement
      sideContent: HTMLElement
    }>
  ) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
    this.postsData = null
    this.selectedIndex = -1
    this.filteredPosts = []
  }

  async loadPostsData(): Promise<PostData[]> {
    if (this.postsData) {
      return this.postsData
    }

    try {
      const response = await fetch('/archive.html')
      const text = await response.text()
      const dom = new DOMParser().parseFromString(text, 'text/html')
      const index = dom.querySelector('index')
      if (!index) return []
      const posts = Array.from(index.querySelectorAll('post')).map(post => ({
        name: post.querySelector('name')?.textContent ?? '',
        author: post.querySelector('author')?.textContent ?? '',
        time: post.querySelector('time')?.textContent ?? '',
        category: post.querySelector('category')?.textContent ?? '',
        tag: post.querySelector('tag')?.textContent ?? '',
        url: post.querySelector('url')?.textContent ?? ''
      }))
      this.postsData = posts
      return posts
    } catch (error) {
      console.error('Failed to load posts data:', error)
      return []
    }
  }

  filterPosts(query: string) {
    if (!this.postsData || !query.trim()) {
      return []
    }

    const lowerQuery = query.toLowerCase()
    return this.postsData
      .filter(
        post =>
          post.name.toLowerCase().includes(lowerQuery) ||
          post.author.toLowerCase().includes(lowerQuery) ||
          post.category.toLowerCase().includes(lowerQuery) ||
          post.tag.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10) // 最多显示10个结果
  }

  createDropdownItem(post: PostData, index: number) {
    const item = (
      <div class="blog-index-search-dropdown-item">
        <div class="blog-index-search-dropdown-item-title">{post.name}</div>
        <div class="blog-index-search-dropdown-item-meta">
          {`${post.author} · ${post.time} · ${post.category}`}
        </div>
      </div>
    )
    item.element.dataset.index = index.toString()
    item.element.dataset.url = post.url
    return item.element
  }

  updateDropdown(dropdown: HTMLElement, posts: PostData[]) {
    dropdown.innerHTML = ''

    if (posts.length === 0) {
      const empty = (
        <div class="blog-index-search-dropdown-empty">未找到匹配的文章</div>
      )
      dropdown.appendChild(empty.element)
      this.selectedIndex = -1
      return
    }

    posts.forEach((post, index) => {
      const item = this.createDropdownItem(post, index)
      dropdown.appendChild(item)
    })

    this.selectedIndex = -1
  }

  selectItem(index: number) {
    const dropdown = document.querySelector('.blog-index-search-dropdown')
    if (!dropdown) return

    const items = dropdown.querySelectorAll('.blog-index-search-dropdown-item')
    items.forEach(item => item.classList.remove('selected'))

    if (index >= 0 && index < items.length) {
      items[index].classList.add('selected')
      items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      this.selectedIndex = index
    } else {
      this.selectedIndex = -1
    }
  }

  navigateToPost(url: string) {
    Route.instance.handleURL(url)
  }

  async new(Animations: AnimationContext, fromScene: Scene | null) {
    document.title = '熊谷凌的博客'
    if (fromScene) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }
    this.effect.use(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/scene/main.css'
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
    const mainContent = configuration.mainContent.cloneNode(true)
    const sideContent = configuration.sideContent.cloneNode(true)

    // 只添加子元素
    await Animations.fadeout(loadingIcons.main, 200)
    loadingIcons.main.element.remove()
    if (!fromScene) {
      const introTitle = <h1>In memory of</h1>
      const introContainer = (
        <div class="blog-main-intro" hide>
          {introTitle}
          <p>nullqwertyuiop</p>
        </div>
      )
      this.main.appendChild(introContainer.element)
      await Animations.fadein(introContainer, 200)
      await Animations.wait(800)
      await Animations.fadeout(introTitle, 200)
      introTitle.content('谨以此纪念')
      await Animations.fadein(introTitle, 200)
      await Animations.wait(300)
      await Animations.fadeout(introContainer, 200)
      introContainer.element.remove()
    }

    // 生成首页内容
    const title = (
      <h1 class="blog-index-title">
        {mainContent.querySelector('h1').textContent}
      </h1>
    )
    const subtitle = (
      <p class="blog-index-subtitle">
        {mainContent.querySelector('p').textContent}
      </p>
    )

    // 搜索框
    const searchInput = mainContent.querySelector(
      'search input'
    ) as HTMLInputElement | null
    const searchInputElement = (
      <input
        type="text"
        placeholder={searchInput ? searchInput.placeholder : '询问我任何事情。'}
        class="blog-index-search-input"
      />
    ) as AnimationElement<HTMLInputElement>

    // 搜索下拉框
    const dropdown = <div class="blog-index-search-dropdown" />
    const dropdownElement = dropdown.element
    dropdownElement.style.display = 'none'

    let isDropdownVisible = false
    let loadingPosts = false

    // 开始加载文章数据
    const postsLoadPromise = this.loadPostsData()

    searchInputElement.element.addEventListener('focus', async () => {
      searchInputElement.element.placeholder = '我们从哪里开始呢？'

      const query = searchInputElement.element.value
      if (query.trim()) {
        dropdownElement.style.display = 'block'
        isDropdownVisible = true

        if (!this.postsData && !loadingPosts) {
          // 显示加载动画
          loadingPosts = true
          dropdownElement.innerHTML =
            '<div class="blog-index-search-dropdown-loading"><div class="loading-icon"></div></div>'

          await postsLoadPromise
          loadingPosts = false

          // 加载完成后更新下拉框
          this.filteredPosts = this.filterPosts(query)
          this.updateDropdown(dropdownElement, this.filteredPosts)
        }
      }
    })

    searchInputElement.element.addEventListener('blur', () => {
      searchInputElement.element.placeholder = '询问我任何事情。'
      // 延迟隐藏以允许点击下拉项
      setTimeout(() => {
        dropdownElement.style.display = 'none'
        isDropdownVisible = false
      }, 200)
    })

    searchInputElement.element.addEventListener('input', async ev => {
      const query = (ev.target as HTMLInputElement).value

      if (!query.trim()) {
        dropdownElement.style.display = 'none'
        isDropdownVisible = false
        return
      }

      dropdownElement.style.display = 'block'
      isDropdownVisible = true

      if (!this.postsData && !loadingPosts) {
        // 显示加载动画
        loadingPosts = true
        dropdownElement.innerHTML =
          '<div class="blog-index-search-dropdown-loading"><div class="loading-icon"></div></div>'

        await postsLoadPromise
        loadingPosts = false
      }

      if (this.postsData) {
        this.filteredPosts = this.filterPosts(query)
        this.updateDropdown(dropdownElement, this.filteredPosts)
      }
    })

    searchInputElement.element.addEventListener('keydown', ev => {
      if (!isDropdownVisible || this.filteredPosts.length === 0) {
        return
      }

      if (ev.key === 'ArrowDown') {
        ev.preventDefault()
        const nextIndex =
          this.selectedIndex < this.filteredPosts.length - 1
            ? this.selectedIndex + 1
            : 0
        this.selectItem(nextIndex)
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault()
        const prevIndex =
          this.selectedIndex > 0
            ? this.selectedIndex - 1
            : this.filteredPosts.length - 1
        this.selectItem(prevIndex)
      } else if (ev.key === 'Enter') {
        ev.preventDefault()
        if (
          this.selectedIndex >= 0 &&
          this.selectedIndex < this.filteredPosts.length
        ) {
          const post = this.filteredPosts[this.selectedIndex]
          this.navigateToPost(post.url)
        }
      } else if (ev.key === 'Escape') {
        dropdownElement.style.display = 'none'
        isDropdownVisible = false
        searchInputElement.element.blur()
      }
    })

    // 点击下拉项导航
    dropdownElement.addEventListener('click', ev => {
      const item = (ev.target as Element).closest<HTMLElement>(
        '.blog-index-search-dropdown-item'
      )
      if (item && item.dataset.url) {
        this.navigateToPost(item.dataset.url)
      }
    })

    const search = <div class="blog-index-search">{searchInputElement}</div>
    search.element.appendChild(dropdownElement)

    // 导航链接
    const navLink = mainContent.querySelector('nav a')
    const navLinkElement = (
      <a
        href={navLink ? navLink.getAttribute('href') : '/archive.html'}
        class="blog-index-nav-link"
      >
        {navLink ? navLink.textContent : '查看所有文章'}
      </a>
    )
    const nav = <nav class="blog-index-nav">{navLinkElement}</nav>

    const container = (
      <div class="blog-index-container" hide>
        {title}
        {subtitle}
        {search}
        {nav}
      </div>
    )

    this.main.appendChild(container.element)

    // 为导航链接添加路由处理
    navLinkElement.element.addEventListener('click', ev => {
      if (
        new URL((ev.currentTarget as HTMLAnchorElement).href).origin ===
        location.origin
      ) {
        Route.instance.handleAnchor(ev)
      }
    })

    // 一次性显示所有内容，使用淡入动画
    await Animations.wait(200)
    await Animations.fadein(container, 200)

    await Animations.fadeout(loadingIcons.sidebar, 200)
    loadingIcons.sidebar.element.remove()

    // 时钟
    const clockWrap = (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        hide
      />
    )

    const ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('viewBox', '0 0 100 100')
    svg.style.display = 'block'
    svg.style.width = '120px'
    svg.style.height = '120px'

    function el(tag: string) {
      return document.createElementNS(ns, tag)
    }

    // 表盘
    const face = el('circle')
    face.setAttribute('cx', '50')
    face.setAttribute('cy', '50')
    face.setAttribute('r', '48')
    face.setAttribute('fill', 'none')
    face.setAttribute('stroke', 'currentColor')
    face.setAttribute('stroke-width', '1')
    svg.appendChild(face)

    // 刻度
    const ticks = el('g')
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180)
      const r1 = 44
      const r2 = i % 3 === 0 ? 39 : 41
      const tick = el('line')
      tick.setAttribute('x1', String(50 + r1 * Math.cos(angle)))
      tick.setAttribute('y1', String(50 + r1 * Math.sin(angle)))
      tick.setAttribute('x2', String(50 + r2 * Math.cos(angle)))
      tick.setAttribute('y2', String(50 + r2 * Math.sin(angle)))
      tick.setAttribute('stroke', 'currentColor')
      tick.setAttribute('stroke-width', i % 3 === 0 ? '2' : '1')
      ticks.appendChild(tick)
    }
    svg.appendChild(ticks)

    // 指针
    const hourHand = el('line')
    hourHand.setAttribute('x1', '50')
    hourHand.setAttribute('y1', '50')
    hourHand.setAttribute('x2', '50')
    hourHand.setAttribute('y2', '30')
    hourHand.setAttribute('stroke', 'currentColor')
    hourHand.setAttribute('stroke-width', '3')
    hourHand.setAttribute('stroke-linecap', 'round')
    svg.appendChild(hourHand)

    const minuteHand = el('line')
    minuteHand.setAttribute('x1', '50')
    minuteHand.setAttribute('y1', '50')
    minuteHand.setAttribute('x2', '50')
    minuteHand.setAttribute('y2', '18')
    minuteHand.setAttribute('stroke', 'currentColor')
    minuteHand.setAttribute('stroke-width', '2')
    minuteHand.setAttribute('stroke-linecap', 'round')
    svg.appendChild(minuteHand)

    const secondHand = el('line')
    secondHand.setAttribute('x1', '50')
    secondHand.setAttribute('y1', '50')
    secondHand.setAttribute('x2', '50')
    secondHand.setAttribute('y2', '14')
    secondHand.setAttribute('stroke', 'currentColor')
    secondHand.setAttribute('stroke-width', '1')
    secondHand.setAttribute('stroke-linecap', 'round')
    svg.appendChild(secondHand)

    // 中心圆点
    const dot = el('circle')
    dot.setAttribute('cx', '50')
    dot.setAttribute('cy', '50')
    dot.setAttribute('r', '2')
    dot.setAttribute('fill', 'currentColor')
    svg.appendChild(dot)

    clockWrap.element.appendChild(svg)

    const update = () => {
      const now = new Date()
      const h = now.getHours() % 12
      const m = now.getMinutes()
      const s = now.getSeconds()
      const ms = now.getMilliseconds()
      hourHand.setAttribute('transform', `rotate(${h * 30 + m * 0.5}, 50, 50)`)
      minuteHand.setAttribute('transform', `rotate(${m * 6 + s * 0.1}, 50, 50)`)
      secondHand.setAttribute(
        'transform',
        `rotate(${s * 6 + ms * 0.006}, 50, 50)`
      )
    }
    update()
    this.effect.use(() => {
      const id = setInterval(update, 1000)
      return () => clearInterval(id)
    })

    this.sidebar.appendChild(clockWrap.element)
    await Animations.fadein(clockWrap, 200)

    if (sideContent.children.length > 0 || sideContent.textContent?.trim()) {
      const sidebar = new AnimationElement(sideContent)
      this.sidebar.appendChild(sidebar.element)
      await Animations.fadein(sidebar, 200)
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
    const mainContent = dom.querySelector<HTMLElement>('main')
    const sideContent = dom.querySelector<HTMLElement>('sidebar')
    if (!mainContent || !sideContent)
      throw new Error('Main scene content missing')
    mainContent.remove()
    sideContent.remove()
    return {
      mainContent,
      sideContent
    }
  })
  return (main: HTMLDivElement, sidebar: HTMLDivElement) => {
    return new MainScene(main, sidebar, cached)
  }
}
