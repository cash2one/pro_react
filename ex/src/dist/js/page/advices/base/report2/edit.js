'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.rcn.plu + '/fecha.min.js', paths.rcn.comps + '/loader.js', paths.ex.util + '/parse.js', paths.rcn.comps + '/modal.js', paths.ex.page + '/advices/base/report2/platform.js', paths.ex.page + '/advices/base/report2/index-part.js', paths.ex.page + '/advices/base/report2/art.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, Rest, DropDown, fecha, Loader, Parse, Modal, PlatForm, Index, ArtList) {
	var React = mods.ReactPack.default;
	var Link = mods.RouterPack.Link;
	var RangeCal = mods.RangeCal;
	var Pagination = mods.Pagination;
	var TransG = mods.TransGroup.default;
	var u = mods.u;

	var rest = Rest.ex2(),
	    restR = Rest.rcn();

	var restIndex = Rest.index({
		stringifyData: false
	});

	var Title = React.createClass({
		displayName: 'Title',
		getInitialState: function getInitialState() {
			return {
				edit: false
			};
		},
		editAction: function editAction(e) {
			this.props.editConfirm(e.target.value.slice(0, 20));
			this.setState({ edit: false });
		},
		render: function render() {
			var _this = this;

			var save = this.props.save,
			    edit = function edit() {
				_this.setState({ edit: true }, function () {
					var input = _this.refs.input;
					input.focus();
					if (input.setSelectionRange) input.setSelectionRange(input.value.length, input.value.length);else if (input.createTextRange) {
						var range = input.createTextRange();
						range.collapse(true);
						range.moveEnd('character', input.length);
						range.moveStart('character', input.length);
						range.select();
					}
				});
			};

			if (this.state.edit == false) {
				return React.createElement(
					'h3',
					{ className: 'panel-title report-title' },
					React.createElement(
						'div',
						{ className: 'txt notedit', onClick: edit },
						React.createElement('input', { type: 'text', className: 'form-control', value: save.title }),
						React.createElement('span', { className: 'iconfont icon-bianji' })
					),
					React.createElement(RangeCal, { showClear: false, className: 'c-time-range', value: [save.begin_at, save.end_at], onChange: this.props.editBe })
				);
			} else {
				return React.createElement(
					'h3',
					{ className: 'panel-title report-title' },
					React.createElement(
						'div',
						{ className: 'txt' },
						React.createElement('span', { className: 'iconfont icon-bianji' }),
						React.createElement('input', { type: 'text', className: 'form-control', ref: 'input', defaultValue: save.title, onBlur: this.editAction })
					),
					React.createElement(RangeCal, { showClear: false, className: 'c-time-range', value: [save.begin_at, save.end_at], onChange: this.props.editBe })
				);
			}
		}
	});

	var CrisisIndex = React.createClass({
		displayName: 'CrisisIndex',
		render: function render() {
			var cls,
			    num = +((this.props.save.info || {}).crisisIndex || 0);
			if (num > 75) cls = 'c4';else if (num > 50) cls = 'c3';else if (num > 25) cls = 'c2';else cls = 'c1';

			return React.createElement(
				'div',
				{ className: 'summary-part2' },
				React.createElement(
					'div',
					{ className: "wrap" + ' ' + cls },
					React.createElement('div', { className: 'img' }),
					React.createElement(
						'div',
						{ className: 'num' },
						React.createElement(
							'span',
							null,
							num
						)
					),
					React.createElement(
						'div',
						{ className: 'txt' },
						React.createElement(
							'span',
							null,
							'危机指数'
						)
					)
				)
			);
		}
	});

	var Edit = React.createClass({
		displayName: 'Edit',
		getInitialState: function getInitialState() {
			return {
				uuid: null,
				tips: '',
				save: {},
				data: {},
				loading: false
			};
		},
		componentWillMount: function componentWillMount() {
			var uuid = this.props.location.query.uuid;
			if (uuid) this.setState({ uuid: uuid });
		},
		componentDidMount: function componentDidMount() {
			var _this2 = this;

			$('.frame-body-right').scrollTop(0);
			if (this.state.uuid) {
				this.load(1);
				rest.report.read({ uuid: this.state.uuid }).done(function (data) {
					_this2.load(0);
					if (data.result) {
						var info = data.data.info;
						if (info == undefined) data.data.info = {};
						_this2.setState({
							save: data.data
						}, _this2.getData);
					}
				});
			} else {
				(function () {
					_this2.load(1);
					var yes = fecha.format(new Date().getTime() - 24 * 3600 * 1000, 'YYYY-MM-DD');
					restR.user.read().done(function (data) {
						_this2.load(0);
						_this2.setState({ save: {
								status: 1,
								version: 1,
								info: {},
								begin_at: yes,
								end_at: yes,
								title: (data.company || '') + '舆情监测日报'
							} }, _this2.getData);
					});
				})();
			}
		},

		contextTypes: {
			router: React.PropTypes.object.isRequired
		},
		getData: function getData() {
			var _this3 = this;

			var save = this.state.save,
			    q = [];
			this.load(1);
			// 获取危机指数
			q.push(rest.article.agg.read('query', {
				result: 'emotion',
				emotion: 'manual_positive,manual_negative,manual_neutral',
				date: save.begin_at + ',' + save.end_at
			}).done(function (data) {
				if (data.result) {
					(function () {
						var neg = data.data.emotion.filter(function (item) {
							return item.param == 'negative';
						});
						neg = neg[0] ? neg[0].count : 0;
						_this3.setState({ save: u(_this3.state.save, {
								info: {
									$apply: function $apply(info) {
										return u(info, {
											$merge: {
												crisisIndex: neg
											}
										});
									}
								}
							}) });
					})();
				}
			}));
			// 获取舆情数据
			var handler = function handler(k) {
				return rest.article.agg.read('query', {
					result: 'emotion',
					platform: k,
					emotion: 'manual_positive,manual_negative,manual_neutral',
					date: save.begin_at + ',' + save.end_at
				}).done(function (data) {
					if (data.result) {
						(function () {
							var obj = {};
							data.data.emotion.forEach(function (item) {
								obj[item['param']] = item['count'];
							});
							obj['positive'] = obj['positive'] || 0;
							obj['negative'] = obj['negative'] || 0;
							obj['neutral'] = obj['neutral'] || 0;
							_this3.setState({ save: u(_this3.state.save, {
									info: {
										$apply: function $apply(info) {
											info = info instanceof Object ? info : {};
											return u(info, {
												'articles_statis': {
													$apply: function $apply(as) {
														as = as instanceof Object ? as : {};
														return u(as, {
															$merge: _defineProperty({}, k, obj)
														});
													}
												}
											});
										}
									}
								}) });
						})();
					}
				});
			};
			['微信', '今日头条', '百度百家', 'all'].forEach(function (k) {
				return q.push(handler(k));
			});

			// 获取指数数据
			q.push(restIndex.keywords.read().done(function (data) {
				if (data) {
					(function () {
						var map = data.reduce(function (o, item) {
							o[item['id']] = item['keyword'];
							return o;
						}, {});
						data = data.map(function (item) {
							return item.id;
						});
						restIndex.keywords.read('data', {
							k: data,
							days: 30,
							from: save.end_at
						}).done(function (dat) {
							var company = {};

							for (var k in dat) {
								for (var c in dat[k]) {
									if (c == 'day') continue;
									if (company[c] == undefined) company[c] = {};
									company[c][map[k]] = dat[k][c];
									company['day'] = dat[k]['day'];
								}
							}

							_this3.setState({ save: u(_this3.state.save, {
									info: {
										$apply: function $apply(info) {
											return u(info, {
												index: {
													$set: company
												}
											});
										}
									}
								}) });
						});
					})();
				}
			}));

			q.push(rest.article.data.read('query', {
				emotion: 'manual_negative',
				date: save.begin_at + ',' + save.end_at,
				similar: true
			}).done(function (data) {
				if (data.result) {
					_this3.setState({ data: u(_this3.state.data, {
							focus_articles: {
								$set: data.data
							}
						}) });
					if (save.status == 1) {
						_this3.setState({ save: u(_this3.state.save, {
								info: {
									$apply: function $apply(info) {
										return u(info, {
											focus_articles: {
												$set: data.data
											}
										});
									}
								}
							}) });
					}
				}
			}));
			$.when.apply(null, q).always(function () {
				return _this3.load(0);
			});
		},
		load: function load(b) {
			this.setState({ loading: b });
		},
		saveHandler: function saveHandler() {
			var _this4 = this;

			var save = $.extend(true, {}, this.state.save);
			if (save.status == 1) save.status = 2;
			save = u(save, {
				info: {
					$apply: function $apply(info) {
						return u(info, {
							focus_articles: {
								$set: _this4.refList.getList().map(function (item) {
									return {
										uuid: item.uuid,
										similar_count: item.similar_count
									};
								})
							}
						});
					}
				}
			});
			this.load(1);
			rest.reports.create(save).done(function (data) {
				_this4.load(0);
				_this4.context.router.push({
					pathname: 'report2/view',
					query: {
						uuid: data.uuid
					}
				});
			});
		},
		render: function render() {
			var _this5 = this;

			var save = this.state.save,
			    saveInfo = save.info || {},
			    data = this.state.data,
			    editTitle = function editTitle(val) {
				_this5.setState({ save: $.extend({}, _this5.state.save, { title: val }) });
			},
			    editBe = function editBe(val) {
				var begin_at = val[0],
				    end_at = val[1];
				_this5.setState({ save: $.extend({}, _this5.state.save, { begin_at: begin_at, end_at: end_at }) }, function () {
					return _this5.getData();
				});
			},
			    editDesc = function editDesc(val) {
				return _this5.setState({
					save: u(_this5.state.save, {
						info: {
							$apply: function $apply(info) {
								return u(info, {
									$merge: {
										summaryDesc: val
									}
								});
							}
						}
					})
				});
			},
			    select = function select(art) {
				_this5.setState({
					save: u(_this5.state.save, {
						info: {
							$apply: function $apply(info) {
								return u(info, {
									'focus_articles': {
										$apply: function $apply(fa) {
											fa = fa instanceof Array ? fa : [];
											return u(fa, {
												$push: [art]
											});
										}
									}
								});
							}
						}
					})
				});
			},
			    unselect = function unselect(art) {
				var list = _this5.state.save.info.focus_articles,
				    idx = void 0;
				list.forEach(function (item, i) {
					if (item.uuid == art.uuid) idx = i;
				});
				if (idx != undefined) {
					_this5.setState({
						save: u(_this5.state.save, {
							info: {
								$apply: function $apply(info) {
									return u(info, {
										'focus_articles': {
											$splice: [[idx, 1]]
										}
									});
								}
							}
						})
					});
				}
			};
			return React.createElement(
				'div',
				{ className: 'advices-base-report-detail-v2' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(Title, { save: save, editConfirm: editTitle, editBe: editBe })
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'日报综述'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(
										'div',
										{ className: 'summary-part' },
										React.createElement('textarea', { value: saveInfo.summaryDesc || '', className: 'form-control', placeholder: '请输入综述...', onChange: function onChange(e) {
												return editDesc(e.target.value);
											} }),
										React.createElement('span', { className: 'iconfont icon-duihua' })
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'危机指数'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(CrisisIndex, { save: save })
								)
							),
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'舆情数据'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(PlatForm, { save: save })
								)
							),
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'搜索指数'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(Index, { save: save })
								)
							),
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'文章摘录'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(ArtList, { ref: function ref(r) {
											return _this5.refList = r;
										}, data: data, save: save, select: select, unselect: unselect })
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer tr' },
							React.createElement(
								'a',
								{ className: 'btn btn-primary btn-lg', onClick: this.saveHandler },
								'保存&预览'
							),
							React.createElement(
								'span',
								{ className: 'btn btn-default btn-lg ml10', onClick: function onClick() {
										return window.history.go(-1);
									} },
								'取消'
							)
						)
					)
				),
				React.createElement(
					Modal,
					{ id: 'tipModal', modalSm: true, noBtn: true },
					React.createElement(
						'div',
						{ className: 'm-msg' },
						React.createElement(
							'p',
							null,
							this.state.tips
						)
					)
				),
				React.createElement(Loader, { show: this.state.loading, fix: true })
			);
		}
	});

	return Edit;
});