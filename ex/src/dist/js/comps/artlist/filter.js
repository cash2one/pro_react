'use strict';

define(['mods', paths.rcn.comps + '/search.js'], function (mods, Search) {
	var React = mods.ReactPack.default;

	var Filter = React.createClass({
		displayName: 'Filter',

		componentDidUpdate: function componentDidUpdate() {
			this.refs.search.getDOMNode().querySelector('input').value = this.props.selected.search;
		},
		handleClick: function handleClick(key, item) {
			this.props.onChange && this.props.onChange(key, item);
		},
		renderFilter: function renderFilter() {
			var _this = this;

			var data = this.props.renderData;
			var selected = this.props.selected;
			var nodes = Object.keys(data).map(function (key, idx) {
				var filter = data[key];
				return React.createElement(
					'tr',
					{ key: idx },
					React.createElement(
						'td',
						null,
						filter.title,
						':'
					),
					React.createElement(
						'td',
						null,
						filter.items.map(function (item, i) {
							if (selected[key] == item.key) {
								return React.createElement(
									'a',
									{ key: i, className: 'item active' },
									item.title
								);
							} else {
								return React.createElement(
									'a',
									{ key: i, className: 'item', onClick: function onClick() {
											return _this.handleClick(key, item);
										} },
									item.title
								);
							}
						})
					)
				);
			});

			return nodes;
		},
		renderFresh: function renderFresh() {
			if (this.props.fresh == 'true') {
				return React.createElement(
					'div',
					{ className: 'fresh-bar' },
					React.createElement(
						'span',
						{ className: 'vm' },
						'截至',
						this.props.updateAt
					),
					React.createElement(
						'span',
						{ className: "btn" + (this.props.updating ? ' active' : ''), onClick: this.props.onUpdate },
						React.createElement('span', { className: 'refresh iconfont icon-shuaxin' }),
						React.createElement(
							'span',
							{ className: 'ml10 vm' },
							this.props.updating ? '刷新中...' : '刷新'
						)
					)
				);
			}
		},
		render: function render() {
			var _this2 = this;

			var filter = this.props.selected;
			return React.createElement(
				'div',
				{ className: 'ab-fltb' },
				React.createElement(
					'div',
					{ className: 'hd' },
					React.createElement(
						'div',
						{ className: 'tit' },
						React.createElement(
							'span',
							null,
							'筛选设置'
						)
					),
					React.createElement(
						'div',
						{ className: 'sch' },
						React.createElement(
							'div',
							{ className: 'ib vm' },
							React.createElement(Search, { onSearch: function onSearch(val) {
									return _this2.handleClick('search', { key: $.trim(val) });
								}, defaultValue: filter.search, ref: 'search' })
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'bd' },
					React.createElement(
						'table',
						{ className: 'table' },
						this.renderFilter()
					)
				)
			);
		}
	});

	return Filter;
});