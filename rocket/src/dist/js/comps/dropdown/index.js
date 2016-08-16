'use strict';

define(['mods'], function (mods) {
	var React = require('mods').ReactPack.default;

	var Dropdown = React.createClass({
		displayName: 'Dropdown',

		render: function render() {
			var _this = this;

			return React.createElement(
				'div',
				{ className: 'c-dropdown' },
				React.createElement(
					'div',
					{ className: 'select', type: 'button', onClick: this.props.selectClick },
					React.createElement('input', { className: 'txt', name: this.props.selectName, placeholder: '选择', value: this.props.selectValue, disabled: true }),
					React.createElement(
						'span',
						{ className: 'ic' },
						React.createElement('span', { className: 'iconfont icon-xiala' })
					)
				),
				React.createElement(
					'ul',
					{ className: this.props.isShowSelectList ? 'option' : 'option none', id: 'dd_option' },
					this.props.optionList.map(function (index) {
						return React.createElement(
							'li',
							{ onClick: function onClick() {
									return _this.props.optionListClick(index);
								} },
							index.name
						);
					})
				)
			);
		}
	});

	return Dropdown;
});