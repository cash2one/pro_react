
define(['mods', paths.rcn.util + '/rest.js'], function(mods, r){

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var {PropTypes} = mods.ReactPack;
	var {connect} = mods.ReactReduxPack;

	var Frame = React.createClass({
		getInitialState: function(){
			return {
				avatar:'',
				name:''
			};
		},
		componentDidMount:function(){
			this.getUser();
		},
		getUser:function(){
			rest.user.read().done((data) => {
				this.setState({avatar:data.avatar,name:data.name});
			});
		},
		logOut: function(){
			var opt = {
				token:$.cookie('user_token')
			};
			rest.user.create("logout",opt).done(() => {
				$.removeCookie('user_token', {domain: paths.rcn.domain});
				if(data.role_group === 'role_admin'){
					var url = paths.rcn.api +'/login';
				}
				window.location.href = url;
			});
		},
		navStyle: function(e){
			$('.item a').removeClass('active');
			e.target.className='active'; 
		},
		render: function(){
			return (
				<div>
					<div className="frame-header">
						<div className="frame-header-left">
							<img src={paths.rcn.base + "/img/logo.png"} alt="" width="32" height="41" />
							<span className="text">深圳普智</span>
						</div>
						<div className="frame-header-right">
							<div className="operations">
								<div className="item">
									<div className="inner" onClick={this.logOut}>
										<span>注销</span>
										<span className="iconfont icon-tuichu"></span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="frame-body">
						<div className="frame-body-left">
							<div className="navi-part">
								<div className="fr-nav-company">
									<span className="name">
										<span>系统管理</span>
									</span>
								</div>
								<ul className="navi-container admin-navi">
									<li className="item">
										<a href={paths.rcn.api + "/manager#/syndicate"} onClick={e => this.navStyle(e)}>
											<span className='text'>集团管理</span>
										</a>
									</li>
									<li className="item">
										<a href={paths.rcn.api + "/manager#/super"} className="active" onClick={e => this.navStyle(e)}>
											<span className='text'>超级运营员管理</span>
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div className="frame-body-right">
							<div className="frame-body-container">
								{this.props.children}
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Frame
})