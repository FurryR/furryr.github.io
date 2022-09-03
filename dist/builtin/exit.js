export default {
    name: 'exit',
    version: '1.0.0',
    desc: '退出终端',
    url: '/dist/builtin/exit.js',
    start: async (handler) => {
        handler.term.write('logout\n');
        return -1;
    }
};
