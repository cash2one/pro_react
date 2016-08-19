require.config({
	baseUrl: 'js',
	urlArgs: 'rel=20160613',
	paths: {
		"mods": paths.ex.lib + "/combo",
		"echarts": paths.ex.plu + '/echarts.report.share'
	}
})
require([
	'mods',
	paths.ex.util + '/parse.js',
	paths.ex.page + '/advices/base/report/platform.js',
	paths.ex.page + '/advices/base/report/index-part.js',
	paths.rcn.comps + '/loader.js',
	// 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'
], function(mods, Parse, PlatForm, Index, Loader/*, wx*/){
	const React = mods.ReactPack.default;
	const ReactDOM = mods.ReactDom.default;
	const u = mods.u;

	// var rest = Rest.ex2();

	// var restIndex = Rest.index({
	// 	stringifyData: false
	// });

	// var restR = Rest.rcn();

	var rest = new $.RestClient(paths.ex.api + '/api/v2/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	rest.add('reports');
	rest.add('report');
	rest.add('article');
	rest.article.add('agg');

	var restIndex = new $.RestClient(paths.index.api + '/api/v1/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	restIndex.add('keywords');
	restIndex.keywords.add('data');

	var restR = new $.RestClient(paths.rcn.api + '/api/v1/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	restR.add('user');


	// function getSig(){
	// 	var noncestr = $.randomCode(16),
	// 		timestamp = parseInt(new Date().getTime() / 1000),
	// 		url = encodeURIComponent(window.location.href.split('#')[0]);
	// 	restR.user.read('signature', {noncestr, timestamp, url}).done(data => {
	// 		if(data.result){
	// 			wx.config({
	// 				debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	// 				appId: 'wxdb1db27ca81d84ad', // 必填，公众号的唯一标识
	// 				timestamp, // 必填，生成签名的时间戳
	// 				nonceStr: noncestr, // 必填，生成签名的随机串
	// 				signature: data.signature, // 必填，签名，见附录1
	// 				jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	// 			})
	// 		}
	// 	})
	// }

	

	// wx.ready(function(){
	// 	console.log(2)
	// })
	// wx.error(function(err){
	// 	console.log(22, err)
	// })

	// getSig();

	const emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	}

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
				blank: false,
				code: null,
				loading: true
			}
		},
		componentWillMount(){
			var code = (window.location.href.match(/\/[^\/]*$/)[0] || '').substr(1);
			this.setState({code});
		},
		componentDidMount(){
			var code = this.state.code;
			if(!code) return;
			if(code.length > 0){
				this.load(true);
				rest.reports.read('share', {code: this.state.code}).done(data => {
					if(data.result){
						let save = data.data;
						this.setState({save: data.data}, this.getData);
						// wx.onMenuShareAppMessage({
						// 	title: save.title, // 分享标题
						// 	desc: save.info.summaryDesc || '', // 分享描述
						// });
						document.title = save.title;
					}
				}).fail(data => {
					this.load(false);
					if(data.status == 410){
						this.setState({blank: true});
					}
				})
			}
		},
		getData(){
			var save = this.state.save, q = [],
				code = this.state.code;
			this.load(1);
			// 获取危机指数
			q.push(rest.article.agg.read('report', {
				result: 'emotion',
				emotion: 'manual_positive,manual_negative,manual_neutral',
				date: save.begin_at + ',' + save.end_at,
				uniq: true,
				code
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
				return rest.article.agg.read('report', {
					result: 'emotion',
					platform: k,
					emotion: 'manual_positive,manual_negative,manual_neutral',
					date: save.begin_at + ',' + save.end_at,
					uniq: true,
					code
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
			q.push(restIndex.keywords.read('report', {code}).done(data => {
				if(data){
					let map = data.reduce((o, item) => {
						o[item['id']] = item['keyword']
						return o;
					}, {});
					data = data.map(item => item.id);
					restIndex.keywords.data.read('report', {
						k: data,
						days: 30,
						from: save.end_at,
						code
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

			// q.push(rest.article.data.read('query', {
			// 	emotion: 'manual_negative',
			// 	date: save.begin_at + ',' + save.end_at,
			// 	uniq: true
			// }).done(data => {
			// 	if(data.result){
			// 		this.setState({data: u(this.state.data, {
			// 			focus_articles: {
			// 				$set: data.data
			// 			}
			// 		})});
			// 		if(save.status == 1){
			// 			this.setState({save: u(this.state.save, {
			// 				info: {
			// 					$apply: info => {
			// 						return u(info, {
			// 							focus_articles: {
			// 								$set: data.data
			// 							}
			// 						})
			// 					}
			// 				}
			// 			})})
			// 		}
			// 	}
			// }));
			$.when.apply(null, q).always(() => this.load(0));
		},
		load(b){
			this.setState({loading: b});
		},
		render(){
			var save = this.state.save,
				saveInfo = save.info || {},
				data = this.state.data;
			return (
				<div className="advices-base-report-share">
					{
						this.state.blank ? <div className="blank-part"><div className="list-blank-holder">未找到此日报，可能日报已被删除。</div></div> : (
							<div className="con">
								<div className="hd-part">
									<div className="title">
										<span>{save.title}</span>
									</div>
									<div className="subtitle">
										{
											save.begin_at != save.end_at ? <span className="date">{save.begin_at + '至' + save.end_at}</span> : <span className="date">{save.begin_at}</span>
										}
									</div>
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
											<Index save={save} m />
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
							</div>
						)
					}
					<Loader show={this.state.loading} />
				</div>
			)
		}
	})

	ReactDOM.render(<View />, document.getElementById('main'));
})