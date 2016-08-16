'use strict';

define(['mods', paths.rcn.util + '/rest.js', './table.js', paths.rcn.comps + '/modal/index.js'], function (mods, r, Table, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Admin = React.createClass({
		displayName: 'Admin',

		getInitialState: function getInitialState() {
			return {
				cur_page: 1,
				beg: 0,
				total: 30,
				count: 30,

				btnShow: true,
				show: false,
				modTitle: '',
				opt: '',
				dismiss: true,
				confirm: true,
				mdata: [],
				rdata: [],
				role: [],
				company: '',
				phone: '',
				name: '',
				userid: '',

				noBtn: false,
				tipShow: false,
				tipTxt: '',

				warn: false,
				warntxt: '',

				search_result_none: false
			};
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			this.loadDataFromServer();

			rest.user.read().done(function (data) {
				_this.setState({ company: data.company });
			});
		},

		validate: function validate() {
			var self = this;

			return $("#addPerson_form").validate({
				debug: true,
				rules: {
					phone: {
						required: true,
						minlength: 11,
						number: true
					},
					name: {
						// required:true
					}
				},
				messages: {
					phone: {
						required: "手机号码不能为空",
						minlength: "手机号码不能小于11位数字",
						number: "手机号码必须为合法数字"
					},
					name: {
						// required:"姓名不能为空"
					}
				},
				errorPlacement: function errorPlacement(error, element) {

					self.setState({ warn: true });
					error.appendTo($('.m-warn'));

					if (element.is('input[name="role"]')) {
						$('input[name="role"]').parent('.select').addClass('error');
					}
				}
			}).form();
		},

		// 关闭弹窗
		handleDismiss: function handleDismiss() {
			this.formReset();
			this.setState({ show: false });
		},
		// 表单重置
		formReset: function formReset() {
			this.refs.phone.getDOMNode().value = '';
			this.refs.name.getDOMNode().value = '';
			this.setState({ warn: false, warntxt: '' });
			this.setState({ role: [] });
			$('.rolebox').find('span').removeClass('role-choose');
		},
		// 选择人员角色
		handleRole: function handleRole(index, elem, e) {
			e.target.classList.toggle('role-choose');
		},

		// 添加人员
		handleAdd: function handleAdd() {
			this.setState({ show: true, modTitle: '添加人员', opt: 'add' });
			this.formReset();
		},
		// 修改人员
		handleEdit: function handleEdit(e, index) {

			this.formReset();

			$('.rolebox').find('span').removeClass('role-choose');

			var userid = index.user_id;
			var name = index.user_name;
			var phone = index.telephone;
			var role = index.roles;
			var company = index.company;

			this.refs.phone.getDOMNode().value = phone;
			this.refs.name.getDOMNode().value = name;
			this.setState({ userid: userid, company: company });

			this.setState({
				show: true,
				modTitle: '修改人员',
				opt: 'edit'
			});

			// 已选择role高亮显示
			var rolechoose = index.roles;
			var $rolespan = $('.rolebox').find('span');
			for (var i = 0; i < rolechoose.length; i++) {
				for (var j = 0; j < $rolespan.length; j++) {
					var name = $rolespan.eq(j).attr('name');
					if (name === rolechoose[i].name) {
						$rolespan.eq(j).addClass('role-choose');
					}
				}
			}
		},
		// 删除人员
		handleDelete: function handleDelete(e, userid) {
			this.setState({ tipShow: true, tipTxt: '您确定删除所选人员吗？', istipTxt2: true, tipTxt2: '（确定删除后，该人员将不再有权限登录此系统进行操作）', userid: userid });
		},
		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			this.setState({ tipShow: false });
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm() {
			var _this2 = this;

			var userid = this.state.userid;
			rest.manager.del(userid).done(function (ret) {
				if (ret.result) {
					_this2.setState({ tipTxt: '删除成功', noBtn: true });
					var time = setTimeout(function () {
						_this2.handleTipDismiss();
						var beg = _this2.state.beg;
						_this2.loadMgrData(beg);
						_this2.setState({ noBtn: false });
					}, 800);
				}
			}).error(function (data) {
				_this2.setState({ tipTxt: '删除失败，请联系管理员' });
			});
		},

		// 提交表单
		handleConfirm: function handleConfirm() {

			if (this.validate()) {

				var $rolechoose = $('.rolebox').find('.role-choose');
				var rolelen = $rolechoose.length;

				if (rolelen === 0) {

					this.setState({ role: [], warn: true, warntxt: "请选择人员角色" });
				} else {

					for (var i = 0; i < rolelen; i++) {
						var roleText = $rolechoose[i].getAttribute('name');
						this.state.role.push(roleText);
					}
					var phone = this.refs.phone.getDOMNode().value.trim();
					var name = this.refs.name.getDOMNode().value.trim();
					var userid = this.state.userid;
					var result = {};

					result = { user_name: name, telephone: phone, role: this.state.role, company: '1', user_id: userid }; // company字段不需要传

					this.handleNewConfirm(result);
				}
			}
		},
		handleNewConfirm: function handleNewConfirm(result) {
			var _this3 = this;

			if (this.state.opt === 'add') {
				rest.managers.create(result).done(function (ret) {
					if (ret.result) {
						_this3.handleDismiss();
						var beg = _this3.state.beg;
						_this3.loadMgrData(beg);
						_this3.formReset();
						_this3.setState({ search_result_none: false });
						$('#searchInput').val(null);
					}
				}).error(function (data) {

					if (data.status === 400 && data.responseJSON.msg) {
						if (data.responseJSON.name) {
							var name = data.responseJSON.name;
							var tpl = data.responseJSON.msg + '（ 原始姓名为' + name + ' ）';
							_this3.setState({ warn: true, warntxt: tpl });
							_this3.refs.name.getDOMNode().value = name;
						} else {
							_this3.setState({ warn: true, warntxt: data.responseJSON.msg });
						}
					} else {
						_this3.setState({ warn: true, warntxt: "服务器出错,请联系管理员" });
					}
				});
			} else {
				rest.manager.update(result).done(function (ret) {
					if (ret.result) {
						_this3.handleDismiss();
						var beg = _this3.state.beg;
						_this3.loadMgrData(beg);
						_this3.formReset();
						_this3.setState({ search_result_none: false });
						$('#searchInput').val(null);
					}
				}).error(function (data) {

					if (data.status === 400 && data.responseJSON.msg) {
						if (data.responseJSON.name) {
							var name = data.responseJSON.name;
							var tpl = data.responseJSON.msg + '（ 原始姓名为' + name + ' ）';
							_this3.setState({ warn: true, warntxt: tpl });
							_this3.refs.name.getDOMNode().value = name;
						} else {
							_this3.setState({ warn: true, warntxt: data.responseJSON.msg });
						}
					} else {
						_this3.setState({ warn: true, warntxt: "服务器出错,请联系管理员" });
					}
				});
			}
		},

		// 获取数据函数入口
		loadDataFromServer: function loadDataFromServer() {
			var beg = this.state.beg;
			this.loadMgrData(beg);
			this.loadRoledata();
		},
		loadMgrData: function loadMgrData(beg) {
			var _this4 = this;

			rest.managers.read({ beg: beg, count: 30, sort: 'telephone' }).done(function (mdata) {
				if (mdata.managers.length === 0) {
					_this4.setState({ search_result_none: true });
				} else {
					if (_this4.isMounted()) {
						_this4.setState({
							mdata: mdata.managers,
							total: mdata.count
						});
					}
				}
			});
		},
		loadRoledata: function loadRoledata() {
			var _this5 = this;

			rest.manager.read('roles').done(function (rdata) {
				if (_this5.isMounted()) {
					_this5.setState({
						rdata: rdata
					});
				}
			});
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
				rest.managers.read({ beg: beg, count: 30, search: searchTxt }).done(function (mdata) {
					if (mdata.length === 0) {
						_this6.setState({ search_result_none: true, mdata: [], total: mdata.count });
					} else {
						_this6.setState({ search_result_none: false, mdata: mdata.managers, total: mdata.count });
					}
				});
			} else {
				this.loadMgrData(beg);
			}
		},

		// 搜索功能
		handleSearch: function handleSearch() {
			var _this7 = this;

			var searchInput = $('#searchInput').val();
			if (searchInput !== '') {
				rest.managers.read({ beg: 0, count: 30, search: searchInput }).done(function (mdata) {
					if (mdata.count === 0) {
						_this7.setState({ search_result_none: true, mdata: [], total: mdata.count });
						var tpl = '<tr id="colspan_none"><td colspan="6" rowspan="2">暂无数据</td></tr>';
						$('.advices-usermgr-manager').find('.c-table').append(tpl);
					} else {
						_this7.setState({ search_result_none: false, mdata: mdata.managers, total: mdata.count });
						$('#colspan_none').remove();
					}
				});
			} else {
				this.loadMgrData(0);
				this.setState({ search_result_none: false });
				$('#colspan_none').remove();
			}
		},

		render: function render() {
			var _this8 = this;

			var opt = this.state.opt;
			return React.createElement(
				'div',
				{ className: 'advices-base' },
				React.createElement(
					'div',
					{ className: 'advices-manager-manager' },
					React.createElement(
						'div',
						{ className: 'fr-top' },
						React.createElement(
							'div',
							{ className: 'w1200 p10' },
							React.createElement(
								'div',
								{ className: 'fr' },
								React.createElement(
									'button',
									{ className: 'c-button', type: 'button', onClick: this.handleAdd },
									'添加人员'
								)
							),
							React.createElement(
								'div',
								{ className: 'fr mr10' },
								React.createElement(
									'div',
									{ className: 'c-search sm' },
									React.createElement('input', { type: 'text', className: 's-input', placeholder: '搜索人员', id: 'searchInput',
										onKeyDown: function onKeyDown(e) {
											return e.keyCode === 13 && _this8.handleSearch();
										} }),
									React.createElement(
										'span',
										{ className: 's-btn', id: 'searchBtn', onClick: this.handleSearch },
										React.createElement('span', { className: 'iconfont icon-sousuo' })
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'fr-topline' },
						React.createElement('div', { className: 'line' })
					),
					React.createElement(
						'div',
						{ className: 'fr-main' },
						React.createElement(
							'div',
							{ className: 'w1200 p10' },
							React.createElement(Table, {
								search_result_none: this.state.search_result_none,
								mdata: this.state.mdata,
								'delete': function _delete(e, userid) {
									_this8.handleDelete(e, userid);
								},
								edit: function edit(e, tindex) {
									_this8.handleEdit(e, tindex);
								} }),
							React.createElement(
								'div',
								{ className: this.state.search_result_none ? 'list-blank-holder' : 'list-blank-holder none' },
								React.createElement(
									'span',
									null,
									'目前还没添加运营员，'
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
							_this8.changeAutoPage(page);
						} }),
					React.createElement(
						Modal,
						{ title: this.state.modTitle, show: this.state.show, btnShow: this.state.btnShow, dismiss: this.handleDismiss, confirm: this.handleConfirm },
						React.createElement(
							'form',
							{ id: 'addPerson_form' },
							React.createElement(
								'label',
								null,
								'手机号码'
							),
							React.createElement('input', { type: 'text', ref: 'phone', name: 'phone', id: 'phone' }),
							React.createElement(
								'label',
								null,
								'姓名'
							),
							React.createElement('input', { type: 'text', ref: 'name', name: 'name', id: 'name' }),
							React.createElement(
								'label',
								null,
								'人员角色'
							),
							React.createElement(
								'div',
								{ className: 'rolebox' },
								this.state.rdata.map(function (index, elem) {
									return React.createElement(
										'span',
										{ onClick: function onClick(e) {
												_this8.handleRole(index, elem, e);
											}, name: index.name },
										index.title
									);
								})
							),
							React.createElement(
								'label',
								{ className: 'inline' },
								'当前位置：'
							),
							React.createElement(
								'span',
								{ ref: 'company' },
								this.state.company
							),
							React.createElement(
								'div',
								{ className: this.state.warn ? "m-warn" : "m-warn none" },
								this.state.warntxt,
								React.createElement(
									'span',
									{ className: this.state.warntxt2 ? "" : "none" },
									'(',
									this.state.warntxt2,
									')'
								)
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', show: this.state.tipShow, noBtn: this.state.noBtn, dismiss: this.handleTipDismiss, confirm: function confirm(e) {
								_this8.handleTipConfirm(e);
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

	return Admin;
});