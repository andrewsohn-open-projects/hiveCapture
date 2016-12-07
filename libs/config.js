const electron = require('electron');
const app = electron.app;
const path = require('path');
const env = "DEV"; // DEV, TEST, PROD

const fileNames = {
  'data':'data.json',
  'history':'history.json'
};

module.exports = {
  'fileNames' : fileNames,
  'dataPath' : app.getPath('userData') + path.sep + fileNames.data,
  'historyPath' : app.getPath('userData') + path.sep + fileNames.history,
  'popUpVisible' : false,
  'ENVIRONMENT' : env,
  'defaultStruct' : {
    'data':{"data":[]},
    'history':{"data":[]}
  },
  'template' : [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+N' : 'Ctrl+Shift+N',
          click (item, focusedWindow) {
            if (focusedWindow) console.log(item, focusedWindow)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Import CSV',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+N' : 'Ctrl+Shift+N',
          click (item, focusedWindow) {
            if (focusedWindow) console.log(item, focusedWindow)
          }
        },
        {
          label: 'Export CSV',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+N' : 'Ctrl+Shift+N',
          click (item, focusedWindow) {
            if (focusedWindow) console.log(item, focusedWindow)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'History',
          type: 'submenu',
          submenu: [

          ]
        },
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://github.com/hivelab-open-projects/hiveCapture') }
        },{
          label: 'About Us',
          click () { require('electron').shell.openExternal('http://www.hivelab.co.kr/') }
        }
      ]
    }
  ]
};