define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/base/articles/actions.js',
	paths.ex.page + '/advices/base/articles/filters.js',
	paths.ex.page + '/advices/base/articles/while.js',
	paths.ex.page + '/advices/base/articles/order.js',
	paths.ex.page + '/advices/base/articles/article-list.js',
	paths.ex.page + '/advices/base/articles/search.js',
	paths.ex.page + '/advices/base/articles/cur-filter.js',
	paths.ex.page + '/advices/base/articles/time-filter.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.comps + '/loader.js',
	paths.rcn.lib + '/bootstrap.min.js'
], function(mods, R, Actions, Filters, While, Order, ArtList, Search, CurFilter, Timefilter, Modal, Loader){
	var React = mods.ReactPack.default,
		Pagination = mods.Pagination,
		{connect} = mods.ReactReduxPack,
		{push, replace} = mods.ReduxRouterPack;

	const {fetchData, setFilterMutiKey, setFilterMoreKey, addFiltersSelected, deleteFiltersSelected, clearFiltersSelected, chooseFilters, deleteSelectedTags, modifyQueryParams, fetchReportSelectData, fetchEventSelectData, jumpPage, modifyWhile, modifyEmotion, addWarn, ignoreWarn, addReport, removeReport, addEvent, removeEvent, setQueryParams, updateQueryParams, dependModalTog, putDepend, setDependUuid} = Actions('articles');

	var all = ['app', 'wd', 'date', 'emotion', 'level', 'production', 'medium', 'warn', 'product', 'platform', 'med', 'inc', 'cat'];
	var notall = ['beg', 'sort'];
	var parse = ['m', 'uniq', 'result', 'ct'];
	var silence = [];

	function parseParams(location, params){
		var res = {};
		Object.keys(location).forEach(key => {
			if(key in params && parse.indexOf(key) == -1){
				res[key] = location[key]
			}
		});
		return res;
	}

	function isDiff(obj1, obj2){
		var res = false;
		Object.keys(obj1).forEach(key => {
			if(obj1[key] != obj2[key])
				res = true;
		})
		return res;
	}

	function findUpdateKeys(n, o){
		var arr_all = [], arr_notall = [], arr_silence = [];
		for(var key in n){
			if(key in o){
				if(n[key] != o[key]){
					if(all.indexOf(key) != -1){
						arr_all.push(key);
					} else if (notall.indexOf(key) != -1){
						arr_notall.push(key);
					} else if (silence.indexOf(key) != -1){
						arr_silence.push(key);
					}
				}
			}
		}
		return {
			all: arr_all,
			notall: arr_notall,
			silence: arr_silence
		}
	}

	var Articles = React.createClass({
		componentWillMount(){
			const {location, defaultParams, dispatch} = this.props;
			var query = parseParams(location.query, defaultParams);

			query = $.extend({}, defaultParams, query);
			var l = $.extend({}, location, {query});

			// dispatch(setLocation(l));
			dispatch(replace(l));
			dispatch(setQueryParams(query))
		},
		componentDidMount(){
			$('.frame-body-container').addClass('fix');

			const {dispatch} = this.props;
			dispatch(fetchData());
			dispatch(fetchReportSelectData());
			dispatch(fetchEventSelectData());
		},
		componentDidUpdate(prev){
			var dispatch = this.props.dispatch,
				curKeys = this.props.queryParams,
				curLocation = this.props.location.query,
				newKeys = {},
				pass = false;

			newKeys = parseParams(curLocation, curKeys);
			pass = isDiff(newKeys, curKeys);

			if(!$.isEmptyObject(newKeys) && pass){
				newKeys = $.extend({}, curKeys, newKeys);
				var update = findUpdateKeys(newKeys, curKeys);
				if(update.all.length > 0){
					dispatch(fetchData(newKeys));
				} else if (update.notall.length){
					dispatch(fetchData(newKeys, false));
				} else if (update.silence.length){
					dispatch(updateQueryParams(newKeys));
				}
			}
		},
		componentWillUnmount(){
			$('.frame-body-container').removeClass('fix');
		},
		render(){
			const {dispatch, filters, filters_selected, queryParams, paramsMirror, selected_tags, defaultParams, articles, reportSelectData, eventSelectData, articlesCount, location, dependModalShow, loading} = this.props;
			var sync = (key, value, opt) => {
				opt = opt || {};
				let q = $.extend({}, queryParams, {[key]: value}, opt);
				dispatch(push($.extend(true, {}, location, {'query': q})));
			}
			var syncPage = page => {
				page = page - 1;
				sync('beg', page * defaultParams.m);
			}
			return (
				<div className="advices-base2">
					<section className="main-part">
						<Search
							queryParams={queryParams}
							toggle={(key, value, opt) => sync(key, value, opt)}
							search={value => sync('wd', value, {'beg': 0})}
							onInput={value => dispatch(modifyQueryParams('wd', value))} />
						<section className="list-part">
							<Timefilter 
								toggleClick={(key, value) => sync(key, value, {beg: 0})}
								queryParams={queryParams}
								defaultParams={defaultParams} />
							<ArtList
								queryParams={queryParams}
								data={articles}
								reportSelectData={reportSelectData}
								eventSelectData={eventSelectData}
								modifyEmotion={(uuid, emotion) => {dispatch(modifyEmotion(uuid, emotion))}}
								addWarn={uuid => dispatch(addWarn(uuid))}
								ignoreWarn={uuid => dispatch(ignoreWarn(uuid))}
								addReport={(uuid, report) => dispatch(addReport(uuid, report))}
								removeReport={(uuid, reportId) => dispatch(removeReport(uuid, reportId))}
								addEvent={(uuid, event) => dispatch(addEvent(uuid, event))}
								removeEvent={(uuid, eventId) => dispatch(removeEvent(uuid, eventId))}
								putDepend={uuid => {$('#tipModal').modal('show');dispatch(dependModalTog(true, uuid))}} />
							<div className="tc pagin-part">
								{
									articlesCount > queryParams.m ? <Pagination current={Math.floor(+queryParams.beg / +queryParams.m) + 1} total={articlesCount > 99 * +queryParams.m ? 99 * +queryParams.m : articlesCount} pageSize={queryParams.m} className={"v2 ib vm mb5"} onChange={page => syncPage(page)} /> : null
								}
								{
									articlesCount > 0 ? <span className="ib vm txt">{'相关文章总数：' + articlesCount + '篇'}</span> : null
								}
							</div>
						</section>
					</section>
					<section className="filter-part">
						<div className="head">
							<CurFilter defaultParams={defaultParams} tags={selected_tags} deleteClick={(key, value) => sync(key, value)} clearAll={(a1,a2,res) => sync(a1,a2,res)} />
						</div>
						<Filters
							data={filters.data}
							filtersSelected={filters_selected}
							queryParams={queryParams}
							defaultParams={defaultParams}
							paramsMirror={paramsMirror}
							mutiKey={filters.mutiKey}
							moreKey={filters.moreKey}
							mutiClick={key => {dispatch(setFilterMutiKey(key))}}
							moreClick={key => dispatch(setFilterMoreKey(key))}
							addSelected={value => dispatch(addFiltersSelected(value))}
							deleteSelected={value => dispatch(deleteFiltersSelected(value))}
							clearSelected={value => dispatch(clearFiltersSelected())}
							chooseFilters={(key, value) => sync(key, value, {beg: 0})}
						/>
					</section>
					<Modal id="tipModal" title="温馨提示" modalSm confirm={() => {$('#tipModal').modal('hide');dispatch(putDepend())}}>
						<div className="tc">
							<p>您确定删除此文章吗？</p>
						</div>
					</Modal>
					<Loader show={loading} />
				</div>
			)
		}
	})

	function toProps(state){
		state = state['articles'];
		return {
			filters: state.filters,
			filters_selected: state.filters_selected,
			queryParams: state.queryParams,
			paramsMirror: state.paramsMirror,
			selected_tags: state.selected_tags,
			defaultParams: state.defaultParams,
			articles: Object.keys(state.articles).map(key => state.articles[key]).sort((a, b) => a['__i'] - b['__i']),
			reportSelectData: state.reportSelectData,
			eventSelectData: state.eventSelectData,
			articlesCount: state.articlesCount,
			dependModalShow: state.dependModalShow,
			loading: state.loading
		}
	}

	return connect(toProps)(Articles);
})