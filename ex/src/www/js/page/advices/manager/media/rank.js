define([
	'mods'
], function(mods, Rest){
	const React = mods.ReactPack.default;

	var Rank = React.createClass({
		getDefaultProps: function(){
			return {
				rank: 0,
				total: 4
			}
		},
		getInitialState: function(){
			return {
				rank: this.props.rank,
				hover_rank: 0,
				status: 'click'
			}
		},
		componentWillMount: function(){
			if(this.props.total < this.props.rank)
				throw ('Rank: total should ge rank');
		},
		renderStar: function(){
			var nodes = [], total = this.props.total, rank;
			if(this.state.status == 'hover')
				rank = this.state.hover_rank;
			else
				rank = this.state.rank;
			for(var i = 0; i < total; i++){
				let node;
				if(i + 1 <= rank)
					node = <span key={i} className="iconfont icon-xingxing active" data-index={i + 1}></span>
				else
					node = <span key={i} className="iconfont icon-xingxing" data-index={i + 1}></span>
				nodes.push(node)
			}
			return nodes;
		},
		mouseLeaveHandler: function(){
			this.setState({status: 'click'});
		},
		mouseMoveHandler: function(el){
			var index = el.getAttribute('data-index')
			if(index){
				this.setState({hover_rank: index, status: 'hover'});
			}
		},
		clickHandler: function(el){
			var index = el.getAttribute('data-index')
			if(index != this.state.rank){
				this.setState({rank: index})
				this.props.onChange && this.props.onChange(index);
			}
		},
		render: function(){
			return (
				<div className="c-rank" onClick={e => this.clickHandler(e.target)}>
					{this.renderStar()}
				</div>
			)
		}
	})

	return Rank
})