const scrollToBottom = require('./scrollToBottom');
const path = require('path');
module.exports = async function pcScreen(page, shopName, screenFolder) {
    await page.goto('https://' + shopName + '.tmall.com/');
    await page.setViewport({
        width: 1920,
        height: 1080,
    });
    let data = await scrollToBottom(page);
    await page.setViewport({
        width: 1920,
        height: data.h,
    });
    await page.screenshot({
        path: path.join(screenFolder, shopName + '_finalData', `/pc/${shopName}-pc.png`),
        fullPage: true
    }).catch(err => {
        console.log('截图失败！', err);
    })
}