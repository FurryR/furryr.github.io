export default {
    name: 'rm',
    version: '1.0.0',
    desc: '删除文件或文件夹',
    url: '/dist/builtin/rm.js',
    start: async (handler, args) => {
        if (args.length != 1) {
            handler.term.write('参数错误。请检查参数是否正确。\n');
            return 1;
        }
        const ret = handler.fs.test(args[0]);
        if (ret == 0) {
            handler.term.write('rm: No such file or directory\n');
            return 0;
        }
        else if (ret == -1) {
            handler.term.write('rm: No such file or directory\n');
            return 1;
        }
        else {
            handler.fs.remove(args[0]);
            return 1;
        }
    }
};
