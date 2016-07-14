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

 /**
 * Brazilian translation for bootstrap-datetimepicker
 * Cauan Cabral <cauan@radig.com.br>
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
                        form: 'form[name=sForm]', 
                        urls: 'input[name=urls]', 
                        btn: '.btn_capture'
                    },
                    dimmed: {
                        cont: '.dimmed'
                    },
                    datepicker: {
                        ele: '#datetimepicker',
                        inpt: 'input[type=text]',
                        dpBtn: '.add-on',
                        timerBtn: '#isTimer'
                    },
                    stage: {
                        stage1: '.ele-stage-1',
                        stage2: '.ele-stage-2',
                        backBtn: '.ui-icon-carat-l'
                    },
                    destUrl: './result.html', 
                    getCapturedImg: _config.api_url + '/scAction/chromeEx',
                    getUuid: _config.api_url + '/scAction/getUuid',
                    csvTemplateUrl: _config.api_url + '/assets/data/HC_URL_List_Template.csv',
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
                this.isTimer = false;
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
                // console.log(this.urls)
                this.submitBtn = this.container.find(this._options.submit.btn);

                //datepicker
                this.dp = this.container.find(this._options.datepicker.ele);
                this.dpInpt = this.dp.find(this._options.datepicker.inpt);
                this.dpBtn = this.dp.find(this._options.datepicker.dpBtn);

                //timer button
                this.timerBtn = this.container.find(this._options.datepicker.timerBtn);
            },

            _attachEvents: function() {
                this.btn.on('click', $.proxy(this._onClickBtn, this));
                this.downTempBtn.on('click', $.proxy(this._onClickTempBtn, this));
                this.fileEle.on('change', $.proxy(this._onFileChange, this));
                this.timerBtn.on('change', $.proxy(this.timerChange, this));

                var prevDate = new Date();
                prevDate.setDate(prevDate.getDate()-1);

                this.dp.datetimepicker({
                    format: 'dd/MM/yyyy hh:mm:ss',
                    language: 'kr',
                    startDate: prevDate
                }).on('changeDate', $.proxy(this.datePickerChange, this));
            },

            datePickerChange: function(e){
                this.timerDate = e.localDate;
                // console.log(e.currentTarget);
                // $(e.currentTarget).datetimepicker('hide');
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
                        var url = _this._options.actionUrl;

                        localStorage['csvUrl'] = _this.csvval.join();
                        localStorage['isTimer'] = 0;
                        // 타이머 모드 설정
                        if(_this.isTimer){
                            localStorage['isTimer'] = 1;
                            if('undefined' !== typeof _this.timerDate) localStorage['timerDate'] = _this.timerDate;
                        }
                        
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

            _onClickBtn: function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                this.fileEle.trigger('click');
            },

            timerChange: function(e) {
                if(e.target.checked){
                    //체크 true
                    //enable input 
                    this.dpInpt.prop('disabled', false);

                    //enable button
                    this.dpBtn.show();
                    this.isTimer = true;
                }else{
                    //체크 false
                    //disable input 
                    this.dpInpt.prop('disabled', true);
                    if(this.dpInpt.val().length) this.dpInpt.val('');

                    //disable button
                    this.dpBtn.hide();
                    this.isTimer = false;
                }
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Entry.init(container);
    });
})(jQuery, window, document);

