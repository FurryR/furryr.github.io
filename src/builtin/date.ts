import { App, Handler } from '../util.js'

export default {
  name: 'date',
  version: '1.0.0',
  desc: '获得当前时间',
  url: '/dist/builtin/date.js',
  async start(handler: Handler): Promise<number> {
    const d = new Date()
    handler.term.write(`Now date: ${d.toUTCString()}(${d.getTime()})\n`)
    return 0
  }
} as App
