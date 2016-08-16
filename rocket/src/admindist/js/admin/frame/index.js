'use strict';

define(['mods', paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var connect = mods.ReactReduxPack.connect;


	var Frame = React.createClass({
		displayName: 'Frame',

		getInitialState: function getInitialState() {
			return {
				avatar: '',
				name: ''
			};
		},
		componentDidMount: function componentDidMount() {
			this.getUser();
		},
		getUser: function getUser() {
			var _this = this;

			rest.user.read().done(function (data) {
				_this.setState({ avatar: data.avatar, name: data.name });
			});
		},
		logOut: function logOut() {
			var opt = {
				token: $.cookie('user_token')
			};
			rest.user.create("logout", opt).done(function () {
				$.removeCookie('user_token', { domain: paths.rcn.domain });
				if (data.role_group === 'role_admin') {
					var url = paths.rcn.api + '/login';
				}
				window.location.href = url;
			});
		},
		navStyle: function navStyle(e) {
			$('.item a').removeClass('active');
			e.target.className = 'active';
		},
		render: function render() {
			var _this2 = this;

			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'frame-header' },
					React.createElement(
						'div',
						{ className: 'frame-header-left' },
						React.createElement('img', { src: paths.rcn.base + "/img/logo.png", alt: '', width: '32', height: '41' }),
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
							{ className: 'operations' },
							React.createElement(
								'div',
								{ className: 'item' },
								React.createElement(
									'div',
									{ className: 'inner', onClick: this.logOut },
									React.createElement(
										'span',
										null,
										'注销'
									),
									React.createElement('span', { className: 'iconfont icon-tuichu' })
								)
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'frame-body' },
					React.createElement(
						'div',
						{ className: 'frame-body-left' },
						React.createElement(
							'div',
							{ className: 'navi-part' },
							React.createElement(
								'div',
								{ className: 'fr-nav-company' },
								React.createElement(
									'span',
									{ className: 'name' },
									React.createElement(
										'span',
										null,
										'系统管理'
									)
								)
							),
							React.createElement(
								'ul',
								{ className: 'navi-container admin-navi' },
								React.createElement(
									'li',
									{ className: 'item' },
									React.createElement(
										'a',
										{ href: paths.rcn.api + "/manager#/syndicate", onClick: function onClick(e) {
												return _this2.navStyle(e);
											} },
										React.createElement(
											'span',
											{ className: 'text' },
											'集团管理'
										)
									)
								),
								React.createElement(
									'li',
									{ className: 'item' },
									React.createElement(
										'a',
										{ href: paths.rcn.api + "/manager#/super", className: 'active', onClick: function onClick(e) {
												return _this2.navStyle(e);
											} },
										React.createElement(
											'span',
											{ className: 'text' },
											'超级运营员管理'
										)
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'frame-body-right' },
						React.createElement(
							'div',
							{ className: 'frame-body-container' },
							this.props.children
						)
					)
				)
			);
		}
	});

	return Frame;
});