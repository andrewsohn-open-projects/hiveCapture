const electron = require('electron'),
storage = require('electron-json-storage'),
fs = require('fs'),
async = require('async'),
_ = require('underscore'),
messages = require('./message.js');

const {app, BrowserWindow} = require('electron').remote

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

	let winHeight = $('body').height();
	/**
	* 
	* @class
	* @example 
	*/
	// let rect = {x:0, y:0, width:Math.round(webview.width()), height:1000};

	function scrollDownCapture(docHeight){
		var scrollHeight = parseInt(docHeight);
		console.log(scrollHeight, winHeight)
		var count = 0;
		async.whilst(
		    function() { return count < 5; },
		    function(callback) {
		        count++;
		        setTimeout(function() {
		        	console.log('yes')
		        	// webview[0].executeJavaScript();
		        	
		            callback(null, count);
		        }, 1000);
		    },
		    function (err, n) {
		        // 5 seconds have passed, n = 5
		    }
		);
	}
	
	// document.getElementById('webView').addEventListener('dom-ready', () => {

		

	 //  webview[0].capturePage(rect,function(image){
		// 	var buf = image.toPng();

		// 	console.log(win.destFolder)
		// 	if(win.destFolder){
		// 		var dest = win.destFolder + "/s.png";

		// 		fs.writeFile(dest, buf, function(err) {
		//           if(err) console.log(err);
		//         });
		// 	}else{
		// 		var folder = app.getPath('desktop') + "/HC-IMG-";
			
		// 		fs.mkdtemp(folder, (err, folder) => {
		// 			if (err) throw err;
		// 			win.destFolder = folder;
		// 			var dest = folder + "/s.png";

		// 			fs.writeFile(dest, buf, function(err) {
		// 	          if(err) console.log(err);
		// 	        });
		// 		});
		// 	}
			

		// 	// 윈도우 창 닫으면서 win.destFolder 값을 보내야함
	        
		// });
	// });

	// Data transfered from Main process
	ipc.on('captureInfo', (event, config) => {
		// web view element
		if('undefined' === config.url){
			// window 닫기 기능 
		}
		
		$('body').append('<webview id="webView" src="'+config.url+'" preload="../libs/inject.js" plugins style="display:inline-flex; width:100%; height:100%"></webview>');

		document.getElementById('webView').addEventListener('console-message', function(e) {
			// scrollDownCapture(e.message);
			var scrollHeight = parseInt(e.message);
			if(isNaN(scrollHeight)) return;

			var count = 0,
			times = Math.ceil(scrollHeight/winHeight);
			
			console.log(scrollHeight, winHeight, times)

			async.whilst(
			    function() { return count < times; },
			    function(callback) {
			        count++;
			        setTimeout(function() {
			        	console.log(win.config)
			        	// webview[0].executeJavaScript();
			        	
			            callback(null, count);
			        }, 1000);
			    },
			    function (err, n) {
			        // 5 seconds have passed, n = 5
			    }
			);
		});
	})
	
	$(function() {
        
    });
})(window, jQuery, electron.ipcRenderer);