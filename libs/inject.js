//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow} = electron.remote,
_ = require('underscore');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var segCount;

let thisWin, bWin;
let winConfig,isDoneProcess = false;

electron.ipcRenderer.on('winConfig', (event, config) => {
    winConfig = config;
    console.log(config)
    thisWin = BrowserWindow.fromId(config.captureId)
    
    let captureBrowserSetting = {width: winConfig.size.width, height: winConfig.size.height};
    
    captureBrowserSetting.show = false;
    
    bWin = new BrowserWindow(captureBrowserSetting);
    // bWin.openDevTools();
    bWin.on('closed', function () {
        threadClose();
    })

    let canvasInfo = {
        "height":document.body.scrollHeight,
        "destFolder":winConfig.destFolder,
        "filename":winConfig.filename
    }

    bWin.webContents.on('did-finish-load', () => {
        bWin.webContents.send('canvasInfo', canvasInfo)
    })
    
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
})

// window.addEventListener('load', ()=> {
//     // document.body.style.overflow = 'hidden';
//     document.body.style.height = 'auto';
    
//     if(document.body.scrollHeight > window.innerHeight){
//         async.waterfall([
//             function(cb){
//                 let res = {};

//                 if(winConfig.isLazyLoad){
//                     scrollBottom(document.body, document.body.scrollHeight, window.innerHeight, 500, function(){
//                         cb(null, res);
//                     });
//                 }else{
//                     cb(null, res);
//                 }
                
//             },
//             function(res, cb){
//                 if(winConfig.isLazyLoad){
//                     scrollTop(document.body, 500, function(){
//                         cb(null, res);
//                     });
//                 }else{
//                     cb(null, res);
//                 }
                
//             },
//             function(res, cb){
//                 setCanvasWindow(canvas);
                
//                 scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight, 1400, function(){
//                     cb(null, res);
//                 });
//             }
//         ], function(err, result){
            
            
//         });

//     }else{
//         setTimeout(function() {
//             setCanvasWindow(canvas);
//             snapAll();
//         }, 500);
//     }
// });

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
            bWin.webContents.send('imageInfo', canvasInfo)
            
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
        callback();
    });
}

function snap(num, posY, isLast, leftOverLength, callback){
    let rect = {x:0, y:0, width:Math.round(window.innerWidth-17), height:Math.round(window.innerHeight)};

    if(isLast && leftOverLength !== null){
        console.log(leftOverLength)
        rect.y = window.innerHeight - leftOverLength;
        rect.height = leftOverLength;
    } 

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
            bWin.webContents.send('lastImageInfo', canvasInfo)
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

function threadClose(){
    thisWin.close();
}