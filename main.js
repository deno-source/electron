const { app, BrowserWindow, dialog, ipcMain, Tray, Menu, shell } = require('electron');
const puppeteer = require('puppeteer-core');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const path = require('path');
const fs = require('fs');
const mkdirsSync = require('./screen/mkdirsSync');
const { screenFolder, folder } = require('./screen/global.js');

const start = require('./screen/index.js');
const schedule = require("node-schedule");
var job = null;
var mainWin = null;
var cookies = [];

function updateCheckFn() {
    // const feedUrl = 'https://dianshangbat.cn/demo/screen/'; // 更新包位置
    // autoUpdater.setFeedURL(feedUrl);
    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
    }
    autoUpdater.checkForUpdates();
    // autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdatesAndNotify();
    // autoUpdater.on('error', error => {
    //     dialog.showErrorBox(error)
    // })
    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            title: '应用有新的更新！',
            message: '发现新版本，后台进行下载'
        })
        shell.openExternal("https://dianshangbat.cn/demo/screen/Setup.exe");
    })

    // autoUpdater.on('download-progress', progressObj => {
    //     console.log('下载进度', progressObj);
    // })

    // autoUpdater.on('update-downloaded', progressObj => {
    //     dialog.showMessageBox({
    //         title: '安装更新',
    //         message: '更新下载完毕，应用将进行安装！'
    //     }, () => {
    //         setImmediate(() => {
    //             autoUpdater.quitAndInstall()
    //         })
    //     })
    // })

    autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox({
            title: '无更新',
            message: '没有最新版本',
        })
    })

}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWin) {
            if (mainWin.isMinimized()) mainWin.restore()
            mainWin.focus()
            mainWin.show()
        }
    })
}

app.on('ready', function() {
    updateCheckFn();
    try {
        mkdirsSync(folder);
        ipcMain.on('screenshot', function(event, { chromeUrl, shopList, time }) {

            job = schedule.scheduleJob(`${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`, async function() {
                mainWin.webContents.send('start', true); //开始任务
                await start(chromeUrl, shopList, mainWin, cookies);
                mainWin.webContents.send('start', false); //结束任务
            });

        });
        ipcMain.on('cancelJob', function(event, ) {
            job && job.cancel();
        });
        ipcMain.on('close', function(event) {
            mainWin.close();
        });
        ipcMain.on('hide', function(event) {
            mainWin.hide();
        });
        ipcMain.on('getpath', function(event) {
            shell.openExternal(path.join(app.getAppPath(), '../../screenshot'));
        });
        ipcMain.on('login', async function start(event, msg) {
            const browser = await puppeteer.launch({
                headless: false,
                executablePath: msg,
                ignoreDefaultArgs: ["--enable-automation"],
                userDataDir: './user_data'
            });
            const page = await browser.newPage();
            await page.setViewport({
                width: 1920,
                height: 1500,
            });

            console.log(cookies)
            if (cookies.length > 0) {
                console.log('有了cookie')
                await page.goto('https://i.taobao.com/my_taobao.htm');
                await page.setCookie(...cookies);
                await page.waitFor(1000 * 60 * 10);
            } else {
                await page.goto('https://login.taobao.com/member/login.jhtml?tpl_redirect_url=https%3A%2F%2Fwww.tmall.com&style=miniall&enup=true&newMini2=true');
                await page.waitForSelector('.j_category.category-con');
                cookies = await page.cookies();
            }

            await browser.close();
        });

        mainWin = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: false,
            transparent: true,
            frame: false,
            webPreferences: {
                nodeIntegration: true, //可以使用node
                contextIsolation: false, //Electron 12.0以上版本需要的额外设置此项,否则不能使用node
                preload: path.join(__dirname, "preload.js")
            }
        });
        // mainWin.webContents.session.loadExtension('C:/Users/Administrator/Desktop/桌面/chromeTmall');
        isDev ? (mainWin.loadURL('http://localhost:3000/'), mainWin.webContents.openDevTools()) : mainWin.loadURL(`file://${path.join(__dirname, './build/index.html')}`);

        let trayMenuTemplate = [{ //检查更新
            label: '检查更新',
            click: function() {
                autoUpdater.checkForUpdates();
                autoUpdater.checkForUpdatesAndNotify();
            }
        }, { //系统托盘图标目录
            label: '退出小钟截图',
            click: function() {
                app.quit();
            }
        }];

        appTray = new Tray(path.join(__dirname, './app.png'));
        const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
        // 设置托盘悬浮提示
        appTray.setToolTip('小钟截图');
        // 设置托盘菜单
        appTray.setContextMenu(contextMenu);

        appTray.on('click', function() {
            // 显示主程序
            mainWin.show();
            // 关闭托盘显示
            // appTray.destroy();
        });
    } catch (e) {
        dialog.showMessageBox({
            title: '错误信息',
            message: JSON.stringify(e),
        })
    }
})