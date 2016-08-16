define(['mods'], function(mods){
	const React = mods.ReactPack.default;

	const Blank = React.createClass({
		render: function(){
			return (
				<div className="blank-page"></div>
			)
		}
	})

	return Blank;
})