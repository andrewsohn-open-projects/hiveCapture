const electron = require('electron'),
path = require('path'),
_ = require('underscore');

const {app} = require('electron').remote;

console.log()

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
    win.hc.MainMenu = class MainMenu {
        defaults(){
            this.body = $('body');
            
            return {
                "menuSetting" : {
                    "disabledClass": 'disabled',
                    "submenuClass": 'submenu',
                    // "maskEle": '#menu-top-mask',
                    "maskEle": '<div id="menu-top-mask" style="height: 2px; background-color: #fff; z-index:1001;"/>'
                }
            };
        }

        constructor(settings){
            this.options = $.extend({}, this.defaults(), settings);
            this.init();
        }

        init(){
            let _this = this;
            if (document.readyState === 'complete' || document.readyState === 'interactive') _this.installTitlebarMenubar();
            else document.addEventListener('DOMContentLoaded', _this.installTitlebarMenubar);

            _this.activated = false;
            _this.timeOut;
            _this.assigneElements();
            _this.bindEvents();

            $('ul.main-menu > li > ul li').each(function () {
                if ($(this).children('ul').length > 0) {
                    $(this).addClass(_this.options.menuSetting.submenuClass);
                }
            });
        }

        assigneElements(){
            this.$maskEle = $(this.options.menuSetting.maskEle);
        }

        bindEvents(){
            // this.$popupCloseBtn.on('click', $.proxy(this.onClickPopClose, this));
            $('ul.main-menu > li').on('click', $.proxy(this.onClickMenuLi, this));
            $('ul.main-menu > li > ul li').on('click', $.proxy(this.onClickMenuLi2, this));
            $('ul.main-menu > li').on('mouseenter', $.proxy(this.onMouseEnterMenuLi, this));
            $('ul.main-menu > li > ul li').on('mouseenter', $.proxy(this.onMouseEnterMenuLi2, this));

            $('ul.main-menu li.' + this.options.menuSetting.disabledClass).on('click', $.proxy(function(e){
                e.preventDefault();
            }, this));

            var _this = this;

            $(document).keyup(function (e) {
                if (e.keyCode == 27) {
                    _this.closeMainMenu();
                }
            });

            $(document).on('click', $.proxy(this.onClickDocument, this));
        }

        onClickDocument (e) {
            var target = $(e.target);
            if (!target.hasClass('active-menu') && !target.parents().hasClass('active-menu')) {
                this.closeMainMenu();
            }
        }

        onClickMenuLi (e) {
            var target = $(e.target);
            if (target.hasClass(this.options.menuSetting.disabledClass) || target.parents().hasClass(this.options.menuSetting.disabledClass) || target.hasClass(this.options.menuSetting.submenuClass)) {
                return;
            }

            this.toggleMenuItem(target);
        }

        onClickMenuLi2 (e) {
            // Prevent click event to propagate to parent elements
            e.stopPropagation();
            var target = $(e.currentTarget);
            
            // Prevent any operations if item is disabled
            if ($(this).hasClass(this.options.menuSetting.disabledClass)) {
                return;
            }

            // If item is active, check if there are submenus (ul elements inside current li)
            if (target.has( "ul" ).length > 0) {
                // Automatically toggle submenu, if any
                this.toggleSubMenu(target);
            }
            else{
                // If there are no submenus, close main menu.
                this.closeMainMenu();
            }
        }

        onMouseEnterMenuLi (e) {
            var target = $(e.currentTarget);

            if (this.activated && target.hasClass('active-menu') == false) {
                this.toggleMenuItem(target);
            }
        }

        onMouseEnterMenuLi2 (e) {
            var target = $(e.currentTarget);
            var _this = this;
            // Hide all other opened submenus in same level of this item
            var $el = $(e.target);
            if ($el.hasClass('separator')) return;
            clearTimeout(_this.timeOut);
            var parent = $el.closest('ul');
            parent.find('ul.active-sub-menu').each(function () {
                if ($(this) != $el)
                    $(this).removeClass('active-sub-menu').hide();
            });

            // Show submenu of selected item
            if ($el.children().length > 0) {
                _this.timeOut = setTimeout(function () { _this.toggleSubMenu($el) }, 500);
            }
        }

        installTitlebarMenubar() {
            if (window.electron_titlebar_installed === true) return;

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

        //#region - Toggle Main Menu Item -

        toggleMenuItem (el) {

            // Hide all open submenus
            $('.active-sub-menu').removeClass('active-sub-menu').hide();

            $('#menu-top-mask').remove();

            var submenu = el.find("ul:first");
            var top = parseInt(el.css('padding-bottom').replace("px", ""), 10) + parseInt(el.css('padding-top').replace("px", ""), 10) +
                        el.position().top +
                        el.height();

            submenu.prepend(this.$maskEle);
            this.$maskEle = $('#menu-top-mask');
            var maskWidth = el.width() +
                            parseInt(el.css('padding-left').replace("px", ""), 10) +
                            parseInt(el.css('padding-right').replace("px", ""), 10);

            this.$maskEle.css({ position: 'absolute',
                top: '-1px',
                width: (maskWidth) + 'px'
            });

            submenu.css({
                position: 'absolute',
                top: top + 'px',
                left: el.offset().left + 'px',
                zIndex: 100
            });

            submenu.stop().toggle();
            this.activated = submenu.is(":hidden") == false;

            !this.activated ? el.removeClass('active-menu') : el.addClass('active-menu');

            if (this.activated) {
                $('.active-menu').each(function () {
                    if ($(this).offset().left != el.offset().left) {
                        $(this).removeClass('active-menu');
                        $(this).find("ul:first").hide();
                    }
                });
            }
        }

        //#endregion

        //#region - Toggle Sub Menu Item -

        toggleSubMenu (el) {

            if (el.hasClass(this.options.menuSetting.disabledClass)) {
                return;
            }

            var submenu = el.find("ul:first");
            var paddingLeft = parseInt(el.css('padding-right').replace('px', ''), 10);
            var borderTop = parseInt(el.css('border-top-width').replace("px", ""), 10);
            borderTop = !isNaN(borderTop) ? borderTop : 1;
            var top = el.position().top - borderTop;

            submenu.css({
                position: 'absolute',
                top: top + 'px',
                left: el.width() + paddingLeft + 'px',
                zIndex: 1000
            });

            submenu.addClass('active-sub-menu');

            submenu.show();

            //el.mouseleave(function () {
            //  submenu.hide();
            //});
        }

        //#endregion

        closeMainMenu () {
            this.activated = false;
            $('.active-menu').find("ul:first").hide();
            $('.active-menu').removeClass('active-menu');
            $('.active-sub-menu').hide();
        };
    };

    $(function() {
        new win.hc.MainMenu();
    });

})(window, jQuery, electron.ipcRenderer, document);