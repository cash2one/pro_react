'use strict';

define(['mods', paths.ex.util + '/parse.js', paths.ex.plu + '/sort.js'], function (mods, Parse, Sort) {
	var React = mods.ReactPack.default;

	var emotMap = {
		'positive': '正面',
		'neutral': '中立',
		'manual_negative': '负面'
	};

	var T = React.createClass({
		displayName: 'T',

		mixins: [Sort],
		getInitialState: function getInitialState() {
			var data = this.props.data || [];
			return {
				items: data
			};
		},

		sortableOptions: {
			model: 'items',
			ref: 'list',
			handle: '.iconfont'
		},
		componentWillReceiveProps: function componentWillReceiveProps(n) {
			this.setState({ items: n.data });
		},
		getList: function getList() {
			return this.state.items;
		},
		render: function render() {
			var _this = this;

			return React.createElement(
				'ul',
				{ ref: 'list' },
				this.state.items.map(function (art, idx) {
					var title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
					var pn = (art.from || {}).platform_name || '',
					    media_pre = void 0,
					    media_end = (art.from || {}).media || '';
					if (pn == '待定' || pn == '') media_pre = '';else media_pre = pn + '：';

					return React.createElement(
						'li',
						{ ref: idx },
						React.createElement(
							'div',
							{ className: 'title' },
							React.createElement(
								'a',
								{ href: art.url, target: '_blank', title: title },
								Parse.limit(title, 40)
							),
							React.createElement('span', { className: "c-cb active", onClick: function onClick() {
									return _this.props.unselect(art);
								} })
						),
						React.createElement(
							'div',
							{ className: 'infos' },
							React.createElement(
								'span',
								null,
								Parse.time(art.publish_at)
							),
							React.createElement(
								'span',
								null,
								media_pre + media_end
							),
							React.createElement(
								'span',
								null,
								emotMap[art.emotion] || ''
							),
							React.createElement(
								'div',
								{ className: 'tool' },
								React.createElement(
									'span',
									null,
									'相同文章：' + (art.similar_count || 0) + '篇'
								),
								React.createElement('span', { className: 'iconfont icon-paixu' })
							)
						)
					);
				})
			);
		}
	});

	var Art = React.createClass({
		displayName: 'Art',
		dealData: function dealData() {
			var _props = this.props;
			var _props$data = _props.data;
			var data = _props$data === undefined ? {} : _props$data;
			var _props$save = _props.save;
			var save = _props$save === undefined ? {} : _props$save;
			var _data$focus_articles = data.focus_articles;
			var focus_articles = _data$focus_articles === undefined ? [] : _data$focus_articles;

			var focus_articles2 = save.info ? save.info.focus_articles || [] : [],
			    begin = new Date(save.begin_at).getTime(),
			    end = new Date(save.end_at).getTime();

			focus_articles2 = focus_articles2.filter(function (item) {
				var t = new Date(item.publish_at.split(' ')[0]).getTime();
				return t >= begin && t <= end;
			});

			var selected = focus_articles2.map(function (item) {
				return item.uuid;
			});

			focus_articles = focus_articles.filter(function (item) {
				var t = new Date(item.publish_at.split(' ')[0]).getTime();
				return t >= begin && t <= end && selected.indexOf(item.uuid) == -1;
			});

			return {
				list1: focus_articles,
				list2: focus_articles2
			};
		},
		unselect: function unselect(art) {
			this.props.unselect && this.props.unselect(art);
		},
		select: function select(art) {
			this.props.select && this.props.select(art);
		},
		renderList: function renderList(artList, isSelected) {
			var _this2 = this;

			return artList.map(function (art, idx) {
				var title = Parse.parseTag(art.title && art.title.length > 0 ? art.title : art.content ? art.content : '');
				var pn = (art.from || {}).platform_name || '',
				    media_pre = void 0,
				    media_end = (art.from || {}).media || '';
				if (pn == '待定' || pn == '') media_pre = '';else media_pre = pn + '：';

				return React.createElement(
					'li',
					{ key: idx },
					React.createElement(
						'div',
						{ className: 'title' },
						React.createElement(
							'a',
							{ href: art.url, target: '_blank', title: title },
							Parse.limit(title, 40)
						),
						React.createElement('span', { className: "c-cb" + (isSelected ? ' active' : ''), onClick: function onClick() {
								isSelected ? _this2.unselect(idx) : _this2.select(art);
							} })
					),
					React.createElement(
						'div',
						{ className: 'infos' },
						React.createElement(
							'span',
							null,
							Parse.time(art.publish_at)
						),
						React.createElement(
							'span',
							null,
							media_pre + media_end
						),
						React.createElement(
							'span',
							null,
							emotMap[art.emotion] || ''
						),
						React.createElement(
							'div',
							{ className: 'tool' },
							React.createElement(
								'span',
								null,
								'相同文章：' + (art.similar_count || 0) + '篇'
							),
							isSelected ? React.createElement('span', { className: 'iconfont icon-paixu' }) : null
						)
					)
				);
			});
		},
		getList: function getList() {
			return this.refs.list ? this.refs.list.getList() : [];
		},
		render: function render() {
			var _this3 = this;

			var artList = this.dealData();
			// console.log(artList)
			return React.createElement(
				'div',
				{ className: 'art-part' },
				artList.list1.length == 0 && artList.list2.length == 0 ? React.createElement(
					'div',
					{ className: 'list-blank-holder' },
					'暂无数据'
				) : [React.createElement(T, { ref: 'list', data: artList.list2, unselect: this.unselect, setList: function setList(list) {
						return _this3.props.setList(list);
					} }), React.createElement(
					'ul',
					{ className: artList.list2.length % 2 ? 'odd' : undefined },
					this.renderList(artList.list1, false)
				)]
			);
		}
	});

	return Art;
});