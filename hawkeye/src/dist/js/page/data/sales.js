'use strict';

/**
 * 大数据 - 销量流量
 */

define(['mods', paths.rcn.util + '/rest.js', './comp.js'], function (mods, r, Comp) {

	var rest = r.bigdata({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Sales = React.createClass({
		displayName: 'Sales',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(Comp, null);
		}
	});

	return Sales;
});