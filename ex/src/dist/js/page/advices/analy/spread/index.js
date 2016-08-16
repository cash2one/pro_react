'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal/index.js', paths.rcn.comps + '/loader.js'], function (mods, Rest, Modal, Loader) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;

	var rest = Rest.spread();
	rest.article.add('index');
	rest.article.add('media');
	var env = {
		debug: false
	};

	var Spread = React.createClass({
		displayName: 'Spread',

		getInitialState: function getInitialState() {
			return {
				params: {
					q: '',
					begin: 0,
					limit: 10
				},
				tab: '全库文章',
				order: '最新转载',
				data: {},
				count: 0,
				searchError: false,
				submit2ModalShow: false,
				submit2DataId: null,
				submitModalShow: false,
				searchResultBlank: false,
				loading: false
			};
		},
		componentDidMount: function componentDidMount() {
			this.getData();
			this.getCount();
		},
		componentDidUpdate: function componentDidUpdate() {
			if (this.state.submitModalShow) {
				this.submitModalDidMount();
			}
			if (this.state.submit2ModalShow) {
				this.submit2ModalDidMount();
			}
		},
		ddTog: function ddTog() {
			var d = $('#dd_option').css('display');
			if (d == 'none') {
				$('#dd_option').toggle(100);
				$(document).one('click', function () {
					return $('#dd_option').toggle(100);
				});
			}
		},
		getData: function getData() {
			var _this = this;

			var data;
			if (env.debug) {
				if (this.state.tab == '事件文章') {
					data = [{
						spread_uuid: 1,
						title: 'ev - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 0,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "这是文章的正文内容，所有CSS全部丢了，只保留段落标识。",
						from: {
							media: "百度百家",
							mid: "1005"
						}
					}, {
						spread_uuid: 2,
						title: 'ev - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "【解说】5月15日零时起，全国铁路实行新的列车运行图，这是近10年来铁路实施的最大范围列车运行图调整，也是铁路运输能力增量最大的一次调整。据最新铁路运行图安排，5月15日起首次开通上海虹桥站至北京南站的“红眼高铁”列车...",
						from: {
							media: "百度百家",
							mid: "1005"
						}
					}];
				} else if (this.state.tab == '全库文章') {
					data = [{
						spread_uuid: 1,
						title: 'art - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "这是文章的正文内容，所有CSS全部丢了，只保留段落标识。",
						from: {
							media: "百度百家",
							mid: "1005"
						}
					}, {
						spread_uuid: 2,
						title: 'art - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "【解说】5月15日零时起，全国铁路实行新的列车运行图，这是近10年来铁路实施的最大范围列车运行图调整，也是铁路运输能力增量最大的一次调整。据最新铁路运行图安排，5月15日起首次开通上海虹桥站至北京南站的“红眼高铁”列车...",
						from: {
							media: "百度百家",
							mid: "1005"
						}
					}];
				}
				data = data.reduce(function (obj, item, i) {
					item['_i'] = i;
					obj[item['spread_uuid']] = item;
					return obj;
				}, {});

				this.setState({ data: data });
			} else {
				if (this.state.tab == '全库文章') {
					this.setState({ loading: true });
					rest.article.read('search', this.state.params).done(function (data) {
						_this.setState({ loading: false });
						if (data.length > 0) {
							data = data.reduce(function (obj, item, i) {
								item['_i'] = i;
								obj[item['spread_uuid']] = item;
								return obj;
							}, {});
							_this.setState({
								data: data,
								searchResultBlank: false
							});
						} else {
							_this.setState({
								data: {},
								searchResultBlank: true
							});
						}
					});
				} else if (this.state.tab == '事件文章') {
					this.setState({ data: {}, searchResultBlank: true });
				}
			}
		},
		getCount: function getCount() {
			var _this2 = this;

			rest.article.read('search', $.extend({}, this.state.params, { count: true })).done(function (_ref) {
				var _ref$count = _ref.count;
				var count = _ref$count === undefined ? 0 : _ref$count;

				_this2.setState({ count: count });
			});
		},
		search: function search() {
			var _this3 = this;

			var val = this.refs.search.value;
			var next = _extends({}, this.state);

			if (val != this.state.params.q) {
				next.params.q = val;

				if (val.length == 0) {
					next.tab = '事件文章';
					next.searchError = false;
				} else if (val.length > 0 && val.length < 2) {
					next.searchError = true;
				} else {
					next.searchError = false;
					next.searchResultBlank = false;
					next.tab = '全库文章';
				}

				if (!next.searchError) {
					this.setState(next, function () {
						_this3.getData();
						_this3.getCount();
					});
				} else this.setState(next);
			}
		},
		renderList: function renderList() {
			var _this4 = this;

			var lib = this.state.data,
			    data = Object.keys(lib).map(function (id) {
				return lib[id];
			}).sort(function (a, b) {
				return a._i - b._i;
			}),
			    nodes = null,
			    searchError = this.state.searchError,
			    searchResultBlank = this.state.searchResultBlank;
			if (searchError == false && !searchResultBlank) {
				nodes = React.createElement(
					'div',
					{ className: 'list-wrap cf' },
					data.map(function (dat, idx) {
						return React.createElement(
							'div',
							{ className: 'item', key: idx },
							React.createElement(
								'div',
								{ className: 'hd' },
								React.createElement(
									'div',
									{ className: 'title' },
									React.createElement(
										'a',
										{ target: '_blank' },
										dat.title
									)
								),
								dat.status == 1 ? React.createElement(
									'a',
									{ href: paths.ex.base + '/analy#/spread/detail', className: 'status' },
									'查看分析'
								) : React.createElement(
									'span',
									{ className: 'status', onClick: function onClick() {
											return _this4.setState({ submit2ModalShow: true, submit2DataId: dat.spread_uuid });
										} },
									'未分析'
								)
							),
							React.createElement(
								'div',
								{ className: 'bd' },
								React.createElement(
									'p',
									{ className: 'desc' },
									dat.content
								)
							),
							React.createElement(
								'div',
								{ className: 'ft' },
								React.createElement(
									'span',
									null,
									dat.publish_at
								),
								React.createElement(
									'span',
									{ className: 'ml15' },
									(dat.reship_count || 0) + '篇转发'
								)
							)
						);
					})
				);
			}

			return nodes;
		},
		renderRes: function renderRes() {
			var node = null;
			if (this.state.searchError) {
				node = React.createElement(
					'section',
					{ className: 'res-blank' },
					React.createElement(
						'p',
						null,
						'搜索词 “' + this.state.params.q + '” 少于两个字符。'
					),
					React.createElement(
						'p',
						null,
						'请输入两个字符以上且有意义的搜索词，系统将为您匹配更精准的搜索结果。'
					)
				);
			}
			return node;
		},
		togOrder: function togOrder(order) {
			this.setState({ order: order });
		},
		renderListWrap: function renderListWrap() {
			var _this5 = this;

			var node = null;
			var renderB = function renderB() {
				var q = _this5.state.params.q,
				    tab = _this5.state.tab;
				return React.createElement(
					'span',
					null,
					tab + (q.length > 0 ? ' > “' + q + "”" : '')
				);
			};
			if (this.state.searchError == false && !this.state.searchResultBlank) {
				node = React.createElement(
					'section',
					{ className: 'list-part pr' },
					React.createElement(
						'div',
						{ className: 'con' },
						React.createElement(
							'div',
							{ className: 'hd cf' },
							React.createElement(
								'div',
								{ className: 'l' },
								renderB(),
								React.createElement(
									'span',
									{ className: 'count' },
									'共' + this.state.count + '篇文章'
								)
							),
							React.createElement(
								'div',
								{ className: 'r' },
								React.createElement(
									'div',
									{ className: 'c-dropdown', onClick: this.ddTog },
									React.createElement(
										'div',
										{ className: 'select', type: 'button' },
										React.createElement(
											'span',
											{ className: 'txt' },
											this.state.order
										),
										React.createElement(
											'span',
											{ className: 'ic' },
											React.createElement('span', { className: 'iconfont icon-xiala' })
										)
									),
									React.createElement(
										'ul',
										{ className: 'option dn', id: 'dd_option' },
										React.createElement(
											'li',
											{ className: 'f14', onClick: function onClick() {
													return _this5.togOrder('最新转载');
												} },
											'最新转载'
										),
										React.createElement(
											'li',
											{ className: 'f14', onClick: function onClick() {
													return _this5.togOrder('最多转载');
												} },
											'最多转载'
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'bd' },
							this.renderList(),
							this.renderPagin()
						)
					),
					React.createElement(Loader, { show: this.state.loading })
				);
			}
			return node;
		},
		renderSubmit2: function renderSubmit2() {
			var show = this.state.submit2ModalShow,
			    submit2DataId = this.state.submit2DataId,
			    node = null;
			if (show) {
				node = React.createElement(
					Modal,
					{ show: true, title: '提交要分析的文章', dismiss: this.closeSubmit2Modal, confirm: this.submit2Confirm },
					React.createElement(
						'form',
						{ id: 'submit2Form' },
						React.createElement(
							'label',
							{ htmlFor: 'submit2_desc' },
							'说明'
						),
						React.createElement('textarea', { id: 'submit2_desc', rows: '10', name: 'desc' }),
						React.createElement('input', { type: 'hidden', name: 'title', value: this.state.data[submit2DataId].title }),
						React.createElement('input', { type: 'hidden', name: 'uuid', value: submit2DataId }),
						React.createElement('div', { className: 'm-warn' })
					)
				);
			}
			return node;
		},
		submit2ModalDidMount: function submit2ModalDidMount() {
			this.submit2ModalValidater = $('#submit2Form').validate({
				rules: {
					desc: {
						required: true
					}
				},
				messages: {
					desc: {
						required: "说明不能为空"
					}
				},
				errorPlacement: function errorPlacement(error, element) {
					error.appendTo($('#submit2Form .m-warn'));
				}
			});
		},
		submit2Confirm: function submit2Confirm() {
			var form = $('#submit2Form').get(0);
			if (this.submit2ModalValidater.form()) {
				var data = {
					article_title: form.title.value,
					spread_detail: form.desc.value,
					article_uuid: form.uuid.value
				};
				this.submit2ModalValidater = null;
				this.closeSubmit2Modal();
				// rest.article.create(data)
			}
		},
		closeSubmit2Modal: function closeSubmit2Modal() {
			this.setState({ submit2ModalShow: false }, function () {
				return $('#submit2Form').remove();
			});
		},
		renderSubmit: function renderSubmit() {
			var node = null;
			if (this.state.submitModalShow) {
				var data = {
					submit_title: this.state.params.q
				};
				node = React.createElement(
					Modal,
					{ show: true, title: '提交要分析的文章', dismiss: this.closeSubmitModal, confirm: this.confirmSubmitModal },
					React.createElement(
						'form',
						{ id: 'submitForm' },
						React.createElement(
							'label',
							{ htmlFor: 'submit_title' },
							'文章标题'
						),
						React.createElement('input', { id: 'submit_title', type: 'text', name: 'title', defaultValue: data.submit_title }),
						React.createElement(
							'label',
							{ htmlFor: 'submit_url' },
							'链接地址'
						),
						React.createElement('input', { id: 'submit_url', type: 'text', name: 'url' }),
						React.createElement(
							'label',
							{ htmlFor: 'submit_desc' },
							'说明'
						),
						React.createElement('textarea', { id: 'submit_desc', rows: '4', name: 'desc' }),
						React.createElement('div', { className: 'm-warn' })
					)
				);
			}

			return node;
		},
		submitModalDidMount: function submitModalDidMount() {
			this.submitModalValidater = $('#submitForm').validate({
				rules: {
					title: {
						required: true
					},
					url: {
						required: true
					},
					desc: {
						required: true
					}
				},
				messages: {
					title: {
						required: "文章标题不能为空"
					},
					url: {
						required: "链接地址不能为空"
					},
					desc: {
						required: "说明不能为空"
					}
				},
				errorPlacement: function errorPlacement(error, element) {
					error.appendTo($('#submitForm .m-warn'));
				}
			});
		},
		closeSubmitModal: function closeSubmitModal() {
			this.setState({ submitModalShow: false }, function () {
				return $('#submitForm').remove();
			});
		},
		confirmSubmitModal: function confirmSubmitModal() {
			var form = $('#submitForm').get(0);
			if (this.submitModalValidater.form()) {
				var data = {
					article_title: form.title.value,
					article_url: form.url.value,
					spread_detail: form.desc.value
				};
				this.submitModalValidater = null;
				this.closeSubmitModal();
				// rest.article.create(data)
			}
		},
		renderPagin: function renderPagin() {
			var _this6 = this;

			var node = null;
			var change = function change(page) {
				var params = $.extend({}, _this6.state.params);
				params.begin = (page - 1) * params.limit;
				_this6.setState({ params: params }, _this6.getData);
				_this6.refs.search.value = params.q;
			};
			var begin = this.state.params.begin,
			    limit = this.state.params.limit;
			begin = begin >= 0 ? begin : 0;
			node = React.createElement(
				'div',
				{ className: 'pagin-part' },
				React.createElement(Pagination, { current: Math.floor(begin / limit) + 1, total: this.state.count, pageSize: 10, onChange: change })
			);
			return node;
		},
		renderBlank: function renderBlank() {
			var _this7 = this;

			var node = null,
			    q = this.state.params.q;

			if (this.state.searchResultBlank && !this.state.searchError) {
				node = React.createElement(
					'section',
					{ className: 'res-blank' },
					React.createElement(
						'p',
						null,
						'标题为“' + q + '”的文章未被收录，请提交分析。'
					),
					React.createElement(
						'p',
						null,
						'提交后系统将再次更新数据。'
					),
					React.createElement(
						'div',
						{ className: 'btn-wrap' },
						React.createElement(
							'button',
							{ className: 'c-button', onClick: function onClick() {
									return _this7.setState({ submitModalShow: true });
								} },
							'提交分析'
						)
					)
				);
			}

			return node;
		},
		renderSubmitSuccess: function renderSubmitSuccess() {
			var node = null;
			node = React.createElement(
				'section',
				{ className: 'res-blank' },
				React.createElement(
					'p',
					{ className: 'green' },
					'标题为“123”的文章正在收录中，请耐心等待。'
				),
				React.createElement(
					'p',
					{ className: 'green' },
					'如需加急服务，请致电管理员。'
				)
			);

			return null;
		},
		render: function render() {
			var _this8 = this;

			return React.createElement(
				'div',
				{ className: 'advices-analy-spread fr-mid w1200 pb30' },
				React.createElement(
					'h1',
					{ className: 'head' },
					'传播分析'
				),
				React.createElement(
					'section',
					{ className: 'search-part' },
					React.createElement(
						'div',
						{ className: 'wrap' },
						React.createElement(
							'div',
							{ className: 'sch-wrap' },
							React.createElement(
								'div',
								{ className: 'sch-l' },
								React.createElement(
									'div',
									{ className: 'ico' },
									React.createElement('span', { className: 'iconfont icon-sousuo' })
								)
							),
							React.createElement('input', { type: 'text', className: 'sch-input', ref: 'search', onKeyDown: function onKeyDown(e) {
									return e.keyCode == 13 && _this8.search(e);
								} }),
							React.createElement(
								'div',
								{ className: 'sch-r', onClick: this.search },
								React.createElement(
									'span',
									{ className: 'sch-btn' },
									'搜索'
								)
							)
						)
					)
				),
				this.renderListWrap(),
				this.renderRes(),
				this.renderBlank(),
				this.renderSubmitSuccess(),
				this.renderSubmit2(),
				this.renderSubmit()
			);
		}
	});

	return Spread;
});