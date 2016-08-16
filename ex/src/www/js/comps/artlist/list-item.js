define([
	'mods'
], function(mods){
	const React = mods.ReactPack.default;
	const Link = mods.RouterPack.Link;

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

	var ListItem = React.createClass({
		componentWillMount: function(){
		},
		renderEvents: function(){
			var events = this.props.data.events;
			if(!events) return null;
			return events.map((item, idx) => {
				return <span className="tag-ev" key={idx} title={item.title}>{item.title}</span>
			})
		},
		renderReports: function(){
			var reports = this.props.data.reports;
			if(!reports) return null;
			return reports.map((item, idx) => <span className="tag-rp" key={idx} title={item.title_at + item.title}>{item.title_at + item.title}</span>)
		},
		renderEmotion: function(){
			var emotion = this.props.data.emotion;
			return <span style={{color: emotionMap[emotion] ? emotionMap[emotion].color : ''}}>{emotionMap[emotion] ? emotionMap[emotion].title : ''}</span>
		},
		renderWarn: function(){
			var warn = this.props.data.warn;
			if(warn != 'none' && warn != '' && warn)
				return <span className="tag-warn">预警文章</span>
		},
		changeHandler: function(){
			this.props.onSelect && this.props.onSelect(this.props.data.uuid);
		},
		emotionChangeHandler: function(emot){
			this.props.onEmotionChange && this.props.onEmotionChange(this.props.data.uuid, emot);
		},
		ignoreWarn: function(){
			this.props.ignoreWarn && this.props.ignoreWarn(this.props.data.uuid);
		},
		parseHighlight: function(str){
			var reg = this.props.highlight;
			if(reg.length > 0)
				reg = new RegExp(reg, 'gi');
			else
				reg = null;

			if(reg && str){
				str = str.replace(reg, str => `<em class="search">${str}</em>`);
			}
			return str
		},
		getTitle: function(title, content){
			if(title.length == 0)
				title = parseTag(content);
			title = parseTag(title);

			return this.parseHighlight(parse(title, 25));
		},
		parseword: function(str){
			var hl = this.props.highlight,
				keys = this.props.data.keys || [],
				reg = [];
			if(hl){
				reg.push('(' + hl + ')');
			}
			if(keys){
				reg = reg.concat(keys.map(k => '(' + k + ')'));
			}
			reg = reg.join('|');

			if(str && reg.length > 0){
				reg = new RegExp(reg, 'gi');
				str = str.replace(reg, str => {
					let isHl = str == hl,
						isKeys = keys.indexOf(str) != -1;
					if(isHl && !isKeys){
						return `<em class="search">${str}</em>`
					} else if(!isHl && isKeys){
						return `<em class="tag">${str}</em>`
					} else if(isHl && isKeys){
						return `<em class="search tag">${str}</em>`
					} else {
						return str;
					}
				})
			}

			return str;
		},
		getContent: function(str){
			str = parseTag(str);
			return this.parseHighlight(parse(str));
		},
		render: function(){
			const data = this.props.data;
			return (
				<div className="art-item">
					<div className="opers">
						<div className="emots">
							<span className={"item" + (data.emotion == 'positive' ? ' active' : '')} onClick={() => this.emotionChangeHandler('positive')}>正</span>
							<span className={"item" + (data.emotion == 'neutral' ? ' active' : '')} onClick={() => this.emotionChangeHandler('neutral')}>中</span>
							<span className={"item" + (data.emotion == 'negative' ? ' active' : '')} onClick={() => this.emotionChangeHandler('negative')}>负</span>
						</div>
						{
							data.warn && data.warn != 'none' && data.warn != '' ? (<div className="ign" onClick={() => this.ignoreWarn()}>
									<span>忽略</span>
								</div>) : null
						}
					</div>
					<div className="top">
						<div className="t-l">
							<input type="checkbox" id={data.uuid} checked={this.props.selected} onChange={this.changeHandler} />
						</div>
						<div className="ovh pr15">
							<div>
								<a href={paths.ex.base + '/base#/article?search=' + this.props.highlight + '&uuid=' + data.uuid} className="link"  dangerouslySetInnerHTML={{__html: this.getTitle(data.title || '', data.content || '')}} />
							</div>
							<div className="desc">
								<label htmlFor={data.uuid} dangerouslySetInnerHTML={{__html: this.getContent(data.content || '')}} />
							</div>
						</div>
					</div>
					<div className="tags">
						{this.renderWarn()}
						{this.renderEvents()}
						{this.renderReports()}
					</div>
					<div className="ft">
						<span className="mr20">
							<span>来源：</span>
							<span>{data.from.media}</span>
						</span>
						<span className="mr20">
							<span>相似文章：</span>
							<span>{data.similar_articles || 0}篇</span>
						</span>
						<span className="mr20">
							<span>文章类型：</span>
							{this.renderEmotion()}
						</span>
						<span className="mr20">
							<span>时间：</span>
							<span>{data.crawler_at || ''}</span>	
						</span>
						{
							data.keys && data.keys instanceof Array ? (
								<span className="mr20">
									<span>自动标签：</span>
									<span className="autotag">{data.keys.join(' ')}</span>
								</span>
							) : null
						}
					</div>
				</div>
			)
		}
	});

	return ListItem
})