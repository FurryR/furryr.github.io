export function addStyle(
  url: URL | string
): Promise<HTMLLinkElement | HTMLStyleElement> {
  if (url instanceof URL) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url.href
    document.head.appendChild(link)
    return new Promise((resolve, reject) => {
      link.addEventListener('load', () => resolve(link))
      link.addEventListener('error', ev => reject(ev))
    })
  } else {
    const style = document.createElement('style')
    style.textContent = url
    document.head.append(style)
    return Promise.resolve(style)
  }
}
