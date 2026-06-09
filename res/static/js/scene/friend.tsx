import { AnimationElement } from '/static/js/util/animation.ts'

import { Scene } from '/static/js/scene.ts'
import { Effect } from '/static/js/effect.ts'
import type { AnimationContext } from '/static/js/app-types.ts'

type FriendEntry = {
  avatar: string
  name: string
  desc: string
  url: string
}

type FriendConfiguration = {
  entries: FriendEntry[]
}

export class FriendScene extends Scene {
  static name = 'FriendScene'
  configuration: Promise<FriendConfiguration>
  effect: Effect

  constructor(
    main: HTMLDivElement,
    sidebar: HTMLDivElement,
    configuration: Promise<FriendConfiguration>
  ) {
    super(main, sidebar)
    this.configuration = configuration
    this.effect = new Effect()
  }

  async new(Animations: AnimationContext, fromScene: Scene | null) {
    document.title = '熊谷凌的博客 / 友链'
    if (fromScene) {
      await Scene.Disposes.foldAndFadeout(Animations, this.main, this.sidebar)
      await fromScene.dispose()
    }

    this.effect.use(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/scene/friend.css'
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

    const friendCards = configuration.entries.map(
      (entry, _i) =>
        (
          <li class="blog-friend-card" hide>
            <a
              class="blog-friend-card-link"
              href={entry.url}
              target="_blank"
              rel="noopener"
            >
              <img
                class="blog-friend-avatar"
                src={entry.avatar}
                alt={entry.name}
              />
              <div class="blog-friend-card-info">
                <span class="blog-friend-card-name">{entry.name}</span>
                <span class="blog-friend-card-desc">{entry.desc}</span>
              </div>
            </a>
          </li>
        ) as AnimationElement
    )

    const subtitle = (
      <p class="blog-friend-subtitle" hide>
        我的一些狐朋狗友。
      </p>
    )

    const layout = (
      <div class="blog-friend-layout" hide>
        <h1 class="blog-friend-title">朋友们</h1>
        {subtitle}
        <ul class="blog-friend-list">{friendCards}</ul>
        <hr class="blog-friend-split" hide />
        <div class="blog-friend-requirements" hide>
          <h2>互换友链</h2>
          请使用任意私信方式联系我，并提供形如以下的信息：
          <pre>
            <code>
              url: https://furryr.is-a.dev/
              <br />
              title: 熊谷凌的博客
              <br />
              description: 何卒よろしくお願いします。
              <br />
              avatar: https://furryr.is-a.dev/favicon.avif
            </code>
          </pre>
          <h3>要求</h3>
          <ul>
            <li>
              请不要在网站中包含明显违反您当地法律的内容。此限制不含网络安全和
              R18。
            </li>
            <li>全站启用 HSTS、强制 HTTPS 或者至少有 HTTPS 证书。</li>
            <li>
              域名有一定的标识度——is-a.dev 也好，github.io
              也好，请证明它是您自己的。
            </li>
            <li>在加入期间每月离线时间不得超过 168 小时。</li>
          </ul>
        </div>
      </div>
    )

    const split = new AnimationElement(
      layout.element.querySelector('.blog-friend-split') as HTMLElement
    )
    const requirements = new AnimationElement(
      layout.element.querySelector('.blog-friend-requirements') as HTMLElement
    )

    const sidebarTitle = (
      <h2 class="blog-friend-sidebar-title" hide>
        友链
      </h2>
    )
    const sidebarText = (
      <p class="blog-friend-sidebar-text" hide>
        目前共有 {configuration.entries.length} 个友链。
      </p>
    )

    this.main.appendChild(layout.element)
    this.sidebar.appendChild(sidebarTitle.element)
    this.sidebar.appendChild(sidebarText.element)

    await Animations.fadeout(loadingIcons.main, 200)
    loadingIcons.main.element.remove()
    await Animations.wait(100)
    await Animations.fadein(layout, 200)
    await Animations.fadein(subtitle, 200)

    const cardAnimations = friendCards.map((card, _i) =>
      Animations.fadein(card, 200, 'ease-out').then(() => Animations.wait(80))
    )
    await Promise.all(cardAnimations)

    await Animations.fadein(split, 150)
    await Animations.fadein(requirements, 200)

    await Animations.fadeout(loadingIcons.sidebar, 200)
    loadingIcons.sidebar.element.remove()
    await Promise.all([
      Animations.fadein(sidebarTitle, 200),
      Animations.fadein(sidebarText, 150)
    ])
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
    const friend = dom.querySelector('friend')
    if (!friend) throw new Error('Friend scene content missing')
    const entries = Array.from(friend.querySelectorAll('entry')).map(entry => ({
      avatar: entry.querySelector('img')?.getAttribute('src') ?? '',
      name: entry.querySelector('name')?.textContent ?? '',
      desc: entry.querySelector('desc')?.textContent ?? '',
      url: entry.querySelector('a')?.getAttribute('href') ?? ''
    }))
    return { entries }
  })
  return (main: HTMLDivElement, sidebar: HTMLDivElement) => {
    return new FriendScene(main, sidebar, cached)
  }
}
