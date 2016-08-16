'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var appMap = {
		'news': '新闻',
		'goods': '商品',
		'title': '标题',
		'text': '全文'
	};

	var Search = React.createClass({
		displayName: 'Search',
		getInitialState: function getInitialState() {
			return { toggleOpen: false, dirty: false };
		},
		componentDidUpdate: function componentDidUpdate(o) {
			if (this.state.dirty == false || this.props.queryParams.wd != o.queryParams.wd) this.refs.input.value = this.props.queryParams.wd;
		},
		toggleHandler: function toggleHandler() {
			var _this = this;

			if (!this.state.toggleOpen) {
				this.setState({ toggleOpen: true });
				$(document).one('click', function () {
					_this.setState({ toggleOpen: false });
				});
			}
		},
		toggleClick: function toggleClick(value) {
			if (this.props.toggle) {
				this.setState({ dirty: false });
				this.props.toggle('app', value, { 'wd': this.refs.input.value });
			}
		},
		search: function search() {
			var value = $.trim(this.refs.input.value);
			this.setState({ dirty: false });
			if (this.props.search) this.props.search(value);
		},
		render: function render() {
			var _this2 = this;

			var queryParams = this.props.queryParams;

			return React.createElement(
				'section',
				{ className: 'search-part' },
				React.createElement(
					'div',
					{ className: 'search-wrap' },
					React.createElement(
						'div',
						{ className: 'search-cell' },
						React.createElement(
							'div',
							{ className: "search-toggle" + (this.state.toggleOpen ? ' active' : '') },
							React.createElement(
								'div',
								{ className: 'holder', onClick: this.toggleHandler },
								React.createElement(
									'span',
									{ className: 'txt' },
									appMap[queryParams['app']]
								)
							),
							React.createElement(
								'ul',
								{ className: 'dropdown-list' },
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return _this2.toggleClick('title');
										} },
									React.createElement(
										'span',
										null,
										'标题'
									)
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return _this2.toggleClick('text');
										} },
									React.createElement(
										'span',
										null,
										'全文'
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'search-input' },
						React.createElement('input', { type: 'text', placeholder: '请输入您要搜索的内容', ref: 'input', onKeyDown: function onKeyDown(e) {
								return e.keyCode == 13 && _this2.search();
							}, onFocus: function onFocus(e) {
								return e.target.select();
							}, onChange: function onChange() {
								return _this2.setState({ dirty: true });
							} })
					),
					React.createElement(
						'div',
						{ className: 'search-cell', onClick: this.search },
						React.createElement(
							'div',
							{ className: 'search-button' },
							React.createElement('span', { className: 'iconfont icon-sousuo' })
						)
					)
				)
			);
		}
	});

	return Search;
});