"use strict";

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var NotFound = React.createClass({
		displayName: "NotFound",

		render: function render() {
			return React.createElement(
				"div",
				{ className: "err404" },
				React.createElement(
					"div",
					{ className: "inner" },
					React.createElement(
						"span",
						{ className: "t1" },
						"您访问的页面不存在"
					),
					React.createElement(
						"span",
						{ className: "t2" },
						"温馨提醒：亲，您可能人品太差，补救方式请联系管理员！"
					),
					React.createElement(
						"span",
						{ className: "t3" },
						"rdev@puzhizhuhai.com"
					)
				)
			);
		}
	});

	return NotFound;
});