;
(function($, window, document, undefined) {
    'use strict';

    sc.ui.Intro = (function() {
        return {
            init: function(container, options) {
                this._defaults = {
                    introSlickoOptions: {
                        dots: true,
                        arrows: false,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        speed: 2000,
                        fade: true                       
                    }
                };

                this._options = $.extend(true, this._defaults, options);

                this._container = container;
                this._assignedHTMLElements();
                this._initProperties();
                this._attachEvents();

                if (this._checkSlick()) {
                    this._bMobile = true;

                    this.activateSlick();
                } else {
                    this._prepareVideo();
                }
            },

            _initProperties: function() {
                this._cachedScreenWidth = sc.ui.Util.winWidth();

                this._bIntroSlick = false;
                this._bBannerSlick = false;

                this._videoLoadCount = 0;
                this._bMobile = false;
                this._cachedVideoSrcs = [];
                this._bCompleteLoadVideos = false;
            },

            _assignedHTMLElements: function() {
                this._introSlick = $('._intro_slick');
                this._bannerSlick = $('._banner_slick');

                this._introItems = this._introSlick.find('._intro_item');
                this._videos = this._introSlick.find('._video');
                this._video_bgs = this._introSlick.find('._video_bg');
                this._loading = this._container.find('._intro_loading');

            },

            _attachEvents: function() {
                $(window).on('resize', $.proxy(this._onResize, this));

                if(this._checkSupportVideo()) {
                    this._introItems.on('mouseover', $.proxy(this._onMouseover, this));
                    this._introItems.on('mouseout', $.proxy(this._onMouseout, this));                
                    this._videos.on('canplay canplaythrough', $.proxy(this._onCanplayThrough, this));
                }
            },

            _onCanplayThrough: function(e){
                var target = e.target;
                var videoTagLen = this._videos.length;

                    this._videoLoadCount++;

                if (!this._bMobile) {
                    $(target).show();
                    $(target).next().hide();
                }

                if (this._videoLoadCount === videoTagLen) {
                    this._bCompleteLoadVideos = true;

                    if (!this._bMobile) {
                        this._loading.hide();
                    }
                }
            },

            _onLoadVideoData: function(e) {
                var target = e.target;
                var videoTagLen = this._videos.length;

                if (target.readyState === 4) {
                    this._videoLoadCount++;

                    if (!this._bMobile) {
                        $(target).show();
                        $(target).next().hide();
                    }
                }

                if (this._videoLoadCount === videoTagLen) {
                    this._bCompleteLoadVideos = true;

                    if (!this._bMobile) {
                        this._loading.hide();
                    }
                }
            },

            _onResize: function() {
                var cachedScreenWidth = this._cachedScreenWidth,
                    newScreenWidth = sc.ui.Util.winWidth();

                // 모바일에서 스크롤시에도 resizing 발생하는 이슈 대응
                if (newScreenWidth !== cachedScreenWidth) {
                    this._cachedScreenWidth = newScreenWidth;

                    if (this._checkSlick()) {
                        this._bMobile = true;

                        this.activateSlick();

                        this._videos.hide();
                        this._video_bgs.show();

                    } else {
                        this._bMobile = false;

                        this.deactivateSlick();

                        if (this._bCompleteLoadVideos) {
                            this._videos.show();
                            this._video_bgs.hide();
                        }
                    }
                }
            },

            _onMouseover: function(e) {
                var video = $(e.currentTarget).find('._video')[0];

                video.play();
            },

            _onMouseout: function(e) {
                var video = $(e.currentTarget).find('._video')[0];

                video.pause();
            },

            _prepareVideo: function() {
                if(this._checkSupportVideo()) {
                    this._loading.show();
                }

                this._video_bgs.show();
            },

            _checkSupportVideo: function(){
                return $('video')[0].addEventListener;
            },

            _checkSlick: function() {
                return this._cachedScreenWidth < sc.ui.config.mobileSize;
            },

            activateSlick: function() {
                if (this._bIntroSlick || this._bBannerSlick) {
                    return;
                }

                this.createSlick();
            },

            deactivateSlick: function() {
                if (this._bIntroSlick) {
                    this._introSlick.slick('unslick');
                    this._bIntroSlick = false;
                }

                if (this._bBannerSlick) {
                    this._bannerSlick.slick('unslick');
                    this._bBannerSlick = false;
                }
            },

            createSlick: function() {
                if (this._introSlick) {
                    this._introSlick.slick(this._options.introSlickoOptions);
                    this._bIntroSlick = true;
                }

                if (this._bannerSlick) {
                    this._bannerSlick.slick(sc.ui.config.slickOptions);
                    this._bBannerSlick = true;
                }
            }
        };
    })();

})(jQuery, window, document);
