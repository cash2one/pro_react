'use strict';

define(['mods', paths.ex.page + '/advices/analy/event/chart.js'], function (mods, Chart) {
	var React = mods.ReactPack.default;

	var opts = {
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			y: '5',
			x: 'right'
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
				lineStyle: {
					color: ['#dedede']
				}
			}
		},
		series: [],
		color: ['#4A89DC', '#DF563F', '#F6BB41', '#8CD480', '#DF773F'],
		animation: false
	};

	var nameMap = {
		'baidu': '百度指数',
		'data_360': '360指数',
		'sina': '新浪指数'
	};

	var Index = React.createClass({
		displayName: 'Index',
		getInitialState: function getInitialState() {
			return {
				range: 7
			};
		},
		renderC: function renderC(name, index) {
			var range = this.state.range;
			var data = index[name];
			var option = $.extend(true, {}, opts, {
				legend: {
					data: Object.keys(data)
				},
				title: {
					text: nameMap[name]
				},
				xAxis: {
					data: index['day']
				},
				series: Object.keys(data).map(function (kw) {
					return {
						name: kw,
						type: 'line',
						data: data[kw].slice(-range)
					};
				})
			});
			return React.createElement(
				'div',
				{ className: 'index-item' },
				React.createElement(Chart.c2, { options: option })
			);
		},
		render: function render() {
			var _this = this;

			var save = this.props.save,
			    saveInfo = save.info || {},
			    index = saveInfo.index || {},
			    range = this.state.range;
			return React.createElement(
				'div',
				{ className: 'panel panel-default' },
				React.createElement(
					'div',
					{ className: 'tab' },
					React.createElement(
						'ul',
						null,
						React.createElement(
							'li',
							{ className: range == 7 ? 'active' : '', onClick: function onClick() {
									return _this.setState({ range: 7 });
								} },
							React.createElement(
								'span',
								null,
								'近7天'
							)
						),
						React.createElement(
							'li',
							{ className: range == 30 ? 'active' : '', onClick: function onClick() {
									return _this.setState({ range: 30 });
								} },
							React.createElement(
								'span',
								null,
								'近30天'
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'index-part' },
					Object.keys(index).filter(function (k) {
						return nameMap[k];
					}).map(function (k) {
						return _this.renderC(k, index);
					})
				)
			);
		}
	});

	return Index;
});