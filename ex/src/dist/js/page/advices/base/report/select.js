'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	function bindEvent(tar, ev, cb) {
		tar.addEventListener(ev, cb, false);
		return function () {
			tar.removeEventListener(ev, cb, false);
		};
	}

	var Select = React.createClass({
		displayName: 'Select',

		getInitialState: function getInitialState() {
			return {
				active: false
			};
		},
		componentWillUpdate: function componentWillUpdate(nP, nS) {
			if (nS['active'] == false && this.state.active == true) {
				this.props.onClose && this.props.onClose();
			}
		},
		componentDidUpdate: function componentDidUpdate() {
			var active = this.state.active;
			if (active == true) {
				if (!this.clickOutSideHandler) this.clickOutSideHandler = bindEvent(document, 'click', this.toggle.bind(this));
			} else {
				if (this.clickOutSideHandler) {
					this.clickOutSideHandler();
					this.clickOutSideHandler = null;
				}
			}
		},
		clickHandler: function clickHandler() {
			this.toggle();
		},
		toggle: function toggle() {
			this.setState({ active: !this.state.active });
		},
		listClickHandler: function listClickHandler(e) {
			if (this.props.multiple) {
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation();
			}
		},
		renderHolder: function renderHolder() {
			var icon;
			if (this.props.children) {
				icon = React.createElement('span', { className: 'iconfont icon-xiala' });
			}
			return React.createElement(
				'span',
				{ className: 'oper-sele-holder' },
				React.createElement(
					'span',
					null,
					this.props.placeholder
				),
				icon
			);
		},
		render: function render() {
			var _this = this;

			var class_name = this.props.className || '';
			if (this.state.active == true) class_name += ' opened';
			return React.createElement(
				'div',
				{ className: class_name, style: { position: 'relative' }, onClick: this.clickHandler },
				this.props.holder,
				this.state.active ? React.createElement(
					'ul',
					{ className: 'dropdown-list pa', ref: 'list', onClick: function onClick(e) {
							return _this.listClickHandler(e);
						} },
					this.props.children
				) : null
			);
		}
	});

	return Select;
});