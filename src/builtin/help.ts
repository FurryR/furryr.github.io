import { App, Handler } from '../util.js'

export default {
  name: 'help',
  version: '1.0.0',
  desc: '内嵌帮助',
  url: '/dist/builtin/help.js',
  start: async (handler: Handler): Promise<number> => {
    const { Link } = await import('../../src/util.js')
    handler.term.write('builtin help, version 1.1.0 (javascript-browser)\n')
    handler.term.write('若要获得所有可用的命令，请使用 apt list。\n')
    handler.term.write(
      'This page is based on Project ',
      Link('Cli-Web', 'https://github.com/FurryR/cli-web'),
      '.\n'
    )
    return 0
  }
} as App
