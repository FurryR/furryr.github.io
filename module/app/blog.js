let PAGE_LIST = null,
  FRIEND_LIST = null
let moo_count = 0
export default async ({ util, term, arg }) => {
  if (PAGE_LIST == null || FRIEND_LIST == null) {
    const temp = term.cursor,
      jobs = (PAGE_LIST == null) + (FRIEND_LIST == null)
    if (PAGE_LIST == null) {
      term.write(`(1/${jobs})blog 正在读取页面列表。`)
      try {
        const t = await fetch('blog/page.json')
        if (t.ok) {
          PAGE_LIST = await t.json()
        } else {
          throw new Error(
            `blog/page.json request failed(${t.status} ${t.statusText})`
          )
        }
      } catch (err) {
        console.log(err)
        term.write('\n现在无法使用 blog，因为无法获得页面列表。\n')
        return 1
      }
    }
    term.cursor = temp
    if (FRIEND_LIST == null) {
      term.write(`(${jobs}/${jobs})blog 正在读取友链列表。`)
      try {
        const t = await fetch('blog/friend.json')
        if (t.ok) {
          FRIEND_LIST = await t.json()
        } else {
          throw new Error(
            `blog/friend.json request failed(${t.status} ${t.statusText})`
          )
        }
      } catch (err) {
        console.log(err)
        term.write('\n现在无法使用 blog，因为无法获得友链列表。\n')
        return 1
      }
    }
    term.cursor = temp
    term.write('(DONE)blog 已完成全部读取工作。\n')
  }
  if (arg[0] != 'moo') moo_count = 0
  switch (arg[0]) {
    case undefined:
    case 'help': {
      term.write('blog [COMMAND] [OPTIONS]...\n')
      term.write('访问凌的博客。\n')
      term.write('- COMMANDS 命令选项:\n')
      term.write('  help 显示帮助消息。\n')
      term.write('  version 显示版本信息。\n')
      term.write('  show [id] 显示编号为id的页面。\n')
      term.write('  list 列出所有页面。\n')
      term.write('  search [text] 根据text寻找页面。\n')
      term.write('  friend 列出所有朋友。\n')
      term.write('  about 显示个人介绍。\n')
      term.write('本博客没有超级牛力。\n')
      if (arg.length == 0) return 1
      return 0
    }
    case 'moo': {
      switch (moo_count++) {
        case 0: {
          term.write('本博客不含有任何形式的彩蛋。\n')
          break
        }
        case 1: {
          term.write('本博客真的没有彩蛋。\n')
          break
        }
        case 2: {
          term.write(
            '我不知道你是想要牛兽人还是什么的，但是这里真的没有彩蛋。\n'
          )
          break
        }
        case 3: {
          term.write('别试了！\n')
          break
        }
        case 4: {
          term.write('你就是想涩涩对吧？我满足你的话，能别来烦我了吗？\n')
          break
        }
        case 5: {
          term.write(
            '我佩服你的毅力。\n诺，这是你要的涩涩链接:',util.Link('点我点我','https://5e.fit/ZMInO')
          )
          break
        }
        case 6: {
          term.write('还没走吗？说实话我没有多少时间。\n')
          break
        }
        default: {
          term.write('你这么想要彩蛋怎么不去看饭制视频？\n')
        }
      }
      return 0;
    }
    case 'search': {
      if (arg.length == 2) {
        let index,
          sum = 0
        try {
          index = arg[1][0] == '"' ? JSON.parse(arg[1]) : arg[1]
        } catch (_) {
          term.write(`blog: Syntax error near \`${arg[1]}\`\n`)
          return 1
        }
        term.write('符合条件的页面：\n')
        for (const i in PAGE_LIST) {
          if (PAGE_LIST[i].title.indexOf(index) != -1) {
            sum++
            term.write(
              `${i} "${PAGE_LIST[i].title}" ${
                PAGE_LIST[i].author
              } 作于 ${new Date(PAGE_LIST[i].date).toUTCString()}\n`
            )
          }
        }
        term.write(`共 ${sum} 个结果\n`)
        return 0
      }
    }
    case 'about': {
      try {
        const val = await fetch(`blog/about.json`)
        if (val.ok) {
          const s = document.createElement('div')
          s.innerHTML = await val.json()
          term.write(s)
          return 0
        }
        term.write(`读入页面异常(${val.status} ${val.statusText})。\n`)
      } catch (err) {
        console.error(err)
        term.write('读入页面时发生错误。\n')
      }
      return 1
    }
    case 'show': {
      if (arg.length == 2) {
        let i = parseInt(arg[1])
        if (i < 0 || i >= PAGE_LIST.length) {
          term.write('此页面不存在。\n')
          return 1
        }
        try {
          const val = await fetch(`blog/pages/${i}.json`)
          if (val.ok) {
            term.write(`标题：${PAGE_LIST[i].title}\n`)
            term.write(
              `作者：${PAGE_LIST[i].author} 作于 ${new Date(
                PAGE_LIST[i].date
              ).toUTCString()}\n`
            )
            term.write('正文：\n')
            const s = document.createElement('div')
            s.innerHTML = await val.json()
            term.write(s)
            return 0
          }
          term.write(`读入页面异常(${val.status} ${val.statusText})。\n`)
        } catch (err) {
          console.error(err)
          term.write('读入页面时发生错误。\n')
        }
        return 1
      }
      term.write('至少得指定一个编号吧！\n')
      return 0
    }
    case 'list': {
      term.write('全部页面：\n')
      for (const i in PAGE_LIST)
        term.write(
          `${i} "${PAGE_LIST[i].title}" ${PAGE_LIST[i].author} 作于 ${new Date(
            PAGE_LIST[i].date
          ).toUTCString()}\n`
        )
      term.write(`共 ${PAGE_LIST.length} 个结果\n`)
      return 0
    }
    case 'friend': {
      term.write('朋友列表：\n')
      for (const i in FRIEND_LIST) {
        term.write(
          `${i} `,
          util.Link(FRIEND_LIST[i].name, FRIEND_LIST[i].url),
          ` ${FRIEND_LIST[i].desp}\n`
        )
      }
      term.write(`共 ${FRIEND_LIST.length} 个结果\n`)
      return 0
    }
    case 'version': {
      term.write('blog utility, version 1.0.0 (javascript-browser)\n')
      term.write('此程序基于MIT协议。\n')
      break
    }
    default: {
      term.write('未知命令。输入 blog help 来获得帮助。\n')
      return 1
    }
  }
}
