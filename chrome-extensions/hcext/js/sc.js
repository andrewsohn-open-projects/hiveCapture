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

    var _util = sc.ui.Util
    , _config = sc.ui.config;

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
                        btn: '.js-submit-btn'
                    },
                    mobile: {
                        cont: 'set-mscreen',
                        btn: '#check-mscreen',
                        ele: '#screen-unit'
                    },
                    datepicker: {
                        ele: '#datepicker',
                        timeEle: '#timepicker',
                        inpt: 'input[type=text]',
                        dpBtn: '.add-on i',
                        timerBtn: 'input[name=isTimer]',
                        li: 'set-timer'
                    },
                    options: {
                        cont: '.set-option'
                    },
                    serverStatus : {
                        ele: '.server-status',
                        clPrefix: 'st-'
                    },
                    stage: {
                        stage1: '.js-stage-1',
                        stage1Btns: '.btns a',
                        stage2: '.ele-stage-2',
                        backBtn: '.ui-icon-carat-l'
                    },
                    isSamsung: "js-isSamsung",
                    version: ".js-app-version",
                    cl_check: "selected",
                    csvTemplateUrl: _config.api_url + '/data/HC_URL_List_Template.csv',
                    mWidthValue: '360',
                    actionUrl: './extract.html',
                    getTestUrl: _config.api_url
                };

                this._options = $.extend(true, this._defaults, options);

                this.container = container;
                this._assignedHTMLElements();
                this._setAppVersion();
                this._initProperties();
                this._serverCheck();
                this._attachEvents();
            },

            _setAppVersion: function(){
                this.version.text(chrome.runtime.getManifest().version);
            },

            _assignedHTMLElements: function() {
                // Version
                this.version = this.container.find(this._options.version);

                // CSV Element
                this.btn = this.container.find(this._options.csvEle.btn);
                this.downTempBtn = this.container.find(this._options.csvEle.downTempBtn);
                this.fileEle = this.container.find(this._options.csvEle.inpt);
                this.table = this.container.find(this._options.csvEle.table);
                this.list = this.table.find(this._options.csvEle.listCont);

                // set-option
                this.optionCont = this.container.find(this._options.options.cont);
                
                // mobile screen
                this.mobileCont = this.optionCont.find('.'+this._options.mobile.cont);
                this.mobileBtn = this.mobileCont.find(this._options.mobile.btn);
                this.mobileOpt = this.mobileCont.find(this._options.mobile.ele);

                
                // SWIPER
                // this.swiperCont = this.container.find(this._options.swiper.cont);
                // this.slidePrevBtn = this.swiperCont.find(this._options.swiper.arrow.prev);
                // this.slideNextBtn = this.swiperCont.find(this._options.swiper.arrow.next);
                
                // STAGE 1
                // this.stage1Cont = this.swiperCont.find(this._options.stage.stage1);
                // this.stage1Btns = this.stage1Cont.find(this._options.stage.stage1Btns);

                // STAGE 2
                // this.eleStage2 = this.container.find(this._options.stage.stage2);
                // this.backBtn = this.container.find(this._options.stage.backBtn);
                // this.listTmpl = this.container.find(this._options.csvEle.tmpl);
                // this.idown = $('<iframe>', { id: 'idown', src: '' }).hide().appendTo(this.container);

                this.submitBtn = this.container.find(this._options.submit.btn);

                //datepicker
                this.dp = this.container.find(this._options.datepicker.ele);
                this.dpTime = this.container.find(this._options.datepicker.timeEle);
                this.dpInpt = this.dp.find(this._options.datepicker.inpt);
                this.dpBtn = this.dp.find(this._options.datepicker.dpBtn);
                this.dpTimeBtn = this.dpTime.find(this._options.datepicker.dpBtn);

                //timer button
                this.timerBtn = this.container.find(this._options.datepicker.timerBtn);

                //server status
                this.serverStatus = this.container.find(this._options.serverStatus.ele);
                this.serverStatusTx = this.serverStatus.find('em');
            },

            _initProperties: function() {
                var prevDate = new Date(),
                _this = this;

                this.mobileOpt.prop('readonly', true);

                prevDate.setDate(prevDate.getDate());

                this.dp.datetimepicker({
                    format: 'dd/MM/yyyy',
                    language: 'kr',
                    startDate: prevDate,
                    init: function(dp){
                        _this.datepicker = dp;
                    }
                })
                    .on('changeDate', $.proxy(this.datePickerChange, this));

                this.dpTime.datetimepicker({
                    format: ' hh:mm:ss',
                    pickDate: false,
                    pickTime: true,
                    language: 'kr',
                    startDate: prevDate,
                    init: function(dp){
                        _this.timepicker = dp;
                    }
                })
                    .on('changeDate', $.proxy(this.timePickerChange, this));

                if('undefined' !== typeof this.datepicker) this.datepicker.disable();
                if('undefined' !== typeof this.timepicker) this.timepicker.disable();
                this.dpBtn.css({'cursor':'not-allowed'});
                this.dpTimeBtn.css({'cursor':'not-allowed'});

                this.xhr = [];
                this.isMobile = false;
            },

            _attachEvents: function() {
                // this.stage1Btns.on('click', $.proxy(this._onClickSt1Btn, this));
                this.btn.on('click', $.proxy(this._onClickBtn, this));
                this.downTempBtn.on('click', $.proxy(this._onClickTempBtn, this));

                this.fileEle.on('change', $.proxy(this._onFileChange, this));
                
                this.mobileBtn.on('change', $.proxy(this._onMobileBtnChange, this));
                this.timerBtn.on('change', $.proxy(this.timerChange, this));
                // this.optionLi.on('change', $.proxy(this._onOptionChange, this));

                this.submitBtn.on('click', $.proxy(this._onSubmit, this));
            },

            datePickerChange: function(e){
                this.timerDate = e.localDate;
                $(e.currentTarget).datetimepicker('hide');
                this.timepicker.component.trigger('click');
                // .datetimepicker('show');
            },

            timePickerChange: function(e){
                this.timerDate.setHours(e.localDate.getHours())
                this.timerDate.setMinutes(e.localDate.getMinutes())
                this.timerDate.setSeconds(e.localDate.getSeconds());
            },

            _onClickTempBtn: function(e){
                e.preventDefault();
                var _this = this;
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
                        _this.url = _this._options.actionUrl;

                        var csvval_arr = _this.csvval.join();

                        if(!csvval_arr.length) {
                            alert(chrome.i18n.getMessage('emptyFile'));
                            return false;
                        }


                        _this.csvUrls = csvval_arr;
                        
                        _this.isFileAttached = true;
                    };
                    reader.readAsText(e.target.files.item(0));
                }

                return false;
            },

            _onClickBtn: function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                this.fileEle.trigger('click');
            },

            _onSubmit: function(e) {
                e.preventDefault();
                var target = $(e.currentTarget)
                , _this = this;

                if('undefined' === typeof _this.isFileAttached){
                    alert(chrome.i18n.getMessage('fileNotAttached'));
                    return false;
                }

                // Extra Setting Values
                
                chrome.storage.sync.set({'csvUrl':_this.csvUrls}, function() {
                    console.log('CSV Saved');
                });
                localStorage.clear();
                localStorage['csvUrl'] = _this.csvUrls;
                localStorage['isMobile'] = 0;
                localStorage['isTimer'] = 0;

                // 모바일 캡처 설정
                if(_this.mobileBtn.is(':checked')){
                    localStorage['isMobile'] = 1;
                    if('' !== _this.mobileOpt.val()) localStorage['mobileWidth'] = _this.mobileOpt.val();
                }

                // 타이머 모드 설정
                if(_this.timerBtn.is(':checked')){
                    localStorage['isTimer'] = 1;

                    if('undefined' === typeof _this.timerDate){
                        alert(chrome.i18n.getMessage('timerTimeNotSet'));
                        this.dpBtn.trigger('click');
                        return false;
                    }

                    localStorage['timerDate'] = _this.timerDate;
                }

                // chrome.windows.create({
                //     'url': _this.url, 'type': 'popup', 'width': _util.winWidth() + 35, 'height': _util.winHeight() + 40
                // }, function(win){
                //    window.close(); 
                // });
                chrome.management.launchApp(_config.app_id, function(){
                    console.log('opened!');
                });
            },

            timerChange: function(e) {
                var li = $(e.currentTarget).parents('li.'+this._options.datepicker.li);
                
                if(e.target.checked){
                    //체크 true
                    //enable input 
                    this.isTimer = true;
                    this.dpBtn.css({'cursor':'pointer'});
                    this.dpTimeBtn.css({'cursor':'pointer'});
                    this.datepicker.enable();
                    this.timepicker.enable();

                    if(!li.hasClass(this._options.cl_check)) li.addClass(this._options.cl_check);
                }else{
                    //체크 false
                    //disable input 
                    if(this.dpInpt.val().length) this.dpInpt.val('');

                    this.isTimer = false;
                    this.dpBtn.css({'cursor':'not-allowed'});
                    this.dpTimeBtn.css({'cursor':'not-allowed'});
                    this.datepicker.disable();
                    this.timepicker.disable();

                    if(li.hasClass(this._options.cl_check)) li.removeClass(this._options.cl_check);
                }
            },

            _onMobileBtnChange: function(e) {
                var li = $(e.currentTarget).parents('li.'+this._options.mobile.cont);

                if(e.target.checked){
                    this.mobileOpt.prop('readonly', false);
                    if(!li.hasClass(this._options.cl_check)) li.addClass(this._options.cl_check);
                }else{
                    this.mobileOpt.prop('readonly', true);
                    if(this.mobileOpt.val().length) this.mobileOpt.val(this._options.mWidthValue);
                    if(li.hasClass(this._options.cl_check)) li.removeClass(this._options.cl_check);
                }
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
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Entry.init(container);
    });
})(jQuery, window, document);