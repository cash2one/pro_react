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
	paths.index.page + '/data/authority.js',
	paths.index.page + '/data/industry.js',
	paths.index.page + '/data/dataIndex.js',
	paths.index.page + '/data/sales.js',
	paths.index.page + '/data/brand.js',
	paths.index.page + '/data/brand_distribute.js',
	paths.index.page + '/data/brand_interest.js'
], function(mods, Frame, Reducer_Frame, Authority, Industry, DataIndex, Sales, Brand, Distribute, Interest){

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
					<Route path="navigate/authority" component={Authority} />
					<Route path="navigate/industry" component={Industry} />
					<Route path="navigate/index" component={DataIndex} />
					<Route path="navigate/sales" component={Sales} />
					<Route path="brand" component={Brand} />
					<Route path="brand/distribute" component={Distribute} />
					<Route path="brand/interest" component={Interest} />
				</Route>
			</Router>
		</Provider>, document.getElementById('big_data'));
})