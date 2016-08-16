/**
 * create by lxt
 * final on 2016/07/13
 * 个人设置
 */

require.config({
	baseUrl: 'js',
	urlArgs: 'rel=' + "20160613",
	paths: {
		"mods": paths.rcn.lib + "/mods",
		"env": paths.rcn.util + "/env",
		"api": paths.rcn.util + "/api_test",
		"Frame": paths.rcn.comps + "/frame/index",
		"Reducer_Frame": paths.rcn.comps + '/frame/reducers'
	}
})

require([

	"mods",
	"Frame", 
	"Reducer_Frame",
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js'

], function(mods, Frame, Reducer_Frame, r, Modal){

	var rest = r.rcn({	
		stringifyData: false
	});

	var React = mods.ReactPack.default;
	var ReactDOM = mods.ReactDom.default;
	var {combineReducers, createStore, applyMiddleware} = mods.ReduxPack;
	var {Provider} = mods.ReactReduxPack;
	var {Router, Route, hashHistory, IndexRedirect} = mods.RouterPack;
	var {syncHistoryWithStore, routerReducer} = mods.ReduxRouterPack;
	var store = createStore(combineReducers(Object.assign({
		routing: routerReducer
	}, Reducer_Frame)), applyMiddleware(mods.thunk));
	var history = syncHistoryWithStore(hashHistory, store);

	var Personal = React.createClass({

		getInitialState:function(){
			return {

				avatar:'',

				edit:false,
				data: [],
				data_phone: {},
				warn:false,
				warntxt:'',
				btnClick:true,

				modal_warn:false,
				modal_warntxt:'',

				secondsElapsed: 60,
				isBind: false,

				tipTxt: '',

				role: '',
				base_url: window.location.protocol + '//' + window.location.hostname
			}
		},

		componentDidMount:function(){

			this.loadPersonalData();

			this.validatePersonal();

			this.validateAvatar();		

			rest.user.read().done(data => {

				this.setState({role: data.role_group}); // 将role存储为全局变量，跳到微信绑定页面的接口需要此字段

				if (data.openid == '' || data.openid == null) {
					this.setState({isBind: false});
				} else {
					this.setState({isBind: true});
				}
			})
			if (window.location.search && this.GetQueryString('code')) { // 用户允许授权
				var code = this.GetQueryString('code');
				var opt = {
					code: code
				}
				this.bindWeixin(opt, 'bind_wx');
			}
		},

		componentWillUnmount: function() {
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 随机生成字符串
		getRandomString:function(len){
			len = len || 32;
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = $chars.length;
			var pwd = '';
			for (var i = 0; i < len; i++) {
				pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},

		// 获取url参数
    	GetQueryString: function (name) {  
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
            var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
            var context = "";  
            if (r != null)  
                 context = r[2];  
            reg = null;  
            r = null;  
            return context == null || context == "" || context == "undefined" ? "" : context;  
        },

        // 跳到微信绑定页面
		handleBindWeixin: function() {
			if(!this.state.edit) {
				var state = this.getRandomString();

				var redirect_uri = this.state.base_url + '/setting/personal';

				var role = this.state.role;
				var opt = {
					role: role,
					redirect_uri: redirect_uri
				}
				rest.user.create('auth_url_wx', opt).done(data => {
					if (data.result) {
						window.location.href = data.auth_url;
					}
				});

			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 微信绑定
		bindWeixin:function(opt, param){
			rest.user.create(param, opt).done(data => {
				var msg = data.msg;
				if (data.code) {
					$('#tipShow').modal('show');
					this.setState({ipTxt: msg});
					var time = setTimeout(() => {
						$('#tipShow').modal('hide');
						this.setState({tipTxt: ''});
						this.setState({isBind: false, outBind: false});
						var url = this.state.base_url + '/setting/personal';
						window.location.href = url;
					},1000);
				} else {
					// 绑定成功
					this.setState({isBind: true});
					rest.user.read();
				}
			}).error(data => {
				if (data.status == 400) {
					if(data.responseJSON.bound){
						this.setState({isBind: true});
						var url = this.state.base_url + '/setting/personal';
						window.location.href = url;
					}
				}
				else if (data.status == 502) {
					var msg = data.responseJSON.msg;
					// 弹窗提示用户错误信息
					$('#tipShow').modal('show');
					this.setState({tipTxt: msg});
					var time = setTimeout(() => {
						$('#tipShow').modal('hide');
						this.setState({tipTxt: ''});
						this.setState({isBind: false});
						var url = this.state.base_url + '/setting/personal';
						window.location.href = url;
					},1000);
				}
			});
		},

		// 弹“解除绑定”弹窗
		popUnBindModalsm: function(){
			if(!this.state.edit) {
				$('#unBind_modal').modal('show');
			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 取消“解除绑定”
		handleUnBindCancel: function(){
			$('#unBind_modal').modal('hide');
		},

		// 确认“解除绑定”
		handleUnBindConfirm: function(){
			$('#unBind_modal').modal('hide');
			var opt = {
				from: 'web'
			}
			rest.user.create('unbind_wx', opt).done(data => {
				// 解绑成功
				$('#tipShow').modal('show');
				this.setState({tipTxt:'解绑成功!'});
				var time = setTimeout(() => {
					$('#tipShow').modal('hide');
					this.setState({tipTxt: ''});
					this.setState({isBind: false});
					var url = this.state.base_url + '/setting/personal';
					window.location.href = url;
				},800);
			}).error(data => {
				var msg = data.responseJSON.msg;
				if (data.status == 400 && msg) {
					$('#tipShow').modal('show');
					this.setState({tipTxt: msg});
					var time = setTimeout(() => {
						$('#tipShow').modal('hide');
						this.setState({tipTxt: ''});
						this.setState({isBind: true});
					},1000);
				}
			});
		},

		handleModalsmConfirm: function(){
			$('#warm_modal').modal('hide');
		},

		// 读取personal接口数据
		loadPersonalData:function(){
			rest.personal.read().done(data => {
				var random_temp = this.getRandomString();
				var img_url = this.state.base_url + data.avatar + '?' + random_temp;
				this.setState({data:data});
				this.setState({avatar:img_url});
				$('#fr_user_pic').attr('src',img_url);
			});
		},

		// 修改头像验证
		validateAvatar:function(){
			var self = this;

			$("#file_form").validate({
				rules:{
					avatar: {
						required:true
					}
				},
                messages:{
                    avatar:{
                        required:"请选择图片文件"
                    }
                },
	            submitHandler: function(){ 
	                self.handleFormSubmit();
	            }, 
				errorPlacement: function(error, element) { 
					self.setState({warn:true});
        			error.appendTo($('.setting-page-warn'));
				}
			});

		},

		// 个人信息表单验证
		validatePersonal:function(){
			var self = this;

			return $("#personal_form").validate({
				debug:true,
				rules:{
					name: "required",
					email: {
						required: true,
						email:true
					}
				},
                messages:{
                    name:{
                        required:"用户名不能为空"
                    },
                    email: {
                    	required: "邮箱地址不能为空",
                    	email: "请输入合法的邮箱地址"
                    }
                }
             //    submitHandler: function(){ 
	            //     self.handleSave();
	            // }
				// errorPlacement: function(error, element) { 
				// 	$('.setting-page-warn label').remove(); 
				// 	self.setState({warn:true});
    //     			error.appendTo($('.setting-page-warn'));
    //     			error.addClass('page-error');
				// }
			});

		},

		// 手机号码表单验证
		validatePhone:function(){
			var self = this;

			var validatorPhone = $("#editPhone_form").validate({
				debug:true,
				rules:{
					phone_old: {
						required:true,
						minlength:11,
						number:true
					},
					phone_new: {
						required:true,
						minlength:11,
						number:true
					},
					code: {
						required:true,
						minlength:6,
						number:true
					}
				},
                messages:{
                    phone_old:{
                    	required:"原手机号码不能为空",
                    	minlength:"原手机号码不能小于11位数字",
                    	number:"原手机号码必须为合法数字"
                    },
                    phone_new:{
                    	required:"新手机号码不能为空",
                    	minlength:"新手机号码不能小于11位数字",
                    	number:"新手机号码必须为合法数字"
                    },
                    code:{
                    	required:"短信验证码不能为空",
                    	minlength:"短信验证码不能小于6位数字",
                    	number:"短信验证码必须为合法数字"
                    }
                },
                submitHandler: function(){ 
	                self.handleModalConfirm();
	            }
				// errorPlacement: function(error, element) { 
				// 	// self.setState({modal_warn: false, modal_warntxt: ''});
    //     			error.appendTo($('.m-warn'));
				// }
			});

			return validatorPhone;

		},

		// 点击编辑
		handleEdit:function(e){
			this.setState({edit:true});
			$('.reset').val(null);
			this.state.data.captcha = null;
		},

		// 取消编辑
		handleCancel:function(){
			this.validatePersonal().resetForm();
			this.setState({edit:false, warn:false, warntxt:''});
			this.loadPersonalData();

			this.tickClear();

		},

		// 取消编辑保存
		handleSaveCancel: function(){
			$('#warm_modal').modal('hide');
			this.setState({edit: false});
			this.loadPersonalData();
		},

		// 编辑保存
		handleSave:function(){

			var opt = this.state.data;

			if(this.validatePersonal().form()){

				rest.personal.update(opt).done(data => {

					if(data.result){ // 信息修改成功
						this.setState({edit:false, warn:false});
						$('.getcode-btn').attr("disabled",false);
						this.setState({btnClick:true});

						$('#fr_user_name').html(this.state.data.user_name);
					}

				}).error(data => {
					if(data.status === 400 && data.responseJSON.msg){
						this.setState({warn:true, warntxt:data.responseJSON.msg});
					}
				});
			}
			
		},

		// 修改手机号
		handleEditPhone: function(){
			if(!this.state.edit) {
				$('#edit_phone_modal').modal('show');
				this.setState({warn: false, modal_warn:false, modal_warntxt: ''});
				this.validatePhone().resetForm();
			} else {
				$('#warm_modal').modal('show');
			}
		},

		// 取消修改手机号弹窗
		handleModalDismiss: function(){
			$('#edit_phone_modal').modal('hide');
			this.validatePhone().resetForm();
		},

		// 确认提交手机号码修改
		handleModalConfirm: function(){
			var opt = this.state.data_phone;

			if (this.validatePhone().form()) {
				
				if (this.state.data_phone.telephone_new == this.state.data_phone.telephone_old) {

					this.setState({modal_warn:true, modal_warntxt: '新号码和原号码相同'});

				} else {
					this.setState({modal_warn:false, modal_warntxt: ''});
					rest.bind_telephone.update(opt).done(data => {

						if(data.result){ // 信息修改成功

							$('#edit_phone_modal').modal('hide');

							this.tickClear();
						}

					}).error(data => {
						if(data.status === 400 && data.responseJSON.msg){
							this.setState({modal_warn:true, modal_warntxt:data.responseJSON.msg});
						}
					});
				}

			}
		},

		// 重置按钮可点击
		tickClear:function(){
			this.setState({btnClick:true, secondsElapsed: 60}); // 按钮2分钟后可点击
			$('.getcode-btn').attr("disabled",false); 
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 短信倒计时
		tick:function(){
			this.setState({
				secondsElapsed: this.state.secondsElapsed - 1
			});
		},

		// 获取短信验证码
		getCode:function(e){
			e.stopPropagation();
			e.preventDefault();

			this.tickClear();

			// 验证手机号码是否通过
			var isPass = $("#editPhone_form").validate().element($("#phone_new"));
			var phone = this.state.data_phone.telephone_new;

			if (isPass) {

				var opt = {telephone:phone};

				rest.setting.create('authcode',opt).done(data => {

					if(data.result){

						this.interval = setInterval(this.tick, 1000); // 短信倒计时
						this.setState({btnClick:false}); // 按钮不可点
						$('.getcode-btn').attr("disabled",true); // 按钮置灰

						this.btn_time = setTimeout(() => {
							this.tickClear();
						},60000);
					}

				}).error(data => {
					if(data.status === 400 && data.responseJSON.msg){
						this.setState({modal_warn:true, modal_warntxt:data.responseJSON.msg});
					}
				});
			}
		},	

		onChangeName:function(e){
			var name = e.target.value;
			this.state.data.user_name = name;
		},
		onChangeEmail:function(e){
			var email = e.target.value;
			this.state.data.email = email;
		},
		onChangeOldPhone:function(e){
			var old_phone = e.target.value;
			this.state.data_phone.telephone_old = old_phone;
		},
		onChangeNewPhone:function(e){
			var new_phone = e.target.value;
			this.state.data_phone.telephone_new = new_phone;
		},
		onChangeCode:function(e){
			var code = e.target.value;
			this.state.data_phone.captcha = code;
		},

		// 修改头像
		onFileChange:function(e){
			this.handleFormSubmit(e);
		},
		handleEditFile:function(){
			$('#avatar').trigger('click');
		},
		handleFormSubmit:function(e){
			e.preventDefault();
			e.stopPropagation();

			var self = this;

	        $("#file_form").ajaxSubmit({
	        	url: self.state.base_url + '/rocket/api/v1/avatar',
	            dataType:'json',
	            beforeSend: function(xhr) {
	                xhr.setRequestHeader('user_token', $.cookie('user_token'));
	            },
	            success: function() {
	                self.loadPersonalData();
	            },
                error:function(){
                    self.setState({warn:true, warntxt:'上传头像失败'});
                }
	        });

		},

		render:function(){
			return (
				<div className="container">
					<div className="setting">
						<div className="panel panel-default setting-personal">
							<div className="panel-heading">
								<h3 className="panel-title">个人信息</h3>
								<div className={this.state.edit ? "none" : "btn btn-primary pull-right"} id="edit" type="button" onClick={e => this.handleEdit(e)}>编辑</div>
							</div>
							<div className="panel-body tc">
								<div className="row h">
									<div className="col-xs-6 col-xs-offset-3">
										<div className="row">
											<div className="col-xs-3 leftbox">
												<img src={this.state.avatar} className="pic" id="image"/>
												{
													this.state.edit && 
													<button className="edit-file-btn" id="edit_file_btn" onClick={this.handleEditFile}>修改头像</button>
												}
												<form method="post" id="file_form" enctype="multipart/form-data" className="none">
													<input type="file" id="avatar" name="avatar" onChange={this.onFileChange}/>
													<input type="submit" value="submit" id="uploadfile_btn" onClick={this.handleFormSubmit} />
												</form>
												<div className={this.state.warn?"setting-page-warn":"setting-page-warn none"}>
													<label className="page-error">{this.state.warntxt}</label>
												</div>
											</div>
											<div className="col-xs-9 rightbox h">
												<form id="personal_form" className="form-horizontal">
													<div className="form-group">
														<label for="role" className="col-xs-3 control-label">用户类型</label>
														<label for="role" className={this.state.edit ? "col-xs-9 control-label prl10" : "col-xs-9 control-label"}>{this.state.data.user_type}</label>
													</div>
													<div className={this.state.edit ? "form-group" : "form-group mb10"}>
														<label for="name" className="col-xs-3 control-label">昵称</label>
														<div className="col-xs-9">
														{
															this.state.edit ? 
															<input className="form-control" id="name" name="name" placeholder="请输入用户名" 
															defaultValue={this.state.data.user_name} onChange={e => this.onChangeName(e)} />
															: <label for="role" className="control-label" id="name">{this.state.data.user_name}</label>
														}
														</div>
													</div>
													<div className={this.state.edit ? "form-group" : "form-group mb10"}>
														<label for="email" className="col-xs-3 control-label">邮箱</label>
														<div className="col-xs-9">
														{
															this.state.edit ? 
															<input className="form-control" id="email" name="email" placeholder="请输入邮箱" 
															defaultValue={this.state.data.email} onChange={e => this.onChangeEmail(e)} />
															: <label for="role" className="control-label" id="email">{this.state.data.email}</label>
														}
														</div>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className={this.state.edit ? "panel-footer" : "none"}>
								<div className="btnbox">
									{
										<div className={this.state.edit ? "pull-right" : "none"}>
											<div className="btn btn-default btn-lg" type="button" id="cancel" onClick={this.handleCancel}>取消</div>
											<div className="btn btn-primary save-btn btn-lg" id="save" type="submit" onClick={this.handleSave}>确认</div>
										</div>
									}
								</div>
							</div>
						</div>
						<div className="panel panel-default bind-count">
							<div className="panel-heading">
								<h3 className="panel-title">账号绑定</h3>
							</div>
							<div className="panel-body tc">
								<ul>
									<li>
										<span className="iconfont icon-weixin"></span>
										{
											this.state.isBind && 
											<span className="icontxt1 binded-img"></span>
										}
										<span className="icontxt black">微信账号登陆</span>
										{
											this.state.isBind ? 
											<span className="icontxt icontxt2">
												<a onClick={this.popUnBindModalsm}>解绑&nbsp;</a>
											</span>
											:
											<span className="icontxt icontxt2 bindbtn" onClick={this.handleBindWeixin}>
												<a>绑定</a>
											</span>
										}
									</li>
									<li>
										<span className="iconfont icon-qq"></span>
										<span className="icontxt grey">QQ账号登陆</span>
										<span className="icontxt icontxt2 unselect">
											<span>绑定</span>
										</span>
									</li>
									<li>
										<span className="iconfont icon-xinlang"></span>
										<span className="icontxt grey">微博账号登陆</span>
										<span className="icontxt icontxt2 unselect">
											<span>绑定</span>
										</span>
									</li>
									<li>
										<span className="iconfont icon-shouji"></span>
										<span className="icontxt black">手机账号登陆</span>
										<span className="icontxt icontxt2" onClick={this.handleEditPhone}>
											<a>修改</a>
										</span>
									</li>
								</ul>
							</div>
						</div>

						<Modal title="温馨提示" id="tipShow" modalSm noBtn>
							<div className="m-msg">
								<p>{this.state.tipTxt}</p>
							</div>
						</Modal>

						<Modal title="修改手机号" id="edit_phone_modal" dismiss={this.handleModalDismiss} confirm={this.handleModalConfirm}>
							<form id="editPhone_form" className="form-horizontal">
								<div className="form-group">
									<label for="phone" className="col-xs-2 control-label">原手机号</label>
									<div className="col-xs-10">
										<input className="form-control reset" id="phone_old" name="phone_old" placeholder="请输入原手机号码" onChange={e => this.onChangeOldPhone(e)} /> 
									</div>
								</div>
								<div className="form-group">
									<label for="phone" className="col-xs-2 control-label">新手机号</label>
									<div className="col-xs-10">
										<input className="form-control reset" id="phone_new" name="phone_new" placeholder="请输入新手机号码" onChange={e => this.onChangeNewPhone(e)} /> 
									</div>
								</div>
								<div className="form-group">
									<label for="phone" className="col-xs-2 control-label">短信验证码</label>
									<div className="col-xs-6">
										<input className="form-control reset" name="code" onChange={e => this.onChangeCode(e)} /> 
									</div>
									<div className="col-xs-4">
										<button id="getCode" className={this.state.btnClick ? "getcode-btn btn btn-primary btn-lg" : "getcode-btn disabled btn btn-primary btn-lg"} 
										onClick={e => this.getCode(e)} type="button">
										{
											this.state.btnClick ? "获取短信验证码" : '重新发送 ('+this.state.secondsElapsed+')'
										}
										</button>
									</div>
								</div>
								<div className={this.state.modal_warn?"m-warn":"m-warn none"}>
									{this.state.modal_warntxt}
									<span className={this.state.warntxt2 ? "" : "none"}>({this.state.warntxt2})</span>
								</div>
								<div className="m-tip">
									<label>温馨提示：修改手机号后需要重新登陆</label>
								</div>
							</form>
						</Modal>

						<Modal title="温馨提示" id="warm_modal" modalSm cancelEvent dismiss={this.handleSaveCancel} confirm={this.handleModalsmConfirm}>
							<div className="m-tip">
								<p>当日修改未保存，是否返回？</p>
							</div>
						</Modal>

						<Modal title="温馨提示" id="unBind_modal" modalSm dismiss={this.handleUnBindCancel} confirm={this.handleUnBindConfirm}>
							<div className="m-tip">
								<p>是否确定进行解绑工作？</p>
							</div>
						</Modal>
					</div>
				</div>
			)
		}
	})

	ReactDOM.render(
		<Provider store={store}>
			<Frame>
				<Personal />
			</Frame>
		</Provider>, document.getElementById("personal"));
})