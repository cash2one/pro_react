'use strict';

define(['mods'], function (mods, Rest) {
	var React = mods.ReactPack.default;

	var Rank = React.createClass({
		displayName: 'Rank',

		getDefaultProps: function getDefaultProps() {
			return {
				rank: 0,
				total: 4
			};
		},
		getInitialState: function getInitialState() {
			return {
				rank: this.props.rank,
				hover_rank: 0,
				status: 'click'
			};
		},
		componentWillMount: function componentWillMount() {
			if (this.props.total < this.props.rank) throw 'Rank: total should ge rank';
		},
		renderStar: function renderStar() {
			var nodes = [],
			    total = this.props.total,
			    rank;
			if (this.state.status == 'hover') rank = this.state.hover_rank;else rank = this.state.rank;
			for (var i = 0; i < total; i++) {
				var node = void 0;
				if (i + 1 <= rank) node = React.createElement('span', { key: i, className: 'iconfont icon-xingxing active', 'data-index': i + 1 });else node = React.createElement('span', { key: i, className: 'iconfont icon-xingxing', 'data-index': i + 1 });
				nodes.push(node);
			}
			return nodes;
		},
		mouseLeaveHandler: function mouseLeaveHandler() {
			this.setState({ status: 'click' });
		},
		mouseMoveHandler: function mouseMoveHandler(el) {
			var index = el.getAttribute('data-index');
			if (index) {
				this.setState({ hover_rank: index, status: 'hover' });
			}
		},
		clickHandler: function clickHandler(el) {
			var index = el.getAttribute('data-index');
			if (index != this.state.rank) {
				this.setState({ rank: index });
				this.props.onChange && this.props.onChange(index);
			}
		},
		render: function render() {
			var _this = this;

			return React.createElement(
				'div',
				{ className: 'c-rank', onClick: function onClick(e) {
						return _this.clickHandler(e.target);
					} },
				this.renderStar()
			);
		}
	});

	return Rank;
});