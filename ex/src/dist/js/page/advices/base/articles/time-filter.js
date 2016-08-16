'use strict';

define(['mods', paths.ex.page + '/advices/base/report/select.js'], function (mods, Select) {
	var React = mods.ReactPack.default,
	    RangeCal = mods.RangeCal;
	var TimeFilter = React.createClass({
		displayName: 'TimeFilter',
		toggleClick: function toggleClick(key, value) {
			if (this.props.toggleClick) this.props.toggleClick(key, value);
		},
		renderOrder: function renderOrder() {
			var _this = this;

			var _props = this.props;
			var queryParams = _props.queryParams;
			var defaultParams = _props.defaultParams;

			var node,
			    sort = queryParams['sort'],
			    defaultSort = defaultParams['sort'];
			var txt = '时间排序';
			switch (sort) {
				case 'publish_at_desc':
					txt = '发布时间降序';
					break;
				case 'publish_at_asc':
					txt = '发布时间升序';
					break;
				default:
					break;
			}
			node = React.createElement(
				Select,
				{ className: 'dropwrap', holder: React.createElement(
						'span',
						{ className: 'holder' },
						txt
					) },
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return sort != 'publish_at_desc' && _this.toggleClick('sort', 'publish_at_desc');
						} },
					'发布时间降序'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return sort != 'publish_at_asc' && _this.toggleClick('sort', 'publish_at_asc');
						} },
					'发布时间升序'
				),
				sort == 'publish_at_asc' || sort == 'publish_at_desc' ? React.createElement(
					'li',
					{ className: 'dropdown-item' },
					React.createElement(
						'span',
						{ className: 'button', onClick: function onClick() {
								return _this.toggleClick('sort', '');
							} },
						'取消'
					)
				) : null
			);

			return node;
		},
		renderOrder2: function renderOrder2() {
			var _this2 = this;

			var _props2 = this.props;
			var queryParams = _props2.queryParams;
			var defaultParams = _props2.defaultParams;

			var node,
			    date = queryParams['date'],
			    defaultDate = defaultParams['date'];
			var txt = '';
			switch (date) {
				case 'today':
					txt = ': 今天';
					break;
				case 'yesterday':
					txt = ': 昨天';
					break;
				case 'last_week':
					txt = ': 近一周';
					break;
				case 'last_month':
					txt = ': 近一个月';
					break;
				default:
					break;
			}
			node = React.createElement(
				Select,
				{ className: 'dropwrap', holder: React.createElement(
						'span',
						{ className: 'holder' },
						'时间选择' + txt
					) },
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'today' && _this2.toggleClick('date', 'today');
						} },
					'今天'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'yesterday' && _this2.toggleClick('date', 'yesterday');
						} },
					'昨天'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'last_week' && _this2.toggleClick('date', 'last_week');
						} },
					'近一周'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'last_month' && _this2.toggleClick('date', 'last_month');
						} },
					'近一个月'
				),
				['today', 'yesterday', 'last_week', 'last_month'].indexOf(date) == -1 ? null : React.createElement(
					'li',
					{ className: 'dropdown-item' },
					React.createElement(
						'span',
						{ className: 'button', onClick: function onClick() {
								return date != 'all' && _this2.toggleClick('date', 'all');
							} },
						'取消'
					)
				)
			);

			return node;
		},
		renderCal: function renderCal() {
			var _this3 = this;

			var _props3 = this.props;
			var queryParams = _props3.queryParams;
			var defaultParams = _props3.defaultParams;

			var date = this.parseDate(),
			    handler = function handler(val) {
				if (val[0] != '' && val[1] != '') {
					var nowDate = queryParams.date.split(',');
					if (val[0] != nowDate[0] || val[1] != nowDate[1]) _this3.toggleClick('date', val.join(','));
				} else {
					if (queryParams.date != defaultParams.date) _this3.toggleClick('date', defaultParams['date']);
				}
			};
			var node = React.createElement(RangeCal, { className: 'input', placeholder: '选择日期区间', format: 'yyyy-MM-dd', value: [date.begin, date.end], onChange: handler });

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
		render: function render() {
			return React.createElement(
				'section',
				{ className: 'time-filter-part' },
				React.createElement(
					'div',
					{ className: 'order' },
					this.renderOrder()
				),
				React.createElement(
					'div',
					{ className: 'time-range' },
					this.renderOrder2(),
					React.createElement(
						'div',
						{ className: 'calendar' },
						React.createElement(
							'div',
							{ className: 'wrapper' },
							React.createElement('span', { className: 'iconfont icon-lishijilu' }),
							this.renderCal()
						)
					)
				)
			);
		}
	});

	return TimeFilter;
});