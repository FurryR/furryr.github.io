import { App, Handler } from '../util.js'

export default {
  name: 'cat',
  version: '1.0.0',
  desc: '显示文件内容',
  url: '/dist/builtin/cat.js',
  start: async (handler: Handler, args: string[]): Promise<number> => {
    const { Directory, File } = await import('../../src/util.js')
    if (args.length != 1) {
      handler.term.write('参数错误。请检查参数是否正确。\n')
      return 1
    }
    const fs = handler.fs.get(args[0])
    if (fs instanceof Directory) {
      handler.term.write('ls: Is a directory\n')
      return 1
    } else if (fs instanceof File) {
      handler.term.write(`${fs.content}\n`)
      return 0
    } else {
      handler.term.write('ls: File is not exist\n')
      return 1
    }
  }
} as App
