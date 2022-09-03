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
  start: async (handler, args) => {
    /** handler为util.js中的Handler类型。 */
    /** args为string数组。 */
    /** 更多内容请参见cli-web(https://github.com/FurryR/cli-web)和util.ts。对于类型，请使用静态import（Typescript限定），但对于值，请使用函数内dynamic import。 */
    handler.term.write('Hello World!\n')
    handler.term.write(`Specified argument(s): ${args.join()}\n`)
  }
}
