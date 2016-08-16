'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/loader.js', paths.ex.page + '/advices/base/news/audit/actions.js'], function (mods, Rest, Modal, Loader, Actions) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var push = _mods$ReduxRouterPack.push;
	var replace = _mods$ReduxRouterPack.replace;

	var _Actions = Actions('audit');

	var fetchData = _Actions.fetchData;
	var setQueryParams = _Actions.setQueryParams;


	var all = ['date', 'audit'];
	var notall = ['beg'];
	var parse = ['m', 'uniq', 'result', 'ct'];
	var silence = [];

	function parseParams(location, params) {
		var res = {};
		Object.keys(location).forEach(function (key) {
			if (key in params && parse.indexOf(key) == -1) {
				res[key] = location[key];
			}
		});
		return res;
	}

	function isDiff(obj1, obj2) {
		var res = false;
		Object.keys(obj1).forEach(function (key) {
			if (obj1[key] != obj2[key]) res = true;
		});
		return res;
	}

	function findUpdateKeys(n, o) {
		var arr_all = [],
		    arr_notall = [],
		    arr_silence = [];
		for (var key in n) {
			if (key in o) {
				if (n[key] != o[key]) {
					if (all.indexOf(key) != -1) {
						arr_all.push(key);
					} else if (notall.indexOf(key) != -1) {
						arr_notall.push(key);
					} else if (silence.indexOf(key) != -1) {
						arr_silence.push(key);
					}
				}
			}
		}
		return {
			all: arr_all,
			notall: arr_notall,
			silence: arr_silence
		};
	}

	var L = function L(config) {
		return function (Tar) {
			return React.createClass({
				componentWillMount: function componentWillMount() {
					var _props = this.props;
					var location = _props.location;
					var defaultParams = _props.defaultParams;
					var dispatch = _props.dispatch;

					var query = parseParams(location.query, defaultParams);

					query = $.extend({}, defaultParams, query);
					var l = $.extend({}, location, { query: query });

					// dispatch(setLocation(l));
					dispatch(replace(l));
					dispatch(setQueryParams(query));
				},
				componentDidUpdate: function componentDidUpdate() {
					var dispatch = this.props.dispatch,
					    curKeys = this.props.queryParams,
					    curLocation = this.props.location.query,
					    newKeys = {},
					    pass = false;

					newKeys = parseParams(curLocation, curKeys);
					pass = isDiff(newKeys, curKeys);

					if (!$.isEmptyObject(newKeys) && pass) {
						newKeys = $.extend({}, curKeys, newKeys);
						var update = findUpdateKeys(newKeys, curKeys);
						if (update.all.length > 0) {
							dispatch(fetchData(newKeys));
						} else if (update.notall.length) {
							dispatch(fetchData(newKeys, false));
						} else if (update.silence.length) {
							dispatch(updateQueryParams(newKeys));
						}
					}
				},
				render: function render() {
					return React.createElement(Tar, this.props);
				}
			});
		};
	};

	return L;
});