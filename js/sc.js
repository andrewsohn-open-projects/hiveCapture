;
(function($, window, document, undefined) {
    'use strict';    

    var _util = sc.ui.Util;

    sc.ui.Entry = (function() {
        return {
            init: function(container, options) {
                this._defaults = {
                    csvEle: {
                        btn: '#csvInsrtBtn',
                        downTempBtn: '#csvDnldBtn',
                        inpt: 'input[name=csv]', 
                        table: '.csv_table', 
                        listCont: '.csvList', 
                        tmpl: '.csvListTmpl'
                    },
                    submit: {
                        form: 'form[name=sForm]', 
                        urls: 'input[name=urls]', 
                        btn: '.btn_capture'
                    },
                    dimmed: {
                        cont: '.dimmed'
                    },
                    stage: {
                        stage1: '.ele-stage-1',
                        stage2: '.ele-stage-2',
                        backBtn: '.ui-icon-carat-l'
                    },
                    destUrl: './result.html', 
                    getCapturedImg: 'http://qa.hivelab.co.kr:4000/samsung/scAction/chromeEx',
                    getUuid: 'http://qa.hivelab.co.kr:4000/samsung/scAction/getUuid',
                    csvTemplateUrl: 'http://qa.hivelab.co.kr:4000/samsung/assets/data/HC_URL_List_Template.csv',
                    actionUrl: './extract.html'
                };

                this._options = $.extend(true, this._defaults, options);

                this.container = container;
                this._assignedHTMLElements();
                this._initProperties();
                this._attachEvents();
            },

            _initProperties: function() {
                this.xhr = [];
            },

            _assignedHTMLElements: function() {
                // CSV Element
                this.btn = this.container.find(this._options.csvEle.btn);
                this.downTempBtn = this.container.find(this._options.csvEle.downTempBtn);
                this.fileEle = this.container.find(this._options.csvEle.inpt);
                this.table = this.container.find(this._options.csvEle.table);
                this.list = this.table.find(this._options.csvEle.listCont);

                this.eleStage1 = this.container.find(this._options.stage.stage1);
                this.eleStage2 = this.container.find(this._options.stage.stage2);
                this.backBtn = this.container.find(this._options.stage.backBtn);
                // this.listTmpl = this.container.find(this._options.csvEle.tmpl);
                // this.idown = $('<iframe>', { id: 'idown', src: '' }).hide().appendTo(this.container);

                this.dimmed = this.container.find(this._options.dimmed.cont);
                this.urls = this.container.find(this._options.submit.urls);
                this.submitBtn = this.container.find(this._options.submit.btn);
            },

            _attachEvents: function() {
                this.btn.on('click', $.proxy(this._onClickBtn, this));
                this.downTempBtn.on('click', $.proxy(this._onClickTempBtn, this));
                this.fileEle.on('change', $.proxy(this._onFileChange, this));
                this.list.on('click', $.proxy(this._onListClick, this));
                this.submitBtn.on('click', $.proxy(this._onSubmit, this));
                this.backBtn.on('click', $.proxy(this._goToFirst, this));
            },

            _goToFirst: function(e){
                e.preventDefault();
                this.fileEle.val('');
                this.list.empty();
                this.eleStage1.show();
                this.eleStage2.hide();
            },

            _onClickTempBtn: function(e){
                e.preventDefault();
                var _this = this;
                // this.idown.attr('src', downUrl);
                chrome.downloads.download({url: _this._options.csvTemplateUrl});
            },

            _onFileChange: function(e){
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
                        _this.list.empty();

                        for (var i = 0; i < csvval.length; i++) {
                            if (csvval[i] == "" || 'undefined' == typeof csvval[i] || !pattern.test(csvval[i])) {
                              csvval.splice(i, 1);
                              i--;
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

                        _this.csvval = csvval;
                        // _this.urls.val(_this.csvval.join());
                        var url = _this._options.actionUrl;

                        localStorage['csvUrl'] = _this.csvval.join();
                        
                        chrome.windows.create({
                            'url': url, 'type': 'popup', 'width': _util.winWidth() + 35, 'height': _util.winHeight() + 40
                        }, function(win){
                           window.close(); 
                        });
                    };
                    reader.readAsText(e.target.files.item(0));
                }

                return false;
            },

            // _getRandomToken: function() {
            //     // E.g. 8 * 32 = 256 bits token
            //     var randomPool = new Uint8Array(32);
            //     crypto.getRandomValues(randomPool);
            //     var hex = '';
            //     for (var i = 0; i < randomPool.length; ++i) {
            //         hex += randomPool[i].toString(16);
            //     }
            //     // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
            //     return hex;
            // },

            _onClickBtn: function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                this.fileEle.trigger('click');
            },

            _onListClick: function(e) {
                var trg = $(e.target);
                if(trg.hasClass('removeBtn')){
                    var tr = trg.parents('tr').eq(0),
                    removeBtns = this.list.find('.removeBtn'), 
                    idx = removeBtns.index(trg);

	                this.csvval.splice(idx, 1);
	                this.urls.val(this.csvval.join());
	                tr.remove();

                } else if(trg.hasClass('alink')){
                	chrome.windows.create({"url": trg.attr('href'), "type": "popup"});
                }

                
            },

            _onSubmit: function(e) {
            	e.preventDefault;
                var _this = this;

            	_this.stNum = 0;
            	
//            	this.imageCont.show();
				_this._getUuid(function(){
                    _this.dimmed.show();
                    _this.container.append('<div class="loading-box" style="display : block;"></div>');
                    if('undefined' != typeof _this.uuid) _this._loopSCAjax(_this.stNum);
                });
            	
            },

            _getUuid: function(cb){
            	var fullUrl = this._options.getUuid
            	, xhr = new XMLHttpRequest()
            	, _this = this;
				xhr.open("GET", fullUrl, true);
				xhr.setRequestHeader("Content-Type","application/json");
				xhr.timeout = 10000;
				xhr.onreadystatechange = function() {
				    if (xhr.readyState == 4 && xhr.status == 200) {
				    	var res = JSON.parse(xhr.responseText);
				    	_this.uuid = res.data.uuid;
                        cb();
				  }
				}
	       		xhr.send();
            },

            _loopSCAjax: function(st) {
            	if(this.csvval.length > st){
            		console.log(this.uuid, this.csvval.length, st)
            		var _this = this, 
                    json = { url : _this.csvval[st] };

					var fullUrl = _this._options.getCapturedImg + '?url=' + _this.csvval[st] + '&uuid=' + _this.uuid;
					_this.xhr[st] = new XMLHttpRequest();
					_this.xhr[st].open("GET", fullUrl, true);
					_this.xhr[st].setRequestHeader('Content-Type', 'application/json');
					_this.xhr[st].timeout = 10000;
					_this.xhr[st].onreadystatechange = function() {
                        if (_this.xhr[st].readyState == 4 && _this.xhr[st].status == 200) {
					    	var res = JSON.parse(_this.xhr[st].responseText);
					       //handle the xhr response here
					       // if () {
					       		setTimeout(function(){
                                    _this.list.find('tr').eq(st).addClass('sc-success');
                                    _this.stNum ++;
                                    _this._loopSCAjax(_this.stNum);
					       		}, 1000);
					       		
					       // }
					       
					  }else{
                        _this.list.find('tr').eq(st).addClass('sc-fail');
                      }
					}
					setTimeout(function(){
		       			_this.xhr[st].send();
		       		}, 1000);
					
				}else if(this.csvval.length === st){
                    var url = this._options.destUrl + '?uuid=' + this.uuid;
                    this.dimmed.empty();
					chrome.tabs.create({"url": url});
				}
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Entry.init(container);
    });
})(jQuery, window, document);

