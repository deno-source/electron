const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const start = require('./screen/index.js');
app.on('ready', function() {

    ipcMain.on('screenshot', async function(event, { chromeUrl, shopList }) {
        try {
            await start(chromeUrl, shopList);
        } catch (e) {
            event.reply('reply', e);
        }
        event.reply('reply', '截图完成！');
    })

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
        webPreferences: {
            nodeIntegration: true, //可以使用node
            contextIsolation: false, //Electron 12.0以上版本需要的额外设置此项,否则不能使用node
            preload: path.join(__dirname, "preload.js")
        }
    });
    // mainWin.webContents.session.loadExtension('C:/Users/Administrator/Desktop/桌面/chromeTmall');
    // mainWin.loadURL('http://localhost:3000/');
    mainWin.loadURL(`file://${path.join(__dirname,'./build/index.html')}`);
    // mainWin.loadURL(`https://adidas.tmall.com/`);
})