'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define([paths.rcn.util + '/rest.js'], function (Rest) {
	var rest = Rest.ex();

	var TAG_CHANGE_TAB = 'TAG_CHANGE_TAB';
	var TAG_RECEIVE_CATE = 'TAG_RECEIVE_CATE';
	var RECEIVE_AUTO_DATA = 'RECEIVE_AUTO_DATA';
	var RECEIVE_AUTO_TOTAL = 'RECEIVE_AUTO_TOTAL';
	var CHANGE_AUTO_PAGE = 'CHANGE_AUTO_PAGE';
	var CHANGE_CATE_PAGE = 'CHANGE_CATE_PAGE';
	var RECEIVE_CATE_TOTAL = 'RECEIVE_CATE_TOTAL';
	var MODIFY_AUTO = 'MODIFY_AUTO';
	var TOOGLE_AUTO_EDIT_BOX = 'TOOGLE_AUTO_EDIT_BOX';
	var OPEN_AUTO_EDIT_BOX = 'OPEN_AUTO_EDIT_BOX';
	var MODIFY_KEY_WORD = 'MODIFY_KEY_WORD';
	var CREATE_KEY_WORD = 'CREATE_KEY_WORD';
	var CLOSE_AUTO_EDIT_BOX = 'CLOSE_AUTO_EDIT_BOX';
	var OPEN_AUTO_DEL_MODAL = 'OPEN_AUTO_DEL_MODAL';
	var TOGGLE_CATE_EDIT_BOX = 'TOGGLE_CATE_EDIT_BOX';
	var OPEN_CATE_EDIT_BOX = 'OPEN_CATE_EDIT_BOX';
	var CLOSE_CATE_EDIT_BOX = 'CLOSE_CATE_EDIT_BOX';
	var MODIFY_CATE = 'MODIFY_CATE';
	var CREATE_CATE = 'CREATE_CATE';
	var CLOSE_AUTO_DEL_MODAL = 'CLOSE_AUTO_DEL_MODAL';
	var DEL_AUTO = 'DEL_AUTO';
	var OPEN_CATE_DEL_MODAL = 'OPEN_CATE_DEL_MODAL';
	var CLOSE_CATE_DEL_MODAL = 'CLOSE_CATE_DEL_MODAL';
	var DEL_CATE = 'DEL_CATE';
	var CHANGE_SEARCH_STATE = 'CHANGE_SEARCH_STATE';
	var SEARCH_INPUT = 'SEARCH_INPUT';
	var SEARCH = 'SEARCH';
	var AUTO_MODAL_ERR = 'AUTO_MODAL_ERR';
	var CATE_MODAL_ERR = 'CATE_MODAL_ERR';

	function changeSearchState(bool) {
		return {
			type: CHANGE_SEARCH_STATE,
			status: bool
		};
	}

	function searchInput(txt) {
		return function (dispatch, getState) {
			if (txt.length == 0) {
				dispatch(changeSearchState(false));
				dispatch(getAutoDataByPage(1));
				dispatch({
					type: CHANGE_AUTO_PAGE,
					page: 1
				});
				dispatch(getAutoTotal());
			}
			dispatch({
				type: SEARCH_INPUT,
				txt: txt
			});
		};
	}

	function search() {
		return function (dispatch, getState) {
			var state = getState()['manager_tag']['autoList'];
			if (state.searchTxt.length > 0) {
				dispatch(changeSearchState(true));
				dispatch(getAutoDataByPage(1, true));
				dispatch(getAutoTotal(true));
			}
		};
	}

	function tagChangeTab(name) {
		return function (dispatch, getState) {
			dispatch({
				type: TAG_CHANGE_TAB,
				name: name
			});
			var state = getState()['manager_tag'],
			    last,
			    key;
			if (name == 'auto') {
				last = state['autoList']['lastUpdate'];
			} else {
				last = state['cateList']['lastUpdate'];
			}

			if (last == undefined || Date.now() - last > 30000) {
				if (name == 'auto') {
					dispatch(updateAutoData());
					dispatch(getAutoTotal());
				} else if (name == 'cate') {
					dispatch(updateCateData());
					dispatch(getCateTotal());
				}
			}
		};
	}

	function tagReceiveCate(data) {
		return {
			type: TAG_RECEIVE_CATE,
			data: data
		};
	}

	function changeCatePage(page) {
		return function (dispatch) {
			dispatch({
				type: CHANGE_CATE_PAGE,
				page: page
			});
			dispatch(getCateDataByPage(page));
		};
	}

	function getCateDataByPage(page) {
		return function (dispatch, getState) {
			var count = getState()['manager_tag']['cateList']['count'];
			rest.category.read({
				begin: (page - 1) * count,
				count: count
			}).then(function (data) {
				return dispatch(tagReceiveCate(data));
			});
		};
	}

	function updateCateData() {
		return function (dispatch, getState) {
			var page = getState()['manager_tag']['cateList']['cur_page'];
			dispatch(getCateDataByPage(page));
		};
	}

	function getCateTotal() {
		return function (dispatch) {
			rest.category.read('count').then(function (data) {
				dispatch({
					type: RECEIVE_CATE_TOTAL,
					total: data.count
				});
			});
		};
	}

	function toggleCateEditBox(toggle) {
		return {
			type: TOGGLE_CATE_EDIT_BOX,
			toggle: toggle
		};
	}

	function openCateEditBox(id) {
		return function (dispatch) {
			dispatch(toggleCateEditBox(true));
			dispatch({
				type: OPEN_CATE_EDIT_BOX,
				id: id
			});
		};
	}

	function delCate(id) {
		return function (dispatch) {
			rest.category.del(id).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: DEL_CATE,
						id: id
					});
				}
			});
		};
	}

	function closeCateEditBox() {
		return function (dispatch) {
			dispatch(toggleCateEditBox(false));
		};
	}

	function modifyCate(id, modify) {
		return function (dispatch) {
			rest.category.update(id, modify).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: MODIFY_CATE,
						id: id,
						modify: modify
					});
					dispatch(closeCateEditBox());
				} else {
					dispatch({
						type: CATE_MODAL_ERR,
						txt: data.msg
					});
				}
			});
		};
	}

	function createCate(cate) {
		return function (dispatch) {
			var keywords = cate.keywords;
			keywords = keywords.map(function (item) {
				return item.id;
			});
			var upload = _extends({}, cate, { keywords: keywords });

			rest.category.create(upload).done(function (data) {
				if (data.result == true) {
					cate.id = data.id;
					cate.last_at = data.create_at;
					dispatch({
						type: CREATE_CATE,
						cate: cate
					});
					dispatch(closeCateEditBox());
				} else {
					dispatch({
						type: CATE_MODAL_ERR,
						txt: data.msg
					});
				}
			});
		};
	}

	function openCateDelModal(id) {
		return {
			type: OPEN_CATE_DEL_MODAL,
			id: id
		};
	}

	function closeCateDelModal() {
		return {
			type: CLOSE_CATE_DEL_MODAL
		};
	}

	function receiveAutoData(data) {
		return {
			type: RECEIVE_AUTO_DATA,
			data: data
		};
	}

	function getAutoTotal(isSearch) {
		return function (dispatch, getState) {
			var state = getState()['manager_tag']['autoList'];
			if (isSearch) {
				rest.keywords.read('count', {
					search: state.searchTxt
				}).then(function (data) {
					dispatch({
						type: RECEIVE_AUTO_TOTAL,
						total: data.count
					});
				});
			} else {
				rest.keywords.read('count').then(function (data) {
					dispatch({
						type: RECEIVE_AUTO_TOTAL,
						total: data.count
					});
				});
			}
		};
	}

	function getAutoDataByPage(page, isSearch) {
		return function (dispatch, getState) {
			var state = getState()['manager_tag']['autoList'];
			var qp = {
				begin: (page - 1) * state.count,
				count: state.count,
				category: true
			};
			if (isSearch) {
				qp = _extends(qp, {
					search: state.searchTxt
				});
			}
			rest.keywords.read(qp).then(function (data) {
				return dispatch(receiveAutoData(data));
			});
		};
	}

	function changeAutoPage(page) {
		return function (dispatch, getState) {
			var state = getState()['manager_tag']['autoList'];
			dispatch({
				type: CHANGE_AUTO_PAGE,
				page: page
			});
			dispatch(getAutoDataByPage(page, state.isSearching));
		};
	}

	function updateAutoData() {
		return function (dispatch, getState) {
			var page = getState()['manager_tag']['autoList'].cur_page;
			dispatch(getAutoDataByPage(page));
		};
	}

	function modifyAuto(id, modify) {
		return function (dispatch) {
			rest.keywords.update(id, modify).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: MODIFY_AUTO,
						id: id,
						modify: modify
					});
				}
			});
		};
	}

	function toogleAutoEditBox(toogle) {
		return {
			type: TOOGLE_AUTO_EDIT_BOX,
			toogle: toogle
		};
	}

	function openAutoEditBox(id) {
		return function (dispatch) {
			dispatch(toogleAutoEditBox(true));
			dispatch({
				type: OPEN_AUTO_EDIT_BOX,
				id: id
			});
		};
	}

	function modifyKeyWord(id, modify) {
		return function (dispatch) {
			// if(modify.category && modify.category.length == 0) modify.category = '';
			rest.keywords.update(id, modify).done(function (data) {
				if (data.result == true) {
					if (modify.category == '') modify.category = [];
					dispatch({
						type: MODIFY_AUTO,
						id: id,
						modify: modify
					});
					dispatch(toogleAutoEditBox(false));
				} else {
					dispatch({
						type: AUTO_MODAL_ERR,
						txt: data.msg
					});
				}
			});
		};
	}

	function createKeyWord(keyword) {
		return function (dispatch) {
			var upload = $.extend(true, {}, keyword);
			var category = upload.category.map(function (item) {
				return {
					id: item.id,
					name: item.name
				};
			});
			upload.category = category;
			rest.keywords.create(upload).done(function (data) {
				if (data.result == true) {
					keyword.id = data.id;
					keyword.status = 1;
					dispatch({
						type: CREATE_KEY_WORD,
						keyword: keyword
					});
					dispatch(getAutoTotal());
					dispatch(toogleAutoEditBox(false));
					dispatch({
						type: AUTO_MODAL_ERR,
						txt: null
					});
				} else {
					dispatch({
						type: AUTO_MODAL_ERR,
						txt: data.msg
					});
				}
			});
		};
	}

	function closeAutoEditBox() {
		return function (dispatch) {
			dispatch(toogleAutoEditBox(false));
		};
	}

	function openAutoDelModal(id) {
		return {
			type: OPEN_AUTO_DEL_MODAL,
			id: id
		};
	}

	function closeAutoDelModal() {
		return {
			type: CLOSE_AUTO_DEL_MODAL
		};
	}

	function delAuto(id, b) {
		return function (dispatch) {
			rest.keywords.del(id, {
				del_article: b
			}).done(function (data) {
				if (data.result == true) {
					dispatch({
						type: DEL_AUTO,
						id: id
					});
					dispatch(closeAutoDelModal());
				}
			});
		};
	}

	return {
		TAG_CHANGE_TAB: TAG_CHANGE_TAB,
		tagChangeTab: tagChangeTab,
		TAG_RECEIVE_CATE: TAG_RECEIVE_CATE,
		RECEIVE_AUTO_DATA: RECEIVE_AUTO_DATA,
		RECEIVE_AUTO_TOTAL: RECEIVE_AUTO_TOTAL,
		getAutoTotal: getAutoTotal,
		CHANGE_AUTO_PAGE: CHANGE_AUTO_PAGE,
		changeAutoPage: changeAutoPage,
		updateAutoData: updateAutoData,
		CHANGE_CATE_PAGE: CHANGE_CATE_PAGE,
		changeCatePage: changeCatePage,
		RECEIVE_CATE_TOTAL: RECEIVE_CATE_TOTAL,
		getCateTotal: getCateTotal,
		updateCateData: updateCateData,
		MODIFY_AUTO: MODIFY_AUTO,
		modifyAuto: modifyAuto,
		TOOGLE_AUTO_EDIT_BOX: TOOGLE_AUTO_EDIT_BOX,
		OPEN_AUTO_EDIT_BOX: OPEN_AUTO_EDIT_BOX,
		openAutoEditBox: openAutoEditBox,
		modifyKeyWord: modifyKeyWord,
		createKeyWord: createKeyWord,
		CLOSE_AUTO_EDIT_BOX: CLOSE_AUTO_EDIT_BOX,
		closeAutoEditBox: closeAutoEditBox,
		OPEN_AUTO_DEL_MODAL: OPEN_AUTO_DEL_MODAL,
		CREATE_KEY_WORD: CREATE_KEY_WORD,
		openAutoDelModal: openAutoDelModal,
		closeAutoDelModal: closeAutoDelModal,
		DEL_AUTO: DEL_AUTO,
		delAuto: delAuto,
		CHANGE_SEARCH_STATE: CHANGE_SEARCH_STATE,
		SEARCH_INPUT: SEARCH_INPUT,
		changeSearchState: changeSearchState,
		searchInput: searchInput,
		search: search,
		AUTO_MODAL_ERR: AUTO_MODAL_ERR,
		CATE_MODAL_ERR: CATE_MODAL_ERR,

		TOGGLE_CATE_EDIT_BOX: TOGGLE_CATE_EDIT_BOX,
		OPEN_CATE_EDIT_BOX: OPEN_CATE_EDIT_BOX,
		MODIFY_CATE: MODIFY_CATE,
		CREATE_CATE: CREATE_CATE,
		OPEN_CATE_DEL_MODAL: OPEN_CATE_DEL_MODAL,
		DEL_CATE: DEL_CATE,
		CLOSE_CATE_DEL_MODAL: CLOSE_CATE_DEL_MODAL,
		openCateEditBox: openCateEditBox,
		closeCateEditBox: closeCateEditBox,
		modifyCate: modifyCate,
		createCate: createCate,
		openCateDelModal: openCateDelModal,
		delCate: delCate,
		closeCateDelModal: closeCateDelModal
	};
});