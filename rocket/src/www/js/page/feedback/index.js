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
})

require([
	"mods",
	"Frame", 
	"Reducer_Frame",
	paths.rcn.page + '/feedback/problem.js',
	paths.rcn.page + '/feedback/media.js',
	paths.rcn.page + '/feedback/nav.js'
], function(mods, Frame, Reducer_Frame, Problem, Media, Nav){

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;
	var {combineReducers, createStore} = mods.ReduxPack;
	var {Provider} = mods.ReactReduxPack;
	var {Router, Route, hashHistory} = mods.RouterPack;
	var {syncHistoryWithStore, routerReducer} = mods.ReduxRouterPack;
	var store = createStore(combineReducers(Object.assign({}, Reducer_Frame, {
		routing: routerReducer
	})));
	var history = syncHistoryWithStore(hashHistory, store)

	ReactDOM.render(
		<Provider store={store}>
			<Router history={history}>
				<Route path="/" component={Frame}>
					<Route path="problem" component={Problem} />
					<Route path="media" component={Media} />
					<Route path="nav" component={Nav} />
				</Route>
			</Router>
		</Provider>, document.getElementById('feedback_page'));
})