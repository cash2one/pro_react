'use strict';

define(['mods', paths.rcn.util + '/rest.js', './table.js', paths.rcn.comps + '/modal/index.js', paths.rcn.plu + '/jquery.webui-popover.js'], function (mods, r, Table, Modal) {

	var rest1 = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Main = React.createClass({
		displayName: 'Main',
		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'loadingbox' },
				React.createElement('div', { className: 'backdrop' }),
				React.createElement(
					'div',
					{ className: 'spinner' },
					React.createElement(
						'div',
						{ className: 'spinner-container container1' },
						React.createElement('div', { className: 'circle1' }),
						React.createElement('div', { className: 'circle2' }),
						React.createElement('div', { className: 'circle3' }),
						React.createElement('div', { className: 'circle4' })
					),
					React.createElement(
						'div',
						{ className: 'spinner-container container2' },
						React.createElement('div', { className: 'circle1' }),
						React.createElement('div', { className: 'circle2' }),
						React.createElement('div', { className: 'circle3' }),
						React.createElement('div', { className: 'circle4' })
					),
					React.createElement(
						'div',
						{ className: 'spinner-container container3' },
						React.createElement('div', { className: 'circle1' }),
						React.createElement('div', { className: 'circle2' }),
						React.createElement('div', { className: 'circle3' }),
						React.createElement('div', { className: 'circle4' })
					)
				)
			);
		}
	});

	return Main;
});