'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test"
	}
});

require(["mods", paths.rcn.comps + "/frame/index.js", paths.rcn.comps + '/frame/reducers.js', paths.index.page + '/base/info.js',
// paths.index.page + '/base/info_highcharts.js',
paths.index.page + '/base/setting.js'], function (mods, Frame, Reducer_Frame, Info, Setting) {

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var _mods$ReduxPack = mods.ReduxPack;
	var combineReducers = _mods$ReduxPack.combineReducers;
	var createStore = _mods$ReduxPack.createStore;
	var applyMiddleware = _mods$ReduxPack.applyMiddleware;
	var Provider = mods.ReactReduxPack.Provider;
	var _mods$RouterPack = mods.RouterPack;
	var Router = _mods$RouterPack.Router;
	var Route = _mods$RouterPack.Route;
	var hashHistory = _mods$RouterPack.hashHistory;
	var IndexRedirect = _mods$RouterPack.IndexRedirect;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var syncHistoryWithStore = _mods$ReduxRouterPack.syncHistoryWithStore;
	var routerReducer = _mods$ReduxRouterPack.routerReducer;

	var store = createStore(combineReducers(_extends({}, Reducer_Frame, {
		routing: routerReducer
	})), applyMiddleware(mods.thunk));
	var history = syncHistoryWithStore(hashHistory, store);

	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(
			Router,
			{ history: history },
			React.createElement(
				Route,
				{ path: '/', component: Frame },
				React.createElement(IndexRedirect, { to: 'tag' }),
				React.createElement(Route, { path: 'info', component: Info }),
				React.createElement(Route, { path: 'info/setting', component: Setting })
			)
		)
	), document.getElementById('index_base'));
});