const electron = require('electron'),
fs = require('fs'),
async = require('async'),
{app, BrowserWindow} = electron.remote,
_ = require('underscore');

let thisWin, bWin, parentWin;
let loginData,isDoneProcess = false;

electron.ipcRenderer.on('loginProc', (event, data) => {
    console.log(data)

    loginData = data;

    if("function" === typeof window.loginAction) window.loginAction(data.id, data.passwd);

    console.log(window.loginAction)
})

electron.ipcRenderer.on('clickWCMS', (event, data) => {
    console.log(data)

    var frm = document.getElementById('loginForm'); 
    frm.action = 'https://wcms4.samsung.com/iw-sec/wmcLoginSSL.do'; 
    frm.submit();
})