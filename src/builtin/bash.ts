import { App, CSSText, Handler, Link } from '../util.js'

export default {
  name: 'bash',
  version: '1.0.0',
  desc: '内嵌命令行交互程序',
  url: '/dist/builtin/bash.js',
  async start(handler: Handler): Promise<number> {
    handler.term.write(
      'Welcome to FurryR\'s blog v1.1.0 (cli-web 1.1.0-ghpages typescript)\n'
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
      ret = await handler.system(await handler.term.getline())
      if (ret == -1) return 0
      //if (r != -1) ret = r;
    }
  }
} as App
