//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow, clipboard} = electron.remote,
_ = require('underscore');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var segCount;

var captureInfo = JSON.parse(clipboard.readText('captueInfo'));
let thisWin = BrowserWindow.fromId(captureInfo.winId)
let bWin;
let winConfig;

electron.ipcRenderer.on('winConfig', (event, config) => {
    winConfig = config;
    
    let captureBrowserSetting = {width: winConfig.size.width, height: winConfig.size.height};
    
    captureBrowserSetting.show = false;
    
    bWin = new BrowserWindow(captureBrowserSetting);
    // bWin.openDevTools();
    bWin.on('closed', function () {
        thisWin.close()
    })

    let canvasInfo = {
        "height":document.body.scrollHeight,
        "destFolder":winConfig.destFolder,
        "filename":winConfig.filename
    }

    bWin.webContents.on('did-finish-load', () => {
        bWin.webContents.send('canvasInfo', canvasInfo)
    })
    
})

window.addEventListener('load', ()=> {
    // document.body.style.overflow = 'hidden';
    document.body.style.height = 'auto';
    
    if(document.body.scrollHeight > window.innerHeight){
        async.waterfall([
            function(cb){
                let res = {};

                if(winConfig.isLazyLoad){
                    scrollBottom(document.body, document.body.scrollHeight, window.innerHeight, 500, function(){
                        cb(null, res);
                    });
                }else{
                    cb(null, res);
                }
                
            },
            function(res, cb){
                if(winConfig.isLazyLoad){
                    scrollTop(document.body, 500, function(){
                        cb(null, res);
                    });
                }else{
                    cb(null, res);
                }
                
            },
            function(res, cb){
                setCanvasWindow(canvas);
                
                scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight, 1400, function(){
                    cb(null, res);
                });
            }
        ], function(err, result){
            
            
        });

    }else{
        setTimeout(function() {
            setCanvasWindow(canvas);
            snapAll();
        }, 500);
    }
});

function scrollBottom(element, destH, frameH, duration, callback) {
    if (duration <= 0 || destH <= 0) return;
  
    setTimeout(function() {
        element.scrollTop = (destH - frameH);

        // if (startH >= (destH-frameH)) return;
        
        // scrollTo(element, startH, destH, frameH, duration);
        return callback();
    }, duration);
}

function scrollTop(element, duration, callback) {
    if (duration <= 0) return;
  
    setTimeout(function() {
        element.scrollTop = 0;
        
        // if (startH >= (destH-frameH)) return;
        
        // scrollTo(element, startH, destH, frameH, duration);
        return callback();
    }, duration);
}

function scrollTo(element, curH, destH, frameH, duration){
    setTimeout(function() {
        var isLast = false;
        var leftOverLength;

        curH = curH + frameH;
        element.scrollTop = curH;

        var num = parseInt(curH/frameH);

        // if(segCount == num){
        //     leftOverLength = destH - (frameH * segCount);
        //     isLast = true;
        // }

        snap(num, curH, isLast, leftOverLength, function(image, x, posY){
            let canvasInfo = {
                "num":num,
                "width":image.getSize().width,
                "height":image.getSize().height,
                "src":image.toDataURL(),
                "x":x,
                "posY":posY,
                "isLast":isLast
            };

            bWin.webContents.send('imageInfo', canvasInfo)
            
            if (curH >= (destH-frameH)){
                scrollSnapBottom(element, num+1, destH, frameH, duration);
                return;
            }

            scrollTo(element, curH, destH, frameH, duration);
        });
    }, duration);
}

function scrollAnim(element, startH, destH, frameH, duration, callback) {
    if (duration <= 0 || destH <= 0) return;

    async.waterfall([
        function(cb){
            segCount = Math.floor(destH / frameH);
    
            //time spent
            var oneT = duration / segCount;

            setTimeout(function() {
                // var curH = startH + frameH;
                scrollTo(element, startH, destH, frameH, oneT);
            }, oneT);

            cb(null, null);
        }
    ], function(err, result){
        callback();
    });
}

function snap(num, posY, isLast, leftOverLength, callback){
    let rect = {x:0, y:0, width:Math.round(window.innerWidth-17), height:Math.round(window.innerHeight)};

    if(isLast && leftOverLength !== null) rect.height = leftOverLength;

    thisWin.capturePage(rect,function(image){
        // var y = posY - image.getSize().height;
        callback(image, 0, posY);
        // var myIage = new Image();
        // myIage.width = image.getSize().width;
        // myIage.height = image.getSize().height;
        // myIage.src = image.toDataURL();
        // myIage.onload = function(){
        //     var y = posY - image.getSize().height;
        //     ctx.drawImage(myIage, 0, y);
            
        // };
        
        // if(num > segCount){
        //     var imgData = canvas.toDataURL();
        //     var data = imgData.replace(/^data:image\/\w+;base64,/, "");
        //     var buf = new Buffer(data, 'base64');
        //     var dest = winConfig.destFolder + "/"+winConfig.filename;

        //     writeFile(dest, buf);
        // }
    });
}

function scrollSnapBottom(element, num, destH, frameH, duration){
    setTimeout(function() {
        element.scrollTop = destH;

        snap(num, destH, null, null, function(image, x, posY){
            let canvasInfo = {
                "num":num,
                "width":image.getSize().width,
                "height":image.getSize().height,
                "src":image.toDataURL(),
                "x":x,
                "posY":posY,
                "isLast":true,
                "winId":bWin.id
            };

            bWin.webContents.send('imageInfo', canvasInfo)
        });
        
    }, duration);
}

function snapAll(){
    let rect = {x:0, y:0, width:Math.round(window.innerWidth), height:Math.round(window.innerHeight)};

    thisWin.capturePage(rect,function(image){
        var dest = winConfig.destFolder + "/"+winConfig.filename;
        var buf = image.toPng();
        writeFile(dest, buf);
    });
}

function writeFile(dest, buf){
    fs.writeFile(dest, buf, function(err) {
      if(err) console.log(err);

      bWin.close();
      thisWin.close();
    });
}

function setCanvasWindow(canvas){
    let template = "file://"+winConfig.srcPath+"/../templates/canvas.html";
    
    bWin.setMenuBarVisibility(false);
    bWin.setAutoHideMenuBar(true);

    let httpOption = {
        "userAgent":winConfig.userAgent
    };

    bWin.loadURL(template, httpOption)

}