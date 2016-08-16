'use strict';

define(['mods'], function (mods) {
	var React = require('mods').ReactPack.default;

	var Search = React.createClass({
		displayName: 'Search',

		handleSearch: function handleSearch() {
			this.props.onSearch && this.props.onSearch(this.refs.input.value);
		},
		render: function render() {
			var _this = this;

			return React.createElement(
				'div',
				{ className: "c-search" + (this.props.size ? " " + this.props.size : ' sm') },
				React.createElement('input', { type: 'text', className: 's-input', placeholder: this.props.placeholder ? this.props.placeholder : "搜索", onChange: this.props.onChange, defaultValue: this.props.defaultValue, value: this.props.value, ref: 'input', onKeyDown: function onKeyDown(e) {
						return e.keyCode == 13 && _this.handleSearch();
					}, onFocus: function onFocus(e) {
						return e.target.select();
					} }),
				React.createElement(
					'span',
					{ className: 's-btn', onClick: this.handleSearch },
					React.createElement('span', { className: 'iconfont icon-sousuo' })
				)
			);
		}
	});

	return Search;
});