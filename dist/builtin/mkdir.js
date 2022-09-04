export default {
    name: 'mkdir',
    version: '1.0.0',
    desc: '创建文件夹',
    url: '/dist/builtin/mkdir.js',
    start: async (handler, args) => {
        const { Directory } = await import('../../src/util.js');
        if (args.length != 1) {
            handler.term.write('参数错误。请检查参数是否正确。\n');
            return 1;
        }
        const ret = handler.fs.test(args[0]);
        if (ret == 0) {
            handler.fs.set(args[0], new Directory());
            return 0;
        }
        else if (ret == -1) {
            handler.term.write('mkdir: No such file or directory\n');
            return 1;
        }
        else {
            handler.term.write('mkdir: File or directory already exists\n');
            return 1;
        }
    }
};
