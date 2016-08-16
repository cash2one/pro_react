require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test"
	}
})

require([
	"mods",
	paths.rcn.comps + "/frame/index.js",
	paths.rcn.comps + '/frame/reducers.js',
	paths.index.page + '/base/info.js',
	// paths.index.page + '/base/info_highcharts.js',
	paths.index.page + '/base/setting.js'
], function(mods, Frame, Reducer_Frame, Info, Setting){

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var {combineReducers, createStore, applyMiddleware} = mods.ReduxPack;
	var {Provider} = mods.ReactReduxPack;
	var {Router, Route, hashHistory, IndexRedirect} = mods.RouterPack;
	var {syncHistoryWithStore, routerReducer} = mods.ReduxRouterPack;
	var store = createStore(combineReducers(Object.assign({}, Reducer_Frame, {
		routing: routerReducer
	})), applyMiddleware(mods.thunk));
	var history = syncHistoryWithStore(hashHistory, store)

	ReactDOM.render(
		<Provider store={store}>
			<Router history={history}>
				<Route path="/" component={Frame}>
					<IndexRedirect to="tag" />
					<Route path="info" component={Info} />
					<Route path="info/setting" component={Setting} />
				</Route>
			</Router>
		</Provider>, document.getElementById('index_base'));
})