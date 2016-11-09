//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow, clipboard} = electron.remote,
_ = require('underscore');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var segCount;

var captureWinId = parseInt(clipboard.readText('captueWinId'));
let thisWin = BrowserWindow.fromId(captureWinId)

let winConfig;
electron.ipcRenderer.on('winConfig', (event, config) => {
    winConfig = config;
})

window.addEventListener('load', ()=> {
    // document.body.style.overflow = 'hidden';
    
    if(document.body.scrollHeight > window.innerHeight){
        async.waterfall([
            function(cb){
                let res = {};

                if(winConfig.isLazyLoad){
                    scrollBottom(document.body, document.body.scrollHeight, window.innerHeight, 800, function(){
                        cb(null, res);
                    });
                }else{
                    cb(null, res);
                }
                
            },
            function(res, cb){
                if(winConfig.isLazyLoad){
                    scrollTop(document.body, 800, function(){
                        cb(null, res);
                    });
                }else{
                    cb(null, res);
                }
                
            },
            function(res, cb){
                canvas.width = Math.round(window.innerWidth);
                canvas.height = document.body.scrollHeight
                // document.body.innerHTML = "";
                document.body.appendChild(canvas);

                scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight - 17, 2000, function(){
                    cb(null, res);
                });
            }
        ], function(err, result){
            
            
        });

    }else{
        setTimeout(function() {
            canvas.width = Math.round(window.innerWidth);
            canvas.height = document.body.scrollHeight
            // document.body.innerHTML = "";
            document.body.appendChild(canvas);
            snapAll();
        }, 1000);
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

        if(segCount == num){
            leftOverLength = destH - (frameH * segCount);
            isLast = true;
        }

        snap(num, curH, isLast, leftOverLength, function(){
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
    let rect = {x:0, y:0, width:Math.round(window.innerWidth - 17), height:Math.round(window.innerHeight - 17)};

    if(isLast && leftOverLength !== null) rect.height = leftOverLength;

    thisWin.capturePage(rect,function(image){

        var myIage = new Image();
        myIage.width = image.getSize().width;
        myIage.height = image.getSize().height;
        myIage.src = image.toDataURL();
        myIage.onload = function(){
            var y = posY - image.getSize().height;
            ctx.drawImage(myIage, 0, y);
            callback();
        };
        
        if(num > segCount){
            var imgData = canvas.toDataURL();
            var data = imgData.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(data, 'base64');
            var dest = winConfig.destFolder + "/"+winConfig.filename;

            writeFile(dest, buf);
        }
    });
}

function scrollSnapBottom(element, num, destH, frameH, duration){
    setTimeout(function() {
        var y = destH - frameH;
        element.scrollTop = y;

        snap(num, y, null, null, function(){
            return;
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

      thisWin.close()
    });
}