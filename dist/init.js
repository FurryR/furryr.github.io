import { RichTerminal } from './cli-web.js';
import { Directory, Handler } from './util.js';
export default {
    name: 'init',
    version: '1.0.0',
    desc: '控制台初始化',
    start: async (term, fs) => {
        const REQUIRE_CMD = [
            '../dist/builtin/apt.js',
            '../dist/builtin/bash.js',
            '../dist/builtin/blog.js',
            '../dist/builtin/clear.js',
            '../dist/builtin/date.js',
            '../dist/builtin/echo.js',
            '../dist/builtin/exit.js',
            '../dist/builtin/help.js',
            '../dist/builtin/ls.js',
            '../dist/builtin/cat.js',
            '../dist/builtin/mkdir.js',
            '../dist/builtin/rm.js',
            '../dist/builtin/touch.js'
        ];
        console.log('init start');
        const handler = new Handler(new RichTerminal(term), fs);
        fs.set('/tmp', new Directory());
        if (fs.test('/bin') != 2) {
            fs.set('/bin', new Directory());
            handler.term.write('正在准备控制台。请稍等。\n此操作使用的时间取决于连接的质量。请确保在良好的网络下访问控制台。\n');
            await Promise.all(REQUIRE_CMD.map(async (path) => {
                handler.app.install((await import(path)).default);
                handler.term.write(`Installed ${path}\n`);
            }));
            handler.term.write('完成。\n');
        }
        console.log('running builtin/bash');
        handler.term.clear();
        await handler.exec('bash', []);
    }
};
