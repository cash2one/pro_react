define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.page + '/advices/base/articles/art-list-item.js',
	paths.rcn.comps + '/loader.js',
	paths.rcn.comps + '/modal.js',
	paths.rcn.lib + '/bootstrap.min.js'
], function(mods, R, ArtItem, Loader, Modal){
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;
	var rest = R.ex2();

	return Tar => React.createClass({
		getInitialState(){
			return {
				show: false,
				lists: {},
				title_sign: null,
				beg: 0,
				m: 10,
				loading: 0,
				delUuid: null,
				delTitleSign: null
			}
		},
		componentDidUpdate(p, s){
			if(!s.show && this.state.show && this.state.title_sign){
				this.getData();
			}
		},
		getData(){
			this.load(1);
			$.when(this.getList(), this.getCount()).always(() => this.load(0));
		},
		getList(){
			return rest.article.data.read('same', {
				beg: this.state.beg,
				m: this.state.m,
				title_sign: this.state.title_sign
			}).done(data => {
				if(data.result){
					this.setState({lists: data.data.reduce((o, item, i) => {
						item._i = i;
						o[item.uuid] = item;
						return o;
					}, {})})
				}
			})
		},
		getCount(){
			return rest.article.data.read('same', {
				beg: this.state.beg,
				m: this.state.m,
				count: true,
				title_sign: this.state.title_sign
			}).done(data => {
				if(data.result){
					this.setState({count: data.count});
				}
			})
		},
		tog(title_sign, queryParams){
			this.setState({show: true, title_sign, queryParams})
		},
		load(b){
			this.setState({loading: b});
		},
		openDelModal(uuid, title_sign){
			this.setState({delUuid: uuid, delTitleSign: title_sign});
			$('#tipModal').modal('show');
		},
		delHandler(){
			this.load(1);
			rest.article.update('same', {
				uuids: [this.state.delUuid],
				title_sign: this.state.delTitleSign
			}).done(data => {
				if(data.result){
					$('#tipModal').modal('hide');
					if(Object.keys(this.state.lists).length <= 1){
						this.setState({delUuid: null, delTitleSign: null, loading: 1}, () => {
							this.getList().always(() => this.load(0));
						});
					} else {
						let lists = $.extend(true, {}, this.state.lists);
						delete lists[this.state.delUuid];
						this.setState({lists});
					}
				}
			}).always(() => this.load(0));
		},
		renderList(){
			var node, list = Object.keys(this.state.lists).sort((a, b) => a._i - b._i).map(u => this.state.lists[u]);
			if(list.length > 0){
				node = (
					<ul>
						{list.map((item, idx) => <ArtItem moreMode queryParams={{}} data={item} key={idx} clickYichu={() => this.openDelModal(item.uuid, item.title_sign)} />)}
					</ul>
				)
			} else {
				node = <div className="list-blank-holder">暂无数据</div>
			}

			return node
		},
		renderPagin(){
			var node, {beg, count, m} = this.state,
				jump = page => {
					page = page - 1;
					this.setState({beg: page * m, loading: 1}, () => {
						this.getList().always(() => this.load(0));
					});
				}
			if(count > m){
				node = (
					<div className="tc pagin-part">
						<Pagination current={Math.floor(+beg / +m) + 1} total={count > 99 * +m ? 99 * +m : count} pageSize={m} className={"v2 ib vm mb5"} onChange={page => jump(page)} />
						{
							count > 0 ? <span className="ib vm txt">{'相关文章总数：' + count + '篇'}</span> : null
						}
					</div>
				)
			}

			return node;
		},
		render(){
			return this.state.show ? (
				<div className="advices-base-more">
					<div className="con">
						<div className="panel panel-default">
							<div className="panel-heading">
								<h3 className="panel-title">相同文章</h3>
							</div>
							<div className="panel-bd">
								{this.renderList()}
								{this.renderPagin()}
							</div>
							<div className="panel-footer">
								<div className="tr">
									<span className="btn btn-lg btn-primary" onClick={() => this.setState({show: false, uuid: null, lists: {}})}>返回</span>
								</div>
							</div>
						</div>
					</div>
					<Loader show={this.state.loading} fix />
					<Modal id="tipModal" title="温馨提示" modalSm confirm={() => this.delHandler()}>
						<div className="tc">
							<p>您确定删除此文章吗？</p>
						</div>
					</Modal>
				</div>
			) : <Tar {...this.props} togMore={this.tog} />
		}
	})
})