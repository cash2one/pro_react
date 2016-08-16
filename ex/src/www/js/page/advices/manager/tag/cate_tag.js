define([
	'mods',
	paths.ex.page + '/advices/manager/tag/cate_edit_box.js',
	paths.ex.page + '/advices/manager/tag/actions.js',
	paths.rcn.comps + '/modal/index.js'
], function(mods, EditBox, Actions, Modal){
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	const {connect} = mods.ReactReduxPack;
	var {changeCatePage, openCateEditBox, closeCateEditBox, modifyCate, createCate, openCateDelModal, delCate, closeCateDelModal} = Actions;

	var CateTag = React.createClass({
		renderList: function(){
			const {list, dispatch} = this.props;
			var nodes = list.map((item, idx) => {
				return (
					<tr key={idx}>
						<td>{idx + 1}</td>
						<td>
							<span>{item.name}</span>
						</td>
						<td>
							<span>{item.last_at}</span>
						</td>
						<td className="tc pl10 pr10 pt10 pb10">
							{
								item.keywords.map((kw, kw_i) => {
									let name = kw.name;
									name = name.length > 6 ? name.slice(0, 6) + '...' : name;
									return <span className="at-tag" key={kw_i} title={kw.name}>{name}</span>
								})
							}
						</td>
						<td>
							<span className="ml5 mr5 iconfont icon-pencil" title="编辑" onClick={() => {dispatch(openCateEditBox(item.id))}} />
							<span className="ml5 mr5 iconfont icon-lajitong" title="删除" onClick={() => dispatch(openCateDelModal(item.id))} />
						</td>
					</tr>
				)
			})

			return nodes;
		},
		renderEditBox: function(){
			const {dispatch, eb_show, eb_data_id, cateById, modalErr} = this.props;
			if(eb_show){
				var defaults = {
					name: '',
					keywords: []
				}
				if(eb_data_id != null){
					// modify
					return <EditBox data={cateById[eb_data_id]} errTxt={modalErr} onConfirm={data => {
						var keywords = data.keywords.map(item => {
							return {
								id: item.id,
								name: item.name
							}
						});
						dispatch(modifyCate(eb_data_id, {keywords}));
					}} onCancel={() => dispatch(closeCateEditBox())} />
				} else {
					// create
					return <EditBox data={defaults} errTxt={modalErr} onConfirm={data => dispatch(createCate(data))} onCancel={() => dispatch(closeCateEditBox())} />
				}
			} else {
				return null
			}
		},
		renderDelModal: function(){
			const {del_show, del_id, cateById, dispatch} = this.props;
			if(del_id && del_show){
				return (
					<Modal title="删除分类" show={del_show} confirm={() => dispatch(delCate(del_id))} dismiss={() => dispatch(closeCateDelModal())}>
						<div className="m-tip">
							<p>确定删除{cateById[del_id]['name']}?</p>
							<p className="tipTxt2">（确认删除后，此分类下的数据将一并删除）</p>
						</div>
					</Modal>
				)
			}
		},
		render: function(){
			const {cur_page, dispatch, total, count, eb_show, list} = this.props;
			return (
				<div>
					<div className="c-tool">
						<div className="fr">
							{
								eb_show ? null : <button className="c-button" onClick={() => dispatch(openCateEditBox(null))}>新建分类</button>
							}
						</div>
					</div>
					<div className="content pt10">
						<div className="w1200">
							{
								list.length > 0 ? (
									<table className="c-table">
										<colgroup width="10%"></colgroup>
										<colgroup width="20%"></colgroup>
										<colgroup width="20%"></colgroup>
										<colgroup width="35%"></colgroup>
										<colgroup width="15%"></colgroup>
										<thead>
											<tr>
												<th>序号</th>
												<th>分类名称</th>
												<th>创建时间</th>
												<th>相关自动标签</th>
												<th>操作</th>
											</tr>
										</thead>
										<tbody>
											{this.renderList()}
										</tbody>
									</table>
								) :
								(
									<div className="list-blank-holder">
										<span>暂无分类标签，<span className="add" onClick={() => dispatch(openCateEditBox(null))}>立即添加</span></span>
									</div>
								)
							}
							<Pagination current={cur_page} pageSize={count} total={total} className={"tc mt20" + (total / count > 1 ? '' : ' dn')} onChange={page => dispatch(changeCatePage(page))} />
						</div>
					</div>
					{this.renderEditBox()}
					{this.renderDelModal()}
				</div>
			)
		}
	});

	function toProps(state){
		state = state['manager_tag']['cateList'];
		return {
			cur_page: state.cur_page,
			list: Object.keys(state.cateById).map(id => state.cateById[id]),
			cateById: state.cateById,
			total: state.total,
			count: state.count,
			eb_show: state.edit_box_show,
			eb_data_id: state.edit_box_data_id,
			del_show: state.del_show,
			del_id: state.del_id,
			modalErr: state.modalErr
		}
	}

	return connect(toProps)(CateTag)
})