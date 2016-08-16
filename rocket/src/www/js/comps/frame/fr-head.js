define([
	'mods', 
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/frame/bread-map.js',
	paths.rcn.plu + '/fecha.min.js'
], function(mods,rest, getBread, fecha){
	var rest = rest.rcn({stringifyData: false});
	var React = mods.ReactPack.default;
	var {PropTypes} = mods.ReactPack;

	var fixmap = {
		'rule_gm_manager_company': {
			name: 'rule_gm_manager_company',
			link: 'http://home.puzhizhuhai.com/manager#/company',
			navType: 'company',
			// title: '企业首页'
		},
		'rule_ac_manager_manager_v2': {
			name: 'rule_ac_manager_manager_v2',
			link: 'http://home.puzhizhuhai.com/manager#/allmgr',
			navType: 'company',
			// title: '企业首页'
		},
		'rule_global_manager': {
			name: 'rule_global_manager',
			navType: 'company'
		},
		'diy_company_welcome': {
			name: 'diy_company_welcome',
			link: 'http://home.puzhizhuhai.com/manager#/companyWelcome',
			title: '公司首页'
		},
		'diy_event_detail': {
			name: 'diy_event_detail',
			link: 'http://info.puzhizhuhai.com/base#/event/detail',
			title: '事件详情',
			parent: 'rule_ac_event_operator'
		},
		'diy_report_edit': {
			name: 'diy_report_edit',
			link: 'http://info.puzhizhuhai.com/base#/report/edit',
			title: '报表编辑',
			parent: 'rule_ac_report_build'
		},
		'diy_report_view': {
			name: 'diy_report_view',
			link: 'http://info.puzhizhuhai.com/base#/report/view',
			title: '报表预览',
			parent: 'rule_ac_report_build'
		},
		'diy_article_detail': {
			name: 'diy_article_detail',
			link: 'http://info.puzhizhuhai.com/base#/article',
			title: '文章详情',
			parent: 'rule_advices_center'
		}
	}

	var FrameHead = React.createClass({
		/**
		 * [logOut description]
		 * @return
		 */
		logOut: function(){
			rest.user.read().done((data) => {
				var opt = {
					token:$.cookie('user_token')
				}
				rest.user.create("logout",opt).done(() => {
					$.removeCookie('user_token', {domain: paths.rcn.domain, path:"/"});
					$.removeCookie('md5', {domain: paths.rcn.domain, path:"/"});
					if(data.role_group === 'role_super_manager'){
						var url = paths.rcn.web +'/super';
					} else {
						url = paths.rcn.web +'/login';
					}
					window.location.href = url;
				});
			})
		},
		resetTitle: function(bread){
			var tit = ['深圳普智', ...bread.map(b => b.title)].join(' - ');
			document.title = tit;
		},
		parseUrl: function(){
			var data = $.extend(true, {}, this.props.routemap, getBread.map),
				rloc = this.props.routeState.location;
			var wloc = window.location;
			var curUrl = wloc.pathname,
				cur, res = [];

			if(rloc){
				curUrl = curUrl + '#' + rloc.pathname
			}

			for(var name in data){
				if(data[name].link == curUrl){
					cur = data[name];
					break;
				}
			}

			while(cur){
				res.unshift(cur);
				let p = data[cur.parent];
				if(p && p.name.indexOf('_group') != -1){
					p = data[p.parent];
				}
				cur = p;
			}

			return res;
		},
		renderBread: function(){
			var path, state = this.props.routeState.location, bread, first;
			if(state) path = state.pathname;
			// bread = getBread(path);
			first = this.props.user.company ? {title: this.props.user.company} : null;
			bread = this.parseUrl() || [];
			if(bread.length && bread[0].breadType != 'company'){
				bread = [...bread];
				if(first)
					bread.unshift(first);
			}
			else if(bread.length && bread[0].breadType == 'company' && this.props.user.role_group != 'role_super_manager')
				bread[0].title = '企业首页';

			this.resetTitle(bread);
			return bread.map((b, idx) => <a className="fr-bread-item" key={idx}>{b.title}</a>);
		},
		handlerHeadClick: function(){
			var tar = $(this.refs.user);
			if(!tar.hasClass('active')){
				tar.addClass('active')
				$(document).one('click', function(){
					tar.removeClass('active');
				})
			}
		},
		refresh: function(){
			rest.user.update('cur_time_updating').done(data => {
				if(data.result) window.location.reload();
			})
		},
		getUpdateTime: function(){
			var str = this.props.user.update_at || '';
			str = (str.split(' ')[1] || '').match(/(?:\d+\:\d+)/) || [];
			return str[0] || '';
		},
		render: function(){
			const {user} = this.props;
			return (
				<div className="frame-header-v2">
					<div className="frame-header-left">
						<img src={paths.rcn.base + "/img/logo2.png"} width="40" height="40" />
						<span className="text">深圳普智</span>
					</div>
					<div className="frame-header-right">
						<div className="back-btn" onClick={() => window.history.go(-1)}>
							<span className="iconfont icon-fanhui"></span>
						</div>
						<div className="fr-bread">
							{
								this.renderBread()
							}
						</div>
						<div className="operations">
							<div className="download dn">
								<div className="holder">
									<span>App下载</span>
								</div>
								<div className="img">

								</div>
							</div>
							<div className="refresh">
								<div className="time">
									<span>截止 </span>
									<span id="sys_time" data-time={user.update_at}>{this.getUpdateTime()}</span>
								</div>
								<div className="button" onClick={this.refresh}>
									<span className="iconfont icon-shuaxin"></span>
								</div>
							</div>
							<div className="user" onClick={this.handlerHeadClick} ref="user">
								<div className="holder">
									{
										user.avatar ? <img id="fr_user_pic" src={paths.rcn.base + user.avatar} alt=""/> : null
									}
									<span id="fr_user_name" className="txt">{user.name}</span>
									<span className="iconfont icon-xiala ico" />
								</div>
								<ul className="menu">
									<li>
										<a href={paths.rcn.web + '/setting/personal'}>
											<span className="ico iconfont icon-zhanghu" />
											<span className="txt">个人设置</span>
										</a>
									</li>
									<li>
										<a href={paths.rcn.web + '/feedback#/problem'}>
											<span className="ico iconfont icon-fankui" />
											<span className="txt">用户反馈</span>
										</a>
									</li>
									<li>
										<a href="javascript:void(0);" onClick={this.logOut}>
											<span className="ico iconfont icon-tuichu" />
											<span className="txt">退出账户</span>
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			)
		}
	});

	return FrameHead
})