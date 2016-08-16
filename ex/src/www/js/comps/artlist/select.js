define(['mods'], function(mods){
	var React = mods.ReactPack.default;

	function bindEvent(tar, ev, cb){
		tar.addEventListener(ev, cb, false);
		return function(){
			tar.removeEventListener(ev, cb, false);
		}
	}

	var Select = React.createClass({
		getInitialState: function(){
			return {
				active: false
			}
		},
		componentWillUpdate: function(nP, nS){
			if(nS['active'] == false && this.state.active == true){
				this.props.onClose && this.props.onClose();
			}
		},
		componentDidUpdate: function(){
			var active = this.state.active;
			if(active == true){
				if(!this.clickOutSideHandler)
					this.clickOutSideHandler = bindEvent(document, 'click', this.toggle.bind(this));
			} else {
				if(this.clickOutSideHandler){
					this.clickOutSideHandler();
					this.clickOutSideHandler = null;
				}
			}
		},
		clickHandler: function(){
			this.toggle();
		},
		toggle: function(){
			this.setState({active: !this.state.active});
		},
		listClickHandler: function(e){
			if(this.props.multiple){
				e.stopPropagation();
				e.nativeEvent.stopImmediatePropagation();
			}
		},
		renderHolder: function(){
			var icon;
			if(this.props.children){
				icon = <span className="iconfont icon-xiala" />;
			}
			return (
				<span className="oper-sele-holder">
					<span>{this.props.placeholder}</span>
					{icon}
				</span>
			)
		},
		render: function(){
			var class_name = "oper-sele";
			if(this.state.active == true) class_name += ' opened';
			return (
				<div className={class_name} onClick={this.clickHandler}>
					{this.renderHolder()}
					<ul className="oper-sele-items" onClick={e => this.listClickHandler(e)}>
						{this.props.children}
					</ul>
				</div>
			)
		}
	})

	return Select
})