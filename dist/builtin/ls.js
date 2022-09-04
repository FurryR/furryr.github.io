var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default {
    name: 'ls',
    version: '1.0.0',
    desc: '列出文件夹内容',
    url: '/dist/builtin/ls.js',
    start: (handler, args) => __awaiter(void 0, void 0, void 0, function* () {
        const { Directory, File } = yield import('../../src/util.js');
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
    })
};
