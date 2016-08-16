'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/dropdown/index.js', paths.rcn.comps + '/modal/index.js'], function (mods, r, Dropdown, Modal) {

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Syndicate = React.createClass({
		displayName: 'Syndicate',

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
				uuid: '',
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

		// 添加集团
		handleAdd: function handleAdd() {
			this.setState({
				show: true,
				modTitle: '新增集团',
				opt: 'add'
			});
			this.formReset();
		},
		// 修改集团
		handleEdit: function handleEdit(e, index) {
			e.stopPropagation();

			$('#name').val(index.name);
			$('#desc').val(index.desc);

			this.setState({
				show: true,
				modTitle: '修改集团',
				opt: 'edit',
				selectValue: index.syndicate_name,
				uuid: index.uuid,

				temp_data: {
					name: index.name,
					desc: index.desc
				}
			});
		},

		// 删除集团
		handleDelete: function handleDelete(e, uuid) {
			e.stopPropagation();
			this.setState({ tipShow: true, tipTxt: '您确定删除所选集团吗？', istipTxt2: true, tipTxt2: '（确定删除后，该集团将不再有权限登录此系统进行操作）', uuid: uuid });
		},
		// 小弹窗 - 关闭弹窗
		handleTipDismiss: function handleTipDismiss() {
			this.setState({ tipShow: false });
		},
		// 确认删除
		handleTipConfirm: function handleTipConfirm() {
			var _this = this;

			var uuid = this.state.uuid;
			rest.syndicate.del(uuid).done(function (data) {
				if (data.result) {
					_this.setState({ tipTxt: '删除成功', noBtn: true });
					var time = setTimeout(function () {
						_this.handleTipDismiss();
						var beg = _this.state.beg;
						_this.loadSynData(beg);
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

			return $("#addSyn_form").validate({
				rules: {
					name: "required",
					user_name: "required",
					telephone: {
						required: true,
						minlength: 11,
						number: true
					},
					uuid: "required"
				},
				messages: {
					name: {
						required: "集团名称不能为空"
					},
					user_name: {
						required: "超级运营员不能为空"
					},
					telephone: {
						required: "手机号码不能为空",
						minlength: "手机号码不能小于11位数字",
						number: "手机号码必须为合法数字"
					},
					uuid: {
						required: "集团ID不能为空"
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
					rest.syndicate.create(result).done(function (data) {

						if (data.result) {
							_this2.handleDismiss();
							_this2.loadSynData();
							_this2.formReset();
							_this2.setState({ search_result_none: false });
							$('#searchInput').val(null);
						}
					}).error(function (data) {

						if (data.status === 400 && data.responseJSON.msg) {
							if (data.responseJSON.recommendation) {
								_this2.setState({ isUuid: true, c_uuid: data.responseJSON.recommendation, warn: true, warntxt: "公司ID已重复，请重新输入或者选择参考ID" }); // 公司ID数据库里已存在相同ID
							} else {
									_this2.setState({ warn: true, warntxt: data.responseJSON.msg });
								}
						}
						// else{
						// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
						// }
					});
				} else {
						var uuid = this.state.uuid;

						rest.syndicate.update(uuid, result).done(function (data) {

							if (data.result) {
								_this2.handleDismiss();
								_this2.loadSynData();
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
			this.loadSynData(beg);
		},
		loadSynData: function loadSynData(beg) {
			var _this3 = this;

			rest.syndicate.read().done(function (mdata) {
				if (mdata.syndicates.length === 0) {
					_this3.setState({ search_result_none: true });
				} else {
					if (_this3.isMounted()) {
						_this3.setState({
							mdata: mdata.syndicates,
							total: mdata.count
						});
					}
				}
			});
		},

		// 分页
		changeAutoPage: function changeAutoPage(page) {
			var _this4 = this;

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
						_this4.setState({ search_result_none: true, mdata: [], total: mdata.count });
					} else {
						_this4.setState({ search_result_none: false, mdata: mdata.supers, total: mdata.count });
					}
				});
			} else {
				this.loadSynData(beg);
			}
		},

		onNameChange: function onNameChange(e) {
			var name = e.target.value.trim();
			this.state.temp_data.name = name;
		},
		onDescChange: function onDescChange(e) {
			var desc = e.target.value.trim();
			this.state.temp_data.desc = desc;
		},
		onSupersChange: function onSupersChange(e) {
			var user_name = e.target.value.trim();
			this.state.temp_data.user_name = user_name;
		},
		onTelephoneChange: function onTelephoneChange(e) {
			var telephone = e.target.value.trim();
			this.state.temp_data.telephone = telephone;
		},
		onIdChange: function onIdChange(e) {
			var uuid = e.target.value.trim();
			this.state.temp_data.uuid = uuid;
		},

		render: function render() {
			var _this5 = this;

			return React.createElement(
				'div',
				{ className: 'admin-base' },
				React.createElement(
					'div',
					{ className: 'admin-manager-syndicate' },
					React.createElement(
						'div',
						{ className: 'fr-top' },
						React.createElement(
							'div',
							{ className: 'fr mr10' },
							React.createElement(
								'button',
								{ className: 'c-button', type: 'button', onClick: this.handleAdd },
								'新增集团'
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
							{ className: 'fr-main-mid w1000' },
							React.createElement(
								'div',
								null,
								React.createElement(
									'div',
									{ className: this.state.search_result_none ? 'list-blank-holder' : 'list-blank-holder none' },
									React.createElement(
										'span',
										null,
										'目前还没新建集团，'
									),
									React.createElement(
										'span',
										{ className: 'add', onClick: this.handleAdd },
										'立即新建'
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
										{ className: com_name == _this5.state.cur_com_name ? "item itembox cur_com" : "item itembox" },
										React.createElement(
											'div',
											{ className: 'mr20' },
											React.createElement('span', { className: 'iconfont icon-cuowu none', onClick: function onClick(e) {
													_this5.handleDelete(e, uuid);
												} }),
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
												'ID: ',
												index.uuid
											),
											React.createElement('span', { className: 'iconfont icon-bianji none', onClick: function onClick(e) {
													_this5.handleEdit(e, cindex);
												} }),
											React.createElement(
												'div',
												{ className: 'cl-cont', title: index.desc },
												index.desc
											)
										),
										React.createElement(
											'div',
											{ className: 'superbox' },
											React.createElement(
												'span',
												{ className: 'tit' },
												'超级运营员：'
											),
											index.supers.map(function (index, elem) {
												return React.createElement(
													'span',
													null,
													index
												);
											})
										),
										React.createElement(
											'div',
											{ className: 'btnbox' },
											React.createElement(
												'span',
												{ className: 'delbtn', onClick: function onClick(e) {
														_this5.handleDelete(e, uuid);
													} },
												'删除'
											),
											React.createElement(
												'span',
												{ className: 'editbtn', onClick: function onClick(e) {
														_this5.handleEdit(e, cindex);
													} },
												'修改'
											)
										)
									);
								})
							)
						)
					),
					React.createElement(Pagination, { current: this.state.cur_page, pageSize: this.state.count, total: this.state.total, className: this.state.total == 0 || 1 ? "none" : "tc mt20 mb20", onChange: function onChange(page) {
							_this5.changeAutoPage(page);
						} }),
					React.createElement(
						Modal,
						{ title: this.state.modTitle, show: this.state.show, btnShow: this.state.btnShow, dismiss: this.handleDismiss, confirm: this.handleConfirm },
						React.createElement(
							'form',
							{ id: 'addSyn_form' },
							React.createElement(
								'label',
								null,
								'集团名称'
							),
							React.createElement('input', { type: 'text', className: 'reset', id: 'name', name: 'name', defaultValue: this.state.temp_data.name,
								onChange: function onChange(e) {
									_this5.onNameChange(e);
								} }),
							React.createElement(
								'div',
								{ className: 'com-desc' },
								React.createElement(
									'label',
									null,
									'集团概况'
								),
								React.createElement('textarea', { rows: '4', id: 'desc', name: 'desc', className: 'reset', defaultValue: this.state.temp_data.desc,
									onChange: function onChange(e) {
										_this5.onDescChange(e);
									} })
							),
							React.createElement(
								'div',
								{ className: this.state.opt == 'edit' && "none" },
								React.createElement(
									'label',
									null,
									'超级运营员名称'
								),
								React.createElement('input', { type: 'text', className: 'reset', id: 'supers', name: 'supers',
									onChange: function onChange(e) {
										_this5.onSupersChange(e);
									} })
							),
							React.createElement(
								'div',
								{ className: this.state.opt == 'edit' && "none" },
								React.createElement(
									'label',
									null,
									'手机号'
								),
								React.createElement('input', { type: 'text', className: 'reset', id: 'telephone', name: 'telephone',
									onChange: function onChange(e) {
										_this5.onTelephoneChange(e);
									} })
							),
							React.createElement(
								'div',
								{ className: this.state.opt == 'edit' && "none" },
								React.createElement(
									'label',
									{ className: 'uuid' },
									'ID'
								),
								React.createElement('input', { type: 'text', id: 'uuid', name: 'uuid', className: 'uuid reset', placeholder: '例如：HD1123746438 12个字符',
									onChange: function onChange(e) {
										_this5.onIdChange(e);
									} }),
								React.createElement(
									'label',
									{ className: this.state.isUuid ? "c-uuid" : "c-uuid none" },
									'参考ID：  '
								),
								React.createElement(
									'span',
									{ className: this.state.isUuid ? "" : "none" },
									this.state.c_uuid,
									'1111111'
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
						{ title: '温馨提示', show: this.state.tipShow, noBtn: this.state.noBtn, dismiss: this.handleTipDismiss, confirm: function confirm(e) {
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
								{ className: this.state.istipTxt2 ? 'tipTxt2' : 'none' },
								this.state.tipTxt2
							)
						)
					)
				)
			);
		}
	});

	return Syndicate;
});

// 接口错误提示