const electron = require('electron'),
fs = require('fs'),
async = require('async'),
_ = require('underscore'),
messages = require('./message.js');

const {app, BrowserWindow, clipboard} = electron.remote

;(function(win, $, ipc){
	'use strict';

	if (typeof win.hc === 'undefined') {
		win.hc = {};
	}

	if (typeof win.hc.csvUrlData === 'undefined') {
		win.hc.csvUrlData = {};
	}

	if (typeof win.hc.webViewOpt === 'undefined') {
		win.hc.webViewOpt = {
			httpReferrer:'',
			userAgent:'',
			extraHeaders:''
		};
	}

	// Data transfered from Main process
	ipc.on('captureInfo', (event, config) => {
		win.config = config
		// web view element
		if('undefined' === config.url){
			// window 닫기 기능 
		}
		
		clipboard.writeText("{\"winId\":"+win.config.captureId+",\"device\":\""+win.config.device+"\"}", 'captueInfo')

		$('body').append('<webview id="webView" src="'+config.url+'" preload="../libs/inject.js" style="display:inline-flex; width:100%; height:100%; overflow:hidden;" autosize="on"></webview>');
		
		$('body').find('webview').on('dom-ready', () => {
        	// $('body').find('webview')[0].openDevTools();
        	$('body').find('webview')[0].send('winConfig', config)
		});
	})

	$(function() {
        
    });
})(window, jQuery, electron.ipcRenderer);