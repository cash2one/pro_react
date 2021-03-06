define([
	paths.rcn.util + '/rest_validate.js',
	paths.rcn.util + '/tip.js'
], function(validate, tip){
	var config = {
		stripTrailingSlash: true,
		stringifyData: true,
		ajax: {
			beforeSend: function(xhr){
				xhr.setRequestHeader('user_token', $.cookie('user_token'))
				return validate.before()
			},
			complete: function(xhr){
				validate.after(xhr)
			}
		}
	};

	function merge(conf){
		conf = $.extend({}, conf);
		if(conf.ajax){
			if(conf.ajax['beforeSend']){
				var beforeSendOri = conf.ajax['beforeSend'];
				conf.ajax['beforeSend'] = function(xhr){
					xhr.setRequestHeader('user_token', $.cookie('user_token'))
					beforeSendOri.apply(this, arguments)
				}
			}
			if(conf.ajax['complete']){
				var completeOri = conf.ajax['complete'];
				conf.ajax['complete'] = function(xhr){
					validate(xhr)
					completeOri.apply(this, arguments);
				}
			}
		}
		return $.extend(true, {}, config, conf);
	}

	function rcn(conf = {}){
		var rest = new $.RestClient(paths.rcn.api + '/api/v1/', merge(conf));

		rest.add('user');
		rest.user.add('com');
		rest.user.add('authcode');
		rest.user.add('logout');
		rest.user.add('verify');
		rest.user.add('auth_url_wx');

		rest.add('rules');
		rest.add('setting');
		
		rest.add('company');

		rest.add('managers');
		rest.add('manager');

		rest.add('viewers');
		rest.add('viewer');

		rest.add('personal');
		rest.add('bind_telephone');
		rest.add('version');

		rest.add('avatar');
		
		rest.add('feedback');

		return rest
	}

	function rcn2(conf = {}){
		var rest = new $.RestClient(paths.rcn.api + '/api/v2/', merge(conf));

		rest.add('managers');
		rest.add('manager');

		return rest

	}

	function ex(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v1/', merge(conf));

		rest.add('articles');
		rest.add('article');
		rest.add('category');
		rest.add('events');
		rest.add('event');
		rest.add('report');
		rest.add('reports');
		rest.add('keywords');
		rest.add('media');
		rest.add('user');
		rest.add('config');

		return rest
	}

	function ex2(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v2/', merge(conf));

		rest.add('events');

		rest.add('article');
		rest.article.add('agg');
		rest.article.add('count');
		rest.article.add('data');

		rest.add('reports');
		rest.add('report');

		return rest
	}

	function admin(conf = {}){
		var rest = new $.RestClient(paths.admin.api + '/api/v1/', merge(conf));

		rest.add('user');
		rest.add('super');
		rest.add('syndicate');

		return rest
	}

	function index(conf = {}){
		var rest = new $.RestClient(paths.index.api + '/api/v1/', merge(conf));

		rest.add('keywords');
		rest.keywords.add('data');

		rest.add('brand');
		rest.brand.add('list');

		return rest
	}

	function bigdata(conf = {}){
		var rest = new $.RestClient(paths.index.api + '/api/v1/bigdata/', merge(conf));

		rest.add('nav');

		return rest
	}

	function brand(conf = {}){
		var rest = new $.RestClient(paths.index.api + '/api/v1/brand/', merge(conf));

		rest.add('list');
		rest.add('spread');
		rest.add('relation');

		return rest
	}

	function spread(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v1/spread/', merge(conf));

		rest.add('article');
		rest.add('company');
		rest.add('event');
		rest.add('rout');

		return rest
	}

	function media(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v1/media/', merge(conf));

		rest.add('dist');
		rest.dist.add('company');
		rest.dist.add('event');

		rest.add('article');

		rest.add('company');
		rest.add('event');

		return rest
	}

	function article(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v1/article/', merge(conf));

		rest.add('count');

		return rest
	}

	function eventsV2(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v2/events/', merge(conf));

		rest.add('getname');

		return rest
	}

	function reports(conf = {}){
		var rest = new $.RestClient(paths.ex.api + '/api/v2/reports/', merge(conf));

		rest.add('edit');

		return rest
	}

	return {
		rcn,
		rcn2,
		ex,
		ex2,
		admin,
		index,
		spread,
		article,
		media,
		bigdata,
		brand,
		eventsV2,
		reports,
		config
	}
})