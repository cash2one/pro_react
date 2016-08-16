define([paths.ex.page + '/advices/base/articles/reducers.js', paths.ex.page + '/advices/base/news/audit/default.js'], function(gen, Default){

	var R = gen('audit', Default, true);

	function audit(state = {}, action){
		return {
			queryParams: R.queryParams(state.queryParams, action),
			paramsMirror: R.paramsMirror(state.paramsMirror, action),
			defaultParams: R.defaultParams(state.defaultParams, action),
			articles: R.articles(state.articles, action),
			articlesCount: R.articlesCount(state.articlesCount, action),
			loading: R.loading(state.loading, action),
			dependUuid: R.dependUuid(state.dependUuid, action),
		}
	}

	return {
		audit
	}
})