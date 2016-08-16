define(function(){
	var env = {
		user: {
		}
	}

	return {
		user: {
			get: function(){
				return $.extend(true, {}, env.user);
			},
			set: function(obj){
				Object.assign(env.user, obj);
				return $.extend(true, {}, env.user);
			},
			reset: function(){
				env.user = {};
				return env.user
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
		pushUserInfoToGio: function(user){
			_vds.push(['setCS1', 'user_id', user.py_full]);
			_vds.push(['setCS2', 'company_id', user.company_uuid]);
		}
	}
})