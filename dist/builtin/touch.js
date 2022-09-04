export default {
    name: 'touch',
    version: '1.0.0',
    desc: '创建文件',
    url: '/dist/builtin/touch.js',
    start: async (handler, args) => {
        const { File } = await import('../../src/util.js');
        if (args.length != 1) {
            handler.term.write('参数错误。请检查参数是否正确。\n');
            return 1;
        }
        const ret = handler.fs.test(args[0]);
        if (ret == 0) {
            handler.fs.set(args[0], new File(''));
            return 0;
        }
        else if (ret == -1) {
            handler.term.write('touch: No such file or directory\n');
            return 1;
        }
        else {
            handler.term.write('touch: File or directory already exists\n');
            return 1;
        }
    }
};
