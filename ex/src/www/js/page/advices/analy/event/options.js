define(function() {
	var options = {
		pie: {
			tooltip: {
				trigger: 'item',
				formatter: "{b} : {c} ({d}%)"
			},
			legend: {
				x: 'center',
				y: '10',
				selectedMode: false
				// data: ['rose1', 'rose2', 'rose3', 'rose4', 'rose5', 'rose6', 'rose7', 'rose8']
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
				},
				// data: [{
				// 	value: 10,
				// 	name: 'rose1'
				// }, {
				// 	value: 5,
				// 	name: 'rose2'
				// }, {
				// 	value: 15,
				// 	name: 'rose3'
				// }, {
				// 	value: 25,
				// 	name: 'rose4'
				// }, {
				// 	value: 20,
				// 	name: 'rose5'
				// }, {
				// 	value: 35,
				// 	name: 'rose6'
				// }, {
				// 	value: 30,
				// 	name: 'rose7'
				// }, {
				// 	value: 40,
				// 	name: 'rose8'
				// }]
			}],
			color: ['#ec6f5a', '#f7c65f', '#48c9a9', '#778afe', '#eb46ca']
		},
		bar2: {
			tooltip: {
				trigger: 'axis',
				axisPointer: { // 坐标轴指示器，坐标轴触发有效
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
					shadowStyle: {
						color: 'rgba(220,220,220,.4)'
					}
				}
			},
			legend: {
				top: 10,
				x: 'center',
				data: ['正面', '中立', '负面'],
				// selectedMode: false
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [{
				type: 'value',
				axisLine: {
					lineStyle: {
						color: ['#dedede']
					}
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: ['#dedede']
					}
				}
			}],
			yAxis: {
				type: 'category',
				axisTick: {
					show: false
				},
				axisLine: {
					lineStyle: {
						color: ['#dedede']
					}
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: ['#dedede']
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
			color: ['#52a6de', '#f7c65f', '#ec6f5a']
		},
		bar: {
			tooltip: {
				trigger: 'axis',
				axisPointer: { // 坐标轴指示器，坐标轴触发有效
					type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
					shadowStyle: {
						color: 'rgba(220,220,220,.4)'
					}
				}
			},
			legend: {
				x: 'center',
				y: 10,
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
					interval: 0
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: ['#dedede']
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
				}
			},
			color: ['#52a6de', '#f7c65f', '#ec6f5a']
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

	return options
})