define(function(require){
	return {
		getRules: function(){
			return [
				{
					name: 'top',
					title: '顶级',
					link: "",
					parent: "",
				},
				{
					name: 'group',
					title: '组',
					link: "http://advices.puzhizhuhai.com/title_x_name",
					parent: "top",
				},
				{
					name: 'media_analysis',
					title: '子级',
					link: "http://advices.puzhizhuhai.com/title_x_name",
					parent: "group",
				},
				{
					name: 'personel_management',
					title: '子级2',
					link: "",
					parent: "group",
				},
				{
					name: '0.0.1',
					title: '规则名',
					link: "",
					parent: "0.0",
				},
				{
					name: '0.1.0',
					title: '规则名',
					link: "",
					parent: "0.1"
				},
				{
					name: '1',
					title: '规则名',
					link: "",
					parent: "",
				}
			]
		},
		getUser: function(){
			return {
				'name': "nick",
	            'role': ["super-admin","admin"],
	            'rule': ["media_analysis", "personel_management"],
	            'company': "小米股份有限公司",
	            'syndicate': {
	                'name': "小米集团",
	                'media_solution': {
	                    'type': "media_all",
	                    'count': 20
	                }
	            }
			}
		}
	}
})