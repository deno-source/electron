const { app, BrowserWindow, dialog, ipcMain, Tray, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const path = require('path');
const start = require('./screen/index.js');
const schedule = require("node-schedule");
var job = null;

app.on('ready', function() {

    ipcMain.on('screenshot', function(event, { chromeUrl, shopList, time }) {
        console.log(time)
        try {
            job = schedule.scheduleJob(`${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} * * *`, async function() {
                await start(chromeUrl, shopList, mainWin);
            });
        } catch (e) {
            event.reply('reply', e);
        }
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

    // autoUpdater.autoDownload = false;
    // autoUpdater.checkForUpdatesAndNotify();
    // autoUpdater.on('error', error => {
    //     dialog.showErrorBox(error)
    // })
    // autoUpdater.on('update-avaiable', () => {
    //     dialog.showMessageBox({
    //         type: 'info',
    //         title: '应用有新的更新！',
    //         message: '发现新版本，是否现在更新？',
    //         buttons: ['是', '否']
    //     }, (buttonIndex) => {
    //         buttonIndex === 0 && autoUpdater.downloadUpdate()
    //     })
    // })
    // autoUpdater.on('update-not-avaiable', () => {
    //     dialog.showMessageBox({
    //         title: '无更新',
    //         message: '没有最新版本',
    //     })
    // })
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

    // mainWin.loadURL(`https://adidas.tmall.com/`);
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

})