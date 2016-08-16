前端开发项目详解

一、目录详情
	css:
		- base
			公用基本样式
		- page
			各个页面的样式
		- mixins
			scss函数

		style.scss
		
	js:
		- lib
			存放jq等共用库
		- plu
			存放插件
		- comps
			项目组件
		- page
			改项目下的各页面js
			- advices
				舆情中心
				- manager
					- tag	标签管理
					- manager	人员管理
					- viewer	人员管理
					- compnay	公司管理
					- media		媒体管理
				- base
					- audit		人工审计
					- event		事件处理
					- warn		预警收藏
					- report	报表生成
			- situation
				行情中心
			- subject
				话题中心
			- news
				新闻中心
			- wiki
				知识中心
			- setting
				设置
				- personal	个人中心
				- version	版本信息
		- util
			工具js

二、常用缩写
txt - text
tit - title
nav - navigation
info - information
inf - interface
mod - module
btn - button
eg - exempli gratia 例如
cont - content
dd - dropdown

三、组件
modal - 弹窗
btn - 按钮
dropdown - 下拉菜单

四、公用样式框架
w1200类代表1160px
居中布局：fr-mid
上+中间布局：fr-top/fr-topline/fr-main