'use strict';

define(['mods', paths.rcn.util + '/rest.js'], function (mods, R) {
	var React = mods.ReactPack.default,
	    rex = R.ex(),
	    rex2 = R.ex2();

	var Item = React.createClass({
		displayName: 'Item',

		getInitialState: function getInitialState() {
			return {
				link: false
			};
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			var evId = this.props.data.id;
			rex2.article.count.read('query', { inc: evId }).done(function (_ref) {
				var count = _ref.count;

				if (count > 0) {
					_this.setState({ link: true });
				}
			});
		},
		render: function render() {
			var dat = this.props.data;
			var detail = dat.detail.length > 30 ? dat.detail.slice(0, 30) + '...' : dat.detail;
			var hasData = !!this.state.link;
			return React.createElement(
				'li',
				{ className: 'col-xs-3' },
				React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(
						'div',
						{ className: 'top' },
						React.createElement(
							'div',
							null,
							React.createElement(
								'span',
								{ className: 'title', title: dat.title },
								dat.title
							),
							React.createElement(
								'span',
								{ className: "rank rank" + dat.rank },
								dat.rank == 4 ? '普通' : '一二三'.charAt(dat.rank - 1) + '级'
							)
						),
						React.createElement(
							'p',
							{ className: 'desc', title: dat.detail },
							detail
						)
					),
					React.createElement(
						'div',
						{ className: 'btns' },
						hasData ? React.createElement(
							'a',
							{ href: '/analy#/event/vein?event_id=' + dat.id, className: 'btn btn-xs btn-default link' },
							React.createElement('span', { className: 'iconfont icon-wechaticon11' }),
							React.createElement(
								'span',
								null,
								'查看分析'
							)
						) : React.createElement(
							'button',
							{ className: 'btn btn-default btn-xs', disabled: 'true' },
							React.createElement('span', { className: 'iconfont icon-wechaticon11' }),
							React.createElement(
								'span',
								null,
								'暂无数据'
							)
						)
					)
				)
			);
		}
	});

	var Event = React.createClass({
		displayName: 'Event',

		getInitialState: function getInitialState() {
			return {
				list: []
			};
		},
		componentDidMount: function componentDidMount() {
			var _this2 = this;

			rex.events.read().done(function (data) {
				_this2.setState({ list: data });
			});
		},
		renderList1: function renderList1() {
			var data = this.state.list.filter(function (list) {
				return list.status == 1;
			}),
			    node;

			if (data.length > 0) {
				node = this.renderList(data);
			} else {
				node = React.createElement(
					'li',
					{ className: 'list-blank-holder' },
					'暂无事件'
				);
			}

			return node;
		},
		renderList2: function renderList2() {
			var data = this.state.list.filter(function (list) {
				return list.status == 0;
			}),
			    node;

			if (data.length > 0) {
				node = this.renderList(data);
			} else {
				node = React.createElement(
					'li',
					{ className: 'list-blank-holder' },
					'暂无事件'
				);
			}

			return node;
		},
		renderList: function renderList(data) {
			var node = data.map(function (dat, idx) {
				return React.createElement(Item, { data: dat, key: idx });
			});
			return node;
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'advices-analy-event-v2' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'事件分析'
							),
							React.createElement(
								'div',
								null,
								React.createElement(
									'a',
									{ href: '/base#/event/operator', className: 'btn btn-primary' },
									'管理事件'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'event-group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement('span', { className: 'iconfont icon-jinxingzhong list1' }),
								React.createElement(
									'span',
									{ className: 'txt' },
									'进行中的事件'
								)
							),
							React.createElement(
								'ul',
								{ className: 'group-body row' },
								this.renderList1()
							)
						),
						React.createElement(
							'div',
							{ className: 'event-group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement('span', { className: 'iconfont icon-lishijilu list2' }),
								React.createElement(
									'span',
									{ className: 'txt' },
									'历史事件'
								)
							),
							React.createElement(
								'ul',
								{ className: 'group-body row' },
								this.renderList2()
							)
						)
					)
				)
			);
		}
	});

	return Event;
});