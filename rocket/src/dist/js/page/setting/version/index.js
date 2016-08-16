'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

require(["mods", "Frame", "Reducer_Frame", paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal/index.js'], function (mods, Frame, Reducer_Frame, r, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = mods.ReactPack.default;

	var ReactDOM = mods.ReactDom.default;

	var _mods$ReduxPack = mods.ReduxPack;
	var combineReducers = _mods$ReduxPack.combineReducers;
	var createStore = _mods$ReduxPack.createStore;
	var Provider = mods.ReactReduxPack.Provider;
	var _mods$RouterPack = mods.RouterPack;
	var Router = _mods$RouterPack.Router;
	var Route = _mods$RouterPack.Route;
	var hashHistory = _mods$RouterPack.hashHistory;
	var _mods$ReduxRouterPack = mods.ReduxRouterPack;
	var syncHistoryWithStore = _mods$ReduxRouterPack.syncHistoryWithStore;
	var routerReducer = _mods$ReduxRouterPack.routerReducer;

	var store = createStore(combineReducers(_extends({}, Reducer_Frame, {
		routing: routerReducer
	})));
	var history = syncHistoryWithStore(hashHistory, store);

	var Version = React.createClass({
		displayName: 'Version',

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
				}
				// else{
				// 	this.setState({warntxt:"服务器出错，请联系管理员", warn:true});
				// }
			});
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'fr-mid w1200' },
				React.createElement(
					'div',
					{ className: 'setting' },
					React.createElement(
						'div',
						{ className: 'setting-version w' },
						React.createElement(
							'div',
							{ className: 'titlebox w' },
							React.createElement(
								'span',
								null,
								'版本信息'
							)
						),
						React.createElement(
							'div',
							{ className: 'infobox w' },
							this.state.data.map(function (index, elem) {
								return React.createElement(
									'div',
									{ className: 'cent' },
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
				)
			);
		}
	});

	ReactDOM.render(React.createElement(
		Provider,
		{ store: store },
		React.createElement(
			Frame,
			null,
			React.createElement(Version, null)
		)
	), document.getElementById("version"));
});