'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/analy/event/chart.js'], function (mods, R, Chart) {
	var React = mods.ReactPack.default;

	var rest = R.ex();

	var opts = {
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			y: '5',
			selectedMode: false
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: [],
			boundaryGap: false,
			axisLine: {
				lineStyle: {
					color: ['#dedede']
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: ['#dedede']
				}
			}
		},
		yAxis: {
			type: 'value',
			axisLine: {
				lineStyle: {
					color: ['#dedede']
				}
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: ['#dedede']
				}
			}
		},
		series: [],
		color: ['#4A89DC', '#DF563F', '#F6BB41', '#8CD480', '#DF773F']
	};

	var Line = React.createClass({
		displayName: 'Line',
		getInitialState: function getInitialState() {
			return {
				data: {}
			};
		},
		componentWillReceiveProps: function componentWillReceiveProps(np) {
			var _this = this;

			if (this.props.save['version'] == 3) {
				var save = np.save || {},
				    artTrend = save['artTrend'] || {};
				Object.keys(artTrend).forEach(function (key) {
					if (!_this.state.data[key]) _this.getData(key);
				});
			}
			this.setState({ keyMap: (np.data['mids'] || []).reduce(function (o, item) {
					o[item['id']] = item['name'];
					return o;
				}, {}) });
		},
		getData: function getData(key) {
			var _this2 = this;

			var save = this.props.save || {},
			    date = save['date'];
			if (date) {
				rest.article.read('charts', {
					mid: key,
					time: date
				}).done(function (dat) {
					_this2.setState({ data: $.extend({}, _this2.state.data, _defineProperty({}, key, dat)) });
				});
			}
		},
		getOpts: function getOpts() {
			var _this3 = this;

			var save = this.props.save || {},
			    data,
			    opt = $.extend({}, opts);
			if (save['version'] == 3) {
				data = this.state.data;
			} else {
				data = save['artTrend'] || {};
			}

			if (!$.isEmptyObject(data)) {
				var legendData = [],
				    series = [],
				    xData = [];
				var ks = Object.keys(data).filter(function (key) {
					return !!(_this3.props.save['artTrend'] || {})[key];
				});
				if (ks.length) {
					ks.forEach(function (key) {
						legendData.push(_this3.keyTrans(key));
						series.push({
							name: _this3.keyTrans(key),
							type: 'line',
							data: data[key].map(function (item) {
								return item.value;
							})
						});
					});
					opt.legend.data = legendData;
					opt.series = series;
					opt.xAxis.data = data[ks[0]].map(function (item) {
						return (item.date || '').replace(/\:\d+$/, '');
					});
				}
			}

			return opt;
		},
		keyTrans: function keyTrans(key) {
			var save = this.props.save || {};
			if (save['version'] == 3) {
				return this.state.keyMap[key];
			} else {
				return key;
			}
		},
		render: function render() {
			var opt = this.getOpts();
			return React.createElement(
				'div',
				null,
				React.createElement(Chart.c2, { ref: 'chart', height: '350', options: opt, notmerge: 'true' })
			);
		}
	});

	return Line;
});