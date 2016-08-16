'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

define(['mods', paths.rcn.util + '/rest.js', paths.ex.comps + '/artlist/select.js', paths.rcn.comps + '/modal/index.js', paths.rcn.comps + '/loader.js', paths.ex.util + '/parse.js'], function (mods, Rest, Select, Modal, Load, Parse) {
	var React = mods.ReactPack.default;
	var rest = Rest.ex();

	function parse(list, key) {
		if (list.length == 0) return {};
		return list.reduce(function (obj, item, idx) {
			item.__index = idx;
			obj[item[key]] = item;
			return obj;
		}, {});
	}

	function format(list) {
		return Object.keys(list).map(function (key) {
			return list[key];
		}).sort(function (a, b) {
			return a.__index - b.__index;
		});
	}

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str) {
		str = (str || '').replace(reg, '');
		return str;
	}

	function parseword(str, options) {
		if (!str) return str;
		var reg = [];

		options.forEach(function (opt) {
			var k = opt.keys;
			if (typeof k == 'string') {
				if (k == '') return;
			}
			reg = reg.concat(k);
		});

		reg = reg.map(function (re) {
			return '(' + re + ')';
		}).join('|');

		if (reg.length > 0) {
			reg = new RegExp(reg, 'ig');

			str = str.replace(reg, function (match) {
				var className = [];
				options.forEach(function (opt) {
					var k = opt.keys;
					if (typeof k == 'string') k = [k];
					// if(k.indexOf(match) != -1){
					// 	if(opt.className)
					// 		className.push(opt.className);
					// }
					k.forEach(function (ke) {
						ke = new RegExp(ke, 'ig');
						if (ke.test(match)) {
							if (opt.className) className.push(opt.className);
						}
					});
				});

				return '<em class="' + className.join(' ') + '">' + match + '</em>';
			});
		}

		return str;
	}

	var Art = React.createClass({
		displayName: 'Art',

		getInitialState: function getInitialState() {
			return {
				evList: {},
				rpList: {},
				evSelected: [],
				rpSelected: [],
				art: { emotion: '' },
				dependModalShow: false,
				loadShow: false
			};
		},
		componentWillMount: function componentWillMount() {
			// var art = this.props.location.state.data;
			// if(art){
			// 	this.setState({art: art});
			// 	this.setState({evSelected: art.events || []});
			// 	this.setState({rpSelected: art.reports || []});
			// }
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			var uuid = this.props.location.query.uuid;
			if (uuid != undefined) {
				rest.article.read('detail', { uuid: uuid }).done(function (data) {
					_this.setState({ art: data });
					_this.setState({ evSelected: data.events || [] });
					_this.setState({ rpSelected: data.reports || [] });
				});
				rest.events.read({
					status: 1
				}).done(function (data) {
					_this.setState({ evList: parse(data, 'id') });
				});
				rest.report.read('recent').done(function (data) {
					_this.setState({ rpList: parse(data, 'id') });
				});
			}
		},
		eventSelectHandler: function eventSelectHandler(event) {
			var _this2 = this;

			var selected = this.state.evSelected.slice(),
			    idx;
			for (var i = 0; i < selected.length; i++) {
				if (selected[i].id == event.id) {
					idx = i;
					break;
				}
			}
			if (idx == undefined) {
				selected.push(event);
			} else {
				selected.splice(idx, 1);
			}

			this.setState({ evSelected: selected }, function () {
				_this2.eventConfirmHandler();
			});
		},
		reportSelectHandler: function reportSelectHandler(report) {
			var _this3 = this;

			var selected = this.state.rpSelected.slice(),
			    idx;
			for (var i = 0; i < selected.length; i++) {
				if (selected[i].id == report.id) {
					idx = i;
					break;
				}
			}
			if (idx == undefined) {
				selected.push(report);
			} else {
				selected.splice(idx, 1);
			}

			this.setState({ rpSelected: selected }, function () {
				_this3.reportConfirmHandler();
			});
		},
		eventConfirmHandler: function eventConfirmHandler() {
			var _this4 = this;

			var art = this.state.art;
			var old = this.state.art.events || [];
			var cur = this.state.evSelected;
			var add = cur.filter(function (ev) {
				var res = true;
				for (var i = 0; i < old.length; i++) {
					if (old[i].id == ev.id) {
						res = false;
						break;
					}
				}
				return res;
			}).map(function (ev) {
				return ev.id;
			});
			var remove = old.filter(function (ev) {
				var res = true;
				for (var i = 0; i < cur.length; i++) {
					if (cur[i].id == ev.id) {
						res = false;
						break;
					}
				}
				return res;
			}).map(function (ev) {
				return ev.id;
			});

			if (add.length > 0) {
				rest.article.update('events', {
					uuid: art.uuid,
					events: add,
					action: 'add',
					title_sign: art.title_sign
				}).done(function (data) {
					if (data.result == true) {
						_this4.setState({ art: _extends({}, art, { events: cur }) });
					}
				});
			}
			if (remove.length > 0) {
				rest.article.update('events', {
					uuid: art.uuid,
					events: remove,
					action: 'sub',
					title_sign: art.title_sign
				}).done(function (data) {
					if (data.result == true) {
						_this4.setState({ art: _extends({}, art, { events: cur }) });
					}
				});
			}
		},
		reportConfirmHandler: function reportConfirmHandler() {
			var _this5 = this;

			var art = this.state.art;
			var old = this.state.art.reports || [];
			var cur = this.state.rpSelected;
			var add = cur.filter(function (rp) {
				var res = true;
				for (var i = 0; i < old.length; i++) {
					if (old[i].id == rp.id) {
						res = false;
						break;
					}
				}
				return res;
			}).map(function (rp) {
				return rp.id;
			});
			var remove = old.filter(function (rp) {
				var res = true;
				for (var i = 0; i < cur.length; i++) {
					if (cur[i].id == rp.id) {
						res = false;
						break;
					}
				}
				return res;
			}).map(function (rp) {
				return rp.id;
			});

			if (add.length > 0) {
				rest.article.update('reports', {
					uuid: art.uuid,
					reports: add,
					action: 'add'
				}).done(function (data) {
					if (data.result == true) {
						_this5.setState({ art: _extends({}, art, { reports: cur }) });
					}
				});
			}
			if (remove.length > 0) {
				rest.article.update('reports', {
					uuid: art.uuid,
					reports: remove,
					action: 'sub'
				}).done(function (data) {
					if (data.result == true) {
						_this5.setState({ art: _extends({}, art, { reports: cur }) });
					}
				});
			}
		},
		emotHandler: function emotHandler(emot) {
			var _this6 = this;

			var art = this.state.art;
			rest.articles.update('emotion', {
				uuids: [art.uuid],
				emotion: emot,
				title_sign: art.title_sign
			}).done(function (_ref) {
				var result = _ref.result;

				if (result) {
					_this6.setState({ art: _extends({}, art, { emotion: 'manual_' + emot }) });
				}
			});
		},
		modifyWarn: function modifyWarn() {
			var _this7 = this;

			var art = this.state.art;
			var uuid = art.uuid;
			var isWarn = art.warn != 'none' && art.warn != '' && art.warn;
			if (isWarn) {
				rest.articles.update('nowarn', {
					uuids: [uuid]
				}).done(function (_ref2) {
					var result = _ref2.result;

					if (result) {
						_this7.setState({ art: _extends({}, art, { warn: 'none' }) });
					}
				});
			} else {
				rest.articles.update('warn', {
					uuids: [uuid]
				}).done(function (_ref3) {
					var result = _ref3.result;

					if (result) {
						_this7.setState({ art: _extends({}, art, { warn: 'manual' }) });
					}
				});
			}
		},
		renderEvents: function renderEvents() {
			if (this.state.art.events) return this.state.art.events.map(function (ev, idx) {
				return React.createElement(
					'span',
					{ className: 'tag tag-event', key: idx, title: ev.title },
					'事件：',
					ev.title
				);
			});
			return null;
		},
		renderReports: function renderReports() {
			if (this.state.art.reports) return this.state.art.reports.map(function (rp, idx) {
				return React.createElement(
					'span',
					{ className: 'tag tag-report', key: idx, title: rp.title },
					'日报：',
					rp.title_at + rp.title
				);
			});
			return null;
		},
		hasEvent: function hasEvent(id) {
			var res = false;
			for (var i = 0; i < this.state.evSelected.length; i++) {
				var ev = this.state.evSelected[i];
				if (ev.id == id) {
					res = true;
					break;
				}
			}
			return res;
		},
		hasReport: function hasReport(id) {
			var res = false;
			for (var i = 0; i < this.state.rpSelected.length; i++) {
				var rp = this.state.rpSelected[i];
				if (rp.id == id) {
					res = true;
					break;
				}
			}
			return res;
		},
		getContent: function getContent(str) {
			var search = this.props.location.query.search,
			    tags = this.state.art.tags || [],
			    keys = this.state.art.keys,
			    opts = [];

			if (search && search.length > 0) {
				opts.push({
					keys: search,
					className: 'search'
				});
			} else {
				opts.push({
					keys: tags,
					className: 'search'
				});
			}

			if (keys) {
				opts.push({
					keys: keys,
					className: 'tag'
				});
			}

			return (str || '').replace(/([^<>]+)(?:(?=<\w+\s?.*>|<\/\w+>)|$)/g, function (s) {
				return parseword(s, opts);
			});
		},
		getTitle: function getTitle(tit, con) {
			var res = $.trim(parseTag(tit)),
			    search = this.props.location.query.search,
			    limit;
			if (!res.length) {
				res = $.trim(parseTag(con));
				limit = true;
			}

			if (res.length > 25 && limit) res = res.substr(0, 25) + '...';

			if (search && search.length > 0) {
				var reg = new RegExp(search, 'ig');
				res = res.replace(reg, function (key) {
					return '<em>' + key + '</em>';
				});
			}

			return res;
		},
		dependModalTog: function dependModalTog(tog) {
			this.setState({ dependModalShow: tog });
		},
		removeDepend: function removeDepend() {
			var uuids = [this.state.art.uuid];
			this.setState({ loadShow: true });
			rest.articles.update('depend', {
				uuids: uuids
			}).done(function (data) {
				if (data.result) {
					setTimeout(function () {
						window.history.go(-1);
					}, 1000);
				}
			});
		},
		render: function render() {
			var _this8 = this;

			var art = this.state.art;
			var emtMap = {
				'positive': '正面',
				'negative': '负面',
				'neutral': '中立'
			};
			var isVir = (art.result_tags || []).indexOf('_virtual_') != -1,
			    content = '';
			if (isVir) content = art.slug;else content = art.content;
			return React.createElement(
				'div',
				{ className: 'container advices-base-article-v2' },
				React.createElement(
					'div',
					{ className: 'title' },
					React.createElement('span', { dangerouslySetInnerHTML: { __html: this.getTitle(art.title || '', art.content || '') } })
				),
				React.createElement(
					'div',
					{ className: 'infos' },
					React.createElement(
						'span',
						{ className: 'info', title: '来源' },
						React.createElement('span', { className: 'iconfont icon-lianjie icon' }),
						React.createElement(
							'span',
							{ className: 'txt' },
							((art.from || {}).platform_name && (art.from || {}).platform_name != '待定' && (art.from || {}).platform_name != '' ? (art.from || {}).platform_name + '：' : '') + (art.from || {}).media || ''
						),
						' ',
						React.createElement(
							'a',
							{ href: art.url, target: '_blank', className: 'intxt' },
							'(原文链接)'
						)
					),
					React.createElement(
						'span',
						{ className: 'info', title: '日期' },
						React.createElement('span', { className: 'iconfont icon-iconfont74 icon' }),
						React.createElement(
							'span',
							{ className: 'txt' },
							(art.publish_at || '').replace(/\:\d+$/, '')
						)
					),
					art.tags instanceof Array && art.tags.length ? React.createElement(
						'span',
						{ className: 'info', title: '关键词' },
						React.createElement('span', { className: 'iconfont icon-keywordslist icon' }),
						React.createElement(
							'span',
							{ className: 'kw' },
							(art.tags || []).slice().join('、')
						)
					) : null,
					art.keys instanceof Array && art.keys.length ? React.createElement(
						'span',
						{ className: 'info', title: '自动标签' },
						React.createElement('span', { className: 'iconfont icon-biaoqian icon' }),
						React.createElement(
							'span',
							{ className: 'tag' },
							art.keys.slice().join('，')
						)
					) : null
				),
				React.createElement(
					'div',
					{ className: 'opers' },
					React.createElement(
						'div',
						{ className: 'status' },
						(art['result_tags'] || '').indexOf('_virtual_') != -1 ? React.createElement(
							'span',
							{ className: 'desc' },
							'本篇文章为北京时间 ',
							Parse.time(art.crawler_at),
							' 的快照，文章内容正在补充中。'
						) : null
					),
					React.createElement(
						'div',
						{ className: 'buttons article-opers' },
						React.createElement(
							'div',
							{ className: 'oper' },
							React.createElement('span', { className: "iconfont" + (art.emotion.indexOf('positive') != -1 ? ' icon-xiaolian pos' : art.emotion.indexOf('negative') != -1 ? ' icon-bumanyi01 neg' : ' icon-wugan neu') + (art.emotion.indexOf('manual') != -1 ? ' manual' : ''), title: '修改情感面' }),
							React.createElement(
								'ul',
								{ className: 'dropdown-list angle' },
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return _this8.emotHandler('positive');
										} },
									'正面'
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return _this8.emotHandler('neutral');
										} },
									'中立'
								),
								React.createElement(
									'li',
									{ className: 'dropdown-item', onClick: function onClick() {
											return _this8.emotHandler('negative');
										} },
									'负面'
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'oper' },
							React.createElement('span', { className: "iconfont icon-wendang oper-event" + (this.state.evSelected.length > 0 ? ' active' : ''), title: '添加事件' }),
							React.createElement(
								'ul',
								{ className: 'dropdown-list angle' },
								format(this.state.evList).map(function (ev, idx) {
									return React.createElement(
										'li',
										{ className: 'dropdown-item tl', key: idx, onClick: function onClick() {
												return _this8.eventSelectHandler(ev);
											}, title: ev.title },
										React.createElement('span', { className: 'c-cb' + (_this8.hasEvent(ev.id) ? " active" : "") }),
										React.createElement(
											'span',
											{ className: 'vm' },
											ev.title
										)
									);
								})
							)
						),
						React.createElement(
							'div',
							{ className: 'oper' },
							React.createElement('span', { className: "iconfont icon-jinjimoshi oper-warn" + (art.warn != 'none' && art.warn != '' && art.warn ? ' active' : ''), title: '添加预警', onClick: this.modifyWarn })
						)
					)
				),
				React.createElement('div', { className: 'content', dangerouslySetInnerHTML: { __html: this.getContent(content || '') } })
			);
		}
	});

	return Art;
});