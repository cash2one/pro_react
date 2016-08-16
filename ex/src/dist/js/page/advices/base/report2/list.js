'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.rcn.plu + '/fecha.min.js', paths.rcn.comps + '/loader.js', paths.ex.util + '/parse.js', paths.rcn.comps + '/modal.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, Rest, DropDown, fecha, Loader, Parse, Modal) {
	var React = mods.ReactPack.default;
	var Link = mods.RouterPack.Link;
	var RangeCal = mods.RangeCal;
	var Pagination = mods.Pagination;
	var TransG = mods.TransGroup.default;

	var rest = Rest.ex2();

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
								) : null,
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
							Link,
							{ to: { pathname: 'report2/edit', query: { uuid: data.uuid } }, className: 'btn btn-xs pl10 pr10 btn-default', onMouseEnter: function onMouseEnter() {
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
				count: 2,
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

			rest.reports.read('share_url').complete(function (data) {
				_this8.setState({ shareImg: data.responseText });
			});
		},
		render: function render() {
			var _this9 = this;

			var list1 = [],
			    list2 = [];
			Object.keys(this.state.list).sort(function (a, b) {
				return _this9.state.list[a]._i - _this9.state.list[b]._i;
			}).forEach(function (k) {
				var item = _this9.state.list[k];
				var status = item.status;

				if (status == 2 || status == 1) list1.push(item);else list2.push(item);
			});
			var jump = function jump(page) {
				_this9.setState({ beg: (page - 1) * _this9.state.count, loading: 1 }, function () {
					_this9.getListData().always(function () {
						return _this9.load(0);
					});
				});
			};
			var range = function range(val) {
				_this9.setState({ begin_at: val[0], end_at: val[1], beg: 0 }, _this9.getData);
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
									{ to: { pathname: 'report2/edit' }, className: 'btn btn-primary' },
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
													return _this9.share(id);
												}, publish: function publish(id) {
													return _this9.publish(id);
												}, 'delete': function _delete(id) {
													return _this9.openDelModal(id);
												}, data: item });
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
													return _this9.share(id);
												}, publish: function publish(id) {
													return _this9.publish(id);
												}, 'delete': function _delete(id) {
													return _this9.openDelModal(id);
												}, data: item });
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
							return _this9.delHandler();
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
					{ id: 'publishModal', modalSm: true, title: '日报发布', confirm: function confirm() {
							$('#publishModal').modal('hide');_this9.getData();
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
								{ className: 'intxt', href: (this.state.list[this.state.shareId] || {})['share_url'] },
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
								{ className: 'intxt', href: (this.state.list[this.state.shareId] || {})['share_url'] },
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

	return List;
});