'use strict'

/**
 * Copyright (c) FurryR 2025.
 * Distributed under the MIT License.
 */

import { AnimationElement, Elements, scope } from '/static/js/util/animation.js'
import { Route } from '/static/js/route.js'

function addStyle(url) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
  return new Promise(resolve => {
    link.addEventListener('load', () => resolve())
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
        .content('控制。收容。保护。')
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
    console.log('Header loading finished')
  }).promise
}
async function initalizeMain() {
  return scope(async Animations => {
    await Animations.wait(400)
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
    console.log('Main loading finished')
    return [mainContainer.element, barContainer.element]
  }).promise
}
async function initalizeFooter() {
  return scope(async Animations => {
    let copyright
    const footer = Elements.footer([
      (copyright = Elements.p()
        .content('© 2025 熊谷 凌. All rights reserved.')
        .hide())
    ]).class('blog-footer')
    document.body.appendChild(footer.element)
    await Animations.fadein(copyright, 200)
    console.log('Footer loading finished')
  }).promise
}

// window.Scene = Scene /** For debug purposes */
// window.Route = Route /** For debug purposes */

;(async () => {
  // Entry
  await scope(async Animations => {
    let firstScene
    try {
      firstScene = await Route.parse(document)
    } catch (e) {
      setTimeout(() => {
        const style = document.createElement('style')
        style.textContent = `
body::after {
  animation: flash-dots-failure 1.2s forwards;
}
`
        document.head.appendChild(style)
      }, 1000)
      throw e
    }
    Route.instance = new Route(firstScene, null)
    let usedTime = performance.now()
    await addStyle('/static/css/main.css')
    usedTime = performance.now() - usedTime
    if (usedTime < 2000) {
      await Animations.wait(Math.floor(2000 - usedTime))
    }
    await Animations.fadeout(new AnimationElement(document.body), 200)
    document.querySelector('link[blog-preload]').remove()
    const [, containers] = await Promise.all([
      initalizeHeader(),
      initalizeMain()
    ])
    await initalizeFooter()
    await Animations.wait(1000)
    const main = containers[0]
    const sidebar = containers[1]
    Route.instance.current = firstScene(main, sidebar)
    window.addEventListener('popstate', ev => {
      const position = ev.state?.position
      if (ev.state && position >= Route.instance.position) {
        Route.instance.handleForward(location.href, position)
      } else if (!ev.state || position < Route.instance.position) {
        Route.instance.pop()
      }
    })
    await Route.instance.current.new(Animations)
  }).promise
})()
