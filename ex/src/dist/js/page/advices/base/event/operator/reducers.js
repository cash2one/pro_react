'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([paths.ex.page + '/advices/base/event/operator/actions.js'], function (Actions) {
	var RECEIVE_EVENT_LIST = Actions.RECEIVE_EVENT_LIST;
	var OPEN_CREATE_EVENT = Actions.OPEN_CREATE_EVENT;
	var CLOSE_EVENT_MODAL = Actions.CLOSE_EVENT_MODAL;
	var EDIT_MODAL_DATA_TITLE = Actions.EDIT_MODAL_DATA_TITLE;
	var EDIT_MODAL_DATA_BEGIN = Actions.EDIT_MODAL_DATA_BEGIN;
	var EDIT_MODAL_DATA_END = Actions.EDIT_MODAL_DATA_END;
	var EDIT_MODAL_DATA_RANK = Actions.EDIT_MODAL_DATA_RANK;
	var EDIT_MODAL_DATA_DETAIL = Actions.EDIT_MODAL_DATA_DETAIL;
	var ADD_EVENT = Actions.ADD_EVENT;
	var OPEN_MODIFY_EVENT = Actions.OPEN_MODIFY_EVENT;
	var EDIT_MODAL_DATA_BE = Actions.EDIT_MODAL_DATA_BE;
	var MODIFY_EVENT = Actions.MODIFY_EVENT;
	var MODAL_ERROR = Actions.MODAL_ERROR;
	var OPEN_DEL_MODAL = Actions.OPEN_DEL_MODAL;
	var DEL_EVENT = Actions.DEL_EVENT;
	var CLOSE_DEL_MODAL = Actions.CLOSE_DEL_MODAL;
	var OPEN_END_MODAL = Actions.OPEN_END_MODAL;
	var CLOSE_END_MODAL = Actions.CLOSE_END_MODAL;


	function eventById() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case RECEIVE_EVENT_LIST:
				return action.data.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
			case ADD_EVENT:
				return _extends({}, state, _defineProperty({}, action.event.id, action.event));
			case MODIFY_EVENT:
				var event = _extends({}, state[action.id], action.modify);
				return _extends({}, state, _defineProperty({}, action.id, event));
			case DEL_EVENT:
				var modify = _extends({}, state);
				delete modify[action.id];
				return _extends({}, modify);
			default:
				return state;
		}
	}

	function modalShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
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

	function modalData() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {
			title: '',
			begin_at: '',
			// end_at: '',
			rank: '',
			detail: ''
		} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_CREATE_EVENT:
				return {
					title: '',
					begin_at: '',
					// end_at: '',
					rank: '4',
					detail: ''
				};
			case EDIT_MODAL_DATA_TITLE:
				return _extends({}, state, { title: action.value });
			case EDIT_MODAL_DATA_BEGIN:
				return _extends({}, state, { begin_at: action.value });
			// case EDIT_MODAL_DATA_END:
			// 	return Object.assign({}, state, {end_at: action.value});
			case EDIT_MODAL_DATA_RANK:
				return _extends({}, state, { rank: action.value });
			case EDIT_MODAL_DATA_DETAIL:
				return _extends({}, state, { detail: action.value });
			case EDIT_MODAL_DATA_BE:
				return _extends({}, state, { begin_at: action.begin, end_at: action.end });
			// case CLOSE_EVENT_MODAL:
			// 	return {
			// 		title: '',
			// 		begin_at: '',
			// 		end_at: '',
			// 		rank: '',
			// 		detail: ''
			// 	}
			case OPEN_MODIFY_EVENT:
				return _extends({}, action.event);
			default:
				return state;
		}
	}

	function modalFlag() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_CREATE_EVENT:
				return 'create';
			case OPEN_MODIFY_EVENT:
				return 'modify';
			default:
				return state;
		}
	}

	function modalErr() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case MODAL_ERROR:
				return action.txt;
			case CLOSE_EVENT_MODAL:
				return null;
			default:
				return state;
		}
	}

	function delId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_DEL_MODAL:
				return action.id;
			case CLOSE_DEL_MODAL:
				return null;
			default:
				return state;
		}
	}

	function delModalShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_DEL_MODAL:
				return true;
			case CLOSE_DEL_MODAL:
				return false;
			default:
				return state;
		}
	}

	function endId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_END_MODAL:
				return action.id;
			case CLOSE_END_MODAL:
				return null;
			default:
				return state;
		}
	}

	function endModalShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_END_MODAL:
				return true;
			case CLOSE_END_MODAL:
				return false;
			default:
				return state;
		}
	}

	function eventList() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

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
		};
	}

	return {
		eventList: eventList
	};
});