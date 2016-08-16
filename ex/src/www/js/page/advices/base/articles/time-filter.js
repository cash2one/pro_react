define(['mods', paths.ex.page + '/advices/base/report/select.js'], function(mods, Select){
	var React = mods.ReactPack.default,
		RangeCal = mods.RangeCal;
	var TimeFilter = React.createClass({
		toggleClick(key, value){
			if(this.props.toggleClick)
				this.props.toggleClick(key, value);
		},
		renderOrder(){
			const {queryParams, defaultParams} = this.props;
			var node, sort = queryParams['sort'], defaultSort = defaultParams['sort'];
				var txt = '时间排序';
				switch (sort){
					case 'publish_at_desc':
						txt = '发布时间降序';
						break;
					case 'publish_at_asc':
						txt = '发布时间升序';
						break;
					default:
						break;
				}
				node = (
					<Select className="dropwrap" holder={<span className="holder">{txt}</span>}>
						<li className="dropdown-item" onClick={() => sort != 'publish_at_desc' && this.toggleClick('sort', 'publish_at_desc')}>发布时间降序</li>
						<li className="dropdown-item" onClick={() => sort != 'publish_at_asc' && this.toggleClick('sort', 'publish_at_asc')}>发布时间升序</li>
						{
							sort == 'publish_at_asc' || sort == 'publish_at_desc' ? (
								<li className="dropdown-item">
									<span className="button" onClick={() => this.toggleClick('sort', '')}>取消</span>
								</li>
							) : null
						}
					</Select>
				)

			return node;
		},
		renderOrder2(){
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
				<Select className="dropwrap" holder={<span className="holder">{'时间选择' + txt}</span>}>
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
				</Select>
			)

			return node;
		},
		renderCal(){
			const {queryParams, defaultParams} = this.props;
			var date = this.parseDate(),
				handler = val => {
					if(val[0] != '' && val[1] != ''){
						let nowDate = queryParams.date.split(',');
						if(val[0] != nowDate[0] || val[1] != nowDate[1])
							this.toggleClick('date', val.join(','))
					}
					else{
						if(queryParams.date != defaultParams.date)
							this.toggleClick('date', defaultParams['date']);
					}
				}
			var node = <RangeCal className="input" placeholder="选择日期区间" format="yyyy-MM-dd" value={[date.begin, date.end]} onChange={handler} />

			return node
		},
		parseDate(){
			var date = this.props.queryParams.date, begin, end, res, reg = /^\d{4}\-\d{2}\-\d{2}$/;
			date = date.split(',');
			begin = $.trim(date[0]);
			end = date[1] ? $.trim(date[1]) : '';
			res = {
				begin: reg.test(begin) ? begin : null,
				end: reg.test(end) ? end : null
			}
			return res
		},
		render(){
			return (
				<section className="time-filter-part">
					<div className="order">
						{this.renderOrder()}
					</div>
					<div className="time-range">
						{this.renderOrder2()}
						<div className="calendar">
							<div className="wrapper">
								<span className="iconfont icon-lishijilu"></span>
								{this.renderCal()}
							</div>
						</div>
					</div>
				</section>
			)
		}
	})

	return TimeFilter
})