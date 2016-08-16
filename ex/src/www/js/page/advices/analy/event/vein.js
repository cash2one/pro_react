define(['mods', paths.rcn.util + '/rest.js', paths.rcn.plu + '/fecha.min.js', paths.ex.util + '/parse.js'], function(mods, R, fecha, util){
	var React = mods.ReactPack.default,
		rest = R.ex(),
		rest2 = R.ex2();

	var params = {
		sort: 'publish_at_desc',
		m: 5
	}

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parse(str, num){
		num = num || 100;
		if(str.length > num)
			str = str.substr(0, num) + '...';
		return str;
	}

	function parseTag(str){
		str = (str || '').replace(reg, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return str;
	}

	var Vein = React.createClass({
		getInitialState: function(){
			return {
				evId: null,
				begin: 0,
				end: false,
				loading: false,
				loadbtn: false,
				evDetail: '',
				list: []
			}
		},
		componentWillMount: function(){
			var evId = this.props.location.query.event_id;
			if(evId != undefined)
				this.setState({evId});
		},
		componentDidMount: function(){
			var evId = this.state.evId;
			if(evId != undefined){
				rest.event.read('detail', {
					event_id: evId
				}).done(data => {
					this.setState({
						evDetail: data.detail
					})
				});
				this.getListData(0);
			}
		},
		getListData: function(begin){
			var evId = this.state.evId;
			if(evId != undefined){
				// rest.articles.read($.extend({}, params, {
				// 	begin,
				// 	event_id: evId
				// })).done(data => {
				// 	this.handlerData(data, begin);
				// 	if(data.length == params.limit)
				// 		this.setState({loadbtn: true})
				// })

				rest2.article.data.read('query', $.extend({}, params, {
					beg: begin,
					inc: evId
				})).done(data => {
					if(data.result){
						data = data.data;
						this.handlerData(data, begin);
						if(data.length == params.m)
							this.setState({loadbtn: true})
					}
				})
			}
		},
		loadMore: function(){
			var end = this.state.end,
				begin = this.state.begin + params.m,
				evId = this.state.evId;
			if(!end){
				this.setState({loading: true});
				rest2.article.data.read('query', $.extend({}, params, {
					beg: begin,
					inc: evId
				})).done(data => {
					this.setState({loading: false});
					if(data.result == true){
						this.setState({latestArts: data.data});
						this.handlerData(data.data, begin)
					}
				})
			}
		},
		handlerData: function(data, begin){
			if(data.length > 0){
				this.setState({list: [...this.state.list, ...data], begin});
			} else {
				this.setState({end: true})
			}
		},
		getTitle: function(title, content){
			if(title.length == 0)
				title = util.parseTag(content);
			title = util.parseTag(title);

			return util.limit(title, 25);
		},
		getContent: function(str){
			str = util.parseTag(str);
			return util.limit(str);
		},
		formatTime: function(time_str){
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
				return (time_str || '').replace(/\:\d+$/, '')
			}
		},
		render: function(){
			return (
				<div className="advices-analy-event-vein-v2">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">事件概况</h3>
							</div>
							<div className="panel-body">
								<p className="desc">{$.trim(this.state.evDetail).length > 0 ? this.state.evDetail : '暂无事件描述'}</p>
							</div>
						</div>
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">事件脉络</h3>
							</div>
							<div className="panel-body">
								<section className="vein-part">
									<ul className="lists">
										{
											this.state.list.map(item => {
												return (
													<li className="item">
														<div className="grid1">
															<span>{this.formatTime(item.publish_at)}</span>
														</div>
														<div className="grid2">
															<span className="inner">{item.from.media}</span>
														</div>
														<div className="grid3">
															<div className="title">
																<a href={paths.ex.base + '/base#/article?uuid=' + item.uuid} target="_blank">{this.getTitle(item.title, item.content)}</a>
															</div>
															<p className="desc">{this.getContent(item.content)}</p>
														</div>
													</li>
												)
											})
										}
									</ul>
									{
										this.state.loadbtn ? 
										(
											<div className="loadmore">
												<span className="btn btn-primary" disabled={this.state.loading || this.state.end} onClick={() => this.state.loading ? null : this.loadMore()}>{this.state.loading ? '加载中' : this.state.end ? '没有更多' : '加载更多'}</span>
											</div>
										)
										: null
									}
								</section>
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Vein;
})