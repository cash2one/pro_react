define([
	'mods',
	paths.rcn.comps + '/search.js',
], function(mods, Search){
	var React = mods.ReactPack.default;

	var Filter = React.createClass({
		componentDidUpdate: function(){
			this.refs.search.getDOMNode().querySelector('input').value = this.props.selected.search;
		},
		handleClick: function(key, item){
			this.props.onChange && this.props.onChange(key, item);
		},
		renderFilter: function(){
			var data = this.props.renderData;
			var selected = this.props.selected;
			var nodes = Object.keys(data).map((key, idx) => {
				let filter = data[key];
				return (
					<tr key={idx}>
						<td>{filter.title}:</td>
						<td>
							{
								filter.items.map((item, i) => {
									if(selected[key] == item.key){
										return <a key={i} className="item active">{item.title}</a>
									} else {
										return <a key={i} className="item" onClick={() => this.handleClick(key, item)}>{item.title}</a>
									}
								})
							}
						</td>
					</tr>
				)
			});

			return nodes;
		},
		renderFresh: function(){
			if(this.props.fresh == 'true'){
				return (
					<div className="fresh-bar">
						<span className="vm">截至{this.props.updateAt}</span>
						<span className={"btn" + (this.props.updating ? ' active' : '')} onClick={this.props.onUpdate}>
							<span className="refresh iconfont icon-shuaxin"></span>
							<span className="ml10 vm">{this.props.updating ? '刷新中...' : '刷新'}</span>
						</span>
					</div>
				)
			}
		},
		render: function(){
			const filter = this.props.selected;
			return (
				<div className="ab-fltb">
					<div className="hd">
						<div className="tit">
							<span>筛选设置</span>
						</div>
						<div className="sch">
							<div className="ib vm">
								<Search onSearch={val => this.handleClick('search', {key: $.trim(val)})} defaultValue={filter.search} ref="search" />
							</div>
						</div>
					</div>
					<div className="bd">
						<table className="table">
							{this.renderFilter()}
						</table>
					</div>
				</div>
			)
		}
	});

	return Filter
})