'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/loader.js', paths.ex.page + '/advices/base/report/edit/event-table.js', paths.ex.page + '/advices/base/report/edit/line-chart.js', paths.ex.page + '/advices/base/report/edit/pie-chart.js', paths.ex.page + '/advices/base/report/edit/art-table.js', paths.ex.page + '/advices/base/report/view/pie.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, R, Modal, Loader, EventTable, Line, Pie, ArtTable, Piee) {
	var React = mods.ReactPack.default;

	var rest = R.ex();

	var score = {
		"1": 10,
		"2": 5,
		"3": 2,
		"4": 1
	};

	var rTag = /\<[^<>]+\>|\<\/[^<>]\>/g;
	function parseTag(str) {
		if (str) return str.replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return '';
	}

	var version = {
		submitTrans: function submitTrans(data, save) {
			save = $.extend({}, save);
			var map = data.mids,
			    obj = {};
			if (!map) {
				save.artTrend = {};
			} else {
				if (save.artTrend) {
					map = map.reduce(function (o, item) {
						o[item['name']] = item['id'];
						return o;
					}, {});
					Object.keys(save.artTrend).forEach(function (name) {
						var id = map[name];
						if (id) {
							obj[id] = 1;
						}
					});
					save.artTrend = obj;
				}
			}
			return save;
		}
	};

	var Edit = React.createClass({
		displayName: 'Edit',

		contextTypes: {
			router: React.PropTypes.object.isRequired
		},
		getInitialState: function getInitialState() {
			return {
				save: {
					title: '',
					date: '',
					events: [],
					summary: {
						event_index: '',
						event_desc: ''
					},
					focus_articles: [],
					articles_statis: {},
					artTrend: {}
				},
				data: {},
				loading: true,
				submitLoading: false,
				check: false,
				tips: ''
			};
		},
		componentWillMount: function componentWillMount() {
			var date = this.props.location.query.date;
			if (date) this.setState({ date: date });
		},
		componentDidMount: function componentDidMount() {
			var _this = this;

			if (!this.state.date) return;
			this.getSaveData().done(function (dat) {
				_this.setState({ loading: false });
				_this.setState({ save: dat });
				_this.getData();
			});
		},
		getSaveData: function getSaveData() {
			var date = this.state.date;
			return rest.report.read({
				day: date
			});
		},
		getData: function getData() {
			var _this2 = this;

			var date = this.state.date;
			// 获取事件列表
			rest.report.read('events', {
				day: date
			}).done(function (data) {
				_this2.setState({ data: $.extend({}, _this2.state.data, { events: data }) });
			});
			// 获取媒体
			rest.media.read('top').done(function (data) {
				_this2.setState({ data: $.extend({}, _this2.state.data, { mids: data }) });
			});
			// 文章列表
			rest.report.read('articles', {
				day: date
			}).done(function (data) {
				_this2.setState({ data: $.extend({}, _this2.state.data, { 'focus_articles': data }) });
			});
		},
		handleEventRank: function handleEventRank(evId, rank) {
			var data = this.state.data,
			    dataEvents = data.events;
			if (dataEvents) {
				dataEvents = data.events.slice();
				dataEvents.forEach(function (ev) {
					if (ev.id == evId) ev.rank = rank;
				});
				this.setState({ data: $.extend({}, data, { events: dataEvents }) });
			}
		},
		handleSelectEvent: function handleSelectEvent(id) {
			var _this3 = this;

			var event,
			    data = this.state.data,
			    save = this.state.save,
			    dataEvents = data.events ? data.events : [],
			    saveEvents = save.events ? save.events : [],
			    has = false,
			    idx;
			dataEvents.forEach(function (ev) {
				if (ev.id == id) event = ev;
			});
			saveEvents.forEach(function (ev, i) {
				if (ev.id == id) {
					has = true;
					idx = i;
				}
			});
			if (has) {
				saveEvents = [].concat(_toConsumableArray(saveEvents.slice(0, idx)), _toConsumableArray(saveEvents.slice(idx + 1)));
			} else {
				if (event) saveEvents = [].concat(_toConsumableArray(saveEvents), [event]);
			}
			this.setState({ save: $.extend({}, save, { events: saveEvents }) }, function () {
				if (_this3.refs.eventIndex.value == '') {
					var summary = _this3.state.save['summary'];
					if (!summary) {
						summary = {};
					} else {
						summary = $.extend({}, summary);
					}
					summary['event_index'] = _this3.calIndex();
					_this3.setState({ save: $.extend({}, _this3.state.save, { summary: summary }) });
				}
			});
		},
		handleMidSelect: function handleMidSelect(mid) {
			var _this4 = this;

			var save = this.state.save,
			    saveArtTrend = save.artTrend ? $.extend({}, save.artTrend) : {};
			if (save['version'] == 3) {
				if (saveArtTrend[mid.id]) {
					delete saveArtTrend[mid.id];
				} else {
					saveArtTrend[mid.id] = 1;
				}
				this.setState({ save: $.extend({}, save, { artTrend: saveArtTrend }) });
			} else {
				if (saveArtTrend[mid.name]) {
					delete saveArtTrend[mid.name];
					this.setState({ save: $.extend({}, save, { artTrend: saveArtTrend }) });
				} else {
					this.setState({ loading: true });
					rest.article.read('charts', {
						mid: mid.id,
						time: this.state.date
					}).done(function (dat) {
						saveArtTrend[mid.name] = dat;
						_this4.setState({ save: $.extend({}, save, { artTrend: saveArtTrend }), loading: false });
					});
				}
			}
		},
		handleSelectArt: function handleSelectArt(uuid) {
			var key = 'focus_articles';
			var dataArt = this.state.data[key],
			    saveArt = this.state.save[key],
			    idx;
			if (!saveArt) {
				saveArt = [];
			} else {
				saveArt = saveArt.slice();
			}
			var uuids = saveArt.map(function (s) {
				return s.uuid;
			});
			idx = uuids.indexOf(uuid);
			if (idx != -1) {
				saveArt = [].concat(_toConsumableArray(saveArt.slice(0, idx)), _toConsumableArray(saveArt.slice(idx + 1)));
			} else {
				saveArt = [].concat(_toConsumableArray(saveArt), _toConsumableArray(dataArt.filter(function (a) {
					return a.uuid == uuid;
				})));
			};
			this.setState({ save: $.extend({}, this.state.save, _defineProperty({}, key, saveArt)) });
		},
		calIndex: function calIndex() {
			var save = this.state.save || {},
			    saveEvents = save['events'] || [],
			    count = 0;
			saveEvents.forEach(function (ev) {
				var rank = ev['rank'],
				    num = ev['article_count'];
				count += +score[rank] * +num;
			});
			return count;
		},
		openSubmitModal: function openSubmitModal() {
			$('#submitModal').modal('show');
		},
		submitHandler: function submitHandler() {
			var _this5 = this;

			var save = this.state.save;
			this.setState({ submitLoading: true });
			this.getSaveData().done(function (dat) {
				// fix
				if (dat.status != 3) {
					if (dat['version'] != 3) {
						save = version.submitTrans(_this5.state.data, save);
					}
					rest.report.update('submit', {
						report: $.extend({}, save, {
							"version": 3,
							"status": 3
						})
					}).complete(function (xhr) {
						if (xhr.status == 200) {
							$('#submitModal').modal('hide');
							_this5.openTips('提交成功');
							setTimeout(function () {
								$('#tipModal').modal('hide');
								_this5.context.router.push({
									pathname: 'report/build'
								});
							}, 800);
						}
					});
				}
			}).always(function () {
				_this5.setState({ submitLoading: false });
			});
		},
		saveHandler: function saveHandler() {
			var _this6 = this;

			var save = this.state.save;
			this.setState({ loading: true });

			this.getSaveData().done(function (dat) {
				// fix
				if (dat.status != 3) {
					if (dat['version'] != 3) {
						save = version.submitTrans(_this6.state.data, save);
					}
					rest.report.update({
						report: $.extend({}, save, {
							"version": 3,
							"status": 2
						})
					}).complete(function (xhr) {
						if (xhr.status == 200) {
							_this6.openTips('保存成功');
							setTimeout(function () {
								return $('#tipModal').modal('hide');
							}, 800);
						}
					});
				}
			}).always(function () {
				_this6.setState({ loading: false });
			});
		},
		openTips: function openTips(tips) {
			this.setState({ tips: tips });
			$('#tipModal').modal('show');
		},
		renderIndex: function renderIndex() {
			var _this7 = this;

			var count = this.calIndex(),
			    save = this.state.save;

			var handleChange = function handleChange(e) {
				var event_index = void 0,
				    num = e.target.value;
				if (num != '') {
					event_index = num;
				} else {
					event_index = count;
				}
				var summary = _this7.state.save['summary'];
				if (!summary) {
					summary = {};
				} else {
					summary = $.extend({}, summary);
				}
				summary['event_index'] = event_index;
				_this7.setState({ save: $.extend({}, _this7.state.save, { summary: summary }) });
			};

			var handleKeyDown = function handleKeyDown(e) {
				if (!(e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 8)) {
					e.preventDefault();
				}
			};

			return React.createElement('input', { type: 'text', className: 'tc', ref: 'eventIndex', placeholder: "参考值：" + count, onKeyDown: handleKeyDown, onChange: handleChange });
		},
		renderSummary: function renderSummary() {
			var _this8 = this;

			var save = this.state.save,
			    txt = save['summary'] ? save['summary']['event_desc'] ? save['summary']['event_desc'] : '' : '';
			var handleChange = function handleChange(e) {
				var val = e.target.value;
				var sum = $.extend({}, save.summary || {});
				sum['event_desc'] = val;
				_this8.setState({ save: $.extend({}, save, { 'summary': sum }) });
			};
			return React.createElement('textarea', { rows: '4', value: txt, onChange: handleChange });
		},
		render: function render() {
			var _this9 = this;

			var save = this.state.save,
			    data = this.state.data,
			    date = this.state.date;

			var setTitle = function setTitle(val) {
				_this9.setState({ save: $.extend({}, save, {
						title: val
					}) });
			};
			return React.createElement(
				'div',
				{ className: 'advices-base-report-detail' },
				React.createElement(
					'div',
					{ className: 'con' },
					React.createElement(
						'div',
						{ className: 'panel panel-default' },
						React.createElement(
							'div',
							{ className: 'panel-heading' },
							React.createElement(
								'h3',
								{ className: 'panel-title report-title' },
								React.createElement(
									'span',
									null,
									save.title
								),
								React.createElement(
									'span',
									{ className: 'date ml10' },
									save.date
								)
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								{ className: 'group' },
								React.createElement(
									'div',
									{ className: 'group-title' },
									React.createElement(
										'span',
										null,
										'今日事件综述'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(
										'div',
										{ className: 'summary-grid s2' },
										React.createElement(
											'div',
											{ className: 'index' },
											React.createElement(Piee, { save: save, data: data })
										),
										React.createElement(
											'div',
											{ className: 'summary' },
											React.createElement(
												'div',
												{ className: 'title' },
												React.createElement(
													'span',
													null,
													'综述'
												)
											),
											React.createElement(
												'div',
												{ className: 'edit' },
												save.summary ? save.summary['event_desc'] || '' : ''
											)
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
										'今日趋势图'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(Line, { save: save, data: data })
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
										'分布统计图'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(Pie, { save: save })
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
										'文章列表'
									)
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									(save['focus_articles'] || []).length > 0 ? React.createElement(
										'table',
										{ className: 'table arts-table' },
										React.createElement(
											'thead',
											null,
											React.createElement(
												'tr',
												null,
												React.createElement(
													'th',
													{ className: 'tc' },
													'序号'
												),
												React.createElement(
													'th',
													null,
													'标题'
												),
												React.createElement(
													'th',
													null,
													'文章类型'
												),
												React.createElement(
													'th',
													null,
													'作者'
												),
												React.createElement(
													'th',
													null,
													'发布时间'
												)
											)
										),
										React.createElement(
											'tbody',
											null,
											save['focus_articles'].map(function (art, idx) {
												return React.createElement(
													'tr',
													{ key: idx },
													React.createElement(
														'td',
														{ className: 'tc' },
														idx + 1
													),
													React.createElement(
														'td',
														null,
														React.createElement(
															'a',
															{ className: 'art-title texthidden', target: '_blank', href: art.url },
															parseTag(art.title)
														)
													),
													React.createElement(
														'td',
														{ 'data-emotion': true },
														art.emotion
													),
													React.createElement(
														'td',
														{ 'data-author': true },
														art.author
													),
													React.createElement(
														'td',
														null,
														art.create_at
													)
												);
											})
										)
									) : React.createElement(
										'div',
										{ className: 'list-blank-holder' },
										React.createElement(
											'span',
											null,
											'暂无文章'
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer tr' },
							save.status != 3 ? React.createElement(
								'a',
								{ className: 'btn btn-primary btn-lg', onClick: function onClick() {
										$('.frame-body-right').scrollTop(0);
										_this9.context.router.push({
											pathname: 'report/edit',
											query: {
												date: save.date
											}
										});
									} },
								'编辑'
							) : null,
							save.status != 3 ? React.createElement(
								'a',
								{ className: 'btn btn-default btn-lg', onClick: this.openSubmitModal },
								'提交'
							) : null,
							React.createElement(
								'a',
								{ href: '', className: 'btn btn-default btn-lg', onClick: function onClick() {
										_this9.context.router.push({
											pathname: 'report/build'
										});
									} },
								'返回'
							)
						)
					)
				),
				React.createElement(
					Modal,
					{ id: 'submitModal', modalSm: true, confirm: !this.state.submitLoading && this.submitHandler },
					React.createElement(
						'div',
						{ className: 'tc' },
						React.createElement(
							'p',
							null,
							'提交后，日报不可再编辑。'
						),
						React.createElement(
							'p',
							null,
							'提交后，手机app端可对应查看。'
						)
					),
					React.createElement(Loader, { show: this.state.submitLoading })
				),
				React.createElement(
					Modal,
					{ id: 'hasSubmitModal', modalSm: true, warn: 'true', confirm: function confirm() {
							$('#hasSubmitModal').modal('hide');
							window.history.go(-1);
						} },
					React.createElement(
						'p',
						null,
						'此报表已提交，不能再编辑'
					)
				),
				React.createElement(
					Modal,
					{ id: 'tipModal', modalSm: true, noBtn: 'true', warn: 'true' },
					React.createElement(
						'p',
						{ className: 'm-msg' },
						this.state.tips
					)
				),
				React.createElement(Loader, { show: this.state.loading, fix: 'true' })
			);
		}
	});

	return Edit;
});