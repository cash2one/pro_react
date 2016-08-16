'use strict';

define(['mods', paths.ex.comps + '/artlist/list-item.js'], function (mods, ListItem) {
	var React = mods.ReactPack.default;

	var List = React.createClass({
		displayName: 'List',

		getInitialState: function getInitialState() {
			return {
				grid: 'justify'
			};
		},
		componentDidMount: function componentDidMount() {
			window.addEventListener('resize', this.setGrid, false);
			this.setGrid();
		},
		componentWillUnmount: function componentWillUnmount() {
			window.removeEventListener('resize', this.setGrid, false);
		},
		setGrid: function setGrid() {
			if (this.refs.container.offsetWidth <= 1438) {
				if (this.state.grid != 'justify') this.setState({ grid: 'justify' });
			} else {
				if (this.state.grid != 'column') this.setState({ grid: 'column' });
			}
		},
		selectHandler: function selectHandler(uuid) {
			this.props.onSelect && this.props.onSelect(uuid);
		},
		renderList: function renderList(data, idx) {
			var _this = this;

			return React.createElement(ListItem, { key: idx, data: data, selected: this.props.artSelected.indexOf(data.uuid) != -1, onSelect: function onSelect(uuid) {
					return _this.selectHandler(uuid);
				}, onEmotionChange: this.props.artEmotionChange, ignoreWarn: this.props.ignoreWarn, highlight: this.props.highlight || '' });
		},
		renderGrid: function renderGrid() {
			var _this2 = this;

			if (this.state.grid == 'justify') {
				return this.props.data.map(function (item, idx) {
					return _this2.renderList(item, idx);
				});
			} else if (this.state.grid == 'column') {
				var size = Math.ceil(this.props.data.length / 2);
				var c1 = this.props.data.slice(0, size).map(function (item, idx) {
					return _this2.renderList(item, idx);
				});
				var c2 = this.props.data.slice(size).map(function (item, idx) {
					return _this2.renderList(item, idx);
				});
				return [React.createElement(
					'div',
					{ className: 'art-column', key: 0 },
					c1
				), React.createElement(
					'div',
					{ className: 'art-column', key: 1 },
					c2
				)];
			}
		},
		renderHolder: function renderHolder() {
			if (this.props.holderTxt && this.props.data.length == 0) {
				return React.createElement(
					'div',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						this.props.holderTxt
					)
				);
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'art-list', ref: 'container' },
				this.renderGrid(),
				this.renderHolder()
			);
		}
	});

	return List;
});