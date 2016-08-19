define([paths.rcn.util + '/rest.js', 'mods'], function(R, mods){
	const {push, replace} = mods.ReduxRouterPack;

	return function Action(prefix){
		var rest = R.ex2();
		var restEventsV2 = R.eventsV2();
		var restEx = R.ex();
		const SET_FILTERS = prefix+'SET_FILTERS';
		const SET_FILTERS_MUTIKEY = prefix+'SET_FILTERS_MUTIKEY';
		const SET_FILTERS_MOREKEY = prefix+'SET_FILTERS_MOREKEY';
		const ADD_FILTERS_SELECTED = prefix+'ADD_FILTERS_SELECTED';
		const DELETE_FILTERS_SELECTED = prefix+'DELETE_FILTERS_SELECTED';
		const CLEAR_FILTERS_SELECTED = prefix+'CLEAR_FILTERS_SELECTED';
		const MODIFY_QUERY_PARAMS = prefix+'MODIFY_QUERY_PARAMS';
		const SET_SELECTED_TAGS = prefix+'SET_SELECTED_TAGS';
		const SET_QUERY_PARAMS = prefix+'SET_QUERY_PARAMS';
		const SET_PARAMS_MIRROR = prefix+'SET_PARAMS_MIRROR';
		const SET_ARTICLES = prefix+'SET_ARTICLES';
		const SET_ARTICLES_COUNT = prefix+'SET_ARTICLES_COUNT';
		const SET_REPORT_SELECT_DATA = prefix+'SET_REPORT_SELECT_DATA';
		const SET_EVENT_SELECT_DATA = prefix+'SET_EVENT_SELECT_DATA';
		const MODIFY_ARTICLE = prefix+'MODIFY_ARTICLE';
		const DELETE_ARTICLE = prefix+'DELETE_ARTICLE';
		const ADD_ARTICLE_REPORT = prefix+'ADD_ARTICLE_REPORT';
		const REMOVE_ARTICLE_REPORT = prefix+'REMOVE_ARTICLE_REPORT';
		const ADD_ART_EVENTS = prefix+'ADD_ART_EVENTS';
		const REMOVE_ART_EVENTS = prefix+'REMOVE_ART_EVENTS';
		const DEPEND_MODAL_SHOW = prefix+'DEPEND_MODAL_SHOW';
		const SET_DEPEND_UUID = prefix+'SET_DEPEND_UUID';
		const TOGGLE_LOADING = prefix+'TOGGLE_LOADING';

		function fetchFilters(queryParams){
			return function(dispatch, getState){
				queryParams = queryParams || getState()[prefix]['queryParams'];

				var query = {};
				for(var key in queryParams){
					if(key != 'sort')
						query[key] = queryParams[key];
				}

				rest.article.agg.read('query', query).done(data => {
					if(data.result == true){
						dispatch({
							type: SET_FILTERS,
							data: data.data
						});
						// dispatch({
						// 	type: SET_PARAMS_MIRROR,
						// 	params: queryParams
						// })
					}
				})
				dispatch(getSelectedTags(queryParams))
			}
		}

		function setFilterMutiKey(key){
			return {
				type: SET_FILTERS_MUTIKEY,
				key
			}
		}

		function setFilterMoreKey(key){
			return {
				type: SET_FILTERS_MOREKEY,
				key
			}
		}

		function addFiltersSelected(value){
			return {
				type: ADD_FILTERS_SELECTED,
				value
			}
		}

		function deleteFiltersSelected(value){
			return {
				type: DELETE_FILTERS_SELECTED,
				value
			}
		}

		function clearFiltersSelected(){
			return {
				type: CLEAR_FILTERS_SELECTED
			}
		}

		function chooseFilters(key, value){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'];
				queryParams = Object.assign({}, queryParams, {[key]: value});

				dispatch(fetchData(queryParams));
			}
		}

		function modifyQueryParams(key, value, fetch, isAll = true){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'];
				if(fetch){
					queryParams = $.extend({}, queryParams, {[key]: value});
					dispatch(fetchData(queryParams, isAll));
				} else {
					dispatch({
						type: MODIFY_QUERY_PARAMS,
						key,
						value
					})
				}
			}
		}

		function updateQueryParams(params){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'];
				queryParams = $.extend({}, queryParams, params);
				dispatch({
					type: SET_QUERY_PARAMS,
					queryParams
				})
			}
		}

		function modifyWhile(key, value){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'];
				queryParams = $.extend({}, queryParams, {[key]: value, beg: 0});
				dispatch(fetchData(queryParams));
			}
		}

		function getSelectedTags(queryParams){
			return function(dispatch){
				var res = [], q = [];
				['cat', 'product', 'platform', 'med', 'inc', 'emotion', 'warn', 'production', 'medium', 'level'].forEach(key => {
					if(key == 'inc' && queryParams[key].length > 0){
						q.push(restEventsV2.getname.read({id: queryParams[key]}).done(data => {
							res.push({key: 'inc', value: data.map(dat => dat.name).join(',')});
						}))
					} else if (key == 'med' && ('' + queryParams[key]).length > 0){
						q.push(restEx.media.read('getinfo', {mid: queryParams[key]}).done(data => {
							res.push({key: 'med', value: data.map(dat => dat.name).join(',')})
						}))
					} else {
						res.push({key, value: queryParams[key]});
					}
				});

				$.when.apply(null, q).done(() => {
					dispatch({
						type: SET_SELECTED_TAGS,
						tags: res
					})
				})
			}
		}

		function deleteSelectedTags(key){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'],
					defaultParams = getState()[prefix]['defaultParams'];

				if(key in defaultParams){
					queryParams = $.extend({}, queryParams, {[key]: defaultParams[key]})
				}

				dispatch(fetchData(queryParams));
			}
		}

		function fetchArticles(queryParams){
			return function(dispatch, getState){
				queryParams = queryParams || getState()[prefix]['queryParams'];
				rest.article.data.read('query', queryParams).done(data => {
					if(data.result == true){
						data = data.data;
						dispatch(setArticles(data));
					}
				})
			}
		}

		function setArticles(data){
			return {
				type: SET_ARTICLES,
				data
			}
		}

		function fetchData(queryParams, isAll = true){
			return function(dispatch, getState){
				if(queryParams != undefined)
					var update = true;
				queryParams = queryParams || getState()[prefix]['queryParams'];
				var q = [];
				if(isAll){
					q.push(_fetchFilters(queryParams, dispatch));
					q.push(_fetchArticlesCount(queryParams, dispatch));
				}
				q.push(_fetchArticles(queryParams, dispatch));
				dispatch(toggleLoading(true));
				$.when(...q).done(() => {
				}).always(() => {
					dispatch(toggleLoading(false));
				})
				if(update){
					dispatch({
						type: SET_QUERY_PARAMS,
						queryParams
					})
				}
			}
		}

		function _fetchFilters(queryParams, dispatch){
			var query = {};
			for(var key in queryParams){
				if(key != 'sort')
					query[key] = queryParams[key];
				if(key == 'm')
					query[key] = '';
			}
			dispatch(getSelectedTags(queryParams));
			return $.when(rest.article.agg.read('query', $.extend({}, query, {result: 'industry,product_form,platform,media,event'})).done(data => {
				if(data.result == true){
					dispatch({
						type: SET_PARAMS_MIRROR,
						params: queryParams
					});
					dispatch({
						type: SET_FILTERS,
						data: data.data
					});
				}
			}), rest.article.agg.read('query', $.extend({}, query, {result: 'emotion,warn,production,medium,level'})).done(data => {
				if(data.result == true){
					dispatch({
						type: SET_PARAMS_MIRROR,
						params: queryParams
					});
					dispatch({
						type: SET_FILTERS,
						data: data.data
					});
				}
			}))
		}

		function _fetchArticlesCount(queryParams, dispatch){
			var query = {};
			for(var key in queryParams){
				if(key != 'sort')
					query[key] = queryParams[key];
			}
			return rest.article.count.read('query', query).done(data => {
				if(data.result == true){
					dispatch({
						type: SET_ARTICLES_COUNT,
						count: data.count,
						uniqCount: data.uniq_count
					})
				}
			})
		}

		function _fetchArticles(queryParams, dispatch){
			return rest.article.data.read('query', queryParams).done(data => {
				if(data.result == true){
					data = data.data;
					dispatch(setArticles(data));
				}
			})
		}

		function fetchReportSelectData(){
			return function(dispatch){
				restEx.report.read('recent').done(data => dispatch({
					type: SET_REPORT_SELECT_DATA,
					data
				}));
			}
		}

		function fetchEventSelectData(){
			return function(dispatch){
				restEx.events.read({
					status: 1
				}).done(data => dispatch({
					type: SET_EVENT_SELECT_DATA,
					data
				}));
			}
		}

		function fetchArticlesCount(queryParams){
			return function(dispatch, getState){
				queryParams = queryParams || getState()[prefix]['queryParams'];
				var query = {};
				for(var key in queryParams){
					if(key != 'sort')
						query[key] = queryParams[key];
				}
				rest.article.count.read('query', query).done(data => {
					if(data.result == true){
						dispatch({
							type: SET_ARTICLES_COUNT,
							count: data.count
						})
					}
				})
			}
		}

		function jumpPage(page){
			return function(dispatch, getState){
				var queryParams = getState()[prefix]['queryParams'],
					m = queryParams['m'],
					beg;
				if(page != undefined){
					if(page <= 0)
						page = 1;
					page--;
					beg = page * m;

					queryParams = $.extend({}, queryParams, {beg});

					dispatch(fetchData(queryParams, false));
					dispatch({
						type: SET_QUERY_PARAMS,
						queryParams
					})
				}
			}
		}

		function modifyEmotion(uuid, emotion){
			return function(dispatch, getState){
				var state = getState()[prefix],
					curEmotion = state['queryParams']['emotion'],
					art = state['articles'][uuid],
					defaultEmotion = state['defaultParams']['emotion'],
					emot = emotion;
				emotion = 'manual_' + emotion;
				if(art['emotion'] != emotion){
					dispatch(toggleLoading(true));
					restEx.articles.update('emotion', {
						uuids: [uuid],
						emotion: emot,
						title_sign: art.title_sign
					}).done(data => {
						dispatch(toggleLoading(false));
						if(data.result == true){
							if(curEmotion == defaultEmotion || curEmotion == emotion){
								dispatch(modifyArticle(uuid, 'emotion', emotion));
							} else {
								let length = Object.keys(state['articles']).length;
								if(length == 1){
									setTimeout(() => {
										dispatch(fetchData(undefined, false));
									}, 1000);
								} else {
									dispatch(deleteArticle(uuid));
								}
							}
						}
					})
				}
			}
		}

		function addWarn(uuid){
			return function(dispatch, getState){
				var state = getState()[prefix],
					curWarn = state['queryParams']['warn'],
					art = state['articles'][uuid],
					defaultWarn = state['defaultParams']['warn'],
					isWarn = art.warn != 'none' && art.warn != '' && art.warn;
				dispatch(toggleLoading(true));
				restEx.articles.update('warn', {
					uuids: [uuid]
				}).done(data => {
					dispatch(toggleLoading(false));
					if(curWarn == defaultWarn || curWarn == 'manual'){
						dispatch(modifyArticle(uuid, 'warn', 'manual'));
					} else {
						let length = Object.keys(state['articles']).length;
						if(length == 1){
							dispatch(fetchData(undefined, false));
						} else {
							dispatch(deleteArticle(uuid));
						}
					}
				})
			}
		}

		function ignoreWarn(uuid){
			return function(dispatch, getState){
				var state = getState()[prefix],
					curWarn = state['queryParams']['warn'],
					art = state['articles'][uuid],
					defaultWarn = state['defaultParams']['warn'],
					isWarn = art.warn != 'none' && art.warn != '' && art.warn;
				dispatch(toggleLoading(true));
				restEx.articles.update('nowarn', {
					uuids: [uuid]
				}).done(data => {
					dispatch(toggleLoading(false));
					if(curWarn == defaultWarn || curWarn == 'no'){
						dispatch(modifyArticle(uuid, 'warn', ''));
					} else {
						let length = Object.keys(state['articles']).length;
						if(length == 1){
							dispatch(fetchData(undefined, false));
						} else {
							dispatch(deleteArticle(uuid));
						}
					}
				})
			}
		}

		function modifyArticle(uuid, key, value){
			return {
				type: MODIFY_ARTICLE,
				uuid,
				key,
				value
			}
		}

		function deleteArticle(uuid){
			return {
				type: DELETE_ARTICLE,
				uuid
			}
		}

		function addReport(uuid, report){
			return function(dispatch, getState){
				var state = getState()[prefix],
					art = state['articles'][uuid],
					reportIds;
				if(art['reports']){
					reportIds = art['reports'].map(item => item.id);
				} else {
					reportIds = [];
				}

				if(reportIds.indexOf(report.id) == -1){
					restEx.article.update('reports', {
						uuid,
						reports: [report.id],
						action: 'add'
					}).done(data => {
						if(data.result == true){
							dispatch({
								type: ADD_ARTICLE_REPORT,
								uuid,
								report
							})
						}
					})
				}
			}
		}

		function removeReport(uuid, reportId){
			return function(dispatch, getState){
				var state = getState()[prefix],
					art = state['articles'][uuid],
					reportIds;
				restEx.article.update('reports', {
					uuid,
					reports: [reportId],
					action: 'sub'
				}).done(data => {
					if(data.result == true){
						dispatch({
							type: REMOVE_ARTICLE_REPORT,
							uuid,
							reportId
						})
					}
				})
			}
		}

		function addEvent(uuid, event){
			return function(dispatch, getState){
				var state = getState()[prefix],
					art = state['articles'][uuid],
					events = state['articles'][uuid]['events'];
				if(!events)
					events = [];
				else
					events = events.map(ev => ev.id);

				if(events.indexOf(event.id) == -1){
					dispatch(toggleLoading(true));
					restEx.articles.update('event', {
						articles: [{
							uuid,
							title_sign: art.title_sign
						}],
						event: event.id,
						action: 'add'
					}).done(data => {
						dispatch(toggleLoading(false));
						if(data.result == true){
							dispatch({
								type: ADD_ART_EVENTS,
								uuid,
								event
							})
						}
					})
				}
			}
		}

		function removeEvent(uuid, eventId){
			return function(dispatch, getState){
				var state = getState()[prefix],
					art = state['articles'][uuid];
				dispatch(toggleLoading(true));
				restEx.article.update('events', {
					uuid,
					title_sign: art.title_sign,
					events: [eventId],
					action: 'sub'
				}).done(data => {
					dispatch(toggleLoading(false));
					if(data.result == true){
						dispatch({
							type: REMOVE_ART_EVENTS,
							uuid,
							eventId
						})
					}
				})
			}
		}

		function setQueryParams(queryParams){
			return {
				type: SET_QUERY_PARAMS,
				queryParams
			}
		}

		function sync(key, value, opt){
			return function(dispatch, getState){
				opt = opt || {};
				let q = $.extend({}, queryParams, {[key]: value}, opt);
				dispatch(push($.extend(true, {}, location, {'query': q})));
			}
		}

		function dependModalTog(tog, uuid){
			return {
				type: DEPEND_MODAL_SHOW,
				tog,
				uuid
			}
		}

		function putDepend(){
			return function(dispatch, getState){
				var uuid = getState()[prefix]['dependUuid'],
					arts = getState()[prefix]['articles'];
				if(uuid){
					restEx.articles.update('depend', {
						uuids: [uuid],
						title_sign: arts[uuid].title_sign
					}).done(data => {
						dispatch(dependModalTog(false, ''));
						if(data.result){
							dispatch({
								type: DELETE_ARTICLE,
								uuid
							})
							if(Object.keys(arts).length == 1){
								setTimeout(() => {
									dispatch(fetchData(undefined, false));
								}, 1000)
							}
						}
					})
				}
			}
		}

		function setDependUuid(uuid){
			return {
				type: SET_DEPEND_UUID,
				uuid
			}
		}

		function toggleLoading(show){
			return {
				type: TOGGLE_LOADING,
				show
			}
		}

		return {
			SET_FILTERS,
			SET_FILTERS_MUTIKEY,
			SET_FILTERS_MOREKEY,
			ADD_FILTERS_SELECTED,
			DELETE_FILTERS_SELECTED,
			CLEAR_FILTERS_SELECTED,
			MODIFY_QUERY_PARAMS,
			SET_SELECTED_TAGS,
			SET_QUERY_PARAMS,
			SET_PARAMS_MIRROR,
			SET_ARTICLES,
			SET_REPORT_SELECT_DATA,
			SET_EVENT_SELECT_DATA,
			SET_ARTICLES_COUNT,
			MODIFY_ARTICLE,
			DELETE_ARTICLE,
			ADD_ARTICLE_REPORT,
			REMOVE_ARTICLE_REPORT,
			ADD_ART_EVENTS,
			REMOVE_ART_EVENTS,
			DEPEND_MODAL_SHOW,
			SET_DEPEND_UUID,
			TOGGLE_LOADING,
			fetchFilters,
			fetchData,
			setFilterMutiKey,
			setFilterMoreKey,
			addFiltersSelected,
			deleteFiltersSelected,
			clearFiltersSelected,
			chooseFilters,
			deleteSelectedTags,
			modifyQueryParams,
			fetchReportSelectData,
			fetchEventSelectData,
			jumpPage,
			modifyWhile,
			modifyEmotion,
			addWarn,
			ignoreWarn,
			addReport,
			removeReport,
			addEvent,
			removeEvent,
			setQueryParams,
			updateQueryParams,
			dependModalTog,
			putDepend,
			setDependUuid
		}
	}
})