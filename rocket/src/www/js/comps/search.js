define(['mods'], function(mods){
	var React = require('mods').ReactPack.default;

	var Search = React.createClass({
		handleSearch: function(){
			this.props.onSearch && this.props.onSearch(this.refs.input.value)
		},
		render: function(){
			return (
				<div className={"c-search" + (this.props.size ? " " + this.props.size : ' sm')}>
					<input type="text" className="s-input" placeholder={this.props.placeholder ? this.props.placeholder : "搜索"} onChange={this.props.onChange} defaultValue={this.props.defaultValue} value={this.props.value} ref="input"  onKeyDown={e => e.keyCode == 13 && this.handleSearch()} onFocus={e => e.target.select()} />
					<span className="s-btn" onClick={this.handleSearch}>
						<span className="iconfont icon-sousuo"></span>
					</span>
				</div>
			)
		}
	})

	return Search
})