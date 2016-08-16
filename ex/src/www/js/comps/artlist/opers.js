define([
	'mods',
	paths.ex.comps + '/artlist/select.js'
], function(mods, Select){
	var React = mods.ReactPack.default;

	var Opers = React.createClass({
		getInitialState: function(){
			return {
				fixed: false
			}
		},
		componentDidMount: function(){
			document.querySelector('.frame-body-right').addEventListener('scroll', this.scrollHandler)
		},
		scrollHandler: function(){
			var tar = $(this.refs.main);
			if(tar.offset().top > 60)
				this.setState({fixed: false})
			else
				this.setState({fixed: true})
		},
		componentWillUnmount: function(){
			document.querySelector('.frame-body-right').removeEventListener('scroll', this.scrollHandler)
		},
		uniHandler: function(sele){
			if(this.props.onUniqueClick && this.props.unique != sele)
				this.props.onUniqueClick(sele);
		},
		renderUnique: function(){
			if(this.props.unique == undefined)
				return null;
			else{
				return (
					<div className="oper-uni">
						<div className={"item" + (this.props.unique == 'true' ? ' active' : '')} onClick={() => this.uniHandler('true')}>
							<span>排重</span>
						</div>
						<div className={"item" + (this.props.unique == 'false' ? ' active' : '')} onClick={() => this.uniHandler('false')}>
							<span>不排重</span>
						</div>
					</div>
				)
			}
		},
		emotHandler: function(emot){
			if(this.props.emotion != emot && this.props.onEmotionClick){
				this.props.onEmotionClick(emot)
			}
		},
		renderEmot: function(){
			if(this.props.emotion == undefined)
				return null;
			else{
				return (
					<div className="oper-emot">
						<div className={"item" + (this.props.emotion == 'all' ? ' active' : '')} onClick={() => this.emotHandler('all')}>
							<span>全部</span>
						</div>
						<div className={"item" + (this.props.emotion == 'positive' ? ' active' : '')} onClick={() => this.emotHandler('positive')}>
							<span>正面</span>
						</div>
						<div className={"item" + (this.props.emotion == 'neutral' ? ' active' : '')} onClick={() => this.emotHandler('neutral')}>
							<span>中立</span>
						</div>
						<div className={"item" + (this.props.emotion == 'negative' ? ' active' : '')} onClick={() => this.emotHandler('negative')}>
							<span>负面</span>
						</div>
					</div>
				)
			}
		},
		reportHandler: function(title){
			this.props.putReport && this.props.putReport(title);
		},
		renderReportSelect: function(){
			if(this.props.reports != undefined){
				return (
					<div className="item">
						<Select placeholder="加入日报">
							{
								this.props.reports.map((item, idx) => <li key={idx} onClick={() => this.reportHandler(item)}><span title={item.title_at+item.title}>{item.title_at+item.title}</span></li>)
							}
						</Select>
					</div>
				)
			}
		},
		eventHandler: function(event){
			this.props.putEvent && this.props.putEvent(event);
		},
		renderEventSelect: function(){
			if(this.props.events != undefined){
				return (
					<div className="item">
						<Select placeholder="加入事件">
							{
								this.props.events.map((item, idx) => <li key={idx} onClick={() => this.eventHandler(item)}><span title={item.title}>{item.title}</span></li>)
							}
						</Select>
					</div>
				)
			}
		},
		addEmotionHandler: function(emot){
			this.props.putEmotion && this.props.putEmotion(emot);
		},
		putDependHandler: function(){
			this.props.putDepend && this.props.putDepend();
		},
		renderEmotionSelect: function(){
			return (
				<div className="item">
					<Select placeholder="研判为">
						<li onClick={() => this.addEmotionHandler('positive')}>
							<span>正面</span>
						</li>
						<li onClick={() => this.addEmotionHandler('neutral')}>
							<span>中立</span>
						</li>
						<li onClick={() => this.addEmotionHandler('negative')}>
							<span>负面</span>
						</li>
						{	
							this.props.putDepend ? 
							(<li onClick={this.putDependHandler}>
								<span>与我无关</span>
							</li>) : null
						}
					</Select>
				</div>
			)
		},
		warnClickHandler: function(){
			this.props.putWarn && this.props.putWarn();
		},
		renderWarn: function(){
			if(this.props.warn){
				return (
					<div className="item warn" onClick={this.warnClickHandler}>
						<span>{this.props.warn}</span>
					</div>
				)
			}
		},
		renderPage: function(){
			var cur = this.props.curPage,
				pageSize = this.props.pageSize || 20,
				total = Math.ceil(this.props.total / pageSize);

			var onPrev = () => {
				if(cur > 1)
					this.props.onPageChange && this.props.onPageChange(cur - 1);
			}
			var onNext = () => {
				if(cur < total){
					this.props.onPageChange && this.props.onPageChange(cur + 1);
				}
			}

			if(this.props.pagin == 'true' && total > 0){
				return (
					<div className="pagin">
						<div className={"prev" + (cur <= 1 ? ' disable' : '')} onClick={onPrev}></div>
						<div className="page">
							<span className="cur">{cur}</span>
							<span className="total">／{total}</span>
						</div>
						<div className={"next" + (cur >= total ? ' disable' : '')} onClick={onNext}></div>
					</div>
				)
			}
		},
		render: function(){
			return (
				<div className="operc-wrap" ref="main">
					<div className={"operc" + (this.state.fixed ? ' fixed' : '')}>
						{this.renderUnique()}
						{this.renderEmot()}
						<div className="oper-selc">
							{this.renderEventSelect()}
							{this.renderReportSelect()}
							{this.renderEmotionSelect()}
							{this.renderWarn()}
							{this.renderPage()}
						</div>
					</div>	
				</div>
			)
		}
	});

	return Opers
})