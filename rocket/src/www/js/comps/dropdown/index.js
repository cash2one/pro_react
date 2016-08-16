define(['mods'], function(mods){
	var React = require('mods').ReactPack.default;

	var Dropdown = React.createClass({
		render: function(){
			return (
				<div className="c-dropdown">
					<div className="select" type="button" onClick={this.props.selectClick}>
						<input className="txt" name={this.props.selectName} placeholder="选择" value={this.props.selectValue}  disabled/>
						<span className="ic"><span className="iconfont icon-xiala"></span></span>
					</div>
					<ul className={this.props.isShowSelectList?'option':'option none'} id="dd_option">
						{
							this.props.optionList.map((index) => {
								return (
									<li onClick={() => this.props.optionListClick(index)}>{index.name}</li>
								)
							})
						}
					</ul>
				</div>
			)
		}
	})

	return Dropdown
})