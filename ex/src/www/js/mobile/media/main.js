var app = {};
$.GetQueryString = function(name){  
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
	var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
	var context = "";  
	if (r != null)  
	     context = r[2];  
	reg = null;  
	r = null;  
	return context == null || context == "" || context == "undefined" ? "" : context;  
}
app = $.extend(app, {
	configs: {
		api: '/ex/api/v1/media/',
		apiArt: '/ex/api/v2/article/',
		userToken: $.GetQueryString('user_token'),
		mediaType: $.GetQueryString('media_type'),
		companyId: $.GetQueryString('company_id'),
		eventId: $.GetQueryString('event_id'),
		debug: false,
	}
})
app = $.extend(app, {
	init: function(){
		if(!this.inited){
			this.inited = true;
			this.initRest();
			this.initState();
			this.initEls();
			this.initChart();
			this.initMidsChart();
			this.initMidsChartNavi();
			this.initLoadTip();
			this.initLoadBar();
			this.initToggleBar();
			if(this.configs.debug){
				this.initLog();
			}
		}
	},
	initRest: function(){
		var _this = this;
		var rest = this.rest = new $.RestClient(this.configs.api, {
			stripTrailingSlash: true,
			ajax: {
				beforeSend: function(xhr){
					xhr.setRequestHeader('user_token', _this.configs.userToken)
				}
			}
		});
		rest.add('dist');
		rest.dist.add('company');
		rest.dist.add('event');

		rest.add('article');

		rest.add('company');
		rest.add('event');

		var restArt = this.restArt = new $.RestClient(this.configs.apiArt, {
			stripTrailingSlash: true,
			ajax: {
				beforeSend: function(xhr){
					xhr.setRequestHeader('user_token', _this.configs.userToken)
				}
			}
		});

		restArt.add('query');
	},
	initState: function(){
		this.state = {
			srcData: [],
			srcMidsData: {},
			srcMidsSelect: '',
			mediaCount: 0,
			loadEnd: false,
			loadTxt: '获取数据中......',
			loadStep: 0,
			loadTotal: 2,
			timeRange: 'today'
		}
	},
	initEls: function(){
		this.els = {}
	},
	initChart: function(){
		this.chartZaiti = echarts.init(document.getElementById('chart_zaiti'));
		this.chartZhengfu = echarts.init(document.getElementById('chart_zhengfu'));
	},
	initMidsChart: function(){
		this.chartMids = echarts.init(document.getElementById('chart_mids'));
	},
	initMidsChartNavi: function(){
		var _this = this;
		$('#chart_mids_navi').on('click', '.item', function(){
			$('#chart_mids_navi .item').removeClass('active');
			$(this).addClass('active');

			var mid = $(this).attr('data-category'), res;
			_this.state.srcMidsSelect = mid;
			res = _this.getMidsData();
			if(res){
				res.done(function(){
					_this.updateChartMids();
				})
			}
		});
	},
	initLoadTip: function(){
		// this.els.loadTip = $('<div class="advices-analy-spread-detail-load">' +
		// 	'<div class="wrapper">' +
		// 		'<div class="l">' +
		// 			'<span class="step"></span>' + 
		// 		'</div>' +
		// 		'<div class="r">' +
		// 			'<section class="tit">数据分析中</section>' + 
		// 			'<section class="state"></section>' + 
		// 			'<section class="bar">' + 
		// 				'<span class="inner pct50 active" style="width: 0"></span>' +
		// 			'</section>' +
		// 		'</div>'+
		// 	'</div>'+
		// '</div>').appendTo('body');

		this.els.loadBlank = $('<div class="advices-analy-spread-detail-load tip" style="display: none;">' +
			'<div class="wrapper">' +
				'<div class="l">' +
					'<span class="step">提示</span>' + 
				'</div>' +
				'<div class="r">' +
					'<section class="tit">暂无数据</section>' + 
					'<section class="state">您添加的自动标签暂时没有相关文章。您可以添加新的自动标签或者耐心等待。</section>' + 
				'</div>'+
			'</div>'+
		'</div>').appendTo('body');
		
	},
	initLog: function(){
		this.els.debug = $('<div></div>', {
			'class': 'log'
		}).css({
			'position': 'fixed',
			'width': '100%',
			'backgroundColor': '#fff',
			'left': 0,
			'bottom': 0,
			'minHeight': 100,
			'overflow-y': 'scroll'
		}).appendTo('body');
		this.$log = function(msg){
			this.els.debug.append('<p>' + msg + '</p>');
		}
	},
	initLoadBar: function(){
		this.els.loadBar = $(`<div class="load-bar"><span class="inner" style="width: 0"></span></div>`).appendTo('.advices-analy-media');
	},
	initToggleBar: function(){
		var toggles = $('#toggle-part .toggle-item'), _this = this;
		toggles.each(function(i, el){
			if($(el).attr('data-time') == _this.state.timeRange)
				$(el).addClass('active');
		}).click(function(){
			toggles.removeClass('active')
			$(this).addClass('active');

			var time = $(this).attr('data-time');
			if(_this.state.timeRange != time){
				_this.state.timeRange = time;
				_this.getData();
			}
		})
	}
});

