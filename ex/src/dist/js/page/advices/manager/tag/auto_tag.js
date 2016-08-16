'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.ex.page + '/advices/manager/tag/actions.js', paths.ex.page + '/advices/manager/tag/auto_edit_box.js', paths.rcn.comps + '/search.js', paths.rcn.comps + '/modal.js'], function (mods, Actions, EditBox, Search, Modal) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;
	var changeAutoPage = Actions.changeAutoPage;
	var modifyAuto = Actions.modifyAuto;
	var openAutoEditBox = Actions.openAutoEditBox;
	var modifyKeyWord = Actions.modifyKeyWord;
	var createKeyWord = Actions.createKeyWord;
	var closeAutoEditBox = Actions.closeAutoEditBox;
	var openAutoDelModal = Actions.openAutoDelModal;
	var closeAutoDelModal = Actions.closeAutoDelModal;
	var delAuto = Actions.delAuto;
	var searchInput = Actions.searchInput;
	var search = Actions.search;


	var Del = React.createClass({
		displayName: 'Del',
		getInitialState: function getInitialState() {
			return { toggle: false };
		},
		render: function render() {
			var _this = this;

			var _props = this.props;
			var del_show = _props.del_show;
			var del_id = _props.del_id;
			var autoById = _props.autoById;
			var dispatch = _props.dispatch;

			var toggle = function toggle() {
				_this.setState({ toggle: !_this.state.toggle });
			};
			return React.createElement(
				Modal,
				{ id: 'delModal', title: '删除确认', show: 'del_show', modalSm: true, cancelEvent: true, dismiss: function dismiss() {
						_this.setState({ toggle: false });$('#delModal').modal('hide');
					}, confirm: function confirm() {
						$('#delModal').modal('hide');
						dispatch(delAuto(del_id, _this.state.toggle));
						_this.setState({ toggle: false });
					} },
				React.createElement(
					'p',
					{ className: 'tc' },
					'您确认删除',
					(autoById[del_id] || {}).name,
					'?'
				),
				React.createElement(
					'div',
					{ className: 'tc' },
					React.createElement(
						'span',
						{ className: 'cp', onClick: toggle },
						React.createElement('span', { className: "c-cb vm mr5" + (this.state.toggle ? ' active' : '') }),
						React.createElement(
							'span',
							{ className: 'vm' },
							'删除此标签将删除历史文章'
						)
					)
				)
			);
		}
	});

	var AutoTag = React.createClass({
		displayName: 'AutoTag',

		modifyState: function modifyState(id, status) {
			var dispatch = this.props.dispatch;

			if (status == 1) dispatch(modifyAuto(id, { status: 0 }));else if (status == 0) dispatch(modifyAuto(id, { status: 1 }));
		},
		renderList: function renderList() {
			var _this2 = this;

			var _props2 = this.props;
			var list = _props2.list;
			var dispatch = _props2.dispatch;

			var nodes = list.map(function (item, idx) {
				// return (
				// 	<tr keys={idx}>
				// 		<td className="tc">{idx + 1}</td>
				// 		<td>
				// 			<span>{item.name}</span>
				// 		</td>
				// 		<td>
				// 			{item.depend == 1 ? <span>与我有关</span> : <span style={{color: '#ccc'}}>与我无关</span>}
				// 		</td>
				// 		<td>
				// 			<span>{item.emotion == 1 ? '正面' : item.emotion == 0 ? '' : item.emotion == -1 ? '负面' : '中立'}</span>
				// 		</td>
				// 		<td>
				// 			<span>{item.warn == 1 ? '是' : '否' }</span>
				// 		</td>
				// 		<td>
				// 			<span className="ml5 mr5 iconfont icon-pencil" title="编辑" onClick={() => dispatch(openAutoEditBox(item.id))} />
				// 			{
				// 				item.status == 1
				// 				? <span className="ml5 mr5 iconfont icon-kaishi" title="已启用" style={{color: '#3a99d8'}} onClick={() => this.modifyState(item.id, item.status)} />
				// 				: <span className="ml5 mr5 iconfont icon-qiyong" title="已停用" onClick={() => this.modifyState(item.id, item.status)} />
				// 			}
				// 			<span className="ml5 mr5 iconfont icon-lajitong" title="删除" onClick={() => {
				// 				$('#delModal').modal('show');
				// 				dispatch(openAutoDelModal(item.id))
				// 			}} />
				// 		</td>
				// 	</tr>
				// )
				return React.createElement(
					'tr',
					{ keys: idx },
					React.createElement(
						'td',
						{ className: 'tc' },
						idx + 1
					),
					React.createElement(
						'td',
						null,
						React.createElement(
							'span',
							null,
							item.name
						)
					),
					React.createElement(
						'td',
						null,
						React.createElement('span', { className: 'ml5 mr5 iconfont icon-pencil', title: '编辑', onClick: function onClick() {
								return dispatch(openAutoEditBox(item.id));
							} }),
						item.status == 1 ? React.createElement('span', { className: 'ml5 mr5 iconfont icon-kaishi', title: '已启用', style: { color: '#3a99d8' }, onClick: function onClick() {
								return _this2.modifyState(item.id, item.status);
							} }) : React.createElement('span', { className: 'ml5 mr5 iconfont icon-qiyong', title: '已停用', onClick: function onClick() {
								return _this2.modifyState(item.id, item.status);
							} }),
						React.createElement('span', { className: 'ml5 mr5 iconfont icon-lajitong', title: '删除', onClick: function onClick() {
								$('#delModal').modal('show');
								dispatch(openAutoDelModal(item.id));
							} })
					)
				);
			});

			return nodes;
		},
		renderEditBox: function renderEditBox() {
			var _props3 = this.props;
			var eb_show = _props3.eb_show;
			var eb_data_id = _props3.eb_data_id;
			var autoById = _props3.autoById;
			var dispatch = _props3.dispatch;
			var modalErr = _props3.modalErr;

			if (eb_show) {
				var data = {
					name: '',
					emotion: 0,
					depend: 1,
					warn: 0,
					category: []
				};
				if (eb_data_id !== null) {
					data = $.extend(true, data, autoById[eb_data_id]);
					// modify
					return React.createElement(EditBox, { modify: true, data: data, errTxt: modalErr, onConfirm: function onConfirm(data) {
							var category = data.category.map(function (item) {
								return { id: item.id, name: item.name };
							});
							data = _extends(data, { category: category });
							dispatch(modifyKeyWord(eb_data_id, data));
						}, onCancel: function onCancel() {
							return dispatch(closeAutoEditBox());
						} });
				} else {
					// create
					return React.createElement(EditBox, { create: true, data: data, errTxt: modalErr, onConfirm: function onConfirm(data) {
							dispatch(createKeyWord(data));
						}, onCancel: function onCancel() {
							return dispatch(closeAutoEditBox());
						} });
				}
			} else {
				// none
				return null;
			}
		},
		renderDelModal: function renderDelModal() {
			// const {del_show, del_id, autoById, dispatch} = this.props;
			// return (
			// 	<Modal id="delModal" title="删除确认" show="del_show" modalSm dismiss={() => dispatch(closeAutoDelModal())} confirm={() => {
			// 		$('#delModal').modal('hide');
			// 		dispatch(delAuto(del_id));
			// 	}}>
			// 		<p className="tc">您确认删除{(autoById[del_id]||{}).name}?</p>
			// 		<div className="tc">
			// 			<span className="c-cb vm mr5" />
			// 			<span className="vm">删除此标签将删除历史文章</span>
			// 		</div>
			// 	</Modal>
			// )
			return React.createElement(Del, this.props);
		},

		render: function render() {
			var _props4 = this.props;
			var total = _props4.total;
			var cur_page = _props4.cur_page;
			var count = _props4.count;
			var dispatch = _props4.dispatch;
			var eb_show = _props4.eb_show;
			var isSearching = _props4.isSearching;
			var searchTxt = _props4.searchTxt;
			var list = _props4.list;

			return React.createElement(
				'div',
				null,
				eb_show ? this.renderEditBox() : React.createElement(
					'div',
					null,
					React.createElement(
						'div',
						{ className: 'panel panel-default advices-manager-tag-v2' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'自动标签'
							),
							React.createElement(Search, { placeholder: '请输入您要搜索的内容', onSearch: function onSearch() {
									return dispatch(search());
								}, onChange: function onChange(e) {
									return dispatch(searchInput(e.target.value));
								} }),
							React.createElement(
								'button',
								{ className: 'btn btn-primary ml20', type: 'button', onClick: function onClick() {
										return dispatch(openAutoEditBox(null));
									} },
								'添加关键词'
							)
						),
						list.length > 0 ? React.createElement(
							'table',
							{ className: 'table table-striped spec' },
							React.createElement(
								'thead',
								null,
								React.createElement(
									'th',
									{ className: 'tc' },
									'序号'
								),
								React.createElement(
									'th',
									null,
									'关键词'
								),
								React.createElement(
									'th',
									null,
									'操作'
								)
							),
							React.createElement(
								'tbody',
								null,
								this.renderList()
							)
						) : React.createElement(
							'div',
							{ className: 'list-blank-holder' },
							React.createElement(
								'span',
								null,
								'暂无关键词，',
								React.createElement(
									'span',
									{ className: 'add', onClick: function onClick() {
											return dispatch(openAutoEditBox(null));
										} },
									'立即添加'
								)
							)
						),
						React.createElement(
							'div',
							{ className: "tc mt30 mb30" + (total / count > 1 ? '' : ' dn') },
							React.createElement(Pagination, { current: cur_page, pageSize: count, total: total, className: 'v2 ib', onChange: function onChange(page) {
									return dispatch(changeAutoPage(page));
								} })
						)
					)
				),
				this.renderDelModal()
			);
		}
	});

	function toProps(state) {
		state = state['manager_tag']['autoList'];
		return {
			cur_page: state.cur_page,
			list: Object.keys(state.autoById).map(function (id) {
				return state.autoById[id];
			}),
			autoById: state.autoById,
			total: state.total,
			count: state.count,
			eb_show: state.edit_box_show,
			eb_data_id: state.edit_box_data_id,
			del_show: state.del_modal_show,
			del_id: state.del_id,
			isSearching: state.isSearching,
			searchTxt: state.searchTxt,
			modalErr: state.modalErr
		};
	}

	return connect(toProps)(AutoTag);
});