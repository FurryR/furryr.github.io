/**
 * This component is created by utteranc.es and optimized by @FurryR for better animations.
 */

const style = document.createElement('style')
style.textContent = `
.utterances {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}
.utterances-frame {
  color-scheme: light;
  position: absolute;
  left: 0;
  right: 0;
  width: 1px;
  min-width: 100%;
  max-width: 100%;
  height: 100%;
  border: 0;
  filter: none;
}
`
document.head.appendChild(style)

export default function Utterances(configuration) {
  const url = new URL(window.location.href)
  const session = url.searchParams.get('utterances')
  if (session) {
    localStorage.setItem('utterances-session', session)
    url.searchParams.delete('utterances')
    window.history.replaceState(undefined, document.title, url.href)
  }
  const attrs = Object.assign({}, configuration)
  const canonicalLink = document.querySelector(`link[rel='canonical']`)
  if (attrs.theme === 'preferred-color-scheme') {
    attrs.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'github-dark'
      : 'github-light'
  }
  attrs.url = canonicalLink
    ? canonicalLink.href
    : url.origin + url.pathname + url.search
  attrs.origin = url.origin
  attrs.pathname =
    url.pathname.length < 2
      ? 'index'
      : url.pathname.substring(1).replace(/\.\w+$/, '')
  attrs.title = document.title
  const descriptionMeta = document.querySelector(`meta[name='description']`)
  attrs.description = descriptionMeta ? descriptionMeta.content : ''
  const len = encodeURIComponent(attrs.description).length
  if (len > 1000) {
    attrs.description = attrs.description.substring(
      0,
      Math.floor((attrs.description.length * 1000) / len)
    )
  }
  const ogtitleMeta = document.querySelector(
    `meta[property='og:title'],meta[name='og:title']`
  )
  attrs['og:title'] = ogtitleMeta ? ogtitleMeta.content : ''
  attrs.session = session || localStorage.getItem('utterances-session') || ''

  // create the comments iframe and it's responsive container
  const utterancesOrigin = 'https://utteranc.es'
  const frameUrl = `${utterancesOrigin}/utterances.html`
  const container = document.createElement('div')
  container.className = 'utterances'
  const iframe = document.createElement('iframe')
  iframe.className = 'utterances-frame'
  iframe.title = 'Comments'
  iframe.scrolling = 'no'
  iframe.src = `${frameUrl}?${new URLSearchParams(attrs)}`
  container.appendChild(iframe)
  // adjust the iframe's height when the height of it's content changes
  const handle = event => {
    if (event.origin !== utterancesOrigin) {
      return
    }
    const data = event.data
    if (data && data.type === 'resize' && data.height) {
      container.style.height = `${data.height}px`
    }
  }
  window.addEventListener('message', handle)
  return {
    element: container,
    dispose() {
      window.removeEventListener('message', handle)
      container.remove()
    }
  }
}
