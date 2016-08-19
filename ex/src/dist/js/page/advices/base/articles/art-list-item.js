'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var emotionMap = {
		'positive': {
			title: '正面',
			color: '#00a0e9'
		},
		'neutral': {
			title: '中立',
			color: '#de4f00'
		},
		'negative': {
			title: '负面',
			color: '#e60012'
		}
	};

	var reg = /\<[^<>]+\>|\<\/[^<>]\>|\<\!.*\>/g;

	function parse(str, num) {
		num = num || 100;
		if (str.length > num) str = str.substr(0, num) + '...';
		return str;
	}

	function parseTag(str) {
		str = (str || '').replace(reg, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return str;
	}

	var Item = React.createClass({
		displayName: 'Item',

		getTitle: function getTitle(title, content) {
			// if(title.length == 0)
			// 	title = parseTag(content);
			// title = parseTag(title);
			// return this.parseHighlight(title);
			// console.log(title)
			return title;
		},
		getContent: function getContent(str) {
			// str = parseTag(str);
			// return this.parseHighlight(parse(str,74));
			return str;
		},
		parseHighlight: function parseHighlight(str) {
			var reg = this.props.queryParams.wd;
			if (reg.length > 0) reg = new RegExp(reg, 'gi');else reg = null;

			if (reg && str) {
				str = str.replace(reg, function (str) {
					return '<em class="search">' + str + '</em>';
				});
			}
			return str;
		},
		addWarn: function addWarn() {
			var uuid = this.props.data.uuid,
			    warn = this.props.data.warn,
			    isWarn = warn != 'none' && warn != '' && warn;
			if (isWarn) {
				this.props.ignoreWarn && this.props.ignoreWarn(uuid);
			} else {
				this.props.addWarn && this.props.addWarn(uuid);
			}
		},
		ignoreWarn: function ignoreWarn() {
			var uuid = this.props.data.uuid;
			if (this.props.ignoreWarn) this.props.ignoreWarn(uuid);
		},
		addReport: function addReport(report) {
			var uuid = this.props.data.uuid;
			if (this.props.addReport) this.props.addReport(uuid, report);
		},
		removeReport: function removeReport(reportId) {
			var uuid = this.props.data.uuid;
			if (this.props.removeReport) this.props.removeReport(uuid, reportId);
		},
		addEvent: function addEvent(event) {
			var uuid = this.props.data.uuid;
			if (this.props.addEvent) this.props.addEvent(uuid, event);
		},
		removeEvent: function removeEvent(eventId) {
			var uuid = this.props.data.uuid;
			if (this.props.removeEvent) this.props.removeEvent(uuid, eventId);
		},
		hasEvent: function hasEvent(evId) {
			var events = this.props.data.events,
			    res = false;
			if (!events || events.length == 0) return res;
			for (var i = 0; i < events.length; i++) {
				if (events[i].id == evId) {
					res = true;
					break;
				}
			}
			return res;
		},

		renderReports: function renderReports() {
			var _this = this;

			var reports = this.props.data.reports;
			if (!reports || reports.length == 0) return null;
			return reports.map(function (item, idx) {
				return React.createElement(
					'span',
					{ className: 'tag tag-report', key: idx, title: item.title_at + item.title },
					React.createElement(
						'span',
						null,
						item.title_at + item.title
					),
					React.createElement('span', { className: 'cancel', onClick: function onClick() {
							return _this.removeReport(item.id);
						} })
				);
			});
		},
		renderEvents: function renderEvents() {
			var _this2 = this;

			var events = this.props.data.events;
			if (!events || events.length == 0) return null;
			return events.map(function (item, idx) {
				return React.createElement(
					'span',
					{ className: 'tag tag-event', key: idx, title: item.title },
					React.createElement(
						'span',
						null,
						item.title
					),
					React.createElement('span', { className: 'cancel', onClick: function onClick() {
							return _this2.removeEvent(item.id);
						} })
				);
			});
		},
		renderWarn: function renderWarn() {
			var warn = this.props.data.warn;
			if (warn != 'none' && warn != '' && warn) return React.createElement(
				'span',
				{ className: 'tag tag-warn' },
				React.createElement(
					'span',
					null,
					'预警文章'
				),
				React.createElement('span', { className: 'cancel', onClick: this.ignoreWarn })
			);
		},
		renderOpers: function renderOpers() {
			var _this3 = this;

			var _props = this.props;
			var data = _props.data;
			var reportSelectData = _props.reportSelectData;
			var eventSelectData = _props.eventSelectData;
			var queryParams = _props.queryParams;
			var auditMode = _props.auditMode;
			var moreMode = _props.moreMode;

			var node;
			if (auditMode) {
				node = React.createElement(
					'div',
					{ className: 'opers article-opers' },
					React.createElement(
						'div',
						{ className: 'oper', onClick: function onClick() {
								return _this3.props.modifyEmotion('positive');
							} },
						React.createElement('span', { className: "iconfont icon-xiaolian pos" + (data.emotion == 'manual_positive' ? ' manual' : ''), title: '正面' })
					),
					React.createElement(
						'div',
						{ className: 'oper', onClick: function onClick() {
								return _this3.props.modifyEmotion('neutral');
							} },
						React.createElement('span', { className: "iconfont icon-wugan neu" + (data.emotion == 'manual_neutral' ? ' manual' : ''), title: '中立' })
					),
					React.createElement(
						'div',
						{ className: 'oper', onClick: function onClick() {
								return _this3.props.modifyEmotion('negative');
							} },
						React.createElement('span', { className: "iconfont icon-bumanyi01 neg" + (data.emotion == 'manual_negative' ? ' manual' : ''), title: '负面' })
					)
				);
			} else if (moreMode) {
				node = React.createElement(
					'div',
					{ className: 'opers article-opers' },
					React.createElement(
						'div',
						{ className: 'oper', onClick: this.props.clickYichu },
						React.createElement('span', { className: 'iconfont icon-yichu2 oper-yichu' })
					)
				);
			} else {
				node = React.createElement(
					'div',
					{ className: 'opers article-opers' },
					React.createElement(
						'div',
						{ className: 'oper' },
						React.createElement('span', { className: "iconfont" + (data.emotion.indexOf('positive') != -1 ? ' icon-xiaolian pos' : data.emotion.indexOf('negative') != -1 ? ' icon-bumanyi01 neg' : ' icon-wugan neu') + (data.emotion.indexOf('manual') != -1 ? ' manual' : ''), title: '修改情感面' }),
						React.createElement(
							'ul',
							{ className: 'dropdown-list angle' },
							React.createElement(
								'li',
								{ className: 'dropdown-item', onClick: function onClick() {
										return _this3.props.modifyEmotion('positive');
									} },
								'正面'
							),
							React.createElement(
								'li',
								{ className: 'dropdown-item', onClick: function onClick() {
										return _this3.props.modifyEmotion('neutral');
									} },
								'中立'
							),
							React.createElement(
								'li',
								{ className: 'dropdown-item', onClick: function onClick() {
										return _this3.props.modifyEmotion('negative');
									} },
								'负面'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'dn' },
						React.createElement('span', { className: 'iconfont icon-wendang oper-report', title: '添加日报' }),
						React.createElement(
							'ul',
							{ className: 'dropdown-list angle tl' },
							reportSelectData.length > 0 ? reportSelectData.map(function (item, idx) {
								return React.createElement(
									'li',
									{ className: 'dropdown-item', key: idx, onClick: function onClick() {
											return _this3.addReport(item);
										} },
									item.title_at + item.title
								);
							}) : React.createElement(
								'li',
								{ className: 'dropdown-item blank' },
								'暂无日报'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'oper' },
						React.createElement('span', { className: "iconfont icon-wendang oper-event" + (data.events && data.events.length > 0 ? ' active' : ''), title: '添加事件' }),
						React.createElement(
							'ul',
							{ className: 'dropdown-list angle tl' },
							eventSelectData.length > 0 ? eventSelectData.map(function (item, idx) {
								if (_this3.hasEvent(item.id)) {
									return React.createElement(
										'li',
										{ className: 'dropdown-item', key: idx, onClick: function onClick() {
												return _this3.removeEvent(item.id);
											} },
										React.createElement('span', { className: 'c-cb active' }),
										React.createElement(
											'span',
											{ className: 'vm' },
											item.title
										)
									);
								} else {
									return React.createElement(
										'li',
										{ className: 'dropdown-item', key: idx, onClick: function onClick() {
												return _this3.addEvent(item);
											} },
										React.createElement('span', { className: 'c-cb' }),
										React.createElement(
											'span',
											{ className: 'vm' },
											item.title
										)
									);
								}
							}) : React.createElement(
								'li',
								{ className: 'dropdown-item blank' },
								'暂无事件'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'oper' },
						React.createElement('span', { className: "iconfont icon-jinjimoshi oper-warn" + (data.warn != 'none' && data.warn != '' && data.warn ? ' active' : ''), title: '添加预警', onClick: this.addWarn })
					)
				);
			}
			return node;
		},
		render: function render() {
			var _this4 = this;

			var _props2 = this.props;
			var data = _props2.data;
			var reportSelectData = _props2.reportSelectData;
			var eventSelectData = _props2.eventSelectData;
			var queryParams = _props2.queryParams;
			var togMore = _props2.togMore;
			var moreMode = _props2.moreMode;

			return React.createElement(
				'li',
				{ className: "art-list-item has-img" },
				data['imgs'] && data['imgs'].length > 0 ? React.createElement('div', { className: 'img', style: { 'backgroundImage': 'url(' + data['imgs'][0] + ')' } }) : React.createElement('div', { className: 'img', style: { 'backgroundImage': 'url(' + paths.rcn.img + '/art-img-blank.jpg)' } }),
				React.createElement(
					'section',
					{ className: 'content' },
					React.createElement('span', { className: 'oper-del iconfont icon-lajitong', onClick: function onClick() {
							return _this4.props.putDepend(data.uuid);
						} }),
					React.createElement(
						'div',
						null,
						React.createElement('a', { href: paths.ex.base + '/base#/article?search=' + (queryParams.wd || '') + '&uuid=' + data.uuid, className: 'tit', dangerouslySetInnerHTML: { __html: this.getTitle(data.title || '', data.content || '') }, title: parseTag(data.link_title) }),
						data['result_tags'] && data['result_tags'].indexOf('_virtual_') != -1 ? React.createElement(
							'span',
							{ className: 'vir' },
							'虚拟'
						) : null
					),
					React.createElement(
						'div',
						{ className: 'ovh' },
						React.createElement(
							'div',
							{ className: 'autotags' },
							data.keys && data.keys instanceof Array ? data.keys.join(' ') : ''
						),
						React.createElement(
							'a',
							{ className: 'desc', href: paths.ex.base + '/base#/article?search=' + queryParams.wd + '&uuid=' + data.uuid },
							React.createElement('p', { dangerouslySetInnerHTML: { __html: this.getContent(data.content || '') } })
						)
					),
					React.createElement(
						'div',
						{ className: 'dn' },
						this.renderEvents(),
						this.renderReports(),
						this.renderWarn()
					),
					React.createElement(
						'div',
						{ className: 'cf mt5 pr mb-2' },
						React.createElement(
							'div',
							{ className: 'infos' },
							React.createElement(
								'span',
								{ className: 'info' },
								(data.publish_at || '').replace(/\:\d+$/, '')
							),
							React.createElement(
								'span',
								{ className: 'info' },
								(data.from.platform_name && data.from.platform_name != '待定' && data.from.platform_name != '' ? data.from.platform_name + '：' : '') + data.from.media
							),
							data.similar_count == 1 || moreMode ? null : React.createElement(
								'span',
								{ className: "info" + (togMore ? ' link' : ''), onClick: function onClick() {
										return togMore && togMore(data.title_sign, queryParams);
									} },
								'相同文章：' + +data.similar_count + '篇'
							)
						),
						this.renderOpers()
					)
				)
			);
		}
	});

	return Item;
});