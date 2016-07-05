// namespace
var sc = sc || {};
sc.ui = sc.ui || {};

// 공통 config
sc.ui.config = {
    mobileSize: 768,
    slickOptions: {
        dots: true,
        arrows: false
    }
};

sc.ui.Util = {
	winWidth : function() {
		return window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
	},
	winHeight : function() {
		return window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
	},
	isArray : function(arr) {
		return 'array' === $.type(arr);
	}
};