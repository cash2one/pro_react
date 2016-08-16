'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;
	var Link = mods.RouterPack.Link;

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

	var ListItem = React.createClass({
		displayName: 'ListItem',

		componentWillMount: function componentWillMount() {},
		renderEvents: function renderEvents() {
			var events = this.props.data.events;
			if (!events) return null;
			return events.map(function (item, idx) {
				return React.createElement(
					'span',
					{ className: 'tag-ev', key: idx, title: item.title },
					item.title
				);
			});
		},
		renderReports: function renderReports() {
			var reports = this.props.data.reports;
			if (!reports) return null;
			return reports.map(function (item, idx) {
				return React.createElement(
					'span',
					{ className: 'tag-rp', key: idx, title: item.title_at + item.title },
					item.title_at + item.title
				);
			});
		},
		renderEmotion: function renderEmotion() {
			var emotion = this.props.data.emotion;
			return React.createElement(
				'span',
				{ style: { color: emotionMap[emotion] ? emotionMap[emotion].color : '' } },
				emotionMap[emotion] ? emotionMap[emotion].title : ''
			);
		},
		renderWarn: function renderWarn() {
			var warn = this.props.data.warn;
			if (warn != 'none' && warn != '' && warn) return React.createElement(
				'span',
				{ className: 'tag-warn' },
				'预警文章'
			);
		},
		changeHandler: function changeHandler() {
			this.props.onSelect && this.props.onSelect(this.props.data.uuid);
		},
		emotionChangeHandler: function emotionChangeHandler(emot) {
			this.props.onEmotionChange && this.props.onEmotionChange(this.props.data.uuid, emot);
		},
		ignoreWarn: function ignoreWarn() {
			this.props.ignoreWarn && this.props.ignoreWarn(this.props.data.uuid);
		},
		parseHighlight: function parseHighlight(str) {
			var reg = this.props.highlight;
			if (reg.length > 0) reg = new RegExp(reg, 'gi');else reg = null;

			if (reg && str) {
				str = str.replace(reg, function (str) {
					return '<em class="search">' + str + '</em>';
				});
			}
			return str;
		},
		getTitle: function getTitle(title, content) {
			if (title.length == 0) title = parseTag(content);
			title = parseTag(title);

			return this.parseHighlight(parse(title, 25));
		},
		parseword: function parseword(str) {
			var hl = this.props.highlight,
			    keys = this.props.data.keys || [],
			    reg = [];
			if (hl) {
				reg.push('(' + hl + ')');
			}
			if (keys) {
				reg = reg.concat(keys.map(function (k) {
					return '(' + k + ')';
				}));
			}
			reg = reg.join('|');

			if (str && reg.length > 0) {
				reg = new RegExp(reg, 'gi');
				str = str.replace(reg, function (str) {
					var isHl = str == hl,
					    isKeys = keys.indexOf(str) != -1;
					if (isHl && !isKeys) {
						return '<em class="search">' + str + '</em>';
					} else if (!isHl && isKeys) {
						return '<em class="tag">' + str + '</em>';
					} else if (isHl && isKeys) {
						return '<em class="search tag">' + str + '</em>';
					} else {
						return str;
					}
				});
			}

			return str;
		},
		getContent: function getContent(str) {
			str = parseTag(str);
			return this.parseHighlight(parse(str));
		},
		render: function render() {
			var _this = this;

			var data = this.props.data;
			return React.createElement(
				'div',
				{ className: 'art-item' },
				React.createElement(
					'div',
					{ className: 'opers' },
					React.createElement(
						'div',
						{ className: 'emots' },
						React.createElement(
							'span',
							{ className: "item" + (data.emotion == 'positive' ? ' active' : ''), onClick: function onClick() {
									return _this.emotionChangeHandler('positive');
								} },
							'正'
						),
						React.createElement(
							'span',
							{ className: "item" + (data.emotion == 'neutral' ? ' active' : ''), onClick: function onClick() {
									return _this.emotionChangeHandler('neutral');
								} },
							'中'
						),
						React.createElement(
							'span',
							{ className: "item" + (data.emotion == 'negative' ? ' active' : ''), onClick: function onClick() {
									return _this.emotionChangeHandler('negative');
								} },
							'负'
						)
					),
					data.warn && data.warn != 'none' && data.warn != '' ? React.createElement(
						'div',
						{ className: 'ign', onClick: function onClick() {
								return _this.ignoreWarn();
							} },
						React.createElement(
							'span',
							null,
							'忽略'
						)
					) : null
				),
				React.createElement(
					'div',
					{ className: 'top' },
					React.createElement(
						'div',
						{ className: 't-l' },
						React.createElement('input', { type: 'checkbox', id: data.uuid, checked: this.props.selected, onChange: this.changeHandler })
					),
					React.createElement(
						'div',
						{ className: 'ovh pr15' },
						React.createElement(
							'div',
							null,
							React.createElement('a', { href: paths.ex.base + '/base#/article?search=' + this.props.highlight + '&uuid=' + data.uuid, className: 'link', dangerouslySetInnerHTML: { __html: this.getTitle(data.title || '', data.content || '') } })
						),
						React.createElement(
							'div',
							{ className: 'desc' },
							React.createElement('label', { htmlFor: data.uuid, dangerouslySetInnerHTML: { __html: this.getContent(data.content || '') } })
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'tags' },
					this.renderWarn(),
					this.renderEvents(),
					this.renderReports()
				),
				React.createElement(
					'div',
					{ className: 'ft' },
					React.createElement(
						'span',
						{ className: 'mr20' },
						React.createElement(
							'span',
							null,
							'来源：'
						),
						React.createElement(
							'span',
							null,
							data.from.media
						)
					),
					React.createElement(
						'span',
						{ className: 'mr20' },
						React.createElement(
							'span',
							null,
							'相似文章：'
						),
						React.createElement(
							'span',
							null,
							data.similar_articles || 0,
							'篇'
						)
					),
					React.createElement(
						'span',
						{ className: 'mr20' },
						React.createElement(
							'span',
							null,
							'文章类型：'
						),
						this.renderEmotion()
					),
					React.createElement(
						'span',
						{ className: 'mr20' },
						React.createElement(
							'span',
							null,
							'时间：'
						),
						React.createElement(
							'span',
							null,
							data.crawler_at || ''
						)
					),
					data.keys && data.keys instanceof Array ? React.createElement(
						'span',
						{ className: 'mr20' },
						React.createElement(
							'span',
							null,
							'自动标签：'
						),
						React.createElement(
							'span',
							{ className: 'autotag' },
							data.keys.join(' ')
						)
					) : null
				)
			);
		}
	});

	return ListItem;
});