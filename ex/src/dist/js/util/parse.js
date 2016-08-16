'use strict';

define(function () {
	var rTag = /\<[^<>]+\>|\<\/[^<>]\>|\<\!.*\>/g;

	return {
		limit: function limit(str, num) {
			num = num || 100;
			if (str.length > num) str = str.substr(0, num) + '...';
			return str;
		},
		parseTag: function parseTag(str) {
			str = (str || '').replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
			return str;
		},
		time: function time(str) {
			str = str || '';
			return str.replace(/\:\d+$/, '');
		}
	};
});