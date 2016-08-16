define([
	'mods',
	paths.rcn.util + '/rest.js',
	paths.ex.comps + '/artlist/select.js',
	paths.rcn.comps + '/modal/index.js',
	paths.rcn.comps + '/loader.js',
	paths.ex.util + '/parse.js'
], function(mods, Rest, Select, Modal, Load, Parse){
	const React = mods.ReactPack.default;
	const rest = Rest.ex();

	function parse(list, key){
		if (list.length == 0) return {};
		return list.reduce((obj, item, idx) => {
			item.__index = idx;
			obj[item[key]] = item;
			return obj
		}, {})
	}

	function format(list){
		return Object.keys(list).map(key => list[key]).sort((a, b) => a.__index - b.__index);
	}

	var reg = /\<[^<>]+\>|\<\/[^<>]\>/g;

	function parseTag(str){
		str = (str || '').replace(reg, '');
		return str;
	}

	function parseword(str, options){
		if(!str) return str;
		var reg = [];

		options.forEach(opt => {
			let k = opt.keys;
			if(typeof k == 'string'){
				if(k == '')
					return
			}
			reg = reg.concat(k);
		});

		reg = reg.map(re => '(' + re + ')').join('|');

		if(reg.length > 0){
			reg = new RegExp(reg, 'ig');

			str = str.replace(reg, match => {
				let className = [];
				options.forEach(opt => {
					let k = opt.keys;
					if(typeof k == 'string')
						k = [k];
					// if(k.indexOf(match) != -1){
					// 	if(opt.className)
					// 		className.push(opt.className);
					// }
					k.forEach(ke => {
						ke = new RegExp(ke, 'ig');
						if(ke.test(match)){
							if(opt.className)
								className.push(opt.className);
						}
					})
				})

				return `<em class="${className.join(' ')}">${match}</em>`;
			});
		}

		return str;
	}

	var Art = React.createClass({
		getInitialState: function(){
			return {
				evList: {},
				rpList: {},
				evSelected: [],
				rpSelected: [],
				art: {emotion: ''},
				dependModalShow: false,
				loadShow: false
			}
		},
		componentWillMount: function(){
			// var art = this.props.location.state.data;
			// if(art){
			// 	this.setState({art: art});
			// 	this.setState({evSelected: art.events || []});
			// 	this.setState({rpSelected: art.reports || []});
			// }
		},
		componentDidMount: function(){
			var uuid = this.props.location.query.uuid;
			if(uuid != undefined){
				rest.article.read('detail', {uuid}).done(data => {
					this.setState({art: data});
					this.setState({evSelected: data.events || []});
					this.setState({rpSelected: data.reports || []});
				});
				rest.events.read({
					status: 1
				}).done(data => {
					this.setState({evList: parse(data, 'id')});
				});
				rest.report.read('recent').done(data => {
					this.setState({rpList: parse(data, 'id')});
				});
			}
		},
		eventSelectHandler: function(event){
			var selected = this.state.evSelected.slice(),
				idx;
			for(var i = 0; i < selected.length; i++){
				if(selected[i].id == event.id){
					idx = i;
					break;
				}
			}
			if(idx == undefined){
				selected.push(event)
			} else {
				selected.splice(idx, 1);
			}

			this.setState({evSelected: selected}, () => {this.eventConfirmHandler()});
		},
		reportSelectHandler: function(report){
			var selected = this.state.rpSelected.slice(),
				idx;
			for(var i = 0; i < selected.length; i++){
				if(selected[i].id == report.id){
					idx = i;
					break;
				}
			}
			if(idx == undefined){
				selected.push(report)
			} else {
				selected.splice(idx, 1);
			}

			this.setState({rpSelected: selected}, () => {this.reportConfirmHandler()});
		},
		eventConfirmHandler: function(){
			var art = this.state.art;
			var old = this.state.art.events || [];
			var cur = this.state.evSelected;
			var add = cur.filter(ev => {
				let res = true;
				for(let i = 0; i < old.length; i++){
					if(old[i].id == ev.id){
						res = false;
						break;
					}
				}
				return res
			}).map(ev => ev.id);
			var remove = old.filter(ev => {
				let res = true;
				for(let i = 0; i < cur.length; i++){
					if(cur[i].id == ev.id){
						res = false;
						break;
					}
				}
				return res;
			}).map(ev => ev.id);

			if(add.length > 0){
				rest.article.update('events', {
					uuid: art.uuid,
					events: add,
					action: 'add',
					title_sign: art.title_sign
				}).done(data => {
					if(data.result == true){
						this.setState({art: Object.assign({}, art, {events: cur})});
					}
				})
			}
			if(remove.length > 0){
				rest.article.update('events', {
					uuid: art.uuid,
					events: remove,
					action: 'sub',
					title_sign: art.title_sign
				}).done(data => {
					if(data.result == true){
						this.setState({art: Object.assign({}, art, {events: cur})});
					}
				})
			}
		},
		reportConfirmHandler: function(){
			var art = this.state.art;
			var old = this.state.art.reports || [];
			var cur = this.state.rpSelected;
			var add = cur.filter(rp => {
				let res = true;
				for(let i = 0; i < old.length; i++){
					if(old[i].id == rp.id){
						res = false;
						break;
					}
				}
				return res
			}).map(rp => rp.id);
			var remove = old.filter(rp => {
				let res = true;
				for(let i = 0; i < cur.length; i++){
					if(cur[i].id == rp.id){
						res = false;
						break;
					}
				}
				return res;
			}).map(rp => rp.id);

			if(add.length > 0){
				rest.article.update('reports', {
					uuid: art.uuid,
					reports: add,
					action: 'add'
				}).done(data => {
					if(data.result == true){
						this.setState({art: Object.assign({}, art, {reports: cur})});
					}
				})
			}
			if(remove.length > 0){
				rest.article.update('reports', {
					uuid: art.uuid,
					reports: remove,
					action: 'sub'
				}).done(data => {
					if(data.result == true){
						this.setState({art: Object.assign({}, art, {reports: cur})});
					}
				})
			}
		},
		emotHandler: function(emot){
			var art = this.state.art;
			rest.articles.update('emotion', {
				uuids: [art.uuid],
				emotion: emot,
				title_sign: art.title_sign
			}).done(({result}) => {
				if(result){
					this.setState({art: Object.assign({}, art, {emotion: 'manual_' + emot})});
				}
			})
		},
		modifyWarn: function(){
			var art = this.state.art;
			var uuid = art.uuid;
			var isWarn = (art.warn != 'none' && art.warn != '' && art.warn);
			if(isWarn){
				rest.articles.update('nowarn', {
					uuids: [uuid]
				}).done(({result}) => {
					if(result){
						this.setState({art: Object.assign({}, art, {warn: 'none'})})
					}
				})
			} else {
				rest.articles.update('warn', {
					uuids: [uuid]
				}).done(({result}) => {
					if(result){
						this.setState({art: Object.assign({}, art, {warn: 'manual'})})
					}
				})
			}
		},
		renderEvents: function(){
			if(this.state.art.events)
				return this.state.art.events.map((ev, idx) => <span className="tag tag-event" key={idx} title={ev.title}>事件：{ev.title}</span>)
			return null;
		},
		renderReports: function(){
			if(this.state.art.reports)
				return this.state.art.reports.map((rp, idx) => <span className="tag tag-report" key={idx} title={rp.title}>日报：{rp.title_at + rp.title}</span>)
			return null;
		},
		hasEvent: function(id){
			var res = false;
			for(var i = 0; i < this.state.evSelected.length; i++){
				let ev = this.state.evSelected[i];
				if(ev.id == id){
					res = true;
					break
				}
			}
			return res
		},
		hasReport: function(id){
			var res = false;
			for(var i = 0; i < this.state.rpSelected.length; i++){
				let rp = this.state.rpSelected[i];
				if(rp.id == id){
					res = true;
					break
				}
			}
			return res
		},
		getContent: function(str){
			var search = this.props.location.query.search,
				tags = this.state.art.tags || [],
				keys = this.state.art.keys,
				opts = []

			if(search && search.length > 0){
				opts.push({
					keys: search,
					className: 'search'
				});
			} else {
				opts.push({
					keys: tags,
					className: 'search'
				})
			}

			if(keys){
				opts.push({
					keys,
					className: 'tag'
				})
			}

			return (str||'').replace(/([^<>]+)(?:(?=<\w+\s?.*>|<\/\w+>)|$)/g, function(s){
				return parseword(s, opts);
			})
		},
		getTitle: function(tit, con){
			var res = $.trim(parseTag(tit)),
				search = this.props.location.query.search,
				limit;
			if(!res.length){
				res = $.trim(parseTag(con));
				limit = true;
			}

			if(res.length > 25 && limit)
				res = res.substr(0, 25) + '...';

			if(search && search.length > 0){
				var reg = new RegExp(search, 'ig');
				res = res.replace(reg, function(key){
					return '<em>' + key + '</em>'
				})
			}

			return res;
		},
		dependModalTog: function(tog){
			this.setState({dependModalShow: tog});
		},
		removeDepend: function(){
			var uuids = [this.state.art.uuid];
			this.setState({loadShow: true})
			rest.articles.update('depend', {
				uuids
			}).done(data => {
				if(data.result){
					setTimeout(() => {
						window.history.go(-1);
					}, 1000)
				}
			})
		},
		render: function(){
			var art = this.state.art;
			var emtMap = {
				'positive': '正面',
				'negative': '负面',
				'neutral': '中立'
			}
			var isVir = (art.result_tags || []).indexOf('_virtual_') != -1, content = '';
			if(isVir)
				content = art.slug;
			else
				content = art.content;
			return (
				<div className="container advices-base-article-v2">
					<div className="title">
						<span dangerouslySetInnerHTML={{__html: this.getTitle(art.title || '', art.content || '')}} />
					</div>
					<div className="infos">
						<span className="info" title="来源">
							<span className="iconfont icon-lianjie icon" />
							<span className="txt">{((art.from || {}).platform_name && (art.from || {}).platform_name !='待定' && (art.from || {}).platform_name != '' ? (art.from || {}).platform_name + '：' : '') + (art.from || {}).media || ''}</span>
							&nbsp;
							<a href={art.url} target="_blank" className="intxt">(原文链接)</a>
						</span>
						<span className="info" title="日期">
							<span className="iconfont icon-iconfont74 icon" />
							<span className="txt">{(art.publish_at || '').replace(/\:\d+$/, '')}</span>
						</span>
						{
							art.tags instanceof Array && art.tags.length ? (
								<span className="info" title="关键词">
									<span className="iconfont icon-keywordslist icon" />
									<span className="kw">{(art.tags || []).slice().join('、')}</span>
								</span>
							) : null
						}
						{
							art.keys instanceof Array && art.keys.length ? <span className="info" title="自动标签"><span className="iconfont icon-biaoqian icon" /><span className="tag">{art.keys.slice().join('，')}</span></span> : null
						}
					</div>
					<div className="opers">
						<div className="status">
						{
							(art['result_tags'] || '').indexOf('_virtual_') != -1 ? 
							(
								<span className="desc">本篇文章为北京时间 {Parse.time(art.crawler_at)} 的快照，文章内容正在补充中。</span>
							) : null
						}
						</div>
						<div className="buttons article-opers">
							<div className="oper">
								<span className={"iconfont" + (art.emotion.indexOf('positive') != -1 ? ' icon-xiaolian pos' : art.emotion.indexOf('negative') != -1 ? ' icon-bumanyi01 neg' : ' icon-wugan neu') + (art.emotion.indexOf('manual') != -1 ? ' manual' : '')} title="修改情感面"></span>
								<ul className="dropdown-list angle">
									<li className="dropdown-item" onClick={() => this.emotHandler('positive')}>正面</li>
									<li className="dropdown-item" onClick={() => this.emotHandler('neutral')}>中立</li>
									<li className="dropdown-item" onClick={() => this.emotHandler('negative')}>负面</li>
								</ul>
							</div>
							<div className="oper">
								<span className={"iconfont icon-wendang oper-event" + (this.state.evSelected.length > 0 ? ' active' : '')} title="添加事件"></span>
								<ul className="dropdown-list angle">
									{
										format(this.state.evList).map((ev, idx) => {
											return (
												<li className="dropdown-item tl" key={idx} onClick={() => this.eventSelectHandler(ev)} title={ev.title}>
													{<span className={'c-cb' + (this.hasEvent(ev.id) ? " active" : "")} />}
													<span className="vm">{ev.title}</span>
												</li>
											)
										})
									}
								</ul>
							</div>
							<div className="oper">
								<span className={"iconfont icon-jinjimoshi oper-warn" + ((art.warn != 'none' && art.warn != '' && art.warn) ? ' active' : '')} title="添加预警" onClick={this.modifyWarn}></span>
							</div>
						</div>
					</div>
					<div className="content" dangerouslySetInnerHTML={{__html: this.getContent(content || '')}} />
				</div>
			)
		}
	});

	return Art;
})