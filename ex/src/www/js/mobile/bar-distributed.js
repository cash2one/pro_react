define([
	'mods',
	// paths.rcn.plu + '/echarts.min.js'
	'echarts'
], function(mods, echarts){
	var React = mods.ReactPack.default;

	var Bar = React.createClass({
		getDefaultProps: function(){
			return {
				title: '',
				height: '400px',
				options: {}
			}
		},
		getProps: function(props){
			var {title, subTitle, data, xAxis, yAxisName, yAxisFormatter, tooltipFormatter} = props || {};
			return {title, subTitle, data, xAxis, yAxisName, yAxisFormatter, tooltipFormatter};
		},
		merge: function(options = {}){
			var title = {
				text: options.title,
				subtext: options.subTitle
			}
			if(!options.title){
				title.show = false;
			}
			var option = {
				title,
				tooltip: {
					trigger: 'axis',
					axisPointer: { // 坐标轴指示器，坐标轴触发有效
						type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
						shadowStyle: {
							color: 'rgba(220,220,220,.4)'
						}
					},
					formatter: options.tooltipFormatter || function(params) {
						if(params instanceof Array){
							var tar = params[0];
							return tar.name + ': ' + tar.value;
						} else if(params instanceof Object) {
							return params.name + ': ' + params.value
						}
					}
				},
				grid: {
					// left: '3%',
					// right: '4%',
					// containLabel: true
				},
				xAxis: {
					type: 'category',
					data: options.xAxis.slice(0,10),
					axisLabel: {
						interval: 0
					},
					splitArea: {
						show: true,
						interval: 0,
						areaStyle: {
							color: ['rgba(240, 240, 240, .3)', 'rgba(220, 220, 220, .3)']
						}
					}
				},
				yAxis: {
					type: 'value',
					name: options.yAxisName || '',
					nameTextStyle: {
						fontSize: 16
					},
					axisLabel: {
						formatter: options.yAxisFormatter || null
					}
				},
				dataZoom: [{
					type: 'slider',
					start: 0,
					end: 100,
					zoomLock: true,
					realtime: false,
					show: false
				}],
				series: [{
					name: 'aaa',
					type: 'bar',
					// label: {
					// 	normal: {
					// 		show: true,
					// 		position: 'inside'
					// 	}
					// },
					data: options.data.slice(0, 10),
					barMaxWidth: 30,
					barCategoryGap: '60%',
					markLine: {
						lineStyle: {
							normal: {
								color: '#1b9eae',
								type: 'solid',
								width: 2
							}
						},
						data: [
							{
								type: 'average',
								name: '平均值'
							}
						]
					}
				}]
			}
			if(this.props.color)
				option.color = this.props.color;

			return option;
		},
		componentDidMount: function(){
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.merge(this.getProps(this.props.options)));
		},
		componentWillReceiveProps: function(nps){
			if('options' in nps){
				var ops = this.merge(this.getProps(nps.options));
				this.$chart.setOption(ops);
			}
		},
		componentWillUnmount: function(){
			this.$chart && this.$chart.dispose();
		},
		render: function(){
			return (
				<div className="spread-chart-container" style={{height: this.props.height}}>
					<div className="hd">
						<span className="tit">{this.props.title}</span>
					</div>
					<div className="bd">
						<div className="chart" ref="chart"></div>
					</div>
				</div>
			)
		}
	})

	return Bar
})