define(['mods'], function(mods){
	var React = mods.ReactPack.default;

	var appMap = {
		'news': '新闻',
		'goods': '商品',
		'title': '标题',
		'text': '全文'
	}

	var Search = React.createClass({
		getInitialState(){
			return {toggleOpen: false, dirty: false}
		},
		componentDidUpdate(o){
			if(this.state.dirty == false || this.props.queryParams.wd != o.queryParams.wd)
				this.refs.input.value = this.props.queryParams.wd;
		},
		toggleHandler(){
			if(!this.state.toggleOpen){
				this.setState({toggleOpen: true});
				$(document).one('click', () => {
					this.setState({toggleOpen: false});
				})
			}
		},
		toggleClick(value){
			if(this.props.toggle){
				this.setState({dirty: false});
				this.props.toggle('app', value, {'wd': this.refs.input.value});
			}
		},
		search(){
			var value = $.trim(this.refs.input.value);
			this.setState({dirty: false});
			if(this.props.search)
				this.props.search(value);
		},
		render(){
			const {queryParams} = this.props;
			return (
				<section className="search-part">
					<div className="search-wrap">
						<div className="search-cell">
							<div className={"search-toggle" + (this.state.toggleOpen ? ' active' : '')}>
								<div className="holder" onClick={this.toggleHandler}>
									<span className="txt">{appMap[queryParams['app']]}</span>
								</div>
								<ul className="dropdown-list">
									<li className="dropdown-item" onClick={() => this.toggleClick('title')}><span>标题</span></li>
									<li className="dropdown-item" onClick={() => this.toggleClick('text')}><span>全文</span></li>
								</ul>
							</div>
						</div>
						<div className="search-input">
							<input type="text" placeholder="请输入您要搜索的内容" ref='input' onKeyDown={e => e.keyCode == 13 && this.search()} onFocus={e => e.target.select()} onChange={() => this.setState({dirty: true})} />
						</div>
						<div className="search-cell" onClick={this.search}>
							<div className="search-button">
								<span className="iconfont icon-sousuo"></span>
							</div>
						</div>
					</div>
				</section>
			)
		}
	})

	return Search;
})