;
(function($, window, document, undefined) {
    'use strict';    

    singapore.ui.Pagination = (function() {
        return {
            init: function(container) {
                if (!(this._container = $(container)).size()) return;
                // this._container = container;

                this._assignedHTMLElements();
                this._attachEvents();
            },
            _assignedHTMLElements: function() {
                this._disabledButton = this._container.find('.disabled');
            },
            _attachEvents: function() {
                this._disabledButton.on('click', $.proxy(this._onClickDisabledButton, this));
            },
            _onClickDisabledButton: function(e) {
                e.preventDefault();
                return false;
            }
        };
    })();

    $(function() {
        singapore.ui.Pagination.init('.pagination');
    });
})(jQuery, window, document);
