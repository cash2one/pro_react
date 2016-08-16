define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	'./table.js',
	paths.rcn.comps + '/dropdown/index.js',
	paths.rcn.comps + '/modal/index.js'

], function(mods, r, Table, Dropdown, Modal){

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Super = React.createClass({
		getInitialState: function(){
			return {
				cur_page:1,
				beg:0,
				total:20,
				count:20,

				btnShow:true,
				show:false,
				modTitle:'',
				opt:'',
				userid:'',
				mdata:[],
				rdata:[],

				temp_data:{},
				selectValue:'',

				warn:false,
				warntxt:'',

				noBtn:false,
				tipShow:false,
				tipTxt:'',

				search_result_none:false

			}
		},
		componentDidMount:function(){
			this.loadDataFromServer();

			this.validate();
		},

		// 添加人员
		handleAdd: function() {
			this.setState({ 
				show: true, 
				modTitle:'新增人员', 
				opt:'add'
			});
			this.formReset();
		},
		// 修改人员
		handleEdit:function(e,index){

			$('#phone').val(index.telephone);
			$('#name').val(index.user_name);

			this.setState({
				show: true,
				modTitle:'修改人员', 
				opt:'edit',
				selectValue:index.syndicate_name,

				temp_data: {
					syndicate: index.syndicate_uuid, 
					user_id: index.user_id, 
					user_name: index.user_name, 
					telephone: index.telephone
				}
			})


		},

		// 删除人员
		handleDelete:function(e,userid){
			this.setState({tipShow: true, tipTxt:'您确定删除所选人员吗？', istipTxt2:true, tipTxt2:'（确定删除后，该人员将不再有权限登录此系统进行操作）', userid:userid});
		},
		// 小弹窗 - 关闭弹窗
		handleTipDismiss:function(){
			this.setState({tipShow:false});
		},
		// 确认删除
		handleTipConfirm:function(){
			var userid = this.state.userid;
			rest.super.del(userid).done((data) => {
				if(data.result){
					this.setState({tipTxt:'删除成功', noBtn:true});
					var time = setTimeout(() => {
						this.handleTipDismiss();
						var beg = this.state.beg;
						this.loadSuperData(beg);
						this.setState({noBtn:false});
					},800);
				}
			}).error(data => {
				this.setState({tipTxt:'删除失败，请联系管理员'});
			});
		},

		// 关闭弹窗
		handleDismiss:function(){
			this.formReset();
			this.setState({show: false});
		},
		// 表单重置
		formReset:function(){
			this.setState({temp_data:{}, selectValue:'', warn:false});
			$('.reset').val('');
		},

		// 下拉菜单操作
		handleSelectClick:function(e){
			$('#dd_option').toggle(100);
			$(document).one('click',function() {
				$('#dd_option').hide(100);
			});
		},
		handleOptionListClick:function(index){
			var uuid = index.uuid;
			var syndicate_name = index.name;

			this.setState({selectValue:syndicate_name})

			this.state.temp_data.syndicate = uuid;
			// this.state.temp_data.uuid = uuid;

			this.handleSelectClick();
		},

		// jq表单验证
		validate:function(){
			var self = this;

			return $("#addPeo_form").validate({
				rules:{
					phone: {
						required:true,
						minlength:11,
						number:true
					},
					name: "required",
					syndicate: "required"
				},
                messages:{
                    phone:{
                    	required:"手机号码不能为空",
                    	minlength:"手机号码不能小于11位数字",
                    	number:"手机号码必须为合法数字"
                    },
                    name:{
                        required:"用户名不能为空"
                    },
                    syndicate:{
                        required:"集团选择不能为空"
                    }
                },
				errorPlacement: function(error, element) { 

					self.setState({warn:true});
        			error.appendTo($('.m-warn'));

				}
			}).form();

		},

		// 提交表单
		handleConfirm:function(){

			if(this.validate()){

				var result = this.state.temp_data; 

				if(this.state.opt === 'add'){
					rest.super.create(result).done(data =>{

						if(data.result){
							this.handleDismiss();
							this.loadSuperData();
							this.formReset();
							this.setState({search_result_none:false});
							$('#searchInput').val(null);
						}

					}).error(data => {

						if(data.status === 400 && data.responseJSON.msg){
							this.setState({warn:true, warntxt:data.responseJSON.msg});
						}
						// else{
						// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
						// }

					});
				}else{
					rest.super.update(result).done(data =>{

						if(data.result){
							this.handleDismiss();
							this.loadSuperData();
							this.formReset();
							this.setState({search_result_none:false});
							$('#searchInput').val(null);
						}

					}).error(data => {

						if(data.status === 400 && data.responseJSON.msg){
							this.setState({warn:true, warntxt:data.responseJSON.msg});
						}
						// else{
						// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
						// }

					});
				}
			}
			
		},

		// 获取数据函数入口
		loadDataFromServer:function(){
			var beg = this.state.beg;
			this.loadSuperData(beg);
			this.loadSynData();
		},
		loadSuperData:function(beg){
			rest.super.read({beg:beg,count:20,sort:'telephone'}).done((mdata) =>{
				if(mdata.sup_mgrs.length === 0){
					this.setState({search_result_none:true});
				}else{
					if (this.isMounted()) {
						this.setState({
							mdata: mdata.sup_mgrs,
							total: mdata.count
						});
					}
				}
			});
		},
		loadSynData:function(){
			rest.syndicate.read().done((rdata) => {
				if (this.isMounted()) {
					this.setState({
						rdata:rdata.syndicates
					});
				}
			});
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
				rest.supers.read({beg:beg,count:20,search:searchTxt}).done((mdata) => {
					if(mdata.length === 0){
						this.setState({search_result_none:true, mdata:[], total:mdata.count});
					}else{
						this.setState({search_result_none:false, mdata:mdata.supers, total:mdata.count});
					}
				});
			}else{
				this.loadSuperData(beg);
			}
		},

		onPhoneChange:function(e){
			var phone = e.target.value.trim();
			this.state.temp_data.telephone = phone;
		},
		onNameChange:function(e){
			var name = e.target.value.trim();
			this.state.temp_data.user_name = name;
		},
		onUseridChange:function(e){
			var user_id = e.target.value.trim();
			this.state.temp_data.user_id = user_id;
		},

		
		render: function(){
			return (
				<div className="admin-base">
					<div className="admin-manager-super">
						<div className="fr-top">
							<div className="fr mr10">
								<button className="c-button" type="button" onClick={this.handleAdd}>新增人员</button>
							</div>
						</div>
						<div className="fr-topline">
							<div className="line w"></div>
						</div>
						<div className="fr-main">
							<div className="w1000">
								<Table 
								search_result_none={this.state.search_result_none}
								mdata={this.state.mdata} 
								delete={(e,userid) => {this.handleDelete(e,userid)}} 
								edit={(e,tindex) => {this.handleEdit(e,tindex)}}
								/>
								<div className={this.state.search_result_none?'list-blank-holder':'list-blank-holder none'}>
									<span>目前还没添加超级运营员，</span>
									<span className="add" onClick={this.handleAdd}>立即添加</span>
								</div>
							</div>
						</div>

						<Pagination current={this.state.cur_page} pageSize={this.state.count} total={this.state.total} className={this.state.total == 0 || 1 ? "none":"tc mt20 mb20"} onChange={page => {this.changeAutoPage(page)}} />

						<Modal title={this.state.modTitle} show={this.state.show} btnShow={this.state.btnShow} dismiss={this.handleDismiss} confirm={this.handleConfirm}>
							<form id="addPeo_form">
								<label>手机号码</label>
								<input type="text" className="reset" id="phone" name="phone" defaultValue={this.state.temp_data.telephone}
								onChange={e => {this.onPhoneChange(e)}} />
								<label>姓名</label>
								<input type="text" className="reset" id="name" name="name" defaultValue={this.state.temp_data.user_name}
								onChange={e => {this.onNameChange(e)}} />
								<label>运营集团</label>
								<div className="m-dropdown">

									<div className="c-dropdown">
										<div className="select" type="button" onClick={e => {this.handleSelectClick(e)}}>
											<input className="txt" placeholder="集团选择" syndicate_name={this.state.temp_data.syndicate} 
											value={this.state.selectValue} name="syndicate" id="syndicate" disabled/>
											<span className="ic"><span className="iconfont icon-xiala"></span></span>
										</div>
										<ul className="option none" id="dd_option">
											{
												this.state.rdata.map(index => {
													return (
														<li onClick={() => {this.handleOptionListClick(index)}}>{index.name}</li>
													)
												})
											}
										</ul>
									</div>

								</div>
								<input type="text" className="reset userid none" id="user_id" name="user_id" defaultValue={this.state.temp_data.user_id}
								onChange={e => {this.onUseridChange(e)}} />
								<div className={this.state.warn?"m-warn":"m-warn none"}>
									{this.state.warntxt}
								</div>
							</form>
						</Modal>
						
						<Modal title="温馨提示" show={this.state.tipShow} noBtn={this.state.noBtn} dismiss={this.handleTipDismiss} confirm={e => {this.handleTipConfirm(e)}}>
							<div className="m-tip">
								<p>{this.state.tipTxt}</p>
								<p className={this.state.istipTxt2?'tipTxt2':'none'}>{this.state.tipTxt2}</p>
							</div>
						</Modal>

					</div>
				</div>
			)
		}
	})

	return Super
})

// 接口错误提示