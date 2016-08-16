'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([paths.ex.page + '/advices/manager/tag/actions.js'], function (Actions) {
	var TAG_CHANGE_TAB = Actions.TAG_CHANGE_TAB;
	var TAG_RECEIVE_CATE = Actions.TAG_RECEIVE_CATE;
	var POP_DEL_CATE_MODAL = Actions.POP_DEL_CATE_MODAL;
	var RECEIVE_AUTO_DATA = Actions.RECEIVE_AUTO_DATA;
	var RECEIVE_AUTO_TOTAL = Actions.RECEIVE_AUTO_TOTAL;
	var CHANGE_AUTO_PAGE = Actions.CHANGE_AUTO_PAGE;
	var CHANGE_CATE_PAGE = Actions.CHANGE_CATE_PAGE;
	var RECEIVE_CATE_TOTAL = Actions.RECEIVE_CATE_TOTAL;
	var MODIFY_AUTO = Actions.MODIFY_AUTO;
	var TOOGLE_AUTO_EDIT_BOX = Actions.TOOGLE_AUTO_EDIT_BOX;
	var OPEN_AUTO_EDIT_BOX = Actions.OPEN_AUTO_EDIT_BOX;
	var CREATE_KEY_WORD = Actions.CREATE_KEY_WORD;
	var TOGGLE_CATE_EDIT_BOX = Actions.TOGGLE_CATE_EDIT_BOX;
	var OPEN_CATE_EDIT_BOX = Actions.OPEN_CATE_EDIT_BOX;
	var MODIFY_CATE = Actions.MODIFY_CATE;
	var CREATE_CATE = Actions.CREATE_CATE;
	var OPEN_AUTO_DEL_MODAL = Actions.OPEN_AUTO_DEL_MODAL;
	var CLOSE_AUTO_DEL_MODAL = Actions.CLOSE_AUTO_DEL_MODAL;
	var DEL_AUTO = Actions.DEL_AUTO;
	var OPEN_CATE_DEL_MODAL = Actions.OPEN_CATE_DEL_MODAL;
	var DEL_CATE = Actions.DEL_CATE;
	var CLOSE_CATE_DEL_MODAL = Actions.CLOSE_CATE_DEL_MODAL;
	var CHANGE_SEARCH_STATE = Actions.CHANGE_SEARCH_STATE;
	var SEARCH_INPUT = Actions.SEARCH_INPUT;
	var AUTO_MODAL_ERR = Actions.AUTO_MODAL_ERR;
	var CATE_MODAL_ERR = Actions.CATE_MODAL_ERR;


	function cate_del_modal() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {
			opened: false,
			cate_id: ''
		} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case POP_DEL_CATE_MODAL:
				return {
					opened: true,
					cate_id: action.id
				};
			default:
				return state;
		}
	}

	function cateList() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		return {
			cur_page: cateCurPage(state.cur_page, action),
			cateById: cateById(state.cateById, action),
			lastUpdate: cateLastUpdate(state.lastUpdate, action),
			total: cateTotal(state.total, action),
			count: 20,
			edit_box_show: cateEditBoxShow(state.edit_box_show, action),
			edit_box_data_id: cateEditBoxDataId(state.edit_box_data_id, action),
			del_id: cateDelId(state.del_id, action),
			del_show: cateDelShow(state.del_show, action),
			modalErr: cateModalErr(state.modalErr, action)
		};
	}

	function cateModalErr() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case CATE_MODAL_ERR:
				return action.txt;
			case TOGGLE_CATE_EDIT_BOX:
				return null;
			default:
				return state;
		}
	}

	function cateCurPage() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case CHANGE_CATE_PAGE:
				return action.page;
			default:
				return state;
		}
	}

	function cateTotal() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case RECEIVE_CATE_TOTAL:
				return action.total;
			default:
				return state;
		}
	}

	function cateById() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case TAG_RECEIVE_CATE:
				return action.data.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
			case MODIFY_CATE:
				var cate = state[action.id];
				cate = _extends({}, cate, action.modify);
				return _extends({}, state, _defineProperty({}, action.id, cate));
			case CREATE_CATE:
				return _extends({}, state, _defineProperty({}, action.cate.id, action.cate));
			case DEL_CATE:
				var cate = _extends({}, state);
				delete cate[action.id];
				return cate;
			default:
				return state;
		}
	}

	function cateLastUpdate() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case TAG_RECEIVE_CATE:
				return Date.now();
			default:
				return state;
		}
	}

	function cateEditBoxShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case TOGGLE_CATE_EDIT_BOX:
				return action.toggle;
			case TAG_CHANGE_TAB:
				return action.name != 'cate';
			default:
				return state;
		}
	}

	function cateEditBoxDataId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_CATE_EDIT_BOX:
				return action.id;
			default:
				return state;
		}
	}

	function cateDelId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_CATE_DEL_MODAL:
				return action.id;
			default:
				return state;
		}
	}

	function cateDelShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_CATE_DEL_MODAL:
				return true;
			case DEL_CATE:
				return false;
			case CLOSE_CATE_DEL_MODAL:
				return false;
			default:
				return state;
		}
	}

	function isSearching() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case CHANGE_SEARCH_STATE:
				return action.status;
			default:
				return state;
		}
	}

	function searchTxt() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case SEARCH_INPUT:
				return action.txt;
			default:
				return state;
		}
	}

	function autoModalErr() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case AUTO_MODAL_ERR:
				return action.txt;
			case TOOGLE_AUTO_EDIT_BOX:
				return null;
			default:
				return state;
		}
	}

	function autoList() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		return {
			cur_page: autoCurPage(state.cur_page, action),
			total: autoTotal(state.total, action),
			autoById: autoById(state.autoById, action),
			lastUpdate: autoLastUpdate(state.lastUpdate, action),
			count: 20,
			edit_box_show: autoEditBoxShow(state.edit_box_show, action),
			edit_box_data_id: autoEditBoxDataId(state.edit_box_data_id, action),
			del_modal_show: autoDelModalShow(state.del_modal_show, action),
			del_id: autoDelId(state.delete_id, action),
			isSearching: isSearching(state.isSearching, action),
			searchTxt: searchTxt(state.searchTxt, action),
			modalErr: autoModalErr(state.modalErr, action)
		};
	}

	function autoCurPage() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case CHANGE_AUTO_PAGE:
				return action.page;
			default:
				return state;
		}
	}

	function autoTotal() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case RECEIVE_AUTO_TOTAL:
				return action.total;
			default:
				return state;
		}
	}

	function autoById() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case RECEIVE_AUTO_DATA:
				return action.data.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
			case MODIFY_AUTO:
				var auto = state[action.id];
				if (auto) {
					auto = _extends({}, auto, action.modify);
					return _extends({}, state, _defineProperty({}, action.id, auto));
				} else {
					return state;
				}
			case CREATE_KEY_WORD:
				return _extends({}, state, _defineProperty({}, action.keyword.id, action.keyword));
			case DEL_AUTO:
				state = _extends({}, state);
				delete state[action.id];
				return state;
			default:
				return state;
		}
	}

	function autoLastUpdate() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case RECEIVE_AUTO_DATA:
				return Date.now();
			default:
				return state;
		}
	}

	function autoEditBoxShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case TOOGLE_AUTO_EDIT_BOX:
				return action.toogle;
			case TAG_CHANGE_TAB:
				return action.name != 'auto';
			default:
				return state;
		}
	}

	function autoEditBoxDataId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_AUTO_EDIT_BOX:
				return action.id;
			default:
				return state;
		}
	}

	function autoDelModalShow() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_AUTO_DEL_MODAL:
				return true;
			case CLOSE_AUTO_DEL_MODAL:
				return false;
			default:
				return state;
		}
	}

	function autoDelId() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case OPEN_AUTO_DEL_MODAL:
				return action.id;
			case CLOSE_AUTO_DEL_MODAL:
				return null;
			default:
				return state;
		}
	}

	function tab() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? 'auto' : arguments[0];
		var action = arguments[1];

		switch (action.type) {
			case TAG_CHANGE_TAB:
				return action.name;
			default:
				return state;
		}
	}

	function manager_tag() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
		var action = arguments[1];

		return {
			tab: tab(state.tab, action),
			autoList: autoList(state.autoList, action),
			cateList: cateList(state.cateList, action)
		};
	}

	return {
		manager_tag: manager_tag
	};
});