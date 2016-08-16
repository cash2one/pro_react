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
})

require([
	"mods",
	paths.rcn.comps + "/frame/index.js",
	paths.rcn.comps + '/frame/reducers.js',
	paths.ex.page + '/advices/base/news/audit/index.js',
	paths.ex.page + '/advices/base/news/audit/reducers.js',
	paths.ex.page + '/advices/base/warn/store/index.js',
	paths.ex.page + '/advices/base/warn/store/reducers.js',
	paths.ex.page + '/advices/base/event/operator/index.js',
	paths.ex.page + '/advices/base/event/operator/reducers.js',
	paths.ex.page + '/advices/base/event/detail/index.js',
	paths.ex.page + '/advices/base/event/detail/reducers.js',
	paths.ex.page + '/advices/base/report/list.js',
	paths.ex.page + '/advices/base/report/edit.js',
	paths.ex.page + '/advices/base/report/view.js',
	paths.ex.page + '/advices/base/article/article.js',
	paths.ex.page + '/advices/base/articles/index.js',
	paths.ex.page + '/advices/base/articles/redu.js'
], function(mods, Frame, Reducer_Frame, Audit, Audit_Redu, Warn, Warn_Redu, EventList, EventList_Redu, EventDetail, EventDetail_Redu, ReportList, ReportEdit, ReportView, Art, Arts, Arts_Redu){
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var {combineReducers, createStore, applyMiddleware} = mods.ReduxPack;
	var {Provider} = mods.ReactReduxPack;
	var {Router, Route, hashHistory, IndexRedirect} = mods.RouterPack;
	var {syncHistoryWithStore, routerReducer, routerMiddleware} = mods.ReduxRouterPack;
	var store = createStore(combineReducers(Object.assign({}, Reducer_Frame, Audit_Redu, Warn_Redu, EventList_Redu, EventDetail_Redu, Arts_Redu, {
		routing: routerReducer
	})), applyMiddleware(mods.thunk, routerMiddleware(hashHistory)));
	var history = syncHistoryWithStore(hashHistory, store)

	ReactDOM.render(
		<Provider store={store}>
			<Router history={history}>
				<Route path="/" component={Frame}>
					<IndexRedirect to="news" />
					<Route path="news">
						<IndexRedirect to="audit" />
						<Route path="all" component={Arts} />
						<Route path="audit" component={Audit} />
					</Route>
					<Route path="warn">
						<IndexRedirect to="store" />
						<Route path="store" component={Warn} />
					</Route>
					<Route path="event">
						<IndexRedirect to="operator" />
						<Route path="operator" component={EventList} />
						<Route path="detail" component={EventDetail} />
					</Route>
					<Route path="report">
						<IndexRedirect to="edit" />
						<Route path="build" component={ReportList} />
						<Route path="edit" component={ReportEdit} />
						<Route path="view" component={ReportView} />
					</Route>
					<Route path="article" component={Art} />
				</Route>
			</Router>
		</Provider>, document.querySelectorAll('body')[0]);
})