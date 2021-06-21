const sharp = require('sharp');
const fs = require('fs');
const delDir = require('./delDir.js');
const { shopName, picHeight, screenWidth, analyzerFolderName, screenFolder } = require('./global.js');

module.exports = async function mergeImages(shopName, analyzerFolderName = '') {
    let commonPath = `${screenFolder}${shopName}${analyzerFolderName}`
    var filesLen = fs.readdirSync(commonPath + "/").length;
    var fileList = new Array(filesLen).fill(0).map((item, index) => ({
        input: commonPath + "/" + shopName + '_' + index + '.png',
        top: index * picHeight,
        left: 0
    })); //读取文件清单
    await sharp({
            create: {
                width: screenWidth,
                height: filesLen * picHeight,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0.5 }
            }
        })
        .composite(fileList)
        .toFile(`${screenFolder}${shopName}_finalData/${shopName}${analyzerFolderName}` + '.png');
    
    console.log('合并完成删除目录：', commonPath)
    delDir(commonPath + '/')
}