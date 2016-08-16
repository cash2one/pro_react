'use strict';

define(['mods', paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/report/select.js', paths.ex.util + '/parse.js'], function (mods, R, Drop, Parse) {
	var React = mods.ReactPack.default;
	var key = 'focus_articles';
	var rTag = /\<[^<>]+\>|\<\/[^<>]\>/g;
	function parseTag(str) {
		if (str) return str.replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
		return '';
	}
	var ArtTable = React.createClass({
		displayName: 'ArtTable',
		render: function render() {
			var _this = this;

			var data = this.props.data || {},
			    save = this.props.save || {};
			data = data[key] || [];
			save = save[key] || [];

			var uuids = save.map(function (s) {
				return s.uuid;
			});
			if (data.length > 0) {
				return React.createElement(
					'table',
					{ className: 'table arts-table' },
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
								'文章类型'
							),
							React.createElement(
								'th',
								null,
								'作者'
							),
							React.createElement(
								'th',
								null,
								'发布时间'
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
						data.map(function (art, idx) {
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
									React.createElement(
										'a',
										{ className: 'art-title texthidden', target: '_blank', href: art.url },
										parseTag(art.title)
									)
								),
								React.createElement(
									'td',
									{ 'data-emotion': true },
									art.emotion
								),
								React.createElement(
									'td',
									{ 'data-author': true },
									art.author
								),
								React.createElement(
									'td',
									null,
									Parse.time(art.create_at)
								),
								React.createElement(
									'td',
									null,
									React.createElement('span', { className: "c-cb" + (uuids.indexOf(art.uuid) != -1 ? ' active' : ''), onClick: function onClick() {
											return _this.props.selectArt(art.uuid);
										} })
								)
							);
						})
					)
				);
			} else {
				return React.createElement(
					'div',
					{ className: 'list-blank-holder' },
					React.createElement(
						'span',
						null,
						'暂无文章'
					)
				);
			}
		}
	});
	return ArtTable;
});