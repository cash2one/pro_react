define(function(){

	var map = {
		'rule_gm_manager_company': {
			name: 'rule_gm_manager_company',
			link: '/manager#/company',
			navType: function(u){
				return u.role_group == 'role_super_manager' ? 'company2' : 'company'
			},
			breadType: 'company'
		},
		'rule_ac_manager_manager_v2': {
			name: 'rule_ac_manager_manager_v2',
			link: '/manager#/allmgr',
			navType: function(u){
				return u.role_group == 'role_super_manager' ? 'company2' : 'company'
			},
			breadType: 'company'
		},
		'rule_global_manager': {
			name: 'rule_global_manager',
			breadType: 'company'
		},
		'rule_ng_authority': {
			navType: 'bigdata'
		},
		'rule_ng_industry': {
			navType: 'bigdata'
		},
		'rule_ng_index': {
			navType: 'bigdata'
		},
		'rule_ng_sales': {
			navType: 'bigdata'
		},
		'rule_analy_event_vein': {
			navType: 'sub'
		},
		'rule_analy_event_hot': {
			navType: 'sub'
		},
		'rule_analy_event_spread': {
			navType: 'sub'
		},
		'rule_analy_event_media': {
			navType: 'sub'
		},
		'diy_company_welcome': {
			name: 'diy_company_welcome',
			link: '/manager#/companyWelcome',
			title: '公司首页'
		},
		'diy_event_detail': {
			name: 'diy_event_detail',
			link: '/base#/event/detail',
			title: '事件详情',
			parent: 'rule_ac_event_operator'
		},
		'diy_report_edit': {
			name: 'diy_report_edit',
			link: '/base#/report/edit',
			title: '报表编辑',
			parent: 'rule_ac_report_build'
		},
		'diy_report_view': {
			name: 'diy_report_view',
			link: '/base#/report/view',
			title: '报表预览',
			parent: 'rule_ac_report_build'
		},
		'diy_article_detail': {
			name: 'diy_article_detail',
			link: '/base#/article',
			title: '文章详情',
			parent: 'rule_advices_center'
		},
		'diy_sc_index_info': {
			name: 'diy_sc_index_info',
			link: '/index-base#/info/setting',
			title: '搜索指数',
			parent: 'rule_sc_base_group'
		},
		'diy_setting_personal': {
			name: 'diy_setting_personal',
			link: '/setting/personal',
			title: '个人设置',
			parent: ''
		},
		'diy_brand_detail': {
			name: 'diy_brand_detail',
			link: '/big-data#/brand/distribute',
			title: '分布详情',
			parent: 'rule_dn_brand_list'
		},
		'diy_brand_int': {
			name: 'diy_brand_int',
			link: '/big-data#/brand/interest',
			title: '兴趣图谱',
			parent: 'rule_dn_brand_list'
		}
	}

	var v2path = '/manager#/allmgr|manager#/company|manager#/manager|manager#/viewer|setting/personal|analy#/profile|analy#/media|analy#/event|manager-tag#/tag|manager-mid#/media|base#/event|base#/warn|base#/news/audit|base#/report|base#/article|index-base#/info|/big-data#/brand';

	function bread(path){
		var res = [], cur = map[path];
		while(cur){
			res.unshift(cur);
			cur = map[cur['parent']]
		}

		return res;
	}

	function getBread(path){
		var dir = [], res;
		path = window.location.pathname + (path ? '#' + path : '');

		return bread(path);
	}

	function getCur(rloc){
		var wloc = window.location,
			curUrl = wloc.pathname;
		if(rloc)
			curUrl = curUrl + '#' + rloc.pathname;
		return curUrl;
	}

	function v2(path){
		var res = false, paths = v2path.split('|'), href = window.location.href;
		paths.forEach(p => {
			if(href.indexOf(p) != -1)
				res = true;
		})
		return res;
	}

	return {getBread, getCur, map, v2}
})