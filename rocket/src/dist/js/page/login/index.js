'use strict';

/**
 * 登录
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

require(["mods", paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Login = React.createClass({
		displayName: 'Login',

		getInitialState: function getInitialState() {
			return {

				tip: null,
				isTip: false,

				timer: 120,
				isTimerClick: true,

				data: {},
				verifyImgUrl: '',

				secondsElapsed: 120,

				isEnterLoginPage: false
			};
		},

		componentWillMount: function componentWillMount() {
			this.state.data.role = 'role';

			// 角色获取
			var pathName = window.location.pathname.substring(1);
			var roleName;
			if (pathName === 'super') {
				this.state.data.role = 'role_super_manager';
				roleName = 'role_super_manager';
			} else {
				this.state.data.role = 'role_manager';
				roleName = 'role_manager';
			}

			if ($.cookie('user_token')) {
				// cookie存在token进入公司管理页

				var url = paths.rcn.web + '/manager#/company';
				window.location.href = url;
			} else if (window.location.search) {
				// 地址栏存在参数 -> 进入微信登陆页判断

				if (this.GetQueryString("code")) {
					// 用户允许授权

					var code = this.GetQueryString("code");
					var state = this.GetQueryString("state");

					var opt = {
						// role: roleName,
						from: 'web',
						code: code,
						state: state
					};
					this.handleSubmit(opt, 'login_wx');
				} else {
					// 用户禁止授权 , 用户调回登陆页

					var url = paths.rcn.web;
					window.location.href = url;
					this.setState({ isEnterLoginPage: true });
				}
			} else {

				this.setState({ isEnterLoginPage: true });
			}
		},

		componentDidMount: function componentDidMount() {
			this.getVerifyCodePic();
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

		// 微信登陆
		loginWeixin: function loginWeixin(role) {

			var redirect_uri = window.location.protocol + "//" + window.location.hostname;
			var state = this.getRandomString();
			var role = this.state.data.role;
			if (role !== 'role_manager') {
				redirect_uri += '/super';
			}

			var opt = {
				// state: state,
				role: role,
				redirect_uri: redirect_uri
			};
			rest.user.create('auth_url_wx', opt).done(function (data) {
				if (data.result) {
					window.location.href = data.auth_url;
				}
			});
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
					self.handleSubmit(self.state.data, 'login');
				},
				errorPlacement: function errorPlacement(error, element) {
					// $('.login-tip').find('label').remove();
					// $('.login-tip').html('');
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

		handleSubmit: function handleSubmit(opt, param) {
			var _this2 = this;

			rest.user.create(param, opt).done(function (data) {
				if (data.result && data.token) {
					if ($.cookie('user_token', data.token, { domain: paths.rcn.domain, expires: new Date(Date.now() + 12 * 3600 * 1000) })) {
						$.cookie('md5', $.randomCode(), { domain: paths.rcn.domain });
						var url = paths.rcn.web + '/manager#/company';
						window.location.href = url;
					}
				}
			}).error(function (data) {
				if (data.status == 400 && data.responseJSON.msg) {
					_this2.setState({ isEnterLoginPage: true });
					_this2.setState({ isTip: true, tip: data.responseJSON.msg }); // 这里的tip偶尔并没有更新，通过html方法完善这个bug
					$('#server_error').html(data.responseJSON.msg);
					$('#server_error').show();
					_this2.tickClear();
					_this2.btn_time = setTimeout(function () {
						_this2.getCaptchaCode();
						_this2.getVerifyCodePic();
					}, 1000);
				} else if (data.status == 417) {
					// 短信验证码和图形验证码已失效
					_this2.tickClear();
					_this2.btn_time = setTimeout(function () {
						_this2.getCaptchaCode();
						_this2.getVerifyCodePic();
					}, 1000);
				} else if (data.status == 404) {
					// 手机号不存在或该用户角色不存在
					_this2.setState({ isTip: true, tip: data.responseJSON.msg });
					$('#server_error').html(data.responseJSON.msg);
					$('#server_error').show();
				} else {
					_this2.setState({ tip: "服务器出错,请联系管理员", isTip: true });
				}
			});
		},

		render: function render() {
			var _this3 = this;

			var pageShow = function pageShow() {
				if (_this3.state.data.role === 'role') {
					return false;
				} else if (_this3.state.data.role === 'role_manager') {
					return React.createElement(
						'div',
						{ className: 'iconfontbox ic-loginbox' },
						React.createElement('span', { className: 'roleicon iconfont icon-zhanghu' }),
						React.createElement(
							'span',
							{ className: 'icontxt' },
							'运营员'
						)
					);
				} else if (_this3.state.data.role === 'role_super_manager') {
					return React.createElement(
						'div',
						{ className: 'iconfontbox' },
						React.createElement('span', { className: 'roleicon iconfont icon-xingxing' }),
						React.createElement(
							'span',
							{ className: 'icontxt' },
							'超级运营员'
						)
					);
				}
			};
			var isEnterLoginPage = function isEnterLoginPage() {
				if (_this3.state.isEnterLoginPage) {
					return React.createElement(
						'div',
						{ className: 'loginpage lframe-bg' },
						React.createElement(
							'div',
							{ className: 'lframe-body' },
							React.createElement(
								'form',
								{ id: 'login_form', autocomplete: 'off' },
								React.createElement(
									'div',
									{ className: 'lfr-body-loginbox' },
									React.createElement(
										'div',
										{ className: 'lfr-header-logo' },
										React.createElement('img', { src: 'img/logo.png', width: '32', height: '41' }),
										React.createElement(
											'span',
											{ className: 'text' },
											'深圳普智正元'
										),
										pageShow()
									),
									React.createElement('span', { className: 'inputicon iconfont icon-iconfontshouji' }),
									React.createElement(
										'div',
										{ className: 'lb-row2 mb9 mt66' },
										React.createElement('input', { type: 'text', className: 'phone', placeholder: '手机号码', onChange: function onChange(e) {
												_this3.changeTelephone(e);
											},
											id: 'phone', name: 'phone', autocomplete: 'off' })
									),
									React.createElement('span', { className: 'inputicon iconfont icon-shield' }),
									React.createElement(
										'div',
										{ className: 'lb-row2 mb9' },
										React.createElement('input', { type: 'text', className: 'mess-seccode', placeholder: '短信验证码', onChange: function onChange(e) {
												_this3.changeCaptcha(e);
											},
											id: 'mess_seccode', name: 'mess_seccode', autocomplete: 'off' }),
										React.createElement(
											'button',
											{ className: _this3.state.isTimerClick ? "loginbtn2 seccodeBtn" : "loginbtn2 seccodeBtn disable", type: 'button',
												onClick: function onClick(e) {
													return _this3.getCaptchaCode(e);
												} },
											_this3.state.isTimerClick ? "获取短信验证码" : '重新发送 (' + _this3.state.secondsElapsed + ')'
										)
									),
									React.createElement(
										'div',
										{ className: 'lb-row2 mb9' },
										React.createElement('input', { type: 'text', className: 'seccode', onChange: function onChange(e) {
												_this3.changeVerifyCode(e);
											},
											id: 'seccode', name: 'seccode', autocomplete: 'off' }),
										React.createElement('img', { src: _this3.state.verifyImgUrl, width: '32', height: '41', className: 'seccode-img', title: '点击刷新验证码',
											onClick: _this3.getVerifyCodePic })
									),
									React.createElement(
										'div',
										{ className: 'mt20' },
										React.createElement(
											'button',
											{ type: 'submit', className: 'c-button', id: 'login_submit_btn' },
											'确定'
										),
										React.createElement(
											'div',
											{ className: 'weixin-loginbox', id: 'showWeixin', onClick: function onClick(e) {
													return _this3.loginWeixin(_this3.state.data.role);
												} },
											React.createElement('span', { className: 'iconfont icon-weixin1' }),
											React.createElement(
												'span',
												null,
												'微信登陆'
											)
										)
									)
								),
								React.createElement(
									'div',
									{ className: _this3.state.isTip ? "lfr-body-tipbox" : "lfr-body-tipbox none" },
									React.createElement(
										'label',
										{ className: 'error', id: 'server_error', style: { "display": "block" } },
										_this3.state.tip
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'aboutbox' },
							React.createElement(
								'div',
								{ className: 'txt1' },
								React.createElement(
									'a',
									{ href: paths.rcn.web + '/about', className: 'ltxt' },
									'版本声明'
								),
								React.createElement(
									'a',
									{ href: paths.rcn.web + '/thanks', className: 'rtxt' },
									'特别鸣谢'
								)
							),
							React.createElement(
								'div',
								{ className: 'txt2' },
								'© 2016 深圳市普智正元科技传媒有限公司  粤ICP备15106517号-1 '
							)
						)
					);
				} else {
					return React.createElement(
						'div',
						{ className: 'loadingBox' },
						React.createElement('div', { className: 'loadingGif' }),
						React.createElement(
							'div',
							{ className: 'loadingTxt' },
							'从第三方网站登陆，数据加载中...'
						)
					);
				}
			};
			return React.createElement(
				'div',
				{ className: 'w h minh' },
				isEnterLoginPage()
			);
		}
	});

	ReactDOM.render(React.createElement(Login, null), document.getElementById("loginpage"));
});

// 短信验证码用"captchaCode"代表 or "mess_seccode"
// 图形验证码用"verifyCode"代表 or "seccode"