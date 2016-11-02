const electron = require('electron'),
storage = require('electron-json-storage'),
fs = require('fs'),
async = require('async'),
_ = require('underscore'),
messages = require('./message.js');

const {BrowserWindow} = require('electron').remote

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

	/**
	* 
	* @class
	* @example 
	*/
	win.hc.MainComponent = class MainComponent {
		defaults(){
			this.body = $('body');
			// this.text = '';
			return {
				csvUploadBtn: '#csvInsrtBtn',
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
				csvEle:'input[name=csv]',
				urlCount:'.js-listCount'
			};
		}
		constructor(settings){
			this.options = $.extend({}, this.defaults(), settings.options);
			this.init();
		}

		init(){
			// console.log(this.options)
			this.assigneElements();
			this.bindEvents();

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
			this.$csvUploadBtn = this.$contLayoutA.find(this.options.csvUploadBtn);

			//Layout B
			this.$contLayoutB = this.$contLayout.find(this.options.layoutB);
			this.$urlList = this.$contLayoutB.find(this.options.urlListClass);
			this.$urlCount = this.$contLayoutB.find(this.options.urlCount);
			this.$urlDelAll = this.$contLayoutB.find(this.options.urlDelAllBtn);
			
			// web view container
			this.$WebViewCont = this.$contLayoutB.find(this.options.layoutWebView);
			// this.$webview = this.$contLayoutB.find(this.options.webViewId);


			this.$fileEle = this.body.find(this.options.csvEle);
			this.$submitBtn = this.body.find(this.options.submitBtnClass);
		}

		bindEvents(){
			// console.log(this.$webview[0]);
			// this.$webview[0].openDevTools();

			this.$contLayout.enhsplitter({minSize: 50, vertical: false});
        	this.$contLayoutB.enhsplitter();

        	// Config Layer
        	this.$csvUploadBtn.on('click', $.proxy(this.onClickBtn, this));
        	this.$fileEle.on('change', $.proxy(this.onFileChange, this));
			this.$submitBtn.on('click', $.proxy(this.onClickSubmitBtn, this));

			this.$urlDelAll.on('click', $.proxy(this.onClickDelAll, this));
			this.$urlList.on('click', $.proxy(this.onClickUrlList, this));
		}

		onClickDelAll(e){
			e.preventDefault();
            // var $trg = $(e.currentTarget);
            win.hc.csvUrlData = [];
            this.refreshUrlList(true);
		}

		visualizeWebView(){
			var initUrl = (win.hc.csvUrlData.length > 0 && 'undefined' !== win.hc.csvUrlData[0])? win.hc.csvUrlData[0]:"http://www.hivelab.co.kr/";
			var webview = this.$WebViewCont.find('webview');
			console.log(webview)
		}

		onClickBtn(e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            this.$fileEle.trigger('click');
        }

        onFileChange(e){
            var trg = $(e.currentTarget)
            , ext = trg.val().split(".").pop().toLowerCase();

            if($.inArray(ext, ["csv"]) == -1) {
                alert('Please upload a proper CSV file.');
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

                    _this.mergeCsvUrl(csvval);
                    _this.isFileAttached = true;
                };
                reader.readAsText(e.target.files.item(0));
                trg.val('');
            }

            return false;
        }

        mergeCsvUrl(urls){
        	var _this = this;
        	console.log(urls);
        	_.each(urls, function(i){
				i = _this.reFactSecureUrl(i);
			});
			
			win.hc.csvUrlData = _.union(win.hc.csvUrlData, urls);
			this.refreshUrlList();
        }

        refreshUrlList(isDelAll){
        	var _this = this,
        	newData = config.defaultStruct.data;
        	
        	if(!isDelAll){
	        	for(var i=0; i<win.hc.csvUrlData.length; i++){
					newData.data[i] = {"url":win.hc.csvUrlData[i]};
				}
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
			_this.visualizeWebView();
        }

        takeScreenShot (callback) {
		    let screenConstraints = {
		        mandatory: {
		            chromeMediaSource: "screen",
		            maxHeight: 1080,
		            maxWidth: 1920,
		            minAspectRatio: 1.77
		        },
		        optional: []
		    };

		    let session = {
		        audio: false,
		        video: screenConstraints
		    };

		    let streaming = false;
		    let canvas = document.createElement("canvas");
		    let video = document.createElement("video");
		    document.body.appendChild(canvas);
		    document.body.appendChild(video);
		    let width = screen.width;
		    let height = 0;

		    video.addEventListener("canplay", function(){
		        if (!streaming) {
		            height = video.videoHeight / (video.videoWidth / width);

		            if (isNaN(height)) {
		                height = width / (4 / 3);
		            }

		            video.setAttribute("width", width.toString());
		            video.setAttribute("height", height.toString());
		            canvas.setAttribute("width", width.toString());
		            canvas.setAttribute("height", height.toString());
		            streaming = true;

		            let context = canvas.getContext("2d");
		            if (width && height) {
		                canvas.width = width;
		                canvas.height = height;
		                context.drawImage(video, 0, 0, width, height);

		                canvas["toBlob"](function (data) {
		                    video.pause();
		                    video.src = "";
		                    document.body.removeChild(video);
		                    document.body.removeChild(canvas);
		                    callback(data);
		                });
		            }
		        }
		    }, false);

		    navigator["webkitGetUserMedia"](session, function (stream) {
		        video.src = window["webkitURL"].createObjectURL(stream);
		        video.play();
		    }, function () {
		        console.error("Can't take a screenshot");
		    });
		}

		onClickSubmitBtn(e){
			e.preventDefault();

			let newWin = new BrowserWindow({width: 800, height: 600})
			let captureTemplate = "file://"+config.srcPath+"/../templates/capture.html";

			let captureData = {
				"parentId": config.mainId,
				"captureId": newWin.id,
				"url":"http://www.samsung.com/br/home/"
			};

			newWin.loadURL(captureTemplate)
			newWin.webContents.on('did-finish-load', () => {
				newWin.webContents.send('captureInfo', captureData)
			})
			// ipc.on('setPosition', (event, arg) => {
			//   console.log(arg)  // prints "ping"
			  
			// })
			// let captureWin = BrowserWindow.fromId(config.subId);
			// captureWin.loadURL(captureTemplate)
			// captureWin.webContents.on('did-finish-load', () => {
			//     captureWin.webContents.send('captureInfo', captureData)
			//   })
		// myWindow.webContents.send('an-event-from-window-zero');
  //   	ipc.send('setPosition', 'ping');

		}

		onClickUrlList(e){
			var $trg = $(e.target);

			if(!($trg.hasClass(this.options.urlBtnClass) || $trg.hasClass(this.options.urlDeleteBtnClass))) return;
			e.preventDefault();

			if($trg.hasClass(this.options.urlBtnClass)){

				var webview = this.$WebViewCont.find('webview');
				webview[0].loadURL($trg.attr('href'), win.hc.webViewOpt);

			}else if($trg.hasClass(this.options.urlDeleteBtnClass)){
				var delUrl = $trg.next('a').eq(0).attr('href'),
				newDataArr = [];

				delUrl = this.reFactSecureUrl(delUrl);

				var newData = _.without(win.hc.csvUrlData, _.findWhere(win.hc.csvUrlData, delUrl));

				win.hc.csvUrlData = newData;
				this.refreshUrlList();
				// console.log(delUrl, newData);
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
	};

	// Data transfered from Main process
	ipc.on('info', (event, config) => {
		win.config = config;
		var $ul_list = $('.js-csvList');
		var $urlCount = $('.js-listCount');

		async.waterfall([
			function(cb){
				
				let res = {
					"data":{}, "history":{}
				};
		
				fs.stat(config.dataPath, function(err, stats){
					if(err){
						if(err.code == 'ENOENT' || err.code == 'ENOTDIR'){
							storage.set(config.fileNames.data, config.defaultStruct.data, function(error) {
								if (error) throw error;
							});
						}
					}else{
						res['data'] = JSON.parse(fs.readFileSync(config.dataPath, 'utf8')).data;
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
						res['history'] = JSON.parse(fs.readFileSync(config.historyPath, 'utf8'));
					}
					cb(null, res);
				});
			    
			}
		], function(err, result){
			var newDataArr = [];
			
			$urlCount.text(result.data.length);

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
			$('.js-webCont').append('<webview id="webView" src="'+initUrl+'" preload="../libs/inject.js" plugins style="display:inline-flex; width:100%; height:98%"></webview>');

			document.getElementById('webView').addEventListener('console-message', function(e) {
		        console.log(e.message);
		      });
		});

	})

	$(function() {
        new win.hc.MainComponent({
        	"options":{
        		"test" : "test"
        	}
        });
    });
})(window, jQuery, electron.ipcRenderer);
