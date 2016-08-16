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
			var {title, subTitle, data, xAxis} = props || {};
			return {title, subTitle, data, xAxis};
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
					formatter: function(params) {
						var tar = params[0];
						return tar.name + ': ' + tar.value + '个媒体';
					}
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					splitLine: {
						show: false
					},
					data: options.xAxis,
					splitArea: {
						show: true,
						interval: 0,
						areaStyle: {
							color: ['rgba(240, 240, 240, .3)', 'rgba(220, 220, 220, .3)']
						}
					}
				},
				yAxis: {
					type: 'value'
				},
				series: [{
					type: 'bar',
					barMaxWidth: 50,
					label: {
						normal: {
							show: true,
							position: 'insideBottom'
						}
					},
					data: options.data
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