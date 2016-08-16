define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/analy/profile/parse.js',
	paths.ex.page + '/advices/analy/event/chart.js',
	paths.rcn.plu + '/fecha.min.js',
	paths.ex.page + '/advices/analy/profile2/helper.js',
	'echarts',
	paths.rcn.comps + '/tooltip.js'
], function(mods, R, Parse, Chart, fecha, Helper, echarts, Tooltip){
	var React = mods.ReactPack.default;

	var rest = R.ex();
	rest.user.add('tags');
	var restArt = R.article();
	var rest2 = R.ex2();

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str){
		str = (str || '').replace(reg, '');
		return str;
	}

	const emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'negative': '负面'
	}

	var now = +new Date(1997, 9, 3);

	function randomData() {
		
		
		var oneDay = 24 * 3600 * 1000;
		var value = Math.random() * 1000;
	    now = new Date(+now + oneDay);
	    value = value + Math.random() * 21 - 10;
	    return [
	            [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
	            Math.round(value)
	        ]
	}

	function gen(count){
		var data = [];
		for (var i = 0; i < count; i++) {
		    data.push(randomData());
		}
		return data;
	}

	// var data = gen(50)

	var ArtChart = React.createClass({
		getInitialState(){
			return {
				mids: [],
				data: {},
				timeRange: 'today',
				disabledTimeRange: []
			}
		},
		componentDidMount(){
			rest.media.read('top').done(data => {
				this.setState({mids: data}, () => {
					this.getData('today')
					this.getData('last_month')
					this.getData('last_week')
				})
			})
		},
		getData(time){
			var chart = this.refs.chart.ins();
			chart.showLoading();
			var mids = this.state.mids, arr, res = [], time = time || this.state.timeRange,
				params = {
					from: undefined,
					to: undefined
				}, delta_day = 1000 * 3600 * 24, delta_month = 29 * delta_day, delta_week = 6 * delta_day;
			if(time == 'last_week')
				params.from = fecha.format(new Date(Date.now() - delta_week), 'YYYY-MM-DD');
			else if(time == 'last_month')
				params.from = fecha.format(new Date(Date.now() - delta_month), 'YYYY-MM-DD');

			rest.article.read('productform', params).done(data => {
				chart.hideLoading();
				data = Object.keys(data).map(key => {
					return {
						data: data[key],
						mid_name: key
					}
				});
				this.setState({data: Object.assign({}, this.state.data, {
					[time]: {
						data,
						at: Date.now()
					}
				})})
			});
		},
		getOpts(){
			var data = this.state.data, timeRange = this.state.timeRange, series = [], xData = [], legendData = [],
				opts = {
				    title: {
				    	left: 22,
				    	textStyle: {
				    		color: '#000',
				    		fontSize: 14
				    	}
				    },
				    toolbox: {
				    	itemSize: 20,
				    	right: 0,
						feature: {
							saveAsImage: {
								icon: 'image:///img/chart-download.png',
								title: '下载'
							}
						},
						iconStyle: {
							emphasis: {
								color: '#2c97de'
							}
						}
					},
				    grid: {
				    	show: true,
				    	left: 22,
				    	right: 22,
				    	bottom: 0,
				    	containLabel: true,
				    	borderColor: '#eee',
				    	shadowColor: '#eee'
				    },
				    legend: {
				    	x: 'center',
				    	top: 5,
				    	textStyle: {
				    		color: '#999',
				    		fontSize: 12
				    	}
				    },
				    tooltip: {
				    	trigger: 'axis'
				    },
				    color: ['#3a99d8', '#2dbd9b', '#70ca63', '#f6bb42', '#f88b37', '#e9573f', '#3bafda', '#3c71dd', '#5866e6', '#967adc', '#d73ab8', '#ec3880'],
				    xAxis: {
				    	boundaryGap: false,
				    	axisLine: {
				    		lineStyle: {
				    			color: '#eee'
				    		}
				    	},
				    	axisTick: {
				    		show: false
				    	},
				    	splitLine: {
				    		lineStyle: {
				    			color: '#eee'
				    		}
				    	},
				    	axisLabel: {
				    		textStyle: {
				    			color: '#999'
				    		},
				    		formatter: function(value, index) {
				    			var date = new Date(value);
				    			if (value) {
				    				if (index === 0) {
				    					return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
				    				} else {
				    					return (date.getMonth() + 1) + '月' + date.getDate() + '日';
				    				}
				    			}
				    		}
				    	}
				    },
				    yAxis: {
				    	type: 'value',
				    	axisLine: {
				    		lineStyle: {
				    			color: '#eee'
				    		}
				    	},
				    	axisTick: {
				    		show: false
				    	},
				    	splitLine: {
				    		lineStyle: {
				    			color: '#eee'
				    		}
				    	},
				    	axisLabel: {
				    		textStyle: {
				    			color: '#ccc'
				    		},
				    		// inside: true
				    	}
				    },
				    // series: chartData
				    animation: false
				};
			data = data[timeRange];

			if(data){
				data = data.data;
				if(data.length == 0) return opts;
				data.forEach(dat => {
					legendData.push(dat.mid_name);
					series.push({
						smooth: true,
						name: dat.mid_name,
						type: 'line',
						data: dat.data.map(item => item.value),
						areaStyle: {
							normal: {
								opacity: 0.2
							}
						}
					})
				})
				opts.series = series;
				opts.legend.data = legendData

				if(timeRange == 'today'){
					opts.xAxis.axisLabel = {
						interval: 3
					}
					xData = data[0].data.map(item => ((item.date || '').split(' ')[1] || '').replace(/\:\d+$/, ''));
				} else {
					xData = data[0].data.map(item => (item.date || '').replace(/\:\d+$/, ''));
				}

				opts.xAxis.data = xData;

				return opts;
			} else {
				return opts;
			}
		},
		toggleTimeRange(timeRange, e){
			if(e.currentTarget.className.indexOf('disabled') == -1 && this.state.timeRange != timeRange){
				if(timeRange == 'today'){
					var delta = Date.now() - this.state.data['today'].at;
					if(delta > 1000 * 60 * 5)
						this.setState({timeRange}, () => this.getData(timeRange))
					else
						this.setState({timeRange});
				} else {
					this.setState({timeRange});
				}
			}
		},
		addClass(map){
			var res = [];
			res = Object.keys(map).filter(key => {
				return !!map[key];
			});
			return res.join(' ');
		},
		render(){
			var opts = this.getOpts();
			// console.log(opts)
			return (
				<section className="panel panel-default">
					<div className="tab">
						<ul>
							<li className={this.addClass({active: this.state.timeRange == 'today'})} onClick={(e) => this.toggleTimeRange('today', e)}>
								<span>近24小时</span>
							</li>
							<li className={this.addClass({active: this.state.timeRange == 'last_week'})} onClick={(e) => this.toggleTimeRange('last_week', e)}>
								<span>近7天</span>
							</li>
							<li className={this.addClass({active: this.state.timeRange == 'last_month'})} onClick={(e) => this.toggleTimeRange('last_month', e)}>
								<span>近30天</span>
							</li>
						</ul>
						<div className="fr pr30">
							<Tooltip title="规定周期内每日文章增量的趋势图。" className="" />
						</div>
					</div>
					<div className="panel-body">
						<Chart.c2 ref="chart" options={opts} notmerge="true" />
					</div>
				</section>
			)
		}
	})

	var Pie = React.createClass({
		getInitialState(){
			return {
				data: {},
				size: {}
			}
		},
		componentWillReceiveProps(a){
			this.setState({data: a.data || {}});
		},
		componentDidMount(){
			this.resizeHandler();
			window.addEventListener('resize', this.resizeHandler, false);
		},
		componentWillUnmount(){
			window.removeEventListener('resize', this.resizeHandler, false);
		},
		resizeHandler(){
			var w = document.body.offsetWidth;
			if(w >= 1500){
				this.setState({size: {
					series: [{
						radius: ['75%', '90%']
					}, {
						radius: ['75%', '90%']
					}, {
						radius: ['75%', '90%']
					}]
				}})
			} else if(w >= 1370){
				this.setState({size: {
					series: [{
						radius: ['65%', '80%']
					}, {
						radius: ['65%', '80%']
					}, {
						radius: ['65%', '80%']
					}]
				}})
			} else {
				this.setState({size: {
					series: [{
						radius: ['45%', '60%']
					}, {
						radius: ['45%', '60%']
					}, {
						radius: ['45%', '60%']
					}]
				}})
			}
		},
		render(){
			var opts = $.extend(true, {}, Helper.jinriyuqing(this.props.data), this.state.size);
			return <Chart.c2 height={280} options={opts} />
		}
	})

	var Profile = React.createClass({
		getInitialState: function(){
			return {
				allArtCount: 0,
				artCount: 0,
				warnCount: 0,
				latestArts: [],
				hotEvents: [],
				todayArtEmotion: {},

			}
		},
		componentDidMount: function(){
			// 文章总数
			// restArt.count.read().done(({count}) => {
			// 	this.setState({allArtCount: count})
			// })
			rest2.article.count.read('query', {}).done(dat => {
				if(dat.result == true){
					this.setState({allArtCount: dat.count});
				}
			})
			// 预警总数
			// restArt.count.read({
			// 	warn: 'all'
			// }).done(({count}) => {
			// 	this.setState({warnCount: count})
			// })
			rest2.article.count.read('query', {warn: 'all'}).done(dat => {
				if(dat.result == true){
					this.setState({warnCount: dat.count})
				}
			})
			// 今日文章数
			rest2.article.count.read('query', {date: 'today'}).done(dat => {
				if(dat.result == true){
					this.setState({artCount: dat.count})
				}
			})
			// 最新舆情
			// rest.articles.read('latest').done(data => {
			// 	this.setState({latestArts: data})
			// })
			rest2.article.data.read('query', {
				sort: 'publish_at_desc',
				beg: 0,
				m: 10,
				date: 'last_week'
			}).done(data => {
				if(data.result == true){
					this.setState({latestArts: data.data})
				}
			})
			// 热门事件
			rest2.events.read('hot').done(data => {
				this.setState({hotEvents: data});
			})
			// 文章列表
			// rest.article.read('list').done(data => {
			// 	this.setState({todayArtEmotion: data, artCount: data.today.positive + data.today.negative + data.today.neutral})
			// })
			// rest2.article.count.read('emowarn').done(data => {
			// 	this.setState({todayArtEmotion: data})
			// })
			rest2.article.agg.read('query', {'result': 'emotion', 'date': 'today'}).done(data => {
				if(data.result == true){
					data = data.data.emotion.reduce((obj, item) => {
						obj[item['param']] = item['count'];
						return obj
					}, {})
					data['positive'] = data['positive'] || 0;
					data['negative'] = data['negative'] || 0;
					data['neutral'] = data['neutral'] || 0;
					this.setState({todayArtEmotion: data});
				}
			})
		},
		getLatestTime: function(time_str){
			var now = Date.now(),
				time = fecha.parse($.trim(time_str), 'YYYY-MM-DD HH:mm:ss').getTime(),
				delta = now - time,
				min = 1000 * 60,
				hour = min * 60,
				day = hour * 24;
			if(delta < min){ // 1分钟以内
				return '刚刚'
			} else if (delta < hour){ // 1小时以内
				return parseInt(delta / min) + '分钟前'
			} else if (delta < day){ // 1天以内
				return parseInt(delta / hour) + '小时前'
			} else { // 大于1天
				return parseInt(delta / day) + '天前'
			}
		},
		renderLatestArts: function(){
			var data = this.state.latestArts;
			if(data.length > 0){
				return data.map((art, idx) => {
					let title = Parse.tag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
					let pn = (art.from || {}).platform_name || '', media_pre, media_end = (art.from || {}).media || '';
					if(pn == '待定' || pn == '')
						media_pre = '';
					else
						media_pre = pn + '：';

					return (
						<li key={idx}>
							<div className="title">
								<a href={paths.ex.base + '/base#/article?uuid=' + art.uuid || ''} title={title}>{Parse.limit(title, 40)}</a>
							</div>
							<div className="infos">
								<span>{this.getLatestTime(art.publish_at)}</span>
								<span>{media_pre + media_end}</span>
								<span>{emotMap[art.emotion] || ''}</span>
							</div>
						</li>
					)
				})
			} else {
				return (
					<div className="list-blank-holder">
						<span>暂无文章</span>
					</div>
				)
			}
		},
		renderHotEvents: function(){
			var data = this.state.hotEvents;
			if(data.length > 0){
				return data.map((event, idx) => {
					return (
						<li key={idx}>
							<div className="title">
								<a href={paths.ex.base + '/base#/event/detail?inc=' + event.id}>{event.title}</a>
								<span className={"rank" + ' rank' + event.rank || 4}>{(event.rank == 4 ? '普通' : '一二三'.charAt(event.rank - 1) + '级')}</span>
							</div>
							<div className="infos">
								<span>{'昨日新增：' + (event.yestoday_art_count || 0)}</span>
								<span>{'文章总数：' + (event.article_count || 0)}</span>
								<span>{'负面比例：' + (event.article_count > 0 ? (event.negative_art_count * 100 / event.article_count).toFixed(0) + '%' : 0)}</span>
							</div>
						</li>
					)
				})
			} else {
				return (
					<div className="list-blank-holder">
						<span>暂无事件，<a href={paths.ex.base + '/base#/event/operator'} className="intxt">创建事件</a></span>
					</div>
				)
			}
		},
		renderTodayArtChart: function(){
			var data = this.state.todayArtEmotion;
			if(data){
				return (
					<div>
						<Pie data={data} />
						<div className="content cf">
							<div className="item">
								<div className="title">正面文章</div>
							</div>
							<div className="item">
								<div className="title neu">中立文章</div>
							</div>
							<div className="item">
								<div className="title neg">负面文章</div>
							</div>
						</div>
					</div>
				)
			} else {
				return (
					<div className="content cf content-blank">
						<div className="list-blank-holder">
							<span>暂无信息</span>
						</div>
					</div>
				)
			}
		},
		renderQingxiang: function(){
			var data = this.state.todayArtEmotion,
				opts = {
					tooltip: {
						formatter: "负面声量占比：0<br/>正面声量占比：0<br/>中立声量占比：0<br/>情感指数：0"
					},
					toolbox: {
				    	itemSize: 20,
				    	right: 0,
						feature: {
							saveAsImage: {
								icon: 'image:///img/chart-download.png',
								title: '下载'
							}
						},
						iconStyle: {
							emphasis: {
								color: '#2c97de'
							}
						}
					},
					series: [{
						name: '情感倾向',
						type: 'gauge',
						radius: '90%',
						detail: {
							formatter: '{value}',
							offsetCenter: [0, '80%']
						},
						min: -100,
						max: 100,
						data: [{
							value: 0,
							name: '情感倾向'
						}],
						// startAngle: 200,
						// endAngle: -20,
						axisLine: {
							lineStyle: {
								color: [[0.5, '#e9573f'], [1, '#3a99d8']]
							}
						},
						axisLabel: {
							formatter: function(v) {
								switch (v + '') {
									case '-100':
										return '-100';
									case '0':
										return '（中性）';
									case '100':
										return '100';
									default:
										return v
								}
							}
						},
						pointer: {
							width: 4
						}
					}]
				}

			data = this.calEmotTrend(data);
			if(data.total > 0){
				opts.series[0].data[0].value = data.positive - data.negative;
				opts.tooltip.formatter = `负面声量占比：${data.negative}%<br/>正面声量占比：${data.positive}%<br/>中立声量占比：${data.neutral}%<br/>情感指数：${data.positive - data.negative}`;
			}
				
			return (
				<Chart.c2 height={310} options={opts} />
			)
		},
		calEmotTrend(data){
			var res = {
				total: 0,
				positive: 0,
				negative: 0,
				neutral: 0
			};
			if(data){
				var total = data.positive + data.negative + data.neutral;
				if(total > 0){
					res = {
						total: total,
						positive: (data.positive * 100 / total).toFixed(0),
						negative: (data.negative * 100 / total).toFixed(0),
						neutral: (data.neutral * 100 / total).toFixed(0)
					}
				}
			}
			return res;
		},
		render: function(){
			var emotTrend = this.calEmotTrend(this.state.todayArtEmotion);
			if(emotTrend.total > 0){
				emotTrend = emotTrend.positive - emotTrend.negative;
			} else {
				emotTrend = null;
			}
			return (
				<div className="advices-analy-profile2">
					<section className="data-part">
						<div className="item data-all">
							<a href={paths.links.allArticles}>
								<div className="num">
									<span>{this.state.allArtCount}</span>
								</div>
								<div className="desc">
									<span>全部文章</span>
								</div>
							</a>
						</div>
						<div className="item data-today">
							<a href={paths.links.allArticles + '?date=today'}>
								<div className="num">
									<span>{this.state.artCount}</span>
								</div>
								<div className="desc">
									<span>今日文章</span>
								</div>
							</a>
						</div>
						<div className="item data-warn">
							<a href={paths.links.warn}>
								<div className="num">
									<span>{this.state.warnCount}</span>
								</div>
								<div className="desc">
									<span>预警文章</span>
								</div>
							</a>
						</div>
					</section>
					<ArtChart />
					<section className="blocks-part">
						<div className="blocks-left">
							<div className="panel panel-default pie-chart mb20">
								<div className="panel-heading">
									<h3 className="panel-title">今日舆情</h3>
									<div className="pr5 mr2">
										<Tooltip title="今日文章的正面、中立、负面数量占比及其条数。" />
									</div>
								</div>
								<div className="panel-body">
									{this.renderTodayArtChart()}
								</div>
							</div>
							<div className="panel panel-default ovh latest-art">
								<div className="panel-heading">
									<h3 className="panel-title">
										最新舆情
										<span className="desc">近7天</span>
									</h3>
								</div>
								<ul className="profile-lists">
									{this.renderLatestArts()}
								</ul>
							</div>
						</div>
						<div className="blocks-right">
							<div className="panel panel-default mb20">
								<div className="panel-heading">
									<h3 className="panel-title">{'情感倾向' + (emotTrend ? ': ' + emotTrend : '')}</h3>
									<div className="pr5 mr2">
										<Tooltip title="今日正面趋势与负面趋势之差。" />
									</div>
								</div>
								<div className="panel-body">
									{this.renderQingxiang()}
								</div>
							</div>
							<div className="panel panel-default ovh latest-art">
								<div className="panel-heading">
									<h3 className="panel-title">事件动态</h3>
								</div>
								<ul className="profile-lists">
									{this.renderHotEvents()}
								</ul>
							</div>
						</div>
					</section>
				</div>
			)
		}
	})

	return Profile
})