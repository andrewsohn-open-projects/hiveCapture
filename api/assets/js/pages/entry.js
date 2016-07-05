;
(function($, window, document, undefined) {
    'use strict';

    sc.ui.Entry = (function() {
        return {
            init: function(container, options) {
                this._defaults = {
                    csvEle : {
                        btn : '#csvInsrtBtn'
                        , inpt : 'input[name=csv]'
                        , table : '.csv_table'
                        , listCont : '.csvList'
                        , tmpl : '.csvListTmpl'
                    },
                    submit : {
                        form : 'form[name=sForm]'
                        , urls : 'input[name=urls]'
                        , submitBtn : '.btn_submit'
                    },
                    image : {
                    	cont : '.img_cont'
                    }
                };

                this._options = $.extend(true, this._defaults, options);
                
                this.container = container;
                this._assignedHTMLElements();
                this._initProperties();
                this._attachEvents();
            },

            _initProperties: function() {
                
            },

            _assignedHTMLElements: function() {
                // CSV Element
                this.btn = this.container.find(this._options.csvEle.btn);
                this.fileEle = this.container.find(this._options.csvEle.inpt);
                this.table = this.container.find(this._options.csvEle.table);
                this.list = this.table.find(this._options.csvEle.listCont);
                this.listTmpl = this.container.find(this._options.csvEle.tmpl);

                // Form
                this.form = this.container.find(this._options.submit.form);
                this.urls = this.form.find(this._options.submit.urls);
                this.submitBtn = this.form.find(this._options.submit.submitBtn);
                
                // Image
                this.imageCont = this.container.find(this._options.image.cont);
                console.log(this.btn, this.fileEle, this.list, this.listTmpl);
            },

            _attachEvents: function() {
                this.btn.on('click', $.proxy(this._onClickBtn, this));
                this.fileEle.on('change', $.proxy(this._onFileChange, this));
                this.list.on('click', $.proxy(this._onListClick, this));
                this.form.submit(function(e) { e.preventDefault(); });
                this.submitBtn.on('click', $.proxy(this._onSubmit, this));
            },

            _onFileChange: function(e){
                var trg = $(e.currentTarget)
                , ext = trg.val().split(".").pop().toLowerCase();

                if($.inArray(ext, ["csv"]) == -1) {
                    alert('Upload CSV');
                    return false;
                }
                    
                if (e.target.files != undefined) {
                    var _this = this
                    , reader = new FileReader();

                    reader.onload = function(e) {
                        var csvval = e.target.result.split("\n")
                        , inputrad = ""
                        , result = { 'data' : [] };

                        var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");

                        for (var i = 0; i < csvval.length; i++) {
                            if (csvval[i] == "" || 'undefined' == typeof csvval[i] || !pattern.test(csvval[i])) {
                              csvval.splice(i, 1);
                              i--;
                            }

                            result.data[i] = { 
                                'no' : i+1
                                , 'url' : csvval[i]
                            };
                        }

                        _this.csvval = csvval;
                        _this.urls.val(_this.csvval.join());

                        _this.table.show();
                        _this.form.show();
                        
                        _this.list.empty();
                        _this.listTmpl.tmpl(result).appendTo(_this.list);

                        // $("#csvimporthint").html(inputrad);
                        // $("#csvimporthinttitle").show();
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

            _onListClick: function(e) {
                var trg = $(e.target);
                if(!trg.hasClass('removeBtn')) return;

                var tr = trg.parents('tr').eq(0)
                , removeBtns = this.list.find('.removeBtn')
                , idx = removeBtns.index(trg);

                this.csvval.splice(idx, 1);
                this.urls.val(this.csvval.join());
                tr.remove();
            },
            
            _onSubmit: function(e) {
            	var ct = $(e.currentTarget);
            	
            	this.csvval = ct.parents('form').eq(0).find(this._options.submit.urls).val().split(",");
            	
            	this.stNum = 0;
            	
//            	this.imageCont.show();
            	this._loopAjax(this.stNum);
            	
            },
            
            _loopAjax: function(st) {
            	
            		
	    		var _this = this
	    		, json = { url : _this.csvval[st] }, te = $.Event('getCsrf');
	    		_this.container.trigger(te);
				json[te.result.name] = te.result.value;
				
				$.ajax({
					url: _this._options.getCapturedImg,
					type: 'GET',
					cache: false,
					dataType: 'json',
					data: json
				})
				.done(function(result) {
					if (!result) return;
					
					console.log(st, result)
					if(_this.csvval.length > st+1){
						_this.stNum ++;
						_this._loopAjax(_this.stNum);
					}
				});
				
	
			
//				setTimeout(function(){
//					console.log(st, _this.csvval[st])
//					if(_this.csvval.length > st+1){
//						_this.stNum ++;
//						_this._loopAjax(_this.stNum);
//					}
//				}, 5000);
    			
            	
            }
        };
    })();

})(jQuery, window, document);
