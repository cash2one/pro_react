define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/base/report/select.js',
	paths.rcn.plu + '/fecha.min.js',
	paths.rcn.comps + '/loader.js',
	paths.ex.util + '/parse.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.lib + '/bootstrap.min.js'
], function(mods, Rest, DropDown, fecha, Loader, Parse, Modal){
	const React = mods.ReactPack.default;
	const Link = mods.RouterPack.Link;
	const RangeCal = mods.RangeCal;
	const Pagination = mods.Pagination;
	const TransG = mods.TransGroup.default;

	var rest = Rest.ex2();
	var restR = Rest.rcn();

	var ListItem = React.createClass({
		getInitialState(){
			return {
				hover: false
			}
		},
		render(){
			const {data} = this.props;
			return (
				<div className="col-xs-3">
					<div className="item">
						<span className="iconfont icon-lajitong del-btn" onClick={() => this.props.delete && this.props.delete(data.uuid)} />
						<div className="top">
							<p className="name">{data.title}</p>
							<p className="date">{data.begin_at}至{data.end_at}</p>
							<TransG transitionName="tipshow" transitionEnterTimeout={100} transitionLeaveTimeout={100}>
								{
									this.state.hover ? (
										<div className="tip">
											{
												data.updater.length > 0 ? (
													<p className="p">{data.updater || ''}修改于{Parse.time((data.update_at || '').replace(/\-/g, '.'))}</p>
												) : <p className="p">{data.creator || ''}创建于{Parse.time((data.create_at || '').replace(/\-/g, '.'))}</p>
											}
											<p className="p">
												<span className="iconfont icon-renyuan" />
												<span>创建人：{data.creator}</span>
											</p>
										</div>
									) : null
								}
							</TransG>
						</div>
						<div className="btns">
							<span onClick={() => this.props.edit(data.uuid)} className="btn btn-xs pl10 pr10 btn-default" onMouseEnter={() => this.setState({hover: true})}  onMouseLeave={() => this.setState({hover: false})}>
								<span className="iconfont icon-edit-copy edit"></span>
								<span className="txt">编辑</span>
							</span>
							{
								data.status != 3 ? (
									<a className="btn btn-xs pl10 pr10 btn-default" onClick={() => this.props.publish && this.props.publish(data.uuid)}>
										<span className="iconfont icon-fabu publish"></span>
										<span className="txt">发布分享</span>
									</a>
								) : (
									<a className="btn btn-xs pl10 pr10 btn-default" onClick={() => this.props.share && this.props.share(data.uuid)}>
										<span className="iconfont icon-fabu publish"></span>
										<span className="txt">分享</span>
									</a>
								)
							}
						</div>
					</div>
				</div>
			)
		}
	})

	var List = React.createClass({
		getInitialState(){
			var range = this.getBe();
			return {
				begin_at: range[0],
				end_at: range[1],
				beg: 0,
				count: 20,
				total: 0,
				list: {},
				loading: true,
				delId: '',
				tips: '',

				shareImg: '',
				publishId: ''
			}
		},
		componentDidMount(){
			this.getData();
		},
		contextTypes: {
			router: React.PropTypes.object.isRequired
		},
		getData(){
			this.load(1);
			$.when(this.getListData(), this.getPage()).always(() => this.load(0));
		},
		getListData(){
			const {begin_at, end_at, beg, count} = this.state;
			return rest.reports.read({
				begin_at,
				end_at,
				beg,
				count
			}).done(data => {
				this.setState({
					list: data.reduce((obj, item, idx) => {
						item._i = idx;
						obj[item.uuid] = item;
						return obj;
					}, {})
				})
			});
		},
		getPage(){
			const {begin_at, end_at} = this.state;
			return rest.reports.read('count', {begin_at, end_at}).done(data => this.setState({total: data.count}));
		},
		getBe(){
			var end = new Date().getTime(), delta = 29 * 24 * 3600 * 1000,
				begin = end - delta;
			return [fecha.format(new Date(begin), 'YYYY-MM-DD'), fecha.format(new Date(end), 'YYYY-MM-DD')]
		},
		load(b){
			this.setState({loading: b});
		},
		openDelModal(id){
			this.setState({delId: id});
			$('#delModal').modal('show');
		},
		delHandler(){
			rest.reports.del('del', {uuid: this.state.delId}).done(data => {
				$('#delModal').modal('hide');
				this.openTips('删除成功');
				this.getData();
			})
		},
		openTips(txt){
			this.setState({tips: txt});
			$('#tipModal').modal('show');
			setTimeout(() => $('#tipModal').modal('hide'), 800);
		},
		publish(id){
			this.load(1);
			this.setState({publishId: id}, () => {
				rest.reports.update({
					uuid: id,
					status: 3
				}).done(() => {
					this.load(0);
					this.getData();
					this.getShareImg(id);
					$('#publishModal').modal('show');
				})
			});
		},
		share(id){
			this.setState({shareId: id}, () => {
				this.getShareImg(id);
				$('#shareModal').modal('show');
			})
		},
		getShareImg(uuid){

			// rest.reports.read('share_url', {uuid}).complete(data => {
			// 	this.setState({shareImg: data.responseText})
			// })
			if(!this.state.company_uuid){
				restR.user.read().done(data => {
					this.setState({company_uuid: data.company_uuid, shareId: uuid});
				});
			} else {
				this.setState({shareId: uuid});
			}
		},
		editHandler(uuid){
			rest.reports.read('status', {uuid}).done(data => {
				if(data.result){
					this.context.router.push({
						pathname: 'report/edit',
						query: {
							uuid
						}
					})
				} else {
					this.openTips('此报表正在编辑中');
				}
			})
		},
		render(){
			var list1 = [], list2 = [];
			Object.keys(this.state.list).sort((a, b) => this.state.list[a]._i - this.state.list[b]._i).forEach(k => {
				let item = this.state.list[k];
				let {status} = item;
				if(status == 2 || status == 1)
					list1.push(item);
				else
					list2.push(item);
			});
			var jump = page => {
				this.setState({beg: (page - 1) * this.state.count, loading: 1}, () => {
					this.getListData().always(() => this.load(0));
				})
			}
			var range = val => {
				this.setState({begin_at: val[0], end_at: val[1], beg: 0}, this.getData);
			}
			return (
				<div className="advices-base-report-v3">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">报表生成</h3>
								<div>
									<Link to={{pathname: 'report/edit'}} className="btn btn-primary">新增报表</Link>
								</div>
							</div>
							<div className="date-part cf">
								<div className="fr">
									<RangeCal format="yyyy-MM-dd" value={[this.state.begin_at, this.state.end_at]} className="c-time-range" placeholder='请选择日期区间' showClear={false} onChange={val => range(val)} />
								</div>
							</div>
							<div className="content">
								{
									list1.length > 0 || list2.length > 0 ? (
										<div>
											{
												list1.length > 0 ? (
													<div className="report-group">
														<div className="hd">
															<span className="iconfont icon-weitijiao s3"></span>
															<span className="txt">未发布日报</span>
														</div>
														<div className="bd row">
															{
																list1.map(item => <ListItem share={id => this.share(id)} publish={id => this.publish(id)} delete={id => this.openDelModal(id)} data={item} edit={uuid => this.editHandler(uuid)} />)
															}
														</div>
													</div>
												) : null
											}
											{
												list2.length > 0 ? (
													<div className="report-group">
														<div className="hd">
															<span className="iconfont icon-tijiao s2"></span>
															<span className="txt">已发布日报</span>
														</div>
														<div className="bd row">
															{
																list2.map(item => <ListItem share={id => this.share(id)} publish={id => this.publish(id)} delete={id => this.openDelModal(id)} data={item} edit={uuid => this.editHandler(uuid)}/>)
															}
														</div>
													</div>
												) : null
											}
										</div>
									) : <div className="list-blank-holder"><span>暂无数据</span></div>
								}
								{
									this.state.total > this.state.count ? (
										<div className="mb30">
											<Pagination current={Math.floor(this.state.beg / this.state.count) + 1} total={this.state.total} pageSize={this.state.count} className="v2 tc" onChange={page => jump(page)} />
										</div>
									) : null
								}
							</div>
						</div>
					</div>
					<Loader show={this.state.loading} fix />
					<Modal id="delModal" modalSm confirm={() => this.delHandler()}>
						<p className="tc">您确定删除此报表吗？</p>
					</Modal>
					<Modal id="tipModal" modalSm noBtn>
						<div className="m-msg">
							<p>{this.state.tips}</p>
						</div>
					</Modal>
					<Modal id="publishModal" modalSm title="日报发布" noClose confirmTxt="关闭" confirm={() => {$('#publishModal').modal('hide');this.getData()}} noDismiss>
						<div className="publish-wrap">
							<p>日报已成功发布。</p>
							<p>
								<span>您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。</span>
								<a target="_blank" className="intxt" href={(this.state.list[this.state.shareId] || {})['share_url']}>
									<span className="iconfont icon-lianjie mr5" />
									<span className="vm">网页链接</span>
								</a>
							</p>
							<div className="code">
								<div className="img" style={{backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (this.state.shareId || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')'}} />
								<span className="db">微信二维码</span>
							</div>
						</div>
					</Modal>
					<Modal id="shareModal" modalSm title="日报分享" noClose confirmTxt="关闭" noDismiss confirm={() => $('#shareModal').modal('hide')}>
						<div className="publish-wrap">
							<p>
								<span>您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。</span>
								<a target="_blank" className="intxt" href={(this.state.list[this.state.shareId] || {})['share_url']}>
									<span className="iconfont icon-lianjie mr5" />
									<span className="vm">网页链接</span>
								</a>
							</p>
							<div className="code">
								<div className="img" style={{backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (this.state.shareId || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')'}} />
								<span className="db">微信二维码</span>
							</div>
						</div>
					</Modal>
				</div>
			)
		}
	})

	return List
})