'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 公司列表
 */

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js'], function (mods, r, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var Company = React.createClass({
		displayName: 'Company',

		contextTypes: {
			updateNav: React.PropTypes.func.isRequired
		},

		getInitialState: function getInitialState() {
			var _ref;

			return _ref = {
				MgrOrVer: false,
				warn: false,
				warntxt: '',
				isFormOK: false,
				noBtn: false,
				isUuid: false,
				c_uuid: '',
				cur_page: 1,
				beg: 0,
				total: 0,
				count: 15,
				isSearch: false,
				search_result_none: false,
				modTitle: '',
				opt: '',
				mdata: [],
				com_props: [],
				uuid: '',
				selectValue: '',
				selectType: '',
				isShowSelectList: false
			}, _defineProperty(_ref, 'warn', false), _defineProperty(_ref, 'tipTxt', ''), _defineProperty(_ref, 'istipTxt2', false), _defineProperty(_ref, 'tipTxt2', ''), _defineProperty(_ref, 'cur_com_name', ''), _defineProperty(_ref, 'userinfo', {}), _ref;
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			$('.frame-body-right').addClass('v2');
			this.enterMgrOrVer();

			var opt = {
				uuid: ''
			};
			rest.user.update('com', opt).done(function (ret) {
				if (ret.result) {
					_this.context.updateNav();
				}
			}).error(function (data) {

				if (data.status === 400 && data.responseJSON.msg) {
					_this.setState({ warn: true, warntxt: data.responseJSON.msg });
				} else {
					$('#smModal').modal('show');
					_this.setState({ tipTxt: "切换公司失败，请联系管理员" });
				}
			});
		},
		componentDidUpdate: function componentDidUpdate() {
			if (this.state.MgrOrVer) {
				// 鼠标移入移出删除和编辑按钮出现
				$(".com-list li").mouseover(function () {
					$(this).find('.iconfont').show();
				}).mouseout(function () {
					$(this).find('.iconfont').hide();
				});
			}
		},

		enterMgrOrVer: function enterMgrOrVer() {
			var _this2 = this;

			rest.user.read().done(function (data) {
				var cur_com_name = data.company;
				_this2.setState({ cur_com_name: cur_com_name });
				_this2.setState({ userinfo: data });
				var role = data.role_group;

				if (role === 'role_super_manager') _this2.setState({ MgrOrVer: true });

				_this2.loadDataFromServer();
			});
		},

		// jq表单验证
		validate: function validate() {

			var self = this;

			return $("#add_com").validate({
				rules: {
					name: "required",
					uuid: {
						required: true,
						first_en_num: true,
						maxlength: 12
					}
				},
				messages: {
					name: {
						required: "用户名不能为空"
					},
					uuid: {
						required: "公司ID不能为空",
						maxlength: "公司ID不超过12个字符"
					}
				}
			}).form();
		},

		// 鼠标点击搜索框获取焦点，并发生样式变动
		focusSearch: function focusSearch() {
			this.setState({ isSearch: true });
			$('#search_btn').removeAttr('disable');
		},
		// 弹窗关闭
		handleDismiss: function handleDismiss() {
			$('#myModal').modal('hide');
			this.formReset();
		},

		// 新建公司
		handleAdd: function handleAdd() {
			$('#myModal').modal('show');
			this.formReset();
			this.setState({ modTitle: '添加公司', opt: 'add' });
		},
		// 修改公司
		handleEdit: function handleEdit(e, index) {
			e.stopPropagation();

			var uuid = index.uuid;
			var name = index.name;
			var desc = index.desc;
			var com_props = index.property.name;
			var com_type = index.property.type;

			$('#name').val(name);
			$('#desc').val(desc);

			$('#myModal').modal('show');
			this.setState({ modTitle: '修改公司', opt: 'edit', isUuid: false, uuid: uuid, selectValue: com_props, selectType: com_type });
		},
		// 删除公司
		handleDelete: function handleDelete(e, uuid) {
			e.stopPropagation();
			$('#smModal').modal('show');
			this.setState({ tipTxt: '您确定删除此公司吗?', istipTxt2: true, tipTxt2: '（确定删除后，此公司包括里面的数据将一并清除）', uuid: uuid });
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm() {
			var _this3 = this;

			var uuid = this.state.uuid;
			rest.company.del(uuid).done(function (data) {
				if (data.result) {
					_this3.setState({ tipTxt: '删除成功', istipTxt2: false, noBtn: true });
					var time = setTimeout(function () {
						_this3.handleTipDismiss();
						var beg = _this3.state.beg;
						_this3.loadComData(beg);
						_this3.setState({ noBtn: false });
					}, 800);
				}
			}).error(function (data) {

				if (data.status === 400 && data.responseJSON.msg) {
					_this3.setState({ warn: true, warntxt: data.responseJSON.msg });
				} else if (data.status === 301) {
					window.location.reload();
				} else {
					_this3.setState({ warn: true, warntxt: "服务器出错,请联系管理员" });
				}
			});
		},

		// 搜索功能
		handleSearch: function handleSearch() {
			var _this4 = this;

			var searchTxt = $('#searchTxt').val();
			if (searchTxt !== '') {
				rest.company.read({ beg: 0, count: this.state.count, search: searchTxt }).done(function (mdata) {
					if (mdata.count === 0) {
						_this4.setState({ search_result_none: true, mdata: [], total: mdata.count });
						$('.com-rt span').html('为您找到相关结果约0条');
					} else {
						_this4.setState({ search_result_none: false, mdata: mdata.companys, total: mdata.count });
						$('.com-rt span').html('为您找到相关结果约' + mdata.count + '条');
					}
				});
			} else {
				this.loadComData(0);
				this.setState({ search_result_none: false });
				$('.com-rt span').html('公司列表');
			}
		},

		// 表单重置
		formReset: function formReset() {
			$('.reset').val('');
			this.setState({ selectValue: '选择', uuid: '', isSearch: false, warn: false });
		},
		// 提交表单
		handleConfirm: function handleConfirm() {

			if (this.validate()) {

				var result = {};
				var name = $('#name').val().trim();
				var desc = $('#desc').val().trim();
				var uuid = $('#uuid').val().trim();
				var com_props = this.state.selectValue;
				var com_type = this.state.selectType;

				result = { name: name, desc: desc, uuid: uuid, property: com_type };

				this.handleNewConfirm(result, uuid);
			}
		},
		handleNewConfirm: function handleNewConfirm(result, uuid) {
			var _this5 = this;

			if (this.state.opt === 'add') {
				// 添加
				rest.company.create(result).done(function (data) {
					if (data.result) {
						_this5.handleDismiss();
						var beg = _this5.state.beg;
						_this5.loadComData(beg);
						_this5.formReset();
						_this5.setState({ search_result_none: false });
						$('#searchTxt').val(null);
					}
				}).error(function (data) {

					if (data.status === 400 && data.responseJSON.msg) {
						if (data.responseJSON.recommendation) {
							_this5.setState({ isUuid: true, c_uuid: data.responseJSON.recommendation, warn: true, warntxt: "公司ID已重复，请重新输入或者选择参考ID" }); // 公司ID数据库里已存在相同ID
						} else {
								_this5.setState({ warn: true, warntxt: data.responseJSON.msg });
							}
					}
				});
			} else {
				var uuid = this.state.uuid;
				// 修改
				rest.company.update(uuid, result).done(function (data) {
					if (data.result) {
						_this5.handleDismiss();
						var beg = _this5.state.beg;
						_this5.loadComData(beg);
						_this5.formReset();
						_this5.setState({ search_result_none: false });
						$('#searchTxt').val(null);
					}
				}).error(function (data) {
					if (data.status === 400 && data.responseJSON.msg) {
						_this5.setState({ warn: true, warntxt: data.responseJSON.msg });
					}
				});
			}
		},

		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			$('#smModal').modal('hide');
		},

		// 下拉菜单操作
		handleSelectClick: function handleSelectClick(e) {
			$('#dd_option').toggle(100);
			$(document).one('click', function () {
				$('#dd_option').hide(100);
			});
		},
		handleOptionListClick: function handleOptionListClick(index) {
			var val = index.name;
			var type = index.type;
			this.setState({ selectValue: val, selectType: type });

			$('#dd_option').hide(100);
		},

		// 分页
		changeAutoPage: function changeAutoPage(page) {
			var _this6 = this;

			var count = this.state.count;
			if (page === 1) {
				var beg = 0;
			} else {
				var beg = parseInt(count * (page - 1));
			}
			this.setState({ cur_page: page });

			var searchTxt = $('#searchTxt').val();
			if (searchTxt !== '') {
				rest.company.read({ beg: beg, count: this.state.count, search: searchTxt }).done(function (mdata) {
					if (mdata.length === 0) {
						_this6.setState({ search_result_none: true, mdata: [], total: mdata.count });
					} else {
						_this6.setState({ search_result_none: false, mdata: mdata[conn_name], total: mdata.count });
					}
				});
			} else {
				this.loadComData(beg);
			}
		},

		// 切换公司
		handleChangeCompany: function handleChangeCompany(uuid, com_name) {
			var _this7 = this;

			var opt = {
				uuid: uuid
			};
			rest.user.update('com', opt).done(function (ret) {

				if (ret.result) {

					_this7.setState({ cur_com_name: com_name });

					var code = $.randomCode();
					$.cookie('md5', code, { domain: paths.rcn.domain });
					window.md5 = code;

					var url = '/manager?1#/companyWelcome';
					window.location.href = url;
				}
			}).error(function (data) {

				if (data.status === 400 && data.responseJSON.msg) {
					_this7.setState({ warn: true, warntxt: data.responseJSON.msg });
				} else {
					$('#smModal').modal('show');
					_this7.setState({ tipTxt: "切换公司失败，请联系管理员" });
				}
			});
		},

		// 获取数据函数入口
		loadDataFromServer: function loadDataFromServer() {
			var beg = this.state.beg;
			this.loadComData(beg);
			this.loadComPropsData();
		},
		loadComData: function loadComData(beg) {
			var _this8 = this;

			rest.company.read({ beg: beg, count: this.state.count }).done(function (mdata) {
				if (_this8.isMounted()) {
					_this8.setState({
						mdata: mdata.companys,
						total: mdata.count
					});
				}
			});
		},
		loadComPropsData: function loadComPropsData() {
			var _this9 = this;

			if (this.state.MgrOrVer) {
				rest.company.read('property').done(function (props) {
					if (_this9.isMounted()) {
						_this9.setState({
							com_props: props
						});
					}
				});
			}
		},

		render: function render() {
			var _this10 = this;

			return React.createElement(
				'div',
				{ className: 'company-base' },
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
								'div',
								{ className: 'cf com-search' },
								React.createElement(
									'div',
									{ className: this.state.MgrOrVer ? "fr ml10" : "fr" },
									React.createElement(
										'button',
										{ className: this.state.MgrOrVer ? "btn btn-primary btn-lg" : "none", onClick: this.handleAdd },
										'新建公司'
									)
								),
								React.createElement(
									'div',
									{ className: 'ovh' },
									React.createElement(
										'div',
										{ className: this.state.isSearch ? 'c-search active' : 'c-search disable', id: 'searchbox', onClick: this.focusSearch },
										React.createElement('input', { type: 'text', className: 's-input', placeholder: '输入您想要查找的公司', id: 'searchTxt',
											onKeyDown: function onKeyDown(e) {
												return e.keyCode === 13 && _this10.handleSearch();
											} }),
										React.createElement(
											'span',
											{ className: 's-btn', onClick: this.handleSearch, id: 'search_btn' },
											React.createElement('span', { className: 'iconfont icon-sousuo' })
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'com-rt' },
								React.createElement(
									'span',
									null,
									'公司列表'
								)
							),
							React.createElement(
								'div',
								null,
								this.state.MgrOrVer ? React.createElement(
									'div',
									{ className: this.state.search_result_none ? 'list-blank-holder' : 'list-blank-holder none' },
									React.createElement(
										'span',
										null,
										'目前还没新建公司，'
									),
									React.createElement(
										'span',
										{ className: 'add', onClick: this.handleAdd },
										'立即新建'
									)
								) : React.createElement(
									'div',
									{ className: this.state.search_result_none ? 'list-blank-holder' : 'list-blank-holder none' },
									React.createElement(
										'span',
										null,
										'目前还没新建公司'
									)
								)
							),
							React.createElement(
								'ul',
								{ className: 'com-list', id: 'com-list' },
								this.state.mdata.map(function (index, elem) {
									var com_name = index.name;
									var uuid = index.uuid;
									var cindex = index;
									var firC = index.py.charAt(0);
									return React.createElement(
										'li',
										{ className: com_name == _this10.state.cur_com_name ? "item itembox cur_com" : "item itembox", onClick: function onClick(e) {
												_this10.handleChangeCompany(uuid, com_name);
											} },
										React.createElement(
											'div',
											{ className: 'mr20' },
											React.createElement(
												'span',
												{ className: 'cl-mark ' + firC + 'col col' },
												firC
											)
										),
										React.createElement(
											'div',
											{ className: 'mid' },
											React.createElement(
												'span',
												{ className: 'none' },
												index.uuid
											),
											React.createElement(
												'span',
												{ className: 'cl-tit', title: com_name },
												com_name
											),
											React.createElement(
												'span',
												{ className: 'cl-note' },
												index.property.name
											),
											React.createElement(
												'div',
												{ className: 'cl-cont', title: index.desc },
												index.desc
											)
										),
										React.createElement(
											'div',
											{ className: 'btnbox' },
											React.createElement('span', { className: 'iconfont icon-bianji none', onClick: function onClick(e) {
													_this10.handleEdit(e, cindex);
												} }),
											React.createElement('span', { className: 'iconfont icon-lajitong none', onClick: function onClick(e) {
													_this10.handleDelete(e, uuid);
												} })
										)
									);
								})
							),
							React.createElement(
								'div',
								{ className: 'tc' },
								React.createElement(Pagination, { current: this.state.cur_page, pageSize: this.state.count, total: this.state.total,
									className: this.state.total <= this.state.count ? "none" : "ib mt30 v2", onChange: function onChange(page) {
										_this10.changeAutoPage(page);
									} })
							)
						)
					),
					React.createElement(
						Modal,
						{ title: this.state.modTitle, id: 'myModal', noBtn: this.state.noBtn, dismiss: this.handleDismiss, confirm: this.handleConfirm },
						React.createElement(
							'form',
							{ id: 'add_com', className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'name', className: 'col-sm-2 control-label' },
									'公司名称'
								),
								React.createElement(
									'div',
									{ className: 'col-sm-10' },
									React.createElement('input', { className: 'form-control reset', id: 'name', name: 'name' })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'name', className: this.state.opt == 'edit' ? "none" : "col-sm-2 control-label" },
									'公司ID'
								),
								React.createElement(
									'div',
									{ className: 'col-sm-10' },
									React.createElement('input', { type: 'text', className: this.state.opt == 'edit' ? "none" : "uuid reset form-control reset", id: 'uuid', name: 'uuid', placeholder: '例如：a123456' })
								)
							),
							React.createElement(
								'div',
								{ className: this.state.isUuid ? "form-group" : "none" },
								React.createElement(
									'label',
									{ 'for': 'name', className: this.state.isUuid ? "col-sm-2 control-label" : "none" },
									'参考ID：  '
								),
								React.createElement(
									'span',
									{ className: this.state.isUuid ? "col-sm-4" : "none" },
									this.state.c_uuid
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ className: 'col-sm-2 control-label' },
									'属性'
								),
								React.createElement(
									'div',
									{ className: 'col-sm-10' },
									React.createElement(
										'div',
										{ className: 'dropdown-v2' },
										React.createElement(
											'div',
											{ className: 'select', type: 'button', onClick: function onClick(e) {
													_this10.handleSelectClick(e);
												} },
											React.createElement('input', { className: 'txt', placeholder: '选择', name: this.state.selectType,
												value: this.state.selectValue, disabled: true }),
											React.createElement(
												'span',
												{ className: 'ic' },
												React.createElement('span', { className: 'corner' })
											)
										),
										React.createElement(
											'ul',
											{ className: this.props.isShowSelectList ? 'option' : 'option none', id: 'dd_option' },
											this.state.com_props.map(function (index) {
												return React.createElement(
													'li',
													{ onClick: function onClick() {
															_this10.handleOptionListClick(index);
														} },
													index.name
												);
											})
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group com-desc' },
								React.createElement(
									'label',
									{ className: 'col-sm-2 control-label' },
									'描述'
								),
								React.createElement(
									'div',
									{ className: 'col-sm-10' },
									React.createElement('textarea', { id: 'desc', className: 'form-control reset', rows: '8' })
								)
							),
							React.createElement(
								'div',
								{ className: this.state.warn ? "m-warn" : "m-warn none" },
								this.state.warntxt
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', modalSm: true, id: 'smModal', noBtn: this.state.noBtn, dismiss: this.handleTipDismiss, confirm: function confirm(e) {
								_this10.handleTipConfirm(e);
							} },
						React.createElement(
							'div',
							{ className: 'm-msg' },
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

	return Company;
});