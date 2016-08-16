define([
	'mods',
	'api',
	paths.rcn.util + '/env.js',
	paths.rcn.comps + '/frame/actions.js',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/frame/bread-map.js'
], function(mods, api, env, Actions, Rest, getBread){
	var React = mods.ReactPack.default;
	var {PropTypes} = mods.ReactPack;
	var {Link} = mods.RouterPack;
	var connect = mods.ReactReduxPack.connect;
	var {
		frNavOpen,
		frNavReceiveData,
		frSetCompanyName,
		frSetUserName,
		frNavUpdated,
		frUser
	} = Actions;

	var rest = Rest.rcn();

	/**
	 * [filterRules 根据用户权限筛选rules]
	 * @param (rules[array], 用户信息[object])
	 * @return [object]
	 */
	function filterRules(rules, user){
		var map, res = {};
		map = rules.reduce((obj, item, idx) => {
			item._i = idx;
			obj[item.name] = item;
			return obj;
		}, {});

		function findParent(item){
			res = Object.assign(res, {
				[item.name]: item
			});
			if(map[item.parent]){
				findParent(map[item.parent]);
			}
		}

		user.rule.forEach(name => {
			let item = map[name];
			if(item){
				res = Object.assign(res, {
					[name]: item
				})
				findParent(item);
			}
		});

		return Object.keys(res).map(name => {
			let route = res[name].link.match(/\#\/(\w+)/);
			if(route && route[1]){
				route = route[1]
			} else {
				route = '';
			}
			res[name].route = route;
			return res[name];
		})
	}

	const centerIcon = {
		'舆情中心': 'iconfont icon-gongzuotai',
		'新闻中心': 'iconfont icon-jinjimoshi',
		'设置': 'iconfont icon-shezhi',
		'行情中心': 'iconfont icon-DebugFac',
		'日常管理': 'iconfont icon-fenleiguanli',
		'大数据导航': 'iconfont icon-daohang',
		'数据新闻': 'iconfont icon-shuju'
	}

	var FrameNavi = React.createClass({
		componentWillReceiveProps: function(next){
			const {dispatch} = this.props;
			if(next.updateNav == true && this.props.updateNav == false){
				this.updateNav();
				dispatch(frNavUpdated());
			}
		},
		componentDidMount: function(){
			if(!(window.location.pathname == '/manager' && this.props.loc.pathname == '/company')){
				this.updateNav();
			}
		},
		updateNav: function(){
			const {dispatch} = this.props;
			rest.user.read().then(user => {
				env.pushUserInfoToGio(user);
				// if(user.company){
					rest.rules.read().then(rules => {
						// 更新导航
						dispatch(frNavReceiveData(filterRules(rules, user)));
						this.setOpen();
					})
				// }
				// 更新公司名
				dispatch(frSetCompanyName(user.company));
				// 更新用户名
				dispatch(frSetUserName(user.name));
				dispatch(frUser(user));
			});
		},
		toggleNavi: function(name){
			const {dispatch, opened} = this.props;
			name = opened == name ? '' : name;
			dispatch(frNavOpen(name));
		},
		// 渲染子级导航
		renderGroup: function(groups){
			var nodes = [];
			groups.forEach((group, group_idx) => {
				if(group.children){
					nodes.push(
						<ul className="fr-nav-group" key={group_idx}>
							{
								group.children.map((chd, idx) => {
									let className = window.location.href.indexOf(chd.link) != -1 ? 'active' : null;
									return (
										<li className="item" key={idx}>
											<a href={chd.link} className={className} onClick={this.handleStaticNav}>
												<span className='text'>{chd.title}</span>
											</a>
										</li>
									)
								})
							}
						</ul>
					)
				}
			})
			return nodes;
		},
		// 渲染顶级导航
		renderRules: function(){
			const {opened, renderData} = this.props;
			var nodes = [];
			nodes = renderData.map((rule, idx) => {
				// 存在组的情况
				if(rule.children != undefined){
					let groupNodes = this.renderGroup(rule.children);
					return (
						<li className={"item" + (opened == rule.name ? ' opened' : '')} key={idx}>
							<a href="javascript:void(0)" onClick={() => this.toggleNavi(rule.name)}>
								<span className={centerIcon[rule.title] + ' icon'}></span>
								<span className='text'>{rule.title}</span>
								<span className="iconfont icon-arr-bottom corner"></span>
							</a>
							<div>
								{groupNodes}
							</div>
						</li>
					)
				}
				// 不存在组
				else {
					return (
						<li className="item" key={idx}>
							<a href="javascript:void(0)">
								<span className='text'>{rule.title}</span>
							</a>
						</li>
					)
				}
			})

			return nodes;
		},
		renderSub: function(){
			var data = this.props.renderData.children, node, query = $.param(this.props.loc.query || {});
			if(data){
				node = data.map((dat, idx) => {
					let className = window.location.href.indexOf(dat.link) != -1 ? 'active' : null,
						link = query.length ? dat.link + '?' + query : dat.link;
					return (
						<li className="subitem" key={idx}>
							<a href={link} className={className} onClick={this.handleStaticNav}>
								<span className="text">{dat.title}</span>
							</a>
						</li>
					)
				})
			}
			return node;
		},
		setOpen: function(){
			var top = '',
				byName = this.props.byName,
				item,
				list = Object.keys(byName).map(name => byName[name]),
				dispatch = this.props.dispatch;
			while(list.length){
				if(list[0].link && list[0].link.length > 1 && window.location.href.indexOf(list[0].link) != -1){
					item = list[0];
					break;
				}
				list.shift()
			}
			while(item){
				if(item.parent == ''){
					top = item;
				}
				item = byName[item.parent];
			}
			dispatch(frNavOpen(top.name));
		},
		backStatic:function(val){
			var user = this.props.user;
			_hmt.push(['_trackEvent', 'menu_left', val, user.company])
		},
		handleStaticNav: function(e){
			var target = e.target, val, user = this.props.user
			if(target.className.indexOf('text') != -1){
				val = target.innerHTML;
			} else {
				if(target.tagName.toUpperCase() == 'A')
					target = $(target).find('.text');
				else
					target = $(target).parents('a').find('.text');
				val = target.html();
			}
			_hmt.push(['_trackEvent', 'menu_left', val, user.company])
		},
		render: function(){
			var nodes,
				navType = this.props.navType,
				renderData = this.props.renderData;
			if(navType == 'normal' || navType == 'company2' || navType == 'company' || navType == 'bigdata') {
				nodes = this.renderRules();
			} else if(navType == 'sub'){
				nodes = this.renderSub();
			}
			return (
				<div className="frame-body-left">
					<div className="navi-part">
						<div className="fr-nav-company">
							{
								(navType == 'company' || navType == 'company2') ? (
									<a className="wrap" onClick={() => this.backStatic('企业首页')}>
										<span>企业首页</span>
									</a>
								)
								: navType == 'sub' ? (
									<a href={renderData.link} className="wrap" onClick={() => this.backStatic(renderData.title || '')}>
										<span className="name">
											<span className="iconfont icon-fanhui" />
											<span>{'返回' + renderData.title || ''}</span>
										</span>
									</a>
								)
								: navType == 'bigdata' ? (
									<a href={'/manager#/company'} className="wrap" onClick={() => this.backStatic('企业首页')}>
										<span>企业首页</span>
									</a>
								)
								: (
									<a href={'/manager#/company'} className="wrap" onClick={() => this.backStatic('返回企业首页')}>
										<span className="name"><span className="iconfont icon-fanhui"></span>返回企业首页</span>
									</a>
								)
							}
						</div>
						<ul className="navi-container">
							{nodes}
						</ul>
					</div>
				</div>
			)
		}
	});

	function rulesDataFormat(data){
		var res = [];

		Object.keys(data).sort((a, b) => data[a]._i - data[b]._i).forEach(name => {
			let cur = data[name], parent = data[cur['parent']];
			if(parent){
				if(parent['children'] == undefined)
					parent['children'] = [];
				parent['children'].push(cur);
			} else {
				res.push(cur);
			}
		})

		return res.sort((a, b) => a._i - b._i);
	}

	function toProps(state, ori){
		var nav = state.fr_nav,
			user = state.fr_user,
			updateNav = state.updateNav,
			navType,
			curUrl = getBread.getCur(ori.route.location || state.routing.locationBeforeTransitions),
			curNav;

		var byName = $.extend(true, {}, nav.byName),
			renderData = rulesDataFormat(byName),
			fix = $.extend(true, {}, byName, getBread.map);
		
		for(var i in fix){
			if(fix[i].link == curUrl){
				curNav = fix[i];
				navType = curNav.navType;
				break;
			}
		}

		if(typeof navType == 'function')
			navType = navType(user);

		if(navType == 'company'){
			// renderData = [];
		} else if(navType == 'sub') {
			if(curNav)
				renderData = byName[curNav.parent];
		} else if(navType == 'company2'){
			// renderData
		} else if(navType == 'bigdata'){

		} else {
			navType = 'normal';
		}
		return {
			user,
			navType,
			renderData,
			updateNav,
			byName: nav.byName,
			opened: nav.opened,
			loc: ori.route.location || state.routing.locationBeforeTransitions
		}
	}

	return connect(toProps)(FrameNavi);
})