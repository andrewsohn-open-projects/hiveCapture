var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'dist/apps/hivecapture-win32-x64',
    outputDirectory: 'dist/installers',
    authors: 'HiveLab Inc.',
    exe: 'hivecapture.exe',
    setupExe: 'Setup.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));