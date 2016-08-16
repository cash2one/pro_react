define([
	'mods',
	paths.ex.page + '/advices/manager/tag/actions.js'
], function(mods, Actions){
	var React = mods.ReactPack.default;

	var rest = new $.RestClient(paths.ex.api + '/api/v1/');
	rest.add('keywords');

	var EditBox = React.createClass({
		getInitialState: function(){
			var form = {
				name: this.props.data.name
			}
			var keywordids = this.props.data.keywords.map(item => item.id);
			return {
				form: form,
				keywordids,
				keywords: {},
				nameError: false
			}
		},
		componentDidMount: function(){
			rest.keywords.read({
				begin: 0,
				count: 1000
			}).then(data => data.reduce((obj, item) => {
				obj[item.id] = item;
				return obj
			}, {})).then(data => this.setState({keywords: data}));
		},
		setForm: function(obj){
			var form = Object.assign({}, this.state.form, obj);
			this.setState({form: form});
		},
		renderKeywords: function(){
			var handler = id => {
				let idx = this.state.keywordids.indexOf(id);
				if(idx == -1){
					this.setState({keywordids: [...this.state.keywordids, id]});
				}
				else{
					this.setState({keywordids: [...this.state.keywordids.slice(0, idx), ...this.state.keywordids.slice(idx + 1)]})
				}
			}
			var keywords = Object.keys(this.state.keywords).map(id => this.state.keywords[id]);
			var nodes = keywords.map((item, idx) => <span key={idx} className={"eb-tag" + (this.state.keywordids.indexOf(item.id) == -1 ? '' : ' active')} onClick={() => handler(item.id)} title={item.name}>{item.name.length > 6 ? item.name.substr(0, 6) + '...' : item.name}</span>);
			return nodes;
		},
		confirmHandler: function(){
			if(this.state.form.name.length > 0){
				var keywords = this.state.keywordids.map(id => this.state.keywords[id]);
				var form = Object.assign({}, this.state.form, {keywords});
				this.props.onConfirm && this.props.onConfirm(form);
			} else {
				this.setState({nameError: true});
			}
		},
		render: function(){
			var changeName = name => this.setForm({name});
			var resetError = () => this.setState({nameError: false})
			return (
				<div className="edit-box">
					<div className="eb-t">
						<div className="eb-t-cell">
							<div className="fl pr50" style={{width: '275px'}}>
								<div className="eb-t-lab">
									<span className="eb-t-lab">分类名称：</span>
								</div>
								<div className="eb-t-oper">
									<div className="ib pct100">
										<div className={"ip-g pct100" + (this.state.nameError ? ' error' : '')}>
											<input type="text" value={this.state.form.name} onChange={(e) => changeName(e.target.value)} onFocus={resetError} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="eb-text">
						<span>相关自动标签(重复点击可取消)</span>
					</div>
					<div className="eb-bt">
						<div>
							{this.renderKeywords()}
						</div>
					</div>
					{
						this.state.nameError ? <div className="error-bar">分类名称不能为空</div> : null
					}
					{
						this.props.errTxt ? <div className="error-bar">{this.props.errTxt}</div> : null
					}
					<div className="pt15 pb15 tc">
						<span className="eb-btn" onClick={() => this.props.onCancel && this.props.onCancel()}>取消</span>
						<span className="eb-btn" onClick={this.confirmHandler}>确定</span>
					</div>
				</div>
			)
		}
	});

	return EditBox;
})