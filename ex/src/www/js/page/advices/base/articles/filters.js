define(['mods'], function(mods){
	var React = mods.ReactPack.default;

	var params = {
		'cat': {
			name: '行业主题',
			name_key: 'cat',
			dataKey: 'industry',
			filter_key: 'name'
		},
		'product': {
			name: '产品分类',
			name_key: 'product',
			dataKey: 'product_form',
			filter_key: 'name'
		},
		'platform': {
			name: '托管平台',
			name_key: 'platform',
			dataKey: 'platform',
			filter_key: 'name'
		},
		'med': {
			name: '媒体名称',
			name_key: 'med',
			dataKey: 'media',
			filter_key: 'mid'
		},
		'inc': {
			name: '事件名称',
			name_key: 'inc',
			dataKey: 'event',
			filter_key: 'id'
		},
		'emotion': {
			name: '情感筛选',
			name_key: 'emotion',
			dataKey: 'emotion',
			filter_key: 'param'
		},
		'warn': {
			name: '预警状态',
			name_key: 'warn',
			dataKey: 'warn',
			filter_key: 'param'
		},
		'production': {
			name: '生产方式',
			name_key: 'production',
			dataKey: 'production',
			filter_key: 'param'
		},
		'medium': {
			name: '媒体分类',
			name_key: 'medium',
			dataKey: 'medium',
			filter_key: 'name'
		},
		'level': {
			name: '媒体等级',
			name_key: 'level',
			dataKey: 'level',
			filter_key: 'param'
		}
	}

	var FiltersItem = React.createClass({
		getInitialState(){
			return {
				more: false
			}
		},
		componentDidUpdate(){
			if(this.refs.main.offsetHeight > 90 && !this.state.more)
				this.setState({more: true})
			else if(this.refs.main.offsetHeight <= 90 && this.state.more)
				this.setState({more: false})
		},
		render(){
			//name, name_key, data, filter_key
			const {mutiKey, moreKey, filtersSelected, opts} = this.props;
			var isMuti = mutiKey == opts.name_key;
			return (
				<div className={"filter-box-item" + (mutiKey == opts.name_key ? ' muti-select' : moreKey == opts.name_key ? ' more' : '')}>
					<div className="spec">
						<span>{opts.name}</span>
					</div>
					<div className="opers">
						{opts.data.length > 1 ? <div className="oper oper-muti-select" onClick={() => this.props.mutiClick(opts.name_key)}></div> : null}
						{this.state.more ? <div className="oper oper-more" onClick={() => this.props.moreClick(opts.name_key)}></div> : null}
					</div>
					<div className="filters">
						<div className="filters-wrap" ref="main">
							{
								opts.data.map((item, idx) => {
									let checked = filtersSelected.indexOf(item[opts.filter_key]) != -1;
									if(isMuti){
										return (
											<div className={"item" + (checked ? ' checked' : '')} key={idx} onClick={() => {
												checked ? this.props.deleteSelected(item[opts.filter_key]) : this.props.addSelected(item[opts.filter_key])
											}}>
												<span className="txt">{item.name}</span>
												<span className="cb" />
											</div>
										)
									} else {
										return (
											<div className="item" key={idx} onClick={() => this.props.chooseFilters(opts.name_key, item[opts.filter_key])}>
												<span className="txt">{item.name}</span>
												<span className="cb" />
											</div>
										)
									}
								})
							}
						</div>
						<div className="buttons">
							<span className="button" onClick={this.props.cancelClick}>取消</span>
							<span className="button confirm" onClick={() => this.props.confirmClick(opts.name_key)}>确认</span>
						</div>
					</div>
				</div>
			)
		}
	})

	var Filters = React.createClass({
		componentDidMount(){
			var p = $(this.refs.main),
				t = p.parents('.filter-part');
			p.on('scroll', function(e){
				if($(this).scrollTop() > 0)
					t.addClass('scroll');
				else
					t.removeClass('scroll');
			})
		},
		componentWillUnmount(){
			$(this.refs.main).parents('.list-part').off('scroll');
		},
		mutiClick(key){
			if(this.props.mutiClick)
				this.props.mutiClick(key);
			if(this.props.moreClick)
				this.props.moreClick(key);
			this.clearSelected();
		},
		moreClick(key){
			const {moreKey} = this.props;
			if(this.props.mutiClick)
				this.props.mutiClick('');

			if(moreKey == key){
				if(this.props.moreClick)
					this.props.moreClick('')
			} else {
				if(this.props.moreClick)
					this.props.moreClick(key)
			}
			this.clearSelected();
		},
		confirmClick(key){
			var choose = this.props.filtersSelected;
			if(choose.length)
				this.chooseFilters(key, choose.join(','));
			this.mutiClick('')
			this.moreClick('')
		},
		cancelClick(){
			this.mutiClick('')
			this.moreClick('')
		},
		addSelected(value){
			if(this.props.addSelected)
				this.props.addSelected(value);
		},
		deleteSelected(value){
			if(this.props.deleteSelected)
				this.props.deleteSelected(value);
		},
		clearSelected(){
			if(this.props.clearSelected)
				this.props.clearSelected();
		},
		chooseFilters(key, value){
			if(this.props.chooseFilters)
				this.props.chooseFilters(key, value)
		},
		renderItems(name, name_key, data, filter_key){
			const {mutiKey, moreKey, filtersSelected} = this.props;
			var isMuti = mutiKey == name_key;
			return (
				<div className={"filter-box-item" + (mutiKey == name_key ? ' muti-select' : moreKey == name_key ? ' more' : '')}>
					<div className="spec">
						<span>{name}</span>
					</div>
					<div className="opers">
						<div className="oper oper-muti-select" onClick={() => this.mutiClick(name_key)}></div>
						<div className="oper oper-more" onClick={() => this.moreClick(name_key)}></div>
					</div>
					<div className="filters">
						<div className="filters-wrap">
							{
								data.map((item, idx) => {
									let checked = filtersSelected.indexOf(item[filter_key]) != -1;
									if(isMuti){
										return (
											<div className={"item" + (checked ? ' checked' : '')} key={idx} onClick={() => {
												checked ? this.deleteSelected(item[filter_key]) : this.addSelected(item[filter_key])
											}}>
												<span className="txt">{item.name}</span>
												<span className="cb" />
											</div>
										)
									} else {
										return (
											<div className="item" key={idx} onClick={() => this.chooseFilters(name_key, item[filter_key])}>
												<span className="txt">{item.name}</span>
												<span className="cb" />
											</div>
										)
									}
								})
							}
						</div>
						<div className="buttons">
							<span className="button" onClick={this.cancelClick}>取消</span>
							<span className="button confirm" onClick={() => this.confirmClick(name_key)}>确认</span>
						</div>
					</div>
				</div>
			)
		},
		renderHangye(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['cat']).length == 0 || $.trim(paramsMirror['cat']) == defaultParams['cat'];
			if(data.industry && data.industry.length && pass){
				// node = this.renderItems('行业主题', 'cat', data.industry, 'name');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '行业主题',
								name_key: 'cat',
								data: data.industry,
								filter_key: 'name'
							}} />
			}
			return node;
		},
		renderChanPin(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['product']).length == 0 || $.trim(paramsMirror['product']) == defaultParams['product'];
			if(data.product_form && data.product_form.length && pass){
				// node = this.renderItems('产品分类', 'product', data.product_form, 'name');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '产品分类',
								name_key: 'product',
								data: data.product_form,
								filter_key: 'name'
							}} />
			}
			return node;
		},
		renderTuoGuan(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['platform']).length == 0 || $.trim(paramsMirror['platform']) == defaultParams['platform'];
			if(data.platform && data.platform.length && pass){
				// node = this.renderItems('托管平台', 'platform', data.platform, 'uuid');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '托管平台',
								name_key: 'platform',
								data: data.platform,
								filter_key: 'name'
							}} />
			}
			return node;
		},
		renderMeiTi(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['med']).length == 0 || $.trim(paramsMirror['med']) == defaultParams['med'];
			if(data.media && data.media.length && pass){
				// node = this.renderItems('媒体名称', 'med', data.media, 'mid')
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '媒体名称',
								name_key: 'med',
								data: data.media,
								filter_key: 'mid'
							}} />
			}
			return node;
		},
		renderShiJian(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['inc']).length == 0 || $.trim(paramsMirror['inc']) == defaultParams['inc'];
			if(data.event && data.event.length && pass){
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '事件名称',
								name_key: 'inc',
								data: data.event,
								filter_key: 'id'
							}} />
			}
			return node;
		},
		renderQinggan(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['emotion']).length == 0 || $.trim(paramsMirror['emotion']) == defaultParams['emotion'];
			if(data.emotion && data.emotion.length && pass){
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '情感筛选',
								name_key: 'emotion',
								data: data.emotion,
								filter_key: 'param'
							}} />
			}
			return node;
		},
		renderYujin(){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror['warn']).length == 0 || $.trim(paramsMirror['warn']) == defaultParams['warn'];
			if(data.warn && data.warn.length && pass){
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: '预警状态',
								name_key: 'warn',
								data: data.warn,
								filter_key: 'param'
							}} />
			}
			return node;
		},
		render2(opt){
			var {data, paramsMirror, defaultParams} = this.props,
				node,
				pass = $.trim(paramsMirror[opt['name_key']]).length == 0 || $.trim(paramsMirror[opt['name_key']]) == defaultParams[opt['name_key']];
			if(data[opt['dataKey']] && data[opt['dataKey']].length && pass){
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = <FiltersItem
							mutiKey={this.props.mutiKey}
							moreKey={this.props.moreKey}
							filtersSelected={this.props.filtersSelected}
							mutiClick={name => this.mutiClick(name)}
							moreClick={name => this.moreClick(name)}
							deleteSelected={name => this.deleteSelected(name)}
							addSelected={name => this.addSelected(name)}
							chooseFilters={(key, name) => this.chooseFilters(key, name)}
							cancelClick={this.cancelClick}
							confirmClick={(name) => this.confirmClick(name)}
							opts={{
								name: opt.name,
								name_key: opt.name_key,
								data: data[opt['dataKey']],
								filter_key: opt.filter_key
							}} />
			}
			return node;
		},
		render(){
			var {data, paramsMirror, defaultParams} = this.props;
			return (
				<div className="bd" ref="main">
					<div className="filter-box">
						{
							Object.keys(params).map(p => {
								let param = params[p];
								return this.render2(param);
							})
						}
					</div>
				</div>
			)
		}
	})

	return Filters;
})