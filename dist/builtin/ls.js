export default {
    name: 'ls',
    version: '1.0.0',
    desc: '列出文件夹内容',
    url: '/dist/builtin/ls.js',
    start: async (handler, args) => {
        const { Directory, File } = await import('../../src/util.js');
        if (args.length != 1) {
            handler.term.write('参数错误。请检查参数是否正确。\n');
            return 1;
        }
        const fs = handler.fs.get(args[0]);
        if (fs instanceof Directory) {
            for (const [index] of fs.list()) {
                handler.term.write(index, ' ');
            }
            handler.term.write('\n');
            return 1;
        }
        else if (fs instanceof File) {
            handler.term.write(args[0]);
            handler.term.write('\n');
            return 0;
        }
        else {
            handler.term.write('ls: File is not exist\n');
            return 1;
        }
    }
};
