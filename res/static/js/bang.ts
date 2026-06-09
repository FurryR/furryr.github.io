export interface BangCommand {
  name: string
  description: string
  url: string
  hasQuery: boolean
}

const bangs: BangCommand[] = [
  {
    name: 'google',
    description: 'Google 搜索',
    url: 'https://www.google.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'bing',
    description: 'Bing 搜索',
    url: 'https://www.bing.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'github',
    description: 'GitHub 搜索',
    url: 'https://github.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'npm',
    description: 'npm 包搜索',
    url: 'https://www.npmjs.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'mdn',
    description: 'MDN 文档搜索',
    url: 'https://developer.mozilla.org/zh-CN/search?q={query}',
    hasQuery: true
  },
  {
    name: 'wiki',
    description: 'Wikipedia 搜索',
    url: 'https://zh.wikipedia.org/wiki/{query}',
    hasQuery: true
  },
  {
    name: 'zhihu',
    description: '知乎搜索',
    url: 'https://www.zhihu.com/search?type=content&q={query}',
    hasQuery: true
  },
  {
    name: 'bilibili',
    description: 'Bilibili 搜索',
    url: 'https://search.bilibili.com/all?keyword={query}',
    hasQuery: true
  },
  {
    name: 'crypto',
    description: '加密货币行情',
    url: 'https://coinmarketcap.com/',
    hasQuery: false
  },
  {
    name: 'taobao',
    description: '淘宝搜索',
    url: 'https://s.taobao.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'jd',
    description: '京东搜索',
    url: 'https://search.jd.com/Search?keyword={query}',
    hasQuery: true
  },
  {
    name: 'translate',
    description: 'Google 翻译',
    url: 'https://translate.google.com/?sl=auto&tl=zh-CN&text={query}&op=translate',
    hasQuery: true
  },
  {
    name: 'douban',
    description: '豆瓣搜索',
    url: 'https://www.douban.com/search?q={query}',
    hasQuery: true
  },
  {
    name: 'perplexity',
    description: 'Perplexity AI 搜索',
    url: 'https://www.perplexity.ai/search?q={query}',
    hasQuery: true
  }
]

export function filterBangs(input: string): BangCommand[] {
  if (!input.startsWith('/')) return []
  const name = input.slice(1).split(' ')[0].toLowerCase()
  if (!name) return bangs
  return bangs.filter(b => b.name.startsWith(name))
}

export function parseBang(input: string): {
  command: BangCommand | null
  query: string
} {
  if (!input.startsWith('/')) return { command: null, query: input }
  const rest = input.slice(1)
  const spaceIndex = rest.indexOf(' ')
  const commandName =
    spaceIndex === -1
      ? rest.toLowerCase()
      : rest.slice(0, spaceIndex).toLowerCase()
  const query = spaceIndex === -1 ? '' : rest.slice(spaceIndex + 1).trim()
  const command = bangs.find(b => b.name === commandName) ?? null
  return { command, query }
}

export function getBangLabel(command: BangCommand): string {
  return `/${command.name}`
}

export function executeBang(input: string): boolean {
  const { command, query } = parseBang(input)
  if (!command) return false
  const url = command.url.replace('{query}', encodeURIComponent(query))
  window.open(url, '_blank')
  return true
}
