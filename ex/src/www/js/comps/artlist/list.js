define([
	'mods',
	paths.ex.comps + '/artlist/list-item.js',
], function(mods, ListItem){
	var React = mods.ReactPack.default;

	var List = React.createClass({
		getInitialState: function(){
			return {
				grid: 'justify'
			}
		},
		componentDidMount: function(){
			window.addEventListener('resize', this.setGrid, false);
			this.setGrid();
		},
		componentWillUnmount: function(){
			window.removeEventListener('resize', this.setGrid, false);
		},
		setGrid: function(){
			if(this.refs.container.offsetWidth <= 1438){
				if(this.state.grid != 'justify')
					this.setState({grid: 'justify'})
			} else {
				if(this.state.grid != 'column')
					this.setState({grid: 'column'})
			}
		},
		selectHandler: function(uuid){
			this.props.onSelect && this.props.onSelect(uuid);
		},
		renderList: function(data, idx){
			return <ListItem key={idx} data={data} selected={this.props.artSelected.indexOf(data.uuid) != -1} onSelect={uuid => this.selectHandler(uuid)} onEmotionChange={this.props.artEmotionChange} ignoreWarn={this.props.ignoreWarn} highlight={this.props.highlight || ''} />
		},
		renderGrid: function(){
			if(this.state.grid == 'justify'){
				return this.props.data.map((item, idx) => this.renderList(item, idx));
			} else if(this.state.grid == 'column'){
				var size = Math.ceil(this.props.data.length / 2);
				var c1 = this.props.data.slice(0, size).map((item, idx) => this.renderList(item, idx));
				var c2 = this.props.data.slice(size).map((item, idx) => this.renderList(item, idx));
				return [<div className="art-column" key={0}>{c1}</div>, <div className="art-column" key={1}>{c2}</div>]
			}
		},
		renderHolder: function(){
			if(this.props.holderTxt && this.props.data.length == 0){
				return (
					<div className="list-blank-holder">
						<span>{this.props.holderTxt}</span>
					</div>
				)
			}
		},
		render: function(){
			return (
				<div className="art-list" ref="container">
					{this.renderGrid()}
					{this.renderHolder()}
				</div>
			)
		}
	});

	return List
})