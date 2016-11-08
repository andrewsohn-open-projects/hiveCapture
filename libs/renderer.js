const electron = require('electron'),
storage = require('electron-json-storage'),
fs = require('fs'),
async = require('async'),
path = require('path'),
_ = require('underscore'),
zipdir = require('zip-dir'),
rmdir = require('rmdir'),
messages = require('./message.js');

const {app, BrowserWindow} = require('electron').remote

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
				prefixEle:'input[name=prefix]',
				zipNameEle:'input[name=zipName]',
				dimenWEle:'input[name=dimenW]',
				dimenHEle:'input[name=dimenH]',
				noHeightEle:'input[name=noVert]',
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
			this.$prefixEle = this.$contLayoutA.find(this.options.prefixEle);
			this.$zipNameEle = this.$contLayoutA.find(this.options.zipNameEle);
			this.$dimenWEle = this.$contLayoutA.find(this.options.dimenWEle);
			this.$dimenHEle = this.$contLayoutA.find(this.options.dimenHEle);
			this.$noHeightEle = this.$contLayoutA.find(this.options.noHeightEle);

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
			webview.attr('src',initUrl);
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
			_this.visualizeWebView();
        	
        }

		zipToDest(){
			var nowDate = new Date();
			var month = nowDate.getMonth()+1;
			var day = nowDate.getDate();
			var year = nowDate.getFullYear();

			if (month   < 10) {month   = "0"+month;}
			if (day < 10) {day = "0"+day;}

			var def_zip = "HC_" + year + '-' + month + '-' + day + ".zip";

			config.zipFileName = (this.$zipNameEle.val())?this.$zipNameEle.val()+".zip":def_zip;

			try {
			  fs.accessSync(config.destFolder);
			} catch (e) {
			  	return res.json({ 
					error: e.error
				});
			}

			var zipFilePath = app.getPath('desktop') + path.sep + config.zipFileName;
			zipdir(config.destFolder, { saveTo: zipFilePath }, function (err, buffer) {
				if (err){
					log.error('Internal error: %s',err);
				}

				rmdir(config.destFolder, function (err, dirs, files) {
				  console.log('all files are removed');
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

		openCaptureWindow(i){
			if("undefined" === typeof win.hc.csvUrlData || "undefined" === typeof win.hc.csvUrlData[i]) return;

			var _this = this;
			let num = i+1;

			let filename = this.convertFileName(num, win.hc.csvUrlData[i]);

			let bWin = new BrowserWindow({width: config.captureData.width, height: config.captureData.height})
			let captureData = {
				"parentId": config.mainId,
				"captureId": bWin.id,
				"url":win.hc.csvUrlData[i],
				"num":num,
				"destFolder":config.destFolder,
				"filename":filename,
				"prefix":config.captureData.prefix,
				"zipname":""
			};

			bWin.loadURL(config.captureData.template)

			bWin.webContents.on('did-finish-load', () => {
				bWin.webContents.send('captureInfo', captureData)
			})

			console.log(win.hc.csvUrlData[i])

			bWin.on('closed', function () {
				bWin = null;
				i++;
				if(i >= win.hc.csvUrlData.length) _this.zipToDest();
				_this.openCaptureWindow(i);
			})
			
		}

		onClickSubmitBtn(e){
			e.preventDefault();

			if(confirm('진행하시겠습니까?')){
				var _this = this;

				config.captureData = {};

				config.captureData.prefix = (this.$prefixEle.val())?this.$prefixEle.val():"HC";
				config.captureData.width = (this.$dimenWEle.val())?parseInt(this.$dimenWEle.val()):1280;
				config.captureData.height = (this.$dimenHEle.val())?parseInt(this.$dimenHEle.val()):768;
				config.captureData.noHeight = (this.$noHeightEle.is(":checked"))?true:false;

				config.captureData.template = "file://"+config.srcPath+"/../templates/capture.html";
				this.createFolder(function(){
					_this.openCaptureWindow(0);
				});
			}
		}

		onClickUrlList(e){
			var $trg = $(e.target);

			if(!($trg.hasClass(this.options.urlBtnClass) || $trg.hasClass(this.options.urlDeleteBtnClass))) return;
			e.preventDefault();

			if($trg.hasClass(this.options.urlBtnClass)){

				var webview = this.$WebViewCont.find('webview');
				webview[0].loadURL($trg.attr('href'), win.hc.webViewOpt);

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
			$('.js-webCont').append('<webview id="webView" src="'+initUrl+'" plugins style="display:inline-flex; width:100%; height:98%"></webview>');

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
