'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.ex.page + '/advices/analy/spread/bar.js', paths.ex.page + '/advices/analy/spread/scatter.js', paths.ex.page + '/advices/analy/spread/pie.js', paths.ex.page + '/advices/analy/spread/force.js', paths.ex.page + '/advices/analy/spread/bar-distributed.js', paths.ex.page + '/advices/analy/spread/fakeData.js'], function (mods, Bar, Scatter, Pie, Force, BarDis, fake) {
	var React = mods.ReactPack.default;

	// var rest = r.spread(),
	// 	user = r.rcn().user;

	// rest.company.add('stat');
	// rest.event.add('stat');

	function get(count) {
		var res = [];
		while (count--) {
			var rand = 10;
			res.push({
				name: count + '',
				value: rand,
				symbolSize: rand
			});
		}

		return res;
	}

	function getL(count) {
		var res = [],
		    total = count;
		while (count--) {
			res.push({
				source: parseInt(Math.random() * total),
				target: parseInt(Math.random() * total),

				lineStyle: {
					normal: {
						// type: 'dashed',
						curveness: 0.4
					}
				}
			});
		}
		return res;
	}

	function getData(count) {
		var res = {};
		res.data = get(count).map(function (dat, i) {
			if (i < 100) {
				dat['category'] = '1';
			} else if (i < 150) dat['category'] = '2';else dat['category'] = '3';
			return dat;
		});
		res.links = getL(count);
		return res;
	}

	var data = getData(50);

	function draw() {
		var myChart = echarts.init(document.getElementById('chart'));

		// 指定图表的配置项和数据
		var option = {
			legend: {
				data: ['1', '2', '3']
			},
			series: [{
				name: '销量2',
				type: 'graph',
				layout: 'force',
				roam: true,
				// force: {
				// 	edgeLength: 100
				// },
				categories: [{ name: '1' }, { name: '2' }, { name: '3' }],
				data: data.data,
				links: data.links,
				lineStyle: {
					normal: {
						curveness: .5
					}
				}
			}]
		};

		// 使用刚指定的配置项和数据显示图表。
		myChart.setOption(option);
	}

	var env = {
		debug: true,
		color: ['#ffcd67', '#ca9a65', '#ff9a65', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3']
	};

	var Detail = React.createClass({
		displayName: 'Detail',

		getInitialState: function getInitialState() {
			var _ref;

			return _ref = {
				user: {},
				pieData: {},
				legend: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
				rout: {
					nodes: [],
					edges: []
				},
				data: {}
			}, _defineProperty(_ref, 'legend', []), _defineProperty(_ref, 'loadEnd', false), _defineProperty(_ref, 'loadtxt', '获取数据中......'), _defineProperty(_ref, 'loadTotal', ''), _defineProperty(_ref, 'loadStep', 0), _defineProperty(_ref, 'isBlank', false), _defineProperty(_ref, 'type', ''), _defineProperty(_ref, 'tipTitle', null), _defineProperty(_ref, 'tipDesc', null), _ref;
		},
		formatPieData: function formatPieData(data) {},
		componentWillMount: function componentWillMount() {
			var type = this.props.tp;
			if (type == 'event') {
				var eventId = this.props.eventId;
				this.setState({ eventId: eventId });
			}
			this.setState({ type: type });

			var _this = this;
			var rest = this.rest = new $.RestClient(paths.ex.api + '/api/v1/spread/', {
				stripTrailingSlash: true,
				ajax: {
					beforeSend: function beforeSend(xhr) {
						xhr.setRequestHeader('user_token', _this.props.userToken);
					}
				}
			});
			rest.add('article');
			rest.add('company');
			rest.add('event');
			rest.add('rout');
			rest.company.add('stat');
			rest.event.add('stat');
		},
		componentDidMount: function componentDidMount() {
			// if(this.state.type == 'event'){
			// 	this.setState({loadTotal: 3});
			// 	this.getRoute();
			// } else {
			// 	user.read().done(user => {
			// 		this.setState({loadTotal: 3});
			// 		this.getRoute(user);
			// 		// this.getDetail(user);
			// 	})
			// }
			this.setState({ loadTotal: 3 });
			this.getRoute();
		},
		componentDidUpdate: function componentDidUpdate() {
			var _this2 = this;

			if (this.state.loadTotal == this.state.loadStep + 1) {
				setTimeout(function () {
					_this2.setState({
						loadStep: _this2.state.loadTotal,
						loadtxt: '图表绘制完成'
					}, function () {
						setTimeout(function () {
							_this2.setState({
								loadEnd: true
							});
						}, 500);
					});
				}, 1000);
			}
		},
		getRoute: function getRoute(user) {
			var _this3 = this;

			var nodes = {},
			    edges = [],
			    lv = 0,
			    lvlimit = 6,
			    type = this.props.tp;
			if (type == 'company') lvlimit = 2;else if (type == 'event') lvlimit = 100;
			var handleEdges = function handleEdges(data, lv) {
				data.forEach(function (dat) {
					dat.to.$lv = lv;
					nodes[dat.to.uuid] = dat.to;
					if (lv > 1) {
						edges.push({
							'source': dat.from.uuid,
							'target': dat.to.uuid
						});

						// console.log(dat);
						var $count = nodes[dat.from.uuid].$count;
						if (!$count) {
							nodes[dat.from.uuid].$count = 1;
						} else {
							nodes[dat.from.uuid].$count++;
						}
					}
				});
				// console.log(lv, nodes, edges);
			};
			var get = function get(uuids) {
				var f = uuids || [];
				lv++;
				var handler = function handler(data) {
					handleEdges(data, lv);
					if (lv < lvlimit && data.length > 0) {
						get(data.map(function (dat) {
							return dat.to.uuid;
						}));
					} else {
						// if(lv == 1 && data.length == 0){
						// 	this.setState({
						// 		loadEnd: true,
						// 		isBlank: true
						// 	});
						// } else {
						_this3.setState({
							rout: {
								nodes: nodes,
								edges: edges
							},
							loadtxt: '传播分析数据加载完毕......',
							loadStep: _this3.state.loadStep + 1
						});
						_this3.getDetail(user);
						// }
					}
				};
				if (type == 'event') {
					var evid = _this3.state.eventId;
					_this3.rest.rout.create({
						event: evid,
						from: f
					}).done(handler);
				} else {
					_this3.rest.rout.create({
						company: _this3.props.companyId,
						from: f
					}).done(handler);
				}
			};
			get();
		},
		getDetail: function getDetail(user) {
			var _this4 = this;

			var type = this.props.tp;
			var handler = function handler(data) {
				if (data.articles == 0) {
					if (type == 'company') {
						_this4.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前公司文章中没有发生传播关系。'
						});
					} else if (type == 'event') {
						_this4.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无文章数据',
							tipDesc: '当前事件中没有文章。'
						});
					}
				} else if (data.reships == 0) {
					if (type == 'company') {
						_this4.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前公司文章中没有发生传播关系。'
						});
					} else if (type == 'event') {
						_this4.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前事件文章中没有发生传播关系。'
						});
					}
				} else {
					_this4.setState({ data: data, loadtxt: '图表数据加载完毕......', loadStep: _this4.state.loadStep + 1 });
				}
			};
			if (type == 'event') {
				var evid = this.state.eventId;
				this.rest.event.stat.read(evid).done(function (_ref2) {
					var data = _ref2.data;
					return handler(data);
				});
			} else {
				this.rest.company.stat.read(this.props.companyId).done(function (_ref3) {
					var data = _ref3.data;
					return handler(data);
				});
			}
		},
		formatTime: function formatTime(time) {
			var min = 60,
			    hour = 60 * 60,
			    day = 60 * 60 * 24,
			    res;
			if (time < min) res = time + '秒';else if (time < hour) res = Math.floor(time / min) + '分钟' + (time % min ? time % min + '秒' : '');else if (time >= hour && time < day * 3) res = Math.floor(time / hour) + '小时' + (time % hour / min ? (time % hour / min).toFixed(1) + '分钟' : '');else if (time >= day * 3) res = Math.floor(time / day) + '天' + (time % day / hour ? (time % day / hour).toFixed(1) + '小时' : '');
			return res;
		},
		renderZaiti: function renderZaiti() {
			var _this5 = this;

			var data = (this.state.data.mid_distributed || []).map(function (dat) {
				return { value: dat.articles, name: dat.mid_cate, itemStyle: { normal: { color: env.color[_this5.state.legend.indexOf(dat.mid_cate)] } } };
			});

			var node = React.createElement(Pie, {
				title: '文章载体分布',
				options: { data: data, legendData: this.state.legend }
			});
			return node;
		},
		renderCengji: function renderCengji() {
			var data = (this.state.data.level_distributed || []).map(function (d, i) {
				return {
					value: d
				};
			}),
			    xAxis = data.map(function (dat, i) {
				return '第' + (i + 1) + '层级';
			});

			var node = React.createElement(Bar, {
				title: '媒体层级分布',
				options: { xAxis: xAxis, data: data },
				color: ['#ff9963']
			});

			return node;
		},
		renderZhuanfa: function renderZhuanfa() {
			var data = (this.state.data.mid_reship_distributed || []).sort(function (a, b) {
				return b.reships - a.reships;
			}),
			    xAxis = [],
			    dat = [];
			data.forEach(function (d) {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.reships || 0);
			});
			var node = React.createElement(BarDis, {
				title: '媒体被转发数量分布',
				height: 500,
				options: {
					xAxis: xAxis,
					yAxisName: '转发数',
					data: dat
				}, color: env.color });

			return node;
		},
		renderSudu: function renderSudu() {
			var _this6 = this;

			var data = (this.state.data.spread_time_distributed || []).sort(function (a, b) {
				return a.time - b.time;
			}),
			    xAxis = [],
			    dat = [];

			data.forEach(function (d) {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.time || 0);
			});
			var node = React.createElement(BarDis, {
				title: '媒体转发速度分布',
				height: 500,
				options: {
					xAxis: xAxis,
					yAxisName: '转发速度',
					yAxisFormatter: '{value} 秒',
					data: dat,
					tooltipFormatter: function tooltipFormatter(params) {
						if (params instanceof Array) {
							var tar = params[0];
							return tar.name + ': ' + _this6.formatTime(tar.value);
						} else if (params instanceof Object) {
							return params.name + ': ' + _this6.formatTime(params.value);
						}
					}
				}, color: env.color });

			return node;
		},
		renderWenzhang: function renderWenzhang() {
			var data = (this.state.data.mid_article_distributed || []).sort(function (a, b) {
				return b.articles - a.articles;
			}),
			    xAxis = [],
			    dat = [];

			data.forEach(function (d) {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.articles || 0);
			});
			var node = React.createElement(BarDis, {
				title: '媒体文章数分布',
				height: 500,
				options: {
					xAxis: xAxis,
					yAxisName: '文章数',
					data: dat
				}, color: env.color });
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
			if (this.state.isBlank) {
				node = React.createElement(
					'div',
					{ className: 'advices-analy-spread-detail-load tip' },
					React.createElement(
						'div',
						{ className: 'wrapper' },
						React.createElement(
							'div',
							{ className: 'l' },
							React.createElement(
								'span',
								null,
								'提示'
							)
						),
						React.createElement(
							'div',
							{ className: 'r' },
							React.createElement(
								'section',
								{ className: 'tit' },
								this.state.tipTitle || '暂无数据'
							),
							React.createElement(
								'section',
								{ className: 'state' },
								this.state.tipDesc ? this.state.tipDesc : React.createElement(
									'span',
									null,
									'您添加的自动标签暂时没有相关文章。您可以',
									React.createElement(
										'a',
										{ href: paths.ex.base + '/manager#/tag' },
										'添加新的自动标签'
									),
									'或者耐心等待。'
								)
							)
						)
					)
				);
			}
			return node;
		},
		render: function render() {
			var _this7 = this;

			var renderSpreadTime = function renderSpreadTime() {
				var time = _this7.formatTime(_this7.state.data.spread_length) || '',
				    fs = time.length >= 8 ? '18px' : '20px';
				var node = React.createElement(
					'span',
					{ style: { fontSize: fs } },
					time
				);
				return node;
			};
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: "advices-analy-spread-detail" + (this.state.loadEnd && !this.state.isBlank ? '' : ' loading') },
					React.createElement(
						'div',
						{ className: 'hd' },
						React.createElement(
							'span',
							{ className: 'tit' },
							this.state.type == 'event' ? '数据说明：分析数据基于被转发数不小于1的事件文章集合。' : '数据说明：分析数据基于被转发数不小于1且被转发次数排名前200名的文章集合。'
						)
					),
					React.createElement(
						'div',
						{ className: 'bd' },
						React.createElement(
							'div',
							{ className: 'mb30 data-part' },
							React.createElement(
								'div',
								{ className: 'item' },
								React.createElement(
									'div',
									{ className: 'spread-data-container' },
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'文章数'
										)
									),
									React.createElement(
										'div',
										{ className: 'val' },
										React.createElement(
											'span',
											null,
											this.state.data.articles
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'item' },
								React.createElement(
									'div',
									{ className: 'spread-data-container' },
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'转载数'
										)
									),
									React.createElement(
										'div',
										{ className: 'val' },
										React.createElement(
											'span',
											null,
											this.state.data.reships
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'item' },
								React.createElement(
									'div',
									{ className: 'spread-data-container' },
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'媒体数'
										)
									),
									React.createElement(
										'div',
										{ className: 'val' },
										React.createElement(
											'span',
											null,
											this.state.data.mids
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'item' },
								React.createElement(
									'div',
									{ className: 'spread-data-container' },
									React.createElement(
										'div',
										{ className: 'key' },
										React.createElement(
											'span',
											null,
											'总传播时间'
										)
									),
									React.createElement(
										'div',
										{ className: 'val' },
										renderSpreadTime()
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'mb30 grid2' },
							React.createElement(
								'div',
								{ className: 'item-l' },
								this.renderZaiti()
							),
							React.createElement(
								'div',
								{ className: 'item-r' },
								this.renderCengji()
							)
						),
						React.createElement(
							'div',
							{ className: 'mb30' },
							this.renderZhuanfa()
						),
						React.createElement(
							'div',
							{ className: 'mb30' },
							this.renderSudu()
						),
						React.createElement(
							'div',
							{ className: 'mb30' },
							this.renderWenzhang()
						)
					)
				),
				this.renderLoading(),
				this.renderTip()
			);
		}
	});

	return Detail;
});