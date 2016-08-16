require.config({
	baseUrl: 'js',
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
	paths.rcn.page + '/404/index.js',
	paths.rcn.page + '/blank/index.js'
], function(mods, Frame, Reducer_Frame, NotFound, Blank){
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var {combineReducers, createStore, applyMiddleware} = mods.ReduxPack;
	var {Provider} = mods.ReactReduxPack;
	var {Router, Route, hashHistory, IndexRedirect, Redirect} = mods.RouterPack;
	var {syncHistoryWithStore, routerReducer} = mods.ReduxRouterPack;
	var store = createStore(combineReducers(Object.assign({}, Reducer_Frame, {
		routing: routerReducer
	})), applyMiddleware(mods.thunk));
	var history = syncHistoryWithStore(hashHistory, store)

	ReactDOM.render(
		<Provider store={store}>
			<Router history={history}>
				<Route path="/" component={Frame}>
					<Route path="*" component={Blank} />
				</Route>
			</Router>
		</Provider>, document.querySelectorAll('body')[0]);
})