'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.plu + '/fecha.min.js', paths.ex.util + '/parse.js'], function (mods, R, fecha, util) {
	var React = mods.ReactPack.default,
	    rest = R.ex(),
	    rest2 = R.ex2();

	var params = {
		sort: 'publish_at_desc',
		m: 5
	};

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parse(str, num) {
		num = num || 100;
		if (str.length > num) str = str.substr(0, num) + '...';
		return str;
	}

	function parseTag(str) {
		str = (str || '').replace(reg, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return str;
	}

	var Vein = React.createClass({
		displayName: 'Vein',

		getInitialState: function getInitialState() {
			return {
				evId: null,
				begin: 0,
				end: false,
				loading: false,
				loadbtn: false,
				evDetail: '',
				list: []
			};
		},
		componentWillMount: function componentWillMount() {
			var evId = this.props.location.query.event_id;
			if (evId != undefined) this.setState({ evId: evId });
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			var evId = this.state.evId;
			if (evId != undefined) {
				rest.event.read('detail', {
					event_id: evId
				}).done(function (data) {
					_this.setState({
						evDetail: data.detail
					});
				});
				this.getListData(0);
			}
		},
		getListData: function getListData(begin) {
			var _this2 = this;

			var evId = this.state.evId;
			if (evId != undefined) {
				// rest.articles.read($.extend({}, params, {
				// 	begin,
				// 	event_id: evId
				// })).done(data => {
				// 	this.handlerData(data, begin);
				// 	if(data.length == params.limit)
				// 		this.setState({loadbtn: true})
				// })

				rest2.article.data.read('query', $.extend({}, params, {
					beg: begin,
					inc: evId
				})).done(function (data) {
					if (data.result) {
						data = data.data;
						_this2.handlerData(data, begin);
						if (data.length == params.m) _this2.setState({ loadbtn: true });
					}
				});
			}
		},
		loadMore: function loadMore() {
			var _this3 = this;

			var end = this.state.end,
			    begin = this.state.begin + params.m,
			    evId = this.state.evId;
			if (!end) {
				this.setState({ loading: true });
				rest2.article.data.read('query', $.extend({}, params, {
					beg: begin,
					inc: evId
				})).done(function (data) {
					_this3.setState({ loading: false });
					if (data.result == true) {
						_this3.setState({ latestArts: data.data });
						_this3.handlerData(data.data, begin);
					}
				});
			}
		},
		handlerData: function handlerData(data, begin) {
			if (data.length > 0) {
				this.setState({ list: [].concat(_toConsumableArray(this.state.list), _toConsumableArray(data)), begin: begin });
			} else {
				this.setState({ end: true });
			}
		},
		getTitle: function getTitle(title, content) {
			if (title.length == 0) title = util.parseTag(content);
			title = util.parseTag(title);

			return util.limit(title, 25);
		},
		getContent: function getContent(str) {
			str = util.parseTag(str);
			return util.limit(str);
		},
		formatTime: function formatTime(time_str) {
			var now = Date.now(),
			    time = fecha.parse($.trim(time_str), 'YYYY-MM-DD HH:mm:ss').getTime(),
			    delta = now - time,
			    min = 1000 * 60,
			    hour = min * 60,
			    day = hour * 24;
			if (delta < min) {
				// 1分钟以内
				return '刚刚';
			} else if (delta < hour) {
				// 1小时以内
				return parseInt(delta / min) + '分钟前';
			} else if (delta < day) {
				// 1天以内
				return parseInt(delta / hour) + '小时前';
			} else {
				// 大于1天
				return (time_str || '').replace(/\:\d+$/, '');
			}
		},
		render: function render() {
			var _this4 = this;

			return React.createElement(
				'div',
				{ className: 'advices-analy-event-vein-v2' },
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
								'事件概况'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'p',
								{ className: 'desc' },
								$.trim(this.state.evDetail).length > 0 ? this.state.evDetail : '暂无事件描述'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'事件脉络'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'section',
								{ className: 'vein-part' },
								React.createElement(
									'ul',
									{ className: 'lists' },
									this.state.list.map(function (item) {
										return React.createElement(
											'li',
											{ className: 'item' },
											React.createElement(
												'div',
												{ className: 'grid1' },
												React.createElement(
													'span',
													null,
													_this4.formatTime(item.publish_at)
												)
											),
											React.createElement(
												'div',
												{ className: 'grid2' },
												React.createElement(
													'span',
													{ className: 'inner' },
													item.from.media
												)
											),
											React.createElement(
												'div',
												{ className: 'grid3' },
												React.createElement(
													'div',
													{ className: 'title' },
													React.createElement(
														'a',
														{ href: paths.ex.base + '/base#/article?uuid=' + item.uuid, target: '_blank' },
														_this4.getTitle(item.title, item.content)
													)
												),
												React.createElement(
													'p',
													{ className: 'desc' },
													_this4.getContent(item.content)
												)
											)
										);
									})
								),
								this.state.loadbtn ? React.createElement(
									'div',
									{ className: 'loadmore' },
									React.createElement(
										'span',
										{ className: 'btn btn-primary', disabled: this.state.loading || this.state.end, onClick: function onClick() {
												return _this4.state.loading ? null : _this4.loadMore();
											} },
										this.state.loading ? '加载中' : this.state.end ? '没有更多' : '加载更多'
									)
								) : null
							)
						)
					)
				)
			);
		}
	});

	return Vein;
});