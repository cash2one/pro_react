/**
 * 用户反馈 - 问题反馈、媒体申请、导航申请公用组件
 */

define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js'

], function(mods, r, Modal){

	var rest = r.rcn({
		stringifyData: false
	});

	var ex_rest = r.ex({
		// stringifyData: false
	});

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Feedback = React.createClass({
		getInitialState: function(){
			return {
				tabIndex: 0,
				warn: false,
				warntxt: '',
				com_uuid: '',
				result: {},
				path_name:'',
				tipTxt: '',
				noBtn: true,

				media_type: 'ogc'
			}
		},

		componentDidMount: function(){

			$('.frame-body-right').addClass('v2');

			var hash_path = window.location.hash.substring(2);
			var beg_path = hash_path.lastIndexOf('/') + 1;
			var end_path = hash_path.lastIndexOf('?');
			var path_name = hash_path.substring(beg_path, end_path);

			this.setState({path_name: path_name})

			if(path_name == 'problem') {
				this.setState({tabIndex: 1});
				$('.tabli').eq(0).addClass('active').siblings().removeClass('active');
			} else if (path_name == 'media') {
				this.setState({tabIndex: 2});
				$('.tabli').eq(1).addClass('active').siblings().removeClass('active');
				this.state.result.media_type = 'ogc';
			} else if (path_name == 'nav') {
				this.setState({tabIndex: 3});
				$('.tabli').eq(2).addClass('active').siblings().removeClass('active');
			}

			rest.user.read().done(user => {
				this.setState({com_uuid: "xiaomitv"});
			})

			// ex_rest.media.read('top').done(media => {
			// 	this.setState({mediaArr: media});
			// })

		},

		validate:function(tabIndex){
			var self = this;

			var formid;
			var validator;

			if (tabIndex === 1) {

				formid = "#problem_fb";

				validator =  $(formid).validate({
					rules:{
						p_desc:{
							required:true
						}
					},
	                messages:{
	                    p_desc:{
	                    	required:"问题描述不能为空"
	                    }
	                }
				});

			} else if (tabIndex === 2) {

				formid = "#media_fb";

				validator =  $(formid).validate({
					rules:{
						ogc_media_name:{
							required:true
						},
						ugc_media_name:{
							required:true
						},
						web_link:{
							required:true
						},
						media_id:{
							required:true
						}
					},
	                messages:{
	                    ogc_media_name:{
	                    	required:"媒体名称不能为空"
	                    },
	                    ugc_media_name:{
	                    	required:"媒体名称不能为空"
	                    },
	                    web_link:{
	                    	required:"网站链接不能为空"
	                    },
	                    media_id:{
	                    	required:"媒体ID不能为空"
	                    }
	                }
				});

			} else if (tabIndex === 3) {

				formid = "#nav_fb";

				validator = $(formid).validate({
					rules:{
						nav_name:{
							required:true
						},
						web_link:{
							required:true
						}
					},
	                messages:{
	                    nav_name:{
							required:"导航名称不能为空"
						},
						web_link:{
							required:"网站链接不能为空"
						}
	                }
				});

			}

			return validator;

		},

		handleConfirm: function(tabIndex, formid, com_uuid, result){

			if( this.validate(tabIndex).form() ) {

				var company_uuid = com_uuid;
				
				var opt = {
					type: formid,
				    content: JSON.stringify(result),
				    company_uuid: company_uuid
				};

				if(tabIndex == 2) {
					var platform = this.state.platform;
					var media_rank = this.state.media_rank;
					var media_category = this.state.media_category;
					var produce_category = this.state.produce_category;
					
					if(!media_rank || media_rank == '' || !media_category || media_category == '' || !produce_category || produce_category == '') {

						if(this.state.media_type == 'ogc') {
							this.setState({warn: true, warntxt: '媒体等级、媒体分类、产品分类为必选字段'});
						}
						else {
							if (platform || platform == '') {
								this.setState({warn: true, warntxt: '托管平台、媒体等级、媒体分类、产品分类为必选字段'});
							}
						}
						
					} else {
						rest.feedback.create(opt).done(data =>{
							// 提交成功
							if(data.result) {
								$('#tipshow').modal('show');
								this.setState({tipTxt: '提交成功！', warn: false});
								var time = setTimeout(() => {
									$('#tipshow').modal('hide');
									this.setState({tipTxt: ''});
									$('.formReset')[0].reset();
								},800);

								this.setState({result: {}});

								this.setState({platform: '', media_rank: '', media_category: '', produce_category: ''});
							}
						}).error(data =>{
							$('#tipshow').modal('show');
							this.setState({tipTxt: data.responseJSON.msg});
						});
					}
				} else {
					rest.feedback.create(opt).done(data =>{
						// 提交成功
						if(data.result) {
							$('#tipshow').modal('show');
							this.setState({tipTxt: '提交成功！', warn: false});
							var time = setTimeout(() => {
								$('#tipshow').modal('hide');
								this.setState({tipTxt: ''});
								$('.formReset')[0].reset();
							},800);

							this.setState({result: {}});
						}
					}).error(data =>{
						$('#tipshow').modal('show');
						this.setState({tipTxt: data.responseJSON.msg});
					});
				}	
			}
		},

		handleTab: function(nowIndex, tabIndex, pathName){
			$('.formReset')[0].reset();
			this.validate(tabIndex).resetForm();
			this.setState({result: {} });

			var url = window.location.protocol + '//' + window.location.hostname +'/feedback#/'+ pathName;
			window.location.href = url;
		},

		handleChange:function(e, input_name){
			var value = e.target.value.trim();
			var name = input_name;

			this.state.result[name] = value;
		},

		// 选择生产方式-媒体类型
		handleMediaType: function(type, tabIndex){
			$('.reset').val('');
			this.validate(tabIndex).resetForm();

			this.setState({media_type: type, platform: '', ogc_media_name: '', ugc_media_name: '', media_id: '', web_link: ''});

			this.state.result.media_type = type;
			if(type == 'ogc') {
				delete this.state.result.ogc_media_name;
				delete this.state.result.web_link;
			} else {
				delete this.state.result.platform;
				delete this.state.result.ugc_media_name;
				delete this.state.result.media_id;
			}

		},

		// 下拉菜单操作
		handleSelectClick:function(e, input_name){
			var id = '#' + input_name;
			$(id).toggle(100);
			$(document).one('click',function() {
				$(id).hide(100);
			});
		},
		handleOptionListClick:function(e, input_name){
			var li_val = $(e.target).context.innerHTML;
			var id = '#' + input_name;
			var name = input_name;

			this.setState({[name]: li_val});

			this.state.result[name] = li_val;
			

			$(id).hide(100);
		},

		render: function(){
			const pageShow = () => {
				if (this.state.tabIndex === 0) {
					return (
						<div className="feedback-page">

						</div>
					)
				} else if (this.state.tabIndex === 1) {
					// 问题反馈
					return (
						<div>
							<div className="tab-content panel-body content">
								<div className="col-xs-6 col-xs-offset-3">
									<form id="problem_fb" className="formReset problem-form w">
									{
										// <p className="p1">亲爱的运营员您好：</p>
										// <p className="p2">我们时刻关注您的建议，不断优化产品，为您提供更优质的服务。</p>
									}
										<div className="clear pf-title mb10">
											<span className="iconfont icon-wenhao"></span>
											<span className="ic-txt">请问有什么可以帮助到您的吗？</span>
										</div>
										<div className="form-group">
											<textarea className="form-control" rows="10" 
											placeholder="亲爱的运营员：我们时刻关注您的建议，不断优化产品，为您提供优质服务。请简要描述您遇到的问题，我们会尽快为您解决。"
											name="p_desc" id="p_desc" onChange={e => {this.handleChange(e, "problem_desc")}}></textarea>
										</div>
										<div className="picbox none">
											<span className="addbtn"><i className="iconfont icon-jiahao"></i><span>添加图片</span></span>
											<span className="pics"><img src="img/del1.png" /><span>预览</span></span>
										</div>
									</form>
								</div>
							</div>
							<div className="panel-footer">
								<div className="pull-right">
									<button className="btn btn-primary btn-lg" onClick={e => this.handleConfirm(1, "problem_fb", this.state.com_uuid, this.state.result)}>提交</button>
								</div>
							</div>
						</div>
					)
				} else if (this.state.tabIndex === 2) {
					// 媒体申请
					return (
						<div>
							<div className="tab-content panel-body content">
								<div className="col-xs-6 col-xs-offset-3">
									<form id="media_fb" className="fb-container formReset media-form w form-horizontal">
										<div className="form-group">
											<label for="m_name" className="col-xs-2 control-label"><i>*</i>生产方式：</label>
											<div className="col-xs-4 control-label">
												<span className={this.state.media_type == 'ogc' ? "c-rd mr8 active" : "c-rd mr8"} onClick={e => this.handleMediaType('ogc', this.state.tabIndex)}></span>
												<span className="c-rd-txt unselect">职业媒体（ogc）</span>
										    </div>
									    	<div className="col-xs-4 control-label">
									    		<span className={this.state.media_type == 'ugc' ? "c-rd mr8 active" : "c-rd mr8"} onClick={e => this.handleMediaType('ugc', this.state.tabIndex)}></span>
									    		<span className="c-rd-txt unselect">自媒体（ugc）</span>
									        </div>
										</div>
										{
											this.state.media_type == 'ogc' ?
											<div>
												<div className="form-group">
													<label for="ogc_media_name" className="col-xs-2 control-label"><i>*</i>媒体名称：</label>
													<div className="col-xs-10">
														<input type="text" name="ogc_media_name" id="ogc_media_name" className="form-control reset" placeholder="请输入媒体名称"
														onChange={e => {this.handleChange(e, "ogc_media_name")}}/>
												    </div>
												</div>
												<div className="form-group">
													<label for="web_link" className="col-xs-2 control-label"><i>*</i>网站链接：</label>
													<div className="col-xs-10">
														<input type="text" name="web_link" id="web_link" className="form-control reset" placeholder="请输入网站链接"
														onChange={e => {this.handleChange(e, "web_link")}}/>
												    </div>
												</div>
											</div>
											: 
											<div>
												<div className="form-group">
													<label for="platform" className="col-xs-2 control-label"><i>*</i>托管平台：</label>
													<div className="col-xs-10">
														<div className="dropdown-v2 idx4">
															<div className="select" type="button" onClick={e => {this.handleSelectClick(e, "platform")}}>
																<input className="txt" placeholder="选择" name="platform" disabled value={this.state.platform}/>
																<span className="ic"><span className="corner"></span></span>
															</div>
															<ul className="option none" id="platform">
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>新浪微博</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>微信</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>百度百家</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>一点资讯</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>雪球</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>今日头条</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>i黑马</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>虎嗅</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>极客公园</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>36氪</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>雷锋网</li>
																<li onClick={(e) => {this.handleOptionListClick(e, "platform")}}>钛极客</li>
															</ul>
														</div>
													</div>
												</div>
												<div className="form-group">
													<label for="ugc_media_name" className="col-xs-2 control-label"><i>*</i>媒体名称：</label>
													<div className="col-xs-10">
														<input type="text" name="ugc_media_name" id="ugc_media_name" className="form-control reset" placeholder="请输入媒体名称"
														onChange={e => {this.handleChange(e, "ugc_media_name")}}/>
												    </div>
												</div>
												<div className="form-group">
													<label for="media_id" className="col-xs-2 control-label"><i>*</i>媒体ID：</label>
													<div className="col-xs-10">
														<input type="text" name="media_id" id="media_id" className="form-control reset" placeholder="请输入媒体ID"
														onChange={e => {this.handleChange(e, "media_id")}}/>
												    </div>
												</div>
											</div>
										}
										<div className="form-group">
											<label for="media_rank" className="col-xs-2 control-label"><i>*</i>媒体等级：</label>
											<div className="col-xs-10">
												<div className="dropdown-v2 idx3">
													<div className="select" type="button" onClick={e => {this.handleSelectClick(e, "media_rank")}}>
														<input className="txt" placeholder="选择" name="media_rank" disabled value={this.state.media_rank}/>
														<span className="ic"><span className="corner"></span></span>
													</div>
													<ul className="option none" id="media_rank">
														<li onClick={(e) => {this.handleOptionListClick(e, "media_rank")}}>甲</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_rank")}}>乙</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_rank")}}>丙</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_rank")}}>丁</li>
													</ul>
												</div>
											</div>
										</div>
										<div className="form-group">
											<label for="media_category" className="col-xs-2 control-label"><i>*</i>媒体分类：</label>
											<div className="col-xs-10">
												<div className="dropdown-v2 idx2">
													<div className="select" type="button" onClick={e => {this.handleSelectClick(e, "media_category")}}>
														<input className="txt" placeholder="选择" name="media_category" disabled value={this.state.media_category}/>
														<span className="ic"><span className="corner"></span></span>
													</div>
													<ul className="option none" id="media_category">
														<li onClick={(e) => {this.handleOptionListClick(e, "media_category")}}>纸媒</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_category")}}>广播</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_category")}}>电视</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_category")}}>网站</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "media_category")}}>移动互联网（移动app）</li>
													</ul>
												</div>
											</div>
										</div>
										<div className="form-group">
											<label for="produce_category" className="col-xs-2 control-label"><i>*</i>产品分类：</label>
											<div className="col-xs-10">
												<div className="dropdown-v2 idx1">
													<div className="select" type="button" onClick={e => {this.handleSelectClick(e, "produce_category")}}>
														<input className="txt" placeholder="选择" name="produce_category" disabled value={this.state.produce_category}/>
														<span className="ic"><span className="corner"></span></span>
													</div>
													<ul className="option none" id="produce_category">
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>门户</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>博客</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>播客</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>社交网络</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>微博</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>论坛</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>问答</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>贴吧</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>新闻客户端</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>移动直播</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>杂志</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>报纸</li>
														<li onClick={(e) => {this.handleOptionListClick(e, "produce_category")}}>电商</li>
													</ul>
												</div>
											</div>
										</div>
										<div className="form-group">
											<label for="media_intro" className="col-xs-2 control-label">&nbsp;&nbsp;媒体简介：</label>
											<div className="col-xs-10">
												<textarea className="form-control" rows="6" placeholder="" 
												name="p_desc" id="p_desc" onChange={e => {this.handleChange(e, "media_intro")}}></textarea>
											</div>
										</div>
										<div className="form-group">
											<label for="media_tag" className="col-xs-2 control-label">&nbsp;&nbsp;媒体标签：</label>
											<div className="col-xs-10 input-icon-form">
												<input type="text" name="media_tag" id="media_tag" className="form-control" placeholder="请输入媒体标签"
												onChange={e => {this.handleChange(e, "media_tag")}}/>
												{
													// <span className="iconfont icon-tianjia addbtn mr10"></span>
												}
											</div>
										</div>
										<div className={this.state.warn ? "warn" : "warn none"}>{this.state.warntxt}</div>
									</form>
								</div>
							</div>
							<div className="panel-footer">
								<div className="pull-right">
									<button className="btn btn-primary btn-lg" onClick={e => this.handleConfirm(2, "media_fb", this.state.com_uuid, this.state.result)}>提交</button>
								</div>
							</div>							
						</div>
					)
				} else if (this.state.tabIndex === 3) {
					// 导航申请
					return (
						<div>
							<div className="tab-content panel-body content">
								<div className="col-xs-6 col-xs-offset-3">
									<form id="nav_fb" className="fb-container nav-fb formReset nav-form w form-horizontal">
										<div className="form-group mt10">
											<label for="nav_name" className="col-xs-2 control-label"><i>*</i>导航名称：</label>
											<div className="col-xs-10">
												<input type="text" name="nav_name" id="nav_name" className="form-control" placeholder="请输入导航名称"
												onChange={e => {this.handleChange(e, "nav_name")}}/>
											</div>
										</div>
										<div className="form-group">
											<label for="web_link" className="col-xs-2 control-label"><i>*</i>网站链接：</label>
											<div className="col-xs-10">
												<input type="text" name="web_link" id="web_link" className="form-control" placeholder="请输入网站链接"
												onChange={e => {this.handleChange(e, "nav_link")}}/>
											</div>
										</div>
									</form>
								</div>
							</div>
							<div className="panel-footer">
								<div className="pull-right">
									<button className="btn btn-primary btn-lg" onClick={e => this.handleConfirm(3, "nav_fb", this.state.com_uuid, this.state.result)}>提交</button>
								</div>
							</div>							
						</div>
						
					)
				}
			}
			return (
				<div className="feedback-page container">
					<div className="panel panel-default gridbox">
						<div className="tab">
							<ul>
								<li className="tabli active" onClick={e => this.handleTab(1, this.state.tabIndex, "problem")}>问题反馈</li>
								<li className="tabli" onClick={e => this.handleTab(2, this.state.tabIndex, "media")}>媒体申请</li>
								<li className="tabli" onClick={e => this.handleTab(3, this.state.tabIndex, "nav")}>导航申请</li>
							</ul>
						</div>
						{
							pageShow()
						}
						<Modal title="温馨提示" id="tipshow" noBtn modalSm>
							<div className="m-msg">
								<p>{this.state.tipTxt}</p>
							</div>
						</Modal>
					</div>
				</div>
			)
		}
	})

	return Feedback;
})