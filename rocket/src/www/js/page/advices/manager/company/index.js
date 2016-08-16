/**
 * 公司列表
 */

define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js'

], function(mods,r, Modal){

	var rest = r.rcn({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var Company = React.createClass({
		contextTypes: {
			updateNav: React.PropTypes.func.isRequired
		},

		getInitialState: function(){
			return {
				MgrOrVer:false,
				warn:false,
				warntxt:'',
				isFormOK:false,
				noBtn:false,
				isUuid:false,
				c_uuid:'',
				cur_page:1,
				beg:0,
				total:0,
				count:15,
				isSearch:false,
				search_result_none:false,
				modTitle:'',
				opt:'',
				mdata:[],
				com_props:[],
				uuid:'',
				selectValue:'',
				selectType:'',
				isShowSelectList:false,
				warn:false,
				tipTxt:'',
				istipTxt2:false,
				tipTxt2:'',

				cur_com_name:'',

				userinfo: {}
			}
		},
		componentDidMount:function(){
			$('.frame-body-right').addClass('v2');
			this.enterMgrOrVer();	

			var opt = {
				uuid:''
			}
			rest.user.update('com',opt).done(ret => {
				if(ret.result){
					this.context.updateNav()
				}
			}).error(data => {
				
				if(data.status === 400 && data.responseJSON.msg){
					this.setState({warn:true, warntxt:data.responseJSON.msg});
				}else{
					$('#smModal').modal('show');
					this.setState({tipTxt:"切换公司失败，请联系管理员"});
				}
			});
		},
		componentDidUpdate:function(){
			if (this.state.MgrOrVer) {
				// 鼠标移入移出删除和编辑按钮出现
				$(".com-list li").mouseover(function(){
					$(this).find('.iconfont').show();
				}).mouseout(function(){
					$(this).find('.iconfont').hide();
				});
			}
		},

		enterMgrOrVer:function(){
			rest.user.read().done((data) => {
				var cur_com_name = data.company;
					this.setState({cur_com_name:cur_com_name});
					this.setState({userinfo: data});
				var role = data.role_group;

				if(role === 'role_super_manager')
					this.setState({MgrOrVer:true});
				
				this.loadDataFromServer();
			})
		},

		// jq表单验证
		validate:function(){

			var self = this;
			
			return $("#add_com").validate({
				rules:{
					name: "required",
					uuid: {
						required:true,
						first_en_num:true,
						maxlength:12
					}
				},
                messages:{
                    name:{
                        required:"用户名不能为空"
                    },
                    uuid:{
                        required:"公司ID不能为空",
                        maxlength:"公司ID不超过12个字符"
                    }
                }
			}).form();
		},

		// 鼠标点击搜索框获取焦点，并发生样式变动
		focusSearch:function(){
			this.setState({isSearch:true});
			$('#search_btn').removeAttr('disable');
		},
		// 弹窗关闭
		handleDismiss:function(){
			$('#myModal').modal('hide');
			this.formReset();
		},

		// 新建公司
		handleAdd:function(){
			$('#myModal').modal('show');
			this.formReset();
			this.setState({modTitle:'添加公司', opt:'add'});
		},
		// 修改公司
		handleEdit:function(e, index){
			e.stopPropagation();

			var uuid = index.uuid;
			var name = index.name;
			var desc = index.desc;
			var com_props = index.property.name;
			var com_type = index.property.type;

			$('#name').val(name);
			$('#desc').val(desc);
			
			$('#myModal').modal('show');
			this.setState({modTitle:'修改公司', opt:'edit', isUuid:false, uuid:uuid, selectValue:com_props, selectType:com_type});
		},
		// 删除公司
		handleDelete:function(e, uuid){
			e.stopPropagation();
			$('#smModal').modal('show');
			this.setState({tipTxt:'您确定删除此公司吗?', istipTxt2:true, tipTxt2:'（确定删除后，此公司包括里面的数据将一并清除）', uuid:uuid});
		},
		// 确认删除
		handleTipConfirm:function(){
			var uuid = this.state.uuid;
			rest.company.del(uuid).done(data => {
				if(data.result){
					this.setState({tipTxt:'删除成功', istipTxt2:false, noBtn:true});
					var time = setTimeout(() => {
						this.handleTipDismiss();
						var beg = this.state.beg;
						this.loadComData(beg);
						this.setState({noBtn:false});
					},800);
				}
			}).error(data => {

				if(data.status === 400 && data.responseJSON.msg){
					this.setState({warn:true, warntxt:data.responseJSON.msg});
				}else if(data.status === 301){
					window.location.reload();
				}else{
					this.setState({warn:true, warntxt:"服务器出错,请联系管理员"}); 
				}
				
			});
		},

		// 搜索功能
		handleSearch:function(){
			var searchTxt = $('#searchTxt').val();
			if(searchTxt !== ''){
				rest.company.read({beg:0,count:this.state.count,search:searchTxt}).done((mdata) => {
					if(mdata.count === 0){
						this.setState({search_result_none:true, mdata:[], total:mdata.count});
						$('.com-rt span').html('为您找到相关结果约0条')
					}else{
						this.setState({search_result_none:false, mdata:mdata.companys, total:mdata.count});
						$('.com-rt span').html('为您找到相关结果约'+mdata.count+'条')
					}
				});
			}else{
				this.loadComData(0);
				this.setState({search_result_none:false});
				$('.com-rt span').html('公司列表');
			}
		},

		// 表单重置
		formReset:function(){
			$('.reset').val('');
			this.setState({selectValue:'选择', uuid:'', isSearch:false, warn:false});
		},
		// 提交表单
		handleConfirm:function(){

			if(this.validate()) {

				var result = {};
				var name = $('#name').val().trim();
				var desc = $('#desc').val().trim();
				var uuid = $('#uuid').val().trim();
				var com_props = this.state.selectValue;
				var com_type = this.state.selectType;

				result = {name: name, desc: desc, uuid:uuid, property:com_type}; 

				this.handleNewConfirm(result, uuid);
			}
		},
		handleNewConfirm:function(result, uuid){
			if(this.state.opt === 'add'){
				// 添加
				rest.company.create(result).done(data => {
					if(data.result){
						this.handleDismiss();
						var beg = this.state.beg;
						this.loadComData(beg);
						this.formReset();
						this.setState({search_result_none:false});
						$('#searchTxt').val(null);
					}
				}).error(data => {

					if(data.status === 400 && data.responseJSON.msg){
						if(data.responseJSON.recommendation) {
							this.setState({isUuid:true, c_uuid:data.responseJSON.recommendation, warn:true, warntxt:"公司ID已重复，请重新输入或者选择参考ID"}); // 公司ID数据库里已存在相同ID
						}else {
							this.setState({warn:true, warntxt:data.responseJSON.msg});
						}
					}
				});
			}else{
				var uuid = this.state.uuid;
				// 修改
				rest.company.update(uuid,result).done(data => {
					if(data.result){
						this.handleDismiss();
						var beg = this.state.beg;
						this.loadComData(beg);
						this.formReset();
						this.setState({search_result_none:false});
						$('#searchTxt').val(null);
					}
				}).error(data => {
					if(data.status === 400 && data.responseJSON.msg){
						this.setState({warn:true, warntxt:data.responseJSON.msg});
					}
				});
			}
		},

		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss:function(){
			$('#smModal').modal('hide');
		},

		// 下拉菜单操作
		handleSelectClick:function(e){
			$('#dd_option').toggle(100);
			$(document).one('click',function() {
				$('#dd_option').hide(100);
			});
		},
		handleOptionListClick:function(index){
			var val = index.name;
			var type = index.type;
			this.setState({selectValue:val, selectType:type});

			$('#dd_option').hide(100);
		},

		// 分页
		changeAutoPage:function(page){
			var count = this.state.count;
			if(page === 1){
				var beg = 0;
			}else{
				var beg = parseInt(count*(page-1));
			}
			this.setState({cur_page:page});

			var searchTxt = $('#searchTxt').val();
			if(searchTxt !== ''){
				rest.company.read({beg:beg,count:this.state.count,search:searchTxt}).done((mdata) => {
					if(mdata.length === 0){
						this.setState({search_result_none:true, mdata:[], total:mdata.count});
					}else{
						this.setState({search_result_none:false, mdata:mdata[conn_name], total:mdata.count});
					}
				});
			}else{
				this.loadComData(beg);
			}
		},

		// 切换公司
		handleChangeCompany:function(uuid, com_name){

			var opt = {
				uuid:uuid
			}
			rest.user.update('com',opt).done(ret => {

				if(ret.result){

					this.setState({cur_com_name:com_name});

					var code = $.randomCode();
					$.cookie('md5', code, {domain: paths.rcn.domain});
					window.md5 = code;

					var url = '/manager?1#/companyWelcome';
					window.location.href = url;

				}
			}).error(data => {
				
				if(data.status === 400 && data.responseJSON.msg){
					this.setState({warn:true, warntxt:data.responseJSON.msg});
				}else{
					$('#smModal').modal('show');
					this.setState({tipTxt:"切换公司失败，请联系管理员"});
				}
			});
		},

		// 获取数据函数入口
		loadDataFromServer:function(){
			var beg = this.state.beg;
			this.loadComData(beg);
			this.loadComPropsData();
		},
		loadComData:function(beg){
			rest.company.read({beg:beg,count:this.state.count}).done((mdata) => {
				if (this.isMounted()) {
					this.setState({
						mdata:mdata.companys,
						total:mdata.count
					});
				}
			});
		},
		loadComPropsData:function(){
			if (this.state.MgrOrVer) {
				rest.company.read('property').done((props) => {
					if (this.isMounted()) {
						this.setState({
							com_props:props
						});
					}
				});
			}
		},

		render: function(){
			return (
				<div className="company-base">
					<div className="container">
						<div className="panel panel-default">
							<div className="panel-heading">
								<div className="cf com-search">
									<div className={this.state.MgrOrVer?"fr ml10":"fr"}>
										<button className={this.state.MgrOrVer?"btn btn-primary btn-lg":"none"} onClick={this.handleAdd}>新建公司</button>
									</div>
									<div className="ovh">
										<div className={this.state.isSearch?'c-search active':'c-search disable'} id="searchbox" onClick={this.focusSearch}>
											<input type="text" className="s-input" placeholder="输入您想要查找的公司" id="searchTxt"
											onKeyDown={e => e.keyCode === 13 && this.handleSearch() } />
											<span className="s-btn" onClick={this.handleSearch} id="search_btn">
												<span className="iconfont icon-sousuo"></span>
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="panel-body">
								<div className="com-rt">
									<span>公司列表</span>
								</div>
								<div>
								{
									this.state.MgrOrVer?
									<div className={this.state.search_result_none?'list-blank-holder':'list-blank-holder none'}>
										<span>目前还没新建公司，</span>
										<span className="add" onClick={this.handleAdd}>立即新建</span>
									</div>
									:
									<div className={this.state.search_result_none?'list-blank-holder':'list-blank-holder none'}>
										<span>目前还没新建公司</span>
									</div>
								}
								</div>

								<ul className="com-list" id="com-list">
									{
										this.state.mdata.map((index, elem) => {
											var com_name = index.name;
											var uuid = index.uuid;
											var cindex = index;
											var firC = index.py.charAt(0);
											return (
												<li className={com_name == this.state.cur_com_name?"item itembox cur_com":"item itembox"} onClick={e => {this.handleChangeCompany(uuid,com_name)}}>
													<div className="mr20">
														<span className={'cl-mark '+firC+'col col'}>{firC}</span>
													</div>
													<div className="mid">
														<span className="none">{index.uuid}</span>
														<span className="cl-tit" title={com_name}>{com_name}</span>
														<span className="cl-note">{index.property.name}</span>
														<div className="cl-cont" title={index.desc}>{index.desc}</div>
													</div>
													<div className="btnbox">
														<span className="iconfont icon-bianji none" onClick={e => {this.handleEdit(e,cindex)}}></span>
														<span className="iconfont icon-lajitong none" onClick={e => {this.handleDelete(e,uuid)}}></span>
													</div>
												</li>
											)
										})
									}
								</ul>

								<div className="tc">
									<Pagination current={this.state.cur_page} pageSize={this.state.count} total={this.state.total} 
									className={(this.state.total <= this.state.count) ? "none":"ib mt30 v2"} onChange={page => {this.changeAutoPage(page)}} />
								</div>
							</div>
						</div>

						<Modal title={this.state.modTitle} id="myModal" noBtn={this.state.noBtn} dismiss={this.handleDismiss} confirm={this.handleConfirm}>
							<form id="add_com" className="form-horizontal">
								<div className="form-group">
									<label for="name" className="col-sm-2 control-label">公司名称</label>
									<div className="col-sm-10">
										<input className="form-control reset" id="name" name="name" />
									</div>
								</div>
								<div className="form-group">
									<label for="name" className={this.state.opt == 'edit' ?"none":"col-sm-2 control-label"}>公司ID</label>
									<div className="col-sm-10">
										<input type="text" className={this.state.opt == 'edit' ?"none":"uuid reset form-control reset"} id="uuid" name="uuid" placeholder="例如：a123456" />
									</div>
								</div>
								<div className={this.state.isUuid?"form-group":"none"}>
									<label for="name" className={this.state.isUuid?"col-sm-2 control-label":"none"}>参考ID：&nbsp;&nbsp;</label>
									<span className={this.state.isUuid?"col-sm-4":"none"}>{this.state.c_uuid}</span>
								</div>
								<div className="form-group">
									<label className="col-sm-2 control-label">属性</label>
									<div className="col-sm-10">
										<div className="dropdown-v2">
											<div className="select" type="button" onClick={e => {this.handleSelectClick(e)}}>
												<input className="txt" placeholder="选择" name={this.state.selectType}
												value={this.state.selectValue}  disabled/>
												<span className="ic"><span className="corner"></span></span>
											</div>
											<ul className={this.props.isShowSelectList?'option':'option none'} id="dd_option">
												{
													this.state.com_props.map(index => {
														return (
															<li onClick={() => {this.handleOptionListClick(index)}}>{index.name}</li>
														)
													})
												}
											</ul>
										</div>
									</div>
								</div>
								<div className="form-group com-desc">
									<label className="col-sm-2 control-label">描述</label>
									<div className="col-sm-10">
										<textarea id="desc" className="form-control reset" rows="8"></textarea>
									</div>
								</div>
								<div className={this.state.warn?"m-warn":"m-warn none"}>{this.state.warntxt}</div>
							</form>
						</Modal>
						
						<Modal title="温馨提示" modalSm id="smModal" noBtn={this.state.noBtn} dismiss={this.handleTipDismiss} confirm={e => {this.handleTipConfirm(e)}}>
							<div className="m-msg">
								<p>{this.state.tipTxt}</p>
								<p className={this.state.istipTxt2?'tipTxt2':'none'}>{this.state.tipTxt2}</p>
							</div>
						</Modal>

					</div>
				</div>
			)
		}
	})

	return Company
})