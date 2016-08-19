define([paths.ex.page + '/advices/base/articles/reducers.js'], function(gen){

	var R = gen('articles_events');

	function articles_events(state = {}, action){
		return {
			filters: R.filters(state.filters, action),
			filters_selected: R.filters_selected(state.filters_selected, action),
			queryParams: R.queryParams(state.queryParams, action),
			paramsMirror: R.paramsMirror(state.paramsMirror, action),
			defaultParams: R.defaultParams(state.defaultParams, action),
			selected_tags: R.selected_tags(state.selected_tags, action),
			articles: R.articles(state.articles, action),
			reportSelectData: R.reportSelectData(state.reportSelectData, action),
			eventSelectData: R.eventSelectData(state.eventSelectData, action),
			articlesCount: R.articlesCount(state.articlesCount, action),
			articlesUniqCount: R.articlesUniqCount(state.articlesUniqCount, action),
			dependModalShow: R.dependModalShow(state.dependModalShow, action),
			dependUuid: R.dependUuid(state.dependUuid, action),
			loading: R.loading(state.loading, action)
		}
	}

	return {
		articles_events
	}
})