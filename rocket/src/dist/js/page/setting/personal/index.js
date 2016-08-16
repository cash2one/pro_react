'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * create by lxt
 * final on 2016/07/13
 * 个人设置
 */

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.rcn.comps + "/frame/index",
		"Reducer_Frame": paths.rcn.comps + '/frame/reducers'
	}
});

require(["mods", "Frame", "Reducer_Frame", paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js'], function (mods, Frame, Reducer_Frame, r, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var _mods$ReduxPack = mods.ReduxPack;
	var combineReducers = _mods$ReduxPack.combineReducers;
	var createStore = _mods$ReduxPack.createStore;
	var applyMiddleware = _mods$ReduxPack.applyMiddleware;
	var Provider = mods.ReactReduxPack.Provider;
	var _mods$RouterPack = mods.RouterPack;
	var Router = _mods$RouterPack.Router;
	var Route = _mods$RouterPack.Route;
	var hashHistory = _mods$RouterPack.hashHistory;
	var IndexRedirect = _mods$RouterPack.IndexRedirect;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var syncHistoryWithStore = _mods$ReduxRouterPack.syncHistoryWithStore;
	var routerReducer = _mods$ReduxRouterPack.routerReducer;

	var store = createStore(combineReducers(_extends({
		routing: routerReducer
	}, Reducer_Frame)), applyMiddleware(mods.thunk));
	var history = syncHistoryWithStore(hashHistory, store);

	var Personal = React.createClass({
		displayName: 'Personal',


		getInitialState: function getInitialState() {
			return {

				avatar: '',

				edit: false,
				data: [],
				data_phone: {},
				warn: false,
				warntxt: '',
				btnClick: true,

				modal_warn: false,
				modal_warntxt: '',

				secondsElapsed: 60,
				isBind: false,

				tipTxt: '',

				role: '',
				base_url: window.location.protocol + '//' + window.location.hostname
			};
		},

		componentDidMount: function componentDidMount() {
			var _this = this;

			this.loadPersonalData();

			this.validatePersonal();

			this.validateAvatar();

			rest.user.read().done(function (data) {

				_this.setState({ role: data.role_group }); // 将role存储为全局变量，跳到微信绑定页面的接口需要此字段

				if (data.openid == '' || data.openid == null) {
					_this.setState({ isBind: false });
				} else {
					_this.setState({ isBind: true });
				}
			});
			if (window.location.search && this.GetQueryString('code')) {
				// 用户允许授权
				var code = this.GetQueryString('code');
				var opt = {
					code: code
				};
				this.bindWeixin(opt, 'bind_wx');
			}
		},

		componentWillUnmount: function componentWillUnmount() {
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 随机生成字符串
		getRandomString: function getRandomString(len) {
			len = len || 32;
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = $chars.length;
			var pwd = '';
			for (var i = 0; i < len; i++) {
				pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},

		// 获取url参数
		GetQueryString: function GetQueryString(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
			var context = "";
			if (r != null) context = r[2];
			reg = null;
			r = null;
			return context == null || context == "" || context == "undefined" ? "" : context;
		},

		// 跳到微信绑定页面
		handleBindWeixin: function handleBindWeixin() {
			if (!this.state.edit) {
				var state = this.getRandomString();

				var redirect_uri = this.state.base_url + '/setting/personal';

				var role = this.state.role;
				var opt = {
					role: role,
					redirect_uri: redirect_uri
				};
				rest.user.create('auth_url_wx', opt).done(function (data) {
					if (data.result) {
						window.location.href = data.auth_url;
					}
				});
			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 微信绑定
		bindWeixin: function bindWeixin(opt, param) {
			var _this2 = this;

			rest.user.create(param, opt).done(function (data) {
				var msg = data.msg;
				if (data.code) {
					$('#tipShow').modal('show');
					_this2.setState({ ipTxt: msg });
					var time = setTimeout(function () {
						$('#tipShow').modal('hide');
						_this2.setState({ tipTxt: '' });
						_this2.setState({ isBind: false, outBind: false });
						var url = _this2.state.base_url + '/setting/personal';
						window.location.href = url;
					}, 1000);
				} else {
					// 绑定成功
					_this2.setState({ isBind: true });
					rest.user.read();
				}
			}).error(function (data) {
				if (data.status == 400) {
					if (data.responseJSON.bound) {
						_this2.setState({ isBind: true });
						var url = _this2.state.base_url + '/setting/personal';
						window.location.href = url;
					}
				} else if (data.status == 502) {
					var msg = data.responseJSON.msg;
					// 弹窗提示用户错误信息
					$('#tipShow').modal('show');
					_this2.setState({ tipTxt: msg });
					var time = setTimeout(function () {
						$('#tipShow').modal('hide');
						_this2.setState({ tipTxt: '' });
						_this2.setState({ isBind: false });
						var url = _this2.state.base_url + '/setting/personal';
						window.location.href = url;
					}, 1000);
				}
			});
		},

		// 弹“解除绑定”弹窗
		popUnBindModalsm: function popUnBindModalsm() {
			if (!this.state.edit) {
				$('#unBind_modal').modal('show');
			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 取消“解除绑定”
		handleUnBindCancel: function handleUnBindCancel() {
			$('#unBind_modal').modal('hide');
		},

		// 确认“解除绑定”
		handleUnBindConfirm: function handleUnBindConfirm() {
			var _this3 = this;

			$('#unBind_modal').modal('hide');
			var opt = {
				from: 'web'
			};
			rest.user.create('unbind_wx', opt).done(function (data) {
				// 解绑成功
				$('#tipShow').modal('show');
				_this3.setState({ tipTxt: '解绑成功!' });
				var time = setTimeout(function () {
					$('#tipShow').modal('hide');
					_this3.setState({ tipTxt: '' });
					_this3.setState({ isBind: false });
					var url = _this3.state.base_url + '/setting/personal';
					window.location.href = url;
				}, 800);
			}).error(function (data) {
				var msg = data.responseJSON.msg;
				if (data.status == 400 && msg) {
					$('#tipShow').modal('show');
					_this3.setState({ tipTxt: msg });
					var time = setTimeout(function () {
						$('#tipShow').modal('hide');
						_this3.setState({ tipTxt: '' });
						_this3.setState({ isBind: true });
					}, 1000);
				}
			});
		},

		handleModalsmConfirm: function handleModalsmConfirm() {
			$('#warm_modal').modal('hide');
		},

		// 读取personal接口数据
		loadPersonalData: function loadPersonalData() {
			var _this4 = this;

			rest.personal.read().done(function (data) {
				var random_temp = _this4.getRandomString();
				var img_url = _this4.state.base_url + data.avatar + '?' + random_temp;
				_this4.setState({ data: data });
				_this4.setState({ avatar: img_url });
				$('#fr_user_pic').attr('src', img_url);
			});
		},

		// 修改头像验证
		validateAvatar: function validateAvatar() {
			var self = this;

			$("#file_form").validate({
				rules: {
					avatar: {
						required: true
					}
				},
				messages: {
					avatar: {
						required: "请选择图片文件"
					}
				},
				submitHandler: function submitHandler() {
					self.handleFormSubmit();
				},
				errorPlacement: function errorPlacement(error, element) {
					self.setState({ warn: true });
					error.appendTo($('.setting-page-warn'));
				}
			});
		},

		// 个人信息表单验证
		validatePersonal: function validatePersonal() {
			var self = this;

			return $("#personal_form").validate({
				debug: true,
				rules: {
					name: "required",
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					name: {
						required: "用户名不能为空"
					},
					email: {
						required: "邮箱地址不能为空",
						email: "请输入合法的邮箱地址"
					}
				}
				//    submitHandler: function(){
				//     self.handleSave();
				// }
				// errorPlacement: function(error, element) {
				// 	$('.setting-page-warn label').remove();
				// 	self.setState({warn:true});
				//     			error.appendTo($('.setting-page-warn'));
				//     			error.addClass('page-error');
				// }
			});
		},

		// 手机号码表单验证
		validatePhone: function validatePhone() {
			var self = this;

			var validatorPhone = $("#editPhone_form").validate({
				debug: true,
				rules: {
					phone_old: {
						required: true,
						minlength: 11,
						number: true
					},
					phone_new: {
						required: true,
						minlength: 11,
						number: true
					},
					code: {
						required: true,
						minlength: 6,
						number: true
					}
				},
				messages: {
					phone_old: {
						required: "原手机号码不能为空",
						minlength: "原手机号码不能小于11位数字",
						number: "原手机号码必须为合法数字"
					},
					phone_new: {
						required: "新手机号码不能为空",
						minlength: "新手机号码不能小于11位数字",
						number: "新手机号码必须为合法数字"
					},
					code: {
						required: "短信验证码不能为空",
						minlength: "短信验证码不能小于6位数字",
						number: "短信验证码必须为合法数字"
					}
				},
				submitHandler: function submitHandler() {
					self.handleModalConfirm();
				}
				// errorPlacement: function(error, element) {
				// 	// self.setState({modal_warn: false, modal_warntxt: ''});
				//     			error.appendTo($('.m-warn'));
				// }
			});

			return validatorPhone;
		},

		// 点击编辑
		handleEdit: function handleEdit(e) {
			this.setState({ edit: true });
			$('.reset').val(null);
			this.state.data.captcha = null;
		},

		// 取消编辑
		handleCancel: function handleCancel() {
			this.validatePersonal().resetForm();
			this.setState({ edit: false, warn: false, warntxt: '' });
			this.loadPersonalData();

			this.tickClear();
		},

		// 取消编辑保存
		handleSaveCancel: function handleSaveCancel() {
			$('#warm_modal').modal('hide');
			this.setState({ edit: false });
			this.loadPersonalData();
		},

		// 编辑保存
		handleSave: function handleSave() {
			var _this5 = this;

			var opt = this.state.data;

			if (this.validatePersonal().form()) {

				rest.personal.update(opt).done(function (data) {

					if (data.result) {
						// 信息修改成功
						_this5.setState({ edit: false, warn: false });
						$('.getcode-btn').attr("disabled", false);
						_this5.setState({ btnClick: true });

						$('#fr_user_name').html(_this5.state.data.user_name);
					}
				}).error(function (data) {
					if (data.status === 400 && data.responseJSON.msg) {
						_this5.setState({ warn: true, warntxt: data.responseJSON.msg });
					}
				});
			}
		},

		// 修改手机号
		handleEditPhone: function handleEditPhone() {
			if (!this.state.edit) {
				$('#edit_phone_modal').modal('show');
				this.setState({ warn: false, modal_warn: false, modal_warntxt: '' });
				this.validatePhone().resetForm();
			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 取消修改手机号弹窗
		handleModalDismiss: function handleModalDismiss() {
			$('#edit_phone_modal').modal('hide');
			this.validatePhone().resetForm();
		},

		// 确认提交手机号码修改
		handleModalConfirm: function handleModalConfirm() {
			var _this6 = this;

			var opt = this.state.data_phone;

			if (this.validatePhone().form()) {

				if (this.state.data_phone.telephone_new == this.state.data_phone.telephone_old) {

					this.setState({ modal_warn: true, modal_warntxt: '新号码和原号码相同' });
				} else {
					this.setState({ modal_warn: false, modal_warntxt: '' });
					rest.bind_telephone.update(opt).done(function (data) {

						if (data.result) {
							// 信息修改成功

							$('#edit_phone_modal').modal('hide');

							_this6.tickClear();
						}
					}).error(function (data) {
						if (data.status === 400 && data.responseJSON.msg) {
							_this6.setState({ modal_warn: true, modal_warntxt: data.responseJSON.msg });
						}
					});
				}
			}
		},

		// 重置按钮可点击
		tickClear: function tickClear() {
			this.setState({ btnClick: true, secondsElapsed: 60 }); // 按钮2分钟后可点击
			$('.getcode-btn').attr("disabled", false);
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 短信倒计时
		tick: function tick() {
			this.setState({
				secondsElapsed: this.state.secondsElapsed - 1
			});
		},

		// 获取短信验证码
		getCode: function getCode(e) {
			var _this7 = this;

			e.stopPropagation();
			e.preventDefault();

			this.tickClear();

			// 验证手机号码是否通过
			var isPass = $("#editPhone_form").validate().element($("#phone_new"));
			var phone = this.state.data_phone.telephone_new;

			if (isPass) {

				var opt = { telephone: phone };

				rest.setting.create('authcode', opt).done(function (data) {

					if (data.result) {

						_this7.interval = setInterval(_this7.tick, 1000); // 短信倒计时
						_this7.setState({ btnClick: false }); // 按钮不可点
						$('.getcode-btn').attr("disabled", true); // 按钮置灰

						_this7.btn_time = setTimeout(function () {
							_this7.tickClear();
						}, 60000);
					}
				}).error(function (data) {
					if (data.status === 400 && data.responseJSON.msg) {
						_this7.setState({ modal_warn: true, modal_warntxt: data.responseJSON.msg });
					}
				});
			}
		},

		onChangeName: function onChangeName(e) {
			var name = e.target.value;
			this.state.data.user_name = name;
		},
		onChangeEmail: function onChangeEmail(e) {
			var email = e.target.value;
			this.state.data.email = email;
		},
		onChangeOldPhone: function onChangeOldPhone(e) {
			var old_phone = e.target.value;
			this.state.data_phone.telephone_old = old_phone;
		},
		onChangeNewPhone: function onChangeNewPhone(e) {
			var new_phone = e.target.value;
			this.state.data_phone.telephone_new = new_phone;
		},
		onChangeCode: function onChangeCode(e) {
			var code = e.target.value;
			this.state.data_phone.captcha = code;
		},

		// 修改头像
		onFileChange: function onFileChange(e) {
			this.handleFormSubmit(e);
		},
		handleEditFile: function handleEditFile() {
			$('#avatar').trigger('click');
		},
		handleFormSubmit: function handleFormSubmit(e) {
			e.preventDefault();
			e.stopPropagation();

			var self = this;

			$("#file_form").ajaxSubmit({
				url: self.state.base_url + '/rocket/api/v1/avatar',
				dataType: 'json',
				beforeSend: function beforeSend(xhr) {
					xhr.setRequestHeader('user_token', $.cookie('user_token'));
				},
				success: function success() {
					self.loadPersonalData();
				},
				error: function error() {
					self.setState({ warn: true, warntxt: '上传头像失败' });
				}
			});
		},

		render: function render() {
			var _this8 = this;

			return React.createElement(
				'div',
				{ className: 'container' },
				React.createElement(
					'div',
					{ className: 'setting' },
					React.createElement(
						'div',
						{ className: 'panel panel-default setting-personal' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'个人信息'
							),
							React.createElement(
								'div',
								{ className: this.state.edit ? "none" : "btn btn-primary pull-right", id: 'edit', type: 'button', onClick: function onClick(e) {
										return _this8.handleEdit(e);
									} },
								'编辑'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body tc' },
							React.createElement(
								'div',
								{ className: 'row h' },
								React.createElement(
									'div',
									{ className: 'col-xs-6 col-xs-offset-3' },
									React.createElement(
										'div',
										{ className: 'row' },
										React.createElement(
											'div',
											{ className: 'col-xs-3 leftbox' },
											React.createElement('img', { src: this.state.avatar, className: 'pic', id: 'image' }),
											this.state.edit && React.createElement(
												'button',
												{ className: 'edit-file-btn', id: 'edit_file_btn', onClick: this.handleEditFile },
												'修改头像'
											),
											React.createElement(
												'form',
												{ method: 'post', id: 'file_form', enctype: 'multipart/form-data', className: 'none' },
												React.createElement('input', { type: 'file', id: 'avatar', name: 'avatar', onChange: this.onFileChange }),
												React.createElement('input', { type: 'submit', value: 'submit', id: 'uploadfile_btn', onClick: this.handleFormSubmit })
											),
											React.createElement(
												'div',
												{ className: this.state.warn ? "setting-page-warn" : "setting-page-warn none" },
												React.createElement(
													'label',
													{ className: 'page-error' },
													this.state.warntxt
												)
											)
										),
										React.createElement(
											'div',
											{ className: 'col-xs-9 rightbox h' },
											React.createElement(
												'form',
												{ id: 'personal_form', className: 'form-horizontal' },
												React.createElement(
													'div',
													{ className: 'form-group' },
													React.createElement(
														'label',
														{ 'for': 'role', className: 'col-xs-3 control-label' },
														'用户类型'
													),
													React.createElement(
														'label',
														{ 'for': 'role', className: this.state.edit ? "col-xs-9 control-label prl10" : "col-xs-9 control-label" },
														this.state.data.user_type
													)
												),
												React.createElement(
													'div',
													{ className: this.state.edit ? "form-group" : "form-group mb10" },
													React.createElement(
														'label',
														{ 'for': 'name', className: 'col-xs-3 control-label' },
														'昵称'
													),
													React.createElement(
														'div',
														{ className: 'col-xs-9' },
														this.state.edit ? React.createElement('input', { className: 'form-control', id: 'name', name: 'name', placeholder: '请输入用户名',
															defaultValue: this.state.data.user_name, onChange: function onChange(e) {
																return _this8.onChangeName(e);
															} }) : React.createElement(
															'label',
															{ 'for': 'role', className: 'control-label', id: 'name' },
															this.state.data.user_name
														)
													)
												),
												React.createElement(
													'div',
													{ className: this.state.edit ? "form-group" : "form-group mb10" },
													React.createElement(
														'label',
														{ 'for': 'email', className: 'col-xs-3 control-label' },
														'邮箱'
													),
													React.createElement(
														'div',
														{ className: 'col-xs-9' },
														this.state.edit ? React.createElement('input', { className: 'form-control', id: 'email', name: 'email', placeholder: '请输入邮箱',
															defaultValue: this.state.data.email, onChange: function onChange(e) {
																return _this8.onChangeEmail(e);
															} }) : React.createElement(
															'label',
															{ 'for': 'role', className: 'control-label', id: 'email' },
															this.state.data.email
														)
													)
												)
											)
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: this.state.edit ? "panel-footer" : "none" },
							React.createElement(
								'div',
								{ className: 'btnbox' },
								React.createElement(
									'div',
									{ className: this.state.edit ? "pull-right" : "none" },
									React.createElement(
										'div',
										{ className: 'btn btn-default btn-lg', type: 'button', id: 'cancel', onClick: this.handleCancel },
										'取消'
									),
									React.createElement(
										'div',
										{ className: 'btn btn-primary save-btn btn-lg', id: 'save', type: 'submit', onClick: this.handleSave },
										'确认'
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'panel panel-default bind-count' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'账号绑定'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body tc' },
							React.createElement(
								'ul',
								null,
								React.createElement(
									'li',
									null,
									React.createElement('span', { className: 'iconfont icon-weixin' }),
									this.state.isBind && React.createElement('span', { className: 'icontxt1 binded-img' }),
									React.createElement(
										'span',
										{ className: 'icontxt black' },
										'微信账号登陆'
									),
									this.state.isBind ? React.createElement(
										'span',
										{ className: 'icontxt icontxt2' },
										React.createElement(
											'a',
											{ onClick: this.popUnBindModalsm },
											'解绑 '
										)
									) : React.createElement(
										'span',
										{ className: 'icontxt icontxt2 bindbtn', onClick: this.handleBindWeixin },
										React.createElement(
											'a',
											null,
											'绑定'
										)
									)
								),
								React.createElement(
									'li',
									null,
									React.createElement('span', { className: 'iconfont icon-qq' }),
									React.createElement(
										'span',
										{ className: 'icontxt grey' },
										'QQ账号登陆'
									),
									React.createElement(
										'span',
										{ className: 'icontxt icontxt2 unselect' },
										React.createElement(
											'span',
											null,
											'绑定'
										)
									)
								),
								React.createElement(
									'li',
									null,
									React.createElement('span', { className: 'iconfont icon-xinlang' }),
									React.createElement(
										'span',
										{ className: 'icontxt grey' },
										'微博账号登陆'
									),
									React.createElement(
										'span',
										{ className: 'icontxt icontxt2 unselect' },
										React.createElement(
											'span',
											null,
											'绑定'
										)
									)
								),
								React.createElement(
									'li',
									null,
									React.createElement('span', { className: 'iconfont icon-shouji' }),
									React.createElement(
										'span',
										{ className: 'icontxt black' },
										'手机账号登陆'
									),
									React.createElement(
										'span',
										{ className: 'icontxt icontxt2', onClick: this.handleEditPhone },
										React.createElement(
											'a',
											null,
											'修改'
										)
									)
								)
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', id: 'tipShow', modalSm: true, noBtn: true },
						React.createElement(
							'div',
							{ className: 'm-msg' },
							React.createElement(
								'p',
								null,
								this.state.tipTxt
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '修改手机号', id: 'edit_phone_modal', dismiss: this.handleModalDismiss, confirm: this.handleModalConfirm },
						React.createElement(
							'form',
							{ id: 'editPhone_form', className: 'form-horizontal' },
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'phone', className: 'col-xs-2 control-label' },
									'原手机号'
								),
								React.createElement(
									'div',
									{ className: 'col-xs-10' },
									React.createElement('input', { className: 'form-control reset', id: 'phone_old', name: 'phone_old', placeholder: '请输入原手机号码', onChange: function onChange(e) {
											return _this8.onChangeOldPhone(e);
										} })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'phone', className: 'col-xs-2 control-label' },
									'新手机号'
								),
								React.createElement(
									'div',
									{ className: 'col-xs-10' },
									React.createElement('input', { className: 'form-control reset', id: 'phone_new', name: 'phone_new', placeholder: '请输入新手机号码', onChange: function onChange(e) {
											return _this8.onChangeNewPhone(e);
										} })
								)
							),
							React.createElement(
								'div',
								{ className: 'form-group' },
								React.createElement(
									'label',
									{ 'for': 'phone', className: 'col-xs-2 control-label' },
									'短信验证码'
								),
								React.createElement(
									'div',
									{ className: 'col-xs-6' },
									React.createElement('input', { className: 'form-control reset', name: 'code', onChange: function onChange(e) {
											return _this8.onChangeCode(e);
										} })
								),
								React.createElement(
									'div',
									{ className: 'col-xs-4' },
									React.createElement(
										'button',
										{ id: 'getCode', className: this.state.btnClick ? "getcode-btn btn btn-primary btn-lg" : "getcode-btn disabled btn btn-primary btn-lg",
											onClick: function onClick(e) {
												return _this8.getCode(e);
											}, type: 'button' },
										this.state.btnClick ? "获取短信验证码" : '重新发送 (' + this.state.secondsElapsed + ')'
									)
								)
							),
							React.createElement(
								'div',
								{ className: this.state.modal_warn ? "m-warn" : "m-warn none" },
								this.state.modal_warntxt,
								React.createElement(
									'span',
									{ className: this.state.warntxt2 ? "" : "none" },
									'(',
									this.state.warntxt2,
									')'
								)
							),
							React.createElement(
								'div',
								{ className: 'm-tip' },
								React.createElement(
									'label',
									null,
									'温馨提示：修改手机号后需要重新登陆'
								)
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', id: 'warm_modal', modalSm: true, cancelEvent: true, dismiss: this.handleSaveCancel, confirm: this.handleModalsmConfirm },
						React.createElement(
							'div',
							{ className: 'm-tip' },
							React.createElement(
								'p',
								null,
								'当日修改未保存，是否返回？'
							)
						)
					),
					React.createElement(
						Modal,
						{ title: '温馨提示', id: 'unBind_modal', modalSm: true, dismiss: this.handleUnBindCancel, confirm: this.handleUnBindConfirm },
						React.createElement(
							'div',
							{ className: 'm-tip' },
							React.createElement(
								'p',
								null,
								'是否确定进行解绑工作？'
							)
						)
					)
				)
			);
		}
	});

	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(
			Frame,
			null,
			React.createElement(Personal, null)
		)
	), document.getElementById("personal"));
});