module.exports = async function scrollToBottom(page) {
    return await page.evaluate(() => {
        return new Promise((res, rej) => {
            var style = document.createElement('style');
            style.innerHTML = '*{font-family: "微软雅黑" !important;}';
            document.body.appendChild(style);
            var totalH = 0;
            var distance = 500; //步进值
            var clientWidth = document.body.clientWidth;
            var selectorEle = '.rax-scrollview'; //淘宝专属滑动dom
            var scrollEle = document.querySelector(selectorEle) != null ? document.querySelector(selectorEle) : document.body;
            var scrollEleS = document.querySelector(selectorEle) != null ? document.querySelector(selectorEle) : window;
            var timer = setInterval(() => {
                var scrollHeight = scrollEle.scrollHeight;
                scrollEleS.scrollBy(0, distance);
                totalH += distance;
                if (document.querySelector('body > div.J_MIDDLEWARE_FRAME_WIDGET > div > a')) {
                    document.querySelector('body > div.J_MIDDLEWARE_FRAME_WIDGET > div > a').click();
                }
                if (totalH >= scrollHeight) {
                    clearInterval(timer);
                    scrollEleS.scrollTo(0, 0); //返回到顶部，然后再截图。防止从底部开始截图
                    res({
                        w: clientWidth,
                        h: scrollHeight
                            // h:document.querySelectorAll(selectorEle)[1].getClientRects()[0].height
                    })
                }
            }, 250)
            if (document.querySelector('body > div > span')) {
                if (document.querySelector('body > div > span').innerText === '加载中...') {
                    rej('页面截图太快，天猫loading不出来')
                }
            }
        })
    })
}