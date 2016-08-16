"use strict";

define(['mods'], function (mods) {
	var React = mods.ReactPack.default,
	    TransG = mods.TransGroup.default;

	var Loader = React.createClass({
		displayName: "Loader",

		render1: function render1() {
			return React.createElement(
				"div",
				{ className: "sk-circle" },
				React.createElement("div", { className: "sk-circle1 sk-child" }),
				React.createElement("div", { className: "sk-circle2 sk-child" }),
				React.createElement("div", { className: "sk-circle3 sk-child" }),
				React.createElement("div", { className: "sk-circle4 sk-child" }),
				React.createElement("div", { className: "sk-circle5 sk-child" }),
				React.createElement("div", { className: "sk-circle6 sk-child" }),
				React.createElement("div", { className: "sk-circle7 sk-child" }),
				React.createElement("div", { className: "sk-circle8 sk-child" }),
				React.createElement("div", { className: "sk-circle9 sk-child" }),
				React.createElement("div", { className: "sk-circle10 sk-child" }),
				React.createElement("div", { className: "sk-circle11 sk-child" }),
				React.createElement("div", { className: "sk-circle12 sk-child" })
			);
		},
		render2: function render2() {
			return React.createElement(
				"div",
				{ className: "sk-fading-circle" },
				React.createElement("div", { className: "sk-circle1 sk-circle" }),
				React.createElement("div", { className: "sk-circle2 sk-circle" }),
				React.createElement("div", { className: "sk-circle3 sk-circle" }),
				React.createElement("div", { className: "sk-circle4 sk-circle" }),
				React.createElement("div", { className: "sk-circle5 sk-circle" }),
				React.createElement("div", { className: "sk-circle6 sk-circle" }),
				React.createElement("div", { className: "sk-circle7 sk-circle" }),
				React.createElement("div", { className: "sk-circle8 sk-circle" }),
				React.createElement("div", { className: "sk-circle9 sk-circle" }),
				React.createElement("div", { className: "sk-circle10 sk-circle" }),
				React.createElement("div", { className: "sk-circle11 sk-circle" }),
				React.createElement("div", { className: "sk-circle12 sk-circle" })
			);
		},
		render: function render() {
			return React.createElement(
				TransG,
				{ transitionName: "show", transitionEnterTimeout: 10, transitionLeaveTimeout: 200 },
				this.props.show ? React.createElement(
					"div",
					{ className: "c-loader" + (this.props.fix ? ' fix' : '') },
					React.createElement(
						"div",
						{ className: "wrap" },
						this.render2()
					)
				) : null
			);
		}
	});

	return Loader;
});