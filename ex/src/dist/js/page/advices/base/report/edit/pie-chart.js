'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/analy/event/chart.js'], function (mods, R, Chart) {
	var React = mods.ReactPack.default;

	var Opts = {
		jinriyuqing: {
			tooltip: {
				formatter: "{b}: {c}条"
			},
			title: {
				x: 'center',
				y: 'center',
				textStyle: {
					color: '#787878',
					fontSize: 28
				},
				subtextStyle: {
					color: '#787878',
					fontSize: 16
				}
			},
			series: {
				type: 'pie',
				radius: ['75%', '90%'],
				silent: true,
				label: {
					normal: {
						show: false
					}
				}
			}
		}
	};

	var jinriyuqing = function jinriyuqing(data) {
		data = data || {
			positive: 0,
			negative: 0,
			neutral: 0
		};
		var total = data.positive + data.neutral + data.negative;
		return {
			positive: $.extend(true, {}, Opts.jinriyuqing, {
				title: {
					text: total == 0 ? '0%' : (data.positive * 100 / total).toFixed(0) + '%',
					subtext: total == 0 ? '0条' : data.positive + '条'
				},
				color: ['#3a99d8', '#eee'],
				series: {
					data: [{
						name: '正面',
						value: data.positive
					}, {
						name: '其余',
						value: total == 0 ? 1 : total - data.positive
					}]
				}
			}),
			negative: $.extend(true, {}, Opts.jinriyuqing, {
				title: {
					text: total == 0 ? '0%' : (data.negative * 100 / total).toFixed(0) + '%',
					subtext: total == 0 ? '0条' : data.negative + '条'
				},
				color: ['#e9573f', '#eee'],
				series: {
					data: [{
						name: '负面',
						value: data.negative
					}, {
						name: '其余',
						value: total == 0 ? 1 : total - data.negative
					}]
				}
			}),
			neutral: $.extend(true, {}, Opts.jinriyuqing, {
				title: {
					text: total == 0 ? '0%' : (data.neutral * 100 / total).toFixed(0) + '%',
					subtext: total == 0 ? '0条' : data.neutral + '条'
				},
				color: ['#f6bb42', '#eee'],
				series: {
					data: [{
						name: '中立',
						value: data.neutral
					}, {
						name: '其余',
						value: total == 0 ? 1 : total - data.neutral
					}]
				}
			})
		};
	};

	var Pie = React.createClass({
		displayName: 'Pie',
		render: function render() {
			var data = this.props.save || {};
			data = data['articles_statis'] || {};
			return React.createElement(
				'div',
				{ className: 'pie-part cf' },
				React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(Chart.c2, { height: 240, options: jinriyuqing(data).positive }),
					React.createElement(
						'div',
						{ className: 'title' },
						'正面文章'
					)
				),
				React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(Chart.c2, { height: 240, options: jinriyuqing(data).neutral }),
					React.createElement(
						'div',
						{ className: 'title neu' },
						'中立文章'
					)
				),
				React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(Chart.c2, { height: 240, options: jinriyuqing(data).negative }),
					React.createElement(
						'div',
						{ className: 'title neg' },
						'负面文章'
					)
				)
			);
		}
	});

	return Pie;
});