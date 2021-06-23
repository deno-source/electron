const { app, BrowserWindow, dialog, ipcMain, Tray, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const path = require('path');
const mkdirsSync = require('./screen/mkdirsSync');
const { screenFolder, folder } = require('./screen/global.js');

const start = require('./screen/index.js');
const schedule = require("node-schedule");
var job = null;

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

    // autoUpdater.on('update-not-available', () => {
    //     dialog.showMessageBox({
    //         title: '无更新',
    //         message: '没有最新版本',
    //     })
    // })

}

app.on('ready', function() {
    try {
        updateCheckFn();
        mkdirsSync(folder);
        ipcMain.on('screenshot', function(event, { chromeUrl, shopList, time }) {
            console.log(time);
            job = schedule.scheduleJob(`${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`, async function() {
                await start(chromeUrl, shopList, mainWin);
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


        let mainWin = new BrowserWindow({
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

        let trayMenuTemplate = [{ //系统托盘图标目录
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
        event.reply('reply', JSON.stringify(e));
    }
})