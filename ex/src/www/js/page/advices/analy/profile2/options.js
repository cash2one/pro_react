define(function(){
	return {
		jinriyuqing: {
			tooltip: {
				formatter: "{b}: {c}条"
			},
			title: {
				x: 'center',
				y: 'center',
				textStyle: {
					color: '#787878',
					fontSize: 28
				},
				subtextStyle: {
					color: '#787878',
					fontSize: 16
				}
			},
			series: {
				type: 'pie',
				radius: ['75%', '90%'],
				silent: true,
				label: {
					normal: {
						show: false
					}
				}
			}
		}
	}
})