'use strict';

/**
 * 搜索指数编辑页
 */

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js'], function (mods, r, Modal) {

	var rest = r.index({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var Setting = React.createClass({
		displayName: 'Setting',


		getInitialState: function getInitialState() {
			return {
				keysData: [],
				warn: false,
				warnTxt: '',
				tipTxt: '',
				istipTxt2: false,
				tipTxt2: '',
				id: '',
				form_error_txt: ''
			};
		},

		componentDidMount: function componentDidMount() {
			this.getKeysData();
		},

		handleConfirm: function handleConfirm() {
			var _this = this;

			var keyword = $('#key').val().trim();

			if (keyword == '') {

				this.setState({ form_error_txt: '关键字不能为空' });
			} else {

				this.setState({ form_error_txt: '' });

				var result = {
					keyword: keyword
				};
				// 添加
				rest.keywords.create(result).done(function (data) {
					if (data.result) {
						_this.getKeysData();
						$('#key').val('');
					} else {
						_this.setState({ form_error_txt: data.msg });
					}
				}).error(function (data) {

					if (data.status === 400 && data.responseJSON.msg) {
						$('label.error').html(data.msg);
					}
				});
			}
		},

		delKey: function delKey(e, id, keyword) {
			e.stopPropagation();

			$('#smModal').modal('show');
			this.setState({ tipTxt: '您确定要删除指数关键字"' + keyword + '"?', id: id });
		},

		// 确认删除
		handleTipConfirm: function handleTipConfirm() {
			var _this2 = this;

			var id = this.state.id;
			rest.keywords.del(id).done(function (data) {
				if (data.result) {
					$('#smModal').modal('hide');
					_this2.getKeysData();
				} else {
					_this2.setState({
						warn: true,
						warnTxt: data.msg
					});
				}
			}).error(function (data) {

				if (data.status === 400 && data.responseJSON.msg) {
					_this2.setState({
						warn: true,
						warnTxt: data.responseJSON.msg
					});
				}
			});
		},

		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			$('#smModal').modal('hide');
		},

		getKeysData: function getKeysData() {
			var _this3 = this;

			rest.keywords.read().done(function (keysData) {
				_this3.setState({ keysData: keysData });
			});
		},

		toggleKey: function toggleKey(e, id, elem) {
			var _this4 = this;

			var classList = e.target.parentNode.classList,
			    id_ = id,
			    classLen = $('.key.active').length,
			    tooltipId = '#tooltip' + elem + '';

			if (classList == 'key active') {

				$("[data-toggle='tooltip']").tooltip('destroy');

				rest.keywords.update(id_, { status: 0 }).done(function (data) {
					if (data.result) {
						_this4.getKeysData();
					}
				});
			} else {

				// 点击开启关键字的时候先去判断是不是已满5个，是提示tooltip，否则可以选择
				if (classLen < 5) {

					$("[data-toggle='tooltip']").tooltip('destroy');

					rest.keywords.update(id_, { status: 1 }).done(function (data) {
						if (data.result) {
							_this4.getKeysData();
						}
					});
				} else {
					// 最多只能选择5个, 5个以上提示错误
					$(tooltipId).attr("title", "最多允许选择5个关键字，请先取消选中关键字");
					$(tooltipId).tooltip('show');
				}
			}
		},

		gotoInfo: function gotoInfo() {
			var url = window.location.protocol + '//' + window.location.hostname + '/index-base#/info';
			window.location.href = url;
		},

		render: function render() {
			var _this5 = this;

			var keysData = this.state.keysData;

			return React.createElement(
				'div',
				{ className: 'index-base-setting container' },
				React.createElement(
					'div',
					{ className: 'panel panel-default' },
					React.createElement(
						'div',
						{ className: 'panel-heading' },
						React.createElement(
							'h3',
							{ className: 'panel-title' },
							'管理指数关键字'
						),
						React.createElement(
							'button',
							{ className: 'btn btn-primary', onClick: this.gotoInfo },
							'返回'
						)
					),
					React.createElement(
						'div',
						{ className: 'panel-body' },
						React.createElement(
							'div',
							{ className: 'row mt10' },
							React.createElement(
								'div',
								{ className: 'col-xs-3' },
								React.createElement(
									'div',
									{ className: 'input-icon-form' },
									React.createElement('input', { type: 'text', className: this.state.form_error_txt !== '' ? "form-control input-key error" : "form-control input-key", name: 'key', id: 'key', ref: 'key',
										placeholder: '输入想添加的指数关键字',
										onKeyDown: function onKeyDown(e) {
											return e.keyCode == 13 && _this5.handleConfirm();
										} }),
									React.createElement(
										'label',
										{ htmlFor: 'key', className: this.state.form_error_txt !== '' && "error" },
										this.state.form_error_txt
									),
									React.createElement('span', { className: 'iconfont icon-tianjia addbtn',
										onClick: this.handleConfirm })
								)
							),
							React.createElement(
								'div',
								{ className: 'col-xs-5 errorbox' },
								React.createElement(
									'span',
									{ className: this.state.warn && "error" },
									this.state.warnTxt
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'keybox mt20' },
							keysData.map(function (index, elem) {
								var id = index.id,
								    keyword = index.keyword,
								    status = index.status;
								return React.createElement(
									'div',
									{ className: status == 0 ? "key" : "key active", id: 'tooltip' + elem + '', 'data-toggle': 'tooltip',
										onClick: function onClick(e) {
											return _this5.toggleKey(e, id, elem);
										}, 'data-status': status },
									React.createElement(
										'span',
										{ title: keyword },
										keyword
									),
									React.createElement('i', { className: 'iconfont icon-guanbi', onClick: function onClick(e) {
											return _this5.delKey(e, id, keyword);
										} })
								);
							})
						)
					)
				),
				React.createElement(
					Modal,
					{ title: '删除指数关键字', modalSm: true, id: 'smModal', noBtn: this.state.noBtn,
						dismiss: this.handleTipDismiss,
						confirm: function confirm(e) {
							_this5.handleTipConfirm(e);
						} },
					React.createElement(
						'div',
						{ className: 'm-tip' },
						React.createElement(
							'p',
							null,
							this.state.tipTxt
						),
						React.createElement(
							'p',
							{ className: 'tipTxt2' },
							'提示：确认将删除该关键字及历史指数数据'
						)
					)
				)
			);
		}

	});

	return Setting;
});