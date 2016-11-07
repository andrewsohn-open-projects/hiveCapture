//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow, clipboard} = electron.remote,
_ = require('underscore');

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var imgData = "";
var segCount;

var captureWinId = parseInt(clipboard.readText('captueWinId'));
let thisWin = BrowserWindow.fromId(captureWinId)

let winConfig;
electron.ipcRenderer.on('winConfig', (event, config) => {
  winConfig = config;

})

let imgBuffer = [];

window.addEventListener('load', ()=> {
    document.body.style.overflow = 'hidden';

    async.waterfall([
        function(cb){
            let res = {};

            scrollBottom(document.body, document.body.scrollHeight, window.innerHeight, 800, function(){
                cb(null, res);
            });
        },
        function(res, cb){
            scrollTop(document.body, 800, function(){
                cb(null, res);
            });
        },
        function(res, cb){
            scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight, 2000, function(){
                cb(null, res);
            });
        }
    ], function(err, result){
        
        
    });
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

        canvas.width = Math.round(window.innerWidth);
            canvas.height = document.body.scrollHeight
            document.body.appendChild(canvas);

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

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function snap(num, posY, isLast, leftOverLength, callback){
    let rect = {x:0, y:0, width:Math.round(window.innerWidth), height:Math.round(window.innerHeight)};

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

            fs.writeFile(dest, buf, function(err) {
              if(err) console.log(err);

              // 윈도우 창 닫으면서 win.destFolder 값을 보내야함
              thisWin.close()
            });

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