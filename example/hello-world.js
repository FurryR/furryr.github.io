/// <reference path="../src/util.ts" />
export default {
  /** 程序可执行文件的名字 */
  name: 'hello-world',
  /** 程序的版本 */
  version: '1.0.0',
  /** 程序的注释 */
  desc: 'Sample Hello World Plugin',
  /** 程序更新的地址 */
  url: '/example/hello-world.js',
  /** 启动程序 */
  async start(handler, args) {
    /** handler为util.js中的Handler类型。 */
    /** args为string数组。 */
    /** 更多内容请参见cli-web(https://github.com/FurryR/cli-web)和util.ts。在必要的时候您可以将它们复制出来，但很多时候只要把CSSText和Link复制出来就好了，其他的——看上面吧。 */
    handler.term.write('Hello World!\n')
    handler.term.write(`Specified argument(s): ${args.join()}\n`)
  }
}
