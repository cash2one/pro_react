"use strict";

require.config({
	baseUrl: 'js',
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test"
	}
});

require(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/view/helper.js'], function (mods, Rest, Helper) {
	var React = mods.ReactPack.default;
	var ReactDom = mods.ReactDom.default;
	var PropTypes = mods.ReactPack.PropTypes;
	var Link = mods.RouterPack.Link;

	var rest = Rest.ex();

	function GetQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	}

	var date = GetQueryString('day');
	var user_token = GetQueryString('user_token');

	var View = React.createClass({
		displayName: "View",

		contextTypes: {
			router: PropTypes.object.isRequired
		},
		getInitialState: function getInitialState() {
			return {
				eventList: [],
				keywords: [],
				articles_statis: {},
				artList: [],
				date: '',
				title: ''
			};
		},
		componentWillMount: function componentWillMount() {
			this.setState({ date: date });
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			var date = this.state.date;
			if (!date) return;
			$.get(paths.ex.base + '/api/v2/report', {
				day: date,
				user_token: user_token
			}).done(function (data) {
				Helper.run(_this.state.date, data);
				_this.setState({ artList: data.focus_articles });
			});
		},
		render: function render() {
			return React.createElement(
				"div",
				{ className: "advices-base-report download" },
				React.createElement(
					"div",
					{ className: "edit-container view" },
					React.createElement(
						"div",
						{ className: "hd" },
						React.createElement(
							"div",
							{ className: "title" },
							React.createElement(
								"span",
								null,
								this.state.title
							)
						),
						React.createElement(
							"div",
							{ className: "date" },
							React.createElement(
								"span",
								null,
								this.state.date
							)
						)
					),
					React.createElement(
						"div",
						{ className: "bd" },
						React.createElement(
							"div",
							{ className: "summarize-view-part" },
							React.createElement("div", { className: "left", id: "event-chart" }),
							React.createElement(
								"div",
								{ className: "right" },
								React.createElement(
									"p",
									{ className: "title" },
									"综述"
								),
								React.createElement("p", { id: "summary-content", className: "content" })
							)
						),
						React.createElement(
							"div",
							{ className: "index-part", id: "index-chart" },
							React.createElement(
								"div",
								{ className: "index" },
								React.createElement(
									"div",
									{ className: "title" },
									React.createElement(
										"span",
										null,
										"百度指数"
									),
									React.createElement("input", { type: "checkbox", target: "#baidu_keywords_container", name: "baidu_index", id: "baidu_index", "data-index-checkbox": true, className: "dn" })
								),
								React.createElement("div", { id: "chart_index_baidu" })
							),
							React.createElement(
								"div",
								{ className: "index" },
								React.createElement(
									"div",
									{ className: "title" },
									React.createElement(
										"span",
										null,
										"新浪指数"
									),
									React.createElement("input", { type: "checkbox", target: "#sina_keywords_container", name: "sina_index", "data-index-checkbox": true, id: "sina_index", className: "dn" })
								),
								React.createElement("div", { id: "chart_index_sina" })
							),
							React.createElement(
								"div",
								{ className: "index" },
								React.createElement(
									"div",
									{ className: "title" },
									React.createElement(
										"span",
										null,
										"好搜指数"
									),
									React.createElement("input", { type: "checkbox", target: "#haosou_keywords_container", name: "360_index", id: "360_index", "data-index-checkbox": true, className: "dn" })
								),
								React.createElement("div", { id: "chart_index_360" })
							)
						),
						React.createElement(
							"div",
							{ className: "statistic-part" },
							React.createElement(
								"div",
								{ className: "title" },
								React.createElement(
									"label",
									null,
									"分布统计图表"
								)
							),
							React.createElement(
								"div",
								{ className: "chart-statis-container" },
								React.createElement(
									"div",
									{ className: "item" },
									React.createElement("div", { id: "negative_statistic" }),
									React.createElement(
										"div",
										{ className: "tc f18", style: { color: '#ccc' } },
										"负面报道"
									)
								),
								React.createElement(
									"div",
									{ className: "item" },
									React.createElement("div", { id: "neutral_statistic" }),
									React.createElement(
										"div",
										{ className: "tc f18", style: { color: "#ccc" } },
										"中性报道"
									)
								),
								React.createElement(
									"div",
									{ className: "item" },
									React.createElement("div", { id: "positive_statistic" }),
									React.createElement(
										"div",
										{ className: "tc f18", style: { color: "#ccc" } },
										"正面报道"
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "art-part" },
							React.createElement(
								"div",
								{ className: "title" },
								React.createElement(
									"span",
									null,
									"文章列表"
								)
							),
							React.createElement(
								"div",
								null,
								React.createElement(
									"table",
									{ className: "c-table" },
									React.createElement("colgroup", { width: "6%" }),
									React.createElement("colgroup", { width: "57%" }),
									React.createElement("colgroup", { width: "11%" }),
									React.createElement("colgroup", { width: "9%" }),
									React.createElement("colgroup", { width: "17%" }),
									React.createElement(
										"thead",
										null,
										React.createElement(
											"tr",
											null,
											React.createElement(
												"th",
												null,
												"序号"
											),
											React.createElement(
												"th",
												null,
												"标题"
											),
											React.createElement(
												"th",
												null,
												"文章类型"
											),
											React.createElement(
												"th",
												null,
												"作者"
											),
											React.createElement(
												"th",
												null,
												"分布时间"
											)
										)
									),
									React.createElement(
										"tbody",
										{ id: "article_focus_container" },
										this.state.artList.map(function (art, idx) {
											return React.createElement(
												"tr",
												{ key: idx },
												React.createElement(
													"td",
													null,
													idx + 1
												),
												React.createElement(
													"td",
													null,
													React.createElement(
														"a",
														{ href: art.url, "data-article-link": true, "data-uuid": art.src_uuid, "data-source": art.from, "data-from-text": art.from_text },
														art.title
													)
												),
												React.createElement(
													"td",
													{ "data-emotion": true },
													art.emotion
												),
												React.createElement(
													"td",
													{ "data-author": true },
													art.author
												),
												React.createElement(
													"td",
													null,
													art.create_at
												)
											);
										})
									)
								)
							)
						)
					)
				)
			);
		}
	});

	ReactDom.render(React.createElement(View, null), document.getElementById('app'));
});