'use strict';

define(['mods',
// paths.rcn.plu + '/echarts.min.js'
'echarts'], function (mods, echarts) {
	var React = mods.ReactPack.default;

	var Pie = React.createClass({
		displayName: 'Pie',

		getDefaultProps: function getDefaultProps() {
			return {
				title: '',
				height: '400px',
				options: {}
			};
		},
		getProps: function getProps(props) {
			var _ref = props || {};

			var title = _ref.title;
			var subTitle = _ref.subTitle;
			var data = _ref.data;
			var legendData = _ref.legendData;

			return { title: title, subTitle: subTitle, data: data, legendData: legendData };
		},
		merge: function merge() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var title = {
				text: options.title,
				subtext: options.subTitle,
				x: 'center'
			};
			var legendData = options.legendData || options.data.map(function (d) {
				return d.name;
			});
			if (!options.title) {
				title.show = false;
			}
			var option = {
				title: title,
				tooltip: {
					trigger: 'item',
					formatter: "{b} : {c} ({d}%)"
				},
				legend: {
					// orient: 'vertical',
					left: '20px',
					data: legendData,
					icon: 'roundRect',
					selectedMode: false
				},
				series: [{
					name: '载体分布',
					type: 'pie',
					radius: '70%',
					center: ['50%', '50%'],
					data: options.data,
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}]
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

	return Pie;
});