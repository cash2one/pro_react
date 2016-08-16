'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.ex.page + '/advices/manager/tag/actions.js', paths.rcn.util + '/rest.js'], function (mods, Actions, Rest) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;
	var changeAutoPage = Actions.changeAutoPage;
	var modifyAuto = Actions.modifyAuto;


	var rest = Rest.ex();

	var BtnGroup = React.createClass({
		displayName: 'BtnGroup',

		getInitialState: function getInitialState() {
			return this._getInit(this.props.btns);
		},
		_getInit: function _getInit(btns) {
			var selected = [];
			btns = btns.reduce(function (obj, item, idx) {
				obj[idx] = item;
				if (item.selected) selected.push(idx);
				return obj;
			}, {});
			return {
				selected: selected,
				btns: btns
			};
		},
		getDefaultProps: function getDefaultProps() {
			return {
				class_name: 'eb-t-gbtn',
				class_name_r: ' eb-t-gbtn-r'
			};
		},
		handleClick: function handleClick(key, item) {
			if (this.props.mutiple) {
				var selected = this.state.selected.slice().push(key);
			} else {
				selected = [key];
			}
			this.setState({ selected: selected });
			this.props.onClick && this.props.onClick(item);
		},
		renderBtn: function renderBtn() {
			var _this = this;

			return Object.keys(this.state.btns).map(function (key) {
				var item = _this.state.btns[key];
				var activeClass = _this.state.selected.indexOf(key) == -1 ? '' : ' active';
				return React.createElement(
					'div',
					{ className: "eb-t-gbtn-cell" + activeClass, onClick: function onClick() {
							return _this.handleClick(key, item);
						} },
					React.createElement(
						'span',
						null,
						item.title
					)
				);
			});
		},
		render: function render() {
			var class_name = this.props.class_name;
			if (this.props.round) class_name += this.props.class_name_r;
			return React.createElement(
				'div',
				{ className: class_name },
				this.renderBtn()
			);
		}
	});

	var EditBox = React.createClass({
		displayName: 'EditBox',

		getInitialState: function getInitialState() {
			var form = {
				name: this.props.data.name,
				depend: this.props.data.depend,
				emotion: this.props.data.emotion,
				warn: this.props.data.warn,
				category: this.props.data.category
			};
			var categoryid = this.props.data.category.map(function (item) {
				return item.id;
			});
			return {
				form: form,
				category: {},
				categoryid: categoryid,
				nameError: false
			};
		},
		componentDidMount: function componentDidMount() {
			var _this2 = this;

			rest.category.read({
				begin: 0,
				count: 1000
			}).then(function (data) {
				return data.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
			}).then(function (data) {
				return _this2.setState({ category: data });
			});
		},
		setForm: function setForm(obj) {
			var form = _extends({}, this.state.form, obj);
			this.setState({ form: form });
		},
		renderCategory: function renderCategory() {
			var _this3 = this;

			var handler = function handler(id) {
				// let idx = this.state.categoryid.indexOf(id);
				// if(idx == -1){
				// 	this.setState({categoryid: [...this.state.categoryid, id]});
				// }
				// else{
				// 	this.setState({categoryid: [...this.state.categoryid.slice(0, idx), ...this.state.categoryid.slice(idx + 1)]})
				// }
			};
			var category = Object.keys(this.state.category).map(function (id) {
				return _this3.state.category[id];
			});
			var nodes = category.map(function (item, idx) {
				return React.createElement(
					'span',
					{ key: idx, className: "eb-tag" + (_this3.state.categoryid.indexOf(item.id) == -1 ? '' : ' active'), onClick: function onClick() {
							return handler(item.id);
						}, title: item.name },
					item.name.length > 6 ? item.name.substr(0, 6) + '...' : item.name
				);
			});
			return nodes;
		},
		confirmHandler: function confirmHandler() {
			var _this4 = this;

			if (this.state.form.name.length > 0) {
				var category = this.state.categoryid.map(function (id) {
					return _this4.state.category[id];
				});
				var form = _extends({}, this.state.form, { category: category });
				this.props.onConfirm && this.props.onConfirm(form);
			} else {
				this.setState({ nameError: true });
			}
		},
		renderName: function renderName() {
			var _this5 = this;

			var changeName = function changeName(name) {
				return _this5.setForm({ name: name });
			};
			var resetError = function resetError() {
				return _this5.setState({ nameError: false });
			};
			if (this.props.modify) {
				return React.createElement('input', { type: 'text', className: "form-control" + (this.state.nameError || this.props.errTxt ? ' error' : ''), disabled: true, value: this.state.form.name, onFocus: resetError });
			} else if (this.props.create) {
				return React.createElement('input', { type: 'text', className: "form-control" + (this.state.nameError || this.props.errTxt ? ' error' : ''), value: this.state.form.name, onChange: function onChange(e) {
						return changeName(e.target.value);
					}, onFocus: resetError });
			}
		},
		render: function render() {
			var _this6 = this;

			var changeDepend = function changeDepend(depend) {
				return _this6.setForm({ depend: depend });
			};
			var changeEmotion = function changeEmotion(emotion) {
				return _this6.setForm({ emotion: emotion });
			};
			var changeWarn = function changeWarn(warn) {
				return _this6.setForm({ warn: warn });
			};
			var nameError = this.state.nameError,
			    errTxt = this.props.errTxt;
			return React.createElement(
				'div',
				{ className: 'edit-box' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'自动标签'
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'form',
								{ className: 'form-horizontal', onSubmit: function onSubmit(e) {
										return e.preventDefault();
									} },
								React.createElement(
									'div',
									{ className: 'form-group' },
									React.createElement(
										'label',
										{ className: 'col-lg-1 col-lg-offset-1 control-label' },
										'关键词'
									),
									React.createElement(
										'div',
										{ className: 'col-lg-9' },
										this.renderName(),
										nameError ? React.createElement(
											'span',
											{ className: 'err' },
											'关键词不能为空'
										) : errTxt ? React.createElement(
											'span',
											{ className: 'err' },
											errTxt
										) : null
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer tr' },
							React.createElement(
								'button',
								{ className: 'btn btn-default btn-lg mr10', onClick: function onClick() {
										return _this6.props.onCancel && _this6.props.onCancel();
									}, type: 'button' },
								'取消'
							),
							React.createElement(
								'button',
								{ className: 'btn btn-primary btn-lg', onClick: this.confirmHandler, type: 'button' },
								'确认'
							)
						)
					)
				)
			);
		}
	});

	return EditBox;
});