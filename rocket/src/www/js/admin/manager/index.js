require.config({
	baseUrl: 'js',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.admin.page + "/frame/index"
	}
})

require([
	"mods",
	"Frame",
	paths.admin.page + '/manager/super/index.js',
	paths.admin.page + '/manager/syndicate/index.js'
], function(mods, Frame, Super, Syndicate) {

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;
	var {Router,Route,hashHistory} = mods.RouterPack;

	ReactDOM.render(
		<Router history={hashHistory}>
			<Route path="/" component={Frame}>
				<Route path="super" component={Super} />
				<Route path="syndicate" component={Syndicate} />
			</Route>
		</Router>, document.getElementById('admin_manager'));
})