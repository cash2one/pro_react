'use strict';

define(['mods', paths.ex.page + '/advices/analy/event/chart.js'], function (mods, Chart) {
	var React = mods.ReactPack.default;

	var opts = {
		title: {
			text: '',
			textStyle: {
				color: '#444',
				fontSize: '40'
			},
			subtext: '',
			subtextStyle: {
				color: '#999',
				fontSize: '24'
			},
			left: 'center',
			top: 'middle'
		},
		series: [{
			name: '',
			type: 'pie',
			radius: ['60%', '80%'],
			avoidLabelOverlap: false,
			selectedMode: 'single',
			hoverAnimation: false,
			label: {
				normal: {
					show: true
				}
			},
			labelLine: {
				normal: {
					show: false
				}
			},
			// itemStyle: {
			// 	normal: {
			// 		borderWidth: 5,
			// 		borderColor: '#fff',
			// 	}
			// },
			animation: 'linear'
		}]
	};

	var nameMap = {
		'all': '媒体报道'
	};

	var emotMap = {
		'positive': {
			name: '正面',
			itemStyle: {
				normal: {
					color: '#52a6de'
				}
			}
		},
		'neutral': {
			name: '中立',
			itemStyle: {
				normal: {
					color: '#f7c65f'
				}
			}
		},
		'negative': {
			name: '负面',
			itemStyle: {
				normal: {
					color: '#ec6f5a'
				}
			}
		}
	};

	var Platform = React.createClass({
		displayName: 'Platform',
		deal: function deal(r) {
			if (r) {
				(function () {
					var ins = r.ins();
					ins.off('mouseover');
					ins.on('mouseover', function (e) {
						ins.dispatchAction({
							type: 'pieSelect',
							name: e.name
						});

						ins.setOption({
							title: {
								text: e.percent.toFixed(0) + '%',
								subtext: e.value + '条'
							}
						});
					});
				})();
			}
		},
		render2: function render2(name, data) {
			var option = $.extend(true, {}, opts, {
				series: [{
					data: Object.keys(data).map(function (emot, idx) {
						var res = $.extend({}, { value: data[emot] }, emotMap[emot], idx == 0 ? { selected: true } : {});
						return res;
					})
				}]
			});
			return React.createElement(
				'div',
				{ className: 'item' },
				React.createElement(Chart.c2, { height: '260', options: option, ref: this.deal }),
				React.createElement(
					'div',
					{ className: 'desc' },
					React.createElement(
						'span',
						null,
						nameMap[name] ? nameMap[name] : name
					)
				)
			);
		},
		render: function render() {
			var _this = this;

			var save = this.props.save,
			    saveInfo = save.info || {},
			    art = saveInfo.articles_statis || {};
			return React.createElement(
				'div',
				{ className: 'platform-part' },
				Object.keys(art).map(function (name) {
					return _this.render2(name, art[name]);
				})
			);
		}
	});

	return Platform;
});