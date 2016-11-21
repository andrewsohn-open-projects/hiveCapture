const electron = require('electron'),
fs = require('fs'),
messages = require('./message.js');

const {app, BrowserWindow} = electron.remote

;(function(win, $, ipc){
	'use strict';

	// Data transfered from Main process
	ipc.on('captureInfo', (event, config) => {
		win.config = config
		// web view element
		if('undefined' === config.url){
			// window 닫기 기능 
		}

		$('body').append('<webview id="webView" src="'+config.url+'" preload="../libs/inject.js" style="display:inline-flex; width:100%; height:100%; overflow:hidden;" autosize="on"></webview>');
		
		$('body').find('webview').on('did-finish-load', () => {
        	// $('body').find('webview')[0].openDevTools();
        	$('body').find('webview')[0].send('winConfig', config)
		});
	})

	$(function() {
        
    });
})(window, jQuery, electron.ipcRenderer);