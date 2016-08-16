define([
	'mods',
	paths.ex.page + '/advices/manager/tag/actions.js',
	paths.ex.page + '/advices/manager/tag/auto_edit_box.js',
	paths.rcn.comps + '/search.js',
	paths.rcn.comps + '/modal.js'
], function(mods, Actions, EditBox, Search, Modal){
	var React = mods.ReactPack.default;
	const Pagination = mods.Pagination;
	const {connect} = mods.ReactReduxPack;
	var {changeAutoPage, modifyAuto, openAutoEditBox, modifyKeyWord, createKeyWord, closeAutoEditBox, openAutoDelModal, closeAutoDelModal, delAuto, searchInput, search} = Actions;

	var Del = React.createClass({
		getInitialState(){
			return {toggle: false}
		},
		render(){
			const {del_show, del_id, autoById, dispatch} = this.props;
			let toggle = () => {
				this.setState({toggle: !this.state.toggle});
			}
			return (
				<Modal id="delModal" title="删除确认" show="del_show" modalSm cancelEvent dismiss={() => {this.setState({toggle: false});$('#delModal').modal('hide')}} confirm={() => {
					$('#delModal').modal('hide');
					dispatch(delAuto(del_id, this.state.toggle));
					this.setState({toggle: false});
				}}>
					<p className="tc">您确认删除{(autoById[del_id]||{}).name}?</p>
					{
						<div className="tc">
							<span className="cp" onClick={toggle}>
								<span className={"c-cb vm mr5" + (this.state.toggle ? ' active' : '')} />
								<span className="vm">删除此标签将删除历史文章</span>
							</span>
						</div>
					}
				</Modal>
			)
		}
	})

	var AutoTag = React.createClass({
		modifyState: function(id, status){
			const {dispatch} = this.props;
			if(status == 1)
				dispatch(modifyAuto(id, {status: 0}));
			else if(status == 0)
				dispatch(modifyAuto(id, {status: 1}));
		},
		renderList: function(){
			const {list, dispatch} = this.props;
			var nodes = list.map((item, idx) => {
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
				return (
					<tr keys={idx}>
						<td className="tc">{idx + 1}</td>
						<td>
							<span>{item.name}</span>
						</td>
						<td>
							<span className="ml5 mr5 iconfont icon-pencil" title="编辑" onClick={() => dispatch(openAutoEditBox(item.id))} />
							{
								item.status == 1
								? <span className="ml5 mr5 iconfont icon-kaishi" title="已启用" style={{color: '#3a99d8'}} onClick={() => this.modifyState(item.id, item.status)} />
								: <span className="ml5 mr5 iconfont icon-qiyong" title="已停用" onClick={() => this.modifyState(item.id, item.status)} />
							}
							<span className="ml5 mr5 iconfont icon-lajitong" title="删除" onClick={() => {
								$('#delModal').modal('show');
								dispatch(openAutoDelModal(item.id))
							}} />
						</td>
					</tr>
				)
			})

			return nodes;
		},
		renderEditBox(){
			const {eb_show, eb_data_id, autoById, dispatch, modalErr} = this.props;
			if(eb_show){
				var data = {
					name: '',
					emotion: 0,
					depend: 1,
					warn: 0,
					category: []
				}
				if(eb_data_id !== null){
					data = $.extend(true, data, autoById[eb_data_id]);
					// modify
					return <EditBox modify data={data} errTxt={modalErr} onConfirm={data => {
						let category = data.category.map(item => {
							return {id: item.id, name: item.name}
						});
						data = Object.assign(data, {category});
						dispatch(modifyKeyWord(eb_data_id, data));
					}} onCancel={() => dispatch(closeAutoEditBox())} />
				} else {
					// create
					return <EditBox create data={data} errTxt={modalErr} onConfirm={data => {
						dispatch(createKeyWord(data));
					}} onCancel={() => dispatch(closeAutoEditBox())} />
				}
			} else {
				// none
				return null
			}
		},
		renderDelModal(){
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
			return <Del {...this.props} />
		},
		render: function(){
			const {total, cur_page, count, dispatch, eb_show, isSearching, searchTxt, list} = this.props;
			return (
				<div>
					{
						eb_show ? this.renderEditBox() : (
							<div>
								<div className="panel panel-default advices-manager-tag-v2">
									<div className="panel-heading">
										<h3 className="panel-title">自动标签</h3>
										<Search placeholder="请输入您要搜索的内容" onSearch={() => dispatch(search())} onChange={e => dispatch(searchInput(e.target.value))} />
										<button className="btn btn-primary ml20" type="button" onClick={() => dispatch(openAutoEditBox(null))}>添加关键词</button>
									</div>
									{
										list.length > 0 ? (
											<table className="table table-striped spec">
												<thead>
													<th className="tc">序号</th>
													<th>关键词</th>
													{
														// <th>关联度判断</th>
														// <th>情感分析</th>
														// <th>预警</th>
													}
													<th>操作</th>
												</thead>
												<tbody>
													{this.renderList()}
												</tbody>
											</table>
										)
										: (
											<div className="list-blank-holder">
												<span>暂无关键词，<span className="add" onClick={() => dispatch(openAutoEditBox(null))}>立即添加</span></span>
											</div>
										)
									}
									<div className={"tc mt30 mb30" + (total / count > 1 ? '' : ' dn')}>
										<Pagination current={cur_page} pageSize={count} total={total} className="v2 ib" onChange={page => dispatch(changeAutoPage(page))} />
									</div>
								</div>
							</div>
						)
					}
					{this.renderDelModal()}
				</div>
			)
		}
	});

	function toProps(state){
		state = state['manager_tag']['autoList'];
		return {
			cur_page: state.cur_page,
			list: Object.keys(state.autoById).map(id => state.autoById[id]),
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
		}
	}

	return connect(toProps)(AutoTag);
})