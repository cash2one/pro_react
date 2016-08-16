'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/analy/event/chart.js'], function (mods, R, Chart) {
	var React = mods.ReactPack.default;

	var Opts = {
		title: {
			x: 'center',
			y: 'center',
			textStyle: {
				color: '#E9573F',
				fontSize: 28
			},
			subtextStyle: {
				color: '#E9573F',
				fontSize: 16
			}
			// text: 123,
			// subtext: 222
		},
		tooltip: {
			trigger: 'item',
			formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			orient: 'vertical',
			x: 'right',
			y: 'bottom'
		},
		series: [{
			type: 'pie',
			radius: ['60%', '80%'],
			avoidLabelOverlap: false,
			label: {
				normal: {
					show: false,
					position: 'center'
				}
			},
			labelLine: {
				normal: {
					show: false
				}
			}
		}]
	};

	var Pie = React.createClass({
		displayName: 'Pie',
		getOpts: function getOpts() {
			var data = this.props.save || {};
			var event = data['events'] || [];
			var eIndex = data['summary'] || {};
			eIndex = eIndex['event_index'] || 0;

			event = event.reduce(function (o, dat) {
				if (!o[dat['rank']]) o[dat['rank']] = 0;
				o[dat['rank']] += +dat['article_count'];
				return o;
			}, {});

			return $.extend(true, {}, Opts, {
				legend: {
					data: Object.keys(event).sort().map(function (key) {
						return key == 4 ? '普通事件' : '一二三'.charAt(+key - 1) + '级事件';
					})
				},
				series: [{
					data: Object.keys(event).map(function (key) {
						if (key == 1) return { value: event[key], name: '一级事件', itemStyle: { normal: { color: '#E9573F' } } };else if (key == 2) return { value: event[key], name: '二级事件', itemStyle: { normal: { color: '#F88B37' } } };else if (key == 3) return { value: event[key], name: '三级事件', itemStyle: { normal: { color: '#F6BB42' } } };else if (key == 4) return { value: event[key], name: '四级事件', itemStyle: { normal: { color: '#3A99D8' } } };
					})
				}],
				title: {
					text: eIndex,
					subtext: '事件指数'
				}
			});
		},
		render: function render() {
			var data = this.getOpts();
			return React.createElement(Chart.c2, { height: 205, options: data });
		}
	});

	return Pie;
});