define(['mods', paths.ex.page + '/advices/base/articles/art-list-item.js'], function(mods, Item){
	var React = mods.ReactPack.default;

	var List = React.createClass({
		componentDidMount(){
			var p = $(this.refs.main).parents('.list-part'),
				t = $('.advices-base2 .main-part');
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
		render(){
			const {data, reportSelectData, eventSelectData, queryParams, modifyEmotion, addWarn, ignoreWarn, addReport, removeReport, addEvent, removeEvent, putDepend} = this.props;
			return (
				<ul className={"list-wrap" + (data.length > 0 ? '' : ' blank')} ref="main">
					{
						data.length > 0 ? data.map((dat, idx) => {
							return <Item data={dat} key={idx} queryParams={queryParams} reportSelectData={reportSelectData} eventSelectData={eventSelectData} modifyEmotion={(emotion) => {modifyEmotion(dat.uuid, emotion)}} addWarn={addWarn} ignoreWarn={ignoreWarn} addReport={addReport} removeReport={removeReport} addEvent={addEvent} removeEvent={removeEvent} putDepend={putDepend} />
						})
						: <li className="list-blank-holder"><span>暂无数据</span></li>
					}
				</ul>
			)
		}
	})

	return List;
})