'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var Drop = React.createClass({
		displayName: 'Drop',
		getInitialState: function getInitialState() {
			return { open: false };
		},
		clickHandler: function clickHandler() {
			var _this = this;

			if (!this.state.open) {
				this.setState({ open: true });
				$(document).one('click', function () {
					_this.setState({ open: false });
				});
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: "order-item" + (this.state.open ? ' active' : '') + this.props.className || '', ref: 'wrap' },
				React.createElement(
					'div',
					{ className: 'holder', onClick: this.clickHandler },
					React.createElement(
						'span',
						null,
						this.props.holderTxt || ''
					)
				),
				React.createElement(
					'ul',
					{ className: 'dropdown-list' },
					this.props.children
				)
			);
		}
	});

	var Order = React.createClass({
		displayName: 'Order',
		toggleClick: function toggleClick(key, value) {
			if (this.props.toggleClick) this.props.toggleClick(key, value);
		},
		renderOrderTime: function renderOrderTime() {
			var _this2 = this;

			var _props = this.props;
			var queryParams = _props.queryParams;
			var defaultParams = _props.defaultParams;

			var node,
			    sort = queryParams['sort'],
			    defaultSort = defaultParams['sort'];
			// if([defaultSort, 'publish_at_desc', 'publish_at_asc', 'reship_desc', 'reship_asc', 'reship_exactly_desc', 'reship_exactly_asc', 'level_desc', 'level_asc', 'medium_desc', 'medium_asc', 'warn_desc', 'warn_asc', 'heat_desc', 'heat_asc'].indexOf(sort) != -1){
			var txt = '时间排序';
			switch (sort) {
				case 'publish_at_desc':
					txt = '发布时间降序';
					break;
				case 'publish_at_asc':
					txt = '发布时间升序';
					break;
				// case 'reship_desc':
				// 	txt = ': 文章转载数降序';
				// 	break;
				// case 'reship_asc':
				// 	txt = ': 文章转载数升序';
				// 	break;
				// case 'reship_exactly_desc':
				// 	txt = ': 文章显性转载数降序';
				// 	break;
				// case 'reship_exactly_asc':
				// 	txt = ': 文章显性转载数升序';
				// 	break;
				// case 'level_desc':
				// 	txt = ': 媒体等级降序';
				// 	break;
				// case 'level_asc':
				// 	txt = ': 媒体等级升序';
				// 	break;
				// case 'medium_desc':
				// 	txt = ': 媒体名称降序';
				// 	break;
				// case 'medium_asc':
				// 	txt = ': 媒体名称升序';
				// 	break;
				// case 'warn_desc':
				// 	txt = ': 预警状态降序';
				// 	break;
				// case 'warn_asc':
				// 	txt = ': 预警状态升序';
				// 	break;
				// case 'heat_desc':
				// 	txt = ': 文章热度降序';
				// 	break;
				// case 'heat_asc':
				// 	txt = ': 文章热度升序';
				// 	break;
				default:
					break;
			}
			node = React.createElement(
				Drop,
				{ holderTxt: txt, className: sort == 'publish_at_desc' || sort == 'publish_at_asc' ? ' selected' : '' },
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return sort != 'publish_at_desc' && _this2.toggleClick('sort', 'publish_at_desc');
						} },
					'发布时间降序'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return sort != 'publish_at_asc' && _this2.toggleClick('sort', 'publish_at_asc');
						} },
					'发布时间升序'
				),
				sort == 'publish_at_asc' || sort == 'publish_at_desc' ? React.createElement(
					'li',
					{ className: 'dropdown-item' },
					React.createElement(
						'span',
						{ className: 'button', onClick: function onClick() {
								return _this2.toggleClick('sort', '');
							} },
						'取消'
					)
				) : null
			);
			// }

			return node;
		},
		renderOrderHeat: function renderOrderHeat() {
			var _this3 = this;

			var _props2 = this.props;
			var queryParams = _props2.queryParams;
			var defaultParams = _props2.defaultParams;

			var node,
			    heat = queryParams['sort'],
			    defaultSort = defaultParams['sort'];
			// if([defaultSort, 'heat_desc', 'heat_asc', 'reship_desc', 'reship_asc', 'reship_exactly_desc', 'reship_exactly_asc', 'level_desc', 'level_asc', 'medium_desc', 'medium_asc', 'warn_desc', 'warn_asc', 'heat_desc', 'heat_asc'].indexOf(heat) != -1){
			var txt = '热度排序';
			switch (heat) {
				case 'heat_desc':
					txt = '文章热度降序';
					break;
				case 'heat_asc':
					txt = '文章热度升序';
					break;
				default:
					break;
			}
			node = React.createElement(
				Drop,
				{ holderTxt: txt, className: heat == 'heat_desc' || heat == 'heat_asc' ? ' selected' : '' },
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return heat != 'heat_desc' && _this3.toggleClick('sort', 'heat_desc');
						} },
					'文章热度降序'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return heat != 'heat_asc' && _this3.toggleClick('sort', 'heat_asc');
						} },
					'文章热度升序'
				)
			);
			// }

			return node;
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'order-box' },
				this.renderOrderTime()
			);
		}
	});

	return Order;
});