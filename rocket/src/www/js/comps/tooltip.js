define(['mods', paths.rcn.lib + '/bootstrap.min.js'], function(mods){
	var React = mods.ReactPack.default;

	var Tooltip = React.createClass({
		show(){
			$(this.refs.holder).tooltip('show');
		},
		hide(){
			$(this.refs.holder).tooltip('hide');
		},
		render(){
			return <span className={"c-tooltip-holder" + (this.props.className ? ' ' + this.props.className : '')} ref="holder" title={this.props.title || ''} onMouseOver={this.show} onMouseLeave={this.hide}>?</span>
		}
	})

	return Tooltip
})