app = $.extend(app, {
	getData: function(){
		var _this = this, rest = this.rest, restArt = this.restArt, timeRange = this.dealTimeRange();
		if(this.configs.mediaType == 'company'){
			restArt.query.read('count', {
				date: timeRange.join(',')
			}).then(data => {
				if(!data.result) return;
				if(data.count == 0){
					this.state.loadEnd = true;
					this.state.isBlank = true;
				} else {
					this.state.loadTxt = '统计数据加载完毕......';
					this.state.loadStep++;
					this.state.artTotal = data.count;
				}
				this.updateLoadTip();
				return data;
			}).then(data => {
				if(!data.result) return;
				$.when(this.getSrcData(), this.getMediaCount()).done(() => {
					this.state.srcMidsSelect = _this.state.srcData[0].category;
					let res = this.getMidsData();
					if(res){
						res.done(() => {
							this.update();
						})
					}
				})
			})
		} else if (this.configs.mediaType == 'event'){
			restArt.query.read('count', {
				inc: this.configs.eventId,
				date: timeRange.join(',')
			}).then(data => {
				if(!data.result) return;
				if(data.count == 0){
					this.state.loadEnd = true;
					this.state.isBlank = true;
				} else {
					this.state.loadTxt = '统计数据加载完毕......';
					this.state.loadStep++;
					this.state.artTotal = data.count;
				}
				this.updateLoadTip();
				return data;
			}).then(data => {
				if(!data.result) return;
				$.when(this.getSrcData(), this.getMediaCount()).done(() => {
					this.state.srcMidsSelect = _this.state.srcData[0].category;
					let res = this.getMidsData();
					if(res){
						res.done(() => {
							this.update();
						})
					}
				})
			})
		}
	},
	getSrcData: function(){
		var type = this.configs.mediaType, id, timeRange = this.dealTimeRange();
		if(type == 'event')
			id = this.configs.eventId;
		else if(type == 'company')
			id = this.configs.companyId;

		var _this = this, rest = this.rest;
		return rest.dist[type].read('category', id, {
			from: timeRange[0],
			to: timeRange[1]
		}).done(function(data){
			_this.state.srcData = data;
		});
	},
	getMediaCount: function(){
		var type = this.configs.mediaType, opts, timeRange = this.dealTimeRange();
		if(type == 'event'){
			opts = {
				company_uuid: this.configs.companyId,
				event_id: this.configs.eventId
			}
		} else if(type == 'company') {
			opts = {
				company_uuid: this.configs.companyId
			}
		}
		opts.from = timeRange[0];
		opts.to = timeRange[1];
		var _this = this;
		return this.rest[type].read('count', opts).done(function(data){
			_this.state.mediaCount = data.count || 0;
		})
	},
	getMidsData: function(){
		var _this = this, mid = this.state.srcMidsSelect, timeRange = this.dealTimeRange();

		var id, type;
		if(this.configs.mediaType == 'event' && this.configs.eventId != undefined){
			id = this.configs.eventId;
			type = 'event';
		} else if(this.configs.mediaType == 'company'){
			id = this.configs.companyId;
			type = 'company';
		}

		if(id){
			return this.rest.dist[type].read('media', id, {
				category: mid,
				count: 20,
				from: timeRange[0],
				to: timeRange[1]
			}).done(function(data){
				var srcMidsData = _this.state.srcMidsData;
				srcMidsData[mid] = data;
			})
		}
	}
});

