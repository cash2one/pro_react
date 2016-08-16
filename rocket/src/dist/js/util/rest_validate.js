"use strict";

define([paths.rcn.util + '/tip.js'], function (tip) {

	// function tip(xhr, handler){
	// 	if(xhr.status == 500)
	// 		var txt = '服务器出错，请联系管理员';
	// 	else
	// 		txt = xhr.responseJSON.msg;
	// 	var temp = `<div>
	// 			<div class="c-modal-backdrop"></div>
	// 			<div class="c-modal">
	// 				<div class="dialog sm">
	// 					<div class="cont">
	// 						<div class="header">
	// 							<span>提示</span>
	// 						</div>
	// 						<div class="body">
	// 							<div class="m-tip pb20">
	// 								<div class="">${txt}</div>
	// 							</div>
	// 						</div>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>`;
	// 	$(temp).click(function(){
	// 		handler && handler();
	// 		$(this).remove();
	// 		status[xhr.status] = false;
	// 	}).appendTo('body');
	// }

	var status = {
		"401": false,
		"403": false
	};

	function logout() {
		$.ajax(paths.rcn.api + '/api/v1/user/logout', {
			method: 'POST',
			data: {
				token: $.cookie('user_token')
			},
			headers: {
				user_token: $.cookie('user_token')
			}
		}).done(function () {
			$.removeCookie('user_token', { domain: paths.rcn.domain });
			$.removeCookie('md5', { domain: paths.rcn.domain });
		});
	}

	function after(xhr) {
		// 无token || token过期
		if (xhr.status == 401) {
			!status[xhr.status] && tip(xhr.responseJSON.msg, function () {
				$.removeCookie('user_token', { domain: paths.rcn.domain });
				$.removeCookie('md5', { domain: paths.rcn.domain });
				window.location.href = paths.relink.login;
				status[xhr.status] = false;
			});
			status[xhr.status] = true;
		}
		// 无权限
		else if (xhr.status == 403) {
				!status[xhr.status] && tip(xhr.responseJSON.msg, function () {
					// window.location.href = paths.rcn.base + '/login';
					window.location.href = paths.relink.company;
					status[xhr.status] = false;
				});
				status[xhr.status] = true;
			}
			// 公司被删除 || 帐号被下线
			else if (xhr.status == 421 || xhr.status == 422 || xhr.status == 423 || xhr.status == 424) {
					!status[xhr.status] && tip(xhr.responseJSON.msg, function () {
						$.removeCookie('user_token', { domain: paths.rcn.domain });
						$.removeCookie('md5', { domain: paths.rcn.domain });
						window.location.href = paths.relink.login;
						status[xhr.status] = false;
					});
					status[xhr.status] = true;
				}
				// 500
				else if (xhr.status == 500) {
						!status[xhr.status] && tip('服务器出错，请联系管理员', function () {
							status[xhr.status] = false;
						});
						status[xhr.status] = true;
					}
					// 450
					else if (xhr.status == 450) {
							window.location.href = paths.relink.company;
						}
						// 410 日报被删除
						else if (xhr.status == 410) {
								!status[xhr.status] && tip('未找到此日报，可能日报已被删除。', function () {
									status[xhr.status] = false;
								});
								status[xhr.status] = true;
							}
	}

	function before() {
		if (window.md5 != $.cookie('md5')) {
			tip('修改了公司，请刷新页面', function () {
				window.location.reload();
				status['before'] = false;
			});
			status['before'] = true;
			return false;
		}
	}

	return {
		before: before,
		after: after
	};
});