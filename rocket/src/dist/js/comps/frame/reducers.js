'use strict';

define(['mods', paths.rcn.comps + '/frame/actions.js'], function (mods, Actions) {
	var combineReducers = mods.ReduxPack.combineReducers;
	var FR_NAV_OPEN = Actions.FR_NAV_OPEN;
	var FR_RECEIVE_RENDER_DATA = Actions.FR_RECEIVE_RENDER_DATA;
	var FR_SET_COMPANY_NAME = Actions.FR_SET_COMPANY_NAME;
	var FR_SET_USER_NAME = Actions.FR_SET_USER_NAME;
	var FR_NAV_UPDATE = Actions.FR_NAV_UPDATE;
	var FR_NAV_UPDATED = Actions.FR_NAV_UPDATED;
	var FR_USER = Actions.FR_USER;


	function byName() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case FR_RECEIVE_RENDER_DATA:
				return action.data.reduce(function (obj, item) {
					obj[item.name] = item;
					return obj;
				}, {});
			default:
				return state;
		}
	}
	function opened() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case FR_NAV_OPEN:
				return action.name;
			default:
				return state;
		}
	}

	function fr_nav() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		return {
			byName: byName(state.byName, action),
			opened: opened(state.opened, action)
		};
	}

	function fr_user() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case FR_USER:
				return action.user;
			default:
				return state;
		}
	}

	function updateNav() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case FR_NAV_UPDATE:
				return true;
			case FR_NAV_UPDATED:
				return false;
			default:
				return state;
		}
	}

	return {
		fr_nav: fr_nav,
		fr_user: fr_user,
		updateNav: updateNav
	};
});