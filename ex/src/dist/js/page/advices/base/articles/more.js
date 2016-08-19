'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/articles/art-list-item.js', paths.rcn.comps + '/loader.js', paths.rcn.comps + '/modal.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, R, ArtItem, Loader, Modal) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var rest = R.ex2();

	return function (Tar) {
		return React.createClass({
			getInitialState: function getInitialState() {
				return {
					show: false,
					lists: {},
					title_sign: null,
					beg: 0,
					m: 10,
					loading: 0,
					delUuid: null,
					delTitleSign: null
				};
			},
			componentDidUpdate: function componentDidUpdate(p, s) {
				if (!s.show && this.state.show && this.state.title_sign) {
					this.getData();
				}
			},
			getData: function getData() {
				var _this = this;

				this.load(1);
				$.when(this.getList(), this.getCount()).always(function () {
					return _this.load(0);
				});
			},
			getList: function getList() {
				var _this2 = this;

				return rest.article.data.read('same', {
					beg: this.state.beg,
					m: this.state.m,
					title_sign: this.state.title_sign
				}).done(function (data) {
					if (data.result) {
						_this2.setState({ lists: data.data.reduce(function (o, item, i) {
								item._i = i;
								o[item.uuid] = item;
								return o;
							}, {}) });
					}
				});
			},
			getCount: function getCount() {
				var _this3 = this;

				return rest.article.data.read('same', {
					beg: this.state.beg,
					m: this.state.m,
					count: true,
					title_sign: this.state.title_sign
				}).done(function (data) {
					if (data.result) {
						_this3.setState({ count: data.count });
					}
				});
			},
			tog: function tog(title_sign, queryParams) {
				this.setState({ show: true, title_sign: title_sign, queryParams: queryParams });
			},
			load: function load(b) {
				this.setState({ loading: b });
			},
			openDelModal: function openDelModal(uuid, title_sign) {
				this.setState({ delUuid: uuid, delTitleSign: title_sign });
				$('#tipModal').modal('show');
			},
			delHandler: function delHandler() {
				var _this4 = this;

				this.load(1);
				rest.article.update('same', {
					uuids: [this.state.delUuid],
					title_sign: this.state.delTitleSign
				}).done(function (data) {
					if (data.result) {
						$('#tipModal').modal('hide');
						if (Object.keys(_this4.state.lists).length <= 1) {
							_this4.setState({ delUuid: null, delTitleSign: null, loading: 1 }, function () {
								_this4.getList().always(function () {
									return _this4.load(0);
								});
							});
						} else {
							var lists = $.extend(true, {}, _this4.state.lists);
							delete lists[_this4.state.delUuid];
							_this4.setState({ lists: lists });
						}
					}
				}).always(function () {
					return _this4.load(0);
				});
			},
			renderList: function renderList() {
				var _this5 = this;

				var node,
				    list = Object.keys(this.state.lists).sort(function (a, b) {
					return a._i - b._i;
				}).map(function (u) {
					return _this5.state.lists[u];
				});
				if (list.length > 0) {
					node = React.createElement(
						'ul',
						null,
						list.map(function (item, idx) {
							return React.createElement(ArtItem, { moreMode: true, queryParams: {}, data: item, key: idx, clickYichu: function clickYichu() {
									return _this5.openDelModal(item.uuid, item.title_sign);
								} });
						})
					);
				} else {
					node = React.createElement(
						'div',
						{ className: 'list-blank-holder' },
						'暂无数据'
					);
				}

				return node;
			},
			renderPagin: function renderPagin() {
				var _this6 = this;

				var node;var _state = this.state;
				var beg = _state.beg;
				var count = _state.count;
				var m = _state.m;
				var jump = function jump(page) {
					page = page - 1;
					_this6.setState({ beg: page * m, loading: 1 }, function () {
						_this6.getList().always(function () {
							return _this6.load(0);
						});
					});
				};
				if (count > m) {
					node = React.createElement(
						'div',
						{ className: 'tc pagin-part' },
						React.createElement(Pagination, { current: Math.floor(+beg / +m) + 1, total: count > 99 * +m ? 99 * +m : count, pageSize: m, className: "v2 ib vm mb5", onChange: function onChange(page) {
								return jump(page);
							} }),
						count > 0 ? React.createElement(
							'span',
							{ className: 'ib vm txt' },
							'相关文章总数：' + count + '篇'
						) : null
					);
				}

				return node;
			},
			render: function render() {
				var _this7 = this;

				return this.state.show ? React.createElement(
					'div',
					{ className: 'advices-base-more' },
					React.createElement(
						'div',
						{ className: 'con' },
						React.createElement(
							'div',
							{ className: 'panel panel-default' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'相同文章'
								)
							),
							React.createElement(
								'div',
								{ className: 'panel-bd' },
								this.renderList(),
								this.renderPagin()
							),
							React.createElement(
								'div',
								{ className: 'panel-footer' },
								React.createElement(
									'div',
									{ className: 'tr' },
									React.createElement(
										'span',
										{ className: 'btn btn-lg btn-primary', onClick: function onClick() {
												return _this7.setState({ show: false, uuid: null, lists: {} });
											} },
										'返回'
									)
								)
							)
						)
					),
					React.createElement(Loader, { show: this.state.loading, fix: true }),
					React.createElement(
						Modal,
						{ id: 'tipModal', title: '温馨提示', modalSm: true, confirm: function confirm() {
								return _this7.delHandler();
							} },
						React.createElement(
							'div',
							{ className: 'tc' },
							React.createElement(
								'p',
								null,
								'您确定删除此文章吗？'
							)
						)
					)
				) : React.createElement(Tar, _extends({}, this.props, { togMore: this.tog }));
			}
		});
	};
});