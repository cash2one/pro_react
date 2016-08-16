'use strict';

/**
 * 人员管理 - 超级运营员
 */define(['mods', paths.rcn.util + '/rest.js', './table.js', paths.rcn.comps + '/modal.js', paths.rcn.plu + '/jquery.webui-popover.js'], function (mods, r, Table, Modal) {

	var rest1 = r.rcn({
		stringifyData: false
	});

	var rest = r.rcn2();

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Allmgr = React.createClass({
		displayName: 'Allmgr',

		getInitialState: function getInitialState() {
			return {

				com_role_data: [],
				role_show: [],
				mod_com_id: '',

				isEdit: false,
				userid: '',

				mdata: [],
				new_mdata: [],
				cdata: [],
				com: [],
				com_all: [],
				roles: [],
				role_all: [],
				role_choose: [],

				cur_page: 1,
				beg: 0,
				total: 0,
				count: 15,

				btnShow: true,
				show: false,
				modTitle: '',
				opt: '',
				dismiss: true,
				confirm: true,

				rdata: [],
				role: [],
				phone: '',
				name: '',

				tipTxt: '',

				warn: false,
				warntxt: '',

				search_result_none: false
			};
		},
		componentDidMount: function componentDidMount() {
			// $('.frame-body-right').addClass('v2');
			this.loadMgrsData();
			this.loadComdata();

			var self = this;
			$(document).mouseup(function (e) {
				var _con = $('.webui-popover'); // 设置目标区域
				if (!_con.is(e.target) && _con.has(e.target).length === 0) {
					// Mark 1
					$('.webui-popover').hide();
				}
			});
		},

		handleRole: function handleRole(in_com_role_data, com_name, com_id, elem) {

			$('.webui-popover').css("display", "none");
			$('#role_tooltip' + elem).show(100);

			this.setState({ com_id: com_id });
			var com_role_data = in_com_role_data,
			    com_id = com_id;

			var role_show_temp;
			for (var i = 0; i < com_role_data.length; i++) {
				if (com_role_data[i].company_id === com_id) {
					this.setState({ role_show: com_role_data[i].roles });
					role_show_temp = com_role_data[i].roles;
					break;
				}
			}
		},

		// 选择角色
		handleToggleRole: function handleToggleRole(data, elem, name, status, tooltip_id) {
			var role_show = data,
			    new_status = !status,
			    role_all_len = this.state.role_all.length;

			role_show[elem].status = new_status;
			this.setState({ role_show: role_show });

			var num = 0;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = role_show[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var index = _step.value;

					if (index.status) {
						num++;
					}
				}
				// if (num == role_all_len) {
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

			if (num > 0) {
				$('#' + tooltip_id).parent('.com-role-container').find('.tag').addClass('active');
			} else {
				$('#' + tooltip_id).parent('.com-role-container').find('.tag').removeClass('active');
			}
		},

		// 全选
		handleAllChoose: function handleAllChoose(e, in_com_role_data, data, tooltip_id) {

			e.stopPropagation();

			var role_show = data;
			for (var i = 0; i < role_show.length; i++) {
				role_show[i].status = true;
			}
			this.setState({ role_show: role_show });

			$('#' + tooltip_id).parent('.com-role-container').find('.tag').addClass('active');
		},

		// 清除
		handleClearChoose: function handleClearChoose(e, data, tooltip_id) {

			e.stopPropagation();

			var role_show = data;
			for (var i = 0; i < role_show.length; i++) {
				role_show[i].status = false;
			}
			this.setState({ role_show: role_show });

			$('#' + tooltip_id).parent('.com-role-container').find('.tag').removeClass('active');
		},

		// 关闭弹窗
		handleDismiss: function handleDismiss(in_com_role_data, role_show, com_id, elem) {

			$('#role_tooltip' + elem).css("display", "none");

			var com_role_data = in_com_role_data;
			var com_id = com_id;

			// 判断是否role_all数组里有status为true的，如果有就高亮该公司名，并且保留为roles
			var $cur_role = $("#role_tooltip" + elem).find('.role');
			if ($cur_role.hasClass('active')) {
				for (var i = 0; i < com_role_data.length; i++) {
					if (com_role_data[i].company_id == com_id) {
						com_role_data[i].status = true;
						break;
					}
				}
			} else {
				for (var i = 0; i < com_role_data.length; i++) {
					if (com_role_data[i].company_id == com_id) {
						com_role_data[i].status = false;
						break;
					}
				}
			}

			for (var i = 0; i < com_role_data.length; i++) {
				if (com_role_data[i].company_id == com_id) {
					com_role_data[i].roles = role_show;
					break;
				}
			}
			this.setState({ com_role_data: com_role_data });
		},

		gotoEdit: function gotoEdit(userid, com) {
			var _this = this;

			var com = com;

			rest.manager.read(userid).done(function (cdata) {

				_this.setState({ cdata: cdata });

				if (cdata.result) {

					var roles = cdata.roles;

					var com_new = [],
					    com_temp,
					    com_haschoose = [],
					    temp,
					    role_title = [];

					$.each(roles, function (item, roleArr) {
						if (roleArr.length > 0) {
							com_haschoose.push(item);
						}
					});

					var Obj_com = [];
					if (com_haschoose.length > 0) {

						var t_cmp_dict = {};
						for (var j = 0; j < com.length; j++) {
							var t_comp_id = com[j].company_id;
							t_cmp_dict[t_comp_id] = false;
						}

						for (var i = 0; i < com_haschoose.length; i++) {
							var t_cmp_id = com_haschoose[i];
							t_cmp_dict[t_cmp_id] = true;
						}

						rest1.manager.read('roles').done(function (role_all) {

							var role_all_data = role_all,
							    role_all_temp,
							    role_all_new_obj = [];

							for (var j = 0; j < com.length; j++) {
								var t_comp_id = com[j].company_id;

								var role_dict = {};
								for (var n = 0; n < role_all_data.length; n++) {

									role_dict[role_all_data[n].name] = {
										title: role_all_data[n].title,
										status: false
									};
								}

								if (roles[t_comp_id]) {
									for (var t_usr_idx in roles[t_comp_id]) {
										var t_role_name = roles[t_comp_id][t_usr_idx];
										role_dict[t_role_name]["status"] = true;
									}
								}

								var role_usr_ary = [];
								for (var t_role_name in role_dict) {
									var t_role_obj = role_dict[t_role_name];
									var t_role_item = {
										name: t_role_name,
										title: t_role_obj['title'],
										status: t_role_obj['status']
									};
									role_usr_ary.push(t_role_item);
								}

								Obj_com.push({
									company_id: com[j].company_id,
									company_name: com[j].company_name,
									status: t_cmp_dict[t_comp_id],
									roles: role_usr_ary
								});
							}

							_this.setState({ com_role_data: Obj_com, isEdit: true });
						});
					}
				}
			});
		},

		gotoAdd: function gotoAdd(com) {
			var _this2 = this;

			this.loadRoleData();
			this.formReset();
			// 全部公司显示
			rest1.company.read({ beg: 0, count: 100 }).done(function (data) {

				var companys = data.companys,
				    com_new = [],
				    com_temp;

				companys.map(function (index, elem) {
					com_temp = {
						company_id: index.uuid,
						company_name: index.name,
						status: false
					};
					com_new[elem] = com_temp;
					return com_new;
				});
				_this2.setState({ com: com_new });

				// 全角色显示
				rest1.manager.read('roles').done(function (role_all) {
					var temp, com_temp;
					var com_new_obj = com_new;
					for (var i = 0; i < role_all.length; i++) {
						temp = {
							name: role_all[i].name,
							title: role_all[i].title,
							status: false
						};
						role_all[i] = temp;
					}
					_this2.setState({ role_show: role_all });

					for (var i = 0; i < com_new_obj.length; i++) {
						var tt = [];

						for (var z = 0; z < role_all.length; z++) {
							temp = {
								name: role_all[z].name,
								title: role_all[z].title,
								status: false
							};
							tt[z] = temp;
						}

						com_temp = {
							company_id: com_new_obj[i].company_id,
							company_name: com_new_obj[i].company_name,
							status: com_new_obj[i].status,
							roles: tt
						};
						com_new_obj[i] = com_temp;
					}
					_this2.setState({ com_role_data: com_new_obj });
				});
			});

			this.setState({ isEdit: true, warn: false, warntxt: '' });
		},

		gotoShow: function gotoShow() {
			this.loadMgrsData();
			this.setState({ cur_page: 1, isEdit: false, role_all: [], com_role_data: [], search_result_none: false });
		},

		validate: function validate() {
			var self = this;

			return $("#all_manager_edit_form").validate({
				rules: {
					phone: {
						required: true,
						minlength: 11,
						maxlength: 11,
						number: true
					},
					name: {
						required: true
					}
				},
				messages: {
					phone: {
						required: "手机号码不能为空",
						minlength: "请填写11位有效数字的手机号码",
						maxlength: "请填写11位有效数字的手机号码",
						number: "手机号码必须为合法数字"
					},
					name: {
						required: "姓名不能为空"
					}
				}
			}).form();
		},

		// 表单重置
		formReset: function formReset() {
			// 输入框置空
			this.setState({ cdata: [] });
		},

		// 删除人员
		handleDelete: function handleDelete(e, userid) {
			$('#smModal').modal('show');
			this.setState({ tipTxt: '您确定删除所选人员吗？', noBtn: false, istipTxt2: true, tipTxt2: '（确定删除后，该人员将不再有权限登录此系统进行操作）', userid: userid });
		},
		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			$('#smModal').modal('hide');
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm(e, userid) {
			var _this3 = this;

			rest.manager.del(userid).done(function (ret) {
				if (ret.result) {
					_this3.setState({ tipTxt: '删除成功！', istipTxt2: false, noBtn: true });
					var time = setTimeout(function () {
						_this3.handleTipDismiss();
						var beg = _this3.state.beg;
						_this3.loadMgrsData(beg);
					}, 800);
				}
			}).error(function (data) {
				_this3.setState({ tipTxt: '删除失败，请联系管理员' });
			});
		},

		// 提交表单
		handleConfirm: function handleConfirm(com_role_data) {

			if (this.validate()) {

				var crd_role_temp = [],
				    isHasRole = false;
				for (var k = 0; k < com_role_data.length; k++) {
					crd_role_temp = com_role_data[k].roles;
					for (var m = 0; m < crd_role_temp.length; m++) {
						if (crd_role_temp[m].status == true) {
							isHasRole = true;
							break;
						}
					}
				}

				if (isHasRole) {

					$('.webui-popover').hide(100);

					this.setState({ warn: false });

					var user_name = $('#name').val();
					var telephone = $('#phone').val();

					var obj_new = {};
					for (var i = 0; i < com_role_data.length; i++) {

						var obj_roles = com_role_data[i].roles,
						    temp_role = [],
						    company_id,
						    temp;

						for (var j = 0; j < obj_roles.length; j++) {
							if (obj_roles[j].status) {
								temp_role.push(obj_roles[j].name);
							}
						}
						company_id = com_role_data[i].company_id;
						obj_new[company_id] = temp_role;
					}

					var result = {
						user_name: user_name,
						telephone: telephone,
						roles: obj_new
					};
					this.handleNewConfirm(result);
				} else {
					$('.all-manager-page-warn').find('.page-error').remove();
					this.setState({ warn: true, warntxt: '至少选中一个运营公司' });
				}
			}
		},
		handleNewConfirm: function handleNewConfirm(result) {
			var _this4 = this;

			rest.managers.create(result).done(function (ret) {
				if (ret.result) {
					_this4.gotoShow();
					_this4.formReset();
					_this4.setState({ search_result_none: false });
					$('#searchInput').val(null);
				}
			}).error(function (data) {

				if (data.status === 400 && data.responseJSON.msg) {
					if (data.responseJSON.name) {
						var name = data.responseJSON.name;
						var tpl = data.responseJSON.msg + '（ 原始姓名为' + name + ' ）';
						_this4.setState({ warn: true, warntxt: tpl });
						_this4.refs.name.getDOMNode().value = name;
					} else {
						_this4.setState({ warn: true, warntxt: data.responseJSON.msg });
					}
				} else {
					_this4.setState({ warn: true, warntxt: "服务器出错,请联系管理员" });
				}
			});
		},

		loadMgrsData: function loadMgrsData() {
			var _this5 = this;

			rest.managers.read({ sort: "telephone" }).done(function (mdata) {
				var beg = _this5.state.beg;
				if (mdata.result) {
					if (mdata.managers.length === 0) {
						_this5.setState({ search_result_none: true });
					} else {
						_this5.setState({
							mdata: mdata.managers,
							total: mdata.managers.length
						});
						_this5.handlePagination(mdata.managers, beg);
					}
				}
			});
		},

		loadRoleData: function loadRoleData() {
			var _this6 = this;

			rest1.manager.read('roles').done(function (data) {
				_this6.setState({ role_all: data });
			});
		},
		loadComdata: function loadComdata() {
			var _this7 = this;

			rest1.company.read({ beg: 0, count: 100 }).done(function (data) {
				var com = data.companys,
				    com_new = [],
				    com_temp;
				com.map(function (index, elem) {
					com_temp = {
						company_id: index.uuid,
						company_name: index.name,
						status: false
					};
					com_new[elem] = com_temp;
					return com_new;
				});
				_this7.setState({ com: com_new });
			});
		},

		handlePagination: function handlePagination(data, beg) {
			var data = data;
			var new_mdata = [];
			var total = data.length;
			var beg = beg;
			var count = this.state.count;
			var end_page = parseInt(beg + count);
			var last_page = parseInt(total - beg);
			if (last_page < count) {
				end_page = parseInt(beg + last_page);
			}
			for (var i = beg; i < end_page; i++) {
				new_mdata.push(data[i]);
			}
			this.setState({ new_mdata: new_mdata });
		},

		// 分页
		changeAutoPage: function changeAutoPage(data, page) {
			var count = this.state.count,
			    data = data;
			if (page === 1) {
				var beg = 0;
			} else {
				var beg = parseInt(count * (page - 1));
			}
			this.handlePagination(data, beg);
			this.setState({ cur_page: page });
		},

		// 搜索功能
		handleSearch: function handleSearch() {
			var _this8 = this;

			var searchInput = $('#searchInput').val();
			if (searchInput !== '') {
				rest.managers.read({ sort: "telephone", search: searchInput }).done(function (mdata) {
					if (mdata.managers.length === 0) {
						_this8.setState({ search_result_none: true, mdata: [], total: 0 });
						_this8.handlePagination([], 0);
						var tpl = '<tr id="colspan_none"><td colspan="6" rowspan="2">暂无数据</td></tr>';
						$('.advices-usermgr-manager').find('.c-table').append(tpl);
					} else {
						_this8.setState({ search_result_none: false, mdata: mdata.managers, total: mdata.managers.length });
						_this8.handlePagination(mdata.managers, 0);
						$('#colspan_none').remove();
					}
				});
			} else {
				this.loadMgrsData(0);
				this.setState({ search_result_none: false });
				$('#colspan_none').remove();
			}
		},

		render: function render() {
			var _this9 = this;

			var pageShow = function pageShow() {
				if (!_this9.state.isEdit) {
					return React.createElement(
						'div',
						{ className: 'all-manager-index' },
						React.createElement(
							'div',
							{ className: 'panel panel-default' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'运营员管理'
								),
								React.createElement(
									'div',
									{ className: 'c-search sm mr20' },
									React.createElement('input', { type: 'text', className: 's-input', placeholder: '搜索人员', id: 'searchInput',
										onKeyDown: function onKeyDown(e) {
											return e.keyCode === 13 && _this9.handleSearch();
										} }),
									React.createElement(
										'span',
										{ className: 's-btn', id: 'searchBtn', onClick: _this9.handleSearch },
										React.createElement('span', { className: 'iconfont icon-sousuo' })
									)
								),
								React.createElement(
									'button',
									{ className: 'btn btn-primary', type: 'button', onClick: function onClick(e) {
											return _this9.gotoAdd(_this9.state.com);
										} },
									'添加人员'
								)
							),
							React.createElement(Table, {
								search_result_none: _this9.state.search_result_none,
								mdata: _this9.state.new_mdata,
								'delete': function _delete(e, userid) {
									_this9.handleDelete(e, userid);
								},
								edit: function edit(e, userid, com) {
									_this9.gotoEdit(userid, _this9.state.com);
								} }),
							React.createElement('div', { className: _this9.state.search_result_none ? 'list-blank-holder v2' : 'none' }),
							React.createElement(
								'div',
								{ className: 'tc' },
								React.createElement(Pagination, { current: _this9.state.cur_page, pageSize: _this9.state.count, total: _this9.state.total,
									className: _this9.state.total <= _this9.state.count ? "none" : "ib mt30 mb30 v2",
									onChange: function onChange(page) {
										_this9.changeAutoPage(_this9.state.mdata, page);
									} })
							)
						),
						React.createElement(
							Modal,
							{ title: '温馨提示', modalSm: true, id: 'smModal', noBtn: _this9.state.noBtn, dismiss: _this9.handleTipDismiss, confirm: function confirm(e) {
									_this9.handleTipConfirm(e, _this9.state.userid);
								} },
							React.createElement(
								'div',
								{ className: _this9.state.noBtn ? "m-msg" : "m-msg fs14" },
								React.createElement(
									'p',
									null,
									_this9.state.tipTxt
								),
								React.createElement(
									'p',
									{ className: _this9.state.istipTxt2 ? 'tipTxt2' : 'none' },
									_this9.state.tipTxt2
								)
							)
						)
					);
				} else {
					return React.createElement(
						'div',
						{ className: 'all-manager' },
						React.createElement(
							'div',
							{ className: 'container' },
							React.createElement(
								'div',
								{ className: 'panel panel-default' },
								React.createElement(
									'div',
									{ className: 'panel-heading' },
									React.createElement(
										'h3',
										{ className: 'panel-title' },
										'人员添加'
									)
								),
								React.createElement(
									'div',
									{ className: 'panel-body' },
									React.createElement(
										'form',
										{ id: 'all_manager_edit_form', className: 'edit-form form-horizontal' },
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'phone', className: 'col-sm-2 control-label' },
												'手机号'
											),
											React.createElement(
												'div',
												{ className: 'col-sm-10' },
												React.createElement('input', { className: 'form-control reset', id: 'phone', name: 'phone', defaultValue: _this9.state.cdata.telephone })
											)
										),
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'name', className: 'col-sm-2 control-label' },
												'用户名'
											),
											React.createElement(
												'div',
												{ className: 'col-sm-10' },
												React.createElement('input', { className: 'form-control reset', id: 'name', name: 'name', defaultValue: _this9.state.cdata.user_name })
											)
										)
									),
									React.createElement('div', { className: 'panel-line' }),
									React.createElement(
										'div',
										{ className: 'fr-br-mid' },
										React.createElement(
											'h5',
											{ style: { "display": "inline-block" } },
											'运营公司'
										),
										React.createElement(
											'div',
											{ className: _this9.state.warn ? "all-manager-page-warn" : "none" },
											React.createElement(
												'label',
												{ className: 'page-error2' },
												_this9.state.warntxt
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'fr-br-main' },
										_this9.state.com_role_data.map(function (index, elem) {
											var com_id = index.company_id,
											    com_name = index.company_name,
											    com_status = index.status,
											    tooltip_id = "role_tooltip" + elem;
											return React.createElement(
												'div',
												{ className: 'com-role-container' },
												React.createElement(
													'span',
													{ className: com_status ? "tag active" : "tag", title: com_name,
														onClick: function onClick(e) {
															return _this9.handleRole(_this9.state.com_role_data, com_name, com_id, elem);
														} },
													com_name,
													React.createElement('i', { className: 'ic c-corner' })
												),
												React.createElement(
													'div',
													{ className: 'webui-popover bottom-right in none', id: tooltip_id },
													React.createElement('div', { className: 'arrow' }),
													React.createElement(
														'div',
														{ className: 'webui-popover-inner' },
														React.createElement(
															'div',
															{ className: 'webui-popover-content' },
															React.createElement(
																'div',
																{ className: 'tooltipbox' },
																React.createElement(
																	'div',
																	{ className: 'rolebox-top' },
																	_this9.state.role_show.map(function (index, elem) {
																		return React.createElement(
																			'label',
																			{ className: index.status ? "role active" : "role",
																				onClick: function onClick(e) {
																					return _this9.handleToggleRole(_this9.state.role_show, elem, index.name, index.status, tooltip_id);
																				} },
																			React.createElement('span', { className: index.status ? "c-cb active" : "c-cb" }),
																			index.title
																		);
																	})
																),
																React.createElement(
																	'div',
																	{ className: 'rolebox-bottom' },
																	React.createElement(
																		'div',
																		{ className: 'btnbox pull-right' },
																		React.createElement(
																			'div',
																			{ className: 'btn btn-default btn-xs', onClick: function onClick(e) {
																					return _this9.handleAllChoose(e, _this9.state.com_role_data, _this9.state.role_show, tooltip_id);
																				} },
																			'全选'
																		),
																		React.createElement(
																			'div',
																			{ className: 'btn btn-default btn-xs', onClick: function onClick(e) {
																					return _this9.handleClearChoose(e, _this9.state.role_show, tooltip_id);
																				} },
																			'清除'
																		)
																	)
																)
															)
														)
													)
												)
											);
										})
									),
									React.createElement(
										'div',
										{ className: 'notebox' },
										React.createElement(
											'div',
											{ className: 'warm' },
											React.createElement(
												'span',
												{ className: 'tit' },
												'提示：'
											),
											React.createElement(
												'span',
												{ className: 'txt' },
												'1. 需要选中此公司最少需选中一种身份',
												React.createElement('br', null),
												'2. 点击清除将取消选中公司',
												React.createElement('br', null),
												'3. 重复点击可取消选中'
											)
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'panel-footer' },
									React.createElement(
										'div',
										{ className: 'btnbox' },
										React.createElement(
											'div',
											{ className: 'pull-right' },
											React.createElement(
												'div',
												{ className: 'btn btn-default btn-lg', type: 'button', id: 'cancel', onClick: _this9.gotoShow },
												'取消'
											),
											React.createElement(
												'div',
												{ className: 'btn btn-primary save-btn btn-lg', id: 'save', type: 'submit', onClick: function onClick(e) {
														return _this9.handleConfirm(_this9.state.com_role_data);
													} },
												'确定'
											)
										)
									)
								)
							)
						)
					);
				}
			};
			return React.createElement(
				'div',
				{ className: 'all-manager' },
				pageShow()
			);
		}
	});

	return Allmgr;
});