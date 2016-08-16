'use strict';

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=20160613',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"echarts": paths.rcn.plu + '/echarts.min',
		"dt": paths.ex.page + '/advices/analy/spread/dt',
		"d3": 'https://cdn.bootcss.com/d3/3.5.17/d3.min',
		"jsnx": paths.ex.plu + '/jsnx'
	},
	shim: {
		'jsnx': {
			deps: ['d3']
		}
	}
});

require(["mods", 'http://info.puzhizhuhai.com/js/mobile/detail.js'], function (mods, SpreadDetail) {
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	$.GetQueryString = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	};

	var userToken = $.GetQueryString('user_token'),
	    mediaType = $.GetQueryString('spread_type'),
	    companyId = $.GetQueryString('company_id'),
	    eventId = $.GetQueryString('event_id');

	ReactDOM.render(React.createElement(SpreadDetail, { tp: mediaType, companyId: companyId, userToken: userToken, eventId: eventId }), document.getElementById('app'));
});