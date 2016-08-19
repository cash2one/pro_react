'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define([paths.ex.page + '/advices/base/articles/actions.js', paths.ex.page + '/advices/base/articles/default.js'], function (Actions, DefaultParams) {

	function gen(prefix) {
		var fix = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		var instead = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		var _Actions = Actions(prefix);

		var SET_FILTERS = _Actions.SET_FILTERS;
		var SET_FILTERS_MUTIKEY = _Actions.SET_FILTERS_MUTIKEY;
		var SET_FILTERS_MOREKEY = _Actions.SET_FILTERS_MOREKEY;
		var ADD_FILTERS_SELECTED = _Actions.ADD_FILTERS_SELECTED;
		var DELETE_FILTERS_SELECTED = _Actions.DELETE_FILTERS_SELECTED;
		var CLEAR_FILTERS_SELECTED = _Actions.CLEAR_FILTERS_SELECTED;
		var MODIFY_QUERY_PARAMS = _Actions.MODIFY_QUERY_PARAMS;
		var SET_SELECTED_TAGS = _Actions.SET_SELECTED_TAGS;
		var SET_QUERY_PARAMS = _Actions.SET_QUERY_PARAMS;
		var SET_PARAMS_MIRROR = _Actions.SET_PARAMS_MIRROR;
		var SET_ARTICLES = _Actions.SET_ARTICLES;
		var SET_REPORT_SELECT_DATA = _Actions.SET_REPORT_SELECT_DATA;
		var SET_EVENT_SELECT_DATA = _Actions.SET_EVENT_SELECT_DATA;
		var SET_ARTICLES_COUNT = _Actions.SET_ARTICLES_COUNT;
		var MODIFY_ARTICLE = _Actions.MODIFY_ARTICLE;
		var DELETE_ARTICLE = _Actions.DELETE_ARTICLE;
		var ADD_ARTICLE_REPORT = _Actions.ADD_ARTICLE_REPORT;
		var REMOVE_ARTICLE_REPORT = _Actions.REMOVE_ARTICLE_REPORT;
		var ADD_ART_EVENTS = _Actions.ADD_ART_EVENTS;
		var REMOVE_ART_EVENTS = _Actions.REMOVE_ART_EVENTS;
		var DEPEND_MODAL_SHOW = _Actions.DEPEND_MODAL_SHOW;
		var SET_DEPEND_UUID = _Actions.SET_DEPEND_UUID;
		var TOGGLE_LOADING = _Actions.TOGGLE_LOADING;


		var dp;
		if (instead) dp = fix;else dp = $.extend(true, {}, DefaultParams, fix);

		function filters_data() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_FILTERS:
					return $.extend({}, state, action.data);
				default:
					return state;
			}
		}

		function filter_mutiKey() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_FILTERS_MUTIKEY:
					return action.key;
				default:
					return state;
			}
		}

		function filter_moreKey() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_FILTERS_MOREKEY:
					return action.key;
				default:
					return state;
			}
		}

		function filters() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var action = arguments[1];

			return {
				data: filters_data(state.data, action),
				mutiKey: filter_mutiKey(state.mutiKey, action),
				moreKey: filter_moreKey(state.moreKey, action)
			};
		}

		function filters_selected() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case ADD_FILTERS_SELECTED:
					state = [].concat(_toConsumableArray(state), [action.value]);
					return state;
				case DELETE_FILTERS_SELECTED:
					var idx = state.indexOf(action.value);
					if (idx != -1) state = [].concat(_toConsumableArray(state.slice(0, idx)), _toConsumableArray(state.slice(idx + 1)));
					return state;
				case CLEAR_FILTERS_SELECTED:
					return [];
				default:
					return state;
			}
		}

		function queryParams() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? dp : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case MODIFY_QUERY_PARAMS:
					return _extends({}, state, _defineProperty({}, action.key, action.value));
				case SET_QUERY_PARAMS:
					return action.queryParams;
				default:
					return state;
			}
		}

		function paramsMirror() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? dp : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_PARAMS_MIRROR:
					return action.params;
				default:
					return state;
			}
		}

		function selected_tags() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_SELECTED_TAGS:
					return action.tags;
				default:
					return state;
			}
		}

		function defaultParams() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? dp : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				default:
					return state;
			}
		}

		function articles() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_ARTICLES:
					return action.data.reduce(function (obj, item, idx) {
						item['__i'] = idx;
						obj[item['uuid']] = item;
						return obj;
					}, {});
				case MODIFY_ARTICLE:
					var art = _extends({}, state[action['uuid']], _defineProperty({}, action['key'], action['value']));
					return _extends({}, state, _defineProperty({}, action['uuid'], art));
				case DELETE_ARTICLE:
					var s = $.extend({}, state);
					delete s[action.uuid];
					return s;
				case ADD_ARTICLE_REPORT:
					var art = $.extend({}, state[action.uuid]),
					    reports = art.reports;
					if (!reports || !(reports instanceof Array)) reports = art.reports = [];
					reports.push(action.report);
					return $.extend({}, state, _defineProperty({}, action['uuid'], art));
				case REMOVE_ARTICLE_REPORT:
					var art = $.extend({}, state[action.uuid]),
					    reports = art.reports;
					if (!reports || !(reports instanceof Array)) return state;
					reports = reports.filter(function (item) {
						return item.id != action.reportId;
					});
					art = _extends({}, art, { reports: reports });
					return $.extend({}, state, _defineProperty({}, action['uuid'], art));
				case ADD_ART_EVENTS:
					var art = $.extend({}, state[action.uuid]),
					    events = art.events;
					if (!events || !(events instanceof Array)) events = art.events = [];
					events.push(action.event);
					return $.extend({}, state, _defineProperty({}, action['uuid'], art));
				case REMOVE_ART_EVENTS:
					var art = $.extend({}, state[action.uuid]),
					    events = art.events;
					if (!events || !(events instanceof Array)) return state;
					events = events.filter(function (item) {
						return item.id != action.eventId;
					});
					art = _extends({}, art, { events: events });
					return $.extend({}, state, _defineProperty({}, action['uuid'], art));
				default:
					return state;
			}
		}

		function reportSelectData() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_REPORT_SELECT_DATA:
					return action.data;
				default:
					return state;
			}
		}

		function eventSelectData() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_EVENT_SELECT_DATA:
					return action.data;
				default:
					return state;
			}
		}

		function articlesCount() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_ARTICLES_COUNT:
					return action.count;
				case DELETE_ARTICLE:
					return state - 1;
				default:
					return state;
			}
		}

		function articlesUniqCount() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_ARTICLES_COUNT:
					return action.uniqCount || 0;
				case DELETE_ARTICLE:
					return state - 1;
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

		function dependUuid() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case SET_DEPEND_UUID:
					return action.uuid;
				case DEPEND_MODAL_SHOW:
					return action.uuid || state;
				default:
					return state;
			}
		}

		function loading() {
			var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
			var action = arguments[1];

			switch (action.type) {
				case TOGGLE_LOADING:
					return action.show;
				default:
					return state;
			}
		}

		return {
			filters: filters,
			filters_selected: filters_selected,
			queryParams: queryParams,
			paramsMirror: paramsMirror,
			selected_tags: selected_tags,
			defaultParams: defaultParams,
			articles: articles,
			articlesCount: articlesCount,
			articlesUniqCount: articlesUniqCount,
			reportSelectData: reportSelectData,
			eventSelectData: eventSelectData,
			dependModalShow: dependModalShow,
			dependUuid: dependUuid,
			loading: loading
		};
	}

	return gen;
});