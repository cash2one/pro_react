define([paths.rcn.util + '/rest.js', paths.ex.page + '/advices/base/articles/actions.js'], function(R, Actions){
	return function(prefix){
		var rest = R.ex2(),
			restEx = R.ex();
		const {
			MODIFY_QUERY_PARAMS,
			SET_QUERY_PARAMS,
			SET_PARAMS_MIRROR,
			SET_ARTICLES,
			SET_ARTICLES_COUNT,
			MODIFY_ARTICLE,
			DELETE_ARTICLE,
			TOGGLE_LOADING,
			setDependUuid
		} = Actions(prefix);

		function setQueryParams(queryParams){
			return {
				type: SET_QUERY_PARAMS,
				queryParams
			}
		}

		function setArticles(data){
			return {
				type: SET_ARTICLES,
				data
			}
		}

		function fetchData(params, isAll = true){
			return function(dispatch, getState){
				if(params !=  undefined)
					var update = true;
				params = params || getState()[prefix]['queryParams'];
				dispatch(load(true));
				var q = [];
				if(isAll)
					q.push(_fetchCount(params, dispatch));
				q.push(_fetchList(params, dispatch))
				$.when.apply(null, q).always(() => {
					dispatch(load(false))
				})
				if(update){
					dispatch(setQueryParams(params));
				}
			}
		}

		function _fetchList(params, dispatch){
			return rest.article.data.read('audit', params).done(data => {
				if(data.result){
					dispatch(setArticles(data.data));
				}
			})
		}

		function _fetchCount(params, dispatch){
			return rest.article.data.read('audit', $.extend({}, params, {count: true})).done(data => {
				if(data.result)
					dispatch({
						type: SET_ARTICLES_COUNT,
						count: data.count,
						uniqCount: data.uniq_count
					})
			})
		}

		function deleteArticle(uuid){
			return {
				type: DELETE_ARTICLE,
				uuid
			}
		}

		function load(b){
			return {
				type: TOGGLE_LOADING,
				show: b
			}
		}

		function modifyEmotion(uuid, emotion){
			return function(dispatch, getState){
				var state = getState()[prefix],
					art = state['articles'][uuid],
					emot = emotion;
				emotion = 'manual_' + emotion;
				if(art['emotion'] != emotion){
					dispatch(toggleLoading(true));
					restEx.articles.update('emotion', {
						uuids: [uuid],
						emotion: emot,
						title_sign: art.title_sign
					}).done(data => {
						dispatch(toggleLoading(false));
						if(data.result == true){
							if(state.queryParams.audit == 'false'){
								dispatch(deleteArticle(uuid));
								if(Object.keys(state['articles']).length <= 1){
									dispatch(fetchData());
								}
							}
							else{
								dispatch({
									type: MODIFY_ARTICLE,
									uuid,
									key: 'emotion',
									value: emotion
								})
							}
						}
					})
				}
			}
		}

		function putDepend(){
			return function(dispatch, getState){
				var uuid = getState()[prefix]['dependUuid'],
					arts = getState()[prefix]['articles'];
				if(uuid){
					dispatch(toggleLoading(true));
					restEx.articles.update('depend', {
						uuids: [uuid]
					}).done(data => {
						dispatch(toggleLoading(false));
						if(data.result){
							dispatch({
								type: DELETE_ARTICLE,
								uuid
							})
							if(Object.keys(arts).length == 1){
								setTimeout(() => {
									dispatch(fetchData(undefined, false));
								}, 1000)
							}
						}
					})
				}
			}
		}

		function toggleLoading(show){
			return {
				type: TOGGLE_LOADING,
				show
			}
		}

		return {fetchData, modifyEmotion, setQueryParams, setDependUuid, putDepend}
	}
})