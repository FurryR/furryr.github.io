import { RichTerminal, Terminal } from './cli-web.js'
export interface RawFile {
  type: 'file'
  content: string
}
/** 文件。 */
export class File {
  /** 文件内容。 */
  content: string
  /** 转换为JSON。 */
  toJSON(): RawFile {
    return {
      type: 'file',
      content: this.content
    }
  }
  /**
   * 从JSON转换。
   * @param s 目标。
   * @returns 转换完成的对象。
   */
  static from(s: RawFile): File {
    return new File(s.content)
  }
  constructor(content: string) {
    this.content = content
  }
}
export interface RawDirectory {
  type: 'directory'
  content: Record<string, RawFile | RawDirectory>
}
/** 文件夹 */
export class Directory {
  private map: Map<string, File | Directory>
  /**
   * 用于消除eslint错误。
   * @returns this对象
   */
  private self(): this {
    return this
  }
  /**
   * 获取文件或文件夹。
   * @param path 路径。
   * @returns    获取结果。可能失败。
   * @throws     Error
   */
  get(path: string): File | Directory | undefined {
    const s = path.split('/')
    let now: File | Directory = this.self()
    for (const item of s) {
      if (item == '') continue
      if (now instanceof Directory) {
        const tmp = now.map.get(item)
        if (!tmp) return undefined
        now = tmp
      } else {
        throw new Error('is not a directory')
      }
    }
    return now
  }
  /**
   * 判断文件或文件夹是否存在。
   * @param path 路径。
   * @returns    -1：路径有误。0：不存在。1：文件。2：文件夹。
   */
  test(path: string): -1 | 0 | 1 | 2 {
    try {
      const t = this.get(path)
      if (!t) return 0
      return t instanceof File ? 1 : 2
    } catch (_) {
      return -1
    }
  }
  /**
   * 设定文件或文件夹。
   * @param path 路径。
   * @returns    设定结果。可能失败。
   * @throws     Error
   */
  set(path: string, content: Directory | File): void {
    const s: string[] = path.split('/')
    let now: File | Directory = this.self()
    for (const item of s.slice(0, -1)) {
      if (item == '') continue
      if (now instanceof Directory) {
        const tmp = now.map.get(item)
        if (!tmp) throw Error('file is not exist')
        now = tmp
      } else {
        throw new Error('is not a directory')
      }
    }
    if (now instanceof File) {
      throw new Error('is not a directory')
    }
    now.map.set(s[s.length - 1], content)
    return
  }
  /**
   * 删除文件或文件夹。
   * @param path 路径。
   * @returns    删除结果。可能失败。
   * @throws     Error
   */
  remove(path: string): void {
    const s: string[] = path.split('/')
    let now: File | Directory = this.self()
    for (const item of s.slice(0, -1)) {
      if (item == '') continue
      if (now instanceof Directory) {
        const tmp = now.map.get(item)
        if (!tmp) throw Error('file is not exist')
        now = tmp
      } else {
        throw Error('is not a directory')
      }
    }
    if (now instanceof File) {
      throw new Error('is not a directory')
    }
    now.map.delete(s[s.length - 1])
    return
  }
  /**
   * 列出文件和文件夹。
   * @returns 用于迭代列表的迭代器。
   */
  list(): IterableIterator<[string, File | Directory]> {
    return this.map.entries()
  }
  /**
   * 转换为JSON。
   * @returns JSON。
   */
  toJSON(): RawDirectory {
    const tmp: Record<string, RawFile | RawDirectory> = {}
    this.map.forEach((val, key) => {
      tmp[key] = val.toJSON()
    })
    return {
      type: 'directory',
      content: tmp
    }
  }
  /**
   * 从JSON转换。
   * @param s JSON。
   * @returns 转换后的对象。
   */
  static from(s: RawDirectory): Directory {
    const map: Map<string, RawFile | RawDirectory> = new Map(
      Object.entries(s.content)
    )
    const ret: Map<string, File | Directory> = new Map()
    map.forEach((val, key) => {
      if (val.type == 'file') {
        ret.set(key, File.from(val))
      } else {
        ret.set(key, Directory.from(val))
      }
    })
    return new Directory(ret)
  }
  constructor(files: Map<string, File | Directory> = new Map()) {
    this.map = files
  }
}
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
  start: (handler: Terminal, fs: Directory) => Promise<void>
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
  start: (handler: Handler, args: string[]) => Promise<number>
}
export class AppIndex {
  private _fs: Directory
  private static stringify(obj: unknown): string {
    return JSON.stringify(obj, (key, value: unknown) => {
      if (key == 'start') {
        return `${value}`
      }
      return value
    })
  }
  private static parse(str: string): App {
    return JSON.parse(str, (key, value: unknown) => {
      if (key == 'start') {
        const fn = value as string
        return new Function(`return ${fn}`)()
      }
      return value
    })
  }
  private fs_unwrap(): Directory {
    const t = this._fs.get('/bin')
    if (!t || t instanceof File) throw new Error('/bin is not a directory')
    return t
  }
  private static file_unwrap(file: File | Directory | undefined): File {
    if (!file) throw new Error('file is not exist')
    if (file instanceof Directory) throw new Error('is not a directory')
    return file
  }
  /**
   * 安装应用。
   * @param app 应用包。
   */
  install(app: App): void {
    const a = this.fs_unwrap()
    a.set(app.name, new File(AppIndex.stringify(app)))
  }
  /**
   * 根据应用名寻找应用。
   * @param name 名字。
   * @returns    应用（如果有）。
   */
  find(name: string): App | undefined {
    const a = this.fs_unwrap()
    if (a.test(name) != 1) return undefined
    return AppIndex.parse(AppIndex.file_unwrap(a.get(name)).content)
  }
  /**
   * 列出所有应用。
   * @returns 应用列表。
   */
  list(): App[] {
    const a = this.fs_unwrap()
    const ret: App[] = []
    for (const [, item] of a.list()) {
      if (item instanceof Directory) continue
      ret.push(AppIndex.parse(item.content))
    }
    return ret
  }
  /**
   * 删除由名字指定的App。
   * @param name 名字。
   * @returns    是否成功删除。
   */
  remove(name: string): boolean {
    const a = this.fs_unwrap()
    if (a.test(name) != 1) return false
    a.remove(name)
    return true
  }
  constructor(fs: Directory) {
    this._fs = fs
    if (this._fs.test('/bin') != 2) throw Error('/bin is not exist')
  }
}
/**
 * 应用上下文。允许应用使用此上下文进行命令执行、安装/卸载应用、或获得终端等。
 */
export class Handler {
  private _term: RichTerminal
  private _fs: Directory
  /**
   * 获得当前的终端。
   */
  get term(): RichTerminal {
    return this._term
  }
  /**
   * 获得应用管理器上下文。
   */
  get app(): AppIndex {
    return new AppIndex(this._fs)
  }
  /**
   * 获得文件系统上下文。
   */
  get fs(): Directory {
    return this._fs
  }
  /**
   * 以名字和参数启动应用。
   * @param cmd 应用名字。
   * @param arg 传递给应用参数。
   * @returns   应用的返回值。
   */
  async exec(cmd: string, arg: string[]): Promise<number> {
    if (cmd == '' && arg.length == 0) return -1
    const exec = this.app.find(cmd)
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
  constructor(term: RichTerminal, fs: Directory) {
    void ([this._term, this._fs] = [term, fs])
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
