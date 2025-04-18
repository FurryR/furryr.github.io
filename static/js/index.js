'use strict'

/**
 * Copyright (c) FurryR 2025.
 * Distributed under the MIT License.
 */

import { AnimationElement, Elements, scope } from '/static/js/util/animation.js'
import { Route } from '/static/js/route.js'
import { randomHitokoto } from '/static/js/hitokoto.js'
import { withResolvers } from '/static/js/util/promise.js'

function addStyle(url) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
  return new Promise((resolve, reject) => {
    link.addEventListener('load', ev => resolve(ev))
    link.addEventListener('error', ev => reject(ev))
  })
}

async function initalizeHeader() {
  return scope(async Animations => {
    function navInit(elem) {
      elem.style('marginRight', '0px')
    }
    function navPlay(elem) {
      elem.style('marginRight', '')
      return Animations.animate(
        elem,
        [
          {
            marginRight: '0em'
          },
          {
            marginRight: '2em'
          }
        ],
        {
          duration: 200,
          easing: 'cubic-bezier(0, 1.04, 0.96, 0.98)'
        }
      )
    }
    let title, subtitle, hitokoto, home, archive, friend, contact
    const header = Elements.header([
      Elements.h1([
        (title = Elements.span().content('熊谷 凌').class('blog-title').hide()),
        (subtitle = Elements.span()
          .content('的博客')
          .class('blog-subtitle')
          .hide())
      ]).class('blog-title-container'),
      (hitokoto = Elements.span()
        .content(randomHitokoto())
        .class('blog-hitokoto')
        .hide()),
      Elements.nav([
        Elements.ul([
          (home = Elements.li([
            Elements.a().content('主页').with('href', '/index.html')
          ]).hide()),
          (archive = Elements.li([
            Elements.a().content('归档').with('href', '/archive.html')
          ]).hide()),
          (friend = Elements.li([
            Elements.a().content('友链').with('href', '/friend.html')
          ]).hide()),
          (contact = Elements.li([
            Elements.a().content('联系方式').with('href', '/contact.html')
          ]).hide())
        ])
      ]).class('blog-nav')
    ])
    home.element.addEventListener('click', ev =>
      Route.instance.handleAnchor(ev)
    )
    // TODO: search bar
    document.body.appendChild(header.element)
    await Animations.fadein(title, 400)
    await Animations.fadein(subtitle, 400)
    await Animations.fadein(hitokoto, 200)
    await Animations.wait(200)
    ;[home, archive, friend, contact].forEach(navInit)
    await Animations.fadein(home, 150)
    await Animations.fadein(archive, 150)
    await Animations.fadein(friend, 150)
    await Animations.fadein(contact, 150)
    await Promise.all([home, archive, friend, contact].map(navPlay))
  }).promise
}
function initalizeMain() {
  let content, mainContainer, barContainer
  let github, discord, telegram, twitter
  const main = Elements.main([
    (content = Elements.div([
      Elements.div([
        (mainContainer = Elements.div([Elements.div().class('loading-icon')])
          .class('blog-main-content')
          .hide())
      ]).class('blog-main'),
      Elements.div([
        Elements.div([
          (barContainer = Elements.div([Elements.div().class('loading-icon')])
            .class('blog-sidebar-content')
            .hide())
        ]).class('blog-sidebar'),
        Elements.div([
          (github = Elements.a([
            Elements.img()
              .with('src', '/static/res/icons/blog-github.svg')
              .with('alt', 'GitHub')
          ])
            .with('target', '_blank')
            .with('href', 'https://github.com/FurryR')
            .hide()),
          (discord = Elements.a([
            Elements.img()
              .with('src', '/static/res/icons/blog-discord.svg')
              .with('alt', 'Discord')
          ])
            .with('target', '_blank')
            .with('href', 'http://discordapp.com/users/im_furryr')
            .hide()),
          (telegram = Elements.a([
            Elements.img()
              .with('src', '/static/res/icons/blog-telegram.svg')
              .with('alt', 'Telegram')
          ])
            .with('target', '_blank')
            .with('href', 'https://t.me/DevRinOwO')
            .hide()),
          (twitter = Elements.a([
            Elements.img()
              .with('src', '/static/res/icons/blog-twitter.svg')
              .with('alt', 'X (Twitter)')
          ])
            .with('target', '_blank')
            .with('href', 'https://x.com/im_furryr')
            .hide())
        ]).class('blog-contacts')
      ]).class('blog-side')
    ])
      .class('blog-page')
      .hide())
  ])
  document.body.appendChild(main.element)
  return {
    main: mainContainer.element,
    sidebar: barContainer.element,
    promise: scope(async Animations => {
      await Animations.wait(400)
      content.show()
      await Animations.animate(
        content,
        [
          {
            height: '0'
          },
          {
            height: 'calc(100vh - 200px)'
          }
        ],
        {
          duration: 1000,
          easing: 'ease-out'
        }
      )
      await Animations.wait(400)
      await Promise.all([
        Animations.fadein(mainContainer, 200),
        Animations.fadein(barContainer, 200)
      ])
      ;(async () => {
        await Animations.fadein(github, 200)
        await Animations.fadein(discord, 200)
        await Animations.fadein(telegram, 200)
        await Animations.fadein(twitter, 200)
      })()
    }).promise
  }
}
async function initalizeFooter(contentPromise) {
  return scope(async Animations => {
    const footer = Elements.footer([])
      .content('© 2025 熊谷 凌. All rights reserved.')
      .class('blog-footer')
      .hide()
    document.body.appendChild(footer.element)
    await contentPromise
    await Animations.fadein(footer, 200)
  }).promise
}

