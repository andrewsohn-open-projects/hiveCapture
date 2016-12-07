const electron = require('electron'),
// storage = require('electron-json-storage'),
// fs = require('fs'),
// async = require('async'),
path = require('path'),
_ = require('underscore');

const {app} = require('electron').remote;

;(function(win, $, ipc){
    'use strict';

    if (typeof win.hc === 'undefined') {
        win.hc = {};
    }

    /**
    * 
    * @class
    * @example 
    */
    win.hc.MainMenu = class MainMenu {
        defaults(){
            this.body = $('body');
            
            return {
                
            };
        }

        constructor(settings){
            this.options = $.extend({}, this.defaults(), settings);
            this.init();
        }

        init(){
            let _this = this;
            console.log(app.getAppPath())
            if (document.readyState === 'complete' || document.readyState === 'interactive') _this.installTitlebarMenubar();
            else document.addEventListener('DOMContentLoaded', _this.installTitlebarMenubar);
        }

        installTitlebarMenubar() {
            if (window.electron_titlebar_installed === true) return;

            console.log('!!!')

            let titlebar = document.getElementById('electron-titlebar');
            if (!titlebar) return;

            window.electron_titlebar_installed = true;

            if (titlebar.classList.contains('drag')) {
                let drag = document.createElement('div');
                drag.style.position = 'absolute';
                drag.style.width = '100%';
                drag.style.height = '100%';
                drag.style.top = '0';
                drag.style.left = '0';
                drag.className = 'drag';
                titlebar.appendChild(drag);
            }

            let container = document.createElement('div');
            container.style.position = 'relative';
            // container.style.top = "-48px";
            // container.style.left = 0;
            // container.style.right = 0;
            titlebar.parentNode.replaceChild(container, titlebar);
            container.appendChild(titlebar);

            let content = document.createElement('div');
            content.style.width = '100%';
            content.style.height = '100%';
            content.style.position = 'absolute';

            while (titlebar.firstChild) content.appendChild(titlebar.firstChild);
            titlebar.appendChild(content);

            const platform = titlebar.getAttribute('platform') || process.platform;
            document.body.parentNode.setAttribute('electron-titlebar-platform', platform);

            const w = require('electron').remote.getCurrentWindow();
            if (!w.isResizable() || !w.isMaximizable()) titlebar.classList.add('no-maximize');
            if (!w.isMinimizable()) titlebar.classList.add('no-minimize');

            const path = require('path'),
                  url = require('url');
            

            if (platform !== 'darwin') {
                function createButton(type) {
                    function createImage(type, display) {
                        if (typeof display !== 'string') display = '';
                        let img = document.createElement('img');
                        img.style.display = display;
                        img.className = 'button-img-' + type;

                        let src;
                        if (platform === 'linux') src = app.getAppPath() + path.sep + "css" + path.sep + type + '.svg';
                        else if (platform === 'win32') src = app.getAppPath() + path.sep + 'css' + path.sep + 'caption-buttons.svg#' + type;

                        img.setAttribute('src', url.resolve('file://', src));
                        return img;
                    }
                    let div = document.createElement('div');
                    div.className = 'button button-' + type;

                    if (type === 'maximize') {
                        div.appendChild(createImage('maximize'));
                        div.appendChild(createImage('restore', 'none'));
                    } else div.appendChild(createImage(type));

                    return div;
                }

                for (let x of ['close', 'minimize', 'maximize']) titlebar.appendChild(createButton(x));

                // register events
                for (let elem of document.querySelectorAll('#electron-titlebar > .button, #electron-titlebar > .button img')) {
                    elem.addEventListener('dragstart', (e) => { e.preventDefault(); })
                }

                function showOrHide(elem, show) {
                    if (show === true) elem.style.display = '';
                    else elem.style.display = 'none';
                }

                let buttomImgMaximize = document.querySelector('#electron-titlebar > .button .button-img-maximize'),
                    buttomImgRestore = document.querySelector('#electron-titlebar > .button .button-img-restore');

                w.on('maximize', () => {
                    showOrHide(buttomImgMaximize, false);
                    showOrHide(buttomImgRestore, true);
                });

                w.on('unmaximize', () => {
                    showOrHide(buttomImgMaximize, true);
                    showOrHide(buttomImgRestore, false);
                });

                // workaround for the .button is still :hover after maximize window
                for (let elem of document.querySelectorAll('#electron-titlebar > .button')) {
                    elem.addEventListener('mouseover', () => {
                        elem.classList.add('hover');
                    });
                    elem.addEventListener('mouseout', () => {
                        elem.classList.remove('hover');
                    });
                }

                let buttonClose = document.querySelector('#electron-titlebar > .button-close');
                if (buttonClose) buttonClose.addEventListener('click', () => {
                    w.close();
                });

                let butonMinimize = document.querySelector('#electron-titlebar > .button-minimize');
                if (butonMinimize) butonMinimize.addEventListener('click', () => {
                    w.minimize();
                });

                let butonMaximize = document.querySelector('#electron-titlebar > .button-maximize');
                if (butonMaximize) butonMaximize.addEventListener('click', () => {
                    if (!w.isMaximized()) w.maximize();
                    else w.unmaximize();
                });
            }

            let link = document.createElement('link');
            link.href = app.getAppPath() + path.sep + 'css' + path.sep + 'titlebar.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    };

    $(function() {
        new win.hc.MainMenu();
    });
})(window, jQuery, electron.ipcRenderer);