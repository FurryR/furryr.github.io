import { App, Handler } from '../util.js'

export default {
  name: 'bash',
  version: '1.0.0',
  desc: '内嵌命令行交互程序',
  url: '/dist/builtin/bash.js',
  start: async (handler: Handler): Promise<number> => {
    const { CSSText, Link } = await import('../../src/util.js')
    handler.term.write(
      'Welcome to FurryR blog v1.2.0 (cli-web 1.2.0-ghpages typescript)\n'
    )
    handler.term.write(
      '  * Documentation: ',
      Link(
        'https://github.com/FurryR/FurryR.github.io',
        'https://github.com/FurryR/FurryR.github.io'
      ),
      '\n'
    )
    handler.term.write(`  Now time ${new Date().toUTCString()}\n`)
    handler.term.write('To show help run: help\n\n\n')
    let ret = 0
    for (;;) {
      handler.term.write(
        CSSText('Browser', { color: 'limegreen' }),
        ':',
        CSSText('~', { color: 'blue' }),
        '$ '
      )
      try {
        ret = await handler.system(await handler.term.getline())
      } catch (err) {
        ret = 127
        console.error(err)
        handler.term.write('Aborted (core dumped)\n')
      }
      if (ret == -1) return 0
      //if (r != -1) ret = r;
    }
  }
} as App
