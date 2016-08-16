'use strict';

define(['mods', paths.ex.page + '/advices/manager/tag/cate_edit_box.js', paths.ex.page + '/advices/manager/tag/actions.js', paths.rcn.comps + '/modal/index.js'], function (mods, EditBox, Actions, Modal) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;
	var changeCatePage = Actions.changeCatePage;
	var openCateEditBox = Actions.openCateEditBox;
	var closeCateEditBox = Actions.closeCateEditBox;
	var modifyCate = Actions.modifyCate;
	var createCate = Actions.createCate;
	var openCateDelModal = Actions.openCateDelModal;
	var delCate = Actions.delCate;
	var closeCateDelModal = Actions.closeCateDelModal;


	var CateTag = React.createClass({
		displayName: 'CateTag',

		renderList: function renderList() {
			var _props = this.props;
			var list = _props.list;
			var dispatch = _props.dispatch;

			var nodes = list.map(function (item, idx) {
				return React.createElement(
					'tr',
					{ key: idx },
					React.createElement(
						'td',
						null,
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
						React.createElement(
							'span',
							null,
							item.last_at
						)
					),
					React.createElement(
						'td',
						{ className: 'tc pl10 pr10 pt10 pb10' },
						item.keywords.map(function (kw, kw_i) {
							var name = kw.name;
							name = name.length > 6 ? name.slice(0, 6) + '...' : name;
							return React.createElement(
								'span',
								{ className: 'at-tag', key: kw_i, title: kw.name },
								name
							);
						})
					),
					React.createElement(
						'td',
						null,
						React.createElement('span', { className: 'ml5 mr5 iconfont icon-pencil', title: '编辑', onClick: function onClick() {
								dispatch(openCateEditBox(item.id));
							} }),
						React.createElement('span', { className: 'ml5 mr5 iconfont icon-lajitong', title: '删除', onClick: function onClick() {
								return dispatch(openCateDelModal(item.id));
							} })
					)
				);
			});

			return nodes;
		},
		renderEditBox: function renderEditBox() {
			var _props2 = this.props;
			var dispatch = _props2.dispatch;
			var eb_show = _props2.eb_show;
			var eb_data_id = _props2.eb_data_id;
			var cateById = _props2.cateById;
			var modalErr = _props2.modalErr;

			if (eb_show) {
				var defaults = {
					name: '',
					keywords: []
				};
				if (eb_data_id != null) {
					// modify
					return React.createElement(EditBox, { data: cateById[eb_data_id], errTxt: modalErr, onConfirm: function onConfirm(data) {
							var keywords = data.keywords.map(function (item) {
								return {
									id: item.id,
									name: item.name
								};
							});
							dispatch(modifyCate(eb_data_id, { keywords: keywords }));
						}, onCancel: function onCancel() {
							return dispatch(closeCateEditBox());
						} });
				} else {
					// create
					return React.createElement(EditBox, { data: defaults, errTxt: modalErr, onConfirm: function onConfirm(data) {
							return dispatch(createCate(data));
						}, onCancel: function onCancel() {
							return dispatch(closeCateEditBox());
						} });
				}
			} else {
				return null;
			}
		},
		renderDelModal: function renderDelModal() {
			var _props3 = this.props;
			var del_show = _props3.del_show;
			var del_id = _props3.del_id;
			var cateById = _props3.cateById;
			var dispatch = _props3.dispatch;

			if (del_id && del_show) {
				return React.createElement(
					Modal,
					{ title: '删除分类', show: del_show, confirm: function confirm() {
							return dispatch(delCate(del_id));
						}, dismiss: function dismiss() {
							return dispatch(closeCateDelModal());
						} },
					React.createElement(
						'div',
						{ className: 'm-tip' },
						React.createElement(
							'p',
							null,
							'确定删除',
							cateById[del_id]['name'],
							'?'
						),
						React.createElement(
							'p',
							{ className: 'tipTxt2' },
							'（确认删除后，此分类下的数据将一并删除）'
						)
					)
				);
			}
		},
		render: function render() {
			var _props4 = this.props;
			var cur_page = _props4.cur_page;
			var dispatch = _props4.dispatch;
			var total = _props4.total;
			var count = _props4.count;
			var eb_show = _props4.eb_show;
			var list = _props4.list;

			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'c-tool' },
					React.createElement(
						'div',
						{ className: 'fr' },
						eb_show ? null : React.createElement(
							'button',
							{ className: 'c-button', onClick: function onClick() {
									return dispatch(openCateEditBox(null));
								} },
							'新建分类'
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'content pt10' },
					React.createElement(
						'div',
						{ className: 'w1200' },
						list.length > 0 ? React.createElement(
							'table',
							{ className: 'c-table' },
							React.createElement('colgroup', { width: '10%' }),
							React.createElement('colgroup', { width: '20%' }),
							React.createElement('colgroup', { width: '20%' }),
							React.createElement('colgroup', { width: '35%' }),
							React.createElement('colgroup', { width: '15%' }),
							React.createElement(
								'thead',
								null,
								React.createElement(
									'tr',
									null,
									React.createElement(
										'th',
										null,
										'序号'
									),
									React.createElement(
										'th',
										null,
										'分类名称'
									),
									React.createElement(
										'th',
										null,
										'创建时间'
									),
									React.createElement(
										'th',
										null,
										'相关自动标签'
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
							{ className: 'list-blank-holder' },
							React.createElement(
								'span',
								null,
								'暂无分类标签，',
								React.createElement(
									'span',
									{ className: 'add', onClick: function onClick() {
											return dispatch(openCateEditBox(null));
										} },
									'立即添加'
								)
							)
						),
						React.createElement(Pagination, { current: cur_page, pageSize: count, total: total, className: "tc mt20" + (total / count > 1 ? '' : ' dn'), onChange: function onChange(page) {
								return dispatch(changeCatePage(page));
							} })
					)
				),
				this.renderEditBox(),
				this.renderDelModal()
			);
		}
	});

	function toProps(state) {
		state = state['manager_tag']['cateList'];
		return {
			cur_page: state.cur_page,
			list: Object.keys(state.cateById).map(function (id) {
				return state.cateById[id];
			}),
			cateById: state.cateById,
			total: state.total,
			count: state.count,
			eb_show: state.edit_box_show,
			eb_data_id: state.edit_box_data_id,
			del_show: state.del_show,
			del_id: state.del_id,
			modalErr: state.modalErr
		};
	}

	return connect(toProps)(CateTag);
});