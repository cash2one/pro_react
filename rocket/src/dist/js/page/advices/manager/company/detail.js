'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/dropdown/index.js', paths.rcn.comps + '/modal/index.js'], function (mods, r, Dropdown, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var CompanyDetail = React.createClass({
		displayName: 'CompanyDetail',


		getInitialState: function getInitialState() {
			return {};
		},

		componentDidMount: function componentDidMount() {},

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'companyDetail' },
				'公司欢迎页'
			);
		}
	});

	return CompanyDetail;
});