const electron = require('electron'),
fs = require('fs'),
messages = require('./message.js');

const {app, BrowserWindow} = electron.remote

;(function(win, $, ipc){
	'use strict';

	let defaults;
	let innerHeight = 0;
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext("2d");
	let canvasProcNum = 0;
	let parentWin;

	canvas.width = Math.round(window.innerWidth-17);
    
	ipc.on('canvasInfo', (event, config) => {
		if("undefined" !== typeof config.height) canvas.height = config.height;
		defaults = config;

		parentWin = BrowserWindow.fromId(config.captureId)
    	parentWin.webContents.send('canvasProcess', canvasProcNum)
	})

	ipc.on('imageInfo', (event, config) => {
		if ((config.posY + config.height) >= config.totalH) return;

		var myIage = new Image();
        myIage.width = config.width+17;
        myIage.height = config.height;
        // console.log(config, innerHeight)
        myIage.src = config.src;
        myIage.onload = function(){
        	// document.body.appendChild(myIage);

        	// var y = config.posY - config.height;
        	ctx.drawImage(myIage, 0, innerHeight);
            innerHeight = innerHeight + config.height;

            canvasProcNum ++;
            parentWin.webContents.send('canvasProcess', canvasProcNum)
        };
	})

	ipc.on('lastImageInfo', (event, config) => {
		var myIage = new Image();
        myIage.width = config.width;
        myIage.height = config.height;
        // console.log(config, innerHeight)
        myIage.src = config.src;
        myIage.onload = function(){
        	ctx.drawImage(myIage, 0, innerHeight);
            innerHeight = innerHeight + config.height;
            
            if(config.isLast && "undefined" !== typeof config.winId){

				let imgData = canvas.toDataURL();
				let data = imgData.replace(/^data:image\/\w+;base64,/, "");
				let buf = new Buffer(data, 'base64');
				let dest = defaults.destFolder + "/"+defaults.filename;

				let thisWin = BrowserWindow.fromId(config.winId);
			        
        		fs.writeFile(dest, buf, function(err) {
					if(err) console.log(err);
					canvasProcNum ++;
            		parentWin.webContents.send('canvasProcessEnd', canvasProcNum)
					thisWin.close()
			    });
            }
        };
	})

	$(function() {
        
    });
})(window, jQuery, electron.ipcRenderer);