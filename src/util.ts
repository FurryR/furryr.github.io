import { RichTerminal, Terminal } from './cli-web.js'
/**
 * 用于初始化终端的应用，又称引导。默认导出必须遵循此格式。
 */
export interface BootApp {
  /** 应用包名。 */
  name: string
  /** 应用版本。 */
  version: string
  /** 应用注释。 */
  desc: string
  /** 启动此应用。 */
  start(handler: Terminal): Promise<void>
}
/**
 * 导出的一般应用。默认导出必须遵循此格式。
 */
export interface App {
  /** 应用名。同时作为可执行文件名字。 */
  name: string
  /** 应用版本。 */
  version: string
  /** 应用注释。 */
  desc: string
  /** 下载此应用的地址。通常用于更新。 */
  url: string
  /** 启动此应用。 */
  start(handler: Handler, args: string[]): Promise<number>
}
/**
 * 应用上下文。允许应用使用此上下文进行命令执行、安装/卸载应用、或获得终端等。
 */
export class Handler {
  private _term: RichTerminal
  private _app: App[]
  private find_index(name: string): number {
    for (const [index, item] of this._app.entries()) {
      if (item.name == name) return index
    }
    return -1
  }
  /**
   * 安装应用。
   * @param app 应用包。
   */
  install(app: App): void {
    const idx = this.find_index(app.name)
    if (idx == -1) {
      this._app.push(app)
    } else {
      this._app[idx] = app
    }
  }
  /**
   * 根据应用名寻找应用。
   * @param name 名字。
   * @returns    应用（如果有）。
   */
  find(name: string): App | undefined {
    const idx = this.find_index(name)
    if (idx == -1) return undefined
    return this._app[idx]
  }
  /**
   * 列出所有应用。
   * @returns 应用列表。
   */
  list(): App[] {
    return this._app
  }
  /**
   * 获得当前的终端。
   */
  get term(): RichTerminal {
    return this._term
  }
  /**
   * 删除由包名指定的App。
   * @param name 包名。
   * @returns    是否成功删除。
   */
  remove(name: string): boolean {
    const idx = this.find_index(name)
    if (idx == -1) {
      return false
    } else {
      this._app.splice(idx, 1)
    }
    return true
  }
  /**
   * 以名字和参数启动应用。
   * @param cmd 应用名字。
   * @param arg 传递给应用参数。
   * @returns   应用的返回值。
   */
  async exec(cmd: string, arg: string[]): Promise<number> {
    if (cmd == '' && arg.length == 0) return -1
    const exec = this.find(cmd)
    if (exec) {
      return await exec.start(this, arg)
    } else {
      this.term.write(`${cmd}: command not found\n`)
      return 127
    }
  }
  /**
   * 以命令启动应用。
   * @param cmd 命令。
   * @returns   应用的返回值。
   */
  async system(cmd: string): Promise<number> {
    const f: string[] = []
    let temp = ''
    for (let i = 0, a = 0, j = 0, z = false; i < cmd.length; i++) {
      if (cmd[i] == '\\') z = !z
      else if (cmd[i] == '"' && !z) {
        if (a == 0 || a == 1) a = a == 0 ? 1 : 0
      } else if (cmd[i] == '\'' && !z) {
        if (a == 0 || a == 2) a = a == 0 ? 2 : 0
      } else z = false
      if ((cmd[i] == '(' || cmd[i] == '{' || cmd[i] == '[') && a == 0) j++
      else if ((cmd[i] == ')' || cmd[i] == '}' || cmd[i] == ']') && a == 0) j--
      if (cmd[i] == ' ' && a == 0 && j == 0) {
        if (temp != '') f.push(temp)
        temp = ''
      } else temp += cmd[i]
    }
    if (temp != '') f.push(temp)
    return this.exec(f.length > 0 ? f[0] : '', f.slice(1))
  }
  constructor(term: RichTerminal, app?: App[]) {
    void ([this._term, this._app] = [term, app ?? []])
  }
}
/**
 * 生成 CSS 文本。
 * @param text  文本内容。
 * @param style CSS 设定。
 * @returns     生成的元素。
 */
export function CSSText(
  text: string,
  style: Partial<CSSStyleDeclaration> = {}
): HTMLSpanElement {
  const d = document.createElement('span')
  d.appendChild(document.createTextNode(text))
  for (const i in style) d.style[i] = style[i] ?? ''
  return d
}
/**
 * 生成链接。
 * @param text 文本内容。
 * @param link 链接。
 * @returns    生成的元素。
 */
export function Link(text: string, link: string): HTMLAnchorElement {
  const d = document.createElement('a')
  d.appendChild(document.createTextNode(text))
  d.href = link
  d.style.textDecoration = 'underline'
  d.style.color = 'white'
  d.target = '_blank'
  return d
}
