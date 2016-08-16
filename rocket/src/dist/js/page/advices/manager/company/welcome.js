'use strict';

define(['mods', paths.rcn.util + '/rest.js'], function (mods, r) {

	var rest = r.rcn({
		stringifyData: false
	});

	var React = require('mods').ReactPack.default;

	var CompanyWelcome = React.createClass({
		displayName: 'CompanyWelcome',


		getInitialState: function getInitialState() {
			return {
				company: null,
				isFrame: false,
				uuid: null
			};
		},

		componentDidMount: function componentDidMount() {
			this.loadPage();
		},

		loadPage: function loadPage() {
			var _this = this;

			// $(".VoteWrapper h4").css("color","#fff");

			rest.user.read().done(function (data) {

				_this.setState({ company: data.company, uuid: data.uuid });

				// var uuid_ = data.uuid;
				// if($.cookie('vote') == uuid_){ // 投过票

				// 	return null;

				// }else { // 没投过票

				// 	this.setState({isFrame:true}); // 弹iframe投票
				// 	$.cookie('vote', uuid_, {domain: paths.rcn.domain, expires: new Date(Date.now() + 3 * 24 * 3600 * 1000)});

				// }
			}).error(function (data) {
				if (data.status === 400 && data.responseJSON.msg) {
					_this.setState({ warn: true, warntxt: data.responseJSON.msg });
				}
			});
		},

		handleReturn: function handleReturn() {
			this.setState({ isFrame: false });
		},

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'company-base' },
				React.createElement(
					'div',
					{ className: 'companyWelcome' },
					React.createElement('div', { className: 'bg' }),
					React.createElement(
						'div',
						{ className: 'txt' },
						'-- ',
						this.state.company
					)
				),
				React.createElement(
					'div',
					{ className: this.state.isFrame ? "show-frame" : "none" },
					React.createElement('div', { className: 'backdrop' })
				)
			);
		}
	});

	return CompanyWelcome;
});