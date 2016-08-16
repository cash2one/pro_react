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
	paths.rcn.page + '/advices/manager/manager/index.js',
	paths.rcn.page + '/advices/manager/company/index.js',
	paths.rcn.page + '/advices/manager/company/welcome.js',
	paths.rcn.page + '/advices/manager/allmgr/index.js',
], function(mods, Frame, Reducer_Frame, Manager, Company,CompanyWelcome, Allmgr){

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
					<Route path="manager" component={Manager} />
					<Route path="viewer" component={Manager} />
					<Route path="company" component={Company} />
					<Route path="companyWelcome" component={CompanyWelcome} />
					<Route path="allmgr" component={Allmgr} />
				</Route>
			</Router>
		</Provider>, document.getElementById('manager'));
})