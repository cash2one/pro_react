'use strict';

/**
 * 搜索指数信息显示页
 */define(['mods', paths.rcn.util + '/rest.js', paths.rcn.comps + '/loader.js', 'js/plu/echarts.min.js'], function (mods, r, Loader, Echarts) {

	var rest = r.index({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var Info = React.createClass({
		displayName: 'Info',


		getInitialState: function getInitialState() {
			return {
				keyIdMapName: {},
				noData: 0,
				hasKey: 0,
				loading: true,
				loadingIn: false,
				maxCheck: 0,
				defaultDays: 7,
				keysOnData: [],
				keysOnData_default: [],
				keysTimeData: [],
				keysCheckData: [],
				colN: [],
				ids: [],
				cols: ['#3BAFDA', '#70CA63', '#F6BB42', '#f88b37', '#2dbd9b', '#E9573F', '#3a99d8', '#3c71dd', '#5866e6', '#967ADC', '#d73ab8', '#ec3880']
			};
		},

		componentDidMount: function componentDidMount() {
			// $('.frame-body-right').addClass('v2');
			this.loadPage();
		},

		loadPage: function loadPage() {
			var _this = this;

			rest.keywords.read().done(function (keysData) {

				if (keysData) {

					var keysOnData = [],
					    keysOnData_default = [];

					// 组成开启的关键字数组（记录交互中的变化）
					keysData.map(function (index) {
						if (index.status === 1) {
							keysOnData.push(index);
						}
					});

					// 组成开启的关键字数组（默认不变的开启关键字显示）
					keysData.map(function (index) {
						if (index.status === 1) {
							keysOnData_default.push(index);
						}
					});

					// 组成关键字id和name的映射关系对象
					var keyIdMapName = {};

					for (var ki = 0; ki < keysData.length; ki++) {
						var kItem = keysData[ki];
						keyIdMapName[kItem.id] = kItem.keyword;
					}
					_this.setState({ keyIdMapName: keyIdMapName }); // id和name的映射对象

					_this.setState({ keysOnData: keysOnData, keysOnData_default: keysOnData_default, loading: false });

					// 根据是否存在开启的关键字的界面显示处理
					if (keysOnData.length === 0) {

						_this.setState({ hasKey: 1 });
					} else {

						_this.setState({ hasKey: 2 });

						// 给前5个开启的关键字赋值
						var colId,
						    j,
						    keyLen,
						    cols = _this.state.cols;

						if (keysOnData.length >= 5) {
							// 全部开启关键字个数在5个以上，给前5个颜色tooltip加色值
							keyLen = 5;
							_this.setState({ maxCheck: 5 });
						} else {
							// 全部开启关键字个数不到5个，给开启关键字个数的tooltip加色值
							keyLen = keysOnData.length;
							var RestNum = parseInt(5 - keyLen);
							cols.splice(parseInt(keyLen), RestNum);
							_this.setState({ maxCheck: keyLen, cols: cols });
						}

						for (var i = 0; i < keyLen; i++) {
							colId = '#tooltip' + i + '';
							$(colId).find('.col').css('background-color', cols[i]);
						}

						_this.createCheckData(keysOnData);
					}
				} else {
					console.log(1);
					// 还未创建任何关键字
					_this.setState({ hasKey: 1 });
				}
			});
		},

		// 初入页面的关键字及其数据显示
		createCheckData: function createCheckData(keysOnData) {

			// 开启关键字，最多显示5个
			var keyLen = this.state.maxCheck,
			    days = this.state.defaultDays,
			    cols = this.state.cols,
			    ids = this.state.ids;

			for (var i = 0; i < keyLen; i++) {
				ids[i] = keysOnData[i].id;
			}

			this.setState({ ids: ids });

			this.handleKeysTimeData(days, cols, ids, keysOnData);
		},

		// 获取各开启关键字数据
		handleKeysTimeData: function handleKeysTimeData(days, cols, ids, keysOnData, e) {
			var _this2 = this;

			this.setState({ loadingIn: true, defaultDays: days });

			// 区分tab切换 和 初入页面的 交互需求
			if (e) {
				$('.gridbox').find('.active').removeClass('active');
				e.target.classList.toggle('active');
			}

			var opt = {
				k: ids,
				days: days
			};
			rest.keywords.read('data', opt).done(function (keysTimeData) {

				var mark_num_day = 0;

				$.each(keysTimeData, function (index, el) {
					if (el.day !== '') {
						mark_num_day++;
					}
				});

				if (mark_num_day == 0) {
					//所选关键字都无数据

					_this2.setState({ noData: 1 });
				} else {

					_this2.setState({ noData: 2 });

					var temp, keyId;

					var keysCheckData = [];

					for (var i = 0; i < ids.length; i++) {
						keyId = ids[i];

						var key_name = _this2.state.keyIdMapName[keyId];
						temp = {
							id: keyId,
							color: cols[i],
							keyword: key_name,
							baidu: keysTimeData[keyId].baidu,
							data_360: keysTimeData[keyId].data_360,
							sina: keysTimeData[keyId].sina,
							youku: keysTimeData[keyId].youku,
							day: keysTimeData[keyId].day
						};
						keysCheckData[i] = temp;
					}

					_this2.setState({ keysCheckData: keysCheckData, keysTimeData: keysTimeData, loadingIn: false });

					_this2.renderChartData(keysCheckData, days);
				}
			});
		},

		// 根据获取的关键字数据，转换为折线图表显示所需数据
		renderChartData: function renderChartData(keysCheckData, days) {

			// 取关键字中天数最多的
			var max = keysCheckData[0].day.length;

			for (var i = 0; i < keysCheckData.length; i++) {
				if (keysCheckData[i].day.length > max) {
					max = keysCheckData[i].day.length;
				}
			}

			// 折线图x轴间距
			var tickInterval, num_day;
			if (days == 30 || days == 90) {
				num_day = max / 5;
				tickInterval = parseInt(num_day) * 24 * 3600 * 1000;
			} else {
				tickInterval = 1 * 24 * 3600 * 1000;
			}

			if (keysCheckData.length > 0) {

				// 折线图x轴间距
				// var tickInterval;
				// if(days){
				// 	if(days === 7) {
				// 		tickInterval = 1 * 24 * 3600 * 1000;
				// 	}else if(days === 30){
				// 		tickInterval = 3 * 24 * 3600 * 1000;
				// 	}else if(days === 90){
				// 		tickInterval = 6 * 24 * 3600 * 1000;
				// 	}
				// }else{
				// 	tickInterval = 1 * 24 * 3600 * 1000;
				// }

				var dataType = ['baidu', 'data_360', 'sina', 'youku'],
				    chartsTit = ['百度指数', '360指数', '新浪指数', '优酷指数'],
				    chartData = [],
				    chartXData = [],
				    temp3;

				for (var i = 0; i < dataType.length; i++) {

					var chartId = '#chartsbox' + (i + 1) + '';

					for (var j = 0; j < keysCheckData.length; j++) {
						if (keysCheckData[j].length !== 0) {
							temp3 = {
								name: keysCheckData[j].keyword,
								data: this.getChartData(keysCheckData[j], dataType[i]),
								color: keysCheckData[j].color
							};
							chartData[j] = temp3;
						}
					}
					console.log(chartData);
					chartXData = keysCheckData[0].day;

					$(chartId).highcharts({
						chart: {
							type: 'areaspline',
							// type: 'areaspline',
							// type: 'spline',
							// type: 'line',
							marginBottom: 70
						},
						tooltip: {
							formatter: function formatter() {
								return '<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' + this.series.name + ":" + this.y;
							}
						},
						title: {
							align: 'left',
							y: 14,
							text: chartsTit[i],
							margin: 50,
							style: {
								color: '#000',
								fontSize: '16'
							}
						},
						legend: {
							align: 'right',
							y: -4,
							verticalAlign: 'top'
						},
						plotOptions: {
							series: {
								connectNulls: true
							},
							areaspline: {
								fillOpacity: 0.2,
								marker: {
									enabled: false,
									symbol: 'circle',
									radius: 2,
									states: {
										hover: {
											enabled: true
										}
									}
								}
							}
						},
						credits: {
							enabled: false
						},
						xAxis: {
							type: 'datetime',
							//             dateTimeLabelFormats: {
							// 	day: '%m月%e日'
							// },
							tickInterval: tickInterval,
							labels: {
								style: {
									color: '#7a7a7a'
								},
								rotation: 0, // 35
								formatter: function formatter() {
									var date = new Date(this.value);
									var mon = date.getMonth() + 1;
									var day = date.getDate();
									return mon + '月' + day + '日';
								}
							}
						},
						yAxis: {
							title: {
								text: ''
							}
						},
						series: chartData
					});
				}
			}
		},

		// 获取某一个开启关键字的某一个指数类型数据
		getChartData: function getChartData(keysCheckData, dataTypeItem) {

			var totaldata = [],
			    data_temp,
			    xdata_temp,
			    ydata_temp;

			for (var z = 0; z < keysCheckData.day.length; z++) {

				xdata_temp = new Date(keysCheckData.day[z]).getTime();
				ydata_temp = keysCheckData[dataTypeItem][z];
				data_temp = [xdata_temp, ydata_temp];
				totaldata[z] = data_temp;
			}
			return totaldata;
		},

		toggleKey: function toggleKey(e, elem, tooltipClassList, keyId) {
			var classLen = $('.key.act').length,
			    tooltipId = '#tooltip' + elem + '',
			    keyword = e.target.innerHTML,
			    colN = this.state.colN,
			    cols = this.state.cols,
			    ids = this.state.ids,
			    keysOnData = this.state.keysOnData,
			    keysOnData_default = this.state.keysOnData_default,
			    keysCheckData = this.state.keysCheckData,
			    days = this.state.defaultDays,
			    maxCheck = this.state.maxCheck;
			// clearTimeout(this.setTime);
			if (tooltipClassList.length == 2) {
				// 取消选择

				if (classLen < 2) {

					// 至少选择查看一个开启关键字
					$(tooltipId).attr("title", "至少查看一个关键字");
					$(tooltipId).tooltip('show');

					// $('.alert.alert-danger').slideDown(100);
					// console.log(tooltipClassList.length)
					// this.setTime = setTimeout(() => {
					// 	$('.alert.alert-danger').slideUp(100);
					// },2000);
				} else {

						tooltipClassList.toggle('act');
						$("[data-toggle='tooltip']").tooltip('destroy');
						this.cancelChoose(keyId, tooltipId, keyword, colN, cols, ids, keysOnData, keysOnData_default, keysCheckData, days, maxCheck);
					}
			} else {
				// 选择

				if (classLen < 5) {
					// 只能选择5个

					tooltipClassList.toggle('act');
					$("[data-toggle='tooltip']").tooltip('destroy');

					this.doChoose(keyId, tooltipId, keyword, colN, cols, ids, keysOnData, keysOnData_default, keysCheckData, days, maxCheck);
				} else {
					// 选择5个以上提示错误
					$(tooltipId).attr("title", "最多允许选择5个关键字，请先取消选中关键字");
					$(tooltipId).tooltip('show');
				}
			}
		},

		// 取消选择
		cancelChoose: function cancelChoose(keyId, tooltipId, keyword, colN, cols, ids, keysOnData, keysOnData_default, keysCheckData, days, maxCheck) {

			var temp = $(tooltipId).find('.col').css('background-color');
			$(tooltipId).find('.col').removeAttr("style");

			colN.push(temp);

			for (var i = 0; i < cols.length; i++) {
				if (cols[i] === temp) {
					cols.splice(i, 1);
				}
			}
			this.setState({ cols: cols, colN: colN });

			for (var i = 0; i < ids.length; i++) {
				if (ids[i] === keyId) {
					ids.splice(i, 1);
				}
			}
			this.setState({ ids: ids });

			for (var i = 0; i < keysCheckData.length; i++) {
				if (keysCheckData[i].id === keyId) {
					keysCheckData.splice(i, 1);
				}
			}
			this.setState({ keysCheckData: keysCheckData });

			// 根据数据是否为空控制相应的界面显示
			var mark_num_day = 0;
			for (var i = 0; i < keysCheckData.length; i++) {
				if (keysCheckData[i].day !== '') {
					mark_num_day++;
				}
			}
			if (mark_num_day == 0) {
				this.setState({ noData: 1 });
			} else {
				this.setState({ noData: 2 });
			}

			for (var i = 0; i < keysOnData.length; i++) {
				if (keysOnData[i].id === keyId) {
					keysOnData.splice(i, 1);
				}
			}
			this.setState({ keysOnData: keysOnData });

			this.renderChartData(keysCheckData, days);
		},

		// 选择
		doChoose: function doChoose(keyId, tooltipId, keyword, colN, cols, ids, keysOnData, keysOnData_default, keysCheckData, days, maxCheck) {
			var _this3 = this;

			var m = colN.length;
			var rNum = Math.floor(Math.random() * m);
			var col_temp = colN[rNum];

			cols.push(col_temp);

			$(tooltipId).find('.col').css('background-color', col_temp);

			for (var i = 0; i < colN.length; i++) {
				if (colN[i] === col_temp) {
					colN.splice(i, 1);
				}
			}

			this.setState({ cols: cols, colN: colN, loadingIn: false });

			ids.push(keyId);
			this.setState({ ids: ids });

			var opt = {
				k: ids,
				days: this.state.defaultDays
			};
			var keyword_name = this.state.keyIdMapName[keyId];

			rest.keywords.read('data', opt).done(function (keysTimeData) {
				_this3.setState({ keysTimeData: keysTimeData });

				var mark_num_day = 0;

				$.each(keysTimeData, function (index, el) {
					if (el.day !== '') {
						mark_num_day++;
					}
				});

				if (mark_num_day == 0) {
					//所选关键字都无数据

					_this3.setState({ noData: 1 });
				} else {

					_this3.setState({ noData: 2 });

					var keyCheck_temp = {
						id: keyId,
						color: col_temp,
						keyword: keyword_name,
						baidu: keysTimeData[keyId].baidu,
						data_360: keysTimeData[keyId].data_360,
						sina: keysTimeData[keyId].sina,
						youku: keysTimeData[keyId].youku,
						day: keysTimeData[keyId].day
					};

					keysCheckData.push(keyCheck_temp);
					_this3.setState({ keysCheckData: keysCheckData });

					_this3.renderChartData(keysCheckData, days);
				}
			});
		},

		gotoSetting: function gotoSetting() {
			var url = window.location.protocol + '//' + window.location.hostname + '/index-base#/info/setting';
			window.location.href = url;
		},

		render: function render() {
			var _this4 = this;

			var cols = this.state.cols;

			var pageShow = function pageShow() {
				if (_this4.state.hasKey === 0) {
					return React.createElement(
						'div',
						{ className: '' },
						React.createElement(Loader, { show: _this4.state.loading })
					);
				} else if (_this4.state.hasKey === 1) {
					return React.createElement(
						'div',
						{ className: '' },
						React.createElement(
							'div',
							{ className: 'panel panel-default' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'搜索指数'
								)
							),
							React.createElement(
								'div',
								{ className: 'panel-body' },
								React.createElement(
									'div',
									{ className: 'haskey' },
									React.createElement(
										'span',
										null,
										'当前没有启用指数关键字。'
									),
									React.createElement(
										'span',
										{ className: 'add', onClick: _this4.gotoSetting },
										'添加并启用指数关键字'
									)
								)
							)
						)
					);
				} else if (_this4.state.hasKey === 2) {
					return React.createElement(
						'div',
						{ className: '' },
						React.createElement(
							'div',
							{ className: 'panel panel-default' },
							React.createElement(
								'div',
								{ className: 'panel-heading' },
								React.createElement(
									'h3',
									{ className: 'panel-title' },
									'搜索指数'
								),
								React.createElement(
									'div',
									{ className: 'editbox' },
									React.createElement(
										'div',
										{ className: 'btn btn-primary', onClick: _this4.gotoSetting },
										'编辑'
									)
								)
							),
							React.createElement(
								'div',
								{ className: 'panel-body' },
								React.createElement(
									'div',
									{ className: 'fr-br-m-left w1' },
									React.createElement(
										'div',
										{ className: 'titlebox' },
										React.createElement(
											'span',
											null,
											'选择关键字：'
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'fr-br-m-right w1' },
									React.createElement(
										'div',
										{ className: 'row keybox' },
										_this4.state.keysOnData_default.map(function (index, elem) {
											return React.createElement(
												'div',
												{ className: elem < 5 ? "key act" : "key", title: index.keyword,
													id: 'tooltip' + elem + '', 'data-toggle': 'tooltip' },
												React.createElement('i', { className: 'col' }),
												React.createElement(
													'span',
													{ onClick: function onClick(e) {
															return _this4.toggleKey(e, elem, e.target.parentNode.classList, index.id);
														} },
													index.keyword
												)
											);
										})
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'fr-br-main' },
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
											{ className: 'active', ref: 'tab1', onClick: function onClick(e) {
													return _this4.handleKeysTimeData(7, _this4.state.cols, _this4.state.ids, _this4.state.keysOnData, e);
												}, 'data-days': '7' },
											'近7天'
										),
										React.createElement(
											'li',
											{ className: '', ref: 'tab2', onClick: function onClick(e) {
													return _this4.handleKeysTimeData(30, _this4.state.cols, _this4.state.ids, _this4.state.keysOnData, e);
												}, 'data-days': '30' },
											'近30天'
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'tab-content panel-body' },
									React.createElement(Loader, { show: _this4.state.noData == 0 ? true : false }),
									React.createElement(
										'div',
										{ className: _this4.state.noData == 2 ? "content" : 'none' },
										React.createElement(Loader, { show: _this4.state.loadingIn }),
										React.createElement(
											'ul',
											null,
											React.createElement(
												'li',
												null,
												React.createElement('div', { id: 'chartsbox1', className: 'chartsbox' })
											),
											React.createElement(
												'li',
												null,
												React.createElement('div', { id: 'chartsbox2', className: 'chartsbox' })
											),
											React.createElement(
												'li',
												null,
												React.createElement('div', { id: 'chartsbox3', className: 'chartsbox' })
											),
											React.createElement(
												'li',
												{ className: 'none' },
												React.createElement('div', { id: 'chartsbox4', className: 'chartsbox' })
											)
										)
									),
									React.createElement('div', { className: _this4.state.noData == 1 ? 'list-blank-holder v2' : 'none' })
								)
							)
						)
					);
				}
			};

			return React.createElement(
				'div',
				{ className: 'index-base-info container' },
				React.createElement(
					'div',
					{ className: 'alert alert-danger alert-dismissible fade in none' },
					React.createElement(
						'button',
						{ type: 'button', className: 'close', 'data-dismiss': 'alert', 'aria-label': 'Close' },
						React.createElement(
							'span',
							{ 'aria-hidden': 'true' },
							'×'
						)
					),
					React.createElement('span', { className: 'iconfont icon-jingshi' }),
					React.createElement(
						'span',
						null,
						'至少查看一个关键字'
					)
				),
				pageShow()
			);
		}

	});

	return Info;
});