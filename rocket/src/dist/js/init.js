"use strict";

// 初始化全局jq ajax
;(function () {
	$.ajaxSetup({});

	$.GetQueryString = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	};

	$.randomCode = function (len) {
		len = len || 32;
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
		var maxPos = $chars.length;
		var pwd = '';
		for (var i = 0; i < len; i++) {
			pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	};

	window.md5 = $.cookie('md5');
})();

//加载字体文件
;(function () {
	var link = $('<link></link>', {
		href: 'http://at.alicdn.com/t/font_1470213061_1239262.css',
		rel: 'stylesheet'
	});
	var fav = $('<link></link>', {
		href: '/img/favicon.ico?2',
		rel: 'shortcut icon',
		type: 'image/vnd.microsoft.icon'
	});
	$('head').append(link).append(fav);
})();

var _hmt = _hmt || [];
(function () {
	var hm = document.createElement("script");
	hm.src = "//hm.baidu.com/hm.js?35ee96de621e4601942688ad0afc51ee";
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(hm, s);
})();

var _vds = _vds || [];
window._vds = _vds;
(function () {
	_vds.push(['setAccountId', '9509e55ffcb54736']);
	(function () {
		var vds = document.createElement('script');
		vds.type = 'text/javascript';
		vds.async = true;
		vds.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'dn-growing.qbox.me/vds.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(vds, s);
	})();
})();