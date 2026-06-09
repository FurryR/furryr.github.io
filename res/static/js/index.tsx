'use strict'

/**
 * Copyright (c) FurryR 2025.
 * Distributed under the MIT License.
 */

import '/static/js/jsx-runtime.ts'
import { AnimationElement, scope } from '/static/js/util/animation.ts'
import type { AnimationRunner } from '/static/js/util/animation.ts'
import { Route } from '/static/js/route.ts'
import { randomHitokoto } from '/static/js/hitokoto.ts'
import { withResolvers } from '/static/js/util/promise.ts'
import { addStyle } from '/static/js/util/style.ts'
import {
  filterBangs,
  parseBang,
  executeBang,
  getBangLabel,
  type BangCommand
} from '/static/js/bang.ts'

async function initalizeHeader(Animations: AnimationRunner) {
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
  const title = (
    <span class="blog-title" hide>
      熊谷 凌
    </span>
  )
  const subtitle = (
    <span class="blog-subtitle" hide>
      的博客
    </span>
  )
  const hitokoto = (
    <span class="blog-hitokoto" hide>
      {randomHitokoto()}
    </span>
  )
  const homeLink = (
    <a class="blog-nav-links-item-a" href="/">
      主页
    </a>
  )
  const home = (
    <li class="blog-nav-links-item" hide>
      {homeLink}
    </li>
  )
  const archiveLink = (
    <a class="blog-nav-links-item-a" href="/archive">
      归档
    </a>
  )
  const archive = (
    <li class="blog-nav-links-item" hide>
      {archiveLink}
    </li>
  )
  const friendLink = (
    <a class="blog-nav-links-item-a" href="/friend">
      友链
    </a>
  )
  const friend = (
    <li class="blog-nav-links-item" hide>
      {friendLink}
    </li>
  )
  const aboutLink = (
    <a class="blog-nav-links-item-a" href="/about">
      关于我
    </a>
  )
  const about = (
    <li class="blog-nav-links-item-last" hide>
      {aboutLink}
    </li>
  )
  const commandInput = <input class="blog-nav-command" placeholder=">" />
  const commandDropdown = (
    <div class="blog-nav-command-dropdown" hide>
      <div class="blog-nav-command-dropdown-container" />
    </div>
  )
  const commandBar = (
    <li class="blog-nav-item-command" hide>
      {commandInput}
      {commandDropdown}
    </li>
  )
  const header = (
    <header>
      <h1 class="blog-title-container">
        {title}
        {subtitle}
      </h1>
      {hitokoto}
      <nav class="blog-nav">
        <ul>
          {home}
          {archive}
          {friend}
          {about}
          {commandBar}
        </ul>
      </nav>
    </header>
  )

  const dropdownContainer = commandDropdown.element.querySelector(
    '.blog-nav-command-dropdown-container'
  )!
  const cmdInput = commandInput.element as HTMLInputElement

  let selectIndex = -1

  function updateSelection(items: NodeListOf<Element>) {
    items.forEach(item => item.classList.remove('selected'))
    if (selectIndex >= 0 && selectIndex < items.length) {
      items[selectIndex].classList.add('selected')
      items[selectIndex].scrollIntoView({ block: 'nearest' })
    }
  }

  function renderHelp(command: BangCommand) {
    const help = document.createElement('div')
    help.className = 'blog-nav-command-dropdown-help'

    let html = `<div class="blog-nav-command-dropdown-help-name">/${command.name}</div>`
    html += `<div class="blog-nav-command-dropdown-help-desc">${command.description}</div>`
    if (command.hasQuery) {
      html += `<div class="blog-nav-command-dropdown-help-usage">用法: /${command.name} &lt;搜索内容&gt;</div>`
    }
    help.innerHTML = html
    dropdownContainer.appendChild(help)
  }

  function renderDropdown() {
    const value = cmdInput.value
    dropdownContainer.innerHTML = ''
    selectIndex = -1

    if (!value) {
      const hint = document.createElement('div')
      hint.className = 'blog-nav-command-dropdown-empty'
      hint.textContent = '输入 "/" 以开始'
      dropdownContainer.appendChild(hint)
      return
    }

    if (!value.startsWith('/')) {
      const empty = document.createElement('div')
      empty.className = 'blog-nav-command-dropdown-empty'
      empty.textContent = '未知命令'
      dropdownContainer.appendChild(empty)
      return
    }

    const { command: exactCommand } = parseBang(value)

    if (exactCommand) {
      renderHelp(exactCommand)
      return
    }

    const matches = filterBangs(value)
    if (matches.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'blog-nav-command-dropdown-empty'
      empty.textContent = '未知命令'
      dropdownContainer.appendChild(empty)
      return
    }

    matches.forEach(bang => {
      const item = document.createElement('div')
      item.className = 'blog-nav-command-dropdown-item'
      item.innerHTML = `<span class="blog-nav-command-dropdown-item-name">${getBangLabel(bang)}</span><span class="blog-nav-command-dropdown-item-desc">${bang.description}</span>`
      item.addEventListener('click', () => {
        cmdInput.value = `/${bang.name} `
        const len = cmdInput.value.length
        cmdInput.setSelectionRange(len, len)
        renderDropdown()
      })
      dropdownContainer.appendChild(item)
    })
  }

  commandInput.element.addEventListener('focus', async () => {
    await Animations.fadein(commandDropdown, 200)
    renderDropdown()
  })
  commandInput.element.addEventListener('blur', async () => {
    await Animations.fadeout(commandDropdown, 200)
    commandDropdown.hide()
  })
  commandInput.element.addEventListener('input', () => {
    renderDropdown()
  })
  commandInput.element.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
      const value = cmdInput.value
      if (!value) {
        const hint = document.createElement('div')
        hint.className = 'blog-nav-command-dropdown-empty'
        hint.textContent = '输入 "/" 以开始'
        dropdownContainer.appendChild(hint)
        return
      }

      if (!value.startsWith('/')) return

      if (selectIndex >= 0) {
        const items = dropdownContainer.querySelectorAll(
          '.blog-nav-command-dropdown-item'
        )
        if (selectIndex < items.length) {
          ;(items[selectIndex] as HTMLElement).click()
        }
        ev.preventDefault()
        return
      }

      const { command: exactCommand } = parseBang(value)
      if (exactCommand) {
        if (
          !exactCommand.hasQuery ||
          value.slice(exactCommand.name.length + 1).startsWith(' ')
        ) {
          executeBang(value)
          cmdInput.blur()
        } else {
          cmdInput.value = `/${exactCommand.name} `
          const len = cmdInput.value.length
          cmdInput.setSelectionRange(len, len)
          renderDropdown()
        }
      } else {
        const matches = filterBangs(value)
        if (matches.length > 0) {
          cmdInput.value = `/${matches[0].name} `
          const len = cmdInput.value.length
          cmdInput.setSelectionRange(len, len)
          renderDropdown()
        }
      }
      ev.preventDefault()
    } else if (ev.key === 'Escape') {
      cmdInput.value = ''
      dropdownContainer.innerHTML = ''
      selectIndex = -1
      cmdInput.blur()
    } else if (ev.key === 'ArrowDown') {
      const items = dropdownContainer.querySelectorAll(
        '.blog-nav-command-dropdown-item'
      )
      if (items.length === 0) return
      selectIndex = Math.min(selectIndex + 1, items.length - 1)
      updateSelection(items)
      ev.preventDefault()
    } else if (ev.key === 'ArrowUp') {
      const items = dropdownContainer.querySelectorAll(
        '.blog-nav-command-dropdown-item'
      )
      if (items.length === 0) return
      selectIndex = Math.max(selectIndex - 1, 0)
      updateSelection(items)
      ev.preventDefault()
    }
  })
  commandDropdown.element.addEventListener('mousedown', ev => {
    ev.preventDefault()
  })
  ;[homeLink, archiveLink, friendLink, aboutLink].forEach(v =>
    v.element.addEventListener('click', ev => Route.instance.handleAnchor(ev))
  )
  document.body.appendChild(header.element)
  await Animations.fadein(title, 400)
  await Animations.fadein(subtitle, 400)
  await Animations.fadein(hitokoto, 200)
  await Animations.wait(200)
  ;[home, archive, friend, about].forEach(navInit)
  await Animations.fadein(home, 150)
  await Animations.fadein(archive, 150)
  await Animations.fadein(friend, 150)
  await Animations.fadein(about, 150)
  await Promise.all([home, archive, friend, about].map(navPlay))
  await Animations.fadein(commandBar, 150)
}
function initalizeMain(Animations: AnimationRunner) {
  const mainContainer = (
    <div class="blog-main-content" hide>
      <div class="loading-icon" />
    </div>
  )
  const barContainer = (
    <div class="blog-sidebar-content" hide>
      <div class="loading-icon" />
    </div>
  )
  const github = (
    <a target="_blank" href="https://github.com/FurryR" hide>
      <img src="/static/res/icons/blog-github.svg" alt="GitHub" />
    </a>
  )
  const discord = (
    <a target="_blank" href="http://discordapp.com/users/im_furryr" hide>
      <img src="/static/res/icons/blog-discord.svg" alt="Discord" />
    </a>
  )
  const telegram = (
    <a target="_blank" href="https://t.me/im_furryr" hide>
      <img src="/static/res/icons/blog-telegram.svg" alt="Telegram" />
    </a>
  )
  const twitter = (
    <a target="_blank" href="https://x.com/im_furryr" hide>
      <img src="/static/res/icons/blog-twitter.svg" alt="X (Twitter)" />
    </a>
  )
  const content = (
    <div class="blog-page" hide>
      <div class="blog-main">{mainContainer}</div>
      <div class="blog-side">
        <div class="blog-sidebar">{barContainer}</div>
        <div class="blog-contacts">
          {github}
          {discord}
          {telegram}
          {twitter}
        </div>
      </div>
    </div>
  )
  const main = <main>{content}</main>
  document.body.appendChild(main.element)
  return {
    main: mainContainer.element,
    sidebar: barContainer.element,
    promise: (async () => {
      await Animations.wait(400)
      content.show()
      await Animations.animate(
        content,
        [
          {
            height: '0'
          },
          {
            height: CSS.supports('height', '100dvh')
              ? 'calc(100dvh - 200px)'
              : 'calc(100vh - 200px)'
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
    })()
  }
}
async function initalizeFooter(Animations, contentPromise) {
  const footer = (
    <footer class="blog-footer" hide>
      © 2026 熊谷 凌. All rights reserved.
    </footer>
  )
  document.body.appendChild(footer.element)
  await contentPromise
  await Animations.fadein(footer, 200)
}

window.Route = Route /** For debug purposes */
;(() => {
  console.log(
    '%c⚡ Powered by native Typescript',
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
    const cloned = document.cloneNode(true) as Document
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
    document.addEventListener('click', ev => {
      const target = ev.target as HTMLElement
      if (target.closest('a,button,input,select,textarea')) return
      animationContext.skip()
      Route.instance?.currentAnimation?.skip()
    })
    let firstScene: any = Route.parse(
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
    const headerPromise = initalizeHeader(Animations)
    const mainResult = initalizeMain(Animations)
    const footerPromise = initalizeFooter(
      Animations,
      Promise.all([headerPromise, mainResult.promise])
    )
    const dummyMark = Symbol('dummy')
    const dummyScene = {
      main: mainResult.main,
      sidebar: mainResult.sidebar,
      [dummyMark]: true,
      dispose() {}
    }
    Route.instance = new Route(dummyScene as any)
    const currentAnimation = scope(async () => {})
    Route.instance.currentAnimation = currentAnimation
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
