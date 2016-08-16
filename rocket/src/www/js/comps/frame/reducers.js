define([
	'mods',
	paths.rcn.comps + '/frame/actions.js'
], function(mods, Actions){
	var {combineReducers} = mods.ReduxPack;
	const {
		FR_NAV_OPEN,
		FR_RECEIVE_RENDER_DATA,
		FR_SET_COMPANY_NAME,
		FR_SET_USER_NAME,
		FR_NAV_UPDATE,
		FR_NAV_UPDATED,
		FR_USER
	} = Actions;

	function byName(state = {}, action){
		switch (action.type){
			case FR_RECEIVE_RENDER_DATA:
				return action.data.reduce((obj, item) => {
					obj[item.name] = item;
					return obj
				}, {})
			default:
				return state
		}
	}
	function opened(state = '', action){
		switch (action.type){
			case FR_NAV_OPEN:
				return action.name
			default:
				return state;
		}
	}

	function fr_nav(state = {}, action){
		return {
			byName: byName(state.byName, action),
			opened: opened(state.opened, action)
		}
	}

	function fr_user(state = {}, action){
		switch (action.type){
			case FR_USER:
				return action.user
			default:
				return state
		}
	}

	function updateNav(state = false, action){
		switch (action.type){
			case FR_NAV_UPDATE:
				return true
			case FR_NAV_UPDATED:
				return false
			default:
				return state
		}
	}

	return {
		fr_nav,
		fr_user,
		updateNav
	}

})