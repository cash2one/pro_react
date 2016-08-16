define(['mods', 'echarts'], function(mods, echarts){
	var React = mods.ReactPack.default;

	var c1 = React.createClass({
		getDefaultProps: function(){
			return {
				title: '',
				height: '450',
				options: {}
			}
		},
		componentDidMount: function(){
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.props.options);
		},
		componentWillReceiveProps: function(nps){
			if('options' in nps){
				this.$chart.setOption(nps.options);
			}
		},
		componentWillUnmount: function(){
			this.$chart && this.$chart.dispose();
		},
		render: function(){
			return (
				<div className="media-chart-container" style={{height: this.props.height + 'px'}}>
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

	var c2 = React.createClass({
		getDefaultProps: function(){
			return {
				height: '450',
				options: {}
			}
		},
		componentDidMount: function(){
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.props.options);
			window.addEventListener('resize', this.resize, false);
		},
		componentWillReceiveProps: function(nps){
			if('options' in nps){
				this.$chart.setOption(nps.options, this.props.notmerge);
			}
		},
		componentWillUnmount: function(){
			window.removeEventListener('resize', this.resize);
			this.$chart && this.$chart.dispose();
		},
		ins: function(){
			return this.$chart;
		},
		resize: function(){
			this.$chart.resize();
		},
		render: function(){
			return (
				<div ref="chart" style={{height: this.props.height + 'px'}}></div>
			)
		}
	})

	return {c1, c2};
})