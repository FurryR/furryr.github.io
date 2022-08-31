import { App, Handler } from '../util.js'

export default {
  name: 'clear',
  version: '1.0.0',
  desc: '清屏',
  url: '/dist/builtin/clear.js',
  async start(handler: Handler): Promise<number> {
    handler.term.clear()
    return 0
  }
} as App
