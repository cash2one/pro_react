'use strict';

define(['mods', paths.rcn.util + '/rest.js', './table.js', paths.rcn.comps + '/dropdown/index.js', paths.rcn.comps + '/modal/index.js'], function (mods, r, Table, Dropdown, Modal) {

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Super = React.createClass({
		displayName: 'Super',

		getInitialState: function getInitialState() {
			return {
				cur_page: 1,
				beg: 0,
				total: 20,
				count: 20,

				btnShow: true,
				show: false,
				modTitle: '',
				opt: '',
				userid: '',
				mdata: [],
				rdata: [],

				temp_data: {},
				selectValue: '',

				warn: false,
				warntxt: '',

				noBtn: false,
				tipShow: false,
				tipTxt: '',

				search_result_none: false

			};
		},
		componentDidMount: function componentDidMount() {
			this.loadDataFromServer();

			this.validate();
		},

		// 添加人员
		handleAdd: function handleAdd() {
			this.setState({
				show: true,
				modTitle: '新增人员',
				opt: 'add'
			});
			this.formReset();
		},
		// 修改人员
		handleEdit: function handleEdit(e, index) {

			$('#phone').val(index.telephone);
			$('#name').val(index.user_name);

			this.setState({
				show: true,
				modTitle: '修改人员',
				opt: 'edit',
				selectValue: index.syndicate_name,

				temp_data: {
					syndicate: index.syndicate_uuid,
					user_id: index.user_id,
					user_name: index.user_name,
					telephone: index.telephone
				}
			});
		},

		// 删除人员
		handleDelete: function handleDelete(e, userid) {
			this.setState({ tipShow: true, tipTxt: '您确定删除所选人员吗？', istipTxt2: true, tipTxt2: '（确定删除后，该人员将不再有权限登录此系统进行操作）', userid: userid });
		},
		// 小弹窗 - 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			this.setState({ tipShow: false });
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm() {
			var _this = this;

			var userid = this.state.userid;
			rest.super.del(userid).done(function (data) {
				if (data.result) {
					_this.setState({ tipTxt: '删除成功', noBtn: true });
					var time = setTimeout(function () {
						_this.handleTipDismiss();
						var beg = _this.state.beg;
						_this.loadSuperData(beg);
						_this.setState({ noBtn: false });
					}, 800);
				}
			}).error(function (data) {
				_this.setState({ tipTxt: '删除失败，请联系管理员' });
			});
		},

		// 关闭弹窗
		handleDismiss: function handleDismiss() {
			this.formReset();
			this.setState({ show: false });
		},
		// 表单重置
		formReset: function formReset() {
			this.setState({ temp_data: {}, selectValue: '', warn: false });
			$('.reset').val('');
		},

		// 下拉菜单操作
		handleSelectClick: function handleSelectClick(e) {
			$('#dd_option').toggle(100);
			$(document).one('click', function () {
				$('#dd_option').hide(100);
			});
		},
		handleOptionListClick: function handleOptionListClick(index) {
			var uuid = index.uuid;
			var syndicate_name = index.name;

			this.setState({ selectValue: syndicate_name });

			this.state.temp_data.syndicate = uuid;
			// this.state.temp_data.uuid = uuid;

			this.handleSelectClick();
		},

		// jq表单验证
		validate: function validate() {
			var self = this;

			return $("#addPeo_form").validate({
				rules: {
					phone: {
						required: true,
						minlength: 11,
						number: true
					},
					name: "required",
					syndicate: "required"
				},
				messages: {
					phone: {
						required: "手机号码不能为空",
						minlength: "手机号码不能小于11位数字",
						number: "手机号码必须为合法数字"
					},
					name: {
						required: "用户名不能为空"
					},
					syndicate: {
						required: "集团选择不能为空"
					}
				},
				errorPlacement: function errorPlacement(error, element) {

					self.setState({ warn: true });
					error.appendTo($('.m-warn'));
				}
			}).form();
		},

		// 提交表单
		handleConfirm: function handleConfirm() {
			var _this2 = this;

			if (this.validate()) {

				var result = this.state.temp_data;

				if (this.state.opt === 'add') {
					rest.super.create(result).done(function (data) {

						if (data.result) {
							_this2.handleDismiss();
							_this2.loadSuperData();
							_this2.formReset();
							_this2.setState({ search_result_none: false });
							$('#searchInput').val(null);
						}
					}).error(function (data) {

						if (data.status === 400 && data.responseJSON.msg) {
							_this2.setState({ warn: true, warntxt: data.responseJSON.msg });
						}
						// else{
						// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
						// }
					});
				} else {
						rest.super.update(result).done(function (data) {

							if (data.result) {
								_this2.handleDismiss();
								_this2.loadSuperData();
								_this2.formReset();
								_this2.setState({ search_result_none: false });
								$('#searchInput').val(null);
							}
						}).error(function (data) {

							if (data.status === 400 && data.responseJSON.msg) {
								_this2.setState({ warn: true, warntxt: data.responseJSON.msg });
							}
							// else{
							// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
							// }
						});
					}
			}
		},

		// 获取数据函数入口
		loadDataFromServer: function loadDataFromServer() {
			var beg = this.state.beg;
			this.loadSuperData(beg);
			this.loadSynData();
		},
		loadSuperData: function loadSuperData(beg) {
			var _this3 = this;

			rest.super.read({ beg: beg, count: 20, sort: 'telephone' }).done(function (mdata) {
				if (mdata.sup_mgrs.length === 0) {
					_this3.setState({ search_result_none: true });
				} else {
					if (_this3.isMounted()) {
						_this3.setState({
							mdata: mdata.sup_mgrs,
							total: mdata.count
						});
					}
				}
			});
		},
		loadSynData: function loadSynData() {
			var _this4 = this;

			rest.syndicate.read().done(function (rdata) {
				if (_this4.isMounted()) {
					_this4.setState({
						rdata: rdata.syndicates
					});
				}
			});
		},

		// 分页
		changeAutoPage: function changeAutoPage(page) {
			var _this5 = this;

			var count = this.state.count;
			if (page === 1) {
				var beg = 0;
			} else {
				var beg = parseInt(count * (page - 1));
			}
			this.setState({ cur_page: page });

			var searchTxt = $('#searchTxt').val();
			if (searchTxt !== '') {
				rest.supers.read({ beg: beg, count: 20, search: searchTxt }).done(function (mdata) {
					if (mdata.length === 0) {
						_this5.setState({ search_result_none: true, mdata: [], total: mdata.count });
					} else {
						_this5.setState({ search_result_none: false, mdata: mdata.supers, total: mdata.count });
					}
				});
			} else {
				this.loadSuperData(beg);
			}
		},

		onPhoneChange: function onPhoneChange(e) {
			var phone = e.target.value.trim();
			this.state.temp_data.telephone = phone;
		},
		onNameChange: function onNameChange(e) {
			var name = e.target.value.trim();
			this.state.temp_data.user_name = name;
		},
		onUseridChange: function onUseridChange(e) {
			var user_id = e.target.value.trim();
			this.state.temp_data.user_id = user_id;
		},

		render: function render() {
			var _this6 = this;

			return React.createElement(
				'div',
				{ className: 'admin-base' },
				React.createElement(
					'div',
					{ className: 'admin-manager-super' },
					React.createElement(
						'div',
						{ className: 'fr-top' },
						React.createElement(
							'div',
							{ className: 'fr mr10' },
							React.createElement(
								'button',
								{ className: 'c-button', type: 'button', onClick: this.handleAdd },
								'新增人员'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'fr-topline' },
						React.createElement('div', { className: 'line w' })
					),
					React.createElement(
						'div',
						{ className: 'fr-main' },
						React.createElement(
							'div',
							{ className: 'w1000' },
							React.createElement(Table, {
								search_result_none: this.state.search_result_none,
								mdata: this.state.mdata,
								'delete': function _delete(e, userid) {
									_this6.handleDelete(e, userid);
								},
								edit: function edit(e, tindex) {
									_this6.handleEdit(e, tindex);
								}
							}),
							React.createElement(
								'div',
								{ className: this.state.search_result_none ? 'list-blank-holder' : 'list-blank-holder none' },
								React.createElement(
									'span',
									null,
									'目前还没添加超级运营员，'
								),
								React.createElement(
									'span',
									{ className: 'add', onClick: this.handleAdd },
									'立即添加'
								)
							)
						)
					),
					React.createElement(Pagination, { current: this.state.cur_page, pageSize: this.state.count, total: this.state.total, className: this.state.total == 0 || 1 ? "none" : "tc mt20 mb20", onChange: function onChange(page) {
							_this6.changeAutoPage(page);
						} }),
					React.createElement(
						Modal,
						{ title: this.state.modTitle, show: this.state.show, btnShow: this.state.btnShow, dismiss: this.handleDismiss, confirm: this.handleConfirm },
						React.createElement(
							'form',
							{ id: 'addPeo_form' },
							React.createElement(
								'label',
								null,
								'手机号码'
							),
							React.createElement('input', { type: 'text', className: 'reset', id: 'phone', name: 'phone', defaultValue: this.state.temp_data.telephone,
								onChange: function onChange(e) {
									_this6.onPhoneChange(e);
								} }),
							React.createElement(
								'label',
								null,
								'姓名'
							),
							React.createElement('input', { type: 'text', className: 'reset', id: 'name', name: 'name', defaultValue: this.state.temp_data.user_name,
								onChange: function onChange(e) {
									_this6.onNameChange(e);
								} }),
							React.createElement(
								'label',
								null,
								'运营集团'
							),
							React.createElement(
								'div',
								{ className: 'm-dropdown' },
								React.createElement(
									'div',
									{ className: 'c-dropdown' },
									React.createElement(
										'div',
										{ className: 'select', type: 'button', onClick: function onClick(e) {
												_this6.handleSelectClick(e);
											} },
										React.createElement('input', { className: 'txt', placeholder: '集团选择', syndicate_name: this.state.temp_data.syndicate,
											value: this.state.selectValue, name: 'syndicate', id: 'syndicate', disabled: true }),
										React.createElement(
											'span',
											{ className: 'ic' },
											React.createElement('span', { className: 'iconfont icon-xiala' })
										)
									),
									React.createElement(
										'ul',
										{ className: 'option none', id: 'dd_option' },
										this.state.rdata.map(function (index) {
											return React.createElement(
												'li',
												{ onClick: function onClick() {
														_this6.handleOptionListClick(index);
													} },
												index.name
											);
										})
									)
								)
							),
							React.createElement('input', { type: 'text', className: 'reset userid none', id: 'user_id', name: 'user_id', defaultValue: this.state.temp_data.user_id,
								onChange: function onChange(e) {
									_this6.onUseridChange(e);
								} }),
							React.createElement(
								'div',
								{ className: this.state.warn ? "m-warn" : "m-warn none" },
								this.state.warntxt
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', show: this.state.tipShow, noBtn: this.state.noBtn, dismiss: this.handleTipDismiss, confirm: function confirm(e) {
								_this6.handleTipConfirm(e);
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
								{ className: this.state.istipTxt2 ? 'tipTxt2' : 'none' },
								this.state.tipTxt2
							)
						)
					)
				)
			);
		}
	});

	return Super;
});

// 接口错误提示