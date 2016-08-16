define([
	'mods',
	paths.rcn.plu + '/swiper.js'
], function(mods){
	const React = mods.ReactPack.default;

	const Guide = React.createClass({
		getInitialState: function(){
			return {
				finish: true,
				last: false,
				init: false
			}
		},
		componentDidMount: function(){
			if(!this.state.finish){
				this.init();
			}
		},
		componentWillReceiveProps: function(p){
			if(p.user.uuid && !this.state.init){
				this.setState({init: true, userid: p.user.uuid});
				if(!$.cookie('guide_' + p.user.uuid)){
					this.setState({finish: false}, this.init);
				}
			}
		},
		componentWillUnmount: function(){
			if(this.swiper){
				this.swiper.destroy();
				this.swiper = null;
			}
		},
		init: function(){
			this.swiper = new Swiper('#guide', {
				pagination: '.pagin',
				simulateTouch: false,
				onSlideChangeStart: (s) => {
					if(s.isEnd){
						this.refs.r.classList.add('disable');
						this.setState({last: true});
					}
					else{
						this.refs.r.classList.remove('disable');
						this.setState({last: false})
					}
					if(s.isBeginning)
						this.refs.l.classList.add('disable')
					else
						this.refs.l.classList.remove('disable')
				}
			})
		},
		swipePrev: function(){
			this.swiper.slidePrev()
		},
		swipeNext: function(){
			this.swiper.slideNext()
		},
		finish: function(){
			$.cookie('guide_' + this.state.userid, true, {
				expires: new Date(2100,12,31)
			});
			this.setState({finish: true});
		},
		render: function(){
			if(!this.state.finish){
				return (
					<div className="guide-mask">
						<div className="wrap">
							<div className="swiper-container" id="guide">
								<div className="swiper-wrapper">
									<div className="swiper-slide">
										<img src={paths.rcn.img + '/guide-1.png'} alt="guide1"/>
									</div>
									<div className="swiper-slide">
										<img src={paths.rcn.img + '/guide-2.png'} alt="guide2"/>
									</div>
									<div className="swiper-slide">
										<img src={paths.rcn.img + '/guide-3.png'} alt="guide3"/>
									</div>
									<div className="swiper-slide">
										<img src={paths.rcn.img + '/guide-4.png'} alt="guide4"/>
									</div>
									<div className="swiper-slide">
										<img src={paths.rcn.img + '/guide-5.png'} alt="guide5"/>
									</div>
								</div>
							</div>
							<button className="c-button" onClick={this.finish}>{this.state.last ? '知道了' : '跳过'}</button>
							<div className="pagin">
								<span className="item"></span>
								<span className="item"></span>
								<span className="item"></span>
								<span className="item"></span>
							</div>
							<div className="arr">
								<div className="l disable" onClick={this.swipePrev} ref="l"></div>
								<div className="r" onClick={this.swipeNext} ref="r"></div>
							</div>
						</div>
					</div>
				)
			} else {
				return null
			}
		}
	})

	return Guide;
})