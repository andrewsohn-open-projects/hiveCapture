//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow} = electron.remote,
_ = require('underscore');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var segCount;
var capProcessNum = 1;

let thisWin, bWin, parentWin;
let winConfig,isDoneProcess = false;

let procConfig = {
    "captureId":"",
    "canvasId":"",
    "num":capProcessNum
};

electron.ipcRenderer.on('winConfig', (event, config) => {
    // console.log(config)
    winConfig = config;
    
    thisWin = BrowserWindow.fromId(config.captureId)

    let captureBrowserSetting = {width: winConfig.size.width+17, height: winConfig.size.height};
    
    captureBrowserSetting.show = config.popUpVisible;
    
    bWin = new BrowserWindow(captureBrowserSetting);

    procConfig.captureId = config.captureId;
    procConfig.canvasId = bWin.id;

    parentWin = BrowserWindow.fromId(config.parentId)
    parentWin.webContents.send('singleCaptureProcess', procConfig)

    if(config.popUpVisible && 'undefined' !== typeof config.ENVIRONMENT && config.ENVIRONMENT === "DEV") 
        bWin.openDevTools();

    let canvasInfo = {
        "height":document.body.scrollHeight,
        "destFolder":winConfig.destFolder,
        "filename":winConfig.filename,
        "captureId":winConfig.captureId
    }

    bWin.webContents.on('did-finish-load', () => {
        if('undefined' !== typeof bWin) bWin.webContents.send('canvasInfo', canvasInfo)
    })

    // console.log(thisWin.id)
    if('undefined' !== typeof thisWin) thisWin.webContents.send('setCanvasId', thisWin.id)

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
                setCanvasWindow();
                
                scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight, 1400, function(){
                    cb(null, res);
                });
            }
        ], function(err, result){
            
            
        });

    }else{

        setCanvasWindow();

        setTimeout(function() {
            var isLast = true;

            snap(0, 0, isLast, null, function(image, x, posY){
                let canvasInfo = {
                    "num":0,
                    "width":image.getSize().width,
                    "height":image.getSize().height,
                    "src":image.toDataURL(),
                    "x":x,
                    "posY":posY,
                    "totalH":document.body.scrollHeight,
                    "isLast":isLast,
                    "winId":bWin.id
                };
                
                console.log(canvasInfo, document.body.scrollHeight, bWin)

                if('undefined' !== typeof bWin) bWin.webContents.send('lastImageInfo', canvasInfo)
                
            });
        }, 500);
    }
})

function scrollBottom(element, destH, frameH, duration, callback) {
    if (duration <= 0 || destH <= 0) return;
  
    setTimeout(function() {
        element.scrollTop = (destH - frameH);

        return callback();
    }, duration);
}

function scrollTop(element, duration, callback) {
    if (duration <= 0) return;
  
    setTimeout(function() {
        element.scrollTop = 0;
        
        return callback();
    }, duration);
}

function scrollTo(element, curH, destH, frameH, duration, num){
    setTimeout(function() {
        var isLast = false;
        var leftOverLength;

        snap(num, curH, isLast, leftOverLength, function(image, x, posY){
            let canvasInfo = {
                "num":num,
                "width":image.getSize().width,
                "height":image.getSize().height,
                "src":image.toDataURL(),
                "x":x,
                "posY":posY,
                "totalH":document.body.scrollHeight,
                "isLast":isLast
            };
            
            console.log(canvasInfo,curH, destH, (destH-frameH), document.body.scrollHeight)

            if('undefined' !== typeof bWin) bWin.webContents.send('imageInfo', canvasInfo)
            
            curH = curH + frameH;
            element.scrollTop = curH;
            num ++;

            if (curH >= (destH-frameH)){
                leftOverLength = destH - curH;
                scrollSnapBottom(element, num+1, curH, frameH, duration, leftOverLength);
                return;
            }

            scrollTo(element, curH, destH, frameH, duration, num);
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

            var num = 0;

            setTimeout(function() {
                
                var num = parseInt(startH/frameH);
                console.log(startH, num)
                
                scrollTo(element, startH, destH, frameH, oneT, num);
            }, oneT);

            cb(null, null);
        }
    ], function(err, result){
        if('undefined' !== typeof callback) callback();
    });
}

function snap(num, posY, isLast, leftOverLength, callback){
    let inHeight = ('undefined' !== typeof window.innerHeight)? window.innerHeight:document.documentElement.offsetHeight;
    let rect = {x:0, y:0, width:Math.round(window.innerWidth-17), height:Math.round(inHeight)};

    if(isLast && leftOverLength !== null){
        rect.y = window.innerHeight - leftOverLength;
        rect.height = leftOverLength;
    } 

    thisWin.capturePage(rect,function(image){
        callback(image, 0, posY);
    });
}

function scrollSnapBottom(element, num, posY, frameH, duration, leftOverLength){
    setTimeout(function() {
        element.scrollTop = posY+frameH;

        snap(num, posY, true, leftOverLength, function(image, x, posY){
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

            isDoneProcess = true;
            if('undefined' !== typeof bWin) bWin.webContents.send('lastImageInfo', canvasInfo)
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
        
        capProcessNum = 4;
        procConfig.num = capProcessNum;

        if('undefined' !== typeof parentWin) parentWin.webContents.send('singleCaptureProcess', procConfig)
        
        if('undefined' !== typeof bWin) bWin.close();
        thisWin.close();
    });
}

function setCanvasWindow(){
    let template = "file://"+winConfig.srcPath+"/../templates/canvas.html";
    
    bWin.setMenuBarVisibility(false);
    bWin.setAutoHideMenuBar(true);

    let httpOption = {
        "userAgent":winConfig.userAgent
    };

    capProcessNum = 2;
    procConfig.num = capProcessNum;

    if('undefined' !== typeof parentWin) parentWin.webContents.send('singleCaptureProcess', procConfig);

    bWin.loadURL(template, httpOption);

}