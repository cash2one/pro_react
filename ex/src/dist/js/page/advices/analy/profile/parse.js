'use strict';

define(function () {
	var rTag = /\<[^<>]+\>|\<\/[^<>]\>/g;

	return {
		tag: function tag(str) {
			if (str) return str.replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
			return '';
		},
		limit: function limit(str, num) {
			if (str) {
				num = num || 100;
				if (str.length > num) str = str.substr(0, num) + '...';
				return str;
			}
			return '';
		}
	};
});