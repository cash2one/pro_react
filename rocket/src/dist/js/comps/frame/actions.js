'use strict';

define([], function () {
	// 导航
	var FR_NAV_OPEN = 'FR_NAV_OPEN';
	var FR_RECEIVE_RENDER_DATA = 'FR_RECEIVE_RENDER_DATA';
	// 公司
	var FR_SET_COMPANY_NAME = 'FR_SET_COMPANY_NAME';
	// 用户名
	var FR_SET_USER_NAME = 'FR_SET_USER_NAME';
	var FR_NAV_UPDATE = 'FR_NAV_UPDATE';
	var FR_NAV_UPDATED = 'FR_NAV_UPDATED';
	var FR_USER = 'FR_USER';

	// 导航
	function frNavOpen(name) {
		return {
			type: FR_NAV_OPEN,
			name: name
		};
	}

	function frNavReceiveData(data) {
		return {
			type: FR_RECEIVE_RENDER_DATA,
			data: data
		};
	}

	function frNavUpdate() {
		return {
			type: FR_NAV_UPDATE
		};
	}

	function frNavUpdated() {
		return {
			type: FR_NAV_UPDATED
		};
	}

	// 公司
	function frSetCompanyName(name) {
		return {
			type: FR_SET_COMPANY_NAME,
			name: name
		};
	}

	// 用户名
	function frSetUserName(name) {
		return {
			type: FR_SET_USER_NAME,
			name: name
		};
	}

	function frUser(user) {
		return {
			type: FR_USER,
			user: user
		};
	}

	return {
		// 导航
		FR_NAV_OPEN: FR_NAV_OPEN,
		FR_RECEIVE_RENDER_DATA: FR_RECEIVE_RENDER_DATA,
		FR_NAV_UPDATE: FR_NAV_UPDATE,
		FR_NAV_UPDATED: FR_NAV_UPDATED,
		frNavOpen: frNavOpen,
		frNavReceiveData: frNavReceiveData,
		frNavUpdate: frNavUpdate,
		frNavUpdated: frNavUpdated,

		// 公司
		FR_SET_COMPANY_NAME: FR_SET_COMPANY_NAME,
		frSetCompanyName: frSetCompanyName,

		// 用户名
		FR_SET_USER_NAME: FR_SET_USER_NAME,
		frSetUserName: frSetUserName,

		FR_USER: FR_USER,
		frUser: frUser
	};
});