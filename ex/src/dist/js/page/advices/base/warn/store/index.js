'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/articles/actions.js', paths.ex.page + '/advices/base/articles/filters.js', paths.ex.page + '/advices/base/articles/while.js', paths.ex.page + '/advices/base/articles/order.js', paths.ex.page + '/advices/base/articles/article-list.js', paths.ex.page + '/advices/base/articles/search.js', paths.ex.page + '/advices/base/articles/cur-filter.js', paths.ex.page + '/advices/base/articles/time-filter.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/loader.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, R, Actions, Filters, While, Order, ArtList, Search, CurFilter, Timefilter, Modal, Loader) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var push = _mods$ReduxRouterPack.push;
	var replace = _mods$ReduxRouterPack.replace;

	var _Actions = Actions('articles_warn');

	var fetchData = _Actions.fetchData;
	var setFilterMutiKey = _Actions.setFilterMutiKey;
	var setFilterMoreKey = _Actions.setFilterMoreKey;
	var addFiltersSelected = _Actions.addFiltersSelected;
	var deleteFiltersSelected = _Actions.deleteFiltersSelected;
	var clearFiltersSelected = _Actions.clearFiltersSelected;
	var chooseFilters = _Actions.chooseFilters;
	var deleteSelectedTags = _Actions.deleteSelectedTags;
	var modifyQueryParams = _Actions.modifyQueryParams;
	var fetchReportSelectData = _Actions.fetchReportSelectData;
	var fetchEventSelectData = _Actions.fetchEventSelectData;
	var jumpPage = _Actions.jumpPage;
	var modifyWhile = _Actions.modifyWhile;
	var _modifyEmotion = _Actions.modifyEmotion;
	var _addWarn = _Actions.addWarn;
	var _ignoreWarn = _Actions.ignoreWarn;
	var _addReport = _Actions.addReport;
	var _removeReport = _Actions.removeReport;
	var _addEvent = _Actions.addEvent;
	var _removeEvent = _Actions.removeEvent;
	var setQueryParams = _Actions.setQueryParams;
	var updateQueryParams = _Actions.updateQueryParams;
	var dependModalTog = _Actions.dependModalTog;
	var putDepend = _Actions.putDepend;
	var setDependUuid = _Actions.setDependUuid;


	var all = ['app', 'wd', 'date', 'emotion', 'level', 'production', 'medium', 'warn', 'product', 'platform', 'med', 'inc', 'cat'];
	var notall = ['beg', 'sort'];
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

	var Articles = React.createClass({
		displayName: 'Articles',
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
		componentDidMount: function componentDidMount() {
			$('.frame-body-container').addClass('fix');

			var dispatch = this.props.dispatch;

			dispatch(fetchData());
			dispatch(fetchReportSelectData());
			dispatch(fetchEventSelectData());
		},
		componentDidUpdate: function componentDidUpdate(prev) {
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
		componentWillUnmount: function componentWillUnmount() {
			$('.frame-body-container').removeClass('fix');
		},
		render: function render() {
			var _props2 = this.props;
			var dispatch = _props2.dispatch;
			var filters = _props2.filters;
			var filters_selected = _props2.filters_selected;
			var queryParams = _props2.queryParams;
			var paramsMirror = _props2.paramsMirror;
			var selected_tags = _props2.selected_tags;
			var defaultParams = _props2.defaultParams;
			var articles = _props2.articles;
			var reportSelectData = _props2.reportSelectData;
			var eventSelectData = _props2.eventSelectData;
			var articlesCount = _props2.articlesCount;
			var location = _props2.location;
			var dependModalShow = _props2.dependModalShow;
			var loading = _props2.loading;

			var sync = function sync(key, value, opt) {
				opt = opt || {};
				var q = $.extend({}, queryParams, _defineProperty({}, key, value), opt);
				dispatch(push($.extend(true, {}, location, { 'query': q })));
			};
			var syncPage = function syncPage(page) {
				page = page - 1;
				sync('beg', page * defaultParams.m);
			};
			return React.createElement(
				'div',
				{ className: 'advices-base2' },
				React.createElement(
					'section',
					{ className: 'main-part' },
					React.createElement(Search, {
						queryParams: queryParams,
						toggle: function toggle(key, value, opt) {
							return sync(key, value, opt);
						},
						search: function search(value) {
							return sync('wd', value, { 'beg': 0 });
						},
						onInput: function onInput(value) {
							return dispatch(modifyQueryParams('wd', value));
						} }),
					React.createElement(
						'section',
						{ className: 'list-part' },
						React.createElement(Timefilter, {
							toggleClick: function toggleClick(key, value) {
								return sync(key, value, { beg: 0 });
							},
							queryParams: queryParams,
							defaultParams: defaultParams }),
						React.createElement(ArtList, {
							queryParams: queryParams,
							data: articles,
							reportSelectData: reportSelectData,
							eventSelectData: eventSelectData,
							modifyEmotion: function modifyEmotion(uuid, emotion) {
								return dispatch(_modifyEmotion(uuid, emotion));
							},
							addWarn: function addWarn(uuid) {
								return dispatch(_addWarn(uuid));
							},
							ignoreWarn: function ignoreWarn(uuid) {
								return dispatch(_ignoreWarn(uuid));
							},
							addReport: function addReport(uuid, report) {
								return dispatch(_addReport(uuid, report));
							},
							removeReport: function removeReport(uuid, reportId) {
								return dispatch(_removeReport(uuid, reportId));
							},
							addEvent: function addEvent(uuid, event) {
								return dispatch(_addEvent(uuid, event));
							},
							removeEvent: function removeEvent(uuid, eventId) {
								return dispatch(_removeEvent(uuid, eventId));
							},
							putDepend: function putDepend(uuid) {
								$('#tipModal').modal('show');dispatch(dependModalTog(true, uuid));
							} }),
						React.createElement(
							'div',
							{ className: 'tc pagin-part' },
							articlesCount > queryParams.m ? React.createElement(Pagination, { current: Math.floor(+queryParams.beg / +queryParams.m) + 1, total: articlesCount > 99 * +queryParams.m ? 99 * +queryParams.m : articlesCount, pageSize: queryParams.m, className: "v2 ib vm mb5", onChange: function onChange(page) {
									return syncPage(page);
								} }) : null,
							articlesCount > 0 ? React.createElement(
								'span',
								{ className: 'ib vm txt' },
								'相关文章总数：' + articlesCount + '篇'
							) : null
						)
					)
				),
				React.createElement(
					'section',
					{ className: 'filter-part' },
					React.createElement(
						'div',
						{ className: 'head' },
						React.createElement(CurFilter, { defaultParams: defaultParams, tags: selected_tags, deleteClick: function deleteClick(key, value) {
								return sync(key, value);
							}, clearAll: function clearAll(a1, a2, res) {
								return sync(a1, a2, res);
							} })
					),
					React.createElement(
						'div',
						{ className: 'bd' },
						React.createElement(Filters, {
							data: filters.data,
							filtersSelected: filters_selected,
							queryParams: queryParams,
							defaultParams: defaultParams,
							paramsMirror: paramsMirror,
							mutiKey: filters.mutiKey,
							moreKey: filters.moreKey,
							mutiClick: function mutiClick(key) {
								dispatch(setFilterMutiKey(key));
							},
							moreClick: function moreClick(key) {
								return dispatch(setFilterMoreKey(key));
							},
							addSelected: function addSelected(value) {
								return dispatch(addFiltersSelected(value));
							},
							deleteSelected: function deleteSelected(value) {
								return dispatch(deleteFiltersSelected(value));
							},
							clearSelected: function clearSelected(value) {
								return dispatch(clearFiltersSelected());
							},
							chooseFilters: function chooseFilters(key, value) {
								return sync(key, value, { beg: 0 });
							}
						})
					)
				),
				React.createElement(
					Modal,
					{ id: 'tipModal', title: '温馨提示', modalSm: true, confirm: function confirm() {
							$('#tipModal').modal('hide');dispatch(putDepend());
						} },
					React.createElement(
						'div',
						{ className: 'tc' },
						React.createElement(
							'p',
							null,
							'您确定删除此文章吗？'
						)
					)
				),
				React.createElement(Loader, { show: loading })
			);
		}
	});

	function toProps(state) {
		state = state['articles_warn'];
		return {
			filters: state.filters,
			filters_selected: state.filters_selected,
			queryParams: state.queryParams,
			paramsMirror: state.paramsMirror,
			selected_tags: state.selected_tags,
			defaultParams: state.defaultParams,
			articles: Object.keys(state.articles).map(function (key) {
				return state.articles[key];
			}).sort(function (a, b) {
				return a['__i'] - b['__i'];
			}),
			reportSelectData: state.reportSelectData,
			eventSelectData: state.eventSelectData,
			articlesCount: state.articlesCount,
			dependModalShow: state.dependModalShow,
			loading: state.loading
		};
	}

	return connect(toProps)(Articles);
});