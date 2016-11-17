const electron = require('electron'),
fs = require('fs'),
async = require('async'),
path = require('path'),
_ = require('underscore');

const config = require('./config');

const winMenu = require('./layout/win-menu');

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// const ipcMain = electron.ipcMain
let mainWindow;

var dirPath = electron.app.getPath('userData') + path.sep + "captures";
if (!fs.existsSync(dirPath)){
  fs.mkdirSync(dirPath);
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200
    , height: 750
    // , frame: false
  })
  
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/../templates/index.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  //Send Data
  mainWindow.webContents.on('did-finish-load', () => {
    config.srcPath = `${__dirname}`
    config.mainId = mainWindow.id
    mainWindow.webContents.send('info', config)
  })

  // ipcMain.on('ipc', (event, arg)=> console.log(arg));

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

electron.app.addRecentDocument('file://${__dirname}/../work.type')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on('ready', createWindow)

// Quit when all windows are closed.
electron.app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    electron.app.quit()
  }
})

electron.app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
