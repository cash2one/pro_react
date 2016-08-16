"use strict";

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var Art = React.createClass({
		displayName: "Art",

		render: function render() {
			return React.createElement(
				"div",
				{ className: "advices-base-article" },
				React.createElement(
					"div",
					{ className: "title" },
					React.createElement(
						"span",
						null,
						"武警工程大学政委：此次军改是建国以来最大变动"
					)
				),
				React.createElement(
					"div",
					{ className: "info" },
					React.createElement(
						"span",
						null,
						"来源：腾讯网"
					),
					React.createElement(
						"span",
						null,
						"发布时间：2016-10-10"
					),
					React.createElement(
						"span",
						null,
						"文章类型：中立"
					),
					React.createElement(
						"span",
						null,
						"关键字：观剧镜"
					)
				),
				React.createElement(
					"div",
					{ className: "opers" },
					React.createElement(
						"div",
						{ className: "tags" },
						React.createElement(
							"span",
							{ className: "event" },
							"事件：龙腾事件事件"
						),
						React.createElement(
							"span",
							{ className: "report" },
							"日报： 20150106"
						)
					),
					React.createElement(
						"div",
						{ className: "ovh" },
						React.createElement("div", { className: "fr" })
					)
				),
				React.createElement(
					"div",
					{ className: "content" },
					"党的十八大以来，习主席站在时代发展和战略全局的高度，围绕加强国防和军改，提出实现党在新形势下强军目标、政治建军、改革强军、依法治军、特特色色强军之路等一系列重大战略思想。如果说全军政工会议是围绕政治建军的重新出发，军队改革工作会议就是着眼改革强军的战略举措。其中，政治建军、改革强军大战略思想，是相互承接的顶层设计，是互为支撑、内在统一的有机整体，统一于构建中国特色现代军事力量体系的伟大事业。"
				)
			);
		}
	});

	return Art;
});