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
	paths.rcn.util + '/rest.js'
], function(mods, r){

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var About = React.createClass({
		getInitialState: function(){
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
				}else{
					this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
				}
			});
		},
		render: function(){
			return (
				<div className="aboutpage lframe-bg">
					<div className="aboutbox">
						<div className="titlebox">
							<span>版本信息</span>
						</div>
						<div className="mainbox">
							{
								this.state.data.map ((index,elem) => {
									return (
										<div className="contentbox">
											<p>{index.title}</p>
											<p>{index.info}</p>
										</div>
									)
								})
							}
						</div>
					</div>
				</div>
			)
		}
	})

	ReactDOM.render(<About />, document.getElementById("aboutpage"));
})