define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.rcn.comps + '/modal/index.js',
	paths.rcn.comps + '/loader.js',
], function(mods, Rest, Modal, Loader){
	var React = mods.ReactPack.default;
	var Pagination = mods.Pagination;

	var rest = Rest.spread();
	rest.article.add('index');
	rest.article.add('media');
	var env = {
		debug: false
	}

	var Spread = React.createClass({
		getInitialState: function(){
			return {
				params: {
					q: '',
					begin: 0,
					limit: 10
				},
				tab: '全库文章',
				order: '最新转载',
				data: {},
				count: 0,
				searchError: false,
				submit2ModalShow: false,
				submit2DataId: null,
				submitModalShow: false,
				searchResultBlank: false,
				loading: false
			}
		},
		componentDidMount: function(){
			this.getData();
			this.getCount();
		},
		componentDidUpdate: function(){
			if(this.state.submitModalShow){
				this.submitModalDidMount();
			}
			if(this.state.submit2ModalShow){
				this.submit2ModalDidMount();
			}
		},
		ddTog: function(){
			var d = $('#dd_option').css('display');
			if(d == 'none'){
				$('#dd_option').toggle(100);
				$(document).one('click', () => $('#dd_option').toggle(100))
			}
		},
		getData: function(){
			var data;
			if(env.debug){
				if(this.state.tab == '事件文章'){
					data = [{
						spread_uuid: 1,
						title: 'ev - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 0,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "这是文章的正文内容，所有CSS全部丢了，只保留段落标识。",
						from: {
							media: "百度百家",
							mid: "1005",
						}
					}, {
						spread_uuid: 2,
						title: 'ev - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "【解说】5月15日零时起，全国铁路实行新的列车运行图，这是近10年来铁路实施的最大范围列车运行图调整，也是铁路运输能力增量最大的一次调整。据最新铁路运行图安排，5月15日起首次开通上海虹桥站至北京南站的“红眼高铁”列车...",
						from: {
							media: "百度百家",
							mid: "1005",
						}
					}]
				} else if (this.state.tab == '全库文章') {
					data = [{
						spread_uuid: 1,
						title: 'art - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "这是文章的正文内容，所有CSS全部丢了，只保留段落标识。",
						from: {
							media: "百度百家",
							mid: "1005",
						}
					}, {
						spread_uuid: 2,
						title: 'art - 这是标题',
						title_sign: '分析文章的SimHash',
						reship_count: 100,
						status: 1,
						publish_at: "2020-12-21 xx:xx:xx",
						url: "http://hdpfans.baijia.baidu.com/article/286824",
						content: "【解说】5月15日零时起，全国铁路实行新的列车运行图，这是近10年来铁路实施的最大范围列车运行图调整，也是铁路运输能力增量最大的一次调整。据最新铁路运行图安排，5月15日起首次开通上海虹桥站至北京南站的“红眼高铁”列车...",
						from: {
							media: "百度百家",
							mid: "1005",
						}
					}]
				}
				data = data.reduce((obj, item, i) => {
					item['_i'] = i;
					obj[item['spread_uuid']] = item;
					return obj;
				}, {});

				this.setState({data});
			} else {
				if(this.state.tab == '全库文章'){
					this.setState({loading: true});
					rest.article.read('search', this.state.params).done(data => {
						this.setState({loading: false});
						if(data.length > 0){
							data = data.reduce((obj, item, i) => {
								item['_i'] = i;
								obj[item['spread_uuid']] = item;
								return obj;
							}, {});
							this.setState({
								data,
								searchResultBlank: false
							});
						} else {
							this.setState({
								data: {},
								searchResultBlank: true
							})
						}
					});
				} else if(this.state.tab == '事件文章') {
					this.setState({data: {}, searchResultBlank: true})
				}
			}
		},
		getCount: function(){
			rest.article.read('search', $.extend({}, this.state.params, {count: true})).done(({count = 0}) => {
				this.setState({count});
			})
		},
		search: function(){
			var val = this.refs.search.value;
			var next = Object.assign({}, this.state);

			if(val != this.state.params.q){
				next.params.q = val;

				if(val.length == 0){
					next.tab = '事件文章';
					next.searchError = false;
				} else if (val.length > 0 && val.length < 2){
					next.searchError = true;
				} else {
					next.searchError = false;
					next.searchResultBlank = false;
					next.tab = '全库文章';
				}

				if(!next.searchError){
					this.setState(next, () => {
						this.getData();
						this.getCount();
					});
				}
				else 
					this.setState(next);
			}
		},
		renderList: function(){
			var lib = this.state.data,
				data = Object.keys(lib).map(id => lib[id]).sort((a, b) => a._i - b._i),
				nodes = null,
				searchError = this.state.searchError,
				searchResultBlank = this.state.searchResultBlank;
			if(searchError == false && !searchResultBlank){
				nodes = (
					<div className="list-wrap cf">
						{
							data.map((dat, idx) => {
								return (
									<div className="item" key={idx}>
										<div className="hd">
											<div className="title">
												<a target="_blank">{dat.title}</a>
											</div>
											{
												dat.status == 1 ? <a href={paths.ex.base + '/analy#/spread/detail'} className="status">查看分析</a>
												: <span className="status" onClick={() => this.setState({submit2ModalShow: true, submit2DataId: dat.spread_uuid})}>未分析</span>
											}
										</div>
										<div className="bd">
											<p className="desc">{dat.content}</p>
										</div>
										<div className="ft">
											<span>{dat.publish_at}</span>
											<span className="ml15">{(dat.reship_count || 0) + '篇转发'}</span>
										</div>
									</div>
								)
							})
						}
						
					</div>
				);
			}

			return nodes;
		},
		renderRes: function(){
			var node = null;
			if(this.state.searchError){
				node = (
					<section className="res-blank">
						<p>{'搜索词 “'+ this.state.params.q +'” 少于两个字符。'}</p>
						<p>请输入两个字符以上且有意义的搜索词，系统将为您匹配更精准的搜索结果。</p>
					</section>
				)
			}
			return node;
		},
		togOrder: function(order){
			this.setState({order});
		},
		renderListWrap: function(){
			var node = null;
			var renderB = () => {
				let q = this.state.params.q,
					tab = this.state.tab;
				return <span>{tab + (q.length > 0 ? ' > “' + q + "”" : '')}</span>
			}
			if(this.state.searchError == false && !this.state.searchResultBlank){
				node = (
					<section className="list-part pr">
						<div className="con">
							<div className="hd cf">
								<div className="l">
									{renderB()}
									<span className="count">{'共' + this.state.count + '篇文章'}</span>
								</div>
								<div className="r">
									<div className="c-dropdown" onClick={this.ddTog}>
										<div className="select" type="button">
											<span className="txt">{this.state.order}</span>
											<span className="ic"><span className="iconfont icon-xiala"></span></span>
										</div>
										<ul className={'option dn'} id="dd_option">
											<li className="f14" onClick={() => this.togOrder('最新转载')}>最新转载</li>
											<li className="f14" onClick={() => this.togOrder('最多转载')}>最多转载</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="bd">
								{this.renderList()}
								{this.renderPagin()}
							</div>
						</div>
						<Loader show={this.state.loading} />
					</section>
				)
			}
			return node;
		},
		renderSubmit2: function(){
			var show = this.state.submit2ModalShow,
				submit2DataId = this.state.submit2DataId,
				node = null;
			if(show){
				node = (
					<Modal show={true} title={'提交要分析的文章'} dismiss={this.closeSubmit2Modal} confirm={this.submit2Confirm}>
						<form id="submit2Form">
							<label htmlFor="submit2_desc">说明</label>
							<textarea id="submit2_desc" rows="10" name="desc"></textarea>
							<input type="hidden" name="title" value={this.state.data[submit2DataId].title} />
							<input type="hidden" name="uuid" value={submit2DataId} />
							<div className="m-warn"></div>
						</form>
					</Modal>
				)
			}
			return node;
		},
		submit2ModalDidMount: function(){
			this.submit2ModalValidater = $('#submit2Form').validate({
				rules: {
					desc: {
						required: true
					}
				},
				messages: {
					desc: {
						required: "说明不能为空"
					}
				},
				errorPlacement: function(error, element) {
					error.appendTo($('#submit2Form .m-warn'))
				}
			});
		},
		submit2Confirm: function(){
			var form = $('#submit2Form').get(0);
			if(this.submit2ModalValidater.form()){
				var data = {
					article_title: form.title.value,
					spread_detail: form.desc.value,
					article_uuid: form.uuid.value
				}
				this.submit2ModalValidater = null;
				this.closeSubmit2Modal();
				// rest.article.create(data)
			}
		},
		closeSubmit2Modal: function(){
			this.setState({submit2ModalShow: false}, () => $('#submit2Form').remove());
		},
		renderSubmit: function(){
			var node = null;
			if(this.state.submitModalShow){
				var data = {
					submit_title: this.state.params.q
				}
				node = (
					<Modal show={true} title={'提交要分析的文章'} dismiss={this.closeSubmitModal} confirm={this.confirmSubmitModal}>
						<form id="submitForm">
							<label htmlFor="submit_title">文章标题</label>
							<input id="submit_title" type="text" name="title" defaultValue={data.submit_title} />
							<label htmlFor="submit_url">链接地址</label>
							<input id="submit_url" type="text" name="url" />
							<label htmlFor="submit_desc">说明</label>
							<textarea id="submit_desc" rows="4" name="desc"></textarea>
							<div className="m-warn"></div>
						</form>
					</Modal>
				)
			}

			return node
		},
		submitModalDidMount: function(){
			this.submitModalValidater = $('#submitForm').validate({
				rules: {
					title: {
						required: true
					},
					url: {
						required: true
					},
					desc: {
						required: true
					}
				},
				messages: {
					title: {
						required: "文章标题不能为空"
					},
					url: {
						required: "链接地址不能为空"
					},
					desc: {
						required: "说明不能为空"
					}
				},
				errorPlacement: function(error, element) {
					error.appendTo($('#submitForm .m-warn'))
				}
			});
		},
		closeSubmitModal: function(){
			this.setState({submitModalShow: false}, () => $('#submitForm').remove());
		},
		confirmSubmitModal: function(){
			var form = $('#submitForm').get(0);
			if(this.submitModalValidater.form()){
				var data = {
					article_title: form.title.value,
					article_url: form.url.value,
					spread_detail: form.desc.value
				};
				this.submitModalValidater = null;
				this.closeSubmitModal()
				// rest.article.create(data)
			}
		},
		renderPagin: function(){
			var node = null;
			var change = page => {
				let params = $.extend({}, this.state.params);
				params.begin = (page - 1) * params.limit;
				this.setState({params}, this.getData);
				this.refs.search.value = params.q;
			}
			var begin = this.state.params.begin,
				limit = this.state.params.limit;
			begin = begin >= 0 ? begin : 0;
			node = (
				<div className="pagin-part">
					<Pagination current={Math.floor(begin / limit) + 1} total={this.state.count} pageSize={10} onChange={change} />
				</div>
			)
			return node;
		},
		renderBlank: function(){
			var node = null, q = this.state.params.q;

			if(this.state.searchResultBlank && !this.state.searchError){
				node = (
					<section className="res-blank">
						<p>{'标题为“' + q + '”的文章未被收录，请提交分析。'}</p>
						<p>提交后系统将再次更新数据。</p>
						<div className="btn-wrap">
							<button className="c-button" onClick={() => this.setState({submitModalShow: true})}>提交分析</button>
						</div>
					</section>
				)
			}

			return node
		},
		renderSubmitSuccess: function(){
			var node = null;
			node = (
				<section className="res-blank">
					<p className="green">标题为“123”的文章正在收录中，请耐心等待。</p>
					<p className="green">如需加急服务，请致电管理员。</p>
				</section>
			)

			return null;
		},
		render: function(){
			return (
				<div className="advices-analy-spread fr-mid w1200 pb30">
					<h1 className="head">传播分析</h1>
					<section className="search-part">
						<div className="wrap">
							<div className="sch-wrap">
								<div className="sch-l">
									<div className="ico">
										<span className="iconfont icon-sousuo"></span>
									</div>
								</div>
								<input type="text" className="sch-input" ref='search' onKeyDown={e => e.keyCode == 13 && this.search(e)} />
								<div className="sch-r" onClick={this.search}>
									<span className="sch-btn">搜索</span>
								</div>
							</div>
						</div>
					</section>
					{this.renderListWrap()}
					{this.renderRes()}
					{this.renderBlank()}
					{this.renderSubmitSuccess()}
					{this.renderSubmit2()}
					{this.renderSubmit()}
				</div>
			)
		}
	})

	return Spread;
})