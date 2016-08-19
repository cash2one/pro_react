define(['mods'], function(mods){
	var React = mods.ReactPack.default;

	var emotionMap = {
		'positive': {
			title: '正面',
			color: '#00a0e9'
		},
		'neutral': {
			title: '中立',
			color: '#de4f00'
		},
		'negative': {
			title: '负面',
			color: '#e60012'
		}
	}

	var reg = /\<[^<>]+\>|\<\/[^<>]\>|\<\!.*\>/g;

	function parse(str, num){
		num = num || 100;
		if(str.length > num)
			str = str.substr(0, num) + '...';
		return str;
	}

	function parseTag(str){
		str = (str || '').replace(reg, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return str;
	}

	var Item = React.createClass({
		getTitle: function(title, content){
			// if(title.length == 0)
			// 	title = parseTag(content);
			// title = parseTag(title);
			// return this.parseHighlight(title);
			// console.log(title)
			return title;
		},
		getContent: function(str){
			// str = parseTag(str);
			// return this.parseHighlight(parse(str,74));
			return str;
		},
		parseHighlight: function(str){
			var reg = this.props.queryParams.wd;
			if(reg.length > 0)
				reg = new RegExp(reg, 'gi');
			else
				reg = null;

			if(reg && str){
				str = str.replace(reg, str => `<em class="search">${str}</em>`);
			}
			return str
		},
		addWarn(){
			var uuid = this.props.data.uuid,
				warn = this.props.data.warn,
				isWarn = warn != 'none' && warn != '' && warn;
			if(isWarn){
				this.props.ignoreWarn && this.props.ignoreWarn(uuid);
			} else {
				this.props.addWarn && this.props.addWarn(uuid);
			}
		},
		ignoreWarn(){
			var uuid = this.props.data.uuid;
			if(this.props.ignoreWarn)
				this.props.ignoreWarn(uuid);
		},
		addReport(report){
			var uuid = this.props.data.uuid;
			if(this.props.addReport)
				this.props.addReport(uuid, report);
		},
		removeReport(reportId){
			var uuid = this.props.data.uuid;
			if(this.props.removeReport)
				this.props.removeReport(uuid, reportId);
		},
		addEvent(event){
			var uuid = this.props.data.uuid;
			if(this.props.addEvent)
				this.props.addEvent(uuid, event);
		},
		removeEvent(eventId){
			var uuid = this.props.data.uuid;
			if(this.props.removeEvent)
				this.props.removeEvent(uuid, eventId);
		},
		hasEvent(evId){
			var events = this.props.data.events, res = false;
			if(!events || events.length == 0) return res;
			for(var i = 0; i < events.length; i++){
				if(events[i].id == evId){
					res = true
					break;
				}
			}
			return res;
		},
		renderReports: function(){
			var reports = this.props.data.reports;
			if(!reports || reports.length == 0) return null;
			return reports.map((item, idx) => {
				return (
					<span className="tag tag-report" key={idx} title={item.title_at + item.title}>
						<span>{item.title_at + item.title}</span>
						<span className="cancel" onClick={() => this.removeReport(item.id)} />
					</span>
				)
			})
		},
		renderEvents: function(){
			var events = this.props.data.events;
			if(!events || events.length == 0) return null;
			return events.map((item, idx) => {
				return (
					<span className="tag tag-event" key={idx} title={item.title}>
						<span>{item.title}</span>
						<span className="cancel" onClick={() => this.removeEvent(item.id)} />
					</span>
				)
			})
		},
		renderWarn: function(){
			var warn = this.props.data.warn;
			if(warn != 'none' && warn != '' && warn)
				return <span className="tag tag-warn"><span>预警文章</span><span className="cancel" onClick={this.ignoreWarn} /></span>
		},
		renderOpers(){
			const {data, reportSelectData, eventSelectData, queryParams, auditMode, moreMode} = this.props;
			var node;
			if(auditMode){
				node = (
					<div className="opers article-opers">
						<div className="oper" onClick={() => this.props.modifyEmotion('positive')} >
							<span className={"iconfont icon-xiaolian pos" + (data.emotion == 'manual_positive' ? ' manual' : '')} title="正面"></span>
						</div>
						<div className="oper" onClick={() => this.props.modifyEmotion('neutral')} >
							<span className={"iconfont icon-wugan neu" + (data.emotion == 'manual_neutral' ? ' manual' : '')} title="中立"></span>
						</div>
						<div className="oper" onClick={() => this.props.modifyEmotion('negative')} >
							<span className={"iconfont icon-bumanyi01 neg" + (data.emotion == 'manual_negative' ? ' manual' : '')} title="负面"></span>
						</div>
					</div>
				)
			} else if(moreMode){
				node = (
					<div className="opers article-opers">
						<div className="oper" onClick={this.props.clickYichu}>
							<span className="iconfont icon-yichu2 oper-yichu"></span>
						</div>
					</div>
				)
			} else {
				node = (
					<div className="opers article-opers">
						<div className="oper">
							<span className={"iconfont" + (data.emotion.indexOf('positive') != -1 ? ' icon-xiaolian pos' : data.emotion.indexOf('negative') != -1 ? ' icon-bumanyi01 neg' : ' icon-wugan neu') + (data.emotion.indexOf('manual') != -1 ? ' manual' : '')} title="修改情感面"></span>
							<ul className="dropdown-list angle">
								<li className="dropdown-item" onClick={() => this.props.modifyEmotion('positive')}>正面</li>
								<li className="dropdown-item" onClick={() => this.props.modifyEmotion('neutral')}>中立</li>
								<li className="dropdown-item" onClick={() => this.props.modifyEmotion('negative')}>负面</li>
							</ul>
						</div>
						<div className="dn">
							<span className="iconfont icon-wendang oper-report" title="添加日报"></span>
							<ul className="dropdown-list angle tl">
								{
									reportSelectData.length > 0 ? reportSelectData.map((item, idx) => {
										return <li className="dropdown-item" key={idx} onClick={() => this.addReport(item)}>{item.title_at+item.title}</li>
									}) : <li className="dropdown-item blank">暂无日报</li>
								}
							</ul>
						</div>
						<div className="oper">
							<span className={"iconfont icon-wendang oper-event" + (data.events && data.events.length > 0 ? ' active' : '')} title="添加事件"></span>
							<ul className="dropdown-list angle tl">
								{
									eventSelectData.length > 0 ? eventSelectData.map((item, idx) => {
										if(this.hasEvent(item.id)){
											return (
												<li className="dropdown-item" key={idx} onClick={() => this.removeEvent(item.id)}>
													{<span className="c-cb active" />}
													<span className="vm">{item.title}</span>
												</li>
											)
										} else {
											return (
												<li className="dropdown-item" key={idx} onClick={() => this.addEvent(item)}>
													{<span className="c-cb" />}
													<span className="vm">{item.title}</span>
												</li>
											)
										}
									}) : <li className="dropdown-item blank">暂无事件</li>
								}
							</ul>
						</div>
						<div className="oper">
							<span className={"iconfont icon-jinjimoshi oper-warn" + (data.warn != 'none' && data.warn != '' && data.warn ? ' active' : '')} title="添加预警" onClick={this.addWarn}></span>
						</div>
					</div>
				)
			}
			return node
		},
		render(){
			const {data, reportSelectData, eventSelectData, queryParams, togMore, moreMode} = this.props;
			return (
				<li className={"art-list-item has-img"}>
					{
						(data['imgs'] && data['imgs'].length > 0) ? <div className="img" style={{'backgroundImage': 'url(' + data['imgs'][0] + ')'}} /> : <div className="img" style={{'backgroundImage': 'url(' + paths.rcn.img + '/art-img-blank.jpg)'}} />
					}
					<section className="content">
						<span className="oper-del iconfont icon-lajitong" onClick={() => this.props.putDepend(data.uuid)}></span>
						<div>
							<a href={paths.ex.base + '/base#/article?search=' + (queryParams.wd || '') + '&uuid=' + data.uuid} className="tit"  dangerouslySetInnerHTML={{__html: this.getTitle(data.title || '', data.content || '')}} title={parseTag(data.link_title)} />
							{
								data['result_tags'] && data['result_tags'].indexOf('_virtual_') != -1 ? <span className="vir">虚拟</span> : null
							}
						</div>
						<div className="ovh">
							<div className="autotags">
								{data.keys && data.keys instanceof Array ? data.keys.join(' ') : ''}
							</div>
							<a className="desc" href={paths.ex.base + '/base#/article?search=' + queryParams.wd + '&uuid=' + data.uuid}>
								<p dangerouslySetInnerHTML={{__html: this.getContent(data.content || '')}} />
							</a>
						</div>
						<div className="dn">
							{this.renderEvents()}
							{this.renderReports()}
							{this.renderWarn()}
						</div>
						<div className="cf mt5 pr mb-2">
							<div className="infos">
								<span className="info">{(data.publish_at || '').replace(/\:\d+$/, '')}</span>
								<span className="info">{(data.from.platform_name && data.from.platform_name != '待定' && data.from.platform_name != '' ? data.from.platform_name + '：' : '') + data.from.media}</span>
								{
									data.similar_count == 1 || moreMode ? null : (
										<span className={"info" + (togMore ? ' link' : '')} onClick={() => togMore && togMore(data.title_sign, queryParams)}>{'相同文章：' + +data.similar_count + '篇'}</span>
									)
								}
							</div>	
							{this.renderOpers()}
						</div>
					</section>
				</li>
			)
		}
	})

	return Item;
})