/**
 * 版本信息
 */

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
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal/index.js'

], function(mods, Frame, Reducer_Frame, r, Modal){

	var rest = r.rcn({
		stringifyData: false
	});

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

	var Version = React.createClass({
		getInitialState:function(){
			return {
				data:[]
			}
		},
		componentDidMount:function(){
			this.loadVersionData();
		},
		// 读取personal接口数据
		loadVersionData:function(){
			rest.version.read().done(data => {
				if (this.isMounted()) {
					this.setState({data:data});
				}
			}).error(data => {
				if(data.status === 400 && data.responseJSON.msg){
					this.setState({warn:true, warntxt:data.responseJSON.msg});
				}
				// else{
				// 	this.setState({warntxt:"服务器出错，请联系管理员", warn:true});
				// }
			});
		},
		render:function(){
			return (
				<div className="fr-mid w1200">
					<div className="setting">
						<div className="setting-version w">
							<div className="titlebox w">
								<span>版本信息</span>
							</div>
							<div className="infobox w">
								{
									this.state.data.map ((index,elem) => {
										return (
											<div className="cent">
												<p>{index.title}</p>
												<p>{index.info}</p>
											</div>
										)
									})
								}
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	ReactDOM.render(
		<Provider store={store}>
			<Frame>
				<Version />
			</Frame>
		</Provider>, document.getElementById("version"));
})