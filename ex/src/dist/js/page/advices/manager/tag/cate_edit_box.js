'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['mods', paths.ex.page + '/advices/manager/tag/actions.js'], function (mods, Actions) {
	var React = mods.ReactPack.default;

	var rest = new $.RestClient(paths.ex.api + '/api/v1/');
	rest.add('keywords');

	var EditBox = React.createClass({
		displayName: 'EditBox',

		getInitialState: function getInitialState() {
			var form = {
				name: this.props.data.name
			};
			var keywordids = this.props.data.keywords.map(function (item) {
				return item.id;
			});
			return {
				form: form,
				keywordids: keywordids,
				keywords: {},
				nameError: false
			};
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			rest.keywords.read({
				begin: 0,
				count: 1000
			}).then(function (data) {
				return data.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
			}).then(function (data) {
				return _this.setState({ keywords: data });
			});
		},
		setForm: function setForm(obj) {
			var form = _extends({}, this.state.form, obj);
			this.setState({ form: form });
		},
		renderKeywords: function renderKeywords() {
			var _this2 = this;

			var handler = function handler(id) {
				var idx = _this2.state.keywordids.indexOf(id);
				if (idx == -1) {
					_this2.setState({ keywordids: [].concat(_toConsumableArray(_this2.state.keywordids), [id]) });
				} else {
					_this2.setState({ keywordids: [].concat(_toConsumableArray(_this2.state.keywordids.slice(0, idx)), _toConsumableArray(_this2.state.keywordids.slice(idx + 1))) });
				}
			};
			var keywords = Object.keys(this.state.keywords).map(function (id) {
				return _this2.state.keywords[id];
			});
			var nodes = keywords.map(function (item, idx) {
				return React.createElement(
					'span',
					{ key: idx, className: "eb-tag" + (_this2.state.keywordids.indexOf(item.id) == -1 ? '' : ' active'), onClick: function onClick() {
							return handler(item.id);
						}, title: item.name },
					item.name.length > 6 ? item.name.substr(0, 6) + '...' : item.name
				);
			});
			return nodes;
		},
		confirmHandler: function confirmHandler() {
			var _this3 = this;

			if (this.state.form.name.length > 0) {
				var keywords = this.state.keywordids.map(function (id) {
					return _this3.state.keywords[id];
				});
				var form = _extends({}, this.state.form, { keywords: keywords });
				this.props.onConfirm && this.props.onConfirm(form);
			} else {
				this.setState({ nameError: true });
			}
		},
		render: function render() {
			var _this4 = this;

			var changeName = function changeName(name) {
				return _this4.setForm({ name: name });
			};
			var resetError = function resetError() {
				return _this4.setState({ nameError: false });
			};
			return React.createElement(
				'div',
				{ className: 'edit-box' },
				React.createElement(
					'div',
					{ className: 'eb-t' },
					React.createElement(
						'div',
						{ className: 'eb-t-cell' },
						React.createElement(
							'div',
							{ className: 'fl pr50', style: { width: '275px' } },
							React.createElement(
								'div',
								{ className: 'eb-t-lab' },
								React.createElement(
									'span',
									{ className: 'eb-t-lab' },
									'分类名称：'
								)
							),
							React.createElement(
								'div',
								{ className: 'eb-t-oper' },
								React.createElement(
									'div',
									{ className: 'ib pct100' },
									React.createElement(
										'div',
										{ className: "ip-g pct100" + (this.state.nameError ? ' error' : '') },
										React.createElement('input', { type: 'text', value: this.state.form.name, onChange: function onChange(e) {
												return changeName(e.target.value);
											}, onFocus: resetError })
									)
								)
							)
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'eb-text' },
					React.createElement(
						'span',
						null,
						'相关自动标签(重复点击可取消)'
					)
				),
				React.createElement(
					'div',
					{ className: 'eb-bt' },
					React.createElement(
						'div',
						null,
						this.renderKeywords()
					)
				),
				this.state.nameError ? React.createElement(
					'div',
					{ className: 'error-bar' },
					'分类名称不能为空'
				) : null,
				this.props.errTxt ? React.createElement(
					'div',
					{ className: 'error-bar' },
					this.props.errTxt
				) : null,
				React.createElement(
					'div',
					{ className: 'pt15 pb15 tc' },
					React.createElement(
						'span',
						{ className: 'eb-btn', onClick: function onClick() {
								return _this4.props.onCancel && _this4.props.onCancel();
							} },
						'取消'
					),
					React.createElement(
						'span',
						{ className: 'eb-btn', onClick: this.confirmHandler },
						'确定'
					)
				)
			);
		}
	});

	return EditBox;
});