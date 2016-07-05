;(function($, window){
	'use strict';

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * 유틸리티
	 */
	var _ = {
		isArray : function(arr) {
			return 'array' === $.type(arr);
		},
		def : function(org, src) {
			for (var prop in src) {
				if (!hasOwnProperty.call(src, prop)) continue;
				if ('object' === $.type(org[prop])) {
					org[prop] = (this.isArray(org[prop]) ? src[prop].slice(0) : this.def(org[prop], src[prop]));
				} else {
					org[prop] = src[prop];
				}
			}

			return org;
		}
	};

	if ('undefined' === typeof sc.Form) sc.Form = {};
	sc.Form.Csrf = (function() {
		var defParams = { trg : 'form', csrf : { name : '' } };
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));

				this.frm = this.container.find(this.opts.trg);
				this.csrf = this.frm.find('[name="' + this.opts.csrf.name + '"]');				
				this.container.on('getCsrf', $.proxy(this.get, this));
				this.container.on('changeCsrf', $.proxy(this.update, this));
			},
			get : function() {
				return { name : this.opts.csrf.name, value : this.csrf.val() };
			},
			update : function(e, csrfHash) {
				this.csrf.val(csrfHash);
			}
		};
	})();

})(jQuery, window);


