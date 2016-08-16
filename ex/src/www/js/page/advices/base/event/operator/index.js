define([
	'mods',
	paths.ex.page + '/advices/base/event/operator/actions.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.comps + '/dropdown/index.js',
	paths.rcn.plu + '/fecha.min.js',
	paths.ex.util + '/parse.js',
	paths.rcn.lib + '/bootstrap.min.js'
], function(mods, Actions, Modal, Dropdown, fecha, Parse){
	var React = mods.ReactPack.default;
	var RangeCal = mods.RangeCal;
	var Cal = mods.Cal;
	const {connect} = mods.ReactReduxPack;
	const Link = mods.RouterPack.Link;

	const {
		fetchEventList,
		openCreateEvent,
		editModalDataTitle,
		editModalDataBegin,
		editModalDataEnd,
		editModalDataRank,
		editModalDataDetail,
		closeEventModal,
		createEvent,
		openModifyEvent,
		editModalDataBe,
		modifyEvent,
		openDelModal,
		closeDelModal,
		delEvent,
		openEndModal,
		closeEndModal
	} = Actions;

	var eventRankMap = {
		1: '一级',
		2: '二级',
		3: '三级',
		4: '普通',
	}

	var Drop = React.createClass({
		getInitialState(){
			return {open: false}
		},
		clickHandler(){
			if(!this.state.open){
				this.setState({open: true});
				$(this.refs.options).toggle(100);
				$(document).one('click', () => {
					$(this.refs.options).toggle(100);
					this.setState({open: false});
				})
			}
		},
		render(){
			return (
				<div className="dropdown-v2" ref="wrap">
					<div className="select" onClick={this.clickHandler}>
						<input type="text" className="txt" disabled value={this.props.holderTxt}/>
						<span className="ic"><span className="corner"></span></span>
					</div>
					<ul className="option none" ref="options">
						{this.props.children}
					</ul>
				</div>
			)
		}
	})

	var EventList = React.createClass({
		getInitialState: function(){
			return {
				ddTog: false
			}
		},
		componentDidMount: function(){
			const {dispatch} = this.props;
			dispatch(fetchEventList());
			this.validate();
		},
		componentDidUpdate: function(preProps){
			if (this.props.modalShow == false && preProps.modalShow == true){
				if(this.validator){
					this.validator.resetForm();
				}
			}
		},
		validate: function(){
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
				submitHandler: () => {
					this.modalConfirm()
				},
				errorPlacement: function(error, element) {
					error.appendTo(element.parent());
				}
			});
		},
		ddToggle: function(e){
			var d = $('#dd_option').css('display')
			if(d == 'none'){
				$('#dd_option').toggle(100);
				$(document).one('click', () => $('#dd_option').toggle(100))
			}
		},
		renderList: function(){
			var data = this.props.eventList;
			const {dispatch} = this.props;
			var _openModifyEvent = event => {
				$('#eventModal').modal('show');
				dispatch(openModifyEvent(event));
			}

			var nodes = data.map((event, idx) => {
				let now = Date.now(),
					begin = fecha.parse(event.begin_at, 'YYYY-MM-DD HH:mm').getTime();
				return (
					<tr key={idx}>
						<td className="tc">
							<span className="num">{idx + 1}</span>
						</td>
						<td>
							<Link to={{pathname: 'event/detail', query: {inc: event.id}, state: {event}}} className="link">{event.title}</Link>
						</td>
						<td>
							<span className="desc">{event.detail}</span>
						</td>
						<td>
							<div className="nowrap">
								<span>{Parse.time(event.begin_at)}</span>
								<span className="to">至</span>
								<span>{(event.end_at == 'none' || !event.end_at) ? '   -  ' : Parse.time(event.end_at)}</span>
							</div>
						</td>
						<td className="nowrap">
							<span className={'rank rank' + event.rank}>{eventRankMap[event.rank]}</span>
						</td>
						<td className="opers">
							{
								event.status == 1 ? <span className="iconfont icon-pencil" title="编辑" onClick={() => _openModifyEvent(event)}></span> : null
							}
							<span className="iconfont icon-lajitong" title="删除" onClick={() => {$('#delModal').modal('show');dispatch(openDelModal(event.id))}} />
							{
								(event.status == 1 && now >= begin)
								? <span className="iconfont icon-jieshu" style={{color: '#3a99d8'}} title="结案" onClick={() => {$('#endModal').modal('show');dispatch(openEndModal(event.id))}}></span> : null
							}
						</td>
					</tr>
				)
			})

			return nodes;
		},
		modalConfirm: function(){
			const {dispatch, modalFlag, modalData} = this.props;
			if(this.validator.form()){
				$('#eventModal').modal('hide');
				if(modalFlag == 'create'){
					dispatch(createEvent(modalData));
				} else if(modalFlag == 'modify') {
					dispatch(modifyEvent(modalData.id, modalData));
				}
			}
		},
		renderModal: function(){
			const {dispatch, modalShow, modalData, modalFlag, eventById, modalErr} = this.props;

			var title, now = Date.now();

			if(modalFlag == 'create'){
				title = '新增事件';
			} else if(modalFlag == 'modify') {
				title = '修改事件';
			}

			var renderSelect = () => {
				return (
					<div className="dropdown-wrap">
						<Dropdown
							optionList={[{name: '一级', value: 1}, {name: '二级', value: 2}, {name: '三级', value: 3}, {name: '普通', value: 4}]}
							selectClick={this.ddToggle}
							optionListClick={(tar) => {dispatch(editModalDataRank(tar.value));}}
							selectValue={eventRankMap[modalData.rank]}
							selectName={'rank'}
							isShowSelectList={this.state.ddTog} />
					</div>
				)
			}

			var node = (
				<Modal id="eventModal" title={title} show={modalShow} cancelEvent dismiss={() => {$('#eventModal').modal('hide');this.validator.resetForm();dispatch(closeEventModal())}} confirm={this.modalConfirm}>
					<form id="evForm" className="form-horizontal">
						<div className="form-group">
							<label htmlFor="ev_title" className="col-lg-2 control-label">事件标题</label>
							<div className="col-lg-10">
								<input type="text" className="form-control" id="ev_title" value={modalData.title} onChange={e => dispatch(editModalDataTitle(e.target.value))} name="title" />
							</div>
						</div>
						<div className="form-group">
							<label htmlFor="ev_start" className="col-lg-2 control-label">开始时间</label>
							<div className="col-lg-10">
								<Cal name="begin" zIndex={10000} id="ev_start" value={modalData.begin_at} timeSelector format={'yyyy-MM-dd HH:mm'} onChange={value => {dispatch(editModalDataBegin(value))}} onClose={() => {this.validator && this.validator.element('#evForm [name="begin"]')}} showSecond={false} className="form-control" />
							</div>
						</div>
						<div className="form-group">
							<label className="col-lg-2 control-label">事件等级</label>
							<div className="col-lg-10">
								<Drop holderTxt={eventRankMap[modalData.rank]}>
									<li className="dropdown-item" onClick={() => dispatch(editModalDataRank(1))}>一级</li>
									<li className="dropdown-item" onClick={() => dispatch(editModalDataRank(2))}>二级</li>
									<li className="dropdown-item" onClick={() => dispatch(editModalDataRank(3))}>三级</li>
									<li className="dropdown-item" onClick={() => dispatch(editModalDataRank(4))}>普通</li>
								</Drop>
							</div>
						</div>
						<div className="form-group">
							<label htmlFor="ev_desc" className="col-lg-2 control-label">事件描述</label>
							<div className="col-lg-10">
								<textarea className="form-control" id="ev_desc" rows="4" name="desc" value={modalData.detail} onChange={e => dispatch(editModalDataDetail(e.target.value))} onBlur={e => dispatch(editModalDataDetail($.trim(e.target.value)))} />
							</div>
						</div>
					</form>
				</Modal>
			)

			return node
		},
		renderDelModal: function(){
			const {delModalShow, delId, eventById, dispatch} = this.props;
			return (
				<Modal id="delModal" modalSm title="提示" dismiss={() => dispatch(closeDelModal())} confirm={() => {$('#delModal').modal('hide');dispatch(delEvent(delId))}}>
					<p className="breakall tc">{'确定删除' + (eventById[delId] || {}).title + '?'}</p>
				</Modal>
			)
		},
		renderEndModal: function(){
			const {endModalShow, endId, eventById, dispatch} = this.props;
			const event = eventById[endId] || {};
			const confirm = () => {
				let end_at = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
				$('#endModal').modal('hide');
				dispatch(modifyEvent(event.id, Object.assign({}, event, {
					status: 0,
					end_at
				})))
				dispatch(closeEndModal());
			}
			return (
				<Modal title="提示" id="endModal" modalSm show={endModalShow} dismiss={() => dispatch(closeEndModal())} confirm={confirm}>
					<div className="tc">
						<p>您确定将此事件结案吗？</p>
						<p>（事件结案后，只可查看该事件下的文章）</p>
					</div>
				</Modal>
			)
		},
		render: function(){
			const {dispatch} = this.props;
			var _openCreateEvent = () => {
				$('#eventModal').modal('show');
				dispatch(openCreateEvent());
			}
			return (
				<div className="advices-base-event-v2">
					<div className="container-fluid">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">事件处理</h3>
								<button className="btn btn-primary" onClick={_openCreateEvent}>新增事件</button>
							</div>
							{
								this.props.eventList.length > 0 ? (
									<table className="table table-striped spec">
										<thead>
											<tr>
												<th className="tc">序号</th>
												<th>标题</th>
												<th>描述</th>
												<th>起始时间</th>
												<th className="nowrap">等级</th>
												<th>操作</th>
											</tr>
										</thead>
										<tbody>
											{this.renderList()}
										</tbody>
									</table>
								) :
								(
									<div className="panel-body">
										<div className="list-blank-holder">
											<span>暂无事件，<span className="add" onClick={_openCreateEvent}>立即添加</span></span>
										</div>
									</div>
								)
							}
						</div>
						{this.renderModal()}
						{this.renderDelModal()}
						{this.renderEndModal()}
					</div>
				</div>
			)
		}
	})

	function toProps(state){
		state = state.eventList;
		return {
			eventList: Object.keys(state.eventById).map(id => state.eventById[id]),
			eventById: state.eventById,
			modalShow: state.modalShow,
			modalData: state.modalData,
			modalFlag: state.modalFlag,
			modalErr: state.modalErr,
			delId: state.delId,
			delModalShow: state.delModalShow,
			endId: state.endId,
			endModalShow: state.endModalShow
		}
	}

	return connect(toProps)(EventList)
})