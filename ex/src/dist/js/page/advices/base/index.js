'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=20160613',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"rest": paths.rcn.util + '/rest',
		"echarts": paths.rcn.plu + '/echarts.min'
	}
});

require(["mods", paths.rcn.comps + "/frame/index.js", paths.rcn.comps + '/frame/reducers.js', paths.ex.page + '/advices/base/news/audit/index.js', paths.ex.page + '/advices/base/news/audit/reducers.js', paths.ex.page + '/advices/base/warn/store/index.js', paths.ex.page + '/advices/base/warn/store/reducers.js', paths.ex.page + '/advices/base/event/operator/index.js', paths.ex.page + '/advices/base/event/operator/reducers.js', paths.ex.page + '/advices/base/event/detail/index.js', paths.ex.page + '/advices/base/event/detail/reducers.js', paths.ex.page + '/advices/base/report/list.js', paths.ex.page + '/advices/base/report/edit.js', paths.ex.page + '/advices/base/report/view.js', paths.ex.page + '/advices/base/article/article.js', paths.ex.page + '/advices/base/articles/index.js', paths.ex.page + '/advices/base/articles/redu.js'], function (mods, Frame, Reducer_Frame, Audit, Audit_Redu, Warn, Warn_Redu, EventList, EventList_Redu, EventDetail, EventDetail_Redu, ReportList, ReportEdit, ReportView, Art, Arts, Arts_Redu) {
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
	var routerMiddleware = _mods$ReduxRouterPack.routerMiddleware;

	var store = createStore(combineReducers(_extends({}, Reducer_Frame, Audit_Redu, Warn_Redu, EventList_Redu, EventDetail_Redu, Arts_Redu, {
		routing: routerReducer
	})), applyMiddleware(mods.thunk, routerMiddleware(hashHistory)));
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
				React.createElement(IndexRedirect, { to: 'news' }),
				React.createElement(
					Route,
					{ path: 'news' },
					React.createElement(IndexRedirect, { to: 'audit' }),
					React.createElement(Route, { path: 'all', component: Arts }),
					React.createElement(Route, { path: 'audit', component: Audit })
				),
				React.createElement(
					Route,
					{ path: 'warn' },
					React.createElement(IndexRedirect, { to: 'store' }),
					React.createElement(Route, { path: 'store', component: Warn })
				),
				React.createElement(
					Route,
					{ path: 'event' },
					React.createElement(IndexRedirect, { to: 'operator' }),
					React.createElement(Route, { path: 'operator', component: EventList }),
					React.createElement(Route, { path: 'detail', component: EventDetail })
				),
				React.createElement(
					Route,
					{ path: 'report' },
					React.createElement(IndexRedirect, { to: 'edit' }),
					React.createElement(Route, { path: 'build', component: ReportList }),
					React.createElement(Route, { path: 'edit', component: ReportEdit }),
					React.createElement(Route, { path: 'view', component: ReportView })
				),
				React.createElement(Route, { path: 'article', component: Art })
			)
		)
	), document.querySelectorAll('body')[0]);
});