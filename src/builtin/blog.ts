import { App, Handler, Link } from '../util.js'
interface PageIndex {
  title: string
  author: string
  date: number
}
interface FriendIndex {
  name: string
  url: string
  desc: string
}
let PAGE_LIST: PageIndex[] = [],
  FRIEND_LIST: FriendIndex[] = []
let moo_count = 0

export default {
  name: 'blog',
  version: '1.0.0',
  desc: '访问凌的博客',
  url: '/dist/builtin/blog.js',
  async start(handler: Handler, args: string[]): Promise<number> {
    if (PAGE_LIST.length == 0 || FRIEND_LIST.length == 0) {
      const temp: number = handler.term.cursor,
        jobs: number =
          (PAGE_LIST == null ? 1 : 0) + (FRIEND_LIST == null ? 1 : 0)
      if (PAGE_LIST.length == 0) {
        handler.term.write(`(1/${jobs})blog 正在读取页面列表。`)
        try {
          const t = await fetch('/blog/page.json')
          if (t.ok) {
            PAGE_LIST = (await t.json()) as PageIndex[]
          } else {
            throw new Error(
              `/blog/page.json request failed(${t.status} ${t.statusText})`
            )
          }
        } catch (err) {
          console.log(err)
          handler.term.write('\n现在无法使用 blog，因为无法获得页面列表。\n')
          return 1
        }
      }
      handler.term.cursor = temp
      if (FRIEND_LIST.length == 0) {
        handler.term.write(`(${jobs}/${jobs})blog 正在读取友链列表。`)
        try {
          const t = await fetch('/blog/friend.json')
          if (t.ok) {
            FRIEND_LIST = (await t.json()) as FriendIndex[]
          } else {
            throw new Error(
              `/blog/friend.json request failed(${t.status} ${t.statusText})`
            )
          }
        } catch (err) {
          console.log(err)
          handler.term.write('\n现在无法使用 blog，因为无法获得友链列表。\n')
          return 1
        }
      }
      handler.term.cursor = temp
      handler.term.write('(DONE)blog 已完成全部读取工作。\n')
    }
    if (args[0] != 'moo') moo_count = 0
    switch (args[0] ?? 'help') {
      case 'help': {
        handler.term.write('blog [COMMAND] [OPTIONS]...\n')
        handler.term.write('访问凌的博客。\n')
        handler.term.write('- COMMANDS 命令选项:\n')
        handler.term.write('  help 显示帮助消息。\n')
        handler.term.write('  version 显示版本信息。\n')
        handler.term.write('  show [id] 显示编号为id的页面。\n')
        handler.term.write('  list 列出所有页面。\n')
        handler.term.write('  search [text] 根据text寻找页面。\n')
        handler.term.write('  friend 列出所有朋友。\n')
        handler.term.write('  about 显示个人介绍。\n')
        handler.term.write('本博客没有超级牛力。\n')
        return 0
      }
      case 'moo': {
        switch (moo_count++) {
          case 0: {
            handler.term.write('本博客不含有任何形式的彩蛋。\n')
            break
          }
          case 1: {
            handler.term.write('本博客真的没有彩蛋。\n')
            break
          }
          case 2: {
            handler.term.write(
              '你是想要兽人什么的吗？凌就是兽人来着，但请你不要在这里调戏他的博客。\n'
            )
            break
          }
          case 3: {
            handler.term.write('别试了！\n')
            break
          }
          case 4: {
            handler.term.write(
              '你就是想涩涩对吧？我满足你的话，能别来烦我了吗？\n'
            )
            break
          }
          case 5: {
            handler.term.write(
              '我佩服你的毅力。\n诺，这是你要的涩涩链接:',
              Link('涩涩！', 'https://5e.fit/ZMInO')
            )
            break
          }
          case 6: {
            handler.term.write('你被骗到了？我很好奇你为什么还不走。\n')
            break
          }
          case 7: {
            handler.term.write('我真是搞不懂你。\n')
            break
          }
          default: {
            handler.term.write('你这么想要彩蛋怎么不去看饭制视频？\n')
          }
        }
        return 0
      }
      case 'search': {
        if (args.length == 2) {
          let index = '',
            sum = 0
          try {
            index = args[1][0] == '"' ? JSON.parse(args[1]) : args[1]
          } catch (_) {
            handler.term.write(`blog: Syntax error near \`${args[1]}\`\n`)
            return 1
          }
          handler.term.write('符合条件的页面：\n')
          for (const i in PAGE_LIST) {
            if (PAGE_LIST[i].title.indexOf(index) != -1) {
              sum++
              handler.term.write(
                `${i} "${PAGE_LIST[i].title}" ${
                  PAGE_LIST[i].author
                } 作于 ${new Date(PAGE_LIST[i].date).toUTCString()}\n`
              )
            }
          }
          handler.term.write(`共 ${sum} 个结果\n`)
          return 0
        } else {
          handler.term.write('参数错误。请检查拼写。\n')
          return 1
        }
      }
      case 'about': {
        try {
          const val = await fetch('/blog/about.json')
          if (val.ok) {
            const s = document.createElement('div')
            s.innerHTML = (await val.json()) as string
            handler.term.write(s)
            return 0
          }
          handler.term.write(
            `读入页面异常(${val.status} ${val.statusText})。\n`
          )
        } catch (err) {
          console.error(err)
          handler.term.write('读入页面时发生错误。\n')
        }
        return 1
      }
      case 'show': {
        if (args.length == 2) {
          const i = parseInt(args[1])
          if (i < 0 || i >= PAGE_LIST.length) {
            handler.term.write('此页面不存在。\n')
            return 1
          }
          try {
            const val = await fetch(`blog/pages/${i}.json`)
            if (val.ok) {
              handler.term.write(`标题：${PAGE_LIST[i].title}\n`)
              handler.term.write(
                `作者：${PAGE_LIST[i].author} 作于 ${new Date(
                  PAGE_LIST[i].date
                ).toUTCString()}\n`
              )
              handler.term.write('正文：\n')
              const s = document.createElement('div')
              s.innerHTML = (await val.json()) as string
              handler.term.write(s)
              return 0
            }
            handler.term.write(
              `读入页面异常(${val.status} ${val.statusText})。\n`
            )
          } catch (err) {
            console.error(err)
            handler.term.write('读入页面时发生错误。\n')
          }
          return 1
        }
        handler.term.write('至少得指定一个编号吧！\n')
        return 0
      }
      case 'list': {
        handler.term.write('全部页面：\n')
        for (const i in PAGE_LIST)
          handler.term.write(
            `${i} "${PAGE_LIST[i].title}" ${
              PAGE_LIST[i].author
            } 作于 ${new Date(PAGE_LIST[i].date).toUTCString()}\n`
          )
        handler.term.write(`共 ${PAGE_LIST.length} 个结果\n`)
        return 0
      }
      case 'friend': {
        handler.term.write('朋友列表：\n')
        for (const i in FRIEND_LIST) {
          handler.term.write(
            `${i} `,
            Link(FRIEND_LIST[i].name, FRIEND_LIST[i].url),
            ` ${FRIEND_LIST[i].desc}\n`
          )
        }
        handler.term.write(`共 ${FRIEND_LIST.length} 个结果\n`)
        return 0
      }
      case 'version': {
        handler.term.write('blog utility, version 1.0.0 (javascript-browser)\n')
        handler.term.write('此程序基于MIT协议。\n')
        return 0
      }
      default: {
        handler.term.write('未知命令。输入 blog help 来获得帮助。\n')
        return 1
      }
    }
  }
} as App
