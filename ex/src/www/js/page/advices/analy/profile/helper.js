define([
	paths.rcn.util + '/rest.js',
	paths.rcn.plu + '/fecha.min.js'
], function(Rest, fecha){
	var rest = Rest.ex();

	var env = {
		debug: false,
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
			// colors: ['#0066cc', '#ffcc66', '#ff6633', '#9933ff', '#33ccff'],
			legend: {
				align: 'right',
				verticalAlign: 'top',
			},
			tooltip: {
				shared: true,
				crosshairs: {
					width: 1,
					color: '#eee'
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
				tickInterval: 24 * 3600 * 1000 * 2,
				dateTimeLabelFormats: {
					day: '%m月%e日',
					millisecond: '%H:%M:%S.%L',
					second: '%H:%M:%S',
					minute: '%H:%M',
					hour: '%H:%M',
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
					},

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
						click: function(e){
							// console.log(222, e)
						}
					}
				}
			}
	    },
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
				height: 177
			},
			title: {
				verticalAlign: 'middle',
				y: -16,
				style: {
					fontSize: '18px'
				},
				useHTML: true,
				text: ''
			},
			tooltip: {
				formatter: function(){
					var str = this.point.name + '<br/>' + '数目：' + this.point.y
					return str
				},
				hideDelay: 0
			},
			// legend: {
			// 	width: 80,
			// 	floating: false,
			// 	align: 'right',
			// 	item: 100
			// },
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
		},
	    // 报表指数图标的数据格式 一
	    // fakeData: { data: [['2016-03-29', 10],['2016-03-30', 20], ['2016-03-31', 20],['2016-04-01', 20],['2016-04-02', 20],['2016-04-03', 20],['2016-04-04', 20]]},
	    // 报表指数图标的数据格式 二
	    fakeData: { 
	    	data: [{
		    	date: '2016-04-03',
		    	value: 10
		    }, {
		    	date: '2016-04-04',
		    	value: 20
		    }, {
		    	date: '2016-04-05',
		    	value: 20
		    }, {
		    	date: '2016-04-06',
		    	value: 20
		    }, {
		    	date: '2016-04-07',
		    	value: 20
		    }, {
		    	date: '2016-04-08',
		    	value: 20
		    }, {
		    	date: '2016-04-09',
		    	value: 20
		    }]
		},
	}

	function gen(day){
		var count = day || 7, res = [], delta = 24 * 3600 * 1000, now = Date.now();
		while(count){
			res.push({
				date: Highcharts.dateFormat('%Y-%m-%d', now - count * delta),
				value: Math.ceil((Math.random() * 80) + 20)
			})
			count--;
		}

		return res;
	}

	var diy = {
		presetAll: function(){
			this.$cb.prop('checked', true);
			this.getTagData();
		},
		presetDisable: function(){
			var res = this.$cbRes,
				tabs = this.$tab,
				count7 = 0,
				count30 = 0,
				def7 = [], def30 = [];
			res.each(function(i, el){
				var mid = $(el).attr('data-mid');
				var d7 = rest.article.read('charts', {mid, time: 'last_week'}).done(data => count7 += data.length);
				var d30 = rest.article.read('charts', {mid, time: 'last_month'}).done(data => count30 += data.length);
				def7.push(d7);
				def30.push(d30);
			});

			$.when.apply(null, def7).done(function(){
				if(count7 > 2)
					tabs.filter('[data-range="last_week"]').attr('data-disable', false);
			})
			$.when.apply(null, def30).done(function(){
				if(count30 > 2)
					tabs.filter('[data-range="last_month"]').attr('data-disable', false);
			})
		}
	}

	var artChart = {
		init: function(){
			this.$cb = $('#tagsContainer').find('[type="checkbox"]');
			this.$tab = $('#tagsTabContainer').find('.item');
			this.$cbRes = this.$cb.filter(function(){
				return $(this).attr('data-mid') != 'all';
			})
			this.$cbAll = this.$cb.filter(function(){
				return $(this).attr('data-mid') == 'all';
			})
			this.bindEvent();

			var _this = this;

			if(!this.chart){
				$('#chart').highcharts($.extend(true, {}, env.areaChartDefaultOptions, {
					tooltip: {
						formatter: function() {
							var fm = _this.getCurRange() == 'today' ? '%Y-%m-%d %H:%M:%S' : '%Y-%m-%d';
							var s = "<b>" + Highcharts.dateFormat(fm, this.x) + "</b><br />";
							$.each(this.points, function(i, item) {
								s += item.series.name + ": " + item.y + "<br />"
							})
							return s
						}
					},
					plotOptions: {
						series: {
							events: {
								click: function(e){
									var time = _this.getCurRange(),
										mid = e.point.series.name;
									//window.location.href = `base?mid=${mid}&time=${time}#/news/audit`;
								}
							}
						}
					}
				}));
				this.chart = $('#chart').highcharts();
				this.chartId = '#chart';
				var nameToId = this.nameToId = {};
				var idToName = this.idToName = {};
				this.$cb.each(function(i, el){
					var id = $(el).attr('data-mid'),
						name = $(el).attr('data-mid-name');
					nameToId[name] = id;
					idToName[id] = name;
				});
				diy.presetAll.call(this);
				diy.presetDisable.call(this)
			} else {
				this.updateTagData();
			}
		},
		bindEvent: function(){
			this.$cb.off();
			this.$tab.off();
			var _this = this;
			this.$cb.click(function(){
				_this.tagClickHandler(this)
			})
			this.$tab.click(function(){
				_this.tabClickHandler(this)
			})
		},
		tagClickHandler: function(tar){
			var $cb = this.$cb, mid = $(tar).attr('data-mid');
			var res = this.$cbRes;
			var all = this.$cbAll;

			if($(tar).prop('checked') == true){
				if(mid == 'all'){
					res.prop('checked', true);
				} else {
					if(this.isAllChecked())
						all.prop('checked', true);
				}
				this.getTagData();
			} else {
				if(mid == 'all'){
					res.prop('checked', false);
				} else {
					all.prop('checked', false);
				}
				this.removeChart(mid);
			}
		},
		isAllChecked: function(){
			var res = this.$cbRes;
			var result = true;
			res.each(function(i, el){
				if($(el).prop('checked') == false)
					result = false;
			})
			return result
		},
		getTagData: function(){
			var mid, range = this.getCurRange();
			var all = this.$cbAll;
			var res = this.$cbRes;
			var newMids;

			newMids = this.getNewMid();
			newMids.forEach((mid) => {
				rest.article.read('charts', {mid, time: range}).done(data => {
					this.drawChart({
						seriesName: mid,
						data: this.parseToDraw(data)
					})
				})
			})
		},
		updateTagData: function(){
			var mids = this.getCurMid(),
				range = this.getCurRange();

			mids.forEach((mid) => {
				rest.article.read('charts', {mid,time: range}).done(data => {
					this.updateChart({
						seriesName: mid,
						data: this.parseToDraw(data)
					})
				})
			})
		},
		getNewMid: function(){
			var chart = this.chart;
			var seriesNames = chart.series.reduce((obj, s) => {
				obj[this.nameToId[s.name]] = true;
				return obj
			}, {});
			var mids = [];
			this.$cbRes.each((i, el) => {
				if($(el).prop('checked'))
					mids.push($(el).attr('data-mid'))
			})

			mids = mids.filter(function(mid){
				return seriesNames[mid] ? false : true
			});

			return mids;
		},
		getCurRange: function(){
			var range;
			this.$tab.each(function(i, el){
				if($(el).hasClass('active')){
					range = $(el).attr("data-range");
				}
			})

			return range;
		},
		getCurMid: function(){
			var mids = [];
			this.$cb.each((i, el) => {
				if($(el).prop('checked') == true)
					mids.push($(el).attr('data-mid'));
			})

			var allIndex = mids.indexOf('all')
			if(allIndex != -1){
				mids.splice(allIndex, 1);
			}

			return mids;
		},
		drawChart: function(data){
			var chart = this.chart, drawOptions,
				colorMap = ['#0066cc', '#ffcc66', '#ff6633', '#9933ff', '#33ccff'];

			var series = {
				name: this.idToName[data.seriesName],
				data: data.data
			}

			chart.addSeries(series);
		},
		parseToDraw: function(data){
			var fstr = this.getCurRange() == 'today' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
			var format = function(str){
				str = $.trim(str);
				return fecha.parse(str, fstr).getTime();
			}
			var res = data.sort((a, b) => format(a.date) - format(b.date)).map(item => {
				return [format(item.date), item.value];
			})

			return res;
		},
		removeChart: function(seriesName){
			var chart = this.chart, idx, isAll = seriesName == 'all';
			if(chart == undefined)
				return;
			else{
				if(!isAll){
					chart.series.map((item, i) => {
						if(this.nameToId[item.name] == seriesName)
							idx = i;
					})

					if(idx != undefined)
						chart.series[idx].remove();
				} else {
					while(chart.series.length){
						chart.series[0].remove();
					}
				}
			}
		},
		tabClickHandler: function(tar){
			if(!$(tar).attr('data-disable') || $(tar).attr('data-disable') == 'false' && !$(tar).hasClass('active')){
				$(tar).parent().find('.item').removeClass('active');
				$(tar).addClass('active');
				this.getTabData();
			}
		},
		getTabData: function(){
			var range = this.getCurRange(),
				mids = this.getCurMid(),
				chart = this.chart;

			var draws = [], datas = [];

			chart.showLoading();

			mids.forEach(mid => {
				let d = rest.article.read('charts', {mid, time: range}).then(data => {
					datas.push({
						seriesName: mid,
						data: this.parseToDraw(data)
					});
				})
				draws.push(d);
			})

			$.when.apply(null, draws).then(() => {
				chart.hideLoading();
				datas.forEach(data => {
					this.updateChart(data)
				})
			})
		},
		updateChart: function(data){
			var chart = this.chart, idx;

			chart.series.map((item, i) => {
				if(this.nameToId[item.name] == data.seriesName){
					idx = i;
				}
			})

			if(idx != undefined){
				chart.series[idx].update({
					data: data.data
				})
			}
		},
		leave: function(){
			this.$cb.off();
			this.$tab.off();
			if(this.chart){
				this.chart.destroy();
				this.chart = null;
			}
		}
	}

	var emotChart = {

	}

	function runTotalChart(){
		artChart.init();
	}

	function runEmotChart(data){
		$('#emotChart').highcharts($.extend(true, {
			title: {
				style: {
					color: '#abc',
					fontSize: '24px'
				}
			},
			series: [{
				data: [{
					name: '正面',
					color: '#00b7ee',
					y: data.positive
				}, {
					name: '中立',
					color: '#ffcc66',
					y: data.neutral
				}, {
					name: '负面',
					color: '#ff3333',
					y: data.negative
				}]
			}]
		}, env.pieChartDefaultOptions))
	}

	return {
		runTotalChart,
		runEmotChart,
		leave: function(){
			artChart.leave();
		}
	}
})