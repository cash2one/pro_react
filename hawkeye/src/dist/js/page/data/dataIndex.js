'use strict';

/**
 * 大数据 - 行业报告
 */

define(['mods', paths.rcn.util + '/rest.js', './comp.js'], function (mods, r, Comp) {

	var rest = r.bigdata({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var dataIndex = React.createClass({
		displayName: 'dataIndex',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(Comp, null);
		}
	});

	return dataIndex;
});