'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.ex.page + '/advices/manager/media/rank.js', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal/index.js'], function (mods, Rank, Rest, Modal) {
	var React = mods.ReactPack.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var Pagination = mods.Pagination;

	var rest = Rest.ex();

	var Warn = React.createClass({
		displayName: 'Warn',

		getInitialState: function getInitialState() {
			return {
				data: {
					status: '0',
					email: ''
				},
				show: false
			};
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			this.validate();
			rest.config.read().done(function (data) {
				data.value && _this.setState({ data: JSON.parse(data.value) });
			});
		},
		toggle: function toggle(status) {
			this.setState({ data: _extends({}, this.state.data, { status: status }) });
			this.validator.resetForm();
		},
		submitHandler: function submitHandler() {
			var _this2 = this;

			if (this.validator.form()) {
				rest.config.update(this.state.data).done(function (data) {
					if (data.result == true) {
						_this2.setState({ show: true });
						setTimeout(function () {
							return _this2.setState({ show: false });
						}, 800);
					}
				});
			}
		},
		emailHandler: function emailHandler(value) {
			this.setState({
				data: _extends({}, this.state.data, { email: value })
			});
		},
		validate: function validate() {
			this.validator = $('#warn_form').validate({
				rules: {
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					email: {
						required: "邮箱不能为空",
						email: "不是合法的邮箱格式"
					}
				},
				submitHandler: function submitHandler() {},
				errorPlacement: function errorPlacement(error, element) {
					// $('.err-box').empty().append(error);
					error.appendTo($('.err-box'));
				}
			});
		},
		render: function render() {
			var _this3 = this;

			return React.createElement(
				'div',
				{ className: 'setting-warn w1200 fr-mid' },
				React.createElement(
					'div',
					{ className: 'hd' },
					React.createElement(
						'span',
						null,
						'通知设置'
					)
				),
				React.createElement(
					'div',
					{ className: 'bd' },
					React.createElement(
						'form',
						{ id: 'warn_form' },
						React.createElement(
							'table',
							{ className: this.state.data.status == '0' ? 'disabled' : null },
							React.createElement('colgroup', { width: '100px' }),
							React.createElement('colgroup', { width: '' }),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									null,
									'状态'
								),
								React.createElement(
									'td',
									null,
									React.createElement(
										'div',
										{ className: 'c-button-g' },
										React.createElement(
											'div',
											{ className: "c-button-g-cell" + (this.state.data.status == '1' ? ' active' : ''), onClick: function onClick() {
													return _this3.toggle('1');
												} },
											React.createElement(
												'span',
												null,
												'开启'
											)
										),
										React.createElement(
											'div',
											{ className: "c-button-g-cell" + (this.state.data.status == '0' ? ' active' : ''), onClick: function onClick() {
													return _this3.toggle('0');
												} },
											React.createElement(
												'span',
												null,
												'关闭'
											)
										)
									)
								)
							),
							React.createElement(
								'tr',
								null,
								React.createElement(
									'td',
									null,
									'通知邮箱'
								),
								React.createElement(
									'td',
									null,
									React.createElement('input', { type: 'text',
										name: 'email',
										placeholder: '例：example@example.com',
										disabled: this.state.data.status == '0',
										value: this.state.data.email,
										onChange: function onChange(e) {
											return _this3.emailHandler(e.target.value);
										} })
								)
							)
						),
						React.createElement(
							'div',
							{ style: { width: '420px' }, className: 'ovh' },
							React.createElement(
								'button',
								{ className: 'c-button fr', type: 'button', onClick: this.submitHandler },
								'确定保存'
							)
						),
						React.createElement('div', { className: 'err-box' })
					)
				),
				React.createElement(
					Modal,
					{ noBtn: true, show: this.state.show, title: '提示' },
					React.createElement(
						'p',
						{ className: 'm-tip' },
						'保存成功'
					)
				)
			);
		}
	});

	return Warn;
});