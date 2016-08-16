'use strict';

define([paths.rcn.comps + '/frame/fr-head.js', paths.rcn.comps + '/frame/fr-nav.js', paths.rcn.comps + '/frame/actions.js', paths.rcn.comps + '/frame/bread-map.js', 'mods'], function (FrameHead, FrameNavi, Actions, map, mods) {
	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var connect = mods.ReactReduxPack.connect;
	var frNavUpdate = Actions.frNavUpdate;


	var Frame = React.createClass({
		displayName: 'Frame',

		childContextTypes: {
			updateNav: PropTypes.func
		},
		getChildContext: function getChildContext() {
			var _props = this.props;
			var dispatch = _props.dispatch;
			var user = _props.user;

			return {
				updateNav: function updateNav() {
					return dispatch(frNavUpdate());
				}
			};
		},
		render: function render() {
			if (this.props.main) return this.props.main;
			return React.createElement(
				'div',
				null,
				React.createElement(FrameHead, { routeState: this.props.route_state, user: this.props.user, routemap: this.props.routemap }),
				React.createElement(
					'div',
					{ className: 'frame-body-v2' },
					React.createElement(FrameNavi, { route: this.props.route_state }),
					React.createElement(
						'div',
						{ className: "frame-body-right" + (map.v2() ? ' v2' : '') },
						React.createElement(
							'div',
							{ className: 'frame-body-container' },
							this.props.children
						)
					)
				)
			);
		}
	});

	return connect(function (state, r) {
		return {
			route_state: r,
			user: state.fr_user,
			routemap: state.fr_nav.byName
		};
	})(Frame);
});