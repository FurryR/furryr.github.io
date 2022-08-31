var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 应用上下文。允许应用使用此上下文进行命令执行、安装/卸载应用、或获得终端等。
 */
export class Handler {
    constructor(term, app) {
        void ([this._term, this._app] = [term, app !== null && app !== void 0 ? app : []]);
    }
    find_index(name) {
        for (const [index, item] of this._app.entries()) {
            if (item.name == name)
                return index;
        }
        return -1;
    }
    /**
     * 安装应用。
     * @param app 应用包。
     */
    install(app) {
        const idx = this.find_index(app.name);
        if (idx == -1) {
            this._app.push(app);
        }
        else {
            this._app[idx] = app;
        }
    }
    /**
     * 根据应用名寻找应用。
     * @param name 名字。
     * @returns    应用（如果有）。
     */
    find(name) {
        const idx = this.find_index(name);
        if (idx == -1)
            return undefined;
        return this._app[idx];
    }
    /**
     * 列出所有应用。
     * @returns 应用列表。
     */
    list() {
        return this._app;
    }
    /**
     * 获得当前的终端。
     */
    get term() {
        return this._term;
    }
    /**
     * 删除由包名指定的App。
     * @param name 包名。
     * @returns    是否成功删除。
     */
    remove(name) {
        const idx = this.find_index(name);
        if (idx == -1) {
            return false;
        }
        else {
            this._app.splice(idx, 1);
        }
        return true;
    }
    /**
     * 以名字和参数启动应用。
     * @param cmd 应用名字。
     * @param arg 传递给应用参数。
     * @returns   应用的返回值。
     */
    exec(cmd, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cmd == '' && arg.length == 0)
                return -1;
            const exec = this.find(cmd);
            if (exec) {
                return yield exec.start(this, arg);
            }
            else {
                this.term.write(`${cmd}: command not found\n`);
                return 127;
            }
        });
    }
    /**
     * 以命令启动应用。
     * @param cmd 命令。
     * @returns   应用的返回值。
     */
    system(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const f = [];
            let temp = '';
            for (let i = 0, a = 0, j = 0, z = false; i < cmd.length; i++) {
                if (cmd[i] == '\\')
                    z = !z;
                else if (cmd[i] == '"' && !z) {
                    if (a == 0 || a == 1)
                        a = a == 0 ? 1 : 0;
                }
                else if (cmd[i] == '\'' && !z) {
                    if (a == 0 || a == 2)
                        a = a == 0 ? 2 : 0;
                }
                else
                    z = false;
                if ((cmd[i] == '(' || cmd[i] == '{' || cmd[i] == '[') && a == 0)
                    j++;
                else if ((cmd[i] == ')' || cmd[i] == '}' || cmd[i] == ']') && a == 0)
                    j--;
                if (cmd[i] == ' ' && a == 0 && j == 0) {
                    if (temp != '')
                        f.push(temp);
                    temp = '';
                }
                else
                    temp += cmd[i];
            }
            if (temp != '')
                f.push(temp);
            return this.exec(f.length > 0 ? f[0] : '', f.slice(1));
        });
    }
}
/**
 * 生成 CSS 文本。
 * @param text  文本内容。
 * @param style CSS 设定。
 * @returns     生成的元素。
 */
export function CSSText(text, style = {}) {
    var _a;
    const d = document.createElement('span');
    d.appendChild(document.createTextNode(text));
    for (const i in style)
        d.style[i] = (_a = style[i]) !== null && _a !== void 0 ? _a : '';
    return d;
}
/**
 * 生成链接。
 * @param text 文本内容。
 * @param link 链接。
 * @returns    生成的元素。
 */
export function Link(text, link) {
    const d = document.createElement('a');
    d.appendChild(document.createTextNode(text));
    d.href = link;
    d.style.textDecoration = 'underline';
    d.style.color = 'white';
    d.target = '_blank';
    return d;
}
