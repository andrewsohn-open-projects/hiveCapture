;
(function($, window, document, undefined) {
    'use strict';    

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
                    message: {
                        zipConfirm: {
                            ko: 'Zip 파일 다운로드와 동시에 해당 파일을 서버에서 보관하지 않습니다.\n진행하시겠습니까?', 
                            en: 'As you proceed zip file download, the file from the server will be removed'
                        }
                    },
                    getImageList: 'http://qa.hivelab.co.kr:4000/samsung/scAction/getImageList',
                    getDownloadImg: 'http://qa.hivelab.co.kr:4000/samsung/scAction/getDownloadImg',
                    getDownloadZip: 'http://qa.hivelab.co.kr:4000/samsung/scAction/procZip',
                    getCleaned: 'http://qa.hivelab.co.kr:4000/samsung/scAction/deleteAll'
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

                if(!confirm(_this._options.message.zipConfirm.ko)) return;

                var fullUrl = this._options.getDownloadZip + '?uuid=' + this.uuid,
                xhr = new XMLHttpRequest();
                xhr.open('GET', fullUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.timeout = 10000;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        if(!res.data.status) return;

                        // var downUrl = res.data.zipUrl + '?uuid=' + _this.uuid;
                        // _this.idown.attr('src', downUrl);
                        var downUrl = res.data.zipUrl;
                        
                        chrome.downloads.download({url: downUrl}, function(id) {
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
                        if(!res.data.status) return;

                        //창 닫기
                    }
                };
                xhr.send();
            },

            _onClickImgBtn: function(e){
                e.preventDefault;
                var _this = this, 
                    selImgName = $(this.swiper.slides.eq(this.swiper.activeIndex)[0]).data('img');
                
                $.each(this.imgList, function(){
                    if(this.name === selImgName) _this._getDownloadImg(this);
                });
            },

            _getDownloadImg: function(imageObj){
                var _this = this;
                // var downUrl = this._options.getDownloadImg + '?uuid=' + this.uuid + '&img=' + imageObj.name;
                // this.idown.attr('src', downUrl);

                chrome.downloads.download({url: imageObj.url});
            }
        };
    })();

    $(function() {
        var container = $('body');

        sc.ui.Result.init(container);
    });
})(jQuery, window, document);

