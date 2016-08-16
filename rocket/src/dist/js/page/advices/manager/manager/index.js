'use strict';

/**
 * create by lxt
 * final on 2016/07/12
 * 人员管理 - 超级运营员管理运营员、运营员管理观察者
 */

define(['mods', paths.rcn.util + '/rest.js', './table_viewer.js', './table_manager.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/dropdown/index.js'], function (mods, r, Table_viewer, Table_manager, Modal, Dropdown) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Viewer = React.createClass({
		displayName: 'Viewer',

		getInitialState: function getInitialState() {
			return {
				cur_page: 1,
				beg: 0,
				total: 0,
				count: 15,

				btnShow: true,
				modTitle: '',
				opt: '',
				userid: '',
				mdata: [],
				rdata: [],

				temp_data: {},
				selectValue: '',

				noBtn: false,
				tipTxt: '',

				search_result_none: false,

				form_error_show: false,
				form_error_txt: '',

				page_role: '',

				select_val_arr_title: [],
				select_val_arr_name: []

			};
		},

		// 初入页面根据url判断viewer/manager
		componentWillMount: function componentWillMount() {
			var hash_path = window.location.hash.substring(2);
			var beg_path = hash_path.lastIndexOf('/') + 1;
			var end_path = hash_path.lastIndexOf('?');
			var path_name = hash_path.substring(beg_path, end_path);

			this.setState({ page_role: path_name });
		},

		componentDidMount: function componentDidMount() {
			this.loadDataFromServer(this.state.page_role);

			this.validate();
		},

		// 添加人员
		handleAdd: function handleAdd() {
			this.setState({
				modTitle: '添加人员',
				opt: 'add'
			});
			$('#myModal').modal('show');
			this.formReset();
		},

		// 修改人员
		handleEdit: function handleEdit(e, index, page_role) {

			$('#dd_option').hide(100);

			$('#phone').val(index.telephone);
			$('#name').val(index.user_name);

			if (page_role == 'viewer') {
				this.setState({
					modTitle: '修改人员',
					opt: 'edit',
					selectValue: index.role.title,

					temp_data: {
						role_title: index.role.title,
						role: index.role.name,
						user_id: index.user_id,
						user_name: index.user_name,
						telephone: index.telephone
					}
				});
			} else {

				// 处理下roles,分成title和name数组
				var arr_title = [],
				    arr_name = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = index.roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var arr_index = _step.value;

						arr_title.push(arr_index.title);
						arr_name.push(arr_index.name);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				this.setState({
					modTitle: '修改人员',
					opt: 'edit',
					select_val_arr_title: arr_title,
					select_val_arr_name: arr_name,

					temp_data: {
						role: arr_name,
						user_id: index.user_id,
						user_name: index.user_name,
						telephone: index.telephone
					}
				});
			}
			$('#myModal').modal('show');
		},

		// 删除人员
		handleDelete: function handleDelete(e, userid) {
			$('#smModal').modal('show');
			this.setState({ noBtn: false, tipTxt: '您确定删除所选人员吗？', istipTxt2: true, tipTxt2: '（确定删除后，该人员将不再有权限登录此系统进行操作）', userid: userid });
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm(page_role) {
			var _this = this;

			var userid = this.state.userid;
			rest[page_role].del(userid).done(function (data) {
				if (data.result) {
					_this.setState({ tipTxt: '删除成功', noBtn: true });
					var time = setTimeout(function () {
						$('#smModal').modal('hide');
						var beg = _this.state.beg;
						_this.loadVerData(beg, page_role);
					}, 800);
				}
			}).error(function (data) {
				_this.setState({ tipTxt: '删除失败，请联系管理员' });
			});
		},

		// 表单重置
		formReset: function formReset() {
			this.setState({ temp_data: {}, selectValue: '', form_error_show: false });
			$('.reset').val('');
			this.validate().resetForm();
			$('#dd_option').hide(100);
			this.state.select_val_arr_title = [];
			this.state.select_val_arr_name = [];
		},

		// manager角色选择下拉菜单操作
		handleSelectClick_mgr: function handleSelectClick_mgr(e) {
			$('#dd_option').toggle(100);

			// $(document).one('click',function(e) {
			// 	var target = $(e.target).parent();
			// 	console.log(target.is('.cb-p'))
			// 	if(!target.is('.cb-p')) {
			// 		$('#dd_option').hide(100);
			// 	}
			// });
		},
		handleCheckbox: function handleCheckbox(index) {

			var select_val_arr_title = this.state.select_val_arr_title;
			var select_val_arr_name = this.state.select_val_arr_name;

			if (select_val_arr_title.length > 0) {
				var num_temp = 0;
				for (var i = 0; i <= select_val_arr_title.length; i++) {
					if (select_val_arr_title[i] == index.title) {
						select_val_arr_title.splice(i, 1);
						select_val_arr_name.splice(i, 1);
						num_temp = 1;
						break;
					}
				}
				if (num_temp == 0) {
					select_val_arr_title.push(index.title);
					select_val_arr_name.push(index.name);
				}
			} else {
				select_val_arr_title.push(index.title);
				select_val_arr_name.push(index.name);
			}

			this.setState({ select_val_arr_title: select_val_arr_title, select_val_arr_name: select_val_arr_name });

			this.state.temp_data.role = select_val_arr_name;
		},

		// 下拉菜单操作
		handleSelectClick: function handleSelectClick(e) {
			$('#dd_option').toggle(100);
			$(document).one('click', function () {
				$('#dd_option').hide(100);
			});
		},
		handleOptionListClick: function handleOptionListClick(index) {
			var role_title = index.title;
			var role_name = index.name;

			this.setState({ selectValue: role_title });

			this.state.temp_data.role = role_name;
			this.state.temp_data.role_title = role_title;

			$('#dd_option').hide(100);
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
					role: "required"
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
					role: {
						required: "人员角色不能为空"
					}
				},
				success: function success() {
					$('input[name="role"]').parent('.select').removeClass('error');
				}
			});
		},

		// 提交表单
		handleConfirm: function handleConfirm(page_role) {
			var _this2 = this;

			$('#dd_option').hide(100);
			var conn_name = page_role + 's';
			if (this.validate().form()) {

				var result = this.state.temp_data;

				if (!result.role || result.role.length == 0) {
					// 角色不存在提示错误
					this.setState({ form_error_show: true, form_error_txt: '请选择角色' });
				} else {
					if (this.state.opt === 'add') {
						rest[conn_name].create(result).done(function (data) {

							if (data.result) {
								$('#myModal').modal('hide');
								_this2.loadVerData(_this2.state.beg, _this2.state.page_role);
								_this2.formReset();
								_this2.setState({ form_error_show: false, search_result_none: false });
								$('#searchInput').val(null);
							}
						}).error(function (data) {

							if (data.status === 400 && data.responseJSON.msg) {
								if (data.responseJSON.name) {
									var name = data.responseJSON.name;
									var form_error_txt = data.responseJSON.msg + '（ 原始姓名为' + name + ' ）';
									_this2.setState({ form_error_show: true, form_error_txt: form_error_txt });
									_this2.state.temp_data.user_name = name;
									$('#name').val(name);
								} else {
									_this2.setState({ form_error_show: true, form_error_txt: data.responseJSON.msg });
								}
							} else {
								_this2.setState({ form_error_show: true, form_error_txt: '服务器出错，请联系管理员' });
							}
						});
					} else {
						rest[page_role].update(result).done(function (data) {
							if (data.result) {
								$('#myModal').modal('hide');
								_this2.loadVerData(_this2.state.beg, _this2.state.page_role);
								_this2.formReset();
								_this2.setState({ form_error_show: false, search_result_none: false });
								$('#searchInput').val(null);
							}
						}).error(function (data) {

							if (data.status === 400 && data.responseJSON.msg) {
								if (data.responseJSON.name) {
									var name = data.responseJSON.name;
									var form_error_txt = data.responseJSON.msg + '（ 原始姓名为' + name + ' ）';
									_this2.setState({ form_error_show: true, form_error_txt: form_error_txt });
									_this2.state.temp_data.user_name = name;
									$('#name').val(name);
								} else {
									_this2.setState({ form_error_show: true, form_error_txt: data.responseJSON.msg });
								}
							} else {
								_this2.setState({ form_error_show: true, form_error_txt: '服务器出错，请联系管理员' });
							}
						});
					}
				}
			}
		},

		// 获取数据函数入口
		loadDataFromServer: function loadDataFromServer(page_role) {
			var beg = this.state.beg;
			this.loadVerData(beg, page_role);
			this.loadRoleData(page_role);
		},
		loadVerData: function loadVerData(beg, page_role) {
			var _this3 = this;

			var conn_name = page_role + 's';
			rest[conn_name].read({ beg: beg, count: this.state.count, sort: 'telephone' }).done(function (mdata) {
				if (mdata[conn_name].length === 0) {
					_this3.setState({ search_result_none: true, mdata: [], total: mdata.count });
				} else {
					_this3.setState({
						mdata: mdata[conn_name],
						total: mdata.count
					});
				}
			});
		},
		loadRoleData: function loadRoleData(page_role) {
			var _this4 = this;

			rest[page_role].read('roles').done(function (rdata) {
				_this4.setState({
					rdata: rdata
				});
			});
		},

		// 分页
		changeAutoPage: function changeAutoPage(page, page_role) {
			var _this5 = this;

			var count = this.state.count;
			var conn_name = page_role + 's';
			if (page === 1) {
				var beg = 0;
			} else {
				var beg = parseInt(count * (page - 1));
			}
			this.setState({ cur_page: page });

			var searchTxt = $('#searchTxt').val();
			if (searchTxt !== '') {
				rest[conn_name].read({ beg: beg, count: this.state.count, search: searchTxt }).done(function (mdata) {
					if (mdata.length === 0) {
						_this5.setState({ search_result_none: true, mdata: [], total: mdata.count });
					} else {
						_this5.setState({ search_result_none: false, mdata: mdata[conn_name], total: mdata.count });
					}
				});
			} else {
				this.loadMgrData(beg);
			}
		},

		// 搜索功能
		handleSearch: function handleSearch(page_role) {
			var _this6 = this;

			var searchInput = $('#searchInput').val();
			var conn_name = page_role + 's';
			if (searchInput !== '') {
				rest[conn_name].read({ beg: 0, count: this.state.count, search: searchInput }).done(function (mdata) {
					if (mdata.count === 0) {
						_this6.setState({ search_result_none: true, mdata: [], total: mdata.count });
						var tpl = '<tr id="colspan_none"><td colspan="6" rowspan="2">暂无数据</td></tr>';
						$('.advices-usermgr-manager').find('.c-table').append(tpl);
					} else {
						_this6.setState({ search_result_none: false, mdata: mdata[conn_name], total: mdata[conn_name].length });
						$('#colspan_none').remove();
					}
				});
			} else {
				this.loadVerData(0, this.state.page_role);
				this.setState({ search_result_none: false });
				$('#colspan_none').remove();
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
			var _this7 = this;

			var checkboxShow = function checkboxShow(index, select_val_arr_title) {
				var temp_cb;
				if (select_val_arr_title.length > 0) {
					for (var i = 0; i < select_val_arr_title.length; i++) {
						if (index.title == select_val_arr_title[i]) {
							temp_cb = React.createElement('input', { type: 'checkbox', className: 'cb', checked: true, onClick: function onClick(e) {
									return _this7.handleCheckbox(index);
								} });
							break;
						} else {
							temp_cb = React.createElement('input', { type: 'checkbox', className: 'cb', onClick: function onClick(e) {
									return _this7.handleCheckbox(index);
								} });
						}
					}
				} else {
					temp_cb = React.createElement('input', { type: 'checkbox', className: 'cb', onClick: function onClick(e) {
							return _this7.handleCheckbox(index);
						} });
				}
				return temp_cb;
			};
			var role_manager = function role_manager() {
				return React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ 'for': 'inputEmail3', className: 'col-xs-2 control-label' },
						'人员角色'
					),
					React.createElement(
						'div',
						{ className: 'col-xs-10' },
						React.createElement(
							'div',
							{ className: 'dropdown-v2' },
							React.createElement(
								'div',
								{ className: 'select', type: 'button', onClick: function onClick(e) {
										_this7.handleSelectClick_mgr(e);
									} },
								React.createElement('input', { className: 'txt', placeholder: '选择', name: 'role', role_name: _this7.state.temp_data.role,
									value: _this7.state.select_val_arr_title, disabled: true }),
								React.createElement(
									'span',
									{ className: 'ic' },
									React.createElement('span', { className: 'corner' })
								)
							),
							React.createElement(
								'ul',
								{ className: 'option none', id: 'dd_option' },
								_this7.state.rdata.map(function (index) {
									return React.createElement(
										'li',
										{ className: 'cb-p' },
										React.createElement(
											'div',
											{ className: 'cb-p' },
											React.createElement(
												'label',
												{ className: 'cb-p' },
												checkboxShow(index, _this7.state.select_val_arr_title),
												index.title
											)
										)
									);
								})
							)
						)
					)
				);
			};
			var role_viewer = function role_viewer() {
				return React.createElement(
					'div',
					{ className: 'form-group' },
					React.createElement(
						'label',
						{ 'for': 'inputEmail3', className: 'col-xs-2 control-label' },
						'人员角色'
					),
					React.createElement(
						'div',
						{ className: 'col-xs-10' },
						React.createElement(
							'div',
							{ className: 'dropdown-v2' },
							React.createElement(
								'div',
								{ className: 'select', type: 'button', onClick: function onClick(e) {
										_this7.handleSelectClick(e);
									} },
								React.createElement('input', { className: 'txt', placeholder: '选择', name: 'role', role_name: _this7.state.temp_data.role,
									value: _this7.state.selectValue, disabled: true }),
								React.createElement(
									'span',
									{ className: 'ic' },
									React.createElement('span', { className: 'corner' })
								)
							),
							React.createElement(
								'ul',
								{ className: 'option none', id: 'dd_option' },
								_this7.state.rdata.map(function (index) {
									return React.createElement(
										'li',
										{ onClick: function onClick() {
												_this7.handleOptionListClick(index);
											} },
										index.title
									);
								})
							)
						)
					)
				);
			};
			return React.createElement(
				'div',
				{ className: 'advices-base' },
				React.createElement(
					'div',
					{ className: 'advices-manager-viewer' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'人员管理'
							),
							React.createElement(
								'div',
								{ className: 'c-search sm mr20' },
								React.createElement('input', { type: 'text', className: 's-input', placeholder: '搜索人员', id: 'searchInput',
									onKeyDown: function onKeyDown(e) {
										return e.keyCode === 13 && _this7.handleSearch(_this7.state.page_role);
									} }),
								React.createElement(
									'span',
									{ className: 's-btn', id: 'searchBtn', onClick: function onClick(e) {
											return _this7.handleSearch(_this7.state.page_role);
										} },
									React.createElement('span', { className: 'iconfont icon-sousuo' })
								)
							),
							React.createElement(
								'button',
								{ className: 'btn btn-primary', type: 'button', onClick: this.handleAdd },
								'添加人员'
							)
						),
						this.state.page_role == 'viewer' ? React.createElement(Table_viewer, {
							search_result_none: this.state.search_result_none,
							mdata: this.state.mdata,
							'delete': function _delete(e, userid) {
								_this7.handleDelete(e, userid);
							},
							edit: function edit(e, tindex) {
								_this7.handleEdit(e, tindex, _this7.state.page_role);
							}
						}) : React.createElement(Table_manager, {
							search_result_none: this.state.search_result_none,
							mdata: this.state.mdata,
							'delete': function _delete(e, userid) {
								_this7.handleDelete(e, userid);
							},
							edit: function edit(e, tindex) {
								_this7.handleEdit(e, tindex, _this7.state.page_role);
							}
						}),
						React.createElement('div', { className: this.state.search_result_none ? 'list-blank-holder v2 mt30 mb30' : 'none' })
					),
					React.createElement(
						'div',
						{ className: 'tc' },
						React.createElement(Pagination, { current: this.state.cur_page, pageSize: this.state.count, total: this.state.total,
							className: this.state.total <= this.state.count ? "none" : "ib mt20 mb20 v2", onChange: function onChange(page) {
								_this7.changeAutoPage(page, _this7.state.page_role);
							} })
					),
					React.createElement(
						Modal,
						{ title: this.state.modTitle, id: 'myModal', btnShow: this.state.btnShow, confirm: function confirm(e) {
								return _this7.handleConfirm(_this7.state.page_role);
							} },
						React.createElement(
							'form',
							{ id: 'addPeo_form', className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'phone', className: 'col-xs-2 control-label' },
									'手机号码'
								),
								React.createElement(
									'div',
									{ className: 'col-xs-10' },
									React.createElement('input', { className: 'form-control reset', id: 'phone', name: 'phone', defaultValue: this.state.temp_data.telephone, onChange: function onChange(e) {
											_this7.onPhoneChange(e);
										} })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'name', className: 'col-xs-2 control-label' },
									'姓      名'
								),
								React.createElement(
									'div',
									{ className: 'col-xs-10' },
									React.createElement('input', { className: 'form-control reset', id: 'name', name: 'name', defaultValue: this.state.temp_data.user_name, onChange: function onChange(e) {
											_this7.onNameChange(e);
										} })
								)
							),
							this.state.page_role == 'viewer' ? role_viewer() : role_manager(),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ htmlFor: 'form-error', className: this.state.form_error_show ? "form-error" : "none" },
									this.state.form_error_txt
								)
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', modalSm: true, id: 'smModal', noBtn: this.state.noBtn, dismiss: this.handleTipDismiss, confirm: function confirm(e) {
								_this7.handleTipConfirm(_this7.state.page_role);
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

	return Viewer;
});