"use strict";

$(function () {
	function GetQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
		var context = "";
		if (r != null) context = r[2];
		reg = null;
		r = null;
		return context == null || context == "" || context == "undefined" ? "" : context;
	}

	var date = GetQueryString('day');
	var user_token = GetQueryString('user_token');

	var rTag = /\<[^<>]+\>|\<\/[^<>]\>/g;
	function parseTag(str) {
		if (str) return str.replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return '';
	}

	var Helper = {
		run: function run(data) {
			// this.Index(data);
			this.artTrend(data);
			this.Statis(data);
			this.Summarize(data);
		},
		Index: function Index(report_data) {
			var env = {
				areaChartDefaultOptions: {
					lang: {
						noData: '无'
					},
					noData: {
						style: {
							fontSize: '16px'
						}
					},
					credits: { enabled: false },
					title: {
						text: ''
					},
					legend: {
						align: 'right',
						verticalAlign: 'top'
					},
					tooltip: {
						shared: true,
						crosshairs: {
							width: 1,
							color: '#eee'
						},
						formatter: function formatter() {
							var s = "<b>" + this.x + "</b><br />";
							$.each(this.points, function (i, item) {
								s += item.series.name + ": " + item.y + "<br />";
							});
							return s;
						}
					},
					chart: {
						type: 'area',
						animation: {
							duration: 1000
						},
						// margin: [10,0,0,0],
						backgroundColor: 'rgba(0,0,0,0)',
						spacingTop: 20
					},
					colors: ['#0099ff', '#ffcc66', '#ff6633'],
					xAxis: {
						gridLineWidth: 0,
						gridLineColor: '#ebebeb',
						tickColor: 'transparent',
						type: 'datetime',
						dateTimeLabelFormats: {
							day: '%b月%e日',
							hour: ''
						},
						categories: function () {
							var res = [],
							    count = 7,
							    now = Date.now(),
							    oneDayTime = 24 * 1000 * 3600;
							while (count) {
								res.push(Highcharts.dateFormat('%Y-%m-%d', now - count * oneDayTime));
								count--;
							}

							return res;
						}()
					},
					yAxis: {
						gridLineWidth: 1,
						title: {
							text: ''
						},
						labels: {
							align: 'right',
							x: 0,
							y: -2,
							style: {
								color: '#999'
							}
						},
						opposite: true
					},
					plotOptions: {
						area: {
							fillOpacity: 0.1,
							lineWidth: 1,
							marker: {
								symbol: 'circle',
								states: {
									hover: {
										enabled: false
									},
									select: {
										enabled: false
									}
								}
							}
						},
						series: {
							// color: map[key]['color'],
							marker: {
								states: {
									hover: {
										enabled: false
									}
								}
							}
						}
					}
				},
				time: report_data.date,
				chartIdMap: {
					'baidu_index': '#chart_index_baidu',
					'sina_index': '#chart_index_sina',
					'360_index': '#chart_index_360'
				}
			};

			function dataFormat(data) {
				var dat = [],
				    oneDayTime = 3600 * 1000 * 24;
				data.map(function (item) {
					dat.push(item.value);
				});

				var delta = 7 - dat.length,
				    prefix;

				if (delta != 0) {
					prefix = [];
					while (delta--) {
						prefix.push(null);
					}
					dat = [].concat.call(prefix, dat);
				}

				// dat [null, "", "", "", ...]
				return dat;
			}

			function formatData(data) {
				data = data || [];
				var temp = {},
				    ori = {},
				    res = [],
				    oneDayTime = 24 * 3600 * 1000,
				    count = 7,
				    now = Date.now(),
				    blank = true;

				if (data.length == 0) return [];

				while (count) {
					temp[Highcharts.dateFormat('%Y-%m-%d', now - count * oneDayTime)] = null;
					count--;
				}

				for (var i = 0, dat; dat = data[i++];) {
					ori[dat.date] = dat.value;
				}
				$.each(temp, function (key) {
					if (ori[key] != undefined) {
						temp[key] = ori[key];
					}
				});

				for (var i in temp) {
					res.push(temp[i]);
					if (temp[i] != null) blank = false;
				}

				if (blank) return [];

				return res;
			}

			function getMSecond(dateStr) {
				var date = dateStr.split('-'),
				    year,
				    month,
				    day,
				    res;
				if (date.length == 3) {
					year = date[0];
					month = date[1] - 1;
					day = date[2];

					res = new Date(year, month, day).getTime();
				} else {
					res = new Date().getTime();
				}

				return res;
			}

			function drawIndex(chartId, data) {
				var chart = $(chartId).highcharts(),
				    drawOptions;

				var series = {
					name: data.seriesName,
					data: data.y
				};

				if (chart == undefined) {
					drawOptions = $.extend(true, {}, {
						series: [series]
					}, env.areaChartDefaultOptions);
					$(chartId).highcharts(drawOptions);
				} else {
					chart.addSeries(series);
				}
			}

			// if($('#data').html().length == 0)
			// 	return

			// var pageData = JSON.parse($('#data').html());

			function init() {
				var map = {
					'baidu_index': '#chart-index-baidu'
				};
				'baidu_index sina_index 360_index'.replace(/\w+/g, function (key) {
					var chartId = env.chartIdMap[key],
					    data = report_data[key];

					if (data == undefined) {
						$(chartId).parent().hide();
					} else {
						$.each(data, function (i, item) {
							drawIndex(chartId, {
								seriesName: item.name,
								y: formatData(item.data || [])
							});
						});
					}
				});
			}

			init();
		},
		Statis: function Statis(report_data) {
			var env = {
				pieChartDefaultOptions: {
					credits: {
						enabled: false
					},
					chart: {
						type: 'pie',
						height: 220
					},
					title: {
						verticalAlign: 'middle',
						y: -20,
						style: {
							fontSize: '16px'
						},
						useHTML: true
					},
					tooltip: {
						formatter: function formatter() {
							var str = this.point.name + '<br/>' + '数目：' + this.point.y;
							return str;
						},
						hideDelay: 0
					},
					plotOptions: {
						pie: {
							innerSize: '80%',
							dataLabels: {
								enabled: false
							},
							// showInLegend: true,
							states: {
								hover: {
									enabled: false
								}
							}
						}
					}
				},
				emotionMap: {
					'positive': {
						name: '正面报道',
						drawId: '#positive_statistic',
						color: '#116ab4'
					},
					'negative': {
						name: '负面报道',
						drawId: '#negative_statistic',
						color: '#e40d20'
					},
					'neutral': {
						name: '中性报道',
						drawId: '#neutral_statistic',
						color: '#f39d27'
					}
				},
				emotionTotal: 0
			};

			function drawPie(options) {
				$(options.drawId).highcharts($.extend(true, {
					title: {
						style: {
							color: options.color,
							fontSize: '24px'
						}
					},
					series: [{
						data: [{
							name: options.name,
							color: options.color,
							y: options.value
						}, {
							name: '报道总数',
							color: '#c9c9cb',
							y: options.total
						}]
					}]
				}, env.pieChartDefaultOptions), function (c) {
					var count = c.series[0].data[0].y,
					    per;

					if (c.series[0].total == 0) {
						c.setTitle({
							text: '无'
						});
					} else {
						per = (count / c.series[0].total * 100).toFixed(0);
						c.setTitle({
							text: '<div class="tc mb5" style="font-size: 40px;font-family: SimSun">' + per + '%</div><div class="f16 tc">' + count + '条</div>'
						});
					}
				});
			}

			function init(data) {
				if (!data) return;
				$.each(data, function (i, item) {
					env.emotionTotal += parseInt(item);
				});

				$.each(data, function (i, item) {
					var opt = env.emotionMap[i];
					opt.value = parseInt(item);
					opt.total = env.emotionTotal;
					drawPie(opt);
				});
			}

			function formatData(data) {
				if (!data) return;
				data.positive = data.positive || 0;
				data.negative = data.negative || 0;
				data.neutral = data.neutral || 0;

				return data;
			}

			init(formatData(report_data.articles_statis));
		},
		Summarize: function Summarize(report_data) {
			var env = {
				pieChartDefaultOptions: {
					noData: {
						style: {
							color: 'transparent'
						}
					},
					credits: {
						enabled: false
					},
					chart: {
						type: 'pie',
						height: 200
					},
					title: {
						verticalAlign: 'middle',
						y: -16,
						style: {
							fontSize: '18px'
						},
						useHTML: true
					},
					tooltip: {
						formatter: function formatter() {
							var str = this.point.name + '<br/>' + '数目：' + this.point.y;
							return str;
						},
						hideDelay: 0
					},
					legend: {
						width: 100,
						floating: true,
						align: 'right',
						item: 100
					},
					plotOptions: {
						pie: {
							innerSize: '65%',
							dataLabels: {
								enabled: false
							},
							showInLegend: true,
							states: {
								hover: {
									enabled: false
								}
							}
						}
					}
				}
			};

			function drawEvents(options) {
				$(options.drawId).highcharts($.extend(true, {}, options.series, env.pieChartDefaultOptions), function (c) {

					var titleStr = '<div class="tc f12" style="color: #f27e86;">事件指数</div>';
					if (options.index) {
						titleStr = '<div class="tc fb" style="color: #e40d20;font-size: 44px;">' + options.index + '</div>' + titleStr;
					} else {
						titleStr = '<div class="f18 tc fb" style="color: #e40d20;">恭喜你，今日无危机</div>';
					}

					c.setTitle({
						text: titleStr,
						y: options.index ? -16 : 0
					});
				});
			}

			function events() {
				var data = report_data['events'] || [],
				    total = 0,
				    lv1 = 0,
				    lv2 = 0,
				    lv3 = 0,
				    lv4 = 0,
				    index = (report_data['summary'] || {})['event_index'] || '',
				    seriesData = [];

				if (index.length == 0 || typeof +index != 'number') index = false;

				$.each(data, function (i, item) {
					switch (item.rank) {
						case 4:
							lv4++;
							break;
						case 1:
							lv1++;
							break;
						case 2:
							lv2++;
							break;
						case 3:
							lv3++;
							break;
						default:
							break;
					}
				});

				$.each([lv1, lv2, lv3, lv4], function (i, item) {
					if (item > 0) {
						if (i == 0) seriesData.push({
							name: '一级危机',
							color: '#e70312',
							y: item
						});else if (i == 1) seriesData.push({
							name: '二级危机',
							color: '#f17f87',
							y: item
						});else if (i == 2) seriesData.push({
							name: '三级危机',
							color: '#facbce',
							y: item
						});else if (i == 3) seriesData.push({
							name: '普通',
							color: '#116ab4',
							y: item
						});
					}
				});

				drawEvents({
					drawId: '#event-chart',
					index: index,
					series: {
						series: [{
							data: seriesData
						}]
					}
				});
			}

			function summary() {
				var str = '';
				if (!report_data['summary'] || report_data['summary']['event_desc'].length == 0) {
					str = '无';
				} else str = report_data['summary']['event_desc'];

				$('#summary-content').html(str);
			}

			function init() {
				events();
				summary();
			}

			init();
		},
		artTrend: function artTrend(data) {
			var env = {
				areaChartDefaultOptions: {
					credits: {
						enabled: false
					},
					lang: {
						noData: '暂无数据'
					},
					noData: {
						style: {
							fontSize: '16px'
						}
					},
					title: {
						text: ''
					},
					colors: ['#0acc0e', '#ffcc66', '#f63', '#93f', '#3cf'],
					legend: {
						align: 'right',
						verticalAlign: 'top'
					},
					tooltip: {
						shared: true,
						crosshairs: {
							width: 1,
							color: '#eee'
						},
						formatter: function formatter() {
							var s = "<b>" + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + "</b><br />";
							$.each(this.points, function (i, item) {
								s += item.series.name + ": " + item.y + "<br />";
							});
							return s;
						}
					},
					chart: {
						type: 'area',
						animation: {
							duration: 1000
						},
						backgroundColor: 'rgba(0,0,0,0)',
						spacingTop: 20
					},
					xAxis: {
						gridLineWidth: 0,
						gridLineColor: '#ebebeb',
						tickColor: 'transparent',
						type: 'datetime',
						dateTimeLabelFormats: {
							day: '%m月%e日'
						}
					},
					yAxis: {
						gridLineWidth: 1,
						title: {
							text: ''
						},
						labels: {
							align: 'right',
							x: 0,
							y: -2,
							style: {
								color: '#999'
							}
						},
						opposite: true
					},
					plotOptions: {
						area: {
							fillOpacity: 0.1,
							lineWidth: 1,
							marker: {
								symbol: 'circle',
								states: {
									hover: {
										enabled: false
									},
									select: {
										enabled: false
									}
								}
							}

						},
						series: {
							// color: map[key]['color'],
							marker: {
								states: {
									hover: {
										enabled: false
									}
								}
							},
							events: {
								click: function click(e) {
									// console.log(222, e)
								}
							}
						}
					}
				}
			};
			if (!data.artTrend) {
				$('#chart_art_trend_container').remove();
			} else {
				data = data.artTrend;
				var parseToDraw = function parseToDraw(data) {
					var res = data.sort(function (a, b) {
						return Date.parse(a.date) - Date.parse(b.date);
					}).map(function (item) {
						return [Date.parse(item.date.replace(/\s/, 'T')), item.value];
					});

					return res;
				};
				data = Object.keys(data).map(function (key) {
					return {
						name: key,
						data: parseToDraw(data[key])
					};
				});
				$('#chart_art_trend').highcharts($.extend({}, env.areaChartDefaultOptions, { series: data }));
			}
		}
	};

	var Report = {
		init: function init() {
			var _this = this;

			$.ajax(paths.ex.api + '/api/v1/report', {
				data: {
					day: date,
					user_token: user_token
				},
				headers: {
					user_token: user_token
				}
			}).done(function (data) {
				Helper.run(data);
				_this.renderTitDate(data.title, data.date);
				_this.renderArt(data.focus_articles || []);
			});
		},
		renderTitDate: function renderTitDate(tit, date) {
			$('#reportTitle').html(tit);
			$('#reportDate').html(date);
		},
		renderArt: function renderArt(data) {
			var html = '';
			data.forEach(function (art, idx) {
				console.log(parseTag(art.title));
				html += "<tr>\n\t\t\t\t\t\t<td>" + (idx + 1) + "</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<a href=\"" + art.url + "\" class=\"art-title\" data-article-link data-uuid=\"" + art.src_uuid + "\" data-source=\"" + art.from + "\" data-from-text=\"" + art.from_text + "\">" + parseTag(art.title) + "</a>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td data-emotion>" + art.emotion + "</td>\n\t\t\t\t\t\t<td data-author>" + art.author + "</td>\n\t\t\t\t\t\t<td>" + art.create_at + "</td>\n\t\t\t\t\t</tr>";
			});

			$('#article_focus_container').html(html);
		}
	};

	Report.init();
});