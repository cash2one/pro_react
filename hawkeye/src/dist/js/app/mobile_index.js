'use strict';

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160620",
	paths: {
		"mods": paths.rcn.lib + "/mods"
	}
});

require(["mods"], function (mods) {

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

	$.GetQueryString = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	};

	var config = {
		stripTrailingSlash: true,
		stringifyData: true,
		ajax: {
			beforeSend: function beforeSend(xhr) {
				xhr.setRequestHeader('user_token', $.GetQueryString('user_token'));
			}
		}
	};

	var rest = new $.RestClient(paths.index.api + '/api/v1/', config);

	rest.add('keywords');
	rest.keywords.add('data');

	// var Loader = React.createClass({
	// 	render1: function(){
	// 		return (
	// 			<div className="sk-circle">
	// 				<div className="sk-circle1 sk-child"></div>
	// 				<div className="sk-circle2 sk-child"></div>
	// 				<div className="sk-circle3 sk-child"></div>
	// 				<div className="sk-circle4 sk-child"></div>
	// 				<div className="sk-circle5 sk-child"></div>
	// 				<div className="sk-circle6 sk-child"></div>
	// 				<div className="sk-circle7 sk-child"></div>
	// 				<div className="sk-circle8 sk-child"></div>
	// 				<div className="sk-circle9 sk-child"></div>
	// 				<div className="sk-circle10 sk-child"></div>
	// 				<div className="sk-circle11 sk-child"></div>
	// 				<div className="sk-circle12 sk-child"></div>
	// 			</div>
	// 		)

	// 	},
	// 	render: function(){
	// 		if(this.props.show == true){
	// 			return (
	// 				<div className="c-loader">
	// 					{this.render1()}
	// 				</div>
	// 			)
	// 		} else {
	// 			return null;
	// 		}
	// 	}
	// });

	var Info = React.createClass({
		displayName: 'Info',


		getInitialState: function getInitialState() {
			return {
				keyIdMapName: {},
				noData: 0,
				hasKey: 0,
				// loading: true,
				// loadingIn: false,
				maxCheck: 0,
				defaultDays: 7,
				keysOnData: [],
				keysOnData_default: [],
				keysTimeData: [],
				keysCheckData: [],
				colN: [],
				ids: [],
				cols: ['rgb(46, 215, 222)', 'rgb(90, 211, 114)', 'rgb(251, 115, 81)', 'rgb(254, 205, 102)', 'rgb(26, 150, 249)']
			};
		},

		componentDidMount: function componentDidMount() {
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

			this.setState({ defaultDays: days }); // loadingIn: true

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

					_this2.setState({ keysCheckData: keysCheckData, keysTimeData: keysTimeData }); // loadingIn: false

					_this2.renderChartData(keysCheckData, days);
				}
			});
		},

		// 根据获取的关键字数据，转换为折线图表显示所需数据
		renderChartData: function renderChartData(keysCheckData, days) {

			// 取关键字中天数最多的
			var max = keysCheckData[0].day.length;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = keysCheckData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var item = _step.value;

					if (item.day.length > max) {
						max = item.day.length;
					}
				}

				// 折线图x轴间距
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var tickInterval, num_day;
			if (days === 15 || days === 30) {
				num_day = max / 5;
				tickInterval = parseInt(num_day) * 24 * 3600 * 1000;
			} else {
				tickInterval = 1 * 24 * 3600 * 1000;
			}

			var dataType = ['baidu', 'data_360', 'sina'],
			    chartsTit = ['百度指数', '360指数', '新浪指数'],
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

				chartXData = keysCheckData[0].day;

				$(chartId).highcharts({
					chart: {
						type: 'line',
						backgroundColor: '#fbfbfb',
						style: {
							paddingTop: 10
						}
					},
					tooltip: {
						followTouchMove: false,
						formatter: function formatter() {
							return '<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' + this.series.name + ":" + this.y;
						}
					},
					title: {
						// align: 'top',
						// verticalAlign: 'top',
						text: chartsTit[i],
						margin: 50,
						style: {
							color: '#313131',
							fontSize: '16',
							fontWeight: '100'
						}
					},
					legend: {
						itemMarginTop: 18,
						align: 'center',
						verticalAlign: 'top',
						itemStyle: { width: "100%", fontSize: '13', color: '#787878', fontWeight: '100' },
						itemDistance: 10
					},
					credits: {
						enabled: false
					},
					xAxis: {
						type: 'datetime',
						//             dateTimeLabelFormats: {
						// 	day: '%m-%e'
						// },
						dateTimeLabelFormats: {
							day: '%m-%e'
						},
						tickInterval: tickInterval
					},
					yAxis: {
						title: {
							text: ''
						}
					},
					series: chartData
				});
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

		render: function render() {
			var _this3 = this;

			var cols = this.state.cols;

			var pageShow = function pageShow() {
				if (_this3.state.hasKey === 0) {
					return React.createElement('div', { className: 'container-fluid' });
				} else if (_this3.state.hasKey === 1) {
					return React.createElement(
						'div',
						{ className: 'container-fluid' },
						React.createElement('div', { className: 'full-screen list-blank-holder' })
					);
				} else if (_this3.state.hasKey === 2) {
					return React.createElement(
						'div',
						{ className: 'container-fluid' },
						React.createElement(
							'div',
							{ className: 'fr-br-main' },
							React.createElement(
								'div',
								{ className: 'gridbox' },
								React.createElement(
									'div',
									{ className: 'tab' },
									React.createElement(
										'ul',
										null,
										React.createElement(
											'li',
											{ className: 'active', ref: 'tab1', onClick: function onClick(e) {
													return _this3.handleKeysTimeData(7, _this3.state.cols, _this3.state.ids, _this3.state.keysOnData, e);
												}, 'data-days': '7' },
											'近一周'
										),
										React.createElement(
											'li',
											{ className: '', ref: 'tab2', onClick: function onClick(e) {
													return _this3.handleKeysTimeData(15, _this3.state.cols, _this3.state.ids, _this3.state.keysOnData, e);
												}, 'data-days': '30' },
											'近半个月'
										),
										React.createElement(
											'li',
											{ className: '', ref: 'tab3', onClick: function onClick(e) {
													return _this3.handleKeysTimeData(30, _this3.state.cols, _this3.state.ids, _this3.state.keysOnData, e);
												}, 'data-days': '90' },
											'近一个月'
										)
									)
								),
								React.createElement(
									'div',
									{ className: _this3.state.noData == 2 ? "content" : 'none' },
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
										)
									)
								),
								React.createElement('div', { className: _this3.state.noData == 1 ? 'list-blank-holder' : 'none' })
							)
						)
					);
				}
			};

			return React.createElement(
				'div',
				{ className: 'index-base-info fr-br-container' },
				pageShow()
			);
		}

	});

	ReactDOM.render(React.createElement(Info, null), document.getElementById('mobile_index_base'));
});