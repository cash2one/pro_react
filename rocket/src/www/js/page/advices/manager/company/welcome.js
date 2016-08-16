define([ 

	'mods', 
	paths.rcn.util + '/rest.js'

], function(mods,r){

	var rest = r.rcn({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var CompanyWelcome = React.createClass({

		getInitialState:function(){
			return {
				company: null,
				isFrame:false,
				uuid: null
			}
		},

		componentDidMount:function(){
			this.loadPage();
		},

		loadPage: function(){
			// $(".VoteWrapper h4").css("color","#fff");

			rest.user.read().done(data => {

				this.setState({company: data.company, uuid: data.uuid});

				// var uuid_ = data.uuid;
				// if($.cookie('vote') == uuid_){ // 投过票

				// 	return null;

				// }else { // 没投过票

				// 	this.setState({isFrame:true}); // 弹iframe投票
				// 	$.cookie('vote', uuid_, {domain: paths.rcn.domain, expires: new Date(Date.now() + 3 * 24 * 3600 * 1000)});
					
				// }
				
			}).error(data => {
				if(data.status === 400 && data.responseJSON.msg){
					this.setState({warn:true, warntxt:data.responseJSON.msg});
				}
			});
		},

		handleReturn: function(){
			this.setState({isFrame:false});
		},

		render:function(){
			return (
				<div className="company-base">
					<div className="companyWelcome">
						<div className="bg"></div>
						<div className="txt">-- {this.state.company}</div>
					</div>
					<div className={this.state.isFrame?"show-frame":"none"}>
						<div className="backdrop"></div>
						{
							// <div className="framebox">
							// 	<iframe id="iframe1" name="iframe1" frameborder="0" width="500" height="273" scrolling="no" src="http://y8f6y2.v.vote8.cn/Widget?SkinID=55"></iframe>
							// 	<div className="c-button" onClick={this.handleReturn}>关闭</div>
							// </div>
						}
					</div>
				</div>
			)
		}
	})

	return CompanyWelcome
})