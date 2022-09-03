export default {
    name: 'date',
    version: '1.0.0',
    desc: '获得当前时间',
    url: '/dist/builtin/date.js',
    start: async (handler) => {
        const d = new Date();
        handler.term.write(`Now date: ${d.toUTCString()}(${d.getTime()})\n`);
        return 0;
    }
};
