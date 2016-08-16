'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/loader.js', paths.ex.page + '/advices/base/news/audit/link.js', paths.ex.page + '/advices/base/news/audit/actions.js', paths.ex.page + '/advices/base/report/select.js', paths.ex.page + '/advices/base/articles/art-list-item.js'], function (mods, Rest, Modal, Loader, L, Actions, Select, Item) {
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var connect = mods.ReactReduxPack.connect;

	var _Actions = Actions('audit');

	var fetchData = _Actions.fetchData;
	var _modifyEmotion = _Actions.modifyEmotion;
	var setDependUuid = _Actions.setDependUuid;
	var putDepend = _Actions.putDepend;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var push = _mods$ReduxRouterPack.push;
	var replace = _mods$ReduxRouterPack.replace;

	var RangeCal = mods.RangeCal;

	var Audit = React.createClass({
		displayName: 'Audit',
		componentDidMount: function componentDidMount() {
			var dispatch = this.props.dispatch;

			dispatch(fetchData());
		},
		renderList: function renderList() {
			var _props = this.props;
			var articles = _props.articles;
			var queryParams = _props.queryParams;
			var dispatch = _props.dispatch;

			var node;
			node = articles.length > 0 ? React.createElement(
				'ul',
				{ className: 'list-part' },
				articles.map(function (data, idx) {
					return React.createElement(Item, { auditMode: true, modifyEmotion: function modifyEmotion(emot) {
							return dispatch(_modifyEmotion(data.uuid, emot));
						}, data: data, queryParams: queryParams, putDepend: function putDepend(uuid) {
							$('#tipModal').modal('show');dispatch(setDependUuid(uuid));
						} });
				})
			) : React.createElement(
				'div',
				{ className: 'list-blank-holder' },
				'暂无数据'
			);

			return node;
		},
		parseDate: function parseDate() {
			var date = this.props.queryParams.date,
			    begin,
			    end,
			    res,
			    reg = /^\d{4}\-\d{2}\-\d{2}$/;
			date = date.split(',');
			begin = $.trim(date[0]);
			end = date[1] ? $.trim(date[1]) : '';
			res = {
				begin: reg.test(begin) ? begin : null,
				end: reg.test(end) ? end : null
			};
			return res;
		},
		renderCal: function renderCal() {
			var _this = this;

			var _props2 = this.props;
			var queryParams = _props2.queryParams;
			var defaultParams = _props2.defaultParams;
			var dispatch = _props2.dispatch;

			var date = this.parseDate(),
			    handler = function handler(val) {
				if (val[0] != '' && val[1] != '') {
					var nowDate = queryParams.date.split(',');
					if (val[0] != nowDate[0] || val[1] != nowDate[1]) _this.sync('date', val.join(','));
				} else {
					if (queryParams.date != defaultParams.date) _this.sync('date', defaultParams['date']);
				}
			};
			var node = React.createElement(RangeCal, { className: 'c-time-range', placeholder: '选择日期区间', format: 'yyyy-MM-dd', value: [date.begin, date.end], onChange: handler });

			return node;
		},
		renderDate: function renderDate() {
			var _this2 = this;

			var _props3 = this.props;
			var queryParams = _props3.queryParams;
			var defaultParams = _props3.defaultParams;
			var dispatch = _props3.dispatch;

			var date = { 'yesterday': '昨天', 'last_week': '近一周', 'last_month': '近一个月' },
			    dat = queryParams['date'],
			    txt = date[dat] ? '：' + date[dat] : '';
			var node = React.createElement(
				'div',
				{ className: 'time-range' },
				React.createElement(
					Select,
					{ className: 'dropwrap', holder: React.createElement(
							'span',
							{ className: 'holder' },
							'日结时间' + txt
						) },
					Object.keys(date).map(function (k, idx) {
						return React.createElement(
							'li',
							{ className: 'dropdown-item', key: idx, onClick: function onClick() {
									return _this2.sync('date', k, { beg: 0 });
								} },
							date[k]
						);
					}),
					date[dat] ? React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return _this2.sync('date', defaultParams['date'], { beg: 0 });
								} },
							'取消'
						)
					) : null
				),
				this.renderCal()
			);

			return node;
		},
		sync: function sync(key, value, opt) {
			var _props4 = this.props;
			var queryParams = _props4.queryParams;
			var location = _props4.location;
			var dispatch = _props4.dispatch;

			opt = opt || {};
			var q = $.extend({}, queryParams, _defineProperty({}, key, value), opt);
			dispatch(push($.extend(true, {}, location, { 'query': q })));
		},
		syncPage: function syncPage(page) {
			var defaultParams = this.props.defaultParams;

			page = page - 1;
			this.sync('beg', page * defaultParams.m);
		},
		render: function render() {
			var _this3 = this;

			var _props5 = this.props;
			var articles = _props5.articles;
			var articlesCount = _props5.articlesCount;
			var queryParams = _props5.queryParams;
			var location = _props5.location;
			var defaultParams = _props5.defaultParams;
			var dispatch = _props5.dispatch;
			var loading = _props5.loading;

			return React.createElement(
				'div',
				{ className: 'advices-base-audit' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title' },
								'人工审计'
							),
							this.renderDate()
						),
						React.createElement(
							'div',
							{ className: 'tab-part' },
							React.createElement(
								'div',
								{ className: 'c-tab' },
								React.createElement(
									'ul',
									null,
									React.createElement(
										'li',
										{ onClick: function onClick() {
												return _this3.sync('audit', 'false', { beg: 0 });
											}, className: queryParams.audit == 'false' ? 'active' : '' },
										'待研判'
									),
									React.createElement(
										'li',
										{ onClick: function onClick() {
												return _this3.sync('audit', 'true', { beg: 0 });
											}, className: queryParams.audit == 'true' ? 'active' : '' },
										'已研判'
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'txt' },
								queryParams.audit == 'true' ? React.createElement(
									'span',
									null,
									'已研判：' + articlesCount + '篇'
								) : React.createElement(
									'span',
									null,
									'待研判：' + articlesCount + '篇'
								)
							)
						),
						this.renderList(),
						React.createElement(
							'div',
							{ className: 'tc pagin-part' },
							articlesCount > queryParams.m ? React.createElement(Pagination, { current: Math.floor(+queryParams.beg / +queryParams.m) + 1, total: articlesCount > 99 * +queryParams.m ? 99 * +queryParams.m : articlesCount, pageSize: queryParams.m, className: "v2 ib vm mb5", onChange: function onChange(page) {
									return _this3.syncPage(page);
								} }) : null
						)
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
				React.createElement(Loader, { fix: true, show: loading })
			);
		}
	});

	function toProps(state) {
		state = state['audit'];
		return {
			queryParams: state.queryParams,
			paramsMirror: state.paramsMirror,
			defaultParams: state.defaultParams,
			articles: Object.keys(state.articles).map(function (key) {
				return state.articles[key];
			}).sort(function (a, b) {
				return a['__i'] - b['__i'];
			}),
			articlesCount: state.articlesCount,
			loading: state.loading
		};
	}

	return connect(toProps)(L()(Audit));
});