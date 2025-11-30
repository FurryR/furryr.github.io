import { Elements } from '/static/js/util/animation.js'

import { Scene } from '/static/js/scene.js'
import { Route } from '/static/js/route.js'
import { Effect } from '/static/js/effect.js'

const css = `
.blog-main-intro {
  text-align: center;
  text-wrap-mode: nowrap;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.blog-index-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  text-align: center;
}

.blog-index-title {
  font-size: 2.5em;
  margin-bottom: 0.3em;
  font-weight: 600;
}

.blog-index-subtitle {
  font-size: 1em;
  font-style: italic;
  color: gray;
  margin-bottom: 2em;
}

.blog-index-search {
  margin-bottom: 2em;
  position: relative;
}

.blog-index-search-input {
  width: 70%;
  max-width: 600px;
  padding: 0.8em 1em;
  border: 1px solid lightgray;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  background: rgba(255, 255, 255, 0.3);
}

.blog-index-search-input:focus {
  outline: none;
  border-color: #1d5685;
}

.blog-index-search-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  max-width: 600px;
  max-height: 400px;
  overflow-y: auto;
  background: rgb(240, 240, 240);
  border: 1px solid lightgray;
  border-radius: 8px;
  z-index: 1000;
}

.blog-index-search-dropdown-loading {
  padding: 2em;
  text-align: center;
}

.blog-index-search-dropdown-item {
  padding: 0.8em 1em;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.blog-index-search-dropdown-item:last-child {
  border-bottom: none;
}

.blog-index-search-dropdown-item:hover,
.blog-index-search-dropdown-item.selected {
  background-color: rgba(29, 86, 133, 0.1);
}

.blog-index-search-dropdown-item-title {
  font-weight: 500;
  margin-bottom: 0.3em;
  color: #1d5685;
}

.blog-index-search-dropdown-item-meta {
  font-size: 0.85em;
  color: gray;
}

.blog-index-search-dropdown-empty {
  padding: 2em;
  text-align: center;
  color: gray;
  font-style: italic;
}

.blog-index-nav {
  margin-top: 1em;
}

.blog-index-nav-link {
  text-decoration: none;
  color: #1d5685;
  font-size: 1em;
  transition: color 0.3s;
}

.blog-index-nav-link:hover {
  color: #007acc;
}

.blog-index-sidebar-title {
  margin-bottom: 1em;
}

.blog-index-sidebar-avatar {
  width: 100%;
  border-radius: 5px;
}

`

export class MainScene extends Scene {
  static name = 'MainScene'

