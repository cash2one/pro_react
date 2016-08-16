'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/analy/profile/parse.js', paths.ex.page + '/advices/analy/event/chart.js', paths.rcn.plu + '/fecha.min.js', paths.ex.page + '/advices/analy/profile2/helper.js', 'echarts', paths.rcn.comps + '/tooltip.js'], function (mods, R, Parse, Chart, fecha, Helper, echarts, Tooltip) {
	var React = mods.ReactPack.default;

	var rest = R.ex();
	rest.user.add('tags');
	var restArt = R.article();
	var rest2 = R.ex2();

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str) {
		str = (str || '').replace(reg, '');
		return str;
	}

	var emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'negative': '负面'
	};

	var now = +new Date(1997, 9, 3);

	function randomData() {

		var oneDay = 24 * 3600 * 1000;
		var value = Math.random() * 1000;
		now = new Date(+now + oneDay);
		value = value + Math.random() * 21 - 10;
		return [[now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'), Math.round(value)];
	}

	function gen(count) {
		var data = [];
		for (var i = 0; i < count; i++) {
			data.push(randomData());
		}
		return data;
	}

	// var data = gen(50)

	var ArtChart = React.createClass({
		displayName: 'ArtChart',
		getInitialState: function getInitialState() {
			return {
				mids: [],
				data: {},
				timeRange: 'today',
				disabledTimeRange: []
			};
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			rest.media.read('top').done(function (data) {
				_this.setState({ mids: data }, function () {
					_this.getData('today');
					_this.getData('last_month');
					_this.getData('last_week');
				});
			});
		},
		getData: function getData(time) {
			var _this2 = this;

			var chart = this.refs.chart.ins();
			chart.showLoading();
			var mids = this.state.mids,
			    arr,
			    res = [],
			    time = time || this.state.timeRange,
			    params = {
				from: undefined,
				to: undefined
			},
			    delta_day = 1000 * 3600 * 24,
			    delta_month = 29 * delta_day,
			    delta_week = 6 * delta_day;
			if (time == 'last_week') params.from = fecha.format(new Date(Date.now() - delta_week), 'YYYY-MM-DD');else if (time == 'last_month') params.from = fecha.format(new Date(Date.now() - delta_month), 'YYYY-MM-DD');

			rest.article.read('productform', params).done(function (data) {
				chart.hideLoading();
				data = Object.keys(data).map(function (key) {
					return {
						data: data[key],
						mid_name: key
					};
				});
				_this2.setState({ data: _extends({}, _this2.state.data, _defineProperty({}, time, {
						data: data,
						at: Date.now()
					})) });
			});
		},
		getOpts: function getOpts() {
			var data = this.state.data,
			    timeRange = this.state.timeRange,
			    series = [],
			    xData = [],
			    legendData = [],
			    opts = {
				title: {
					left: 22,
					textStyle: {
						color: '#000',
						fontSize: 14
					}
				},
				toolbox: {
					itemSize: 20,
					right: 0,
					feature: {
						saveAsImage: {
							icon: 'image:///img/chart-download.png',
							title: '下载'
						}
					},
					iconStyle: {
						emphasis: {
							color: '#2c97de'
						}
					}
				},
				grid: {
					show: true,
					left: 22,
					right: 22,
					bottom: 0,
					containLabel: true,
					borderColor: '#eee',
					shadowColor: '#eee'
				},
				legend: {
					x: 'center',
					top: 5,
					textStyle: {
						color: '#999',
						fontSize: 12
					}
				},
				tooltip: {
					trigger: 'axis'
				},
				color: ['#3a99d8', '#2dbd9b', '#70ca63', '#f6bb42', '#f88b37', '#e9573f', '#3bafda', '#3c71dd', '#5866e6', '#967adc', '#d73ab8', '#ec3880'],
				xAxis: {
					boundaryGap: false,
					axisLine: {
						lineStyle: {
							color: '#eee'
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						lineStyle: {
							color: '#eee'
						}
					},
					axisLabel: {
						textStyle: {
							color: '#999'
						},
						formatter: function formatter(value, index) {
							var date = new Date(value);
							if (value) {
								if (index === 0) {
									return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
								} else {
									return date.getMonth() + 1 + '月' + date.getDate() + '日';
								}
							}
						}
					}
				},
				yAxis: {
					type: 'value',
					axisLine: {
						lineStyle: {
							color: '#eee'
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						lineStyle: {
							color: '#eee'
						}
					},
					axisLabel: {
						textStyle: {
							color: '#ccc'
						}
					}
				},
				// series: chartData
				animation: false
			};
			data = data[timeRange];

			if (data) {
				data = data.data;
				if (data.length == 0) return opts;
				data.forEach(function (dat) {
					legendData.push(dat.mid_name);
					series.push({
						smooth: true,
						name: dat.mid_name,
						type: 'line',
						data: dat.data.map(function (item) {
							return item.value;
						}),
						areaStyle: {
							normal: {
								opacity: 0.2
							}
						}
					});
				});
				opts.series = series;
				opts.legend.data = legendData;

				if (timeRange == 'today') {
					opts.xAxis.axisLabel = {
						interval: 3
					};
					xData = data[0].data.map(function (item) {
						return ((item.date || '').split(' ')[1] || '').replace(/\:\d+$/, '');
					});
				} else {
					xData = data[0].data.map(function (item) {
						return (item.date || '').replace(/\:\d+$/, '');
					});
				}

				opts.xAxis.data = xData;

				return opts;
			} else {
				return opts;
			}
		},
		toggleTimeRange: function toggleTimeRange(timeRange, e) {
			var _this3 = this;

			if (e.currentTarget.className.indexOf('disabled') == -1 && this.state.timeRange != timeRange) {
				if (timeRange == 'today') {
					var delta = Date.now() - this.state.data['today'].at;
					if (delta > 1000 * 60 * 5) this.setState({ timeRange: timeRange }, function () {
						return _this3.getData(timeRange);
					});else this.setState({ timeRange: timeRange });
				} else {
					this.setState({ timeRange: timeRange });
				}
			}
		},
		addClass: function addClass(map) {
			var res = [];
			res = Object.keys(map).filter(function (key) {
				return !!map[key];
			});
			return res.join(' ');
		},
		render: function render() {
			var _this4 = this;

			var opts = this.getOpts();
			// console.log(opts)
			return React.createElement(
				'section',
				{ className: 'panel panel-default' },
				React.createElement(
					'div',
					{ className: 'tab' },
					React.createElement(
						'ul',
						null,
						React.createElement(
							'li',
							{ className: this.addClass({ active: this.state.timeRange == 'today' }), onClick: function onClick(e) {
									return _this4.toggleTimeRange('today', e);
								} },
							React.createElement(
								'span',
								null,
								'近24小时'
							)
						),
						React.createElement(
							'li',
							{ className: this.addClass({ active: this.state.timeRange == 'last_week' }), onClick: function onClick(e) {
									return _this4.toggleTimeRange('last_week', e);
								} },
							React.createElement(
								'span',
								null,
								'近7天'
							)
						),
						React.createElement(
							'li',
							{ className: this.addClass({ active: this.state.timeRange == 'last_month' }), onClick: function onClick(e) {
									return _this4.toggleTimeRange('last_month', e);
								} },
							React.createElement(
								'span',
								null,
								'近30天'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'fr pr30' },
						React.createElement(Tooltip, { title: '规定周期内每日文章增量的趋势图。', className: '' })
					)
				),
				React.createElement(
					'div',
					{ className: 'panel-body' },
					React.createElement(Chart.c2, { ref: 'chart', options: opts, notmerge: 'true' })
				)
			);
		}
	});

	var Pie = React.createClass({
		displayName: 'Pie',
		getInitialState: function getInitialState() {
			return {
				data: {},
				size: {}
			};
		},
		componentWillReceiveProps: function componentWillReceiveProps(a) {
			this.setState({ data: a.data || {} });
		},
		componentDidMount: function componentDidMount() {
			this.resizeHandler();
			window.addEventListener('resize', this.resizeHandler, false);
		},
		componentWillUnmount: function componentWillUnmount() {
			window.removeEventListener('resize', this.resizeHandler, false);
		},
		resizeHandler: function resizeHandler() {
			var w = document.body.offsetWidth;
			if (w >= 1500) {
				this.setState({ size: {
						series: [{
							radius: ['75%', '90%']
						}, {
							radius: ['75%', '90%']
						}, {
							radius: ['75%', '90%']
						}]
					} });
			} else if (w >= 1370) {
				this.setState({ size: {
						series: [{
							radius: ['65%', '80%']
						}, {
							radius: ['65%', '80%']
						}, {
							radius: ['65%', '80%']
						}]
					} });
			} else {
				this.setState({ size: {
						series: [{
							radius: ['45%', '60%']
						}, {
							radius: ['45%', '60%']
						}, {
							radius: ['45%', '60%']
						}]
					} });
			}
		},
		render: function render() {
			var opts = $.extend(true, {}, Helper.jinriyuqing(this.props.data), this.state.size);
			return React.createElement(Chart.c2, { height: 280, options: opts });
		}
	});

	var Profile = React.createClass({
		displayName: 'Profile',

		getInitialState: function getInitialState() {
			return {
				allArtCount: 0,
				artCount: 0,
				warnCount: 0,
				latestArts: [],
				hotEvents: [],
				todayArtEmotion: {}

			};
		},
		componentDidMount: function componentDidMount() {
			var _this5 = this;

			// 文章总数
			// restArt.count.read().done(({count}) => {
			// 	this.setState({allArtCount: count})
			// })
			rest2.article.count.read('query', {}).done(function (dat) {
				if (dat.result == true) {
					_this5.setState({ allArtCount: dat.count });
				}
			});
			// 预警总数
			// restArt.count.read({
			// 	warn: 'all'
			// }).done(({count}) => {
			// 	this.setState({warnCount: count})
			// })
			rest2.article.count.read('query', { warn: 'all' }).done(function (dat) {
				if (dat.result == true) {
					_this5.setState({ warnCount: dat.count });
				}
			});
			// 今日文章数
			rest2.article.count.read('query', { date: 'today' }).done(function (dat) {
				if (dat.result == true) {
					_this5.setState({ artCount: dat.count });
				}
			});
			// 最新舆情
			// rest.articles.read('latest').done(data => {
			// 	this.setState({latestArts: data})
			// })
			rest2.article.data.read('query', {
				sort: 'publish_at_desc',
				beg: 0,
				m: 10,
				date: 'last_week'
			}).done(function (data) {
				if (data.result == true) {
					_this5.setState({ latestArts: data.data });
				}
			});
			// 热门事件
			rest2.events.read('hot').done(function (data) {
				_this5.setState({ hotEvents: data });
			});
			// 文章列表
			// rest.article.read('list').done(data => {
			// 	this.setState({todayArtEmotion: data, artCount: data.today.positive + data.today.negative + data.today.neutral})
			// })
			// rest2.article.count.read('emowarn').done(data => {
			// 	this.setState({todayArtEmotion: data})
			// })
			rest2.article.agg.read('query', { 'result': 'emotion', 'date': 'today' }).done(function (data) {
				if (data.result == true) {
					data = data.data.emotion.reduce(function (obj, item) {
						obj[item['param']] = item['count'];
						return obj;
					}, {});
					data['positive'] = data['positive'] || 0;
					data['negative'] = data['negative'] || 0;
					data['neutral'] = data['neutral'] || 0;
					_this5.setState({ todayArtEmotion: data });
				}
			});
		},
		getLatestTime: function getLatestTime(time_str) {
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
				return parseInt(delta / day) + '天前';
			}
		},
		renderLatestArts: function renderLatestArts() {
			var _this6 = this;

			var data = this.state.latestArts;
			if (data.length > 0) {
				return data.map(function (art, idx) {
					var title = Parse.tag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
					var pn = (art.from || {}).platform_name || '',
					    media_pre = void 0,
					    media_end = (art.from || {}).media || '';
					if (pn == '待定' || pn == '') media_pre = '';else media_pre = pn + '：';

					return React.createElement(
						'li',
						{ key: idx },
						React.createElement(
							'div',
							{ className: 'title' },
							React.createElement(
								'a',
								{ href: paths.ex.base + '/base#/article?uuid=' + art.uuid || '', title: title },
								Parse.limit(title, 40)
							)
						),
						React.createElement(
							'div',
							{ className: 'infos' },
							React.createElement(
								'span',
								null,
								_this6.getLatestTime(art.publish_at)
							),
							React.createElement(
								'span',
								null,
								media_pre + media_end
							),
							React.createElement(
								'span',
								null,
								emotMap[art.emotion] || ''
							)
						)
					);
				});
			} else {
				return React.createElement(
					'div',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无文章'
					)
				);
			}
		},
		renderHotEvents: function renderHotEvents() {
			var data = this.state.hotEvents;
			if (data.length > 0) {
				return data.map(function (event, idx) {
					return React.createElement(
						'li',
						{ key: idx },
						React.createElement(
							'div',
							{ className: 'title' },
							React.createElement(
								'a',
								{ href: paths.ex.base + '/base#/event/detail?inc=' + event.id },
								event.title
							),
							React.createElement(
								'span',
								{ className: "rank" + ' rank' + event.rank || 4 },
								event.rank == 4 ? '普通' : '一二三'.charAt(event.rank - 1) + '级'
							)
						),
						React.createElement(
							'div',
							{ className: 'infos' },
							React.createElement(
								'span',
								null,
								'昨日新增：' + (event.yestoday_art_count || 0)
							),
							React.createElement(
								'span',
								null,
								'文章总数：' + (event.article_count || 0)
							),
							React.createElement(
								'span',
								null,
								'负面比例：' + (event.article_count > 0 ? (event.negative_art_count * 100 / event.article_count).toFixed(0) + '%' : 0)
							)
						)
					);
				});
			} else {
				return React.createElement(
					'div',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无事件，',
						React.createElement(
							'a',
							{ href: paths.ex.base + '/base#/event/operator', className: 'intxt' },
							'创建事件'
						)
					)
				);
			}
		},
		renderTodayArtChart: function renderTodayArtChart() {
			var data = this.state.todayArtEmotion;
			if (data) {
				return React.createElement(
					'div',
					null,
					React.createElement(Pie, { data: data }),
					React.createElement(
						'div',
						{ className: 'content cf' },
						React.createElement(
							'div',
							{ className: 'item' },
							React.createElement(
								'div',
								{ className: 'title' },
								'正面文章'
							)
						),
						React.createElement(
							'div',
							{ className: 'item' },
							React.createElement(
								'div',
								{ className: 'title neu' },
								'中立文章'
							)
						),
						React.createElement(
							'div',
							{ className: 'item' },
							React.createElement(
								'div',
								{ className: 'title neg' },
								'负面文章'
							)
						)
					)
				);
			} else {
				return React.createElement(
					'div',
					{ className: 'content cf content-blank' },
					React.createElement(
						'div',
						{ className: 'list-blank-holder' },
						React.createElement(
							'span',
							null,
							'暂无信息'
						)
					)
				);
			}
		},
		renderQingxiang: function renderQingxiang() {
			var data = this.state.todayArtEmotion,
			    opts = {
				tooltip: {
					formatter: "负面声量占比：0<br/>正面声量占比：0<br/>中立声量占比：0<br/>情感指数：0"
				},
				toolbox: {
					itemSize: 20,
					right: 0,
					feature: {
						saveAsImage: {
							icon: 'image:///img/chart-download.png',
							title: '下载'
						}
					},
					iconStyle: {
						emphasis: {
							color: '#2c97de'
						}
					}
				},
				series: [{
					name: '情感倾向',
					type: 'gauge',
					radius: '90%',
					detail: {
						formatter: '{value}',
						offsetCenter: [0, '80%']
					},
					min: -100,
					max: 100,
					data: [{
						value: 0,
						name: '情感倾向'
					}],
					// startAngle: 200,
					// endAngle: -20,
					axisLine: {
						lineStyle: {
							color: [[0.5, '#e9573f'], [1, '#3a99d8']]
						}
					},
					axisLabel: {
						formatter: function formatter(v) {
							switch (v + '') {
								case '-100':
									return '-100';
								case '0':
									return '（中性）';
								case '100':
									return '100';
								default:
									return v;
							}
						}
					},
					pointer: {
						width: 4
					}
				}]
			};

			data = this.calEmotTrend(data);
			if (data.total > 0) {
				opts.series[0].data[0].value = data.positive - data.negative;
				opts.tooltip.formatter = '负面声量占比：' + data.negative + '%<br/>正面声量占比：' + data.positive + '%<br/>中立声量占比：' + data.neutral + '%<br/>情感指数：' + (data.positive - data.negative);
			}

			return React.createElement(Chart.c2, { height: 310, options: opts });
		},
		calEmotTrend: function calEmotTrend(data) {
			var res = {
				total: 0,
				positive: 0,
				negative: 0,
				neutral: 0
			};
			if (data) {
				var total = data.positive + data.negative + data.neutral;
				if (total > 0) {
					res = {
						total: total,
						positive: (data.positive * 100 / total).toFixed(0),
						negative: (data.negative * 100 / total).toFixed(0),
						neutral: (data.neutral * 100 / total).toFixed(0)
					};
				}
			}
			return res;
		},

		render: function render() {
			var emotTrend = this.calEmotTrend(this.state.todayArtEmotion);
			if (emotTrend.total > 0) {
				emotTrend = emotTrend.positive - emotTrend.negative;
			} else {
				emotTrend = null;
			}
			return React.createElement(
				'div',
				{ className: 'advices-analy-profile2' },
				React.createElement(
					'section',
					{ className: 'data-part' },
					React.createElement(
						'div',
						{ className: 'item data-all' },
						React.createElement(
							'a',
							{ href: paths.links.allArticles },
							React.createElement(
								'div',
								{ className: 'num' },
								React.createElement(
									'span',
									null,
									this.state.allArtCount
								)
							),
							React.createElement(
								'div',
								{ className: 'desc' },
								React.createElement(
									'span',
									null,
									'全部文章'
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'item data-today' },
						React.createElement(
							'a',
							{ href: paths.links.allArticles + '?date=today' },
							React.createElement(
								'div',
								{ className: 'num' },
								React.createElement(
									'span',
									null,
									this.state.artCount
								)
							),
							React.createElement(
								'div',
								{ className: 'desc' },
								React.createElement(
									'span',
									null,
									'今日文章'
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'item data-warn' },
						React.createElement(
							'a',
							{ href: paths.links.warn },
							React.createElement(
								'div',
								{ className: 'num' },
								React.createElement(
									'span',
									null,
									this.state.warnCount
								)
							),
							React.createElement(
								'div',
								{ className: 'desc' },
								React.createElement(
									'span',
									null,
									'预警文章'
								)
							)
						)
					)
				),
				React.createElement(ArtChart, null),
				React.createElement(
					'section',
					{ className: 'blocks-part' },
					React.createElement(
						'div',
						{ className: 'blocks-left' },
						React.createElement(
							'div',
							{ className: 'panel panel-default pie-chart mb20' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'今日舆情'
								),
								React.createElement(
									'div',
									{ className: 'pr5 mr2' },
									React.createElement(Tooltip, { title: '今日文章的正面、中立、负面数量占比及其条数。' })
								)
							),
							React.createElement(
								'div',
								{ className: 'panel-body' },
								this.renderTodayArtChart()
							)
						),
						React.createElement(
							'div',
							{ className: 'panel panel-default ovh latest-art' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'最新舆情',
									React.createElement(
										'span',
										{ className: 'desc' },
										'近7天'
									)
								)
							),
							React.createElement(
								'ul',
								{ className: 'profile-lists' },
								this.renderLatestArts()
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'blocks-right' },
						React.createElement(
							'div',
							{ className: 'panel panel-default mb20' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'情感倾向' + (emotTrend ? ': ' + emotTrend : '')
								),
								React.createElement(
									'div',
									{ className: 'pr5 mr2' },
									React.createElement(Tooltip, { title: '今日正面趋势与负面趋势之差。' })
								)
							),
							React.createElement(
								'div',
								{ className: 'panel-body' },
								this.renderQingxiang()
							)
						),
						React.createElement(
							'div',
							{ className: 'panel panel-default ovh latest-art' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'事件动态'
								)
							),
							React.createElement(
								'ul',
								{ className: 'profile-lists' },
								this.renderHotEvents()
							)
						)
					)
				)
			);
		}
	});

	return Profile;
});