'use strict';

/**
 * 版本信息
 */

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.rcn.comps + "/frame/index",
		"Reducer_Frame": paths.rcn.comps + '/frame/reducers'
	}
});

require(["mods", paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var About = React.createClass({
		displayName: 'About',

		getInitialState: function getInitialState() {
			return {
				data: []
			};
		},
		componentDidMount: function componentDidMount() {
			this.loadVersionData();
		},
		// 读取personal接口数据
		loadVersionData: function loadVersionData() {
			var _this = this;

			rest.version.read().done(function (data) {
				if (_this.isMounted()) {
					_this.setState({ data: data });
				}
			}).error(function (data) {
				if (data.status === 400 && data.responseJSON.msg) {
					_this.setState({ warn: true, warntxt: data.responseJSON.msg });
				} else {
					_this.setState({ warn: true, warntxt: '服务器出错，请联系管理员' });
				}
			});
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'aboutpage lframe-bg' },
				React.createElement(
					'div',
					{ className: 'aboutbox' },
					React.createElement(
						'div',
						{ className: 'titlebox' },
						React.createElement(
							'span',
							null,
							'版本信息'
						)
					),
					React.createElement(
						'div',
						{ className: 'mainbox' },
						this.state.data.map(function (index, elem) {
							return React.createElement(
								'div',
								{ className: 'contentbox' },
								React.createElement(
									'p',
									null,
									index.title
								),
								React.createElement(
									'p',
									null,
									index.info
								)
							);
						})
					)
				)
			);
		}
	});

	ReactDOM.render(React.createElement(About, null), document.getElementById("aboutpage"));
});