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

    window.sc.ui.Result = (function() {
        return {
            init: function(container, options) {
                this._defaults = {
                    imageList: {
                        inpt: 'input[name=csv]', 
                        table: '.csv_table', 
                        listCont: '.csvList', 
                        tmpl: '.csvListTmpl'
                    },
                    submit: {
                        wrap: '.ctrl_wrap', 
                        zipDownBtn: '.btn_zip', 
                        imgDownBtn: '.btn_each'
                    },
                    getImageList: _config.api_url + '/api/images',
                    getDownloadImg: _config.api_url + '/download/image',
                    getZip: _config.api_url + '/api/proczip',
                    getCleaned: _config.api_url + '/download/delete'
                };

                this._options = $.extend(true, this._defaults, options);

                this.container = container;

                this._initProperties();
                this._sigletone();
                this._assignedHTMLElements();
                this._initImgData();
                this._attachEvents();
            },

            _initProperties: function(){
                this.uuid = this._getURLParam('uuid');
                // this.idown = $('<iframe>', { id: 'idown', src: '' }).hide().appendTo(this.container);
            },

            _assignedHTMLElements: function() {
                this.zipDownBtn = this.container.find(this._options.submit.zipDownBtn);
                this.imgDownBtn = this.container.find(this._options.submit.imgDownBtn);
            },

            _initImgData: function() {
                this.xhr = [];
                var _this = this;

                this._getImgData(function(data){
                    $.each(data.imgList, function(i, v){
                        var url = _config.api_url + '/upload/' + _this.uuid + '/' + v;
                        var li = '<li class="swiper-slide" data-no="' + i + 
                            '" data-img="' + v + '"><img src="' + url + '" alt=""></li>';
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
                        _this.imgList = res.imgList;
                        cb(res);
                    }
                };
                xhr.send();
            },

            _sigletone: function() {
                var _this = this;

                (function() {
                    $('.swiper-container').swiper({
                        mode: 'horizontal',
                        watchActiveIndex: true,
                        loop: false,
                        slidesPerView: 1,
                        pagination: '.swiper-pagination',
                        nextButton: '.swiper-button-next',
                        prevButton: '.swiper-button-prev',
                        onInit: function(swiper) {
                            _this.swiper = swiper;
                        }
                    });
                })();

                return _this.swiper;
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

            _attachEvents: function(){
                this.zipDownBtn.on('click', $.proxy(this._onClickZipBtn, this));
                this.imgDownBtn.on('click', $.proxy(this._onClickImgBtn, this));
            },

            _onClickZipBtn: function(e){
                e.preventDefault;
                var ct = $(e.currentTarget),
                _this = this;

                if(!confirm(chrome.i18n.getMessage('zipConfirm'))) return;

                var fullUrl = this._options.getZip + '?uuid=' + this.uuid,
                xhr = new XMLHttpRequest();
                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        if(!res.status) return;

                        // var downUrl = res.data.zipUrl + '?uuid=' + _this.uuid;
                        // _this.idown.attr('src', downUrl);
                        var downUrl = _config.api_url + '/download/zip?uuid=' + _this.uuid;
                        
                        // chrome.downloads.download({url: downUrl}, function(id) {
                            // _this._cleanUpServerFiles();
                            // ct.attr('disabled',true);
                            // _this.imgDownBtn.attr('disabled',true);
                        // });
                        chrome.tabs.update({
                            url: downUrl
                        },function(tab){
                            _this._cleanUpServerFiles();
                            ct.attr('disabled',true);
                            _this.imgDownBtn.attr('disabled',true);
                        });
                    }
                };
                xhr.send();
            },

            _cleanUpServerFiles: function(e){
                var fullUrl = this._options.getCleaned + '?uuid=' + this.uuid,
                xhr = new XMLHttpRequest(),
                _this = this;

                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        if(!res.status) return;

                        //창 닫기
                    }
                };

                setTimeout(function(){
                    xhr.send();
                }, 1000);
            },

            _onClickImgBtn: function(e){
                e.preventDefault;
                var _this = this, 
                    selImgName = $(this.swiper.slides.eq(this.swiper.activeIndex)[0]).data('img');
                
                $.each(this.imgList, function(i,v){
                    if(v === selImgName){
                        _this._getDownloadImg(this);
                    }
                });
            },

            _getDownloadImg: function(imageName){
                var _this = this;
                var url = _config.api_url + '/upload/' + _this.uuid + '/' + imageName;
                chrome.downloads.download({url: url});
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Result.init(container);
    });
})(jQuery, window, document);

