'use strict';

/**
 * 用户反馈 - 问题反馈
 */

define(['mods', paths.rcn.util + '/rest.js', './comp.js'], function (mods, r, Comp) {

	var rest = r.bigdata({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Problem = React.createClass({
		displayName: 'Problem',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(Comp, null);
		}
	});

	return Problem;
});