const electron = require('electron'),
{app} = electron.remote;

;(function(win, $, ipc, document){
  'use strict';

  if (typeof win.hc === 'undefined') {
      win.hc = {};
  }

  /**
  * 
  * @class
  * @example 
  */
  win.hc.MenuTemplate = class MenuTemplate {
    defaults(){
        return {
        };
    }

    constructor(settings){
        this.options = $.extend({}, this.defaults(), settings);
        this.init();
    }

    init(){
      console.log(this.options.template)
      this.template = this.options.template;

      if (process.platform === 'darwin') {
        this.template.unshift({
          label: app.getName(),
          submenu: [
            {
              role: 'about'
            },
            {
              type: 'separator'
            },
            {
              role: 'services',
              submenu: []
            },
            {
              type: 'separator'
            },
            {
              role: 'hide'
            },
            {
              role: 'hideothers'
            },
            {
              role: 'unhide'
            },
            {
              type: 'separator'
            },
            {
              role: 'quit'
            }
          ]
        })
        // Edit menu.
        this.template[1].submenu.push(
          {
            type: 'separator'
          },
          {
            label: 'Speech',
            submenu: [
              {
                role: 'startspeaking'
              },
              {
                role: 'stopspeaking'
              }
            ]
          }
        )
        // Window menu.
        this.template[0].submenu = [
          {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
          },
          {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
          },
          {
            label: 'Zoom',
            role: 'zoom'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            role: 'front'
          }
        ]
      }

      if('undefined' !== typeof this.options.ENVIRONMENT && this.options.ENVIRONMENT !== "PROD"){
        // Edit menu.
        this.template[1].submenu.push(
          {
            type: 'separator'
          },
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click (item, focusedWindow) {
              if (focusedWindow) focusedWindow.reload()
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click (item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools()
            }
          }
        )
      }

      console.log(this.template)
    }
  };

})(window, jQuery, electron.ipcRenderer, document);
  

  // function init (){
  //   const menu = electron.Menu.buildFromTemplate(template);
  //   electron.Menu.setApplicationMenu(menu);
  // }
