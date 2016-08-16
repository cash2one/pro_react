define([
	'mods',
	paths.ex.page + '/advices/manager/tag/actions.js',
	paths.rcn.util + '/rest.js'
], function(mods, Actions, Rest){
	var React = mods.ReactPack.default;
	const Pagination = mods.Pagination;
	const {connect} = mods.ReactReduxPack;
	var {changeAutoPage, modifyAuto} = Actions;

	var rest = Rest.ex();

	var BtnGroup = React.createClass({
		getInitialState: function(){
			return this._getInit(this.props.btns);
		},
		_getInit: function(btns){
			let selected = [];
			btns = btns.reduce((obj, item, idx) => {
				obj[idx] = item;
				if(item.selected)
					selected.push(idx);
				return obj;
			}, {});
			return {
				selected,
				btns
			}
		},
		getDefaultProps: function(){
			return {
				class_name: 'eb-t-gbtn',
				class_name_r: ' eb-t-gbtn-r'
			}
		},
		handleClick: function(key, item){
			if(this.props.mutiple){
				var selected = this.state.selected.slice().push(key);
			}
			else{
				selected = [key];
			}
			this.setState({selected: selected});
			this.props.onClick && this.props.onClick(item);
		},
		renderBtn: function(){
			return Object.keys(this.state.btns).map(key => {
				let item = this.state.btns[key];
				let activeClass = this.state.selected.indexOf(key) == -1 ? '' : ' active';
				return (
					<div className={"eb-t-gbtn-cell" + activeClass} onClick={() => this.handleClick(key, item)}>
						<span>{item.title}</span>
					</div>
				)
			})
		},
		render: function(){
			var class_name = this.props.class_name;
			if(this.props.round) class_name += this.props.class_name_r;
			return (
				<div className={class_name}>
					{this.renderBtn()}
				</div>
			)
		}
	})

	var EditBox = React.createClass({
		getInitialState: function(){
			var form = {
				name: this.props.data.name,
				depend: this.props.data.depend,
				emotion: this.props.data.emotion,
				warn: this.props.data.warn,
				category: this.props.data.category
			}
			var categoryid = this.props.data.category.map(item => item.id);
			return {
				form: form,
				category: {},
				categoryid,
				nameError: false
			}
		},
		componentDidMount: function(){
			rest.category.read({
				begin: 0,
				count: 1000
			}).then(data => data.reduce((obj, item) => {
				obj[item.id] = item;
				return obj
			}, {})).then(data => this.setState({category: data}));
		},
		setForm: function(obj){
			var form = Object.assign({}, this.state.form, obj);
			this.setState({form: form});
		},
		renderCategory: function(){
			var handler = id => {
				// let idx = this.state.categoryid.indexOf(id);
				// if(idx == -1){
				// 	this.setState({categoryid: [...this.state.categoryid, id]});
				// }
				// else{
				// 	this.setState({categoryid: [...this.state.categoryid.slice(0, idx), ...this.state.categoryid.slice(idx + 1)]})
				// }
			}
			var category = Object.keys(this.state.category).map(id => this.state.category[id]);
			var nodes = category.map((item, idx) => <span key={idx} className={"eb-tag" + (this.state.categoryid.indexOf(item.id) == -1 ? '' : ' active')} onClick={() => handler(item.id)} title={item.name}>{item.name.length > 6 ? item.name.substr(0, 6) + '...' : item.name}</span>);
			return nodes;
		},
		confirmHandler: function(){
			if(this.state.form.name.length > 0){
				var category = this.state.categoryid.map(id => this.state.category[id]);
				var form = Object.assign({}, this.state.form, {category});
				this.props.onConfirm && this.props.onConfirm(form);
			} else {
				this.setState({nameError: true})
			}
		},
		renderName: function(){
			var changeName = name => this.setForm({name: name});
			var resetError = () => this.setState({nameError: false});
			if(this.props.modify){
				return <input type="text" className={"form-control" + (this.state.nameError || this.props.errTxt ? ' error' : '')} disabled value={this.state.form.name} onFocus={resetError} />
			} else if(this.props.create){
				return <input type="text" className={"form-control" + (this.state.nameError || this.props.errTxt ? ' error' : '')} value={this.state.form.name} onChange={e => changeName(e.target.value)} onFocus={resetError} />
			}
		},
		render: function(){
			var changeDepend = depend => this.setForm({depend: depend});
			var changeEmotion = emotion => this.setForm({emotion: emotion});
			var changeWarn = warn => this.setForm({warn: warn});
			var nameError = this.state.nameError,
				errTxt = this.props.errTxt;
			return (
				<div className="edit-box">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">自动标签</h3>
							</div>
							<div className="panel-body">
								<form className="form-horizontal" onSubmit={(e) => e.preventDefault()}>
									<div className="form-group">
										<label className="col-lg-1 col-lg-offset-1 control-label">关键词</label>
										<div className="col-lg-9">
											{this.renderName()}
											{
												nameError ? <span className="err">关键词不能为空</span> : errTxt ? <span className="err">{errTxt}</span> : null
											}
										</div>
									</div>
									{
										// <div className="form-group">
										// 	<label className="col-lg-1 col-lg-offset-1 control-label">关联度判断</label>
										// 	<div className="col-lg-9">
										// 		<div className="mt10">
										// 			<span className="item">
										// 				<input type="radio" name="guanliandu" className="rd" id="guanliandu1" onChange={() => changeDepend(1)} checked={this.state.form.depend == 1} />
										// 				<label htmlFor='guanliandu1'></label>
										// 				<label htmlFor="guanliandu1">有关</label>
										// 			</span>
										// 			<span className="item">
										// 				<input type="radio" name="guanliandu" className="rd" id="guanliandu2" onChange={() => changeDepend(0)} checked={this.state.form.depend == 0} />
										// 				<label htmlFor='guanliandu2'></label>
										// 				<label htmlFor="guanliandu2">无关</label>
										// 			</span>
										// 		</div>
										// 	</div>
										// </div>
										// <div className="form-group">
										// 	<label className="col-lg-1 col-lg-offset-1 control-label">情感分析</label>
										// 	<div className="col-lg-9">
										// 		<div className="mt10">
										// 			<span className="item">
										// 				<input type="radio" name="qinggan" className="rd" id="qinggan1" onChange={() => changeEmotion(0)} checked={this.state.form.emotion == 0} />
										// 				<label htmlFor='qinggan1'></label>
										// 				<label htmlFor="qinggan1">无</label>
										// 			</span>
										// 			<span className="item">
										// 				<input type="radio" name="qinggan" className="rd" id="qinggan2" onChange={() => changeEmotion(1)} checked={this.state.form.emotion == 1} />
										// 				<label htmlFor='qinggan2'></label>
										// 				<label htmlFor="qinggan2">正面</label>
										// 			</span>
										// 			<span className="item">
										// 				<input type="radio" name="qinggan" className="rd" id="qinggan3" onChange={() => changeEmotion(2)} checked={this.state.form.emotion == 2} />
										// 				<label htmlFor='qinggan3'></label>
										// 				<label htmlFor="qinggan3">中立</label>
										// 			</span>
										// 			<span className="item">
										// 				<input type="radio" name="qinggan" className="rd" id="qinggan4" onChange={() => changeEmotion(-1)} checked={this.state.form.emotion == -1} />
										// 				<label htmlFor='qinggan4'></label>
										// 				<label htmlFor="qinggan4">负面</label>
										// 			</span>
										// 		</div>
										// 	</div>
										// </div>
										// <div className="form-group">
										// 	<label className="col-lg-1 col-lg-offset-1 control-label">预警</label>
										// 	<div className="col-lg-9">
										// 		<div className="mt10">
										// 			<span className="item">
										// 				<input type="radio" name="yujing" className="rd" id="yujing2" checked={this.state.form.warn == 0} onChange={() => changeWarn(0)} />
										// 				<label htmlFor='yujing2'></label>
										// 				<label htmlFor="yujing2">否</label>
										// 			</span>
										// 			<span className="item">
										// 				<input type="radio" name="yujing" className="rd" id="yujing1" checked={this.state.form.warn == 1} onChange={() => changeWarn(1)} />
										// 				<label htmlFor='yujing1'></label>
										// 				<label htmlFor="yujing1">是</label>
										// 			</span>
										// 		</div>
										// 	</div>
										// </div>
									}
								</form>
							</div>
							<div className="panel-footer tr">
								<button className="btn btn-default btn-lg mr10" onClick={() => this.props.onCancel && this.props.onCancel()} type="button">取消</button>
								<button className="btn btn-primary btn-lg" onClick={this.confirmHandler} type="button">确认</button>
							</div>
						</div>
					</div>
				</div>
			)
		}
	});

	return EditBox;
})