define([
	'mods',
	paths.ex.page + '/advices/analy/profile/helper.js',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/analy/profile/parse.js',
	paths.rcn.plu + '/fecha.min.js'
], function(mods, Helper, Rest, Parse, fecha){
	var React = mods.ReactPack.default;

	var rest = Rest.ex();
	rest.user.add('tags');

	var rest2 = Rest.ex2();

	var restArt = Rest.article();

	Highcharts.setOptions({ global: { useUTC: false } });

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str){
		str = (str || '').replace(reg, '');
		return str;
	}
	
	var Profile = React.createClass({
		getInitialState: function(){
			return {
				hotEvents: [],
				artTable: {},
				latestArt: [],
				mids: [],
				artTotal: 0,
				warnTotal: 0
			}
		},
		componentDidMount: function(){
			this.update();
		},
		update: function(){
			// 文章总数
			var artTotal = restArt.count.read().done(({count}) => {
				this.setState({artTotal: count})
			})
			// 预警总数
			var warnTotal = restArt.count.read({
				warn: 'all'
			}).done(({count}) => {
				this.setState({warnTotal: count})
			})
			// 热门事件
			var hotEvents = rest.events.read('hot').done(data => {
				this.setState({hotEvents: data});
			})
			// 文章列表
			// var artList = rest.article.read('list').done(data => {
			// 	this.setState({artTable: data}, () => Helper.runEmotChart(data.today))
			// })
			var artList = rest2.article.count.read('emowarn').done(data => {
				this.setState({artTable: data}, () => Helper.runEmotChart(data.today))
			})
			// 最新舆情
			var news = rest.articles.read('latest').done(data => {
				this.setState({latestArt: data})
			})

			// 可选标签
			// var tags = rest.user.tags.read('media').done(data => {
			// 	this.setState({tags: data.map(tag => tag.category)}, () => Helper.runTotalChart())
			// });
			var tags = rest.media.read('top').done(data => {
				this.setState({mids: data}, () => Helper.runTotalChart())
			})
		},
		componentWillUnmount: function(){
			Helper.leave();
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
		renderArtTable: function(){
			var data = this.state.artTable;
			var xValue = ['today', 'yesterday', '7', '30'];
			var yValue = ['positive', 'neutral', 'negative', 'warn'];
			var yMap = {
				'positive': '正面',
				'neutral': '中立',
				'negative': '负面',
				'warn': '预警'
			};
			var nodes = yValue.map((y, idx) => {
				return (
					<tr key={idx}>
						<td>{yMap[y]}</td>
						{
							xValue.map((x, i) => {
								if(data[x])
									return <td key={i}>{data[x][y] || '-'}</td>
							})
						}
					</tr>
				)
			})

			return nodes;
		},
		renderMids: function(){
			var nodes = this.state.mids.map((mid, idx) => {
				return (
					<label key={idx}>
						<input type="checkbox" className="mr5" data-mid={mid.id} data-mid-name={mid.name} />
						{mid.name}
					</label>
				)
			})
			nodes.unshift((
				<label>
					<input type="checkbox" className="mr5" data-mid={'all'} data-mid-name={'all'} />
					全部
				</label>
			))
			return nodes
		},
		renderLatest: function(){
			const emotMap = {
				'positive': '正面',
				'neutral': '中立',
				'negative': '负面'
			}
			return this.state.latestArt.map((art, idx) => {
				const title = Parse.tag(art.title.length > 0 ? art.title : art.content);
				return (
					<tr key={idx}>
						<td>
							<a href={paths.ex.base + '/base#/article?uuid=' + art.uuid || ''} className="link" title={title}>{Parse.limit(title, 40)}</a>
						</td>
						<td className="tr nowrap">
							<span>{art.from.media}</span>
						</td>
						<td className="tr nowrap">
							{
								(art.warn != 'none' && art.warn != '' && art.warn) ?
								<span style={{color: 'red'}}>预警</span> :
								<span>{emotMap[art.emotion]}</span>
								
							}
						</td>
						<td className="time tr nowrap">
							<span title={art.crawler_at}>{this.getLatestTime(art.crawler_at)}</span>
						</td>
					</tr>
				)
			})
		},
		render: function(){
			return (
				<div className="advices-analy-profile">
					<div className="w1200">
						<div className="art-part">
							<div className="left">
								<div className="art-number">
									<div className="top">
										<div>
											<a href={paths.ex.base + '/base#/news/audit'}>
												<span className="label">文章总数（篇）</span>
												<div>
													<span className="num total">{this.state.artTotal}</span>
												</div>
											</a>
										</div>
										<div>
											<a href={paths.ex.base + '/base#/warn/store'}>
												<span className="label">预警文章（篇）</span>
												<div>
													<span className="num warn">{this.state.warnTotal}</span>
												</div>
											</a>
										</div>
									</div>
								</div>
								<div className="art-list">
									<div className="title">
										<span>文章列表</span>
									</div>
									<div className="table">
										<table className="c-table">
											<colgroup width="20%"></colgroup>
											<colgroup width="20%"></colgroup>
											<colgroup width="20%"></colgroup>
											<colgroup width="20%"></colgroup>
											<colgroup width="20%"></colgroup>
											<thead>
												<tr>
													<th></th>
													<th>今天</th>
													<th>昨天</th>
													<th>近7天</th>
													<th>近30天</th>
												</tr>
											</thead>
											<tbody>
												{
													this.renderArtTable()
												}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							<div className="art-chart">
								<div className="title">
									<span>今日舆情属性</span>
								</div>
								<div className="chart" id="emotChart"></div>
							</div>
						</div>
						<div className="grid">
							<div className="right">
								<div className="art-hot">
									<div className="title">
										<span>最新事件<em>最近七天</em></span>
										<a href={paths.ex.base + "/base#/event/operator"}>更多</a>
									</div>
									<ul className="list">
										{
											this.state.hotEvents.length > 0 ?
											this.state.hotEvents.map((event, idx) => {
												return (
													<li className="item" key={idx}>
														<span className="date">{event.begin_at}</span>
														<div className="tit texthidden">
															<a href={paths.ex.base + '/base#/event/detail?event_id=' + event.id}>{event.title}</a>
														</div>
													</li>
												)
											})
											: (
												<li>
													<div className="list-blank-holder">
														<span>暂无事件，<a href={paths.ex.base + '/base#/event/operator'}>创建事件</a></span>
													</div>
												</li>
											)
										}
									</ul>
								</div>
							</div>
							<div className="left">
								<div className="art-index mb10">
									<div className="tab">
										<div className="inner" id="tagsTabContainer">
											<span className="item active" data-range="today">近24小时</span>
											<span className="item" data-range="last_week" data-disable="true">近7天</span>
											<span className="item" data-range="last_month" data-disable="true">近30天</span>
										</div>
									</div>
									<div className="content">
										<div>
											<div className="chart" id="chart"></div>
											<div className="selectors dn" id="tagsContainer">
												{
													this.renderMids()
												}
											</div>
										</div>
									</div>
								</div>
								<div className="art-news">
									<div className="title">
										<span>最新舆情<em>最近七天</em></span>
										<a href={paths.ex.base + "/base#/news/audit"} className="fr">更多</a>
									</div>
									<div className="list">
										{
											this.state.latestArt.length > 0 ?
											(
												<table className="pct100">
													<tbody>
														{
															this.renderLatest()
														}
													</tbody>
												</table>
											)
											: <div className="list-blank-holder"><span>暂无文章，敬请期待。</span></div>
										}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Profile
})