define([paths.ex.page + '/advices/analy/profile2/options.js'], function(Opts){
	return {
		jinriyuqing: function(data){
			var total = data.positive + data.neutral + data.negative;
			return $.extend(true, {}, {
					toolbox: {
				    	itemSize: 20,
				    	right: 0,
						feature: {
							saveAsImage: {
								icon: 'image:///img/chart-download.png',
								title: '下载'
							}
						},
						iconStyle: {
							emphasis: {
								color: '#2c97de'
							}
						}
					},
					series: [{
						type: 'pie',
						radius: ['75%', '90%'],
						center: ['16.5%', '50%'],
						silent: true,
						data: [{
							name: '正面',
							value: data.positive,
							itemStyle: {
								normal: {
									color: '#3a99d8'
								}
							},
							label: {
								normal: {
									formatter: '{d}%',
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 28
									}
								}
							}
						}, {
							name: '其余',
							value: total == 0 ? 1 : total - data.positive,
							itemStyle: {
								normal: {
									color: '#eee'
								}
							},
							label: {
								normal: {
									formatter: function(){
										return data.positive + '条'
									},
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 16
									}
								}
							}
						}]
					}, {
						type: 'pie',
						radius: ['75%', '90%'],
						center: ['49.8%', '50%'],
						silent: true,
						data: [{
							name: '中立',
							value: data.neutral,
							itemStyle: {
								normal: {
									color: '#f6bb42'
								}
							},
							label: {
								normal: {
									formatter: '{d}%',
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 28
									}
								}
							}
						}, {
							name: '其余',
							value: total == 0 ? 1 : total - data.neutral,
							itemStyle: {
								normal: {
									color: '#eee'
								}
							},
							label: {
								normal: {
									formatter: function(){
										return data.neutral + '条'
									},
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 16
									}
								}
							}
						}]
					}, {
						type: 'pie',
						radius: ['75%', '90%'],
						center: ['83%', '50%'],
						silent: true,
						data: [{
							name: '负面',
							value: data.negative,
							itemStyle: {
								normal: {
									color: '#e9573f'
								}
							},
							label: {
								normal: {
									formatter: '{d}%',
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 28
									}
								}
							}
						}, {
							name: '其余',
							value: total == 0 ? 1 : total - data.negative,
							itemStyle: {
								normal: {
									color: '#eee'
								}
							},
							label: {
								normal: {
									formatter: function(){
										return data.negative + '条'
									},
									position: 'center',
									textStyle: {
										color: '#787878',
										fontSize: 16
									}
								}
							}
						}]
					}]
				})
		}
	}
})