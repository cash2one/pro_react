'use strict';

define(['mods', paths.ex.page + '/advices/analy/profile/helper.js', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/analy/profile/parse.js', paths.rcn.plu + '/fecha.min.js'], function (mods, Helper, Rest, Parse, fecha) {
	var React = mods.ReactPack.default;

	var rest = Rest.ex();
	rest.user.add('tags');

	var rest2 = Rest.ex2();

	var restArt = Rest.article();

	Highcharts.setOptions({ global: { useUTC: false } });

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str) {
		str = (str || '').replace(reg, '');
		return str;
	}

	var Profile = React.createClass({
		displayName: 'Profile',

		getInitialState: function getInitialState() {
			return {
				hotEvents: [],
				artTable: {},
				latestArt: [],
				mids: [],
				artTotal: 0,
				warnTotal: 0
			};
		},
		componentDidMount: function componentDidMount() {
			this.update();
		},
		update: function update() {
			var _this = this;

			// 文章总数
			var artTotal = restArt.count.read().done(function (_ref) {
				var count = _ref.count;

				_this.setState({ artTotal: count });
			});
			// 预警总数
			var warnTotal = restArt.count.read({
				warn: 'all'
			}).done(function (_ref2) {
				var count = _ref2.count;

				_this.setState({ warnTotal: count });
			});
			// 热门事件
			var hotEvents = rest.events.read('hot').done(function (data) {
				_this.setState({ hotEvents: data });
			});
			// 文章列表
			// var artList = rest.article.read('list').done(data => {
			// 	this.setState({artTable: data}, () => Helper.runEmotChart(data.today))
			// })
			var artList = rest2.article.count.read('emowarn').done(function (data) {
				_this.setState({ artTable: data }, function () {
					return Helper.runEmotChart(data.today);
				});
			});
			// 最新舆情
			var news = rest.articles.read('latest').done(function (data) {
				_this.setState({ latestArt: data });
			});

			// 可选标签
			// var tags = rest.user.tags.read('media').done(data => {
			// 	this.setState({tags: data.map(tag => tag.category)}, () => Helper.runTotalChart())
			// });
			var tags = rest.media.read('top').done(function (data) {
				_this.setState({ mids: data }, function () {
					return Helper.runTotalChart();
				});
			});
		},
		componentWillUnmount: function componentWillUnmount() {
			Helper.leave();
		},
		getLatestTime: function getLatestTime(time_str) {
			var now = Date.now(),
			    time = fecha.parse($.trim(time_str), 'YYYY-MM-DD HH:mm:ss').getTime(),
			    delta = now - time,
			    min = 1000 * 60,
			    hour = min * 60,
			    day = hour * 24;
			if (delta < min) {
				// 1分钟以内
				return '刚刚';
			} else if (delta < hour) {
				// 1小时以内
				return parseInt(delta / min) + '分钟前';
			} else if (delta < day) {
				// 1天以内
				return parseInt(delta / hour) + '小时前';
			} else {
				// 大于1天
				return parseInt(delta / day) + '天前';
			}
		},
		renderArtTable: function renderArtTable() {
			var data = this.state.artTable;
			var xValue = ['today', 'yesterday', '7', '30'];
			var yValue = ['positive', 'neutral', 'negative', 'warn'];
			var yMap = {
				'positive': '正面',
				'neutral': '中立',
				'negative': '负面',
				'warn': '预警'
			};
			var nodes = yValue.map(function (y, idx) {
				return React.createElement(
					'tr',
					{ key: idx },
					React.createElement(
						'td',
						null,
						yMap[y]
					),
					xValue.map(function (x, i) {
						if (data[x]) return React.createElement(
							'td',
							{ key: i },
							data[x][y] || '-'
						);
					})
				);
			});

			return nodes;
		},
		renderMids: function renderMids() {
			var nodes = this.state.mids.map(function (mid, idx) {
				return React.createElement(
					'label',
					{ key: idx },
					React.createElement('input', { type: 'checkbox', className: 'mr5', 'data-mid': mid.id, 'data-mid-name': mid.name }),
					mid.name
				);
			});
			nodes.unshift(React.createElement(
				'label',
				null,
				React.createElement('input', { type: 'checkbox', className: 'mr5', 'data-mid': 'all', 'data-mid-name': 'all' }),
				'全部'
			));
			return nodes;
		},
		renderLatest: function renderLatest() {
			var _this2 = this;

			var emotMap = {
				'positive': '正面',
				'neutral': '中立',
				'negative': '负面'
			};
			return this.state.latestArt.map(function (art, idx) {
				var title = Parse.tag(art.title.length > 0 ? art.title : art.content);
				return React.createElement(
					'tr',
					{ key: idx },
					React.createElement(
						'td',
						null,
						React.createElement(
							'a',
							{ href: paths.ex.base + '/base#/article?uuid=' + art.uuid || '', className: 'link', title: title },
							Parse.limit(title, 40)
						)
					),
					React.createElement(
						'td',
						{ className: 'tr nowrap' },
						React.createElement(
							'span',
							null,
							art.from.media
						)
					),
					React.createElement(
						'td',
						{ className: 'tr nowrap' },
						art.warn != 'none' && art.warn != '' && art.warn ? React.createElement(
							'span',
							{ style: { color: 'red' } },
							'预警'
						) : React.createElement(
							'span',
							null,
							emotMap[art.emotion]
						)
					),
					React.createElement(
						'td',
						{ className: 'time tr nowrap' },
						React.createElement(
							'span',
							{ title: art.crawler_at },
							_this2.getLatestTime(art.crawler_at)
						)
					)
				);
			});
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'advices-analy-profile' },
				React.createElement(
					'div',
					{ className: 'w1200' },
					React.createElement(
						'div',
						{ className: 'art-part' },
						React.createElement(
							'div',
							{ className: 'left' },
							React.createElement(
								'div',
								{ className: 'art-number' },
								React.createElement(
									'div',
									{ className: 'top' },
									React.createElement(
										'div',
										null,
										React.createElement(
											'a',
											{ href: paths.ex.base + '/base#/news/audit' },
											React.createElement(
												'span',
												{ className: 'label' },
												'文章总数（篇）'
											),
											React.createElement(
												'div',
												null,
												React.createElement(
													'span',
													{ className: 'num total' },
													this.state.artTotal
												)
											)
										)
									),
									React.createElement(
										'div',
										null,
										React.createElement(
											'a',
											{ href: paths.ex.base + '/base#/warn/store' },
											React.createElement(
												'span',
												{ className: 'label' },
												'预警文章（篇）'
											),
											React.createElement(
												'div',
												null,
												React.createElement(
													'span',
													{ className: 'num warn' },
													this.state.warnTotal
												)
											)
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'art-list' },
								React.createElement(
									'div',
									{ className: 'title' },
									React.createElement(
										'span',
										null,
										'文章列表'
									)
								),
								React.createElement(
									'div',
									{ className: 'table' },
									React.createElement(
										'table',
										{ className: 'c-table' },
										React.createElement('colgroup', { width: '20%' }),
										React.createElement('colgroup', { width: '20%' }),
										React.createElement('colgroup', { width: '20%' }),
										React.createElement('colgroup', { width: '20%' }),
										React.createElement('colgroup', { width: '20%' }),
										React.createElement(
											'thead',
											null,
											React.createElement(
												'tr',
												null,
												React.createElement('th', null),
												React.createElement(
													'th',
													null,
													'今天'
												),
												React.createElement(
													'th',
													null,
													'昨天'
												),
												React.createElement(
													'th',
													null,
													'近7天'
												),
												React.createElement(
													'th',
													null,
													'近30天'
												)
											)
										),
										React.createElement(
											'tbody',
											null,
											this.renderArtTable()
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'art-chart' },
							React.createElement(
								'div',
								{ className: 'title' },
								React.createElement(
									'span',
									null,
									'今日舆情属性'
								)
							),
							React.createElement('div', { className: 'chart', id: 'emotChart' })
						)
					),
					React.createElement(
						'div',
						{ className: 'grid' },
						React.createElement(
							'div',
							{ className: 'right' },
							React.createElement(
								'div',
								{ className: 'art-hot' },
								React.createElement(
									'div',
									{ className: 'title' },
									React.createElement(
										'span',
										null,
										'最新事件',
										React.createElement(
											'em',
											null,
											'最近七天'
										)
									),
									React.createElement(
										'a',
										{ href: paths.ex.base + "/base#/event/operator" },
										'更多'
									)
								),
								React.createElement(
									'ul',
									{ className: 'list' },
									this.state.hotEvents.length > 0 ? this.state.hotEvents.map(function (event, idx) {
										return React.createElement(
											'li',
											{ className: 'item', key: idx },
											React.createElement(
												'span',
												{ className: 'date' },
												event.begin_at
											),
											React.createElement(
												'div',
												{ className: 'tit texthidden' },
												React.createElement(
													'a',
													{ href: paths.ex.base + '/base#/event/detail?event_id=' + event.id },
													event.title
												)
											)
										);
									}) : React.createElement(
										'li',
										null,
										React.createElement(
											'div',
											{ className: 'list-blank-holder' },
											React.createElement(
												'span',
												null,
												'暂无事件，',
												React.createElement(
													'a',
													{ href: paths.ex.base + '/base#/event/operator' },
													'创建事件'
												)
											)
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'left' },
							React.createElement(
								'div',
								{ className: 'art-index mb10' },
								React.createElement(
									'div',
									{ className: 'tab' },
									React.createElement(
										'div',
										{ className: 'inner', id: 'tagsTabContainer' },
										React.createElement(
											'span',
											{ className: 'item active', 'data-range': 'today' },
											'近24小时'
										),
										React.createElement(
											'span',
											{ className: 'item', 'data-range': 'last_week', 'data-disable': 'true' },
											'近7天'
										),
										React.createElement(
											'span',
											{ className: 'item', 'data-range': 'last_month', 'data-disable': 'true' },
											'近30天'
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'content' },
									React.createElement(
										'div',
										null,
										React.createElement('div', { className: 'chart', id: 'chart' }),
										React.createElement(
											'div',
											{ className: 'selectors dn', id: 'tagsContainer' },
											this.renderMids()
										)
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'art-news' },
								React.createElement(
									'div',
									{ className: 'title' },
									React.createElement(
										'span',
										null,
										'最新舆情',
										React.createElement(
											'em',
											null,
											'最近七天'
										)
									),
									React.createElement(
										'a',
										{ href: paths.ex.base + "/base#/news/audit", className: 'fr' },
										'更多'
									)
								),
								React.createElement(
									'div',
									{ className: 'list' },
									this.state.latestArt.length > 0 ? React.createElement(
										'table',
										{ className: 'pct100' },
										React.createElement(
											'tbody',
											null,
											this.renderLatest()
										)
									) : React.createElement(
										'div',
										{ className: 'list-blank-holder' },
										React.createElement(
											'span',
											null,
											'暂无文章，敬请期待。'
										)
									)
								)
							)
						)
					)
				)
			);
		}
	});

	return Profile;
});