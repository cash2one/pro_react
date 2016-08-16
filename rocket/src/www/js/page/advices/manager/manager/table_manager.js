define(['mods'], function(mods){
	var React = require('mods').ReactPack.default;

	var Table = React.createClass({

		render: function(){
			return (
				<table className={this.props.search_result_none ? "none" : "table table-striped spec"}>
					<thead>
						<th className="tc">序号</th>
						<th>手机号码</th>
						<th>姓名</th>
						<th>人员角色</th>
						<th>运营公司</th>
						<th>操作</th>
					</thead>
					<tbody>
						{	
							this.props.mdata.map((index, elem) => {
								var userid = index.user_id;
								var tindex = index;
								var role_len = parseInt(index.roles.length - 1);
								return (
									<tr>
										<td className="tc">{elem+1}</td>
										<td>{index.telephone}</td>
										<td>{index.user_name}</td>
										<td>
											{
												index.roles.map(function(index, elem) {
													if(elem === role_len){
														return (
															<span>{index.title}</span>
														);
													}else{
														return (
															<span>{index.title}<i>&nbsp;|&nbsp;</i></span>
														);
													}
												})
											}
										</td>
										<td>{index.company}</td>
										<td>
											<span className="iconfont icon-pencil" onClick={(e) => {this.props.edit(e,tindex)}}></span>
											<span className="iconfont icon-lajitong ml30" onClick={(e) => {this.props.delete(e,userid)}}></span>
										</td>
									</tr>
								)
							})
						}
					</tbody>
				</table>
			)
		}
	})

	return Table
})