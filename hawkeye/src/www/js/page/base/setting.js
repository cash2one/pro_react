/**
 * 搜索指数编辑页
 */

define([

	'mods',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal.js'

], function (mods, r, Modal) {
	
	var rest = r.index({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var Pagination = mods.Pagination;

	var Setting = React.createClass({

		getInitialState: function(){
			return {
				keysData: [],
				warn: false,
				warnTxt: '',
				tipTxt:'',
				istipTxt2:false,
				tipTxt2:'',
				id: '',
				form_error_txt: ''
			}
		},

		componentDidMount: function(){
			this.getKeysData();
		},

		handleConfirm: function(){

			var keyword = $('#key').val().trim();

			if(keyword == ''){

				this.setState({form_error_txt: '关键字不能为空'});

			} else {

				this.setState({form_error_txt: ''});

				var result = {
					keyword: keyword
				}
				// 添加
				rest.keywords.create(result).done(data => {
					if(data.result){
						this.getKeysData();
						$('#key').val('');
					}
					else{
						this.setState({form_error_txt: data.msg});
					}
				}).error(data => {

					if(data.status === 400 && data.responseJSON.msg){
						$('label.error').html(data.msg)
					}
				});
			}
		},

		delKey: function(e, id, keyword){
			e.stopPropagation();

			$('#smModal').modal('show');
			this.setState({tipTxt:'您确定要删除指数关键字"'+keyword+'"?', id: id});
		},

		// 确认删除
		handleTipConfirm:function(){
			var id = this.state.id;
			rest.keywords.del(id).done(data => {
				if(data.result){
					$('#smModal').modal('hide');
					this.getKeysData();
				}
				else{
					this.setState({
						warn: true,
						warnTxt: data.msg
					});
				}
			}).error(data => {

				if(data.status === 400 && data.responseJSON.msg){
					this.setState({
						warn: true,
						warnTxt: data.responseJSON.msg
					});
				}
				
			});
		},

		// 小弹窗提示操作（tip）- 关闭弹窗
		handleTipDismiss:function(){
			$('#smModal').modal('hide');
		},

		getKeysData: function(){
			rest.keywords.read().done(keysData => {
				this.setState({keysData: keysData});
			})
		},

		toggleKey: function(e, id, elem){
			var classList = e.target.parentNode.classList,
				id_ = id,
				classLen = $('.key.active').length,
				tooltipId = '#tooltip'+elem+'';
			
			if(classList == 'key active') {

				$("[data-toggle='tooltip']").tooltip('destroy');

				rest.keywords.update(id_, {status: 0}).done(data => {
					if(data.result) {
						this.getKeysData();
					}
				})
				
			}else {

				// 点击开启关键字的时候先去判断是不是已满5个，是提示tooltip，否则可以选择
				if(classLen < 5) {

					$("[data-toggle='tooltip']").tooltip('destroy');

					rest.keywords.update(id_, {status: 1}).done(data => {
						if(data.result) {
							this.getKeysData();
						}
					})

				} else {  // 最多只能选择5个, 5个以上提示错误
					$(tooltipId).attr("title","最多允许选择5个关键字，请先取消选中关键字");
					$(tooltipId).tooltip('show');
				}
				
			}

		},

		gotoInfo: function(){
			var url = window.location.protocol+'//'+window.location.hostname +'/index-base#/info';
			window.location.href = url;		
		},

		render: function(){
			var keysData = this.state.keysData;

			return (
				<div className="index-base-setting container">
					<div className="panel panel-default">
						<div className="panel-heading">
							<h3 className="panel-title">管理指数关键字</h3>
							<button className="btn btn-primary" onClick={this.gotoInfo}>返回</button>
						</div>
						<div className="panel-body">
							<div className="row mt10">
								<div className="col-xs-3">
									{
										<div className="input-icon-form">
									  		<input type="text" className={this.state.form_error_txt !== '' ? "form-control input-key error" : "form-control input-key"} name="key" id="key" ref="key"
									  		placeholder="输入想添加的指数关键字"
									  		onKeyDown={e => e.keyCode == 13 && this.handleConfirm() } />
									  		<label htmlFor="key" className={this.state.form_error_txt !== '' && "error"}>{this.state.form_error_txt}</label>
									  		<span className="iconfont icon-tianjia addbtn"
									  		onClick={this.handleConfirm}></span>
									  	</div>
									}
								</div>
								<div className="col-xs-5 errorbox">
									<span className={this.state.warn && "error"}>{this.state.warnTxt}</span>
								</div>
							</div>
							<div className="keybox mt20">
								{
									keysData.map((index,elem) => {
										var id = index.id,
											keyword = index.keyword,
											status = index.status;
										return (
											<div className={status == 0 ? "key" : "key active"} id={'tooltip'+elem+''} data-toggle="tooltip"
											onClick={e => this.toggleKey(e, id, elem)} data-status={status}>
												<span title={keyword}>{keyword}</span>
												<i className="iconfont icon-guanbi" onClick={e => this.delKey(e, id, keyword)}></i>
											</div>
										)
									})
								}
							</div>
						</div>
					</div>

					<Modal title="删除指数关键字" modalSm id="smModal" noBtn={this.state.noBtn} 
					dismiss={this.handleTipDismiss} 
					confirm={e => {this.handleTipConfirm(e)}}>
						<div className="m-tip">
							<p>{this.state.tipTxt}</p>
							<p className='tipTxt2'>提示：确认将删除该关键字及历史指数数据</p>
						</div>
					</Modal>

				</div>
			)
		}

	})

	return Setting
	
})