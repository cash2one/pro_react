'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.util + '/env.js', paths.ex.page + '/advices/analy/event/chart.js', paths.ex.page + '/advices/analy/event/helpers.js', paths.rcn.plu + '/fecha.min.js', paths.rcn.comps + '/loader.js', paths.rcn.comps + '/tooltip.js'], function (mods, R, env, Chart, Helper, fecha, Loader, Tooltip) {
	var React = mods.ReactPack.default,
	    rmedia = R.media(),
	    ruser = R.rcn().user,
	    rest = R.ex2(),
	    RangeCal = mods.RangeCal;

	var Media = React.createClass({
		displayName: 'Media',

		getInitialState: function getInitialState() {
			var range = this.getFromTo(0);
			return {
				type: '',
				srcData: [],
				srcMidsData: {},
				srcMidsSelect: '',
				artTotal: 0,
				negTotal: 0,
				user: {},
				mediaCount: 0,
				loadEnd: false,
				loadtxt: '获取数据中......',
				loadTotal: '',
				loadStep: 0,
				isBlank: false,
				eventId: '',
				timeRange: 'today',
				from: range[0],
				to: range[0]
			};
		},
		componentWillMount: function componentWillMount() {
			var type = this.props.route.tp;
			if (type == 'event') {
				var eventId = this.props.location.query.event_id;
				this.setState({ type: type, eventId: eventId, from: '', to: '' });
			} else if (type == 'company') {
				this.setState({ type: type });
			}
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			this.setState({ loadTotal: 2 });
			ruser.read().done(function (data) {
				if (_this.state.type == 'event' && _this.state.eventId != undefined) {
					_this.getData();
					_this.setState({ user: data }, _this.getMediaCount);
				} else if (_this.state.type == 'company') {
					_this.setState({ user: data }, function () {
						_this.getData();
						_this.getMediaCount();
					});
				}
			});
		},
		getData: function getData() {
			var _this2 = this;

			var opt = {},
			    type = this.state.type,
			    id;
			if (type == 'event') {
				id = this.state.eventId;
				opt.inc = id;
			} else {
				id = this.state.user.company_uuid;
				opt.date = this.state.from + ',' + this.state.to;
			}

			rest.article.count.read('query', opt).done(function (dat) {
				if (dat.result == true) {
					if (dat.count == 0) {
						_this2.setState({
							loadEnd: true,
							isBlank: true
						});
					} else {
						var params = {};
						if (type == 'company') {
							params = {
								from: _this2.state.from,
								to: _this2.state.to
							};
						}
						rmedia.dist[type].read('category', id, params).done(function (data) {
							var artTotal = dat.count;
							_this2.setState({
								srcData: data,
								artTotal: artTotal,
								srcMidsSelect: (data[0] || {}).category,
								negTotal: Helper.zhengfu(data).negTotal,
								loadtxt: '统计数据加载完毕......',
								loadStep: _this2.state.loadStep + 1,
								isBlank: false
							}, _this2.getSrcMidsData);
						});
					}
				}
			});
		},
		getMediaCount: function getMediaCount() {
			var _this3 = this;

			var type = this.state.type,
			    opts = {};
			if (type == 'event') {
				opts['event_id'] = this.state.eventId;
			} else {
				opts.from = this.state.from;
				opts.to = this.state.to;
			}
			opts['company_uuid'] = this.state.user['company_uuid'];

			rmedia[type].read('count', opts).done(function (_ref) {
				var _ref$count = _ref.count;
				var count = _ref$count === undefined ? 0 : _ref$count;

				_this3.setState({
					mediaCount: count
				});
			});
		},
		componentDidUpdate: function componentDidUpdate() {
			var _this4 = this;

			if (this.state.loadTotal == this.state.loadStep + 1) {
				setTimeout(function () {
					_this4.setState({
						loadStep: _this4.state.loadTotal,
						loadtxt: '图表绘制完成'
					}, function () {
						setTimeout(function () {
							_this4.setState({
								loadEnd: true
							});
						}, 500);
					});
				}, 1000);
			}
		},
		getSrcMidsData: function getSrcMidsData() {
			var _this5 = this;

			var id, type;
			if (this.state.type == 'event' && this.state.eventId != undefined) {
				id = this.state.eventId;
				type = 'event';
			} else if (this.state.type == 'company') {
				id = this.state.user.company_uuid;
				type = 'company';
			}

			var src = this.state.srcMidsSelect;

			if (id) {
				rmedia.dist[type].read('media', id, {
					category: src,
					count: 20,
					from: this.state.from,
					to: this.state.to
				}).done(function (data) {
					var srcMidsData = _this5.state.srcMidsData;
					srcMidsData = $.extend({}, srcMidsData, _defineProperty({}, src, data));
					_this5.setState({ srcMidsData: srcMidsData });
				});
			}
		},
		handleSrcClick: function handleSrcClick(src) {
			this.setState({ srcMidsSelect: src }, this.getSrcMidsData);
		},
		toggleTimeRange: function toggleTimeRange(timeRange) {
			var _this6 = this;

			this.setState({ loadStep: 0, loadEnd: false });
			if (typeof timeRange == 'string') {
				var range;
				if (timeRange == 'today') range = this.getFromTo(0);else if (timeRange == 'week') range = this.getFromTo(6);else if (timeRange == 'month') range = this.getFromTo(29);

				this.setState({
					timeRange: timeRange,
					from: range[0],
					to: range[1]
				}, function () {
					_this6.getData();
					_this6.getMediaCount();
				});
			} else {
				var begin = timeRange[0],
				    end = timeRange[1];
				this.setState({
					timeRange: '',
					from: begin,
					to: end
				}, function () {
					_this6.getData();
					_this6.getMediaCount();
				});
			}
		},
		getFromTo: function getFromTo(delta) {
			var end = Date.now(),
			    begin;
			delta = delta * 24 * 3600 * 1000;
			begin = end - delta;
			return [fecha.format(new Date(begin), 'YYYY-MM-DD'), fecha.format(new Date(end), 'YYYY-MM-DD')];
		},
		jump: function jump(params) {
			if (this.state.type == 'event') {
				params.inc = this.state.eventId;
				window.location.href = paths.links.eventDetail + '?' + Object.keys(params).map(function (k) {
					return k + '=' + params[k];
				}).join('&');
			} else {
				window.location.href = paths.links.allArticles + '?' + Object.keys(params).map(function (k) {
					return k + '=' + params[k];
				}).join('&');
			}
		},
		renderZaiti: function renderZaiti() {
			var _this7 = this;

			var node,
			    data = Helper.zaiti(this.state.srcData);

			node = React.createElement(Chart.c2, { height: '415', options: data.opts, ref: function ref(r) {
					if (r) {
						r.ins().off('click');
						r.ins().on('click', function (a) {
							_this7.jump({
								product: a.name,
								date: _this7.state.from + ',' + _this7.state.to
							});
						});
					}
				} });

			return node;
		},
		renderZhengfu: function renderZhengfu() {
			var _this8 = this;

			var node;

			node = React.createElement(Chart.c2, { height: '415', options: Helper.zhengfu(this.state.srcData).opts, ref: function ref(r) {
					if (r) {
						r.ins().off('click');
						r.ins().on('click', function (a) {
							var emot = a.seriesName;
							emot = emot == '正面' ? 'positive' : emot == '中立' ? 'neutral' : emot == '负面' ? 'negative' : '';
							_this8.jump({
								product: a.name,
								emotion: emot,
								date: _this8.state.from + ',' + _this8.state.to
							});
						});
					}
				} });

			return node;
		},
		renderSrcMids: function renderSrcMids() {
			var _this9 = this;

			var node,
			    data = this.state.srcMidsData[this.state.srcMidsSelect];

			node = React.createElement(Chart.c2, { options: Helper.emot(data), height: 500, ref: function ref(r) {
					if (r) {
						r.ins().off('click');
						r.ins().on('click', function (a) {
							var emot = a.seriesName,
							    mid = '';
							emot = emot == '正面' ? 'positive' : emot == '中立' ? 'neutral' : emot == '负面' ? 'negative' : '';
							for (var i = 0; i < data.length; i++) {
								if (data[i]['mid_name'] == a.name) {
									mid = data[i]['mid'];
									break;
								}
							}

							_this9.jump({
								med: mid,
								emotion: emot,
								date: _this9.state.from + ',' + _this9.state.to,
								product: _this9.state.srcMidsSelect
							});
						});
					}
				} });

			return node;
		},
		renderLoading: function renderLoading() {
			var node;
			if (!this.state.loadEnd) {
				node = React.createElement(
					'div',
					{ className: 'advices-analy-spread-detail-load' },
					React.createElement(
						'div',
						{ className: 'wrapper' },
						React.createElement(
							'div',
							{ className: 'l' },
							React.createElement(
								'span',
								null,
								this.state.loadStep + '/' + this.state.loadTotal
							)
						),
						React.createElement(
							'div',
							{ className: 'r' },
							React.createElement(
								'section',
								{ className: 'tit' },
								'数据分析中'
							),
							React.createElement(
								'section',
								{ className: 'state' },
								this.state.loadtxt
							),
							React.createElement(
								'section',
								{ className: 'bar' },
								React.createElement('span', { className: 'inner pct50 active', style: { width: ~~(+this.state.loadStep * 100 / +this.state.loadTotal) + '%' } })
							)
						)
					)
				);
			}
			return node;
		},
		renderTip: function renderTip() {
			var node;
			// if(this.state.isBlank){
			// 	node = (
			// 		<div className="advices-analy-spread-detail-load tip">
			// 			<div className="wrapper">
			// 				<div className="l">
			// 					<span>提示</span>
			// 				</div>
			// 				<div className="r">
			// 					<section className="tit">{'暂无数据'}</section>
			// 					<section className="state">
			// 						您添加的自动标签暂时没有相关文章。您可以<a href={paths.ex.base + '/manager-tag#/tag'}>添加新的自动标签</a>或者耐心等待。
			// 					</section>
			// 				</div>
			// 			</div>
			// 		</div>
			// 	)
			// }
			if (this.state.isBlank) {
				node = React.createElement(
					'div',
					{ className: 'blank-wrap' },
					React.createElement(
						'div',
						{ className: 'list-blank-holder' },
						React.createElement(
							'span',
							null,
							'暂无文章数据'
						)
					)
				);
			}
			return node;
		},
		render: function render() {
			var _this10 = this;

			var state = this.state;
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: "advices-analy-media-v2" },
					this.state.type == 'event' ? null : React.createElement(
						'section',
						{ className: 'navi-part' },
						React.createElement(
							'ul',
							{ className: 'btns' },
							React.createElement(
								'li',
								{ onClick: function onClick() {
										return _this10.toggleTimeRange('today');
									}, className: 'item' + (state.timeRange == 'today' ? ' active' : '') },
								React.createElement(
									'span',
									null,
									'今天'
								)
							),
							React.createElement(
								'li',
								{ onClick: function onClick() {
										return _this10.toggleTimeRange('week');
									}, className: 'item' + (state.timeRange == 'week' ? ' active' : '') },
								React.createElement(
									'span',
									null,
									'近7天'
								)
							),
							React.createElement(
								'li',
								{ onClick: function onClick() {
										return _this10.toggleTimeRange('month');
									}, className: 'item' + (state.timeRange == 'month' ? ' active' : '') },
								React.createElement(
									'span',
									null,
									'近30天'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'range' },
							React.createElement(RangeCal, { className: 'c-time-range', style: { width: '210px' }, format: 'YYYY-MM-dd', onChange: function onChange(val) {
									return _this10.toggleTimeRange(val);
								}, value: [this.state.from, this.state.to], showClear: false })
						)
					),
					!this.state.isBlank && this.state.loadEnd ? React.createElement(
						'div',
						null,
						React.createElement(
							'section',
							{ className: 'data-part row mb30' },
							React.createElement(
								'div',
								{ className: 'col-xs-4' },
								React.createElement(
									'div',
									{ className: 'media-container bg1' },
									React.createElement(
										'div',
										{ className: 'val' },
										React.createElement(
											'span',
											null,
											this.state.mediaCount
										)
									),
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'媒体数'
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'col-xs-4' },
								React.createElement(
									'a',
									{ href: paths.links.allArticles + '?date=' + this.state.from + ',' + this.state.to, className: 'media-container bg3' },
									React.createElement(
										'div',
										{ className: 'val' },
										React.createElement(
											'span',
											null,
											this.state.artTotal
										)
									),
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'文章数'
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'col-xs-4' },
								React.createElement(
									'div',
									{ className: 'media-container bg4' },
									React.createElement(
										'div',
										{ className: 'val warn' },
										React.createElement(
											'span',
											null,
											(this.state.negTotal * 100 / this.state.artTotal).toFixed(2) || 0,
											'%'
										)
									),
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'负面比例'
										)
									)
								)
							)
						),
						React.createElement(
							'section',
							{ className: 'mb10' },
							React.createElement(
								'div',
								{ className: 'row' },
								React.createElement(
									'div',
									{ className: 'col-xs-6' },
									React.createElement(
										'div',
										{ className: 'panel panel-default' },
										React.createElement(
											'div',
											{ className: 'panel-heading' },
											React.createElement(
												'h3',
												{ className: 'panel-title' },
												'媒体产品类型分布'
											),
											React.createElement(Tooltip, { title: '统计周期内的文章数量按照媒体产品类型的分布图，最多允许选择5个关键字，请先取消选中的关键字。' })
										),
										React.createElement(
											'div',
											{ className: 'panel-body' },
											this.renderZaiti()
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'col-xs-6' },
									React.createElement(
										'div',
										{ className: 'panel panel-default' },
										React.createElement(
											'div',
											{ className: 'panel-heading' },
											React.createElement(
												'h3',
												{ className: 'panel-title' },
												'总体正负面分布'
											),
											React.createElement(Tooltip, { title: '统计周期内的文章按照媒体产品类型区分正面、中立、负面的文章数量分布图。' })
										),
										React.createElement(
											'div',
											{ className: 'panel-body' },
											this.renderZhengfu()
										)
									)
								)
							)
						),
						React.createElement(
							'section',
							null,
							React.createElement(
								'div',
								{ className: 'panel panel-default' },
								React.createElement(
									'div',
									{ className: 'tab' },
									React.createElement(
										'ul',
										null,
										this.state.srcData.map(function (data, idx) {
											return React.createElement(
												'li',
												{ className: data.category == _this10.state.srcMidsSelect ? ' active' : '', key: idx, onClick: function onClick() {
														return _this10.handleSrcClick(data.category);
													} },
												React.createElement(
													'span',
													{ className: 'txt' },
													data.category_name
												)
											);
										})
									),
									React.createElement(
										'div',
										{ className: 'fr pr22' },
										React.createElement(Tooltip, { title: '统计周期内该媒体产品类型下各媒体的文章按正面、中立、负面的文章数量分布图。' })
									)
								),
								React.createElement(
									'div',
									{ className: 'panel-body' },
									this.renderSrcMids()
								)
							)
						)
					) : null,
					this.renderTip()
				),
				React.createElement(Loader, { show: !this.state.loadEnd, fix: true })
			);
		}
	});

	return Media;
});