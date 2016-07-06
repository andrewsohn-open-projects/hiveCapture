/**
 * This file is part of the hiveCapture.
 * Requires jQuery 1.12.0
 *
 * https://github.com/andrewsohn/hiveCapture
 * 
 * Copyright 2016, Andrew Sohn
 * hivelab Co., Ltd
 * http://www.hivelab.co.kr/
 * 
 * Licensed under MIT
 * 
 * Released on: February 24, 2016
 */
;
(function($, window, document, undefined) {
    'use strict';

    var _config = sc.ui.config;

    window.sc.ui.Extract = (function() {
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
                        prefix: 'input[name=prefix]', 
                        btn: '.btn_capture'
                    },
                    dimmed: {
                        cont: '.dimmed'
                    },
                    stage: {
                        stage1: '.ele-stage-1',
                        stage2: '.ele-stage-2'
                    },
                    destUrl: './result.html', 
                    getCapturedImg: _config.api_url + '/scAction/chromeEx',
                    getUuid: _config.api_url + '/scAction/getUuid',
                    csvTemplateUrl: _config.api_url + '/assets/data/HC_URL_List_Template.csv',
                    actionUrl: './extract.html',
                    defaultPrefix: _config.file_prefix
                };

                this._options = $.extend(true, this._defaults, options);

                this.container = container;

                this._initProperties();
                // this._sigletone();
                this._assignedHTMLElements();
                this._attachEvents();
                this._onListUp();
            },

            _initProperties: function(){
                this.xhr = [];
                this.csvUrl = localStorage['csvUrl'].split(',');
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
                // this.listTmpl = this.container.find(this._options.csvEle.tmpl);
                // this.idown = $('<iframe>', { id: 'idown', src: '' }).hide().appendTo(this.container);

                this.dimmed = this.container.find(this._options.dimmed.cont);
                this.urls = this.container.find(this._options.submit.urls);
                this.submitBtn = this.container.find(this._options.submit.btn);
            },

            _initImgData: function() {
                this.xhr = [];
                var _this = this;

                this._getImgData(function(data){
                    $.each(data.imgList, function(){
                        var li = '<li class="swiper-slide" data-no="' + this.no + 
                            '" data-img="' + this.name + '"><img src="' + this.url + '" alt=""></li>';
                        _this.swiper.appendSlide(li);
                    });

                });
            },

            _getImgData: function(cb){
                var fullUrl = this._options.getImageList + '?uuid=' + this.uuid,
                xhr = new XMLHttpRequest(),
                _this = this;
                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        _this.imgList = res.data.imgList;
                        cb(res.data);
                    }
                };
                xhr.send();
            },

            _getURLParam: function(sParam) {
                var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                    sURLVariables = sPageURL.split('&'),
                    sParameterName,
                    i;

                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split('=');

                    if (sParameterName[0] === sParam) {
                        return sParameterName[1] === undefined ? true : sParameterName[1];
                    }
                }
            },

            _attachEvents: function() {
                this.btn.on('click', $.proxy(this._onClickBtn, this));
                this.downTempBtn.on('click', $.proxy(this._onClickTempBtn, this));
                this.fileEle.on('change', $.proxy(this._onFileChange, this));
                this.list.on('click', $.proxy(this._onListClick, this));
                this.submitBtn.on('click', $.proxy(this._onSubmit, this));
            },

            _onListUp: function(){
                var _this = this, 
                result = { 'data': [] },
                pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", 'i');

                _this.eleStage2.show();
                this.list.empty();

                for (var i = 0; i < this.csvUrl.length; i++) {
                    result.data[i] = { 
                        'no' : i+1, 'url' : this.csvUrl[i]
                    };                            
                }

                $.each(result.data, function(i){
                    var href = this.url;

                    if (!(this.url.indexOf("http://") == 0 || this.url.indexOf("https://") == 0)) {
                        href = "http://"+href;
                    }

                    var tr = $('<tr data-url="' + href + '"><td class="url"><a href="' + href + '" class="alink">' + href + '</a></td><td class="btn"><button class="removeBtn" type="button">-</button></td></tr>');
                    
                    tr.appendTo(_this.list);
                });

                _this.urls.val(_this.csvUrl.join());
            },

            _onSubmit: function(e) {
                e.preventDefault;
                var _this = this;

                this.prefix = this.container.find(this._options.submit.prefix).val() ? this.container.find(this._options.submit.prefix).val() : 'HC';
                _this.stNum = 0;
                console.log(this.prefix);

//              this.imageCont.show();
                _this._getUuid(function(){
                    _this.dimmed.show();
                    _this.container.append('<div class="loading-box" style="display : block;"></div>');
                    if('undefined' != typeof _this.uuid) _this._loopSCAjax(_this.stNum);
                });
                
            },

            _getUuid: function(cb){
                var fullUrl = this._options.getUuid, 
                xhr = new XMLHttpRequest(), 
                _this = this;
                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        _this.uuid = res.data.uuid;
                        cb();
                  }
                };
                xhr.send();
            },

            _loopSCAjax: function(st) {
                if(this.csvUrl.length > st){
                    console.log(this.uuid, this.csvUrl.length, st)
                    var _this = this;

                    var fullUrl = _this._options.getCapturedImg + '?url=' + _this.csvUrl[st] + '&uuid=' + _this.uuid + '&prefix=' + _this.prefix + '&order=' + st;
                    _this.xhr[st] = new XMLHttpRequest();
                    _this.xhr[st].open('GET', fullUrl, true);
                    _this.xhr[st].setRequestHeader('Content-Type', 'application/json');
                    _this.xhr[st].timeout = 10000;
                    _this.xhr[st].onreadystatechange = function() {
                        if (_this.xhr[st].readyState === 4 && _this.xhr[st].status === 200) {
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
                    };

                    setTimeout(function(){
                        _this.xhr[st].send();
                    }, 1000);
                    
                }else if(this.csvUrl.length === st){
                    var url = this._options.destUrl + '?uuid=' + this.uuid;
                    this.dimmed.empty();
                    chrome.tabs.create({"url": url});
                    window.close();
                }
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Extract.init(container);
    });
})(jQuery, window, document);