app = $.extend(app, {
	update: function(){
		this.updateCount();
		this.updateChartZaiti();
		this.updateChartZhengfu();
		this.updateChartMids();
		this.updateChartMidsNavi();
		this.updateLoadTip();
	},
	updateCount: function(){
		var data = this.state.srcData,
			negTotal = this.dealZhengfu(data).negTotal,
			artTotal = this.state.artTotal;
		$('#count_mid').html(data.length);
		$('#count_art').html(artTotal);
		$('#count_media').html(this.state.mediaCount);
		$('#count_ratio').html((negTotal * 100 / artTotal).toFixed(2) + '%');
		console.log(negTotal, artTotal)
	},
	updateChartZaiti: function(){
		var data = this.dealZaiti(this.state.srcData);
		this.chartZaiti.setOption(data.opts);
	},
	updateChartZhengfu: function(){
		var data = this.dealZhengfu(this.state.srcData);
		this.chartZhengfu.setOption(data.opts);
	},
	updateChartMids: function(){
		var mid = this.state.srcMidsSelect;
		var data = this.dealMids(this.state.srcMidsData[mid]);
		this.chartMids.setOption(data);
	},
	updateChartMidsNavi: function(){
		var data = this.state.srcData,
			select = this.state.srcMidsSelect,
			items = '';
		$.each(data, function(i, dat){
			items = items + '<li class="item' + (select == dat.category ? " active" : '') + '" data-category="' + dat.category + '">' +
					'<span class="txt">' + dat.category_name + '</span>' +
				'</li>'
		});
		$('#chart_mids_navi').html(items);
	},
	updateLoadTip: function(){
		this.updateLoadBar();
		return;
		var loadStep = this.state.loadStep,
			loadEnd = this.state.loadEnd,
			isBlank = this.state.isBlank,
			loadTotal = this.state.loadTotal,
			loadTxt = this.state.loadTxt,
			loadTip = this.els.loadTip,
			loadBlank = this.els.loadBlank,
			_this = this;

		if(!loadEnd){
			if(!loadTip){
				this.els.loadTip = loadTip = $('<div class="advices-analy-spread-detail-load">' +
					'<div class="wrapper">' +
						'<div class="l">' +
							'<span class="step"></span>' + 
						'</div>' +
						'<div class="r">' +
							'<section class="tit">数据分析中</section>' + 
							'<section class="state">{this.state.loadtxt}</section>' + 
							'<section class="bar">' + 
								'<span class="inner pct50 active"></span>' +
							'</section>' +
						'</div>'+
					'</div>'+
				'</div>')
			}

			loadTip.find('.step').html(loadStep + '/' + loadTotal);
			loadTip.find('.state').html(loadTxt);
			loadTip.find('.bar .inner').css('width', ~~(+loadStep * 100 / +loadTotal) + '%');

			if(loadTotal == loadStep + 1){
				setTimeout(function(){
					_this.state.loadStep = loadTotal;
					_this.state.loadTxt = '图表绘制完成';
					_this.updateLoadTip();

					setTimeout(function(){
						_this.state.loadEnd = true;
						_this.updateLoadTip();
					}, 500)
				}, 1000);
			}
		} else {
			loadTip && loadTip.hide();
			if(isBlank){
				$('.advices-analy-media').addClass('loading');
				loadBlank.show();
			} else 
				$('.advices-analy-media').removeClass('loading');
		}
	},
	updateLoadBar: function(){
		var loadStep = this.state.loadStep,
			loadEnd = this.state.loadEnd,
			isBlank = this.state.isBlank,
			loadTotal = this.state.loadTotal,
			loadBlank = this.els.loadBlank,
			_this = this,
			loadBar = this.els.loadBar;

		if(!loadEnd){
			loadBar.find('.inner').css('width', ~~(+loadStep * 100 / +loadTotal) + '%');

			if(loadTotal == loadStep + 1){
				setTimeout(function(){
					_this.state.loadStep = loadTotal;
					_this.updateLoadBar();

					setTimeout(function(){
						_this.state.loadEnd = true;
						_this.updateLoadBar();
					}, 500)
				}, 1000);
			}
		} else {
			loadBar.hide();
			if(isBlank){
				loadBlank.show();
			} else 
				$('.advices-analy-media').removeClass('loading');
		}
	}
})

