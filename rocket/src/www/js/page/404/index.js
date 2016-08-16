define(['mods'], function(mods){
	const React = mods.ReactPack.default;

	const NotFound = React.createClass({
		render: function(){
			return (
				<div className="err404">
					<div className="inner">
						<span className="t1">您访问的页面不存在</span>
						<span className="t2">温馨提醒：亲，您可能人品太差，补救方式请联系管理员！</span>
						<span className="t3">rdev@puzhizhuhai.com</span>
					</div>
				</div>
			)
		}
	})

	return NotFound;
})