export default {
    name: 'clear',
    version: '1.0.0',
    desc: '清屏',
    url: '/dist/builtin/clear.js',
    start: async (handler) => {
        handler.term.clear();
        return 0;
    }
};
