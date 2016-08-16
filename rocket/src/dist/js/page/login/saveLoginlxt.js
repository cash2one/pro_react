"use strict";

require.config({
	baseUrl: 'js',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.rcn.comps + "/frame/index",
		"Reducer_Frame": paths.rcn.comps + '/frame/reducers'
	}
});

require(["mods", paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Login = React.createClass({
		displayName: "Login",

		contextTypes: {
			router: PropTypes.object.isRequired
		},
		getInitialState: function getInitialState() {
			return {
				tip: '默认',
				isTip: false,
				timer: 120,
				isTimerClick: true,
				role: 'role_manager',
				telephone: '',
				isFormOK: false,
				captcha: null,
				v_id: null,
				verify_code: null,
				verify_img: ''
			};
		},
		componentDidMount: function componentDidMount() {
			this.getVerifyCodePic();
		},
		componentDidUpdate: function componentDidUpdate() {
			this.validate();
		},
		validate: function validate() {
			var self = this;

			// jQuery.validator.addMethod("phone", function(value, element) {  
			//     var tel = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
			//     return this.optional(element) || (tel.test(value));
			// });

			$("#login_form").validate({
				rules: {
					phone: {
						required: true,
						minlength: 11,
						number: true
					},
					mess_seccode: "required",
					seccode: {
						required: true,
						minlength: 4
					}
				},
				success: function success() {
					self.setState({ isFormOK: true });
				},
				errorPlacement: function errorPlacement() {
					self.setState({ isFormOK: false });
				}
			});
		},
		// 获取验证码图片
		getVerifyCodePic: function getVerifyCodePic() {
			var self = this;

			var v_id = this.getRandomString();
			this.setState({ v_id: v_id });

			$.get(paths.rcn.api + '/api/v1/user/verify', { v_id: v_id }, function (data) {
				self.setState({ verify_img: this.url });
			});

			// Todo... 不知道为什么用rest插件的get接口取不到回调数据
			// rest.user.read('verify', {v_id}).done(data => {
			// 	console.log(1)
			// 	self.setState({verify_img:this.url});
			// });
		},
		// 生成登陆验证码(获取短信验证码)
		getCaptchaCode: function getCaptchaCode(e) {
			var _this = this;

			var telephone = this.state.telephone;

			if (this.state.isFormOK === true) {
				// 已填完正确格式的手机号码
				if (telephone === '') {
					this.setState({ tip: '手机号码不能为空', isTip: true });
					var time = window.setTimeout(function () {
						_this.setState({ isTip: false });
					}, 5000);
				} else {
					var opt = {
						telephone: telephone
					};
					rest.user.create('authcode', opt).done(function (data) {
						if (data.result) {
							_this.setState({ tip: '短信正在发送到您的手机,有效时间为2分钟', isTip: true, isTimerClick: false });
							$('.seccodeBtn').attr("disabled", true);
							var _time = window.setTimeout(function () {
								_this.setState({ isTip: false });
							}, 5000);
							var btn_time = window.setTimeout(function () {
								_this.setState({ isTimerClick: true }); // 按钮2分钟后可点击
								$('.seccodeBtn').attr("disabled", false);
							}, 120000);
						}
					}).error(function (data) {
						var msg = data.responseJSON.msg;
						_this.setState({ tip: msg, isTip: true });
					});
				}
			} else {
				this.setState({ tip: '您需要先填写正确格式的手机号码', isTip: true });
				var time = window.setTimeout(function () {
					_this.setState({ isTip: false });
				}, 5000);
			}
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
		changeRole: function changeRole(e) {
			var val = e.target.getAttribute('role');
			this.setState({ role: val });
			$('.loginbtn1').removeClass('focus');
			e.target.classList.toggle('focus');
		},
		changeTelephone: function changeTelephone(e) {
			var val = e.target.value;
			this.setState({ telephone: val });
		},
		changeCaptcha: function changeCaptcha(e) {
			var val = e.target.value;
			this.setState({ captcha: val });
		},
		changeVerifyCode: function changeVerifyCode(e) {
			var val = e.target.value;
			this.setState({ verify_code: val });
		},
		handleSubmit: function handleSubmit() {
			var _this2 = this;

			if (this.state.isFormOK === true) {

				var opt = {
					telephone: this.state.telephone,
					captcha: this.state.captcha,
					role: this.state.role,
					v_id: this.state.v_id,
					verify_code: this.state.verify_code
				};
				rest.user.create('login', opt).done(function (data) {
					if (data.result) {
						if (data.token) {
							// 成功登陆后跳转页面
							if ($.cookie('user_token', data.token, { domain: paths.rcn.domain })) {
								var path;
								if (_this2.state.role === 'role_manager') {
									path = 'viewer';
								} else {
									path = 'manager';
								}
								rest.user.read().done(function (data) {
									if (data.company) {
										// 有company则正常跳回页面
										var path_ = path || '/';
										_this2.context.router.push({
											pathname: path_
										});
									} else {
										// 无选择company则跳到公司管理页
										var url = paths.rcn.api + '/companyMgr#' + path;
										window.location.href = url;
									}
								});
							}
						}
					}
				}).error(function (data) {
					var msg = data.responseJSON.msg;
					_this2.setState({ tip: msg, isTip: true });
					var _time = window.setTimeout(function () {
						_this2.setState({ tip: '', isTip: false });
					}, 5000);
				});
			} else {

				this.setState({ tip: '请检查所有字段是否填写完整与正确', isTip: true });
				var time = window.setTimeout(function () {
					_this2.setState({ isTip: false });
				}, 5000);
			}
		},
		render: function render() {
			var _this3 = this;

			return React.createElement(
				"div",
				{ className: "loginpage" },
				React.createElement(
					"div",
					{ className: "lframe-body" },
					React.createElement(
						"form",
						{ id: "login_form", method: "get", action: "" },
						React.createElement(
							"div",
							{ className: "lfr-body-loginbox" },
							React.createElement(
								"div",
								{ className: "lfr-header-logo" },
								React.createElement("img", { src: "img/logo.png", width: "32", height: "41" }),
								React.createElement(
									"span",
									{ className: "text" },
									"普智数据中心"
								)
							),
							React.createElement(
								"div",
								{ className: "lb-row1 mb9" },
								React.createElement(
									"span",
									{ className: "loginbtn1 mr5 focus", onClick: function onClick(e) {
											_this3.changeRole(e);
										}, role: "role_manager" },
									"运营员"
								),
								React.createElement(
									"span",
									{ className: "loginbtn1", onClick: function onClick(e) {
											_this3.changeRole(e);
										}, role: "role_super_manager" },
									"超级运营员"
								)
							),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9" },
								React.createElement("input", { type: "text", className: "phone", placeholder: "手机号码", onChange: function onChange(e) {
										_this3.changeTelephone(e);
									},
									id: "phone", name: "phone", required: true, minlength: "11" })
							),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9" },
								React.createElement("input", { type: "text", className: "mess-seccode", placeholder: "短信验证码", onChange: function onChange(e) {
										_this3.changeCaptcha(e);
									},
									id: "mess-seccode", name: "mess_seccode", required: true }),
								React.createElement(
									"span",
									{ className: this.state.isTimerClick ? "loginbtn2 seccodeBtn" : "loginbtn2 seccodeBtn disable", onClick: function onClick(e) {
											return _this3.getCaptchaCode(e);
										} },
									"获取短信验证码"
								)
							),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9" },
								React.createElement("input", { type: "text", className: "seccode", onChange: function onChange(e) {
										_this3.changeVerifyCode(e);
									},
									id: "seccode", name: "seccode", required: true, minlength: "4" }),
								React.createElement("img", { src: this.state.verify_img, width: "32", height: "41", className: "seccode-img" })
							),
							React.createElement(
								"div",
								{ className: "tc mt20" },
								React.createElement(
									"span",
									{ className: "c-button", onClick: this.handleSubmit },
									"确定"
								)
							)
						),
						React.createElement(
							"div",
							{ className: this.state.isTip ? "lfr-body-tipbox" : "lfr-body-tipbox none" },
							React.createElement(
								"div",
								{ className: "login-tip" },
								this.state.tip
							)
						)
					)
				)
			);
		}
	});

	ReactDOM.render(React.createElement(Login, null), document.getElementById("loginpage"));
});