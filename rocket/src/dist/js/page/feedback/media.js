'use strict';

/**
 * 用户反馈 - 媒体申请
 */

define(['mods', paths.rcn.util + '/rest.js', './comp.js'], function (mods, r, Comp) {

	var rest = r.bigdata({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Media = React.createClass({
		displayName: 'Media',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement(Comp, null);
		}
	});

	return Media;
});