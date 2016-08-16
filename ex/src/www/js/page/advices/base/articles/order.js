define(['mods'], function(mods){
	var React = mods.ReactPack.default;

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
				<div className={"order-item" + (this.state.open ? ' active' : '') + this.props.className || ''} ref="wrap">
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

	var Order = React.createClass({
		toggleClick(key, value){
			if(this.props.toggleClick)
				this.props.toggleClick(key, value);
		},
		renderOrderTime(){
			const {queryParams, defaultParams} = this.props;
			var node, sort = queryParams['sort'], defaultSort = defaultParams['sort'];
			// if([defaultSort, 'publish_at_desc', 'publish_at_asc', 'reship_desc', 'reship_asc', 'reship_exactly_desc', 'reship_exactly_asc', 'level_desc', 'level_asc', 'medium_desc', 'medium_asc', 'warn_desc', 'warn_asc', 'heat_desc', 'heat_asc'].indexOf(sort) != -1){
				var txt = '时间排序';
				switch (sort){
					case 'publish_at_desc':
						txt = '发布时间降序';
						break;
					case 'publish_at_asc':
						txt = '发布时间升序';
						break;
					// case 'reship_desc':
					// 	txt = ': 文章转载数降序';
					// 	break;
					// case 'reship_asc':
					// 	txt = ': 文章转载数升序';
					// 	break;
					// case 'reship_exactly_desc':
					// 	txt = ': 文章显性转载数降序';
					// 	break;
					// case 'reship_exactly_asc':
					// 	txt = ': 文章显性转载数升序';
					// 	break;
					// case 'level_desc':
					// 	txt = ': 媒体等级降序';
					// 	break;
					// case 'level_asc':
					// 	txt = ': 媒体等级升序';
					// 	break;
					// case 'medium_desc':
					// 	txt = ': 媒体名称降序';
					// 	break;
					// case 'medium_asc':
					// 	txt = ': 媒体名称升序';
					// 	break;
					// case 'warn_desc':
					// 	txt = ': 预警状态降序';
					// 	break;
					// case 'warn_asc':
					// 	txt = ': 预警状态升序';
					// 	break;
					// case 'heat_desc':
					// 	txt = ': 文章热度降序';
					// 	break;
					// case 'heat_asc':
					// 	txt = ': 文章热度升序';
					// 	break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={txt} className={sort == 'publish_at_desc' || sort == 'publish_at_asc' ? ' selected' : ''}>
						<li className="dropdown-item" onClick={() => sort != 'publish_at_desc' && this.toggleClick('sort', 'publish_at_desc')}>发布时间降序</li>
						<li className="dropdown-item" onClick={() => sort != 'publish_at_asc' && this.toggleClick('sort', 'publish_at_asc')}>发布时间升序</li>
						{
							sort == 'publish_at_asc' || sort == 'publish_at_desc' ? (
								<li className="dropdown-item">
									<span className="button" onClick={() => this.toggleClick('sort', '')}>取消</span>
								</li>
							) : null
						}
					</Drop>
				)
			// }

			return node;
		},
		renderOrderHeat(){
			const {queryParams, defaultParams} = this.props;
			var node, heat = queryParams['sort'], defaultSort = defaultParams['sort'];
			// if([defaultSort, 'heat_desc', 'heat_asc', 'reship_desc', 'reship_asc', 'reship_exactly_desc', 'reship_exactly_asc', 'level_desc', 'level_asc', 'medium_desc', 'medium_asc', 'warn_desc', 'warn_asc', 'heat_desc', 'heat_asc'].indexOf(heat) != -1){
				var txt = '热度排序';
				switch (heat){
					case 'heat_desc':
						txt = '文章热度降序';
						break;
					case 'heat_asc':
						txt = '文章热度升序';
						break;
					default:
						break;
				}
				node = (
					<Drop holderTxt={txt} className={heat == 'heat_desc' || heat == 'heat_asc' ? ' selected' : ''}>
						<li className="dropdown-item" onClick={() => heat != 'heat_desc' && this.toggleClick('sort', 'heat_desc')}>文章热度降序</li>
						<li className="dropdown-item" onClick={() => heat != 'heat_asc' && this.toggleClick('sort', 'heat_asc')}>文章热度升序</li>
					</Drop>
				)
			// }

			return node;
		},
		render(){
			return (
				<div className="order-box">
					{this.renderOrderTime()}
				</div>
			)
		}
	})

	return Order
})