'use strict';

define(['mods', paths.ex.page + '/advices/base/articles/default.js'], function (mods, defaultFilter) {
	var React = mods.ReactPack.default;

	var keys = ['cat', 'product', 'platform', 'med', 'inc', 'emotion', 'warn', 'production', 'medium', 'level'];
	var keysMap = {
		'cat': '行业主题',
		'product': '产品分类',
		'platform': '托管平台',
		'med': '媒体名称',
		'inc': '事件名称',
		'emotion': '情感筛选',
		'warn': '预警状态',
		'production': '生产方式',
		'medium': '媒体分类',
		'level': '媒体等级'
	};
	var keyMap2 = {
		'cat': { value: 'industry', key: 'name' },
		'product': { value: 'product_form', key: 'name' },
		'platform': { value: 'platform', key: 'uuid' },
		'med': { value: 'media', key: 'mid' },
		'inc': { value: 'event', key: 'id' }
	};

	var getVal = {
		'emotion': {
			'positive': '正面',
			'neutral': '中立',
			'negative': '负面'
		},
		'warn': {
			'ignore': '全部',
			'all': '全部',
			'auto': '自动预警',
			'manual': '手动预警',
			'no': '非预警'
		},
		'production': {
			'ogc': '职业媒体',
			'ugc': '自媒体'
		},
		'level': {
			'a': '甲',
			'b': '乙',
			'c': '丙',
			'd': '丁'
		}
	};

	function pass(key, value) {
		return $.trim(value).length != 0 && value != defaultFilter[key];
	}

	var Cur = React.createClass({
		displayName: 'Cur',
		deleteHandler: function deleteHandler(key) {
			var defaultParams = this.props.defaultParams;

			if (this.props.deleteClick) {
				this.props.deleteClick(key, defaultParams[key]);
			}
		},
		getName: function getName(key, val) {
			if (!getVal[key]) return val;
			val = (val || '').split(',').map(function (v) {
				return getVal[key][$.trim(v)];
			}).join(',');
			return val;
		},
		clearAll: function clearAll() {
			var _props = this.props;
			var defaultParams = _props.defaultParams;
			var tags = _props.tags;

			var res = {},
			    a1,
			    a2;
			if (tags && tags.length) {
				tags.forEach(function (tag) {
					var key = tag['key'];
					a1 = key;
					a2 = defaultParams[key];
					res[key] = defaultParams[key];
				});
				this.props.clearAll && this.props.clearAll(a1, a2, res);
			}
		},
		renderTag: function renderTag() {
			var _this = this;

			var _props2 = this.props;
			var defaultParams = _props2.defaultParams;
			var tags = _props2.tags;

			var nodes = [];

			if (tags && tags.length) {
				tags.sort(function (a, b) {
					return keys.indexOf(a['key']) - keys.indexOf(b['key']);
				}).forEach(function (tag) {
					var key = tag['key'],
					    val = tag['value'],
					    spec = key == 'inc' && _this.props.type == 'event';
					if (val != defaultParams[key]) {
						var Key = keysMap[key],
						    Val = _this.getName(key, val);
						nodes.push(React.createElement(
							'span',
							{ className: "item" + (spec ? ' p0' : '') },
							spec ? React.createElement(
								'span',
								{ title: Key + ': ' + Val },
								Key + ': ' + Val
							) : [React.createElement(
								'span',
								{ title: Key + ': ' + Val },
								Key + ': ' + Val
							), React.createElement('span', { className: 'button', onClick: function onClick() {
									return _this.deleteHandler(key);
								} })]
						));
					}
				});
			}

			return nodes;
		},
		render: function render() {
			var tags = this.renderTag();
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'all' },
					tags.length == 0 ? React.createElement(
						'span',
						null,
						'所有分类'
					) : React.createElement(
						'span',
						{ className: 'clear-all', onClick: this.clearAll },
						'所有分类 >'
					)
				),
				React.createElement(
					'div',
					{ className: 'filter-cur-wrap' },
					tags
				)
			);
		}
	});

	return Cur;
});