define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/base/report/select.js',
	paths.rcn.plu + '/fecha.min.js',
	paths.rcn.comps + '/loader.js',
	paths.ex.util + '/parse.js',
	paths.rcn.comps + '/modal.js',
	paths.ex.page + '/advices/base/report/platform.js',
	paths.ex.page + '/advices/base/report/index-part.js',
	paths.ex.page + '/advices/base/report/art.js',
	paths.rcn.lib + '/bootstrap.min.js'
], function(mods, Rest, DropDown, fecha, Loader, Parse, Modal, PlatForm, Index, ArtList){
	const React = mods.ReactPack.default;
	const Link = mods.RouterPack.Link;
	const RangeCal = mods.RangeCal;
	const Pagination = mods.Pagination;
	const TransG = mods.TransGroup.default;
	const u = mods.u;

	var rest = Rest.ex2();

	var restIndex = Rest.index({
		stringifyData: false
	});

	var restR = Rest.rcn();

	const emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	}

	var Title = React.createClass({
		getInitialState(){
			return {
				edit: false
			}
		},
		editAction(e){
			this.props.editConfirm(e.target.value.slice(0,20));
			this.setState({edit: false});
		},
		render(){
			var save = this.props.save,
				edit = () => {
					this.setState({edit: true}, () => {
						let input = this.refs.input;
						input.focus();
						if(input.setSelectionRange)
							input.setSelectionRange(input.value.length, input.value.length);
						else if(input.createTextRange){
							let range = input.createTextRange();
							range.collapse(true);
							range.moveEnd('character', input.length);
							range.moveStart('character', input.length);
							range.select();
						}
					});
				};

			if(this.state.edit == false){
				return (
					<h3 className="panel-title report-title">
						<div className="txt notedit" onClick={edit}>
							<input type="text" className="form-control" value={save.title}/>
							<span className="iconfont icon-bianji" />
						</div>
						<RangeCal showClear={false} className="c-time-range" value={[save.begin_at, save.end_at]} onChange={this.props.editBe} />
					</h3>
				)
			} else {
				return (
					<h3 className="panel-title report-title">
						<div className="txt">
							<span className="iconfont icon-bianji" />
							<input type="text" className="form-control" ref="input" defaultValue={save.title} onBlur={this.editAction} />
						</div>
						<RangeCal showClear={false} className="c-time-range" value={[save.begin_at, save.end_at]} onChange={this.props.editBe} />
					</h3>
				)
			}
		}
	})

	var CrisisIndex = React.createClass({
		render(){
			var cls, num = +((this.props.save.info || {}).crisisIndex || 0);
			if(num > 75)
				cls = 'c4';
			else if(num > 50)
				cls = 'c3';
			else if(num > 25)
				cls = 'c2';
			else
				cls = 'c1';

			return (
				<div className="summary-part2">
					<div className={"wrap" + ' ' + cls}>
						<div className="img" />
						<div className="num"><span>{num}</span></div>
						<div className="txt"><span>危机指数</span></div>
					</div>
				</div>
			)
		}
	})

	var View = React.createClass({
		getInitialState(){
			return {
				uuid: null,
				tips: '',
				save: {info: {}},
				data: {},
				loading: false,
				shareImg: '',
				shareUrl: ''
			}
		},
		componentWillMount(){
			var uuid = this.props.location.query.uuid;
			if(uuid) this.setState({uuid});
		},
		contextTypes: {
			router: React.PropTypes.object.isRequired
		},
		componentDidMount(){
			$('.frame-body-right').scrollTop(0);
			if(this.state.uuid){
				this.load(1);
				rest.report.read({uuid: this.state.uuid}).done(data => {
					this.load(0);
					if(data.result){
						let info = data.data.info;
						if(info == undefined)
							data.data.info = {};
						this.setState({
							save: data.data
						}, this.getData);
					}
				});
				restR.user.read().done(data => {
					this.setState({company_uuid: data.company_uuid});
				})
			}
		},
		getData(){
			var save = this.state.save, q = [];
			this.load(1);
			// 获取危机指数
			q.push(rest.article.agg.read('query', {
				result: 'emotion',
				emotion: 'manual_positive,manual_negative,manual_neutral',
				date: save.begin_at + ',' + save.end_at,
				uniq: true,
			}).done(data => {
				if(data.result){
					let neg = data.data.emotion.filter(item => item.param == 'negative');
					neg = neg[0] ? neg[0].count : 0;
					this.setState({save: u(this.state.save, {
						info: {
							$apply: info => u(info, {
								$merge: {
									crisisIndex: neg
								}
							})
						}
					})});
				}
			}))
			// 获取舆情数据
			var handler = k => {
				return rest.article.agg.read('query', {
					result: 'emotion',
					platform: k,
					emotion: 'manual_positive,manual_negative,manual_neutral',
					date: save.begin_at + ',' + save.end_at,
					uniq: true
				}).done(data => {
					if(data.result){
						let obj = {};
						data.data.emotion.forEach(item => {
							obj[item['param']] = item['count'];
						});
						obj['positive'] = obj['positive'] || 0;
						obj['negative'] = obj['negative'] || 0;
						obj['neutral'] = obj['neutral'] || 0;
						this.setState({save: u(this.state.save, {
							info: {
								$apply: info => {
									info = info instanceof Object ? info : {}
									return u(info, {
										'articles_statis': {
											$apply: as => {
												as = as instanceof Object ? as : {};
												return u(as, {
													$merge: {
														[k]: obj
													}
												})
											}
										}
									})
								}
							}
						})})
					}
				})
			}
			['微信', '今日头条', '百度百家', 'all'].forEach(k => q.push(handler(k)));

			// 获取指数数据
			q.push(restIndex.keywords.read().done(data => {
				if(data){
					let map = data.reduce((o, item) => {
						o[item['id']] = item['keyword']
						return o;
					}, {});
					data = data.map(item => item.id);
					restIndex.keywords.read('data', {
						k: data,
						days: 30,
						from: save.end_at
					}).done(dat => {
						dat = dat.data || {};
						let company = {};

						for(let k in dat){
							for(let c in dat[k]){
								if(c == 'day') continue;
								if(company[c] == undefined)
									company[c] = {};
								company[c][map[k]] = dat[k][c];
								company['day'] = dat[k]['day'];
							}
						}

						this.setState({save: u(this.state.save, {
							info: {
								$apply: info => u(info, {
									index: {
										$set: company
									}
								})
							}
						})})
					})
				}
			}));

			q.push(rest.article.data.read('query', {
				emotion: 'manual_negative',
				date: save.begin_at + ',' + save.end_at,
				uniq: true
			}).done(data => {
				if(data.result){
					this.setState({data: u(this.state.data, {
						focus_articles: {
							$set: data.data
						}
					})});
					if(save.status == 1){
						this.setState({save: u(this.state.save, {
							info: {
								$apply: info => {
									return u(info, {
										focus_articles: {
											$set: data.data
										}
									})
								}
							}
						})})
					}
				}
			}));
			$.when.apply(null, q).always(() => this.load(0));
		},
		load(b){
			this.setState({loading: b});
		},
		publishHandler(){
			var save = this.state.save;
			this.load(1);
			rest.reports.update({
				uuid: save.uuid,
				status: 3
			}).done(data => {
				this.load(0);
				if(data.result){
					this.setState({save: u(this.state.save, {$merge: {status: 3}})});
					$('#publishModal').modal('show');
					// this.getShareImg();
				}
			})
		},
		shareHandler(){
			$('#shareModal').modal('show');
			// this.getShareImg();
		},
		getShareImg(){
			// var save = this.state.save;
			// rest.reports.read('share_url', {
			// 	uuid: save.uuid
			// }).complete(data => {
			// 	this.setState({shareImg: data.responseText})
			// })
		},
		openTips(tips){
			this.setState({tips});
			$('#tipModal').modal('show');
			setTimeout(() => {
				$('#tipModal').modal('hide');
			}, 800);
		},
		render(){
			var save = this.state.save,
				saveInfo = save.info || {},
				data = this.state.data;
			return (
				<div className="advices-base-report-detail-v2">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title report-title">
									<span className="title">{save.title}</span>
									{
										save.begin_at != save.end_at ? <span className="date">{save.begin_at + '至' + save.end_at}</span> : <span className="date">{save.begin_at}</span>
									}
								</h3>
							</div>
							<div style={{'padding-bottom': '40px'}}>
								<div className="group">
									<div className="group-title">
										<span>日报综述</span>
									</div>
									<div className="group-con">
										<div className="ovh summary-part">
											<span className="iconfont icon-duihua fl"></span>
											<p className="ovh">{save.info.summaryDesc || ''}</p>
										</div>
									</div>
								</div>
								<div className="group">
									<div className="group-title">
										<span>危机指数</span>
									</div>
									<div className="group-con">
										<CrisisIndex save={save} />
									</div>
								</div>
								<div className="group">
									<div className="group-title">
										<span>舆情数据</span>
									</div>
									<div className="group-con">
										<PlatForm save={save} />
									</div>
								</div>
								<div className="group">
									<div className="group-title">
										<span>搜索指数</span>
									</div>
									<div className="group-con noborder">
										<Index save={save} />
									</div>
								</div>
								<div className="group">
									<div className="group-title">
										<span>文章摘录</span>
									</div>
									<div className="group-con">
										<div className="art-part">
											{
												saveInfo.focus_articles && saveInfo.focus_articles.length > 0 ? (
													<ul>
														{
															(saveInfo.focus_articles || []).map((art, idx) => {
																let title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
																let pn = (art.from || {}).platform_name || '', media_pre, media_end = (art.from || {}).media || '';
																if(pn == '待定' || pn == '')
																	media_pre = '';
																else
																	media_pre = pn + '：';

																return (
																	<li ref={idx}>
																		<div className="title">
																			<a href={art.url} target="_blank" title={title}>{Parse.limit(title, 40)}</a>
																		</div>
																		<div className="infos">
																			<span>{Parse.time(art.publish_at)}</span>
																			<span>{media_pre + media_end}</span>
																			<span>{emotMap[art.emotion] || ''}</span>
																			<div className="tool">
																				<span>{'相同文章：' + (art.similar_count || 0) + '篇'}</span>
																			</div>
																		</div>
																	</li>
																)
															})
														}
													</ul>
												) : <div className="list-blank-holder">暂无数据</div>
											}
										</div>
									</div>
								</div>
							</div>
							<div className="panel-footer tr">
								{
									this.state.save.status == 3 ? <a className="btn btn-primary btn-lg" onClick={this.shareHandler}>分享</a> : <a className="btn btn-primary btn-lg" onClick={this.publishHandler}>发布</a>
								}
								<span className="btn btn-default btn-lg ml10" onClick={() => window.history.go(-1)}>取消</span>
							</div>
						</div>
					</div>
					<Modal id="tipModal" modalSm noBtn>
						<div className="m-msg">
							<p>{this.state.tips}</p>
						</div>
					</Modal>
					<Loader show={this.state.loading} fix />
					<Modal id="publishModal" modalSm title="日报发布" noClose confirmTxt="关闭" confirm={() => {$('#publishModal').modal('hide');this.getData()}} noDismiss>
						<div className="publish-wrap">
							<p>日报已成功发布。</p>
							<p>
								您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。
								<a target="_blank" className="intxt" href={save.share_url || ''}>
									<span className="iconfont icon-lianjie mr5" />
									<span className="vm">网页链接</span>
								</a>
							</p>
							<div className="code">
								<div className="img" style={{backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (save.uuid || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')'}} />
								<span className="db">微信二维码</span>
							</div>
						</div>
					</Modal>
					<Modal id="shareModal" modalSm title="日报分享" noClose confirmTxt="关闭" noDismiss confirm={() => $('#shareModal').modal('hide')}>
						<div className="publish-wrap">
							<p>
								您可打开微信，使用“扫一扫”，扫描以下二维码将日报分享到微信平台。
								<a target="_blank" className="intxt" href={save.share_url || ''}>
									<span className="iconfont icon-lianjie mr5" />
									<span className="vm">网页链接</span>
								</a>
							</p>
							<div className="code">
								<div className="img" style={{backgroundImage: 'url(' + '/ex/api/v2/reports/share_url?uuid=' + (save.uuid || '') + '&company_uuid=' + (this.state.company_uuid || '') + '&user_token=' + $.cookie('user_token') + ')'}} />
								<span className="db">微信二维码</span>
							</div>
						</div>
					</Modal>
				</div>
			)
		}
	})

	return View;
})