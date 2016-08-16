'use strict';

define(['mods',
// paths.rcn.plu + '/echarts.min.js'
'echarts'], function (mods, echarts) {
	var React = mods.ReactPack.default;

	var schema = [{ name: 'date', index: 0, text: '日期' }, { name: 'AQIindex', index: 1, text: '发布数量' }, { name: 'PM25', index: 2, text: '转发量' }];

	var itemStyle = {
		normal: {
			// opacity: 0.8,
			// shadowBlur: 10,
			// shadowOffsetX: 0,
			// shadowOffsetY: 0,
			// shadowColor: 'rgba(0, 0, 0, 0.5)'
		}
	};

	/*
 	<Scatter
 		title='文章数量和被转发量分布'
 		options={
 			{
 				series: [{
 					name: '网媒',
 					data: fake.datawm
 				}, {
 					name: '新媒体',
 					data: fake.dataxm
 				}, {
 					name: '论坛',
 					data: fake.datalt
 				}]
 			}
 		}
 	/>
 */

	var Scatter = React.createClass({
		displayName: 'Scatter',

		getDefaultProps: function getDefaultProps() {
			return {
				title: '',
				height: '400px',
				options: {}
			};
		},
		getProps: function getProps(props) {
			var _ref = props || {};

			var series = _ref.series;

			return { series: series };
		},
		merge: function merge() {
			var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var _ref2$series = _ref2.series;
			var series = _ref2$series === undefined ? [] : _ref2$series;

			var series = series.map(function (s) {
				return $.extend({}, s, { type: 'scatter' });
			});
			var legendData = series.map(function (s) {
				return s.name;
			});
			var option = {
				// backgroundColor: '#333',
				color: ['#80F1BE', '#dd4444', '#fec42c'],
				legend: {
					y: 'top',
					right: '20px',
					icon: 'roundRect',
					data: legendData
				},
				grid: {
					x: '10%',
					x2: 150,
					y: '18%',
					y2: '10%'
				},
				tooltip: {
					padding: 10,
					backgroundColor: '#222',
					borderColor: '#777',
					borderWidth: 1,
					formatter: function formatter(obj) {
						var value = obj.value;
						return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">' + obj.seriesName + ' ' + value[0] + '</div>' + schema[1].text + '：' + value[1] + '<br>' + schema[2].text + '：' + value[2] + '<br>';
					}
				},
				xAxis: {
					type: 'time',
					name: '日期',
					nameGap: 16,
					nameTextStyle: {
						// color: '#fff',
						fontSize: 14
					},
					//max: 31,
					splitLine: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: '#777'
						}
					},
					axisTick: {
						lineStyle: {
							color: '#777'
						}
					},
					axisLabel: {
						formatter: '{value}'
					}
				},
				yAxis: {
					type: 'value',
					name: '文章数量',
					nameLocation: 'end',
					nameGap: 20,
					nameTextStyle: {
						fontSize: 16
					},
					axisLine: {
						lineStyle: {
							color: '#777'
						}
					},
					axisTick: {
						lineStyle: {
							color: '#777'
						}
					},
					splitLine: {
						show: false
					}
				},
				visualMap: [{
					left: 'right',
					top: '10%',
					dimension: 2,
					min: 0,
					max: 304,
					itemWidth: 30,
					itemHeight: 120,
					calculable: true,
					precision: 0.1,
					text: ['圆形大小：被转发数量'],
					textGap: 30,
					inRange: {
						symbolSize: [10, 70]
					},
					outOfRange: {
						symbolSize: [10, 70],
						color: ['rgba(255,255,255,.2)']
					},
					controller: {
						inRange: {
							color: ['#c23531']
						},
						outOfRange: {
							color: ['#444']
						}
					}
				}],
				series: series
			};
			if (this.props.color) option.color = this.props.color;

			return option;
		},
		componentDidMount: function componentDidMount() {
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.merge(this.getProps(this.props.options)));
		},
		componentWillReceiveProps: function componentWillReceiveProps(nps) {
			if ('options' in nps) {
				var ops = this.merge(this.getProps(nps.options));
				this.$chart.setOption(ops);
			}
		},
		componentWillUnmount: function componentWillUnmount() {
			this.$chart && this.$chart.dispose();
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'spread-chart-container', style: { height: this.props.height } },
				React.createElement(
					'div',
					{ className: 'hd' },
					React.createElement(
						'span',
						{ className: 'tit' },
						this.props.title
					)
				),
				React.createElement(
					'div',
					{ className: 'bd' },
					React.createElement('div', { className: 'chart', ref: 'chart' })
				)
			);
		}
	});

	return Scatter;
});