define(['mods'], function(mods){
	var React = require('mods').ReactPack.default;

	var Modal = React.createClass({
		render: function(){
			return (
				<div className={this.props.show?'c-modal-box':'none'}>
					<div className="c-modal-backdrop"></div>
					<div className="c-modal" id="eg_modal1">
						<div className="dialog sm">
							<div className="cont">
								<div className="header">
									<span>{this.props.title || ''}</span>
								</div>
								<div className="body">
									{this.props.children}
								</div>
								<div className={this.props.noBtn?'footer none':'footer'}>
									<button className="btn" type="button" onClick={this.props.dismiss}>取消</button>
									<button className="btn" type="submit" onClick={this.props.confirm}>确定</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Modal
})