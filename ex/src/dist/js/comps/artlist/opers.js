'use strict';

define(['mods', paths.ex.comps + '/artlist/select.js'], function (mods, Select) {
	var React = mods.ReactPack.default;

	var Opers = React.createClass({
		displayName: 'Opers',

		getInitialState: function getInitialState() {
			return {
				fixed: false
			};
		},
		componentDidMount: function componentDidMount() {
			document.querySelector('.frame-body-right').addEventListener('scroll', this.scrollHandler);
		},
		scrollHandler: function scrollHandler() {
			var tar = $(this.refs.main);
			if (tar.offset().top > 60) this.setState({ fixed: false });else this.setState({ fixed: true });
		},
		componentWillUnmount: function componentWillUnmount() {
			document.querySelector('.frame-body-right').removeEventListener('scroll', this.scrollHandler);
		},
		uniHandler: function uniHandler(sele) {
			if (this.props.onUniqueClick && this.props.unique != sele) this.props.onUniqueClick(sele);
		},
		renderUnique: function renderUnique() {
			var _this = this;

			if (this.props.unique == undefined) return null;else {
				return React.createElement(
					'div',
					{ className: 'oper-uni' },
					React.createElement(
						'div',
						{ className: "item" + (this.props.unique == 'true' ? ' active' : ''), onClick: function onClick() {
								return _this.uniHandler('true');
							} },
						React.createElement(
							'span',
							null,
							'排重'
						)
					),
					React.createElement(
						'div',
						{ className: "item" + (this.props.unique == 'false' ? ' active' : ''), onClick: function onClick() {
								return _this.uniHandler('false');
							} },
						React.createElement(
							'span',
							null,
							'不排重'
						)
					)
				);
			}
		},
		emotHandler: function emotHandler(emot) {
			if (this.props.emotion != emot && this.props.onEmotionClick) {
				this.props.onEmotionClick(emot);
			}
		},
		renderEmot: function renderEmot() {
			var _this2 = this;

			if (this.props.emotion == undefined) return null;else {
				return React.createElement(
					'div',
					{ className: 'oper-emot' },
					React.createElement(
						'div',
						{ className: "item" + (this.props.emotion == 'all' ? ' active' : ''), onClick: function onClick() {
								return _this2.emotHandler('all');
							} },
						React.createElement(
							'span',
							null,
							'全部'
						)
					),
					React.createElement(
						'div',
						{ className: "item" + (this.props.emotion == 'positive' ? ' active' : ''), onClick: function onClick() {
								return _this2.emotHandler('positive');
							} },
						React.createElement(
							'span',
							null,
							'正面'
						)
					),
					React.createElement(
						'div',
						{ className: "item" + (this.props.emotion == 'neutral' ? ' active' : ''), onClick: function onClick() {
								return _this2.emotHandler('neutral');
							} },
						React.createElement(
							'span',
							null,
							'中立'
						)
					),
					React.createElement(
						'div',
						{ className: "item" + (this.props.emotion == 'negative' ? ' active' : ''), onClick: function onClick() {
								return _this2.emotHandler('negative');
							} },
						React.createElement(
							'span',
							null,
							'负面'
						)
					)
				);
			}
		},
		reportHandler: function reportHandler(title) {
			this.props.putReport && this.props.putReport(title);
		},
		renderReportSelect: function renderReportSelect() {
			var _this3 = this;

			if (this.props.reports != undefined) {
				return React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(
						Select,
						{ placeholder: '加入日报' },
						this.props.reports.map(function (item, idx) {
							return React.createElement(
								'li',
								{ key: idx, onClick: function onClick() {
										return _this3.reportHandler(item);
									} },
								React.createElement(
									'span',
									{ title: item.title_at + item.title },
									item.title_at + item.title
								)
							);
						})
					)
				);
			}
		},
		eventHandler: function eventHandler(event) {
			this.props.putEvent && this.props.putEvent(event);
		},
		renderEventSelect: function renderEventSelect() {
			var _this4 = this;

			if (this.props.events != undefined) {
				return React.createElement(
					'div',
					{ className: 'item' },
					React.createElement(
						Select,
						{ placeholder: '加入事件' },
						this.props.events.map(function (item, idx) {
							return React.createElement(
								'li',
								{ key: idx, onClick: function onClick() {
										return _this4.eventHandler(item);
									} },
								React.createElement(
									'span',
									{ title: item.title },
									item.title
								)
							);
						})
					)
				);
			}
		},
		addEmotionHandler: function addEmotionHandler(emot) {
			this.props.putEmotion && this.props.putEmotion(emot);
		},
		putDependHandler: function putDependHandler() {
			this.props.putDepend && this.props.putDepend();
		},
		renderEmotionSelect: function renderEmotionSelect() {
			var _this5 = this;

			return React.createElement(
				'div',
				{ className: 'item' },
				React.createElement(
					Select,
					{ placeholder: '研判为' },
					React.createElement(
						'li',
						{ onClick: function onClick() {
								return _this5.addEmotionHandler('positive');
							} },
						React.createElement(
							'span',
							null,
							'正面'
						)
					),
					React.createElement(
						'li',
						{ onClick: function onClick() {
								return _this5.addEmotionHandler('neutral');
							} },
						React.createElement(
							'span',
							null,
							'中立'
						)
					),
					React.createElement(
						'li',
						{ onClick: function onClick() {
								return _this5.addEmotionHandler('negative');
							} },
						React.createElement(
							'span',
							null,
							'负面'
						)
					),
					this.props.putDepend ? React.createElement(
						'li',
						{ onClick: this.putDependHandler },
						React.createElement(
							'span',
							null,
							'与我无关'
						)
					) : null
				)
			);
		},
		warnClickHandler: function warnClickHandler() {
			this.props.putWarn && this.props.putWarn();
		},
		renderWarn: function renderWarn() {
			if (this.props.warn) {
				return React.createElement(
					'div',
					{ className: 'item warn', onClick: this.warnClickHandler },
					React.createElement(
						'span',
						null,
						this.props.warn
					)
				);
			}
		},
		renderPage: function renderPage() {
			var _this6 = this;

			var cur = this.props.curPage,
			    pageSize = this.props.pageSize || 20,
			    total = Math.ceil(this.props.total / pageSize);

			var onPrev = function onPrev() {
				if (cur > 1) _this6.props.onPageChange && _this6.props.onPageChange(cur - 1);
			};
			var onNext = function onNext() {
				if (cur < total) {
					_this6.props.onPageChange && _this6.props.onPageChange(cur + 1);
				}
			};

			if (this.props.pagin == 'true' && total > 0) {
				return React.createElement(
					'div',
					{ className: 'pagin' },
					React.createElement('div', { className: "prev" + (cur <= 1 ? ' disable' : ''), onClick: onPrev }),
					React.createElement(
						'div',
						{ className: 'page' },
						React.createElement(
							'span',
							{ className: 'cur' },
							cur
						),
						React.createElement(
							'span',
							{ className: 'total' },
							'／',
							total
						)
					),
					React.createElement('div', { className: "next" + (cur >= total ? ' disable' : ''), onClick: onNext })
				);
			}
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'operc-wrap', ref: 'main' },
				React.createElement(
					'div',
					{ className: "operc" + (this.state.fixed ? ' fixed' : '') },
					this.renderUnique(),
					this.renderEmot(),
					React.createElement(
						'div',
						{ className: 'oper-selc' },
						this.renderEventSelect(),
						this.renderReportSelect(),
						this.renderEmotionSelect(),
						this.renderWarn(),
						this.renderPage()
					)
				)
			);
		}
	});

	return Opers;
});