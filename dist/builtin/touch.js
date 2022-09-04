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
    name: 'touch',
    version: '1.0.0',
    desc: '创建文件',
    url: '/dist/builtin/touch.js',
    start: (handler, args) => __awaiter(void 0, void 0, void 0, function* () {
        const { File } = yield import('../../src/util.js');
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
    })
};
