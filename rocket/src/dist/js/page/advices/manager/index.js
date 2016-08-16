'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.rcn.comps + "/frame/index",
		"Reducer_Frame": paths.rcn.comps + '/frame/reducers'
	}
});

require(["mods", "Frame", "Reducer_Frame", paths.rcn.page + '/advices/manager/manager/index.js', paths.rcn.page + '/advices/manager/company/index.js', paths.rcn.page + '/advices/manager/company/welcome.js', paths.rcn.page + '/advices/manager/allmgr/index.js'], function (mods, Frame, Reducer_Frame, Manager, Company, CompanyWelcome, Allmgr) {

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var _mods$ReduxPack = mods.ReduxPack;
	var combineReducers = _mods$ReduxPack.combineReducers;
	var createStore = _mods$ReduxPack.createStore;
	var Provider = mods.ReactReduxPack.Provider;
	var _mods$RouterPack = mods.RouterPack;
	var Router = _mods$RouterPack.Router;
	var Route = _mods$RouterPack.Route;
	var hashHistory = _mods$RouterPack.hashHistory;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var syncHistoryWithStore = _mods$ReduxRouterPack.syncHistoryWithStore;
	var routerReducer = _mods$ReduxRouterPack.routerReducer;

	var store = createStore(combineReducers(_extends({}, Reducer_Frame, {
		routing: routerReducer
	})));
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
				React.createElement(Route, { path: 'manager', component: Manager }),
				React.createElement(Route, { path: 'viewer', component: Manager }),
				React.createElement(Route, { path: 'company', component: Company }),
				React.createElement(Route, { path: 'companyWelcome', component: CompanyWelcome }),
				React.createElement(Route, { path: 'allmgr', component: Allmgr })
			)
		)
	), document.getElementById('manager'));
});