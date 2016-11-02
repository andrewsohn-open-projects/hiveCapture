//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow, clipboard} = electron.remote,
_ = require('underscore'),
graphicsmagick = require('graphicsmagick-static');

console.log(graphicsmagick.path);

var captureWinId = parseInt(clipboard.readText('captueWinId'));
let thisWin = BrowserWindow.fromId(captureWinId)
let winConfig;
electron.ipcRenderer.on('winConfig', (event, config) => {
  winConfig = config;

})

let imgBuffer = [];

window.addEventListener('load', ()=> {
    async.waterfall([
        function(cb){
            let res = {};

            scrollBottom(document.body, document.body.scrollHeight, window.innerHeight, 800, function(){
                cb(null, res);
            });
        },
        function(res, cb){
            scrollAnim(document.body, 0, document.body.scrollHeight, window.innerHeight, 2000, function(){
                cb(null, res);
                console.log(imgBuffer)
            });
        }
    ], function(err, result){
        
        var arr = _.sortBy(imgBuffer,"num");
        console.log(arr)
        // blend([ image1, image2 ], function(err, result) {
        //     // result contains the blended result image compressed as PNG.
        // });
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

function scrollTo(element, curH, destH, frameH, duration){
    setTimeout(function() {
        var isLast = false;
        var leftOverLength;

        curH = curH + frameH;
        element.scrollTop = curH;

        var count = Math.floor(destH / frameH);
        var num = parseInt(curH/frameH);

        if(count == num){
            console.log(count)
            leftOverLength = destH - (frameH * count);
            isLast = true;
        }

        snap(num, isLast, leftOverLength);
        
        if (curH >= (destH-frameH)) return;
        
        scrollTo(element, curH, destH, frameH, duration);
    }, duration);
}

function scrollAnim(element, startH, destH, frameH, duration, callback) {
    if (duration <= 0 || destH <= 0) return;

    var count = Math.floor(destH / frameH);
    
    //time spent
    var oneT = duration / count;

    setTimeout(function() {
        // var curH = startH + frameH;
        element.scrollTop = startH;
        snap(count+1, false, null);
        scrollTo(element, startH, destH, frameH, oneT);
    }, oneT);
    

    callback();
}

function snap(num, isLast, leftOverLength){
    let rect = {x:0, y:0, width:Math.round(window.innerWidth), height:Math.round(window.innerHeight)};

    if(isLast && leftOverLength !== null) rect.height = leftOverLength;

    thisWin.capturePage(rect,function(image){
        imgBuffer.push({"num":num, "buffer":image.toPng()});


        // if(winConfig.destFolder){
        //     var dest = winConfig.destFolder + "/s"+num+".png";

        //     fs.writeFile(dest, buf, function(err) {
        //       if(err) console.log(err);
        //     });
        // }else{
        //     var folder = app.getPath('desktop') + "/HC-IMG-";
        
        //     fs.mkdtemp(folder, (err, folder) => {
        //         if (err) throw err;
        //         winConfig.destFolder = folder;
        //         var dest = folder + "/s"+num+".png";

        //         fs.writeFile(dest, buf, function(err) {
        //           if(err) console.log(err);
        //         });
        //     });
        // }
        

        // 윈도우 창 닫으면서 win.destFolder 값을 보내야함
    });
}