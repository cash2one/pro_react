define([
	paths.rcn.util + '/rest.js'
], function(Rest){

	function gen(prefix){
		if(!prefix) return;
		const rest = Rest.ex();
		const CHANGE_FILTER = prefix + 'CHANGE_FILTER';
		const RECEIVE_ART_DATA = prefix + 'RECEIVE_ART_DATA';
		const RECEIVE_CATE_FILTER = prefix + 'RECEIVE_CATE_FILTER';
		const RECEIVE_REPORT_SELECT_DATA = prefix + 'RECEIVE_REPORT_SELECT_DATA';
		const RECEIVE_EVENT_SELECT_DATA = prefix + 'RECEIVE_EVENT_SELECT_DATA';
		const MODIFY_ART_SELECT = prefix + 'MODIFY_ART_SELECT';
		const ADD_ART_REPORTS = prefix + 'ADD_ART_REPORTS';
		const ADD_ART_EVENTS = prefix + 'ADD_ART_EVENTS';
		const DELETE_ART = prefix + 'DELETE_ART';
		const ADD_ART_EMOTION = prefix + 'ADD_ART_EMOTION';
		const RECEIVE_ART_COUNT = prefix + 'RECEIVE_ART_COUNT';
		const CHANGE_QUERY_BEGIN = prefix + 'CHANGE_QUERY_BEGIN';
		const ADD_ART_WARN = prefix + 'ADD_ART_WARN';
		const IGNORE_ART_WARN = prefix + 'IGNORE_ART_WARN';
		const SET_EVENT_ID_TO_QUERYPARAMS = prefix + 'SET_EVENT_ID_TO_QUERYPARAMS';
		const ERROR_MODAL_SHOW = prefix + 'ERROR_MODAL_SHOW';
		const END_UPDATE = prefix + 'END_UPDATE';
		const BEGIN_UPDATE = prefix + 'BEGIN_UPDATE';
		const LOADING = prefix + 'LOADING';
		const DEPEND_MODAL_SHOW = prefix + 'DEPEND_MODAL_SHOW';

		function load(status){
			return {
				type: LOADING,
				status
			}
		}

		function dependModalTog(tog){
			return {
				type: DEPEND_MODAL_SHOW,
				tog
			}
		}

		function now(){
			var n = new Date();
			return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()} ${n.getHours()}:${n.getMinutes()}`
		}

		function endUpdate(){
			return {
				type: END_UPDATE,
				time: now()
			}
		}

		function beginUpdate(){
			return {
				type: BEGIN_UPDATE
			}
		}

		function errorModalShow(show, msg){
			return {
				type: ERROR_MODAL_SHOW,
				show,
				msg: msg || ''
			}
		}

		function changeFilter(modify){
			return function(dispatch, getState){
				var queryParams = getState()[prefix].queryParams;
				modify = Object.assign({}, modify, {begin: 0});
				queryParams = Object.assign({}, queryParams, modify);
				dispatch(fetchData(queryParams));
				dispatch({
					type: CHANGE_FILTER,
					modify
				});
				dispatch(resetArtSelect());
			}
		}

		function presetFilter(modify){
			return {
				type: CHANGE_FILTER,
				modify
			}
		}

		function fetchByUrl(modify, onlyPage){
			return function(dispatch, getState){
				var queryParams = getState()[prefix].queryParams;
				modify = Object.assign({}, modify);
				queryParams = Object.assign({}, queryParams, modify);
				if(onlyPage)
					dispatch(getListData(queryParams))
				else
					dispatch(fetchData(queryParams));
				dispatch({
					type: CHANGE_FILTER,
					modify
				});
				dispatch(resetArtSelect());
			}
		}

		function getListData(queryParams, isFresh){
			return function(dispatch, getState){
				dispatch(load(true));
				if(isFresh)
					dispatch(beginUpdate());
				queryParams = queryParams || getState()[prefix].queryParams;
				rest.articles.read(queryParams).done(data => {
					dispatch({type: RECEIVE_ART_DATA, data});
					dispatch(load(false));
					if(isFresh)
						dispatch(endUpdate());
				});
			}
		}

		function fetchData(queryParams, isFresh){
			return function(dispatch, getState){
				queryParams = queryParams || getState()[prefix].queryParams;
				dispatch(getListData(queryParams, isFresh));
				dispatch(getPageCount(queryParams));
			}
		}

		function getCategory(count){
			return function(dispatch){
				rest.category.read({
					begin: 0,
					count: count || 20
				}).done(data => {
					var cate = {
						title: '自定义分类',
						items: [{
							title: '全部',
							key: 'all'
						}, ...data.map(item => {
							return {title: item.name, key: item.id}
						})]
					}
					dispatch({
						type: RECEIVE_CATE_FILTER,
						data: cate
					})
				});
			}
		}

		function getReportSelectData(){
			return function(dispatch){
				rest.report.read('recent').done(data => dispatch({
					type: RECEIVE_REPORT_SELECT_DATA,
					data
				}));
			}
		}

		function getEventSelectData(){
			return function(dispatch){
				rest.events.read({
					status: 1
				}).done(data => dispatch({
					type: RECEIVE_EVENT_SELECT_DATA,
					data
				}));
			}
		}

		function addArtSelect(uuid){
			return {
				type: MODIFY_ART_SELECT,
				flag: 'add',
				uuid
			}
		}

		function removeArtSelect(uuid){
			return {
				type: MODIFY_ART_SELECT,
				flag: 'remove',
				uuid
			}
		}

		function resetArtSelect(){
			return {
				type: MODIFY_ART_SELECT,
				flag: 'reset'
			}
		}

		function addReport(report){
			return function(dispatch, getState){
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				var uuids = uuids.filter(uuid => {
					let item = byIds[uuid];
					// return (item.reports || []).indexOf(report) == -1;
					return !has(item.reports, 'id', report.id);
				});

				if(uuids.length > 0){
					dispatch(load(true))
					rest.articles.update('report', {
						uuids,
						report: report.id,
						action: 'add'
					}).done(data => {
						dispatch(load(false))
						if(data.result == true){
							dispatch({
								type: ADD_ART_REPORTS,
								uuids,
								report: report
							})
						}
					})
				}

				dispatch(resetArtSelect());
			}
		}

		function has(arr, key, val){
			arr = arr || [];
			var res = false;
			if(!key || !val) return res;
			for(var i = 0; i < arr.length; i++){
				if(arr[i][key] == val){
					res = true
					break
				}
			}
			return res;
		}

		function addEvent(event){
			return function(dispatch, getState){
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(uuid => {
					let item = byIds[uuid];
					// return (item.events || []).indexOf(event.title) == -1;
					return !has(item.events, 'id', event.id);
				});

				if(uuids.length > 0){
					dispatch(load(true));
					var articles = uuids.map(uuid => {
						let item = byIds[uuid];
						return {
							uuid,
							title_sign: item.title_sign
						}
					})
					rest.articles.update('event', {
						articles,
						event: event.id,
						action: 'add'
					}).done(data => {
						dispatch(load(false));
						if(data.result == true){
							dispatch({
								type: ADD_ART_EVENTS,
								uuids,
								event: event
							})
						} else {
							dispatch(errorModalShow(true, data.msg))
						}
					})
				}
				dispatch(resetArtSelect());
			}
		}

		function addEmotion(emotion){
			return function(dispatch, getState){
				var cur_emot = getState()[prefix].queryParams.emotion;
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(uuid => {
					let item = byIds[uuid];
					return item.emotion != emotion;
				});

				if(uuids.length > 0){
					dispatch(load(true))
					rest.articles.update('emotion', {
						uuids,
						emotion
					}).done(data => {
						dispatch(load(false));
						if(data.result == true){
							if(cur_emot != 'all' && emotion != cur_emot){
								dispatch({
									type: DELETE_ART,
									uuids
								})
								if(uuids.length == Object.keys(byIds).length){
									dispatch(load(true))
									setTimeout(() => {
										dispatch(load(false))
										dispatch(modifyPageAndFetch())
									}, 1000)
								}
							} else {
								dispatch({
									type: ADD_ART_EMOTION,
									uuids,
									emotion
								})
							}
						}
					})
				}

				dispatch(resetArtSelect());
			}
		}

		function putDepend(){
			return function(dispatch, getState){
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;
				if(uuids.length > 0){
					dispatch(load(true))
					rest.articles.update('depend', {
						uuids
					}).done(data => {
						dispatch(load(false))
						dispatch(dependModalTog(false))
						if(data.result){
							dispatch({
								type: DELETE_ART,
								uuids
							});
							if(uuids.length == Object.keys(byIds).length){
								dispatch(load(true))
								setTimeout(() => {
									dispatch(load(false))
									dispatch(modifyPageAndFetch())
								}, 1000)
							}
						}
					})
				}
				dispatch(resetArtSelect());
			}
		}

		function getPageCount(queryParams){
			return function(dispatch, getState){
				queryParams = queryParams || getState()[prefix].queryParams;
				rest.articles.read(Object.assign({}, queryParams, {count: true})).done(data => dispatch({type: RECEIVE_ART_COUNT, count: data.count}));
			}
		}

		function changePage(page){
			return function(dispatch, getState){
				var queryParams = getState()[prefix].queryParams;
				page = page - 1;
				page = page < 0 ? 0 : page;
				var begin = page * queryParams.limit;
				queryParams = Object.assign({}, queryParams, {begin});
				dispatch(getListData(queryParams));
				dispatch({type: CHANGE_FILTER, modify: {begin}});
			}
		}

		function addWarn(){
			return function(dispatch, getState){
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(uuid => {
					return (byIds[uuid].warn == 'none' || byIds[uuid].warn == '' || !byIds[uuid].warn);
				});

				if(uuids.length > 0){
					dispatch(load(true))
					rest.articles.update('warn', {
						uuids
					}).done(data => {
						dispatch(load(false))
						if(data.result == true){
							dispatch({
								type: ADD_ART_WARN,
								uuids
							})
						}
					})

					dispatch(resetArtSelect())
				}
			}
		}

		function addEmotionSingle(uuid, emotion){
			return function(dispatch, getState){
				var cur_emot = getState()[prefix].queryParams.emotion;
				var byIds = getState()[prefix].artById;

				if(emotion != byIds[uuid].emotion){
					dispatch(load(true))
					rest.articles.update('emotion', {
						uuids: [uuid],
						emotion
					}).done(data => {
						dispatch(load(false))
						if(data.result == true){
							if(cur_emot == 'all'){
								dispatch({
									type: ADD_ART_EMOTION,
									uuids: [uuid],
									emotion
								})
							} else {
								let reload = Object.keys(byIds).length == 1;
								if(!reload){
									dispatch({
										type: DELETE_ART,
										uuids: [uuid]
									})
									dispatch({
										type: MODIFY_ART_SELECT,
										flag: 'remove',
										uuid
									})
								} else {
									dispatch(modifyPageAndFetch());
								}
							}
						}
					})
				}
			}
		}

		function modifyPageAndFetch(){
			return function(dispatch, getState){
				var queryParams = getState()[prefix].queryParams;
				var count_queryParams = Object.assign({}, queryParams, {count: true});
				var cur_page = Math.floor(queryParams.begin / queryParams.limit) + 1;
				rest.articles.read(count_queryParams).done(data => {
					let total = Math.ceil(data.count / queryParams.limit);
					if(cur_page > total)
						cur_page = total;
					dispatch(changePage(cur_page));
					dispatch({
						type: RECEIVE_ART_COUNT,
						count: data.count
					})
				})
			}
		}

		function ignoreWarnSingle(uuid, del){
			return function(dispatch, getState){
				var byIds = getState()[prefix].artById;
				dispatch(load(true))
				rest.articles.update('nowarn', {
					uuids: [uuid]
				}).done(data => {
					dispatch(load(false))
					if(data.result == true){
						if(del){
							if(Object.keys(byIds).length <= 1){
								dispatch(modifyPageAndFetch());
							} else {
								dispatch({
									type: DELETE_ART,
									uuids: [uuid]
								})
								dispatch({
									type: MODIFY_ART_SELECT,
									flag: 'remove',
									uuid
								})
							}
						} else {
							dispatch({
								type: IGNORE_ART_WARN,
								uuids: [uuid]
							})	
						}
					}
				})
			}
		}

		function ignoreWarn(){
			return function(dispatch, getState){
				var uuids = getState()[prefix].artSelected;
				var byIds = getState()[prefix].artById;

				uuids = uuids.filter(uuid => {
					return byIds[uuid].warn != 'none';
				});

				if(uuids.length > 0){
					dispatch(load(true))
					rest.articles.update('nowarn', {
						uuids
					}).done(data => {
						dispatch(load(false))
						if(data.result == true){
							if(uuids.length == Object.keys(byIds).length){
								dispatch(modifyPageAndFetch());
							} else {
								dispatch({
									type: DELETE_ART,
									uuids
								})
							}
						}
					})

					dispatch(resetArtSelect())
				}
			}
		}

		function setEventId(id){
			return {
				type: SET_EVENT_ID_TO_QUERYPARAMS,
				id
			}
		}

		return {
			CHANGE_FILTER,
			RECEIVE_ART_DATA,
			RECEIVE_CATE_FILTER,
			RECEIVE_REPORT_SELECT_DATA,
			RECEIVE_EVENT_SELECT_DATA,
			MODIFY_ART_SELECT,
			ADD_ART_REPORTS,
			ADD_ART_EVENTS,
			DELETE_ART,
			ADD_ART_EMOTION,
			RECEIVE_ART_COUNT,
			CHANGE_QUERY_BEGIN,
			ADD_ART_WARN,
			IGNORE_ART_WARN,
			SET_EVENT_ID_TO_QUERYPARAMS,
			ERROR_MODAL_SHOW,
			END_UPDATE,
			BEGIN_UPDATE,
			LOADING,
			DEPEND_MODAL_SHOW,
			changeFilter,
			presetFilter,
			getListData,
			fetchData,
			getCategory,
			getReportSelectData,
			getEventSelectData,
			addArtSelect,
			removeArtSelect,
			addReport,
			addEvent,
			addEmotion,
			changePage,
			addWarn,
			addEmotionSingle,
			ignoreWarnSingle,
			ignoreWarn,
			setEventId,
			errorModalShow,
			fetchByUrl,
			dependModalTog,
			putDepend
		}
	}

	return gen
})