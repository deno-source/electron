const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { ipcMain } = require('electron');
const fetch = require('node-fetch');
const scrollToBottom = require('./scrollToBottom.js');
const mkdirsSync = require('./mkdirsSync.js');
const mergeImages = require('./mergeImages.js');
const { picHeight, screenWidth, analyzerFolderName, screenFolder } = require('./global.js');
const iPhone = puppeteer.devices['iPhone 11 Pro Max'];
var nowShopName = null;
var nowModuleList = null;
var resourceJsIndex = 1; //资源标记索引，记录当前是第几个js
var resourceCssIndex = 1; //资源标记索引，记录当前是第几个css
module.exports = async function start(chromeUrl, shopName, mainWindow) {
    console.log(chromeUrl, shopName)
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: chromeUrl
    });
    const page = await browser.newPage();
    await page.emulate(iPhone);

    await page.setRequestInterception(true); //开启请求拦截
    page.on('request', async request => { //注入links
        if (/shopmod|taobaowpmod/.test(request.url())) { //发现注入的模块里面都是有一个link:e.href||e.url,没有写入，所以这里对所有isv模块都进行一次处理
            let response = await fetch(request.url());
            let text = await response.text()
            text = text.replace(/,onClick:function\(\){/g, ',link:e.href||e.url,onClick:function(){')
            text = text.replace(/,onPress:function\(\){/g, ',link:t.href||t.url,onPress:function(){')
            await request.respond({ //模拟一个响应体返回
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                contentType: 'application/javascript;charset=UTF-8',
                body: text,
            });
        } else {
            await request.continue();
        }
    });
    page.on('response', async res => { //处理响应模块数据
        if (res.url().indexOf('alisitecdn.m.taobao.com') >= 0) {
            let modulesData = await res.json();
            fs.writeFileSync(screenFolder + `${nowShopName}_finalData/` + nowShopName + '_shopData.json', JSON.stringify(modulesData));
            nowModuleList = modulesData.module.moduleList.map(mod => mod.moduleNameDesc);
            let pages = [...new Set(modulesData.module.moduleList.filter(mod => mod.moduleData && mod.moduleData.pageIds).flatMap(mod => mod.moduleData && mod.moduleData.pageIds))];
            fs.writeFileSync(screenFolder + `${nowShopName}_finalData/` + nowShopName + '关联页面清单.txt', '当前页面链接：' + res.url() + '\n' + pages.join('\n'));
            //抓取其他页面的数据备份
            let baseUrl = res.url().split("&pageId=")[0];
            for (let pageid = 0; pageid < pages.length; pageid++) {
                let response = await fetch(baseUrl + "&pageId=" + pages[pageid]);
                let text = await response.json();
                fs.writeFileSync(screenFolder + `${nowShopName}_finalData/` + nowShopName + '_shopData' + '_' + pages[pageid] + '_' + text.module.globalData.title + '.json', JSON.stringify(text));
            }

            let moduleListType = Object.keys(modulesData.module.moduleSpecs).map(key => modulesData.module.moduleSpecs[key].moduleNameDesc);
            console.log('\n' + nowShopName + '页面模块类型：\n', moduleListType.join(','));
            console.log('\n' + nowShopName + '页面模块清单：\n', nowModuleList.join(','));
            console.log('\n' + nowShopName + '嗅探到关联到的页面ID：\n', pages.join(','));
        }
        if (res.url().endsWith('.js')) { //保存依赖的js文件
            let arr = res.url().split("/");
            let fileName = arr[arr.length - 1];
            let resJs = await res.text();
            fs.writeFileSync(screenFolder + `${nowShopName}_finalData/js/` + resourceJsIndex + "_" + fileName, '// ' + res.url() + '\n' + resJs);
            resourceJsIndex++;
        }
        if (res.url().endsWith('.css')) { //保存依赖的js,css文件
            let arr = res.url().split("/");
            let fileName = arr[arr.length - 1];
            let resJs = await res.text();
            fs.writeFileSync(screenFolder + `${nowShopName}_finalData/css/` + resourceCssIndex + "_" + fileName, '// ' + res.url() + '\n' + resJs);
            resourceCssIndex++;
        }
        if (res.url().endsWith('.webp') || res.url().endsWith('.jpg') || res.url().endsWith('.png')) { //保存依赖的js文件
            let arr = res.url().split("/");
            let fileName = arr[arr.length - 1];
            let resJs = await res.buffer();
            fs.writeFileSync(screenFolder + `${nowShopName}_finalData/img/` + fileName, resJs);

        }


    });

    for (let shop = 0; shop < shopName.length; shop++) {
        resourceCssIndex = 1;
        resourceJsIndex = 1;
        mkdirsSync(screenFolder + shopName[shop]); //创建临时截图文件夹
        mkdirsSync(screenFolder + shopName[shop] + analyzerFolderName); //创建临时分析文件夹
        mkdirsSync(screenFolder + `${shopName[shop]}_finalData/`); //创建最终文件夹，储存所有内容
        mkdirsSync(screenFolder + `${shopName[shop]}_finalData/js/`); //创建储存js的文件夹
        mkdirsSync(screenFolder + `${shopName[shop]}_finalData/css/`); //创建储存js的文件夹
        mkdirsSync(screenFolder + `${shopName[shop]}_finalData/img/`); //创建储存js的文件夹
        nowShopName = shopName[shop];
        await page.goto('https://' + shopName[shop] + '.m.tmall.com/');
        await page.setViewport({
            width: screenWidth,
            height: 900,
        });

        await page.waitFor(3500);

        await page.evaluate(() => {
            Array.from(document.querySelectorAll('.J_MIDDLEWARE_FRAME_WIDGET')).map(item => item.style.display = 'none')
            return Promise.resolve('ok')
        });

        let data = await scrollToBottom(page);
        await page.setViewport({
            width: screenWidth,
            height: data.h
        });
        await page.waitFor(2000);
        let html = await page.evaluate(() => {
            Array.from(document.querySelectorAll('.J_MIDDLEWARE_FRAME_WIDGET')).map(item => item.style.display = 'none')
            return Promise.resolve(document.getElementsByTagName('html')[0].innerHTML.replace(/src="\/\//g, 'src="https://').replace(/href="\/\//g, 'href="https://'));
        });
        fs.writeFileSync(screenFolder + `${nowShopName}_finalData/index.html`, html);

        let ImageHeight = picHeight; //截图限制高度一万像素，避免出现空白情况
        let tempLength = Math.ceil(data.h / ImageHeight);

        {

            for (let i = 0, j = 1; i < tempLength; i++) {
                let tempPath = path.join(screenFolder, shopName[shop], `${shopName[shop]}_${i}.png`);
                await page.screenshot({
                    path: tempPath,
                    clip: {
                        x: 0,
                        y: i * ImageHeight,
                        width: screenWidth,
                        height: j * ImageHeight
                    }
                }).then(res => {
                    console.log('截图了', i + 1, '/', tempLength, '张', '生成路径:', tempPath)
                }).catch(err => {
                    console.log('截图失败！', err);
                })
            }

            mergeImages(shopName[shop]) //合并图片
        }

        {
            console.log('开始分析页面链接和产品id以及页面样式布局......');

            await page.evaluate(nowModuleList => {

                document.querySelectorAll('.rax-view.module-list-wrapper>div').forEach((ele, index) => {
                    let oDiv = document.createElement('div');
                    oDiv.style.cssText = 'position: relative; padding: 5px 10px; font-size: 12px; color: rgb(255, 255, 255); z-index: 9999999; background-color: rgb(255, 110, 79); border-radius: 10px; box-shadow: rgb(255 161 140) 2px 2px 10px; width: 200px; left: 50%; box-sizing: border-box; margin-left: -100px;text-align:center;';
                    oDiv.innerText = (index + 1) + ':' + nowModuleList[index];
                    ele.insertBefore(oDiv, ele.firstChild);
                })
                return Promise.resolve('ok')
            }, nowModuleList); //第二个参数是上下文的变量，可以传入跟页面上的混合使用

            // await page.addStyleTag({ path: path.resolve("./inject/test.css") }); //注入css，显示页面上所有的热区位置
            // await page.addScriptTag({ path: path.resolve("./inject/ele.js") }); //注入js
            await page.evaluate(() => {
                let oStyle = document.createElement('style');
                oStyle.innerHTML = `div[data-spmd] {
                    border: 1px solid red !important;
                    box-sizing:border-box;
                }
                
                div[data-spmd]:after {
                    content: attr(link);
                    position: relative;
                    left: 0px;
                    top: 0px;
                    background: rgba(255, 255, 255,0.8);
                    z-index: 9999999;
                    font-size: 12px;
                    word-break: break-all;
                    word-wrap: break-word;
                    color: #ff5722;
                }`
                document.body.appendChild(oStyle);
                document.querySelectorAll('.a-view').forEach(ele => {
                    let name = ele.$$dataset && (ele.$$dataset.gid || ele.$$dataset.url || ele.$$dataset.href);
                    name && ele.setAttribute('link', name)
                })
            })

            for (let i = 0, j = 1; i < tempLength; i++) {
                let tempPath = path.join(screenFolder, shopName[shop] + analyzerFolderName, `${shopName[shop]}_${i}.png`);
                await page.screenshot({
                    path: tempPath,
                    clip: {
                        x: 0,
                        y: i * ImageHeight,
                        width: screenWidth,
                        height: j * ImageHeight
                    }
                }).then(res => {
                    console.log('截图了', i + 1, '/', tempLength, '张', '生成路径:', tempPath)
                }).catch(err => {
                    console.log('截图失败！', err);
                })
            }

            mergeImages(shopName[shop], analyzerFolderName) //合并图片
            mainWindow.webContents.send('successScreen', {
                shop: shopName[shop]
            });
        }
    }

    await browser.close();
}