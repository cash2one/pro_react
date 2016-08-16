define([paths.rcn.lib + '/bootstrap.min.js'], function(){
	var id = 0;
	function tip(txt, handler){
		var modalId = id;
		var temp = `
			<div class="modal fade" id='_tipmodal-${modalId}' style="z-index: 20000;">
				<div class="modal-dialog modal-sm">
					<div class="modal-content">
						<div class="pl22 pr22 pt15 pb15">
							<h4 class="modal-title">${txt}</h4>
						</div>
						<div class='modal-footer'>
							<button type="button" class="btn btn-primary btn-lg" data-dismiss="modal">确认</button>
						</div>
					</div>
				</div>
			</div>
		`;

		temp = $(temp);
		temp.appendTo('body').modal({
			backdrop: false,
			show: true
		});
		$(document).one('hide.bs.modal', '#_tipmodal-' + modalId, function(){
			handler && handler();
		})
		$(document).one('hidden.bs.modal', '#_tipmodal-' + modalId, function(){
			$(this).remove();
			temp = null;
		})
		id++;
	}

	return tip;
})