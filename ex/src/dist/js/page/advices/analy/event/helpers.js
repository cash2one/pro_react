'use strict';

define([paths.rcn.util + '/env.js', paths.ex.page + '/advices/analy/event/options.js'], function (env, options) {
	return {
		zaiti: function zaiti() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

			var opts,
			    legends = [],
			    seriesData = [],
			    artTotal = 0;
			data.forEach(function (dat) {
				var value = dat.positive + dat.negative + dat.neutral,
				    name = /*env.srcMap[dat.category]*/dat.category_name;
				legends.push(name);
				seriesData.push({
					name: name,
					value: value
				});
				artTotal += value;
			});
			opts = $.extend(true, {}, options.pie, {
				legend: {
					data: legends
				},
				series: [{
					data: seriesData
				}]
			});

			return { opts: opts, artTotal: artTotal };
		},
		zhengfu: function zhengfu() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

			var yAxisData = [],
			    pos = [],
			    neg = [],
			    neu = [],
			    opts,
			    negTotal = 0;
			data.forEach(function (dat) {
				yAxisData.unshift( /*env.srcMap[dat.category]*/dat.category_name);
				pos.unshift(dat.positive);
				neg.unshift(dat.negative);
				neu.unshift(dat.neutral);
				negTotal += dat.negative;
			});
			opts = $.extend(true, {}, options.bar2, {
				yAxis: {
					data: yAxisData
				},
				series: [{
					name: '正面',
					type: 'bar',
					stack: 1,
					data: pos,
					barMaxWidth: 30
				}, {
					name: '中立',
					type: 'bar',
					stack: 1,
					data: neu,
					barMaxWidth: 30
				}, {
					name: '负面',
					type: 'bar',
					stack: 1,
					data: neg,
					barMaxWidth: 30
				}]
			});
			yAxisData = pos = neg = neu = null;
			return { opts: opts, negTotal: negTotal };
		},
		emot: function emot() {
			var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

			// console.log(options.bar)
			var xAxisData = [],
			    pos = [],
			    neg = [],
			    neu = [],
			    opts;
			data.slice(0, 10).forEach(function (dat) {
				xAxisData.push(dat.mid_name);
				pos.push(dat.positive);
				neg.push(dat.negative);
				neu.push(dat.neutral);
			});
			opts = $.extend(true, {}, options.bar, {
				xAxis: {
					data: xAxisData
				},
				series: [{
					name: '正面',
					type: 'bar',
					stack: 1,
					data: pos,
					barMaxWidth: 30
				}, {
					name: '中立',
					type: 'bar',
					stack: 1,
					data: neu,
					barMaxWidth: 30
				}, {
					name: '负面',
					type: 'bar',
					stack: 1,
					data: neg,
					barMaxWidth: 30
				}]
			});
			return opts;
		}
	};
});