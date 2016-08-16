"use strict";

require.config({
	baseUrl: 'js',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test"
	}
});

require(["mods", paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var AdminLogin = React.createClass({
		displayName: "AdminLogin",

		getInitialState: function getInitialState() {
			return {

				tip: null,
				isTip: false,

				timer: 120,
				isTimerClick: true,

				data: {},
				verifyImgUrl: '',

				secondsElapsed: 120
			};
		},
		componentDidMount: function componentDidMount() {
			this.getVerifyCodePic();

			this.state.data.role = 'role_admin';
		},

		componentWillUnmount: function componentWillUnmount() {
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		componentDidUpdate: function componentDidUpdate() {
			this.validate();
		},
		validate: function validate() {
			var self = this;

			$("#login_form").validate({
				debug: true,
				rules: {
					phone: {
						required: true,
						minlength: 11,
						number: true
					},
					mess_seccode: {
						required: true,
						maxlength: 6,
						number: true
					},
					seccode: {
						required: true,
						maxlength: 6
					}
				},
				messages: {
					phone: {
						required: "手机号码不能为空",
						minlength: "手机号码不能小于11位数字",
						number: "手机号码必须为合法数字"
					},
					mess_seccode: {
						required: "短信验证码不能为空",
						minlength: "短信验证码不能小于6位数字",
						number: "短信验证码必须为合法数字"
					},
					seccode: {
						required: "图片验证码不能为空",
						minlength: "图片验证码不能小于6位数字"
					}
				},
				submitHandler: function submitHandler() {
					self.handleSubmit();
				},
				errorPlacement: function errorPlacement(error, element) {
					self.setState({ isTip: true });
					error.appendTo($('.lfr-body-tipbox'));
				}
			});
		},
		// 获取验证码图片
		getVerifyCodePic: function getVerifyCodePic() {
			var self = this;
			var v_id = this.getRandomString();
			this.state.data.v_id = v_id;

			$.get(paths.rcn.api + '/api/v1/user/verify', { v_id: v_id }, function (data) {
				self.setState({ verifyImgUrl: this.url });
			});
		},

		// 重置按钮可点击
		tickClear: function tickClear() {
			this.setState({ isTimerClick: true, secondsElapsed: 120 }); // 按钮2分钟后可点击
			$('.seccodeBtn').attr("disabled", false);
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 短信倒计时
		tick: function tick() {
			this.setState({
				secondsElapsed: this.state.secondsElapsed - 1
			});
		},

		// 生成登陆验证码(获取短信验证码)
		getCaptchaCode: function getCaptchaCode(e) {
			var _this = this;

			// 验证手机号码是否通过
			var isPass = $("#login_form").validate().element($("#phone"));
			var phone = this.state.data.telephone;

			this.tickClear();

			if (isPass) {

				var opt = {
					telephone: phone,
					role: this.state.data.role
				};
				rest.user.create('authcode', opt).done(function (data) {
					if (data.result) {
						_this.interval = setInterval(_this.tick, 1000); // 短信倒计时
						_this.setState({ isTimerClick: false });
						$('.seccodeBtn').attr("disabled", true);

						$('#server_error').hide();
						_this.setState({ isTip: false });

						_this.btn_time = setTimeout(function () {
							_this.tickClear();
						}, 120000);
					}
				}).error(function (data) {
					if (data.status === 400 && data.responseJSON.msg) {
						_this.setState({ tip: data.responseJSON.msg, isTip: true });
						$('#server_error').show();
					} else {
						_this.setState({ tip: "服务器出错，请联系管理员", isTip: true });
					}
				});
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

		changeTelephone: function changeTelephone(e) {
			var val = e.target.value;
			this.state.data.telephone = val;
		},
		changeCaptcha: function changeCaptcha(e) {
			var val = e.target.value;
			this.state.data.captcha = val;
		},
		changeVerifyCode: function changeVerifyCode(e) {
			var val = e.target.value;
			this.state.data.verify_code = val;
		},

		handleSubmit: function handleSubmit() {
			var _this2 = this;

			var opt = this.state.data;
			rest.user.create('login', opt).done(function (data) {
				if (data.result && data.token) {

					if ($.cookie('user_token', data.token, { domain: paths.admin.domain, expires: new Date(Date.now() + 12 * 3600 * 1000) })) {
						// rest.user.read().done((data) => {

						_this2.tickClear();

						// if(data.company){
						// 	var url = paths.ex.api +'/analy#/profile';
						// 	window.location.href = url;
						// }else{
						var url = paths.admin.api + '/manager#/super';
						window.location.href = url;
						// }
						// })
					}
				}
			}).error(function (data) {

				_this2.tickClear();

				if (data.status === 400 && data.responseJSON.msg) {
					if (data.responseJSON.msg == '用户已登录') {
						if ($.cookie('user_token')) {
							var url = paths.admin.api + '/manager#/company';
							window.location.href = url;
						} else {
							_this2.setState({ isTip: true, tip: data.responseJSON.msg }); // 这里的tip偶尔并没有更新，通过html方法完善这个bug
							$('#server_error').html(data.responseJSON.msg);
							$('#server_error').show();
						}
					} else {
						_this2.setState({ isTip: true, tip: data.responseJSON.msg }); // 这里的tip偶尔并没有更新，通过html方法完善这个bug
						$('#server_error').html(data.responseJSON.msg);
						$('#server_error').show();
					}
				} else {
					_this2.setState({ tip: "服务器出错,请联系管理员", isTip: true });
				}
			});
		},
		render: function render() {
			var _this3 = this;

			return React.createElement(
				"div",
				{ className: "loginpage lframe-bg" },
				React.createElement(
					"div",
					{ className: "lframe-body" },
					React.createElement(
						"form",
						{ id: "login_form", autocomplete: "off" },
						React.createElement(
							"div",
							{ className: "lfr-body-loginbox" },
							React.createElement(
								"div",
								{ className: "lfr-header-logo" },
								React.createElement("img", { src: "http://home.puzhizhuhai.com/img/logo.png", width: "32", height: "41" }),
								React.createElement(
									"span",
									{ className: "text" },
									"普智数据中心"
								),
								React.createElement(
									"div",
									{ className: "iconfontbox" },
									React.createElement("span", { className: "roleicon iconfont icon-zhanghu" }),
									React.createElement(
										"span",
										{ className: "icontxt" },
										"超级管理员"
									)
								)
							),
							React.createElement("span", { className: "inputicon iconfont icon-iconfontshouji" }),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9 mt66" },
								React.createElement("input", { type: "text", className: "phone", placeholder: "手机号码", onChange: function onChange(e) {
										_this3.changeTelephone(e);
									},
									id: "phone", name: "phone", autocomplete: "off" })
							),
							React.createElement("span", { className: "inputicon iconfont icon-shield" }),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9" },
								React.createElement("input", { type: "text", className: "mess-seccode", placeholder: "短信验证码", onChange: function onChange(e) {
										_this3.changeCaptcha(e);
									},
									id: "mess_seccode", name: "mess_seccode", autocomplete: "off" }),
								React.createElement(
									"button",
									{ className: this.state.isTimerClick ? "loginbtn2 seccodeBtn" : "loginbtn2 seccodeBtn disable", type: "button",
										onClick: function onClick(e) {
											return _this3.getCaptchaCode(e);
										} },
									this.state.isTimerClick ? "获取短信验证码" : '重新发送 (' + this.state.secondsElapsed + ')'
								)
							),
							React.createElement(
								"div",
								{ className: "lb-row2 mb9" },
								React.createElement("input", { type: "text", className: "seccode", onChange: function onChange(e) {
										_this3.changeVerifyCode(e);
									},
									id: "seccode", name: "seccode", autocomplete: "off" }),
								React.createElement("img", { src: this.state.verifyImgUrl, width: "32", height: "41", className: "seccode-img", title: "点击刷新验证码",
									onClick: this.getVerifyCodePic })
							),
							React.createElement(
								"div",
								{ className: "tc mt20" },
								React.createElement(
									"button",
									{ type: "submit", className: "c-button", id: "login_submit_btn" },
									"确定"
								)
							)
						),
						React.createElement(
							"div",
							{ className: this.state.isTip ? "lfr-body-tipbox" : "lfr-body-tipbox none" },
							React.createElement(
								"label",
								{ className: "error", id: "server_error", style: { "display": "block" } },
								this.state.tip
							)
						)
					)
				),
				React.createElement(
					"div",
					{ className: "aboutbox" },
					React.createElement(
						"div",
						{ className: "txt1" },
						React.createElement(
							"a",
							{ href: paths.rcn.api + '/about', className: "ltxt" },
							"版权声明"
						),
						React.createElement(
							"a",
							{ href: paths.rcn.api + '/thanks', className: "rtxt" },
							"感谢致辞"
						)
					),
					React.createElement(
						"div",
						{ className: "txt2" },
						"© 2016 深圳市普智正元科技传媒有限公司  粤ICP备15106517号-1 "
					)
				)
			);
		}
	});

	ReactDOM.render(React.createElement(AdminLogin, null), document.getElementById("admin_loginpage"));
});