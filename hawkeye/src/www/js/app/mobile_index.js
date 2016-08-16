require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160620",
	paths: {
		"mods": paths.rcn.lib + "/mods"
	}
})

require([
	"mods"
], function(mods){

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;

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

	var config = {
		stripTrailingSlash: true,
		stringifyData: true,
		ajax: {
			beforeSend: function(xhr){
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

		getInitialState: function(){
			return {
				keyIdMapName:{},
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
			}
		},

		componentDidMount: function(){
			this.loadPage();
		},

		loadPage: function() {

			rest.keywords.read().done(keysData => {

				if(keysData) {

					var keysOnData = [],
						keysOnData_default = [];

					// 组成开启的关键字数组（记录交互中的变化）
					keysData.map(index => {
						if(index.status === 1) {
							keysOnData.push(index);
						}
					});

					// 组成开启的关键字数组（默认不变的开启关键字显示）
					keysData.map(index => {
						if(index.status === 1) {
							keysOnData_default.push(index);
						}
					});

					// 组成关键字id和name的映射关系对象
					var keyIdMapName = {};

					for (var ki = 0; ki < keysData.length; ki++) {
						var kItem = keysData[ki];
						keyIdMapName[kItem.id] = kItem.keyword;
					}
					this.setState({keyIdMapName:keyIdMapName});  // id和name的映射对象


					this.setState({keysOnData: keysOnData, keysOnData_default: keysOnData_default, loading: false});

					// 根据是否存在开启的关键字的界面显示处理
					if( keysOnData.length === 0 ) {

						this.setState({hasKey: 1});
					} else {

						this.setState({hasKey: 2});

						// 给前5个开启的关键字赋值
						var colId, j, keyLen,
							cols = this.state.cols;

						if (keysOnData.length >= 5) { // 全部开启关键字个数在5个以上，给前5个颜色tooltip加色值
							keyLen = 5;
							this.setState({ maxCheck: 5 })

						} else { // 全部开启关键字个数不到5个，给开启关键字个数的tooltip加色值
							keyLen = keysOnData.length;
							var RestNum = parseInt(5 - keyLen);
							cols.splice( parseInt(keyLen), RestNum );
							this.setState({ maxCheck: keyLen, cols: cols });
						}

						for (var i = 0; i < keyLen; i++) {
							colId = '#tooltip'+i+'';
							$(colId).find('.col').css('background-color', cols[i]);
						}

						this.createCheckData(keysOnData)
					}

				}else {
					// 还未创建任何关键字
					this.setState({hasKey: 1});
				}
			})
		},

		// 初入页面的关键字及其数据显示
		createCheckData: function(keysOnData){

			// 开启关键字，最多显示5个
			var keyLen = this.state.maxCheck,
				days = this.state.defaultDays,
				cols = this.state.cols,
				ids = this.state.ids;

			for (var i = 0; i < keyLen; i++) {
				ids[i] = keysOnData[i].id;
			}

			this.setState({ids: ids});

			this.handleKeysTimeData(days, cols, ids, keysOnData);
		},

		// 获取各开启关键字数据
		handleKeysTimeData: function(days, cols, ids, keysOnData, e){

			this.setState({defaultDays: days}); // loadingIn: true

			// 区分tab切换 和 初入页面的 交互需求
			if (e) {
				$('.gridbox').find('.active').removeClass('active');
				e.target.classList.toggle('active');
			}

			var opt = {
				k: ids,
				days: days
			}
			rest.keywords.read('data', opt).done(keysTimeData => {

				var mark_num_day = 0;

				$.each(keysTimeData,function(index, el) {
					if(el.day !== '') {
						mark_num_day++;
					}
				});

				if (mark_num_day == 0) { //所选关键字都无数据

					this.setState({noData: 1});

				}else{

					this.setState({noData: 2});

					var temp, keyId;

					var keysCheckData = [];

					for (var i = 0; i < ids.length; i++) {
						keyId = ids[i];

						var key_name = this.state.keyIdMapName[keyId];
						temp = {
							id: keyId,
							color: cols[i],
							keyword: key_name,
							baidu: keysTimeData[keyId].baidu,
							data_360: keysTimeData[keyId].data_360,
							sina: keysTimeData[keyId].sina,
							youku: keysTimeData[keyId].youku,
							day: keysTimeData[keyId].day
						}
						keysCheckData[i] = temp;
					}

					this.setState({keysCheckData: keysCheckData, keysTimeData: keysTimeData}); // loadingIn: false

					this.renderChartData(keysCheckData, days);

				}

			})

		},

		// 根据获取的关键字数据，转换为折线图表显示所需数据
		renderChartData: function(keysCheckData, days){
			
			// 取关键字中天数最多的
			let max = keysCheckData[0].day.length;
			for(const item of keysCheckData) {
				if(item.day.length > max) {
					max = item.day.length
				}
			}
			
			// 折线图x轴间距
			var tickInterval, num_day;
			if(days === 15 || days === 30){
				num_day = max / 5;
				tickInterval = parseInt(num_day) * 24 * 3600 * 1000;
			}else{
				tickInterval = 1 * 24 * 3600 * 1000;
			}

			var dataType = ['baidu', 'data_360', 'sina'],
				chartsTit = ['百度指数','360指数','新浪指数'],
				chartData = [],
				chartXData = [],
				temp3;

			for (var i = 0; i < dataType.length; i++) {

				var chartId = '#chartsbox'+(i+1)+'';

				for (var j = 0; j < keysCheckData.length; j++) {
					if(keysCheckData[j].length !== 0) {
						temp3 = {
							name: keysCheckData[j].keyword,
							data: this.getChartData( keysCheckData[j], dataType[i] ),
							color: keysCheckData[j].color
						}
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
						formatter: function () {
						   return '<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' +
						   this.series.name + ":" + this.y;
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
				    	itemStyle: {width: "100%", fontSize: '13', color: '#787878', fontWeight: '100'},
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
		getChartData: function(keysCheckData, dataTypeItem){

			var totaldata = [],
				data_temp, xdata_temp, ydata_temp;

			for (var z = 0; z < keysCheckData.day.length; z++) {

				xdata_temp = new Date(keysCheckData.day[z]).getTime();
				ydata_temp = keysCheckData[dataTypeItem][z];
				data_temp = [xdata_temp,ydata_temp];
				totaldata[z] = data_temp;
			}
			return totaldata;
		},

		render: function(){
			var cols = this.state.cols;

			const pageShow = () => {
				if( this.state.hasKey === 0 ) {
					return (
						<div className="container-fluid">
						{
							// <Loader show={this.state.loading}/>
						}
						</div>
					)
				} else if ( this.state.hasKey === 1 ) {
					return (
						<div className="container-fluid">
							<div className='full-screen list-blank-holder'></div>
						</div>
					)
				} else if ( this.state.hasKey === 2 ) {
					return (
						<div className="container-fluid">
							<div className="fr-br-main">
								<div className="gridbox">
									<div className="tab">
										<ul>
											<li className="active" ref="tab1" onClick={e => this.handleKeysTimeData(7, this.state.cols, this.state.ids, this.state.keysOnData, e)} data-days='7'>近一周</li>
											<li className="" ref="tab2" onClick={e => this.handleKeysTimeData(15, this.state.cols, this.state.ids, this.state.keysOnData, e)} data-days='30'>近半个月</li>
											<li className="" ref="tab3" onClick={e => this.handleKeysTimeData(30, this.state.cols, this.state.ids, this.state.keysOnData, e)} data-days='90'>近一个月</li>
										</ul>
									</div>
									{
										// <Loader show={this.state.noData == 0 ? true : false}/>
									}
									<div className={this.state.noData == 2 ? "content" : 'none'}>
										{
											// <Loader show={this.state.loadingIn}/>
										}
										{
											<ul>
												<li>
													<div id="chartsbox1" className="chartsbox"></div>
												</li>
												<li>
													<div id="chartsbox2" className="chartsbox"></div>
												</li>
												<li>
													<div id="chartsbox3" className="chartsbox"></div>
												</li>
											</ul>
										}
									</div>
									<div className={this.state.noData == 1 ? 'list-blank-holder' : 'none'}></div>
								</div>
							</div>
						</div>
					)
				}
			}

			return (
				<div className="index-base-info fr-br-container">
					{
						pageShow()
					}
				</div>
			)
		}

	});

	ReactDOM.render(
		<Info />, document.getElementById('mobile_index_base'));
})
