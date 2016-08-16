'use strict';

define(['mods', paths.rcn.util + '/rest.js', './table.js', paths.rcn.comps + '/modal/index.js'], function (mods, r, Table, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Edit = React.createClass({
		displayName: 'Edit',

		getInitialState: function getInitialState() {
			return {};
		},
		componentDidMount: function componentDidMount() {},
		render: function render() {
			return React.createElement('div', { className: 'admin-edit' });
		}
	});

	return Edit;
});