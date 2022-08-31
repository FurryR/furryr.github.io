var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Link } from '../util.js';
export default {
    name: 'help',
    version: '1.0.0',
    desc: '内嵌帮助',
    url: '/dist/builtin/help.js',
    start(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            handler.term.write('builtin help, version 1.1.0 (javascript-browser)\n');
            handler.term.write('若要获得所有可用的命令，请使用 apt list。\n');
            handler.term.write('This page is based on Project ', Link('Cli-Web', 'https://github.com/FurryR/cli-web'), '.\n');
            return 0;
        });
    }
};
