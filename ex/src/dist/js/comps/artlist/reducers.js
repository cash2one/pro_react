'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define([paths.ex.page + '/advices/base/news/audit/filters.js', paths.ex.comps + '/artlist/actions.js'], function (filters, Actions) {

	function gen(prefix, filter) {
		if (!prefix) return;

		filter = filter || filters;

		var defaultFilter = Object.keys(filter).reduce(function (obj, key) {
			obj[key] = filter[key].items[0].key;
			return obj;
		}, {});

		defaultFilter = $.extend({}, defaultFilter, {
			title: 'true',
			emotion: 'all',
			cate: 'all',
			begin: 0,
			limit: 10,
			search: ''
		});

		var _Actions = Actions(prefix);

		var CHANGE_FILTER = _Actions.CHANGE_FILTER;
		var RECEIVE_ART_DATA = _Actions.RECEIVE_ART_DATA;
		var RECEIVE_CATE_FILTER = _Actions.RECEIVE_CATE_FILTER;
		var RECEIVE_REPORT_SELECT_DATA = _Actions.RECEIVE_REPORT_SELECT_DATA;
		var RECEIVE_EVENT_SELECT_DATA = _Actions.RECEIVE_EVENT_SELECT_DATA;
		var MODIFY_ART_SELECT = _Actions.MODIFY_ART_SELECT;
		var ADD_ART_REPORTS = _Actions.ADD_ART_REPORTS;
		var ADD_ART_EVENTS = _Actions.ADD_ART_EVENTS;
		var DELETE_ART = _Actions.DELETE_ART;
		var ADD_ART_EMOTION = _Actions.ADD_ART_EMOTION;
		var RECEIVE_ART_COUNT = _Actions.RECEIVE_ART_COUNT;
		var CHANGE_QUERY_BEGIN = _Actions.CHANGE_QUERY_BEGIN;
		var ADD_ART_WARN = _Actions.ADD_ART_WARN;
		var IGNORE_ART_WARN = _Actions.IGNORE_ART_WARN;
		var SET_EVENT_ID_TO_QUERYPARAMS = _Actions.SET_EVENT_ID_TO_QUERYPARAMS;
		var ERROR_MODAL_SHOW = _Actions.ERROR_MODAL_SHOW;
		var BEGIN_UPDATE = _Actions.BEGIN_UPDATE;
		var END_UPDATE = _Actions.END_UPDATE;
		var LOADING = _Actions.LOADING;
		var DEPEND_MODAL_SHOW = _Actions.DEPEND_MODAL_SHOW;


		function queryParams() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? defaultFilter : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case CHANGE_FILTER:
					return _extends({}, state, action.modify);
				case CHANGE_QUERY_BEGIN:
					return _extends({}, state, { begin: action.begin });
				case SET_EVENT_ID_TO_QUERYPARAMS:
					return _extends({}, state, { event_id: action.id });
				default:
					return state;
			}
		}

		function artById() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case RECEIVE_ART_DATA:
					return action.data.reduce(function (obj, item) {
						obj[item.uuid] = item;
						return obj;
					}, {});
				case ADD_ART_REPORTS:
					var modify = action.uuids.reduce(function (obj, uuid) {
						var reports = (state[uuid].reports || []).slice();
						reports.push(action.report);
						obj[uuid] = _extends({}, state[uuid], { reports: reports });
						return obj;
					}, {});
					return _extends({}, state, modify);
				case ADD_ART_EVENTS:
					var modify = action.uuids.reduce(function (obj, uuid) {
						var events = (state[uuid].events || []).slice();
						events.push(action.event);
						obj[uuid] = _extends({}, state[uuid], { events: events });
						return obj;
					}, {});
					return _extends({}, state, modify);
				case DELETE_ART:
					var modify = _extends({}, state);
					action.uuids.forEach(function (uuid) {
						delete modify[uuid];
					});
					return modify;
				case ADD_ART_EMOTION:
					var modify = action.uuids.reduce(function (obj, uuid) {
						obj[uuid] = _extends({}, state[uuid], { emotion: action.emotion });
						return obj;
					}, {});
					return _extends({}, state, modify);
				case ADD_ART_WARN:
					var modify = action.uuids.reduce(function (obj, uuid) {
						obj[uuid] = _extends({}, state[uuid], { warn: 'manual' });
						return obj;
					}, {});
					return _extends({}, state, modify);
				case IGNORE_ART_WARN:
					var modify = action.uuids.reduce(function (obj, uuid) {
						obj[uuid] = _extends({}, state[uuid], { warn: 'none' });
						return obj;
					}, {});
					return _extends({}, state, modify);
				default:
					return state;
			}
		}

		function artSelected() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case MODIFY_ART_SELECT:
					if (action.flag == 'add') {
						state = state.slice();
						state.push(action.uuid);
						return state;
					} else if (action.flag == 'remove') {
						var index = state.indexOf(action.uuid);
						if (index != -1) {
							return [].concat(_toConsumableArray(state.slice(0, index)), _toConsumableArray(state.slice(index + 1)));
						}
					} else if (action.flag == 'reset') {
						return [];
					} else {
						return state;
					}
				default:
					return state;
			}
		}

		function artCount() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case RECEIVE_ART_COUNT:
					return action.count;
				default:
					return state;
			}
		}

		function filterBoxData() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? filter : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case RECEIVE_CATE_FILTER:
					return _extends({}, state, _defineProperty({}, 'cate', action.data));
				default:
					return state;
			}
		}

		function eventSelectData() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case RECEIVE_EVENT_SELECT_DATA:
					return action.data;
				default:
					return state;
			}
		}

		function reportSelectData() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case RECEIVE_REPORT_SELECT_DATA:
					return action.data;
				default:
					return state;
			}
		}

		function errorModal() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var action = arguments[1];

			return {
				show: errorModalShow(state.show, action),
				msg: errorModalMsg(state.msg, action)
			};
		}

		function errorModalShow() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case ERROR_MODAL_SHOW:
					return action.show;
				default:
					return state;
			}
		}

		function errorModalMsg() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case ERROR_MODAL_SHOW:
					return action.msg;
				default:
					return state;
			}
		}

		function updateAt() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case END_UPDATE:
					return action.time;
				default:
					return state;
			}
		}

		function updating() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case END_UPDATE:
					return false;
				case BEGIN_UPDATE:
					return true;
				default:
					return state;
			}
		}

		function loading() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case LOADING:
					return action.status;
				default:
					return state;
			}
		}

		function dependModalShow() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case DEPEND_MODAL_SHOW:
					return action.tog;
				default:
					return state;
			}
		}

		return {
			queryParams: queryParams,
			artById: artById,
			artSelected: artSelected,
			artCount: artCount,
			filterBoxData: filterBoxData,
			eventSelectData: eventSelectData,
			reportSelectData: reportSelectData,
			errorModal: errorModal,
			updateAt: updateAt,
			updating: updating,
			loading: loading,
			dependModalShow: dependModalShow
		};
	}

	return gen;
});