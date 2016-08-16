define([
	'mods',
	// paths.rcn.plu + '/echarts.min.js'
	'echarts'
], function(mods, echarts){
	var React = mods.ReactPack.default;

	var Pie = React.createClass({
		getDefaultProps: function(){
			return {
				title: '',
				height: '400px',
				options: {}
			}
		},
		getProps: function(props){
			var {title, subTitle, data, legendData} = props || {};
			return {title, subTitle, data, legendData};
		},
		merge: function(options = {}){
			var title = {
				text: options.title,
				subtext: options.subTitle,
				x: 'center'
			};
			var legendData = options.legendData || options.data.map(d => d.name);
			if(!options.title){
				title.show = false;
			}
			var option = {
				title,
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

	return Pie
})