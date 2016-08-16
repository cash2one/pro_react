define([
	'mods',
	paths.rcn.util + '/rest.js'
], function(mods, R){
	var React = mods.ReactPack.default,
		rex = R.ex(),
		rex2 = R.ex2();

	var Item = React.createClass({
		getInitialState: function(){
			return {
				link: false
			}
		},
		componentDidMount: function(){
			var evId = this.props.data.id;
			rex2.article.count.read('query', {inc: evId}).done(({count}) => {
				if(count > 0){
					this.setState({link: true})
				}
			})
		},
		render: function(){
			var dat = this.props.data;
			var detail = dat.detail.length > 30 ? dat.detail.slice(0,30) + '...' : dat.detail;
			var hasData = !!this.state.link;
			return (
				<li className="col-xs-3">
					<div className="item">
						<div className="top">
							<div>
								<span className="title" title={dat.title}>{dat.title}</span>
								<span className={"rank rank" + dat.rank}>{(dat.rank == 4 ? '普通' : '一二三'.charAt(dat.rank - 1) + '级')}</span>
							</div>
							<p className="desc" title={dat.detail}>{detail}</p>
						</div>
						<div className="btns">
							{
								hasData ? (
									<a href={'/analy#/event/vein?event_id=' + dat.id} className="btn btn-xs btn-default link">
										<span className="iconfont icon-wechaticon11"></span>
										<span>查看分析</span>
									</a>
								) : (
									<button className="btn btn-default btn-xs" disabled="true">
										<span className="iconfont icon-wechaticon11"></span>
										<span>暂无数据</span>
									</button>
								)
							}
						</div>
					</div>
				</li>
			)
		}
	})

	var Event = React.createClass({
		getInitialState: function(){
			return {
				list: []
			}
		},
		componentDidMount: function(){
			rex.events.read().done(data => {
				this.setState({list: data});
			})
		},
		renderList1: function(){
			var data = this.state.list.filter(list => list.status == 1),
				node;

			if(data.length > 0){
				node = this.renderList(data);
			} else {
				node = <li className="list-blank-holder">暂无事件</li>
			}

			return node;
		},
		renderList2: function(){
			var data = this.state.list.filter(list => list.status == 0),
				node;

			if(data.length > 0){
				node = this.renderList(data);
			} else {
				node = <li className="list-blank-holder">暂无事件</li>
			}

			return node;
		},
		renderList: function(data){
			var node = data.map((dat, idx) => {
				return <Item data={dat} key={idx} />
			})
			return node;
		},
		render: function(){
			return (
				<div className="advices-analy-event-v2">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">事件分析</h3>
								<div>
									<a href={'/base#/event/operator'} className="btn btn-primary">管理事件</a>
								</div>
							</div>
							<div className="event-group">
								<div className="group-title">
									<span className="iconfont icon-jinxingzhong list1"></span>
									<span className="txt">进行中的事件</span>
								</div>
								<ul className="group-body row">
									{this.renderList1()}
								</ul>
							</div>
							<div className="event-group">
								<div className="group-title">
									<span className="iconfont icon-lishijilu list2"></span>
									<span className="txt">历史事件</span>
								</div>
								<ul className="group-body row">
									{this.renderList2()}
								</ul>
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Event;
})