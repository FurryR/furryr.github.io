import { App, Handler } from '../util.js'

export default {
  name: 'exit',
  version: '1.0.0',
  desc: '退出终端',
  url: '/dist/builtin/exit.js',
  start: async (handler: Handler): Promise<number> => {
    handler.term.write('logout\n')
    return -1
  }
} as App
