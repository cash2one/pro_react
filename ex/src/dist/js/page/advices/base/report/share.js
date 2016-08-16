'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=20160613',
	paths: {
		"mods": paths.ex.lib + "/combo",
		"echarts": paths.ex.plu + '/echarts.report.share'
	}
});
require(['mods', paths.ex.util + '/parse.js', paths.ex.page + '/advices/base/report/platform.js', paths.ex.page + '/advices/base/report/index-part.js', paths.rcn.comps + '/loader.js'], function (mods, Parse, PlatForm, Index, Loader /*, wx*/) {
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var u = mods.u;

	// var rest = Rest.ex2();

	// var restIndex = Rest.index({
	// 	stringifyData: false
	// });

	// var restR = Rest.rcn();

	var rest = new $.RestClient(paths.ex.api + '/api/v2/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	rest.add('reports');
	rest.add('report');
	rest.add('article');
	rest.article.add('agg');

	var restIndex = new $.RestClient(paths.index.api + '/api/v1/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	restIndex.add('keywords');
	restIndex.keywords.add('data');

	var restR = new $.RestClient(paths.rcn.api + '/api/v1/', {
		stripTrailingSlash: true,
		stringifyData: true
	});
	restR.add('user');

	// function getSig(){
	// 	var noncestr = $.randomCode(16),
	// 		timestamp = parseInt(new Date().getTime() / 1000),
	// 		url = encodeURIComponent(window.location.href.split('#')[0]);
	// 	restR.user.read('signature', {noncestr, timestamp, url}).done(data => {
	// 		if(data.result){
	// 			wx.config({
	// 				debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	// 				appId: 'wxdb1db27ca81d84ad', // 必填，公众号的唯一标识
	// 				timestamp, // 必填，生成签名的时间戳
	// 				nonceStr: noncestr, // 必填，生成签名的随机串
	// 				signature: data.signature, // 必填，签名，见附录1
	// 				jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	// 			})
	// 		}
	// 	})
	// }


	// wx.ready(function(){
	// 	console.log(2)
	// })
	// wx.error(function(err){
	// 	console.log(22, err)
	// })

	// getSig();

	var emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	};

	var CrisisIndex = React.createClass({
		displayName: 'CrisisIndex',
		render: function render() {
			var cls,
			    num = +((this.props.save.info || {}).crisisIndex || 0);
			if (num > 75) cls = 'c4';else if (num > 50) cls = 'c3';else if (num > 25) cls = 'c2';else cls = 'c1';

			return React.createElement(
				'div',
				{ className: 'summary-part2' },
				React.createElement(
					'div',
					{ className: "wrap" + ' ' + cls },
					React.createElement('div', { className: 'img' }),
					React.createElement(
						'div',
						{ className: 'num' },
						React.createElement(
							'span',
							null,
							num
						)
					),
					React.createElement(
						'div',
						{ className: 'txt' },
						React.createElement(
							'span',
							null,
							'危机指数'
						)
					)
				)
			);
		}
	});

	var View = React.createClass({
		displayName: 'View',
		getInitialState: function getInitialState() {
			return _defineProperty({
				uuid: null,
				tips: '',
				save: { info: {} },
				data: {},
				loading: false,
				shareImg: '',
				blank: false,
				code: null
			}, 'loading', true);
		},
		componentWillMount: function componentWillMount() {
			var code = (window.location.href.match(/\/[^\/]*$/)[0] || '').substr(1);
			this.setState({ code: code });
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			var code = this.state.code;
			if (!code) return;
			if (code.length > 0) {
				this.load(true);
				rest.reports.read('share', { code: this.state.code }).done(function (data) {
					if (data.result) {
						var save = data.data;
						_this.setState({ save: data.data }, _this.getData);
						// wx.onMenuShareAppMessage({
						// 	title: save.title, // 分享标题
						// 	desc: save.info.summaryDesc || '', // 分享描述
						// });
						document.title = save.title;
					}
				}).fail(function (data) {
					_this.load(false);
					if (data.status == 410) {
						_this.setState({ blank: true });
					}
				});
			}
		},
		getData: function getData() {
			var _this2 = this;

			var save = this.state.save,
			    q = [],
			    code = this.state.code;
			this.load(1);
			// 获取危机指数
			q.push(rest.article.agg.read('report', {
				result: 'emotion',
				emotion: 'manual_positive,manual_negative,manual_neutral',
				date: save.begin_at + ',' + save.end_at,
				uniq: true,
				code: code
			}).done(function (data) {
				if (data.result) {
					(function () {
						var neg = data.data.emotion.filter(function (item) {
							return item.param == 'negative';
						});
						neg = neg[0] ? neg[0].count : 0;
						_this2.setState({ save: u(_this2.state.save, {
								info: {
									$apply: function $apply(info) {
										return u(info, {
											$merge: {
												crisisIndex: neg
											}
										});
									}
								}
							}) });
					})();
				}
			}));
			// 获取舆情数据
			var handler = function handler(k) {
				return rest.article.agg.read('report', {
					result: 'emotion',
					platform: k,
					emotion: 'manual_positive,manual_negative,manual_neutral',
					date: save.begin_at + ',' + save.end_at,
					uniq: true,
					code: code
				}).done(function (data) {
					if (data.result) {
						(function () {
							var obj = {};
							data.data.emotion.forEach(function (item) {
								obj[item['param']] = item['count'];
							});
							obj['positive'] = obj['positive'] || 0;
							obj['negative'] = obj['negative'] || 0;
							obj['neutral'] = obj['neutral'] || 0;
							_this2.setState({ save: u(_this2.state.save, {
									info: {
										$apply: function $apply(info) {
											info = info instanceof Object ? info : {};
											return u(info, {
												'articles_statis': {
													$apply: function $apply(as) {
														as = as instanceof Object ? as : {};
														return u(as, {
															$merge: _defineProperty({}, k, obj)
														});
													}
												}
											});
										}
									}
								}) });
						})();
					}
				});
			};
			['微信', '今日头条', '百度百家', 'all'].forEach(function (k) {
				return q.push(handler(k));
			});

			// 获取指数数据
			q.push(restIndex.keywords.read('report', { code: code }).done(function (data) {
				if (data) {
					(function () {
						var map = data.reduce(function (o, item) {
							o[item['id']] = item['keyword'];
							return o;
						}, {});
						data = data.map(function (item) {
							return item.id;
						});
						restIndex.keywords.data.read('report', {
							k: data,
							days: 30,
							from: save.end_at,
							code: code
						}).done(function (dat) {
							var company = {};

							for (var k in dat) {
								for (var c in dat[k]) {
									if (c == 'day') continue;
									if (company[c] == undefined) company[c] = {};
									company[c][map[k]] = dat[k][c];
									company['day'] = dat[k]['day'];
								}
							}

							_this2.setState({ save: u(_this2.state.save, {
									info: {
										$apply: function $apply(info) {
											return u(info, {
												index: {
													$set: company
												}
											});
										}
									}
								}) });
						});
					})();
				}
			}));

			// q.push(rest.article.data.read('query', {
			// 	emotion: 'manual_negative',
			// 	date: save.begin_at + ',' + save.end_at,
			// 	uniq: true
			// }).done(data => {
			// 	if(data.result){
			// 		this.setState({data: u(this.state.data, {
			// 			focus_articles: {
			// 				$set: data.data
			// 			}
			// 		})});
			// 		if(save.status == 1){
			// 			this.setState({save: u(this.state.save, {
			// 				info: {
			// 					$apply: info => {
			// 						return u(info, {
			// 							focus_articles: {
			// 								$set: data.data
			// 							}
			// 						})
			// 					}
			// 				}
			// 			})})
			// 		}
			// 	}
			// }));
			$.when.apply(null, q).always(function () {
				return _this2.load(0);
			});
		},
		load: function load(b) {
			this.setState({ loading: b });
		},
		render: function render() {
			var save = this.state.save,
			    saveInfo = save.info || {},
			    data = this.state.data;
			return React.createElement(
				'div',
				{ className: 'advices-base-report-share' },
				this.state.blank ? React.createElement(
					'div',
					{ className: 'blank-part' },
					React.createElement(
						'div',
						{ className: 'list-blank-holder' },
						'未找到此日报，可能日报已被删除。'
					)
				) : React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'hd-part' },
						React.createElement(
							'div',
							{ className: 'title' },
							React.createElement(
								'span',
								null,
								save.title
							)
						),
						React.createElement(
							'div',
							{ className: 'subtitle' },
							save.begin_at != save.end_at ? React.createElement(
								'span',
								{ className: 'date' },
								save.begin_at + '至' + save.end_at
							) : React.createElement(
								'span',
								{ className: 'date' },
								save.begin_at
							)
						)
					),
					React.createElement(
						'div',
						{ style: { 'padding-bottom': '40px' } },
						React.createElement(
							'div',
							{ className: 'group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement(
									'span',
									null,
									'日报综述'
								)
							),
							React.createElement(
								'div',
								{ className: 'group-con' },
								React.createElement(
									'div',
									{ className: 'ovh summary-part' },
									React.createElement('span', { className: 'iconfont icon-duihua fl' }),
									React.createElement(
										'p',
										{ className: 'ovh' },
										save.info.summaryDesc || ''
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement(
									'span',
									null,
									'危机指数'
								)
							),
							React.createElement(
								'div',
								{ className: 'group-con' },
								React.createElement(CrisisIndex, { save: save })
							)
						),
						React.createElement(
							'div',
							{ className: 'group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement(
									'span',
									null,
									'舆情数据'
								)
							),
							React.createElement(
								'div',
								{ className: 'group-con' },
								React.createElement(PlatForm, { save: save })
							)
						),
						React.createElement(
							'div',
							{ className: 'group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement(
									'span',
									null,
									'搜索指数'
								)
							),
							React.createElement(
								'div',
								{ className: 'group-con noborder' },
								React.createElement(Index, { save: save, m: true })
							)
						),
						React.createElement(
							'div',
							{ className: 'group' },
							React.createElement(
								'div',
								{ className: 'group-title' },
								React.createElement(
									'span',
									null,
									'文章摘录'
								)
							),
							React.createElement(
								'div',
								{ className: 'group-con' },
								React.createElement(
									'div',
									{ className: 'art-part' },
									saveInfo.focus_articles && saveInfo.focus_articles.length > 0 ? React.createElement(
										'ul',
										null,
										(saveInfo.focus_articles || []).map(function (art, idx) {
											var title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
											var pn = (art.from || {}).platform_name || '',
											    media_pre = void 0,
											    media_end = (art.from || {}).media || '';
											if (pn == '待定' || pn == '') media_pre = '';else media_pre = pn + '：';

											return React.createElement(
												'li',
												{ ref: idx },
												React.createElement(
													'div',
													{ className: 'title' },
													React.createElement(
														'a',
														{ href: art.url, target: '_blank', title: title },
														Parse.limit(title, 40)
													)
												),
												React.createElement(
													'div',
													{ className: 'infos' },
													React.createElement(
														'span',
														null,
														Parse.time(art.publish_at)
													),
													React.createElement(
														'span',
														null,
														media_pre + media_end
													),
													React.createElement(
														'span',
														null,
														emotMap[art.emotion] || ''
													),
													React.createElement(
														'div',
														{ className: 'tool' },
														React.createElement(
															'span',
															null,
															'相同文章：' + (art.similar_count || 0) + '篇'
														)
													)
												)
											);
										})
									) : React.createElement(
										'div',
										{ className: 'list-blank-holder' },
										'暂无数据'
									)
								)
							)
						)
					)
				),
				React.createElement(Loader, { show: this.state.loading })
			);
		}
	});

	ReactDOM.render(React.createElement(View, null), document.getElementById('main'));
});