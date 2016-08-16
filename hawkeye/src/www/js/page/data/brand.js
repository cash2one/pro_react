/**
 * 品牌首页 - 公用组件
 */

define([

	'mods',
	'../../plu/echarts.min.js',
	'../../plu/relatedSearch.js',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js'

], function (mods, echarts, relatedSearch, r, Modal) {
	
	var rest = r.index({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Brand = React.createClass({

		rest2: null,
		getInitialState: function(){
			return {
				page_index: 0,
				all_brand_data: [],
				category: '',
				category_data: '',
				category_list: [],
				category_data_list: [],

				formatUtil: echarts.format,
				isHasData: 0,

				url: null
			}
		},

		componentWillMount: function(){
			this.loadAllBrand();

			this.rest2 = r.brand({
				// stringifyData: false
			});
		},

		componentDidMount: function(){
			$('.frame-body-right').addClass('v2');

			// url判断
			var url = window.location.protocol + '//' + window.location.hostname;
			this.setState({url: url});
			var hash_path = window.location.hash.substring(2);
			var beg_path = hash_path.lastIndexOf('/') + 1;
			var end_path = hash_path.lastIndexOf('?');
			var path_name = hash_path.substring(beg_path, end_path);
			
			if(path_name == 'distribute') {
				this.setState({isHasData: 1, page_index: 2})

				var category_data_type = $.cookie("category_data_type");
				var one_all_brand_data = JSON.parse($.cookie("one_all_brand_data"));
				var category_data = $.cookie("category_data");
				var category = $.cookie("category");

				this.oneAllBrandShow(category_data_type, one_all_brand_data, category_data, category);

			} else if(path_name == 'interest') {
				this.setState({isHasData: 1, page_index: 1});

				var category_data_type = $.cookie("category_data_type");
				var category_data = JSON.parse($.cookie("one_brand_data"));
				var category = $.cookie("category");

				this.oneBrandShow(category_data, category, category_data_type);

			} else if(path_name == 'index') {
				$('svg').hide();
				$('canvas').parent().hide();

				this.setState({page_index: 0});
			}
		},

		// 获取所有品牌数据
		loadAllBrand: function(){
			var self = this;
			var opt = {
				category: 'all'
			};
			rest.brand.read('nav', opt).done(allBrandData => {
				this.setState({all_brand_data: allBrandData});
				allBrandData.map(function(index, elem) {	
					self.loadOneBrand(index.category, index.data);
				});
			});
		},

		// 获取单个榜单品牌数据
		loadOneBrand: function(category, data){
			var self = this;
			
			var i = 0;
			data.map(function(index, elem) {

				self.rest2.list.add(index.name);

				var opt = {
					from: self.dateFormatter(1),
					to: self.dateFormatter(0),
					trend: true,
					count: 50,
					type: index.type
				}
				self.rest2.list[index.name].read(category, opt).done(oneAllBrandData => {
					// var oneAllBrandData = {
					// 	"category": "test",
					// 	"data": []
					// }
					
					if(oneAllBrandData.data.length == 0){
						i++;
					}

					if(i == data.length) {
						self.setState({isHasData: -1});
					} else{
						self.setState({isHasData: 1});
					}

					self.setState({[index.name]: oneAllBrandData.data});
					// oneAllBrandData.data.map(function(key, el) {
					// 	self.rest2.relation.add(key.name);
					// });
				});
			});
		},

		// 日期格式换算
		dateFormatter: function(interval){
			var inv = interval ? interval : 0 ;
			var nowDate = new Date();
			var newDate =  new Date(nowDate);
			newDate.setDate(nowDate.getDate() - inv);
			var newDate_fat = newDate.getFullYear() + '-' + parseInt(newDate.getMonth() + 1) + '-' + newDate.getDate();
			return newDate_fat;
		},

		// tab切换 - 导航栏切换页面
		handleTabNav: function(e, all_brand_data , category_data , category){

			$(e.target).addClass('active').siblings('li').removeClass('active');

			var url = this.state.url + '/big-data#/brand';
			window.location.href = url;

			$('svg').hide();
			$('canvas').parent().hide();

			this.setState({page_index: 0});

		},

		// tab切换 - 所有品牌不同时间数据
		handleTabAllBrandTime: function(e, time, allBrandData) {

			$(e.target).addClass('active').siblings('li').removeClass('active');

			// 获取服务端时间以及tab时间换算日期
			var self = this;
			var opt = {
				from: this.dateFormatter(time),
				to: this.dateFormatter(),
				trend: true,
				count: 10
			}
			allBrandData.map(function(index, elem) {
				let category = index.category;
				let data = index.data;
				data.map(function(item, num) {
					self.rest2.list[item].read(category, opt).done(oneBrandData => {
						self.setState({[item]: oneBrandData.data});
					});
				})
			})
		},

		// tab切换 - 单个品牌分类不同时间数据
		handleTabOneBrandTime: function(e, time, category) {

			$(e.target).addClass('active').siblings('li').removeClass('active');

			var opt = {
				category: category
			};
			rest.brand.read('nav', opt).done(oneBrandData => {
				oneBrandData.map(function(index, elem) {
					self.loadOneBrand(index.category, index.data);
				});
			});

		},

		// 矩形树图
		convert: function(source, target, basePath) {
	        for (var key in source) {
	            // var path = basePath ? (basePath + '.' + key) : key;
	            var path = key;
	            if (key.match(/^\$/)) {

	            }
	            else {
	                target.children = target.children || [];
	                var child = {
	                    name: path
	                };
	                target.children.push(child);
	                this.convert(source[key], child, path);
	            }
	        }

	        if (!target.children) {
	            target.value = source.$rank || 1;
	        }
	        else {
	            target.children.push({
	                name: basePath,
	                value: source.$rank
	            });
	        }
	    },

		// 跳到单个榜单页面 - 矩形树图
		gotoOneAllBrandShow: function(category_data_type, one_all_brand_data, category_data, category) {
			
			$.cookie("category_data_type", category_data_type, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
			$.cookie("one_all_brand_data", JSON.stringify(one_all_brand_data), {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
			$.cookie("category_data", category_data, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
			$.cookie("category", category, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});

			var url = this.state.url + '/big-data#/brand/distribute';
			window.location.href = url;
		},
		
		oneAllBrandShow: function(category_data_type, one_brand_data, category_data, category) {
			
			// 获取keywords
			let key_arr = [];
			for(let item of one_brand_data) {
				key_arr.push(item.name)
			}

			let key_num = 5;
			let key_arr0 = [];
			let key_arr1 = [];
			for (var i = 0; i < key_num; i++) {
				key_arr0.push(one_brand_data[i].name);
			}
			for (var i = key_num; i < one_brand_data.length; i++) {
				key_arr1.push(one_brand_data[i].name);
			}

			this.setState({category: category});

			this.rest2.spread.add(category_data);
			var data_all_arr = [];
			var data_all_arr_1 = [];
			var data_all_arr_2 = [];

			var opt = {
				keywords: key_arr0,
				from: this.dateFormatter(1),
				to: this.dateFormatter(0),
				count: 10,
				type: category_data_type
			}
			this.rest2.spread[category_data].read(category, opt).done(oneAllBrandData_1 => {
				var opt = {
					keywords: key_arr1,
					from: this.dateFormatter(1),
					to: this.dateFormatter(0),
					count: 10,
					type: category_data_type
				}
				this.rest2.spread[category_data].read(category, opt).done(oneAllBrandData_2 => {

					data_all_arr = oneAllBrandData_2.concat(oneAllBrandData_1);

					// 数据处理
					let json_obj = {};
					let key_obj = {};
					data_all_arr.map(function(index, elem) {
						let key_sub_obj = {};
						index.data.map(function(key_sub, el) {
							key_sub_obj[key_sub.name] = {
								"$rank": key_sub.rank
							}
						})
						key_obj[index.keyword] = key_sub_obj;
					});
					json_obj[category_data] = key_obj;
					
					this.renderOneBrandCharts(key_obj, category_data);

				});
				
			});

			var color_arr = ['#e9573f', '#70ca63', '#a399d8', '#37bc9b', '#f6bb42', '#f88b37', '#967adc', '#ec3880', '#d73ab8', '#5866e6'];
		},

	    // 单个榜单页面 - 矩形树图
		renderOneBrandCharts: function(chartData, category_data){

			var self = this;
			
			var myChart = echarts.init(document.getElementById('one_brand_chart'));
			var formatUtil = echarts.format;

	    	var data = [];

	    	self.convert(chartData, data, '');

			myChart.setOption(this.option = {
		        title: {
		            text: '分布榜单 - ' + category_data,
		            left: '16px',
		            top: '0px',
		            textStyle: {
		            	color: '#444',
		            	fontFamily: 'PingFangSC-Light',
		            	fontWeight: 'normal'
		            }
		        },
		        tooltip: {},
		        color: ['#e9573f', '#70ca63', '#a399d8', '#37bc9b', '#f6bb42', '#f88b37', '#967adc', '#ec3880', '#d73ab8', '#5866e6'],
		        series: [{
		        	// nodeClick: 'link',
		        	roam:'move',
		            name: category_data,
		            type: 'treemap',
		            visibleMin: 300,
		            data: data.children,
		            leafDepth: 2,
		            levels: [
		                {
		                    itemStyle: {
		                        normal: {
		                            borderColor: '#555',
		                            borderWidth: 4,
		                            gapWidth: 4
		                        }
		                    }
		                },
		                {
		                    colorSaturation: [0.3, 0.6],
		                    itemStyle: {
		                        normal: {
		                            borderColorSaturation: 0.7,
		                            gapWidth: 2,
		                            borderWidth: 2
		                        }
		                    }
		                },
		                {
		                    colorSaturation: [0.3, 0.5],
		                    itemStyle: {
		                        normal: {
		                            borderColorSaturation: 0.6,
		                            gapWidth: 1
		                        }
		                    }
		                },
		                {
		                    colorSaturation: [0.3, 0.5]
		                }
		            ]
		        }]
		    });

		    window.onresize = myChart.resize;
		},

		// 计算哪个分类下的分类list
		getCategoryList: function(category, all_brand_data){
			for(let item of all_brand_data) {
				if(item.category == category) {
					this.setState({category_list: item.data});
					break;
				}
			}
		},

		// 跳到单个关键字页面 - 兴趣图谱
		gotoOneBrandShow: function(category_data, category, category_data_type) {
			
			$.cookie("category_data_type", category_data_type, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
			$.cookie("one_brand_data", JSON.stringify(category_data), {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
			$.cookie("category", category, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});

			var url = this.state.url + '/big-data#/brand/interest';
			window.location.href = url;
		},

		oneBrandShow: function(category_data, category, category_data_type){

			this.setState({key_data: category_data.name});

			// 跳过去兴趣图谱页 (todo...导航栏tab也要变化样式)

			let state_name = 'one_brand_'+ category_data.name;

			// 获取单个关键字数据 - 兴趣图谱所需数据
			this.rest2.relation.add(category_data.name);

			var opts = {
				// from: this.dateFormatter(1),
				// to: this.dateFormatter(),
				type: category_data_type,
				trend: false,
				count: 20
			};
			this.rest2.relation[category_data.name].read(category, opts).done(oneBrandData => {
				// let state_name = 'one_brand_'+ key.name;
				// self.setState({[state_name]: oneBrandData.data});
				
				// 处理单个关键字数据 - 转换成兴趣图谱需要的数据格式
				let category_id = 9999;
				
				let nodes_obj = {};
				for (let i = 0; i < oneBrandData.length; i++) {
					var tag_;
					
					if (oneBrandData[i].type == 'Brand') {
						tag_ = "1";
					} else if(oneBrandData[i].type == 'Commodity') {
						tag_ = "2";
					} else if(oneBrandData[i].type == 'Company') {
						tag_ = "3";
					} else if(oneBrandData[i].type == 'Product') {
						tag_ = "4";
					}
					
					nodes_obj[i] = {
						"id": i,
			            "keyword": oneBrandData[i].name,
			            "boardid": i,
			            "tag": tag_,
			            "pivot": 30
					}
				}

				let edges_arr = [];
				let edges_arr_temp = {};
				for (let i = 0; i < oneBrandData.length; i++) {
					edges_arr_temp = {
						"from": category_id,
						"to": i+1
					}
					edges_arr.push(edges_arr_temp);
				}

				let jsonStr = {
					"id": category_id,
					"keyword": category_data.name,
					"nodes": nodes_obj,
					"edges": edges_arr
				}

				if (jsonStr && jsonStr.keyword) {
					new RelatedSearch('key_relation_chart', jsonStr);
				} else {
					// hideDetailTabbox('key_relation_chart');
				}
				
			});
			
		},

		render: function(){

			const renderBrandMain = (page_index, isHasData) => {
				if(isHasData == 0) {
					return (<div></div>)
				} else if (isHasData == 1) {
					if(page_index == 0) { // 所有种类榜单
						return renderAllBrand();
					} else if(page_index == 1) { // 单个关键字兴趣图谱
						return renderOneBrand(this.state.key_data, this.state.category);
					} else if(page_index == 2) { // 单个榜单矩形树图
						return renderOneAllBrand(this.state.category_data, this.state.category);
					}
				} else if(isHasData == -1) {
					return (
						<div>
							<div className="tab-content">
								<div className='list-blank-holder v2 mt30 mb30'></div>
							</div>
						</div>
					)
				}
				
			}

			// 所有种类榜单
			const renderAllBrand = () => {
				return (
					<div>
						<div className="tab-content">
							{
								this.state.all_brand_data.map((index, elem) => {
									return (
										<div className="b-mod">
											<div className="row">
												{
													renderAllBrand_mod(index.data, index.category)
												}
											</div>
										</div>
									);
								})
							}
						</div>
					</div>
				)
				
			}

			const renderAllBrand_mod = (category_data, category) => {
				return (
					category_data.map((index, elem) => {
						return (
							<div className="col-xs-4 col-md-4 col-lg-3">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h5 className="panel-title">{index.name}</h5>
										<div className="b-more" id={"distribute_"+elem} onClick={e => this.gotoOneAllBrandShow(index.type, this.state[index.name], index.name, category)}>分布详情&nbsp;></div>
									</div>
									{
										renderAllBrand_mod_table(this.state[index.name], index.name, category, index.type)
									}
								</div>
							</div>
						)
					})
				);
			}

			const renderAllBrand_mod_table = (category_mod_data, category_data, category, category_data_type) => {
				if(category_mod_data) {
					return (
						<div>
							<table className="table table-striped spec">
								<thead>
									<th className="tc" style={{"width": "20%"}}>排名</th>
									<th style={{"width": "50%"}}>关键词</th>
									<th style={{"width": "25%"}}>曝光量</th>
									<th style={{"width": "5%"}}></th>
								</thead>
								<tbody>
								{
									category_mod_data.map((index, elem) => {
										return (
											<tr className={renderTableRankTop(elem)}>
												<td>
													<div className={elem < 3 && "rank-top-3"}>{elem + 1}</div>
												</td>
												<td onClick={e => this.gotoOneBrandShow(index, category, category_data_type)}>{index.name}</td>
												<td>{index.rank}</td>
												<td>
													{
														renderTrend(index.trend)
													}
												</td>
											</tr>
										)
									})	
								}
								</tbody>
							</table>
						</div>
					)
				}
			}

			const renderTableRankTop = (elem) => {
				if (elem < 3) {
					return "rank-top-10 fb"
				} else if(elem >= 3 && elem < 10) {
					return "rank-top-10"
				}
			}

			const renderTrend = (data) => {
				if (data == -1) {
					return <span className="iconfont icon-xiajiang"></span>
				} else if(data == 0) {
					return <span className="iconfont icon-wu">-</span>
				} else if (data == 1) {
					return <span className="iconfont icon-shangsheng"></span>
				}
			}

			// 单个关键字兴趣图谱
			const renderOneBrand = (key_data, category) => {
				return (
					<div>
						<div className="row">
							<div className="col-xs-12">
								<p className="key-relation-chart-title">{'兴趣图谱 - ' + key_data}</p>
								<div className="key-relation-chart" id="key_relation_chart"></div>
							</div>
						</div>
					</div>
				)
			}

			// 单个榜单矩形树图
			const renderOneAllBrand = (category_data, category) => {
				return(
					<div>
						<div className="row">
							<div className="col-xs-12">
								<div className="one-brand-chart" id="one_brand_chart"></div>
							</div>
						</div>
					</div>
				)
			}

			// 调整后去掉
			const renderCategoryList = (index, category_data) => {
				if (!this.state.isShow_category_list_all) {
					return (
						index == category_data && "active"
					)
				} else {
					return false
				}
			}

			return (
				<div className="brand-page" ref="brand_page">
					<div className="panel panel-default">
						<div className="b-title">品牌风云榜</div>
						<div className="b-nav" ref="b_nav">
							<ul>
								{
									this.state.all_brand_data.map((index, elem) => {
										return (
											<li className="active" onClick={e => this.handleTabNav(e, this.state.all_brand_data , index.data, index.category)}>{index.category}</li>
										);
									})
								}
							</ul>
						</div>
						{
							renderBrandMain(this.state.page_index, this.state.isHasData)
						}
					</div>
				</div>
			)
		}

	})

	return Brand
	
})