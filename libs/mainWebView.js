//" a script that will be loaded before other scripts run in the page."
const electron = require('electron'),
{app, BrowserWindow, clipboard} = electron.remote;

window.addEventListener('load', ()=> {
    document.body.style.height = 'auto';
});