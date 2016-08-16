'use strict';

define(['mods', 'api', paths.ex.page + '/advices/manager/tag/auto_tag.js', paths.ex.page + '/advices/manager/tag/cate_tag.js', paths.rcn.comps + '/modal/index.js', paths.ex.page + '/advices/manager/tag/actions.js', paths.rcn.util + '/rest.js'], function (mods, api, AutoTag, CateTag, Modal, Actions, Rest) {
	var React = mods.ReactPack.default;
	var connect = mods.ReactReduxPack.connect;
	var tagChangeTab = Actions.tagChangeTab;
	var tagReceiveCate = Actions.tagReceiveCate;
	var getAutoTotal = Actions.getAutoTotal;
	var updateAutoData = Actions.updateAutoData;
	var updateCateData = Actions.updateCateData;
	var getCateTotal = Actions.getCateTotal;


	var rest = Rest.ex();

	var TagIndex = React.createClass({
		displayName: 'TagIndex',

		componentDidMount: function componentDidMount() {
			var _props = this.props;
			var dispatch = _props.dispatch;
			var tab = _props.tab;

			dispatch(updateAutoData());
			dispatch(getAutoTotal());
		},
		renderTab: function renderTab() {
			var _props2 = this.props;
			var dispatch = _props2.dispatch;
			var tab = _props2.tab;
			// 暂时隐藏分类标签
			// if(tab == 'auto'){
			// 	return (
			// 		<div className="c-nav">
			// 			<div className="item active">
			// 				<span>自动标签</span>
			// 			</div>
			// 			<div className="item" onClick={() => dispatch(tagChangeTab('cate'))}>
			// 				<span>分类标签</span>
			// 			</div>
			// 		</div>
			// 	)
			// } else if(tab == 'cate') {
			// 	return (
			// 		<div className="c-nav">
			// 			<div className="item" onClick={() => dispatch(tagChangeTab('auto'))}>
			// 				<span>自动标签</span>
			// 			</div>
			// 			<div className="item active">
			// 				<span>分类标签</span>
			// 			</div>
			// 		</div>
			// 	)
			// }

			return React.createElement(
				'div',
				{ className: 'c-nav' },
				React.createElement(
					'div',
					{ className: 'item active' },
					React.createElement(
						'span',
						null,
						'自动标签'
					)
				)
			);
		},
		renderTable: function renderTable() {
			var _props3 = this.props;
			var tab = _props3.tab;
			var cateList = _props3.cateList;
			var autoList = _props3.autoList;
			var dispatch = _props3.dispatch;

			if (tab == 'cate') {
				return React.createElement(CateTag, null);
			} else if (tab == 'auto') {
				return React.createElement(AutoTag, null);
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'advices-manager-tag-v2 pb20' },
				this.renderTable()
			);
		}
	});

	function toProps(state) {
		state = state.manager_tag;
		return {
			tab: state.tab
		};
	}

	return connect(toProps)(TagIndex);
});