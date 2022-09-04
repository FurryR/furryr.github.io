var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RichTerminal } from './cli-web.js';
import { Directory, Handler } from './util.js';
export default {
    name: 'init',
    version: '1.0.0',
    desc: '控制台初始化',
    start: (term, fs) => __awaiter(void 0, void 0, void 0, function* () {
        const REQUIRE_CMD = [
            '/dist/builtin/apt.js',
            '/dist/builtin/bash.js',
            '/dist/builtin/blog.js',
            '/dist/builtin/clear.js',
            '/dist/builtin/date.js',
            '/dist/builtin/echo.js',
            '/dist/builtin/exit.js',
            '/dist/builtin/help.js',
            '/dist/builtin/ls.js',
            '/dist/builtin/cat.js',
            '/dist/builtin/mkdir.js',
            '/dist/builtin/rm.js',
            '/dist/builtin/touch.js'
        ];
        console.log('init start');
        const handler = new Handler(new RichTerminal(term), fs);
        fs.set('/tmp', new Directory());
        if (fs.test('/bin') != 2) {
            fs.set('/bin', new Directory());
            handler.term.write('正在准备控制台。请稍等。\n此操作使用的时间取决于连接的质量。请确保在良好的网络下访问控制台。\n');
            for (const [index, path] of REQUIRE_CMD.entries()) {
                handler.app.install((yield import(path)).default);
                handler.term.write(`(${index + 1}/${REQUIRE_CMD.length})installed ${path}\n`);
            }
            handler.term.write('完成。\n');
        }
        console.log('running builtin/bash');
        handler.term.clear();
        yield handler.exec('bash', []);
    })
};
