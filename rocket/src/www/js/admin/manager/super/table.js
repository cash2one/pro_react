define(['mods'], function(mods){
	var React = require('mods').ReactPack.default;

	var Table = React.createClass({

		render: function(){
			return (
				<table className="c-table">
					<colgroup width="15%"></colgroup>
					<colgroup width="15%"></colgroup>
					<colgroup width="15%"></colgroup>
					<colgroup width="15%"></colgroup>
					<colgroup width="15%"></colgroup>
					<colgroup width="20%"></colgroup>
					<thead>
						<th>序号</th>
						<th>手机号码</th>
						<th>姓名</th>
						<th>运营集团</th>
						<th>操作</th>
					</thead>
					<tbody className={this.props.search_result_none && "none"}>
						{	
							this.props.mdata.map((index, elem) => {
								var userid = index.user_id;
								var tindex = index;
								return (
									<tr>
										<td>{elem+1}</td>
										<td>{index.telephone}</td>
										<td>{index.user_name}</td>
										<td>{index.syndicate_name}</td>
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