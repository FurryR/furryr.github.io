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
    name: 'echo',
    version: '1.0.0',
    desc: '输出参数到标准输出',
    url: '/dist/builtin/echo.js',
    start(handler, args) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const n of args) {
                if (n[0] != '"') {
                    handler.term.write(`${n} `);
                }
                else {
                    try {
                        handler.term.write(`${JSON.parse(n)} `);
                    }
                    catch (_) {
                        handler.term.write(`\necho: Syntax error near \`${n}\`\n`);
                        return 1;
                    }
                }
            }
            handler.term.write('\n');
            return 0;
        });
    }
};
