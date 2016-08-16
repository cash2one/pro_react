define(['mods'], function(mods){
	var React = mods.ReactPack.default;
	var Cal = mods.Cal;

	var Drop = React.createClass({
		getInitialState(){
			return {open: false}
		},
		clickHandler(){
			if(!this.state.open){
				this.setState({open: true});
				$(document).one('click', () => {
					this.setState({open: false});
				})
			}
		},
		render(){
			return (
				<div className={"while-item" + (this.state.open ? ' active' : '')} ref="wrap">
					<div className="holder" onClick={this.clickHandler}>
						<span>{this.props.holderTxt || ''}</span>
					</div>
					<ul className="dropdown-list">
						{this.props.children}
					</ul>
				</div>
			)
		}
	})

	var Dt = React.createClass({
		getInitialState(){
			return {begin: null, end: null}
		},
		componentDidUpdate(o){
			var {queryParams} = this.props;
			var res0 = this.parseDate(o.queryParams), res = this.parseDate(queryParams);
			if(res.begin != res0.begin || res.end != res0.end){
				this.setState(res);
			}
		},
		parseDate(queryParams){
			var date = queryParams.date, begin, end, res, reg = /^\d{4}\-\d{2}\-\d{2}$/;
			date = date.split(',');
			begin = $.trim(date[0]);
			end = date[1] ? $.trim(date[1]) : '';
			res = {
				begin: reg.test(begin) ? begin : null,
				end: reg.test(end) ? end : null
			}
			return res
		},
		setDate(val, key){
			this.setState({[key]: val}, () => {
				if(this.state.begin != null && this.state.end != null)
					this.ok(this.state.begin + ',' + this.state.end);
			});
		},
		disabledDate(val, key){
			var compare, val = new Date(val).getTime();
			if(key == 'begin'){
				compare = this.state.end;
			} else if(key == 'end') {
				compare = this.state.begin;
			}
			if(compare){
				compare = new Date(compare).getTime();
				return key == 'begin' ? val > compare : val < compare;
			} else {
				return false
			}
		},
		ok(value){
			if(this.props.ok)
				this.props.ok(value);
		},
		cancel(){
			if(this.props.ok){
				this.setState({begin: null, end: null})
				this.props.ok(this.props.defaultParams.date);
			}
		},
		render(){
			var date = this.state;
			return (
				<div className="while-item time">
					<Cal name="begin" value={this.state.begin} format={'yyyy-MM-dd'} onChange={value => this.setDate(value, 'begin')} disabledDate={val => this.disabledDate(val, 'begin')} wrapClassName='v2' />
					<span className="pl10 pr10">-</span>
					<Cal name="end" value={this.state.end} format={'yyyy-MM-dd'} onChange={value => this.setDate(value, 'end')} disabledDate={val => this.disabledDate(val, 'end')} wrapClassName='v2' />
					{
						date.begin != null || date.end != null ? <span className="button" onClick={this.cancel}>取消</span> : null
					}
				</div>
			)
		}
	})

	var While = React.createClass({
		toggleClick(key, value){
			if(this.props.toggleClick){
				this.props.toggleClick(key, value);
			}
		},
		renderEmotion(){
			const {queryParams, defaultParams} = this.props;
			var node, emotion = queryParams['emotion'], defaultEmotion = defaultParams['emotion'];
			if(emotion == defaultEmotion || emotion == 'positive' || emotion == 'negative' || emotion == 'neutral'){
				var txt = '';
				switch (emotion){
					case 'positive':
						txt = ': 正面';
						break;
					case 'negative':
						txt = ': 负面';
						break;
					case 'neutral':
						txt = ': 中立'
						break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={"情感筛选" + txt}>
						<li className="dropdown-item" onClick={() => emotion != 'positive' && this.toggleClick('emotion', 'positive')}>正面</li>
						<li className="dropdown-item" onClick={() => emotion != 'neutral' && this.toggleClick('emotion', 'neutral')}>中立</li>
						<li className="dropdown-item" onClick={() => emotion != 'negative' && this.toggleClick('emotion', 'negative')}>负面</li>
						{
							emotion == defaultEmotion ? null
							: (
								<li className="dropdown-item">
									<span className="button" onClick={() => emotion != defaultEmotion && this.toggleClick('emotion', defaultEmotion)}>取消</span>
								</li>
							)
						}
					</Drop>
				)
			}

			return node;
		},
		renderWarn(){
			const {queryParams, defaultParams} = this.props;
			var node, warn = queryParams['warn'], defaultWarn = defaultParams['warn'];
			if([defaultWarn, 'auto', 'manual', 'no'].indexOf(warn) != -1){
				var txt = '';
				switch(warn){
					case 'auto':
						txt = ': 自动预警';
						break;
					case 'manual':
						txt = ": 手动预警";
						break;
					case 'no':
						txt = this.props.type == 'warn' ? "" : ": 非预警";
					default:
						break;
				}
				node = (
					<Drop holderTxt={"预警状态" + txt}>
						<li className="dropdown-item" onClick={() => warn != 'auto' && this.toggleClick('warn', 'auto')}>自动预警</li>
						<li className="dropdown-item" onClick={() => warn != 'manual' && this.toggleClick('warn', 'manual')}>手动预警</li>
						{
							this.props.type == 'warn' ? null : <li className="dropdown-item" onClick={() => warn != 'no' && this.toggleClick('warn', 'no')}>非预警</li>
						}
						{
							warn == defaultWarn ? null
							: (
								<li className="dropdown-item">
									<span className="button" onClick={() => warn != defaultWarn && this.toggleClick('warn', defaultWarn)}>取消</span>
								</li>
							)
						}
					</Drop>
				)
			}
			return node;
		},
		renderLevel(){
			const {queryParams, defaultParams} = this.props;
			var node, level = queryParams['level'], defaultLevel = defaultParams['level'];
			if([defaultLevel, 'a', 'b', 'c', 'd'].indexOf(level) != -1){
				var txt = '';
				switch(level){
					case 'a':
						txt = ': 甲级';
						break;
					case 'b':
						txt = ': 乙级';
						break;
					case 'c':
						txt = ': 丙级';
						break;
					case 'd':
						txt = ': 丁级';
						break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={"媒体等级" + txt}>
						<li className="dropdown-item" onClick={() => level != 'a' && this.toggleClick('level', 'a')}>甲级</li>
						<li className="dropdown-item" onClick={() => level != 'b' && this.toggleClick('level', 'b')}>乙级</li>
						<li className="dropdown-item" onClick={() => level != 'c' && this.toggleClick('level', 'c')}>丙级</li>
						<li className="dropdown-item" onClick={() => level != 'd' && this.toggleClick('level', 'd')}>丁级</li>
						{
							level == defaultLevel ? null
							: (
								<li className="dropdown-item">
									<span className="button" onClick={() => level != defaultLevel && this.toggleClick('level', defaultLevel)}>取消</span>
								</li>
							)
						}
					</Drop>
				)
			}
			return node;
		},
		renderProduction(){
			const {queryParams, defaultParams} = this.props;
			var node, production = queryParams['production'], defaultProduction = defaultParams['production'];
			if([defaultProduction, 'ogc', 'ugc'].indexOf(production) != -1){
				var txt = '';
				switch(production){
					case 'ogc':
						txt = ': 职业媒体';
						break;
					case 'ugc':
						txt = ': 自媒体';
						break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={"生产方式" + txt}>
						<li className="dropdown-item" onClick={() => production != 'ogc' && this.toggleClick('production', 'ogc')}>职业媒体</li>
						<li className="dropdown-item" onClick={() => production != 'ugc' && this.toggleClick('production', 'ugc')}>自媒体</li>
						{
							production == defaultProduction ? null
							: (
								<li className="dropdown-item">
									<span className="button" onClick={() => production != defaultProduction && this.toggleClick('production', defaultProduction)}>取消</span>
								</li>
							)
						}
					</Drop>
				)
			}

			return node;
		},
		renderMedium(){
			const {queryParams, defaultParams} = this.props;
			var node, medium = queryParams['medium'], defaultMedium = defaultParams['medium'];
			if([defaultMedium, '纸媒', '广播', '电视', '网站', '移动app'].indexOf(medium) != -1){
				var txt = '';
				switch(medium){
					case '纸媒':
						txt = ': 纸媒';
						break;
					case '广播':
						txt = ': 广播';
						break;
					case '电视':
						txt = ': 电视';
						break;
					case '网站':
						txt = ': 网站';
						break;
					case '移动app':
						txt = ': 移动app';
						break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={"媒体分类" + txt}>
						<li className="dropdown-item" onClick={() => medium != '纸媒' && this.toggleClick('medium', '纸媒')}>纸媒</li>
						<li className="dropdown-item" onClick={() => medium != '广播' && this.toggleClick('medium', '广播')}>广播</li>
						<li className="dropdown-item" onClick={() => medium != '电视' && this.toggleClick('medium', '电视')}>电视</li>
						<li className="dropdown-item" onClick={() => medium != '网站' && this.toggleClick('medium', '网站')}>网站</li>
						<li className="dropdown-item" onClick={() => medium != '移动app' && this.toggleClick('medium', '移动app')}>移动app</li>
						{
							medium == defaultMedium ? null
							: (
								<li className="dropdown-item">
									<span className="button" onClick={() => medium != defaultMedium && this.toggleClick('medium', defaultMedium)}>取消</span>
								</li>
							)
						}
					</Drop>
				)
			}

			return node;
		},
		renderDate(){
			const {queryParams, defaultParams} = this.props;
			var node, date = queryParams['date'], defaultDate = defaultParams['date'];
			var txt = '';
			switch(date){
				case 'today':
					txt = ': 今天';
					break;
				case 'yesterday':
					txt = ': 昨天';
					break;
				case 'last_week':
					txt = ': 近一周';
					break;
				case 'last_month':
					txt = ': 近一个月';
					break;
				default:
					break;
			}
			node = (
				<Drop holderTxt={"时间选择" + txt}>
					<li className="dropdown-item" onClick={() => date != 'today' && this.toggleClick('date', 'today')}>今天</li>
					<li className="dropdown-item" onClick={() => date != 'yesterday' && this.toggleClick('date', 'yesterday')}>昨天</li>
					<li className="dropdown-item" onClick={() => date != 'last_week' && this.toggleClick('date', 'last_week')}>近一周</li>
					<li className="dropdown-item" onClick={() => date != 'last_month' && this.toggleClick('date', 'last_month')}>近一个月</li>
					{
						['today', 'yesterday', 'last_week', 'last_month'].indexOf(date) == -1 ? null
						: (
							<li className="dropdown-item">
								<span className="button" onClick={() => date != 'all' && this.toggleClick('date', 'all')}>取消</span>
							</li>
						)
					}
				</Drop>
			)

			return node;
		},
		render(){
			const {queryParams, defaultParams} = this.props;
			return (
				<div className="while-box">
					{this.renderEmotion()}
					{this.renderWarn()}
					{this.renderLevel()}
					{this.renderProduction()}
					{this.renderMedium()}
					{this.renderDate()}
					<Dt queryParams={queryParams} defaultParams={defaultParams} ok={value => this.toggleClick('date', value)} />
				</div>
			)
		}
	})

	return While;
})