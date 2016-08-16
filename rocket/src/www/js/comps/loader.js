define(['mods'], function(mods){
	var React = mods.ReactPack.default,
		TransG = mods.TransGroup.default;

	var Loader = React.createClass({
		render1: function(){
			return (
				<div className="sk-circle">
					<div className="sk-circle1 sk-child"></div>
					<div className="sk-circle2 sk-child"></div>
					<div className="sk-circle3 sk-child"></div>
					<div className="sk-circle4 sk-child"></div>
					<div className="sk-circle5 sk-child"></div>
					<div className="sk-circle6 sk-child"></div>
					<div className="sk-circle7 sk-child"></div>
					<div className="sk-circle8 sk-child"></div>
					<div className="sk-circle9 sk-child"></div>
					<div className="sk-circle10 sk-child"></div>
					<div className="sk-circle11 sk-child"></div>
					<div className="sk-circle12 sk-child"></div>
				</div>
			)
			
		},
		render2: function(){
			return (
				<div className="sk-fading-circle">
			        <div className="sk-circle1 sk-circle"></div>
			        <div className="sk-circle2 sk-circle"></div>
			        <div className="sk-circle3 sk-circle"></div>
			        <div className="sk-circle4 sk-circle"></div>
			        <div className="sk-circle5 sk-circle"></div>
			        <div className="sk-circle6 sk-circle"></div>
			        <div className="sk-circle7 sk-circle"></div>
			        <div className="sk-circle8 sk-circle"></div>
			        <div className="sk-circle9 sk-circle"></div>
			        <div className="sk-circle10 sk-circle"></div>
			        <div className="sk-circle11 sk-circle"></div>
			        <div className="sk-circle12 sk-circle"></div>
			      </div>
			)
			
		},
		render: function(){
			return (
				<TransG transitionName="show" transitionEnterTimeout={10} transitionLeaveTimeout={200} >
					{
						this.props.show ? (
							<div className={"c-loader" + (this.props.fix ? ' fix' : '')}>
								<div className="wrap">
									{this.render2()}
								</div>
							</div>
						) : null
					}
				</TransG>
			)
		}
	})

	return Loader
})