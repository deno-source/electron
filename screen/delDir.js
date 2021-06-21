const fs = require('fs');
module.exports = function delDir(path) {
    try {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) {
                    delDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(path);
        }
    } catch (err) {
        console.log('目录删除异常')
    }
}