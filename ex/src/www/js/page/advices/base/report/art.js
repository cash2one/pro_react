define([
	'mods',
	paths.ex.util + '/parse.js',
	paths.ex.plu + '/sort.js'
], function(mods, Parse, Sort){
	const React = mods.ReactPack.default;

	const emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	}

	var T = React.createClass({
		mixins: [Sort],
		getInitialState(){
			var data = this.props.data || [];
			return {
				items: data
			}
		},
		sortableOptions: {
			model: 'items',
			ref: 'list',
			handle: '.iconfont'
		},
		componentWillReceiveProps(n){
			this.setState({items: n.data})
		},
		getList(){
			return this.state.items;
		},
		render(){
			return (
				<ul ref="list">
					{
						this.state.items.map((art, idx) => {
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
										<span className={"c-cb active"} onClick={() => this.props.unselect(art)} />
									</div>
									<div className="infos">
										<span>{Parse.time(art.publish_at)}</span>
										<span>{media_pre + media_end}</span>
										<span>{emotMap[art.emotion] || ''}</span>
										<div className="tool">
											<span>{'相同文章：' + (art.similar_count || 0) + '篇'}</span>
											<span className="iconfont icon-paixu" />
										</div>
									</div>
								</li>
							)
						})
					}
				</ul>
			)
		}
	})

	var Art = React.createClass({
		dealData(){
			const {data = {}, save = {}} = this.props;
			var {focus_articles = []} = data;
			var focus_articles2 = save.info ? save.info.focus_articles || [] : [],
				begin = new Date(save.begin_at).getTime(),
				end = new Date(save.end_at).getTime();

			focus_articles2 = focus_articles2.filter(item => {
				let t = new Date(item.publish_at.split(' ')[0]).getTime();
				return t >= begin && t <= end
			});

			var selected = focus_articles2.map(item => item.uuid);

			focus_articles = focus_articles.filter(item => {
				let t = new Date(item.publish_at.split(' ')[0]).getTime();
				return t >= begin && t <= end && selected.indexOf(item.uuid) == -1
			});

			return {
				list1: focus_articles,
				list2: focus_articles2
			}
		},
		unselect(art){
			this.props.unselect && this.props.unselect(art);
		},
		select(art){
			this.props.select && this.props.select(art);
		},
		renderList(artList, isSelected){
			return artList.map((art, idx) => {
				let title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
				let pn = (art.from || {}).platform_name || '', media_pre, media_end = (art.from || {}).media || '';
				if(pn == '待定' || pn == '')
					media_pre = '';
				else
					media_pre = pn + '：';

				return (
					<li key={idx}>
						<div className="title">
							<a href={art.url} target="_blank" title={title}>{Parse.limit(title, 40)}</a>
							<span className={"c-cb" + (isSelected ? ' active' : '')} onClick={() => {
								isSelected ? this.unselect(idx) : this.select(art)
							}} />
						</div>
						<div className="infos">
							<span>{Parse.time(art.publish_at)}</span>
							<span>{media_pre + media_end}</span>
							<span>{emotMap[art.emotion] || ''}</span>
							<div className="tool">
								<span>{'相同文章：' + (art.similar_count || 0) + '篇'}</span>
								{isSelected ? <span className="iconfont icon-paixu" /> : null}
							</div>
						</div>
					</li>
				)
			})
		},
		getList(){
			return this.refs.list ? this.refs.list.getList() : []
		},
		render(){
			var artList = this.dealData();
			// console.log(artList)
			return (
				<div className="art-part">
					{
						artList.list1.length == 0 && artList.list2.length == 0 ? (
							<div className="list-blank-holder">暂无数据</div>
						) : (
							[<T ref="list" data={artList.list2} unselect={this.unselect} setList={list => this.props.setList(list)} />,
							<ul className={artList.list2.length % 2 ? 'odd' : undefined}>
								{this.renderList(artList.list1, false)}
							</ul>]
						)
					}
				</div>
			)
		}
	})

	return Art;
})