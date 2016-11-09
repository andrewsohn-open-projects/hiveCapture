HiveCapture Screen Capture Batch Tool
=========
Windows Application Screen Capture CSV Batch Tool presented by Hivelab Corp. Samsung Opt Team.


Requires
------------------
 * `electron 1.4.1`
 * `jquery 3.1.1`
 * `underscore 1.8.3`
 * `electron-json-storage 2.0.1`
 * `async 2.1.2`


Change Log
=====
 * `v 1.0.1`
 	 * [bug fix] CSV URL deletion error fixed
	 * [improved] no CSV URL validation check
	 * [improved] unique id added in extracted zip file name
	 * [bug fix] single wide page capture issue fixed
	 * [improved] none lazy loading page covered

 * `v 1.0.0`
	 * [start] app initiated
	 * [improved] extension button UI redesigned


### 설치해야할 NPM 패키지
- npm install -g electron
- npm install -g electron-packager
- npm install --saveDev electron-builder

### EXE 실행파일:
electron-packager . hivecapture --out=dist/apps --platform=win32 --arch=x64 app-version=1.0 --icon=img/icons/hivecapture_256x256.ico --overwrite

### 인스톨러:
.\node_modules\.bin\build --platform win32 --arch x64