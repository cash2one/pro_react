define([], function(){
	// 导航
	const FR_NAV_OPEN = 'FR_NAV_OPEN';
	const FR_RECEIVE_RENDER_DATA = 'FR_RECEIVE_RENDER_DATA';
	// 公司
	const FR_SET_COMPANY_NAME = 'FR_SET_COMPANY_NAME';
	// 用户名
	const FR_SET_USER_NAME = 'FR_SET_USER_NAME';
	const FR_NAV_UPDATE = 'FR_NAV_UPDATE';
	const FR_NAV_UPDATED = 'FR_NAV_UPDATED';
	const FR_USER = 'FR_USER';

	// 导航
	function frNavOpen(name){
		return {
			type: FR_NAV_OPEN,
			name
		}
	}

	function frNavReceiveData(data){
		return {
			type: FR_RECEIVE_RENDER_DATA,
			data
		}
	}

	function frNavUpdate(){
		return {
			type: FR_NAV_UPDATE
		}
	}

	function frNavUpdated(){
		return {
			type: FR_NAV_UPDATED
		}
	}

	// 公司
	function frSetCompanyName(name){
		return {
			type: FR_SET_COMPANY_NAME,
			name
		}
	}

	// 用户名
	function frSetUserName(name){
		return {
			type: FR_SET_USER_NAME,
			name
		}
	}

	function frUser(user){
		return {
			type: FR_USER,
			user
		}
	}

	return {
		// 导航
		FR_NAV_OPEN,
		FR_RECEIVE_RENDER_DATA,
		FR_NAV_UPDATE,
		FR_NAV_UPDATED,
		frNavOpen,
		frNavReceiveData,
		frNavUpdate,
		frNavUpdated,

		// 公司
		FR_SET_COMPANY_NAME,
		frSetCompanyName,

		// 用户名
		FR_SET_USER_NAME,
		frSetUserName,

		FR_USER,
		frUser
	}
})