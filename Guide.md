### 설치해야할 NPM 패키지
- npm install -g electron
- npm install -g electron-packager
- npm install --saveDev electron-builder

### EXE 실행파일:
electron-packager . hivecapture --out=dist/apps --platform=win32 --arch=x64 app-version=1.0 --icon=img/icons/hivecapture_256x256.ico --overwrite

### 인스톨러:
.\node_modules\.bin\build --platform win32 --arch x64