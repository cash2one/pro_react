'use strict';

/**
 * 大数据公用组件
 */

define(['mods', paths.rcn.util + '/rest.js'], function (mods, r) {
	var React = require('mods').ReactPack.default;

	var rest = r.bigdata({
		// stringifyData: false
	});

	var Comp = React.createClass({
		displayName: 'Comp',

		getInitialState: function getInitialState() {
			return {
				mcookie: [], // 存储历史搜索
				mdata: [], // 存储nav接口数据(name+官网url)
				tools: [], // 存储checkbox(name)
				urls: [], // 存储nav接口data数据(name+官网url)
				error: false,
				errortxt: '',
				cookieName: '',
				cookieTool: '',
				name_url_obj: {},
				menuName: ''
			};
		},
		componentDidMount: function componentDidMount() {
			$('.frame-body-right').addClass('v2');
			this.loadData();
		},
		loadData: function loadData() {
			var _this = this;

			rest.nav.read('data').done(function (data) {
				var bigData = data;
				var hash_path = window.location.hash.substring(2);
				var beg_path = hash_path.lastIndexOf('/') + 1;
				var end_path = hash_path.lastIndexOf('?');
				var path_name = hash_path.substring(beg_path, end_path);

				var cookie_name = path_name + 'key';
				var cookie_tool = path_name + 'tool';

				_this.setState({ mdata: bigData[path_name], cookieName: cookie_name, cookieTool: cookie_tool });

				// 关键字存cookie判断
				var cookie_main = $.cookie(cookie_name);
				if (cookie_main) {
					_this.loadCookieKey(cookie_main);
				}

				// 选中工具存cookie判断
				var cookie_main_tool = $.cookie(cookie_tool);
				if (cookie_main_tool) {
					_this.loadCookieTool(cookie_main_tool, bigData[path_name].length);
				}

				var menuName;
				if (path_name === 'authority') {
					menuName = '权威机构';
				} else if (path_name === 'industry') {
					menuName = '行业报告';
				} else if (path_name === 'index') {
					menuName = '指数榜单';
				} else if (path_name === 'sales') {
					menuName = '销售流量';
				}
				_this.setState({ menuName: menuName });
			});
		},
		loadCookieKey: function loadCookieKey(cookie_main) {

			var cookie_key = [];

			if (cookie_main.indexOf(',') > 0) {
				cookie_key = cookie_main;
				var strArray = cookie_key.split(",");
				var temp_arr = [];
				for (var i = 0; i < strArray.length; i++) {
					temp_arr.push(strArray[i]);
				}
				this.setState({ mcookie: temp_arr });
			} else {
				cookie_key.push(cookie_main);
				this.setState({ mcookie: cookie_key });
			}
		},
		loadCookieTool: function loadCookieTool(cookie_main_tool, allLength) {
			var cookie_tools = [];

			if (cookie_main_tool.indexOf(',') > 0) {
				cookie_tools = cookie_main_tool;
				var strArray = cookie_tools.split(",");
				var temp_arr = [];
				for (var i = 0; i < strArray.length; i++) {
					temp_arr.push(strArray[i]);
				}
				this.setState({ tools: temp_arr });

				// 当选中的是最后一个checkbox时，选中全选按钮
				if (temp_arr.length == allLength) {
					$("#allcheck").trigger('click');
				}
			} else {
				cookie_tools.push(cookie_main_tool);
				this.setState({ tools: cookie_tools });
			}
		},
		saveCookie: function saveCookie(cookie_name, searchKey) {
			// 将搜索结果存入cookie
			var cookie_key = [];
			var cookie_main = $.cookie(cookie_name);

			// 重复检查、最多存8个历史搜索结果（需求去掉改功能）
			if (cookie_main) {
				if (cookie_main.indexOf(',') > 0) {

					var strArray = cookie_main.split(",");
					var temp_arr = [];
					for (var i = 0; i < strArray.length; i++) {
						temp_arr.push(strArray[i]);
					}

					// 历史搜索排重问题
					var mark = -1;
					for (var i = 0; i < temp_arr.length; i++) {
						if (temp_arr[i] === searchKey) {
							mark = i;
							break;
						}
					}
					if (mark == -1) {
						if (temp_arr.length > 7) {
							temp_arr.splice(7, 1); // 去掉第8个
						}
						temp_arr.unshift(searchKey); // 从头加入新的搜索关键字
					} else {
							temp_arr.splice(parseInt(mark), 1); // 去掉历史搜索存在的该字段

							temp_arr.unshift(searchKey); // 从头加入新的搜索关键字
						}

					$.cookie(cookie_name, temp_arr, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
					this.setState({ mcookie: temp_arr });
				} else if (searchKey !== cookie_main) {
					// } else {
					cookie_key.unshift(cookie_main);
					cookie_key.unshift(searchKey);
					$.cookie(cookie_name, cookie_key, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
					this.setState({ mcookie: cookie_key });
				}
			} else {
				$.cookie(cookie_name, searchKey, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
				cookie_key.unshift(searchKey);
				this.setState({ mcookie: cookie_key });
			}
		},
		// 未选择的单选框
		handleCheckbox: function handleCheckbox(elem, name, tools, allLength) {

			var toolName = name;
			var st_tools = tools;
			var input_id = 'cb' + elem;
			var label_id = 'lb' + elem;
			var st_cookieTool = this.state.cookieTool;

			$('#' + input_id).trigger('click');
			$('#' + label_id).parents('.indexbox').toggleClass('active');

			if ($('#' + input_id).is(':checked')) {

				st_tools.push(toolName);

				// 当选中的是最后一个checkbox时，选中全选按钮
				if (st_tools.length == allLength) {
					$("#allcheck").trigger('click');
				}
			} else {

				for (var i = 0; i < st_tools.length; i++) {
					if (st_tools[i] === toolName) {
						st_tools.splice(i, 1);
					}
				}

				if ($("#allcheck").is(":checked") && st_tools.length < allLength) {
					$("#allcheck").trigger('click');
				}
			}
			this.setState({ tools: st_tools });
			$.cookie(st_cookieTool, st_tools, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
		},
		// 针对已选择的单选框
		handleCheckboxTrue: function handleCheckboxTrue(elem, name, tools, allLength) {
			var toolName = name;
			var st_tools = tools;
			var input_id = 'cb' + elem;
			var label_id = 'lb' + elem;
			var st_cookieTool = this.state.cookieTool;

			if (!$('#' + input_id).is(':checked')) {

				$('#' + input_id).trigger('click');
				$('#' + label_id).parents('.indexbox').toggleClass('active');

				st_tools.push(toolName);
				// 当选中的是最后一个checkbox时，选中全选按钮
				if (st_tools.length == allLength) {
					$("#allcheck").trigger('click');
				}
			}
			this.setState({ tools: st_tools });
			$.cookie(st_cookieTool, st_tools, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
		},
		// 全选
		handleAllCheckbox: function handleAllCheckbox(mdata, tools) {
			var st_mdata = mdata;
			var sta_tools = tools;
			var st_cookieTool = this.state.cookieTool;

			if (!$("#allcheck").is(":checked")) {
				// 它为全选按钮

				$(".cb").removeAttr('checked');
				$('.lb').parents('.indexbox').removeClass('active');

				$("#allcheck").trigger('click');
				$(".cb").trigger('click');
				$('.lb').parents('.indexbox').toggleClass('active');

				st_mdata.map(function (index, elem) {
					sta_tools.push(index.name);
					return sta_tools;
				});
				this.setState({ tools: sta_tools });
				$.cookie(st_cookieTool, sta_tools, { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
			} else {
				// 它为全不选按钮

				$('.lb').parents('.indexbox').addClass('active');

				$("#allcheck").trigger('click');
				$(".cb").removeAttr('checked');
				$('.lb').parents('.indexbox').toggleClass('active');

				this.setState({ tools: [] });
				$.cookie(st_cookieTool, [], { domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000) });
			}
		},
		handleChange: function handleChange(index, mdata) {
			var searchKey = $('#searchTxt').val(index);
		},
		handleNav: function handleNav(tools, cookie_name, menuName) {
			var _this2 = this;

			this.setState({ urls: [] }); // 重置各工具标题链接
			var searchKey = $('#searchTxt').val().trim();

			// 加埋点
			for (var i = 0; i < tools.length; i++) {
				_hmt.push(['_trackEvent', 'tool_' + menuName, 'tool_' + tools[i], 'tool_' + searchKey]);
			}

			// 加记录输入值的埋点
			_vds.push(['setCS3', 'bigData_searchKey', searchKey]);

			// if(searchKey !== '') {

			if (tools.length > 0) {

				if (searchKey !== "") {
					this.saveCookie(cookie_name, searchKey);
				}

				var check_tools = tools;

				var opt = {
					key: searchKey,
					tools: check_tools
				};
				rest.nav.read('url', opt).done(function (data) {
					_this2.setState({ urls: data, error: false, errortxt: '' });
					$('.gotolink').trigger('click');

					var new_Obj = {};
					for (var i = 0; i < check_tools.length; i++) {
						for (var j = 0; j < data.length; j++) {
							if (check_tools[i] === data[j].name) {
								new_Obj[check_tools[i]] = data[j].url;
								break;
							}
						}
					}
					_this2.setState({ name_url_obj: new_Obj });
				});
			} else {
				// 出错
				var errortxt = '请选择下方工具完成导航操作';
				this.setState({ error: true, errortxt: errortxt });
			}

			// } else {
			// 出错
			// var errortxt = '请填写搜索关键字';
			// this.setState({error: true, errortxt: errortxt});
			// }
		},
		openLink: function openLink(toolName, menuName, tool_url, cookie_name, elem, tools, allLength) {
			var _this3 = this;

			var searchKey = $('#searchTxt').val().trim();

			_hmt.push(['_trackEvent', 'tool_' + menuName, 'tool_' + toolName, 'tool_' + searchKey]);

			if (searchKey !== '') {
				this.saveCookie(cookie_name, searchKey);
			}

			var opt = {
				key: searchKey,
				tools: toolName
			};
			rest.nav.read('url', opt).done(function (data) {
				_this3.setState({ error: false, errortxt: '' });
				var cur_tool_url = data[0].url;
				window.open(cur_tool_url, "_blank");
			});

			this.handleCheckboxTrue(elem, toolName, tools, allLength);
		},

		render: function render() {
			var _this4 = this;

			var urlList = function urlList(name, url, name_url_obj, elem, tools, allLength) {
				var name_url_obj_ = name_url_obj;
				var name_url = name_url_obj_[name];
				var toolName = name;
				if (name_url) {
					return (// name_url
						React.createElement(
							'a',
							{ target: '_blank', onClick: function onClick(e) {
									return _this4.openLink(toolName, _this4.state.menuName, name_url, _this4.state.cookieName, elem, tools, allLength);
								} },
							toolName
						)
					);
				} else {
					return (// url
						React.createElement(
							'a',
							{ target: '_blank', onClick: function onClick(e) {
									return _this4.openLink(toolName, _this4.state.menuName, url, _this4.state.cookieName, elem, tools, allLength);
								} },
							toolName
						)
					);
				}
			};
			var checkboxShow = function checkboxShow(index_name, elem, tools) {
				var temp_cb;
				if (tools.length > 0) {
					for (var i = 0; i < tools.length; i++) {
						if (index_name == tools[i]) {
							temp_cb = React.createElement('input', { type: 'checkbox', id: 'cb' + elem, className: 'cb', checked: true });
							break;
						} else {
							temp_cb = React.createElement('input', { type: 'checkbox', id: 'cb' + elem, className: 'cb' });
						}
					}
				} else {
					temp_cb = React.createElement('input', { type: 'checkbox', id: 'cb' + elem, className: 'cb' });
				}
				return temp_cb;
			};
			var isActive = function isActive(indexName, tools) {
				var temp_cl;
				if (tools.length > 0) {
					for (var i = 0; i < tools.length; i++) {
						if (tools[i] == indexName) {
							temp_cl = "indexbox active";
							break;
						} else temp_cl = "indexbox";
					}
				} else {
					temp_cl = "indexbox";
				}
				return temp_cl;
			};
			return React.createElement(
				'div',
				{ className: 'big-data h' },
				React.createElement(
					'div',
					{ className: 'container' },
					React.createElement(
						'div',
						{ className: 'panel' },
						React.createElement(
							'div',
							{ className: 'panel-body' },
							React.createElement(
								'div',
								{ className: 'mod-top' },
								React.createElement(
									'div',
									{ className: 'top' },
									React.createElement('img', { src: paths.rcn.api + "/img/data-logo.png" })
								),
								React.createElement(
									'div',
									{ className: 'main' },
									React.createElement(
										'div',
										{ className: 'searchbox' },
										React.createElement(
											'div',
											{ className: 'none' },
											this.state.urls.map(function (index, elem) {
												return React.createElement(
													'a',
													{ href: index.url, target: '_blank' },
													React.createElement(
														'li',
														{ className: 'gotolink' },
														index.name
													)
												);
											})
										),
										React.createElement(
											'div',
											{ className: 'ovh' },
											React.createElement(
												'div',
												{ className: 'c-search', id: 'searchbox' },
												React.createElement('input', { type: 'text', 'growing-track': 'true', className: 's-input', placeholder: '请输入您要搜索的关键词', id: 'searchTxt',
													onFocus: function onFocus(e) {
														return e.target.select();
													},
													onKeyDown: function onKeyDown(e) {
														return e.keyCode === 13 && _this4.handleNav(_this4.state.tools, _this4.state.cookieName, _this4.state.menuName);
													} }),
												React.createElement(
													'span',
													{ className: 's-btn', onClick: function onClick(e) {
															return _this4.handleNav(_this4.state.tools, _this4.state.cookieName, _this4.state.menuName);
														} },
													React.createElement('span', { className: 'iconfont icon-sousuo' })
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'histroybox' },
										React.createElement(
											'span',
											{ className: 'tit' },
											'历史搜索：'
										),
										this.state.mcookie.map(function (index, elem) {
											return React.createElement(
												'span',
												{ className: 'txt', title: index,
													onClick: function onClick(e) {
														return _this4.handleChange(index, _this4.state.mdata);
													} },
												index
											);
										})
									)
								)
							)
						),
						React.createElement('div', { className: 'mod-line' }),
						React.createElement(
							'div',
							{ className: 'mod-bottom' },
							React.createElement(
								'div',
								{ className: 'titbox' },
								React.createElement(
									'span',
									{ className: this.state.error ? "txt" : "txt none" },
									this.state.errortxt
								),
								React.createElement(
									'div',
									{ className: 'c-checkbox fl' },
									React.createElement('input', { type: 'checkbox', id: 'allcheck' }),
									React.createElement('label', { onClick: function onClick(e) {
											return _this4.handleAllCheckbox(_this4.state.mdata, _this4.state.tools);
										} }),
									React.createElement(
										'span',
										{ id: 'allchecktxt' },
										'全选'
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'index-container' },
								this.state.mdata.map(function (index, elem) {
									return React.createElement(
										'div',
										{ className: isActive(index.name, _this4.state.tools) },
										React.createElement(
											'div',
											{ className: 'headbox' },
											urlList(index.name, index.url, _this4.state.name_url_obj, elem, _this4.state.tools, _this4.state.mdata.length),
											React.createElement(
												'div',
												{ className: 'c-checkbox fr' },
												checkboxShow(index.name, elem, _this4.state.tools, _this4.state.tools),
												React.createElement('label', { id: 'lb' + elem, className: 'lb', onClick: function onClick(e) {
														return _this4.handleCheckbox(elem, index.name, _this4.state.tools, _this4.state.mdata.length);
													} })
											)
										),
										React.createElement(
											'p',
											{ className: 'contbox' },
											index.info
										)
									);
								})
							),
							React.createElement(
								'div',
								{ className: 'warmbox' },
								React.createElement(
									'div',
									{ className: 'warmtxt' },
									'如果您有经常使用，而我们未收录的导航，请点击',
									React.createElement(
										'a',
										{ href: paths.rcn.api + "/feedback#/nav", target: '_blank' },
										'导航申请'
									)
								)
							)
						)
					)
				)
			);
		}
	});

	return Comp;
});