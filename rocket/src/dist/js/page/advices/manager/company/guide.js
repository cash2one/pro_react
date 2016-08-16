'use strict';

define(['mods', paths.rcn.plu + '/swiper.js'], function (mods) {
	var React = mods.ReactPack.default;

	var Guide = React.createClass({
		displayName: 'Guide',

		getInitialState: function getInitialState() {
			return {
				finish: true,
				last: false,
				init: false
			};
		},
		componentDidMount: function componentDidMount() {
			if (!this.state.finish) {
				this.init();
			}
		},
		componentWillReceiveProps: function componentWillReceiveProps(p) {
			if (p.user.uuid && !this.state.init) {
				this.setState({ init: true, userid: p.user.uuid });
				if (!$.cookie('guide_' + p.user.uuid)) {
					this.setState({ finish: false }, this.init);
				}
			}
		},
		componentWillUnmount: function componentWillUnmount() {
			if (this.swiper) {
				this.swiper.destroy();
				this.swiper = null;
			}
		},
		init: function init() {
			var _this = this;

			this.swiper = new Swiper('#guide', {
				pagination: '.pagin',
				simulateTouch: false,
				onSlideChangeStart: function onSlideChangeStart(s) {
					if (s.isEnd) {
						_this.refs.r.classList.add('disable');
						_this.setState({ last: true });
					} else {
						_this.refs.r.classList.remove('disable');
						_this.setState({ last: false });
					}
					if (s.isBeginning) _this.refs.l.classList.add('disable');else _this.refs.l.classList.remove('disable');
				}
			});
		},
		swipePrev: function swipePrev() {
			this.swiper.slidePrev();
		},
		swipeNext: function swipeNext() {
			this.swiper.slideNext();
		},
		finish: function finish() {
			$.cookie('guide_' + this.state.userid, true, {
				expires: new Date(2100, 12, 31)
			});
			this.setState({ finish: true });
		},
		render: function render() {
			if (!this.state.finish) {
				return React.createElement(
					'div',
					{ className: 'guide-mask' },
					React.createElement(
						'div',
						{ className: 'wrap' },
						React.createElement(
							'div',
							{ className: 'swiper-container', id: 'guide' },
							React.createElement(
								'div',
								{ className: 'swiper-wrapper' },
								React.createElement(
									'div',
									{ className: 'swiper-slide' },
									React.createElement('img', { src: paths.rcn.img + '/guide-1.png', alt: 'guide1' })
								),
								React.createElement(
									'div',
									{ className: 'swiper-slide' },
									React.createElement('img', { src: paths.rcn.img + '/guide-2.png', alt: 'guide2' })
								),
								React.createElement(
									'div',
									{ className: 'swiper-slide' },
									React.createElement('img', { src: paths.rcn.img + '/guide-3.png', alt: 'guide3' })
								),
								React.createElement(
									'div',
									{ className: 'swiper-slide' },
									React.createElement('img', { src: paths.rcn.img + '/guide-4.png', alt: 'guide4' })
								),
								React.createElement(
									'div',
									{ className: 'swiper-slide' },
									React.createElement('img', { src: paths.rcn.img + '/guide-5.png', alt: 'guide5' })
								)
							)
						),
						React.createElement(
							'button',
							{ className: 'c-button', onClick: this.finish },
							this.state.last ? '知道了' : '跳过'
						),
						React.createElement(
							'div',
							{ className: 'pagin' },
							React.createElement('span', { className: 'item' }),
							React.createElement('span', { className: 'item' }),
							React.createElement('span', { className: 'item' }),
							React.createElement('span', { className: 'item' })
						),
						React.createElement(
							'div',
							{ className: 'arr' },
							React.createElement('div', { className: 'l disable', onClick: this.swipePrev, ref: 'l' }),
							React.createElement('div', { className: 'r', onClick: this.swipeNext, ref: 'r' })
						)
					)
				);
			} else {
				return null;
			}
		}
	});

	return Guide;
});