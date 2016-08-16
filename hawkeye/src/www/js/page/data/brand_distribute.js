/**
 * 数据新闻 - 品牌分布图（矩形树图）
 */

define([ 

	'mods', 
	paths.rcn.util + '/rest.js',
	'./brand.js'

], function(mods, r, Brand){

	var rest = r.index({
		stringifyData: false
	});

	var rest2 = r.brand({
		// stringifyData: false
	});

	var React = mods.ReactPack.default
	var ReactDOM = mods.ReactDom.default;

	var Brand_distribute = React.createClass({
		getInitialState: function(){
			return {
				
			}
		},
		componentDidMount:function(){
			
		},
		render: function(){
			return (
				<Brand />
			)
		}
	})

	return Brand_distribute
})