  constructor(main, sidebar, configuration) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
    this.postsData = null
    this.selectedIndex = -1
    this.filteredPosts = []
  }

  async loadPostsData() {
    if (this.postsData) {
      return this.postsData
    }

    try {
      const response = await fetch('/archive.html')
      const text = await response.text()
      const dom = new DOMParser().parseFromString(text, 'text/html')
      const index = dom.querySelector('index')
      const posts = Array.from(index.querySelectorAll('post')).map(post => ({
        name: post.querySelector('name').textContent,
        author: post.querySelector('author').textContent,
        time: post.querySelector('time').textContent,
        category: post.querySelector('category').textContent,
        tag: post.querySelector('tag').textContent,
        url: post.querySelector('url').textContent
      }))
      this.postsData = posts
      return posts
    } catch (error) {
      console.error('Failed to load posts data:', error)
      return []
    }
  }

  filterPosts(query) {
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

  createDropdownItem(post, index) {
    const item = document.createElement('div')
    item.className = 'blog-index-search-dropdown-item'
    item.dataset.index = index
    item.dataset.url = post.url

    const title = document.createElement('div')
    title.className = 'blog-index-search-dropdown-item-title'
    title.textContent = post.name

    const meta = document.createElement('div')
    meta.className = 'blog-index-search-dropdown-item-meta'
    meta.textContent = `${post.author} · ${post.time} · ${post.category}`

    item.appendChild(title)
    item.appendChild(meta)

    return item
  }

  updateDropdown(dropdown, posts) {
    dropdown.innerHTML = ''

    if (posts.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'blog-index-search-dropdown-empty'
      empty.textContent = '未找到匹配的文章'
      dropdown.appendChild(empty)
      this.selectedIndex = -1
      return
    }

    posts.forEach((post, index) => {
      const item = this.createDropdownItem(post, index)
      dropdown.appendChild(item)
    })

    this.selectedIndex = -1
  }

  selectItem(index) {
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

  navigateToPost(url) {
    Route.instance.handleURL(url)
  }

  async new(Animations, fromScene) {
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
    const mainContent = configuration.mainContent.cloneNode(true)
    const sideContent = configuration.sideContent.cloneNode(true)

    // 只添加子元素
    await Animations.fadeout(loadingIcons.main, 200)
    loadingIcons.main.element.remove()
    if (!fromScene) {
      let introTitle
      const introContainer = Elements.div([
        (introTitle = Elements.h1().content('In memory of')),
        Elements.p().content('nullqwertyuiop')
      ])
        .class('blog-main-intro')
        .hide()
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
    const title = Elements.h1()
      .content(mainContent.querySelector('h1').textContent)
      .class('blog-index-title')
    const subtitle = Elements.p()
      .content(mainContent.querySelector('p').textContent)
      .class('blog-index-subtitle')

    // 搜索框
    const searchInput = mainContent.querySelector('search input')
    const searchInputElement = Elements.input()
      .with('type', 'text')
      .with(
        'placeholder',
        searchInput ? searchInput.placeholder : '询问我任何事情。'
      )
      .class('blog-index-search-input')

    // 搜索下拉框
    const dropdown = document.createElement('div')
    dropdown.className = 'blog-index-search-dropdown'
    dropdown.style.display = 'none'

    let isDropdownVisible = false
    let loadingPosts = false

    // 开始加载文章数据
    const postsLoadPromise = this.loadPostsData()

    searchInputElement.element.addEventListener('focus', async () => {
      searchInputElement.element.placeholder = '我们从哪里开始呢？'

      const query = searchInputElement.element.value
      if (query.trim()) {
        dropdown.style.display = 'block'
        isDropdownVisible = true

        if (!this.postsData && !loadingPosts) {
          // 显示加载动画
          loadingPosts = true
          dropdown.innerHTML =
            '<div class="blog-index-search-dropdown-loading"><div class="loading-icon"></div></div>'

          await postsLoadPromise
          loadingPosts = false

          // 加载完成后更新下拉框
          this.filteredPosts = this.filterPosts(query)
          this.updateDropdown(dropdown, this.filteredPosts)
        }
      }
    })

    searchInputElement.element.addEventListener('blur', () => {
      searchInputElement.element.placeholder = '询问我任何事情。'
      // 延迟隐藏以允许点击下拉项
      setTimeout(() => {
        dropdown.style.display = 'none'
        isDropdownVisible = false
      }, 200)
    })

    searchInputElement.element.addEventListener('input', async ev => {
      const query = ev.target.value

      if (!query.trim()) {
        dropdown.style.display = 'none'
        isDropdownVisible = false
        return
      }

      dropdown.style.display = 'block'
      isDropdownVisible = true

      if (!this.postsData && !loadingPosts) {
        // 显示加载动画
        loadingPosts = true
        dropdown.innerHTML =
          '<div class="blog-index-search-dropdown-loading"><div class="loading-icon"></div></div>'

        await postsLoadPromise
        loadingPosts = false
      }

      if (this.postsData) {
        this.filteredPosts = this.filterPosts(query)
        this.updateDropdown(dropdown, this.filteredPosts)
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
        dropdown.style.display = 'none'
        isDropdownVisible = false
        searchInputElement.element.blur()
      }
    })

    // 点击下拉项导航
    dropdown.addEventListener('click', ev => {
      const item = ev.target.closest('.blog-index-search-dropdown-item')
      if (item && item.dataset.url) {
        this.navigateToPost(item.dataset.url)
      }
    })

    const search = Elements.div([searchInputElement]).class('blog-index-search')
    search.element.appendChild(dropdown)

    // 导航链接
    const navLink = mainContent.querySelector('nav a')
    const navLinkElement = Elements.a()
      .content(navLink ? navLink.textContent : '查看所有文章')
      .with('href', navLink ? navLink.getAttribute('href') : '/archive.html')
      .class('blog-index-nav-link')
    const nav = Elements.nav([navLinkElement]).class('blog-index-nav')

    // 使用容器包裹所有内容以实现更好的布局
    const container = Elements.div([title, subtitle, search, nav])
      .class('blog-index-container')
      .hide()

    this.main.appendChild(container.element)

    // 为导航链接添加路由处理
    navLinkElement.element.addEventListener('click', ev => {
      if (new URL(ev.target.href).origin === location.origin) {
        Route.instance.handleAnchor(ev)
      }
    })

    // 一次性显示所有内容，使用淡入动画
    await Animations.wait(200)
    await Animations.fadein(container, 200)

    await Animations.fadeout(loadingIcons.sidebar, 200)
    loadingIcons.sidebar.element.remove()

    // 生成侧边栏内容
    const sidebarTitle = Elements.h2()
      .content(sideContent.querySelector('h2').textContent)
      .class('blog-index-sidebar-title')
      .hide()
    const sidebarAvatar = Elements.img()
      .with('src', sideContent.querySelector('img').src)
      .with('alt', sideContent.querySelector('img').alt)
      .class('blog-index-sidebar-avatar')
      .hide()

    this.sidebar.appendChild(sidebarTitle.element)
    this.sidebar.appendChild(sidebarAvatar.element)

    await Animations.fadein(sidebarTitle, 200)
    await Animations.fadein(sidebarAvatar, 200)
  }

  async dispose() {
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
    const mainContent = dom.querySelector('main')
    const sideContent = dom.querySelector('sidebar')
    mainContent.remove()
    sideContent.remove()
    return {
      mainContent,
      sideContent
    }
  })
  return (main, sidebar) => {
    return new MainScene(main, sidebar, cached)
  }
}
