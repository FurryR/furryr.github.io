export default {
    name: 'echo',
    version: '1.0.0',
    desc: '输出参数到标准输出',
    url: '/dist/builtin/echo.js',
    start: async (handler, args) => {
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
    }
};
