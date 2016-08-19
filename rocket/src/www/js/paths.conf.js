// 每个html需优先引入此文件
// 用于调用正确的js资源和api接口

;(function(){

	var rcn = '/rocket',
		ex = '/ex',
		index = '/hawkeye',//http://c.puzhizhuhai.com',
		domain = 'puzhizhuhai.com',

		rcn_web = "";

	window.paths = {
		rcn: {
			web:rcn_web,
			domain: domain,
			api: rcn,
			base: rcn,
			comps: rcn + '/js/comps',
			lib: rcn + '/js/lib',
			util: rcn + '/js/util',
			plu: rcn + '/js/plu',
			page: rcn + '/js/page',
			img: rcn + '/img'
		},
		ex: {
			domain: domain,
			api: ex,
			base: '.',
			page: ex + '/js/page',
			comps: ex + '/js/comps',
			plu: ex + '/js/plu',
			util: ex + '/js/util',
			advices: {
				base: {
					event: ex + '/js/page/advices/base/event',
					news: ex + '/js/page/advices/base/news',
					warn: ex + '/js/page/advices/base/warn'
				}
			},
			// 媒体搜索的图片
			eximg: '/eximg/'
		},
		index: {
			web:rcn_web,
			domain: domain,
			api: index,
			base: index,
			comps: index + '/js/comps',
			page: index + '/js/page'
		},
		// 重定向链接
		relink: {
			login: rcn_web + '/login',
			company: rcn_web + '/manager#/company'
		},
		links: {
			allArticles: rcn_web + '/base#/news/all',
			warn: rcn_web + '/base#/warn/store',
			eventDetail: rcn_web + '/base#/event/detail'
		}
	}
})();