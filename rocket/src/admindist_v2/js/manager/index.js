"use strict";

require.config({
	baseUrl: 'js',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.admin.page + "/frame/index"
	}
});

require(["mods", "Frame", paths.admin.page + '/manager/super/index.js', paths.admin.page + '/manager/syndicate/index.js'], function (mods, Frame, Super, Syndicate) {

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var _mods$RouterPack = mods.RouterPack;
	var Router = _mods$RouterPack.Router;
	var Route = _mods$RouterPack.Route;
	var hashHistory = _mods$RouterPack.hashHistory;


	ReactDOM.render(React.createElement(
		Router,
		{ history: hashHistory },
		React.createElement(
			Route,
			{ path: "/", component: Frame },
			React.createElement(Route, { path: "super", component: Super }),
			React.createElement(Route, { path: "syndicate", component: Syndicate })
		)
	), document.getElementById('admin_manager'));
});