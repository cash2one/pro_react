'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/frame/bread-map.js', paths.rcn.plu + '/fecha.min.js'], function (mods, rest, getBread, fecha) {
	var rest = rest.rcn({ stringifyData: false });
	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;


	var fixmap = {
		'rule_gm_manager_company': {
			name: 'rule_gm_manager_company',
			link: 'http://home.puzhizhuhai.com/manager#/company',
			navType: 'company'
		},
		// title: '企业首页'
		'rule_ac_manager_manager_v2': {
			name: 'rule_ac_manager_manager_v2',
			link: 'http://home.puzhizhuhai.com/manager#/allmgr',
			navType: 'company'
		},
		// title: '企业首页'
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
	};

	var FrameHead = React.createClass({
		displayName: 'FrameHead',

		/**
   * [logOut description]
   * @return
   */
		logOut: function logOut() {
			rest.user.read().done(function (data) {
				var opt = {
					token: $.cookie('user_token')
				};
				rest.user.create("logout", opt).done(function () {
					$.removeCookie('user_token', { domain: paths.rcn.domain, path: "/" });
					$.removeCookie('md5', { domain: paths.rcn.domain, path: "/" });
					if (data.role_group === 'role_super_manager') {
						var url = paths.rcn.web + '/super';
					} else {
						url = paths.rcn.web + '/login';
					}
					window.location.href = url;
				});
			});
		},
		resetTitle: function resetTitle(bread) {
			var tit = ['深圳普智'].concat(_toConsumableArray(bread.map(function (b) {
				return b.title;
			}))).join(' - ');
			document.title = tit;
		},
		parseUrl: function parseUrl() {
			var data = $.extend(true, {}, this.props.routemap, getBread.map),
			    rloc = this.props.routeState.location;
			var wloc = window.location;
			var curUrl = wloc.pathname,
			    cur,
			    res = [];

			if (rloc) {
				curUrl = curUrl + '#' + rloc.pathname;
			}

			for (var name in data) {
				if (data[name].link == curUrl) {
					cur = data[name];
					break;
				}
			}

			while (cur) {
				res.unshift(cur);
				var p = data[cur.parent];
				if (p && p.name.indexOf('_group') != -1) {
					p = data[p.parent];
				}
				cur = p;
			}

			return res;
		},
		renderBread: function renderBread() {
			var path,
			    state = this.props.routeState.location,
			    bread,
			    first;
			if (state) path = state.pathname;
			// bread = getBread(path);
			first = this.props.user.company ? { title: this.props.user.company } : null;
			bread = this.parseUrl() || [];
			if (bread.length && bread[0].breadType != 'company') {
				bread = [].concat(_toConsumableArray(bread));
				if (first) bread.unshift(first);
			} else if (bread.length && bread[0].breadType == 'company' && this.props.user.role_group != 'role_super_manager') bread[0].title = '企业首页';

			this.resetTitle(bread);
			return bread.map(function (b, idx) {
				return React.createElement(
					'a',
					{ className: 'fr-bread-item', key: idx },
					b.title
				);
			});
		},
		handlerHeadClick: function handlerHeadClick() {
			var tar = $(this.refs.user);
			if (!tar.hasClass('active')) {
				tar.addClass('active');
				$(document).one('click', function () {
					tar.removeClass('active');
				});
			}
		},
		refresh: function refresh() {
			rest.user.update('cur_time_updating').done(function (data) {
				if (data.result) window.location.reload();
			});
		},
		getUpdateTime: function getUpdateTime() {
			var str = this.props.user.update_at || '';
			str = (str.split(' ')[1] || '').match(/(?:\d+\:\d+)/) || [];
			return str[0] || '';
		},
		render: function render() {
			var user = this.props.user;

			return React.createElement(
				'div',
				{ className: 'frame-header-v2' },
				React.createElement(
					'div',
					{ className: 'frame-header-left' },
					React.createElement('img', { src: paths.rcn.base + "/img/logo2.png", width: '40', height: '40' }),
					React.createElement(
						'span',
						{ className: 'text' },
						'深圳普智'
					)
				),
				React.createElement(
					'div',
					{ className: 'frame-header-right' },
					React.createElement(
						'div',
						{ className: 'back-btn', onClick: function onClick() {
								return window.history.go(-1);
							} },
						React.createElement('span', { className: 'iconfont icon-fanhui' })
					),
					React.createElement(
						'div',
						{ className: 'fr-bread' },
						this.renderBread()
					),
					React.createElement(
						'div',
						{ className: 'operations' },
						React.createElement(
							'div',
							{ className: 'download dn' },
							React.createElement(
								'div',
								{ className: 'holder' },
								React.createElement(
									'span',
									null,
									'App下载'
								)
							),
							React.createElement('div', { className: 'img' })
						),
						React.createElement(
							'div',
							{ className: 'refresh' },
							React.createElement(
								'div',
								{ className: 'time' },
								React.createElement(
									'span',
									null,
									'截止 '
								),
								React.createElement(
									'span',
									{ id: 'sys_time', 'data-time': user.update_at },
									this.getUpdateTime()
								)
							),
							React.createElement(
								'div',
								{ className: 'button', onClick: this.refresh },
								React.createElement('span', { className: 'iconfont icon-shuaxin' })
							)
						),
						React.createElement(
							'div',
							{ className: 'user', onClick: this.handlerHeadClick, ref: 'user' },
							React.createElement(
								'div',
								{ className: 'holder' },
								user.avatar ? React.createElement('img', { id: 'fr_user_pic', src: paths.rcn.base + user.avatar, alt: '' }) : null,
								React.createElement(
									'span',
									{ id: 'fr_user_name', className: 'txt' },
									user.name
								),
								React.createElement('span', { className: 'iconfont icon-xiala ico' })
							),
							React.createElement(
								'ul',
								{ className: 'menu' },
								React.createElement(
									'li',
									null,
									React.createElement(
										'a',
										{ href: paths.rcn.web + '/setting/personal' },
										React.createElement('span', { className: 'ico iconfont icon-zhanghu' }),
										React.createElement(
											'span',
											{ className: 'txt' },
											'个人设置'
										)
									)
								),
								React.createElement(
									'li',
									null,
									React.createElement(
										'a',
										{ href: paths.rcn.web + '/feedback#/problem' },
										React.createElement('span', { className: 'ico iconfont icon-fankui' }),
										React.createElement(
											'span',
											{ className: 'txt' },
											'用户反馈'
										)
									)
								),
								React.createElement(
									'li',
									null,
									React.createElement(
										'a',
										{ href: 'javascript:void(0);', onClick: this.logOut },
										React.createElement('span', { className: 'ico iconfont icon-tuichu' }),
										React.createElement(
											'span',
											{ className: 'txt' },
											'退出账户'
										)
									)
								)
							)
						)
					)
				)
			);
		}
	});

	return FrameHead;
});