const fs = require('fs');
const path = require('path');
module.exports = function mkdirsSync(dirname) {
    // 如果文件夹存在，返回true
    if (fs.existsSync(dirname)) {
        return true;
    }
    // 如果文件夹不存在，
    else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true
        }
    }
}