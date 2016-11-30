const electron = require('electron'),
fs = require('fs'),
messages = require('./message.js'),
ssConfig = require('./ssConfig.js');

const {app, BrowserWindow, session} = electron.remote

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
	win.hc.SSLoginComponent = class SSLoginComponent {
		defaults(){
			this.body = $('body');
			
			return {
				loginForm: '#loginForm',
				loginBtn: 'a.submitBtn',
				idEle:'input[name=id]',
				passEle:'input[name=passwd]'
			};
		}
		constructor(settings){
			this.options = $.extend({}, this.defaults(), settings.options);
			this.init();
		}

		init(){
			// this.zoomFactor = 1;
			// this.captureProcess = 0;
			this.assigneElements();
			this.bindEvents();
			console.log(1);

		}

		assigneElements(){
			this.$loginForm = this.body.find(this.options.loginForm);

			// login button
			this.$loginBtn = this.$loginForm.find(this.options.loginBtn);
			this.$idEle = this.$loginForm.find(this.options.idEle);
			this.$passEle = this.$loginForm.find(this.options.passEle);
			
			// web view container
			// this.$WebViewCont = this.$contLayoutA.find(this.options.layoutWebView);

			// this.$webBtnsCont = this.$contLayoutA.find(this.options.webBtnsCont);
			// this.$zoomOutBtn = this.$webBtnsCont.find(this.options.zoomOut);
			// this.$zoomInBtn = this.$webBtnsCont.find(this.options.zoomIn);
		}

		bindEvents(){
			console.log(this.$idEle, this.$passEle)
			
			this.$loginBtn.on('click', $.proxy(this.onClickSubmitBtn, this));
		}

		onClickSubmitBtn(e){
			e.preventDefault();

			let _this = this;
			let loginData = {
				"id":_this.$idEle.val(),
				"passwd":_this.$passEle.val()
			};

			// let captureBrowserSetting = {width: 1000, height: 500};

			// let bWin = new BrowserWindow(captureBrowserSetting)
			
			// bWin.setMenuBarVisibility(false);
			// bWin.setAutoHideMenuBar(true);

			// bWin.loadURL(ssConfig.wdsLogin.url)
			// bWin.webContents.openDevTools();
			// let script = "if('function' === typeof window.loginAction) window.loginAction('"+loginData.id+"','"+loginData.passwd+"');";
			// bWin.webContents.on('did-finish-load', () => {
			//     bWin.webContents.executeJavaScript(script)
			// })
			// bWin.webContents.on('dom-ready', (event) => {
			// 	console.log(2)
			// 	let $trg = $(event.currentTarget);
			// 	var patt = new RegExp("ssoLoginSuccess\.do");
			// 	if(!patt.test($trg.attr('src'))) return;

			// 	setTimeout(function(){
			// 		alert(1);
			// 		let script = "var frm = document.getElementById('loginForm'); frm.action = 'https://wcms4.samsung.com/iw-sec/wmcLoginSSL.do'; frm.submit();";
			// 		bWin.webContents.openDevTools();
			// 		bWin.webContents.executeJavaScript(script)
			// 	},2000);
				
			// })

			$('body').append('<webview id="webView" src="'+ssConfig.wdsLogin.url+'" preload="../libs/ssInject.js" style="display:inline-flex; width:100%; height:100%; overflow:hidden;" autosize="on"></webview>');

			$('body').find('webview#webView').on('did-finish-load', (e) => {
				
				// if(config.popUpVisible && 'undefined' !== typeof config.ENVIRONMENT && config.ENVIRONMENT === "DEV")
			    	$('body').find('webview#webView')[0].openDevTools();

	        	$('body').find('webview#webView')[0].send('loginProc', loginData)
			});

			// $('body').find('webview').on('did-get-redirect-request', (event) => {
			// 	let $trg = $(event.currentTarget);
			// 	console.log(1, $trg.attr('src'))
			// });
			// $('body').find('webview').on('did-navigate', (event) => {
			// 	let $trg = $(event.currentTarget);
			// 	console.log(2, $trg.attr('src'))
			// });
			$('body').find('webview#webView').on('dom-ready', (event) => {
				let $trg = $(event.currentTarget);

				var patt = new RegExp("ssoLoginSuccess\.do");
				var patt2 = new RegExp("iw-cc\/ccpro");

				if(patt.test($trg.attr('src'))){
					let wcmsData = {"target":"nwcms"};
					$('body').find('webview')[0].send('clickWCMS', wcmsData);
				} else if (patt2.test($trg.attr('src'))){
					let res = false;
					session.defaultSession.cookies.get({domain: ssConfig.cookie.domain, name: ssConfig.cookie.name}, (error, cookie) => {
						if (error || ("object" === typeof cookie && cookie.length <= 0)) res = false;
						else res = true;

						if(res) ;
					})	

					let thisWin = BrowserWindow.fromId(win.hc.config.loginWinId);
					thisWin.close();

				} else return;

				
				// $('body').append('<webview id="webView2" src="'+ssConfig.WCMS.url+'" style="display:inline-flex; width:100%; height:100%; overflow:hidden;" autosize="on"></webview>');
				// $('body').find('webview#webView2')[0].openDevTools();
				
				

				
				// $('body').find('webview#webView')[0].src = ssConfig.WCMS.url;

				console.log(3, $('body').find('webview#webView')[0].session)

			});
			
			// let captureBrowserSetting = {width: 1000, height: 500};

			// this.ssLoginProcWin = new BrowserWindow(captureBrowserSetting)

			// this.ssLoginProcWin.setMenuBarVisibility(false);
			// this.ssLoginProcWin.setAutoHideMenuBar(true);

			// this.ssLoginProcWin.webContents.openDevTools();

			// this.ssLoginProcWin.loadURL(ssConfig.wdsLogin.url)

			console.log(this.$idEle.val(), this.$passEle.val())
		}
	};

	ipc.on('captureInfo', (event, config) => {
		win.hc.config = config;
	})
	

	$(function() {
        new win.hc.SSLoginComponent({
        	"options":{
        		"test" : "test"
        	}
        });
    });
})(window, jQuery, electron.ipcRenderer);