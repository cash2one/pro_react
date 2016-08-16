/**
 * 大数据 - 行业报告
 */

define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	'./comp.js'

], function(mods, r, Comp){

	var rest = r.bigdata({
		// stringifyData: false
	});

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var dataIndex = React.createClass({
		getInitialState: function(){
			return {
				
			}
		},
		componentDidMount:function(){
			
		},
		render: function(){
			return (
				<Comp />
			)
		}
	})

	return dataIndex
})