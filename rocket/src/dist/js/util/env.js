'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(function () {
	var env = {
		user: {}
	};

	return {
		user: {
			get: function get() {
				return $.extend(true, {}, env.user);
			},
			set: function set(obj) {
				_extends(env.user, obj);
				return $.extend(true, {}, env.user);
			},
			reset: function reset() {
				env.user = {};
				return env.user;
			}
		},
		srcMap: {
			'print': '纸媒',
			'network': '网媒',
			'tv': '卫视',
			'new': '新媒体',
			'bbs': '论坛',
			'blog': '博客',
			'wiki': '百科',
			'video': '视频',
			'weibo': '微博',
			'weixin': '微信'
		},
		gIo: '9509e55ffcb54736',
		pushUserInfoToGio: function pushUserInfoToGio(user) {
			_vds.push(['setCS1', 'user_id', user.py_full]);
			_vds.push(['setCS2', 'company_id', user.company_uuid]);
		}
	};
});