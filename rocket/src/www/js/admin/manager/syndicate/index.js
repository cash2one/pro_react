define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/dropdown/index.js',
	paths.rcn.comps + '/modal/index.js'

], function(mods, r, Dropdown, Modal){

	var rest = r.admin({
		stringifyData: false
	});

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Pagination = mods.Pagination;

	var Syndicate = React.createClass({
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
				uuid:'',
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

		// 添加集团
		handleAdd: function() {
			this.setState({ 
				show: true, 
				modTitle:'新增集团', 
				opt:'add'
			});
			this.formReset();
		},
		// 修改集团
		handleEdit:function(e,index){
			e.stopPropagation();

			$('#name').val(index.name);
			$('#desc').val(index.desc);

			this.setState({
				show: true,
				modTitle:'修改集团', 
				opt:'edit',
				selectValue:index.syndicate_name,
				uuid:index.uuid,

				temp_data: {
					name: index.name, 
					desc: index.desc
				}
			})
		},

		// 删除集团
		handleDelete:function(e,uuid){
			e.stopPropagation();
			this.setState({tipShow: true, tipTxt:'您确定删除所选集团吗？', istipTxt2:true, tipTxt2:'（确定删除后，该集团将不再有权限登录此系统进行操作）', uuid:uuid});
		},
		// 小弹窗 - 关闭弹窗
		handleTipDismiss:function(){
			this.setState({tipShow:false});
		},
		// 确认删除
		handleTipConfirm:function(){
			var uuid = this.state.uuid;
			rest.syndicate.del(uuid).done((data) => {
				if(data.result){
					this.setState({tipTxt:'删除成功', noBtn:true});
					var time = setTimeout(() => {
						this.handleTipDismiss();
						var beg = this.state.beg;
						this.loadSynData(beg);
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

			return $("#addSyn_form").validate({
				rules:{
					name: "required",
					user_name:"required",
					telephone: {
						required:true,
						minlength:11,
						number:true
					},
					uuid: "required"
				},
                messages:{
                	name:{
                	    required:"集团名称不能为空"
                	},
                    user_name:{
                	    required:"超级运营员不能为空"
                	},
                    telephone:{
                    	required:"手机号码不能为空",
                    	minlength:"手机号码不能小于11位数字",
                    	number:"手机号码必须为合法数字"
                    },
                    uuid:{
                        required:"集团ID不能为空"
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
					rest.syndicate.create(result).done(data =>{

						if(data.result){
							this.handleDismiss();
							this.loadSynData();
							this.formReset();
							this.setState({search_result_none:false});
							$('#searchInput').val(null);
						}

					}).error(data => {

						if(data.status === 400 && data.responseJSON.msg){
							if(data.responseJSON.recommendation) {
								this.setState({isUuid:true, c_uuid:data.responseJSON.recommendation, warn:true, warntxt:"公司ID已重复，请重新输入或者选择参考ID"}); // 公司ID数据库里已存在相同ID
							}else {
								this.setState({warn:true, warntxt:data.responseJSON.msg});
							}
						}
						// else{
						// 	this.setState({warn:true, warntxt:'服务器出错，请联系管理员'});
						// }

					});
				}else{
					var uuid = this.state.uuid;

					rest.syndicate.update(uuid,result).done(data =>{

						if(data.result){
							this.handleDismiss();
							this.loadSynData();
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
			this.loadSynData(beg);
		},
		loadSynData:function(beg){
			rest.syndicate.read().done((mdata) =>{
				if(mdata.syndicates.length === 0){
					this.setState({search_result_none:true});
				}else{
					if (this.isMounted()) {
						this.setState({
							mdata: mdata.syndicates,
							total: mdata.count
						});
					}
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
				this.loadSynData(beg);
			}
		},

		onNameChange:function(e){
			var name = e.target.value.trim();
			this.state.temp_data.name = name;
		},
		onDescChange:function(e){
			var desc = e.target.value.trim();
			this.state.temp_data.desc = desc;
		},
		onSupersChange:function(e){
			var user_name = e.target.value.trim();
			this.state.temp_data.user_name = user_name;
		},
		onTelephoneChange:function(e){
			var telephone = e.target.value.trim();
			this.state.temp_data.telephone = telephone;
		},
		onIdChange:function(e){
			var uuid = e.target.value.trim();
			this.state.temp_data.uuid = uuid;
		},

		
		render: function(){
			return (
				<div className="admin-base">
					<div className="admin-manager-syndicate">
						<div className="fr-top">
							<div className="fr mr10">
								<button className="c-button" type="button" onClick={this.handleAdd}>新增集团</button>
							</div>
						</div>
						<div className="fr-topline">
							<div className="line w"></div>
						</div>
						<div className="fr-main">
							<div className="fr-main-mid w1000">
								<div>
									<div className={this.state.search_result_none?'list-blank-holder':'list-blank-holder none'}>
										<span>目前还没新建集团，</span>
										<span className="add" onClick={this.handleAdd}>立即新建</span>
									</div>
								</div>

								<ul className="com-list" id="com-list">
									{
										this.state.mdata.map((index, elem) => {
											var com_name = index.name;
											var uuid = index.uuid;
											var cindex = index;
											var firC = index.py.charAt(0);
											return (
												<li className={com_name == this.state.cur_com_name?"item itembox cur_com":"item itembox"}>
													<div className="mr20">
														<span className="iconfont icon-cuowu none" onClick={e => {this.handleDelete(e,uuid)}}></span>
														<span className={'cl-mark '+firC+'col col'}>{firC}</span>
													</div>
													<div className="mid">
														<span className="none">{index.uuid}</span>
														<span className="cl-tit" title={com_name}>{com_name}</span>
														<span className="cl-note">ID: {index.uuid}</span>
														<span className="iconfont icon-bianji none" onClick={e => {this.handleEdit(e,cindex)}}></span>
														<div className="cl-cont" title={index.desc}>{index.desc}</div>
													</div>
													<div className="superbox">
														<span className="tit">超级运营员：</span>
														
															{
																index.supers.map((index, elem) => {
																	return(
																		<span>{index}</span>
																	)
																})
															}
														
													</div>
													<div className="btnbox">
														<span className="delbtn" onClick={e => {this.handleDelete(e,uuid)}}>删除</span>
														<span className="editbtn" onClick={e => {this.handleEdit(e,cindex)}}>修改</span>
													</div>
												</li>
											)
										})
									}
								</ul>
							</div>
						</div>

						<Pagination current={this.state.cur_page} pageSize={this.state.count} total={this.state.total} className={this.state.total == 0 || 1 ? "none":"tc mt20 mb20"} onChange={page => {this.changeAutoPage(page)}} />

						<Modal title={this.state.modTitle} show={this.state.show} btnShow={this.state.btnShow} dismiss={this.handleDismiss} confirm={this.handleConfirm}>
							<form id="addSyn_form">

								<label>集团名称</label>
								<input type="text" className="reset" id="name" name="name" defaultValue={this.state.temp_data.name}
								onChange={e => {this.onNameChange(e)}} />

								<div className="com-desc">
									<label>集团概况</label>
									<textarea rows="4" id="desc" name="desc" className="reset" defaultValue={this.state.temp_data.desc}
									onChange={e => {this.onDescChange(e)}} ></textarea>
								</div>

								<div className={this.state.opt == 'edit' && "none"}>
									<label>超级运营员名称</label>
									<input type="text" className="reset" id="supers" name="supers"
									onChange={e => {this.onSupersChange(e)}} />
								</div>

								<div className={this.state.opt == 'edit' && "none"}>
									<label>手机号</label>
									<input type="text" className="reset" id="telephone" name="telephone"
									onChange={e => {this.onTelephoneChange(e)}} />
								</div>

								<div className={this.state.opt == 'edit' && "none"}>
									<label className="uuid">ID</label>
									<input type="text" id="uuid" name="uuid"  className="uuid reset" placeholder="例如：HD1123746438 12个字符"
									onChange={e => {this.onIdChange(e)}}/>

									<label className={this.state.isUuid?"c-uuid":"c-uuid none"}>参考ID：&nbsp;&nbsp;</label>
									<span className={this.state.isUuid?"":"none"}>{this.state.c_uuid}1111111</span>
								</div>

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

	return Syndicate
})

// 接口错误提示