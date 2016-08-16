define([
	paths.rcn.comps + '/frame/fr-head.js',
	paths.rcn.comps + '/frame/fr-nav.js',
	paths.rcn.comps + '/frame/actions.js',
	paths.rcn.comps + '/frame/bread-map.js',
	'mods'
], function(
	FrameHead,
	FrameNavi,
	Actions,
	map,
	mods
){
	var React = mods.ReactPack.default;
	var {PropTypes} = mods.ReactPack;
	var {connect} = mods.ReactReduxPack;
	const {frNavUpdate} = Actions;

	var Frame = React.createClass({
		childContextTypes: {
			updateNav: PropTypes.func
		},
		getChildContext: function(){
			const {dispatch, user} = this.props;
			return {
				updateNav: () => dispatch(frNavUpdate())
			}
		},
		render: function(){
			if(this.props.main) return this.props.main;
			return (
				<div>
					<FrameHead routeState={this.props.route_state} user={this.props.user} routemap={this.props.routemap} />
					<div className="frame-body-v2">
						<FrameNavi route={this.props.route_state} />
						<div className={"frame-body-right" + (map.v2() ? ' v2' : '')}>
							<div className="frame-body-container">
								{this.props.children}
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return connect((state, r) => {
		return {
			route_state: r,
			user: state.fr_user,
			routemap: state.fr_nav.byName
		}
	})(Frame);
})