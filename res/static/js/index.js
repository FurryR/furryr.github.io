'use strict'

/**
 * Copyright (c) FurryR 2025.
 * Distributed under the MIT License.
 */

import { AnimationElement, Elements, scope } from '/static/js/util/animation.js'
import { Route } from '/static/js/route.js'
import { randomHitokoto } from '/static/js/hitokoto.js'
import { withResolvers } from '/static/js/util/promise.js'
import { addStyle } from '/static/js/util/style.js'

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
    let title,
      subtitle,
      hitokoto,
      home,
      archive,
      friend,
      contact,
      commandBar,
      commandInput,
      commandDropdown
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
            Elements.a()
              .content('主页')
              .class('blog-nav-links-item-a')
              .with('href', '/index.html')
          ])
            .class('blog-nav-links-item')
            .hide()),
          (archive = Elements.li([
            Elements.a()
              .content('归档')
              .class('blog-nav-links-item-a')
              .with('href', '/archive.html')
          ])
            .class('blog-nav-links-item')
            .hide()),
          (friend = Elements.li([
            Elements.a()
              .content('友链')
              .class('blog-nav-links-item-a')
              .with('href', '/friend.html')
          ])
            .class('blog-nav-links-item')
            .hide()),
          (contact = Elements.li([
            Elements.a()
              .content('联系方式')
              .class('blog-nav-links-item-a')
              .with('href', '/contact.html')
          ])
            .class('blog-nav-links-item-last')
            .hide()),
          (commandBar = Elements.li([
            (commandInput = Elements.input()
              .class('blog-nav-command')
              .with('placeholder', '>')),
            (commandDropdown = Elements.div([
              Elements.div([
                // TODO: command suggestion system
                Elements.p()
                  .content('以后应该会有搜索和命令功能')
                  .style('textWrapMode', 'nowrap')
                  .style('position', 'absolute')
                  .style('top', '50%')
                  .style('left', '50%')
                  .style('transform', 'translate(-50%, -50%)')
                  .style('margin', '0')
              ]).class('blog-nav-command-dropdown-container')
            ])
              .class('blog-nav-command-dropdown')
              .hide())
          ])
            .class('blog-nav-item-command')
            .hide())
        ])
      ]).class('blog-nav')
    ])
    commandInput.element.addEventListener('focus', async () => {
      await Animations.fadein(commandDropdown, 200)
    })
    commandInput.element.addEventListener('blur', async () => {
      await Animations.fadeout(commandDropdown, 200)
      commandDropdown.hide()
    })
    ;[home, archive].forEach(v =>
      v.element.addEventListener('click', ev => Route.instance.handleAnchor(ev))
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
    await Animations.fadein(commandBar, 150)
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
            .with('href', 'https://t.me/im_furryr')
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
            height: CSS.supports('height', '100dvh') ? 'calc(100dvh - 200px)' : 'calc(100vh - 200px)'
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
  console.log(
    '%c⚡ Powered by native Javascript',
    'font-weight: bold; font-size: 16px;',
    '- Blazing fast and lightweight.'
  )

  // Preload all scenes parallelly
  for (const v of Route.Routes.values()) v()

  const routeLoaded = withResolvers()
  window.addEventListener('popstate', async ev => {
    const token = {
      url: window.location.pathname,
      dom: ev.state?.document
    }
    await routeLoaded.promise
    if (token.dom) {
      Route.instance.handleCache(
        token.url,
        new DOMParser().parseFromString(token.dom, 'text/html')
      )
    } else {
      Route.instance.handleURL(token.url)
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
      await addStyle(new URL('/static/css/main.css', window.location.href))
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
    const dummyMark = Symbol('dummy')
    const dummyScene = {
      main: mainResult.main,
      sidebar: mainResult.sidebar,
      [dummyMark]: true,
      dispose() {}
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
    if (Route.instance.current[dummyMark]) {
      Route.instance.current = firstScene(mainResult.main, mainResult.sidebar)
      await Route.instance.current.new(Animations, null)
    }
  })
})()