app = $.extend(app, {
	dealZaiti: function(data){
		var opts, legends = [], seriesData = [], artTotal = 0;
		$.each(data, function(i, dat){
			var value = dat.positive + dat.negative + dat.neutral,
				name = /*env.srcMap[dat.category]*/dat.category_name;
			legends.push(name);
			seriesData.push({
				name,
				value
			})
			artTotal += value;
		})

		opts = $.extend(true, {}, this.options.pie, {
			legend: {
				data: legends
			},
			series: [{
				data: seriesData
			}]
		});

		return {opts: opts, artTotal: artTotal};
	},
	dealZhengfu: function(data){
		var yAxisData = [], pos = [], neg = [], neu = [], opts, negTotal = 0;
		$.each(data, function(i, dat){
			yAxisData.unshift(/*env.srcMap[dat.category]*/dat.category_name);
			pos.unshift(dat.positive);
			neg.unshift(dat.negative);
			neu.unshift(dat.neutral);
			negTotal += dat.negative;
		})
		opts = $.extend(true, {}, this.options.bar2, {
			yAxis: {
				data: yAxisData
			},
			series: [{
				name: '正面',
				type: 'bar',
				stack: 1,
				data: pos,
				barMaxWidth: 30
			}, {
				name: '中立',
				type: 'bar',
				stack: 1,
				data: neu,
				barMaxWidth: 30
			}, {
				name: '负面',
				type: 'bar',
				stack: 1,
				data: neg,
				barMaxWidth: 30
			}]
		});
		yAxisData = pos = neg = neu = null;
		return {opts: opts, negTotal: negTotal};
	},
	dealMids: function(data){
		data = data || [];
		var xAxisData = [], pos = [], neg = [], neu = [], opts;
		$.each(data.slice(0,5), function(i, dat){
			xAxisData.push(dat.mid_name);
			pos.push(dat.positive);
			neg.push(dat.negative);
			neu.push(dat.neutral);
		})
		opts = $.extend(true, {}, this.options.bar, {
			xAxis: {
				data: xAxisData
			},
			series: [{
				name: '正面',
				type: 'bar',
				stack: 1,
				data: pos,
				barMaxWidth: 30
			}, {
				name: '中立',
				type: 'bar',
				stack: 1,
				data: neu,
				barMaxWidth: 30
			}, {
				name: '负面',
				type: 'bar',
				stack: 1,
				data: neg,
				barMaxWidth: 30
			}]
		})
		return opts;
	},
	dealTimeRange: function(){
		var time = this.state.timeRange, begin, end = Date.now(), delta = 24 * 3600 * 1000;
		if(time == 'today'){
			begin = end;
		} else if (time == 'week'){
			begin = end - 7 * delta;
		} else if (time == 'month'){
			begin = end - 30 * delta;
		}
		// return [fecha.format(new Date(begin), 'YYYY-MM-DD'), fecha.format(new Date(end), 'YYYY-MM-DD')];
		return []
	}
})

