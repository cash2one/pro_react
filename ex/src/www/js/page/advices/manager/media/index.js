define([
	'mods',
	paths.ex.page + '/advices/manager/media/rank.js',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/search.js',
	paths.rcn.comps + '/loader.js'
], function(mods, Rank, Rest, Search, Loader){
	const React = mods.ReactPack.default;
	const PropTypes = mods.ReactPack.PropTypes;
	const Pagination = mods.Pagination;

	var rest = Rest.ex();
	rest.user.add('last');
	rest.user.add('rank');

	function parse(data){
		return data.reduce((obj, item, idx) => {
			item._index = idx;
			obj[item.mid] = item;
			return obj
		}, {})
	}

	var MediaIndex = React.createClass({
		contextTypes: {
			updateNav: PropTypes.func
		},
		getInitialState: function(){
			return {
				list: {},
				historyList: {},
				input: '',
				listStatus: 'history',
				hasModified: false,
				page: 0,
				listTotal: 0,
				loading: false
			}
		},
		componentDidMount: function(){
			this.loadHistory();
		},
		loadHistory: function(){
			rest.user.last.read('media').done(data => {
				this.setState({historyList: parse(data), hasModified: false})
			})
		},
		search: function(){
			if(this.state.input.length == 0) return
			this.setState({listStatus: 'search', loading: true});
			$.when(rest.media.read('search', {
				query: this.state.input,
				page: 0
			}).done(data => {
				this.setState({list: parse(data)})
			}),
			rest.media.read('search', {
				query: this.state.input,
				count: true
			}).done(data => {
				this.setState({listTotal: data.count})
			})).always(() => this.setState({loading: false}));
		},
		inputHandler: function(val){
			this.setState({
				input: val
			});
			// 显示历史记录
			if(val.length == 0){
				this.setState({
					listStatus: 'history'
				})
				if(this.state.hasModified){
					this.loadHistory();
				}
			}
		},
		modifyRank: function(mid, rank){
			rest.user.rank.update('media', {mid, rank}).done(data => {
				this.setState({hasModified: true});
			})
		},
		pageChangeHandler: function(page){
			$('.frame-body-right').scrollTop(0);
			this.setState({page: page - 1, loading: 1});
			rest.media.read('search', {
				query: this.state.input,
				page: page - 1
			}).done(data => {
				this.setState({list: parse(data), loading: 0})
			});
		},
		renderList: function(){
			var data, status = this.state.listStatus, nodes;
			if(status == 'history')
				data = this.state.historyList
			else if(status == 'search')
				data = this.state.list;
			data = Object.keys(data).map(mid => data[mid]).sort((a, b) => a._index - b._index);

			var replace_r = new RegExp(this.state.input, 'gi');

			function replace(str, key){
				return str;
				if(!str || key == '') return str;
				var reg = new RegExp(key, 'gi');
				str = str.replace(reg, match => "<em>" + match + "</em>");
				return str;
			}

			if(data.length == 0){
				if(status == 'search')
					nodes = <li className="list-blank-holder"><span>暂无纪录，您可输入公众号名称／关键字进行搜索</span></li>
				else if(status == 'history')
					nodes = <li className="list-blank-holder"><span>暂无历史记录</span></li>
			} else {
				nodes = data.map((item, idx) => {
					return (
						<li className="list-item" key={idx}>
							<table>
								<tbody>
									<tr>
										<td>
											<div className="img" style={{'backgroundImage': 'url(' + (paths.ex.eximg + item.avater) + ')'}}></div>
										</td>
										<td className="content">
											<div>
												<a href={item.url} className="title"  dangerouslySetInnerHTML={{__html: replace(item.name, this.state.input)}} target="_blank" />
												<span className="subtitle">{item.product_form}</span>
											</div>
											<div className="desc">
												<span  dangerouslySetInnerHTML={{__html: replace(item.desc, this.state.input)}} />
											</div>
											<div className="cate">
												{
													item.tags && item.tags instanceof Array && item.tags.map((tag, idx) => <span className={"item" + (tag == this.state.input ? ' active' : '')} key={idx}>{tag}</span>)
												}
											</div>
										</td>
										<td className="ranks">
											<p className="tc mb5">关注度</p>
											<Rank onChange={r => this.modifyRank(item.mid, r)} rank={item.rank} />
										</td>
									</tr>
								</tbody>
							</table>
						</li>
					)
				})
			}
			

			return nodes;
		},
		render: function(){
			const listTip = () => {
				if(this.state.listStatus == 'history')
					return <span>历史记录</span>
				else if(this.state.listStatus == 'search'){
					return (
						<div>
							<span>为您找到相关结果约<var className="count">{this.state.listTotal}</var>条</span>
							<span className="fr">
								未找到需要的媒体，可<a className="intxt" href={paths.rcn.base + '/feedback#/media'}>申请添加</a>
							</span>
						</div>
					)
				}
			}
			const pagin = () => {
				if(this.state.listStatus == 'search' && !$.isEmptyObject(this.state.list) && this.state.listTotal / 20 > 1){
					return <Pagination current={this.state.page + 1} total={this.state.listTotal} onChange={page => this.pageChangeHandler(page)} className="tc mt30 v2 pb30" pageSize={20} />
				}
			}
			return (
				<div className="advices-manager-media-v2">
					<div className="con">
						<section className="search-part">
							<Search size="md" placeholder="输入您想要查找的公众号名称/关键字描述" value={this.state.input} onChange={e => this.inputHandler(e.target.value)} onSearch={this.search} />
						</section>
						<div>
							<section className="info-part">
								{listTip()}
							</section>
							<ul className="list-part">
								{this.renderList()}
							</ul>
						</div>
						{pagin()}
					</div>
					<Loader fix show={this.state.loading} />
				</div>
			)
		}
	});

	return MediaIndex
})