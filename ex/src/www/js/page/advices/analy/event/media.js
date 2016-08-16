define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.rcn.util + '/env.js',
	paths.ex.page + '/advices/analy/event/chart.js',
	paths.ex.page + '/advices/analy/event/helpers.js',
	paths.rcn.plu + '/fecha.min.js',
	paths.rcn.comps + '/loader.js',
	paths.rcn.comps + '/tooltip.js'
], function(mods, R, env, Chart, Helper, fecha, Loader, Tooltip){
	var React = mods.ReactPack.default,
		rmedia = R.media(),
		ruser = R.rcn().user,
		rest = R.ex2(),
		RangeCal = mods.RangeCal;

	var Media = React.createClass({
		getInitialState: function(){
			var range = this.getFromTo(0);
			return {
				type: '',
				srcData: [],
				srcMidsData: {},
				srcMidsSelect: '',
				artTotal: 0,
				negTotal: 0,
				user: {},
				mediaCount: 0,
				loadEnd: false,
				loadtxt: '获取数据中......',
				loadTotal: '',
				loadStep: 0,
				isBlank: false,
				eventId: '',
				timeRange: 'today',
				from: range[0],
				to: range[0]
			}
		},
		componentWillMount: function(){
			var type = this.props.route.tp;
			if(type == 'event'){
				let eventId = this.props.location.query.event_id;
				this.setState({type, eventId, from: '', to: ''});
			} else if (type == 'company'){
				this.setState({type});
			}
		},
		componentDidMount: function(){
			this.setState({loadTotal: 2});
			ruser.read().done(data => {
				if(this.state.type == 'event' && this.state.eventId != undefined){
					this.getData();
					this.setState({user: data}, this.getMediaCount);
				} else if(this.state.type == 'company'){
					this.setState({user: data}, () => {
						this.getData();
						this.getMediaCount();
					});
				}
			});
		},
		getData: function(){
			var opt = {}, type = this.state.type, id;
			if(type == 'event'){
				id = this.state.eventId;
				opt.inc = id;
			} else {
				id = this.state.user.company_uuid;
				opt.date = this.state.from + ',' + this.state.to;
			}

			rest.article.count.read('query', opt).done(dat => {
				if(dat.result == true){
					if(dat.count == 0){
						this.setState({
							loadEnd: true,
							isBlank: true
						})
					} else {
						let params = {}
						if(type == 'company'){
							params = {
								from: this.state.from,
								to: this.state.to
							}
						}
						rmedia.dist[type].read('category', id, params).done(data => {
							var artTotal = dat.count;
							this.setState({
								srcData: data,
								artTotal,
								srcMidsSelect: (data[0] || {}).category,
								negTotal: Helper.zhengfu(data).negTotal,
								loadtxt: '统计数据加载完毕......',
								loadStep: this.state.loadStep + 1,
								isBlank: false
							}, this.getSrcMidsData);
						});
					}
				}
			})
		},
		getMediaCount: function(){
			var type = this.state.type, opts = {};
			if(type == 'event'){
				opts['event_id'] = this.state.eventId;
			} else {
				opts.from = this.state.from;
				opts.to = this.state.to;
			}
			opts['company_uuid'] = this.state.user['company_uuid'];

			rmedia[type].read('count', opts).done(({count = 0}) => {
				this.setState({
					mediaCount: count
				})
			})
		},
		componentDidUpdate: function(){
			if(this.state.loadTotal == this.state.loadStep + 1){
				setTimeout(() => {
					this.setState({
						loadStep: this.state.loadTotal,
						loadtxt: '图表绘制完成'
					}, () => {
						setTimeout(() => {
							this.setState({
								loadEnd: true
							})
						}, 500)
					})
				}, 1000)
			}
		},
		getSrcMidsData: function(){
			var id, type;
			if(this.state.type == 'event' && this.state.eventId != undefined){
				id = this.state.eventId;
				type = 'event';
			} else if(this.state.type == 'company'){
				id = this.state.user.company_uuid;
				type = 'company';
			}

			var src = this.state.srcMidsSelect;

			if(id){
				rmedia.dist[type].read('media', id, {
					category: src,
					count: 20,
					from: this.state.from,
					to: this.state.to
				}).done(data => {
					let srcMidsData = this.state.srcMidsData;
					srcMidsData = $.extend({}, srcMidsData, {[src]: data});
					this.setState({srcMidsData});
				})
			}
		},
		handleSrcClick: function(src){
			this.setState({srcMidsSelect: src}, this.getSrcMidsData);
		},
		toggleTimeRange: function(timeRange){
			this.setState({loadStep: 0, loadEnd: false});
			if(typeof timeRange == 'string'){
				var range;
				if(timeRange == 'today')
					range = this.getFromTo(0);
				else if(timeRange == 'week')
					range = this.getFromTo(6);
				else if(timeRange == 'month')
					range = this.getFromTo(29);

				this.setState({
					timeRange,
					from: range[0],
					to: range[1]
				}, () => {
					this.getData();
					this.getMediaCount();
				})
			} else {
				let begin = timeRange[0],
					end = timeRange[1];
				this.setState({
					timeRange: '',
					from: begin,
					to: end
				}, () => {
					this.getData();
					this.getMediaCount();
				})
			}
		},
		getFromTo: function(delta){
			var end = Date.now(), begin;
			delta = delta * 24 * 3600 * 1000;
			begin = end - delta;
			return [fecha.format(new Date(begin), 'YYYY-MM-DD'), fecha.format(new Date(end), 'YYYY-MM-DD')];
		},
		jump: function(params){
			if(this.state.type == 'event'){
				params.inc = this.state.eventId;
				window.location.href = paths.links.eventDetail + '?' + Object.keys(params).map(k => k + '=' + params[k]).join('&');
			} else {
				window.location.href = paths.links.allArticles + '?' + Object.keys(params).map(k => k + '=' + params[k]).join('&');
			}
		},
		renderZaiti: function(){
			var node, data = Helper.zaiti(this.state.srcData);

			node = <Chart.c2 height="415" options={data.opts} ref={r => {
				if(r){
					r.ins().off('click');
					r.ins().on('click', (a) => {
						this.jump({
							product: a.name,
							date: this.state.from + ',' + this.state.to
						})
					})
				}
			}} />

			return node;
		},
		renderZhengfu: function(){
			var node;

			node = <Chart.c2 height="415" options={Helper.zhengfu(this.state.srcData).opts} ref={r => {
				if(r){
					r.ins().off('click');
					r.ins().on('click', (a) => {
						let emot = a.seriesName;
						emot = emot == '正面' ? 'positive' : emot == '中立' ? 'neutral' : emot == '负面' ? 'negative' : '';
						this.jump({
							product: a.name,
							emotion: emot,
							date: this.state.from + ',' + this.state.to
						})
					})
				}
			}} />

			return node;
		},
		renderSrcMids: function(){
			var node, data = this.state.srcMidsData[this.state.srcMidsSelect];

			node = <Chart.c2 options={Helper.emot(data)} height={500} ref={r => {
				if(r){
					r.ins().off('click');
					r.ins().on('click', (a) => {
						let emot = a.seriesName, mid = '';
						emot = emot == '正面' ? 'positive' : emot == '中立' ? 'neutral' : emot == '负面' ? 'negative' : '';
						for(let i = 0; i < data.length; i++){
							if(data[i]['mid_name'] == a.name){
								mid = data[i]['mid'];
								break;
							}
						}

						this.jump({
							med: mid,
							emotion: emot,
							date: this.state.from + ',' + this.state.to,
							product: this.state.srcMidsSelect
						})
					})
				}
			}} />

			return node;
		},
		renderLoading: function(){
			var node;
			if(!this.state.loadEnd){
				node = (
					<div className="advices-analy-spread-detail-load">
						<div className="wrapper">
							<div className="l">
								<span>{this.state.loadStep + '/' + this.state.loadTotal}</span>
							</div>
							<div className="r">
								<section className="tit">数据分析中</section>
								<section className="state">{this.state.loadtxt}</section>
								<section className="bar">
									<span className="inner pct50 active" style={{width: ~~(+this.state.loadStep * 100 / +this.state.loadTotal) + '%'}}></span>
								</section>
							</div>
						</div>
					</div>
				)
			}
			return node;
		},
		renderTip: function(){
			var node;
			// if(this.state.isBlank){
			// 	node = (
			// 		<div className="advices-analy-spread-detail-load tip">
			// 			<div className="wrapper">
			// 				<div className="l">
			// 					<span>提示</span>
			// 				</div>
			// 				<div className="r">
			// 					<section className="tit">{'暂无数据'}</section>
			// 					<section className="state">
			// 						您添加的自动标签暂时没有相关文章。您可以<a href={paths.ex.base + '/manager-tag#/tag'}>添加新的自动标签</a>或者耐心等待。
			// 					</section>
			// 				</div>
			// 			</div>
			// 		</div>
			// 	)
			// }
			if(this.state.isBlank){
				node = (
					<div className="blank-wrap">
						<div className="list-blank-holder">
							<span>暂无文章数据</span>
						</div>
					</div>
				)
			}
			return node;
		},
		render: function(){
			var state = this.state;
			return (
				<div>
					<div className={"advices-analy-media-v2"}>
						{
							this.state.type == 'event' ? null : (
								<section className="navi-part">
									<ul className="btns">
										<li onClick={() => this.toggleTimeRange('today')} className={'item' + (state.timeRange == 'today' ? ' active' : '')}>
											<span>今天</span>
										</li>
										<li onClick={() => this.toggleTimeRange('week')} className={'item' + (state.timeRange == 'week' ? ' active' : '')}>
											<span>近7天</span>
										</li>
										<li onClick={() => this.toggleTimeRange('month')} className={'item' + (state.timeRange == 'month' ? ' active' : '')}>
											<span>近30天</span>
										</li>
									</ul>
									<div className="range">
										<RangeCal className="c-time-range" style={{width: '210px'}} format="YYYY-MM-dd" onChange={(val) => this.toggleTimeRange(val)} value={[this.state.from, this.state.to]} showClear={false} />
									</div>
								</section>
							)
						}
						{
							!this.state.isBlank && this.state.loadEnd ? 
							(
								<div>
									<section className="data-part row mb30">
										<div className="col-xs-4">
											<div className="media-container bg1">
												<div className="val">
													<span>{this.state.mediaCount}</span>
												</div>
												<div className="key">
													<span>媒体数</span>
												</div>
											</div>
										</div>
										<div className="col-xs-4">
											<a href={paths.links.allArticles + '?date=' + this.state.from + ',' + this.state.to} className="media-container bg3">
												<div className="val">
													<span>{this.state.artTotal}</span>
												</div>
												<div className="key">
													<span>文章数</span>
												</div>
											</a>
										</div>
										<div className="col-xs-4">
											<div className="media-container bg4">
												<div className="val warn">
													<span>{(this.state.negTotal * 100 / this.state.artTotal).toFixed(2) || 0}%</span>
												</div>
												<div className="key">
													<span>负面比例</span>
												</div>
											</div>
										</div>
									</section>
									<section className="mb10">
										<div className="row">
											<div className="col-xs-6">
												<div className="panel panel-default">
													<div className="panel-heading">
														<h3 className="panel-title">媒体产品类型分布</h3>
														<Tooltip title="统计周期内的文章数量按照媒体产品类型的分布图，最多允许选择5个关键字，请先取消选中的关键字。" />
													</div>
													<div className="panel-body">
														{this.renderZaiti()}
													</div>
												</div>
											</div>
											<div className="col-xs-6">
												<div className="panel panel-default">
													<div className="panel-heading">
														<h3 className="panel-title">总体正负面分布</h3>
														<Tooltip title="统计周期内的文章按照媒体产品类型区分正面、中立、负面的文章数量分布图。" />
													</div>
													<div className="panel-body">
														{this.renderZhengfu()}
													</div>
												</div>
											</div>
										</div>
									</section>
									<section>
										<div className="panel panel-default">
											<div className="tab">
												<ul>
													{
														this.state.srcData.map((data, idx) => {
															return (
																<li className={data.category == this.state.srcMidsSelect ? ' active' : ''} key={idx} onClick={() => this.handleSrcClick(data.category)}>
																	<span className="txt">{data.category_name}</span>
																</li>
															)
														})
													}
												</ul>
												<div className="fr pr22">
													<Tooltip title="统计周期内该媒体产品类型下各媒体的文章按正面、中立、负面的文章数量分布图。" />
												</div>
											</div>
											<div className="panel-body">
												{this.renderSrcMids()}
											</div>
										</div>
									</section>
								</div>
							) : null
						}
						{this.renderTip()}
					</div>
					<Loader show={!this.state.loadEnd} fix />
				</div>
			)
		}
	})

	return Media;
})