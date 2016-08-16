'use strict';

define(['mods'], function (mods) {
	var React = require('mods').ReactPack.default;

	var Modal = React.createClass({
		displayName: 'Modal',

		render: function render() {
			return React.createElement(
				'div',
				{ className: this.props.show ? 'c-modal-box' : 'none' },
				React.createElement('div', { className: 'c-modal-backdrop' }),
				React.createElement(
					'div',
					{ className: 'c-modal', id: 'eg_modal1' },
					React.createElement(
						'div',
						{ className: 'dialog md' },
						React.createElement(
							'div',
							{ className: 'cont' },
							React.createElement(
								'div',
								{ className: 'header' },
								React.createElement(
									'span',
									null,
									this.props.title || ''
								)
							),
							React.createElement(
								'div',
								{ className: 'body' },
								this.props.children
							)
						)
					)
				)
			);
		}
	});

	return Modal;
});