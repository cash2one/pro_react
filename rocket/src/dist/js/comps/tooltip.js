'use strict';

define(['mods', paths.rcn.lib + '/bootstrap.min.js'], function (mods) {
	var React = mods.ReactPack.default;

	var Tooltip = React.createClass({
		displayName: 'Tooltip',
		show: function show() {
			$(this.refs.holder).tooltip('show');
		},
		hide: function hide() {
			$(this.refs.holder).tooltip('hide');
		},
		render: function render() {
			return React.createElement(
				'span',
				{ className: "c-tooltip-holder" + (this.props.className ? ' ' + this.props.className : ''), ref: 'holder', title: this.props.title || '', onMouseOver: this.show, onMouseLeave: this.hide },
				'?'
			);
		}
	});

	return Tooltip;
});