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

	var rest = Rest.ex2(),
		restR = Rest.rcn(),
		restReports = Rest.reports();

	var restIndex = Rest.index({
		stringifyData: false
	});

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

	var Edit = React.createClass({
		getInitialState(){
			return {
				uuid: null,
				tips: '',
				save: {},
				data: {},
				loading: false
			}
		},
		componentWillMount(){
			var uuid = this.props.location.query.uuid;
			if(uuid) this.setState({uuid});
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
				this.editStatus();
				this.c = setInterval(() => {
					this.editStatus();
				}, 60 * 1000);
			} else {
				this.load(1);
				let yes = fecha.format(new Date().getTime() - 24 * 3600 * 1000, 'YYYY-MM-DD');
				restR.user.read().done(data => {
					this.load(0);
					this.setState({save: {
						status: 1,
						version: 1,
						info: {},
						begin_at: yes,
						end_at: yes,
						title: (data.company || '') + '舆情监测日报'
					}}, this.getData)
				})
			}
		},
		componentWillUnmount(){
			if(this.c){
				restReports.edit.update('ok', {
					uuid: this.state.uuid
				});
				clearInterval(this.c);
				this.c = null;
			}
		},
		editStatus(){
			rest.reports.update('edit', {
				uuid: this.state.uuid
			});
		},
		contextTypes: {
			router: React.PropTypes.object.isRequired
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
		saveHandler(){
			var save = $.extend(true, {}, this.state.save);
			if(save.status == 1) save.status = 2;
			save = u(save, {
				info: {
					$apply: info => {
						return u(info, {
							focus_articles: {
								$set: this.refList.getList().map(item => {
									return {
										uuid: item.uuid,
										similar_count: item.similar_count
									}
								})
							}
						})
					}
				}
			})
			this.load(1);
			save.host = window.location.origin;
			rest.reports.create(save).done(data => {
				this.load(0);
				if(this.state.uuid){
					restReports.edit.update('ok', {
						uuid: this.state.uuid
					});
				} else {
					let loc = $.extend(true, {}, this.props.location, {query: {uuid: data.uuid}});
					this.context.router.replace(loc);
				}
				this.context.router.push({
					pathname: 'report/view',
					query: {
						uuid: data.uuid
					}
				});
			})
		},
		render(){
			var save = this.state.save,
				saveInfo = save.info || {},
				data = this.state.data,
				editTitle = val => {
					this.setState({save: $.extend({}, this.state.save, {title: val})});
				},
				editBe = val => {
					let begin_at = val[0],
						end_at = val[1];
					this.setState({save: $.extend({}, this.state.save, {begin_at, end_at})}, () => this.getData());
				},
				editDesc = val => this.setState({
					save: u(this.state.save, {
						info: {
							$apply: info => {
								return u(info, {
									$merge: {
										summaryDesc: val
									}
								})
							}
						}
					})
				}),
				select = art => {
					this.setState({
						save: u(this.state.save, {
							info: {
								$apply: info => {
									return u(info, {
										'focus_articles': {
											$apply: fa => {
												fa = fa instanceof Array ? fa : [];
												return u(fa, {
													$push: [art]
												})
											}
										}
									})
								}
							}
						})
					})
				},
				unselect = art => {
					let list = this.state.save.info.focus_articles, idx;
					list.forEach((item, i) => {
						if(item.uuid == art.uuid)
							idx = i;
					})
					if(idx != undefined){
						this.setState({
							save: u(this.state.save, {
								info: {
									$apply: info => {
										return u(info, {
											'focus_articles': {
												$splice: [[idx, 1]]
											}
										})
									}
								}
							})
						})
					}
				}
			return (
				<div className="advices-base-report-detail-v2">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<Title save={save} editConfirm={editTitle} editBe={editBe} />
							</div>
							<div style={{'padding-bottom': '40px'}}>
								<div className="group">
									<div className="group-title">
										<span>日报综述</span>
									</div>
									<div className="group-con">
										<div className="summary-part">
											<textarea value={saveInfo.summaryDesc || ''} className="form-control" placeholder="请输入综述..." onChange={e => editDesc(e.target.value)} />
											<span className="iconfont icon-duihua"></span>
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
										<ArtList ref={r => this.refList = r} data={data} save={save} select={select} unselect={unselect} />
									</div>
								</div>
							</div>
							<div className="panel-footer tr">
								<a className="btn btn-primary btn-lg" onClick={this.saveHandler}>保存&预览</a>
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
				</div>
			)
		}
	})

	return Edit;
})