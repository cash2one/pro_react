'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.rcn.plu + '/fecha.min.js', paths.rcn.comps + '/loader.js', paths.ex.util + '/parse.js', paths.rcn.comps + '/modal.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, Rest, DropDown, fecha, Loader, Parse, Modal) {
	var React = mods.ReactPack.default;
	var Link = mods.RouterPack.Link;
	var RangeCal = mods.RangeCal;
	var Pagination = mods.Pagination;
	var TransG = mods.TransGroup.default;

	var rest = Rest.ex2();
	var restR = Rest.rcn();

	var ListItem = React.createClass({
		displayName: 'ListItem',
		getInitialState: function getInitialState() {
			return {
				hover: false
			};
		},
		render: function render() {
			var _this = this;

			var data = this.props.data;

			return React.createElement(
				'div',
				{ className: 'col-xs-3' },
				React.createElement(
					'div',
					{ className: 'item' },
					React.createElement('span', { className: 'iconfont icon-lajitong del-btn', onClick: function onClick() {
							return _this.props.delete && _this.props.delete(data.uuid);
						} }),
					React.createElement(
						'div',
						{ className: 'top' },
						React.createElement(
							'p',
							{ className: 'name' },
							data.title
						),
						React.createElement(
							'p',
							{ className: 'date' },
							data.begin_at,
							'至',
							data.end_at
						),
						React.createElement(
							TransG,
							{ transitionName: 'tipshow', transitionEnterTimeout: 100, transitionLeaveTimeout: 100 },
							this.state.hover ? React.createElement(
								'div',
								{ className: 'tip' },
								data.updater.length > 0 ? React.createElement(
									'p',
									{ className: 'p' },
									data.updater || '',
									'修改于',
									Parse.time((data.update_at || '').replace(/\-/g, '.'))
								) : React.createElement(
									'p',
									{ className: 'p' },
									data.creator || '',
									'创建于',
									Parse.time((data.create_at || '').replace(/\-/g, '.'))
								),
								React.createElement(
									'p',
									{ className: 'p' },
									React.createElement('span', { className: 'iconfont icon-renyuan' }),
									React.createElement(
										'span',
										null,
										'创建人：',
										data.creator
									)
								)
							) : null
						)
					),
					React.createElement(
						'div',
						{ className: 'btns' },
						React.createElement(
							'span',
							{ onClick: function onClick() {
									return _this.props.edit(data.uuid);
								}, className: 'btn btn-xs pl10 pr10 btn-default', onMouseEnter: function onMouseEnter() {
									return _this.setState({ hover: true });
								}, onMouseLeave: function onMouseLeave() {
									return _this.setState({ hover: false });
								} },
							React.createElement('span', { className: 'iconfont icon-edit-copy edit' }),
							React.createElement(
								'span',
								{ className: 'txt' },
								'编辑'
							)
						),
						data.status != 3 ? React.createElement(
							'a',
							{ className: 'btn btn-xs pl10 pr10 btn-default', onClick: function onClick() {
									return _this.props.publish && _this.props.publish(data.uuid);
								} },
							React.createElement('span', { className: 'iconfont icon-fabu publish' }),
							React.createElement(
								'span',
								{ className: 'txt' },
								'发布分享'
							)
						) : React.createElement(
							'a',
							{ className: 'btn btn-xs pl10 pr10 btn-default', onClick: function onClick() {
									return _this.props.share && _this.props.share(data.uuid);
								} },
							React.createElement('span', { className: 'iconfont icon-fabu publish' }),
							React.createElement(
								'span',
								{ className: 'txt' },
								'分享'
							)
						)
					)
				)
			);
		}
	});

	var List = React.createClass({
		displayName: 'List',
		getInitialState: function getInitialState() {
			var range = this.getBe();
			return {
				begin_at: range[0],
				end_at: range[1],
				beg: 0,
				count: 20,
				total: 0,
				list: {},
				loading: true,
				delId: '',
				tips: '',

				shareImg: '',
				publishId: ''
			};
		},
		componentDidMount: function componentDidMount() {
			this.getData();
		},

		contextTypes: {
			router: React.PropTypes.object.isRequired
		},
		getData: function getData() {
			var _this2 = this;

			this.load(1);
			$.when(this.getListData(), this.getPage()).always(function () {
				return _this2.load(0);
			});
		},
		getListData: function getListData() {
			var _this3 = this;

			var _state = this.state;
			var begin_at = _state.begin_at;
			var end_at = _state.end_at;
			var beg = _state.beg;
			var count = _state.count;

			return rest.reports.read({
				begin_at: begin_at,
				end_at: end_at,
				beg: beg,
				count: count
			}).done(function (data) {
				_this3.setState({
					list: data.reduce(function (obj, item, idx) {
						item._i = idx;
						obj[item.uuid] = item;
						return obj;
					}, {})
				});
			});
		},
		getPage: function getPage() {
			var _this4 = this;

			var _state2 = this.state;
			var begin_at = _state2.begin_at;
			var end_at = _state2.end_at;

			return rest.reports.read('count', { begin_at: begin_at, end_at: end_at }).done(function (data) {
				return _this4.setState({ total: data.count });
			});
		},
		getBe: function getBe() {
			var end = new Date().getTime(),
			    delta = 29 * 24 * 3600 * 1000,
			    begin = end - delta;
			return [fecha.format(new Date(begin), 'YYYY-MM-DD'), fecha.format(new Date(end), 'YYYY-MM-DD')];
		},
		load: function load(b) {
			this.setState({ loading: b });
		},
		openDelModal: function openDelModal(id) {
			this.setState({ delId: id });
			$('#delModal').modal('show');
		},
		delHandler: function delHandler() {
			var _this5 = this;

			rest.reports.del('del', { uuid: this.state.delId }).done(function (data) {
				$('#delModal').modal('hide');
				_this5.openTips('删除成功');
				_this5.getData();
			});
		},
		openTips: function openTips(txt) {
			this.setState({ tips: txt });
			$('#tipModal').modal('show');
			setTimeout(function () {
				return $('#tipModal').modal('hide');
			}, 800);
		},
		publish: function publish(id) {
			var _this6 = this;

			this.load(1);
			this.setState({ publishId: id }, function () {
				rest.reports.update({
					uuid: id,
					status: 3
				}).done(function () {
					_this6.load(0);
					_this6.getData();
					_this6.getShareImg(id);
					$('#publishModal').modal('show');
				});
			});
		},
		share: function share(id) {
			var _this7 = this;

			this.setState({ shareId: id }, function () {
				_this7.getShareImg(id);
				$('#shareModal').modal('show');
			});
		},
		getShareImg: function getShareImg(uuid) {
			var _this8 = this;

			// rest.reports.read('share_url', {uuid}).complete(data => {
			// 	this.setState({shareImg: data.responseText})
			// })
			if (!this.state.company_uuid) {
				restR.user.read().done(function (data) {
					_this8.setState({ company_uuid: data.company_uuid, shareId: uuid });
				});
			} else {
				this.setState({ shareId: uuid });
			}
		},
		editHandler: function editHandler(uuid) {
			var _this9 = this;

			rest.reports.read('status', { uuid: uuid }).done(function (data) {
				if (data.result) {
					_this9.context.router.push({
						pathname: 'report/edit',
						query: {
							uuid: uuid
						}
					});
				} else {
					_this9.openTips('此报表正在编辑中');
				}
			});
		},
		render: function render() {
			var _this10 = this;

			var list1 = [],
			    list2 = [];
			Object.keys(this.state.list).sort(function (a, b) {
				return _this10.state.list[a]._i - _this10.state.list[b]._i;
			}).forEach(function (k) {
				var item = _this10.state.list[k];
				var status = item.status;

				if (status == 2 || status == 1) list1.push(item);else list2.push(item);
			});
			var jump = function jump(page) {
				_this10.setState({ beg: (page - 1) * _this10.state.count, loading: 1 }, function () {
					_this10.getListData().always(function () {
						return _this10.load(0);
					});
				});
			};
			var range = function range(val) {
				_this10.setState({ begin_at: val[0], end_at: val[1], beg: 0 }, _this10.getData);
			};
			return React.createElement(
				'div',
				{ className: 'advices-base-report-v3' },
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
								'报表生成'
							),
							React.createElement(
								'div',
								null,
								React.createElement(
									Link,
									{ to: { pathname: 'report/edit' }, className: 'btn btn-primary' },
									'新增报表'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'date-part cf' },
							React.createElement(
								'div',
								{ className: 'fr' },
								React.createElement(RangeCal, { format: 'yyyy-MM-dd', value: [this.state.begin_at, this.state.end_at], className: 'c-time-range', placeholder: '请选择日期区间', showClear: false, onChange: function onChange(val) {
										return range(val);
									} })
							)
						),
						React.createElement(
							'div',
							{ className: 'content' },
							list1.length > 0 || list2.length > 0 ? React.createElement(
								'div',
								null,
								list1.length > 0 ? React.createElement(
									'div',
									{ className: 'report-group' },
									React.createElement(
										'div',
										{ className: 'hd' },
										React.createElement('span', { className: 'iconfont icon-weitijiao s3' }),
										React.createElement(
											'span',
											{ className: 'txt' },
											'未发布日报'
										)
									),
									React.createElement(
										'div',
										{ className: 'bd row' },
										list1.map(function (item) {
											return React.createElement(ListItem, { share: function share(id) {
													return _this10.share(id);
												}, publish: function publish(id) {
													return _this10.publish(id);
												}, 'delete': function _delete(id) {
													return _this10.openDelModal(id);
												}, data: item, edit: function edit(uuid) {
													return _this10.editHandler(uuid);
												} });
										})
									)
								) : null,
								list2.length > 0 ? React.createElement(
									'div',
									{ className: 'report-group' },
									React.createElement(
										'div',
										{ className: 'hd' },
										React.createElement('span', { className: 'iconfont icon-tijiao s2' }),
										React.createElement(
											'span',
											{ className: 'txt' },
											'已发布日报'
										)
									),
									React.createElement(
										'div',
										{ className: 'bd row' },
										list2.map(function (item) {
											return React.createElement(ListItem, { share: function share(id) {
													return _this10.share(id);
												}, publish: function publish(id) {
													return _this10.publish(id);
												}, 'delete': function _delete(id) {
													return _this10.openDelModal(id);
												}, data: item, edit: function edit(uuid) {
													return _this10.editHandler(uuid);
												} });
										})
									)
								) : null
							) : React.createElement(
								'div',
								{ className: 'list-blank-holder' },
								React.createElement(
									'span',
									null,
									'暂无数据'
								)
							),
							this.state.total > this.state.count ? React.createElement(
								'div',
								{ className: 'mb30' },
								React.createElement(Pagination, { current: Math.floor(this.state.beg / this.state.count) + 1, total: this.state.total, pageSize: this.state.count, className: 'v2 tc', onChange: function onChange(page) {
										return jump(page);
									} })
							) : null
						)
					)
				),
				React.createElement(Loader, { show: this.state.loading, fix: true }),
				React.createElement(
					Modal,
					{ id: 'delModal', modalSm: true, confirm: function confirm() {
							return _this10.delHandler();
						} },
					React.createElement(
						'p',
						{ className: 'tc' },
						'您确定删除此报表吗？'
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
				React.createElement(
					Modal,
					{ id: 'publishModal', modalSm: true, title: '日报发布', noClose: true, confirmTxt: '关闭', confirm: function confirm() {
							$('#publishModal').modal('hide');_this10.getData();
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
							React.createElement(
								'span',
								null,
								'您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。'
							),
							React.createElement(
								'a',
								{ target: '_blank', className: 'intxt', href: (this.state.list[this.state.shareId] || {})['share_url'] },
								React.createElement('span', { className: 'iconfont icon-lianjie mr5' }),
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
							React.createElement('div', { className: 'img', style: { backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (this.state.shareId || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')' } }),
							React.createElement(
								'span',
								{ className: 'db' },
								'微信二维码'
							)
						)
					)
				),
				React.createElement(
					Modal,
					{ id: 'shareModal', modalSm: true, title: '日报分享', noClose: true, confirmTxt: '关闭', noDismiss: true, confirm: function confirm() {
							return $('#shareModal').modal('hide');
						} },
					React.createElement(
						'div',
						{ className: 'publish-wrap' },
						React.createElement(
							'p',
							null,
							React.createElement(
								'span',
								null,
								'您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。'
							),
							React.createElement(
								'a',
								{ target: '_blank', className: 'intxt', href: (this.state.list[this.state.shareId] || {})['share_url'] },
								React.createElement('span', { className: 'iconfont icon-lianjie mr5' }),
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
							React.createElement('div', { className: 'img', style: { backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (this.state.shareId || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')' } }),
							React.createElement(
								'span',
								{ className: 'db' },
								'微信二维码'
							)
						)
					)
				)
			);
		}
	});

	return List;
});