var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Terminal {
    constructor(obj) {
        this.buffer = [];
        this.inputlock = false;
        this.resolve = [];
        ;
        [this.obj, this.input] = [
            obj,
            ((val) => {
                val.style.opacity = val.style.width = val.style.height = '0';
                val.title = val.placeholder = 'Cli-Web';
                val.addEventListener('compositionstart', () => void (this.inputlock = true));
                val.addEventListener('compositionend', () => {
                    this.inputlock = false;
                    if (val.value != '')
                        val.dispatchEvent(new InputEvent('input'));
                });
                val.addEventListener('keydown', (ev) => {
                    if (ev.key.length > 1) {
                        this.ret(ev.key);
                        return false;
                    }
                    return true;
                });
                val.addEventListener('input', () => {
                    if (!this.inputlock) {
                        if (val.value.length > 1)
                            this.buffer.push(...val.value.slice(1));
                        this.ret(val.value[0]);
                        val.value = '';
                    }
                });
                return val;
            })(document.createElement('input'))
        ];
        this.obj.appendChild(this.input);
        this.obj.addEventListener('click', () => this.input.focus());
    }
    span(text) {
        const d = document.createElement('span');
        d.appendChild(new Text(text));
        return d;
    }
    ret(val) {
        if (this.resolve.length > 0) {
            this.resolve[0](val);
            this.resolve = this.resolve.slice(1);
        }
        else
            this.buffer.push(val);
    }
    setContent(elem) {
        while (this.obj.children.length != 1)
            this.obj.removeChild(this.obj.children[0]);
        let temp = '';
        const f = new DocumentFragment();
        elem.forEach((obj) => {
            if (obj instanceof HTMLElement) {
                if (temp != '') {
                    f.appendChild(this.span(temp));
                    temp = '';
                }
                f.appendChild(obj);
            }
            else
                temp += obj;
        });
        if (temp != '')
            f.appendChild(this.span(temp));
        this.obj.insertBefore(f, this.input);
    }
    getch() {
        return new Promise((resolve) => {
            if (this.buffer.length != 0) {
                resolve(this.buffer[0]);
                this.buffer = this.buffer.slice(1);
                return;
            }
            this.resolve.push((val) => resolve(val));
        });
    }
}
export class RichTerminal {
    constructor(obj) {
        this.term_buffer = [];
        this._cursor = 0;
        this.obj = obj;
    }
    putchar(elem) {
        if (elem instanceof HTMLElement) {
            this.term_buffer[this.cursor] = elem;
            this.cursor++;
        }
        else {
            if (elem == '\n')
                this.term_buffer[this.cursor] = document.createElement('br');
            else
                this.term_buffer[this.cursor] = elem;
            this.cursor++;
        }
    }
    get cursor() {
        return this._cursor;
    }
    set cursor(newVal) {
        if (newVal > this.length)
            this._cursor = this.length;
        else
            this._cursor = newVal;
    }
    get length() {
        return this.term_buffer.length;
    }
    clear() {
        this.cursor = (this.term_buffer = []).length;
        this.obj.setContent(this.term_buffer);
    }
    setContent(elem) {
        this.cursor = (this.term_buffer = elem).length;
        this.obj.setContent(elem);
    }
    getch() {
        return this.obj.getch();
    }
    write(...str) {
        for (const i of str) {
            if (i instanceof HTMLElement) {
                this.putchar(i);
            }
            else {
                for (const s of i)
                    this.putchar(s);
            }
        }
        this.obj.setContent(this.term_buffer);
    }
    getline() {
        return __awaiter(this, void 0, void 0, function* () {
            function updateStr(buffer, pos, str) {
                return [...buffer.slice(0, pos), ...str];
            }
            const cursor_temp = this.cursor;
            let fin = '', cursor = 0;
            for (;;) {
                const i = yield this.getch();
                switch (i) {
                    case 'ArrowLeft': {
                        if (cursor > 0)
                            cursor--;
                        break;
                    }
                    case 'ArrowRight': {
                        if (cursor < fin.length)
                            cursor++;
                        break;
                    }
                    case 'Backspace': {
                        if (cursor > 0) {
                            fin = fin.slice(0, cursor - 1) + fin.slice(cursor--);
                            this.term_buffer = updateStr(this.term_buffer, (this.cursor = cursor_temp), Array.from(fin));
                            this.obj.setContent(this.term_buffer);
                        }
                        break;
                    }
                    case 'Enter': {
                        this.cursor = this.length;
                        this.write('\n');
                        return fin;
                    }
                    default: {
                        if (i.length == 1) {
                            fin = fin.slice(0, cursor) + i + fin.slice(cursor++);
                            this.term_buffer = updateStr(this.term_buffer, (this.cursor = cursor_temp), Array.from(fin));
                            this.obj.setContent(this.term_buffer);
                        }
                    }
                }
            }
        });
    }
}
