'use strict';

define(['mods', paths.ex.page + '/advices/manager/media/rank.js', paths.rcn.util + '/rest.js', paths.rcn.comps + '/search.js', paths.rcn.comps + '/loader.js'], function (mods, Rank, Rest, Search, Loader) {
	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var Pagination = mods.Pagination;

	var rest = Rest.ex();
	rest.user.add('last');
	rest.user.add('rank');

	function parse(data) {
		return data.reduce(function (obj, item, idx) {
			item._index = idx;
			obj[item.mid] = item;
			return obj;
		}, {});
	}

	var MediaIndex = React.createClass({
		displayName: 'MediaIndex',

		contextTypes: {
			updateNav: PropTypes.func
		},
		getInitialState: function getInitialState() {
			return {
				list: {},
				historyList: {},
				input: '',
				listStatus: 'history',
				hasModified: false,
				page: 0,
				listTotal: 0,
				loading: false
			};
		},
		componentDidMount: function componentDidMount() {
			this.loadHistory();
		},
		loadHistory: function loadHistory() {
			var _this = this;

			rest.user.last.read('media').done(function (data) {
				_this.setState({ historyList: parse(data), hasModified: false });
			});
		},
		search: function search() {
			var _this2 = this;

			if (this.state.input.length == 0) return;
			this.setState({ listStatus: 'search', loading: true });
			$.when(rest.media.read('search', {
				query: this.state.input,
				page: 0
			}).done(function (data) {
				_this2.setState({ list: parse(data) });
			}), rest.media.read('search', {
				query: this.state.input,
				count: true
			}).done(function (data) {
				_this2.setState({ listTotal: data.count });
			})).always(function () {
				return _this2.setState({ loading: false });
			});
		},
		inputHandler: function inputHandler(val) {
			this.setState({
				input: val
			});
			// 显示历史记录
			if (val.length == 0) {
				this.setState({
					listStatus: 'history'
				});
				if (this.state.hasModified) {
					this.loadHistory();
				}
			}
		},
		modifyRank: function modifyRank(mid, rank) {
			var _this3 = this;

			rest.user.rank.update('media', { mid: mid, rank: rank }).done(function (data) {
				_this3.setState({ hasModified: true });
			});
		},
		pageChangeHandler: function pageChangeHandler(page) {
			var _this4 = this;

			$('.frame-body-right').scrollTop(0);
			this.setState({ page: page - 1, loading: 1 });
			rest.media.read('search', {
				query: this.state.input,
				page: page - 1
			}).done(function (data) {
				_this4.setState({ list: parse(data), loading: 0 });
			});
		},
		renderList: function renderList() {
			var _this5 = this;

			var data,
			    status = this.state.listStatus,
			    nodes;
			if (status == 'history') data = this.state.historyList;else if (status == 'search') data = this.state.list;
			data = Object.keys(data).map(function (mid) {
				return data[mid];
			}).sort(function (a, b) {
				return a._index - b._index;
			});

			var replace_r = new RegExp(this.state.input, 'gi');

			function replace(str, key) {
				return str;
				if (!str || key == '') return str;
				var reg = new RegExp(key, 'gi');
				str = str.replace(reg, function (match) {
					return "<em>" + match + "</em>";
				});
				return str;
			}

			if (data.length == 0) {
				if (status == 'search') nodes = React.createElement(
					'li',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无纪录，您可输入公众号名称／关键字进行搜索'
					)
				);else if (status == 'history') nodes = React.createElement(
					'li',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无历史记录'
					)
				);
			} else {
				nodes = data.map(function (item, idx) {
					return React.createElement(
						'li',
						{ className: 'list-item', key: idx },
						React.createElement(
							'table',
							null,
							React.createElement(
								'tbody',
								null,
								React.createElement(
									'tr',
									null,
									React.createElement(
										'td',
										null,
										React.createElement('div', { className: 'img', style: { 'backgroundImage': 'url(' + (paths.ex.eximg + item.avater) + ')' } })
									),
									React.createElement(
										'td',
										{ className: 'content' },
										React.createElement(
											'div',
											null,
											React.createElement('a', { href: item.url, className: 'title', dangerouslySetInnerHTML: { __html: replace(item.name, _this5.state.input) }, target: '_blank' }),
											React.createElement(
												'span',
												{ className: 'subtitle' },
												item.product_form
											)
										),
										React.createElement(
											'div',
											{ className: 'desc' },
											React.createElement('span', { dangerouslySetInnerHTML: { __html: replace(item.desc, _this5.state.input) } })
										),
										React.createElement(
											'div',
											{ className: 'cate' },
											item.tags && item.tags instanceof Array && item.tags.map(function (tag, idx) {
												return React.createElement(
													'span',
													{ className: "item" + (tag == _this5.state.input ? ' active' : ''), key: idx },
													tag
												);
											})
										)
									),
									React.createElement(
										'td',
										{ className: 'ranks' },
										React.createElement(
											'p',
											{ className: 'tc mb5' },
											'关注度'
										),
										React.createElement(Rank, { onChange: function onChange(r) {
												return _this5.modifyRank(item.mid, r);
											}, rank: item.rank })
									)
								)
							)
						)
					);
				});
			}

			return nodes;
		},
		render: function render() {
			var _this6 = this;

			var listTip = function listTip() {
				if (_this6.state.listStatus == 'history') return React.createElement(
					'span',
					null,
					'历史记录'
				);else if (_this6.state.listStatus == 'search') {
					return React.createElement(
						'div',
						null,
						React.createElement(
							'span',
							null,
							'为您找到相关结果约',
							React.createElement(
								'var',
								{ className: 'count' },
								_this6.state.listTotal
							),
							'条'
						),
						React.createElement(
							'span',
							{ className: 'fr' },
							'未找到需要的媒体，可',
							React.createElement(
								'a',
								{ className: 'intxt', href: paths.rcn.base + '/feedback#/media' },
								'申请添加'
							)
						)
					);
				}
			};
			var pagin = function pagin() {
				if (_this6.state.listStatus == 'search' && !$.isEmptyObject(_this6.state.list) && _this6.state.listTotal / 20 > 1) {
					return React.createElement(Pagination, { current: _this6.state.page + 1, total: _this6.state.listTotal, onChange: function onChange(page) {
							return _this6.pageChangeHandler(page);
						}, className: 'tc mt30 v2 pb30', pageSize: 20 });
				}
			};
			return React.createElement(
				'div',
				{ className: 'advices-manager-media-v2' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'section',
						{ className: 'search-part' },
						React.createElement(Search, { size: 'md', placeholder: '输入您想要查找的公众号名称/关键字描述', value: this.state.input, onChange: function onChange(e) {
								return _this6.inputHandler(e.target.value);
							}, onSearch: this.search })
					),
					React.createElement(
						'div',
						null,
						React.createElement(
							'section',
							{ className: 'info-part' },
							listTip()
						),
						React.createElement(
							'ul',
							{ className: 'list-part' },
							this.renderList()
						)
					),
					pagin()
				),
				React.createElement(Loader, { fix: true, show: this.state.loading })
			);
		}
	});

	return MediaIndex;
});