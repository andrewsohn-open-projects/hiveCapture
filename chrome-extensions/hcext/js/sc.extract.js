/**
 * This file is part of the hiveCapture.
 * Requires jQuery 1.12.0
 *
 * https://github.com/hivelab-open-projects/hiveCapture
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

    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;

        while (L && this.length) {
            what = a[--L];
            what = what.trim();
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    window.sc.ui.Extract = (function() {
        return {
            init: function(container, options) {
                this._defaults = {
                    csvEle: {
                        listCont: '.js-csvListCont',
                        list: '.js-csvList',
                        num: '.js-listCount',
                        tmpl: '.csvListTmpl'
                    },
                    submit: {
                        urls: 'input[name=urls]', 
                        prefix: 'input[name=prefix]', 
                        btn: '.btn_capture'
                    },
                    dimmed: {
                        cont: '.dimmed'
                    },
                    stage: {
                        stage1: '.ele-stage-1',
                        stage2: '.ele-stage-2',
                    },
                    timer: {
                        ele: '#timer'
                    },
                    serverStatus : {
                        ele: '.server-status',
                        clPrefix: 'st-',
                        version: ".js-app-version"
                    },
                    destUrl: './result.html', 
                    getCapturedImg: _config.api_url + '/api/capture',
                    getUuid: _config.api_url + '/uuid',
                    csvTemplateUrl: _config.api_url + '/data/HC_URL_List_Template.csv',
                    getTestUrl: _config.api_url,
                    actionUrl: './extract.html',
                    defaultPrefix: _config.file_prefix
                };

                this._options = $.extend(true, this._defaults, options);

                this.container = container;

                this._initProperties();
                this._assignedHTMLElements();
                this._serverCheck();
                this._attachEvents();
                this._onListUp();
            },

            _initProperties: function(){
                this.xhr = [];
                this.pwSwitch = false;
                this.isTimer = (parseInt(localStorage['isTimer'], 10) === 1)? true:false;
                this.isMobile = localStorage['isMobile'];
                if('undefined' !== typeof localStorage['mobileWidth']) this.mobileWidth = localStorage['mobileWidth'];
                this.csvUrl = localStorage['csvUrl'].split(',');
            },

            _assignedHTMLElements: function() {
                // CSV Element
                this.listCont = this.container.find(this._options.csvEle.listCont);
                this.list = this.listCont.find(this._options.csvEle.list);
                this.numEle = this.listCont.find(this._options.csvEle.num);
                this.eleStage1 = this.container.find(this._options.stage.stage1);
                this.eleStage2 = this.container.find(this._options.stage.stage2);
                
                //Timer
                this.timerEle = this.eleStage2.find(this._options.timer.ele);

                this.dimmed = this.container.find(this._options.dimmed.cont);
                this.urls = this.container.find(this._options.submit.urls);
                this.submitBtn = this.container.find(this._options.submit.btn);

                //server status
                this.serverStatus = this.container.find(this._options.serverStatus.ele);
                this.serverStatusTx = this.serverStatus.find('em');
                this.version = this.container.find(this._options.serverStatus.version);
            },

            _serverCheck: function() {
                // Version
                this.version.text(chrome.runtime.getManifest().version);

                var fullUrl = this._options.getTestUrl,
                xhr = new XMLHttpRequest(),
                _this = this;
                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 2000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        if("string" === typeof res.msg){
                            _this.pwSwitch = true;
                            if(_this.serverStatus.hasClass(_this._options.serverStatus.clPrefix + 'off')) _this.serverStatus.removeClass(_this._options.serverStatus.clPrefix + 'off');
                            _this.serverStatus.addClass(_this._options.serverStatus.clPrefix + 'on')
                            _this.serverStatusTx.text('on');
                        }else{
                            _this.serverStatus.addClass(_this._options.serverStatus.clPrefix + 'off');
                            _this.serverStatusTx.text('on');
                        }
                    }else{
                        _this.serverStatus.addClass(_this._options.serverStatus.clPrefix + 'off');
                        _this.serverStatusTx.text('on');
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
                this.list.on('click', $.proxy(this._onListClick, this));
                this.submitBtn.on('click', $.proxy(this._onSubmit, this));
            },

            _onListClick: function(e){
                e.preventDefault();
                var target = $(e.target)
                , li = target.parents('li')
                , url = li.data('url');

                this.csvUrl = this.urls.val().split(',');

                this.csvUrl.remove(url);
                this.urls.val(this.csvUrl.join());
                this.numEle.text(this.csvUrl.length);
                li.remove();
            },

            _timerEnable: function(){
                var _this = this;
                this.timer = setInterval(function(){
                    var nowDate = new Date();
                    
                    if(_this.timerDate.getTime() <= nowDate.getTime()){
                        //캡처 작동
                        _this._timerSubmit();
                        clearInterval(_this.timer);
                    }else{
                        var time = Math.floor((_this.timerDate.getTime() - nowDate.getTime()) / 1000);
                    
                        var days = Math.floor(time / 86400);
                        var hours   = Math.floor((time - (days * 86400)) / 3600);
                        var minutes = Math.floor(((time - (days * 86400)) - (hours * 3600)) / 60);
                        var seconds = ((time - (days * 86400)) - (hours * 3600)) - (minutes * 60);

                        if (days   < 10) {days   = "0"+days;}
                        if (hours   < 10) {hours   = "0"+hours;}
                        if (minutes < 10) {minutes = "0"+minutes;}
                        if (seconds < 10) {seconds = "0"+seconds;}

                        var txt = days + ':' + hours + ':' + minutes + ':' + seconds;
                        
                        if(_this.timerEle.text() === '') {
                            _this.timerEle.attr('datetime', _this.timerDate);
                            _this.timerEle.prop('datetime', _this.timerDate);
                        }

                        _this.timerEle.text(txt);
                        
                        _this.timer;
                    }
                    
                }, 1000);
            },

            _setDisplayByMode: function(){
                if(this.isTimer){
                    // 타이머 모드
                    this.timerDate = new Date(localStorage['timerDate']);
                    this.eleStage2.show();
                    this._timerEnable();
                }else{
                    // 일반 모드
                    this.eleStage1.show();
                }
            },

            _onListUp: function(){
                var _this = this, 
                result = { 'data': [] },
                pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", 'i');

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

                    var li = $('<li data-url="' + href + '"><button type="button" class="btn-circle btn-del">Delete url</button><span class="url">' + href + '</span><td class="url"></li>');
                    
                    li.appendTo(_this.list);
                });

                _this.urls.val(_this.csvUrl.join());
                _this.numEle.text(result.data.length);

                //일반, 타이머 모드별 디스플레이
                _this._setDisplayByMode();
            },

            _timerSubmit: function() {
                var _this = this;

                if(_this.csvUrl.length < 1) {
                    alert(chrome.i18n.getMessage('outOfCsvUrl'));
                    window.close();
                    return;
                }

                this.prefix = this.container.find(this._options.submit.prefix).val() ? this.container.find(this._options.submit.prefix).val() : 'HC';
                _this.stNum = 0;
                
                _this._getUuid(function(){
                    _this.dimmed.show();
                    _this.container.append('<div class="loading-box" style="display : block;"></div>');
                    if('undefined' != typeof _this.uuid) _this._loopSCAjax(_this.stNum);
                });
            },

            _onSubmit: function(e) {
                e.preventDefault;
                
                if(this.csvUrl.length < 1) {
                    alert(chrome.i18n.getMessage('outOfCsvUrl'));
                    window.close();
                    return;
                }

                var _this = this;

                this.prefix = this.container.find(this._options.submit.prefix).val() ? this.container.find(this._options.submit.prefix).val() : 'HC';
                _this.stNum = 0;

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
                        _this.uuid = res.uuid;
                        cb();
                  }
                };
                xhr.send();
            },

            _loopSCAjax: function(st) {
                if(this.csvUrl.length > st){
                    console.log(this.uuid, this.csvUrl.length, st)
                    var _this = this;

                    var fullUrl = _this._options.getCapturedImg + '?url=' + encodeURIComponent(_this.csvUrl[st]) + '&uuid=' + _this.uuid + '&prefix=' + _this.prefix + '&order=' + st;
                    if(_this.isMobile) {
                        fullUrl += '&isMobile=' + _this.isMobile;
                        if(_this.mobileWidth) fullUrl += '&mobileWidth=' + _this.mobileWidth;
                    }
                    
                    chrome.cookies.get({"url": "http://preview4.samsung.com", "name": "IW_AUTHENTICATION.P4" }, function(cookie) {
                        if("undefined" !== typeof cookie && "undefined" !== typeof cookie.value) fullUrl += '&ssCookieName=IW_AUTHENTICATION.P4&ssCookieValue=' + cookie.value;
                    });

                    console.log(fullUrl);
                    _this.xhr[st] = new XMLHttpRequest();
                    _this.xhr[st].open('GET', fullUrl, true);
                    _this.xhr[st].setRequestHeader('Content-Type', 'application/json');
                    _this.xhr[st].timeout = 30000;
                    _this.xhr[st].onreadystatechange = function() {
                        if (_this.xhr[st].readyState === 4 ) {
                            if(_this.xhr[st].status === 200){
                                var res = JSON.parse(_this.xhr[st].responseText);
                            
                                setTimeout(function(){
                                    _this.list.find('tr').eq(st).addClass('sc-success');
                                    _this.stNum ++;
                                    _this._loopSCAjax(_this.stNum);
                                }, 1000);
                            }else{
                                if(_this.xhr[st].status === 404){
                                    if(st === 0){
                                        alert(chrome.i18n.getMessage('firstInvalid'));
                                    }else{
                                        var nth = st+1;
                                        alert(chrome.i18n.getMessage('erorrRedirect', [nth]));
                                        var url = this._options.destUrl + '?uuid=' + this.uuid;
                                        this.dimmed.empty();
                                        chrome.tabs.create({"url": url});
                                    }
                                    window.close();
                                }
                                _this.list.find('tr').eq(st).addClass('sc-fail');
                            }
                            
                        }else{
                            
                        }
                    };

                    _this.xhr[st].ontimeout = function (e) {
                        var nth = st+1;
                        alert(chrome.i18n.getMessage('timeout', [nth]));
                        window.close();
                        return false;
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

