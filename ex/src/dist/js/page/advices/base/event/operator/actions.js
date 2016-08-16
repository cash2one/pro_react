'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define([paths.rcn.util + '/rest.js'], function (Rest) {
	var rest = Rest.ex();

	var RECEIVE_EVENT_LIST = 'RECEIVE_EVENT_LIST';
	var OPEN_CREATE_EVENT = 'OPEN_CREATE_EVENT';
	var CLOSE_EVENT_MODAL = 'CLOSE_EVENT_MODAL';
	var EDIT_MODAL_DATA_TITLE = 'EDIT_MODAL_DATA_TITLE';
	var EDIT_MODAL_DATA_BEGIN = 'EDIT_MODAL_DATA_BEGIN';
	var EDIT_MODAL_DATA_END = 'EDIT_MODAL_DATA_END';
	var EDIT_MODAL_DATA_BE = 'EDIT_MODAL_DATA_BE';
	var EDIT_MODAL_DATA_RANK = 'EDIT_MODAL_DATA_RANK';
	var EDIT_MODAL_DATA_DETAIL = 'EDIT_MODAL_DATA_DETAIL';
	var ADD_EVENT = 'ADD_EVENT';
	var OPEN_MODIFY_EVENT = 'OPEN_MODIFY_EVENT';
	var MODIFY_EVENT = 'MODIFY_EVENT';
	var MODAL_ERROR = 'MODAL_ERROR';
	var OPEN_DEL_MODAL = 'OPEN_DEL_MODAL';
	var DEL_EVENT = 'DEL_EVENT';
	var CLOSE_DEL_MODAL = 'CLOSE_DEL_MODAL';
	var OPEN_END_MODAL = 'OPEN_END_MODAL';
	var CLOSE_END_MODAL = 'CLOSE_END_MODAL';

	function openEndModal(id) {
		return {
			type: OPEN_END_MODAL,
			id: id
		};
	}

	function closeEndModal() {
		return {
			type: CLOSE_END_MODAL
		};
	}

	function openDelModal(id) {
		return {
			type: OPEN_DEL_MODAL,
			id: id
		};
	}

	function delEvent(id) {
		return function (dispatch) {
			rest.events.del(id).done(function () {
				dispatch({
					type: DEL_EVENT,
					id: id
				});
			});
			dispatch(closeDelModal());
		};
	}

	function closeDelModal() {
		return {
			type: CLOSE_DEL_MODAL
		};
	}

	function receiveEventList(data) {
		return {
			type: RECEIVE_EVENT_LIST,
			data: data
		};
	}

	function fetchEventList() {
		return function (dispatch) {
			rest.events.read().done(function (data) {
				return dispatch(receiveEventList(data));
			});
		};
	}

	function openCreateEvent() {
		return {
			type: OPEN_CREATE_EVENT
		};
	}

	function editModalDataTitle(value) {
		return {
			type: EDIT_MODAL_DATA_TITLE,
			value: value
		};
	}

	function editModalDataBegin(value) {
		return {
			type: EDIT_MODAL_DATA_BEGIN,
			value: value
		};
	}

	function editModalDataEnd(value) {
		return {
			type: EDIT_MODAL_DATA_END,
			value: value
		};
	}

	function editModalDataBe(begin, end) {
		return {
			type: EDIT_MODAL_DATA_BE,
			begin: begin,
			end: end
		};
	}

	function editModalDataRank(value) {
		return {
			type: EDIT_MODAL_DATA_RANK,
			value: value
		};
	}

	function editModalDataDetail(value) {
		return {
			type: EDIT_MODAL_DATA_DETAIL,
			value: value
		};
	}

	function closeEventModal() {
		return {
			type: CLOSE_EVENT_MODAL
		};
	}

	function createEvent(event) {
		return function (dispatch) {
			rest.events.create(event).done(function (data) {
				if (data.result == true) {
					event = _extends({}, event, { id: data.id, status: 1 });
					dispatch(addEvent(event));
					dispatch(closeEventModal());
				} else {
					dispatch({
						type: MODAL_ERROR,
						txt: data.msg
					});
				}
			});
		};
	}

	function addEvent(event) {
		return {
			type: ADD_EVENT,
			event: event
		};
	}

	function openModifyEvent(event) {
		return {
			type: OPEN_MODIFY_EVENT,
			event: event
		};
	}

	function modifyEvent(id, event) {
		return function (dispatch) {
			rest.events.update(id, event).done(function (data) {
				if (data.result == true) {
					dispatch(_modifyEvent(id, event));
					dispatch(closeEventModal());
				} else {
					dispatch({
						type: MODAL_ERROR,
						txt: data.msg
					});
				}
			});
		};
	}

	function _modifyEvent(id, modify) {
		return {
			type: MODIFY_EVENT,
			id: id,
			modify: modify
		};
	}

	return {
		RECEIVE_EVENT_LIST: RECEIVE_EVENT_LIST,
		OPEN_CREATE_EVENT: OPEN_CREATE_EVENT,
		EDIT_MODAL_DATA_TITLE: EDIT_MODAL_DATA_TITLE,
		EDIT_MODAL_DATA_BEGIN: EDIT_MODAL_DATA_BEGIN,
		EDIT_MODAL_DATA_END: EDIT_MODAL_DATA_END,
		EDIT_MODAL_DATA_RANK: EDIT_MODAL_DATA_RANK,
		EDIT_MODAL_DATA_DETAIL: EDIT_MODAL_DATA_DETAIL,
		CLOSE_EVENT_MODAL: CLOSE_EVENT_MODAL,
		EDIT_MODAL_DATA_BE: EDIT_MODAL_DATA_BE,
		ADD_EVENT: ADD_EVENT,
		OPEN_MODIFY_EVENT: OPEN_MODIFY_EVENT,
		MODIFY_EVENT: MODIFY_EVENT,
		MODAL_ERROR: MODAL_ERROR,
		OPEN_DEL_MODAL: OPEN_DEL_MODAL,
		DEL_EVENT: DEL_EVENT,
		CLOSE_DEL_MODAL: CLOSE_DEL_MODAL,
		OPEN_END_MODAL: OPEN_END_MODAL,
		CLOSE_END_MODAL: CLOSE_END_MODAL,
		receiveEventList: receiveEventList,
		fetchEventList: fetchEventList,
		openCreateEvent: openCreateEvent,
		editModalDataTitle: editModalDataTitle,
		editModalDataBegin: editModalDataBegin,
		editModalDataEnd: editModalDataEnd,
		editModalDataRank: editModalDataRank,
		editModalDataDetail: editModalDataDetail,
		closeEventModal: closeEventModal,
		createEvent: createEvent,
		addEvent: addEvent,
		openModifyEvent: openModifyEvent,
		editModalDataBe: editModalDataBe,
		modifyEvent: modifyEvent,
		openDelModal: openDelModal,
		delEvent: delEvent,
		closeDelModal: closeDelModal,
		openEndModal: openEndModal,
		closeEndModal: closeEndModal
	};
});