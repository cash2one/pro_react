define([
	paths.ex.page + '/advices/base/event/operator/actions.js'
], function(Actions){
	const {
		RECEIVE_EVENT_LIST,
		OPEN_CREATE_EVENT,
		CLOSE_EVENT_MODAL,
		EDIT_MODAL_DATA_TITLE,
		EDIT_MODAL_DATA_BEGIN,
		EDIT_MODAL_DATA_END,
		EDIT_MODAL_DATA_RANK,
		EDIT_MODAL_DATA_DETAIL,
		ADD_EVENT,
		OPEN_MODIFY_EVENT,
		EDIT_MODAL_DATA_BE,
		MODIFY_EVENT,
		MODAL_ERROR,
		OPEN_DEL_MODAL,
		DEL_EVENT,
		CLOSE_DEL_MODAL,
		OPEN_END_MODAL,
		CLOSE_END_MODAL
	} = Actions;

	function eventById(state = {}, action){
		switch (action.type){
			case RECEIVE_EVENT_LIST:
				return action.data.reduce((obj, item) => {
					obj[item.id] = item;
					return obj;
				}, {});
			case ADD_EVENT:
				return Object.assign({}, state, {[action.event.id]: action.event});
			case MODIFY_EVENT:
				var event = Object.assign({}, state[action.id], action.modify);
				return Object.assign({}, state, {[action.id]: event});
			case DEL_EVENT:
				var modify = Object.assign({}, state);
				delete modify[action.id];
				return Object.assign({}, modify);
			default:
				return state
		}
	}

	function modalShow(state = false, action){
		switch (action.type){
			case OPEN_CREATE_EVENT:
				return true;
			case CLOSE_EVENT_MODAL:
				return false;
			case OPEN_MODIFY_EVENT:
				return true;
			default:
				return state;
		}
	}

	function modalData(state = {
		title: '',
		begin_at: '',
		// end_at: '',
		rank: '',
		detail: ''
	}, action){
		switch (action.type){
			case OPEN_CREATE_EVENT:
				return {
					title: '',
					begin_at: '',
					// end_at: '',
					rank: '4',
					detail: ''
				}
			case EDIT_MODAL_DATA_TITLE:
				return Object.assign({}, state, {title: action.value});
			case EDIT_MODAL_DATA_BEGIN:
				return Object.assign({}, state, {begin_at: action.value});
			// case EDIT_MODAL_DATA_END:
			// 	return Object.assign({}, state, {end_at: action.value});
			case EDIT_MODAL_DATA_RANK:
				return Object.assign({}, state, {rank: action.value});
			case EDIT_MODAL_DATA_DETAIL:
				return Object.assign({}, state, {detail: action.value});
			case EDIT_MODAL_DATA_BE:
				return Object.assign({}, state, {begin_at: action.begin, end_at: action.end});
			// case CLOSE_EVENT_MODAL:
			// 	return {
			// 		title: '',
			// 		begin_at: '',
			// 		end_at: '',
			// 		rank: '',
			// 		detail: ''
			// 	}
			case OPEN_MODIFY_EVENT:
				return Object.assign({}, action.event);
			default:
				return state
		}
	}

	function modalFlag(state = '', action){
		switch (action.type){
			case OPEN_CREATE_EVENT:
				return 'create';
			case OPEN_MODIFY_EVENT:
				return 'modify';
			default:
				return state;
		}
	}

	function modalErr(state = null, action){
		switch (action.type){
			case MODAL_ERROR:
				return action.txt;
			case CLOSE_EVENT_MODAL:
				return null;
			default:
				return state;
		}
	}

	function delId(state = null, action){
		switch(action.type){
			case OPEN_DEL_MODAL:
				return action.id
			case CLOSE_DEL_MODAL:
				return null;
			default:
				return state
		}
	}

	function delModalShow(state = false, action){
		switch(action.type){
			case OPEN_DEL_MODAL:
				return true;
			case CLOSE_DEL_MODAL:
				return false;
			default:
				return state
		}
	}

	function endId(state = null, action){
		switch(action.type){
			case OPEN_END_MODAL:
				return action.id
			case CLOSE_END_MODAL:
				return null
			default:
				return state;
		}
	}

	function endModalShow(state = false, action){
		switch(action.type){
			case OPEN_END_MODAL:
				return true;
			case CLOSE_END_MODAL:
				return false
			default:
				return state
		}
	}

	function eventList(state = {}, action){
		return {
			eventById: eventById(state.eventById, action),
			modalShow: modalShow(state.modalShow, action),
			modalData: modalData(state.modalData, action),
			modalFlag: modalFlag(state.modalFlag, action),
			modalErr: modalErr(state.modalErr, action),
			delId: delId(state.delId, action),
			delModalShow: delModalShow(state.delModalShow, action),
			endId: endId(state.endId, action),
			endModalShow: endModalShow(state.endModalShow, action)
		}
	}

	return {
		eventList
	}
})