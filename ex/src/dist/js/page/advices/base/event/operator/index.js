'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.ex.page + '/advices/base/event/operator/actions.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/dropdown/index.js', paths.rcn.plu + '/fecha.min.js', paths.ex.util + '/parse.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, Actions, Modal, Dropdown, fecha, Parse) {
	var React = mods.ReactPack.default;
	var RangeCal = mods.RangeCal;
	var Cal = mods.Cal;
	var connect = mods.ReactReduxPack.connect;

	var Link = mods.RouterPack.Link;

	var fetchEventList = Actions.fetchEventList;
	var openCreateEvent = Actions.openCreateEvent;
	var editModalDataTitle = Actions.editModalDataTitle;
	var editModalDataBegin = Actions.editModalDataBegin;
	var editModalDataEnd = Actions.editModalDataEnd;
	var editModalDataRank = Actions.editModalDataRank;
	var editModalDataDetail = Actions.editModalDataDetail;
	var closeEventModal = Actions.closeEventModal;
	var createEvent = Actions.createEvent;
	var openModifyEvent = Actions.openModifyEvent;
	var editModalDataBe = Actions.editModalDataBe;
	var modifyEvent = Actions.modifyEvent;
	var openDelModal = Actions.openDelModal;
	var closeDelModal = Actions.closeDelModal;
	var delEvent = Actions.delEvent;
	var openEndModal = Actions.openEndModal;
	var closeEndModal = Actions.closeEndModal;


	var eventRankMap = {
		1: '一级',
		2: '二级',
		3: '三级',
		4: '普通'
	};

	var Drop = React.createClass({
		displayName: 'Drop',
		getInitialState: function getInitialState() {
			return { open: false };
		},
		clickHandler: function clickHandler() {
			var _this = this;

			if (!this.state.open) {
				this.setState({ open: true });
				$(this.refs.options).toggle(100);
				$(document).one('click', function () {
					$(_this.refs.options).toggle(100);
					_this.setState({ open: false });
				});
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'dropdown-v2', ref: 'wrap' },
				React.createElement(
					'div',
					{ className: 'select', onClick: this.clickHandler },
					React.createElement('input', { type: 'text', className: 'txt', disabled: true, value: this.props.holderTxt }),
					React.createElement(
						'span',
						{ className: 'ic' },
						React.createElement('span', { className: 'corner' })
					)
				),
				React.createElement(
					'ul',
					{ className: 'option none', ref: 'options' },
					this.props.children
				)
			);
		}
	});

	var EventList = React.createClass({
		displayName: 'EventList',

		getInitialState: function getInitialState() {
			return {
				ddTog: false
			};
		},
		componentDidMount: function componentDidMount() {
			var dispatch = this.props.dispatch;

			dispatch(fetchEventList());
			this.validate();
		},
		componentDidUpdate: function componentDidUpdate(preProps) {
			if (this.props.modalShow == false && preProps.modalShow == true) {
				if (this.validator) {
					this.validator.resetForm();
				}
			}
		},
		validate: function validate() {
			var _this2 = this;

			this.validator = $('#evForm').validate({
				rules: {
					title: {
						required: true
					},
					time: {
						required: true
					},
					begin: {
						required: true
					},
					rank: {
						required: true
					},
					desc: {
						required: true,
						minlength: 10
					}
				},
				messages: {
					title: {
						required: "请填写事件标题"
					},
					time: {
						required: "请选择起始时间"
					},
					begin: {
						required: "请选择开始时间"
					},
					rank: {
						required: "请选择事件等级"
					},
					desc: {
						required: "请填写事件描述",
						minlength: "事件描述须大于10个字符"
					}
				},
				submitHandler: function submitHandler() {
					_this2.modalConfirm();
				},
				errorPlacement: function errorPlacement(error, element) {
					error.appendTo(element.parent());
				}
			});
		},
		ddToggle: function ddToggle(e) {
			var d = $('#dd_option').css('display');
			if (d == 'none') {
				$('#dd_option').toggle(100);
				$(document).one('click', function () {
					return $('#dd_option').toggle(100);
				});
			}
		},
		renderList: function renderList() {
			var data = this.props.eventList;
			var dispatch = this.props.dispatch;

			var _openModifyEvent = function _openModifyEvent(event) {
				$('#eventModal').modal('show');
				dispatch(openModifyEvent(event));
			};

			var nodes = data.map(function (event, idx) {
				var now = Date.now(),
				    begin = fecha.parse(event.begin_at, 'YYYY-MM-DD HH:mm').getTime();
				return React.createElement(
					'tr',
					{ key: idx },
					React.createElement(
						'td',
						{ className: 'tc' },
						React.createElement(
							'span',
							{ className: 'num' },
							idx + 1
						)
					),
					React.createElement(
						'td',
						null,
						React.createElement(
							Link,
							{ to: { pathname: 'event/detail', query: { inc: event.id }, state: { event: event } }, className: 'link' },
							event.title
						)
					),
					React.createElement(
						'td',
						null,
						React.createElement(
							'span',
							{ className: 'desc' },
							event.detail
						)
					),
					React.createElement(
						'td',
						null,
						React.createElement(
							'div',
							{ className: 'nowrap' },
							React.createElement(
								'span',
								null,
								Parse.time(event.begin_at)
							),
							React.createElement(
								'span',
								{ className: 'to' },
								'至'
							),
							React.createElement(
								'span',
								null,
								event.end_at == 'none' || !event.end_at ? '   -  ' : Parse.time(event.end_at)
							)
						)
					),
					React.createElement(
						'td',
						{ className: 'nowrap' },
						React.createElement(
							'span',
							{ className: 'rank rank' + event.rank },
							eventRankMap[event.rank]
						)
					),
					React.createElement(
						'td',
						{ className: 'opers' },
						event.status == 1 ? React.createElement('span', { className: 'iconfont icon-pencil', title: '编辑', onClick: function onClick() {
								return _openModifyEvent(event);
							} }) : null,
						React.createElement('span', { className: 'iconfont icon-lajitong', title: '删除', onClick: function onClick() {
								$('#delModal').modal('show');dispatch(openDelModal(event.id));
							} }),
						event.status == 1 && now >= begin ? React.createElement('span', { className: 'iconfont icon-jieshu', style: { color: '#3a99d8' }, title: '结案', onClick: function onClick() {
								$('#endModal').modal('show');dispatch(openEndModal(event.id));
							} }) : null
					)
				);
			});

			return nodes;
		},
		modalConfirm: function modalConfirm() {
			var _props = this.props;
			var dispatch = _props.dispatch;
			var modalFlag = _props.modalFlag;
			var modalData = _props.modalData;

			if (this.validator.form()) {
				$('#eventModal').modal('hide');
				if (modalFlag == 'create') {
					dispatch(createEvent(modalData));
				} else if (modalFlag == 'modify') {
					dispatch(modifyEvent(modalData.id, modalData));
				}
			}
		},
		renderModal: function renderModal() {
			var _this3 = this;

			var _props2 = this.props;
			var dispatch = _props2.dispatch;
			var modalShow = _props2.modalShow;
			var modalData = _props2.modalData;
			var modalFlag = _props2.modalFlag;
			var eventById = _props2.eventById;
			var modalErr = _props2.modalErr;


			var title,
			    now = Date.now();

			if (modalFlag == 'create') {
				title = '新增事件';
			} else if (modalFlag == 'modify') {
				title = '修改事件';
			}

			var renderSelect = function renderSelect() {
				return React.createElement(
					'div',
					{ className: 'dropdown-wrap' },
					React.createElement(Dropdown, {
						optionList: [{ name: '一级', value: 1 }, { name: '二级', value: 2 }, { name: '三级', value: 3 }, { name: '普通', value: 4 }],
						selectClick: _this3.ddToggle,
						optionListClick: function optionListClick(tar) {
							dispatch(editModalDataRank(tar.value));
						},
						selectValue: eventRankMap[modalData.rank],
						selectName: 'rank',
						isShowSelectList: _this3.state.ddTog })
				);
			};

			var node = React.createElement(
				Modal,
				{ id: 'eventModal', title: title, show: modalShow, cancelEvent: true, dismiss: function dismiss() {
						$('#eventModal').modal('hide');_this3.validator.resetForm();dispatch(closeEventModal());
					}, confirm: this.modalConfirm },
				React.createElement(
					'form',
					{ id: 'evForm', className: 'form-horizontal' },
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ htmlFor: 'ev_title', className: 'col-lg-2 control-label' },
							'事件标题'
						),
						React.createElement(
							'div',
							{ className: 'col-lg-10' },
							React.createElement('input', { type: 'text', className: 'form-control', id: 'ev_title', value: modalData.title, onChange: function onChange(e) {
									return dispatch(editModalDataTitle(e.target.value));
								}, name: 'title' })
						)
					),
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ htmlFor: 'ev_start', className: 'col-lg-2 control-label' },
							'开始时间'
						),
						React.createElement(
							'div',
							{ className: 'col-lg-10' },
							React.createElement(Cal, { name: 'begin', zIndex: 10000, id: 'ev_start', value: modalData.begin_at, timeSelector: true, format: 'yyyy-MM-dd HH:mm', onChange: function onChange(value) {
									dispatch(editModalDataBegin(value));
								}, onClose: function onClose() {
									_this3.validator && _this3.validator.element('#evForm [name="begin"]');
								}, showSecond: false, className: 'form-control' })
						)
					),
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ className: 'col-lg-2 control-label' },
							'事件等级'
						),
						React.createElement(
							'div',
							{ className: 'col-lg-10' },
							React.createElement(
								Drop,
								{ holderTxt: eventRankMap[modalData.rank] },
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return dispatch(editModalDataRank(1));
										} },
									'一级'
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return dispatch(editModalDataRank(2));
										} },
									'二级'
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return dispatch(editModalDataRank(3));
										} },
									'三级'
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return dispatch(editModalDataRank(4));
										} },
									'普通'
								)
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'form-group' },
						React.createElement(
							'label',
							{ htmlFor: 'ev_desc', className: 'col-lg-2 control-label' },
							'事件描述'
						),
						React.createElement(
							'div',
							{ className: 'col-lg-10' },
							React.createElement('textarea', { className: 'form-control', id: 'ev_desc', rows: '4', name: 'desc', value: modalData.detail, onChange: function onChange(e) {
									return dispatch(editModalDataDetail(e.target.value));
								}, onBlur: function onBlur(e) {
									return dispatch(editModalDataDetail($.trim(e.target.value)));
								} })
						)
					)
				)
			);

			return node;
		},
		renderDelModal: function renderDelModal() {
			var _props3 = this.props;
			var delModalShow = _props3.delModalShow;
			var delId = _props3.delId;
			var eventById = _props3.eventById;
			var dispatch = _props3.dispatch;

			return React.createElement(
				Modal,
				{ id: 'delModal', modalSm: true, title: '提示', dismiss: function dismiss() {
						return dispatch(closeDelModal());
					}, confirm: function confirm() {
						$('#delModal').modal('hide');dispatch(delEvent(delId));
					} },
				React.createElement(
					'p',
					{ className: 'breakall tc' },
					'确定删除' + (eventById[delId] || {}).title + '?'
				)
			);
		},
		renderEndModal: function renderEndModal() {
			var _props4 = this.props;
			var endModalShow = _props4.endModalShow;
			var endId = _props4.endId;
			var eventById = _props4.eventById;
			var dispatch = _props4.dispatch;

			var event = eventById[endId] || {};
			var confirm = function confirm() {
				var end_at = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
				$('#endModal').modal('hide');
				dispatch(modifyEvent(event.id, _extends({}, event, {
					status: 0,
					end_at: end_at
				})));
				dispatch(closeEndModal());
			};
			return React.createElement(
				Modal,
				{ title: '提示', id: 'endModal', modalSm: true, show: endModalShow, dismiss: function dismiss() {
						return dispatch(closeEndModal());
					}, confirm: confirm },
				React.createElement(
					'div',
					{ className: 'tc' },
					React.createElement(
						'p',
						null,
						'您确定将此事件结案吗？'
					),
					React.createElement(
						'p',
						null,
						'（事件结案后，只可查看该事件下的文章）'
					)
				)
			);
		},
		render: function render() {
			var dispatch = this.props.dispatch;

			var _openCreateEvent = function _openCreateEvent() {
				$('#eventModal').modal('show');
				dispatch(openCreateEvent());
			};
			return React.createElement(
				'div',
				{ className: 'advices-base-event-v2' },
				React.createElement(
					'div',
					{ className: 'container-fluid' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'事件处理'
							),
							React.createElement(
								'button',
								{ className: 'btn btn-primary', onClick: _openCreateEvent },
								'新增事件'
							)
						),
						this.props.eventList.length > 0 ? React.createElement(
							'table',
							{ className: 'table table-striped spec' },
							React.createElement(
								'thead',
								null,
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										{ className: 'tc' },
										'序号'
									),
									React.createElement(
										'th',
										null,
										'标题'
									),
									React.createElement(
										'th',
										null,
										'描述'
									),
									React.createElement(
										'th',
										null,
										'起始时间'
									),
									React.createElement(
										'th',
										{ className: 'nowrap' },
										'等级'
									),
									React.createElement(
										'th',
										null,
										'操作'
									)
								)
							),
							React.createElement(
								'tbody',
								null,
								this.renderList()
							)
						) : React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'list-blank-holder' },
								React.createElement(
									'span',
									null,
									'暂无事件，',
									React.createElement(
										'span',
										{ className: 'add', onClick: _openCreateEvent },
										'立即添加'
									)
								)
							)
						)
					),
					this.renderModal(),
					this.renderDelModal(),
					this.renderEndModal()
				)
			);
		}
	});

	function toProps(state) {
		state = state.eventList;
		return {
			eventList: Object.keys(state.eventById).map(function (id) {
				return state.eventById[id];
			}),
			eventById: state.eventById,
			modalShow: state.modalShow,
			modalData: state.modalData,
			modalFlag: state.modalFlag,
			modalErr: state.modalErr,
			delId: state.delId,
			delModalShow: state.delModalShow,
			endId: state.endId,
			endModalShow: state.endModalShow
		};
	}

	return connect(toProps)(EventList);
});