app = $.extend(app, {
	options: {
		pie: {
			tooltip: {
				trigger: 'item',
				formatter: "{b} : {c} ({d}%)",
				triggerOn: 'click'
			},
			legend: {
				x: 'center',
				y: '10',
				selectedMode: false,
				show: false
			},
			calculable: true,
			series: [{
				name: '',
				type: 'pie',
				radius: [20, 110],
				roseType: 'area',
				label: {
					normal: {
						show: true
					},
					emphasis: {
						show: true
					}
				},
				lableLine: {
					normal: {
						show: true
					},
					emphasis: {
						show: true
					}
				}
			}],
			color: ['#90D287', '#65BDDC', '#90868F', '#7DD5BE', '#F4C575', '#DF7468', '#B09EE0', '#5FACDD']
		},
		bar2: {
			tooltip: {
				trigger: 'axis',
				triggerOn: 'click',
				axisPointer: { // 坐标轴指示器，坐标轴触发有效
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
					shadowStyle: {
						color: 'rgba(220,220,220,.4)'
					}
				}
			},
			legend: {
				top: 11,
				right: 11,
				itemGap: 6,
				data: ['正面', '中立', '负面'],
				textStyle: {
					fontSize: 12,
					color: '#7b7a7a'
				}
				// selectedMode: false
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '5%',
				containLabel: true
			},
			xAxis: [{
				type: 'value',
				splitLine: {
					show: true
				},
				axisLabel: {
					rotate: 35,
					textStyle: {
						color: '#7b7a7a',
						fontSize: 12
					}
				}
			}],
			yAxis: {
				type: 'category',
				axisTick: {
					show: false
				},
				splitArea: {
					show: true,
					interval: 0,
					areaStyle: {
						color: ['rgba(240, 240, 240, .3)', 'rgba(220, 220, 220, .3)']
					}
				},
				axisLabel: {
					textStyle: {
						color: '#7b7a7a'
					}
				}
				// data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
			},
			// series: [{
			// 	name: '利润',
			// 	type: 'bar',
			// 	label: {
			// 		normal: {
			// 			show: true,
			// 			position: 'inside'
			// 		}
			// 	},
			// 	data: [200, 170, 240, 244, 200, 220, 210]
			// }],
			color: ['#5BABDF', '#F6C776', '#E17569']
		},
		bar: {
			tooltip: {
				trigger: 'axis',
				triggerOn: 'click',
				axisPointer: { // 坐标轴指示器，坐标轴触发有效
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
					shadowStyle: {
						color: 'rgba(220,220,220,.4)'
					}
				}
			},
			legend: {
				top: 11,
				right: 11,
				itemGap: 6,
				textStyle: {
					fontSize: 12,
					color: '#7b7a7a'
				},
				data: ['正面', '中立', '负面'],
				// selectedMode: false
			},
			grid: {
				containLabel: true
			},
			dataZoom: [{
				type: 'slider',
				start: 0,
				end: 100,
				zoomLock: true,
				realtime: false,
				show: false
			}],
			xAxis: {
				type: 'category',
				axisLine: {
					show: false
				},
				axisLabel: {
					interval: 0,
					// formatter: function(value){
					// 	return value.length > 3 ? value.slice(0,2) + '...' : value;
					// }
					rotate: 35,
					textStyle: {
						color: '#7b7a7a',
						fontSize: 12
					}
				},
				splitArea: {
					show: true,
					interval: 0,
					areaStyle: {
						color: ['rgba(240, 240, 240, .3)', 'rgba(220, 220, 220, .3)']
					}
				}
				// data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
			},
			yAxis: {
				type: 'value',
				axisLine: {
					show: false
				},
				axisLabel: {
					textStyle: {
						color: '#7b7a7a'
					}
				}
			},
			color: ['#5BABDF', '#F6C776', '#E17569']
			// series: [{
			// 	name: '邮件营销',
			// 	type: 'bar',
			// 	stack: '广告',
			// 	data: [120, 132, 101, 134, 90, 230, 210]
			// }, {
			// 	name: '联盟广告',
			// 	type: 'bar',
			// 	stack: '广告',
			// 	data: [220, 182, 191, 234, 290, 330, 310]
			// }]
		}
	}
})
app.init();
app.getData();