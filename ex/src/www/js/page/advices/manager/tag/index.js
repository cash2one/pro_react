define([
	'mods',
	'api',
	paths.ex.page + '/advices/manager/tag/auto_tag.js',
	paths.ex.page + '/advices/manager/tag/cate_tag.js',
	paths.rcn.comps + '/modal/index.js',
	paths.ex.page + '/advices/manager/tag/actions.js',
	paths.rcn.util + '/rest.js'
], function(mods, api, AutoTag, CateTag, Modal, Actions, Rest){
	var React = mods.ReactPack.default;
	const {connect} = mods.ReactReduxPack;
	const {tagChangeTab, tagReceiveCate, getAutoTotal, updateAutoData, updateCateData, getCateTotal} = Actions;

	var rest = Rest.ex();

	var TagIndex = React.createClass({
		componentDidMount: function(){
			var {dispatch, tab} = this.props;
			dispatch(updateAutoData());
			dispatch(getAutoTotal());
		},
		renderTab: function(){
			const {dispatch, tab} = this.props;
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
			return (
				<div className="c-nav">
					<div className="item active">
						<span>自动标签</span>
					</div>
				</div>
			)
		},
		renderTable: function(){
			const {tab, cateList, autoList, dispatch} = this.props;
			if(tab == 'cate'){
				return <CateTag />
			} else if(tab == 'auto'){
				return <AutoTag />
			}
		},
		render: function(){
			return (
				<div className="advices-manager-tag-v2 pb20">
					{this.renderTable()}
				</div>
			)
		}
	});

	function toProps(state){
		state = state.manager_tag
		return {
			tab: state.tab
		};
	}

	return connect(toProps)(TagIndex)
})