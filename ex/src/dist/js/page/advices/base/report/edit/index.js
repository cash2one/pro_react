'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/modal.js', paths.rcn.comps + '/loader.js', paths.ex.page + '/advices/base/report/edit/event-table.js', paths.ex.page + '/advices/base/report/edit/line-chart.js', paths.ex.page + '/advices/base/report/edit/pie-chart.js', paths.ex.page + '/advices/base/report/edit/art-table.js', paths.rcn.comps + '/tooltip.js', paths.rcn.lib + '/bootstrap.min.js'], function (mods, R, Modal, Loader, EventTable, Line, Pie, ArtTable, Tooltip) {
	var React = mods.ReactPack.default;

	var rest = R.ex();

	var score = {
		"1": 10,
		"2": 5,
		"3": 2,
		"4": 1
	};

	var Title = React.createClass({
		displayName: 'Title',
		getInitialState: function getInitialState() {
			return {
				edit: false
			};
		},
		editAction: function editAction(e) {
			this.props.editConfirm(e.target.value.slice(0, 20));
			this.setState({ edit: false });
		},
		render: function render() {
			var _this = this;

			var save = this.props.save,
			    edit = function edit() {
				_this.setState({ edit: true }, function () {
					var input = _this.refs.input;
					input.focus();
					if (input.setSelectionRange) input.setSelectionRange(input.value.length, input.value.length);else if (input.createTextRange) {
						var range = input.createTextRange();
						range.collapse(true);
						range.moveEnd('character', input.length);
						range.moveStart('character', input.length);
						range.select();
					}
				});
			};

			if (this.state.edit == false) {
				return React.createElement(
					'h3',
					{ className: 'panel-title report-title' },
					React.createElement(
						'div',
						{ className: 'txt notedit', onClick: edit },
						React.createElement('input', { type: 'text', className: 'form-control', value: save.title }),
						React.createElement('span', { className: 'iconfont icon-bianji' })
					),
					React.createElement(
						'span',
						{ className: 'date' },
						save.date
					)
				);
			} else {
				return React.createElement(
					'h3',
					{ className: 'panel-title report-title' },
					React.createElement(
						'div',
						{ className: 'txt' },
						React.createElement('span', { className: 'iconfont icon-bianji' }),
						React.createElement('input', { type: 'text', className: 'form-control', ref: 'input', defaultValue: save.title, onBlur: this.editAction })
					),
					React.createElement(
						'span',
						{ className: 'date' },
						save.date
					)
				);
			}
		}
	});

	var Mids = React.createClass({
		displayName: 'Mids',
		render: function render() {
			var _this2 = this;

			var data = this.props.data,
			    save = this.props.save,
			    artTrend = save.artTrend || {};
			var key;
			if (save['version'] == 3) {
				key = 'id';
			} else {
				key = 'name';
			}
			return React.createElement(
				'div',
				null,
				data.mids && data.mids.map(function (mid, idx) {
					return React.createElement(
						'div',
						{ className: 'ib mr20 cp', key: idx, onClick: function onClick() {
								return _this2.props.changeMidSelect(mid);
							} },
						React.createElement('span', { className: "c-cb mr5" + (artTrend[mid[key]] ? ' active' : '') }),
						React.createElement(
							'span',
							{ className: 'vm' },
							mid.name
						)
					);
				})
			);
		}
	});

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
			var _this3 = this;

			if (!this.state.date) return;
			this.getSaveData().done(function (dat) {
				_this3.setState({ loading: false });
				// fix
				if (dat['status'] == 3) {
					$('#hasSubmitModal').modal('show');
					$(document).one('hidden.bs.modal', '#hasSubmitModal', function () {
						_this3.context.router.push({
							pathname: 'report/build'
						});
					});
				} else {
					_this3.setState({ save: dat, check: true }, function () {
						var save = _this3.state.save;
						var eventIndex = save['summary'] ? save['summary']['event_index'] ? save['summary']['event_index'] : '' : '';
						_this3.refs.eventIndex.value = eventIndex;
					});
					_this3.getData();
				}
			});
		},
		getSaveData: function getSaveData() {
			var date = this.state.date;
			return rest.report.read({
				day: date
			});
		},
		getData: function getData() {
			var _this4 = this;

			var date = this.state.date;
			// 获取事件列表
			rest.report.read('events', {
				day: date
			}).done(function (data) {
				_this4.setState({ data: $.extend({}, _this4.state.data, { events: data }) });
			});
			// 获取媒体
			rest.media.read('top').done(function (data) {
				_this4.setState({ data: $.extend({}, _this4.state.data, { mids: data }) });
			});
			// 文章列表
			rest.report.read('articles', {
				day: date
			}).done(function (data) {
				_this4.setState({ data: $.extend({}, _this4.state.data, { 'focus_articles': data }) });
			});
		},
		saveHaveEvent: function saveHaveEvent(id) {
			var idx = -1,
			    save = this.state.save || {},
			    events = save['events'] || [];
			for (var i = 0; i < events.length; i++) {
				if (events[i].id == id) {
					idx = i;
					break;
				}
			}
			return idx;
		},
		handleEventRank: function handleEventRank(evId, rank) {
			var _this5 = this;

			var data = this.state.data,
			    dataEvents = data.events;
			if (dataEvents) {
				dataEvents = data.events.slice();
				dataEvents.forEach(function (ev) {
					if (ev.id == evId) {
						ev.rank = rank;
					}
				});
				this.setState({ data: $.extend({}, data, { events: dataEvents }) }, function () {
					var idx = _this5.saveHaveEvent(evId);
					if (idx == -1) {
						_this5.handleSelectEvent(evId);
					} else {
						var saveEvents = _this5.state.save.events.slice();
						saveEvents[idx]['rank'] = rank;
						_this5.setState({ save: $.extend({}, _this5.state.save, { events: saveEvents }) });
					}
				});
			}
		},
		handleSelectEvent: function handleSelectEvent(id) {
			var _this6 = this;

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
				if (_this6.refs.eventIndex.value == '') {
					var summary = _this6.state.save['summary'];
					if (!summary) {
						summary = {};
					} else {
						summary = $.extend({}, summary);
					}
					summary['event_index'] = _this6.calIndex();
					_this6.setState({ save: $.extend({}, _this6.state.save, { summary: summary }) });
				}
			});
		},
		handleMidSelect: function handleMidSelect(mid) {
			var _this7 = this;

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
						_this7.setState({ save: $.extend({}, save, { artTrend: saveArtTrend }), loading: false });
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
			if (!this.state.check) return;
			$('#submitModal').modal('show');
		},
		submitHandler: function submitHandler() {
			var _this8 = this;

			if (!this.state.check) return;
			var save = this.state.save;
			this.setState({ submitLoading: true });
			this.getSaveData().done(function (dat) {
				// fix
				if (dat.status != 3) {
					if (dat['version'] != 3) {
						save = version.submitTrans(_this8.state.data, save);
					}
					rest.report.update('submit', {
						report: $.extend({}, save, {
							"version": 3,
							"status": 3
						})
					}).complete(function (xhr) {
						if (xhr.status == 200) {
							$('#submitModal').modal('hide');
							_this8.openTips('提交成功');
							setTimeout(function () {
								$('#tipModal').modal('hide');
								_this8.context.router.push({
									pathname: 'report/build'
								});
							}, 800);
						}
					});
				}
			}).always(function () {
				_this8.setState({ submitLoading: false });
			});
		},
		saveHandler: function saveHandler() {
			var _this9 = this;

			if (!this.state.check) return;
			var save = this.state.save;
			this.setState({ loading: true });

			this.getSaveData().done(function (dat) {
				// fix
				if (dat.status != 3) {
					if (dat['version'] != 3) {
						save = version.submitTrans(_this9.state.data, save);
					}
					rest.report.update({
						report: $.extend({}, save, {
							"version": 3,
							"status": 2
						})
					}).complete(function (xhr) {
						if (xhr.status == 200) {
							_this9.openTips('保存成功');
							setTimeout(function () {
								$('#tipModal').modal('hide');
								$('.frame-body-right').scrollTop(0);
								_this9.context.router.push({
									pathname: 'report/view',
									query: {
										date: save.date
									}
								});
							}, 1200);
						}
					});
				}
			}).always(function () {
				_this9.setState({ loading: false });
			});
		},
		openTips: function openTips(tips) {
			this.setState({ tips: tips });
			$('#tipModal').modal('show');
		},
		renderIndex: function renderIndex() {
			var _this10 = this;

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
				var summary = _this10.state.save['summary'];
				if (!summary) {
					summary = {};
				} else {
					summary = $.extend({}, summary);
				}
				summary['event_index'] = event_index;
				_this10.setState({ save: $.extend({}, _this10.state.save, { summary: summary }) });
			};

			var handleKeyDown = function handleKeyDown(e) {
				if (!(e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 8)) {
					e.preventDefault();
				}
			};

			// return <input type="text" className="tc" ref="eventIndex" placeholder={"参考值：" + count} onKeyDown={handleKeyDown} onChange={handleChange}/>
			return React.createElement('textarea', { className: 'form-control', ref: 'eventIndex', placeholder: "参考值：" + count, onKeyDown: handleKeyDown, onChange: handleChange });
		},
		renderSummary: function renderSummary() {
			var _this11 = this;

			var save = this.state.save,
			    txt = save['summary'] ? save['summary']['event_desc'] ? save['summary']['event_desc'] : '' : '';
			var handleChange = function handleChange(e) {
				var val = e.target.value;
				var sum = $.extend({}, save.summary || {});
				sum['event_desc'] = val;
				_this11.setState({ save: $.extend({}, save, { 'summary': sum }) });
			};
			// return <textarea rows="4" value={txt} onChange={handleChange} />
			return React.createElement('textarea', { className: 'form-control', value: txt, onChange: handleChange });
		},
		render: function render() {
			var _this12 = this;

			var save = this.state.save,
			    data = this.state.data,
			    date = this.state.date;

			var setTitle = function setTitle(val) {
				_this12.setState({ save: $.extend({}, save, {
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
							React.createElement(Title, { save: save, editConfirm: setTitle })
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
									null,
									React.createElement(EventTable, {
										data: data,
										save: save,
										selectEvent: function selectEvent(id) {
											return _this12.handleSelectEvent(id);
										},
										changeEventRank: function changeEventRank(evId, rank) {
											return _this12.handleEventRank(evId, rank);
										} })
								),
								React.createElement(
									'div',
									{ className: 'group-con' },
									React.createElement(
										'div',
										{ className: 'summary-part row' },
										React.createElement(
											'div',
											{ className: 'index item col-xs-3' },
											React.createElement(
												'div',
												{ className: 'title' },
												React.createElement(
													'span',
													{ className: 'vm' },
													'事件指数'
												),
												React.createElement(Tooltip, { className: 'ml10 vm', title: '事件指数＝已选事件文章数＊对应事件级别的权重总和' })
											),
											React.createElement(
												'div',
												{ className: 'con' },
												this.renderIndex(),
												React.createElement('span', { className: 'iconfont icon-sqlyufacankao' })
											)
										),
										React.createElement(
											'div',
											{ className: 'index item col-xs-9' },
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
												{ className: 'con' },
												this.renderSummary(),
												React.createElement('span', { className: 'iconfont icon-duihua' })
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
									React.createElement(Line, { save: save, data: data }),
									React.createElement(
										'div',
										{ className: 'group-title' },
										React.createElement(
											'span',
											null,
											'现有载体'
										),
										React.createElement('span', { className: 'sub' })
									),
									React.createElement(Mids, {
										data: data,
										save: save,
										changeMidSelect: function changeMidSelect(mid) {
											return _this12.handleMidSelect(mid);
										} })
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
									React.createElement(ArtTable, { data: data, save: save, selectArt: function selectArt(uuid) {
											return _this12.handleSelectArt(uuid);
										} })
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'panel-footer tr' },
							this.state.check ? [React.createElement(
								'a',
								{ className: 'btn btn-primary btn-lg', onClick: function onClick() {
										return $('#saveModal').modal('show');
									} },
								'保存'
							), React.createElement(
								'a',
								{ className: 'btn btn-default btn-lg', onClick: this.openSubmitModal },
								'提交'
							)] : null,
							React.createElement(
								'a',
								{ href: '', className: 'btn btn-default btn-lg', onClick: function onClick() {
										return window.history.go(-1);
									} },
								'取消'
							)
						)
					)
				),
				React.createElement(
					Modal,
					{ id: 'submitModal', title: '提示', modalSm: true, confirm: !this.state.submitLoading && this.submitHandler },
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
					{ id: 'hasSubmitModal', title: '提示', modalSm: true, warn: 'true', confirm: function confirm() {
							$('#hasSubmitModal').modal('hide');
						} },
					React.createElement(
						'p',
						{ className: 'tc' },
						'此报表已提交，不能再编辑'
					)
				),
				React.createElement(
					Modal,
					{ id: 'saveModal', title: '提示', modalSm: true, confirm: function confirm() {
							$('#saveModal').modal('hide');
							_this12.saveHandler();
						} },
					React.createElement(
						'p',
						{ className: 'tc' },
						'确定保存此报表吗？保存后将跳转到预览页面。'
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