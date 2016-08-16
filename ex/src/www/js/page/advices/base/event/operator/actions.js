define([
	paths.rcn.util + '/rest.js'
], function(Rest){
	var rest = Rest.ex();

	const RECEIVE_EVENT_LIST = 'RECEIVE_EVENT_LIST';
	const OPEN_CREATE_EVENT = 'OPEN_CREATE_EVENT';
	const CLOSE_EVENT_MODAL = 'CLOSE_EVENT_MODAL';
	const EDIT_MODAL_DATA_TITLE = 'EDIT_MODAL_DATA_TITLE';
	const EDIT_MODAL_DATA_BEGIN = 'EDIT_MODAL_DATA_BEGIN';
	const EDIT_MODAL_DATA_END = 'EDIT_MODAL_DATA_END';
	const EDIT_MODAL_DATA_BE = 'EDIT_MODAL_DATA_BE';
	const EDIT_MODAL_DATA_RANK = 'EDIT_MODAL_DATA_RANK';
	const EDIT_MODAL_DATA_DETAIL = 'EDIT_MODAL_DATA_DETAIL';
	const ADD_EVENT = 'ADD_EVENT';
	const OPEN_MODIFY_EVENT = 'OPEN_MODIFY_EVENT';
	const MODIFY_EVENT = 'MODIFY_EVENT';
	const MODAL_ERROR = 'MODAL_ERROR';
	const OPEN_DEL_MODAL = 'OPEN_DEL_MODAL';
	const DEL_EVENT = 'DEL_EVENT';
	const CLOSE_DEL_MODAL = 'CLOSE_DEL_MODAL';
	const OPEN_END_MODAL = 'OPEN_END_MODAL';
	const CLOSE_END_MODAL = 'CLOSE_END_MODAL';

	function openEndModal(id){
		return {
			type: OPEN_END_MODAL,
			id
		}
	}

	function closeEndModal(){
		return {
			type: CLOSE_END_MODAL
		}
	}

	function openDelModal(id){
		return {
			type: OPEN_DEL_MODAL,
			id
		}
	}

	function delEvent(id){
		return function(dispatch){
			rest.events.del(id).done(() => {
				dispatch({
					type: DEL_EVENT,
					id
				})
			});
			dispatch(closeDelModal())
		}
	}

	function closeDelModal(){
		return {
			type: CLOSE_DEL_MODAL
		}
	}

	function receiveEventList(data){
		return {
			type: RECEIVE_EVENT_LIST,
			data
		}
	}

	function fetchEventList(){
		return function(dispatch){
			rest.events.read().done(data => dispatch(receiveEventList(data)));
		}
	}

	function openCreateEvent(){
		return {
			type: OPEN_CREATE_EVENT
		}
	}

	function editModalDataTitle(value){
		return {
			type: EDIT_MODAL_DATA_TITLE,
			value
		}
	}

	function editModalDataBegin(value){
		return {
			type: EDIT_MODAL_DATA_BEGIN,
			value
		}
	}

	function editModalDataEnd(value){
		return {
			type: EDIT_MODAL_DATA_END,
			value
		}
	}

	function editModalDataBe(begin, end){
		return {
			type: EDIT_MODAL_DATA_BE,
			begin,
			end
		}
	}

	function editModalDataRank(value){
		return {
			type: EDIT_MODAL_DATA_RANK,
			value
		}
	}

	function editModalDataDetail(value){
		return {
			type: EDIT_MODAL_DATA_DETAIL,
			value
		}
	}

	function closeEventModal(){
		return {
			type: CLOSE_EVENT_MODAL
		}
	}

	function createEvent(event){
		return function(dispatch){
			rest.events.create(event).done(data => {
				if(data.result == true){
					event = Object.assign({}, event, {id: data.id, status: 1});
					dispatch(addEvent(event));
					dispatch(closeEventModal());
				} else {
					dispatch({
						type: MODAL_ERROR,
						txt: data.msg
					})
				}
			})
		}
	}

	function addEvent(event){
		return {
			type: ADD_EVENT,
			event
		}
	}

	function openModifyEvent(event){
		return {
			type: OPEN_MODIFY_EVENT,
			event
		}
	}

	function modifyEvent(id, event){
		return function(dispatch){
			rest.events.update(id, event).done(data => {
				if(data.result == true){
					dispatch(_modifyEvent(id, event));
					dispatch(closeEventModal());
				} else {
					dispatch({
						type: MODAL_ERROR,
						txt: data.msg
					})
				}
			})
		}
	}

	function _modifyEvent(id, modify){
		return {
			type: MODIFY_EVENT,
			id,
			modify
		}
	}

	return {
		RECEIVE_EVENT_LIST,
		OPEN_CREATE_EVENT,
		EDIT_MODAL_DATA_TITLE,
		EDIT_MODAL_DATA_BEGIN,
		EDIT_MODAL_DATA_END,
		EDIT_MODAL_DATA_RANK,
		EDIT_MODAL_DATA_DETAIL,
		CLOSE_EVENT_MODAL,
		EDIT_MODAL_DATA_BE,
		ADD_EVENT,
		OPEN_MODIFY_EVENT,
		MODIFY_EVENT,
		MODAL_ERROR,
		OPEN_DEL_MODAL,
		DEL_EVENT,
		CLOSE_DEL_MODAL,
		OPEN_END_MODAL,
		CLOSE_END_MODAL,
		receiveEventList,
		fetchEventList,
		openCreateEvent,
		editModalDataTitle,
		editModalDataBegin,
		editModalDataEnd,
		editModalDataRank,
		editModalDataDetail,
		closeEventModal,
		createEvent,
		addEvent,
		openModifyEvent,
		editModalDataBe,
		modifyEvent,
		openDelModal,
		delEvent,
		closeDelModal,
		openEndModal,
		closeEndModal
	}
})