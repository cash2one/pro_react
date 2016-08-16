define([paths.ex.page + '/advices/base/articles/actions.js', paths.ex.page + '/advices/base/articles/default.js'], function(Actions, DefaultParams){

	function gen(prefix, fix = {}, instead = false){
		const {
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
			TOGGLE_LOADING
		} = Actions(prefix);

		var dp;
		if(instead) dp = fix;
		else dp = $.extend(true, {}, DefaultParams, fix);

		function filters_data(state = {}, action){
			switch (action.type){
				case SET_FILTERS:
					return $.extend({}, state, action.data);
				default:
					return state
			}
		}

		function filter_mutiKey(state = '', action){
			switch (action.type){
				case SET_FILTERS_MUTIKEY:
					return action.key
				default:
					return state
			}
		}

		function filter_moreKey(state = '', action){
			switch (action.type){
				case SET_FILTERS_MOREKEY:
					return action.key
				default:
					return state
			}
		}

		function filters(state = {}, action){
			return {
				data: filters_data(state.data, action),
				mutiKey: filter_mutiKey(state.mutiKey, action),
				moreKey: filter_moreKey(state.moreKey, action)
			}
		}

		function filters_selected(state = [], action){
			switch(action.type){
				case ADD_FILTERS_SELECTED:
					state = [...state, action.value]
					return state;
				case DELETE_FILTERS_SELECTED:
					let idx = state.indexOf(action.value);
					if(idx != -1)
						state = [...state.slice(0, idx), ...state.slice(idx + 1)];
					return state;
				case CLEAR_FILTERS_SELECTED:
					return [];
				default:
					return state
			}
		}

		function queryParams(state = dp, action){
			switch(action.type){
				case MODIFY_QUERY_PARAMS:
					return Object.assign({}, state, {[action.key]: action.value})
				case SET_QUERY_PARAMS:
					return action.queryParams
				default:
					return state
			}
		}

		function paramsMirror(state = dp, action){
			switch(action.type){
				case SET_PARAMS_MIRROR:
					return action.params
				default:
					return state
			}
		}

		function selected_tags(state = [], action){
			switch(action.type){
				case SET_SELECTED_TAGS:
					return action.tags
				default:
					return state
			}
		}

		function defaultParams(state = dp, action){
			switch(action.type){
				default:
					return state;
			}
		}

		function articles(state = {}, action){
			switch(action.type){
				case SET_ARTICLES:
					return action.data.reduce((obj, item, idx) => {
						item['__i'] = idx;
						obj[item['uuid']] = item;
						return obj;
					}, {})
				case MODIFY_ARTICLE:
					var art = Object.assign({}, state[action['uuid']], {[action['key']]: action['value']});
					return Object.assign({}, state, {[action['uuid']]: art});
				case DELETE_ARTICLE:
					var s = $.extend({}, state);
					delete s[action.uuid];
					return s;
				case ADD_ARTICLE_REPORT:
					var art = $.extend({}, state[action.uuid]),
						reports = art.reports;
					if(!reports || !(reports instanceof Array))
						reports = art.reports = [];
					reports.push(action.report);
					return $.extend({}, state, {[action['uuid']]: art});
				case REMOVE_ARTICLE_REPORT:
					var art = $.extend({}, state[action.uuid]),
						reports = art.reports;
					if(!reports || !(reports instanceof Array))
						return state;
					reports = reports.filter(item => item.id != action.reportId);
					art = Object.assign({}, art, {reports});
					return $.extend({}, state, {[action['uuid']]: art});
				case ADD_ART_EVENTS:
					var art = $.extend({}, state[action.uuid]),
						events = art.events;
					if(!events || !(events instanceof Array))
						events = art.events = [];
					events.push(action.event);
					return $.extend({}, state, {[action['uuid']]: art});
				case REMOVE_ART_EVENTS:
					var art = $.extend({}, state[action.uuid]),
						events = art.events;
					if(!events || !(events instanceof Array))
						return state;
					events = events.filter(item => item.id != action.eventId);
					art = Object.assign({}, art, {events});
					return $.extend({}, state, {[action['uuid']]: art});
				default:
					return state
			}
		}

		function reportSelectData(state = [], action){
			switch(action.type){
				case SET_REPORT_SELECT_DATA:
					return action.data
				default:
					return state;
			}
		}

		function eventSelectData(state = [], action){
			switch(action.type){
				case SET_EVENT_SELECT_DATA:
					return action.data
				default:
					return state;
			}
		}

		function articlesCount(state = 0, action){
			switch(action.type){
				case SET_ARTICLES_COUNT:
					return action.count;
				case DELETE_ARTICLE:
					return state - 1;
				default:
					return state
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

		function dependUuid(state = '', action){
			switch(action.type){
				case SET_DEPEND_UUID:
					return action.uuid
				case DEPEND_MODAL_SHOW:
					return action.uuid || state;
				default:
					return state
			}
		}

		function loading(state = false, action){
			switch(action.type){
				case TOGGLE_LOADING:
					return action.show
				default:
					return state
			}
		}

		return {
			filters,
			filters_selected,
			queryParams,
			paramsMirror,
			selected_tags,
			defaultParams,
			articles,
			articlesCount,
			reportSelectData,
			eventSelectData,
			dependModalShow,
			dependUuid,
			loading
		}
	}

	return gen;
})