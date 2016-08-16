/**
 * 人员管理 - 超级运营员
 */

define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	'./table.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.plu + '/jquery.webui-popover.js'

], function(mods, r, Table, Modal){

	var rest1 = r.rcn({
		stringifyData: false
	});

	var rest = r.rcn2();

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Allmgr = React.createClass({
		getInitialState: function(){
			return {

				com_role_data: [],
				role_show: [],
				mod_com_id: '',

				isEdit: false,
				userid: '',

				mdata: [],
				new_mdata: [],
				cdata: [],
				com: [],
				com_all:[],
				roles: [],
				role_all: [],
				role_choose: [],

				cur_page:1,
				beg:0,
				total:0,
				count:15,

				btnShow:true,
				show: false,
				modTitle:'',
				opt:'',
				dismiss:true,
				confirm:true,
				
				rdata:[],
				role:[],
				phone:'',
				name:'',

				tipTxt:'',

				warn:false,
				warntxt:'',

				search_result_none:false
			}
		},
		componentDidMount:function(){
			// $('.frame-body-right').addClass('v2');
			this.loadMgrsData();
			this.loadComdata();

			var self = this;
			$(document).mouseup(function(e){
				var _con = $('.webui-popover');   // 设置目标区域
				if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
					$('.webui-popover').hide();
				}
			});
		},

		handleRole:function(in_com_role_data, com_name, com_id, elem){

			$('.webui-popover').css("display","none");
			$('#role_tooltip'+elem).show(100);

			this.setState({com_id: com_id})
			var com_role_data = in_com_role_data,
				com_id = com_id;

			var role_show_temp;
			for (var i = 0; i < com_role_data.length; i++) {
				if(com_role_data[i].company_id === com_id) {
					this.setState({role_show: com_role_data[i].roles});
					role_show_temp = com_role_data[i].roles;
					break;
				}
			}
			
		},

		// 选择角色
		handleToggleRole:function(data, elem, name, status, tooltip_id){ 
			let role_show = data,
				new_status = !status,
				role_all_len = this.state.role_all.length;
			
			role_show[elem].status = new_status;
			this.setState({role_show: role_show});
			
			let num = 0;
			for(let index of role_show) {
				if(index.status) {
					num++;
				}
			}
			// if (num == role_all_len) {
			if (num > 0) {
				$('#'+tooltip_id).parent('.com-role-container').find('.tag').addClass('active');
			} else {
				$('#'+tooltip_id).parent('.com-role-container').find('.tag').removeClass('active');
			}
		},

		// 全选
		handleAllChoose: function(e, in_com_role_data, data, tooltip_id){

			e.stopPropagation();

			var role_show = data;
			for (var i = 0; i < role_show.length; i++) {
				role_show[i].status = true;
			}
			this.setState({role_show: role_show});

			$('#'+tooltip_id).parent('.com-role-container').find('.tag').addClass('active');
		},

		// 清除
		handleClearChoose: function(e, data, tooltip_id){

			e.stopPropagation();

			var role_show = data;
			for (var i = 0; i < role_show.length; i++) {
				role_show[i].status = false;
			}
			this.setState({role_show: role_show});

			$('#'+tooltip_id).parent('.com-role-container').find('.tag').removeClass('active');
		},

		// 关闭弹窗
		handleDismiss:function(in_com_role_data, role_show, com_id, elem){
			
			$('#role_tooltip'+elem).css("display","none");

			var com_role_data = in_com_role_data;
			var com_id = com_id;

			// 判断是否role_all数组里有status为true的，如果有就高亮该公司名，并且保留为roles
			var $cur_role = $("#role_tooltip"+elem).find('.role');
			if ($cur_role.hasClass('active')) {
				for (var i = 0; i < com_role_data.length; i++) {
					if(com_role_data[i].company_id == com_id) {
						com_role_data[i].status = true;
						break;
					}
				}
			}else {
				for (var i = 0; i < com_role_data.length; i++) {
					if(com_role_data[i].company_id == com_id) {
						com_role_data[i].status = false;
						break;
					}
				}
			}

			for (var i = 0; i < com_role_data.length; i++) {
				if(com_role_data[i].company_id == com_id) {
					com_role_data[i].roles = role_show;
					break;
				}
			}
			this.setState({com_role_data: com_role_data});

		},

		gotoEdit: function(userid, com){

			var com = com;
			
			rest.manager.read(userid).done(cdata => {

				this.setState({cdata: cdata});

				if (cdata.result) {

					var roles = cdata.roles;
					
					var com_new = [],
						com_temp, com_haschoose = [], temp, role_title = [];

					$.each(roles,function(item, roleArr){
						if(roleArr.length > 0) {
							com_haschoose.push(item);
						}
					})

					var Obj_com = [];
					if (com_haschoose.length > 0) {

						var t_cmp_dict = {};
						for (var j = 0; j < com.length; j++) {
							var t_comp_id = com[j].company_id;
							t_cmp_dict[t_comp_id] = false;
						}

						for (var i = 0; i < com_haschoose.length; i++) {	
							var t_cmp_id = com_haschoose[i];
							t_cmp_dict[t_cmp_id] = true;
						}

						rest1.manager.read('roles').done(role_all => {

							var role_all_data = role_all,
								role_all_temp,
								role_all_new_obj = [];

							for (var j = 0; j < com.length; j++) {
								var t_comp_id = com[j].company_id;

								var role_dict = {}
								for (var n = 0; n < role_all_data.length; n++) {

									role_dict[role_all_data[n].name] = {
										title :role_all_data[n].title,
										status: false
									}
								}

								if(roles[t_comp_id]){
									for( var t_usr_idx in  roles[t_comp_id]){
										var t_role_name = roles[t_comp_id][t_usr_idx];
										role_dict[t_role_name]["status"] = true;
									}
								}

								var role_usr_ary = []
								for( var t_role_name in  role_dict){
									var t_role_obj = role_dict[t_role_name];
									var t_role_item = {
										name: t_role_name,
										title:t_role_obj['title'],
										status:t_role_obj['status']
									};
									role_usr_ary.push(t_role_item);
								}


								Obj_com.push({
									company_id: com[j].company_id,
									company_name: com[j].company_name,
									status: t_cmp_dict[t_comp_id],
									roles: role_usr_ary
								});
							}

							this.setState({com_role_data: Obj_com, isEdit: true});
						})
					}
				}
			});
		},

		gotoAdd: function(com){

			this.loadRoleData();
			this.formReset();
			// 全部公司显示
			rest1.company.read({beg:0,count:100}).done(data => {

				var companys = data.companys,
					com_new = [],
					com_temp;

				companys.map((index,elem) => {
					com_temp = {
						company_id: index.uuid,
						company_name: index.name,
						status: false
					}
					com_new[elem] = com_temp;
					return com_new;
				})
				this.setState({com: com_new})

				// 全角色显示
				rest1.manager.read('roles').done(role_all => {
					var temp, com_temp;
					var com_new_obj = com_new;
					for (var i = 0; i < role_all.length; i++) {
						temp = {
							name: role_all[i].name,
							title: role_all[i].title,
							status: false
						}
						role_all[i] = temp;
					}
					this.setState({role_show: role_all});

					for (var i = 0; i < com_new_obj.length; i++) {
						var tt = []

						for (var z = 0; z < role_all.length; z++) {
							temp = {
								name: role_all[z].name,
								title: role_all[z].title,
								status: false
							}
							tt[z] = temp;
						}


						com_temp = {
							company_id: com_new_obj[i].company_id,
							company_name: com_new_obj[i].company_name,
							status: com_new_obj[i].status,
							roles: tt
						}
						com_new_obj[i] = com_temp
					}
					this.setState({com_role_data: com_new_obj});
				});
			});
			
			this.setState({isEdit: true, warn: false, warntxt: ''});
		},

		gotoShow: function(){
			this.loadMgrsData();
			this.setState({cur_page: 1, isEdit: false, role_all: [], com_role_data: [], search_result_none:false});
		},

		validate:function(){
			var self = this;

			return $("#all_manager_edit_form").validate({
				rules:{
					phone:{
						required:true,
						minlength:11,
						maxlength:11,
						number:true
					},
					name: {
						required:true
					}
				},
                messages:{
                    phone:{
                    	required:"手机号码不能为空",
                    	minlength:"请填写11位有效数字的手机号码",
                    	maxlength:"请填写11位有效数字的手机号码",
                    	number:"手机号码必须为合法数字"
                    },
                    name:{
                    	required:"姓名不能为空"
                    }
                }
			}).form();
		},
		
	
		// 表单重置
		formReset:function(){
			// 输入框置空
			this.setState({cdata: []});
		},

		// 删除人员
		handleDelete:function(e,userid){
			$('#smModal').modal('show');
			this.setState({tipTxt:'您确定删除所选人员吗？', noBtn:false, istipTxt2:true, tipTxt2:'（确定删除后，该人员将不再有权限登录此系统进行操作）', userid:userid});
		},
		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss:function(){
			$('#smModal').modal('hide');
		},
		// 确认删除
		handleTipConfirm:function(e, userid){

			rest.manager.del(userid).done((ret) => {
				if(ret.result){	
					this.setState({tipTxt:'删除成功！', istipTxt2:false, noBtn:true});
					var time = setTimeout(() => {
						this.handleTipDismiss();
						var beg = this.state.beg;
						this.loadMgrsData(beg);
					},800);
				}
			}).error(data => {
				this.setState({tipTxt:'删除失败，请联系管理员'});
			});
		},

		// 提交表单
		handleConfirm:function(com_role_data){
			
			if(this.validate()) {

				var crd_role_temp = [], 
					isHasRole = false;
				for (var k = 0; k < com_role_data.length; k++) {
					crd_role_temp = com_role_data[k].roles;
					for(var m = 0; m < crd_role_temp.length; m++) {
						if(crd_role_temp[m].status == true) {
							isHasRole = true;
							break;
						}
					}
				}

				if (isHasRole) {

					$('.webui-popover').hide(100);

					this.setState({warn:false});

					var user_name = $('#name').val();
					var telephone = $('#phone').val();

					var obj_new = {};
					for (var i = 0; i < com_role_data.length; i++) {

						var obj_roles = com_role_data[i].roles,
							temp_role = [],
							company_id,
							temp;

						for (var j = 0; j < obj_roles.length; j++) {	
							if (obj_roles[j].status) {
								temp_role.push(obj_roles[j].name)
							}
						}
						company_id = com_role_data[i].company_id;
						obj_new[company_id]= temp_role;
					}
					
					var result = {
						user_name: user_name,
					    telephone: telephone,
					    roles: obj_new
					}
					this.handleNewConfirm(result)
				}
				else {
					$('.all-manager-page-warn').find('.page-error').remove();
					this.setState({warn:true, warntxt: '至少选中一个运营公司'});
				}
				
			}

		},
		handleNewConfirm:function(result){
			rest.managers.create(result).done((ret) =>{
				if(ret.result){
					this.gotoShow();
					this.formReset();
					this.setState({search_result_none:false});
					$('#searchInput').val(null);
				}
			}).error(data => {
				
				if (data.status === 400 && data.responseJSON.msg) {
					if(data.responseJSON.name) {
						var name = data.responseJSON.name;
						var tpl = data.responseJSON.msg+'（ 原始姓名为'+name+' ）';
						this.setState({warn:true, warntxt:tpl});
						this.refs.name.getDOMNode().value = name;
					}else{
						this.setState({warn:true, warntxt:data.responseJSON.msg});
					}
				} else {
					this.setState({warn:true, warntxt:"服务器出错,请联系管理员"}); 
				}
				
			});
		},

		loadMgrsData:function(){
			rest.managers.read({sort:"telephone"}).done(mdata =>{
				var beg = this.state.beg;
				if(mdata.result) {
					if(mdata.managers.length === 0){
						this.setState({search_result_none:true});
					}else{
						this.setState({
							mdata: mdata.managers,
							total: mdata.managers.length
						});
						this.handlePagination(mdata.managers, beg);
					}
				}
			});
		},

		loadRoleData: function(){
			rest1.manager.read('roles').done(data => {
				this.setState({role_all: data});
			});
		},
		loadComdata:function(){
			rest1.company.read({beg:0,count:100}).done(data => {
				var com = data.companys,
					com_new = [],
					com_temp;
				com.map((index,elem) => {
					com_temp = {
						company_id: index.uuid,
						company_name: index.name,
						status: false
					}
					com_new[elem] = com_temp;
					return com_new;
				})
				this.setState({com: com_new});
			});
		},

		handlePagination:function(data, beg){
			var data = data;
			var new_mdata = [];
			var total = data.length;
			var beg = beg;
			var count = this.state.count;
			var end_page = parseInt(beg+count);
			var last_page = parseInt(total-beg);
			if(last_page < count) {
				end_page = parseInt(beg+last_page)
			}
			for (var i = beg; i < end_page; i++) {
				new_mdata.push(data[i]);
			}
			this.setState({new_mdata: new_mdata});
		},

		// 分页
		changeAutoPage:function(data, page){
			var count = this.state.count,
				data = data;
			if(page === 1){
				var beg = 0;
			}else{
				var beg = parseInt(count*(page-1));
			}
			this.handlePagination(data, beg);
			this.setState({cur_page:page});
		},

		// 搜索功能
		handleSearch:function(){
			var searchInput = $('#searchInput').val();
			if(searchInput !== ''){
				rest.managers.read({sort:"telephone", search:searchInput}).done((mdata) => {
					if(mdata.managers.length === 0){
						this.setState({search_result_none:true, mdata:[], total:0});
						this.handlePagination([], 0);
						var tpl = '<tr id="colspan_none"><td colspan="6" rowspan="2">暂无数据</td></tr>';
						$('.advices-usermgr-manager').find('.c-table').append(tpl);
					}else{
						this.setState({search_result_none:false, mdata:mdata.managers, total:mdata.managers.length});
						this.handlePagination(mdata.managers, 0);
						$('#colspan_none').remove();
					}
				});
			}else{
				this.loadMgrsData(0);
				this.setState({search_result_none:false});
				$('#colspan_none').remove();
			}
		},

		render: function(){

			const pageShow = () => {
				if( !this.state.isEdit ) {
					return (
						<div className="all-manager-index">
							<div className="panel panel-default">
								<div className="panel-heading">
									<h3 className="panel-title">运营员管理</h3>
									<div className="c-search sm mr20">
										<input type="text" className="s-input" placeholder="搜索人员" id="searchInput"
										onKeyDown={e => e.keyCode === 13 && this.handleSearch() } />
										<span className="s-btn" id="searchBtn" onClick={this.handleSearch}>
											<span className="iconfont icon-sousuo"></span>
										</span>
									</div>
									<button className="btn btn-primary" type="button" onClick={e => this.gotoAdd(this.state.com)}>添加人员</button>
								</div>
								<Table 
								search_result_none={this.state.search_result_none}
								mdata={this.state.new_mdata} 
								delete={(e, userid) => {this.handleDelete(e, userid)}} 
								edit={(e, userid, com) => {this.gotoEdit(userid, this.state.com)} }/>
								<div className={this.state.search_result_none?'list-blank-holder v2':'none'}></div>
								<div className="tc">
									<Pagination current={this.state.cur_page} pageSize={this.state.count} total={this.state.total} 
									className={(this.state.total <= this.state.count) ? "none":"ib mt30 mb30 v2"}
									onChange={page => {this.changeAutoPage(this.state.mdata, page)}} />
								</div>
							</div>

							<Modal title="温馨提示" modalSm id="smModal" noBtn={this.state.noBtn} dismiss={this.handleTipDismiss} confirm={e => {this.handleTipConfirm(e, this.state.userid)}}>
								<div className={this.state.noBtn ? "m-msg" : "m-msg fs14"}>
									<p>{this.state.tipTxt}</p>
									<p className={this.state.istipTxt2?'tipTxt2':'none'}>{this.state.tipTxt2}</p>
								</div>
							</Modal>

						</div>
					)
				} else {
					return (
						<div className="all-manager">
							<div className="container">
								<div className="panel panel-default">
									<div className="panel-heading">
										<h3 className="panel-title">人员添加</h3>
									</div>
									<div className="panel-body">
										<form id="all_manager_edit_form" className="edit-form form-horizontal">
											<div className="form-group">
												<label for="phone" className="col-sm-2 control-label">手机号</label>
												<div className="col-sm-10">
													<input className="form-control reset" id="phone" name="phone" defaultValue={this.state.cdata.telephone} />
												</div>
											</div>
											<div className="form-group">
												<label for="name" className="col-sm-2 control-label">用户名</label>
												<div className="col-sm-10">
													<input className="form-control reset" id="name" name="name" defaultValue={this.state.cdata.user_name} />
												</div>
											</div>
										</form>
										<div className="panel-line"></div>
										<div className="fr-br-mid">
											<h5 style={{"display": "inline-block"}}>运营公司</h5>
											<div className={this.state.warn?"all-manager-page-warn":"none"}>
												<label className="page-error2">{this.state.warntxt}</label>
											</div>
										</div>
										<div className="fr-br-main">
										{
											this.state.com_role_data.map((index, elem) => {
												var com_id = index.company_id,
													com_name = index.company_name,
													com_status = index.status,
													tooltip_id = "role_tooltip" + elem;
												return (
													<div className="com-role-container">
														<span className={com_status? "tag active" : "tag"} title={com_name}
														onClick={e => this.handleRole(this.state.com_role_data, com_name, com_id, elem)}>
														{com_name}
														<i className="ic c-corner"></i>
														</span>
														<div className='webui-popover bottom-right in none' id={tooltip_id}>
															<div className="arrow"></div>
															<div className="webui-popover-inner">
																<div className="webui-popover-content">
																	<div className="tooltipbox">
																		<div className="rolebox-top">
																		{
																			this.state.role_show.map((index, elem) => {
																				return (
																					<label className={index.status? "role active" : "role"} 
																					onClick={e => this.handleToggleRole(this.state.role_show, elem, index.name, index.status, tooltip_id)}>
																					<span className={index.status? "c-cb active" : "c-cb"}></span>
																					{index.title}
																					</label>
																				)
																			})
																		}
																		</div>
																		<div className="rolebox-bottom">
																			<div className="btnbox pull-right">
																				<div className="btn btn-default btn-xs" onClick={e => this.handleAllChoose(e, this.state.com_role_data,this.state.role_show, tooltip_id)}>全选</div>
																				<div className="btn btn-default btn-xs" onClick={e => this.handleClearChoose(e, this.state.role_show, tooltip_id)}>清除</div>
																			</div>
																			{
																				// <div className="btn btn-default btn-xs rolebtn" onClick={e => this.handleDismiss(this.state.com_role_data, this.state.role_show, this.state.com_id, elem)}>关闭</div>
																				// <span className="rolebtn" onClick={e => this.handleDismiss(this.state.com_role_data, this.state.role_show, this.state.com_id, elem)}>关闭</span>
																			}
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												)
											})
										}
										</div>
										<div className="notebox">
											<div className="warm">
												<span className="tit">提示：</span>
												<span className="txt">
												1.&nbsp;需要选中此公司最少需选中一种身份
												<br/>2.&nbsp;点击清除将取消选中公司
												<br/>3.&nbsp;重复点击可取消选中</span>
											</div>
										</div>
									</div>
									<div className="panel-footer">
										<div className="btnbox">
											<div className="pull-right">
												<div className="btn btn-default btn-lg" type="button" id="cancel" onClick={this.gotoShow}>取消</div>
												<div className="btn btn-primary save-btn btn-lg" id="save" type="submit" onClick={e => this.handleConfirm(this.state.com_role_data)}>确定</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)
				}
			}
			return (
				<div className="all-manager">
					{
						pageShow()
					}
				</div>

			)
		}
	})

	return Allmgr
})