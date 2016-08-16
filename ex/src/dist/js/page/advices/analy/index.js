'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

require(["mods", paths.rcn.comps + "/frame/index.js", paths.rcn.comps + '/frame/reducers.js', paths.ex.page + '/advices/analy/profile2/index.js', paths.ex.page + '/advices/analy/spread/index.js', paths.ex.page + '/advices/analy/spread/detail.js', paths.ex.page + '/advices/analy/event/index.js', paths.ex.page + '/advices/analy/event/media.js', paths.ex.page + '/advices/analy/event/vein.js', paths.rcn.page + '/404/index.js', paths.rcn.page + '/blank/index.js'], function (mods, Frame, Reducer_Frame, Profile, Spread, SpreadDetail, Event, EventMedia, EventVein, NotFound, Blank) {
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
	var Redirect = _mods$RouterPack.Redirect;
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
				React.createElement(IndexRedirect, { to: 'profile' }),
				React.createElement(Route, { path: 'profile', component: Profile }),
				React.createElement(Route, { path: 'media', component: EventMedia, tp: 'company' }),
				React.createElement(Route, { path: 'spread', component: SpreadDetail, tp: 'company' }),
				React.createElement(Route, { path: 'event', component: Event }),
				React.createElement(Route, { path: 'event/vein', component: EventVein }),
				React.createElement(Route, { path: 'event/spread', component: SpreadDetail, tp: 'event' }),
				React.createElement(Route, { path: 'event/media', component: EventMedia, tp: 'event' }),
				React.createElement(Route, { path: '*', component: Blank })
			)
		)
	), document.querySelectorAll('body')[0]);
});