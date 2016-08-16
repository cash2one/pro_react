define([
	'mods',
	paths.ex.page + '/advices/analy/spread/bar.js',
	paths.ex.page + '/advices/analy/spread/scatter.js',
	paths.ex.page + '/advices/analy/spread/pie.js',
	paths.ex.page + '/advices/analy/spread/force.js',
	paths.ex.page + '/advices/analy/spread/bar-distributed.js',
	paths.ex.page + '/advices/analy/spread/fakeData.js',
	// paths.rcn.plu + '/echarts.min.js'
], function(mods, Bar, Scatter, Pie, Force, BarDis, fake){
	var React = mods.ReactPack.default;

	// var rest = r.spread(),
	// 	user = r.rcn().user;

	// rest.company.add('stat');
	// rest.event.add('stat');

	function get(count){
		var res = [];
		while(count--){
			let rand = 10;
			res.push({
				name: count + '',
				value: rand,
				symbolSize: rand,
			})
		}

		return res
	}

	function getL(count){
		var res = [], total = count;
		while(count--){
			res.push({
				source: parseInt(Math.random() * total),
				target: parseInt(Math.random() * total),

				lineStyle: {
					normal: {
						// type: 'dashed',
						curveness: 0.4
					}
				}
			})
		}
		return res;
	}

	function getData(count){
		var res = {};
		res.data = get(count).map((dat, i) => {
			if(i < 100){
				dat['category'] = '1'
			}
			else if (i < 150)
				dat['category'] = '2'
			else
				dat['category'] = '3'
			return dat;
		});
		res.links = getL(count);
		return res;
	}

	var data = getData(50);

	function draw(){
		var myChart = echarts.init(document.getElementById('chart'));
			
		// 指定图表的配置项和数据
		var option = {
			legend: {
				data: ['1', '2', '3']
			},
			series: [{
				name: '销量2',
				type: 'graph',
				layout: 'force',
				roam: true,
				// force: {
				// 	edgeLength: 100
				// },
				categories: [{name: '1'}, {name: '2'}, {name: '3'}],
				data: data.data,
				links: data.links,
				lineStyle: {
					normal: {
						curveness: .5
					}
				}
			}]
		};

		// 使用刚指定的配置项和数据显示图表。
		myChart.setOption(option);
	}

	var env = {
		debug: true,
		color: ['#ffcd67', '#ca9a65','#ff9a65', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
	}

	var Detail = React.createClass({
		getInitialState: function(){
			return {
				user: {},
				pieData: {},
				legend: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'],
				rout: {
					nodes: [],
					edges: []
				},
				data: {},
				legend: [],
				loadEnd: false,
				loadtxt: '获取数据中......',
				loadTotal: '',
				loadStep: 0,
				isBlank: false,
				type: '',
				tipTitle: null,
				tipDesc: null
			}
		},
		formatPieData: function(data){

		},
		componentWillMount: function(){
			var type = this.props.tp;
			if(type == 'event'){
				var eventId = this.props.eventId;
				this.setState({eventId});
			}
			this.setState({type});

			var _this = this;
			var rest = this.rest = new $.RestClient(paths.ex.api + '/api/v1/spread/', {
				stripTrailingSlash: true,
				ajax: {
					beforeSend: function(xhr){
						xhr.setRequestHeader('user_token', _this.props.userToken)
					}
				}
			});
			rest.add('article');
			rest.add('company');
			rest.add('event');
			rest.add('rout');
			rest.company.add('stat');
			rest.event.add('stat');
		},
		componentDidMount: function(){
			// if(this.state.type == 'event'){
			// 	this.setState({loadTotal: 3});
			// 	this.getRoute();
			// } else {
			// 	user.read().done(user => {
			// 		this.setState({loadTotal: 3});
			// 		this.getRoute(user);
			// 		// this.getDetail(user);
			// 	})
			// }
			this.setState({loadTotal: 3});
			this.getRoute();
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
		getRoute: function(user){
			var nodes = {}, edges = [], lv = 0, lvlimit = 6, type = this.props.tp;
			if(type == 'company')
				lvlimit = 2;
			else if(type == 'event')
				lvlimit = 100;
			var handleEdges = (data, lv) => {
				data.forEach(dat => {
					dat.to.$lv = lv;
					nodes[dat.to.uuid] = dat.to;
					if(lv > 1){
						edges.push({
							'source': dat.from.uuid,
							'target': dat.to.uuid
						})

						// console.log(dat);
						let $count = nodes[dat.from.uuid].$count;
						if(!$count){
							nodes[dat.from.uuid].$count = 1;
						} else {
							nodes[dat.from.uuid].$count++;
						}
					}
				});
				// console.log(lv, nodes, edges);
			}
			var get = uuids => {
				let f = uuids || [];
				lv++;
				let handler = data => {
					handleEdges(data, lv);
					if(lv < lvlimit && data.length > 0){
						get(data.map(dat => dat.to.uuid));
					} else {
						// if(lv == 1 && data.length == 0){
						// 	this.setState({
						// 		loadEnd: true,
						// 		isBlank: true
						// 	});
						// } else {
							this.setState({
								rout: {
									nodes,
									edges
								},
								loadtxt: '传播分析数据加载完毕......',
								loadStep: this.state.loadStep + 1
							})
							this.getDetail(user);
						// }
					}
				}
				if(type == 'event'){
					let evid = this.state.eventId;
					this.rest.rout.create({
						event: evid,
						from: f
					}).done(handler);
				} else {
					this.rest.rout.create({
						company: this.props.companyId,
						from: f
					}).done(handler)
				}
			}
			get();
		},
		getDetail: function(user){
			var type = this.props.tp;
			var handler = data => {
				if(data.articles == 0){
					if(type == 'company'){
						this.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前公司文章中没有发生传播关系。'
						})
					} else if(type == 'event'){
						this.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无文章数据',
							tipDesc: '当前事件中没有文章。'
						})
					}
				} else if (data.reships == 0){
					if(type == 'company'){
						this.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前公司文章中没有发生传播关系。'
						})
					} else if(type == 'event'){
						this.setState({
							loadEnd: true,
							isBlank: true,
							tipTitle: '暂无传播数据',
							tipDesc: '当前事件文章中没有发生传播关系。'
						})
					}
				} else {
					this.setState({data, loadtxt: '图表数据加载完毕......', loadStep: this.state.loadStep + 1});
				}
			}
			if(type == 'event'){
				let evid = this.state.eventId;
				this.rest.event.stat.read(evid).done(({data}) => handler(data))
			} else {
				this.rest.company.stat.read(this.props.companyId).done(({data}) => handler(data))
			}
		},
		formatTime: function(time){
			var min = 60,
				hour = 60 * 60,
				day = 60 * 60 * 24,
				res;
			if(time < min)
				res = time + '秒';
			else if(time < hour)
				res = Math.floor(time / min) + '分钟' + ((time % min) ? time % min + '秒' : '');
			else if (time >= hour && time < day * 3)
				res = Math.floor(time / hour) + '小时' + ((time % hour / min) ? (time % hour / min).toFixed(1) + '分钟' : '');
			else if (time >= day * 3)
				res = Math.floor(time / day) + '天' + ((time % day / hour) ? (time % day / hour).toFixed(1) + '小时' : '');
			return res;
		},
		renderZaiti: function(){
			var data = (this.state.data.mid_distributed || []).map(dat => {
				return {value: dat.articles, name: dat.mid_cate, itemStyle: {normal: {color: env.color[this.state.legend.indexOf(dat.mid_cate)]}}}
			});

			var node = (
				<Pie
					title="文章载体分布"
					options={{data, legendData: this.state.legend}}
				/>
			)
			return node;
		},
		renderCengji: function(){
			var data = (this.state.data.level_distributed || []).map((d, i) => {
				return {
					value: d,
					// itemStyle: {
					// 	normal: {
					// 		color: env.color[i]
					// 	}
					// }
				}
			}),
				xAxis = data.map((dat, i) => '第' + (i + 1) + '层级');

			var node = (
				<Bar
					title="媒体层级分布"
					options={{xAxis,data}}
					color={['#ff9963']}
				/>
			)

			return node;
		},
		renderZhuanfa: function(){
			var data = (this.state.data.mid_reship_distributed || []).sort((a,b) => b.reships - a.reships),
				xAxis = [], dat = [];
			data.forEach(d => {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.reships || 0);
			})
			var node = (
				<BarDis
					title="媒体被转发数量分布"
					height={500}
					options={
						{
							xAxis,
							yAxisName: '转发数',
							data: dat
						}
					} color={env.color} />
			)

			return node;
		},
		renderSudu: function(){
			var data = (this.state.data.spread_time_distributed || []).sort((a,b) => a.time - b.time),
				xAxis = [], dat = [];

			data.forEach(d => {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.time || 0);
			})
			var node = (
				<BarDis
					title="媒体转发速度分布"
					height={500}
					options={
						{
							xAxis,
							yAxisName: '转发速度',
							yAxisFormatter: '{value} 秒',
							data: dat,
							tooltipFormatter: params => {
								if(params instanceof Array){
									var tar = params[0];
									return tar.name + ': ' + this.formatTime(tar.value);
								} else if(params instanceof Object) {
									return params.name + ': ' + this.formatTime(params.value)
								}
							}
						}
					} color={env.color} />
			)

			return node;
		},
		renderWenzhang: function(){
			var data = (this.state.data.mid_article_distributed || []).sort((a,b) => b.articles - a.articles),
				xAxis = [], dat = [];

			data.forEach(d => {
				xAxis.push(d.mid_name || "(空)");
				dat.push(d.articles || 0);
			})
			var node = (
				<BarDis
					title="媒体文章数分布"
					height={500}
					options={
						{
							xAxis,
							yAxisName: '文章数',
							data: dat
						}
					} color={env.color} />
			)
			return node
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
			if(this.state.isBlank){
				node = (
					<div className="advices-analy-spread-detail-load tip">
						<div className="wrapper">
							<div className="l">
								<span>提示</span>
							</div>
							<div className="r">
								<section className="tit">{this.state.tipTitle || '暂无数据'}</section>
								<section className="state">
									{this.state.tipDesc ? this.state.tipDesc : <span>
										您添加的自动标签暂时没有相关文章。您可以<a href={paths.ex.base + '/manager#/tag'}>添加新的自动标签</a>或者耐心等待。
									</span>}
								</section>
							</div>
						</div>
					</div>
				)
			}
			return node;
		},
		render: function(){
			var renderSpreadTime = () => {
				var time = this.formatTime(this.state.data.spread_length) || '',
					fs = time.length >= 8 ? '18px' : '20px';
				var node = <span style={{fontSize: fs}}>{time}</span>
				return node;
			}
			return (
				<div>
					<div className={"advices-analy-spread-detail" + (this.state.loadEnd && !this.state.isBlank ? '' : ' loading')}>
						<div className="hd">
							<span className="tit">{this.state.type == 'event' ? '数据说明：分析数据基于被转发数不小于1的事件文章集合。' : '数据说明：分析数据基于被转发数不小于1且被转发次数排名前200名的文章集合。'}</span>
						</div>
						<div className="bd">
							<div className="mb30 data-part">
								<div className="item">
									<div className="spread-data-container">
										<div className="key">
											<span>文章数</span>
										</div>
										<div className="val">
											<span>{this.state.data.articles}</span>
										</div>
									</div>
								</div>
								<div className="item">
									<div className="spread-data-container">
										<div className="key">
											<span>转载数</span>
										</div>
										<div className="val">
											<span>{this.state.data.reships}</span>
										</div>
									</div>
								</div>
								<div className="item">
									<div className="spread-data-container">
										<div className="key">
											<span>媒体数</span>
										</div>
										<div className="val">
											<span>{this.state.data.mids}</span>
										</div>
									</div>
								</div>
								<div className="item">
									<div className="spread-data-container">
										<div className="key">
											<span>总传播时间</span>
										</div>
										<div className="val">
											{renderSpreadTime()}
										</div>
									</div>
								</div>
							</div>
							<div className="mb30 grid2">
								<div className="item-l">
									{this.renderZaiti()}
								</div>
								<div className="item-r">
									{this.renderCengji()}
								</div>
							</div>
							<div className="mb30">
								{this.renderZhuanfa()}
							</div>
							<div className="mb30">
								{this.renderSudu()}
							</div>
							<div className="mb30">
								{this.renderWenzhang()}
							</div>
						</div>
					</div>
					{this.renderLoading()}
					{this.renderTip()}
				</div>
			)
		}
	})

	return Detail
})