'use strict';

/**
 * 数据新闻 - 品牌分布图（矩形树图）
 */

define(['mods', paths.rcn.util + '/rest.js', './brand.js'], function (mods, r, Brand) {

	var rest = r.index({
		stringifyData: false
	});

	var rest2 = r.brand({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Brand_distribute = React.createClass({
		displayName: 'Brand_distribute',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(Brand, null);
		}
	});

	return Brand_distribute;
});