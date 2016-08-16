'use strict';

// 每个html需优先引入此文件
// 用于调用正确的js资源和api接口

;(function () {

	var rcn = 'http://home.puzhizhuhai.com',
	    admin = 'http://admin.puzhizhuhai.com/rocket',
	    admin_host = 'http://admin.puzhizhuhai.com',
	    domain = 'puzhizhuhai.com';

	window.paths = {
		rcn: {
			domain: domain,
			api: admin,
			base: rcn,
			comps: rcn + '/js/comps',
			lib: rcn + '/js/lib',
			util: rcn + '/js/util',
			plu: rcn + '/js/plu',
			page: rcn + '/js/page'
		},
		admin: {
			domain: domain,
			api: admin,
			page: admin_host + '/js'
		},
		// 重定向链接
		relink: {
			login: 'http://admin.puzhizhuhai.com/login',
			company: 'http://admin.puzhizhuhai.com/manager#/syndicate'
		}
	};
})();