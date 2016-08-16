define([
	'mods',
	paths.ex.page + '/advices/analy/event/chart.js',
], function(mods, Chart){
	const React = mods.ReactPack.default;

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
			radius: ['70%', '85%'],
			selectedMode: 'single',
			// hoverAnimation: false,
			selectedOffset: 5,
			label: {
				normal: {
					show: false
				},
				emphasis: {
					show: true
				}
			},
			labelLine: {
				normal: {
					show: false
				}
			},
			animation: 'linear'
		}]
	}

	var nameMap = {
		'all': '媒体报道',
		'微信': '微信公众号'
	}

	var orderMap = {
		'all': 0,
		'微信': 1,
		'今日头条': 2,
		'百度百家': 3
	}

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
	}

	var Platform = React.createClass({
		deal(r){
			if(r){
				let ins = r.ins();
				ins.off('mouseover');
				ins.on('mouseover', e => {
					ins.dispatchAction({
						type: 'pieSelect',
						name: e.name
					})

					let data = ins.getOption()['series'][0]['data'];

					let o = {
						title: {
							text: e.percent.toFixed(0) + '%',
							subtext: e.value + '条'
						},
						series: [{
							hoverAnimation: true,
							data: data.map(item => {
								if(item.name == e.name){
									return $.extend({}, item, {
										label: {
											normal: {
												show: true
											}
										}
									})
								} else {
									return $.extend({}, item, {
										label: {
											normal: {
												show: false
											}
										}
									})
								}
							})
						}]
					};
					
					ins.setOption(o);
				})
			}
		},
		render2(name, data){
			var total = 0, pos = 0;
			var option = $.extend(true, {}, opts, {
				series: [{
					data: Object.keys(data).map((emot, idx) => {
						let res = $.extend({}, {value: data[emot]}, emotMap[emot], idx == 0 ? {selected: true, label: {normal: {show: true}}} : {});
						total += data[emot];
						if(idx == 0)
							pos += data[emot];
						return res
					})
				}]
			})
			option.title.text = (total == 0 ? 0 : pos * 100 / total).toFixed(0) + '%';
			option.title.subtext = pos + '条';
			return (
				<div className="item">
					<Chart.c2 height="280" options={option} ref={this.deal} />
					<div className="desc">
						<span>{nameMap[name] ? nameMap[name] : name}</span>
					</div>
				</div>
			)
		},
		render(){
			var save = this.props.save,
				saveInfo = save.info || {},
				art = saveInfo.articles_statis || {};
			return (
				<div className="platform-part">
					{
						Object.keys(art).sort((a,b) => orderMap[a] - orderMap[b]).map(name => {
							return this.render2(name, art[name]);
						})
					}
				</div>
			)
		}
	})

	return Platform;
})