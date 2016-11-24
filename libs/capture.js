const electron = require('electron'),
fs = require('fs'),
messages = require('./message.js');

const {app, BrowserWindow} = electron.remote

;(function(win, $, ipc){
	'use strict';

	var canvasProcNum = -1;
	var threadErrCheck;
	var thisWin, canvasWin;

	var closeCanvasResetCapture = function(){
		if(!canvasWin.isDestroyed()) canvasWin.close();
		if(!thisWin.isDestroyed()) thisWin.reload();
	};

	// Data transfered from Main process
	ipc.on('captureInfo', (event, config) => {
		win.config = config
		// web view element
		if('undefined' === config.url){
			// window 닫기 기능 
		}

		thisWin = BrowserWindow.fromId(config.captureId);

		$('body').append('<webview id="webView" src="'+config.url+'" preload="../libs/inject.js" style="display:inline-flex; width:100%; height:100%; overflow:hidden;" autosize="on"></webview>');
		
		$('body').find('webview').on('did-finish-load', () => {
			threadErrCheck = setTimeout(function(){
				closeCanvasResetCapture();
		    },5000);
		    
		    if(config.popUpVisible && 'undefined' !== typeof config.ENVIRONMENT && config.ENVIRONMENT === "DEV")
		    	$('body').find('webview')[0].openDevTools();
		    
        	$('body').find('webview')[0].send('winConfig', config)
		});
	})

	ipc.on('canvasProcess', (event, procNum) => {
	    if(canvasProcNum >= procNum) return;

	    clearTimeout(threadErrCheck);
		threadErrCheck = null;

		canvasProcNum = procNum;

		threadErrCheck = setTimeout(function(){
			closeCanvasResetCapture();
	    },5000);

	})

	ipc.on('canvasProcessEnd', (event, procNum) => {
		
		clearTimeout(threadErrCheck);
		threadErrCheck = null;
		
	})

	ipc.on('setCanvasId', (event, canvasId) => {
	    canvasWin = BrowserWindow.fromId(canvasId);
	})

	$(function() {
        
    });
})(window, jQuery, electron.ipcRenderer);