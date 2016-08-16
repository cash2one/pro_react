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

require(["mods", paths.rcn.comps + "/frame/index.js", paths.rcn.comps + '/frame/reducers.js', paths.index.page + '/data/authority.js', paths.index.page + '/data/industry.js', paths.index.page + '/data/dataIndex.js', paths.index.page + '/data/sales.js', paths.index.page + '/data/brand.js', paths.index.page + '/data/brand_distribute.js', paths.index.page + '/data/brand_interest.js'], function (mods, Frame, Reducer_Frame, Authority, Industry, DataIndex, Sales, Brand, Distribute, Interest) {

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
				React.createElement(Route, { path: 'navigate/authority', component: Authority }),
				React.createElement(Route, { path: 'navigate/industry', component: Industry }),
				React.createElement(Route, { path: 'navigate/index', component: DataIndex }),
				React.createElement(Route, { path: 'navigate/sales', component: Sales }),
				React.createElement(Route, { path: 'brand', component: Brand }),
				React.createElement(Route, { path: 'brand/distribute', component: Distribute }),
				React.createElement(Route, { path: 'brand/interest', component: Interest })
			)
		)
	), document.getElementById('big_data'));
});