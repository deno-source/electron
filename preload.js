const loadApi = [
    'electron', // 引入 electron
    'fs',
];
loadApi.map((item) => {
    global[item] = require(item);
});