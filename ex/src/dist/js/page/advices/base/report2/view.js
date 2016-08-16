'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.rcn.plu + '/fecha.min.js', paths.rcn.comps + '/loader.js', paths.ex.util + '/parse.js', paths.rcn.comps + '/modal.js', paths.ex.page + '/advices/base/report2/platform.js', paths.ex.page + '/advices/base/report2/index-part.js', paths.ex.page + '/advices/base/report2/art.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, Rest, DropDown, fecha, Loader, Parse, Modal, PlatForm, Index, ArtList) {
	var React = mods.ReactPack.default;
	var Link = mods.RouterPack.Link;
	var RangeCal = mods.RangeCal;
	var Pagination = mods.Pagination;
	var TransG = mods.TransGroup.default;
	var u = mods.u;

	var rest = Rest.ex2();

	var restIndex = Rest.index({
		stringifyData: false
	});

	var emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	};

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

	var View = React.createClass({
		displayName: 'View',
		getInitialState: function getInitialState() {
			return {
				uuid: null,
				tips: '',
				save: { info: {} },
				data: {},
				loading: false,
				shareImg: ''
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
				this.setState({ save: {
						status: 1,
						version: 1,
						info: {},
						title: ''
					} });
			}
		},
		getData: function getData() {
			var _this3 = this;

			var save = this.state.save;
			// this.load(1);
			// 获取危机指数
			rest.article.agg.read('query', {
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
			});
			// 获取舆情数据
			var handler = function handler(k) {
				rest.article.agg.read('query', {
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
				return handler(k);
			});

			// 获取指数数据
			restIndex.keywords.read().done(function (data) {
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
			});

			rest.article.data.read('query', {
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
				}
			});
		},
		load: function load(b) {
			this.setState({ loading: b });
		},
		publishHandler: function publishHandler() {
			var _this4 = this;

			var save = this.state.save;
			this.load(1);
			rest.reports.update({
				uuid: save.uuid,
				status: 3
			}).done(function (data) {
				_this4.load(0);
				if (data.result) {
					_this4.setState({ save: u(_this4.state.save, { $merge: { status: 3 } }) });
					$('#publishModal').modal('show');
					_this4.getShareImg();
				}
			});
		},
		shareHandler: function shareHandler() {
			$('#shareModal').modal('show');
			this.getShareImg();
		},
		getShareImg: function getShareImg() {
			var _this5 = this;

			var save = this.state.save;
			rest.reports.read('share_url', {
				uuid: save.uuid
			}).complete(function (data) {
				_this5.setState({ shareImg: data.responseText });
			});
		},
		openTips: function openTips(tips) {
			this.setState({ tips: tips });
			$('#tipModal').modal('show');
			setTimeout(function () {
				$('#tipModal').modal('hide');
			}, 800);
		},
		render: function render() {
			var _this6 = this;

			var save = this.state.save,
			    saveInfo = save.info || {},
			    data = this.state.data;
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
							React.createElement(
								'h3',
								{ className: 'panel-title report-title' },
								React.createElement(
									'span',
									{ className: 'title' },
									save.title
								),
								save.begin_at == save.end_at ? React.createElement(
									'span',
									{ className: 'date' },
									save.begin_at + '至' + save.end_at
								) : React.createElement(
									'span',
									{ className: 'date' },
									save.begin_at
								)
							),
							React.createElement(
								'div',
								null,
								React.createElement(
									'span',
									null,
									'创建人：' + save.creator || ''
								)
							)
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
										{ className: 'ovh summary-part' },
										React.createElement('span', { className: 'iconfont icon-duihua fl' }),
										React.createElement(
											'p',
											{ className: 'ovh' },
											save.info.summaryDesc || ''
										)
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
									React.createElement(
										'div',
										{ className: 'art-part' },
										saveInfo.focus_articles && saveInfo.focus_articles.length > 0 ? React.createElement(
											'ul',
											null,
											(saveInfo.focus_articles || []).map(function (art, idx) {
												var title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
												var pn = (art.from || {}).platform_name || '',
												    media_pre = void 0,
												    media_end = (art.from || {}).media || '';
												if (pn == '待定' || pn == '') media_pre = '';else media_pre = pn + '：';

												return React.createElement(
													'li',
													{ ref: idx },
													React.createElement(
														'div',
														{ className: 'title' },
														React.createElement(
															'a',
															{ href: art.url, target: '_blank', title: title },
															Parse.limit(title, 40)
														)
													),
													React.createElement(
														'div',
														{ className: 'infos' },
														React.createElement(
															'span',
															null,
															Parse.time(art.publish_at)
														),
														React.createElement(
															'span',
															null,
															art.media
														),
														React.createElement(
															'span',
															null,
															art.emotion || ''
														),
														React.createElement(
															'div',
															{ className: 'tool' },
															React.createElement(
																'span',
																null,
																'相关文章：' + (art.similar_count || 0) + '篇'
															)
														)
													)
												);
											})
										) : React.createElement(
											'div',
											{ className: 'list-blank-holder' },
											'暂无数据'
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer tr' },
							this.state.save.status == 3 ? React.createElement(
								'a',
								{ className: 'btn btn-primary btn-lg', onClick: this.shareHandler },
								'分享'
							) : React.createElement(
								'a',
								{ className: 'btn btn-primary btn-lg', onClick: this.publishHandler },
								'发布'
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
				React.createElement(Loader, { show: this.state.loading, fix: true }),
				React.createElement(
					Modal,
					{ id: 'publishModal', modalSm: true, title: '日报发布', confirm: function confirm() {
							$('#publishModal').modal('hide');_this6.getData();
						}, noDismiss: true },
					React.createElement(
						'div',
						{ className: 'publish-wrap' },
						React.createElement(
							'p',
							null,
							'日报已成功发布。'
						),
						React.createElement(
							'p',
							null,
							'您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。'
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'a',
								{ className: 'intxt' },
								React.createElement('span', { className: 'iconfont icon-lianjie mr5 vm' }),
								React.createElement(
									'span',
									{ className: 'vm' },
									'网页链接'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'code' },
							React.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.shareImg } }),
							React.createElement(
								'span',
								null,
								'微信二维码'
							)
						)
					)
				),
				React.createElement(
					Modal,
					{ id: 'shareModal', modalSm: true, title: '日报分享', noDismiss: true, confirm: function confirm() {
							return $('#shareModal').modal('hide');
						} },
					React.createElement(
						'div',
						{ className: 'publish-wrap' },
						React.createElement(
							'p',
							null,
							'您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。'
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'a',
								{ className: 'intxt' },
								React.createElement('span', { className: 'iconfont icon-lianjie mr5 vm' }),
								React.createElement(
									'span',
									{ className: 'vm' },
									'网页链接'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'code' },
							React.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.shareImg } }),
							React.createElement(
								'span',
								null,
								'微信二维码'
							)
						)
					)
				)
			);
		}
	});

	return View;
});