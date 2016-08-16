/**
 * 大数据公用组件
 */

define(['mods', paths.rcn.util + '/rest.js'], function(mods, r){
	var React = require('mods').ReactPack.default;

	var rest = r.bigdata({
		// stringifyData: false
	});

	var Comp = React.createClass({
		getInitialState: function(){
			return {
				mcookie: [], // 存储历史搜索
				mdata: [], // 存储nav接口数据(name+官网url)
				tools: [], // 存储checkbox(name)
				urls: [], // 存储nav接口data数据(name+官网url)
				error: false,
				errortxt: '',
				cookieName: '',
				cookieTool: '',
				name_url_obj: {},
				menuName:''
			}
		},
		componentDidMount:function(){
			$('.frame-body-right').addClass('v2');
			this.loadData();
		},
		loadData: function(){
			rest.nav.read('data').done(data => {
				var bigData = data;
				var hash_path = window.location.hash.substring(2);
				var beg_path = hash_path.lastIndexOf('/') + 1;
				var end_path = hash_path.lastIndexOf('?');
				var path_name = hash_path.substring(beg_path, end_path);

				var cookie_name = path_name + 'key';
				var cookie_tool = path_name + 'tool';

				this.setState({mdata: bigData[path_name], cookieName: cookie_name, cookieTool: cookie_tool});

				// 关键字存cookie判断
				var cookie_main = $.cookie(cookie_name);
				if (cookie_main) {
					this.loadCookieKey(cookie_main);
				}

				// 选中工具存cookie判断
				var cookie_main_tool = $.cookie(cookie_tool);
				if (cookie_main_tool) {
					this.loadCookieTool(cookie_main_tool, bigData[path_name].length);
				}

				var menuName;
				if(path_name === 'authority') {
					menuName = '权威机构';
				} else if (path_name === 'industry') {
					menuName = '行业报告';
				} else if (path_name === 'index') {
					menuName = '指数榜单';
				} else if (path_name === 'sales') {
					menuName = '销售流量';
				}
				this.setState({menuName: menuName});
			})
		},
		loadCookieKey: function(cookie_main){

			var cookie_key = [];
			
			if(cookie_main.indexOf(',') > 0) {
				cookie_key = cookie_main;
				var strArray = cookie_key.split(",");
				var temp_arr = [];
				for(var i=0;i<strArray.length;i++) {
				    temp_arr.push(strArray[i]);
				}
				this.setState({mcookie: temp_arr});
			} else {
				cookie_key.push(cookie_main)
				this.setState({mcookie: cookie_key});
			}

		},
		loadCookieTool: function(cookie_main_tool, allLength){
			var cookie_tools = [];

			if(cookie_main_tool.indexOf(',') > 0) {
				cookie_tools = cookie_main_tool;
				var strArray = cookie_tools.split(",");
				var temp_arr = [];
				for(var i=0;i<strArray.length;i++) {
				    temp_arr.push(strArray[i]);
				}
				this.setState({tools: temp_arr});

				// 当选中的是最后一个checkbox时，选中全选按钮
				if(temp_arr.length == allLength) {
					$("#allcheck").trigger('click');
				}

			} else {
				cookie_tools.push(cookie_main_tool)
				this.setState({tools: cookie_tools});
			}

		},
		saveCookie: function(cookie_name, searchKey) {
			// 将搜索结果存入cookie
			var cookie_key = [];
			var cookie_main = $.cookie(cookie_name);

			// 重复检查、最多存8个历史搜索结果（需求去掉改功能）
			if (cookie_main) {
				if(cookie_main.indexOf(',') > 0) {

					var strArray = cookie_main.split(",");
					var temp_arr = [];
					for(var i = 0; i < strArray.length; i++) {
						temp_arr.push(strArray[i]);
					}

					// 历史搜索排重问题
					var mark = -1;
					for (var i = 0; i < temp_arr.length; i++) {
						if(temp_arr[i] === searchKey) {
							mark = i;
							break;
						}
					}
					if (mark == -1) {
						if(temp_arr.length > 7) {
							temp_arr.splice(7,1); // 去掉第8个
						}
						temp_arr.unshift(searchKey); // 从头加入新的搜索关键字
					} else {
						temp_arr.splice(parseInt(mark),1); // 去掉历史搜索存在的该字段
						
						temp_arr.unshift(searchKey); // 从头加入新的搜索关键字
					}

					$.cookie(cookie_name, temp_arr, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
					this.setState({mcookie: temp_arr});

				} else if (searchKey !== cookie_main) {
				// } else {
					cookie_key.unshift(cookie_main)
					cookie_key.unshift(searchKey);
					$.cookie(cookie_name, cookie_key, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
					this.setState({mcookie: cookie_key});
				}
			} else {
				$.cookie(cookie_name, searchKey, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
				cookie_key.unshift(searchKey);
				this.setState({mcookie: cookie_key});
			}
		},
		// 未选择的单选框
		handleCheckbox: function(elem, name, tools, allLength){
			
			var toolName = name;
			var st_tools = tools;
			var input_id = 'cb'+ elem;
			var label_id = 'lb'+ elem;
			var st_cookieTool = this.state.cookieTool;

			$('#'+input_id).trigger('click');
			$('#'+label_id).parents('.indexbox').toggleClass('active'); 
			
			if ($('#'+input_id).is(':checked')) {

				st_tools.push(toolName);

				// 当选中的是最后一个checkbox时，选中全选按钮
				if(st_tools.length == allLength) {
					$("#allcheck").trigger('click');
				}
				
			} else {

				for (var i = 0; i < st_tools.length; i++) {
					if(st_tools[i] === toolName) {
						st_tools.splice(i,1)
					}
				}

				if ( $("#allcheck").is(":checked") && st_tools.length < allLength ) {
					$("#allcheck").trigger('click');
				}
			}
			this.setState({tools: st_tools});
			$.cookie(st_cookieTool, st_tools, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
		},
		// 针对已选择的单选框
		handleCheckboxTrue: function(elem, name, tools, allLength){
			var toolName = name;
			var st_tools = tools;
			var input_id = 'cb'+ elem;
			var label_id = 'lb'+ elem;
			var st_cookieTool = this.state.cookieTool;

			if (!$('#'+input_id).is(':checked')) {

				$('#'+input_id).trigger('click');
				$('#'+label_id).parents('.indexbox').toggleClass('active'); 

				st_tools.push(toolName);
				// 当选中的是最后一个checkbox时，选中全选按钮
				if(st_tools.length == allLength) {
					$("#allcheck").trigger('click');
				}
			}
			this.setState({tools: st_tools});
			$.cookie(st_cookieTool, st_tools, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});
		},
		// 全选
		handleAllCheckbox: function(mdata, tools){
			var st_mdata = mdata;
			var sta_tools = tools;
			var st_cookieTool = this.state.cookieTool;

			if( !$("#allcheck").is(":checked") ) { // 它为全选按钮

				$(".cb").removeAttr('checked');
				$('.lb').parents('.indexbox').removeClass('active');

				$("#allcheck").trigger('click');
				$(".cb").trigger('click');
				$('.lb').parents('.indexbox').toggleClass('active');

				st_mdata.map((index, elem) => {
					sta_tools.push(index.name)
					return sta_tools;
				})
				this.setState({tools: sta_tools});
				$.cookie(st_cookieTool, sta_tools, {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});

			} else { // 它为全不选按钮

				$('.lb').parents('.indexbox').addClass('active');

				$("#allcheck").trigger('click');
				$(".cb").removeAttr('checked');
				$('.lb').parents('.indexbox').toggleClass('active');

				this.setState({tools: []});
				$.cookie(st_cookieTool, [], {domain: paths.rcn.domain, expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)});

			}
		},
		handleChange: function(index, mdata){
			var searchKey = $('#searchTxt').val(index);
		},
		handleNav: function(tools, cookie_name, menuName){

			this.setState({urls: []}); // 重置各工具标题链接
			var searchKey = $('#searchTxt').val().trim();

			// 加埋点
			for (var i = 0; i < tools.length; i++) {
				_hmt.push(['_trackEvent', 'tool_'+ menuName, 'tool_'+ tools[i], 'tool_'+ searchKey]);
			}

			// 加记录输入值的埋点
			_vds.push(['setCS3', 'bigData_searchKey', searchKey]);

			// if(searchKey !== '') {

				if (tools.length > 0) {

					if (searchKey !== "") {
						this.saveCookie(cookie_name, searchKey);
					}

					var check_tools = tools;

					var opt = {
						key: searchKey,
						tools: check_tools
					}
					rest.nav.read('url', opt).done(data => {
						this.setState({urls: data, error: false, errortxt: ''});
						$('.gotolink').trigger('click');

						var new_Obj = {}; 
						for (var i = 0; i < check_tools.length; i++) {
							for (var j = 0; j < data.length; j++) {
								if(check_tools[i] === data[j].name) {
									new_Obj[check_tools[i]] = data[j].url;
									break;
								}
							}
						}
						this.setState({name_url_obj: new_Obj});
					});

				} else {
					// 出错
					var errortxt = '请选择下方工具完成导航操作';
					this.setState({error: true, errortxt: errortxt});
				}

			// } else {
				// 出错
				// var errortxt = '请填写搜索关键字';
				// this.setState({error: true, errortxt: errortxt});
			// }
			
		},
		openLink: function(toolName, menuName, tool_url, cookie_name, elem, tools, allLength){
			var searchKey = $('#searchTxt').val().trim();
			
			_hmt.push(['_trackEvent', 'tool_'+ menuName, 'tool_'+ toolName, 'tool_'+ searchKey]);

			if(searchKey !== '') {
				this.saveCookie(cookie_name, searchKey);
			}

			var opt = {
				key: searchKey,
				tools: toolName
			}
			rest.nav.read('url', opt).done(data => {
				this.setState({error: false, errortxt: ''});
				var cur_tool_url = data[0].url;
				window.open(cur_tool_url, "_blank")
			});

			this.handleCheckboxTrue(elem, toolName, tools, allLength);
		},

		render: function(){
			const urlList = (name, url, name_url_obj, elem, tools, allLength) => {
				var name_url_obj_ = name_url_obj;
				var name_url = name_url_obj_[name];
				var toolName = name;
				if (name_url) {
					return ( // name_url
						<a target="_blank" onClick={e => this.openLink(toolName, this.state.menuName, name_url,this.state.cookieName, elem, tools, allLength)}>{toolName}</a>
					)
				} else {
					return ( // url
						<a target="_blank" onClick={e => this.openLink(toolName, this.state.menuName, url,this.state.cookieName, elem, tools, allLength)}>{toolName}</a>
					)
				}
			}
			const checkboxShow = (index_name, elem, tools) => {
				var temp_cb;
				if (tools.length > 0) {
					for (var i = 0; i < tools.length; i++) {
						if( index_name == tools[i] ) {
							temp_cb =	<input type="checkbox" id={'cb' + elem} className="cb" checked/> ;
							break;
						} else {
							temp_cb =	<input type="checkbox" id={'cb' + elem} className="cb" />
						}
					}
				} else {
					temp_cb =	<input type="checkbox" id={'cb' + elem} className="cb" />
				}
				return temp_cb;
			}
			const isActive = (indexName, tools) => {
				var temp_cl;
				if (tools.length > 0) {
					for (var i = 0; i < tools.length; i++) {
						if (tools[i] == indexName) 
						{	
							temp_cl = "indexbox active";
							break;
						}
						else
							temp_cl = "indexbox";
					}
				} else {
					temp_cl = "indexbox";
				}
				return temp_cl;
			}
			return (
				<div className="big-data h">
					<div className="container">
						<div className="panel">
							<div className="panel-body">
								<div className="mod-top">
									<div className="top">
										<img src={paths.rcn.api+"/img/data-logo.png"}/>
									</div>
									<div className="main">
										<div className="searchbox">
											<div className="none">
												{
													this.state.urls.map((index, elem) => {
														return (
															<a href={index.url} target="_blank"><li className="gotolink">{index.name}</li></a>
														)
													})
												}
											</div>
											<div className="ovh">
												<div className="c-search" id="searchbox">
													<input type="text" growing-track='true' className="s-input" placeholder="请输入您要搜索的关键词" id="searchTxt"
													onFocus={e => e.target.select()}
													onKeyDown={e => e.keyCode === 13 && this.handleNav(this.state.tools, this.state.cookieName, this.state.menuName) }/>
													<span className="s-btn" onClick={e => this.handleNav(this.state.tools, this.state.cookieName, this.state.menuName)}>
														<span className="iconfont icon-sousuo"></span>
													</span>
												</div>
											</div>
										</div>
										<div className="histroybox">
											<span className="tit">历史搜索：</span>
											{
												this.state.mcookie.map((index, elem) => {
													return (
														<span className="txt" title={index} 
														onClick={e => this.handleChange(index, this.state.mdata)}>{index}</span>
													)
												})
											}
										</div>
									</div>
								</div>
							</div>
							<div className="mod-line"></div>
							<div className="mod-bottom">
								<div className="titbox">
									<span className={this.state.error ? "txt" : "txt none"}>{this.state.errortxt}</span>
									<div className="c-checkbox fl">
										<input type="checkbox" id="allcheck"/>
										<label onClick={e => this.handleAllCheckbox(this.state.mdata, this.state.tools)}></label>
										<span id="allchecktxt">全选</span>
									</div>
								</div>
								<div className="index-container">
									{
										this.state.mdata.map((index, elem) => {
											return (
												<div className={ isActive(index.name, this.state.tools) }>
													<div className="headbox">
														{
															urlList(index.name, index.url, this.state.name_url_obj, elem, this.state.tools, this.state.mdata.length)
														}
														<div className="c-checkbox fr">
															{
																checkboxShow(index.name, elem, this.state.tools, this.state.tools)
															}
															<label id={'lb' + elem} className="lb" onClick={e => this.handleCheckbox(elem, index.name, this.state.tools, this.state.mdata.length)}></label>
														</div>
													</div>
													<p className="contbox">{index.info}</p>
												</div>
											)
										})
									}
								</div>
								<div className="warmbox">
									<div className="warmtxt">
										如果您有经常使用，而我们未收录的导航，请点击
										<a href={paths.rcn.api+"/feedback#/nav"} target="_blank">导航申请</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
	})

	return Comp
})