window.Route = Route /** For debug purposes */
;(() => {
  // Preload all scenes parallelly
  for (const v of Route.Routes.values()) v()

  const routeLoaded = withResolvers()
  window.addEventListener('popstate', async ev => {
    await routeLoaded.promise
    const dom = ev.state?.document
    if (dom) {
      Route.instance.handleCache(
        window.location.pathname,
        new DOMParser().parseFromString(dom, 'text/html')
      )
    } else {
      Route.instance.handleURL(window.location.pathname)
    }
  })

  // Entry
  const animationContext = scope(async Animations => {
    const cloned = document.cloneNode(true)
    window.history.replaceState(
      {
        url: window.location.pathname,
        document: document.documentElement.outerHTML
      },
      '',
      window.location.href
    )
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
    let firstScene = Route.parse(
      Promise.resolve(cloned),
      window.location.pathname
    )
    try {
      await addStyle('/static/css/main.css')
    } catch (e) {
      document.body.className = 'loading-failure'
      throw e
    }
    await Animations.fadeout(new AnimationElement(document.body), 200)
    document.querySelector('link[blog-preload]')?.remove()
    const headerPromise = initalizeHeader()
    const mainResult = initalizeMain()
    const footerPromise = initalizeFooter(
      Promise.all([headerPromise, mainResult.promise])
    )
    const dummyScene = {
      main: mainResult.main,
      sidebar: mainResult.sidebar,
      dummy: true
    }
    Route.instance = new Route(dummyScene)
    Route.instance.currentAnimation = animationContext
    routeLoaded.resolve()
    await Promise.all([headerPromise, mainResult.promise, footerPromise])
    try {
      firstScene = await firstScene
    } catch (e) {
      setTimeout(() => {
        for (const container of [mainResult.main, mainResult.sidebar]) {
          container.querySelector('.loading-icon').className =
            'loading-icon-failure'
        }
      }, 1000)
      throw e
    }
    if (Route.instance.current.dummy) {
      Route.instance.current = firstScene(mainResult.main, mainResult.sidebar)
      await Route.instance.current.new(Animations, null)
    }
  })
})()
