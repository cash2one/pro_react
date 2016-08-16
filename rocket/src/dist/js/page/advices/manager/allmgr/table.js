'use strict';

/**
 * 人员管理 - 超级运营员 - table组件
 */

define(['mods'], function (mods) {
	var React = require('mods').ReactPack.default;

	var Table = React.createClass({
		displayName: 'Table',


		render: function render() {
			var _this = this;

			return React.createElement(
				'table',
				{ className: this.props.search_result_none ? "none" : "table table-striped spec" },
				React.createElement(
					'thead',
					null,
					React.createElement(
						'th',
						{ className: 'tc' },
						'序号'
					),
					React.createElement(
						'th',
						null,
						'手机号码'
					),
					React.createElement(
						'th',
						null,
						'姓名'
					),
					React.createElement(
						'th',
						null,
						'运营公司'
					),
					React.createElement(
						'th',
						null,
						'操作'
					)
				),
				React.createElement(
					'tbody',
					null,
					this.props.mdata.map(function (index, elem) {
						var userid = index.user_id,
						    tindex = index,
						    com = index.companys,
						    com_name = com.company_name,
						    com_len = parseInt(com.length - 1);

						return React.createElement(
							'tr',
							null,
							React.createElement(
								'td',
								{ className: 'tc' },
								elem + 1
							),
							React.createElement(
								'td',
								null,
								index.telephone
							),
							React.createElement(
								'td',
								null,
								index.user_name
							),
							React.createElement(
								'td',
								null,
								com.map(function (index, elem) {
									if (elem === com_len) {
										return React.createElement(
											'span',
											null,
											index.company_name
										);
									} else {
										return React.createElement(
											'span',
											null,
											index.company_name,
											React.createElement(
												'i',
												null,
												' | '
											)
										);
									}
								})
							),
							React.createElement(
								'td',
								null,
								React.createElement('span', { className: 'iconfont icon-pencil', onClick: function onClick(e) {
										_this.props.edit(e, userid, com);
									} }),
								React.createElement('span', { className: 'iconfont icon-lajitong ml30', onClick: function onClick(e) {
										_this.props.delete(e, userid);
									} })
							)
						);
					})
				)
			);
		}
	});

	return Table;
});