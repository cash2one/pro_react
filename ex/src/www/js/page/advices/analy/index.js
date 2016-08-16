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
})

require([
	"mods",
	paths.rcn.comps + "/frame/index.js",
	paths.rcn.comps + '/frame/reducers.js',
	paths.ex.page + '/advices/analy/profile2/index.js',
	paths.ex.page + '/advices/analy/spread/index.js',
	paths.ex.page + '/advices/analy/spread/detail.js',
	paths.ex.page + '/advices/analy/event/index.js',
	paths.ex.page + '/advices/analy/event/media.js',
	paths.ex.page + '/advices/analy/event/vein.js',
	paths.rcn.page + '/404/index.js',
	paths.rcn.page + '/blank/index.js'
], function(mods, Frame, Reducer_Frame, Profile, Spread, SpreadDetail, Event, EventMedia, EventVein, NotFound, Blank){
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
					<IndexRedirect to="profile" />
					<Route path="profile" component={Profile} />
					<Route path="media" component={EventMedia} tp="company" />
					<Route path="spread" component={SpreadDetail} tp="company" />
					<Route path="event" component={Event} />
					<Route path="event/vein" component={EventVein} />
					<Route path="event/spread" component={SpreadDetail} tp="event" />
					<Route path="event/media" component={EventMedia} tp="event" />
					<Route path="*" component={Blank} />
				</Route>
			</Router>
		</Provider>, document.querySelectorAll('body')[0]);
})