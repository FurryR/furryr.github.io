export default async term => {
  const app_list = {
    bash: './app/bash.js',
    blog: './app/blog.js',
    clear: './app/clear.js',
    date: './app/date.js',
    exit: './app/exit.js',
    echo: './app/echo.js',
    help: './app/help.js'
  }
  const app_util = {
    ColorText: (text, style = {}) => {
      const d = document.createElement('span')
      d.appendChild(document.createTextNode(text))
      for (const i in style) d.style[i] = style[i]
      return d
    },
    Link: (text, link) => {
      const d = document.createElement('a')
      d.appendChild(document.createTextNode(text))
      d.href = link
      d.style.textDecoration = 'underline'
      d.style.color = 'white'
      d.target = '_blank'
      return d
    },
    applist: () => Object.keys(app_list),
    exec: async (cmd, arg) => {
      if (cmd == '' && arg.length == 0) return -1
      if (cmd in app_list) {
        if (typeof app_list[cmd] == 'string')
          app_list[cmd] = (await import(app_list[cmd])).default
        return await app_list[cmd]({
          util: app_util,
          term: term,
          arg: arg
        })
      } else {
        term.write(`${cmd}: command not found\n`)
        return 255
      }
    },
    system: async cmd => {
      const f = []
      let temp = ''
      for (let i = 0, a = 0, j = 0, z = false; i < cmd.length; i++) {
        if (cmd[i] == '\\') z = !z
        else if (cmd[i] == '"' && !z) {
          if (a == 0 || a == 1) a = !a
        } else if (cmd[i] == "'" && !z) {
          if (a == 0 || a == 2) a = !a == 1 ? 2 : 0
        } else z = false
        if ((cmd[i] == '(' || cmd[i] == '{' || cmd[i] == '[') && a == 0) j++
        else if ((cmd[i] == ')' || cmd[i] == '}' || cmd[i] == ']') && a == 0)
          j--
        if (cmd[i] == ' ' && a == 0 && j == 0) {
          if (temp != '') f.push(temp)
          temp = ''
        } else temp += cmd[i]
      }
      if (temp != '') f.push(temp)
      return app_util.exec(f.length > 0 ? f[0] : '', f.slice(1))
    }
  }
  return app_util.exec('bash', [])
}
