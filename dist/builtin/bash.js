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
    name: 'bash',
    version: '1.0.0',
    desc: '内嵌命令行交互程序',
    url: '/dist/builtin/bash.js',
    start: (handler) => __awaiter(void 0, void 0, void 0, function* () {
        const { CSSText, Link } = yield import('../../src/util.js');
        handler.term.write('Welcome to FurryR blog v1.2.0 (cli-web 1.2.0-ghpages typescript)\n');
        handler.term.write('  * Documentation: ', Link('https://github.com/FurryR/FurryR.github.io', 'https://github.com/FurryR/FurryR.github.io'), '\n');
        handler.term.write(`  Now time ${new Date().toUTCString()}\n`);
        handler.term.write('To show help run: help\n\n\n');
        let ret = 0;
        for (;;) {
            handler.term.write(CSSText('Browser', { color: 'limegreen' }), ':', CSSText('~', { color: 'blue' }), '$ ');
            try {
                ret = yield handler.system(yield handler.term.getline());
            }
            catch (err) {
                ret = 127;
                console.error(err);
                handler.term.write('Aborted (core dumped)\n');
            }
            if (ret == -1)
                return 0;
            //if (r != -1) ret = r;
        }
    })
};
