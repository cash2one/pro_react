/**
 * 登录
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
	paths.rcn.util + '/rest.js'
], function(mods, r){

	var rest = r.rcn({
		stringifyData: false
	});
	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Login = React.createClass({
		getInitialState: function(){
			return {

				tip:null,
				isTip:false,

				timer:120,
				isTimerClick:true,

				data:{},
				verifyImgUrl:'',

				secondsElapsed: 120,

				isEnterLoginPage: false
			}
		},

		componentWillMount: function(){
			this.state.data.role = 'role';

			// 角色获取
			var pathName = window.location.pathname.substring(1);
			var roleName;
			if(pathName === 'super'){
				this.state.data.role = 'role_super_manager';
				roleName = 'role_super_manager';
			}else{
				this.state.data.role = 'role_manager';
				roleName = 'role_manager';
			}
			
			if($.cookie('user_token')){ // cookie存在token进入公司管理页

				var url = paths.rcn.web +'/manager#/company';
				window.location.href = url;
				
			} else if (window.location.search) { // 地址栏存在参数 -> 进入微信登陆页判断
				
	            if (this.GetQueryString("code")) { // 用户允许授权
	            	
    				var code = this.GetQueryString("code");
    	            var state = this.GetQueryString("state");

	            	var opt = {
	            		// role: roleName,
	            		from: 'web',
	            		code: code,
	            		state: state
	            	};
	            	this.handleSubmit(opt, 'login_wx');

	            } else { // 用户禁止授权 , 用户调回登陆页

	            	var url = paths.rcn.web;
	            	window.location.href = url;
	            	this.setState({isEnterLoginPage: true});
	            }
			} else {

				this.setState({isEnterLoginPage: true});
			}
		},

		componentDidMount:function(){
			this.getVerifyCodePic();
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

        // 微信登陆
		loginWeixin: function(role) {


			var redirect_uri = window.location.protocol + "//" + window.location.hostname;
			var state = this.getRandomString();
			var role = this.state.data.role;
			if(role !== 'role_manager'){
				redirect_uri += '/super';

			}
			
			var opt = {
				// state: state,
				role: role,
				redirect_uri: redirect_uri
			}
			rest.user.create('auth_url_wx', opt).done(data => {
				if (data.result) {
					window.location.href = data.auth_url;
				}
			});
		},

		componentWillUnmount: function() {
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		componentDidUpdate:function(){
			this.validate();
		},

		validate:function(){
			var self = this;

			$("#login_form").validate({
				debug:true,
				rules:{
					phone:{
						required:true,
						minlength:11,
						number:true
					},
					mess_seccode: {
						required:true,
						maxlength:6,
						number:true
					},
					seccode:{
						required:true,
						maxlength:6
					}
				},
                messages:{
                    phone:{
                    	required:"手机号码不能为空",
                    	minlength:"手机号码不能小于11位数字",
                    	number:"手机号码必须为合法数字"
                    },
                    mess_seccode:{
                    	required:"短信验证码不能为空",
                    	minlength:"短信验证码不能小于6位数字",
                    	number:"短信验证码必须为合法数字"
                    },
                    seccode:{
                    	required:"图片验证码不能为空",
                    	minlength:"图片验证码不能小于6位数字"
                    }
                },
	            submitHandler: function(){ 
	                self.handleSubmit(self.state.data, 'login');
	            }, 
				errorPlacement:function(error, element){
					// $('.login-tip').find('label').remove();
					// $('.login-tip').html('');
					self.setState({isTip:true});
    				error.appendTo($('.lfr-body-tipbox'));
				}
			});
		},
		// 获取验证码图片
		getVerifyCodePic:function(){
			var self = this;
			var v_id = this.getRandomString();
			this.state.data.v_id = v_id;

			$.get(paths.rcn.api + '/api/v1/user/verify',{v_id}, function(data){
				self.setState({verifyImgUrl:this.url});
			})
		},

		// 重置按钮可点击
		tickClear:function(){
			this.setState({isTimerClick:true, secondsElapsed: 120}); // 按钮2分钟后可点击
			$('.seccodeBtn').attr("disabled",false);
			clearInterval(this.interval);
			clearTimeout(this.btn_time);
		},

		// 短信倒计时
		tick:function(){
			this.setState({
				secondsElapsed: this.state.secondsElapsed - 1
			});
		},

		// 生成登陆验证码(获取短信验证码)
		getCaptchaCode:function(e){

			// 验证手机号码是否通过
			var isPass = $("#login_form").validate().element($("#phone"));
			var phone = this.state.data.telephone;

			this.tickClear();

			if(isPass){

				var opt = {
					telephone:phone,
					role:this.state.data.role
				};
				rest.user.create('authcode',opt).done(data => {
					if(data.result){
						this.interval = setInterval(this.tick, 1000); // 短信倒计时
						this.setState({isTimerClick:false});
						$('.seccodeBtn').attr("disabled",true);

						$('#server_error').hide();
						this.setState({isTip:false});

						this.btn_time = setTimeout(() => {
							this.tickClear();
						},120000);
					}
				}).error(data => {
					if(data.status === 400 && data.responseJSON.msg){
						this.setState({tip:data.responseJSON.msg, isTip:true});
						$('#server_error').show();
					}else{
						this.setState({tip:"服务器出错，请联系管理员", isTip:true});
					}
				});

			}

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

		changeTelephone:function(e){
			var val = e.target.value;
			this.state.data.telephone = val;
		},
		changeCaptcha:function(e){
			var val = e.target.value;
			this.state.data.captcha = val;
		},
		changeVerifyCode:function(e){
			var val = e.target.value;
			this.state.data.verify_code = val;
		},

		handleSubmit:function(opt, param){
			rest.user.create(param, opt).done(data => {
				if(data.result && data.token){
					if($.cookie('user_token', data.token, {domain: paths.rcn.domain, expires: new Date(Date.now() + 12 * 3600 * 1000)})){
						$.cookie('md5', $.randomCode(), {domain: paths.rcn.domain});
						var url = paths.rcn.web +'/manager#/company';
						window.location.href = url;
					}
				}
			}).error(data => {
				if (data.status == 400 && data.responseJSON.msg) {
					this.setState({isEnterLoginPage: true});
					this.setState({isTip:true, tip:data.responseJSON.msg}); // 这里的tip偶尔并没有更新，通过html方法完善这个bug
					$('#server_error').html(data.responseJSON.msg);
					$('#server_error').show();
					this.tickClear();
					this.btn_time = setTimeout(() => {
						this.getCaptchaCode();
						this.getVerifyCodePic();
					},1000);
				}
				else if (data.status == 417) { // 短信验证码和图形验证码已失效
					this.tickClear();
					this.btn_time = setTimeout(() => {
						this.getCaptchaCode();
						this.getVerifyCodePic();
					},1000);
				}
				else if (data.status == 404) { // 手机号不存在或该用户角色不存在
					this.setState({isTip:true, tip:data.responseJSON.msg});
					$('#server_error').html(data.responseJSON.msg);
					$('#server_error').show();
				}
				else {
					this.setState({tip:"服务器出错,请联系管理员", isTip:true});
				}

			});

		},

		render: function(){
			const pageShow = () => {
				if( this.state.data.role === 'role' ) {
					return false
				} else if ( this.state.data.role === 'role_manager' ) {
					return (
						<div className="iconfontbox ic-loginbox">
							<span className="roleicon iconfont icon-zhanghu"></span>
							<span className="icontxt">运营员</span>
						</div>
					)
				} else if ( this.state.data.role === 'role_super_manager' ) {
					return (
						<div className="iconfontbox">
							<span className="roleicon iconfont icon-xingxing"></span>
							<span className="icontxt">超级运营员</span>
						</div>
					)
				}
			}
			const isEnterLoginPage = () => {
				if ( this.state.isEnterLoginPage ) {
					return (
						<div className="loginpage lframe-bg">
							<div className="lframe-body">
								<form id="login_form" autocomplete="off">
									<div className="lfr-body-loginbox">
										<div className="lfr-header-logo">
											<img src="img/logo.png" width="32" height="41" />
											<span className="text">深圳普智正元</span>
											{
												pageShow()
											}
										</div>
										<span className="inputicon iconfont icon-iconfontshouji"></span>
										<div className="lb-row2 mb9 mt66">
											<input type="text" className="phone" placeholder="手机号码" onChange={(e) => {this.changeTelephone(e)}} 
											id="phone" name="phone" autocomplete="off"/>
										</div>
										<span className="inputicon iconfont icon-shield"></span>
										<div className="lb-row2 mb9">
											<input type="text" className="mess-seccode" placeholder="短信验证码" onChange={(e) => {this.changeCaptcha(e)}}
											id="mess_seccode" name="mess_seccode" autocomplete="off"/>
											<button className={this.state.isTimerClick?"loginbtn2 seccodeBtn":"loginbtn2 seccodeBtn disable"} type="button"
											onClick={e => this.getCaptchaCode(e)}>
											{
												this.state.isTimerClick ? "获取短信验证码" : '重新发送 ('+this.state.secondsElapsed+')'
											}
											</button>
										</div>
										<div className="lb-row2 mb9">
											<input type="text" className="seccode" onChange={(e) => {this.changeVerifyCode(e)}}
											id="seccode" name="seccode" autocomplete="off"/>
											<img src={this.state.verifyImgUrl} width="32" height="41" className="seccode-img" title="点击刷新验证码"
											onClick={this.getVerifyCodePic} />
										</div>
										<div className="mt20">
											<button type="submit" className="c-button" id="login_submit_btn">确定</button>
											<div className="weixin-loginbox" id="showWeixin" onClick={e => this.loginWeixin(this.state.data.role)}>
												<span className="iconfont icon-weixin1"></span>
												<span>微信登陆</span>
											</div>
										</div>
									</div>
									<div className={this.state.isTip?"lfr-body-tipbox":"lfr-body-tipbox none"}>
										<label className="error" id="server_error" style={{"display":"block"}}>{this.state.tip}</label>
									</div>
								</form>
							</div>
							<div className="aboutbox">
								<div className="txt1">
									<a href={paths.rcn.web + '/about'} className="ltxt">版本声明</a>
									<a href={paths.rcn.web + '/thanks'} className="rtxt">特别鸣谢</a>
								</div>
								<div className="txt2">© 2016 深圳市普智正元科技传媒有限公司  粤ICP备15106517号-1 </div>
							</div>
						</div>
					)
				} else {
					return (
						<div className="loadingBox">
							<div className="loadingGif"></div>
							<div className="loadingTxt">从第三方网站登陆，数据加载中...</div>
						</div>
					)
				}
			}
			return (
				<div className="w h minh">
					{
						isEnterLoginPage()
					}
				</div>
				
			)
		}
	})

	ReactDOM.render(<Login />, document.getElementById("loginpage"));
})

// 短信验证码用"captchaCode"代表 or "mess_seccode"
// 图形验证码用"verifyCode"代表 or "seccode"