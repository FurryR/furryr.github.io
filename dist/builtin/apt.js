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
    name: 'apt',
    version: '1.0.1',
    desc: '内嵌应用管理工具',
    url: '/dist/builtin/apt.js',
    start: (handler, args) => __awaiter(void 0, void 0, void 0, function* () {
        const { Link, CSSText } = yield import('../../src/util.js');
        if (args.length < 1 || args[0] == '--help') {
            handler.term.write('内嵌应用管理器 apt 1.0.1\n');
            handler.term.write('使用：apt command [options]\n');
            handler.term.write('命令：\n');
            handler.term.write('  list - 列出所有已安装的应用程序。\n');
            handler.term.write('  install - 从给定的地址安装应用程序。\n');
            handler.term.write('  show - 显示应用程序的详细信息。\n');
            handler.term.write('  full-upgrade - 更新全部应用程序。\n');
            handler.term.write('  upgrade - 更新指定的应用程序。\n');
            handler.term.write('  remove - 删除指定的应用程序。\n');
            handler.term.write('  version - 获得apt的版本。\n');
            handler.term.write('\n您可以在指定命令后加入--help，并获得关于这个命令的帮助信息。\n');
            return 0;
        }
        switch (args[0]) {
            case 'list': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt list\n');
                    handler.term.write('列出已安装的所有应用。\n');
                    return 0;
                }
                else if (args.length != 1) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                const list = handler.app.list();
                handler.term.write('已安装的应用：\n');
                for (const d of list) {
                    handler.term.write(Link(d.name, d.url), ` ${d.version} ${d.desc}\n`);
                }
                return 0;
            }
            case 'full-upgrade': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt full-upgrade\n');
                    handler.term.write('更新全部应用程序。\n');
                    return 0;
                }
                else if (args.length != 1) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                handler.term.write('开始更新全部应用...\n');
                for (const app of handler.app.list()) {
                    handler.term.write('正在更新应用 ', Link(app.name, app.url), '...\n');
                    try {
                        const newapp = (yield import(app.url)).default;
                        handler.term.write('正在覆盖 ', Link(newapp.name, newapp.url), ` ${app.version} -> ${newapp.version}\n`);
                        handler.app.install(newapp);
                    }
                    catch (err) {
                        console.error(err);
                        handler.term.write(CSSText('E:', {
                            color: 'red'
                        }), ' 在更新应用 ', Link(app.name, app.url), ' 时发生错误。\n');
                        return 1;
                    }
                }
                handler.term.write('更新完成。\n');
                return 0;
            }
            case 'upgrade': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt upgrade name\n');
                    handler.term.write('升级应用。name为一个应用的名字。\n');
                    return 0;
                }
                else if (args.length != 2) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                const app = handler.app.find(args[1]);
                if (!app) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ` 找不到应用 ${args[1]}。请检查您的拼写。\n`);
                    return 1;
                }
                else {
                    handler.term.write('正在更新应用 ', Link(app.name, app.url), '...\n');
                    try {
                        const newapp = (yield import(app.url)).default;
                        handler.term.write('正在覆盖 ', Link(newapp.name, newapp.url), ` ${app.version} -> ${newapp.version}\n`);
                        handler.app.install(newapp);
                        handler.term.write('安装完成。\n');
                        return 0;
                    }
                    catch (err) {
                        console.error(err);
                        handler.term.write(CSSText('E:', {
                            color: 'red'
                        }), ' 在更新应用 ', Link(app.name, app.url), ' 时发生错误。\n');
                        return 1;
                    }
                }
            }
            case 'version': {
                handler.term.write('内嵌应用管理器 apt 1.0.1\n');
                handler.term.write('此程序基于 MIT 开源协议开源。\n');
                handler.term.write('线上内容警告：\n');
                handler.term.write('apt 允许您从任何地方下载应用，包括第三方源，其中很可能包含有害应用，并可能导致您的设备处于危险之中。\n');
                handler.term.write('当下载应用时，请确保应用是您信任的，并确保保持应用在最新版本。\n');
                handler.term.write('apt 不会对您下载的应用进行任何检查和限制，因此您应自行承担下载恶意应用的后果。\n');
                return 0;
            }
            case 'install': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt install url\n');
                    handler.term.write('从url安装应用。url为一个地址。\n');
                    return 0;
                }
                else if (args.length != 2) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                handler.term.write('正在从 ', Link(args[1], args[1]), ' 取得应用...\n');
                try {
                    const app = (yield import(args[1])).default;
                    handler.term.write('正在安装 ', Link(app.name, app.url), `(${app.version})...\n`);
                    handler.app.install(app);
                    handler.term.write('安装完成。\n');
                    return 0;
                }
                catch (err) {
                    console.error(err);
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 在从 ', Link(args[1], args[1]), ' 取得应用时发生错误。\n');
                    return 1;
                }
            }
            case 'remove': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt remove name\n');
                    handler.term.write('移除应用name。name为一个应用的名字。\n');
                    return 0;
                }
                else if (args.length != 2) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                if (args[1] == 'apt') {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 此应用非常重要，并且不能被删除。\n');
                    return 1;
                }
                const app = handler.app.find(args[1]);
                if (!app) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ` 找不到应用 ${args[1]}。请检查您的拼写。\n`);
                    return 1;
                }
                else {
                    handler.term.write('正在移除应用 ', Link(app.name, app.url), `(${app.version})...\n`);
                    handler.app.remove(app.name);
                    handler.term.write('移除完成。\n');
                }
                return 0;
            }
            case 'show': {
                if (args.length == 2 && args[1] == '--help') {
                    handler.term.write('使用：apt show name\n');
                    handler.term.write('显示应用name的详细信息。name为一个应用的名字。\n');
                    return 0;
                }
                else if (args.length != 2) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ' 参数错误。请检查您的拼写。\n');
                    return 1;
                }
                const app = handler.app.find(args[1]);
                if (!app) {
                    handler.term.write(CSSText('E:', {
                        color: 'red'
                    }), ` 找不到应用 ${args[1]}。请检查您的拼写。\n`);
                    return 1;
                }
                else {
                    handler.term.write(Link(app.name, app.url), `(${app.version})\n`);
                    handler.term.write(`注释：${app.desc}\n`);
                }
                return 0;
            }
            default: {
                handler.term.write(CSSText('E:', {
                    color: 'red'
                }), ` 未知的命令 ${args[0]}。请检查您的拼写。\n`);
                return 1;
            }
        }
    })
};
