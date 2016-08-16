"use strict";

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var Blank = React.createClass({
		displayName: "Blank",

		render: function render() {
			return React.createElement("div", { className: "blank-page" });
		}
	});

	return Blank;
});