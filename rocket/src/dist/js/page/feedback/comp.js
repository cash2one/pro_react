'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 用户反馈 - 问题反馈、媒体申请、导航申请公用组件
 */define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js'], function (mods, r, Modal) {

	var rest = r.rcn({
		stringifyData: false
	});

	var ex_rest = r.ex({
		// stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	var Feedback = React.createClass({
		displayName: 'Feedback',

		getInitialState: function getInitialState() {
			return {
				tabIndex: 0,
				warn: false,
				warntxt: '',
				com_uuid: '',
				result: {},
				path_name: '',
				tipTxt: '',
				noBtn: true,

				media_type: 'ogc'
			};
		},

		componentDidMount: function componentDidMount() {
			var _this = this;

			$('.frame-body-right').addClass('v2');

			var hash_path = window.location.hash.substring(2);
			var beg_path = hash_path.lastIndexOf('/') + 1;
			var end_path = hash_path.lastIndexOf('?');
			var path_name = hash_path.substring(beg_path, end_path);

			this.setState({ path_name: path_name });

			if (path_name == 'problem') {
				this.setState({ tabIndex: 1 });
				$('.tabli').eq(0).addClass('active').siblings().removeClass('active');
			} else if (path_name == 'media') {
				this.setState({ tabIndex: 2 });
				$('.tabli').eq(1).addClass('active').siblings().removeClass('active');
				this.state.result.media_type = 'ogc';
			} else if (path_name == 'nav') {
				this.setState({ tabIndex: 3 });
				$('.tabli').eq(2).addClass('active').siblings().removeClass('active');
			}

			rest.user.read().done(function (user) {
				_this.setState({ com_uuid: "xiaomitv" });
			});

			// ex_rest.media.read('top').done(media => {
			// 	this.setState({mediaArr: media});
			// })
		},

		validate: function validate(tabIndex) {
			var self = this;

			var formid;
			var validator;

			if (tabIndex === 1) {

				formid = "#problem_fb";

				validator = $(formid).validate({
					rules: {
						p_desc: {
							required: true
						}
					},
					messages: {
						p_desc: {
							required: "问题描述不能为空"
						}
					}
				});
			} else if (tabIndex === 2) {

				formid = "#media_fb";

				validator = $(formid).validate({
					rules: {
						ogc_media_name: {
							required: true
						},
						ugc_media_name: {
							required: true
						},
						web_link: {
							required: true
						},
						media_id: {
							required: true
						}
					},
					messages: {
						ogc_media_name: {
							required: "媒体名称不能为空"
						},
						ugc_media_name: {
							required: "媒体名称不能为空"
						},
						web_link: {
							required: "网站链接不能为空"
						},
						media_id: {
							required: "媒体ID不能为空"
						}
					}
				});
			} else if (tabIndex === 3) {

				formid = "#nav_fb";

				validator = $(formid).validate({
					rules: {
						nav_name: {
							required: true
						},
						web_link: {
							required: true
						}
					},
					messages: {
						nav_name: {
							required: "导航名称不能为空"
						},
						web_link: {
							required: "网站链接不能为空"
						}
					}
				});
			}

			return validator;
		},

		handleConfirm: function handleConfirm(tabIndex, formid, com_uuid, result) {
			var _this2 = this;

			if (this.validate(tabIndex).form()) {

				var company_uuid = com_uuid;

				var opt = {
					type: formid,
					content: JSON.stringify(result),
					company_uuid: company_uuid
				};

				if (tabIndex == 2) {
					var platform = this.state.platform;
					var media_rank = this.state.media_rank;
					var media_category = this.state.media_category;
					var produce_category = this.state.produce_category;

					if (!media_rank || media_rank == '' || !media_category || media_category == '' || !produce_category || produce_category == '') {

						if (this.state.media_type == 'ogc') {
							this.setState({ warn: true, warntxt: '媒体等级、媒体分类、产品分类为必选字段' });
						} else {
							if (platform || platform == '') {
								this.setState({ warn: true, warntxt: '托管平台、媒体等级、媒体分类、产品分类为必选字段' });
							}
						}
					} else {
						rest.feedback.create(opt).done(function (data) {
							// 提交成功
							if (data.result) {
								$('#tipshow').modal('show');
								_this2.setState({ tipTxt: '提交成功！', warn: false });
								var time = setTimeout(function () {
									$('#tipshow').modal('hide');
									_this2.setState({ tipTxt: '' });
									$('.formReset')[0].reset();
								}, 800);

								_this2.setState({ result: {} });

								_this2.setState({ platform: '', media_rank: '', media_category: '', produce_category: '' });
							}
						}).error(function (data) {
							$('#tipshow').modal('show');
							_this2.setState({ tipTxt: data.responseJSON.msg });
						});
					}
				} else {
					rest.feedback.create(opt).done(function (data) {
						// 提交成功
						if (data.result) {
							$('#tipshow').modal('show');
							_this2.setState({ tipTxt: '提交成功！', warn: false });
							var time = setTimeout(function () {
								$('#tipshow').modal('hide');
								_this2.setState({ tipTxt: '' });
								$('.formReset')[0].reset();
							}, 800);

							_this2.setState({ result: {} });
						}
					}).error(function (data) {
						$('#tipshow').modal('show');
						_this2.setState({ tipTxt: data.responseJSON.msg });
					});
				}
			}
		},

		handleTab: function handleTab(nowIndex, tabIndex, pathName) {
			$('.formReset')[0].reset();
			this.validate(tabIndex).resetForm();
			this.setState({ result: {} });

			var url = window.location.protocol + '//' + window.location.hostname + '/feedback#/' + pathName;
			window.location.href = url;
		},

		handleChange: function handleChange(e, input_name) {
			var value = e.target.value.trim();
			var name = input_name;

			this.state.result[name] = value;
		},

		// 选择生产方式-媒体类型
		handleMediaType: function handleMediaType(type, tabIndex) {
			$('.reset').val('');
			this.validate(tabIndex).resetForm();

			this.setState({ media_type: type, platform: '', ogc_media_name: '', ugc_media_name: '', media_id: '', web_link: '' });

			this.state.result.media_type = type;
			if (type == 'ogc') {
				delete this.state.result.ogc_media_name;
				delete this.state.result.web_link;
			} else {
				delete this.state.result.platform;
				delete this.state.result.ugc_media_name;
				delete this.state.result.media_id;
			}
		},

		// 下拉菜单操作
		handleSelectClick: function handleSelectClick(e, input_name) {
			var id = '#' + input_name;
			$(id).toggle(100);
			$(document).one('click', function () {
				$(id).hide(100);
			});
		},
		handleOptionListClick: function handleOptionListClick(e, input_name) {
			var li_val = $(e.target).context.innerHTML;
			var id = '#' + input_name;
			var name = input_name;

			this.setState(_defineProperty({}, name, li_val));

			this.state.result[name] = li_val;

			$(id).hide(100);
		},

		render: function render() {
			var _this3 = this;

			var pageShow = function pageShow() {
				if (_this3.state.tabIndex === 0) {
					return React.createElement('div', { className: 'feedback-page' });
				} else if (_this3.state.tabIndex === 1) {
					return React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'tab-content panel-body content' },
							React.createElement(
								'div',
								{ className: 'col-xs-6 col-xs-offset-3' },
								React.createElement(
									'form',
									{ id: 'problem_fb', className: 'formReset problem-form w' },
									React.createElement(
										'div',
										{ className: 'clear pf-title mb10' },
										React.createElement('span', { className: 'iconfont icon-wenhao' }),
										React.createElement(
											'span',
											{ className: 'ic-txt' },
											'请问有什么可以帮助到您的吗？'
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement('textarea', { className: 'form-control', rows: '10',
											placeholder: '亲爱的运营员：我们时刻关注您的建议，不断优化产品，为您提供优质服务。请简要描述您遇到的问题，我们会尽快为您解决。',
											name: 'p_desc', id: 'p_desc', onChange: function onChange(e) {
												_this3.handleChange(e, "problem_desc");
											} })
									),
									React.createElement(
										'div',
										{ className: 'picbox none' },
										React.createElement(
											'span',
											{ className: 'addbtn' },
											React.createElement('i', { className: 'iconfont icon-jiahao' }),
											React.createElement(
												'span',
												null,
												'添加图片'
											)
										),
										React.createElement(
											'span',
											{ className: 'pics' },
											React.createElement('img', { src: 'img/del1.png' }),
											React.createElement(
												'span',
												null,
												'预览'
											)
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer' },
							React.createElement(
								'div',
								{ className: 'pull-right' },
								React.createElement(
									'button',
									{ className: 'btn btn-primary btn-lg', onClick: function onClick(e) {
											return _this3.handleConfirm(1, "problem_fb", _this3.state.com_uuid, _this3.state.result);
										} },
									'提交'
								)
							)
						)
					);
				} else if (_this3.state.tabIndex === 2) {
					return React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'tab-content panel-body content' },
							React.createElement(
								'div',
								{ className: 'col-xs-6 col-xs-offset-3' },
								React.createElement(
									'form',
									{ id: 'media_fb', className: 'fb-container formReset media-form w form-horizontal' },
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'm_name', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'生产方式：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-4 control-label' },
											React.createElement('span', { className: _this3.state.media_type == 'ogc' ? "c-rd mr8 active" : "c-rd mr8", onClick: function onClick(e) {
													return _this3.handleMediaType('ogc', _this3.state.tabIndex);
												} }),
											React.createElement(
												'span',
												{ className: 'c-rd-txt unselect' },
												'职业媒体（ogc）'
											)
										),
										React.createElement(
											'div',
											{ className: 'col-xs-4 control-label' },
											React.createElement('span', { className: _this3.state.media_type == 'ugc' ? "c-rd mr8 active" : "c-rd mr8", onClick: function onClick(e) {
													return _this3.handleMediaType('ugc', _this3.state.tabIndex);
												} }),
											React.createElement(
												'span',
												{ className: 'c-rd-txt unselect' },
												'自媒体（ugc）'
											)
										)
									),
									_this3.state.media_type == 'ogc' ? React.createElement(
										'div',
										null,
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'ogc_media_name', className: 'col-xs-2 control-label' },
												React.createElement(
													'i',
													null,
													'*'
												),
												'媒体名称：'
											),
											React.createElement(
												'div',
												{ className: 'col-xs-10' },
												React.createElement('input', { type: 'text', name: 'ogc_media_name', id: 'ogc_media_name', className: 'form-control reset', placeholder: '请输入媒体名称',
													onChange: function onChange(e) {
														_this3.handleChange(e, "ogc_media_name");
													} })
											)
										),
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'web_link', className: 'col-xs-2 control-label' },
												React.createElement(
													'i',
													null,
													'*'
												),
												'网站链接：'
											),
											React.createElement(
												'div',
												{ className: 'col-xs-10' },
												React.createElement('input', { type: 'text', name: 'web_link', id: 'web_link', className: 'form-control reset', placeholder: '请输入网站链接',
													onChange: function onChange(e) {
														_this3.handleChange(e, "web_link");
													} })
											)
										)
									) : React.createElement(
										'div',
										null,
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'platform', className: 'col-xs-2 control-label' },
												React.createElement(
													'i',
													null,
													'*'
												),
												'托管平台：'
											),
											React.createElement(
												'div',
												{ className: 'col-xs-10' },
												React.createElement(
													'div',
													{ className: 'dropdown-v2 idx4' },
													React.createElement(
														'div',
														{ className: 'select', type: 'button', onClick: function onClick(e) {
																_this3.handleSelectClick(e, "platform");
															} },
														React.createElement('input', { className: 'txt', placeholder: '选择', name: 'platform', disabled: true, value: _this3.state.platform }),
														React.createElement(
															'span',
															{ className: 'ic' },
															React.createElement('span', { className: 'corner' })
														)
													),
													React.createElement(
														'ul',
														{ className: 'option none', id: 'platform' },
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'新浪微博'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'微信'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'百度百家'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'一点资讯'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'雪球'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'今日头条'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'i黑马'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'虎嗅'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'极客公园'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'36氪'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'雷锋网'
														),
														React.createElement(
															'li',
															{ onClick: function onClick(e) {
																	_this3.handleOptionListClick(e, "platform");
																} },
															'钛极客'
														)
													)
												)
											)
										),
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'ugc_media_name', className: 'col-xs-2 control-label' },
												React.createElement(
													'i',
													null,
													'*'
												),
												'媒体名称：'
											),
											React.createElement(
												'div',
												{ className: 'col-xs-10' },
												React.createElement('input', { type: 'text', name: 'ugc_media_name', id: 'ugc_media_name', className: 'form-control reset', placeholder: '请输入媒体名称',
													onChange: function onChange(e) {
														_this3.handleChange(e, "ugc_media_name");
													} })
											)
										),
										React.createElement(
											'div',
											{ className: 'form-group' },
											React.createElement(
												'label',
												{ 'for': 'media_id', className: 'col-xs-2 control-label' },
												React.createElement(
													'i',
													null,
													'*'
												),
												'媒体ID：'
											),
											React.createElement(
												'div',
												{ className: 'col-xs-10' },
												React.createElement('input', { type: 'text', name: 'media_id', id: 'media_id', className: 'form-control reset', placeholder: '请输入媒体ID',
													onChange: function onChange(e) {
														_this3.handleChange(e, "media_id");
													} })
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'media_rank', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'媒体等级：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement(
												'div',
												{ className: 'dropdown-v2 idx3' },
												React.createElement(
													'div',
													{ className: 'select', type: 'button', onClick: function onClick(e) {
															_this3.handleSelectClick(e, "media_rank");
														} },
													React.createElement('input', { className: 'txt', placeholder: '选择', name: 'media_rank', disabled: true, value: _this3.state.media_rank }),
													React.createElement(
														'span',
														{ className: 'ic' },
														React.createElement('span', { className: 'corner' })
													)
												),
												React.createElement(
													'ul',
													{ className: 'option none', id: 'media_rank' },
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_rank");
															} },
														'甲'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_rank");
															} },
														'乙'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_rank");
															} },
														'丙'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_rank");
															} },
														'丁'
													)
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'media_category', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'媒体分类：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement(
												'div',
												{ className: 'dropdown-v2 idx2' },
												React.createElement(
													'div',
													{ className: 'select', type: 'button', onClick: function onClick(e) {
															_this3.handleSelectClick(e, "media_category");
														} },
													React.createElement('input', { className: 'txt', placeholder: '选择', name: 'media_category', disabled: true, value: _this3.state.media_category }),
													React.createElement(
														'span',
														{ className: 'ic' },
														React.createElement('span', { className: 'corner' })
													)
												),
												React.createElement(
													'ul',
													{ className: 'option none', id: 'media_category' },
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_category");
															} },
														'纸媒'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_category");
															} },
														'广播'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_category");
															} },
														'电视'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_category");
															} },
														'网站'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "media_category");
															} },
														'移动互联网（移动app）'
													)
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'produce_category', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'产品分类：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement(
												'div',
												{ className: 'dropdown-v2 idx1' },
												React.createElement(
													'div',
													{ className: 'select', type: 'button', onClick: function onClick(e) {
															_this3.handleSelectClick(e, "produce_category");
														} },
													React.createElement('input', { className: 'txt', placeholder: '选择', name: 'produce_category', disabled: true, value: _this3.state.produce_category }),
													React.createElement(
														'span',
														{ className: 'ic' },
														React.createElement('span', { className: 'corner' })
													)
												),
												React.createElement(
													'ul',
													{ className: 'option none', id: 'produce_category' },
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'门户'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'博客'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'播客'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'社交网络'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'微博'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'论坛'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'问答'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'贴吧'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'新闻客户端'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'移动直播'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'杂志'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'报纸'
													),
													React.createElement(
														'li',
														{ onClick: function onClick(e) {
																_this3.handleOptionListClick(e, "produce_category");
															} },
														'电商'
													)
												)
											)
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'media_intro', className: 'col-xs-2 control-label' },
											'  媒体简介：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement('textarea', { className: 'form-control', rows: '6', placeholder: '',
												name: 'p_desc', id: 'p_desc', onChange: function onChange(e) {
													_this3.handleChange(e, "media_intro");
												} })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'media_tag', className: 'col-xs-2 control-label' },
											'  媒体标签：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10 input-icon-form' },
											React.createElement('input', { type: 'text', name: 'media_tag', id: 'media_tag', className: 'form-control', placeholder: '请输入媒体标签',
												onChange: function onChange(e) {
													_this3.handleChange(e, "media_tag");
												} })
										)
									),
									React.createElement(
										'div',
										{ className: _this3.state.warn ? "warn" : "warn none" },
										_this3.state.warntxt
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer' },
							React.createElement(
								'div',
								{ className: 'pull-right' },
								React.createElement(
									'button',
									{ className: 'btn btn-primary btn-lg', onClick: function onClick(e) {
											return _this3.handleConfirm(2, "media_fb", _this3.state.com_uuid, _this3.state.result);
										} },
									'提交'
								)
							)
						)
					);
				} else if (_this3.state.tabIndex === 3) {
					// 导航申请
					return React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							{ className: 'tab-content panel-body content' },
							React.createElement(
								'div',
								{ className: 'col-xs-6 col-xs-offset-3' },
								React.createElement(
									'form',
									{ id: 'nav_fb', className: 'fb-container nav-fb formReset nav-form w form-horizontal' },
									React.createElement(
										'div',
										{ className: 'form-group mt10' },
										React.createElement(
											'label',
											{ 'for': 'nav_name', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'导航名称：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement('input', { type: 'text', name: 'nav_name', id: 'nav_name', className: 'form-control', placeholder: '请输入导航名称',
												onChange: function onChange(e) {
													_this3.handleChange(e, "nav_name");
												} })
										)
									),
									React.createElement(
										'div',
										{ className: 'form-group' },
										React.createElement(
											'label',
											{ 'for': 'web_link', className: 'col-xs-2 control-label' },
											React.createElement(
												'i',
												null,
												'*'
											),
											'网站链接：'
										),
										React.createElement(
											'div',
											{ className: 'col-xs-10' },
											React.createElement('input', { type: 'text', name: 'web_link', id: 'web_link', className: 'form-control', placeholder: '请输入网站链接',
												onChange: function onChange(e) {
													_this3.handleChange(e, "nav_link");
												} })
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer' },
							React.createElement(
								'div',
								{ className: 'pull-right' },
								React.createElement(
									'button',
									{ className: 'btn btn-primary btn-lg', onClick: function onClick(e) {
											return _this3.handleConfirm(3, "nav_fb", _this3.state.com_uuid, _this3.state.result);
										} },
									'提交'
								)
							)
						)
					);
				}
			};
			return React.createElement(
				'div',
				{ className: 'feedback-page container' },
				React.createElement(
					'div',
					{ className: 'panel panel-default gridbox' },
					React.createElement(
						'div',
						{ className: 'tab' },
						React.createElement(
							'ul',
							null,
							React.createElement(
								'li',
								{ className: 'tabli active', onClick: function onClick(e) {
										return _this3.handleTab(1, _this3.state.tabIndex, "problem");
									} },
								'问题反馈'
							),
							React.createElement(
								'li',
								{ className: 'tabli', onClick: function onClick(e) {
										return _this3.handleTab(2, _this3.state.tabIndex, "media");
									} },
								'媒体申请'
							),
							React.createElement(
								'li',
								{ className: 'tabli', onClick: function onClick(e) {
										return _this3.handleTab(3, _this3.state.tabIndex, "nav");
									} },
								'导航申请'
							)
						)
					),
					pageShow(),
					React.createElement(
						Modal,
						{ title: '温馨提示', id: 'tipshow', noBtn: true, modalSm: true },
						React.createElement(
							'div',
							{ className: 'm-msg' },
							React.createElement(
								'p',
								null,
								this.state.tipTxt
							)
						)
					)
				)
			);
		}
	});

	return Feedback;
});