'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define([paths.rcn.util + '/rest.js'], function (Rest) {

	function gen(prefix) {
		if (!prefix) return;
		var rest = Rest.ex();
		var CHANGE_FILTER = prefix + 'CHANGE_FILTER';
		var RECEIVE_ART_DATA = prefix + 'RECEIVE_ART_DATA';
		var RECEIVE_CATE_FILTER = prefix + 'RECEIVE_CATE_FILTER';
		var RECEIVE_REPORT_SELECT_DATA = prefix + 'RECEIVE_REPORT_SELECT_DATA';
		var RECEIVE_EVENT_SELECT_DATA = prefix + 'RECEIVE_EVENT_SELECT_DATA';
		var MODIFY_ART_SELECT = prefix + 'MODIFY_ART_SELECT';
		var ADD_ART_REPORTS = prefix + 'ADD_ART_REPORTS';
		var ADD_ART_EVENTS = prefix + 'ADD_ART_EVENTS';
		var DELETE_ART = prefix + 'DELETE_ART';
		var ADD_ART_EMOTION = prefix + 'ADD_ART_EMOTION';
		var RECEIVE_ART_COUNT = prefix + 'RECEIVE_ART_COUNT';
		var CHANGE_QUERY_BEGIN = prefix + 'CHANGE_QUERY_BEGIN';
		var ADD_ART_WARN = prefix + 'ADD_ART_WARN';
		var IGNORE_ART_WARN = prefix + 'IGNORE_ART_WARN';
		var SET_EVENT_ID_TO_QUERYPARAMS = prefix + 'SET_EVENT_ID_TO_QUERYPARAMS';
		var ERROR_MODAL_SHOW = prefix + 'ERROR_MODAL_SHOW';
		var END_UPDATE = prefix + 'END_UPDATE';
		var BEGIN_UPDATE = prefix + 'BEGIN_UPDATE';
		var LOADING = prefix + 'LOADING';
		var DEPEND_MODAL_SHOW = prefix + 'DEPEND_MODAL_SHOW';

		function load(status) {
			return {
				type: LOADING,
				status: status
			};
		}

		function dependModalTog(tog) {
			return {
				type: DEPEND_MODAL_SHOW,
				tog: tog
			};
		}

		function now() {
			var n = new Date();
			return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate() + ' ' + n.getHours() + ':' + n.getMinutes();
		}

		function endUpdate() {
			return {
				type: END_UPDATE,
				time: now()
			};
		}

		function beginUpdate() {
			return {
				type: BEGIN_UPDATE
			};
		}

		function errorModalShow(show, msg) {
			return {
				type: ERROR_MODAL_SHOW,
				show: show,
				msg: msg || ''
			};
		}

		function changeFilter(modify) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix].queryParams;
				modify = _extends({}, modify, { begin: 0 });
				queryParams = _extends({}, queryParams, modify);
				dispatch(fetchData(queryParams));
				dispatch({
					type: CHANGE_FILTER,
					modify: modify
				});
				dispatch(resetArtSelect());
			};
		}

		function presetFilter(modify) {
			return {
				type: CHANGE_FILTER,
				modify: modify
			};
		}

		function fetchByUrl(modify, onlyPage) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix].queryParams;
				modify = _extends({}, modify);
				queryParams = _extends({}, queryParams, modify);
				if (onlyPage) dispatch(getListData(queryParams));else dispatch(fetchData(queryParams));
				dispatch({
					type: CHANGE_FILTER,
					modify: modify
				});
				dispatch(resetArtSelect());
			};
		}

		function getListData(queryParams, isFresh) {
			return function (dispatch, getState) {
				dispatch(load(true));
				if (isFresh) dispatch(beginUpdate());
				queryParams = queryParams || getState()[prefix].queryParams;
				rest.articles.read(queryParams).done(function (data) {
					dispatch({ type: RECEIVE_ART_DATA, data: data });
					dispatch(load(false));
					if (isFresh) dispatch(endUpdate());
				});
			};
		}

		function fetchData(queryParams, isFresh) {
			return function (dispatch, getState) {
				queryParams = queryParams || getState()[prefix].queryParams;
				dispatch(getListData(queryParams, isFresh));
				dispatch(getPageCount(queryParams));
			};
		}

		function getCategory(count) {
			return function (dispatch) {
				rest.category.read({
					begin: 0,
					count: count || 20
				}).done(function (data) {
					var cate = {
						title: '自定义分类',
						items: [{
							title: '全部',
							key: 'all'
						}].concat(_toConsumableArray(data.map(function (item) {
							return { title: item.name, key: item.id };
						})))
					};
					dispatch({
						type: RECEIVE_CATE_FILTER,
						data: cate
					});
				});
			};
		}

		function getReportSelectData() {
			return function (dispatch) {
				rest.report.read('recent').done(function (data) {
					return dispatch({
						type: RECEIVE_REPORT_SELECT_DATA,
						data: data
					});
				});
			};
		}

		function getEventSelectData() {
			return function (dispatch) {
				rest.events.read({
					status: 1
				}).done(function (data) {
					return dispatch({
						type: RECEIVE_EVENT_SELECT_DATA,
						data: data
					});
				});
			};
		}

		function addArtSelect(uuid) {
			return {
				type: MODIFY_ART_SELECT,
				flag: 'add',
				uuid: uuid
			};
		}

		function removeArtSelect(uuid) {
			return {
				type: MODIFY_ART_SELECT,
				flag: 'remove',
				uuid: uuid
			};
		}

		function resetArtSelect() {
			return {
				type: MODIFY_ART_SELECT,
				flag: 'reset'
			};
		}

		function addReport(report) {
			return function (dispatch, getState) {
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				var uuids = uuids.filter(function (uuid) {
					var item = byIds[uuid];
					// return (item.reports || []).indexOf(report) == -1;
					return !has(item.reports, 'id', report.id);
				});

				if (uuids.length > 0) {
					dispatch(load(true));
					rest.articles.update('report', {
						uuids: uuids,
						report: report.id,
						action: 'add'
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							dispatch({
								type: ADD_ART_REPORTS,
								uuids: uuids,
								report: report
							});
						}
					});
				}

				dispatch(resetArtSelect());
			};
		}

		function has(arr, key, val) {
			arr = arr || [];
			var res = false;
			if (!key || !val) return res;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i][key] == val) {
					res = true;
					break;
				}
			}
			return res;
		}

		function addEvent(event) {
			return function (dispatch, getState) {
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(function (uuid) {
					var item = byIds[uuid];
					// return (item.events || []).indexOf(event.title) == -1;
					return !has(item.events, 'id', event.id);
				});

				if (uuids.length > 0) {
					dispatch(load(true));
					var articles = uuids.map(function (uuid) {
						var item = byIds[uuid];
						return {
							uuid: uuid,
							title_sign: item.title_sign
						};
					});
					rest.articles.update('event', {
						articles: articles,
						event: event.id,
						action: 'add'
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							dispatch({
								type: ADD_ART_EVENTS,
								uuids: uuids,
								event: event
							});
						} else {
							dispatch(errorModalShow(true, data.msg));
						}
					});
				}
				dispatch(resetArtSelect());
			};
		}

		function addEmotion(emotion) {
			return function (dispatch, getState) {
				var cur_emot = getState()[prefix].queryParams.emotion;
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(function (uuid) {
					var item = byIds[uuid];
					return item.emotion != emotion;
				});

				if (uuids.length > 0) {
					dispatch(load(true));
					rest.articles.update('emotion', {
						uuids: uuids,
						emotion: emotion
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							if (cur_emot != 'all' && emotion != cur_emot) {
								dispatch({
									type: DELETE_ART,
									uuids: uuids
								});
								if (uuids.length == Object.keys(byIds).length) {
									dispatch(load(true));
									setTimeout(function () {
										dispatch(load(false));
										dispatch(modifyPageAndFetch());
									}, 1000);
								}
							} else {
								dispatch({
									type: ADD_ART_EMOTION,
									uuids: uuids,
									emotion: emotion
								});
							}
						}
					});
				}

				dispatch(resetArtSelect());
			};
		}

		function putDepend() {
			return function (dispatch, getState) {
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;
				if (uuids.length > 0) {
					dispatch(load(true));
					rest.articles.update('depend', {
						uuids: uuids
					}).done(function (data) {
						dispatch(load(false));
						dispatch(dependModalTog(false));
						if (data.result) {
							dispatch({
								type: DELETE_ART,
								uuids: uuids
							});
							if (uuids.length == Object.keys(byIds).length) {
								dispatch(load(true));
								setTimeout(function () {
									dispatch(load(false));
									dispatch(modifyPageAndFetch());
								}, 1000);
							}
						}
					});
				}
				dispatch(resetArtSelect());
			};
		}

		function getPageCount(queryParams) {
			return function (dispatch, getState) {
				queryParams = queryParams || getState()[prefix].queryParams;
				rest.articles.read(_extends({}, queryParams, { count: true })).done(function (data) {
					return dispatch({ type: RECEIVE_ART_COUNT, count: data.count });
				});
			};
		}

		function changePage(page) {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix].queryParams;
				page = page - 1;
				page = page < 0 ? 0 : page;
				var begin = page * queryParams.limit;
				queryParams = _extends({}, queryParams, { begin: begin });
				dispatch(getListData(queryParams));
				dispatch({ type: CHANGE_FILTER, modify: { begin: begin } });
			};
		}

		function addWarn() {
			return function (dispatch, getState) {
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(function (uuid) {
					return byIds[uuid].warn == 'none' || byIds[uuid].warn == '' || !byIds[uuid].warn;
				});

				if (uuids.length > 0) {
					dispatch(load(true));
					rest.articles.update('warn', {
						uuids: uuids
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							dispatch({
								type: ADD_ART_WARN,
								uuids: uuids
							});
						}
					});

					dispatch(resetArtSelect());
				}
			};
		}

		function addEmotionSingle(uuid, emotion) {
			return function (dispatch, getState) {
				var cur_emot = getState()[prefix].queryParams.emotion;
				var byIds = getState()[prefix].artById;

				if (emotion != byIds[uuid].emotion) {
					dispatch(load(true));
					rest.articles.update('emotion', {
						uuids: [uuid],
						emotion: emotion
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							if (cur_emot == 'all') {
								dispatch({
									type: ADD_ART_EMOTION,
									uuids: [uuid],
									emotion: emotion
								});
							} else {
								var reload = Object.keys(byIds).length == 1;
								if (!reload) {
									dispatch({
										type: DELETE_ART,
										uuids: [uuid]
									});
									dispatch({
										type: MODIFY_ART_SELECT,
										flag: 'remove',
										uuid: uuid
									});
								} else {
									dispatch(modifyPageAndFetch());
								}
							}
						}
					});
				}
			};
		}

		function modifyPageAndFetch() {
			return function (dispatch, getState) {
				var queryParams = getState()[prefix].queryParams;
				var count_queryParams = _extends({}, queryParams, { count: true });
				var cur_page = Math.floor(queryParams.begin / queryParams.limit) + 1;
				rest.articles.read(count_queryParams).done(function (data) {
					var total = Math.ceil(data.count / queryParams.limit);
					if (cur_page > total) cur_page = total;
					dispatch(changePage(cur_page));
					dispatch({
						type: RECEIVE_ART_COUNT,
						count: data.count
					});
				});
			};
		}

		function ignoreWarnSingle(uuid, del) {
			return function (dispatch, getState) {
				var byIds = getState()[prefix].artById;
				dispatch(load(true));
				rest.articles.update('nowarn', {
					uuids: [uuid]
				}).done(function (data) {
					dispatch(load(false));
					if (data.result == true) {
						if (del) {
							if (Object.keys(byIds).length <= 1) {
								dispatch(modifyPageAndFetch());
							} else {
								dispatch({
									type: DELETE_ART,
									uuids: [uuid]
								});
								dispatch({
									type: MODIFY_ART_SELECT,
									flag: 'remove',
									uuid: uuid
								});
							}
						} else {
							dispatch({
								type: IGNORE_ART_WARN,
								uuids: [uuid]
							});
						}
					}
				});
			};
		}

		function ignoreWarn() {
			return function (dispatch, getState) {
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(function (uuid) {
					return byIds[uuid].warn != 'none';
				});

				if (uuids.length > 0) {
					dispatch(load(true));
					rest.articles.update('nowarn', {
						uuids: uuids
					}).done(function (data) {
						dispatch(load(false));
						if (data.result == true) {
							if (uuids.length == Object.keys(byIds).length) {
								dispatch(modifyPageAndFetch());
							} else {
								dispatch({
									type: DELETE_ART,
									uuids: uuids
								});
							}
						}
					});

					dispatch(resetArtSelect());
				}
			};
		}

		function setEventId(id) {
			return {
				type: SET_EVENT_ID_TO_QUERYPARAMS,
				id: id
			};
		}

		return {
			CHANGE_FILTER: CHANGE_FILTER,
			RECEIVE_ART_DATA: RECEIVE_ART_DATA,
			RECEIVE_CATE_FILTER: RECEIVE_CATE_FILTER,
			RECEIVE_REPORT_SELECT_DATA: RECEIVE_REPORT_SELECT_DATA,
			RECEIVE_EVENT_SELECT_DATA: RECEIVE_EVENT_SELECT_DATA,
			MODIFY_ART_SELECT: MODIFY_ART_SELECT,
			ADD_ART_REPORTS: ADD_ART_REPORTS,
			ADD_ART_EVENTS: ADD_ART_EVENTS,
			DELETE_ART: DELETE_ART,
			ADD_ART_EMOTION: ADD_ART_EMOTION,
			RECEIVE_ART_COUNT: RECEIVE_ART_COUNT,
			CHANGE_QUERY_BEGIN: CHANGE_QUERY_BEGIN,
			ADD_ART_WARN: ADD_ART_WARN,
			IGNORE_ART_WARN: IGNORE_ART_WARN,
			SET_EVENT_ID_TO_QUERYPARAMS: SET_EVENT_ID_TO_QUERYPARAMS,
			ERROR_MODAL_SHOW: ERROR_MODAL_SHOW,
			END_UPDATE: END_UPDATE,
			BEGIN_UPDATE: BEGIN_UPDATE,
			LOADING: LOADING,
			DEPEND_MODAL_SHOW: DEPEND_MODAL_SHOW,
			changeFilter: changeFilter,
			presetFilter: presetFilter,
			getListData: getListData,
			fetchData: fetchData,
			getCategory: getCategory,
			getReportSelectData: getReportSelectData,
			getEventSelectData: getEventSelectData,
			addArtSelect: addArtSelect,
			removeArtSelect: removeArtSelect,
			addReport: addReport,
			addEvent: addEvent,
			addEmotion: addEmotion,
			changePage: changePage,
			addWarn: addWarn,
			addEmotionSingle: addEmotionSingle,
			ignoreWarnSingle: ignoreWarnSingle,
			ignoreWarn: ignoreWarn,
			setEventId: setEventId,
			errorModalShow: errorModalShow,
			fetchByUrl: fetchByUrl,
			dependModalTog: dependModalTog,
			putDepend: putDepend
		};
	}

	return gen;
});