;(function($){
	'use strict';

	// 페이지당 한번씩 로드되는 객체
	// 객체명은 명수, 메서드명은 동사부터 
	singapore.ui.pagetitle.PageObjectName = (function(){
		return {
			// 글로벌 초기화 함수
			init: function(container){
				this._container = container; // 영역 제한을 위한 컨테이너, 필요에 따라 사용.

				// 기본 세가지 메서드
				this._assignedHTMLElements();
				this._initProperties();
				this._attachEvents();
			},

			// config 파일 사용 예시, 해상도 분기 사이즈 지정 
			checkSwiper: function(){
				return this._cachedScreenWidth < singapore.ui.config.mobileSize;
			},

			// 속성 초기화
			_initProperties: function(){
				this._count = 0; // 단수
				this._counts = 0; // 복수 

				this._swiperobj = null; // 오브젝트 초기화
				this._initData = {}; // 객체리터럴 
				this._bMobile = false; // boolean
			},

			// HTML 요소 할당
			_assignedHTMLElements: function(){
				var container = this._container;

				// container 기준으로 영역 안에 요소를 찾아서 할당
				this._swiper = container.find('.swiper-container');
			},

			// 이벤트 ATTACH
			_attachEvents: function(){
				// 모든 이벤트 핸들러는 $.proxy 로 실행문맥 변경하여 사용, 이벤트 핸들러는 on + 이벤트명으로 지정
				$(window).on('resize', $.proxy(this._onResize, this));
			},

			// 이벤트 ATTACH
			_detachEvents: function(){
				$(window).off('resize', $.proxy(this._onResize, this));
			},

			_onResize: function(e){
				// 두번이상 참조하는 속성은 지역변수로 지정하여 사용
				var target = e.target; // native 
				var $target = $(e.target); // jQuery wrapping
			}
		};
	})();

	//실제 실행
	$(function(){
		singapore.ui.pagetitle.PageObjectName.int(containerElement);
	});


	// 함수
	function name(){
		// todo
	}

	// 함수실행
	name();

	// 즉시실행함수
	(function(){
		// todo
	})();

	// 즉시실행함수에 접근하기 위한 namespace 지정
	var namespace = (function(){
		// todo
	})();


})(jQuery);
