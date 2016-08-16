'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', 'api', paths.rcn.util + '/env.js', paths.rcn.comps + '/frame/actions.js', paths.rcn.util + '/rest.js', paths.rcn.comps + '/frame/bread-map.js'], function (mods, api, env, Actions, Rest, getBread) {
	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var Link = mods.RouterPack.Link;

	var connect = mods.ReactReduxPack.connect;
	var frNavOpen = Actions.frNavOpen;
	var frNavReceiveData = Actions.frNavReceiveData;
	var frSetCompanyName = Actions.frSetCompanyName;
	var frSetUserName = Actions.frSetUserName;
	var frNavUpdated = Actions.frNavUpdated;
	var frUser = Actions.frUser;


	var rest = Rest.rcn();

	/**
  * [filterRules 根据用户权限筛选rules]
  * @param (rules[array], 用户信息[object])
  * @return [object]
  */
	function filterRules(rules, user) {
		var map,
		    res = {};
		map = rules.reduce(function (obj, item, idx) {
			item._i = idx;
			obj[item.name] = item;
			return obj;
		}, {});

		function findParent(item) {
			res = _extends(res, _defineProperty({}, item.name, item));
			if (map[item.parent]) {
				findParent(map[item.parent]);
			}
		}

		user.rule.forEach(function (name) {
			var item = map[name];
			if (item) {
				res = _extends(res, _defineProperty({}, name, item));
				findParent(item);
			}
		});

		return Object.keys(res).map(function (name) {
			var route = res[name].link.match(/\#\/(\w+)/);
			if (route && route[1]) {
				route = route[1];
			} else {
				route = '';
			}
			res[name].route = route;
			return res[name];
		});
	}

	var centerIcon = {
		'舆情中心': 'iconfont icon-gongzuotai',
		'新闻中心': 'iconfont icon-jinjimoshi',
		'设置': 'iconfont icon-shezhi',
		'行情中心': 'iconfont icon-DebugFac',
		'日常管理': 'iconfont icon-fenleiguanli',
		'大数据导航': 'iconfont icon-daohang',
		'数据新闻': 'iconfont icon-shuju'
	};

	var FrameNavi = React.createClass({
		displayName: 'FrameNavi',

		componentWillReceiveProps: function componentWillReceiveProps(next) {
			var dispatch = this.props.dispatch;

			if (next.updateNav == true && this.props.updateNav == false) {
				this.updateNav();
				dispatch(frNavUpdated());
			}
		},
		componentDidMount: function componentDidMount() {
			if (!(window.location.pathname == '/manager' && this.props.loc.pathname == '/company')) {
				this.updateNav();
			}
		},
		updateNav: function updateNav() {
			var _this = this;

			var dispatch = this.props.dispatch;

			rest.user.read().then(function (user) {
				env.pushUserInfoToGio(user);
				// if(user.company){
				rest.rules.read().then(function (rules) {
					// 更新导航
					dispatch(frNavReceiveData(filterRules(rules, user)));
					_this.setOpen();
				});
				// }
				// 更新公司名
				dispatch(frSetCompanyName(user.company));
				// 更新用户名
				dispatch(frSetUserName(user.name));
				dispatch(frUser(user));
			});
		},
		toggleNavi: function toggleNavi(name) {
			var _props = this.props;
			var dispatch = _props.dispatch;
			var opened = _props.opened;

			name = opened == name ? '' : name;
			dispatch(frNavOpen(name));
		},
		// 渲染子级导航
		renderGroup: function renderGroup(groups) {
			var _this2 = this;

			var nodes = [];
			groups.forEach(function (group, group_idx) {
				if (group.children) {
					nodes.push(React.createElement(
						'ul',
						{ className: 'fr-nav-group', key: group_idx },
						group.children.map(function (chd, idx) {
							var className = window.location.href.indexOf(chd.link) != -1 ? 'active' : null;
							return React.createElement(
								'li',
								{ className: 'item', key: idx },
								React.createElement(
									'a',
									{ href: chd.link, className: className, onClick: _this2.handleStaticNav },
									React.createElement(
										'span',
										{ className: 'text' },
										chd.title
									)
								)
							);
						})
					));
				}
			});
			return nodes;
		},
		// 渲染顶级导航
		renderRules: function renderRules() {
			var _this3 = this;

			var _props2 = this.props;
			var opened = _props2.opened;
			var renderData = _props2.renderData;

			var nodes = [];
			nodes = renderData.map(function (rule, idx) {
				// 存在组的情况
				if (rule.children != undefined) {
					var groupNodes = _this3.renderGroup(rule.children);
					return React.createElement(
						'li',
						{ className: "item" + (opened == rule.name ? ' opened' : ''), key: idx },
						React.createElement(
							'a',
							{ href: 'javascript:void(0)', onClick: function onClick() {
									return _this3.toggleNavi(rule.name);
								} },
							React.createElement('span', { className: centerIcon[rule.title] + ' icon' }),
							React.createElement(
								'span',
								{ className: 'text' },
								rule.title
							),
							React.createElement('span', { className: 'iconfont icon-arr-bottom corner' })
						),
						React.createElement(
							'div',
							null,
							groupNodes
						)
					);
				}
				// 不存在组
				else {
						return React.createElement(
							'li',
							{ className: 'item', key: idx },
							React.createElement(
								'a',
								{ href: 'javascript:void(0)' },
								React.createElement(
									'span',
									{ className: 'text' },
									rule.title
								)
							)
						);
					}
			});

			return nodes;
		},
		renderSub: function renderSub() {
			var _this4 = this;

			var data = this.props.renderData.children,
			    node,
			    query = $.param(this.props.loc.query || {});
			if (data) {
				node = data.map(function (dat, idx) {
					var className = window.location.href.indexOf(dat.link) != -1 ? 'active' : null,
					    link = query.length ? dat.link + '?' + query : dat.link;
					return React.createElement(
						'li',
						{ className: 'subitem', key: idx },
						React.createElement(
							'a',
							{ href: link, className: className, onClick: _this4.handleStaticNav },
							React.createElement(
								'span',
								{ className: 'text' },
								dat.title
							)
						)
					);
				});
			}
			return node;
		},
		setOpen: function setOpen() {
			var top = '',
			    byName = this.props.byName,
			    item,
			    list = Object.keys(byName).map(function (name) {
				return byName[name];
			}),
			    dispatch = this.props.dispatch;
			while (list.length) {
				if (list[0].link && list[0].link.length > 1 && window.location.href.indexOf(list[0].link) != -1) {
					item = list[0];
					break;
				}
				list.shift();
			}
			while (item) {
				if (item.parent == '') {
					top = item;
				}
				item = byName[item.parent];
			}
			dispatch(frNavOpen(top.name));
		},
		backStatic: function backStatic(val) {
			var user = this.props.user;
			_hmt.push(['_trackEvent', 'menu_left', val, user.company]);
		},
		handleStaticNav: function handleStaticNav(e) {
			var target = e.target,
			    val,
			    user = this.props.user;
			if (target.className.indexOf('text') != -1) {
				val = target.innerHTML;
			} else {
				if (target.tagName.toUpperCase() == 'A') target = $(target).find('.text');else target = $(target).parents('a').find('.text');
				val = target.html();
			}
			_hmt.push(['_trackEvent', 'menu_left', val, user.company]);
		},
		render: function render() {
			var _this5 = this;

			var nodes,
			    navType = this.props.navType,
			    renderData = this.props.renderData;
			if (navType == 'normal' || navType == 'company2' || navType == 'company' || navType == 'bigdata') {
				nodes = this.renderRules();
			} else if (navType == 'sub') {
				nodes = this.renderSub();
			}
			return React.createElement(
				'div',
				{ className: 'frame-body-left' },
				React.createElement(
					'div',
					{ className: 'navi-part' },
					React.createElement(
						'div',
						{ className: 'fr-nav-company' },
						navType == 'company' || navType == 'company2' ? React.createElement(
							'a',
							{ className: 'wrap', onClick: function onClick() {
									return _this5.backStatic('企业首页');
								} },
							React.createElement(
								'span',
								null,
								'企业首页'
							)
						) : navType == 'sub' ? React.createElement(
							'a',
							{ href: renderData.link, className: 'wrap', onClick: function onClick() {
									return _this5.backStatic(renderData.title || '');
								} },
							React.createElement(
								'span',
								{ className: 'name' },
								React.createElement('span', { className: 'iconfont icon-fanhui' }),
								React.createElement(
									'span',
									null,
									'返回' + renderData.title || ''
								)
							)
						) : navType == 'bigdata' ? React.createElement(
							'a',
							{ href: '/manager#/company', className: 'wrap', onClick: function onClick() {
									return _this5.backStatic('企业首页');
								} },
							React.createElement(
								'span',
								null,
								'企业首页'
							)
						) : React.createElement(
							'a',
							{ href: '/manager#/company', className: 'wrap', onClick: function onClick() {
									return _this5.backStatic('返回企业首页');
								} },
							React.createElement(
								'span',
								{ className: 'name' },
								React.createElement('span', { className: 'iconfont icon-fanhui' }),
								'返回企业首页'
							)
						)
					),
					React.createElement(
						'ul',
						{ className: 'navi-container' },
						nodes
					)
				)
			);
		}
	});

	function rulesDataFormat(data) {
		var res = [];

		Object.keys(data).sort(function (a, b) {
			return data[a]._i - data[b]._i;
		}).forEach(function (name) {
			var cur = data[name],
			    parent = data[cur['parent']];
			if (parent) {
				if (parent['children'] == undefined) parent['children'] = [];
				parent['children'].push(cur);
			} else {
				res.push(cur);
			}
		});

		return res.sort(function (a, b) {
			return a._i - b._i;
		});
	}

	function toProps(state, ori) {
		var nav = state.fr_nav,
		    user = state.fr_user,
		    updateNav = state.updateNav,
		    navType,
		    curUrl = getBread.getCur(ori.route.location || state.routing.locationBeforeTransitions),
		    curNav;

		var byName = $.extend(true, {}, nav.byName),
		    renderData = rulesDataFormat(byName),
		    fix = $.extend(true, {}, byName, getBread.map);

		for (var i in fix) {
			if (fix[i].link == curUrl) {
				curNav = fix[i];
				navType = curNav.navType;
				break;
			}
		}

		if (typeof navType == 'function') navType = navType(user);

		if (navType == 'company') {
			// renderData = [];
		} else if (navType == 'sub') {
				if (curNav) renderData = byName[curNav.parent];
			} else if (navType == 'company2') {
				// renderData
			} else if (navType == 'bigdata') {} else {
					navType = 'normal';
				}
		return {
			user: user,
			navType: navType,
			renderData: renderData,
			updateNav: updateNav,
			byName: nav.byName,
			opened: nav.opened,
			loc: ori.route.location || state.routing.locationBeforeTransitions
		};
	}

	return connect(toProps)(FrameNavi);
});