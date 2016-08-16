'use strict';

define(['mods', 'echarts'], function (mods, echarts) {
	var React = mods.ReactPack.default;

	var c1 = React.createClass({
		displayName: 'c1',

		getDefaultProps: function getDefaultProps() {
			return {
				title: '',
				height: '450',
				options: {}
			};
		},
		componentDidMount: function componentDidMount() {
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.props.options);
		},
		componentWillReceiveProps: function componentWillReceiveProps(nps) {
			if ('options' in nps) {
				this.$chart.setOption(nps.options);
			}
		},
		componentWillUnmount: function componentWillUnmount() {
			this.$chart && this.$chart.dispose();
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'media-chart-container', style: { height: this.props.height + 'px' } },
				React.createElement(
					'div',
					{ className: 'hd' },
					React.createElement(
						'span',
						{ className: 'tit' },
						this.props.title
					)
				),
				React.createElement(
					'div',
					{ className: 'bd' },
					React.createElement('div', { className: 'chart', ref: 'chart' })
				)
			);
		}
	});

	var c2 = React.createClass({
		displayName: 'c2',

		getDefaultProps: function getDefaultProps() {
			return {
				height: '450',
				options: {}
			};
		},
		componentDidMount: function componentDidMount() {
			this.$chart = echarts.init(this.refs.chart);
			this.$chart.setOption(this.props.options);
			window.addEventListener('resize', this.resize, false);
		},
		componentWillReceiveProps: function componentWillReceiveProps(nps) {
			if ('options' in nps) {
				this.$chart.setOption(nps.options, this.props.notmerge);
			}
		},
		componentWillUnmount: function componentWillUnmount() {
			window.removeEventListener('resize', this.resize);
			this.$chart && this.$chart.dispose();
		},
		ins: function ins() {
			return this.$chart;
		},
		resize: function resize() {
			this.$chart.resize();
		},
		render: function render() {
			return React.createElement('div', { ref: 'chart', style: { height: this.props.height + 'px' } });
		}
	});

	return { c1: c1, c2: c2 };
});