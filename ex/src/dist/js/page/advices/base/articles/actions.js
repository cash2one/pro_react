'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([paths.rcn.util + '/rest.js', 'mods'], function (R, mods) {
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var push = _mods$ReduxRouterPack.push;
	var replace = _mods$ReduxRouterPack.replace;


	return function Action(prefix) {
		var rest = R.ex2();
		var restEventsV2 = R.eventsV2();
		var restEx = R.ex();
		var SET_FILTERS = prefix + 'SET_FILTERS';
		var SET_FILTERS_MUTIKEY = prefix + 'SET_FILTERS_MUTIKEY';
		var SET_FILTERS_MOREKEY = prefix + 'SET_FILTERS_MOREKEY';
		var ADD_FILTERS_SELECTED = prefix + 'ADD_FILTERS_SELECTED';
		var DELETE_FILTERS_SELECTED = prefix + 'DELETE_FILTERS_SELECTED';
		var CLEAR_FILTERS_SELECTED = prefix + 'CLEAR_FILTERS_SELECTED';
		var MODIFY_QUERY_PARAMS = prefix + 'MODIFY_QUERY_PARAMS';
		var SET_SELECTED_TAGS = prefix + 'SET_SELECTED_TAGS';
		var SET_QUERY_PARAMS = prefix + 'SET_QUERY_PARAMS';
		var SET_PARAMS_MIRROR = prefix + 'SET_PARAMS_MIRROR';
		var SET_ARTICLES = prefix + 'SET_ARTICLES';
		var SET_ARTICLES_COUNT = prefix + 'SET_ARTICLES_COUNT';
		var SET_REPORT_SELECT_DATA = prefix + 'SET_REPORT_SELECT_DATA';
		var SET_EVENT_SELECT_DATA = prefix + 'SET_EVENT_SELECT_DATA';
		var MODIFY_ARTICLE = prefix + 'MODIFY_ARTICLE';
		var DELETE_ARTICLE = prefix + 'DELETE_ARTICLE';
		var ADD_ARTICLE_REPORT = prefix + 'ADD_ARTICLE_REPORT';
		var REMOVE_ARTICLE_REPORT = prefix + 'REMOVE_ARTICLE_REPORT';
		var ADD_ART_EVENTS = prefix + 'ADD_ART_EVENTS';
		var REMOVE_ART_EVENTS = prefix + 'REMOVE_ART_EVENTS';
		var DEPEND_MODAL_SHOW = prefix + 'DEPEND_MODAL_SHOW';
		var SET_DEPEND_UUID = prefix + 'SET_DEPEND_UUID';
		var TOGGLE_LOADING = prefix + 'TOGGLE_LOADING';

		function fetchFilters(queryParams) {
			return function (dispatch, getState) {
				queryParams = queryParams || getState()[prefix]['queryParams'];

				var query = {};
				for (var key in queryParams) {
					if (key != 'sort') query[key] = queryParams[key];
				}

				rest.article.agg.read('query', query).done(function (data) {
					if (data.result == true) {
						dispatch({
							type: SET_FILTERS,
							data: data.data
						});
						// dispatch({
						// 	type: SET_PARAMS_MIRROR,
						// 	params: queryParams
						// })
					}
				});
				dispatch(getSelectedTags(queryParams));
			};
		}

		function setFilterMutiKey(key) {
			return {
				type: SET_FILTERS_MUTIKEY,
				key: key
			};
		}

		function setFilterMoreKey(key) {
			return {
				type: SET_FILTERS_MOREKEY,
				key: key
			};
		}

		function addFiltersSelected(value) {
			return {
				type: ADD_FILTERS_SELECTED,
				value: value
			};
		}

		function deleteFiltersSelected(value) {
			return {
				type: DELETE_FILTERS_SELECTED,
				value: value
			};
		}

		function clearFiltersSelected() {
			return {
				type: CLEAR_FILTERS_SELECTED
			};
		}

		function chooseFilters(key, value) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix]['queryParams'];
				queryParams = _extends({}, queryParams, _defineProperty({}, key, value));

				dispatch(fetchData(queryParams));
			};
		}

		function modifyQueryParams(key, value, fetch) {
			var isAll = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

			return function (dispatch, getState) {
				var queryParams = getState()[prefix]['queryParams'];
				if (fetch) {
					queryParams = $.extend({}, queryParams, _defineProperty({}, key, value));
					dispatch(fetchData(queryParams, isAll));
				} else {
					dispatch({
						type: MODIFY_QUERY_PARAMS,
						key: key,
						value: value
					});
				}
			};
		}

		function updateQueryParams(params) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix]['queryParams'];
				queryParams = $.extend({}, queryParams, params);
				dispatch({
					type: SET_QUERY_PARAMS,
					queryParams: queryParams
				});
			};
		}

		function modifyWhile(key, value) {
			return function (dispatch, getState) {
				var _$$extend2;

				var queryParams = getState()[prefix]['queryParams'];
				queryParams = $.extend({}, queryParams, (_$$extend2 = {}, _defineProperty(_$$extend2, key, value), _defineProperty(_$$extend2, 'beg', 0), _$$extend2));
				dispatch(fetchData(queryParams));
			};
		}

		function getSelectedTags(queryParams) {
			return function (dispatch) {
				var res = [],
				    q = [];
				['cat', 'product', 'platform', 'med', 'inc', 'emotion', 'warn', 'production', 'medium', 'level'].forEach(function (key) {
					if (key == 'inc' && queryParams[key].length > 0) {
						q.push(restEventsV2.getname.read({ id: queryParams[key] }).done(function (data) {
							res.push({ key: 'inc', value: data.map(function (dat) {
									return dat.name;
								}).join(',') });
						}));
					} else if (key == 'med' && ('' + queryParams[key]).length > 0) {
						q.push(restEx.media.read('getinfo', { mid: queryParams[key] }).done(function (data) {
							res.push({ key: 'med', value: data.map(function (dat) {
									return dat.name;
								}).join(',') });
						}));
					} else {
						res.push({ key: key, value: queryParams[key] });
					}
				});

				$.when.apply(null, q).done(function () {
					dispatch({
						type: SET_SELECTED_TAGS,
						tags: res
					});
				});
			};
		}

		function deleteSelectedTags(key) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix]['queryParams'],
				    defaultParams = getState()[prefix]['defaultParams'];

				if (key in defaultParams) {
					queryParams = $.extend({}, queryParams, _defineProperty({}, key, defaultParams[key]));
				}

				dispatch(fetchData(queryParams));
			};
		}

		function fetchArticles(queryParams) {
			return function (dispatch, getState) {
				queryParams = queryParams || getState()[prefix]['queryParams'];
				rest.article.data.read('query', queryParams).done(function (data) {
					if (data.result == true) {
						data = data.data;
						dispatch(setArticles(data));
					}
				});
			};
		}

		function setArticles(data) {
			return {
				type: SET_ARTICLES,
				data: data
			};
		}

		function fetchData(queryParams) {
			var isAll = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			return function (dispatch, getState) {
				var _$;

				if (queryParams != undefined) var update = true;
				queryParams = queryParams || getState()[prefix]['queryParams'];
				var q = [];
				if (isAll) {
					q.push(_fetchFilters(queryParams, dispatch));
					q.push(_fetchArticlesCount(queryParams, dispatch));
				}
				q.push(_fetchArticles(queryParams, dispatch));
				dispatch(toggleLoading(true));
				(_$ = $).when.apply(_$, q).done(function () {}).always(function () {
					dispatch(toggleLoading(false));
				});
				if (update) {
					dispatch({
						type: SET_QUERY_PARAMS,
						queryParams: queryParams
					});
				}
			};
		}

		function _fetchFilters(queryParams, dispatch) {
			var query = {};
			for (var key in queryParams) {
				if (key != 'sort') query[key] = queryParams[key];
				if (key == 'm') query[key] = '';
			}
			dispatch(getSelectedTags(queryParams));
			return $.when(rest.article.agg.read('query', $.extend({}, query, { result: 'industry,product_form,platform,media,event' })).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: SET_PARAMS_MIRROR,
						params: queryParams
					});
					dispatch({
						type: SET_FILTERS,
						data: data.data
					});
				}
			}), rest.article.agg.read('query', $.extend({}, query, { result: 'emotion,warn,production,medium,level' })).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: SET_PARAMS_MIRROR,
						params: queryParams
					});
					dispatch({
						type: SET_FILTERS,
						data: data.data
					});
				}
			}));
		}

		function _fetchArticlesCount(queryParams, dispatch) {
			var query = {};
			for (var key in queryParams) {
				if (key != 'sort') query[key] = queryParams[key];
			}
			return rest.article.count.read('query', query).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: SET_ARTICLES_COUNT,
						count: data.count
					});
				}
			});
		}

		function _fetchArticles(queryParams, dispatch) {
			return rest.article.data.read('query', queryParams).done(function (data) {
				if (data.result == true) {
					data = data.data;
					dispatch(setArticles(data));
				}
			});
		}

		function fetchReportSelectData() {
			return function (dispatch) {
				restEx.report.read('recent').done(function (data) {
					return dispatch({
						type: SET_REPORT_SELECT_DATA,
						data: data
					});
				});
			};
		}

		function fetchEventSelectData() {
			return function (dispatch) {
				restEx.events.read({
					status: 1
				}).done(function (data) {
					return dispatch({
						type: SET_EVENT_SELECT_DATA,
						data: data
					});
				});
			};
		}

		function fetchArticlesCount(queryParams) {
			return function (dispatch, getState) {
				queryParams = queryParams || getState()[prefix]['queryParams'];
				var query = {};
				for (var key in queryParams) {
					if (key != 'sort') query[key] = queryParams[key];
				}
				rest.article.count.read('query', query).done(function (data) {
					if (data.result == true) {
						dispatch({
							type: SET_ARTICLES_COUNT,
							count: data.count
						});
					}
				});
			};
		}

		function jumpPage(page) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix]['queryParams'],
				    m = queryParams['m'],
				    beg;
				if (page != undefined) {
					if (page <= 0) page = 1;
					page--;
					beg = page * m;

					queryParams = $.extend({}, queryParams, { beg: beg });

					dispatch(fetchData(queryParams, false));
					dispatch({
						type: SET_QUERY_PARAMS,
						queryParams: queryParams
					});
				}
			};
		}

		function modifyEmotion(uuid, emotion) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    curEmotion = state['queryParams']['emotion'],
				    art = state['articles'][uuid],
				    defaultEmotion = state['defaultParams']['emotion'],
				    emot = emotion;
				emotion = 'manual_' + emotion;
				if (art['emotion'] != emotion) {
					dispatch(toggleLoading(true));
					restEx.articles.update('emotion', {
						uuids: [uuid],
						emotion: emot,
						title_sign: art.title_sign
					}).done(function (data) {
						dispatch(toggleLoading(false));
						if (data.result == true) {
							if (curEmotion == defaultEmotion || curEmotion == emotion) {
								dispatch(modifyArticle(uuid, 'emotion', emotion));
							} else {
								var length = Object.keys(state['articles']).length;
								if (length == 1) {
									setTimeout(function () {
										dispatch(fetchData(undefined, false));
									}, 1000);
								} else {
									dispatch(deleteArticle(uuid));
								}
							}
						}
					});
				}
			};
		}

		function addWarn(uuid) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    curWarn = state['queryParams']['warn'],
				    art = state['articles'][uuid],
				    defaultWarn = state['defaultParams']['warn'],
				    isWarn = art.warn != 'none' && art.warn != '' && art.warn;
				dispatch(toggleLoading(true));
				restEx.articles.update('warn', {
					uuids: [uuid]
				}).done(function (data) {
					dispatch(toggleLoading(false));
					if (curWarn == defaultWarn || curWarn == 'manual') {
						dispatch(modifyArticle(uuid, 'warn', 'manual'));
					} else {
						var length = Object.keys(state['articles']).length;
						if (length == 1) {
							dispatch(fetchData(undefined, false));
						} else {
							dispatch(deleteArticle(uuid));
						}
					}
				});
			};
		}

		function ignoreWarn(uuid) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    curWarn = state['queryParams']['warn'],
				    art = state['articles'][uuid],
				    defaultWarn = state['defaultParams']['warn'],
				    isWarn = art.warn != 'none' && art.warn != '' && art.warn;
				dispatch(toggleLoading(true));
				restEx.articles.update('nowarn', {
					uuids: [uuid]
				}).done(function (data) {
					dispatch(toggleLoading(false));
					if (curWarn == defaultWarn || curWarn == 'no') {
						dispatch(modifyArticle(uuid, 'warn', ''));
					} else {
						var length = Object.keys(state['articles']).length;
						if (length == 1) {
							dispatch(fetchData(undefined, false));
						} else {
							dispatch(deleteArticle(uuid));
						}
					}
				});
			};
		}

		function modifyArticle(uuid, key, value) {
			return {
				type: MODIFY_ARTICLE,
				uuid: uuid,
				key: key,
				value: value
			};
		}

		function deleteArticle(uuid) {
			return {
				type: DELETE_ARTICLE,
				uuid: uuid
			};
		}

		function addReport(uuid, report) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    art = state['articles'][uuid],
				    reportIds;
				if (art['reports']) {
					reportIds = art['reports'].map(function (item) {
						return item.id;
					});
				} else {
					reportIds = [];
				}

				if (reportIds.indexOf(report.id) == -1) {
					restEx.article.update('reports', {
						uuid: uuid,
						reports: [report.id],
						action: 'add'
					}).done(function (data) {
						if (data.result == true) {
							dispatch({
								type: ADD_ARTICLE_REPORT,
								uuid: uuid,
								report: report
							});
						}
					});
				}
			};
		}

		function removeReport(uuid, reportId) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    art = state['articles'][uuid],
				    reportIds;
				restEx.article.update('reports', {
					uuid: uuid,
					reports: [reportId],
					action: 'sub'
				}).done(function (data) {
					if (data.result == true) {
						dispatch({
							type: REMOVE_ARTICLE_REPORT,
							uuid: uuid,
							reportId: reportId
						});
					}
				});
			};
		}

		function addEvent(uuid, event) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    art = state['articles'][uuid],
				    events = state['articles'][uuid]['events'];
				if (!events) events = [];else events = events.map(function (ev) {
					return ev.id;
				});

				if (events.indexOf(event.id) == -1) {
					dispatch(toggleLoading(true));
					restEx.articles.update('event', {
						articles: [{
							uuid: uuid,
							title_sign: art.title_sign
						}],
						event: event.id,
						action: 'add'
					}).done(function (data) {
						dispatch(toggleLoading(false));
						if (data.result == true) {
							dispatch({
								type: ADD_ART_EVENTS,
								uuid: uuid,
								event: event
							});
						}
					});
				}
			};
		}

		function removeEvent(uuid, eventId) {
			return function (dispatch, getState) {
				var state = getState()[prefix],
				    art = state['articles'][uuid];
				dispatch(toggleLoading(true));
				restEx.article.update('events', {
					uuid: uuid,
					title_sign: art.title_sign,
					events: [eventId],
					action: 'sub'
				}).done(function (data) {
					dispatch(toggleLoading(false));
					if (data.result == true) {
						dispatch({
							type: REMOVE_ART_EVENTS,
							uuid: uuid,
							eventId: eventId
						});
					}
				});
			};
		}

		function setQueryParams(queryParams) {
			return {
				type: SET_QUERY_PARAMS,
				queryParams: queryParams
			};
		}

		function sync(key, value, opt) {
			return function (dispatch, getState) {
				opt = opt || {};
				var q = $.extend({}, queryParams, _defineProperty({}, key, value), opt);
				dispatch(push($.extend(true, {}, location, { 'query': q })));
			};
		}

		function dependModalTog(tog, uuid) {
			return {
				type: DEPEND_MODAL_SHOW,
				tog: tog,
				uuid: uuid
			};
		}

		function putDepend() {
			return function (dispatch, getState) {
				var uuid = getState()[prefix]['dependUuid'],
				    arts = getState()[prefix]['articles'];
				if (uuid) {
					restEx.articles.update('depend', {
						uuids: [uuid]
					}).done(function (data) {
						dispatch(dependModalTog(false, ''));
						if (data.result) {
							dispatch({
								type: DELETE_ARTICLE,
								uuid: uuid
							});
							if (Object.keys(arts).length == 1) {
								setTimeout(function () {
									dispatch(fetchData(undefined, false));
								}, 1000);
							}
						}
					});
				}
			};
		}

		function setDependUuid(uuid) {
			return {
				type: SET_DEPEND_UUID,
				uuid: uuid
			};
		}

		function toggleLoading(show) {
			return {
				type: TOGGLE_LOADING,
				show: show
			};
		}

		return {
			SET_FILTERS: SET_FILTERS,
			SET_FILTERS_MUTIKEY: SET_FILTERS_MUTIKEY,
			SET_FILTERS_MOREKEY: SET_FILTERS_MOREKEY,
			ADD_FILTERS_SELECTED: ADD_FILTERS_SELECTED,
			DELETE_FILTERS_SELECTED: DELETE_FILTERS_SELECTED,
			CLEAR_FILTERS_SELECTED: CLEAR_FILTERS_SELECTED,
			MODIFY_QUERY_PARAMS: MODIFY_QUERY_PARAMS,
			SET_SELECTED_TAGS: SET_SELECTED_TAGS,
			SET_QUERY_PARAMS: SET_QUERY_PARAMS,
			SET_PARAMS_MIRROR: SET_PARAMS_MIRROR,
			SET_ARTICLES: SET_ARTICLES,
			SET_REPORT_SELECT_DATA: SET_REPORT_SELECT_DATA,
			SET_EVENT_SELECT_DATA: SET_EVENT_SELECT_DATA,
			SET_ARTICLES_COUNT: SET_ARTICLES_COUNT,
			MODIFY_ARTICLE: MODIFY_ARTICLE,
			DELETE_ARTICLE: DELETE_ARTICLE,
			ADD_ARTICLE_REPORT: ADD_ARTICLE_REPORT,
			REMOVE_ARTICLE_REPORT: REMOVE_ARTICLE_REPORT,
			ADD_ART_EVENTS: ADD_ART_EVENTS,
			REMOVE_ART_EVENTS: REMOVE_ART_EVENTS,
			DEPEND_MODAL_SHOW: DEPEND_MODAL_SHOW,
			SET_DEPEND_UUID: SET_DEPEND_UUID,
			TOGGLE_LOADING: TOGGLE_LOADING,
			fetchFilters: fetchFilters,
			fetchData: fetchData,
			setFilterMutiKey: setFilterMutiKey,
			setFilterMoreKey: setFilterMoreKey,
			addFiltersSelected: addFiltersSelected,
			deleteFiltersSelected: deleteFiltersSelected,
			clearFiltersSelected: clearFiltersSelected,
			chooseFilters: chooseFilters,
			deleteSelectedTags: deleteSelectedTags,
			modifyQueryParams: modifyQueryParams,
			fetchReportSelectData: fetchReportSelectData,
			fetchEventSelectData: fetchEventSelectData,
			jumpPage: jumpPage,
			modifyWhile: modifyWhile,
			modifyEmotion: modifyEmotion,
			addWarn: addWarn,
			ignoreWarn: ignoreWarn,
			addReport: addReport,
			removeReport: removeReport,
			addEvent: addEvent,
			removeEvent: removeEvent,
			setQueryParams: setQueryParams,
			updateQueryParams: updateQueryParams,
			dependModalTog: dependModalTog,
			putDepend: putDepend,
			setDependUuid: setDependUuid
		};
	};
});