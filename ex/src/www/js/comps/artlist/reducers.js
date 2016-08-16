define([
	paths.ex.page + '/advices/base/news/audit/filters.js',
	paths.ex.comps + '/artlist/actions.js'
], function(filters, Actions){

	function gen(prefix, filter){
		if(!prefix) return;

		filter = filter || filters;

		var defaultFilter = Object.keys(filter).reduce((obj, key) => {
			obj[key] = filter[key].items[0].key;
			return obj;
		}, {})

		defaultFilter = $.extend({}, defaultFilter, {
			title: 'true',
			emotion: 'all',
			cate: 'all',
			begin: 0,
			limit: 10,
			search: ''
		})

		const {
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
			BEGIN_UPDATE,
			END_UPDATE,
			LOADING,
			DEPEND_MODAL_SHOW
		} = Actions(prefix);

		function queryParams(state = defaultFilter, action){
			switch (action.type){
				case CHANGE_FILTER:
					return Object.assign({}, state, action.modify);
				case CHANGE_QUERY_BEGIN:
					return Object.assign({}, state, {begin: action.begin});
				case SET_EVENT_ID_TO_QUERYPARAMS:
					return Object.assign({}, state, {event_id: action.id});
				default:
					return state
			}
		}

		function artById(state = {}, action){
			switch (action.type){
				case RECEIVE_ART_DATA:
					return action.data.reduce((obj, item) => {
						obj[item.uuid] = item;
						return obj;
					}, {});
				case ADD_ART_REPORTS:
					var modify = action.uuids.reduce((obj, uuid) => {
						let reports = (state[uuid].reports || []).slice();
						reports.push(action.report);
						obj[uuid] = Object.assign({}, state[uuid], {reports});
						return obj;
					}, {});
					return Object.assign({}, state, modify);
				case ADD_ART_EVENTS:
					var modify = action.uuids.reduce((obj, uuid) => {
						let events = (state[uuid].events || []).slice();
						events.push(action.event);
						obj[uuid] = Object.assign({}, state[uuid], {events});
						return obj;
					}, {});
					return Object.assign({}, state, modify);
				case DELETE_ART:
					var modify = Object.assign({}, state);
					action.uuids.forEach(uuid => {
						delete modify[uuid];
					});
					return modify;
				case ADD_ART_EMOTION:
					var modify = action.uuids.reduce((obj, uuid) => {
						obj[uuid] = Object.assign({}, state[uuid], {emotion: action.emotion});
						return obj
					}, {});
					return Object.assign({}, state, modify);
				case ADD_ART_WARN:
					var modify = action.uuids.reduce((obj, uuid) => {
						obj[uuid] = Object.assign({}, state[uuid], {warn: 'manual'});
						return obj;
					}, {});
					return Object.assign({}, state, modify);
				case IGNORE_ART_WARN:
					var modify = action.uuids.reduce((obj, uuid) => {
						obj[uuid] = Object.assign({}, state[uuid], {warn: 'none'});
						return obj;
					}, {});
					return Object.assign({}, state, modify);
				default:
					return state
			}
		}

		function artSelected(state = [], action){
			switch (action.type){
				case MODIFY_ART_SELECT:
					if(action.flag == 'add'){
						state = state.slice();
						state.push(action.uuid);
						return state;
					}
					else if(action.flag == 'remove'){
						var index = state.indexOf(action.uuid);
						if(index != -1){
							return [...state.slice(0, index), ...state.slice(index+1)];
						}
					} else if(action.flag == 'reset') {
						return []
					} else {
						return state
					}
				default:
					return state
			}
		}

		function artCount(state = 0, action){
			switch (action.type){
				case RECEIVE_ART_COUNT:
					return action.count;
				default:
					return state
			}
		}

		function filterBoxData(state = filter, action){
			switch (action.type){
				case RECEIVE_CATE_FILTER:
					return Object.assign({}, state, {['cate']: action.data})
				default:
					return state
			}
		}

		function eventSelectData(state = [], action){
			switch (action.type){
				case RECEIVE_EVENT_SELECT_DATA:
					return action.data
				default:
					return state
			}
		}

		function reportSelectData(state = [], action){
			switch (action.type){
				case RECEIVE_REPORT_SELECT_DATA:
					return action.data
				default:
					return state
			}
		}

		function errorModal(state = {}, action){
			return {
				show: errorModalShow(state.show, action),
				msg: errorModalMsg(state.msg, action)
			}
		}

		function errorModalShow(state = false, action){
			switch(action.type){
				case ERROR_MODAL_SHOW:
					return action.show
				default:
					return state
			}
		}

		function errorModalMsg(state = '', action){
			switch(action.type){
				case ERROR_MODAL_SHOW:
					return action.msg
				default:
					return state
			}
		}

		function updateAt(state = '', action){
			switch (action.type){
				case END_UPDATE:
					return action.time
				default:
					return state
			}
		}

		function updating(state = false, action){
			switch (action.type){
				case END_UPDATE:
					return false
				case BEGIN_UPDATE:
					return true
				default:
					return state
			}
		}

		function loading(state = false, action){
			switch (action.type){
				case LOADING:
					return action.status
				default:
					return state;
			}
		}

		function dependModalShow(state = false, action){
			switch(action.type){
				case DEPEND_MODAL_SHOW:
					return action.tog
				default:
					return state
			}
		}

		return {
			queryParams,
			artById,
			artSelected,
			artCount,
			filterBoxData,
			eventSelectData,
			reportSelectData,
			errorModal,
			updateAt,
			updating,
			loading,
			dependModalShow
		}
	}

	return gen;
})