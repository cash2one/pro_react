'use strict';

define(function () {
	var filter = {
		mids: {
			title: '载体',
			items: [{
				title: '全部',
				key: 'all'
			}, {
				title: '纸媒',
				key: 'print'
			}, {
				title: '网媒',
				key: 'network'
			}, {
				title: '卫视',
				key: 'tv'
			}, {
				title: '新媒体',
				key: 'new'
			}, {
				title: '论坛',
				key: 'bbs'
			}, {
				title: '博客',
				key: 'blog'
			}, {
				title: '百科',
				key: 'wiki'
			}, {
				title: '视频',
				key: 'video'
			}, {
				title: '微博',
				key: 'weibo'
			}, {
				title: '微信',
				key: 'weixin'
			}]
		},
		time: {
			title: '时间',
			items: [{
				title: '近一月',
				key: 'last_month'
			}, {
				title: '今天',
				key: 'today'
			}, {
				title: '昨天',
				key: 'yesterday'
			}, {
				title: '近一周',
				key: 'last_week'
			}]
		},
		warn: {
			title: '预警类型',
			items: [{
				title: '全部',
				key: 'all'
			}, {
				title: '手动预警',
				key: 'manual'
			}, {
				title: '自动预警',
				key: 'auto'
			}]
		}
	};
	return filter;
});