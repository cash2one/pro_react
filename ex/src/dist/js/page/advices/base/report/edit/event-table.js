'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.ex.util + '/parse.js'], function (mods, R, Drop, Parse) {
	var React = mods.ReactPack.default;
	var EventTable = React.createClass({
		displayName: 'EventTable',
		handleSelectEvent: function handleSelectEvent(id) {
			this.props.selectEvent(id);
		},
		render: function render() {
			var _this = this;

			var data = this.props.data.events ? this.props.data.events.slice() : [],
			    ids = {};
			if (this.props.save.events) {
				var ids = this.props.save.events.reduce(function (obj, item) {
					obj[item.id] = item;
					return obj;
				}, {});
				data.forEach(function (dat) {
					if (ids[dat.id]) {
						dat.title = ids[dat.id].title;
						dat.rank = ids[dat.id].rank;
					}
				});
			}

			return React.createElement(
				'table',
				{ className: 'table events-table' },
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'th',
							{ className: 'tc' },
							'序号'
						),
						React.createElement(
							'th',
							null,
							'标题'
						),
						React.createElement(
							'th',
							null,
							'事件级别'
						),
						React.createElement(
							'th',
							null,
							'起始时间'
						),
						React.createElement(
							'th',
							null,
							'选择'
						)
					)
				),
				React.createElement(
					'tbody',
					null,
					data.map(function (event, idx) {
						return React.createElement(
							'tr',
							{ key: idx },
							React.createElement(
								'td',
								{ className: 'tc' },
								idx + 1
							),
							React.createElement(
								'td',
								null,
								event.title
							),
							React.createElement(
								'td',
								null,
								React.createElement(
									Drop,
									{ holder: React.createElement(
											'span',
											{ className: 'rank' },
											event.rank == 4 ? '普通' : '一二三'.charAt(event.rank - 1) + '级'
										) },
									React.createElement(
										'li',
										{ className: 'dropdown-item', onClick: function onClick() {
												return _this.props.changeEventRank(event.id, 1);
											} },
										'一级'
									),
									React.createElement(
										'li',
										{ className: 'dropdown-item', onClick: function onClick() {
												return _this.props.changeEventRank(event.id, 2);
											} },
										'二级'
									),
									React.createElement(
										'li',
										{ className: 'dropdown-item', onClick: function onClick() {
												return _this.props.changeEventRank(event.id, 3);
											} },
										'三级'
									),
									React.createElement(
										'li',
										{ className: 'dropdown-item', onClick: function onClick() {
												return _this.props.changeEventRank(event.id, 4);
											} },
										'普通'
									)
								)
							),
							React.createElement(
								'td',
								null,
								Parse.time(event.begin_at),
								' - ',
								event.end_at == '0000-00-00 00:00:00' ? '' : Parse.time(event.end_at)
							),
							React.createElement(
								'td',
								null,
								React.createElement('span', { className: "c-cb" + (ids[event.id] ? ' active' : ''), onClick: function onClick() {
										return _this.handleSelectEvent(event.id);
									} })
							)
						);
					})
				)
			);
		}
	});
	return EventTable;
});