import { RichTerminal, Terminal } from './cli-web.js'
import { BootApp, Handler } from './util.js'
const REQUIRE_CMD = [
  '/dist/builtin/apt.js',
  '/dist/builtin/bash.js',
  '/dist/builtin/blog.js',
  '/dist/builtin/clear.js',
  '/dist/builtin/date.js',
  '/dist/builtin/echo.js',
  '/dist/builtin/exit.js',
  '/dist/builtin/help.js'
]
export default {
  name: 'init',
  version: '1.0.0',
  desc: '控制台初始化',
  async start(term: Terminal): Promise<void> {
    console.log('init start')
    const handler = new Handler(new RichTerminal(term))
    handler.term.write(
      '正在准备控制台。请稍等。\n此操作使用的时间取决于连接的质量。请确保在良好的网络下访问控制台。\n'
    )
    for (const [index, path] of REQUIRE_CMD.entries()) {
      handler.install((await import(path)).default)
      handler.term.write(
        `(${index + 1}/${REQUIRE_CMD.length})installed ${path}\n`
      )
    }
    handler.term.write('完成。\n')
    console.log('running builtin/bash')
    handler.term.clear()
    await handler.exec('bash', [])
  }
} as BootApp
