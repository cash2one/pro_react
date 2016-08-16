define(function(){
	var rTag = /\<[^<>]+\>|\<\/[^<>]\>|\<\!.*\>/g;

	return {
		limit: function(str, num){
			num = num || 100;
			if(str.length > num)
				str = str.substr(0, num) + '...';
			return str;
		},
		parseTag: function(str){
			str = (str || '').replace(rTag, '').replace(/^\s+/, '').replace(/\s+$/, '');
			return str;
		},
		time: function(str){
			str = str || '';
			return str.replace(/\:\d+$/, '');
		}
	}
})