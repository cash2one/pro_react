define([
	'mods',
	paths.ex.page + '/advices/manager/media/rank.js',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal/index.js'
], function(mods, Rank, Rest, Modal){
	const React = mods.ReactPack.default;
	const PropTypes = mods.ReactPack.PropTypes;
	const Pagination = mods.Pagination;

	var rest = Rest.ex();

	var Warn = React.createClass({
		getInitialState: function(){
			return {
				data: {
					status: '0',
					email: ''
				},
				show: false
			}
		},
		componentDidMount: function(){
			this.validate();
			rest.config.read().done(data => {
				data.value && this.setState({data: JSON.parse(data.value)});
			})
		},
		toggle: function(status){
			this.setState({data: Object.assign({}, this.state.data, {status})})
			this.validator.resetForm();
		},
		submitHandler: function(){
			if(this.validator.form()){
				rest.config.update(this.state.data).done(data => {
					if(data.result == true){
						this.setState({show: true})
						setTimeout(() => this.setState({show: false}), 800)
					}
				})
			}
		},
		emailHandler: function(value){
			this.setState({
				data: Object.assign({}, this.state.data, {email: value})
			});
		},
		validate: function(){
			this.validator = $('#warn_form').validate({
				rules: {
					email: {
						required: true,
						email: true
					}
				},
				messages: {
					email: {
						required: "邮箱不能为空",
						email: "不是合法的邮箱格式"
					}
				},
				submitHandler: function() {
					
				},
				errorPlacement: function(error, element) {
					// $('.err-box').empty().append(error);
					error.appendTo($('.err-box'))
				}
			})
		},
		render: function(){
			return (
				<div className="setting-warn w1200 fr-mid">
					<div className="hd">
						<span>通知设置</span>
					</div>
					<div className="bd">
						<form id="warn_form">
							<table className={this.state.data.status == '0' ? 'disabled' : null}>
								<colgroup width="100px"></colgroup>
								<colgroup width=""></colgroup>
								<tr>
									<td>状态</td>
									<td>
										<div className="c-button-g">
											<div className={"c-button-g-cell" + (this.state.data.status == '1' ? ' active' : '')} onClick={() => this.toggle('1')}>
												<span>开启</span>
											</div>
											<div className={"c-button-g-cell" + (this.state.data.status == '0' ? ' active' : '')} onClick={() => this.toggle('0')}>
												<span>关闭</span>
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td>通知邮箱</td>
									<td>
										<input type="text"
											name="email"
											placeholder="例：example@example.com"
											disabled={this.state.data.status == '0'}
											value={this.state.data.email}
											onChange={e => this.emailHandler(e.target.value)} />
									</td>
								</tr>
							</table>
							<div style={{width: '420px'}} className="ovh">
								<button className="c-button fr" type="button" onClick={this.submitHandler}>确定保存</button>
							</div>
							<div className="err-box"></div>
						</form>
					</div>
					<Modal noBtn show={this.state.show} title="提示">
						<p className="m-tip">保存成功</p>
					</Modal>
				</div> 
			)
		}
	});

	return Warn
})