const electron = require('electron'),
storage = require('electron-json-storage'),
fs = require('fs'),
async = require('async'),
path = require('path'),
_ = require('underscore'),
zipdir = require('zip-dir'),
rmdir = require('rmdir'),
messages = require('./message.js'),
ssConfig = require('./ssConfig.js'),
devices = require('./devices.js');

const {app, BrowserWindow, powerSaveBlocker, net, session} = require('electron').remote;

;(function(win, $, ipc){
	'use strict';

	if (typeof win.hc === 'undefined') {
		win.hc = {};
	}

	if (typeof win.hc.csvUrlData === 'undefined') {
		win.hc.csvUrlData = {};
	}

	if (typeof win.hc.webViewOpt === 'undefined') {
		win.hc.webViewOpt = {
			httpReferrer:'',
			userAgent:'',
			extraHeaders:''
		};
	}

	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var commentsTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	win.hc.CaptureProcess;
	var closeCanvasResetCapture = function(procConfig){

		if(win.hc.CaptureProcess) return;

		// Close Canvas Window
		var canvasWin = BrowserWindow.fromId(procConfig.canvasId);
		// if(!canvasWin.isDestroyed() && 'undefined' !== typeof canvasWin) canvasWin.close();

		// Reload Capture Window
		var captureWin = BrowserWindow.fromId(procConfig.captureId);
		// if(!captureWin.isDestroyed() && 'undefined' !== typeof captureWin) captureWin.reload();

		// Check all the hidden windows 
		// if there is any unnecessary windows then close 
		_.each(BrowserWindow.getAllWindows(), function(bWindow){
			if(bWindow.id !== config.mainId) {
				if('undefined' !== typeof captureWin && bWindow.id === captureWin.id && !captureWin.isDestroyed())
					bWindow.reload();
				else
				// if(bWindow.id === canvasWin.id && !canvasWin.isDestroyed() && 'undefined' !== typeof canvasWin)
					bWindow.close();

			}
		});
	};

	/**
	* 
	* @class
	* @example 
	*/
	win.hc.MainComponent = class MainComponent {
		defaults(){
			this.body = $('body');
			
			return {
				csvUploadBtn: '#csvInsrtBtn',
				csvAddBtn: '#csvAddBtn',
				urlListClass:'.js-csvList',
				submitBtnClass:'.js-submit-btn',
				urlBtnClass:'js-url-btn',
				urlDeleteBtnClass:'btn-del',
				urlDelAllBtn:'.js-btn-delAll',
				webViewId:'#webView',
				contLayout:'.js-cont-layout',
				layoutA:'.js-cont-layoutA',
				layoutB:'.js-cont-layoutB',
				layoutWebView:'.js-webCont',
				layoutWebViewUrl:'.js-browser-url',
				layoutWebViewClose:'button.js-browser-close',
				csvEle:'input[name=csv]',
				prefixEle:'input[name=prefix]',
				zipNameEle:'input[name=zipName]',
				dimenWEle:'input[name=dimenW]',
				dimenHEle:'input[name=dimenH]',
				noHeightEle:'input[name=noVert]',
				lazyLoadEle:'input[name=isLazyLoad]',
				deviceSelEle:'select[name=device]',
				urlCount:'.js-listCount',
				dimmedEle:'.dimmed',
				loadingEle:'.loading-box',
				popupCont:'.popup-layer',
				popupWrap:'.popup_wrap',
				webBtnsCont:'.web_btns',
				zoomOut:'.js-zoom-out',
				zoomIn:'.js-zoom-in'
			};
		}
		constructor(settings){
			this.options = $.extend({}, this.defaults(), settings.options);
			this.init();
		}

		init(){
			this.zoomFactor = 1;
			this.captureProcess = 0;
			this.assigneElements();
			this.bindEvents();

// 			this.checkRedirectPage("http://www.samsung.com/ca/launchingpeople/", function(isRedirect){
// console.log(isRedirect)
// 			});
			
			// this.appendDimmed();
			// this.appendModuleClass();
			// if(this.options.bActivated){
			// 	this.activate();
			// }	

		}

		assigneElements(){
			this.$contLayout = this.body.find(this.options.contLayout);

			//Layout A
			this.$contLayoutA = this.$contLayout.find(this.options.layoutA);
			// web view container
			this.$WebViewCont = this.$contLayoutA.find(this.options.layoutWebView);
			this.$WebViewUrlEle = this.$contLayoutA.find(this.options.layoutWebViewUrl);
			this.$WebViewCloseBtn = this.$contLayoutA.find(this.options.layoutWebViewClose);
			
			this.$webBtnsCont = this.$contLayoutA.find(this.options.webBtnsCont);
			this.$zoomOutBtn = this.$webBtnsCont.find(this.options.zoomOut);
			this.$zoomInBtn = this.$webBtnsCont.find(this.options.zoomIn);
			
			//Layout B
			this.$contLayoutB = this.$contLayout.find(this.options.layoutB);
			this.$urlList = this.$contLayoutB.find(this.options.urlListClass);
			this.$urlCount = this.$contLayoutB.find(this.options.urlCount);
			this.$urlDelAll = this.$contLayoutB.find(this.options.urlDelAllBtn);
			this.$csvUploadBtn = this.$contLayoutB.find(this.options.csvUploadBtn);
			this.$csvAddBtn = this.$contLayoutB.find(this.options.csvAddBtn);
			this.$prefixEle = this.$contLayoutB.find(this.options.prefixEle);
			this.$zipNameEle = this.$contLayoutB.find(this.options.zipNameEle);
			this.$dimenWEle = this.$contLayoutB.find(this.options.dimenWEle);
			this.$dimenHEle = this.$contLayoutB.find(this.options.dimenHEle);
			this.$noHeightEle = this.$contLayoutB.find(this.options.noHeightEle);
			this.$lazyLoadEle = this.$contLayoutB.find(this.options.lazyLoadEle);
			this.$deviceSelEle = this.$contLayoutB.find(this.options.deviceSelEle);
			
			// this.$webview = this.$contLayoutB.find(this.options.webViewId);

			this.$dimmedEle = this.body.find(this.options.dimmedEle);
			this.$loadingEle = this.body.find(this.options.loadingEle);
			this.$popupCont = this.body.find(this.options.popupCont);
			this.$popupWrap = this.$popupCont.find(this.options.popupWrap);
			this.$popupCloseBtn = this.$popupCont.find('.close-button');
			
			this.$fileEle = this.body.find(this.options.csvEle);
			this.$submitBtn = this.body.find(this.options.submitBtnClass);
		}

		bindEvents(){
			this.$contLayout.enhsplitter({minSize: 0});
			// this.$contLayout.find('.splitter_handle').eq(0).on('click.splitter', $.proxy(this.isWebViewVisible, this));
        	// this.$contLayoutB.enhsplitter({minSize: 50, vertical: false});

        	this.$deviceSelEle.on('change', $.proxy(this.onDeviceChange, this));
        	
        	this.$WebViewCloseBtn.on('click', $.proxy(this.onWebViewClose, this));
        	this.$zoomOutBtn.on('click', $.proxy(this.onClickZoom, this));
			this.$zoomInBtn.on('click', $.proxy(this.onClickZoom, this));

        	// Config Layer
        	this.$csvUploadBtn.on('click', $.proxy(this.onClickBtn, this));
        	this.$csvAddBtn.on('click', $.proxy(this.onClickAddBtn, this));
        	
        	this.$fileEle.on('change', $.proxy(this.onFileChange, this));
			this.$submitBtn.on('click', $.proxy(this.onClickSubmitBtn, this));

			this.$urlDelAll.on('click', $.proxy(this.onClickDelAll, this));
			this.$urlList.on('click', $.proxy(this.onClickUrlList, this));

			this.$popupCloseBtn.on('click', $.proxy(this.onClickPopClose, this));

			$(document).on('keyup', $.proxy(this.onKeyUp, this));
		}

		onKeyUp (e) {
			if (e.keyCode == 27) {
				if(this.$loadingEle.is(':visible')){
					this.forceStopProc(messages.forceStop.message);
				}
			}
		}

		onWebViewClose(e){
			e.preventDefault();
			// var target = $(e.currentTarget);
			
			this.$contLayout.find('.splitter_handle').eq(0).trigger('click.splitter');

		}

		onClickZoom(e){
			e.preventDefault();
			var target = $(e.currentTarget);

			this.$webview = this.$WebViewCont.find('webview');

			if(target.hasClass(this.options.zoomOut.split('.')[1])){
				
				this.zoomFactor = this.zoomFactor - 0.5;
				this.$webview[0].setZoomFactor(this.zoomFactor)

			}else if(target.hasClass(this.options.zoomIn.split('.')[1])){

				this.zoomFactor = this.zoomFactor + 0.5;
				this.$webview[0].setZoomFactor(this.zoomFactor)

			}
			
			this.showZoomRatio();
		}

		showZoomRatio(){
			//show
			setTimeout(function(){

			},1000);
		}

		onClickDelAll(e){
			e.preventDefault();
            // var $trg = $(e.currentTarget);
            this.resetCsvUrl();
		}

		visualizeWebView(){
			var initUrl = (win.hc.csvUrlData.length > 0 && 'undefined' !== win.hc.csvUrlData[0])? win.hc.csvUrlData[0]:"http://www.hivelab.co.kr/";
			this.$webview = this.$WebViewCont.find('webview');
			this.$webview.attr('src',initUrl);
			this.$WebViewUrlEle.text(initUrl);
		}

		onClickBtn(e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            this.fileUploadType = "upload";
            this.$fileEle.trigger('click');
        }

        onClickAddBtn(e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            this.fileUploadType = "add";
            this.$fileEle.trigger('click');
        }

        enableLoading(){
        	this.$dimmedEle.show();
        	this.$loadingEle.show();
        }

        disableLoading(){
        	this.$dimmedEle.hide();
        	this.$loadingEle.hide();
        }

        completePopUp(){
        	this.$popupWrap.find('.msg-text').html("");
        	this.$popupWrap.find('.pop-tit').text(messages.complete.title);

        	if('undefined' !== typeof config.ENVIRONMENT && config.ENVIRONMENT !== "PROD"){
        		var timeSpent = $('<p>').text("Time spent - " + this.getTimeforTest());
        		this.$popupWrap.find('.msg-text').append(timeSpent);
        	}

			var complete_message = $('<p>').text(messages.complete.message);
			this.$popupWrap.find('.msg-text').append(complete_message);
        	this.$popupCont.show();
        }

        forceStopPopUp(message){
        	this.$popupWrap.find('.msg-text').html("");
        	this.$popupWrap.find('.pop-tit').text(messages.forceStop.title);
        	
        	var complete_message = $('<p>').text(message);
			this.$popupWrap.find('.msg-text').append(complete_message);
        	this.$popupCont.show();
        }

        onClickPopClose(e){
        	e.preventDefault();
            var popup = $(e.currentTarget).parents(this.options.popupCont);
            popup.hide();

            var mainWin = BrowserWindow.fromId(config.mainId);
            mainWin.reload();
        }

        onFileChange(e, type){
            var trg = $(e.currentTarget)
            , ext = trg.val().split(".").pop().toLowerCase();

            if($.inArray(ext, ["csv"]) == -1) {
                alert(messages.ImproperCSVAttached.message);
                return false;
            }

            if (e.target.files != undefined) {
                var _this = this
                , reader = new FileReader();

                reader.onload = function(e) {
                    var csvval = e.target.result.split("\n")
                    , inputrad = ""
                    , result = { 'data' : [] };

                    // var pattern = new RegExp('^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$','i');
                    var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");

                    // _this.eleStage1.hide();
                    // _this.eleStage2.show();
                    // _this.form.show();
                    _this.$urlList.empty();

                    for (var i = 0; i < csvval.length; i++) {
                        if (csvval[i] == "" || 'undefined' == typeof csvval[i] || !pattern.test(csvval[i])) {
                          csvval.splice(i, 1);
                          i--;
                        }else{
                        	csvval[i] = _this.reFactSecureUrl(csvval[i]);
                        }

                        result.data[i] = { 
                            'no' : i+1, 'url' : csvval[i]
                        };                            
                    }

                    csvval = [];

                    $.each(result.data, function(i){
                    	var href = this.url;

						if (!(this.url.indexOf("http://") == 0 || this.url.indexOf("https://") == 0)) {
							href = "http://"+href;
					    }

                        // var tr = $('<tr data-url="' + href + '"><td class="url"><a href="' + href + '" class="alink">' + href + '</a></td><td class="btn"><button class="removeBtn" type="button">-</button></td></tr>');
                        csvval.push(href);
                        // tr.appendTo(_this.list);
                    });

                    
                    // _this.csvval = $.extend({}, win.hc.csvUrlData, csvval);
                    
                    // var csvval_arr = _this.csvval.join();
                    var csvval_arr = csvval.join();

                    if(!csvval_arr.length) {
                        alert(messages.emptyFile.message);
                        return false;
                    }

                    if("undefined" !== typeof _this.fileUploadType && _this.fileUploadType === "upload") 
                    	_this.resetCsvUrl();

                    _this.mergeCsvUrl(csvval);
                    
                    _this.isFileAttached = true;
                };
                reader.readAsText(e.target.files.item(0));
                trg.val('');
            }

            return false;
        }

        resetCsvUrl(){
        	win.hc.csvUrlData = [];
            this.refreshUrlList(true);
        }

        mergeCsvUrl(urls){
        	var _this = this;
        	
        	_.each(urls, function(i){
				i = _this.reFactSecureUrl(i);
			});
			
			win.hc.csvUrlData = _.union(win.hc.csvUrlData, urls);
			this.refreshUrlList();
        }

        refreshUrlList(isDelAll){
        	var _this = this,
        	newData = {};

        	if(!isDelAll){
				newData.data = [];
				win.hc.csvUrlData.forEach(function(v,i){
					newData.data[i] = {"url":v};
				});

			}else{
				newData = {"data":[]};
			}

        	fs.stat(config.dataPath, function(err, stats){
        		if(err){
					if(err.code == 'ENOENT' || err.code == 'ENOTDIR'){
						storage.set(config.fileNames.data, newData, function(error) {
							if (error) throw error;
						});
					}
				}else{
					storage.set(config.fileNames.data, newData, function(error) {
						if (error) throw error;
					});
					
				}
			});

			_this.$urlList.empty();

			_.each(newData.data, function(i){
				var li = $('<li class="DR" data-url="' + i.url + '"><button type="button" class="btn-circle btn-del">Delete url</button><a class="gwt-Anchor DR js-url-btn" href="' + i.url + '">' + i.url + '</a></li>');
				// <a class="gwt-Anchor DR ER" href="#">Limits</a>
				li.appendTo(_this.$urlList);
			});

			_this.$urlCount.text(newData.data.length);
			_this.changeSubmitBtn();
			_this.visualizeWebView();
        	
        }

        forceStopProc(message){
        	var _this = this;

        	_.each(BrowserWindow.getAllWindows(), function(bWindow){
				if(bWindow.id !== config.mainId) {
					bWindow.close();
				}
			});

			rmdir(config.destFolder, function (err, dirs, files) {
				console.log('all files are removed');

				if(powerSaveBlocker.isStarted(_this.powerSaveId)) powerSaveBlocker.stop(_this.powerSaveId);				  

				_this.disableLoading();
				_this.forceStopPopUp(message);
			  
			});
        }

		zipToDest(){
			_.each(BrowserWindow.getAllWindows(), function(bWindow){
				if(bWindow.id !== config.mainId) bWindow.close();
			});

			var nowDate = new Date(),
			month = nowDate.getMonth()+1,
			day = nowDate.getDate(),
			year = nowDate.getFullYear(),
			_this = this;

			if (month   < 10) {month   = "0"+month;}
			if (day < 10) {day = "0"+day;}

			var destFolder_sep_arr = config.destFolder.split(path.sep);
			
			var zipUUid_arr = destFolder_sep_arr[destFolder_sep_arr.length-1].split("-");

			var def_zip = "HC_" + year + '-' + month + '-' + day + "_" + zipUUid_arr[zipUUid_arr.length-1] + ".zip";

			config.zipFileName = (this.$zipNameEle.val())?this.$zipNameEle.val()+".zip":def_zip;

			try {
			  fs.accessSync(config.destFolder);
			} catch (e) {
				_this.forceStopProc(e.error);
				return;
			}

			var zipFilePath = app.getPath('desktop') + path.sep + config.zipFileName;
			zipdir(config.destFolder, { saveTo: zipFilePath }, function (err, buffer) {
				if (err){
					log.error('Internal error: %s',err);
				}

				rmdir(config.destFolder, function (err, dirs, files) {
				  console.log('all files are removed');

				  if(powerSaveBlocker.isStarted(_this.powerSaveId)) powerSaveBlocker.stop(_this.powerSaveId);				  

				  _this.disableLoading();
				  _this.completePopUp();
				  
				});
			});
		}

		createFolder(callback){
			var dirPath = app.getPath('userData') + path.sep + "captures";
			if (!fs.existsSync(dirPath)){
			  fs.mkdirSync(dirPath);
			}

			var folder = dirPath + path.sep + "HC-IMG-";
			fs.mkdtemp(folder, (err, folder) => {
                if (err) throw err;
                config.destFolder = folder;
                callback();
            });
		}

		convertFileName(order, url){
			url = url.replace(commentsTags, '').replace(tags, function ($0, $1) {
				return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
			});

			url = url.replace(';', '').replace('"', '').replace('\'', '/').replace('<?', '')
			.replace('<?', '').replace(/(\r\n|\n|\r)/gm,"");
			// .replace('\077', ' ');
			
			var url_wo_param = (url.indexOf("?") != -1)? url.split("?")[0]:url;
			var domain_name = url_wo_param;
			var disallowed = ['http://', 'https://'];

			for (var d in disallowed) {
				if(url_wo_param.indexOf(disallowed[d]) === 0) {
					 domain_name = url_wo_param.replace(disallowed[d], '');
				}
			}

			domain_name = domain_name.replace(/\//gi, '_').trim();
			
			return config.captureData.prefix + '_' + order + '_' + domain_name + '.png';
		}

		checkRedirectPage(url, callback){
			async.waterfall([
				function(cb){
					var res = false;
					var xhr = new XMLHttpRequest();
					xhr.onload = function(e) {
						
						if (this.status < 400 && this.status >= 300) {
							
							res = true;

						} else if(this.response){
							// console.log(this.response, 2)
							var match = this.response.match(/^.*?\bhttp\-equiv\b.*?\brefresh\b.*?$/m);
							// console.log(match, typeof match)
					  		res = (match && match.length > 0)? true:false;
		
						}

						cb(null, res);

					}
					xhr.open('GET', url, true);
					xhr.send();
					
				}
			], function(err, result){
				callback(result);
			});
			
		}

		procCaptureWindow(i, filename, isRedirect){
			let _this = this;
			let num = i+1;

			let captureBrowserSetting = {width: config.captureData.width+16, height: config.captureData.height};

			captureBrowserSetting.show = config.popUpVisible;

			_this.captureProcess = 0;
			let bWin = new BrowserWindow(captureBrowserSetting)
			
			bWin.setMenuBarVisibility(false);
			bWin.setAutoHideMenuBar(true);

			let captureData = {
				"parentId": config.mainId,
				"captureId": bWin.id,
				"url":win.hc.csvUrlData[i],
				"num":num,
				"destFolder":config.destFolder,
				"filename":filename,
				"prefix":config.captureData.prefix,
				"zipname":"",
				"isLazyLoad":config.captureData.isLazyLoad,
				"device":config.captureData.deviceType,
				"srcPath":config.srcPath,
				"size":captureBrowserSetting,
				"popUpVisible":config.popUpVisible,
				"ENVIRONMENT":config.ENVIRONMENT,
				"isRedirect":isRedirect
			};

			let httpOption = {
				"userAgent":config.captureData.userAgent
			};

			bWin.loadURL(config.captureData.template, httpOption)

			bWin.webContents.on('did-finish-load', () => {
				bWin.webContents.send('captureInfo', captureData)
			})

			console.log(i+1, win.hc.csvUrlData[i])

			bWin.on('closed', function () {
				bWin = null;
				i++;

				if(i >= win.hc.csvUrlData.length){
					if(win.hc.CaptureProcess) clearTimeout(win.hc.CaptureProcess);

					win.hc.CaptureProcess = null;
					_this.zipToDest();
				}

				// Check all the hidden windows 
				// if there is any unnecessary windows then close 
				_.each(BrowserWindow.getAllWindows(), function(bWindow){
					if(bWindow.id !== config.mainId) bWindow.close();
				});

				_this.openCaptureWindow(i);
			})
		}

		openCaptureWindow(i){
			if("undefined" === typeof win.hc.csvUrlData || "undefined" === typeof win.hc.csvUrlData[i]) return;

			if(win.hc.CaptureProcess) clearTimeout(win.hc.CaptureProcess);
			win.hc.CaptureProcess = null;

			var _this = this;
			let num = i+1;

			let filename = this.convertFileName(num, win.hc.csvUrlData[i]);

			// Check Samsung.com Preview Page 
			if(this.isSamsungPreviewPage(win.hc.csvUrlData[i])){
				// 세션 검사 
				_this.checkSamsungSession(function(isExist){
					if(!isExist) _this.openSSLoginWin(function(){
						// 추후 Redirect Check 기능 추가
						_this.procCaptureWindow(i, filename, null);
					});
					else
						_this.procCaptureWindow(i, filename, null);
				});

			}else{
				// Check Redirect page
				this.checkRedirectPage(win.hc.csvUrlData[i], function(isRedirect){
					_this.procCaptureWindow(i, filename, isRedirect);
				});
			}
		}

		openSSLoginWin(callback){
			let captureBrowserSetting = {width: ssConfig.wdsLogin.width, height: ssConfig.wdsLogin.height};
			// let captureBrowserSetting = {width: 800, height: 650};

			win.hc.ssLoginWin = new BrowserWindow(captureBrowserSetting)

			win.hc.ssLoginWin.setMenuBarVisibility(false);
			win.hc.ssLoginWin.setAutoHideMenuBar(true);

			win.hc.ssLoginWin.webContents.openDevTools();

			// win.hc.ssLoginWin.loadURL("https://wds.samsung.com/wds/sso/login/forwardLoginForm.do")
			if (typeof config.ssloginData === 'undefined') config.ssloginData = {};

			config.ssloginData.template = "file://"+config.srcPath+"/../templates/ssLogin.html";

			win.hc.ssLoginWin.loadURL(config.ssloginData.template)

			win.hc.ssLoginWin.webContents.on('did-finish-load', () => {
				win.hc.ssLoginWin.webContents.send('captureInfo', {"loginWinId":win.hc.ssLoginWin.id})
			})
			
			win.hc.ssLoginWin.on('closed', function () {
				callback();
			})

		}

		isSamsungPreviewPage(url){
			
			var match = url.match(/^.*?\b(stgweb4|preview4|STGWEB4|PREVIEW4)\b.*?\bsamsung\.com\b.*?$/m);
			var res = (match && match.length > 0)? true:false;

			return res;
		}

		checkSamsungSession(callback){
			var res = false;
			// 저장 
			// const cookie = {url: 'http://wcms4.samsung.com', domain: '.samsung.com', name: 'IW_AUTHENTICATION.P4', value: '52616e646f6d495648920b3fc0e85135ce07694dbe3f38bf673795911a6c81e6aeded00adbe0ca98c4e2a346260089ef15e856b27eec64d965dae31a8e018935050c7bf08f3c4d7e403ea48c477e0eb6902d16941173f0ddb1e8ded04b14f54aee382c85ea7f6db6c5cc4272f51cc437'}
			
			// session.defaultSession.cookies.set(cookie, (error) => {
			//   if (error) console.error(error)
			// })

			// 삭제
			// session.defaultSession.cookies.remove(ssConfig.cookie.url, ssConfig.cookie.name, (error) => {
			//   if (error) console.error(error)
			// })

			// 검색 all
			// console.log(ses, ses.cookies.domain)
			// session.defaultSession.cookies.get({}, (error, cookies) => {
			//   console.log(error, cookies)
			// })

			session.defaultSession.cookies.get({domain: ssConfig.cookie.domain, name: ssConfig.cookie.name}, (error, cookie) => {
				if (error || ("object" === typeof cookie && cookie.length <= 0)) res = false;
				else res = true;

				callback(res);
			})	
		}

		onClickSubmitBtn(e){
			e.preventDefault();
			
			if('undefined' === typeof win.hc.csvUrlData || win.hc.csvUrlData.length === 0 ){
				alert(messages.outOfCsvUrl.message);
				return;
			}

			if(confirm(win.hc.csvUrlData.length + messages.proceed.message)){
				var _this = this;

				config.captureData = {};

				config.captureData.prefix = (this.$prefixEle.val())?this.$prefixEle.val():"HC";
				config.captureData.width = (this.$dimenWEle.val())?parseInt(this.$dimenWEle.val()):1280;
				config.captureData.height = (this.$dimenHEle.val())?parseInt(this.$dimenHEle.val()):768;
				config.captureData.noHeight = (this.$noHeightEle.is(":checked"))?true:false;
				config.captureData.isLazyLoad = (this.$lazyLoadEle.is(":checked"))?true:false;
				config.captureData.deviceType = this.$deviceSelEle.val();
				config.captureData.userAgent = _this.setDevice();
				
				config.captureData.template = "file://"+config.srcPath+"/../templates/capture.html";
				this.enableLoading();
				
				if('undefined' !== typeof config.ENVIRONMENT && config.ENVIRONMENT !== "PROC") 
					_this.setStartTimeForTest();

				this.createFolder(function(){

					_this.powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
			
					_this.openCaptureWindow(0);
				});
			}
		}

		setDevice(){
			var usrAgent = "",
			device = (this.$deviceSelEle.val())?this.$deviceSelEle.val():"pc-win";

			switch(device){
				case "pc-win":
				usrAgent = devices["pc-win7"].userAgent.ie11;// Windows 7 IE 11
				break;
				case "pc-mac":
				usrAgent = devices["pc-mac"].userAgent.safari;// MacOS safari
				break;
				case "m-galaxyS6":
				usrAgent = devices["m-galaxyS6"].userAgent.default;
				break;
				case "m-galaxyS5":
				usrAgent = devices["m-galaxyS5"].userAgent.default;
				break;
				case "m-galaxyS4":
				usrAgent = devices["m-galaxyS4"].userAgent.default;
				break;
				case "m-galaxyS3":
				usrAgent = devices["m-galaxyS3"].userAgent.default;
				break;
				case "m-iphone6":
				usrAgent = devices["m-iphone6"].userAgent.default;
				break;
				case "m-iphone6p":
				usrAgent = devices["m-iphone6p"].userAgent.default;
				break;
				case "t-ipad":
				usrAgent = devices["t-ipad"].userAgent.default;
				break;
				case "t-galaxyTab":
				usrAgent = devices["t-galaxyTab"].userAgent.default;
				break;
				default:
				usrAgent = devices.othr.userAgent.default;
				break;
			}

			console.log(devices, usrAgent)
			return usrAgent;
		}

		onDeviceChange(e){
			var $trg = $(e.currentTarget),
			device = $trg.val(),
			dim = {};

			switch(device){
				case "pc-win":
				dim = devices["pc-win7"].dimension;// Windows 7 IE 11
				break;
				case "pc-mac":
				dim = devices["pc-mac"].dimension;// MacOS safari
				break;
				case "m-galaxyS6":
				dim = devices["m-galaxyS6"].dimension;
				break;
				case "m-galaxyS5":
				dim = devices["m-galaxyS5"].dimension;
				break;
				case "m-galaxyS4":
				dim = devices["m-galaxyS4"].dimension;
				break;
				case "m-galaxyS3":
				dim = devices["m-galaxyS3"].dimension;
				break;
				case "m-iphone6":
				dim = devices["m-iphone6"].dimension;
				break;
				case "m-iphone6p":
				dim = devices["m-iphone6p"].dimension;
				break;
				case "t-ipad":
				dim = devices["t-ipad"].dimension;
				break;
				case "t-galaxyTab":
				dim = devices["t-galaxyTab"].dimension;
				break;
				default:
				dim = devices.othr.dimension;
				break;
			}

			this.$dimenWEle.val(dim.w);
			this.$dimenHEle.val(dim.h);
		}

		onClickUrlList(e){
			var $trg = $(e.target);

			if(!($trg.hasClass(this.options.urlBtnClass) || $trg.hasClass(this.options.urlDeleteBtnClass))) return;
			e.preventDefault();

			if($trg.hasClass(this.options.urlBtnClass)){

				this.$webview = this.$WebViewCont.find('webview');
				this.$webview[0].loadURL($trg.attr('href'), win.hc.webViewOpt);
				this.$WebViewUrlEle.text($trg.attr('href'));

			}else if($trg.hasClass(this.options.urlDeleteBtnClass)){

				var index = $(e.currentTarget).find('li.DR').index($trg.parent('li.DR'));

				win.hc.csvUrlData.splice(index, 1);
				
				this.refreshUrlList();

			}
		}

		reFactSecureUrl(url){
			url = url.replace(commentsTags, '').replace(tags, function ($0, $1) {
				return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
			});

			url = url.replace(';', '').replace('"', '').replace('\'', '/').replace('<?', '')
			.replace('<?', '').replace(/(\r\n|\n|\r)/gm,"");

			return url;
		}

		changeSubmitBtn(){
			if(win.hc.csvUrlData.length > 0){
				
				if(!this.$submitBtn.hasClass('disabled')) return;

				this.$submitBtn.removeClass('disabled');
				this.$submitBtn.attr('disabled', false);
				
			}else{
				if(this.$submitBtn.hasClass('disabled')) return;

				this.$submitBtn.addClass('disabled');
				this.$submitBtn.attr('disabled', true);
				
			}
		}

		setStartTimeForTest(){
			this.testStartTime = new Date().getTime();
			console.log(this.testStartTime)
		}

		getTimeforTest(){
			var endTime = new Date().getTime();
			console.log(endTime)

			var sec = ((endTime - this.testStartTime) / 1000 ) % 60;
			this.testStartTime = null;

			var sec_num = parseInt(sec, 10);
			console.log(sec_num, sec)
		    var hours   = Math.floor(sec_num / 3600);
		    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		    var seconds = sec_num - (hours * 3600) - (minutes * 60);

		    if (hours   < 10) {hours   = "0"+hours;}
		    if (minutes < 10) {minutes = "0"+minutes;}
		    if (seconds < 10) {seconds = "0"+seconds;}
		    console.log(hours+':'+minutes+':'+seconds)
		    return hours+':'+minutes+':'+seconds;
		}
	};

	// Data transfered from Main process
	ipc.on('info', (event, config) => {
		win.config = config;

		var $ul_list = $('.js-csvList'),
		$urlCount = $('.js-listCount'),
		$submitBtn = $('button.js-submit-btn');

		async.waterfall([
			function(cb){
				let dirPath = app.getPath('userData') + path.sep + "captures";

				try {
				  fs.accessSync(dirPath);
				} catch (e) {
					fs.mkdirSync(dirPath);
				}

				let res = {
					"data":{}, "history":{}
				};

				cb(null, res);
			},
			function(res, cb){
				
				fs.stat(config.dataPath, function(err, stats){
					if(err){
						if(err.code == 'ENOENT' || err.code == 'ENOTDIR'){
							storage.set(config.fileNames.data, config.defaultStruct.data, function(error) {
								if (error) throw error;
							});
						}
					}else{
						var dataStrEncoded = fs.readFileSync(config.dataPath, 'utf8');
						
						if('undefined' !== typeof dataStrEncoded && dataStrEncoded){
							try{
						        res['data'] = JSON.parse(dataStrEncoded).data;
						    }catch(e){
						        storage.set(config.fileNames.data, config.defaultStruct.data, function(error) {
									if (error) throw error;
								});
						    }
						}
							
					}

					cb(null, res);
				});
			},
			function(res, cb){
				fs.stat(config.historyPath, function(err, stats){
					if(err){
						if(err.code == 'ENOENT' || err.code == 'ENOTDIR'){
							storage.set(config.fileNames.history, config.defaultStruct.history, function(error) {
								if (error) throw error;
							});
						}
					}else{
						var historyStrEncoded = fs.readFileSync(config.historyPath, 'utf8');

						if('undefined' !== typeof historyStrEncoded && historyStrEncoded){
							try{
						        res['history'] = JSON.parse(historyStrEncoded);
						    }catch(e){
						        storage.set(config.fileNames.history, config.defaultStruct.history, function(error) {
									if (error) throw error;
								});
						    }
						}
					}

					cb(null, res);
				});
			    
			}
		], function(err, result){
			var newDataArr = [];
			
			$urlCount.text(result.data.length);
			if(result.data.length < 1){
				$submitBtn.addClass('disabled');
				$submitBtn.attr('disabled', true);
			}

			_.each(result.data, function(i){
				var newData = i.url;

				newData.replace(commentsTags, '').replace(tags, function ($0, $1) {
					return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
				});

				newData = newData.replace(';', '').replace('"', '').replace('\'', '/').replace('<?', '')
				.replace('<?', '').replace(/(\r\n|\n|\r)/gm,"");

				// const li = $('<li class="DR" data-url="' + i.url + '"><button type="button" class="btn-circle btn-del">Delete url</button><span class="url">' + i.url + '</span></li>');
				const li = $('<li class="DR" data-url="' + newData + '"><button type="button" class="btn-circle btn-del">Delete url</button><a class="gwt-Anchor DR js-url-btn" href="' + newData + '">' + newData + '</a></li>');

				newDataArr.push(newData);
				// <a class="gwt-Anchor DR ER" href="#">Limits</a>
				li.appendTo($ul_list);
			});

			win.hc.csvUrlData = newDataArr;

			// first URL displaying webview
			var initUrl = (newDataArr.length > 0 && 'undefined' !== newDataArr[0])? newDataArr[0]:"http://www.hivelab.co.kr/";
			$('.js-webCont').append('<webview id="webView" src="'+initUrl+'" plugins style="display:inline-flex; width:100%; height:100%; overflow:hidden;" preload="../libs/mainWebView.js"></webview>');
			$('.js-browser-url').text(initUrl);

			document.getElementById('webView').addEventListener('console-message', function(e) {
		        console.log(e.message);
		      });
		});

	})

	ipc.on('singleCaptureProcess', (event, procConfig) => {
		if(win.hc.CaptureProcess) clearTimeout(win.hc.CaptureProcess);
		win.hc.CaptureProcess = null;

		win.hc.CaptureProcess = setTimeout(function(){
			closeCanvasResetCapture(procConfig);
	    },10000);

	})

	$(function() {
        new win.hc.MainComponent({
        	"options":{
        		"test" : "test"
        	}
        });
    });
})(window, jQuery, electron.ipcRenderer);
