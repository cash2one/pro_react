'use strict';

define(function () {
	var defaults = {
		// silence
		'app': 'text',
		// parse
		'm': 10,
		'uniq': false,
		'result': 'all',
		'ct': 1,
		// not all
		'beg': 0,
		'sort': 'publish_at_desc',
		// all
		'wd': '',
		'date': 'all',
		'emotion': 'all',
		'level': 'all',
		'production': '',
		'medium': '全部',
		'warn': 'ignore',
		'product': '全部',
		'platform': 'all',
		'med': '',
		'inc': '',
		'cat': 'all'
	};
	return $.extend({}, defaults);
});