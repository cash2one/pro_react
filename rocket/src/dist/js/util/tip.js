'use strict';

define([paths.rcn.lib + '/bootstrap.min.js'], function () {
	var id = 0;
	function tip(txt, handler) {
		var modalId = id;
		var temp = '\n\t\t\t<div class="modal fade" id=\'_tipmodal-' + modalId + '\' style="z-index: 20000;">\n\t\t\t\t<div class="modal-dialog modal-sm">\n\t\t\t\t\t<div class="modal-content">\n\t\t\t\t\t\t<div class="pl22 pr22 pt15 pb15">\n\t\t\t\t\t\t\t<h4 class="modal-title">' + txt + '</h4>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\'modal-footer\'>\n\t\t\t\t\t\t\t<button type="button" class="btn btn-primary btn-lg" data-dismiss="modal">确认</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t';

		temp = $(temp);
		temp.appendTo('body').modal({
			backdrop: false,
			show: true
		});
		$(document).one('hide.bs.modal', '#_tipmodal-' + modalId, function () {
			handler && handler();
		});
		$(document).one('hidden.bs.modal', '#_tipmodal-' + modalId, function () {
			$(this).remove();
			temp = null;
		});
		id++;
	}

	return tip;
});