'use strict';

define(['mods'], function (mods) {
	var React = mods.ReactPack.default;

	var params = {
		'cat': {
			name: '行业主题',
			name_key: 'cat',
			dataKey: 'industry',
			filter_key: 'name'
		},
		'product': {
			name: '产品分类',
			name_key: 'product',
			dataKey: 'product_form',
			filter_key: 'name'
		},
		'platform': {
			name: '托管平台',
			name_key: 'platform',
			dataKey: 'platform',
			filter_key: 'name'
		},
		'med': {
			name: '媒体名称',
			name_key: 'med',
			dataKey: 'media',
			filter_key: 'mid'
		},
		'inc': {
			name: '事件名称',
			name_key: 'inc',
			dataKey: 'event',
			filter_key: 'id'
		},
		'emotion': {
			name: '情感筛选',
			name_key: 'emotion',
			dataKey: 'emotion',
			filter_key: 'param'
		},
		'warn': {
			name: '预警状态',
			name_key: 'warn',
			dataKey: 'warn',
			filter_key: 'param'
		},
		'production': {
			name: '生产方式',
			name_key: 'production',
			dataKey: 'production',
			filter_key: 'param'
		},
		'medium': {
			name: '媒体分类',
			name_key: 'medium',
			dataKey: 'medium',
			filter_key: 'name'
		},
		'level': {
			name: '媒体等级',
			name_key: 'level',
			dataKey: 'level',
			filter_key: 'param'
		}
	};

	var FiltersItem = React.createClass({
		displayName: 'FiltersItem',
		getInitialState: function getInitialState() {
			return {
				more: false
			};
		},
		componentDidUpdate: function componentDidUpdate() {
			if (this.refs.main.offsetHeight > 90 && !this.state.more) this.setState({ more: true });else if (this.refs.main.offsetHeight <= 90 && this.state.more) this.setState({ more: false });
		},
		render: function render() {
			var _this = this;

			//name, name_key, data, filter_key
			var _props = this.props;
			var mutiKey = _props.mutiKey;
			var moreKey = _props.moreKey;
			var filtersSelected = _props.filtersSelected;
			var opts = _props.opts;

			var isMuti = mutiKey == opts.name_key;
			return React.createElement(
				'div',
				{ className: "filter-box-item" + (mutiKey == opts.name_key ? ' muti-select' : moreKey == opts.name_key ? ' more' : '') },
				React.createElement(
					'div',
					{ className: 'spec' },
					React.createElement(
						'span',
						null,
						opts.name
					)
				),
				React.createElement(
					'div',
					{ className: 'opers' },
					opts.data.length > 1 ? React.createElement('div', { className: 'oper oper-muti-select', onClick: function onClick() {
							return _this.props.mutiClick(opts.name_key);
						} }) : null,
					this.state.more ? React.createElement('div', { className: 'oper oper-more', onClick: function onClick() {
							return _this.props.moreClick(opts.name_key);
						} }) : null
				),
				React.createElement(
					'div',
					{ className: 'filters' },
					React.createElement(
						'div',
						{ className: 'filters-wrap', ref: 'main' },
						opts.data.map(function (item, idx) {
							var checked = filtersSelected.indexOf(item[opts.filter_key]) != -1;
							if (isMuti) {
								return React.createElement(
									'div',
									{ className: "item" + (checked ? ' checked' : ''), key: idx, onClick: function onClick() {
											checked ? _this.props.deleteSelected(item[opts.filter_key]) : _this.props.addSelected(item[opts.filter_key]);
										} },
									React.createElement(
										'span',
										{ className: 'txt' },
										item.name
									),
									React.createElement('span', { className: 'cb' })
								);
							} else {
								return React.createElement(
									'div',
									{ className: 'item', key: idx, onClick: function onClick() {
											return _this.props.chooseFilters(opts.name_key, item[opts.filter_key]);
										} },
									React.createElement(
										'span',
										{ className: 'txt' },
										item.name
									),
									React.createElement('span', { className: 'cb' })
								);
							}
						})
					),
					React.createElement(
						'div',
						{ className: 'buttons' },
						React.createElement(
							'span',
							{ className: 'button', onClick: this.props.cancelClick },
							'取消'
						),
						React.createElement(
							'span',
							{ className: 'button confirm', onClick: function onClick() {
									return _this.props.confirmClick(opts.name_key);
								} },
							'确认'
						)
					)
				)
			);
		}
	});

	var Filters = React.createClass({
		displayName: 'Filters',
		componentDidMount: function componentDidMount() {
			var p = $(this.refs.main),
			    t = p.parents('.filter-part');
			p.on('scroll', function (e) {
				if ($(this).scrollTop() > 0) t.addClass('scroll');else t.removeClass('scroll');
			});
		},
		componentWillUnmount: function componentWillUnmount() {
			$(this.refs.main).parents('.list-part').off('scroll');
		},
		mutiClick: function mutiClick(key) {
			if (this.props.mutiClick) this.props.mutiClick(key);
			if (this.props.moreClick) this.props.moreClick(key);
			this.clearSelected();
		},
		moreClick: function moreClick(key) {
			var moreKey = this.props.moreKey;

			if (this.props.mutiClick) this.props.mutiClick('');

			if (moreKey == key) {
				if (this.props.moreClick) this.props.moreClick('');
			} else {
				if (this.props.moreClick) this.props.moreClick(key);
			}
			this.clearSelected();
		},
		confirmClick: function confirmClick(key) {
			var choose = this.props.filtersSelected;
			if (choose.length) this.chooseFilters(key, choose.join(','));
			this.mutiClick('');
			this.moreClick('');
		},
		cancelClick: function cancelClick() {
			this.mutiClick('');
			this.moreClick('');
		},
		addSelected: function addSelected(value) {
			if (this.props.addSelected) this.props.addSelected(value);
		},
		deleteSelected: function deleteSelected(value) {
			if (this.props.deleteSelected) this.props.deleteSelected(value);
		},
		clearSelected: function clearSelected() {
			if (this.props.clearSelected) this.props.clearSelected();
		},
		chooseFilters: function chooseFilters(key, value) {
			if (this.props.chooseFilters) this.props.chooseFilters(key, value);
		},
		renderItems: function renderItems(name, name_key, data, filter_key) {
			var _this2 = this;

			var _props2 = this.props;
			var mutiKey = _props2.mutiKey;
			var moreKey = _props2.moreKey;
			var filtersSelected = _props2.filtersSelected;

			var isMuti = mutiKey == name_key;
			return React.createElement(
				'div',
				{ className: "filter-box-item" + (mutiKey == name_key ? ' muti-select' : moreKey == name_key ? ' more' : '') },
				React.createElement(
					'div',
					{ className: 'spec' },
					React.createElement(
						'span',
						null,
						name
					)
				),
				React.createElement(
					'div',
					{ className: 'opers' },
					React.createElement('div', { className: 'oper oper-muti-select', onClick: function onClick() {
							return _this2.mutiClick(name_key);
						} }),
					React.createElement('div', { className: 'oper oper-more', onClick: function onClick() {
							return _this2.moreClick(name_key);
						} })
				),
				React.createElement(
					'div',
					{ className: 'filters' },
					React.createElement(
						'div',
						{ className: 'filters-wrap' },
						data.map(function (item, idx) {
							var checked = filtersSelected.indexOf(item[filter_key]) != -1;
							if (isMuti) {
								return React.createElement(
									'div',
									{ className: "item" + (checked ? ' checked' : ''), key: idx, onClick: function onClick() {
											checked ? _this2.deleteSelected(item[filter_key]) : _this2.addSelected(item[filter_key]);
										} },
									React.createElement(
										'span',
										{ className: 'txt' },
										item.name
									),
									React.createElement('span', { className: 'cb' })
								);
							} else {
								return React.createElement(
									'div',
									{ className: 'item', key: idx, onClick: function onClick() {
											return _this2.chooseFilters(name_key, item[filter_key]);
										} },
									React.createElement(
										'span',
										{ className: 'txt' },
										item.name
									),
									React.createElement('span', { className: 'cb' })
								);
							}
						})
					),
					React.createElement(
						'div',
						{ className: 'buttons' },
						React.createElement(
							'span',
							{ className: 'button', onClick: this.cancelClick },
							'取消'
						),
						React.createElement(
							'span',
							{ className: 'button confirm', onClick: function onClick() {
									return _this2.confirmClick(name_key);
								} },
							'确认'
						)
					)
				)
			);
		},
		renderHangye: function renderHangye() {
			var _this3 = this;

			var _props3 = this.props;
			var data = _props3.data;
			var paramsMirror = _props3.paramsMirror;
			var defaultParams = _props3.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['cat']).length == 0 || $.trim(paramsMirror['cat']) == defaultParams['cat'];
			if (data.industry && data.industry.length && pass) {
				// node = this.renderItems('行业主题', 'cat', data.industry, 'name');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this3.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this3.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this3.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this3.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this3.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this3.confirmClick(name);
					},
					opts: {
						name: '行业主题',
						name_key: 'cat',
						data: data.industry,
						filter_key: 'name'
					} });
			}
			return node;
		},
		renderChanPin: function renderChanPin() {
			var _this4 = this;

			var _props4 = this.props;
			var data = _props4.data;
			var paramsMirror = _props4.paramsMirror;
			var defaultParams = _props4.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['product']).length == 0 || $.trim(paramsMirror['product']) == defaultParams['product'];
			if (data.product_form && data.product_form.length && pass) {
				// node = this.renderItems('产品分类', 'product', data.product_form, 'name');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this4.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this4.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this4.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this4.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this4.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this4.confirmClick(name);
					},
					opts: {
						name: '产品分类',
						name_key: 'product',
						data: data.product_form,
						filter_key: 'name'
					} });
			}
			return node;
		},
		renderTuoGuan: function renderTuoGuan() {
			var _this5 = this;

			var _props5 = this.props;
			var data = _props5.data;
			var paramsMirror = _props5.paramsMirror;
			var defaultParams = _props5.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['platform']).length == 0 || $.trim(paramsMirror['platform']) == defaultParams['platform'];
			if (data.platform && data.platform.length && pass) {
				// node = this.renderItems('托管平台', 'platform', data.platform, 'uuid');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this5.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this5.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this5.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this5.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this5.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this5.confirmClick(name);
					},
					opts: {
						name: '托管平台',
						name_key: 'platform',
						data: data.platform,
						filter_key: 'name'
					} });
			}
			return node;
		},
		renderMeiTi: function renderMeiTi() {
			var _this6 = this;

			var _props6 = this.props;
			var data = _props6.data;
			var paramsMirror = _props6.paramsMirror;
			var defaultParams = _props6.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['med']).length == 0 || $.trim(paramsMirror['med']) == defaultParams['med'];
			if (data.media && data.media.length && pass) {
				// node = this.renderItems('媒体名称', 'med', data.media, 'mid')
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this6.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this6.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this6.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this6.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this6.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this6.confirmClick(name);
					},
					opts: {
						name: '媒体名称',
						name_key: 'med',
						data: data.media,
						filter_key: 'mid'
					} });
			}
			return node;
		},
		renderShiJian: function renderShiJian() {
			var _this7 = this;

			var _props7 = this.props;
			var data = _props7.data;
			var paramsMirror = _props7.paramsMirror;
			var defaultParams = _props7.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['inc']).length == 0 || $.trim(paramsMirror['inc']) == defaultParams['inc'];
			if (data.event && data.event.length && pass) {
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this7.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this7.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this7.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this7.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this7.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this7.confirmClick(name);
					},
					opts: {
						name: '事件名称',
						name_key: 'inc',
						data: data.event,
						filter_key: 'id'
					} });
			}
			return node;
		},
		renderQinggan: function renderQinggan() {
			var _this8 = this;

			var _props8 = this.props;
			var data = _props8.data;
			var paramsMirror = _props8.paramsMirror;
			var defaultParams = _props8.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['emotion']).length == 0 || $.trim(paramsMirror['emotion']) == defaultParams['emotion'];
			if (data.emotion && data.emotion.length && pass) {
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this8.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this8.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this8.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this8.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this8.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this8.confirmClick(name);
					},
					opts: {
						name: '情感筛选',
						name_key: 'emotion',
						data: data.emotion,
						filter_key: 'param'
					} });
			}
			return node;
		},
		renderYujin: function renderYujin() {
			var _this9 = this;

			var _props9 = this.props;
			var data = _props9.data;
			var paramsMirror = _props9.paramsMirror;
			var defaultParams = _props9.defaultParams;
			var node;
			var pass = $.trim(paramsMirror['warn']).length == 0 || $.trim(paramsMirror['warn']) == defaultParams['warn'];
			if (data.warn && data.warn.length && pass) {
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this9.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this9.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this9.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this9.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this9.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this9.confirmClick(name);
					},
					opts: {
						name: '预警状态',
						name_key: 'warn',
						data: data.warn,
						filter_key: 'param'
					} });
			}
			return node;
		},
		render2: function render2(opt) {
			var _this10 = this;

			var _props10 = this.props;
			var data = _props10.data;
			var paramsMirror = _props10.paramsMirror;
			var defaultParams = _props10.defaultParams;
			var node;
			var pass = $.trim(paramsMirror[opt['name_key']]).length == 0 || $.trim(paramsMirror[opt['name_key']]) == defaultParams[opt['name_key']];
			if (data[opt['dataKey']] && data[opt['dataKey']].length && pass) {
				// node = this.renderItems('事件名称', 'inc', data.event, 'id');
				node = React.createElement(FiltersItem, {
					mutiKey: this.props.mutiKey,
					moreKey: this.props.moreKey,
					filtersSelected: this.props.filtersSelected,
					mutiClick: function mutiClick(name) {
						return _this10.mutiClick(name);
					},
					moreClick: function moreClick(name) {
						return _this10.moreClick(name);
					},
					deleteSelected: function deleteSelected(name) {
						return _this10.deleteSelected(name);
					},
					addSelected: function addSelected(name) {
						return _this10.addSelected(name);
					},
					chooseFilters: function chooseFilters(key, name) {
						return _this10.chooseFilters(key, name);
					},
					cancelClick: this.cancelClick,
					confirmClick: function confirmClick(name) {
						return _this10.confirmClick(name);
					},
					opts: {
						name: opt.name,
						name_key: opt.name_key,
						data: data[opt['dataKey']],
						filter_key: opt.filter_key
					} });
			}
			return node;
		},
		render: function render() {
			var _this11 = this;

			var _props11 = this.props;
			var data = _props11.data;
			var paramsMirror = _props11.paramsMirror;
			var defaultParams = _props11.defaultParams;

			return React.createElement(
				'div',
				{ className: 'bd', ref: 'main' },
				React.createElement(
					'div',
					{ className: 'filter-box' },
					Object.keys(params).map(function (p) {
						var param = params[p];
						return _this11.render2(param);
					})
				)
			);
		}
	});

	return Filters;
});