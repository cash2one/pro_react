'use strict';

/**
 * 移动端指数信息展示页
 */

$(function () {

	$('.progressbar').css('width', '10%');

	$.GetQueryString = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	};

	$('.progressbar').css('width', '20%');

	var config = {
		stripTrailingSlash: true,
		stringifyData: true,
		ajax: {
			beforeSend: function beforeSend(xhr) {
				xhr.setRequestHeader('user_token', $.GetQueryString('user_token'));
			}
		}
	};

	$('.progressbar').css('width', '30%');

	var rest = new $.RestClient(paths.index.api + '/api/v1/', config);

	rest.add('keywords');
	rest.keywords.add('data');

	$('.progressbar').css('width', '40%');

	var Glo = {

		'maxCheck': 0,
		'keysOnData': [],
		'keysOnData_default': [],
		'keyIdMapName': { 'name': '111' },
		'cols': ['rgb(46, 215, 222)', 'rgb(90, 211, 114)', 'rgb(251, 115, 81)', 'rgb(254, 205, 102)', 'rgb(26, 150, 249)'],
		'ids': [],
		'defaultDays': 7,

		loadPage: function loadPage() {
			var _this = this;

			var self = this;
			rest.keywords.read().done(function (keysData) {

				$('.progressbar').css('width', '50%');

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
					// this.setState({keyIdMapName:keyIdMapName});  // id和name的映射对象
					self.keyIdMapName = keyIdMapName;

					// this.setState({keysOnData: keysOnData, keysOnData_default: keysOnData_default});

					// 根据是否存在开启的关键字的界面显示处理
					if (keysOnData.length === 0) {

						// this.setState({hasKey: 1});
					} else {

							// this.setState({hasKey: 2});

							// 给前5个开启的关键字赋值
							var colId,
							    j,
							    keyLen,
							    cols = self.cols;

							if (keysOnData.length >= 5) {
								// 全部开启关键字个数在5个以上，给前5个颜色tooltip加色值
								keyLen = 5;
								// this.setState({ maxCheck: 5 })
								self.maxCheck = 5;
							} else {
								// 全部开启关键字个数不到5个，给开启关键字个数的tooltip加色值
								keyLen = keysOnData.length;
								var RestNum = parseInt(5 - keyLen);
								cols.splice(parseInt(keyLen), RestNum);
								// this.setState({ maxCheck: keyLen, cols: cols });
								self.maxCheck = keyLen;
								self.cols = cols;
							}

							for (var i = 0; i < keyLen; i++) {
								colId = '#tooltip' + i + '';
								$(colId).find('.col').css('background-color', cols[i]);
							}

							_this.createCheckData(keysOnData);
						}
				} else {
					// 还未创建任何关键字
					// this.setState({hasKey: 1});
				}
			});
		},

		// 初入页面的关键字及其数据显示
		createCheckData: function createCheckData(keysOnData) {
			$('.progressbar').css('width', '60%');
			var self = this;
			// 开启关键字，最多显示5个
			var keyLen = self.maxCheck,
			    days = self.defaultDays,
			    cols = self.cols,
			    ids = self.ids;

			for (var i = 0; i < keyLen; i++) {
				ids[i] = keysOnData[i].id;
			}

			// this.setState({ids: ids});
			self.ids = ids;

			this.handleKeysTimeData(days, cols, ids, keysOnData, 0);
		},

		// 获取各开启关键字数据
		handleKeysTimeData: function handleKeysTimeData(days, cols, ids, keysOnData, idx) {
			var _this2 = this;

			$('.progressbar').css('width', '70%');
			var self = this;
			// this.setState({defaultDays: days}); // loadingIn: true
			self.defaultDays = days;

			// 区分tab切换 和 初入页面的 交互需求
			// if (e) {
			// 	$('.gridbox').find('.active').removeClass('active');
			// 	e.target.classList.toggle('active');
			// }
			var opt = {
				k: ids,
				days: days
			};
			$('.progressbar').css('width', '90%');
			rest.keywords.read('data', opt).done(function (keysTimeData) {

				var mark_num_day = 0;

				$.each(keysTimeData, function (index, el) {
					if (el.day !== '') {
						mark_num_day++;
					}
				});

				if (mark_num_day == 0) {
					//所选关键字都无数据

					// this.setState({noData: 1});
					$('.list-blank-holder').removeClass('none');
					$('.chartshow').hide();
					$('.progressbar').css('width', '0%');
				} else {
					$('.list-blank-holder').addClass('none');

					var temp, keyId;

					var keysCheckData = [];

					for (var i = 0; i < ids.length; i++) {
						keyId = ids[i];

						var key_name = self.keyIdMapName[keyId];
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

					// this.setState({keysCheckData: keysCheckData, keysTimeData: keysTimeData}); // loadingIn: false
					self.keysCheckData = keysCheckData;
					self.keysTimeData = keysTimeData;

					_this2.renderChartData(keysCheckData, days, idx);
				}
			});
		},

		// 根据获取的关键字数据，转换为折线图表显示所需数据
		renderChartData: function renderChartData(keysCheckData, days, idx) {
			$('.progressbar').css('width', '95%');
			var self = this;
			// 取关键字中天数最多的
			var max = keysCheckData[0].day.length;
			// for(var item of keysCheckData) {
			// 	if(item.day.length > max) {
			// 		max = item.day.length
			// 	}
			// }
			for (var i = 0; i < keysCheckData.length; i++) {
				if (keysCheckData[i].day.length > max) {
					max = keysCheckData[i].day.length;
				}
			}

			// 折线图x轴间距
			var tickInterval, num_day;
			if (days === 15 || days === 30) {
				num_day = max / 5;
				tickInterval = parseInt(num_day) * 24 * 3600 * 1000;
			} else {
				tickInterval = 1 * 24 * 3600 * 1000;
			}

			var dataType = ['baidu', 'data_360', 'sina'],

			// chartsTit = ['百度指数','360指数','新浪指数'],
			chartData = [],
			    chartXData = [],
			    temp3;

			for (var i = 0; i < dataType.length; i++) {

				var parentId = $('#chartshow' + idx);

				var chartCla = '.chartsbox' + (i + 1) + '';

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

				$('.progressbar').css('width', '100%');
				$('.progressbar').css('width', '0%');

				$(parentId).find('.cb-tit').show();

				$(parentId).find(chartCla).highcharts({
					chart: {
						type: 'line',
						// marginLeft: 5,
						marginRight: 11,
						// backgroundColor: '#fbfbfb',
						style: {
							// paddingTop: 10
						}
					},
					tooltip: {
						followTouchMove: false,
						formatter: function formatter() {
							return '<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' + this.series.name + ":" + this.y;
						}
					},
					title: {
						text: null
					},
					legend: {
						x: 6,
						align: 'right',
						verticalAlign: 'top',
						itemStyle: { width: "100%", fontSize: '12', color: '#7a7a7a', fontWeight: '100' },
						itemDistance: 10
					},
					credits: {
						enabled: false
					},
					xAxis: {
						type: 'datetime',
						// dateTimeLabelFormats: {
						// 	day: '%m月%e日'
						// },
						tickInterval: tickInterval,
						labels: {
							style: {
								color: '#7a7a7a'
							},
							rotation: -35,
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
						},
						label: {
							style: {
								color: '#7a7a7a'
							}
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
		}
	};

	Glo.loadPage();

	$(document).on('click', '.tabli', function () {

		var actIdx = $('.tabli.active').attr('data-index');
		var idx = $(this).attr('data-index');
		if (actIdx == idx) {
			return false;
		} else {
			$(this).addClass('active').siblings().removeClass('active');
			$('.chartshow').eq(idx).show().siblings('.chartshow').hide();

			if (idx == 0) {
				Glo.handleKeysTimeData(7, Glo.cols, Glo.ids, Glo.keysOnData, idx);
			} else if (idx == 1) {
				Glo.handleKeysTimeData(15, Glo.cols, Glo.ids, Glo.keysOnData, idx);
			} else if (idx == 2) {
				Glo.handleKeysTimeData(30, Glo.cols, Glo.ids, Glo.keysOnData, idx);
			}
		}
	});
});