'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;
	var Cal = mods.Cal;

	var Drop = React.createClass({
		displayName: 'Drop',
		getInitialState: function getInitialState() {
			return { open: false };
		},
		clickHandler: function clickHandler() {
			var _this = this;

			if (!this.state.open) {
				this.setState({ open: true });
				$(document).one('click', function () {
					_this.setState({ open: false });
				});
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: "while-item" + (this.state.open ? ' active' : ''), ref: 'wrap' },
				React.createElement(
					'div',
					{ className: 'holder', onClick: this.clickHandler },
					React.createElement(
						'span',
						null,
						this.props.holderTxt || ''
					)
				),
				React.createElement(
					'ul',
					{ className: 'dropdown-list' },
					this.props.children
				)
			);
		}
	});

	var Dt = React.createClass({
		displayName: 'Dt',
		getInitialState: function getInitialState() {
			return { begin: null, end: null };
		},
		componentDidUpdate: function componentDidUpdate(o) {
			var queryParams = this.props.queryParams;

			var res0 = this.parseDate(o.queryParams),
			    res = this.parseDate(queryParams);
			if (res.begin != res0.begin || res.end != res0.end) {
				this.setState(res);
			}
		},
		parseDate: function parseDate(queryParams) {
			var date = queryParams.date,
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
		setDate: function setDate(val, key) {
			var _this2 = this;

			this.setState(_defineProperty({}, key, val), function () {
				if (_this2.state.begin != null && _this2.state.end != null) _this2.ok(_this2.state.begin + ',' + _this2.state.end);
			});
		},
		disabledDate: function disabledDate(val, key) {
			var compare,
			    val = new Date(val).getTime();
			if (key == 'begin') {
				compare = this.state.end;
			} else if (key == 'end') {
				compare = this.state.begin;
			}
			if (compare) {
				compare = new Date(compare).getTime();
				return key == 'begin' ? val > compare : val < compare;
			} else {
				return false;
			}
		},
		ok: function ok(value) {
			if (this.props.ok) this.props.ok(value);
		},
		cancel: function cancel() {
			if (this.props.ok) {
				this.setState({ begin: null, end: null });
				this.props.ok(this.props.defaultParams.date);
			}
		},
		render: function render() {
			var _this3 = this;

			var date = this.state;
			return React.createElement(
				'div',
				{ className: 'while-item time' },
				React.createElement(Cal, { name: 'begin', value: this.state.begin, format: 'yyyy-MM-dd', onChange: function onChange(value) {
						return _this3.setDate(value, 'begin');
					}, disabledDate: function disabledDate(val) {
						return _this3.disabledDate(val, 'begin');
					}, wrapClassName: 'v2' }),
				React.createElement(
					'span',
					{ className: 'pl10 pr10' },
					'-'
				),
				React.createElement(Cal, { name: 'end', value: this.state.end, format: 'yyyy-MM-dd', onChange: function onChange(value) {
						return _this3.setDate(value, 'end');
					}, disabledDate: function disabledDate(val) {
						return _this3.disabledDate(val, 'end');
					}, wrapClassName: 'v2' }),
				date.begin != null || date.end != null ? React.createElement(
					'span',
					{ className: 'button', onClick: this.cancel },
					'取消'
				) : null
			);
		}
	});

	var While = React.createClass({
		displayName: 'While',
		toggleClick: function toggleClick(key, value) {
			if (this.props.toggleClick) {
				this.props.toggleClick(key, value);
			}
		},
		renderEmotion: function renderEmotion() {
			var _this4 = this;

			var _props = this.props;
			var queryParams = _props.queryParams;
			var defaultParams = _props.defaultParams;

			var node,
			    emotion = queryParams['emotion'],
			    defaultEmotion = defaultParams['emotion'];
			if (emotion == defaultEmotion || emotion == 'positive' || emotion == 'negative' || emotion == 'neutral') {
				var txt = '';
				switch (emotion) {
					case 'positive':
						txt = ': 正面';
						break;
					case 'negative':
						txt = ': 负面';
						break;
					case 'neutral':
						txt = ': 中立';
						break;
					default:
						break;
				}
				node = React.createElement(
					Drop,
					{ holderTxt: "情感筛选" + txt },
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return emotion != 'positive' && _this4.toggleClick('emotion', 'positive');
							} },
						'正面'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return emotion != 'neutral' && _this4.toggleClick('emotion', 'neutral');
							} },
						'中立'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return emotion != 'negative' && _this4.toggleClick('emotion', 'negative');
							} },
						'负面'
					),
					emotion == defaultEmotion ? null : React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return emotion != defaultEmotion && _this4.toggleClick('emotion', defaultEmotion);
								} },
							'取消'
						)
					)
				);
			}

			return node;
		},
		renderWarn: function renderWarn() {
			var _this5 = this;

			var _props2 = this.props;
			var queryParams = _props2.queryParams;
			var defaultParams = _props2.defaultParams;

			var node,
			    warn = queryParams['warn'],
			    defaultWarn = defaultParams['warn'];
			if ([defaultWarn, 'auto', 'manual', 'no'].indexOf(warn) != -1) {
				var txt = '';
				switch (warn) {
					case 'auto':
						txt = ': 自动预警';
						break;
					case 'manual':
						txt = ": 手动预警";
						break;
					case 'no':
						txt = this.props.type == 'warn' ? "" : ": 非预警";
					default:
						break;
				}
				node = React.createElement(
					Drop,
					{ holderTxt: "预警状态" + txt },
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return warn != 'auto' && _this5.toggleClick('warn', 'auto');
							} },
						'自动预警'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return warn != 'manual' && _this5.toggleClick('warn', 'manual');
							} },
						'手动预警'
					),
					this.props.type == 'warn' ? null : React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return warn != 'no' && _this5.toggleClick('warn', 'no');
							} },
						'非预警'
					),
					warn == defaultWarn ? null : React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return warn != defaultWarn && _this5.toggleClick('warn', defaultWarn);
								} },
							'取消'
						)
					)
				);
			}
			return node;
		},
		renderLevel: function renderLevel() {
			var _this6 = this;

			var _props3 = this.props;
			var queryParams = _props3.queryParams;
			var defaultParams = _props3.defaultParams;

			var node,
			    level = queryParams['level'],
			    defaultLevel = defaultParams['level'];
			if ([defaultLevel, 'a', 'b', 'c', 'd'].indexOf(level) != -1) {
				var txt = '';
				switch (level) {
					case 'a':
						txt = ': 甲级';
						break;
					case 'b':
						txt = ': 乙级';
						break;
					case 'c':
						txt = ': 丙级';
						break;
					case 'd':
						txt = ': 丁级';
						break;
					default:
						break;
				}
				node = React.createElement(
					Drop,
					{ holderTxt: "媒体等级" + txt },
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return level != 'a' && _this6.toggleClick('level', 'a');
							} },
						'甲级'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return level != 'b' && _this6.toggleClick('level', 'b');
							} },
						'乙级'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return level != 'c' && _this6.toggleClick('level', 'c');
							} },
						'丙级'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return level != 'd' && _this6.toggleClick('level', 'd');
							} },
						'丁级'
					),
					level == defaultLevel ? null : React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return level != defaultLevel && _this6.toggleClick('level', defaultLevel);
								} },
							'取消'
						)
					)
				);
			}
			return node;
		},
		renderProduction: function renderProduction() {
			var _this7 = this;

			var _props4 = this.props;
			var queryParams = _props4.queryParams;
			var defaultParams = _props4.defaultParams;

			var node,
			    production = queryParams['production'],
			    defaultProduction = defaultParams['production'];
			if ([defaultProduction, 'ogc', 'ugc'].indexOf(production) != -1) {
				var txt = '';
				switch (production) {
					case 'ogc':
						txt = ': 职业媒体';
						break;
					case 'ugc':
						txt = ': 自媒体';
						break;
					default:
						break;
				}
				node = React.createElement(
					Drop,
					{ holderTxt: "生产方式" + txt },
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return production != 'ogc' && _this7.toggleClick('production', 'ogc');
							} },
						'职业媒体'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return production != 'ugc' && _this7.toggleClick('production', 'ugc');
							} },
						'自媒体'
					),
					production == defaultProduction ? null : React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return production != defaultProduction && _this7.toggleClick('production', defaultProduction);
								} },
							'取消'
						)
					)
				);
			}

			return node;
		},
		renderMedium: function renderMedium() {
			var _this8 = this;

			var _props5 = this.props;
			var queryParams = _props5.queryParams;
			var defaultParams = _props5.defaultParams;

			var node,
			    medium = queryParams['medium'],
			    defaultMedium = defaultParams['medium'];
			if ([defaultMedium, '纸媒', '广播', '电视', '网站', '移动app'].indexOf(medium) != -1) {
				var txt = '';
				switch (medium) {
					case '纸媒':
						txt = ': 纸媒';
						break;
					case '广播':
						txt = ': 广播';
						break;
					case '电视':
						txt = ': 电视';
						break;
					case '网站':
						txt = ': 网站';
						break;
					case '移动app':
						txt = ': 移动app';
						break;
					default:
						break;
				}
				node = React.createElement(
					Drop,
					{ holderTxt: "媒体分类" + txt },
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return medium != '纸媒' && _this8.toggleClick('medium', '纸媒');
							} },
						'纸媒'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return medium != '广播' && _this8.toggleClick('medium', '广播');
							} },
						'广播'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return medium != '电视' && _this8.toggleClick('medium', '电视');
							} },
						'电视'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return medium != '网站' && _this8.toggleClick('medium', '网站');
							} },
						'网站'
					),
					React.createElement(
						'li',
						{ className: 'dropdown-item', onClick: function onClick() {
								return medium != '移动app' && _this8.toggleClick('medium', '移动app');
							} },
						'移动app'
					),
					medium == defaultMedium ? null : React.createElement(
						'li',
						{ className: 'dropdown-item' },
						React.createElement(
							'span',
							{ className: 'button', onClick: function onClick() {
									return medium != defaultMedium && _this8.toggleClick('medium', defaultMedium);
								} },
							'取消'
						)
					)
				);
			}

			return node;
		},
		renderDate: function renderDate() {
			var _this9 = this;

			var _props6 = this.props;
			var queryParams = _props6.queryParams;
			var defaultParams = _props6.defaultParams;

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
				Drop,
				{ holderTxt: "时间选择" + txt },
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'today' && _this9.toggleClick('date', 'today');
						} },
					'今天'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'yesterday' && _this9.toggleClick('date', 'yesterday');
						} },
					'昨天'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'last_week' && _this9.toggleClick('date', 'last_week');
						} },
					'近一周'
				),
				React.createElement(
					'li',
					{ className: 'dropdown-item', onClick: function onClick() {
							return date != 'last_month' && _this9.toggleClick('date', 'last_month');
						} },
					'近一个月'
				),
				['today', 'yesterday', 'last_week', 'last_month'].indexOf(date) == -1 ? null : React.createElement(
					'li',
					{ className: 'dropdown-item' },
					React.createElement(
						'span',
						{ className: 'button', onClick: function onClick() {
								return date != 'all' && _this9.toggleClick('date', 'all');
							} },
						'取消'
					)
				)
			);

			return node;
		},
		render: function render() {
			var _this10 = this;

			var _props7 = this.props;
			var queryParams = _props7.queryParams;
			var defaultParams = _props7.defaultParams;

			return React.createElement(
				'div',
				{ className: 'while-box' },
				this.renderEmotion(),
				this.renderWarn(),
				this.renderLevel(),
				this.renderProduction(),
				this.renderMedium(),
				this.renderDate(),
				React.createElement(Dt, { queryParams: queryParams, defaultParams: defaultParams, ok: function ok(value) {
						return _this10.toggleClick('date', value);
					} })
			);
		}
	});

	return While;
});