define([
	paths.ex.page + '/advices/manager/tag/actions.js'
], function(Actions){

	const {TAG_CHANGE_TAB, TAG_RECEIVE_CATE, POP_DEL_CATE_MODAL, RECEIVE_AUTO_DATA, RECEIVE_AUTO_TOTAL, CHANGE_AUTO_PAGE, CHANGE_CATE_PAGE, RECEIVE_CATE_TOTAL, MODIFY_AUTO, TOOGLE_AUTO_EDIT_BOX, OPEN_AUTO_EDIT_BOX, CREATE_KEY_WORD, TOGGLE_CATE_EDIT_BOX, OPEN_CATE_EDIT_BOX, MODIFY_CATE, CREATE_CATE, OPEN_AUTO_DEL_MODAL, CLOSE_AUTO_DEL_MODAL, DEL_AUTO, OPEN_CATE_DEL_MODAL, DEL_CATE, CLOSE_CATE_DEL_MODAL, CHANGE_SEARCH_STATE, SEARCH_INPUT, AUTO_MODAL_ERR, CATE_MODAL_ERR} = Actions;

	function cate_del_modal(state = {
		opened: false,
		cate_id: ''
	}, action){
		switch (action.type){
			case POP_DEL_CATE_MODAL:
				return {
					opened: true,
					cate_id: action.id
				}
			default:
				return state
		}
	}

	function cateList(state = {}, action){
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
		}
	}

	function cateModalErr(state = null, action){
		switch (action.type){
			case CATE_MODAL_ERR:
				return action.txt
			case TOGGLE_CATE_EDIT_BOX:
				return null
			default:
				return state
		}
	}

	function cateCurPage(state = 1, action){
		switch (action.type){
			case CHANGE_CATE_PAGE:
				return action.page;
			default:
				return state;
		}
	}

	function cateTotal(state = 0, action){
		switch (action.type){
			case RECEIVE_CATE_TOTAL:
				return action.total;
			default:
				return state;
		}
	}

	function cateById(state = {}, action){
		switch (action.type){
			case TAG_RECEIVE_CATE:
				return action.data.reduce((obj, item) => {
					obj[item.id] = item;
					return obj;
				}, {});
			case MODIFY_CATE:
				var cate = state[action.id];
				cate = Object.assign({}, cate, action.modify);
				return Object.assign({}, state, {
					[action.id]: cate
				})
			case CREATE_CATE:
				return Object.assign({}, state, {
					[action.cate.id]: action.cate
				});
			case DEL_CATE:
				var cate = Object.assign({}, state);
				delete cate[action.id];
				return cate;
			default:
				return state
		}
	}

	function cateLastUpdate(state = 0, action){
		switch (action.type){
			case TAG_RECEIVE_CATE:
				return Date.now();
			default:
				return state;
		}
	}

	function cateEditBoxShow(state = false, action){
		switch (action.type){
			case TOGGLE_CATE_EDIT_BOX:
				return action.toggle;
			case TAG_CHANGE_TAB:
				return action.name != 'cate'
			default:
				return state
		}
	}

	function cateEditBoxDataId(state = null, action){
		switch (action.type){
			case OPEN_CATE_EDIT_BOX:
				return action.id
			default:
				return state
		}
	}

	function cateDelId(state = null, action){
		switch (action.type){
			case OPEN_CATE_DEL_MODAL:
				return action.id;
			default:
				return state
		}
	}

	function cateDelShow(state = false, action){
		switch (action.type){
			case OPEN_CATE_DEL_MODAL:
				return true;
			case DEL_CATE:
				return false;
			case CLOSE_CATE_DEL_MODAL:
				return false;
			default:
				return state
		}
	}

	function isSearching(state = false, action){
		switch(action.type){
			case CHANGE_SEARCH_STATE:
				return action.status
			default:
				return state
		}
	}

	function searchTxt(state = null, action){
		switch(action.type){
			case SEARCH_INPUT:
				return action.txt;
			default:
				return state;
		}
	}

	function autoModalErr(state = null, action){
		switch(action.type){
			case AUTO_MODAL_ERR:
				return action.txt;
			case TOOGLE_AUTO_EDIT_BOX:
				return null
			default:
				return state;
		}
	}

	function autoList(state = {}, action){
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
		}
	}

	function autoCurPage(state = 1, action){
		switch (action.type){
			case CHANGE_AUTO_PAGE:
				return action.page
			default:
				return state;
		}
	}

	function autoTotal(state = 0, action){
		switch (action.type){
			case RECEIVE_AUTO_TOTAL:
				return action.total;
			default:
				return state
		}
	}

	function autoById(state = {}, action){
		switch (action.type){
			case RECEIVE_AUTO_DATA:
				return action.data.reduce((obj, item) => {
					obj[item.id] = item;
					return obj;
				}, {})
			case MODIFY_AUTO:
				var auto = state[action.id];
				if(auto){
					auto = Object.assign({}, auto, action.modify);
					return Object.assign({}, state, {
						[action.id]: auto
					})
				} else {
					return state
				}
			case CREATE_KEY_WORD:
				return Object.assign({}, state, {
					[action.keyword.id]: action.keyword
				});
			case DEL_AUTO:
				state = Object.assign({}, state);
				delete state[action.id];
				return state;
			default:
				return state;
		}
	}

	function autoLastUpdate(state = 0, action){
		switch (action.type){
			case RECEIVE_AUTO_DATA:
				return Date.now();
			default:
				return state;
		}
	}

	function autoEditBoxShow(state = false, action){
		switch (action.type){
			case TOOGLE_AUTO_EDIT_BOX:
				return action.toogle;
			case TAG_CHANGE_TAB:
				return action.name != 'auto';
			default:
				return state;
		}
	}

	function autoEditBoxDataId(state = null, action){
		switch (action.type){
			case OPEN_AUTO_EDIT_BOX:
				return action.id
			default:
				return state
		}
	}

	function autoDelModalShow(state = false, action){
		switch (action.type){
			case OPEN_AUTO_DEL_MODAL:
				return true;
			case CLOSE_AUTO_DEL_MODAL:
				return false;
			default:
				return state
		}
	}

	function autoDelId(state = null, action){
		switch (action.type){
			case OPEN_AUTO_DEL_MODAL:
				return action.id
			case CLOSE_AUTO_DEL_MODAL:
				return null
			default:
				return state
		}
	}

	function tab(state = 'auto', action){
		switch (action.type){
			case TAG_CHANGE_TAB:
				return action.name
			default:
				return state;
		}
	}

	function manager_tag(state = {}, action){
		return {
			tab: tab(state.tab, action),
			autoList: autoList(state.autoList, action),
			cateList: cateList(state.cateList, action)
		}
	}

	return {
		manager_tag
	}
})