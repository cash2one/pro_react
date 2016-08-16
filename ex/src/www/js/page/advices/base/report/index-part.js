define([
	'mods',
	paths.ex.page + '/advices/analy/event/chart.js',
], function(mods, Chart){
	const React = mods.ReactPack.default;

	var opts = {
		title: {
			left: 22,
			textStyle: {
				color: '#000',
				fontSize: 14
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
			right: 22,
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
				formatter: function(value, index) {
					var date = new Date(value);
					if (value) {
						if (index === 0) {
							return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
						} else {
							return (date.getMonth() + 1) + '月' + date.getDate() + '日';
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
				},
				// inside: true
			}
		},
		// series: chartData
		animation: false
	}

	var optm = $.extend({}, opts, {
		title: {
			left: 12
		},
		grid: {
			left: 12,
			right: 12,
			bottom: 0,
			containLabel: true
		},
		legend: {
			y: 30,
			x: 'center'
		},
		yAxis: {
			axisLabel: {
				formatter: function(val, ind){
					val = val > 1000 ? (val / 1000) + 'k' : val;
					return val;
				}
			}
		},
		xAxis: {
			splitNumber: 4
		}
	})

	var nameMap = {
		'baidu': '百度指数',
		'data_360': '360指数',
		'sina': '新浪指数'
	}

	var order = {
		'baidu': 0,
		'data_360': 1,
		'sina': 2
	}

	var Index = React.createClass({
		getInitialState(){
			return {
				range: 7
			}
		},
		renderC(name, index){
			var range = this.state.range;
			var data = index[name];
			var option = $.extend(true, {}, opts, this.props.m ? optm : {}, {
				legend: {
					data: Object.keys(data)
				},
				title: {
					text: nameMap[name]
				},
				xAxis: {
					data: index['day'].slice(-range)
				},
				series: Object.keys(data).map(kw => {
					return {
						name: kw,
						type: 'line',
						smooth: true,
						data: data[kw].slice(-range),
						areaStyle: {
							normal: {
								opacity: 0.2
							}
						}
					}
				})
			});

			if(this.props.m){
				option.grid = {
					top: Object.keys(data).length <= 4 ? 60 : 100
				}
			}

			return <div className="index-item"><Chart.c2 options={option} height={this.props.m ? '300' : '400'} /></div>
		},
		render(){
			var save = this.props.save,
				saveInfo = save.info || {},
				index = saveInfo.index || {},
				range = this.state.range;
			return (
				<div className="panel panel-default">
					<div className="tab">
						<ul>
							<li className={range == 7 ? 'active' : ''} onClick={() => this.setState({range: 7})}><span>近7天</span></li>
							<li className={range == 30 ? 'active' : ''} onClick={() => this.setState({range: 30})}><span>近30天</span></li>
						</ul>
					</div>
					<div className={"index-part" + (this.props.m ? ' mob' : '')}>
						{
							Object.keys(index).length == 0 ? <div className="list-blank-holder">暂无数据</div> :
							(
								Object.keys(index).filter(k => nameMap[k]).sort((a,b) => order[a] - order[b]).map(k => {
									return this.renderC(k, index)
								})
							)
						}
					</div>
				</div>
			)
		}
	})

	return Index;
})