define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.comps + '/loader.js',
	paths.ex.page + '/advices/base/news/audit/link.js',
	paths.ex.page + '/advices/base/news/audit/actions.js',
	paths.ex.page + '/advices/base/report/select.js',
	paths.ex.page + '/advices/base/articles/art-list-item.js'
], function(mods, Rest, Modal, Loader, L, Actions, Select, Item){
	const React = mods.ReactPack.default;
	const Pagination = mods.Pagination;
	const {connect} = mods.ReactReduxPack;
	const {fetchData, modifyEmotion, setDependUuid, putDepend} = Actions('audit');
	const {push, replace} = mods.ReduxRouterPack;
	const RangeCal = mods.RangeCal;

	var Audit = React.createClass({
		componentDidMount(){
			const {dispatch} = this.props;
			dispatch(fetchData())
		},
		renderList(){
			const {articles, queryParams, dispatch} = this.props;
			var node;
			node = articles.length > 0 ? (
				<ul className="list-part">
					{
						articles.map((data, idx) => {
							return <Item auditMode modifyEmotion={emot => dispatch(modifyEmotion(data.uuid, emot))} data={data} queryParams={queryParams} putDepend={uuid => {$('#tipModal').modal('show');dispatch(setDependUuid(uuid))}} />
						})
					}
				</ul>
			) : <div className="list-blank-holder">暂无数据</div>

			return node;
		},
		parseDate(){
			var date = this.props.queryParams.date, begin, end, res, reg = /^\d{4}\-\d{2}\-\d{2}$/;
			date = date.split(',');
			begin = $.trim(date[0]);
			end = date[1] ? $.trim(date[1]) : '';
			res = {
				begin: reg.test(begin) ? begin : null,
				end: reg.test(end) ? end : null
			}
			return res
		},
		renderCal(){
			const {queryParams, defaultParams, dispatch} = this.props;
			var date = this.parseDate(),
				handler = val => {
					if(val[0] != '' && val[1] != ''){
						let nowDate = queryParams.date.split(',');
						if(val[0] != nowDate[0] || val[1] != nowDate[1])
							this.sync('date', val.join(','))
					}
					else{
						if(queryParams.date != defaultParams.date)
							this.sync('date', defaultParams['date']);
					}
				}
			var node = <RangeCal className="c-time-range" placeholder="选择日期区间" format="yyyy-MM-dd" value={[date.begin, date.end]} onChange={handler} />

			return node
		},
		renderDate(){
			const {queryParams, defaultParams, dispatch} = this.props;
			var date = {'yesterday': '昨天', 'last_week': '近一周', 'last_month': '近一个月'},
				dat = queryParams['date'],
				txt = date[dat] ? '：' + date[dat] : '';
			var node = (
				<div className="time-range">
					<Select className="dropwrap" holder={<span className="holder">{'日结时间' + txt}</span>}>
						{
							Object.keys(date).map((k, idx) => <li className="dropdown-item" key={idx} onClick={() => this.sync('date', k, {beg: 0})}>{date[k]}</li>)
						}
						{date[dat] ? <li className="dropdown-item"><span className="button" onClick={() => this.sync('date', defaultParams['date'], {beg: 0})}>取消</span></li> : null}
					</Select>
					{this.renderCal()}
				</div>
			)

			return node;
		},
		sync(key, value, opt){
			const {queryParams, location, dispatch} = this.props;
			opt = opt || {};
			let q = $.extend({}, queryParams, {[key]: value}, opt);
			dispatch(push($.extend(true, {}, location, {'query': q})));
		},
		syncPage(page){
			const {defaultParams} = this.props;
			page = page - 1;
			this.sync('beg', page * defaultParams.m);
		},
		render(){
			const {articles, articlesCount, queryParams, location, defaultParams, dispatch, loading} = this.props;
			return (
				<div className="advices-base-audit">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">人工审计</h3>
								{this.renderDate()}
							</div>
							<div className="tab-part">
								<div className="c-tab">
									<ul>
										<li onClick={() => this.sync('audit', 'false', {beg: 0})} className={queryParams.audit == 'false' ? 'active' : ''}>待研判</li>
										<li onClick={() => this.sync('audit', 'true', {beg: 0})} className={queryParams.audit == 'true' ? 'active' : ''}>已研判</li>
									</ul>
								</div>
								<div className="txt">
									{
										queryParams.audit == 'true' ? <span>{'已研判：' + articlesCount + '篇'}</span> : <span>{'待研判：' + articlesCount + '篇'}</span>
									}
								</div>
							</div>
							{this.renderList()}
							<div className="tc pagin-part">
								{
									articlesCount > queryParams.m ? <Pagination current={Math.floor(+queryParams.beg / +queryParams.m) + 1} total={articlesCount > 99 * +queryParams.m ? 99 * +queryParams.m : articlesCount} pageSize={queryParams.m} className={"v2 ib vm mb5"} onChange={page => this.syncPage(page)} /> : null
								}
							</div>
						</div>
					</div>
					<Modal id="tipModal" title="温馨提示" modalSm confirm={() => {$('#tipModal').modal('hide');dispatch(putDepend())}}>
						<div className="tc">
							<p>您确定删除此文章吗？</p>
						</div>
					</Modal>
					<Loader fix show={loading} />
				</div>
			)
		}
	})

	function toProps(state){
		state = state['audit'];
		return {
			queryParams: state.queryParams,
			paramsMirror: state.paramsMirror,
			defaultParams: state.defaultParams,
			articles: Object.keys(state.articles).map(key => state.articles[key]).sort((a, b) => a['__i'] - b['__i']),
			articlesCount: state.articlesCount,
			loading: state.loading
		}
	}

	return connect(toProps)(L()(Audit));
})