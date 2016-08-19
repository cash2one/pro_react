'use strict';

define(['mods', paths.ex.page + '/advices/base/articles/art-list-item.js'], function (mods, Item) {
	var React = mods.ReactPack.default;

	var List = React.createClass({
		displayName: 'List',
		componentDidMount: function componentDidMount() {
			var p = $(this.refs.main).parents('.list-part'),
			    t = $('.advices-base2 .main-part');
			p.on('scroll', function (e) {
				if ($(this).scrollTop() > 0) t.addClass('scroll');else t.removeClass('scroll');
			});
		},
		componentWillUnmount: function componentWillUnmount() {
			$(this.refs.main).parents('.list-part').off('scroll');
		},
		render: function render() {
			var _props = this.props;
			var data = _props.data;
			var reportSelectData = _props.reportSelectData;
			var eventSelectData = _props.eventSelectData;
			var queryParams = _props.queryParams;
			var _modifyEmotion = _props.modifyEmotion;
			var addWarn = _props.addWarn;
			var ignoreWarn = _props.ignoreWarn;
			var addReport = _props.addReport;
			var removeReport = _props.removeReport;
			var addEvent = _props.addEvent;
			var removeEvent = _props.removeEvent;
			var putDepend = _props.putDepend;
			var togMore = _props.togMore;

			return React.createElement(
				'ul',
				{ className: "list-wrap" + (data.length > 0 ? '' : ' blank'), ref: 'main' },
				data.length > 0 ? data.map(function (dat, idx) {
					return React.createElement(Item, { data: dat, key: idx, queryParams: queryParams, reportSelectData: reportSelectData, eventSelectData: eventSelectData, modifyEmotion: function modifyEmotion(emotion) {
							_modifyEmotion(dat.uuid, emotion);
						}, addWarn: addWarn, ignoreWarn: ignoreWarn, addReport: addReport, removeReport: removeReport, addEvent: addEvent, removeEvent: removeEvent, putDepend: putDepend, togMore: togMore });
				}) : React.createElement(
					'li',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无数据'
					)
				)
			);
		}
	});

	return List;
});